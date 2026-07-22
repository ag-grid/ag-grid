import { ensureGridReady, expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('row group panel uses the German locale', async ({ page }) => {
        await ensureGridReady(page);

        await expect(page.locator('.ag-column-drop-horizontal').first()).toContainText(
            'Ziehen Sie hierher, um Zeilengruppen festzulegen'
        );
    });

    test.eachFramework('status bar uses the German locale', async ({ page }) => {
        await ensureGridReady(page);

        await expect(page.locator('.ag-status-bar').first()).toContainText('Zeilen');
    });

    test.eachFramework('pagination panel uses the German locale', async ({ page }) => {
        await ensureGridReady(page);

        const pagingPanel = page.locator('.ag-paging-panel').first();
        await expect(pagingPanel).toContainText('Seitengröße:');
        await expect(pagingPanel).toContainText('Seite');
    });
});
