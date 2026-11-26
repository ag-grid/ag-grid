// Runs the scenario matrix in headless Chromium and writes results/results.json + results/results.md.
//   node run-bench.mjs                 every scenario
//   node run-bench.mjs --only S1,S4    a subset, merged into the existing results.json (each scenario keeps its own provenance)
//   node run-bench.mjs --report-only   regenerate the tables from results.json
// Options: --warmup <s> (default 3), --measure <s> (default 10), --chrome <path>.
import { execSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import os from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { REQUIREMENTS, SCENARIOS, evaluate } from './scenarios.mjs';
import { startServer } from './serve.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const resultsFile = join(here, 'results/results.json');
const BANNER =
    '> **Indicative only.** Measured in headless Chromium on a shared CI/sandbox runner (software rendering, no real display). A frame-rate pass means the main thread kept up, not that a physical screen met the target. Re-run on the target hardware before quoting a number.';
const SCENARIO_TIMEOUT_MS = 120_000;

const args = process.argv.slice(2);
const arg = (name, fallback) => {
    const i = args.indexOf(`--${name}`);
    return i >= 0 ? args[i + 1] : fallback;
};

const previous = existsSync(resultsFile) ? JSON.parse(readFileSync(resultsFile, 'utf8')) : { scenarios: {} };

if (args.includes('--report-only')) {
    previous.gridVersion ??= gridVersion();
    writeReports(previous);
    process.exit(0);
}

const only = arg('only')?.split(',');
const warmupMs = Number(arg('warmup', 3)) * 1000;
const measureMs = Number(arg('measure', 10)) * 1000;

const { chromium } = createRequire(import.meta.url)('playwright');
const browser = await launch();
const server = await startServer(0);
const base = `http://localhost:${server.address().port}/`;

const run = {
    ...previous,
    machine: machineSpec(browser),
    startedAt: new Date().toISOString(),
    gitSha: git('rev-parse HEAD'),
    gridVersion: gridVersion(),
    warmupS: warmupMs / 1000,
    measureS: measureMs / 1000,
    scenarios: only ? previous.scenarios : {},
};
const provenance = (scenario) => ({
    gitSha: run.gitSha,
    gridVersion: run.gridVersion,
    machine: run.machine,
    warmupS: run.warmupS,
    measureS: scenario.measureS ?? run.measureS,
});

try {
    for (const scenario of SCENARIOS.filter((s) => !only || only.includes(s.id))) {
        const runs = [];
        for (let i = 0; i < (scenario.repeat ?? 1); i++) {
            console.log(`${scenario.id} run ${i + 1}: ${scenario.title}`);
            runs.push(await runScenario(scenario));
        }
        run.scenarios[scenario.id] = {
            ...runs[0],
            title: scenario.title,
            query: scenario.query,
            measuredAt: new Date().toISOString(),
            provenance: provenance(scenario),
            repeats: runs.slice(1),
        };
        run.finishedAt = new Date().toISOString();
        writeReports(run);
    }
    await uiSmoke(run);
    writeReports(run);
} finally {
    await browser.close();
    server.close();
}

async function launch() {
    const explicit = arg('chrome');
    const candidates = explicit ? [explicit] : [undefined, '/usr/bin/google-chrome', '/usr/bin/chromium'];
    for (const executablePath of candidates) {
        try {
            return await chromium.launch({ headless: true, executablePath });
        } catch (e) {
            console.warn(`launch failed for ${executablePath ?? 'Playwright Chromium'}: ${e.message.split('\n')[0]}`);
        }
    }
    throw new Error('No Chromium could be launched; nothing was measured.');
}

async function runScenario(scenario) {
    const page = await browser.newPage({ viewport: { width: 3840, height: 2160 } });
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => {
        if (m.type() === 'error' && !m.text().startsWith('*')) {
            errors.push(m.text());
        }
    });
    const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`timed out after ${SCENARIO_TIMEOUT_MS / 1000} s`)), SCENARIO_TIMEOUT_MS)
    );
    try {
        return await Promise.race([measure(page, scenario, errors), timeout]);
    } catch (e) {
        return { error: `unmeasured: ${e.message.split('\n')[0]}`, consoleErrors: errors };
    } finally {
        await page.close();
    }
}

async function measure(page, scenario, errors) {
    await page.goto(`${base}?${scenario.query}`);
    await page.waitForFunction(() => window.__bench, null, { timeout: 30_000 });
    await page.evaluate(() => window.__bench.ready);
    const config = await page.evaluate(() => window.__bench.config());
    const result = { config, version: await page.evaluate(() => window.__bench.version) };

    if (scenario.action === 'serverOps') {
        await page.waitForTimeout(warmupMs);
        result.action = await page.evaluate(() => window.__bench.serverOpsTest());
        result.requests = await page.evaluate(() => window.__bench.requests().length);
    } else if (scenario.action === 'scroll') {
        await page.waitForTimeout(1000);
        result.action = [];
        for (const fraction of [0, 0.5, 1]) {
            const index = Math.max(0, Math.floor(config.total * fraction) - (fraction === 1 ? 60 : 0));
            result.action.push(await page.evaluate((i) => window.__bench.scrollCheck(i), index));
        }
    } else {
        if (scenario.action === 'expandGroups') {
            result.groupsLoaded = await page.evaluate(() => window.__bench.expandGroups(3));
        }
        if (scenario.order) {
            result.order = await page.evaluate(
                ({ sort, filter }) => window.__bench.applyOrder(sort, filter),
                scenario.order
            );
        }
        await page.waitForTimeout(warmupMs);
        if (scenario.action === 'selection') {
            await page.evaluate(() => window.__bench.selectRows(5, 9));
            await page.evaluate(() => window.__bench.reset());
            await page.evaluate(() => window.__bench.pause());
            await page.waitForTimeout(3000);
            const resume = await page.evaluate(() => window.__bench.resume()[0]);
            await page.waitForTimeout(1000);
            result.action = { ...(await page.evaluate(() => window.__bench.checkSelection())), resume };
            result.action.restored = await page.evaluate(() => window.__bench.restoreRange());
        } else {
            await page.evaluate(() => window.__bench.reset());
            await page.waitForTimeout(scenario.measureS ? scenario.measureS * 1000 : measureMs);
        }
        result.snapshot = await page.evaluate(() => window.__bench.snapshot());
        result.bytesPerRow = await page.evaluate(() => window.__bench.bytesPerRow()[0]);
        if (scenario.action === 'hscroll') {
            result.hscroll = await page.evaluate(() => window.__bench.horizontalScrollCheck());
        }
        if (config.grids > 1) {
            const [first, ...rest] = result.snapshot.grids;
            result.snapshot.grids = [
                first,
                ...rest.map(({ contentRefreshPerS, subscribedRows, onScreen }) => ({
                    contentRefreshPerS,
                    subscribedRows,
                    onScreen,
                })),
            ];
        }
    }
    result.consoleErrors = errors;
    return result;
}

/** Changes each control once through the form and checks the reloaded page picked it up. */
async function uiSmoke(target) {
    const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
    try {
        await page.goto(`${base}?feed=0`);
        await page.waitForFunction(() => window.__bench);
        const changes = {
            insertMs: '150',
            rate: '7',
            cols: '60',
            wait: '30',
            block: '200',
            maxBlocks: '4',
            grids: '4',
            live: '2',
            gridHeight: '300',
            changed: '3',
            latency: '40',
            total: '20000',
            rowHeight: '20',
            subDebounce: '20',
        };
        for (const [k, val] of Object.entries(changes)) {
            await page.fill(`#ctl-${k}`, val);
        }
        for (const k of ['sync', 'group', 'trim', 'animate']) {
            await page.check(`#ctl-${k}`);
        }
        await Promise.all([page.waitForNavigation(), page.click('#controls button[type=submit]')]);
        await page.waitForFunction(() => window.__bench);
        const cfg = await page.evaluate(() => window.__bench.config());
        const mismatched = Object.entries(changes)
            .filter(([k, val]) => cfg[k] !== Number(val))
            .map(([k]) => k)
            .concat(['sync', 'group', 'trim', 'animate'].filter((k) => cfg[k] !== true));
        target.uiSmoke = { controlsChanged: Object.keys(changes).length + 4, mismatched };
    } catch (e) {
        target.uiSmoke = { error: e.message.split('\n')[0] };
    } finally {
        await page.close();
    }
}

function machineSpec(b) {
    const cpus = os.cpus();
    return {
        cpu: cpus[0]?.model,
        cores: cpus.length,
        memoryGb: Math.round(os.totalmem() / 2 ** 30),
        os: `${os.type()} ${os.release()}`,
        node: process.version,
        browser: `${b.browserType().name()} ${b.version()}`,
        headless: true,
        viewport: '3840x2160',
        ci: !!process.env.CI,
    };
}

function gridVersion() {
    const file = join(here, '../../../packages/ag-grid-enterprise/dist/package.json');
    return existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')).version : null;
}

function git(cmd) {
    try {
        return execSync(`git ${cmd}`, { cwd: here }).toString().trim();
    } catch {
        return null;
    }
}

function writeReports(data) {
    data.verdicts = evaluate(data.scenarios);
    writeFileSync(resultsFile, JSON.stringify(data, null, 2) + '\n');
    const table = verdictTable(data);
    const scenarioRows = SCENARIOS.map(({ id, title }) => {
        const r = data.scenarios[id];
        if (!r) {
            return `| ${id} | ${title} | unmeasured: not run | | | |`;
        }
        if (r.error) {
            return `| ${id} | ${title} | ${r.error} | | | |`;
        }
        const g = r.snapshot?.grids?.[0];
        const spread = r.repeats?.length
            ? ` (repeat: ${r.repeats.map((x) => x.snapshot?.fps ?? x.error).join(', ')})`
            : '';
        return `| ${id} | ${title} | ${r.snapshot?.fps ?? '-'}${spread} | ${r.snapshot?.frameMs?.max ?? '-'} | ${g?.contentRefreshPerS ?? '-'} | ${g?.insertsAppliedPerS ?? '-'} |`;
    });
    const md = [
        '# SSRM streaming benchmark: results',
        '',
        BANNER,
        '',
        `Last run ${data.startedAt} to ${data.finishedAt ?? '-'}; ${data.measureS} s measured per scenario (S5: 40 s), each scenario's time in results.json (measuredAt).`,
        ...provenanceLines(data),
        '',
        '## Per requirement',
        '',
        table,
        '',
        '## Per scenario',
        '',
        '| Scenario | What | fps | Max frame (ms) | Content refresh/s (grid 1) | Inserts applied/s (grid 1) |',
        '|---|---|---|---|---|---|',
        ...scenarioRows,
        '',
        `UI smoke: ${JSON.stringify(data.uiSmoke ?? 'not run')}`,
        '',
        'Raw numbers for every scenario are in `results.json`.',
        '',
    ].join('\n');
    writeFileSync(join(here, 'results/results.md'), md);

    const reportFile = join(here, 'REPORT.md');
    if (existsSync(reportFile)) {
        const report = readFileSync(reportFile, 'utf8');
        const begin = '<!-- RESULTS-TABLE:BEGIN -->';
        const end = '<!-- RESULTS-TABLE:END -->';
        if (report.includes(begin) && report.includes(end)) {
            const head = report.slice(0, report.indexOf(begin) + begin.length);
            const tail = report.slice(report.indexOf(end));
            writeFileSync(
                reportFile,
                `${head}\n\n_Generated from results/results.json (run ${data.startedAt}; per-scenario provenance in results/results.md)._\n\n${table}\n\n${tail}`
            );
        }
    }
}

/** One line when every scenario was measured in the same environment; otherwise a line per environment, naming its scenarios. */
function provenanceLines(data) {
    const describe = (p) =>
        `git ${p.gitSha}, AG Grid ${p.gridVersion ?? '-'}, ${p.machine.cpu} x ${p.machine.cores}, ${p.machine.memoryGb} GB, ${p.machine.os}, Node ${p.machine.node}, ${p.machine.browser} (headless), viewport ${p.machine.viewport}, ${p.warmupS} s warm-up`;
    const groups = new Map();
    for (const [id, r] of Object.entries(data.scenarios)) {
        const key = r.provenance
            ? describe(r.provenance)
            : 'unknown (measured before provenance was recorded per scenario)';
        groups.set(key, [...(groups.get(key) ?? []), id]);
    }
    if (groups.size <= 1) {
        return [`Measured with ${[...groups.keys()][0] ?? '-'}.`];
    }
    return [
        '**Scenarios were measured in different environments:**',
        '',
        ...[...groups].map(([key, ids]) => `- ${ids.join(', ')}: ${key}`),
    ];
}

function verdictTable(data) {
    return [
        '| ID | Requirement | Verdict | Measured | Threshold (fixed before measuring) | Scenarios |',
        '|---|---|---|---|---|---|',
        ...REQUIREMENTS.map(({ id, text, threshold }) => {
            const r = data.verdicts[id];
            return `| ${id} | ${text} | **${r.verdict}** | ${r.number.replaceAll('|', '\\|')} | ${threshold} | ${r.scenarios.join(', ')} |`;
        }),
    ].join('\n');
}
