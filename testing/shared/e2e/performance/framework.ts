import type { BrowserContext, Page } from '@playwright/test';
import { test } from '@playwright/test';

import { computeStats, gotoUrl, reportStats, waitFor } from '../../playwright.utils';

export type Framework = 'typescript' | 'reactFunctionalTs';
export type CustomVersion = `v${number}`;
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
    framework: Framework;
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

/** Generic benchmark function to run performance tests */
export default function (name: string, describe: Describe) {
    test.describe.configure({ timeout: describe.timeout || 3 * 60_000, mode: 'serial' });
    return test.describe(name, () => {
        describe.testCases.forEach((testCase) => {
            test(`Running ${testCase.name} with ${testCase.framework}`, async ({ page, context }) => {
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
            });
        });
    });
}
