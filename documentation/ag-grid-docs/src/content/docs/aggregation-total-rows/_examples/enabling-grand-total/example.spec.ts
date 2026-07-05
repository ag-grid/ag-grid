import { expect, test } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    const grandTotalId = 'rowGroupFooter_ROOT_NODE_ID';

    test.eachFramework('Grand total row shows aggregated totals at the bottom', async ({ agIdFor }) => {
        // Grouped by country only, sum aggregation over the full olympic-winners dataset.
        await expect(agIdFor.autoGroupCell(grandTotalId).first()).toContainText('Total', { useInnerText: true });
        await expect(agIdFor.cell(grandTotalId, 'gold').first()).toContainText('3143');
        await expect(agIdFor.cell(grandTotalId, 'silver').first()).toContainText('3131');
        await expect(agIdFor.cell(grandTotalId, 'bronze').first()).toContainText('3255');
    });

    test.eachFramework('Changing grandTotalRow option toggles the row', async ({ agIdFor, page }) => {
        const dropdown = page.locator('#input-property-value');
        const grandTotalRow = page.locator('[data-testid^="ag-row:row-id=rowGroupFooter_ROOT_NODE_ID"]');

        // Default "bottom" — grand total row present.
        await expect(grandTotalRow.first()).toBeVisible();
        await expect(agIdFor.cell(grandTotalId, 'gold').first()).toContainText('3143');

        // "undefined" — grand total row removed entirely.
        await dropdown.selectOption('undefined');
        await expect(grandTotalRow).toHaveCount(0);

        // "bottom" again — grand total row returns with the same totals.
        await dropdown.selectOption('bottom');
        await expect(agIdFor.cell(grandTotalId, 'gold').first()).toContainText('3143');
    });
});
