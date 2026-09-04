import {
    AdvancedFilterHarness,
    FilterDom,
    GridRows,
    TestGridsManager,
    asyncSetTimeout,
    installFilterLayoutMock,
    uninstallFilterLayoutMock,
} from 'ag-test-utils';

import type { GridOptions, IServerSideGetRowsParams, IServerSideGetRowsRequest } from 'ag-grid-community';
import { ServerSideRowModelModule } from 'ag-grid-enterprise';

import {
    DEFAULT_OPTIONS,
    ROW_DATA,
    SET_MODULES,
    SET_OPTIONS,
    TEXT_OPTIONS,
    displayedAthletes,
} from './advancedFilterSetFixture';

describe('Advanced Filter - Set Filter columns', () => {
    const gridsManager = new TestGridsManager({ modules: SET_MODULES });

    beforeAll(() => installFilterLayoutMock());
    afterAll(() => uninstallFilterLayoutMock());
    afterEach(() => gridsManager.reset());

    test('is any of filters to the listed values', async () => {
        const api = await gridsManager.createGridAndWait('grid1', DEFAULT_OPTIONS);
        const af = AdvancedFilterHarness.get(api);

        await af.applyExpression('[Country] is any of ["Jamaica", "Poland"]');

        await new FilterDom(api, 'is any of').checkFilterDom(`
            ADVANCED FILTER
            input: "[Country] is any of ["Jamaica", "Poland"]"
            valid: true
            buttons: Apply ⊘ | Builder
            model:
              filterType: "set"
              colId: "country"
              type: "isAnyOf"
              values:
                - "Jamaica"
                - "Poland"
        `);
        await new GridRows(api, 'is any of rows').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:2 athlete:"Usain Bolt" country:"Jamaica" age:25
            └── LEAF id:3 athlete:"Anna Kowalski" country:"Poland" age:19
        `);
    });

    test('is none of excludes the listed values', async () => {
        const api = await gridsManager.createGridAndWait('grid1', DEFAULT_OPTIONS);
        const af = AdvancedFilterHarness.get(api);

        await af.applyExpression('[Country] is none of ["Jamaica", "Poland"]');

        await new FilterDom(api, 'is none of').checkFilterDom(`
            ADVANCED FILTER
            input: "[Country] is none of ["Jamaica", "Poland"]"
            valid: true
            buttons: Apply ⊘ | Builder
            model:
              filterType: "set"
              colId: "country"
              type: "isNoneOf"
              values:
                - "Jamaica"
                - "Poland"
        `);
        await new GridRows(api, 'is none of rows').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 athlete:"Michael Phelps" country:"United States" age:23
            ├── LEAF id:1 athlete:"Emma Thompson" country:"United Kingdom" age:30
            └── LEAF id:4 athlete:"Li Wei" country:null age:28
        `);
    });

    test('a model is written as an expression and read back unchanged', async () => {
        const api = await gridsManager.createGridAndWait('grid1', DEFAULT_OPTIONS);

        api.setAdvancedFilterModel({
            filterType: 'set',
            colId: 'country',
            type: 'isAnyOf',
            values: ['Jamaica', 'Poland'],
        });

        await new FilterDom(api, 'model round trip').checkFilterDom(`
            ADVANCED FILTER
            input: "[Country] is any of ["Jamaica", "Poland"]"
            valid: true
            buttons: Apply ⊘ | Builder
            model:
              filterType: "set"
              colId: "country"
              type: "isAnyOf"
              values:
                - "Jamaica"
                - "Poland"
        `);
    });

    test('a Set Filter column offers the set options alongside its data type options', async () => {
        const api = await gridsManager.createGridAndWait('grid1', DEFAULT_OPTIONS);
        const af = AdvancedFilterHarness.get(api);

        await af.type('[Country] ');

        expect(af.autocompleteEntries()).toEqual([...TEXT_OPTIONS, ...SET_OPTIONS]);
    });

    test('a column without a Set Filter offers neither set option', async () => {
        const api = await gridsManager.createGridAndWait('grid1', DEFAULT_OPTIONS);
        const af = AdvancedFilterHarness.get(api);

        await af.type('[Athlete] ');

        // The whole list, so an autocomplete that failed to open cannot pass as "neither option offered".
        expect(af.autocompleteEntries()).toEqual(TEXT_OPTIONS);
    });

    test('blanks are offered and filter the rows with no value', async () => {
        const api = await gridsManager.createGridAndWait('grid1', DEFAULT_OPTIONS);
        const af = AdvancedFilterHarness.get(api);

        await af.type('[Country] is any of [');
        expect(af.autocompleteEntries()).toContain('(Blanks)');

        await af.applyExpression('[Country] is any of ["(Blanks)"]');

        await new FilterDom(api, 'blanks').checkFilterDom(`
            ADVANCED FILTER
            input: "[Country] is any of ["(Blanks)"]"
            valid: true
            buttons: Apply ⊘ | Builder
            model:
              filterType: "set"
              colId: "country"
              type: "isAnyOf"
              values:
                - null
        `);
        await new GridRows(api, 'blanks rows').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:4 athlete:"Li Wei" country:null age:28
        `);
    });

    test('a set condition joins with the other options', async () => {
        const api = await gridsManager.createGridAndWait('grid1', DEFAULT_OPTIONS);
        const af = AdvancedFilterHarness.get(api);

        await af.applyExpression('[Country] is any of ["Jamaica", "Poland"] AND [Age] > 20');

        await new FilterDom(api, 'joined').checkFilterDom(`
            ADVANCED FILTER
            input: "[Country] is any of ["Jamaica", "Poland"] AND [Age] > 20"
            valid: true
            buttons: Apply ⊘ | Builder
            model:
              filterType: "join"
              type: "AND"
              conditions:
                - filterType: "set"
                  colId: "country"
                  type: "isAnyOf"
                  values:
                    - "Jamaica"
                    - "Poland"
                - filterType: "number"
                  colId: "age"
                  type: "greaterThan"
                  filter: 20
        `);
        await new GridRows(api, 'joined rows').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:2 athlete:"Usain Bolt" country:"Jamaica" age:25
        `);
    });

    test('two set conditions on the same column narrow each other', async () => {
        const api = await gridsManager.createGridAndWait('grid1', DEFAULT_OPTIONS);
        const af = AdvancedFilterHarness.get(api);

        await af.applyExpression(
            '[Country] is any of ["Jamaica", "Poland", "United States"] AND [Country] is none of ["Poland"]'
        );

        await new FilterDom(api, 'two set conditions').checkFilterDom(`
            ADVANCED FILTER
            input: "[Country] is any of ["Jamaica", "Poland", "United States"] AND [Country] is none of ["Poland"]"
            valid: true
            buttons: Apply ⊘ | Builder
            model:
              filterType: "join"
              type: "AND"
              conditions:
                - filterType: "set"
                  colId: "country"
                  type: "isAnyOf"
                  values:
                    - "Jamaica"
                    - "Poland"
                    - "United States"
                - filterType: "set"
                  colId: "country"
                  type: "isNoneOf"
                  values:
                    - "Poland"
        `);
        await new GridRows(api, 'two set conditions rows').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 athlete:"Michael Phelps" country:"United States" age:23
            └── LEAF id:2 athlete:"Usain Bolt" country:"Jamaica" age:25
        `);
    });

    test('is none of blanks keeps only the rows that hold a value', async () => {
        const api = await gridsManager.createGridAndWait('grid1', DEFAULT_OPTIONS);
        const af = AdvancedFilterHarness.get(api);

        await af.applyExpression('[Country] is none of ["(Blanks)"]');

        await new GridRows(api, 'is none of blanks').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 athlete:"Michael Phelps" country:"United States" age:23
            ├── LEAF id:1 athlete:"Emma Thompson" country:"United Kingdom" age:30
            ├── LEAF id:2 athlete:"Usain Bolt" country:"Jamaica" age:25
            └── LEAF id:3 athlete:"Anna Kowalski" country:"Poland" age:19
        `);
    });

    test('deleting the expression clears the filter', async () => {
        const api = await gridsManager.createGridAndWait('grid1', DEFAULT_OPTIONS);
        const af = AdvancedFilterHarness.get(api);

        await af.applyExpression('[Country] is any of ["Jamaica"]');
        await af.applyExpression('');

        expect(api.getAdvancedFilterModel()).toBeNull();
        await new GridRows(api, 'cleared expression').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 athlete:"Michael Phelps" country:"United States" age:23
            ├── LEAF id:1 athlete:"Emma Thompson" country:"United Kingdom" age:30
            ├── LEAF id:2 athlete:"Usain Bolt" country:"Jamaica" age:25
            ├── LEAF id:3 athlete:"Anna Kowalski" country:"Poland" age:19
            └── LEAF id:4 athlete:"Li Wei" country:null age:28
        `);
    });

    test('an expression is unchanged by row data it no longer matches', async () => {
        const api = await gridsManager.createGridAndWait('grid1', DEFAULT_OPTIONS);
        const af = AdvancedFilterHarness.get(api);

        await af.applyExpression('[Country] is any of ["Jamaica", "Poland"]');
        api.setGridOption(
            'rowData',
            ROW_DATA.filter(({ country }) => country !== 'Poland')
        );
        await asyncSetTimeout(0);

        await new FilterDom(api, 'after row data change').checkFilterDom(`
            ADVANCED FILTER
            input: "[Country] is any of ["Jamaica", "Poland"]"
            valid: true
            buttons: Apply ⊘ | Builder
            model:
              filterType: "set"
              colId: "country"
              type: "isAnyOf"
              values:
                - "Jamaica"
                - "Poland"
        `);
        await new GridRows(api, 'after row data change rows').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:2 athlete:"Usain Bolt" country:"Jamaica" age:25
        `);
    });
});

// The keys-and-blanks parity cases live in `advanced-filter-column-filter-parity.test.ts`, which owns the
// comparison. Only what needs row data that suite's fixed rows cannot express stays here.
describe('Advanced Filter - parity with the Set Filter on array cells', () => {
    const gridsManager = new TestGridsManager({ modules: SET_MODULES });

    beforeAll(() => installFilterLayoutMock());
    afterAll(() => uninstallFilterLayoutMock());
    afterEach(() => gridsManager.reset());

    /** Rows left by selecting `keys` in the column's own Set Filter. */
    async function rowsFromSetFilter(options: GridOptions, keys: (string | null)[]): Promise<string[]> {
        const api = await gridsManager.createGridAndWait('setGrid', options);
        await api.setColumnFilterModel('country', { filterType: 'set', values: keys });
        api.onFilterChanged();
        await asyncSetTimeout(0);
        return displayedAthletes(api);
    }

    /** Rows left by the equivalent Advanced Filter expression. */
    async function rowsFromExpression(options: GridOptions, expression: string): Promise<string[]> {
        const api = await gridsManager.createGridAndWait('advGrid', {
            ...options,
            enableAdvancedFilter: true,
        });
        await AdvancedFilterHarness.get(api).applyExpression(expression);
        return displayedAthletes(api);
    }

    test('an array cell value matches when any of its entries is chosen, as the Set Filter does', async () => {
        const arrayOptions: GridOptions = {
            columnDefs: [
                { field: 'athlete' },
                {
                    field: 'country',
                    filter: 'agSetColumnFilter',
                    // The Set Filter splits an array cell, so the formatter sees one entry at a time.
                    valueFormatter: ({ value }: { value: string | string[] | null }) => String(value ?? ''),
                },
            ],
            rowData: [
                { athlete: 'Dual', country: ['Jamaica', 'Poland'] },
                { athlete: 'Single', country: ['Poland'] },
                { athlete: 'None', country: [] },
            ],
        };

        const viaSetFilter = await rowsFromSetFilter(arrayOptions, ['Jamaica']);
        const viaExpression = await rowsFromExpression(arrayOptions, '[Country] is any of ["Jamaica"]');

        expect(viaExpression).toEqual(viaSetFilter);
        expect(viaExpression).toEqual(['Dual']);
    });
});

describe('Advanced Filter - Set Filter excelMode', () => {
    const gridsManager = new TestGridsManager({ modules: SET_MODULES });

    beforeAll(() => installFilterLayoutMock());
    afterAll(() => uninstallFilterLayoutMock());
    afterEach(() => gridsManager.reset());

    const EXCEL_OPTIONS: GridOptions = {
        ...DEFAULT_OPTIONS,
        columnDefs: [
            { field: 'athlete' },
            { field: 'country', filter: 'agSetColumnFilter', filterParams: { excelMode: 'windows' } },
            { field: 'age' },
        ],
    };

    test('excelMode sinks blanks to the bottom of the value list, as it does in the Set Filter', async () => {
        const api = await gridsManager.createGridAndWait('grid1', EXCEL_OPTIONS);
        const af = AdvancedFilterHarness.get(api);

        await af.type('[Country] is any of [');

        expect(af.autocompleteEntries()).toEqual(['Jamaica', 'Poland', 'United Kingdom', 'United States', '(Blanks)']);
    });

    test('excelMode does not change which rows an expression leaves', async () => {
        const api = await gridsManager.createGridAndWait('grid1', EXCEL_OPTIONS);
        const af = AdvancedFilterHarness.get(api);

        await af.applyExpression('[Country] is any of ["Jamaica", "(Blanks)"]');

        await new GridRows(api, 'excel mode rows').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:2 athlete:"Usain Bolt" country:"Jamaica" age:25
            └── LEAF id:4 athlete:"Li Wei" country:null age:28
        `);
    });
});

describe('Advanced Filter - Set Filter with the server-side row model', () => {
    const gridsManager = new TestGridsManager({ modules: [...SET_MODULES, ServerSideRowModelModule] });

    beforeAll(() => installFilterLayoutMock());
    afterAll(() => uninstallFilterLayoutMock());
    afterEach(() => gridsManager.reset());

    const SERVER_ROWS = [
        { athlete: 'Usain Bolt', country: 'Jamaica' },
        { athlete: 'Anna Kowalski', country: 'Poland' },
    ];

    /** Grid whose rows come from a datasource, recording what each request was asked to filter by. */
    async function createServerSideGrid(requests: IServerSideGetRowsRequest[]) {
        return gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                { field: 'athlete' },
                {
                    field: 'country',
                    filter: 'agSetColumnFilter',
                    // The row values live on the server, so the list has to be declared.
                    filterParams: { values: ['Jamaica', 'Poland'] },
                },
            ],
            rowModelType: 'serverSide',
            serverSideDatasource: {
                getRows: (params: IServerSideGetRowsParams) => {
                    requests.push(params.request);
                    params.success({ rowData: SERVER_ROWS, rowCount: SERVER_ROWS.length });
                },
            },
            enableAdvancedFilter: true,
        } as GridOptions);
    }

    test('the declared values are what the list offers', async () => {
        const api = await createServerSideGrid([]);
        const af = AdvancedFilterHarness.get(api);

        await af.type('[Country] is any of [');

        expect(af.autocompleteEntries()).toEqual(['Jamaica', 'Poland']);
    });

    test('the set model reaches the datasource request, which is what does the filtering', async () => {
        const requests: IServerSideGetRowsRequest[] = [];
        const api = await createServerSideGrid(requests);
        const af = AdvancedFilterHarness.get(api);

        await af.applyExpression('[Country] is any of ["Jamaica"]');
        await asyncSetTimeout(0);

        expect(requests[requests.length - 1].filterModel).toEqual({
            filterType: 'set',
            colId: 'country',
            type: 'isAnyOf',
            values: ['Jamaica'],
        });
    });
});
