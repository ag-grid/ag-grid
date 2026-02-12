import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Example', async ({ agIdFor }) => {
        await expect(agIdFor.autoGroupCell('row-group-country-Netherlands')).toContainText('Netherlands (4)', {
            useInnerText: true,
        });
        await expect(agIdFor.cell('row-group-country-Netherlands', 'bronze')).toContainText('4');
        await expect(agIdFor.cell('row-group-country-Netherlands', 'silver')).toContainText('0.75');
        await expect(agIdFor.cell('row-group-country-Netherlands', 'gold')).toContainText('3');
    });
});
