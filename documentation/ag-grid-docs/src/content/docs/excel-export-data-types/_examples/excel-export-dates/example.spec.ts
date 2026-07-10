import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    test.eachFramework('Each column reformats the single ISO date source', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // ISO Format column shows the raw source value.
        await expect(agIdFor.cell('0', 'date')).toContainText('2020-05-30T10:01:00');

        // dd/mm/yy value formatter: 30/05/20.
        await expect(agIdFor.cell('0', 'date_1')).toContainText('30/05/20');

        // mm/dd/yy value formatter: 05/30/20.
        await expect(agIdFor.cell('0', 'date_2')).toContainText('05/30/20');

        // Long format: 30/05/2020 10:01:00 AM.
        await expect(agIdFor.cell('0', 'date_3')).toContainText('30/05/2020 10:01:00 AM');
    });

    test.eachFramework('Sorting the ISO Format column reorders the rows', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Data order has the 2020 date (row 0) at the top.
        await expect(agIdFor.rowNode('0')).toHaveAttribute('row-index', '0');

        // Ascending sort floats the earliest date (1995, row 3) to the top.
        await agIdFor.headerCell('date').click();
        await expect(agIdFor.rowNode('3')).toHaveAttribute('row-index', '0');
        await expect(agIdFor.cell('3', 'date')).toContainText('1995-10-04T03:27:00');
    });
});
