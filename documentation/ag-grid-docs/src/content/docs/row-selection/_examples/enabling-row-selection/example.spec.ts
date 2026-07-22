import { ensureGridReady, expect, test, waitForRowAnimations } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('singleRow mode keeps at most one row selected', async ({ agIdFor, page }) => {
        await ensureGridReady(page);

        const row0 = agIdFor.rowNode('0');
        const row1 = agIdFor.rowNode('1');
        await expect(row0).not.toHaveClass(/ag-row-selected/);

        // Selecting a row via its checkbox marks it selected.
        await agIdFor.selectionColumnCheckbox('0').first().click();
        await expect(row0).toHaveClass(/ag-row-selected/);

        // In singleRow mode, selecting another row deselects the previous one.
        await agIdFor.selectionColumnCheckbox('1').first().click();
        await expect(row1).toHaveClass(/ag-row-selected/);
        await expect(row0).not.toHaveClass(/ag-row-selected/);
    });

    test.eachFramework('switching to multiRow allows multiple selected rows', async ({ agIdFor, page }) => {
        await ensureGridReady(page);

        // Switch the selection-mode control from singleRow to multiRow.
        await page.locator('#input-selection-mode').selectOption('multiRow');
        await waitForRowAnimations(page);

        await agIdFor.selectionColumnCheckbox('0').first().click();
        await agIdFor.selectionColumnCheckbox('1').first().click();

        // Both rows remain selected under multiRow mode.
        await expect(agIdFor.rowNode('0')).toHaveClass(/ag-row-selected/);
        await expect(agIdFor.rowNode('1')).toHaveClass(/ag-row-selected/);
    });
});
