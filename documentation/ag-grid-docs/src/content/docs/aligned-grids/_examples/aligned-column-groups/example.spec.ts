import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

// Both grids share the same test IDs, so scope value lookups to a specific grid via its container id.
const topCell = (page: any, rowId: string, colId: string) =>
    page.locator(`#myGridTop .ag-row[row-id="${rowId}"] .ag-cell[col-id="${colId}"]`);
const bottomCell = (page: any, rowId: string, colId: string) =>
    page.locator(`#myGridBottom .ag-row[row-id="${rowId}"] .ag-cell[col-id="${colId}"]`);

test.agExample(import.meta, () => {
    test.eachFramework('Closed groups show only their base columns in both grids', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // First olympic winner: Michael Phelps, United States, 24/08/2008.
        await expect(topCell(page, '0', 'athlete')).toContainText('Michael Phelps');
        await expect(topCell(page, '0', 'country')).toContainText('United States');
        await expect(topCell(page, '0', 'date')).toContainText('24/08/2008');
        await expect(bottomCell(page, '0', 'athlete')).toContainText('Michael Phelps');

        // columnGroupShow: 'open' columns (age, year, sport) are hidden while the groups are closed.
        await expect(topCell(page, '0', 'age')).toHaveCount(0);
    });

    test.eachFramework('Opening a split group reveals its open-only columns in both grids', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Age column is hidden while Group 1 is collapsed.
        await expect(page.locator('#myGridTop .ag-header-cell[col-id="age"]')).toHaveCount(0);
        await expect(page.locator('#myGridBottom .ag-header-cell[col-id="age"]')).toHaveCount(0);

        // Open Group 1 on the top grid by clicking its expand icon.
        const group1 = page.locator('#myGridTop .ag-header-group-cell').filter({ hasText: 'Group 1' }).first();
        await group1.locator('.ag-header-expand-icon-collapsed').first().click();

        // The 'open' columns now appear on the top grid, with Michael Phelps' age of 23.
        await expect(page.locator('#myGridTop .ag-header-cell[col-id="age"]').first()).toBeVisible();
        await expect(topCell(page, '0', 'age').first()).toContainText('23');

        // Group alignment: the same group opens on the bottom grid too.
        await expect(page.locator('#myGridBottom .ag-header-cell[col-id="age"]').first()).toBeVisible();
    });
});
