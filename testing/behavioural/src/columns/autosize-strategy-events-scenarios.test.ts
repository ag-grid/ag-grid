import { waitFor } from '@testing-library/dom';

import type { GridApi } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ColumnApiModule,
    ColumnAutoSizeModule,
    PaginationModule,
    ScrollApiModule,
} from 'ag-grid-community';
import { ServerSideRowModelModule } from 'ag-grid-enterprise';

import { TestGridsManager } from '../test-utils';

describe('autoSizeStrategy events - reported scenarios', () => {
    const gridsManager = new TestGridsManager({
        modules: [
            ClientSideRowModelModule,
            ColumnApiModule,
            ColumnAutoSizeModule,
            PaginationModule,
            ScrollApiModule,
            ServerSideRowModelModule,
        ],
    });

    afterEach(() => {
        gridsManager.reset();
    });

    const columnDefs = [
        { colId: 'a', minWidth: 100, width: 200 },
        { colId: 'b', minWidth: 100, width: 200 },
        { colId: 'c', minWidth: 100, width: 200 },
    ];

    const widths = (api: GridApi): number[] => api.getAllDisplayedColumns().map((col) => col.getActualWidth());

    const widthOf = (api: GridApi, colId: string): number => api.getColumn(colId)!.getActualWidth();

    test('re-runs when the rendered columns change', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs,
            rowData: [{ a: 'x', b: 'y', c: 'z' }],
            autoSizeStrategy: { type: 'fitCellContents', skipHeader: true, events: ['virtualColumnsChanged'] },
        });
        await waitFor(() => expect(widths(api)).toEqual([100, 100, 100]));

        api.setColumnWidths([{ key: 'a', newWidth: 400 }]);
        expect(widthOf(api, 'a')).toBe(400);

        api.setGridOption('columnDefs', [...columnDefs, { colId: 'd', minWidth: 100, width: 200 }]);

        await waitFor(() => expect(widthOf(api, 'a')).toBe(100));
    });

    test('re-runs when the rendered row range changes', async () => {
        const rowData = Array.from({ length: 200 }, (_, i) => ({ a: `row ${i}`, b: 'y', c: 'z' }));
        const api = gridsManager.createGrid('myGrid', {
            columnDefs,
            rowData,
            autoSizeStrategy: { type: 'fitCellContents', skipHeader: true, events: ['viewportChanged'] },
        });
        await waitFor(() => expect(widths(api)).toEqual([100, 100, 100]));

        api.setColumnWidths([{ key: 'a', newWidth: 400 }]);
        expect(widthOf(api, 'a')).toBe(400);

        api.applyTransaction({ add: [{ a: 'row 200', b: 'y', c: 'z' }] });

        await waitFor(() => expect(widthOf(api, 'a')).toBe(100));
    });

    test('re-runs on a server-side pagination change', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs,
            rowModelType: 'serverSide',
            pagination: true,
            paginationPageSize: 1,
            paginationPageSizeSelector: false,
            autoSizeStrategy: { type: 'fitCellContents', skipHeader: true, events: ['paginationChanged'] },
            serverSideDatasource: {
                getRows: (params) => {
                    const rows = [
                        { a: '1', b: '1', c: '1' },
                        { a: '2', b: '2', c: '2' },
                    ];
                    params.success({
                        rowData: rows.slice(params.request.startRow, params.request.endRow),
                        rowCount: 2,
                    });
                },
            },
        });
        await waitFor(() => expect(widths(api)).toEqual([100, 100, 100]));

        api.setColumnWidths([{ key: 'a', newWidth: 400 }]);
        api.paginationGoToNextPage();

        await waitFor(() => expect(widthOf(api, 'a')).toBe(100));
    });

    test('re-runs when loaded data replaces the placeholder rows it first measured', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs,
            rowData: [{ a: '', b: '', c: '' }],
            autoSizeStrategy: { type: 'fitCellContents', skipHeader: true, events: ['modelUpdated'] },
        });
        await waitFor(() => expect(widths(api)).toEqual([100, 100, 100]));

        api.setColumnWidths([{ key: 'a', newWidth: 400 }]);
        expect(widthOf(api, 'a')).toBe(400);

        api.setGridOption('rowData', [{ a: 'a much longer value', b: 'y', c: 'z' }]);

        await waitFor(() => expect(widthOf(api, 'a')).toBe(100));
    });
});
