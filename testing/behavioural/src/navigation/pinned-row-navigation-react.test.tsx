import { act, cleanup, render } from '@testing-library/react';
import { asyncSetTimeout, mockGridLayout } from 'ag-test-utils';
import React from 'react';

import type { ColDef, GridApi } from 'ag-grid-community';
import {
    ClientSideRowModelApiModule,
    ClientSideRowModelModule,
    ColumnApiModule,
    ModuleRegistry,
    PinnedRowModule,
    RowApiModule,
} from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';

import { getActiveCellColId } from './navigation-test-utils';

const flush = async () => {
    await act(async () => {
        await asyncSetTimeout(0);
    });
};

describe('Pinned rows: a focused cell outside the column viewport (React)', () => {
    beforeAll(() => {
        ModuleRegistry.registerModules([
            ClientSideRowModelApiModule,
            ClientSideRowModelModule,
            ColumnApiModule,
            PinnedRowModule,
            RowApiModule,
        ]);
        mockGridLayout.init();
    });

    afterEach(() => {
        cleanup();
    });

    test('setFocusedCell draws and focuses a cell scrolled out of view on a pinned row, as on a normal row', async () => {
        const columnDefs: ColDef[] = [];
        const row: Record<string, number> = {};
        for (let i = 0; i < 120; ++i) {
            columnDefs.push({ colId: `c${i}`, field: `c${i}`, width: 120 });
            row[`c${i}`] = i;
        }
        let api: GridApi | undefined;
        render(
            <AgGridReact
                columnDefs={columnDefs}
                rowData={[row]}
                pinnedTopRowData={[row]}
                pinnedBottomRowData={[row]}
                onGridReady={(e) => {
                    api = e.api;
                }}
            />
        );
        await flush();
        expect(api!.getAllDisplayedVirtualColumns().map((col) => col.getColId())).not.toContain('c60');

        const focusedRowId = () => document.activeElement?.closest('.ag-row')?.getAttribute('row-id');
        const rows = [
            { rowPinned: 'top', rowId: api!.getPinnedTopRow(0)?.id },
            { rowPinned: null, rowId: api!.getDisplayedRowAtIndex(0)?.id },
            { rowPinned: 'bottom', rowId: api!.getPinnedBottomRow(0)?.id },
        ] as const;
        for (const { rowPinned, rowId } of rows) {
            expect(rowId).toBeDefined();
            act(() => api!.setFocusedCell(0, 'c60', rowPinned));
            await flush();
            expect({ rowPinned, colId: getActiveCellColId(), rowId: focusedRowId() }).toEqual({
                rowPinned,
                colId: 'c60',
                rowId,
            });
        }
    });

    test('setFocusedCell on a row React has not mounted yet draws and focuses the cell scrolled out of view', async () => {
        const columnDefs: ColDef[] = [];
        const rowOf = (id: string) => {
            const row: Record<string, number | string> = { id };
            for (let i = 0; i < 120; ++i) {
                row[`c${i}`] = i;
            }
            return row;
        };
        for (let i = 0; i < 120; ++i) {
            columnDefs.push({ colId: `c${i}`, field: `c${i}`, width: 120 });
        }
        let api: GridApi | undefined;
        render(
            <AgGridReact
                columnDefs={columnDefs}
                rowData={[rowOf('r0')]}
                getRowId={(params) => params.data.id}
                onGridReady={(e) => {
                    api = e.api;
                }}
            />
        );
        await flush();
        expect(api!.getAllDisplayedVirtualColumns().map((col) => col.getColId())).not.toContain('c60');

        const focusedRowId = () => document.activeElement?.closest('.ag-row')?.getAttribute('row-id');
        act(() => {
            api!.applyTransaction({ add: [rowOf('r1')] });
            expect(document.querySelector('.ag-row[row-id="r1"]')).toBeNull();
            api!.setFocusedCell(1, 'c60');
        });
        await flush();
        expect({ colId: getActiveCellColId(), rowId: focusedRowId() }).toEqual({ colId: 'c60', rowId: 'r1' });

        act(() => {
            api!.setGridOption('pinnedTopRowData', [rowOf('t0')]);
            expect(document.querySelector('.ag-row[row-id="t0"]')).toBeNull();
            api!.setFocusedCell(0, 'c60', 'top');
        });
        await flush();
        expect({ colId: getActiveCellColId(), rowId: focusedRowId() }).toEqual({ colId: 'c60', rowId: 't0' });
    });
});
