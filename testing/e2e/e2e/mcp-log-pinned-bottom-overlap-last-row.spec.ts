import { expect, test } from '@playwright/test';

import { mountGrid } from '../src/mountGrid';

/**
 * Pinned bottom rows overlapping the last body row after `pinnedBottomRowData` is replaced.
 *
 * Problem: with the default `domLayout: 'normal'`, static `pinnedBottomRowData` and a wrapping `autoHeight`
 * column, replacing `pinnedBottomRowData` after load leaves the pinned rows laid out wrongly: they overlap each
 * other and the pinned bottom area extends up over the last body row, even when the body is scrolled to the end.
 * (With the initial data and the same columns the layout is correct.)
 *
 * Setup: a fixed-height grid with 50 body rows and 2 pinned bottom rows. After load `pinnedBottomRowData` is set
 * to 3 rows, the first with long text that wraps over several lines. The body is then scrolled to the last row.
 *
 * Expected: the pinned bottom area sits below the body viewport, so with the body scrolled to the end the last
 * body row is fully visible above the first pinned bottom row (Row Pinning docs page, `pinnedBottomRowData`).
 *
 * Actual: the first pinned bottom row starts above the bottom edge of the last body row, covering it.
 *
 * Reported on: vanilla 35.0.0 and 35.0.1; also seen on the current development build.
 *
 * Source: AG Grid docs MCP search log analysis (AG-18665).
 * Two searches from vanilla JS clients on 35.0.1 (February 2026) and 35.0.0 (August 2026):
 * "pinned bottom row visibility and grid height layout" and
 * "pinned bottom row overlaps last row cannot scroll to last row domLayout normal container height".
 * The searches only suggested a possible overlap between pinned bottom rows and the last body row. The plain case
 * (fixed height, static pinned rows, scrolled to the end) does not reproduce; the trigger found is the combination
 * of a wrapText + autoHeight column with a replaced pinnedBottomRowData.
 */
test('pinned bottom rows do not cover the last body row after pinnedBottomRowData is replaced', async ({ page }) => {
    const { grid, withApi } = await mountGrid(page, {
        width: 500,
        height: 400,
        options: () => ({
            columnDefs: [
                { field: 'id', width: 80 },
                { field: 'text', width: 100, wrapText: true, autoHeight: true },
            ],
            rowData: Array.from({ length: 50 }, (_, i) => ({ id: i, text: `Row ${i}` })),
            pinnedBottomRowData: [
                { id: 'p1', text: 'Pinned one' },
                { id: 'p2', text: 'Pinned two' },
            ],
        }),
    });
    await expect(grid.locator('.ag-row').first()).toBeVisible();

    await withApi((api) =>
        api.setGridOption('pinnedBottomRowData', [
            { id: 'p1', text: 'A much longer pinned text that wraps over several lines' },
            { id: 'p2', text: 'Pinned two' },
            { id: 'p3', text: 'Pinned three' },
        ])
    );

    // free space between the last body row's bottom edge and the first pinned row's top edge
    const gap = async () => {
        await withApi((api) => api.ensureIndexVisible(49, 'bottom'));
        return page.evaluate(() => {
            const last = document.querySelector('.ag-row[row-id="49"]:not(.ag-row-pinned)');
            const pinned = document.querySelector('.ag-row-pinned');
            if (!last || !pinned) {
                return null;
            }
            return Math.round(pinned.getBoundingClientRect().top - last.getBoundingClientRect().bottom);
        });
    };

    await expect.poll(gap).not.toBeNull();
    await expect
        .poll(async () => (await gap())! >= 0, {
            message: 'last body row must not extend below the top of the pinned bottom rows',
        })
        .toBe(true);
});
