import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Server-side row grouping loads groups and lazy-loads children', async ({ page }) => {
        await waitForGridContent(page);

        // Locate a group row by its displayed group value — robust to the positional
        // row-ids the SSRM assigns to group rows.
        const groupRow = (name: string) =>
            page
                .locator('.ag-row')
                .filter({ has: page.locator('.ag-group-value', { hasText: name }) })
                .first();

        // Top level is grouped by Country, with server-side aggregated medal totals.
        const usa = groupRow('United States');
        await expect(usa.locator('[col-id="ag-Grid-AutoColumn"]')).toContainText('United States', {
            useInnerText: true,
        });
        await expect(usa.locator('.ag-cell[col-id="gold"]')).toContainText('552');
        await expect(usa.locator('.ag-cell[col-id="silver"]')).toContainText('440');
        await expect(usa.locator('.ag-cell[col-id="bronze"]')).toContainText('320');
        await expect(groupRow('Russia')).toBeVisible();

        // Expanding a country lazy-loads the second group level (Sport) from the server.
        await usa.locator('.ag-group-contracted').first().click();
        await expect(groupRow('Swimming')).toBeVisible();
        await expect(groupRow('Swimming').locator('.ag-cell[col-id="gold"]')).toContainText('139');
    });
});
