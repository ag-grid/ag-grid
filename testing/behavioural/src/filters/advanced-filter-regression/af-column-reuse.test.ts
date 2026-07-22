import type { GridApi, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, DateFilterModule, NumberFilterModule, setupAgTestIds } from 'ag-grid-community';
import { SetFilterModule } from 'ag-grid-enterprise';

import {
    ColumnFilterHarness,
    FilterDom,
    GridRows,
    TestGridsManager,
    asyncSetTimeout,
    installFilterLayoutMock,
    uninstallFilterLayoutMock,
} from '../../test-utils';

/**
 * Regression baseline for the column-filter behaviours Advanced Filter will reuse: the built-in
 * In Range / Between (2-input) option (AG-10029 / AG-10819) — bound exclusivity, two-input model,
 * incomplete/reversed validation — and the Set Filter (AG-8950) — distinct-value derivation, value
 * formatting, blanks, mini-filter, select-all and the `{filterType:'set'}` model. Black-box via popup.
 */
describe('Simple Filter — In Range (2-input) reuse surface', () => {
    const gridsManager = new TestGridsManager({
        modules: [NumberFilterModule, DateFilterModule, ClientSideRowModelModule],
    });

    beforeAll(() => {
        setupAgTestIds();
        installFilterLayoutMock();
    });
    afterAll(() => uninstallFilterLayoutMock());
    afterEach(() => gridsManager.reset());

    test('number inRange is exclusive of both bounds by default and yields a two-input model', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'age', filter: 'agNumberColumnFilter', filterParams: { debounceMs: 0 } }],
            rowData: [{ age: 15 }, { age: 20 }, { age: 25 }, { age: 35 }, { age: 40 }],
        });

        const filter = await ColumnFilterHarness.open(api, 'age');
        await filter.selectOperator('Between');
        await filter.setNumber(20, 0);
        await filter.setNumber(35, 1);
        await asyncSetTimeout(0);

        await new FilterDom(api, 'number inRange panel', { colId: 'age' }).checkFilterDom(`
            COLUMN FILTER
            operator: "Between"
            input [0]: "20"
            input [1]: "35"
            AND
            operator: "Equals"
            input: ""
            model:
              filterType: "number"
              type: "inRange"
              filter: 20
              filterTo: 35
        `);
        await new GridRows(api, 'number inRange rows').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:2 age:25
        `);
    });

    test('number inRange with only the lower bound does not filter (incomplete range)', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'age', filter: 'agNumberColumnFilter', filterParams: { debounceMs: 0 } }],
            rowData: [{ age: 15 }, { age: 25 }, { age: 40 }],
        });

        const filter = await ColumnFilterHarness.open(api, 'age');
        await filter.selectOperator('Between');
        await filter.setNumber(20, 0);
        await asyncSetTimeout(0);

        await new FilterDom(api, 'number inRange incomplete', { colId: 'age' }).checkFilterDom(`
            COLUMN FILTER
            operator: "Between"
            input [0]: "20"
            input [1]: ""
            model: null
        `);
        await new GridRows(api, 'number inRange incomplete rows').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 age:15
            ├── LEAF id:1 age:25
            └── LEAF id:2 age:40
        `);
    });

    test('number inRange with reversed bounds (from > to)', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'age', filter: 'agNumberColumnFilter', filterParams: { debounceMs: 0 } }],
            rowData: [{ age: 15 }, { age: 25 }, { age: 40 }],
        });

        const filter = await ColumnFilterHarness.open(api, 'age');
        await filter.selectOperator('Between');
        await filter.setNumber(35, 0);
        await filter.setNumber(20, 1);
        await asyncSetTimeout(0);

        await new FilterDom(api, 'number inRange reversed', { colId: 'age' }).checkFilterDom(`
            COLUMN FILTER
            operator: "Between"
            input [0]: "35"
            input [1]: "20"
            model: null
        `);
        await new GridRows(api, 'number inRange reversed rows').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 age:15
            ├── LEAF id:1 age:25
            └── LEAF id:2 age:40
        `);
    });

    test('date inRange (Between) filters between two dates with a two-input model', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'date', filter: 'agDateColumnFilter', filterParams: { debounceMs: 0 } }],
            rowData: [
                { date: '2024-01-01' },
                { date: '2024-03-15' },
                { date: '2024-05-01' },
                { date: '2024-06-30' },
                { date: '2024-09-01' },
            ],
        });

        const filter = await ColumnFilterHarness.open(api, 'date');
        await filter.selectOperator('Between');
        await filter.setDate('2024-03-15', 0);
        await filter.setDate('2024-06-30', 1);
        await asyncSetTimeout(0);

        // Exclusive of both bounds: only 2024-05-01 (strictly inside) passes.
        await new FilterDom(api, 'date inRange panel', { colId: 'date' }).checkFilterDom(`
            COLUMN FILTER
            operator: "Between"
            input [0]: "2024-03-15"
            input [1]: "2024-06-30"
            AND
            operator: "Equals"
            input: ""
            model:
              dateFrom: "2024-03-15"
              dateTo: "2024-06-30"
              filterType: "date"
              type: "inRange"
        `);
        await new GridRows(api, 'date inRange rows').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:2 date:"2024-05-01"
        `);
    });
});

describe('Set Filter — reuse surface', () => {
    const gridsManager = new TestGridsManager({
        modules: [SetFilterModule, ClientSideRowModelModule],
    });

    beforeAll(() => {
        setupAgTestIds();
        installFilterLayoutMock();
    });
    afterAll(() => uninstallFilterLayoutMock());
    afterEach(() => gridsManager.reset());

    test('derives distinct values from grid data (sorted) and applying a subset filters rows', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'country', filter: 'agSetColumnFilter' }],
            rowData: [{ country: 'Italy' }, { country: 'Australia' }, { country: 'Italy' }, { country: 'France' }],
        });

        const filter = await ColumnFilterHarness.open(api, 'country');
        expect(filter.setFilterItemLabels()).toEqual(['(Select All)', 'Australia', 'France', 'Italy']);

        // Keep only Australia
        await filter.toggleSetItem('Italy');
        await filter.toggleSetItem('France');
        await asyncSetTimeout(0);

        await new FilterDom(api, 'grid-values set filter', { colId: 'country' }).checkFilterDom(`
            COLUMN FILTER (set)
            mini-filter: ""
            ▪ (Select All)
            ☑ Australia
            ☐ France
            ☐ Italy
            model:
              values:
                - "Australia"
              filterType: "set"
        `);
        await new GridRows(api, 'grid-values set filter rows').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:1 country:"Australia"
        `);
    });

    test('valueFormatter shows formatted labels but the model keeps underlying keys', async () => {
        const NAMES: Record<string, string> = { AU: 'Australia', IT: 'Italy', FR: 'France' };
        const options: GridOptions = {
            columnDefs: [
                {
                    field: 'country',
                    filter: 'agSetColumnFilter',
                    filterParams: { valueFormatter: (p: any) => NAMES[p.value] ?? p.value },
                },
            ],
            rowData: [{ country: 'IT' }, { country: 'AU' }, { country: 'IT' }, { country: 'FR' }],
        };
        const api: GridApi = await gridsManager.createGridAndWait('grid1', options);

        const filter = await ColumnFilterHarness.open(api, 'country');
        // Labels are the formatted names, sorted by formatted value
        expect(filter.setFilterItemLabels()).toEqual(['(Select All)', 'Australia', 'France', 'Italy']);

        // Select only "Italy" (formatted label) → model must carry the underlying key "IT"
        await filter.toggleSetItem('Australia');
        await filter.toggleSetItem('France');
        await asyncSetTimeout(0);

        await new FilterDom(api, 'valueFormatter set filter', { colId: 'country' }).checkFilterDom(`
            COLUMN FILTER (set)
            mini-filter: ""
            ▪ (Select All)
            ☐ Australia
            ☐ France
            ☑ Italy
            model:
              values:
                - "IT"
              filterType: "set"
        `);
        await new GridRows(api, 'valueFormatter set filter rows').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 country:"IT"
            └── LEAF id:2 country:"IT"
        `);
    });

    test('provided values list shows values not present in the data', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'country',
                    filter: 'agSetColumnFilter',
                    filterParams: { values: ['Australia', 'France', 'Germany', 'Italy'] },
                },
            ],
            rowData: [{ country: 'Italy' }, { country: 'Australia' }],
        });

        const filter = await ColumnFilterHarness.open(api, 'country');
        // Germany/France appear even though only Italy/Australia exist in the data
        expect(filter.setFilterItemLabels()).toEqual(['(Select All)', 'Australia', 'France', 'Germany', 'Italy']);
        await new FilterDom(api, 'provided values set filter', { colId: 'country' }).checkFilterDom(`
            COLUMN FILTER (set)
            mini-filter: ""
            ☑ (Select All)
            ☑ Australia
            ☑ France
            ☑ Germany
            ☑ Italy
            model: null
        `);
    });

    test('null values render as (Blanks) and can be filtered', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'country', filter: 'agSetColumnFilter' }],
            rowData: [{ country: 'Italy' }, { country: null }, { country: 'Australia' }, { country: null }],
        });

        const filter = await ColumnFilterHarness.open(api, 'country');
        await new FilterDom(api, 'blanks set filter labels', { colId: 'country' }).checkFilterDom(`
            COLUMN FILTER (set)
            mini-filter: ""
            ☑ (Select All)
            ☑ (Blanks)
            ☑ Australia
            ☑ Italy
            model: null
        `);

        // Keep only the blanks
        await filter.toggleSetItem('Australia');
        await filter.toggleSetItem('Italy');
        await asyncSetTimeout(0);
        await new GridRows(api, 'blanks set filter rows').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:1 country:null
            └── LEAF id:3 country:null
        `);
    });

    test('mini-filter search narrows the displayed items', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'country', filter: 'agSetColumnFilter' }],
            rowData: [{ country: 'Australia' }, { country: 'Austria' }, { country: 'Italy' }, { country: 'France' }],
        });

        const filter = await ColumnFilterHarness.open(api, 'country');
        await filter.miniFilterSearch('Aus');
        await asyncSetTimeout(0);
        await new FilterDom(api, 'mini-filter set filter', { colId: 'country' }).checkFilterDom(`
            COLUMN FILTER (set)
            mini-filter: "Aus"
            ☑ (Select All)
            ☑ Australia
            ☑ Austria
            model: null
        `);
    });

    test('select-all toggles every item', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'country', filter: 'agSetColumnFilter' }],
            rowData: [{ country: 'Italy' }, { country: 'Australia' }, { country: 'France' }],
        });

        const filter = await ColumnFilterHarness.open(api, 'country');
        // Deselect all via (Select All)
        await filter.toggleSetItem('(Select All)');
        await asyncSetTimeout(0);
        await new FilterDom(api, 'select-all cleared', { colId: 'country' }).checkFilterDom(`
            COLUMN FILTER (set)
            mini-filter: ""
            ☐ (Select All)
            ☐ Australia
            ☐ France
            ☐ Italy
            model:
              values: []
              filterType: "set"
        `);
        // Nothing selected ⇒ no rows pass.
        await new GridRows(api, 'select-all cleared rows').check('empty');
    });
});
