// Normalise the CTRF reports produced by the documentation example tests before they are
// fed to the GitHub test reporter.
//
// The playwright-ctrf-json-reporter records each test's `name` as the innermost test title,
// which for the example tests is just the framework (e.g. "angular", "reactFunctionalTs").
// The information that actually identifies the failure - the doc page, the example and the
// browser - is buried in the `suite` string, and `filePath` points at the shared
// test-utils.ts helper rather than the example spec. That makes the combined report a wall of
// identically-named rows with no indication of which page/example broke.
//
// This script rewrites each test so that:
//   - `name` reads "<page>/<example> › <test title> · <framework>/<browser>"
//   - `filePath` points at the example spec, so the reporter can group failures by example.
//
// Reports whose suites don't match the example pattern (e.g. the public testing recipes) are
// left untouched.
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const BROWSERS = new Set(['chromium', 'firefox', 'webkit', 'page-verification']);

const rootDir = process.argv[2];
if (!rootDir) {
    // eslint-disable-next-line no-console
    console.error('Usage: node normalise-ctrf-reports.mjs <reports-dir>');
    process.exit(1);
}

const reportFiles = collectJsonFiles(rootDir);
let normalisedTests = 0;
let normalisedFiles = 0;

for (let i = 0, len = reportFiles.length; i < len; ++i) {
    const file = reportFiles[i];
    const framework = frameworkFromFileName(file);
    let report;
    try {
        report = JSON.parse(readFileSync(file, 'utf8'));
    } catch {
        continue;
    }

    const tests = report?.results?.tests;
    if (!Array.isArray(tests)) {
        continue;
    }

    let changed = false;
    for (let t = 0, tLen = tests.length; t < tLen; ++t) {
        if (normaliseTest(tests[t], framework)) {
            changed = true;
            normalisedTests++;
        }
    }

    if (changed) {
        writeFileSync(file, JSON.stringify(report), 'utf8');
        normalisedFiles++;
    }
}

// eslint-disable-next-line no-console
console.log(`Normalised ${normalisedTests} test(s) across ${normalisedFiles} report file(s).`);

function normaliseTest(test, framework) {
    const parsed = parseSuite(test?.suite);
    if (!parsed) {
        return false;
    }

    const { browser, specPath, exampleId, title } = parsed;
    const context = [framework, browser].filter(Boolean).join('/');
    test.name = context ? `${exampleId} › ${title} · ${context}` : `${exampleId} › ${title}`;
    test.filePath = specPath;
    return true;
}

// Suites look like:
//   "chromium > page/_examples/example/example.spec.ts > page/example > The test title"
// Returns the browser, the example spec path, a "page/example" id and the test title.
function parseSuite(suite) {
    if (typeof suite !== 'string') {
        return null;
    }

    const parts = suite.split(' > ').map((part) => part.trim());
    if (parts.length < 2) {
        return null;
    }

    const browser = BROWSERS.has(parts[0]) ? parts[0] : undefined;
    const specIndex = parts.findIndex((part) => part.endsWith('.spec.ts'));
    if (specIndex === -1) {
        return null;
    }

    const specPath = parts[specIndex];
    // Only the example specs suffer from the unhelpful `name` field (it records the framework
    // rather than the test title). Other suites - e.g. the public testing recipes - already have
    // meaningful names and a correct filePath, so leave them untouched.
    if (!specPath.includes('/_examples/')) {
        return null;
    }

    // Everything after the spec path is "<describe> > <test title>". The describe title on the
    // example specs mirrors the example id, so keep only the innermost test title.
    const title = parts.length > specIndex + 1 ? parts[parts.length - 1] : specPath;
    const exampleId = specPath
        .replace('/_examples/', '/')
        .replace(/\/example\.spec\.ts$/, '')
        .replace(/\.spec\.ts$/, '');

    return { browser, specPath, exampleId, title };
}

function frameworkFromFileName(file) {
    const match = /interactive-([^./]+)\.json$/.exec(file);
    return match ? match[1] : undefined;
}

function collectJsonFiles(dir) {
    const results = [];
    const entries = readdirSync(dir);
    for (let i = 0, len = entries.length; i < len; ++i) {
        const fullPath = join(dir, entries[i]);
        if (statSync(fullPath).isDirectory()) {
            results.push(...collectJsonFiles(fullPath));
        } else if (fullPath.endsWith('.json')) {
            results.push(fullPath);
        }
    }
    return results;
}
