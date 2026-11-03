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
 * Initial order, all groups expanded (groupDefaultExpanded: -1), row ids from data.ts:
 *  0: 1 Launch Website          10: 16 Keyword Research
 *  1: 2   Design Landing Page   11: 17 On-Page SEO
 *  2: 3   Implement Backend     12: 9  Mobile App
 *  3: 4     Set Up Database     13: 10   UI Design
 *  4: 5     API Endpoints       14: 11   Push Notifications
 *  5: 6       User Auth         15: 19   App Store Submission
 *  6: 7       Payment Integr.   16: 12 Marketing Campaign
 *  7: 18    Server Deployment   ...
 *  8: 8   Testing
 *  9: 15  SEO Optimization
 */
test.agExample(import.meta, () => {
    test.eachFramework('renders the parentId tree expanded', async ({ agIdFor, page }) => {
        await waitForGridContent(page);

        await expect(agIdFor.autoGroupCell('1')).toContainText('Launch Website', { useInnerText: true });
        await expect(agIdFor.cell('1', 'assignee')).toContainText('Alice');
        await expect(agIdFor.autoGroupExpanded('5')).toBeVisible();
        await expect(agIdFor.rowNode('6')).toHaveClass(/ag-row-level-3/);
        await expectRowIdAtIndex(page, 8, '8');
        await expectRowIdAtIndex(page, 12, '9');
        await expect(agIdFor.dragHandle('8', AUTO_COL)).toBeVisible();
    });

    test.eachFramework('dropping on the upper part of a row reorders above it', async ({ agIdFor, page }) => {
        await waitForGridContent(page);

        await startRowDrag(page, agIdFor.dragHandle('8', AUTO_COL));
        await dragOverRow(page, agIdFor.rowNode('2'), 'above');

        // suppressMoveWhenRowDragging: rows stay put while the target row is highlighted
        await expect(agIdFor.rowNode('2')).toHaveClass(/ag-row-highlight-above/);
        await expectRowIdAtIndex(page, 8, '8');

        await dropRow(page);

        await expectRowIdAtIndex(page, 1, '8');
        await expectRowIdAtIndex(page, 2, '2');
        await expect(agIdFor.rowNode('8')).toHaveClass(/ag-row-level-1/);
        await expect(agIdFor.rowNode('2')).not.toHaveClass(/ag-row-highlight-above/);
    });

    test.eachFramework('dropping in the middle of a parent makes the row its child', async ({ agIdFor, page }) => {
        await waitForGridContent(page);

        await startRowDrag(page, agIdFor.dragHandle('8', AUTO_COL));
        await dragOverRow(page, agIdFor.rowNode('3'), 'inside');
        // Over an expanded parent, the drop is shown as an insert above its first child
        await expect(agIdFor.rowNode('4')).toHaveClass(/ag-row-highlight-above/);
        await dropRow(page);

        // Testing becomes the first child of Implement Backend
        await expectRowIdAtIndex(page, 2, '3');
        await expectRowIdAtIndex(page, 3, '8');
        await expectRowIdAtIndex(page, 4, '4');
        await expect(agIdFor.rowNode('8')).toHaveClass(/ag-row-level-2/);
    });

    test.eachFramework('moving a parent moves its whole subtree', async ({ agIdFor, page }) => {
        await waitForGridContent(page);

        await startRowDrag(page, agIdFor.dragHandle('5', AUTO_COL));
        await dragOverRow(page, agIdFor.rowNode('9'), 'inside');
        await expect(agIdFor.rowNode('10')).toHaveClass(/ag-row-highlight-above/);
        await dropRow(page);

        // API Endpoints and its children leave Implement Backend for Mobile App
        await expectRowIdAtIndex(page, 4, '18');
        await expectRowIdAtIndex(page, 9, '9');
        await expectRowIdAtIndex(page, 10, '5');
        await expectRowIdAtIndex(page, 11, '6');
        await expectRowIdAtIndex(page, 12, '7');
        await expectRowIdAtIndex(page, 13, '10');
        await expect(agIdFor.rowNode('5')).toHaveClass(/ag-row-level-1/);
        await expect(agIdFor.rowNode('6')).toHaveClass(/ag-row-level-2/);
    });

    test.eachFramework('holding over a leaf converts it into a parent', async ({ agIdFor, page }) => {
        await waitForGridContent(page);

        await expect(agIdFor.autoGroupExpanded('2')).not.toBeVisible();

        await startRowDrag(page, agIdFor.dragHandle('8', AUTO_COL));
        await dragOverRow(page, agIdFor.rowNode('2'), 'inside');
        // After rowDragInsertDelay the leaf accepts the row as a child
        await expect(agIdFor.rowNode('2')).toHaveClass(/ag-row-highlight-inside/);
        await dropRow(page);

        await expect(agIdFor.autoGroupExpanded('2')).toBeVisible();
        await expectRowIdAtIndex(page, 1, '2');
        await expectRowIdAtIndex(page, 2, '8');
        await expect(agIdFor.rowNode('8')).toHaveClass(/ag-row-level-2/);
    });

    test.eachFramework('a parent cannot be moved into its own child', async ({ agIdFor, page }) => {
        await waitForGridContent(page);

        await startRowDrag(page, agIdFor.dragHandle('3', AUTO_COL));
        await dragOverRow(page, agIdFor.rowNode('5'), 'inside');
        // The drag is under way, but the grid refuses a drop that would make Implement Backend its own ancestor
        await expect(page.locator('.ag-dnd-ghost')).toHaveClass(/ag-dnd-ghost-not-allowed/);
        await dropRow(page);

        await expectRowIdAtIndex(page, 2, '3');
        await expectRowIdAtIndex(page, 4, '5');
        await expect(agIdFor.rowNode('3')).toHaveClass(/ag-row-level-1/);
        await expect(agIdFor.rowNode('5')).toHaveClass(/ag-row-level-2/);
    });
});
