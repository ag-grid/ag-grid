import { ClientSideRowModelModule, NumberFilterModule, TextFilterModule, setupAgTestIds } from 'ag-grid-community';
import { FiltersToolPanelModule, SetFilterModule } from 'ag-grid-enterprise';

import {
    FilterDom,
    GridRows,
    TestGridsManager,
    asyncSetTimeout,
    installFilterLayoutMock,
    uninstallFilterLayoutMock,
} from '../../test-utils';
import { FILTERS_SIDEBAR, openFiltersPanel } from './toolPanelHarness';

/**
 * Black-box coverage for the enterprise Filters Tool Panel structure: column list, expand/collapse,
 * search, expand-all, and suppressFiltersToolPanel / suppressFilterSearch / suppressExpandAll config.
 */

describe('Filters Tool Panel', () => {
    const gridsManager = new TestGridsManager({
        modules: [
            TextFilterModule,
            NumberFilterModule,
            SetFilterModule,
            FiltersToolPanelModule,
            ClientSideRowModelModule,
        ],
    });

    beforeAll(() => {
        setupAgTestIds();
        installFilterLayoutMock();
    });
    afterAll(() => uninstallFilterLayoutMock());
    afterEach(() => gridsManager.reset());

    test('lists only filterable columns, collapsed, with no active indicators', async () => {
        const api = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                { field: 'name', filter: 'agTextColumnFilter', filterParams: { debounceMs: 0 } },
                { field: 'age', filter: 'agNumberColumnFilter', filterParams: { debounceMs: 0 } },
                { field: 'country', filter: false },
            ],
            rowData: [{ name: 'Alice', age: 30, country: 'IE' }],
            sideBar: FILTERS_SIDEBAR,
        });
        const panel = await openFiltersPanel(api);

        // `country` has filter:false, so it is absent from the list.
        expect(panel.columnTitles()).toEqual(['Name', 'Age']);
        expect(panel.serialize()).toMatchInlineSnapshot(`
          "FILTERS TOOL PANEL
          ▸ Name
          ▸ Age"
        `);
    });

    test('expanding a column reveals its filter body; collapsing removes it', async () => {
        const api = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'name', filter: 'agTextColumnFilter', filterParams: { debounceMs: 0 } }],
            rowData: [{ name: 'Alice' }],
            sideBar: FILTERS_SIDEBAR,
        });
        const panel = await openFiltersPanel(api);

        await panel.expandGroup('Name');
        expect(document.querySelector('.ag-filter-toolpanel-instance-body .ag-filter-wrapper')).not.toBeNull();
        expect(panel.serialize()).toMatchInlineSnapshot(`
          "FILTERS TOOL PANEL
          ▾ Name
            operator: "Contains"
            input: """
        `);

        await panel.collapseGroup('Name');
        // Collapsing destroys the filter element (body is emptied).
        expect(document.querySelector('.ag-filter-toolpanel-instance-body .ag-filter-wrapper')).toBeNull();
        expect(panel.serialize()).toMatchInlineSnapshot(`
          "FILTERS TOOL PANEL
          ▸ Name"
        `);
    });

    test('the search box filters the column list and restores it when cleared', async () => {
        const api = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                { field: 'name', filter: 'agTextColumnFilter', filterParams: { debounceMs: 0 } },
                { field: 'age', filter: 'agNumberColumnFilter', filterParams: { debounceMs: 0 } },
                { field: 'country', filter: 'agSetColumnFilter' },
            ],
            rowData: [{ name: 'Alice', age: 30, country: 'IE' }],
            sideBar: FILTERS_SIDEBAR,
        });
        const panel = await openFiltersPanel(api);

        expect(panel.isSearchPresent()).toBe(true);

        await panel.search('age');
        expect(panel.columnTitles()).toEqual(['Age']);
        expect(panel.serialize()).toMatchInlineSnapshot(`
              "FILTERS TOOL PANEL
              ▸ Age"
            `);

        await panel.search('');
        expect(panel.columnTitles()).toEqual(['Name', 'Age', 'Country']);
    });

    test('expand-all / collapse-all toggles column-group expansion', async () => {
        const api = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    headerName: 'Person',
                    children: [
                        { field: 'name', filter: 'agTextColumnFilter', filterParams: { debounceMs: 0 } },
                        { field: 'age', filter: 'agNumberColumnFilter', filterParams: { debounceMs: 0 } },
                    ],
                },
            ],
            rowData: [{ name: 'Alice', age: 30 }],
            sideBar: FILTERS_SIDEBAR,
        });
        const panel = await openFiltersPanel(api);

        // The expand-all header button only shows when a column group is present; the group starts expanded.
        expect(panel.isExpandAllPresent()).toBe(true);
        expect(panel.isGroupExpandedByTitle('Person')).toBe(true);
        expect(panel.serialize()).toMatchInlineSnapshot(`
          "FILTERS TOOL PANEL
          ▾ Person
            ▸ Name
            ▸ Age"
        `);
        // Nested column group: FilterDom renders the same header-visible instance rows.
        await new FilterDom(api, 'column group panel via FilterDom', { mode: 'filters-tool-panel' }).checkFilterDom(`
            FILTERS TOOL PANEL
            ▾ Person
              ▸ Name
              ▸ Age
        `);

        // First click collapses (current state is expanded).
        await panel.clickExpandAll();
        expect(panel.isGroupExpandedByTitle('Person')).toBe(false);
        expect(panel.serialize()).toMatchInlineSnapshot(`
          "FILTERS TOOL PANEL
          ▸ Person"
        `);

        // Second click expands again (back to the initial state, hence no duplicate snapshot).
        await panel.clickExpandAll();
        expect(panel.isGroupExpandedByTitle('Person')).toBe(true);
    });

    test('column suppressFiltersToolPanel hides the column from the panel but keeps it filterable', async () => {
        const api = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                { field: 'name', filter: 'agTextColumnFilter', filterParams: { debounceMs: 0 } },
                {
                    field: 'age',
                    filter: 'agNumberColumnFilter',
                    filterParams: { debounceMs: 0 },
                    suppressFiltersToolPanel: true,
                },
            ],
            rowData: [
                { name: 'Alice', age: 30 },
                { name: 'Bob', age: 40 },
            ],
            sideBar: FILTERS_SIDEBAR,
        });
        const panel = await openFiltersPanel(api);

        expect(panel.columnTitles()).toEqual(['Name']);
        expect(panel.serialize()).toMatchInlineSnapshot(`
                  "FILTERS TOOL PANEL
                  ▸ Name"
                `);

        // Still filterable via the API even though it is hidden from the panel.
        await api.setColumnFilterModel('age', { filterType: 'number', type: 'greaterThan', filter: 35 });
        api.onFilterChanged();
        await asyncSetTimeout(0);
        await new GridRows(api, 'suppressed column still filterable').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:1 name:"Bob" age:40
        `);
    });

    test('group suppressFiltersToolPanel hides the whole group from the panel', async () => {
        const api = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                { field: 'name', filter: 'agTextColumnFilter', filterParams: { debounceMs: 0 } },
                {
                    headerName: 'Numbers',
                    suppressFiltersToolPanel: true,
                    children: [{ field: 'age', filter: 'agNumberColumnFilter', filterParams: { debounceMs: 0 } }],
                },
            ],
            rowData: [{ name: 'Alice', age: 30 }],
            sideBar: FILTERS_SIDEBAR,
        });
        const panel = await openFiltersPanel(api);

        expect(panel.columnTitles()).toEqual(['Name']);
        expect(panel.serialize()).toMatchInlineSnapshot(`
                  "FILTERS TOOL PANEL
                  ▸ Name"
                `);
    });

    test('suppressFilterSearch + suppressExpandAll remove the panel header controls', async () => {
        const api = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    headerName: 'Person',
                    children: [{ field: 'name', filter: 'agTextColumnFilter', filterParams: { debounceMs: 0 } }],
                },
            ],
            rowData: [{ name: 'Alice' }],
            sideBar: {
                toolPanels: [
                    {
                        id: 'filters',
                        labelKey: 'filters',
                        labelDefault: 'Filters',
                        iconKey: 'filter',
                        toolPanel: 'agFiltersToolPanel',
                        toolPanelParams: { suppressFilterSearch: true, suppressExpandAll: true },
                    },
                ],
                defaultToolPanel: 'filters',
            },
        });
        const panel = await openFiltersPanel(api);

        expect(panel.isSearchPresent()).toBe(false);
        expect(panel.isExpandAllPresent()).toBe(false);
    });
});
