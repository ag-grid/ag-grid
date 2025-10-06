import type { MockInstance } from 'vitest';

import { ClientSideRowModelModule } from 'ag-grid-community';
import type { GridOptions } from 'ag-grid-community';
import { TreeDataModule } from 'ag-grid-enterprise';

import { GridRows, TestGridsManager, asyncSetTimeout, getRowsSnapshot } from '../../test-utils';
import type { GridRowsOptions } from '../../test-utils';
import { simpleParentIdRowsSnapshot } from './simpleParentIdRowsSnapshot';

describe('ag-grid tree data parent id', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, TreeDataModule],
    });

    let consoleWarnSpy: MockInstance;

    function hasLoadingOverlay() {
        return !!document.querySelector('.ag-overlay-loading-center');
    }

    function hasNoRowsOverlay() {
        return !!document.querySelector('.ag-overlay-no-rows-center');
    }

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
        consoleWarnSpy?.mockRestore();
    });

    test('ag-grid tree data parent-id loading and no-show overlay', async () => {
        const rowData = [
            { id: 'A', x: 'a' },
            { id: 'B', parentId: 'A', x: 'a-b' },
            { id: 'C', x: 'c' },
            { id: 'D', parentId: 'C', x: 'c-d' },
            { id: 'E', x: 'e' },
        ];

        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'x' }],
            autoGroupColumnDef: {
                cellRendererParams: { suppressCount: true },
            },
            treeData: true,
            animateRows: false,
            groupDefaultExpanded: -1,
            getRowId: (params) => params.data.id,
            treeDataParentIdField: 'parentId',
        };

        const api = gridsManager.createGrid('myGrid', gridOptions);

        expect(hasLoadingOverlay()).toBe(true);
        expect(hasNoRowsOverlay()).toBe(false);

        api.setGridOption('rowData', []);

        expect(hasLoadingOverlay()).toBe(false);
        expect(hasNoRowsOverlay()).toBe(true);

        api.setGridOption('rowData', rowData);

        expect(hasLoadingOverlay()).toBe(false);
        expect(hasNoRowsOverlay()).toBe(false);

        api.setGridOption('rowData', []);

        await asyncSetTimeout(10);

        expect(hasLoadingOverlay()).toBe(false);
        expect(hasNoRowsOverlay()).toBe(true);
    });

    test('ag-grid tree data parent id', async () => {
        const rowData = [
            { id: 'A', x: 'a' },
            { id: 'B', parentId: 'A', x: 'a-b' },
            { id: 'C', x: 'c' },
            { id: 'D', parentId: 'C', x: 'c-d' },
            { id: 'E', x: 'e' },
            { id: 'F', parentId: 'E', x: 'e-f' },
            { id: 'G', parentId: 'F', x: 'e-f-g' },
            { id: 'H', parentId: 'G', x: 'e-f-g-h' },
        ];

        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'x' }],
            autoGroupColumnDef: { cellRendererParams: { suppressCount: true } },
            animateRows: false,
            groupDefaultExpanded: -1,
            rowData,
            getRowId: (params) => params.data.id,
            treeData: true,
            treeDataParentIdField: 'parentId',
        };

        const api = gridsManager.createGrid('myGrid', gridOptions);

        const gridRowsOptions: GridRowsOptions = {
            columns: true,
            checkDom: true,
        };

        const gridRows = new GridRows(api, 'data', gridRowsOptions);
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ A GROUP id:A ag-Grid-AutoColumn:"A" x:"a"
            │ └── B LEAF id:B ag-Grid-AutoColumn:"B" x:"a-b"
            ├─┬ C GROUP id:C ag-Grid-AutoColumn:"C" x:"c"
            │ └── D LEAF id:D ag-Grid-AutoColumn:"D" x:"c-d"
            └─┬ E GROUP id:E ag-Grid-AutoColumn:"E" x:"e"
            · └─┬ F GROUP id:F ag-Grid-AutoColumn:"F" x:"e-f"
            · · └─┬ G GROUP id:G ag-Grid-AutoColumn:"G" x:"e-f-g"
            · · · └── H LEAF id:H ag-Grid-AutoColumn:"H" x:"e-f-g-h"
        `);

        const rowsSnapshot = getRowsSnapshot(gridRows.rowNodes);
        expect(rowsSnapshot).toMatchObject(simpleParentIdRowsSnapshot());
    });

    test('ag-grid tree data with inverted order', async () => {
        const rowData = [
            { id: 'G', parentId: 'F', x: 'e-f-g' },
            { id: 'C', x: 'c' },
            { id: 'A', x: 'a' },
            { id: 'D', parentId: 'C', x: 'c-d' },
            { id: 'H', parentId: 'G', x: 'e-f-g-h' },
            { id: 'E', x: 'e' },
            { id: 'B', parentId: 'A', x: 'a-b' },
            { id: 'F', parentId: 'E', x: 'e-f' },
        ];

        const gridOptions: GridOptions = {
            columnDefs: [
                {
                    field: 'V',
                    valueGetter: (params) => params.data?.x,
                },
            ],
            autoGroupColumnDef: {
                headerName: 'Organisation Hierarchy',
                cellRendererParams: { suppressCount: true },
            },
            animateRows: false,
            groupDefaultExpanded: -1,
            rowData,
            getRowId: (params) => params.data.id,
            treeData: true,
            treeDataParentIdField: 'parentId',
        };

        const api = gridsManager.createGrid('myGrid', gridOptions);

        const gridRowsOptions: GridRowsOptions = {
            columns: true,
            checkDom: true,
        };

        const gridRows = new GridRows(api, 'data', gridRowsOptions);
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ C GROUP id:C ag-Grid-AutoColumn:"C" V:"c"
            │ └── D LEAF id:D ag-Grid-AutoColumn:"D" V:"c-d"
            ├─┬ A GROUP id:A ag-Grid-AutoColumn:"A" V:"a"
            │ └── B LEAF id:B ag-Grid-AutoColumn:"B" V:"a-b"
            └─┬ E GROUP id:E ag-Grid-AutoColumn:"E" V:"e"
            · └─┬ F GROUP id:F ag-Grid-AutoColumn:"F" V:"e-f"
            · · └─┬ G GROUP id:G ag-Grid-AutoColumn:"G" V:"e-f-g"
            · · · └── H LEAF id:H ag-Grid-AutoColumn:"H" V:"e-f-g-h"
        `);
    });

    test('ag-grid override tree data is insensitive to updateGridOptions object order', async () => {
        // see https://ag-grid.atlassian.net/browse/AG-13089 - Order of grouped property listener changed is not deterministic
        const rowData0 = [
            { id: 'A', x: 'A' },
            { id: 'B', parentId: 'A', x: 'B' },
            { id: 'C', x: 'C' },
            { id: 'D', parentId: 'C', x: 'D' },
            { id: 'E', parentId: 'C', x: 'E' },
        ];

        const rowData1 = [
            { id: 'A', x: 'a' },
            { id: 'B', parentId: 'A', x: 'b' },
            { id: 'C', x: 'c' },
            { id: 'D', parentId: 'C', x: 'd' },
            { id: 'E', parentId: 'C', x: 'e' },
        ];

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'x' }],
            animateRows: false,
            groupDefaultExpanded: -1,
            rowData: rowData0,
            getRowId: (params) => params.data.id,
            treeData: false,
            treeDataParentIdField: 'parentId',
        });

        api.updateGridOptions({
            rowData: rowData1,
            treeData: true,
        });

        const gridRowsOptions: GridRowsOptions = {
            checkDom: true,
            columns: true,
        };

        const gridRows = new GridRows(api, 'update 1', gridRowsOptions);
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ A GROUP id:A ag-Grid-AutoColumn:"A" x:"a"
            │ └── B LEAF id:B ag-Grid-AutoColumn:"B" x:"b"
            └─┬ C GROUP id:C ag-Grid-AutoColumn:"C" x:"c"
            · ├── D LEAF id:D ag-Grid-AutoColumn:"D" x:"d"
            · └── E LEAF id:E ag-Grid-AutoColumn:"E" x:"e"
        `);
    });

    test('initializing columns after rowData with tree data', async () => {
        let rowDataUpdated = 0;
        let modelUpdated = 0;
        const gridOptions: GridOptions = {
            groupDefaultExpanded: -1,
            treeData: true,
            treeDataParentIdField: 'parentId',
            getRowId: (params) => params.data.id,
            onRowDataUpdated: () => ++rowDataUpdated,
            onModelUpdated: () => ++modelUpdated,
        };

        const gridRowsOptions: GridRowsOptions = {
            checkDom: true,
            columns: true,
        };

        const api = gridsManager.createGrid('myGrid', gridOptions);

        await asyncSetTimeout(1);
        expect(rowDataUpdated).toBe(0);
        expect(modelUpdated).toBe(0);

        api.setGridOption('rowData', [
            { id: 'a', x: 1 },
            { id: 'c', x: 2 },
            { id: 'e', x: 3 },
            { id: 'f', parentId: 'e', x: 4 },
            { id: 'g', parentId: 'f', x: 5 },
            { id: 'h', parentId: 'g', x: 6 },
            { id: 'b', parentId: 'a', x: 7 },
            { id: 'd', parentId: 'c', x: 8 },
        ]);

        await asyncSetTimeout(1);
        expect(rowDataUpdated).toBe(0);
        expect(modelUpdated).toBe(0);

        await new GridRows(api, 'empty', gridRowsOptions).check('empty');

        api.setGridOption('columnDefs', [{ field: 'xid', valueGetter: (params) => params.data?.id }, { field: 'x' }]);

        await asyncSetTimeout(1);
        expect(rowDataUpdated).toBe(1);
        expect(modelUpdated).toBe(1);

        await new GridRows(api, 'data', gridRowsOptions).check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ a GROUP id:a ag-Grid-AutoColumn:"a" xid:"a" x:1
            │ └── b LEAF id:b ag-Grid-AutoColumn:"b" xid:"b" x:7
            ├─┬ c GROUP id:c ag-Grid-AutoColumn:"c" xid:"c" x:2
            │ └── d LEAF id:d ag-Grid-AutoColumn:"d" xid:"d" x:8
            └─┬ e GROUP id:e ag-Grid-AutoColumn:"e" xid:"e" x:3
            · └─┬ f GROUP id:f ag-Grid-AutoColumn:"f" xid:"f" x:4
            · · └─┬ g GROUP id:g ag-Grid-AutoColumn:"g" xid:"g" x:5
            · · · └── h LEAF id:h ag-Grid-AutoColumn:"h" xid:"h" x:6
        `);
    });

    test('changing group columns updates the row groups', async () => {
        const rowData = [
            { id: 'A', x: 'a', z: 1 },
            { id: 'B', parentId: 'A', x: 'a-b', z: 2 },
            { id: 'C', x: 'c', z: 3 },
            { id: 'D', parentId: 'C', x: 'c-d', z: 4 },
            { id: 'E', x: 'e', z: 5 },
            { id: 'F', parentId: 'E', x: 'e-f', z: 6 },
            { id: 'G', parentId: 'F', x: 'e-f-g', z: 7 },
            { id: 'H', parentId: 'G', x: 'e-f-g-h', z: 8 },
        ];

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'x' }],
            autoGroupColumnDef: { headerName: 'X', colId: 'aaa' },
            animateRows: false,
            groupDefaultExpanded: -1,
            rowData,
            getRowId: (params) => params.data.id,
            treeData: true,
            treeDataParentIdField: 'parentId',
        });

        const gridRowsOptions: GridRowsOptions = {
            columns: true,
            checkDom: true,
        };

        const gridRows = new GridRows(api, 'data', gridRowsOptions);

        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ A GROUP id:A ag-Grid-AutoColumn:"A" x:"a"
            │ └── B LEAF id:B ag-Grid-AutoColumn:"B" x:"a-b"
            ├─┬ C GROUP id:C ag-Grid-AutoColumn:"C" x:"c"
            │ └── D LEAF id:D ag-Grid-AutoColumn:"D" x:"c-d"
            └─┬ E GROUP id:E ag-Grid-AutoColumn:"E" x:"e"
            · └─┬ F GROUP id:F ag-Grid-AutoColumn:"F" x:"e-f"
            · · └─┬ G GROUP id:G ag-Grid-AutoColumn:"G" x:"e-f-g"
            · · · └── H LEAF id:H ag-Grid-AutoColumn:"H" x:"e-f-g-h"
        `);

        api.updateGridOptions({
            columnDefs: [{ field: 'x' }, { field: 'id' }, { field: 'z' }],
            autoGroupColumnDef: { headerName: 'X', field: 'x', colId: 'xxx' },
        });

        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ A GROUP id:A ag-Grid-AutoColumn:"a" x:"a" id:"A" z:1
            │ └── B LEAF id:B ag-Grid-AutoColumn:"a-b" x:"a-b" id:"B" z:2
            ├─┬ C GROUP id:C ag-Grid-AutoColumn:"c" x:"c" id:"C" z:3
            │ └── D LEAF id:D ag-Grid-AutoColumn:"c-d" x:"c-d" id:"D" z:4
            └─┬ E GROUP id:E ag-Grid-AutoColumn:"e" x:"e" id:"E" z:5
            · └─┬ F GROUP id:F ag-Grid-AutoColumn:"e-f" x:"e-f" id:"F" z:6
            · · └─┬ G GROUP id:G ag-Grid-AutoColumn:"e-f-g" x:"e-f-g" id:"G" z:7
            · · · └── H LEAF id:H ag-Grid-AutoColumn:"e-f-g-h" x:"e-f-g-h" id:"H" z:8
        `);

        api.updateGridOptions({
            autoGroupColumnDef: { headerName: 'X', field: 'z', colId: 'www' },
        });

        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ A GROUP id:A ag-Grid-AutoColumn:1 x:"a" id:"A" z:1
            │ └── B LEAF id:B ag-Grid-AutoColumn:2 x:"a-b" id:"B" z:2
            ├─┬ C GROUP id:C ag-Grid-AutoColumn:3 x:"c" id:"C" z:3
            │ └── D LEAF id:D ag-Grid-AutoColumn:4 x:"c-d" id:"D" z:4
            └─┬ E GROUP id:E ag-Grid-AutoColumn:5 x:"e" id:"E" z:5
            · └─┬ F GROUP id:F ag-Grid-AutoColumn:6 x:"e-f" id:"F" z:6
            · · └─┬ G GROUP id:G ag-Grid-AutoColumn:7 x:"e-f-g" id:"G" z:7
            · · · └── H LEAF id:H ag-Grid-AutoColumn:8 x:"e-f-g-h" id:"H" z:8
        `);
    });
});
