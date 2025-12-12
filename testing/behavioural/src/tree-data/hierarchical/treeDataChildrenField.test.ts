import { ClientSideRowModelModule } from 'ag-grid-community';
import type { GridOptions } from 'ag-grid-community';
import { TreeDataModule } from 'ag-grid-enterprise';

import { GridRows, TestGridsManager } from '../../test-utils';

describe('ag-grid treeDataChildrenField', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, TreeDataModule],
    });

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('ag-grid treeDataChildrenField with plain row data can be switched on and off ', async () => {
        const rowData = [
            { id: '1', x: 'a' },
            { id: '2', x: 'b' },
            { id: '3', x: 'c' },
            { id: '4', x: 'd' },
        ];

        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'x' }],
            autoGroupColumnDef: {
                headerName: 'Organisation Hierarchy',
                cellRendererParams: { suppressCount: true },
            },
            animateRows: false,
            groupDefaultExpanded: -1,
            rowData,
            getRowId: (params) => params.data.id,
        };

        const api = gridsManager.createGrid('myGrid', gridOptions);

        let gridRows = new GridRows(api, 'data');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:1 x:"a"
            ├── LEAF id:2 x:"b"
            ├── LEAF id:3 x:"c"
            └── LEAF id:4 x:"d"
        `);

        api.setGridOption('treeDataChildrenField', 'children');

        gridRows = new GridRows(api, 'data');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:1 x:"a"
            ├── LEAF id:2 x:"b"
            ├── LEAF id:3 x:"c"
            └── LEAF id:4 x:"d"
        `);

        api.setGridOption('treeDataChildrenField', undefined);

        gridRows = new GridRows(api, 'data');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:1 x:"a"
            ├── LEAF id:2 x:"b"
            ├── LEAF id:3 x:"c"
            └── LEAF id:4 x:"d"
        `);
    });

    test('ag-grid treeDataChildrenField is reactive', async () => {
        const rowData = [
            {
                id: '1',
                x: 'a',
                children1: [
                    { id: 'x1', x: 'x1' },
                    { id: 'x2', x: 'x2' },
                ],
                subObject: {
                    children2: [
                        { id: 'y1', x: 'y1' },
                        { id: 'y2', x: 'y2' },
                    ],
                },
            },
            { id: '2', x: 'b' },
            {
                id: '4',
                x: 'd',
                children1: [
                    { id: 'z1', x: 'z1' },
                    { id: 'z2', x: 'z2' },
                ],
                subObject: {
                    children2: [
                        { id: 'w1', x: 'w1' },
                        { id: 'w2', x: 'w2' },
                    ],
                },
            },
        ];

        const gridOptions: GridOptions = {
            columnDefs: [{ field: 'x' }],
            autoGroupColumnDef: {
                headerName: 'Organisation Hierarchy',
                cellRendererParams: { suppressCount: true },
            },
            animateRows: false,
            // treeData: true,
            groupDefaultExpanded: -1,
            rowData,
            getRowId: (params) => params.data.id,
        };

        const api = gridsManager.createGrid('myGrid', gridOptions);

        let gridRows = new GridRows(api, 'data');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:1 x:"a"
            ├── LEAF id:2 x:"b"
            └── LEAF id:4 x:"d"
        `);

        api.updateGridOptions({
            treeData: true,
            treeDataChildrenField: 'children1',
        });

        gridRows = new GridRows(api, 'data');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ 1 GROUP id:1 ag-Grid-AutoColumn:"1" x:"a"
            │ ├── x1 LEAF id:x1 ag-Grid-AutoColumn:"x1" x:"x1"
            │ └── x2 LEAF id:x2 ag-Grid-AutoColumn:"x2" x:"x2"
            ├── 2 LEAF id:2 ag-Grid-AutoColumn:"2" x:"b"
            └─┬ 4 GROUP id:4 ag-Grid-AutoColumn:"4" x:"d"
            · ├── z1 LEAF id:z1 ag-Grid-AutoColumn:"z1" x:"z1"
            · └── z2 LEAF id:z2 ag-Grid-AutoColumn:"z2" x:"z2"
        `);

        api.setGridOption('treeDataChildrenField', 'subObject.children2');

        gridRows = new GridRows(api, 'data');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ 1 GROUP id:1 ag-Grid-AutoColumn:"1" x:"a"
            │ ├── y1 LEAF id:y1 ag-Grid-AutoColumn:"y1" x:"y1"
            │ └── y2 LEAF id:y2 ag-Grid-AutoColumn:"y2" x:"y2"
            ├── 2 LEAF id:2 ag-Grid-AutoColumn:"2" x:"b"
            └─┬ 4 GROUP id:4 ag-Grid-AutoColumn:"4" x:"d"
            · ├── w1 LEAF id:w1 ag-Grid-AutoColumn:"w1" x:"w1"
            · └── w2 LEAF id:w2 ag-Grid-AutoColumn:"w2" x:"w2"
        `);

        api.setGridOption('treeDataChildrenField', 'xxx');

        gridRows = new GridRows(api, 'data');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── 1 LEAF id:1 ag-Grid-AutoColumn:"1" x:"a"
            ├── 2 LEAF id:2 ag-Grid-AutoColumn:"2" x:"b"
            └── 4 LEAF id:4 ag-Grid-AutoColumn:"4" x:"d"
        `);
    });
});
