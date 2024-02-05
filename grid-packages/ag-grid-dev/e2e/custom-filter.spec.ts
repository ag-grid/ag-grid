import { test, expect } from '@playwright/test';
import { getCellHeaderLocator, getRowCount, goToAndWaitForData } from './utils';

test('test filtering', async ({ page }) => {
    await goToAndWaitForData(page,
        'https://grid-staging.ag-grid.com/examples/component-filter/custom-filter/modules/typescript/index.html'
    );
    

    expect(await getRowCount(page)).toBe(8618);

    const athleteColHeader = await getCellHeaderLocator(page, { colHeaderName: 'Athlete' });
    await athleteColHeader.locator('.ag-icon').first().click();

    await page.getByPlaceholder('Full name search...').click();
    await page.getByPlaceholder('Full name search...').fill('Missy');

    await expect(page.getByText('Missy Franklin')).toBeVisible();

    expect(await getRowCount(page)).toBe(2);
});