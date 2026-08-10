/**
 * `autoSizeStrategy.events` — the reported scenarios the option exists to solve.
 *
 * Each case configures the grid event that covers one of them and asserts the strategy ran after
 * the grid rendered what that event describes: a change to the rendered columns, a change to the
 * rendered row range, a server-side page change, and data arriving after the grid was created.
 *
 * jsdom renders every row and column at once, so scrolling changes neither rendered set and the
 * virtualisation events never fire for it. The first two cases therefore change the rendered set
 * directly - the same events, reached the only way this harness can reach them.
 *
 * jsdom reports 0 px for the autosize measuring container, so `fitCellContents` lands every column
 * on its `minWidth`. A re-run is therefore observable by widening a column by hand, firing the
 * event, and watching it snap back to `minWidth`.
 */
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

    /**
     * TC2 — columns virtualised out of view are not measured, so bringing them into the rendered set
     * must re-run. jsdom renders every column at once, so the rendered set is changed here by adding
     * a column rather than by scrolling one in; `virtualColumnsChanged` is the event either produces.
     */
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

    /**
     * TC4 — rows scrolled into view carry values the earlier run never measured. jsdom renders every
     * row at once, so the rendered range is changed here by adding rows rather than by scrolling to
     * them; `viewportChanged` is the event either produces.
     */
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

    /** TC5.1 — the server-side row model swaps the whole page on a pagination change. */
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

    /**
     * TC7 — skeleton loading sizes the columns against placeholder cells, so the real values that
     * replace them are never measured. The strategy has already been applied here, which is what
     * makes the widened column snapping back attributable to the re-run rather than to the
     * first-data-rendered application.
     */
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
