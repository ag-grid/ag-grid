import { waitFor } from '@testing-library/dom';
import {
    ALL_SEVERITIES,
    ColumnFilterHarness,
    FilterDom,
    GridRows,
    TestGridsManager,
    asyncSetTimeout,
    installFilterLayoutMock,
    uninstallFilterLayoutMock,
} from 'ag-test-utils';

import type {
    FilterChangedEvent,
    GridApi,
    IDoesFilterPassParams,
    IFilterComp,
    IFilterParams,
    IMultiFilter,
    IRowNode,
    IssueRaisedEvent,
} from 'ag-grid-community';
import {
    AgPromise,
    ClientSideRowModelModule,
    CustomFilterModule,
    ExternalFilterModule,
    GridStateModule,
    HighlightChangesModule,
    NumberFilterModule,
    RowStyleModule,
    TextFilterModule,
    enableDevValidations,
    getGridElement,
    setupAgTestIds,
} from 'ag-grid-community';
import { MultiFilterModule, PivotModule, RowGroupingModule, SetFilterModule } from 'ag-grid-enterprise';

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
            MultiFilterModule,
            CustomFilterModule,
            ExternalFilterModule,
            GridStateModule,
            RowStyleModule,
            HighlightChangesModule,
            RowGroupingModule,
            PivotModule,
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

    test.each([
        {
            name: 'a text model without its filterType',
            model: { athlete: { type: 'contains', filter: 'Ryan' } },
            applied: { athlete: { type: 'contains', filter: 'Ryan', filterType: 'text' } },
            displayed: 1,
        },
        {
            name: 'a set model without its filterType',
            model: { country: { values: ['Russia'] } },
            applied: { country: { filterType: 'set', values: ['Russia'] } },
            displayed: 1,
        },
        {
            name: 'a set model naming a value no row has',
            model: { country: { filterType: 'set', values: ['Russia', 'Narnia'] } },
            applied: { country: { filterType: 'set', values: ['Russia'] } },
            displayed: 1,
        },
        {
            name: 'a text model without its filterType, with filter handlers',
            enableFilterHandlers: true,
            model: { athlete: { type: 'contains', filter: 'Ryan' } },
            applied: { athlete: { type: 'contains', filter: 'Ryan', filterType: 'text' } },
            displayed: 1,
        },
        {
            name: 'a set model without its filterType, with filter handlers',
            enableFilterHandlers: true,
            model: { country: { values: ['Russia'] } },
            applied: { country: { filterType: 'set', values: ['Russia'] } },
            displayed: 1,
        },
        {
            name: 'a set model naming a value no row has, with filter handlers',
            enableFilterHandlers: true,
            model: { country: { filterType: 'set', values: ['Russia', 'Narnia'] } },
            applied: { country: { filterType: 'set', values: ['Russia'] } },
            displayed: 1,
        },
        {
            name: 'a multi model without its filterType',
            model: { age: { filterModels: [{ type: 'greaterThan', filter: 24 }] } },
            applied: {
                age: {
                    filterType: 'multi',
                    filterModels: [{ type: 'greaterThan', filter: 24, filterType: 'number' }, null],
                },
            },
            displayed: 2,
        },
        {
            name: 'a multi model without its filterType, with filter handlers',
            enableFilterHandlers: true,
            model: { age: { filterModels: [{ type: 'greaterThan', filter: 24 }] } },
            applied: {
                age: {
                    filterType: 'multi',
                    filterModels: [{ type: 'greaterThan', filter: 24, filterType: 'number' }, null],
                },
            },
            displayed: 2,
        },
    ])(
        'setFilterModel with $name filters the rows once, as the completed model would, and not again for the same model',
        async ({ enableFilterHandlers, model, applied, displayed }) => {
            const api: GridApi = await gridsManager.createGridAndWait('grid1', {
                columnDefs: [
                    { field: 'athlete', filter: 'agTextColumnFilter' },
                    { field: 'age', filter: 'agMultiColumnFilter' },
                    { field: 'country', filter: 'agSetColumnFilter' },
                ],
                enableFilterHandlers,
                rowData: PEOPLE,
            });
            const events: string[] = [];
            api.addEventListener('filterChanged', (e: FilterChangedEvent) => events.push(`filterChanged ${e.source}`));
            api.addEventListener('modelUpdated', () => events.push('modelUpdated'));

            api.setFilterModel(model);
            await asyncSetTimeout(0);

            expect({ events: [...events], model: api.getFilterModel(), displayed: api.getDisplayedRowCount() }).toEqual(
                {
                    events: ['filterChanged api', 'modelUpdated'],
                    model: applied,
                    displayed,
                }
            );

            events.length = 0;
            api.setFilterModel(model);
            await asyncSetTimeout(0);
            expect({ step: 'again', events }).toEqual({ step: 'again', events: [] });
        }
    );

    test.each([false, true])(
        'setFilterModel with a condition its filter lacks filters again only to clear an applied model (enableFilterHandlers: %s)',
        async (enableFilterHandlers) => {
            const api: GridApi = await gridsManager.createGridAndWait('grid1', {
                columnDefs: threeFilterCols,
                enableFilterHandlers,
                rowData: PEOPLE,
            });
            const events: string[] = [];
            api.addEventListener('filterChanged', (e: FilterChangedEvent) => events.push(`filterChanged ${e.source}`));
            api.addEventListener('modelUpdated', () => events.push('modelUpdated'));
            const lacking = { athlete: { filterType: 'text', type: 'noSuchOption', filter: 'Ryan' } };

            api.setFilterModel(lacking);
            await asyncSetTimeout(0);
            expect({ step: 'unfiltered', events, model: api.getFilterModel() }).toEqual({
                step: 'unfiltered',
                events: [],
                model: {},
            });

            api.setFilterModel({ athlete: { filterType: 'text', type: 'contains', filter: 'Ryan' } });
            await asyncSetTimeout(0);
            events.length = 0;
            api.setFilterModel(lacking);
            await asyncSetTimeout(0);
            expect({
                step: 'filtered',
                events,
                model: api.getFilterModel(),
                displayed: api.getDisplayedRowCount(),
            }).toEqual({
                step: 'filtered',
                events: ['filterChanged api', 'modelUpdated'],
                model: {},
                displayed: PEOPLE.length,
            });
        }
    );

    test.each([false, true])(
        'setState with a filter model its filter completes filters the rows as the completed model does (enableFilterHandlers: %s)',
        async (enableFilterHandlers) => {
            const restore = async (filterModel: object) => {
                const api: GridApi = await gridsManager.createGridAndWait('grid1', {
                    columnDefs: threeFilterCols,
                    enableFilterHandlers,
                    rowData: PEOPLE,
                });
                const events: string[] = [];
                api.addEventListener('filterChanged', (e: FilterChangedEvent) =>
                    events.push(`filterChanged ${e.source}`)
                );
                api.addEventListener('modelUpdated', () => events.push('modelUpdated'));
                api.setState({ filter: { filterModel } });
                await asyncSetTimeout(0);
                const restored = { events, model: api.getFilterModel(), displayed: api.getDisplayedRowCount() };
                gridsManager.reset();
                return restored;
            };

            const completed = await restore({ athlete: { type: 'contains', filter: 'Ryan' } });
            const complete = await restore({ athlete: { filterType: 'text', type: 'contains', filter: 'Ryan' } });

            expect(completed).toEqual(complete);
            expect(complete.events.filter((event) => event.startsWith('filterChanged'))).toEqual(['filterChanged api']);
        }
    );

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

    test('alwaysPassFilter shows the rows it accepts whatever the column and external filters, and a new one applies at once', async () => {
        const sources: string[] = [];
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: threeFilterCols,
            rowData: PEOPLE,
            isExternalFilterPresent: () => true,
            doesExternalFilterPass: (node: IRowNode<Person>) => node.data!.country === 'Australia',
            alwaysPassFilter: (node: IRowNode<Person>) => node.data!.athlete === 'Michael Phelps',
            onFilterChanged: (event: FilterChangedEvent) => sources.push(event.source ?? ''),
        });
        api.setFilterModel({ age: { filterType: 'number', type: 'lessThan', filter: 20 } });
        await asyncSetTimeout(0);
        await new GridRows(api, 'Australian and under 20, or Michael Phelps').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 athlete:"Michael Phelps" age:23 country:"United States"
            └── LEAF id:6 athlete:"Ian Thorpe" age:17 country:"Australia"
        `);

        sources.length = 0;
        api.setGridOption('alwaysPassFilter', (node: IRowNode<Person>) => node.data!.country === 'Russia');
        await asyncSetTimeout(0);
        expect(sources).toEqual(['api']);
        await new GridRows(api, 'Australian and under 20, or from Russia').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:2 athlete:"Aleksey Nemov" age:24 country:"Russia"
            └── LEAF id:6 athlete:"Ian Thorpe" age:17 country:"Australia"
        `);
    });

    test.each([
        {
            call: 'getColumnFilterModel(key, true) without filter handlers',
            message: 'warning #288',
            run: (api: GridApi) => api.getColumnFilterModel('age', true),
            returns: { filterType: 'number', type: 'lessThan', filter: 20 },
        },
        {
            call: 'doFilterAction without filter handlers',
            message: 'warning #287',
            run: (api: GridApi) => api.doFilterAction({ action: 'reset' }),
            returns: undefined,
        },
        {
            call: 'showColumnFilter for no column',
            message: 'error #12',
            run: (api: GridApi) => api.showColumnFilter('ghost'),
            returns: undefined,
        },
        {
            call: 'getColumnFilterHandler for no column',
            message: 'error #12',
            run: (api: GridApi) => api.getColumnFilterHandler('ghost'),
            returns: undefined,
        },
    ])('$call reports $message and leaves the filters as they were', async ({ message, run, returns }) => {
        // the whole list of issues is asserted instead, as a suppressed id raises none
        enableDevValidations({ throwOn: [] });
        vi.spyOn(console, 'warn').mockImplementation(() => {});
        vi.spyOn(console, 'error').mockImplementation(() => {});
        const issues: string[] = [];
        const age = { filterType: 'number', type: 'lessThan', filter: 20 };
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: threeFilterCols,
            rowData: PEOPLE,
            onIssueRaised: (event: IssueRaisedEvent) => issues.push(`${event.severity} #${event.id}`),
        });
        api.setFilterModel({ age });
        await asyncSetTimeout(0);

        expect(run(api)).toEqual(returns);
        await asyncSetTimeout(0);
        expect({
            issues,
            model: api.getFilterModel(),
            popupOpen: !!document.querySelector('.ag-filter-menu'),
            displayed: api.getDisplayedRowCount(),
        }).toEqual({ issues: [message], model: { age }, popupOpen: false, displayed: 2 });
    });

    test('a cell edit narrowing a Set Filter model fires filterChanged without filtering the rows again', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'athlete' }, { field: 'country', filter: 'agSetColumnFilter' }],
            rowData: PEOPLE.map((person) => ({ ...person })),
        });
        api.setFilterModel({ country: { filterType: 'set', values: ['Russia', 'United States'] } });
        await asyncSetTimeout(0);
        const events: string[] = [];
        api.addEventListener('filterChanged', (e: FilterChangedEvent) =>
            events.push(`filterChanged ${e.source} afterDataChange=${!!e.afterDataChange}`)
        );
        api.addEventListener('modelUpdated', () => events.push('modelUpdated'));

        api.getRowNode('2')!.setDataValue('country', 'Spain');
        await waitFor(() => expect(events).toContain('filterChanged columnFilter afterDataChange=true'));
        await asyncSetTimeout(0);
        expect({ events, model: api.getFilterModel() }).toEqual({
            events: ['filterChanged columnFilter afterDataChange=true'],
            model: { country: { filterType: 'set', values: ['United States'] } },
        });
    });

    test('doFilterAction resets the columns it names, given as an array or a single id, or every column without one', async () => {
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

        expect({ step: 'set', displayed: api.getDisplayedRowCount() }).toEqual({ step: 'set', displayed: 3 });

        api.doFilterAction({ colId: ['athlete', 'country'], action: 'reset' });
        await asyncSetTimeout(0);
        expect({
            step: 'athlete and country reset',
            model: api.getFilterModel(),
            displayed: api.getDisplayedRowCount(),
        }).toEqual({
            step: 'athlete and country reset',
            model: { age: { filterType: 'number', type: 'greaterThan', filter: 20 } },
            displayed: 5,
        });

        api.doFilterAction({ colId: 'age', action: 'reset' });
        await asyncSetTimeout(0);
        expect({ step: 'age reset', model: api.getFilterModel(), displayed: api.getDisplayedRowCount() }).toEqual({
            step: 'age reset',
            model: {},
            displayed: PEOPLE.length,
        });

        api.setFilterModel({ athlete: { filterType: 'text', type: 'contains', filter: 'Mi' } });
        await asyncSetTimeout(0);
        api.doFilterAction({ action: 'reset' });
        await asyncSetTimeout(0);
        expect({
            step: 'every column reset',
            model: api.getFilterModel(),
            displayed: api.getDisplayedRowCount(),
        }).toEqual({
            step: 'every column reset',
            model: {},
            displayed: PEOPLE.length,
        });
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

    test.each([false, true])(
        'setColumnFilterModel filters nothing until onFilterChanged, also for a model its filter completes (enableFilterHandlers: %s)',
        async (enableFilterHandlers) => {
            const api: GridApi = await gridsManager.createGridAndWait('grid1', {
                columnDefs: threeFilterCols,
                enableFilterHandlers,
                rowData: PEOPLE,
            });
            const events: string[] = [];
            api.addEventListener('filterChanged', (e: FilterChangedEvent) => events.push(`filterChanged ${e.source}`));
            api.addEventListener('modelUpdated', () => events.push('modelUpdated'));

            await api.setColumnFilterModel('country', { values: ['Russia'] });
            await api.setColumnFilterModel('athlete', { type: 'contains', filter: 'Nemov' });
            await asyncSetTimeout(0);
            expect({ step: 'models set', events, displayed: api.getDisplayedRowCount() }).toEqual({
                step: 'models set',
                events: [],
                displayed: PEOPLE.length,
            });

            api.onFilterChanged();
            await asyncSetTimeout(0);
            expect({ step: 'onFilterChanged', events, model: api.getFilterModel() }).toEqual({
                step: 'onFilterChanged',
                events: ['filterChanged api', 'modelUpdated'],
                model: {
                    country: { filterType: 'set', values: ['Russia'] },
                    athlete: { type: 'contains', filter: 'Nemov', filterType: 'text' },
                },
            });
            await new GridRows(api, 'both column models applied by one onFilterChanged').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:2 athlete:"Aleksey Nemov" age:24 country:"Russia"
        `);

            events.length = 0;
            await api.setColumnFilterModel('country', null);
            const popup = await ColumnFilterHarness.open(api, 'athlete');
            await popup.setText('Ian');
            await asyncSetTimeout(0);
            expect({
                step: 'edited in the popup',
                told: events.includes('filterChanged columnFilter'),
                displayed: api.getDisplayedRowCount(),
            }).toEqual({ step: 'edited in the popup', told: true, displayed: 1 });
        }
    );

    test('setColumnFilterModel on a multi filter completing the model filters nothing until onFilterChanged', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'athlete',
                    filter: 'agMultiColumnFilter',
                    filterParams: { filters: [{ filter: 'agTextColumnFilter', filterParams: { debounceMs: 0 } }] },
                },
                { field: 'age' },
            ],
            rowData: PEOPLE,
        });
        const events: string[] = [];
        api.addEventListener('filterChanged', (e: FilterChangedEvent) => events.push(`filterChanged ${e.source}`));

        await api.setColumnFilterModel('athlete', { filterModels: [{ type: 'contains', filter: 'Ryan' }] });
        await asyncSetTimeout(0);
        expect({ step: 'model set', events: [...events], displayed: api.getDisplayedRowCount() }).toEqual({
            step: 'model set',
            events: [],
            displayed: PEOPLE.length,
        });

        api.onFilterChanged();
        await asyncSetTimeout(0);
        expect({ step: 'onFilterChanged', events: [...events], displayed: api.getDisplayedRowCount() }).toEqual({
            step: 'onFilterChanged',
            events: ['filterChanged api'],
            displayed: 1,
        });

        events.length = 0;
        const popup = await ColumnFilterHarness.open(api, 'athlete');
        await popup.setText('Mi', 0);
        await asyncSetTimeout(0);
        expect({
            step: 'edited in the popup',
            told: events.includes('filterChanged columnFilter'),
            displayed: api.getDisplayedRowCount(),
        }).toEqual({ step: 'edited in the popup', told: true, displayed: 2 });
    });

    test('a multi filter instance given a model to complete filters nothing until onFilterChanged', async () => {
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'athlete',
                    filter: 'agMultiColumnFilter',
                    filterParams: { filters: [{ filter: 'agTextColumnFilter', filterParams: { debounceMs: 0 } }] },
                },
                { field: 'age' },
            ],
            rowData: PEOPLE,
        });
        const events: string[] = [];
        api.addEventListener('filterChanged', (e: FilterChangedEvent) => events.push(`filterChanged ${e.source}`));
        const multi = (await api.getColumnFilterInstance<IMultiFilter>('athlete'))!;

        await multi.setModel({ filterModels: [{ type: 'contains', filter: 'Ryan' }] });
        await asyncSetTimeout(0);
        expect({ step: 'model set', events: [...events], displayed: api.getDisplayedRowCount() }).toEqual({
            step: 'model set',
            events: [],
            displayed: PEOPLE.length,
        });

        api.onFilterChanged();
        await asyncSetTimeout(0);
        expect({ step: 'onFilterChanged', events: [...events], displayed: api.getDisplayedRowCount() }).toEqual({
            step: 'onFilterChanged',
            events: ['filterChanged api'],
            displayed: 1,
        });
    });

    test.each<{
        request: string;
        ask: (params: IFilterParams) => void;
        set: string[];
        again: string[];
        column: string[];
    }>([
        {
            request: 'filterChangedCallback()',
            ask: (params) => params.filterChangedCallback(),
            set: ['filterChanged api [athlete,country]'],
            again: ['filterChanged api [athlete,country]'],
            column: ['filterChanged columnFilter [athlete]'],
        },
        {
            request: 'filterChangedCallback with attributes, and without',
            ask: (params) => {
                params.filterChangedCallback({ fromSetModel: 1 });
                params.filterChangedCallback();
            },
            set: [
                'filterChanged columnFilter [athlete] fromSetModel=1',
                'filterChanged columnFilter [country] fromSetModel=1',
                'filterChanged api [athlete,country]',
            ],
            again: [
                'filterChanged columnFilter [athlete] fromSetModel=1',
                'filterChanged columnFilter [country] fromSetModel=1',
                'filterChanged api [athlete,country]',
            ],
            column: ['filterChanged columnFilter [athlete] fromSetModel=1', 'filterChanged columnFilter [athlete]'],
        },
        {
            request: 'api.onFilterChanged() twice',
            ask: (params) => {
                params.api.onFilterChanged();
                params.api.onFilterChanged();
            },
            set: ['filterChanged api []', 'filterChanged api [athlete]'],
            again: ['filterChanged api []'],
            column: ['filterChanged api []'],
        },
        {
            request: 'api.onFilterChanged with another source',
            ask: (params) => params.api.onFilterChanged('quickFilter'),
            set: ['filterChanged quickFilter []', 'filterChanged api [athlete]'],
            again: ['filterChanged quickFilter []'],
            column: ['filterChanged quickFilter []'],
        },
        {
            request: 'both, from two sources',
            ask: (params) => {
                params.api.onFilterChanged('quickFilter');
                params.filterChangedCallback();
            },
            set: ['filterChanged quickFilter []', 'filterChanged api [athlete,country]'],
            again: ['filterChanged quickFilter []', 'filterChanged api [athlete,country]'],
            column: ['filterChanged quickFilter []', 'filterChanged columnFilter [athlete]'],
        },
    ])(
        'a custom filter asking from setModel with $request filters once, after each API call sets the model',
        async ({ ask, set, again, column }) => {
            class RequestingFilter implements IFilterComp {
                private params!: IFilterParams;
                private model: { value: string } | null = null;
                public init(params: IFilterParams): void {
                    this.params = params;
                }
                public getGui(): HTMLElement {
                    return document.createElement('div');
                }
                public isFilterActive(): boolean {
                    return this.model != null;
                }
                public doesFilterPass(params: IDoesFilterPassParams<Person>): boolean {
                    return params.data.athlete.includes(this.model!.value);
                }
                public getModel() {
                    return this.model;
                }
                public setModel(model: { value: string } | null): void {
                    this.model = model;
                    ask(this.params);
                }
            }
            const api: GridApi = await gridsManager.createGridAndWait('grid1', {
                columnDefs: [
                    { field: 'athlete', filter: RequestingFilter },
                    { field: 'country', filter: RequestingFilter },
                    { field: 'age', filter: 'agNumberColumnFilter' },
                ],
                rowData: PEOPLE,
            });
            await api.getColumnFilterInstance('athlete');
            await api.getColumnFilterInstance('country');
            const events: string[] = [];
            api.addEventListener('filterChanged', (e: FilterChangedEvent) =>
                events.push(
                    `filterChanged ${e.source} [${e.columns.map((col) => col.getColId())}]${'fromSetModel' in e ? ` fromSetModel=${e.fromSetModel}` : ''}`
                )
            );
            api.addEventListener('modelUpdated', (e) =>
                events.push(`modelUpdated keepRenderedRows=${e.keepRenderedRows}`)
            );
            const refreshed = (filterChanged: string[]) => [...filterChanged, 'modelUpdated keepRenderedRows=true'];

            api.setFilterModel({ athlete: { value: 'Mi' } });
            await asyncSetTimeout(0);
            expect({ step: 'set', events: [...events], displayed: api.getDisplayedRowCount() }).toEqual({
                step: 'set',
                events: refreshed(set),
                displayed: 2,
            });

            events.length = 0;
            api.setFilterModel({ athlete: { value: 'Mi' } });
            await asyncSetTimeout(0);
            expect({ step: 'again', events: [...events] }).toEqual({ step: 'again', events: refreshed(again) });

            events.length = 0;
            await api.setColumnFilterModel('age', { filterType: 'number', type: 'greaterThan', filter: 0 });
            await asyncSetTimeout(0);
            expect({ step: 'another column', events: [...events] }).toEqual({ step: 'another column', events: [] });

            await api.setColumnFilterModel('athlete', { value: 'Missy' });
            await asyncSetTimeout(0);
            expect({ step: 'column', events: [...events], displayed: api.getDisplayedRowCount() }).toEqual({
                step: 'column',
                events: refreshed(column),
                displayed: 1,
            });

            events.length = 0;
            await api.setColumnFilterModel('age', { filterType: 'number', type: 'lessThan', filter: 20 });
            await asyncSetTimeout(0);
            expect({ step: 'another column again', events }).toEqual({ step: 'another column again', events: [] });
        }
    );

    test('setFilterModel called while rows are drawn filters again after the draw when a custom filter asks from setModel', async () => {
        let passes = 0;
        class AskingFilter implements IFilterComp {
            private params!: IFilterParams;
            public init(params: IFilterParams): void {
                this.params = params;
            }
            public getGui(): HTMLElement {
                return document.createElement('div');
            }
            public isFilterActive(): boolean {
                return true;
            }
            public doesFilterPass(): boolean {
                ++passes;
                return true;
            }
            public getModel() {
                return null;
            }
            public setModel(): void {
                this.params.filterChangedCallback();
            }
        }
        let setDuringDraw = false;
        const errors: string[] = [];
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'athlete', filter: AskingFilter }],
            getRowClass: (params) => {
                if (setDuringDraw) {
                    setDuringDraw = false;
                    try {
                        params.api.setFilterModel(null);
                    } catch (e) {
                        errors.push(String(e));
                    }
                }
                return undefined;
            },
            rowData: PEOPLE,
        });
        await api.getColumnFilterInstance('athlete');
        const events: string[] = [];
        api.addEventListener('filterChanged', (e: FilterChangedEvent) => events.push(`filterChanged ${e.source}`));

        passes = 0;
        setDuringDraw = true;
        api.redrawRows();
        await waitFor(() => expect(events).toEqual(['filterChanged api']));

        expect({ events, passes, errors }).toEqual({
            events: ['filterChanged api'],
            passes: PEOPLE.length,
            errors: [],
        });
    });

    test('setColumnFilterModel filters once, after any other filter initialising, for a custom filter asking from setModel', async () => {
        class AskingFilter implements IFilterComp {
            private params!: IFilterParams;
            private model: { value: string } | null = null;
            public init(params: IFilterParams): void {
                this.params = params;
            }
            public getGui(): HTMLElement {
                return document.createElement('div');
            }
            public isFilterActive(): boolean {
                return this.model != null;
            }
            public doesFilterPass(params: IDoesFilterPassParams<Person>): boolean {
                return params.data.athlete.includes(this.model!.value);
            }
            public getModel() {
                return this.model;
            }
            public setModel(model: { value: string } | null): void {
                this.model = model;
                this.params.filterChangedCallback();
            }
        }
        let initCountry = () => {};
        class LateFilter implements IFilterComp {
            public init(): AgPromise<void> {
                return new AgPromise<void>((resolve) => {
                    initCountry = resolve;
                });
            }
            public getGui(): HTMLElement {
                return document.createElement('div');
            }
            public isFilterActive(): boolean {
                return false;
            }
            public doesFilterPass(): boolean {
                return true;
            }
            public getModel() {
                return null;
            }
            public setModel(): void {}
        }
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                { field: 'athlete', filter: AskingFilter },
                { field: 'country', filter: LateFilter },
            ],
            rowData: PEOPLE,
        });
        await api.getColumnFilterInstance('athlete');
        const events: string[] = [];
        api.addEventListener('filterChanged', (e: FilterChangedEvent) =>
            events.push(`filterChanged ${e.source} [${e.columns.map((col) => col.getColId())}]`)
        );
        api.addEventListener('modelUpdated', () => events.push('modelUpdated'));

        await api.setColumnFilterModel('athlete', { value: 'Ian' });
        await asyncSetTimeout(0);
        expect({ step: 'country not created', events: [...events] }).toEqual({
            step: 'country not created',
            events: ['filterChanged columnFilter [athlete]', 'modelUpdated'],
        });

        events.length = 0;
        const country = api.getColumnFilterInstance('country');
        await api.setColumnFilterModel('athlete', { value: 'Mi' });
        await asyncSetTimeout(0);
        expect({ step: 'country initialising', events: [...events] }).toEqual({
            step: 'country initialising',
            events: [],
        });

        initCountry();
        await country;
        await asyncSetTimeout(0);
        expect({ step: 'country ready', events, displayed: api.getDisplayedRowCount() }).toEqual({
            step: 'country ready',
            events: ['filterChanged columnFilter [athlete]', 'modelUpdated'],
            displayed: 2,
        });
    });

    test('setFilterModel with a custom filter asking from setModel flashes no cell the filtering changes', async () => {
        class AskingFilter implements IFilterComp {
            private params!: IFilterParams;
            private model: { value: string } | null = null;
            public init(params: IFilterParams): void {
                this.params = params;
            }
            public getGui(): HTMLElement {
                return document.createElement('div');
            }
            public isFilterActive(): boolean {
                return this.model != null;
            }
            public doesFilterPass(params: IDoesFilterPassParams<Person>): boolean {
                return params.data.athlete.includes(this.model!.value);
            }
            public getModel() {
                return this.model;
            }
            public setModel(model: { value: string } | null): void {
                this.model = model;
                this.params.filterChangedCallback();
            }
        }
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                { field: 'country', rowGroup: true },
                { field: 'athlete', filter: AskingFilter },
                { field: 'age', aggFunc: 'sum', enableCellChangeFlash: true },
            ],
            groupDefaultExpanded: -1,
            rowData: PEOPLE,
        });
        await api.getColumnFilterInstance('athlete');

        api.setFilterModel({ athlete: { value: 'Mi' } });
        await asyncSetTimeout(0);
        const gridElement = getGridElement(api)!;
        expect({
            step: 'filtered',
            displayed: api.getDisplayedRowCount(),
            flashing: gridElement.querySelectorAll('.ag-cell-data-changed').length,
        }).toEqual({ step: 'filtered', displayed: 3, flashing: 0 });

        api.getRowNode('0')!.setDataValue('age', 30);
        await asyncSetTimeout(0);
        expect({
            step: 'value changed',
            flashing: gridElement.querySelectorAll('.ag-cell-data-changed').length,
        }).toEqual({ step: 'value changed', flashing: 2 });
    });

    test('setFilterModel on a pivot column runs every filter again when a custom filter calls api.onFilterChanged() from setModel', async () => {
        let excludedCountry = '';
        class ExcludingFilter implements IFilterComp {
            private params!: IFilterParams;
            public init(params: IFilterParams): void {
                this.params = params;
            }
            public getGui(): HTMLElement {
                return document.createElement('div');
            }
            public isFilterActive(): boolean {
                return excludedCountry !== '';
            }
            public doesFilterPass(params: IDoesFilterPassParams): boolean {
                return params.data.country !== excludedCountry;
            }
            public getModel() {
                return null;
            }
            public setModel(): void {
                this.params.api.onFilterChanged();
            }
        }
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                { field: 'country', rowGroup: true, filter: ExcludingFilter },
                { field: 'sport', pivot: true },
                { field: 'gold', aggFunc: 'sum', filter: 'agNumberColumnFilter' },
            ],
            pivotMode: true,
            rowData: [
                { country: 'Australia', sport: 'Swimming', gold: 5 },
                { country: 'USA', sport: 'Swimming', gold: 4 },
                { country: 'Russia', sport: 'Gymnastics', gold: 3 },
            ],
        });
        await api.getColumnFilterInstance('country');
        const events: string[] = [];
        api.addEventListener('filterChanged', (e: FilterChangedEvent) =>
            events.push(`filterChanged ${e.source} [${e.columns.map((col) => col.getColId())}]`)
        );
        api.addEventListener('modelUpdated', () => events.push('modelUpdated'));

        excludedCountry = 'Australia';
        api.setFilterModel({ pivot_sport_Swimming_gold: { filterType: 'number', type: 'greaterThan', filter: 0 } });
        await asyncSetTimeout(0);
        const groups: string[] = [];
        api.forEachNodeAfterFilterAndSort((node) => {
            if (node.group) {
                groups.push(node.key!);
            }
        });
        expect({ events, groups }).toEqual({
            events: ['filterChanged api []', 'filterChanged api [pivot_sport_Swimming_gold]', 'modelUpdated'],
            groups: ['USA'],
        });
    });

    test('an API call made while the first of two filter events of another call fires filters once for each call', async () => {
        class AttributingFilter implements IFilterComp {
            private params!: IFilterParams;
            private model: { value: string } | null = null;
            public init(params: IFilterParams): void {
                this.params = params;
            }
            public getGui(): HTMLElement {
                return document.createElement('div');
            }
            public isFilterActive(): boolean {
                return this.model != null;
            }
            public doesFilterPass(params: IDoesFilterPassParams<Person>): boolean {
                return params.data.athlete.includes(this.model!.value);
            }
            public getModel() {
                return this.model;
            }
            public setModel(model: { value: string } | null): void {
                this.model = model;
                this.params.filterChangedCallback({ fromSetModel: 1 });
                this.params.api.onFilterChanged('quickFilter');
            }
        }
        let reacted = false;
        class ReactingFilter implements IFilterComp {
            private params!: IFilterParams;
            private model: { value: string } | null = null;
            public init(params: IFilterParams): void {
                this.params = params;
            }
            public getGui(): HTMLElement {
                return document.createElement('div');
            }
            public isFilterActive(): boolean {
                return this.model != null;
            }
            public doesFilterPass(params: IDoesFilterPassParams<Person>): boolean {
                return params.data.country.includes(this.model!.value);
            }
            public getModel() {
                return this.model;
            }
            public setModel(model: { value: string } | null): void {
                this.model = model;
                this.params.filterChangedCallback();
            }
            public onAnyFilterChanged(): void {
                if (!reacted) {
                    reacted = true;
                    void this.params.api.setColumnFilterModel('country', { value: 'United' });
                }
            }
        }
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                { field: 'athlete', filter: AttributingFilter },
                { field: 'country', filter: ReactingFilter },
            ],
            rowData: PEOPLE,
        });
        await api.getColumnFilterInstance('athlete');
        await api.getColumnFilterInstance('country');
        const events: string[] = [];
        api.addEventListener('filterChanged', (e: FilterChangedEvent) =>
            events.push(`filterChanged ${e.source} [${e.columns.map((col) => col.getColId())}]`)
        );
        api.addEventListener('modelUpdated', () => events.push('modelUpdated'));

        await api.setColumnFilterModel('athlete', { value: 'Mi' });
        await asyncSetTimeout(0);
        expect({ events, displayed: api.getDisplayedRowCount() }).toEqual({
            events: [
                'filterChanged columnFilter [country]',
                'modelUpdated',
                'filterChanged columnFilter [athlete]',
                'filterChanged quickFilter []',
                'modelUpdated',
            ],
            displayed: 2,
        });
    });

    test('filterChangedCallback, also from setModel during an API call, runs onAnyFilterChanged on every other filter, and on the asking one unless its request is the only change', async () => {
        const told: string[] = [];
        interface TellingFilterParams extends IFilterParams {
            asksFromSetModel: boolean;
        }
        class TellingFilter implements IFilterComp {
            private params!: TellingFilterParams;
            private model: { value: string } | null = null;
            public asksFromSetModel = false;
            public init(params: TellingFilterParams): void {
                this.params = params;
                this.asksFromSetModel = params.asksFromSetModel;
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
            public setModel(model: { value: string } | null): void {
                this.model = model;
                if (this.asksFromSetModel) {
                    this.params.filterChangedCallback();
                }
            }
            public onAnyFilterChanged(): void {
                told.push(this.params.column.getColId());
            }
            public change(): void {
                this.params.filterChangedCallback();
            }
        }
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                { field: 'athlete', filter: TellingFilter, filterParams: { asksFromSetModel: true } },
                { field: 'country', filter: TellingFilter, filterParams: { asksFromSetModel: false } },
            ],
            rowData: PEOPLE,
        });
        const athleteFilter = await api.getColumnFilterInstance<TellingFilter>('athlete');
        const countryFilter = await api.getColumnFilterInstance<TellingFilter>('country');

        athleteFilter!.change();
        await asyncSetTimeout(0);
        const changed = [...told];
        told.length = 0;
        await api.setColumnFilterModel('athlete', null);
        await asyncSetTimeout(0);
        expect({ changed, columnModel: told }).toEqual({ changed: ['country'], columnModel: ['country'] });

        const tellsAfter = async (model: Record<string, { value: string }>) => {
            told.length = 0;
            api.setFilterModel(model);
            await asyncSetTimeout(0);
            return [...told].sort();
        };
        expect({
            ownModelChanged: await tellsAfter({ athlete: { value: 'a' } }),
            ownModelUnchanged: await tellsAfter({ athlete: { value: 'a' } }),
            otherModelChanged: await tellsAfter({ athlete: { value: 'a' }, country: { value: 'c' } }),
            otherModelUnchanged: await tellsAfter({ athlete: { value: 'a' }, country: { value: 'c' } }),
        }).toEqual({
            ownModelChanged: ['athlete', 'country'],
            ownModelUnchanged: ['country'],
            otherModelChanged: ['athlete', 'country'],
            otherModelUnchanged: ['country'],
        });

        countryFilter!.asksFromSetModel = true;
        expect({
            bothAskUnchanged: await tellsAfter({ athlete: { value: 'a' }, country: { value: 'c' } }),
        }).toEqual({ bothAskUnchanged: ['athlete', 'country'] });
    });

    test('a custom filter setting another column model from its setModel filters once for the outer setFilterModel', async () => {
        class LinkedFilter implements IFilterComp {
            private params!: IFilterParams;
            private model: { value: string } | null = null;
            public init(params: IFilterParams): void {
                this.params = params;
            }
            public getGui(): HTMLElement {
                return document.createElement('div');
            }
            public isFilterActive(): boolean {
                return this.model != null;
            }
            public doesFilterPass(params: IDoesFilterPassParams<Person>): boolean {
                return params.data.athlete.includes(this.model!.value);
            }
            public getModel() {
                return this.model;
            }
            public setModel(model: { value: string } | null): void {
                this.model = model;
                this.params.filterChangedCallback();
                void this.params.api.setColumnFilterModel('age', {
                    filterType: 'number',
                    type: 'lessThan',
                    filter: 20,
                });
            }
        }
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                { field: 'athlete', filter: LinkedFilter },
                { field: 'age', filter: 'agNumberColumnFilter' },
            ],
            rowData: PEOPLE,
        });
        await api.getColumnFilterInstance('athlete');
        const events: string[] = [];
        api.addEventListener('filterChanged', (e: FilterChangedEvent) =>
            events.push(`${e.source}:${e.columns.map((column) => column.getColId()).join()}`)
        );

        api.setFilterModel({ athlete: { value: 'I' } });
        await asyncSetTimeout(0);

        // the outer model holds no age, so the age model the filter set is cleared again by the same call
        expect({ events, displayed: api.getDisplayedRowCount() }).toEqual({ events: ['api:athlete'], displayed: 1 });
    });

    test('a custom filter asking to filter again and then throwing from setModel is answered once, leaving no request for a later call', async () => {
        class ThrowingFilter implements IFilterComp {
            private params!: IFilterParams;
            public init(params: IFilterParams): void {
                this.params = params;
            }
            public getGui(): HTMLElement {
                return document.createElement('div');
            }
            public isFilterActive(): boolean {
                return false;
            }
            public doesFilterPass(): boolean {
                return true;
            }
            public getModel() {
                return null;
            }
            public setModel(): void {
                this.params.filterChangedCallback();
                throw new Error('setModel failed');
            }
        }
        const api: GridApi = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                { field: 'athlete', filter: ThrowingFilter },
                { field: 'age', filter: 'agNumberColumnFilter' },
            ],
            rowData: PEOPLE,
        });
        await api.getColumnFilterInstance('athlete');
        const columns: string[][] = [];
        api.addEventListener('filterChanged', (e: FilterChangedEvent) =>
            columns.push(e.columns.map((column) => column.getColId()))
        );

        const setAge = async (filter: number) => {
            columns.length = 0;
            await api.setColumnFilterModel('age', { filterType: 'number', type: 'lessThan', filter });
            await asyncSetTimeout(0);
            return [...columns];
        };

        await expect(api.setColumnFilterModel('athlete', { value: 'Ian' })).rejects.toThrow('setModel failed');
        await asyncSetTimeout(0);
        const columnModel = [...columns];
        const afterColumnModel = await setAge(20);
        columns.length = 0;
        expect(() => api.setFilterModel({ athlete: { value: 'Ian' } })).toThrow('setModel failed');
        await asyncSetTimeout(0);
        const wholeModel = [...columns];
        const afterWholeModel = await setAge(30);

        expect({ columnModel, afterColumnModel, wholeModel, afterWholeModel }).toEqual({
            columnModel: [['athlete']],
            afterColumnModel: [],
            wholeModel: [['athlete']],
            afterWholeModel: [],
        });
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
        expect(api.isColumnFilterPresent()).toBe(false);

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

    test('a column model set before the rows arrive adds to the initial state model', async () => {
        const country = { filterType: 'set', values: ['Australia'] };
        const age = { filterType: 'number', type: 'lessThan', filter: 20 };
        const api: GridApi = gridsManager.createGrid('grid1', {
            columnDefs: threeFilterCols,
            rowData: [],
            initialState: { filter: { filterModel: { country } } },
        });
        await asyncSetTimeout(0);

        void api.setColumnFilterModel('age', age);
        expect(api.getFilterModel()).toEqual({ country, age });

        api.applyTransaction({ add: PEOPLE });
        await asyncSetTimeout(0);
        expect(api.getFilterModel()).toEqual({ country, age });
        await new GridRows(api, 'initial state and column model applied').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:6 athlete:"Ian Thorpe" age:17 country:"Australia"
        `);
    });

    test('a model restored with setState before the rows arrive reads back at once', async () => {
        const filterModel = { country: { filterType: 'set', values: ['Russia'] } };
        const api: GridApi = gridsManager.createGrid('grid1', { columnDefs: threeFilterCols, rowData: [] });
        await asyncSetTimeout(0);

        api.setState({ filter: { filterModel } });
        expect(api.getFilterModel()).toEqual(filterModel);

        api.applyTransaction({ add: PEOPLE });
        await asyncSetTimeout(0);
        expect(api.getFilterModel()).toEqual(filterModel);
        await new GridRows(api, 'restored model applied').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:2 athlete:"Aleksey Nemov" age:24 country:"Russia"
        `);
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
