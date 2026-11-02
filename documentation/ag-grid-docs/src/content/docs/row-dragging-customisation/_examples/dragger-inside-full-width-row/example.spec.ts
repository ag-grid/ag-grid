import type { Locator, Page } from '@playwright/test';
import { expect, expectRowIdAtIndex, test, waitForGridContent, waitForRowAnimations } from '@utils/grid/test-utils';

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
    await duringDrag?.();
    await page.mouse.move(to.x, to.y, { steps: 10 });
    await page.mouse.up();
}

test.agExample(import.meta, () => {
    test.eachFramework('a full width row can be dragged by its custom dragger', async ({ agIdFor, page }) => {
        await waitForGridContent(page);

        // data.ts: Ireland (0), Spain (1), United Kingdom (2), France (3 - full width).
        await expect(agIdFor.cell('0', 'name')).toContainText('Ireland');
        const france = agIdFor.rowNode('3');
        await expect(france.locator('.full-width-title')).toHaveText('France');

        const ghost = page.locator('.ag-dnd-ghost');
        await dragTo(page, france.locator('.full-width-title'), agIdFor.cell('0', 'name'), async () => {
            await expect(ghost).toBeVisible();
            // registerRowDragger is given the country name as the drag text.
            await expect(ghost.locator('.ag-dnd-ghost-label')).toHaveText('France');
        });
        await waitForRowAnimations(page);

        await expectRowIdAtIndex(page, 0, '3');
        await expectRowIdAtIndex(page, 1, '0');
        await expectRowIdAtIndex(page, 2, '1');
        await expectRowIdAtIndex(page, 3, '2');
    });

    test.eachFramework('normal rows have no dragger and cannot be dragged', async ({ agIdFor, page }) => {
        await waitForGridContent(page);

        await expect(page.locator('.ag-drag-handle')).toHaveCount(0);
        await expect(agIdFor.cell('1', 'name')).toContainText('Spain');

        const ghost = page.locator('.ag-dnd-ghost');
        await dragTo(page, agIdFor.cell('1', 'name'), agIdFor.cell('4', 'name'), async () => {
            await expect(ghost).toHaveCount(0);
        });
        await waitForRowAnimations(page);

        await expectRowIdAtIndex(page, 0, '0');
        await expectRowIdAtIndex(page, 1, '1');
        await expectRowIdAtIndex(page, 4, '4');
    });
});
