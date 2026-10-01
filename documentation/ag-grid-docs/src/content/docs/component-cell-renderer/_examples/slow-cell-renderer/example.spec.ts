import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    // Columns: 'country' (Slow Renderer, deferRender), 'bronze' (Slow Renderer Custom,
    // deferRender + a custom loadingCellRenderer), 'gold' (Fast Renderer, not deferred),
    // 'sport'. Grouped by athlete with the first group expanded.

    test.eachFramework('Fast and deferred renderers render leaf values', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Grouped by athlete, first group expanded (groupDefaultExpanded: 1)
        await expect(agIdFor.autoGroupCell('row-group-athlete-Michael Phelps')).toContainText('Michael Phelps', {
            useInnerText: true,
        });

        // Leaf row 0 = Michael Phelps, gold 8. Fast renderer renders immediately.
        await expect(agIdFor.cell('0', 'gold')).toContainText('8');

        // Deferred slow renderer eventually renders the leaf country value
        await expect(agIdFor.cell('0', 'country')).toContainText('United States', { timeout: 10000 });
    });

    test.eachFramework('Deferred columns show their loading cells while scrolling', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);
        // Let the initial viewport settle so the loaders below can only come from the scroll.
        await expect(page.locator('.ag-skeleton-container')).toHaveCount(0, { timeout: 10000 });

        const viewport = page.locator('.ag-grid-viewport');
        const skeleton = page.locator('[col-id="country"] .ag-skeleton-container');
        const customLoader = page.locator('[col-id="bronze"] img[src*="loading.gif"]');
        const fastCellSkeleton = page.locator('[col-id="gold"] .ag-skeleton-container');

        // Deferred cells only render once scrolling stops, so mid-scroll the Slow Renderer
        // column shows the default skeleton loader and the Slow Renderer Custom column
        // shows the loadingCellRenderer supplied on its colDef. Both are transient, so
        // retry the scroll until one lands.
        await expect(async () => {
            await viewport.evaluate((el) => (el.scrollTop += 3000));
            await expect(skeleton.first()).toBeVisible({ timeout: 500 });
            await expect(customLoader.first()).toBeVisible({ timeout: 500 });
            // The Fast Renderer column is not deferred, so it never shows a loading cell.
            await expect(fastCellSkeleton).toHaveCount(0);
        }).toPass();

        // Once scrolling stops the deferred cells replace their loaders with real values.
        await expect(skeleton).toHaveCount(0, { timeout: 15000 });
        await expect(customLoader).toHaveCount(0, { timeout: 15000 });
    });

    test.eachFramework('Collapsing the group hides its leaf rows', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await expect(agIdFor.cell('0', 'gold')).toContainText('8');
        // wait for the deferred slow renderer to settle before interacting, so collapse runs on a stable grid
        await expect(agIdFor.cell('0', 'country')).toContainText('United States', { timeout: 10000 });

        await agIdFor.autoGroupExpanded('row-group-athlete-Michael Phelps').click();
        await expect(agIdFor.cell('0', 'gold')).not.toBeVisible();
    });
});
