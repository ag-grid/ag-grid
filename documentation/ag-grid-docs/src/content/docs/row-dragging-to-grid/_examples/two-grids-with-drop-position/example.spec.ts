import type { Locator, Page } from '@playwright/test';
import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

import { wrapAgTestIdFor } from 'ag-grid-community';

/** Test-id locators scoped to one of the two grids, as both grids use the same column ids. */
function gridFor(page: Page, index: 0 | 1) {
    const root = page.locator('.ag-root-wrapper').nth(index);
    return { root, ids: wrapAgTestIdFor((testId: string) => root.getByTestId(testId)) };
}

/** Row ids rendered by a grid, in row-index order. */
async function rowIds(grid: Locator) {
    return grid
        .locator('.ag-grid-scrolling-container .ag-row')
        .evaluateAll((rows) =>
            rows
                .sort((a, b) => Number(a.getAttribute('row-index')) - Number(b.getAttribute('row-index')))
                .map((row) => row.getAttribute('row-id'))
        );
}

/**
 * Presses the mouse on a row drag handle and moves it to `yRatio` of the target's height, leaving
 * the button held so the caller can assert the mid-drag state before releasing.
 */
async function startDrag(page: Page, handle: Locator, target: Locator, yRatio = 0.5) {
    const handleBox = (await handle.boundingBox())!;
    const targetBox = (await target.boundingBox())!;
    const startX = handleBox.x + handleBox.width / 2;
    const startY = handleBox.y + handleBox.height / 2;

    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(startX, startY + 10, { steps: 5 });
    await page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height * yRatio, {
        steps: 15,
    });
}

test.agExample(import.meta, () => {
    // getRowId uses the id field. Left grid: 100..105, right grid: 106..111, colours Red, Green, Blue repeating.
    const leftStart = ['100', '101', '102', '103', '104', '105'];
    const rightStart = ['106', '107', '108', '109', '110', '111'];

    test.eachFramework('a line shows where the row will land in the other grid', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);
        const left = gridFor(page, 0);
        const right = gridFor(page, 1);

        await expect(async () => expect(await rowIds(right.root)).toEqual(rightStart)).toPass();

        await startDrag(page, left.ids.dragHandle('100', 'id'), right.ids.rowNode('107'), 0.75);
        await expect(right.ids.rowNode('107')).toHaveClass(/ag-row-highlight-below/);

        // Moving over the upper half of a row moves the line above it.
        const box = (await right.ids.rowNode('109').boundingBox())!;
        await page.mouse.move(box.x + box.width / 2, box.y + box.height * 0.25, { steps: 5 });
        await expect(right.ids.rowNode('109')).toHaveClass(/ag-row-highlight-above/);
        await expect(right.ids.rowNode('107')).not.toHaveClass(/ag-row-highlight-below/);

        // suppressMoveWhenRowDragging: nothing moves in either grid until the drop.
        await expect(async () => expect(await rowIds(right.root)).toEqual(rightStart)).toPass();
        await page.mouse.up();
        await expect(right.ids.rowNode('109')).not.toHaveClass(/ag-row-highlight-above/);
    });

    test.eachFramework('a dropped row is added at the drop position and kept in the source grid', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);
        const left = gridFor(page, 0);
        const right = gridFor(page, 1);

        await startDrag(page, left.ids.dragHandle('100', 'id'), right.ids.rowNode('107'), 0.75);
        await page.mouse.up();

        // Dropped below 107, so 100 (Red) lands between 107 and 108.
        await expect(right.ids.cell('100', 'color')).toContainText('Red');
        await expect(right.ids.rowNode('100')).toHaveClass(/red-row/);
        await expect(async () =>
            expect(await rowIds(right.root)).toEqual(['106', '107', '100', '108', '109', '110', '111'])
        ).toPass();
        // The example chooses not to remove the row from the source grid.
        await expect(async () => expect(await rowIds(left.root)).toEqual(leftStart)).toPass();

        // And from the right grid into the left, above 102.
        await startDrag(page, right.ids.dragHandle('110', 'id'), left.ids.rowNode('102'), 0.25);
        await page.mouse.up();
        await expect(left.ids.cell('110', 'color')).toContainText('Green');
        await expect(async () =>
            expect(await rowIds(left.root)).toEqual(['100', '101', '110', '102', '103', '104', '105'])
        ).toPass();
    });

    test.eachFramework('dropping a row on the trash removes it from both grids', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);
        const left = gridFor(page, 0);
        const right = gridFor(page, 1);
        const bin = page.locator('.bin');

        // Copy 101 into the right grid (below 106) so it is in both, then bin it.
        await startDrag(page, left.ids.dragHandle('101', 'id'), right.ids.rowNode('106'), 0.75);
        await page.mouse.up();
        await expect(right.ids.rowNode('101')).toBeVisible();

        await startDrag(page, right.ids.dragHandle('101', 'id'), bin);
        await page.mouse.up();
        await expect(async () => expect(await rowIds(right.root)).toEqual(rightStart)).toPass();
        await expect(async () => expect(await rowIds(left.root)).toEqual(['100', '102', '103', '104', '105'])).toPass();

        // A row only in the right grid is binned from there.
        await startDrag(page, right.ids.dragHandle('111', 'id'), bin);
        await page.mouse.up();
        await expect(async () =>
            expect(await rowIds(right.root)).toEqual(['106', '107', '108', '109', '110'])
        ).toPass();
    });

    test.eachFramework('the colour buttons add new rows to their grid', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);
        const left = gridFor(page, 0);
        const right = gridFor(page, 1);

        // Ids continue from the shared sequence: 112, then 113. The first button of each colour is the left grid's.
        await page.getByRole('button', { name: 'Add Blue' }).first().click();
        await expect(left.ids.cell('112', 'color')).toContainText('Blue');
        await expect(left.ids.rowNode('112')).toHaveClass(/blue-row/);
        await expect(async () => expect(await rowIds(left.root)).toEqual([...leftStart, '112'])).toPass();

        await page.getByRole('button', { name: 'Add Red' }).nth(1).click();
        await expect(right.ids.cell('113', 'color')).toContainText('Red');
        await expect(right.ids.rowNode('113')).toHaveClass(/red-row/);
        await expect(async () => expect(await rowIds(right.root)).toEqual([...rightStart, '113'])).toPass();
    });
});
