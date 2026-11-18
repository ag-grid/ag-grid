import type { Locator, Page } from '@playwright/test';
import {
    clickHeaderToSort,
    ensureGridReady,
    expect,
    expectRowIdAtIndex,
    test,
    waitForGridContent,
    waitForRowAnimations,
} from '@utils/grid/test-utils';

/** Drags a row by its handle and drops it over the lower part of the target cell's row. */
async function dragRowBelow(page: Page, handle: Locator, target: Locator) {
    const handleBox = (await handle.boundingBox())!;
    const targetBox = (await target.boundingBox())!;
    const startX = handleBox.x + handleBox.width / 2;
    const startY = handleBox.y + handleBox.height / 2;

    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(startX, startY + 10, { steps: 5 });
    await page.mouse.move(startX, targetBox.y + targetBox.height * 0.75, { steps: 10 });
    await expect(page.locator('.ag-dnd-ghost')).toBeVisible();
    await page.mouse.up();
    await waitForRowAnimations(page);
}

test.agExample(import.meta, () => {
    test.eachFramework(
        'Suppress hides the drag handles and Remove Suppress shows them again',
        async ({ agIdFor, page }) => {
            await ensureGridReady(page);
            await waitForGridContent(page);

            const handle = agIdFor.dragHandle('0', 'athlete');
            await expect(handle).toBeVisible();

            // suppressRowDrag=true hides the drag handles.
            await page.getByRole('button', { name: 'Suppress', exact: true }).click();
            await expect(handle).toBeHidden();
            await expect(agIdFor.dragHandle('1', 'athlete')).toBeHidden();

            // suppressRowDrag=false shows them again, and managed dragging works.
            await page.getByRole('button', { name: 'Remove Suppress' }).click();
            await expect(handle).toBeVisible();
            await expect(handle).not.toHaveClass(/ag-drag-handle-disabled/);

            await dragRowBelow(page, handle, agIdFor.cell('3', 'country'));
            await expectRowIdAtIndex(page, 0, '1');
            await expectRowIdAtIndex(page, 2, '3');
            await expectRowIdAtIndex(page, 3, '0');
        }
    );

    test.eachFramework('sorting a column disables the drag handles', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        await expect(agIdFor.dragHandle('0', 'athlete')).not.toHaveClass(/ag-drag-handle-disabled/);

        // Ascending sort on year: 2000 rows come first, so Michael Phelps (2008) leaves the top.
        await clickHeaderToSort(agIdFor.headerCell('year'));
        await waitForRowAnimations(page);
        await expectRowIdAtIndex(page, 0, '0', { not: true });

        await expect(
            page.locator('.ag-grid-scrolling-container .ag-row[row-index="0"]').locator('.ag-row-drag')
        ).toHaveClass(/ag-drag-handle-disabled/);
    });

    test.eachFramework('filtering disables the drag handles', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);

        // Michael Phelps is in rows 0, 1 and 2 of olympic-winners.json.
        await agIdFor.headerFilterButton('athlete').click();
        const filterInput = agIdFor.textFilterInstanceInput({ source: 'column-filter' });
        await filterInput.fill('Michael Phelps');
        await filterInput.press('Enter');
        await page.keyboard.press('Escape');

        await expect(agIdFor.rowNode('3')).toHaveCount(0);
        await expect(agIdFor.dragHandle('0', 'athlete')).toHaveClass(/ag-drag-handle-disabled/);
        await expect(agIdFor.dragHandle('2', 'athlete')).toHaveClass(/ag-drag-handle-disabled/);
    });
});
