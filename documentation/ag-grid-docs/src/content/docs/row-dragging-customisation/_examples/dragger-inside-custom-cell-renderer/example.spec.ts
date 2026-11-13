import type { Locator, Page } from '@playwright/test';
import { expect, expectRowIdAtIndex, test, waitForGridContent, waitForRowAnimations } from '@utils/grid/test-utils';

async function centreOf(locator: Locator) {
    const box = await locator.boundingBox();
    expect(box).not.toBeNull();
    return { x: box!.x + box!.width / 2, y: box!.y + box!.height / 2 };
}

/** The arrow icon the custom cell renderer registers via `registerRowDragger`. */
const rowDragger = (cell: Locator) => cell.locator('.fa-arrows-alt-v');

test.agExample(import.meta, () => {
    test.eachFramework('the row dragger arrow only appears while hovering the cell', async ({ agIdFor, page }) => {
        await waitForGridContent(page);

        const cell = agIdFor.cell('0', 'athlete');
        await expect(cell).toContainText('Michael Phelps');
        await expect(cell).toContainText('United States');
        await expect(cell).toContainText('2008');

        await expect(rowDragger(cell)).toBeHidden();
        await cell.hover();
        await expect(rowDragger(cell)).toBeVisible();
    });

    test.eachFramework('dragging the arrow reorders rows', async ({ agIdFor, page }) => {
        await waitForGridContent(page);

        const cell = agIdFor.cell('0', 'athlete');
        const target = await centreOf(agIdFor.cell('3', 'country'));
        await cell.hover();
        const from = await centreOf(rowDragger(cell));

        await page.mouse.move(from.x, from.y);
        await page.mouse.down();
        await page.mouse.move(from.x, from.y + 15, { steps: 5 });

        const ghost = page.locator('.ag-dnd-ghost');
        await expect(ghost).toBeVisible();
        await expect(ghost.locator('.ag-dnd-ghost-label')).toHaveText('Michael Phelps');

        await page.mouse.move(target.x, target.y, { steps: 10 });
        await page.mouse.up();
        await waitForRowAnimations(page);

        await expectRowIdAtIndex(page, 0, '1');
        await expectRowIdAtIndex(page, 1, '2');
        await expectRowIdAtIndex(page, 2, '3');
        await expectRowIdAtIndex(page, 3, '0');
    });

    test.eachFramework('the drag only starts once the arrow has moved past 4px', async ({ agIdFor, page }) => {
        await waitForGridContent(page);

        const cell = agIdFor.cell('0', 'athlete');
        await cell.hover();
        const from = await centreOf(rowDragger(cell));
        const ghost = page.locator('.ag-dnd-ghost');

        await page.mouse.move(from.x, from.y);
        await page.mouse.down();
        await expect(ghost).toHaveCount(0);

        // Within the default 4px threshold: no drag yet.
        await page.mouse.move(from.x, from.y + 3);
        await expect(ghost).toHaveCount(0);

        await page.mouse.move(from.x, from.y + 15, { steps: 5 });
        await expect(ghost).toBeVisible();

        await page.mouse.up();
    });

    test.eachFramework('dragging elsewhere in the cell does not move the row', async ({ agIdFor, page }) => {
        await waitForGridContent(page);

        const source = await centreOf(agIdFor.cell('0', 'athlete').locator('.athlete-info'));
        const target = await centreOf(agIdFor.cell('3', 'country'));

        await page.mouse.move(source.x, source.y);
        await page.mouse.down();
        await page.mouse.move(source.x, source.y + 15, { steps: 5 });
        await expect(page.locator('.ag-dnd-ghost')).toHaveCount(0);
        await page.mouse.move(target.x, target.y, { steps: 10 });
        await page.mouse.up();
        await waitForRowAnimations(page);

        await expectRowIdAtIndex(page, 0, '0');
        await expectRowIdAtIndex(page, 3, '3');
    });
});
