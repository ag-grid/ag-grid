import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

/** Returns col-ids of the leaf header cells in the scrolling (non-pinned) area, ordered left to right. */
async function scrollingHeaderOrder(page: import('playwright/test').Page) {
    return page.evaluate(() => {
        const cells = document.querySelectorAll('.ag-header-row .ag-grid-scrolling-cells .ag-header-cell[col-id]');
        return Array.from(cells)
            .sort(
                (a, b) =>
                    parseInt(a.getAttribute('aria-colindex') || '0') - parseInt(b.getAttribute('aria-colindex') || '0')
            )
            .map((c) => c.getAttribute('col-id'));
    });
}

test.agExample(import.meta, () => {
    test.eachFramework('locked columns sit at the edges of the scrollable area', async ({ page, agIdFor }) => {
        await waitForGridContent(page);

        // Data lands correctly (first row of olympic-winners.json).
        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');
        await expect(agIdFor.cell('0', 'age')).toContainText('23');
        await expect(agIdFor.cell('0', 'total')).toContainText('8');

        // age is lockPosition:'left' so it starts the scrollable area; total is lockPosition:'right' so it ends it.
        const order = await scrollingHeaderOrder(page);
        expect(order[0]).toBe('age');
        expect(order[order.length - 1]).toBe('total');
    });

    test.eachFramework('locked columns cannot be displaced by moving another column', async ({ page, agIdFor }) => {
        await waitForGridContent(page);

        const before = await scrollingHeaderOrder(page);
        expect(before[0]).toBe('age');
        expect(before[before.length - 1]).toBe('total');

        // Try to drag the movable country column to the very front via keyboard moves.
        await agIdFor.headerCell('country').click();
        await page.keyboard.press('Shift+ArrowLeft');
        await page.keyboard.press('Shift+ArrowLeft');
        await page.keyboard.press('Shift+ArrowLeft');

        const after = await scrollingHeaderOrder(page);
        // age stays locked at the start and total locked at the end despite the moves.
        expect(after[0]).toBe('age');
        expect(after[after.length - 1]).toBe('total');
    });
});
