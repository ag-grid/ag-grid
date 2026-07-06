import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('displays the olympic winners source data', async ({ agIdFor }) => {
        // getRowId uses the injected id, so the first row has id '0': Michael Phelps.
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');
        await expect(agIdFor.cell('0', 'total')).toContainText('8');
    });

    test.eachFramework('Read-only edit updates the grid via the application store', async ({ agIdFor, page }) => {
        const cell = agIdFor.cell('0', 'athlete');

        // In readOnlyEdit mode the grid fires cellEditRequest; the app updates rowData,
        // so the committed value is reflected back through the immutable store.
        await cell.dblclick();
        const input = page.locator('.ag-cell-inline-editing input.ag-input-field-input').first();
        await expect(input).toBeVisible();
        await input.fill('Jane Doe');
        await input.press('Enter');

        await expect(cell).toContainText('Jane Doe');
    });
});
