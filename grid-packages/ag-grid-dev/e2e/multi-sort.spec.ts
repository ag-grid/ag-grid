import { test, expect } from '@playwright/test';
import { getCellHeaderLocator, goToAndWaitForData } from './utils';

test('test multi sort', async ({ page }) => {
    await goToAndWaitForData(
        page,
        'https://grid-staging.ag-grid.com/examples/row-sorting/multi-column/modules/vanilla/index.html'
    );

    expect(page.getByText('Athlete 2')).toBeVisible();
    expect(page.getByText('Country 1')).toBeVisible();

    const athleteHeaderCell = await getCellHeaderLocator(page, { colHeaderName: 'Athlete' });
    await athleteHeaderCell.click();

    const ageHeaderCell = await getCellHeaderLocator(page, { colHeaderName: 'Age' });
    await ageHeaderCell.click({
        modifiers: ['Meta'],
    });

    await expect(page.getByText('Athlete 1')).toBeVisible();
    await expect(page.getByText('Age 2')).toBeVisible();
});
