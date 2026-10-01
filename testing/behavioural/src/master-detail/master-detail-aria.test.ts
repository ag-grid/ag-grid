import { waitFor } from '@testing-library/dom';
import { TestGridsManager, asyncSetTimeout, waitForNoLoadingRows } from 'ag-test-utils';

import type { GetDetailRowDataParams, GridApi, GridOptions, IServerSideGetRowsParams } from 'ag-grid-community';
import { PaginationModule, QuickFilterModule, getGridElement } from 'ag-grid-community';
import {
    MasterDetailModule,
    RowGroupingModule,
    ServerSideRowModelApiModule,
    ServerSideRowModelModule,
    TreeDataModule,
} from 'ag-grid-enterprise';

interface RowData {
    id: string;
    children?: RowData[];
}

const baseOptions: GridOptions<RowData> = {
    columnDefs: [{ field: 'id', cellRenderer: 'agGroupCellRenderer' }],
    getRowId: ({ data }) => data.id,
    masterDetail: true,
    isRowMaster: (data) => !!data.children?.length,
    detailCellRendererParams: {
        detailGridOptions: {
            columnDefs: [{ field: 'id' }],
        },
        getDetailRowData: (params: GetDetailRowDataParams<RowData, RowData>) => {
            params.successCallback(params.data.children ?? []);
        },
    },
};

function getGridContainer(api: GridApi): HTMLElement {
    const container = getGridElement(api)!.querySelector<HTMLElement>('[role="grid"], [role="treegrid"]');
    expect(container).not.toBeNull();
    return container!;
}

function getRowElement(api: GridApi, id: string): HTMLElement {
    const row = getGridContainer(api).querySelector<HTMLElement>(`[role="row"][row-id="${id}"]`);
    expect(row).not.toBeNull();
    return row!;
}

describe('master/detail grid ARIA roles', () => {
    const gridsManager = new TestGridsManager({
        modules: [
            MasterDetailModule,
            RowGroupingModule,
            TreeDataModule,
            PaginationModule,
            QuickFilterModule,
            ServerSideRowModelModule,
            ServerSideRowModelApiModule,
        ],
    });

    afterEach(() => {
        vi.restoreAllMocks();
        gridsManager.reset();
    });

    test('uses treegrid for static master rows without isRowMaster', () => {
        const api = gridsManager.createGrid(null, {
            ...baseOptions,
            isRowMaster: undefined,
            rowData: [{ id: 'nora' }],
        });

        expect(getGridContainer(api).getAttribute('role')).toBe('treegrid');
        expect(getRowElement(api, 'nora').getAttribute('aria-expanded')).toBe('false');
    });

    test('keeps treegrid when a master row is collapsed, expanded and collapsed again', async () => {
        const isRowMaster = vi.fn((data: RowData) => !!data.children?.length);
        const api = gridsManager.createGrid(null, {
            ...baseOptions,
            isRowMaster,
            rowData: [{ id: 'nora', children: [{ id: 'call' }] }, { id: 'mila' }],
        });
        const container = getGridContainer(api);

        expect(container.getAttribute('role')).toBe('treegrid');
        expect(getRowElement(api, 'nora').getAttribute('aria-expanded')).toBe('false');
        expect(getRowElement(api, 'mila').hasAttribute('aria-expanded')).toBe(false);

        api.getRowNode('nora')!.setExpanded(true, undefined, true);
        await waitFor(() => expect(api.getDetailGridInfo('detail_nora')?.api).toBeDefined());

        expect(container.getAttribute('role')).toBe('treegrid');
        expect(getRowElement(api, 'nora').getAttribute('aria-expanded')).toBe('true');
        expect(getGridContainer(api.getDetailGridInfo('detail_nora')!.api!).getAttribute('role')).toBe('grid');

        api.getRowNode('nora')!.setExpanded(false, undefined, true);

        expect(container.getAttribute('role')).toBe('treegrid');
        expect(getRowElement(api, 'nora').getAttribute('aria-expanded')).toBe('false');
        expect(isRowMaster).toHaveBeenCalledTimes(2);
    });

    test('uses grid when isRowMaster rejects every row', () => {
        const api = gridsManager.createGrid(null, {
            ...baseOptions,
            isRowMaster: () => false,
            rowData: [{ id: 'nora', children: [{ id: 'call' }] }],
        });

        expect(getGridContainer(api).getAttribute('role')).toBe('grid');
        expect(getRowElement(api, 'nora').hasAttribute('aria-expanded')).toBe(false);
    });

    test('updates the role when adding the first master and removing the last master', () => {
        const api = gridsManager.createGrid<RowData>(null, { ...baseOptions, rowData: [] });
        const container = getGridContainer(api);
        const nora = { id: 'nora', children: [{ id: 'call-1' }] };
        const mila = { id: 'mila', children: [{ id: 'call-2' }] };

        expect(container.getAttribute('role')).toBe('grid');

        api.applyTransaction({ add: [nora, mila] });
        expect(container.getAttribute('role')).toBe('treegrid');

        api.applyTransaction({ remove: [nora] });
        expect(container.getAttribute('role')).toBe('treegrid');

        api.applyTransaction({ remove: [mila] });
        expect(container.getAttribute('role')).toBe('grid');
    });

    test('updates the role and row aria-expanded when master eligibility changes', () => {
        const api = gridsManager.createGrid<RowData>(null, {
            ...baseOptions,
            rowData: [{ id: 'nora' }, { id: 'mila' }],
        });
        const container = getGridContainer(api);

        expect(container.getAttribute('role')).toBe('grid');
        expect(getRowElement(api, 'nora').hasAttribute('aria-expanded')).toBe(false);

        api.applyTransaction({
            update: [
                { id: 'nora', children: [{ id: 'call-1' }] },
                { id: 'mila', children: [{ id: 'call-2' }] },
            ],
        });
        expect(container.getAttribute('role')).toBe('treegrid');
        expect(getRowElement(api, 'nora').getAttribute('aria-expanded')).toBe('false');
        expect(getRowElement(api, 'mila').getAttribute('aria-expanded')).toBe('false');

        api.applyTransaction({ update: [{ id: 'nora' }] });
        expect(container.getAttribute('role')).toBe('treegrid');
        expect(getRowElement(api, 'nora').hasAttribute('aria-expanded')).toBe(false);

        api.applyTransaction({ update: [{ id: 'mila' }] });
        expect(container.getAttribute('role')).toBe('grid');
        expect(getRowElement(api, 'mila').hasAttribute('aria-expanded')).toBe(false);
    });

    test('recalculates the role when rowData is replaced or cleared', () => {
        const api = gridsManager.createGrid<RowData>(null, { ...baseOptions, rowData: [] });
        const container = getGridContainer(api);

        api.setGridOption('rowData', [{ id: 'nora', children: [{ id: 'call' }] }]);
        expect(container.getAttribute('role')).toBe('treegrid');

        api.setGridOption('rowData', [{ id: 'nora' }]);
        expect(container.getAttribute('role')).toBe('grid');
        expect(getRowElement(api, 'nora').hasAttribute('aria-expanded')).toBe(false);

        api.setGridOption('rowData', [{ id: 'nora', children: [{ id: 'call' }] }]);
        expect(container.getAttribute('role')).toBe('treegrid');

        api.setGridOption('rowData', []);
        expect(container.getAttribute('role')).toBe('grid');
    });

    test('updates the role and row attributes when masterDetail is toggled', () => {
        const api = gridsManager.createGrid(null, {
            ...baseOptions,
            masterDetail: false,
            rowData: [{ id: 'nora', children: [{ id: 'call' }] }],
        });
        const container = getGridContainer(api);

        expect(container.getAttribute('role')).toBe('grid');
        expect(getRowElement(api, 'nora').hasAttribute('aria-expanded')).toBe(false);

        api.setGridOption('masterDetail', true);
        expect(container.getAttribute('role')).toBe('treegrid');
        expect(getRowElement(api, 'nora').getAttribute('aria-expanded')).toBe('false');

        api.setGridOption('masterDetail', false);
        expect(container.getAttribute('role')).toBe('grid');
        expect(getRowElement(api, 'nora').hasAttribute('aria-expanded')).toBe(false);
    });

    test('keeps treegrid when masters are on another page or filtered out', () => {
        const api = gridsManager.createGrid<RowData>(null, {
            ...baseOptions,
            pagination: true,
            paginationPageSize: 1,
            paginationPageSizeSelector: false,
            rowData: [{ id: 'plain' }, { id: 'master', children: [{ id: 'call' }] }],
        });
        const container = getGridContainer(api);

        expect(getRowElement(api, 'plain').hasAttribute('aria-expanded')).toBe(false);
        expect(container.querySelector('[role="row"][row-id="master"]')).toBeNull();
        expect(container.getAttribute('role')).toBe('treegrid');

        api.paginationGoToNextPage();
        expect(getRowElement(api, 'master').getAttribute('aria-expanded')).toBe('false');
        expect(container.getAttribute('role')).toBe('treegrid');

        api.setGridOption('quickFilterText', 'plain');
        expect(api.getDisplayedRowCount()).toBe(1);
        expect(container.getAttribute('role')).toBe('treegrid');

        api.applyTransaction({ remove: [{ id: 'master' }] });
        expect(container.getAttribute('role')).toBe('grid');
    });

    test('assigns roles independently to three nested grids and updates the middle grid', async () => {
        const middleOptions: GridOptions<RowData> = {
            ...baseOptions,
            masterDefaultExpanded: 1,
        };
        const api = gridsManager.createGrid(null, {
            ...baseOptions,
            masterDefaultExpanded: 1,
            rowData: [{ id: 'top', children: [{ id: 'middle', children: [{ id: 'leaf' }] }] }],
            detailCellRendererParams: {
                ...baseOptions.detailCellRendererParams,
                detailGridOptions: middleOptions,
            },
        });

        await waitFor(() => expect(api.getDetailGridInfo('detail_top')?.api).toBeDefined());
        const middleApi = api.getDetailGridInfo('detail_top')!.api!;
        await waitFor(() => expect(middleApi.getDetailGridInfo('detail_middle')?.api).toBeDefined());
        const leafApi = middleApi.getDetailGridInfo('detail_middle')!.api!;

        expect(getGridContainer(api).getAttribute('role')).toBe('treegrid');
        expect(getGridContainer(middleApi).getAttribute('role')).toBe('treegrid');
        expect(getGridContainer(leafApi).getAttribute('role')).toBe('grid');
        expect(getRowElement(api, 'top').getAttribute('aria-expanded')).toBe('true');
        expect(getRowElement(middleApi, 'middle').getAttribute('aria-expanded')).toBe('true');

        middleApi.applyTransaction({ update: [{ id: 'middle' }] });

        expect(getGridContainer(api).getAttribute('role')).toBe('treegrid');
        expect(getGridContainer(middleApi).getAttribute('role')).toBe('grid');
        expect(getRowElement(middleApi, 'middle').hasAttribute('aria-expanded')).toBe(false);
    });

    test('preserves treegrid for grouping when no rows are masters', () => {
        const api = gridsManager.createGrid(null, {
            ...baseOptions,
            columnDefs: [{ field: 'id', rowGroup: true }],
            rowData: [{ id: 'nora' }],
        });

        expect(getGridContainer(api).getAttribute('role')).toBe('treegrid');
        api.setGridOption('masterDetail', false);
        expect(getGridContainer(api).getAttribute('role')).toBe('treegrid');
    });

    test('preserves treegrid for tree data when no rows are masters', () => {
        const api = gridsManager.createGrid(null, {
            ...baseOptions,
            treeData: true,
            getDataPath: (data: RowData) => data.id.split('/'),
            rowData: [{ id: 'parent' }, { id: 'parent/child' }],
        });

        expect(getGridContainer(api).getAttribute('role')).toBe('treegrid');
        api.setGridOption('masterDetail', false);
        expect(getGridContainer(api).getAttribute('role')).toBe('treegrid');
    });

    test.each([false, true])('uses the loaded SSRM master state (master=%s)', async (master) => {
        let request: IServerSideGetRowsParams<RowData> | undefined;
        const api = gridsManager.createGrid(null, {
            ...baseOptions,
            rowModelType: 'serverSide',
            serverSideDatasource: {
                getRows: (params) => {
                    request = params;
                },
            },
        });
        const container = getGridContainer(api);

        expect(container.getAttribute('role')).toBe('grid');
        await waitFor(() => expect(request).toBeDefined());

        request!.success({ rowData: [{ id: 'nora', children: master ? [{ id: 'call' }] : [] }], rowCount: 1 });
        await waitForNoLoadingRows(api);

        expect(container.getAttribute('role')).toBe(master ? 'treegrid' : 'grid');
        expect(getRowElement(api, 'nora').getAttribute('aria-expanded')).toBe(master ? 'false' : null);
    });

    test.each(['setData', 'updateData'] as const)('updates SSRM roles after rowNode.%s', async (method) => {
        const api = gridsManager.createGrid<RowData>(null, {
            ...baseOptions,
            rowModelType: 'serverSide',
            serverSideDatasource: {
                getRows: (params) => params.success({ rowData: [{ id: 'nora' }], rowCount: 1 }),
            },
        });
        await waitForNoLoadingRows(api);
        const container = getGridContainer(api);
        const row = api.getRowNode('nora')!;

        expect(container.getAttribute('role')).toBe('grid');
        expect(getRowElement(api, 'nora').hasAttribute('aria-expanded')).toBe(false);

        row[method]({ id: 'nora', children: [{ id: 'call' }] });
        await waitFor(() => expect(container.getAttribute('role')).toBe('treegrid'));
        expect(getRowElement(api, 'nora').getAttribute('aria-expanded')).toBe('false');

        row[method]({ id: 'nora' });
        await waitFor(() => expect(container.getAttribute('role')).toBe('grid'));
        expect(getRowElement(api, 'nora').hasAttribute('aria-expanded')).toBe(false);
    });

    test.each([false, true])(
        'does not inspect other rows for unchanged SSRM master eligibility (%s)',
        async (master) => {
            const updatedData: RowData = { id: 'updated', children: master ? [{ id: 'call' }] : [] };
            const api = gridsManager.createGrid<RowData>(null, {
                ...baseOptions,
                suppressAnimationFrame: true,
                rowModelType: 'serverSide',
                serverSideDatasource: {
                    getRows: (params) =>
                        params.success({
                            rowData: [{ id: 'other-master', children: [{ id: 'other-call' }] }, updatedData],
                            rowCount: 2,
                        }),
                },
            });
            await waitForNoLoadingRows(api);

            const isExpandable = vi.spyOn(api.getRowNode('other-master')!, 'isExpandable');
            const updatedRow = api.getRowNode('updated')!;

            for (let i = 0; i < 3; ++i) {
                updatedRow.updateData({ ...updatedData });
                // Flush each update separately so a debounce cannot hide repeated role scans.
                await asyncSetTimeout(0);
            }

            expect(isExpandable).not.toHaveBeenCalled();
            expect(getGridContainer(api).getAttribute('role')).toBe('treegrid');
        }
    );

    test('recalculates SSRM roles when transactions add, update and remove masters', async () => {
        const api = gridsManager.createGrid<RowData>(null, {
            ...baseOptions,
            rowModelType: 'serverSide',
            serverSideDatasource: {
                getRows: (params) => params.success({ rowData: [], rowCount: 0 }),
            },
        });
        await waitForNoLoadingRows(api);
        const container = getGridContainer(api);
        const nora = { id: 'nora', children: [{ id: 'call-1' }] };
        const mila = { id: 'mila', children: [{ id: 'call-2' }] };

        expect(container.getAttribute('role')).toBe('grid');

        api.applyServerSideTransaction({ add: [nora, mila] });
        expect(container.getAttribute('role')).toBe('treegrid');

        api.applyServerSideTransaction({ update: [{ id: 'nora' }] });
        expect(container.getAttribute('role')).toBe('treegrid');
        expect(getRowElement(api, 'nora').hasAttribute('aria-expanded')).toBe(false);

        api.applyServerSideTransaction({ remove: [mila] });
        expect(container.getAttribute('role')).toBe('grid');
    });

    test('handles SSRM masterDetail toggles and subsequent individual row updates', async () => {
        const api = gridsManager.createGrid<RowData>(null, {
            ...baseOptions,
            masterDetail: false,
            rowModelType: 'serverSide',
            serverSideDatasource: {
                getRows: (params) =>
                    params.success({ rowData: [{ id: 'nora', children: [{ id: 'call' }] }], rowCount: 1 }),
            },
        });
        await waitForNoLoadingRows(api);
        const container = getGridContainer(api);

        expect(container.getAttribute('role')).toBe('grid');
        expect(getRowElement(api, 'nora').hasAttribute('aria-expanded')).toBe(false);

        api.setGridOption('masterDetail', true);
        await waitForNoLoadingRows(api);
        expect(container.getAttribute('role')).toBe('treegrid');

        api.getRowNode('nora')!.updateData({ id: 'nora' });
        await waitFor(() => expect(container.getAttribute('role')).toBe('grid'));
        expect(getRowElement(api, 'nora').hasAttribute('aria-expanded')).toBe(false);

        api.getRowNode('nora')!.updateData({ id: 'nora', children: [{ id: 'call' }] });
        await waitFor(() => expect(container.getAttribute('role')).toBe('treegrid'));

        api.setGridOption('masterDetail', false);
        await waitForNoLoadingRows(api);
        expect(container.getAttribute('role')).toBe('grid');
        expect(getRowElement(api, 'nora').hasAttribute('aria-expanded')).toBe(false);
    });

    test('recalculates SSRM roles when the data is reloaded', async () => {
        let rowData: RowData[] = [{ id: 'nora', children: [{ id: 'call' }] }];
        const api = gridsManager.createGrid(null, {
            ...baseOptions,
            rowModelType: 'serverSide',
            serverSideDatasource: {
                getRows: (params) => params.success({ rowData, rowCount: rowData.length }),
            },
        });
        await waitForNoLoadingRows(api);
        const container = getGridContainer(api);

        expect(container.getAttribute('role')).toBe('treegrid');

        rowData = [{ id: 'nora' }];
        api.refreshServerSide({ purge: true });
        await waitForNoLoadingRows(api);

        expect(container.getAttribute('role')).toBe('grid');
        expect(getRowElement(api, 'nora').hasAttribute('aria-expanded')).toBe(false);
    });
});
