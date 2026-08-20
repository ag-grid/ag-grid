import { waitFor } from '@testing-library/dom';

import type { GridApi } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ColumnApiModule,
    ColumnAutoSizeModule,
    EventApiModule,
    PaginationModule,
} from 'ag-grid-community';

import { TestGridsManager } from '../test-utils';

describe('autoSizeStrategy events', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, ColumnApiModule, ColumnAutoSizeModule, EventApiModule, PaginationModule],
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

    const totalWidth = (api: GridApi): number => widths(api).reduce((sum, width) => sum + width, 0);

    const widthOf = (api: GridApi, colId: string): number => api.getColumn(colId)!.getActualWidth();

    const countResizeBatches = (api: GridApi): (() => number) => {
        let count = 0;
        api.addEventListener('columnResized', (e) => {
            if (e.finished) {
                count++;
            }
        });
        return () => count;
    };

    let controlGridCount = 0;
    const settleStrategyWindow = async (): Promise<void> => {
        const control = gridsManager.createGrid(`controlGrid${controlGridCount++}`, {
            columnDefs,
            autoSizeStrategy: { type: 'fitProvidedWidth', width: 900, events: ['columnVisible'] },
        });
        await waitFor(() => expect(widths(control)).toEqual([300, 300, 300]));

        control.setColumnsVisible(['c'], false);
        await waitFor(() => expect(widths(control)).toEqual([450, 450]));
    };

    const paginatedGridOptions = {
        columnDefs,
        rowData: [
            { a: '1', b: '1', c: '1' },
            { a: '2', b: '2', c: '2' },
        ],
        pagination: true,
        paginationPageSize: 1,
        paginationPageSizeSelector: false,
    };

    describe('fitProvidedWidth', () => {
        test('re-runs on a configured event', async () => {
            const api = gridsManager.createGrid('myGrid', {
                ...paginatedGridOptions,
                autoSizeStrategy: { type: 'fitProvidedWidth', width: 900, events: ['paginationChanged'] },
            });
            await waitFor(() => expect(widths(api)).toEqual([300, 300, 300]));

            api.setColumnWidths([{ key: 'a', newWidth: 400 }]);
            api.paginationGoToNextPage();

            await waitFor(() => expect(widths(api)).toEqual([300, 300, 300]));
            expect(totalWidth(api)).toBe(900);
        });

        test('does not re-run when no events are configured', async () => {
            const api = gridsManager.createGrid('myGrid', {
                ...paginatedGridOptions,
                autoSizeStrategy: { type: 'fitProvidedWidth', width: 900 },
            });
            await waitFor(() => expect(widths(api)).toEqual([300, 300, 300]));

            api.setColumnWidths([{ key: 'a', newWidth: 400 }]);
            api.paginationGoToNextPage();
            await settleStrategyWindow();

            expect(widthOf(api, 'a')).toBe(400);
        });

        test('a sizing event in the list settles instead of looping', async () => {
            const api = gridsManager.createGrid('myGrid', {
                ...paginatedGridOptions,
                autoSizeStrategy: { type: 'fitProvidedWidth', width: 900, events: ['columnResized'] },
            });
            await waitFor(() => expect(widths(api)).toEqual([300, 300, 300]));

            const resizeBatches = countResizeBatches(api);

            api.setColumnWidths([{ key: 'a', newWidth: 400 }]);
            await settleStrategyWindow();

            expect(widths(api)).toEqual([300, 300, 300]);
            expect(resizeBatches()).toBe(2);
        });
    });

    describe('fitCellContents', () => {
        test('re-runs on a configured event', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs,
                rowData: [{ a: 'x', b: 'y', c: 'z' }],
                autoSizeStrategy: { type: 'fitCellContents', skipHeader: true, events: ['columnVisible'] },
            });
            await waitFor(() => expect(widths(api)).toEqual([100, 100, 100]));

            api.setColumnWidths([{ key: 'a', newWidth: 400 }]);
            expect(widthOf(api, 'a')).toBe(400);

            api.setColumnsVisible(['c'], false);

            await waitFor(() => expect(widthOf(api, 'a')).toBe(100));
        });

        test('does not re-run when no events are configured', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs,
                rowData: [{ a: 'x', b: 'y', c: 'z' }],
                autoSizeStrategy: { type: 'fitCellContents', skipHeader: true },
            });
            await waitFor(() => expect(widths(api)).toEqual([100, 100, 100]));

            api.setColumnWidths([{ key: 'a', newWidth: 400 }]);
            api.setColumnsVisible(['c'], false);
            await settleStrategyWindow();

            expect(widthOf(api, 'a')).toBe(400);
        });

        test('re-runs on pagination changes', async () => {
            const api = gridsManager.createGrid('myGrid', {
                ...paginatedGridOptions,
                autoSizeStrategy: { type: 'fitCellContents', skipHeader: true, events: ['paginationChanged'] },
            });
            await waitFor(() => expect(widths(api)).toEqual([100, 100, 100]));

            api.setColumnWidths([{ key: 'a', newWidth: 400 }]);
            api.paginationGoToNextPage();

            await waitFor(() => expect(widthOf(api, 'a')).toBe(100));
        });

        test('re-runs when a column group is expanded', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs: [
                    {
                        groupId: 'group',
                        children: [
                            { colId: 'a', minWidth: 100, width: 200 },
                            { colId: 'b', minWidth: 100, width: 200, columnGroupShow: 'open' },
                        ],
                    },
                ],
                rowData: [{ a: 'x', b: 'y' }],
                autoSizeStrategy: { type: 'fitCellContents', skipHeader: true, events: ['columnGroupOpened'] },
            });
            await waitFor(() => expect(widths(api)).toEqual([100]));

            api.setColumnWidths([{ key: 'a', newWidth: 400 }]);
            api.setColumnGroupOpened('group', true);

            await waitFor(() => expect(widths(api)).toEqual([100, 100]));
        });

        test('re-runs when new column defs are set', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs,
                rowData: [{ a: 'x', b: 'y', c: 'z' }],
                autoSizeStrategy: { type: 'fitCellContents', skipHeader: true, events: ['gridColumnsChanged'] },
            });
            await waitFor(() => expect(widths(api)).toEqual([100, 100, 100]));

            api.setGridOption('columnDefs', [{ colId: 'c', minWidth: 150, width: 400 }]);

            await waitFor(() => expect(widths(api)).toEqual([150]));
        });

        test('re-runs after a row transaction', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs,
                rowData: [{ a: 'x', b: 'y', c: 'z' }],
                autoSizeStrategy: { type: 'fitCellContents', skipHeader: true, events: ['modelUpdated'] },
            });
            await waitFor(() => expect(widths(api)).toEqual([100, 100, 100]));

            api.setColumnWidths([{ key: 'a', newWidth: 400 }]);
            api.applyTransaction({ add: [{ a: 'a much longer value', b: 'y', c: 'z' }] });

            await waitFor(() => expect(widthOf(api, 'a')).toBe(100));
        });

        test('a sizing event in the list settles instead of looping', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs,
                rowData: [{ a: 'x', b: 'y', c: 'z' }],
                autoSizeStrategy: { type: 'fitCellContents', skipHeader: true, events: ['columnResized'] },
            });
            await waitFor(() => expect(widths(api)).toEqual([100, 100, 100]));

            const resizeBatches = countResizeBatches(api);

            api.setColumnWidths([{ key: 'a', newWidth: 400 }]);
            await settleStrategyWindow();

            expect(widthOf(api, 'a')).toBe(100);
            expect(resizeBatches()).toBe(2);
        });

        test('an autoSizeColumns API call is not treated as a trigger', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs,
                rowData: [{ a: 'x', b: 'y', c: 'z' }],
                autoSizeStrategy: {
                    type: 'fitCellContents',
                    skipHeader: true,
                    defaultMinWidth: 100,
                    events: ['columnResized'],
                },
            });
            await waitFor(() => expect(widths(api)).toEqual([100, 100, 100]));

            api.autoSizeColumns({ colIds: ['a'], defaultMinWidth: 250 });
            await waitFor(() => expect(widthOf(api, 'a')).toBe(250));
            await settleStrategyWindow();

            expect(widthOf(api, 'a')).toBe(250);
        });

        test('debounces rapid events into a single run', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs,
                rowData: [{ a: 'x', b: 'y', c: 'z' }],
                autoSizeStrategy: { type: 'fitCellContents', skipHeader: true, events: ['columnVisible'] },
            });
            await waitFor(() => expect(widths(api)).toEqual([100, 100, 100]));

            const resizeBatches = countResizeBatches(api);

            api.setColumnsVisible(['c'], false);
            api.setColumnsVisible(['c'], true);
            api.setColumnsVisible(['c'], false);
            await settleStrategyWindow();

            expect(resizeBatches()).toBe(1);
        });
    });

    describe('startup', () => {
        test('a lifecycle event fired during setup does not size the columns twice', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs,
                rowData: [{ a: 'x', b: 'y', c: 'z' }],
                autoSizeStrategy: { type: 'fitCellContents', skipHeader: true, events: ['modelUpdated'] },
            });
            const resizeBatches = countResizeBatches(api);

            await waitFor(() => expect(widths(api)).toEqual([100, 100, 100]));
            await settleStrategyWindow();

            expect(resizeBatches()).toBe(1);
        });

        test('a lifecycle event is superseded however late the data it waits on arrives', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs,
                autoSizeStrategy: { type: 'fitCellContents', skipHeader: true, events: ['gridReady'] },
            });
            const resizeBatches = countResizeBatches(api);

            await settleStrategyWindow();
            api.setGridOption('rowData', [{ a: 'x', b: 'y', c: 'z' }]);

            await waitFor(() => expect(widths(api)).toEqual([100, 100, 100]));
            await settleStrategyWindow();

            expect(resizeBatches()).toBe(1);
        });

        test('data arriving at a grid which started empty sizes the columns once', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs,
                rowData: [],
                autoSizeStrategy: { type: 'fitCellContents', skipHeader: true, events: ['modelUpdated'] },
            });
            const resizeBatches = countResizeBatches(api);
            await settleStrategyWindow();

            api.setGridOption('rowData', [{ a: 'x', b: 'y', c: 'z' }]);

            await waitFor(() => expect(widths(api)).toEqual([100, 100, 100]));
            await settleStrategyWindow();

            expect(resizeBatches()).toBe(1);
        });

        test('an event after setup still re-runs the strategy', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs,
                rowData: [{ a: 'x', b: 'y', c: 'z' }],
                autoSizeStrategy: { type: 'fitCellContents', skipHeader: true, events: ['modelUpdated'] },
            });
            await waitFor(() => expect(widths(api)).toEqual([100, 100, 100]));

            api.setColumnWidths([{ key: 'a', newWidth: 400 }]);
            api.applyTransaction({ add: [{ a: 'x2', b: 'y2', c: 'z2' }] });

            await waitFor(() => expect(widthOf(api, 'a')).toBe(100));
        });
    });

    describe('fitGridWidth', () => {
        test('re-runs on a configured event without disturbing the columns', async () => {
            const api = gridsManager.createGrid('myGrid', {
                columnDefs,
                autoSizeStrategy: { type: 'fitGridWidth', defaultMinWidth: 100, events: ['columnVisible'] },
            });
            await settleStrategyWindow();

            api.setColumnsVisible(['c'], false);
            await settleStrategyWindow();

            expect(api.getAllDisplayedColumns().map((col) => col.getColId())).toEqual(['a', 'b']);
            expect(widths(api)).toEqual([200, 200]);
        });
    });
});
