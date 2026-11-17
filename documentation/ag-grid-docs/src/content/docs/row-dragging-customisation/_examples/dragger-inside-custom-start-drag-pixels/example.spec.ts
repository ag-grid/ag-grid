import type { Locator } from '@playwright/test';
import { expect, expectRowIdAtIndex, test, waitForGridContent, waitForRowAnimations } from '@utils/grid/test-utils';

async function centreOf(locator: Locator) {
    const box = await locator.boundingBox();
    expect(box).not.toBeNull();
    return { x: box!.x + box!.width / 2, y: box!.y + box!.height / 2 };
}

/** The arrow icon the custom cell renderer registers via `registerRowDragger(el, 0)`. */
const rowDragger = (cell: Locator) => cell.locator('.fa-arrows-alt-v');

test.agExample(import.meta, () => {
    test.eachFramework('the drag starts on mousedown, without moving the mouse', async ({ agIdFor, page }) => {
        const logs: string[] = [];
        page.on('console', (msg) => logs.push(msg.text()));

        await waitForGridContent(page);

        const cell = agIdFor.cell('0', 'athlete');
        await expect(cell).toContainText('Michael Phelps');
        await cell.hover();
        await expect(rowDragger(cell)).toBeVisible();
        const from = await centreOf(rowDragger(cell));

        const ghost = page.locator('.ag-dnd-ghost');
        await page.mouse.move(from.x, from.y);
        await expect(ghost).toHaveCount(0);

        // dragStartPixels is 0, so mousedown alone starts the drag.
        await page.mouse.down();
        await expect(ghost).toBeVisible();
        await expect(ghost.locator('.ag-dnd-ghost-label')).toHaveText('Michael Phelps');
        await expect(() => expect(logs).toContain('onRowDragEnter: node 0')).toPass();

        await page.mouse.up();
        await expect(ghost).toHaveCount(0);
        await expect(() => expect(logs).toContain('onRowDragEnd: node 0')).toPass();
    });

    test.eachFramework('dragging the arrow reorders rows', async ({ agIdFor, page }) => {
        await waitForGridContent(page);

        const cell = agIdFor.cell('0', 'athlete');
        const target = await centreOf(agIdFor.cell('3', 'country'));
        await cell.hover();
        const from = await centreOf(rowDragger(cell));

        await page.mouse.move(from.x, from.y);
        await page.mouse.down();
        await page.mouse.move(target.x, target.y, { steps: 10 });
        await page.mouse.up();
        await waitForRowAnimations(page);

        await expectRowIdAtIndex(page, 0, '1');
        await expectRowIdAtIndex(page, 1, '2');
        await expectRowIdAtIndex(page, 2, '3');
        await expectRowIdAtIndex(page, 3, '0');
    });
});
