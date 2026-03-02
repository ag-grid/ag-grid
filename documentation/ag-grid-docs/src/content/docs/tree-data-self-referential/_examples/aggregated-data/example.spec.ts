import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Example', async ({ agIdFor }) => {
        // Verify group rows with aggregated values
        await expect(agIdFor.autoGroupCell('1')).toContainText('Desktop', { useInnerText: true });
        await expect(agIdFor.cell('1', 'items')).toContainText('4'); // Aggregated sum: 1+1+1+1
        await expect(agIdFor.cell('1', 'items_1')).toContainText('1'); // Provided value

        await expect(agIdFor.autoGroupCell('2')).toContainText('ProjectAlpha', { useInnerText: true });
        await expect(agIdFor.cell('2', 'items')).toContainText('2'); // Aggregated sum: 1+1

        // Verify leaf rows
        await expect(agIdFor.cell('3', 'items')).toContainText('1');
        await expect(agIdFor.cell('3', 'items_1')).toContainText('1');

        await expect(agIdFor.cell('4', 'items')).toContainText('1');
        await expect(agIdFor.cell('4', 'items_1')).toContainText('1');

        await expect(agIdFor.cell('5', 'items')).toContainText('1');
        await expect(agIdFor.cell('6', 'items')).toContainText('1');
    });
});
