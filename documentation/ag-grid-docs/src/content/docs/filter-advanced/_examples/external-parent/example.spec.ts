import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('should render advanced filter in external parent above the grid', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Advanced filter should be rendered in the external parent (#advancedFilterParent)
        const externalParent = page.locator('#advancedFilterParent');
        const filterInput = externalParent.locator('.ag-advanced-filter input[type=text]');
        await expect(filterInput).toBeVisible();

        // The grid should not have the filter in its own header area
        const gridFilter = page.locator('#myGrid .ag-header .ag-advanced-filter');
        await expect(gridFilter).toHaveCount(0);
    });

    test.eachFramework('should filter rows when expression typed in external filter', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Before filtering: verify non-Phelps athletes are visible
        const athleteCells = page.locator('.ag-row [col-id="athlete"]');
        const athletesBefore = await athleteCells.allTextContents();
        const hasNonPhelps = athletesBefore.some((name) => !name.toLowerCase().includes('phelps'));
        expect(hasNonPhelps).toBe(true);

        // Type expression and apply via Apply button
        const filterInput = page.locator('.ag-advanced-filter input[type=text]');
        await filterInput.fill('[Athlete] contains "phelps"');
        await page.keyboard.press('Escape');
        await page.locator('.ag-advanced-filter-buttons').getByText('Apply').click();

        // Phelps rows remain and every other athlete goes. Both conditions are checked inside one
        // retry so they describe the same render: separately, the emptiness check passes during a
        // transitional empty grid and the non-empty check then passes for rows nothing vetted.
        await expect(async () => {
            await expect(athleteCells).not.toHaveCount(0);
            await expect(athleteCells.filter({ hasNotText: /phelps/i })).toHaveCount(0);
        }).toPass();
    });
});
