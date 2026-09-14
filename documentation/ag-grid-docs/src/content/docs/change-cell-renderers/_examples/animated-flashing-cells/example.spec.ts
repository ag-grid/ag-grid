import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Renders the six change-highlight columns', async ({ agIdFor }) => {
        // Six columns a-f, mixing enableCellChangeFlash and the animate renderers.
        await expect(agIdFor.headerCell('a')).toBeVisible();
        await expect(agIdFor.headerCell('f')).toBeVisible();
        // Row 0 renders a numeric value (a timer mutates random cells, so the exact
        // value is not asserted here).
        await expect(agIdFor.cell('0', 'a').first()).toHaveText(/\d/);
    });

    test.eachFramework('Each pair of columns uses the renderer the docs describe', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // a and b use plain enableCellChangeFlash, so they render the value directly with
        // no animation wrapper from either provided renderer.
        for (const col of ['a', 'b']) {
            const cell = agIdFor.cell('0', col).first();
            await expect(cell.locator('.ag-value-change-value')).toHaveCount(0);
            await expect(cell.locator('.ag-value-slide-current')).toHaveCount(0);
        }

        // c and d use agAnimateShowChangeCellRenderer, which wraps the value in
        // .ag-value-change-value alongside a .ag-value-change-delta span.
        for (const col of ['c', 'd']) {
            const cell = agIdFor.cell('0', col).first();
            await expect(cell.locator('.ag-value-change-value')).toHaveCount(1);
            await expect(cell.locator('.ag-value-change-delta')).toHaveCount(1);
        }

        // e and f use agAnimateSlideCellRenderer, which renders the value in
        // .ag-value-slide-current.
        for (const col of ['e', 'f']) {
            const cell = agIdFor.cell('0', col).first();
            await expect(cell.locator('.ag-value-slide-current')).toHaveCount(1);
            await expect(cell.locator('.ag-value-change-value')).toHaveCount(0);
        }
    });

    test.eachFramework('Data changes highlight cells automatically', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // A timer updates two random cells every 250ms; flashed cells get the
        // ag-cell-data-changed class (then the fade animation class). Allow several update
        // cycles so a slow mount doesn't consume the whole window before the first flash.
        const flashed = page.locator('.ag-cell-data-changed, .ag-cell-data-changed-animation');
        await expect(flashed.first()).toBeVisible({ timeout: 15000 });
    });

    test.eachFramework('The animate show change renderer shows a delta on update', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // The timer eventually updates a c or d cell, at which point the show-change
        // renderer stamps a direction class on its delta span. The class is only ever
        // added by a real value change, so this fails if c/d fall back to a plain renderer.
        await expect(page.locator('.ag-value-change-delta-up, .ag-value-change-delta-down').first()).toBeAttached({
            timeout: 20000,
        });
    });
});
