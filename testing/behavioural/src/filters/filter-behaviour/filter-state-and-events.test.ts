import { waitFor } from '@testing-library/dom';
import {
    ColumnFilterHarness,
    FilterDom,
    GridRows,
    TestGridsManager,
    asyncSetTimeout,
    installFilterLayoutMock,
    uninstallFilterLayoutMock,
} from 'ag-test-utils';

import type { FilterChangedEvent, FilterModifiedEvent, GridApi, GridState } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    GridStateModule,
    NumberFilterModule,
    TextFilterModule,
    getGridElement,
    setupAgTestIds,
} from 'ag-grid-community';
import { FiltersToolPanelModule, SetFilterModule } from 'ag-grid-enterprise';

import { FILTERS_SIDEBAR, openFiltersPanel } from './toolPanelHarness';

interface Athlete {
    athlete: string;
    age: number;
    country: string;
}

const ATHLETES: Athlete[] = [
    { athlete: 'Michael Phelps', age: 23, country: 'United States' },
    { athlete: 'Natalie Coughlin', age: 25, country: 'United States' },
    { athlete: 'Aleksey Nemov', age: 24, country: 'Russia' },
    { athlete: 'Alicia Coutts', age: 24, country: 'Australia' },
    { athlete: 'Missy Franklin', age: 17, country: 'United States' },
    { athlete: 'Ian Thorpe', age: 17, country: 'Australia' },
];

const filterCols = [
    { field: 'athlete', filter: 'agTextColumnFilter', filterParams: { debounceMs: 0 } },
    { field: 'age', filter: 'agNumberColumnFilter', filterParams: { debounceMs: 0 } },
    { field: 'country', filter: 'agSetColumnFilter' },
];

/**
 * Black-box coverage for filter STATE persistence (getState/initialState round-trip) and filter EVENTS
 * (filterModified while typing, filterChanged source/columns payloads, api.onFilterChanged re-evaluation).
 * Complements filter-manager-api (whole-grid model) and grid-state (setState) — here the emphasis is the
 * initialState recreate-a-grid path and the event contracts, both proven with GridRows.
 */
describe('Filter State & Events', () => {
    const gridsManager = new TestGridsManager({
        modules: [
            TextFilterModule,
            NumberFilterModule,
            SetFilterModule,
            FiltersToolPanelModule,
            GridStateModule,
            ClientSideRowModelModule,
        ],
    });

    beforeAll(() => {
        setupAgTestIds();
        installFilterLayoutMock();
    });
    afterAll(() => uninstallFilterLayoutMock());
    afterEach(() => gridsManager.reset());

    // ===== STATE: getState() -> initialState round-trip (recreate grid) =====

    test('text filter set via UI is captured by getState and restored into a fresh grid via initialState', async () => {
        const api1: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: filterCols,
            rowData: ATHLETES,
        });

        // No filter yet ⇒ no filter section in state.
        expect(api1.getState().filter).toBeUndefined();

        const filter = await ColumnFilterHarness.open(api1, 'athlete');
        await filter.selectOperator('Contains');
        await filter.setText('i');
        await asyncSetTimeout(0);

        expect(api1.getFilterModel()).toEqual({ athlete: { filterType: 'text', type: 'contains', filter: 'i' } });
        await new GridRows(api1, 'source grid athlete contains i').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 athlete:"Michael Phelps" age:23 country:"United States"
            ├── LEAF id:1 athlete:"Natalie Coughlin" age:25 country:"United States"
            ├── LEAF id:3 athlete:"Alicia Coutts" age:24 country:"Australia"
            ├── LEAF id:4 athlete:"Missy Franklin" age:17 country:"United States"
            └── LEAF id:5 athlete:"Ian Thorpe" age:17 country:"Australia"
        `);

        const capturedFilter = api1.getState().filter;
        expect(capturedFilter?.filterModel).toEqual({
            athlete: { filterType: 'text', type: 'contains', filter: 'i' },
        });

        // Recreate a brand-new grid seeded with the captured state via initialState — rows must match.
        const api2: GridApi = await gridsManager.createGridAndWait('grid2', {
            columnDefs: filterCols,
            rowData: ATHLETES,
            initialState: { filter: capturedFilter } as GridState,
        });

        expect(api2.getFilterModel()).toEqual({ athlete: { filterType: 'text', type: 'contains', filter: 'i' } });
        await new GridRows(api2, 'restored grid athlete contains i').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 athlete:"Michael Phelps" age:23 country:"United States"
            ├── LEAF id:1 athlete:"Natalie Coughlin" age:25 country:"United States"
            ├── LEAF id:3 athlete:"Alicia Coutts" age:24 country:"Australia"
            ├── LEAF id:4 athlete:"Missy Franklin" age:17 country:"United States"
            └── LEAF id:5 athlete:"Ian Thorpe" age:17 country:"Australia"
        `);
    });

    test('multi-column model (text+number+set) round-trips through getState/initialState', async () => {
        const api1: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: filterCols,
            rowData: ATHLETES,
        });

        api1.setFilterModel({
            athlete: { filterType: 'text', type: 'contains', filter: 'i' },
            age: { filterType: 'number', type: 'lessThan', filter: 25 },
            country: { filterType: 'set', values: ['United States'] },
        });
        await asyncSetTimeout(0);
        await new GridRows(api1, 'source grid combined').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 athlete:"Michael Phelps" age:23 country:"United States"
            └── LEAF id:4 athlete:"Missy Franklin" age:17 country:"United States"
        `);

        const capturedFilter = api1.getState().filter;
        expect(capturedFilter?.filterModel).toEqual({
            athlete: { filterType: 'text', type: 'contains', filter: 'i' },
            age: { filterType: 'number', type: 'lessThan', filter: 25 },
            country: { filterType: 'set', values: ['United States'] },
        });

        const api2: GridApi = await gridsManager.createGridAndWait('grid2', {
            columnDefs: filterCols,
            rowData: ATHLETES,
            initialState: { filter: capturedFilter } as GridState,
        });

        expect(api2.getFilterModel()).toEqual({
            athlete: { filterType: 'text', type: 'contains', filter: 'i' },
            age: { filterType: 'number', type: 'lessThan', filter: 25 },
            country: { filterType: 'set', values: ['United States'] },
        });
        await new GridRows(api2, 'restored grid combined').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 athlete:"Michael Phelps" age:23 country:"United States"
            └── LEAF id:4 athlete:"Missy Franklin" age:17 country:"United States"
        `);
    });

    test('a two-condition compound model round-trips through initialState and drives the panel', async () => {
        const api1: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: filterCols,
            rowData: ATHLETES,
        });

        await api1.setColumnFilterModel('athlete', {
            filterType: 'text',
            operator: 'OR',
            conditions: [
                { filterType: 'text', type: 'startsWith', filter: 'M' },
                { filterType: 'text', type: 'startsWith', filter: 'I' },
            ],
        });
        api1.onFilterChanged();
        await asyncSetTimeout(0);
        await new GridRows(api1, 'source grid compound OR').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 athlete:"Michael Phelps" age:23 country:"United States"
            ├── LEAF id:4 athlete:"Missy Franklin" age:17 country:"United States"
            └── LEAF id:5 athlete:"Ian Thorpe" age:17 country:"Australia"
        `);

        const capturedFilter = api1.getState().filter;

        const api2: GridApi = await gridsManager.createGridAndWait('grid2', {
            columnDefs: filterCols,
            rowData: ATHLETES,
            initialState: { filter: capturedFilter } as GridState,
        });
        await new GridRows(api2, 'restored grid compound OR').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 athlete:"Michael Phelps" age:23 country:"United States"
            ├── LEAF id:4 athlete:"Missy Franklin" age:17 country:"United States"
            └── LEAF id:5 athlete:"Ian Thorpe" age:17 country:"Australia"
        `);

        // The restored model must also drive the popup UI when opened.
        await ColumnFilterHarness.open(api2, 'athlete');
        await new FilterDom(api2, 'restored compound panel', { colId: 'athlete' }).checkFilterDom(`
            COLUMN FILTER
            operator: "Begins with"
            input: "M"
            OR
            operator: "Begins with"
            input: "I"
            model:
              filterType: "text"
              operator: "OR"
              conditions:
                - filterType: "text"
                  type: "startsWith"
                  filter: "M"
                - filterType: "text"
                  type: "startsWith"
                  filter: "I"
        `);
    });

    // ===== EVENTS: filterModified while typing, before apply =====

    test('filterModified fires on each UI edit while filterChanged waits for Apply', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'athlete',
                    filter: 'agTextColumnFilter',
                    filterParams: { maxNumConditions: 1, buttons: ['apply', 'clear'] },
                },
                { field: 'age', filter: 'agNumberColumnFilter', filterParams: { debounceMs: 0 } },
                { field: 'country', filter: 'agSetColumnFilter' },
            ],
            rowData: ATHLETES,
        });

        const modified: FilterModifiedEvent[] = [];
        const changed: FilterChangedEvent[] = [];
        const onModified = (e: FilterModifiedEvent) => modified.push(e);
        const onChanged = (e: FilterChangedEvent) => changed.push(e);
        api.addEventListener('filterModified', onModified);
        api.addEventListener('filterChanged', onChanged);

        const instance = await api.getColumnFilterInstance('athlete');

        const filter = await ColumnFilterHarness.open(api, 'athlete');
        await filter.selectOperator('Contains');
        await filter.setText('Phelps');
        await asyncSetTimeout(0);

        // Typing fires filterModified (carrying the live instance + column), but no apply ⇒ no filterChanged yet.
        expect(modified.length).toBeGreaterThanOrEqual(1);
        expect(modified.every((e) => e.column.getColId() === 'athlete')).toBe(true);
        expect(modified[modified.length - 1].filterInstance).toBe(instance);
        expect(changed).toHaveLength(0);
        expect(api.getColumnFilterModel('athlete')).toBeNull();
        await new GridRows(api, 'pending edit not applied').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 athlete:"Michael Phelps" age:23 country:"United States"
            ├── LEAF id:1 athlete:"Natalie Coughlin" age:25 country:"United States"
            ├── LEAF id:2 athlete:"Aleksey Nemov" age:24 country:"Russia"
            ├── LEAF id:3 athlete:"Alicia Coutts" age:24 country:"Australia"
            ├── LEAF id:4 athlete:"Missy Franklin" age:17 country:"United States"
            └── LEAF id:5 athlete:"Ian Thorpe" age:17 country:"Australia"
        `);

        // Apply commits the model ⇒ exactly one filterChanged, source 'columnFilter'.
        await filter.apply();
        await asyncSetTimeout(0);
        expect(changed).toHaveLength(1);
        expect(changed[0].source).toBe('columnFilter');
        expect(api.getColumnFilterModel('athlete')).toEqual({
            filterType: 'text',
            type: 'contains',
            filter: 'Phelps',
        });
        await new GridRows(api, 'applied edit').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 athlete:"Michael Phelps" age:23 country:"United States"
        `);

        api.removeEventListener('filterModified', onModified);
        api.removeEventListener('filterChanged', onChanged);
    });

    // ===== EVENTS: filterChanged source + columns payload =====

    test('filterChanged reports source "columnFilter" and the edited column for UI edits', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: filterCols,
            rowData: ATHLETES,
        });

        const changed: FilterChangedEvent[] = [];
        const onChanged = (e: FilterChangedEvent) => changed.push(e);
        api.addEventListener('filterChanged', onChanged);

        const filter = await ColumnFilterHarness.open(api, 'age');
        await filter.selectOperator('Greater than');
        await filter.setNumber(24);
        await asyncSetTimeout(0);

        expect(changed.length).toBeGreaterThanOrEqual(1);
        const last = changed[changed.length - 1];
        expect(last.source).toBe('columnFilter');
        expect(last.columns.map((c) => c.getColId())).toEqual(['age']);
        await new GridRows(api, 'columnFilter source age>24').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:1 athlete:"Natalie Coughlin" age:25 country:"United States"
        `);

        api.removeEventListener('filterChanged', onChanged);
    });

    test('api.onFilterChanged fires source "api" with an empty columns array', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: filterCols,
            rowData: ATHLETES,
        });

        const changed: FilterChangedEvent[] = [];
        const onChanged = (e: FilterChangedEvent) => changed.push(e);
        api.addEventListener('filterChanged', onChanged);

        api.onFilterChanged();
        await asyncSetTimeout(0);

        expect(changed).toHaveLength(1);
        expect(changed[0].source).toBe('api');
        // Per the FilterChangedEvent contract, onFilterChanged() carries zero affected columns.
        expect(changed[0].columns).toEqual([]);
        await new GridRows(api, 'onFilterChanged no-op keeps all rows').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 athlete:"Michael Phelps" age:23 country:"United States"
            ├── LEAF id:1 athlete:"Natalie Coughlin" age:25 country:"United States"
            ├── LEAF id:2 athlete:"Aleksey Nemov" age:24 country:"Russia"
            ├── LEAF id:3 athlete:"Alicia Coutts" age:24 country:"Australia"
            ├── LEAF id:4 athlete:"Missy Franklin" age:17 country:"United States"
            └── LEAF id:5 athlete:"Ian Thorpe" age:17 country:"Australia"
        `);

        api.removeEventListener('filterChanged', onChanged);
    });

    test('api.onFilterChanged re-evaluates a column filter whose filterValueGetter reads external state', async () => {
        let ageOffset = 0;
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'age',
                    filter: 'agNumberColumnFilter',
                    filterParams: { debounceMs: 0 },
                    // Filtered value depends on mutable external state, so onFilterChanged must re-run it.
                    filterValueGetter: (p: { data: Athlete }) => p.data.age + ageOffset,
                },
                { field: 'athlete' },
            ],
            rowData: ATHLETES,
        });

        await api.setColumnFilterModel('age', { filterType: 'number', type: 'greaterThan', filter: 24 });
        api.onFilterChanged();
        await asyncSetTimeout(0);
        // offset 0: only ages strictly above 24 pass (25).
        await new GridRows(api, 'valueGetter offset 0').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:1 age:25 athlete:"Natalie Coughlin"
        `);

        // Mutate external state and force re-evaluation without touching the model.
        ageOffset = 10;
        api.onFilterChanged();
        await asyncSetTimeout(0);
        // Lowest age (17) + 10 = 27 > 24, so every row now passes without any model change.
        await new GridRows(api, 'valueGetter offset 10').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 age:23 athlete:"Michael Phelps"
            ├── LEAF id:1 age:25 athlete:"Natalie Coughlin"
            ├── LEAF id:2 age:24 athlete:"Aleksey Nemov"
            ├── LEAF id:3 age:24 athlete:"Alicia Coutts"
            ├── LEAF id:4 age:17 athlete:"Missy Franklin"
            └── LEAF id:5 age:17 athlete:"Ian Thorpe"
        `);
    });

    // ===== SET FILTER: mini-filter list visibility after a reload (state restore / data change) =====
    // "li" matches exactly Natalie Coughlin, Alicia Coutts, Missy Franklin.
    const LI_MATCHES = ['(Select All)', 'Alicia Coutts', 'Missy Franklin', 'Natalie Coughlin'];

    test('set filter open at state-restore re-filters the list, not "No matches"', async () => {
        const setCols = [{ field: 'athlete', filter: 'agSetColumnFilter' }];

        const api1: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: setCols,
            rowData: ATHLETES,
            sideBar: FILTERS_SIDEBAR,
        });
        const panel1 = await openFiltersPanel(api1);
        await panel1.expandGroup('Athlete');
        await panel1.setMiniFilter('Athlete', 'li');

        // Baseline: the open filter shows the 3 matching athletes, no "No matches".
        expect(panel1.setFilterItemLabels('Athlete')).toEqual(LI_MATCHES);
        expect(panel1.isNoMatchesShown('Athlete')).toBe(false);

        // The captured state carries the mini-filter text and the expanded (open) athlete filter.
        const state = api1.getState();
        expect(state.filter?.columnFilterState?.athlete).toEqual({ miniFilterValue: 'li' });
        expect(state.sideBar?.toolPanels?.filters?.expandedColIds).toContain('athlete');

        // Recreate a fresh grid seeded with the state: the athlete filter is open at restore time.
        const api2: GridApi = await gridsManager.createGridAndWait('grid2', {
            columnDefs: setCols,
            rowData: ATHLETES,
            sideBar: FILTERS_SIDEBAR,
            initialState: state,
        });
        const panel2 = await openFiltersPanel(api2);

        // The set filter loads its display values asynchronously after the panel attaches, so wait for
        // the matching options to appear rather than guessing a fixed delay. The restored open filter
        // must show the same 3 options — not the stale "No matches".
        await waitFor(() => expect(panel2.setFilterItemLabels('Athlete')).toEqual(LI_MATCHES));
        expect(panel2.isNoMatchesShown('Athlete')).toBe(false);
        expect(panel2.isSetListShown('Athlete')).toBe(true);
    });

    test('data change re-filters an open set filter mini-filter list, not stale "No matches"', async () => {
        const setCols = [{ field: 'athlete', filter: 'agSetColumnFilter' }];
        const noMatchData = [{ athlete: 'Michael Phelps' }, { athlete: 'Ian Thorpe' }, { athlete: 'Aleksey Nemov' }];

        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: setCols,
            rowData: noMatchData,
            sideBar: FILTERS_SIDEBAR,
        });
        const panel = await openFiltersPanel(api);
        await panel.expandGroup('Athlete');
        await panel.setMiniFilter('Athlete', 'li');

        // No current athlete matches "li" ⇒ the open filter correctly shows "No matches".
        expect(panel.isNoMatchesShown('Athlete')).toBe(true);
        expect(panel.isSetListShown('Athlete')).toBe(false);

        // Row data now includes matching athletes; the open filter must re-show the list. The reload
        // is async, so wait for the matching options to appear rather than a fixed delay.
        api.setGridOption('rowData', ATHLETES);

        await waitFor(() => expect(panel.setFilterItemLabels('Athlete')).toEqual(LI_MATCHES));
        expect(panel.isNoMatchesShown('Athlete')).toBe(false);
        expect(panel.isSetListShown('Athlete')).toBe(true);
    });

    test('set filter closed at state-restore still filters correctly when later opened', async () => {
        const setCols = [{ field: 'athlete', filter: 'agSetColumnFilter' }];
        // The columnFilterState shape verified against real getState() above; here the filter is closed at restore.
        const state = { filter: { columnFilterState: { athlete: { miniFilterValue: 'li' } } } } as GridState;

        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: setCols,
            rowData: ATHLETES,
            initialState: state,
        });

        // Filter was closed at restore; open it now via the column menu. Values load asynchronously,
        // so wait for the matching options rather than a fixed delay.
        const filter = await ColumnFilterHarness.open(api, 'athlete');

        await waitFor(() => expect(filter.setFilterItemLabels()).toEqual(LI_MATCHES));
        const noMatches = document.querySelector('.ag-filter-menu .ag-filter-no-matches');
        expect(noMatches?.classList.contains('ag-hidden')).toBe(true);
    });

    // ===== STATE: api.setState() restore of the Filters Tool Panel expansion =====

    test('api.setState restores an expanded Filters Tool Panel column filter (expandedColIds)', async () => {
        // grid1: expand the Athlete column filter, then capture the state (save side works).
        const api1: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: filterCols,
            rowData: ATHLETES,
            sideBar: FILTERS_SIDEBAR,
        });
        const panel1 = await openFiltersPanel(api1);
        await panel1.expandGroup('Athlete');

        const state = api1.getState();
        expect(state.sideBar?.toolPanels?.filters?.expandedColIds).toContain('athlete');

        // grid2: a fresh grid with NO initial state. Opening its panel initialises the tool panel
        // (this sets the internal one-time initial-state latch) with every filter collapsed.
        const api2: GridApi = await gridsManager.createGridAndWait('grid2', {
            columnDefs: filterCols,
            rowData: ATHLETES,
            sideBar: FILTERS_SIDEBAR,
        });
        const panel2 = await openFiltersPanel(api2);
        expect(panel2.isGroupExpandedByTitle('Athlete')).toBe(false);

        // Restore the captured state through the api.setState path (the reported failing path).
        api2.setState(state);

        // The Athlete filter must now be expanded on grid2: its filter body is revealed. Scope the
        // body query to grid2 (grid1 is still alive with its own expanded Athlete filter).
        const grid2Root = getGridElement(api2) as HTMLElement;
        await waitFor(() => {
            expect(grid2Root.querySelector('.ag-filter-toolpanel-instance-body .ag-filter-wrapper')).not.toBeNull();
            expect(panel2.isGroupExpandedByTitle('Athlete')).toBe(true);
        });
        // Lossless round-trip (secondary check — the derived state value the restore drives).
        expect(api2.getState().sideBar?.toolPanels?.filters?.expandedColIds).toContain('athlete');
    });

    test('api.setState restores an expanded Filters Tool Panel column group (expandedGroupIds)', async () => {
        const groupCols = [
            {
                headerName: 'Group A',
                groupId: 'groupA',
                children: [
                    { field: 'athlete', filter: 'agTextColumnFilter', filterParams: { debounceMs: 0 } },
                    { field: 'age', filter: 'agNumberColumnFilter', filterParams: { debounceMs: 0 } },
                ],
            },
        ];

        // grid1: a real column group is expanded by default; capture the state (save side works).
        const api1: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: groupCols,
            rowData: ATHLETES,
            sideBar: FILTERS_SIDEBAR,
        });
        const panel1 = await openFiltersPanel(api1);
        expect(panel1.isGroupExpandedByTitle('Group A')).toBe(true);

        const state = api1.getState();
        const savedGroupIds = state.sideBar?.toolPanels?.filters?.expandedGroupIds ?? [];
        expect(savedGroupIds.length).toBeGreaterThan(0);

        // grid2: a real group defaults to expanded, so live-collapse it first — this makes the
        // assertion discriminate (without the fix the live-collapsed state wins and it stays collapsed).
        const api2: GridApi = await gridsManager.createGridAndWait('grid2', {
            columnDefs: groupCols,
            rowData: ATHLETES,
            sideBar: FILTERS_SIDEBAR,
        });
        const panel2 = await openFiltersPanel(api2);
        await panel2.collapseGroup('Group A');
        expect(panel2.isGroupExpandedByTitle('Group A')).toBe(false);

        // Restore via api.setState: the group must be re-expanded from expandedGroupIds.
        api2.setState(state);
        await waitFor(() => expect(panel2.isGroupExpandedByTitle('Group A')).toBe(true));
    });

    test('api.setState restore of the Filters Tool Panel is authoritative (empty ids collapse a live-expanded filter)', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: filterCols,
            rowData: ATHLETES,
            sideBar: FILTERS_SIDEBAR,
        });
        const panel = await openFiltersPanel(api);
        await panel.expandGroup('Athlete');

        // Precondition: the Athlete filter is genuinely live-expanded (body revealed).
        const gridRoot = getGridElement(api) as HTMLElement;
        expect(gridRoot.querySelector('.ag-filter-toolpanel-instance-body .ag-filter-wrapper')).not.toBeNull();
        expect(panel.isGroupExpandedByTitle('Athlete')).toBe(true);

        // Restore a state derived from the current one but with no expanded filters. Keep the rest of
        // the sideBar slice (visible/openToolPanel) so the panel stays open and the assertion is not
        // satisfied trivially by the panel closing.
        const state = api.getState();
        const collapsedState: GridState = {
            ...state,
            sideBar: {
                ...state.sideBar!,
                toolPanels: {
                    ...state.sideBar!.toolPanels,
                    filters: { expandedColIds: [], expandedGroupIds: [] },
                },
            },
        };
        api.setState(collapsedState);

        await waitFor(() => {
            expect(panel.columnTitles()).toContain('Athlete'); // panel still open
            expect(panel.isGroupExpandedByTitle('Athlete')).toBe(false);
            expect(gridRoot.querySelector('.ag-filter-toolpanel-instance-body .ag-filter-wrapper')).toBeNull();
        });
    });

    test('refreshToolPanel keeps live expansion on an initialState-built grid', async () => {
        const cols = [
            { field: 'athlete', filter: 'agTextColumnFilter', filterParams: { debounceMs: 0 } },
            { field: 'age', filter: 'agNumberColumnFilter', filterParams: { debounceMs: 0 } },
        ];
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: cols,
            rowData: ATHLETES,
            sideBar: FILTERS_SIDEBAR,
            initialState: {
                sideBar: {
                    visible: true,
                    position: 'right',
                    openToolPanel: 'filters',
                    toolPanels: { filters: { expandedGroupIds: [], expandedColIds: ['athlete'] } },
                },
            },
        });
        const panel = await openFiltersPanel(api);
        // initialState expanded athlete. Now change it live: collapse athlete, expand age.
        await panel.collapseGroup('Athlete');
        await panel.expandGroup('Age');
        expect(panel.isGroupExpandedByTitle('Athlete')).toBe(false);
        expect(panel.isGroupExpandedByTitle('Age')).toBe(true);

        // refreshToolPanel must NOT revert to the construction-time initialState.
        api.refreshToolPanel();
        await waitFor(() => {
            expect(panel.isGroupExpandedByTitle('Age')).toBe(true);
            expect(panel.isGroupExpandedByTitle('Athlete')).toBe(false);
        });
    });

    test('distinct api.setState restores interleaved with refreshToolPanel each apply cleanly', async () => {
        // Capture two states from a source grid: Athlete expanded, and Athlete collapsed.
        const source: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: filterCols,
            rowData: ATHLETES,
            sideBar: FILTERS_SIDEBAR,
        });
        const sourcePanel = await openFiltersPanel(source);
        await sourcePanel.expandGroup('Athlete');
        const expandedState = source.getState();
        expect(expandedState.sideBar?.toolPanels?.filters?.expandedColIds).toContain('athlete');
        await sourcePanel.collapseGroup('Athlete');
        const collapsedState = source.getState();
        expect(collapsedState.sideBar?.toolPanels?.filters?.expandedColIds ?? []).not.toContain('athlete');

        const api: GridApi = await gridsManager.createGridAndWait('grid2', {
            columnDefs: filterCols,
            rowData: ATHLETES,
            sideBar: FILTERS_SIDEBAR,
        });
        const panel = await openFiltersPanel(api);

        // First restore expands Athlete; a refresh in between must not disturb it.
        api.setState(expandedState);
        await waitFor(() => expect(panel.isGroupExpandedByTitle('Athlete')).toBe(true));
        api.refreshToolPanel();
        await waitFor(() => expect(panel.isGroupExpandedByTitle('Athlete')).toBe(true));

        // Second restore (authoritative) collapses it — the one-shot signal must fire again.
        api.setState(collapsedState);
        await waitFor(() => expect(panel.isGroupExpandedByTitle('Athlete')).toBe(false));
    });
});
