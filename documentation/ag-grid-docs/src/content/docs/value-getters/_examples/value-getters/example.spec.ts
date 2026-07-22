import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    // rowData: a = i % 4, b = i % 7 for i in 0..99.
    // colIds: 'ID #' (anonymous) -> '0', 'a', 'b', 'A + B' -> 'aPlusB',
    //         'A * 1000' -> '1', 'B * 137' -> '2', 'Chain' -> '3', 'Const' -> '4'.

    test.eachFramework('ID # valueGetter prints the row node id', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // hashValueGetter returns Number(node.id); default node ids are the row index.
        await expect(agIdFor.cell('0', '0')).toContainText('0');
        await expect(agIdFor.cell('5', '0')).toContainText('5');
    });

    test.eachFramework('arithmetic and chained valueGetters compute derived values', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Row 5: a = 5 % 4 = 1, b = 5 % 7 = 5.
        await expect(agIdFor.cell('5', 'a')).toContainText('1');
        await expect(agIdFor.cell('5', 'b')).toContainText('5');
        await expect(agIdFor.cell('5', 'aPlusB')).toContainText('6'); // a + b
        await expect(agIdFor.cell('5', '1')).toContainText('1000'); // a * 1000
        await expect(agIdFor.cell('5', '2')).toContainText('685'); // b * 137
        await expect(agIdFor.cell('5', '3')).toContainText('6000'); // chain: (a + b) * 1000
    });

    test.eachFramework('constant valueGetter returns the same value for every row', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await expect(agIdFor.cell('0', '4')).toContainText('99999');
        await expect(agIdFor.cell('5', '4')).toContainText('99999');
    });
});
