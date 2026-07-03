import type { MockInstance } from 'vitest';

import type { DetailGridInfo, GetDetailRowDataParams, GridApi, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, RowSelectionModule } from 'ag-grid-community';
import { MasterDetailModule } from 'ag-grid-enterprise';

import { GridColumns, GridRows, TestGridsManager, assertSelectedRowsByIndex, waitForEvent } from '../test-utils';
import { GridActions } from './utils';

/**
 * Latch hooked into `detailGridOptions.onFirstDataRendered`. Call `next()` before
 * triggering the detail grid (collapse + expand) and await the returned promise —
 * the latch is set up at grid-creation time so the one-shot event can never fire
 * before the resolver is registered.
 */
function createDetailRenderedLatch(): {
    onFirstDataRendered: () => void;
    next: () => Promise<void>;
} {
    const pending: Array<() => void> = [];
    return {
        onFirstDataRendered: () => pending.shift()?.(),
        next: () => new Promise<void>((resolve) => pending.push(resolve)),
    };
}

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
        modules: [RowSelectionModule, ClientSideRowModelModule, MasterDetailModule],
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
        await new GridColumns(api, `selecting master row will select all rows in expanded detail grid setup`)
            .checkColumns(`
                CENTER
                ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                └── sport "Sport" width:200
            `);
        await new GridRows(api, `selecting master row will select all rows in expanded detail grid setup`).check(`
            ROOT id:ROOT_NODE_ID
            ├── master collapsed id:0 sport:"football"
            ├── master collapsed id:1 sport:"rugby"
            ├── master collapsed id:2 sport:"tennis"
            ├── master collapsed id:3 sport:"cricket"
            ├── master collapsed id:4 sport:"golf"
            ├── master collapsed id:5 sport:"swimming"
            └── master collapsed id:6 sport:"rowing"
        `);

        await actions.expandGroupRowByIndex(1, { count: 1 });
        actions.toggleCheckboxByIndex(1);

        const info = api.getDetailGridInfo('detail_1')!;
        expect(info).not.toBeUndefined();

        await waitForEvent('firstDataRendered', info.api!);

        assertSelectedRowsByIndex([0, 1, 2], info.api!);
        await new GridRows(api, `selecting master row will select all rows in expanded detail grid final state`).check(
            `
                ROOT id:ROOT_NODE_ID
                ├── master collapsed id:0 sport:"football"
                ├─┬ master selected id:1 sport:"rugby"
                │ └─┬ detail id:detail_1 sport:"rugby"
                │ · └─┬ ROOT id:ROOT_NODE_ID
                │ · · ├── LEAF selected id:0 games:4
                │ · · ├── LEAF selected id:1 games:5
                │ · · └── LEAF selected id:2 games:6
                ├── master collapsed id:2 sport:"tennis"
                ├── master collapsed id:3 sport:"cricket"
                ├── master collapsed id:4 sport:"golf"
                ├── master collapsed id:5 sport:"swimming"
                └── master collapsed id:6 sport:"rowing"
            `
        );
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
        await new GridColumns(api, `selecting master row will select all rows in un-expanded detail grid setup`)
            .checkColumns(`
                CENTER
                ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                └── sport "Sport" width:200
            `);
        await new GridRows(api, `selecting master row will select all rows in un-expanded detail grid setup`).check(`
            ROOT id:ROOT_NODE_ID
            ├── master collapsed id:0 sport:"football"
            ├── master collapsed id:1 sport:"rugby"
            ├── master collapsed id:2 sport:"tennis"
            ├── master collapsed id:3 sport:"cricket"
            ├── master collapsed id:4 sport:"golf"
            ├── master collapsed id:5 sport:"swimming"
            └── master collapsed id:6 sport:"rowing"
        `);

        actions.toggleCheckboxByIndex(1);

        await actions.expandGroupRowByIndex(1, { count: 1 });

        const info = api.getDetailGridInfo('detail_1')!;
        expect(info).not.toBeUndefined();

        await waitForEvent('firstDataRendered', info.api!);

        assertSelectedRowsByIndex([0, 1, 2], info.api!);
        await new GridRows(api, `selecting master row will select all rows in un-expanded detail grid final state`)
            .check(`
                ROOT id:ROOT_NODE_ID
                ├── master collapsed id:0 sport:"football"
                ├─┬ master selected id:1 sport:"rugby"
                │ └─┬ detail id:detail_1 sport:"rugby"
                │ · └─┬ ROOT id:ROOT_NODE_ID
                │ · · ├── LEAF selected id:0 games:4
                │ · · ├── LEAF selected id:1 games:5
                │ · · └── LEAF selected id:2 games:6
                ├── master collapsed id:2 sport:"tennis"
                ├── master collapsed id:3 sport:"cricket"
                ├── master collapsed id:4 sport:"golf"
                ├── master collapsed id:5 sport:"swimming"
                └── master collapsed id:6 sport:"rowing"
            `);
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
        await new GridColumns(api, `selecting row in detail grid applies indeterminate state to master row setup`)
            .checkColumns(`
                CENTER
                ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                └── sport "Sport" width:200
            `);
        await new GridRows(api, `selecting row in detail grid applies indeterminate state to master row setup`).check(
            `
                ROOT id:ROOT_NODE_ID
                ├── master collapsed id:0 sport:"football"
                ├── master collapsed id:1 sport:"rugby"
                ├── master collapsed id:2 sport:"tennis"
                ├── master collapsed id:3 sport:"cricket"
                ├── master collapsed id:4 sport:"golf"
                ├── master collapsed id:5 sport:"swimming"
                └── master collapsed id:6 sport:"rowing"
            `
        );

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
        await new GridRows(api, `selecting row in detail grid applies indeterminate state to master row final state`)
            .check(`
                ROOT id:ROOT_NODE_ID
                ├── master collapsed id:0 sport:"football"
                ├─┬ master id:1 sport:"rugby"
                │ └─┬ detail id:detail_1 sport:"rugby"
                │ · └─┬ ROOT id:ROOT_NODE_ID
                │ · · ├── LEAF id:0 games:4
                │ · · ├── LEAF id:1 games:5
                │ · · └── LEAF id:2 games:6
                ├── master collapsed id:2 sport:"tennis"
                ├── master collapsed id:3 sport:"cricket"
                ├── master collapsed id:4 sport:"golf"
                ├── master collapsed id:5 sport:"swimming"
                └── master collapsed id:6 sport:"rowing"
            `);
    });

    test('detail state properly tracked and restored when collapsing and re-expanding detail grid', async () => {
        const detailRendered = createDetailRenderedLatch();

        const [api, actions] = await createGridAndWait({
            columnDefs,
            rowData,
            rowSelection: { mode: 'multiRow', masterSelects: 'detail' },
            masterDetail: true,
            detailCellRendererParams: {
                detailGridOptions: {
                    columnDefs: detailColumnDefs,
                    rowSelection: { mode: 'multiRow' },
                    onFirstDataRendered: detailRendered.onFirstDataRendered,
                },
                getDetailRowData(params: GetDetailRowDataParams) {
                    params.successCallback(params.data.detail);
                },
            },
        });
        await new GridColumns(
            api,
            `detail state properly tracked and restored when collapsing and re-expanding deta setup`
        ).checkColumns(`
            CENTER
            ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
            └── sport "Sport" width:200
        `);
        await new GridRows(
            api,
            `detail state properly tracked and restored when collapsing and re-expanding deta setup`
        ).check(`
            ROOT id:ROOT_NODE_ID
            ├── master collapsed id:0 sport:"football"
            ├── master collapsed id:1 sport:"rugby"
            ├── master collapsed id:2 sport:"tennis"
            ├── master collapsed id:3 sport:"cricket"
            ├── master collapsed id:4 sport:"golf"
            ├── master collapsed id:5 sport:"swimming"
            └── master collapsed id:6 sport:"rowing"
        `);

        let info: DetailGridInfo | undefined;
        let detailActions: GridActions;
        let wait: Promise<void>;

        //////////
        // Round 1
        //////////

        const round1Rendered = detailRendered.next();
        await actions.expandGroupRowByIndex(1, { count: 1 });
        await round1Rendered;

        info = api.getDetailGridInfo('detail_1')!;
        expect(info).not.toBeUndefined();

        detailActions = new GridActions(info.api!, '[row-id="detail_1"]');

        wait = waitForEvent('rowSelected', info.api!, 2);
        detailActions.toggleCheckboxByIndex(0);
        detailActions.toggleCheckboxByIndex(1);
        await wait;

        // Detail rows selected
        assertSelectedRowsByIndex([0, 1], info.api!);

        // Master indeterminate
        const node = api.getRowNode('1')!;
        expect(node).not.toBeUndefined();
        expect(node.isSelected()).toBeUndefined();

        //////////
        // Round 2
        //////////

        // Collapse and re-expand master row to hide/show detail grid
        await actions.collapseGroupRowByIndex(1, { count: 1 });
        const round2Rendered = detailRendered.next();
        await actions.expandGroupRowByIndex(1, { count: 1 });
        await round2Rendered;

        info = api.getDetailGridInfo('detail_1')!;
        detailActions = new GridActions(info.api!, '[row-id="detail_1"]');

        // Detail grid should have same rows selected
        assertSelectedRowsByIndex([0, 1], info.api!);

        // Deselect a detail row
        wait = waitForEvent('rowSelected', info.api!);
        detailActions.toggleCheckboxByIndex(1);
        await wait;

        assertSelectedRowsByIndex([0], info.api!);

        //////////
        // Round 3
        //////////

        // Collapse and re-expand master row again
        await actions.collapseGroupRowByIndex(1, { count: 1 });
        const round3Rendered = detailRendered.next();
        await actions.expandGroupRowByIndex(1, { count: 1 });
        await round3Rendered;

        info = api.getDetailGridInfo('detail_1')!;
        detailActions = new GridActions(info.api!, '[row-id="detail_1"]');

        // Detail grid should have same rows selected
        assertSelectedRowsByIndex([0], info.api!);
        await new GridRows(
            api,
            `detail state properly tracked and restored when collapsing and re-expanding deta final state`
        ).check(`
            ROOT id:ROOT_NODE_ID
            ├── master collapsed id:0 sport:"football"
            ├─┬ master indeterminate id:1 sport:"rugby"
            │ └─┬ detail id:detail_1 sport:"rugby"
            │ · └─┬ ROOT id:ROOT_NODE_ID
            │ · · ├── LEAF selected id:0 games:4
            │ · · ├── LEAF id:1 games:5
            │ · · └── LEAF id:2 games:6
            ├── master collapsed id:2 sport:"tennis"
            ├── master collapsed id:3 sport:"cricket"
            ├── master collapsed id:4 sport:"golf"
            ├── master collapsed id:5 sport:"swimming"
            └── master collapsed id:6 sport:"rowing"
        `);
    });

    test('removing a fully-selected master row clears its tracked detail selection', async () => {
        const detailRendered = createDetailRenderedLatch();
        const [api, actions] = await createGridAndWait({
            columnDefs,
            rowData,
            getRowId: (params) => params.data.sport,
            rowSelection: { mode: 'multiRow', masterSelects: 'detail' },
            masterDetail: true,
            detailCellRendererParams: {
                detailGridOptions: {
                    columnDefs: detailColumnDefs,
                    rowSelection: { mode: 'multiRow' },
                    onFirstDataRendered: detailRendered.onFirstDataRendered,
                },
                getDetailRowData(params: GetDetailRowDataParams) {
                    params.successCallback(params.data.detail);
                },
            },
        });

        const rendered = detailRendered.next();
        await actions.expandGroupRowByIndex(1, { count: 1 });
        await rendered;

        const info = api.getDetailGridInfo('detail_rugby')!;
        expect(info).not.toBeUndefined();
        const detailActions = new GridActions(info.api!, '[row-id="detail_rugby"]');

        // Partial detail selection first, so the master's detail selection is tracked...
        let wait = waitForEvent('rowSelected', info.api!);
        detailActions.toggleCheckboxByIndex(0);
        await wait;
        expect(api.getRowNode('rugby')!.isSelected()).toBeUndefined();

        // ...then select the rest so the master becomes fully selected (the tracked entry is now stale).
        wait = waitForEvent('rowSelected', info.api!, 2);
        detailActions.toggleCheckboxByIndex(1);
        detailActions.toggleCheckboxByIndex(2);
        await wait;
        expect(api.getRowNode('rugby')!.isSelected()).toBe(true);

        const selectionSvc = (api.getRowNode('football') as any).beans.selectionSvc;
        expect(selectionSvc.detailSelection.has('rugby')).toBe(true);

        // Removing the selected master must drop both its selection and its tracked detail state.
        api.applyTransaction({ remove: [{ sport: 'rugby' }] });

        expect(api.getRowNode('rugby')).toBeUndefined();
        expect(api.getSelectedNodes()).toEqual([]);
        expect(selectionSvc.detailSelection.has('rugby')).toBe(false);
    });
});
