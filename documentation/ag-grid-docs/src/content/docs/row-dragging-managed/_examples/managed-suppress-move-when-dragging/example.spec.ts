import {
    ensureGridReady,
    expect,
    expectRowIdAtIndex,
    test,
    waitForGridContent,
    waitForRowAnimations,
} from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    // suppressMoveWhenRowDragging=true: the rows stay where they are while dragging and the
    // dragged row is only moved when it is dropped.
    test.eachFramework('rows do not move while dragging, only on drop', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');
        await expectRowIdAtIndex(page, 0, '0');

        const handleBox = (await agIdFor.dragHandle('0', 'athlete').boundingBox())!;
        const targetBox = (await agIdFor.cell('3', 'country').boundingBox())!;
        const x = handleBox.x + handleBox.width / 2;
        const startY = handleBox.y + handleBox.height / 2;

        await page.mouse.move(x, startY);
        await page.mouse.down();
        await page.mouse.move(x, startY + 10, { steps: 5 });
        await page.mouse.move(x, targetBox.y + targetBox.height * 0.75, { steps: 10 });

        // The drag is in progress over row 3, but no row has moved yet.
        await expect(page.locator('.ag-dnd-ghost')).toBeVisible();
        await expectRowIdAtIndex(page, 0, '0');
        await expectRowIdAtIndex(page, 1, '1');
        await expectRowIdAtIndex(page, 2, '2');
        await expectRowIdAtIndex(page, 3, '3');

        await page.mouse.up();
        await waitForRowAnimations(page);

        // On drop, row 0 lands after row 3.
        await expect(page.locator('.ag-dnd-ghost')).toHaveCount(0);
        await expectRowIdAtIndex(page, 0, '1');
        await expectRowIdAtIndex(page, 1, '2');
        await expectRowIdAtIndex(page, 2, '3');
        await expectRowIdAtIndex(page, 3, '0');
        await expectRowIdAtIndex(page, 4, '4');
    });
});
