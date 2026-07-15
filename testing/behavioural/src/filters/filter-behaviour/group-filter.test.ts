import type { GridApi } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    NumberFilterModule,
    TextFilterModule,
    getGridElement,
    setupAgTestIds,
} from 'ag-grid-community';
import { GroupFilterModule, RowGroupingModule, SetFilterModule } from 'ag-grid-enterprise';

import {
    ColumnFilterHarness,
    FilterDom,
    GridColumns,
    GridRows,
    TestGridsManager,
    asyncSetTimeout,
    clickSelectOption,
    getSelectOptionLabels,
    installFilterLayoutMock,
    openPicker,
    uninstallFilterLayoutMock,
} from '../../test-utils';

const AUTO_COL = 'ag-Grid-AutoColumn';

interface Row {
    country: string;
    year: number;
    sport: string;
}

const ROW_DATA: Row[] = [
    { country: 'Italy', year: 2020, sport: 'Ski' },
    { country: 'Italy', year: 2021, sport: 'Swim' },
    { country: 'France', year: 2020, sport: 'Run' },
    { country: 'France', year: 2021, sport: 'Jump' },
    { country: 'Australia', year: 2020, sport: 'Surf' },
];

/** True when the header cell for `colId` shows the active-filter indicator (`ag-header-cell-filtered`). */
function isHeaderFiltered(api: GridApi, colId: string): boolean {
    const gridDiv = getGridElement(api) as HTMLElement;
    const cell = gridDiv.querySelector(`.ag-header-cell[col-id="${colId}"]`);
    return !!cell?.classList.contains('ag-header-cell-filtered');
}

/** The group filter's "Select field:" AgSelect wrapper (present only when the auto col maps to 2+ source columns). */
function groupFieldSelect(): HTMLElement | null {
    return document.querySelector<HTMLElement>('.ag-group-filter-field-select-wrapper');
}

/** Opens the group field AgSelect, returns its option labels, and selects `displayName` to switch level. */
async function switchGroupField(displayName: string): Promise<string[]> {
    const select = groupFieldSelect();
    if (!select) {
        throw new Error('Group filter field select not present (single source column?)');
    }
    await openPicker(select);
    const labels = getSelectOptionLabels();
    await clickSelectOption(displayName);
    await asyncSetTimeout(0);
    return labels;
}

/**
 * Black-box coverage for the Group Column Filter (`agGroupColumnFilter`) on an auto/row-group column.
 * It has no model of its own (`getModel` → null) and delegates to the source column's filter for the
 * current group level. Covers delegation to set/number/text filters, the "Select field:" level switch
 * when one auto column spans multiple levels, `multipleColumns` display, and the active indicator.
 */
describe('Group Column Filter — agGroupColumnFilter', () => {
    const gridsManager = new TestGridsManager({
        modules: [
            ClientSideRowModelModule,
            RowGroupingModule,
            GroupFilterModule,
            SetFilterModule,
            NumberFilterModule,
            TextFilterModule,
        ],
    });

    beforeAll(() => {
        setupAgTestIds();
        installFilterLayoutMock();
    });
    afterAll(() => uninstallFilterLayoutMock());
    afterEach(() => gridsManager.reset());

    test('single group level: delegates to the underlying set filter and filtering a group value filters grouped rows', async () => {
        const api: GridApi = await gridsManager.createGridAndWait<Row>('grid1', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true, filter: 'agSetColumnFilter' },
                { field: 'sport' },
            ],
            autoGroupColumnDef: { filter: 'agGroupColumnFilter' },
            groupDefaultExpanded: -1,
            rowData: ROW_DATA,
        });

        // Single source column ⇒ no "Select field:" dropdown; the underlying set filter is shown directly.
        const filter = await ColumnFilterHarness.open(api, AUTO_COL);
        expect(groupFieldSelect()).toBeNull();
        expect(filter.setFilterItemLabels()).toEqual(['(Select All)', 'Australia', 'France', 'Italy']);

        // The group filter itself has no model; delegation means the model lives on the source column.
        expect(api.getColumnFilterModel(AUTO_COL)).toBeNull();

        await filter.toggleSetItem('Italy');
        await filter.toggleSetItem('Australia');
        await asyncSetTimeout(0);

        // Popup snapshot with the AUTO column's model (null — the group filter has no model of its own).
        await new FilterDom(api, 'group set popup (auto col model)', { colId: AUTO_COL }).checkFilterDom(`
            COLUMN FILTER (set)
            mini-filter: ""
            ▪ (Select All)
            ☐ Australia
            ☑ France
            ☐ Italy
            model: null
        `);
        // Same popup, but reading the underlying source column's model — this is where the applied filter lives.
        await new FilterDom(api, 'group set popup (source col model)', { colId: 'country' }).checkFilterDom(`
            COLUMN FILTER (set)
            mini-filter: ""
            ▪ (Select All)
            ☐ Australia
            ☑ France
            ☐ Italy
            model:
              values:
                - "France"
              filterType: "set"
        `);

        expect(api.getColumnFilterModel(AUTO_COL)).toBeNull();
        expect(api.getColumnFilterModel('country')).toEqual({ values: ['France'], filterType: 'set' });
        expect(api.getFilterModel()).toEqual({ country: { values: ['France'], filterType: 'set' } });
        expect(isHeaderFiltered(api, AUTO_COL)).toBe(true);

        await new GridRows(api, 'single-level set filter keeps only France group + leaves').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France"
            · ├── LEAF id:2 country:"France" sport:"Run"
            · └── LEAF id:3 country:"France" sport:"Jump"
        `);
    });

    test('group filter has no model even when the underlying filter is active', async () => {
        const api: GridApi = await gridsManager.createGridAndWait<Row>('grid1', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true, filter: 'agSetColumnFilter' },
                { field: 'sport' },
            ],
            autoGroupColumnDef: { filter: 'agGroupColumnFilter' },
            groupDefaultExpanded: -1,
            rowData: ROW_DATA,
        });

        await api.setColumnFilterModel('country', { filterType: 'set', values: ['Italy'] });
        api.onFilterChanged();
        await asyncSetTimeout(0);

        // Underlying active, but the auto/group column carries no model and getModel returns null.
        expect(api.getColumnFilterModel(AUTO_COL)).toBeNull();
        expect(api.getColumnFilterModel('country')).toEqual({ values: ['Italy'], filterType: 'set' });
        expect(isHeaderFiltered(api, AUTO_COL)).toBe(true);

        const filter = await ColumnFilterHarness.open(api, AUTO_COL);
        // Opening the popup reflects the already-applied underlying model.
        await new FilterDom(api, 'preapplied underlying set filter', { colId: 'country' }).checkFilterDom(`
            COLUMN FILTER (set)
            mini-filter: ""
            ▪ (Select All)
            ☐ Australia
            ☐ France
            ☑ Italy
            model:
              filterType: "set"
              values:
                - "Italy"
        `);
        expect(filter.getModel()).toBeNull();

        await new GridRows(api, 'preapplied underlying keeps only Italy group + leaves').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            · ├── LEAF id:0 country:"Italy" sport:"Ski"
            · └── LEAF id:1 country:"Italy" sport:"Swim"
        `);
    });

    test("two group levels (singleColumn display): switching the field delegates to that level's filter", async () => {
        const api: GridApi = await gridsManager.createGridAndWait<Row>('grid1', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true, filter: 'agSetColumnFilter' },
                {
                    field: 'year',
                    rowGroup: true,
                    hide: true,
                    filter: 'agNumberColumnFilter',
                    filterParams: { debounceMs: 0 },
                },
                { field: 'sport' },
            ],
            autoGroupColumnDef: { filter: 'agGroupColumnFilter' },
            groupDefaultExpanded: -1,
            rowData: ROW_DATA,
        });

        // One auto column spans both levels ⇒ the "Select field:" dropdown appears with both group columns.
        const filter = await ColumnFilterHarness.open(api, AUTO_COL);
        expect(groupFieldSelect()).not.toBeNull();
        // Default selection is the first level (Country) ⇒ its set filter is shown.
        expect(filter.setFilterItemLabels()).toEqual(['(Select All)', 'Australia', 'France', 'Italy']);
        await new FilterDom(api, 'two-level default shows country set filter', { colId: AUTO_COL }).checkFilterDom(`
            COLUMN FILTER (set)
            mini-filter: ""
            ☑ (Select All)
            ☑ Australia
            ☑ France
            ☑ Italy
            model: null
        `);

        // Switch to the Year level ⇒ the underlying filter becomes the number filter for `year`.
        const fieldLabels = await switchGroupField('Year');
        expect(fieldLabels).toEqual(['Country', 'Year']);
        await filter.selectOperator('Equals');
        await filter.setNumber(2020);
        await asyncSetTimeout(0);

        await new FilterDom(api, 'two-level year number filter (year model)', { colId: 'year' }).checkFilterDom(`
            COLUMN FILTER
            operator: "Equals"
            input: "2020"
            AND
            operator: "Equals"
            input: ""
            model:
              filterType: "number"
              type: "equals"
              filter: 2020
        `);
        expect(api.getColumnFilterModel(AUTO_COL)).toBeNull();
        expect(api.getColumnFilterModel('year')).toEqual({ filterType: 'number', type: 'equals', filter: 2020 });
        expect(api.getColumnFilterModel('country')).toBeNull();
        expect(isHeaderFiltered(api, AUTO_COL)).toBe(true);

        await new GridRows(api, 'year=2020 keeps only 2020 sub-groups + leaves').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            │ └─┬ LEAF_GROUP id:row-group-country-Italy-year-2020 ag-Grid-AutoColumn:2020
            │ · └── LEAF id:0 country:"Italy" year:2020 sport:"Ski"
            ├─┬ filler id:row-group-country-France ag-Grid-AutoColumn:"France"
            │ └─┬ LEAF_GROUP id:row-group-country-France-year-2020 ag-Grid-AutoColumn:2020
            │ · └── LEAF id:2 country:"France" year:2020 sport:"Run"
            └─┬ filler id:row-group-country-Australia ag-Grid-AutoColumn:"Australia"
            · └─┬ LEAF_GROUP id:row-group-country-Australia-year-2020 ag-Grid-AutoColumn:2020
            · · └── LEAF id:4 country:"Australia" year:2020 sport:"Surf"
        `);
    });

    test('two group levels: filters on both levels compound (AND across source columns)', async () => {
        const api: GridApi = await gridsManager.createGridAndWait<Row>('grid1', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true, filter: 'agSetColumnFilter' },
                {
                    field: 'year',
                    rowGroup: true,
                    hide: true,
                    filter: 'agNumberColumnFilter',
                    filterParams: { debounceMs: 0 },
                },
                { field: 'sport' },
            ],
            autoGroupColumnDef: { filter: 'agGroupColumnFilter' },
            groupDefaultExpanded: -1,
            rowData: ROW_DATA,
        });

        // Apply a filter on each source column directly (both delegated-to by the one group filter).
        await api.setColumnFilterModel('country', { filterType: 'set', values: ['Italy', 'France'] });
        await api.setColumnFilterModel('year', { filterType: 'number', type: 'equals', filter: 2021 });
        api.onFilterChanged();
        await asyncSetTimeout(0);

        expect(api.getColumnFilterModel(AUTO_COL)).toBeNull();
        expect(api.getFilterModel()).toEqual({
            country: { values: ['Italy', 'France'], filterType: 'set' },
            year: { filterType: 'number', type: 'equals', filter: 2021 },
        });
        expect(isHeaderFiltered(api, AUTO_COL)).toBe(true);

        await new GridRows(api, 'country in (Italy,France) AND year=2021').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            │ └─┬ LEAF_GROUP id:row-group-country-Italy-year-2021 ag-Grid-AutoColumn:2021
            │ · └── LEAF id:1 country:"Italy" year:2021 sport:"Swim"
            └─┬ filler id:row-group-country-France ag-Grid-AutoColumn:"France"
            · └─┬ LEAF_GROUP id:row-group-country-France-year-2021 ag-Grid-AutoColumn:2021
            · · └── LEAF id:3 country:"France" year:2021 sport:"Jump"
        `);
    });

    test('multipleColumns display: each auto column delegates to its own single source column', async () => {
        const api: GridApi = await gridsManager.createGridAndWait<Row>('grid1', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true, filter: 'agSetColumnFilter' },
                {
                    field: 'year',
                    rowGroup: true,
                    hide: true,
                    filter: 'agNumberColumnFilter',
                    filterParams: { debounceMs: 0 },
                },
                { field: 'sport' },
            ],
            autoGroupColumnDef: { filter: 'agGroupColumnFilter' },
            groupDisplayType: 'multipleColumns',
            groupDefaultExpanded: -1,
            rowData: ROW_DATA,
        });

        // Each group level gets its own auto column: `ag-Grid-AutoColumn-<field>`.
        await new GridColumns(api, 'multipleColumns auto columns').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn-country "Country" width:200
            ├── ag-Grid-AutoColumn-year "Year" width:200
            └── sport "Sport" width:200
        `);

        const yearAutoCol = 'ag-Grid-AutoColumn-year';
        // Single source column per auto column ⇒ no field dropdown.
        const filter = await ColumnFilterHarness.open(api, yearAutoCol);
        expect(groupFieldSelect()).toBeNull();
        await filter.selectOperator('Greater than');
        await filter.setNumber(2020);
        await asyncSetTimeout(0);

        await new FilterDom(api, 'multipleColumns year filter (year model)', { colId: 'year' }).checkFilterDom(`
            COLUMN FILTER
            operator: "Greater than"
            input: "2020"
            AND
            operator: "Equals"
            input: ""
            model:
              filterType: "number"
              type: "greaterThan"
              filter: 2020
        `);
        expect(api.getColumnFilterModel(yearAutoCol)).toBeNull();
        expect(api.getColumnFilterModel('year')).toEqual({ filterType: 'number', type: 'greaterThan', filter: 2020 });
        expect(isHeaderFiltered(api, yearAutoCol)).toBe(true);
        expect(isHeaderFiltered(api, 'ag-Grid-AutoColumn-country')).toBe(false);

        await new GridRows(api, 'multipleColumns year>2020 keeps only 2021 sub-groups').check(`
            ROOT id:ROOT_NODE_ID ag-Grid-AutoColumn-country:null ag-Grid-AutoColumn-year:null
            ├─┬ filler id:row-group-country-Italy ag-Grid-AutoColumn-country:"Italy" ag-Grid-AutoColumn-year:null
            │ └─┬ LEAF_GROUP id:row-group-country-Italy-year-2021 ag-Grid-AutoColumn-year:2021
            │ · └── LEAF id:1 country:"Italy" year:2021 sport:"Swim"
            └─┬ filler id:row-group-country-France ag-Grid-AutoColumn-country:"France" ag-Grid-AutoColumn-year:null
            · └─┬ LEAF_GROUP id:row-group-country-France-year-2021 ag-Grid-AutoColumn-year:2021
            · · └── LEAF id:3 country:"France" year:2021 sport:"Jump"
        `);
    });

    test('delegates to a text underlying filter (typing in the group popup filters grouped rows)', async () => {
        const api: GridApi = await gridsManager.createGridAndWait<Row>('grid1', {
            columnDefs: [
                {
                    field: 'country',
                    rowGroup: true,
                    hide: true,
                    filter: 'agTextColumnFilter',
                    filterParams: { debounceMs: 0 },
                },
                { field: 'sport' },
            ],
            autoGroupColumnDef: { filter: 'agGroupColumnFilter' },
            groupDefaultExpanded: -1,
            rowData: ROW_DATA,
        });

        const filter = await ColumnFilterHarness.open(api, AUTO_COL);
        await filter.selectOperator('Contains');
        await filter.setText('an');
        await asyncSetTimeout(0);

        await new FilterDom(api, 'group text popup (source model)', { colId: 'country' }).checkFilterDom(`
            COLUMN FILTER
            operator: "Contains"
            input: "an"
            AND
            operator: "Contains"
            input: ""
            model:
              filterType: "text"
              type: "contains"
              filter: "an"
        `);
        expect(api.getColumnFilterModel(AUTO_COL)).toBeNull();
        expect(api.getColumnFilterModel('country')).toEqual({ filterType: 'text', type: 'contains', filter: 'an' });

        // Only 'France' contains 'an'.
        await new GridRows(api, 'group text contains "an" keeps France').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France"
            · ├── LEAF id:2 country:"France" sport:"Run"
            · └── LEAF id:3 country:"France" sport:"Jump"
        `);
    });

    test('clearing the underlying filter deactivates the group column indicator', async () => {
        const api: GridApi = await gridsManager.createGridAndWait<Row>('grid1', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true, filter: 'agSetColumnFilter' },
                { field: 'sport' },
            ],
            autoGroupColumnDef: { filter: 'agGroupColumnFilter' },
            groupDefaultExpanded: -1,
            rowData: ROW_DATA,
        });

        await api.setColumnFilterModel('country', { filterType: 'set', values: ['Italy'] });
        api.onFilterChanged();
        await asyncSetTimeout(0);
        expect(isHeaderFiltered(api, AUTO_COL)).toBe(true);
        await new GridRows(api, 'before clear keeps only Italy').check(`
            ROOT id:ROOT_NODE_ID
            └─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            · ├── LEAF id:0 country:"Italy" sport:"Ski"
            · └── LEAF id:1 country:"Italy" sport:"Swim"
        `);

        await api.setColumnFilterModel('country', null);
        api.onFilterChanged();
        await asyncSetTimeout(0);

        expect(api.getColumnFilterModel('country')).toBeNull();
        expect(isHeaderFiltered(api, AUTO_COL)).toBe(false);
        await new GridRows(api, 'after clear shows all groups + leaves').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            │ ├── LEAF id:0 country:"Italy" sport:"Ski"
            │ └── LEAF id:1 country:"Italy" sport:"Swim"
            ├─┬ LEAF_GROUP id:row-group-country-France ag-Grid-AutoColumn:"France"
            │ ├── LEAF id:2 country:"France" sport:"Run"
            │ └── LEAF id:3 country:"France" sport:"Jump"
            └─┬ LEAF_GROUP id:row-group-country-Australia ag-Grid-AutoColumn:"Australia"
            · └── LEAF id:4 country:"Australia" sport:"Surf"
        `);
    });

    test("switching levels in the popup preserves each level's independent filter (both compound)", async () => {
        const api: GridApi = await gridsManager.createGridAndWait<Row>('grid1', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true, filter: 'agSetColumnFilter' },
                {
                    field: 'year',
                    rowGroup: true,
                    hide: true,
                    filter: 'agNumberColumnFilter',
                    filterParams: { debounceMs: 0 },
                },
                { field: 'sport' },
            ],
            autoGroupColumnDef: { filter: 'agGroupColumnFilter' },
            groupDefaultExpanded: -1,
            rowData: ROW_DATA,
        });

        const filter = await ColumnFilterHarness.open(api, AUTO_COL);

        // Default level is Country: keep only Italy + France via the set filter.
        await filter.toggleSetItem('Australia');
        await asyncSetTimeout(0);
        expect(api.getColumnFilterModel('country')).toEqual({ values: ['France', 'Italy'], filterType: 'set' });

        // Switch to Year and add an independent number filter — the country filter must stay applied.
        await switchGroupField('Year');
        await filter.selectOperator('Equals');
        await filter.setNumber(2021);
        await asyncSetTimeout(0);

        expect(api.getColumnFilterModel('country')).toEqual({ values: ['France', 'Italy'], filterType: 'set' });
        expect(api.getColumnFilterModel('year')).toEqual({ filterType: 'number', type: 'equals', filter: 2021 });
        expect(api.getColumnFilterModel(AUTO_COL)).toBeNull();
        await new GridRows(api, 'country in (Italy,France) AND year=2021 via popup switch').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ filler id:row-group-country-Italy ag-Grid-AutoColumn:"Italy"
            │ └─┬ LEAF_GROUP id:row-group-country-Italy-year-2021 ag-Grid-AutoColumn:2021
            │ · └── LEAF id:1 country:"Italy" year:2021 sport:"Swim"
            └─┬ filler id:row-group-country-France ag-Grid-AutoColumn:"France"
            · └─┬ LEAF_GROUP id:row-group-country-France-year-2021 ag-Grid-AutoColumn:2021
            · · └── LEAF id:3 country:"France" year:2021 sport:"Jump"
        `);

        // Switch back to Country — the country model is preserved and reflected in the popup. (The Set
        // Filter list re-derives on re-attach, so Australia — which has no rows left under year=2021 — is
        // dropped from the list; France + Italy remain and stay selected.)
        await switchGroupField('Country');
        await new FilterDom(api, 'country level still shows Italy+France selected', { colId: 'country' })
            .checkFilterDom(`
            COLUMN FILTER (set)
            mini-filter: ""
            ☑ (Select All)
            ☑ France
            ☑ Italy
            model:
              values:
                - "France"
                - "Italy"
              filterType: "set"
        `);
    });
});
