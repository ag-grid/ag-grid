import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Detail grids get different columns based on the master row', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // onFirstDataRendered expands rows at index 1 (Mila Smith) and index 2 (Evelyn Taylor).
        const detailRows = page.locator('.ag-details-row');
        await expect(detailRows).toHaveCount(2);

        // Mila Smith matches the name check, so her detail grid only has the {Call Id, Number} columns.
        const milaDetail = detailRows.nth(0);
        await expect(milaDetail.locator('.ag-header-cell-text')).toContainText(['Call Id', 'Number']);
        await expect(milaDetail.locator('.ag-header-cell-text')).toHaveCount(2);

        // Evelyn Taylor does not match, so her detail grid has the full column set.
        const evelynDetail = detailRows.nth(1);
        await expect(evelynDetail.locator('.ag-header-cell-text')).toContainText([
            'Call Id',
            'Direction',
            'Duration',
            'Switch Code',
        ]);
        await expect(evelynDetail.locator('.ag-header-cell-text')).toHaveCount(4);
    });
});
