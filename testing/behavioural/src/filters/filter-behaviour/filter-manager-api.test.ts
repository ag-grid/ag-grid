import { waitFor } from '@testing-library/dom';
import { userEvent } from '@testing-library/user-event';
import {
    ALL_SEVERITIES,
    ColumnFilterHarness,
    FilterDom,
    FloatingFilterHarness,
    GridRows,
    TestGridsManager,
    asyncSetTimeout,
    installFilterLayoutMock,
    uninstallFilterLayoutMock,
} from 'ag-test-utils';

import type {
    FilterChangedEvent,
    FilterDisplayComp,
    GridApi,
    IDoesFilterPassParams,
    IFilterComp,
    IFilterParams,
    IRowNode,
    SetFilterHandler,
} from 'ag-grid-community';
import {
    AgPromise,
    ClientSideRowModelModule,
    CustomFilterModule,
    DateFilterModule,
    ExternalFilterModule,
    GridStateModule,
    NumberFilterModule,
    TextFilterModule,
    enableDevValidations,
    getGridElement,
    setupAgTestIds,
} from 'ag-grid-community';
import { SetFilterModule } from 'ag-grid-enterprise';

interface Person {
    athlete: string;
    age: number;
    country: string;
}

const PEOPLE: Person[] = [
    { athlete: 'Michael Phelps', age: 23, country: 'United States' },
    { athlete: 'Natalie Coughlin', age: 25, country: 'United States' },
    { athlete: 'Aleksey Nemov', age: 24, country: 'Russia' },
    { athlete: 'Alicia Coutts', age: 24, country: 'Australia' },
    { athlete: 'Missy Franklin', age: 17, country: 'United States' },
    { athlete: 'Ryan Lochte', age: 27, country: 'United States' },
    { athlete: 'Ian Thorpe', age: 17, country: 'Australia' },
];

/**
 * Black-box coverage for the whole-grid filter-manager API surface (community): get/setFilterModel
 * across text+number+set columns, presence queries, getColumnFilterInstance, destroyFilter, the
 * filterChanged event source, external filters vs column filters, and the single-column accessors.
 */
describe('Filter Manager API — whole-grid model & external filters', () => {
    const gridsManager = new TestGridsManager({
        modules: [
            TextFilterModule,
            NumberFilterModule,
            SetFilterModule,
            CustomFilterModule,
            ExternalFilterModule,
            GridStateModule,
            ClientSideRowModelModule,
        ],
    });

    beforeAll(() => {
        setupAgTestIds();
        installFilterLayoutMock();
    });
    afterAll(() => uninstallFilterLayoutMock());
    afterEach(() => {
        gridsManager.reset();
        vi.restoreAllMocks();
        enableDevValidations({ throwOn: ALL_SEVERITIES });
    });

    const threeFilterCols = [
        { field: 'athlete', filter: 'agTextColumnFilter', filterParams: { debounceMs: 0 } },
        { field: 'age', filter: 'agNumberColumnFilter', filterParams: { debounceMs: 0 } },
        { field: 'country', filter: 'agSetColumnFilter' },
    ];

    test('setFilterModel applies text+number+set filters together; getFilterModel round-trips', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: threeFilterCols,
            rowData: PEOPLE,
        });

        // Nothing applied yet: whole grid unfiltered.
        expect(api.getFilterModel()).toEqual({});
        expect(api.isAnyFilterPresent()).toBe(false);
        expect(api.isColumnFilterPresent()).toBe(false);

        api.setFilterModel({
            athlete: { filterType: 'text', type: 'contains', filter: 'i' },
            age: { filterType: 'number', type: 'lessThan', filter: 25 },
            country: { filterType: 'set', values: ['United States'] },
        });
        await asyncSetTimeout(0);

        // The three filters AND together across columns.
        expect(api.getFilterModel()).toEqual({
            athlete: { filterType: 'text', type: 'contains', filter: 'i' },
            age: { filterType: 'number', type: 'lessThan', filter: 25 },
            country: { filterType: 'set', values: ['United States'] },
        });
        expect(api.isAnyFilterPresent()).toBe(true);
        expect(api.isColumnFilterPresent()).toBe(true);
        await new GridRows(api, 'combined text+number+set').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 athlete:"Michael Phelps" age:23 country:"United States"
            └── LEAF id:4 athlete:"Missy Franklin" age:17 country:"United States"
        `);

        // Clearing via null removes every column filter and restores all rows.
        api.setFilterModel(null);
        await asyncSetTimeout(0);
        expect(api.getFilterModel()).toEqual({});
        expect(api.isAnyFilterPresent()).toBe(false);
        await new GridRows(api, 'cleared via setFilterModel(null)').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 athlete:"Michael Phelps" age:23 country:"United States"
            ├── LEAF id:1 athlete:"Natalie Coughlin" age:25 country:"United States"
            ├── LEAF id:2 athlete:"Aleksey Nemov" age:24 country:"Russia"
            ├── LEAF id:3 athlete:"Alicia Coutts" age:24 country:"Australia"
            ├── LEAF id:4 athlete:"Missy Franklin" age:17 country:"United States"
            ├── LEAF id:5 athlete:"Ryan Lochte" age:27 country:"United States"
            └── LEAF id:6 athlete:"Ian Thorpe" age:17 country:"Australia"
        `);
    });

    test('setFilterModel can update a subset of columns, leaving the model of others intact', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: threeFilterCols,
            rowData: PEOPLE,
        });

        api.setFilterModel({ country: { filterType: 'set', values: ['Australia'] } });
        await asyncSetTimeout(0);
        expect(api.getFilterModel()).toEqual({ country: { filterType: 'set', values: ['Australia'] } });
        await new GridRows(api, 'set filter only').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:3 athlete:"Alicia Coutts" age:24 country:"Australia"
            └── LEAF id:6 athlete:"Ian Thorpe" age:17 country:"Australia"
        `);

        // A second setFilterModel replaces the whole model: passing only `age` drops the country filter.
        api.setFilterModel({ age: { filterType: 'number', type: 'greaterThan', filter: 24 } });
        await asyncSetTimeout(0);
        expect(api.getFilterModel()).toEqual({ age: { filterType: 'number', type: 'greaterThan', filter: 24 } });
        await new GridRows(api, 'replaced with number filter only').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:1 athlete:"Natalie Coughlin" age:25 country:"United States"
            └── LEAF id:5 athlete:"Ryan Lochte" age:27 country:"United States"
        `);
    });

    test('isColumnFilterPresent / isAnyFilterPresent reflect the presence of a non-null model', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: threeFilterCols,
            rowData: PEOPLE,
        });

        // Characterisation of a candidate bug (flagged, not yet changed): an API-set empty-value
        // condition counts as present (model != null) yet its '' maps to null which the matcher
        // rejects, so every row is excluded — unlike the UI, which nulls such incomplete conditions.
        // Whether the API should mirror the UI is an open fail-open-vs-fail-closed product decision.
        api.setFilterModel({ athlete: { filterType: 'text', type: 'contains', filter: '' } });
        await asyncSetTimeout(0);
        expect(api.isColumnFilterPresent()).toBe(true);
        expect(api.isAnyFilterPresent()).toBe(true);
        expect(api.getDisplayedRowCount()).toBe(0);
        await new GridRows(api, 'empty text condition present but excludes all rows').check(`
            ROOT id:ROOT_NODE_ID
        `);

        api.setFilterModel({ athlete: { filterType: 'text', type: 'contains', filter: 'Coughlin' } });
        await asyncSetTimeout(0);
        expect(api.isColumnFilterPresent()).toBe(true);
        expect(api.isAnyFilterPresent()).toBe(true);
        await new GridRows(api, 'real text condition present').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:1 athlete:"Natalie Coughlin" age:25 country:"United States"
        `);

        // Null model ⇒ nothing present.
        api.setFilterModel(null);
        await asyncSetTimeout(0);
        expect(api.isColumnFilterPresent()).toBe(false);
        expect(api.isAnyFilterPresent()).toBe(false);
    });

    test('getColumnFilterInstance returns the live filter whose model matches the applied model', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: threeFilterCols,
            rowData: PEOPLE,
        });

        await api.setColumnFilterModel('age', { filterType: 'number', type: 'greaterThan', filter: 24 });
        api.onFilterChanged();
        await asyncSetTimeout(0);

        // instance.getModel() is deprecated (warns #285), so verify via getColumnFilterModel instead.
        const instance = await api.getColumnFilterInstance('age');
        expect(instance).toBeTruthy();
        expect(typeof instance!.doesFilterPass).toBe('function');
        expect(api.getColumnFilterModel('age')).toEqual({ filterType: 'number', type: 'greaterThan', filter: 24 });
        await new GridRows(api, 'getColumnFilterInstance number filter').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:1 athlete:"Natalie Coughlin" age:25 country:"United States"
            └── LEAF id:5 athlete:"Ryan Lochte" age:27 country:"United States"
        `);
    });

    test('destroyFilter removes a single column filter and restores the rows it hid', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: threeFilterCols,
            rowData: PEOPLE,
        });

        api.setFilterModel({
            country: { filterType: 'set', values: ['Australia'] },
            age: { filterType: 'number', type: 'lessThan', filter: 20 },
        });
        await asyncSetTimeout(0);
        expect(api.isColumnFilterPresent()).toBe(true);
        await new GridRows(api, 'before destroyFilter').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:6 athlete:"Ian Thorpe" age:17 country:"Australia"
        `);

        // Destroy only the country filter: the age filter must remain active.
        api.destroyFilter('country');
        await asyncSetTimeout(0);
        expect(api.getColumnFilterModel('country')).toBeNull();
        expect(api.getColumnFilterModel('age')).toEqual({ filterType: 'number', type: 'lessThan', filter: 20 });
        expect(api.isColumnFilterPresent()).toBe(true);
        await new GridRows(api, 'after destroyFilter country').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:4 athlete:"Missy Franklin" age:17 country:"United States"
            └── LEAF id:6 athlete:"Ian Thorpe" age:17 country:"Australia"
        `);
    });

    test('filterChanged fires source "api" for setFilterModel and "columnFilter" for UI edits', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: threeFilterCols,
            rowData: PEOPLE,
        });

        const events: FilterChangedEvent[] = [];
        const listener = (e: FilterChangedEvent) => events.push(e);
        api.addEventListener('filterChanged', listener);

        api.setFilterModel({ age: { filterType: 'number', type: 'greaterThan', filter: 24 } });
        await asyncSetTimeout(0);
        expect(events).toHaveLength(1);
        expect(events[0].source).toBe('api');
        await new GridRows(api, 'filterChanged via api source').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:1 athlete:"Natalie Coughlin" age:25 country:"United States"
            └── LEAF id:5 athlete:"Ryan Lochte" age:27 country:"United States"
        `);

        // Editing through the popup dispatches source 'columnFilter'. The age>24 filter still applies,
        // so this ANDs on top: only Ryan Lochte (age 27) matches 'Ryan'.
        events.length = 0;
        const filter = await ColumnFilterHarness.open(api, 'athlete');
        await filter.selectOperator('Contains');
        await filter.setText('Ryan');
        await asyncSetTimeout(0);
        expect(events.length).toBeGreaterThanOrEqual(1);
        expect(events.every((e) => e.source === 'columnFilter')).toBe(true);
        // The popup holds what was typed, and the age filter it ANDs onto is a separate column's model.
        await new FilterDom(api, 'athlete popup after editing', { mode: 'column-filter', colId: 'athlete' })
            .checkFilterDom(`
                COLUMN FILTER
                operator: "Contains"
                input: "Ryan"
                AND
                operator: "Contains"
                input: "" ⟨Filter...⟩
                model:
                  filterType: "text"
                  type: "contains"
                  filter: "Ryan"
            `);
        await new GridRows(api, 'filterChanged via columnFilter source').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:5 athlete:"Ryan Lochte" age:27 country:"United States"
        `);

        api.removeEventListener('filterChanged', listener);
    });

    test('external filter alone filters rows and reports through isAnyFilterPresent', async () => {
        let maxAge = 20;
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: threeFilterCols,
            rowData: PEOPLE,
            isExternalFilterPresent: () => true,
            doesExternalFilterPass: (node: IRowNode<Person>) => node.data!.age <= maxAge,
        });

        // External filter is active from creation: only the young athletes pass.
        expect(api.isAnyFilterPresent()).toBe(true);
        // External-only: no column filter is present.
        expect(api.isColumnFilterPresent()).toBe(false);
        expect(api.getFilterModel()).toEqual({});
        await new GridRows(api, 'external filter age<=20').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:4 athlete:"Missy Franklin" age:17 country:"United States"
            └── LEAF id:6 athlete:"Ian Thorpe" age:17 country:"Australia"
        `);

        // Mutating external state + onFilterChanged re-runs the external predicate.
        maxAge = 100;
        api.onFilterChanged();
        await asyncSetTimeout(0);
        await new GridRows(api, 'external filter widened age<=100').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 athlete:"Michael Phelps" age:23 country:"United States"
            ├── LEAF id:1 athlete:"Natalie Coughlin" age:25 country:"United States"
            ├── LEAF id:2 athlete:"Aleksey Nemov" age:24 country:"Russia"
            ├── LEAF id:3 athlete:"Alicia Coutts" age:24 country:"Australia"
            ├── LEAF id:4 athlete:"Missy Franklin" age:17 country:"United States"
            ├── LEAF id:5 athlete:"Ryan Lochte" age:27 country:"United States"
            └── LEAF id:6 athlete:"Ian Thorpe" age:17 country:"Australia"
        `);
    });

    test('external filter AND column filter both restrict the displayed rows', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: threeFilterCols,
            rowData: PEOPLE,
            isExternalFilterPresent: () => true,
            doesExternalFilterPass: (node: IRowNode<Person>) => node.data!.country === 'United States',
        });

        // External predicate keeps only US athletes.
        await new GridRows(api, 'external US only').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 athlete:"Michael Phelps" age:23 country:"United States"
            ├── LEAF id:1 athlete:"Natalie Coughlin" age:25 country:"United States"
            ├── LEAF id:4 athlete:"Missy Franklin" age:17 country:"United States"
            └── LEAF id:5 athlete:"Ryan Lochte" age:27 country:"United States"
        `);

        // Add a column filter: rows must satisfy BOTH the external predicate and the age filter.
        api.setFilterModel({ age: { filterType: 'number', type: 'lessThan', filter: 24 } });
        await asyncSetTimeout(0);
        expect(api.isColumnFilterPresent()).toBe(true);
        expect(api.isAnyFilterPresent()).toBe(true);
        await new GridRows(api, 'external US AND age<24').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 athlete:"Michael Phelps" age:23 country:"United States"
            └── LEAF id:4 athlete:"Missy Franklin" age:17 country:"United States"
        `);
    });

    test('doFilterAction resets only the columns it names, given as an array or a single id', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: threeFilterCols,
            rowData: PEOPLE,
            enableFilterHandlers: true,
        });
        await api.setFilterModel({
            athlete: { filterType: 'text', type: 'contains', filter: 'a' },
            age: { filterType: 'number', type: 'greaterThan', filter: 20 },
            country: { filterType: 'set', values: ['United States'] },
        });
        await asyncSetTimeout(0);

        api.doFilterAction({ colId: ['athlete', 'country'], action: 'reset' });
        await asyncSetTimeout(0);

        expect(api.getFilterModel()).toEqual({ age: { filterType: 'number', type: 'greaterThan', filter: 20 } });

        api.doFilterAction({ colId: 'age', action: 'reset' });
        await asyncSetTimeout(0);
        expect(api.getFilterModel()).toEqual({});
    });

    test('setColumnFilterModel / getColumnFilterModel drive one column and round-trip', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: threeFilterCols,
            rowData: PEOPLE,
        });

        await api.setColumnFilterModel('country', { filterType: 'set', values: ['Russia', 'Australia'] });
        api.onFilterChanged();
        await asyncSetTimeout(0);

        expect(api.getColumnFilterModel('country')).toEqual({ filterType: 'set', values: ['Russia', 'Australia'] });
        // Other columns are unaffected — whole-grid model has only the one entry.
        expect(api.getFilterModel()).toEqual({ country: { filterType: 'set', values: ['Russia', 'Australia'] } });
        expect(api.getColumnFilterModel('age')).toBeNull();
        await new GridRows(api, 'setColumnFilterModel country subset').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:2 athlete:"Aleksey Nemov" age:24 country:"Russia"
            ├── LEAF id:3 athlete:"Alicia Coutts" age:24 country:"Australia"
            └── LEAF id:6 athlete:"Ian Thorpe" age:17 country:"Australia"
        `);

        // Clearing that one column via null restores every row.
        await api.setColumnFilterModel('country', null);
        api.onFilterChanged();
        await asyncSetTimeout(0);
        expect(api.getColumnFilterModel('country')).toBeNull();
        expect(api.isAnyFilterPresent()).toBe(false);
        await new GridRows(api, 'setColumnFilterModel country cleared').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 athlete:"Michael Phelps" age:23 country:"United States"
            ├── LEAF id:1 athlete:"Natalie Coughlin" age:25 country:"United States"
            ├── LEAF id:2 athlete:"Aleksey Nemov" age:24 country:"Russia"
            ├── LEAF id:3 athlete:"Alicia Coutts" age:24 country:"Australia"
            ├── LEAF id:4 athlete:"Missy Franklin" age:17 country:"United States"
            ├── LEAF id:5 athlete:"Ryan Lochte" age:27 country:"United States"
            └── LEAF id:6 athlete:"Ian Thorpe" age:17 country:"Australia"
        `);
    });

    test('a model set before the rows arrive to infer data types from reads back at once', async () => {
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [62, 63] });
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const api: GridApi = gridsManager.createGrid('grid1', {
            columnDefs: [{ field: 'country', filter: 'agSetColumnFilter' }, { field: 'athlete' }],
            rowData: [],
        });
        const model = { country: { filterType: 'set', values: ['Russia'] } };
        const textModel = { filterType: 'text', type: 'contains', filter: 'a' };

        api.setFilterModel({ ...model, athlete: textModel, unknown: textModel });
        await asyncSetTimeout(0);
        expect(api.getFilterModel()).toEqual(model);
        expect(api.getColumnFilterModel('country')).toEqual(model.country);
        expect(api.getColumnFilterModel('athlete')).toBeNull();
        expect(api.isColumnFilterPresent()).toBe(true);
        expect(api.isAnyFilterPresent()).toBe(true);

        api.applyTransaction({ add: PEOPLE });
        await asyncSetTimeout(0);
        const warnings = warnSpy.mock.calls.flat().join(' ');
        expect(warnings).toContain('warning #62');
        expect(warnings).toContain('warning #63');
        expect(api.getFilterModel()).toEqual(model);
        expect(api.isColumnFilterPresent()).toBe(true);
        await new GridRows(api, 'model applied once rows arrive').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:2 country:"Russia" athlete:"Aleksey Nemov"
        `);
    });

    test('models set for a column and the whole grid before the rows arrive apply in call order', async () => {
        const api: GridApi = gridsManager.createGrid('grid1', {
            columnDefs: threeFilterCols,
            rowData: [],
        });

        let countryApplied = false;
        const countryPromise = api
            .setColumnFilterModel('country', { filterType: 'set', values: ['Russia'] })
            .then(() => {
                countryApplied = true;
            });
        api.setFilterModel({
            age: { filterType: 'number', type: 'lessThan', filter: 20 },
            athlete: { filterType: 'text', type: 'contains', filter: 'Phelps' },
        });
        void api.setColumnFilterModel(api.getColumn('athlete')!, {
            filterType: 'text',
            type: 'contains',
            filter: 'Thorpe',
        });
        void api.setColumnFilterModel('age', null);
        await asyncSetTimeout(0);
        expect(countryApplied).toBe(false);
        const expected = { athlete: { filterType: 'text', type: 'contains', filter: 'Thorpe' } };
        expect(api.getFilterModel()).toEqual(expected);
        expect(api.getColumnFilterModel('country')).toBeNull();
        api.setFilterModel(null);
        expect(api.getFilterModel()).toEqual({});
        api.setFilterModel(expected);

        api.applyTransaction({ add: PEOPLE });
        await countryPromise;
        expect(api.getFilterModel()).toEqual(expected);
        await new GridRows(api, 'models applied in call order').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:6 athlete:"Ian Thorpe" age:17 country:"Australia"
        `);
    });

    test('models set before the rows arrive each fire filterChanged as they apply', async () => {
        const changes: unknown[] = [];
        const api: GridApi = gridsManager.createGrid('grid1', {
            columnDefs: threeFilterCols,
            rowData: [],
            onFilterChanged: ({ source, columns }) =>
                changes.push([source, columns.map((column) => column.getColId()), api.getFilterModel()]),
        });
        await asyncSetTimeout(0);
        const russia = { country: { filterType: 'set', values: ['Russia'] } };
        const under20 = { age: { filterType: 'number', type: 'lessThan', filter: 20 } };

        api.setFilterModel(russia);
        void api.setColumnFilterModel('athlete', { filterType: 'text', type: 'contains', filter: 'a' });
        api.setFilterModel(under20);
        await asyncSetTimeout(0);
        expect(changes).toEqual([]);

        api.applyTransaction({ add: PEOPLE });
        await asyncSetTimeout(0);
        expect(changes).toEqual([
            ['api', ['country'], under20],
            ['api', ['country', 'athlete', 'age'], under20],
        ]);
        await new GridRows(api, 'last whole-grid model applied').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:4 athlete:"Missy Franklin" age:17 country:"United States"
            └── LEAF id:6 athlete:"Ian Thorpe" age:17 country:"Australia"
        `);
    });

    test('column models set before the rows arrive add to and clear a filter typed in its popup', async () => {
        const athlete = { filterType: 'text', type: 'contains', filter: 'Thorpe' };
        const age = { filterType: 'number', type: 'lessThan', filter: 20 };
        const api: GridApi = gridsManager.createGrid('grid1', { columnDefs: threeFilterCols, rowData: [] });
        await asyncSetTimeout(0);
        const popup = await ColumnFilterHarness.open(api, 'athlete');
        await popup.selectOperator('Contains');
        await popup.setText('Thorpe');
        api.hideColumnFilter();
        await asyncSetTimeout(0);
        expect(api.getFilterModel()).toEqual({ athlete });

        void api.setColumnFilterModel('age', age);
        expect(api.getFilterModel()).toEqual({ athlete, age });
        void api.setColumnFilterModel('athlete', null);
        expect(api.getFilterModel()).toEqual({ age });

        api.applyTransaction({ add: PEOPLE });
        await asyncSetTimeout(0);
        expect(api.getFilterModel()).toEqual({ age });
        await new GridRows(api, 'instance filter cleared, column model applied').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:4 athlete:"Missy Franklin" age:17 country:"United States"
            └── LEAF id:6 athlete:"Ian Thorpe" age:17 country:"Australia"
        `);
    });

    /** The columns whose header shows its filter as active: the header cell and the filter button. */
    const filterIndicators = (api: GridApi) => {
        const gridDiv = getGridElement(api) as HTMLElement;
        const colIds = (selector: string) =>
            Array.from(gridDiv.querySelectorAll(selector), (el) =>
                el.closest('.ag-header-cell')?.getAttribute('col-id')
            );
        return {
            cells: colIds('.ag-header-cell-filtered'),
            buttons: colIds('.ag-header-cell-filter-button.ag-filter-active'),
        };
    };

    test('models set before the rows arrive show in the header filter indicators at once', async () => {
        const athlete = { filterType: 'text', type: 'contains', filter: 'Thorpe' };
        const age = { filterType: 'number', type: 'lessThan', filter: 20 };
        const api: GridApi = gridsManager.createGrid('grid1', { columnDefs: threeFilterCols, rowData: [] });
        await asyncSetTimeout(0);
        expect(filterIndicators(api)).toEqual({ cells: [], buttons: [] });
        let countryEvents = 0;
        api.getColumn('country')!.addEventListener('filterChanged', () => ++countryEvents);

        void api.setColumnFilterModel('athlete', athlete);
        api.onFilterChanged();
        expect(filterIndicators(api)).toEqual({ cells: ['athlete'], buttons: ['athlete'] });

        api.setFilterModel({ age });
        expect(filterIndicators(api)).toEqual({ cells: ['age'], buttons: ['age'] });
        expect(countryEvents).toBe(0);

        api.setGridOption('columnDefs', [threeFilterCols[0], threeFilterCols[2]]);
        api.setGridOption('columnDefs', threeFilterCols);
        expect(filterIndicators(api)).toEqual({ cells: ['age'], buttons: ['age'] });
        api.setGridOption('columnDefs', [
            threeFilterCols[0],
            { ...threeFilterCols[1], filter: false },
            threeFilterCols[2],
        ]);
        expect(filterIndicators(api)).toEqual({ cells: [], buttons: [] });
        api.setGridOption('columnDefs', threeFilterCols);
        expect(filterIndicators(api)).toEqual({ cells: ['age'], buttons: ['age'] });

        api.setFilterModel(null);
        api.onFilterChanged();
        expect(filterIndicators(api)).toEqual({ cells: [], buttons: [] });
        expect(api.isColumnFilterPresent()).toBe(false);
        expect(api.isAnyFilterPresent()).toBe(false);

        void api.setColumnFilterModel('athlete', athlete);
        api.applyTransaction({ add: PEOPLE });
        await asyncSetTimeout(0);
        expect(filterIndicators(api)).toEqual({ cells: ['athlete'], buttons: ['athlete'] });
        await new GridRows(api, 'column model applied').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:6 athlete:"Ian Thorpe" age:17 country:"Australia"
        `);
    });

    test('a column model set before the rows arrive replaces a filter set in its popup, indicator and popup included', async () => {
        const age = { filterType: 'number', type: 'lessThan', filter: 20 };
        const api: GridApi = gridsManager.createGrid('grid1', { columnDefs: threeFilterCols, rowData: [] });
        await asyncSetTimeout(0);
        const popup = await ColumnFilterHarness.open(api, 'athlete');
        await popup.selectOperator('Contains');
        await popup.setText('Thorpe');
        api.hideColumnFilter();
        await asyncSetTimeout(0);
        expect(filterIndicators(api)).toEqual({ cells: ['athlete'], buttons: ['athlete'] });

        void api.setColumnFilterModel('athlete', null);
        void api.setColumnFilterModel('age', age);
        api.onFilterChanged();
        await asyncSetTimeout(0);
        expect(filterIndicators(api)).toEqual({ cells: ['age'], buttons: ['age'] });
        expect((await ColumnFilterHarness.open(api, 'athlete')).input('text').value).toBe('');
        api.hideColumnFilter();

        api.applyTransaction({ add: PEOPLE });
        await asyncSetTimeout(0);
        expect(filterIndicators(api)).toEqual({ cells: ['age'], buttons: ['age'] });
    });

    test('a custom filter takes a column model set before the rows arrive, and an edit in it wins', async () => {
        class CustomFilter implements IFilterComp {
            private model: { filter: string } | null = null;
            private params!: IFilterParams;
            public init(params: IFilterParams): void {
                this.params = params;
            }
            public applyFromUi(model: { filter: string }): void {
                this.model = model;
                this.params.filterChangedCallback();
            }
            public getGui(): HTMLElement {
                return document.createElement('div');
            }
            public isFilterActive(): boolean {
                return this.model != null;
            }
            public doesFilterPass({ data }: IDoesFilterPassParams<Person>): boolean {
                return data.athlete.includes(this.model!.filter);
            }
            public getModel() {
                return this.model;
            }
            public setModel(model: { filter: string } | null): void {
                this.model = model;
            }
        }
        const api: GridApi = gridsManager.createGrid('grid1', {
            columnDefs: [{ field: 'athlete', filter: CustomFilter }, threeFilterCols[1]],
            rowData: [],
        });
        await asyncSetTimeout(0);
        void api.setColumnFilterModel('athlete', { filter: 'Bolt' });
        expect((await api.getColumnFilterInstance<CustomFilter>('athlete'))!.getModel()).toEqual({ filter: 'Bolt' });
        (await api.getColumnFilterInstance<CustomFilter>('athlete'))!.setModel({ filter: 'Thorpe' });
        api.onFilterChanged();
        await asyncSetTimeout(0);
        expect(filterIndicators(api)).toEqual({ cells: ['athlete'], buttons: ['athlete'] });

        void api.setColumnFilterModel('athlete', null);
        api.onFilterChanged();
        await asyncSetTimeout(0);
        expect(filterIndicators(api)).toEqual({ cells: [], buttons: [] });
        expect((await api.getColumnFilterInstance<CustomFilter>('athlete'))!.getModel()).toBeNull();

        (await api.getColumnFilterInstance<CustomFilter>('athlete'))!.applyFromUi({ filter: 'Phelps' });
        await asyncSetTimeout(0);
        expect(filterIndicators(api)).toEqual({ cells: ['athlete'], buttons: ['athlete'] });
        expect(api.getFilterModel()).toEqual({ athlete: { filter: 'Phelps' } });

        api.applyTransaction({ add: PEOPLE });
        await asyncSetTimeout(0);
        expect(filterIndicators(api)).toEqual({ cells: ['athlete'], buttons: ['athlete'] });
        await new GridRows(api, 'edit in the custom filter applied').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 athlete:"Michael Phelps" age:23
        `);
    });

    test.each([false, true])(
        'with enableFilterHandlers %s, models set before the rows arrive show in the floating filter, and an edit in it wins',
        async (enableFilterHandlers) => {
            const colDef = { field: 'athlete', filter: 'agTextColumnFilter', filterParams: { debounceMs: 0 } };
            const api: GridApi = gridsManager.createGrid('grid1', {
                columnDefs: [colDef],
                rowData: [],
                enableFilterHandlers,
            });
            await asyncSetTimeout(0);
            const thorpe = { filterType: 'text', type: 'contains', filter: 'Thorpe' };
            void api.setColumnFilterModel('athlete', thorpe);
            api.setGridOption('columnDefs', [{ ...colDef, floatingFilter: true }]);
            await asyncSetTimeout(0);
            expect(FloatingFilterHarness.get(api, 'athlete').input().value).toBe('Thorpe');

            const input = FloatingFilterHarness.get(api, 'athlete').input();
            await userEvent.setup().clear(input);
            await userEvent.setup().type(input, 'Phelps');
            await asyncSetTimeout(0);
            expect(api.getFilterModel()).toEqual({ athlete: { ...thorpe, filter: 'Phelps' } });

            api.setFilterModel(null);
            await asyncSetTimeout(0);
            expect(FloatingFilterHarness.get(api, 'athlete').input().value).toBe('');

            void api.setColumnFilterModel('athlete', thorpe);
            api.onFilterChanged();
            api.applyTransaction({ add: PEOPLE });
            await asyncSetTimeout(0);
            expect(FloatingFilterHarness.get(api, 'athlete').input().value).toBe('Thorpe');
            await new GridRows(api, 'column model applied').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:6 athlete:"Ian Thorpe"
            `);
        }
    );

    test('popups show models set before the rows arrive, and an edit in one wins', async () => {
        const api: GridApi = gridsManager.createGrid('grid1', { columnDefs: threeFilterCols, rowData: [] });
        await asyncSetTimeout(0);
        const athletePopup = await ColumnFilterHarness.open(api, 'athlete');
        api.setFilterModel({
            athlete: { filterType: 'text', type: 'contains', filter: 'Thorpe' },
            age: { filterType: 'number', type: 'lessThan', filter: 30 },
        });
        await asyncSetTimeout(0);
        await new FilterDom(api, 'model set before the rows arrive, in the open popup', { colId: 'athlete' })
            .checkFilterDom(`
            COLUMN FILTER
            operator: "Contains"
            input: "Thorpe"
            AND
            operator: "Contains"
            input: "" ⟨Filter...⟩
            model:
              filterType: "text"
              type: "contains"
              filter: "Thorpe"
        `);

        await athletePopup.setText('Phelps');
        api.hideColumnFilter();
        await asyncSetTimeout(0);
        await ColumnFilterHarness.open(api, 'age');
        await new FilterDom(api, 'model set before the rows arrive, in a popup opened later', { colId: 'age' })
            .checkFilterDom(`
            COLUMN FILTER
            operator: "Less than"
            input: "30"
            AND
            operator: "Equals"
            input: "" ⟨Filter...⟩
            model:
              filterType: "number"
              type: "lessThan"
              filter: 30
        `);
        api.hideColumnFilter();
        const expected = {
            athlete: { filterType: 'text', type: 'contains', filter: 'Phelps' },
            age: { filterType: 'number', type: 'lessThan', filter: 30 },
        };
        expect(api.getFilterModel()).toEqual(expected);

        api.applyTransaction({ add: PEOPLE });
        await asyncSetTimeout(0);
        expect(api.getFilterModel()).toEqual(expected);
        await new GridRows(api, 'edit in the popup applied over the model').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 athlete:"Michael Phelps" age:23 country:"United States"
        `);
    });

    test('with Apply buttons, a model set before the rows arrive is what Cancel restores, and an applied edit replaces', async () => {
        const thorpe = { filterType: 'text', type: 'contains', filter: 'Thorpe' };
        const api: GridApi = gridsManager.createGrid('grid1', {
            columnDefs: [
                { field: 'athlete', filter: 'agTextColumnFilter', filterParams: { buttons: ['apply', 'cancel'] } },
            ],
            rowData: [],
            enableFilterHandlers: true,
        });
        await asyncSetTimeout(0);
        const popup = await ColumnFilterHarness.open(api, 'athlete');
        void api.setColumnFilterModel('athlete', thorpe);
        await asyncSetTimeout(0);
        expect(popup.input('text').value).toBe('Thorpe');

        await popup.setText('Phelps');
        expect(api.getColumnFilterModel('athlete', true)).toEqual({ ...thorpe, filter: 'Phelps' });
        expect(api.getColumnFilterModel('athlete')).toEqual(thorpe);
        await popup.cancel();
        expect(popup.input('text').value).toBe('Thorpe');

        await popup.setText('');
        await popup.apply();
        expect(api.getFilterModel()).toEqual({});

        void api.setColumnFilterModel('athlete', thorpe);
        await asyncSetTimeout(0);
        await popup.setText('Phelps');
        api.doFilterAction({ action: 'apply' });
        expect(api.getFilterModel()).toEqual({ athlete: { ...thorpe, filter: 'Phelps' } });

        api.applyTransaction({ add: PEOPLE });
        await asyncSetTimeout(0);
        await new GridRows(api, 'edit applied with every filter').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 athlete:"Michael Phelps"
        `);
    });

    test('destroying a filter before the rows arrive drops the model set for it', async () => {
        const api: GridApi = gridsManager.createGrid('grid1', { columnDefs: threeFilterCols, rowData: [] });
        await asyncSetTimeout(0);
        api.setFilterModel({ athlete: { filterType: 'text', type: 'contains', filter: 'Thorpe' } });
        expect(filterIndicators(api)).toEqual({ cells: ['athlete'], buttons: ['athlete'] });

        api.destroyFilter('athlete');
        expect(filterIndicators(api)).toEqual({ cells: [], buttons: [] });
        expect(api.getFilterModel()).toEqual({});
        expect(api.isColumnFilterPresent()).toBe(false);
        expect(api.getState().filter).toBeUndefined();

        api.applyTransaction({ add: PEOPLE });
        await asyncSetTimeout(0);
        expect(api.getFilterModel()).toEqual({});
        expect(api.getDisplayedRowCount()).toBe(PEOPLE.length);
    });

    test('a filter created before the rows arrive keeps the model set for it over the initial state model it corrects', async () => {
        const thorpe = { filterType: 'text', type: 'contains', filter: 'Thorpe' };
        const api: GridApi = gridsManager.createGrid('grid1', {
            columnDefs: threeFilterCols,
            rowData: [],
            enableFilterHandlers: true,
            initialState: { filter: { filterModel: { athlete: { type: 'contains', filter: 'Bolt' } } } },
        });
        await asyncSetTimeout(0);
        void api.setColumnFilterModel('athlete', thorpe);
        await ColumnFilterHarness.open(api, 'athlete');
        api.hideColumnFilter();
        expect(api.getFilterModel()).toEqual({ athlete: thorpe });

        api.applyTransaction({ add: PEOPLE });
        await asyncSetTimeout(0);
        expect(api.getFilterModel()).toEqual({ athlete: thorpe });
        await new GridRows(api, 'model set through the API applied').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:6 athlete:"Ian Thorpe" age:17 country:"Australia"
        `);
    });

    test('a popup first built after a floating filter edit shows the model set before the rows arrive', async () => {
        const api: GridApi = gridsManager.createGrid('grid1', {
            columnDefs: [
                {
                    field: 'athlete',
                    filter: 'agTextColumnFilter',
                    floatingFilter: true,
                    filterParams: { debounceMs: 0 },
                },
            ],
            rowData: [],
            enableFilterHandlers: true,
        });
        await asyncSetTimeout(0);
        await userEvent.setup().type(FloatingFilterHarness.get(api, 'athlete').input(), 'Phelps');
        await asyncSetTimeout(0);
        api.setFilterModel({ athlete: { filterType: 'text', type: 'contains', filter: 'Thorpe' } });
        await asyncSetTimeout(0);

        expect((await ColumnFilterHarness.open(api, 'athlete', 'floatingFilter')).input('text').value).toBe('Thorpe');
    });

    test('a set filter popup closed before the rows arrive keeps the model set for it', async () => {
        const country = { filterType: 'set', values: ['Australia'] };
        const api: GridApi = gridsManager.createGrid('grid1', { columnDefs: threeFilterCols, rowData: [] });
        await asyncSetTimeout(0);
        api.setFilterModel({ country });
        await ColumnFilterHarness.open(api, 'country');
        api.hideColumnFilter();
        await asyncSetTimeout(0);
        expect(api.getFilterModel()).toEqual({ country });

        api.applyTransaction({ add: PEOPLE });
        await asyncSetTimeout(0);
        expect(api.getFilterModel()).toEqual({ country });
        await new GridRows(api, 'set model applied').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:3 athlete:"Alicia Coutts" age:24 country:"Australia"
            └── LEAF id:6 athlete:"Ian Thorpe" age:17 country:"Australia"
        `);
    });

    test('a column model set before the rows arrive adds to the initial state model', async () => {
        const country = { filterType: 'set', values: ['Australia'] };
        const age = { filterType: 'number', type: 'lessThan', filter: 20 };
        const api: GridApi = gridsManager.createGrid('grid1', {
            columnDefs: threeFilterCols,
            rowData: [],
            initialState: { filter: { filterModel: { country } } },
        });
        await asyncSetTimeout(0);

        expect(filterIndicators(api)).toEqual({ cells: ['country'], buttons: ['country'] });
        void api.setColumnFilterModel('age', age);
        expect(api.getFilterModel()).toEqual({ country, age });
        expect(filterIndicators(api)).toEqual({ cells: ['age', 'country'], buttons: ['age', 'country'] });

        api.applyTransaction({ add: PEOPLE });
        await asyncSetTimeout(0);
        expect(api.getFilterModel()).toEqual({ country, age });
        await new GridRows(api, 'initial state and column model applied').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:6 athlete:"Ian Thorpe" age:17 country:"Australia"
        `);
    });

    test('an initial state model shows in the header filter indicators before any row data is given', async () => {
        const age = { filterType: 'number', type: 'lessThan', filter: 20 };
        const api: GridApi = gridsManager.createGrid('grid1', {
            columnDefs: threeFilterCols,
            initialState: { filter: { filterModel: { age } } },
        });
        await asyncSetTimeout(0);
        expect(filterIndicators(api)).toEqual({ cells: ['age'], buttons: ['age'] });
        expect(api.getColumnFilterModel('age')).toEqual(age);
        expect(api.isColumnFilterPresent()).toBe(true);
        expect(api.isAnyFilterPresent()).toBe(true);

        api.setGridOption('rowData', PEOPLE);
        await asyncSetTimeout(0);
        expect(filterIndicators(api)).toEqual({ cells: ['age'], buttons: ['age'] });
        await new GridRows(api, 'initial state applied').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:4 athlete:"Missy Franklin" age:17 country:"United States"
            └── LEAF id:6 athlete:"Ian Thorpe" age:17 country:"Australia"
        `);
    });

    test('an initial state model destroyed before any row data is given leaves no indicator', async () => {
        const age = { filterType: 'number', type: 'lessThan', filter: 20 };
        const api: GridApi = gridsManager.createGrid('grid1', {
            columnDefs: threeFilterCols,
            initialState: { filter: { filterModel: { age } } },
        });
        await asyncSetTimeout(0);
        api.destroyFilter('age');
        expect(filterIndicators(api)).toEqual({ cells: [], buttons: [] });
        expect(api.getFilterModel()).toEqual({});

        api.setGridOption('rowData', PEOPLE);
        await asyncSetTimeout(0);
        expect(api.getFilterModel()).toEqual({});
        expect(api.getDisplayedRowCount()).toBe(PEOPLE.length);
    });

    test.each([false, true])(
        'with enableFilterHandlers %s, an edit made before an initial state applies wins once the rows arrive',
        async (enableFilterHandlers) => {
            const phelps = { filterType: 'text', type: 'contains', filter: 'Phelps' };
            const api: GridApi = gridsManager.createGrid('grid1', {
                columnDefs: [{ ...threeFilterCols[0], floatingFilter: true }, threeFilterCols[1]],
                initialState: {
                    filter: { filterModel: { athlete: { filterType: 'text', type: 'contains', filter: 'Thorpe' } } },
                },
                enableFilterHandlers,
            });
            await asyncSetTimeout(0);
            const input = FloatingFilterHarness.get(api, 'athlete').input();
            expect(input.value).toBe('Thorpe');
            await userEvent.setup().clear(input);
            await userEvent.setup().type(input, 'Phelps');
            await asyncSetTimeout(0);
            expect(api.getFilterModel()).toEqual({ athlete: phelps });

            api.setGridOption('rowData', PEOPLE);
            await asyncSetTimeout(0);
            expect(api.getFilterModel()).toEqual({ athlete: phelps });
            await new GridRows(api, 'edit kept over the initial state').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 athlete:"Michael Phelps" age:23
            `);
        }
    );

    test.each([false, true])(
        'with enableFilterHandlers %s, an initial state model cleared in its filter before the rows arrive stays cleared',
        async (enableFilterHandlers) => {
            const api: GridApi = gridsManager.createGrid('grid1', {
                columnDefs: [{ ...threeFilterCols[0], floatingFilter: true }, threeFilterCols[1]],
                initialState: {
                    filter: { filterModel: { athlete: { filterType: 'text', type: 'contains', filter: 'Thorpe' } } },
                },
                enableFilterHandlers,
            });
            await asyncSetTimeout(0);
            await userEvent.setup().clear(FloatingFilterHarness.get(api, 'athlete').input());
            await asyncSetTimeout(0);
            expect(api.getFilterModel()).toEqual({});

            api.setGridOption('rowData', PEOPLE);
            await asyncSetTimeout(0);
            expect(api.getFilterModel()).toEqual({});
            expect(api.getDisplayedRowCount()).toBe(PEOPLE.length);
        }
    );

    test('an initial state model whose column is missing or cannot filter as the rows load is not reported once it can', async () => {
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [62, 63] });
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const api: GridApi = gridsManager.createGrid('grid1', {
            columnDefs: [threeFilterCols[0], { field: 'age', filter: false }],
            rowData: [],
            initialState: {
                filter: {
                    filterModel: {
                        age: { filterType: 'number', type: 'lessThan', filter: 20 },
                        country: { filterType: 'set', values: ['Russia'] },
                    },
                },
            },
        });
        await asyncSetTimeout(0);
        api.setGridOption('rowData', PEOPLE);
        await asyncSetTimeout(0);
        const warnings = warnSpy.mock.calls.flat().join(' ');
        expect(warnings).toContain('warning #62');
        expect(warnings).toContain('warning #63');

        api.setGridOption('columnDefs', threeFilterCols);
        await asyncSetTimeout(0);
        expect(api.getFilterModel()).toEqual({});
        expect(api.isColumnFilterPresent()).toBe(false);
    });

    test('a model restored with setState before the rows arrive reads back at once', async () => {
        const filterModel = { country: { filterType: 'set', values: ['Russia'] } };
        const api: GridApi = gridsManager.createGrid('grid1', { columnDefs: threeFilterCols, rowData: [] });
        await asyncSetTimeout(0);

        api.setState({ filter: { filterModel } });
        expect(api.getFilterModel()).toEqual(filterModel);
        expect(filterIndicators(api)).toEqual({ cells: ['country'], buttons: ['country'] });

        api.applyTransaction({ add: PEOPLE });
        await asyncSetTimeout(0);
        expect(api.getFilterModel()).toEqual(filterModel);
        await new GridRows(api, 'restored model applied').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:2 athlete:"Aleksey Nemov" age:24 country:"Russia"
        `);
    });

    test('with filter handlers, a model set before the rows arrive reads back applied and unapplied', async () => {
        const age = { filterType: 'number', type: 'lessThan', filter: 20 };
        const api: GridApi = gridsManager.createGrid('grid1', {
            columnDefs: threeFilterCols,
            rowData: [],
            enableFilterHandlers: true,
        });
        await asyncSetTimeout(0);

        api.setFilterModel({ age });
        expect(api.getFilterModel()).toEqual({ age });
        expect(api.getColumnFilterModel('age')).toEqual(age);
        expect(api.getColumnFilterModel('age', true)).toEqual(age);

        api.applyTransaction({ add: PEOPLE });
        await asyncSetTimeout(0);
        expect(api.getColumnFilterModel('age', true)).toEqual(age);
        await new GridRows(api, 'handler model applied').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:4 athlete:"Missy Franklin" age:17 country:"United States"
            └── LEAF id:6 athlete:"Ian Thorpe" age:17 country:"Australia"
        `);
    });

    test('with filter handlers, a model a filter sets on itself before the rows arrive replaces the one set earlier', async () => {
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [286] });
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const api: GridApi = gridsManager.createGrid('grid1', {
            columnDefs: threeFilterCols,
            rowData: [],
            enableFilterHandlers: true,
        });
        await asyncSetTimeout(0);
        const filter = await api.getColumnFilterInstance('athlete');

        void api.setColumnFilterModel('athlete', { filterType: 'text', type: 'contains', filter: 'Thorpe' });
        await filter!.setModel({ filterType: 'text', type: 'contains', filter: 'Phelps' });
        api.applyTransaction({ add: PEOPLE });
        await asyncSetTimeout(0);
        expect(warnSpy.mock.calls.flat().join(' ')).toContain('warning #286');
        await new GridRows(api, 'model the filter set on itself applied').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 athlete:"Michael Phelps" age:23 country:"United States"
        `);
    });

    test('with filter handlers, a set filter refreshing its values before the rows arrive keeps the model set for them', async () => {
        const api: GridApi = gridsManager.createGrid('grid1', {
            columnDefs: threeFilterCols,
            rowData: [],
            enableFilterHandlers: true,
        });
        await asyncSetTimeout(0);

        void api.setColumnFilterModel('country', { filterType: 'set', values: ['Russia'] });
        api.getColumnFilterHandler<SetFilterHandler>('country')!.refreshFilterValues();
        await asyncSetTimeout(0);
        api.applyTransaction({ add: PEOPLE });
        await asyncSetTimeout(0);
        await new GridRows(api, 'model set for the rows applied').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:2 athlete:"Aleksey Nemov" age:24 country:"Russia"
        `);
    });

    test('with filter handlers, a column model set before the rows arrive keeps another column’s unapplied edit', async () => {
        const age = { filterType: 'number', type: 'lessThan', filter: 20 };
        const edit = { filterType: 'text', type: 'contains', filter: 'Thorpe' };
        const api: GridApi = gridsManager.createGrid('grid1', {
            columnDefs: [
                { field: 'athlete', filter: 'agTextColumnFilter', filterParams: { buttons: ['apply'] } },
                { field: 'age', filter: 'agNumberColumnFilter' },
            ],
            rowData: [],
            enableFilterHandlers: true,
        });
        await asyncSetTimeout(0);
        const popup = await ColumnFilterHarness.open(api, 'athlete');
        await popup.selectOperator('Contains');
        await popup.setText('Thorpe');
        await asyncSetTimeout(0);

        void api.setColumnFilterModel('age', age);
        expect(api.getColumnFilterModel('athlete', true)).toEqual(edit);
        expect(api.getColumnFilterModel('athlete')).toBeNull();
        expect(api.getColumnFilterModel('age', true)).toEqual(age);
    });

    test('a model set before the rows arrive on a filter already built is present, and fires filterChanged as it applies', async () => {
        const athlete = { filterType: 'text', type: 'contains', filter: 'Thorpe' };
        const events: { source?: string; columns: string[] }[] = [];
        const api: GridApi = gridsManager.createGrid('grid1', {
            columnDefs: threeFilterCols,
            rowData: [],
            onFilterChanged: ({ source, columns }: FilterChangedEvent) =>
                events.push({ source, columns: columns.map((column) => column.getColId()) }),
        });
        await api.getColumnFilterInstance('athlete');
        api.setFilterModel({ athlete });
        await asyncSetTimeout(0);
        expect(api.isColumnFilterPresent()).toBe(true);
        expect(api.isAnyFilterPresent()).toBe(true);
        expect(events).toEqual([]);

        api.setGridOption('rowData', PEOPLE);
        await asyncSetTimeout(0);
        expect(events).toEqual([{ source: 'api', columns: ['athlete'] }]);
        expect(api.getState().filter).toEqual({ filterModel: { athlete } });
        await new GridRows(api, 'model held by the built filter applied').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:6 athlete:"Ian Thorpe" age:17 country:"Australia"
        `);
    });

    test('models set before the rows arrive on a filter already built each fire filterChanged as they apply', async () => {
        const athlete = { filterType: 'text', type: 'contains', filter: 'Thorpe' };
        const events: { source?: string; columns: string[] }[] = [];
        const api: GridApi = gridsManager.createGrid('grid1', {
            columnDefs: threeFilterCols,
            rowData: [],
            onFilterChanged: ({ source, columns }: FilterChangedEvent) =>
                events.push({ source, columns: columns.map((column) => column.getColId()) }),
        });
        await api.getColumnFilterInstance('athlete');
        api.setFilterModel({ athlete: { filterType: 'text', type: 'contains', filter: 'Phelps' } });
        api.setFilterModel({ athlete });
        await asyncSetTimeout(0);
        expect(events).toEqual([]);

        api.setGridOption('rowData', PEOPLE);
        await asyncSetTimeout(0);
        expect(events).toEqual([
            { source: 'api', columns: ['athlete'] },
            { source: 'api', columns: ['athlete'] },
        ]);
        expect(api.getState().filter).toEqual({ filterModel: { athlete } });
        await new GridRows(api, 'model held by the built filter applied').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:6 athlete:"Ian Thorpe" age:17 country:"Australia"
        `);
    });

    test('grid state follows models set before the rows arrive, and the column ones applied as they load', async () => {
        const thorpe = { filterType: 'text', type: 'contains', filter: 'Thorpe' };
        const phelps = { filterType: 'text', type: 'contains', filter: 'Phelps' };
        const api: GridApi = gridsManager.createGrid('grid1', { columnDefs: threeFilterCols, rowData: [] });
        await asyncSetTimeout(0);
        api.setFilterModel({ athlete: thorpe });
        expect(api.getState().filter).toEqual({ filterModel: { athlete: thorpe } });
        void api.setColumnFilterModel('athlete', phelps);
        expect(api.getState().filter).toEqual({ filterModel: { athlete: phelps } });

        api.setGridOption('rowData', PEOPLE);
        await asyncSetTimeout(0);
        expect(api.getState().filter).toEqual({ filterModel: { athlete: phelps } });
        expect(api.getDisplayedRowCount()).toBe(1);
    });

    test('a column model applied as the rows load refreshes its own column only', async () => {
        const api: GridApi = gridsManager.createGrid('grid1', { columnDefs: threeFilterCols, rowData: [] });
        await asyncSetTimeout(0);
        let athleteEvents = 0;
        api.getColumn('athlete')!.addEventListener('filterChanged', () => ++athleteEvents);
        api.setFilterModel({ athlete: { filterType: 'text', type: 'contains', filter: 'Thorpe' } });
        void api.setColumnFilterModel('age', { filterType: 'number', type: 'lessThan', filter: 20 });
        await asyncSetTimeout(0);
        athleteEvents = 0;

        api.setGridOption('rowData', PEOPLE);
        await asyncSetTimeout(0);
        // one as its model applies, one as the rows load
        expect(athleteEvents).toBe(2);
    });

    test('a model set before the rows arrive for a column added later shows once the column exists', async () => {
        const age = { filterType: 'number', type: 'lessThan', filter: 20 };
        const api: GridApi = gridsManager.createGrid('grid1', { columnDefs: [threeFilterCols[0]], rowData: [] });
        await asyncSetTimeout(0);
        api.setFilterModel({ age: { ...age } });
        api.setGridOption('columnDefs', threeFilterCols);
        await asyncSetTimeout(0);
        expect(api.getFilterModel()).toEqual({ age });
        expect(filterIndicators(api)).toEqual({ cells: ['age'], buttons: ['age'] });

        api.setGridOption('rowData', PEOPLE);
        await asyncSetTimeout(0);
        expect(api.getFilterModel()).toEqual({ age });
        await new GridRows(api, 'model of the added column applied').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:4 athlete:"Missy Franklin" age:17 country:"United States"
            └── LEAF id:6 athlete:"Ian Thorpe" age:17 country:"Australia"
        `);
    });

    test('a model set before the rows arrive for a column that cannot filter once they do is dropped', async () => {
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [63] });
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const age = { filterType: 'number', type: 'lessThan', filter: 20 };
        const api: GridApi = gridsManager.createGrid('grid1', { columnDefs: threeFilterCols, rowData: [] });
        await asyncSetTimeout(0);
        api.setFilterModel({ age });
        api.setGridOption('columnDefs', [threeFilterCols[0], { field: 'age', filter: false }, threeFilterCols[2]]);
        api.setGridOption('rowData', PEOPLE);
        await asyncSetTimeout(0);
        expect(warnSpy.mock.calls.flat().join(' ')).toContain('warning #63');

        api.setGridOption('columnDefs', threeFilterCols);
        await asyncSetTimeout(0);
        expect(api.getFilterModel()).toEqual({});
        expect(api.isColumnFilterPresent()).toBe(false);
        expect(api.getDisplayedRowCount()).toBe(PEOPLE.length);
    });

    test('a model a custom filter sets on itself before the rows arrive, told with onFilterChanged, replaces the one set earlier', async () => {
        class CustomFilter implements IFilterComp {
            private model: { filter: string } | null = null;
            public init(): void {}
            public getGui(): HTMLElement {
                return document.createElement('div');
            }
            public isFilterActive(): boolean {
                return this.model != null;
            }
            public doesFilterPass({ data }: IDoesFilterPassParams<Person>): boolean {
                return data.athlete.includes(this.model!.filter);
            }
            public getModel() {
                return this.model;
            }
            public setModel(model: { filter: string } | null): void {
                this.model = model;
            }
        }
        const api: GridApi = gridsManager.createGrid('grid1', {
            columnDefs: [{ field: 'athlete', filter: CustomFilter }, threeFilterCols[1]],
            rowData: [],
        });
        await asyncSetTimeout(0);
        void api.setColumnFilterModel('athlete', { filter: 'Bolt' });
        (await api.getColumnFilterInstance<CustomFilter>('athlete'))!.setModel({ filter: 'Thorpe' });
        api.onFilterChanged();
        await asyncSetTimeout(0);

        api.setGridOption('rowData', PEOPLE);
        await asyncSetTimeout(0);
        expect(api.getFilterModel()).toEqual({ athlete: { filter: 'Thorpe' } });
        await new GridRows(api, 'model the custom filter set on itself applied').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:6 athlete:"Ian Thorpe" age:17
        `);
    });

    test('a model set before the rows arrive on a custom filter taking it asynchronously survives an onFilterChanged meanwhile', async () => {
        let applyModel = () => {};
        class AsyncFilter implements IFilterComp {
            private model: { filter: string } | null = null;
            public init(): void {}
            public getGui(): HTMLElement {
                return document.createElement('div');
            }
            public isFilterActive(): boolean {
                return this.model != null;
            }
            public doesFilterPass({ data }: IDoesFilterPassParams<Person>): boolean {
                return data.athlete.includes(this.model!.filter);
            }
            public getModel() {
                return this.model;
            }
            public setModel(model: { filter: string } | null): AgPromise<void> {
                return new AgPromise((resolve) => {
                    applyModel = () => {
                        this.model = model;
                        resolve();
                    };
                });
            }
        }
        const api: GridApi = gridsManager.createGrid('grid1', {
            columnDefs: [{ field: 'athlete', filter: AsyncFilter }, threeFilterCols[1]],
            rowData: [],
        });
        await api.getColumnFilterInstance('athlete');
        api.setFilterModel({ athlete: { filter: 'Thorpe' } });
        api.onFilterChanged();
        applyModel();
        await asyncSetTimeout(0);

        api.setGridOption('rowData', PEOPLE);
        await asyncSetTimeout(0);
        applyModel();
        await asyncSetTimeout(0);
        expect(api.getFilterModel()).toEqual({ athlete: { filter: 'Thorpe' } });
    });

    test('a filter of its own built before the rows arrive is not rebuilt by a model set meanwhile', async () => {
        let inits = 0;
        class CustomFilter implements IFilterComp {
            private model: unknown = null;
            public init(): void {
                ++inits;
            }
            public getGui(): HTMLElement {
                return document.createElement('div');
            }
            public isFilterActive(): boolean {
                return this.model != null;
            }
            public doesFilterPass(): boolean {
                return true;
            }
            public getModel() {
                return this.model;
            }
            public setModel(model: unknown): void {
                this.model = model;
            }
            public refresh(): boolean {
                return false;
            }
        }
        const api: GridApi = gridsManager.createGrid('grid1', {
            columnDefs: [{ field: 'athlete', filter: CustomFilter }],
            rowData: [],
        });
        await api.getColumnFilterInstance('athlete');
        api.setFilterModel({ athlete: { filterType: 'text', type: 'contains', filter: 'Thorpe' } });
        await asyncSetTimeout(0);
        expect(inits).toBe(1);
    });

    test('a custom filter rebuilt by new filter params before the rows arrive keeps the model set for it, which applies once they do', async () => {
        class CustomFilter implements IFilterComp {
            private model: { filter: string } | null = null;
            public init(): void {}
            public getGui(): HTMLElement {
                return document.createElement('div');
            }
            public isFilterActive(): boolean {
                return this.model != null;
            }
            public doesFilterPass({ data }: IDoesFilterPassParams<Person>): boolean {
                return data.athlete.includes(this.model!.filter);
            }
            public getModel() {
                return this.model;
            }
            public setModel(model: { filter: string } | null): void {
                this.model = model;
            }
            public refresh(): boolean {
                return false;
            }
        }
        const onFilterChanged = vi.fn();
        const api: GridApi = gridsManager.createGrid('grid1', {
            columnDefs: [{ field: 'athlete', filter: CustomFilter }, threeFilterCols[1]],
            rowData: [],
            onFilterChanged,
        });
        await api.getColumnFilterInstance('athlete');
        void api.setColumnFilterModel('athlete', { filter: 'Thorpe' });
        api.setGridOption('columnDefs', [
            { field: 'athlete', filter: CustomFilter, filterParams: { rebuilt: true } },
            threeFilterCols[1],
        ]);
        await asyncSetTimeout(0);
        expect(onFilterChanged).not.toHaveBeenCalled();
        expect(api.getFilterModel()).toEqual({ athlete: { filter: 'Thorpe' } });
        expect(filterIndicators(api)).toEqual({ cells: ['athlete'], buttons: ['athlete'] });

        api.setGridOption('rowData', PEOPLE);
        await asyncSetTimeout(0);
        expect(api.getFilterModel()).toEqual({ athlete: { filter: 'Thorpe' } });
        await new GridRows(api, 'model kept by the rebuilt filter applied').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:6 athlete:"Ian Thorpe" age:17
        `);
    });

    test('a custom filter restored from the initial state is given its model once', async () => {
        let setModelCalls = 0;
        class CustomFilter implements IFilterComp {
            private model: { filter: string } | null = null;
            public init(): void {}
            public getGui(): HTMLElement {
                return document.createElement('div');
            }
            public isFilterActive(): boolean {
                return this.model != null;
            }
            public doesFilterPass({ data }: IDoesFilterPassParams<Person>): boolean {
                return data.athlete.includes(this.model!.filter);
            }
            public getModel() {
                return this.model;
            }
            public setModel(model: { filter: string } | null): void {
                ++setModelCalls;
                this.model = model;
            }
        }
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'athlete', filter: CustomFilter }, threeFilterCols[1]],
            rowData: PEOPLE,
            initialState: { filter: { filterModel: { athlete: { filter: 'Thorpe' } } } },
        });
        await asyncSetTimeout(0);
        expect(setModelCalls).toBe(1);
        await new GridRows(api, 'initial state model applied').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:6 athlete:"Ian Thorpe" age:17
        `);
    });

    test('an initial state model reads back while its custom filter is still being built', async () => {
        let finishInit: () => void = () => {};
        class SlowFilter implements IFilterComp {
            private model: { filter: string } | null = null;
            public init(): AgPromise<void> {
                return new AgPromise((resolve) => {
                    finishInit = resolve;
                });
            }
            public getGui(): HTMLElement {
                return document.createElement('div');
            }
            public isFilterActive(): boolean {
                return this.model != null;
            }
            public doesFilterPass({ data }: IDoesFilterPassParams<Person>): boolean {
                return data.athlete.includes(this.model!.filter);
            }
            public getModel() {
                return this.model;
            }
            public setModel(model: { filter: string } | null): void {
                this.model = model;
            }
        }
        const api: GridApi = gridsManager.createGrid('grid1', {
            columnDefs: [{ field: 'athlete', filter: SlowFilter }, threeFilterCols[1]],
            initialState: { filter: { filterModel: { athlete: { filter: 'Thorpe' } } } },
        });
        await asyncSetTimeout(0);
        const built = api.getColumnFilterInstance('athlete');
        expect(api.getColumnFilterModel('athlete')).toEqual({ filter: 'Thorpe' });
        finishInit();
        await built;
        expect(api.getColumnFilterModel('athlete')).toEqual({ filter: 'Thorpe' });
    });

    test('a custom filter built before any row data is given starts from its initial state model', async () => {
        class CustomFilter implements IFilterComp {
            private model: { filter: string } | null = null;
            public init(): void {}
            public getGui(): HTMLElement {
                return document.createElement('div');
            }
            public isFilterActive(): boolean {
                return this.model != null;
            }
            public doesFilterPass({ data }: IDoesFilterPassParams<Person>): boolean {
                return data.athlete.includes(this.model!.filter);
            }
            public getModel() {
                return this.model;
            }
            public setModel(model: { filter: string } | null): void {
                this.model = model;
            }
        }
        const api: GridApi = gridsManager.createGrid('grid1', {
            columnDefs: [{ field: 'athlete', filter: CustomFilter }, threeFilterCols[1]],
            initialState: { filter: { filterModel: { athlete: { filter: 'Thorpe' } } } },
        });
        await asyncSetTimeout(0);
        const filter = await api.getColumnFilterInstance<CustomFilter>('athlete');
        expect(filter!.getModel()).toEqual({ filter: 'Thorpe' });
        expect(api.getFilterModel()).toEqual({ athlete: { filter: 'Thorpe' } });
    });

    test('a model set before the rows arrive shows at once in the Set Filter that filter: true builds', async () => {
        const country = { filterType: 'set', values: ['Russia'] };
        const api: GridApi = gridsManager.createGrid('grid1', {
            columnDefs: [
                threeFilterCols[0],
                {
                    field: 'country',
                    filter: true,
                    floatingFilter: true,
                    filterParams: { values: ['Australia', 'Russia'] },
                },
            ],
            rowData: [],
        });
        await asyncSetTimeout(0);
        api.setFilterModel({ country });
        await asyncSetTimeout(0);
        expect(FloatingFilterHarness.get(api, 'country').input().value).toContain('Russia');

        api.setGridOption('rowData', PEOPLE);
        await asyncSetTimeout(0);
        await new GridRows(api, 'set model applied').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:2 athlete:"Aleksey Nemov" country:"Russia"
        `);
    });

    test('with filter handlers, a filter redefined before the rows arrive keeps the model set for it, which applies once they do', async () => {
        class Display implements FilterDisplayComp {
            public init(): void {}
            public getGui(): HTMLElement {
                return document.createElement('div');
            }
            public refresh(): boolean {
                return true;
            }
        }
        // logic of its own makes the redefinition rebuild the handler
        const athleteDef = () => ({
            field: 'athlete',
            filter: {
                component: Display,
                doesFilterPass: ({ model, data }: { model: { filter: string }; data: Person }) =>
                    data.athlete.includes(model.filter),
            },
        });
        const api: GridApi = gridsManager.createGrid('grid1', {
            columnDefs: [athleteDef(), threeFilterCols[1]],
            rowData: [],
            enableFilterHandlers: true,
        });
        await asyncSetTimeout(0);
        api.getColumnFilterHandler('athlete');
        void api.setColumnFilterModel('athlete', { filter: 'Thorpe' });
        api.setGridOption('columnDefs', [athleteDef(), threeFilterCols[1]]);
        await asyncSetTimeout(0);
        expect(api.getFilterModel()).toEqual({ athlete: { filter: 'Thorpe' } });
        expect(filterIndicators(api)).toEqual({ cells: ['athlete'], buttons: ['athlete'] });

        api.setGridOption('rowData', PEOPLE);
        await asyncSetTimeout(0);
        expect(api.getFilterModel()).toEqual({ athlete: { filter: 'Thorpe' } });
        await new GridRows(api, 'model kept by the rebuilt filter applied').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:6 athlete:"Ian Thorpe" age:17
        `);
    });

    test('a column model set for no column before the rows arrive changes nothing', async () => {
        const age = { filterType: 'number', type: 'lessThan', filter: 20 };
        const api: GridApi = gridsManager.createGrid('grid1', { columnDefs: threeFilterCols, rowData: [] });
        await asyncSetTimeout(0);

        api.setFilterModel({ age });
        const ignored = api.setColumnFilterModel(null as unknown as string, {
            filterType: 'text',
            type: 'contains',
            filter: 'Thorpe',
        });
        expect(api.getFilterModel()).toEqual({ age });

        api.applyTransaction({ add: PEOPLE });
        await ignored;
        expect(api.getFilterModel()).toEqual({ age });
        await new GridRows(api, 'whole-grid model applied').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:4 athlete:"Missy Franklin" age:17 country:"United States"
            └── LEAF id:6 athlete:"Ian Thorpe" age:17 country:"Australia"
        `);
    });

    test('a column model then an equal whole-grid model set before the rows arrive apply with no filterChanged', async () => {
        const changes: unknown[] = [];
        const age = { filterType: 'number', type: 'lessThan', filter: 20 };
        const api: GridApi = gridsManager.createGrid('grid1', {
            columnDefs: threeFilterCols,
            rowData: [],
            onFilterChanged: ({ source, columns }) =>
                changes.push([source, columns.map((column) => column.getColId())]),
        });
        await asyncSetTimeout(0);

        void api.setColumnFilterModel('age', age);
        api.setFilterModel({ age });
        api.applyTransaction({ add: PEOPLE });
        await asyncSetTimeout(0);
        expect(changes).toEqual([]);
        expect(api.getFilterModel()).toEqual({ age });
        await new GridRows(api, 'column model applied').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:4 athlete:"Missy Franklin" age:17 country:"United States"
            └── LEAF id:6 athlete:"Ian Thorpe" age:17 country:"Australia"
        `);
    });

    test('a model set before the rows arrive for a column then removed reads back and applies without it', async () => {
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [62] });
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const athlete = { filterType: 'text', type: 'contains', filter: 'Thorpe' };
        const age = { filterType: 'number', type: 'lessThan', filter: 20 };
        const api: GridApi = gridsManager.createGrid('grid1', { columnDefs: threeFilterCols, rowData: [] });
        await asyncSetTimeout(0);

        api.setFilterModel({ athlete, age });
        void api.setColumnFilterModel('age', age);
        api.setGridOption('columnDefs', [threeFilterCols[0], threeFilterCols[2]]);
        expect(api.getFilterModel()).toEqual({ athlete });

        api.applyTransaction({ add: PEOPLE });
        await asyncSetTimeout(0);
        expect(warnSpy.mock.calls.flat().join(' ')).toContain('warning #62');
        expect(api.getFilterModel()).toEqual({ athlete });
        await new GridRows(api, 'model applied without the removed column').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:6 athlete:"Ian Thorpe" country:"Australia"
        `);
    });
});

describe('models set before rows load, with a filter type inferred from them', () => {
    const gridsManager = new TestGridsManager({
        modules: [TextFilterModule, NumberFilterModule, DateFilterModule, GridStateModule, ClientSideRowModelModule],
    });

    beforeAll(() => {
        setupAgTestIds();
        installFilterLayoutMock();
    });
    afterAll(() => uninstallFilterLayoutMock());
    afterEach(() => {
        gridsManager.reset();
        vi.restoreAllMocks();
        enableDevValidations({ throwOn: ALL_SEVERITIES });
    });

    test('with filter handlers, an edit not applied yet reads back over a model set before the rows arrive, and wins once applied', async () => {
        const thorpe = { filterType: 'text', type: 'contains', filter: 'Thorpe' };
        const phelps = { filterType: 'text', type: 'contains', filter: 'Phelps' };
        const api: GridApi = gridsManager.createGrid('grid1', {
            columnDefs: [{ field: 'athlete', filter: true, filterParams: { buttons: ['apply'] } }],
            rowData: [],
            enableFilterHandlers: true,
        });
        await asyncSetTimeout(0);
        api.setFilterModel({ athlete: thorpe });
        const popup = await ColumnFilterHarness.open(api, 'athlete');
        await popup.setText('Phelps');
        expect(api.getColumnFilterModel('athlete', true)).toEqual(phelps);
        expect(api.getColumnFilterModel('athlete')).toEqual(thorpe);

        api.doFilterAction({ action: 'apply' });
        api.hideColumnFilter();
        expect(api.getColumnFilterModel('athlete')).toEqual(phelps);
        api.applyTransaction({ add: PEOPLE });
        await asyncSetTimeout(0);
        await new GridRows(api, 'applied edit kept').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 athlete:"Michael Phelps"
        `);
    });

    test.each([false, true])(
        'with enableFilterHandlers %s, a model given to a filter before the rows decide its type replaces one set earlier',
        async (enableFilterHandlers) => {
            enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [286] });
            const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
            const phelps = { filterType: 'text', type: 'contains', filter: 'Phelps' };
            const api: GridApi = gridsManager.createGrid('grid1', {
                columnDefs: [{ field: 'athlete', filter: true }],
                rowData: [],
                enableFilterHandlers,
            });
            await asyncSetTimeout(0);
            api.setFilterModel({ athlete: { filterType: 'text', type: 'contains', filter: 'Thorpe' } });
            const filter = await api.getColumnFilterInstance<IFilterComp>('athlete');
            await filter!.setModel(phelps);
            expect(warnSpy.mock.calls.flat().join(' ')).toContain('warning #286');
            expect(api.getColumnFilterModel('athlete')).toEqual(phelps);

            api.applyTransaction({ add: PEOPLE });
            await asyncSetTimeout(0);
            await new GridRows(api, 'model given to the filter kept').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 athlete:"Michael Phelps"
        `);
        }
    );

    test('a whole model cleared before rows load drops an initial state model kept for a filter whose type they decide', async () => {
        const thorpe = { filterType: 'text', type: 'contains', filter: 'Thorpe' };
        const api: GridApi = gridsManager.createGrid('grid1', {
            columnDefs: [{ field: 'athlete', filter: true }],
            rowData: [],
            initialState: { filter: { filterModel: { athlete: thorpe } } },
        });
        await asyncSetTimeout(0);
        expect(api.getFilterModel()).toEqual({ athlete: thorpe });
        api.setFilterModel(null);
        expect(api.getFilterModel()).toEqual({});

        api.applyTransaction({ add: PEOPLE });
        await asyncSetTimeout(0);
        expect(api.getDisplayedRowCount()).toBe(PEOPLE.length);
    });

    test('a model kept before rows load for a filter whose type they decide keeps its indicator through new column definitions', async () => {
        const api: GridApi = gridsManager.createGrid('grid1', {
            columnDefs: [
                { field: 'athlete', filter: true },
                { field: 'age', filter: true },
            ],
            rowData: [],
        });
        await asyncSetTimeout(0);
        const filteredCells = () =>
            Array.from((getGridElement(api) as HTMLElement).querySelectorAll('.ag-header-cell-filtered'), (el) =>
                el.getAttribute('col-id')
            );
        api.setFilterModel({ athlete: { filterType: 'text', type: 'contains', filter: 'Thorpe' } });
        expect(filteredCells()).toEqual(['athlete']);

        api.setGridOption('columnDefs', [
            { field: 'athlete', filter: true, headerName: 'Name' },
            { field: 'age', filter: true },
        ]);
        expect(filteredCells()).toEqual(['athlete']);
    });

    test('a model set before rows load on a column whose filter type they decide fires filterChanged once they load', async () => {
        const events: string[][] = [];
        const api: GridApi = gridsManager.createGrid('grid1', {
            columnDefs: [
                { field: 'athlete', filter: true },
                { field: 'age', filter: true },
            ],
            rowData: [],
            onFilterChanged: ({ columns }: FilterChangedEvent) =>
                events.push(columns.map((column) => column.getColId())),
        });
        await asyncSetTimeout(0);
        api.setFilterModel({ athlete: { filterType: 'text', type: 'contains', filter: 'Thorpe' } });
        await asyncSetTimeout(0);
        expect(events).toEqual([]);

        api.applyTransaction({ add: PEOPLE });
        await asyncSetTimeout(0);
        expect(events).toEqual([['athlete']]);
        await new GridRows(api, 'kept model applied').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:6 athlete:"Ian Thorpe" age:17
        `);
    });

    test.each([false, true])(
        'with enableFilterHandlers %s, an edit before rows load in the Text Filter they replace with a Number Filter goes with it',
        async (enableFilterHandlers) => {
            const api: GridApi = gridsManager.createGrid('grid1', {
                columnDefs: [{ field: 'age', filter: true, floatingFilter: true, filterParams: { debounceMs: 0 } }],
                rowData: [],
                enableFilterHandlers,
            });
            await asyncSetTimeout(0);
            await userEvent.setup().type(FloatingFilterHarness.get(api, 'age').input(), '2');
            await asyncSetTimeout(0);
            expect(api.getFilterModel()).toEqual({ age: { filterType: 'text', type: 'contains', filter: '2' } });

            api.applyTransaction({ add: PEOPLE });
            await asyncSetTimeout(0);
            expect(api.getFilterModel()).toEqual({});
            expect(api.getDisplayedRowCount()).toBe(PEOPLE.length);
        }
    );

    test.each([false, true])(
        'with enableFilterHandlers %s, an edit before rows load in a floating filter whose type they decide wins over a model set earlier',
        async (enableFilterHandlers) => {
            const phelps = { filterType: 'text', type: 'contains', filter: 'Phelps' };
            const api: GridApi = gridsManager.createGrid('grid1', {
                columnDefs: [{ field: 'athlete', filter: true, floatingFilter: true, filterParams: { debounceMs: 0 } }],
                rowData: [],
                enableFilterHandlers,
            });
            await asyncSetTimeout(0);
            void api.setColumnFilterModel('athlete', { filterType: 'text', type: 'contains', filter: 'Thorpe' });
            await asyncSetTimeout(0);
            const user = userEvent.setup();
            await user.clear(FloatingFilterHarness.get(api, 'athlete').input());
            await user.type(FloatingFilterHarness.get(api, 'athlete').input(), 'Phelps');
            await asyncSetTimeout(0);
            expect(api.getColumnFilterModel('athlete')).toEqual(phelps);
            expect(api.getFilterModel()).toEqual({ athlete: phelps });

            api.applyTransaction({ add: PEOPLE });
            await asyncSetTimeout(0);
            await new GridRows(api, 'edit applied').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 athlete:"Michael Phelps"
            `);
        }
    );

    test.each([false, true])(
        'with enableFilterHandlers %s, an initial state model naming no type states the one its option needs',
        async (enableFilterHandlers) => {
            const under20 = { type: 'lessThan', filter: 20 };
            const api: GridApi = gridsManager.createGrid('grid1', {
                columnDefs: [{ field: 'age', filter: true, floatingFilter: true }],
                enableFilterHandlers,
                initialState: { filter: { filterModel: { age: under20 } } },
            });
            await asyncSetTimeout(0);
            expect(api.getColumnFilterModel('age')).toEqual(under20);

            api.setGridOption('rowData', PEOPLE);
            await asyncSetTimeout(0);
            await new GridRows(api, 'initial model applied').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:4 age:17
            └── LEAF id:6 age:17
        `);
        }
    );

    test('a column whose type the rows do not decide builds its filter as with rows, whatever a model states', async () => {
        const api: GridApi = gridsManager.createGrid('grid1', {
            columnDefs: [
                { field: 'athlete', filter: true },
                { colId: 'score', valueGetter: () => 1, filter: true },
            ],
            rowData: [],
        });
        await asyncSetTimeout(0);
        api.setFilterModel({ score: { filterType: 'number', type: 'equals', filter: 1 } });
        const popup = await ColumnFilterHarness.open(api, 'score');
        expect(popup.inputs('number')).toEqual([]);
        expect(popup.input('text').value).toBe('1');
    });
});

describe('doFilterAction without the Set Filter module', () => {
    const gridsManager = new TestGridsManager({ modules: [TextFilterModule, ClientSideRowModelModule] });

    afterEach(() => {
        gridsManager.reset();
        vi.restoreAllMocks();
        enableDevValidations({ throwOn: ALL_SEVERITIES });
    });

    test('clearing preserved Set Filter values reports the missing module', async () => {
        // Deliberate: the missing SetFilterModule is what error #200 reports.
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [200] });
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'athlete', filter: 'agTextColumnFilter' }],
            rowData: PEOPLE,
        });

        errorSpy.mockClear();
        api.doFilterAction({ action: 'clearPreservedValues' });
        await waitFor(() => expect(errorSpy.mock.calls.flat().join(' ')).toContain('error #200'));
    });
});
