import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Master rows render account data with formatted minutes', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // First master row: Nora Thomas, account 177000, 24 calls, 25.65 minutes formatted as "25.65m".
        await expect(agIdFor.cell('0', 'name')).toContainText('Nora Thomas');
        await expect(agIdFor.cell('0', 'account')).toContainText('177000');
        await expect(agIdFor.cell('0', 'calls')).toContainText('24');
        await expect(agIdFor.cell('0', 'minutes')).toContainText('25.65m');

        // Last master row.
        await expect(agIdFor.cell('4', 'name')).toContainText('Addison Wilson');
    });

    test.eachFramework('Expanding a master row reveals its detail grid', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const detailRows = page.locator('.ag-details-row');

        // Detail content is not rendered until the master row is expanded.
        await expect(detailRows).toHaveCount(0);

        await agIdFor.groupContracted('0', 'name').click();

        // Nora Thomas's first call record (callId 555) is now visible in the detail grid.
        await expect(detailRows.first()).toBeVisible();
        await expect(detailRows.first()).toContainText('555');
    });
});
