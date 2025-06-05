import { test } from '@playwright/test';

import { computeStats, gotoAndGetComms, waitFor } from '../../playwright.utils';

test.describe.configure({ timeout: 15 * 60_000 });
const ITERATIONS = 50;

test.describe(`Performance Test - compare performance of setting data between current prod and staging: 'Lots of Cells'`, () => {
    test(`should load and compare performance between staging and prod, ${ITERATIONS} iterations`, async ({
        page,
        context,
    }) => {
        const pairsOfUrls: [string, string][] = [
            [
                'https://ag-grid.com/examples/performance-test/lots-of-cells/typescript/',
                'https://grid-staging.ag-grid.com/examples/performance-test/lots-of-cells/typescript/',
            ],
            [
                'https://ag-grid.com/examples/performance-test/lots-of-cells/reactFunctionalTs/',
                'https://grid-staging.ag-grid.com/examples/performance-test/lots-of-cells/reactFunctionalTs/',
            ],
            [
                'https://ag-grid.com/examples/performance-test/lots-of-cells/typescript/', // control vs control
                'https://ag-grid.com/examples/performance-test/lots-of-cells/typescript/',
            ],
            [
                'https://run.plnkr.co/preview/cmbjfxfbz00083b6ykx78g5r4/',
                'https://ag-grid.com/examples/performance-test/lots-of-cells/typescript/',
            ],
        ];

        for (const urls of pairsOfUrls) {
            const result: Record<string, number[]> = {};

            for (const url of urls) {
                result[url] ||= [];

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
                    await gotoAndGetComms(page, url);
                    const noise = (await waitFor(() => performance.getEntriesByType('long-animation-frame'), page))
                        .length;

                    await page.getByText('Set Data').click();
                    await waitFor(() => document.body.textContent.includes('Athlete'), page);
                    const durations = (await waitFor(() => performance.getEntriesByType('long-animation-frame'), page))
                        .slice(noise)
                        .map((pe) => pe.duration);

                    result[url].push(...durations);
                }
            }

            const stats = Object.fromEntries(
                Object.entries(result).map(([url, durations]) => {
                    const stats: {
                        average: number;
                        filteredCount: number;
                        marginOfError: number;
                        originalCount: number;
                        stdDev: number;
                    } = computeStats(durations);
                    return [url, stats];
                })
            );

            reportStats(urls, stats);
        }
    });
});

function reportStats<T extends string>(urls: [T, T], stats: Record<T, ReturnType<typeof computeStats>>) {
    const s1 = stats[urls[0]];
    const s2 = stats[urls[1]];

    // Calculate which is slower and by how much
    const diff = s1.average - s2.average;
    const slower = diff > 0 ? urls[0] : urls[1];
    const faster = diff > 0 ? urls[1] : urls[0];
    const percentDiff = (Math.abs(diff) / Math.min(s1.average, s2.average)) * 100;

    // Calculate average margin of error
    const marginOfError = ((s1.marginOfError + s2.marginOfError) / 2).toFixed(2);

    // Build message
    console.log(`${slower} is slower than ${faster} by ${percentDiff.toFixed(1)}% ± ${marginOfError}`);
    console.log(
        `${urls[0]} → avg: ${s1.average.toFixed(2)}ms ±${s1.marginOfError.toFixed(2)}, stdDev: ${s1.stdDev.toFixed(2)}, count: ${s1.filteredCount}/${s1.originalCount}`
    );
    console.log(
        `${urls[1]} → avg: ${s2.average.toFixed(2)}ms ±${s2.marginOfError.toFixed(2)}, stdDev: ${s2.stdDev.toFixed(2)}, count: ${s2.filteredCount}/${s2.originalCount}`
    );
}
