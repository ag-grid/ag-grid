import { ensureGridReady, expect, test } from '@utils/grid/test-utils';

// This example merges the German locale and prefixes every value with 'zzz-'
// (leaving thousand/decimal separators untouched) to show customising a provided locale.
test.agExample(import.meta, () => {
    test.eachFramework('row group panel uses the customised zzz- locale', async ({ page }) => {
        await ensureGridReady(page);

        await expect(page.locator('.ag-column-drop-horizontal').first()).toContainText(
            'zzz-Ziehen Sie hierher, um Zeilengruppen festzulegen'
        );
    });

    test.eachFramework('status bar uses the customised zzz- locale', async ({ page }) => {
        await ensureGridReady(page);

        await expect(page.locator('.ag-status-bar').first()).toContainText('zzz-Zeilen');
    });

    test.eachFramework('pagination panel uses the customised zzz- locale', async ({ page }) => {
        await ensureGridReady(page);

        await expect(page.locator('.ag-paging-panel').first()).toContainText('zzz-Seitengröße:');
    });
});
