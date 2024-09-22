import type { AstroIntegrationLogger } from 'astro';
import { existsSync } from 'node:fs';
import path from 'path';

import { IGNORE_PAGES, REDIRECTS_FILE, SITE_301_REDIRECTS } from './redirects';

type SuccessResult = {
    type: 'success';
    path: string;
};

type IgnoredResult = {
    type: 'ignored';
    path: string;
};

type ErrorResult = {
    type: 'error';
    path: string;
};

type Result = SuccessResult | IgnoredResult | ErrorResult;

const getSuccess = (results: Result[]) => results.filter(({ type }) => type === 'success');
const getIgnored = (results: Result[]) => results.filter(({ type }) => type === 'ignored');
const getErrors = (results: Result[]) => results.filter(({ type }) => type === 'error');

const getErrorOutput = (results: Result[]) => {
    const errorResults = getErrors(results);
    const errorOutput = errorResults.map(({ path }) => `File not found: ${path}`).join('\n');
    return errorResults.length ? errorOutput : '';
};

function getResultOutput(results: Result[]) {
    const successResults = getSuccess(results);
    const ignoredResults = getIgnored(results);
    const errorResults = getErrors(results);
    const total = results.length;

    const summary = `✅ Success ${successResults.length} / ⚠️  Ignored ${ignoredResults.length} / ❌ Errors ${errorResults.length} (Total: ${total})`;
    const ignoredOutput = ignoredResults.map(({ path }) => `Ignored: ${path}`).join('\n');

    return `${ignoredResults.length ? `${ignoredOutput}\n\n` : ''}${summary}`;
}

function checkPathExists(pathToCheck: string): Result {
    if (existsSync(pathToCheck)) {
        return {
            type: 'success',
            path: pathToCheck,
        };
    } else {
        return {
            type: 'error',
            path: pathToCheck,
        };
    }
}

export function redirectsChecker({ buildDir, logger }: { buildDir: string; logger: AstroIntegrationLogger }) {
    const results: Result[] = SITE_301_REDIRECTS.map(({ to }) => {
        if (to.startsWith('/')) {
            const toPath = to.split('#')[0]; // Remove search params

            if (IGNORE_PAGES.includes(toPath)) {
                return {
                    type: 'ignored',
                    path: to,
                };
            }

            const toBuildPath = path.join(buildDir, toPath);

            if (toBuildPath.endsWith('/')) {
                const toFolder = toBuildPath.slice(0, -1);
                const toIndex = path.join(toFolder, 'index.html');

                return checkPathExists(toIndex);
            } else {
                const toIndex = path.join(toBuildPath, 'index.html');

                return checkPathExists(toIndex);
            }
        }

        return {
            type: 'ignored',
            path: to,
        };
    });

    getResultOutput(results)
        .split('\n')
        .forEach((line) => logger.info(line));
    const errorResults = getErrors(results);
    if (errorResults.length) {
        throw new Error(`Redirect target/s not found. Fix them in '${REDIRECTS_FILE}'.\n${getErrorOutput(results)}`);
    }
}
