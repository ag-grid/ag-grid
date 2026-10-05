import { expect, test } from '@playwright/test';

import { mountGrid } from '../src/mountGrid';

test.describe('enterprise grid in a real browser', () => {
    test('clicking a row group expands it and the arrow keys then move through its children', async ({ page }) => {
        const { cell, grid } = await mountGrid(page, {
            enterprise: true,
            options: () => ({
                columnDefs: [
                    { field: 'country', rowGroup: true, hide: true },
                    { field: 'athlete' },
                    { field: 'gold', aggFunc: 'sum' },
                ],
                autoGroupColumnDef: { headerName: 'Country' },
                rowData: [
                    { country: 'Ireland', athlete: 'Katie Taylor', gold: 1 },
                    { country: 'Ireland', athlete: 'Kellie Harrington', gold: 1 },
                    { country: 'Norway', athlete: 'Karsten Warholm', gold: 1 },
                ],
            }),
        });

        const contractedGroups = grid.locator('.ag-group-contracted');
        await expect(contractedGroups).toHaveCount(2);
        await expect(grid.getByText('Katie Taylor')).toHaveCount(0);

        await contractedGroups.first().click();
        await expect(grid.getByText('Katie Taylor')).toBeVisible();
        await expect(grid.getByText('Kellie Harrington')).toBeVisible();

        await cell(1, 'athlete').click();
        await page.keyboard.press('ArrowDown');
        await expect(cell(2, 'athlete')).toHaveClass(/ag-cell-focus/);
        await expect(cell(2, 'athlete')).toHaveText('Kellie Harrington');
    });
});
