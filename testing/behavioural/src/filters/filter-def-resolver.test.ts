import {
    ALL_SEVERITIES,
    AdvancedFilterHarness,
    ColumnFilterHarness,
    TestGridsManager,
    asyncSetTimeout,
    installFilterLayoutMock,
    uninstallFilterLayoutMock,
} from 'ag-test-utils';

import type { ColDef, GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    CustomFilterModule,
    DateFilterModule,
    NumberFilterModule,
    TextFilterModule,
    enableDevValidations,
    setupAgTestIds,
} from 'ag-grid-community';
import {
    AdvancedFilterModule,
    AiToolkitModule,
    MultiFilterModule,
    NewFiltersToolPanelModule,
    PivotModule,
    RowGroupingModule,
    SetFilterModule,
} from 'ag-grid-enterprise';

interface Row {
    id: number;
    when: string;
    country: string;
}

const ROWS: Row[] = [
    { id: 0, when: '2008-08-24', country: 'Spain' },
    { id: 1, when: '2010-01-01', country: 'Italy' },
    { id: 2, when: '2012-08-05', country: 'Spain' },
    { id: 3, when: '2014-01-01', country: 'France' },
];

/** The same params as an object and as a function, which every reader must read alike. */
const FORMS = {
    object: <T extends object>(params: T) => params,
    function:
        <T extends object>(params: T) =>
        () => ({ ...params }),
};

type Form = keyof typeof FORMS;

interface Shape {
    name: string;
    gridOptions?: GridOptions;
    colDef: (params: object | (() => object)) => ColDef;
    /** The column filter model holding `dateModel` where this shape's date filter sits. */
    columnModel: (dateModel: object) => object;
}

const asIs = (dateModel: object) => dateModel;
const asOnlyChild = (dateModel: object) => ({ filterType: 'multi', filterModels: [dateModel] });
const SET_FILTER_NOT_DEFAULT: GridOptions = { suppressSetFilterByDefault: true };

/** Every way a column reaches the Date Filter on a `dateString` column, each `filter: true` meaning included. */
const DATE_SHAPES: Shape[] = [
    {
        name: 'the column',
        colDef: (filterParams) => ({ filter: 'agDateColumnFilter', filterParams }),
        columnModel: asIs,
    },
    {
        name: "`filter: true`, the data type's filter where the Set Filter is not the default",
        gridOptions: SET_FILTER_NOT_DEFAULT,
        colDef: (filterParams) => ({ filter: true, filterParams }),
        columnModel: asIs,
    },
    {
        name: 'a Multi Filter child',
        colDef: (filterParams) => ({
            filter: 'agMultiColumnFilter',
            filterParams: { filters: [{ filter: 'agDateColumnFilter', filterParams }] },
        }),
        columnModel: asOnlyChild,
    },
    {
        name: 'a child of a Multi Filter given by a function',
        colDef: (filterParams) => ({
            filter: 'agMultiColumnFilter',
            filterParams: () => ({ filters: [{ filter: 'agDateColumnFilter', filterParams }] }),
        }),
        columnModel: asOnlyChild,
    },
    {
        name: 'a Selectable Filter choice',
        colDef: (filterParams) => ({
            filter: 'agSelectableColumnFilter',
            filterParams: { filters: [{ filter: 'agDateColumnFilter', filterParams }] },
        }),
        columnModel: asIs,
    },
    {
        name: "a Selectable Filter choice of `filter: true`, following the column's own default",
        gridOptions: SET_FILTER_NOT_DEFAULT,
        colDef: (filterParams) => ({
            filter: 'agSelectableColumnFilter',
            filterParams: { filters: [{ filter: true, filterParams }] },
        }),
        columnModel: asIs,
    },
];

const CASES = DATE_SHAPES.flatMap((shape) =>
    (Object.keys(FORMS) as Form[]).map((form) => ({ ...shape, form, label: `${shape.name}, params as ${form}` }))
);

function displayedIds(api: GridApi): number[] {
    const ids: number[] = [];
    api.forEachNodeAfterFilterAndSort((node) => ids.push(node.data.id));
    return ids;
}

describe('a filter definition is read alike by every reader', () => {
    const gridsManager = new TestGridsManager({
        modules: [
            ClientSideRowModelModule,
            CustomFilterModule,
            TextFilterModule,
            NumberFilterModule,
            DateFilterModule,
            SetFilterModule,
            MultiFilterModule,
            NewFiltersToolPanelModule,
            AdvancedFilterModule,
            AiToolkitModule,
            PivotModule,
            RowGroupingModule,
        ],
    });

    beforeAll(() => {
        setupAgTestIds();
        installFilterLayoutMock();
    });
    afterAll(() => uninstallFilterLayoutMock());
    afterEach(() => gridsManager.reset());

    function createGrid(shape: Shape, form: Form, params: object, gridOptions?: GridOptions): Promise<GridApi> {
        return gridsManager.createGridAndWait('grid', {
            ...shape.gridOptions,
            ...gridOptions,
            columnDefs: [{ field: 'when', cellDataType: 'dateString', ...shape.colDef(FORMS[form](params)) }],
            rowData: ROWS,
        });
    }

    // Exclusive, the range would hold row 1 alone; the strings compare only through the data type's comparator.
    test.each(CASES)(
        "the column filter reads the author's params over the data type's: $label",
        async ({ form, ...shape }) => {
            for (const enableFilterHandlers of [false, true]) {
                const api = await createGrid(shape, form, { inRangeInclusive: true }, { enableFilterHandlers });
                await api.setColumnFilterModel(
                    'when',
                    shape.columnModel({
                        filterType: 'date',
                        type: 'inRange',
                        dateFrom: '2008-08-24',
                        dateTo: '2012-08-05',
                    })
                );
                api.onFilterChanged();
                await asyncSetTimeout(0);
                expect({ enableFilterHandlers, ids: displayedIds(api) }).toEqual({
                    enableFilterHandlers,
                    ids: [0, 1, 2],
                });
                gridsManager.reset();
            }
        }
    );

    // `suppressDefaultProperties` leaves the filter params alone
    test('a data type suppressing its default properties still gives its filter params to an object and a `filterParams` function alike', async () => {
        const labels: Record<string, (string | null)[]> = {};
        for (const form of Object.keys(FORMS) as Form[]) {
            const api = await gridsManager.createGridAndWait('grid', {
                dataTypeDefinitions: {
                    plainDate: {
                        baseDataType: 'dateString',
                        extendsDataType: 'dateString',
                        suppressDefaultProperties: true,
                    },
                },
                columnDefs: [
                    {
                        field: 'when',
                        cellDataType: 'plainDate',
                        filter: 'agSetColumnFilter',
                        filterParams: FORMS[form]({}),
                    },
                ],
                rowData: ROWS,
            });
            labels[form] = (await ColumnFilterHarness.open(api, 'when')).setFilterItemLabels();
            gridsManager.reset();
        }
        const years = ['(Select All)', '2008', '2010', '2012', '2014'];
        expect(labels).toEqual({ object: years, function: years });
    });

    test.each(CASES)("the Advanced Filter reads the author's params: $label", async ({ form, ...shape }) => {
        const api = await createGrid(shape, form, { inRangeInclusive: true }, { enableAdvancedFilter: true });
        api.setAdvancedFilterModel({
            filterType: 'dateString',
            colId: 'when',
            type: 'inRange',
            filter: '2008-08-24',
            filterTo: '2012-08-05',
        });
        api.onFilterChanged();
        await asyncSetTimeout(0);
        expect(displayedIds(api)).toEqual([0, 1, 2]);
    });

    test.each(CASES)("the floating filter reads the author's params: $label", async ({ form, ...shape }) => {
        await createGrid(
            shape,
            form,
            { readOnly: true },
            { defaultColDef: { floatingFilter: true }, enableFilterHandlers: true }
        );
        await asyncSetTimeout(0);
        const input = document.querySelector<HTMLInputElement>('.ag-floating-filter input');
        expect(input).not.toBeNull();
        expect(input!.disabled).toBe(true);
    });

    test.each(CASES)("the AI Toolkit schema reads the author's params: $label", async ({ form, ...shape }) => {
        const api = await createGrid(shape, form, { filterOptions: ['equals', 'inRange'] });
        const schema = JSON.parse(JSON.stringify(api.getStructuredSchema()));
        const described = JSON.stringify(schema.properties.filter.properties.filterModel.properties.when);
        expect(described).toContain('"enum":["equals","inRange"]');
    });

    /** Every way a column reaches the Set Filter, `filter: true` meaning it where it is the default. */
    const SET_SHAPES: { name: string; colDef: (filterParams: object | (() => object)) => ColDef }[] = [
        { name: 'the column', colDef: (filterParams) => ({ filter: 'agSetColumnFilter', filterParams }) },
        {
            name: '`filter: true` where the Set Filter is the default',
            colDef: (filterParams) => ({ filter: true, filterParams }),
        },
        {
            name: 'a Multi Filter child',
            colDef: (filterParams) => ({
                filter: 'agMultiColumnFilter',
                filterParams: {
                    filters: [{ filter: 'agTextColumnFilter' }, { filter: 'agSetColumnFilter', filterParams }],
                },
            }),
        },
        {
            name: 'a child of a Multi Filter given by a function',
            colDef: (filterParams) => ({
                filter: 'agMultiColumnFilter',
                filterParams: () => ({
                    filters: [{ filter: 'agTextColumnFilter' }, { filter: 'agSetColumnFilter', filterParams }],
                }),
            }),
        },
        {
            name: 'a Selectable Filter choice',
            colDef: (filterParams) => ({
                filter: 'agSelectableColumnFilter',
                filterParams: { filters: [{ filter: 'agSetColumnFilter', filterParams }] },
            }),
        },
    ];

    test.each(
        SET_SHAPES.flatMap((shape) =>
            (Object.keys(FORMS) as Form[]).map((form) => ({
                ...shape,
                form,
                label: `${shape.name}, params as ${form}`,
            }))
        )
    )(
        "the Advanced Filter's value list and the column's own read the author's params: $label",
        async ({ form, colDef }) => {
            const api = await gridsManager.createGridAndWait('grid', {
                columnDefs: [
                    { field: 'id' },
                    {
                        field: 'country',
                        ...colDef(FORMS[form]({ valueFormatter: ({ value }: { value: string }) => `${value} (F)` })),
                    },
                ],
                rowData: ROWS,
                enableAdvancedFilter: true,
            });
            const af = AdvancedFilterHarness.get(api);
            await af.type('[Country] is any of [');
            expect(af.autocompleteEntries()).toEqual(['France (F)', 'Italy (F)', 'Spain (F)']);

            await af.applyExpression('[Country] is any of ["Spain (F)"]');
            await asyncSetTimeout(0);
            expect(displayedIds(api)).toEqual([0, 2]);
        }
    );

    // The object form names the same filter through `component`; its params are configured the same way.
    test('a filter named through `component` is read as the one it names, by the Advanced Filter and the AI Toolkit', async () => {
        const wholeWord = {
            textMatcher: ({ value, filterText }: { value: string; filterText: string | null }) => value === filterText,
        };
        for (const filter of ['agMultiColumnFilter', { component: 'agMultiColumnFilter' }]) {
            const api = await gridsManager.createGridAndWait('grid', {
                enableFilterHandlers: true,
                enableAdvancedFilter: true,
                columnDefs: [
                    { field: 'id' },
                    {
                        field: 'country',
                        filter,
                        filterParams: { filters: [{ filter: 'agTextColumnFilter', filterParams: wholeWord }] },
                    },
                ],
                rowData: [
                    { id: 0, country: 'land' },
                    { id: 1, country: 'Finland' },
                ],
            });
            await AdvancedFilterHarness.get(api).applyExpression('[Country] contains "land"');
            await asyncSetTimeout(0);
            expect({ filter, ids: displayedIds(api) }).toEqual({ filter, ids: [0] });
            api.setGridOption('enableAdvancedFilter', false);
            const schema = JSON.stringify(api.getStructuredSchema());
            expect({ filter, multi: schema.includes('"filterModels"') }).toEqual({ filter, multi: true });
            gridsManager.reset();
        }
    });

    test("a Multi Filter child's `filter: true` is the Text Filter, whatever the column's own default", async () => {
        for (const form of Object.keys(FORMS) as Form[]) {
            const api = await gridsManager.createGridAndWait('grid', {
                columnDefs: [
                    {
                        field: 'id',
                        filter: 'agMultiColumnFilter',
                        filterParams: {
                            filters: [{ filter: true, filterParams: FORMS[form]({ maxNumConditions: 1 }) }],
                        },
                    },
                ],
                rowData: ROWS,
            });
            await api.setColumnFilterModel('id', {
                filterType: 'multi',
                filterModels: [{ filterType: 'text', type: 'equals', filter: '2' }],
            });
            api.onFilterChanged();
            await asyncSetTimeout(0);
            expect({ form, ids: displayedIds(api) }).toEqual({ form, ids: [2] });

            const schema = JSON.parse(JSON.stringify(api.getStructuredSchema()));
            const described = JSON.stringify(schema.properties.filter.properties.filterModel.properties.id);
            expect(described).toContain('"enum":["text"]');
            // One condition, so the child is described without a join wrapper.
            expect(described).not.toContain('"conditions"');
            gridsManager.reset();
        }
    });

    // The handler and the panel are built apart with filter handlers, so the panel must lay the same params.
    test("a Multi Filter child's panel offers the data type's options under the author's params, with or without handlers", async () => {
        for (const enableFilterHandlers of [false, true]) {
            for (const form of Object.keys(FORMS) as Form[]) {
                const api = await gridsManager.createGridAndWait('grid', {
                    enableFilterHandlers,
                    columnDefs: [
                        {
                            field: 'done',
                            cellDataType: 'boolean',
                            filter: 'agMultiColumnFilter',
                            filterParams: {
                                filters: [{ filter: 'agTextColumnFilter', filterParams: FORMS[form]({}) }],
                            },
                        },
                    ],
                    rowData: [{ done: true }, { done: false }],
                });
                const filter = await ColumnFilterHarness.open(api, 'done');
                expect({ enableFilterHandlers, form, options: await filter.operatorOptions() }).toEqual({
                    enableFilterHandlers,
                    form,
                    options: ['Choose one', 'True', 'False'],
                });
                gridsManager.reset();
            }
        }
    });

    test("a pivot result column's `filter: true` is the Number Filter, where the Set Filter is the column's default", async () => {
        const api = await gridsManager.createGridAndWait('grid', {
            columnDefs: [
                { field: 'country', rowGroup: true },
                { field: 'when', pivot: true },
                { field: 'id', aggFunc: 'sum', filter: true },
            ],
            pivotMode: true,
            rowData: ROWS,
        });
        await ColumnFilterHarness.open(api, 'pivot_when_2008-08-24_id');
        expect(document.querySelector('.ag-filter-menu .ag-set-filter-list')).toBeNull();
        expect(document.querySelector('.ag-filter-menu .ag-filter-body input[type="number"]')).not.toBeNull();

        api.hidePopupMenu();
        api.setGridOption('pivotMode', false);
        await asyncSetTimeout(0);
        await ColumnFilterHarness.open(api, 'id');
        expect(document.querySelector('.ag-filter-menu .ag-set-filter-list')).not.toBeNull();
    });
});

// A stale name (the pre-v34 `'set'`, a typo) is warned about and builds what `filter: true` would.
describe('a filter name nothing is registered under', () => {
    const COMMUNITY = [ClientSideRowModelModule, TextFilterModule, NumberFilterModule];
    const BUILDS = [
        {
            build: 'enterprise',
            modules: [...COMMUNITY, SetFilterModule, MultiFilterModule],
            model: { filterType: 'set', values: ['2'] },
            panel: '.ag-filter-menu .ag-set-filter-list',
        },
        {
            build: 'community',
            modules: COMMUNITY,
            model: { filterType: 'number', type: 'equals', filter: 2 },
            panel: '.ag-filter-menu .ag-filter-body input[type="number"]',
        },
    ];

    beforeAll(() => {
        setupAgTestIds();
        installFilterLayoutMock();
    });
    afterAll(() => uninstallFilterLayoutMock());
    // each test builds its own manager, so a failure must not leave its grid or its spy to the next
    let gridsManager: TestGridsManager | undefined;
    afterEach(() => {
        gridsManager?.reset();
        vi.restoreAllMocks();
    });

    test.each(BUILDS)(
        'builds the default filter, with its floating filter, in the $build build',
        async ({ modules, model, panel }) => {
            gridsManager = new TestGridsManager({ modules });
            for (const enableFilterHandlers of [false, true]) {
                enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [101] });
                const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
                const api = await gridsManager.createGridAndWait('grid', {
                    enableFilterHandlers,
                    columnDefs: [{ field: 'id', filter: 'set', floatingFilter: true }],
                    rowData: ROWS,
                });
                await api.setColumnFilterModel('id', model);
                api.onFilterChanged();
                await asyncSetTimeout(0);
                expect({ enableFilterHandlers, ids: displayedIds(api) }).toEqual({ enableFilterHandlers, ids: [2] });
                expect(api.getFilterModel()).toEqual({ id: model });
                api.showColumnFilter('id');
                await asyncSetTimeout(0);
                expect(document.querySelector(panel)).not.toBeNull();
                expect(api.getColumnDefs()![0]).toMatchObject({ filter: 'set' });
                expect(warnSpy.mock.calls.flat().join(' ')).toContain('warning #101');
                warnSpy.mockRestore();
                gridsManager.reset();
            }
        }
    );

    test("the default filter takes its data type's params, so a number column's Set Filter lists in number order", async () => {
        gridsManager = new TestGridsManager({ modules: [...COMMUNITY, SetFilterModule] });
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [101] });
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const api = await gridsManager.createGridAndWait('grid', {
            columnDefs: [{ field: 'amount', filter: 'set' }],
            rowData: [{ amount: 10 }, { amount: 9 }, { amount: 100 }],
        });
        const filter = await ColumnFilterHarness.open(api, 'amount');
        expect(filter.setFilterItemLabels()).toEqual(['(Select All)', '9', '10', '100']);
        expect(warnSpy.mock.calls.flat().join(' ')).toContain('warning #101');
        warnSpy.mockRestore();
        gridsManager.reset();
    });

    // Its panel has no component to build, which is warned about; the handler still filters.
    test('a name the `filterHandlers` grid option holds keeps that handler', async () => {
        gridsManager = new TestGridsManager({ modules: [...COMMUNITY, SetFilterModule] });
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [101] });
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const api = await gridsManager.createGridAndWait('grid', {
            enableFilterHandlers: true,
            filterHandlers: { even: () => ({ doesFilterPass: ({ node }) => node.data.id % 2 === 0 }) },
            columnDefs: [{ field: 'id', filter: 'even' }],
            rowData: ROWS,
        });
        await api.setColumnFilterModel('id', { any: true });
        api.onFilterChanged();
        await asyncSetTimeout(0);
        expect(displayedIds(api)).toEqual([0, 2]);
        expect(warnSpy.mock.calls.flat().join(' ')).toContain('Could not find `even` component');
        warnSpy.mockRestore();
        gridsManager.reset();
    });

    test("a Multi Filter child's unregistered name builds the child default, the Text Filter, with its floating filter", async () => {
        gridsManager = new TestGridsManager({ modules: [...COMMUNITY, SetFilterModule, MultiFilterModule] });
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [101] });
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const api = await gridsManager.createGridAndWait('grid', {
            columnDefs: [
                {
                    field: 'country',
                    filter: 'agMultiColumnFilter',
                    filterParams: { filters: [{ filter: 'text' }] },
                    floatingFilter: true,
                },
            ],
            rowData: ROWS,
        });
        expect(document.querySelector('.ag-floating-filter .ag-text-field-input')).not.toBeNull();
        await api.setColumnFilterModel('country', {
            filterType: 'multi',
            filterModels: [{ filterType: 'text', type: 'equals', filter: 'Italy' }],
        });
        api.onFilterChanged();
        await asyncSetTimeout(0);
        expect(displayedIds(api)).toEqual([1]);
        expect(warnSpy.mock.calls.flat().join(' ')).toContain('warning #101');
        warnSpy.mockRestore();
        gridsManager.reset();
    });
});

// The author's logic decides the rows; a built-in filter keeping its state in its handler still gets its own.
describe("a built-in filter given the author's `handler` or `doesFilterPass`", () => {
    const gridsManager = new TestGridsManager({
        modules: [
            ClientSideRowModelModule,
            CustomFilterModule,
            TextFilterModule,
            NumberFilterModule,
            DateFilterModule,
            SetFilterModule,
            MultiFilterModule,
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
    });

    const evenIds = ({ node }: { node: { data?: Row } }) => node.data!.id % 2 === 0;
    const ITALY = { filterType: 'set', values: ['Italy'] };

    async function openPanel(api: GridApi): Promise<void> {
        api.showColumnFilter('country');
        await asyncSetTimeout(0);
    }

    test.each([
        { name: 'doesFilterPass', filter: () => ({ component: 'agSetColumnFilter', doesFilterPass: evenIds }) },
        {
            name: 'handler',
            filter: () => ({ component: 'agSetColumnFilter', handler: () => ({ doesFilterPass: evenIds }) }),
        },
    ])('a Set Filter with $name filters by it, and its panel and floating filter work', async ({ filter }) => {
        const api = await gridsManager.createGridAndWait('grid', {
            enableFilterHandlers: true,
            columnDefs: [{ field: 'id' }, { field: 'country', filter: filter(), floatingFilter: true }],
            rowData: ROWS,
        });
        await api.setColumnFilterModel('country', ITALY);
        api.onFilterChanged();
        await asyncSetTimeout(0);
        expect(displayedIds(api)).toEqual([0, 2]);
        await openPanel(api);
        const labels = [...document.querySelectorAll('.ag-filter-menu .ag-set-filter-item .ag-checkbox-label')];
        expect(labels.map((label) => label.textContent)).toEqual(['(Select All)', 'France', 'Italy', 'Spain']);
        expect(api.getColumnFilterModel('country')).toEqual(ITALY);
        expect(document.querySelector<HTMLInputElement>('.ag-set-floating-filter-input input')!.value).toBe(
            '(1) Italy'
        );
    });

    test("the filter named by `component` takes its data type's params", async () => {
        const labels: Record<string, string[]> = {};
        for (const form of Object.keys(FORMS) as Form[]) {
            const amounts = await gridsManager.createGridAndWait('grid', {
                enableFilterHandlers: true,
                columnDefs: [
                    {
                        field: 'amount',
                        filter: { component: 'agSetColumnFilter', doesFilterPass: () => true },
                        filterParams: FORMS[form]({}),
                    },
                ],
                rowData: [{ amount: 10 }, { amount: 9 }, { amount: 100 }],
            });
            labels[form] = (await ColumnFilterHarness.open(amounts, 'amount')).setFilterItemLabels();
            gridsManager.reset();
        }
        const numberOrder = ['(Select All)', '9', '10', '100'];
        expect(labels).toEqual({ object: numberOrder, function: numberOrder });
    });

    test("a Multi Filter child named by `component` takes its data type's params", async () => {
        const api = await gridsManager.createGridAndWait('grid', {
            enableFilterHandlers: true,
            columnDefs: [
                {
                    field: 'amount',
                    filter: 'agMultiColumnFilter',
                    filterParams: {
                        filters: [{ filter: { component: 'agSetColumnFilter', doesFilterPass: () => true } }],
                    },
                },
            ],
            rowData: [{ amount: 10 }, { amount: 9 }, { amount: 100 }],
        });
        const labels = (await ColumnFilterHarness.open(api, 'amount')).setFilterItemLabels();
        expect(labels).toEqual(['(Select All)', '9', '10', '100']);
    });

    test("the API returns the author's handler, not the grid's", async () => {
        const authors = { doesFilterPass: evenIds };
        const api = await gridsManager.createGridAndWait('grid', {
            enableFilterHandlers: true,
            columnDefs: [{ field: 'country', filter: { component: 'agSetColumnFilter', handler: () => authors } }],
            rowData: ROWS,
        });
        expect(api.getColumnFilterHandler('country')).toBe(authors);
    });

    test('a definition update that keeps the logic keeps the model, for doesFilterPass and handler alike', async () => {
        const handler = () => ({ doesFilterPass: evenIds });
        const kept: Record<string, unknown> = {};
        for (const [name, filter] of Object.entries({
            doesFilterPass: { component: 'agSetColumnFilter', doesFilterPass: evenIds },
            handler: { component: 'agSetColumnFilter', handler },
        })) {
            const colDefs = (headerName: string): ColDef[] => [
                { field: 'id' },
                { field: 'country', headerName, filter },
            ];
            const api = await gridsManager.createGridAndWait('grid', {
                enableFilterHandlers: true,
                columnDefs: colDefs('Country'),
                rowData: ROWS,
            });
            await api.setColumnFilterModel('country', ITALY);
            api.onFilterChanged();
            api.setGridOption('columnDefs', colDefs('Nation'));
            await asyncSetTimeout(0);
            kept[name] = { model: api.getColumnFilterModel('country'), rows: displayedIds(api) };
            gridsManager.reset();
        }
        const expected = { model: ITALY, rows: [0, 2] };
        expect(kept).toEqual({ doesFilterPass: expected, handler: expected });
    });

    test('a Multi Filter with doesFilterPass, and a Set Filter child with its own, filter by it and open', async () => {
        for (const colDef of [
            {
                field: 'country',
                filter: { component: 'agMultiColumnFilter', doesFilterPass: evenIds },
                filterParams: { filters: [{ filter: 'agSetColumnFilter' }] },
            },
            {
                field: 'country',
                filter: 'agMultiColumnFilter',
                filterParams: {
                    filters: [{ filter: { component: 'agSetColumnFilter', doesFilterPass: evenIds } }],
                },
            },
        ]) {
            const api = await gridsManager.createGridAndWait('grid', {
                enableFilterHandlers: true,
                columnDefs: [{ field: 'id' }, colDef],
                rowData: ROWS,
            });
            await api.setColumnFilterModel('country', { filterType: 'multi', filterModels: [ITALY] });
            api.onFilterChanged();
            await asyncSetTimeout(0);
            expect(displayedIds(api)).toEqual([0, 2]);
            await openPanel(api);
            expect(document.querySelector('.ag-filter-menu .ag-set-filter-list')).not.toBeNull();
            gridsManager.reset();
        }
    });

    test('a definition update that only swaps the component to the Set Filter gives its panel the Set handler', async () => {
        const colDefs = (component: string): ColDef[] => [
            { field: 'id' },
            { field: 'country', filter: { component, doesFilterPass: evenIds } },
        ];
        const api = await gridsManager.createGridAndWait('grid', {
            enableFilterHandlers: true,
            columnDefs: colDefs('agTextColumnFilter'),
            rowData: ROWS,
        });
        api.getColumnFilterHandler('country');
        api.setGridOption('columnDefs', colDefs('agSetColumnFilter'));
        await asyncSetTimeout(0);
        await openPanel(api);
        expect(document.querySelector('.ag-filter-menu .ag-set-filter-list')).not.toBeNull();
    });

    test('with filter handlers, a provided filter named by `component` alone filters with its own handler', async () => {
        const api = await gridsManager.createGridAndWait('grid', {
            enableFilterHandlers: true,
            columnDefs: [{ field: 'id' }, { field: 'country', filter: { component: 'agTextColumnFilter' } }],
            rowData: ROWS,
        });
        await api.setColumnFilterModel('country', { filterType: 'text', type: 'equals', filter: 'Italy' });
        api.onFilterChanged();
        await asyncSetTimeout(0);
        expect(displayedIds(api)).toEqual([1]);
    });

    test('without filter handlers, the logic is warned about and the default filter is built', async () => {
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [335] });
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const init = vi.fn();
        // the form takes a display component, which reports through `onModelChange` a filter without handlers lacks
        class DisplayComponent {
            public init = init;
            public getGui = () => document.createElement('div');
        }
        const api = await gridsManager.createGridAndWait('grid', {
            ...SET_FILTER_NOT_DEFAULT,
            columnDefs: [
                {
                    field: 'when',
                    cellDataType: 'dateString',
                    filter: { component: DisplayComponent, doesFilterPass: evenIds },
                    filterParams: { inRangeInclusive: true },
                },
            ],
            rowData: ROWS,
        });
        await api.setColumnFilterModel('when', {
            filterType: 'date',
            type: 'inRange',
            dateFrom: '2008-08-24',
            dateTo: '2012-08-05',
        });
        api.onFilterChanged();
        await asyncSetTimeout(0);
        // the strings compare only through the data type's comparator
        expect(displayedIds(api)).toEqual([0, 1, 2]);
        api.showColumnFilter('when');
        await asyncSetTimeout(0);
        expect(document.querySelector('.ag-filter-menu .ag-date-filter input')).not.toBeNull();
        expect(init).not.toHaveBeenCalled();
        expect(warnSpy.mock.calls.flat().join(' ')).toContain('warning #335');
    });
});
