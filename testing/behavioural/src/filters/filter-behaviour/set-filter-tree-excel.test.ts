import type { GridApi, ISetFilterParams } from 'ag-grid-community';
import { ClientSideRowModelModule, setupAgTestIds } from 'ag-grid-community';
import { SetFilterModule } from 'ag-grid-enterprise';

import {
    ColumnFilterHarness,
    FilterDom,
    GridRows,
    TestGridsManager,
    asyncSetTimeout,
    firePointerLikeClick,
    installFilterLayoutMock,
    nudgeVirtualList,
    uninstallFilterLayoutMock,
} from '../../test-utils';

const SET_LIST_SELECTOR = '.ag-filter-menu .ag-set-filter-list';

/** Set-filter items currently rendered in the open popup (labels only, requires layout mock). */
function setItemLabels(): string[] {
    nudgeVirtualList(`${SET_LIST_SELECTOR} .ag-virtual-list-viewport`);
    return Array.from(document.querySelectorAll<HTMLElement>(`${SET_LIST_SELECTOR} .ag-set-filter-item`)).map(
        (el) => el.querySelector('.ag-checkbox-label')?.textContent?.trim() ?? ''
    );
}

/** Clicks the (visible) expand/collapse icon of a tree group row by its label, toggling expansion. */
async function toggleGroupExpand(label: string): Promise<void> {
    nudgeVirtualList(`${SET_LIST_SELECTOR} .ag-virtual-list-viewport`);
    const items = Array.from(document.querySelectorAll<HTMLElement>(`${SET_LIST_SELECTOR} .ag-set-filter-item`));
    const item = items.find((el) => el.querySelector('.ag-checkbox-label')?.textContent?.trim() === label);
    if (!item) {
        throw new Error(`Tree group "${label}" not found. Available: ${setItemLabels().join(', ')}`);
    }
    const closed = item.querySelector<HTMLElement>('.ag-set-filter-group-closed-icon');
    const opened = item.querySelector<HTMLElement>('.ag-set-filter-group-opened-icon');
    const visible = closed && !closed.classList.contains('ag-hidden') ? closed : opened;
    if (!visible) {
        throw new Error(`Tree group "${label}" has no expand icon (not a group?)`);
    }
    await firePointerLikeClick(visible);
    await asyncSetTimeout(0);
}

describe('Set Filter — tree list with dates', () => {
    const gridsManager = new TestGridsManager({
        modules: [SetFilterModule, ClientSideRowModelModule],
    });

    beforeAll(() => {
        setupAgTestIds();
        installFilterLayoutMock();
    });
    afterAll(() => uninstallFilterLayoutMock());
    afterEach(() => gridsManager.reset());

    const DATE_ROWS = [
        { when: new Date(2020, 0, 5) },
        { when: new Date(2020, 0, 20) },
        { when: new Date(2020, 5, 15) },
        { when: new Date(2021, 2, 10) },
    ];

    test('date values group into a year → month → day tree, collapsed by default', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'when', filter: 'agSetColumnFilter', filterParams: { treeList: true } }],
            rowData: DATE_ROWS,
        });

        await ColumnFilterHarness.open(api, 'when');
        // Collapsed: only (Select All) + the two year groups are rendered.
        expect(setItemLabels()).toEqual(['(Select All)', '2020', '2021']);

        await new FilterDom(api, 'date tree collapsed', { colId: 'when' }).checkFilterDom(`
            COLUMN FILTER (set)
            mini-filter: ""
            ☑ (Select All)
            ☑ 2020
            ☑ 2021
            model: null
        `);

        // Expand 2020 → month groups appear, labelled by the default date treeListFormatter (month names).
        await toggleGroupExpand('2020');
        expect(setItemLabels()).toEqual(['(Select All)', '2020', 'January', 'June', '2021']);

        // Expand January → its day leaves appear (05, 20).
        await toggleGroupExpand('January');
        expect(setItemLabels()).toEqual(['(Select All)', '2020', 'January', '05', '20', 'June', '2021']);

        await new FilterDom(api, 'date tree expanded', { colId: 'when' }).checkFilterDom(`
            COLUMN FILTER (set)
            mini-filter: ""
            ☑ (Select All)
            ☑ 2020
              ☑ January
                ☑ 05
                ☑ 20
              ☑ June
            ☑ 2021
            model: null
        `);
    });

    test('deselecting a leaf makes its ancestor groups indeterminate and filters rows', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'when', filter: 'agSetColumnFilter', filterParams: { treeList: true } }],
            rowData: DATE_ROWS,
        });

        const filter = await ColumnFilterHarness.open(api, 'when');
        await toggleGroupExpand('2020');

        // Toggle the whole June group off (single leaf under it).
        await filter.toggleSetItem('June');
        await asyncSetTimeout(0);

        // 2020 and (Select All) are now indeterminate (▪); June is unchecked.
        await new FilterDom(api, 'date tree partial selection', { colId: 'when' }).checkFilterDom(`
            COLUMN FILTER (set)
            mini-filter: ""
            ▪ (Select All)
            ▪ 2020
              ☑ January
              ☐ June
            ☑ 2021
            model:
              values:
                - "2020-01-05"
                - "2020-01-20"
                - "2021-03-10"
              filterType: "set"
        `);

        const model = filter.getModel();
        expect(model.filterType).toBe('set');
        // June's leaf key is excluded from the applied values.
        expect(model.values).not.toContain(null);
        expect(Array.isArray(model.values)).toBe(true);

        await new GridRows(api, 'date tree partial rows').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 when:"2020-01-05"
            ├── LEAF id:1 when:"2020-01-20"
            └── LEAF id:3 when:"2021-03-10"
        `);
    });

    test('null dates render as (Blanks) in the tree and can be isolated', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'when', filter: 'agSetColumnFilter', filterParams: { treeList: true } }],
            rowData: [{ when: new Date(2020, 0, 5) }, { when: null }, { when: new Date(2021, 2, 10) }, { when: null }],
        });

        const filter = await ColumnFilterHarness.open(api, 'when');
        expect(setItemLabels()).toContain('(Blanks)');

        await new FilterDom(api, 'date tree with blanks', { colId: 'when' }).checkFilterDom(`
            COLUMN FILTER (set)
            mini-filter: ""
            ☑ (Select All)
            ☑ (Blanks)
            ☑ 2020
            ☑ 2021
            model: null
        `);

        // Keep only the blanks.
        await filter.toggleSetItem('2020');
        await filter.toggleSetItem('2021');
        await asyncSetTimeout(0);

        await new GridRows(api, 'date tree blanks-only rows').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:1 when:null
            └── LEAF id:3 when:null
        `);
    });

    test('a collapsed indeterminate group keeps (Select All) indeterminate', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'when', filter: 'agSetColumnFilter', filterParams: { treeList: true } }],
            rowData: [{ when: new Date(2020, 0, 5) }, { when: new Date(2020, 0, 20) }],
        });

        // Select one of the two days in the only year, then open: 2020 renders collapsed and
        // indeterminate, so (Select All) must be indeterminate — a naive leaf-count would see the one
        // visible group as "unchecked" and wrongly demand (Select All) be fully unchecked.
        await api.setColumnFilterModel('when', { filterType: 'set', values: ['2020-01-05'] });
        await ColumnFilterHarness.open(api, 'when');
        await new FilterDom(api, 'collapsed indeterminate group', { colId: 'when' }).checkFilterDom(`
            COLUMN FILTER (set)
            mini-filter: ""
            ▪ (Select All)
            ▪ 2020
            model:
              filterType: "set"
              values:
                - "2020-01-05"
        `);
        await new GridRows(api, 'collapsed indeterminate group rows').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 when:"2020-01-05"
            └── LEAF id:1 when:"2020-01-20"
        `);
    });
});

describe('Set Filter — treeListPathGetter and treeListFormatter', () => {
    const gridsManager = new TestGridsManager({
        modules: [SetFilterModule, ClientSideRowModelModule],
    });

    beforeAll(() => {
        setupAgTestIds();
        installFilterLayoutMock();
    });
    afterAll(() => uninstallFilterLayoutMock());
    afterEach(() => gridsManager.reset());

    test('treeListPathGetter builds a custom hierarchy from string values', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'path',
                    filter: 'agSetColumnFilter',
                    filterParams: {
                        treeList: true,
                        treeListPathGetter: (value: string | null) => (value ? value.split('/') : null),
                    } as ISetFilterParams,
                },
            ],
            rowData: [{ path: 'Europe/Italy' }, { path: 'Europe/France' }, { path: 'Asia/Japan' }],
        });

        await ColumnFilterHarness.open(api, 'path');
        expect(setItemLabels()).toEqual(['(Select All)', 'Asia', 'Europe']);

        await toggleGroupExpand('Europe');
        expect(setItemLabels()).toEqual(['(Select All)', 'Asia', 'Europe', 'France', 'Italy']);

        await new FilterDom(api, 'custom path tree', { colId: 'path' }).checkFilterDom(`
            COLUMN FILTER (set)
            mini-filter: ""
            ☑ (Select All)
            ☑ Asia
            ☑ Europe
              ☑ France
              ☑ Italy
            model: null
        `);
    });

    test('treeListFormatter re-labels each level without changing the underlying keys', async () => {
        const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'when',
                    filter: 'agSetColumnFilter',
                    filterParams: {
                        treeList: true,
                        treeListFormatter: (pathKey: string | null, level: number) => {
                            if (pathKey == null) {
                                return '(none)';
                            }
                            return level === 1 ? (MONTHS[Number(pathKey) - 1] ?? pathKey) : pathKey;
                        },
                    } as ISetFilterParams,
                },
            ],
            rowData: [{ when: new Date(2020, 0, 5) }, { when: new Date(2020, 5, 15) }],
        });

        await ColumnFilterHarness.open(api, 'when');
        await toggleGroupExpand('2020');
        // Month level is re-labelled (1 → Jan, 6 → Jun); year + day are untouched.
        expect(setItemLabels()).toEqual(['(Select All)', '2020', 'Jan', 'Jun']);

        await new FilterDom(api, 'formatted tree labels', { colId: 'when' }).checkFilterDom(`
            COLUMN FILTER (set)
            mini-filter: ""
            ☑ (Select All)
            ☑ 2020
              ☑ Jan
              ☑ Jun
            model: null
        `);
    });
});

describe('Set Filter — excelMode', () => {
    const gridsManager = new TestGridsManager({
        modules: [SetFilterModule, ClientSideRowModelModule],
    });

    beforeAll(() => {
        setupAgTestIds();
        installFilterLayoutMock();
    });
    afterAll(() => uninstallFilterLayoutMock());
    afterEach(() => gridsManager.reset());

    test('windows mode shows Apply + Cancel buttons and puts (Blanks) last', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'country', filter: 'agSetColumnFilter', filterParams: { excelMode: 'windows' } }],
            rowData: [{ country: 'Italy' }, { country: null }, { country: 'Australia' }],
        });

        await ColumnFilterHarness.open(api, 'country');
        // Excel windows: blanks sink to the bottom of the list (not right after Select All).
        expect(setItemLabels()).toEqual(['(Select All)', 'Australia', 'Italy', '(Blanks)']);

        await new FilterDom(api, 'excel windows buttons', { colId: 'country' }).checkFilterDom(`
            COLUMN FILTER (set)
            mini-filter: ""
            ☑ (Select All)
            ☑ Australia
            ☑ Italy
            ☑ (Blanks)
            buttons: Apply | Cancel
            model: null
        `);
    });

    test('windows mode: deselecting everything and applying clears the model (Excel semantics)', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'country', filter: 'agSetColumnFilter', filterParams: { excelMode: 'windows' } }],
            rowData: [{ country: 'Italy' }, { country: 'Australia' }, { country: 'France' }],
        });

        const filter = await ColumnFilterHarness.open(api, 'country');
        await filter.toggleSetItem('(Select All)');
        await asyncSetTimeout(0);
        await filter.apply();
        await asyncSetTimeout(0);

        // Excel windows treats "nothing selected + apply" as no filter (model cleared) → all rows visible.
        expect(api.getColumnFilterModel('country')).toBeNull();
        await new GridRows(api, 'excel windows deselect-all rows').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 country:"Italy"
            ├── LEAF id:1 country:"Australia"
            └── LEAF id:2 country:"France"
        `);
    });

    test('mac mode shows a single Reset button', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'country', filter: 'agSetColumnFilter', filterParams: { excelMode: 'mac' } }],
            rowData: [{ country: 'Italy' }, { country: 'Australia' }, { country: 'France' }],
        });

        await ColumnFilterHarness.open(api, 'country');
        await new FilterDom(api, 'excel mac buttons', { colId: 'country' }).checkFilterDom(`
            COLUMN FILTER (set)
            mini-filter: ""
            ☑ (Select All)
            ☑ Australia
            ☑ France
            ☑ Italy
            buttons: Reset
            model: null
        `);
    });

    test('windows mode reveals "Add current selection to filter" when the mini-filter has text', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'country', filter: 'agSetColumnFilter', filterParams: { excelMode: 'windows' } }],
            rowData: [{ country: 'Australia' }, { country: 'Austria' }, { country: 'Italy' }],
        });

        const filter = await ColumnFilterHarness.open(api, 'country');
        // No add-current-selection row until the mini-filter is used.
        expect(setItemLabels()).not.toContain('Add current selection to filter');

        await filter.miniFilterSearch('Aus');
        await asyncSetTimeout(0);
        expect(setItemLabels()).toEqual([
            '(Select All Search Results)',
            'Add current selection to filter',
            'Australia',
            'Austria',
        ]);

        await new FilterDom(api, 'excel windows add-current-selection', { colId: 'country' }).checkFilterDom(`
            COLUMN FILTER (set)
            mini-filter: "Aus"
            ☑ (Select All Search Results)
            ☐ Add current selection to filter
            ☑ Australia
            ☑ Austria
            buttons: Apply | Cancel
            model: null
        `);

        // Mini-filter search only narrows the panel list; grid rows stay unfiltered (model null).
        await new GridRows(api, 'excel windows mini-filter search rows unchanged').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 country:"Australia"
            ├── LEAF id:1 country:"Austria"
            └── LEAF id:2 country:"Italy"
        `);
    });

    test('mac mode also sinks (Blanks) to the bottom of the list', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'country', filter: 'agSetColumnFilter', filterParams: { excelMode: 'mac' } }],
            rowData: [{ country: 'Italy' }, { country: null }, { country: 'Australia' }],
        });

        await ColumnFilterHarness.open(api, 'country');
        // Both excel modes push blanks last (shared excelMode behaviour), unlike the default (blanks first).
        expect(setItemLabels()).toEqual(['(Select All)', 'Australia', 'Italy', '(Blanks)']);

        await new FilterDom(api, 'excel mac blanks last', { colId: 'country' }).checkFilterDom(`
            COLUMN FILTER (set)
            mini-filter: ""
            ☑ (Select All)
            ☑ Australia
            ☑ Italy
            ☑ (Blanks)
            buttons: Reset
            model: null
        `);
    });

    test('defaultToNothingSelected is ignored under excelMode and warns', async () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'country',
                    filter: 'agSetColumnFilter',
                    filterParams: { excelMode: 'windows', defaultToNothingSelected: true },
                },
            ],
            rowData: [{ country: 'Italy' }, { country: 'Australia' }],
        });

        await ColumnFilterHarness.open(api, 'country');
        // Warning #207: defaultToNothingSelected ignored under excelMode.
        expect(warnSpy).toHaveBeenCalledWith(
            expect.any(String),
            expect.stringContaining('defaultToNothingSelected'),
            expect.any(String)
        );

        // Everything stays selected (defaultToNothingSelected had no effect).
        await new FilterDom(api, 'excel ignores defaultToNothingSelected', { colId: 'country' }).checkFilterDom(`
            COLUMN FILTER (set)
            mini-filter: ""
            ☑ (Select All)
            ☑ Australia
            ☑ Italy
            buttons: Apply | Cancel
            model: null
        `);

        // Ignored defaultToNothingSelected means no filtering applied → all rows visible.
        await new GridRows(api, 'excel ignores defaultToNothingSelected rows').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 country:"Italy"
            └── LEAF id:1 country:"Australia"
        `);

        warnSpy.mockRestore();
    });
});

describe('Set Filter — default selection state', () => {
    const gridsManager = new TestGridsManager({
        modules: [SetFilterModule, ClientSideRowModelModule],
    });

    beforeAll(() => {
        setupAgTestIds();
        installFilterLayoutMock();
    });
    afterAll(() => uninstallFilterLayoutMock());
    afterEach(() => gridsManager.reset());

    test('suppressSelectAll removes the (Select All) row', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'country', filter: 'agSetColumnFilter', filterParams: { suppressSelectAll: true } }],
            rowData: [{ country: 'Italy' }, { country: 'Australia' }, { country: 'France' }],
        });

        await ColumnFilterHarness.open(api, 'country');
        expect(setItemLabels()).toEqual(['Australia', 'France', 'Italy']);

        await new FilterDom(api, 'suppressSelectAll', { colId: 'country' }).checkFilterDom(`
            COLUMN FILTER (set)
            mini-filter: ""
            ☑ Australia
            ☑ France
            ☑ Italy
            model: null
        `);
    });

    test('defaultToNothingSelected unchecks all in the UI but does not filter until a value is selected', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'country',
                    filter: 'agSetColumnFilter',
                    filterParams: { defaultToNothingSelected: true },
                },
            ],
            rowData: [{ country: 'Italy' }, { country: 'Australia' }, { country: 'France' }],
        });

        const filter = await ColumnFilterHarness.open(api, 'country');
        await new FilterDom(api, 'defaultToNothingSelected initial', { colId: 'country' }).checkFilterDom(`
            COLUMN FILTER (set)
            mini-filter: ""
            ☐ (Select All)
            ☐ Australia
            ☐ France
            ☐ Italy
            model: null
        `);

        // Nothing selected in the UI, but no filter is applied yet → grid stays unfiltered (all rows).
        await new GridRows(api, 'defaultToNothingSelected initial unfiltered rows').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 country:"Italy"
            ├── LEAF id:1 country:"Australia"
            └── LEAF id:2 country:"France"
        `);

        // Selecting one value applies a single-value filter.
        await filter.toggleSetItem('Italy');
        await asyncSetTimeout(0);

        const model = filter.getModel();
        expect(model).toEqual({ filterType: 'set', values: ['Italy'] });
        await new GridRows(api, 'defaultToNothingSelected one selected rows').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 country:"Italy"
        `);
    });

    test('replacing rowData re-derives available values and preserves the applied model', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'country', filter: 'agSetColumnFilter' }],
            rowData: [{ country: 'Italy' }, { country: 'Australia' }, { country: 'France' }],
        });

        await api.setColumnFilterModel('country', { filterType: 'set', values: ['Italy'] });
        api.onFilterChanged();
        await asyncSetTimeout(0);

        // New data introduces Germany and drops France; Italy (still present) stays filtered-in.
        api.setGridOption('rowData', [{ country: 'Italy' }, { country: 'Germany' }, { country: 'Australia' }]);
        await asyncSetTimeout(0);

        expect(api.getColumnFilterModel('country')).toEqual({ filterType: 'set', values: ['Italy'] });

        const filter = await ColumnFilterHarness.open(api, 'country');
        expect(filter.setFilterItemLabels()).toEqual(['(Select All)', 'Australia', 'Germany', 'Italy']);

        await new GridRows(api, 'set filter after rowData replace rows').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 country:"Italy"
        `);
    });
});
