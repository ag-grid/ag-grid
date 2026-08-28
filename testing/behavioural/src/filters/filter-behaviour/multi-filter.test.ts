import {
    ColumnFilterHarness,
    FilterDom,
    GridRows,
    TestGridsManager,
    asyncSetTimeout,
    installFilterLayoutMock,
    uninstallFilterLayoutMock,
} from 'ag-test-utils';

import type { GridApi, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, NumberFilterModule, TextFilterModule, setupAgTestIds } from 'ag-grid-community';
import { ColumnMenuModule, FiltersToolPanelModule, MultiFilterModule, SetFilterModule } from 'ag-grid-enterprise';

import { FILTERS_SIDEBAR, openFiltersPanel } from './toolPanelHarness';

interface Row {
    name?: string | null;
    age?: number;
}

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
    afterEach(() => gridsManager.reset());

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
