import { setTimeout as asyncSetTimeout } from 'timers/promises';
import type { MockInstance } from 'vitest';

import { ClientSideRowModelModule } from 'ag-grid-community';
import { TreeDataModule } from 'ag-grid-enterprise';

import { GridRows, TestGridsManager, cachedJSONObjects, setRowDataChecked } from '../../test-utils';

const getDataPath = (data: any) => data.orgHierarchy;

describe('ag-grid tree data reset', () => {
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
            { id: '1', orgHierarchy: ['A', 'B'] },
            { id: '3', orgHierarchy: ['C', 'D'] },
        ];

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [],
            autoGroupColumnDef: { headerName: 'Organisation Hierarchy' },
            treeData: true,
            animateRows: false,
            groupDefaultExpanded: -1,
            rowData: rowData,
            getDataPath,
            getRowId: (params) => params.data.id,
        });

        await new GridRows(api, 'initial').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ A filler id:row-group-0-A ag-Grid-AutoColumn:"A"
            │ └── B LEAF id:1 ag-Grid-AutoColumn:"B"
            └─┬ C filler id:row-group-0-C ag-Grid-AutoColumn:"C"
            · └── D LEAF id:3 ag-Grid-AutoColumn:"D"
        `);

        setRowDataChecked(api, rowData);

        await new GridRows(api, 'update 1').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ A filler id:row-group-0-A ag-Grid-AutoColumn:"A"
            │ └── B LEAF id:1 ag-Grid-AutoColumn:"B"
            └─┬ C filler id:row-group-0-C ag-Grid-AutoColumn:"C"
            · └── D LEAF id:3 ag-Grid-AutoColumn:"D"
        `);

        rowData.reverse();
        setRowDataChecked(api, rowData);

        await new GridRows(api, 'update 2').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ C filler id:row-group-0-C ag-Grid-AutoColumn:"C"
            │ └── D LEAF id:3 ag-Grid-AutoColumn:"D"
            └─┬ A filler id:row-group-0-A ag-Grid-AutoColumn:"A"
            · └── B LEAF id:1 ag-Grid-AutoColumn:"B"
        `);
    });

    test('tree data async loading', async () => {
        const rowData1 = [{ id: '1', orgHierarchy: ['A', 'B'] }];
        const rowData2 = [{ id: '2', orgHierarchy: ['C', 'D'] }];

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [],
            autoGroupColumnDef: { headerName: 'Organisation Hierarchy' },
            treeData: true,
            animateRows: false,
            groupDefaultExpanded: -1,
            getDataPath,
            getRowId: (params) => params.data.id,
        });

        await asyncSetTimeout(1); // Simulate async loading

        setRowDataChecked(api, rowData1);

        await new GridRows(api, 'initial').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ A filler id:row-group-0-A ag-Grid-AutoColumn:"A"
            · └── B LEAF id:1 ag-Grid-AutoColumn:"B"
        `);

        await asyncSetTimeout(1); // Simulate async re-loading

        setRowDataChecked(api, rowData2);

        await new GridRows(api, 'updated').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ C filler id:row-group-0-C ag-Grid-AutoColumn:"C"
            · └── D LEAF id:2 ag-Grid-AutoColumn:"D"
        `);
    });

    test('setting rowData without id keeps the tree data structure correct', async () => {
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [],
            treeData: true,
            animateRows: false,
            groupDefaultExpanded: -1,
            getDataPath,
        });

        const rowData1 = cachedJSONObjects.array([
            { orgHierarchy: ['A', 'B'], x: 0 },
            { orgHierarchy: ['P', 'Q'], x: 1 },
            { orgHierarchy: ['C', 'D'], x: 2 },
            { orgHierarchy: ['P', 'R'], x: 3 },
            { orgHierarchy: ['X', 'Y'], x: 4 },
        ]);

        const rowData2 = cachedJSONObjects.array([
            { orgHierarchy: ['D', 'E', 'F'], x: 4 },
            { orgHierarchy: ['D', 'E'], x: 5 },
            { orgHierarchy: ['P', 'R'], x: 6 },
            { orgHierarchy: ['P', 'Q'], x: 7 },
        ]);

        setRowDataChecked(api, rowData1);

        await new GridRows(api, 'update 0').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ A filler id:row-group-0-A ag-Grid-AutoColumn:"A"
            │ └── B LEAF id:0 ag-Grid-AutoColumn:"B"
            ├─┬ P filler id:row-group-0-P ag-Grid-AutoColumn:"P"
            │ ├── Q LEAF id:1 ag-Grid-AutoColumn:"Q"
            │ └── R LEAF id:3 ag-Grid-AutoColumn:"R"
            ├─┬ C filler id:row-group-0-C ag-Grid-AutoColumn:"C"
            │ └── D LEAF id:2 ag-Grid-AutoColumn:"D"
            └─┬ X filler id:row-group-0-X ag-Grid-AutoColumn:"X"
            · └── Y LEAF id:4 ag-Grid-AutoColumn:"Y"
        `);

        setRowDataChecked(api, rowData2);

        await new GridRows(api, 'update 1').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ D filler id:row-group-0-D ag-Grid-AutoColumn:"D"
            │ └─┬ E GROUP id:1 ag-Grid-AutoColumn:"E"
            │ · └── F LEAF id:0 ag-Grid-AutoColumn:"F"
            └─┬ P filler id:row-group-0-P ag-Grid-AutoColumn:"P"
            · ├── R LEAF id:2 ag-Grid-AutoColumn:"R"
            · └── Q LEAF id:3 ag-Grid-AutoColumn:"Q"
        `);

        setRowDataChecked(api, []);

        await new GridRows(api, 'empty').check('empty');
    });

    test('tree data with id ordering of fillers is consistent', async () => {
        const rowData = cachedJSONObjects.array([
            { id: 'b', orgHierarchy: ['B'] },
            { id: 'd', orgHierarchy: ['C', 'D'] },
            { id: 'e', orgHierarchy: ['E'] },
        ]);

        const rowData2 = cachedJSONObjects.array([
            { id: 'a', orgHierarchy: ['A'] },
            ...rowData,
            { id: 'g', orgHierarchy: ['F', 'G'] },
            { id: 'f', orgHierarchy: ['F'] },
        ]);

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [],
            autoGroupColumnDef: { headerName: 'Organisation Hierarchy' },
            treeData: true,
            animateRows: false,
            groupDefaultExpanded: -1,
            rowData: [],
            getDataPath,
            getRowId: (params) => params.data.id,
        });

        setRowDataChecked(api, rowData);

        await new GridRows(api, 'update 0').check(`
            ROOT id:ROOT_NODE_ID
            ├── B LEAF id:b ag-Grid-AutoColumn:"B"
            ├─┬ C filler id:row-group-0-C ag-Grid-AutoColumn:"C"
            │ └── D LEAF id:d ag-Grid-AutoColumn:"D"
            └── E LEAF id:e ag-Grid-AutoColumn:"E"
        `);

        setRowDataChecked(api, rowData2);

        await new GridRows(api, 'update1').check(`
            ROOT id:ROOT_NODE_ID
            ├── A LEAF id:a ag-Grid-AutoColumn:"A"
            ├── B LEAF id:b ag-Grid-AutoColumn:"B"
            ├─┬ C filler id:row-group-0-C ag-Grid-AutoColumn:"C"
            │ └── D LEAF id:d ag-Grid-AutoColumn:"D"
            ├── E LEAF id:e ag-Grid-AutoColumn:"E"
            └─┬ F GROUP id:f ag-Grid-AutoColumn:"F"
            · └── G LEAF id:g ag-Grid-AutoColumn:"G"
        `);
    });

    test('tree data with id order matches', async () => {
        const rowData = [
            { id: 'r', orgHierarchy: ['P', 'R'] },
            { id: 'q', orgHierarchy: ['P', 'Q'] },
            { id: 'c', orgHierarchy: ['A', 'C'] },
            { id: 'p', orgHierarchy: ['P'] },
            { id: 's', orgHierarchy: ['S'] },
            { id: 'b', orgHierarchy: ['A', 'B'] },
            { id: 't', orgHierarchy: ['S', 'T'] },
        ];

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [],
            autoGroupColumnDef: { headerName: 'Organisation Hierarchy' },
            treeData: true,
            animateRows: false,
            groupDefaultExpanded: -1,
            rowData: [],
            getDataPath,
            getRowId: (params) => params.data.id,
        });

        setRowDataChecked(api, rowData);

        await new GridRows(api, 'update 0').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ A filler id:row-group-0-A ag-Grid-AutoColumn:"A"
            │ ├── C LEAF id:c ag-Grid-AutoColumn:"C"
            │ └── B LEAF id:b ag-Grid-AutoColumn:"B"
            ├─┬ P GROUP id:p ag-Grid-AutoColumn:"P"
            │ ├── R LEAF id:r ag-Grid-AutoColumn:"R"
            │ └── Q LEAF id:q ag-Grid-AutoColumn:"Q"
            └─┬ S GROUP id:s ag-Grid-AutoColumn:"S"
            · └── T LEAF id:t ag-Grid-AutoColumn:"T"
        `);
    });

    test('tree data with only leafs can be reordered (same references)', async () => {
        const rowData1 = cachedJSONObjects.array([
            { id: '0', orgHierarchy: ['0'] },
            { id: '1', orgHierarchy: ['1'] },
            { id: '2', orgHierarchy: ['2'] },
            { id: '3', orgHierarchy: ['3'] },
            { id: '4', orgHierarchy: ['4'] },
            { id: '5', orgHierarchy: ['5'] },
        ]);

        const rowData2 = cachedJSONObjects.array([
            { id: '1', orgHierarchy: ['1'] },
            { id: '5', orgHierarchy: ['5'] },
            { id: '2', orgHierarchy: ['2'] },
            { id: '4', orgHierarchy: ['4'] },
            { id: '0', orgHierarchy: ['0'] },
            { id: '3', orgHierarchy: ['3'] },
        ]);

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [],
            autoGroupColumnDef: { headerName: 'x' },
            treeData: true,
            animateRows: false,
            groupDefaultExpanded: -1,
            rowData: [],
            getDataPath,
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

    test('tree data with id can be reordered (same references)', async () => {
        const rowData1 = cachedJSONObjects.array([
            { id: '0', orgHierarchy: ['0'] },
            { id: 'd', orgHierarchy: ['A', 'B', 'C', 'D'] },
            { id: 'f', orgHierarchy: ['A', 'B', 'F'] },
            { id: 'g', orgHierarchy: ['G'] },
            { id: 'e', orgHierarchy: ['A', 'B', 'C', 'E'] },
            { id: 'h', orgHierarchy: ['H'] },
        ]);

        const rowData2 = cachedJSONObjects.array([
            { id: '0', orgHierarchy: ['0'] },
            { id: 'f', orgHierarchy: ['A', 'B', 'F'] },
            { id: 'e', orgHierarchy: ['A', 'B', 'C', 'E'] },
            { id: 'g', orgHierarchy: ['G'] },
            { id: 'h', orgHierarchy: ['H'] },
            { id: 'd', orgHierarchy: ['A', 'B', 'C', 'D'] },
        ]);

        const rowData3 = cachedJSONObjects.array([
            { id: '0', orgHierarchy: ['0'] },
            { id: 'g', orgHierarchy: ['G'] },
            { id: 'e', orgHierarchy: ['A', 'B', 'C', 'E'] },
            { id: 'h', orgHierarchy: ['H'] },
            { id: 'f', orgHierarchy: ['A', 'B', 'F'] },
            { id: 'd', orgHierarchy: ['A', 'B', 'C', 'D'] },
        ]);

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [],
            autoGroupColumnDef: { headerName: 'Organisation Hierarchy' },
            treeData: true,
            animateRows: false,
            groupDefaultExpanded: -1,
            rowData: [],
            getDataPath,
            getRowId: (params) => params.data.id,
        });

        setRowDataChecked(api, rowData1);
        setRowDataChecked(api, rowData1);

        let gridRows = new GridRows(api, 'update 1');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── 0 LEAF id:0 ag-Grid-AutoColumn:"0"
            ├─┬ A filler id:row-group-0-A ag-Grid-AutoColumn:"A"
            │ └─┬ B filler id:row-group-0-A-1-B ag-Grid-AutoColumn:"B"
            │ · ├─┬ C filler id:row-group-0-A-1-B-2-C ag-Grid-AutoColumn:"C"
            │ · │ ├── D LEAF id:d ag-Grid-AutoColumn:"D"
            │ · │ └── E LEAF id:e ag-Grid-AutoColumn:"E"
            │ · └── F LEAF id:f ag-Grid-AutoColumn:"F"
            ├── G LEAF id:g ag-Grid-AutoColumn:"G"
            └── H LEAF id:h ag-Grid-AutoColumn:"H"
        `);
        expect(gridRows.rootAllLeafChildren.map((row) => row.data)).toEqual(rowData1);

        setRowDataChecked(api, rowData2);

        gridRows = new GridRows(api, 'update 2');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── 0 LEAF id:0 ag-Grid-AutoColumn:"0"
            ├─┬ A filler id:row-group-0-A ag-Grid-AutoColumn:"A"
            │ └─┬ B filler id:row-group-0-A-1-B ag-Grid-AutoColumn:"B"
            │ · ├── F LEAF id:f ag-Grid-AutoColumn:"F"
            │ · └─┬ C filler id:row-group-0-A-1-B-2-C ag-Grid-AutoColumn:"C"
            │ · · ├── E LEAF id:e ag-Grid-AutoColumn:"E"
            │ · · └── D LEAF id:d ag-Grid-AutoColumn:"D"
            ├── G LEAF id:g ag-Grid-AutoColumn:"G"
            └── H LEAF id:h ag-Grid-AutoColumn:"H"
        `);
        expect(gridRows.rootAllLeafChildren.map((row) => row.data)).toEqual(rowData2);

        setRowDataChecked(api, []);
        setRowDataChecked(api, rowData3);

        gridRows = new GridRows(api, 'update 3');
        await gridRows.check(`
            ROOT id:ROOT_NODE_ID
            ├── 0 LEAF id:0 ag-Grid-AutoColumn:"0"
            ├── G LEAF id:g ag-Grid-AutoColumn:"G"
            ├─┬ A filler id:row-group-0-A ag-Grid-AutoColumn:"A"
            │ └─┬ B filler id:row-group-0-A-1-B ag-Grid-AutoColumn:"B"
            │ · ├─┬ C filler id:row-group-0-A-1-B-2-C ag-Grid-AutoColumn:"C"
            │ · │ ├── E LEAF id:e ag-Grid-AutoColumn:"E"
            │ · │ └── D LEAF id:d ag-Grid-AutoColumn:"D"
            │ · └── F LEAF id:f ag-Grid-AutoColumn:"F"
            └── H LEAF id:h ag-Grid-AutoColumn:"H"
        `);
        expect(gridRows.rootAllLeafChildren.map((row) => row.data)).toEqual(rowData3);
    });

    test('can reorder two leafs without changing references', async () => {
        const rowData = [
            { id: 'A', path: ['A'] },
            { id: 'B', path: ['A', 'B'] },
            { id: 'C', path: ['A', 'C'] },
            { id: 'D', path: ['A', 'B', 'D'] },
            { id: 'E', path: ['A', 'B', 'E'] },
            { id: 'F', path: ['A', 'B', 'F'] },
        ];

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [],
            autoGroupColumnDef: { headerName: 'path' },
            treeData: true,
            animateRows: false,
            groupDefaultExpanded: -1,
            rowData,
            getDataPath: (data) => data.path,
            getRowId: (params) => params.data.id,
        });

        await new GridRows(api, 'update 0').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ A GROUP id:A ag-Grid-AutoColumn:"A"
            · ├─┬ B GROUP id:B ag-Grid-AutoColumn:"B"
            · │ ├── D LEAF id:D ag-Grid-AutoColumn:"D"
            · │ ├── E LEAF id:E ag-Grid-AutoColumn:"E"
            · │ └── F LEAF id:F ag-Grid-AutoColumn:"F"
            · └── C LEAF id:C ag-Grid-AutoColumn:"C"
        `);

        const rowData1 = rowData.slice();
        // Swap D and F
        rowData1[3] = rowData[5];
        rowData1[5] = rowData[3];
        setRowDataChecked(api, rowData1);

        await new GridRows(api, 'update 1').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ A GROUP id:A ag-Grid-AutoColumn:"A"
            · ├─┬ B GROUP id:B ag-Grid-AutoColumn:"B"
            · │ ├── F LEAF id:F ag-Grid-AutoColumn:"F"
            · │ ├── E LEAF id:E ag-Grid-AutoColumn:"E"
            · │ └── D LEAF id:D ag-Grid-AutoColumn:"D"
            · └── C LEAF id:C ag-Grid-AutoColumn:"C"
        `);

        const rowData2 = rowData1.slice();
        // Swap B and C
        rowData2[1] = rowData1[4];
        rowData2[4] = rowData1[1];
        setRowDataChecked(api, rowData2);

        await new GridRows(api, 'update 1').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ A GROUP id:A ag-Grid-AutoColumn:"A"
            · ├── C LEAF id:C ag-Grid-AutoColumn:"C"
            · └─┬ B GROUP id:B ag-Grid-AutoColumn:"B"
            · · ├── E LEAF id:E ag-Grid-AutoColumn:"E"
            · · ├── F LEAF id:F ag-Grid-AutoColumn:"F"
            · · └── D LEAF id:D ag-Grid-AutoColumn:"D"
        `);
    });

    test('tree data with id can be reordered and updated', async () => {
        const rowData1 = [
            { id: 'b', orgHierarchy: ['A', 'B'], label: 'b1' },
            { id: 'c', orgHierarchy: ['A', 'C'], label: 'c1' },
            { id: 'p', orgHierarchy: ['P'], label: 'p1' },
            { id: 'q', orgHierarchy: ['P', 'Q'], label: 'q1' },
            { id: 'r', orgHierarchy: ['P', 'R'], label: 'r1' },
            { id: 's', orgHierarchy: ['S'], label: 's1' },
            { id: 't', orgHierarchy: ['S', 'T'], label: 't1' },
        ];

        const rowData2 = [
            { id: 'r', orgHierarchy: ['P', 'R'], label: 'r2' },
            { id: 'q', orgHierarchy: ['P', 'Q'], label: 'q2' },
            { id: 'c', orgHierarchy: ['A', 'C'], label: 'c2' },
            { id: 's', orgHierarchy: ['S'], label: 's2' },
            { id: 'p', orgHierarchy: ['P'], label: 'p2' },
            { id: 'b', orgHierarchy: ['A', 'B'], label: 'b2' },
            { id: 't', orgHierarchy: ['S', 'T'], label: 't2' },
        ];

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'label' }],
            autoGroupColumnDef: { headerName: 'Organisation Hierarchy' },
            treeData: true,
            animateRows: false,
            groupDefaultExpanded: -1,
            rowData: [],
            getDataPath,
            getRowId: (params) => params.data.id,
        });

        setRowDataChecked(api, rowData1);

        await new GridRows(api, 'update 0').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ A filler id:row-group-0-A ag-Grid-AutoColumn:"A"
            │ ├── B LEAF id:b ag-Grid-AutoColumn:"B" label:"b1"
            │ └── C LEAF id:c ag-Grid-AutoColumn:"C" label:"c1"
            ├─┬ P GROUP id:p ag-Grid-AutoColumn:"P" label:"p1"
            │ ├── Q LEAF id:q ag-Grid-AutoColumn:"Q" label:"q1"
            │ └── R LEAF id:r ag-Grid-AutoColumn:"R" label:"r1"
            └─┬ S GROUP id:s ag-Grid-AutoColumn:"S" label:"s1"
            · └── T LEAF id:t ag-Grid-AutoColumn:"T" label:"t1"
        `);

        setRowDataChecked(api, rowData2);

        await new GridRows(api, 'update 1').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ A filler id:row-group-0-A ag-Grid-AutoColumn:"A"
            │ ├── C LEAF id:c ag-Grid-AutoColumn:"C" label:"c2"
            │ └── B LEAF id:b ag-Grid-AutoColumn:"B" label:"b2"
            ├─┬ S GROUP id:s ag-Grid-AutoColumn:"S" label:"s2"
            │ └── T LEAF id:t ag-Grid-AutoColumn:"T" label:"t2"
            └─┬ P GROUP id:p ag-Grid-AutoColumn:"P" label:"p2"
            · ├── R LEAF id:r ag-Grid-AutoColumn:"R" label:"r2"
            · └── Q LEAF id:q ag-Grid-AutoColumn:"Q" label:"q2"
        `);
    });

    test('tree data setRowData with id maintains selection and expanded state, and conservative ordering', async () => {
        const rowData1 = [
            { id: '1', orgHierarchy: ['A', 'B'], label: '1-v1' },
            { id: '3', orgHierarchy: ['C', 'D'], label: '3-v1' },
            { id: '4', orgHierarchy: ['P', 'Q'], label: '4-v1' },
            { id: '5', orgHierarchy: ['R', 'S'], label: '5-v1' },
            { id: '6', orgHierarchy: ['M'], label: '6-v1' },
            { id: '7', orgHierarchy: ['N'], label: '7-v1' },
            { id: '8', orgHierarchy: ['A', 'B', 'C'], label: '8-v1' },
        ];

        const rowData2 = [
            { id: '7', orgHierarchy: ['N'], label: '7-v2' },
            { id: '5', orgHierarchy: ['R', 'S'], label: '5-v2' },
            { id: '1', orgHierarchy: ['X', 'Y', 'Z'], x: 2, label: '1-v2' },
            { id: '2', orgHierarchy: ['X', 'Y'], x: 3, label: '2-v2' },
            { id: '4', orgHierarchy: ['P', 'Q'], label: '4-v2' },
            { id: '6', orgHierarchy: ['M'], label: '6-v2' },
        ];

        const rowData3 = [
            { id: '100', orgHierarchy: ['a'], label: '100-v3' },
            { id: '3', orgHierarchy: ['C', 'D'], label: '3-v3' },
        ];

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'label' }],
            autoGroupColumnDef: { headerName: 'path' },
            treeData: true,
            animateRows: false,
            groupDefaultExpanded: -1,
            rowData: [],
            rowSelection: {
                mode: 'multiRow',
            },
            getDataPath,
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
            ├─┬ A filler selected id:row-group-0-A ag-Grid-AutoColumn:"A"
            │ └─┬ B GROUP selected collapsed id:1 ag-Grid-AutoColumn:"B" label:"1-v1"
            │ · └── C LEAF selected hidden id:8 ag-Grid-AutoColumn:"C" label:"8-v1"
            ├─┬ C filler selected id:row-group-0-C ag-Grid-AutoColumn:"C"
            │ └── D LEAF selected id:3 ag-Grid-AutoColumn:"D" label:"3-v1"
            ├─┬ P filler selected collapsed id:row-group-0-P ag-Grid-AutoColumn:"P"
            │ └── Q LEAF selected hidden id:4 ag-Grid-AutoColumn:"Q" label:"4-v1"
            ├─┬ R filler selected collapsed id:row-group-0-R ag-Grid-AutoColumn:"R"
            │ └── S LEAF selected hidden id:5 ag-Grid-AutoColumn:"S" label:"5-v1"
            ├── M LEAF selected id:6 ag-Grid-AutoColumn:"M" label:"6-v1"
            └── N LEAF selected id:7 ag-Grid-AutoColumn:"N" label:"7-v1"
        `);

        setRowDataChecked(api, rowData2);

        await new GridRows(api, 'update 1').check(`
            ROOT id:ROOT_NODE_ID
            ├── N LEAF selected id:7 ag-Grid-AutoColumn:"N" label:"7-v2" 
            ├─┬ R filler selected collapsed id:row-group-0-R ag-Grid-AutoColumn:"R"
            │ └── S LEAF selected hidden id:5 ag-Grid-AutoColumn:"S" label:"5-v2"
            ├─┬ X filler id:row-group-0-X ag-Grid-AutoColumn:"X"
            │ └─┬ Y GROUP id:2 ag-Grid-AutoColumn:"Y" label:"2-v2"
            │ · └── Z LEAF selected id:1 ag-Grid-AutoColumn:"Z" label:"1-v2"
            ├─┬ P filler selected collapsed id:row-group-0-P ag-Grid-AutoColumn:"P"
            │ └── Q LEAF selected hidden id:4 ag-Grid-AutoColumn:"Q" label:"4-v2"
            └── M LEAF selected id:6 ag-Grid-AutoColumn:"M" label:"6-v2"
        `);
        setRowDataChecked(api, rowData3);

        await new GridRows(api, 'update 2').check(`
            ROOT id:ROOT_NODE_ID
            ├── a LEAF id:100 ag-Grid-AutoColumn:"a" label:"100-v3"
            └─┬ C filler id:row-group-0-C ag-Grid-AutoColumn:"C"
            · └── D LEAF id:3 ag-Grid-AutoColumn:"D" label:"3-v3"
        `);

        setRowDataChecked(api, []);

        await new GridRows(api, 'cleared').check('empty');
    });

    test('remove, update path and order, add', async () => {
        const rowData1 = cachedJSONObjects.array([
            { id: '0', orgHierarchy: ['A', 'B'] },
            { id: '1', orgHierarchy: ['A', 'B', 'C'] },
            { id: '2', orgHierarchy: ['A', 'B', 'D'] },
            { id: '3', orgHierarchy: ['A', 'B', 'E'] },
            { id: '4', orgHierarchy: ['A', 'B', 'F'] },
            { id: '5', orgHierarchy: ['A', 'B', 'G'] },
            { id: '6', orgHierarchy: ['C', 'B'] },
            { id: '7', orgHierarchy: ['C', 'B', 'C'] },
            { id: '8', orgHierarchy: ['C', 'B', 'D'] },
            { id: '9', orgHierarchy: ['D'] },
        ]);

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [],
            treeData: true,
            animateRows: false,
            groupDefaultExpanded: -1,
            rowData: rowData1,
            getDataPath,
            getRowId: (params) => params.data.id,
        });

        await new GridRows(api, 'update 0').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ A filler id:row-group-0-A ag-Grid-AutoColumn:"A"
            │ └─┬ B GROUP id:0 ag-Grid-AutoColumn:"B"
            │ · ├── C LEAF id:1 ag-Grid-AutoColumn:"C"
            │ · ├── D LEAF id:2 ag-Grid-AutoColumn:"D"
            │ · ├── E LEAF id:3 ag-Grid-AutoColumn:"E"
            │ · ├── F LEAF id:4 ag-Grid-AutoColumn:"F"
            │ · └── G LEAF id:5 ag-Grid-AutoColumn:"G"
            ├─┬ C filler id:row-group-0-C ag-Grid-AutoColumn:"C"
            │ └─┬ B GROUP id:6 ag-Grid-AutoColumn:"B"
            │ · ├── C LEAF id:7 ag-Grid-AutoColumn:"C"
            │ · └── D LEAF id:8 ag-Grid-AutoColumn:"D"
            └── D LEAF id:9 ag-Grid-AutoColumn:"D"
        `);

        api.setGridOption(
            'rowData',
            cachedJSONObjects.array([
                { id: '2', orgHierarchy: ['A', 'B', 'X'] },
                { id: '9', orgHierarchy: ['D'] },
                { id: '8', orgHierarchy: ['C', 'B', 'R'] },
                { id: '0', orgHierarchy: ['A', 'B'] },
                { id: '4', orgHierarchy: ['A', 'B', 'F'] },
                { id: '1', orgHierarchy: ['A', 'B', 'Y'] },
                { id: '5', orgHierarchy: ['A', 'B', 'Z'] },
                { id: '11', orgHierarchy: ['A', 'Q'] },
                { id: '7', orgHierarchy: ['C', 'B', 'W'] },
                { id: '6', orgHierarchy: ['C', 'B'] },
                { id: '12', orgHierarchy: ['C', 'U'] },
                { id: '10', orgHierarchy: ['C', 'N'] },
            ])
        );

        await new GridRows(api, 'update 1').check(`
            ROOT id:ROOT_NODE_ID
            ├── D LEAF id:9 ag-Grid-AutoColumn:"D"
            ├─┬ A filler id:row-group-0-A ag-Grid-AutoColumn:"A"
            │ ├─┬ B GROUP id:0 ag-Grid-AutoColumn:"B"
            │ │ ├── X LEAF id:2 ag-Grid-AutoColumn:"X"
            │ │ ├── F LEAF id:4 ag-Grid-AutoColumn:"F"
            │ │ ├── Y LEAF id:1 ag-Grid-AutoColumn:"Y"
            │ │ └── Z LEAF id:5 ag-Grid-AutoColumn:"Z"
            │ └── Q LEAF id:11 ag-Grid-AutoColumn:"Q"
            └─┬ C filler id:row-group-0-C ag-Grid-AutoColumn:"C"
            · ├─┬ B GROUP id:6 ag-Grid-AutoColumn:"B"
            · │ ├── R LEAF id:8 ag-Grid-AutoColumn:"R"
            · │ └── W LEAF id:7 ag-Grid-AutoColumn:"W"
            · ├── U LEAF id:12 ag-Grid-AutoColumn:"U"
            · └── N LEAF id:10 ag-Grid-AutoColumn:"N"
        `);
    });

    test('can reorder two leafs without changing references', async () => {
        const rowData = [
            { id: 'A', path: ['A'] },
            { id: 'B', path: ['A', 'B'] },
            { id: 'C', path: ['A', 'C'] },
            { id: 'D', path: ['A', 'B', 'D'] },
            { id: 'E', path: ['A', 'B', 'E'] },
            { id: 'F', path: ['A', 'B', 'F'] },
        ];

        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [],
            autoGroupColumnDef: { headerName: 'path' },
            treeData: true,
            animateRows: false,
            groupDefaultExpanded: -1,
            rowData,
            getDataPath: (data) => data.path,
            getRowId: (params) => params.data.id,
        });

        await new GridRows(api, 'update 0').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ A GROUP id:A ag-Grid-AutoColumn:"A"
            · ├─┬ B GROUP id:B ag-Grid-AutoColumn:"B"
            · │ ├── D LEAF id:D ag-Grid-AutoColumn:"D"
            · │ ├── E LEAF id:E ag-Grid-AutoColumn:"E"
            · │ └── F LEAF id:F ag-Grid-AutoColumn:"F"
            · └── C LEAF id:C ag-Grid-AutoColumn:"C"
        `);

        const rowData1 = rowData.slice();
        // Swap D and F
        rowData1[3] = rowData[5];
        rowData1[5] = rowData[3];
        setRowDataChecked(api, rowData1);

        await new GridRows(api, 'update 1').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ A GROUP id:A ag-Grid-AutoColumn:"A"
            · ├─┬ B GROUP id:B ag-Grid-AutoColumn:"B"
            · │ ├── F LEAF id:F ag-Grid-AutoColumn:"F"
            · │ ├── E LEAF id:E ag-Grid-AutoColumn:"E"
            · │ └── D LEAF id:D ag-Grid-AutoColumn:"D"
            · └── C LEAF id:C ag-Grid-AutoColumn:"C"
        `);

        const rowData2 = rowData1.slice();
        // Swap B and C
        rowData2[1] = rowData1[4];
        rowData2[4] = rowData1[1];
        setRowDataChecked(api, rowData2);

        await new GridRows(api, 'update 1').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ A GROUP id:A ag-Grid-AutoColumn:"A"
            · ├── C LEAF id:C ag-Grid-AutoColumn:"C"
            · └─┬ B GROUP id:B ag-Grid-AutoColumn:"B"
            · · ├── E LEAF id:E ag-Grid-AutoColumn:"E"
            · · ├── F LEAF id:F ag-Grid-AutoColumn:"F"
            · · └── D LEAF id:D ag-Grid-AutoColumn:"D"
        `);
    });
});
