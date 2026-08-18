import { act, cleanup, render, waitFor } from '@testing-library/react';
import React from 'react';

import type { GridApi } from 'ag-grid-community';
import {
    CellSpanModule,
    ClientSideRowModelModule,
    ModuleRegistry,
    RowApiModule,
    ValidationModule,
} from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';

/**
 * AG-17868 React coverage: the fix lives in the shared SpannedCellCtrl, so it must also hold under
 * React's async mount/reconciliation, not just the vanilla view layer. Asserted on the rendered
 * `aria-rowspan` AND the rendered `style.height` — the reported bug was a stale height even while
 * aria-rowspan looked correct.
 */

/** aria-rowspan of the spanned `group` cell whose value is `value`, or null if none rendered. */
function spannedGroupRowSpan(value: string): number | null {
    const cells = Array.from(document.querySelectorAll('.ag-spanned-row [col-id="group"]'));
    const cell = cells.find((c) => c.textContent === value);
    return cell ? Number(cell.getAttribute('aria-rowspan')) : null;
}

/** Rendered height (px) of the spanned `group` cell whose value is `value`. A row is 42px tall and
 *  the span height drops one border pixel, so 2 rows = 83px and 3 rows = 125px. */
function spannedGroupHeightPx(value: string): number | null {
    const cells = Array.from(
        document.querySelectorAll<HTMLElement>('.ag-spanned-row .ag-spanned-cell[col-id="group"]')
    );
    const cell = cells.find((c) => c.textContent === value);
    return cell ? parseInt(cell.style.height, 10) : null;
}

/** Whether a regular (non-spanned) `group` cell with `value` is rendered. */
function hasRegularGroupCell(value: string): boolean {
    const cells = Array.from(document.querySelectorAll('.ag-row:not(.ag-spanned-row) [col-id="group"]'));
    return cells.some((c) => c.textContent === value);
}

describe('row spanning - rowData replacement (React)', () => {
    beforeAll(() => {
        ModuleRegistry.registerModules([ClientSideRowModelModule, CellSpanModule, RowApiModule, ValidationModule]);
    });

    afterEach(() => {
        cleanup();
    });

    test('setGridOption("rowData") re-spans spanned cells to match the new data', async () => {
        let resolveReady!: (api: GridApi) => void;
        const ready = new Promise<GridApi>((resolve) => {
            resolveReady = resolve;
        });

        render(
            <AgGridReact
                enableCellSpan
                getRowId={(p) => p.data.id}
                columnDefs={[
                    { field: 'group', spanRows: true },
                    { field: 'label', headerName: 'Row' },
                ]}
                rowData={[
                    { id: 'a0', group: 'A', label: 'r0' },
                    { id: 'a1', group: 'A', label: 'r1' },
                    { id: 'a2', group: 'A', label: 'r2' },
                    { id: 'b0', group: 'B', label: 'r3' },
                    { id: 'b1', group: 'B', label: 'r4' },
                ]}
                suppressRowVirtualisation
                suppressColumnVirtualisation
                animateRows={false}
                onGridReady={(e) => resolveReady(e.api)}
            />
        );

        const api = await ready;

        // BEFORE: group A spans 3 rows, group B spans 2 rows.
        await waitFor(() => {
            expect(spannedGroupRowSpan('A')).toBe(3);
            expect(spannedGroupRowSpan('B')).toBe(2);
            expect(spannedGroupHeightPx('A')).toBe(125); // 3 rows
            expect(spannedGroupHeightPx('B')).toBe(83); // 2 rows
        });

        act(() => {
            api.setGridOption('rowData', [
                { id: 'a0', group: 'A', label: 'r0' },
                { id: 'a1', group: 'A', label: 'r1' },
                { id: 'a2', group: 'A2', label: 'r2' },
                { id: 'b0', group: 'B', label: 'r3' },
                { id: 'b1', group: 'B', label: 'r4' },
                { id: 'b2', group: 'B', label: 'r5' },
            ]);
        });

        // AFTER: group A now spans 2, group B now spans 3, and A2 renders as a regular (non-spanned) cell.
        // The reported regression: the spanned cell kept its stale height. A shrank 3→2, B grew 2→3.
        await waitFor(() => {
            expect(spannedGroupRowSpan('A')).toBe(2);
            expect(spannedGroupRowSpan('B')).toBe(3);
            expect(hasRegularGroupCell('A2')).toBe(true);
            expect(spannedGroupHeightPx('A')).toBe(83); // 2 rows
            expect(spannedGroupHeightPx('B')).toBe(125); // 3 rows
        });
    });
});
