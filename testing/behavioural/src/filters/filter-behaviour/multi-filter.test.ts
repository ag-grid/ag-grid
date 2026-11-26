import {
    ALL_SEVERITIES,
    ColumnFilterHarness,
    FilterDom,
    GridRows,
    LEGACY_FILTER_WARNING_IDS,
    asyncSetTimeout,
} from 'ag-test-utils';

import type { DoesFilterPassParams, GridApi, IFilterComp, IMultiFilter } from 'ag-grid-community';
import { CustomFilterModule, enableDevValidations } from 'ag-grid-community';

import {
    ROWS,
    TEXT_MICH,
    setupMultiFilterSuite,
    visibleFloatingChild,
    visibleFloatingKind,
} from './multiFilterHarness';

/**
 * agMultiColumnFilter's text+set default, combined model and AND across children; siblings multi-filter-children
 * and multi-filter-filters-changed share multiFilterHarness; see also multi-filter-floating-filter.
 */
describe('Multi Filter — sub-filter combos & combined model (coverage)', () => {
    const gridsManager = setupMultiFilterSuite();

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
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: LEGACY_FILTER_WARNING_IDS });
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
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: LEGACY_FILTER_WARNING_IDS });
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
            enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [283, 348] });
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
            enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [348] });
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
        beforeEach(() => {
            enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [348] });
        });

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
});
