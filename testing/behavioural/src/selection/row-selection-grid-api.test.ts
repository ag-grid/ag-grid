import type { MockInstance } from 'vitest';

import type { GetRowIdParams, GridApi, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, PaginationModule, QuickFilterModule, RowSelectionModule } from 'ag-grid-community';
import { RowGroupingModule, ServerSideRowModelApiModule, ServerSideRowModelModule } from 'ag-grid-enterprise';

import {
    GridColumns,
    GridRows,
    TestGridsManager,
    applyTransactionChecked,
    assertSelectedRowElementsById,
    assertSelectedRowNodes,
    assertSelectedRowsByIndex,
    waitForEvent,
} from '../test-utils';
import { GROUP_ROW_DATA, fakeFetch } from './group-data';
import { GridActions } from './utils';

describe('Row Selection Grid API', () => {
    let consoleErrorSpy: MockInstance;
    let consoleWarnSpy: MockInstance;

    const gridMgr = new TestGridsManager({
        modules: [
            ClientSideRowModelModule,
            ServerSideRowModelModule,
            ServerSideRowModelApiModule,
            RowGroupingModule,
            RowSelectionModule,
        ],
    });

    function createGrid(gridOptions: GridOptions, params?: { modules?: any[] }): [GridApi, GridActions] {
        const api = gridMgr.createGrid('myGrid', gridOptions, params);
        const actions = new GridActions(api, '#myGrid');
        return [api, actions];
    }

    async function createGridAndWait(gridOptions: GridOptions): Promise<[GridApi, GridActions]> {
        const [api, actions] = createGrid(gridOptions);
        await waitForEvent('firstDataRendered', api);
        return [api, actions];
    }

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

    const columnDefs = [{ field: 'sport' }];
    const rowData = [
        { id: '1', sport: 'football' },
        { id: '2', sport: 'rugby' },
        { id: '3', sport: 'tennis' },
        { id: '4', sport: 'cricket' },
        { id: '5', sport: 'golf' },
        { id: '6', sport: 'swimming' },
        { id: '7', sport: 'rowing' },
    ];

    describe('Single Row Selection', () => {
        describe('CSRM', () => {
            describe('selectAll', () => {
                test('Prevented from selecting all rows via the API', async () => {
                    const [api] = createGrid({
                        columnDefs,
                        rowData,
                        rowSelection: {
                            mode: 'singleRow',
                        },
                    });
                    await new GridColumns(api, `Prevented from selecting all rows via the API setup`).checkColumns(`
                        CENTER
                        ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                        └── sport "Sport" width:200
                    `);
                    await new GridRows(api, `Prevented from selecting all rows via the API setup`).check(`
                        ROOT id:ROOT_NODE_ID
                        ├── LEAF id:0 sport:"football"
                        ├── LEAF id:1 sport:"rugby"
                        ├── LEAF id:2 sport:"tennis"
                        ├── LEAF id:3 sport:"cricket"
                        ├── LEAF id:4 sport:"golf"
                        ├── LEAF id:5 sport:"swimming"
                        └── LEAF id:6 sport:"rowing"
                    `);

                    assertSelectedRowsByIndex([], api);

                    api.selectAll();

                    assertSelectedRowsByIndex([], api);
                    await new GridRows(api, `Prevented from selecting all rows via the API final state`).check(`
                        ROOT id:ROOT_NODE_ID
                        ├── LEAF id:0 sport:"football"
                        ├── LEAF id:1 sport:"rugby"
                        ├── LEAF id:2 sport:"tennis"
                        ├── LEAF id:3 sport:"cricket"
                        ├── LEAF id:4 sport:"golf"
                        ├── LEAF id:5 sport:"swimming"
                        └── LEAF id:6 sport:"rowing"
                    `);
                });
            });

            describe('selectAll("currentPage")', () => {
                test('Cannot select all rows on current page', async () => {
                    const [api] = createGrid(
                        {
                            columnDefs,
                            rowData,
                            rowSelection: { mode: 'singleRow' },
                            pagination: true,
                            paginationPageSize: 5,
                            paginationPageSizeSelector: false,
                        },
                        { modules: [PaginationModule] }
                    );
                    await new GridColumns(api, `Cannot select all rows on current page setup`).checkColumns(`
                        CENTER
                        ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                        └── sport "Sport" width:200
                    `);
                    await new GridRows(api, `Cannot select all rows on current page setup`).check(`
                        ROOT id:ROOT_NODE_ID
                        ├── LEAF id:0 sport:"football"
                        ├── LEAF id:1 sport:"rugby"
                        ├── LEAF id:2 sport:"tennis"
                        ├── LEAF id:3 sport:"cricket"
                        ├── LEAF id:4 sport:"golf"
                        ├── LEAF id:5 sport:"swimming"
                        └── LEAF id:6 sport:"rowing"
                    `);

                    api.selectAll('currentPage');

                    assertSelectedRowsByIndex([], api);
                    await new GridRows(api, `Cannot select all rows on current page final state`).check(`
                        ROOT id:ROOT_NODE_ID
                        ├── LEAF id:0 sport:"football"
                        ├── LEAF id:1 sport:"rugby"
                        ├── LEAF id:2 sport:"tennis"
                        ├── LEAF id:3 sport:"cricket"
                        ├── LEAF id:4 sport:"golf"
                        ├── LEAF id:5 sport:"swimming"
                        └── LEAF id:6 sport:"rowing"
                    `);
                });
            });

            describe('selectAll("filtered")', () => {
                test('Cannot select all filtered rows', async () => {
                    const [api] = createGrid(
                        {
                            columnDefs,
                            rowData,
                            rowSelection: { mode: 'singleRow' },
                        },
                        { modules: [QuickFilterModule] }
                    );
                    await new GridColumns(api, `Cannot select all filtered rows setup`).checkColumns(`
                        CENTER
                        ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                        └── sport "Sport" width:200
                    `);
                    await new GridRows(api, `Cannot select all filtered rows setup`).check(`
                        ROOT id:ROOT_NODE_ID
                        ├── LEAF id:0 sport:"football"
                        ├── LEAF id:1 sport:"rugby"
                        ├── LEAF id:2 sport:"tennis"
                        ├── LEAF id:3 sport:"cricket"
                        ├── LEAF id:4 sport:"golf"
                        ├── LEAF id:5 sport:"swimming"
                        └── LEAF id:6 sport:"rowing"
                    `);

                    api.setGridOption('quickFilterText', 'ing');
                    await new GridColumns(api, `Cannot select all filtered rows after setGridOption quickFilterText`)
                        .checkColumns(`
                            CENTER
                            ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                            └── sport "Sport" width:200
                        `);
                    await new GridRows(api, `Cannot select all filtered rows after setGridOption quickFilterText`)
                        .check(`
                            ROOT id:ROOT_NODE_ID
                            ├── LEAF id:5 sport:"swimming"
                            └── LEAF id:6 sport:"rowing"
                        `);

                    api.selectAll('filtered');

                    assertSelectedRowNodes([], api);
                });
            });

            describe('setNodesSelected', () => {
                test('Select single row', async () => {
                    const [api] = createGrid({
                        columnDefs,
                        rowData,
                        rowSelection: { mode: 'singleRow' },
                    });
                    await new GridColumns(api, `Select single row setup`).checkColumns(`
                        CENTER
                        ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                        └── sport "Sport" width:200
                    `);
                    await new GridRows(api, `Select single row setup`).check(`
                        ROOT id:ROOT_NODE_ID
                        ├── LEAF id:0 sport:"football"
                        ├── LEAF id:1 sport:"rugby"
                        ├── LEAF id:2 sport:"tennis"
                        ├── LEAF id:3 sport:"cricket"
                        ├── LEAF id:4 sport:"golf"
                        ├── LEAF id:5 sport:"swimming"
                        └── LEAF id:6 sport:"rowing"
                    `);

                    const nodes = api.getRenderedNodes();
                    const toSelect = [nodes[3]];
                    api.setNodesSelected({ nodes: toSelect, newValue: true });

                    assertSelectedRowNodes(toSelect, api);
                    await new GridRows(api, `Select single row final state`).check(`
                        ROOT id:ROOT_NODE_ID
                        ├── LEAF id:0 sport:"football"
                        ├── LEAF id:1 sport:"rugby"
                        ├── LEAF id:2 sport:"tennis"
                        ├── LEAF selected id:3 sport:"cricket"
                        ├── LEAF id:4 sport:"golf"
                        ├── LEAF id:5 sport:"swimming"
                        └── LEAF id:6 sport:"rowing"
                    `);
                });

                test('Cannot select multiple rows', async () => {
                    const [api] = createGrid({
                        columnDefs,
                        rowData,
                        rowSelection: { mode: 'singleRow' },
                    });
                    await new GridColumns(api, `Cannot select multiple rows setup`).checkColumns(`
                        CENTER
                        ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                        └── sport "Sport" width:200
                    `);
                    await new GridRows(api, `Cannot select multiple rows setup`).check(`
                        ROOT id:ROOT_NODE_ID
                        ├── LEAF id:0 sport:"football"
                        ├── LEAF id:1 sport:"rugby"
                        ├── LEAF id:2 sport:"tennis"
                        ├── LEAF id:3 sport:"cricket"
                        ├── LEAF id:4 sport:"golf"
                        ├── LEAF id:5 sport:"swimming"
                        └── LEAF id:6 sport:"rowing"
                    `);

                    const nodes = api.getRenderedNodes();
                    const toSelect = [nodes[0], nodes[3], nodes[1]];
                    api.setNodesSelected({ nodes: toSelect, newValue: true });

                    assertSelectedRowNodes([], api);
                    await new GridRows(api, `Cannot select multiple rows final state`).check(`
                        ROOT id:ROOT_NODE_ID
                        ├── LEAF id:0 sport:"football"
                        ├── LEAF id:1 sport:"rugby"
                        ├── LEAF id:2 sport:"tennis"
                        ├── LEAF id:3 sport:"cricket"
                        ├── LEAF id:4 sport:"golf"
                        ├── LEAF id:5 sport:"swimming"
                        └── LEAF id:6 sport:"rowing"
                    `);
                });
            });
        });

        describe('SSRM', () => {
            describe('selectAll', () => {
                test('Prevented from selecting all rows via the API', async () => {
                    const [api] = createGrid({
                        columnDefs,
                        rowSelection: {
                            mode: 'singleRow',
                        },
                        getRowId(params) {
                            return params.data.sport;
                        },
                        rowModelType: 'serverSide',
                        serverSideDatasource: {
                            getRows(params) {
                                params.success({ rowData });
                            },
                        },
                    });
                    await new GridColumns(api, `Prevented from selecting all rows via the API setup`).checkColumns(`
                        CENTER
                        ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                        └── sport "Sport" width:200
                    `);
                    await new GridRows(api, `Prevented from selecting all rows via the API setup`).check(`
                        ROOT id:<no-id>
                        └── filler id:rowIndex:0
                    `);

                    await waitForEvent('firstDataRendered', api);
                    assertSelectedRowNodes([], api);

                    api.selectAll();

                    assertSelectedRowNodes([], api);
                    await new GridRows(api, `Prevented from selecting all rows via the API final state`).check(`
                        ROOT id:<no-id>
                        ├── LEAF id:football sport:"football"
                        ├── LEAF id:rugby sport:"rugby"
                        ├── LEAF id:tennis sport:"tennis"
                        ├── LEAF id:cricket sport:"cricket"
                        ├── LEAF id:golf sport:"golf"
                        ├── LEAF id:swimming sport:"swimming"
                        └── LEAF id:rowing sport:"rowing"
                    `);
                });
            });

            describe('setNodesSelected', () => {
                test('Select single row', async () => {
                    const [api] = createGrid({
                        columnDefs,
                        rowModelType: 'serverSide',
                        serverSideDatasource: {
                            getRows(params) {
                                params.success({ rowData });
                            },
                        },
                        getRowId(params) {
                            return params.data.sport;
                        },
                        rowSelection: { mode: 'singleRow' },
                    });
                    await new GridColumns(api, `Select single row setup`).checkColumns(`
                        CENTER
                        ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                        └── sport "Sport" width:200
                    `);
                    await new GridRows(api, `Select single row setup`).check(`
                        ROOT id:<no-id>
                        └── filler id:rowIndex:0
                    `);

                    await waitForEvent('firstDataRendered', api);
                    const nodes = api.getRenderedNodes();
                    const toSelect = [nodes[3]];
                    api.setNodesSelected({ nodes: toSelect, newValue: true });

                    assertSelectedRowNodes(toSelect, api);
                    await new GridRows(api, `Select single row final state`).check(`
                        ROOT id:<no-id>
                        ├── LEAF id:football sport:"football"
                        ├── LEAF id:rugby sport:"rugby"
                        ├── LEAF id:tennis sport:"tennis"
                        ├── LEAF selected id:cricket sport:"cricket"
                        ├── LEAF id:golf sport:"golf"
                        ├── LEAF id:swimming sport:"swimming"
                        └── LEAF id:rowing sport:"rowing"
                    `);
                });

                test('Cannot select multiple rows', async () => {
                    const [api] = createGrid({
                        columnDefs,
                        rowModelType: 'serverSide',
                        serverSideDatasource: {
                            getRows(params) {
                                params.success({ rowData });
                            },
                        },
                        getRowId(params) {
                            return params.data.sport;
                        },
                        rowSelection: { mode: 'singleRow' },
                    });
                    await new GridColumns(api, `Cannot select multiple rows setup`).checkColumns(`
                        CENTER
                        ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                        └── sport "Sport" width:200
                    `);
                    await new GridRows(api, `Cannot select multiple rows setup`).check(`
                        ROOT id:<no-id>
                        └── filler id:rowIndex:0
                    `);

                    await waitForEvent('firstDataRendered', api);
                    const nodes = api.getRenderedNodes();
                    const toSelect = [nodes[0], nodes[3], nodes[1]];
                    api.setNodesSelected({ nodes: toSelect, newValue: true });

                    assertSelectedRowNodes([], api);
                    await new GridRows(api, `Cannot select multiple rows final state`).check(`
                        ROOT id:<no-id>
                        ├── LEAF id:football sport:"football"
                        ├── LEAF id:rugby sport:"rugby"
                        ├── LEAF id:tennis sport:"tennis"
                        ├── LEAF id:cricket sport:"cricket"
                        ├── LEAF id:golf sport:"golf"
                        ├── LEAF id:swimming sport:"swimming"
                        └── LEAF id:rowing sport:"rowing"
                    `);
                });
            });
        });
    });

    describe('Multi Row Selection', () => {
        describe('CSRM', () => {
            describe('setNodesSelected', () => {
                test('Select single row', async () => {
                    const [api] = createGrid({ columnDefs, rowData, rowSelection: { mode: 'multiRow' } });
                    await new GridColumns(api, `Select single row setup`).checkColumns(`
                        CENTER
                        ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                        └── sport "Sport" width:200
                    `);
                    await new GridRows(api, `Select single row setup`).check(`
                        ROOT id:ROOT_NODE_ID
                        ├── LEAF id:0 sport:"football"
                        ├── LEAF id:1 sport:"rugby"
                        ├── LEAF id:2 sport:"tennis"
                        ├── LEAF id:3 sport:"cricket"
                        ├── LEAF id:4 sport:"golf"
                        ├── LEAF id:5 sport:"swimming"
                        └── LEAF id:6 sport:"rowing"
                    `);

                    const nodes = api.getRenderedNodes();
                    const toSelect = [nodes[3]];
                    api.setNodesSelected({ nodes: toSelect, newValue: true });

                    assertSelectedRowNodes(toSelect, api);
                    await new GridRows(api, `Select single row final state`).check(`
                        ROOT id:ROOT_NODE_ID
                        ├── LEAF id:0 sport:"football"
                        ├── LEAF id:1 sport:"rugby"
                        ├── LEAF id:2 sport:"tennis"
                        ├── LEAF selected id:3 sport:"cricket"
                        ├── LEAF id:4 sport:"golf"
                        ├── LEAF id:5 sport:"swimming"
                        └── LEAF id:6 sport:"rowing"
                    `);
                });

                test('Can select multiple rows', async () => {
                    const [api] = createGrid({ columnDefs, rowData, rowSelection: { mode: 'multiRow' } });
                    await new GridColumns(api, `Can select multiple rows setup`).checkColumns(`
                        CENTER
                        ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                        └── sport "Sport" width:200
                    `);
                    await new GridRows(api, `Can select multiple rows setup`).check(`
                        ROOT id:ROOT_NODE_ID
                        ├── LEAF id:0 sport:"football"
                        ├── LEAF id:1 sport:"rugby"
                        ├── LEAF id:2 sport:"tennis"
                        ├── LEAF id:3 sport:"cricket"
                        ├── LEAF id:4 sport:"golf"
                        ├── LEAF id:5 sport:"swimming"
                        └── LEAF id:6 sport:"rowing"
                    `);

                    const nodes = api.getRenderedNodes();
                    const toSelect = [nodes[5], nodes[4], nodes[2]];
                    api.setNodesSelected({ nodes: toSelect, newValue: true });

                    assertSelectedRowNodes(toSelect, api);
                    await new GridRows(api, `Can select multiple rows final state`).check(`
                        ROOT id:ROOT_NODE_ID
                        ├── LEAF id:0 sport:"football"
                        ├── LEAF id:1 sport:"rugby"
                        ├── LEAF selected id:2 sport:"tennis"
                        ├── LEAF id:3 sport:"cricket"
                        ├── LEAF selected id:4 sport:"golf"
                        ├── LEAF selected id:5 sport:"swimming"
                        └── LEAF id:6 sport:"rowing"
                    `);
                });

                test('API calls will update selection context for bulk selection', async () => {
                    const [api, actions] = createGrid({ columnDefs, rowData, rowSelection: { mode: 'multiRow' } });
                    await new GridColumns(api, `API calls will update selection context for bulk selection setup`)
                        .checkColumns(`
                            CENTER
                            ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                            └── sport "Sport" width:200
                        `);
                    await new GridRows(api, `API calls will update selection context for bulk selection setup`).check(
                        `
                            ROOT id:ROOT_NODE_ID
                            ├── LEAF id:0 sport:"football"
                            ├── LEAF id:1 sport:"rugby"
                            ├── LEAF id:2 sport:"tennis"
                            ├── LEAF id:3 sport:"cricket"
                            ├── LEAF id:4 sport:"golf"
                            ├── LEAF id:5 sport:"swimming"
                            └── LEAF id:6 sport:"rowing"
                        `
                    );

                    const nodes = api.getRenderedNodes();
                    const toSelect = [nodes[3]];
                    api.setNodesSelected({ nodes: toSelect, newValue: true });

                    actions.toggleCheckboxByIndex(5, { shiftKey: true });
                    assertSelectedRowsByIndex([3, 4, 5], api);
                    await new GridRows(api, `API calls will update selection context for bulk selection final state`)
                        .check(`
                            ROOT id:ROOT_NODE_ID
                            ├── LEAF id:0 sport:"football"
                            ├── LEAF id:1 sport:"rugby"
                            ├── LEAF id:2 sport:"tennis"
                            ├── LEAF selected id:3 sport:"cricket"
                            ├── LEAF selected id:4 sport:"golf"
                            ├── LEAF selected id:5 sport:"swimming"
                            └── LEAF id:6 sport:"rowing"
                        `);
                });
            });

            describe('selectAll', () => {
                test('Can select all rows', async () => {
                    const [api] = createGrid({ columnDefs, rowData, rowSelection: { mode: 'multiRow' } });
                    await new GridColumns(api, `Can select all rows setup`).checkColumns(`
                        CENTER
                        ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                        └── sport "Sport" width:200
                    `);
                    await new GridRows(api, `Can select all rows setup`).check(`
                        ROOT id:ROOT_NODE_ID
                        ├── LEAF id:0 sport:"football"
                        ├── LEAF id:1 sport:"rugby"
                        ├── LEAF id:2 sport:"tennis"
                        ├── LEAF id:3 sport:"cricket"
                        ├── LEAF id:4 sport:"golf"
                        ├── LEAF id:5 sport:"swimming"
                        └── LEAF id:6 sport:"rowing"
                    `);

                    api.selectAll();

                    expect(api.getSelectedNodes().length).toBe(rowData.length);

                    api.deselectAll();
                    assertSelectedRowNodes([], api);
                    await new GridRows(api, `Can select all rows final state`).check(`
                        ROOT id:ROOT_NODE_ID
                        ├── LEAF id:0 sport:"football"
                        ├── LEAF id:1 sport:"rugby"
                        ├── LEAF id:2 sport:"tennis"
                        ├── LEAF id:3 sport:"cricket"
                        ├── LEAF id:4 sport:"golf"
                        ├── LEAF id:5 sport:"swimming"
                        └── LEAF id:6 sport:"rowing"
                    `);
                });
            });
        });

        describe('SSRM', () => {
            describe('setNodesSelected', () => {
                test('Select single row', async () => {
                    const [api] = createGrid({
                        columnDefs,
                        rowModelType: 'serverSide',
                        serverSideDatasource: {
                            getRows(params) {
                                params.success({ rowData });
                            },
                        },
                        getRowId(params) {
                            return params.data.sport;
                        },
                        rowSelection: { mode: 'multiRow' },
                    });
                    await new GridColumns(api, `Select single row setup`).checkColumns(`
                        CENTER
                        ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                        └── sport "Sport" width:200
                    `);
                    await new GridRows(api, `Select single row setup`).check(`
                        ROOT id:<no-id>
                        └── filler id:rowIndex:0
                    `);

                    await waitForEvent('firstDataRendered', api);
                    const nodes = api.getRenderedNodes();
                    const toSelect = [nodes[3]];
                    api.setNodesSelected({ nodes: toSelect, newValue: true });

                    assertSelectedRowNodes(toSelect, api);
                    await new GridRows(api, `Select single row final state`).check(`
                        ROOT id:<no-id>
                        ├── LEAF id:football sport:"football"
                        ├── LEAF id:rugby sport:"rugby"
                        ├── LEAF id:tennis sport:"tennis"
                        ├── LEAF selected id:cricket sport:"cricket"
                        ├── LEAF id:golf sport:"golf"
                        ├── LEAF id:swimming sport:"swimming"
                        └── LEAF id:rowing sport:"rowing"
                    `);
                });

                test('Can select multiple rows', async () => {
                    const [api] = createGrid({
                        columnDefs,
                        rowModelType: 'serverSide',
                        serverSideDatasource: {
                            getRows(params) {
                                params.success({ rowData });
                            },
                        },
                        getRowId(params) {
                            return params.data.sport;
                        },
                        rowSelection: { mode: 'multiRow' },
                    });
                    await new GridColumns(api, `Can select multiple rows setup`).checkColumns(`
                        CENTER
                        ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                        └── sport "Sport" width:200
                    `);
                    await new GridRows(api, `Can select multiple rows setup`).check(`
                        ROOT id:<no-id>
                        └── filler id:rowIndex:0
                    `);

                    await waitForEvent('firstDataRendered', api);
                    const nodes = api.getRenderedNodes();
                    const toSelect = [nodes[5], nodes[4], nodes[2]];
                    api.setNodesSelected({ nodes: toSelect, newValue: true });

                    assertSelectedRowNodes(toSelect, api);
                    await new GridRows(api, `Can select multiple rows final state`).check(`
                        ROOT id:<no-id>
                        ├── LEAF id:football sport:"football"
                        ├── LEAF id:rugby sport:"rugby"
                        ├── LEAF selected id:tennis sport:"tennis"
                        ├── LEAF id:cricket sport:"cricket"
                        ├── LEAF selected id:golf sport:"golf"
                        ├── LEAF selected id:swimming sport:"swimming"
                        └── LEAF id:rowing sport:"rowing"
                    `);
                });

                test('API calls will update selection context for bulk selection', async () => {
                    const [api, actions] = createGrid({
                        columnDefs,
                        rowModelType: 'serverSide',
                        serverSideDatasource: {
                            getRows(params) {
                                params.success({ rowData });
                            },
                        },
                        getRowId(params) {
                            return params.data.sport;
                        },
                        rowSelection: { mode: 'multiRow' },
                    });
                    await new GridColumns(api, `API calls will update selection context for bulk selection setup`)
                        .checkColumns(`
                            CENTER
                            ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                            └── sport "Sport" width:200
                        `);
                    await new GridRows(api, `API calls will update selection context for bulk selection setup`).check(
                        `
                            ROOT id:<no-id>
                            └── filler id:rowIndex:0
                        `
                    );

                    await waitForEvent('firstDataRendered', api);
                    const nodes = api.getRenderedNodes();
                    const toSelect = [nodes[3]];
                    api.setNodesSelected({ nodes: toSelect, newValue: true });

                    actions.toggleCheckboxByIndex(5, { shiftKey: true });
                    assertSelectedRowsByIndex([3, 4, 5], api);
                    await new GridRows(api, `API calls will update selection context for bulk selection final state`)
                        .check(`
                            ROOT id:<no-id>
                            ├── LEAF id:football sport:"football"
                            ├── LEAF id:rugby sport:"rugby"
                            ├── LEAF id:tennis sport:"tennis"
                            ├── LEAF selected id:cricket sport:"cricket"
                            ├── LEAF selected id:golf sport:"golf"
                            ├── LEAF selected id:swimming sport:"swimming"
                            └── LEAF id:rowing sport:"rowing"
                        `);
                });
            });
        });
    });

    describe('Group Row Selection', () => {
        const groupGridOptions: Partial<GridOptions> = {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'sport', rowGroup: true, hide: true },
                { field: 'age' },
                { field: 'year' },
                { field: 'date' },
            ],
            autoGroupColumnDef: {
                headerName: 'Athlete',
                field: 'athlete',
                cellRenderer: 'agGroupCellRenderer',
            },
            rowData: GROUP_ROW_DATA,
            groupDefaultExpanded: -1,
        };

        test('getSelectedRows does not return group rows', async () => {
            const [api, actions] = await createGridAndWait({
                ...groupGridOptions,
                rowSelection: { mode: 'multiRow', checkboxes: true },
            });
            await new GridColumns(api, `getSelectedRows does not return group rows setup`).checkColumns(`
                CENTER
                ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                ├── ag-Grid-AutoColumn "Athlete" width:200
                ├── age "Age" width:200
                ├── year "Year" width:200
                └── date "Date" width:200
            `);
            await new GridRows(api, `getSelectedRows does not return group rows setup`).check(`
                ROOT id:ROOT_NODE_ID
                ├─┬ filler id:"row-group-country-United States" ag-Grid-AutoColumn:"United States"
                │ ├─┬ LEAF_GROUP id:"row-group-country-United States-sport-Swimming" ag-Grid-AutoColumn:"Swimming"
                │ │ ├── LEAF id:0 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                │ │ ├── LEAF id:1 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:19 year:2004 date:"29/08/2004"
                │ │ ├── LEAF id:2 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                │ │ ├── LEAF id:3 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:25 year:2008 date:"24/08/2008"
                │ │ ├── LEAF id:6 ag-Grid-AutoColumn:"Missy Franklin" country:"United States" sport:"Swimming" age:17 year:2012 date:"12/08/2012"
                │ │ ├── LEAF id:7 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                │ │ ├── LEAF id:8 ag-Grid-AutoColumn:"Allison Schmitt" country:"United States" sport:"Swimming" age:22 year:2012 date:"12/08/2012"
                │ │ ├── LEAF id:9 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:21 year:2004 date:"29/08/2004"
                │ │ ├── LEAF id:11 ag-Grid-AutoColumn:"Dara Torres" country:"United States" sport:"Swimming" age:33 year:2000 date:"01/10/2000"
                │ │ └── LEAF id:18 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                │ └─┬ LEAF_GROUP id:"row-group-country-United States-sport-Gymnastics" ag-Grid-AutoColumn:"Gymnastics"
                │ · ├── LEAF id:13 ag-Grid-AutoColumn:"Nastia Liukin" country:"United States" sport:"Gymnastics" age:18 year:2008 date:"24/08/2008"
                │ · └── LEAF id:20 ag-Grid-AutoColumn:"Justin Spring" country:"United States" sport:"Gymnastics" age:25 year:2008 date:"24/08/2008"
                ├─┬ filler id:row-group-country-Russia ag-Grid-AutoColumn:"Russia"
                │ └─┬ LEAF_GROUP id:row-group-country-Russia-sport-Gymnastics ag-Grid-AutoColumn:"Gymnastics"
                │ · └── LEAF id:4 ag-Grid-AutoColumn:"Aleksey Nemov" country:"Russia" sport:"Gymnastics" age:24 year:2000 date:"01/10/2000"
                ├─┬ filler id:row-group-country-Australia ag-Grid-AutoColumn:"Australia"
                │ └─┬ LEAF_GROUP id:row-group-country-Australia-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                │ · ├── LEAF id:5 ag-Grid-AutoColumn:"Alicia Coutts" country:"Australia" sport:"Swimming" age:24 year:2012 date:"12/08/2012"
                │ · ├── LEAF id:10 ag-Grid-AutoColumn:"Ian Thorpe" country:"Australia" sport:"Swimming" age:17 year:2000 date:"01/10/2000"
                │ · └── LEAF id:17 ag-Grid-AutoColumn:"Libby Lenton-Trickett" country:"Australia" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                ├─┬ filler id:row-group-country-Canada ag-Grid-AutoColumn:"Canada"
                │ └─┬ LEAF_GROUP id:"row-group-country-Canada-sport-Speed Skating" ag-Grid-AutoColumn:"Speed Skating"
                │ · └── LEAF id:12 ag-Grid-AutoColumn:"Cindy Klassen" country:"Canada" sport:"Speed Skating" age:26 year:2006 date:"26/02/2006"
                ├─┬ filler id:row-group-country-Norway ag-Grid-AutoColumn:"Norway"
                │ └─┬ LEAF_GROUP id:"row-group-country-Norway-sport-Cross Country Skiing" ag-Grid-AutoColumn:"Cross Country Skiing"
                │ · └── LEAF id:14 ag-Grid-AutoColumn:"Marit Bjørgen" country:"Norway" sport:"Cross Country Skiing" age:29 year:2010 date:"28/02/2010"
                ├─┬ filler id:row-group-country-China ag-Grid-AutoColumn:"China"
                │ └─┬ LEAF_GROUP id:row-group-country-China-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                │ · └── LEAF id:15 ag-Grid-AutoColumn:"Sun Yang" country:"China" sport:"Swimming" age:20 year:2012 date:"12/08/2012"
                ├─┬ filler id:row-group-country-Zimbabwe ag-Grid-AutoColumn:"Zimbabwe"
                │ └─┬ LEAF_GROUP id:row-group-country-Zimbabwe-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                │ · └── LEAF id:16 ag-Grid-AutoColumn:"Kirsty Coventry" country:"Zimbabwe" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                └─┬ filler id:row-group-country-Netherlands ag-Grid-AutoColumn:"Netherlands"
                · └─┬ LEAF_GROUP id:row-group-country-Netherlands-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                · · └── LEAF id:19 ag-Grid-AutoColumn:"Inge de Bruijn" country:"Netherlands" sport:"Swimming" age:30 year:2004 date:"29/08/2004"
            `);

            actions.toggleCheckboxById('row-group-country-United States');

            expect(api.getSelectedRows()).toHaveLength(0);
            expect(api.getSelectedNodes()).toHaveLength(1);
            await new GridRows(api, `getSelectedRows does not return group rows final state`).check(`
                ROOT id:ROOT_NODE_ID
                ├─┬ filler selected id:"row-group-country-United States" ag-Grid-AutoColumn:"United States"
                │ ├─┬ LEAF_GROUP id:"row-group-country-United States-sport-Swimming" ag-Grid-AutoColumn:"Swimming"
                │ │ ├── LEAF id:0 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                │ │ ├── LEAF id:1 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:19 year:2004 date:"29/08/2004"
                │ │ ├── LEAF id:2 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                │ │ ├── LEAF id:3 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:25 year:2008 date:"24/08/2008"
                │ │ ├── LEAF id:6 ag-Grid-AutoColumn:"Missy Franklin" country:"United States" sport:"Swimming" age:17 year:2012 date:"12/08/2012"
                │ │ ├── LEAF id:7 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                │ │ ├── LEAF id:8 ag-Grid-AutoColumn:"Allison Schmitt" country:"United States" sport:"Swimming" age:22 year:2012 date:"12/08/2012"
                │ │ ├── LEAF id:9 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:21 year:2004 date:"29/08/2004"
                │ │ ├── LEAF id:11 ag-Grid-AutoColumn:"Dara Torres" country:"United States" sport:"Swimming" age:33 year:2000 date:"01/10/2000"
                │ │ └── LEAF id:18 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                │ └─┬ LEAF_GROUP id:"row-group-country-United States-sport-Gymnastics" ag-Grid-AutoColumn:"Gymnastics"
                │ · ├── LEAF id:13 ag-Grid-AutoColumn:"Nastia Liukin" country:"United States" sport:"Gymnastics" age:18 year:2008 date:"24/08/2008"
                │ · └── LEAF id:20 ag-Grid-AutoColumn:"Justin Spring" country:"United States" sport:"Gymnastics" age:25 year:2008 date:"24/08/2008"
                ├─┬ filler id:row-group-country-Russia ag-Grid-AutoColumn:"Russia"
                │ └─┬ LEAF_GROUP id:row-group-country-Russia-sport-Gymnastics ag-Grid-AutoColumn:"Gymnastics"
                │ · └── LEAF id:4 ag-Grid-AutoColumn:"Aleksey Nemov" country:"Russia" sport:"Gymnastics" age:24 year:2000 date:"01/10/2000"
                ├─┬ filler id:row-group-country-Australia ag-Grid-AutoColumn:"Australia"
                │ └─┬ LEAF_GROUP id:row-group-country-Australia-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                │ · ├── LEAF id:5 ag-Grid-AutoColumn:"Alicia Coutts" country:"Australia" sport:"Swimming" age:24 year:2012 date:"12/08/2012"
                │ · ├── LEAF id:10 ag-Grid-AutoColumn:"Ian Thorpe" country:"Australia" sport:"Swimming" age:17 year:2000 date:"01/10/2000"
                │ · └── LEAF id:17 ag-Grid-AutoColumn:"Libby Lenton-Trickett" country:"Australia" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                ├─┬ filler id:row-group-country-Canada ag-Grid-AutoColumn:"Canada"
                │ └─┬ LEAF_GROUP id:"row-group-country-Canada-sport-Speed Skating" ag-Grid-AutoColumn:"Speed Skating"
                │ · └── LEAF id:12 ag-Grid-AutoColumn:"Cindy Klassen" country:"Canada" sport:"Speed Skating" age:26 year:2006 date:"26/02/2006"
                ├─┬ filler id:row-group-country-Norway ag-Grid-AutoColumn:"Norway"
                │ └─┬ LEAF_GROUP id:"row-group-country-Norway-sport-Cross Country Skiing" ag-Grid-AutoColumn:"Cross Country Skiing"
                │ · └── LEAF id:14 ag-Grid-AutoColumn:"Marit Bjørgen" country:"Norway" sport:"Cross Country Skiing" age:29 year:2010 date:"28/02/2010"
                ├─┬ filler id:row-group-country-China ag-Grid-AutoColumn:"China"
                │ └─┬ LEAF_GROUP id:row-group-country-China-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                │ · └── LEAF id:15 ag-Grid-AutoColumn:"Sun Yang" country:"China" sport:"Swimming" age:20 year:2012 date:"12/08/2012"
                ├─┬ filler id:row-group-country-Zimbabwe ag-Grid-AutoColumn:"Zimbabwe"
                │ └─┬ LEAF_GROUP id:row-group-country-Zimbabwe-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                │ · └── LEAF id:16 ag-Grid-AutoColumn:"Kirsty Coventry" country:"Zimbabwe" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                └─┬ filler id:row-group-country-Netherlands ag-Grid-AutoColumn:"Netherlands"
                · └─┬ LEAF_GROUP id:row-group-country-Netherlands-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                · · └── LEAF id:19 ag-Grid-AutoColumn:"Inge de Bruijn" country:"Netherlands" sport:"Swimming" age:30 year:2004 date:"29/08/2004"
            `);
        });
    });

    describe('Transactions', () => {
        describe('CSRM', () => {
            test('selection state maintained after add transaction', async () => {
                const [api, actions] = createGrid({ columnDefs, rowData, rowSelection: { mode: 'multiRow' } });
                await new GridColumns(api, `selection state maintained after add transaction setup`).checkColumns(`
                    CENTER
                    ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                    └── sport "Sport" width:200
                `);
                await new GridRows(api, `selection state maintained after add transaction setup`).check(`
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:0 sport:"football"
                    ├── LEAF id:1 sport:"rugby"
                    ├── LEAF id:2 sport:"tennis"
                    ├── LEAF id:3 sport:"cricket"
                    ├── LEAF id:4 sport:"golf"
                    ├── LEAF id:5 sport:"swimming"
                    └── LEAF id:6 sport:"rowing"
                `);

                actions.selectRowsByIndex([2, 4, 6], false);

                applyTransactionChecked(api, { add: [{ sport: 'lacrosse' }] });

                assertSelectedRowsByIndex([2, 4, 6], api);
                await new GridRows(api, `selection state maintained after add transaction final state`).check(`
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:0 sport:"football"
                    ├── LEAF id:1 sport:"rugby"
                    ├── LEAF selected id:2 sport:"tennis"
                    ├── LEAF id:3 sport:"cricket"
                    ├── LEAF selected id:4 sport:"golf"
                    ├── LEAF id:5 sport:"swimming"
                    ├── LEAF selected id:6 sport:"rowing"
                    └── LEAF id:7 sport:"lacrosse"
                `);
            });

            test('selection state maintained after update transaction', async () => {
                const [api, actions] = createGrid({
                    columnDefs,
                    rowData,
                    rowSelection: { mode: 'multiRow' },
                    getRowId(params) {
                        return params.data.id;
                    },
                });
                await new GridColumns(api, `selection state maintained after update transaction setup`).checkColumns(
                    `
                        CENTER
                        ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                        └── sport "Sport" width:200
                    `
                );
                await new GridRows(api, `selection state maintained after update transaction setup`).check(`
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:1 sport:"football"
                    ├── LEAF id:2 sport:"rugby"
                    ├── LEAF id:3 sport:"tennis"
                    ├── LEAF id:4 sport:"cricket"
                    ├── LEAF id:5 sport:"golf"
                    ├── LEAF id:6 sport:"swimming"
                    └── LEAF id:7 sport:"rowing"
                `);

                actions.selectRowsByIndex([2, 4, 6], false);

                applyTransactionChecked(api, { update: [{ id: '7', sport: 'lacrosse' }] });

                assertSelectedRowsByIndex([2, 4, 6], api);
                await new GridRows(api, `selection state maintained after update transaction final state`).check(`
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:1 sport:"football"
                    ├── LEAF id:2 sport:"rugby"
                    ├── LEAF selected id:3 sport:"tennis"
                    ├── LEAF id:4 sport:"cricket"
                    ├── LEAF selected id:5 sport:"golf"
                    ├── LEAF id:6 sport:"swimming"
                    └── LEAF selected id:7 sport:"lacrosse"
                `);
            });

            test('selection state updated after remove transaction', async () => {
                const [api, actions] = createGrid({
                    columnDefs,
                    rowData,
                    rowSelection: { mode: 'multiRow' },
                    getRowId(params) {
                        return params.data.id;
                    },
                });
                await new GridColumns(api, `selection state updated after remove transaction setup`).checkColumns(`
                    CENTER
                    ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                    └── sport "Sport" width:200
                `);
                await new GridRows(api, `selection state updated after remove transaction setup`).check(`
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:1 sport:"football"
                    ├── LEAF id:2 sport:"rugby"
                    ├── LEAF id:3 sport:"tennis"
                    ├── LEAF id:4 sport:"cricket"
                    ├── LEAF id:5 sport:"golf"
                    ├── LEAF id:6 sport:"swimming"
                    └── LEAF id:7 sport:"rowing"
                `);

                actions.selectRowsByIndex([2, 4, 6], false);

                applyTransactionChecked(api, { remove: rowData.slice(-1) });

                assertSelectedRowsByIndex([2, 4], api);
                await new GridRows(api, `selection state updated after remove transaction final state`).check(`
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:1 sport:"football"
                    ├── LEAF id:2 sport:"rugby"
                    ├── LEAF selected id:3 sport:"tennis"
                    ├── LEAF id:4 sport:"cricket"
                    ├── LEAF selected id:5 sport:"golf"
                    └── LEAF id:6 sport:"swimming"
                `);
            });

            test('group selection state updated after add and remove transaction', async () => {
                const groupGridOptions: Partial<GridOptions> = {
                    columnDefs: [
                        { field: 'country', rowGroup: true, hide: true },
                        { field: 'sport', rowGroup: true, hide: true },
                        { field: 'age' },
                        { field: 'year' },
                        { field: 'date' },
                    ],
                    autoGroupColumnDef: {
                        headerName: 'Athlete',
                        field: 'athlete',
                        cellRenderer: 'agGroupCellRenderer',
                    },
                    rowData: GROUP_ROW_DATA,
                    groupDefaultExpanded: -1,
                };

                const [api, actions] = createGrid({
                    ...groupGridOptions,
                    rowSelection: { mode: 'multiRow', groupSelects: 'descendants' },
                });
                await new GridColumns(api, `group selection state updated after add and remove transaction setup`)
                    .checkColumns(`
                        CENTER
                        ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                        ├── ag-Grid-AutoColumn "Athlete" width:200
                        ├── age "Age" width:200
                        ├── year "Year" width:200
                        └── date "Date" width:200
                    `);
                await new GridRows(api, `group selection state updated after add and remove transaction setup`).check(
                    `
                        ROOT id:ROOT_NODE_ID
                        ├─┬ filler id:"row-group-country-United States" ag-Grid-AutoColumn:"United States"
                        │ ├─┬ LEAF_GROUP id:"row-group-country-United States-sport-Swimming" ag-Grid-AutoColumn:"Swimming"
                        │ │ ├── LEAF id:0 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                        │ │ ├── LEAF id:1 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:19 year:2004 date:"29/08/2004"
                        │ │ ├── LEAF id:2 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF id:3 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:25 year:2008 date:"24/08/2008"
                        │ │ ├── LEAF id:6 ag-Grid-AutoColumn:"Missy Franklin" country:"United States" sport:"Swimming" age:17 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF id:7 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF id:8 ag-Grid-AutoColumn:"Allison Schmitt" country:"United States" sport:"Swimming" age:22 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF id:9 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:21 year:2004 date:"29/08/2004"
                        │ │ ├── LEAF id:11 ag-Grid-AutoColumn:"Dara Torres" country:"United States" sport:"Swimming" age:33 year:2000 date:"01/10/2000"
                        │ │ └── LEAF id:18 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                        │ └─┬ LEAF_GROUP id:"row-group-country-United States-sport-Gymnastics" ag-Grid-AutoColumn:"Gymnastics"
                        │ · ├── LEAF id:13 ag-Grid-AutoColumn:"Nastia Liukin" country:"United States" sport:"Gymnastics" age:18 year:2008 date:"24/08/2008"
                        │ · └── LEAF id:20 ag-Grid-AutoColumn:"Justin Spring" country:"United States" sport:"Gymnastics" age:25 year:2008 date:"24/08/2008"
                        ├─┬ filler id:row-group-country-Russia ag-Grid-AutoColumn:"Russia"
                        │ └─┬ LEAF_GROUP id:row-group-country-Russia-sport-Gymnastics ag-Grid-AutoColumn:"Gymnastics"
                        │ · └── LEAF id:4 ag-Grid-AutoColumn:"Aleksey Nemov" country:"Russia" sport:"Gymnastics" age:24 year:2000 date:"01/10/2000"
                        ├─┬ filler id:row-group-country-Australia ag-Grid-AutoColumn:"Australia"
                        │ └─┬ LEAF_GROUP id:row-group-country-Australia-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        │ · ├── LEAF id:5 ag-Grid-AutoColumn:"Alicia Coutts" country:"Australia" sport:"Swimming" age:24 year:2012 date:"12/08/2012"
                        │ · ├── LEAF id:10 ag-Grid-AutoColumn:"Ian Thorpe" country:"Australia" sport:"Swimming" age:17 year:2000 date:"01/10/2000"
                        │ · └── LEAF id:17 ag-Grid-AutoColumn:"Libby Lenton-Trickett" country:"Australia" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                        ├─┬ filler id:row-group-country-Canada ag-Grid-AutoColumn:"Canada"
                        │ └─┬ LEAF_GROUP id:"row-group-country-Canada-sport-Speed Skating" ag-Grid-AutoColumn:"Speed Skating"
                        │ · └── LEAF id:12 ag-Grid-AutoColumn:"Cindy Klassen" country:"Canada" sport:"Speed Skating" age:26 year:2006 date:"26/02/2006"
                        ├─┬ filler id:row-group-country-Norway ag-Grid-AutoColumn:"Norway"
                        │ └─┬ LEAF_GROUP id:"row-group-country-Norway-sport-Cross Country Skiing" ag-Grid-AutoColumn:"Cross Country Skiing"
                        │ · └── LEAF id:14 ag-Grid-AutoColumn:"Marit Bjørgen" country:"Norway" sport:"Cross Country Skiing" age:29 year:2010 date:"28/02/2010"
                        ├─┬ filler id:row-group-country-China ag-Grid-AutoColumn:"China"
                        │ └─┬ LEAF_GROUP id:row-group-country-China-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        │ · └── LEAF id:15 ag-Grid-AutoColumn:"Sun Yang" country:"China" sport:"Swimming" age:20 year:2012 date:"12/08/2012"
                        ├─┬ filler id:row-group-country-Zimbabwe ag-Grid-AutoColumn:"Zimbabwe"
                        │ └─┬ LEAF_GROUP id:row-group-country-Zimbabwe-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        │ · └── LEAF id:16 ag-Grid-AutoColumn:"Kirsty Coventry" country:"Zimbabwe" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                        └─┬ filler id:row-group-country-Netherlands ag-Grid-AutoColumn:"Netherlands"
                        · └─┬ LEAF_GROUP id:row-group-country-Netherlands-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        · · └── LEAF id:19 ag-Grid-AutoColumn:"Inge de Bruijn" country:"Netherlands" sport:"Swimming" age:30 year:2004 date:"29/08/2004"
                    `
                );

                await waitForEvent('firstDataRendered', api);

                actions.toggleCheckboxByIndex(1); // select swimming group
                const expectedRowIds = [
                    'row-group-country-United States-sport-Swimming',
                    '0',
                    '1',
                    '2',
                    '3',
                    '6',
                    '7',
                    '8',
                    '9',
                    '11',
                    '18',
                ];
                assertSelectedRowElementsById(expectedRowIds, api);

                const newRowData = {
                    athlete: 'Foo',
                    age: 99,
                    country: 'United States',
                    year: 1982,
                    date: '11/11/1982',
                    sport: 'Swimming',
                    gold: 99,
                    silver: 0,
                    bronze: 0,
                    total: 99,
                };

                // add new row to swimming group
                applyTransactionChecked(api, { add: [newRowData], addIndex: 2 });

                // expect swimming group row to no longer be selected
                assertSelectedRowElementsById(expectedRowIds.slice(1), api);

                // remove new row
                applyTransactionChecked(api, { remove: [newRowData] });

                // expect swimming group to be selected again
                assertSelectedRowElementsById(expectedRowIds, api);
                await new GridRows(api, `group selection state updated after add and remove transaction final state`)
                    .check(`
                        ROOT id:ROOT_NODE_ID
                        ├─┬ filler indeterminate id:"row-group-country-United States" ag-Grid-AutoColumn:"United States"
                        │ ├─┬ LEAF_GROUP selected id:"row-group-country-United States-sport-Swimming" ag-Grid-AutoColumn:"Swimming"
                        │ │ ├── LEAF selected id:0 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                        │ │ ├── LEAF selected id:1 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:19 year:2004 date:"29/08/2004"
                        │ │ ├── LEAF selected id:2 ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF selected id:3 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:25 year:2008 date:"24/08/2008"
                        │ │ ├── LEAF selected id:6 ag-Grid-AutoColumn:"Missy Franklin" country:"United States" sport:"Swimming" age:17 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF selected id:7 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF selected id:8 ag-Grid-AutoColumn:"Allison Schmitt" country:"United States" sport:"Swimming" age:22 year:2012 date:"12/08/2012"
                        │ │ ├── LEAF selected id:9 ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:21 year:2004 date:"29/08/2004"
                        │ │ ├── LEAF selected id:11 ag-Grid-AutoColumn:"Dara Torres" country:"United States" sport:"Swimming" age:33 year:2000 date:"01/10/2000"
                        │ │ └── LEAF selected id:18 ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                        │ └─┬ LEAF_GROUP id:"row-group-country-United States-sport-Gymnastics" ag-Grid-AutoColumn:"Gymnastics"
                        │ · ├── LEAF id:13 ag-Grid-AutoColumn:"Nastia Liukin" country:"United States" sport:"Gymnastics" age:18 year:2008 date:"24/08/2008"
                        │ · └── LEAF id:20 ag-Grid-AutoColumn:"Justin Spring" country:"United States" sport:"Gymnastics" age:25 year:2008 date:"24/08/2008"
                        ├─┬ filler id:row-group-country-Russia ag-Grid-AutoColumn:"Russia"
                        │ └─┬ LEAF_GROUP id:row-group-country-Russia-sport-Gymnastics ag-Grid-AutoColumn:"Gymnastics"
                        │ · └── LEAF id:4 ag-Grid-AutoColumn:"Aleksey Nemov" country:"Russia" sport:"Gymnastics" age:24 year:2000 date:"01/10/2000"
                        ├─┬ filler id:row-group-country-Australia ag-Grid-AutoColumn:"Australia"
                        │ └─┬ LEAF_GROUP id:row-group-country-Australia-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        │ · ├── LEAF id:5 ag-Grid-AutoColumn:"Alicia Coutts" country:"Australia" sport:"Swimming" age:24 year:2012 date:"12/08/2012"
                        │ · ├── LEAF id:10 ag-Grid-AutoColumn:"Ian Thorpe" country:"Australia" sport:"Swimming" age:17 year:2000 date:"01/10/2000"
                        │ · └── LEAF id:17 ag-Grid-AutoColumn:"Libby Lenton-Trickett" country:"Australia" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                        ├─┬ filler id:row-group-country-Canada ag-Grid-AutoColumn:"Canada"
                        │ └─┬ LEAF_GROUP id:"row-group-country-Canada-sport-Speed Skating" ag-Grid-AutoColumn:"Speed Skating"
                        │ · └── LEAF id:12 ag-Grid-AutoColumn:"Cindy Klassen" country:"Canada" sport:"Speed Skating" age:26 year:2006 date:"26/02/2006"
                        ├─┬ filler id:row-group-country-Norway ag-Grid-AutoColumn:"Norway"
                        │ └─┬ LEAF_GROUP id:"row-group-country-Norway-sport-Cross Country Skiing" ag-Grid-AutoColumn:"Cross Country Skiing"
                        │ · └── LEAF id:14 ag-Grid-AutoColumn:"Marit Bjørgen" country:"Norway" sport:"Cross Country Skiing" age:29 year:2010 date:"28/02/2010"
                        ├─┬ filler id:row-group-country-China ag-Grid-AutoColumn:"China"
                        │ └─┬ LEAF_GROUP id:row-group-country-China-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        │ · └── LEAF id:15 ag-Grid-AutoColumn:"Sun Yang" country:"China" sport:"Swimming" age:20 year:2012 date:"12/08/2012"
                        ├─┬ filler id:row-group-country-Zimbabwe ag-Grid-AutoColumn:"Zimbabwe"
                        │ └─┬ LEAF_GROUP id:row-group-country-Zimbabwe-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        │ · └── LEAF id:16 ag-Grid-AutoColumn:"Kirsty Coventry" country:"Zimbabwe" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                        └─┬ filler id:row-group-country-Netherlands ag-Grid-AutoColumn:"Netherlands"
                        · └─┬ LEAF_GROUP id:row-group-country-Netherlands-sport-Swimming ag-Grid-AutoColumn:"Swimming"
                        · · └── LEAF id:19 ag-Grid-AutoColumn:"Inge de Bruijn" country:"Netherlands" sport:"Swimming" age:30 year:2004 date:"29/08/2004"
                    `);
            });
        });

        describe('SSRM', () => {
            test('selection state maintained after add transaction', async () => {
                const [api, actions] = createGrid({
                    columnDefs,
                    rowSelection: { mode: 'multiRow' },
                    rowModelType: 'serverSide',
                    getRowId(params) {
                        return params.data.id;
                    },
                    serverSideDatasource: {
                        getRows(params) {
                            return params.success({ rowData, rowCount: rowData.length });
                        },
                    },
                });
                await new GridColumns(api, `selection state maintained after add transaction setup`).checkColumns(`
                    CENTER
                    ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                    └── sport "Sport" width:200
                `);
                await new GridRows(api, `selection state maintained after add transaction setup`).check(`
                    ROOT id:<no-id>
                    └── filler id:rowIndex:0
                `);

                await waitForEvent('firstDataRendered', api);

                actions.selectRowsByIndex([2, 4, 6], false);

                api.applyServerSideTransaction({ add: [{ id: '8', sport: 'lacrosse' }] });
                await new GridRows(
                    api,
                    `selection state maintained after add transaction after applyServerSideTransaction`
                ).check(`
                    ROOT id:<no-id>
                    ├── LEAF id:1 sport:"football"
                    ├── LEAF id:2 sport:"rugby"
                    ├── LEAF selected id:3 sport:"tennis"
                    ├── LEAF id:4 sport:"cricket"
                    ├── LEAF selected id:5 sport:"golf"
                    ├── LEAF id:6 sport:"swimming"
                    ├── LEAF selected id:7 sport:"rowing"
                    └── LEAF id:8 sport:"lacrosse"
                `);

                assertSelectedRowsByIndex([2, 4, 6], api);
            });

            test('selection state maintained after update transaction', async () => {
                const [api, actions] = createGrid({
                    columnDefs,
                    rowSelection: { mode: 'multiRow' },
                    rowModelType: 'serverSide',
                    getRowId(params) {
                        return params.data.id;
                    },
                    serverSideDatasource: {
                        getRows(params) {
                            return params.success({ rowData, rowCount: rowData.length });
                        },
                    },
                });
                await new GridColumns(api, `selection state maintained after update transaction setup`).checkColumns(
                    `
                        CENTER
                        ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                        └── sport "Sport" width:200
                    `
                );
                await new GridRows(api, `selection state maintained after update transaction setup`).check(`
                    ROOT id:<no-id>
                    └── filler id:rowIndex:0
                `);

                await waitForEvent('firstDataRendered', api);

                actions.selectRowsByIndex([2, 4, 6], false);

                applyTransactionChecked(api, { update: [{ id: '7', sport: 'lacrosse' }] });

                assertSelectedRowsByIndex([2, 4, 6], api);
                await new GridRows(api, `selection state maintained after update transaction final state`).check(`
                    ROOT id:<no-id>
                    ├── LEAF id:1 sport:"football"
                    ├── LEAF id:2 sport:"rugby"
                    ├── LEAF selected id:3 sport:"tennis"
                    ├── LEAF id:4 sport:"cricket"
                    ├── LEAF selected id:5 sport:"golf"
                    ├── LEAF id:6 sport:"swimming"
                    └── LEAF selected id:7 sport:"rowing"
                `);
            });

            test('selection state updated after remove transaction', async () => {
                const [api, actions] = createGrid({
                    columnDefs,
                    rowSelection: { mode: 'multiRow' },
                    rowModelType: 'serverSide',
                    getRowId(params) {
                        return params.data.id;
                    },
                    serverSideDatasource: {
                        getRows(params) {
                            return params.success({ rowData, rowCount: rowData.length });
                        },
                    },
                });
                await new GridColumns(api, `selection state updated after remove transaction setup`).checkColumns(`
                    CENTER
                    ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                    └── sport "Sport" width:200
                `);
                await new GridRows(api, `selection state updated after remove transaction setup`).check(`
                    ROOT id:<no-id>
                    └── filler id:rowIndex:0
                `);

                await waitForEvent('firstDataRendered', api);

                actions.selectRowsByIndex([2, 4, 6], false);

                api.applyServerSideTransaction({ remove: rowData.slice(-1) });
                await new GridRows(
                    api,
                    `selection state updated after remove transaction after applyServerSideTransaction`
                ).check(`
                    ROOT id:<no-id>
                    ├── LEAF id:1 sport:"football"
                    ├── LEAF id:2 sport:"rugby"
                    ├── LEAF selected id:3 sport:"tennis"
                    ├── LEAF id:4 sport:"cricket"
                    ├── LEAF selected id:5 sport:"golf"
                    └── LEAF id:6 sport:"swimming"
                `);

                assertSelectedRowsByIndex([2, 4], api);
            });

            test('group selection state updated after add and remove transaction', async () => {
                function getRowIdRaw(params: Pick<GetRowIdParams, 'api' | 'data' | 'parentKeys'>) {
                    return getRowId({ ...params, level: -1, context: {} });
                }
                function getRowId(params: GetRowIdParams): string {
                    return (params.parentKeys ?? []).join('-') + ':' + JSON.stringify(params.data);
                }
                const groupGridOptions: Partial<GridOptions> = {
                    columnDefs: [
                        { field: 'country', rowGroup: true, hide: true },
                        { field: 'sport' },
                        { field: 'age' },
                        { field: 'year' },
                        { field: 'date' },
                    ],
                    autoGroupColumnDef: {
                        headerName: 'Athlete',
                        field: 'athlete',
                        cellRenderer: 'agGroupCellRenderer',
                    },
                    getRowId,
                    rowModelType: 'serverSide',
                    serverSideDatasource: {
                        getRows(params) {
                            const data = fakeFetch(params.request);
                            return params.success({ rowData: data, rowCount: data.length });
                        },
                    },
                };

                const [api, actions] = createGrid({
                    ...groupGridOptions,
                    rowSelection: { mode: 'multiRow', groupSelects: 'descendants' },
                });
                await new GridColumns(api, `group selection state updated after add and remove transaction setup`)
                    .checkColumns(`
                        CENTER
                        ├── ag-Grid-SelectionColumn width:50 !resizable !sortable suppressMovable lockPosition:left
                        ├── ag-Grid-AutoColumn "Athlete" width:200
                        ├── sport "Sport" width:200
                        ├── age "Age" width:200
                        ├── year "Year" width:200
                        └── date "Date" width:200
                    `);
                await new GridRows(api, `group selection state updated after add and remove transaction setup`).check(
                    `
                        ROOT id:<no-id>
                        └── LEAF_GROUP collapsed id:rowIndex:0
                    `
                );

                await waitForEvent('firstDataRendered', api);

                await actions.expandGroupRowByIndex(0);

                actions.toggleCheckboxByIndex(0); // select USA group

                const expectedRowIds = [
                    { data: { country: 'United States' } },
                    ...GROUP_ROW_DATA.filter((d) => d.country === 'United States').map((d) => ({
                        parentKeys: ['United States'],
                        data: d,
                    })),
                ].map((d) => getRowIdRaw({ ...d, api }));
                assertSelectedRowElementsById(expectedRowIds, api);

                const newRowData = {
                    athlete: 'Foo',
                    age: 99,
                    country: 'United States',
                    year: 1982,
                    date: '11/11/1982',
                    sport: 'Swimming',
                    gold: 99,
                    silver: 0,
                    bronze: 0,
                    total: 99,
                };

                // add new row to USA group
                api.applyServerSideTransaction({ route: ['United States'], add: [newRowData] });
                await new GridRows(
                    api,
                    `group selection state updated after add and remove transaction after applyServerSideTransaction`
                ).check(`
                    ROOT id:<no-id>
                    ├─┬ GROUP-leafGroup selected id:':{"country":"United States"}' ag-Grid-AutoColumn:"United States" country:"United States"
                    │ ├── LEAF selected id:'United States:{"athlete":"Michael Phelps","age":23,"country":"United States","year":2008,"date":"24/08/2008","sport":"Swimming","gold":8,"silver":0,"bronze":0,"total":8}' ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                    │ ├── LEAF selected id:'United States:{"athlete":"Michael Phelps","age":19,"country":"United States","year":2004,"date":"29/08/2004","sport":"Swimming","gold":6,"silver":0,"bronze":2,"total":8}' ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:19 year:2004 date:"29/08/2004"
                    │ ├── LEAF selected id:'United States:{"athlete":"Michael Phelps","age":27,"country":"United States","year":2012,"date":"12/08/2012","sport":"Swimming","gold":4,"silver":2,"bronze":0,"total":6}' ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                    │ ├── LEAF selected id:'United States:{"athlete":"Natalie Coughlin","age":25,"country":"United States","year":2008,"date":"24/08/2008","sport":"Swimming","gold":1,"silver":2,"bronze":3,"total":6}' ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:25 year:2008 date:"24/08/2008"
                    │ ├── LEAF selected id:'United States:{"athlete":"Missy Franklin","age":17,"country":"United States","year":2012,"date":"12/08/2012","sport":"Swimming","gold":4,"silver":0,"bronze":1,"total":5}' ag-Grid-AutoColumn:"Missy Franklin" country:"United States" sport:"Swimming" age:17 year:2012 date:"12/08/2012"
                    │ ├── LEAF selected id:'United States:{"athlete":"Ryan Lochte","age":27,"country":"United States","year":2012,"date":"12/08/2012","sport":"Swimming","gold":2,"silver":2,"bronze":1,"total":5}' ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                    │ ├── LEAF selected id:'United States:{"athlete":"Allison Schmitt","age":22,"country":"United States","year":2012,"date":"12/08/2012","sport":"Swimming","gold":3,"silver":1,"bronze":1,"total":5}' ag-Grid-AutoColumn:"Allison Schmitt" country:"United States" sport:"Swimming" age:22 year:2012 date:"12/08/2012"
                    │ ├── LEAF selected id:'United States:{"athlete":"Natalie Coughlin","age":21,"country":"United States","year":2004,"date":"29/08/2004","sport":"Swimming","gold":2,"silver":2,"bronze":1,"total":5}' ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:21 year:2004 date:"29/08/2004"
                    │ ├── LEAF selected id:'United States:{"athlete":"Dara Torres","age":33,"country":"United States","year":2000,"date":"01/10/2000","sport":"Swimming","gold":2,"silver":0,"bronze":3,"total":5}' ag-Grid-AutoColumn:"Dara Torres" country:"United States" sport:"Swimming" age:33 year:2000 date:"01/10/2000"
                    │ ├── LEAF selected id:'United States:{"athlete":"Nastia Liukin","age":18,"country":"United States","year":2008,"date":"24/08/2008","sport":"Gymnastics","gold":1,"silver":3,"bronze":1,"total":5}' ag-Grid-AutoColumn:"Nastia Liukin" country:"United States" sport:"Gymnastics" age:18 year:2008 date:"24/08/2008"
                    │ ├── LEAF selected id:'United States:{"athlete":"Ryan Lochte","age":24,"country":"United States","year":2008,"date":"24/08/2008","sport":"Swimming","gold":2,"silver":0,"bronze":2,"total":4}' ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                    │ ├── LEAF selected id:'United States:{"athlete":"Justin Spring","age":25,"country":"United States","year":2008,"date":"24/08/2008","sport":"Gymnastics","gold":1,"silver":3,"bronze":1,"total":5}' ag-Grid-AutoColumn:"Justin Spring" country:"United States" sport:"Gymnastics" age:25 year:2008 date:"24/08/2008"
                    │ └── LEAF selected id:'United States:{"athlete":"Foo","age":99,"country":"United States","year":1982,"date":"11/11/1982","sport":"Swimming","gold":99,"silver":0,"bronze":0,"total":99}' ag-Grid-AutoColumn:"Foo" country:"United States" sport:"Swimming" age:99 year:1982 date:"11/11/1982"
                    ├── GROUP-leafGroup collapsed id:':{"country":"Russia"}' ag-Grid-AutoColumn:"Russia" country:"Russia"
                    ├── GROUP-leafGroup collapsed id:':{"country":"Australia"}' ag-Grid-AutoColumn:"Australia" country:"Australia"
                    ├── GROUP-leafGroup collapsed id:':{"country":"Canada"}' ag-Grid-AutoColumn:"Canada" country:"Canada"
                    ├── GROUP-leafGroup collapsed id:':{"country":"Norway"}' ag-Grid-AutoColumn:"Norway" country:"Norway"
                    ├── GROUP-leafGroup collapsed id:':{"country":"China"}' ag-Grid-AutoColumn:"China" country:"China"
                    ├── GROUP-leafGroup collapsed id:':{"country":"Zimbabwe"}' ag-Grid-AutoColumn:"Zimbabwe" country:"Zimbabwe"
                    └── GROUP-leafGroup collapsed id:':{"country":"Netherlands"}' ag-Grid-AutoColumn:"Netherlands" country:"Netherlands"
                `);

                // expect swimming group row to no longer be selected
                assertSelectedRowElementsById(
                    expectedRowIds
                        .slice(0, 3)
                        .concat(getRowIdRaw({ parentKeys: ['United States'], data: newRowData, api }))
                        .concat(expectedRowIds.slice(3)),
                    api
                );

                // remove new row
                api.applyServerSideTransaction({ route: ['United States'], remove: [newRowData] });
                await new GridRows(
                    api,
                    `group selection state updated after add and remove transaction after applyServerSideTransaction #2`
                ).check(`
                    ROOT id:<no-id>
                    ├─┬ GROUP-leafGroup indeterminate id:':{"country":"United States"}' ag-Grid-AutoColumn:"United States" country:"United States"
                    │ ├── LEAF selected id:'United States:{"athlete":"Michael Phelps","age":23,"country":"United States","year":2008,"date":"24/08/2008","sport":"Swimming","gold":8,"silver":0,"bronze":0,"total":8}' ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:23 year:2008 date:"24/08/2008"
                    │ ├── LEAF selected id:'United States:{"athlete":"Michael Phelps","age":19,"country":"United States","year":2004,"date":"29/08/2004","sport":"Swimming","gold":6,"silver":0,"bronze":2,"total":8}' ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:19 year:2004 date:"29/08/2004"
                    │ ├── LEAF selected id:'United States:{"athlete":"Michael Phelps","age":27,"country":"United States","year":2012,"date":"12/08/2012","sport":"Swimming","gold":4,"silver":2,"bronze":0,"total":6}' ag-Grid-AutoColumn:"Michael Phelps" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                    │ ├── LEAF selected id:'United States:{"athlete":"Natalie Coughlin","age":25,"country":"United States","year":2008,"date":"24/08/2008","sport":"Swimming","gold":1,"silver":2,"bronze":3,"total":6}' ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:25 year:2008 date:"24/08/2008"
                    │ ├── LEAF selected id:'United States:{"athlete":"Missy Franklin","age":17,"country":"United States","year":2012,"date":"12/08/2012","sport":"Swimming","gold":4,"silver":0,"bronze":1,"total":5}' ag-Grid-AutoColumn:"Missy Franklin" country:"United States" sport:"Swimming" age:17 year:2012 date:"12/08/2012"
                    │ ├── LEAF selected id:'United States:{"athlete":"Ryan Lochte","age":27,"country":"United States","year":2012,"date":"12/08/2012","sport":"Swimming","gold":2,"silver":2,"bronze":1,"total":5}' ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:27 year:2012 date:"12/08/2012"
                    │ ├── LEAF selected id:'United States:{"athlete":"Allison Schmitt","age":22,"country":"United States","year":2012,"date":"12/08/2012","sport":"Swimming","gold":3,"silver":1,"bronze":1,"total":5}' ag-Grid-AutoColumn:"Allison Schmitt" country:"United States" sport:"Swimming" age:22 year:2012 date:"12/08/2012"
                    │ ├── LEAF selected id:'United States:{"athlete":"Natalie Coughlin","age":21,"country":"United States","year":2004,"date":"29/08/2004","sport":"Swimming","gold":2,"silver":2,"bronze":1,"total":5}' ag-Grid-AutoColumn:"Natalie Coughlin" country:"United States" sport:"Swimming" age:21 year:2004 date:"29/08/2004"
                    │ ├── LEAF selected id:'United States:{"athlete":"Dara Torres","age":33,"country":"United States","year":2000,"date":"01/10/2000","sport":"Swimming","gold":2,"silver":0,"bronze":3,"total":5}' ag-Grid-AutoColumn:"Dara Torres" country:"United States" sport:"Swimming" age:33 year:2000 date:"01/10/2000"
                    │ ├── LEAF selected id:'United States:{"athlete":"Nastia Liukin","age":18,"country":"United States","year":2008,"date":"24/08/2008","sport":"Gymnastics","gold":1,"silver":3,"bronze":1,"total":5}' ag-Grid-AutoColumn:"Nastia Liukin" country:"United States" sport:"Gymnastics" age:18 year:2008 date:"24/08/2008"
                    │ ├── LEAF selected id:'United States:{"athlete":"Ryan Lochte","age":24,"country":"United States","year":2008,"date":"24/08/2008","sport":"Swimming","gold":2,"silver":0,"bronze":2,"total":4}' ag-Grid-AutoColumn:"Ryan Lochte" country:"United States" sport:"Swimming" age:24 year:2008 date:"24/08/2008"
                    │ └── LEAF selected id:'United States:{"athlete":"Justin Spring","age":25,"country":"United States","year":2008,"date":"24/08/2008","sport":"Gymnastics","gold":1,"silver":3,"bronze":1,"total":5}' ag-Grid-AutoColumn:"Justin Spring" country:"United States" sport:"Gymnastics" age:25 year:2008 date:"24/08/2008"
                    ├── GROUP-leafGroup collapsed id:':{"country":"Russia"}' ag-Grid-AutoColumn:"Russia" country:"Russia"
                    ├── GROUP-leafGroup collapsed id:':{"country":"Australia"}' ag-Grid-AutoColumn:"Australia" country:"Australia"
                    ├── GROUP-leafGroup collapsed id:':{"country":"Canada"}' ag-Grid-AutoColumn:"Canada" country:"Canada"
                    ├── GROUP-leafGroup collapsed id:':{"country":"Norway"}' ag-Grid-AutoColumn:"Norway" country:"Norway"
                    ├── GROUP-leafGroup collapsed id:':{"country":"China"}' ag-Grid-AutoColumn:"China" country:"China"
                    ├── GROUP-leafGroup collapsed id:':{"country":"Zimbabwe"}' ag-Grid-AutoColumn:"Zimbabwe" country:"Zimbabwe"
                    └── GROUP-leafGroup collapsed id:':{"country":"Netherlands"}' ag-Grid-AutoColumn:"Netherlands" country:"Netherlands"
                `);

                // NOTE: This test encodes the current behaviour but it's possibly a bug:
                // in CSRM one would expect swimming group to be selected again.
                // This could just be a limitation of SSRM?
                assertSelectedRowElementsById(expectedRowIds.slice(1), api);
            });
        });
    });
});
