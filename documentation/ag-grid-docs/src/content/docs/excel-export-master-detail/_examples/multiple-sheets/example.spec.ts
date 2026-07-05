import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Master rows render account data with formatted minutes', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // getRowId returns the account name, so rows are keyed by name.
        await expect(agIdFor.cell('Nora Thomas', 'account')).toContainText('177000');
        await expect(agIdFor.cell('Nora Thomas', 'calls')).toContainText('24');
        await expect(agIdFor.cell('Nora Thomas', 'minutes')).toContainText('25.65m');
        await expect(agIdFor.cell('Addison Wilson', 'account')).toContainText('177004');
    });

    test.eachFramework('Detail grids are expanded by default and collapse on toggle', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const detailRows = page.locator('.ag-details-row');

        // groupDefaultExpanded / onFirstDataRendered expands every master row, so all 5 detail grids are shown.
        await expect(detailRows).toHaveCount(5);
        await expect(detailRows.first()).toContainText('555'); // Nora Thomas's first call record.

        // Collapsing a master row removes its detail grid.
        await agIdFor.groupExpanded('Nora Thomas', 'name').click();
        await expect(detailRows).toHaveCount(4);
    });
});
