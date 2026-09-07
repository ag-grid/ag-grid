import {
    AdvancedFilterHarness,
    ColumnFilterHarness,
    TestGridsManager,
    asyncSetTimeout,
    installFilterLayoutMock,
    uninstallFilterLayoutMock,
} from 'ag-test-utils';

import type {
    AdvancedFilterModel,
    ColDef,
    ColumnAdvancedFilterModel,
    FilterInputCallbackParams,
    GridApi,
    GridOptions,
    TextMatcherParams,
} from 'ag-grid-community';
import {
    BigIntFilterModule,
    ClientSideRowModelModule,
    CustomFilterModule,
    DateFilterModule,
    NumberFilterModule,
    TextFilterModule,
    setupAgTestIds,
} from 'ag-grid-community';
import { AdvancedFilterModule, MultiFilterModule, SetFilterModule } from 'ag-grid-enterprise';

/** A filter component that filters nothing: only its `filterParams` matter here. */
class MinimalFilter {
    public init(): void {}
    public getGui(): HTMLElement {
        return document.createElement('div');
    }
    public isFilterActive(): boolean {
        return false;
    }
    public doesFilterPass(): boolean {
        return true;
    }
    public getModel(): null {
        return null;
    }
    public setModel(): void {}
}

interface TestRow {
    id: number;
    athlete: string | null;
    age: number | string | null;
    date: string | null;
    qty: bigint | string | number | null;
}

const ROW_DATA: TestRow[] = [
    { id: 0, athlete: 'Alpha', age: 1, date: '2008-08-24', qty: 10n },
    { id: 1, athlete: 'alpha beta', age: 2, date: '   ', qty: '10' },
    { id: 2, athlete: '', age: 3, date: null, qty: 10 },
    { id: 3, athlete: '   ', age: null, date: '2020-07-23', qty: null },
    { id: 4, athlete: null, age: 0, date: 'not a date', qty: 'nope' },
    { id: 5, athlete: 'Beta', age: -2, date: '2012-08-05', qty: -5n },
    { id: 6, athlete: 'Gamma', age: '', date: '', qty: '' },
];

const COLUMN_DEFS: GridOptions<TestRow>['columnDefs'] = [
    { field: 'athlete', filter: 'agTextColumnFilter' },
    { field: 'age', filter: 'agNumberColumnFilter' },
    { field: 'date', cellDataType: 'dateString', filter: 'agDateColumnFilter' },
    { field: 'qty', cellDataType: 'bigint', filter: 'agBigIntColumnFilter' },
];

function getDisplayedIds(api: GridApi<{ id: number }>): number[] {
    const result: number[] = [];
    for (let i = 0; i < api.getDisplayedRowCount(); i++) {
        result.push(api.getDisplayedRowAtIndex(i)!.data!.id);
    }
    return result;
}

describe('Advanced Filter matches the column filter', () => {
    const gridsManager = new TestGridsManager({
        modules: [
            TextFilterModule,
            NumberFilterModule,
            DateFilterModule,
            BigIntFilterModule,
            SetFilterModule,
            MultiFilterModule,
            CustomFilterModule,
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

    /** The rows a column filter shows for `model`, applied to a grid with no Advanced Filter. */
    async function withColumnFilter(
        colId: string,
        model: object,
        columnDefs: GridOptions['columnDefs'] = COLUMN_DEFS,
        rowData: object[] = ROW_DATA
    ): Promise<number[]> {
        const api = gridsManager.createGrid('columnFilterGrid', { columnDefs, rowData });
        await asyncSetTimeout(0);
        await api.setColumnFilterModel(colId, model);
        api.onFilterChanged();
        await asyncSetTimeout(0);
        const ids = getDisplayedIds(api);
        api.destroy();
        return ids;
    }

    /** The rows the Advanced Filter shows for the equivalent condition. */
    async function withAdvancedFilter(
        model: AdvancedFilterModel,
        columnDefs: GridOptions['columnDefs'] = COLUMN_DEFS,
        rowData: object[] = ROW_DATA
    ): Promise<number[]> {
        const api = gridsManager.createGrid('advancedFilterGrid', { columnDefs, rowData, enableAdvancedFilter: true });
        await asyncSetTimeout(0);
        api.setAdvancedFilterModel(model);
        api.onFilterChanged();
        await asyncSetTimeout(0);
        const ids = getDisplayedIds(api);
        api.destroy();
        return ids;
    }

    /** Anchors the comparison: were either side to stop filtering, both would return every row and agree. */
    function expectFiltered(ids: number[], total = ROW_DATA.length): void {
        expect(ids.length).toBeGreaterThan(0);
        expect(ids.length).toBeLessThan(total);
    }

    /**
     * The harness that keeps the two filters honest: every built-in option, evaluated by both against the same
     * rows. A future change that makes one of them mean something different fails here.
     */
    describe.each([
        { colId: 'athlete', filterType: 'text' as const, filter: 'alpha' },
        { colId: 'age', filterType: 'number' as const, filter: 2 },
    ])('$colId', ({ colId, filterType, filter }) => {
        const valuedOptions =
            filterType === 'text'
                ? ['contains', 'notContains', 'equals', 'notEqual', 'startsWith', 'endsWith']
                : ['equals', 'notEqual', 'greaterThan', 'greaterThanOrEqual', 'lessThan', 'lessThanOrEqual'];

        test.each(valuedOptions)('`%s` filters the same rows', async (type) => {
            const columnFilterIds = await withColumnFilter(colId, { filterType, type, filter });
            const advancedFilterIds = await withAdvancedFilter({
                filterType,
                colId,
                type,
                filter,
            } as ColumnAdvancedFilterModel);

            expectFiltered(columnFilterIds);
            expect(advancedFilterIds).toEqual(columnFilterIds);
        });

        test.each(['blank', 'notBlank'])('`%s` filters the same rows', async (type) => {
            const columnFilterIds = await withColumnFilter(colId, { filterType, type });
            const advancedFilterIds = await withAdvancedFilter({
                filterType,
                colId,
                type,
            } as ColumnAdvancedFilterModel);

            expectFiltered(columnFilterIds);
            expect(advancedFilterIds).toEqual(columnFilterIds);
        });
    });

    describe('a Set Filter column', () => {
        const setDefs = COLUMN_DEFS!.map((def) =>
            (def as { field?: string }).field === 'athlete' ? { ...def, filter: 'agSetColumnFilter' } : def
        );

        const advancedModel = (type: 'isAnyOf' | 'isNoneOf', values: (string | null)[]) =>
            ({ filterType: 'set', colId: 'athlete', type, values }) as ColumnAdvancedFilterModel;

        test('`isAnyOf` filters the same rows as the equivalent selection', async () => {
            const selections: Record<string, (string | null)[]> = {
                'one value': ['Alpha'],
                'two values': ['Alpha', 'Beta'],
                'a blank': [null],
                'a blank among values': [null, 'Alpha'],
            };
            const outcomes: Record<string, number[]> = {};
            const expected: Record<string, number[]> = {};

            for (const [name, values] of Object.entries(selections)) {
                const columnFilterIds = await withColumnFilter('athlete', { filterType: 'set', values }, setDefs);
                expectFiltered(columnFilterIds);
                expected[name] = columnFilterIds;
                outcomes[name] = await withAdvancedFilter(advancedModel('isAnyOf', values), setDefs);
            }

            expect(outcomes).toEqual(expected);
        });

        test('`isNoneOf` leaves exactly the rows the selection excludes', async () => {
            const values = ['Alpha', 'Beta'];
            const selected = await withColumnFilter('athlete', { filterType: 'set', values }, setDefs);
            const excluded = await withAdvancedFilter(advancedModel('isNoneOf', values), setDefs);

            expectFiltered(selected);
            expectFiltered(excluded);
            const byId = (a: number, b: number) => a - b;
            expect([...selected, ...excluded].sort(byId)).toEqual(ROW_DATA.map(({ id }) => id).sort(byId));
        });
    });

    test('`includeBlanksInNotEqual` admits a blank to `notEqual` in both', async () => {
        const defs = COLUMN_DEFS!.map((def) =>
            (def as { field?: string }).field === 'age'
                ? { ...def, filterParams: { includeBlanksInNotEqual: true } }
                : def
        );
        const columnFilterIds = await withColumnFilter(
            'age',
            { filterType: 'number', type: 'notEqual', filter: 2 },
            defs
        );

        expect(columnFilterIds).toContain(3); // the row with a null age
        expect(columnFilterIds).toContain(6); // and the row with an empty-string age
        expect(
            await withAdvancedFilter({ filterType: 'number', colId: 'age', type: 'notEqual', filter: 2 }, defs)
        ).toEqual(columnFilterIds);
    });

    describe("the column's Text Filter configuration", () => {
        const TEXT_ROWS = [
            { id: 0, name: 'red car' },
            { id: 1, name: 'carpet' },
            { id: 2, name: 'scar' },
            { id: 3, name: 'Café' },
            { id: 4, name: 'cafe' },
        ];

        const textDefs = (filterParams: object): GridOptions['columnDefs'] => [
            { field: 'id' },
            { field: 'name', filter: 'agTextColumnFilter', filterParams },
        ];

        /** The rows the column filter shows for a model set through its API. */
        async function withColumnModel(
            filterParams: object,
            model: object,
            columnDefs = textDefs(filterParams)
        ): Promise<number[]> {
            const api = await gridsManager.createGridAndWait('columnFilterGrid', {
                columnDefs,
                rowData: TEXT_ROWS,
            });
            await api.setColumnFilterModel('name', model);
            api.onFilterChanged();
            await asyncSetTimeout(0);
            const ids = getDisplayedIds(api);
            api.destroy();
            return ids;
        }

        /** The rows the Advanced Filter shows for the equivalent expression, applied as a user applies it. */
        async function withExpression(
            filterParams: object,
            expression: string,
            columnDefs = textDefs(filterParams)
        ): Promise<number[]> {
            const api = await gridsManager.createGridAndWait('advancedFilterGrid', {
                columnDefs,
                rowData: TEXT_ROWS,
                enableAdvancedFilter: true,
            });
            await AdvancedFilterHarness.get(api).applyExpression(expression);
            await asyncSetTimeout(0);
            const ids = getDisplayedIds(api);
            api.destroy();
            return ids;
        }

        const contains = (filter: string) => ({ filterType: 'text', type: 'contains', filter });

        const wholeWord = ({ value, filterText }: TextMatcherParams) =>
            !!filterText && new RegExp(`\\b${filterText}\\b`).test(value);

        test('a `textMatcher` decides `contains` in both, and is told which filter is asking', async () => {
            const sources = new Set<string>();
            const textMatcher = (params: TextMatcherParams) => {
                sources.add(params.source);
                return wholeWord(params);
            };

            // Without one, all three spellings contain the text; the matcher is what narrows them to the word.
            expect(await withColumnModel({}, contains('car'))).toEqual([0, 1, 2]);
            expect(await withColumnModel({ textMatcher }, contains('car'))).toEqual([0]);
            expect([...sources]).toEqual(['columnFilter']);

            sources.clear();
            expect(await withExpression({ textMatcher }, '[Name] contains "car"')).toEqual([0]);
            expect([...sources]).toEqual(['advancedFilter']);
        });

        // A matcher is keyed on `filterOption`, so it only means the same thing in both filters if both name
        // the option the same way. Every option `defaultMatcher` answers is checked, not just the first.
        test('a `textMatcher` is given the same `filterOption` by both filters, for every option', async () => {
            const options = [
                { type: 'contains', operator: 'contains' },
                { type: 'notContains', operator: 'does not contain' },
                { type: 'equals', operator: 'equals' },
                { type: 'notEqual', operator: 'does not equal' },
                { type: 'startsWith', operator: 'begins with' },
                { type: 'endsWith', operator: 'ends with' },
            ];
            const seen: string[] = [];
            const textMatcher = ({ filterOption }: TextMatcherParams) => {
                if (filterOption != null && !seen.includes(filterOption)) {
                    seen.push(filterOption);
                }
                return false;
            };

            for (const { type } of options) {
                await withColumnModel({ textMatcher }, { filterType: 'text', type, filter: 'car' });
            }
            expect(seen).toEqual(options.map(({ type }) => type));

            seen.length = 0;
            for (const { operator } of options) {
                await withExpression({ textMatcher }, `[Name] ${operator} "car"`);
            }
            expect(seen).toEqual(options.map(({ type }) => type));
        });

        /** A Multi Filter column whose params sit at the level `where` names. */
        const multiDefs = (
            where: 'child' | 'column',
            params: object,
            filter: ColDef['filter'] = 'agTextColumnFilter'
        ) => {
            const children = [
                { filter, filterParams: where === 'child' ? params : undefined },
                { filter: 'agSetColumnFilter' },
            ];
            return [
                { field: 'id' },
                {
                    field: 'name',
                    filter: 'agMultiColumnFilter',
                    filterParams: { ...(where === 'column' ? params : {}), filters: children },
                },
            ] as GridOptions['columnDefs'];
        };

        /** A Multi Filter's model is positional over its children, the Text Filter being the first. */
        const multiContains = (filter: string) => ({
            filterType: 'multi',
            filterModels: [contains(filter), null],
        });

        test('a Multi Filter column reads its Text Filter child', async () => {
            const defs = multiDefs('child', { textMatcher: wholeWord });

            expect(await withColumnModel({}, multiContains('car'), defs)).toEqual([0]);
            expect(await withExpression({}, '[Name] contains "car"', defs)).toEqual([0]);
        });

        test('a Multi Filter child asking for the default gets the Text Filter, in both', async () => {
            const defs = multiDefs('child', { textMatcher: wholeWord }, true);

            expect(await withColumnModel({}, multiContains('car'), defs)).toEqual([0]);
            expect(await withExpression({}, '[Name] contains "car"', defs)).toEqual([0]);
        });

        // A Multi Filter builds each child from the child's own params, so text params written at the column's
        // level are not the Text Filter child's — in either filter. Pinned because it reads like an oversight.
        test.each([
            { children: 'named', defs: () => multiDefs('column', { textMatcher: wholeWord }) },
            {
                children: 'absent',
                defs: (): GridOptions['columnDefs'] => [
                    { field: 'id' },
                    { field: 'name', filter: 'agMultiColumnFilter', filterParams: { textMatcher: wholeWord } },
                ],
            },
        ])(
            "a Multi Filter column with $children children ignores text params at the column's own level, in both",
            async ({ defs }) => {
                expect(await withColumnModel({}, multiContains('car'), defs())).toEqual([0, 1, 2]);
                expect(await withExpression({}, '[Name] contains "car"', defs())).toEqual([0, 1, 2]);
            }
        );

        test('a Multi Filter column reads `caseSensitive` from the same level as the formatter', async () => {
            expect(await withExpression({}, '[Name] contains "CAR"', multiDefs('child', {}))).toEqual([0, 1, 2]);
            expect(
                await withExpression({}, '[Name] contains "CAR"', multiDefs('child', { caseSensitive: true }))
            ).toEqual([]);

            // A child asking for the default names no filter, so the text resolution is the only one that
            // folds `true` to the Text Filter and reaches its params.
            expect(await withExpression({}, '[Name] contains "CAR"', multiDefs('child', {}, true))).toEqual([0, 1, 2]);
            expect(
                await withExpression({}, '[Name] contains "CAR"', multiDefs('child', { caseSensitive: true }, true))
            ).toEqual([]);
        });

        test('a `textFormatter` normalises the value and the operand alike in both, and is told which filter is asking', async () => {
            const sources = new Set<string>();
            const foldAccents = (from: string, params: FilterInputCallbackParams) => {
                sources.add(params.source);
                return from
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '')
                    .toLowerCase();
            };

            expect(await withColumnModel({}, contains('cafe'))).toEqual([4]);
            expect(await withColumnModel({ textFormatter: foldAccents }, contains('cafe'))).toEqual([3, 4]);
            expect([...sources]).toEqual(['columnFilter']);

            sources.clear();
            expect(await withExpression({ textFormatter: foldAccents }, '[Name] contains "cafe"')).toEqual([3, 4]);
            expect([...sources]).toEqual(['advancedFilter']);

            // The formatter replaces the case handling rather than adding to it, so this changes nothing.
            const withCase = { textFormatter: foldAccents, caseSensitive: true };
            expect(await withColumnModel(withCase, contains('cafe'))).toEqual([3, 4]);
            expect(await withExpression(withCase, '[Name] contains "cafe"')).toEqual([3, 4]);
        });

        test("a Custom Filter Option's `predicate` decides in both, and is told which filter is asking", async () => {
            const sources = new Set<string>();
            const filterOptions = [
                {
                    displayKey: 'wholeWord',
                    displayName: 'whole word',
                    numberOfInputs: 1,
                    predicate: ([filterValue]: any[], cellValue: any, params: FilterInputCallbackParams) => {
                        sources.add(params.source);
                        return typeof cellValue === 'string' && new RegExp(`\\b${filterValue}\\b`).test(cellValue);
                    },
                },
            ];
            const model = { filterType: 'text', type: 'wholeWord', filter: 'car' };

            expect(await withColumnModel({ filterOptions }, model)).toEqual([0]);
            expect([...sources]).toEqual(['columnFilter']);

            sources.clear();
            expect(await withExpression({ filterOptions }, '[Name] whole word "car"')).toEqual([0]);
            expect([...sources]).toEqual(['advancedFilter']);
        });

        // The column filter trims on its apply action rather than in the model, so this one is driven
        // through its UI: a model set through the API keeps the whitespace it was given.
        test('`trimInput` trims what was entered in both', async () => {
            const filterParams = { trimInput: true, buttons: ['apply'] };
            const api = await gridsManager.createGridAndWait('columnFilterGrid', {
                columnDefs: textDefs(filterParams),
                rowData: TEXT_ROWS,
            });
            const filter = await ColumnFilterHarness.open(api, 'name');
            await filter.selectOperator('Begins with');
            await filter.setText(' car ');
            await filter.apply();

            expect(filter.getModel()).toEqual({ filterType: 'text', type: 'startsWith', filter: 'car' });
            expect(getDisplayedIds(api)).toEqual([1]);
            expect(await withExpression(filterParams, '[Name] begins with " car "')).toEqual([1]);
            // Without it the spaces are part of what is looked for, on both sides.
            expect(await withExpression({}, '[Name] begins with " car "')).toEqual([]);
        });

        // Whatever is typed stays typed: the trim reaches the operand the filter matches on, never the text.
        test('`trimInput` leaves the expression as it was written, and a whitespace-only operand alone', async () => {
            const api = await gridsManager.createGridAndWait('advancedFilterGrid', {
                columnDefs: textDefs({ trimInput: true }),
                rowData: TEXT_ROWS,
                enableAdvancedFilter: true,
            });
            const advanced = AdvancedFilterHarness.get(api);

            await advanced.type('[Name] begins with " car ');
            expect(advanced.value).toBe('[Name] begins with " car ');
            await advanced.applyExpression('[Name] begins with " car "');
            expect(advanced.value).toBe('[Name] begins with " car "');
            api.destroy();

            // Only whitespace is left as it was entered, so it matches nothing rather than everything.
            expect(await withExpression({ trimInput: true }, '[Name] contains "   "')).toEqual([]);
        });

        // The Advanced Filter has one route in, so the trim reaches a model set through the API too.
        // A `textFormatter` is declared as returning `string | null`, so the default comparison has to survive
        // the null on either side rather than throwing out of `onFilterChanged`.
        test('a `textFormatter` returning null excludes the row rather than throwing, in both', async () => {
            const filterParams = { textFormatter: (from: string) => (from === 'carpet' ? null : from) };

            expect(await withColumnModel(filterParams, contains('car'))).toEqual([0, 2]);
            expect(await withExpression(filterParams, '[Name] contains "car"')).toEqual([0, 2]);
        });

        // Both filters fold case without consulting the locale, as the Quick and Set filters do: a locale-aware
        // fold makes a letter fail to match its own other case in Turkish and Lithuanian.
        test('the default comparison folds case without consulting the locale, in both', async () => {
            // A Turkish fold maps `I` to a dotless `ı`, which would stop it matching the `i` in the operand.
            const localeFold = vi.spyOn(String.prototype, 'toLocaleLowerCase').mockImplementation(function (
                this: string
            ) {
                return this.replace(/I/g, 'ı').toLowerCase();
            });
            const columnDefs: GridOptions['columnDefs'] = [
                { field: 'id' },
                { field: 'name', filter: 'agTextColumnFilter' },
            ];
            const rowData = [
                { id: 0, name: 'INDIGO' },
                { id: 1, name: 'green' },
            ];

            try {
                const columnApi = await gridsManager.createGridAndWait('columnFilterGrid', { columnDefs, rowData });
                await columnApi.setColumnFilterModel('name', contains('indigo'));
                columnApi.onFilterChanged();
                await asyncSetTimeout(0);
                expect(getDisplayedIds(columnApi)).toEqual([0]);
                columnApi.destroy();

                const advancedApi = await gridsManager.createGridAndWait('advancedFilterGrid', {
                    columnDefs,
                    rowData,
                    enableAdvancedFilter: true,
                });
                advancedApi.setAdvancedFilterModel({
                    filterType: 'text',
                    colId: 'name',
                    type: 'contains',
                    filter: 'indigo',
                });
                advancedApi.onFilterChanged();
                await asyncSetTimeout(0);
                expect(getDisplayedIds(advancedApi)).toEqual([0]);
                advancedApi.destroy();
            } finally {
                localeFold.mockRestore();
            }
        });

        test('`trimInput` trims an operand set through `setAdvancedFilterModel`', async () => {
            const api = await gridsManager.createGridAndWait('advancedFilterGrid', {
                columnDefs: textDefs({ trimInput: true }),
                rowData: TEXT_ROWS,
                enableAdvancedFilter: true,
            });

            api.setAdvancedFilterModel({ filterType: 'text', colId: 'name', type: 'startsWith', filter: ' car ' });
            api.onFilterChanged();
            await asyncSetTimeout(0);

            expect(getDisplayedIds(api)).toEqual([1]);
            expect(api.getAdvancedFilterModel()).toEqual({
                filterType: 'text',
                colId: 'name',
                type: 'startsWith',
                filter: 'car',
            });
        });

        // The column filter hands its matcher whatever the formatter returned, null included, and decides nothing
        // for it; the Advanced Filter has to reach the matcher on the same values.
        test('a `textMatcher` is reached with what the formatter returned, in both', async () => {
            const seen: unknown[] = [];
            const filterParams = {
                textFormatter: (from: string) => (from === 'scar' ? null : from.toLowerCase()),
                textMatcher: ({ value, filterText }: TextMatcherParams) => {
                    seen.push(value);
                    return value != null && !!filterText && value.includes(filterText);
                },
            };

            expect(await withColumnModel(filterParams, contains('car'))).toEqual([0, 1]);
            expect(seen).toContain(null);

            seen.length = 0;
            expect(await withExpression(filterParams, '[Name] contains "car"')).toEqual([0, 1]);
            expect(seen).toContain(null);
        });

        // `notContains` returns the matcher's answer unnegated, which a re-implementation can get backwards.
        test('a `textMatcher` decides `does not contain` unnegated, in both', async () => {
            const params = { textMatcher: wholeWord };

            expect(await withColumnModel(params, { filterType: 'text', type: 'notContains', filter: 'car' })).toEqual([
                0,
            ]);
            expect(await withExpression(params, '[Name] does not contain "car"')).toEqual([0]);
        });

        // A Set Filter's `textFormatter` formats its list, so folding accents with it here would match rows
        // the Set Filter itself never matches.
        test('a Set Filter column does not read its `textFormatter` as a Text Filter one', async () => {
            const columnDefs: GridOptions['columnDefs'] = [
                { field: 'id' },
                { field: 'name', filter: 'agSetColumnFilter', filterParams: { textFormatter: () => 'cafe' } },
            ];

            expect(await withExpression({}, '[Name] contains "cafe"', columnDefs)).toEqual([4]);
        });
    });

    // The same `source` the `textMatcher` gets, on the callbacks that read a value rather than a row. Both
    // filters run the column's own parser, so one parser can tell an expression operand from a typed input.
    test("a number column's `numberParser` is told which filter is asking", async () => {
        const sources = new Set<string>();
        const filterParams = {
            filterOptions: ['equals'],
            numberParser: (text: string | null, params: FilterInputCallbackParams) => {
                sources.add(params.source);
                return text ? Number(text) : null;
            },
            numberFormatter: (value: number | null, params: FilterInputCallbackParams) => {
                sources.add(params.source);
                return value == null ? null : String(value);
            },
        };
        const columnDefs: GridOptions<TestRow>['columnDefs'] = [
            { field: 'id' },
            { field: 'age', filter: 'agNumberColumnFilter', filterParams },
        ];

        const columnApi = await gridsManager.createGridAndWait('columnFilterGrid', { columnDefs, rowData: ROW_DATA });
        const filter = await ColumnFilterHarness.open(columnApi, 'age');
        await filter.setText('2');
        expect([...sources]).toEqual(['columnFilter']);

        sources.clear();
        const advancedApi = await gridsManager.createGridAndWait('advancedFilterGrid', {
            columnDefs,
            rowData: ROW_DATA,
            enableAdvancedFilter: true,
        });
        await AdvancedFilterHarness.get(advancedApi).applyExpression('[Age] = 2');
        await asyncSetTimeout(0);

        expect(getDisplayedIds(advancedApi)).toEqual([1]);
        expect([...sources]).toEqual(['advancedFilter']);
    });

    // The bigint pair is the other half of the same threading, and reads through a different fallback.
    test("a bigint column's parser and formatter are told which filter is asking", async () => {
        const sources = new Set<string>();
        const filterParams = {
            bigintParser: (text: string | null, params: FilterInputCallbackParams) => {
                sources.add(params.source);
                return text ? BigInt(text) : null;
            },
            bigintFormatter: (value: bigint | null, params: FilterInputCallbackParams) => {
                sources.add(params.source);
                return value == null ? null : String(value);
            },
        };
        const columnDefs: GridOptions<TestRow>['columnDefs'] = [
            { field: 'id' },
            { field: 'qty', cellDataType: 'bigint', filter: 'agBigIntColumnFilter', filterParams },
        ];

        const columnApi = await gridsManager.createGridAndWait('columnFilterGrid', { columnDefs, rowData: ROW_DATA });
        const filter = await ColumnFilterHarness.open(columnApi, 'qty');
        await filter.setText('10');
        expect([...sources]).toEqual(['columnFilter']);

        sources.clear();
        const advancedApi = await gridsManager.createGridAndWait('advancedFilterGrid', {
            columnDefs,
            rowData: ROW_DATA,
            enableAdvancedFilter: true,
        });
        await AdvancedFilterHarness.get(advancedApi).applyExpression('[Qty] = 10');
        await asyncSetTimeout(0);

        expect(getDisplayedIds(advancedApi)).toEqual([0, 1, 2]);
        expect([...sources]).toEqual(['advancedFilter']);
    });

    // Boolean has no column-filter counterpart to compare against — its options are `true`/`false`, not
    // `blank` — so this is the Advanced Filter alone, pinning that it answers blank the way every other type does.
    test('a boolean column answers blank for an empty or whitespace-only value', async () => {
        const defs = [
            { field: 'id' },
            { field: 'active', cellDataType: 'boolean' as const, filter: 'agTextColumnFilter' },
        ];
        const rowData = [
            { id: 0, active: true },
            { id: 1, active: false },
            { id: 2, active: null },
            { id: 3, active: '' },
            { id: 4, active: '   ' },
        ];
        const api = gridsManager.createGrid('booleanGrid', { columnDefs: defs, rowData, enableAdvancedFilter: true });
        await asyncSetTimeout(0);

        api.setAdvancedFilterModel({ filterType: 'boolean', colId: 'active', type: 'blank' });
        api.onFilterChanged();
        await asyncSetTimeout(0);
        expect(getDisplayedIds(api)).toEqual([2, 3, 4]);

        api.setAdvancedFilterModel({ filterType: 'boolean', colId: 'active', type: 'notBlank' });
        api.onFilterChanged();
        await asyncSetTimeout(0);
        expect(getDisplayedIds(api)).toEqual([0, 1]);
    });

    // Both sides refuse a date they cannot read, by different routes: the column filter through the grid's own
    // `isValidDate`, the Advanced Filter through the parse its `valueConverter` already does.
    test('an unreadable date compares rather than throwing, in both', async () => {
        expect(await withColumnFilter('date', { filterType: 'date', type: 'equals', dateFrom: '2008-08-24' })).toEqual([
            0,
        ]);
        expect(
            await withAdvancedFilter({
                filterType: 'dateString',
                colId: 'date',
                type: 'equals',
                filter: '2008-08-24',
            })
        ).toEqual([0]);
    });

    // The negated half of the same gate, and the only case in which an unreadable value is a match.
    test('an unreadable date is admitted to `notEqual`, in both', async () => {
        const columnFilterIds = await withColumnFilter('date', {
            filterType: 'date',
            type: 'notEqual',
            dateFrom: '2008-08-24',
        });

        expect(columnFilterIds).toContain(4); // 'not a date' is unreadable
        expect(columnFilterIds).not.toContain(1); // whitespace is blank, not unreadable
        expect(columnFilterIds).not.toContain(2); // and so are null
        expect(columnFilterIds).not.toContain(6); // and the empty string
        expect(
            await withAdvancedFilter({
                filterType: 'dateString',
                colId: 'date',
                type: 'notEqual',
                filter: '2008-08-24',
            })
        ).toEqual(columnFilterIds);
    });
    // `inRange` takes two values rather than one, so it cannot ride on the shared table above.
    describe('inRange', () => {
        test('a number range filters the same rows, exclusive of both ends', async () => {
            const model = { filterType: 'number' as const, type: 'inRange' as const, filter: -1, filterTo: 3 };
            const columnFilterIds = await withColumnFilter('age', model);

            expect(columnFilterIds).not.toContain(2); // age 3 is the excluded upper end
            expectFiltered(columnFilterIds);
            expect(await withAdvancedFilter({ ...model, colId: 'age' })).toEqual(columnFilterIds);
        });

        test('`inRangeInclusive` admits both ends in both', async () => {
            const defs = COLUMN_DEFS!.map((def) =>
                (def as { field?: string }).field === 'age' ? { ...def, filterParams: { inRangeInclusive: true } } : def
            );
            const model = { filterType: 'number' as const, type: 'inRange' as const, filter: -1, filterTo: 3 };
            const columnFilterIds = await withColumnFilter('age', model, defs);

            expect(columnFilterIds).toContain(2); // age 3 is now the included upper end
            expectFiltered(columnFilterIds);
            expect(await withAdvancedFilter({ ...model, colId: 'age' }, defs)).toEqual(columnFilterIds);
        });

        test('`includeBlanksInRange` admits a blank in both', async () => {
            const defs = COLUMN_DEFS!.map((def) =>
                (def as { field?: string }).field === 'age'
                    ? { ...def, filterParams: { includeBlanksInRange: true } }
                    : def
            );
            const model = { filterType: 'number' as const, type: 'inRange' as const, filter: -1, filterTo: 3 };
            const columnFilterIds = await withColumnFilter('age', model, defs);

            expect(columnFilterIds).toContain(3); // the row with a null age
            expect(columnFilterIds).toContain(6); // and the row with an empty-string age
            expectFiltered(columnFilterIds);
            expect(await withAdvancedFilter({ ...model, colId: 'age' }, defs)).toEqual(columnFilterIds);
        });

        // `bigint` reaches `evaluateRangeExpression` through its own parser and converter, not the number one.
        test('a bigint range filters the same rows', async () => {
            const columnFilterIds = await withColumnFilter('qty', {
                filterType: 'bigint',
                type: 'inRange',
                filter: '-6',
                filterTo: '10',
            });

            expectFiltered(columnFilterIds);
            expect(
                await withAdvancedFilter({
                    filterType: 'bigint',
                    colId: 'qty',
                    type: 'inRange',
                    filter: '-6',
                    filterTo: '10',
                })
            ).toEqual(columnFilterIds);
        });

        test('a date range filters the same rows', async () => {
            const columnFilterIds = await withColumnFilter('date', {
                filterType: 'date',
                type: 'inRange',
                dateFrom: '2008-01-01',
                dateTo: '2013-01-01',
            });

            expect(columnFilterIds).not.toContain(3); // 2020 is outside the range
            expectFiltered(columnFilterIds);
            expect(
                await withAdvancedFilter({
                    filterType: 'dateString',
                    colId: 'date',
                    type: 'inRange',
                    filter: '2008-01-01',
                    filterTo: '2013-01-01',
                })
            ).toEqual(columnFilterIds);
        });

        // The two params were proven on `number` above; the date path converts through a different
        // `valueConverter` before it reaches the same comparison.
        test('`inRangeInclusive` and `includeBlanksInRange` behave the same on a date column', async () => {
            const withDateParams = (filterParams: object) =>
                COLUMN_DEFS!.map((def) =>
                    (def as { field?: string }).field === 'date' ? { ...def, filterParams } : def
                );
            const model = {
                filterType: 'date' as const,
                type: 'inRange' as const,
                dateFrom: '2008-08-24',
                dateTo: '2020-07-23',
            };
            const advancedModel = {
                filterType: 'dateString' as const,
                colId: 'date',
                type: 'inRange' as const,
                filter: '2008-08-24',
                filterTo: '2020-07-23',
            };

            const inclusiveDefs = withDateParams({ inRangeInclusive: true });
            const inclusiveIds = await withColumnFilter('date', model, inclusiveDefs);
            expect(inclusiveIds).toContain(0); // 2008-08-24 is now the included lower end
            expectFiltered(inclusiveIds);
            expect(await withAdvancedFilter(advancedModel, inclusiveDefs)).toEqual(inclusiveIds);

            const blanksDefs = withDateParams({ includeBlanksInRange: true });
            const blanksIds = await withColumnFilter('date', model, blanksDefs);
            expect(blanksIds).toContain(2); // the row with a null date
            expectFiltered(blanksIds);
            expect(await withAdvancedFilter(advancedModel, blanksDefs)).toEqual(blanksIds);
        });

        // The one place the two deliberately part company. The ordering rule lives in the column filter's
        // input validation, so a model set through its API bypasses it and applies; the Advanced Filter has
        // only the one route in and rejects there. Asserted rather than omitted, so a change to either side
        // fails here instead of quietly restoring the divergence this file exists to catch.
        test('a reversed date range is rejected by the Advanced Filter where the column filter model applies it', async () => {
            const reversed = { type: 'inRange', filter: '2020-07-23', filterTo: '2008-08-24' };

            const advanced = await withAdvancedFilter({ filterType: 'dateString', colId: 'date', ...reversed });
            const column = await withColumnFilter('date', { filterType: 'date', ...reversed });

            expect(advanced).toEqual([0, 1, 2, 3, 4, 5, 6]); // no filter applied at all
            expect(column).toEqual([]); // applied, and nothing can fall inside it
            expect(advanced).not.toEqual(column);
        });

        // The rule belongs to the column filter, and so does the wording, except that an expression is read
        // away from the pair of inputs a column filter shows and so has to name the column it is about.
        test('a reversed range is reported against the same bound as the column filter, naming the column', async () => {
            const columnDefs: GridOptions<TestRow>['columnDefs'] = [
                { field: 'age', filter: 'agNumberColumnFilter', filterParams: { filterOptions: ['inRange'] } },
            ];

            const columnApi = await gridsManager.createGridAndWait('columnFilterGrid', {
                columnDefs,
                rowData: ROW_DATA,
            });
            const filter = await ColumnFilterHarness.open(columnApi, 'age');
            await filter.setNumber(38, 0);
            await filter.setNumber(21, 1);
            const columnMessage = filter.input('number', 1).validationMessage;

            const advancedApi = gridsManager.createGrid('advancedFilterGrid', {
                columnDefs,
                rowData: ROW_DATA,
                enableAdvancedFilter: true,
            });
            await asyncSetTimeout(0);
            const advanced = AdvancedFilterHarness.get(advancedApi);
            await advanced.applyExpression('[Age] is between (38, 21)');
            await asyncSetTimeout(0);

            expect(columnMessage).toBe('Must be greater than 38');
            expect(advanced.input.validationMessage).toBe('Expression has an error. Age must be greater than 38.');
        });

        // Bigints are ordered as numbers, where the decimal text the model stores them as would put 9 above 10.
        test('a bigint range is judged on the value, not on the text the model stores', async () => {
            const model = { filterType: 'bigint' as const, colId: 'qty', type: 'inRange' as const };

            expect(await withAdvancedFilter({ ...model, filter: '9', filterTo: '10' })).toEqual([]);
            expect(await withAdvancedFilter({ ...model, filter: '10', filterTo: '9' })).toEqual([0, 1, 2, 3, 4, 5, 6]);
        });
    });

    /**
     * A date column's `filterParams.comparator` decides its comparisons in both filters. Cells carry a time
     * here, which is what makes a day-only comparator change the answer rather than merely restate it.
     */
    describe('a date comparator', () => {
        interface TimedRow {
            id: number;
            when: Date | null;
        }

        const TIMED_ROWS: TimedRow[] = [
            { id: 0, when: new Date(2008, 7, 24, 13, 45) },
            { id: 1, when: new Date(2008, 7, 24) },
            { id: 2, when: new Date(2012, 7, 5, 9, 30) },
            { id: 3, when: new Date(2020, 6, 23, 23, 59) },
            { id: 4, when: null },
        ];

        /** The ticket's own comparator: compare the day, ignore the time the cell carries. */
        function midnightComparator(filterDate: Date, cellValue: any): number {
            const cellDate = new Date(cellValue);
            cellDate.setHours(0, 0, 0, 0);
            if (cellDate < filterDate) {
                return -1;
            }
            if (cellDate > filterDate) {
                return 1;
            }
            return 0;
        }

        function timedDefs(
            filterParams: object,
            filter: ColDef['filter'] = 'agDateColumnFilter'
        ): GridOptions<TimedRow>['columnDefs'] {
            return [{ field: 'id' }, { field: 'when', cellDataType: 'date', filter, filterParams }];
        }

        const timedColumnFilter = (
            model: object,
            columnDefs: GridOptions<TimedRow>['columnDefs'],
            rowData: object[] = TIMED_ROWS
        ) => withColumnFilter('when', model, columnDefs, rowData);

        const timedAdvancedFilter = (
            model: AdvancedFilterModel,
            columnDefs: GridOptions<TimedRow>['columnDefs'],
            rowData: object[] = TIMED_ROWS
        ) => withAdvancedFilter(model, columnDefs, rowData);

        // `greaterThanOrEqual` and `lessThanOrEqual` are not among the Date Filter's default options, so the
        // column has to name them for there to be anything to compare the Advanced Filter against.
        const comparatorParams = {
            comparator: midnightComparator,
            filterOptions: [
                'equals',
                'notEqual',
                'greaterThan',
                'greaterThanOrEqual',
                'lessThan',
                'lessThanOrEqual',
                'inRange',
                'blank',
                'notBlank',
            ],
        };
        const comparatorDefs = timedDefs(comparatorParams);

        // The reported case: without the comparator only the cell that happens to sit at midnight matches.
        test('`equals` matches every cell on the day, in both', async () => {
            const columnFilterIds = await timedColumnFilter(
                { filterType: 'date', type: 'equals', dateFrom: '2008-08-24' },
                comparatorDefs
            );

            expect(columnFilterIds).toEqual([0, 1]);
            expect(
                await timedAdvancedFilter(
                    { filterType: 'date', colId: 'when', type: 'equals', filter: '2008-08-24' },
                    comparatorDefs
                )
            ).toEqual(columnFilterIds);
        });

        // Each option maps to a different sign of the comparator's result, so a mapping that drifts from the
        // column filter's shows up as a different set of rows for that option alone.
        test.each(['notEqual', 'greaterThan', 'greaterThanOrEqual', 'lessThan', 'lessThanOrEqual'])(
            '`%s` filters the same rows as the Date Filter',
            async (type) => {
                // A day every option leaves some rows on either side of, and one the timed cell sits on.
                const columnFilterIds = await timedColumnFilter(
                    { filterType: 'date', type, dateFrom: '2012-08-05' },
                    comparatorDefs
                );

                expectFiltered(columnFilterIds, TIMED_ROWS.length);
                expect(
                    await timedAdvancedFilter(
                        { filterType: 'date', colId: 'when', type, filter: '2012-08-05' } as ColumnAdvancedFilterModel,
                        comparatorDefs
                    )
                ).toEqual(columnFilterIds);
            }
        );

        test('`inRange` takes both bounds through the comparator, in both', async () => {
            const model = { type: 'inRange', dateFrom: '2008-08-24', dateTo: '2020-07-23' };
            const advancedModel = {
                filterType: 'date' as const,
                colId: 'when',
                type: 'inRange' as const,
                filter: '2008-08-24',
                filterTo: '2020-07-23',
            };

            const exclusiveIds = await timedColumnFilter({ filterType: 'date', ...model }, comparatorDefs);
            expect(exclusiveIds).toEqual([2]); // both end days are excluded, times and all
            expect(await timedAdvancedFilter(advancedModel, comparatorDefs)).toEqual(exclusiveIds);

            const inclusiveDefs = timedDefs({ ...comparatorParams, inRangeInclusive: true });
            const inclusiveIds = await timedColumnFilter({ filterType: 'date', ...model }, inclusiveDefs);
            expect(inclusiveIds).toEqual([0, 1, 2, 3]);
            expect(await timedAdvancedFilter(advancedModel, inclusiveDefs)).toEqual(inclusiveIds);
        });

        // A relative range is half-open, so which side each bound is compared on is what the day boundary pins.
        // The comparator reads a cell as the day before it holds, which is what puts the raw value and the
        // compared day on opposite sides of that boundary: converting instead of comparing picks the other row.
        test('a relative date option compares its bounds through the comparator, in both', async () => {
            const startOfToday = new Date();
            startOfToday.setHours(0, 0, 0, 0);
            const at = (dayOffset: number, hours: number) => {
                const date = new Date(startOfToday);
                date.setDate(date.getDate() + dayOffset);
                date.setHours(hours, 0);
                return date;
            };
            const rowData = [
                { id: 0, when: at(0, 9) },
                { id: 1, when: at(1, 9) },
                { id: 2, when: at(2, 9) },
            ];
            const columnDefs = timedDefs({
                comparator: (filterDate: Date, cellValue: any) => {
                    const cellDate = new Date(cellValue);
                    cellDate.setDate(cellDate.getDate() - 1);
                    return midnightComparator(filterDate, cellDate);
                },
                filterOptions: ['today', 'equals'],
            });

            const columnFilterIds = await timedColumnFilter({ filterType: 'date', type: 'today' }, columnDefs, rowData);

            expect(columnFilterIds).toEqual([1]); // tomorrow's cell is the one that reads as today
            expect(
                await timedAdvancedFilter({ filterType: 'date', colId: 'when', type: 'today' }, columnDefs, rowData)
            ).toEqual(columnFilterIds);
        });

        // A comparator is handed whatever the cell holds, so `isValidDate` is what keeps a value it cannot
        // read out of the comparison — the pairing the Date Filter's own documentation describes.
        test('`isValidDate` keeps an unreadable cell out of every comparison but `notEqual`, in both', async () => {
            const columnDefs = timedDefs({
                ...comparatorParams,
                isValidDate: (value: any) => value instanceof Date && !isNaN(+value),
            });
            const rowData = [
                { id: 0, when: new Date(2008, 7, 24, 13, 45) },
                { id: 1, when: new Date(NaN) },
            ];

            for (const [type, expected] of [
                ['equals', [0]],
                ['notEqual', [1]],
                ['lessThanOrEqual', [0]],
            ] as [string, number[]][]) {
                const columnFilterIds = await timedColumnFilter(
                    { filterType: 'date', type, dateFrom: '2008-08-24' },
                    columnDefs,
                    rowData
                );
                expect(columnFilterIds).toEqual(expected);
                expect(
                    await timedAdvancedFilter(
                        { filterType: 'date', colId: 'when', type, filter: '2008-08-24' } as ColumnAdvancedFilterModel,
                        columnDefs,
                        rowData
                    )
                ).toEqual(columnFilterIds);
            }

            // `inRange` and the relative options gate through paths of their own. Both need a cell the
            // comparator would otherwise admit, or the range excludes it anyway and the gate proves nothing.
            const rangeDefs = timedDefs({
                ...comparatorParams,
                isValidDate: (value: any) => value.getFullYear() >= 1900,
            });
            const rangeRows = [
                { id: 0, when: new Date(1899, 5, 15) },
                { id: 1, when: new Date(2008, 7, 24) },
            ];
            const rangeModel = { type: 'inRange', dateFrom: '1899-01-01', dateTo: '2020-01-01' };

            const rangeColumnIds = await timedColumnFilter({ filterType: 'date', ...rangeModel }, rangeDefs, rangeRows);
            expect(rangeColumnIds).toEqual([1]); // 1899 sits inside the range and is refused by `isValidDate`
            expect(
                await timedAdvancedFilter(
                    {
                        filterType: 'date',
                        colId: 'when',
                        type: 'inRange',
                        filter: '1899-01-01',
                        filterTo: '2020-01-01',
                    },
                    rangeDefs,
                    rangeRows
                )
            ).toEqual(rangeColumnIds);

            const todayDefs = timedDefs({
                ...comparatorParams,
                isValidDate: (value: any) => value.getHours() !== 3,
                filterOptions: ['today', 'equals'],
            });
            const todayAt = (hours: number) => {
                const date = new Date();
                date.setHours(hours, 0, 0, 0);
                return date;
            };
            const todayRows = [
                { id: 0, when: todayAt(10) },
                { id: 1, when: todayAt(3) }, // today too, and refused by `isValidDate` alone
            ];

            const todayColumnIds = await timedColumnFilter({ filterType: 'date', type: 'today' }, todayDefs, todayRows);
            expect(todayColumnIds).toEqual([0]);
            expect(
                await timedAdvancedFilter({ filterType: 'date', colId: 'when', type: 'today' }, todayDefs, todayRows)
            ).toEqual(todayColumnIds);
        });

        test('a blank is still answered by `includeBlanksInEquals`, not by the comparator', async () => {
            const columnDefs = timedDefs({ ...comparatorParams, includeBlanksInEquals: true });
            const model = { type: 'equals', dateFrom: '2008-08-24' };

            const columnFilterIds = await timedColumnFilter({ filterType: 'date', ...model }, columnDefs);
            expect(columnFilterIds).toEqual([0, 1, 4]); // 4 holds a null date
            expect(
                await timedAdvancedFilter(
                    { filterType: 'date', colId: 'when', type: 'equals', filter: '2008-08-24' },
                    columnDefs
                )
            ).toEqual(columnFilterIds);
        });

        // A Set Filter's `comparator` orders its list — `(a, b)` over two cell values — so reading it as a
        // date comparison compares the wrong things. One that calls every pair equal would match every row.
        // `filter: true` is the reachable case: under enterprise it resolves to the Set Filter, so the name
        // alone does not say which filter owns the parameter.
        test.each(['agSetColumnFilter' as const, true as const])(
            'a Set Filter column ignores its list `comparator` (`filter: %s`)',
            async (filter) => {
                const columnDefs = timedDefs({ comparator: () => 0 }, filter);

                expect(
                    await timedAdvancedFilter(
                        { filterType: 'date', colId: 'when', type: 'equals', filter: '2008-08-24' },
                        columnDefs
                    )
                ).toEqual([1]);
            }
        );

        // A Set Filter has no `isValidDate` of its own, so unlike `comparator` there is nothing for it to mean
        // instead, and it still gates the date comparisons the Advanced Filter offers such a column.
        test.each(['agSetColumnFilter' as const, true as const])(
            'a Set Filter column still gates on `isValidDate` (`filter: %s`)',
            async (filter) => {
                const columnDefs = timedDefs(
                    { isValidDate: (value: any) => value instanceof Date && value.getFullYear() >= 1900 },
                    filter
                );
                const rowData = [
                    { id: 0, when: new Date(1899, 0, 1) },
                    { id: 1, when: new Date(2012, 7, 5) },
                ];

                // The 1899 row is the only one below the bound, so an ungated comparison returns it.
                expect(
                    await timedAdvancedFilter(
                        { filterType: 'date', colId: 'when', type: 'lessThan', filter: '2000-01-01' },
                        columnDefs,
                        rowData
                    )
                ).toEqual([]);
                // Without a gate to apply, the same column still compares: the bound alone admits both rows.
                expect(
                    await timedAdvancedFilter(
                        { filterType: 'date', colId: 'when', type: 'lessThan', filter: '2020-01-01' },
                        timedDefs({}, filter),
                        rowData
                    )
                ).toEqual([0, 1]);
            }
        );

        // `comparator` is the Date Filter's key; a custom component's `filterParams` are its own, and the
        // ordinary `(a, b)` sort shape is the inverse of `IDateComparatorFunc`, so reading it flips every option.
        test('a custom filter component column ignores its own `comparator`', async () => {
            const columnDefs = timedDefs({ comparator: (a: any, b: any) => (a > b ? 1 : -1) }, MinimalFilter);

            expect(
                await timedAdvancedFilter(
                    { filterType: 'date', colId: 'when', type: 'greaterThan', filter: '2010-01-01' },
                    columnDefs
                )
            ).toEqual([2, 3]);
        });

        // A Multi Filter carries the Date Filter as a child, so its comparator lives a level down.
        test("a Multi Filter column reads its date child's `comparator`, in both", async () => {
            const columnDefs = timedDefs(
                { filters: [{ filter: 'agDateColumnFilter', filterParams: comparatorParams }] },
                'agMultiColumnFilter'
            );

            const columnFilterIds = await timedColumnFilter(
                { filterType: 'multi', filterModels: [{ filterType: 'date', type: 'equals', dateFrom: '2008-08-24' }] },
                columnDefs
            );

            expect(columnFilterIds).toEqual([0, 1]); // the timed cell too, since the comparator drops its time
            expect(
                await timedAdvancedFilter(
                    { filterType: 'date', colId: 'when', type: 'equals', filter: '2008-08-24' },
                    columnDefs
                )
            ).toEqual(columnFilterIds);
        });

        // The child carries the rest of the comparison's configuration as well as the comparator.
        test("a Multi Filter column reads its date child's `inRangeInclusive`, in both", async () => {
            const columnDefs = timedDefs(
                {
                    filters: [
                        {
                            filter: 'agDateColumnFilter',
                            filterParams: { ...comparatorParams, inRangeInclusive: true },
                        },
                    ],
                },
                'agMultiColumnFilter'
            );
            const model = { type: 'inRange', dateFrom: '2008-08-24', dateTo: '2020-07-23' };

            const columnFilterIds = await timedColumnFilter(
                { filterType: 'multi', filterModels: [{ filterType: 'date', ...model }] },
                columnDefs
            );

            expect(columnFilterIds).toEqual([0, 1, 2, 3]); // both end days included, times and all
            expect(
                await timedAdvancedFilter(
                    {
                        filterType: 'date',
                        colId: 'when',
                        type: 'inRange',
                        filter: '2008-08-24',
                        filterTo: '2020-07-23',
                    },
                    columnDefs
                )
            ).toEqual(columnFilterIds);
        });

        // The Multi Filter hands a child that child's own parameters, so a flag set only on the parent reaches
        // neither filter. Row 4 holds a null date and is what a leaked `includeBlanksInEquals` would admit.
        test("a Multi Filter column leaves its parent's `includeBlanksInEquals` to the parent, in both", async () => {
            const columnDefs = timedDefs(
                {
                    includeBlanksInEquals: true,
                    filters: [{ filter: 'agDateColumnFilter', filterParams: comparatorParams }],
                },
                'agMultiColumnFilter'
            );

            const columnFilterIds = await timedColumnFilter(
                { filterType: 'multi', filterModels: [{ filterType: 'date', type: 'equals', dateFrom: '2008-08-24' }] },
                columnDefs
            );

            expect(columnFilterIds).toEqual([0, 1]);
            expect(
                await timedAdvancedFilter(
                    { filterType: 'date', colId: 'when', type: 'equals', filter: '2008-08-24' },
                    columnDefs
                )
            ).toEqual(columnFilterIds);
        });

        // A `date` column converts by identity, so the grid's own `isValidDate` is the only thing between an
        // unreadable cell and `getTime()` being called on it.
        test('a `date` column holding a cell that is not a date compares rather than throwing, in both', async () => {
            const columnDefs = timedDefs({});
            const rowData = [
                { id: 0, when: new Date(2008, 7, 24) },
                { id: 1, when: 'not a date' },
            ];

            const columnFilterIds = await timedColumnFilter(
                { filterType: 'date', type: 'equals', dateFrom: '2008-08-24' },
                columnDefs,
                rowData
            );

            expect(columnFilterIds).toEqual([0]);
            expect(
                await timedAdvancedFilter(
                    { filterType: 'date', colId: 'when', type: 'equals', filter: '2008-08-24' },
                    columnDefs,
                    rowData
                )
            ).toEqual(columnFilterIds);
        });

        // The column filter maps its model inside the per-row comparison, so a comparator that normalises the
        // date it is handed gets a fresh one each time. One operand shared across rows accumulates the mutation.
        test('a comparator that mutates the date it is handed is given a fresh one per row, in both', async () => {
            const columnDefs = timedDefs({
                comparator: (filterDate: Date, cellValue: any) => {
                    filterDate.setDate(filterDate.getDate() + 1);
                    return midnightComparator(filterDate, cellValue);
                },
                filterOptions: ['equals'],
            });
            const rowData = [
                { id: 0, when: new Date(2010, 0, 1) },
                { id: 1, when: new Date(2010, 0, 2) },
                { id: 2, when: new Date(2010, 0, 3) },
            ];

            const columnFilterIds = await timedColumnFilter(
                { filterType: 'date', type: 'equals', dateFrom: '2010-01-01' },
                columnDefs,
                rowData
            );

            expect(columnFilterIds).toEqual([1]); // the day after the operand, for every row
            expect(
                await timedAdvancedFilter(
                    { filterType: 'date', colId: 'when', type: 'equals', filter: '2010-01-01' },
                    columnDefs,
                    rowData
                )
            ).toEqual(columnFilterIds);
        });

        // A Multi Filter child that sets nothing is given nothing: falling back to the parent would reach a
        // child that never asked for it. A number column shows it, having no grid-supplied child params to hide
        // the fallback. `agTextColumnFilter` is the no-matching-child case, which must resolve the same way.
        test.each([
            { child: 'agNumberColumnFilter', name: 'a bare matching child' },
            { child: 'agTextColumnFilter', name: 'no matching child' },
        ])('a Multi Filter number column takes no parameters from its parent ($name), in both', async ({ child }) => {
            const columnDefs = [
                { field: 'id' },
                {
                    field: 'age',
                    filter: 'agMultiColumnFilter',
                    filterParams: { includeBlanksInEquals: true, filters: [{ filter: child }] },
                },
            ];
            const rowData = [
                { id: 0, age: 1 },
                { id: 1, age: 2 },
                { id: 2, age: null },
            ];

            const columnFilterIds = await withColumnFilter(
                'age',
                { filterType: 'multi', filterModels: [{ filterType: 'number', type: 'equals', filter: 1 }] },
                columnDefs,
                rowData
            );

            expect(columnFilterIds).toEqual([0]); // the blank row is not admitted by the parent's flag
            expect(
                await withAdvancedFilter(
                    { filterType: 'number', colId: 'age', type: 'equals', filter: 1 },
                    columnDefs,
                    rowData
                )
            ).toEqual(columnFilterIds);
        });

        // The child that does the comparing owns the comparison's settings whatever it filters on, so a number
        // column reads them a level down exactly as a date one does.
        test("a Multi Filter number column reads its number child's `inRangeInclusive`, in both", async () => {
            const columnDefs = [
                { field: 'id' },
                {
                    field: 'age',
                    filter: 'agMultiColumnFilter',
                    filterParams: {
                        filters: [{ filter: 'agNumberColumnFilter', filterParams: { inRangeInclusive: true } }],
                    },
                },
            ];
            const rowData = [
                { id: 0, age: 1 },
                { id: 1, age: 2 },
                { id: 2, age: 3 },
                { id: 3, age: 4 },
            ];

            const columnFilterIds = await withColumnFilter(
                'age',
                {
                    filterType: 'multi',
                    filterModels: [{ filterType: 'number', type: 'inRange', filter: 1, filterTo: 3 }],
                },
                columnDefs,
                rowData
            );

            expect(columnFilterIds).toEqual([0, 1, 2]); // both ends included
            expect(
                await withAdvancedFilter(
                    { filterType: 'number', colId: 'age', type: 'inRange', filter: 1, filterTo: 3 },
                    columnDefs,
                    rowData
                )
            ).toEqual(columnFilterIds);
        });

        // A Custom Filter Option's predicate is author code too, and the column filter maps its operands inside
        // the per-row comparison, so one that normalises what it is handed must see a fresh value each row.
        test('a custom filter option predicate is given a fresh operand per row, in both', async () => {
            const columnDefs = timedDefs({
                filterOptions: [
                    {
                        displayKey: 'dayAfter',
                        displayName: 'Day After',
                        numberOfInputs: 1,
                        predicate: ([filterValue]: any[], cellValue: any) => {
                            filterValue.setDate(filterValue.getDate() + 1);
                            return midnightComparator(filterValue, cellValue) === 0;
                        },
                    },
                ],
            });

            const columnFilterIds = await timedColumnFilter(
                { filterType: 'date', type: 'dayAfter', dateFrom: '2008-08-23' },
                columnDefs
            );

            expect(columnFilterIds).toEqual([0, 1]); // the day after the operand, for every row
            expect(
                await timedAdvancedFilter(
                    {
                        filterType: 'date',
                        colId: 'when',
                        type: 'dayAfter',
                        filter: '2008-08-23',
                    } as ColumnAdvancedFilterModel,
                    columnDefs
                )
            ).toEqual(columnFilterIds);
        });

        // `isValidDate` is the column filter's gate whether or not a comparator sits beside it. The 1899 cell is
        // the one it refuses, so every option but the negation loses it.
        test.each([
            { type: 'lessThan', expected: [] as number[] },
            { type: 'equals', expected: [] as number[] },
            { type: 'notEqual', expected: [0, 1] },
        ])('`isValidDate` alone gates `$type`, in both', async ({ type, expected }) => {
            const columnDefs = timedDefs({
                isValidDate: (value: any) => value instanceof Date && value.getFullYear() >= 1900,
            });
            const rowData = [
                { id: 0, when: new Date(1899, 0, 1) },
                { id: 1, when: new Date(2012, 7, 5) },
            ];

            const columnFilterIds = await timedColumnFilter(
                { filterType: 'date', type, dateFrom: '2000-01-01' },
                columnDefs,
                rowData
            );

            expect(columnFilterIds).toEqual(expected);
            expect(
                await timedAdvancedFilter(
                    { filterType: 'date', colId: 'when', type, filter: '2000-01-01' } as ColumnAdvancedFilterModel,
                    columnDefs,
                    rowData
                )
            ).toEqual(columnFilterIds);
        });

        // The cell value reaches a comparator as the column holds it, which is the whole reason a column
        // whose data the data type cannot read supplies one.
        test('the comparator reads the cell value, not the value the data type converts it to', async () => {
            const seen: unknown[] = [];
            const defs = COLUMN_DEFS!.map((def) =>
                (def as { field?: string }).field === 'date'
                    ? {
                          ...def,
                          filterParams: {
                              comparator: (filterDate: Date, cellValue: any) => {
                                  seen.push(cellValue);
                                  return midnightComparator(filterDate, new Date(cellValue));
                              },
                          },
                      }
                    : def
            );

            const advancedIds = await withAdvancedFilter(
                { filterType: 'dateString', colId: 'date', type: 'equals', filter: '2008-08-24' },
                defs
            );

            expect(advancedIds).toEqual([0]);
            expect(seen.length).toBeGreaterThan(0);
            expect(seen.every((value) => typeof value === 'string')).toBe(true);
        });
    });
});

/**
 * `filter: true` names the Date Filter only where the Set Filter module is absent, so the reported repro's
 * own shape — a column that names no filter and takes `true` from `defaultColDef` — needs a grid without it.
 */
describe('Advanced Filter on a date column defaulted to `filter: true`', () => {
    const gridsManager = new TestGridsManager({
        modules: [DateFilterModule, AdvancedFilterModule, ClientSideRowModelModule],
    });

    beforeAll(() => {
        setupAgTestIds();
        installFilterLayoutMock();
    });
    afterAll(() => uninstallFilterLayoutMock());
    afterEach(() => gridsManager.reset());

    interface TimedRow {
        id: number;
        when: Date | null;
    }

    const TIMED_ROWS: TimedRow[] = [
        { id: 0, when: new Date(2008, 7, 24, 5, 33) },
        { id: 1, when: new Date(2008, 7, 24) },
        { id: 2, when: new Date(2012, 7, 5, 9, 30) },
    ];

    /** The ticket's own comparator: compare the day, ignore the time the cell carries. */
    const midnightComparator = (filterDate: Date, cellValue: any) => {
        const cellDate = new Date(cellValue);
        cellDate.setHours(0, 0, 0, 0);
        if (cellDate < filterDate) {
            return -1;
        }
        return cellDate > filterDate ? 1 : 0;
    };

    /** The repro's custom `date` entry: it overrides the built-in the column would otherwise resolve to. */
    const dataTypeDefinitions: GridOptions['dataTypeDefinitions'] = {
        date: {
            appendColumnTypes: true,
            baseDataType: 'date',
            extendsDataType: 'date',
            valueParser: ({ newValue }) => {
                const parts = newValue?.split('.') ?? [];
                return parts.length === 3 ? new Date(+parts[2], +parts[1] - 1, +parts[0]) : null;
            },
            valueFormatter: ({ value }) =>
                value == null ? '' : `${value.getDate()}.${value.getMonth() + 1}.${value.getFullYear()}`,
        },
    };

    const columnDefs: GridOptions<TimedRow>['columnDefs'] = [
        { field: 'id' },
        { field: 'when', cellDataType: 'date', filterParams: { comparator: midnightComparator } },
    ];

    async function createGrid(gridOptions: GridOptions<TimedRow>): Promise<GridApi<TimedRow>> {
        const api = gridsManager.createGrid('grid', {
            defaultColDef: { filter: true },
            columnDefs,
            rowData: TIMED_ROWS,
            ...gridOptions,
        });
        await asyncSetTimeout(0);
        return api;
    }

    async function displayedIds(api: GridApi<TimedRow>): Promise<number[]> {
        api.onFilterChanged();
        await asyncSetTimeout(0);
        return getDisplayedIds(api as GridApi<{ id: number }>);
    }

    // The reported case: rows 0 and 1 share a day and only row 1 sits at midnight, so a comparator that is
    // never consulted matches row 1 alone. A custom `date` entry overrides the built-in the column resolves
    // to, which is the shape the repro reaches `filterParams` through.
    test.each([
        ['a built-in data type', undefined],
        ['a data type from `dataTypeDefinitions`', dataTypeDefinitions],
    ])('`equals` matches every cell on the day with %s, in both', async (_name, definitions) => {
        const columnApi = await createGrid({ dataTypeDefinitions: definitions });
        await columnApi.setColumnFilterModel('when', { filterType: 'date', type: 'equals', dateFrom: '2008-08-24' });

        expect(await displayedIds(columnApi)).toEqual([0, 1]);

        gridsManager.reset();
        const advancedApi = await createGrid({ dataTypeDefinitions: definitions, enableAdvancedFilter: true });
        advancedApi.setAdvancedFilterModel({
            filterType: 'date',
            colId: 'when',
            type: 'equals',
            filter: '2008-08-24',
        });

        expect(await displayedIds(advancedApi)).toEqual([0, 1]);
    });

    // A written expression reaches the comparator through the column's own parser, which is the only path
    // a custom `date` data type takes part in: the operand is read in the format that data type writes.
    test.each([
        ['a built-in data type', undefined, '2008-08-24'],
        ['a data type from `dataTypeDefinitions`', dataTypeDefinitions, '24.08.2008'],
    ])('an expression written against %s compares through the comparator', async (_name, definitions, operand) => {
        const api = await createGrid({ dataTypeDefinitions: definitions, enableAdvancedFilter: true });
        await AdvancedFilterHarness.get(api).applyExpression(`[When] = ${operand}`);

        expect(await displayedIds(api)).toEqual([0, 1]);
    });
});
