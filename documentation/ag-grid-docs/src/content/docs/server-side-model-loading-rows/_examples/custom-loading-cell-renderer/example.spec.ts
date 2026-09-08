import { ensureGridReady, expect, scrollGridRelative, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Custom loading component displays while data loads', async ({ page }) => {
        await ensureGridReady(page);

        // The custom full-width loading row shows its configured message before data arrives.
        const loadingCell = page.locator('.ag-custom-loading-cell');
        await expect(loadingCell.first()).toBeVisible();
        await expect(loadingCell.first()).toContainText('One moment please...');
    });

    test.eachFramework('Loaded data replaces the loading component', async ({ agIdFor, page }) => {
        await ensureGridReady(page);

        // First block loads after the simulated delay; row 0 is Michael Phelps.
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps', { timeout: 15000 });
        await expect(agIdFor.cell('0', 'country')).toContainText('United States');
        await expect(page.locator('.ag-custom-loading-cell')).toHaveCount(0);
    });

    test.eachFramework(
        'Scrolling requests a new block and shows the loading component again',
        async ({ agIdFor, page }) => {
            await ensureGridReady(page);

            // Wait for the first block to finish loading.
            await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps', { timeout: 15000 });

            // Scroll well past the first cached block to trigger loading of an unloaded block.
            await scrollGridRelative('element', page, { y: 2000 });

            await expect(page.locator('.ag-custom-loading-cell').first()).toBeVisible({ timeout: 15000 });
        }
    );
});
