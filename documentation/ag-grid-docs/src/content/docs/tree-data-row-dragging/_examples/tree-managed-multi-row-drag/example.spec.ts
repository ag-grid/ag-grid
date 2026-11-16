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
 * Initial order, all groups expanded, row ids from data.ts (children arrays):
 *  0: 1  Launch Website           8: 8    Testing
 *  1: 2    Design Landing Page    9: 15   SEO Optimization
 *  2: 3    Implement Backend     10: 16     Keyword Research
 *  3: 4      Set Up Database     11: 17     On-Page SEO
 *  4: 5      API Endpoints       12: 9  Mobile App
 *  5: 6        User Auth         13: 10   UI Design
 *  6: 7        Payment Integr.   14: 11   Push Notifications
 *  7: 18     Server Deployment   15: 19   App Store Submission
 */
test.agExample(import.meta, () => {
    test.eachFramework('dragging a selected row drags the whole selection', async ({ agIdFor, page }) => {
        await waitForGridContent(page);

        // Select two rows on different levels
        await agIdFor.selectionColumnCheckbox('8').click();
        await agIdFor.selectionColumnCheckbox('16').click();
        await expect(agIdFor.rowNode('8')).toHaveClass(/ag-row-selected/);
        await expect(agIdFor.rowNode('16')).toHaveClass(/ag-row-selected/);

        await startRowDrag(page, agIdFor.dragHandle('8', AUTO_COL));
        await dragOverRow(page, agIdFor.rowNode('9'), 'inside');
        await expect(agIdFor.rowNode('10')).toHaveClass(/ag-row-highlight-above/);
        await dropRow(page);

        // Both selected rows become the first children of Mobile App
        await expectRowIdAtIndex(page, 7, '18');
        await expectRowIdAtIndex(page, 8, '15');
        await expectRowIdAtIndex(page, 9, '17');
        await expectRowIdAtIndex(page, 10, '9');
        await expectRowIdAtIndex(page, 11, '8');
        await expectRowIdAtIndex(page, 12, '16');
        await expectRowIdAtIndex(page, 13, '10');
        await expect(agIdFor.rowNode('8')).toHaveClass(/ag-row-level-1/);
        await expect(agIdFor.rowNode('16')).toHaveClass(/ag-row-level-1/);
    });

    test.eachFramework('dragging an unselected row drags only that row', async ({ agIdFor, page }) => {
        await waitForGridContent(page);

        await agIdFor.selectionColumnCheckbox('8').click();
        await agIdFor.selectionColumnCheckbox('16').click();
        await expect(agIdFor.rowNode('16')).toHaveClass(/ag-row-selected/);

        await startRowDrag(page, agIdFor.dragHandle('2', AUTO_COL));
        await dragOverRow(page, agIdFor.rowNode('9'), 'inside');
        await expect(agIdFor.rowNode('10')).toHaveClass(/ag-row-highlight-above/);
        await dropRow(page);

        // Only Design Landing Page moves under Mobile App; the selected rows stay where they were
        await expectRowIdAtIndex(page, 1, '3');
        await expectRowIdAtIndex(page, 7, '8');
        await expectRowIdAtIndex(page, 9, '16');
        await expectRowIdAtIndex(page, 11, '9');
        await expectRowIdAtIndex(page, 12, '2');
        await expect(agIdFor.rowNode('2')).toHaveClass(/ag-row-level-1/);
        await expect(agIdFor.rowNode('16')).toHaveClass(/ag-row-level-2/);
    });
});
