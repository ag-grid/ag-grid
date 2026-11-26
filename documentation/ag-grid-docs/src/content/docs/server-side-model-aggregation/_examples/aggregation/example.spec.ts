import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework(
        'Group rows show the aggregates the server returns under each value column',
        async ({ page }) => {
            await waitForGridContent(page);

            const groupRow = (name: string) =>
                page
                    .locator('.ag-row')
                    .filter({ has: page.locator('.ag-group-value', { hasText: name }) })
                    .first();

            // Gold and Silver are summed, Bronze uses max.
            const usa = groupRow('United States');
            await expect(usa.locator('.ag-cell[col-id="gold"]')).toContainText('552');
            await expect(usa.locator('.ag-cell[col-id="silver"]')).toContainText('440');
            await expect(usa.locator('.ag-cell[col-id="bronze"]')).toHaveText('3');

            // Expanding a country requests the next group level, aggregated the same way.
            await usa.locator('.ag-group-contracted').first().click();
            await expect(groupRow('Swimming').locator('.ag-cell[col-id="gold"]')).toContainText('139');
        }
    );
});
