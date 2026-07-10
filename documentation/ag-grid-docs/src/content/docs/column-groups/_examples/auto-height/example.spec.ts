import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('The wrapped group header renders its long shared name', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await expect(
            page.locator('.ag-header-group-cell').filter({ hasText: 'A shared prop for all Groups' })
        ).toHaveCount(1);

        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');
        await expect(agIdFor.cell('0', 'total')).toContainText('8');
    });

    test.eachFramework('Opening the wrapped group reveals the medal columns', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await expect(page.locator('.ag-header-cell[col-id="gold"]')).toHaveCount(0);

        const group = page.locator('.ag-header-group-cell').filter({ hasText: 'A shared prop for all Groups' });
        await group.locator('.ag-header-expand-icon-collapsed').first().click();

        await expect(agIdFor.cell('0', 'gold')).toContainText('8');
    });
});
