import { expect, test } from '@playwright/test';

import { gotoAndGetComms, waitFor } from '../../playwright.utils';

const fw = process.env.FW_TYPE ?? 'Unknown';
const version = process.env.FW_VERSION ?? 'unknown';
const titleCaseFw = fw.charAt(0).toUpperCase() + fw.substring(1);
const variantTitle = process.env.FW_VARIANT ? `(${process.env.FW_VARIANT})` : '';

test.describe(`${titleCaseFw} ${variantTitle} ${version}`, () => {
    test('load performance-test, set data, scroll a few times, measure score', async ({ page }) => {
        const { consoleMsgs } = await gotoAndGetComms(page, '/javascript-data-grid/performance-test');

        const frame = page.frameLocator('#loading-frame-performance-test-lots-of-cells');

        await frame
            .owner()
            .page()
            .evaluate(() => {
                window.addEventListener('gridReady', (...args) => console.log(...args));
            });
        await frame.getByText('Set Data').click({ force: true });
        await waitFor(() => consoleMsgs.filter((msg) => msg.text.includes('rowDataUpdated')).length >= 2);
        for (let i = 0; i < 5; i++) {
            await frame.getByText('Scroll').click({ force: true });
            await waitFor(() => consoleMsgs.filter((msg) => msg.text.includes('bodyScrollEnd')).length >= i + 1);
        }

        const predicate = (msg) => msg.text.includes('Time taken:');
        await waitFor(() => consoleMsgs.filter(predicate).length >= 3);
        const msgs = (await waitFor(() => consoleMsgs.filter(predicate))) as typeof consoleMsgs;
        expect(msgs.every(({ args: [_, timing] }) => timing < 2000)).toBeTruthy();
    });
});
