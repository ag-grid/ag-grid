import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

// The getLocaleText callback returns each default (English) value in upper case,
// so every piece of grid chrome should render the uppercased default string.

// The rows arrive from a fetch. These assertions only need the grid chrome, but leaving that load
// in flight lets teardown destroy the grid before it resolves, and the example then calls
// `setGridOption` on a destroyed grid - so each test waits for the rows before asserting.
test.agExample(import.meta, () => {
    test.eachFramework('row group panel uses the getLocaleText callback', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await expect(page.locator('.ag-column-drop-horizontal').first()).toContainText('DRAG HERE TO SET ROW GROUPS');
    });

    test.eachFramework('status bar uses the getLocaleText callback', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await expect(page.locator('.ag-status-bar').first()).toContainText('ROWS');
    });

    test.eachFramework('pagination panel uses the getLocaleText callback', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const pagingPanel = page.locator('.ag-paging-panel').first();
        await expect(pagingPanel).toContainText('PAGE SIZE:');
        await expect(pagingPanel).toContainText('PAGE');
    });
});
