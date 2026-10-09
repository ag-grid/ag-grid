import { waitFor } from '@testing-library/dom';
import { TestGridsManager } from 'ag-test-utils';

import type { GridApi, GridOptions, IServerSideDatasource, IServerSideGetRowsParams } from 'ag-grid-community';
import { ScrollApiModule, getGridElement } from 'ag-grid-community';
import { ServerSideRowModelModule } from 'ag-grid-enterprise';

describe('Server-side Row Model - synchronous load', () => {
    const gridsManager = new TestGridsManager({ modules: [ServerSideRowModelModule, ScrollApiModule] });

    const allRows = Array.from({ length: 30 }, (_, i) => ({ id: String(i), value: `row-${i}` }));

    afterEach(() => {
        gridsManager.reset();
    });

    function respond(params: IServerSideGetRowsParams) {
        const { startRow = 0, endRow = allRows.length, sortModel } = params.request;
        const rows = sortModel.length > 0 ? [...allRows].reverse() : allRows;
        params.success({ rowData: rows.slice(startRow, endRow), rowCount: rows.length });
    }

    function createGrid(gridId: string, datasource: IServerSideDatasource, gridOptions: GridOptions = {}) {
        const api = gridsManager.createGrid(gridId, {
            columnDefs: [{ field: 'value' }],
            rowModelType: 'serverSide',
            cacheBlockSize: 10,
            getRowId: (params) => params.data.id,
            serverSideDatasource: datasource,
            ...gridOptions,
        });

        let loadingRowsSeen = 0;
        const observer = new MutationObserver((mutations) => {
            for (const { addedNodes } of mutations) {
                addedNodes.forEach((added) => {
                    if (
                        added instanceof HTMLElement &&
                        (added.matches('.ag-loading') || added.querySelector('.ag-loading'))
                    ) {
                        ++loadingRowsSeen;
                    }
                });
            }
        });
        observer.observe(getGridElement(api)!, { childList: true, subtree: true });

        return { api, loadingRowsSeen: () => loadingRowsSeen, stop: () => observer.disconnect() };
    }

    async function waitForRows(api: GridApi, expectedFirstValue: string) {
        await waitFor(() => {
            expect(api.getDisplayedRowCount()).toBe(allRows.length);
            expect(api.getDisplayedRowAtIndex(0)?.data?.value).toBe(expectedFirstValue);
        });
    }

    test('renders data without ever showing a loading row when enabled and getRows is synchronous', async () => {
        const { api, loadingRowsSeen, stop } = createGrid(
            'sync-on',
            { getRows: respond },
            {
                serverSideSynchronousLoad: true,
            }
        );

        await waitForRows(api, 'row-0');
        stop();

        expect(loadingRowsSeen()).toBe(0);
    });

    test('shows a loading row first when disabled, even though getRows is synchronous', async () => {
        const { api, loadingRowsSeen, stop } = createGrid('sync-off', { getRows: respond });

        await waitForRows(api, 'row-0');
        stop();

        expect(loadingRowsSeen()).toBeGreaterThan(0);
    });

    test('does not show a loading row when a sort refreshes the data synchronously', async () => {
        const { api, loadingRowsSeen, stop } = createGrid(
            'sync-sort',
            { getRows: respond },
            {
                serverSideSynchronousLoad: true,
            }
        );
        await waitForRows(api, 'row-0');

        api.applyColumnState({ state: [{ colId: 'value', sort: 'asc' }] });

        await waitForRows(api, 'row-29');
        stop();

        expect(loadingRowsSeen()).toBe(0);
    });

    test('still shows a loading row and then the data when getRows responds asynchronously', async () => {
        const { api, loadingRowsSeen, stop } = createGrid(
            'async-on',
            { getRows: (params) => setTimeout(() => respond(params), 20) },
            { serverSideSynchronousLoad: true }
        );

        await waitForRows(api, 'row-0');
        stop();

        expect(loadingRowsSeen()).toBeGreaterThan(0);
    });

    test('loads further blocks synchronously on scroll', async () => {
        const requests: number[] = [];
        const { api, loadingRowsSeen, stop } = createGrid(
            'sync-scroll',
            {
                getRows: (params) => {
                    requests.push(params.request.startRow ?? 0);
                    respond(params);
                },
            },
            { serverSideSynchronousLoad: true }
        );
        await waitForRows(api, 'row-0');

        api.ensureIndexVisible(25);

        await waitFor(() => expect(api.getDisplayedRowAtIndex(25)?.data?.value).toBe('row-25'));
        stop();

        expect(requests).toContain(20);
        expect(loadingRowsSeen()).toBe(0);
    });
});
