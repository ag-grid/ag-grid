import { test, expect } from '@playwright/test';
import { getHeaderLocator, getRowCount, waitForCells } from './utils';
import { testAllFrameworks } from './example-utils';

testAllFrameworks(({ framework }) => {
    test('test filtering', async ({ page }) => {
        await page.goto(
            `/examples/component-filter/custom-filter/modules/${framework}/index.html`
        );
        await waitForCells(page);

        expect(await getRowCount(page)).toBe(8618);

        const athleteColHeader = await getHeaderLocator(page, { colHeaderName: 'Athlete' });
        await athleteColHeader.locator('.ag-icon').first().click();

        await page.getByPlaceholder('Full name search...').click();
        // await page.getByPlaceholder('Full name search...').fill('Missy'); Vue custom filter uses key up
        await page.getByPlaceholder('Full name search...').pressSequentially('Missy');

        await page.getByText('Missy Franklin').waitFor({ state: 'visible' });
        expect(await getRowCount(page)).toBe(2);
    });
});