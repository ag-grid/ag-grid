import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Master row expands to a nested detail grid of call records', async ({ page }) => {
        await waitForGridContent(page);

        // Master rows are individual accounts loaded lazily by the server-side row model.
        const masterRow = (name: string) =>
            page
                .locator('.ag-row')
                .filter({ has: page.locator('[col-id="name"]', { hasText: name }) })
                .first();

        // First account in the fake server dataset.
        await expect(masterRow('Liam Padberg')).toBeVisible();

        // Expand the master row via the group cell renderer icon on the accountId column.
        await masterRow('Liam Padberg').locator('.ag-group-contracted').first().click();

        // The detail grid renders as a nested grid inside the details row, showing the
        // account's call records (first record for Liam Padberg has callId 2000, direction IN).
        const detail = page
            .locator('.ag-details-row')
            .filter({ has: page.locator('[col-id="callId"]', { hasText: '2000' }) })
            .first();
        await expect(detail).toBeVisible();
        await expect(detail.locator('.ag-root-wrapper')).toBeVisible();
        await expect(detail.locator('.ag-row').first()).toBeVisible();
        await expect(detail.locator('.ag-cell[col-id="direction"]').first()).toContainText('IN');
    });
});
