#!/usr/bin/env node
/**
 * Workspace dependency analyser.
 *
 * Scans all package.json files in the monorepo (excluding node_modules, dist,
 * and .git) and reports:
 *
 *   1. Version mismatches — packages required at different versions across the workspace.
 *   2. Hoistable dependencies — deps in child packages that could be lifted to root.
 *   3. Resolutions audit — entries in the root "resolutions" field.
 *
 * Usage:
 *   node scripts/analyze-deps.mjs
 */
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';

const ROOT = new URL('..', import.meta.url).pathname.replace(/\/$/, '');

const SKIP_DIRS = new Set(['node_modules', 'dist', '.git', '.nx', 'out-tsc', '.cache', '__diff_output__']);

/** Recursively find all package.json files. */
function findPackageJsons(dir, results = []) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
        if (!entry.isDirectory()) {
            if (entry.name === 'package.json') {
                results.push(join(dir, entry.name));
            }
            continue;
        }
        if (SKIP_DIRS.has(entry.name) || entry.name.startsWith('.')) {
            continue;
        }
        // Don't recurse into symlinked directories
        const full = join(dir, entry.name);
        try {
            if (statSync(full).isSymbolicLink?.() === true) {
                continue;
            }
        } catch {
            // ignore broken symlinks or permission errors
        }
        findPackageJsons(full, results);
    }
    return results;
}

/** Parse a package.json, returning null on failure. */
function readPkg(path) {
    try {
        return JSON.parse(readFileSync(path, 'utf-8'));
    } catch {
        return null;
    }
}

const pkgPaths = findPackageJsons(ROOT);
const packages = pkgPaths.map((p) => ({ path: relative(ROOT, p), pkg: readPkg(p) })).filter((e) => e.pkg);

/** Map<depName, Map<version, Set<pkgJsonRelPath>>> */
const depVersions = new Map();

for (const { path, pkg } of packages) {
    for (const field of ['dependencies', 'devDependencies', 'peerDependencies', 'resolutions']) {
        const deps = pkg[field];
        if (!deps || typeof deps !== 'object') {
            continue;
        }
        for (const [name, version] of Object.entries(deps)) {
            if (!depVersions.has(name)) {
                depVersions.set(name, new Map());
            }
            const vMap = depVersions.get(name);
            if (!vMap.has(version)) {
                vMap.set(version, new Set());
            }
            vMap.get(version).add(`${path} (${field})`);
        }
    }
}

const mismatches = [...depVersions.entries()]
    .filter(([, vMap]) => vMap.size > 1)
    .sort(([a], [b]) => a.localeCompare(b));

console.log('='.repeat(80));
console.log('  VERSION MISMATCHES — same package required at different versions');
console.log('='.repeat(80));
if (mismatches.length === 0) {
    console.log('\n  (none)\n');
} else {
    for (const [dep, vMap] of mismatches) {
        console.log(`\n  ${dep}`);
        for (const [version, locations] of [...vMap.entries()].sort()) {
            for (const loc of [...locations].sort()) {
                console.log(`    ${version.padEnd(20)} ${loc}`);
            }
        }
    }
    console.log(`\n  Total: ${mismatches.length} packages with version mismatches\n`);
}

const rootPkg = packages.find((p) => p.path === 'package.json')?.pkg;
const rootDeps = {
    ...rootPkg?.dependencies,
    ...rootPkg?.devDependencies,
};

const childPackages = packages.filter((p) => p.path !== 'package.json');
const hoistable = new Map(); // dep → [{path, field, version}]

for (const { path, pkg } of childPackages) {
    for (const field of ['dependencies', 'devDependencies']) {
        const deps = pkg[field];
        if (!deps) {
            continue;
        }
        for (const [name, version] of Object.entries(deps)) {
            // Skip workspace: protocol and local refs
            if (version.startsWith('workspace:') || version.startsWith('file:') || version.startsWith('link:')) {
                continue;
            }
            // If root already has this exact version, child can remove it (hoisted)
            if (rootDeps[name] === version) {
                if (!hoistable.has(name)) {
                    hoistable.set(name, []);
                }
                hoistable.get(name).push({ path, field, version });
            }
        }
    }
}

console.log('='.repeat(80));
console.log('  HOISTABLE — child deps already present at same version in root');
console.log('='.repeat(80));
if (hoistable.size === 0) {
    console.log('\n  (none)\n');
} else {
    for (const [dep, locations] of [...hoistable.entries()].sort(([a], [b]) => a.localeCompare(b))) {
        console.log(`\n  ${dep} (root: ${rootDeps[dep]})`);
        for (const { path, field } of locations) {
            console.log(`    ${path} (${field})`);
        }
    }
    console.log(`\n  Total: ${hoistable.size} dependencies could be removed from child packages\n`);
}

console.log('='.repeat(80));
console.log('  RESOLUTIONS — entries in root package.json "resolutions"');
console.log('='.repeat(80));

const resolutions = rootPkg?.resolutions;
if (!resolutions || Object.keys(resolutions).length === 0) {
    console.log('\n  (none)\n');
} else {
    for (const [name, version] of Object.entries(resolutions).sort(([a], [b]) => a.localeCompare(b))) {
        console.log(`  ${name.padEnd(40)} ${version}`);
    }
    console.log(`\n  Total: ${Object.keys(resolutions).length} resolutions\n`);
}

console.log('='.repeat(80));
console.log(`  SUMMARY: ${packages.length} package.json files scanned`);
console.log(`           ${mismatches.length} version mismatches`);
console.log(`           ${hoistable.size} hoistable dependencies`);
console.log(`           ${Object.keys(resolutions || {}).length} resolutions`);
console.log('='.repeat(80));
