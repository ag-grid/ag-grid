/**
 * Issue: with `enableRowPinning`, making the only pinned row taller via `rowNode.setRowHeight()` followed by
 * `api.onRowHeightChanged()` updates the row element but never resizes the pinned section that reserves space for it,
 * so the taller row overflows its section and overlaps the body rows next to it. The last row of a section
 * growing moves no other row's top, so the manual pinned row model dispatches nothing.
 *
 * Setup: `enableRowPinning` with `isRowPinned` pinning one row to the bottom. The pinned row is made 40px taller with
 * `setRowHeight` and `onRowHeightChanged` is called.
 *
 * Expected: the Row Height docs (Height for Pinned Rows) say that when `enableRowPinning = true` the height of pinned
 * rows "can be changed as described above", i.e. `rowNode.setRowHeight(height)` then `api.onRowHeightChanged()`. So the
 * pinned bottom section grows by 40px to fit the row. (Static pinned rows already do this.)
 *
 * Actual: the pinned row is 40px taller but the pinned bottom row container keeps its old height.
 *
 * Reported on: not reported; found by an area review of Pinned rows and body height for AG-18665. Related searches
 * (vanilla 35.0.x): "pinned bottom row visibility and grid height layout" and "pinned bottom row overlaps last row
 * cannot scroll to last row domLayout normal container height".
 *
 * Source: found by an area review of Pinned rows and body height for AG-18665.
 */
import { waitFor } from '@testing-library/dom';
import { TestGridsManager } from 'ag-test-utils';

import { ClientSideRowModelModule, PinnedRowModule } from 'ag-grid-community';

describe('pinned bottom row height change via setRowHeight', () => {
    const gridMgr = new TestGridsManager({ modules: [ClientSideRowModelModule, PinnedRowModule] });

    afterEach(() => gridMgr.reset());

    test('the pinned bottom container follows the only pinned row growing', async () => {
        const api = await gridMgr.createGridAndWait('grid', {
            columnDefs: [{ field: 'a' }],
            rowData: [{ a: 1 }, { a: 2 }],
            enableRowPinning: true,
            isRowPinned: (node) => (node.data?.a === 2 ? 'bottom' : null),
        });

        const container = document.querySelector<HTMLElement>('.ag-grid-pinned-bottom-rows-container')!;
        const rowHeight = api.getPinnedBottomRow(0)!.rowHeight!;
        await waitFor(() => expect(Number.parseFloat(container.style.height)).toBeGreaterThanOrEqual(rowHeight));
        const containerHeight = Number.parseFloat(container.style.height);

        api.forEachPinnedRow('bottom', (node) => node.setRowHeight(rowHeight + 40));
        api.onRowHeightChanged();

        await waitFor(() => expect(Number.parseFloat(container.style.height)).toBe(containerHeight + 40));
    });
});
