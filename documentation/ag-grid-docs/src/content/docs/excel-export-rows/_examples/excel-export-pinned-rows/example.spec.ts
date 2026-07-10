import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Pinned top and bottom rows are rendered', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Pinned rows render as .ag-row-pinned; the top one holds the Floating <Top> data.
        const topRow = page.locator('.ag-row-pinned').filter({ hasText: 'Floating <Top>' }).first();
        const bottomRow = page.locator('.ag-row-pinned').filter({ hasText: 'Floating <Bottom>' }).first();

        await expect(topRow.locator('[col-id="athlete"]')).toContainText('Floating <Top> Athlete');
        await expect(topRow.locator('[col-id="total"]')).toContainText('69');

        await expect(bottomRow.locator('[col-id="athlete"]')).toContainText('Floating <Bottom> Athlete');
        await expect(bottomRow.locator('[col-id="total"]')).toContainText('471');
    });

    test.eachFramework('Skip-pinned checkboxes can be toggled', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // First centre data row is Natalie Coughlin (United States).
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Natalie Coughlin');

        const skipTop = page.locator('#skipPinnedTop');
        const skipBottom = page.locator('#skipPinnedBottom');
        await expect(skipTop).not.toBeChecked();
        await expect(skipBottom).not.toBeChecked();

        // Toggling the export controls updates their checked state.
        await skipTop.check();
        await skipBottom.check();
        await expect(skipTop).toBeChecked();
        await expect(skipBottom).toBeChecked();

        // Toggling the controls does not remove the pinned rows from the grid display.
        await expect(
            page.locator('.ag-row-pinned').filter({ hasText: 'Floating <Top>' }).first().locator('[col-id="athlete"]')
        ).toContainText('Floating <Top> Athlete');
    });
});
