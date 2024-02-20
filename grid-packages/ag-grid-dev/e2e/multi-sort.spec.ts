import { test, expect } from '@playwright/test';
import { getHeaderLocator, waitForCells } from './utils';

test('test multi sort', async ({ page }) => {
    await page.goto('/examples/row-sorting/multi-column/modules/vanilla/index.html');
    await waitForCells(page);

    expect(page.getByText('Athlete 2')).toBeVisible();
    expect(page.getByText('Country 1')).toBeVisible();

    const athleteHeaderCell = await getHeaderLocator(page, { colHeaderName: 'Athlete' });
    await athleteHeaderCell.click();

    const ageHeaderCell = await getHeaderLocator(page, { colHeaderName: 'Age' });
    await ageHeaderCell.click({
        modifiers: ['Meta'],
    });

    await expect(page.getByText('Athlete 1')).toBeVisible();
    await expect(page.getByText('Age 2')).toBeVisible();
});
