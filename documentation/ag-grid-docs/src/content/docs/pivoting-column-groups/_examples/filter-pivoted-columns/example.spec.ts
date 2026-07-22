import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework(
        'Filtering a pivoted column removes its generated pivot column group rather than filtering rows',
        async ({ agIdFor, page }) => {
            await ensureGridReady(page);
            await waitForGridContent(page);

            // Pivot on `sport`; the leftmost (alphabetical) group is `Biathlon`.
            const biathlonGroup = agIdFor.headerGroupCell('pivotGroup_sport_Biathlon_0');
            await expect(biathlonGroup).toBeVisible();
            await expect(biathlonGroup).toContainText('Biathlon');

            // The Sport set filter is expanded in the Filters Tool Panel (onGridReady). Deselect `Biathlon`.
            const filterItem = agIdFor.setFilterInstanceItem(
                { source: 'filter-toolpanel', colLabel: 'Sport' },
                'Biathlon'
            );
            await expect(filterItem).toBeVisible();
            await filterItem.click();

            // Filtering the pivoted Sport column removes its pivot column group entirely.
            await expect(biathlonGroup).toHaveCount(0);

            // Other sport groups remain - the next alphabetical group is still present.
            await expect(agIdFor.headerGroupCell('pivotGroup_sport_Cross Country Skiing_0')).toBeVisible();
        }
    );
});
