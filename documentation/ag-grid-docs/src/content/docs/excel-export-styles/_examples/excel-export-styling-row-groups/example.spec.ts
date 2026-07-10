import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Row groups render their hierarchy', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Grouped by country -> year -> sport, fully expanded by default.
        await expect(agIdFor.autoGroupCell('row-group-country-United States')).toContainText('United States', {
            useInnerText: true,
        });
        await expect(agIdFor.autoGroupCell('row-group-country-United States-year-2008')).toContainText('2008', {
            useInnerText: true,
        });
    });

    test.eachFramework('Collapsing a country group hides its sub-groups', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const year2008 = agIdFor.autoGroupCell('row-group-country-United States-year-2008');
        await expect(year2008).toBeVisible();

        // Collapse the United States group.
        await agIdFor.autoGroupExpanded('row-group-country-United States').click();
        await expect(year2008).not.toBeVisible();

        // Re-expand and the sub-group returns.
        await agIdFor.autoGroupContracted('row-group-country-United States').click();
        await expect(year2008).toBeVisible();
    });
});
