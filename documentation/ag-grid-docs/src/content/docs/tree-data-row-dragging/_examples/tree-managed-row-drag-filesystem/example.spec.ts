import type { Page } from '@playwright/test';
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

const dragGhost = (page: Page) => page.locator('.ag-dnd-ghost');

/*
 * Initial order, all groups expanded, row ids from data.ts:
 *  0: 1   Documents (folder)          6: 101   subfolder (folder)
 *  1: 2     notes.txt  14.7 MB        7: 102     temp.txt  101 MB
 *  2: 3     accounts.xls 4.3 MB       8: 103   notes.txt   400 MB
 *  3: 4     xyz.txt    1.1 MB         9: 11  Music (folder)
 *  4: 5     var (empty folder)       10: 12    mp3 (folder)
 *  5: 100 READONLY (readonly-folder) 11: 13      theme.mp3 14.3 MB
 * Sizes are summed: Documents 20.1 MB, READONLY 501.0 MB, Music 14.3 MB.
 */
test.agExample(import.meta, () => {
    test.eachFramework('renders the file system with aggregated sizes', async ({ agIdFor, page }) => {
        await waitForGridContent(page);

        await expect(agIdFor.autoGroupCell('1')).toContainText('Documents', { useInnerText: true });
        await expect(agIdFor.cell('1', 'size')).toContainText('20.1 MB');
        await expect(agIdFor.cell('100', 'size')).toContainText('501.0 MB');
        await expect(agIdFor.cell('11', 'size')).toContainText('14.3 MB');
        await expect(agIdFor.cell('100', 'type')).toContainText('readonly-folder');
        await expect(agIdFor.cell('2', 'dateModified')).toContainText('2017-05-21');
    });

    test.eachFramework('a folder can be moved into another folder', async ({ agIdFor, page }) => {
        await waitForGridContent(page);

        await startRowDrag(page, agIdFor.dragHandle('12', AUTO_COL));
        await dragOverRow(page, agIdFor.rowNode('1'), 'inside');
        // Over an expanded folder, the drop is shown as an insert above its first child
        await expect(agIdFor.rowNode('2')).toHaveClass(/ag-row-highlight-above/);
        await expect(dragGhost(page)).not.toHaveClass(/ag-dnd-ghost-not-allowed/);
        await dropRow(page);

        await expectRowIdAtIndex(page, 1, '12');
        await expectRowIdAtIndex(page, 2, '13');
        await expect(agIdFor.rowNode('12')).toHaveClass(/ag-row-level-1/);
        await expect(agIdFor.rowNode('13')).toHaveClass(/ag-row-level-2/);
        await expect(agIdFor.cell('1', 'size')).toContainText('34.4 MB');
        await expect(agIdFor.cell('11', 'size')).not.toContainText('MB');
    });

    test.eachFramework('dropping into a file places the row beside it instead', async ({ agIdFor, page }) => {
        await waitForGridContent(page);

        // A file cannot become a folder: theme.mp3 dropped on the middle of notes.txt is placed
        // next to it in Documents, and notes.txt stays a file.
        await startRowDrag(page, agIdFor.dragHandle('13', AUTO_COL));
        await dragOverRow(page, agIdFor.rowNode('2'), 'inside');
        await expect(agIdFor.rowNode('2')).toHaveClass(/ag-row-highlight-(above|below)/);
        await dropRow(page);

        await expect(agIdFor.rowNode('13')).toHaveClass(/ag-row-level-1/);
        await expect(agIdFor.autoGroupExpanded('2')).not.toBeVisible();
        await expect(agIdFor.rowNode('2')).toHaveClass(/ag-row-level-1/);
        await expect(agIdFor.cell('1', 'size')).toContainText('34.4 MB');
        await expect(agIdFor.cell('12', 'size')).not.toContainText('MB');
    });

    test.eachFramework('holding over an empty folder drops the row into it', async ({ agIdFor, page }) => {
        await waitForGridContent(page);

        await expect(agIdFor.autoGroupExpanded('5')).not.toBeVisible();

        await startRowDrag(page, agIdFor.dragHandle('4', AUTO_COL));
        await dragOverRow(page, agIdFor.rowNode('5'), 'inside');
        // After rowDragInsertDelay the empty folder accepts the row as a child
        await expect(agIdFor.rowNode('5')).toHaveClass(/ag-row-highlight-inside/);
        await dropRow(page);

        await expect(agIdFor.autoGroupExpanded('5')).toBeVisible();
        await expect(agIdFor.rowNode('4')).toHaveClass(/ag-row-level-2/);
        await expect(agIdFor.cell('5', 'size')).toContainText('1.1 MB');
    });

    test.eachFramework('nothing can be dropped into the READONLY folder', async ({ agIdFor, page }) => {
        await waitForGridContent(page);

        await startRowDrag(page, agIdFor.dragHandle('4', AUTO_COL));
        await dragOverRow(page, agIdFor.rowNode('100'), 'inside');
        await expect(dragGhost(page)).toHaveClass(/ag-dnd-ghost-not-allowed/);
        await dropRow(page);

        await expectRowIdAtIndex(page, 3, '4');
        await expect(agIdFor.rowNode('4')).toHaveClass(/ag-row-level-1/);
        await expect(agIdFor.cell('1', 'size')).toContainText('20.1 MB');
        await expect(agIdFor.cell('100', 'size')).toContainText('501.0 MB');
    });

    test.eachFramework('nothing can be dragged out of the READONLY folder', async ({ agIdFor, page }) => {
        await waitForGridContent(page);

        await startRowDrag(page, agIdFor.dragHandle('103', AUTO_COL));
        await dragOverRow(page, agIdFor.rowNode('11'), 'inside');
        await expect(dragGhost(page)).toHaveClass(/ag-dnd-ghost-not-allowed/);
        await dropRow(page);

        await expectRowIdAtIndex(page, 8, '103');
        await expect(agIdFor.rowNode('103')).toHaveClass(/ag-row-level-1/);
        await expect(agIdFor.cell('100', 'size')).toContainText('501.0 MB');
        await expect(agIdFor.cell('11', 'size')).toContainText('14.3 MB');
    });

    test.eachFramework('the READONLY folder cannot change parent', async ({ agIdFor, page }) => {
        await waitForGridContent(page);

        await startRowDrag(page, agIdFor.dragHandle('100', AUTO_COL));
        await dragOverRow(page, agIdFor.rowNode('11'), 'inside');
        await expect(dragGhost(page)).toHaveClass(/ag-dnd-ghost-not-allowed/);
        await dropRow(page);

        await expectRowIdAtIndex(page, 5, '100');
        await expect(agIdFor.rowNode('100')).toHaveClass(/ag-row-level-0/);
        await expect(agIdFor.cell('11', 'size')).toContainText('14.3 MB');
    });
});
