import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Renders the six change-highlight columns', async ({ agIdFor }) => {
        // Six columns a-f, mixing enableCellChangeFlash and the animate renderers.
        await expect(agIdFor.headerCell('a')).toBeVisible();
        await expect(agIdFor.headerCell('f')).toBeVisible();
        // Row 0 renders a numeric value (a timer mutates random cells, so the exact
        // value is not asserted here).
        await expect(agIdFor.cell('0', 'a').first()).toHaveText(/\d/);
    });

    test.eachFramework('Data changes highlight cells automatically', async ({ page }) => {
        // A timer updates two random cells every 250ms; flashed cells get the
        // ag-cell-data-changed class (then the fade animation class).
        const flashed = page.locator('.ag-cell-data-changed, .ag-cell-data-changed-animation');
        await expect(flashed.first()).toBeVisible({ timeout: 5000 });
    });
});
