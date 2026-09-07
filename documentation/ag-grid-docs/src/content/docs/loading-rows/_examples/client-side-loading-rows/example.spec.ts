import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework(
        'Displays loading rows before client-side row data arrives',
        async ({ agIdFor, page, remoteGrid }) => {
            await expect(page.locator('.ag-row-loading')).toHaveCount(10);
            await expect(page.locator('.ag-skeleton-effect').first()).toBeVisible();
            await expect(page.locator('.ag-overlay-loading-center')).toHaveCount(0);

            await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');
            await expect(page.locator('.ag-row-loading')).toHaveCount(0);

            const api = remoteGrid(page);
            await api.setGridOption('loadingRows', { rowCount: 3 });
            await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');
            await api.setGridOption('loading', true);
            await expect(page.locator('.ag-row-loading')).toHaveCount(3);
            await api.setGridOption('loadingRows', { rowCount: 5 });
            await expect(page.locator('.ag-row-loading')).toHaveCount(5);
            await api.setGridOption('loadingRows', false);
            await expect(page.locator('.ag-overlay-loading-center')).toBeVisible();
            await expect(page.locator('.ag-row-loading')).toHaveCount(0);
            await api.setGridOption('loadingRows', true);
            await expect(page.locator('.ag-row-loading')).toHaveCount(10);
            await expect(page.locator('.ag-overlay-loading-center')).not.toBeVisible();
            await api.setGridOption('loading', false);
            await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');
            await expect(page.locator('.ag-row-loading')).toHaveCount(0);
        }
    );
});
