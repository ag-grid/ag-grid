import type {
    GridApi,
    GridOptions,
    ISetFilterParams,
    KeyCreatorParams,
    SetFilterValuesFuncParams,
    ValueFormatterParams,
} from 'ag-grid-community';
import { ClientSideRowModelModule, setupAgTestIds } from 'ag-grid-community';
import { SetFilterModule } from 'ag-grid-enterprise';

import {
    ColumnFilterHarness,
    FilterDom,
    GridRows,
    TestGridsManager,
    asyncSetTimeout,
    installFilterLayoutMock,
    uninstallFilterLayoutMock,
} from '../../test-utils';

/**
 * Black-box coverage for the agSetColumnFilter value model + UI, targeting gaps left by
 * set-filter-reuse / set-filter-complex-objects: async value callbacks, mini-filter case-sensitivity,
 * (Select All) tri-state, (Blanks), keyCreator label-vs-key, apply-button, model round-trip, suppressMiniFilter.
 */
describe('Set Filter — value model & UI (coverage)', () => {
    const gridsManager = new TestGridsManager({
        modules: [SetFilterModule, ClientSideRowModelModule],
    });

    beforeAll(() => {
        setupAgTestIds();
        installFilterLayoutMock();
    });
    afterAll(() => uninstallFilterLayoutMock());
    afterEach(() => gridsManager.reset());

    test('async values callback populates the list and round-trips through the model', async () => {
        const options: GridOptions = {
            columnDefs: [
                {
                    field: 'country',
                    filter: 'agSetColumnFilter',
                    filterParams: {
                        // Async source: values come from the callback, not the grid data.
                        values: (params: SetFilterValuesFuncParams) => {
                            params.success(['France', 'Germany', 'Italy']);
                        },
                    } as ISetFilterParams,
                },
            ],
            rowData: [{ country: 'Italy' }, { country: 'Spain' }, { country: 'France' }],
        };
        const api: GridApi = await gridsManager.createGridAndWait('grid1', options);

        const filter = await ColumnFilterHarness.open(api, 'country');
        // 'Spain' exists in the data but is not in the async list; 'Germany' is in the list but not the data.
        expect(filter.setFilterItemLabels()).toEqual(['(Select All)', 'France', 'Germany', 'Italy']);

        await filter.toggleSetItem('France');
        await filter.toggleSetItem('Germany');
        await asyncSetTimeout(0);

        expect(filter.getModel()).toEqual({ filterType: 'set', values: ['Italy'] });
        await new FilterDom(api, 'async values', { colId: 'country' }).checkFilterDom(`
            COLUMN FILTER (set)
            mini-filter: ""
            ▪ (Select All)
            ☐ France
            ☐ Germany
            ☑ Italy
            model:
              values:
                - "Italy"
              filterType: "set"
        `);
        await new GridRows(api, 'async values rows').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 country:"Italy"
        `);
    });

    test('mini-filter is case-insensitive by default', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'country', filter: 'agSetColumnFilter' }],
            rowData: [{ country: 'Australia' }, { country: 'Austria' }, { country: 'Italy' }],
        });

        const filter = await ColumnFilterHarness.open(api, 'country');
        await filter.miniFilterSearch('aus');
        await asyncSetTimeout(0);

        // Lowercase query still matches the capitalised items.
        expect(filter.setFilterItemLabels()).toEqual(['(Select All)', 'Australia', 'Austria']);
        await new FilterDom(api, 'case-insensitive mini-filter', { colId: 'country' }).checkFilterDom(`
            COLUMN FILTER (set)
            mini-filter: "aus"
            ☑ (Select All)
            ☑ Australia
            ☑ Austria
            model: null
        `);
        // Mini-filter search narrows the list only; displayed rows are unaffected (model null).
        await new GridRows(api, 'case-insensitive mini-filter rows').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 country:"Australia"
            ├── LEAF id:1 country:"Austria"
            └── LEAF id:2 country:"Italy"
        `);
    });

    test('caseSensitive mini-filter only matches the exact case', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'country',
                    filter: 'agSetColumnFilter',
                    filterParams: { caseSensitive: true } as ISetFilterParams,
                },
            ],
            rowData: [{ country: 'Australia' }, { country: 'Austria' }, { country: 'Italy' }],
        });

        const filter = await ColumnFilterHarness.open(api, 'country');
        await filter.miniFilterSearch('aus');
        await asyncSetTimeout(0);
        // Lowercase 'aus' matches nothing when case-sensitive.
        expect(filter.setFilterItemLabels()).toEqual(['(Select All)']);

        await filter.miniFilterSearch('Aus');
        await asyncSetTimeout(0);
        expect(filter.setFilterItemLabels()).toEqual(['(Select All)', 'Australia', 'Austria']);
        await new FilterDom(api, 'case-sensitive mini-filter', { colId: 'country' }).checkFilterDom(`
            COLUMN FILTER (set)
            mini-filter: "Aus"
            ☑ (Select All)
            ☑ Australia
            ☑ Austria
            model: null
        `);
        // Case-sensitive search still leaves displayed rows untouched (model null).
        await new GridRows(api, 'case-sensitive mini-filter rows').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 country:"Australia"
            ├── LEAF id:1 country:"Austria"
            └── LEAF id:2 country:"Italy"
        `);
    });

    test('(Select All) is indeterminate for a partial subset and clears the model when re-selected', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'country', filter: 'agSetColumnFilter' }],
            rowData: [{ country: 'Australia' }, { country: 'France' }, { country: 'Italy' }],
        });

        const filter = await ColumnFilterHarness.open(api, 'country');
        // Partial: deselect one → (Select All) goes indeterminate, model carries the remaining keys.
        await filter.toggleSetItem('France');
        await asyncSetTimeout(0);
        expect(filter.getModel()).toEqual({ filterType: 'set', values: ['Australia', 'Italy'] });
        await new FilterDom(api, 'select-all partial', { colId: 'country' }).checkFilterDom(`
            COLUMN FILTER (set)
            mini-filter: ""
            ▪ (Select All)
            ☑ Australia
            ☐ France
            ☑ Italy
            model:
              values:
                - "Australia"
                - "Italy"
              filterType: "set"
        `);
        await new GridRows(api, 'select-all partial rows').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 country:"Australia"
            └── LEAF id:2 country:"Italy"
        `);

        // Re-select the last unchecked item → everything selected ⇒ filter inactive (model null).
        await filter.toggleSetItem('France');
        await asyncSetTimeout(0);
        expect(filter.getModel()).toBeNull();
        await new FilterDom(api, 'select-all all', { colId: 'country' }).checkFilterDom(`
            COLUMN FILTER (set)
            mini-filter: ""
            ☑ (Select All)
            ☑ Australia
            ☑ France
            ☑ Italy
            model: null
        `);
        await new GridRows(api, 'select-all all rows').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 country:"Australia"
            ├── LEAF id:1 country:"France"
            └── LEAF id:2 country:"Italy"
        `);
    });

    test('undefined values render as (Blanks) and filter to the blank rows', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'country', filter: 'agSetColumnFilter' }],
            rowData: [{ country: 'Italy' }, { country: undefined }, { country: 'Australia' }, {}],
        });

        const filter = await ColumnFilterHarness.open(api, 'country');
        expect(filter.setFilterItemLabels()).toEqual(['(Select All)', '(Blanks)', 'Australia', 'Italy']);

        // Keep only the blanks.
        await filter.toggleSetItem('Australia');
        await filter.toggleSetItem('Italy');
        await asyncSetTimeout(0);
        expect(filter.getModel()).toEqual({ filterType: 'set', values: [null] });
        await new FilterDom(api, 'undefined blanks', { colId: 'country' }).checkFilterDom(`
            COLUMN FILTER (set)
            mini-filter: ""
            ▪ (Select All)
            ☑ (Blanks)
            ☐ Australia
            ☐ Italy
            model:
              values:
                - null
              filterType: "set"
        `);
        await new GridRows(api, 'undefined blanks rows').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:1
            └── LEAF id:3
        `);
    });

    test('keyCreator: list shows the formatted label while the model keeps the underlying key', async () => {
        const keyCreator = (params: KeyCreatorParams): string => params.value.code;
        const valueFormatter = (params: ValueFormatterParams): string => params.value?.name ?? '';
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'country',
                    filter: 'agSetColumnFilter',
                    keyCreator,
                    valueFormatter,
                    filterParams: { keyCreator, valueFormatter } as ISetFilterParams,
                },
            ],
            rowData: [
                { country: { code: 'IT', name: 'Italy' } },
                { country: { code: 'AU', name: 'Australia' } },
                { country: { code: 'FR', name: 'France' } },
            ],
        });

        const filter = await ColumnFilterHarness.open(api, 'country');
        expect(filter.setFilterItemLabels()).toEqual(['(Select All)', 'Australia', 'France', 'Italy']);

        // Toggle by displayed label 'Italy' → model must carry the underlying key 'IT'.
        await filter.toggleSetItem('Australia');
        await filter.toggleSetItem('France');
        await asyncSetTimeout(0);
        expect(filter.getModel()).toEqual({ filterType: 'set', values: ['IT'] });
        await new FilterDom(api, 'keyCreator label vs key', { colId: 'country' }).checkFilterDom(`
            COLUMN FILTER (set)
            mini-filter: ""
            ▪ (Select All)
            ☐ Australia
            ☐ France
            ☑ Italy
            model:
              values:
                - "IT"
              filterType: "set"
        `);
        // Filter on key 'IT' keeps only the row whose keyCreator produced that key.
        await new GridRows(api, 'keyCreator label vs key rows').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 country:"Italy"
        `);
    });

    test('apply button defers the applied model until Apply is clicked', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'country',
                    filter: 'agSetColumnFilter',
                    filterParams: { buttons: ['apply', 'clear'] } as ISetFilterParams,
                },
            ],
            rowData: [{ country: 'Australia' }, { country: 'France' }, { country: 'Italy' }],
        });

        const filter = await ColumnFilterHarness.open(api, 'country');
        await filter.toggleSetItem('France');
        await filter.toggleSetItem('Italy');
        await asyncSetTimeout(0);

        // UI shows the pending selection, but the applied model is still null (nothing applied yet).
        expect(filter.getModel()).toBeNull();
        await new FilterDom(api, 'apply-button pending', { colId: 'country' }).checkFilterDom(`
            COLUMN FILTER (set)
            mini-filter: ""
            ▪ (Select All)
            ☑ Australia
            ☐ France
            ☐ Italy
            buttons: Apply | Clear
            model: null
        `);
        await new GridRows(api, 'apply-button pending rows').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 country:"Australia"
            ├── LEAF id:1 country:"France"
            └── LEAF id:2 country:"Italy"
        `);

        await filter.apply();
        await asyncSetTimeout(0);
        expect(filter.getModel()).toEqual({ filterType: 'set', values: ['Australia'] });
        await new GridRows(api, 'apply-button applied rows').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 country:"Australia"
        `);
    });

    test('setColumnFilterModel round-trips including a null (Blanks) value', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'country', filter: 'agSetColumnFilter' }],
            rowData: [{ country: 'Italy' }, { country: null }, { country: 'Australia' }, { country: 'France' }],
        });

        await api.setColumnFilterModel('country', { filterType: 'set', values: [null, 'Italy'] });
        api.onFilterChanged();
        await asyncSetTimeout(0);

        // Round-trip: the model read back matches what was set (order preserved).
        expect(api.getColumnFilterModel('country')).toEqual({ filterType: 'set', values: [null, 'Italy'] });
        await new GridRows(api, 'model round-trip rows').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 country:"Italy"
            └── LEAF id:1 country:null
        `);

        // The open panel reflects the programmatic model: only (Blanks) + Italy checked.
        await ColumnFilterHarness.open(api, 'country');
        await new FilterDom(api, 'model round-trip panel', { colId: 'country' }).checkFilterDom(`
            COLUMN FILTER (set)
            mini-filter: ""
            ▪ (Select All)
            ☑ (Blanks)
            ☐ Australia
            ☐ France
            ☑ Italy
            model:
              filterType: "set"
              values:
                - null
                - "Italy"
        `);
    });

    test('numeric values are sorted lexically by their string keys (no comparator supplied)', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'age', filter: 'agSetColumnFilter' }],
            rowData: [{ age: 10 }, { age: 2 }, { age: 1 }, { age: 21 }],
        });

        const filter = await ColumnFilterHarness.open(api, 'age');
        // Default comparator compares the underlying numeric keys with </> ⇒ numeric ordering.
        expect(filter.setFilterItemLabels()).toEqual(['(Select All)', '1', '2', '10', '21']);

        await filter.toggleSetItem('10');
        await filter.toggleSetItem('21');
        await asyncSetTimeout(0);
        // Keys are stored as strings (so the model carries strings) even though the list sorts numerically.
        expect(filter.getModel()).toEqual({ filterType: 'set', values: ['1', '2'] });
        await new FilterDom(api, 'numeric sort', { colId: 'age' }).checkFilterDom(`
            COLUMN FILTER (set)
            mini-filter: ""
            ▪ (Select All)
            ☑ 1
            ☑ 2
            ☐ 10
            ☐ 21
            model:
              values:
                - "1"
                - "2"
              filterType: "set"
        `);
        await new GridRows(api, 'numeric lexical sort rows').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:1 age:2
            └── LEAF id:2 age:1
        `);
    });

    test('(Select All) while a mini-filter is active toggles only the visible items, preserving hidden selections', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'country', filter: 'agSetColumnFilter' }],
            rowData: [{ country: 'Australia' }, { country: 'Austria' }, { country: 'Belgium' }, { country: 'Italy' }],
        });

        const filter = await ColumnFilterHarness.open(api, 'country');
        await filter.miniFilterSearch('Au');
        await asyncSetTimeout(0);
        expect(filter.setFilterItemLabels()).toEqual(['(Select All)', 'Australia', 'Austria']);

        // Deselect (Select All) with the search active ⇒ only the visible Au* items are cleared;
        // Belgium and Italy (hidden) stay selected, so they carry into the applied model.
        await filter.toggleSetItem('(Select All)');
        await asyncSetTimeout(0);
        expect(filter.getModel()).toEqual({ filterType: 'set', values: ['Belgium', 'Italy'] });
        await new FilterDom(api, 'select-all with active search', { colId: 'country' }).checkFilterDom(`
            COLUMN FILTER (set)
            mini-filter: "Au"
            ☐ (Select All)
            ☐ Australia
            ☐ Austria
            model:
              values:
                - "Belgium"
                - "Italy"
              filterType: "set"
        `);

        // Clearing the search reveals the retained hidden selections; (Select All) is now partial.
        await filter.miniFilterSearch('');
        await asyncSetTimeout(0);
        await new FilterDom(api, 'select-all search cleared', { colId: 'country' }).checkFilterDom(`
            COLUMN FILTER (set)
            mini-filter: ""
            ▪ (Select All)
            ☐ Australia
            ☐ Austria
            ☑ Belgium
            ☑ Italy
            model:
              values:
                - "Belgium"
                - "Italy"
              filterType: "set"
        `);
        await new GridRows(api, 'select-all with active search rows').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:2 country:"Belgium"
            └── LEAF id:3 country:"Italy"
        `);
    });

    test('setColumnFilterModel with empty values excludes every row; null restores all', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'country', filter: 'agSetColumnFilter' }],
            rowData: [{ country: 'Australia' }, { country: 'France' }, { country: 'Italy' }],
        });

        await api.setColumnFilterModel('country', { filterType: 'set', values: [] });
        api.onFilterChanged();
        await asyncSetTimeout(0);
        expect(api.getColumnFilterModel('country')).toEqual({ filterType: 'set', values: [] });
        expect(api.getDisplayedRowCount()).toBe(0);
        await new GridRows(api, 'empty values rows').check('empty');

        await api.setColumnFilterModel('country', null);
        api.onFilterChanged();
        await asyncSetTimeout(0);
        expect(api.getColumnFilterModel('country')).toBeNull();
        expect(api.getDisplayedRowCount()).toBe(3);
        await new GridRows(api, 'null restores rows').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 country:"Australia"
            ├── LEAF id:1 country:"France"
            └── LEAF id:2 country:"Italy"
        `);
    });

    test('provided values array: selecting a value absent from the data yields no rows and round-trips', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'country',
                    filter: 'agSetColumnFilter',
                    filterParams: { values: ['Australia', 'France', 'Germany', 'Italy'] } as ISetFilterParams,
                },
            ],
            rowData: [{ country: 'Italy' }, { country: 'Australia' }],
        });

        // 'Germany' is a provided value with no matching row.
        await api.setColumnFilterModel('country', { filterType: 'set', values: ['Germany'] });
        api.onFilterChanged();
        await asyncSetTimeout(0);
        expect(api.getColumnFilterModel('country')).toEqual({ filterType: 'set', values: ['Germany'] });
        expect(api.getDisplayedRowCount()).toBe(0);
        await new GridRows(api, 'provided value absent rows').check('empty');

        const filter = await ColumnFilterHarness.open(api, 'country');
        await new FilterDom(api, 'provided value absent panel', { colId: 'country' }).checkFilterDom(`
            COLUMN FILTER (set)
            mini-filter: ""
            ▪ (Select All)
            ☐ Australia
            ☐ France
            ☑ Germany
            ☐ Italy
            model:
              filterType: "set"
              values:
                - "Germany"
        `);
        // Switch to a value that does exist in the data.
        await filter.toggleSetItem('Germany');
        await filter.toggleSetItem('Italy');
        await asyncSetTimeout(0);
        expect(filter.getModel()).toEqual({ filterType: 'set', values: ['Italy'] });
        await new GridRows(api, 'provided value present rows').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 country:"Italy"
        `);
    });

    test('suppressMiniFilter hides the mini-filter search box', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'country',
                    filter: 'agSetColumnFilter',
                    filterParams: { suppressMiniFilter: true } as ISetFilterParams,
                },
            ],
            rowData: [{ country: 'Australia' }, { country: 'France' }, { country: 'Italy' }],
        });

        await ColumnFilterHarness.open(api, 'country');
        // suppressMiniFilter hides the box via `ag-hidden` rather than removing it from the DOM.
        const miniFilter = document.querySelector('.ag-mini-filter');
        expect(miniFilter).not.toBeNull();
        expect(miniFilter!.classList.contains('ag-hidden')).toBe(true);
        await new FilterDom(api, 'suppressMiniFilter', { colId: 'country' }).checkFilterDom(`
            COLUMN FILTER (set)
            ☑ (Select All)
            ☑ Australia
            ☑ France
            ☑ Italy
            model: null
        `);
    });
});
