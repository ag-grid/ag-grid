import type { GridApi, GridOptions, IFilterOptionDef } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    DateFilterModule,
    LocaleModule,
    NumberFilterModule,
    TextFilterModule,
    enableDevValidations,
    setupAgTestIds,
} from 'ag-grid-community';
import { AdvancedFilterModule } from 'ag-grid-enterprise';

import {
    ALL_SEVERITIES,
    AdvancedFilterBuilderHarness,
    AdvancedFilterHarness,
    ColumnFilterHarness,
    FilterDom,
    GridRows,
    TestGridsManager,
    asyncSetTimeout,
    hasVisibleInvalidIcon,
    installFilterLayoutMock,
    uninstallFilterLayoutMock,
} from '../../test-utils';

/**
 * Custom filter options from `colDef.filterParams.filterOptions` in the Advanced Filter: the operator
 * list, the 0/1/2-input expression grammar, the model round-trip, and evaluation matching the column
 * filter. The operator suggestion list is a VirtualList, so `installFilterLayoutMock` is required.
 */
interface Row {
    athlete: string;
    age: number | null;
}

const ROW_DATA: Row[] = [
    { athlete: 'Bolt', age: 25 },
    { athlete: 'Ng', age: 40 },
    { athlete: 'Ada', age: 28 },
    { athlete: 'Wei', age: null },
];

const STARTS_A: IFilterOptionDef = {
    displayKey: 'startsA',
    displayName: 'Starts With A',
    numberOfInputs: 0,
    predicate: (_values, cellValue) => cellValue != null && cellValue.indexOf('A') === 0,
};

const REGEXP: IFilterOptionDef = {
    displayKey: 'regexp',
    displayName: 'Regular Expression',
    numberOfInputs: 1,
    predicate: ([filterValue], cellValue) => cellValue != null && new RegExp(filterValue, 'i').test(cellValue),
};

/** Comparison-based, so it serves the text and number columns alike. */
const BETWEEN_EXCLUSIVE: IFilterOptionDef = {
    displayKey: 'betweenExclusive',
    displayName: 'Between (Exclusive)',
    numberOfInputs: 2,
    predicate: ([from, to], cellValue) => cellValue != null && from < cellValue && to > cellValue,
};

const EVEN_NUMBERS: IFilterOptionDef = {
    displayKey: 'evenNumbers',
    displayName: 'Even Numbers',
    numberOfInputs: 0,
    predicate: (_values, cellValue) => cellValue != null && cellValue % 2 === 0,
};

const AGE_5_YEARS_AGO: IFilterOptionDef = {
    displayKey: 'age5YearsAgo',
    displayName: 'Age 5 Years Ago',
    numberOfInputs: 1,
    predicate: ([filterValue], cellValue) => cellValue != null && cellValue - 5 === filterValue,
};

const DATE_BETWEEN_EXCLUSIVE: IFilterOptionDef = {
    displayKey: 'betweenExclusive',
    displayName: 'Between (Exclusive)',
    numberOfInputs: 2,
    predicate: ([from, to], cellValue) => {
        if (cellValue == null) {
            return false;
        }
        const cellDate = new Date(cellValue);
        return cellDate > from && cellDate < to;
    },
};

const ATHLETE_FILTER_PARAMS = {
    filterOptions: ['contains', STARTS_A, REGEXP, BETWEEN_EXCLUSIVE],
    debounceMs: 0,
};
const AGE_FILTER_PARAMS = {
    filterOptions: ['equals', EVEN_NUMBERS, AGE_5_YEARS_AGO, BETWEEN_EXCLUSIVE],
    debounceMs: 0,
};

/** Takes any row shape carrying an `athlete`, as the boolean-column grids declare their own. */
const filteredAthletes = (api: GridApi<{ athlete: string }>): (string | undefined)[] => {
    const athletes: (string | undefined)[] = [];
    api.forEachNodeAfterFilter((node) => athletes.push(node.data?.athlete));
    return athletes;
};

const OPTS: GridOptions<Row> = {
    columnDefs: [
        { field: 'athlete', filter: 'agTextColumnFilter', filterParams: ATHLETE_FILTER_PARAMS },
        { field: 'age', filter: 'agNumberColumnFilter', filterParams: AGE_FILTER_PARAMS },
    ],
    rowData: ROW_DATA,
    enableAdvancedFilter: true,
};

describe('Advanced Filter — custom filter options', () => {
    const gridsManager = new TestGridsManager({
        modules: [
            TextFilterModule,
            NumberFilterModule,
            DateFilterModule,
            LocaleModule,
            AdvancedFilterModule,
            ClientSideRowModelModule,
        ],
    });

    beforeAll(() => {
        setupAgTestIds();
        installFilterLayoutMock();
    });
    afterAll(() => uninstallFilterLayoutMock());
    afterEach(() => gridsManager.reset());

    test('the operator list offers the configured options by display name, in order', async () => {
        const api = await gridsManager.createGridAndWait('grid1', OPTS);
        const af = AdvancedFilterHarness.get(api);

        await af.type('[Athlete] ');
        expect(af.autocompleteEntries()).toEqual([
            'contains',
            'Starts With A',
            'Regular Expression',
            'Between (Exclusive)',
        ]);

        await af.type('[Age] ');
        expect(af.autocompleteEntries()).toEqual(['=', 'Even Numbers', 'Age 5 Years Ago', 'Between (Exclusive)']);
    });

    test('a column without custom options still offers only its default operators', async () => {
        const api = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'athlete', filter: 'agTextColumnFilter' }],
            rowData: ROW_DATA,
            enableAdvancedFilter: true,
        });
        const af = AdvancedFilterHarness.get(api);

        await af.type('[Athlete] ');
        expect(af.autocompleteEntries()).toEqual([
            'contains',
            'does not contain',
            'equals',
            'does not equal',
            'begins with',
            'ends with',
            'is blank',
            'is not blank',
        ]);
    });

    test('completing a two-input operator opens the operand bracket, and the quote when values are quoted', async () => {
        const api = await gridsManager.createGridAndWait('grid1', OPTS);
        const af = AdvancedFilterHarness.get(api);

        await af.type('[Age] Bet');
        await asyncSetTimeout(0);
        await af.tabComplete();
        await asyncSetTimeout(0);
        expect(af.value).toBe('[Age] Between (Exclusive) (');
        expect(af.input.selectionStart).toBe(af.value.length);

        await af.type('[Athlete] Bet');
        await asyncSetTimeout(0);
        await af.tabComplete();
        await asyncSetTimeout(0);
        expect(af.value).toBe('[Athlete] Between (Exclusive) ("');
        expect(af.input.selectionStart).toBe(af.value.length);
    });

    test('a zero-input option filters through its predicate and needs no value', async () => {
        const api = await gridsManager.createGridAndWait('grid1', OPTS);

        await AdvancedFilterHarness.get(api).applyExpression('[Age] Even Numbers');
        await asyncSetTimeout(0);

        expect(api.getAdvancedFilterModel()).toEqual({
            filterType: 'number',
            colId: 'age',
            type: 'evenNumbers',
        });
        await new GridRows(api, 'even ages').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:1 athlete:"Ng" age:40
            └── LEAF id:2 athlete:"Ada" age:28
        `);
    });

    test('a one-input option reports its value in `filter`, as a built-in does', async () => {
        const api = await gridsManager.createGridAndWait('grid1', OPTS);

        await AdvancedFilterHarness.get(api).applyExpression('[Age] Age 5 Years Ago 20');
        await asyncSetTimeout(0);

        expect(api.getAdvancedFilterModel()).toEqual({
            filterType: 'number',
            colId: 'age',
            type: 'age5YearsAgo',
            filter: 20,
        });
        await new GridRows(api, 'age 5 years ago 20').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 athlete:"Bolt" age:25
        `);
    });

    test('a two-input option takes both values as `(from, to)`, with the first also in `filter`', async () => {
        const api = await gridsManager.createGridAndWait('grid1', OPTS);

        await AdvancedFilterHarness.get(api).applyExpression('[Age] Between (Exclusive) (25, 40)');
        await asyncSetTimeout(0);

        expect(api.getAdvancedFilterModel()).toEqual({
            filterType: 'number',
            colId: 'age',
            type: 'betweenExclusive',
            filter: 25,
            filterTo: 40,
        });
        await new GridRows(api, 'number between exclusive').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:2 athlete:"Ada" age:28
        `);
    });

    test('two-input text values are quoted', async () => {
        const api = await gridsManager.createGridAndWait('grid1', OPTS);

        await AdvancedFilterHarness.get(api).applyExpression('[Athlete] Between (Exclusive) ("Ada", "Ng")');
        await asyncSetTimeout(0);

        expect(api.getAdvancedFilterModel()).toEqual({
            filterType: 'text',
            colId: 'athlete',
            type: 'betweenExclusive',
            filter: 'Ada',
            filterTo: 'Ng',
        });
        await new GridRows(api, 'text between exclusive').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 athlete:"Bolt" age:25
        `);
    });

    test('two-input date values are quoted, and reach the predicate as dates', async () => {
        const api = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'date',
                    filter: 'agDateColumnFilter',
                    filterParams: { filterOptions: ['equals', DATE_BETWEEN_EXCLUSIVE], debounceMs: 0 },
                },
            ],
            rowData: [{ date: '2012-08-11' }, { date: '2012-08-20' }, { date: '2012-08-31' }],
            enableAdvancedFilter: true,
        });

        await AdvancedFilterHarness.get(api).applyExpression('[Date] Between (Exclusive) ("2012-08-12", "2012-08-30")');
        await asyncSetTimeout(0);

        expect(api.getAdvancedFilterModel()).toEqual({
            filterType: 'dateString',
            colId: 'date',
            type: 'betweenExclusive',
            filter: '2012-08-12',
            filterTo: '2012-08-30',
        });
        await new GridRows(api, 'date between exclusive').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:1 date:"2012-08-20"
        `);
    });

    test('a one-input text option quotes its value', async () => {
        const api = await gridsManager.createGridAndWait('grid1', OPTS);

        await AdvancedFilterHarness.get(api).applyExpression('[Athlete] Regular Expression "^(A|B)"');
        await asyncSetTimeout(0);

        expect(api.getAdvancedFilterModel()).toEqual({
            filterType: 'text',
            colId: 'athlete',
            type: 'regexp',
            filter: '^(A|B)',
        });
        await new GridRows(api, 'regexp filtered').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 athlete:"Bolt" age:25
            └── LEAF id:2 athlete:"Ada" age:28
        `);
    });

    test('a zero-input text option filters without a value', async () => {
        const api = await gridsManager.createGridAndWait('grid1', OPTS);

        await AdvancedFilterHarness.get(api).applyExpression('[Athlete] Starts With A');
        await asyncSetTimeout(0);

        expect(api.getAdvancedFilterModel()).toEqual({
            filterType: 'text',
            colId: 'athlete',
            type: 'startsA',
        });
        await new GridRows(api, 'starts with A').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:2 athlete:"Ada" age:28
        `);
    });

    test('an option is also accepted by its displayKey, and rewritten to the display name', async () => {
        const api = await gridsManager.createGridAndWait('grid1', OPTS);
        const af = AdvancedFilterHarness.get(api);

        await af.applyExpression('[Age] betweenExclusive (25, 40)');
        await asyncSetTimeout(0);

        expect(af.value).toBe('[Age] Between (Exclusive) (25, 40)');
        expect(api.getAdvancedFilterModel()).toEqual({
            filterType: 'number',
            colId: 'age',
            type: 'betweenExclusive',
            filter: 25,
            filterTo: 40,
        });
    });

    test('a model naming an option nothing resolves keeps its values in the editor to be corrected', async () => {
        const api = await gridsManager.createGridAndWait('grid1', OPTS);
        const af = AdvancedFilterHarness.get(api);

        api.setAdvancedFilterModel({ filterType: 'number', colId: 'age', type: 'evenNumbrs', filter: 25 });
        await asyncSetTimeout(0);
        expect(af.value).toBe('[Age] evenNumbrs 25');

        api.setAdvancedFilterModel({
            filterType: 'number',
            colId: 'age',
            type: 'betweenExclusiv',
            filter: 25,
            filterTo: 40,
        });
        await asyncSetTimeout(0);
        expect(af.value).toBe('[Age] betweenExclusiv (25, 40)');
    });

    test('an error at the end reads the same whichever spelling of the option was typed', async () => {
        // A key longer than the name it is shown as, so its rewrite shortens everything after it.
        const longKey: IFilterOptionDef = { ...BETWEEN_EXCLUSIVE, displayKey: 'betweenExclusiveLongKey' };
        const api = await gridsManager.createGridAndWait('grid1', {
            ...OPTS,
            columnDefs: [
                { field: 'athlete', filter: 'agTextColumnFilter', filterParams: ATHLETE_FILTER_PARAMS },
                {
                    field: 'age',
                    filter: 'agNumberColumnFilter',
                    filterParams: { filterOptions: ['equals', longKey], debounceMs: 0 },
                },
            ],
        });
        const af = AdvancedFilterHarness.get(api);

        await af.type('[Age] betweenExclusiveLongKey (30');
        await af.pressKey('Escape');
        const byKey = af.input.validationMessage;

        await af.type('[Age] Between (Exclusive) (30');
        await af.pressKey('Escape');
        expect(byKey).toBe(af.input.validationMessage);
        expect(byKey).toBe('Expression has an error. Value is missing at end of expression.');
    });

    test('every condition of a join written with displayKeys is rewritten and applied', async () => {
        const api = await gridsManager.createGridAndWait('grid1', OPTS);
        const af = AdvancedFilterHarness.get(api);

        await af.applyExpression('[Age] evenNumbers AND [Athlete] startsA');
        await asyncSetTimeout(0);

        expect(af.value).toBe('[Age] Even Numbers AND [Athlete] Starts With A');
        expect(api.getAdvancedFilterModel()).toEqual({
            filterType: 'join',
            type: 'AND',
            conditions: [
                { filterType: 'number', colId: 'age', type: 'evenNumbers' },
                { filterType: 'text', colId: 'athlete', type: 'startsA' },
            ],
        });
        await new GridRows(api, 'join of displayKeys').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:2 athlete:"Ada" age:28
        `);
    });

    test('a custom option reusing a built-in key replaces it, as it does in the column filter', async () => {
        // Deliberately inverted, so whichever implementation runs is unambiguous.
        const overrideEquals: IFilterOptionDef = {
            displayKey: 'equals',
            displayName: 'Equals',
            predicate: ([filterValue], cellValue) => cellValue != null && cellValue !== filterValue,
        };
        const api = await gridsManager.createGridAndWait('grid1', {
            ...OPTS,
            columnDefs: [
                {
                    field: 'athlete',
                    filter: 'agTextColumnFilter',
                    filterParams: { filterOptions: [overrideEquals], debounceMs: 0 },
                },
                { field: 'age', filter: 'agNumberColumnFilter', filterParams: AGE_FILTER_PARAMS },
            ],
        });

        await AdvancedFilterHarness.get(api).applyExpression('[Athlete] Equals "Bolt"');
        await asyncSetTimeout(0);
        // The override inverts `equals`, so Bolt is the one row it excludes.
        await new GridRows(api, 'a custom option replacing a built-in key').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:1 athlete:"Ng" age:40
            ├── LEAF id:2 athlete:"Ada" age:28
            └── LEAF id:3 athlete:"Wei" age:null
        `);
    });

    test('a built-in key listed beside a custom option of that key is one suggestion, not two', async () => {
        const overrideEquals: IFilterOptionDef = {
            displayKey: 'equals',
            displayName: 'Equals',
            predicate: ([filterValue], cellValue) => cellValue != null && cellValue !== filterValue,
        };
        const api = await gridsManager.createGridAndWait('grid1', {
            ...OPTS,
            columnDefs: [
                {
                    field: 'athlete',
                    filter: 'agTextColumnFilter',
                    filterParams: { filterOptions: ['equals', overrideEquals, 'contains'], debounceMs: 0 },
                },
                { field: 'age', filter: 'agNumberColumnFilter', filterParams: AGE_FILTER_PARAMS },
            ],
        });
        await asyncSetTimeout(0);

        // Both entries resolve to `equals`, so two rows would be indistinguishable and only one selectable.
        const af = AdvancedFilterHarness.get(api);
        await af.type('[Athlete] ');
        expect(af.autocompleteEntries()).toEqual(['Equals', 'contains']);
    });

    test('a custom option on a boolean column takes a value, which the built-in operators never do', async () => {
        const matchesLabel: IFilterOptionDef = {
            displayKey: 'matchesLabel',
            displayName: 'Reads As',
            numberOfInputs: 1,
            predicate: ([filterValue], cellValue) => (cellValue ? 'won' : 'lost') === filterValue,
        };
        const api = await gridsManager.createGridAndWait<{ athlete: string; won: boolean }>('grid1', {
            columnDefs: [
                { field: 'athlete', filter: 'agTextColumnFilter' },
                {
                    field: 'won',
                    cellDataType: 'boolean',
                    filter: true,
                    filterParams: { filterOptions: ['true', 'false', matchesLabel], debounceMs: 0 },
                },
            ],
            rowData: [
                { athlete: 'Bolt', won: true },
                { athlete: 'Ng', won: false },
            ],
            enableAdvancedFilter: true,
        });

        const af = AdvancedFilterHarness.get(api);
        await af.type('[Won] ');
        expect(af.autocompleteEntries()).toEqual(['is true', 'is false', 'Reads As']);

        await af.applyExpression('[Won] Reads As "lost"');
        await asyncSetTimeout(0);
        // `filter` on a boolean model exists only for a custom option; nothing built in reads it.
        expect(api.getAdvancedFilterModel()).toEqual({
            filterType: 'boolean',
            colId: 'won',
            type: 'matchesLabel',
            filter: 'lost',
        });
        await new GridRows(api, 'a boolean custom option with a value').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:1 athlete:"Ng" won:false
        `);
    });

    test('a boolean column keeps every operator its data type offers', async () => {
        const api = await gridsManager.createGridAndWait<{ athlete: string; won: boolean }>('grid1', {
            columnDefs: [
                { field: 'athlete', filter: 'agTextColumnFilter' },
                // No `filterOptions` of its own, so the data type supplies `true`/`false` as object options.
                { field: 'won', cellDataType: 'boolean', filter: true },
            ],
            rowData: [
                { athlete: 'Bolt', won: true },
                { athlete: 'Ng', won: false },
            ],
            enableAdvancedFilter: true,
        });

        const af = AdvancedFilterHarness.get(api);
        // `blank`/`notBlank` are the data type's own operators, not entries in the list it injects.
        await af.type('[Won] ');
        expect(af.autocompleteEntries()).toEqual(['is true', 'is false', 'is blank', 'is not blank']);

        await af.applyExpression('[Won] is true');
        await asyncSetTimeout(0);
        await new GridRows(api, 'boolean data type option is true').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 athlete:"Bolt" won:true
        `);

        await af.applyExpression('[Won] is false');
        await asyncSetTimeout(0);
        await new GridRows(api, 'boolean data type option is false').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:1 athlete:"Ng" won:false
        `);
    });

    test('a model whose filterType does not match the column leaves its operators unchanged', async () => {
        const api = await gridsManager.createGridAndWait('grid1', OPTS);
        const af = AdvancedFilterHarness.get(api);

        // `age` is a number column, so a text model resolves text operators for it, which must not stick.
        api.setAdvancedFilterModel({ filterType: 'text', colId: 'age', type: 'contains', filter: 'x' } as any);
        await asyncSetTimeout(0);

        await af.type('[Age] ');
        expect(af.autocompleteEntries()).toEqual(['=', 'Even Numbers', 'Age 5 Years Ago', 'Between (Exclusive)']);

        await af.applyExpression('[Age] Between (Exclusive) (25, 40)');
        await asyncSetTimeout(0);
        expect(api.getAdvancedFilterModel()).toEqual({
            filterType: 'number',
            colId: 'age',
            type: 'betweenExclusive',
            filter: 25,
            filterTo: 40,
        });
    });

    test('a model set through the API renders as an expression and round-trips', async () => {
        const api = await gridsManager.createGridAndWait('grid1', OPTS);

        api.setAdvancedFilterModel({
            filterType: 'number',
            colId: 'age',
            type: 'betweenExclusive',
            filter: 25,
            filterTo: 40,
        });
        await asyncSetTimeout(0);

        expect(AdvancedFilterHarness.get(api).value).toBe('[Age] Between (Exclusive) (25, 40)');
        expect(api.getAdvancedFilterModel()).toEqual({
            filterType: 'number',
            colId: 'age',
            type: 'betweenExclusive',
            filter: 25,
            filterTo: 40,
        });
        await new GridRows(api, 'model applied').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:2 athlete:"Ada" age:28
        `);
    });

    test('a value supplied only in `filter` still resolves, and is reported in both slots', async () => {
        const api = await gridsManager.createGridAndWait('grid1', OPTS);
        const af = AdvancedFilterHarness.get(api);

        // A one-input option: `filter` alone is read, and reported back in both slots.
        api.setAdvancedFilterModel({ filterType: 'number', colId: 'age', type: 'age5YearsAgo', filter: 20 });
        await asyncSetTimeout(0);
        expect(af.value).toBe('[Age] Age 5 Years Ago 20');
        expect(api.getAdvancedFilterModel()).toEqual({
            filterType: 'number',
            colId: 'age',
            type: 'age5YearsAgo',
            filter: 20,
        });
        await new GridRows(api, 'one value via filter').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 athlete:"Bolt" age:25
        `);

        // A zero-input option: a value left in the model is dropped rather than carried.
        api.setAdvancedFilterModel({ filterType: 'number', colId: 'age', type: 'evenNumbers' });
        await asyncSetTimeout(0);
        expect(af.value).toBe('[Age] Even Numbers');
        expect(api.getAdvancedFilterModel()).toEqual({
            filterType: 'number',
            colId: 'age',
            type: 'evenNumbers',
        });
        await new GridRows(api, 'no values on a zero-input option').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:1 athlete:"Ng" age:40
            └── LEAF id:2 athlete:"Ada" age:28
        `);
    });

    test('a custom option combines with other conditions in a join', async () => {
        const api = await gridsManager.createGridAndWait('grid1', OPTS);

        await AdvancedFilterHarness.get(api).applyExpression(
            '([Age] Between (Exclusive) (20, 40) AND [Athlete] Starts With A)'
        );
        await asyncSetTimeout(0);

        expect(api.getAdvancedFilterModel()).toEqual({
            filterType: 'join',
            type: 'AND',
            conditions: [
                { filterType: 'number', colId: 'age', type: 'betweenExclusive', filter: 20, filterTo: 40 },
                { filterType: 'text', colId: 'athlete', type: 'startsA' },
            ],
        });
        await new GridRows(api, 'join with custom options').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:2 athlete:"Ada" age:28
        `);
    });

    test('the brackets around the two values may be omitted, on their own or within a join', async () => {
        const api = await gridsManager.createGridAndWait('grid1', OPTS);
        const af = AdvancedFilterHarness.get(api);

        await af.applyExpression('[Age] Between (Exclusive) 25, 40');
        await asyncSetTimeout(0);
        expect(api.getAdvancedFilterModel()).toEqual({
            filterType: 'number',
            colId: 'age',
            type: 'betweenExclusive',
            filter: 25,
            filterTo: 40,
        });

        await af.applyExpression('[Age] Between (Exclusive) 25, 40 AND [Athlete] Starts With A');
        await asyncSetTimeout(0);
        expect(api.getAdvancedFilterModel()).toEqual({
            filterType: 'join',
            type: 'AND',
            conditions: [
                { filterType: 'number', colId: 'age', type: 'betweenExclusive', filter: 25, filterTo: 40 },
                { filterType: 'text', colId: 'athlete', type: 'startsA' },
            ],
        });
    });

    test('the second value is required, and the brackets must be closed', async () => {
        const api = await gridsManager.createGridAndWait('grid1', OPTS);

        await AdvancedFilterHarness.get(api).applyExpression('[Age] Between (Exclusive) (25');
        await asyncSetTimeout(0);
        await new FilterDom(api, 'missing second value').checkFilterDom(`
            ADVANCED FILTER
            input: "[Age] Between (Exclusive) (25"
            valid: false — Expression has an error. Value is missing at end of expression.
            buttons: Apply ⊘ | Builder
            model: null
        `);

        await AdvancedFilterHarness.get(api).applyExpression('[Age] Between (Exclusive) (25, 40');
        await asyncSetTimeout(0);
        await new FilterDom(api, 'missing end bracket').checkFilterDom(`
            ADVANCED FILTER
            input: "[Age] Between (Exclusive) (25, 40"
            valid: false — Expression has an error. Missing end bracket at end of expression.
            buttons: Apply ⊘ | Builder
            model: null
        `);

        await AdvancedFilterHarness.get(api).applyExpression('[Age] Between (Exclusive) (25, abc)');
        await asyncSetTimeout(0);
        await new FilterDom(api, 'second value not a number').checkFilterDom(`
            ADVANCED FILTER
            input: "[Age] Between (Exclusive) (25, abc)"
            valid: false — Expression has an error. Value is not a number - abc.
            buttons: Apply ⊘ | Builder
            model: null
        `);
    });

    test('an out-of-order range is rejected, reporting what the column filter would', async () => {
        const api = await gridsManager.createGridAndWait('grid1', OPTS);

        await AdvancedFilterHarness.get(api).applyExpression('[Age] Between (Exclusive) (40, 25)');
        await asyncSetTimeout(0);
        await new FilterDom(api, 'range the wrong way round').checkFilterDom(`
            ADVANCED FILTER
            input: "[Age] Between (Exclusive) (40, 25)"
            valid: false — Expression has an error. Must be less than 25 - 40.
            buttons: Apply ⊘ | Builder
            model: null
        `);

        // Equal ends are rejected too, as the range is exclusive at both ends in the column filter.
        await AdvancedFilterHarness.get(api).applyExpression('[Age] Between (Exclusive) (25, 25)');
        await asyncSetTimeout(0);
        expect(api.getAdvancedFilterModel()).toBeNull();

        await AdvancedFilterHarness.get(api).applyExpression('[Age] Between (Exclusive) (25, 40)');
        await asyncSetTimeout(0);
        expect(api.getAdvancedFilterModel()).toEqual({
            filterType: 'number',
            colId: 'age',
            type: 'betweenExclusive',
            filter: 25,
            filterTo: 40,
        });
    });

    test('an out-of-order date range reports through the Date Filter locale key', async () => {
        const api = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'date',
                    filter: 'agDateColumnFilter',
                    filterParams: { filterOptions: ['equals', DATE_BETWEEN_EXCLUSIVE], debounceMs: 0 },
                },
            ],
            rowData: [{ date: '2012-08-11' }, { date: '2012-08-20' }],
            enableAdvancedFilter: true,
            // A date reports through `maxDateValidation`, not the numeric filters' `strictMaxValueValidation`.
            localeText: { maxDateValidation: 'Choose a date before ${variable}' },
        });

        await AdvancedFilterHarness.get(api).applyExpression('[Date] Between (Exclusive) ("2012-08-30", "2012-08-10")');
        await asyncSetTimeout(0);
        await new FilterDom(api, 'date range the wrong way round').checkFilterDom(`
            ADVANCED FILTER
            input: "[Date] Between (Exclusive) ("2012-08-30", "2012-08-10")"
            valid: false — Expression has an error. Choose a date before 2012-08-10 - "2012-08-30".
            buttons: Apply ⊘ | Builder
            model: null
        `);
    });

    test('a range supplied as strings is ordered by the operand data type, not the JavaScript type', async () => {
        const api = await gridsManager.createGridAndWait('grid1', OPTS);

        // `'10'` sorts before `'5'` as text, so a number operand supplied as text must still order as a number.
        api.setAdvancedFilterModel({
            filterType: 'number',
            colId: 'age',
            type: 'betweenExclusive',
            filter: '40',
            filterTo: '25',
        } as any);
        await asyncSetTimeout(0);
        await new FilterDom(api, 'string range the wrong way round').checkFilterDom(`
            ADVANCED FILTER
            input: "[Age] Between (Exclusive) (40, 25)"
            valid: false — Expression has an error. Must be less than 25 - 40.
            buttons: Apply ⊘ | Builder
            model: null
        `);

        api.setAdvancedFilterModel({
            filterType: 'number',
            colId: 'age',
            type: 'betweenExclusive',
            filter: '25',
            filterTo: '40',
        } as any);
        await asyncSetTimeout(0);
        // Read back as the operand's own type, whatever form the model supplied them in.
        expect(api.getAdvancedFilterModel()).toEqual({
            filterType: 'number',
            colId: 'age',
            type: 'betweenExclusive',
            filter: 25,
            filterTo: 40,
        });
        await new GridRows(api, 'string range applied').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:2 athlete:"Ada" age:28
        `);
    });

    test('the two-value labels and range message are the column filter locale keys, and honour an override', async () => {
        const api = await gridsManager.createGridAndWait('grid1', {
            ...OPTS,
            localeText: {
                inRangeStart: 'Lower',
                inRangeEnd: 'Upper',
                strictMaxValueValidation: 'Pick something above ${variable}',
            },
        });

        api.setAdvancedFilterModel({ filterType: 'number', colId: 'age', type: 'evenNumbers' });
        await asyncSetTimeout(0);

        const builder = await AdvancedFilterBuilderHarness.open(api);
        const [item] = await builder.conditionItems();
        await builder.selectOperator(item, 'Between (Exclusive)');
        expect(builder.valuePills(item).map((pill) => pill.getAttribute('aria-label'))).toEqual([
            'Value Lower',
            'Value Upper',
        ]);

        await builder.setValue(item, '40', 0);
        await builder.setValue(item, '25', 1);
        const [outOfOrder] = await builder.conditionItems();
        expect(outOfOrder.closest('[aria-label]')?.getAttribute('aria-label')).toContain('Pick something above 25');
    });

    test('a filterOptions list swapped at runtime reaches the operator suggestions', async () => {
        const api = await gridsManager.createGridAndWait('grid1', OPTS);
        const af = AdvancedFilterHarness.get(api);

        await af.type('[Age] ');
        expect(af.autocompleteEntries()).toEqual(['=', 'Even Numbers', 'Age 5 Years Ago', 'Between (Exclusive)']);

        api.setGridOption('columnDefs', [
            { field: 'athlete', filter: 'agTextColumnFilter', filterParams: ATHLETE_FILTER_PARAMS },
            {
                field: 'age',
                filter: 'agNumberColumnFilter',
                filterParams: { filterOptions: ['equals', EVEN_NUMBERS], debounceMs: 0 },
            },
        ]);
        await asyncSetTimeout(0);

        // The suggestions are drawn as the expression is typed, so the withdrawn options go on showing in a
        // list already open; they are gone from the next one.
        await af.type('');
        await af.type('[Age] ');
        expect(af.autocompleteEntries()).toEqual(['=', 'Even Numbers']);
    });

    test('a gap between values is left empty, so the values around it survive into the expression', async () => {
        const api = await gridsManager.createGridAndWait('grid1', OPTS);
        // The shape the Builder holds after the second value is edited before the first.
        api.setAdvancedFilterModel({
            filterType: 'number',
            colId: 'age',
            type: 'betweenExclusive',
            filter: undefined as unknown as number,
            filterTo: 40,
        });
        await asyncSetTimeout(0);

        await new FilterDom(api, 'leading value still missing').checkFilterDom(`
            ADVANCED FILTER
            input: "[Age] Between (Exclusive) (, 40)"
            valid: false — Expression has an error. Value is missing - (,.
            buttons: Apply ⊘ | Builder
            model: null
        `);
    });

    test('the Builder reports an out-of-order range on the condition', async () => {
        const api = await gridsManager.createGridAndWait('grid1', OPTS);
        api.setAdvancedFilterModel({ filterType: 'number', colId: 'age', type: 'evenNumbers' });
        await asyncSetTimeout(0);

        const builder = await AdvancedFilterBuilderHarness.open(api);
        const [item] = await builder.conditionItems();
        await builder.selectOperator(item, 'Between (Exclusive)');
        await builder.setValue(item, '40', 0);
        await builder.setValue(item, '25', 1);
        await asyncSetTimeout(0);
        // Re-resolved: each edit re-renders the virtual list row, detaching the element captured above.
        const [invalidItem] = await builder.conditionItems();
        expect(hasVisibleInvalidIcon(invalidItem)).toBe(true);
        // The label sits on the focusable row, which wraps the item.
        expect(invalidItem.closest('[aria-label]')?.getAttribute('aria-label')).toContain('Must be less than 25');

        await builder.setValue(invalidItem, '10', 0);
        await asyncSetTimeout(0);
        const [validItem] = await builder.conditionItems();
        expect(hasVisibleInvalidIcon(validItem)).toBe(false);
    });

    test('the Builder holds a two-input condition incomplete until both values are entered', async () => {
        const api = await gridsManager.createGridAndWait('grid1', OPTS);
        api.setAdvancedFilterModel({ filterType: 'number', colId: 'age', type: 'evenNumbers' });
        await asyncSetTimeout(0);
        const builder = await AdvancedFilterBuilderHarness.open(api);
        // The message sits on the focusable row, which wraps the item.
        const messageOf = (item: HTMLElement) => item.closest('[aria-label]')?.getAttribute('aria-label') ?? '';

        const [item] = await builder.conditionItems();
        await builder.selectOperator(item, 'Between (Exclusive)');
        const [withOperator] = await builder.conditionItems();
        expect(hasVisibleInvalidIcon(withOperator)).toBe(true);
        expect(messageOf(withOperator)).toContain('Must enter a value.');

        // Both values are required, so the first one alone still leaves the condition incomplete.
        await builder.setValue(withOperator, '25', 0);
        const [withOneValue] = await builder.conditionItems();
        expect(hasVisibleInvalidIcon(withOneValue)).toBe(true);
        expect(messageOf(withOneValue)).toContain('Must enter a value.');

        await builder.setValue(withOneValue, '40', 1);
        const [complete] = await builder.conditionItems();
        expect(hasVisibleInvalidIcon(complete)).toBe(false);
    });

    test('the Builder lists the custom options and edits both values of a two-input one', async () => {
        const api = await gridsManager.createGridAndWait('grid1', OPTS);
        api.setAdvancedFilterModel({ filterType: 'number', colId: 'age', type: 'evenNumbers' });
        await asyncSetTimeout(0);

        const builder = await AdvancedFilterBuilderHarness.open(api);
        const [item] = await builder.conditionItems();
        expect(await builder.operatorOptions(item)).toEqual([
            '=',
            'Even Numbers',
            'Age 5 Years Ago',
            'Between (Exclusive)',
        ]);

        // The zero-input option it starts on shows no value pill at all.
        expect(builder.valuePills(item)).toHaveLength(0);

        await builder.selectOperator(item, 'Between (Exclusive)');
        const valuePills = builder.valuePills(item);
        expect(valuePills).toHaveLength(2);
        // Both operands stay reachable by keyboard, and the pair is labelled so a screen reader can tell
        // them apart rather than announcing "Value" twice.
        for (const pill of valuePills) {
            expect(pill.getAttribute('tabindex')).toBe('0');
            expect(pill.textContent?.trim()).toBe('Enter a value...');
        }
        expect(valuePills.map((pill) => pill.getAttribute('aria-label'))).toEqual(['Value From', 'Value To']);

        await builder.setValue(item, '25', 0);
        await builder.setValue(item, '40', 1);
        await builder.apply();
        await asyncSetTimeout(0);

        expect(api.getAdvancedFilterModel()).toEqual({
            filterType: 'number',
            colId: 'age',
            type: 'betweenExclusive',
            filter: 25,
            filterTo: 40,
        });
        await new GridRows(api, 'builder two-input applied').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:2 athlete:"Ada" age:28
        `);

        // Switching to a one-input option drops the second pill, and with it the second value.
        const reopened = await AdvancedFilterBuilderHarness.open(api);
        const [reopenedItem] = await reopened.conditionItems();
        await reopened.selectOperator(reopenedItem, 'Age 5 Years Ago');
        expect(reopened.valuePills(reopenedItem)).toHaveLength(1);
        // The lone value is no longer one end of a pair, so naming it From would be wrong.
        expect(reopened.valuePills(reopenedItem)[0].getAttribute('aria-label')).toBe('Value');

        await reopened.apply();
        await asyncSetTimeout(0);
        expect(api.getAdvancedFilterModel()).toEqual({
            filterType: 'number',
            colId: 'age',
            type: 'age5YearsAgo',
            filter: 25,
        });
    });

    test('the Builder renames the first value pill when a second joins it', async () => {
        const api = await gridsManager.createGridAndWait('grid1', OPTS);
        api.setAdvancedFilterModel({ filterType: 'number', colId: 'age', type: 'age5YearsAgo', filter: 20 });
        await asyncSetTimeout(0);

        const builder = await AdvancedFilterBuilderHarness.open(api);
        const [item] = await builder.conditionItems();
        expect(builder.valuePills(item).map((pill) => pill.getAttribute('aria-label'))).toEqual(['Value']);

        await builder.selectOperator(item, 'Between (Exclusive)');
        expect(builder.valuePills(item).map((pill) => pill.getAttribute('aria-label'))).toEqual([
            'Value From',
            'Value To',
        ]);

        // The value the one-input option collected is the pair's first, so it stays.
        await builder.setValue(item, '41', 1);
        await builder.apply();
        await asyncSetTimeout(0);
        expect(api.getAdvancedFilterModel()).toEqual({
            filterType: 'number',
            colId: 'age',
            type: 'betweenExclusive',
            filter: 20,
            filterTo: 41,
        });
    });

    test('the Builder drops the values when the column changes to another data type', async () => {
        const api = await gridsManager.createGridAndWait('grid1', OPTS);
        // Both columns offer `betweenExclusive`, so the option survives the column change and the values
        // would otherwise be carried into a model that reads them as text.
        api.setAdvancedFilterModel({
            filterType: 'number',
            colId: 'age',
            type: 'betweenExclusive',
            filter: 25,
            filterTo: 40,
        } as any);
        await asyncSetTimeout(0);

        const builder = await AdvancedFilterBuilderHarness.open(api);
        const [item] = await builder.conditionItems();
        await builder.selectColumn(item, 'Athlete');
        await asyncSetTimeout(0);

        const [changedItem] = await builder.conditionItems();
        expect(builder.valuePills(changedItem).map((pill) => pill.textContent?.trim())).toEqual([
            'Enter a value...',
            'Enter a value...',
        ]);
        // Nothing to apply until both are re-entered for the new column.
        expect(hasVisibleInvalidIcon(changedItem)).toBe(true);

        await builder.setValue(changedItem, 'Ada', 0);
        await builder.setValue(changedItem, 'Ng', 1);
        await builder.apply();
        await asyncSetTimeout(0);

        expect(api.getAdvancedFilterModel()).toEqual({
            filterType: 'text',
            colId: 'athlete',
            type: 'betweenExclusive',
            filter: 'Ada',
            filterTo: 'Ng',
        });
    });

    test('the Builder restores both values of a two-input option from a typed expression', async () => {
        const api = await gridsManager.createGridAndWait('grid1', OPTS);
        await AdvancedFilterHarness.get(api).applyExpression('[Athlete] Between (Exclusive) ("Ada", "Ng")');
        await asyncSetTimeout(0);

        const builder = await AdvancedFilterBuilderHarness.open(api);
        const [item] = await builder.conditionItems();

        expect(item.querySelector('.ag-advanced-filter-builder-option-pill')?.textContent?.trim()).toBe(
            'Between (Exclusive)'
        );
        expect(builder.valuePills(item).map((pill) => pill.textContent?.trim())).toEqual(['"Ada"', '"Ng"']);
    });

    test('growing from a zero-value option leaves the new pill empty rather than showing the old value', async () => {
        const api = await gridsManager.createGridAndWait('grid1', OPTS);

        // A value left behind by whatever set the model: the option takes none, so nothing renders it.
        api.setAdvancedFilterModel({
            filterType: 'number',
            colId: 'age',
            type: 'evenNumbers',
            filter: 5,
        } as any);
        await asyncSetTimeout(0);

        const builder = await AdvancedFilterBuilderHarness.open(api);
        const [item] = await builder.conditionItems();
        expect(builder.valuePills(item)).toHaveLength(0);

        await builder.selectOperator(item, 'Age 5 Years Ago');
        expect(builder.valuePills(item).map((pill) => pill.textContent?.trim())).toEqual(['Enter a value...']);

        await builder.setValue(item, '20');
        await builder.apply();
        await asyncSetTimeout(0);
        expect(api.getAdvancedFilterModel()).toEqual({
            filterType: 'number',
            colId: 'age',
            type: 'age5YearsAgo',
            filter: 20,
        });
    });

    test('a built-in zero-value option growing to one leaves no value behind either', async () => {
        const api = await gridsManager.createGridAndWait('grid1', OPTS);

        api.setAdvancedFilterModel({ filterType: 'number', colId: 'age', type: 'blank', filter: 5 } as any);
        await asyncSetTimeout(0);

        const builder = await AdvancedFilterBuilderHarness.open(api);
        const [item] = await builder.conditionItems();
        expect(builder.valuePills(item)).toHaveLength(0);

        await builder.selectOperator(item, '=');
        expect(builder.valuePills(item).map((pill) => pill.textContent?.trim())).toEqual(['Enter a value...']);
    });

    test('changing the Builder column drops an operator the new column does not offer', async () => {
        const api = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                { field: 'athlete', filter: 'agTextColumnFilter', filterParams: ATHLETE_FILTER_PARAMS },
                { field: 'sport', filter: 'agTextColumnFilter' },
            ],
            rowData: [
                { athlete: 'Bolt', sport: 'Sprint' },
                { athlete: 'Ada', sport: 'Swimming' },
            ],
            enableAdvancedFilter: true,
        });
        api.setAdvancedFilterModel({ filterType: 'text', colId: 'athlete', type: 'startsA' });
        await asyncSetTimeout(0);

        const builder = await AdvancedFilterBuilderHarness.open(api);
        const [item] = await builder.conditionItems();
        const operatorPillText = () =>
            item.querySelector('.ag-advanced-filter-builder-option-pill')?.textContent?.trim();
        expect(operatorPillText()).toBe('Starts With A');

        // Sport is text as well, but defines no options of its own, so the operator cannot carry over.
        await builder.selectColumn(item, 'Sport');
        expect(operatorPillText()).toBe('Select an option');
        const sportOptions = await builder.operatorOptions(item);
        expect(sportOptions).not.toContain('Starts With A');
        expect(sportOptions).toContain('contains'); // the built-in text options are what it fell back to
    });

    test('the option filters the same rows through the column filter and the Advanced Filter', async () => {
        const columnFilterApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'athlete', filter: 'agTextColumnFilter', filterParams: ATHLETE_FILTER_PARAMS }],
            rowData: ROW_DATA,
        });
        const filter = await ColumnFilterHarness.open(columnFilterApi, 'athlete');
        await filter.selectOperator('Regular Expression');
        await filter.setText('^(A|B)');
        await asyncSetTimeout(0);

        const advancedFilterApi = await gridsManager.createGridAndWait('grid2', OPTS);
        await AdvancedFilterHarness.get(advancedFilterApi).applyExpression('[Athlete] Regular Expression "^(A|B)"');
        await asyncSetTimeout(0);

        // Also compared to each other, so the two filters cannot drift apart silently even if both snapshots
        // were updated together.
        expect(filteredAthletes(advancedFilterApi)).toEqual(filteredAthletes(columnFilterApi));
        await new GridRows(columnFilterApi, 'regexp through the column filter').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 athlete:"Bolt"
            └── LEAF id:2 athlete:"Ada"
        `);
        await new GridRows(advancedFilterApi, 'regexp through the advanced filter').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 athlete:"Bolt" age:25
            └── LEAF id:2 athlete:"Ada" age:28
        `);
    });

    test('an option localised through its displayKey is named the same in both filters', async () => {
        const localeText = { evenNumbers: 'Nombres Pairs' };

        const columnFilterApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'age', filter: 'agNumberColumnFilter', filterParams: AGE_FILTER_PARAMS }],
            rowData: ROW_DATA,
            localeText,
        });
        const filter = await ColumnFilterHarness.open(columnFilterApi, 'age');
        expect(await filter.operatorOptions()).toContain('Nombres Pairs');

        const api = await gridsManager.createGridAndWait('grid2', { ...OPTS, localeText });
        const af = AdvancedFilterHarness.get(api);

        await af.type('[Age] ');
        expect(af.autocompleteEntries()).toEqual(['=', 'Nombres Pairs', 'Age 5 Years Ago', 'Between (Exclusive)']);

        // The localised name is what the expression is written under, and the model keeps the `displayKey`.
        await af.applyExpression('[Age] Nombres Pairs');
        expect(api.getAdvancedFilterModel()).toEqual({ filterType: 'number', colId: 'age', type: 'evenNumbers' });
        api.setAdvancedFilterModel({ filterType: 'number', colId: 'age', type: 'evenNumbers' });
        await asyncSetTimeout(0);
        expect(af.value).toBe('[Age] Nombres Pairs');
        await new GridRows(api, 'localised option applied').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:1 athlete:"Ng" age:40
            └── LEAF id:2 athlete:"Ada" age:28
        `);

        const builder = await AdvancedFilterBuilderHarness.open(api);
        const [item] = await builder.conditionItems();
        expect(await builder.operatorOptions(item)).toContain('Nombres Pairs');
    });
});

interface BandRow {
    age: number;
    score: number;
}

const BAND_ROWS: BandRow[] = [
    { age: 25, score: 70 },
    { age: 40, score: 55 },
];

/** The same key on both columns, taking a different number of values on each. */
const AGE_BAND: IFilterOptionDef = {
    displayKey: 'band',
    displayName: 'Band',
    numberOfInputs: 1,
    predicate: ([value], cellValue) => cellValue === value,
};

const SCORE_BAND: IFilterOptionDef = {
    displayKey: 'band',
    displayName: 'Band',
    numberOfInputs: 2,
    predicate: (values, cellValue) => values.includes(cellValue),
};

const BAND_OPTS: GridOptions<BandRow> = {
    columnDefs: [
        {
            field: 'age',
            filter: 'agNumberColumnFilter',
            filterParams: { filterOptions: ['equals', AGE_BAND], maxNumConditions: 1 },
        },
        {
            field: 'score',
            filter: 'agNumberColumnFilter',
            filterParams: { filterOptions: ['equals', SCORE_BAND], maxNumConditions: 1 },
        },
    ],
    rowData: BAND_ROWS,
    enableAdvancedFilter: true,
};

/** One display name is a prefix of the other, which the operator region must not settle on early. */
const OVER: IFilterOptionDef = {
    displayKey: 'over',
    displayName: 'Over',
    numberOfInputs: 1,
    predicate: ([value], cellValue) => cellValue != null && cellValue > value,
};

const OVER_OR_EQUAL: IFilterOptionDef = {
    displayKey: 'overOrEqual',
    displayName: 'Over Or Equal',
    numberOfInputs: 1,
    predicate: ([value], cellValue) => cellValue != null && cellValue >= value,
};

const PREFIX_OPTS: GridOptions<BandRow> = {
    columnDefs: [
        {
            field: 'age',
            filter: 'agNumberColumnFilter',
            filterParams: { filterOptions: ['equals', OVER, OVER_OR_EQUAL], debounceMs: 0 },
        },
    ],
    rowData: BAND_ROWS,
    enableAdvancedFilter: true,
};

describe('Advanced Filter — an operator name prefixed by another', () => {
    const gridsManager = new TestGridsManager({
        modules: [TextFilterModule, NumberFilterModule, LocaleModule, AdvancedFilterModule, ClientSideRowModelModule],
    });

    beforeAll(() => {
        setupAgTestIds();
        installFilterLayoutMock();
    });
    afterAll(() => uninstallFilterLayoutMock());
    afterEach(() => gridsManager.reset());

    test('the longer name parses rather than the shorter one it starts with', async () => {
        const api: GridApi<BandRow> = await gridsManager.createGridAndWait('grid1', PREFIX_OPTS);

        await AdvancedFilterHarness.get(api).applyExpression('[Age] Over Or Equal 25');
        await asyncSetTimeout(0);

        expect(api.getAdvancedFilterModel()).toEqual({
            filterType: 'number',
            colId: 'age',
            type: 'overOrEqual',
            filter: 25,
        });
        await new GridRows(api, 'the longer operator name').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 age:25
            └── LEAF id:1 age:40
        `);
    });

    test('the shorter name still parses on its own', async () => {
        const api: GridApi<BandRow> = await gridsManager.createGridAndWait('grid1', PREFIX_OPTS);

        await AdvancedFilterHarness.get(api).applyExpression('[Age] Over 25');
        await asyncSetTimeout(0);

        expect(api.getAdvancedFilterModel()).toEqual({
            filterType: 'number',
            colId: 'age',
            type: 'over',
            filter: 25,
        });
        await new GridRows(api, 'the shorter operator name').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:1 age:40
        `);
    });

    test('a built-in operator localised to a name another built-in starts with still parses', async () => {
        const api: GridApi<Row> = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'athlete', filter: 'agTextColumnFilter', filterParams: { debounceMs: 0 } }],
            rowData: ROW_DATA,
            enableAdvancedFilter: true,
            localeText: { advancedFilterNotContains: 'contains not' },
        });

        await AdvancedFilterHarness.get(api).applyExpression('[Athlete] contains not "a"');
        await asyncSetTimeout(0);

        expect(api.getAdvancedFilterModel()).toEqual({
            filterType: 'text',
            colId: 'athlete',
            type: 'notContains',
            filter: 'a',
        });
        expect(filteredAthletes(api)).toEqual(['Bolt', 'Ng', 'Wei']);
    });

    test('a model naming the longer option filters, and round-trips through the expression', async () => {
        const api: GridApi<BandRow> = await gridsManager.createGridAndWait('grid1', PREFIX_OPTS);

        api.setAdvancedFilterModel({ filterType: 'number', colId: 'age', type: 'overOrEqual', filter: 40 });
        await asyncSetTimeout(0);

        expect(AdvancedFilterHarness.get(api).value).toBe('[Age] Over Or Equal 40');
        await new GridRows(api, 'a model naming the longer option').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:1 age:40
        `);
    });
});

describe('Advanced Filter Builder — custom options across columns', () => {
    const gridsManager = new TestGridsManager({
        modules: [TextFilterModule, NumberFilterModule, AdvancedFilterModule, ClientSideRowModelModule],
    });

    beforeAll(() => {
        setupAgTestIds();
        installFilterLayoutMock();
    });
    afterAll(() => uninstallFilterLayoutMock());
    afterEach(() => gridsManager.reset());

    test('the same key on another column is re-resolved against the new column', async () => {
        const api: GridApi<BandRow> = await gridsManager.createGridAndWait('grid1', BAND_OPTS);
        api.setAdvancedFilterModel({ filterType: 'number', colId: 'age', type: 'band', filter: 25 });
        await asyncSetTimeout(0);

        const builder = await AdvancedFilterBuilderHarness.open(api);
        const [item] = await builder.conditionItems();
        expect(builder.valuePills(item)).toHaveLength(1);

        // `band` exists on both columns, so the operator survives - but it takes two values here.
        await builder.selectColumn(item, 'Score');
        expect(builder.valuePills(item)).toHaveLength(2);
    });

    test('switching between a built-in and a custom option of the same arity moves the model slots', async () => {
        const api: GridApi<BandRow> = await gridsManager.createGridAndWait('grid1', BAND_OPTS);
        api.setAdvancedFilterModel({ filterType: 'number', colId: 'age', type: 'equals', filter: 25 });
        await asyncSetTimeout(0);

        const builder = await AdvancedFilterBuilderHarness.open(api);
        const [item] = await builder.conditionItems();

        // Both take one value, so the pill is untouched and the model slot is the same one.
        await builder.selectOperator(item, 'Band');
        await builder.apply();
        await asyncSetTimeout(0);
        expect(api.getAdvancedFilterModel()).toEqual({
            filterType: 'number',
            colId: 'age',
            type: 'band',
            filter: 25,
        });
        await new GridRows(api, 'custom option in the built-in slot').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 age:25 score:70
        `);
    });

    test('switching back to a built-in option drops the custom-only slot', async () => {
        const api: GridApi<BandRow> = await gridsManager.createGridAndWait('grid1', BAND_OPTS);
        api.setAdvancedFilterModel({ filterType: 'number', colId: 'age', type: 'band', filter: 25 });
        await asyncSetTimeout(0);

        const builder = await AdvancedFilterBuilderHarness.open(api);
        const [item] = await builder.conditionItems();

        // The Advanced Filter writes `equals` as `=`, unlike the column filter's "Equals".
        await builder.selectOperator(item, '=');
        await builder.apply();
        await asyncSetTimeout(0);
        expect(api.getAdvancedFilterModel()).toEqual({
            filterType: 'number',
            colId: 'age',
            type: 'equals',
            filter: 25,
        });
        await new GridRows(api, 'built-in option after a custom one').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 age:25 score:70
        `);
    });

    test('the Builder relabels an operator the new column offers under a different name', async () => {
        const api = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                { field: 'athlete', filter: 'agTextColumnFilter' },
                {
                    field: 'sport',
                    filter: 'agTextColumnFilter',
                    // The same `displayKey` as the built-in, so the key survives the column change and only
                    // the name it is offered under differs.
                    filterParams: {
                        filterOptions: [
                            {
                                displayKey: 'contains',
                                displayName: 'Includes',
                                predicate: ([value]: any[], cellValue: string | null) =>
                                    cellValue != null && cellValue.includes(String(value)),
                            },
                        ],
                    },
                },
            ],
            rowData: ROW_DATA,
            enableAdvancedFilter: true,
        });
        api.setAdvancedFilterModel({ filterType: 'text', colId: 'athlete', type: 'contains', filter: 'a' });
        await asyncSetTimeout(0);

        const builder = await AdvancedFilterBuilderHarness.open(api);
        const [item] = await builder.conditionItems();
        const operatorPillText = () =>
            item.querySelector('.ag-advanced-filter-builder-option-pill')?.textContent?.trim();
        expect(operatorPillText()).toBe('contains');

        await builder.selectColumn(item, 'Sport');
        // The pill would keep showing the old column's name while filtering with the new column's option.
        expect(operatorPillText()).toBe('Includes');
    });

    test('a malformed custom option is reported even where no column filter is built', async () => {
        // The warning under test is the expected outcome here, so it must not throw.
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [72] });
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        try {
            const api = await gridsManager.createGridAndWait('grid1', {
                columnDefs: [
                    {
                        field: 'athlete',
                        filter: 'agTextColumnFilter',
                        // No `predicate`, so nothing can evaluate it and it is not offered.
                        filterParams: { filterOptions: [{ displayKey: 'startsA', displayName: 'Starts With A' }] },
                    },
                ],
                rowData: ROW_DATA,
                enableAdvancedFilter: true,
            });

            // Only the Advanced Filter resolves this column's options, so only it can report the mistake.
            await AdvancedFilterHarness.get(api).applyExpression('[Athlete] Starts With A');
            await asyncSetTimeout(0);

            expect(api.getAdvancedFilterModel()).toBeNull();
            const warnings = warnSpy.mock.calls.map((call) => call.map(String).join(' ')).join('\n');
            expect(warnings).toContain('warning #72');
            expect(warnings).toContain('predicate');
        } finally {
            warnSpy.mockRestore();
            enableDevValidations({ throwOn: ALL_SEVERITIES });
        }
    });
});

describe('Advanced Filter — a model the option cannot be read from', () => {
    const gridsManager = new TestGridsManager({
        modules: [NumberFilterModule, AdvancedFilterModule, ClientSideRowModelModule],
    });

    beforeAll(() => {
        setupAgTestIds();
        installFilterLayoutMock();
    });
    afterAll(() => uninstallFilterLayoutMock());
    afterEach(() => gridsManager.reset());

    test('a two-value option holding one value shows that value, not an empty second operand', async () => {
        const api: GridApi<BandRow> = await gridsManager.createGridAndWait('grid1', BAND_OPTS);

        // Hand-written: `band` takes two values on `score`, and this model supplies only the first.
        api.setAdvancedFilterModel({ filterType: 'number', colId: 'score', type: 'band', filter: 70 } as any);
        await asyncSetTimeout(0);

        // Reported as the value it is short of, rather than as a syntax error in `("70", )`.
        await new FilterDom(api, 'half-filled two-value option').checkFilterDom(`
            ADVANCED FILTER
            input: "[Score] Band 70"
            valid: false — Expression has an error. Value is missing at end of expression.
            buttons: Apply ⊘ | Builder
            model: null
        `);
    });

    test('a `type` resolving only to an inherited member is not a filter option', async () => {
        const api: GridApi<BandRow> = await gridsManager.createGridAndWait('grid1', BAND_OPTS);

        // `toString` is on `Object.prototype`, so a lookup that does not check own keys finds a function.
        api.setAdvancedFilterModel({ filterType: 'number', colId: 'age', type: 'toString', filter: 25 } as any);
        await asyncSetTimeout(0);

        await new FilterDom(api, 'an inherited member is not an option').checkFilterDom(`
            ADVANCED FILTER
            input: "[Age] toString 25"
            valid: false — Expression has an error. Option not found - toString 25.
            buttons: Apply ⊘ | Builder
            model: null
        `);
        await new GridRows(api, 'an unresolvable option filters nothing').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 age:25 score:70
            └── LEAF id:1 age:40 score:55
        `);
    });
});
