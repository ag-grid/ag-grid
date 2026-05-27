import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework(
        'calculated profit column evaluates revenue - cost and applies the ag-calculated-column class',
        async ({ agIdFor }) => {
            const profitHeader = agIdFor.headerCell('profit');
            await expect(profitHeader).toContainText('Profit');
            await expect(profitHeader).toHaveClass(/ag-calculated-column/);

            // profit = revenue - cost, formatted as $#,###
            await expect(agIdFor.cell('0', 'profit')).toContainText('$46,000');
            await expect(agIdFor.cell('1', 'profit')).toContainText('$26,000');
            await expect(agIdFor.cell('2', 'profit')).toContainText('$25,000');
            await expect(agIdFor.cell('3', 'profit')).toContainText('$31,000');
            await expect(agIdFor.cell('4', 'profit')).toContainText('$49,000');

            await expect(agIdFor.cell('0', 'profit')).toHaveClass(/ag-calculated-column/);
        }
    );
});
