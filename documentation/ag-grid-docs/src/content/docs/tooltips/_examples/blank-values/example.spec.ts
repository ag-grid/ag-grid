import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('tooltipValueGetter shows a tooltip for missing values', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const tooltip = page.locator('.ag-tooltip');

        // Row 0 has a missing (undefined) athlete value.
        // Column A uses tooltipField, so no tooltip is shown for the missing value.
        await agIdFor.cell('0', 'athlete').hover();
        await expect(tooltip).toHaveCount(0);

        // Column B (duplicate field) uses a tooltipValueGetter returning '- Missing -'.
        await agIdFor.cell('0', 'athlete_1').hover();
        await expect(tooltip).toBeVisible();
        await expect(tooltip).toContainText('- Missing -');
    });
});
