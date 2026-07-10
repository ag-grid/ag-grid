import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Clicking a column header selects the whole column', async ({ agIdFor }) => {
        // Data comes from small-olympic-winners.json (row 0 = Natalie Coughlin, age 25).
        await expect(agIdFor.cell('0', 'age')).toContainText('25');

        // Before selecting, no cells in the column are part of a range.
        await expect(agIdFor.cell('0', 'age')).not.toHaveClass(/ag-cell-range-selected/);

        await agIdFor.headerCell('age').click();

        // enableColumnSelection selects every visible cell in the column.
        await expect(agIdFor.cell('0', 'age')).toHaveClass(/ag-cell-range-selected/);
        await expect(agIdFor.cell('1', 'age')).toHaveClass(/ag-cell-range-selected/);
        await expect(agIdFor.cell('2', 'age')).toHaveClass(/ag-cell-range-selected/);

        // A different column is not selected.
        await expect(agIdFor.cell('0', 'country')).not.toHaveClass(/ag-cell-range-selected/);
    });

    test.eachFramework('Selecting another header clears the previous column', async ({ agIdFor }) => {
        await agIdFor.headerCell('age').click();
        await expect(agIdFor.cell('0', 'age')).toHaveClass(/ag-cell-range-selected/);

        // Clicking a new header without Ctrl clears the previous column selection.
        await agIdFor.headerCell('gold').click();
        await expect(agIdFor.cell('0', 'gold')).toHaveClass(/ag-cell-range-selected/);
        await expect(agIdFor.cell('0', 'age')).not.toHaveClass(/ag-cell-range-selected/);
    });
});
