import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Expanding a country group then a leaf account reveals its detail grid', async ({ page }) => {
        await waitForGridContent(page);

        // Top level is grouped by Country on the server.
        const groupRow = (name: string) =>
            page
                .locator('.ag-row')
                .filter({ has: page.locator('.ag-group-value', { hasText: name }) })
                .first();

        await expect(groupRow('Turkey')).toBeVisible();

        // Expand the country group to lazy-load its account (leaf) rows.
        await groupRow('Turkey').locator('.ag-group-contracted').first().click();

        // Leaf account rows appear under the country.
        const leafRow = page
            .locator('.ag-row')
            .filter({ has: page.locator('[col-id="name"]', { hasText: 'Liam Padberg' }) })
            .first();
        await expect(leafRow).toBeVisible();

        // Expand the leaf account's master/detail row.
        await leafRow.locator('.ag-group-contracted').first().click();

        // The detail grid renders the account's call records (first callId for Liam is 2000).
        const detail = page
            .locator('.ag-details-row')
            .filter({ has: page.locator('[col-id="callId"]', { hasText: '2000' }) })
            .first();
        await expect(detail).toBeVisible();
        await expect(detail.locator('.ag-root-wrapper')).toBeVisible();
        await expect(detail.locator('.ag-row').first()).toBeVisible();
    });
});
