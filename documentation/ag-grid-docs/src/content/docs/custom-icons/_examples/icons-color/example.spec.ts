import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Groups by country over the olympic-winners data', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // United States is the first data row, so its group leads the (unsorted) grouping.
        await expect(agIdFor.autoGroupCell('row-group-country-United States')).toContainText('United States', {
            useInnerText: true,
        });
    });

    test.eachFramework('Expanding a country group reveals its leaf rows', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Leaf row 0 (Michael Phelps, United States) is hidden until the group is expanded.
        await expect(agIdFor.cell('0', 'athlete')).not.toBeVisible();
        await agIdFor.autoGroupContracted('row-group-country-United States').click();
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');
    });
});
