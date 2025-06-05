import { test } from '@playwright/test';

import type { Variant } from '../../playwright.utils';
import { reportStats } from '../../playwright.utils';
import { computeStats, gotoAndGetComms, waitFor } from '../../playwright.utils';

test.describe.configure({ timeout: 15 * 60_000 });
const ITERATIONS = 50;

const frameworks = ['typescript', 'reactFunctionalTs'] as const;
const testCases: [Variant, Variant][] = [
    [
        { url: 'https://ag-grid.com/examples/performance-test/lots-of-cells/typescript/', version: 'prod' },
        {
            url: 'https://grid-staging.ag-grid.com/examples/performance-test/lots-of-cells/typescript/',
            version: 'staging',
        },
    ],
    [
        {
            url: 'https://ag-grid.com/examples/performance-test/lots-of-cells/reactFunctionalTs/',
            version: 'prod',
        },
        {
            url: 'https://grid-staging.ag-grid.com/examples/performance-test/lots-of-cells/reactFunctionalTs/',
            version: 'staging',
        },
    ],
    [
        { url: 'https://ag-grid.com/examples/performance-test/lots-of-cells/typescript/', version: 'prod' },
        { url: 'https://ag-grid.com/examples/performance-test/lots-of-cells/typescript/', version: 'prod' },
    ],
];

test.describe(`Performance Test - compare performance of setting data between current prod and staging: 'Lots of Cells'`, () => {
    test(`should load and compare performance between staging and prod, ${ITERATIONS} iterations`, async ({
        page,
        context,
    }) => {
        for (const variants of testCases) {
            const result: Record<string, number[]> = {};

            for (const { url, version } of variants) {
                result[version] ||= [];

                await gotoAndGetComms(page, url);
                for (let i = 0; i < ITERATIONS; i++) {
                    await context.clearCookies();
                    await context.addCookies([
                        {
                            name: 'paccept',
                            value: new Date().toISOString(),
                            domain: '.run.plnkr.co',
                            path: new URL(url).pathname,
                        },
                    ]);
                    await page.getByText('Clear').click();
                    const noise = (await waitFor(() => performance.getEntriesByType('long-animation-frame'), page))
                        .length;

                    await page.getByText('Set Data').click();
                    await waitFor(() => document.body.textContent.includes('Athlete'), page);
                    (await waitFor(() => performance.getEntriesByType('long-animation-frame'), page))
                        .slice(noise)
                        .map((pe) => result[version].push(pe.duration));
                }
            }

            const stats = Object.fromEntries(
                Object.entries(result).map(([version, durations]) => [version, computeStats(durations)])
            );

            reportStats(
                variants.map((e) => e.version),
                stats
            );
        }
    });
});
