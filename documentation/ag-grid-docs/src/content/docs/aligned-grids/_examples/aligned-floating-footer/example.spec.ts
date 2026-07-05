import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

// Both grids share the same test IDs, so scope value lookups to a specific grid via its container id.
const topCell = (page: any, rowId: string, colId: string) =>
    page.locator(`#myGridTop .ag-row[row-id="${rowId}"] .ag-cell[col-id="${colId}"]`);
const bottomCell = (page: any, rowId: string, colId: string) =>
    page.locator(`#myGridBottom .ag-row[row-id="${rowId}"] .ag-cell[col-id="${colId}"]`);

test.agExample(import.meta, () => {
    test.eachFramework('Top grid shows data and bottom grid shows the summary footer', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Top grid: first olympic winner Michael Phelps, total 8.
        await expect(topCell(page, '0', 'athlete')).toContainText('Michael Phelps');
        await expect(topCell(page, '0', 'total')).toContainText('8');

        // Bottom grid: hard-coded summary row. total = gold 55 + silver 65 + bronze 12 = 132.
        await expect(bottomCell(page, '0', 'athlete')).toContainText('Total');
        await expect(bottomCell(page, '0', 'country')).toContainText('Ireland');
        await expect(bottomCell(page, '0', 'total')).toContainText('132');
    });

    test.eachFramework('Bottom footer grid has its header suppressed', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // headerHeight: 0 on the bottom grid collapses the header, so its cells have no visible height.
        await expect(page.locator('#myGridBottom .ag-header-cell[col-id="total"]')).not.toBeVisible();
        // The top grid keeps its header.
        await expect(page.locator('#myGridTop .ag-header-cell[col-id="total"]')).toBeVisible();
    });

    test.eachFramework('Sorting the top grid reorders its rows independently of the footer', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const phelpsRow = page.locator('#myGridTop .ag-row[row-id="0"]');
        await expect(phelpsRow).toHaveAttribute('row-index', '0');

        // Sort ascending by total: Michael Phelps (max total 8) falls away from the top.
        await page.locator('#myGridTop .ag-header-cell[col-id="total"]').click();
        await expect(phelpsRow).not.toHaveAttribute('row-index', '0');

        // The bottom footer row is independent data and remains its summary total.
        await expect(bottomCell(page, '0', 'total')).toContainText('132');
    });
});
