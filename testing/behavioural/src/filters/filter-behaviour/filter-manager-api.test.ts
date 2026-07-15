import type { FilterChangedEvent, GridApi, IRowNode } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ExternalFilterModule,
    NumberFilterModule,
    TextFilterModule,
    setupAgTestIds,
} from 'ag-grid-community';
import { SetFilterModule } from 'ag-grid-enterprise';

import {
    ColumnFilterHarness,
    GridRows,
    TestGridsManager,
    asyncSetTimeout,
    installFilterLayoutMock,
    uninstallFilterLayoutMock,
} from '../../test-utils';

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
            ExternalFilterModule,
            ClientSideRowModelModule,
        ],
    });

    beforeAll(() => {
        setupAgTestIds();
        installFilterLayoutMock();
    });
    afterAll(() => uninstallFilterLayoutMock());
    afterEach(() => gridsManager.reset());

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
});
