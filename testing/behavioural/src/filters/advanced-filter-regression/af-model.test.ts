import type { AdvancedFilterModel, GridApi, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, DateFilterModule, NumberFilterModule, TextFilterModule } from 'ag-grid-community';
import { AdvancedFilterModule } from 'ag-grid-enterprise';

import { AdvancedFilterHarness, FilterDom, GridRows, TestGridsManager, asyncSetTimeout } from '../../test-utils';

/**
 * Regression baseline for Advanced Filter model handling the tickets extend: model ↔ text symmetry
 * across every data type and operator (incl. the lossy unescaped-quote case), plus honouring column
 * `filterParams` (`caseSensitive`, `includeBlanksIn*`) and `object` columns (text operators over the
 * formatted value). Highest-regression-risk surface, pinned per operator.
 */
interface Row {
    name: string;
    age: number | null;
    active: boolean | null;
    date: string | null;
}

const ROW_DATA: Row[] = [
    { name: 'Bolt', age: 25, active: true, date: '2012-08-05' },
    { name: 'Ng', age: 40, active: false, date: '2024-01-01' },
    { name: 'Wei', age: 28, active: null, date: null },
];

const DEFAULT_OPTIONS: GridOptions<Row> = {
    columnDefs: [
        { field: 'name', filter: true },
        { field: 'age', filter: true },
        { field: 'active', filter: true },
        { field: 'date', filter: true },
    ],
    rowData: ROW_DATA,
    enableAdvancedFilter: true,
};

/** Asserts model → text (editor value) and text → model (re-parse) are exact inverses. */
async function assertRoundTrip(api: GridApi<Row>, model: AdvancedFilterModel, text: string): Promise<void> {
    api.setAdvancedFilterModel(model);
    await asyncSetTimeout(0);
    expect(AdvancedFilterHarness.get(api).value).toBe(text);
    expect(api.getAdvancedFilterModel()).toEqual(model);

    api.setAdvancedFilterModel(null);
    await asyncSetTimeout(0);
    await AdvancedFilterHarness.get(api).applyExpression(text);
    await asyncSetTimeout(0);
    expect(api.getAdvancedFilterModel()).toEqual(model);
}

describe('Advanced Filter — model ↔ text round-trip', () => {
    const gridsManager = new TestGridsManager({
        modules: [
            TextFilterModule,
            NumberFilterModule,
            DateFilterModule,
            AdvancedFilterModule,
            ClientSideRowModelModule,
        ],
    });

    afterEach(() => gridsManager.reset());

    test('text operators round-trip in both directions', async () => {
        const api = await gridsManager.createGridAndWait('grid1', DEFAULT_OPTIONS);

        await assertRoundTrip(
            api,
            { filterType: 'text', colId: 'name', type: 'equals', filter: 'Bolt' },
            '[Name] equals "Bolt"'
        );
        await assertRoundTrip(
            api,
            { filterType: 'text', colId: 'name', type: 'notEqual', filter: 'Bolt' },
            '[Name] does not equal "Bolt"'
        );
        await assertRoundTrip(
            api,
            { filterType: 'text', colId: 'name', type: 'contains', filter: 'o' },
            '[Name] contains "o"'
        );
        await assertRoundTrip(
            api,
            { filterType: 'text', colId: 'name', type: 'notContains', filter: 'o' },
            '[Name] does not contain "o"'
        );
        await assertRoundTrip(
            api,
            { filterType: 'text', colId: 'name', type: 'startsWith', filter: 'B' },
            '[Name] begins with "B"'
        );
        await assertRoundTrip(
            api,
            { filterType: 'text', colId: 'name', type: 'endsWith', filter: 't' },
            '[Name] ends with "t"'
        );
        await assertRoundTrip(api, { filterType: 'text', colId: 'name', type: 'blank' }, '[Name] is blank');
        await assertRoundTrip(api, { filterType: 'text', colId: 'name', type: 'notBlank' }, '[Name] is not blank');

        // Applied state of the last round-trip (notBlank) — every name is non-blank here.
        await new GridRows(api, 'text notBlank applied').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 name:"Bolt" age:25 active:true date:"2012-08-05"
            ├── LEAF id:1 name:"Ng" age:40 active:false date:"2024-01-01"
            └── LEAF id:2 name:"Wei" age:28 active:null date:null
        `);
    });

    test('number operators round-trip in both directions', async () => {
        const api = await gridsManager.createGridAndWait('grid1', DEFAULT_OPTIONS);

        await assertRoundTrip(api, { filterType: 'number', colId: 'age', type: 'equals', filter: 25 }, '[Age] = 25');
        await assertRoundTrip(api, { filterType: 'number', colId: 'age', type: 'notEqual', filter: 25 }, '[Age] != 25');
        await assertRoundTrip(
            api,
            { filterType: 'number', colId: 'age', type: 'greaterThan', filter: 25 },
            '[Age] > 25'
        );
        await assertRoundTrip(
            api,
            { filterType: 'number', colId: 'age', type: 'greaterThanOrEqual', filter: 25 },
            '[Age] >= 25'
        );
        await assertRoundTrip(api, { filterType: 'number', colId: 'age', type: 'lessThan', filter: 25 }, '[Age] < 25');
        await assertRoundTrip(
            api,
            { filterType: 'number', colId: 'age', type: 'lessThanOrEqual', filter: 25 },
            '[Age] <= 25'
        );
        await assertRoundTrip(api, { filterType: 'number', colId: 'age', type: 'blank' }, '[Age] is blank');
        await assertRoundTrip(api, { filterType: 'number', colId: 'age', type: 'notBlank' }, '[Age] is not blank');

        // Applied state of the last round-trip (age > 25 from the greaterThan case is cleared; notBlank last).
        await new GridRows(api, 'number notBlank applied').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 name:"Bolt" age:25 active:true date:"2012-08-05"
            ├── LEAF id:1 name:"Ng" age:40 active:false date:"2024-01-01"
            └── LEAF id:2 name:"Wei" age:28 active:null date:null
        `);
    });

    test('boolean operators round-trip in both directions', async () => {
        const api = await gridsManager.createGridAndWait('grid1', DEFAULT_OPTIONS);

        await assertRoundTrip(api, { filterType: 'boolean', colId: 'active', type: 'true' }, '[Active] is true');
        await new GridRows(api, 'boolean true applied').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 name:"Bolt" age:25 active:true date:"2012-08-05"
        `);

        await assertRoundTrip(api, { filterType: 'boolean', colId: 'active', type: 'false' }, '[Active] is false');
        await new GridRows(api, 'boolean false applied').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:1 name:"Ng" age:40 active:false date:"2024-01-01"
        `);
    });

    test('dateString operators round-trip in both directions', async () => {
        const api = await gridsManager.createGridAndWait('grid1', DEFAULT_OPTIONS);

        await assertRoundTrip(
            api,
            { filterType: 'dateString', colId: 'date', type: 'equals', filter: '2012-08-05' },
            '[Date] = "2012-08-05"'
        );
        await assertRoundTrip(
            api,
            { filterType: 'dateString', colId: 'date', type: 'greaterThan', filter: '2012-08-05' },
            '[Date] > "2012-08-05"'
        );
        await assertRoundTrip(api, { filterType: 'dateString', colId: 'date', type: 'blank' }, '[Date] is blank');

        await new GridRows(api, 'dateString blank applied').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:2 name:"Wei" age:28 active:null date:null
        `);
    });

    test('compound AND join round-trips and applies', async () => {
        const api = await gridsManager.createGridAndWait('grid1', DEFAULT_OPTIONS);

        const model: AdvancedFilterModel = {
            filterType: 'join',
            type: 'AND',
            conditions: [
                { filterType: 'number', colId: 'age', type: 'greaterThan', filter: 20 },
                { filterType: 'boolean', colId: 'active', type: 'true' },
            ],
        };
        api.setAdvancedFilterModel(model);
        await asyncSetTimeout(0);

        expect(api.getAdvancedFilterModel()).toEqual(model);
        await new FilterDom(api, 'AND join panel').checkFilterDom(`
            ADVANCED FILTER
            input: "[Age] > 20 AND [Active] is true"
            valid: true
            buttons: Apply ⊘ | Builder
            model:
              filterType: "join"
              type: "AND"
              conditions:
                - filterType: "number"
                  colId: "age"
                  type: "greaterThan"
                  filter: 20
                - filterType: "boolean"
                  colId: "active"
                  type: "true"
        `);
        await new GridRows(api, 'AND join applied').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 name:"Bolt" age:25 active:true date:"2012-08-05"
        `);

        // text → model
        const text = AdvancedFilterHarness.get(api).value;
        api.setAdvancedFilterModel(null);
        await asyncSetTimeout(0);
        await AdvancedFilterHarness.get(api).applyExpression(text);
        await asyncSetTimeout(0);
        expect(api.getAdvancedFilterModel()).toEqual(model);
    });

    test('nested (A OR B) AND C join round-trips and brackets the nested group', async () => {
        const api = await gridsManager.createGridAndWait('grid1', DEFAULT_OPTIONS);

        const model: AdvancedFilterModel = {
            filterType: 'join',
            type: 'AND',
            conditions: [
                {
                    filterType: 'join',
                    type: 'OR',
                    conditions: [
                        { filterType: 'text', colId: 'name', type: 'equals', filter: 'Bolt' },
                        { filterType: 'number', colId: 'age', type: 'greaterThan', filter: 35 },
                    ],
                },
                { filterType: 'text', colId: 'name', type: 'notBlank' },
            ],
        };
        api.setAdvancedFilterModel(model);
        await asyncSetTimeout(0);

        expect(api.getAdvancedFilterModel()).toEqual(model);
        await new FilterDom(api, 'nested join panel').checkFilterDom(`
            ADVANCED FILTER
            input: "([Name] equals "Bolt" OR [Age] > 35) AND [Name] is not blank"
            valid: true
            buttons: Apply ⊘ | Builder
            model:
              filterType: "join"
              type: "AND"
              conditions:
                - filterType: "join"
                  type: "OR"
                  conditions:
                    - filterType: "text"
                      colId: "name"
                      type: "equals"
                      filter: "Bolt"
                    - filterType: "number"
                      colId: "age"
                      type: "greaterThan"
                      filter: 35
                - filterType: "text"
                  colId: "name"
                  type: "notBlank"
        `);
        await new GridRows(api, 'nested join applied').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 name:"Bolt" age:25 active:true date:"2012-08-05"
            └── LEAF id:1 name:"Ng" age:40 active:false date:"2024-01-01"
        `);

        const text = AdvancedFilterHarness.get(api).value;
        api.setAdvancedFilterModel(null);
        await asyncSetTimeout(0);
        await AdvancedFilterHarness.get(api).applyExpression(text);
        await asyncSetTimeout(0);
        expect(api.getAdvancedFilterModel()).toEqual(model);
    });

    test('a text operand containing a double quote round-trips via single quotes and filters', async () => {
        const api = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'name', filter: true }],
            rowData: [{ name: 'a"b' }, { name: 'plain' }],
            enableAdvancedFilter: true,
        });

        // The formatter wraps the operand in the quote char the value does NOT contain, so a `"`
        // value is emitted inside single quotes rather than producing malformed text.
        api.setAdvancedFilterModel({ filterType: 'text', colId: 'name', type: 'equals', filter: 'a"b' });
        await asyncSetTimeout(0);
        const text = AdvancedFilterHarness.get(api).value;
        expect(text).toBe(`[Name] equals 'a"b'`);
        await new GridRows(api, 'quote-value model filters').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 name:'a"b'
        `);

        // Re-parsing the emitted text recovers the original model exactly.
        api.setAdvancedFilterModel(null);
        await asyncSetTimeout(0);
        await AdvancedFilterHarness.get(api).applyExpression(text);
        await asyncSetTimeout(0);
        expect(api.getAdvancedFilterModel()).toEqual({
            filterType: 'text',
            colId: 'name',
            type: 'equals',
            filter: 'a"b',
        });
        await new GridRows(api, 'quote-value round-trip filters').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 name:'a"b'
        `);
    });

    test('a text operand containing both quote kinds cannot be expressed in text and fails safe', async () => {
        const api = await gridsManager.createGridAndWait('grid1', DEFAULT_OPTIONS);

        // No quote choice works when the value holds both `'` and `"`; the text form is rejected
        // rather than mis-filtering — the structured model API remains the way to filter such values.
        api.setAdvancedFilterModel({ filterType: 'text', colId: 'name', type: 'equals', filter: `a"b'c` });
        await asyncSetTimeout(0);
        const text = AdvancedFilterHarness.get(api).value;

        api.setAdvancedFilterModel(null);
        await asyncSetTimeout(0);
        await AdvancedFilterHarness.get(api).applyExpression(text);
        await asyncSetTimeout(0);
        expect(api.getAdvancedFilterModel()).toBeNull();
        await new GridRows(api, 'both-quotes leaves grid unfiltered').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 name:"Bolt" age:25 active:true date:"2012-08-05"
            ├── LEAF id:1 name:"Ng" age:40 active:false date:"2024-01-01"
            └── LEAF id:2 name:"Wei" age:28 active:null date:null
        `);
    });
});

describe('Advanced Filter — object columns and text/number params', () => {
    const gridsManager = new TestGridsManager({
        modules: [TextFilterModule, NumberFilterModule, AdvancedFilterModule, ClientSideRowModelModule],
    });

    afterEach(() => gridsManager.reset());

    describe('caseSensitive', () => {
        const ROW_DATA = [{ name: 'Bolt' }, { name: 'bolt' }, { name: 'Ng' }];

        test('caseSensitive:true makes equals case-exact', async () => {
            const api: GridApi = await gridsManager.createGridAndWait('grid1', {
                columnDefs: [{ field: 'name', filter: 'agTextColumnFilter', filterParams: { caseSensitive: true } }],
                rowData: ROW_DATA,
                enableAdvancedFilter: true,
            });

            await AdvancedFilterHarness.get(api).applyExpression('[Name] equals "bolt"');
            await asyncSetTimeout(0);
            await new GridRows(api, 'caseSensitive equals rows').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:1 name:"bolt"
            `);
        });

        test('default (case-insensitive) equals matches regardless of case', async () => {
            const api: GridApi = await gridsManager.createGridAndWait('grid1', {
                columnDefs: [{ field: 'name', filter: 'agTextColumnFilter' }],
                rowData: ROW_DATA,
                enableAdvancedFilter: true,
            });

            await AdvancedFilterHarness.get(api).applyExpression('[Name] equals "bolt"');
            await asyncSetTimeout(0);
            await new GridRows(api, 'case-insensitive equals rows').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 name:"Bolt"
                └── LEAF id:1 name:"bolt"
            `);
        });
    });

    describe('includeBlanksInGreaterThan', () => {
        const ROW_DATA = [{ age: 10 }, { age: 25 }, { age: null }, { age: 40 }];

        test('by default blanks are excluded from greaterThan', async () => {
            const api: GridApi = await gridsManager.createGridAndWait('grid1', {
                columnDefs: [{ field: 'age', filter: 'agNumberColumnFilter' }],
                rowData: ROW_DATA,
                enableAdvancedFilter: true,
            });

            await AdvancedFilterHarness.get(api).applyExpression('[Age] > 20');
            await asyncSetTimeout(0);
            await new GridRows(api, 'greaterThan excludes blanks rows').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:1 age:25
                └── LEAF id:3 age:40
            `);
        });

        test('includeBlanksInGreaterThan:true keeps blank rows', async () => {
            const api: GridApi = await gridsManager.createGridAndWait('grid1', {
                columnDefs: [
                    {
                        field: 'age',
                        filter: 'agNumberColumnFilter',
                        filterParams: { includeBlanksInGreaterThan: true },
                    },
                ],
                rowData: ROW_DATA,
                enableAdvancedFilter: true,
            });

            await AdvancedFilterHarness.get(api).applyExpression('[Age] > 20');
            await asyncSetTimeout(0);
            await new GridRows(api, 'greaterThan includes blanks rows').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:1 age:25
                ├── LEAF id:2 age:null
                └── LEAF id:3 age:40
            `);
        });
    });

    describe('object column', () => {
        interface ObjRow {
            country: { code: string; name: string };
        }
        const ROW_DATA: ObjRow[] = [
            { country: { code: 'US', name: 'United States' } },
            { country: { code: 'JM', name: 'Jamaica' } },
            { country: { code: 'PL', name: 'Poland' } },
        ];

        test('object column uses text operators over the formatted value', async () => {
            const api: GridApi = await gridsManager.createGridAndWait('grid1', {
                columnDefs: [
                    {
                        field: 'country',
                        cellDataType: 'object',
                        filter: 'agTextColumnFilter',
                        valueFormatter: (p: any) => p.value?.name ?? '',
                        keyCreator: (p: any) => p.value?.name ?? '',
                    },
                ],
                rowData: ROW_DATA,
                enableAdvancedFilter: true,
            });

            await AdvancedFilterHarness.get(api).applyExpression('[Country] contains "United"');
            await asyncSetTimeout(0);
            expect(api.getAdvancedFilterModel()).toMatchObject({
                filterType: 'object',
                type: 'contains',
                filter: 'United',
            });
            await new GridRows(api, 'object contains rows').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 country:"United States"
            `);
        });
    });
});
