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

/** Collects the example's `console.log` output, which is where it reports every row drag event. */
function captureLogs(page: Page) {
    const logs: string[] = [];
    page.on('console', (msg) => {
        if (msg.type() === 'log') {
            logs.push(msg.text());
        }
    });
    return logs;
}

/**
 * Presses the mouse on a row drag handle and moves it over the lower half of the target row,
 * leaving the button held so the caller can assert the mid-drag state.
 */
async function startRowDrag(page: Page, handle: Locator, target: Locator) {
    // After a sort, rows slide to their new positions with a CSS transition; measure only once it has finished.
    await page.waitForFunction(() =>
        Array.from(document.querySelectorAll('.ag-row')).every((row) => row.getAnimations().length === 0)
    );
    const handleBox = (await handle.boundingBox())!;
    const targetBox = (await target.boundingBox())!;
    const startX = handleBox.x + handleBox.width / 2;
    const startY = handleBox.y + handleBox.height / 2;

    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(startX, startY + 10, { steps: 5 });
    await page.mouse.move(startX, targetBox.y + targetBox.height * 0.75, { steps: 10 });
}

test.agExample(import.meta, () => {
    test.eachFramework(
        'a drag fires rowDragEnter, rowDragMove and rowDragEnd without moving the rows',
        async ({ agIdFor, page }) => {
            await ensureGridReady(page);
            await waitForGridContent(page);
            const logs = captureLogs(page);

            // olympic-winners.json, no getRowId: row 0 Michael Phelps, row 3 Natalie Coughlin.
            await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');
            await expect(agIdFor.cell('3', 'athlete')).toContainText('Natalie Coughlin');

            await startRowDrag(page, agIdFor.dragHandle('0', 'athlete'), agIdFor.cell('3', 'country'));
            await expect(page.locator('.ag-dnd-ghost')).toBeVisible();
            await page.mouse.up();
            await expect(page.locator('.ag-dnd-ghost')).toHaveCount(0);

            await expect(() => {
                expect(logs).toContain('onRowDragEnter: node 0');
                expect(logs).toContain('onRowDragMove: node 0');
                expect(logs).toContain('onRowDragEnd: node 0');
            }).toPass();
            expect(logs.indexOf('onRowDragEnter: node 0')).toBeLessThan(logs.indexOf('onRowDragMove: node 0'));
            expect(logs.at(-1)).toBe('onRowDragEnd: node 0');
            expect(logs).not.toContain('onRowDragLeave: node 0');
            expect(logs).not.toContain('onRowDragCancel: node 0');

            // rowDragManaged is not set and the example does not move rows itself.
            await waitForRowAnimations(page);
            await expectRowIdAtIndex(page, 0, '0');
            await expectRowIdAtIndex(page, 1, '1');
            await expectRowIdAtIndex(page, 2, '2');
            await expectRowIdAtIndex(page, 3, '3');
        }
    );

    test.eachFramework(
        'onRowDragMove shows the drop position indicator, cleared on drop',
        async ({ agIdFor, page }) => {
            await ensureGridReady(page);
            await waitForGridContent(page);

            // The mouse is over the lower half of row 3, so the indicator is drawn below it.
            await startRowDrag(page, agIdFor.dragHandle('0', 'athlete'), agIdFor.cell('3', 'country'));
            await expect(agIdFor.rowNode('3')).toHaveClass(/ag-row-highlight-below/);
            await expect(agIdFor.rowNode('3')).not.toHaveClass(/ag-row-highlight-above/);

            // onRowDragEnd calls setRowDropPositionIndicator(null).
            await page.mouse.up();
            await expect(agIdFor.rowNode('3')).not.toHaveClass(/ag-row-highlight-below/);
        }
    );

    test.eachFramework('dragging out of the grid fires rowDragLeave and no rowDragEnd', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);
        const logs = captureLogs(page);

        await startRowDrag(page, agIdFor.dragHandle('0', 'athlete'), agIdFor.cell('3', 'country'));
        await expect(() => expect(logs).toContain('onRowDragEnter: node 0')).toPass();

        // Leave the grid over the example's header banner, then release there.
        const bannerBox = (await page.locator('.example-header').boundingBox())!;
        await page.mouse.move(bannerBox.x + 50, bannerBox.y + bannerBox.height / 2, { steps: 10 });
        await expect(() => expect(logs).toContain('onRowDragLeave: node 0')).toPass();
        await expect(agIdFor.rowNode('3')).not.toHaveClass(/ag-row-highlight-below/);

        await page.mouse.up();
        await expect(page.locator('.ag-dnd-ghost')).toHaveCount(0);
        await waitForRowAnimations(page);

        // The drag ended outside the grid, so rowDragLeave is the last event fired.
        expect(logs.at(-1)).toBe('onRowDragLeave: node 0');
        expect(logs).not.toContain('onRowDragEnd: node 0');
    });

    test.eachFramework('pressing Escape mid-drag fires rowDragCancel', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);
        const logs = captureLogs(page);

        await startRowDrag(page, agIdFor.dragHandle('0', 'athlete'), agIdFor.cell('3', 'country'));
        await expect(agIdFor.rowNode('3')).toHaveClass(/ag-row-highlight-below/);

        await page.keyboard.press('Escape');
        await expect(() => expect(logs).toContain('onRowDragCancel: node 0')).toPass();
        // onRowDragCancel clears the indicator.
        await expect(agIdFor.rowNode('3')).not.toHaveClass(/ag-row-highlight-below/);
        await page.mouse.up();
        expect(logs).not.toContain('onRowDragEnd: node 0');
    });

    test.eachFramework('row dragging stays enabled while a sort is applied', async ({ agIdFor, page }) => {
        await ensureGridReady(page);
        await waitForGridContent(page);
        const logs = captureLogs(page);

        // Descending sort on year puts the 2012 rows first; row 2 (Michael Phelps, 2012) is the first of them.
        await clickHeaderToSort(agIdFor.headerCell('year'));
        await waitForRowAnimations(page);
        await clickHeaderToSort(agIdFor.headerCell('year'));
        await expect(agIdFor.headerCell('year')).toHaveAttribute('aria-sort', 'descending');
        await waitForRowAnimations(page);
        await expectRowIdAtIndex(page, 0, '2');

        // The application never sets suppressRowDrag, so the handle is still shown and the drag still fires events.
        const handle = agIdFor.dragHandle('2', 'athlete');
        await expect(handle).toBeVisible();
        const target = page.locator('.ag-grid-scrolling-container .ag-row[row-index="3"]');
        await startRowDrag(page, handle, target);
        await page.mouse.up();

        await expect(() => {
            expect(logs).toContain('onRowDragEnter: node 2');
            expect(logs).toContain('onRowDragEnd: node 2');
        }).toPass();
        await expectRowIdAtIndex(page, 0, '2');
    });
});
