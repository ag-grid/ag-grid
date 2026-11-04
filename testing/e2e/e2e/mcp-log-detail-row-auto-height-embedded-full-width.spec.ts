import { expect, test } from '@playwright/test';

import type { MountedGrid } from '../src/mountGrid';
import { mountGrid } from '../src/mountGrid';

/**
 * Issue: `detailRowAutoHeight` is never applied when the master grid uses `embedFullWidthRows` or the print layout.
 * With either option the detail row is built from per-section (pinned left, centre, pinned right) renderers, and that
 * path never sets up the auto height measurement the non-embedded path sets up. The detail row starts at its
 * placeholder height of 1px, nothing ever raises it, and the detail grid is rendered inside a 1px tall row.
 *
 * Setup: a master grid with `masterDetail` and `detailRowAutoHeight`, one master row with five detail records, and the
 * row expanded. Three variants: a control with neither option, one adding `embedFullWidthRows: true`, and one using
 * `domLayout: 'print'` instead.
 *
 * Expected: "Set grid property `detailRowAutoHeight=true` to have the detail grid dynamically change its height to fit
 * its rows" (Master Detail - Detail Height docs page, Auto Height). The Master Detail - Other docs page describes
 * `embedFullWidthRows=true` as a way of placing the detail grid in the same container as the master cells, and neither
 * page says the two options are incompatible. So the detail row should grow to fit its detail grid, as the control does.
 *
 * Actual: the control grows to the height of the five detail rows. With `embedFullWidthRows: true`, and with
 * `domLayout: 'print'`, the detail row height stays at 1px.
 *
 * Reported on: not reported; found by an area review of Master detail row height for AG-18665. Searches about the detail
 * grid being cut off or the wrong height when scrolling horizontally with the master (vanilla 35.x) match this.
 *
 * Source: found by an area review of Master detail row height for AG-18665.
 *
 * Playwright rather than happy-dom because auto height depends on measuring the rendered detail content, which
 * happy-dom cannot do without a shim for the measurement the bug depends on.
 */

/** Expands the first row and checks the detail row grew to fit its five-row detail grid. */
async function expectDetailRowSizedToDetailGrid({ withApi }: MountedGrid) {
    await withApi((api) => api.getDisplayedRowAtIndex(0)!.setExpanded(true));

    // five detail rows plus a header need well over 100px
    await expect
        .poll(() => withApi((api) => api.getDisplayedRowAtIndex(1)?.rowHeight), { message: 'detail row height' })
        .toBeGreaterThanOrEqual(100);
}

test('control: detail row grows to fit its detail grid', async ({ page }) => {
    const mounted = await mountGrid(page, {
        enterprise: true,
        height: 600,
        options: () => ({
            masterDetail: true,
            detailRowAutoHeight: true,
            columnDefs: [{ field: 'k', cellRenderer: 'agGroupCellRenderer' }],
            rowData: [{ k: '1', records: [1, 2, 3, 4, 5].map((x) => ({ x })) }],
            detailCellRendererParams: {
                detailGridOptions: { columnDefs: [{ field: 'x' }] },
                getDetailRowData: (p: any) => p.successCallback(p.data.records),
            },
        }),
    });
    await expectDetailRowSizedToDetailGrid(mounted);
});

test('detail row grows to fit its detail grid with embedFullWidthRows', async ({ page }) => {
    const mounted = await mountGrid(page, {
        enterprise: true,
        height: 600,
        options: () => ({
            embedFullWidthRows: true,
            masterDetail: true,
            detailRowAutoHeight: true,
            columnDefs: [{ field: 'k', cellRenderer: 'agGroupCellRenderer' }],
            rowData: [{ k: '1', records: [1, 2, 3, 4, 5].map((x) => ({ x })) }],
            detailCellRendererParams: {
                detailGridOptions: { columnDefs: [{ field: 'x' }] },
                getDetailRowData: (p: any) => p.successCallback(p.data.records),
            },
        }),
    });
    await expectDetailRowSizedToDetailGrid(mounted);
});

test('detail row grows to fit its detail grid in print layout', async ({ page }) => {
    const mounted = await mountGrid(page, {
        enterprise: true,
        height: 600,
        options: () => ({
            domLayout: 'print',
            masterDetail: true,
            detailRowAutoHeight: true,
            columnDefs: [{ field: 'k', cellRenderer: 'agGroupCellRenderer' }],
            rowData: [{ k: '1', records: [1, 2, 3, 4, 5].map((x) => ({ x })) }],
            detailCellRendererParams: {
                detailGridOptions: { columnDefs: [{ field: 'x' }] },
                getDetailRowData: (p: any) => p.successCallback(p.data.records),
            },
        }),
    });
    await expectDetailRowSizedToDetailGrid(mounted);
});
