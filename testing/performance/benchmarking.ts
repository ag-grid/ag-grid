import type { BrowserContext, Page, PlaywrightTestArgs } from '@playwright/test';
import { test } from '@playwright/test';
import chalk from 'chalk';

import type { BrowserCommunications } from './playwright.utils';
import { gotoUrl, waitFor } from './playwright.utils';

chalk.level = process.env['CI'] ? 0 : 3; // disable colors in CI, enable them otherwise

const { bgBlue, bgGreen, blue, cyan, green, magenta, yellow } = chalk;

export type Entry<T> = T extends readonly (infer U)[] ? U : T extends object ? T[keyof T] : T;
export const allFrameworks = [
    'vanilla',
    'typescript',
    'reactFunctional',
    'reactFunctionalTs',
    'angular',
    'vue3',
] as const;
export type Framework = Entry<typeof allFrameworks>;
export type CustomVersion = `v${number}.${number}.${number}`;
export type Version = 'prod' | 'staging' | 'local' | CustomVersion;

const thisFilePath = __filename;

/**
 * Describes a performance benchmarking test suite.
 */
export type Describe = {
    minIterations?: number; // default is 10, also used as an inner loop iteration count
    maxIterations?: number; // default is 1000
    testCases: TestCase[];
    timeout?: number; // in milliseconds, default is 3 minutes
    warmupIterations?: number; // default is 3, used to warm up the grid before measuring performance
};

/**
 * Describes a single test case within a performance benchmarking suite.
 */
export type TestCase = {
    name: string;
    description?: string;
    /** @deprecated don't forget to re-enable your test */
    skip?: boolean;
    framework: Framework;
    control: Variant;
    variant: Variant;
    preSetup?: (page: Page) => Promise<void>;
    setupPreActions?: (page: Page) => Promise<void>;
    actions: (page: Page) => Promise<void>;
    expectsPostActions?: (page: Page, comms: BrowserCommunications) => Promise<void>;
    metrics?: Entry<(typeof PerformanceObserver)['supportedEntryTypes']>;
};

type InternalTestCase = TestCase & {
    __hidden: {
        error: Error; // used to store the error for friendlier error logs
        maxIter: number;
        minIter: number;
        warmupIter: number;
        setLastCommunications: (comms: BrowserCommunications) => BrowserCommunications;
    };
};

/**
 * Describes a variant of a test case, which can include a specific URL and version.
 *
 * @prop url can be a plunker, or any grid example url.
 * @prop version is used to determine the version of the grid to test against, e.g. 'prod', 'staging', 'local', or a specific version like 'v29.0.0'.
 *               Playwright will intercept whatever version is specified in the example, and use this version instead.
 * @prop cookies are used to set cookies for the test case, e.g. for plunker acceptance cookie
 */
export type Variant = {
    url?: string;
    version: Version;
    shouldInjectScript?: boolean;
    cookies?: Parameters<BrowserContext['addCookies']>[0];
};

const knownUrls: Record<Version, string> = {
    local: `https://localhost:${process.env['PORT'] || '4610'}`,
    staging: 'https://grid-staging.ag-grid.com',
    prod: 'https://www.ag-grid.com',
};

/**
 * Taken from ag-grid-enterprise package.json git history
 */
const gridToChartsMap = {
    local: 'v11.3.0',
    prod: 'v11.3.0',
    staging: 'v11.3.0',
    'v33.3.0': 'v11.3.0',
    'v33.2.3': 'v11.2.3',
    'v33.2.1': 'v11.2.1',
    'v33.1.1': 'v11.1.1',
    'v33.1.0': 'v11.1.0',
    'v33.0.1': 'v11.0.0',
    'v32.2.0': 'v10.1.0', // was latest, changed to the closest one
    'v32.1.0': 'v10.1.0',
    'v32.0.1': 'v10.0.1',
    'v32.0.0': 'v10.0.0',
    'v31.3.1': 'v9.3.1',
    'v31.3.0': 'v9.3.0',
    'v31.2.0': 'v9.2.0',
} as const;

const getCdnUrl = (pkg: string, version: Version, path: `/${string}` = `/dist/${pkg}.js`) => {
    if (isCustomVersion(version)) {
        return `https://cdn.jsdelivr.net/npm/${pkg}@${version.slice(1)}${path}`;
    }

    return `${knownUrls[version]}/files/${pkg}/dist/${pkg}.js`;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _getPlnkrCookies = (url: string) => [
    {
        name: 'paccept',
        value: new Date().toISOString(),
        domain: '.run.plnkr.co',
        path: new URL(url).pathname,
    },
];

/**
 * Get the URL for the test case based on the version field.
 * If custom version is specified, we use prod as base and then inject the correct version
 */
function getUrl(testCase: TestCase, variant: Variant) {
    if (variant.url) {
        return variant.url;
    }
    if (isCustomVersion(variant.version)) {
        return `${knownUrls.prod}/${testCase.name}/${testCase.framework}/`;
    }
    return `${knownUrls[variant.version]}/${testCase.name}/${testCase.framework}/`;
}

const CRITICAL_VALUE = 1.96;

/**
 * Calculates:
 * - Average time
 * - Standard deviation
 * - Margin of error
 * - Filtered count (after removing outliers)
 * - Original count (before filtering)
 */
const computeStats = (times: number[]) => {
    function getPercentile(sorted: number[], p: number): number {
        const idx = (sorted.length - 1) * p;
        const lower = Math.floor(idx);
        const upper = Math.ceil(idx);
        const weight = idx - lower;

        if (upper >= sorted.length) return sorted[lower]; // edge case: p = 1
        return sorted[lower] * (1 - weight) + sorted[upper] * weight;
    }

    const sorted = times.sort((a, b) => a - b);
    const q1 = getPercentile(sorted, 0.25);
    const q3 = getPercentile(sorted, 0.75);
    const iqr = q3 - q1;
    const lower = q1 - 1.5 * iqr;
    const upper = q3 + 1.5 * iqr;
    const filtered = sorted.filter((t) => t >= lower && t <= upper);
    const base = filtered.length >= 5 ? filtered : sorted;

    const avg = base.reduce((sum, v) => sum + v, 0) / base.length;
    const stdDev = Math.sqrt(base.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / (base.length - 1));
    const marginOfError = (CRITICAL_VALUE * stdDev) / Math.sqrt(base.length);

    return {
        average: avg,
        stdDev,
        marginOfError,
        newBase: base,
        filteredCount: base.length,
        originalCount: times.length,
    };
};

/**
 * Calculates the standard error based on the margins of error for two sets of data.
 * Uses the critical value for a 95% confidence level (1.96).
 */
function getStandardError(moe1: number, moe2: number) {
    const se1 = moe1 / CRITICAL_VALUE;
    const se2 = moe2 / CRITICAL_VALUE;
    return Math.sqrt(se1 ** 2 + se2 ** 2);
}

/**
 * Determines whether a percentage difference between two values is statistically significant at the 95% confidence level,
 * using a z-test approximation based on margins of error.
 */
function isSignificant(diff: number, moe1: number, moe2: number) {
    const z_score = diff / getStandardError(moe1, moe2);
    return Math.abs(z_score) > CRITICAL_VALUE;
}

/**
 * Reports the statistics of the performance test results.
 * Returns true if the results are significant, false otherwise.
 */
function reportStats(
    stats: Record<'control' | 'variant', ReturnType<typeof computeStats>>,
    testCase: InternalTestCase,
    significant: boolean
) {
    const s1 = stats.control;
    const s2 = stats.variant;

    const diff = s1.average - s2.average;
    const slower = diff > 0 ? testCase.control.version : testCase.variant.version;
    const faster = diff > 0 ? testCase.variant.version : testCase.control.version;
    const percentDiff = (Math.abs(diff) / Math.min(s1.average, s2.average)) * 100;

    const avgMoE = getStandardError(s1.marginOfError, s2.marginOfError);
    const avgMoEPercent = (avgMoE / Math.min(s1.average, s2.average)) * 100;

    const numbersString = `${Math.abs(diff).toFixed(2)} ± ${avgMoE.toFixed(2)}`;
    const percentString = `${percentDiff.toFixed(1)}% ± ${avgMoEPercent.toFixed(1)}%`;

    if (!significant) {
        if (!(s1.originalCount % testCase.__hidden.minIter)) {
            console.log(
                `\n${yellow(`Result is statistically insignificant (`)}${green(percentString)}, ${blue(`${s1.filteredCount}/${s1.originalCount}`)})${yellow('. Running more iterations...\n')}`
            );
        }
        return;
    }

    const resultMessage =
        percentDiff - avgMoEPercent <= 2
            ? `${cyan('Both')} ${magenta(testCase.control.version)} and ${magenta(testCase.variant.version)}${cyan(` seem to be equal (${slower} is slightly slower than ${faster}): `)}${green(percentString)} (${numbersString}).\n${yellow(
                  'Even though the data is statistically significant, it is safer to re-run the test with more iterations to confirm.'
              )}`
            : `${magenta(slower)}${cyan(' is slower than ')}${magenta(faster)}${cyan(' by ')}${green(percentString)} (${numbersString})`;

    console.log(`${bgBlue.black.bold(' Performance Comparison Results ')}`);
    console.log(resultMessage);
    console.log(`${bgGreen.black.bold(' Details: ')}`);

    const detailsFormat = (version: string, stats: ReturnType<typeof computeStats>) =>
        [
            `${blue('Version:')} ${magenta(version)}`,
            `${green('Average time:')} ${stats.average.toFixed(2)}ms (±${yellow(stats.marginOfError.toFixed(2))})`,
            `${green('StdDev:')} ${stats.stdDev.toFixed(2)}`,
            `${green('Sample size:')} ${blue(`${stats.filteredCount}/${stats.originalCount}`)}`,
        ].join('\n        ');

    console.log(detailsFormat(testCase.control.version, s1));
    console.log(detailsFormat(testCase.variant.version, s2));
}

function benchError(message: string, e: any, testCase: InternalTestCase) {
    const [_, ...rest] = testCase.__hidden.error.stack!.split('\n') || [];
    const [__, ...providedRest] = e.stack!.split('\n');
    e.stack = `${message}\n${providedRest.join('\n')}\n${rest
        .filter((l) => l.includes(thisFilePath) || l.includes(test.info().titlePath[0]))
        .join('\n')}`;

    throw e;
}

async function attachScripts(page: Page, version: Version, testCase: InternalTestCase) {
    const chartsVersion = gridToChartsMap[version as keyof typeof gridToChartsMap] || gridToChartsMap.prod;

    const urls = [getCdnUrl('ag-grid-community', version), getCdnUrl('ag-grid-enterprise', version)];
    if (chartsVersion) {
        urls.push(getCdnUrl('ag-charts-community', chartsVersion, '/dist/umd/ag-charts-community.js'));
        /*[
        // these are not available in all versions
            getCdnUrl('@ag-grid-community/styles', version, '/'),
            getCdnUrl('@ag-grid-community/locale', version),
            getCdnUrl('ag-charts-core', chartsVersion),
            getCdnUrl('ag-charts-enterprise', chartsVersion),
            getCdnUrl('ag-charts-types', chartsVersion, '/'),
        ];*/
    }

    for (const url of urls) {
        await page.addScriptTag({ url, type: 'text/javascript' });
    }
    try {
        // @ts-expect-error agGrid is not in the current scope
        await waitFor(() => typeof agGrid !== 'undefined', page, { timeout: 10_000 });
    } catch (e) {
        benchError(`Perhaps you forgot to start dev server? Or provided URL/version are not available.`, e, testCase);
    }
}
function updatePageTitle(page: Page, testCase: TestCase, variant: Variant) {
    return page.evaluate(
        (title) => (document.title = title),
        `Running ${variant.version} ${testCase.name} with ${testCase.framework}`
    );
}

function isCustomVersion(version: Version): version is CustomVersion {
    return version.startsWith('v');
}

function metricsGetter(page: Page, testCase: TestCase) {
    return waitFor(
        testCase.metrics
            ? (metrics: TestCase['metrics']) => performance.getEntriesByType(metrics!)
            : () => performance.getEntries(),
        page,
        { args: [testCase.metrics] }
    );
}

async function attachCookies(context: BrowserContext, variant: Variant) {
    if (variant.cookies) {
        await context.clearCookies();
        await context.addCookies(variant.cookies);
    }
}

const testLevelCatch = (e: any, lastCommunications?: BrowserCommunications) => {
    if (lastCommunications?.consoleMsgs?.length || lastCommunications?.requestMsgs?.length) {
        console.error('Error has been thrown during the test, here are the last comms:');
        lastCommunications.consoleMsgs.forEach((msg) => {
            console[msg.type as 'log' | 'error'](msg.text);
        });
        lastCommunications.requestMsgs.forEach((msg) => {
            console.log(`U: ${msg.method} ${msg.url} D: ${msg.response.status} ${msg.response.statusText}`);
        });
    }
    throw e;
};

const testBody = async (testCase: InternalTestCase, { page, context }: PlaywrightTestArgs, ..._: any[]) => {
    const result = { control: [] as number[], variant: [] as number[] };
    const { minIter, maxIter, warmupIter, setLastCommunications } = testCase.__hidden!;
    let significant = false;
    do {
        for (const variantName of ['control', 'variant'] as const) {
            const variant = testCase[variantName];
            await attachCookies(context, variant);
            const lastCommunications = setLastCommunications(await gotoUrl(page, getUrl(testCase, variant)));
            void updatePageTitle(page, testCase, variant);
            if (variant.shouldInjectScript) await attachScripts(page, variant.version, testCase);
            if (testCase.preSetup) await testCase.preSetup(page);
            for (let i = 0; i < minIter; i++) {
                if (testCase.setupPreActions) await testCase.setupPreActions(page);
                const noiseSize = (await metricsGetter(page, testCase)).length;
                if (testCase.actions) await testCase.actions(page);
                if (i > warmupIter) {
                    const usefulEntries = (await metricsGetter(page, testCase)).slice(noiseSize);
                    const duration = usefulEntries.reduce((acc, pe) => acc + pe.duration, 0);
                    result[variantName].push(duration);
                }
            }
            if (testCase.expectsPostActions) await testCase.expectsPostActions(page, lastCommunications);
        }
        const [s1, s2] = [computeStats(result.control), computeStats(result.variant)];
        [result.control, result.variant] = [s1.newBase, s2.newBase]; // update the result with filtered data
        if (!(s1.originalCount % testCase.__hidden!.minIter)) console.log(`Collected ${s1.originalCount} entries`);
        significant = isSignificant(s1.average - s2.average, s1.marginOfError, s2.marginOfError);
        reportStats({ control: s1, variant: s2 }, testCase, significant);
    } while (!(significant || result['control'].length > maxIter)); // run until we do 1000 iterations or results are significant
    if (!significant) {
        console.log(
            `${yellow('Result is statistically insignificant.')} ${green(
                'Consider running the test with more iterations or check your test case setup.'
            )}`
        );
    }
};

const describeBody = (describe: Describe) => () => {
    const warmupIter = describe.warmupIterations ?? 3; // default is 3
    const minIter = Math.max(Math.max(describe.minIterations ?? 10, warmupIter) + warmupIter, 2);
    const maxIter = describe.maxIterations ?? 1000;

    describe.testCases.forEach((testCase: TestCase, index, allCases) => {
        let lastCommunications: BrowserCommunications | undefined;
        const setLastCommunications = (comms: BrowserCommunications) => (lastCommunications = comms);
        const __hidden = { error: new Error(), setLastCommunications, minIter, maxIter, warmupIter };

        const testTitle = `Running ${testCase.name}${testCase.description ? `/${testCase.description}` : ''} with ${testCase.framework} (${index + 1}/${allCases.length})`;
        (testCase.skip ? test.skip : test)(testTitle, ({ page, context, request }, testInfo) =>
            testBody({ ...testCase, __hidden }, { page, context, request }, testInfo).catch((e) =>
                testLevelCatch(e, lastCommunications)
            )
        );
    });
};

/** Generic benchmark function to run performance tests */
export default function (name: string, describe: Describe) {
    test.describe.configure({ timeout: describe.timeout || 60_000 });
    test.beforeEach(() => console.log(`${bgGreen.black.bold(test.info().title)}`));
    test.beforeEach(() => console.log(`Test started at ${new Date().toISOString()}`));
    test.beforeEach(() => console.time('Duration'));
    test.afterEach(() => console.timeEnd('Duration'));
    test.afterEach(() => console.log(`Test ended at ${new Date().toISOString()}\n\n`));

    return test.describe(name, describeBody(describe));
}
