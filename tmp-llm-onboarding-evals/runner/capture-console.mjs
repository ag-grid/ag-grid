// Deterministic console capture. Not an agent — a plain Playwright script.
//
// The "console is clean" check is the one carrying the most weight in this experiment,
// because it is what catches AG Grid deprecation warnings and missing-module errors.
// Asking an LLM to read a console panel is weaker evidence than subscribing to the
// events directly, and this is parallel-safe where a shared Chrome is not.
//
// The app under test is NOT modified: console messages and uncaught errors come from
// Playwright's own `console` and `pageerror` events.
//
// usage: node capture-console.mjs <url> <outDir> [settleMs]

import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const [url, outDir, settleMs = '4000'] = process.argv.slice(2);
if (!url || !outDir) {
    console.error('usage: node capture-console.mjs <url> <outDir> [settleMs]');
    process.exit(2);
}

mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

const entries = [];
page.on('console', (msg) => {
    entries.push({ kind: 'console', type: msg.type(), text: msg.text() });
});
page.on('pageerror', (err) => {
    entries.push({ kind: 'pageerror', type: 'error', text: err.message });
});
page.on('requestfailed', (req) => {
    entries.push({ kind: 'requestfailed', type: 'error', text: `${req.url()} ${req.failure()?.errorText ?? ''}` });
});

let loadError = null;
try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
} catch (e) {
    loadError = String(e.message ?? e);
}

// Let the grid finish mounting; AG Grid validation warnings are emitted during setup.
await page.waitForTimeout(Number(settleMs));

await page.screenshot({ path: join(outDir, 'load.png'), fullPage: false });

// Noise from the dev server and React itself, not from the app under test.
const IGNORE = [/\[vite\]/i, /Download the React DevTools/i];

// No licence key is supplied to any run, so the enterprise trial banner is expected on
// every enterprise criterion. It arrives as a dozen separate console.error lines of
// asterisks; bucketing it separately keeps it out of the error count, so "console clean"
// stays an unambiguous signal instead of something a verifier has to reason past.
const LICENCE = [
    /AG Grid Enterprise License/i,
    /License Key Not Found/i,
    /unlocked for trial/i,
    /trial license key/i,
    /^\**$/,
    /^\*[\s*]*$/,
];

const notNoise = entries.filter((e) => !IGNORE.some((re) => re.test(e.text)));
const licence = notNoise.filter((e) => LICENCE.some((re) => re.test(e.text.trim())));
const relevant = notNoise.filter((e) => !LICENCE.some((re) => re.test(e.text.trim())));

// AG Grid self-reports both deprecations and unregistered modules. Surfacing them
// separately means the headline signal does not depend on anyone reading a log.
const agGrid = relevant.filter((e) => /ag.?grid|AG Grid|error #\d+/i.test(e.text));
const errors = relevant.filter((e) => e.type === 'error');
const warnings = relevant.filter((e) => e.type === 'warning' || e.type === 'warn');

const summary = {
    url,
    loadError,
    counts: {
        total: entries.length,
        relevant: relevant.length,
        errors: errors.length,
        warnings: warnings.length,
        licenceLines: licence.length,
    },
    licenceBannerPresent: licence.length > 0,
    agGridMessages: agGrid.map((e) => e.text),
    errors: errors.map((e) => e.text),
    warnings: warnings.map((e) => e.text),
    all: entries,
};

writeFileSync(join(outDir, 'console.json'), JSON.stringify(summary, null, 2));
writeFileSync(
    join(outDir, 'console.txt'),
    entries.map((e) => `[${e.kind}/${e.type}] ${e.text}`).join('\n') + '\n'
);

await browser.close();

console.log(
    `errors=${errors.length} warnings=${warnings.length} agGridMessages=${agGrid.length} ` +
        `licenceBanner=${licence.length > 0 ? 'yes' : 'no'}`
);
if (loadError) console.log(`loadError=${loadError}`);
for (const t of summary.agGridMessages) console.log(`AG GRID: ${t}`);
