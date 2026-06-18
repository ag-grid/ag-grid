import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('calculated columns are blank on group rows and evaluate on leaf rows', async ({ agIdFor }) => {
        const solarGroupId = 'row-group-productType-Solar';

        await expect(agIdFor.autoGroupCell(solarGroupId)).toContainText('Solar (2)', { useInnerText: true });
        await expect(agIdFor.cell(solarGroupId, 'revenue')).toContainText('$220,000');
        await expect(agIdFor.cell(solarGroupId, 'cost')).toContainText('$148,000');
        // Calculated columns show no value on group rows.
        await expect(agIdFor.cell(solarGroupId, 'profit')).toHaveText('');
        await expect(agIdFor.cell(solarGroupId, 'margin')).toHaveText('');

        await expect(agIdFor.cell('0', 'profit')).toContainText('$46,000');
        await expect(agIdFor.cell('1', 'profit')).toContainText('$26,000');
    });
});
