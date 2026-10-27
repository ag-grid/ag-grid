/**
 * Issue: with `tooltipShowMode = 'whenTruncated'`, a column that uses a custom cell renderer shows its tooltip even
 * when the cell text is not truncated.
 *
 * Setup: two columns with `tooltipField` and a wide width, so the text fits and shows no ellipsis. One column renders
 * plain text, the other uses a custom `cellRenderer`. `tooltipShowMode = 'whenTruncated'`, with a short show delay.
 *
 * Expected: tooltips only appear when the hovered cell value is truncated (ellipsis), so neither cell shows a tooltip
 * here. Source: the `tooltipShowMode` API documentation ("The tooltip will only be displayed when the items hovered
 * have truncated (showing ellipsis) values") and the Tooltips docs page.
 *
 * Actual: hovering the plain cell correctly shows no tooltip, but hovering the custom-renderer cell shows the tooltip
 * regardless of truncation, because no truncation check is applied to cells with an active custom renderer.
 *
 * Reported on: AG Grid vue 35.0.1 and react 33.2.4.
 *
 * Source: AG Grid docs MCP search log analysis (AG-18665). Coding agents using the Vue docs (35.0.1, February 2026) and
 * the React docs (33.2.4, February 2026) searched for "whenTruncated not working ellipsis tooltip cell" and
 * "tooltipShowMode whenTruncated not working requirements TooltipModule".
 */
import { expect, test } from '@playwright/test';

import { mountGrid } from '../src/mountGrid';

test('whenTruncated shows no tooltip for a non-truncated cell with a custom cellRenderer', async ({ page }) => {
    const { cell } = await mountGrid(page, {
        width: 600,
        height: 200,
        options: () => ({
            tooltipShowMode: 'whenTruncated',
            tooltipShowDelay: 0,
            columnDefs: [
                { field: 'plain', width: 250, tooltipField: 'plain' },
                {
                    field: 'custom',
                    width: 250,
                    tooltipField: 'custom',
                    cellRenderer: (params: { value: string }) => {
                        const span = document.createElement('span');
                        span.textContent = params.value;
                        return span;
                    },
                },
            ],
            rowData: [{ plain: 'short', custom: 'short' }],
        }),
    });
    const tooltip = page.locator('.ag-tooltip');
    const nextFrames = () =>
        page.evaluate(() => new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r()))));

    await cell(0, 'plain').hover();
    await nextFrames();
    await expect(tooltip, 'plain cell, not truncated').toHaveCount(0);

    await page.mouse.move(0, 0);
    await cell(0, 'custom').hover();
    await nextFrames();
    await expect(tooltip, 'custom renderer cell, not truncated').toHaveCount(0);
});
