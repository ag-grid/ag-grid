import { waitFor } from '@testing-library/dom';
import {
    ALL_SEVERITIES,
    ColumnFilterHarness,
    FilterDom,
    GridRows,
    TestGridsManager,
    asyncSetTimeout,
    installFilterLayoutMock,
    messagesFrom,
    uninstallFilterLayoutMock,
} from 'ag-test-utils';

import type { GridApi, GridOptions, IFilterOptionDef } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    CustomFilterModule,
    DateFilterModule,
    LocaleModule,
    NumberFilterModule,
    TextFilterModule,
    enableDevValidations,
    setupAgTestIds,
} from 'ag-grid-community';
import {
    ColumnMenuModule,
    MultiFilterModule,
    NewFiltersToolPanelModule,
    SetFilterModule,
    SideBarModule,
} from 'ag-grid-enterprise';

/**
 * Every filter warning decidable from the column definition must be raised as the grid renders, without the
 * filter UI ever being opened, and must name the column it came from.
 */
interface Row {
    athlete: string;
    age: number;
    date: string;
}

const ROW_DATA: Row[] = [
    { athlete: 'Ada', age: 25, date: '2024-01-01' },
    { athlete: 'Bob', age: 40, date: '2024-06-01' },
];

/** The ids `enableDevValidations` accepts, so a case can name every warning it legitimately raises. */
type SuppressedWarnings = NonNullable<NonNullable<Parameters<typeof enableDevValidations>[0]>['suppress']>;

/** No `predicate`, so the grid cannot evaluate it. */
const NO_PREDICATE = { displayKey: 'noPredicate', displayName: 'No Predicate' } as IFilterOptionDef;

describe('Filter warnings are raised at configuration and name the column', () => {
    const gridsManager = new TestGridsManager({
        modules: [
            TextFilterModule,
            NumberFilterModule,
            DateFilterModule,
            SetFilterModule,
            MultiFilterModule,
            CustomFilterModule,
            LocaleModule,
            ClientSideRowModelModule,
        ],
    });

    beforeAll(() => setupAgTestIds());
    afterEach(() => {
        gridsManager.reset();
        vi.restoreAllMocks();
        enableDevValidations({ throwOn: ALL_SEVERITIES });
    });

    /**
     * Creates the grid and returns everything written to `console.warn` while it rendered, as one string.
     * Every id the configuration legitimately produces is suppressed, or the throwing validations end the
     * test before the assertion is reached.
     */
    async function warningsFromRendering(ids: SuppressedWarnings, options: GridOptions<Row>): Promise<string> {
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: ids });
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        await gridsManager.createGridAndWait('grid1', {
            rowData: ROW_DATA,
            ...options,
        });
        return messagesFrom(warn);
    }

    test('71 - `debounceMs` is ignored when an apply button is present', async () => {
        const warnings = await warningsFromRendering([71], {
            columnDefs: [
                {
                    field: 'athlete',
                    filter: 'agTextColumnFilter',
                    filterParams: { buttons: ['apply'], debounceMs: 500 },
                },
            ],
        });
        expect(warnings).toContain('warning #71');
        expect(warnings).toContain('athlete');
    });

    test('72 - a `FilterOptionDef` missing required properties names the column and the entry', async () => {
        const warnings = await warningsFromRendering([72], {
            columnDefs: [
                {
                    field: 'athlete',
                    filter: 'agTextColumnFilter',
                    filterParams: { filterOptions: ['contains', NO_PREDICATE] },
                },
            ],
        });
        expect(warnings).toContain('warning #72');
        expect(warnings).toContain('athlete');
        expect(warnings).toContain('noPredicate');
        expect(warnings).toContain('predicate');
    });

    test('74 - a `filterOptions` list that keeps nothing names the column', async () => {
        const warnings = await warningsFromRendering([72, 74], {
            columnDefs: [
                {
                    field: 'athlete',
                    filter: 'agTextColumnFilter',
                    filterParams: { filterOptions: [NO_PREDICATE] },
                },
            ],
        });
        expect(warnings).toContain('warning #74');
        expect(warnings).toContain('athlete');
    });

    test('75 - an unknown button type names the column and the type', async () => {
        const warnings = await warningsFromRendering([75], {
            columnDefs: [
                {
                    field: 'athlete',
                    filter: 'agTextColumnFilter',
                    filterParams: { buttons: ['bogus'] },
                },
            ],
        });
        expect(warnings).toContain('warning #75');
        expect(warnings).toContain('athlete');
        expect(warnings).toContain('bogus');
    });

    test('249 - a Set Filter Key Creator with no Value Formatter reports without the filter being opened', async () => {
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [249] });
        const error = vi.spyOn(console, 'error').mockImplementation(() => {});

        await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'athlete',
                    filter: 'agSetColumnFilter',
                    keyCreator: ({ value }: { value: any }) => String(value),
                },
            ],
            rowData: ROW_DATA,
        } as GridOptions<Row>);

        // The Key Creator builds the keys and the Value Formatter renders them, so one without the other
        // leaves nothing readable to show. Both come from the definition, so neither needs a filter to exist.
        const errors = messagesFrom(error);
        expect(errors).toContain('error #249');
        expect(errors).toContain('athlete');
    });

    test('71 - a function `filterParams` is judged on what it returns', async () => {
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [71] });
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

        const api = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'athlete',
                    filter: 'agTextColumnFilter',
                    filterParams: () => ({ buttons: ['apply'], debounceMs: 500 }),
                },
            ],
            rowData: ROW_DATA,
        } as GridOptions<Row>);
        await api.getColumnFilterInstance('athlete');

        const warnings = messagesFrom(warn);
        expect(warnings).toContain('warning #71');
        expect(warnings).toContain('athlete');
    });

    test('249 - a function `filterParams` does not lose the report', async () => {
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [249] });
        const error = vi.spyOn(console, 'error').mockImplementation(() => {});

        // A function defers the resolution, and a deferred definition must still be judged: the Key Creator
        // is on the colDef, so the mistake is the same one the object-params case reports.
        const api = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'athlete',
                    filter: 'agSetColumnFilter',
                    keyCreator: ({ value }: { value: any }) => String(value),
                    filterParams: () => ({}),
                },
            ],
            rowData: ROW_DATA,
        } as GridOptions<Row>);
        // Builds the filter, so the assertion fails only where nothing reports it at all.
        await api.getColumnFilterInstance('athlete');

        const errors = messagesFrom(error);
        expect(errors).toContain('error #249');
        expect(errors).toContain('athlete');
    });

    test('120 - a Multi Filter floating filter over a plain filter stops at the error', async () => {
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [120] });
        const error = vi.spyOn(console, 'error').mockImplementation(() => {});

        const api = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'athlete',
                    filter: 'agTextColumnFilter',
                    floatingFilter: true,
                    floatingFilterComponent: 'agMultiColumnFloatingFilter',
                },
            ],
            rowData: ROW_DATA,
        } as GridOptions<Row>);

        // Everything behind this reaches for a member only a Multi Filter has, so the named error has to end
        // the call: proceeding replaced it with `getChildFilterInstance is not a function` further down.
        api.setFilterModel({ athlete: { filterType: 'text', type: 'contains', filter: 'Ada' } });

        await waitFor(() => expect(messagesFrom(error)).toContain('error #120'));
        expect(messagesFrom(error)).toContain('athlete');
    });

    test('79 - `maxNumConditions` below one names the column', async () => {
        const warnings = await warningsFromRendering([79], {
            columnDefs: [{ field: 'athlete', filter: 'agTextColumnFilter', filterParams: { maxNumConditions: 0 } }],
        });
        expect(warnings).toContain('warning #79');
        expect(warnings).toContain('athlete');
    });

    test('80 - `numAlwaysVisibleConditions` below one names the column', async () => {
        const warnings = await warningsFromRendering([80], {
            columnDefs: [
                {
                    field: 'athlete',
                    filter: 'agTextColumnFilter',
                    filterParams: { numAlwaysVisibleConditions: 0 },
                },
            ],
        });
        expect(warnings).toContain('warning #80');
        expect(warnings).toContain('athlete');
    });

    test('81 - `numAlwaysVisibleConditions` above `maxNumConditions` names the column', async () => {
        const warnings = await warningsFromRendering([81], {
            columnDefs: [
                {
                    field: 'athlete',
                    filter: 'agTextColumnFilter',
                    filterParams: { maxNumConditions: 2, numAlwaysVisibleConditions: 3 },
                },
            ],
        });
        expect(warnings).toContain('warning #81');
        expect(warnings).toContain('athlete');
    });

    test('82 - a non-numeric `DateFilter` year names the column', async () => {
        const warnings = await warningsFromRendering([82], {
            columnDefs: [
                {
                    field: 'date',
                    filter: 'agDateColumnFilter',
                    filterParams: { minValidYear: 'not a year' },
                },
            ],
        });
        expect(warnings).toContain('warning #82');
        expect(warnings).toContain('date');
    });

    // Inverted years invert the effective bounds too, so 87 comes with it - as it does today.
    test('83 - `minValidYear` above `maxValidYear` names the column', async () => {
        const warnings = await warningsFromRendering([83, 87], {
            columnDefs: [
                {
                    field: 'date',
                    filter: 'agDateColumnFilter',
                    filterParams: { minValidYear: 2020, maxValidYear: 2010 },
                },
            ],
        });
        expect(warnings).toContain('warning #83');
        expect(warnings).toContain('date');
    });

    test('84 - `minValidDate` above `maxValidDate` names the column', async () => {
        const warnings = await warningsFromRendering([84, 87], {
            columnDefs: [
                {
                    field: 'date',
                    filter: 'agDateColumnFilter',
                    filterParams: { minValidDate: '2024-06-01', maxValidDate: '2024-01-01' },
                },
            ],
        });
        expect(warnings).toContain('warning #84');
        expect(warnings).toContain('date');
    });

    test('85 - `minValidYear` alongside `minValidDate` names the column', async () => {
        const warnings = await warningsFromRendering([85], {
            columnDefs: [
                {
                    field: 'date',
                    filter: 'agDateColumnFilter',
                    filterParams: { minValidDate: '2024-01-01', minValidYear: 2000 },
                },
            ],
        });
        expect(warnings).toContain('warning #85');
        expect(warnings).toContain('date');
    });

    test('86 - `maxValidYear` alongside `maxValidDate` names the column', async () => {
        const warnings = await warningsFromRendering([86], {
            columnDefs: [
                {
                    field: 'date',
                    filter: 'agDateColumnFilter',
                    filterParams: { maxValidDate: '2024-01-01', maxValidYear: 2030 },
                },
            ],
        });
        expect(warnings).toContain('warning #86');
        expect(warnings).toContain('date');
    });

    // The case only 87 catches: one end comes from a year and the other from a date, so neither the
    // year comparison of 83 nor the date comparison of 84 sees anything wrong.
    test('87 - a year on one end above a date on the other names the column', async () => {
        const warnings = await warningsFromRendering([87], {
            columnDefs: [
                {
                    field: 'date',
                    filter: 'agDateColumnFilter',
                    filterParams: { minValidYear: 2020, maxValidDate: '2010-01-01' },
                },
            ],
        });
        expect(warnings).toContain('warning #87');
        expect(warnings).toContain('date');
        expect(warnings).not.toContain('warning #83');
        expect(warnings).not.toContain('warning #84');
    });

    test('326 - a `defaultOption` outside `filterOptions` names the column and the option', async () => {
        const warnings = await warningsFromRendering([326], {
            columnDefs: [
                {
                    field: 'athlete',
                    filter: 'agTextColumnFilter',
                    filterParams: { filterOptions: ['contains'], defaultOption: 'endsWith' },
                },
            ],
        });
        expect(warnings).toContain('warning #326');
        expect(warnings).toContain('athlete');
        expect(warnings).toContain('endsWith');
    });

    test('327 - an `allowedCharPattern` that does not compile names the column', async () => {
        const warnings = await warningsFromRendering([327], {
            columnDefs: [
                {
                    field: 'athlete',
                    filter: 'agTextColumnFilter',
                    filterParams: { allowedCharPattern: '\\' },
                },
            ],
        });
        expect(warnings).toContain('warning #327');
        expect(warnings).toContain('athlete');
    });

    test('207 - Set Filter `defaultToNothingSelected` under `excelMode` names the column', async () => {
        const warnings = await warningsFromRendering([207], {
            columnDefs: [
                {
                    field: 'athlete',
                    filter: 'agSetColumnFilter',
                    filterParams: { excelMode: 'windows', defaultToNothingSelected: true },
                },
            ],
        });
        expect(warnings).toContain('warning #207');
        expect(warnings).toContain('athlete');
    });

    // Regressions found while moving these reports to configuration. Each is a way a column can reach the
    // pass in a state the pass got wrong, so each is pinned rather than left to the change that caused it.
    describe('a column reaches the report in every state it can be in', () => {
        // The list keeps nothing, so the built-ins stand in - and `equals` is one of them.
        test('a `defaultOption` the built-in fallback offers is not reported as unavailable', async () => {
            const warnings = await warningsFromRendering([72, 74], {
                columnDefs: [
                    {
                        field: 'athlete',
                        filter: 'agTextColumnFilter',
                        filterParams: { filterOptions: [NO_PREDICATE], defaultOption: 'equals' },
                    },
                ],
            });
            expect(warnings).toContain('warning #74');
            expect(warnings).not.toContain('warning #326');
        });

        // Re-setting `columnDefs` reuses the column, so the grid column list never changes.
        test('a definition replaced on a reused column is judged again', async () => {
            enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [72] });
            const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
            const api: GridApi<Row> = await gridsManager.createGridAndWait('grid1', {
                columnDefs: [
                    { field: 'athlete', filter: 'agTextColumnFilter', filterParams: { filterOptions: ['contains'] } },
                ],
                rowData: ROW_DATA,
            } as GridOptions<Row>);
            expect(warn).not.toHaveBeenCalled();

            api.setGridOption('columnDefs', [
                {
                    field: 'athlete',
                    filter: 'agTextColumnFilter',
                    filterParams: { filterOptions: ['contains', NO_PREDICATE] },
                },
            ]);
            await waitFor(() => expect(messagesFrom(warn)).toContain('warning #72'));
            expect(messagesFrom(warn)).toContain('athlete');
        });

        // A column added after the grid exists has no configs, which a grid-wide version would not notice.
        test('a column added after the grid was built is judged too', async () => {
            enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [72, 74] });
            const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
            const api: GridApi<Row> = await gridsManager.createGridAndWait('grid1', {
                columnDefs: [{ field: 'athlete' }],
                rowData: ROW_DATA,
            } as GridOptions<Row>);

            api.setGridOption('columnDefs', [
                { field: 'athlete' },
                { field: 'age', filter: 'agNumberColumnFilter', filterParams: { filterOptions: [NO_PREDICATE] } },
            ]);
            await waitFor(() => expect(messagesFrom(warn)).toContain('warning #72'));
            expect(messagesFrom(warn)).toContain('age');
        });

        // A grid option can put the mistake there without any `columnDefs` call: the merged definition is
        // what a column is judged on, so replacing `defaultColDef` has to discard what was judged before.
        test('a mistake arriving through `defaultColDef` is judged', async () => {
            enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [72] });
            const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
            const api: GridApi<Row> = await gridsManager.createGridAndWait('grid1', {
                columnDefs: [{ field: 'athlete', filter: 'agTextColumnFilter' }],
                rowData: ROW_DATA,
            } as GridOptions<Row>);
            expect(warn).not.toHaveBeenCalled();

            api.setGridOption('defaultColDef', { filterParams: { filterOptions: ['contains', NO_PREDICATE] } });
            await waitFor(() => expect(messagesFrom(warn)).toContain('warning #72'));
            expect(messagesFrom(warn)).toContain('athlete');
        });

        // The wrapper renders the button bar for whatever filter it wraps, so `buttons` are the grid's
        // params even on a component it knows nothing else about - and an unusable one is still unusable.
        test('a custom filter component still has its `buttons` judged', async () => {
            const warnings = await warningsFromRendering([75], {
                columnDefs: [
                    {
                        field: 'athlete',
                        filter: class {
                            public init() {}
                            public getGui() {
                                return document.createElement('div');
                            }
                            public isFilterActive() {
                                return false;
                            }
                            public doesFilterPass() {
                                return true;
                            }
                            public getModel() {
                                return null;
                            }
                            public setModel() {}
                        } as any,
                        filterParams: { buttons: ['bogus'] },
                    },
                ],
            });
            expect(warnings).toContain('warning #75');
            expect(warnings).toContain('bogus');
            expect(warnings).toContain('athlete');
        });

        // ...but `debounceMs` is read only by the filters the grid implements, so a custom component
        // naming one alongside an apply button is not ignoring anything the grid would have honoured.
        test('a custom filter component is not told its `debounceMs` was ignored', async () => {
            const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
            enableDevValidations({ throwOn: ALL_SEVERITIES });

            await gridsManager.createGridAndWait('grid1', {
                columnDefs: [
                    {
                        field: 'athlete',
                        filter: class {
                            public init() {}
                            public getGui() {
                                return document.createElement('div');
                            }
                            public isFilterActive() {
                                return false;
                            }
                            public doesFilterPass() {
                                return true;
                            }
                            public getModel() {
                                return null;
                            }
                            public setModel() {}
                        } as any,
                        filterParams: { buttons: ['apply'], debounceMs: 500 },
                    },
                ],
                rowData: ROW_DATA,
            } as GridOptions<Row>);

            expect(warn).not.toHaveBeenCalled();
        });

        // `{ component }` is the shape a definition takes once it can carry a handler, and it names the
        // same filter - so a column written that way must be judged, not read as a custom component.
        test('a filter named through `{ component }` is judged like the bare name', async () => {
            const warnings = await warningsFromRendering([72], {
                columnDefs: [
                    {
                        field: 'athlete',
                        filter: { component: 'agTextColumnFilter' },
                        filterParams: { filterOptions: ['contains', 'greaterThan'] },
                    },
                ],
            });
            expect(warnings).toContain('warning #72');
            expect(warnings).toContain('athlete');
            expect(warnings).toContain('greaterThan');
        });

        // A Multi Filter naming no `filters` still has two - a text and a set filter - and the text one
        // is handed the Multi's own params, so a malformed entry in them reaches a filter that reads it.
        test('a Multi Filter naming no children still judges the params its children inherit', async () => {
            const warnings = await warningsFromRendering([72], {
                columnDefs: [
                    {
                        field: 'athlete',
                        filter: 'agMultiColumnFilter',
                        filterParams: { filterOptions: ['contains', NO_PREDICATE] },
                    },
                ],
            });
            expect(warnings).toContain('warning #72');
            expect(warnings).toContain('noPredicate');
            expect(warnings).toContain('athlete');
        });

        // Those two children are otherwise materialised onto the colDef by cell data type inference, which
        // a column opting out of it never runs - and the inherited params still have to report.
        test('a Multi Filter naming no children judges them without a cell data type', async () => {
            const warnings = await warningsFromRendering([72], {
                columnDefs: [
                    {
                        field: 'athlete',
                        filter: 'agMultiColumnFilter',
                        cellDataType: false,
                        filterParams: { filterOptions: ['contains', NO_PREDICATE] },
                    },
                ],
            });
            expect(warnings).toContain('warning #72');
            expect(warnings).toContain('noPredicate');
            expect(warnings).toContain('athlete');
        });

        // Each child carries its own definition and params, so each is judged separately.
        test('a Multi Filter child is judged on its own `filterParams`', async () => {
            const warnings = await warningsFromRendering([72, 292], {
                columnDefs: [
                    {
                        field: 'athlete',
                        filter: 'agMultiColumnFilter',
                        filterParams: {
                            filters: [
                                { filter: 'agTextColumnFilter', filterParams: { filterOptions: ['contains'] } },
                                {
                                    filter: 'agNumberColumnFilter',
                                    // `contains` belongs to the text filter, so the number child cannot evaluate it.
                                    filterParams: { filterOptions: ['equals', 'contains'], buttons: ['apply'] },
                                },
                            ],
                        },
                    },
                ],
            });
            expect(warnings).toContain('warning #72');
            expect(warnings).toContain('contains');
            expect(warnings).toContain('athlete');
            // Only the handlers implementation renders one button bar for the whole filter. Without it the
            // child keeps its own buttons, so 292 saying they are ignored would describe something else.
            expect(warnings).not.toContain('warning #292');
        });

        test('292 - a child naming `buttons` is reported where the parent renders the only button bar', async () => {
            const warnings = await warningsFromRendering([292], {
                enableFilterHandlers: true,
                columnDefs: [
                    {
                        field: 'athlete',
                        filter: 'agMultiColumnFilter',
                        filterParams: {
                            filters: [{ filter: 'agTextColumnFilter', filterParams: { buttons: ['apply'] } }],
                        },
                    },
                ],
            });
            expect(warnings).toContain('warning #292');
            expect(warnings).toContain('athlete');
        });

        // `excelMode` supplies `buttons: ['apply', 'cancel']` through the module's `processParams`, long
        // after the colDef was written - so the column is judged on what its filter will be handed, not
        // on what was written, or the apply button that makes the debounce meaningless is invisible here.
        test('a debounce ignored only because `excelMode` adds the apply button is still reported', async () => {
            const warnings = await warningsFromRendering([71, 207], {
                columnDefs: [
                    {
                        field: 'athlete',
                        filter: 'agSetColumnFilter',
                        // No `buttons` of its own: `excelMode` is the only reason an apply button exists.
                        filterParams: { excelMode: 'windows', debounceMs: 500, defaultToNothingSelected: true },
                    },
                ],
            });
            expect(warnings).toContain('warning #71');
            expect(warnings).toContain('athlete');
            // And 207 is still judged on what was written, which processing has by now corrected.
            expect(warnings).toContain('warning #207');
        });

        // `buttons` and `debounceMs` belong to every provided filter, not only the simple ones.
        test('a Set Filter column reports the parameters every provided filter shares', async () => {
            const warnings = await warningsFromRendering([71, 75], {
                columnDefs: [
                    {
                        field: 'athlete',
                        filter: 'agSetColumnFilter',
                        filterParams: { buttons: ['bogus', 'apply'], debounceMs: 500 },
                    },
                ],
            });
            expect(warnings).toContain('warning #75');
            expect(warnings).toContain('bogus');
            expect(warnings).toContain('warning #71');
            expect(warnings).toContain('athlete');
        });
    });
});

/**
 * What the dropdown does with a key the filter cannot evaluate. Each of these pinned the old behaviour -
 * the key offered, selectable, and reported only once a row was tested against it under `#76`.
 */
describe('An option the filter cannot evaluate is kept out of the dropdown', () => {
    const gridsManager = new TestGridsManager({
        modules: [
            TextFilterModule,
            NumberFilterModule,
            DateFilterModule,
            LocaleModule,
            ColumnMenuModule,
            ClientSideRowModelModule,
        ],
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

    /** Opens the filter and returns everything `console.warn` saw while the grid was built. */
    async function openWith(
        options: GridOptions,
        colId: string = 'athlete'
    ): Promise<{ filter: ColumnFilterHarness; api: GridApi; warnings: string }> {
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [72] });
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const api: GridApi = await gridsManager.createGridAndWait('grid1', options);
        const filter = await ColumnFilterHarness.open(api, colId);
        return { filter, api, warnings: messagesFrom(warn) };
    }

    const textGrid = (filterOptions: (string | IFilterOptionDef)[]): GridOptions =>
        ({
            columnDefs: [
                {
                    field: 'athlete',
                    filter: 'agTextColumnFilter',
                    filterParams: { filterOptions, debounceMs: 0, maxNumConditions: 1 },
                },
            ],
            rowData: [{ athlete: 'Bolt' }, { athlete: 'Ng' }],
        }) as GridOptions;

    test('an unknown `buttons` action is reported and then not rendered', async () => {
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [75] });
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'athlete',
                    filter: 'agTextColumnFilter',
                    filterParams: { buttons: ['apply', 'bogus', 'reset'], maxNumConditions: 1 },
                },
            ],
            rowData: [{ athlete: 'Bolt' }],
        } as GridOptions);
        await ColumnFilterHarness.open(api, 'athlete');

        expect(messagesFrom(warn)).toContain('warning #75');
        // Nothing can dispatch it, so a button saying it is ignored and then appearing is the warning lying.
        await new FilterDom(api, 'unknown button not rendered', { colId: 'athlete' }).checkFilterDom(`
            COLUMN FILTER
            operator: "Contains"
            input: "" ⟨Filter...⟩
            buttons: Apply | Reset
            model: null
        `);
    });

    // Previously offered under its own name, then reported by `#76` once a row was tested against it.
    test('a key no filter defines is dropped from the dropdown', async () => {
        const { filter, warnings } = await openWith(textGrid(['equals', 'notEqual', 'wrong']));

        expect(await filter.operatorOptions()).toEqual(['Equals', 'Does not equal']);
        expect(warnings).toContain('warning #72');
        expect(warnings).toContain('wrong');
    });

    // One surviving option leaves the dropdown disabled rather than populated, so the DOM is the assertion.
    test('an option belonging to another filter type is dropped from the dropdown', async () => {
        const { api, filter, warnings } = await openWith(textGrid(['contains', 'inRange']));

        expect(warnings).toContain('warning #72');
        expect(warnings).toContain('inRange');

        // The one option that survived still filters, so the column is usable rather than merely quiet.
        await filter.setText('Bolt', 0);
        await asyncSetTimeout(0);
        await new GridRows(api, 'a text filter left with only `contains`').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 athlete:"Bolt"
        `);
        await new FilterDom(api, 'a text filter left with only `contains`', { colId: 'athlete' }).checkFilterDom(`
            COLUMN FILTER
            operator: "Contains"
            input: "Bolt"
            model:
              filterType: "text"
              type: "contains"
              filter: "Bolt"
        `);
    });

    test('a relative date range on a text filter is dropped from the dropdown', async () => {
        const { api, warnings } = await openWith(textGrid(['contains', 'lastYear']));

        expect(warnings).toContain('warning #72');
        expect(warnings).toContain('lastYear');
        await new FilterDom(api, 'a text filter offered a relative date range', { colId: 'athlete' }).checkFilterDom(`
            COLUMN FILTER
            operator: "Contains"
            input: "" ⟨Filter...⟩
            model: null
        `);
    });

    // The scalar filters used to admit every row for a key they could not judge; now the key never arrives.
    test('a text-only option on a number filter is dropped from the dropdown', async () => {
        const { api, filter, warnings } = await openWith(
            {
                columnDefs: [
                    {
                        field: 'age',
                        filter: 'agNumberColumnFilter',
                        filterParams: { filterOptions: ['equals', 'contains'], debounceMs: 0, maxNumConditions: 1 },
                    },
                ],
                rowData: [{ age: 25 }, { age: 40 }],
            } as GridOptions,
            'age'
        );

        expect(warnings).toContain('warning #72');
        expect(warnings).toContain('contains');

        await filter.setNumber(25, 0);
        await asyncSetTimeout(0);
        await new GridRows(api, 'a number filter left with only `equals`').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 age:25
        `);
        await new FilterDom(api, 'a number filter left with only `equals`', { colId: 'age' }).checkFilterDom(`
            COLUMN FILTER
            operator: "Equals"
            input: "25"
            model:
              filterType: "number"
              type: "equals"
              filter: 25
        `);
    });

    // Keeping the key out of the dropdown governs what can be newly picked. A model naming it was written
    // before, or by hand, so it is kept and reported rather than discarded - a filter the user already has
    // must not vanish because the list it was picked from has since narrowed.
    test('a model naming the dropped key is kept and reported, not cleared', async () => {
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [72, 76] });
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

        const api: GridApi = await gridsManager.createGridAndWait('grid1', textGrid(['contains', 'inRange']));
        await api.setColumnFilterModel('athlete', {
            filterType: 'text',
            type: 'inRange',
            filter: 'A',
            filterTo: 'Z',
        });
        await api.onFilterChanged();

        expect(api.getColumnFilterModel('athlete')).toEqual({
            filterType: 'text',
            type: 'inRange',
            filter: 'A',
            filterTo: 'Z',
        });
        expect(messagesFrom(warn)).toContain('warning #76');
        // Nothing can answer the condition, so it constrains nothing - the rows stay and the report is what
        // says so. Matching no row would empty the grid over a condition the user cannot see or correct.
        await new GridRows(api, 'a model naming a dropped key').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 athlete:"Bolt"
            └── LEAF id:1 athlete:"Ng"
        `);
    });

    // A dropped key never reaches the locale table, so nothing is asked to name it.
    test('`getLocaleText` is asked only about the options that survived', async () => {
        const calls: { key: string; defaultValue: unknown }[] = [];
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [72] });
        vi.spyOn(console, 'warn').mockImplementation(() => {});

        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            getLocaleText: ({ key, defaultValue }: any) => {
                if (key === 'contains' || key === 'soundsLike' || key === 'multipleOf') {
                    calls.push({ key, defaultValue });
                }
                return defaultValue;
            },
            ...textGrid([
                'contains',
                'soundsLike',
                { displayKey: 'multipleOf', displayName: 'Multiple of', predicate: () => true } as IFilterOptionDef,
            ]),
        } as GridOptions);

        const filter = await ColumnFilterHarness.open(api, 'athlete');
        expect(await filter.operatorOptions()).toEqual(['Contains', 'Multiple of']);
        expect(calls).toEqual([
            { key: 'contains', defaultValue: 'Contains' },
            { key: 'multipleOf', defaultValue: 'Multiple of' },
        ]);
    });

    // `toString` and `valueOf` are inherited `Object.prototype` names, not filter options.
    test('a key shadowing `Object.prototype` is dropped from the dropdown', async () => {
        const { api, warnings } = await openWith(
            {
                columnDefs: [
                    {
                        field: 'age',
                        filter: 'agNumberColumnFilter',
                        filterParams: {
                            filterOptions: ['equals', 'toString', 'valueOf'],
                            debounceMs: 0,
                            maxNumConditions: 1,
                        },
                    },
                ],
                rowData: [{ age: 25 }, { age: 40 }],
            } as GridOptions,
            'age'
        );

        expect(warnings).toContain('warning #72');
        expect(warnings).toContain('toString');
        expect(warnings).toContain('valueOf');
        await new FilterDom(api, 'a key shadowing `Object.prototype`', { colId: 'age' }).checkFilterDom(`
            COLUMN FILTER
            operator: "Equals"
            input: "" ⟨Filter...⟩
            model: null
        `);
    });

    test('a key the date filter cannot evaluate is dropped from the dropdown', async () => {
        const { api, warnings } = await openWith(
            {
                columnDefs: [
                    {
                        field: 'date',
                        filter: 'agDateColumnFilter',
                        filterParams: { filterOptions: ['equals', 'soundsLike'], debounceMs: 0, maxNumConditions: 1 },
                    },
                ],
                rowData: [{ date: '2024-01-01' }],
            } as GridOptions,
            'date'
        );

        expect(warnings).toContain('warning #72');
        expect(warnings).toContain('soundsLike');
        await new FilterDom(api, 'a key the date filter cannot evaluate', { colId: 'date' }).checkFilterDom(`
            COLUMN FILTER
            operator: "Equals"
            input: "" ⟨yyyy-mm-dd⟩
            model: null
        `);
    });
});

describe('An option the filter cannot evaluate is reported at configuration', () => {
    const gridsManager = new TestGridsManager({
        modules: [TextFilterModule, NumberFilterModule, LocaleModule, ClientSideRowModelModule],
    });

    beforeAll(() => setupAgTestIds());
    afterEach(() => {
        gridsManager.reset();
        vi.restoreAllMocks();
        enableDevValidations({ throwOn: ALL_SEVERITIES });
    });

    test('a key belonging to another filter type is rejected at configuration', async () => {
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [72] });
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

        await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'athlete',
                    filter: 'agTextColumnFilter',
                    // `greaterThan` belongs to the number filter, so the text filter can never evaluate it.
                    filterParams: { filterOptions: ['contains', 'greaterThan'] },
                },
            ],
            rowData: ROW_DATA,
        } as GridOptions<Row>);

        const warnings = messagesFrom(warn);
        expect(warnings).toContain('warning #72');
        expect(warnings).toContain('athlete');
        expect(warnings).toContain('greaterThan');
    });

    test('a misspelled key is rejected at configuration', async () => {
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [72] });
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

        await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'athlete',
                    filter: 'agTextColumnFilter',
                    filterParams: { filterOptions: ['contains', 'equalz'] },
                },
            ],
            rowData: ROW_DATA,
        } as GridOptions<Row>);

        const warnings = messagesFrom(warn);
        expect(warnings).toContain('warning #72');
        expect(warnings).toContain('equalz');
    });

    test('a key defined as a Custom Filter Option later in the same list is kept', async () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

        await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'athlete',
                    filter: 'agTextColumnFilter',
                    filterParams: {
                        filterOptions: [
                            'startsWithA',
                            {
                                displayKey: 'startsWithA',
                                displayName: 'Starts With A',
                                predicate: (_: unknown[], value: string) => value?.startsWith('A'),
                            } as IFilterOptionDef,
                        ],
                    },
                },
            ],
            rowData: ROW_DATA,
        } as GridOptions<Row>);

        expect(warn).not.toHaveBeenCalled();
    });
});

describe('A warning names each misconfigured column separately', () => {
    const gridsManager = new TestGridsManager({
        modules: [TextFilterModule, LocaleModule, ClientSideRowModelModule],
    });

    beforeAll(() => setupAgTestIds());
    afterEach(() => {
        gridsManager.reset();
        vi.restoreAllMocks();
        enableDevValidations({ throwOn: ALL_SEVERITIES });
    });

    test('two columns with the same mistake are reported once each', async () => {
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [72, 74] });
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

        await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                { field: 'athlete', filter: 'agTextColumnFilter', filterParams: { filterOptions: [NO_PREDICATE] } },
                { field: 'age', filter: 'agTextColumnFilter', filterParams: { filterOptions: [NO_PREDICATE] } },
            ],
            rowData: ROW_DATA,
        } as GridOptions<Row>);

        const warnings = messagesFrom(warn);
        expect(warnings).toContain('athlete');
        expect(warnings).toContain('age');
    });
});

/**
 * `filter: true` takes its filter from the column's cell data type - but only where the Set Filter module
 * is absent, as registering that makes `filter: true` mean the Set Filter whatever the data is.
 */
describe('A `filter: true` column is judged against the filter its data type gives it', () => {
    const gridsManager = new TestGridsManager({
        modules: [TextFilterModule, NumberFilterModule, ClientSideRowModelModule],
    });

    beforeAll(() => setupAgTestIds());
    afterEach(() => {
        gridsManager.reset();
        vi.restoreAllMocks();
        enableDevValidations({ throwOn: ALL_SEVERITIES });
    });

    // Judged before the data type is known, the column reads as text, which inverts both answers:
    // `contains` would look usable and `greaterThan` would not.
    test('a numeric column rejects the text-only key and keeps the ordered one', async () => {
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [72] });
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

        await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'age', filter: true, filterParams: { filterOptions: ['contains', 'greaterThan'] } }],
            rowData: ROW_DATA,
        } as GridOptions<Row>);

        const warnings = messagesFrom(warn);
        expect(warnings).toContain('warning #72');
        expect(warnings).toContain('contains');
        expect(warnings).toContain('age');
        expect(warnings).not.toContain('greaterThan');
    });
});

describe('A column named filter is judged once its data type is known', () => {
    const gridsManager = new TestGridsManager({
        modules: [TextFilterModule, SetFilterModule, ClientSideRowModelModule],
    });

    beforeAll(() => setupAgTestIds());
    afterEach(() => {
        gridsManager.reset();
        vi.restoreAllMocks();
        enableDevValidations({ throwOn: ALL_SEVERITIES });
    });

    test('a Set Filter with a Key Creator is not reported before inference supplies its formatter', async () => {
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [] });
        const error = vi.spyOn(console, 'error').mockImplementation(() => {});

        await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'date', filter: 'agSetColumnFilter', keyCreator: ({ value }: any) => String(value) }],
            rowData: ROW_DATA,
        } as GridOptions<Row>);

        // The inferred `dateString` type gives the Set Filter a tree list and a formatter, so the Key
        // Creator does have something to render with. Judging before they arrive reports a mistake
        // that is not one, and the column is never judged again.
        expect(messagesFrom(error)).not.toContain('error #249');
    });
});

/**
 * The Enterprise route into the same path, and the one a customer actually hits: the Set Filter is
 * registered, so `filter: true` would mean the Set Filter until `suppressSetFilterByDefault` turns that
 * off and hands the column back to its cell data type.
 */
describe('A `filter: true` column under `suppressSetFilterByDefault`', () => {
    const gridsManager = new TestGridsManager({
        modules: [TextFilterModule, NumberFilterModule, SetFilterModule, ClientSideRowModelModule],
    });

    beforeAll(() => setupAgTestIds());
    afterEach(() => {
        gridsManager.reset();
        vi.restoreAllMocks();
        enableDevValidations({ throwOn: ALL_SEVERITIES });
    });

    test('is judged against the filter its data type gives it, not the Set Filter', async () => {
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [72] });
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

        await gridsManager.createGridAndWait('grid1', {
            suppressSetFilterByDefault: true,
            columnDefs: [{ field: 'age', filter: true, filterParams: { filterOptions: ['contains', 'greaterThan'] } }],
            rowData: ROW_DATA,
        } as GridOptions<Row>);

        const warnings = messagesFrom(warn);
        expect(warnings).toContain('warning #72');
        expect(warnings).toContain('contains');
        expect(warnings).toContain('age');
        expect(warnings).not.toContain('greaterThan');
    });

    // The control: without the option the same column is a Set Filter, which reads no `filterOptions`.
    test('is a Set Filter without the option, so its `filterOptions` are not judged at all', async () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

        await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'age', filter: true, filterParams: { filterOptions: ['contains', 'greaterThan'] } }],
            rowData: ROW_DATA,
        } as GridOptions<Row>);

        expect(warn).not.toHaveBeenCalled();
    });
});

describe('The Filters Tool Panel judges every column against its own buttons', () => {
    const gridsManager = new TestGridsManager({
        modules: [
            TextFilterModule,
            NumberFilterModule,
            NewFiltersToolPanelModule,
            SideBarModule,
            ClientSideRowModelModule,
        ],
    });

    beforeAll(() => setupAgTestIds());
    afterEach(() => {
        gridsManager.reset();
        vi.restoreAllMocks();
        enableDevValidations({ throwOn: ALL_SEVERITIES });
    });

    // The panel's own buttons stand in for every column's, so a column with none of its own is a problem
    // the moment the panel says so - not when that one column's filter happens to be built.
    test('a column with no `buttons` is reported without its filter being built', async () => {
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [281] });
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

        await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                { field: 'athlete', filter: 'agTextColumnFilter', filterParams: { buttons: ['apply'] } },
                { field: 'age', filter: 'agNumberColumnFilter' },
                { field: 'date', filter: 'agTextColumnFilter' },
            ],
            rowData: ROW_DATA,
            enableFilterHandlers: true,
            sideBar: {
                defaultToolPanel: 'filters',
                toolPanels: [
                    {
                        id: 'filters',
                        labelDefault: 'Filters',
                        iconKey: 'filter',
                        toolPanel: 'agNewFiltersToolPanel',
                        toolPanelParams: { buttons: ['apply'] },
                    },
                ],
            },
        } as GridOptions<Row>);

        // The panel initialises lazily on show, and declaring its buttons is what triggers the report.
        await waitFor(() => expect(messagesFrom(warn)).toContain('warning #281'));
        const warnings = messagesFrom(warn);
        // One report naming every offender, not one per column: the panel's own buttons are the cause, so a
        // grid of fifty buttonless columns would otherwise print fifty lines saying the same thing.
        expect(warnings.split('warning #281')).toHaveLength(2);
        expect(warnings).toContain('age');
        expect(warnings).toContain('date');
        expect(warnings).not.toContain('athlete');
    });
});
