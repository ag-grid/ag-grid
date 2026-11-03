import { ensureGridReady, expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Example', async ({ page, agIdFor }) => {
        await Promise.all([ensureGridReady(page, 'Left'), ensureGridReady(page, 'Right')]);

        await expect(agIdFor.grid('Left').locator('.ag-cell').first()).toBeVisible();
        await expect(agIdFor.grid('Right').locator('.ag-cell').first()).toBeVisible();
    });
});
