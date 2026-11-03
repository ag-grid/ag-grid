import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('deferred apply mode calculated column evaluates revenue - cost', async ({ agIdFor }) => {
        const profitHeader = agIdFor.headerCell('profit');
        await expect(profitHeader).toContainText('Profit');
        await expect(profitHeader).toHaveClass(/ag-calculated-column/);

        await expect(agIdFor.cell('0', 'profit')).toContainText('$46,000');
        await expect(agIdFor.cell('4', 'profit')).toContainText('$49,000');
    });
});
