import type { Locator, Page } from '@playwright/test';
import { expect, expectRowIdAtIndex, test, waitForGridContent, waitForRowAnimations } from '@utils/grid/test-utils';

async function centreOf(locator: Locator) {
    const box = await locator.boundingBox();
    expect(box).not.toBeNull();
    return { x: box!.x + box!.width / 2, y: box!.y + box!.height / 2 };
}

/** Presses the mouse on `source` and moves it past the default 4px drag threshold. */
async function startDrag(page: Page, source: Locator) {
    const { x, y } = await centreOf(source);
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(x, y + 15, { steps: 5 });
}

test.agExample(import.meta, () => {
    test.eachFramework('dragging a 2012 row adds (London Olympics) to the drag text', async ({ agIdFor, page }) => {
        await waitForGridContent(page);

        // olympic-winners.json row 2 is Michael Phelps at the 2012 Olympics.
        await expect(agIdFor.cell('2', 'athlete')).toContainText('Michael Phelps');
        await expect(agIdFor.cell('2', 'year')).toContainText('2012');

        const ghost = page.locator('.ag-dnd-ghost');
        await expect(ghost).toHaveCount(0);

        await startDrag(page, agIdFor.dragHandle('2', 'athlete'));

        await expect(ghost).toBeVisible();
        await expect(ghost.locator('.ag-dnd-ghost-label')).toHaveText('Michael Phelps (London Olympics)');

        await page.mouse.up();
        await expect(ghost).toHaveCount(0);
    });

    test.eachFramework('dragging a row from another year shows the default drag text', async ({ agIdFor, page }) => {
        await waitForGridContent(page);

        // Row 0 is Michael Phelps at the 2008 Olympics, so the callback returns the cell value unchanged.
        await expect(agIdFor.cell('0', 'year')).toContainText('2008');

        const ghost = page.locator('.ag-dnd-ghost');
        await startDrag(page, agIdFor.dragHandle('0', 'athlete'));

        await expect(ghost).toBeVisible();
        await expect(ghost.locator('.ag-dnd-ghost-label')).toHaveText('Michael Phelps');

        await page.mouse.up();
    });

    test.eachFramework('dropping a dragged row reorders the grid', async ({ agIdFor, page }) => {
        await waitForGridContent(page);

        await expectRowIdAtIndex(page, 0, '0');
        await expectRowIdAtIndex(page, 3, '3');

        const target = await centreOf(agIdFor.cell('3', 'athlete'));
        await startDrag(page, agIdFor.dragHandle('0', 'athlete'));
        await page.mouse.move(target.x, target.y, { steps: 10 });
        await page.mouse.up();
        await waitForRowAnimations(page);

        // rowDragManaged moves row 0 into row 3's slot; the rows in between shift up by one.
        await expectRowIdAtIndex(page, 0, '1');
        await expectRowIdAtIndex(page, 1, '2');
        await expectRowIdAtIndex(page, 2, '3');
        await expectRowIdAtIndex(page, 3, '0');
    });
});
