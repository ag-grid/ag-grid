import {
    dragOverRow,
    dropRow,
    expect,
    expectRowIdAtIndex,
    startRowDrag,
    test,
    waitForGridContent,
} from '@utils/grid/test-utils';

const AUTO_COL = 'ag-Grid-AutoColumn';

/*
 * Initial order, all folders expanded, row ids from data.ts (parentId):
 *  0: 1  Documents            9: 10    xyz.txt       1.1 MB
 *  1: 2    txt               10: 11 Music
 *  2: 3      notes.txt 14.7  11: 12   mp3
 *  3: 4    pdf               12: 13     theme.mp3    14.3 MB
 *  4: 5      book.pdf  2.1   13: 14 Misc
 *  5: 6      cv.pdf    2.4   14: 15   temp.txt       101 MB
 *  6: 7    xls               15: 16   temp2.txt      200 MB
 *  7: 8      accounts.xls 4.3 16: 17  temp3.txt      200 MB
 *  8: 9    stuff
 */
test.agExample(import.meta, () => {
    test.eachFramework('dragging over a folder shows an inside drop indicator', async ({ agIdFor, page }) => {
        await waitForGridContent(page);

        await startRowDrag(page, agIdFor.dragHandle('10', AUTO_COL));
        await dragOverRow(page, agIdFor.rowNode('4'), 'inside');
        await expect(agIdFor.rowNode('4')).toHaveClass(/ag-row-highlight-inside/);
        // Rows are not rearranged while dragging
        await expectRowIdAtIndex(page, 9, '10');
        await dropRow(page);

        // xyz.txt is now the first child of pdf
        await expectRowIdAtIndex(page, 3, '4');
        await expectRowIdAtIndex(page, 4, '10');
        await expect(agIdFor.rowNode('10')).toHaveClass(/ag-row-level-2/);
        await expect(agIdFor.cell('4', 'size')).toContainText('5.6 MB');
        await expect(agIdFor.cell('9', 'size')).not.toContainText('MB');
        await expect(page.locator('.ag-row-highlight-inside')).toHaveCount(0);
    });

    test.eachFramework('dragging over a file shows an above indicator in its folder', async ({ agIdFor, page }) => {
        await waitForGridContent(page);

        await startRowDrag(page, agIdFor.dragHandle('15', AUTO_COL));
        await dragOverRow(page, agIdFor.rowNode('5'), 'inside');
        await expect(agIdFor.rowNode('5')).toHaveClass(/ag-row-highlight-above/);
        await dropRow(page);

        // temp.txt is inserted above book.pdf, in the pdf folder
        await expectRowIdAtIndex(page, 4, '15');
        await expectRowIdAtIndex(page, 5, '5');
        await expect(agIdFor.cell('4', 'size')).toContainText('105.5 MB');
        await expect(agIdFor.cell('14', 'size')).toContainText('400.0 MB');
    });

    test.eachFramework('holding Shift only reorders the row inside its own folder', async ({ agIdFor, page }) => {
        await waitForGridContent(page);

        await page.keyboard.down('Shift');
        await startRowDrag(page, agIdFor.dragHandle('5', AUTO_COL));
        await dragOverRow(page, agIdFor.rowNode('8'), 'inside');
        // accounts.xls is in another folder, so the indicator falls back to the last sibling in pdf
        await expect(agIdFor.rowNode('6')).toHaveClass(/ag-row-highlight-below/);
        await dropRow(page);
        await page.keyboard.up('Shift');

        await expectRowIdAtIndex(page, 4, '6');
        await expectRowIdAtIndex(page, 5, '5');
        await expect(agIdFor.cell('4', 'size')).toContainText('4.5 MB');
        await expect(agIdFor.cell('7', 'size')).toContainText('4.3 MB');
    });
});
