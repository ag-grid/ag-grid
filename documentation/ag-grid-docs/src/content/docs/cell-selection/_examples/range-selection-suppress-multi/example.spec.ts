import { dragOverTo, expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Dragging a range selects the covered cells', async ({ agIdFor }) => {
        const source = agIdFor.cell('0', 'athlete');
        const target = agIdFor.cell('2', 'country');

        await expect(source).toContainText('Natalie Coughlin');

        await dragOverTo(source, target, undefined);

        await expect(source).toHaveClass(/ag-cell-range-selected/);
        await expect(target).toHaveClass(/ag-cell-range-selected/);
    });

    test.eachFramework('Ctrl + drag replaces the range (single range only)', async ({ page, agIdFor }) => {
        const firstSource = agIdFor.cell('0', 'athlete');
        const firstTarget = agIdFor.cell('1', 'age');

        await dragOverTo(firstSource, firstTarget, undefined);
        await expect(firstSource).toHaveClass(/ag-cell-range-selected/);

        // suppressMultiRanges: true means Ctrl + drag clears the previous range
        // rather than adding a second one.
        await page.keyboard.down('Control');
        await dragOverTo(agIdFor.cell('4', 'gold'), agIdFor.cell('5', 'total'), undefined);
        await page.keyboard.up('Control');

        await expect(agIdFor.cell('4', 'gold')).toHaveClass(/ag-cell-range-selected/);
        await expect(agIdFor.cell('5', 'total')).toHaveClass(/ag-cell-range-selected/);
        // The original range has been cleared because only one range is permitted.
        await expect(firstSource).not.toHaveClass(/ag-cell-range-selected/);
    });
});
