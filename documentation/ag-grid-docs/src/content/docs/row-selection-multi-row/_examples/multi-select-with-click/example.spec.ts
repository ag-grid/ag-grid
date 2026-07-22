import { ensureGridReady, expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('clicks add rows without a modifier key', async ({ agIdFor, page }) => {
        await ensureGridReady(page);

        // enableSelectionWithoutKeys: true — a plain click adds to the selection instead of replacing it.
        await agIdFor.cell('0', 'athlete').first().click();
        await expect(agIdFor.rowNode('0')).toHaveClass(/ag-row-selected/);

        await agIdFor.cell('2', 'athlete').first().click();
        await expect(agIdFor.rowNode('0')).toHaveClass(/ag-row-selected/);
        await expect(agIdFor.rowNode('2')).toHaveClass(/ag-row-selected/);
    });

    test.eachFramework('clicking a selected row toggles it off', async ({ agIdFor, page }) => {
        await ensureGridReady(page);

        await agIdFor.cell('0', 'athlete').first().click();
        await expect(agIdFor.rowNode('0')).toHaveClass(/ag-row-selected/);

        // Clicking again deselects that row while leaving others untouched.
        await agIdFor.cell('0', 'athlete').first().click();
        await expect(agIdFor.rowNode('0')).not.toHaveClass(/ag-row-selected/);
    });
});
