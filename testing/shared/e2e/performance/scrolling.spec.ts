import { expect, test } from '@playwright/test';

import { computeStats, gotoAndGetComms, waitFor } from '../../playwright.utils';

test.describe.configure({ timeout: 120_000 });
const ITERATIONS_FOR_AVERAGE = 10;

test.describe(`Performance Test - compare performance of setting data between current prod and staging: 'Lots of Cells'`, () => {
    test(`should load and compare performance between staging and prod, ${ITERATIONS_FOR_AVERAGE} iterations`, async ({
        page,
    }) => {
        const pairsOfUrls = [
            [
                'https://ag-grid.com/examples/performance-test/lots-of-cells/typescript/',
                'https://grid-staging.ag-grid.com/examples/performance-test/lots-of-cells/typescript/',
            ],
            [
                'https://ag-grid.com/examples/performance-test/lots-of-cells/reactFunctionalTs/',
                'https://grid-staging.ag-grid.com/examples/performance-test/lots-of-cells/reactFunctionalTs/',
            ],
        ];

        for (const urls of pairsOfUrls) {
            const result: Record<string, number[]> = {};

            for (const url of urls) {
                result[url] ||= [];

                await gotoAndGetComms(page, url);

                for (let i = 0; i < ITERATIONS_FOR_AVERAGE; i++) {
                    const noise = (await waitFor(() => performance.getEntriesByType('long-animation-frame'), page))
                        .length;

                    void page.getByText('Set Data').click();

                    await waitFor(() =>
                        page.textContent('.ag-body-viewport').then((text) => !text.includes('No Rows To Show'))
                    );
                    const durations = (await waitFor(() => performance.getEntriesByType('long-animation-frame'), page))
                        .slice(noise)
                        .map((pe) => pe.duration);

                    result[url].push(...durations);
                    await page.reload({ waitUntil: 'networkidle' });
                }
            }

            const stats = Object.fromEntries(
                Object.entries(result).map(([url, durations]) => [url, computeStats(durations)])
            );

            const diffPercent = ((stats[urls[0]].average - stats[urls[1]].average) / stats[urls[0]].average) * 100;
            console.log(`${urls[0]}:`, stats[urls[0]]);
            console.log(`${urls[1]}:`, stats[urls[1]]);
            console.log(`Difference: ${diffPercent.toFixed(2)}%`);
            expect(diffPercent).toBeLessThan(5);
        }
    });
});
