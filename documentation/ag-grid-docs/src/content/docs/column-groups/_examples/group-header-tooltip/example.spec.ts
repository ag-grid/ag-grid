import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Grouped data renders', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await expect(page.locator('.ag-header-group-cell').filter({ hasText: 'Name & Country' })).toHaveCount(1);
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');
        await expect(agIdFor.cell('0', 'total')).toContainText('8');
    });

    test.eachFramework('Hovering a group header shows its headerTooltip', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const group = page.locator('.ag-header-group-cell').filter({ hasText: 'Name & Country' }).first();
        await group.hover();

        await expect(page.locator('.ag-tooltip')).toContainText('Name & Country Group');
    });
});
