import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

// Both grids share the same test IDs, so scope value lookups to a specific grid via its container id.
const topCell = (page: any, rowId: string, colId: string) =>
    page.locator(`#myGridTop .ag-row[row-id="${rowId}"] .ag-cell[col-id="${colId}"]`);

const topHeader = (page: any, colId: string) => page.locator(`#myGridTop .ag-header-cell[col-id="${colId}"]`);
const bottomHeader = (page: any, colId: string) => page.locator(`#myGridBottom .ag-header-cell[col-id="${colId}"]`);

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
