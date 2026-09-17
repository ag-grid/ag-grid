#!/usr/bin/env node
/* eslint-disable no-console */
import { appendFileSync, existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Verifies a staged per-PR preview against its own `manifest.json`, and emits the import-map
 * entries the sticky PR comment offers.
 *
 * The manifest is the contract for what the preview carries, so completeness is checked against
 * it rather than against a hand-listed set of filenames — a new package in the manifest is
 * covered here the moment it appears. Format and the wider pin flow: ag-dev-prompts
 * docs/pr-plnkr-v2-plan.md.
 *
 * Usage: node scripts/ci/check-pr-preview.mjs <preview-dir>
 * Writes `imports` to $GITHUB_OUTPUT (stdout when unset). Exits non-zero on any missing path.
 */

const previewDir = process.argv[2];
if (!previewDir) {
    console.error('check-pr-preview: a preview directory is required.');
    process.exit(1);
}

const manifestPath = join(previewDir, 'manifest.json');
if (!existsSync(manifestPath)) {
    console.error(`check-pr-preview: ${manifestPath} is missing — the preview cannot be published without it.`);
    process.exit(1);
}

let manifest;
try {
    manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
} catch (error) {
    console.error(`check-pr-preview: ${manifestPath} is not valid JSON: ${error.message}`);
    process.exit(1);
}

if (manifest.version !== 1) {
    console.error(`check-pr-preview: unsupported manifest version ${manifest.version}; expected 1.`);
    process.exit(1);
}

/** A target ending in `/` is a directory prefix, and an empty directory publishes nothing. */
const carries = (target) => {
    const absolute = join(previewDir, target);
    if (!existsSync(absolute)) {
        return false;
    }
    if (!target.endsWith('/')) {
        return statSync(absolute).isFile();
    }
    return statSync(absolute).isDirectory() && readdirSync(absolute).length > 0;
};

const missing = [];
for (const [packageName, filename] of Object.entries(manifest.umd ?? {})) {
    if (!carries(filename)) {
        missing.push(`umd.${packageName} -> ${filename}`);
    }
}

const imports = {};
for (const [packageName, { paths }] of Object.entries(manifest.packages ?? {})) {
    for (const [relativePath, target] of Object.entries(paths ?? {})) {
        if (!carries(target)) {
            missing.push(`${packageName} ${relativePath} -> ${target}`);
        }
        // A path ending in `/` is a bare-specifier prefix (`ag-grid-community/styles/`);
        // anything else is the package's own entry point.
        const specifier = relativePath.endsWith('/') ? `${packageName}/${relativePath}` : packageName;
        imports[specifier] = manifest.base + target;
    }
}

if (missing.length > 0) {
    console.error(`check-pr-preview: the manifest names ${missing.length} path(s) the payload does not carry:`);
    for (const line of missing) {
        console.error(`  - ${line}`);
    }
    process.exit(1);
}

const sorted = Object.fromEntries(Object.entries(imports).sort(([a], [b]) => (a < b ? -1 : 1)));
const block = `imports<<__IMPORTS_EOF__\n${JSON.stringify(sorted, null, 2)}\n__IMPORTS_EOF__\n`;
if (process.env.GITHUB_OUTPUT) {
    appendFileSync(process.env.GITHUB_OUTPUT, block);
} else {
    process.stdout.write(block);
}

console.log(
    `check-pr-preview: ${Object.keys(manifest.packages ?? {}).length} package(s) and ` +
        `${Object.keys(manifest.umd ?? {}).length} UMD bundle(s) present.`
);
