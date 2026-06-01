import { ClientSideRowModelModule } from 'ag-grid-community';
import { PivotModule, RowGroupingModule } from 'ag-grid-enterprise';

import { GridColumns, GridRows, TestGridsManager, applyTransactionChecked } from '../test-utils';

describe('Delta Sorting', () => {
    const gridMgr = new TestGridsManager({
        modules: [ClientSideRowModelModule],
    });

    test('delta sort keeps order', async () => {
        const rowCount = 20;
        const baseRowData = Array.from({ length: rowCount }, (_, i) => ({ id: `delta-${i}`, value: i }));

        const api = gridMgr.createGrid('deltaSortThirtyPercent', {
            columnDefs: [{ field: 'value' }],
            deltaSort: true,
            rowData: baseRowData,
            getRowId: (params) => params.data?.id,
        });

        api.applyColumnState({ state: [{ colId: 'value', sort: 'asc' }] });

        const updates = [
            { id: 'delta-1', value: 42 },
            { id: 'delta-4', value: -5 },
            { id: 'delta-7', value: 30 },
            { id: 'delta-10', value: 50 },
            { id: 'delta-13', value: 25 },
            { id: 'delta-16', value: 35 },
        ];
        expect(updates).toHaveLength(Math.floor(rowCount * 0.3));

        applyTransactionChecked(api, { update: updates });

        await new GridRows(api, 'delta sort updates 30%').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:delta-4 value:-5
            ├── LEAF id:delta-0 value:0
            ├── LEAF id:delta-2 value:2
            ├── LEAF id:delta-3 value:3
            ├── LEAF id:delta-5 value:5
            ├── LEAF id:delta-6 value:6
            ├── LEAF id:delta-8 value:8
            ├── LEAF id:delta-9 value:9
            ├── LEAF id:delta-11 value:11
            ├── LEAF id:delta-12 value:12
            ├── LEAF id:delta-14 value:14
            ├── LEAF id:delta-15 value:15
            ├── LEAF id:delta-17 value:17
            ├── LEAF id:delta-18 value:18
            ├── LEAF id:delta-19 value:19
            ├── LEAF id:delta-13 value:25
            ├── LEAF id:delta-7 value:30
            ├── LEAF id:delta-16 value:35
            ├── LEAF id:delta-1 value:42
            └── LEAF id:delta-10 value:50
        `);

        await new GridColumns(api, 'columns').checkColumns(`
            CENTER
            └── value "Value" width:200 sort:asc
        `);
    });

    test('delta sort preserves prior order for untouched rows', async () => {
        const baseData = Array.from({ length: 20 }, (_, i) => ({
            id: `delta-${i}`,
            value: i % 2 === 0 ? i : i + 10, // Mix values
        }));
        const api = gridMgr.createGrid('deltaSortUntouchedOrder', {
            columnDefs: [{ field: 'value' }],
            deltaSort: true,
            rowData: baseData,
            getRowId: (params) => params.data?.id,
        });

        api.applyColumnState({ state: [{ colId: 'value', sort: 'asc' }] });

        await new GridRows(api, 'initial sort').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:delta-0 value:0
            ├── LEAF id:delta-2 value:2
            ├── LEAF id:delta-4 value:4
            ├── LEAF id:delta-6 value:6
            ├── LEAF id:delta-8 value:8
            ├── LEAF id:delta-10 value:10
            ├── LEAF id:delta-1 value:11
            ├── LEAF id:delta-12 value:12
            ├── LEAF id:delta-3 value:13
            ├── LEAF id:delta-14 value:14
            ├── LEAF id:delta-5 value:15
            ├── LEAF id:delta-16 value:16
            ├── LEAF id:delta-7 value:17
            ├── LEAF id:delta-18 value:18
            ├── LEAF id:delta-9 value:19
            ├── LEAF id:delta-11 value:21
            ├── LEAF id:delta-13 value:23
            ├── LEAF id:delta-15 value:25
            ├── LEAF id:delta-17 value:27
            └── LEAF id:delta-19 value:29
        `);

        applyTransactionChecked(api, { update: [{ id: 'delta-10', value: -1 }] });

        await new GridRows(api, 'delta sort single update').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:delta-10 value:-1
            ├── LEAF id:delta-0 value:0
            ├── LEAF id:delta-2 value:2
            ├── LEAF id:delta-4 value:4
            ├── LEAF id:delta-6 value:6
            ├── LEAF id:delta-8 value:8
            ├── LEAF id:delta-1 value:11
            ├── LEAF id:delta-12 value:12
            ├── LEAF id:delta-3 value:13
            ├── LEAF id:delta-14 value:14
            ├── LEAF id:delta-5 value:15
            ├── LEAF id:delta-16 value:16
            ├── LEAF id:delta-7 value:17
            ├── LEAF id:delta-18 value:18
            ├── LEAF id:delta-9 value:19
            ├── LEAF id:delta-11 value:21
            ├── LEAF id:delta-13 value:23
            ├── LEAF id:delta-15 value:25
            ├── LEAF id:delta-17 value:27
            └── LEAF id:delta-19 value:29
        `);

        await new GridColumns(api, 'columns').checkColumns(`
            CENTER
            └── value "Value" width:200 sort:asc
        `);
    });

    test('delta sort handles adds and removes', async () => {
        const baseData = Array.from({ length: 20 }, (_, i) => ({
            id: `delta-${i}`,
            value: i * 5,
        }));
        const api = gridMgr.createGrid('deltaSortAddsRemoves', {
            columnDefs: [{ field: 'value' }],
            deltaSort: true,
            rowData: baseData,
            getRowId: (params) => params.data?.id,
        });

        api.applyColumnState({ state: [{ colId: 'value', sort: 'asc' }] });

        applyTransactionChecked(api, {
            remove: [{ id: 'delta-2' }, { id: 'delta-7' }, { id: 'delta-15' }],
            update: [{ id: 'delta-3', value: -10 }],
            add: [{ id: 'delta-new', value: 22 }],
        });

        await new GridRows(api, 'delta sort adds removes').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:delta-3 value:-10
            ├── LEAF id:delta-0 value:0
            ├── LEAF id:delta-1 value:5
            ├── LEAF id:delta-4 value:20
            ├── LEAF id:delta-new value:22
            ├── LEAF id:delta-5 value:25
            ├── LEAF id:delta-6 value:30
            ├── LEAF id:delta-8 value:40
            ├── LEAF id:delta-9 value:45
            ├── LEAF id:delta-10 value:50
            ├── LEAF id:delta-11 value:55
            ├── LEAF id:delta-12 value:60
            ├── LEAF id:delta-13 value:65
            ├── LEAF id:delta-14 value:70
            ├── LEAF id:delta-16 value:80
            ├── LEAF id:delta-17 value:85
            ├── LEAF id:delta-18 value:90
            └── LEAF id:delta-19 value:95
        `);

        await new GridColumns(api, 'columns').checkColumns(`
            CENTER
            └── value "Value" width:200 sort:asc
        `);
    });

    test('delta sort keeps stable order on equal values with new rows', async () => {
        const baseData = Array.from({ length: 20 }, (_, i) => ({
            id: `delta-e${i}`,
            value: 1,
        }));
        const api = gridMgr.createGrid('deltaSortEqualValues', {
            columnDefs: [{ field: 'value' }],
            deltaSort: true,
            rowData: baseData,
            getRowId: (params) => params.data?.id,
        });

        api.applyColumnState({ state: [{ colId: 'value', sort: 'asc' }] });

        applyTransactionChecked(api, {
            update: [{ id: 'delta-e5', value: 1 }],
            add: [{ id: 'delta-e20', value: 1 }],
        });

        await new GridRows(api, 'delta sort equal values').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:delta-e0 value:1
            ├── LEAF id:delta-e1 value:1
            ├── LEAF id:delta-e2 value:1
            ├── LEAF id:delta-e3 value:1
            ├── LEAF id:delta-e4 value:1
            ├── LEAF id:delta-e5 value:1
            ├── LEAF id:delta-e6 value:1
            ├── LEAF id:delta-e7 value:1
            ├── LEAF id:delta-e8 value:1
            ├── LEAF id:delta-e9 value:1
            ├── LEAF id:delta-e10 value:1
            ├── LEAF id:delta-e11 value:1
            ├── LEAF id:delta-e12 value:1
            ├── LEAF id:delta-e13 value:1
            ├── LEAF id:delta-e14 value:1
            ├── LEAF id:delta-e15 value:1
            ├── LEAF id:delta-e16 value:1
            ├── LEAF id:delta-e17 value:1
            ├── LEAF id:delta-e18 value:1
            ├── LEAF id:delta-e19 value:1
            └── LEAF id:delta-e20 value:1
        `);
    });

    test('delta sort keeps stable order for addIndex with equal values', async () => {
        const baseData = Array.from({ length: 20 }, (_, i) => ({
            id: `delta-si${i}`,
            value: 1,
        }));
        const api = gridMgr.createGrid('deltaSortAddIndexEqualValues', {
            columnDefs: [{ field: 'value' }],
            deltaSort: true,
            rowData: baseData,
            getRowId: (params) => params.data?.id,
        });

        api.applyColumnState({ state: [{ colId: 'value', sort: 'asc' }] });

        applyTransactionChecked(api, {
            addIndex: 10,
            add: [{ id: 'delta-si20', value: 1 }],
        });

        await new GridRows(api, 'delta sort addIndex equal values').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:delta-si0 value:1
            ├── LEAF id:delta-si1 value:1
            ├── LEAF id:delta-si2 value:1
            ├── LEAF id:delta-si3 value:1
            ├── LEAF id:delta-si4 value:1
            ├── LEAF id:delta-si5 value:1
            ├── LEAF id:delta-si6 value:1
            ├── LEAF id:delta-si7 value:1
            ├── LEAF id:delta-si8 value:1
            ├── LEAF id:delta-si9 value:1
            ├── LEAF id:delta-si20 value:1
            ├── LEAF id:delta-si10 value:1
            ├── LEAF id:delta-si11 value:1
            ├── LEAF id:delta-si12 value:1
            ├── LEAF id:delta-si13 value:1
            ├── LEAF id:delta-si14 value:1
            ├── LEAF id:delta-si15 value:1
            ├── LEAF id:delta-si16 value:1
            ├── LEAF id:delta-si17 value:1
            ├── LEAF id:delta-si18 value:1
            └── LEAF id:delta-si19 value:1
        `);
    });

    test('delta sort with mixed operations (add, remove, update)', async () => {
        const baseData = Array.from({ length: 20 }, (_, i) => ({
            id: `mixed-${i}`,
            value: i * 10,
        }));
        const api = gridMgr.createGrid('deltaSortMixedOps', {
            columnDefs: [{ field: 'value' }],
            deltaSort: true,
            rowData: baseData,
            getRowId: (params) => params.data?.id,
        });

        api.applyColumnState({ state: [{ colId: 'value', sort: 'asc' }] });

        applyTransactionChecked(api, {
            remove: [{ id: 'mixed-2' }, { id: 'mixed-10' }, { id: 'mixed-15' }],
            update: [
                { id: 'mixed-5', value: -5 },
                { id: 'mixed-12', value: 105 },
            ],
            add: [
                { id: 'mixed-new1', value: 25 },
                { id: 'mixed-new2', value: 85 },
            ],
        });

        await new GridRows(api, 'delta sort all operations').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:mixed-5 value:-5
            ├── LEAF id:mixed-0 value:0
            ├── LEAF id:mixed-1 value:10
            ├── LEAF id:mixed-new1 value:25
            ├── LEAF id:mixed-3 value:30
            ├── LEAF id:mixed-4 value:40
            ├── LEAF id:mixed-6 value:60
            ├── LEAF id:mixed-7 value:70
            ├── LEAF id:mixed-8 value:80
            ├── LEAF id:mixed-new2 value:85
            ├── LEAF id:mixed-9 value:90
            ├── LEAF id:mixed-12 value:105
            ├── LEAF id:mixed-11 value:110
            ├── LEAF id:mixed-13 value:130
            ├── LEAF id:mixed-14 value:140
            ├── LEAF id:mixed-16 value:160
            ├── LEAF id:mixed-17 value:170
            ├── LEAF id:mixed-18 value:180
            └── LEAF id:mixed-19 value:190
        `);
    });

    test('delta sort with balanced add and remove', async () => {
        const baseData = Array.from({ length: 20 }, (_, i) => ({
            id: `bal-${i}`,
            value: i * 10,
        }));
        const api = gridMgr.createGrid('deltaSortBalanced', {
            columnDefs: [{ field: 'value' }],
            deltaSort: true,
            rowData: baseData,
            getRowId: (params) => params.data?.id,
        });

        api.applyColumnState({ state: [{ colId: 'value', sort: 'asc' }] });

        // Remove 4 rows, add 4 rows (same count)
        applyTransactionChecked(api, {
            remove: [{ id: 'bal-2' }, { id: 'bal-8' }, { id: 'bal-15' }, { id: 'bal-18' }],
            add: [
                { id: 'bal-new1', value: 25 },
                { id: 'bal-new2', value: 75 },
                { id: 'bal-new3', value: 135 },
                { id: 'bal-new4', value: 165 },
            ],
        });

        await new GridRows(api, 'delta sort balanced add/remove').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:bal-0 value:0
            ├── LEAF id:bal-1 value:10
            ├── LEAF id:bal-new1 value:25
            ├── LEAF id:bal-3 value:30
            ├── LEAF id:bal-4 value:40
            ├── LEAF id:bal-5 value:50
            ├── LEAF id:bal-6 value:60
            ├── LEAF id:bal-7 value:70
            ├── LEAF id:bal-new2 value:75
            ├── LEAF id:bal-9 value:90
            ├── LEAF id:bal-10 value:100
            ├── LEAF id:bal-11 value:110
            ├── LEAF id:bal-12 value:120
            ├── LEAF id:bal-13 value:130
            ├── LEAF id:bal-new3 value:135
            ├── LEAF id:bal-14 value:140
            ├── LEAF id:bal-16 value:160
            ├── LEAF id:bal-new4 value:165
            ├── LEAF id:bal-17 value:170
            └── LEAF id:bal-19 value:190
        `);
    });

    test('delta sort with duplicate node IDs', async () => {
        const consoleWarnSpy = vitest.spyOn(console, 'warn').mockImplementation(() => {});

        // Note: Duplicate IDs result in Map key collision - last duplicate wins in indexByNode
        // This means sort order for duplicates is undefined and may not be stable
        const api = gridMgr.createGrid('deltaSortDuplicateIds', {
            columnDefs: [{ field: 'value' }],
            deltaSort: true,
            rowData: [
                { id: 'dup-1', value: 10 },
                { id: 'dup-2', value: 20 },
                { id: 'dup-3', value: 30 },
                { id: 'dup-4', value: 40 },
                { id: 'dup-5', value: 50 },
                { id: 'dup-6', value: 60 },
                { id: 'dup-7', value: 70 },
                { id: 'dup-8', value: 80 },
                { id: 'dup-9', value: 90 },
                { id: 'dup-1', value: 100 }, // Duplicate ID
                { id: 'dup-10', value: 110 },
                { id: 'dup-11', value: 120 },
                { id: 'dup-12', value: 130 },
                { id: 'dup-13', value: 140 },
                { id: 'dup-14', value: 150 },
                { id: 'dup-15', value: 160 },
                { id: 'dup-16', value: 170 },
            ],
            getRowId: (params) => params.data?.id,
        });

        api.applyColumnState({ state: [{ colId: 'value', sort: 'asc' }] });

        applyTransactionChecked(api, {
            update: [{ id: 'dup-2', value: 5 }],
            add: [{ id: 'dup-17', value: 65 }],
        });

        // checkDom: false — this test intentionally uses duplicate row IDs (same id string for two rowData items),
        // which causes DOM order/cell validation to fail as the grid cannot distinguish the duplicate DOM rows.
        await new GridRows(api, 'delta sort with duplicate IDs', { checkDom: false }).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:dup-2 value:5
            ├── LEAF id:dup-1 value:10
            ├── LEAF id:dup-3 value:30
            ├── LEAF id:dup-4 value:40
            ├── LEAF id:dup-5 value:50
            ├── LEAF id:dup-6 value:60
            ├── LEAF id:dup-17 value:65
            ├── LEAF id:dup-7 value:70
            ├── LEAF id:dup-8 value:80
            ├── LEAF id:dup-9 value:90
            ├── LEAF id:dup-1 value:100
            ├── LEAF id:dup-10 value:110
            ├── LEAF id:dup-11 value:120
            ├── LEAF id:dup-12 value:130
            ├── LEAF id:dup-13 value:140
            ├── LEAF id:dup-14 value:150
            ├── LEAF id:dup-15 value:160
            └── LEAF id:dup-16 value:170
        `);

        consoleWarnSpy.mockRestore();
    });

    test('delta sort with duplicate rowData instances', async () => {
        const consoleWarnSpy = vitest.spyOn(console, 'warn').mockImplementation(() => {});

        const sharedData = { id: 'shared', value: 90 };
        const api = gridMgr.createGrid('deltaSortDuplicateInstances', {
            columnDefs: [{ field: 'value' }],
            deltaSort: true,
            rowData: [
                { id: 'dup-inst-1', value: 10 },
                { id: 'dup-inst-2', value: 20 },
                { id: 'dup-inst-3', value: 30 },
                { id: 'dup-inst-4', value: 40 },
                { id: 'dup-inst-5', value: 50 },
                { id: 'dup-inst-6', value: 60 },
                { id: 'dup-inst-7', value: 70 },
                { id: 'dup-inst-8', value: 80 },
                sharedData,
                sharedData, // Duplicate instance
                { id: 'dup-inst-9', value: 100 },
                { id: 'dup-inst-10', value: 110 },
                { id: 'dup-inst-11', value: 120 },
                { id: 'dup-inst-12', value: 130 },
                { id: 'dup-inst-13', value: 140 },
                { id: 'dup-inst-14', value: 150 },
            ],
            getRowId: (params) => params.data?.id,
        });

        api.applyColumnState({ state: [{ colId: 'value', sort: 'asc' }] });

        applyTransactionChecked(api, {
            update: [{ id: 'dup-inst-3', value: 5 }],
            add: [{ id: 'dup-inst-15', value: 65 }],
        });

        // checkDom: false — this test intentionally uses duplicate rowData object instances (same JS object twice),
        // which causes DOM order/cell validation to fail as the grid cannot distinguish the duplicate DOM rows.
        await new GridRows(api, 'delta sort with duplicate instances', { checkDom: false }).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:dup-inst-3 value:5
            ├── LEAF id:dup-inst-1 value:10
            ├── LEAF id:dup-inst-2 value:20
            ├── LEAF id:dup-inst-4 value:40
            ├── LEAF id:dup-inst-5 value:50
            ├── LEAF id:dup-inst-6 value:60
            ├── LEAF id:dup-inst-15 value:65
            ├── LEAF id:dup-inst-7 value:70
            ├── LEAF id:dup-inst-8 value:80
            ├── LEAF id:shared value:90
            ├── LEAF id:shared value:90
            ├── LEAF id:dup-inst-9 value:100
            ├── LEAF id:dup-inst-10 value:110
            ├── LEAF id:dup-inst-11 value:120
            ├── LEAF id:dup-inst-12 value:130
            ├── LEAF id:dup-inst-13 value:140
            └── LEAF id:dup-inst-14 value:150
        `);

        consoleWarnSpy.mockRestore();
    });

    test('delta sort handles removes without updates', async () => {
        const baseData = Array.from({ length: 20 }, (_, i) => ({
            id: `delta-r${i}`,
            value: i,
        }));
        const api = gridMgr.createGrid('deltaSortRemovesOnly', {
            columnDefs: [{ field: 'value' }],
            deltaSort: true,
            rowData: baseData,
            getRowId: (params) => params.data?.id,
        });

        api.applyColumnState({ state: [{ colId: 'value', sort: 'asc' }] });

        applyTransactionChecked(api, {
            remove: [{ id: 'delta-r2' }, { id: 'delta-r7' }, { id: 'delta-r12' }, { id: 'delta-r18' }],
        });

        await new GridRows(api, 'delta sort removes only').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:delta-r0 value:0
            ├── LEAF id:delta-r1 value:1
            ├── LEAF id:delta-r3 value:3
            ├── LEAF id:delta-r4 value:4
            ├── LEAF id:delta-r5 value:5
            ├── LEAF id:delta-r6 value:6
            ├── LEAF id:delta-r8 value:8
            ├── LEAF id:delta-r9 value:9
            ├── LEAF id:delta-r10 value:10
            ├── LEAF id:delta-r11 value:11
            ├── LEAF id:delta-r13 value:13
            ├── LEAF id:delta-r14 value:14
            ├── LEAF id:delta-r15 value:15
            ├── LEAF id:delta-r16 value:16
            ├── LEAF id:delta-r17 value:17
            └── LEAF id:delta-r19 value:19
        `);
    });

    test('delta sort handles adds without updates', async () => {
        const baseData = Array.from({ length: 20 }, (_, i) => ({
            id: `delta-a${i}`,
            value: i * 2,
        }));
        const api = gridMgr.createGrid('deltaSortAddsOnly', {
            columnDefs: [{ field: 'value' }],
            deltaSort: true,
            rowData: baseData,
            getRowId: (params) => params.data?.id,
        });

        api.applyColumnState({ state: [{ colId: 'value', sort: 'asc' }] });

        applyTransactionChecked(api, {
            add: [
                { id: 'delta-a20', value: 5 },
                { id: 'delta-a21', value: 15 },
            ],
        });

        await new GridRows(api, 'delta sort adds only').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:delta-a0 value:0
            ├── LEAF id:delta-a1 value:2
            ├── LEAF id:delta-a2 value:4
            ├── LEAF id:delta-a20 value:5
            ├── LEAF id:delta-a3 value:6
            ├── LEAF id:delta-a4 value:8
            ├── LEAF id:delta-a5 value:10
            ├── LEAF id:delta-a6 value:12
            ├── LEAF id:delta-a7 value:14
            ├── LEAF id:delta-a21 value:15
            ├── LEAF id:delta-a8 value:16
            ├── LEAF id:delta-a9 value:18
            ├── LEAF id:delta-a10 value:20
            ├── LEAF id:delta-a11 value:22
            ├── LEAF id:delta-a12 value:24
            ├── LEAF id:delta-a13 value:26
            ├── LEAF id:delta-a14 value:28
            ├── LEAF id:delta-a15 value:30
            ├── LEAF id:delta-a16 value:32
            ├── LEAF id:delta-a17 value:34
            ├── LEAF id:delta-a18 value:36
            └── LEAF id:delta-a19 value:38
        `);
    });

    test('delta sort short-circuits when no changes', async () => {
        const baseData = Array.from({ length: 20 }, (_, i) => ({
            id: `delta-n${i}`,
            value: i + 1,
        }));
        const api = gridMgr.createGrid('deltaSortNoChanges', {
            columnDefs: [{ field: 'value' }],
            deltaSort: true,
            rowData: baseData,
            getRowId: (params) => params.data?.id,
        });

        api.applyColumnState({ state: [{ colId: 'value', sort: 'asc' }] });

        applyTransactionChecked(api, { add: [], remove: [], update: [] });

        await new GridRows(api, 'delta sort no changes').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:delta-n0 value:1
            ├── LEAF id:delta-n1 value:2
            ├── LEAF id:delta-n2 value:3
            ├── LEAF id:delta-n3 value:4
            ├── LEAF id:delta-n4 value:5
            ├── LEAF id:delta-n5 value:6
            ├── LEAF id:delta-n6 value:7
            ├── LEAF id:delta-n7 value:8
            ├── LEAF id:delta-n8 value:9
            ├── LEAF id:delta-n9 value:10
            ├── LEAF id:delta-n10 value:11
            ├── LEAF id:delta-n11 value:12
            ├── LEAF id:delta-n12 value:13
            ├── LEAF id:delta-n13 value:14
            ├── LEAF id:delta-n14 value:15
            ├── LEAF id:delta-n15 value:16
            ├── LEAF id:delta-n16 value:17
            ├── LEAF id:delta-n17 value:18
            ├── LEAF id:delta-n18 value:19
            └── LEAF id:delta-n19 value:20
        `);
    });

    test('delta sort handles adds and removes without updates', async () => {
        const api = gridMgr.createGrid('deltaSortAddsRemovesNoUpdates', {
            columnDefs: [{ field: 'value' }],
            deltaSort: true,
            rowData: [
                { id: 'delta-ar1', value: 1 },
                { id: 'delta-ar2', value: 2 },
                { id: 'delta-ar3', value: 3 },
                { id: 'delta-ar4', value: 4 },
                { id: 'delta-ar5', value: 5 },
                { id: 'delta-ar6', value: 6 },
                { id: 'delta-ar7', value: 7 },
                { id: 'delta-ar8', value: 8 },
                { id: 'delta-ar9', value: 9 },
                { id: 'delta-ar10', value: 10 },
                { id: 'delta-ar11', value: 11 },
                { id: 'delta-ar12', value: 12 },
                { id: 'delta-ar13', value: 13 },
                { id: 'delta-ar14', value: 14 },
                { id: 'delta-ar15', value: 15 },
                { id: 'delta-ar16', value: 16 },
                { id: 'delta-ar17', value: 17 },
                { id: 'delta-ar18', value: 18 },
            ],
            getRowId: (params) => params.data?.id,
        });

        api.applyColumnState({ state: [{ colId: 'value', sort: 'asc' }] });

        applyTransactionChecked(api, {
            remove: [{ id: 'delta-ar2' }, { id: 'delta-ar10' }],
            add: [
                { id: 'delta-ar19', value: 2.5 },
                { id: 'delta-ar20', value: 10.5 },
            ],
        });

        await new GridRows(api, 'delta sort adds removes no updates').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:delta-ar1 value:1
            ├── LEAF id:delta-ar19 value:2.5
            ├── LEAF id:delta-ar3 value:3
            ├── LEAF id:delta-ar4 value:4
            ├── LEAF id:delta-ar5 value:5
            ├── LEAF id:delta-ar6 value:6
            ├── LEAF id:delta-ar7 value:7
            ├── LEAF id:delta-ar8 value:8
            ├── LEAF id:delta-ar9 value:9
            ├── LEAF id:delta-ar20 value:10.5
            ├── LEAF id:delta-ar11 value:11
            ├── LEAF id:delta-ar12 value:12
            ├── LEAF id:delta-ar13 value:13
            ├── LEAF id:delta-ar14 value:14
            ├── LEAF id:delta-ar15 value:15
            ├── LEAF id:delta-ar16 value:16
            ├── LEAF id:delta-ar17 value:17
            └── LEAF id:delta-ar18 value:18
        `);
    });
});

describe('Delta Sorting — pivot-triggered changedPath deactivation', () => {
    const gridMgr = new TestGridsManager({
        modules: [ClientSideRowModelModule, RowGroupingModule, PivotModule],
    });

    test('falls back to full sort when pivotStage nullifies the changedPath', async () => {
        // When a transaction introduces a new unique pivot column value, pivotStage returns true
        // because the set of generated pivot columns changed (uniqueValuesChanged=true in
        // executePivotOn). CSRM then sets changedPath to undefined, so sortStage receives
        // undefined and doDeltaSort takes the direct full-sort path.
        //
        // Initial data has year 2020 only. Adding a row with year 2021 triggers the nullification.
        // After the transaction, groups must still be in correct sorted order (A < B < C).
        const api = gridMgr.createGrid('deltaSort-pivot-deactivate', {
            columnDefs: [
                { field: 'region', rowGroup: true, hide: true },
                { field: 'year', pivot: true, hide: true },
                { field: 'sales', aggFunc: 'sum', hide: true },
            ],
            autoGroupColumnDef: { sort: 'asc' },
            pivotMode: true,
            deltaSort: true,
            rowData: [
                { id: '1', region: 'B', year: 2020, sales: 100 },
                { id: '2', region: 'A', year: 2020, sales: 200 },
            ],
            getRowId: ({ data }) => data.id,
        });
        await new GridColumns(api, `falls back to full sort when pivotStage nullifies the changedPath setup`)
            .checkColumns(`
                CENTER
                ├── ag-Grid-AutoColumn "Group" width:200 sort:asc
                └─┬ "2020" GROUP
                  └── pivot_year_2020_sales "Sales" width:200 columnGroupShow:open
            `);
        await new GridRows(api, `falls back to full sort when pivotStage nullifies the changedPath setup`).check(`
            ROOT id:ROOT_NODE_ID pivot_year_2020_sales:300
            ├─┬ LEAF_GROUP collapsed id:row-group-region-A ag-Grid-AutoColumn:"A" pivot_year_2020_sales:200
            │ └── LEAF hidden id:2 pivot_year_2020_sales:200
            └─┬ LEAF_GROUP collapsed id:row-group-region-B ag-Grid-AutoColumn:"B" pivot_year_2020_sales:100
            · └── LEAF hidden id:1 pivot_year_2020_sales:100
        `);

        // Adding year 2021 → uniqueValuesChanged → pivotStage returns true →
        // CSRM sets changedPath=undefined → doDeltaSort receives undefined → full sort.
        applyTransactionChecked(api, { add: [{ id: '3', region: 'C', year: 2021, sales: 50 }] });

        // Groups must be sorted A < B < C despite the nullified changedPath.
        expect(api.getDisplayedRowCount()).toBe(3);
        expect(api.getDisplayedRowAtIndex(0)?.key).toBe('A');
        expect(api.getDisplayedRowAtIndex(1)?.key).toBe('B');
        expect(api.getDisplayedRowAtIndex(2)?.key).toBe('C');
        await new GridRows(api, `falls back to full sort when pivotStage nullifies the changedPath final state`).check(
            `
                ROOT id:ROOT_NODE_ID pivot_year_2020_sales:300 pivot_year_2021_sales:50
                ├─┬ LEAF_GROUP collapsed id:row-group-region-A ag-Grid-AutoColumn:"A" pivot_year_2020_sales:200 pivot_year_2021_sales:null
                │ └── LEAF hidden id:2 pivot_year_2020_sales:200 pivot_year_2021_sales:200
                ├─┬ LEAF_GROUP collapsed id:row-group-region-B ag-Grid-AutoColumn:"B" pivot_year_2020_sales:100 pivot_year_2021_sales:null
                │ └── LEAF hidden id:1 pivot_year_2020_sales:100 pivot_year_2021_sales:100
                └─┬ LEAF_GROUP collapsed id:row-group-region-C ag-Grid-AutoColumn:"C" pivot_year_2020_sales:null pivot_year_2021_sales:50
                · └── LEAF hidden id:3 pivot_year_2020_sales:50 pivot_year_2021_sales:50
            `
        );
    });
});
