import { waitFor } from '@testing-library/dom';
import { ALL_SEVERITIES, TestGridsManager, asyncSetTimeout, isAgHtmlElementVisible } from 'ag-test-utils';

import {
    CellSpanModule,
    CellStyleModule,
    ClientSideRowModelModule,
    RowAutoHeightModule,
    RowStyleModule,
    enableDevValidations,
} from 'ag-grid-community';

describe('CSRM loading rows', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, CellSpanModule, CellStyleModule, RowAutoHeightModule, RowStyleModule],
    });
    const columnDefs = [{ field: 'athlete' }, { field: 'country' }];

    afterEach(() => gridsManager.reset());

    function hasLoadingOverlay(): boolean {
        return isAgHtmlElementVisible(document.querySelector('.ag-overlay-loading-center'));
    }

    test('loading rows display ten skeleton rows instead of the loading overlay by default', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs,
            loading: { type: 'rows' },
        });

        await waitFor(() => expect(api.getDisplayedRowCount()).toBe(10));

        expect(hasLoadingOverlay()).toBe(false);
        for (let i = 0; i < 10; ++i) {
            const row = api.getDisplayedRowAtIndex(i)!;
            expect(row.stub).toBe(true);
            expect(row.data).toBeUndefined();
            expect(row.selectable).toBe(false);
        }
        expect(document.querySelector('.ag-row-loading')).not.toBeNull();
        await waitFor(() => expect(document.querySelector('.ag-skeleton-effect')).not.toBeNull());
    });

    test('rowCount configures the number of loading rows', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs,
            loading: { type: 'rows', rowCount: 3 },
        });

        await waitFor(() => expect(api.getDisplayedRowCount()).toBe(3));
        expect(api.getDisplayedRowAtIndex(2)?.stub).toBe(true);
        expect(api.getDisplayedRowAtIndex(3)).toBeUndefined();
    });

    test('real rows are retained while loading and restored when loading finishes', async () => {
        const rowData = [
            { athlete: 'Michael Phelps', country: 'United States' },
            { athlete: 'Usain Bolt', country: 'Jamaica' },
        ];
        const api = gridsManager.createGrid('myGrid', {
            columnDefs,
            rowData,
            loading: { type: 'rows', rowCount: 3 },
        });

        await waitFor(() => expect(api.getDisplayedRowCount()).toBe(3));
        const visited: unknown[] = [];
        api.forEachNode((node) => visited.push(node.data));
        expect(visited).toEqual(rowData);

        api.setGridOption('loading', false);

        await waitFor(() => expect(api.getDisplayedRowCount()).toBe(2));
        expect(api.getDisplayedRowAtIndex(0)?.data).toBe(rowData[0]);
        expect(api.getDisplayedRowAtIndex(1)?.data).toBe(rowData[1]);
        expect(document.querySelector('.ag-row-loading')).toBeNull();
    });

    test('loading options update the row count and switch to the overlay', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs,
            loading: { type: 'rows', rowCount: 2 },
        });

        await waitFor(() => expect(api.getDisplayedRowCount()).toBe(2));

        api.setGridOption('loading', { type: 'rows', rowCount: 4 });
        await waitFor(() => expect(api.getDisplayedRowCount()).toBe(4));

        api.setGridOption('loading', { type: 'overlay' });
        await waitFor(() => expect(hasLoadingOverlay()).toBe(true));
        expect(api.getDisplayedRowCount()).toBe(0);
    });

    test('loading=true continues to display the loading overlay', () => {
        const api = gridsManager.createGrid('myGrid', { columnDefs, loading: true });

        expect(api.getDisplayedRowCount()).toBe(0);
        expect(hasLoadingOverlay()).toBe(true);
    });

    test('loading rows use the configured loading cell renderer', async () => {
        gridsManager.createGrid('myGrid', {
            columnDefs,
            loading: { type: 'rows', rowCount: 2 },
            defaultColDef: {
                loadingCellRenderer: () => 'Waiting for data',
            },
        });

        await waitFor(() =>
            expect(
                [...document.querySelectorAll('.ag-cell')].some((cell) => cell.textContent === 'Waiting for data')
            ).toBe(true)
        );
        expect(document.querySelector('.ag-skeleton-effect')).toBeNull();
    });

    test('loading rows do not fire firstDataRendered or invoke getRowHeight with missing data', async () => {
        const rowData = [{ athlete: 'Michael Phelps', country: 'United States' }];
        const rowHeightData: unknown[] = [];
        let firstDataRenderedCount = 0;
        const api = gridsManager.createGrid('myGrid', {
            columnDefs,
            loading: { type: 'rows' },
            getRowHeight: (params) => {
                rowHeightData.push(params.data);
                return 30;
            },
            onFirstDataRendered: () => ++firstDataRenderedCount,
        });

        await waitFor(() => expect(api.getDisplayedRowCount()).toBe(10));
        expect(firstDataRenderedCount).toBe(0);
        expect(rowHeightData).toEqual([]);

        api.updateGridOptions({ rowData, loading: false });

        await waitFor(() => expect(firstDataRenderedCount).toBe(1));
        expect(rowHeightData.length).toBeGreaterThan(0);
        expect(rowHeightData.every((data) => data === rowData[0])).toBe(true);
    });

    test('loading rows do not invoke regular value or row callbacks with missing data', async () => {
        const callsWithMissingData = {
            valueGetter: 0,
            valueFormatter: 0,
            cellStyle: 0,
            cellClass: 0,
            cellClassRules: 0,
            getRowStyle: 0,
            getRowClass: 0,
            rowClassRules: 0,
            isFullWidthRow: 0,
            processRowPostCreate: 0,
            getBusinessKeyForNode: 0,
        };
        const noCallsWithMissingData = { ...callsWithMissingData };
        const makeCallbackColumnDefs = () => [
            {
                colId: 'total',
                valueGetter: (params) => {
                    if (!params.data) {
                        callsWithMissingData.valueGetter++;
                        return undefined;
                    }
                    return params.data.price * params.data.quantity;
                },
                valueFormatter: (params) => {
                    if (!params.data) {
                        callsWithMissingData.valueFormatter++;
                    }
                    return String(params.value);
                },
                cellStyle: (params) => {
                    if (!params.data) {
                        callsWithMissingData.cellStyle++;
                    }
                    return undefined;
                },
                cellClass: (params) => {
                    if (!params.data) {
                        callsWithMissingData.cellClass++;
                    }
                    return undefined;
                },
                cellClassRules: {
                    error: (params) => {
                        if (!params.data) {
                            callsWithMissingData.cellClassRules++;
                        }
                        return false;
                    },
                },
            },
        ];
        const api = gridsManager.createGrid('myGrid', {
            loading: { type: 'rows', rowCount: 2 },
            columnDefs: makeCallbackColumnDefs(),
            getRowStyle: (params) => {
                if (!params.data) {
                    callsWithMissingData.getRowStyle++;
                }
                return undefined;
            },
            getRowClass: (params) => {
                if (!params.data) {
                    callsWithMissingData.getRowClass++;
                }
                return undefined;
            },
            rowClassRules: {
                error: (params) => {
                    if (!params.data) {
                        callsWithMissingData.rowClassRules++;
                    }
                    return false;
                },
            },
            isFullWidthRow: (params) => {
                if (!params.rowNode.data) {
                    callsWithMissingData.isFullWidthRow++;
                }
                return false;
            },
            processRowPostCreate: (params) => {
                if (!params.node.data) {
                    callsWithMissingData.processRowPostCreate++;
                }
            },
            getBusinessKeyForNode: (node) => {
                if (!node.data) {
                    callsWithMissingData.getBusinessKeyForNode++;
                }
                return node.data?.id;
            },
        });

        await waitFor(() => expect(api.getDisplayedRowCount()).toBe(2));
        expect(callsWithMissingData).toEqual(noCallsWithMissingData);

        api.refreshCells({ force: true });
        expect(callsWithMissingData).toEqual(noCallsWithMissingData);

        api.setGridOption('columnDefs', makeCallbackColumnDefs());
        await asyncSetTimeout(0);
        await waitFor(() => expect(api.getDisplayedRowCount()).toBe(2));
        expect(callsWithMissingData).toEqual(noCallsWithMissingData);
    });

    test('loading rows cannot be converted into full-width application rows', async () => {
        let fullWidthRendererCalls = 0;
        const api = gridsManager.createGrid('myGrid', {
            loading: { type: 'rows', rowCount: 2 },
            columnDefs,
            isFullWidthRow: (params) => params.rowNode.data == null,
            fullWidthCellRenderer: () => {
                fullWidthRendererCalls++;
                return 'Application full-width row';
            },
        });

        await waitFor(() => expect(api.getDisplayedRowCount()).toBe(2));
        expect(fullWidthRendererCalls).toBe(0);
        await waitFor(() => expect(document.querySelector('.ag-skeleton-effect')).not.toBeNull());
    });

    test('the first rowData update uses the initial-data path and fires rowCountReady', async () => {
        const api = gridsManager.createGrid('myGrid', {
            loading: { type: 'rows' },
            columnDefs,
            getRowId: ({ data }) => data.id,
        });
        let rowCountReady = 0;
        api.addEventListener('rowCountReady' as any, () => rowCountReady++);

        api.setGridOption('rowData', [{ id: 'michael-phelps', athlete: 'Michael Phelps' }]);

        await waitFor(() => expect(rowCountReady).toBe(1));
        api.setGridOption('loading', false);
        await waitFor(() => expect(api.getDisplayedRowAtIndex(0)?.data?.athlete).toBe('Michael Phelps'));
    });

    test('loading rows use the configured numeric row height', async () => {
        const api = gridsManager.createGrid('myGrid', {
            loading: { type: 'rows', rowCount: 2 },
            columnDefs,
            rowHeight: 60,
        });

        await waitFor(() => expect(api.getDisplayedRowAtIndex(0)?.rowHeight).toBe(60));

        api.setGridOption('rowHeight', 72);
        await waitFor(() => expect(api.getDisplayedRowAtIndex(0)?.rowHeight).toBe(72));
    });

    test('loading rows wait for asynchronous column definitions without showing the no-rows overlay', async () => {
        const api = gridsManager.createGrid('myGrid', {
            loading: { type: 'rows' },
        });

        expect(isAgHtmlElementVisible(document.querySelector('.ag-overlay-no-rows-center'))).toBe(false);

        api.setGridOption('columnDefs', columnDefs);
        await waitFor(() => expect(api.getDisplayedRowCount()).toBe(10));
        expect(document.querySelector('.ag-row-loading')).not.toBeNull();
    });

    test('imperative overlay calls do not stack a loading overlay over loading rows', async () => {
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [99, 308] });
        const consoleWarnSpy = vitest.spyOn(console, 'warn').mockImplementation(() => {});
        try {
            const api = gridsManager.createGrid('myGrid', {
                loading: { type: 'rows', rowCount: 2 },
                columnDefs,
            });
            await waitFor(() => expect(api.getDisplayedRowCount()).toBe(2));

            api.showLoadingOverlay();
            expect(hasLoadingOverlay()).toBe(false);

            api.hideOverlay();
            expect(consoleWarnSpy).toHaveBeenCalledWith(
                'AG Grid: warning #99',
                'Since v32, `api.hideOverlay()` does not hide the loading UI when the `loading` grid option is set. Set `loading=false` instead.',
                expect.any(String)
            );
            expect(hasLoadingOverlay()).toBe(false);
            expect(api.getDisplayedRowCount()).toBe(2);
        } finally {
            consoleWarnSpy.mockRestore();
        }
    });

    test('auto-height cells do not measure loading rows or call getRowHeight with missing data', async () => {
        let getRowHeightCallsWithMissingData = 0;
        const api = gridsManager.createGrid('myGrid', {
            loading: { type: 'rows', rowCount: 2 },
            columnDefs: [{ field: 'athlete', autoHeight: true }],
            getRowHeight: (params) => {
                if (!params.data) {
                    getRowHeightCallsWithMissingData++;
                }
                return 60;
            },
        });

        await waitFor(() => expect(document.querySelector('.ag-skeleton-effect')).not.toBeNull());
        for (let i = 0; i < 6; ++i) {
            await asyncSetTimeout(0);
        }

        expect(getRowHeightCallsWithMissingData).toBe(0);
        expect(api.getDisplayedRowCount()).toBe(2);
    });

    test('row spanning does not merge or evaluate loading rows', async () => {
        const api = gridsManager.createGrid('myGrid', {
            loading: { type: 'rows', rowCount: 3 },
            enableCellSpan: true,
            columnDefs: [{ field: 'athlete', spanRows: true }],
        });

        await waitFor(() =>
            expect(document.querySelectorAll('.ag-cell[col-id="athlete"] .ag-skeleton-effect')).toHaveLength(3)
        );
        expect(api.getDisplayedRowCount()).toBe(3);
    });
});
