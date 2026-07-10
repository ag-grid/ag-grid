import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    const grandTotalId = 'rowGroupFooter_ROOT_NODE_ID';
    const usGroupId = 'row-group-country-United States';
    const usFooterId = 'rowGroupFooter_row-group-country-United States';

    test.eachFramework('Grand total row uses the custom totalValueGetter label', async ({ agIdFor }) => {
        // totalValueGetter returns 'Grand Total' at the root level.
        await expect(agIdFor.autoGroupCell(grandTotalId).first()).toContainText('Grand Total', { useInnerText: true });
        await expect(agIdFor.cell(grandTotalId, 'gold').first()).toContainText('3143');
        await expect(agIdFor.cell(grandTotalId, 'silver').first()).toContainText('3131');
        await expect(agIdFor.cell(grandTotalId, 'bronze').first()).toContainText('3255');
    });

    test.eachFramework('Group total row uses the custom "Sub Total (key)" label', async ({ agIdFor }) => {
        // Groups are collapsed by default — expand United States to reveal its footer.
        await agIdFor.autoGroupContracted(usGroupId).click();
        await expect(agIdFor.autoGroupCell(usFooterId)).toContainText('Sub Total (United States)', {
            useInnerText: true,
        });
        await expect(agIdFor.cell(usFooterId, 'gold')).toContainText('552');
        await expect(agIdFor.cell(usFooterId, 'silver')).toContainText('440');
        await expect(agIdFor.cell(usFooterId, 'bronze')).toContainText('320');
    });
});
