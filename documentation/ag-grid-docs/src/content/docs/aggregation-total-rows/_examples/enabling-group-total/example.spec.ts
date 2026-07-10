import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    const usGroupId = 'row-group-country-United States';
    const usFooterId = 'rowGroupFooter_row-group-country-United States';

    test.eachFramework('Group total row shows subtotals at the bottom of each group', async ({ agIdFor }) => {
        // Country groups are expanded by default (groupDefaultExpanded: 1) and each shows a footer.
        await expect(agIdFor.autoGroupCell(usFooterId)).toContainText('Total United States', { useInnerText: true });
        await expect(agIdFor.cell(usFooterId, 'gold')).toContainText('552');
        await expect(agIdFor.cell(usFooterId, 'silver')).toContainText('440');
        await expect(agIdFor.cell(usFooterId, 'bronze')).toContainText('320');
    });

    test.eachFramework('Changing groupTotalRow option toggles the group footers', async ({ agIdFor, page }) => {
        const dropdown = page.locator('#input-property-value');
        const usFooter = page.locator('[data-testid="ag-row:row-id=rowGroupFooter_row-group-country-United States"]');

        // Default "bottom" — footer present at the bottom of the US group.
        await expect(usFooter.first()).toBeVisible();
        await expect(agIdFor.cell(usFooterId, 'gold')).toContainText('552');

        // "undefined" — group footers removed.
        await dropdown.selectOption('undefined');
        await expect(usFooter).toHaveCount(0);

        // "bottom" again — footer returns.
        await dropdown.selectOption('bottom');
        await expect(agIdFor.cell(usFooterId, 'gold')).toContainText('552');
    });
});
