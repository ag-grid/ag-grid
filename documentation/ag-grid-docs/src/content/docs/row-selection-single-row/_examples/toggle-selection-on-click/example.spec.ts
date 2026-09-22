import { ensureGridReady, expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('clicking the selected row deselects it', async ({ agIdFor, page }) => {
        await ensureGridReady(page);

        await agIdFor.cell('0', 'athlete').first().click();
        await expect(agIdFor.rowNode('0')).toHaveClass(/ag-row-selected/);

        await agIdFor.cell('0', 'athlete').first().click();
        await expect(agIdFor.rowNode('0')).not.toHaveClass(/ag-row-selected/);
    });

    test.eachFramework('clicking a different row moves the selection', async ({ agIdFor, page }) => {
        await ensureGridReady(page);

        await agIdFor.cell('0', 'athlete').first().click();
        await agIdFor.cell('2', 'athlete').first().click();

        await expect(agIdFor.rowNode('0')).not.toHaveClass(/ag-row-selected/);
        await expect(agIdFor.rowNode('2')).toHaveClass(/ag-row-selected/);
    });
});
