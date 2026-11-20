import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('hoverOrFocus shows tooltips on hover and on keyboard focus', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const tooltip = page.locator('.ag-tooltip:not(.ag-tooltip-hiding)');

        const hovered = agIdFor.cell('0', 'athlete');
        await hovered.hover();
        await expect(hovered).not.toBeFocused();
        await expect(tooltip).toContainText('Michael Phelps');

        const focused = agIdFor.cell('1', 'athlete');
        await focused.focus();
        await expect(focused).toBeFocused();
        await expect(tooltip).toContainText('Usain Bolt');
    });
});
