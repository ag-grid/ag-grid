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
 * Presses the mouse on a row drag handle and moves it to (x, y), leaving the button held so the
 * caller can assert the mid-drag state before releasing.
 */
async function startDragTo(page: Page, handle: Locator, x: number, y: number) {
    const handleBox = (await handle.boundingBox())!;
    const startX = handleBox.x + handleBox.width / 2;
    const startY = handleBox.y + handleBox.height / 2;

    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(startX, startY + 10, { steps: 5 });
    await page.mouse.move(x, y, { steps: 10 });
}

/** Starts a drag of `handle` over the lower part of the `target` row. */
async function startRowDrag(page: Page, handle: Locator, target: Locator) {
    const handleBox = (await handle.boundingBox())!;
    const targetBox = (await target.boundingBox())!;
    await startDragTo(page, handle, handleBox.x + handleBox.width / 2, targetBox.y + targetBox.height * 0.75);
}

/**
 * Drags a row by its handle and drops it in the tile container. The pointer leaves the grid sideways,
 * along the dragged row, so the managed grid does not reorder rows on the way out.
 */
async function dragRowToTiles(page: Page, handle: Locator) {
    const handleBox = (await handle.boundingBox())!;
    const containerBox = (await page.locator('.tile-container').boundingBox())!;
    const centreX = containerBox.x + containerBox.width / 2;
    const rowY = handleBox.y + handleBox.height / 2;

    await page.mouse.move(handleBox.x + handleBox.width / 2, rowY);
    await page.mouse.down();
    await page.mouse.move(handleBox.x + handleBox.width / 2 + 10, rowY, { steps: 5 });
    await page.mouse.move(centreX, rowY, { steps: 15 });
    await page.mouse.move(centreX, containerBox.y + containerBox.height / 2, { steps: 5 });
    await page.mouse.up();
}

test.agExample(import.meta, () => {
    // Rows have no getRowId, so row ids are '0'..'8'; the `id` field runs 100..108 with colours
    // Red, Green, Blue repeating.
    test.eachFramework('rows can be moved inside the grid', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await expect(agIdFor.cell('0', 'id')).toContainText('100');
        await expect(agIdFor.cell('0', 'color')).toContainText('Red');
        await expect(agIdFor.cell('3', 'id')).toContainText('103');

        // Managed dragging moves the row live, while the button is still held.
        await startRowDrag(page, agIdFor.dragHandle('0', 'id'), agIdFor.cell('3', 'color'));
        await expectRowIdAtIndex(page, 3, '0');
        await page.mouse.up();
        await waitForRowAnimations(page);

        await expectRowIdAtIndex(page, 0, '1');
        await expectRowIdAtIndex(page, 1, '2');
        await expectRowIdAtIndex(page, 2, '3');
        await expectRowIdAtIndex(page, 3, '0');
    });

    test.eachFramework('dropping a row on the container adds a tile with its data', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        const tiles = page.locator('.tile-container .tile');
        await expect(tiles).toHaveCount(0);

        // Row 0: id 100, Red, seeded values.
        await expect(agIdFor.cell('0', 'value1')).toHaveText('96');
        await expect(agIdFor.cell('0', 'value2')).toHaveText('11');

        await dragRowToTiles(page, agIdFor.dragHandle('0', 'id'));

        await expect(tiles).toHaveCount(1);
        const tile = tiles.first();
        await expect(tile).toHaveClass(/\bred\b/);
        await expect(tile.locator('.id')).toHaveText('100');
        await expect(tile.locator('.value')).toHaveText(['96', '11']);

        // A second row (row 1: id 101, Green) appends a second tile.
        await dragRowToTiles(page, agIdFor.dragHandle('1', 'id'));
        await expect(tiles).toHaveCount(2);
        await expect(tiles.nth(1)).toHaveClass(/\bgreen\b/);
        await expect(tiles.nth(1).locator('.id')).toHaveText('101');

        // The rows stay in the grid.
        await expectRowIdAtIndex(page, 0, '0');
        await expectRowIdAtIndex(page, 1, '1');
    });

    test.eachFramework(
        'enabling suppressMoveWhenRowDragging defers the move until the drop',
        async ({ agIdFor, page }) => {
            await ensureGridReady(page);
            await waitForGridContent(page);

            await page.getByLabel('Enable suppressMoveWhenRowDragging').check();

            await startRowDrag(page, agIdFor.dragHandle('0', 'id'), agIdFor.cell('3', 'color'));
            // The row stays where it is while dragging; a line shows where it will land.
            await expect(agIdFor.rowNode('3')).toHaveClass(/ag-row-highlight-below/);
            await expectRowIdAtIndex(page, 0, '0');
            await expectRowIdAtIndex(page, 3, '3');

            await page.mouse.up();
            await waitForRowAnimations(page);
            await expectRowIdAtIndex(page, 0, '1');
            await expectRowIdAtIndex(page, 3, '0');
            await expect(agIdFor.rowNode('3')).not.toHaveClass(/ag-row-highlight-below/);
        }
    );
});
