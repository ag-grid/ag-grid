import type { Locator } from '@playwright/test';
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

/** Every cell of a row that the example highlights with the `hover-over` cell class rule. */
const highlightedCells = (agIdFor: { cell: (rowId: string, colId: string) => Locator }, rowId: string) => [
    agIdFor.cell(rowId, AUTO_COL),
    agIdFor.cell(rowId, 'dateModified'),
    agIdFor.cell(rowId, 'size'),
];

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
 */
test.agExample(import.meta, () => {
    test.eachFramework('dragging over a folder highlights it as the drop parent', async ({ agIdFor, page }) => {
        await waitForGridContent(page);

        await startRowDrag(page, agIdFor.dragHandle('3', AUTO_COL));
        await dragOverRow(page, agIdFor.rowNode('7'), 'inside');

        for (const cell of highlightedCells(agIdFor, '7')) {
            await expect(cell).toHaveClass(/hover-over/);
        }
        await expect(agIdFor.cell('4', 'size')).not.toHaveClass(/hover-over/);
        // Rows are not rearranged while dragging
        await expectRowIdAtIndex(page, 2, '3');
        await expect(agIdFor.cell('7', 'size')).toContainText('4.3 MB');

        await page.mouse.up();
    });

    test.eachFramework('dragging over a file highlights its parent folder', async ({ agIdFor, page }) => {
        await waitForGridContent(page);

        await startRowDrag(page, agIdFor.dragHandle('3', AUTO_COL));
        await dragOverRow(page, agIdFor.rowNode('5'), 'inside');

        for (const cell of highlightedCells(agIdFor, '4')) {
            await expect(cell).toHaveClass(/hover-over/);
        }
        await expect(agIdFor.cell('5', 'size')).not.toHaveClass(/hover-over/);

        // Moving on to another folder moves the highlight with it
        await dragOverRow(page, agIdFor.rowNode('9'), 'inside');
        await expect(agIdFor.cell('9', 'size')).toHaveClass(/hover-over/);
        await expect(agIdFor.cell('4', 'size')).not.toHaveClass(/hover-over/);

        await page.mouse.up();
    });

    test.eachFramework('dropping moves the row into the highlighted folder', async ({ agIdFor, page }) => {
        await waitForGridContent(page);

        await startRowDrag(page, agIdFor.dragHandle('3', AUTO_COL));
        await dragOverRow(page, agIdFor.rowNode('5'), 'inside');
        await expect(agIdFor.cell('4', 'size')).toHaveClass(/hover-over/);
        await dropRow(page);

        // notes.txt (14.7 MB) moves from txt into pdf
        await expect(agIdFor.cell('4', 'size')).toContainText('19.2 MB');
        await expect(agIdFor.cell('2', 'size')).not.toContainText('MB');
        await expect(agIdFor.rowNode('3')).toHaveClass(/ag-row-level-2/);
        await expect(agIdFor.cell('1', 'size')).toContainText('24.6 MB');
        // The highlight is cleared once the drag ends
        await expect(page.locator('.hover-over')).toHaveCount(0);
    });
});
