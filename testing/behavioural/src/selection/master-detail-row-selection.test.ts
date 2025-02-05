import type { MockInstance } from 'vitest';

import type { GetDetailRowDataParams, GridApi, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule } from 'ag-grid-community';
import { MasterDetailModule } from 'ag-grid-enterprise';

import { TestGridsManager } from '../test-utils';
import { GridActions, assertSelectedRowsByIndex, waitForEvent } from './utils';

describe('Row Selection Grid Options', () => {
    const columnDefs = [{ field: 'sport', cellRenderer: 'agGroupCellRenderer' }];
    const rowData = [
        {
            sport: 'football',
            detail: [
                { games: 1, detail: [{ won: 1 }] },
                { games: 2, detail: [{ won: 2 }] },
                { games: 3, detail: [{ won: 3 }] },
            ],
        },
        {
            sport: 'rugby',
            detail: [
                { games: 4, detail: [{ won: 4 }] },
                { games: 5, detail: [{ won: 5 }] },
                { games: 6, detail: [{ won: 6 }] },
            ],
        },
        {
            sport: 'tennis',
            detail: [
                { games: 7, detail: [{ won: 7 }] },
                { games: 8, detail: [{ won: 8 }] },
                { games: 9, detail: [{ won: 9 }] },
            ],
        },
        {
            sport: 'cricket',
            detail: [
                { games: 10, detail: [{ won: 10 }] },
                { games: 11, detail: [{ won: 11 }] },
                { games: 12, detail: [{ won: 12 }] },
            ],
        },
        {
            sport: 'golf',
            detail: [
                { games: 13, detail: [{ won: 13 }] },
                { games: 14, detail: [{ won: 14 }] },
                { games: 15, detail: [{ won: 15 }] },
            ],
        },
        {
            sport: 'swimming',
            detail: [
                { games: 16, detail: [{ won: 16 }] },
                { games: 17, detail: [{ won: 17 }] },
                { games: 18, detail: [{ won: 18 }] },
            ],
        },
        {
            sport: 'rowing',
            detail: [
                { games: 19, detail: [{ won: 19 }] },
                { games: 20, detail: [{ won: 20 }] },
                { games: 21, detail: [{ won: 21 }] },
            ],
        },
    ];

    const detailColumnDefs = [{ field: 'games' }];

    let consoleErrorSpy: MockInstance;
    let consoleWarnSpy: MockInstance;

    function createGrid(gridOptions: GridOptions): [GridApi, GridActions] {
        const api = gridMgr.createGrid('myGrid', gridOptions);
        const actions = new GridActions(api, '#myGrid');
        return [api, actions];
    }

    async function createGridAndWait(gridOptions: GridOptions): Promise<[GridApi, GridActions]> {
        const [api, actions] = createGrid(gridOptions);

        await waitForEvent('firstDataRendered', api);

        return [api, actions];
    }

    const gridMgr = new TestGridsManager({
        modules: [ClientSideRowModelModule, MasterDetailModule],
    });

    beforeEach(() => {
        gridMgr.reset();

        consoleErrorSpy = vitest.spyOn(console, 'error').mockImplementation(() => {});
        consoleWarnSpy = vitest.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
        gridMgr.reset();

        consoleErrorSpy.mockRestore();
        consoleWarnSpy.mockRestore();
    });

    test('selecting master row will select all rows in expanded detail grid', async () => {
        const [api, actions] = await createGridAndWait({
            columnDefs,
            rowData,
            rowSelection: { mode: 'singleRow', masterSelects: 'detail' },
            masterDetail: true,
            detailCellRendererParams: {
                detailGridOptions: {
                    columnDefs: detailColumnDefs,
                    rowSelection: { mode: 'multiRow' },
                },
                getDetailRowData(params: GetDetailRowDataParams) {
                    params.successCallback(params.data.detail);
                },
            },
        });

        await actions.expandGroupRowByIndex(1, { count: 1 });
        actions.toggleCheckboxByIndex(1);

        const info = api.getDetailGridInfo('detail_1')!;
        expect(info).not.toBeUndefined();

        await waitForEvent('firstDataRendered', info.api!);

        assertSelectedRowsByIndex([0, 1, 2], info.api!);
    });

    test('selecting master row will select all rows in un-expanded detail grid', async () => {
        const [api, actions] = await createGridAndWait({
            columnDefs,
            rowData,
            rowSelection: { mode: 'singleRow', masterSelects: 'detail' },
            masterDetail: true,
            detailCellRendererParams: {
                detailGridOptions: {
                    columnDefs: detailColumnDefs,
                    rowSelection: { mode: 'multiRow' },
                },
                getDetailRowData(params: GetDetailRowDataParams) {
                    params.successCallback(params.data.detail);
                },
            },
        });

        actions.toggleCheckboxByIndex(1);

        await actions.expandGroupRowByIndex(1, { count: 1 });

        const info = api.getDetailGridInfo('detail_1')!;
        expect(info).not.toBeUndefined();

        await waitForEvent('firstDataRendered', info.api!);

        assertSelectedRowsByIndex([0, 1, 2], info.api!);
    });

    test('selecting row in detail grid applies indeterminate state to master row', async () => {
        const [api, actions] = await createGridAndWait({
            columnDefs,
            rowData,
            rowSelection: { mode: 'singleRow', masterSelects: 'detail' },
            masterDetail: true,
            detailCellRendererParams: {
                detailGridOptions: {
                    columnDefs: detailColumnDefs,
                    rowSelection: { mode: 'multiRow' },
                },
                getDetailRowData(params: GetDetailRowDataParams) {
                    params.successCallback(params.data.detail);
                },
            },
        });

        await actions.expandGroupRowByIndex(1, { count: 1 });

        const info = api.getDetailGridInfo('detail_1')!;
        expect(info).not.toBeUndefined();

        await waitForEvent('firstDataRendered', info.api!);

        const detailActions = new GridActions(info.api!, '[row-id="detail_1"]');

        const wait = waitForEvent('rowSelected', info.api!);
        detailActions.toggleCheckboxByIndex(2);
        await wait;

        // Detail row selected
        assertSelectedRowsByIndex([2], info.api!);

        // Master row indeterminate
        const node = api.getRowNode('1')!;
        expect(node).not.toBeUndefined();
        expect(node.isSelected()).toBeUndefined();

        // Deselecting detail row again should deselect the master row
        const wait2 = waitForEvent('rowSelected', info.api!);
        detailActions.toggleCheckboxByIndex(2);
        await wait2;

        assertSelectedRowsByIndex([], info.api!);
        expect(node.isSelected()).toBe(false);
    });
});
