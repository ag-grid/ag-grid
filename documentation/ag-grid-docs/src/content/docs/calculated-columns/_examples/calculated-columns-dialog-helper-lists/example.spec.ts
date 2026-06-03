import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('dialog expression picker example renders calculated values', async ({ agIdFor }) => {
        await expect(agIdFor.headerCell('profit')).toContainText('Profit');
        await expect(agIdFor.cell('0', 'profit')).toContainText('$46,000');
        await expect(agIdFor.cell('1', 'profit')).toContainText('$26,000');
    });
});
