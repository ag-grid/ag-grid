import { ensureGridReady, expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('checkboxes select multiple rows independently', async ({ agIdFor, page }) => {
        await ensureGridReady(page);

        await agIdFor.selectionColumnCheckbox('0').first().click();
        await agIdFor.selectionColumnCheckbox('2').first().click();

        // Both rows stay selected in multiRow mode.
        await expect(agIdFor.rowNode('0')).toHaveClass(/ag-row-selected/);
        await expect(agIdFor.rowNode('2')).toHaveClass(/ag-row-selected/);
    });

    test.eachFramework('shift-clicking a checkbox selects a contiguous range', async ({ agIdFor, page }) => {
        await ensureGridReady(page);

        await agIdFor.selectionColumnCheckbox('0').first().click();
        // Shift-click extends the selection across the intervening rows.
        await agIdFor
            .selectionColumnCheckbox('3')
            .first()
            .click({ modifiers: ['Shift'] });

        await expect(agIdFor.rowNode('0')).toHaveClass(/ag-row-selected/);
        await expect(agIdFor.rowNode('1')).toHaveClass(/ag-row-selected/);
        await expect(agIdFor.rowNode('2')).toHaveClass(/ag-row-selected/);
        await expect(agIdFor.rowNode('3')).toHaveClass(/ag-row-selected/);
    });

    test.eachFramework('the header checkbox selects every row', async ({ agIdFor, page }) => {
        await ensureGridReady(page);

        const headerWrapper = page.locator('.ag-header-select-all .ag-checkbox-input-wrapper').first();
        await page.locator('.ag-header-select-all .ag-checkbox-input').first().click();

        // The header checkbox reports the fully-checked (not indeterminate) state, which is
        // derived from the whole selection model — this proves every row is selected, including
        // any that are virtualised off-screen, not just the rendered ones.
        await expect(headerWrapper).toHaveClass(/ag-checked/);
        await expect(headerWrapper).not.toHaveClass(/ag-indeterminate/);

        // Every rendered row is also visibly selected.
        const rows = page.locator('.ag-center-cols-container .ag-row');
        const total = await rows.count();
        expect(total).toBeGreaterThan(0);
        await expect(page.locator('.ag-center-cols-container .ag-row.ag-row-selected')).toHaveCount(total);
        await expect(agIdFor.rowNode('0')).toHaveClass(/ag-row-selected/);
    });
});
