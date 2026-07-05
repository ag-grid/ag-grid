import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Athlete column is pinned to the left', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');
        await expect(agIdFor.cell('0', 'country')).toContainText('United States');
        await expect(agIdFor.cell('0', 'total')).toContainText('8');

        // The athlete column renders inside the pinned-left container.
        await expect(page.locator('.ag-grid-pinned-left-cells .ag-cell[col-id="athlete"]').first()).toContainText(
            'Michael Phelps'
        );
    });

    test.eachFramework('Opening the group reveals the medal columns', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const sportsGroup = page.locator('.ag-header-group-cell').filter({ hasText: 'Sports Results' }).first();
        await sportsGroup.locator('.ag-header-expand-icon-collapsed').first().click();

        await expect(agIdFor.cell('0', 'gold')).toContainText('8');
        await expect(agIdFor.cell('0', 'silver')).toContainText('0');
        await expect(agIdFor.cell('0', 'bronze')).toContainText('0');
        await expect(page.locator('.ag-header-cell[col-id="total"]')).toHaveCount(0);
    });
});
