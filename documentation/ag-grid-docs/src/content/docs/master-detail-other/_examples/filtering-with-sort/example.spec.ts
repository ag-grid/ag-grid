import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Master and detail grids each render with their own columns', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // The auto-expanded row (index 1) shows exactly one detail grid on load.
        const detailRows = page.locator('.ag-details-row');
        await expect(detailRows).toHaveCount(1);

        // Detail grid exposes its own call-record columns, independent of the master columns.
        const detailHeader = detailRows.first().locator('.ag-header-cell-text');
        await expect(detailHeader).toContainText(['Call Id', 'Direction', 'Number', 'Duration', 'Switch Code']);
    });

    test.eachFramework('Sorting the master grid is applied independently', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Clicking a master header sorts that grid; the header advertises its sort state.
        const callsHeader = agIdFor.headerCell('calls');
        await callsHeader.click();
        await expect(callsHeader).toHaveAttribute('aria-sort', 'ascending');

        // Clicking again toggles to descending, confirming the master grid sorts independently.
        await callsHeader.click();
        await expect(callsHeader).toHaveAttribute('aria-sort', 'descending');
    });

    test.eachFramework('Detail grid headers are independently sortable', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const detailRows = page.locator('.ag-details-row');
        await expect(detailRows).toHaveCount(1);

        // Sorting a detail column only affects the detail grid, not the master grid.
        const detailDurationHeader = detailRows
            .first()
            .locator('.ag-header-cell')
            .filter({ hasText: 'Duration' })
            .first();
        await detailDurationHeader.click();
        await expect(detailDurationHeader).toHaveAttribute('aria-sort', 'ascending');
    });
});
