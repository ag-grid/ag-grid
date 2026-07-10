import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Groups by country then athlete', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // country is the outer group (rowGroupIndex 0); United States leads the unsorted grouping.
        await expect(agIdFor.autoGroupCell('row-group-country-United States')).toContainText('United States', {
            useInnerText: true,
        });
    });

    test.eachFramework('Expanding a country reveals its athlete sub-groups', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const michaelPhelps = page
            .locator('.ag-row')
            .filter({ has: page.locator('.ag-group-value', { hasText: 'Michael Phelps' }) })
            .first();
        await expect(michaelPhelps).not.toBeVisible();

        await agIdFor.autoGroupContracted('row-group-country-United States').click();
        await expect(michaelPhelps).toBeVisible();
    });
});
