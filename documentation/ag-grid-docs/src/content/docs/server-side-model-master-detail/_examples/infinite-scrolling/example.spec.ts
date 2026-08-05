import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('First master row is expanded by default into a nested detail grid', async ({ page }) => {
        await waitForGridContent(page);

        // Master rows are individual accounts loaded lazily by the server-side row model.
        const masterRow = (name: string) =>
            page
                .locator('.ag-row')
                .filter({ has: page.locator('[col-id="name"]', { hasText: name }) })
                .first();

        // First account in the fake server dataset.
        await expect(masterRow('Liam Padberg')).toBeVisible();
        await expect(masterRow('Liam Padberg').locator('.ag-group-expanded').first()).toBeVisible();

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

    test.eachFramework('Master row collapses when the expanded icon is clicked', async ({ page }) => {
        await waitForGridContent(page);

        const masterRow = page
            .locator('.ag-row')
            .filter({ has: page.locator('[col-id="name"]', { hasText: 'Liam Padberg' }) })
            .first();

        await expect(masterRow.locator('.ag-group-expanded').first()).toBeVisible();
        await masterRow.locator('.ag-group-expanded').first().click();

        await expect(masterRow.locator('.ag-group-contracted').first()).toBeVisible();
        await expect(page.locator('.ag-details-row')).toHaveCount(0);
    });
});
