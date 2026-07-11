import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('groups by a nested object field via valueGetter', async ({ page }) => {
        await waitForGridContent(page);

        const groupRow = (name: string) =>
            page
                .locator('.ag-row')
                .filter({ has: page.locator('.ag-group-value', { hasText: name }) })
                .first();

        // Country is a complex object { name, code }; the valueGetter 'data.country.name'
        // means groups display the plain country name, not "[object Object]".
        const usa = groupRow('United States');
        await expect(usa.locator('[col-id="ag-Grid-AutoColumn"]')).toContainText('United States', {
            useInnerText: true,
        });
        await expect(usa.locator('[col-id="ag-Grid-AutoColumn"]')).not.toContainText('[object Object]', {
            useInnerText: true,
        });

        // Aggregated medal totals are computed server-side for the group.
        await expect(usa.locator('.ag-cell[col-id="gold"]')).toContainText('552');
        await expect(groupRow('Russia')).toBeVisible();
    });
});
