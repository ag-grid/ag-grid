import { waitFor } from '@testing-library/dom';
import {
    ALL_SEVERITIES,
    ColumnFilterHarness,
    FilterDom,
    FloatingFilterHarness,
    GridRows,
    TestGridsManager,
    asyncSetTimeout,
    installFilterLayoutMock,
    uninstallFilterLayoutMock,
} from 'ag-test-utils';

import type { ColDef, GridApi, GridOptions, IFilterOptionDef, ITextFilterParams } from 'ag-grid-community';
import {
    BigIntFilterModule,
    ClientSideRowModelModule,
    DateFilterModule,
    LocaleModule,
    NumberFilterModule,
    TextFilterModule,
    enableDevValidations,
    setupAgTestIds,
} from 'ag-grid-community';
import { ColumnMenuModule } from 'ag-grid-enterprise';

/**
 * What a `filterOptions` list offers, and what is reported when it cannot: a malformed entry, a `defaultOption`
 * the list does not contain, a key one filter cannot evaluate, and a `displayKey` colliding with a built-in one.
 */
interface AgeRow {
    age: number;
}

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
        await new FilterDom(api, 'a built-in option left out of the list', { colId: 'age' }).checkFilterDom(`
            FLOATING FILTER age: (not present)
            model: null
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
        await new FilterDom(api, 'an offered option applied untouched', { colId: 'age' }).checkFilterDom(`
            FLOATING FILTER age: (not present)
            model:
              filterType: "number"
              type: "multipleOf"
              filter: 5
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
        await new FilterDom(api, 'an invalid option dropped from the list', { colId: 'age' }).checkFilterDom(`
            COLUMN FILTER
            operator: "Multiple of"
            input: "5"
            model:
              filterType: "number"
              type: "multipleOf"
              filter: 5
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
        await new FilterDom(api, 'an invalid option listed first', { colId: 'age' }).checkFilterDom(`
            COLUMN FILTER
            operator: "Equals"
            input: "40"
            model:
              filterType: "number"
              type: "equals"
              filter: 40
        `);
    });

    test('is not defaulted to by `defaultOption` either, which names an option the dropdown lacks', async () => {
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [72, 326] });
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

        // Both faults are the user's to fix: the option is malformed, and the default names one not offered.
        const warnings = warnSpy.mock.calls.flat().join(' ');
        expect(warnings).toContain('warning #72');
        expect(warnings).toContain('warning #326');
        expect(warnings).toContain('noPredicate');

        await filter.setNumber(40, 0);
        await asyncSetTimeout(0);
        await new GridRows(api, 'the fallback option filters').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:1 age:40
        `);
        await new FilterDom(api, 'a `defaultOption` naming an option the list lacks', { colId: 'age' }).checkFilterDom(`
            COLUMN FILTER
            operator: "Equals"
            input: "40"
            model:
              filterType: "number"
              type: "equals"
              filter: 40
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
        // The blank row proves the condition is gone: an option that cannot be evaluated hides blanks while it survives.
        await new GridRows(api, 'unfiltered - the option was dropped').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 age:25
            ├── LEAF id:1 age:40
            └── LEAF id:2 age:null
        `);
        await new FilterDom(api, 'a model naming an invalid option', { colId: 'age' }).checkFilterDom(`
            FLOATING FILTER age: (not present)
            model: null
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
        modules: [TextFilterModule, NumberFilterModule, ColumnMenuModule, ClientSideRowModelModule],
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

    // The reported case: a key that is not a filter option at all, rather than one belonging elsewhere.
    test('a key no filter defines is offered under its own name, and reported when it is evaluated', async () => {
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [76] });
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

        const api: GridApi = await createGrid(['equals', 'notEqual', 'wrong']);
        const filter = await ColumnFilterHarness.open(api, 'athlete');
        // Nothing localises it, so the key stands in for the label it has no translation for.
        expect(await filter.operatorOptions()).toEqual(['Equals', 'Does not equal', 'wrong']);
        expect(warnSpy).not.toHaveBeenCalled();

        await filter.selectOperator('wrong');
        await filter.setText('Bolt', 0);
        await asyncSetTimeout(0);

        expect(api.getColumnFilterModel('athlete')).toEqual({
            filterType: 'text',
            type: 'wrong',
            filter: 'Bolt',
        });
        // `Bolt` is in the data, so a key that matched anything would leave a row behind.
        await new GridRows(api, 'a key no filter defines').check(`
            ROOT id:ROOT_NODE_ID
        `);
        const warnings = warnSpy.mock.calls.flat().join(' ');
        expect(warnings).toContain('warning #76');
        expect(warnings).toContain('wrong');
        await new FilterDom(api, 'a key no filter defines', { colId: 'athlete' }).checkFilterDom(`
            COLUMN FILTER
            operator: "wrong"
            input: "Bolt"
            model:
              filterType: "text"
              type: "wrong"
              filter: "Bolt"
        `);
    });

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
        const warnings = warnSpy.mock.calls.flat().join(' ');
        expect(warnings).toContain('warning #76');
        expect(warnings).toContain('inRange');
        await new FilterDom(api, 'an option belonging to another filter type', { colId: 'athlete' }).checkFilterDom(`
            COLUMN FILTER
            operator: "Between"
            input [0]: "A"
            input [1]: "Z"
            model:
              filterType: "text"
              type: "inRange"
              filter: "A"
              filterTo: "Z"
        `);
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
        const warnings = warnSpy.mock.calls.flat().join(' ');
        expect(warnings).toContain('warning #76');
        expect(warnings).toContain('lastYear');
        await new FilterDom(api, 'a relative date range on a text filter', { colId: 'athlete' }).checkFilterDom(`
            COLUMN FILTER
            operator: "Last Year"
            model:
              filterType: "text"
              type: "lastYear"
        `);
    });

    // Both filters report `#76`; the scalar filters admit the row they cannot judge, the text filter excludes it.
    test('a number filter shows every row for the option it cannot evaluate', async () => {
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [76] });
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'age',
                    filter: 'agNumberColumnFilter',
                    filterParams: { filterOptions: ['equals', 'contains'], debounceMs: 0 },
                },
            ],
            rowData: [{ age: 25 }, { age: 40 }],
        } as GridOptions);

        const filter = await ColumnFilterHarness.open(api, 'age');
        await filter.selectOperator('Contains');
        await filter.setNumber(25, 0);
        await asyncSetTimeout(0);

        // The scalar filters admit the row they cannot judge; the text filter excludes it.
        await new GridRows(api, 'a number `contains` the comparison cannot answer').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 age:25
            └── LEAF id:1 age:40
        `);
        const warnings = warnSpy.mock.calls.flat().join(' ');
        expect(warnings).toContain('warning #76');
        expect(warnings).toContain('contains');
        await new FilterDom(api, 'a number filter shows every row', { colId: 'age' }).checkFilterDom(`
            COLUMN FILTER
            operator: "Contains"
            input: "25"
            AND
            operator: "Equals"
            input: "" ⟨Filter...⟩
            model:
              filterType: "number"
              type: "contains"
              filter: 25
        `);
    });

    // Presence is decided without the matcher, so a column that never reaches it must still report.
    test('a column of blank values still reports the key it cannot evaluate', async () => {
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [76] });
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'athlete',
                    filter: 'agTextColumnFilter',
                    filterParams: { filterOptions: ['contains', 'inRange'], debounceMs: 0, maxNumConditions: 1 },
                },
            ],
            rowData: [{ athlete: null }, { athlete: null }],
        } as GridOptions);

        await api.setColumnFilterModel('athlete', {
            filterType: 'text',
            type: 'inRange',
            filter: 'A',
            filterTo: 'Z',
        });
        await api.onFilterChanged();

        const warnings = warnSpy.mock.calls.flat().join(' ');
        expect(warnings).toContain('warning #76');
        expect(warnings).toContain('inRange');
        await new GridRows(api, 'a blank column with an unusable key').check(`
            ROOT id:ROOT_NODE_ID
        `);
    });

    // The option is configured correctly and only its value is missing, so the key is not what went wrong.
    test('a Custom Filter Option waiting for its value is not reported as a key the filter cannot evaluate', async () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

        const api: GridApi = await createGrid([
            'contains',
            {
                displayKey: 'soundsLike',
                displayName: 'Sounds Like',
                numberOfInputs: 1,
                predicate: ([t]: unknown[], cellValue: unknown) => cellValue === t,
            },
        ]);

        await api.setColumnFilterModel('athlete', { filterType: 'text', type: 'soundsLike', filter: null });
        await api.onFilterChanged();

        expect(warnSpy).not.toHaveBeenCalled();
        await new GridRows(api, 'a custom option with no value matches nothing').check(`
            ROOT id:ROOT_NODE_ID
        `);
    });

    test('a `textMatcher` decides for a built-in option too, and nothing is reported', async () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

        const filterParams: ITextFilterParams = {
            filterOptions: ['contains', 'startsWith'],
            // Deliberately not what `startsWith` means: only the matcher running can produce this result.
            textMatcher: ({ filterOption, value, filterText }) =>
                filterOption === 'startsWith' ? value.endsWith(filterText!) : value.includes(filterText!),
            debounceMs: 0,
            maxNumConditions: 1,
        };
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'athlete', filter: 'agTextColumnFilter', filterParams }],
            rowData: [{ athlete: 'Bolt' }, { athlete: 'Ng' }],
        } as GridOptions);

        const filter = await ColumnFilterHarness.open(api, 'athlete');
        await filter.selectOperator('Begins with');
        await filter.setText('g', 0);
        await asyncSetTimeout(0);

        await new GridRows(api, 'the matcher decides, not the built-in `startsWith`').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:1 athlete:"Ng"
        `);
        expect(warnSpy).not.toHaveBeenCalled();
        await new FilterDom(api, 'the matcher decides for a built-in option', { colId: 'athlete' }).checkFilterDom(`
            COLUMN FILTER
            operator: "Begins with"
            input: "g"
            model:
              filterType: "text"
              type: "startsWith"
              filter: "g"
        `);
    });

    test('a `textMatcher` answering a key the text filter cannot evaluate suppresses the report', async () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

        // A JavaScript config: `ITextFilterParams` rejects `'lessThan'`, but the grid still offers what it is given.
        const filterParams = {
            filterOptions: ['contains', 'lessThan'],
            textMatcher: ({ filterOption, value, filterText }: any) =>
                filterOption === 'lessThan' ? value < filterText : value.includes(filterText),
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
        await new FilterDom(api, 'a custom option supplying a built-in key', { colId: 'athlete' }).checkFilterDom(`
            COLUMN FILTER
            operator: "Contains"
            input: "" ⟨Filter...⟩
            model: null
        `);
    });
});

describe('Column filter — localising the option keys', () => {
    const gridsManager = new TestGridsManager({
        modules: [TextFilterModule, LocaleModule, ColumnMenuModule, ClientSideRowModelModule],
    });

    beforeAll(() => {
        setupAgTestIds();
        installFilterLayoutMock();
    });
    afterAll(() => uninstallFilterLayoutMock());
    afterEach(() => gridsManager.reset());

    test('`getLocaleText` is given a real default for every offered option', async () => {
        const calls: { key: string; defaultValue: unknown }[] = [];
        // A JavaScript config: `ITextFilterParams` rejects `'soundsLike'`, but the grid still offers what it is given.
        const filterParams = {
            filterOptions: [
                'contains',
                'soundsLike',
                { displayKey: 'multipleOf', displayName: 'Multiple of', predicate: () => true },
            ],
            debounceMs: 0,
            maxNumConditions: 1,
        };
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            getLocaleText: ({ key, defaultValue }) => {
                if (key === 'contains' || key === 'soundsLike' || key === 'multipleOf') {
                    calls.push({ key, defaultValue });
                }
                return key === 'soundsLike' ? 'Sounds like' : defaultValue;
            },
            columnDefs: [{ field: 'athlete', filter: 'agTextColumnFilter', filterParams }],
            rowData: [{ athlete: 'Bolt' }],
        } as GridOptions);

        const filter = await ColumnFilterHarness.open(api, 'athlete');
        expect(await filter.operatorOptions()).toEqual(['Contains', 'Sounds like', 'Multiple of']);
        expect(calls).toEqual([
            { key: 'contains', defaultValue: 'Contains' },
            { key: 'soundsLike', defaultValue: 'soundsLike' },
            { key: 'multipleOf', defaultValue: 'Multiple of' },
        ]);
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
        await new FilterDom(api, 'a `displayKey` replacing a built-in key', { colId: 'age' }).checkFilterDom(`
            COLUMN FILTER
            operator: "Equals (tens)"
            input: "" ⟨Filter...⟩
            model: null
        `);
    });

    test('a built-in key listed twice is offered once', async () => {
        const api: GridApi = await createGrid(['equals', 'greaterThan', 'equals']);

        const filter = await ColumnFilterHarness.open(api, 'age');
        expect(await filter.operatorOptions()).toEqual(['Equals', 'Greater than']);
        await new FilterDom(api, 'a built-in key listed twice', { colId: 'age' }).checkFilterDom(`
            COLUMN FILTER
            operator: "Equals"
            input: "" ⟨Filter...⟩
            model: null
        `);
    });

    test('keeps the place the key was first listed in, whichever form declared it', async () => {
        const api: GridApi = await createGrid(['greaterThan', EQUALS_TENS, 'equals']);

        const filter = await ColumnFilterHarness.open(api, 'age');
        expect(await filter.operatorOptions()).toEqual(['Greater than', 'Equals (tens)']);
        await new FilterDom(api, 'the key keeps the place it was first listed in', { colId: 'age' }).checkFilterDom(`
            COLUMN FILTER
            operator: "Greater than"
            input: "" ⟨Filter...⟩
            model: null
        `);
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

    test('falls back to the first offered option, and reports the one it could not select', async () => {
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [326] });
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

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

        const warnings = warnSpy.mock.calls.flat().join(' ');
        expect(warnings).toContain('warning #326');
        expect(warnings).toContain('lessThan');
        await new FilterDom(api, 'fallen back to the first offered option', { colId: 'age' }).checkFilterDom(`
            COLUMN FILTER
            operator: "Greater than"
            input: "" ⟨Filter...⟩
            model: null
        `);
    });
});

describe('Column filter — a malformed `filterOptions` list', () => {
    const gridsManager = new TestGridsManager({
        modules: [TextFilterModule, NumberFilterModule, ColumnMenuModule, ClientSideRowModelModule],
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

    const ANY_OF_TWO: IFilterOptionDef = {
        displayKey: 'anyOfTwo',
        displayName: 'Any Of Two',
        numberOfInputs: 2,
        predicate: (values, cellValue) => values.includes(cellValue),
    };

    // A column that offers nothing cannot open its filter at all, which is worse than the bad configuration.
    test('that keeps no option at all falls back to the built-in list, so the filter still opens', async () => {
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [72, 74] });
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'age',
                    filter: 'agNumberColumnFilter',
                    filterParams: {
                        filterOptions: [{ displayKey: 'x', displayName: 'X' } as IFilterOptionDef],
                        debounceMs: 0,
                    },
                },
            ],
            rowData: [{ age: 25 }, { age: 40 }],
        } as GridOptions);

        const filter = await ColumnFilterHarness.open(api, 'age');
        expect(await filter.operatorOptions()).toContain('Equals');
        await filter.selectOperator('Equals');
        await filter.setNumber(25, 0);
        await waitFor(() =>
            expect(api.getColumnFilterModel('age')).toEqual({ filterType: 'number', type: 'equals', filter: 25 })
        );

        const warnings = warnSpy.mock.calls.flat().join(' ');
        expect(warnings).toContain('warning #72');
        expect(warnings).toContain('warning #74');
        await new FilterDom(api, 'a list that keeps no option', { colId: 'age' }).checkFilterDom(`
            COLUMN FILTER
            operator: "Equals"
            input: "25"
            AND
            operator: "Equals"
            input: "" ⟨Filter...⟩
            model:
              filterType: "number"
              type: "equals"
              filter: 25
        `);
    });

    // An empty list reaches the same fallback with the loop never running, so nothing is malformed to report.
    test('that is empty falls back to the built-in list, reporting only that it kept nothing', async () => {
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [74] });
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'age',
                    filter: 'agNumberColumnFilter',
                    filterParams: { filterOptions: [], debounceMs: 0 },
                },
            ],
            rowData: [{ age: 25 }, { age: 40 }],
        } as GridOptions);

        const filter = await ColumnFilterHarness.open(api, 'age');
        expect(await filter.operatorOptions()).toContain('Equals');
        const warnings = warnSpy.mock.calls.flat().join(' ');
        expect(warnings).toContain('warning #74');
        expect(warnings).not.toContain('warning #72');
        await new FilterDom(api, 'an empty list', { colId: 'age' }).checkFilterDom(`
            COLUMN FILTER
            operator: "Equals"
            input: "" ⟨Filter...⟩
            model: null
        `);
    });

    test('a numeric string `numberOfInputs` counts, and a hole in the list is skipped', async () => {
        const api: GridApi<AgeRow> = await gridsManager.createGridAndWait('grid1', {
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
            rowData: [{ age: 25 }, { age: 40 }, { age: 28 }, { age: 33 }],
        });

        const filter = await ColumnFilterHarness.open(api, 'age');
        expect(filter.operatorSelectValue()).toBe('Any Of Two');
        expect(filter.inputs('number')).toHaveLength(2);

        await filter.setNumber(25, 0);
        await filter.setNumber(40, 1);
        expect(filter.getModel()).toEqual({ filterType: 'number', type: 'anyOfTwo', filter: 25, filterTo: 40 });
        await new FilterDom(api, 'a numeric string `numberOfInputs`', { colId: 'age' }).checkFilterDom(`
            COLUMN FILTER
            operator: "Any Of Two"
            input [0]: "25"
            input [1]: "40"
            AND
            operator: "Any Of Two"
            input [0]: "" ⟨From⟩
            input [1]: "" ⟨To⟩
            model:
              filterType: "number"
              type: "anyOfTwo"
              filter: 25
              filterTo: 40
        `);
    });

    // The summary reads the same count the inputs did, so it names both values rather than only the first.
    test('a numeric string `numberOfInputs` counts for the summary too', async () => {
        const api: GridApi<AgeRow> = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'age',
                    filter: 'agNumberColumnFilter',
                    floatingFilter: true,
                    filterParams: { filterOptions: [{ ...ANY_OF_TWO, numberOfInputs: '2' }] as any, debounceMs: 0 },
                },
            ],
            rowData: [{ age: 25 }, { age: 40 }],
        });

        await api.setColumnFilterModel('age', { filterType: 'number', type: 'anyOfTwo', filter: 25, filterTo: 40 });
        api.onFilterChanged();
        await asyncSetTimeout(0);

        expect(FloatingFilterHarness.get(api, 'age').input().value).toBe('25-40');
    });

    // The declared `0 | 1 | 2` is no check on a JS caller, so a count outside it is clamped into the range
    // rather than believed: the inputs, the model and the summary then cannot disagree about the arity.
    test('a count above the range is taken as two, and one below it as none', async () => {
        const api: GridApi<AgeRow> = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'age',
                    filter: 'agNumberColumnFilter',
                    floatingFilter: true,
                    filterParams: { filterOptions: [{ ...ANY_OF_TWO, numberOfInputs: 3 }] as any, debounceMs: 0 },
                },
                {
                    field: 'age',
                    colId: 'below',
                    filter: 'agNumberColumnFilter',
                    floatingFilter: true,
                    filterParams: { filterOptions: [{ ...ANY_OF_TWO, numberOfInputs: -1 }] as any, debounceMs: 0 },
                },
            ],
            rowData: [{ age: 25 }, { age: 40 }],
        });

        await api.setColumnFilterModel('age', { filterType: 'number', type: 'anyOfTwo', filter: 25, filterTo: 40 });
        await api.setColumnFilterModel('below', { filterType: 'number', type: 'anyOfTwo', filter: 25, filterTo: 40 });
        api.onFilterChanged();
        await asyncSetTimeout(0);

        expect(FloatingFilterHarness.get(api, 'age').input().value).toBe('25-40');
        // No values, so the summary is the option's name and neither value is shown.
        expect(FloatingFilterHarness.get(api, 'below').input().value).toBe('Any Of Two');
    });

    test('`filterPlaceholder` is given the custom option, not an unresolved key', async () => {
        const seen: { filterOptionKey: string; filterOption: string }[] = [];
        const api = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'age',
                    filter: 'agNumberColumnFilter',
                    filterParams: {
                        filterOptions: [
                            'equals',
                            {
                                displayKey: 'withinOf',
                                displayName: 'Within Of',
                                numberOfInputs: 2,
                                predicate: ([target, tolerance]: any[], cellValue: any) =>
                                    Math.abs(cellValue - target) <= tolerance,
                            },
                        ],
                        filterPlaceholder: ({ filterOptionKey, filterOption, placeholder }: any) => {
                            seen.push({ filterOptionKey, filterOption });
                            return placeholder;
                        },
                        debounceMs: 0,
                        maxNumConditions: 1,
                    },
                },
            ],
            rowData: [{ age: 25 }, { age: 40 }],
        });

        const harness = await ColumnFilterHarness.open(api, 'age');
        await harness.selectOperator('Within Of');

        // A custom option has no built-in locale text, so its `displayName` is what the callback must see.
        expect(seen).toContainEqual({ filterOptionKey: 'withinOf', filterOption: 'Within Of' });
        await new FilterDom(api, '`filterPlaceholder` is given the custom option', { colId: 'age' }).checkFilterDom(`
            COLUMN FILTER
            operator: "Within Of"
            input [0]: "" ⟨From⟩
            input [1]: "" ⟨To⟩
            model: null
        `);
    });

    test('`filterPlaceholder` is given a bare key the grid does not define, not an empty string', async () => {
        const seen: { filterOptionKey: string; filterOption: string }[] = [];
        // A JavaScript config: `INumberFilterParams` rejects `'withinOf'`, but the grid still offers what it is given.
        const filterParams = {
            filterOptions: ['equals', 'withinOf'],
            filterPlaceholder: ({ filterOptionKey, filterOption, placeholder }: any) => {
                seen.push({ filterOptionKey, filterOption });
                return placeholder;
            },
            debounceMs: 0,
            maxNumConditions: 1,
        };
        const api = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'age', filter: 'agNumberColumnFilter', filterParams }],
            rowData: [{ age: 25 }, { age: 40 }],
        });

        const harness = await ColumnFilterHarness.open(api, 'age');
        await harness.selectOperator('withinOf');

        // With no built-in locale text and no custom option to name it, the key stands in as its own display name.
        expect(seen).toContainEqual({ filterOptionKey: 'withinOf', filterOption: 'withinOf' });
    });

    test('a custom option declared with only the removed `test` is rejected rather than offered', async () => {
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [72] });
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

        const api = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'country',
                    filter: 'agTextColumnFilter',
                    filterParams: {
                        filterOptions: [
                            'contains',
                            'equals',
                            {
                                displayKey: 'startsWithA',
                                displayName: 'Starts with A',
                                test: (_filterValue: string, cellValue: string) => cellValue?.startsWith('A'),
                            },
                        ],
                    },
                },
            ],
            rowData: [{ country: 'Argentina' }, { country: 'Brazil' }, { country: 'Australia' }],
        });
        await asyncSetTimeout(0);

        const harness = await ColumnFilterHarness.open(api, 'country');
        expect(await harness.operatorOptions()).toEqual(['Contains', 'Equals']);

        // Nothing runs `test`, so an option carrying only it is reported rather than left to match nothing.
        const warnings = warnSpy.mock.calls.flat().join(' ');
        expect(warnings).toContain('warning #72');
        expect(warnings).toContain('predicate');

        await api.setColumnFilterModel('country', { filterType: 'text', type: 'startsWithA', filter: 'x' });
        await api.onFilterChanged();
        // A model naming an option the column does not offer filters nothing, as any other unknown one does.
        await waitFor(() => expect(api.getDisplayedRowCount()).toBe(3));
        await new FilterDom(api, 'a `test`-only option is not offered', { colId: 'country' }).checkFilterDom(`
            COLUMN FILTER
            operator: "Contains"
            input: "x"
            AND
            operator: "Contains"
            input: "" ⟨Filter...⟩
            model: null
        `);
    });
});

describe('Column filter — an option key shadowing `Object.prototype`', () => {
    const gridsManager = new TestGridsManager({
        modules: [NumberFilterModule, LocaleModule, ColumnMenuModule, ClientSideRowModelModule],
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

    test('a bare key is offered under its own name rather than resolving on the locale table', async () => {
        const calls: { key: string; defaultValue: unknown }[] = [];
        // A JavaScript config: `INumberFilterParams` rejects these, but the grid still offers what it is given.
        const filterParams = { filterOptions: ['equals', 'toString', 'valueOf'], debounceMs: 0, maxNumConditions: 1 };
        const api: GridApi<AgeRow> = await gridsManager.createGridAndWait('grid1', {
            getLocaleText: ({ key, defaultValue }) => {
                if (key === 'toString' || key === 'valueOf') {
                    calls.push({ key, defaultValue });
                }
                return defaultValue;
            },
            columnDefs: [{ field: 'age', filter: 'agNumberColumnFilter', filterParams }],
            rowData: EDGE_KEY_ROWS,
        } as GridOptions);

        const filter = await ColumnFilterHarness.open(api, 'age');
        expect(await filter.operatorOptions()).toEqual(['Equals', 'toString', 'valueOf']);
        expect(calls).toEqual([
            { key: 'toString', defaultValue: 'toString' },
            { key: 'valueOf', defaultValue: 'valueOf' },
        ]);
    });

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
        await new FilterDom(api, 'a `displayKey` shadowing `Object.prototype`', { colId: 'age' }).checkFilterDom(`
            COLUMN FILTER
            operator: "Over"
            input: "26"
            model:
              filterType: "number"
              type: "constructor"
              filter: 26
        `);
    });
});

describe('Column filter — the offered list survives a colDef refresh', () => {
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

    const EVEN: IFilterOptionDef = {
        displayKey: 'even',
        displayName: 'Even',
        numberOfInputs: 0,
        predicate: (_values, cellValue: number) => cellValue % 2 === 0,
    };

    const colDef = (filterOptions: (string | IFilterOptionDef)[]): ColDef<AgeRow>[] => [
        { field: 'age', filter: 'agNumberColumnFilter', filterParams: { filterOptions, debounceMs: 0 } },
    ];

    const AGES = [{ age: 25 }, { age: 40 }, { age: 28 }];

    test('the same list re-declared leaves the offered options and the applied model alone', async () => {
        const options = ['equals', EVEN];
        const api: GridApi<AgeRow> = await gridsManager.createGridAndWait('grid1', {
            columnDefs: colDef(options),
            rowData: AGES,
        } as GridOptions);

        await api.setColumnFilterModel('age', { filterType: 'number', type: 'even' });
        await api.onFilterChanged();

        api.setGridOption('columnDefs', colDef(options));
        await asyncSetTimeout(0);

        const filter = await ColumnFilterHarness.open(api, 'age');
        expect(await filter.operatorOptions()).toEqual(['Equals', 'Even']);
        await new FilterDom(api, 'same list re-declared', { colId: 'age' }).checkFilterDom(`
            COLUMN FILTER
            operator: "Even"
            AND
            operator: "Equals"
            input: "" ⟨Filter...⟩
            model:
              filterType: "number"
              type: "even"
        `);
        await new GridRows(api, 'same list re-declared').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:1 age:40
            └── LEAF id:2 age:28
        `);
    });

    // A `colDef` is replaced, never edited, so editing the list it was given is not a change the grid acts on:
    // the applied model survives an option disappearing from under it.
    test('a list mutated in place is not a refresh at all', async () => {
        const options: (string | IFilterOptionDef)[] = ['equals', EVEN];
        const api: GridApi<AgeRow> = await gridsManager.createGridAndWait('grid1', {
            columnDefs: colDef(options),
            rowData: AGES,
        } as GridOptions);

        await api.setColumnFilterModel('age', { filterType: 'number', type: 'even' });
        await api.onFilterChanged();

        options.splice(1, 1);
        api.setGridOption('columnDefs', colDef(options));
        await asyncSetTimeout(0);

        expect(api.getColumnFilterModel('age')).toEqual({ filterType: 'number', type: 'even' });
        await new GridRows(api, 'a list mutated in place').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:1 age:40
            └── LEAF id:2 age:28
        `);
    });

    // The handler keeps its own factory, so an applied model is re-judged against the list the refresh installed.
    test('an applied model is cleared when the refresh stops offering its option', async () => {
        const api: GridApi<AgeRow> = await gridsManager.createGridAndWait('grid1', {
            columnDefs: colDef(['equals', EVEN]),
            rowData: AGES,
        } as GridOptions);

        await api.setColumnFilterModel('age', { filterType: 'number', type: 'even' });
        await api.onFilterChanged();
        await new GridRows(api, 'the custom option filters before the refresh').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:1 age:40
            └── LEAF id:2 age:28
        `);

        api.setGridOption('columnDefs', colDef(['equals', 'greaterThan']));
        await asyncSetTimeout(0);

        expect(api.getColumnFilterModel('age')).toBeNull();
        await new GridRows(api, 'the model goes with the option it named').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 age:25
            ├── LEAF id:1 age:40
            └── LEAF id:2 age:28
        `);
    });

    test('a malformed entry arriving on the refresh is dropped, as it is on init', async () => {
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [72] });
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

        const api: GridApi<AgeRow> = await gridsManager.createGridAndWait('grid1', {
            columnDefs: colDef(['equals', EVEN]),
            rowData: AGES,
        } as GridOptions);
        expect(warnSpy).not.toHaveBeenCalled();

        api.setGridOption(
            'columnDefs',
            colDef(['equals', 'greaterThan', { displayKey: 'odd', displayName: 'Odd' } as any])
        );
        await asyncSetTimeout(0);

        const filter = await ColumnFilterHarness.open(api, 'age');
        expect(await filter.operatorOptions()).toEqual(['Equals', 'Greater than']);
        const warnings = warnSpy.mock.calls.flat().join(' ');
        expect(warnings).toContain('warning #72');
        expect(warnings).toContain('predicate');
        await new FilterDom(api, 'a malformed entry arriving on the refresh', { colId: 'age' }).checkFilterDom(`
            COLUMN FILTER
            operator: "Equals"
            input: "" ⟨Filter...⟩
            model: null
        `);
    });
});

describe('Column filter — a combined model naming an option the column does not offer', () => {
    const gridsManager = new TestGridsManager({
        modules: [NumberFilterModule, ColumnMenuModule, ClientSideRowModelModule],
    });

    beforeAll(() => setupAgTestIds());
    afterEach(() => gridsManager.reset());

    test('is cleared whole, rather than filtering on the condition that is offered', async () => {
        const api: GridApi<AgeRow> = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'age',
                    filter: 'agNumberColumnFilter',
                    filterParams: { filterOptions: ['equals', 'greaterThan'], debounceMs: 0 },
                },
            ],
            rowData: [{ age: 25 }, { age: 40 }, { age: 28 }],
        } as GridOptions);

        await api.setColumnFilterModel('age', {
            filterType: 'number',
            operator: 'OR',
            conditions: [
                { filterType: 'number', type: 'equals', filter: 25 },
                { filterType: 'number', type: 'lessThan', filter: 30 },
            ],
        });
        await api.onFilterChanged();

        // One unoffered condition invalidates the model, so the offered one does not filter on its own.
        expect(api.getColumnFilterModel('age')).toBeNull();
        await new GridRows(api, 'combined model with an unoffered condition').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 age:25
            ├── LEAF id:1 age:40
            └── LEAF id:2 age:28
        `);
        await new FilterDom(api, 'a combined model with an unoffered condition', { colId: 'age' }).checkFilterDom(`
            FLOATING FILTER age: (not present)
            model: null
        `);
    });
});

describe('Column filter — validation is the same for every filter type', () => {
    const gridsManager = new TestGridsManager({
        modules: [DateFilterModule, BigIntFilterModule, ColumnMenuModule, ClientSideRowModelModule],
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

    // `OptionsFactory` is shared, so a fourth data type must not have its own answer.
    const withMalformedOption = (filter: string, rowData: unknown[]) =>
        gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'value',
                    filter,
                    filterParams: {
                        filterOptions: ['equals', 'notEqual', { displayKey: 'bad', displayName: 'Bad' }],
                        debounceMs: 0,
                    },
                },
            ],
            rowData,
        } as GridOptions);

    const expectDropped = async (api: GridApi, warnSpy: ReturnType<typeof vi.spyOn>) => {
        const harness = await ColumnFilterHarness.open(api, 'value');
        expect(await harness.operatorOptions()).toEqual(['Equals', 'Does not equal']);
        const warnings = warnSpy.mock.calls.flat().join(' ');
        expect(warnings).toContain('warning #72');
    };

    test('a malformed entry on a date column is dropped and reported', async () => {
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [72] });
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

        const api: GridApi = await withMalformedOption('agDateColumnFilter', [{ value: new Date(2024, 0, 1) }]);
        await expectDropped(api, warnSpy);
        await new FilterDom(api, 'a malformed entry on a date column', { colId: 'value' }).checkFilterDom(`
            COLUMN FILTER
            operator: "Equals"
            input: "" ⟨yyyy-mm-dd⟩
            model: null
        `);
    });

    test('a malformed entry on a bigint column is dropped and reported', async () => {
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [72] });
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

        const api: GridApi = await withMalformedOption('agBigIntColumnFilter', [{ value: 25n }]);
        await expectDropped(api, warnSpy);
        await new FilterDom(api, 'a malformed entry on a bigint column', { colId: 'value' }).checkFilterDom(`
            COLUMN FILTER
            operator: "Equals"
            input: "" ⟨Filter...⟩
            model: null
        `);
    });
});

describe('Column filter — `filterPlaceholder` on the floating filter', () => {
    const gridsManager = new TestGridsManager({
        modules: [TextFilterModule, ColumnMenuModule, ClientSideRowModelModule],
    });

    beforeAll(() => setupAgTestIds());
    afterEach(() => gridsManager.reset());

    // The other caller of `getPlaceholderText`, resolving the option through the same options factory.
    test('is given the custom option, not an unresolved key', async () => {
        const seen: { filterOptionKey: string; filterOption: string }[] = [];
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'athlete',
                    filter: 'agTextColumnFilter',
                    floatingFilter: true,
                    // The callback is only consulted when the floating filter asks for a placeholder.
                    floatingFilterComponentParams: { filterPlaceholder: true },
                    filterParams: {
                        filterOptions: [
                            {
                                displayKey: 'soundsLike',
                                displayName: 'Sounds Like',
                                numberOfInputs: 1,
                                predicate: ([t]: unknown[], cellValue: unknown) => cellValue === t,
                            },
                        ],
                        filterPlaceholder: ({ filterOptionKey, filterOption, placeholder }: any) => {
                            seen.push({ filterOptionKey, filterOption });
                            return placeholder;
                        },
                        debounceMs: 0,
                    },
                },
            ],
            rowData: [{ athlete: 'Bolt' }],
        } as GridOptions);
        await asyncSetTimeout(0);

        expect(seen.length).toBeGreaterThan(0);
        expect(seen.every((s) => s.filterOptionKey === 'soundsLike')).toBe(true);
        expect(seen.every((s) => s.filterOption === 'Sounds Like')).toBe(true);
        await new FilterDom(api, 'floating filter placeholder', { colId: 'athlete' }).checkFilterDom(`
            FLOATING FILTER athlete
            input: "" ⟨Filter...⟩
            active: false
            model: null
        `);
    });
});

describe('Column filter — the date summary for an option the grid does not define', () => {
    const gridsManager = new TestGridsManager({
        modules: [DateFilterModule, ColumnMenuModule, ClientSideRowModelModule],
    });

    beforeAll(() => setupAgTestIds());
    afterEach(() => {
        gridsManager.reset();
        vi.restoreAllMocks();
        enableDevValidations({ throwOn: ALL_SEVERITIES });
    });

    // A read-only floating filter shows `getModelAsString`, which is where a valueless date condition is named.
    test('names the key itself rather than resolving to nothing', async () => {
        // Deliberate: the date filter cannot evaluate the key, which triggers warning #76.
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [76] });
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

        // A JavaScript config: `IDateFilterParams` rejects `'soundsLike'`, but the grid still offers what it is given.
        const filterParams = { filterOptions: ['equals', 'soundsLike'], readOnly: true, debounceMs: 0 };
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'date', filter: 'agDateColumnFilter', floatingFilter: true, filterParams }],
            rowData: [{ date: '2024-01-01' }],
        } as GridOptions);

        await api.setColumnFilterModel('date', {
            filterType: 'date',
            type: 'soundsLike',
            dateFrom: null,
            dateTo: null,
        });
        await api.onFilterChanged();
        await asyncSetTimeout(0);

        expect(warnSpy.mock.calls.flat().join(' ')).toContain('warning #76');
        await new FilterDom(api, 'a valueless condition the grid does not define', { colId: 'date' }).checkFilterDom(`
            FLOATING FILTER date
            input: "soundsLike" ⊘
            active: true
            model:
              filterType: "date"
              type: "soundsLike"
              dateFrom: null
              dateTo: null
        `);
    });

    // Settles whether a zero-input custom option reaches the key-based path: it is resolved before that.
    test('a zero-input custom option is named by its `displayName`, not its key', async () => {
        const filterParams = {
            filterOptions: [
                'equals',
                { displayKey: 'isWeekend', displayName: 'Is weekend', numberOfInputs: 0, predicate: () => true },
            ],
            readOnly: true,
            debounceMs: 0,
        };
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'date', filter: 'agDateColumnFilter', floatingFilter: true, filterParams }],
            rowData: [{ date: '2024-01-01' }],
        } as GridOptions);

        await api.setColumnFilterModel('date', { filterType: 'date', type: 'isWeekend', dateFrom: null, dateTo: null });
        await api.onFilterChanged();
        await asyncSetTimeout(0);

        await new FilterDom(api, 'a zero-input custom option', { colId: 'date' }).checkFilterDom(`
            FLOATING FILTER date
            input: "Is weekend" ⊘
            active: true
            model:
              filterType: "date"
              type: "isWeekend"
              dateFrom: null
              dateTo: null
        `);
    });

    test('a zero-input custom option whose `displayName` is blank is named by its key', async () => {
        const filterParams = {
            filterOptions: [
                'equals',
                { displayKey: 'isWeekend', displayName: '', numberOfInputs: 0, predicate: () => true },
            ],
            readOnly: true,
            debounceMs: 0,
        };
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'date', filter: 'agDateColumnFilter', floatingFilter: true, filterParams }],
            rowData: [{ date: '2024-01-01' }],
        } as GridOptions);

        await api.setColumnFilterModel('date', { filterType: 'date', type: 'isWeekend', dateFrom: null, dateTo: null });
        await api.onFilterChanged();
        await asyncSetTimeout(0);

        await new FilterDom(api, 'a zero-input custom option with a blank name', { colId: 'date' }).checkFilterDom(`
            FLOATING FILTER date
            input: "isWeekend" ⊘
            active: true
            model:
              filterType: "date"
              type: "isWeekend"
              dateFrom: null
              dateTo: null
        `);
    });
});
