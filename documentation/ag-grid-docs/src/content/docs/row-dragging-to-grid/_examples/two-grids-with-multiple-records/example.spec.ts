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

/**
 * Presses the mouse on the row's drag handle and moves it to the centre of `target`, leaving the
 * button held so the caller can assert the mid-drag state before releasing.
 */
async function startDrag(page: Page, row: Locator, target: Locator) {
    const handleBox = (await row.locator('.ag-row-drag').boundingBox())!;
    const targetBox = (await target.boundingBox())!;
    const startX = handleBox.x + handleBox.width / 2;
    const startY = handleBox.y + handleBox.height / 2;

    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(startX, startY + 10, { steps: 5 });
    await page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height / 2, { steps: 15 });
}

// The left grid holds the first 20 distinct athletes of olympic-winners.json, keyed by name.
const PHELPS = 'Michael Phelps';
const COUGHLIN = 'Natalie Coughlin';
const NEMOV = 'Aleksey Nemov';
const COUTTS = 'Alicia Coutts';
const FIRST_FOUR = [PHELPS, COUGHLIN, NEMOV, COUTTS];

async function selectRows(page: Page, athletes: string[]) {
    const left = gridFor(page, 0);
    for (const athlete of athletes) {
        await left.ids.rowNode(athlete).locator('.ag-selection-checkbox input').check();
        await expect(left.ids.rowNode(athlete)).toHaveClass(/ag-row-selected/);
    }
}

test.agExample(import.meta, () => {
    test.eachFramework('selected rows are dragged together and removed from the source', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);
        const left = gridFor(page, 0);
        const right = gridFor(page, 1);

        await expect(left.ids.cell(NEMOV, 'sport')).toContainText('Gymnastics');
        await expect(async () => expect((await rowIds(left.root)).slice(0, 4)).toEqual(FIRST_FOUR)).toPass();
        await expect(right.root.locator('.ag-row')).toHaveCount(0);
        await expect(page.getByLabel('Remove Source Rows')).toBeChecked();

        await selectRows(page, [COUGHLIN, COUTTS]);

        // rowDragMultiRow drags every selected row, and rowDragText reports the count.
        await startDrag(page, left.ids.rowNode(COUGHLIN), right.root);
        await expect(page.locator('.ag-dnd-ghost')).toContainText('2 athletes');
        await page.mouse.up();

        await expect(right.ids.cell(COUTTS, 'athlete')).toContainText(COUTTS);
        await expect(async () => expect(await rowIds(right.root)).toEqual([COUGHLIN, COUTTS])).toPass();
        // "Remove Source Rows" removes both from the Athletes grid.
        await expect(left.ids.rowNode(COUGHLIN)).toHaveCount(0);
        await expect(left.ids.rowNode(COUTTS)).toHaveCount(0);
        await expect(async () => expect((await rowIds(left.root)).slice(0, 2)).toEqual([PHELPS, NEMOV])).toPass();
    });

    test.eachFramework('an unselected row is dragged on its own, labelled with its name', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);
        const left = gridFor(page, 0);
        const right = gridFor(page, 1);

        await startDrag(page, left.ids.rowNode(NEMOV), right.root);
        await expect(page.locator('.ag-dnd-ghost')).toContainText(NEMOV);
        await page.mouse.up();

        await expect(right.ids.cell(NEMOV, 'sport')).toContainText('Gymnastics');
        await expect(async () => expect(await rowIds(right.root)).toEqual([NEMOV])).toPass();
        await expect(left.ids.rowNode(NEMOV)).toHaveCount(0);
    });

    test.eachFramework('"Only Deselect Source Rows" copies and deselects the source rows', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);
        const left = gridFor(page, 0);
        const right = gridFor(page, 1);

        await page.locator('label[for="deselect"]').click();
        await selectRows(page, [PHELPS, NEMOV]);

        await startDrag(page, left.ids.rowNode(PHELPS), right.root);
        await page.mouse.up();

        await expect(async () => expect(await rowIds(right.root)).toEqual([PHELPS, NEMOV])).toPass();
        // The rows stay in the Athletes grid but are no longer selected.
        await expect(async () => expect((await rowIds(left.root)).slice(0, 4)).toEqual(FIRST_FOUR)).toPass();
        await expect(left.ids.rowNode(PHELPS)).not.toHaveClass(/ag-row-selected/);
        await expect(left.ids.rowNode(NEMOV)).not.toHaveClass(/ag-row-selected/);
    });

    test.eachFramework(
        '"Only Deselect Source Rows" leaves the selection alone when an unselected row is copied',
        async ({ page }) => {
            await ensureGridReady(page);
            await waitForGridContent(page);
            const left = gridFor(page, 0);
            const right = gridFor(page, 1);

            await page.locator('label[for="deselect"]').click();
            await selectRows(page, [PHELPS]);

            await startDrag(page, left.ids.rowNode(COUTTS), right.root);
            await page.mouse.up();

            await expect(async () => expect(await rowIds(right.root)).toEqual([COUTTS])).toPass();
            await expect(left.ids.rowNode(PHELPS)).toHaveClass(/ag-row-selected/);
            await expect(left.ids.rowNode(COUTTS)).not.toHaveClass(/ag-row-selected/);
        }
    );

    test.eachFramework('"None" copies the rows and leaves the source grid as is', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);
        const left = gridFor(page, 0);
        const right = gridFor(page, 1);

        await page.locator('label[for="none"]').click();
        await selectRows(page, [COUGHLIN, NEMOV]);

        await startDrag(page, left.ids.rowNode(NEMOV), right.root);
        await page.mouse.up();

        await expect(async () => expect(await rowIds(right.root)).toEqual([COUGHLIN, NEMOV])).toPass();
        await expect(async () => expect((await rowIds(left.root)).slice(0, 4)).toEqual(FIRST_FOUR)).toPass();
        await expect(left.ids.rowNode(COUGHLIN)).toHaveClass(/ag-row-selected/);
        await expect(left.ids.rowNode(NEMOV)).toHaveClass(/ag-row-selected/);
    });

    test.eachFramework('Reset restores both grids and the default option', async ({ page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);
        const left = gridFor(page, 0);
        const right = gridFor(page, 1);

        await page.locator('label[for="none"]').click();
        await startDrag(page, left.ids.rowNode(PHELPS), right.root);
        await page.mouse.up();
        await expect(async () => expect(await rowIds(right.root)).toEqual([PHELPS])).toPass();

        await page.getByRole('button', { name: 'Reset' }).click();

        await expect(page.getByLabel('Remove Source Rows')).toBeChecked();
        await expect(right.root.locator('.ag-row')).toHaveCount(0);
        await expect(async () => expect((await rowIds(left.root)).slice(0, 4)).toEqual(FIRST_FOUR)).toPass();
    });
});
