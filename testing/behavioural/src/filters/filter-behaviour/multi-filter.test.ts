import { waitFor } from '@testing-library/dom';
import {
    ALL_SEVERITIES,
    ColumnFilterHarness,
    FilterDom,
    GridRows,
    TestGridsManager,
    asyncSetTimeout,
    installFilterLayoutMock,
    uninstallFilterLayoutMock,
} from 'ag-test-utils';

import type {
    ColDef,
    DoesFilterPassParams,
    GridApi,
    GridOptions,
    IDoesFilterPassParams,
    IFilterComp,
    IFilterParams,
    IMultiFilter,
} from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    CustomFilterModule,
    GridStateModule,
    NumberFilterModule,
    TextFilterModule,
    enableDevValidations,
    getGridElement,
    setupAgTestIds,
} from 'ag-grid-community';
import { ColumnMenuModule, FiltersToolPanelModule, MultiFilterModule, SetFilterModule } from 'ag-grid-enterprise';

import { FILTERS_SIDEBAR, openFiltersPanel } from './toolPanelHarness';

interface Row {
    name?: string | null;
    age?: number;
}

const TEXT_MICH = { filterType: 'text', type: 'contains', filter: 'mich' };

const ROWS: Row[] = [
    { name: 'michael', age: 30 },
    { name: 'michelle', age: 25 },
    { name: 'bob', age: 40 },
    { name: 'alice', age: 35 },
];

/** Every sub-floating-filter in the `.ag-multi-floating-filter` cell, hidden ones included. */
function floatingChildren(): HTMLElement[] {
    const container = document.querySelector<HTMLElement>('.ag-multi-floating-filter');
    if (!container) {
        throw new Error('Multi floating filter container not present');
    }
    return Array.from(container.children).filter((c): c is HTMLElement => c instanceof HTMLElement);
}

/** The `.ag-multi-floating-filter` cell's currently displayed child (the non-hidden sub-floating-filter). */
function visibleFloatingChild(): HTMLElement {
    const shown = floatingChildren().filter((c) => !c.classList.contains('ag-hidden'));
    if (shown.length !== 1) {
        throw new Error(`Expected exactly one visible multi floating child, found ${shown.length}`);
    }
    return shown[0];
}

/** 'set' when the visible sub-floating-filter is the read-only set one, otherwise 'text'. */
function visibleFloatingKind(): 'set' | 'text' {
    return visibleFloatingChild().classList.contains('ag-set-floating-filter-input') ? 'set' : 'text';
}

function visibleFloatingInput(): HTMLInputElement {
    const input = visibleFloatingChild().querySelector<HTMLInputElement>('input');
    if (!input) {
        throw new Error('Visible multi floating child has no input');
    }
    return input;
}

/**
 * Black-box coverage for agMultiColumnFilter (MultiFilterModule): default text+set combo, the combined
 * `{ filterType:'multi', filterModels:[...] }` model, AND across sub-filters, setColumnFilterModel
 * round-trips, custom `filters[]` configs, and the floating filter reflecting the active sub-filter.
 * Complements multi-filter-floating-filter (keystroke race) and multi-filter-set-filter-refresh.
 */
describe('Multi Filter — sub-filter combos & combined model (coverage)', () => {
    const gridsManager = new TestGridsManager({
        modules: [
            ClientSideRowModelModule,
            GridStateModule,
            TextFilterModule,
            NumberFilterModule,
            MultiFilterModule,
            SetFilterModule,
            ColumnMenuModule,
            FiltersToolPanelModule,
        ],
    });

    beforeAll(() => {
        setupAgTestIds();
        installFilterLayoutMock();
    });
    afterAll(() => uninstallFilterLayoutMock());
    afterEach(() => {
        try {
            gridsManager.reset();
        } finally {
            vi.restoreAllMocks();
        }
    });

    test("a child's buttons are dropped with warning 292, whether its filterParams are an object or a function", async () => {
        // Deliberate: child buttons are dropped with warning #292, asserted below.
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [292] });
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        try {
            const childParams = { object: { buttons: ['apply'] }, function: () => ({ buttons: ['apply'] }) };
            const api: GridApi = await gridsManager.createGridAndWait('grid1', {
                enableFilterHandlers: true,
                columnDefs: (['object', 'function'] as const).map((colId) => ({
                    colId,
                    field: 'name',
                    filter: 'agMultiColumnFilter',
                    filterParams: {
                        filters: [
                            { filter: 'agTextColumnFilter' },
                            { filter: 'agSetColumnFilter', filterParams: childParams[colId] },
                        ],
                    },
                })),
                rowData: ROWS,
            });

            for (const colId of ['object', 'function']) {
                await ColumnFilterHarness.open(api, colId);
                expect(document.querySelectorAll('.ag-multi-filter .ag-set-filter-list')).toHaveLength(1);
                expect(document.querySelectorAll('.ag-multi-filter .ag-filter-apply-panel')).toHaveLength(0);
                api.hidePopupMenu();
            }
            const warnings = warnSpy.mock.calls.flat().join(' ');
            expect(warnings).toContain('warning #292');
            expect(['object', 'function'].filter((colId) => warnings.includes(`\`${colId}\``))).toEqual([
                'object',
                'function',
            ]);
        } finally {
            warnSpy.mockRestore();
            enableDevValidations({ throwOn: ALL_SEVERITIES });
        }
    });

    test("an empty `filters` list takes the data type's default children, as no list does", async () => {
        for (const filterParams of [{}, { filters: [] }]) {
            const api: GridApi = await gridsManager.createGridAndWait('grid1', {
                columnDefs: [{ field: 'age', filter: 'agMultiColumnFilter', filterParams }],
                rowData: [{ age: 5 }, { age: 50 }],
            });
            await ColumnFilterHarness.open(api, 'age');
            expect(document.querySelector('.ag-filter-menu .ag-filter-body input[type="number"]')).not.toBeNull();
            await new FilterDom(api, `default children of ${JSON.stringify(filterParams)}`, {
                colId: 'age',
            }).checkFilterDom(`
                COLUMN FILTER (multi)
                [simple]
                operator: "Equals"
                input: "" ⟨Filter...⟩
                [set]
                mini-filter: ""
                ☑ (Select All)
                ☑ 5
                ☑ 50
                model: null
            `);
            gridsManager.reset();
        }
    });

    test('default filters render text + set together; both must pass (AND)', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'name',
                    filter: 'agMultiColumnFilter',
                    filterParams: {
                        filters: [
                            { filter: 'agTextColumnFilter', filterParams: { debounceMs: 0, maxNumConditions: 1 } },
                            { filter: 'agSetColumnFilter' },
                        ],
                    },
                },
            ],
            rowData: ROWS,
        });

        const filter = await ColumnFilterHarness.open(api, 'name');

        // Both sub-filters render inline in the one popup: a text condition and a set list.
        const popup = document.querySelector('.ag-filter-menu')!;
        expect(popup.querySelector('.ag-filter-body input[type="text"]')).not.toBeNull();
        expect(popup.querySelector('.ag-set-filter-list')).not.toBeNull();

        // Drive sub-filter 0 (text): contains 'mich' — keeps michael + michelle.
        await filter.selectOperator('Contains', 0);
        await filter.setText('mich', 0);
        await asyncSetTimeout(0);
        expect(filter.getModel()).toEqual({
            filterType: 'multi',
            filterModels: [{ filterType: 'text', type: 'contains', filter: 'mich' }, null],
        });
        await new GridRows(api, 'text sub-filter only rows').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 name:"michael"
            └── LEAF id:1 name:"michelle"
        `);

        // Drive sub-filter 1 (set): the set list is NOT narrowed by the sibling text sub-filter — it
        // still lists every column value, so deselecting michelle leaves the other three keys selected.
        await filter.toggleSetItem('michelle');
        await asyncSetTimeout(0);
        expect(filter.getModel()).toEqual({
            filterType: 'multi',
            filterModels: [
                { filterType: 'text', type: 'contains', filter: 'mich' },
                { filterType: 'set', values: ['alice', 'bob', 'michael'] },
            ],
        });
        await new FilterDom(api, 'text AND set panel', { colId: 'name' }).checkFilterDom(`
            COLUMN FILTER (multi)
            [simple]
            operator: "Contains"
            input: "mich"
            [set]
            mini-filter: ""
            ▪ (Select All)
            ☑ michael
            ☐ michelle
            model:
              filterType: "multi"
              filterModels:
                - filterType: "text"
                  type: "contains"
                  filter: "mich"
                - values:
                    - "alice"
                    - "bob"
                    - "michael"
                  filterType: "set"
        `);
        // AND: text-contains-'mich' AND set-in-[alice,bob,michael] ⇒ only michael survives.
        await new GridRows(api, 'text AND set rows').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 name:"michael"
        `);
    });

    test('applying set sub-filter first then text sub-filter still ANDs across both', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'name',
                    filter: 'agMultiColumnFilter',
                    filterParams: {
                        filters: [
                            { filter: 'agTextColumnFilter', filterParams: { debounceMs: 0, maxNumConditions: 1 } },
                            { filter: 'agSetColumnFilter' },
                        ],
                    },
                },
            ],
            rowData: ROWS,
        });

        const filter = await ColumnFilterHarness.open(api, 'name');

        // Sub-filter 1 (set) first: keep only michael + michelle.
        await filter.toggleSetItem('bob');
        await filter.toggleSetItem('alice');
        await asyncSetTimeout(0);
        expect(filter.getModel()).toEqual({
            filterType: 'multi',
            filterModels: [null, { filterType: 'set', values: ['michael', 'michelle'] }],
        });
        await new GridRows(api, 'set sub-filter only rows').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 name:"michael"
            └── LEAF id:1 name:"michelle"
        `);

        // Sub-filter 0 (text) second: contains 'chelle' narrows the set survivors to michelle.
        await filter.selectOperator('Contains', 0);
        await filter.setText('chelle', 0);
        await asyncSetTimeout(0);
        expect(filter.getModel()).toEqual({
            filterType: 'multi',
            filterModels: [
                { filterType: 'text', type: 'contains', filter: 'chelle' },
                { filterType: 'set', values: ['michael', 'michelle'] },
            ],
        });
        await new GridRows(api, 'set then text rows').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:1 name:"michelle"
        `);
    });

    test('a model set before the rows arrive and cleared after is not what the rebuilt filter starts with', async () => {
        const api: GridApi = gridsManager.createGrid('grid1', {
            columnDefs: [
                {
                    field: 'name',
                    filter: 'agMultiColumnFilter',
                    filterParams: { filters: [{ filter: 'agTextColumnFilter' }] },
                },
            ],
            rowData: [],
        });
        await asyncSetTimeout(0);
        void api.setColumnFilterModel('name', {
            filterType: 'multi',
            filterModels: [{ filterType: 'text', type: 'contains', filter: 'mich' }],
        });
        api.setGridOption('rowData', ROWS);
        await asyncSetTimeout(0);
        await api.setColumnFilterModel('name', null);
        api.onFilterChanged();
        api.destroyFilter('name');
        await asyncSetTimeout(0);
        expect((await api.getColumnFilterInstance('name'))!.getModel()).toBeNull();
    });

    test("without filter handlers, a Multi Filter instance's own model methods set, read and test its column's model", async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'name',
                    filter: 'agMultiColumnFilter',
                    filterParams: { filters: [{ filter: 'agTextColumnFilter' }] },
                },
            ],
            rowData: ROWS,
        });
        const model = {
            filterType: 'multi',
            filterModels: [{ filterType: 'text', type: 'contains', filter: 'mich' }],
        };
        const instance = (await api.getColumnFilterInstance<IFilterComp>('name'))!;
        await instance.setModel(model);
        api.onFilterChanged();
        await asyncSetTimeout(0);
        const nodes = [api.getRowNode('0')!, api.getRowNode('2')!];
        expect({
            columnModel: api.getColumnFilterModel('name'),
            displayed: api.getDisplayedRowCount(),
            instanceModel: instance.getModel(),
            active: instance.isFilterActive(),
            passes: nodes.map((node) => instance.doesFilterPass({ node, data: node.data })),
        }).toEqual({
            columnModel: model,
            displayed: 2,
            instanceModel: model,
            active: true,
            passes: [true, false],
        });
    });

    test.each([
        [
            "paired with the application's doesFilterPass",
            {
                filter: {
                    component: 'agTextColumnFilter',
                    doesFilterPass: ({ node, handlerParams }: DoesFilterPassParams) =>
                        handlerParams.getValue(node) === 'bob',
                },
            },
            [false, true],
        ],
        // the child's own value getter, not the column's: every row reads as 'michael'
        [
            'with its own filterValueGetter',
            { filter: 'agTextColumnFilter', filterValueGetter: () => 'michael' },
            [true, true],
        ],
    ])(
        'with filter handlers, a deprecated doesFilterPass on a Multi Filter child %s tests rows as the grid does',
        async (_, child, expectedPasses) => {
            enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [283] });
            const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
            try {
                const api: GridApi = await gridsManager.createGridAndWait(
                    'grid1',
                    {
                        enableFilterHandlers: true,
                        columnDefs: [
                            { field: 'name', filter: 'agMultiColumnFilter', filterParams: { filters: [child] } },
                        ],
                        rowData: ROWS,
                    },
                    { modules: [CustomFilterModule] }
                );
                await api.setColumnFilterModel('name', { filterType: 'multi', filterModels: [TEXT_MICH] });
                api.onFilterChanged();
                await asyncSetTimeout(0);
                const instance = (await api.getColumnFilterInstance<IMultiFilter>('name'))!.getChildFilterInstance(0)!;
                const nodes = [api.getRowNode('0')!, api.getRowNode('2')!];
                expect({
                    displayed: api.getDisplayedRowCount(),
                    passes: nodes.map((node) => instance.doesFilterPass({ node, data: node.data })),
                }).toEqual({
                    displayed: expectedPasses[0] ? ROWS.length : 1,
                    passes: expectedPasses,
                });
            } finally {
                warn.mockRestore();
            }
        }
    );

    test.each([false, true])(
        "with enableFilterHandlers %s, a Multi Filter child's deprecated doesFilterPass tests rows by the child's model, also once the filter is destroyed",
        async (enableFilterHandlers) => {
            enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [283] });
            const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
            try {
                const api: GridApi = await gridsManager.createGridAndWait('grid1', {
                    enableFilterHandlers,
                    columnDefs: [
                        {
                            field: 'name',
                            filter: 'agMultiColumnFilter',
                            filterParams: {
                                filters: [{ filter: 'agTextColumnFilter' }, { filter: 'agSetColumnFilter' }],
                            },
                        },
                    ],
                    rowData: ROWS,
                });
                await api.setColumnFilterModel('name', {
                    filterType: 'multi',
                    filterModels: [{ filterType: 'text', type: 'equals', filter: 'bob' }, null],
                });
                api.onFilterChanged();
                await asyncSetTimeout(0);
                const child = (await api.getColumnFilterInstance<IMultiFilter>('name'))!.getChildFilterInstance(0)!;
                const nodes = [api.getRowNode('0')!, api.getRowNode('2')!];
                const passes = () => nodes.map((node) => child.doesFilterPass({ node, data: node.data }));
                const beforeDestroy = passes();
                api.destroyFilter('name');
                await asyncSetTimeout(0);
                expect({ beforeDestroy, afterDestroy: passes() }).toEqual({
                    beforeDestroy: [false, true],
                    afterDestroy: [false, true],
                });
            } finally {
                warn.mockRestore();
            }
        }
    );

    test.each([false, true])(
        'with enableFilterHandlers %s, an open Multi Filter whose Number child is given an option it lacks shows no model, as it applies none',
        async (enableFilterHandlers) => {
            const api: GridApi = await gridsManager.createGridAndWait('grid1', {
                enableFilterHandlers,
                columnDefs: [
                    {
                        field: 'age',
                        filter: 'agMultiColumnFilter',
                        filterParams: {
                            filters: [{ filter: 'agNumberColumnFilter' }, { filter: 'agSetColumnFilter' }],
                        },
                    },
                ],
                rowData: ROWS,
            });
            const filter = await ColumnFilterHarness.open(api, 'age');

            await api.setColumnFilterModel('age', {
                filterType: 'multi',
                filterModels: [{ filterType: 'number', type: 'banana', filter: 30 }, null],
            });
            api.onFilterChanged();
            await asyncSetTimeout(0);

            expect({
                model: api.getColumnFilterModel('age'),
                displayed: api.getDisplayedRowCount(),
                input: filter.input('number').value,
            }).toEqual({ model: null, displayed: 4, input: '' });
        }
    );

    describe('a model its children cannot apply', () => {
        const bob = { filterType: 'text', type: 'equals', filter: 'bob' };
        const underTwenty = { filterType: 'number', type: 'lessThan', filter: 20 };
        // the default children: a Text Filter, then a Set Filter
        const shapes: [string, unknown, unknown, number][] = [
            ["another filter's model", bob, null, 4],
            ['null filterModels', { filterType: 'multi', filterModels: null }, null, 4],
            ['every child model null', { filterType: 'multi', filterModels: [null, null] }, null, 4],
            [
                'a Set child model of another shape beside a valid Text one',
                { filterType: 'multi', filterModels: [bob, underTwenty] },
                { filterType: 'multi', filterModels: [bob, null] },
                1,
            ],
            ['only a Set child model of another shape', { filterType: 'multi', filterModels: [null, bob] }, null, 4],
        ];
        const cases = shapes.flatMap(([shape, model, kept, displayed]) =>
            ['setColumnFilterModel', 'the initial state'].flatMap((entry) =>
                [false, true].map((enableFilterHandlers) => ({
                    shape,
                    entry,
                    enableFilterHandlers,
                    model,
                    kept,
                    displayed,
                }))
            )
        );

        test.each(cases)(
            'given $shape through $entry, with enableFilterHandlers $enableFilterHandlers, keeps only what its children apply',
            async ({ entry, enableFilterHandlers, model, kept, displayed }) => {
                const fromState = entry === 'the initial state';
                const api: GridApi = await gridsManager.createGridAndWait('grid1', {
                    enableFilterHandlers,
                    columnDefs: [{ field: 'name', filter: 'agMultiColumnFilter', floatingFilter: true }],
                    rowData: ROWS,
                    initialState: fromState ? { filter: { filterModel: { name: model } } } : undefined,
                });
                if (!fromState) {
                    await api.setColumnFilterModel('name', model);
                    api.onFilterChanged();
                }
                await asyncSetTimeout(0);

                expect({
                    model: api.getFilterModel(),
                    displayed: api.getDisplayedRowCount(),
                    floating: visibleFloatingKind(),
                    floatingValue: visibleFloatingChild().querySelector('input')?.value,
                }).toEqual({
                    model: kept ? { name: kept } : {},
                    displayed,
                    floating: 'text',
                    floatingValue: kept ? 'bob' : '',
                });
            }
        );

        const orders: [string, unknown, unknown[], unknown[]][] = [
            ['Text first', undefined, [bob, underTwenty], [bob, null]],
            [
                'Set first',
                { filters: [{ filter: 'agSetColumnFilter' }, { filter: 'agTextColumnFilter' }] },
                [underTwenty, bob],
                [null, bob],
            ],
        ];
        const orderCases = orders.flatMap(([order, filterParams, filterModels, keptModels]) =>
            ['setColumnFilterModel', 'the initial state'].flatMap((entry) =>
                [false, true].map((enableFilterHandlers) => ({
                    order,
                    entry,
                    enableFilterHandlers,
                    filterParams,
                    filterModels,
                    keptModels,
                }))
            )
        );

        test.each(orderCases)(
            'with its children $order, a Set child model of another shape given through $entry, with enableFilterHandlers $enableFilterHandlers, leaves the Text model applied and shown',
            async ({ entry, enableFilterHandlers, filterParams, filterModels, keptModels }) => {
                const model = { filterType: 'multi', filterModels };
                const fromState = entry === 'the initial state';
                const api: GridApi = await gridsManager.createGridAndWait('grid1', {
                    enableFilterHandlers,
                    columnDefs: [{ field: 'name', filter: 'agMultiColumnFilter', floatingFilter: true, filterParams }],
                    rowData: ROWS,
                    initialState: fromState ? { filter: { filterModel: { name: model } } } : undefined,
                });
                if (!fromState) {
                    await api.setColumnFilterModel('name', model);
                    api.onFilterChanged();
                }
                await asyncSetTimeout(0);

                expect({
                    model: api.getFilterModel(),
                    displayed: api.getDisplayedRowCount(),
                    floating: visibleFloatingKind(),
                    floatingValue: visibleFloatingChild().querySelector('input')?.value,
                }).toEqual({
                    model: { name: { filterType: 'multi', filterModels: keptModels } },
                    displayed: 1,
                    floating: 'text',
                    floatingValue: 'bob',
                });
            }
        );
    });

    test('setColumnFilterModel round-trips a combined model into both sub-filters', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'name',
                    filter: 'agMultiColumnFilter',
                    filterParams: {
                        filters: [
                            { filter: 'agTextColumnFilter', filterParams: { debounceMs: 0, maxNumConditions: 1 } },
                            { filter: 'agSetColumnFilter' },
                        ],
                    },
                },
            ],
            rowData: ROWS,
        });

        const combined = {
            filterType: 'multi' as const,
            filterModels: [
                { filterType: 'text', type: 'contains', filter: 'mich' },
                { filterType: 'set', values: ['michael'] },
            ],
        };
        await api.setColumnFilterModel('name', combined);
        api.onFilterChanged();
        await asyncSetTimeout(0);

        expect(api.getColumnFilterModel('name')).toEqual(combined);
        await new GridRows(api, 'combined round-trip rows').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 name:"michael"
        `);

        // The programmatic model must drive both sub-filter UIs: text input carries 'mich'…
        await ColumnFilterHarness.open(api, 'name');
        const textInput = document
            .querySelector('.ag-filter-menu')!
            .querySelector<HTMLInputElement>('.ag-filter-body input[type="text"]:not([disabled])');
        expect(textInput?.value).toBe('mich');
        // …and the set list shows only michael checked (FilterDom renders the set sub-list + full model).
        await new FilterDom(api, 'combined round-trip panel', { colId: 'name' }).checkFilterDom(`
            COLUMN FILTER (multi)
            [simple]
            operator: "Contains"
            input: "mich"
            [set]
            mini-filter: ""
            ▪ (Select All)
            ☑ michael
            ☐ michelle
            model:
              filterType: "multi"
              filterModels:
                - filterType: "text"
                  type: "contains"
                  filter: "mich"
                - filterType: "set"
                  values:
                    - "michael"
        `);
    });

    test('custom filters[]: two text filters combine with AND', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'name',
                    filter: 'agMultiColumnFilter',
                    filterParams: {
                        filters: [
                            { filter: 'agTextColumnFilter', filterParams: { debounceMs: 0, maxNumConditions: 1 } },
                            { filter: 'agTextColumnFilter', filterParams: { debounceMs: 0, maxNumConditions: 1 } },
                        ],
                    },
                },
            ],
            rowData: [{ name: 'alice' }, { name: 'albert' }, { name: 'annie' }, { name: 'bob' }],
        });

        const filter = await ColumnFilterHarness.open(api, 'name');
        // Two selects / two bodies — one per sub-filter (each maxNumConditions:1).
        await filter.selectOperator('Begins with', 0);
        await filter.setText('a', 0);
        await asyncSetTimeout(0);
        await filter.selectOperator('Ends with', 1);
        await filter.setText('e', 1);
        await asyncSetTimeout(0);

        expect(filter.getModel()).toEqual({
            filterType: 'multi',
            filterModels: [
                { filterType: 'text', type: 'startsWith', filter: 'a' },
                { filterType: 'text', type: 'endsWith', filter: 'e' },
            ],
        });
        // startsWith 'a' AND endsWith 'e' ⇒ alice, annie.
        await new GridRows(api, 'two text filters rows').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 name:"alice"
            └── LEAF id:2 name:"annie"
        `);
    });

    test('custom filters[]: number + set filters combine with AND', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'age',
                    filter: 'agMultiColumnFilter',
                    filterParams: {
                        filters: [
                            { filter: 'agNumberColumnFilter', filterParams: { debounceMs: 0, maxNumConditions: 1 } },
                            { filter: 'agSetColumnFilter' },
                        ],
                    },
                },
            ],
            rowData: ROWS,
        });

        const filter = await ColumnFilterHarness.open(api, 'age');

        // Sub-filter 0 (number): greater than 28 ⇒ 30, 40, 35.
        await filter.selectOperator('Greater than', 0);
        await filter.setNumber(28, 0);
        await asyncSetTimeout(0);
        expect(filter.getModel()).toEqual({
            filterType: 'multi',
            filterModels: [{ filterType: 'number', type: 'greaterThan', filter: 28 }, null],
        });
        await new GridRows(api, 'number sub-filter only rows').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 age:30
            ├── LEAF id:2 age:40
            └── LEAF id:3 age:35
        `);

        // Sub-filter 1 (set): the list still shows every age key; dropping 40 leaves [25,30,35].
        await filter.toggleSetItem('40');
        await asyncSetTimeout(0);
        expect(filter.getModel()).toEqual({
            filterType: 'multi',
            filterModels: [
                { filterType: 'number', type: 'greaterThan', filter: 28 },
                { filterType: 'set', values: ['25', '30', '35'] },
            ],
        });
        // AND: age>28 AND set-in-[25,30,35] ⇒ michael(30) + alice(35).
        await new GridRows(api, 'number AND set rows').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 age:30
            └── LEAF id:3 age:35
        `);
    });

    test('floating filter reflects the active sub-filter', async () => {
        const api: GridApi = await createFloatingGrid(gridsManager);

        // Nothing active ⇒ the first (text) sub-floating-filter is shown.
        expect(visibleFloatingKind()).toBe('text');
        expect(visibleFloatingInput().value).toBe('');

        // Activate only the set sub-filter ⇒ the read-only set sub-floating-filter takes over.
        await api.setColumnFilterModel('name', {
            filterType: 'multi',
            filterModels: [null, { filterType: 'set', values: ['michael'] }],
        });
        api.onFilterChanged();
        await asyncSetTimeout(0);
        expect(visibleFloatingKind()).toBe('set');
        expect(visibleFloatingInput().value).toBe('(1) michael');
        await new GridRows(api, 'floating set-active rows').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 name:"michael"
        `);

        // Switch to only the text sub-filter active ⇒ the text sub-floating-filter returns.
        await api.setColumnFilterModel('name', {
            filterType: 'multi',
            filterModels: [{ filterType: 'text', type: 'contains', filter: 'bob' }, null],
        });
        api.onFilterChanged();
        await asyncSetTimeout(0);
        expect(visibleFloatingKind()).toBe('text');
        expect(visibleFloatingInput().value).toBe('bob');
        await new GridRows(api, 'floating text-active rows').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:2 name:"bob"
        `);
    });

    test("a child using the default filter, a text filter, gets the text floating filter, not the column's default", async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'name',
                    floatingFilter: true,
                    filter: 'agMultiColumnFilter',
                    filterParams: { filters: [{ filter: true }, { filter: 'agSetColumnFilter' }] },
                },
            ],
            rowData: ROWS,
        });
        await api.setColumnFilterModel('name', {
            filterType: 'multi',
            filterModels: [{ filterType: 'text', type: 'contains', filter: 'bob' }, null],
        });
        api.onFilterChanged();
        await asyncSetTimeout(0);

        expect(visibleFloatingKind()).toBe('text');
        expect(visibleFloatingInput().value).toBe('bob');
    });

    test('readOnly sub-filter renders a disabled floating filter that still reflects the model', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'name',
                    filter: 'agMultiColumnFilter',
                    floatingFilter: true,
                    filterParams: {
                        filters: [
                            {
                                filter: 'agTextColumnFilter',
                                filterParams: { debounceMs: 0, maxNumConditions: 1, readOnly: true },
                            },
                            { filter: 'agSetColumnFilter' },
                        ],
                    },
                },
            ],
            rowData: ROWS,
        });

        const input = visibleFloatingInput();
        expect(visibleFloatingKind()).toBe('text');
        // readOnly ⇒ the floating input is disabled (cannot type), but the model still drives it.
        expect(input.disabled).toBe(true);

        await api.setColumnFilterModel('name', {
            filterType: 'multi',
            filterModels: [{ filterType: 'text', type: 'contains', filter: 'mich' }, null],
        });
        api.onFilterChanged();
        await asyncSetTimeout(0);

        expect(visibleFloatingInput().value).toBe('mich');
        expect(visibleFloatingInput().disabled).toBe(true);
        await new GridRows(api, 'readOnly floating rows').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 name:"michael"
            └── LEAF id:1 name:"michelle"
        `);
    });

    describe.each([false, true])('display styles, with enableFilterHandlers %s', (enableFilterHandlers) => {
        const displayStyleCols: ColDef[] = [
            {
                field: 'name',
                filter: 'agMultiColumnFilter',
                filterParams: {
                    filters: [
                        { filter: 'agTextColumnFilter', display: 'subMenu', filterParams: { debounceMs: 0 } },
                        { filter: 'agSetColumnFilter', display: 'accordion', title: 'Pick names' },
                    ],
                },
            },
        ];
        const multiFilterIn = (api: GridApi, container: string) =>
            getGridElement(api)!.querySelector<HTMLElement>(`${container} .ag-multi-filter`)!;

        test('a sub-menu child shows as a menu item titled by its filter, whose sub-menu holds a filter that filters the rows', async () => {
            const api: GridApi = await gridsManager.createGridAndWait('grid1', {
                enableFilterHandlers,
                columnDefs: displayStyleCols,
                rowData: ROWS,
            });
            await ColumnFilterHarness.open(api, 'name');
            const multiFilter = multiFilterIn(api, '.ag-filter-menu');
            const menuItem = multiFilter.querySelector<HTMLElement>('.ag-multi-filter-menu-item')!;
            expect({
                title: menuItem.textContent!.trim(),
                inlineTextInputs: multiFilter.querySelectorAll('.ag-filter-body input[type="text"]').length,
            }).toEqual({ title: 'Text Filter', inlineTextInputs: 0 });

            menuItem.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
            const input = await waitFor(() => {
                const subMenu = getGridElement(api)!.querySelector('.ag-menu.ag-popup-child:not(.ag-filter-menu)')!;
                return subMenu.querySelector<HTMLInputElement>('.ag-filter-body input[type="text"]')!;
            });
            input.value = 'mich';
            input.dispatchEvent(new Event('input', { bubbles: true }));

            await waitFor(() =>
                expect(api.getFilterModel()).toEqual({
                    name: {
                        filterType: 'multi',
                        filterModels: [{ filterType: 'text', type: 'contains', filter: 'mich' }, null],
                    },
                })
            );
            await new GridRows(api, 'text child filtering from its sub-menu').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 name:"michael"
                └── LEAF id:1 name:"michelle"
            `);
        });

        test('an accordion child shows collapsed under its title until expanded', async () => {
            const api: GridApi = await gridsManager.createGridAndWait('grid1', {
                enableFilterHandlers,
                columnDefs: displayStyleCols,
                rowData: ROWS,
            });
            await ColumnFilterHarness.open(api, 'name');
            const group = multiFilterIn(api, '.ag-filter-menu').querySelector<HTMLElement>('.ag-multi-filter-group')!;
            const isExpanded = () =>
                !group.querySelector('.ag-multi-filter-group-container')!.classList.contains('ag-hidden');
            expect({
                title: group.querySelector('.ag-multi-filter-group-title')!.textContent,
                expanded: isExpanded(),
            }).toEqual({ title: 'Pick names', expanded: false });

            group.querySelector<HTMLElement>('.ag-multi-filter-group-title-bar')!.click();
            expect(isExpanded()).toBe(true);
            expect(
                Array.from(group.querySelectorAll('.ag-set-filter-item .ag-checkbox-label')).map((e) => e.textContent)
            ).toEqual(['(Select All)', 'alice', 'bob', 'michael', 'michelle']);
        });

        test('in the filters tool panel, a sub-menu child shows as an accordion', async () => {
            const api: GridApi = await gridsManager.createGridAndWait('grid1', {
                enableFilterHandlers,
                columnDefs: displayStyleCols,
                rowData: ROWS,
                sideBar: FILTERS_SIDEBAR,
            });
            const panel = await openFiltersPanel(api);
            await panel.expandGroup('Name');
            const multiFilter = multiFilterIn(api, '.ag-filter-toolpanel');
            expect({
                menuItems: multiFilter.querySelectorAll('.ag-multi-filter-menu-item').length,
                groups: Array.from(multiFilter.querySelectorAll('.ag-multi-filter-group-title')).map(
                    (e) => e.textContent
                ),
            }).toEqual({ menuItems: 0, groups: ['Text Filter', 'Pick names'] });
        });
    });

    // The documented custom-child form (filter-multi/custom-filter): a fresh wrapper object each time the
    // colDefs are rebuilt, around a stable component and doesFilterPass.
    test('an object-form child rebuilt inline is not treated as a different child', async () => {
        const doesFilterPass = () => true;
        const objectFormChild = () => ({ filter: { component: 'agTextColumnFilter', doesFilterPass } });
        const colDefs = () => [
            {
                field: 'name',
                filter: 'agMultiColumnFilter',
                filterParams: { filters: [objectFormChild(), { filter: 'agSetColumnFilter' }] },
            },
        ];

        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            enableFilterHandlers: true,
            columnDefs: colDefs(),
            rowData: ROWS,
        });

        await api.setColumnFilterModel('name', {
            filterType: 'multi',
            filterModels: [null, { filterType: 'set', values: ['bob'] }],
        });
        api.onFilterChanged();
        await asyncSetTimeout(0);
        await new GridRows(api, 'object-form child, set model applied').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:2 name:"bob"
        `);

        api.setGridOption('columnDefs', colDefs());
        await asyncSetTimeout(0);

        expect(api.getColumnFilterModel('name')).toEqual({
            filterType: 'multi',
            filterModels: [null, { filterType: 'set', values: ['bob'] }],
        });
        await new GridRows(api, 'object-form child survives a colDef rebuild').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:2 name:"bob"
        `);
    });

    test("a child with an empty filter value getter reads through the Multi Filter's, with and without filter handlers or an object data type", async () => {
        for (const enableFilterHandlers of [true, false]) {
            for (const cellDataType of ['text', 'object']) {
                const api: GridApi = await gridsManager.createGridAndWait(
                    `grid-${enableFilterHandlers}-${cellDataType}`,
                    {
                        enableFilterHandlers,
                        columnDefs: [
                            {
                                field: 'name',
                                cellDataType,
                                valueFormatter: ({ value }) => value,
                                filterValueGetter: ({ data }) => `${data.name}!`,
                                filter: 'agMultiColumnFilter',
                                filterParams: {
                                    filters: [
                                        { filter: 'agTextColumnFilter', filterValueGetter: '' },
                                        { filter: 'agSetColumnFilter', filterValueGetter: '' },
                                    ],
                                },
                            },
                        ],
                        rowData: ROWS,
                    }
                );
                const filterBy = async (filterModels: (object | null)[]) => {
                    await api.setColumnFilterModel('name', { filterType: 'multi', filterModels });
                    api.onFilterChanged();
                    await asyncSetTimeout(0);
                    await new GridRows(api, `empty child getter, handlers ${enableFilterHandlers}, ${cellDataType}`)
                        .check(`
                            ROOT id:ROOT_NODE_ID
                            └── LEAF id:2 name:"bob"
                        `);
                };
                await filterBy([{ filterType: 'text', type: 'equals', filter: 'bob!' }, null]);
                await filterBy([null, { filterType: 'set', values: ['bob!'] }]);
            }
        }
    });

    test("a child with its own filter value getter reads another column as that column's value", async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            enableFilterHandlers: true,
            columnDefs: [
                {
                    field: 'name',
                    filter: 'agMultiColumnFilter',
                    filterParams: {
                        filters: [
                            {
                                filter: {
                                    component: 'agTextColumnFilter',
                                    doesFilterPass: ({ node, handlerParams }: DoesFilterPassParams) =>
                                        handlerParams.getValue(node, 'team') === 'red',
                                },
                                filterValueGetter: () => 'the child reads this',
                            },
                        ],
                    },
                },
                { field: 'team' },
            ],
            rowData: [
                { name: 'bob', team: 'red' },
                { name: 'alice', team: 'blue' },
            ],
        });

        await api.setColumnFilterModel('name', {
            filterType: 'multi',
            filterModels: [{ filterType: 'text', type: 'contains', filter: 'any' }],
        });
        api.onFilterChanged();
        await asyncSetTimeout(0);

        await new GridRows(api, 'child reads the other column').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 name:"bob" team:"red"
        `);
    });

    test('a set child refusing new params stops the Multi Filter refreshing the children after it', async () => {
        const refreshSources: string[] = [];
        const recordingHandler = () => ({
            doesFilterPass: () => true,
            refresh: ({ source }: { source: string }) => {
                refreshSources.push(source);
            },
        });
        const cols = (caseSensitive: boolean) => [
            {
                field: 'name',
                filter: 'agMultiColumnFilter',
                filterParams: {
                    filters: [
                        { filter: 'agSetColumnFilter', filterParams: { caseSensitive } },
                        { filter: { component: 'agTextColumnFilter', handler: recordingHandler } },
                    ],
                },
            },
        ];
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            enableFilterHandlers: true,
            columnDefs: cols(false),
            rowData: ROWS,
        });
        await api.setColumnFilterModel('name', {
            filterType: 'multi',
            filterModels: [{ filterType: 'set', values: ['bob'] }, null],
        });
        api.onFilterChanged();
        await asyncSetTimeout(0);

        // the recorder does see a column definition the set child accepts
        api.setGridOption('columnDefs', cols(false));
        await asyncSetTimeout(0);
        expect(refreshSources).toContain('colDef');
        refreshSources.length = 0;

        api.setGridOption('columnDefs', cols(true));
        await asyncSetTimeout(0);

        expect(api.getColumnFilterModel('name')).toBeNull();
        expect(refreshSources).not.toContain('colDef');
    });

    test("a values callback, a Multi Filter child's or a Set Filter's own, is not called again when unchanged column definitions are set back, with or without filter handlers", async () => {
        for (const enableFilterHandlers of [false, true]) {
            const calls = { multi: 0, set: 0 };
            const values = (colId: keyof typeof calls) => (params: { success: (values: string[]) => void }) => {
                calls[colId]++;
                params.success(['bob', 'alice']);
            };
            const api: GridApi = await gridsManager.createGridAndWait(`grid-${enableFilterHandlers}`, {
                enableFilterHandlers,
                columnDefs: [
                    {
                        colId: 'multi',
                        field: 'name',
                        filter: 'agMultiColumnFilter',
                        filterParams: {
                            filters: [
                                { filter: 'agTextColumnFilter' },
                                { filter: 'agSetColumnFilter', filterParams: { values: values('multi') } },
                            ],
                        },
                    },
                    {
                        colId: 'set',
                        field: 'name',
                        filter: 'agSetColumnFilter',
                        filterParams: { values: values('set') },
                    },
                ],
                rowData: ROWS,
            });
            for (const colId of ['multi', 'set']) {
                await ColumnFilterHarness.open(api, colId);
                api.hidePopupMenu();
            }
            const loaded = { ...calls };
            expect({ enableFilterHandlers, loaded }).toEqual({ enableFilterHandlers, loaded: { multi: 1, set: 1 } });

            for (let i = 0; i < 2; ++i) {
                api.setGridOption('columnDefs', api.getColumnDefs()!);
                await asyncSetTimeout(0);
            }

            expect({ enableFilterHandlers, calls }).toEqual({ enableFilterHandlers, calls: loaded });
        }
    });

    test("a child filter component with its own filter value getter reads another column as that column's value", async () => {
        let childParams: IFilterParams | undefined;
        class ProbeFilter implements IFilterComp {
            public init(params: IFilterParams): void {
                childParams = params;
            }
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
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'name',
                    filter: 'agMultiColumnFilter',
                    filterParams: {
                        filters: [{ filter: ProbeFilter, filterValueGetter: () => 'the child reads this' }],
                    },
                },
                { field: 'team' },
            ],
            rowData: [{ name: 'bob', team: 'red' }],
        });
        await api.getColumnFilterInstance('name');
        const node = api.getRowNode('0')!;

        expect([childParams!.getValue(node), childParams!.getValue(node, 'team')]).toEqual([
            'the child reads this',
            'red',
        ]);
    });

    test.each([false, true])(
        'with enableFilterHandlers %s, a child filter component without isFilterActive filters nothing, is reported, and never throws',
        async (enableFilterHandlers) => {
            // with filter handlers, a custom child also reports the column's missing handler (#277)
            enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: enableFilterHandlers ? [67, 277] : [67] });
            const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
            class NoActiveStateFilter implements Omit<IFilterComp, 'isFilterActive'> {
                private model: string | null = null;
                public init(): void {}
                public getGui(): HTMLElement {
                    return document.createElement('div');
                }
                public doesFilterPass(): boolean {
                    return false;
                }
                public getModel(): string | null {
                    return this.model;
                }
                public setModel(model: string | null): void {
                    this.model = model;
                }
            }
            const api: GridApi = await gridsManager.createGridAndWait('grid1', {
                enableFilterHandlers,
                columnDefs: [
                    {
                        field: 'name',
                        filter: 'agMultiColumnFilter',
                        filterParams: { filters: [{ filter: 'agTextColumnFilter' }, { filter: NoActiveStateFilter }] },
                    },
                ],
                rowData: ROWS,
            });
            const errors: string[] = [];
            let filtered: { active: boolean | undefined; displayed: number } | undefined;
            try {
                await api.setColumnFilterModel('name', { filterType: 'multi', filterModels: [null, 'x'] });
                api.onFilterChanged();
                await asyncSetTimeout(0);
                filtered = { active: api.getColumn('name')?.isFilterActive(), displayed: api.getDisplayedRowCount() };
                api.destroyFilter('name');
                await asyncSetTimeout(0);
            } catch (e) {
                errors.push(String(e));
            }

            // With handlers, the child has no handler (#277): its model is kept and filters nothing.
            const warning = enableFilterHandlers ? 'warning #277' : 'warning #67';
            expect({
                errors,
                warned: warnSpy.mock.calls.flat().join(' ').includes(warning),
                filtered,
            }).toEqual({
                errors: [],
                warned: true,
                filtered: { active: enableFilterHandlers, displayed: ROWS.length },
            });
        }
    );

    test('without filter handlers, an active child filter component filters the rows and reports its model', async () => {
        class NameFilter implements IFilterComp {
            private model: string | null = null;
            public init(): void {}
            public getGui(): HTMLElement {
                return document.createElement('div');
            }
            public isFilterActive(): boolean {
                return this.model != null;
            }
            public doesFilterPass(params: IDoesFilterPassParams): boolean {
                return params.data.name === this.model;
            }
            public getModel(): string | null {
                return this.model;
            }
            public setModel(model: string | null): void {
                this.model = model;
            }
            public getModelAsString(model: string | null): string {
                return `named ${model}`;
            }
        }
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'name',
                    filter: 'agMultiColumnFilter',
                    filterParams: { filters: [{ filter: 'agTextColumnFilter' }, { filter: NameFilter }] },
                },
            ],
            rowData: ROWS,
        });
        const model = { filterType: 'multi', filterModels: [null, ROWS[1].name] };

        await api.setColumnFilterModel('name', model);
        api.onFilterChanged();
        await asyncSetTimeout(0);

        const multiFilter = await api.getColumnFilterInstance<IMultiFilter>('name');
        expect({
            model: api.getColumnFilterModel('name'),
            displayed: api.getDisplayedRowCount(),
            summary: multiFilter?.getModelAsString?.(model),
        }).toEqual({ model, displayed: 1, summary: `named ${ROWS[1].name}` });
    });

    describe.each([false, true])('filterParams.filters changed (enableFilterHandlers: %s)', (enableFilterHandlers) => {
        const TEXT_CHILD = { filter: 'agTextColumnFilter', filterParams: { debounceMs: 0, maxNumConditions: 1 } };

        const colDefsWith = (filters: object[], extra?: object) => [
            { field: 'name', filter: 'agMultiColumnFilter', filterParams: { filters }, ...extra },
        ];

        const numChildFilters = async (api: GridApi) =>
            ((await api.getColumnFilterInstance('name')) as { getNumChildFilters(): number }).getNumChildFilters();

        const setFilterList = () => document.querySelector('.ag-filter-menu')!.querySelector('.ag-set-filter-list');

        test('a removed child leaves the popup and stops filtering', async () => {
            const api: GridApi = await gridsManager.createGridAndWait('grid1', {
                enableFilterHandlers,
                columnDefs: colDefsWith([TEXT_CHILD, { filter: 'agSetColumnFilter' }]),
                rowData: ROWS,
            });

            await api.setColumnFilterModel('name', {
                filterType: 'multi',
                filterModels: [null, { filterType: 'set', values: ['bob'] }],
            });
            api.onFilterChanged();
            await asyncSetTimeout(0);
            await new GridRows(api, 'set child filtering to bob').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:2 name:"bob"
            `);

            api.setGridOption('columnDefs', colDefsWith([TEXT_CHILD]));
            await asyncSetTimeout(0);

            expect(await numChildFilters(api)).toBe(1);
            await new GridRows(api, 'removed set child no longer filters').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 name:"michael"
                ├── LEAF id:1 name:"michelle"
                ├── LEAF id:2 name:"bob"
                └── LEAF id:3 name:"alice"
            `);

            await ColumnFilterHarness.open(api, 'name');
            expect(setFilterList()).toBeNull();
        });

        test("a set child's key change resets a Multi Filter whose model came from the initial state", async () => {
            const setChild = (caseSensitive: boolean) => ({
                filter: 'agSetColumnFilter',
                filterParams: { caseSensitive },
            });
            const api: GridApi = await gridsManager.createGridAndWait('grid1', {
                enableFilterHandlers,
                columnDefs: colDefsWith([TEXT_CHILD, setChild(false)]),
                rowData: ROWS,
                initialState: {
                    filter: {
                        filterModel: {
                            name: { filterType: 'multi', filterModels: [null, { filterType: 'set', values: ['bob'] }] },
                        },
                    },
                },
            });
            await asyncSetTimeout(0);
            expect(api.getDisplayedRowAtIndex(0)!.data.name).toBe('bob');
            expect(api.getDisplayedRowCount()).toBe(1);

            api.setGridOption('columnDefs', colDefsWith([TEXT_CHILD, setChild(true)]));
            await asyncSetTimeout(0);

            expect(api.getColumnFilterModel('name')).toBeNull();
            expect(api.getDisplayedRowCount()).toBe(4);
        });

        test("a set child's model reconciled while it takes a new getter keeps reading through the new getter", async () => {
            const byFirst = ({ data }: { data: { first: string } }) => data.first;
            const bySecond = ({ data }: { data: { second: string } }) => data.second;
            const setChild = (filterValueGetter: typeof byFirst | typeof bySecond, values: string[]) => ({
                filter: 'agSetColumnFilter',
                filterValueGetter,
                filterParams: { values },
            });
            const api: GridApi = await gridsManager.createGridAndWait('grid1', {
                enableFilterHandlers,
                columnDefs: colDefsWith([TEXT_CHILD, setChild(byFirst, ['A', 'B', 'C'])], { field: 'first' }),
                rowData: [
                    { first: 'A', second: 'C' },
                    { first: 'C', second: 'A' },
                    { first: 'B', second: 'B' },
                ],
            });
            await api.setColumnFilterModel('first', {
                filterType: 'multi',
                filterModels: [null, { filterType: 'set', values: ['A', 'B'] }],
            });
            api.onFilterChanged();
            await asyncSetTimeout(0);
            expect(api.getDisplayedRowCount()).toBe(2);

            // the selection's B is no longer listed, so the model is reconciled during the update
            api.setGridOption(
                'columnDefs',
                colDefsWith([TEXT_CHILD, setChild(bySecond, ['A', 'C'])], { field: 'first' })
            );
            await asyncSetTimeout(0);

            expect(api.getColumnFilterModel('first')).toEqual({
                filterType: 'multi',
                filterModels: [null, { filterType: 'set', values: ['A'] }],
            });
            await new GridRows(api, 'rows whose second value is A').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:1 first:"C"
            `);
        });

        test("a set child's key change resets the Multi Filter, telling its column once within the update, while an earlier child reconciles its model in it", async () => {
            const setChild = (values: string[], caseSensitive: boolean) => ({
                filter: 'agSetColumnFilter',
                filterParams: { values, caseSensitive },
            });
            const api: GridApi = await gridsManager.createGridAndWait('grid1', {
                enableFilterHandlers,
                columnDefs: colDefsWith([setChild(['A', 'B', 'C'], false), setChild(['A', 'B', 'C'], false)]),
                rowData: [{ name: 'A' }, { name: 'B' }, { name: 'C' }, { name: 'a' }],
            });
            await api.setColumnFilterModel('name', {
                filterType: 'multi',
                filterModels: [
                    { filterType: 'set', values: ['A', 'C'] },
                    { filterType: 'set', values: ['A'] },
                ],
            });
            api.onFilterChanged();
            await asyncSetTimeout(0);
            expect(api.getDisplayedRowCount()).toBe(2);
            const seen: unknown[] = [];
            api.getColumn('name')!.addEventListener('filterChanged', () => seen.push(api.getColumnFilterModel('name')));

            // the first child's C is no longer listed, and the second child's keys change
            api.setGridOption(
                'columnDefs',
                colDefsWith([setChild(['A', 'B'], false), setChild(['A', 'B', 'C'], true)])
            );
            // within the update only: the filter change raised after it is not this update's
            expect(seen).toEqual([null]);
            await asyncSetTimeout(0);

            expect(api.getColumnFilterModel('name')).toBeNull();
            expect(api.getDisplayedRowCount()).toBe(4);
        });

        test("a set child's new case sensitivity resets the whole Multi Filter", async () => {
            const setChild = (caseSensitive: boolean) => ({
                filter: 'agSetColumnFilter',
                filterParams: { caseSensitive },
            });
            const api: GridApi = await gridsManager.createGridAndWait('grid1', {
                enableFilterHandlers,
                columnDefs: colDefsWith([TEXT_CHILD, setChild(false)]),
                rowData: ROWS,
            });

            await api.setColumnFilterModel('name', {
                filterType: 'multi',
                filterModels: [
                    { filterType: 'text', type: 'contains', filter: 'mi' },
                    { filterType: 'set', values: ['michael'] },
                ],
            });
            api.onFilterChanged();
            await asyncSetTimeout(0);
            await new GridRows(api, 'both children filtering').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 name:"michael"
            `);

            api.setGridOption('columnDefs', colDefsWith([TEXT_CHILD, setChild(true)]));
            await asyncSetTimeout(0);

            expect(api.getColumnFilterModel('name')).toBeNull();
            await new GridRows(api, 'multi filter reset').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 name:"michael"
                ├── LEAF id:1 name:"michelle"
                ├── LEAF id:2 name:"bob"
                └── LEAF id:3 name:"alice"
            `);
        });

        test("a set child's own filter value getter keeps the Multi Filter while the same and resets it when new", async () => {
            const byName = ({ data }: { data: { name: string } }) => data.name;
            const withChildGetter = (filterValueGetter: (params: { data: { name: string } }) => string) =>
                colDefsWith([TEXT_CHILD, { filter: 'agSetColumnFilter', filterValueGetter }]);
            const api: GridApi = await gridsManager.createGridAndWait('grid1', {
                enableFilterHandlers,
                columnDefs: withChildGetter(byName),
                rowData: ROWS,
            });
            const model = { filterType: 'multi', filterModels: [null, { filterType: 'set', values: ['bob'] }] };
            await api.setColumnFilterModel('name', model);
            api.onFilterChanged();
            await asyncSetTimeout(0);

            api.setGridOption('columnDefs', withChildGetter(byName));
            await asyncSetTimeout(0);
            expect(api.getColumnFilterModel('name')).toEqual(model);

            api.setGridOption(
                'columnDefs',
                withChildGetter(({ data }) => data.name)
            );
            await asyncSetTimeout(0);

            expect(api.getColumnFilterModel('name')).toBeNull();
            await new GridRows(api, "multi filter reset by the set child's getter").check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 name:"michael"
                ├── LEAF id:1 name:"michelle"
                ├── LEAF id:2 name:"bob"
                └── LEAF id:3 name:"alice"
            `);
        });

        test("a set child's open list refolds its values when only its case sensitivity changes", async () => {
            const values = ['bob', 'Bob', 'alice'];
            const setChild = (caseSensitive: boolean) => ({
                filter: 'agSetColumnFilter',
                filterParams: { values, caseSensitive },
            });
            const api: GridApi = await gridsManager.createGridAndWait('grid1', {
                enableFilterHandlers,
                columnDefs: colDefsWith([TEXT_CHILD, setChild(false)]),
                rowData: ROWS,
            });
            const filter = await ColumnFilterHarness.open(api, 'name');
            expect(filter.setFilterItemLabels()).toEqual(['(Select All)', 'alice', 'bob']);

            api.setGridOption('columnDefs', colDefsWith([TEXT_CHILD, setChild(true)]));
            await asyncSetTimeout(0);

            expect(filter.setFilterItemLabels()).toEqual(['(Select All)', 'Bob', 'alice', 'bob']);
        });

        test('a set child whose filterParams is a function keeps them through a model update and a header rename, which it is told is a column definition update', async () => {
            const sources: string[] = [];
            const setChild = {
                filter: 'agSetColumnFilter',
                filterParams: ({ source }: { source: string }) => {
                    sources.push(source);
                    return { caseSensitive: true };
                },
            };
            // without a data type, nothing replaces the function with parameters of its own
            const cols = (headerName: string) => colDefsWith([setChild], { headerName, cellDataType: false });
            const api: GridApi = await gridsManager.createGridAndWait('grid1', {
                enableFilterHandlers,
                columnDefs: cols('Name'),
                rowData: [{ name: 'bob' }, { name: 'Bob' }, { name: 'cat' }],
            });
            const model = { filterType: 'multi', filterModels: [{ filterType: 'set', values: ['bob'] }] };
            await api.setColumnFilterModel('name', model);
            api.onFilterChanged();
            await asyncSetTimeout(0);

            const callsBefore = sources.length;
            api.setGridOption('columnDefs', cols('Name renamed'));
            await asyncSetTimeout(0);

            expect(sources.length).toBeGreaterThan(callsBefore);
            expect(new Set(sources.slice(callsBefore))).toEqual(new Set(['colDef']));
            expect(api.getColumnFilterModel('name')).toEqual(model);
            await new GridRows(api, 'only the lower case bob').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 name:"bob"
            `);
        });

        test("a set child's open tree list takes its new path getter, with or without new keys", async () => {
            const byInitialThenName = (value: string | null) => (value ? [value[0], value] : null);
            const byName = (value: string | null) => (value ? [value] : null);
            const setChild = (caseSensitive: boolean, treeListPathGetter: typeof byName) => ({
                filter: 'agSetColumnFilter',
                filterParams: { caseSensitive, treeList: true, treeListPathGetter },
            });
            const api: GridApi = await gridsManager.createGridAndWait('grid1', {
                enableFilterHandlers,
                columnDefs: colDefsWith([TEXT_CHILD, setChild(false, byInitialThenName)]),
                rowData: ROWS,
            });
            const filter = await ColumnFilterHarness.open(api, 'name');
            expect(filter.setFilterItemLabels()).toEqual(['(Select All)', 'a', 'b', 'm']);

            api.setGridOption('columnDefs', colDefsWith([TEXT_CHILD, setChild(false, byName)]));
            await asyncSetTimeout(0);
            expect(filter.setFilterItemLabels()).toEqual(['(Select All)', 'alice', 'bob', 'michael', 'michelle']);

            api.setGridOption('columnDefs', colDefsWith([TEXT_CHILD, setChild(true, byInitialThenName)]));
            await asyncSetTimeout(0);
            expect(filter.setFilterItemLabels()).toEqual(['(Select All)', 'a', 'b', 'm']);
        });

        test('a set child turned into a tree list on a column that groups nothing shows the tree and keeps the filter', async () => {
            const byInitialThenName = (value: string | null) => (value ? [value[0], value] : null);
            const setChild = (treeList: boolean) => ({
                filter: 'agSetColumnFilter',
                filterParams: { treeList, treeListPathGetter: byInitialThenName },
            });
            const model = {
                filterType: 'multi',
                filterModels: [
                    { filterType: 'text', type: 'contains', filter: 'o' },
                    { filterType: 'set', values: ['alice', 'bob'] },
                ],
            };
            const api: GridApi = await gridsManager.createGridAndWait('grid1', {
                enableFilterHandlers,
                columnDefs: colDefsWith([TEXT_CHILD, setChild(false)]),
                rowData: ROWS,
            });
            await api.setColumnFilterModel('name', model);
            api.onFilterChanged();
            const filter = await ColumnFilterHarness.open(api, 'name');

            api.setGridOption('columnDefs', colDefsWith([TEXT_CHILD, setChild(true)]));
            await asyncSetTimeout(0);

            expect(api.getColumnFilterModel('name')).toEqual(model);
            await new GridRows(api, 'both children still filter').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:2 name:"bob"
            `);
            // the text child leaves only bob, under his initial
            expect(filter.setFilterItemLabels()).toEqual(['(Select All)', 'b']);
        });

        test("a set child's open list shows its new values when only its provided values change", async () => {
            const byName = ({ data }: { data: { name: string } }) => data.name;
            const setChild = (values: string[]) => ({
                filter: 'agSetColumnFilter',
                filterValueGetter: byName,
                filterParams: { values },
            });
            const api: GridApi = await gridsManager.createGridAndWait('grid1', {
                enableFilterHandlers,
                columnDefs: colDefsWith([TEXT_CHILD, setChild(['bob', 'alice'])]),
                rowData: ROWS,
            });
            const filter = await ColumnFilterHarness.open(api, 'name');
            expect(filter.setFilterItemLabels()).toEqual(['(Select All)', 'alice', 'bob']);

            api.setGridOption('columnDefs', colDefsWith([TEXT_CHILD, setChild(['michael', 'michelle'])]));
            await asyncSetTimeout(0);

            expect(filter.setFilterItemLabels()).toEqual(['(Select All)', 'michael', 'michelle']);
        });

        test("an object column's Multi Filter keeps a set child's model when only the header changes", async () => {
            const byName = ({ value }: { value: { name: string } }) => value.name;
            const objectCol = (headerName: string) => [
                {
                    field: 'person',
                    headerName,
                    cellDataType: 'object',
                    valueFormatter: byName,
                    filter: 'agMultiColumnFilter',
                    filterParams: { filters: [{ filter: 'agSetColumnFilter' }] },
                },
            ];
            const api: GridApi = await gridsManager.createGridAndWait('grid1', {
                enableFilterHandlers,
                columnDefs: objectCol('Person'),
                rowData: [{ person: { name: 'bob' } }, { person: { name: 'alice' } }],
            });
            const model = { filterType: 'multi', filterModels: [{ filterType: 'set', values: ['bob'] }] };
            await api.setColumnFilterModel('person', model);
            api.onFilterChanged();
            await asyncSetTimeout(0);
            expect(api.getDisplayedRowAtIndex(0)!.data.person.name).toBe('bob');
            expect(api.getDisplayedRowCount()).toBe(1);

            api.setGridOption('columnDefs', objectCol('Person renamed'));
            await asyncSetTimeout(0);

            expect(api.getColumnFilterModel('person')).toEqual(model);
            expect(api.getDisplayedRowCount()).toBe(1);
            expect(api.getDisplayedRowAtIndex(0)!.data.person.name).toBe('bob');
        });

        test("the column's new filter value getter, or new key creator, resets a Multi Filter with a set child", async () => {
            const setChild = {
                filter: 'agSetColumnFilter',
                filterParams: { valueFormatter: ({ value }: { value: string }) => value },
            };
            const col = (extra: ColDef) => colDefsWith([TEXT_CHILD, setChild], extra);
            const byName = ({ data }: { data: { name: string } }) => data.name;
            const asIs = ({ value }: { value: string }) => value;
            const api: GridApi = await gridsManager.createGridAndWait('grid1', {
                enableFilterHandlers,
                columnDefs: col({ filterValueGetter: byName, keyCreator: asIs }),
                rowData: ROWS,
            });
            const filterBobAndReset = async (update: ColDef, name: string) => {
                await api.setColumnFilterModel('name', {
                    filterType: 'multi',
                    filterModels: [null, { filterType: 'set', values: ['bob'] }],
                });
                api.onFilterChanged();
                await asyncSetTimeout(0);
                expect(api.getDisplayedRowCount()).toBe(1);
                api.setGridOption('columnDefs', col(update));
                await asyncSetTimeout(0);

                expect(api.getColumnFilterModel('name')).toBeNull();
                await new GridRows(api, name).check(`
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:0 name:"michael"
                    ├── LEAF id:1 name:"michelle"
                    ├── LEAF id:2 name:"bob"
                    └── LEAF id:3 name:"alice"
                `);
            };

            // the default case folding keeps `bob` naming the upper case keys
            const upper = ({ value }: { value: string }) => value.toUpperCase();
            await filterBobAndReset({ filterValueGetter: byName, keyCreator: upper }, 'reset by the key creator');
            await filterBobAndReset(
                { filterValueGetter: ({ data }) => `${data.name}!`, keyCreator: upper },
                'reset by the getter'
            );
        });

        test('an unrelated colDef change leaves the child set and the model alone', async () => {
            const api: GridApi = await gridsManager.createGridAndWait('grid1', {
                enableFilterHandlers,
                columnDefs: colDefsWith([TEXT_CHILD, { filter: 'agSetColumnFilter' }]),
                rowData: ROWS,
            });

            await api.setColumnFilterModel('name', {
                filterType: 'multi',
                filterModels: [{ filterType: 'text', type: 'contains', filter: 'mich' }, null],
            });
            api.onFilterChanged();
            await asyncSetTimeout(0);

            // Same children, different headerName: nothing about the filter may be rebuilt or reset.
            api.setGridOption(
                'columnDefs',
                colDefsWith([TEXT_CHILD, { filter: 'agSetColumnFilter' }], { headerName: 'Renamed' })
            );
            await asyncSetTimeout(0);

            expect(api.getColumnFilterModel('name')).toEqual({
                filterType: 'multi',
                filterModels: [{ filterType: 'text', type: 'contains', filter: 'mich' }, null],
            });
            await new GridRows(api, 'unrelated colDef change keeps filtering').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 name:"michael"
                └── LEAF id:1 name:"michelle"
            `);
        });

        test('removing the first child does not hand its model to the survivor', async () => {
            const api: GridApi = await gridsManager.createGridAndWait('grid1', {
                enableFilterHandlers,
                columnDefs: colDefsWith([TEXT_CHILD, { filter: 'agSetColumnFilter' }]),
                rowData: ROWS,
            });

            await api.setColumnFilterModel('name', {
                filterType: 'multi',
                filterModels: [{ filterType: 'text', type: 'contains', filter: 'mich' }, null],
            });
            api.onFilterChanged();
            await asyncSetTimeout(0);

            // Drop the text child. The set child moves to index 0, where the text model used to sit.
            api.setGridOption('columnDefs', colDefsWith([{ filter: 'agSetColumnFilter' }]));
            await asyncSetTimeout(0);

            expect(await numChildFilters(api)).toBe(1);
            const model = api.getColumnFilterModel('name') as { filterModels?: unknown[] } | null;
            expect(model?.filterModels?.[0]).not.toEqual({ filterType: 'text', type: 'contains', filter: 'mich' });
            await new GridRows(api, 'first child removed leaves no stale filtering').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 name:"michael"
                ├── LEAF id:1 name:"michelle"
                ├── LEAF id:2 name:"bob"
                └── LEAF id:3 name:"alice"
            `);
        });

        test('the reopened popup agrees with the rows after a surviving child loses its model', async () => {
            const api: GridApi = await gridsManager.createGridAndWait('grid1', {
                enableFilterHandlers,
                columnDefs: colDefsWith([TEXT_CHILD, { filter: 'agSetColumnFilter' }]),
                rowData: ROWS,
            });

            // Open first, so the filter ui really exists before the col def changes.
            const filter = await ColumnFilterHarness.open(api, 'name');
            await filter.selectOperator('Contains', 0);
            await filter.setText('mich', 0);
            await asyncSetTimeout(0);
            api.hideColumnFilter();
            await new GridRows(api, 'text child filtering before the change').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 name:"michael"
                └── LEAF id:1 name:"michelle"
            `);

            // Swap the second child's type. The text child survives, but the model is reset.
            api.setGridOption('columnDefs', colDefsWith([TEXT_CHILD, { filter: 'agNumberColumnFilter' }]));
            await asyncSetTimeout(0);

            await new GridRows(api, 'model reset leaves every row visible').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 name:"michael"
                ├── LEAF id:1 name:"michelle"
                ├── LEAF id:2 name:"bob"
                └── LEAF id:3 name:"alice"
            `);

            // The popup must not claim a filter the grid is no longer applying.
            await ColumnFilterHarness.open(api, 'name');
            const textInput = document
                .querySelector('.ag-filter-menu')!
                .querySelector<HTMLInputElement>('.ag-filter-body input[type="text"]:not([disabled])');
            expect(textInput?.value ?? '').toBe('');
        });

        test('filter: true and the default filter name are the same child', async () => {
            const api: GridApi = await gridsManager.createGridAndWait('grid1', {
                enableFilterHandlers,
                columnDefs: colDefsWith([{ filter: true }, { filter: 'agSetColumnFilter' }]),
                rowData: ROWS,
            });

            await api.setColumnFilterModel('name', {
                filterType: 'multi',
                filterModels: [null, { filterType: 'set', values: ['bob'] }],
            });
            api.onFilterChanged();
            await asyncSetTimeout(0);

            // `true` means the default, which for a child is the text filter: naming it explicitly is
            // the same child, so nothing may be rebuilt and the model must survive.
            api.setGridOption(
                'columnDefs',
                colDefsWith([{ filter: 'agTextColumnFilter' }, { filter: 'agSetColumnFilter' }])
            );
            await asyncSetTimeout(0);

            expect(api.getColumnFilterModel('name')).toEqual({
                filterType: 'multi',
                filterModels: [null, { filterType: 'set', values: ['bob'] }],
            });
            await new GridRows(api, 'filter:true child survives being named').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:2 name:"bob"
            `);
        });

        test('an empty filters array falls back to the default children and still refreshes', async () => {
            const api: GridApi = await gridsManager.createGridAndWait('grid1', {
                enableFilterHandlers,
                columnDefs: colDefsWith([]),
                rowData: ROWS,
            });

            // Defaults are text + set, so the popup has both and nothing throws on refresh.
            expect(await numChildFilters(api)).toBe(2);
            api.setGridOption('columnDefs', colDefsWith([], { headerName: 'Renamed' }));
            await asyncSetTimeout(0);
            expect(await numChildFilters(api)).toBe(2);

            await ColumnFilterHarness.open(api, 'name');
            expect(setFilterList()).not.toBeNull();
        });

        test('the filters tool panel follows a removed child', async () => {
            const api: GridApi = await gridsManager.createGridAndWait('grid1', {
                enableFilterHandlers,
                columnDefs: colDefsWith([TEXT_CHILD, { filter: 'agSetColumnFilter' }]),
                rowData: ROWS,
                sideBar: FILTERS_SIDEBAR,
            });

            const panel = await openFiltersPanel(api);
            await panel.expandGroup('Name');
            expect(panel.isSetListShown('Name')).toBe(true);

            api.setGridOption('columnDefs', colDefsWith([TEXT_CHILD]));
            await asyncSetTimeout(0);

            await panel.expandGroup('Name');
            expect(panel.isSetListShown('Name')).toBe(false);
        });

        test('the floating filter follows a removed child', async () => {
            const api: GridApi = await gridsManager.createGridAndWait('grid1', {
                enableFilterHandlers,
                columnDefs: colDefsWith([TEXT_CHILD, { filter: 'agSetColumnFilter' }], { floatingFilter: true }),
                rowData: ROWS,
            });

            expect(floatingChildren()).toHaveLength(2);

            api.setGridOption('columnDefs', colDefsWith([TEXT_CHILD], { floatingFilter: true }));
            await asyncSetTimeout(0);

            expect(floatingChildren()).toHaveLength(1);
        });

        test('the child set keeps tracking columnDefs across repeated changes', async () => {
            const api: GridApi = await gridsManager.createGridAndWait('grid1', {
                enableFilterHandlers,
                columnDefs: colDefsWith([TEXT_CHILD, { filter: 'agSetColumnFilter' }]),
                rowData: ROWS,
            });

            api.setGridOption('columnDefs', colDefsWith([TEXT_CHILD]));
            await asyncSetTimeout(0);
            expect(await numChildFilters(api)).toBe(1);

            // The first change destroys the column filter, taking its colDefChanged listener with it;
            // a second change is what proves the listener came back.
            api.setGridOption('columnDefs', colDefsWith([TEXT_CHILD, { filter: 'agSetColumnFilter' }]));
            await asyncSetTimeout(0);
            expect(await numChildFilters(api)).toBe(2);

            api.setGridOption('columnDefs', colDefsWith([TEXT_CHILD, { filter: 'agNumberColumnFilter' }]));
            await asyncSetTimeout(0);
            expect(await numChildFilters(api)).toBe(2);

            await ColumnFilterHarness.open(api, 'name');
            expect(setFilterList()).toBeNull();
        });

        test('an added child appears in the popup and filters', async () => {
            const api: GridApi = await gridsManager.createGridAndWait('grid1', {
                enableFilterHandlers,
                columnDefs: colDefsWith([TEXT_CHILD]),
                rowData: ROWS,
            });

            await ColumnFilterHarness.open(api, 'name');
            expect(setFilterList()).toBeNull();
            api.hideColumnFilter();

            api.setGridOption('columnDefs', colDefsWith([TEXT_CHILD, { filter: 'agSetColumnFilter' }]));
            await asyncSetTimeout(0);

            expect(await numChildFilters(api)).toBe(2);

            const filter = await ColumnFilterHarness.open(api, 'name');
            expect(setFilterList()).not.toBeNull();

            await filter.toggleSetItem('michelle');
            await filter.toggleSetItem('alice');
            await filter.toggleSetItem('bob');
            await asyncSetTimeout(0);
            await new GridRows(api, 'added set child filters').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 name:"michael"
            `);
        });
    });
});

async function createFloatingGrid(gridsManager: TestGridsManager): Promise<GridApi<Row>> {
    const options: GridOptions<Row> = {
        columnDefs: [
            {
                field: 'name',
                filter: 'agMultiColumnFilter',
                floatingFilter: true,
                filterParams: {
                    filters: [
                        { filter: 'agTextColumnFilter', filterParams: { debounceMs: 0, maxNumConditions: 1 } },
                        { filter: 'agSetColumnFilter' },
                    ],
                },
            },
        ],
        rowData: ROWS,
    };
    return gridsManager.createGridAndWait('grid1', options);
}
