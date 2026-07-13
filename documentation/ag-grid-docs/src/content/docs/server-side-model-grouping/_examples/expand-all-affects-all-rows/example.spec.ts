import { expect, test, waitForGridContent, waitForRowAnimations } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('ssrmExpandAllAffectsAllRows enables Expand All to expand every level', async ({ page }) => {
        await waitForGridContent(page);

        // Grouped Country -> Sport -> Year. Level classes: country=0, sport=1, year=2.
        const sportGroups = page.locator('.ag-row.ag-row-level-1');
        const yearGroups = page.locator('.ag-row.ag-row-level-2');

        // Wait until the first Country group has actually loaded (real group value, not a loading
        // placeholder) — expandAll() with the flag off only expands groups already loaded, so the
        // click below is a no-op unless the top level has arrived from the server.
        await expect(page.locator('.ag-row.ag-row-level-0 .ag-group-value').first()).toHaveText(/\S/);

        // With ssrmExpandAllAffectsAllRows unchecked (default false), expandAll() expands only the
        // groups already loaded into the client: the loaded Country groups expand and their Sport
        // children load in, but those newly-loaded Sport groups are NOT recursively expanded — so the
        // deepest Year level never appears.
        await page.getByRole('button', { name: 'Expand rows' }).click();
        await expect(sportGroups).not.toHaveCount(0);
        // Let the Sport children finish loading/animating so that, if a regression made expandAll
        // recurse into them, their Year rows would have appeared — then assert they did not.
        await waitForRowAnimations(page);
        await expect(yearGroups).toHaveCount(0);

        // Enabling ssrmExpandAllAffectsAllRows makes expandAll() expand every level, including groups
        // not yet loaded — so the deepest Year (level-2) groups now become visible too.
        await page.locator('#ssrmExpandAllAffectsAllRows').check();
        await page.getByRole('button', { name: 'Expand rows' }).click();
        await expect(yearGroups).not.toHaveCount(0);

        // Collapse rows collapses every level again.
        await page.getByRole('button', { name: 'Collapse rows' }).click();
        await expect(sportGroups).toHaveCount(0);
    });
});
