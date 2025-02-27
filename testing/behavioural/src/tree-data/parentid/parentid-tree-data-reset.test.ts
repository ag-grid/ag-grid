import { setTimeout as asyncSetTimeout } from 'timers/promises';
import type { MockInstance } from 'vitest';

import { ClientSideRowModelModule } from 'ag-grid-community';
import { TreeDataModule } from 'ag-grid-enterprise';

import { GridRows, TestGridsManager, cachedJSONObjects } from '../../test-utils';
import type { GridRowsOptions } from '../../test-utils';

const defaultGridRowsOptions: GridRowsOptions = {
    checkDom: true,
};

describe('ag-grid parentId tree data reset', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, TreeDataModule],
    });

    let consoleWarnSpy: MockInstance;

    beforeEach(() => {
        vitest.useRealTimers();
        cachedJSONObjects.clear();
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
        consoleWarnSpy?.mockRestore();
    });

    test('tree data is created in the right order, and order can be changed also if data references do not change', async () => {
        const rowData = cachedJSONObjects.array([
            { id: 'A' },
            { id: 'B', parent: 'A' },
            { id: 'C' },
            { id: 'D', parent: 'C' },
            { id: 'E', parent: 'C' },
        ]);

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [],
            autoGroupColumnDef: { headerName: 'Organisation Hierarchy' },
            animateRows: false,
            groupDefaultExpanded: -1,
            rowData: rowData,
            getRowId: (params) => params.data.id,
            treeData: true,
            treeDataParentIdField: 'parent',
        });

        await new GridRows(api, 'initial', defaultGridRowsOptions).check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ A GROUP id:A
            │ └── B LEAF id:B
            └─┬ C GROUP id:C
            · ├── D LEAF id:D
            · └── E LEAF id:E
        `);

        api.setGridOption('rowData', rowData);

        await new GridRows(api, 'update 1', defaultGridRowsOptions).check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ A GROUP id:A
            │ └── B LEAF id:B
            └─┬ C GROUP id:C
            · ├── D LEAF id:D
            · └── E LEAF id:E
        `);

        api.setGridOption(
            'rowData',
            cachedJSONObjects.array([
                { id: 'B', parent: 'A' },
                { id: 'C' },
                { id: 'D', parent: 'C' },
                { id: 'A' },
                { id: 'E', parent: 'C' },
            ])
        );

        await new GridRows(api, 'update 2', defaultGridRowsOptions).check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ C GROUP id:C
            │ ├── D LEAF id:D
            │ └── E LEAF id:E
            └─┬ A GROUP id:A
            · └── B LEAF id:B
        `);

        api.setGridOption(
            'rowData',
            cachedJSONObjects.array([
                { id: 'B', parent: 'A' },
                { id: 'C' },
                { id: 'E', parent: 'C' },
                { id: 'A' },
                { id: 'D', parent: 'C' },
            ])
        );

        await new GridRows(api, 'update 3', defaultGridRowsOptions).check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ C GROUP id:C
            │ ├── E LEAF id:E
            │ └── D LEAF id:D
            └─┬ A GROUP id:A
            · └── B LEAF id:B
        `);
    });

    test('tree data async loading', async () => {
        const rowData1 = [
            { id: 'A', parent: null },
            { id: 'B', parent: 'A' },
        ];
        const rowData2 = [
            { id: 'C', parent: null },
            { id: 'D', parent: 'C' },
        ];

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [],
            autoGroupColumnDef: { headerName: 'Organisation Hierarchy' },
            animateRows: false,
            groupDefaultExpanded: -1,
            getRowId: (params) => params.data.id,
            treeData: true,
            treeDataParentIdField: 'parent',
        });

        await asyncSetTimeout(1); // Simulate async loading

        api.setGridOption('rowData', rowData1);

        await new GridRows(api, 'initial', defaultGridRowsOptions).check(`
            ROOT id:ROOT_NODE_ID
            └─┬ A GROUP id:A
            · └── B LEAF id:B
        `);

        await asyncSetTimeout(1); // Simulate async re-loading

        api.setGridOption('rowData', rowData2);

        await new GridRows(api, 'updated', defaultGridRowsOptions).check(`
            ROOT id:ROOT_NODE_ID
            └─┬ C GROUP id:C
            · └── D LEAF id:D
        `);
    });

    test('tree data ordering is consistent', async () => {
        const rowData = cachedJSONObjects.array([{ id: 'b' }, { id: 'c' }, { id: 'd', parent: 'c' }, { id: 'e' }]);
        const rowData2 = cachedJSONObjects.array([{ id: 'a' }, ...rowData, { id: 'f' }, { id: 'g', parent: 'f' }]);

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [],
            autoGroupColumnDef: { headerName: 'x' },
            animateRows: false,
            groupDefaultExpanded: -1,
            rowData: [],
            getRowId: (params) => params.data.id,
            treeData: true,
            treeDataParentIdField: 'parent',
        });

        api.setGridOption('rowData', rowData);

        await new GridRows(api, 'update 0', defaultGridRowsOptions).check(`
            ROOT id:ROOT_NODE_ID
            ├── b LEAF id:b
            ├─┬ c GROUP id:c
            │ └── d LEAF id:d
            └── e LEAF id:e
        `);

        api.setGridOption('rowData', rowData2);

        await new GridRows(api, 'update1', defaultGridRowsOptions).check(`
            ROOT id:ROOT_NODE_ID
            ├── a LEAF id:a
            ├── b LEAF id:b
            ├─┬ c GROUP id:c
            │ └── d LEAF id:d
            ├── e LEAF id:e
            └─┬ f GROUP id:f
            · └── g LEAF id:g
        `);
    });

    test('tree data order matches', async () => {
        const rowData = [
            { id: 'p' },
            { id: 'r', parent: 'p' },
            { id: 'q', parent: 'p' },

            { id: 'a' },
            { id: 'c', parent: 'a' },
            { id: 'b', parent: 'a' },

            { id: 't', parent: 's' },
            { id: 's' },
        ];

        const api = gridsManager.createGrid('myGrid', {
            treeDataParentIdField: 'parent',
            treeData: true,
            columnDefs: [],
            autoGroupColumnDef: { headerName: 'Organisation Hierarchy' },
            animateRows: false,
            groupDefaultExpanded: -1,
            rowData: [],
            getRowId: (params) => params.data.id,
        });

        api.setGridOption('rowData', rowData);

        await new GridRows(api, 'update 0', defaultGridRowsOptions).check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ p GROUP id:p
            │ ├── r LEAF id:r
            │ └── q LEAF id:q
            ├─┬ a GROUP id:a
            │ ├── c LEAF id:c
            │ └── b LEAF id:b
            └─┬ s GROUP id:s
            · └── t LEAF id:t
        `);
    });

    test('tree data with only leafs can be reordered (same references)', async () => {
        const rowData1 = cachedJSONObjects.array([
            { id: '0' },
            { id: '1' },
            { id: '2' },
            { id: '3' },
            { id: '4' },
            { id: '5', parent: null },
        ]);

        const rowData2 = cachedJSONObjects.array([
            { id: '1' },
            { id: '5', parent: null },
            { id: '2' },
            { id: '4' },
            { id: '0' },
            { id: '3' },
        ]);

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [],
            autoGroupColumnDef: { headerName: 'x' },
            treeData: true,
            treeDataParentIdField: 'parent',
            animateRows: false,
            groupDefaultExpanded: -1,
            rowData: [],
            getRowId: (params) => params.data.id,
        });

        api.setGridOption('rowData', rowData1);

        let gridRows = new GridRows(api, 'update 0', defaultGridRowsOptions);
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── 0 LEAF id:0
            ├── 1 LEAF id:1
            ├── 2 LEAF id:2
            ├── 3 LEAF id:3
            ├── 4 LEAF id:4
            └── 5 LEAF id:5
        `);
        expect(gridRows.rootAllLeafChildren.map((n) => n.data)).toEqual(rowData1);

        api.setGridOption('rowData', rowData2);

        gridRows = new GridRows(api, 'update 1', defaultGridRowsOptions);
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── 1 LEAF id:1
            ├── 5 LEAF id:5
            ├── 2 LEAF id:2
            ├── 4 LEAF id:4
            ├── 0 LEAF id:0
            └── 3 LEAF id:3
        `);
        expect(gridRows.rootAllLeafChildren.map((n) => n.data)).toEqual(rowData2);
    });

    test('tree data can be reordered and updated', async () => {
        const rowData1 = [
            { id: 'A', label: 'a' },
            { id: 'B', label: 'b1', parent: 'A' },
            { id: 'C', label: 'c1', parent: 'A' },
            { id: 'Q', label: 'q1', parent: 'P' },
            { id: 'R', label: 'r1', parent: 'P' },
            { id: 'P', label: 'p1' },
            { id: 'S', label: 's1' },
            { id: 'T', label: 't1', parent: 'S' },
        ];

        const rowData2 = [
            { id: 'A', label: 'a' },
            { id: 'C', label: 'c2', parent: 'A' },
            { id: 'D', label: 'b2', parent: 'A' },
            { id: 'R', label: 'r2', parent: 'P' },
            { id: 'S', label: 's2' },
            { id: 't', label: 't2', parent: 'S' },
            { id: 'Q', label: 'q2', parent: 'P' },
            { id: 'P', label: 'p2' },
        ];

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'label' }],
            autoGroupColumnDef: { headerName: 'Organisation Hierarchy' },
            treeData: true,
            treeDataParentIdField: 'parent',
            animateRows: false,
            groupDefaultExpanded: -1,
            rowData: [],
            getRowId: (params) => params.data.id,
        });

        api.setGridOption('rowData', rowData1);

        const gridRowsOptions = { ...defaultGridRowsOptions, columns: ['label'] };

        await new GridRows(api, 'update 0', gridRowsOptions).check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ A GROUP id:A label:"a"
            │ ├── B LEAF id:B label:"b1"
            │ └── C LEAF id:C label:"c1"
            ├─┬ P GROUP id:P label:"p1"
            │ ├── Q LEAF id:Q label:"q1"
            │ └── R LEAF id:R label:"r1"
            └─┬ S GROUP id:S label:"s1"
            · └── T LEAF id:T label:"t1"
        `);

        api.setGridOption('rowData', rowData2);

        await new GridRows(api, 'update 1', gridRowsOptions).check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ A GROUP id:A label:"a"
            │ ├── C LEAF id:C label:"c2"
            │ └── D LEAF id:D label:"b2"
            ├─┬ S GROUP id:S label:"s2"
            │ └── t LEAF id:t label:"t2"
            └─┬ P GROUP id:P label:"p2"
            · ├── R LEAF id:R label:"r2"
            · └── Q LEAF id:Q label:"q2"
        `);
    });

    test('tree data setRowData maintains selection and expanded state, and follows order', async () => {
        const rowData1 = cachedJSONObjects.array([
            { id: 'g0', x: 'A', label: 'g-A' },
            { id: '1', x: 'B', label: '1-v1', parent: 'g0' },
            { id: '8', x: 'C', label: '8-v1', parent: '1' },
            { id: 'g1', x: 'C', label: 'g-C' },
            { id: '3', x: 'D', label: '3-v1', parent: 'g1' },
            { id: 'g2', x: 'P', label: 'g-P' },
            { id: '4', x: 'Q', label: '4-v1', parent: 'g2' },
            { id: 'g3', x: 'R', label: 'g-R' },
            { id: '5', x: 'S', label: '5-v1', parent: 'g3' },
            { id: '6', x: 'M', label: '6-v1' },
            { id: '7', x: 'N', label: '7-v1' },
        ]);

        const rowData2 = cachedJSONObjects.array([
            { id: '7', x: 'N', label: '7-v2' },
            { id: 'g0', x: 'R', label: 'g-R' },
            { id: '5', x: 'S', label: '5-v2', parent: 'g0' },
            { id: 'g4', x: 'X', label: 'g-X' },
            { id: '2', x: 'Y', label: '2-v2', parent: 'g4' },
            { id: '1', x: 'Z', label: '1-v2', parent: '2' },
            { id: 'g5', x: 'P', label: 'g-P' },
            { id: '4', x: 'Q', label: '4-v2', parent: 'g5' },
            { id: '6', x: 'M', label: '6-v2' },
            { id: 'g3x', x: 'C', label: 'g-C', parent: 'g3' },
            { id: 'g3', x: 'C', label: 'g-C' },
        ]);

        const rowData3 = cachedJSONObjects.array([
            { id: '100', x: 'a', label: '100-v3' },
            { id: 'g3', x: 'C', label: 'g-C' },
            { id: '3', x: 'D', label: '3-v3', parent: 'g3' },
        ]);

        const rowData4 = cachedJSONObjects.array([
            { id: '100', x: 'a', label: '100-v3' },
            { id: 'g0', x: 'C', label: 'g-C' },
            { id: '3', x: 'D', label: '3-v3', parent: 'g0' },
        ]);

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'label' }, { field: 'x' }],
            autoGroupColumnDef: { headerName: 'path' },
            treeData: true,
            treeDataParentIdField: 'parent',
            animateRows: false,
            groupDefaultExpanded: -1,
            rowData: [],
            rowSelection: { mode: 'multiRow' },
            getRowId: (params) => params.data.id,
        });

        const gridRowsOptions = { ...defaultGridRowsOptions, columns: ['x', 'label'] };

        api.setGridOption('rowData', rowData1);

        // set B collapsed (a leaf)
        api.setRowNodeExpanded(api.getRowNode('1')!, false, undefined, true);

        // set P collapsed (a filler node group
        api.setRowNodeExpanded(api.getRowNode('4')!.parent!, false, undefined, true);

        // set R collapsed (a filler node group
        api.setRowNodeExpanded(api.getRowNode('5')!.parent!, false, undefined, true);

        // Select all nodes
        api.selectAll();

        await new GridRows(api, 'update 0', gridRowsOptions).check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ g0 GROUP selected id:g0 label:"g-A" x:"A"
            │ └─┬ 1 GROUP selected collapsed id:1 label:"1-v1" x:"B"
            │ · └── 8 LEAF selected hidden id:8 label:"8-v1" x:"C"
            ├─┬ g1 GROUP selected id:g1 label:"g-C" x:"C"
            │ └── 3 LEAF selected id:3 label:"3-v1" x:"D"
            ├─┬ g2 GROUP selected collapsed id:g2 label:"g-P" x:"P"
            │ └── 4 LEAF selected hidden id:4 label:"4-v1" x:"Q"
            ├─┬ g3 GROUP selected collapsed id:g3 label:"g-R" x:"R"
            │ └── 5 LEAF selected hidden id:5 label:"5-v1" x:"S"
            ├── 6 LEAF selected id:6 label:"6-v1" x:"M"
            └── 7 LEAF selected id:7 label:"7-v1" x:"N"
        `);

        api.setGridOption('rowData', rowData2);

        await new GridRows(api, 'update 1', gridRowsOptions).check(`
            ROOT id:ROOT_NODE_ID
            ├── 7 LEAF selected id:7 label:"7-v2" x:"N"
            ├─┬ g0 GROUP selected id:g0 label:"g-R" x:"R"
            │ └── 5 LEAF selected id:5 label:"5-v2" x:"S"
            ├─┬ g4 GROUP id:g4 label:"g-X" x:"X"
            │ └─┬ 2 GROUP id:2 label:"2-v2" x:"Y"
            │ · └── 1 LEAF selected id:1 label:"1-v2" x:"Z"
            ├─┬ g5 GROUP id:g5 label:"g-P" x:"P"
            │ └── 4 LEAF selected id:4 label:"4-v2" x:"Q"
            ├── 6 LEAF selected id:6 label:"6-v2" x:"M"
            └─┬ g3 GROUP selected collapsed id:g3 label:"g-C" x:"C"
            · └── g3x LEAF hidden id:g3x label:"g-C" x:"C"
        `);

        api.setGridOption('rowData', rowData3);

        await new GridRows(api, 'update 2', gridRowsOptions).check(`
            ROOT id:ROOT_NODE_ID
            ├── 100 LEAF id:100 label:"100-v3" x:"a"
            └─┬ g3 GROUP selected collapsed id:g3 label:"g-C" x:"C"
            · └── 3 LEAF hidden id:3 label:"3-v3" x:"D"
        `);

        api.setGridOption('rowData', rowData4);

        await new GridRows(api, 'update 3', gridRowsOptions).check(`
            ROOT id:ROOT_NODE_ID
            ├── 100 LEAF id:100 label:"100-v3" x:"a"
            └─┬ g0 GROUP id:g0 label:"g-C" x:"C"
            · └── 3 LEAF id:3 label:"3-v3" x:"D"
        `);

        api.setGridOption('rowData', []);

        await new GridRows(api, 'cleared', gridRowsOptions).check('empty');
    });
});
