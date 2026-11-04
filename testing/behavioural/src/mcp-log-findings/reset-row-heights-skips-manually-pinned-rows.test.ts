/**
 * Issue: `api.resetRowHeights()` does not call `getRowHeight` again for rows pinned with `enableRowPinning`. The
 * source row in the body is recalculated, but its pinned copy keeps the height it had before, because the reset
 * marks each row node (and its detail and footer siblings) as needing a new height but never the pinned copy.
 *
 * Setup: `enableRowPinning` with `isRowPinned` pinning one row to the bottom, and a `getRowHeight` that returns a
 * variable. The variable is changed from 50 to 90 and `api.resetRowHeights()` is called.
 *
 * Expected: the Row Height docs say of `resetRowHeights`: "Call this API to have the grid clear all the row heights
 * and work them all out again from scratch - if you provide a `getRowHeight(params)` callback, it will be called
 * again for each row." They also say `getRowHeight` "is also called for Total Rows and Pinned Rows, separately from
 * the row they duplicate", and that the height of rows pinned with `enableRowPinning` "can be changed as described
 * above". The only documented exception is for `pinnedTopRowData` / `pinnedBottomRowData`. The `resetRowHeights` API
 * documentation says "Tells the grid to recalculate the row heights." So the pinned row becomes 90px high and the
 * pinned bottom section grows to match.
 *
 * Actual: the pinned row stays 50px high and so does the pinned bottom section, while the same row in the body
 * becomes 90px.
 *
 * Reported on: not reported; found by area review.
 *
 * Source: found by an area review of "Pinned rows and body height" for AG-18665.
 */
import { waitFor } from '@testing-library/dom';
import { TestGridsManager } from 'ag-test-utils';

import { ClientSideRowModelModule, PinnedRowModule } from 'ag-grid-community';

// TODO: disabled due to AG-XXXXX - placeholder, replace with this bug's JIRA key before merging; re-enable once fixed
describe.skip('resetRowHeights with manually pinned rows', () => {
    const gridMgr = new TestGridsManager({ modules: [ClientSideRowModelModule, PinnedRowModule] });

    afterEach(() => gridMgr.reset());

    test('recalculates the height of a pinned row and its section', async () => {
        let height = 50;
        const api = await gridMgr.createGridAndWait('grid', {
            columnDefs: [{ field: 'sport' }],
            rowData: [{ sport: 'football' }, { sport: 'rugby' }],
            enableRowPinning: true,
            isRowPinned: (node) => (node.data?.sport === 'football' ? 'bottom' : null),
            getRowHeight: () => height,
        });
        const pinnedSection = () =>
            TestGridsManager.getHTMLElement(api)!.querySelector<HTMLElement>('.ag-grid-pinned-bottom-rows-container')!;

        height = 90;
        api.resetRowHeights();

        await waitFor(() => expect(api.getDisplayedRowAtIndex(0)!.rowHeight).toBe(90));
        expect(api.getPinnedBottomRow(0)!.rowHeight).toBe(90);
        expect(pinnedSection().style.height).toBe('90px');
    });
});
