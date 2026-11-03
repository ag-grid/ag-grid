import { waitFor } from '@testing-library/dom';
import {
    ALL_SEVERITIES,
    ColumnFilterHarness,
    TestGridsManager,
    asyncSetTimeout,
    installFilterLayoutMock,
    uninstallFilterLayoutMock,
} from 'ag-test-utils';

import type {
    GridApi,
    GridOptions,
    IDoesFilterPassParams,
    IFilterComp,
    IFilterParams,
    IGetRowsParams,
    IServerSideGetRowsParams,
} from 'ag-grid-community';
import {
    AgPromise,
    ClientSideRowModelModule,
    CustomFilterModule,
    DateFilterModule,
    GridStateModule,
    InfiniteRowModelModule,
    NumberFilterModule,
    TextFilterModule,
    enableDevValidations,
    setupAgTestIds,
} from 'ag-grid-community';
import {
    AdvancedFilterModule,
    MultiFilterModule,
    ServerSideRowModelModule,
    SetFilterModule,
    TreeDataModule,
} from 'ag-grid-enterprise';

import { ROWS } from './filterModelsBeforeRowsHarness';

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

describe('filter models set before rows load, through the filter manager API', () => {
    const gridsManager = new TestGridsManager({
        modules: [
            TextFilterModule,
            NumberFilterModule,
            SetFilterModule,
            CustomFilterModule,
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

    test.each(['at creation', 'later'])(
        'an initial state model for the auto group column of a tree with no other columns applies, rows given %s',
        async (rowsGiven) => {
            const alpha = { filterType: 'text', type: 'contains', filter: 'Alpha' };
            const rows = [{ path: ['Alpha'] }, { path: ['Beta'] }, { path: ['Gamma'] }];
            const api: GridApi = gridsManager.createGrid(
                'grid1',
                {
                    columnDefs: [],
                    treeData: true,
                    getDataPath: (data: { path: string[] }) => data.path,
                    autoGroupColumnDef: { filter: 'agTextColumnFilter' },
                    rowData: rowsGiven === 'at creation' ? rows : undefined,
                    initialState: { filter: { filterModel: { 'ag-Grid-AutoColumn': alpha } } },
                },
                { modules: [TreeDataModule] }
            );
            await asyncSetTimeout(0);
            if (rowsGiven === 'later') {
                api.setGridOption('rowData', rows);
                await asyncSetTimeout(0);
            }
            expect({
                rows: api.getDisplayedRowCount(),
                model: api.getFilterModel(),
                state: api.getState().filter?.filterModel,
            }).toEqual({ rows: 1, model: { 'ag-Grid-AutoColumn': alpha }, state: { 'ag-Grid-AutoColumn': alpha } });

            const beta = { filterType: 'text', type: 'contains', filter: 'Beta' };
            api.setFilterModel({ 'ag-Grid-AutoColumn': beta });
            await asyncSetTimeout(0);
            expect({ rows: api.getDisplayedRowCount(), state: api.getState().filter?.filterModel }).toEqual({
                rows: 1,
                state: { 'ag-Grid-AutoColumn': beta },
            });
        }
    );

    test.each([false, true])(
        'with rows given at creation and inferred types %s, the initial filter state fires filterChanged as the rows are counted, after rowDataUpdated',
        async (inferred) => {
            const events: string[] = [];
            const record = (type: string) => () => events.push(type);
            gridsManager.createGrid('grid1', {
                columnDefs: threeFilterCols,
                defaultColDef: inferred ? {} : { cellDataType: false },
                rowData: PEOPLE,
                initialState: {
                    filter: { filterModel: { age: { filterType: 'number', type: 'lessThan', filter: 20 } } },
                },
                onGridReady: record('gridReady'),
                onFilterChanged: record('filterChanged'),
                onRowDataUpdated: record('rowDataUpdated'),
                onFirstDataRendered: record('firstDataRendered'),
            });
            await waitFor(() => expect(events).toContain('firstDataRendered'));
            expect(events).toEqual(['gridReady', 'rowDataUpdated', 'filterChanged', 'firstDataRendered']);
        }
    );

    test('with rows at creation, an initial state model reads back while its custom filter is still being built, which then filters by it', async () => {
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
            public doesFilterPass(params: IDoesFilterPassParams<Person>): boolean {
                return params.data.athlete.includes(this.model!.filter);
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
            rowData: PEOPLE,
            initialState: { filter: { filterModel: { athlete: { filter: 'Thorpe' } } } },
        });
        await asyncSetTimeout(0);
        const building = { model: api.getFilterModel(), state: api.getState().filter?.filterModel };
        finishInit();
        await asyncSetTimeout(0);
        expect({ building, built: api.getFilterModel(), rows: api.getDisplayedRowCount() }).toEqual({
            building: { model: { athlete: { filter: 'Thorpe' } }, state: { athlete: { filter: 'Thorpe' } } },
            built: { athlete: { filter: 'Thorpe' } },
            rows: 1,
        });
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
        api.applyTransaction({ add: PEOPLE });
        await asyncSetTimeout(0);
        const popup = await ColumnFilterHarness.open(api, 'score');
        expect(popup.inputs('number')).toEqual([]);
        expect(popup.input('text').value).toBe('1');
    });
});

describe('the initial filter state with the Infinite and Server-Side Row Models', () => {
    const gridsManager = new TestGridsManager({
        modules: [
            InfiniteRowModelModule,
            ServerSideRowModelModule,
            TextFilterModule,
            NumberFilterModule,
            GridStateModule,
        ],
    });
    beforeAll(() => {
        setupAgTestIds();
        installFilterLayoutMock();
    });
    afterAll(() => uninstallFilterLayoutMock());
    afterEach(() => gridsManager.reset());

    test.each(
        (['infinite', 'serverSide'] as const).flatMap((rowModelType) =>
            (['setFilterModel', 'setColumnFilterModel'] as const).map((entry) => [rowModelType, entry] as const)
        )
    )(
        'with the %s row model, a model set through %s before the datasource is given lands over the initial state',
        async (rowModelType, entry) => {
            const requests: unknown[] = [];
            const age = { filterType: 'number', type: 'lessThan', filter: 20 };
            const thorpe = { filterType: 'text', type: 'contains', filter: 'Thorpe' };
            const phelps = { filterType: 'text', type: 'contains', filter: 'Phelps' };
            const api = gridsManager.createGrid('grid1', {
                rowModelType,
                columnDefs: [
                    { field: 'athlete', filter: 'agTextColumnFilter' },
                    { field: 'age', filter: 'agNumberColumnFilter' },
                ],
                initialState: { filter: { filterModel: { athlete: thorpe, age } } },
            });
            await asyncSetTimeout(0);
            if (entry === 'setFilterModel') {
                api.setFilterModel({ athlete: phelps });
            } else {
                await api.setColumnFilterModel('athlete', phelps);
            }
            api.updateGridOptions(datasourceFor(rowModelType, ROWS, requests));
            await waitFor(() => expect(requests.length).toBeGreaterThan(0));
            await asyncSetTimeout(0);
            // as with rows, where the initial state applies at creation and a model set later lands over it
            const model = entry === 'setFilterModel' ? { athlete: phelps } : { athlete: phelps, age };
            expect({ model: api.getFilterModel(), lastRequest: requests.at(-1) }).toEqual({
                model,
                lastRequest: model,
            });
        }
    );

    test.each(['infinite', 'serverSide'] as const)(
        'with the %s row model, a column whose filter is built, removed and given back before the datasource still takes its initial model',
        async (rowModelType) => {
            const requests: unknown[] = [];
            const age = { filterType: 'number', type: 'lessThan', filter: 20 };
            const rows = ROWS.filter((row) => row.age < 20);
            const columnDefs = [
                { field: 'athlete' },
                { field: 'age', filter: 'agNumberColumnFilter', floatingFilter: true },
            ];
            const api = gridsManager.createGrid('grid1', {
                rowModelType,
                columnDefs,
                initialState: { filter: { filterModel: { age } } },
            });
            await asyncSetTimeout(0);
            await api.getColumnFilterInstance('age');
            api.setGridOption('columnDefs', [columnDefs[0]]);
            await asyncSetTimeout(0);
            api.setGridOption('columnDefs', columnDefs);
            await asyncSetTimeout(0);
            api.updateGridOptions(datasourceFor(rowModelType, rows, requests));
            await waitFor(() => expect(api.getDisplayedRowCount()).toBe(rows.length));
            expect({ model: api.getFilterModel(), lastRequest: requests.at(-1) }).toEqual({
                model: { age },
                lastRequest: { age },
            });
        }
    );

    test('with the Server-Side Row Model and the Advanced Filter turned on before the datasource, the initial column model does not apply', async () => {
        const requests: unknown[] = [];
        const age = { filterType: 'number', type: 'lessThan', filter: 20 };
        const api = gridsManager.createGrid(
            'grid1',
            {
                rowModelType: 'serverSide',
                columnDefs: [{ field: 'athlete' }, { field: 'age', filter: 'agNumberColumnFilter' }],
                initialState: { filter: { filterModel: { age } } },
            },
            { modules: [AdvancedFilterModule] }
        );
        await asyncSetTimeout(0);
        api.setGridOption('enableAdvancedFilter', true);
        await asyncSetTimeout(0);
        // the docs: column filters are disabled while the Advanced Filter is on
        expect(api.getFilterModel()).toEqual({});
        api.setGridOption('serverSideDatasource', {
            getRows: (params: IServerSideGetRowsParams) => {
                requests.push(params.request.filterModel);
                params.success({ rowData: ROWS, rowCount: ROWS.length });
            },
        });
        await waitFor(() => expect(api.getDisplayedRowCount()).toBe(ROWS.length));
        expect({ model: api.getFilterModel(), requests }).toEqual({ model: {}, requests: [null] });
    });

    test.each(
        (['infinite', 'serverSide'] as const).flatMap((rowModelType) =>
            [false, true].map((enableFilterHandlers) => [rowModelType, enableFilterHandlers] as const)
        )
    )(
        "with the %s row model and enableFilterHandlers %s, a filter built before the datasource is given shows the initial state and stays active through another column's change",
        async (rowModelType, enableFilterHandlers) => {
            const age = { filterType: 'number', type: 'lessThan', filter: 20 };
            const athlete = { filterType: 'text', type: 'contains', filter: 'Ian' };
            const api = gridsManager.createGrid('grid1', {
                rowModelType,
                enableFilterHandlers,
                columnDefs: [
                    { field: 'athlete', filter: 'agTextColumnFilter' },
                    { field: 'age', filter: 'agNumberColumnFilter' },
                ],
                initialState: { filter: { filterModel: { age } } },
            });
            await asyncSetTimeout(0);
            const agePopup = await ColumnFilterHarness.open(api, 'age');
            const popupInput = agePopup.input('number').value;
            api.hideColumnFilter();
            // the instance's own setModel: a change of the grid that does not apply the initial state first
            enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [286] });
            const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
            const athleteFilter = (await api.getColumnFilterInstance<IFilterComp>('athlete'))!;
            await athleteFilter.setModel(athlete);
            api.onFilterChanged();
            await asyncSetTimeout(0);
            expect(warnSpy.mock.calls.flat().join(' ')).toContain('warning #286');
            warnSpy.mockRestore();
            enableDevValidations({ throwOn: ALL_SEVERITIES });
            expect({
                popupInput,
                columnModel: api.getColumnFilterModel('age'),
                model: api.getFilterModel(),
                active: api.getColumn('age')!.isFilterActive(),
                present: api.isAnyFilterPresent(),
            }).toEqual({ popupInput: '20', columnModel: age, model: { age, athlete }, active: true, present: true });
        }
    );

    test.each(
        (['infinite', 'serverSide'] as const).flatMap((rowModelType) =>
            [false, true].flatMap((floatingFilter) =>
                [false, true].map(
                    (enableFilterHandlers) => [rowModelType, floatingFilter, enableFilterHandlers] as const
                )
            )
        )
    )(
        'with the %s row model, a datasource given at creation (floating filter %s, enableFilterHandlers %s) is asked for rows once, filtered by the initial state, which reads back before the rows are counted',
        async (rowModelType, floatingFilter, enableFilterHandlers) => {
            const requests: unknown[] = [];
            const rows = ROWS.filter((row) => row.age < 20);
            const age = { filterType: 'number', type: 'lessThan', filter: 20 };
            const api = gridsManager.createGrid('grid1', {
                rowModelType,
                enableFilterHandlers,
                columnDefs: [{ field: 'athlete' }, { field: 'age', filter: 'agNumberColumnFilter', floatingFilter }],
                initialState: { filter: { filterModel: { age } } },
                ...datasourceFor(rowModelType, rows, requests),
            });
            await asyncSetTimeout(0);
            const read = () => ({
                model: api.getFilterModel(),
                state: api.getState().filter,
                active: api.getColumn('age')!.isFilterActive(),
            });
            // the initial state applies once the datasource counts the rows; the indicator shows it before
            expect(read()).toEqual({
                model: { age },
                state: { filterModel: { age } },
                active: true,
            });
            await waitFor(() => expect(api.getDisplayedRowCount()).toBe(2));
            expect({ ...read(), requests }).toEqual({
                model: { age },
                state: { filterModel: { age } },
                active: true,
                requests: [{ age }],
            });
        }
    );

    test.each(['infinite', 'serverSide'] as const)(
        'with the %s row model and columns at creation, the initial state fires filterChanged once, before the first data render',
        async (rowModelType) => {
            const events: string[] = [];
            const record = (type: string) => () => events.push(type);
            const age = { filterType: 'number', type: 'lessThan', filter: 20 };
            const rows = ROWS.filter((row) => row.age < 20);
            gridsManager.createGrid('grid1', {
                rowModelType,
                columnDefs: [{ field: 'athlete' }, { field: 'age', filter: 'agNumberColumnFilter' }],
                initialState: { filter: { filterModel: { age } } },
                onGridReady: record('gridReady'),
                onFilterChanged: record('filterChanged'),
                onFirstDataRendered: record('firstDataRendered'),
                ...datasourceFor(rowModelType, rows, []),
            });
            await waitFor(() => expect(events).toContain('firstDataRendered'));
            await asyncSetTimeout(0);
            expect(events).toEqual(['gridReady', 'filterChanged', 'firstDataRendered']);
        }
    );
});

/** The row model's datasource option, answering each request with `rows` and recording the filter model it was asked for. */
function datasourceFor(rowModelType: 'infinite' | 'serverSide', rows: typeof ROWS, requests: unknown[]): GridOptions {
    return rowModelType === 'infinite'
        ? {
              datasource: {
                  getRows: (params: IGetRowsParams) => {
                      requests.push(params.filterModel);
                      params.successCallback(rows, rows.length);
                  },
              },
          }
        : {
              serverSideDatasource: {
                  getRows: (params: IServerSideGetRowsParams) => {
                      requests.push(params.request.filterModel);
                      params.success({ rowData: rows, rowCount: rows.length });
                  },
              },
          };
}

describe('the initial filter model without the Grid State module', () => {
    const gridsManager = new TestGridsManager({
        modules: [
            ClientSideRowModelModule,
            NumberFilterModule,
            TextFilterModule,
            CustomFilterModule,
            MultiFilterModule,
        ],
    });
    afterEach(() => {
        gridsManager.reset();
        vi.restoreAllMocks();
        enableDevValidations({ throwOn: ALL_SEVERITIES });
    });

    test('a column model set before rows load over the initial model of a Multi Filter still being built applies', async () => {
        // error #200 (initialState without its module) is this case's premise
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [200] });
        const pendingInits: (() => void)[] = [];
        class SlowChild implements IFilterComp {
            private readonly eGui = document.createElement('div');
            private model: { value: string } | null = null;
            private params!: IFilterParams;
            public init(params: IFilterParams): AgPromise<void> {
                this.params = params;
                return new AgPromise<void>((resolve) => pendingInits.push(resolve));
            }
            public getGui(): HTMLElement {
                return this.eGui;
            }
            public isFilterActive(): boolean {
                return this.model != null;
            }
            public getModel(): { value: string } | null {
                return this.model;
            }
            public setModel(model: { value: string } | null): void {
                this.model = model;
            }
            public doesFilterPass(params: IDoesFilterPassParams): boolean {
                return String(this.params.getValue(params.node)).startsWith(this.model!.value);
            }
        }
        const resolveInits = async () => {
            for (const resolve of pendingInits.splice(0)) {
                resolve();
            }
            await asyncSetTimeout(0);
        };
        const multi = (value: string) => ({ filterType: 'multi', filterModels: [{ value }] });
        const api: GridApi = gridsManager.createGrid('grid1', {
            columnDefs: [
                { field: 'athlete', filter: 'agMultiColumnFilter', filterParams: { filters: [{ filter: SlowChild }] } },
            ],
            initialState: { filter: { filterModel: { athlete: multi('Mi') } } },
        });
        await asyncSetTimeout(0);
        void api.getColumnFilterInstance('athlete');
        await asyncSetTimeout(0);
        void api.setColumnFilterModel('athlete', multi('Ian'));
        await resolveInits();
        api.setGridOption('rowData', PEOPLE);
        await asyncSetTimeout(0);
        await resolveInits();
        expect({ model: api.getFilterModel(), rows: api.getDisplayedRowCount() }).toEqual({
            model: { athlete: multi('Ian') },
            rows: 1,
        });
    });
});
