import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Tooltip shows on hover with mouse tracking enabled', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // tooltipMouseTrack is true; the tooltip still shows the column's tooltip content.
        await agIdFor.cell('0', 'age').hover();
        const tooltip = page.locator('.ag-tooltip');
        await expect(tooltip).toBeVisible();
        await expect(tooltip).toContainText('This is the Athlete');
    });
});
