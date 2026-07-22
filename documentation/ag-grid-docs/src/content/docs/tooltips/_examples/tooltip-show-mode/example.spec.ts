import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Truncated header shows its tooltip', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // The Country column is only 100px wide, so its "Country of Athlete" header
        // is truncated and a tooltip is shown even with tooltipShowMode='whenTruncated'.
        await agIdFor.headerCell('country').hover();
        const tooltip = page.locator('.ag-tooltip');
        await expect(tooltip).toBeVisible();
        await expect(tooltip).toContainText('Country of Athlete');
    });
});
