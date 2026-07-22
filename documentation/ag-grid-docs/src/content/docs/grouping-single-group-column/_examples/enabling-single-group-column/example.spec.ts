import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    // country + year both have rowGroup: true and hide: true. groupDisplayType 'singleColumn'
    // renders every group level in ONE generated auto group column. groupDefaultExpanded: 1
    // expands the top (country) level so year sub-groups are visible.
    test.eachFramework('single generated group column displays every group level', async ({ agIdFor, page }) => {
        await waitForGridContent(page);

        // Exactly one auto group column exists and it is the only group-related header.
        const autoHeader = agIdFor.headerCell('ag-Grid-AutoColumn');
        await expect(autoHeader).toHaveCount(1);
        await expect(autoHeader).toBeVisible();

        // The grouped source columns are hidden (hide: true) - not shown as their own columns.
        await expect(agIdFor.headerCell('country')).toHaveCount(0);
        await expect(agIdFor.headerCell('year')).toHaveCount(0);

        // Non-grouped columns remain visible.
        await expect(agIdFor.headerCell('athlete')).toBeVisible();
        await expect(agIdFor.headerCell('sport')).toBeVisible();
        await expect(agIdFor.headerCell('total')).toBeVisible();

        // Top-level country group cell shows its value and child count in the single group column.
        await expect(agIdFor.autoGroupCell('row-group-country-United States')).toContainText('United States', {
            useInnerText: true,
        });

        // groupDefaultExpanded: 1 => country is expanded, so a year sub-group row is rendered
        // inside the same single group column.
        const yearSubGroup = page.locator('[row-id^="row-group-country-United States-year-"]').first();
        await expect(yearSubGroup).toBeVisible();
    });
});
