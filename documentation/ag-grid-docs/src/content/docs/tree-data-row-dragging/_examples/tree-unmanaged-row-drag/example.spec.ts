import {
    dragOverRow,
    dropRow,
    expect,
    expectRowIdAtIndex,
    startRowDrag,
    test,
    waitForGridContent,
    waitForRowAnimations,
} from '@utils/grid/test-utils';

const AUTO_COL = 'ag-Grid-AutoColumn';

/*
 * Initial order, all folders expanded, row ids from data.ts (getDataPath):
 *  0: 1  Documents            8: 9   stuff
 *  1: 2    txt                9: 10    xyz.txt       1.1 MB
 *  2: 3      notes.txt 14.7  10: 11 Music
 *  3: 4    pdf               11: 12   mp3
 *  4: 5      book.pdf  2.1   12: 13     theme.mp3    14.3 MB
 *  5: 6      cv.pdf    2.4   13: 14 Misc
 *  6: 7    xls               14: 15   temp.txt       101 MB
 *  7: 8      accounts.xls 4.3
 * Folder sizes are summed: Documents 24.6, pdf 4.5, xls 4.3, Music 14.3, Misc 101.0 MB.
 */
test.agExample(import.meta, () => {
    test.eachFramework('renders the file tree with aggregated sizes', async ({ agIdFor, page }) => {
        await waitForGridContent(page);

        await expect(agIdFor.autoGroupCell('5')).toContainText('book.pdf', { useInnerText: true });
        await expect(agIdFor.cell('1', 'size')).toContainText('24.6 MB');
        await expect(agIdFor.cell('4', 'size')).toContainText('4.5 MB');
        await expect(agIdFor.cell('14', 'size')).toContainText('101.0 MB');
        await expect(agIdFor.cell('3', 'dateModified')).toContainText('May 21 2017 01:50:00 PM');
        await expect(agIdFor.rowNode('15')).toHaveClass(/ag-row-level-1/);
    });

    test.eachFramework('rows are moved while dragging and stay moved on drop', async ({ agIdFor, page }) => {
        await waitForGridContent(page);

        await startRowDrag(page, agIdFor.dragHandle('15', AUTO_COL));
        await dragOverRow(page, agIdFor.rowNode('11'), 'inside');

        // onRowDragMove updates the row data before the drop
        await expect(agIdFor.cell('11', 'size')).toContainText('115.3 MB');
        await expect(agIdFor.cell('14', 'size')).not.toContainText('MB');

        await dropRow(page);

        await expect(agIdFor.cell('11', 'size')).toContainText('115.3 MB');
        await expect(agIdFor.cell('14', 'size')).not.toContainText('MB');
        await expect(agIdFor.rowNode('15')).toHaveClass(/ag-row-level-1/);
        await expect(agIdFor.autoGroupExpanded('14')).not.toBeVisible();
    });

    test.eachFramework('pressing Escape while dragging reverts the move', async ({ agIdFor, page }) => {
        await waitForGridContent(page);

        await startRowDrag(page, agIdFor.dragHandle('15', AUTO_COL));
        await dragOverRow(page, agIdFor.rowNode('11'), 'inside');
        await expect(agIdFor.cell('11', 'size')).toContainText('115.3 MB');

        await page.keyboard.press('Escape');
        await waitForRowAnimations(page);

        await expect(agIdFor.cell('11', 'size')).toContainText('14.3 MB');
        await expect(agIdFor.cell('14', 'size')).toContainText('101.0 MB');
        await expectRowIdAtIndex(page, 14, '15');

        await page.mouse.up();
        await expect(agIdFor.cell('14', 'size')).toContainText('101.0 MB');
    });

    test.eachFramework('without Shift a row can be moved to another folder', async ({ agIdFor, page }) => {
        await waitForGridContent(page);

        await startRowDrag(page, agIdFor.dragHandle('5', AUTO_COL));
        await dragOverRow(page, agIdFor.rowNode('8'), 'inside');
        await dropRow(page);

        await expect(agIdFor.cell('7', 'size')).toContainText('6.4 MB');
        await expect(agIdFor.cell('4', 'size')).toContainText('2.4 MB');
    });

    test.eachFramework('holding Shift only reorders the row inside its own folder', async ({ agIdFor, page }) => {
        await waitForGridContent(page);

        await page.keyboard.down('Shift');
        await startRowDrag(page, agIdFor.dragHandle('5', AUTO_COL));
        // Passing over cv.pdf reorders book.pdf after it; xls and accounts.xls are in other folders
        await dragOverRow(page, agIdFor.rowNode('8'), 'inside');
        await dropRow(page);
        await page.keyboard.up('Shift');

        await expectRowIdAtIndex(page, 4, '6');
        await expectRowIdAtIndex(page, 5, '5');
        await expect(agIdFor.rowNode('5')).toHaveClass(/ag-row-level-2/);
        await expect(agIdFor.cell('4', 'size')).toContainText('4.5 MB');
        await expect(agIdFor.cell('7', 'size')).toContainText('4.3 MB');
    });

    test.eachFramework('a moved folder keeps its collapsed state', async ({ agIdFor, page }) => {
        await waitForGridContent(page);

        await agIdFor.autoGroupExpanded('4').click();
        await waitForRowAnimations(page);
        await expect(agIdFor.rowNode('5')).toHaveCount(0);

        // Drag pdf into the adjacent txt folder. The only row crossed on the way is notes.txt, which lives
        // in txt, so every live move along the path targets the same folder.
        await startRowDrag(page, agIdFor.dragHandle('4', AUTO_COL));
        await dragOverRow(page, agIdFor.rowNode('2'), 'inside');
        await dropRow(page);

        // txt: notes.txt 14.7 + pdf 4.5
        await expect(agIdFor.cell('2', 'size')).toContainText('19.2 MB');
        await expect(agIdFor.rowNode('4')).toHaveClass(/ag-row-level-2/);
        await expect(agIdFor.autoGroupContracted('4')).toBeVisible();
        await expect(agIdFor.rowNode('5')).toHaveCount(0);

        await agIdFor.autoGroupContracted('4').click();
        await expect(agIdFor.rowNode('5')).toHaveClass(/ag-row-level-3/);
    });
});
