import { ensureGridReady, expect, scrollGridRelative, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Per-column loading renderer displays on the country column', async ({ page }) => {
        await ensureGridReady(page);

        // The country column renders a custom loading image while its block loads.
        const loadingImg = page.locator('.ag-cell[col-id="country"] img');
        await expect(loadingImg.first()).toBeVisible();
        await expect(loadingImg.first()).toHaveAttribute('src', /loading\.gif/);
    });

    test.eachFramework('Loaded data replaces the per-column loading renderer', async ({ agIdFor, page }) => {
        await ensureGridReady(page);

        // First block loads after the simulated delay; row 0 is the United States (Michael Phelps).
        await expect(agIdFor.cell('0', 'country')).toContainText('United States', { timeout: 15000 });
        await expect(agIdFor.cell('0', 'sport')).toContainText('Swimming');
        await expect(agIdFor.cell('0', 'gold')).toContainText('8');
        await expect(page.locator('.ag-cell[col-id="country"] img')).toHaveCount(0);
    });

    test.eachFramework('Scrolling reloads blocks and shows the loading renderer again', async ({ agIdFor, page }) => {
        await ensureGridReady(page);

        await expect(agIdFor.cell('0', 'country')).toContainText('United States', { timeout: 15000 });

        // With maxBlocksInCache: 0, scrolling forces fresh block requests and re-displays the loader.
        await scrollGridRelative('element', page, { y: 2000 });

        await expect(page.locator('.ag-cell[col-id="country"] img').first()).toBeVisible({ timeout: 15000 });
    });
});
