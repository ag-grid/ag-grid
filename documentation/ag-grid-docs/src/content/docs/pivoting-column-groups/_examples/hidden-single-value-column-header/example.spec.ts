import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework(
        'removePivotHeaderRowWhenSingleValueColumn skips the group row and labels the leaf column with the pivot key',
        async ({ agIdFor, page }) => {
            await ensureGridReady(page);
            await waitForGridContent(page);

            const alpineLeaf = agIdFor.headerCell('pivot_sport_Alpine Skiing_gold');
            const alpineGroup = agIdFor.headerGroupCell('pivotGroup_sport_Alpine Skiing_0');

            // Checkbox starts checked: with a single value column the pivot group row is removed and the
            // leaf column is instead labelled with the pivot key (`Alpine Skiing`) rather than `Gold`.
            await expect(alpineLeaf).toBeVisible();
            await expect(alpineLeaf).toContainText('Alpine Skiing');
            await expect(alpineGroup).toHaveCount(0);

            // Toggle the option off - the pivot group row reappears and the leaf reverts to the value name.
            await page.locator('#removePivotHeaderRowWhenSingleValueColumn').click();

            await expect(alpineGroup).toBeVisible();
            await expect(alpineGroup).toContainText('Alpine Skiing');
            await expect(alpineLeaf).toContainText('Gold');
        }
    );
});
