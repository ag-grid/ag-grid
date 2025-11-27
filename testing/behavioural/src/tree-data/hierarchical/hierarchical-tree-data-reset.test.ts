import { setTimeout as asyncSetTimeout } from 'timers/promises';
import type { MockInstance } from 'vitest';

import { ClientSideRowModelModule } from 'ag-grid-community';
import { TreeDataModule } from 'ag-grid-enterprise';

import { GridRows, TestGridsManager, cachedJSONObjects, setRowDataChecked } from '../../test-utils';

describe('ag-grid hierarchical tree data reset', () => {
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

    test('tree data with id is created in the right order, and order can be changed also if data references do not change', async () => {
        const rowData = [
            { id: 'A', children: [{ id: 'B' }] },
            { id: 'C', children: [{ id: 'D' }, { id: 'E' }] },
        ];

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [],
            autoGroupColumnDef: { headerName: 'Organisation Hierarchy' },
            treeData: true,
            treeDataChildrenField: 'children',
            animateRows: false,
            groupDefaultExpanded: -1,
            rowData: rowData,
            getRowId: (params) => params.data.id,
        });

        await new GridRows(api, 'initial').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ A GROUP id:A ag-Grid-AutoColumn:"A"
            │ └── B LEAF id:B ag-Grid-AutoColumn:"B"
            └─┬ C GROUP id:C ag-Grid-AutoColumn:"C"
            · ├── D LEAF id:D ag-Grid-AutoColumn:"D"
            · └── E LEAF id:E ag-Grid-AutoColumn:"E"
        `);

        setRowDataChecked(api, rowData);

        await new GridRows(api, 'update 1').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ A GROUP id:A ag-Grid-AutoColumn:"A"
            │ └── B LEAF id:B ag-Grid-AutoColumn:"B"
            └─┬ C GROUP id:C ag-Grid-AutoColumn:"C"
            · ├── D LEAF id:D ag-Grid-AutoColumn:"D"
            · └── E LEAF id:E ag-Grid-AutoColumn:"E"
        `);

        rowData.reverse();
        setRowDataChecked(api, rowData);

        await new GridRows(api, 'update 2').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ C GROUP id:C ag-Grid-AutoColumn:"C"
            │ ├── D LEAF id:D ag-Grid-AutoColumn:"D"
            │ └── E LEAF id:E ag-Grid-AutoColumn:"E"
            └─┬ A GROUP id:A ag-Grid-AutoColumn:"A"
            · └── B LEAF id:B ag-Grid-AutoColumn:"B"
        `);

        rowData[0].children.reverse();
        setRowDataChecked(api, rowData);

        await new GridRows(api, 'update 3').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ C GROUP id:C ag-Grid-AutoColumn:"C"
            │ ├── E LEAF id:E ag-Grid-AutoColumn:"E"
            │ └── D LEAF id:D ag-Grid-AutoColumn:"D"
            └─┬ A GROUP id:A ag-Grid-AutoColumn:"A"
            · └── B LEAF id:B ag-Grid-AutoColumn:"B"
        `);
    });

    test('tree data async loading', async () => {
        const rowData1 = [{ id: 'A', children: [{ id: 'B' }] }];
        const rowData2 = [{ id: 'C', children: [{ id: 'D' }] }];

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [],
            autoGroupColumnDef: { headerName: 'Organisation Hierarchy' },
            treeData: true,
            treeDataChildrenField: 'children',
            animateRows: false,
            groupDefaultExpanded: -1,
            getRowId: (params) => params.data.id,
        });

        await asyncSetTimeout(1); // Simulate async loading

        setRowDataChecked(api, rowData1);

        await new GridRows(api, 'initial').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ A GROUP id:A ag-Grid-AutoColumn:"A"
            · └── B LEAF id:B ag-Grid-AutoColumn:"B"
        `);

        await asyncSetTimeout(1); // Simulate async re-loading

        setRowDataChecked(api, rowData2);

        await new GridRows(api, 'updated').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ C GROUP id:C ag-Grid-AutoColumn:"C"
            · └── D LEAF id:D ag-Grid-AutoColumn:"D"
        `);
    });

    test('setting rowData without id keeps the tree data structure correct', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'id' }, { field: 'x' }],
            treeData: true,
            treeDataChildrenField: 'children',
            animateRows: false,
            groupDefaultExpanded: -1,
        });

        const rowData1 = cachedJSONObjects.array([
            { id: 'A', children: [{ id: 'B', x: 0 }] },
            {
                id: 'P',
                children: [
                    { id: 'Q', x: 1 },
                    { id: 'R', x: 2 },
                ],
            },
            { id: 'C', children: [{ id: 'D', x: 3 }] },
            { id: 'X', children: [{ id: 'Y', x: 4 }] },
        ]);

        const rowData2 = cachedJSONObjects.array([
            { id: 'D', children: [{ id: 'E', x: 5, children: [{ id: 'F', x: 4 }] }] },
            {
                id: 'P',
                children: [
                    { id: 'R', x: 7 },
                    { id: 'Q', x: 1 },
                ],
            },
        ]);

        setRowDataChecked(api, rowData1);

        await new GridRows(api, 'update 0').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ 0 GROUP id:0 ag-Grid-AutoColumn:"0" id:"A"
            │ └── 1 LEAF id:1 ag-Grid-AutoColumn:"1" id:"B" x:0
            ├─┬ 2 GROUP id:2 ag-Grid-AutoColumn:"2" id:"P"
            │ ├── 3 LEAF id:3 ag-Grid-AutoColumn:"3" id:"Q" x:1
            │ └── 4 LEAF id:4 ag-Grid-AutoColumn:"4" id:"R" x:2
            ├─┬ 5 GROUP id:5 ag-Grid-AutoColumn:"5" id:"C"
            │ └── 6 LEAF id:6 ag-Grid-AutoColumn:"6" id:"D" x:3
            └─┬ 7 GROUP id:7 ag-Grid-AutoColumn:"7" id:"X"
            · └── 8 LEAF id:8 ag-Grid-AutoColumn:"8" id:"Y" x:4
        `);

        setRowDataChecked(api, rowData2);

        await new GridRows(api, 'update 1').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ 0 GROUP id:0 ag-Grid-AutoColumn:"0" id:"D"
            │ └─┬ 1 GROUP id:1 ag-Grid-AutoColumn:"1" id:"E" x:5
            │ · └── 2 LEAF id:2 ag-Grid-AutoColumn:"2" id:"F" x:4
            └─┬ 3 GROUP id:3 ag-Grid-AutoColumn:"3" id:"P"
            · ├── 4 LEAF id:4 ag-Grid-AutoColumn:"4" id:"R" x:7
            · └── 5 LEAF id:5 ag-Grid-AutoColumn:"5" id:"Q" x:1
        `);

        setRowDataChecked(api, []);

        await new GridRows(api, 'empty').check('empty');

        setRowDataChecked(api, rowData2);

        await new GridRows(api, 'update 1').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ 0 GROUP id:0 ag-Grid-AutoColumn:"0" id:"D"
            │ └─┬ 1 GROUP id:1 ag-Grid-AutoColumn:"1" id:"E" x:5
            │ · └── 2 LEAF id:2 ag-Grid-AutoColumn:"2" id:"F" x:4
            └─┬ 3 GROUP id:3 ag-Grid-AutoColumn:"3" id:"P"
            · ├── 4 LEAF id:4 ag-Grid-AutoColumn:"4" id:"R" x:7
            · └── 5 LEAF id:5 ag-Grid-AutoColumn:"5" id:"Q" x:1
        `);
    });

    test('tree data with id ordering is consistent', async () => {
        const rowData = cachedJSONObjects.array([{ id: 'b' }, { id: 'c', children: [{ id: 'd' }] }, { id: 'e' }]);
        const rowData2 = cachedJSONObjects.array([{ id: 'a' }, ...rowData, { id: 'f', children: [{ id: 'g' }] }]);

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [],
            autoGroupColumnDef: { headerName: 'Organisation Hierarchy' },
            treeData: true,
            treeDataChildrenField: 'children',
            animateRows: false,
            groupDefaultExpanded: -1,
            rowData: [],
            getRowId: (params) => params.data.id,
        });

        setRowDataChecked(api, rowData);

        await new GridRows(api, 'update 0').check(`
            ROOT id:ROOT_NODE_ID
            ├── b LEAF id:b ag-Grid-AutoColumn:"b"
            ├─┬ c GROUP id:c ag-Grid-AutoColumn:"c"
            │ └── d LEAF id:d ag-Grid-AutoColumn:"d"
            └── e LEAF id:e ag-Grid-AutoColumn:"e"
        `);

        setRowDataChecked(api, rowData2);

        await new GridRows(api, 'update1').check(`
            ROOT id:ROOT_NODE_ID
            ├── a LEAF id:a ag-Grid-AutoColumn:"a"
            ├── b LEAF id:b ag-Grid-AutoColumn:"b"
            ├─┬ c GROUP id:c ag-Grid-AutoColumn:"c"
            │ └── d LEAF id:d ag-Grid-AutoColumn:"d"
            ├── e LEAF id:e ag-Grid-AutoColumn:"e"
            └─┬ f GROUP id:f ag-Grid-AutoColumn:"f"
            · └── g LEAF id:g ag-Grid-AutoColumn:"g"
        `);
    });

    test('tree data with id order matches', async () => {
        const rowData = [
            { id: 'p', children: [{ id: 'r' }, { id: 'q' }] },
            { id: 'a', children: [{ id: 'c' }, { id: 'b' }] },
            { id: 's', children: [{ id: 't' }] },
        ];

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [],
            autoGroupColumnDef: { headerName: 'Organisation Hierarchy' },
            treeData: true,
            treeDataChildrenField: 'children',
            animateRows: false,
            groupDefaultExpanded: -1,
            rowData: [],
            getRowId: (params) => params.data.id,
        });

        setRowDataChecked(api, rowData);

        await new GridRows(api, 'update 0').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ p GROUP id:p ag-Grid-AutoColumn:"p"
            │ ├── r LEAF id:r ag-Grid-AutoColumn:"r"
            │ └── q LEAF id:q ag-Grid-AutoColumn:"q"
            ├─┬ a GROUP id:a ag-Grid-AutoColumn:"a"
            │ ├── c LEAF id:c ag-Grid-AutoColumn:"c"
            │ └── b LEAF id:b ag-Grid-AutoColumn:"b"
            └─┬ s GROUP id:s ag-Grid-AutoColumn:"s"
            · └── t LEAF id:t ag-Grid-AutoColumn:"t"
        `);
    });

    test('tree data with only leafs can be reordered (same references)', async () => {
        const rowData1 = cachedJSONObjects.array([
            { id: '0' },
            { id: '1' },
            { id: '2' },
            { id: '3' },
            { id: '4' },
            { id: '5' },
        ]);

        const rowData2 = cachedJSONObjects.array([
            { id: '1' },
            { id: '5' },
            { id: '2' },
            { id: '4' },
            { id: '0' },
            { id: '3' },
        ]);

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [],
            autoGroupColumnDef: { headerName: 'x' },
            treeData: true,
            treeDataChildrenField: 'children',
            animateRows: false,
            groupDefaultExpanded: -1,
            rowData: [],
            getRowId: (params) => params.data.id,
        });

        setRowDataChecked(api, rowData1);

        let gridRows = new GridRows(api, 'update 0');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── 0 LEAF id:0 ag-Grid-AutoColumn:"0"
            ├── 1 LEAF id:1 ag-Grid-AutoColumn:"1"
            ├── 2 LEAF id:2 ag-Grid-AutoColumn:"2"
            ├── 3 LEAF id:3 ag-Grid-AutoColumn:"3"
            ├── 4 LEAF id:4 ag-Grid-AutoColumn:"4"
            └── 5 LEAF id:5 ag-Grid-AutoColumn:"5"
        `);
        expect(gridRows.rootAllLeafChildren.map((n) => n.data)).toEqual(rowData1);

        setRowDataChecked(api, rowData2);

        gridRows = new GridRows(api, 'update 1');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── 1 LEAF id:1 ag-Grid-AutoColumn:"1"
            ├── 5 LEAF id:5 ag-Grid-AutoColumn:"5"
            ├── 2 LEAF id:2 ag-Grid-AutoColumn:"2"
            ├── 4 LEAF id:4 ag-Grid-AutoColumn:"4"
            ├── 0 LEAF id:0 ag-Grid-AutoColumn:"0"
            └── 3 LEAF id:3 ag-Grid-AutoColumn:"3"
        `);
        expect(gridRows.rootAllLeafChildren.map((n) => n.data)).toEqual(rowData2);
    });

    test('tree data with id can be reordered and updated', async () => {
        const rowData1 = [
            {
                id: 'A',
                label: 'a',
                children: [
                    { id: 'B', label: 'b1' },
                    { id: 'C', label: 'c1' },
                ],
            },
            {
                id: 'P',
                label: 'p1',
                children: [
                    { id: 'Q', label: 'q1' },
                    { id: 'R', label: 'r1' },
                ],
            },
            {
                id: 'S',
                label: 's1',
                children: [{ id: 'T', label: 't1' }],
            },
        ];

        const rowData2 = [
            {
                id: 'A',
                label: 'a',
                children: [
                    { id: 'C', label: 'c2' },
                    { id: 'D', label: 'b2' },
                ],
            },
            {
                id: 'S',
                label: 's2',
                children: [{ id: 't', label: 't2' }],
            },
            {
                id: 'P',
                label: 'p2',
                children: [
                    { id: 'R', label: 'r2' },
                    { id: 'Q', label: 'q2' },
                ],
            },
        ];

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'label' }],
            autoGroupColumnDef: { headerName: 'Organisation Hierarchy' },
            treeData: true,
            treeDataChildrenField: 'children',
            animateRows: false,
            groupDefaultExpanded: -1,
            rowData: [],
            getRowId: (params) => params.data.id,
        });

        setRowDataChecked(api, rowData1);

        await new GridRows(api, 'update 0').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ A GROUP id:A ag-Grid-AutoColumn:"A" label:"a"
            │ ├── B LEAF id:B ag-Grid-AutoColumn:"B" label:"b1"
            │ └── C LEAF id:C ag-Grid-AutoColumn:"C" label:"c1"
            ├─┬ P GROUP id:P ag-Grid-AutoColumn:"P" label:"p1"
            │ ├── Q LEAF id:Q ag-Grid-AutoColumn:"Q" label:"q1"
            │ └── R LEAF id:R ag-Grid-AutoColumn:"R" label:"r1"
            └─┬ S GROUP id:S ag-Grid-AutoColumn:"S" label:"s1"
            · └── T LEAF id:T ag-Grid-AutoColumn:"T" label:"t1"
        `);

        setRowDataChecked(api, rowData2);

        await new GridRows(api, 'update 1').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ A GROUP id:A ag-Grid-AutoColumn:"A" label:"a"
            │ ├── C LEAF id:C ag-Grid-AutoColumn:"C" label:"c2"
            │ └── D LEAF id:D ag-Grid-AutoColumn:"D" label:"b2"
            ├─┬ S GROUP id:S ag-Grid-AutoColumn:"S" label:"s2"
            │ └── t LEAF id:t ag-Grid-AutoColumn:"t" label:"t2"
            └─┬ P GROUP id:P ag-Grid-AutoColumn:"P" label:"p2"
            · ├── R LEAF id:R ag-Grid-AutoColumn:"R" label:"r2"
            · └── Q LEAF id:Q ag-Grid-AutoColumn:"Q" label:"q2"
        `);
    });

    test('tree data setRowData with id maintains selection and expanded state, and follows order', async () => {
        const rowData1 = [
            {
                id: 'g0',
                x: 'A',
                label: 'g-A',
                children: [
                    {
                        id: '1',
                        x: 'B',
                        label: '1-v1',
                        children: [{ id: '8', x: 'C', label: '8-v1' }],
                    },
                ],
            },
            {
                id: 'g1',
                x: 'C',
                label: 'g-C',
                children: [{ id: '3', x: 'D', label: '3-v1' }],
            },
            {
                id: 'g2',
                x: 'P',
                label: 'g-P',
                children: [{ id: '4', x: 'Q', label: '4-v1' }],
            },
            {
                id: 'g3',
                x: 'R',
                label: 'g-R',
                children: [{ id: '5', x: 'S', label: '5-v1' }],
            },
            { id: '6', x: 'M', label: '6-v1' },
            { id: '7', x: 'N', label: '7-v1' },
        ];

        const rowData2 = [
            { id: '7', x: 'N', label: '7-v2' },
            {
                id: 'g0',
                x: 'R',
                label: 'g-R',
                children: [{ id: '5', x: 'S', label: '5-v2' }],
            },
            {
                id: 'g4',
                x: 'X',
                label: 'g-X',
                children: [
                    {
                        id: '2',
                        x: 'Y',
                        label: '2-v2',
                        children: [{ id: '1', x: 'Z', label: '1-v2' }],
                    },
                ],
            },
            {
                id: 'g5',
                x: 'P',
                label: 'g-P',
                children: [{ id: '4', x: 'Q', label: '4-v2' }],
            },
            { id: '6', x: 'M', label: '6-v2' },
        ];

        const rowData3 = [
            { id: '100', x: 'a', label: '100-v3' },
            {
                id: 'g3',
                x: 'C',
                label: 'g-C',
                children: [{ id: '3', x: 'D', label: '3-v3' }],
            },
        ];

        const rowData4 = [
            { id: '100', x: 'a', label: '100-v3' },
            {
                id: 'g0',
                x: 'C',
                label: 'g-C',
                children: [{ id: '3', x: 'D', label: '3-v3' }],
            },
        ];

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'label' }, { field: 'x' }],
            autoGroupColumnDef: { headerName: 'path' },
            treeData: true,
            treeDataChildrenField: 'children',
            animateRows: false,
            groupDefaultExpanded: -1,
            rowData: [],
            rowSelection: {
                mode: 'multiRow',
            },
            getRowId: (params) => params.data.id,
        });

        setRowDataChecked(api, rowData1);

        // set B collapsed (a leaf)
        api.setRowNodeExpanded(api.getRowNode('1')!, false, undefined, true);

        // set P collapsed (a filler node group, that is going to be moved)
        api.setRowNodeExpanded(api.getRowNode('4')!.parent!, false, undefined, true);

        // set R collapsed (a filler node group, that is not going to be moved)
        api.setRowNodeExpanded(api.getRowNode('5')!.parent!, false, undefined, true);

        // Select all nodes
        api.selectAll();

        await new GridRows(api, 'update 0').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ g0 GROUP selected id:g0 ag-Grid-AutoColumn:"g0" label:"g-A" x:"A"
            │ └─┬ 1 GROUP selected collapsed id:1 ag-Grid-AutoColumn:"1" label:"1-v1" x:"B"
            │ · └── 8 LEAF selected hidden id:8 ag-Grid-AutoColumn:"8" label:"8-v1" x:"C"
            ├─┬ g1 GROUP selected id:g1 ag-Grid-AutoColumn:"g1" label:"g-C" x:"C"
            │ └── 3 LEAF selected id:3 ag-Grid-AutoColumn:"3" label:"3-v1" x:"D"
            ├─┬ g2 GROUP selected collapsed id:g2 ag-Grid-AutoColumn:"g2" label:"g-P" x:"P"
            │ └── 4 LEAF selected hidden id:4 ag-Grid-AutoColumn:"4" label:"4-v1" x:"Q"
            ├─┬ g3 GROUP selected collapsed id:g3 ag-Grid-AutoColumn:"g3" label:"g-R" x:"R"
            │ └── 5 LEAF selected hidden id:5 ag-Grid-AutoColumn:"5" label:"5-v1" x:"S"
            ├── 6 LEAF selected id:6 ag-Grid-AutoColumn:"6" label:"6-v1" x:"M"
            └── 7 LEAF selected id:7 ag-Grid-AutoColumn:"7" label:"7-v1" x:"N"
        `);

        setRowDataChecked(api, rowData2);

        await new GridRows(api, 'update 1').check(`
            ROOT id:ROOT_NODE_ID
            ├── 7 LEAF selected id:7 ag-Grid-AutoColumn:"7" label:"7-v2" x:"N"
            ├─┬ g0 GROUP selected id:g0 ag-Grid-AutoColumn:"g0" label:"g-R" x:"R"
            │ └── 5 LEAF selected id:5 ag-Grid-AutoColumn:"5" label:"5-v2" x:"S"
            ├─┬ g4 GROUP id:g4 ag-Grid-AutoColumn:"g4" label:"g-X" x:"X"
            │ └─┬ 2 GROUP id:2 ag-Grid-AutoColumn:"2" label:"2-v2" x:"Y"
            │ · └── 1 LEAF selected id:1 ag-Grid-AutoColumn:"1" label:"1-v2" x:"Z"
            ├─┬ g5 GROUP id:g5 ag-Grid-AutoColumn:"g5" label:"g-P" x:"P"
            │ └── 4 LEAF selected id:4 ag-Grid-AutoColumn:"4" label:"4-v2" x:"Q"
            └── 6 LEAF selected id:6 ag-Grid-AutoColumn:"6" label:"6-v2" x:"M"
        `);

        setRowDataChecked(api, rowData3);
        api.getRowNode('g3')!.setExpanded(false, undefined, true);

        await new GridRows(api, 'update 2').check(`
            ROOT id:ROOT_NODE_ID
            ├── 100 LEAF id:100 ag-Grid-AutoColumn:"100" label:"100-v3" x:"a"
            └─┬ g3 GROUP collapsed id:g3 ag-Grid-AutoColumn:"g3" label:"g-C" x:"C"
            · └── 3 LEAF hidden id:3 ag-Grid-AutoColumn:"3" label:"3-v3" x:"D"
        `);

        setRowDataChecked(api, rowData3);
        await new GridRows(api, 'update 2 (repeat)').check(`
            ROOT id:ROOT_NODE_ID
            ├── 100 LEAF id:100 ag-Grid-AutoColumn:"100" label:"100-v3" x:"a"
            └─┬ g3 GROUP collapsed id:g3 ag-Grid-AutoColumn:"g3" label:"g-C" x:"C"
            · └── 3 LEAF hidden id:3 ag-Grid-AutoColumn:"3" label:"3-v3" x:"D"
        `);

        setRowDataChecked(api, rowData4);

        await new GridRows(api, 'update 3').check(`
            ROOT id:ROOT_NODE_ID
            ├── 100 LEAF id:100 ag-Grid-AutoColumn:"100" label:"100-v3" x:"a"
            └─┬ g0 GROUP id:g0 ag-Grid-AutoColumn:"g0" label:"g-C" x:"C"
            · └── 3 LEAF id:3 ag-Grid-AutoColumn:"3" label:"3-v3" x:"D"
        `);

        setRowDataChecked(api, []);

        await new GridRows(api, 'cleared').check('empty');
    });
});
