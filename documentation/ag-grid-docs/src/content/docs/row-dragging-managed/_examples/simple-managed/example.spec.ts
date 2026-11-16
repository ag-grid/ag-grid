import type { Locator, Page } from '@playwright/test';
import {
    clickHeaderToSort,
    ensureGridReady,
    expect,
    expectRowIdAtIndex,
    test,
    waitForGridContent,
    waitForRowAnimations,
} from '@utils/grid/test-utils';

/**
 * Presses the mouse on a row drag handle and moves it over the lower part of the target cell's row,
 * leaving the button held so the caller can assert the mid-drag state before releasing.
 */
async function startRowDrag(page: Page, handle: Locator, target: Locator) {
    const handleBox = (await handle.boundingBox())!;
    const targetBox = (await target.boundingBox())!;
    const startX = handleBox.x + handleBox.width / 2;
    const startY = handleBox.y + handleBox.height / 2;

    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(startX, startY + 10, { steps: 5 });
    await page.mouse.move(startX, targetBox.y + targetBox.height * 0.75, { steps: 10 });
}

test.agExample(import.meta, () => {
    // The athlete column has rowDrag=true and the grid has rowDragManaged=true, so the grid
    // rearranges the rows itself, live, while a row is dragged.
    test.eachFramework(
        'dragging a row moves it while dragging and keeps it there on drop',
        async ({ agIdFor, page }) => {
            await ensureGridReady(page);
            await waitForGridContent(page);

            // olympic-winners.json order: row 0 is Michael Phelps (2008), row 3 Natalie Coughlin (2008).
            await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');
            await expect(agIdFor.cell('3', 'athlete')).toContainText('Natalie Coughlin');
            await expectRowIdAtIndex(page, 0, '0');

            await startRowDrag(page, agIdFor.dragHandle('0', 'athlete'), agIdFor.cell('3', 'country'));

            // Managed dragging moves the row while the mouse button is still held.
            await expect(page.locator('.ag-dnd-ghost')).toBeVisible();
            await expectRowIdAtIndex(page, 3, '0');
            await expectRowIdAtIndex(page, 0, '1');

            await page.mouse.up();
            await waitForRowAnimations(page);

            await expect(page.locator('.ag-dnd-ghost')).toHaveCount(0);
            await expectRowIdAtIndex(page, 0, '1');
            await expectRowIdAtIndex(page, 1, '2');
            await expectRowIdAtIndex(page, 2, '3');
            await expectRowIdAtIndex(page, 3, '0');
            await expectRowIdAtIndex(page, 4, '4');
        }
    );

    test.eachFramework('sorting a column disables the drag handles', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const handle = agIdFor.dragHandle('0', 'athlete');
        await expect(handle).toBeVisible();
        await expect(handle).not.toHaveClass(/ag-drag-handle-disabled/);

        // Ascending sort on year: 2000 rows come first, so Michael Phelps (2008) leaves the top.
        const yearHeader = agIdFor.headerCell('year');
        await clickHeaderToSort(yearHeader);
        await waitForRowAnimations(page);
        await expectRowIdAtIndex(page, 0, '0', { not: true });

        const firstRowHandle = page
            .locator('.ag-grid-scrolling-container .ag-row[row-index="0"]')
            .locator('.ag-row-drag');
        await expect(firstRowHandle).toHaveClass(/ag-drag-handle-disabled/);

        // Clear the sort (ascending -> descending -> none): the handles are enabled again and the
        // original order is restored.
        await clickHeaderToSort(yearHeader);
        await waitForRowAnimations(page);
        await clickHeaderToSort(yearHeader);
        await waitForRowAnimations(page);

        await expectRowIdAtIndex(page, 0, '0');
        await expect(handle).not.toHaveClass(/ag-drag-handle-disabled/);
    });

    test.eachFramework('filtering disables the drag handles and dragging has no effect', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Michael Phelps is in rows 0, 1 and 2 of olympic-winners.json.
        await agIdFor.headerFilterButton('athlete').click();
        const filterInput = agIdFor.textFilterInstanceInput({ source: 'column-filter' });
        await filterInput.fill('Michael Phelps');
        await filterInput.press('Enter');
        await page.keyboard.press('Escape');

        await expect(agIdFor.rowNode('3')).toHaveCount(0);
        const handle = agIdFor.dragHandle('0', 'athlete');
        await expect(handle).toHaveClass(/ag-drag-handle-disabled/);

        await startRowDrag(page, handle, agIdFor.cell('2', 'country'));
        await page.mouse.up();
        await waitForRowAnimations(page);

        await expectRowIdAtIndex(page, 0, '0');
        await expectRowIdAtIndex(page, 1, '1');
        await expectRowIdAtIndex(page, 2, '2');
    });
});
