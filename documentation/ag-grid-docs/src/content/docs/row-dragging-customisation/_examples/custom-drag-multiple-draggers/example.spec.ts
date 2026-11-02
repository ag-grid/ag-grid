import type { Locator, Page } from '@playwright/test';
import { expect, expectRowIdAtIndex, test, waitForGridContent, waitForRowAnimations } from '@utils/grid/test-utils';

const SELECTION_COL = 'ag-Grid-SelectionColumn';

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
    test.eachFramework(
        'country dragger on a 2012 row uses the grid rowDragText callback',
        async ({ agIdFor, page }) => {
            await waitForGridContent(page);

            // olympic-winners.json row 2 is Michael Phelps (United States) at the 2012 Olympics.
            await expect(agIdFor.cell('2', 'country')).toContainText('United States');
            await expect(agIdFor.cell('2', 'year')).toContainText('2012');

            const ghost = page.locator('.ag-dnd-ghost');
            await startDrag(page, agIdFor.dragHandle('2', 'country'));

            await expect(ghost).toBeVisible();
            await expect(ghost.locator('.ag-dnd-ghost-label')).toHaveText('United States (London Olympics)');

            await page.mouse.up();
        }
    );

    test.eachFramework('country dragger on a non-2012 row shows the country value', async ({ agIdFor, page }) => {
        await waitForGridContent(page);

        // Row 0 is from 2008, so the grid callback returns the dragged cell value unchanged.
        await expect(agIdFor.cell('0', 'year')).toContainText('2008');

        const ghost = page.locator('.ag-dnd-ghost');
        await startDrag(page, agIdFor.dragHandle('0', 'country'));

        await expect(ghost).toBeVisible();
        await expect(ghost.locator('.ag-dnd-ghost-label')).toHaveText('United States');

        await page.mouse.up();
    });

    test.eachFramework(
        'athlete dragger uses the column rowDragText callback, overriding the grid one',
        async ({ agIdFor, page }) => {
            await waitForGridContent(page);

            const ghost = page.locator('.ag-dnd-ghost');
            // Row 2 is a 2012 row, yet the colDef callback wins, so no (London Olympics) suffix.
            await startDrag(page, agIdFor.dragHandle('2', 'athlete'));

            await expect(ghost).toBeVisible();
            await expect(ghost.locator('.ag-dnd-ghost-label')).toHaveText('1 athlete(s) selected');

            await page.mouse.up();
        }
    );

    test.eachFramework('athlete dragger reports the number of selected athletes', async ({ agIdFor, page }) => {
        await waitForGridContent(page);

        await agIdFor.checkbox('0', SELECTION_COL).click();
        await agIdFor.checkbox('1', SELECTION_COL).click();
        await expect(agIdFor.rowNode('0')).toHaveClass(/ag-row-selected/);
        await expect(agIdFor.rowNode('1')).toHaveClass(/ag-row-selected/);

        const ghost = page.locator('.ag-dnd-ghost');
        await startDrag(page, agIdFor.dragHandle('0', 'athlete'));

        await expect(ghost).toBeVisible();
        await expect(ghost.locator('.ag-dnd-ghost-label')).toHaveText('2 athlete(s) selected');

        await page.mouse.up();
    });

    test.eachFramework('dropping selected rows moves them together', async ({ agIdFor, page }) => {
        await waitForGridContent(page);

        await agIdFor.checkbox('0', SELECTION_COL).click();
        await agIdFor.checkbox('1', SELECTION_COL).click();
        await expect(agIdFor.rowNode('1')).toHaveClass(/ag-row-selected/);

        const target = await centreOf(agIdFor.cell('4', 'athlete'));
        await startDrag(page, agIdFor.dragHandle('0', 'athlete'));
        await page.mouse.move(target.x, target.y, { steps: 10 });
        await page.mouse.up();
        await waitForRowAnimations(page);

        // rowDragMultiRow moves both selected rows as a block.
        await expectRowIdAtIndex(page, 0, '2');
        await expectRowIdAtIndex(page, 1, '3');
        await expectRowIdAtIndex(page, 2, '4');
        await expectRowIdAtIndex(page, 3, '0');
        await expectRowIdAtIndex(page, 4, '1');
    });
});
