import type { IFiltersToolPanel } from 'ag-grid-community';
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
 * Black-box coverage for editing filters in the enterprise Filters Tool Panel (text/number/set), plus
 * the IFiltersToolPanel expand/collapse API and setColumnFilterModel / getFilterModel sync.
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

    test('editing a text filter in the panel filters the grid rows and marks the column active', async () => {
        const api = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'name', filter: 'agTextColumnFilter', filterParams: { debounceMs: 0 } }],
            rowData: [{ name: 'Alice' }, { name: 'Bob' }, { name: 'Albert' }],
            sideBar: FILTERS_SIDEBAR,
        });
        const panel = await openFiltersPanel(api);

        await panel.expandGroup('Name');
        await panel.setText('Name', 'Al');

        expect(api.getColumnFilterModel('name')).toEqual({ filterType: 'text', type: 'contains', filter: 'Al' });
        expect(panel.isActive('Name')).toBe(true);
        expect(panel.serialize()).toMatchInlineSnapshot(`
          "FILTERS TOOL PANEL
          ▾ Name *
            operator: "Contains"
            input: "Al"
            AND
            operator: "Contains"
            input: """
        `);
        await new GridRows(api, 'text filter edited in panel').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 name:"Alice"
            └── LEAF id:2 name:"Albert"
        `);
    });

    test('editing a number filter operator + value in the panel filters the grid rows', async () => {
        const api = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'age', filter: 'agNumberColumnFilter', filterParams: { debounceMs: 0 } }],
            rowData: [{ age: 10 }, { age: 25 }, { age: 40 }],
            sideBar: FILTERS_SIDEBAR,
        });
        const panel = await openFiltersPanel(api);

        await panel.expandGroup('Age');
        await panel.selectOperator('Age', 'Greater than');
        await panel.setNumber('Age', 25);

        expect(api.getColumnFilterModel('age')).toEqual({ filterType: 'number', type: 'greaterThan', filter: 25 });
        expect(panel.serialize()).toMatchInlineSnapshot(`
          "FILTERS TOOL PANEL
          ▾ Age *
            operator: "Greater than"
            input: "25"
            AND
            operator: "Equals"
            input: """
        `);
        await new GridRows(api, 'number filter edited in panel').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:2 age:40
        `);
    });

    test('toggling a set-filter item in the panel filters the grid rows', async () => {
        const api = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'country', filter: 'agSetColumnFilter' }],
            rowData: [{ country: 'Ireland' }, { country: 'France' }, { country: 'Italy' }],
            sideBar: FILTERS_SIDEBAR,
        });
        const panel = await openFiltersPanel(api);

        await panel.expandGroup('Country');
        expect(panel.setFilterItemLabels('Country')).toEqual(['(Select All)', 'France', 'Ireland', 'Italy']);

        await panel.toggleSetItem('Country', 'France');
        await panel.toggleSetItem('Country', 'Italy');

        expect(api.getColumnFilterModel('country')).toEqual({ filterType: 'set', values: ['Ireland'] });
        expect(panel.isActive('Country')).toBe(true);
        expect(panel.serialize()).toMatchInlineSnapshot(`
          "FILTERS TOOL PANEL
          ▾ Country *
            ▪ (Select All)
            ☐ France
            ☑ Ireland
            ☐ Italy"
        `);
        // The shared FilterDom `filters-tool-panel` serialiser renders the same tree from the DOM
        // (additionally surfacing the set filter's mini-filter search box state).
        await new FilterDom(api, 'set filter panel via FilterDom', { mode: 'filters-tool-panel' }).checkFilterDom(`
            FILTERS TOOL PANEL
            ▾ Country *
              mini-filter: ""
              ▪ (Select All)
              ☐ France
              ☑ Ireland
              ☐ Italy
        `);
        await new GridRows(api, 'set filter edited in panel').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 country:"Ireland"
        `);
    });

    test('getToolPanelInstance expandFilters / collapseFilters drive panel expansion and getState', async () => {
        const api = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                { field: 'name', filter: 'agTextColumnFilter', filterParams: { debounceMs: 0 } },
                { field: 'age', filter: 'agNumberColumnFilter', filterParams: { debounceMs: 0 } },
            ],
            rowData: [{ name: 'Alice', age: 30 }],
            sideBar: FILTERS_SIDEBAR,
        });
        const panel = await openFiltersPanel(api);
        const instance = api.getToolPanelInstance('filters') as IFiltersToolPanel;
        expect(instance).toBeTruthy();

        instance.expandFilters(['name']);
        await asyncSetTimeout(0);
        expect(instance.getState()).toEqual({ expandedGroupIds: [], expandedColIds: ['name'] });
        expect(panel.serialize()).toMatchInlineSnapshot(`
                  "FILTERS TOOL PANEL
                  ▾ Name
                    operator: "Contains"
                    input: ""
                  ▸ Age"
                `);

        instance.collapseFilters(['name']);
        await asyncSetTimeout(0);
        expect(instance.getState()).toEqual({ expandedGroupIds: [], expandedColIds: [] });
    });

    test('expandFilters with an unrecognised colId warns #167', async () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const api = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'name', filter: 'agTextColumnFilter', filterParams: { debounceMs: 0 } }],
            rowData: [{ name: 'Alice' }],
            sideBar: FILTERS_SIDEBAR,
        });
        await openFiltersPanel(api);
        const instance = api.getToolPanelInstance('filters') as IFiltersToolPanel;

        instance.expandFilters(['doesNotExist']);
        await asyncSetTimeout(0);

        expect(warnSpy.mock.calls.some((call) => String(call[0]).includes('167'))).toBe(true);
        warnSpy.mockRestore();
    });

    test('setColumnFilterModel syncs into the panel: shows the model and the active indicator', async () => {
        const api = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'name', filter: 'agTextColumnFilter', filterParams: { debounceMs: 0 } }],
            rowData: [{ name: 'Alice' }, { name: 'Bob' }, { name: 'Albert' }],
            sideBar: FILTERS_SIDEBAR,
        });
        const panel = await openFiltersPanel(api);

        await api.setColumnFilterModel('name', { filterType: 'text', type: 'startsWith', filter: 'Al' });
        api.onFilterChanged();
        await asyncSetTimeout(0);

        // Active indicator appears even while the column is collapsed.
        expect(panel.isActive('Name')).toBe(true);
        await new GridRows(api, 'model set programmatically').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 name:"Alice"
            └── LEAF id:2 name:"Albert"
        `);

        // Expanding shows the panel body reflecting the programmatic model.
        await panel.expandGroup('Name');
        expect(panel.serialize()).toMatchInlineSnapshot(`
          "FILTERS TOOL PANEL
          ▾ Name *
            operator: "Begins with"
            input: "Al"
            AND
            operator: "Contains"
            input: """
        `);
    });

    test('editing in the panel is readable via api.getFilterModel', async () => {
        const api = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                { field: 'name', filter: 'agTextColumnFilter', filterParams: { debounceMs: 0 } },
                { field: 'country', filter: 'agSetColumnFilter' },
            ],
            rowData: [
                { name: 'Alice', country: 'Ireland' },
                { name: 'Bob', country: 'France' },
                { name: 'Albert', country: 'Ireland' },
            ],
            sideBar: FILTERS_SIDEBAR,
        });
        const panel = await openFiltersPanel(api);

        // Build the set filter first, while every country value is still available.
        await panel.expandGroup('Country');
        await panel.toggleSetItem('Country', 'France');
        await panel.expandGroup('Name');
        await panel.setText('Name', 'Al');

        expect(api.getFilterModel()).toEqual({
            name: { filterType: 'text', type: 'contains', filter: 'Al' },
            country: { filterType: 'set', values: ['Ireland'] },
        });
        expect(panel.serialize()).toMatchInlineSnapshot(`
          "FILTERS TOOL PANEL
          ▾ Name *
            operator: "Contains"
            input: "Al"
            AND
            operator: "Contains"
            input: ""
          ▾ Country *
            ▪ (Select All)
            ☐ France
            ☑ Ireland"
        `);
        await new GridRows(api, 'two filters edited in panel').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 name:"Alice" country:"Ireland"
            └── LEAF id:2 name:"Albert" country:"Ireland"
        `);
    });
});
