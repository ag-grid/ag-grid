#!/usr/bin/env tsx
/**
 * Build helper for AG Charts website.
 *
 * Runs a full Astro build to generate the sitemap cache, then optionally runs a
 * second build that uses the sitemap cache to generate the sitemap page.
 *
 * Flags:
 * - --run-second-build / --no-run-second-build / --run-second-build=false
 * - --clean-cache / --no-clean-cache / --clean-cache=false
 * - All other params are passed through to Astro
 */
import { spawnSync } from 'node:child_process';
import { rmSync } from 'node:fs';
import path from 'node:path';

import { SITEMAP_CACHE_DIR } from '../src/constants';

const rawArgs = process.argv.slice(2);
const normaliseFlag = (flag: string) => flag.replace(/^--/, '');
const isTruthyValue = (value: string) => !['0', 'false', 'no', 'off'].includes(value.toLowerCase());
const getFlagValue = (flag: string) => {
    const flagName = normaliseFlag(flag);
    let value: boolean | undefined;

    for (const arg of rawArgs) {
        if (arg === `--${flagName}` || arg === flag) {
            value = true;
            continue;
        }
        if (arg === `--no-${flagName}`) {
            value = false;
            continue;
        }
        if (arg.startsWith(`--${flagName}=`) || arg.startsWith(`${flag}=`)) {
            const [, rawValue = ''] = arg.split('=');
            value = isTruthyValue(rawValue);
        }
    }

    return value;
};
const hasFlag = (flag: string) => getFlagValue(flag) ?? false;
const runSecondBuild = hasFlag('--run-second-build');
const cleanCache = hasFlag('--clean-cache');
const astroArgs = [
    'build',
    ...rawArgs.filter((arg) => !arg.startsWith('--run-second-build') && !arg.startsWith('--clean-cache')),
];

const cleanSitemapCache = async () => {
    const cacheFolder = path.resolve(SITEMAP_CACHE_DIR);
    rmSync(cacheFolder, { recursive: true, force: true });
};

const runBuild = () => {
    const result = spawnSync('astro', astroArgs, { stdio: 'inherit', shell: true });
    if (result.status !== 0) {
        process.exit(result.status ?? 1);
    }
};

if (cleanCache) {
    console.log('✨ Cleaning sitemap cache');
    cleanSitemapCache();
}

runBuild();

if (runSecondBuild) {
    console.log('♻️ Building again to use latest sitemap');

    runBuild();
}
