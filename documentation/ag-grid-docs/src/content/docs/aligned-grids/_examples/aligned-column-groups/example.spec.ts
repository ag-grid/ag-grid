import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

// Both grids share the same test IDs and the provided framework examples use different container
// markup, so scope value lookups to a specific grid by its DOM order (0 = top, 1 = bottom).
const grid = (page: any, index: number) => page.locator('.ag-root-wrapper').nth(index);

const topCell = (page: any, rowId: string, colId: string) =>
    grid(page, 0).locator(`.ag-row[row-id="${rowId}"] .ag-cell[col-id="${colId}"]`);
const bottomCell = (page: any, rowId: string, colId: string) =>
    grid(page, 1).locator(`.ag-row[row-id="${rowId}"] .ag-cell[col-id="${colId}"]`);

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
        await expect(grid(page, 0).locator('.ag-header-cell[col-id="age"]')).toHaveCount(0);
        await expect(grid(page, 1).locator('.ag-header-cell[col-id="age"]')).toHaveCount(0);

        // Open Group 1 on the top grid by clicking its expand icon.
        const group1 = grid(page, 0).locator('.ag-header-group-cell').filter({ hasText: 'Group 1' }).first();
        await group1.locator('.ag-header-expand-icon-collapsed').first().click();

        // The 'open' columns now appear on the top grid, with Michael Phelps' age of 23.
        await expect(grid(page, 0).locator('.ag-header-cell[col-id="age"]').first()).toBeVisible();
        await expect(topCell(page, '0', 'age').first()).toContainText('23');

        // Group alignment: the same group opens on the bottom grid too.
        await expect(grid(page, 1).locator('.ag-header-cell[col-id="age"]').first()).toBeVisible();
    });
});
