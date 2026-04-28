import type { MockInstance } from 'vitest';

import type { IServerSideDatasource, IServerSideGetRowsParams } from 'ag-grid-community';
import { ValidationModule } from 'ag-grid-community';
import { ServerSideRowModelApiModule, ServerSideRowModelModule } from 'ag-grid-enterprise';

import { TestGridsManager, asyncSetTimeout, waitForNoLoadingRows } from '../../test-utils';

/**
 * Tests for SSRM loading row count behaviour.
 *
 * The number of stub rows shown while loading defaults to `cacheBlockSize` (capped at 100).
 * AG-6003: `isServerSideGroup` may return `{ hasChildren, childCount }` to hint the child store
 *          stub count; boolean return is still supported (falls back to cacheBlockSize).
 */

const columnDefs = [{ field: 'name' }];

/** Datasource that never responds, keeping rows as stubs indefinitely. */
function createHangingDatasource(): IServerSideDatasource {
    return { getRows: () => {} };
}

/**
 * Datasource that responds synchronously on the first call then hangs on all subsequent calls.
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

function getStubRowCount(): number {
    return document.querySelectorAll('.ag-row-loading').length;
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
});
