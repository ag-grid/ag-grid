import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Closed group shows only the total column', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Name & Country group columns are always shown.
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');
        await expect(agIdFor.cell('0', 'country')).toContainText('United States');

        // Sports Results is closed: total (columnGroupShow 'closed') is visible, medals ('open') hidden.
        await expect(agIdFor.cell('0', 'total')).toContainText('8');
        await expect(page.locator('.ag-header-cell[col-id="gold"]')).toHaveCount(0);
    });

    test.eachFramework('Opening the group reveals the medal columns', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const sportsGroup = page.locator('.ag-header-group-cell').filter({ hasText: 'Sports Results' }).first();
        await sportsGroup.locator('.ag-header-expand-icon-collapsed').first().click();

        // Medal columns now visible, total column hidden.
        await expect(agIdFor.cell('0', 'gold')).toContainText('8');
        await expect(agIdFor.cell('0', 'silver')).toContainText('0');
        await expect(agIdFor.cell('0', 'bronze')).toContainText('0');
        await expect(page.locator('.ag-header-cell[col-id="total"]')).toHaveCount(0);
    });
});
