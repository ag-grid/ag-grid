import { expect, test } from '@playwright/test';

import { gotoAndGetComms, waitFor } from '../../playwright.utils';

const fw = process.env.FW_TYPE ?? 'Unknown';
const version = process.env.FW_VERSION ?? 'unknown';
const titleCaseFw = fw.charAt(0).toUpperCase() + fw.substring(1);
const variantTitle = process.env.FW_VARIANT ? `(${process.env.FW_VARIANT})` : '';

test.describe.configure({ timeout: 120_000 });
const ITERATIONS_FOR_AVERAGE = 10;
const SCROLLS_PER_ITERATION = 5;

test.describe(`${titleCaseFw} ${variantTitle} ${version}`, () => {
    test(`Load performance-test, set data, scroll ${SCROLLS_PER_ITERATION} times by 5000px, find slowest, repeat ${ITERATIONS_FOR_AVERAGE} times`, async ({
        page,
    }) => {
        const { consoleMsgs } = await gotoAndGetComms(page, '/examples/performance-test/lots-of-cells/typescript');
        const result = [];
        for (let i = 0; i < ITERATIONS_FOR_AVERAGE; i++) {
            await page.getByText('Set Data').click();
            await waitFor(() => consoleMsgs.filter((msg) => msg.text.includes('rowDataUpdated')).length >= 2);
            const noise = (await page.evaluate(() => performance.getEntriesByType('long-animation-frame'))).length;

            const grid = page.getByTestId('myGrid');
            const gridRect = await grid.boundingBox();

            await page.mouse.move(gridRect.x + gridRect.width / 2, gridRect.y + gridRect.height / 2);

            for (let j = 0; j < SCROLLS_PER_ITERATION; j++) {
                await page.mouse.wheel(0, 5000);
                await waitFor(50);
            }

            const eventPerf = (await page.evaluate(() => performance.getEntriesByType('long-animation-frame')))
                .slice(noise)
                .sort((a, b) => a.duration - b.duration)
                .pop();
            result.push(eventPerf);
            await page.reload({ waitUntil: 'networkidle' });
        }
        const avg = result.reduce((acc, entry) => acc + entry.duration, 0) / result.length;

        expect(avg).toBeLessThan(1000);
    });
});
