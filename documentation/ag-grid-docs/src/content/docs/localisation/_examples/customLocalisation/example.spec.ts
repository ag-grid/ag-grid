import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

// This example merges the German locale and prefixes every value with 'zzz-'
// (leaving thousand/decimal separators untouched) to show customising a provided locale.

// The rows arrive from a fetch. These assertions only need the grid chrome, but leaving that load
// in flight lets teardown destroy the grid before it resolves, and the example then calls
// `setGridOption` on a destroyed grid - so each test waits for the rows before asserting.
test.agExample(import.meta, () => {
    test.eachFramework('row group panel uses the customised zzz- locale', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await expect(page.locator('.ag-column-drop-horizontal').first()).toContainText(
            'zzz-Ziehen Sie hierher, um Zeilengruppen festzulegen'
        );
    });

    test.eachFramework('status bar uses the customised zzz- locale', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await expect(page.locator('.ag-status-bar').first()).toContainText('zzz-Zeilen');
    });

    test.eachFramework('pagination panel uses the customised zzz- locale', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await expect(page.locator('.ag-paging-panel').first()).toContainText('zzz-Seitengröße:');
    });
});
