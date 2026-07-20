import { ensureGridReady, expect, test, waitForRowAnimations } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('the header checkbox selects all rows on the page', async ({ page }) => {
        await ensureGridReady(page);

        const headerWrapper = page.locator('.ag-header-select-all .ag-checkbox-input-wrapper').first();
        await expect(headerWrapper).not.toHaveClass(/ag-checked/);

        await page.locator('.ag-header-select-all .ag-checkbox-input').first().click();

        // The header reports the fully-selected state and every rendered row is selected.
        await expect(headerWrapper).toHaveClass(/ag-checked/);
        const rows = page.locator('.ag-center-cols-container .ag-row');
        const total = await rows.count();
        expect(total).toBeGreaterThan(0);
        await expect(page.locator('.ag-center-cols-container .ag-row.ag-row-selected')).toHaveCount(total);
    });

    test.eachFramework('the quick filter narrows the displayed rows', async ({ page }) => {
        await ensureGridReady(page);

        await page.locator('#quickFilter').fill('Nemov');
        await waitForRowAnimations(page);

        const rows = page.locator('.ag-center-cols-container .ag-row');
        await expect(rows).toHaveCount(1);
        await expect(rows.first()).toContainText('Aleksey Nemov');
    });

    test.eachFramework("selectAll 'filtered' selects only the filtered rows", async ({ page }) => {
        await ensureGridReady(page);

        await page.locator('#select-all-mode').selectOption('filtered');
        await page.locator('#quickFilter').fill('Gymnastics');
        await waitForRowAnimations(page);

        await page.locator('.ag-header-select-all .ag-checkbox-input').first().click();

        // All rows matching the filter are selected.
        const rows = page.locator('.ag-center-cols-container .ag-row');
        const total = await rows.count();
        expect(total).toBeGreaterThan(0);
        await expect(page.locator('.ag-center-cols-container .ag-row.ag-row-selected')).toHaveCount(total);
    });
});
