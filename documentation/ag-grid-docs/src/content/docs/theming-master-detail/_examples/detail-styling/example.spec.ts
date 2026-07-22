import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Auto-expanded detail grid renders call-record columns', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // onFirstDataRendered expands the row at index 1, so exactly one detail grid renders on load.
        const detailRows = page.locator('.ag-details-row');
        await expect(detailRows).toHaveCount(1);
        await expect(detailRows.first()).toBeVisible();

        const detailHeader = detailRows.first().locator('.ag-header-cell-text');
        await expect(detailHeader).toContainText(['Call Id', 'Direction', 'Number', 'Duration', 'Switch Code']);
    });

    test.eachFramework('.ag-details-row receives the documented background and padding', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const detailRow = page.locator('.ag-details-row').first();
        await expect(detailRow).toBeVisible();

        // styles.css: background: #f442 (rgba(255, 68, 68, 0.133...)) and padding: 5px 5px 5px 40px.
        await expect(detailRow).toHaveCSS('background-color', 'rgba(255, 68, 68, 0.133)');
        await expect(detailRow).toHaveCSS('padding', '5px 5px 5px 40px');
    });

    test.eachFramework('.ag-details-grid header cells are styled orange and bold', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // styles.css: .ag-details-grid .ag-header-cell { color: #f80; font-weight: bold; }
        const detailHeaderCell = page.locator('.ag-details-grid .ag-header-cell').first();
        await expect(detailHeaderCell).toBeVisible();
        await expect(detailHeaderCell).toHaveCSS('color', 'rgb(255, 136, 0)');
        await expect(detailHeaderCell).toHaveCSS('font-weight', '700');
    });
});
