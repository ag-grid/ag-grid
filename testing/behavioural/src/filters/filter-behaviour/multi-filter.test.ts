import type { GridApi, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, NumberFilterModule, TextFilterModule, setupAgTestIds } from 'ag-grid-community';
import { ColumnMenuModule, MultiFilterModule, SetFilterModule } from 'ag-grid-enterprise';

import {
    ColumnFilterHarness,
    FilterDom,
    GridRows,
    TestGridsManager,
    asyncSetTimeout,
    installFilterLayoutMock,
    uninstallFilterLayoutMock,
} from '../../test-utils';

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

/** The `.ag-multi-floating-filter` cell's currently displayed child (the non-hidden sub-floating-filter). */
function visibleFloatingChild(): HTMLElement {
    const container = document.querySelector<HTMLElement>('.ag-multi-floating-filter');
    if (!container) {
        throw new Error('Multi floating filter container not present');
    }
    const shown = Array.from(container.children).filter(
        (c): c is HTMLElement => c instanceof HTMLElement && !c.classList.contains('ag-hidden')
    );
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
