import type { MockInstance } from 'vitest';

import { ClientSideRowModelModule, ValidationModule } from 'ag-grid-community';
import { TreeDataModule } from 'ag-grid-enterprise';

import { GridRows, TestGridsManager } from '../../test-utils';

describe('ag-grid parentId tree data warnings', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, TreeDataModule, ValidationModule],
    });

    let consoleWarnSpy: MockInstance;

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
        consoleWarnSpy?.mockRestore();
    });

    test('treeDataParentIdField without getRowId', async () => {
        const rowData = [
            { x: 0 },
            { x: 1 },
            { x: 2, parentId: '1' },
            { x: 3, parentId: '1' },
            { x: 4 },
            { x: 5, parentId: '3' },
        ];

        consoleWarnSpy = vitest.spyOn(console, 'warn').mockImplementation(() => {});

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'x' }],
            autoGroupColumnDef: {
                headerName: 'Organisation Hierarchy',
                cellRendererParams: { suppressCount: true },
            },
            treeData: true,
            animateRows: false,
            groupDefaultExpanded: -1,
            rowData: rowData,
            treeDataParentIdField: 'parentId',
        });

        expect(consoleWarnSpy).toHaveBeenCalledWith(
            'AG Grid: getRowId callback not provided, tree data with parent id cannot be built.'
        );

        await new GridRows(api, 'rowData', { checkDom: true, columns: true }).check('empty');
    });

    test('treeDataParentIdField with treeDataChildrenField', async () => {
        const rowData = [{ id: '0' }, { id: '1', parentId: '0', children: [{ id: 2 }, { id: 3 }] }];

        consoleWarnSpy = vitest.spyOn(console, 'warn').mockImplementation(() => {});

        gridsManager.createGrid('myGrid', {
            columnDefs: [],
            autoGroupColumnDef: {
                headerName: 'Organisation Hierarchy',
                cellRendererParams: { suppressCount: true },
            },
            treeData: true,
            animateRows: false,
            groupDefaultExpanded: -1,
            rowData: rowData,
            getRowId: (params) => params.data.id,
            treeDataParentIdField: 'parentId',
            ['treeDataChildrenField']: 'children',
        });

        expect(consoleWarnSpy).toHaveBeenCalledWith(
            "AG Grid: Cannot use both 'treeDataChildrenField' and 'treeDataParentIdField' at the same time."
        );
    });

    test('a not existing parentId should log a warning, and move that row to the root', async () => {
        const rowData = [
            { id: '1', x: '1' },
            { id: '0', x: '0', parentId: null },
            { id: '5', x: '5', parentId: '4' },
            { id: '4', x: '4', parentId: 'hJdDsX3' },
            { id: 'hJdDsX3', x: '3', parentId: '666' },
            { id: '2', x: '2', parentId: '1' },
        ];

        consoleWarnSpy = vitest.spyOn(console, 'warn').mockImplementation(() => {});

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'x' }],
            autoGroupColumnDef: {
                headerName: 'Organisation Hierarchy',
                cellRendererParams: { suppressCount: true },
            },
            treeData: true,
            animateRows: false,
            groupDefaultExpanded: -1,
            rowData: rowData,
            getRowId: (params) => params.data.id,
            treeDataParentIdField: 'parentId',
        });

        await new GridRows(api, 'rowData', { checkDom: true, columns: true }).check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ 1 GROUP id:1 ag-Grid-AutoColumn:"1" x:"1"
            │ └── 2 LEAF id:2 ag-Grid-AutoColumn:"2" x:"2"
            ├── 0 LEAF id:0 ag-Grid-AutoColumn:"0" x:"0"
            └─┬ hJdDsX3 GROUP id:hJdDsX3 ag-Grid-AutoColumn:"hJdDsX3" x:"3"
            · └─┬ 4 GROUP id:4 ag-Grid-AutoColumn:"4" x:"4"
            · · └── 5 LEAF id:5 ag-Grid-AutoColumn:"5" x:"5"
        `);

        expect(consoleWarnSpy).toHaveBeenCalledWith(
            'AG Grid: error #271',
            "Parent row not found for row with id='hJdDsX3' and parent id='666'. Showing row with id='hJdDsX3' as a root-level node.",
            expect.anything()
        );
    });

    test('a simple cycle is broken ans a warning is shown', async () => {
        const rowData = [
            { id: 'KjDhf3D1', parentId: 'KjDhf3D4', x: '1' },
            { id: '2', parentId: 'KjDhf3D1', x: '2' },
            { id: '3', parentId: '2', x: '3' },
            { id: 'KjDhf3D4', parentId: '3', x: '4' },
            { id: '5', x: '5' },
            { id: '6', parentId: '5', x: '6' },
        ];

        consoleWarnSpy = vitest.spyOn(console, 'warn').mockImplementation(() => {});

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'x' }, { field: 'parentId' }],
            autoGroupColumnDef: {
                headerName: 'Organisation Hierarchy',
                cellRendererParams: { suppressCount: true },
            },
            treeData: true,
            animateRows: false,
            groupDefaultExpanded: -1,
            rowData: rowData,
            getRowId: (params) => params.data.id,
            treeDataParentIdField: 'parentId',
        });

        await new GridRows(api, 'rowData', { checkDom: true, columns: true }).check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ KjDhf3D1 GROUP id:KjDhf3D1 ag-Grid-AutoColumn:"KjDhf3D1" x:"1" parentId:"KjDhf3D4"
            │ └─┬ 2 GROUP id:2 ag-Grid-AutoColumn:"2" x:"2" parentId:"KjDhf3D1"
            │ · └─┬ 3 GROUP id:3 ag-Grid-AutoColumn:"3" x:"3" parentId:"2"
            │ · · └── KjDhf3D4 LEAF id:KjDhf3D4 ag-Grid-AutoColumn:"KjDhf3D4" x:"4" parentId:"3"
            └─┬ 5 GROUP id:5 ag-Grid-AutoColumn:"5" x:"5" parentId:undefined
            · └── 6 LEAF id:6 ag-Grid-AutoColumn:"6" x:"6" parentId:"5"
        `);

        expect(consoleWarnSpy).toHaveBeenCalledWith(
            'AG Grid: error #270',
            "Cycle detected for row with id='KjDhf3D1' and parent id='KjDhf3D4'. Resetting the parent for row with id='KjDhf3D1' and showing it as a root-level node.",
            expect.anything()
        );
    });

    test('cycles are broken ans a warning is shown', async () => {
        const rowData = [
            { id: 'Dj0FPsX0', parentId: 'Dj0FPsX0', x: '0' },

            { id: 'Dj0FPsX1', parentId: 'Dj0FPsX4', x: '1' },
            { id: '2', parentId: 'Dj0FPsX1', x: '2' },
            { id: '3', parentId: '2', x: '3' },
            { id: 'Dj0FPsX4', parentId: '3', x: '4' },
            { id: '5', x: '5', parentId: 'Dj0FPsX1' },
            { id: '6', parentId: '5', x: '6' },
            { id: '7', parentId: '2', x: '7' },
            { id: '8', parentId: 'Dj0FPsX4', x: '8' },
            { id: '9', parentId: '8', x: '9' },
            { id: 'A', parentId: '7', x: '7' },
        ];

        consoleWarnSpy = vitest.spyOn(console, 'warn').mockImplementation(() => {});

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'x' }, { field: 'parentId' }],
            autoGroupColumnDef: {
                headerName: 'Organisation Hierarchy',
                cellRendererParams: { suppressCount: true },
            },
            treeData: true,
            animateRows: false,
            groupDefaultExpanded: -1,
            rowData: rowData,
            getRowId: (params) => params.data.id,
            treeDataParentIdField: 'parentId',
        });

        await new GridRows(api, 'rowData', { checkDom: true, columns: true }).check(`
            ROOT id:ROOT_NODE_ID
            ├── Dj0FPsX0 LEAF id:Dj0FPsX0 ag-Grid-AutoColumn:"Dj0FPsX0" x:"0" parentId:"Dj0FPsX0"
            └─┬ Dj0FPsX1 GROUP id:Dj0FPsX1 ag-Grid-AutoColumn:"Dj0FPsX1" x:"1" parentId:"Dj0FPsX4"
            · ├─┬ 2 GROUP id:2 ag-Grid-AutoColumn:"2" x:"2" parentId:"Dj0FPsX1"
            · │ ├─┬ 3 GROUP id:3 ag-Grid-AutoColumn:"3" x:"3" parentId:"2"
            · │ │ └─┬ Dj0FPsX4 GROUP id:Dj0FPsX4 ag-Grid-AutoColumn:"Dj0FPsX4" x:"4" parentId:"3"
            · │ │ · └─┬ 8 GROUP id:8 ag-Grid-AutoColumn:"8" x:"8" parentId:"Dj0FPsX4"
            · │ │ · · └── 9 LEAF id:9 ag-Grid-AutoColumn:"9" x:"9" parentId:"8"
            · │ └─┬ 7 GROUP id:7 ag-Grid-AutoColumn:"7" x:"7" parentId:"2"
            · │ · └── A LEAF id:A ag-Grid-AutoColumn:"A" x:"7" parentId:"7"
            · └─┬ 5 GROUP id:5 ag-Grid-AutoColumn:"5" x:"5" parentId:"Dj0FPsX1"
            · · └── 6 LEAF id:6 ag-Grid-AutoColumn:"6" x:"6" parentId:"5"
        `);

        expect(consoleWarnSpy).toHaveBeenCalledWith(
            'AG Grid: error #270',
            "Cycle detected for row with id='Dj0FPsX0' and parent id='Dj0FPsX0'. Resetting the parent for row with id='Dj0FPsX0' and showing it as a root-level node.",
            expect.anything()
        );

        expect(consoleWarnSpy).toHaveBeenCalledWith(
            'AG Grid: error #270',
            "Cycle detected for row with id='Dj0FPsX1' and parent id='Dj0FPsX4'. Resetting the parent for row with id='Dj0FPsX1' and showing it as a root-level node.",
            expect.anything()
        );
    });
});
