import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

// gold has cellStyle backgroundColor #f2e287 (rgb(242, 226, 135)); silver has an empty cellStyle object.
// processPivotResultColDef mutates the (object) cellStyle to add color #2f73ff (rgb(47, 115, 255)).
// Both properties are inherited by every generated pivot result column of that value field.
const GOLD_BG = 'rgb(242, 226, 135)';
const PIVOT_TEXT_COLOR = 'rgb(47, 115, 255)';

test.agExample(import.meta, () => {
    test.eachFramework(
        'Pivot result columns inherit and extend the value column cellStyle',
        async ({ agIdFor, page }) => {
            await ensureGridReady(page);
            await waitForGridContent(page);

            // sport is the pivot field; generated result columns are pivot_sport_<sport>_<gold|silver>.
            const goldCell = agIdFor.cell('row-group-country-United States', 'pivot_sport_Athletics_gold');
            const silverCell = agIdFor.cell('row-group-country-United States', 'pivot_sport_Athletics_silver');

            await expect(goldCell).toBeVisible();
            await expect(silverCell).toBeVisible();

            // gold pivot result cells inherit the gold background AND gain the processPivotResultColDef text colour.
            await expect(goldCell).toHaveCSS('background-color', GOLD_BG);
            await expect(goldCell).toHaveCSS('color', PIVOT_TEXT_COLOR);

            // silver pivot result cells did not inherit a background, but still gain the text colour.
            await expect(silverCell).not.toHaveCSS('background-color', GOLD_BG);
            await expect(silverCell).toHaveCSS('color', PIVOT_TEXT_COLOR);
        }
    );
});
