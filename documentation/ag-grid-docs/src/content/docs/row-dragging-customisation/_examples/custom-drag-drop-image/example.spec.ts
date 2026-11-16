import type { Locator } from '@playwright/test';
import { expect, expectRowIdAtIndex, test, waitForGridContent, waitForRowAnimations } from '@utils/grid/test-utils';

async function centreOf(locator: Locator) {
    const box = await locator.boundingBox();
    expect(box).not.toBeNull();
    return { x: box!.x + box!.width / 2, y: box!.y + box!.height / 2 };
}

test.agExample(import.meta, () => {
    test.eachFramework(
        'dragging a row shows the custom drag and drop image and drops the row',
        async ({ agIdFor, page }) => {
            await waitForGridContent(page);

            await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');

            const cover = page.locator('.my-custom-drag-and-drop-cover');
            await expect(cover).toHaveCount(0);

            const from = await centreOf(agIdFor.dragHandle('0', 'athlete'));
            const target = await centreOf(agIdFor.cell('3', 'country'));
            await page.mouse.move(from.x, from.y);
            await page.mouse.down();
            await page.mouse.move(from.x, from.y + 15, { steps: 5 });
            await page.mouse.move(target.x, target.y, { steps: 10 });

            // dragAndDropImageComponent replaces the default ghost; its label is the dragged cell value.
            await expect(cover).toBeVisible();
            await expect(cover).toContainText('Michael Phelps');
            await expect(page.locator('.ag-dnd-ghost')).toHaveCount(0);

            await page.mouse.up();
            await expect(cover).toHaveCount(0);
            await waitForRowAnimations(page);

            await expectRowIdAtIndex(page, 0, '1');
            await expectRowIdAtIndex(page, 1, '2');
            await expectRowIdAtIndex(page, 2, '3');
            await expectRowIdAtIndex(page, 3, '0');
        }
    );
});
