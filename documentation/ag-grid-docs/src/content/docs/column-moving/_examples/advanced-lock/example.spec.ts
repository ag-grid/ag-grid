import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('grid renders with the locked controls column first', async ({ page, agIdFor }) => {
        await waitForGridContent(page);

        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');

        // The locked-position controls column renders in the scrolling area and is the first column.
        const lockedCell = page.locator('.ag-grid-scrolling-cells .ag-cell.locked-col').first();
        await expect(lockedCell).toBeVisible();
        await expect(lockedCell).toContainText('Action');
        await expect(lockedCell).toHaveAttribute('aria-colindex', '1');
    });

    test.eachFramework('pinning athlete left also pins the locked column left', async ({ page }) => {
        await waitForGridContent(page);

        // Initially nothing is pinned: locked column sits in the scrolling area.
        await expect(page.locator('.ag-grid-pinned-left-cells .ag-cell.locked-col')).toHaveCount(0);

        await page.locator('button:text("Pin Athlete Left")').click();

        // Athlete and the locked column are now both pinned left.
        await expect(
            page.locator('.ag-header-row .ag-grid-pinned-left-cells .ag-header-cell[col-id="athlete"]')
        ).toBeVisible();
        await expect(page.locator('.ag-grid-pinned-left-cells .ag-cell.locked-col').first()).toBeVisible();

        await page.locator('button:text("Un-Pin Athlete")').click();

        // Un-pinning athlete un-pins the locked column too.
        await expect(page.locator('.ag-grid-pinned-left-cells .ag-cell.locked-col')).toHaveCount(0);
        await expect(page.locator('.ag-grid-scrolling-cells .ag-cell.locked-col').first()).toBeVisible();
    });

    test.eachFramework('pinning athlete right leaves the locked column in place', async ({ page }) => {
        await waitForGridContent(page);

        await page.locator('button:text("Pin Athlete Right")').click();

        // Athlete pins right, but the locked column stays in the scrolling area on the left.
        await expect(
            page.locator('.ag-header-row .ag-grid-pinned-right-cells .ag-header-cell[col-id="athlete"]')
        ).toBeVisible();
        await expect(page.locator('.ag-grid-pinned-left-cells .ag-cell.locked-col')).toHaveCount(0);
        await expect(page.locator('.ag-grid-scrolling-cells .ag-cell.locked-col').first()).toBeVisible();
    });
});
