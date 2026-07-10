import { expect, test, waitForGridContent } from '@utils/grid/test-utils';

/** Returns col-ids of the leaf header cells, ordered left to right. */
async function leafHeaderOrder(page: import('playwright/test').Page) {
    return page.evaluate(() => {
        const cells = document.querySelectorAll('.ag-header-row .ag-grid-scrolling-cells .ag-header-cell[col-id]');
        const seen = new Set<string>();
        return Array.from(cells)
            .sort(
                (a, b) =>
                    parseInt(a.getAttribute('aria-colindex') || '0') - parseInt(b.getAttribute('aria-colindex') || '0')
            )
            .map((c) => c.getAttribute('col-id')!)
            .filter((id) => (seen.has(id) ? false : (seen.add(id), true)));
    });
}

test.agExample(import.meta, () => {
    test.eachFramework('grid renders grouped columns with data', async ({ page, agIdFor }) => {
        await waitForGridContent(page);

        await expect(agIdFor.cell('0', 'athlete')).toContainText('Michael Phelps');
        await expect(agIdFor.cell('0', 'gold')).toContainText('8');

        const order = await leafHeaderOrder(page);
        expect(order).toEqual([
            'athlete',
            'age',
            'country',
            'year',
            'date',
            'sport',
            'gold',
            'silver',
            'bronze',
            'total',
        ]);
    });

    test.eachFramework('columns can still be reordered via keyboard', async ({ page, agIdFor }) => {
        await waitForGridContent(page);

        const before = await leafHeaderOrder(page);
        expect(before.indexOf('age')).toBe(1);
        expect(before.indexOf('athlete')).toBe(0);

        // suppressMoveWhenColumnDragging only suppresses live movement while dragging;
        // keyboard moves still reorder columns.
        await agIdFor.headerCell('athlete').click();
        await page.keyboard.press('Shift+ArrowRight');

        const after = await leafHeaderOrder(page);
        // athlete has swapped past age.
        expect(after.indexOf('athlete')).toBe(1);
        expect(after.indexOf('age')).toBe(0);
    });
});
