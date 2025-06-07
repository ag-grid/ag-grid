import type { BrowserContext, Page } from '@playwright/test';
import { test } from '@playwright/test';

import { gotoUrl, waitFor } from '../../playwright.utils';

export type Benchmarking = 'typescript' | 'reactFunctionalTs';
export type CustomVersion = `${number}.${number}.${number}`;
export type Version = 'prod' | 'staging' | 'local' | CustomVersion;
export type Entry<T> = T extends readonly (infer U)[] ? U : T extends object ? T[keyof T] : T;

/**
 * Describes a performance benchmarking test suite.
 */
export type Describe = {
    name: string;
    minIterations?: number; // default is 10, also used as an inner loop iteration count
    maxIterations?: number; // default is 1000
    testCases: TestCase[];
    timeout?: number; // in milliseconds, default is 3 minutes
};

/**
 * Describes a single test case within a performance benchmarking suite.
 */
export type TestCase = {
    name: string;
    /** @deprecated don't forget to re-enable your test */
    skip?: boolean;
    framework: Benchmarking;
    control: Variant;
    variant: Variant;
    setup: (page: Page) => Promise<void>;
    actions: (page: Page) => Promise<void>;
    metrics?: Entry<(typeof PerformanceObserver)['supportedEntryTypes']>;
};

/**
 * Describes a variant of a test case, which can include a specific URL and version.
 * Optionally, it can include cookies to be set in the browser context.
 */
export type Variant = {
    url?: string;
    version: Version;
    cookies?: Parameters<BrowserContext['addCookies']>[0];
};

const knownUrls: Record<Version, string> = {
    local: 'http://localhost:4200', // todo: update with actual local URL
    staging: 'https://grid-staging.ag-grid.com',
    prod: 'https://www.ag-grid.com',
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getCdnUrl = (pkg: string, version: CustomVersion) =>
    `https://cdn.jsdelivr.net/npm/${pkg}@${version}/dist/${pkg}.min.js`;

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
 * Get the URL for the test case based on the version.
 */
function getUrl(testCase: TestCase, variant: Variant) {
    if (variant.url) {
        return variant.url;
    }
    if (!variant.version.startsWith('v')) {
        return `${knownUrls[variant.version]}/${testCase.name}/${testCase.framework}/`;
    }
}

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
    const marginOfError = (1.96 * stdDev) / Math.sqrt(base.length);

    return {
        average: avg,
        stdDev,
        marginOfError,
        filteredCount: base.length,
        originalCount: times.length,
    };
};

/**
 * Determines whether a percentage difference between two values is statistically significant at the 95% confidence level,
 * using a z-test approximation based on margins of error.
 */
function isSignificant(diff: number, moe1: number, moe2: number) {
    const critical_value = 1.96;
    const se1 = moe1 / critical_value;
    const se2 = moe2 / critical_value;
    const se_diff = Math.sqrt(se1 ** 2 + se2 ** 2);
    const z_score = diff / se_diff;
    return Math.abs(z_score) > critical_value;
}

/**
 * Reports the statistics of the performance test results.
 * Returns true if the results are significant, false otherwise.
 */
function reportStats(stats: Record<string, ReturnType<typeof computeStats>>, testCase: TestCase): boolean {
    const [v1, v2] = Object.keys(stats);
    const s1 = stats[v1];
    const s2 = stats[v2];

    const diff = s1.average - s2.average;
    const slower = diff > 0 ? testCase.control.version : testCase.variant.version;
    const faster = diff > 0 ? testCase.variant.version : testCase.control.version;
    const percentDiff = (Math.abs(diff) / Math.min(s1.average, s2.average)) * 100;

    const moe1Percent = (s1.marginOfError / s1.average) * 100;
    const moe2Percent = (s2.marginOfError / s2.average) * 100;
    const avgMoE = (s1.marginOfError + s2.marginOfError) / 2;
    const avgMoEPercent = (moe1Percent + moe2Percent) / 2;

    const significant = isSignificant(diff, s1.marginOfError, s2.marginOfError);

    const numbersString = `${diff.toFixed(2)} ± ${avgMoE.toFixed(2)}`;
    const percentString = `${percentDiff.toFixed(1)}% ± ${avgMoEPercent.toFixed(1)}%`;

    if (!significant) {
        console.log(
            `Result is statistically insignificant (${percentString}, ${s1.filteredCount}/${s1.originalCount}), running more iterations...`
        );
        return false;
    }
    if (diff === 0) {
        console.log(`Both versions are equal: ${testCase[v1].version} and ${testCase[v2].version} (${percentString})`);
    } else {
        console.log(`${slower} is slower than ${faster} by ${percentString} (${numbersString})`);
    }

    console.log('--- Details: ---');
    console.log(
        `${testCase[v1].version} → avg: ${s1.average.toFixed(2)}ms (±${s1.marginOfError.toFixed(2)}), stdDev: ${s1.stdDev.toFixed(2)}, count: ${s1.filteredCount}/${s1.originalCount}`
    );
    console.log(
        `${testCase[v2].version} → avg: ${s2.average.toFixed(2)}ms (±${s2.marginOfError.toFixed(2)}), stdDev: ${s2.stdDev.toFixed(2)}, count: ${s2.filteredCount}/${s2.originalCount}`
    );
    return significant;
}

export function calculateTotalBlockingTime(page: Page, timeout = 5000): Promise<number> {
    return page.evaluate(() => {
        return new Promise<number>((resolve) => {
            let totalBlockingTime = 0;
            const po = new PerformanceObserver((list) => {
                const perfEntries = list.getEntries();
                for (const perfEntry of perfEntries) {
                    totalBlockingTime += perfEntry.duration - 50;
                }
                resolve(totalBlockingTime);
                po.disconnect();
            });
            po.observe({ type: 'longtask', buffered: true });

            // Resolve promise if there haven't been long tasks
            setTimeout(() => resolve(totalBlockingTime), timeout);
        });
    }, 0);
}

/** Generic benchmark function to run performance tests */
export default function (name: string, describe: Describe) {
    test.describe.configure({ timeout: describe.timeout || 3 * 60_000, mode: 'serial' });
    let testStartTime: Date | undefined;
    return test.describe(name, () => {
        describe.testCases.forEach((testCase, i) => {
            (testCase.skip ? test.skip : test)(
                `${i + 1} Running ${testCase.name} with ${testCase.framework}`,
                async ({ page, context }) => {
                    console.log(`Start time: ${(testStartTime = new Date()).toISOString()}`);
                    const result = {} as Record<'control' | 'variant', number[]>;
                    const metricsGetter = () =>
                        waitFor(
                            testCase.metrics
                                ? (metrics: TestCase['metrics']) => performance.getEntriesByType(metrics)
                                : () => performance.getEntries(),
                            page,
                            { args: [testCase.metrics] }
                        );
                    let isSignificant = false;
                    do {
                        for (const variantName of ['control', 'variant'] as const) {
                            const variant = testCase[variantName];
                            if (variant.cookies) {
                                await context.clearCookies();
                                await context.addCookies(variant.cookies);
                            }
                            await gotoUrl(page, getUrl(testCase, variant));
                            result[variantName] ||= [];
                            for (let i = 0; i < (describe.minIterations ?? 10) + 3; i++) {
                                await testCase.setup(page);
                                const noiseEntries = await metricsGetter();
                                await testCase.actions(page);
                                if (i > 3) {
                                    // warmup iterations
                                    const performanceEntries = await metricsGetter();
                                    const duration = performanceEntries
                                        .slice(noiseEntries.length)
                                        .reduce((acc, pe) => acc + pe.duration, 0);
                                    result[variantName].push(duration);
                                }
                            }
                        }
                        console.log(
                            `Collected ${Object.entries(result)
                                .map(([v, d]) => `${v}: ${d.length}`)
                                .join(', ')} entries`
                        );
                        const stats = Object.fromEntries(
                            Object.entries(result).map(([version, durations]) => [version, computeStats(durations)])
                        );
                        isSignificant = reportStats(stats, testCase);
                    } while (!(isSignificant || result['control'].length > (describe.maxIterations ?? 1000))); // run until we do 1000 iterations or results are significant
                    console.log(
                        `End time: ${new Date().toISOString()}`,
                        `Took: ${(new Date().getTime() - testStartTime.getTime()) / 1000} seconds`
                    );
                }
            );
        });
    });
}
