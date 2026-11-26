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

        // Top level is grouped by Country; no column is aggregated, so group rows hold only their key.
        const usa = groupRow('United States');
        await expect(usa.locator('[col-id="ag-Grid-AutoColumn"]')).toContainText('United States', {
            useInnerText: true,
        });
        await expect(usa.locator('.ag-cell[col-id="gold"]')).toHaveText('');
        await expect(groupRow('Russia')).toBeVisible();

        // Expanding a country lazy-loads the second group level (Sport) from the server.
        await usa.locator('.ag-group-contracted').first().click();
        const swimming = groupRow('Swimming');
        await expect(swimming).toBeVisible();

        // Expanding the last group level loads the leaf rows, shown by athlete in the group column.
        await swimming.locator('.ag-group-contracted').first().click();
        await expect(page.locator('.ag-row-level-2').filter({ hasText: 'Michael Phelps' }).first()).toBeVisible();
    });
});
