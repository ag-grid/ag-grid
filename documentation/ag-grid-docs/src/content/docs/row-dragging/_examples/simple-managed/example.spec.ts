import {
    ensureGridReady,
    expect,
    expectRowIdAtIndex,
    test,
    waitForGridContent,
    waitForRowAnimations,
} from '@utils/grid/test-utils';

test.agExample(import.meta, () => {
    // rowDrag=true on the athlete column adds a drag handle to every row; rowDragManaged=true lets
    // the grid reorder the rows itself when one is dragged.
    test.eachFramework('dragging a row by its handle reorders the rows', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');
        await expect(agIdFor.cell('4', 'athlete')).toContainText('Aleksey Nemov');

        // Only the athlete column has a drag handle.
        const handle = agIdFor.dragHandle('0', 'athlete');
        await expect(handle).toBeVisible();
        await expect(agIdFor.cell('0', 'country').locator('.ag-row-drag')).toHaveCount(0);

        // Drag row 0 below row 4.
        const handleBox = (await handle.boundingBox())!;
        const targetBox = (await agIdFor.cell('4', 'country').boundingBox())!;
        const x = handleBox.x + handleBox.width / 2;
        const startY = handleBox.y + handleBox.height / 2;
        await page.mouse.move(x, startY);
        await page.mouse.down();
        await page.mouse.move(x, startY + 10, { steps: 5 });
        await page.mouse.move(x, targetBox.y + targetBox.height * 0.75, { steps: 10 });
        await expect(page.locator('.ag-dnd-ghost')).toBeVisible();
        await page.mouse.up();
        await waitForRowAnimations(page);

        await expectRowIdAtIndex(page, 0, '1');
        await expectRowIdAtIndex(page, 3, '4');
        await expectRowIdAtIndex(page, 4, '0');
        await expectRowIdAtIndex(page, 5, '5');
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');
    });
});
