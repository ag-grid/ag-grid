import type { MockInstance } from 'vitest';

import type { IServerSideDatasource, IServerSideGetRowsParams } from 'ag-grid-community';
import { ValidationModule } from 'ag-grid-community';
import { ServerSideRowModelApiModule, ServerSideRowModelModule } from 'ag-grid-enterprise';

import { TestGridsManager, asyncSetTimeout, waitForNoLoadingRows } from '../../test-utils';

/**
 * Tests for SSRM loading row count behaviour.
 *
 * The number of stub rows shown while loading defaults to `serverSideInitialRowCount` (default: 1).
 * AG-6003: `isServerSideGroup` may return `{ hasChildren, childCount }` to hint the child store
 *          stub count; boolean return is still supported (falls back to 1).
 * AG-6750: `serverSideLoadingRowCount` configures stub count per store; callback receives
 *          `blockSize` so users can match the request size with `(p) => p.blockSize`.
 */

const columnDefs = [{ field: 'name' }];

/** Datasource that never responds, keeping rows as stubs indefinitely. */
function createHangingDatasource(): IServerSideDatasource {
    return { getRows: () => {} };
}

/**
 * Datasource that responds synchronously on the first call (with rowCount) then hangs.
 * Use this to let initial data load, then verify stub counts after a purge-refresh.
 */
function createOnceRespondingDatasource(rowData: object[]): IServerSideDatasource {
    let callCount = 0;
    return {
        getRows: (params: IServerSideGetRowsParams) => {
            if (++callCount === 1) {
                params.success({ rowData, rowCount: rowData.length });
            }
            // subsequent calls hang, keeping new stubs visible
        },
    };
}

/**
 * Datasource that responds synchronously on the first call WITHOUT rowCount, then hangs.
 * This triggers the probe-row logic: the grid adds probe stubs after the response to check
 * whether more rows exist, then makes a second request that hangs.
 */
function createOnceRespondingNoCountDatasource(rowData: object[]): IServerSideDatasource {
    let callCount = 0;
    return {
        getRows: (params: IServerSideGetRowsParams) => {
            if (++callCount === 1) {
                params.success({ rowData }); // no rowCount — probe logic fires
            }
            // second call hangs — probe stubs remain visible
        },
    };
}

function getStubRowCount(): number {
    return document.querySelectorAll('.ag-row-loading').length;
}

function getFullWidthStubRowCount(): number {
    return document.querySelectorAll('.ag-row-loading.ag-full-width-row').length;
}

describe('SSRM loading row count', () => {
    const gridManager = new TestGridsManager({
        modules: [ServerSideRowModelModule, ServerSideRowModelApiModule, ValidationModule],
    });
    let consoleWarnSpy: MockInstance;

    beforeEach(() => {
        consoleWarnSpy = vitest.spyOn(console, 'warn').mockImplementation(() => {});
        gridManager.reset();
    });

    afterEach(() => {
        gridManager.reset();
        consoleWarnSpy.mockRestore();
    });

    describe('initial stub count', () => {
        test('top-level stub count defaults to 1 (serverSideInitialRowCount default)', () => {
            gridManager.createGrid('myGrid', {
                columnDefs,
                rowModelType: 'serverSide',
                serverSideDatasource: createHangingDatasource(),
            });

            expect(getStubRowCount()).toBe(1);
        });

        test('serverSideInitialRowCount controls the top-level stub count', () => {
            gridManager.createGrid('myGrid', {
                columnDefs,
                rowModelType: 'serverSide',
                serverSideInitialRowCount: 5,
                serverSideDatasource: createHangingDatasource(),
            });

            expect(getStubRowCount()).toBe(5);
        });
    });

    describe('purge-refresh stub count', () => {
        test('shows 1 stub row after purge-refresh by default', async () => {
            const api = gridManager.createGrid('myGrid', {
                columnDefs,
                rowModelType: 'serverSide',
                serverSideDatasource: createOnceRespondingDatasource([{ name: 'Alice' }, { name: 'Bob' }]),
            });

            await waitForNoLoadingRows(api);
            expect(getStubRowCount()).toBe(0);

            api.refreshServerSide({ purge: true });

            await asyncSetTimeout(0);
            expect(getStubRowCount()).toBe(1);
        });
    });

    describe('serverSideLoadingRowCount for SSRM', () => {
        test('number overrides serverSideInitialRowCount for top-level stubs', () => {
            gridManager.createGrid('myGrid', {
                columnDefs,
                rowModelType: 'serverSide',
                serverSideInitialRowCount: 10,
                serverSideLoadingRowCount: 3,
                serverSideDatasource: createHangingDatasource(),
            });

            expect(getStubRowCount()).toBe(3);
        });

        test('callback receives parentNode=null, level=0, and blockSize for top-level SSRM store', () => {
            let capturedParams: any;
            gridManager.createGrid('myGrid', {
                columnDefs,
                rowModelType: 'serverSide',
                cacheBlockSize: 50,
                serverSideLoadingRowCount: (params) => {
                    capturedParams = params;
                    return 6;
                },
                serverSideDatasource: createHangingDatasource(),
            });

            expect(getStubRowCount()).toBe(6);
            expect(capturedParams).toBeDefined();
            expect(capturedParams.parentNode).toBeNull();
            expect(capturedParams.level).toBe(0);
            expect(capturedParams.blockSize).toBe(50);
            expect(capturedParams.api).toBeDefined();
        });

        test('callback receives parentNode and level=1 for child SSRM store', async () => {
            const capturedCalls: { parentNode: any; level: number; blockSize: number }[] = [];
            const api = gridManager.createGrid('myGrid', {
                columnDefs,
                rowModelType: 'serverSide',
                treeData: true,
                isServerSideGroup: (dataItem: any) => dataItem.id === 'parent-1',
                getServerSideGroupKey: (dataItem: any) => dataItem.id,
                serverSideLoadingRowCount: (params) => {
                    capturedCalls.push({
                        parentNode: params.parentNode,
                        level: params.level,
                        blockSize: params.blockSize,
                    });
                    return params.level === 0 ? 2 : 5;
                },
                serverSideDatasource: createOnceRespondingDatasource([{ id: 'parent-1', name: 'Parent' }]),
            });

            await waitForNoLoadingRows(api);

            let parentNode: any;
            api.forEachNode((node) => {
                if (node.data?.id === 'parent-1') {
                    parentNode = node;
                }
            });
            expect(parentNode).toBeDefined();

            parentNode.setExpanded(true);
            await asyncSetTimeout(0);

            expect(getStubRowCount()).toBe(5);
            const childCall = capturedCalls.find((c) => c.level === 1);
            expect(childCall).toBeDefined();
            expect(childCall!.parentNode).toBe(parentNode);
            expect(childCall!.blockSize).toBeGreaterThan(0);
        });

        test('callback is used on purge-refresh', async () => {
            let callCount = 0;
            const api = gridManager.createGrid('myGrid', {
                columnDefs,
                rowModelType: 'serverSide',
                serverSideLoadingRowCount: () => {
                    callCount++;
                    return 4;
                },
                serverSideDatasource: createOnceRespondingDatasource([{ name: 'Alice' }, { name: 'Bob' }]),
            });

            await waitForNoLoadingRows(api);
            expect(getStubRowCount()).toBe(0);

            api.refreshServerSide({ purge: true });
            await asyncSetTimeout(0);

            expect(getStubRowCount()).toBe(4);
            expect(callCount).toBeGreaterThan(1);
        });

        test('(p) => p.blockSize matches the request size', () => {
            gridManager.createGrid('myGrid', {
                columnDefs,
                rowModelType: 'serverSide',
                cacheBlockSize: 20,
                serverSideLoadingRowCount: (p) => p.blockSize,
                serverSideDatasource: createHangingDatasource(),
            });

            expect(getStubRowCount()).toBe(20);
        });

        test('callback controls probe stub count for subsequent requests (unknown rowCount)', async () => {
            // First response has no rowCount → grid infers (dataCount + probeCount) total rows
            // and requests the probe range. The probe count should equal serverSideLoadingRowCount
            // so subsequent requests cover the right range.
            const requests: { startRow: number; endRow: number }[] = [];
            let resolveSecondCall!: () => void;
            const secondCallFired = new Promise<void>((resolve) => {
                resolveSecondCall = resolve;
            });

            gridManager.createGrid('myGrid', {
                columnDefs,
                rowModelType: 'serverSide',
                cacheBlockSize: 10,
                serverSideLoadingRowCount: 4,
                serverSideDatasource: {
                    getRows(params: IServerSideGetRowsParams) {
                        requests.push({
                            startRow: params.request.startRow,
                            endRow: params.request.endRow,
                        });
                        if (requests.length === 1) {
                            // Respond with 3 rows and no rowCount — probe logic fires
                            params.success({ rowData: [{ name: 'A' }, { name: 'B' }, { name: 'C' }] });
                        } else {
                            resolveSecondCall();
                            // hang — stubs remain visible
                        }
                    },
                },
            });

            // Wait for the probe request to actually fire (lazyBlockLoadingService is async)
            await secondCallFired;

            // First request: rows 0-9 (cacheBlockSize=10)
            expect(requests[0]).toEqual({ startRow: 0, endRow: 10 });
            // Probe added 4 rows → store thinks it has 7 rows → second request starts at row 3
            expect(requests[1].startRow).toBe(3);
        });
    });

    describe('isServerSideGroup childCount hint (AG-6003)', () => {
        test('childCount from isServerSideGroup sets child store stub count on expansion', async () => {
            const api = gridManager.createGrid('myGrid', {
                columnDefs,
                rowModelType: 'serverSide',
                treeData: true,
                isServerSideGroup: (dataItem: any) =>
                    dataItem.id === 'parent-1' ? { hasChildren: true, childCount: 4 } : false,
                getServerSideGroupKey: (dataItem: any) => dataItem.id,
                serverSideDatasource: createOnceRespondingDatasource([{ id: 'parent-1', name: 'Parent' }]),
            });

            await waitForNoLoadingRows(api);
            expect(getStubRowCount()).toBe(0);

            let parentNode: any;
            api.forEachNode((node) => {
                if (node.data?.id === 'parent-1') {
                    parentNode = node;
                }
            });
            expect(parentNode).toBeDefined();

            parentNode.setExpanded(true);
            await asyncSetTimeout(0);

            expect(getStubRowCount()).toBe(4);
        });

        test('boolean isServerSideGroup return falls back to 1 stub for child store', async () => {
            const api = gridManager.createGrid('myGrid', {
                columnDefs,
                rowModelType: 'serverSide',
                treeData: true,
                isServerSideGroup: (dataItem: any) => dataItem.id === 'parent-1',
                getServerSideGroupKey: (dataItem: any) => dataItem.id,
                serverSideDatasource: createOnceRespondingDatasource([{ id: 'parent-1', name: 'Parent' }]),
            });

            await waitForNoLoadingRows(api);
            expect(getStubRowCount()).toBe(0);

            let parentNode: any;
            api.forEachNode((node) => {
                if (node.data?.id === 'parent-1') {
                    parentNode = node;
                }
            });
            expect(parentNode).toBeDefined();

            parentNode.setExpanded(true);
            await asyncSetTimeout(0);

            // no childCount hint → falls back to 1
            expect(getStubRowCount()).toBe(1);
        });
    });

    describe('SSRM loading row rendering', () => {
        test('SSRM stubs are full-width rows by default', () => {
            gridManager.createGrid('myGrid', {
                columnDefs,
                rowModelType: 'serverSide',
                serverSideDatasource: createHangingDatasource(),
            });

            expect(getStubRowCount()).toBe(1);
            expect(getFullWidthStubRowCount()).toBe(1);
        });

        test('suppressServerSideFullWidthLoadingRow suppresses full-width stubs', () => {
            gridManager.createGrid('myGrid', {
                columnDefs,
                rowModelType: 'serverSide',
                suppressServerSideFullWidthLoadingRow: true,
                serverSideDatasource: createHangingDatasource(),
            });

            expect(getStubRowCount()).toBe(1);
            expect(getFullWidthStubRowCount()).toBe(0);
        });

        test('serverSideLoadingRowCount takes precedence over serverSideInitialRowCount', () => {
            gridManager.createGrid('myGrid', {
                columnDefs,
                rowModelType: 'serverSide',
                serverSideInitialRowCount: 10,
                serverSideLoadingRowCount: 3,
                serverSideDatasource: createHangingDatasource(),
            });

            expect(getStubRowCount()).toBe(3);
        });

        test('serverSideInitialRowCount still controls stub count without serverSideLoadingRowCount', () => {
            gridManager.createGrid('myGrid', {
                columnDefs,
                rowModelType: 'serverSide',
                serverSideInitialRowCount: 7,
                serverSideDatasource: createHangingDatasource(),
            });

            expect(getStubRowCount()).toBe(7);
            expect(getFullWidthStubRowCount()).toBe(7);
        });
    });
});
