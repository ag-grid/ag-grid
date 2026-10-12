import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';

import type { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import { AllCommunityModule } from 'ag-grid-community';
import { CellSelectionModule } from 'ag-grid-enterprise';
import { AgGridReact } from 'ag-grid-react';

const rowData = [{ c0: 1, c1: 2, c2: 3, c3: 4, c4: 5 }];
const columnDefs: ColDef[] = [0, 1, 2, 3, 4].map((i) => ({ colId: `c${i}`, field: `c${i}` }));
const ids = columnDefs.map((c) => c.colId!);

describe('React header cell reuse', () => {
    afterEach(() => cleanup());

    it('hide-all then show-all renders correct headers (pooled-ctrl remount is safe)', async () => {
        const apiRef: { current?: GridApi } = {};
        render(
            <AgGridReact
                rowData={rowData}
                columnDefs={columnDefs}
                modules={[AllCommunityModule]}
                onGridReady={(e: GridReadyEvent) => {
                    apiRef.current = e.api;
                }}
            />
        );

        const colIds = () => screen.queryAllByRole('columnheader').map((h) => h.getAttribute('col-id'));

        await waitFor(() => expect(colIds()).toEqual(ids));

        // Hidden columns must not be rendered.
        act(() => apiRef.current!.setColumnsVisible(ids, false));
        await waitFor(() => expect(screen.queryAllByRole('columnheader').length).toBe(0));

        // Re-show: pooled ctrls are reused and React remounts the cells correctly.
        act(() => apiRef.current!.setColumnsVisible(ids, true));
        await waitFor(() => expect(colIds()).toEqual(ids));

        // A single-column round-trip also stays correct.
        act(() => apiRef.current!.setColumnsVisible(['c2'], false));
        await waitFor(() => expect(colIds()).toEqual(['c0', 'c1', 'c3', 'c4']));
        act(() => apiRef.current!.setColumnsVisible(['c2'], true));
        await waitFor(() => expect(colIds()).toEqual(ids));
    });

    it('a header cell remounted in another lane highlights the ranges covering it', async () => {
        const apiRef: { current?: GridApi } = {};
        render(
            <AgGridReact
                rowData={rowData}
                columnDefs={columnDefs}
                modules={[AllCommunityModule, CellSelectionModule]}
                cellSelection={{ enableHeaderHighlight: true }}
                onGridReady={(e: GridReadyEvent) => {
                    apiRef.current = e.api;
                }}
            />
        );
        const highlighted = () =>
            Array.from(document.querySelectorAll('.ag-header-range-highlight'), (cell) => cell.getAttribute('col-id'));
        await waitFor(() => expect(screen.queryAllByRole('columnheader').length).toBe(ids.length));

        act(() => apiRef.current!.addCellRange({ rowStartIndex: 0, rowEndIndex: 0, columns: ['c1'] }));
        await waitFor(() => expect(highlighted()).toEqual(['c1']));

        // a header cell moved to another lane is drawn in a new element
        const before = document.querySelector('.ag-header-cell[col-id="c1"]');
        act(() => apiRef.current!.setColumnsPinned(['c1'], 'left'));
        await waitFor(() => expect(document.querySelector('.ag-header-cell[col-id="c1"]')).not.toBe(before));
        await waitFor(() => expect(highlighted()).toEqual(['c1']));

        // the remounted cell's own highlight has to follow the ranges, not just its first draw
        act(() => apiRef.current!.clearCellSelection());
        await waitFor(() => expect(highlighted()).toEqual([]));
        act(() => apiRef.current!.addCellRange({ rowStartIndex: 0, rowEndIndex: 0, columns: ['c1', 'c3'] }));
        await waitFor(() => expect(highlighted()).toEqual(['c1', 'c3']));
    });

    it('a header cell shows its column filtered, also one told while it is remounted in another lane', async () => {
        const apiRef: { current?: GridApi } = {};
        render(
            <AgGridReact
                rowData={rowData}
                columnDefs={columnDefs.map((colDef) => ({ ...colDef, filter: 'agNumberColumnFilter' }))}
                modules={[AllCommunityModule]}
                onGridReady={(e: GridReadyEvent) => {
                    apiRef.current = e.api;
                }}
            />
        );
        const filtered = () =>
            Array.from(document.querySelectorAll('.ag-header-cell-filtered'), (cell) => cell.getAttribute('col-id'));
        await waitFor(() => expect(screen.queryAllByRole('columnheader').length).toBe(ids.length));

        act(() => apiRef.current!.setFilterModel({ c1: { filterType: 'number', type: 'equals', filter: 2 } }));
        await waitFor(() => expect(filtered()).toEqual(['c1']));

        const before = document.querySelector('.ag-header-cell[col-id="c3"]');
        act(() => {
            apiRef.current!.setColumnsPinned(['c3'], 'left');
            apiRef.current!.setFilterModel({ c3: { filterType: 'number', type: 'equals', filter: 4 } });
        });
        await waitFor(() => expect(document.querySelector('.ag-header-cell[col-id="c3"]')).not.toBe(before));
        await waitFor(() => expect(filtered()).toEqual(['c3']));
    });
});
