import { waitFor } from '@testing-library/dom';
import {
    ALL_SEVERITIES,
    AdvancedFilterBuilderHarness,
    AdvancedFilterHarness,
    FilterDom,
    GridRows,
    TestGridsManager,
    asyncSetTimeout,
    installFilterLayoutMock,
    uninstallFilterLayoutMock,
} from 'ag-test-utils';

import type { AdvancedFilterModel, ColDef, GridApi, GridOptions, IFilterOptionDef } from 'ag-grid-community';
import {
    BigIntFilterModule,
    ClientSideRowModelModule,
    DateFilterModule,
    LocaleModule,
    NumberFilterModule,
    TextFilterModule,
    ValidationModule,
    enableDevValidations,
} from 'ag-grid-community';
import { AdvancedFilterModule, MultiFilterModule, SetFilterModule } from 'ag-grid-enterprise';

/** Custom Filter Options in the Advanced Filter: what a column offers, the grammar, the model, the Builder. */
interface TestRow {
    athlete: string;
    age: number | null;
    won: boolean;
}

const ROW_DATA: TestRow[] = [
    { athlete: 'Bolt', age: 25, won: true },
    { athlete: 'Ng', age: 40, won: false },
    { athlete: 'Ada', age: 28, won: true },
    { athlete: 'Wei', age: null, won: false },
];

const STARTS_A: IFilterOptionDef = {
    displayKey: 'startsA',
    displayName: 'Starts With A',
    numberOfInputs: 0,
    predicate: (_values, cellValue) => typeof cellValue === 'string' && cellValue.startsWith('A'),
};

const REGULAR_EXPRESSION: IFilterOptionDef = {
    displayKey: 'regexp',
    displayName: 'Regular Expression',
    numberOfInputs: 1,
    predicate: ([filterValue], cellValue) => cellValue != null && new RegExp(filterValue, 'i').test(cellValue),
};

const ODD_NUMBERS: IFilterOptionDef = {
    displayKey: 'oddNumbers',
    displayName: 'Odd Numbers',
    numberOfInputs: 0,
    predicate: (_values, cellValue) => cellValue != null && cellValue % 2 === 1,
};

const EVEN_NUMBERS: IFilterOptionDef = {
    displayKey: 'evenNumbers',
    displayName: 'Even Numbers',
    numberOfInputs: 0,
    predicate: (_values, cellValue) => cellValue != null && cellValue % 2 === 0,
};

/** Comparison-based, so it serves the text and the number column alike. */
const BETWEEN_EXCLUSIVE: IFilterOptionDef = {
    displayKey: 'betweenExclusive',
    displayName: 'Between (Exclusive)',
    numberOfInputs: 2,
    predicate: ([from, to], cellValue) => cellValue != null && cellValue > from && cellValue < to,
};

/** The operands reach the predicate as `Date`s, as they do in the column filter. */
const DATE_BETWEEN_EXCLUSIVE: IFilterOptionDef = {
    displayKey: 'betweenExclusive',
    displayName: 'Between (Exclusive)',
    numberOfInputs: 2,
    predicate: ([from, to], cellValue) => {
        if (cellValue == null) {
            return false;
        }
        const [year, month, day] = cellValue.split('-').map(Number);
        const cellDate = new Date(year, month - 1, day);
        return cellDate > from && cellDate < to;
    },
};

/** Reuses the range key, so the column's two-value option is this predicate and not an ordered pair of bounds. */
const OUTSIDE: IFilterOptionDef = {
    displayKey: 'inRange',
    displayName: 'is outside',
    numberOfInputs: 2,
    predicate: ([from, to], cellValue) => cellValue != null && (cellValue > from || cellValue < to),
};

/** Reuses a built-in key, so it replaces `contains` for the column that declares it. */
const CONTAINS_BACKWARDS: IFilterOptionDef = {
    displayKey: 'contains',
    displayName: 'contains backwards',
    numberOfInputs: 1,
    predicate: ([filterValue], cellValue) =>
        typeof cellValue === 'string' && cellValue.split('').reverse().join('').includes(filterValue),
};

const ATHLETE_OPTIONS = ['contains', STARTS_A, REGULAR_EXPRESSION, BETWEEN_EXCLUSIVE];
const AGE_OPTIONS = ['equals', EVEN_NUMBERS, BETWEEN_EXCLUSIVE];

/** Built per grid: the grid writes the merged `filterParams` back onto the colDef it was handed. */
const opts = (): GridOptions<TestRow> => ({
    columnDefs: [
        { field: 'athlete', filter: 'agTextColumnFilter', filterParams: { filterOptions: ATHLETE_OPTIONS } },
        { field: 'age', filter: 'agNumberColumnFilter', filterParams: { filterOptions: AGE_OPTIONS } },
        { field: 'won', filter: true },
    ],
    rowData: ROW_DATA,
    enableAdvancedFilter: true,
});

describe('Advanced Filter - custom filter options', () => {
    const gridsManager = new TestGridsManager({
        modules: [
            TextFilterModule,
            NumberFilterModule,
            BigIntFilterModule,
            DateFilterModule,
            LocaleModule,
            ValidationModule,
            AdvancedFilterModule,
            MultiFilterModule,
            SetFilterModule,
            ClientSideRowModelModule,
        ],
    });

    beforeAll(() => installFilterLayoutMock());
    afterAll(() => uninstallFilterLayoutMock());
    afterEach(() => {
        gridsManager.reset();
        vi.restoreAllMocks();
        enableDevValidations({ throwOn: ALL_SEVERITIES });
    });

    describe('the options a column offers', () => {
        test('the configured options are offered by display name, in the order they are listed', async () => {
            const api = gridsManager.createGrid('grid1', opts());
            await asyncSetTimeout(0);
            const af = AdvancedFilterHarness.get(api);

            await af.type('[Athlete] ');
            expect(af.autocompleteEntries()).toEqual([
                'contains',
                'Starts With A',
                'Regular Expression',
                'Between (Exclusive)',
            ]);

            await af.type('[Age] ');
            expect(af.autocompleteEntries()).toEqual(['=', 'Even Numbers', 'Between (Exclusive)']);
        });

        test('a column with no options of its own offers every built-in for its data type, plus the ones its filter adds', async () => {
            const api = gridsManager.createGrid('grid1', opts());
            await asyncSetTimeout(0);
            const af = AdvancedFilterHarness.get(api);

            // `filter: true` resolves to the Set Filter here, which adds its own two options to the built-ins.
            await af.type('[Won] ');
            expect(af.autocompleteEntries()).toEqual([
                'is true',
                'is false',
                'is blank',
                'is not blank',
                'is any of',
                'is none of',
            ]);
        });

        // `empty` is the column filter's placeholder entry and names no operator here, so narrowing to it
        // would narrow to nothing: no suggestions, an unpickable Builder row, an unsatisfiable AI schema.
        test('a list naming only options this filter cannot resolve leaves the built-ins standing', async () => {
            const api = gridsManager.createGrid('grid1', {
                columnDefs: [
                    {
                        field: 'age',
                        filter: 'agNumberColumnFilter',
                        filterParams: { filterOptions: ['empty'] },
                    },
                ],
                rowData: ROW_DATA,
                enableAdvancedFilter: true,
            });
            await asyncSetTimeout(0);
            const af = AdvancedFilterHarness.get(api);

            await af.type('[Age] ');
            // Every built-in, not just one of them: "standing" is the whole list, not a survivor from it.
            expect(af.autocompleteEntries()).toEqual([
                '=',
                '!=',
                '>',
                '>=',
                '<',
                '<=',
                'is between',
                'is blank',
                'is not blank',
            ]);

            await af.applyExpression('[Age] = 25');
            await asyncSetTimeout(0);
            await new GridRows(api, 'the built-ins filter the column').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 age:25
            `);
        });

        // Identity tells the grid's list from an authored one, so a copied colDef must carry the same array.
        test('the grid-supplied boolean list survives a columnDefs round trip', async () => {
            const api = gridsManager.createGrid('grid1', {
                columnDefs: [{ field: 'won', filter: 'agTextColumnFilter' }],
                rowData: ROW_DATA,
                enableAdvancedFilter: true,
            });
            await asyncSetTimeout(0);
            const af = AdvancedFilterHarness.get(api);

            await af.type('[Won] ');
            expect(af.autocompleteEntries()).toEqual(['is true', 'is false', 'is blank', 'is not blank']);

            api.setGridOption('columnDefs', api.getColumnDefs()!);
            await asyncSetTimeout(0);

            await af.type('');
            await af.type('[Won] ');
            expect(af.autocompleteEntries()).toEqual(['is true', 'is false', 'is blank', 'is not blank']);
        });

        // The quote that delimits an operand can also appear inside an option name.
        test('an option whose name contains a quote is offered, parses and round-trips', async () => {
            const api = gridsManager.createGrid('grid1', {
                columnDefs: [
                    {
                        field: 'athlete',
                        filter: 'agTextColumnFilter',
                        filterParams: { filterOptions: ['contains', { ...STARTS_A, displayName: 'Starts With "A"' }] },
                    },
                ],
                rowData: ROW_DATA,
                enableAdvancedFilter: true,
            });
            await asyncSetTimeout(0);
            const af = AdvancedFilterHarness.get(api);

            await af.type('[Athlete] ');
            expect(af.autocompleteEntries()).toEqual(['contains', 'Starts With "A"']);

            await af.applyExpression('[Athlete] Starts With "A"');
            await asyncSetTimeout(0);
            expect(api.getAdvancedFilterModel()).toEqual({
                filterType: 'text',
                colId: 'athlete',
                type: 'startsA',
            });

            api.setAdvancedFilterModel(api.getAdvancedFilterModel());
            await asyncSetTimeout(0);
            expect(af.value).toBe('[Athlete] Starts With "A"');
        });

        // Narrowing removes a name from the suggestions, not from the grammar.
        test('a built-in the column omits is not offered, but an expression naming it still applies', async () => {
            const api = gridsManager.createGrid('grid1', opts());
            await asyncSetTimeout(0);
            const af = AdvancedFilterHarness.get(api);

            await af.type('[Athlete] ');
            // The whole list, so a popup that never opened cannot pass for `ends with` being absent from it.
            expect(af.autocompleteEntries()).toEqual([
                'contains',
                'Starts With A',
                'Regular Expression',
                'Between (Exclusive)',
            ]);

            await af.applyExpression('[Athlete] ends with "a"');
            await asyncSetTimeout(0);
            await new FilterDom(api, 'omitted built-in accepted').checkFilterDom(`
                ADVANCED FILTER
                input: "[Athlete] ends with "a""
                valid: true
                buttons: Apply ⊘ | Builder
                model:
                  filterType: "text"
                  colId: "athlete"
                  type: "endsWith"
                  filter: "a"
            `);
        });

        test('a saved model naming an omitted built-in restores whole, with the conditions beside it', async () => {
            const api = gridsManager.createGrid('grid1', opts());
            await asyncSetTimeout(0);

            const savedModel: AdvancedFilterModel = {
                filterType: 'join',
                type: 'AND',
                conditions: [
                    { filterType: 'text', colId: 'athlete', type: 'endsWith', filter: 'a' },
                    { filterType: 'number', colId: 'age', type: 'evenNumbers' },
                ],
            };
            api.setAdvancedFilterModel(savedModel);
            await asyncSetTimeout(0);

            await new GridRows(api, 'both conditions filter').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:2 athlete:"Ada" age:28 won:true
            `);
            expect(api.getAdvancedFilterModel()).toEqual(savedModel);
        });

        // A name only matches where it ends at a space, a bracket or the expression, hence these three.
        test('an option name another name starts with resolves each of the three', async () => {
            const CONTAIN: IFilterOptionDef = {
                displayKey: 'contain',
                displayName: 'contain',
                numberOfInputs: 1,
                predicate: ([value], cellValue) => typeof cellValue === 'string' && cellValue.includes(value),
            };
            const CONTAIN_BOTH: IFilterOptionDef = {
                displayKey: 'containBoth',
                displayName: 'contain both',
                numberOfInputs: 2,
                predicate: ([first, second], cellValue) =>
                    typeof cellValue === 'string' && cellValue.includes(first) && cellValue.includes(second),
            };
            const api = gridsManager.createGrid('grid1', {
                columnDefs: [
                    {
                        field: 'athlete',
                        filter: 'agTextColumnFilter',
                        filterParams: { filterOptions: [CONTAIN, CONTAIN_BOTH] },
                    },
                ],
                rowData: ROW_DATA,
                enableAdvancedFilter: true,
            });
            await asyncSetTimeout(0);
            const af = AdvancedFilterHarness.get(api);

            await af.type('[Athlete] ');
            expect(af.autocompleteEntries()).toEqual(['contain', 'contain both']);

            await af.applyExpression('[Athlete] contain "o"');
            await asyncSetTimeout(0);
            expect(api.getAdvancedFilterModel()).toEqual({
                filterType: 'text',
                colId: 'athlete',
                type: 'contain',
                filter: 'o',
            });

            await af.applyExpression('[Athlete] contain both ("A", "d")');
            await asyncSetTimeout(0);
            expect(api.getAdvancedFilterModel()).toEqual({
                filterType: 'text',
                colId: 'athlete',
                type: 'containBoth',
                filter: 'A',
                filterTo: 'd',
            });
            await new GridRows(api, 'the longer name takes both values').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:2 athlete:"Ada"
            `);

            // Neither offered name ends here, so the omitted built-in is reached.
            await af.applyExpression('[Athlete] contains "o"');
            await asyncSetTimeout(0);
            expect(api.getAdvancedFilterModel()).toEqual({
                filterType: 'text',
                colId: 'athlete',
                type: 'contains',
                filter: 'o',
            });
        });

        // `is` terminates at the space `is blank` runs through, so the offered match must be lengthened.
        test('an offered name does not cut short a longer option the list leaves out', async () => {
            const IS: IFilterOptionDef = {
                displayKey: 'isValue',
                displayName: 'is',
                numberOfInputs: 1,
                predicate: ([value], cellValue) => cellValue === value,
            };
            const api = gridsManager.createGrid('grid1', {
                columnDefs: [
                    {
                        field: 'athlete',
                        filter: 'agTextColumnFilter',
                        filterParams: { filterOptions: ['contains', IS] },
                    },
                ],
                rowData: [...ROW_DATA, { athlete: '', age: 1, won: false }],
                enableAdvancedFilter: true,
            });
            await asyncSetTimeout(0);
            const af = AdvancedFilterHarness.get(api);

            await af.type('[Athlete] ');
            expect(af.autocompleteEntries()).toEqual(['contains', 'is']);

            // `is blank` is not offered, and still names the built-in rather than `is` with operand `blank`.
            await af.applyExpression('[Athlete] is blank');
            await asyncSetTimeout(0);
            expect(api.getAdvancedFilterModel()).toEqual({ filterType: 'text', colId: 'athlete', type: 'blank' });
            await new GridRows(api, 'the longer omitted name wins').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:4 athlete:""
            `);

            // The offered name still wins where nothing longer is written here.
            await af.applyExpression('[Athlete] is "Ada"');
            await asyncSetTimeout(0);
            expect(api.getAdvancedFilterModel()).toEqual({
                filterType: 'text',
                colId: 'athlete',
                type: 'isValue',
                filter: 'Ada',
            });
        });

        // A restored condition naming an unlisted option must survive the pass that clears unresolvable ones.
        test('the Builder keeps a restored condition whose option the column no longer offers', async () => {
            const api = gridsManager.createGrid('grid1', opts());
            await asyncSetTimeout(0);
            api.setAdvancedFilterModel({ filterType: 'text', colId: 'athlete', type: 'endsWith', filter: 'a' });
            api.onFilterChanged();
            await asyncSetTimeout(0);

            const builder = await AdvancedFilterBuilderHarness.open(api);
            const [condition] = await builder.conditionItems();

            await new FilterDom(api, 'the restored condition survives', { mode: 'builder' }).checkFilterDom(`
                BUILDER
                AND
                  Athlete ends with "a"
                  + add
                buttons: Apply | Cancel
                model:
                  filterType: "text"
                  colId: "athlete"
                  type: "endsWith"
                  filter: "a"
            `);
            // Kept, but still not one the dropdown lists.
            expect(await builder.operatorOptions(condition)).toEqual([
                'contains',
                'Starts With A',
                'Regular Expression',
                'Between (Exclusive)',
            ]);
        });

        test('a list replaced after the grid is built is the one offered', async () => {
            const api = gridsManager.createGrid('grid1', opts());
            await asyncSetTimeout(0);
            const af = AdvancedFilterHarness.get(api);

            await af.type('[Age] ');
            expect(af.autocompleteEntries()).toEqual(['=', 'Even Numbers', 'Between (Exclusive)']);

            api.setGridOption('columnDefs', [
                { field: 'athlete', filter: 'agTextColumnFilter' },
                {
                    field: 'age',
                    filter: 'agNumberColumnFilter',
                    filterParams: { filterOptions: ['equals', ODD_NUMBERS] },
                },
                { field: 'won', filter: true },
            ]);
            await asyncSetTimeout(0);

            await af.type('');
            await af.type('[Age] ');
            expect(af.autocompleteEntries()).toEqual(['=', 'Odd Numbers']);

            await af.applyExpression('[Age] Odd Numbers');
            await asyncSetTimeout(0);
            await new GridRows(api, 'the replaced option filters').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 athlete:"Bolt" age:25 won:true
            `);
        });

        test('a list replaced while the Advanced Filter is off is the one offered when it comes back', async () => {
            const api = gridsManager.createGrid('grid1', opts());
            await asyncSetTimeout(0);

            await AdvancedFilterHarness.get(api).type('[Age] ');

            api.setGridOption('enableAdvancedFilter', false);
            api.setGridOption('columnDefs', [
                { field: 'athlete', filter: 'agTextColumnFilter' },
                {
                    field: 'age',
                    filter: 'agNumberColumnFilter',
                    filterParams: { filterOptions: ['equals', ODD_NUMBERS] },
                },
                { field: 'won', filter: true },
            ]);
            await asyncSetTimeout(0);
            api.setGridOption('enableAdvancedFilter', true);
            await waitFor(() => expect(document.querySelector('.ag-advanced-filter-header')).not.toBeNull());
            await asyncSetTimeout(0);

            const af = AdvancedFilterHarness.get(api);
            await af.applyExpression('[Age] Odd Numbers');
            await asyncSetTimeout(0);
            await new FilterDom(api, 'the list replaced while off').checkFilterDom(`
                ADVANCED FILTER
                input: "[Age] Odd Numbers"
                valid: true
                buttons: Apply ⊘ | Builder
                model:
                  filterType: "number"
                  colId: "age"
                  type: "oddNumbers"
            `);
            await new GridRows(api, 'the replaced option filters after the toggle').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 athlete:"Bolt" age:25 won:true
            `);
        });

        test('a boolean column can take an option with a value of its own', async () => {
            const api = gridsManager.createGrid('grid1', {
                columnDefs: [
                    { field: 'athlete' },
                    {
                        field: 'won',
                        filter: true,
                        filterParams: {
                            filterOptions: [
                                {
                                    displayKey: 'isValue',
                                    displayName: 'Is Value',
                                    numberOfInputs: 1,
                                    predicate: ([filterValue]: any[], cellValue: any) =>
                                        String(cellValue) === filterValue,
                                },
                            ],
                        },
                    },
                ],
                rowData: ROW_DATA,
                enableAdvancedFilter: true,
            });
            await asyncSetTimeout(0);
            const af = AdvancedFilterHarness.get(api);

            await af.applyExpression('[Won] Is Value "true"');
            await asyncSetTimeout(0);

            expect(api.getAdvancedFilterModel()).toEqual({
                filterType: 'boolean',
                colId: 'won',
                type: 'isValue',
                filter: 'true',
            });
            await new GridRows(api, 'boolean custom option with a value').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Bolt" won:true
                └── LEAF id:2 athlete:"Ada" won:true
            `);
        });
    });

    describe('a Multi Filter column', () => {
        const STARTS_A_ONLY = { filterOptions: ['contains', STARTS_A] };

        function multiFilterGrid(filterParams: any, id: string, advanced: boolean) {
            return gridsManager.createGrid<TestRow>(id, {
                columnDefs: [{ field: 'athlete', filter: 'agMultiColumnFilter', filterParams }],
                rowData: ROW_DATA,
                enableAdvancedFilter: advanced,
            });
        }

        // `filterOptions` belongs on the child; `IMultiFilterParams` carries `filters` and nothing about options.
        test('takes the options its child filter declares, as the column filter does', async () => {
            const params = {
                filters: [
                    { filter: 'agTextColumnFilter', filterParams: STARTS_A_ONLY },
                    { filter: 'agSetColumnFilter' },
                ],
            };
            const advanced = multiFilterGrid(params, 'grid1', true);
            const column = multiFilterGrid(params, 'grid2', false);
            await asyncSetTimeout(0);

            const af = AdvancedFilterHarness.get(advanced);
            await af.type('[Athlete] ');
            expect(af.autocompleteEntries()).toEqual(['contains', 'Starts With A']);

            await af.applyExpression('[Athlete] Starts With A');
            await column.setColumnFilterModel('athlete', {
                filterType: 'multi',
                filterModels: [{ filterType: 'text', type: 'startsA' }, null],
            });
            column.onFilterChanged();
            await asyncSetTimeout(0);

            expect(filteredAthletes(advanced)).toEqual(['Ada']);
            expect(filteredAthletes(column)).toEqual(filteredAthletes(advanced));
        });

        test('still reads a list written on its own params', async () => {
            const advanced = multiFilterGrid(STARTS_A_ONLY, 'grid1', true);
            await asyncSetTimeout(0);

            const af = AdvancedFilterHarness.get(advanced);
            await af.type('[Athlete] ');
            expect(af.autocompleteEntries()).toEqual(['contains', 'Starts With A']);
        });

        // The first child that declares a list wins, over a second child and over the parent's own params.
        test('the first child that declares a list is the one read', async () => {
            const advanced = multiFilterGrid(
                {
                    ...STARTS_A_ONLY,
                    filters: [
                        // An empty list offers nothing, so it is passed over rather than being the first found.
                        { filter: 'agTextColumnFilter', filterParams: { filterOptions: [] } },
                        { filter: 'agTextColumnFilter', filterParams: { filterOptions: [REGULAR_EXPRESSION] } },
                        { filter: 'agTextColumnFilter', filterParams: STARTS_A_ONLY },
                    ],
                },
                'grid1',
                true
            );
            await asyncSetTimeout(0);

            const af = AdvancedFilterHarness.get(advanced);
            await af.type('[Athlete] ');
            expect(af.autocompleteEntries()).toEqual(['Regular Expression']);
        });
    });

    describe('an option taking no value', () => {
        test('it parses, round-trips through the model and runs its predicate', async () => {
            const api = gridsManager.createGrid('grid1', opts());
            await asyncSetTimeout(0);
            const af = AdvancedFilterHarness.get(api);

            await af.applyExpression('[Athlete] Starts With A');
            await asyncSetTimeout(0);

            expect(api.getAdvancedFilterModel()).toEqual({
                filterType: 'text',
                colId: 'athlete',
                type: 'startsA',
            });
            await new GridRows(api, 'startsA').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:2 athlete:"Ada" age:28 won:true
            `);
        });

        test('a value left in the model by another option is dropped, not written out', async () => {
            const api = gridsManager.createGrid('grid1', opts());
            await asyncSetTimeout(0);

            api.setAdvancedFilterModel({ filterType: 'text', colId: 'athlete', type: 'startsA', filter: 'zzz' });
            api.onFilterChanged();
            await asyncSetTimeout(0);

            expect(AdvancedFilterHarness.get(api).value).toBe('[Athlete] Starts With A');
            expect(api.getAdvancedFilterModel()).toEqual({
                filterType: 'text',
                colId: 'athlete',
                type: 'startsA',
            });
            await new GridRows(api, 'stale operand slot ignored').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:2 athlete:"Ada" age:28 won:true
            `);
        });

        test('a model naming it is written back as the expression it came from', async () => {
            const api = gridsManager.createGrid('grid1', opts());
            await asyncSetTimeout(0);

            api.setAdvancedFilterModel({ filterType: 'number', colId: 'age', type: 'evenNumbers' });
            api.onFilterChanged();
            await asyncSetTimeout(0);

            expect(AdvancedFilterHarness.get(api).value).toBe('[Age] Even Numbers');
            await new GridRows(api, 'evenNumbers').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:1 athlete:"Ng" age:40 won:false
                └── LEAF id:2 athlete:"Ada" age:28 won:true
            `);
        });
    });

    describe('an option taking one value', () => {
        test('a quoted text value parses, round-trips and runs its predicate', async () => {
            const api = gridsManager.createGrid('grid1', opts());
            await asyncSetTimeout(0);
            const af = AdvancedFilterHarness.get(api);

            await af.applyExpression('[Athlete] Regular Expression "^(bolt|ada)$"');
            await asyncSetTimeout(0);

            expect(api.getAdvancedFilterModel()).toEqual({
                filterType: 'text',
                colId: 'athlete',
                type: 'regexp',
                filter: '^(bolt|ada)$',
            });
            await new GridRows(api, 'regexp').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Bolt" age:25 won:true
                └── LEAF id:2 athlete:"Ada" age:28 won:true
            `);
        });

        test('a value the option needs and has not got is reported', async () => {
            const api = gridsManager.createGrid('grid1', opts());
            await asyncSetTimeout(0);

            await AdvancedFilterHarness.get(api).applyExpression('[Athlete] Regular Expression');
            await asyncSetTimeout(0);

            await new FilterDom(api, 'incomplete one-value option').checkFilterDom(`
                ADVANCED FILTER
                input: "[Athlete] Regular Expression"
                valid: false — Expression has an error. Value is missing at end of expression.
                buttons: Apply ⊘ | Builder
                model: null
            `);
            await new GridRows(api, 'incomplete one-value option filters nothing').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Bolt" age:25 won:true
                ├── LEAF id:1 athlete:"Ng" age:40 won:false
                ├── LEAF id:2 athlete:"Ada" age:28 won:true
                └── LEAF id:3 athlete:"Wei" age:null won:false
            `);
        });
    });

    describe('an option taking two values', () => {
        test('unquoted numbers parse, round-trip and run the predicate, with or without the brackets', async () => {
            const api = gridsManager.createGrid('grid1', opts());
            await asyncSetTimeout(0);
            const af = AdvancedFilterHarness.get(api);

            const expected = {
                filterType: 'number',
                colId: 'age',
                type: 'betweenExclusive',
                filter: 24,
                filterTo: 30,
            };

            await af.applyExpression('[Age] Between (Exclusive) (24, 30)');
            await asyncSetTimeout(0);
            expect(api.getAdvancedFilterModel()).toEqual(expected);
            await new GridRows(api, 'betweenExclusive numbers').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Bolt" age:25 won:true
                └── LEAF id:2 athlete:"Ada" age:28 won:true
            `);

            // Cleared first: a rejected expression leaves the previous filter applied, so this would pass either way.
            await af.applyExpression('');
            await asyncSetTimeout(0);
            expect(api.getAdvancedFilterModel()).toBeNull();

            await af.applyExpression('[Age] Between (Exclusive) 24, 30');
            await asyncSetTimeout(0);
            expect(api.getAdvancedFilterModel()).toEqual(expected);
            await new GridRows(api, 'betweenExclusive unbracketed').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Bolt" age:25 won:true
                └── LEAF id:2 athlete:"Ada" age:28 won:true
            `);
        });

        test('quoted text values in brackets parse, round-trip and run the predicate', async () => {
            const api = gridsManager.createGrid('grid1', opts());
            await asyncSetTimeout(0);
            const af = AdvancedFilterHarness.get(api);

            await af.applyExpression('[Athlete] Between (Exclusive) ("Ada", "Ng")');
            await asyncSetTimeout(0);

            expect(api.getAdvancedFilterModel()).toEqual({
                filterType: 'text',
                colId: 'athlete',
                type: 'betweenExclusive',
                filter: 'Ada',
                filterTo: 'Ng',
            });
            await new GridRows(api, 'betweenExclusive text').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 athlete:"Bolt" age:25 won:true
            `);
        });

        test('a model naming it is written back as a bracketed pair', async () => {
            const api = gridsManager.createGrid('grid1', opts());
            await asyncSetTimeout(0);

            api.setAdvancedFilterModel({
                filterType: 'number',
                colId: 'age',
                type: 'betweenExclusive',
                filter: 24,
                filterTo: 30,
            });
            api.onFilterChanged();
            await asyncSetTimeout(0);

            expect(AdvancedFilterHarness.get(api).value).toBe('[Age] Between (Exclusive) (24, 30)');
        });

        test('it joins with other conditions, and a surrounding group keeps its own brackets', async () => {
            const api = gridsManager.createGrid('grid1', opts());
            await asyncSetTimeout(0);

            await AdvancedFilterHarness.get(api).applyExpression(
                '([Age] Between (Exclusive) (24, 30) OR [Athlete] Starts With A) AND [Athlete] contains "d"'
            );
            await asyncSetTimeout(0);

            expect(api.getAdvancedFilterModel()).toEqual({
                filterType: 'join',
                type: 'AND',
                conditions: [
                    {
                        filterType: 'join',
                        type: 'OR',
                        conditions: [
                            { filterType: 'number', colId: 'age', type: 'betweenExclusive', filter: 24, filterTo: 30 },
                            { filterType: 'text', colId: 'athlete', type: 'startsA' },
                        ],
                    },
                    { filterType: 'text', colId: 'athlete', type: 'contains', filter: 'd' },
                ],
            });
            await new GridRows(api, 'two-value option inside a group').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:2 athlete:"Ada" age:28 won:true
            `);
        });

        test('completing it opens the bracket, and the quote too where the values are quoted', async () => {
            const api = gridsManager.createGrid('grid1', opts());
            await asyncSetTimeout(0);
            const af = AdvancedFilterHarness.get(api);

            await af.type('[Age] Betw');
            await af.tabComplete();
            expect(af.value).toBe('[Age] Between (Exclusive) (');

            await af.type('[Athlete] Betw');
            await af.tabComplete();
            expect(af.value).toBe('[Athlete] Between (Exclusive) ("');
        });

        test('two dates are quoted, and round-trip through the model', async () => {
            const api = gridsManager.createGrid('grid1', {
                columnDefs: [
                    {
                        field: 'when',
                        cellDataType: 'dateString',
                        filter: 'agDateColumnFilter',
                        filterParams: { filterOptions: ['equals', DATE_BETWEEN_EXCLUSIVE] },
                    },
                ],
                rowData: [{ when: '2012-08-11' }, { when: '2012-08-20' }, { when: '2012-09-01' }],
                enableAdvancedFilter: true,
            });
            await asyncSetTimeout(0);

            const af = AdvancedFilterHarness.get(api);
            await af.applyExpression('[When] Between (Exclusive) ("2012-08-12", "2012-08-30")');
            await asyncSetTimeout(0);

            expect(api.getAdvancedFilterModel()).toEqual({
                filterType: 'dateString',
                colId: 'when',
                type: 'betweenExclusive',
                filter: '2012-08-12',
                filterTo: '2012-08-30',
            });
            await new GridRows(api, 'date betweenExclusive').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:1 when:"2012-08-20"
            `);

            // Written back out of the model in the same syntax it was read from.
            api.setAdvancedFilterModel(api.getAdvancedFilterModel());
            await asyncSetTimeout(0);
            expect(af.value).toBe('[When] Between (Exclusive) ("2012-08-12", "2012-08-30")');
        });

        test('only one value given is reported as a missing value', async () => {
            const api = gridsManager.createGrid('grid1', opts());
            await asyncSetTimeout(0);

            await AdvancedFilterHarness.get(api).applyExpression('[Age] Between (Exclusive) (24)');
            await asyncSetTimeout(0);

            await new FilterDom(api, 'one value of two').checkFilterDom(`
                ADVANCED FILTER
                input: "[Age] Between (Exclusive) (24)"
                valid: false — Expression has an error. Value is missing - (24).
                buttons: Apply ⊘ | Builder
                model: null
            `);
            expect(api.getDisplayedRowCount()).toBe(4);
        });

        test('an unbracketed pair cut short by the group bracket is rejected, and the group still ends', async () => {
            const api = gridsManager.createGrid('grid1', opts());
            await asyncSetTimeout(0);

            await AdvancedFilterHarness.get(api).applyExpression(
                '([Age] Between (Exclusive) 24 OR [Athlete] Starts With A)'
            );
            await asyncSetTimeout(0);

            await new FilterDom(api, 'unbracketed pair cut short in a group').checkFilterDom(`
                ADVANCED FILTER
                input: "([Age] Between (Exclusive) 24 OR [Athlete] Starts With A)"
                valid: false — Expression has an error. Value is missing - 24 O.
                buttons: Apply ⊘ | Builder
                model: null
            `);
            expect(api.getDisplayedRowCount()).toBe(4);
        });

        test('a second value missing after the comma is reported as a missing value', async () => {
            const api = gridsManager.createGrid('grid1', opts());
            await asyncSetTimeout(0);

            await AdvancedFilterHarness.get(api).applyExpression('[Age] Between (Exclusive) (24, )');
            await asyncSetTimeout(0);

            await new FilterDom(api, 'second value missing').checkFilterDom(`
                ADVANCED FILTER
                input: "[Age] Between (Exclusive) (24, )"
                valid: false — Expression has an error. Value is missing - (24, ).
                buttons: Apply ⊘ | Builder
                model: null
            `);
            expect(api.getDisplayedRowCount()).toBe(4);
        });

        test('an unclosed bracket is reported as a missing end bracket, whatever follows it', async () => {
            const api = gridsManager.createGrid('grid1', opts());
            await asyncSetTimeout(0);
            const af = AdvancedFilterHarness.get(api);

            await af.applyExpression('[Age] Between (Exclusive) (24, 30');
            await asyncSetTimeout(0);
            await new FilterDom(api, 'end bracket missing at the end').checkFilterDom(`
                ADVANCED FILTER
                input: "[Age] Between (Exclusive) (24, 30"
                valid: false — Expression has an error. Missing end bracket at end of expression.
                buttons: Apply ⊘ | Builder
                model: null
            `);

            // The same fault, reported the same way, when the expression carries on past it.
            await af.applyExpression('[Age] Between (Exclusive) (24, 30 AND [Athlete] contains "d"');
            await asyncSetTimeout(0);
            await new FilterDom(api, 'end bracket missing mid-expression').checkFilterDom(`
                ADVANCED FILTER
                input: "[Age] Between (Exclusive) (24, 30 AND [Athlete] contains "d""
                valid: false — Expression has an error. Missing end bracket - (24, 30 A.
                buttons: Apply ⊘ | Builder
                model: null
            `);
        });

        test('a separator before the first value is reported as a missing value', async () => {
            const api = gridsManager.createGrid('grid1', opts());
            await asyncSetTimeout(0);

            await AdvancedFilterHarness.get(api).applyExpression('[Age] Between (Exclusive) (, 30)');
            await asyncSetTimeout(0);

            await new FilterDom(api, 'separator before the first value').checkFilterDom(`
                ADVANCED FILTER
                input: "[Age] Between (Exclusive) (, 30)"
                valid: false — Expression has an error. Value is missing - (,.
                buttons: Apply ⊘ | Builder
                model: null
            `);
            expect(api.getDisplayedRowCount()).toBe(4);
        });

        test('two values with no separator are reported as a missing value', async () => {
            const api = gridsManager.createGrid('grid1', opts());
            await asyncSetTimeout(0);

            await AdvancedFilterHarness.get(api).applyExpression('[Age] Between (Exclusive) (24 30)');
            await asyncSetTimeout(0);

            await new FilterDom(api, 'no separator').checkFilterDom(`
                ADVANCED FILTER
                input: "[Age] Between (Exclusive) (24 30)"
                valid: false — Expression has an error. Value is missing - (24 3.
                buttons: Apply ⊘ | Builder
                model: null
            `);
            expect(api.getDisplayedRowCount()).toBe(4);
        });

        test('more values than the option takes are rejected', async () => {
            const api = gridsManager.createGrid('grid1', opts());
            await asyncSetTimeout(0);

            await AdvancedFilterHarness.get(api).applyExpression('[Age] Between (Exclusive) (24, 30, 50)');
            await asyncSetTimeout(0);

            await new FilterDom(api, 'three values').checkFilterDom(`
                ADVANCED FILTER
                input: "[Age] Between (Exclusive) (24, 30, 50)"
                valid: false — Expression has an error. Missing end bracket - (24, 30,.
                buttons: Apply ⊘ | Builder
                model: null
            `);
            expect(api.getDisplayedRowCount()).toBe(4);
        });

        test('a quoted value carries the separators the region reads', async () => {
            const api = gridsManager.createGrid('grid1', opts());
            await asyncSetTimeout(0);
            const af = AdvancedFilterHarness.get(api);

            await af.applyExpression('[Athlete] Between (Exclusive) ("a, b", "c (d)")');
            await asyncSetTimeout(0);

            expect(api.getAdvancedFilterModel()).toEqual({
                filterType: 'text',
                colId: 'athlete',
                type: 'betweenExclusive',
                filter: 'a, b',
                filterTo: 'c (d)',
            });

            api.setAdvancedFilterModel(api.getAdvancedFilterModel());
            await asyncSetTimeout(0);
            expect(af.value).toBe('[Athlete] Between (Exclusive) ("a, b", "c (d)")');
        });

        test('the brackets stay optional inside a group', async () => {
            const api = gridsManager.createGrid('grid1', opts());
            await asyncSetTimeout(0);

            await AdvancedFilterHarness.get(api).applyExpression(
                '([Age] Between (Exclusive) 24, 30 OR [Athlete] Starts With A)'
            );
            await asyncSetTimeout(0);

            expect(api.getAdvancedFilterModel()).toEqual({
                filterType: 'join',
                type: 'OR',
                conditions: [
                    { filterType: 'number', colId: 'age', type: 'betweenExclusive', filter: 24, filterTo: 30 },
                    { filterType: 'text', colId: 'athlete', type: 'startsA' },
                ],
            });
            await new GridRows(api, 'unbracketed pair inside a group').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Bolt" age:25 won:true
                └── LEAF id:2 athlete:"Ada" age:28 won:true
            `);
        });

        // Text and dateString have their own tests above, so this covers the two `Date`-valued types.
        test('two dates and two date-times are quoted, and round-trip through the model', async () => {
            const api = gridsManager.createGrid('grid1', {
                columnDefs: [
                    {
                        field: 'day',
                        cellDataType: 'date',
                        filter: 'agDateColumnFilter',
                        filterParams: { filterOptions: [BETWEEN_EXCLUSIVE] },
                    },
                    {
                        field: 'moment',
                        cellDataType: 'dateTime',
                        filter: 'agDateColumnFilter',
                        filterParams: { filterOptions: [BETWEEN_EXCLUSIVE] },
                    },
                ],
                rowData: [
                    { day: new Date(2012, 7, 5), moment: new Date(2012, 7, 5, 9, 30, 0) },
                    { day: new Date(2012, 7, 20), moment: new Date(2012, 7, 20, 9, 30, 0) },
                ],
                enableAdvancedFilter: true,
            });
            await asyncSetTimeout(0);
            const af = AdvancedFilterHarness.get(api);

            await af.applyExpression('[Day] Between (Exclusive) ("2012-08-10", "2012-08-25")');
            await asyncSetTimeout(0);
            expect(api.getAdvancedFilterModel()).toEqual({
                filterType: 'date',
                colId: 'day',
                type: 'betweenExclusive',
                filter: '2012-08-10',
                filterTo: '2012-08-25',
            });
            // Which row, not how many: an inverted comparison also leaves one of the two standing.
            await new GridRows(api, 'the date pair filters').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:1 day:"2012-08-20" moment:"2012-08-20T09:30:00"
            `);
            api.setAdvancedFilterModel(api.getAdvancedFilterModel());
            await asyncSetTimeout(0);
            expect(af.value).toBe('[Day] Between (Exclusive) ("2012-08-10", "2012-08-25")');

            await af.applyExpression('[Moment] Between (Exclusive) ("2012-08-10T00:00:00", "2012-08-25T00:00:00")');
            await asyncSetTimeout(0);
            expect(api.getAdvancedFilterModel()).toEqual({
                filterType: 'dateTime',
                colId: 'moment',
                type: 'betweenExclusive',
                filter: '2012-08-10T00:00:00',
                filterTo: '2012-08-25T00:00:00',
            });
            await new GridRows(api, 'the date-time pair filters').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:1 day:"2012-08-20" moment:"2012-08-20T09:30:00"
            `);
        });

        // The model member is a decimal string while the predicate is handed a `bigint`.
        test('two bigints round-trip through the model and reach the predicate as bigints', async () => {
            const seen: unknown[][] = [];
            const api = gridsManager.createGrid('grid1', {
                columnDefs: [
                    {
                        field: 'count',
                        cellDataType: 'bigint',
                        filter: 'agBigIntColumnFilter',
                        filterParams: {
                            filterOptions: [
                                {
                                    ...BETWEEN_EXCLUSIVE,
                                    predicate: ([from, to]: any[], cellValue: any) => {
                                        seen.push([typeof from, typeof to, typeof cellValue]);
                                        return cellValue != null && cellValue > from && cellValue < to;
                                    },
                                },
                            ],
                        },
                    },
                ],
                rowData: [{ count: 10n }, { count: 20n }, { count: 30n }],
                enableAdvancedFilter: true,
            });
            await asyncSetTimeout(0);
            const af = AdvancedFilterHarness.get(api);

            await af.applyExpression('[Count] Between (Exclusive) (15, 25)');
            await asyncSetTimeout(0);
            expect(api.getAdvancedFilterModel()).toEqual({
                filterType: 'bigint',
                colId: 'count',
                type: 'betweenExclusive',
                filter: '15',
                filterTo: '25',
            });
            expect(seen[0]).toEqual(['bigint', 'bigint', 'bigint']);
            await new GridRows(api, 'betweenExclusive bigint').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:1 count:"20n"
            `);

            api.setAdvancedFilterModel(api.getAdvancedFilterModel());
            await asyncSetTimeout(0);
            expect(af.value).toBe('[Count] Between (Exclusive) (15, 25)');
        });

        test('two date-time strings are quoted and round-trip through the model', async () => {
            const seen: unknown[] = [];
            const api = gridsManager.createGrid('grid1', {
                columnDefs: [
                    {
                        field: 'stamp',
                        cellDataType: 'dateTimeString',
                        filter: 'agDateColumnFilter',
                        filterParams: {
                            filterOptions: [
                                {
                                    ...DATE_BETWEEN_EXCLUSIVE,
                                    // The cell is the raw string; the operands arrive parsed, as for a date column.
                                    predicate: ([from, to]: any[], cellValue: any) => {
                                        seen.push([from instanceof Date, to instanceof Date, typeof cellValue]);
                                        return (
                                            cellValue != null &&
                                            new Date(cellValue.replace(' ', 'T')) > from &&
                                            new Date(cellValue.replace(' ', 'T')) < to
                                        );
                                    },
                                },
                            ],
                        },
                    },
                ],
                rowData: [{ stamp: '2012-08-05 10:30:00' }, { stamp: '2012-08-20 10:30:00' }],
                enableAdvancedFilter: true,
            });
            await asyncSetTimeout(0);
            const af = AdvancedFilterHarness.get(api);

            await af.applyExpression('[Stamp] Between (Exclusive) ("2012-08-10 00:00:00", "2012-08-25 00:00:00")');
            await asyncSetTimeout(0);
            expect(api.getAdvancedFilterModel()).toEqual({
                filterType: 'dateTimeString',
                colId: 'stamp',
                type: 'betweenExclusive',
                filter: '2012-08-10T00:00:00',
                filterTo: '2012-08-25T00:00:00',
            });
            expect(seen[0]).toEqual([true, true, 'string']);
            await new GridRows(api, 'betweenExclusive dateTimeString').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:1 stamp:"2012-08-20 10:30:00"
            `);

            // Both separators parse, and a model is written back in the one the model itself stores.
            api.setAdvancedFilterModel(api.getAdvancedFilterModel());
            await asyncSetTimeout(0);
            expect(af.value).toBe('[Stamp] Between (Exclusive) ("2012-08-10T00:00:00", "2012-08-25T00:00:00")');

            await af.applyExpression(af.value);
            await asyncSetTimeout(0);
            expect(api.getAdvancedFilterModel()).toEqual({
                filterType: 'dateTimeString',
                colId: 'stamp',
                type: 'betweenExclusive',
                filter: '2012-08-10T00:00:00',
                filterTo: '2012-08-25T00:00:00',
            });
        });

        test('two object values are quoted and round-trip through the model', async () => {
            const api = gridsManager.createGrid('grid1', {
                columnDefs: [
                    {
                        field: 'tag',
                        cellDataType: 'object',
                        valueFormatter: ({ value }: { value: { name: string } | null }) => value?.name ?? '',
                        filter: 'agTextColumnFilter',
                        filterParams: { filterOptions: [BETWEEN_EXCLUSIVE] },
                    },
                ],
                rowData: [{ tag: { name: 'Ada' } }, { tag: { name: 'Bolt' } }, { tag: { name: 'Wei' } }],
                enableAdvancedFilter: true,
            });
            await asyncSetTimeout(0);
            const af = AdvancedFilterHarness.get(api);

            await af.applyExpression('[Tag] Between (Exclusive) ("Ada", "Wei")');
            await asyncSetTimeout(0);
            expect(api.getAdvancedFilterModel()).toEqual({
                filterType: 'object',
                colId: 'tag',
                type: 'betweenExclusive',
                filter: 'Ada',
                filterTo: 'Wei',
            });
            await new GridRows(api, 'betweenExclusive object').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:1 tag:"Bolt"
            `);

            api.setAdvancedFilterModel(api.getAdvancedFilterModel());
            await asyncSetTimeout(0);
            expect(af.value).toBe('[Tag] Between (Exclusive) ("Ada", "Wei")');
        });

        test('a model short of its second value is written out and rejected, not silently halved', async () => {
            const api = gridsManager.createGrid('grid1', opts());
            await asyncSetTimeout(0);

            api.setAdvancedFilterModel({
                filterType: 'number',
                colId: 'age',
                type: 'betweenExclusive',
                filter: 24,
            });
            api.onFilterChanged();
            await asyncSetTimeout(0);

            await new FilterDom(api, 'model missing filterTo').checkFilterDom(`
                ADVANCED FILTER
                input: "[Age] Between (Exclusive) (24, )"
                valid: false — Expression has an error. Value is missing - (24, ).
                buttons: Apply ⊘ | Builder
                model: null
            `);
            expect(api.getDisplayedRowCount()).toBe(4);
        });

        // A `,` ends a value in this region, so an operand that contains one has to be written quoted.
        test('a numberFormatter writing a separator has both values quoted, and reads back', async () => {
            const api = gridsManager.createGrid('grid1', {
                columnDefs: [
                    {
                        field: 'age',
                        filter: 'agNumberColumnFilter',
                        filterParams: {
                            filterOptions: AGE_OPTIONS,
                            numberFormatter: (value: number | null) =>
                                value == null ? null : value.toLocaleString('en-US'),
                            numberParser: (text: string | null) => {
                                const digits = text?.replace(/[^\d]/g, '');
                                return digits ? Number(digits) : null;
                            },
                        },
                    },
                ],
                rowData: [{ age: 1234 }, { age: 5678 }, { age: 999999 }],
                enableAdvancedFilter: true,
            });
            await asyncSetTimeout(0);

            api.setAdvancedFilterModel({
                filterType: 'number',
                colId: 'age',
                type: 'betweenExclusive',
                filter: 1000,
                filterTo: 9999,
            });
            api.onFilterChanged();
            await asyncSetTimeout(0);

            const af = AdvancedFilterHarness.get(api);
            expect(af.value).toBe('[Age] Between (Exclusive) ("1,000", "9,999")');
            await new GridRows(api, 'grouped two-value operands').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 age:1234
                └── LEAF id:1 age:5678
            `);

            await af.applyExpression('');
            await asyncSetTimeout(0);
            await af.applyExpression('[Age] Between (Exclusive) ("1,000", "9,999")');
            await asyncSetTimeout(0);
            expect(api.getAdvancedFilterModel()).toEqual({
                filterType: 'number',
                colId: 'age',
                type: 'betweenExclusive',
                filter: 1000,
                filterTo: 9999,
            });
        });
    });

    describe('replacing a built-in option', () => {
        test('the column filter and the Advanced Filter both run the replacement', async () => {
            const columnDefs: GridOptions<TestRow>['columnDefs'] = [
                {
                    field: 'athlete',
                    filter: 'agTextColumnFilter',
                    filterParams: { filterOptions: [CONTAINS_BACKWARDS, 'equals'] },
                },
            ];
            const advanced = gridsManager.createGrid('grid1', {
                columnDefs,
                rowData: ROW_DATA,
                enableAdvancedFilter: true,
            });
            const column = gridsManager.createGrid('grid2', { columnDefs, rowData: ROW_DATA });
            await asyncSetTimeout(0);

            const af = AdvancedFilterHarness.get(advanced);
            await af.type('[Athlete] ');
            expect(af.autocompleteEntries()).toEqual(['contains backwards', 'equals']);

            // 'tloB' contains 'lo'; 'Bolt' does not.
            await af.applyExpression('[Athlete] contains backwards "lo"');
            await column.setColumnFilterModel('athlete', { filterType: 'text', type: 'contains', filter: 'lo' });
            column.onFilterChanged();
            await asyncSetTimeout(0);

            expect(filteredAthletes(advanced)).toEqual(['Bolt']);
            expect(filteredAthletes(column)).toEqual(filteredAthletes(advanced));
        });

        // Two values are bounds whoever declares them, so a custom option taking a pair is held to the same
        // ordering rule as the built-in range, in the Advanced Filter as it already is in the column filter.
        test('a replacement of the range option is asked to put its values in order, as in the column filter', async () => {
            const columnDefs: GridOptions<TestRow>['columnDefs'] = [
                { field: 'age', filter: 'agNumberColumnFilter', filterParams: { filterOptions: ['equals', OUTSIDE] } },
            ];
            const api = gridsManager.createGrid('grid1', { ...opts(), columnDefs });
            await asyncSetTimeout(0);
            const af = AdvancedFilterHarness.get(api);

            await af.applyExpression('[Age] is outside (21, 38)');
            await asyncSetTimeout(0);
            expect(api.getAdvancedFilterModel()).toEqual({
                filterType: 'number',
                colId: 'age',
                type: 'inRange',
                filter: 21,
                filterTo: 38,
            });

            await af.applyExpression('[Age] is outside (38, 21)');
            await asyncSetTimeout(0);
            await new FilterDom(api, 'a reversed custom pair').checkFilterDom(`
                ADVANCED FILTER
                input: "[Age] is outside (38, 21)"
                valid: false — Expression has an error. Must be greater than 38.
                buttons: Apply ⊘ | Builder
                model:
                  filterType: "number"
                  colId: "age"
                  type: "inRange"
                  filter: 21
                  filterTo: 38
            `);
        });
    });

    describe('predicate parity with the column filter', () => {
        async function createParityGrids(): Promise<{ advanced: GridApi<TestRow>; column: GridApi<TestRow> }> {
            const advanced = gridsManager.createGrid<TestRow>('grid1', opts());
            const column = gridsManager.createGrid<TestRow>('grid2', {
                columnDefs: opts().columnDefs,
                rowData: ROW_DATA,
            });
            await asyncSetTimeout(0);
            return { advanced, column };
        }

        test('an option filters the same rows as the column filter, whatever number of values it takes', async () => {
            const { advanced, column } = await createParityGrids();
            const applyBoth = async (colId: 'athlete' | 'age', model: any, expected: string[]) => {
                advanced.setAdvancedFilterModel({ ...model, colId });
                advanced.onFilterChanged();
                // Column filters are per column and would otherwise stack, so the other is cleared each time.
                await column.setColumnFilterModel(colId === 'athlete' ? 'age' : 'athlete', null);
                await column.setColumnFilterModel(colId, model);
                column.onFilterChanged();
                await asyncSetTimeout(0);
                expectSameAthletes(advanced, column, expected);
            };

            await applyBoth('athlete', { filterType: 'text', type: 'startsA' }, ['Ada']);
            await applyBoth('athlete', { filterType: 'text', type: 'regexp', filter: 'a' }, ['Ada']);
            await applyBoth('age', { filterType: 'number', type: 'betweenExclusive', filter: 24, filterTo: 30 }, [
                'Bolt',
                'Ada',
            ]);
        });

        // One option used twice: with two, a list hoisted onto the operator would still look clean.
        test('a predicate that mutates its operands does not reach the next call', async () => {
            const seen: any[][] = [];
            const api = gridsManager.createGrid('grid1', {
                columnDefs: [
                    {
                        field: 'athlete',
                        filter: 'agTextColumnFilter',
                        filterParams: {
                            filterOptions: [
                                {
                                    displayKey: 'records',
                                    displayName: 'Records',
                                    numberOfInputs: 1,
                                    predicate: (values: any[]) => {
                                        seen.push([...values]);
                                        values.push('polluted');
                                        return true;
                                    },
                                },
                            ],
                        },
                    },
                ],
                rowData: ROW_DATA,
                enableAdvancedFilter: true,
            });
            await asyncSetTimeout(0);

            await AdvancedFilterHarness.get(api).applyExpression('[Athlete] Records "x" AND [Athlete] Records "y"');
            await asyncSetTimeout(0);

            // Two conditions over four rows, each call handed its own operand and nothing else.
            expect(seen).toEqual([['x'], ['y'], ['x'], ['y'], ['x'], ['y'], ['x'], ['y']]);
        });
    });

    // What survives classification, and what the survivors are called.
    describe('malformed options and name resolution', () => {
        test('an entry missing a required property is dropped and reported', async () => {
            // Deliberate: the option is missing `displayName`/`predicate`, which triggers warning #72.
            enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [72] });
            const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
            const api = gridsManager.createGrid('grid1', {
                columnDefs: [
                    {
                        field: 'athlete',
                        filter: 'agTextColumnFilter',
                        filterParams: { filterOptions: ['contains', { displayKey: 'broken' } as IFilterOptionDef] },
                    },
                ],
                rowData: ROW_DATA,
                enableAdvancedFilter: true,
            });
            await asyncSetTimeout(0);
            const af = AdvancedFilterHarness.get(api);

            await af.type('[Athlete] ');
            expect(af.autocompleteEntries()).toEqual(['contains']);
            const message = warn.mock.calls.flat().join(' ');
            expect(message).toContain('warning #72');
            expect(message).toContain('displayName');
            expect(message).toContain('predicate');
        });

        // A locale lookup on the `displayKey` replaces the `displayName` rather than sitting beside it.
        test('a localised name is the one the expression is written in', async () => {
            const api = gridsManager.createGrid('grid1', {
                columnDefs: [
                    {
                        field: 'athlete',
                        filter: 'agTextColumnFilter',
                        filterParams: { filterOptions: ['contains', STARTS_A] },
                    },
                ],
                rowData: ROW_DATA,
                enableAdvancedFilter: true,
                localeText: { startsA: 'Commence par A' },
            });
            await asyncSetTimeout(0);
            const af = AdvancedFilterHarness.get(api);

            await af.type('[Athlete] ');
            expect(af.autocompleteEntries()).toEqual(['contains', 'Commence par A']);

            await af.applyExpression('[Athlete] Commence par A');
            await asyncSetTimeout(0);
            expect(api.getAdvancedFilterModel()).toEqual({ filterType: 'text', colId: 'athlete', type: 'startsA' });
            await new GridRows(api, 'the localised name filters').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:2 athlete:"Ada"
            `);

            // Cleared first: an invalid expression leaves the previous filter applied, reading as the old name.
            await af.applyExpression('');
            await asyncSetTimeout(0);
            await af.applyExpression('[Athlete] Starts With A');
            await asyncSetTimeout(0);
            expect(api.getAdvancedFilterModel()).toBeNull();
        });

        // An expression is written in the name, so an option that resolves to none takes its key as one.
        test('an entry whose displayName is empty, or nothing but space, is offered under its displayKey', async () => {
            const api = gridsManager.createGrid('grid1', {
                columnDefs: [
                    {
                        field: 'athlete',
                        filter: 'agTextColumnFilter',
                        filterParams: {
                            filterOptions: [
                                'contains',
                                {
                                    displayKey: 'startsA',
                                    displayName: '',
                                    numberOfInputs: 0,
                                    predicate: (_values: any[], cellValue: any) =>
                                        typeof cellValue === 'string' && cellValue.startsWith('A'),
                                },
                            ],
                        },
                    },
                ],
                rowData: ROW_DATA,
                enableAdvancedFilter: true,
            });
            await asyncSetTimeout(0);

            const af = AdvancedFilterHarness.get(api);
            await af.type('[Athlete] ');
            expect(af.autocompleteEntries()).toEqual(['contains', 'startsA']);

            // A name that is nothing but space resolves to blank too, so it takes the key the same way.
            api.setGridOption('columnDefs', [
                {
                    field: 'athlete',
                    filter: 'agTextColumnFilter',
                    filterParams: { filterOptions: ['contains', { ...STARTS_A, displayName: '   ' }] },
                },
            ]);
            await asyncSetTimeout(0);
            await af.type('');
            await af.type('[Athlete] ');
            expect(af.autocompleteEntries()).toEqual(['contains', 'startsA']);

            await af.applyExpression('[Athlete] startsA');
            await asyncSetTimeout(0);
            await new GridRows(api, 'the key spells the option').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:2 athlete:"Ada"
            `);

            expect(api.getAdvancedFilterModel()).toEqual({
                filterType: 'text',
                colId: 'athlete',
                type: 'startsA',
            });

            api.setAdvancedFilterModel(api.getAdvancedFilterModel());
            await asyncSetTimeout(0);
            expect(af.value).toBe('[Athlete] startsA');
        });

        // A key stands in as a name, so it faces the grammar the display names already do.
        test('a displayKey standing in as the name carries a space, and round-trips', async () => {
            const api = gridsManager.createGrid('grid1', {
                columnDefs: [
                    {
                        field: 'athlete',
                        filter: 'agTextColumnFilter',
                        filterParams: {
                            filterOptions: ['contains', { ...STARTS_A, displayKey: 'starts a', displayName: '' }],
                        },
                    },
                ],
                rowData: ROW_DATA,
                enableAdvancedFilter: true,
            });
            await asyncSetTimeout(0);
            const af = AdvancedFilterHarness.get(api);

            await af.type('[Athlete] ');
            expect(af.autocompleteEntries()).toEqual(['contains', 'starts a']);

            await af.applyExpression('[Athlete] starts a');
            await asyncSetTimeout(0);
            await new GridRows(api, 'a key of two words filters').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:2 athlete:"Ada"
            `);
            expect(api.getAdvancedFilterModel()).toEqual({
                filterType: 'text',
                colId: 'athlete',
                type: 'starts a',
            });

            api.setAdvancedFilterModel(api.getAdvancedFilterModel());
            await asyncSetTimeout(0);
            expect(af.value).toBe('[Athlete] starts a');
        });

        // The name is trimmed to what can be spelled; the model goes on holding the key as configured.
        test('a padded displayKey is spelled trimmed and stored as written', async () => {
            const api = gridsManager.createGrid('grid1', {
                columnDefs: [
                    {
                        field: 'athlete',
                        filter: 'agTextColumnFilter',
                        filterParams: { filterOptions: [{ ...STARTS_A, displayKey: '  startsA  ', displayName: '' }] },
                    },
                ],
                rowData: ROW_DATA,
                enableAdvancedFilter: true,
            });
            await asyncSetTimeout(0);
            const af = AdvancedFilterHarness.get(api);

            await af.type('[Athlete] ');
            expect(af.autocompleteEntries()).toEqual(['startsA']);

            await af.applyExpression('[Athlete] startsA');
            await asyncSetTimeout(0);
            expect(api.getAdvancedFilterModel()).toEqual({
                filterType: 'text',
                colId: 'athlete',
                type: '  startsA  ',
            });

            api.setAdvancedFilterModel(api.getAdvancedFilterModel());
            await asyncSetTimeout(0);
            expect(af.value).toBe('[Athlete] startsA');
        });

        test('a list that keeps nothing leaves the built-ins standing, as it does for the column filter', async () => {
            enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [72] });
            const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
            const api = gridsManager.createGrid('grid1', {
                columnDefs: [
                    {
                        field: 'athlete',
                        filter: 'agTextColumnFilter',
                        filterParams: { filterOptions: [{ displayKey: 'broken' } as IFilterOptionDef] },
                    },
                ],
                rowData: ROW_DATA,
                enableAdvancedFilter: true,
            });
            await asyncSetTimeout(0);

            const af = AdvancedFilterHarness.get(api);
            await af.type('[Athlete] ');
            expect(af.autocompleteEntries()).toContain('ends with');
            expect(warn.mock.calls.flat().join(' ')).toContain('warning #72');
        });

        test('a name with space around it is offered and written without it', async () => {
            const api = gridsManager.createGrid('grid1', {
                columnDefs: [
                    {
                        field: 'athlete',
                        filter: 'agTextColumnFilter',
                        filterParams: { filterOptions: [{ ...STARTS_A, displayName: ' Starts With A ' }] },
                    },
                ],
                rowData: ROW_DATA,
                enableAdvancedFilter: true,
            });
            await asyncSetTimeout(0);
            const af = AdvancedFilterHarness.get(api);

            await af.type('[Athlete] ');
            expect(af.autocompleteEntries()).toEqual(['Starts With A']);

            await af.applyExpression('[Athlete] Starts With A');
            await asyncSetTimeout(0);
            await new GridRows(api, 'a name trimmed to what the grammar can spell').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:2 athlete:"Ada"
            `);
        });

        // Named by its key, it is an option like any other, so the list narrows to it as any list does.
        test('an option declaring more inputs than the grammar has takes two', async () => {
            const api = gridsManager.createGrid('grid1', {
                columnDefs: [
                    {
                        field: 'age',
                        filter: 'agNumberColumnFilter',
                        filterParams: {
                            // `numberOfInputs` is declared `0 | 1 | 2`, which is no check on a JS caller.
                            filterOptions: [{ ...BETWEEN_EXCLUSIVE, numberOfInputs: 3 as unknown as 2 }],
                        },
                    },
                ],
                rowData: ROW_DATA,
                enableAdvancedFilter: true,
            });
            await asyncSetTimeout(0);

            await AdvancedFilterHarness.get(api).applyExpression('[Age] Between (Exclusive) (24, 30)');
            await asyncSetTimeout(0);

            expect(api.getAdvancedFilterModel()).toEqual({
                filterType: 'number',
                colId: 'age',
                type: 'betweenExclusive',
                filter: 24,
                filterTo: 30,
            });
        });
    });

    describe('the Builder', () => {
        test('the option dropdown offers the column custom options', async () => {
            const api = gridsManager.createGrid('grid1', opts());
            await asyncSetTimeout(0);
            api.setAdvancedFilterModel({ filterType: 'text', colId: 'athlete', type: 'startsA' });
            api.onFilterChanged();
            await asyncSetTimeout(0);

            const builder = await AdvancedFilterBuilderHarness.open(api);
            const [condition] = await builder.conditionItems();

            expect(await builder.operatorOptions(condition)).toEqual([
                'contains',
                'Starts With A',
                'Regular Expression',
                'Between (Exclusive)',
            ]);
            expect(builder.valuePills(condition)).toHaveLength(0);
        });

        test('an option taking two values gets a pill each, and applying them sets both', async () => {
            const api = gridsManager.createGrid('grid1', opts());
            await asyncSetTimeout(0);
            api.setAdvancedFilterModel({ filterType: 'number', colId: 'age', type: 'evenNumbers' });
            api.onFilterChanged();
            await asyncSetTimeout(0);

            const builder = await AdvancedFilterBuilderHarness.open(api);
            const [condition] = await builder.conditionItems();
            expect(builder.valuePills(condition)).toHaveLength(0);

            await builder.selectOperator(condition, 'Between (Exclusive)');
            expect(builder.valuePills(condition)).toHaveLength(2);

            await builder.setValue(condition, '24', 0);
            await builder.setValue(condition, '30', 1);
            await builder.apply();
            await asyncSetTimeout(0);

            expect(api.getAdvancedFilterModel()).toEqual({
                filterType: 'number',
                colId: 'age',
                type: 'betweenExclusive',
                filter: 24,
                filterTo: 30,
            });
            await new GridRows(api, 'builder two-value option').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Bolt" age:25 won:true
                └── LEAF id:2 athlete:"Ada" age:28 won:true
            `);
        });

        test('a loaded two-value model shows both values, and dropping to one value drops the second', async () => {
            const api = gridsManager.createGrid('grid1', opts());
            await asyncSetTimeout(0);
            api.setAdvancedFilterModel({
                filterType: 'text',
                colId: 'athlete',
                type: 'betweenExclusive',
                filter: 'Ada',
                filterTo: 'Ng',
            });
            api.onFilterChanged();
            await asyncSetTimeout(0);

            const builder = await AdvancedFilterBuilderHarness.open(api);
            const [condition] = await builder.conditionItems();
            // The input pill quotes a text value itself.
            expect(builder.valuePillText(condition, 0)).toBe('"Ada"');
            expect(builder.valuePillText(condition, 1)).toBe('"Ng"');

            await builder.selectOperator(condition, 'Regular Expression');
            expect(builder.valuePills(condition)).toHaveLength(1);

            await builder.setValue(condition, 'a');
            await builder.apply();
            await asyncSetTimeout(0);

            expect(api.getAdvancedFilterModel()).toEqual({
                filterType: 'text',
                colId: 'athlete',
                type: 'regexp',
                filter: 'a',
            });
        });

        test('a typed expression restores as pills, whatever number of values the option takes', async () => {
            const api = gridsManager.createGrid('grid1', opts());
            await asyncSetTimeout(0);
            await AdvancedFilterHarness.get(api).applyExpression(
                '[Athlete] Starts With A OR [Age] Between (Exclusive) (24, 30)'
            );
            await asyncSetTimeout(0);

            const builder = await AdvancedFilterBuilderHarness.open(api);
            const [startsWithA, between] = await builder.conditionItems();

            expect(builder.valuePills(startsWithA)).toHaveLength(0);
            expect(builder.valuePills(between)).toHaveLength(2);
            expect(builder.valuePillText(between, 0)).toBe('24');
            expect(builder.valuePillText(between, 1)).toBe('30');
        });

        test('the two value pills are named From and To for a screen reader', async () => {
            const api = gridsManager.createGrid('grid1', opts());
            await asyncSetTimeout(0);
            api.setAdvancedFilterModel({
                filterType: 'number',
                colId: 'age',
                type: 'betweenExclusive',
                filter: 24,
                filterTo: 30,
            });
            api.onFilterChanged();
            await asyncSetTimeout(0);

            const builder = await AdvancedFilterBuilderHarness.open(api);
            const [condition] = await builder.conditionItems();

            // The column filter's own from/to labels, so the pair reads the same wherever the user meets it.
            const pills = builder.valuePills(condition);
            expect(pills.map((pill) => pill.getAttribute('aria-label'))).toEqual([
                'Filter from value',
                'Filter to value',
            ]);
            expect(pills.map((pill, index) => builder.valuePillText(condition, index))).toEqual(['24', '30']);
            // happy-dom does not walk tab order, so assert what decides it: absent reads `-1`, as a skip does.
            expect(pills.map((pill) => pill.tabIndex)).toEqual([0, 0]);

            // One value, so there is no pair to tell apart, and the pill left behind is still in the tab order.
            await builder.selectOperator(condition, '=');
            const remaining = builder.valuePills(condition);
            expect(remaining.map((pill) => pill.getAttribute('aria-label'))).toEqual(['Value']);
            expect(remaining.map((pill) => pill.tabIndex)).toEqual([0]);
        });

        test('switching to a column that offers the option under another name relabels it', async () => {
            const api = gridsManager.createGrid('grid1', {
                ...opts(),
                columnDefs: [
                    { field: 'athlete', filter: 'agTextColumnFilter' },
                    {
                        field: 'other',
                        filter: 'agTextColumnFilter',
                        filterParams: { filterOptions: [CONTAINS_BACKWARDS] },
                    },
                ],
                rowData: ROW_DATA.map((row) => ({ ...row, other: row.athlete })),
            });
            await asyncSetTimeout(0);
            api.setAdvancedFilterModel({ filterType: 'text', colId: 'athlete', type: 'contains', filter: 'a' });
            api.onFilterChanged();
            await asyncSetTimeout(0);

            const builder = await AdvancedFilterBuilderHarness.open(api);
            const [condition] = await builder.conditionItems();
            await builder.selectColumn(condition, 'Other');

            expect(await builder.operatorOptions(condition)).toEqual(['contains backwards']);
            await builder.apply();
            await asyncSetTimeout(0);
            expect(AdvancedFilterHarness.get(api).value).toBe('[Other] contains backwards "a"');
        });

        test('switching to a column that narrows away a built-in clears it', async () => {
            const api = gridsManager.createGrid('grid1', {
                ...opts(),
                columnDefs: [
                    { field: 'athlete', filter: 'agTextColumnFilter' },
                    {
                        field: 'other',
                        filter: 'agTextColumnFilter',
                        filterParams: { filterOptions: ['equals'] },
                    },
                ],
                rowData: ROW_DATA.map((row) => ({ ...row, other: row.athlete })),
            });
            await asyncSetTimeout(0);
            api.setAdvancedFilterModel({ filterType: 'text', colId: 'athlete', type: 'contains', filter: 'a' });
            api.onFilterChanged();
            await asyncSetTimeout(0);

            const builder = await AdvancedFilterBuilderHarness.open(api);
            const [condition] = await builder.conditionItems();
            await builder.selectColumn(condition, 'Other');

            expect(await builder.operatorOptions(condition)).toEqual(['equals']);
            expect(builder.valuePills(condition)).toHaveLength(0);
        });

        test('switching to a column that does not offer the option clears it', async () => {
            const api = gridsManager.createGrid('grid1', {
                ...opts(),
                columnDefs: [
                    {
                        field: 'athlete',
                        filter: 'agTextColumnFilter',
                        filterParams: { filterOptions: ATHLETE_OPTIONS },
                    },
                    { field: 'other', filter: 'agTextColumnFilter', filterParams: { filterOptions: ['contains'] } },
                ],
                rowData: ROW_DATA.map((row) => ({ ...row, other: row.athlete })),
            });
            await asyncSetTimeout(0);
            api.setAdvancedFilterModel({ filterType: 'text', colId: 'athlete', type: 'startsA' });
            api.onFilterChanged();
            await asyncSetTimeout(0);

            const builder = await AdvancedFilterBuilderHarness.open(api);
            const [condition] = await builder.conditionItems();
            await builder.selectColumn(condition, 'Other');

            expect(await builder.operatorOptions(condition)).toEqual(['contains']);
            expect(builder.valuePills(condition)).toHaveLength(0);
        });

        test('an emptied value keeps Apply shut across an external model change', async () => {
            const api = gridsManager.createGrid('grid1', opts());
            await asyncSetTimeout(0);
            api.setAdvancedFilterModel({
                filterType: 'number',
                colId: 'age',
                type: 'betweenExclusive',
                filter: 24,
                filterTo: 30,
            });
            api.onFilterChanged();
            await asyncSetTimeout(0);

            const builder = await AdvancedFilterBuilderHarness.open(api);
            const [condition] = await builder.conditionItems();
            await builder.setValue(condition, '', 1);
            await new FilterDom(api, 'the second value emptied', { mode: 'builder' }).checkFilterDom(`
                BUILDER
                AND
                  Age Between (Exclusive) 24 Enter a value... ✗
                  + add
                buttons: Apply ⊘ | Cancel
                model:
                  filterType: "number"
                  colId: "age"
                  type: "betweenExclusive"
                  filter: 24
                  filterTo: 30
            `);

            // Rebuilds the item list, which seeds every row valid again.
            api.setAdvancedFilterModel({ filterType: 'number', colId: 'age', type: 'evenNumbers' });
            api.onFilterChanged();
            await asyncSetTimeout(0);
            await new FilterDom(api, 'still shut after the rebuild', { mode: 'builder' }).checkFilterDom(`
                BUILDER
                AND
                  Age Between (Exclusive) 24 Enter a value... ✗
                  + add
                buttons: Apply ⊘ | Cancel
                model:
                  filterType: "number"
                  colId: "age"
                  type: "evenNumbers"
            `);

            // The control, so the two assertions above are not passing on a snapshot that never says Apply.
            await builder.setValue(condition, '30', 1);
            await new FilterDom(api, 'both values back', { mode: 'builder' }).checkFilterDom(`
                BUILDER
                AND
                  Age Between (Exclusive) 24 30
                  + add
                buttons: Apply | Cancel
                model:
                  filterType: "number"
                  colId: "age"
                  type: "evenNumbers"
            `);
        });

        // Only a mounted row validates itself, so the all-items pass must catch a scrolled-out incomplete one.
        test('an option that gains a second input shuts Apply for a condition the list has not mounted', async () => {
            const api = gridsManager.createGrid('grid1', { ...opts(), columnDefs: ageColumnDefs(1) });
            await asyncSetTimeout(0);
            api.setAdvancedFilterModel(longModelEndingInNearly());
            api.onFilterChanged();
            await asyncSetTimeout(0);

            const builder = await AdvancedFilterBuilderHarness.open(api);
            // The `Nearly` row must not be among them, or its own component would validate it.
            expect((await builder.conditionItems()).length).toBeLessThan(TAIL_CONDITIONS + 1);

            api.setGridOption('columnDefs', ageColumnDefs(2));
            await rebuildBuilderList(api);

            expect(builder.applyDisabled()).toBe(true);
        });

        // The control: the same rebuild with the arity left alone, so Apply is proven to enable at all.
        test('a condition the list has not mounted leaves Apply open while its option still takes one value', async () => {
            const api = gridsManager.createGrid('grid1', { ...opts(), columnDefs: ageColumnDefs(1) });
            await asyncSetTimeout(0);
            api.setAdvancedFilterModel(longModelEndingInNearly());
            api.onFilterChanged();
            await asyncSetTimeout(0);

            const builder = await AdvancedFilterBuilderHarness.open(api);
            expect((await builder.conditionItems()).length).toBeLessThan(TAIL_CONDITIONS + 1);

            api.setGridOption('columnDefs', ageColumnDefs(1));
            await rebuildBuilderList(api);

            expect(builder.applyDisabled()).toBe(false);
        });
    });
});

/** Enough leading conditions that the last one sits outside the builder's rendered window. */
const TAIL_CONDITIONS = 30;

/** Its arity is what a colDef refresh changes; `evenNumbers` takes none, so only `Nearly` can go incomplete. */
const nearlyOption = (numberOfInputs: 1 | 2): IFilterOptionDef => ({
    displayKey: 'nearly',
    displayName: 'Nearly',
    numberOfInputs,
    predicate: ([from, to], cellValue) => cellValue != null && cellValue >= from && (to == null || cellValue <= to),
});

const ageColumnDefs = (numberOfInputs: 1 | 2): ColDef<TestRow>[] => [
    {
        field: 'age',
        filter: 'agNumberColumnFilter',
        filterParams: { filterOptions: [EVEN_NUMBERS, nearlyOption(numberOfInputs)] },
    },
];

/** Reseeds every row valid and makes the builder's model differ from the applied one, so Apply turns on validity. */
async function rebuildBuilderList(api: GridApi<TestRow>): Promise<void> {
    api.setAdvancedFilterModel({ filterType: 'number', colId: 'age', type: 'evenNumbers' });
    api.onFilterChanged();
    await asyncSetTimeout(0);
}

/** Every visible row valid whatever the arity, and one single-valued `Nearly` below the fold. */
function longModelEndingInNearly(): AdvancedFilterModel {
    return {
        filterType: 'join',
        type: 'AND',
        conditions: [
            ...Array.from(
                { length: TAIL_CONDITIONS },
                () => ({ filterType: 'number', colId: 'age', type: 'evenNumbers' }) as const
            ),
            { filterType: 'number', colId: 'age', type: 'nearly', filter: 20 },
        ],
    };
}

/** The expected list is named, so two grids that both filtered nothing cannot pass for agreement. */
function expectSameAthletes(advanced: GridApi<TestRow>, column: GridApi<TestRow>, expected: string[]): void {
    expect(filteredAthletes(advanced)).toEqual(expected);
    expect(filteredAthletes(column)).toEqual(expected);
}

function filteredAthletes(api: GridApi<{ athlete: string }>): (string | undefined)[] {
    const athletes: (string | undefined)[] = [];
    api.forEachNodeAfterFilter((node) => athletes.push(node.data?.athlete));
    return athletes;
}
