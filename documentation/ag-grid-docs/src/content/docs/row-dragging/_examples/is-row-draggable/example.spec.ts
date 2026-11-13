import type { Locator, Page } from '@playwright/test';
import {
    ensureGridReady,
    expect,
    expectRowIdAtIndex,
    test,
    waitForGridContent,
    waitForRowAnimations,
} from '@utils/grid/test-utils';

async function centreOf(locator: Locator) {
    const box = await locator.boundingBox();
    expect(box).not.toBeNull();
    return { x: box!.x + box!.width / 2, y: box!.y + box!.height / 2 };
}

async function dragTo(page: Page, source: Locator, target: Locator) {
    const from = await centreOf(source);
    const to = await centreOf(target);
    await page.mouse.move(from.x, from.y);
    await page.mouse.down();
    await page.mouse.move(from.x, from.y + 10, { steps: 5 });
    await page.mouse.move(to.x, to.y + 8, { steps: 10 });
    await page.mouse.up();
    await waitForRowAnimations(page);
}

test.agExample(import.meta, () => {
    test.eachFramework(
        'handles are hidden on locked rows, which cannot be dragged by handle',
        async ({ agIdFor, page }) => {
            await ensureGridReady(page);
            await waitForGridContent(page);

            // Rows 1, 4, 7... are locked.
            await expect(agIdFor.dragHandle('0', 'athlete')).toBeVisible();
            await expect(agIdFor.dragHandle('1', 'athlete')).toBeHidden();
            await expect(agIdFor.dragHandle('2', 'athlete')).toBeVisible();

            const lockedRowBefore = await agIdFor.cell('1', 'athlete').textContent();
            await dragTo(page, agIdFor.cell('1', 'athlete'), agIdFor.cell('3', 'athlete'));
            await expectRowIdAtIndex(page, 1, '1');
            await expect(agIdFor.cell('1', 'athlete')).toHaveText(lockedRowBefore!);

            await dragTo(page, agIdFor.dragHandle('0', 'athlete'), agIdFor.cell('2', 'country'));
            await expectRowIdAtIndex(page, 0, '1');
            await expectRowIdAtIndex(page, 2, '0');
        }
    );

    test.eachFramework('toggling locked shows or hides the handle', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await expect(agIdFor.dragHandle('0', 'athlete')).toBeVisible();
        await agIdFor.cell('0', 'locked').locator('input').click();
        await expect(agIdFor.dragHandle('0', 'athlete')).toBeHidden();

        await agIdFor.cell('1', 'locked').locator('input').click();
        await expect(agIdFor.dragHandle('1', 'athlete')).toBeVisible();
    });

    test.eachFramework('entire row dragging respects isRowDraggable', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await page.getByRole('button', { name: 'Drag Entire Row' }).click();

        await dragTo(page, agIdFor.cell('1', 'sport'), agIdFor.cell('3', 'sport'));
        await expectRowIdAtIndex(page, 1, '1');

        await dragTo(page, agIdFor.cell('0', 'sport'), agIdFor.cell('2', 'sport'));
        await expectRowIdAtIndex(page, 0, '1');
        await expectRowIdAtIndex(page, 2, '0');
    });
});
