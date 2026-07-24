import { ensureGridReady, expect, test, waitForRowAnimations } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('the header checkbox selects all rows on the page', async ({ page }) => {
        await ensureGridReady(page);

        const headerWrapper = page.locator('.ag-header-select-all .ag-checkbox-input-wrapper').first();
        await expect(headerWrapper).not.toHaveClass(/ag-checked/);

        await page.locator('.ag-header-select-all .ag-checkbox-input').first().click();

        // selectAll: 'all' (default) selects every row. The header's fully-checked (not
        // indeterminate) state is computed from the entire selection model, so it confirms the
        // whole data set is selected rather than only the rendered/current-page rows.
        await expect(headerWrapper).toHaveClass(/ag-checked/);
        await expect(headerWrapper).not.toHaveClass(/ag-indeterminate/);

        // Every rendered row is also visibly selected.
        const rows = page.locator('.ag-grid-scrolling-container .ag-row');
        const total = await rows.count();
        expect(total).toBeGreaterThan(0);
        await expect(page.locator('.ag-grid-scrolling-container .ag-row.ag-row-selected')).toHaveCount(total);
    });

    test.eachFramework('the quick filter narrows the displayed rows', async ({ page }) => {
        await ensureGridReady(page);

        await page.locator('#quickFilter').fill('Nemov');
        await waitForRowAnimations(page);

        const rows = page.locator('.ag-grid-scrolling-container .ag-row');
        await expect(rows).toHaveCount(1);
        await expect(rows.first()).toContainText('Aleksey Nemov');
    });

    test.eachFramework("selectAll 'filtered' selects only the filtered rows", async ({ agIdFor, page }) => {
        await ensureGridReady(page);

        await page.locator('#select-all-mode').selectOption('filtered');
        await page.locator('#quickFilter').fill('Gymnastics');
        await waitForRowAnimations(page);

        const headerWrapper = page.locator('.ag-header-select-all .ag-checkbox-input-wrapper').first();
        await expect(headerWrapper).not.toHaveClass(/ag-checked/);

        await page.locator('.ag-header-select-all .ag-checkbox-input').first().click();

        // With selectAll: 'filtered', clicking the header selects every row matching the filter.
        // The header's fully-checked (not indeterminate) state is computed from the whole filtered
        // selection model, so it confirms all filtered rows are selected without depending on which
        // rows happen to be rendered under virtualisation.
        await expect(headerWrapper).toHaveClass(/ag-checked/);
        await expect(headerWrapper).not.toHaveClass(/ag-indeterminate/);

        // Clear the filter to reveal the previously-hidden rows and prove that ONLY the filtered
        // rows were selected: row 1 (Aleksey Nemov, Gymnastics) matched and is selected, while
        // row 0 (Natalie Coughlin, Swimming) did not match and remains unselected.
        await page.locator('#quickFilter').fill('');
        await waitForRowAnimations(page);
        await expect(agIdFor.cell('1', 'athlete')).toContainText('Aleksey Nemov');
        await expect(agIdFor.rowNode('1')).toHaveClass(/ag-row-selected/);
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Natalie Coughlin');
        await expect(agIdFor.rowNode('0')).not.toHaveClass(/ag-row-selected/);
    });
});
