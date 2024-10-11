import type { MockInstance } from 'vitest';

import type { GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule } from 'ag-grid-community';
import { MasterDetailModule } from 'ag-grid-enterprise';

import type { GridRowsOptions } from '../test-utils';
import { GridRows, TestGridsManager } from '../test-utils';

describe('ag-grid master detail', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, MasterDetailModule],
    });
    let consoleErrorSpy: MockInstance | undefined;

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
        consoleErrorSpy?.mockRestore();
    });

    test('masterDetail not expanded', async () => {
        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'k' }],
            masterDetail: true,
            rowData: [{ k: '1', records: [{ x: 'a' }] }],
            detailCellRendererParams: {
                detailGridOptions: {
                    columnDefs: [{ field: 'x' }],
                },
                getDetailRowData: (params) => {
                    params.successCallback(params.data.records);
                },
            },
        };

        const api = gridsManager.createGrid('myGrid', gridOptions);

        const gridRows = new GridRows(api, 'data', {
            columns: ['k'],
        });
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            └── master collapsed id:0 k:"1"
        `);
    });

    test('masterDetail all expanded', async () => {
        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'k' }],
            masterDetail: true,
            rowData: [
                { k: '1', records: [{ x: 'a' }] },
                { k: '2', records: [{ x: 'a' }, { x: 'b' }, { x: 'c' }] },
                { k: '3', records: [{ x: 'x' }, { x: 'y' }] },
            ],
            groupDefaultExpanded: -1,
            detailCellRendererParams: {
                detailGridOptions: {
                    columnDefs: [{ field: 'x' }],
                },
                getDetailRowData: (params) => {
                    params.successCallback(params.data.records);
                },
            },
        };

        const api = gridsManager.createGrid('myGrid', gridOptions);

        const gridRows = new GridRows(api, 'data', {
            columns: ['k'],
        });
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ master id:0 k:"1"
            │ └─┬ detail id:detail_0 k:"1"
            │ · └─┬ ROOT id:ROOT_NODE_ID
            │ · · └── LEAF id:0 x:"a"
            ├─┬ master id:1 k:"2"
            │ └─┬ detail id:detail_1 k:"2"
            │ · └─┬ ROOT id:ROOT_NODE_ID
            │ · · ├── LEAF id:0 x:"a"
            │ · · ├── LEAF id:1 x:"b"
            │ · · └── LEAF id:2 x:"c"
            └─┬ master id:2 k:"3"
            · └─┬ detail id:detail_2 k:"3"
            · · └─┬ ROOT id:ROOT_NODE_ID
            · · · ├── LEAF id:0 x:"x"
            · · · └── LEAF id:1 x:"y"
        `);
    });

    test('masterDetail property is reactive', async () => {
        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'k' }],
            rowData: [{ k: '1', records: [{ x: 'a' }, { x: 'b' }] }],
            groupDefaultExpanded: -1,
            detailCellRendererParams: {
                detailGridOptions: {
                    columnDefs: [{ field: 'x' }],
                },
                getDetailRowData: (params) => {
                    params.successCallback(params.data.records);
                },
            },
        };

        const api = gridsManager.createGrid('myGrid', gridOptions);

        const gridRowsOptions: GridRowsOptions = {
            columns: ['k'],
            printHiddenRows: true,
        };

        let gridRows = new GridRows(api, 'data', gridRowsOptions);
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 k:"1"
        `);

        consoleErrorSpy = vitest.spyOn(console, 'error').mockImplementation(() => {});
        api.setGridOption('masterDetail', true);
        consoleErrorSpy.mockRestore();

        gridRows = new GridRows(api, 'data', gridRowsOptions);
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            └─┬ master id:0 k:"1"
            · └─┬ detail id:detail_0 k:"1"
            · · └─┬ ROOT id:ROOT_NODE_ID
            · · · ├── LEAF id:0 x:"a"
            · · · └── LEAF id:1 x:"b"
        `);

        api.setGridOption('masterDetail', false);

        gridRows = new GridRows(api, 'data', gridRowsOptions);
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 k:"1"
        `);
    });

    test('masterDetail set rowData (without id)', async () => {
        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'k' }],
            rowData: [{ k: '1', records: [{ x: 'a' }] }],
            groupDefaultExpanded: -1,
            masterDetail: true,
            detailCellRendererParams: {
                detailGridOptions: {
                    columnDefs: [{ field: 'x' }],
                },
                getDetailRowData: (params) => {
                    params.successCallback(params.data.records);
                },
            },
        };

        const api = gridsManager.createGrid('myGrid', gridOptions);

        const gridRowsOptions: GridRowsOptions = {
            columns: ['k'],
        };

        let gridRows = new GridRows(api, 'data', gridRowsOptions);
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            └─┬ master id:0 k:"1"
            · └─┬ detail id:detail_0 k:"1"
            · · └─┬ ROOT id:ROOT_NODE_ID
            · · · └── LEAF id:0 x:"a"
        `);

        consoleErrorSpy = vitest.spyOn(console, 'error').mockImplementation(() => {});

        api.setGridOption('rowData', [{ k: '2', records: [{ x: 'a' }, { x: 'b' }] }]);

        consoleErrorSpy.mockRestore();

        gridRows = new GridRows(api, 'data', gridRowsOptions);
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            └─┬ master id:0 k:"2"
            · └─┬ detail id:detail_0 k:"2"
            · · └─┬ ROOT id:ROOT_NODE_ID
            · · · ├── LEAF id:0 x:"a"
            · · · └── LEAF id:1 x:"b"
        `);
    });

    test('masterDetail set rowData (with id)', async () => {
        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'k' }],
            rowData: [
                {
                    id: 'master',
                    k: '1',
                    records: [
                        { id: 'detail1', x: 1 },
                        { id: 'detail2', x: 1 },
                    ],
                },
            ],
            groupDefaultExpanded: -1,
            masterDetail: true,
            detailCellRendererParams: {
                detailGridOptions: {
                    columnDefs: [{ field: 'x' }],
                    getRowId: ({ data }) => data.id,
                },
                getDetailRowData: (params) => {
                    params.successCallback(params.data.records);
                },
            },
            getRowId: ({ data }) => data.id,
        };

        const api = gridsManager.createGrid('myGrid', gridOptions);

        const gridRowsOptions: GridRowsOptions = {
            columns: ['k'],
        };

        let gridRows = new GridRows(api, 'data', gridRowsOptions);
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            └─┬ master id:master k:"1"
            · └─┬ detail id:detail_master k:"1"
            · · └─┬ ROOT id:ROOT_NODE_ID
            · · · ├── LEAF id:detail1 x:1
            · · · └── LEAF id:detail2 x:1
        `);

        consoleErrorSpy = vitest.spyOn(console, 'error').mockImplementation(() => {});

        api.setGridOption('rowData', [
            {
                id: 'master',
                k: '2',
                records: [{ id: 'detail1', x: 2 }],
            },
        ]);

        consoleErrorSpy.mockRestore();

        gridRows = new GridRows(api, 'data', gridRowsOptions);
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            └─┬ master id:master k:"2"
            · └─┬ detail id:detail_master k:"2"
            · · └─┬ ROOT id:ROOT_NODE_ID
            · · · └── LEAF id:detail1 x:2
        `);
    });

    test('masterDetail transactions', async () => {
        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'k' }],
            rowData: [
                {
                    id: 'x0',
                    k: 'a0',
                    records: [
                        { id: 'y1', x: 'a1' },
                        { id: 'y2', x: 'a2' },
                    ],
                },
                {
                    id: 'x1',
                    k: 'a0',
                    records: [
                        { id: 'y1', x: 'a1' },
                        { id: 'y2', x: 'a2' },
                    ],
                },
            ],
            groupDefaultExpanded: -1,
            masterDetail: true,
            detailCellRendererParams: {
                detailGridOptions: {
                    columnDefs: [{ field: 'x' }],
                    getRowId: ({ data }) => data.id,
                },
                getDetailRowData: (params) => {
                    params.successCallback(params.data.records);
                },
            },
            getRowId: ({ data }) => data.id,
        };

        const api = gridsManager.createGrid('myGrid', gridOptions);

        const gridRowsOptions: GridRowsOptions = {
            columns: ['k'],
        };

        let gridRows = new GridRows(api, 'data', gridRowsOptions);
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ master id:x0 k:"a0"
            │ └─┬ detail id:detail_x0 k:"a0"
            │ · └─┬ ROOT id:ROOT_NODE_ID
            │ · · ├── LEAF id:y1 x:"a1"
            │ · · └── LEAF id:y2 x:"a2"
            └─┬ master id:x1 k:"a0"
            · └─┬ detail id:detail_x1 k:"a0"
            · · └─┬ ROOT id:ROOT_NODE_ID
            · · · ├── LEAF id:y1 x:"a1"
            · · · └── LEAF id:y2 x:"a2"
        `);

        consoleErrorSpy = vitest.spyOn(console, 'error').mockImplementation(() => {});

        api.applyTransaction({
            remove: [{ id: 'x0' }],
            add: [{ id: 'x2', k: 'a2', records: [{ id: 's', x: 't' }] }],
            update: [{ id: 'x1', k: 'a1', records: [{ id: 'y1', x: 'a1' }] }],
        });

        consoleErrorSpy.mockRestore();

        gridRows = new GridRows(api, 'data', gridRowsOptions);
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ master id:x1 k:"a1"
            │ └─┬ detail id:detail_x1 k:"a1"
            │ · └─┬ ROOT id:ROOT_NODE_ID
            │ · · └── LEAF id:y1 x:"a1"
            └─┬ master id:x2 k:"a2"
            · └─┬ detail id:detail_x2 k:"a2"
            · · └─┬ ROOT id:ROOT_NODE_ID
            · · · └── LEAF id:s x:"t"
        `);
    });

    test('masterDetail expand/collapse', async () => {
        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'k' }],
            rowData: [{ k: '1', records: [{ x: 'a' }] }],
            groupDefaultExpanded: -1,
            masterDetail: true,
            detailCellRendererParams: {
                detailGridOptions: {
                    columnDefs: [{ field: 'x' }],
                },
                getDetailRowData: (params) => {
                    params.successCallback(params.data.records);
                },
            },
        };

        const api = gridsManager.createGrid('myGrid', gridOptions);

        const gridRowsOptions: GridRowsOptions = {
            columns: ['k'],
        };

        let gridRows = new GridRows(api, 'data', gridRowsOptions);
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            └─┬ master id:0 k:"1"
            · └─┬ detail id:detail_0 k:"1"
            · · └─┬ ROOT id:ROOT_NODE_ID
            · · · └── LEAF id:0 x:"a"
        `);

        consoleErrorSpy = vitest.spyOn(console, 'error').mockImplementation(() => {});

        api.forEachNode((node) => {
            node.setExpanded(false, undefined, true);
        });

        consoleErrorSpy.mockRestore();

        gridRows = new GridRows(api, 'data', gridRowsOptions);
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            └── master collapsed id:0 k:"1"
        `);

        consoleErrorSpy = vitest.spyOn(console, 'error').mockImplementation(() => {});

        api.forEachNode((node) => {
            node.setExpanded(true, undefined, true);
        });

        consoleErrorSpy.mockRestore();

        gridRows = new GridRows(api, 'data', gridRowsOptions);
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            └─┬ master id:0 k:"1"
            · └─┬ detail id:detail_0 k:"1"
            · · └─┬ ROOT id:ROOT_NODE_ID
            · · · └── LEAF id:0 x:"a"
        `);
    });
});
