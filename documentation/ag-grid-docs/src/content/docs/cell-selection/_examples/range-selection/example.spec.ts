import { dragOverTo, expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Dragging a range selects the covered cells', async ({ agIdFor }) => {
        // Data comes from small-olympic-winners.json (row 0 = Natalie Coughlin, US).
        const source = agIdFor.cell('0', 'athlete');
        const target = agIdFor.cell('2', 'country');

        await expect(source).toContainText('Natalie Coughlin');

        await dragOverTo(source, target, undefined);

        // Both corners and a cell in between should be part of the range.
        await expect(source).toHaveClass(/ag-cell-range-selected/);
        await expect(target).toHaveClass(/ag-cell-range-selected/);
        await expect(agIdFor.cell('1', 'age')).toHaveClass(/ag-cell-range-selected/);

        // Cells outside the rectangle are not selected.
        await expect(agIdFor.cell('0', 'total')).not.toHaveClass(/ag-cell-range-selected/);
    });

    test.eachFramework('Ctrl + drag adds a second range', async ({ page, agIdFor }) => {
        const firstSource = agIdFor.cell('0', 'athlete');
        const firstTarget = agIdFor.cell('1', 'age');

        await dragOverTo(firstSource, firstTarget, undefined);
        await expect(firstSource).toHaveClass(/ag-cell-range-selected/);

        // A second, non-overlapping range created while holding Ctrl keeps the first.
        await page.keyboard.down('Control');
        await dragOverTo(agIdFor.cell('4', 'gold'), agIdFor.cell('5', 'total'), undefined);
        await page.keyboard.up('Control');

        await expect(agIdFor.cell('4', 'gold')).toHaveClass(/ag-cell-range-selected/);
        await expect(agIdFor.cell('5', 'total')).toHaveClass(/ag-cell-range-selected/);
        // The first range is preserved because multiple ranges are allowed.
        await expect(firstSource).toHaveClass(/ag-cell-range-selected/);
    });
});
