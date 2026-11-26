import {
    ALL_SEVERITIES,
    AdvancedFilterHarness,
    ColumnFilterHarness,
    LEGACY_FILTER_WARNING_IDS,
    TestGridsManager,
    asyncSetTimeout,
    installFilterLayoutMock,
    uninstallFilterLayoutMock,
} from 'ag-test-utils';

import type { ColDef, FilterInputCallbackParams, GridOptions, TextMatcherParams } from 'ag-grid-community';
import { enableDevValidations, setupAgTestIds } from 'ag-grid-community';

import { MinimalFilter, PARITY_MODULES, getDisplayedIds } from './advanced-filter-parity-test-utils';

// Split from advanced-filter-column-filter-parity.test.ts to keep each file inside the suite's time budget.
describe('Advanced Filter matches the column filter', () => {
    const gridsManager = new TestGridsManager({ modules: PARITY_MODULES });

    beforeAll(() => {
        setupAgTestIds();
        installFilterLayoutMock();
    });
    afterAll(() => uninstallFilterLayoutMock());
    afterEach(() => gridsManager.reset());

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

        test('params given as a function are read as the column filter reads them, on the column, a Multi Filter child or a Multi Filter', async () => {
            const params = () => ({ textMatcher: wholeWord });
            expect(await withColumnModel(params, contains('car'))).toEqual([0]);
            expect(await withExpression(params, '[Name] contains "car"')).toEqual([0]);

            const childDefs = multiDefs('child', params);
            expect(await withColumnModel({}, multiContains('car'), childDefs)).toEqual([0]);
            expect(await withExpression({}, '[Name] contains "car"', childDefs)).toEqual([0]);

            const multiDefsFunc: GridOptions['columnDefs'] = [
                { field: 'id' },
                {
                    field: 'name',
                    filter: 'agMultiColumnFilter',
                    filterParams: () => ({
                        filters: [
                            { filter: 'agTextColumnFilter', filterParams: params },
                            { filter: 'agSetColumnFilter' },
                        ],
                    }),
                },
            ];
            expect(await withColumnModel({}, multiContains('car'), multiDefsFunc)).toEqual([0]);
            expect(await withExpression({}, '[Name] contains "car"', multiDefsFunc)).toEqual([0]);
        });

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

        test("a Selectable Filter column's params are its filter's", async () => {
            const selectableDefs = (filters: object[]): GridOptions['columnDefs'] => [
                { field: 'id' },
                { field: 'name', filter: 'agSelectableColumnFilter', filterParams: { filters } },
            ];
            const textWithTrim = { filter: 'agTextColumnFilter', filterParams: { trimInput: true } };
            expect(await withExpression({}, '[Name] begins with " car "', selectableDefs([textWithTrim]))).toEqual([1]);
            // A Multi Filter chosen there reads its Text Filter child's, as it does as the column's own filter.
            const multi = { filter: 'agMultiColumnFilter', filterParams: { filters: [textWithTrim] } };
            expect(await withExpression({}, '[Name] begins with " car "', selectableDefs([multi]))).toEqual([1]);
        });

        test('a Selectable Filter column follows a choice restored through the grid state', async () => {
            const api = await gridsManager.createGridAndWait('advancedFilterGrid', {
                columnDefs: [
                    { field: 'id' },
                    {
                        field: 'name',
                        filter: 'agSelectableColumnFilter',
                        filterParams: {
                            filters: [
                                { filter: 'agTextColumnFilter', filterParams: { caseSensitive: true } },
                                { filter: 'agTextColumnFilter' },
                            ],
                        },
                    },
                ],
                rowData: [
                    { id: 0, name: 'Carpet' },
                    { id: 1, name: 'carpet' },
                ],
                enableAdvancedFilter: true,
            });
            const model = { filterType: 'text', colId: 'name', type: 'contains', filter: 'car' } as const;
            api.setAdvancedFilterModel(model);
            await asyncSetTimeout(0);
            expect(getDisplayedIds(api)).toEqual([1]);

            api.setState({ filter: { selectableFilters: { name: 1 }, advancedFilterModel: model } });
            await asyncSetTimeout(0);
            expect(getDisplayedIds(api)).toEqual([0, 1]);

            // the applied expression follows a restore that names only the choice
            api.setState({ filter: { selectableFilters: { name: 0 } } });
            await asyncSetTimeout(0);
            expect(getDisplayedIds(api)).toEqual([1]);

            // and a restore naming the same choice does not filter again
            const sources: string[] = [];
            api.addEventListener('filterChanged', ({ source }) => sources.push(source ?? ''));
            api.setState({ filter: { selectableFilters: { name: 0 } } });
            await asyncSetTimeout(0);
            expect(sources).toEqual([]);
        });

        test('a restore naming the choice already active by default does not filter again', async () => {
            const api = await gridsManager.createGridAndWait('advancedFilterGrid', {
                columnDefs: [
                    {
                        field: 'name',
                        filter: 'agSelectableColumnFilter',
                        filterParams: {
                            filters: [{ filter: 'agTextColumnFilter' }, { filter: 'agNumberColumnFilter' }],
                        },
                    },
                ],
                rowData: [{ name: 'carpet' }],
                enableAdvancedFilter: true,
            });
            api.setAdvancedFilterModel({ filterType: 'text', colId: 'name', type: 'contains', filter: 'car' });
            await asyncSetTimeout(0);
            const sources: string[] = [];
            api.addEventListener('filterChanged', ({ source }) => sources.push(source ?? ''));

            api.setState({ filter: { selectableFilters: { name: 0 } } });
            await asyncSetTimeout(0);
            expect(sources).toEqual([]);

            // while one naming the other choice does
            api.setState({ filter: { selectableFilters: { name: 1 } } });
            await asyncSetTimeout(0);
            expect(sources).not.toEqual([]);
        });

        test('a choice made while other text is typed keeps the applied expression and the typed text', async () => {
            const api = await gridsManager.createGridAndWait('advancedFilterGrid', {
                columnDefs: [
                    { field: 'id' },
                    {
                        field: 'name',
                        filter: 'agSelectableColumnFilter',
                        filterParams: {
                            filters: [
                                { filter: 'agTextColumnFilter', filterParams: { caseSensitive: true } },
                                { filter: 'agTextColumnFilter' },
                            ],
                        },
                    },
                ],
                rowData: [
                    { id: 0, name: 'Carpet' },
                    { id: 1, name: 'carpet' },
                ],
                enableAdvancedFilter: true,
            });
            const model = { filterType: 'text', colId: 'name', type: 'contains', filter: 'car' } as const;
            api.setAdvancedFilterModel(model);
            await asyncSetTimeout(0);
            const advanced = AdvancedFilterHarness.get(api);
            for (const typed of ['[Name] contains "zzz"', '[Name] contains']) {
                await advanced.type(typed);

                api.setState({ filter: { selectableFilters: { name: 1 } } });
                await asyncSetTimeout(0);
                expect({ typed, model: api.getAdvancedFilterModel(), ids: getDisplayedIds(api) }).toEqual({
                    typed,
                    model,
                    ids: [0, 1],
                });
                expect(advanced.value).toBe(typed);

                api.setState({ filter: { selectableFilters: { name: 0 } } });
                await asyncSetTimeout(0);
                expect(getDisplayedIds(api)).toEqual([1]);

                // as does any other change to the columns
                api.setColumnsVisible(['id'], false);
                await asyncSetTimeout(0);
                expect({ typed, model: api.getAdvancedFilterModel() }).toEqual({ typed, model });
                api.setColumnsVisible(['id'], true);
            }
        });

        test('a choice made while an applied set value names nothing in the data filters by the new choice', async () => {
            const api = await gridsManager.createGridAndWait('advancedFilterGrid', {
                columnDefs: [
                    { field: 'id' },
                    {
                        field: 'name',
                        filter: 'agSelectableColumnFilter',
                        filterParams: {
                            filters: [
                                { filter: 'agTextColumnFilter', filterParams: { caseSensitive: true } },
                                { filter: 'agTextColumnFilter' },
                            ],
                        },
                    },
                    { field: 'country', filter: 'agSetColumnFilter' },
                ],
                rowData: [
                    { id: 0, name: 'Carpet', country: 'Spain' },
                    { id: 1, name: 'carpet', country: 'Spain' },
                ],
                enableAdvancedFilter: true,
            });
            api.setAdvancedFilterModel({
                filterType: 'join',
                type: 'AND',
                conditions: [
                    { filterType: 'text', colId: 'name', type: 'contains', filter: 'car' },
                    { filterType: 'set', colId: 'country', type: 'isAnyOf', values: ['Spain', 'Nowhere'] },
                ],
            });
            await asyncSetTimeout(0);
            expect(getDisplayedIds(api)).toEqual([1]);

            api.setState({ filter: { selectableFilters: { name: 1 } } });
            await asyncSetTimeout(0);
            expect(getDisplayedIds(api)).toEqual([0, 1]);
            // the value the data cannot spell is still applied as it was
            expect(api.getAdvancedFilterModel()).toEqual({
                filterType: 'join',
                type: 'AND',
                conditions: [
                    { filterType: 'text', colId: 'name', type: 'contains', filter: 'car' },
                    { filterType: 'set', colId: 'country', type: 'isAnyOf', values: ['Spain', 'Nowhere'] },
                ],
            });
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
        // `textFormatter` may return null: the default comparison survives one on either side, never throwing.
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

        // A component named through `components` owns its `filterParams` exactly as one supplied directly does.
        test('a custom filter component registered by name keeps its own `filterParams`', async () => {
            enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: LEGACY_FILTER_WARNING_IDS });
            const api = await gridsManager.createGridAndWait('advancedFilterGrid', {
                columnDefs: [
                    { field: 'id' },
                    { field: 'name', filter: 'myFilter', filterParams: { textFormatter: () => 'carpet' } },
                ],
                components: { myFilter: MinimalFilter },
                rowData: TEXT_ROWS,
                enableAdvancedFilter: true,
            });
            await AdvancedFilterHarness.get(api).applyExpression('[Name] contains "carpet"');
            await asyncSetTimeout(0);
            const ids = getDisplayedIds(api);
            api.destroy();

            // Read as a Text Filter's, the formatter would make every row read 'carpet' and so match them all.
            expect(ids).toEqual([1]);
        });

        // 'Café' and 'cafe' differ only in case, so the flag alone decides whether they are one match or two.
        test('`caseSensitive` decides the comparison the same way in both', async () => {
            expect(await withColumnModel({}, contains('Caf'))).toEqual([3, 4]);
            expect(await withExpression({}, '[Name] contains "Caf"')).toEqual([3, 4]);

            const params = { caseSensitive: true };
            expect(await withColumnModel(params, contains('Caf'))).toEqual([3]);
            expect(await withExpression(params, '[Name] contains "Caf"')).toEqual([3]);
        });

        // Unlike `textFormatter`, a Set Filter's `caseSensitive` folds the keys it matches rows by, so the
        // Advanced Filter reading it on such a column is what keeps the two in step.
        test('a Set Filter column reads `caseSensitive`, which its own matching folds by', async () => {
            const setDefs = (filterParams: object): GridOptions['columnDefs'] => [
                { field: 'id' },
                { field: 'name', filter: 'agSetColumnFilter', filterParams },
            ];

            expect(await withExpression({}, '[Name] contains "Caf"', setDefs({}))).toEqual([3, 4]);

            const params = { caseSensitive: true };
            expect(await withExpression(params, '[Name] contains "Caf"', setDefs(params))).toEqual([3]);
        });
    });
});
