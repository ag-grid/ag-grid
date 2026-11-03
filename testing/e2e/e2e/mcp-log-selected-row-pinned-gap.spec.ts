/**
 * Issue: with a right-pinned column and columns that do not fill the grid's width, the selected-row highlight has a
 * gap between the scrolling (centre) cells and the pinned-right cells.
 *
 * Setup: a community grid with `rowSelection: { mode: 'multiRow' }`, two centre columns and one column pinned to the
 * right, with a total column width well below the grid width (nothing fills the horizontal space). One row is selected.
 *
 * Expected: the selected row is highlighted across its full width, so the empty area between the centre cells and the
 * pinned-right cells has the same selected background as the cells (the row selection docs describe the selected row
 * background colour being applied to the row).
 *
 * Actual: the empty area between them keeps the unselected row background, so the highlight is visibly broken in two
 * pieces. From 36.0.0 the selected overlay is drawn on the cell containers (`.ag-grid-scrolling-cells`,
 * `.ag-grid-pinned-right-cells`) rather than the row; before that the centre row was only as wide as its columns.
 *
 * Reported on: AG Grid react 35.1.0.
 *
 * Source: AG Grid docs MCP search log analysis (AG-18665). A coding agent using React 35.1.0 (June 2026) searched
 * "pinned column right pinned row style background selection highlight gap between center and pinned".
 */
import { expect, test } from '@playwright/test';

import { mountGrid } from '../src/mountGrid';

test('selected row highlight is continuous between centre cells and pinned-right cells', async ({ page }) => {
    const { grid, withApi } = await mountGrid(page, {
        width: 900,
        height: 300,
        options: () => ({
            columnDefs: [
                { field: 'a', width: 100 },
                { field: 'b', width: 100 },
                { field: 'c', width: 100, pinned: 'right' },
            ],
            rowData: [
                { a: 1, b: 1, c: 1 },
                { a: 2, b: 2, c: 2 },
            ],
            rowSelection: { mode: 'multiRow', checkboxes: false, enableClickSelection: true },
        }),
    });

    await withApi((api) => api.getDisplayedRowAtIndex(0)!.setSelected(true));
    await expect(grid.locator('.ag-row[row-index="0"]')).toHaveClass(/ag-row-selected/);

    /** Rendered colour at a point, taken from a screenshot so that overlays and pseudo elements are included. */
    const pixelAt = async (x: number, y: number): Promise<string> => {
        const png = await page.screenshot({ clip: { x, y, width: 1, height: 1 } });
        return page.evaluate(async (base64) => {
            const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
            const bitmap = await createImageBitmap(new Blob([bytes], { type: 'image/png' }));
            const ctx = new OffscreenCanvas(1, 1).getContext('2d')!;
            ctx.drawImage(bitmap, 0, 0);
            return Array.from(ctx.getImageData(0, 0, 1, 1).data).join(',');
        }, png.toString('base64'));
    };

    const scrolling = (await grid.locator('.ag-row[row-index="0"] .ag-grid-scrolling-cells').boundingBox())!;
    const pinned = (await grid.locator('.ag-row[row-index="0"] .ag-grid-pinned-right-cells').boundingBox())!;
    const y = scrolling.y + 3;
    const gapX = (scrolling.x + scrolling.width + pinned.x) / 2;
    expect(gapX, 'setup: there must be empty space between the centre and pinned cells').toBeGreaterThan(
        scrolling.x + scrolling.width + 50
    );

    const selectedCellColour = await pixelAt(scrolling.x + scrolling.width - 3, y);
    const gapColour = await pixelAt(gapX, y);
    expect(gapColour, 'gap between centre and pinned cells should have the selected row colour').toBe(
        selectedCellColour
    );

    // sanity: the selected colour differs from an unselected row's background, so the comparison is meaningful
    const unselected = (await grid.locator('.ag-row[row-index="1"] .ag-grid-scrolling-cells').boundingBox())!;
    expect(await pixelAt(unselected.x + unselected.width - 3, unselected.y + 3)).not.toBe(selectedCellColour);
});
