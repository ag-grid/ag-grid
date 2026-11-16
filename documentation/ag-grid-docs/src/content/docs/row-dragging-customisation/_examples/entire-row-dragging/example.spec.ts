import type { Locator, Page } from '@playwright/test';
import { expect, expectRowIdAtIndex, test, waitForGridContent, waitForRowAnimations } from '@utils/grid/test-utils';

const SELECTION_COL = 'ag-Grid-SelectionColumn';

async function centreOf(locator: Locator) {
    const box = await locator.boundingBox();
    expect(box).not.toBeNull();
    return { x: box!.x + box!.width / 2, y: box!.y + box!.height / 2 };
}

/** Drags from the centre of `source` to the centre of `target`, past the default 4px drag threshold. */
async function dragTo(page: Page, source: Locator, target: Locator, duringDrag?: () => Promise<void>) {
    const from = await centreOf(source);
    const to = await centreOf(target);
    await page.mouse.move(from.x, from.y);
    await page.mouse.down();
    await page.mouse.move(from.x, from.y + 15, { steps: 5 });
    await page.mouse.move(to.x, to.y, { steps: 10 });
    await duringDrag?.();
    await page.mouse.up();
}

test.agExample(import.meta, () => {
    test.eachFramework('a row can be dragged from any cell without a drag handle', async ({ agIdFor, page }) => {
        await waitForGridContent(page);

        // No column has rowDrag, so there are no drag handles.
        await expect(page.locator('.ag-drag-handle')).toHaveCount(0);
        await expect(agIdFor.cell('0', 'sport')).toContainText('Swimming');

        const ghost = page.locator('.ag-dnd-ghost');
        await dragTo(page, agIdFor.cell('0', 'sport'), agIdFor.cell('3', 'sport'), async () => {
            await expect(ghost).toBeVisible();
            // Entire-row dragging has no column dragger to supply a value, so the default drag text is the row count.
            await expect(ghost.locator('.ag-dnd-ghost-label')).toHaveText('1 row');
        });
        await waitForRowAnimations(page);

        await expectRowIdAtIndex(page, 0, '1');
        await expectRowIdAtIndex(page, 1, '2');
        await expectRowIdAtIndex(page, 2, '3');
        await expectRowIdAtIndex(page, 3, '0');
    });

    test.eachFramework('multiple selected rows are dragged together', async ({ agIdFor, page }) => {
        await waitForGridContent(page);

        await agIdFor.checkbox('0', SELECTION_COL).click();
        await agIdFor.checkbox('1', SELECTION_COL).click();
        await expect(agIdFor.rowNode('0')).toHaveClass(/ag-row-selected/);
        await expect(agIdFor.rowNode('1')).toHaveClass(/ag-row-selected/);

        const ghost = page.locator('.ag-dnd-ghost');
        await dragTo(page, agIdFor.cell('0', 'country'), agIdFor.cell('4', 'country'), async () => {
            await expect(ghost.locator('.ag-dnd-ghost-label')).toHaveText('2 rows');
        });
        await waitForRowAnimations(page);

        // The block's first row lands at the pointer's row index (4): 2, 3, 4, 5, 0, 1, 6.
        await expectRowIdAtIndex(page, 0, '2');
        await expectRowIdAtIndex(page, 1, '3');
        await expectRowIdAtIndex(page, 2, '4');
        await expectRowIdAtIndex(page, 3, '5');
        await expectRowIdAtIndex(page, 4, '0');
        await expectRowIdAtIndex(page, 5, '1');
        await expectRowIdAtIndex(page, 6, '6');
    });
});
