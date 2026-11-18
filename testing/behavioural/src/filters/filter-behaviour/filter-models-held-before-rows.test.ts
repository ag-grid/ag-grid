import { waitFor } from '@testing-library/dom';
import {
    ALL_SEVERITIES,
    ColumnFilterHarness,
    FloatingFilterHarness,
    TestGridsManager,
    asyncSetTimeout,
    installFilterLayoutMock,
    uninstallFilterLayoutMock,
} from 'ag-test-utils';

import type {
    DoesFilterPassParams,
    FilterDisplayComp,
    FilterDisplayParams,
    GridApi,
    IDoesFilterPassParams,
    IFilterComp,
    IFilterParams,
} from 'ag-grid-community';
import {
    AgPromise,
    ClientSideRowModelModule,
    CustomFilterModule,
    GridStateModule,
    NumberFilterModule,
    TextFilterModule,
    enableDevValidations,
    setupAgTestIds,
} from 'ag-grid-community';
import {
    AdvancedFilterModule,
    GroupFilterModule,
    MultiFilterModule,
    NewFiltersToolPanelModule,
    RowGroupingModule,
    SetFilterModule,
} from 'ag-grid-enterprise';

import { AGE_LT_20, BASE_COLS, ROWS, RecordingFilter, timeline } from './filterModelsBeforeRowsHarness';

describe('filter models set before rows load, applied once they do', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, TextFilterModule, NumberFilterModule, CustomFilterModule, GridStateModule],
    });

    beforeEach(() => {
        enableDevValidations({ throwOn: ALL_SEVERITIES });
        timeline.phase = 'before';
    });
    afterEach(() => {
        gridsManager.reset();
        vi.restoreAllMocks();
    });

    test.each(
        ['before rows load', 'with rows'].flatMap((when) =>
            [false, true].map((enableFilterHandlers) => [when, enableFilterHandlers] as const)
        )
    )(
        'a custom filter whose init fires filterChangedCallback takes a model set %s (enableFilterHandlers %s), as with rows',
        async (when, enableFilterHandlers) => {
            class CallbackInInitFilter implements IFilterComp {
                private model: { value: string } | null = null;
                public init(params: IFilterParams): void {
                    params.filterChangedCallback();
                }
                public getGui(): HTMLElement {
                    return document.createElement('div');
                }
                public isFilterActive(): boolean {
                    return this.model != null;
                }
                public doesFilterPass(params: IDoesFilterPassParams): boolean {
                    return params.data.athlete.includes(this.model!.value);
                }
                public getModel() {
                    return this.model;
                }
                public setModel(model: { value: string } | null): void {
                    this.model = model;
                }
            }
            const filter = enableFilterHandlers
                ? {
                      component: CallbackInInitFilter,
                      doesFilterPass: ({
                          node,
                          model,
                      }: DoesFilterPassParams<{ athlete: string }, any, { value: string }>) =>
                          node.data!.athlete.includes(model.value),
                  }
                : CallbackInInitFilter;
            const api: GridApi = gridsManager.createGrid('grid1', {
                columnDefs: [{ field: 'athlete', filter }, BASE_COLS[1]],
                enableFilterHandlers,
                rowData: when === 'with rows' ? ROWS : undefined,
            });
            await asyncSetTimeout(0);
            // before rows the promise settles once they load
            const set = api.setColumnFilterModel('athlete', { value: 'Ian' });
            // a handler's filter component is built only when asked for, so its init fires after the model is set
            await api.getColumnFilterInstance('athlete');
            api.setGridOption('rowData', ROWS);
            await set;
            api.onFilterChanged();
            await asyncSetTimeout(0);
            expect({ model: api.getFilterModel(), rows: api.getDisplayedRowCount() }).toEqual({
                model: { athlete: { value: 'Ian' } },
                rows: 1,
            });
        }
    );

    test('a custom filter cleared by its own UI after a column model is set for it ends unfiltered', async () => {
        class ClearableFilter implements IFilterComp {
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
            public doesFilterPass(params: IDoesFilterPassParams): boolean {
                return params.data.athlete.includes(this.model!.value);
            }
            public getModel() {
                return this.model;
            }
            public setModel(model: { value: string } | null): void {
                this.model = model;
            }
            public clearFromUi(): void {
                this.model = null;
                this.params.filterChangedCallback();
            }
        }
        const api: GridApi = gridsManager.createGrid('grid1', {
            columnDefs: [{ field: 'athlete', filter: ClearableFilter }, BASE_COLS[1]],
            rowData: ROWS,
        });
        await asyncSetTimeout(0);
        const filter = (await api.getColumnFilterInstance<ClearableFilter>('athlete'))!;
        await api.setColumnFilterModel('athlete', { value: 'Ian' });
        api.onFilterChanged();
        filter.clearFromUi();
        api.setGridOption('rowData', ROWS);
        await asyncSetTimeout(0);
        expect({ model: api.getFilterModel(), rows: api.getDisplayedRowCount() }).toEqual({
            model: {},
            rows: ROWS.length,
        });
    });

    test.each(['before rows load', 'with rows'])(
        'with enableFilterHandlers, a model set %s after the filter UI changed its own while it is still being built wins, as with rows',
        async (when) => {
            let uiParams: FilterDisplayParams<any, any, { value: string }> | undefined;
            let finishInit: (() => void) | undefined;
            class SlowDisplay implements FilterDisplayComp<any, any, { value: string }> {
                public init(params: FilterDisplayParams<any, any, { value: string }>): AgPromise<void> {
                    uiParams = params;
                    return new AgPromise<void>((resolve) => {
                        finishInit = resolve;
                    });
                }
                public getGui(): HTMLElement {
                    return document.createElement('div');
                }
                public refresh(): boolean {
                    return true;
                }
            }
            const api: GridApi = gridsManager.createGrid('grid1', {
                columnDefs: [
                    {
                        field: 'athlete',
                        filter: {
                            component: SlowDisplay,
                            doesFilterPass: ({
                                node,
                                model,
                            }: DoesFilterPassParams<{ athlete: string }, any, { value: string }>) =>
                                node.data!.athlete.includes(model.value),
                        },
                    },
                    BASE_COLS[1],
                ],
                enableFilterHandlers: true,
                rowData: when === 'with rows' ? ROWS : undefined,
            });
            await asyncSetTimeout(0);
            void api.getColumnFilterInstance('athlete');
            await waitFor(() => expect(typeof uiParams?.onModelChange).toBe('function'));
            uiParams!.onModelChange({ value: 'Mic' });
            // before rows the promise settles once they load
            const set = api.setColumnFilterModel('athlete', { value: 'Ian' });
            finishInit!();
            await asyncSetTimeout(0);
            api.setGridOption('rowData', ROWS);
            await set;
            await asyncSetTimeout(0);
            expect({ model: api.getFilterModel(), rows: api.getDisplayedRowCount() }).toEqual({
                model: { athlete: { value: 'Ian' } },
                rows: 1,
            });
        }
    );

    test('a column model cleared before rows load for a column not there yet stays cleared once it comes', async () => {
        const api: GridApi = gridsManager.createGrid('grid1', { columnDefs: [BASE_COLS[0]] });
        await asyncSetTimeout(0);
        void api.setColumnFilterModel('age', AGE_LT_20);
        void api.setColumnFilterModel('age', null);
        api.setGridOption('columnDefs', BASE_COLS);
        await asyncSetTimeout(0);
        expect(api.getFilterModel()).toEqual({});

        api.setGridOption('rowData', ROWS);
        await asyncSetTimeout(0);
        expect(api.getDisplayedRowCount()).toBe(ROWS.length);
    });

    test.each(['column id', 'column'])(
        'a column model set by %s before rows load for a column that cannot filter yet applies once it can',
        async (keyForm) => {
            const mi = { filterType: 'text', type: 'contains', filter: 'Mi' };
            const api: GridApi = gridsManager.createGrid('grid1', {
                columnDefs: [{ field: 'athlete', filter: false }, BASE_COLS[1]],
            });
            await asyncSetTimeout(0);
            void api.setColumnFilterModel(keyForm === 'column' ? api.getColumn('athlete')! : 'athlete', mi);
            api.setGridOption('columnDefs', [{ field: 'athlete', filter: 'agTextColumnFilter' }, BASE_COLS[1]]);
            api.setGridOption('rowData', ROWS);
            await asyncSetTimeout(0);
            expect(api.getFilterModel()).toEqual({ athlete: mi });
            expect(api.getDisplayedRowCount()).toBe(2);
        }
    );

    test('a column model set before rows load for a grouped column that cannot filter shows on no group column, as with rows', async () => {
        const api: GridApi = gridsManager.createGrid(
            'grid1',
            {
                columnDefs: [
                    { field: 'country', rowGroup: true, hide: true, filter: false },
                    { field: 'age', rowGroup: true, hide: true, filter: 'agNumberColumnFilter' },
                    { field: 'athlete' },
                ],
                autoGroupColumnDef: { filter: 'agGroupColumnFilter' },
                groupDisplayType: 'singleColumn',
            },
            { modules: [RowGroupingModule, GroupFilterModule] }
        );
        await asyncSetTimeout(0);
        const rus = { filterType: 'text', type: 'contains', filter: 'Rus' };
        void api.setColumnFilterModel('country', rus);
        const seen = () => ({
            groupColumnActive: api.getColumn('ag-Grid-AutoColumn')!.isFilterActive(),
            model: api.getFilterModel(),
        });
        const unfiltered = { groupColumnActive: false, model: {} };
        expect(seen()).toEqual(unfiltered);

        api.setGridOption('rowData', ROWS);
        await asyncSetTimeout(0);
        expect(seen()).toEqual(unfiltered);
    });

    test('a grid destroyed while a custom filter takes a model set before rows as they load fires no filterChanged', async () => {
        timeline.customSetModelSeen = [];
        let finishSetModel: () => void = () => {};
        class SlowFilter extends RecordingFilter {
            public override setModel(model: any): Promise<void> {
                super.setModel(model);
                return new Promise((resolve) => {
                    finishSetModel = resolve;
                });
            }
        }
        const onFilterChanged = vi.fn();
        const api: GridApi = gridsManager.createGrid('grid1', {
            columnDefs: [{ field: 'athlete', filter: false }, BASE_COLS[1]],
            onFilterChanged,
        });
        await asyncSetTimeout(0);
        api.setFilterModel({ athlete: { value: 'Mi' } });
        void api.setColumnFilterModel('age', AGE_LT_20);
        api.setGridOption('columnDefs', [
            { field: 'athlete', filter: SlowFilter },
            { field: 'age', filter: false },
        ]);
        api.setGridOption('rowData', ROWS);
        expect(timeline.customSetModelSeen).toEqual([expect.stringMatching(/:\{"value":"Mi"\}$/)]);
        const firedBeforeDestroy = onFilterChanged.mock.calls.length;
        api.destroy();
        finishSetModel();
        await asyncSetTimeout(0);
        expect(onFilterChanged).toHaveBeenCalledTimes(firedBeforeDestroy);
    });

    test('a filterChanged listener setting a model while the models set before rows load apply has the last word, as with rows', async () => {
        const phelps = { filterType: 'text', type: 'contains', filter: 'Ph' };
        const api: GridApi = gridsManager.createGrid('grid1', { columnDefs: BASE_COLS });
        let reentered = false;
        api.addEventListener('filterChanged', (event) => {
            if (!reentered && event.source === 'api') {
                reentered = true;
                api.setFilterModel({ athlete: phelps });
            }
        });
        await asyncSetTimeout(0);
        api.setFilterModel({ athlete: { filterType: 'text', type: 'contains', filter: 'i' }, age: AGE_LT_20 });
        api.setFilterModel({ age: AGE_LT_20 });
        api.setGridOption('rowData', ROWS);
        await asyncSetTimeout(0);
        await asyncSetTimeout(0);
        expect({ model: api.getFilterModel(), rows: api.getDisplayedRowCount() }).toEqual({
            model: { athlete: phelps },
            rows: 1,
        });
    });

    test('an explicit filter fires filterChanged for a model it normalises before rows load once they do, kept through its column being re-added', async () => {
        const events: string[] = [];
        const ageCol = { field: 'age', filter: 'agNumberColumnFilter' };
        const api: GridApi = gridsManager.createGrid('grid1', {
            columnDefs: [BASE_COLS[0], ageCol],
            onFilterChanged: ({ source }) => events.push(`${timeline.phase}:${source}`),
        });
        await asyncSetTimeout(0);
        api.setFilterModel({ age: { type: 'lessThan', filter: 20 } });
        await asyncSetTimeout(0);
        expect(events).toEqual([]);

        api.setGridOption('columnDefs', [BASE_COLS[0]]);
        api.setGridOption('columnDefs', [BASE_COLS[0], ageCol]);
        await asyncSetTimeout(0);
        timeline.phase = 'after';
        api.setGridOption('rowData', ROWS);
        await asyncSetTimeout(0);
        expect(api.getFilterModel()).toEqual({ age: AGE_LT_20 });
        expect(api.getDisplayedRowCount()).toBe(2);
        // the column's removal fires nothing, as no filter was built; the model set before it fires once the rows load
        expect(events).toEqual(['after:columnFilter', 'after:api']);
    });
});

describe('filter models set before rows load are not lost before they apply', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, TextFilterModule, NumberFilterModule, CustomFilterModule, GridStateModule],
    });
    const IAN = { filterType: 'text', type: 'contains', filter: 'Ian' };

    beforeAll(() => {
        setupAgTestIds();
        installFilterLayoutMock();
    });
    afterAll(() => uninstallFilterLayoutMock());
    beforeEach(() => {
        enableDevValidations({ throwOn: ALL_SEVERITIES });
        timeline.phase = 'before';
    });
    afterEach(() => {
        gridsManager.reset();
        vi.restoreAllMocks();
    });

    test('with filter handlers, Apply on every filter before rows load keeps a model set for one whose type they decide', async () => {
        const api: GridApi = gridsManager.createGrid('grid1', {
            columnDefs: BASE_COLS,
            enableFilterHandlers: true,
            rowData: [],
        });
        await asyncSetTimeout(0);
        api.getColumnFilterHandler('age');
        api.setFilterModel({ age: AGE_LT_20 });
        api.doFilterAction({ action: 'apply' });
        await asyncSetTimeout(0);
        expect(api.getFilterModel()).toEqual({ age: AGE_LT_20 });

        api.setGridOption('rowData', ROWS);
        await asyncSetTimeout(0);
        expect(api.getDisplayedRowCount()).toBe(2);
    });

    test.each([undefined, 'athlete'])(
        'with filter handlers, Apply (colId %s) before rows load keeps an initial state model its filter is built with',
        async (colId) => {
            const api: GridApi = gridsManager.createGrid('grid1', {
                columnDefs: BASE_COLS,
                defaultColDef: { cellDataType: false },
                enableFilterHandlers: true,
                initialState: { filter: { filterModel: { athlete: IAN } } },
            });
            await asyncSetTimeout(0);
            api.doFilterAction({ action: 'apply', colId });
            await asyncSetTimeout(0);
            expect(api.getFilterModel()).toEqual({ athlete: IAN });

            api.setGridOption('rowData', ROWS);
            await asyncSetTimeout(0);
            expect(api.getDisplayedRowCount()).toBe(1);
        }
    );

    test.each([false, true])(
        'with enableFilterHandlers %s, removing a column whose filter is not built before rows load fires nothing, and the model set for it is kept for the column coming back',
        async (enableFilterHandlers) => {
            const events: string[] = [];
            const api: GridApi = gridsManager.createGrid('grid1', {
                columnDefs: BASE_COLS,
                enableFilterHandlers,
                onFilterChanged: ({ columns }) =>
                    events.push(
                        `${timeline.phase}:${columns.map((c) => c.getColId())}:${JSON.stringify(api.getFilterModel())}`
                    ),
            });
            await asyncSetTimeout(0);
            api.setFilterModel({ age: AGE_LT_20 });
            api.setGridOption('columnDefs', [BASE_COLS[0]]);
            await asyncSetTimeout(0);
            expect(events).toEqual([]);
            api.setGridOption('columnDefs', BASE_COLS);
            await asyncSetTimeout(0);
            expect(api.getFilterModel()).toEqual({ age: AGE_LT_20 });

            timeline.phase = 'after';
            api.setGridOption('rowData', ROWS);
            await asyncSetTimeout(0);
            expect(events).toEqual([`after:age:${JSON.stringify({ age: AGE_LT_20 })}`]);
            expect(api.getDisplayedRowCount()).toBe(2);
        }
    );

    test('with filter handlers, a model set before rows load on a handler refusing the definition its inferred type gives applies once they load', async () => {
        const events: string[] = [];
        const api: GridApi = gridsManager.createGrid('grid1', {
            columnDefs: [
                {
                    field: 'athlete',
                    filter: {
                        component: class {
                            public getGui(): HTMLElement {
                                return document.createElement('div');
                            }
                        },
                        handler: () => ({
                            doesFilterPass: ({
                                model,
                                data,
                            }: {
                                model: { filter: string };
                                data: { athlete: string };
                            }) => data.athlete.includes(model.filter),
                            refresh: () => false,
                        }),
                    },
                },
                BASE_COLS[1],
            ],
            enableFilterHandlers: true,
            onFilterChanged: (event) => events.push(`${timeline.phase}:${event.columns.map((c) => c.getColId())}`),
        });
        await asyncSetTimeout(0);
        api.setFilterModel({ athlete: { filter: 'Mi' } });
        await asyncSetTimeout(0);

        timeline.phase = 'after';
        api.setGridOption('rowData', ROWS);
        await asyncSetTimeout(0);
        expect(api.getFilterModel()).toEqual({ athlete: { filter: 'Mi' } });
        expect(api.getDisplayedRowCount()).toBe(2);
        expect(events).toEqual(['after:athlete']);
    });
});

describe('a Multi Filter whose children the rows decide, built before they load', () => {
    const gridsManager = new TestGridsManager({
        modules: [
            ClientSideRowModelModule,
            TextFilterModule,
            NumberFilterModule,
            SetFilterModule,
            MultiFilterModule,
            NewFiltersToolPanelModule,
        ],
    });

    beforeAll(() => {
        setupAgTestIds();
        installFilterLayoutMock();
    });
    afterAll(() => uninstallFilterLayoutMock());

    beforeEach(() => {
        enableDevValidations({ throwOn: ALL_SEVERITIES });
    });
    afterEach(() => {
        gridsManager.reset();
    });

    test.each([false, true])(
        'with enableFilterHandlers %s, a Selectable Filter choosing one applies a model set before rows load',
        async (enableFilterHandlers) => {
            const api: GridApi = gridsManager.createGrid('grid1', {
                columnDefs: [
                    {
                        field: 'age',
                        filter: 'agSelectableColumnFilter',
                        filterParams: { filters: [{ filter: 'agMultiColumnFilter' }] },
                    },
                    {
                        field: 'height',
                        filter: 'agSelectableColumnFilter',
                        filterParams: { filters: [{ filter: 'agMultiColumnFilter', filterParams: () => ({}) }] },
                    },
                ],
                rowData: [],
                enableFilterHandlers,
            });
            await asyncSetTimeout(0);
            const age = { filterType: 'multi', filterModels: [AGE_LT_20, null] };
            const height = {
                filterType: 'multi',
                filterModels: [{ filterType: 'number', type: 'lessThan', filter: 190 }, null],
            };
            api.setFilterModel({ age, height });
            await asyncSetTimeout(0);
            expect(api.getFilterModel()).toEqual({ age, height });

            api.setGridOption('rowData', ROWS);
            await asyncSetTimeout(0);
            expect(api.getFilterModel()).toEqual({ age, height });
            expect(api.getDisplayedRowCount()).toBe(1);
        }
    );
});

describe('a Selectable Filter whose choice the rows decide', () => {
    const gridsManager = new TestGridsManager({
        modules: [
            ClientSideRowModelModule,
            TextFilterModule,
            NumberFilterModule,
            GridStateModule,
            NewFiltersToolPanelModule,
        ],
    });

    beforeEach(() => {
        enableDevValidations({ throwOn: ALL_SEVERITIES });
    });
    afterEach(() => {
        gridsManager.reset();
    });

    test('applies a model set before rows load once they do, written `true` or left to its default choices', async () => {
        const api: GridApi = gridsManager.createGrid('grid1', {
            columnDefs: [
                BASE_COLS[0],
                {
                    field: 'age',
                    filter: 'agSelectableColumnFilter',
                    filterParams: { filters: [{ filter: true }, { filter: 'agTextColumnFilter' }] },
                },
                { field: 'height', filter: 'agSelectableColumnFilter', floatingFilter: true },
            ],
            enableFilterHandlers: true,
        });
        await asyncSetTimeout(0);
        api.getColumnFilterHandler('age');
        api.getColumnFilterHandler('height');
        const under190 = { filterType: 'number', type: 'lessThan', filter: 190 };
        api.setFilterModel({ age: AGE_LT_20, height: under190 });
        await asyncSetTimeout(0);
        expect(api.getFilterModel()).toEqual({ age: AGE_LT_20, height: under190 });

        api.setGridOption('rowData', ROWS);
        await asyncSetTimeout(0);
        expect(api.getFilterModel()).toEqual({ age: AGE_LT_20, height: under190 });
        expect(api.getDisplayedRowCount()).toBe(1);
    });
});

describe('a change before rows load to a filter that has not taken the model set for it', () => {
    const gridsManager = new TestGridsManager({
        modules: [
            ClientSideRowModelModule,
            TextFilterModule,
            NumberFilterModule,
            CustomFilterModule,
            GridStateModule,
            AdvancedFilterModule,
            NewFiltersToolPanelModule,
        ],
    });

    beforeAll(() => {
        setupAgTestIds();
        installFilterLayoutMock();
    });
    afterAll(() => uninstallFilterLayoutMock());
    beforeEach(() => {
        enableDevValidations({ throwOn: ALL_SEVERITIES });
        timeline.phase = 'before';
    });
    afterEach(() => {
        gridsManager.reset();
        vi.restoreAllMocks();
    });

    test('the promise of a column model set before rows load settles when the Advanced Filter is turned on first', async () => {
        const api: GridApi = gridsManager.createGrid('grid1', { columnDefs: BASE_COLS });
        await asyncSetTimeout(0);
        const applied = api.setColumnFilterModel('age', AGE_LT_20).then(() => 'settled');
        api.setGridOption('enableAdvancedFilter', true);
        expect(await Promise.race([applied, asyncSetTimeout(0).then(() => 'pending')])).toBe('settled');
        expect(api.getFilterModel()).toEqual({});
    });

    test.each([false, true])(
        'a floating filter shows an edit made in its popup before rows load, with filter handlers %s',
        async (enableFilterHandlers) => {
            const api: GridApi = gridsManager.createGrid('grid1', {
                columnDefs: [{ field: 'athlete', filter: true, floatingFilter: true, filterParams: { debounceMs: 0 } }],
                enableFilterHandlers,
            });
            await asyncSetTimeout(0);
            const popup = await ColumnFilterHarness.open(api, 'athlete', 'floatingFilter');
            await popup.setText('Thorpe');
            await waitFor(() => expect(FloatingFilterHarness.get(api, 'athlete').input().value).toBe('Thorpe'));
            expect(api.getFilterModel()).toEqual({
                athlete: { filterType: 'text', type: 'contains', filter: 'Thorpe' },
            });
        }
    );

    test.each([false, true])(
        'with filter handlers, a filter state restored before rows load is kept while its filter waits for its type, and once they give it (popup opened %s)',
        async (popupOpened) => {
            const filter = {
                filterModel: { athlete: { filterType: 'text', type: 'contains', filter: 'Mi' }, age: AGE_LT_20 },
                columnFilterState: { athlete: { restored: true }, age: { restored: true } },
            };
            const api: GridApi = gridsManager.createGrid('grid1', {
                columnDefs: [
                    { field: 'athlete', filter: true },
                    { field: 'age', filter: true },
                ],
                enableFilterHandlers: true,
                initialState: { filter },
            });
            await asyncSetTimeout(0);
            if (popupOpened) {
                await ColumnFilterHarness.open(api, 'age');
            }
            expect(api.getState().filter).toEqual(filter);
            api.setGridOption('rowData', ROWS);
            await asyncSetTimeout(0);
            expect(api.getState().filter).toEqual(filter);
        }
    );
});
