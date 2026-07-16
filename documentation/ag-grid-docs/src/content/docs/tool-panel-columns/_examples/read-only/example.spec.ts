import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework(
        'functionsReadOnly prevents editing group / values / pivot via the GUI',
        async ({ agIdFor, page }) => {
            await waitForGridContent(page);

            // Grid starts read-only (checkbox ticked via onGridReady) and the Columns Tool Panel is present.
            await expect(page.locator('#read-only')).toBeChecked();
            await expect(page.locator('.ag-column-select')).toBeVisible();

            // The group / pivot / values panels display the configured columns.
            const rowGroups = agIdFor.columnDropArea('toolbar', 'Row Groups');
            const values = agIdFor.columnDropArea('toolbar', 'Values');
            const columnLabels = agIdFor.columnDropArea('toolbar', 'Column Labels');
            await expect(rowGroups.locator('.ag-column-drop-cell')).toHaveCount(2); // country, sport
            await expect(values.locator('.ag-column-drop-cell')).toHaveCount(2); // sum(silver), sum(bronze)
            await expect(columnLabels.locator('.ag-column-drop-cell')).toHaveCount(1); // year

            // While read-only, the remove ('cancel') buttons on the pills are hidden — no GUI edits allowed.
            await expect(page.locator('.ag-column-drop-cell-button:visible')).toHaveCount(0);

            // Unticking 'Functions Read Only' re-enables editing: the remove buttons become visible.
            await page.locator('#read-only').uncheck();
            await expect(rowGroups.locator('.ag-column-drop-cell-button').first()).toBeVisible();
        }
    );
});
