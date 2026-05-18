import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('lockPinned athlete stays pinned left', async ({ page, agIdFor }) => {
        await waitForGridContent(page);

        const athleteHeader = agIdFor.headerCell('athlete');
        await expect(athleteHeader).toBeVisible();

        // Athlete should be in the pinned left header
        const pinnedLeftHeader = page.locator('.ag-header-row .ag-grid-pinned-left-cells');
        await expect(pinnedLeftHeader.locator('.ag-header-cell[col-id="athlete"]')).toBeVisible();
    });

    test.eachFramework('lockPinned age stays in center (not pinnable)', async ({ page, agIdFor }) => {
        await waitForGridContent(page);

        const ageHeader = agIdFor.headerCell('age');
        await expect(ageHeader).toBeVisible();

        // Age should be in the center header, not pinned
        const centerHeader = page.locator('.ag-header-row .ag-grid-scrolling-cells');
        await expect(centerHeader.locator('.ag-header-cell[col-id="age"]')).toBeVisible();
    });

    test.eachFramework('locked cells have lock-pinned class', async ({ page }) => {
        await waitForGridContent(page);

        // First row athlete cell should have lock-pinned class
        const athleteCell = page.locator('.ag-grid-pinned-left-cells .ag-cell[col-id="athlete"]').first();
        await expect(athleteCell).toHaveClass(/lock-pinned/);

        // First row age cell should have lock-pinned class
        const ageCell = page.locator('.ag-grid-scrolling-cells .ag-cell[col-id="age"]').first();
        await expect(ageCell).toHaveClass(/lock-pinned/);
    });
});
