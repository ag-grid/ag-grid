/**
 * Runs the real `watch.js` against a fake `nx` on PATH, to pin down the background lane:
 * pre-emption and re-queue, cancelled vs failed history, no orphaned child, and unchanged
 * behaviour for a config with no `backgroundTargets`.
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);
const WATCH_JS = path.join(path.dirname(fileURLToPath(import.meta.url)), 'watch.js');
const { PREEMPT_EXIT_TIMEOUT_MS } = require('./constants');
const chartsConfig = require('./chartsWatch.config');

// Stands in for nx. `nx watch` echoes a project name per line appended to `events`; any other
// invocation logs to `runs.log` (with a timestamp), forks a grandchild (an executor), and works for FAKE_TYPES_MS
// when it builds types or FAKE_FAST_MS otherwise. Like nx, SIGTERM makes it exit 143 and leaves
// the grandchild running, so only a signal to the whole process group stops that.
const FAKE_NX = `#!${process.execPath}
const fs = require('fs');
const { spawn } = require('child_process');
const dir = process.env.FAKE_NX_DIR;
const args = process.argv.slice(2);
const log = (entry) => fs.appendFileSync(dir + '/runs.log', JSON.stringify({ ...entry, pid: process.pid, t: Date.now() }) + '\\n');

if (args.includes('--all')) {
    log({ event: 'watch' });
    const parent = process.ppid;
    let seen = 0;
    setInterval(() => {
        if (process.ppid !== parent) process.exit(0);
        const file = dir + '/events';
        const lines = fs.existsSync(file) ? fs.readFileSync(file, 'utf8').split('\\n').filter(Boolean) : [];
        for (; seen < lines.length; seen++) console.log(lines[seen]);
    }, 20);
} else {
    const joined = args.join(' ');
    const types = joined.includes('build:types');
    const executor = spawn(process.execPath, ['-e', 'setTimeout(() => {}, 60000)'], { stdio: 'ignore' });
    log({ event: 'start', args: joined, types, executor: executor.pid });
    if (process.env.FAKE_IGNORE_TERM === '1') {
        process.on('SIGTERM', () => log({ event: 'sigterm-ignored' }));
    } else {
        process.on('SIGTERM', () => {
            log({ event: 'sigterm' });
            process.exit(143);
        });
    }
    setTimeout(
        () => {
            executor.kill();
            const code = types && process.env.FAKE_FAIL_TYPES === '1' ? 1 : 0;
            log({ event: 'end', types, code });
            process.exit(code);
        },
        Number(types ? process.env.FAKE_TYPES_MS : process.env.FAKE_FAST_MS)
    );
}
`;

const POLL_MS = 25;
const WAIT_MS = 20_000;
const STOP_TIMEOUT_MS = 5_000;

function isAlive(pid) {
    try {
        process.kill(pid, 0);
        return true;
    } catch {
        return false;
    }
}

let sandboxes = [];

beforeEach(() => {
    sandboxes = [];
});

afterEach(async () => {
    for (const sandbox of sandboxes) {
        await sandbox.stop();
    }
});

async function until(description, predicate) {
    const deadline = Date.now() + WAIT_MS;
    while (Date.now() < deadline) {
        const value = predicate();
        if (value) return value;
        await new Promise((resolve) => setTimeout(resolve, POLL_MS));
    }
    throw new Error(`Timed out waiting for ${description}`);
}

/** Starts `watch.js <library>` in a scratch directory with the fake nx first on PATH. */
function startWatch(library, { typesMs = 1500, fastMs = 100, env = {} } = {}) {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ag-watch-test-'));
    fs.mkdirSync(path.join(dir, 'bin'));
    fs.writeFileSync(path.join(dir, 'bin', 'nx'), FAKE_NX, { mode: 0o755 });

    let output = '';
    const child = spawn(process.execPath, [WATCH_JS, library], {
        cwd: dir,
        env: {
            ...process.env,
            PATH: `${path.join(dir, 'bin')}${path.delimiter}${process.env.PATH}`,
            FAKE_NX_DIR: dir,
            FAKE_TYPES_MS: String(typesMs),
            FAKE_FAST_MS: String(fastMs),
            ...env,
        },
        stdio: ['ignore', 'pipe', 'pipe'],
    });
    child.stdout.on('data', (data) => (output += data));
    child.stderr.on('data', (data) => (output += data));

    const readLines = (file) =>
        fs.existsSync(path.join(dir, file))
            ? fs
                  .readFileSync(path.join(dir, file), 'utf8')
                  .split('\n')
                  .filter(Boolean)
            : [];

    // The reload signal is the mtime of the queue-empty file, so every distinct mtime is one reload.
    const reloadFile = path.join(dir, 'node_modules/.cache/ag-build-queue.empty');
    const reloadTimes = [];
    const reloadTimer = setInterval(() => {
        try {
            const { mtimeMs } = fs.statSync(reloadFile);
            if (reloadTimes.at(-1) !== mtimeMs) reloadTimes.push(mtimeMs);
        } catch {
            // Not written yet.
        }
    }, 5);

    const sandbox = {
        output: () => output,
        runs: () => readLines('runs.log').map((line) => JSON.parse(line)),
        status: () => {
            try {
                return JSON.parse(fs.readFileSync(path.join(dir, 'node_modules/.cache/ag-watch-status.json'), 'utf8'));
            } catch {
                return undefined;
            }
        },
        /** When each reload signal fired, as ms since the epoch (comparable with `runs()[].t`). */
        reloads: () => [...reloadTimes],
        save(project) {
            fs.appendFileSync(path.join(dir, 'events'), `${project}\n`);
        },
        async stop() {
            clearInterval(reloadTimer);
            // The watch writes its status file until it exits, so wait for that before removing the directory.
            const exited = new Promise((resolve) => child.once('exit', resolve));
            const killTimer = setTimeout(() => child.kill('SIGKILL'), STOP_TIMEOUT_MS);
            if (child.exitCode === null && child.signalCode === null) {
                child.kill('SIGTERM');
                await exited;
            }
            clearTimeout(killTimer);
            // Whatever the watch left behind must not outlive the test.
            for (const run of sandbox.runs()) {
                for (const pid of [run.pid, run.executor]) {
                    if (pid && isAlive(pid)) process.kill(pid, 'SIGKILL');
                }
            }
            fs.rmSync(dir, { recursive: true, force: true, maxRetries: 5, retryDelay: 50 });
        },
        async idle() {
            await until('the watch to go idle', () => sandbox.status()?.status === 'IDLE');
        },
    };
    sandboxes.push(sandbox);

    return until('nx watch to start', () => sandbox.runs().some((run) => run.event === 'watch')).then(() => sandbox);
}

const typesRuns = (sandbox) => sandbox.runs().filter((run) => run.event === 'start' && run.types);

/** Saves `project`, then returns the first `build:types` run once it has started. */
async function saveAndAwaitTypes(sandbox, project) {
    sandbox.save(project);
    const [first] = await until('build:types to start', () => {
        const runs = typesRuns(sandbox);
        return runs.length > 0 && runs;
    });
    return first;
}

describe('charts config', () => {
    it('keeps build:types in the background lane, apart from the reload targets', () => {
        expect(chartsConfig.backgroundTargets).toEqual(['build:types']);
        for (const target of chartsConfig.backgroundTargets) {
            expect(chartsConfig.devServerReloadTargets).not.toContain(target);
        }
    });

    it.each(['ag-charts-types', 'ag-charts-locale', 'ag-charts-core'])(
        'splits %s build into build:types and its foreground targets',
        (project) => {
            const tuples = chartsConfig.getProjectBuildTargets(project);
            const own = tuples.filter(([tupleProject]) => tupleProject === project);

            expect(tuples.flatMap(([, targets]) => targets)).not.toContain('build');
            expect(own.filter(([, targets]) => targets.includes('build:types'))).toEqual([
                [project, ['build:types'], 'watch'],
            ]);
        }
    );

    it('still queues the build:package and build:umd that build used to cover', () => {
        const queues = (changed, project, target) =>
            chartsConfig
                .getProjectBuildTargets(changed)
                .some(([tupleProject, targets]) => tupleProject === project && targets.includes(target));

        // Nothing else builds types' dist/package, and locale's dist/umd is served directly.
        expect(queues('ag-charts-types', 'ag-charts-types', 'build:package')).toBe(true);
        expect(queues('ag-charts-locale', 'ag-charts-locale', 'build:package')).toBe(true);
        expect(queues('ag-charts-locale', 'ag-charts-locale', 'build:umd')).toBe(true);
        // Community's build:package rebuilds core's dist/package as a dependency.
        expect(queues('ag-charts-core', 'ag-charts-community', 'build:package')).toBe(true);
    });

    it('leaves the default project tuple as a foreground build', () => {
        expect(chartsConfig.getProjectBuildTargets('ag-charts-something-else')).toEqual([
            ['ag-charts-something-else', ['build'], undefined],
        ]);
    });
});

describe('watch background lane', () => {
    it('pre-empts a running build:types for a save, then re-runs it without recording a failure', async () => {
        const watch = await startWatch('charts', { typesMs: 3000 });

        const first = await saveAndAwaitTypes(watch, 'ag-charts-community');

        watch.save('ag-charts-community');
        await until('the second save to reload', () => watch.reloads().length === 2);
        await watch.idle();

        const events = watch.runs();
        const firstEnd = events.findIndex((run) => run.event === 'end' && run.pid === first.pid);
        const sigterm = events.find((run) => run.event === 'sigterm');
        expect(sigterm.pid).toBe(first.pid);
        // Pre-empted, so it never ran to its end.
        expect(firstEnd).toBe(-1);

        // The save's reloadable batch starts straight after the kill, ahead of any types run.
        const afterKill = events.slice(events.indexOf(sigterm) + 1).filter((run) => run.event === 'start');
        expect(afterKill[0].types).toBe(false);
        const reloadableEnd = events.find(
            (run) => run.event === 'end' && run.pid === afterKill[0].pid
        );

        // Re-queued once, and that run completed with the original tuples.
        const runs = typesRuns(watch);
        expect(runs).toHaveLength(2);
        expect(runs[1].args).toBe(first.args);
        expect(events.some((run) => run.event === 'end' && run.pid === runs[1].pid && run.code === 0)).toBe(true);

        const status = watch.status();
        expect(status.recentBuilds.filter((build) => build.status === 'cancelled')).toHaveLength(1);
        expect(status.recentBuilds.some((build) => build.status === 'failed')).toBe(false);
        expect(status.targetHistory['build:types']).toMatchObject({
            lastStatus: 'completed',
            successCount: 1,
            failureCount: 0,
        });

        // The second save reloads once its own batch has ended, without waiting for the re-queued
        // build:types, and the types run itself never reloads.
        const reloads = watch.reloads();
        expect(reloads).toHaveLength(2);
        expect(reloads[1]).toBeGreaterThanOrEqual(sigterm.t);
        expect(reloads[1]).toBeGreaterThanOrEqual(reloadableEnd.t);
        const requeuedEnd = events.find((run) => run.event === 'end' && run.pid === runs[1].pid);
        expect(reloads[1]).toBeLessThan(requeuedEnd.t);
        expect(watch.output()).not.toContain('Build failed');
    });

    it('leaves no executor running after a pre-emption', async () => {
        const watch = await startWatch('charts', { typesMs: 3000 });

        const first = await saveAndAwaitTypes(watch, 'ag-charts-community');
        expect(isAlive(first.executor)).toBe(true);

        watch.save('ag-charts-community');
        await until('the executor to stop', () => !isAlive(first.executor));
        await until('the kill to land', () => watch.runs().some((run) => run.event === 'sigterm'));
    });

    it('reports a background build that fails by itself as failed, and does not re-run it', async () => {
        const watch = await startWatch('charts', { typesMs: 200, env: { FAKE_FAIL_TYPES: '1' } });

        watch.save('ag-charts-community');
        await until('build:types to fail', () => watch.status()?.targetHistory?.['build:types']?.failureCount > 0);
        await watch.idle();

        const status = watch.status();
        expect(status.recentBuilds[0]).toMatchObject({ target: 'build:types', status: 'failed' });
        expect(status.recentBuilds.some((build) => build.status === 'cancelled')).toBe(false);
        expect(status.targetHistory['build:types']).toMatchObject({ lastStatus: 'failed', failureCount: 1 });
        expect(typesRuns(watch)).toHaveLength(1);
    });

    it('waits for a build that ignores the kill, and warns', async () => {
        const typesMs = PREEMPT_EXIT_TIMEOUT_MS + 1500;
        const watch = await startWatch('charts', { typesMs, env: { FAKE_IGNORE_TERM: '1' } });

        const first = await saveAndAwaitTypes(watch, 'ag-charts-community');
        watch.save('ag-charts-community');
        await until('the exit warning', () => watch.output().includes('after pre-empt; waiting for it'));
        await watch.idle();

        const events = watch.runs();
        const firstEnd = events.findIndex((run) => run.event === 'end' && run.pid === first.pid);
        expect(firstEnd).toBeGreaterThan(-1);
        expect(events.some((run) => run.event === 'sigterm-ignored' && run.pid === first.pid)).toBe(true);

        // It ran to completion as today, so it is recorded as completed rather than cancelled.
        const status = watch.status();
        expect(status.recentBuilds.some((build) => build.status === 'cancelled')).toBe(false);
        expect(status.recentBuilds.some((build) => build.status === 'failed')).toBe(false);
    });
});

describe('watch without backgroundTargets (grid)', () => {
    it('does not pre-empt build:types, and a second save waits behind it', async () => {
        const watch = await startWatch('grid', { typesMs: 2500 });

        const first = await saveAndAwaitTypes(watch, 'ag-grid-community');
        watch.save('ag-grid-community');
        await watch.idle();

        const events = watch.runs();
        expect(events.some((run) => run.event === 'sigterm')).toBe(false);

        // A batch spawns its config groups together, so build:types starts beside the docs references,
        // and the order of their start entries is not fixed. A save's batch always opens with build:umd:watch,
        // so the first save's one is the only one that may start before the running build:types ends.
        const firstEnd = events.findIndex((run) => run.event === 'end' && run.pid === first.pid);
        expect(firstEnd).toBeGreaterThan(-1);
        const opensBatch = (run) => run.event === 'start' && run.args.includes('build:umd:watch');
        expect(events.slice(0, firstEnd).filter(opensBatch)).toHaveLength(1);

        // The second save's batch ran, but only after the running build:types had ended.
        const batchStarts = events.filter(opensBatch);
        expect(batchStarts).toHaveLength(2);
        expect(batchStarts[1].t).toBeGreaterThanOrEqual(events[firstEnd].t);

        // The second save only reloads after the running build:types has ended, as before.
        const reloads = watch.reloads();
        expect(reloads).toHaveLength(2);
        expect(reloads[1]).toBeGreaterThanOrEqual(events[firstEnd].t);

        const status = watch.status();
        expect(status.recentBuilds.some((build) => build.status === 'cancelled')).toBe(false);
        expect(Object.values(status.targetHistory).every((history) => history.failureCount === 0)).toBe(true);
    });
});
