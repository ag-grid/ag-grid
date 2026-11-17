import { waitFor } from '@testing-library/dom';
import { TestGridsManager, waitForEvent } from 'ag-test-utils';
import { mockGridLayout } from 'ag-test-utils/polyfills/mockGridLayout';
import { waitForNoLoadingRows } from 'ag-test-utils/ssrm-test-utils';

import type { GridOptions } from 'ag-grid-community';
import { CellSpanModule, RowAutoHeightModule, ScrollApiModule } from 'ag-grid-community';
import { ServerSideRowModelApiModule, ServerSideRowModelModule } from 'ag-grid-enterprise';

/**
 * `api.resetRowHeights()` is a shared row-model API usable under the Server-Side Row Model. It works every row height
 * out again, asking `getRowHeight` again; under Auto Row Height that answer is the floor of the measured height.
 */
describe('SSRM resetRowHeights', () => {
    const gridsManager = new TestGridsManager({
        modules: [
            CellSpanModule,
            ServerSideRowModelApiModule,
            ServerSideRowModelModule,
            RowAutoHeightModule,
            ScrollApiModule,
        ],
    });

    afterEach(() => {
        gridsManager.reset();
    });

    const rowData = Array.from({ length: 10 }, (_, i) => ({ id: i, value: `Row ${i}` }));

    function baseGridOptions(overrides: Partial<GridOptions> = {}): GridOptions {
        return {
            columnDefs: [{ field: 'id' }, { field: 'value' }],
            rowModelType: 'serverSide',
            getRowId: (params) => String(params.data.id),
            serverSideDatasource: {
                getRows: (params) => {
                    const slice = rowData.slice(params.request.startRow, params.request.endRow);
                    params.success({ rowData: slice, rowCount: rowData.length });
                },
            },
            ...overrides,
        };
    }

    test('resetRowHeights asks getRowHeight again, without warning', async () => {
        const consoleWarnSpy = vitest.spyOn(console, 'warn').mockImplementation(() => {});
        let height = 50;
        const api = gridsManager.createGrid(null, baseGridOptions({ getRowHeight: () => height }));
        await waitForEvent('firstDataRendered', api);
        await waitForNoLoadingRows(api);

        height = 70;
        api.resetRowHeights();

        expect(api.getDisplayedRowAtIndex(0)!.rowHeight).toBe(70);
        expect(consoleWarnSpy).not.toHaveBeenCalled();

        consoleWarnSpy.mockRestore();
    });

    test('resetRowHeights asks getRowHeight again under auto row height, without warning', async () => {
        const consoleWarnSpy = vitest.spyOn(console, 'warn').mockImplementation(() => {});
        let floor = 50;
        const api = gridsManager.createGrid(
            null,
            baseGridOptions({
                columnDefs: [{ field: 'id' }, { field: 'value', autoHeight: true, wrapText: true }],
                getRowHeight: () => floor,
            })
        );
        await waitForEvent('firstDataRendered', api);
        await waitForNoLoadingRows(api);

        floor = 70;
        api.resetRowHeights();

        await waitFor(() => expect(api.getDisplayedRowAtIndex(0)!.rowHeight).toBe(70));
        expect(consoleWarnSpy).not.toHaveBeenCalled();
        consoleWarnSpy.mockRestore();
    });

    // A loading row has no data for getRowHeight to answer about, so it keeps the uniform height loading rows get.
    test('resetRowHeights leaves a loading row at the uniform height', async () => {
        const api = gridsManager.createGrid(
            null,
            baseGridOptions({
                // Never answers, so the rows stay loading.
                serverSideDatasource: { getRows: () => {} },
                getRowHeight: () => 30,
            })
        );
        await waitFor(() => expect(api.getDisplayedRowAtIndex(0)?.stub).toBe(true));
        const loadingRow = api.getDisplayedRowAtIndex(0)!;
        expect(loadingRow.rowHeight).toBe(42);

        api.resetRowHeights();

        expect(loadingRow.rowHeight).toBe(42);
    });

    // Auto height measures rendered rows only, so a row scrolled out keeps its height until it is rendered again.
    describe('with a measured row scrolled out of view', () => {
        beforeAll(() => {
            mockGridLayout.useRealOffsetDimensions = true;
            mockGridLayout.elementHeightOverride = (el) =>
                el.classList.contains('ag-cell-wrapper') && el.isConnected && el.closest('[col-id="value"]')
                    ? 100
                    : undefined;
        });

        afterAll(() => {
            mockGridLayout.resetOptions();
        });

        test('resetRowHeights keeps it at its measured height, held to a raised getRowHeight', async () => {
            let floor = 42;
            const longRowData = Array.from({ length: 200 }, (_, i) => ({ id: i, value: `Row ${i}` }));
            const api = gridsManager.createGrid(
                null,
                baseGridOptions({
                    columnDefs: [{ field: 'id' }, { field: 'value', autoHeight: true }],
                    cacheBlockSize: 200,
                    suppressRowVirtualisation: false,
                    getRowHeight: () => floor,
                    serverSideDatasource: {
                        getRows: (params) =>
                            params.success({
                                rowData: longRowData.slice(params.request.startRow, params.request.endRow),
                                rowCount: longRowData.length,
                            }),
                    },
                })
            );
            await waitForEvent('firstDataRendered', api);
            await waitForNoLoadingRows(api);
            const firstRow = api.getDisplayedRowAtIndex(0)!;
            await waitFor(() => expect(firstRow.rowHeight).toBe(100));
            api.ensureIndexVisible(150);
            await waitFor(() => expect(api.getRenderedNodes().map((node) => node.rowIndex)).not.toContain(0));

            api.resetRowHeights();

            expect(firstRow.rowHeight).toBe(100);
            floor = 150;
            api.resetRowHeights();
            expect(firstRow.rowHeight).toBe(150);
            // Held to its content, not to what it last had: a lowered floor or a height the app set does not stick.
            floor = 42;
            api.resetRowHeights();
            expect(firstRow.rowHeight).toBe(100);
            firstRow.setRowHeight(300);
            api.onRowHeightChanged();
            api.resetRowHeights();
            expect(firstRow.rowHeight).toBe(100);
        });

        test('resetRowHeights keeps the last row of a span at the share of the span it took', async () => {
            const longRowData = Array.from({ length: 200 }, (_, i) => ({ id: i, value: i < 2 ? 'same' : `Row ${i}` }));
            const api = gridsManager.createGrid(
                null,
                baseGridOptions({
                    columnDefs: [{ field: 'id' }, { field: 'value', autoHeight: true, spanRows: true }],
                    enableCellSpan: true,
                    cacheBlockSize: 200,
                    suppressRowVirtualisation: false,
                    serverSideDatasource: {
                        getRows: (params) =>
                            params.success({
                                rowData: longRowData.slice(params.request.startRow, params.request.endRow),
                                rowCount: longRowData.length,
                            }),
                    },
                })
            );
            await waitForEvent('firstDataRendered', api);
            await waitForNoLoadingRows(api);
            const spanLastRow = api.getDisplayedRowAtIndex(1)!;
            await waitFor(() => expect(spanLastRow.rowHeight).toBe(100 - 42));
            api.ensureIndexVisible(150);
            await waitFor(() => expect(api.getRenderedNodes().map((node) => node.rowIndex)).not.toContain(1));

            api.resetRowHeights();

            expect(spanLastRow.rowHeight).toBe(100 - 42);
        });

        test('a row auto height never measures still takes a rowHeight change', async () => {
            const api = gridsManager.createGrid(
                null,
                baseGridOptions({
                    columnDefs: [{ field: 'id' }, { field: 'value', autoHeight: true }],
                    isFullWidthRow: ({ rowNode }) => rowNode.data?.id === 1,
                    fullWidthCellRenderer: () => 'full width',
                })
            );
            await waitForEvent('firstDataRendered', api);
            await waitForNoLoadingRows(api);
            await waitFor(() => expect(api.getDisplayedRowAtIndex(0)!.rowHeight).toBe(100));

            api.setGridOption('rowHeight', 80);

            expect(api.getDisplayedRowAtIndex(1)!.rowHeight).toBe(80);
        });
    });
});
