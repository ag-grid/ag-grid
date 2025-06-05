import { expect, test } from '@playwright/test';

import { gotoAndGetComms, waitFor } from '../../playwright.utils';

test.describe.configure({ timeout: 120_000 });
const ITERATIONS_FOR_AVERAGE = 10;

test.describe(`Performance Test - compare performance of setting data between current prod and staging: 'Lots of Cells, Typescript'`, () => {
    test(`should load and compare performance between staging and prod, ${ITERATIONS_FOR_AVERAGE} iterations`, async ({
        page,
    }) => {
        const result: Record<string, PerformanceEntryList> = {};
        const urls = [
            'https://ag-grid.com/examples/performance-test/lots-of-cells/typescript/',
            'https://grid-staging.ag-grid.com/examples/performance-test/lots-of-cells/typescript/',
        ];
        for (const url of urls) {
            result[url] ||= [];
            await gotoAndGetComms(page, url);
            for (let i = 0; i < ITERATIONS_FOR_AVERAGE; i++) {
                const noise = (await waitFor(() => performance.getEntries())).length;

                page.getByText('Set Data').click();
                await waitFor(() =>
                    page.textContent('.ag-body-viewport').then((text) => !text.includes('No Rows To Show'))
                );
                await waitFor(() => performance.getEntries(), page);

                const eventPerf = (await waitFor(() => performance.getEntries(), page))
                    .slice(noise)
                    .sort((a: any, b: any) => a.duration - b.duration)
                    .pop();
                result[url].push(eventPerf);
                await page.reload({ waitUntil: 'networkidle' });
            }
        }
        const avgs = Object.entries(result).reduce((acc, [url, entries]) => {
            const totalDuration = entries.reduce((sum, entry) => sum + entry.duration, 0);
            acc[url] = Math.round(totalDuration / entries.length);
            return acc;
        }, {});
        const diffPercent = ((avgs[urls[0]] - avgs[urls[1]]) / avgs[urls[0]]) * 100;
        console.log(`${urls[0]} is ${avgs[urls[0]]}ms, ${urls[1]} is ${avgs[urls[1]]}ms`);
        expect(diffPercent).toBeLessThan(100);
    });
});
