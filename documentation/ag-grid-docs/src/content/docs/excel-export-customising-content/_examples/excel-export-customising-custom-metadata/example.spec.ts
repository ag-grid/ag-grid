import { ensureGridReady, expect, test, waitForGridContent, waitForRowAnimations } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Report rows render as provided', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // First inline report row.
        await expect(agIdFor.cell('0', 'department')).toContainText('Security');
        await expect(agIdFor.cell('0', 'reportId')).toContainText('RPT-001');
        await expect(agIdFor.cell('0', 'owner')).toContainText('Morgan');
        await expect(agIdFor.cell('0', 'cost')).toContainText('1200');
    });

    test.eachFramework('Sorting by cost reorders the rows', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Finance has the highest cost (5400); it starts at index 1.
        const financeRow = agIdFor.rowNode('1');
        await expect(financeRow).toHaveAttribute('row-index', '1');

        await agIdFor.headerCell('cost').click();
        await waitForRowAnimations(page);
        await expect(financeRow).not.toHaveAttribute('row-index', '0');
        await agIdFor.headerCell('cost').click();
        await waitForRowAnimations(page);
        await expect(financeRow).toHaveAttribute('row-index', '0');
    });
});
