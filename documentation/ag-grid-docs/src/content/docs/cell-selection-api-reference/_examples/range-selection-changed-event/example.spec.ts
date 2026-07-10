import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('renders the olympic data', async ({ agIdFor }) => {
        await expect(agIdFor.cell('0', 'athlete')).toHaveText('Natalie Coughlin');
        await expect(agIdFor.cell('0', 'total')).toHaveText('6');
        await expect(agIdFor.cell('2', 'athlete')).toHaveText('Alicia Coutts');
    });

    test.eachFramework('selecting a range highlights the selected cells', async ({ agIdFor }) => {
        const start = agIdFor.cell('0', 'athlete');
        const end = agIdFor.cell('2', 'athlete');

        // No selection highlight before interacting.
        await expect(start).not.toHaveClass(/ag-cell-range-selected/);

        // Click the first cell then shift-click a lower cell to select the range.
        await start.click();
        await end.click({ modifiers: ['Shift'] });

        // All three cells in the range should now be highlighted.
        await expect(agIdFor.cell('0', 'athlete')).toHaveClass(/ag-cell-range-selected/);
        await expect(agIdFor.cell('1', 'athlete')).toHaveClass(/ag-cell-range-selected/);
        await expect(agIdFor.cell('2', 'athlete')).toHaveClass(/ag-cell-range-selected/);

        // A cell outside the range is not selected.
        await expect(agIdFor.cell('0', 'age')).not.toHaveClass(/ag-cell-range-selected/);
    });
});
