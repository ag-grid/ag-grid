import type { Locator, Page } from '@playwright/test';
import {
    ensureGridReady,
    expect,
    expectRowIdAtIndex,
    test,
    waitForGridContent,
    waitForRowAnimations,
} from '@utils/grid/test-utils';

/**
 * Drags a row by its handle and drops it over the target cell's row, at `targetFraction` of the
 * target's height (below the middle drops after the target row, above the middle before it).
 * `whileDragging` runs with the mouse button still held, before the drop.
 */
async function dragRow(
    page: Page,
    handle: Locator,
    target: Locator,
    targetFraction: number,
    whileDragging?: () => Promise<void>
) {
    const handleBox = (await handle.boundingBox())!;
    const targetBox = (await target.boundingBox())!;
    const startX = handleBox.x + handleBox.width / 2;
    const startY = handleBox.y + handleBox.height / 2;

    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(startX, startY + 10, { steps: 5 });
    await page.mouse.move(startX, targetBox.y + targetBox.height * targetFraction, { steps: 10 });
    await expect(page.locator('.ag-dnd-ghost')).toBeVisible();
    await whileDragging?.();
    await page.mouse.up();
    await waitForRowAnimations(page);
}

async function selectRows(agIdFor: { selectionColumnCheckbox(rowId: string): Locator }, rowIds: string[]) {
    for (const rowId of rowIds) {
        await agIdFor.selectionColumnCheckbox(rowId).click();
    }
}

test.agExample(import.meta, () => {
    // rowDragMultiRow=true with rowSelection.mode='multiRow': dragging a selected row drags the
    // whole selection with it.
    test.eachFramework('dragging a selected row moves all selected rows together', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await selectRows(agIdFor, ['0', '1']);
        await expect(agIdFor.rowNode('0')).toHaveClass(/ag-row-selected/);
        await expect(agIdFor.rowNode('1')).toHaveClass(/ag-row-selected/);

        // Drag selected row 0 below row 4; the drag ghost reports both selected rows.
        await dragRow(page, agIdFor.dragHandle('0', 'athlete'), agIdFor.cell('4', 'country'), 0.75, () =>
            expect(page.locator('.ag-dnd-ghost-label')).toContainText('2 rows')
        );

        // Rows 0 and 1 moved together, keeping their relative order: the block is placed at the
        // pointer's position (index 4, where row 4 was), so rows 2-5 shift up above it.
        await expectRowIdAtIndex(page, 0, '2');
        await expectRowIdAtIndex(page, 1, '3');
        await expectRowIdAtIndex(page, 2, '4');
        await expectRowIdAtIndex(page, 3, '5');
        await expectRowIdAtIndex(page, 4, '0');
        await expectRowIdAtIndex(page, 5, '1');
        await expectRowIdAtIndex(page, 6, '6');
    });

    test.eachFramework(
        'dragging an unselected row moves only that row while others are selected',
        async ({ agIdFor, page }) => {
            await ensureGridReady(page);
            await waitForGridContent(page);

            await selectRows(agIdFor, ['0', '1']);
            await expect(agIdFor.rowNode('3')).not.toHaveClass(/ag-row-selected/);

            // Drag unselected row 3 (Natalie Coughlin) above row 0.
            await dragRow(page, agIdFor.dragHandle('3', 'athlete'), agIdFor.cell('0', 'country'), 0.25);

            await expectRowIdAtIndex(page, 0, '3');
            await expectRowIdAtIndex(page, 1, '0');
            await expectRowIdAtIndex(page, 2, '1');
            await expectRowIdAtIndex(page, 3, '2');
            await expectRowIdAtIndex(page, 4, '4');

            // The selection is untouched: rows 0 and 1 stay selected, row 3 stays unselected.
            await expect(agIdFor.rowNode('0')).toHaveClass(/ag-row-selected/);
            await expect(agIdFor.rowNode('1')).toHaveClass(/ag-row-selected/);
            await expect(agIdFor.rowNode('3')).not.toHaveClass(/ag-row-selected/);
        }
    );
});
