import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Master rows render account data with formatted minutes', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // First master row: Nora Thomas, account 177000, 24 calls, minutes formatted with an "m" suffix.
        await expect(agIdFor.cell('0', 'name')).toContainText('Nora Thomas');
        await expect(agIdFor.cell('0', 'account')).toContainText('177000');
        await expect(agIdFor.cell('0', 'calls')).toContainText('24');
        await expect(agIdFor.cell('0', 'minutes')).toContainText('m');
    });

    test.eachFramework('Second master row is auto-expanded showing its detail grid', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // onFirstDataRendered expands the row at index 1, so exactly one detail grid renders on load.
        const detailRows = page.locator('.ag-details-row');
        await expect(detailRows).toHaveCount(1);
        await expect(detailRows.first()).toBeVisible();

        // The detail grid exposes the call-record columns defined in detailGridOptions.
        const detailHeaderText = detailRows.first().locator('.ag-header-cell-text');
        await expect(detailHeaderText).toContainText(['Call Id', 'Direction', 'Number', 'Duration', 'Switch Code']);

        // Duration values are formatted with an "s" suffix by the detail grid's valueFormatter.
        await expect(detailRows.first().locator('.ag-cell').first()).toBeVisible();
        await expect(detailRows.first()).toContainText('s');
    });

    test.eachFramework('Expanding another master row reveals a second detail grid', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const detailRows = page.locator('.ag-details-row');

        // Only the auto-expanded row's detail grid is present initially.
        await expect(detailRows).toHaveCount(1);

        // Expanding the first master row adds its own detail grid.
        await agIdFor.groupContracted('0', 'name').click();
        await expect(detailRows).toHaveCount(2);
    });
});
