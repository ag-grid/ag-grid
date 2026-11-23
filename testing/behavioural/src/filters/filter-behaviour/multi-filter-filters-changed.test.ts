import { ColumnFilterHarness, GridRows, asyncSetTimeout } from 'ag-test-utils';

import type { ColDef, GridApi } from 'ag-grid-community';

import { ROWS, floatingChildren, setupMultiFilterSuite } from './multiFilterHarness';
import { FILTERS_SIDEBAR, openFiltersPanel } from './toolPanelHarness';

/** Multi Filter children following changes to `filterParams.filters` and the column definition. */
describe('Multi Filter — sub-filter combos & combined model (coverage)', () => {
    const gridsManager = setupMultiFilterSuite();

    describe.each([false, true])('filterParams.filters changed (enableFilterHandlers: %s)', (enableFilterHandlers) => {
        const TEXT_CHILD = { filter: 'agTextColumnFilter', filterParams: { debounceMs: 0, maxNumConditions: 1 } };

        const colDefsWith = (filters: object[], extra?: object) => [
            { field: 'name', filter: 'agMultiColumnFilter', filterParams: { filters }, ...extra },
        ];

        const numChildFilters = async (api: GridApi) =>
            ((await api.getColumnFilterInstance('name')) as { getNumChildFilters(): number }).getNumChildFilters();

        const setFilterList = () => document.querySelector('.ag-filter-menu')!.querySelector('.ag-set-filter-list');

        test('a removed child leaves the popup and stops filtering', async () => {
            const api: GridApi = await gridsManager.createGridAndWait('grid1', {
                enableFilterHandlers,
                columnDefs: colDefsWith([TEXT_CHILD, { filter: 'agSetColumnFilter' }]),
                rowData: ROWS,
            });

            await api.setColumnFilterModel('name', {
                filterType: 'multi',
                filterModels: [null, { filterType: 'set', values: ['bob'] }],
            });
            api.onFilterChanged();
            await asyncSetTimeout(0);
            await new GridRows(api, 'set child filtering to bob').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:2 name:"bob"
            `);

            api.setGridOption('columnDefs', colDefsWith([TEXT_CHILD]));
            await asyncSetTimeout(0);

            expect(await numChildFilters(api)).toBe(1);
            await new GridRows(api, 'removed set child no longer filters').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 name:"michael"
                ├── LEAF id:1 name:"michelle"
                ├── LEAF id:2 name:"bob"
                └── LEAF id:3 name:"alice"
            `);

            await ColumnFilterHarness.open(api, 'name');
            expect(setFilterList()).toBeNull();
        });

        test("a set child's key change resets a Multi Filter whose model came from the initial state", async () => {
            const setChild = (caseSensitive: boolean) => ({
                filter: 'agSetColumnFilter',
                filterParams: { caseSensitive },
            });
            const api: GridApi = await gridsManager.createGridAndWait('grid1', {
                enableFilterHandlers,
                columnDefs: colDefsWith([TEXT_CHILD, setChild(false)]),
                rowData: ROWS,
                initialState: {
                    filter: {
                        filterModel: {
                            name: { filterType: 'multi', filterModels: [null, { filterType: 'set', values: ['bob'] }] },
                        },
                    },
                },
            });
            await asyncSetTimeout(0);
            expect(api.getDisplayedRowAtIndex(0)!.data.name).toBe('bob');
            expect(api.getDisplayedRowCount()).toBe(1);

            api.setGridOption('columnDefs', colDefsWith([TEXT_CHILD, setChild(true)]));
            await asyncSetTimeout(0);

            expect(api.getColumnFilterModel('name')).toBeNull();
            expect(api.getDisplayedRowCount()).toBe(4);
        });

        test("a set child's model reconciled while it takes a new getter keeps reading through the new getter", async () => {
            const byFirst = ({ data }: { data: { first: string } }) => data.first;
            const bySecond = ({ data }: { data: { second: string } }) => data.second;
            const setChild = (filterValueGetter: typeof byFirst | typeof bySecond, values: string[]) => ({
                filter: 'agSetColumnFilter',
                filterValueGetter,
                filterParams: { values },
            });
            const api: GridApi = await gridsManager.createGridAndWait('grid1', {
                enableFilterHandlers,
                columnDefs: colDefsWith([TEXT_CHILD, setChild(byFirst, ['A', 'B', 'C'])], { field: 'first' }),
                rowData: [
                    { first: 'A', second: 'C' },
                    { first: 'C', second: 'A' },
                    { first: 'B', second: 'B' },
                ],
            });
            await api.setColumnFilterModel('first', {
                filterType: 'multi',
                filterModels: [null, { filterType: 'set', values: ['A', 'B'] }],
            });
            api.onFilterChanged();
            await asyncSetTimeout(0);
            expect(api.getDisplayedRowCount()).toBe(2);

            // the new values leave out the selection's B, so the model is reconciled during the update
            api.setGridOption(
                'columnDefs',
                colDefsWith([TEXT_CHILD, setChild(bySecond, ['A', 'C'])], { field: 'first' })
            );
            await asyncSetTimeout(0);

            expect(api.getColumnFilterModel('first')).toEqual({
                filterType: 'multi',
                filterModels: [null, { filterType: 'set', values: ['A'] }],
            });
            await new GridRows(api, 'rows whose second value is A').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:1 first:"C"
            `);
        });

        test("a set child's key change resets the Multi Filter, telling its column once within the update, while an earlier child reconciles its model in it", async () => {
            const setChild = (values: string[], caseSensitive: boolean) => ({
                filter: 'agSetColumnFilter',
                filterParams: { values, caseSensitive },
            });
            const api: GridApi = await gridsManager.createGridAndWait('grid1', {
                enableFilterHandlers,
                columnDefs: colDefsWith([setChild(['A', 'B', 'C'], false), setChild(['A', 'B', 'C'], false)]),
                rowData: [{ name: 'A' }, { name: 'B' }, { name: 'C' }, { name: 'a' }],
            });
            await api.setColumnFilterModel('name', {
                filterType: 'multi',
                filterModels: [
                    { filterType: 'set', values: ['A', 'C'] },
                    { filterType: 'set', values: ['A'] },
                ],
            });
            api.onFilterChanged();
            await asyncSetTimeout(0);
            expect(api.getDisplayedRowCount()).toBe(2);
            const seen: unknown[] = [];
            api.getColumn('name')!.addEventListener('filterChanged', () => seen.push(api.getColumnFilterModel('name')));

            // the new values leave out the first child's C, and the second child's keys change
            api.setGridOption(
                'columnDefs',
                colDefsWith([setChild(['A', 'B'], false), setChild(['A', 'B', 'C'], true)])
            );
            // within the update only: the filter change raised after it is not this update's
            expect(seen).toEqual([null]);
            await asyncSetTimeout(0);

            expect(api.getColumnFilterModel('name')).toBeNull();
            expect(api.getDisplayedRowCount()).toBe(4);
        });

        test("a set child's new case sensitivity resets the whole Multi Filter", async () => {
            const setChild = (caseSensitive: boolean) => ({
                filter: 'agSetColumnFilter',
                filterParams: { caseSensitive },
            });
            const api: GridApi = await gridsManager.createGridAndWait('grid1', {
                enableFilterHandlers,
                columnDefs: colDefsWith([TEXT_CHILD, setChild(false)]),
                rowData: ROWS,
            });

            await api.setColumnFilterModel('name', {
                filterType: 'multi',
                filterModels: [
                    { filterType: 'text', type: 'contains', filter: 'mi' },
                    { filterType: 'set', values: ['michael'] },
                ],
            });
            api.onFilterChanged();
            await asyncSetTimeout(0);
            await new GridRows(api, 'both children filtering').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 name:"michael"
            `);

            api.setGridOption('columnDefs', colDefsWith([TEXT_CHILD, setChild(true)]));
            await asyncSetTimeout(0);

            expect(api.getColumnFilterModel('name')).toBeNull();
            await new GridRows(api, 'multi filter reset').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 name:"michael"
                ├── LEAF id:1 name:"michelle"
                ├── LEAF id:2 name:"bob"
                └── LEAF id:3 name:"alice"
            `);
        });

        test("a set child's own filter value getter keeps the Multi Filter while the same and resets it when new", async () => {
            const byName = ({ data }: { data: { name: string } }) => data.name;
            const withChildGetter = (filterValueGetter: (params: { data: { name: string } }) => string) =>
                colDefsWith([TEXT_CHILD, { filter: 'agSetColumnFilter', filterValueGetter }]);
            const api: GridApi = await gridsManager.createGridAndWait('grid1', {
                enableFilterHandlers,
                columnDefs: withChildGetter(byName),
                rowData: ROWS,
            });
            const model = { filterType: 'multi', filterModels: [null, { filterType: 'set', values: ['bob'] }] };
            await api.setColumnFilterModel('name', model);
            api.onFilterChanged();
            await asyncSetTimeout(0);

            api.setGridOption('columnDefs', withChildGetter(byName));
            await asyncSetTimeout(0);
            expect(api.getColumnFilterModel('name')).toEqual(model);

            api.setGridOption(
                'columnDefs',
                withChildGetter(({ data }) => data.name)
            );
            await asyncSetTimeout(0);

            expect(api.getColumnFilterModel('name')).toBeNull();
            await new GridRows(api, "multi filter reset by the set child's getter").check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 name:"michael"
                ├── LEAF id:1 name:"michelle"
                ├── LEAF id:2 name:"bob"
                └── LEAF id:3 name:"alice"
            `);
        });

        test("a set child's open list refolds its values when only its case sensitivity changes", async () => {
            const values = ['bob', 'Bob', 'alice'];
            const setChild = (caseSensitive: boolean) => ({
                filter: 'agSetColumnFilter',
                filterParams: { values, caseSensitive },
            });
            const api: GridApi = await gridsManager.createGridAndWait('grid1', {
                enableFilterHandlers,
                columnDefs: colDefsWith([TEXT_CHILD, setChild(false)]),
                rowData: ROWS,
            });
            const filter = await ColumnFilterHarness.open(api, 'name');
            expect(filter.setFilterItemLabels()).toEqual(['(Select All)', 'alice', 'bob']);

            api.setGridOption('columnDefs', colDefsWith([TEXT_CHILD, setChild(true)]));
            await asyncSetTimeout(0);

            expect(filter.setFilterItemLabels()).toEqual(['(Select All)', 'Bob', 'alice', 'bob']);
        });

        test('a set child whose filterParams is a function keeps them through a model update and a header rename, which it is told is a column definition update', async () => {
            const sources: string[] = [];
            const setChild = {
                filter: 'agSetColumnFilter',
                filterParams: ({ source }: { source: string }) => {
                    sources.push(source);
                    return { caseSensitive: true };
                },
            };
            // without a data type, nothing replaces the function with parameters of its own
            const cols = (headerName: string) => colDefsWith([setChild], { headerName, cellDataType: false });
            const api: GridApi = await gridsManager.createGridAndWait('grid1', {
                enableFilterHandlers,
                columnDefs: cols('Name'),
                rowData: [{ name: 'bob' }, { name: 'Bob' }, { name: 'cat' }],
            });
            const model = { filterType: 'multi', filterModels: [{ filterType: 'set', values: ['bob'] }] };
            await api.setColumnFilterModel('name', model);
            api.onFilterChanged();
            await asyncSetTimeout(0);

            const callsBefore = sources.length;
            api.setGridOption('columnDefs', cols('Name renamed'));
            await asyncSetTimeout(0);

            expect(sources.length).toBeGreaterThan(callsBefore);
            expect(new Set(sources.slice(callsBefore))).toEqual(new Set(['colDef']));
            expect(api.getColumnFilterModel('name')).toEqual(model);
            await new GridRows(api, 'only the lower case bob').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 name:"bob"
            `);
        });

        test("a set child's open tree list takes its new path getter, with or without new keys", async () => {
            const byInitialThenName = (value: string | null) => (value ? [value[0], value] : null);
            const byName = (value: string | null) => (value ? [value] : null);
            const setChild = (caseSensitive: boolean, treeListPathGetter: typeof byName) => ({
                filter: 'agSetColumnFilter',
                filterParams: { caseSensitive, treeList: true, treeListPathGetter },
            });
            const api: GridApi = await gridsManager.createGridAndWait('grid1', {
                enableFilterHandlers,
                columnDefs: colDefsWith([TEXT_CHILD, setChild(false, byInitialThenName)]),
                rowData: ROWS,
            });
            const filter = await ColumnFilterHarness.open(api, 'name');
            expect(filter.setFilterItemLabels()).toEqual(['(Select All)', 'a', 'b', 'm']);

            api.setGridOption('columnDefs', colDefsWith([TEXT_CHILD, setChild(false, byName)]));
            await asyncSetTimeout(0);
            expect(filter.setFilterItemLabels()).toEqual(['(Select All)', 'alice', 'bob', 'michael', 'michelle']);

            api.setGridOption('columnDefs', colDefsWith([TEXT_CHILD, setChild(true, byInitialThenName)]));
            await asyncSetTimeout(0);
            expect(filter.setFilterItemLabels()).toEqual(['(Select All)', 'a', 'b', 'm']);
        });

        test('a set child turned into a tree list on a column that groups nothing shows the tree and keeps the filter', async () => {
            const byInitialThenName = (value: string | null) => (value ? [value[0], value] : null);
            const setChild = (treeList: boolean) => ({
                filter: 'agSetColumnFilter',
                filterParams: { treeList, treeListPathGetter: byInitialThenName },
            });
            const model = {
                filterType: 'multi',
                filterModels: [
                    { filterType: 'text', type: 'contains', filter: 'o' },
                    { filterType: 'set', values: ['alice', 'bob'] },
                ],
            };
            const api: GridApi = await gridsManager.createGridAndWait('grid1', {
                enableFilterHandlers,
                columnDefs: colDefsWith([TEXT_CHILD, setChild(false)]),
                rowData: ROWS,
            });
            await api.setColumnFilterModel('name', model);
            api.onFilterChanged();
            const filter = await ColumnFilterHarness.open(api, 'name');

            api.setGridOption('columnDefs', colDefsWith([TEXT_CHILD, setChild(true)]));
            await asyncSetTimeout(0);

            expect(api.getColumnFilterModel('name')).toEqual(model);
            await new GridRows(api, 'both children still filter').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:2 name:"bob"
            `);
            // the text child leaves only bob, under his initial
            expect(filter.setFilterItemLabels()).toEqual(['(Select All)', 'b']);
        });

        test("a set child's open list shows its new values when only its provided values change", async () => {
            const byName = ({ data }: { data: { name: string } }) => data.name;
            const setChild = (values: string[]) => ({
                filter: 'agSetColumnFilter',
                filterValueGetter: byName,
                filterParams: { values },
            });
            const api: GridApi = await gridsManager.createGridAndWait('grid1', {
                enableFilterHandlers,
                columnDefs: colDefsWith([TEXT_CHILD, setChild(['bob', 'alice'])]),
                rowData: ROWS,
            });
            const filter = await ColumnFilterHarness.open(api, 'name');
            expect(filter.setFilterItemLabels()).toEqual(['(Select All)', 'alice', 'bob']);

            api.setGridOption('columnDefs', colDefsWith([TEXT_CHILD, setChild(['michael', 'michelle'])]));
            await asyncSetTimeout(0);

            expect(filter.setFilterItemLabels()).toEqual(['(Select All)', 'michael', 'michelle']);
        });

        test("an object column's Multi Filter keeps a set child's model when only the header changes", async () => {
            const byName = ({ value }: { value: { name: string } }) => value.name;
            const objectCol = (headerName: string) => [
                {
                    field: 'person',
                    headerName,
                    cellDataType: 'object',
                    valueFormatter: byName,
                    filter: 'agMultiColumnFilter',
                    filterParams: { filters: [{ filter: 'agSetColumnFilter' }] },
                },
            ];
            const api: GridApi = await gridsManager.createGridAndWait('grid1', {
                enableFilterHandlers,
                columnDefs: objectCol('Person'),
                rowData: [{ person: { name: 'bob' } }, { person: { name: 'alice' } }],
            });
            const model = { filterType: 'multi', filterModels: [{ filterType: 'set', values: ['bob'] }] };
            await api.setColumnFilterModel('person', model);
            api.onFilterChanged();
            await asyncSetTimeout(0);
            expect(api.getDisplayedRowAtIndex(0)!.data.person.name).toBe('bob');
            expect(api.getDisplayedRowCount()).toBe(1);

            api.setGridOption('columnDefs', objectCol('Person renamed'));
            await asyncSetTimeout(0);

            expect(api.getColumnFilterModel('person')).toEqual(model);
            expect(api.getDisplayedRowCount()).toBe(1);
            expect(api.getDisplayedRowAtIndex(0)!.data.person.name).toBe('bob');
        });

        test("the column's new filter value getter, or new key creator, resets a Multi Filter with a set child", async () => {
            const setChild = {
                filter: 'agSetColumnFilter',
                filterParams: { valueFormatter: ({ value }: { value: string }) => value },
            };
            const col = (extra: ColDef) => colDefsWith([TEXT_CHILD, setChild], extra);
            const byName = ({ data }: { data: { name: string } }) => data.name;
            const asIs = ({ value }: { value: string }) => value;
            const api: GridApi = await gridsManager.createGridAndWait('grid1', {
                enableFilterHandlers,
                columnDefs: col({ filterValueGetter: byName, keyCreator: asIs }),
                rowData: ROWS,
            });
            const filterBobAndReset = async (update: ColDef, name: string) => {
                await api.setColumnFilterModel('name', {
                    filterType: 'multi',
                    filterModels: [null, { filterType: 'set', values: ['bob'] }],
                });
                api.onFilterChanged();
                await asyncSetTimeout(0);
                expect(api.getDisplayedRowCount()).toBe(1);
                api.setGridOption('columnDefs', col(update));
                await asyncSetTimeout(0);

                expect(api.getColumnFilterModel('name')).toBeNull();
                await new GridRows(api, name).check(`
                    ROOT id:ROOT_NODE_ID
                    ├── LEAF id:0 name:"michael"
                    ├── LEAF id:1 name:"michelle"
                    ├── LEAF id:2 name:"bob"
                    └── LEAF id:3 name:"alice"
                `);
            };

            // the default case folding keeps `bob` naming the upper case keys
            const upper = ({ value }: { value: string }) => value.toUpperCase();
            await filterBobAndReset({ filterValueGetter: byName, keyCreator: upper }, 'reset by the key creator');
            await filterBobAndReset(
                { filterValueGetter: ({ data }) => `${data.name}!`, keyCreator: upper },
                'reset by the getter'
            );
        });

        test('an unrelated colDef change leaves the child set and the model alone', async () => {
            const api: GridApi = await gridsManager.createGridAndWait('grid1', {
                enableFilterHandlers,
                columnDefs: colDefsWith([TEXT_CHILD, { filter: 'agSetColumnFilter' }]),
                rowData: ROWS,
            });

            await api.setColumnFilterModel('name', {
                filterType: 'multi',
                filterModels: [{ filterType: 'text', type: 'contains', filter: 'mich' }, null],
            });
            api.onFilterChanged();
            await asyncSetTimeout(0);

            // Same children, different headerName: nothing about the filter may be rebuilt or reset.
            api.setGridOption(
                'columnDefs',
                colDefsWith([TEXT_CHILD, { filter: 'agSetColumnFilter' }], { headerName: 'Renamed' })
            );
            await asyncSetTimeout(0);

            expect(api.getColumnFilterModel('name')).toEqual({
                filterType: 'multi',
                filterModels: [{ filterType: 'text', type: 'contains', filter: 'mich' }, null],
            });
            await new GridRows(api, 'unrelated colDef change keeps filtering').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 name:"michael"
                └── LEAF id:1 name:"michelle"
            `);
        });

        test('removing the first child does not hand its model to the survivor', async () => {
            const api: GridApi = await gridsManager.createGridAndWait('grid1', {
                enableFilterHandlers,
                columnDefs: colDefsWith([TEXT_CHILD, { filter: 'agSetColumnFilter' }]),
                rowData: ROWS,
            });

            await api.setColumnFilterModel('name', {
                filterType: 'multi',
                filterModels: [{ filterType: 'text', type: 'contains', filter: 'mich' }, null],
            });
            api.onFilterChanged();
            await asyncSetTimeout(0);

            // Drop the text child. The set child moves to index 0, where the text model sat.
            api.setGridOption('columnDefs', colDefsWith([{ filter: 'agSetColumnFilter' }]));
            await asyncSetTimeout(0);

            expect(await numChildFilters(api)).toBe(1);
            const model = api.getColumnFilterModel('name') as { filterModels?: unknown[] } | null;
            expect(model?.filterModels?.[0]).not.toEqual({ filterType: 'text', type: 'contains', filter: 'mich' });
            await new GridRows(api, 'first child removed leaves no stale filtering').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 name:"michael"
                ├── LEAF id:1 name:"michelle"
                ├── LEAF id:2 name:"bob"
                └── LEAF id:3 name:"alice"
            `);
        });

        test('the reopened popup agrees with the rows after a surviving child loses its model', async () => {
            const api: GridApi = await gridsManager.createGridAndWait('grid1', {
                enableFilterHandlers,
                columnDefs: colDefsWith([TEXT_CHILD, { filter: 'agSetColumnFilter' }]),
                rowData: ROWS,
            });

            // Open first, so the filter ui really exists before the col def changes.
            const filter = await ColumnFilterHarness.open(api, 'name');
            await filter.selectOperator('Contains', 0);
            await filter.setText('mich', 0);
            await asyncSetTimeout(0);
            api.hideColumnFilter();
            await new GridRows(api, 'text child filtering before the change').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 name:"michael"
                └── LEAF id:1 name:"michelle"
            `);

            // Swap the second child's type. The text child survives, but the model is reset.
            api.setGridOption('columnDefs', colDefsWith([TEXT_CHILD, { filter: 'agNumberColumnFilter' }]));
            await asyncSetTimeout(0);

            await new GridRows(api, 'model reset leaves every row visible').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 name:"michael"
                ├── LEAF id:1 name:"michelle"
                ├── LEAF id:2 name:"bob"
                └── LEAF id:3 name:"alice"
            `);

            // The popup must not claim a filter the grid has stopped applying.
            await ColumnFilterHarness.open(api, 'name');
            const textInput = document
                .querySelector('.ag-filter-menu')!
                .querySelector<HTMLInputElement>('.ag-filter-body input[type="text"]:not([disabled])');
            expect(textInput?.value ?? '').toBe('');
        });

        test('filter: true and the default filter name are the same child', async () => {
            const api: GridApi = await gridsManager.createGridAndWait('grid1', {
                enableFilterHandlers,
                columnDefs: colDefsWith([{ filter: true }, { filter: 'agSetColumnFilter' }]),
                rowData: ROWS,
            });

            await api.setColumnFilterModel('name', {
                filterType: 'multi',
                filterModels: [null, { filterType: 'set', values: ['bob'] }],
            });
            api.onFilterChanged();
            await asyncSetTimeout(0);

            // `true` means the default, which for a child is the text filter: naming it explicitly is
            // the same child, so nothing may be rebuilt and the model must survive.
            api.setGridOption(
                'columnDefs',
                colDefsWith([{ filter: 'agTextColumnFilter' }, { filter: 'agSetColumnFilter' }])
            );
            await asyncSetTimeout(0);

            expect(api.getColumnFilterModel('name')).toEqual({
                filterType: 'multi',
                filterModels: [null, { filterType: 'set', values: ['bob'] }],
            });
            await new GridRows(api, 'filter:true child survives being named').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:2 name:"bob"
            `);
        });

        test('an empty filters array falls back to the default children and still refreshes', async () => {
            const api: GridApi = await gridsManager.createGridAndWait('grid1', {
                enableFilterHandlers,
                columnDefs: colDefsWith([]),
                rowData: ROWS,
            });

            // Defaults are text + set, so the popup has both and nothing throws on refresh.
            expect(await numChildFilters(api)).toBe(2);
            api.setGridOption('columnDefs', colDefsWith([], { headerName: 'Renamed' }));
            await asyncSetTimeout(0);
            expect(await numChildFilters(api)).toBe(2);

            await ColumnFilterHarness.open(api, 'name');
            expect(setFilterList()).not.toBeNull();
        });

        test('the filters tool panel follows a removed child', async () => {
            const api: GridApi = await gridsManager.createGridAndWait('grid1', {
                enableFilterHandlers,
                columnDefs: colDefsWith([TEXT_CHILD, { filter: 'agSetColumnFilter' }]),
                rowData: ROWS,
                sideBar: FILTERS_SIDEBAR,
            });

            const panel = await openFiltersPanel(api);
            await panel.expandGroup('Name');
            expect(panel.isSetListShown('Name')).toBe(true);

            api.setGridOption('columnDefs', colDefsWith([TEXT_CHILD]));
            await asyncSetTimeout(0);

            await panel.expandGroup('Name');
            expect(panel.isSetListShown('Name')).toBe(false);
        });

        test('the floating filter follows a removed child', async () => {
            const api: GridApi = await gridsManager.createGridAndWait('grid1', {
                enableFilterHandlers,
                columnDefs: colDefsWith([TEXT_CHILD, { filter: 'agSetColumnFilter' }], { floatingFilter: true }),
                rowData: ROWS,
            });

            expect(floatingChildren()).toHaveLength(2);

            api.setGridOption('columnDefs', colDefsWith([TEXT_CHILD], { floatingFilter: true }));
            await asyncSetTimeout(0);

            expect(floatingChildren()).toHaveLength(1);
        });

        test('the child set keeps tracking columnDefs across repeated changes', async () => {
            const api: GridApi = await gridsManager.createGridAndWait('grid1', {
                enableFilterHandlers,
                columnDefs: colDefsWith([TEXT_CHILD, { filter: 'agSetColumnFilter' }]),
                rowData: ROWS,
            });

            api.setGridOption('columnDefs', colDefsWith([TEXT_CHILD]));
            await asyncSetTimeout(0);
            expect(await numChildFilters(api)).toBe(1);

            // The first change destroys the column filter, taking its colDefChanged listener with it;
            // a second change is what proves the listener came back.
            api.setGridOption('columnDefs', colDefsWith([TEXT_CHILD, { filter: 'agSetColumnFilter' }]));
            await asyncSetTimeout(0);
            expect(await numChildFilters(api)).toBe(2);

            api.setGridOption('columnDefs', colDefsWith([TEXT_CHILD, { filter: 'agNumberColumnFilter' }]));
            await asyncSetTimeout(0);
            expect(await numChildFilters(api)).toBe(2);

            await ColumnFilterHarness.open(api, 'name');
            expect(setFilterList()).toBeNull();
        });

        test('an added child appears in the popup and filters', async () => {
            const api: GridApi = await gridsManager.createGridAndWait('grid1', {
                enableFilterHandlers,
                columnDefs: colDefsWith([TEXT_CHILD]),
                rowData: ROWS,
            });

            await ColumnFilterHarness.open(api, 'name');
            expect(setFilterList()).toBeNull();
            api.hideColumnFilter();

            api.setGridOption('columnDefs', colDefsWith([TEXT_CHILD, { filter: 'agSetColumnFilter' }]));
            await asyncSetTimeout(0);

            expect(await numChildFilters(api)).toBe(2);

            const filter = await ColumnFilterHarness.open(api, 'name');
            expect(setFilterList()).not.toBeNull();

            await filter.toggleSetItem('michelle');
            await filter.toggleSetItem('alice');
            await filter.toggleSetItem('bob');
            await asyncSetTimeout(0);
            await new GridRows(api, 'added set child filters').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 name:"michael"
            `);
        });
    });
});
