import { ClientSideRowModelModule } from 'ag-grid-community';
import { RowGroupingModule } from 'ag-grid-enterprise';

import { GridRows, TestGridsManager, applyTransactionChecked } from '../test-utils';

describe('Grouping delta sorting', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, RowGroupingModule],
    });

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('delta sorting resorts grouped rows when only part of the data changes', async () => {
        const rowData = [
            { id: 'ire-a', country: 'Ireland', athlete: 'Aine', score: 40 },
            { id: 'ire-b', country: 'Ireland', athlete: 'Brigid', score: 30 },
            { id: 'esp-a', country: 'Spain', athlete: 'Carlos', score: 25 },
            { id: 'esp-b', country: 'Spain', athlete: 'Diego', score: 10 },
        ];

        const rowById = Object.fromEntries(rowData.map((row) => [row.id, row])) as Record<
            string,
            (typeof rowData)[number]
        >;

        const api = gridsManager.createGrid('groupingDeltaSort', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'athlete' },
                { field: 'score', sortable: true, aggFunc: 'sum' },
            ],
            autoGroupColumnDef: { headerName: 'Country' },
            animateRows: false,
            groupDefaultExpanded: -1,
            rowData,
            deltaSort: true,
            getRowId: (params) => params.data.id,
        });

        api.applyColumnState({ state: [{ colId: 'score', sort: 'desc' }] });

        await new GridRows(api, 'group delta sort initial').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland" score:70
            │ ├── LEAF id:ire-a country:"Ireland" athlete:"Aine" score:40
            │ └── LEAF id:ire-b country:"Ireland" athlete:"Brigid" score:30
            └─┬ LEAF_GROUP id:row-group-country-Spain ag-Grid-AutoColumn:"Spain" score:35
            · ├── LEAF id:esp-a country:"Spain" athlete:"Carlos" score:25
            · └── LEAF id:esp-b country:"Spain" athlete:"Diego" score:10
        `);

        const updateRow = (id: string, score: number) => ({ ...rowById[id], score });

        applyTransactionChecked(api, {
            update: [updateRow('esp-a', 80), updateRow('ire-b', 5)],
        });

        await new GridRows(api, 'group delta sort updated').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Spain ag-Grid-AutoColumn:"Spain" score:90
            │ ├── LEAF id:esp-a country:"Spain" athlete:"Carlos" score:80
            │ └── LEAF id:esp-b country:"Spain" athlete:"Diego" score:10
            └─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland" score:45
            · ├── LEAF id:ire-a country:"Ireland" athlete:"Aine" score:40
            · └── LEAF id:ire-b country:"Ireland" athlete:"Brigid" score:5
        `);
    });

    test('delta sort preserves order for untouched grouped rows', async () => {
        const api = gridsManager.createGrid('deltaSortGroupedUntouched', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'athlete' },
                { field: 'score', sortable: true },
            ],
            autoGroupColumnDef: { headerName: 'Country' },
            groupDefaultExpanded: -1,
            deltaSort: true,
            rowData: [
                { id: 'a', country: 'Ireland', athlete: 'Alice', score: 20 },
                { id: 'b', country: 'Ireland', athlete: 'Bob', score: 10 },
                { id: 'c', country: 'Ireland', athlete: 'Charlie', score: 30 },
                { id: 'd', country: 'Spain', athlete: 'Diego', score: 40 },
            ],
            getRowId: (params) => params.data.id,
        });

        api.applyColumnState({ state: [{ colId: 'score', sort: 'asc' }] });

        await new GridRows(api, 'initial sort').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ ├── LEAF id:b country:"Ireland" athlete:"Bob" score:10
            │ ├── LEAF id:a country:"Ireland" athlete:"Alice" score:20
            │ └── LEAF id:c country:"Ireland" athlete:"Charlie" score:30
            └─┬ LEAF_GROUP id:row-group-country-Spain ag-Grid-AutoColumn:"Spain"
            · └── LEAF id:d country:"Spain" athlete:"Diego" score:40
        `);

        applyTransactionChecked(api, { update: [{ id: 'c', country: 'Ireland', athlete: 'Charlie', score: 5 }] });

        await new GridRows(api, 'delta sort single update in group').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ ├── LEAF id:c country:"Ireland" athlete:"Charlie" score:5
            │ ├── LEAF id:b country:"Ireland" athlete:"Bob" score:10
            │ └── LEAF id:a country:"Ireland" athlete:"Alice" score:20
            └─┬ LEAF_GROUP id:row-group-country-Spain ag-Grid-AutoColumn:"Spain"
            · └── LEAF id:d country:"Spain" athlete:"Diego" score:40
        `);
    });

    test('delta sort handles adds in grouped data', async () => {
        const api = gridsManager.createGrid('deltaSortGroupedAdds', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'athlete' },
                { field: 'score', sortable: true },
            ],
            autoGroupColumnDef: { headerName: 'Country' },
            groupDefaultExpanded: -1,
            deltaSort: true,
            rowData: [
                { id: '1', country: 'Ireland', athlete: 'Alice', score: 10 },
                { id: '2', country: 'Ireland', athlete: 'Bob', score: 30 },
                { id: '4', country: 'Spain', athlete: 'Carlos', score: 50 },
            ],
            getRowId: (params) => params.data.id,
        });

        api.applyColumnState({ state: [{ colId: 'score', sort: 'asc' }] });

        applyTransactionChecked(api, {
            add: [
                { id: '3', country: 'Ireland', athlete: 'Charlie', score: 20 },
                { id: '5', country: 'Spain', athlete: 'Diego', score: 40 },
            ],
        });

        await new GridRows(api, 'delta sort adds in groups').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ ├── LEAF id:1 country:"Ireland" athlete:"Alice" score:10
            │ ├── LEAF id:3 country:"Ireland" athlete:"Charlie" score:20
            │ └── LEAF id:2 country:"Ireland" athlete:"Bob" score:30
            └─┬ LEAF_GROUP id:row-group-country-Spain ag-Grid-AutoColumn:"Spain"
            · ├── LEAF id:5 country:"Spain" athlete:"Diego" score:40
            · └── LEAF id:4 country:"Spain" athlete:"Carlos" score:50
        `);
    });

    test('delta sort handles removes in grouped data', async () => {
        const api = gridsManager.createGrid('deltaSortGroupedRemoves', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'athlete' },
                { field: 'score', sortable: true },
            ],
            autoGroupColumnDef: { headerName: 'Country' },
            groupDefaultExpanded: -1,
            deltaSort: true,
            rowData: [
                { id: '1', country: 'Ireland', athlete: 'Alice', score: 10 },
                { id: '2', country: 'Ireland', athlete: 'Bob', score: 20 },
                { id: '3', country: 'Ireland', athlete: 'Charlie', score: 30 },
                { id: '4', country: 'Spain', athlete: 'Carlos', score: 40 },
                { id: '5', country: 'Spain', athlete: 'Diego', score: 50 },
            ],
            getRowId: (params) => params.data.id,
        });

        api.applyColumnState({ state: [{ colId: 'score', sort: 'asc' }] });

        applyTransactionChecked(api, {
            remove: [{ id: '2' }, { id: '4' }],
        });

        await new GridRows(api, 'delta sort removes in groups').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ ├── LEAF id:1 country:"Ireland" athlete:"Alice" score:10
            │ └── LEAF id:3 country:"Ireland" athlete:"Charlie" score:30
            └─┬ LEAF_GROUP id:row-group-country-Spain ag-Grid-AutoColumn:"Spain"
            · └── LEAF id:5 country:"Spain" athlete:"Diego" score:50
        `);
    });

    test('delta sort with equal values in grouped data', async () => {
        const api = gridsManager.createGrid('deltaSortGroupedEqualValues', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'athlete' },
                { field: 'score', sortable: true },
            ],
            autoGroupColumnDef: { headerName: 'Country' },
            groupDefaultExpanded: -1,
            deltaSort: true,
            rowData: [
                { id: '1', country: 'Ireland', athlete: 'Alice', score: 10 },
                { id: '2', country: 'Ireland', athlete: 'Bob', score: 10 },
                { id: '3', country: 'Ireland', athlete: 'Charlie', score: 10 },
                { id: '4', country: 'Spain', athlete: 'Carlos', score: 20 },
                { id: '5', country: 'Spain', athlete: 'Diego', score: 20 },
            ],
            getRowId: (params) => params.data.id,
        });

        api.applyColumnState({ state: [{ colId: 'score', sort: 'asc' }] });

        applyTransactionChecked(api, {
            update: [{ id: '2', country: 'Ireland', athlete: 'Bob', score: 10 }],
            add: [{ id: '6', country: 'Spain', athlete: 'Elena', score: 20 }],
        });

        await new GridRows(api, 'delta sort equal values in groups').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ ├── LEAF id:1 country:"Ireland" athlete:"Alice" score:10
            │ ├── LEAF id:2 country:"Ireland" athlete:"Bob" score:10
            │ └── LEAF id:3 country:"Ireland" athlete:"Charlie" score:10
            └─┬ LEAF_GROUP id:row-group-country-Spain ag-Grid-AutoColumn:"Spain"
            · ├── LEAF id:4 country:"Spain" athlete:"Carlos" score:20
            · ├── LEAF id:5 country:"Spain" athlete:"Diego" score:20
            · └── LEAF id:6 country:"Spain" athlete:"Elena" score:20
        `);
    });

    test('delta sort with addIndex in grouped data', async () => {
        const api = gridsManager.createGrid('deltaSortGroupedAddIndex', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'athlete' },
                { field: 'score', sortable: true },
            ],
            autoGroupColumnDef: { headerName: 'Country' },
            groupDefaultExpanded: -1,
            deltaSort: true,
            rowData: [
                { id: '1', country: 'Ireland', athlete: 'Alice', score: 10 },
                { id: '2', country: 'Ireland', athlete: 'Bob', score: 10 },
                { id: '3', country: 'Ireland', athlete: 'Charlie', score: 10 },
            ],
            getRowId: (params) => params.data.id,
        });

        api.applyColumnState({ state: [{ colId: 'score', sort: 'asc' }] });

        applyTransactionChecked(api, {
            addIndex: 1,
            add: [{ id: '4', country: 'Ireland', athlete: 'Diana', score: 10 }],
        });

        await new GridRows(api, 'delta sort addIndex equal values in group').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            · ├── LEAF id:1 country:"Ireland" athlete:"Alice" score:10
            · ├── LEAF id:4 country:"Ireland" athlete:"Diana" score:10
            · ├── LEAF id:2 country:"Ireland" athlete:"Bob" score:10
            · └── LEAF id:3 country:"Ireland" athlete:"Charlie" score:10
        `);
    });

    test('delta sort with multi-level groups', async () => {
        const api = gridsManager.createGrid('deltaSortMultiLevelGroups', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'year', rowGroup: true, hide: true },
                { field: 'athlete' },
                { field: 'score', sortable: true },
            ],
            autoGroupColumnDef: { headerName: 'Country/Year' },
            groupDefaultExpanded: -1,
            deltaSort: true,
            rowData: [
                { id: '1', country: 'Ireland', year: 2020, athlete: 'Alice', score: 10 },
                { id: '2', country: 'Ireland', year: 2020, athlete: 'Bob', score: 20 },
                { id: '3', country: 'Ireland', year: 2021, athlete: 'Charlie', score: 30 },
                { id: '4', country: 'Spain', year: 2020, athlete: 'Diego', score: 40 },
            ],
            getRowId: (params) => params.data.id,
        });

        api.applyColumnState({ state: [{ colId: 'score', sort: 'asc' }] });

        await new GridRows(api, 'initial multi-level').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ ├─┬ LEAF_GROUP id:row-group-country-Ireland-year-2020 ag-Grid-AutoColumn:2020
            │ │ ├── LEAF id:1 country:"Ireland" year:2020 athlete:"Alice" score:10
            │ │ └── LEAF id:2 country:"Ireland" year:2020 athlete:"Bob" score:20
            │ └─┬ LEAF_GROUP id:row-group-country-Ireland-year-2021 ag-Grid-AutoColumn:2021
            │ · └── LEAF id:3 country:"Ireland" year:2021 athlete:"Charlie" score:30
            └─┬ filler id:row-group-country-Spain ag-Grid-AutoColumn:"Spain"
            · └─┬ LEAF_GROUP id:row-group-country-Spain-year-2020 ag-Grid-AutoColumn:2020
            · · └── LEAF id:4 country:"Spain" year:2020 athlete:"Diego" score:40
        `);

        applyTransactionChecked(api, {
            update: [{ id: '2', country: 'Ireland', year: 2020, athlete: 'Bob', score: 5 }],
            add: [{ id: '5', country: 'Ireland', year: 2020, athlete: 'Emma', score: 15 }],
        });

        await new GridRows(api, 'delta sort multi-level with updates and adds').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ ├─┬ LEAF_GROUP id:row-group-country-Ireland-year-2020 ag-Grid-AutoColumn:2020
            │ │ ├── LEAF id:2 country:"Ireland" year:2020 athlete:"Bob" score:5
            │ │ ├── LEAF id:1 country:"Ireland" year:2020 athlete:"Alice" score:10
            │ │ └── LEAF id:5 country:"Ireland" year:2020 athlete:"Emma" score:15
            │ └─┬ LEAF_GROUP id:row-group-country-Ireland-year-2021 ag-Grid-AutoColumn:2021
            │ · └── LEAF id:3 country:"Ireland" year:2021 athlete:"Charlie" score:30
            └─┬ filler id:row-group-country-Spain ag-Grid-AutoColumn:"Spain"
            · └─┬ LEAF_GROUP id:row-group-country-Spain-year-2020 ag-Grid-AutoColumn:2020
            · · └── LEAF id:4 country:"Spain" year:2020 athlete:"Diego" score:40
        `);
    });

    test('delta sort with mixed operations in multiple groups', async () => {
        const api = gridsManager.createGrid('deltaSortMixedOpsGroups', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'athlete' },
                { field: 'score', sortable: true },
            ],
            autoGroupColumnDef: { headerName: 'Country' },
            groupDefaultExpanded: -1,
            deltaSort: true,
            rowData: [
                { id: '1', country: 'Ireland', athlete: 'Alice', score: 10 },
                { id: '2', country: 'Ireland', athlete: 'Bob', score: 20 },
                { id: '3', country: 'Ireland', athlete: 'Charlie', score: 30 },
                { id: '4', country: 'Spain', athlete: 'Diego', score: 40 },
                { id: '5', country: 'Spain', athlete: 'Elena', score: 50 },
                { id: '6', country: 'France', athlete: 'Francois', score: 60 },
            ],
            getRowId: (params) => params.data.id,
        });

        api.applyColumnState({ state: [{ colId: 'score', sort: 'asc' }] });

        applyTransactionChecked(api, {
            remove: [{ id: '2' }, { id: '6' }],
            update: [{ id: '3', country: 'Ireland', athlete: 'Charlie', score: 5 }],
            add: [
                { id: '7', country: 'Ireland', athlete: 'George', score: 15 },
                { id: '8', country: 'Spain', athlete: 'Hugo', score: 35 },
            ],
        });

        await new GridRows(api, 'delta sort mixed operations multiple groups').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ ├── LEAF id:3 country:"Ireland" athlete:"Charlie" score:5
            │ ├── LEAF id:1 country:"Ireland" athlete:"Alice" score:10
            │ └── LEAF id:7 country:"Ireland" athlete:"George" score:15
            └─┬ LEAF_GROUP id:row-group-country-Spain ag-Grid-AutoColumn:"Spain"
            · ├── LEAF id:8 country:"Spain" athlete:"Hugo" score:35
            · ├── LEAF id:4 country:"Spain" athlete:"Diego" score:40
            · └── LEAF id:5 country:"Spain" athlete:"Elena" score:50
        `);
    });

    test('delta sort short-circuits with no changes in grouped data', async () => {
        const api = gridsManager.createGrid('deltaSortGroupedNoChanges', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'athlete' },
                { field: 'score', sortable: true },
            ],
            autoGroupColumnDef: { headerName: 'Country' },
            groupDefaultExpanded: -1,
            deltaSort: true,
            rowData: [
                { id: '1', country: 'Ireland', athlete: 'Alice', score: 10 },
                { id: '2', country: 'Ireland', athlete: 'Bob', score: 20 },
            ],
            getRowId: (params) => params.data.id,
        });

        api.applyColumnState({ state: [{ colId: 'score', sort: 'asc' }] });

        applyTransactionChecked(api, { add: [], remove: [], update: [] });

        await new GridRows(api, 'delta sort no changes grouped').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            · ├── LEAF id:1 country:"Ireland" athlete:"Alice" score:10
            · └── LEAF id:2 country:"Ireland" athlete:"Bob" score:20
        `);
    });

    test('delta sort grouped with duplicate node IDs', async () => {
        const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

        // Note: Duplicate IDs result in Map key collision - last duplicate wins in indexByNode
        // This means sort order for duplicates is undefined and may not be stable
        const api = gridsManager.createGrid('deltaSortGroupedDuplicateIds', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'athlete' },
                { field: 'score', sortable: true },
            ],
            autoGroupColumnDef: { headerName: 'Country' },
            groupDefaultExpanded: -1,
            deltaSort: true,
            rowData: [
                { id: '1', country: 'Ireland', athlete: 'Alice', score: 10 },
                { id: '2', country: 'Ireland', athlete: 'Bob', score: 20 },
                { id: '1', country: 'Ireland', athlete: 'Charlie', score: 30 }, // Duplicate ID
                { id: '3', country: 'Spain', athlete: 'Diego', score: 40 },
            ],
            getRowId: (params) => params.data.id,
        });

        api.applyColumnState({ state: [{ colId: 'score', sort: 'asc' }] });

        applyTransactionChecked(api, {
            update: [{ id: '2', country: 'Ireland', athlete: 'Bob', score: 5 }],
            add: [{ id: '4', country: 'Spain', athlete: 'Elena', score: 25 }],
        });

        // Both duplicates remain in correct sorted order
        // Skip DOM validation since duplicate IDs cause mismatches between logical tree and DOM
        await new GridRows(api, 'delta sort grouped with duplicate IDs', { checkDom: false }).check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ ├── LEAF id:2 country:"Ireland" athlete:"Bob" score:5
            │ ├── LEAF id:1 country:"Ireland" athlete:"Alice" score:10
            │ └── LEAF id:1 country:"Ireland" athlete:"Charlie" score:30
            └─┬ LEAF_GROUP id:row-group-country-Spain ag-Grid-AutoColumn:"Spain"
            · ├── LEAF id:4 country:"Spain" athlete:"Elena" score:25
            · └── LEAF id:3 country:"Spain" athlete:"Diego" score:40
        `);

        consoleWarnSpy.mockRestore();
    });

    test('delta sort grouped with duplicate rowData instances', async () => {
        const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

        const sharedData = { id: 'shared', country: 'Ireland', athlete: 'Shared', score: 20 };
        const api = gridsManager.createGrid('deltaSortGroupedDuplicateInstances', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'athlete' },
                { field: 'score', sortable: true },
            ],
            autoGroupColumnDef: { headerName: 'Country' },
            groupDefaultExpanded: -1,
            deltaSort: true,
            rowData: [
                { id: '1', country: 'Ireland', athlete: 'Alice', score: 10 },
                sharedData,
                sharedData, // Duplicate instance
                { id: '3', country: 'Spain', athlete: 'Diego', score: 30 },
            ],
            getRowId: (params) => params.data.id,
        });

        api.applyColumnState({ state: [{ colId: 'score', sort: 'asc' }] });

        applyTransactionChecked(api, {
            update: [{ id: '3', country: 'Spain', athlete: 'Diego', score: 5 }],
            add: [{ id: '4', country: 'Ireland', athlete: 'Emma', score: 15 }],
        });

        // Skip DOM validation since duplicate IDs cause mismatches between logical tree and DOM
        await new GridRows(api, 'delta sort grouped with duplicate instances', { checkDom: false }).check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ ├── LEAF id:1 country:"Ireland" athlete:"Alice" score:10
            │ ├── LEAF id:4 country:"Ireland" athlete:"Emma" score:15
            │ ├── LEAF id:shared country:"Ireland" athlete:"Shared" score:20
            │ └── LEAF id:shared country:"Ireland" athlete:"Shared" score:20
            └─┬ LEAF_GROUP id:row-group-country-Spain ag-Grid-AutoColumn:"Spain"
            · └── LEAF id:3 country:"Spain" athlete:"Diego" score:5
        `);

        consoleWarnSpy.mockRestore();
    });
});
