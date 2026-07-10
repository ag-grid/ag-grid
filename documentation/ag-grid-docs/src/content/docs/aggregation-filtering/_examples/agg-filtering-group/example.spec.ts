import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

const usGroupId = 'row-group-country-United States';
const russiaGroupId = 'row-group-country-Russia';

test.agExample(import.meta, () => {
    test.eachFramework('Group rows show the aggregated total', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // country totals summed across all leaf rows: United States => 1312 (unique max).
        await expect(agIdFor.autoGroupCell(usGroupId)).toContainText('United States', { useInnerText: true });
        await expect(agIdFor.cell(usGroupId, 'total')).toContainText('1312');

        // groupDefaultExpanded: -1 => all groups expanded, first leaf (Michael Phelps, total 8) is visible.
        await expect(agIdFor.cell('0', 'total')).toContainText('8');
    });

    test.eachFramework('Filter applies to group aggregates but not leaf rows', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Filter total = 1312: only the United States group aggregate matches.
        const totalFilterInput = agIdFor.numberFilterInstanceInput({ source: 'floating-filter', colId: 'total' });
        await totalFilterInput.fill('1312');
        await totalFilterInput.press('Enter');

        // The matching group survives, other groups are filtered out.
        await expect(agIdFor.rowNode(usGroupId)).toHaveCount(1);
        await expect(agIdFor.rowNode(russiaGroupId)).toHaveCount(0);

        // The groupAggFiltering callback only filters group rows, so leaf rows are not filtered
        // by the aggregate value: the first US leaf (total 8) is still shown.
        await expect(agIdFor.cell('0', 'total')).toContainText('8');
    });
});
