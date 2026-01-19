#!/usr/bin/env tsx
import { spawnSync } from 'node:child_process';
import { rmSync } from 'node:fs';
import path from 'node:path';

import { SITEMAP_CACHE_DIR } from '../src/constants';

const rawArgs = process.argv.slice(2);
const hasFlag = (flag: string) =>
    rawArgs.includes(flag) || rawArgs.some((arg) => arg.startsWith(`${flag}=`) && arg !== `${flag}=false`);
const skipSecondBuild = hasFlag('--skip-second-build');
const cleanCache = hasFlag('--clean-cache');
const astroArgs = [
    'build',
    ...rawArgs.filter((arg) => !arg.startsWith('--skip-second-build') && !arg.startsWith('--clean-cache')),
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

if (!skipSecondBuild) {
    if (!rawArgs.includes('--silent')) {
        console.log('♻️ Building again to use latest sitemap');
    }

    runBuild();
}
