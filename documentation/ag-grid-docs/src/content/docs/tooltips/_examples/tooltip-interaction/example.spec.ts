import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Interactive tooltip stays visible while hovered', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const tooltip = page.locator('.ag-tooltip');

        await agIdFor.cell('0', 'age').hover();
        await expect(tooltip).toBeVisible();
        await expect(tooltip).toContainText('This is the Athlete');

        // With tooltipInteraction enabled, moving the cursor onto the tooltip keeps it open.
        await tooltip.hover();
        await expect(tooltip).toBeVisible();
        await expect(tooltip).toContainText('This is the Athlete');
    });
});
