import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

// The rows arrive from a fetch. These assertions only need the grid chrome, but leaving that load
// in flight lets teardown destroy the grid before it resolves, and the example then calls
// `setGridOption` on a destroyed grid - so each test waits for the rows before asserting.
test.agExample(import.meta, () => {
    test.eachFramework('row group panel uses the German locale', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await expect(page.locator('.ag-column-drop-horizontal').first()).toContainText(
            'Ziehen Sie hierher, um Zeilengruppen festzulegen'
        );
    });

    test.eachFramework('status bar uses the German locale', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await expect(page.locator('.ag-status-bar').first()).toContainText('Zeilen');
    });

    test.eachFramework('pagination panel uses the German locale', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const pagingPanel = page.locator('.ag-paging-panel').first();
        await expect(pagingPanel).toContainText('Seitengröße:');
        await expect(pagingPanel).toContainText('Seite');
    });
});
