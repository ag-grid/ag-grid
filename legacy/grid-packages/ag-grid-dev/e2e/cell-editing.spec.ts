import { expect, test } from '@playwright/test';
import { waitForCells } from './utils';

test('test edit', async ({ page }) => {
    await page.goto(
        '/examples/value-parsers/example-parsers/modules/typescript/index.html'
    );
    await waitForCells(page);

    await page.getByRole('gridcell', { name: 'Apple' }).first().dblclick();
    await page.getByLabel('Input Editor').fill('Apple Edit');
    await page.getByLabel('Input Editor').press('Tab');
    await page.getByLabel('Input Editor').fill('1234');
    await page.getByLabel('Input Editor').press('Enter');
    await expect(page.getByRole('gridcell', { name: '1234' })).toBeVisible();
    await expect(page.getByRole('gridcell', { name: 'Apple Edit' })).toBeVisible();
});
