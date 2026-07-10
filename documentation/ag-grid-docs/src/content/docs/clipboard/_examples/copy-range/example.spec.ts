import { dragOverTo, expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('displays the olympic winners source data', async ({ agIdFor }) => {
        // First row of olympic-winners.json: Michael Phelps, United States, 2008, total 8.
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');
        await expect(agIdFor.cell('0', 'country')).toContainText('United States');
        await expect(agIdFor.cell('0', 'total')).toContainText('8');
    });

    test.eachFramework('Dragging selects a copyable cell range', async ({ agIdFor }) => {
        const source = agIdFor.cell('0', 'athlete');
        const target = agIdFor.cell('2', 'country');

        await dragOverTo(source, target, undefined);

        await expect(source).toHaveClass(/ag-cell-range-selected/);
        await expect(target).toHaveClass(/ag-cell-range-selected/);
        await expect(agIdFor.cell('1', 'age')).toHaveClass(/ag-cell-range-selected/);

        // Cells outside the rectangle are not part of the range.
        await expect(agIdFor.cell('0', 'total')).not.toHaveClass(/ag-cell-range-selected/);
    });
});
