import { dragOverTo, expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('should load grid with correct initial data', async ({ agIdFor }) => {
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');
        await expect(agIdFor.cell('0', 'total')).toContainText('8');
        await expect(agIdFor.cell('2', 'total')).toContainText('6');
    });

    test.eachFramework('should show the range handle when a cell range is selected', async ({ agIdFor, page }) => {
        const rangeHandle = page.locator('.ag-range-handle');

        await expect(rangeHandle).not.toBeVisible();

        await agIdFor.cell('0', 'total').click();

        await expect(rangeHandle).toBeVisible();
    });

    test.eachFramework('should extend the selected range when dragging the range handle', async ({ agIdFor, page }) => {
        const source = agIdFor.cell('0', 'athlete');
        const target = agIdFor.cell('2', 'athlete');

        await source.click();
        await expect(source).toHaveClass(/ag-cell-range-selected/);
        await expect(target).not.toHaveClass(/ag-cell-range-selected/);

        const rangeHandle = page.locator('.ag-range-handle');
        await expect(rangeHandle).toBeVisible();

        await dragOverTo(rangeHandle, target, 'bottomRight');

        // Dragging the range handle extends the selection to cover the dragged-over cells.
        await expect(source).toHaveClass(/ag-cell-range-selected/);
        await expect(agIdFor.cell('1', 'athlete')).toHaveClass(/ag-cell-range-selected/);
        await expect(target).toHaveClass(/ag-cell-range-selected/);
    });
});
