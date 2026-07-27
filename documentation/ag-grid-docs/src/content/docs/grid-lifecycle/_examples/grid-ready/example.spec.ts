import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

// The gridReady event applies user pinning preferences before data is rendered: if the
// "Pin first column on load" checkbox is ticked, onGridReady pins the 'name' column to the
// left. Reloading the grid re-runs gridReady and re-applies the preference.
test.agExample(import.meta, () => {
    test.eachFramework('First column is not pinned by default', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // The name column renders in the centre viewport, not the pinned-left container.
        await expect(
            page.locator('.ag-grid-scrolling-container .ag-grid-pinned-left-cells [col-id="name"]')
        ).toHaveCount(0);
        await expect(agIdFor.cell('0', 'name')).toContainText('Michael Phelps');
    });

    test.eachFramework('Reloading with the checkbox ticked pins the first column via gridReady', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await page.locator('#pinFirstColumnOnLoad').check();
        await page.locator('#reloadGridButton').click();

        // After the grid is destroyed and re-created, gridReady pins 'name' to the left.
        await expect(
            page.locator('.ag-grid-scrolling-container .ag-grid-pinned-left-cells [col-id="name"]').first()
        ).toBeVisible();
    });
});
