import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Example', async ({ agIdFor, page }) => {
        // Verify data node D is visible and has empty groupType (has data)
        await expect(agIdFor.autoGroupCell('1')).toContainText('D', { useInnerText: true });
        await expect(agIdFor.cell('1', 'groupType')).toHaveText('');

        // Verify data node C is visible under filler nodes A > B
        await expect(agIdFor.autoGroupCell('0')).toContainText('C', { useInnerText: true });
        await expect(agIdFor.cell('0', 'groupType')).toHaveText('');

        // Verify filler groups exist (A and B are filler nodes showing 'Filler Group')
        const fillerCells = page.locator('[col-id="groupType"]').filter({ hasText: 'Filler Group' });
        await expect(fillerCells).toHaveCount(2);
    });
});
