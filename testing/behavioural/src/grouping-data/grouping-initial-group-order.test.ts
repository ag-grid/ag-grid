import type { InitialGroupOrderComparatorParams } from 'ag-grid-community';
import { ClientSideRowModelModule } from 'ag-grid-community';
import { RowGroupingModule } from 'ag-grid-enterprise';

import type { GridRowsOptions } from '../test-utils';
import { GridRows, TestGridsManager, cachedJSONObjects } from '../test-utils';

describe('ag-grid initialGroupOrderComparator', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, RowGroupingModule],
    });

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
        cachedJSONObjects.clear();
    });

    const makeComparator =
        (state: { called: boolean }, order: string[]) => (params: InitialGroupOrderComparatorParams) => {
            state.called = true;
            expect(params.api).toBeDefined();
            expect('context' in params).toBeTruthy();
            return order.indexOf(params.nodeA.key || '') - order.indexOf(params.nodeB.key || '');
        };

    const getSampleData = () =>
        cachedJSONObjects.array([
            { id: '1', country: 'Ireland', sport: 'Soccer', athlete: 'John' },
            { id: '2', country: 'Ireland', sport: 'Tennis', athlete: 'Jane' },
            { id: '3', country: 'Italy', sport: 'Tennis', athlete: 'Mario' },
            { id: '4', country: 'Italy', sport: 'Soccer', athlete: 'Luigi' },
            { id: '5', country: 'Germany', sport: 'Soccer', athlete: 'Albert' },
            { id: '6', country: 'Germany', sport: 'Tennis', athlete: 'Heidi' },
        ]);

    const gridRowsOptions: GridRowsOptions = {
        columns: ['athlete', 'country'],
    };

    const gridRowsOptionsTwoLevel: GridRowsOptions = {
        columns: ['athlete', 'country', 'sport'],
    };

    // Two-level grouping tests (country -> sport)
    test('two-level: load from scratch without ids', async () => {
        const state = { called: false };
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'sport', rowGroup: true, hide: true },
                { field: 'athlete' },
            ],
            autoGroupColumnDef: { headerName: 'Country' },
            animateRows: false,
            groupDefaultExpanded: -1,
            initialGroupOrderComparator: makeComparator(state, ['Germany', 'Italy', 'Ireland']),
            rowData: getSampleData(),
        });

        expect(state.called).toBe(true);

        await new GridRows(api, 'two-level initial no ids', gridRowsOptionsTwoLevel).check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-country-Germany
            │ ├─┬ LEAF_GROUP id:row-group-country-Germany-sport-Soccer
            │ │ └── LEAF id:4 country:"Germany" sport:"Soccer" athlete:"Albert"
            │ └─┬ LEAF_GROUP id:row-group-country-Germany-sport-Tennis
            │ · └── LEAF id:5 country:"Germany" sport:"Tennis" athlete:"Heidi"
            ├─┬ filler id:row-group-country-Italy
            │ ├─┬ LEAF_GROUP id:row-group-country-Italy-sport-Tennis
            │ │ └── LEAF id:2 country:"Italy" sport:"Tennis" athlete:"Mario"
            │ └─┬ LEAF_GROUP id:row-group-country-Italy-sport-Soccer
            │ · └── LEAF id:3 country:"Italy" sport:"Soccer" athlete:"Luigi"
            └─┬ filler id:row-group-country-Ireland
            · ├─┬ LEAF_GROUP id:row-group-country-Ireland-sport-Soccer
            · │ └── LEAF id:0 country:"Ireland" sport:"Soccer" athlete:"John"
            · └─┬ LEAF_GROUP id:row-group-country-Ireland-sport-Tennis
            · · └── LEAF id:1 country:"Ireland" sport:"Tennis" athlete:"Jane"
        `);
    });

    test('two-level: load from scratch with ids', async () => {
        const state = { called: false };
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'sport', rowGroup: true, hide: true },
                { field: 'athlete' },
            ],
            autoGroupColumnDef: { headerName: 'Country' },
            animateRows: false,
            groupDefaultExpanded: -1,
            initialGroupOrderComparator: makeComparator(state, ['Germany', 'Italy', 'Ireland']),
            rowData: getSampleData(),
            getRowId: (params) => params.data.id,
        });

        expect(state.called).toBe(true);

        await new GridRows(api, 'two-level initial with ids', gridRowsOptionsTwoLevel).check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-country-Germany
            │ ├─┬ LEAF_GROUP id:row-group-country-Germany-sport-Soccer
            │ │ └── LEAF id:5 country:"Germany" sport:"Soccer" athlete:"Albert"
            │ └─┬ LEAF_GROUP id:row-group-country-Germany-sport-Tennis
            │ · └── LEAF id:6 country:"Germany" sport:"Tennis" athlete:"Heidi"
            ├─┬ filler id:row-group-country-Italy
            │ ├─┬ LEAF_GROUP id:row-group-country-Italy-sport-Tennis
            │ │ └── LEAF id:3 country:"Italy" sport:"Tennis" athlete:"Mario"
            │ └─┬ LEAF_GROUP id:row-group-country-Italy-sport-Soccer
            │ · └── LEAF id:4 country:"Italy" sport:"Soccer" athlete:"Luigi"
            └─┬ filler id:row-group-country-Ireland
            · ├─┬ LEAF_GROUP id:row-group-country-Ireland-sport-Soccer
            · │ └── LEAF id:1 country:"Ireland" sport:"Soccer" athlete:"John"
            · └─┬ LEAF_GROUP id:row-group-country-Ireland-sport-Tennis
            · · └── LEAF id:2 country:"Ireland" sport:"Tennis" athlete:"Jane"
        `);

        state.called = false;
        api.setGridOption('initialGroupOrderComparator', makeComparator(state, ['Italy', 'Germany', 'Ireland']));
        api.refreshClientSideRowModel();

        expect(state.called).toBe(true);

        await new GridRows(api, 'two-level initial with ids', gridRowsOptionsTwoLevel).check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-country-Italy
            │ ├─┬ LEAF_GROUP id:row-group-country-Italy-sport-Tennis
            │ │ └── LEAF id:3 country:"Italy" sport:"Tennis" athlete:"Mario"
            │ └─┬ LEAF_GROUP id:row-group-country-Italy-sport-Soccer
            │ · └── LEAF id:4 country:"Italy" sport:"Soccer" athlete:"Luigi"
            ├─┬ filler id:row-group-country-Germany
            │ ├─┬ LEAF_GROUP id:row-group-country-Germany-sport-Soccer
            │ │ └── LEAF id:5 country:"Germany" sport:"Soccer" athlete:"Albert"
            │ └─┬ LEAF_GROUP id:row-group-country-Germany-sport-Tennis
            │ · └── LEAF id:6 country:"Germany" sport:"Tennis" athlete:"Heidi"
            └─┬ filler id:row-group-country-Ireland
            · ├─┬ LEAF_GROUP id:row-group-country-Ireland-sport-Soccer
            · │ └── LEAF id:1 country:"Ireland" sport:"Soccer" athlete:"John"
            · └─┬ LEAF_GROUP id:row-group-country-Ireland-sport-Tennis
            · · └── LEAF id:2 country:"Ireland" sport:"Tennis" athlete:"Jane"
        `);
    });

    test('load from scratch without ids', async () => {
        const state = { called: false };
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'country', rowGroup: true, hide: true }, { field: 'athlete' }],
            autoGroupColumnDef: { headerName: 'Country' },
            animateRows: false,
            groupDefaultExpanded: -1,
            initialGroupOrderComparator: makeComparator(state, ['Germany', 'Italy', 'Ireland']),
            rowData: getSampleData(),
        });

        expect(state.called).toBe(true);

        await new GridRows(api, 'initial no ids', gridRowsOptions).check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Germany
            │ ├── LEAF id:4 country:"Germany" athlete:"Albert"
            │ └── LEAF id:5 country:"Germany" athlete:"Heidi"
            ├─┬ LEAF_GROUP id:row-group-country-Italy
            │ ├── LEAF id:2 country:"Italy" athlete:"Mario"
            │ └── LEAF id:3 country:"Italy" athlete:"Luigi"
            └─┬ LEAF_GROUP id:row-group-country-Ireland
            · ├── LEAF id:0 country:"Ireland" athlete:"John"
            · └── LEAF id:1 country:"Ireland" athlete:"Jane"
        `);
    });

    test('load from scratch with ids', async () => {
        const state = { called: false };
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'country', rowGroup: true, hide: true }, { field: 'athlete' }],
            autoGroupColumnDef: { headerName: 'Country' },
            animateRows: false,
            groupDefaultExpanded: -1,
            initialGroupOrderComparator: makeComparator(state, ['Germany', 'Italy', 'Ireland']),
            rowData: getSampleData(),
            getRowId: (params) => params.data.id,
        });

        expect(state.called).toBe(true);

        await new GridRows(api, 'initial with ids', gridRowsOptions).check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Germany
            │ ├── LEAF id:5 country:"Germany" athlete:"Albert"
            │ └── LEAF id:6 country:"Germany" athlete:"Heidi"
            ├─┬ LEAF_GROUP id:row-group-country-Italy
            │ ├── LEAF id:3 country:"Italy" athlete:"Mario"
            │ └── LEAF id:4 country:"Italy" athlete:"Luigi"
            └─┬ LEAF_GROUP id:row-group-country-Ireland
            · ├── LEAF id:1 country:"Ireland" athlete:"John"
            · └── LEAF id:2 country:"Ireland" athlete:"Jane"
        `);

        state.called = false;
        api.setGridOption('initialGroupOrderComparator', makeComparator(state, ['Italy', 'Germany', 'Ireland']));
        api.refreshClientSideRowModel();

        expect(state.called).toBe(true);

        await new GridRows(api, 'initial with ids', gridRowsOptions).check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Italy
            │ ├── LEAF id:3 country:"Italy" athlete:"Mario"
            │ └── LEAF id:4 country:"Italy" athlete:"Luigi"
            ├─┬ LEAF_GROUP id:row-group-country-Germany
            │ ├── LEAF id:5 country:"Germany" athlete:"Albert"
            │ └── LEAF id:6 country:"Germany" athlete:"Heidi"
            └─┬ LEAF_GROUP id:row-group-country-Ireland
            · ├── LEAF id:1 country:"Ireland" athlete:"John"
            · └── LEAF id:2 country:"Ireland" athlete:"Jane"
        `);
    });

    test('rowData update with ids maintains comparator order', async () => {
        const state = { called: false };
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'country', rowGroup: true, hide: true }, { field: 'athlete' }],
            autoGroupColumnDef: { headerName: 'Country' },
            animateRows: false,
            groupDefaultExpanded: -1,
            initialGroupOrderComparator: makeComparator(state, ['Germany', 'Spain', 'Italy', 'Ireland']),
            rowData: [],
            getRowId: (params) => params.data.id,
        });

        api.setGridOption('rowData', getSampleData());

        expect(state.called).toBe(true);

        await new GridRows(api, 'setRowData with ids', gridRowsOptions).check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Germany
            │ ├── LEAF id:5 country:"Germany" athlete:"Albert"
            │ └── LEAF id:6 country:"Germany" athlete:"Heidi"
            ├─┬ LEAF_GROUP id:row-group-country-Italy
            │ ├── LEAF id:3 country:"Italy" athlete:"Mario"
            │ └── LEAF id:4 country:"Italy" athlete:"Luigi"
            └─┬ LEAF_GROUP id:row-group-country-Ireland
            · ├── LEAF id:1 country:"Ireland" athlete:"John"
            · └── LEAF id:2 country:"Ireland" athlete:"Jane"
        `);

        state.called = false;
        api.setGridOption(
            'rowData',
            cachedJSONObjects.array([
                { id: '1', country: 'Italy', athlete: 'John' },
                { id: '4', country: 'Germany', athlete: 'Luigi' },
                { id: '6', country: 'Germany', athlete: 'Heidi' },
                { id: '3', country: 'Germany', athlete: 'Mario' },
                { id: '2', country: 'Spain', athlete: 'Jane' },
                { id: '5', country: 'Germany', athlete: 'Albert' },
                { id: '7', country: 'Spain', athlete: 'Jose' },
            ])
        );

        expect(state.called).toBe(true);

        await new GridRows(api, 'setRowData with ids', gridRowsOptions).check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Germany
            │ ├── LEAF id:4 country:"Germany" athlete:"Luigi"
            │ ├── LEAF id:6 country:"Germany" athlete:"Heidi"
            │ ├── LEAF id:3 country:"Germany" athlete:"Mario"
            │ └── LEAF id:5 country:"Germany" athlete:"Albert"
            ├─┬ LEAF_GROUP id:row-group-country-Spain
            │ ├── LEAF id:2 country:"Spain" athlete:"Jane"
            │ └── LEAF id:7 country:"Spain" athlete:"Jose"
            └─┬ LEAF_GROUP id:row-group-country-Italy
            · └── LEAF id:1 country:"Italy" athlete:"John"
        `);
    });

    test('transactions with ids respect initialGroupOrderComparator', async () => {
        const state = { called: false };
        const api = gridsManager.createGrid('myGrid', {
            columnDefs: [{ field: 'country', rowGroup: true, hide: true }, { field: 'athlete' }],
            autoGroupColumnDef: { headerName: 'Country' },
            animateRows: false,
            groupDefaultExpanded: -1,
            initialGroupOrderComparator: makeComparator(state, ['Germany', 'Spain', 'Italy', 'Ireland']),
            rowData: getSampleData().slice(0, 2),
            getRowId: (params) => params.data.id,
        });

        expect(state.called).toBe(false); // Only one group

        await new GridRows(api, 'transactions with ids (with update)', gridRowsOptions).check(`
            ROOT id:ROOT_NODE_ID
            └─┬ LEAF_GROUP id:row-group-country-Ireland
            · ├── LEAF id:1 country:"Ireland" athlete:"John"
            · └── LEAF id:2 country:"Ireland" athlete:"Jane"
        `);

        api.applyTransaction({
            add: getSampleData().slice(2),
            update: [{ id: '1', country: 'Spain', athlete: 'Alberto' }],
        });

        expect(state.called).toBe(true);

        await new GridRows(api, 'transactions with ids (with update)', gridRowsOptions).check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Germany
            │ ├── LEAF id:5 country:"Germany" athlete:"Albert"
            │ └── LEAF id:6 country:"Germany" athlete:"Heidi"
            ├─┬ LEAF_GROUP id:row-group-country-Spain
            │ └── LEAF id:1 country:"Spain" athlete:"Alberto"
            ├─┬ LEAF_GROUP id:row-group-country-Italy
            │ ├── LEAF id:3 country:"Italy" athlete:"Mario"
            │ └── LEAF id:4 country:"Italy" athlete:"Luigi"
            └─┬ LEAF_GROUP id:row-group-country-Ireland
            · └── LEAF id:2 country:"Ireland" athlete:"Jane"
        `);
    });
});
