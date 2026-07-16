import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework(
        'Pivot groups are generated for the pivotValue column and enableStrictPivotColumnOrder can be toggled',
        async ({ page }) => {
            await ensureGridReady(page);
            await waitForGridContent(page);

            // The data set changes every second (rows are appended). Each unique pivotValue produces a
            // pivot column group. At least one such group is present once data has loaded.
            const pivotGroups = page.locator('.ag-header-group-cell[col-id^="pivotGroup_pivotValue_"]');
            await expect(pivotGroups.first()).toBeVisible();

            // enableStrictPivotColumnOrder is toggled through the checkbox; enabling it re-sorts generated
            // columns. Toggling it must not break rendering - pivot groups remain present afterwards.
            const checkbox = page.locator('#enableStrictPivotColumnOrder');
            await expect(checkbox).not.toBeChecked();
            await checkbox.click();
            await expect(checkbox).toBeChecked();
            await expect(pivotGroups.first()).toBeVisible();
        }
    );
});
