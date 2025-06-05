import { test } from '@playwright/test';

import { computeStats, gotoAndGetComms, waitFor } from '../../playwright.utils';

test.describe.configure({ timeout: 10 * 60_000 });
const ITERATIONS = 10;

test.describe(`Performance Test - compare performance of setting data between current prod and staging: 'Lots of Cells'`, () => {
    test(`should load and compare performance between staging and prod, ${ITERATIONS} iterations`, async ({ page }) => {
        const pairsOfUrls = [
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
                    await gotoAndGetComms(page, url);
                    const noise = (await waitFor(() => performance.getEntriesByType('long-animation-frame'), page))
                        .length;

                    await page.getByText('Set Data').click();

                    await waitFor(() => page.textContent('body').then((text) => text.includes('Athlete')));
                    const durations = (await waitFor(() => performance.getEntriesByType('long-animation-frame'), page))
                        .slice(noise)
                        .map((pe) => pe.duration);

                    result[url].push(...durations);
                }
            }

            const stats = Object.fromEntries(
                Object.entries(result).map(([url, durations]) => [url, computeStats(durations)])
            );

            const diffPercent = ((stats[urls[0]].average - stats[urls[1]].average) / stats[urls[0]].average) * 100;
            console.log(`${urls[0]}:`, stats[urls[0]]);
            console.log(`${urls[1]}:`, stats[urls[1]]);
            console.log(`Difference: ${diffPercent.toFixed(2)}%`);
            if (diffPercent > 0) {
                console.log(`${urls[0]} was slower than ${urls[1]} by ${diffPercent.toFixed(2)}%`);
            } else if (diffPercent < 0) {
                console.log(`${urls[0]} was faster than ${urls[1]} by ${Math.abs(diffPercent).toFixed(2)}%`);
            } else {
                console.log(`${urls[0]} and ${urls[1]} had the same average performance`);
            }
        }
    });
});
