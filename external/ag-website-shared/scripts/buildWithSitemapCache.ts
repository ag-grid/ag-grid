#!/usr/bin/env tsx
/**
 * Build helper for the AG websites.
 *
 * The sitemap page is a chicken-and-egg case: it lists the pages in the sitemap, but the sitemap is
 * only generated once every page — including this one — has been built. So the page renders from a
 * *previous* sitemap (the on-disk cache, or the live site) and the build has to run again to catch
 * the page up whenever the page list has actually moved.
 *
 * "Whenever it has actually moved" is the point: a second full build of the whole site is expensive,
 * and most builds do not add or remove a page. So the first build records which sitemap its sitemap
 * pages rendered from (see `consumedSitemapRecord`), and this script only builds again when that
 * differs from the sitemap the build went on to generate. Builds that generate no sitemap at all
 * (archives — see the `astro.config.mjs` integrations) can never need the second pass.
 *
 * Flags:
 * - --run-second-build / --no-run-second-build / --run-second-build=false
 *   Allow a second build when the sitemap pages are out of date. Without it, they are left as-is.
 * - --clean-cache / --no-clean-cache / --clean-cache=false
 *   Discard the cached sitemap first, so the first build renders from the live site instead.
 * - All other params are passed through to Astro
 */
import { spawnSync } from 'node:child_process';
import { readFileSync, rmSync } from 'node:fs';
import path from 'node:path';

import { SITEMAP_BUILD_DIR, SITEMAP_CACHE_DIR } from '../src/constants';
import {
    decideSecondBuild,
    getConsumedSitemapRecordPath,
    readConsumedSitemapRecord,
} from '../src/utils/consumedSitemapRecord';

// Astro's default `outDir`, which none of the websites override.
const ASTRO_OUT_DIR = 'dist';

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
const OWN_FLAGS = ['--run-second-build', '--clean-cache'];
const runSecondBuild = hasFlag('--run-second-build');
const cleanCache = hasFlag('--clean-cache');
const astroArgs = ['build', ...rawArgs.filter((arg) => !OWN_FLAGS.some((flag) => arg.startsWith(flag)))];

/** Null when this build generated no sitemap at all, as archive builds do. */
const readGeneratedSitemap = () => {
    try {
        return readFileSync(path.join(ASTRO_OUT_DIR, 'sitemap-0.xml'), 'utf8');
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
            return null;
        }

        throw error;
    }
};

const runBuild = () => {
    const result = spawnSync('astro', astroArgs, { stdio: 'inherit', shell: true });
    if (result.status !== 0) {
        process.exit(result.status ?? 1);
    }
};

if (cleanCache) {
    console.log('✨ Cleaning sitemap cache');
    rmSync(path.resolve(SITEMAP_CACHE_DIR), { recursive: true, force: true });
}

// A record left by an earlier build would otherwise be read as this build's.
rmSync(getConsumedSitemapRecordPath(SITEMAP_BUILD_DIR), { force: true });

runBuild();

if (runSecondBuild) {
    const { needed, reason } = decideSecondBuild({
        generatedXml: readGeneratedSitemap(),
        record: readConsumedSitemapRecord(SITEMAP_BUILD_DIR),
    });

    if (needed) {
        console.log(`♻️ Building again to update the sitemap page: ${reason}`);
        runBuild();
    } else {
        console.log(`✅ Skipping the second build — ${reason}.`);
    }
}
