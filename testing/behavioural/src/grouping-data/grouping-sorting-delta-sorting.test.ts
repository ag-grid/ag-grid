import { ClientSideRowModelModule } from 'ag-grid-community';
import { RowGroupingModule } from 'ag-grid-enterprise';

import { GridColumns, GridRows, TestGridsManager, applyTransactionChecked } from '../test-utils';

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
            { id: 'esp-a', country: 'Spain', athlete: 'Carlos', score: 35 },
            { id: 'esp-b', country: 'Spain', athlete: 'Diego', score: 28 },
            { id: 'fra-a', country: 'France', athlete: 'Émilie', score: 32 },
            { id: 'fra-b', country: 'France', athlete: 'François', score: 27 },
            { id: 'ger-a', country: 'Germany', athlete: 'Greta', score: 38 },
            { id: 'ger-b', country: 'Germany', athlete: 'Hans', score: 24 },
            { id: 'ita-a', country: 'Italy', athlete: 'Isabella', score: 36 },
            { id: 'ita-b', country: 'Italy', athlete: 'Leonardo', score: 29 },
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
            ├─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy" score:65
            │ ├── LEAF id:ita-a country:"Italy" athlete:"Isabella" score:36
            │ └── LEAF id:ita-b country:"Italy" athlete:"Leonardo" score:29
            ├─┬ LEAF_GROUP id:row-group-country-Spain ag-Grid-AutoColumn:"Spain" score:63
            │ ├── LEAF id:esp-a country:"Spain" athlete:"Carlos" score:35
            │ └── LEAF id:esp-b country:"Spain" athlete:"Diego" score:28
            ├─┬ LEAF_GROUP id:row-group-country-Germany ag-Grid-AutoColumn:"Germany" score:62
            │ ├── LEAF id:ger-a country:"Germany" athlete:"Greta" score:38
            │ └── LEAF id:ger-b country:"Germany" athlete:"Hans" score:24
            └─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France" score:59
            · ├── LEAF id:fra-a country:"France" athlete:"Émilie" score:32
            · └── LEAF id:fra-b country:"France" athlete:"François" score:27
        `);

        const updateRow = (id: string, score: number) => ({ ...rowById[id], score });

        applyTransactionChecked(api, {
            update: [updateRow('esp-a', 80), updateRow('ire-b', 5), updateRow('fra-a', 50)],
        });

        await new GridRows(api, 'group delta sort updated').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Spain ag-Grid-AutoColumn:"Spain" score:108
            │ ├── LEAF id:esp-a country:"Spain" athlete:"Carlos" score:80
            │ └── LEAF id:esp-b country:"Spain" athlete:"Diego" score:28
            ├─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France" score:77
            │ ├── LEAF id:fra-a country:"France" athlete:"Émilie" score:50
            │ └── LEAF id:fra-b country:"France" athlete:"François" score:27
            ├─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy" score:65
            │ ├── LEAF id:ita-a country:"Italy" athlete:"Isabella" score:36
            │ └── LEAF id:ita-b country:"Italy" athlete:"Leonardo" score:29
            ├─┬ LEAF_GROUP id:row-group-country-Germany ag-Grid-AutoColumn:"Germany" score:62
            │ ├── LEAF id:ger-a country:"Germany" athlete:"Greta" score:38
            │ └── LEAF id:ger-b country:"Germany" athlete:"Hans" score:24
            └─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland" score:45
            · ├── LEAF id:ire-a country:"Ireland" athlete:"Aine" score:40
            · └── LEAF id:ire-b country:"Ireland" athlete:"Brigid" score:5
        `);

        await new GridColumns(api, 'columns').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Country" width:200
            ├── athlete "Athlete" width:200
            └── score "Score" width:200 sort:desc aggFunc:sum
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
                { id: 'ire-a', country: 'Ireland', athlete: 'Alice', score: 20 },
                { id: 'ire-b', country: 'Ireland', athlete: 'Bob', score: 10 },
                { id: 'esp-a', country: 'Spain', athlete: 'Carlos', score: 30 },
                { id: 'esp-b', country: 'Spain', athlete: 'Diego', score: 40 },
                { id: 'fra-a', country: 'France', athlete: 'Émilie', score: 25 },
                { id: 'fra-b', country: 'France', athlete: 'François', score: 15 },
                { id: 'ger-a', country: 'Germany', athlete: 'Greta', score: 35 },
                { id: 'ger-b', country: 'Germany', athlete: 'Hans', score: 28 },
                { id: 'ita-a', country: 'Italy', athlete: 'Isabella', score: 18 },
                { id: 'ita-b', country: 'Italy', athlete: 'Leonardo', score: 22 },
            ],
            getRowId: (params) => params.data.id,
        });

        api.applyColumnState({ state: [{ colId: 'score', sort: 'asc' }] });

        await new GridRows(api, 'initial sort').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ ├── LEAF id:ire-b country:"Ireland" athlete:"Bob" score:10
            │ └── LEAF id:ire-a country:"Ireland" athlete:"Alice" score:20
            ├─┬ LEAF_GROUP id:row-group-country-Spain ag-Grid-AutoColumn:"Spain"
            │ ├── LEAF id:esp-a country:"Spain" athlete:"Carlos" score:30
            │ └── LEAF id:esp-b country:"Spain" athlete:"Diego" score:40
            ├─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France"
            │ ├── LEAF id:fra-b country:"France" athlete:"François" score:15
            │ └── LEAF id:fra-a country:"France" athlete:"Émilie" score:25
            ├─┬ LEAF_GROUP id:row-group-country-Germany ag-Grid-AutoColumn:"Germany"
            │ ├── LEAF id:ger-b country:"Germany" athlete:"Hans" score:28
            │ └── LEAF id:ger-a country:"Germany" athlete:"Greta" score:35
            └─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            · ├── LEAF id:ita-a country:"Italy" athlete:"Isabella" score:18
            · └── LEAF id:ita-b country:"Italy" athlete:"Leonardo" score:22
        `);

        applyTransactionChecked(api, { update: [{ id: 'ire-a', country: 'Ireland', athlete: 'Alice', score: 5 }] });

        await new GridRows(api, 'delta sort single update in group').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ ├── LEAF id:ire-a country:"Ireland" athlete:"Alice" score:5
            │ └── LEAF id:ire-b country:"Ireland" athlete:"Bob" score:10
            ├─┬ LEAF_GROUP id:row-group-country-Spain ag-Grid-AutoColumn:"Spain"
            │ ├── LEAF id:esp-a country:"Spain" athlete:"Carlos" score:30
            │ └── LEAF id:esp-b country:"Spain" athlete:"Diego" score:40
            ├─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France"
            │ ├── LEAF id:fra-b country:"France" athlete:"François" score:15
            │ └── LEAF id:fra-a country:"France" athlete:"Émilie" score:25
            ├─┬ LEAF_GROUP id:row-group-country-Germany ag-Grid-AutoColumn:"Germany"
            │ ├── LEAF id:ger-b country:"Germany" athlete:"Hans" score:28
            │ └── LEAF id:ger-a country:"Germany" athlete:"Greta" score:35
            └─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            · ├── LEAF id:ita-a country:"Italy" athlete:"Isabella" score:18
            · └── LEAF id:ita-b country:"Italy" athlete:"Leonardo" score:22
        `);

        await new GridColumns(api, 'columns').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Country" width:200
            ├── athlete "Athlete" width:200
            └── score "Score" width:200 sort:asc
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
                { id: '5', country: 'Spain', athlete: 'Diego', score: 20 },
                { id: '7', country: 'France', athlete: 'Émilie', score: 25 },
                { id: '8', country: 'France', athlete: 'François', score: 35 },
                { id: '10', country: 'Germany', athlete: 'Greta', score: 40 },
                { id: '11', country: 'Germany', athlete: 'Hans', score: 28 },
                { id: '13', country: 'Italy', athlete: 'Isabella', score: 32 },
                { id: '14', country: 'Italy', athlete: 'Leonardo', score: 22 },
            ],
            getRowId: (params) => params.data.id,
        });

        api.applyColumnState({ state: [{ colId: 'score', sort: 'asc' }] });

        applyTransactionChecked(api, {
            add: [
                { id: '3', country: 'Ireland', athlete: 'Charlie', score: 20 },
                { id: '6', country: 'Spain', athlete: 'Elena', score: 40 },
            ],
        });

        await new GridRows(api, 'delta sort adds in groups').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ ├── LEAF id:1 country:"Ireland" athlete:"Alice" score:10
            │ ├── LEAF id:3 country:"Ireland" athlete:"Charlie" score:20
            │ └── LEAF id:2 country:"Ireland" athlete:"Bob" score:30
            ├─┬ LEAF_GROUP id:row-group-country-Spain ag-Grid-AutoColumn:"Spain"
            │ ├── LEAF id:5 country:"Spain" athlete:"Diego" score:20
            │ ├── LEAF id:6 country:"Spain" athlete:"Elena" score:40
            │ └── LEAF id:4 country:"Spain" athlete:"Carlos" score:50
            ├─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France"
            │ ├── LEAF id:7 country:"France" athlete:"Émilie" score:25
            │ └── LEAF id:8 country:"France" athlete:"François" score:35
            ├─┬ LEAF_GROUP id:row-group-country-Germany ag-Grid-AutoColumn:"Germany"
            │ ├── LEAF id:11 country:"Germany" athlete:"Hans" score:28
            │ └── LEAF id:10 country:"Germany" athlete:"Greta" score:40
            └─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            · ├── LEAF id:14 country:"Italy" athlete:"Leonardo" score:22
            · └── LEAF id:13 country:"Italy" athlete:"Isabella" score:32
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
                { id: 'ire-1', country: 'Ireland', athlete: 'Alice', score: 10 },
                { id: 'ire-2', country: 'Ireland', athlete: 'Bob', score: 20 },
                { id: 'ire-3', country: 'Ireland', athlete: 'Charlie', score: 30 },
                { id: 'ire-4', country: 'Ireland', athlete: 'Diana', score: 40 },
                { id: 'ire-5', country: 'Ireland', athlete: 'Emma', score: 50 },
                { id: 'ire-6', country: 'Ireland', athlete: 'Frank', score: 60 },
                { id: 'esp-1', country: 'Spain', athlete: 'Carlos', score: 15 },
                { id: 'esp-2', country: 'Spain', athlete: 'Diego', score: 25 },
                { id: 'esp-3', country: 'Spain', athlete: 'Elena', score: 35 },
                { id: 'esp-4', country: 'Spain', athlete: 'Fernando', score: 45 },
                { id: 'esp-5', country: 'Spain', athlete: 'Gloria', score: 55 },
                { id: 'esp-6', country: 'Spain', athlete: 'Hugo', score: 65 },
                { id: 'fra-1', country: 'France', athlete: 'François', score: 12 },
                { id: 'fra-2', country: 'France', athlete: 'Émilie', score: 22 },
                { id: 'fra-3', country: 'France', athlete: 'Gabriel', score: 32 },
                { id: 'fra-4', country: 'France', athlete: 'Hélène', score: 42 },
                { id: 'fra-5', country: 'France', athlete: 'Isabelle', score: 52 },
                { id: 'fra-6', country: 'France', athlete: 'Jacques', score: 62 },
                { id: 'ger-1', country: 'Germany', athlete: 'Greta', score: 18 },
                { id: 'ger-2', country: 'Germany', athlete: 'Hans', score: 28 },
                { id: 'ger-3', country: 'Germany', athlete: 'Ingrid', score: 38 },
                { id: 'ger-4', country: 'Germany', athlete: 'Jürgen', score: 48 },
                { id: 'ger-5', country: 'Germany', athlete: 'Klaus', score: 58 },
                { id: 'ger-6', country: 'Germany', athlete: 'Lars', score: 68 },
                { id: 'ita-1', country: 'Italy', athlete: 'Isabella', score: 14 },
                { id: 'ita-2', country: 'Italy', athlete: 'Leonardo', score: 24 },
                { id: 'ita-3', country: 'Italy', athlete: 'Marco', score: 34 },
                { id: 'ita-4', country: 'Italy', athlete: 'Natalia', score: 44 },
                { id: 'ita-5', country: 'Italy', athlete: 'Olivia', score: 54 },
                { id: 'ita-6', country: 'Italy', athlete: 'Paolo', score: 64 },
            ],
            getRowId: (params) => params.data.id,
        });

        api.applyColumnState({ state: [{ colId: 'score', sort: 'asc' }] });

        applyTransactionChecked(api, {
            remove: [{ id: 'ire-2' }, { id: 'esp-2' }, { id: 'fra-3' }, { id: 'ger-4' }, { id: 'ita-5' }],
        });

        await new GridRows(api, 'delta sort removes in groups').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ ├── LEAF id:ire-1 country:"Ireland" athlete:"Alice" score:10
            │ ├── LEAF id:ire-3 country:"Ireland" athlete:"Charlie" score:30
            │ ├── LEAF id:ire-4 country:"Ireland" athlete:"Diana" score:40
            │ ├── LEAF id:ire-5 country:"Ireland" athlete:"Emma" score:50
            │ └── LEAF id:ire-6 country:"Ireland" athlete:"Frank" score:60
            ├─┬ LEAF_GROUP id:row-group-country-Spain ag-Grid-AutoColumn:"Spain"
            │ ├── LEAF id:esp-1 country:"Spain" athlete:"Carlos" score:15
            │ ├── LEAF id:esp-3 country:"Spain" athlete:"Elena" score:35
            │ ├── LEAF id:esp-4 country:"Spain" athlete:"Fernando" score:45
            │ ├── LEAF id:esp-5 country:"Spain" athlete:"Gloria" score:55
            │ └── LEAF id:esp-6 country:"Spain" athlete:"Hugo" score:65
            ├─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France"
            │ ├── LEAF id:fra-1 country:"France" athlete:"François" score:12
            │ ├── LEAF id:fra-2 country:"France" athlete:"Émilie" score:22
            │ ├── LEAF id:fra-4 country:"France" athlete:"Hélène" score:42
            │ ├── LEAF id:fra-5 country:"France" athlete:"Isabelle" score:52
            │ └── LEAF id:fra-6 country:"France" athlete:"Jacques" score:62
            ├─┬ LEAF_GROUP id:row-group-country-Germany ag-Grid-AutoColumn:"Germany"
            │ ├── LEAF id:ger-1 country:"Germany" athlete:"Greta" score:18
            │ ├── LEAF id:ger-2 country:"Germany" athlete:"Hans" score:28
            │ ├── LEAF id:ger-3 country:"Germany" athlete:"Ingrid" score:38
            │ ├── LEAF id:ger-5 country:"Germany" athlete:"Klaus" score:58
            │ └── LEAF id:ger-6 country:"Germany" athlete:"Lars" score:68
            └─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            · ├── LEAF id:ita-1 country:"Italy" athlete:"Isabella" score:14
            · ├── LEAF id:ita-2 country:"Italy" athlete:"Leonardo" score:24
            · ├── LEAF id:ita-3 country:"Italy" athlete:"Marco" score:34
            · ├── LEAF id:ita-4 country:"Italy" athlete:"Natalia" score:44
            · └── LEAF id:ita-6 country:"Italy" athlete:"Paolo" score:64
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
                { id: 'ire-1', country: 'Ireland', athlete: 'Alice', score: 10 },
                { id: 'ire-2', country: 'Ireland', athlete: 'Bob', score: 10 },
                { id: 'ire-3', country: 'Ireland', athlete: 'Charlie', score: 10 },
                { id: 'ire-4', country: 'Ireland', athlete: 'Diana', score: 10 },
                { id: 'ire-5', country: 'Ireland', athlete: 'Emma', score: 10 },
                { id: 'ire-6', country: 'Ireland', athlete: 'Frank', score: 10 },
                { id: 'esp-1', country: 'Spain', athlete: 'Carlos', score: 20 },
                { id: 'esp-2', country: 'Spain', athlete: 'Diego', score: 20 },
                { id: 'esp-3', country: 'Spain', athlete: 'Elena', score: 20 },
                { id: 'esp-4', country: 'Spain', athlete: 'Fernando', score: 20 },
                { id: 'esp-5', country: 'Spain', athlete: 'Gloria', score: 20 },
                { id: 'esp-6', country: 'Spain', athlete: 'Hugo', score: 20 },
                { id: 'fra-1', country: 'France', athlete: 'François', score: 30 },
                { id: 'fra-2', country: 'France', athlete: 'Émilie', score: 30 },
                { id: 'fra-3', country: 'France', athlete: 'Gabriel', score: 30 },
                { id: 'fra-4', country: 'France', athlete: 'Hélène', score: 30 },
                { id: 'fra-5', country: 'France', athlete: 'Isabelle', score: 30 },
                { id: 'fra-6', country: 'France', athlete: 'Jacques', score: 30 },
                { id: 'ger-1', country: 'Germany', athlete: 'Greta', score: 40 },
                { id: 'ger-2', country: 'Germany', athlete: 'Hans', score: 40 },
                { id: 'ger-3', country: 'Germany', athlete: 'Ingrid', score: 40 },
                { id: 'ger-4', country: 'Germany', athlete: 'Jürgen', score: 40 },
                { id: 'ger-5', country: 'Germany', athlete: 'Klaus', score: 40 },
                { id: 'ger-6', country: 'Germany', athlete: 'Lars', score: 40 },
                { id: 'ita-1', country: 'Italy', athlete: 'Isabella', score: 50 },
                { id: 'ita-2', country: 'Italy', athlete: 'Leonardo', score: 50 },
                { id: 'ita-3', country: 'Italy', athlete: 'Marco', score: 50 },
                { id: 'ita-4', country: 'Italy', athlete: 'Natalia', score: 50 },
                { id: 'ita-5', country: 'Italy', athlete: 'Olivia', score: 50 },
                { id: 'ita-6', country: 'Italy', athlete: 'Paolo', score: 50 },
            ],
            getRowId: (params) => params.data.id,
        });

        api.applyColumnState({ state: [{ colId: 'score', sort: 'asc' }] });

        applyTransactionChecked(api, {
            update: [{ id: 'ire-2', country: 'Ireland', athlete: 'Bob', score: 10 }],
            add: [{ id: 'esp-7', country: 'Spain', athlete: 'Zara', score: 20 }],
        });

        await new GridRows(api, 'delta sort equal values in groups').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ ├── LEAF id:ire-1 country:"Ireland" athlete:"Alice" score:10
            │ ├── LEAF id:ire-2 country:"Ireland" athlete:"Bob" score:10
            │ ├── LEAF id:ire-3 country:"Ireland" athlete:"Charlie" score:10
            │ ├── LEAF id:ire-4 country:"Ireland" athlete:"Diana" score:10
            │ ├── LEAF id:ire-5 country:"Ireland" athlete:"Emma" score:10
            │ └── LEAF id:ire-6 country:"Ireland" athlete:"Frank" score:10
            ├─┬ LEAF_GROUP id:row-group-country-Spain ag-Grid-AutoColumn:"Spain"
            │ ├── LEAF id:esp-1 country:"Spain" athlete:"Carlos" score:20
            │ ├── LEAF id:esp-2 country:"Spain" athlete:"Diego" score:20
            │ ├── LEAF id:esp-3 country:"Spain" athlete:"Elena" score:20
            │ ├── LEAF id:esp-4 country:"Spain" athlete:"Fernando" score:20
            │ ├── LEAF id:esp-5 country:"Spain" athlete:"Gloria" score:20
            │ ├── LEAF id:esp-6 country:"Spain" athlete:"Hugo" score:20
            │ └── LEAF id:esp-7 country:"Spain" athlete:"Zara" score:20
            ├─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France"
            │ ├── LEAF id:fra-1 country:"France" athlete:"François" score:30
            │ ├── LEAF id:fra-2 country:"France" athlete:"Émilie" score:30
            │ ├── LEAF id:fra-3 country:"France" athlete:"Gabriel" score:30
            │ ├── LEAF id:fra-4 country:"France" athlete:"Hélène" score:30
            │ ├── LEAF id:fra-5 country:"France" athlete:"Isabelle" score:30
            │ └── LEAF id:fra-6 country:"France" athlete:"Jacques" score:30
            ├─┬ LEAF_GROUP id:row-group-country-Germany ag-Grid-AutoColumn:"Germany"
            │ ├── LEAF id:ger-1 country:"Germany" athlete:"Greta" score:40
            │ ├── LEAF id:ger-2 country:"Germany" athlete:"Hans" score:40
            │ ├── LEAF id:ger-3 country:"Germany" athlete:"Ingrid" score:40
            │ ├── LEAF id:ger-4 country:"Germany" athlete:"Jürgen" score:40
            │ ├── LEAF id:ger-5 country:"Germany" athlete:"Klaus" score:40
            │ └── LEAF id:ger-6 country:"Germany" athlete:"Lars" score:40
            └─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            · ├── LEAF id:ita-1 country:"Italy" athlete:"Isabella" score:50
            · ├── LEAF id:ita-2 country:"Italy" athlete:"Leonardo" score:50
            · ├── LEAF id:ita-3 country:"Italy" athlete:"Marco" score:50
            · ├── LEAF id:ita-4 country:"Italy" athlete:"Natalia" score:50
            · ├── LEAF id:ita-5 country:"Italy" athlete:"Olivia" score:50
            · └── LEAF id:ita-6 country:"Italy" athlete:"Paolo" score:50
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
                { id: 'ire-1', country: 'Ireland', athlete: 'Alice', score: 10 },
                { id: 'ire-2', country: 'Ireland', athlete: 'Bob', score: 10 },
                { id: 'ire-3', country: 'Ireland', athlete: 'Charlie', score: 10 },
                { id: 'ire-4', country: 'Ireland', athlete: 'Diana', score: 10 },
                { id: 'ire-5', country: 'Ireland', athlete: 'Emma', score: 10 },
                { id: 'ire-6', country: 'Ireland', athlete: 'Frank', score: 10 },
                { id: 'esp-1', country: 'Spain', athlete: 'Carlos', score: 20 },
                { id: 'esp-2', country: 'Spain', athlete: 'Diego', score: 20 },
                { id: 'esp-3', country: 'Spain', athlete: 'Elena', score: 20 },
                { id: 'esp-4', country: 'Spain', athlete: 'Fernando', score: 20 },
                { id: 'esp-5', country: 'Spain', athlete: 'Gloria', score: 20 },
                { id: 'esp-6', country: 'Spain', athlete: 'Hugo', score: 20 },
                { id: 'fra-1', country: 'France', athlete: 'François', score: 30 },
                { id: 'fra-2', country: 'France', athlete: 'Émilie', score: 30 },
                { id: 'fra-3', country: 'France', athlete: 'Gabriel', score: 30 },
                { id: 'fra-4', country: 'France', athlete: 'Hélène', score: 30 },
                { id: 'fra-5', country: 'France', athlete: 'Isabelle', score: 30 },
                { id: 'fra-6', country: 'France', athlete: 'Jacques', score: 30 },
                { id: 'ger-1', country: 'Germany', athlete: 'Greta', score: 40 },
                { id: 'ger-2', country: 'Germany', athlete: 'Hans', score: 40 },
                { id: 'ger-3', country: 'Germany', athlete: 'Ingrid', score: 40 },
                { id: 'ger-4', country: 'Germany', athlete: 'Jürgen', score: 40 },
                { id: 'ger-5', country: 'Germany', athlete: 'Klaus', score: 40 },
                { id: 'ger-6', country: 'Germany', athlete: 'Lars', score: 40 },
                { id: 'ita-1', country: 'Italy', athlete: 'Isabella', score: 50 },
                { id: 'ita-2', country: 'Italy', athlete: 'Leonardo', score: 50 },
                { id: 'ita-3', country: 'Italy', athlete: 'Marco', score: 50 },
                { id: 'ita-4', country: 'Italy', athlete: 'Natalia', score: 50 },
                { id: 'ita-5', country: 'Italy', athlete: 'Olivia', score: 50 },
                { id: 'ita-6', country: 'Italy', athlete: 'Paolo', score: 50 },
            ],
            getRowId: (params) => params.data.id,
        });

        api.applyColumnState({ state: [{ colId: 'score', sort: 'asc' }] });

        applyTransactionChecked(api, {
            addIndex: 1,
            add: [{ id: 'ire-7', country: 'Ireland', athlete: 'Zara', score: 10 }],
        });

        await new GridRows(api, 'delta sort addIndex equal values in group').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ ├── LEAF id:ire-1 country:"Ireland" athlete:"Alice" score:10
            │ ├── LEAF id:ire-7 country:"Ireland" athlete:"Zara" score:10
            │ ├── LEAF id:ire-2 country:"Ireland" athlete:"Bob" score:10
            │ ├── LEAF id:ire-3 country:"Ireland" athlete:"Charlie" score:10
            │ ├── LEAF id:ire-4 country:"Ireland" athlete:"Diana" score:10
            │ ├── LEAF id:ire-5 country:"Ireland" athlete:"Emma" score:10
            │ └── LEAF id:ire-6 country:"Ireland" athlete:"Frank" score:10
            ├─┬ LEAF_GROUP id:row-group-country-Spain ag-Grid-AutoColumn:"Spain"
            │ ├── LEAF id:esp-1 country:"Spain" athlete:"Carlos" score:20
            │ ├── LEAF id:esp-2 country:"Spain" athlete:"Diego" score:20
            │ ├── LEAF id:esp-3 country:"Spain" athlete:"Elena" score:20
            │ ├── LEAF id:esp-4 country:"Spain" athlete:"Fernando" score:20
            │ ├── LEAF id:esp-5 country:"Spain" athlete:"Gloria" score:20
            │ └── LEAF id:esp-6 country:"Spain" athlete:"Hugo" score:20
            ├─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France"
            │ ├── LEAF id:fra-1 country:"France" athlete:"François" score:30
            │ ├── LEAF id:fra-2 country:"France" athlete:"Émilie" score:30
            │ ├── LEAF id:fra-3 country:"France" athlete:"Gabriel" score:30
            │ ├── LEAF id:fra-4 country:"France" athlete:"Hélène" score:30
            │ ├── LEAF id:fra-5 country:"France" athlete:"Isabelle" score:30
            │ └── LEAF id:fra-6 country:"France" athlete:"Jacques" score:30
            ├─┬ LEAF_GROUP id:row-group-country-Germany ag-Grid-AutoColumn:"Germany"
            │ ├── LEAF id:ger-1 country:"Germany" athlete:"Greta" score:40
            │ ├── LEAF id:ger-2 country:"Germany" athlete:"Hans" score:40
            │ ├── LEAF id:ger-3 country:"Germany" athlete:"Ingrid" score:40
            │ ├── LEAF id:ger-4 country:"Germany" athlete:"Jürgen" score:40
            │ ├── LEAF id:ger-5 country:"Germany" athlete:"Klaus" score:40
            │ └── LEAF id:ger-6 country:"Germany" athlete:"Lars" score:40
            └─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            · ├── LEAF id:ita-1 country:"Italy" athlete:"Isabella" score:50
            · ├── LEAF id:ita-2 country:"Italy" athlete:"Leonardo" score:50
            · ├── LEAF id:ita-3 country:"Italy" athlete:"Marco" score:50
            · ├── LEAF id:ita-4 country:"Italy" athlete:"Natalia" score:50
            · ├── LEAF id:ita-5 country:"Italy" athlete:"Olivia" score:50
            · └── LEAF id:ita-6 country:"Italy" athlete:"Paolo" score:50
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
                { id: 'ire-1', country: 'Ireland', year: 2020, athlete: 'Alice', score: 10 },
                { id: 'ire-2', country: 'Ireland', year: 2020, athlete: 'Bob', score: 20 },
                { id: 'ire-3', country: 'Ireland', year: 2020, athlete: 'Charlie', score: 30 },
                { id: 'ire-4', country: 'Ireland', year: 2021, athlete: 'Diana', score: 40 },
                { id: 'ire-5', country: 'Ireland', year: 2021, athlete: 'Emma', score: 50 },
                { id: 'ire-6', country: 'Ireland', year: 2021, athlete: 'Frank', score: 60 },
                { id: 'esp-1', country: 'Spain', year: 2020, athlete: 'Carlos', score: 15 },
                { id: 'esp-2', country: 'Spain', year: 2020, athlete: 'Diego', score: 25 },
                { id: 'esp-3', country: 'Spain', year: 2020, athlete: 'Elena', score: 35 },
                { id: 'esp-4', country: 'Spain', year: 2021, athlete: 'Fernando', score: 45 },
                { id: 'esp-5', country: 'Spain', year: 2021, athlete: 'Gloria', score: 55 },
                { id: 'esp-6', country: 'Spain', year: 2021, athlete: 'Hugo', score: 65 },
                { id: 'fra-1', country: 'France', year: 2020, athlete: 'François', score: 12 },
                { id: 'fra-2', country: 'France', year: 2020, athlete: 'Émilie', score: 22 },
                { id: 'fra-3', country: 'France', year: 2020, athlete: 'Gabriel', score: 32 },
                { id: 'fra-4', country: 'France', year: 2021, athlete: 'Hélène', score: 42 },
                { id: 'fra-5', country: 'France', year: 2021, athlete: 'Isabelle', score: 52 },
                { id: 'fra-6', country: 'France', year: 2021, athlete: 'Jacques', score: 62 },
                { id: 'ger-1', country: 'Germany', year: 2020, athlete: 'Greta', score: 18 },
                { id: 'ger-2', country: 'Germany', year: 2020, athlete: 'Hans', score: 28 },
                { id: 'ger-3', country: 'Germany', year: 2020, athlete: 'Ingrid', score: 38 },
                { id: 'ger-4', country: 'Germany', year: 2021, athlete: 'Jürgen', score: 48 },
                { id: 'ger-5', country: 'Germany', year: 2021, athlete: 'Klaus', score: 58 },
                { id: 'ger-6', country: 'Germany', year: 2021, athlete: 'Lars', score: 68 },
                { id: 'ita-1', country: 'Italy', year: 2020, athlete: 'Isabella', score: 14 },
                { id: 'ita-2', country: 'Italy', year: 2020, athlete: 'Leonardo', score: 24 },
                { id: 'ita-3', country: 'Italy', year: 2020, athlete: 'Marco', score: 34 },
                { id: 'ita-4', country: 'Italy', year: 2021, athlete: 'Natalia', score: 44 },
                { id: 'ita-5', country: 'Italy', year: 2021, athlete: 'Olivia', score: 54 },
                { id: 'ita-6', country: 'Italy', year: 2021, athlete: 'Paolo', score: 64 },
            ],
            getRowId: (params) => params.data.id,
        });

        api.applyColumnState({ state: [{ colId: 'score', sort: 'asc' }] });

        await new GridRows(api, 'initial multi-level').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ ├─┬ LEAF_GROUP id:row-group-country-Ireland-year-2020 ag-Grid-AutoColumn:2020
            │ │ ├── LEAF id:ire-1 country:"Ireland" year:2020 athlete:"Alice" score:10
            │ │ ├── LEAF id:ire-2 country:"Ireland" year:2020 athlete:"Bob" score:20
            │ │ └── LEAF id:ire-3 country:"Ireland" year:2020 athlete:"Charlie" score:30
            │ └─┬ LEAF_GROUP id:row-group-country-Ireland-year-2021 ag-Grid-AutoColumn:2021
            │ · ├── LEAF id:ire-4 country:"Ireland" year:2021 athlete:"Diana" score:40
            │ · ├── LEAF id:ire-5 country:"Ireland" year:2021 athlete:"Emma" score:50
            │ · └── LEAF id:ire-6 country:"Ireland" year:2021 athlete:"Frank" score:60
            ├─┬ filler id:row-group-country-Spain ag-Grid-AutoColumn:"Spain"
            │ ├─┬ LEAF_GROUP id:row-group-country-Spain-year-2020 ag-Grid-AutoColumn:2020
            │ │ ├── LEAF id:esp-1 country:"Spain" year:2020 athlete:"Carlos" score:15
            │ │ ├── LEAF id:esp-2 country:"Spain" year:2020 athlete:"Diego" score:25
            │ │ └── LEAF id:esp-3 country:"Spain" year:2020 athlete:"Elena" score:35
            │ └─┬ LEAF_GROUP id:row-group-country-Spain-year-2021 ag-Grid-AutoColumn:2021
            │ · ├── LEAF id:esp-4 country:"Spain" year:2021 athlete:"Fernando" score:45
            │ · ├── LEAF id:esp-5 country:"Spain" year:2021 athlete:"Gloria" score:55
            │ · └── LEAF id:esp-6 country:"Spain" year:2021 athlete:"Hugo" score:65
            ├─┬ filler id:row-group-country-France ag-Grid-AutoColumn:"France"
            │ ├─┬ LEAF_GROUP id:row-group-country-France-year-2020 ag-Grid-AutoColumn:2020
            │ │ ├── LEAF id:fra-1 country:"France" year:2020 athlete:"François" score:12
            │ │ ├── LEAF id:fra-2 country:"France" year:2020 athlete:"Émilie" score:22
            │ │ └── LEAF id:fra-3 country:"France" year:2020 athlete:"Gabriel" score:32
            │ └─┬ LEAF_GROUP id:row-group-country-France-year-2021 ag-Grid-AutoColumn:2021
            │ · ├── LEAF id:fra-4 country:"France" year:2021 athlete:"Hélène" score:42
            │ · ├── LEAF id:fra-5 country:"France" year:2021 athlete:"Isabelle" score:52
            │ · └── LEAF id:fra-6 country:"France" year:2021 athlete:"Jacques" score:62
            ├─┬ filler id:row-group-country-Germany ag-Grid-AutoColumn:"Germany"
            │ ├─┬ LEAF_GROUP id:row-group-country-Germany-year-2020 ag-Grid-AutoColumn:2020
            │ │ ├── LEAF id:ger-1 country:"Germany" year:2020 athlete:"Greta" score:18
            │ │ ├── LEAF id:ger-2 country:"Germany" year:2020 athlete:"Hans" score:28
            │ │ └── LEAF id:ger-3 country:"Germany" year:2020 athlete:"Ingrid" score:38
            │ └─┬ LEAF_GROUP id:row-group-country-Germany-year-2021 ag-Grid-AutoColumn:2021
            │ · ├── LEAF id:ger-4 country:"Germany" year:2021 athlete:"Jürgen" score:48
            │ · ├── LEAF id:ger-5 country:"Germany" year:2021 athlete:"Klaus" score:58
            │ · └── LEAF id:ger-6 country:"Germany" year:2021 athlete:"Lars" score:68
            └─┬ filler id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            · ├─┬ LEAF_GROUP id:row-group-country-Italy-year-2020 ag-Grid-AutoColumn:2020
            · │ ├── LEAF id:ita-1 country:"Italy" year:2020 athlete:"Isabella" score:14
            · │ ├── LEAF id:ita-2 country:"Italy" year:2020 athlete:"Leonardo" score:24
            · │ └── LEAF id:ita-3 country:"Italy" year:2020 athlete:"Marco" score:34
            · └─┬ LEAF_GROUP id:row-group-country-Italy-year-2021 ag-Grid-AutoColumn:2021
            · · ├── LEAF id:ita-4 country:"Italy" year:2021 athlete:"Natalia" score:44
            · · ├── LEAF id:ita-5 country:"Italy" year:2021 athlete:"Olivia" score:54
            · · └── LEAF id:ita-6 country:"Italy" year:2021 athlete:"Paolo" score:64
        `);

        applyTransactionChecked(api, {
            update: [{ id: 'ire-2', country: 'Ireland', year: 2020, athlete: 'Bob', score: 5 }],
            add: [{ id: 'ire-7', country: 'Ireland', year: 2020, athlete: 'Zara', score: 15 }],
        });

        await new GridRows(api, 'delta sort multi-level with updates and adds').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ ├─┬ LEAF_GROUP id:row-group-country-Ireland-year-2020 ag-Grid-AutoColumn:2020
            │ │ ├── LEAF id:ire-2 country:"Ireland" year:2020 athlete:"Bob" score:5
            │ │ ├── LEAF id:ire-1 country:"Ireland" year:2020 athlete:"Alice" score:10
            │ │ ├── LEAF id:ire-7 country:"Ireland" year:2020 athlete:"Zara" score:15
            │ │ └── LEAF id:ire-3 country:"Ireland" year:2020 athlete:"Charlie" score:30
            │ └─┬ LEAF_GROUP id:row-group-country-Ireland-year-2021 ag-Grid-AutoColumn:2021
            │ · ├── LEAF id:ire-4 country:"Ireland" year:2021 athlete:"Diana" score:40
            │ · ├── LEAF id:ire-5 country:"Ireland" year:2021 athlete:"Emma" score:50
            │ · └── LEAF id:ire-6 country:"Ireland" year:2021 athlete:"Frank" score:60
            ├─┬ filler id:row-group-country-Spain ag-Grid-AutoColumn:"Spain"
            │ ├─┬ LEAF_GROUP id:row-group-country-Spain-year-2020 ag-Grid-AutoColumn:2020
            │ │ ├── LEAF id:esp-1 country:"Spain" year:2020 athlete:"Carlos" score:15
            │ │ ├── LEAF id:esp-2 country:"Spain" year:2020 athlete:"Diego" score:25
            │ │ └── LEAF id:esp-3 country:"Spain" year:2020 athlete:"Elena" score:35
            │ └─┬ LEAF_GROUP id:row-group-country-Spain-year-2021 ag-Grid-AutoColumn:2021
            │ · ├── LEAF id:esp-4 country:"Spain" year:2021 athlete:"Fernando" score:45
            │ · ├── LEAF id:esp-5 country:"Spain" year:2021 athlete:"Gloria" score:55
            │ · └── LEAF id:esp-6 country:"Spain" year:2021 athlete:"Hugo" score:65
            ├─┬ filler id:row-group-country-France ag-Grid-AutoColumn:"France"
            │ ├─┬ LEAF_GROUP id:row-group-country-France-year-2020 ag-Grid-AutoColumn:2020
            │ │ ├── LEAF id:fra-1 country:"France" year:2020 athlete:"François" score:12
            │ │ ├── LEAF id:fra-2 country:"France" year:2020 athlete:"Émilie" score:22
            │ │ └── LEAF id:fra-3 country:"France" year:2020 athlete:"Gabriel" score:32
            │ └─┬ LEAF_GROUP id:row-group-country-France-year-2021 ag-Grid-AutoColumn:2021
            │ · ├── LEAF id:fra-4 country:"France" year:2021 athlete:"Hélène" score:42
            │ · ├── LEAF id:fra-5 country:"France" year:2021 athlete:"Isabelle" score:52
            │ · └── LEAF id:fra-6 country:"France" year:2021 athlete:"Jacques" score:62
            ├─┬ filler id:row-group-country-Germany ag-Grid-AutoColumn:"Germany"
            │ ├─┬ LEAF_GROUP id:row-group-country-Germany-year-2020 ag-Grid-AutoColumn:2020
            │ │ ├── LEAF id:ger-1 country:"Germany" year:2020 athlete:"Greta" score:18
            │ │ ├── LEAF id:ger-2 country:"Germany" year:2020 athlete:"Hans" score:28
            │ │ └── LEAF id:ger-3 country:"Germany" year:2020 athlete:"Ingrid" score:38
            │ └─┬ LEAF_GROUP id:row-group-country-Germany-year-2021 ag-Grid-AutoColumn:2021
            │ · ├── LEAF id:ger-4 country:"Germany" year:2021 athlete:"Jürgen" score:48
            │ · ├── LEAF id:ger-5 country:"Germany" year:2021 athlete:"Klaus" score:58
            │ · └── LEAF id:ger-6 country:"Germany" year:2021 athlete:"Lars" score:68
            └─┬ filler id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            · ├─┬ LEAF_GROUP id:row-group-country-Italy-year-2020 ag-Grid-AutoColumn:2020
            · │ ├── LEAF id:ita-1 country:"Italy" year:2020 athlete:"Isabella" score:14
            · │ ├── LEAF id:ita-2 country:"Italy" year:2020 athlete:"Leonardo" score:24
            · │ └── LEAF id:ita-3 country:"Italy" year:2020 athlete:"Marco" score:34
            · └─┬ LEAF_GROUP id:row-group-country-Italy-year-2021 ag-Grid-AutoColumn:2021
            · · ├── LEAF id:ita-4 country:"Italy" year:2021 athlete:"Natalia" score:44
            · · ├── LEAF id:ita-5 country:"Italy" year:2021 athlete:"Olivia" score:54
            · · └── LEAF id:ita-6 country:"Italy" year:2021 athlete:"Paolo" score:64
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
                { id: 'ire-1', country: 'Ireland', athlete: 'Alice', score: 10 },
                { id: 'ire-2', country: 'Ireland', athlete: 'Bob', score: 20 },
                { id: 'ire-3', country: 'Ireland', athlete: 'Charlie', score: 30 },
                { id: 'ire-4', country: 'Ireland', athlete: 'Diana', score: 40 },
                { id: 'ire-5', country: 'Ireland', athlete: 'Emma', score: 50 },
                { id: 'ire-6', country: 'Ireland', athlete: 'Frank', score: 60 },
                { id: 'esp-1', country: 'Spain', athlete: 'Carlos', score: 15 },
                { id: 'esp-2', country: 'Spain', athlete: 'Diego', score: 25 },
                { id: 'esp-3', country: 'Spain', athlete: 'Elena', score: 35 },
                { id: 'esp-4', country: 'Spain', athlete: 'Fernando', score: 45 },
                { id: 'esp-5', country: 'Spain', athlete: 'Gloria', score: 55 },
                { id: 'esp-6', country: 'Spain', athlete: 'Hugo', score: 65 },
                { id: 'fra-1', country: 'France', athlete: 'François', score: 12 },
                { id: 'fra-2', country: 'France', athlete: 'Émilie', score: 22 },
                { id: 'fra-3', country: 'France', athlete: 'Gabriel', score: 32 },
                { id: 'fra-4', country: 'France', athlete: 'Hélène', score: 42 },
                { id: 'fra-5', country: 'France', athlete: 'Isabelle', score: 52 },
                { id: 'fra-6', country: 'France', athlete: 'Jacques', score: 62 },
                { id: 'ger-1', country: 'Germany', athlete: 'Greta', score: 18 },
                { id: 'ger-2', country: 'Germany', athlete: 'Hans', score: 28 },
                { id: 'ger-3', country: 'Germany', athlete: 'Ingrid', score: 38 },
                { id: 'ger-4', country: 'Germany', athlete: 'Jürgen', score: 48 },
                { id: 'ger-5', country: 'Germany', athlete: 'Klaus', score: 58 },
                { id: 'ger-6', country: 'Germany', athlete: 'Lars', score: 68 },
                { id: 'ita-1', country: 'Italy', athlete: 'Isabella', score: 14 },
                { id: 'ita-2', country: 'Italy', athlete: 'Leonardo', score: 24 },
                { id: 'ita-3', country: 'Italy', athlete: 'Marco', score: 34 },
                { id: 'ita-4', country: 'Italy', athlete: 'Natalia', score: 44 },
                { id: 'ita-5', country: 'Italy', athlete: 'Olivia', score: 54 },
                { id: 'ita-6', country: 'Italy', athlete: 'Paolo', score: 64 },
            ],
            getRowId: (params) => params.data.id,
        });

        api.applyColumnState({ state: [{ colId: 'score', sort: 'asc' }] });

        applyTransactionChecked(api, {
            remove: [{ id: 'ire-2' }, { id: 'fra-6' }],
            update: [{ id: 'ire-3', country: 'Ireland', athlete: 'Charlie', score: 5 }],
            add: [
                { id: 'ire-7', country: 'Ireland', athlete: 'George', score: 35 },
                { id: 'esp-7', country: 'Spain', athlete: 'Zara', score: 70 },
            ],
        });

        await new GridRows(api, 'delta sort mixed operations multiple groups').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ ├── LEAF id:ire-3 country:"Ireland" athlete:"Charlie" score:5
            │ ├── LEAF id:ire-1 country:"Ireland" athlete:"Alice" score:10
            │ ├── LEAF id:ire-7 country:"Ireland" athlete:"George" score:35
            │ ├── LEAF id:ire-4 country:"Ireland" athlete:"Diana" score:40
            │ ├── LEAF id:ire-5 country:"Ireland" athlete:"Emma" score:50
            │ └── LEAF id:ire-6 country:"Ireland" athlete:"Frank" score:60
            ├─┬ LEAF_GROUP id:row-group-country-Spain ag-Grid-AutoColumn:"Spain"
            │ ├── LEAF id:esp-1 country:"Spain" athlete:"Carlos" score:15
            │ ├── LEAF id:esp-2 country:"Spain" athlete:"Diego" score:25
            │ ├── LEAF id:esp-3 country:"Spain" athlete:"Elena" score:35
            │ ├── LEAF id:esp-4 country:"Spain" athlete:"Fernando" score:45
            │ ├── LEAF id:esp-5 country:"Spain" athlete:"Gloria" score:55
            │ ├── LEAF id:esp-6 country:"Spain" athlete:"Hugo" score:65
            │ └── LEAF id:esp-7 country:"Spain" athlete:"Zara" score:70
            ├─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France"
            │ ├── LEAF id:fra-1 country:"France" athlete:"François" score:12
            │ ├── LEAF id:fra-2 country:"France" athlete:"Émilie" score:22
            │ ├── LEAF id:fra-3 country:"France" athlete:"Gabriel" score:32
            │ ├── LEAF id:fra-4 country:"France" athlete:"Hélène" score:42
            │ └── LEAF id:fra-5 country:"France" athlete:"Isabelle" score:52
            ├─┬ LEAF_GROUP id:row-group-country-Germany ag-Grid-AutoColumn:"Germany"
            │ ├── LEAF id:ger-1 country:"Germany" athlete:"Greta" score:18
            │ ├── LEAF id:ger-2 country:"Germany" athlete:"Hans" score:28
            │ ├── LEAF id:ger-3 country:"Germany" athlete:"Ingrid" score:38
            │ ├── LEAF id:ger-4 country:"Germany" athlete:"Jürgen" score:48
            │ ├── LEAF id:ger-5 country:"Germany" athlete:"Klaus" score:58
            │ └── LEAF id:ger-6 country:"Germany" athlete:"Lars" score:68
            └─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            · ├── LEAF id:ita-1 country:"Italy" athlete:"Isabella" score:14
            · ├── LEAF id:ita-2 country:"Italy" athlete:"Leonardo" score:24
            · ├── LEAF id:ita-3 country:"Italy" athlete:"Marco" score:34
            · ├── LEAF id:ita-4 country:"Italy" athlete:"Natalia" score:44
            · ├── LEAF id:ita-5 country:"Italy" athlete:"Olivia" score:54
            · └── LEAF id:ita-6 country:"Italy" athlete:"Paolo" score:64
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
                { id: 'ire-1', country: 'Ireland', athlete: 'Alice', score: 10 },
                { id: 'ire-2', country: 'Ireland', athlete: 'Bob', score: 20 },
                { id: 'ire-3', country: 'Ireland', athlete: 'Charlie', score: 30 },
                { id: 'ire-4', country: 'Ireland', athlete: 'Diana', score: 40 },
                { id: 'ire-5', country: 'Ireland', athlete: 'Emma', score: 50 },
                { id: 'ire-6', country: 'Ireland', athlete: 'Frank', score: 60 },
                { id: 'esp-1', country: 'Spain', athlete: 'Carlos', score: 15 },
                { id: 'esp-2', country: 'Spain', athlete: 'Diego', score: 25 },
                { id: 'esp-3', country: 'Spain', athlete: 'Elena', score: 35 },
                { id: 'esp-4', country: 'Spain', athlete: 'Fernando', score: 45 },
                { id: 'esp-5', country: 'Spain', athlete: 'Gloria', score: 55 },
                { id: 'esp-6', country: 'Spain', athlete: 'Hugo', score: 65 },
                { id: 'fra-1', country: 'France', athlete: 'François', score: 12 },
                { id: 'fra-2', country: 'France', athlete: 'Émilie', score: 22 },
                { id: 'fra-3', country: 'France', athlete: 'Gabriel', score: 32 },
                { id: 'fra-4', country: 'France', athlete: 'Hélène', score: 42 },
                { id: 'fra-5', country: 'France', athlete: 'Isabelle', score: 52 },
                { id: 'fra-6', country: 'France', athlete: 'Jacques', score: 62 },
                { id: 'ger-1', country: 'Germany', athlete: 'Greta', score: 18 },
                { id: 'ger-2', country: 'Germany', athlete: 'Hans', score: 28 },
                { id: 'ger-3', country: 'Germany', athlete: 'Ingrid', score: 38 },
                { id: 'ger-4', country: 'Germany', athlete: 'Jürgen', score: 48 },
                { id: 'ger-5', country: 'Germany', athlete: 'Klaus', score: 58 },
                { id: 'ger-6', country: 'Germany', athlete: 'Lars', score: 68 },
                { id: 'ita-1', country: 'Italy', athlete: 'Isabella', score: 14 },
                { id: 'ita-2', country: 'Italy', athlete: 'Leonardo', score: 24 },
                { id: 'ita-3', country: 'Italy', athlete: 'Marco', score: 34 },
                { id: 'ita-4', country: 'Italy', athlete: 'Natalia', score: 44 },
                { id: 'ita-5', country: 'Italy', athlete: 'Olivia', score: 54 },
                { id: 'ita-6', country: 'Italy', athlete: 'Paolo', score: 64 },
            ],
            getRowId: (params) => params.data.id,
        });

        api.applyColumnState({ state: [{ colId: 'score', sort: 'asc' }] });

        applyTransactionChecked(api, { add: [], remove: [], update: [] });

        await new GridRows(api, 'delta sort no changes grouped').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ ├── LEAF id:ire-1 country:"Ireland" athlete:"Alice" score:10
            │ ├── LEAF id:ire-2 country:"Ireland" athlete:"Bob" score:20
            │ ├── LEAF id:ire-3 country:"Ireland" athlete:"Charlie" score:30
            │ ├── LEAF id:ire-4 country:"Ireland" athlete:"Diana" score:40
            │ ├── LEAF id:ire-5 country:"Ireland" athlete:"Emma" score:50
            │ └── LEAF id:ire-6 country:"Ireland" athlete:"Frank" score:60
            ├─┬ LEAF_GROUP id:row-group-country-Spain ag-Grid-AutoColumn:"Spain"
            │ ├── LEAF id:esp-1 country:"Spain" athlete:"Carlos" score:15
            │ ├── LEAF id:esp-2 country:"Spain" athlete:"Diego" score:25
            │ ├── LEAF id:esp-3 country:"Spain" athlete:"Elena" score:35
            │ ├── LEAF id:esp-4 country:"Spain" athlete:"Fernando" score:45
            │ ├── LEAF id:esp-5 country:"Spain" athlete:"Gloria" score:55
            │ └── LEAF id:esp-6 country:"Spain" athlete:"Hugo" score:65
            ├─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France"
            │ ├── LEAF id:fra-1 country:"France" athlete:"François" score:12
            │ ├── LEAF id:fra-2 country:"France" athlete:"Émilie" score:22
            │ ├── LEAF id:fra-3 country:"France" athlete:"Gabriel" score:32
            │ ├── LEAF id:fra-4 country:"France" athlete:"Hélène" score:42
            │ ├── LEAF id:fra-5 country:"France" athlete:"Isabelle" score:52
            │ └── LEAF id:fra-6 country:"France" athlete:"Jacques" score:62
            ├─┬ LEAF_GROUP id:row-group-country-Germany ag-Grid-AutoColumn:"Germany"
            │ ├── LEAF id:ger-1 country:"Germany" athlete:"Greta" score:18
            │ ├── LEAF id:ger-2 country:"Germany" athlete:"Hans" score:28
            │ ├── LEAF id:ger-3 country:"Germany" athlete:"Ingrid" score:38
            │ ├── LEAF id:ger-4 country:"Germany" athlete:"Jürgen" score:48
            │ ├── LEAF id:ger-5 country:"Germany" athlete:"Klaus" score:58
            │ └── LEAF id:ger-6 country:"Germany" athlete:"Lars" score:68
            └─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            · ├── LEAF id:ita-1 country:"Italy" athlete:"Isabella" score:14
            · ├── LEAF id:ita-2 country:"Italy" athlete:"Leonardo" score:24
            · ├── LEAF id:ita-3 country:"Italy" athlete:"Marco" score:34
            · ├── LEAF id:ita-4 country:"Italy" athlete:"Natalia" score:44
            · ├── LEAF id:ita-5 country:"Italy" athlete:"Olivia" score:54
            · └── LEAF id:ita-6 country:"Italy" athlete:"Paolo" score:64
        `);
    });

    test('delta sort grouped with duplicate node IDs', async () => {
        const consoleWarnSpy = vitest.spyOn(console, 'warn').mockImplementation(() => {});

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
                { id: 'ire-1', country: 'Ireland', athlete: 'Alice', score: 10 },
                { id: 'ire-2', country: 'Ireland', athlete: 'Bob', score: 20 },
                { id: 'ire-3', country: 'Ireland', athlete: 'Charlie', score: 30 },
                { id: 'ire-1', country: 'Ireland', athlete: 'Diana', score: 40 }, // Duplicate ID
                { id: 'ire-4', country: 'Ireland', athlete: 'Emma', score: 50 },
                { id: 'ire-5', country: 'Ireland', athlete: 'Frank', score: 60 },
                { id: 'esp-1', country: 'Spain', athlete: 'Carlos', score: 15 },
                { id: 'esp-2', country: 'Spain', athlete: 'Diego', score: 25 },
                { id: 'esp-3', country: 'Spain', athlete: 'Elena', score: 35 },
                { id: 'esp-4', country: 'Spain', athlete: 'Fernando', score: 45 },
                { id: 'esp-5', country: 'Spain', athlete: 'Gloria', score: 55 },
                { id: 'esp-6', country: 'Spain', athlete: 'Hugo', score: 65 },
                { id: 'fra-1', country: 'France', athlete: 'François', score: 12 },
                { id: 'fra-2', country: 'France', athlete: 'Émilie', score: 22 },
                { id: 'fra-3', country: 'France', athlete: 'Gabriel', score: 32 },
                { id: 'fra-4', country: 'France', athlete: 'Hélène', score: 42 },
                { id: 'fra-5', country: 'France', athlete: 'Isabelle', score: 52 },
                { id: 'fra-6', country: 'France', athlete: 'Jacques', score: 62 },
                { id: 'ger-1', country: 'Germany', athlete: 'Greta', score: 18 },
                { id: 'ger-2', country: 'Germany', athlete: 'Hans', score: 28 },
                { id: 'ger-3', country: 'Germany', athlete: 'Ingrid', score: 38 },
                { id: 'ger-4', country: 'Germany', athlete: 'Jürgen', score: 48 },
                { id: 'ger-5', country: 'Germany', athlete: 'Klaus', score: 58 },
                { id: 'ger-6', country: 'Germany', athlete: 'Lars', score: 68 },
                { id: 'ita-1', country: 'Italy', athlete: 'Isabella', score: 14 },
                { id: 'ita-2', country: 'Italy', athlete: 'Leonardo', score: 24 },
                { id: 'ita-3', country: 'Italy', athlete: 'Marco', score: 34 },
                { id: 'ita-4', country: 'Italy', athlete: 'Natalia', score: 44 },
                { id: 'ita-5', country: 'Italy', athlete: 'Olivia', score: 54 },
                { id: 'ita-6', country: 'Italy', athlete: 'Paolo', score: 64 },
            ],
            getRowId: (params) => params.data.id,
        });

        api.applyColumnState({ state: [{ colId: 'score', sort: 'asc' }] });

        applyTransactionChecked(api, {
            update: [{ id: 'ire-2', country: 'Ireland', athlete: 'Bob', score: 5 }],
            add: [{ id: 'esp-7', country: 'Spain', athlete: 'Zara', score: 70 }],
        });

        // checkDom: false — this test intentionally uses duplicate row IDs (ire-1 appears twice),
        // which causes DOM order/cell validation to fail as the grid cannot distinguish the duplicate DOM rows.
        await new GridRows(api, 'delta sort grouped with duplicate IDs', { checkDom: false }).check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ ├── LEAF id:ire-2 country:"Ireland" athlete:"Bob" score:5
            │ ├── LEAF id:ire-1 country:"Ireland" athlete:"Alice" score:10
            │ ├── LEAF id:ire-3 country:"Ireland" athlete:"Charlie" score:30
            │ ├── LEAF id:ire-1 country:"Ireland" athlete:"Diana" score:40
            │ ├── LEAF id:ire-4 country:"Ireland" athlete:"Emma" score:50
            │ └── LEAF id:ire-5 country:"Ireland" athlete:"Frank" score:60
            ├─┬ LEAF_GROUP id:row-group-country-Spain ag-Grid-AutoColumn:"Spain"
            │ ├── LEAF id:esp-1 country:"Spain" athlete:"Carlos" score:15
            │ ├── LEAF id:esp-2 country:"Spain" athlete:"Diego" score:25
            │ ├── LEAF id:esp-3 country:"Spain" athlete:"Elena" score:35
            │ ├── LEAF id:esp-4 country:"Spain" athlete:"Fernando" score:45
            │ ├── LEAF id:esp-5 country:"Spain" athlete:"Gloria" score:55
            │ ├── LEAF id:esp-6 country:"Spain" athlete:"Hugo" score:65
            │ └── LEAF id:esp-7 country:"Spain" athlete:"Zara" score:70
            ├─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France"
            │ ├── LEAF id:fra-1 country:"France" athlete:"François" score:12
            │ ├── LEAF id:fra-2 country:"France" athlete:"Émilie" score:22
            │ ├── LEAF id:fra-3 country:"France" athlete:"Gabriel" score:32
            │ ├── LEAF id:fra-4 country:"France" athlete:"Hélène" score:42
            │ ├── LEAF id:fra-5 country:"France" athlete:"Isabelle" score:52
            │ └── LEAF id:fra-6 country:"France" athlete:"Jacques" score:62
            ├─┬ LEAF_GROUP id:row-group-country-Germany ag-Grid-AutoColumn:"Germany"
            │ ├── LEAF id:ger-1 country:"Germany" athlete:"Greta" score:18
            │ ├── LEAF id:ger-2 country:"Germany" athlete:"Hans" score:28
            │ ├── LEAF id:ger-3 country:"Germany" athlete:"Ingrid" score:38
            │ ├── LEAF id:ger-4 country:"Germany" athlete:"Jürgen" score:48
            │ ├── LEAF id:ger-5 country:"Germany" athlete:"Klaus" score:58
            │ └── LEAF id:ger-6 country:"Germany" athlete:"Lars" score:68
            └─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            · ├── LEAF id:ita-1 country:"Italy" athlete:"Isabella" score:14
            · ├── LEAF id:ita-2 country:"Italy" athlete:"Leonardo" score:24
            · ├── LEAF id:ita-3 country:"Italy" athlete:"Marco" score:34
            · ├── LEAF id:ita-4 country:"Italy" athlete:"Natalia" score:44
            · ├── LEAF id:ita-5 country:"Italy" athlete:"Olivia" score:54
            · └── LEAF id:ita-6 country:"Italy" athlete:"Paolo" score:64
        `);

        consoleWarnSpy.mockRestore();
    });

    test('delta sort grouped with duplicate rowData instances', async () => {
        const consoleWarnSpy = vitest.spyOn(console, 'warn').mockImplementation(() => {});

        const sharedIre = { id: 'ire-shared', country: 'Ireland', athlete: 'Shared', score: 25 };
        const sharedEsp = { id: 'esp-shared', country: 'Spain', athlete: 'Shared', score: 27 };
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
                { id: 'ire-1', country: 'Ireland', athlete: 'Alice', score: 10 },
                { id: 'ire-2', country: 'Ireland', athlete: 'Bob', score: 20 },
                sharedIre,
                sharedIre, // Duplicate instance
                { id: 'ire-3', country: 'Ireland', athlete: 'Charlie', score: 30 },
                { id: 'ire-4', country: 'Ireland', athlete: 'Diana', score: 40 },
                { id: 'esp-1', country: 'Spain', athlete: 'Carlos', score: 15 },
                sharedEsp,
                sharedEsp, // Duplicate instance
                { id: 'esp-2', country: 'Spain', athlete: 'Diego', score: 35 },
                { id: 'esp-3', country: 'Spain', athlete: 'Elena', score: 45 },
                { id: 'esp-4', country: 'Spain', athlete: 'Fernando', score: 55 },
                { id: 'fra-1', country: 'France', athlete: 'François', score: 12 },
                { id: 'fra-2', country: 'France', athlete: 'Émilie', score: 22 },
                { id: 'fra-3', country: 'France', athlete: 'Gabriel', score: 32 },
                { id: 'fra-4', country: 'France', athlete: 'Hélène', score: 42 },
                { id: 'fra-5', country: 'France', athlete: 'Isabelle', score: 52 },
                { id: 'fra-6', country: 'France', athlete: 'Jacques', score: 62 },
                { id: 'ger-1', country: 'Germany', athlete: 'Greta', score: 18 },
                { id: 'ger-2', country: 'Germany', athlete: 'Hans', score: 28 },
                { id: 'ger-3', country: 'Germany', athlete: 'Ingrid', score: 38 },
                { id: 'ger-4', country: 'Germany', athlete: 'Jürgen', score: 48 },
                { id: 'ger-5', country: 'Germany', athlete: 'Klaus', score: 58 },
                { id: 'ger-6', country: 'Germany', athlete: 'Lars', score: 68 },
                { id: 'ita-1', country: 'Italy', athlete: 'Isabella', score: 14 },
                { id: 'ita-2', country: 'Italy', athlete: 'Leonardo', score: 24 },
                { id: 'ita-3', country: 'Italy', athlete: 'Marco', score: 34 },
                { id: 'ita-4', country: 'Italy', athlete: 'Natalia', score: 44 },
                { id: 'ita-5', country: 'Italy', athlete: 'Olivia', score: 54 },
                { id: 'ita-6', country: 'Italy', athlete: 'Paolo', score: 64 },
            ],
            getRowId: (params) => params.data.id,
        });

        api.applyColumnState({ state: [{ colId: 'score', sort: 'asc' }] });

        applyTransactionChecked(api, {
            update: [{ id: 'ire-2', country: 'Ireland', athlete: 'Bob', score: 5 }],
            add: [{ id: 'esp-5', country: 'Spain', athlete: 'Zara', score: 70 }],
        });

        // checkDom: false — this test intentionally uses duplicate rowData object instances (same JS object twice),
        // which causes DOM order/cell validation to fail as the grid cannot distinguish the duplicate DOM rows.
        await new GridRows(api, 'delta sort grouped with duplicate instances', { checkDom: false }).check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Ireland ag-Grid-AutoColumn:"Ireland"
            │ ├── LEAF id:ire-2 country:"Ireland" athlete:"Bob" score:5
            │ ├── LEAF id:ire-1 country:"Ireland" athlete:"Alice" score:10
            │ ├── LEAF id:ire-shared country:"Ireland" athlete:"Shared" score:25
            │ ├── LEAF id:ire-shared country:"Ireland" athlete:"Shared" score:25
            │ ├── LEAF id:ire-3 country:"Ireland" athlete:"Charlie" score:30
            │ └── LEAF id:ire-4 country:"Ireland" athlete:"Diana" score:40
            ├─┬ LEAF_GROUP id:row-group-country-Spain ag-Grid-AutoColumn:"Spain"
            │ ├── LEAF id:esp-1 country:"Spain" athlete:"Carlos" score:15
            │ ├── LEAF id:esp-shared country:"Spain" athlete:"Shared" score:27
            │ ├── LEAF id:esp-shared country:"Spain" athlete:"Shared" score:27
            │ ├── LEAF id:esp-2 country:"Spain" athlete:"Diego" score:35
            │ ├── LEAF id:esp-3 country:"Spain" athlete:"Elena" score:45
            │ ├── LEAF id:esp-4 country:"Spain" athlete:"Fernando" score:55
            │ └── LEAF id:esp-5 country:"Spain" athlete:"Zara" score:70
            ├─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France"
            │ ├── LEAF id:fra-1 country:"France" athlete:"François" score:12
            │ ├── LEAF id:fra-2 country:"France" athlete:"Émilie" score:22
            │ ├── LEAF id:fra-3 country:"France" athlete:"Gabriel" score:32
            │ ├── LEAF id:fra-4 country:"France" athlete:"Hélène" score:42
            │ ├── LEAF id:fra-5 country:"France" athlete:"Isabelle" score:52
            │ └── LEAF id:fra-6 country:"France" athlete:"Jacques" score:62
            ├─┬ LEAF_GROUP id:row-group-country-Germany ag-Grid-AutoColumn:"Germany"
            │ ├── LEAF id:ger-1 country:"Germany" athlete:"Greta" score:18
            │ ├── LEAF id:ger-2 country:"Germany" athlete:"Hans" score:28
            │ ├── LEAF id:ger-3 country:"Germany" athlete:"Ingrid" score:38
            │ ├── LEAF id:ger-4 country:"Germany" athlete:"Jürgen" score:48
            │ ├── LEAF id:ger-5 country:"Germany" athlete:"Klaus" score:58
            │ └── LEAF id:ger-6 country:"Germany" athlete:"Lars" score:68
            └─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            · ├── LEAF id:ita-1 country:"Italy" athlete:"Isabella" score:14
            · ├── LEAF id:ita-2 country:"Italy" athlete:"Leonardo" score:24
            · ├── LEAF id:ita-3 country:"Italy" athlete:"Marco" score:34
            · ├── LEAF id:ita-4 country:"Italy" athlete:"Natalia" score:44
            · ├── LEAF id:ita-5 country:"Italy" athlete:"Olivia" score:54
            · └── LEAF id:ita-6 country:"Italy" athlete:"Paolo" score:64
        `);

        consoleWarnSpy.mockRestore();
    });
});
