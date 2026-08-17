import { cleanup, render, waitFor } from '@testing-library/react';
import React from 'react';

import type { GridApi } from 'ag-grid-community';
import { CellSpanModule, ClientSideRowModelModule, ModuleRegistry, ValidationModule } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';

/**
 * React coverage. The fix reads `rowCtrl.ariaRowIndex`, which is `null` until the spanned
 * row's `updateRowIndexes()` runs. React fires a child cell's mount effect before its parent row's, so
 * the cell's `refreshAriaRowIndex` runs while `ariaRowIndex` is still null and `SpannedRowCtrl.setComp`
 * must re-push it once the row has mounted. This test exercises that ordering path, which the vanilla
 * suite (synchronous row-before-cell mount) cannot.
 */

/** [cell aria-rowindex, containing spanned-row wrapper aria-rowindex] for every rendered spanned cell. */
function spannedCellRowIndexes(): Array<[string | null, string | null]> {
    const rows = Array.from(document.querySelectorAll<HTMLElement>('.ag-spanned-row'));
    return rows.map((row) => {
        const cell = row.querySelector<HTMLElement>('.ag-spanned-cell');
        return [cell?.getAttribute('aria-rowindex') ?? null, row.getAttribute('aria-rowindex')];
    });
}

describe('row spanning aria-rowindex (React)', () => {
    beforeAll(() => {
        ModuleRegistry.registerModules([ClientSideRowModelModule, CellSpanModule, ValidationModule]);
    });

    afterEach(() => {
        cleanup();
    });

    test('spanned cell carries the same valid 1-based aria-rowindex as its spanned row (never 0)', async () => {
        let resolveReady!: (api: GridApi) => void;
        const ready = new Promise<GridApi>((resolve) => {
            resolveReady = resolve;
        });

        render(
            <AgGridReact
                enableCellSpan
                columnDefs={[
                    { field: 'group', spanRows: true },
                    { field: 'label', headerName: 'Row' },
                ]}
                rowData={[
                    { group: 'A', label: 'r0' },
                    { group: 'A', label: 'r1' },
                    { group: 'B', label: 'r2' },
                    { group: 'B', label: 'r3' },
                ]}
                suppressRowVirtualisation
                suppressColumnVirtualisation
                animateRows={false}
                onGridReady={(e) => resolveReady(e.api)}
            />
        );

        await ready;

        await waitFor(() => {
            const indexes = spannedCellRowIndexes();
            expect(indexes).toHaveLength(2);
            for (const [cellIndex, rowIndex] of indexes) {
                expect(cellIndex).not.toBe('0');
                expect(cellIndex).toBe(rowIndex);
            }
            expect(indexes.map(([cellIndex]) => cellIndex)).toEqual(['2', '4']);
        });
    });
});
