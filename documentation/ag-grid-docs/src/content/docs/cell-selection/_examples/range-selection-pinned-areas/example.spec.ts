import { dragOverTo, expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('A range spanning pinned columns has no gaps', async ({ agIdFor }) => {
        // athlete is pinned left, total is pinned right (small-olympic-winners.json).
        const source = agIdFor.cell('0', 'athlete');
        const target = agIdFor.cell('0', 'total');

        await expect(source).toContainText('Natalie Coughlin');
        await expect(target).toContainText('6');

        await dragOverTo(source, target, undefined);

        // Dragging from the left-pinned area to the right-pinned area fills the
        // centre columns too, so the whole row is selected with no gaps.
        await expect(source).toHaveClass(/ag-cell-range-selected/);
        await expect(target).toHaveClass(/ag-cell-range-selected/);
        await expect(agIdFor.cell('0', 'age')).toHaveClass(/ag-cell-range-selected/);
        await expect(agIdFor.cell('0', 'country')).toHaveClass(/ag-cell-range-selected/);
    });
});
