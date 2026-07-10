import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

// Both grids share the same test IDs and the provided framework examples use different container
// markup, so scope value lookups to a specific grid by its DOM order (0 = top, 1 = bottom).
const grid = (page: any, index: number) => page.locator('.ag-root-wrapper').nth(index);

const topCell = (page: any, rowId: string, colId: string) =>
    grid(page, 0).locator(`.ag-row[row-id="${rowId}"] .ag-cell[col-id="${colId}"]`);

const topHeader = (page: any, colId: string) => grid(page, 0).locator(`.ag-header-cell[col-id="${colId}"]`);
const bottomHeader = (page: any, colId: string) => grid(page, 1).locator(`.ag-header-cell[col-id="${colId}"]`);

test.agExample(import.meta, () => {
    test.eachFramework('Both grids show the same data', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // First olympic winner: Michael Phelps, gold 8 + silver 0 + bronze 0 => total 8.
        await expect(topCell(page, '0', 'athlete')).toContainText('Michael Phelps');
        await expect(topCell(page, '0', 'total')).toContainText('8');
    });

    test.eachFramework('Hiding a column on one grid hides it on the aligned grid', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Athlete column is present in both grids initially.
        await expect(topHeader(page, 'athlete')).toBeVisible();
        await expect(bottomHeader(page, 'athlete')).toBeVisible();

        // Untick the Athlete checkbox (calls setColumnsVisible on the top grid only).
        const athleteCheckbox = page.locator('input[type="checkbox"]').first();
        await athleteCheckbox.uncheck();

        // The column is removed from BOTH grids because they are aligned.
        await expect(topHeader(page, 'athlete')).toHaveCount(0);
        await expect(bottomHeader(page, 'athlete')).toHaveCount(0);

        // Ticking it again restores the column on both grids.
        await athleteCheckbox.check();
        await expect(topHeader(page, 'athlete')).toBeVisible();
        await expect(bottomHeader(page, 'athlete')).toBeVisible();
    });
});
