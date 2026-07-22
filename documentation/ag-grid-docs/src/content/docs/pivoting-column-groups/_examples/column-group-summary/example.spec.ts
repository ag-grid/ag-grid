import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework(
        'Each unique sport generates a pivot column group holding one child column per aggregated value',
        async ({ agIdFor, page }) => {
            await ensureGridReady(page);
            await waitForGridContent(page);

            // Pivot is on `sport`; groups appear in alphabetical order, so `Alpine Skiing` is leftmost.
            const alpineGroup = agIdFor.headerGroupCell('pivotGroup_sport_Alpine Skiing_0');
            await expect(alpineGroup).toBeVisible();
            await expect(alpineGroup).toContainText('Alpine Skiing');

            // The three aggregated value columns (gold, silver, bronze) become the group's child columns.
            await expect(agIdFor.headerCell('pivot_sport_Alpine Skiing_gold')).toContainText('Gold');
            await expect(agIdFor.headerCell('pivot_sport_Alpine Skiing_silver')).toContainText('Silver');
            await expect(agIdFor.headerCell('pivot_sport_Alpine Skiing_bronze')).toContainText('Bronze');
        }
    );
});
