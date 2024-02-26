import { test, expect } from '@playwright/test';
import { getHeaderLocator, getRowContents, getRowCount, waitForCells } from './utils';

test.beforeEach('do login', async ({ page }) => {
    console.log('beforeEach');
    // Listen for all console events and handle errors
    page.on('console', (msg) => {
        if (msg.type() === 'error') {
            console.error(msg.text());
            throw new Error(msg.text());
        }
        if (msg.type() === 'warning') {
            console.warn(msg.text());
            throw new Error(msg.text());
        }
    });
});

test.skip('fail on error', async ({ page }) => {
    await page.goto('https://run.plnkr.co/preview/cls8z0de100093b6wyzjwsoua/');

    // get dismessed button
    await page.getByRole('button', { name: 'Proceed' }).click();

    await expect(page.getByRole('columnheader', { name: 'Silver' })).toBeVisible();
    await expect(getHeaderLocator(page, { colHeaderName: 'Silver' })).toBeVisible();
    await page.locator('.ag-overlay').first().waitFor({ state: 'hidden' });
});
