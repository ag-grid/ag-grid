import { waitFor } from '@testing-library/dom';

import type { ColDef, GridApi, GridOptions, IFilterOptionDef, ITextFilterParams } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    DateFilterModule,
    GridStateModule,
    NumberFilterModule,
    TextFilterModule,
    enableDevValidations,
    setupAgTestIds,
} from 'ag-grid-community';
import { AdvancedFilterModule, ColumnMenuModule } from 'ag-grid-enterprise';

import {
    ALL_SEVERITIES,
    AdvancedFilterHarness,
    ColumnFilterHarness,
    FilterDom,
    FloatingFilterHarness,
    GridRows,
    TestGridsManager,
    asyncSetTimeout,
    installFilterLayoutMock,
    uninstallFilterLayoutMock,
} from '../test-utils';

/**
 * Custom filter options in the column filter: the inputs rendered for each arity, the values reaching the
 * predicate, the model slots they round-trip through, and how a malformed or unoffered option is handled.
 */
interface Row {
    athlete: string;
    age: number;
}

const ROW_DATA: Row[] = [
    { athlete: 'Bolt', age: 25 },
    { athlete: 'Ng', age: 40 },
    { athlete: 'Ada', age: 28 },
    { athlete: 'Wei', age: 33 },
];

const ANY_OF_TWO: IFilterOptionDef = {
    displayKey: 'anyOfTwo',
    displayName: 'Any Of Two',
    numberOfInputs: 2,
    predicate: (values, cellValue) => values.includes(cellValue),
};

/** The one- and two-value shapes that already worked, kept to prove they are unchanged. */
const MULTIPLE_OF: IFilterOptionDef = {
    displayKey: 'multipleOf',
    displayName: 'Multiple of',
    numberOfInputs: 1,
    predicate: ([value], cellValue) => cellValue != null && cellValue % value === 0,
};

const STRICTLY_BETWEEN: IFilterOptionDef = {
    displayKey: 'strictlyBetween',
    displayName: 'Strictly between',
    numberOfInputs: 2,
    predicate: ([from, to], cellValue) => cellValue != null && cellValue > from && cellValue < to,
};

const OPTS: GridOptions<Row> = {
    columnDefs: [
        {
            field: 'athlete',
            filter: 'agTextColumnFilter',
            filterParams: { filterOptions: ['contains', ANY_OF_TWO], debounceMs: 0 },
        },
        {
            field: 'age',
            filter: 'agNumberColumnFilter',
            filterParams: { filterOptions: ['inRange', ANY_OF_TWO], debounceMs: 0 },
        },
    ],
    rowData: ROW_DATA,
};

describe('Column filter — custom options taking 0, 1 or 2 values', () => {
    const gridsManager = new TestGridsManager({
        modules: [TextFilterModule, NumberFilterModule, DateFilterModule, ColumnMenuModule, ClientSideRowModelModule],
    });

    beforeAll(() => {
        setupAgTestIds();
        installFilterLayoutMock();
    });
    afterAll(() => uninstallFilterLayoutMock());
    afterEach(() => {
        gridsManager.reset();
        vi.restoreAllMocks();
        enableDevValidations({ throwOn: ALL_SEVERITIES });
    });

    test('a two-value option on a text column is not labelled or summarised as a range', async () => {
        const pairOfWords: IFilterOptionDef = {
            displayKey: 'pairOfWords',
            displayName: 'Either Of',
            numberOfInputs: 2,
            predicate: ([a, b], cellValue) => cellValue === a || cellValue === b,
        };
        const api: GridApi<Row> = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'athlete',
                    filter: 'agTextColumnFilter',
                    filterParams: { filterOptions: ['contains', pairOfWords], debounceMs: 0 },
                },
            ],
            rowData: ROW_DATA,
        });

        const filter = await ColumnFilterHarness.open(api, 'athlete');
        await filter.selectOperator('Either Of');
        await filter.setText('Bolt', 0);
        await filter.setText('Ada', 1);
        await asyncSetTimeout(0);

        await new FilterDom(api, 'two text values that are not a range', { colId: 'athlete' }).checkFilterDom(`
            COLUMN FILTER
            operator: "Either Of"
            input [0]: "Bolt"
            input [1]: "Ada"
            AND
            operator: "Contains"
            input: "" ⟨Filter...⟩
            model:
              filterType: "text"
              type: "pairOfWords"
              filter: "Bolt"
              filterTo: "Ada"
        `);
        expect(api.getColumnFilterModel('athlete')).not.toBeNull();
        expect(filter.inputs('text').map((input) => input.placeholder)).toEqual(['From', 'To', 'Filter...']);
        // Two inputs the screen reader could not tell apart is what the from/to naming avoids.
        expect(filter.inputs('text').map((input) => input.getAttribute('aria-label'))).toEqual([
            'Filter from value',
            'Filter to Value',
            'Filter Value',
        ]);
    });

    test('a text `inRange` listed explicitly is not range-validated either', async () => {
        // Deliberate: the built-in text matching has no case for `inRange`, which it reports as #76.
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [76] });
        vi.spyOn(console, 'warn').mockImplementation(() => {});

        const api: GridApi<Row> = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'athlete',
                    filter: 'agTextColumnFilter',
                    filterParams: { filterOptions: ['contains', 'inRange'], debounceMs: 0 },
                },
            ],
            rowData: ROW_DATA,
        });

        const filter = await ColumnFilterHarness.open(api, 'athlete');
        await filter.selectOperator('Between');
        await filter.setText('Z', 0);
        await filter.setText('A', 1);
        await asyncSetTimeout(0);

        // The ends are still named from/to, but text has no ordering, so neither end is held against the other.
        await new FilterDom(api, 'a text range in any order', { colId: 'athlete' }).checkFilterDom(`
            COLUMN FILTER
            operator: "Between"
            input [0]: "Z"
            input [1]: "A"
            AND
            operator: "Contains"
            input: "" ⟨Filter...⟩
            model:
              filterType: "text"
              type: "inRange"
              filter: "Z"
              filterTo: "A"
        `);
    });

    test('a model set through the API fills every input and filters', async () => {
        const api: GridApi<Row> = await gridsManager.createGridAndWait('grid1', OPTS);

        await api.setColumnFilterModel('athlete', {
            filterType: 'text',
            type: 'anyOfTwo',
            filter: 'Ng',
            filterTo: 'Wei',
        });
        api.onFilterChanged();
        await asyncSetTimeout(0);

        await new GridRows(api, 'any of two from model').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:1 athlete:"Ng" age:40
            └── LEAF id:3 athlete:"Wei" age:33
        `);

        await ColumnFilterHarness.open(api, 'athlete');
        await new FilterDom(api, 'every input filled from the model', { colId: 'athlete' }).checkFilterDom(`
            COLUMN FILTER
            operator: "Any Of Two"
            input [0]: "Ng"
            input [1]: "Wei"
            AND
            operator: "Contains"
            input: "" ⟨Filter...⟩
            model:
              filterType: "text"
              type: "anyOfTwo"
              filter: "Ng"
              filterTo: "Wei"
        `);
    });

    test('the built-in inRange option still uses `filter` and `filterTo`', async () => {
        const api: GridApi<Row> = await gridsManager.createGridAndWait('grid1', OPTS);

        const filter = await ColumnFilterHarness.open(api, 'age');
        await filter.selectOperator('Between');
        await filter.setNumber(26, 0);
        await filter.setNumber(35, 1);
        await asyncSetTimeout(0);

        await new FilterDom(api, 'built-in inRange panel', { colId: 'age' }).checkFilterDom(`
            COLUMN FILTER
            operator: "Between"
            input [0]: "26"
            input [1]: "35"
            AND
            operator: "Between"
            input [0]: "" ⟨From⟩
            input [1]: "" ⟨To⟩
            model:
              filterType: "number"
              type: "inRange"
              filter: 26
              filterTo: 35
        `);
        await new GridRows(api, 'in range ages').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:2 athlete:"Ada" age:28
            └── LEAF id:3 athlete:"Wei" age:33
        `);
    });

    test('one- and two-value custom options report their values in `filter`/`filterTo` alone', async () => {
        const api: GridApi<Row> = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'age',
                    filter: 'agNumberColumnFilter',
                    filterParams: { filterOptions: ['equals', MULTIPLE_OF, STRICTLY_BETWEEN], debounceMs: 0 },
                },
            ],
            rowData: ROW_DATA,
        });

        const filter = await ColumnFilterHarness.open(api, 'age');
        await filter.selectOperator('Multiple of');
        await filter.setNumber(5, 0);
        await asyncSetTimeout(0);
        await new FilterDom(api, 'one-value custom option', { colId: 'age' }).checkFilterDom(`
            COLUMN FILTER
            operator: "Multiple of"
            input: "5"
            AND
            operator: "Equals"
            input: "" ⟨Filter...⟩
            model:
              filterType: "number"
              type: "multipleOf"
              filter: 5
        `);

        await filter.selectOperator('Strictly between');
        await filter.setNumber(26, 0);
        await filter.setNumber(35, 1);
        await asyncSetTimeout(0);
        await new FilterDom(api, 'two-value custom option', { colId: 'age' }).checkFilterDom(`
            COLUMN FILTER
            operator: "Strictly between"
            input [0]: "26"
            input [1]: "35"
            AND
            operator: "Equals"
            input: "" ⟨Filter...⟩
            model:
              filterType: "number"
              type: "strictlyBetween"
              filter: 26
              filterTo: 35
        `);
        await new GridRows(api, 'strictly between ages').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:2 age:28
            └── LEAF id:3 age:33
        `);
    });

    test('a model supplied the old way, in `filter` and `filterTo`, still applies', async () => {
        const api: GridApi<Row> = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'age',
                    filter: 'agNumberColumnFilter',
                    filterParams: { filterOptions: ['equals', STRICTLY_BETWEEN], debounceMs: 0 },
                },
            ],
            rowData: ROW_DATA,
        });

        await api.setColumnFilterModel('age', {
            filterType: 'number',
            type: 'strictlyBetween',
            filter: 26,
            filterTo: 35,
        });
        api.onFilterChanged();
        await asyncSetTimeout(0);

        await new GridRows(api, 'legacy model applied').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:2 age:28
            └── LEAF id:3 age:33
        `);

        await ColumnFilterHarness.open(api, 'age');
        await new FilterDom(api, 'legacy from/to model in the inputs', { colId: 'age' }).checkFilterDom(`
            COLUMN FILTER
            operator: "Strictly between"
            input [0]: "26"
            input [1]: "35"
            AND
            operator: "Equals"
            input: "" ⟨Filter...⟩
            model:
              filterType: "number"
              type: "strictlyBetween"
              filter: 26
              filterTo: 35
        `);
    });

    test('the floating filter summarises the values, joined as a range is', async () => {
        const createGrid = (id: string) =>
            gridsManager.createGridAndWait<Row>(id, {
                columnDefs: [
                    {
                        field: 'age',
                        filter: 'agNumberColumnFilter',
                        floatingFilter: true,
                        filterParams: {
                            filterOptions: ['equals', MULTIPLE_OF, STRICTLY_BETWEEN, ANY_OF_TWO],
                            debounceMs: 0,
                        },
                    },
                ],
                rowData: ROW_DATA,
            });
        const floatingFilterTexts = (api: GridApi<Row>) =>
            FloatingFilterHarness.get(api, 'age')
                .inputs()
                .map((input) => input.value);

        const oneValueApi = await createGrid('grid1');
        await oneValueApi.setColumnFilterModel('age', {
            filterType: 'number',
            type: 'multipleOf',
            filter: 5,
        });
        oneValueApi.onFilterChanged();
        await asyncSetTimeout(0);
        expect(floatingFilterTexts(oneValueApi)).toEqual(['5']);

        const twoValueApi = await createGrid('grid2');
        await twoValueApi.setColumnFilterModel('age', {
            filterType: 'number',
            type: 'strictlyBetween',
            filter: 26,
            filterTo: 35,
        });
        twoValueApi.onFilterChanged();
        await asyncSetTimeout(0);
        expect(floatingFilterTexts(twoValueApi)).toEqual(['26-35']);

        // A custom option's pair summarises the way the built-in range does.
        const customPairApi = await createGrid('grid3');
        await customPairApi.setColumnFilterModel('age', {
            filterType: 'number',
            type: 'anyOfTwo',
            filter: 25,
            filterTo: 33,
        });
        customPairApi.onFilterChanged();
        await asyncSetTimeout(0);
        expect(floatingFilterTexts(customPairApi)).toEqual(['25-33']);
    });

    test('the predicate does not run until every value is entered', async () => {
        const api: GridApi<Row> = await gridsManager.createGridAndWait('grid1', OPTS);

        const filter = await ColumnFilterHarness.open(api, 'athlete');
        await filter.selectOperator('Any Of Two');
        await filter.setText('Bolt', 0);
        await asyncSetTimeout(0);

        // One of the two values, so the condition is incomplete and no filter is applied.
        expect(api.getColumnFilterModel('athlete')).toBeNull();
        await new GridRows(api, 'incomplete condition').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 athlete:"Bolt" age:25
            ├── LEAF id:1 athlete:"Ng" age:40
            ├── LEAF id:2 athlete:"Ada" age:28
            └── LEAF id:3 athlete:"Wei" age:33
        `);
    });

    test('a two-value custom option still validates its values as a range by default', async () => {
        const api: GridApi<Row> = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'age',
                    filter: 'agNumberColumnFilter',
                    filterParams: { filterOptions: [STRICTLY_BETWEEN], debounceMs: 0, maxNumConditions: 1 },
                },
            ],
            rowData: ROW_DATA,
        });

        const filter = await ColumnFilterHarness.open(api, 'age');
        await filter.setNumber(30, 0);
        await filter.setNumber(20, 1);
        await asyncSetTimeout(0);

        // Out of order, so the second input reports it and no filter is applied.
        expect(filter.inputs('number')[1].validationMessage).not.toBe('');
        expect(api.getColumnFilterModel('age')).toBeNull();

        // A range the user is still fixing survives the popup closing, exactly as `inRange` does.
        api.hideColumnFilter();
        await asyncSetTimeout(0);

        const reopened = await ColumnFilterHarness.open(api, 'age');
        expect(reopened.input('number', 1).validity.valid).toBe(false);
        await new FilterDom(api, 'an out-of-order custom pair survives reopening', { colId: 'age' }).checkFilterDom(`
            COLUMN FILTER
            operator: "Strictly between"
            input [0]: "30"
            input [1]: "20" ✗ "Must be greater than 30"
            model: null
        `);
    });

    test.each([
        ['a negative count', -1, 0],
        ['an unreadable count', 'two', 0],
        // Truncated, as `latest` truncated it by slicing the values with it.
        ['a fractional count', 2.9, 2],
        // Clamped: three inputs is not a shape either filter can render.
        ['a count above two', 3, 2],
    ])('%s gives %s inputs', async (_name, numberOfInputs, expectedInputs) => {
        const api: GridApi<Row> = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'age',
                    filter: 'agNumberColumnFilter',
                    filterParams: {
                        filterOptions: [{ ...ANY_OF_TWO, numberOfInputs } as IFilterOptionDef],
                        debounceMs: 0,
                    },
                },
            ],
            rowData: ROW_DATA,
        });

        const filter = await ColumnFilterHarness.open(api, 'age');
        expect(filter.inputs('number')).toHaveLength(expectedInputs as number);
    });

    test('a numeric string `numberOfInputs` counts, and a hole in the list is skipped', async () => {
        const api: GridApi<Row> = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'age',
                    filter: 'agNumberColumnFilter',
                    filterParams: {
                        // A JS caller gets no type check, so a list can hold both.
                        filterOptions: [null, { ...ANY_OF_TWO, numberOfInputs: '2' }] as any,
                        debounceMs: 0,
                    },
                },
            ],
            rowData: ROW_DATA,
        });

        const filter = await ColumnFilterHarness.open(api, 'age');
        expect(filter.operatorSelectValue()).toBe('Any Of Two');
        expect(filter.inputs('number')).toHaveLength(2);

        await filter.setNumber(25, 0);
        await filter.setNumber(40, 1);
        expect(filter.getModel()).toEqual({ filterType: 'number', type: 'anyOfTwo', filter: 25, filterTo: 40 });
    });
});

interface AgeRow {
    age: number;
}

const CONDITION_ROWS: AgeRow[] = [{ age: 25 }, { age: 40 }, { age: 28 }, { age: 33 }, { age: 51 }];

const CONDITION_OPTS: GridOptions<AgeRow> = {
    columnDefs: [
        {
            field: 'age',
            filter: 'agNumberColumnFilter',
            filterParams: { filterOptions: ['equals', ANY_OF_TWO], debounceMs: 0 },
        },
    ],
    rowData: CONDITION_ROWS,
};

describe('Column filter — a two-value custom option across conditions', () => {
    const gridsManager = new TestGridsManager({
        modules: [NumberFilterModule, ColumnMenuModule, ClientSideRowModelModule],
    });

    beforeAll(() => {
        setupAgTestIds();
        installFilterLayoutMock();
    });
    afterAll(() => uninstallFilterLayoutMock());
    afterEach(() => gridsManager.reset());

    test('each condition keeps its own pair of values', async () => {
        const api: GridApi<AgeRow> = await gridsManager.createGridAndWait('grid1', CONDITION_OPTS);

        const filter = await ColumnFilterHarness.open(api, 'age');
        await filter.selectOperator('Any Of Two', 0);
        await filter.setNumber(25, 0);
        await filter.setNumber(28, 1);
        await asyncSetTimeout(0);

        // Completing the first condition reveals the second, which gets its own inputs.
        await filter.selectOperator('Any Of Two', 1);
        expect(filter.inputs('number', 1)).toHaveLength(2);

        await filter.setNumber(40, 2);
        await filter.setNumber(51, 3);
        await asyncSetTimeout(0);

        // Two values fit the built-in pair, so the model is the one `latest` produced for this option.
        expect(api.getColumnFilterModel('age')).toEqual({
            filterType: 'number',
            operator: 'AND',
            conditions: [
                { filterType: 'number', type: 'anyOfTwo', filter: 25, filterTo: 28 },
                { filterType: 'number', type: 'anyOfTwo', filter: 40, filterTo: 51 },
            ],
        });
        await new GridRows(api, 'two conditions each holding a pair').check(`
            ROOT id:ROOT_NODE_ID
        `);
    });

    test('an OR of two two-value conditions filters on both', async () => {
        const api: GridApi<AgeRow> = await gridsManager.createGridAndWait('grid1', CONDITION_OPTS);

        await api.setColumnFilterModel('age', {
            filterType: 'number',
            operator: 'OR',
            conditions: [
                { filterType: 'number', type: 'anyOfTwo', filter: 25, filterTo: 28 },
                { filterType: 'number', type: 'anyOfTwo', filter: 40, filterTo: 51 },
            ],
        } as any);
        api.onFilterChanged();
        await asyncSetTimeout(0);

        await new GridRows(api, 'either pair').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 age:25
            ├── LEAF id:1 age:40
            ├── LEAF id:2 age:28
            └── LEAF id:4 age:51
        `);

        // Every input of both conditions is restored, in order.
        const filter = await ColumnFilterHarness.open(api, 'age');
        expect(filter.inputs('number', 0).map((input) => input.value)).toEqual(['25', '28']);
        expect(filter.inputs('number', 1).map((input) => input.value)).toEqual(['40', '51']);
    });

    test('an incomplete condition in an OR leaves the other one filtering, rather than passing every row', async () => {
        const api: GridApi<AgeRow> = await gridsManager.createGridAndWait('grid1', CONDITION_OPTS);

        // The first condition is short of its second value, so it filters on nothing.
        await api.setColumnFilterModel('age', {
            filterType: 'number',
            operator: 'OR',
            conditions: [
                { filterType: 'number', type: 'anyOfTwo', filter: 25 },
                { filterType: 'number', type: 'anyOfTwo', filter: 40, filterTo: 51 },
            ],
        } as any);
        api.onFilterChanged();
        await asyncSetTimeout(0);

        await new GridRows(api, 'only the complete condition filters').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:1 age:40
            └── LEAF id:4 age:51
        `);
    });

    test('editing the second condition after both applied updates only that condition', async () => {
        const api: GridApi<AgeRow> = await gridsManager.createGridAndWait('grid1', CONDITION_OPTS);

        await api.setColumnFilterModel('age', {
            filterType: 'number',
            operator: 'OR',
            conditions: [
                { filterType: 'number', type: 'anyOfTwo', filter: 25, filterTo: 28 },
                { filterType: 'number', type: 'anyOfTwo', filter: 40, filterTo: 51 },
            ],
        } as any);
        api.onFilterChanged();
        await asyncSetTimeout(0);

        // The second condition's `from`, kept below its `to`: two values are an ordered range by default.
        const filter = await ColumnFilterHarness.open(api, 'age');
        await filter.setNumber(33, 2);
        await asyncSetTimeout(0);

        await new GridRows(api, 'second condition re-pointed').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 age:25
            ├── LEAF id:2 age:28
            ├── LEAF id:3 age:33
            └── LEAF id:4 age:51
        `);
    });
});

const MULTIPLE_OF_AGE: IFilterOptionDef = {
    displayKey: 'multipleOf',
    displayName: 'Multiple of',
    numberOfInputs: 1,
    predicate: ([value], cellValue) => cellValue != null && cellValue % value === 0,
};

/** No `predicate` and no `test`, so the grid cannot evaluate it. */
const NO_PREDICATE_OPTION = {
    displayKey: 'noPredicate',
    displayName: 'No Predicate',
    numberOfInputs: 1,
} as IFilterOptionDef;

describe('Column filter — a model missing values the option needs', () => {
    const gridsManager = new TestGridsManager({
        modules: [TextFilterModule, NumberFilterModule, ColumnMenuModule, ClientSideRowModelModule],
    });

    beforeAll(() => {
        setupAgTestIds();
        installFilterLayoutMock();
    });
    afterAll(() => uninstallFilterLayoutMock());
    afterEach(() => gridsManager.reset());

    const ENDS_WITH: IFilterOptionDef = {
        displayKey: 'endsWith2',
        displayName: 'Ends With',
        numberOfInputs: 1,
        predicate: ([value], cellValue) => cellValue != null && cellValue.endsWith(value),
    };

    // The Advanced Filter cannot echo a surplus value back, its model being rendered to an expression and
    // re-parsed, and the grammar writes only the values the option takes. Neither surface evaluates one.
    test.each([
        ['a built-in', 'contains'],
        ['a custom', 'endsWith2'],
    ])('%s option reports back a model carrying a value it does not take, unevaluated', async (name, type) => {
        const api: GridApi<Row> = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'athlete',
                    filter: 'agTextColumnFilter',
                    filterParams: { filterOptions: ['contains', ENDS_WITH], debounceMs: 0 },
                },
            ],
            rowData: ROW_DATA,
        });

        await api.setColumnFilterModel('athlete', { filterType: 'text', type, filter: 'olt', filterTo: 'Ada' });
        api.onFilterChanged();
        await asyncSetTimeout(0);

        expect(api.getColumnFilterModel('athlete')).toEqual({
            filterType: 'text',
            type,
            filter: 'olt',
            filterTo: 'Ada',
        });
        // `Ada` is in the data, so a second value the option does not take would show if it were read.
        await new GridRows(api, `${name} option ignores the value it does not take`).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 athlete:"Bolt"
        `);
    });

    // The UI cannot produce one - an incomplete condition yields a null model - but the API can.
    test.each([
        ['text', 'agTextColumnFilter', 'Bolt'],
        ['number', 'agNumberColumnFilter', 25],
    ] as const)('a %s option short of a value filters nothing rather than everything', async (name, filter, value) => {
        const api: GridApi<Row> = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'athlete', filter, filterParams: { filterOptions: [ANY_OF_TWO], debounceMs: 0 } }],
            rowData: ROW_DATA,
        });

        // One of the two values the option takes, so its predicate never runs.
        await api.setColumnFilterModel('athlete', {
            filterType: name,
            type: 'anyOfTwo',
            filter: value as any,
        });
        api.onFilterChanged();
        await asyncSetTimeout(0);

        await new GridRows(api, `incomplete ${name} model leaves every row`).check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 athlete:"Bolt"
            ├── LEAF id:1 athlete:"Ng"
            ├── LEAF id:2 athlete:"Ada"
            └── LEAF id:3 athlete:"Wei"
        `);
    });
});

describe('Column filter — a model naming an option the column does not offer', () => {
    const gridsManager = new TestGridsManager({
        modules: [NumberFilterModule, ColumnMenuModule, ClientSideRowModelModule],
    });

    beforeAll(() => {
        setupAgTestIds();
        installFilterLayoutMock();
    });
    afterAll(() => uninstallFilterLayoutMock());
    afterEach(() => gridsManager.reset());

    const restrictedOpts: GridOptions<AgeRow> = {
        columnDefs: [
            {
                field: 'age',
                filter: 'agNumberColumnFilter',
                filterParams: {
                    filterOptions: ['equals', MULTIPLE_OF_AGE],
                    debounceMs: 0,
                    maxNumConditions: 1,
                },
            },
        ],
        rowData: [{ age: 25 }, { age: 40 }, { age: 28 }, { age: 33 }],
    };

    test('a built-in option left out of `filterOptions` is cleared, not applied', async () => {
        const api: GridApi<AgeRow> = await gridsManager.createGridAndWait('grid1', restrictedOpts);

        await api.setColumnFilterModel('age', { filterType: 'number', type: 'greaterThan', filter: 30 });
        api.onFilterChanged();
        await asyncSetTimeout(0);

        expect(api.getColumnFilterModel('age')).toBeNull();
        await new GridRows(api, 'unfiltered - the option is not offered').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 age:25
            ├── LEAF id:1 age:40
            ├── LEAF id:2 age:28
            └── LEAF id:3 age:33
        `);
    });

    test('an option the list does offer is applied untouched', async () => {
        const api: GridApi<AgeRow> = await gridsManager.createGridAndWait('grid1', restrictedOpts);

        await api.setColumnFilterModel('age', { filterType: 'number', type: 'multipleOf', filter: 5 });
        api.onFilterChanged();
        await asyncSetTimeout(0);

        expect(api.getColumnFilterModel('age')).toEqual({ filterType: 'number', type: 'multipleOf', filter: 5 });
        await new GridRows(api, 'offered option applies').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 age:25
            └── LEAF id:1 age:40
        `);
    });
});

describe('Column filter — `filterOptions` swapped at runtime', () => {
    const gridsManager = new TestGridsManager({
        modules: [NumberFilterModule, ColumnMenuModule, ClientSideRowModelModule],
    });

    beforeAll(() => {
        setupAgTestIds();
        installFilterLayoutMock();
    });
    afterAll(() => uninstallFilterLayoutMock());
    afterEach(() => gridsManager.reset());

    const optsFor = (filterOptions: (string | IFilterOptionDef)[]): GridOptions<AgeRow> => ({
        columnDefs: [
            {
                field: 'age',
                filter: 'agNumberColumnFilter',
                filterParams: { filterOptions, debounceMs: 0, maxNumConditions: 1 },
            },
        ],
        rowData: [{ age: 25 }, { age: 40 }, { age: 28 }, { age: 33 }],
    });

    test('an option added later is offered, and filters with every value it takes', async () => {
        const api: GridApi<AgeRow> = await gridsManager.createGridAndWait(
            'grid1',
            optsFor(['equals', MULTIPLE_OF_AGE])
        );

        // Opened first, so the dropdown exists before the options change under it.
        const filter = await ColumnFilterHarness.open(api, 'age');
        expect(await filter.operatorOptions()).toEqual(['Equals', 'Multiple of']);

        api.setGridOption('columnDefs', optsFor(['equals', MULTIPLE_OF_AGE, STRICTLY_BETWEEN]).columnDefs);
        await waitFor(async () =>
            expect(await filter.operatorOptions()).toEqual(['Equals', 'Multiple of', 'Strictly between'])
        );

        await filter.selectOperator('Strictly between');
        await filter.setNumber(26, 0);
        await filter.setNumber(35, 1);
        await asyncSetTimeout(0);

        expect(api.getColumnFilterModel('age')).toEqual({
            filterType: 'number',
            type: 'strictlyBetween',
            filter: 26,
            filterTo: 35,
        });
        await new GridRows(api, 'option added at runtime filters').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:2 age:28
            └── LEAF id:3 age:33
        `);
    });

    test('a colDef re-declared with the same options leaves the half-typed condition alone', async () => {
        const options = (): (string | IFilterOptionDef)[] => [
            'equals',
            {
                displayKey: 'anyOfTwo',
                displayName: 'Any Of Two',
                numberOfInputs: 2,
                predicate: ([a, b], cellValue) => cellValue === a || cellValue === b,
            },
        ];
        const columnDefs = (): ColDef<AgeRow>[] => [
            {
                field: 'age',
                filter: 'agNumberColumnFilter',
                filterParams: { filterOptions: options(), debounceMs: 0 },
            },
        ];
        const api: GridApi<AgeRow> = await gridsManager.createGridAndWait('grid1', {
            columnDefs: columnDefs(),
            rowData: [{ age: 25 }, { age: 40 }, { age: 28 }],
        });

        const filter = await ColumnFilterHarness.open(api, 'age');
        await filter.selectOperator('Any Of Two');
        await filter.setNumber(25, 0);

        // A colDef built inline is a new array every render, but it offers exactly what it did before.
        api.setGridOption('columnDefs', columnDefs());
        await asyncSetTimeout(0);

        await new FilterDom(api, 'the half-typed condition survives the refresh', { colId: 'age' }).checkFilterDom(`
            COLUMN FILTER
            operator: "Any Of Two"
            input [0]: "25"
            input [1]: "" ⟨To⟩
            model: null
        `);
    });

    test('an option that keeps its key through an arity change keeps the values with it', async () => {
        const anyOfTwo = (numberOfInputs: 1 | 2): IFilterOptionDef => ({
            displayKey: 'anyOfTwo',
            displayName: 'Any Of Two',
            numberOfInputs,
            predicate: ([a, b], cellValue) => cellValue === a || (numberOfInputs === 2 && cellValue === b),
        });
        const api: GridApi<AgeRow> = await gridsManager.createGridAndWait('grid1', optsFor([anyOfTwo(2)]));

        const filter = await ColumnFilterHarness.open(api, 'age');
        await filter.setNumber(25, 0);
        await filter.setNumber(40, 1);
        await waitFor(() => expect(api.getColumnFilterModel('age')).not.toBeNull());

        // Narrowed to one value: the second input goes, and the `filterTo` it applied stops being evaluated.
        api.setGridOption('columnDefs', optsFor([anyOfTwo(1)]).columnDefs);
        await asyncSetTimeout(0);
        await new FilterDom(api, 'the value the narrowed option no longer takes', { colId: 'age' }).checkFilterDom(`
            COLUMN FILTER
            operator: "Any Of Two"
            input: "25"
            model:
              filterType: "number"
              type: "anyOfTwo"
              filter: 25
              filterTo: 40
        `);
        await new GridRows(api, 'the narrowed option filters on its one value').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 age:25
        `);

        // Widened again, the hidden input is shown holding what the user last typed there, and what the rows
        // are filtered on is what the inputs show: an option's own values survive its definition changing.
        api.setGridOption('columnDefs', optsFor([anyOfTwo(2)]).columnDefs);
        await asyncSetTimeout(0);
        await new FilterDom(api, 'the widened option shows its second value again', { colId: 'age' }).checkFilterDom(`
            COLUMN FILTER
            operator: "Any Of Two"
            input [0]: "25"
            input [1]: "40"
            model:
              filterType: "number"
              type: "anyOfTwo"
              filter: 25
              filterTo: 40
        `);
        await new GridRows(api, 'the widened option filters on both values again').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 age:25
            └── LEAF id:1 age:40
        `);
    });

    test('a built-in option narrowed and widened from the dropdown does the same', async () => {
        const api: GridApi<AgeRow> = await gridsManager.createGridAndWait('grid1', optsFor(['inRange', 'equals']));

        const filter = await ColumnFilterHarness.open(api, 'age');
        await filter.selectOperator('Between');
        await filter.setNumber(25, 0);
        await filter.setNumber(40, 1);
        await waitFor(() => expect(api.getColumnFilterModel('age')).not.toBeNull());

        await filter.selectOperator('Equals');
        await asyncSetTimeout(0);
        await filter.selectOperator('Between');
        await asyncSetTimeout(0);

        // Hiding an input never empties it, whether the option changed under the value or the user chose
        // another one over it. A custom option changing arity is the same behaviour, reached another way.
        await new FilterDom(api, 'the range end survives the option that hid it', { colId: 'age' }).checkFilterDom(`
            COLUMN FILTER
            operator: "Between"
            input [0]: "25"
            input [1]: "40"
            model:
              filterType: "number"
              type: "inRange"
              filter: 25
              filterTo: 40
        `);
    });

    test('the same array mutated in place is not a new option list, so the dropdown is left alone', async () => {
        const filterOptions: (string | IFilterOptionDef)[] = ['equals', 'notEqual'];
        const api: GridApi<AgeRow> = await gridsManager.createGridAndWait('grid1', optsFor(filterOptions));

        const filter = await ColumnFilterHarness.open(api, 'age');
        expect(await filter.operatorOptions()).toEqual(['Equals', 'Does not equal']);

        // The list is read by array identity, so an option pushed onto the same array is not seen as a change.
        filterOptions.push(MULTIPLE_OF_AGE);
        api.setGridOption('columnDefs', optsFor(filterOptions).columnDefs!);
        await asyncSetTimeout(0);

        expect(await filter.operatorOptions()).toEqual(['Equals', 'Does not equal']);
    });

    test('an applied option withdrawn later goes, and the values it collected go with it', async () => {
        const api: GridApi<AgeRow> = await gridsManager.createGridAndWait(
            'grid1',
            optsFor(['equals', MULTIPLE_OF_AGE, STRICTLY_BETWEEN])
        );

        const filter = await ColumnFilterHarness.open(api, 'age');
        await filter.selectOperator('Strictly between');
        await filter.setNumber(26, 0);
        await filter.setNumber(35, 1);
        await waitFor(() => expect(api.getColumnFilterModel('age')).not.toBeNull());

        api.setGridOption('columnDefs', optsFor(['equals', MULTIPLE_OF_AGE]).columnDefs);
        await waitFor(() => expect(filter.operatorSelectValue()).toBe('Equals'));

        expect(await filter.operatorOptions()).toEqual(['Equals', 'Multiple of']);
        // The UI must not be left reading as an applied `Equals 26` while the grid is unfiltered.
        await new FilterDom(api, 'withdrawn option and its values', { colId: 'age' }).checkFilterDom(`
            COLUMN FILTER
            operator: "Equals"
            input: "" ⟨Filter...⟩
            model: null
        `);
        await new GridRows(api, 'unfiltered once the option is withdrawn').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 age:25
            ├── LEAF id:1 age:40
            ├── LEAF id:2 age:28
            └── LEAF id:3 age:33
        `);
    });
});

describe('Column filter — an invalid custom option', () => {
    const gridsManager = new TestGridsManager({
        modules: [NumberFilterModule, ColumnMenuModule, ClientSideRowModelModule],
    });

    beforeAll(() => {
        setupAgTestIds();
        installFilterLayoutMock();
    });
    afterAll(() => uninstallFilterLayoutMock());
    afterEach(() => {
        gridsManager.reset();
        vi.restoreAllMocks();
        enableDevValidations({ throwOn: ALL_SEVERITIES });
    });

    test('is dropped, leaving every other option usable', async () => {
        // Deliberate: the option is missing `predicate`/`test`, which triggers warning #72.
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [72] });
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

        const api: GridApi<AgeRow> = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'age',
                    filter: 'agNumberColumnFilter',
                    filterParams: {
                        filterOptions: ['equals', NO_PREDICATE_OPTION, MULTIPLE_OF_AGE],
                        debounceMs: 0,
                        maxNumConditions: 1,
                    },
                },
            ],
            rowData: [{ age: 25 }, { age: 40 }, { age: 28 }, { age: 33 }],
        });

        // The unusable option goes; the ones the user can actually filter with stay.
        const filter = await ColumnFilterHarness.open(api, 'age');
        expect(warnSpy.mock.calls.flat().join(' ')).toContain('warning #72');
        expect(await filter.operatorOptions()).toEqual(['Equals', 'Multiple of']);

        await filter.selectOperator('Multiple of');
        await filter.setNumber(5, 0);
        await asyncSetTimeout(0);
        await new GridRows(api, 'valid option still filters').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 age:25
            └── LEAF id:1 age:40
        `);
    });

    test('is not defaulted to when it is listed first, as the dropdown never offers it', async () => {
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [72] });
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

        const api: GridApi<AgeRow> = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'age',
                    filter: 'agNumberColumnFilter',
                    filterParams: {
                        filterOptions: [NO_PREDICATE_OPTION, 'equals', MULTIPLE_OF_AGE],
                        debounceMs: 0,
                        maxNumConditions: 1,
                    },
                },
            ],
            rowData: [{ age: 25 }, { age: 40 }, { age: 28 }, { age: 33 }],
        });

        const filter = await ColumnFilterHarness.open(api, 'age');
        expect(warnSpy.mock.calls.flat().join(' ')).toContain('warning #72');
        expect(await filter.operatorOptions()).toEqual(['Equals', 'Multiple of']);
        // The first option the user can actually pick is what the condition starts on.
        expect(filter.operatorSelectValue()).toBe('Equals');

        await filter.setNumber(40, 0);
        await asyncSetTimeout(0);
        await new GridRows(api, 'the defaulted option filters').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:1 age:40
        `);
    });

    test('is not defaulted to by `defaultOption` either, which names an option the dropdown lacks', async () => {
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [72] });
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

        const api: GridApi<AgeRow> = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'age',
                    filter: 'agNumberColumnFilter',
                    filterParams: {
                        filterOptions: ['equals', NO_PREDICATE_OPTION, MULTIPLE_OF_AGE],
                        defaultOption: 'noPredicate',
                        debounceMs: 0,
                        maxNumConditions: 1,
                    },
                },
            ],
            rowData: [{ age: 25 }, { age: 40 }, { age: 28 }, { age: 33 }],
        });

        const filter = await ColumnFilterHarness.open(api, 'age');
        expect(await filter.operatorOptions()).toEqual(['Equals', 'Multiple of']);
        expect(filter.operatorSelectValue()).toBe('Equals');

        // Only the rejected option is reported; substituting the default it named needs no warning of its own.
        const warnings = warnSpy.mock.calls.map((call) => call.map(String).join(' ')).join('\n');
        expect(warnings).toContain('warning #72');
        expect(warnings).not.toContain('`noPredicate`');

        await filter.setNumber(40, 0);
        await asyncSetTimeout(0);
        await new GridRows(api, 'the fallback option filters').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:1 age:40
        `);
    });

    test('a model naming it is cleared, as nothing can show or evaluate that condition', async () => {
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [72] });
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

        const api: GridApi<AgeRow> = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'age',
                    filter: 'agNumberColumnFilter',
                    filterParams: { filterOptions: ['equals', NO_PREDICATE_OPTION], debounceMs: 0 },
                },
            ],
            rowData: [{ age: 25 }, { age: 40 }, { age: null as any }],
        });

        await api.setColumnFilterModel('age', { filterType: 'number', type: 'noPredicate', filter: 5 });
        api.onFilterChanged();
        await asyncSetTimeout(0);

        expect(warnSpy.mock.calls.flat().join(' ')).toContain('warning #72');
        expect(api.getColumnFilterModel('age')).toBeNull();
        // The blank row proves the condition is gone: an not evaluatable option hides blanks while it survives.
        await new GridRows(api, 'unfiltered - the option was dropped').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 age:25
            ├── LEAF id:1 age:40
            └── LEAF id:2 age:null
        `);
    });
});

const EDGE_KEY_ROWS: AgeRow[] = [{ age: 25 }, { age: 40 }, { age: 28 }];

/** `toString` and `constructor` both resolve on any prototype-bearing lookup table. */
const TO_STRING_OPTION: IFilterOptionDef = {
    displayKey: 'toString',
    displayName: 'Even Numbers',
    numberOfInputs: 0,
    predicate: (_values, cellValue) => cellValue != null && cellValue % 2 === 0,
};

const CONSTRUCTOR_OPTION: IFilterOptionDef = {
    displayKey: 'constructor',
    displayName: 'Over',
    numberOfInputs: 1,
    predicate: ([value], cellValue) => cellValue != null && cellValue > value,
};

const EDGE_KEY_OPTS: GridOptions<AgeRow> = {
    columnDefs: [
        {
            field: 'age',
            filter: 'agNumberColumnFilter',
            filterParams: {
                filterOptions: ['equals', TO_STRING_OPTION, CONSTRUCTOR_OPTION],
                debounceMs: 0,
                maxNumConditions: 1,
            },
        },
    ],
    rowData: EDGE_KEY_ROWS,
};

describe('Column filter — a built-in option the filter cannot evaluate', () => {
    const gridsManager = new TestGridsManager({
        modules: [TextFilterModule, ColumnMenuModule, ClientSideRowModelModule],
    });

    beforeAll(() => {
        setupAgTestIds();
        installFilterLayoutMock();
    });
    afterAll(() => uninstallFilterLayoutMock());
    afterEach(() => {
        gridsManager.reset();
        vi.restoreAllMocks();
        enableDevValidations({ throwOn: ALL_SEVERITIES });
    });

    const createGrid = (filterOptions: (string | IFilterOptionDef)[]) =>
        gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'athlete',
                    filter: 'agTextColumnFilter',
                    filterParams: { filterOptions, debounceMs: 0, maxNumConditions: 1 },
                },
            ],
            rowData: [{ athlete: 'Bolt' }, { athlete: 'Ng' }],
        } as GridOptions);

    // The option is offered as configured: only a `textMatcher` or a `predicate` can say what it means,
    // and either may supply one, so it is the evaluation with neither that reports.
    test('an option belonging to another filter type is offered, and reported when it is evaluated', async () => {
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [76] });
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

        const api: GridApi = await createGrid(['contains', 'inRange']);
        const filter = await ColumnFilterHarness.open(api, 'athlete');
        expect(await filter.operatorOptions()).toEqual(['Contains', 'Between']);
        expect(warnSpy).not.toHaveBeenCalled();

        await filter.selectOperator('Between');
        await filter.setText('A', 0);
        await filter.setText('Z', 1);
        await asyncSetTimeout(0);

        expect(api.getColumnFilterModel('athlete')).toEqual({
            filterType: 'text',
            type: 'inRange',
            filter: 'A',
            filterTo: 'Z',
        });
        await new GridRows(api, 'a text `inRange` the matcher cannot answer').check(`
            ROOT id:ROOT_NODE_ID
        `);
        const warnings = warnSpy.mock.calls.map((call) => call.map(String).join(' ')).join('\n');
        expect(warnings).toContain('warning #76');
        expect(warnings).toContain('inRange');
    });

    test('a relative date range on a text filter is offered with no inputs, and reported the same way', async () => {
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [76] });
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

        const api: GridApi = await createGrid(['contains', 'lastYear']);
        const filter = await ColumnFilterHarness.open(api, 'athlete');

        await filter.selectOperator('Last Year');
        await asyncSetTimeout(0);

        expect(filter.inputs('text')).toEqual([]);
        expect(api.getColumnFilterModel('athlete')).toEqual({ filterType: 'text', type: 'lastYear' });
        await new GridRows(api, 'a text `lastYear` the matcher cannot answer').check(`
            ROOT id:ROOT_NODE_ID
        `);
        const warnings = warnSpy.mock.calls.map((call) => call.map(String).join(' ')).join('\n');
        expect(warnings).toContain('warning #76');
        expect(warnings).toContain('lastYear');
    });

    test('a `textMatcher` answering the key is what makes it usable, and nothing is reported', async () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

        const filterParams: ITextFilterParams = {
            filterOptions: ['contains', 'lessThan'],
            textMatcher: ({ filterOption, value, filterText }) =>
                filterOption === 'lessThan' ? value < filterText! : value.includes(filterText!),
            debounceMs: 0,
            maxNumConditions: 1,
        };
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'athlete', filter: 'agTextColumnFilter', filterParams }],
            rowData: [{ athlete: 'Bolt' }, { athlete: 'Ng' }],
        } as GridOptions);

        const filter = await ColumnFilterHarness.open(api, 'athlete');
        await filter.selectOperator('Less than');
        await filter.setText('c', 0);
        await asyncSetTimeout(0);

        await new GridRows(api, 'a text `lessThan` the matcher does answer').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 athlete:"Bolt"
        `);
        expect(warnSpy).not.toHaveBeenCalled();
    });

    test('a Custom Filter Option supplying the same key defines the evaluation', async () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

        const api: GridApi = await createGrid([
            'contains',
            {
                displayKey: 'inRange',
                displayName: 'Between',
                numberOfInputs: 2,
                predicate: ([from, to], cellValue) => cellValue > from && cellValue < to,
            },
        ]);

        expect(warnSpy).not.toHaveBeenCalled();
        const filter = await ColumnFilterHarness.open(api, 'athlete');
        expect(await filter.operatorOptions()).toEqual(['Contains', 'Between']);
    });
});

describe('Custom filter option — a `displayKey` shadowing `Object.prototype`', () => {
    const gridsManager = new TestGridsManager({
        modules: [NumberFilterModule, ColumnMenuModule, AdvancedFilterModule, ClientSideRowModelModule],
    });

    beforeAll(() => {
        setupAgTestIds();
        installFilterLayoutMock();
    });
    afterAll(() => uninstallFilterLayoutMock());
    afterEach(() => gridsManager.reset());

    test('the column filter offers it and filters with it', async () => {
        const api: GridApi<AgeRow> = await gridsManager.createGridAndWait('grid1', EDGE_KEY_OPTS);

        const filter = await ColumnFilterHarness.open(api, 'age');
        expect(await filter.operatorOptions()).toEqual(['Equals', 'Even Numbers', 'Over']);

        await filter.selectOperator('Even Numbers');
        await asyncSetTimeout(0);
        await new GridRows(api, 'even ages via a `toString` key').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:1 age:40
            └── LEAF id:2 age:28
        `);
        expect(api.getColumnFilterModel('age')).toEqual({ filterType: 'number', type: 'toString' });

        await filter.selectOperator('Over');
        await filter.setNumber(26, 0);
        await waitFor(() =>
            expect(api.getColumnFilterModel('age')).toEqual({
                filterType: 'number',
                type: 'constructor',
                filter: 26,
            })
        );
    });

    test('the Advanced Filter resolves it as an operator rather than an inherited member', async () => {
        const api: GridApi<AgeRow> = await gridsManager.createGridAndWait('grid1', {
            ...EDGE_KEY_OPTS,
            enableAdvancedFilter: true,
        });

        await AdvancedFilterHarness.get(api).applyExpression('[Age] Even Numbers');
        await asyncSetTimeout(0);
        expect(api.getAdvancedFilterModel()).toEqual({ filterType: 'number', colId: 'age', type: 'toString' });
        await new GridRows(api, 'even ages through the Advanced Filter').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:1 age:40
            └── LEAF id:2 age:28
        `);
    });

    test('an operator name that is only an inherited member is rejected', async () => {
        const api: GridApi<AgeRow> = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'age', filter: 'agNumberColumnFilter' }],
            rowData: EDGE_KEY_ROWS,
            enableAdvancedFilter: true,
        });

        await AdvancedFilterHarness.get(api).applyExpression('[Age] hasOwnProperty 25');
        await asyncSetTimeout(0);
        expect(api.getAdvancedFilterModel()).toBeNull();
        await new GridRows(api, 'unfiltered - the expression is invalid').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 age:25
            ├── LEAF id:1 age:40
            └── LEAF id:2 age:28
        `);
    });
});

describe('Grid state — a custom option round-trips through `getState`', () => {
    const gridsManager = new TestGridsManager({
        modules: [
            TextFilterModule,
            NumberFilterModule,
            ColumnMenuModule,
            AdvancedFilterModule,
            GridStateModule,
            ClientSideRowModelModule,
        ],
    });

    beforeAll(() => {
        setupAgTestIds();
        installFilterLayoutMock();
    });
    afterAll(() => uninstallFilterLayoutMock());
    afterEach(() => gridsManager.reset());

    test('a column filter restores the values a custom option saved', async () => {
        const api: GridApi<Row> = await gridsManager.createGridAndWait('grid1', OPTS);

        await api.setColumnFilterModel('athlete', {
            filterType: 'text',
            type: 'anyOfTwo',
            filter: 'Bolt',
            filterTo: 'Ada',
        });
        api.onFilterChanged();
        await asyncSetTimeout(0);

        const initialState = api.getState();
        expect(initialState.filter?.filterModel).toEqual({
            athlete: { filterType: 'text', type: 'anyOfTwo', filter: 'Bolt', filterTo: 'Ada' },
        });

        const restored: GridApi<Row> = await gridsManager.createGridAndWait('grid2', { ...OPTS, initialState });
        expect(restored.getState().filter).toEqual(initialState.filter);
        await new GridRows(restored, 'restored from state').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 athlete:"Bolt" age:25
            └── LEAF id:2 athlete:"Ada" age:28
        `);

        const filter = await ColumnFilterHarness.open(restored, 'athlete');
        // The trailing empty input is the second, unset condition the filter always offers.
        expect(filter.inputs('text').map((input) => input.value)).toEqual(['Bolt', 'Ada', '']);
    });

    test('an Advanced Filter restores every operand it saved', async () => {
        const api: GridApi<Row> = await gridsManager.createGridAndWait('grid1', {
            ...OPTS,
            enableAdvancedFilter: true,
        });

        const advancedFilterModel = {
            filterType: 'text',
            colId: 'athlete',
            type: 'anyOfTwo',
            filter: 'Bolt',
            filterTo: 'Ada',
        } as const;
        api.setAdvancedFilterModel(advancedFilterModel as any);
        await asyncSetTimeout(0);

        const initialState = api.getState();
        expect(initialState.filter?.advancedFilterModel).toEqual(advancedFilterModel);

        const restored: GridApi<Row> = await gridsManager.createGridAndWait('grid2', {
            ...OPTS,
            enableAdvancedFilter: true,
            initialState,
        });
        expect(restored.getState().filter?.advancedFilterModel).toEqual(advancedFilterModel);
        await new GridRows(restored, 'advanced filter restored from state').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 athlete:"Bolt" age:25
            └── LEAF id:2 athlete:"Ada" age:28
        `);
    });
});

describe('Column filter — the boolean cell data type options', () => {
    const gridsManager = new TestGridsManager({
        modules: [TextFilterModule, ColumnMenuModule, ClientSideRowModelModule],
    });

    beforeAll(() => {
        setupAgTestIds();
        installFilterLayoutMock();
    });
    afterAll(() => uninstallFilterLayoutMock());
    afterEach(() => gridsManager.reset());

    const createGrid = () =>
        gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'won', cellDataType: 'boolean', filter: true }],
            rowData: [{ won: true }, { won: false }, { won: null }],
        } as GridOptions);

    // `True` is supplied as a custom option whose predicate returns the cell value itself, so a blank row
    // hands back `null` - which must read as "did not pass", not as a condition filtering on nothing.
    test('a blank value passes neither `True` nor `False`', async () => {
        const api: GridApi = await createGrid();

        const filter = await ColumnFilterHarness.open(api, 'won');
        await filter.selectOperator('True');
        await asyncSetTimeout(0);

        await new GridRows(api, 'true excludes the blank').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 won:true
        `);

        await filter.selectOperator('False');
        await asyncSetTimeout(0);

        await new GridRows(api, 'false excludes the blank').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:1 won:false
        `);
    });
});

describe('Column filter — a custom option whose `displayKey` is a built-in key', () => {
    const gridsManager = new TestGridsManager({
        modules: [NumberFilterModule, ColumnMenuModule, ClientSideRowModelModule],
    });

    beforeAll(() => {
        setupAgTestIds();
        installFilterLayoutMock();
    });
    afterAll(() => uninstallFilterLayoutMock());
    afterEach(() => gridsManager.reset());

    /** `equals` redefined for this column: the built-in of the same key is replaced, not offered beside it. */
    const EQUALS_TENS: IFilterOptionDef = {
        displayKey: 'equals',
        displayName: 'Equals (tens)',
        numberOfInputs: 1,
        predicate: ([value], cellValue) => cellValue != null && Math.floor(cellValue / 10) === value,
    };

    const createGrid = (filterOptions: (string | IFilterOptionDef)[]) =>
        gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'age',
                    filter: 'agNumberColumnFilter',
                    filterParams: { filterOptions, debounceMs: 0, maxNumConditions: 1 },
                },
            ],
            rowData: [{ age: 25 }, { age: 40 }, { age: 28 }, { age: 33 }],
        } as GridOptions);

    test('replaces it in the dropdown rather than appearing twice', async () => {
        const api: GridApi = await createGrid(['equals', EQUALS_TENS, 'greaterThan']);

        const filter = await ColumnFilterHarness.open(api, 'age');
        expect(await filter.operatorOptions()).toEqual(['Equals (tens)', 'Greater than']);
    });

    test('keeps the place the key was first listed in, whichever form declared it', async () => {
        const api: GridApi = await createGrid(['greaterThan', EQUALS_TENS, 'equals']);

        const filter = await ColumnFilterHarness.open(api, 'age');
        expect(await filter.operatorOptions()).toEqual(['Greater than', 'Equals (tens)']);
    });

    test('is the one that evaluates, so the built-in behaviour is gone', async () => {
        const api: GridApi = await createGrid(['equals', EQUALS_TENS]);

        const filter = await ColumnFilterHarness.open(api, 'age');
        await filter.setNumber(2, 0);
        await asyncSetTimeout(0);

        // The built-in `equals` would match nothing; the replacement matches every age in the twenties.
        await new FilterDom(api, 'the replacing option is the one selected', { colId: 'age' }).checkFilterDom(`
            COLUMN FILTER
            operator: "Equals (tens)"
            input: "2"
            model:
              filterType: "number"
              type: "equals"
              filter: 2
        `);
        await new GridRows(api, 'the custom predicate decides').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 age:25
            └── LEAF id:2 age:28
        `);
    });
});

describe('Column filter — a `defaultOption` the dropdown does not offer', () => {
    const gridsManager = new TestGridsManager({
        modules: [NumberFilterModule, ColumnMenuModule, ClientSideRowModelModule],
    });

    beforeAll(() => {
        setupAgTestIds();
        installFilterLayoutMock();
    });
    afterAll(() => uninstallFilterLayoutMock());
    afterEach(() => {
        gridsManager.reset();
        vi.restoreAllMocks();
        enableDevValidations({ throwOn: ALL_SEVERITIES });
    });

    test('falls back to the first offered option', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'age',
                    filter: 'agNumberColumnFilter',
                    filterParams: {
                        filterOptions: ['greaterThan', 'equals'],
                        defaultOption: 'lessThan',
                        debounceMs: 0,
                    },
                },
            ],
            rowData: [{ age: 25 }, { age: 40 }],
        } as GridOptions);

        const filter = await ColumnFilterHarness.open(api, 'age');
        expect(filter.operatorSelectValue()).toBe('Greater than');
        await new FilterDom(api, 'fallen back to the first offered option', { colId: 'age' }).checkFilterDom(`
            COLUMN FILTER
            operator: "Greater than"
            input: "" ⟨Filter...⟩
            model: null
        `);
    });
});
