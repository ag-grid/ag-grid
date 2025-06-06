import type { BrowserContext, Page } from '@playwright/test';
import { test } from '@playwright/test';

import { gotoUrl, waitFor } from '../../playwright.utils';

export type Benchmarking = 'typescript' | 'reactFunctionalTs';
export type CustomVersion = `${number}.${number}.${number}`;
export type Version = 'prod' | 'staging' | 'local' | CustomVersion;
export type Entry<T> = T extends readonly (infer U)[] ? U : T extends object ? T[keyof T] : T;

export type Describe = {
    name: string;
    iterations: number;
    testCases: TestCase[];
    timeout?: number; // in milliseconds, default is 3 minutes
};

export type TestCase = {
    name: string;
    skip?: boolean;
    framework: Benchmarking;
    control: Variant;
    variant: Variant;
    setup: (page: Page) => Promise<void>;
    actions: (page: Page) => Promise<void>;
    metrics?: Entry<(typeof PerformanceObserver)['supportedEntryTypes']>;
};

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

function getUrl(testCase: TestCase, variant: Variant) {
    if (variant.url) {
        return variant.url;
    }
    if (!variant.version.startsWith('v')) {
        return `${knownUrls[variant.version]}/${testCase.name}/${testCase.framework}/`;
    }
}

const computeStats = (times: number[]) => {
    if (!times.length) {
        return {
            average: 0,
            stdDev: 0,
            marginOfError: 0,
            filteredCount: 0,
            originalCount: 0,
        };
    }
    function getPercentile(sorted: number[], p: number): number {
        const idx = (sorted.length - 1) * p;
        const lower = Math.floor(idx);
        const upper = Math.ceil(idx);
        const weight = idx - lower;

        if (upper >= sorted.length) return sorted[lower]; // edge case: p = 1
        return sorted[lower] * (1 - weight) + sorted[upper] * weight;
    }

    const sorted = times.slice().sort((a, b) => a - b);
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

function reportStats(stats: { [k: string]: ReturnType<typeof computeStats> }) {
    const [control, variant] = Object.keys(stats);
    const s1 = stats[control];
    const s2 = stats[variant];

    const diff = s1.average - s2.average;
    const slower = diff > 0 ? control : variant;
    const faster = diff > 0 ? variant : control;
    const percentDiff = (Math.abs(diff) / Math.min(s1.average, s2.average)) * 100;

    const moe1Percent = (s1.marginOfError / s1.average) * 100;
    const moe2Percent = (s2.marginOfError / s2.average) * 100;
    const avgMoEPercent = ((moe1Percent + moe2Percent) / 2).toFixed(2);
    const isSignificant = percentDiff > parseFloat(avgMoEPercent);

    if (diff === 0) {
        console.log(`Both versions are equal: ${control} and ${variant}`);
    } else if (!isSignificant) {
        console.log(
            `${slower} appears ${percentDiff.toFixed(1)}% slower than ${faster}, but result is statistically insignificant (±${avgMoEPercent}%)`
        );
    } else {
        console.log(`${slower} is slower than ${faster} by ${percentDiff.toFixed(1)}% ± ${avgMoEPercent}%`);
    }
    console.log(
        `${control} → avg: ${s1.average.toFixed(2)}ms (±${moe1Percent.toFixed(2)}%), stdDev: ${s1.stdDev.toFixed(2)}, count: ${s1.filteredCount}/${s1.originalCount}`
    );
    console.log(
        `${variant} → avg: ${s2.average.toFixed(2)}ms (±${moe2Percent.toFixed(2)}%), stdDev: ${s2.stdDev.toFixed(2)}, count: ${s2.filteredCount}/${s2.originalCount}`
    );
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
    return test.describe(name, () => {
        describe.testCases.forEach((testCase) => {
            (testCase.skip ? test.skip : test)(
                `Running ${testCase.name} with ${testCase.framework}`,
                async ({ page, context }) => {
                    const result: Record<string, number[]> = {};
                    const metricsGetter = testCase.metrics
                        ? (metrics: TestCase['metrics']) => performance.getEntriesByType(metrics)
                        : () => performance.getEntries();
                    for (const variant of [testCase.control, testCase.variant]) {
                        if (variant.cookies) {
                            await context.clearCookies();
                            await context.addCookies(variant.cookies);
                        }
                        await gotoUrl(page, getUrl(testCase, variant));
                        result[variant.version] ||= [];
                        for (let i = 0; i < describe.iterations; i++) {
                            await testCase.setup(page);
                            const noise = (await waitFor(metricsGetter, page, { args: [testCase.metrics] })).length;
                            await testCase.actions(page);
                            (await waitFor(metricsGetter, page, { args: [testCase.metrics] }))
                                .slice(noise)
                                .map((pe) => result[variant.version].push(pe.duration));
                        }
                    }
                    const stats = Object.fromEntries(
                        Object.entries(result).map(([version, durations]) => [version, computeStats(durations)])
                    );
                    reportStats(stats);
                }
            );
        });
    });
}
