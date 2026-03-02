import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Example', async ({ agIdFor }) => {
        // Validate collapsed Netherlands group row
        await expect(agIdFor.autoGroupCell('row-group-country-Netherlands')).toContainText('Netherlands (4)', {
            useInnerText: true,
        });
        await expect(agIdFor.cell('row-group-country-Netherlands', 'bronze')).toContainText('4');
        await expect(agIdFor.cell('row-group-country-Netherlands', 'silver')).toContainText('0.75');
        await expect(agIdFor.cell('row-group-country-Netherlands', 'gold')).toContainText('3');

        // Expand Netherlands group row
        await agIdFor.autoGroupContracted('row-group-country-Netherlands').click();

        // Validate group total (footer) row for Netherlands
        const netherlandsFooterId = 'rowGroupFooter_row-group-country-Netherlands';
        await expect(agIdFor.autoGroupCell(netherlandsFooterId)).toContainText('Total Netherlands', {
            useInnerText: true,
        });
        await expect(agIdFor.cell(netherlandsFooterId, 'bronze')).toContainText('4');
        await expect(agIdFor.cell(netherlandsFooterId, 'silver')).toContainText('0.75');
        await expect(agIdFor.cell(netherlandsFooterId, 'gold')).toContainText('3');

        // Validate Grand Total row
        const grandTotalId = 'rowGroupFooter_ROOT_NODE_ID';
        await expect(agIdFor.autoGroupCell(grandTotalId).first()).toContainText('Total', {
            useInnerText: true,
        });
        await expect(agIdFor.cell(grandTotalId, 'bronze').first()).toContainText('35');
        await expect(agIdFor.cell(grandTotalId, 'silver').first()).toContainText('1.258');
        await expect(agIdFor.cell(grandTotalId, 'gold').first()).toContainText('2');
    });
});
