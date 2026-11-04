import type { Locator, Page } from '@playwright/test';
import { ensureGridReady, expect, test, waitForGridContent } from '@utils/grid/test-utils';

import { wrapAgTestIdFor } from 'ag-grid-community';

/** Test-id locators scoped to one of the two grids, as both grids use the same row and column ids. */
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

/** Drags a row by its handle and drops it at the centre of `target`. */
async function dragRowTo(page: Page, handle: Locator, target: Locator) {
    const handleBox = (await handle.boundingBox())!;
    const targetBox = (await target.boundingBox())!;
    const startX = handleBox.x + handleBox.width / 2;
    const startY = handleBox.y + handleBox.height / 2;

    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(startX, startY + 10, { steps: 5 });
    await page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height / 2, { steps: 15 });
    await page.mouse.up();
}

test.agExample(import.meta, () => {
    // The left grid starts with ids 100 (Red), 101 (Green), 102 (Blue); getRowId uses the id field.
    // The right grid starts empty.
    test.eachFramework('dragging a row to the other grid copies it there', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);
        const left = gridFor(page, 0);
        const right = gridFor(page, 1);

        await expect(async () => expect(await rowIds(left.root)).toEqual(['100', '101', '102'])).toPass();
        await expect(left.ids.cell('100', 'color')).toContainText('Red');
        await expect(right.root.locator('.ag-row')).toHaveCount(0);

        await dragRowTo(page, left.ids.dragHandle('101', 'id'), right.root);

        // The generic drop zone's onDragStop adds the row to the right grid...
        await expect(right.ids.cell('101', 'color')).toContainText('Green');
        await expect(async () => expect(await rowIds(right.root)).toEqual(['101'])).toPass();
        // ...and the example chooses not to remove it from the left grid.
        await expect(async () => expect(await rowIds(left.root)).toEqual(['100', '101', '102'])).toPass();
    });

    test.eachFramework('rows can be dragged from the right grid to the left grid', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);
        const left = gridFor(page, 0);
        const right = gridFor(page, 1);

        // Create 103 (Green) in the right grid, then copy it to the left grid.
        await page.getByRole('button', { name: 'Add Green' }).nth(1).click();
        await expect(right.ids.cell('103', 'color')).toContainText('Green');

        await dragRowTo(page, right.ids.dragHandle('103', 'id'), left.root);
        await expect(left.ids.cell('103', 'color')).toContainText('Green');
        await expect(async () => expect(await rowIds(left.root)).toEqual(['100', '101', '102', '103'])).toPass();
        await expect(async () => expect(await rowIds(right.root)).toEqual(['103'])).toPass();
    });

    test.eachFramework('a row already in the target grid is not added twice', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);
        const left = gridFor(page, 0);
        const right = gridFor(page, 1);

        const logs: string[] = [];
        page.on('console', (msg) => {
            if (msg.type() === 'log') {
                logs.push(msg.text());
            }
        });

        await dragRowTo(page, left.ids.dragHandle('100', 'id'), right.root);
        await expect(right.ids.cell('100', 'color')).toContainText('Red');
        expect(logs).not.toContain('not adding row to avoid duplicates in the grid');

        await dragRowTo(page, left.ids.dragHandle('100', 'id'), right.root);
        await expect(() => expect(logs).toContain('not adding row to avoid duplicates in the grid')).toPass();
        await expect(async () => expect(await rowIds(right.root)).toEqual(['100'])).toPass();
    });

    test.eachFramework('dropping a row on the trash removes it from both grids', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);
        const left = gridFor(page, 0);
        const right = gridFor(page, 1);
        const bin = page.locator('.bin');

        // Copy 100 into the right grid so it is in both, then bin it.
        await dragRowTo(page, left.ids.dragHandle('100', 'id'), right.root);
        await expect(async () => expect(await rowIds(right.root)).toEqual(['100'])).toPass();

        await dragRowTo(page, right.ids.dragHandle('100', 'id'), bin);
        await expect(async () => expect(await rowIds(right.root)).toEqual([])).toPass();
        await expect(async () => expect(await rowIds(left.root)).toEqual(['101', '102'])).toPass();

        // A row only in the left grid is binned from there too.
        await dragRowTo(page, left.ids.dragHandle('102', 'id'), bin);
        await expect(async () => expect(await rowIds(left.root)).toEqual(['101'])).toPass();
    });

    test.eachFramework('the colour buttons add new rows to their grid', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);
        const left = gridFor(page, 0);
        const right = gridFor(page, 1);

        // Ids continue from the shared sequence: 103, then 104. The first button of each colour is the left grid's.
        await page.getByRole('button', { name: 'Add Red' }).first().click();
        await expect(left.ids.cell('103', 'color')).toContainText('Red');
        await expect(left.ids.rowNode('103')).toHaveClass(/red-row/);
        await expect(async () => expect(await rowIds(left.root)).toEqual(['100', '101', '102', '103'])).toPass();

        await page.getByRole('button', { name: 'Add Blue' }).nth(1).click();
        await expect(right.ids.cell('104', 'color')).toContainText('Blue');
        await expect(right.ids.rowNode('104')).toHaveClass(/blue-row/);
        await expect(async () => expect(await rowIds(right.root)).toEqual(['104'])).toPass();
        await expect(async () => expect(await rowIds(left.root)).toEqual(['100', '101', '102', '103'])).toPass();
    });
});
