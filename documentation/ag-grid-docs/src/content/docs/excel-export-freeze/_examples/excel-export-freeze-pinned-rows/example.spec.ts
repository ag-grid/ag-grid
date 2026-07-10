import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Pinned top and bottom rows are displayed', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Regular data rows sit between the pinned rows.
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');
        await expect(agIdFor.cell('0', 'total')).toContainText('8');

        // Pinned top row.
        await expect(
            page.locator('.ag-grid-pinned-top-rows-container .ag-cell[col-id="athlete"]').first()
        ).toContainText('TOP (athlete)');
        await expect(
            page.locator('.ag-grid-pinned-top-rows-container .ag-cell[col-id="country"]').first()
        ).toContainText('TOP (country)');

        // Pinned bottom row.
        await expect(
            page.locator('.ag-grid-pinned-bottom-rows-container .ag-cell[col-id="athlete"]').first()
        ).toContainText('BOTTOM (athlete)');
        await expect(
            page.locator('.ag-grid-pinned-bottom-rows-container .ag-cell[col-id="country"]').first()
        ).toContainText('BOTTOM (country)');
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
