import { ensureGridReady, expect, scrollGridRelative, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Skeleton loading cells display while data loads', async ({ page }) => {
        await ensureGridReady(page);

        // suppressServerSideFullWidthLoadingRow makes the grid render per-cell skeleton loaders.
        await expect(page.locator('.ag-skeleton-effect').first()).toBeVisible();
    });

    test.eachFramework('Loaded data replaces the skeleton cells', async ({ agIdFor, page }) => {
        await ensureGridReady(page);

        // First block loads after the simulated delay; row 0 is the United States (Michael Phelps).
        await expect(agIdFor.cell('0', 'country')).toContainText('United States', { timeout: 15000 });
        await expect(agIdFor.cell('0', 'sport')).toContainText('Swimming');
        await expect(agIdFor.cell('0', 'gold')).toContainText('8');
        // The loaded row no longer contains a skeleton loader.
        await expect(agIdFor.cell('0', 'country').locator('.ag-skeleton-effect')).toHaveCount(0);
    });

    test.eachFramework('Scrolling reloads blocks and shows skeleton cells again', async ({ agIdFor, page }) => {
        await ensureGridReady(page);

        await expect(agIdFor.cell('0', 'country')).toContainText('United States', { timeout: 15000 });

        // With maxBlocksInCache: 0, scrolling forces fresh block requests and re-displays skeletons.
        await scrollGridRelative('element', page, { y: 2000 });

        await expect(page.locator('.ag-skeleton-effect').first()).toBeVisible({ timeout: 15000 });
    });
});
