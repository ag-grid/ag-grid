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
    ColDef,
    GridApi,
    GridOptions,
    IDoesFilterPassParams,
    IFilterComp,
    IFilterParams,
    IFloatingFilterComp,
} from 'ag-grid-community';
import {
    AgPromise,
    ClientSideRowModelModule,
    CustomFilterModule,
    DateFilterModule,
    GridStateModule,
    NumberFilterModule,
    TextFilterModule,
    enableDevValidations,
    setupAgTestIds,
} from 'ag-grid-community';
import {
    AdvancedFilterModule,
    MultiFilterModule,
    NewFiltersToolPanelModule,
    SetFilterModule,
} from 'ag-grid-enterprise';

const ROWS = [
    { athlete: 'Michael Phelps', age: 23, country: 'United States', height: 193, date: '2008-08-24' },
    { athlete: 'Natalie Coughlin', age: 25, country: 'United States', height: 173, date: '2008-08-24' },
    { athlete: 'Aleksey Nemov', age: 24, country: 'Russia', height: 174, date: '2000-10-01' },
    { athlete: 'Missy Franklin', age: 17, country: 'United States', height: 185, date: '2012-08-12' },
    { athlete: 'Ian Thorpe', age: 17, country: 'Australia', height: 195, date: '2000-10-01' },
];

const AGE_LT_20 = { filterType: 'number', type: 'lessThan', filter: 20 };

let phase = 'before';
let customSetModelSeen: string[] = [];

class RecordingFilter implements IFilterComp {
    private model: any = null;
    private params!: IFilterParams;
    private readonly gui = document.createElement('div');
    public init(params: IFilterParams): void {
        this.params = params;
    }
    public getGui(): HTMLElement {
        return this.gui;
    }
    public isFilterActive(): boolean {
        return this.model != null;
    }
    public doesFilterPass(params: IDoesFilterPassParams): boolean {
        return params.data.athlete.includes(this.model.value);
    }
    public getModel(): any {
        return this.model;
    }
    public setModel(model: any): void {
        customSetModelSeen.push(`${phase}:rows=${this.params.api.getDisplayedRowCount()}:${JSON.stringify(model)}`);
        this.model = model;
    }
}

const BASE_COLS: ColDef[] = [
    { field: 'athlete', filter: true },
    { field: 'age', filter: true },
    { field: 'country', filter: true },
];

interface Scenario {
    name: string;
    /** What the grid reports and tells before and after rows load. */
    expected: Record<string, unknown>;
    /** A custom filter without a handler, which `enableFilterHandlers` does not take. */
    withoutHandlersOnly?: boolean;
    cols?: ColDef[];
    options?: GridOptions;
    beforeRows?: (api: GridApi, log: Record<string, unknown>) => void | Promise<void>;
    beforeRowsLate?: (api: GridApi) => void | Promise<void>;
    afterRows?: (api: GridApi, log: Record<string, unknown>) => void | Promise<void>;
    skipRows?: boolean;
}

const SCENARIOS: Scenario[] = [
    {
        name: 'S1 setFilterModel typed',
        expected: {
            modelBefore: { age: { filterType: 'number', type: 'lessThan', filter: 20 } },
            activeBefore: ['age'],
            events: ['after:api:[age]:rows=2'],
            warnings: [],
            modelAfter: { age: { filterType: 'number', type: 'lessThan', filter: 20 } },
            activeAfter: ['age'],
            displayedAfter: 2,
        },
        beforeRows: (api) => api.setFilterModel({ age: AGE_LT_20 }),
    },
    {
        name: 'S2 setColumnFilterModel then onFilterChanged',
        expected: {
            modelBefore: { age: { filterType: 'number', type: 'lessThan', filter: 20 } },
            activeBefore: ['age'],
            promise: 'after:rows=2',
            events: ['after:api:[]:rows=2'],
            warnings: [],
            modelAfter: { age: { filterType: 'number', type: 'lessThan', filter: 20 } },
            activeAfter: ['age'],
            displayedAfter: 2,
        },
        beforeRows: (api, log) => {
            void api.setColumnFilterModel('age', AGE_LT_20).then(() => {
                log.promise = `${phase}:rows=${api.getDisplayedRowCount()}`;
                api.onFilterChanged();
            });
        },
    },
    {
        name: 'S3 setFilterModel missing column added before rows',
        expected: {
            modelBefore: { height: { filterType: 'number', type: 'greaterThan', filter: 190 } },
            activeBefore: ['height'],
            events: ['after:api:[height]:rows=2'],
            warnings: [],
            modelAfter: { height: { filterType: 'number', type: 'greaterThan', filter: 190 } },
            activeAfter: ['height'],
            displayedAfter: 2,
        },
        beforeRows: (api) => api.setFilterModel({ height: { filterType: 'number', type: 'greaterThan', filter: 190 } }),
        beforeRowsLate: (api) => api.setGridOption('columnDefs', [...BASE_COLS, { field: 'height', filter: true }]),
    },
    {
        name: 'S3b setColumnFilterModel missing column added before rows',
        expected: {
            modelBefore: { height: { filterType: 'number', type: 'greaterThan', filter: 190 } },
            activeBefore: ['height'],
            promise: 'after',
            events: [],
            warnings: [],
            modelAfter: { height: { filterType: 'number', type: 'greaterThan', filter: 190 } },
            activeAfter: ['height'],
            displayedAfter: 2,
        },
        beforeRows: (api, log) => {
            void api
                .setColumnFilterModel('height', { filterType: 'number', type: 'greaterThan', filter: 190 })
                .then(() => {
                    log.promise = phase;
                });
        },
        beforeRowsLate: (api) => api.setGridOption('columnDefs', [...BASE_COLS, { field: 'height', filter: true }]),
    },
    {
        name: 'S4 missing column never added',
        expected: {
            modelBefore: {},
            activeBefore: [],
            events: [],
            warnings: ['after:62'],
            modelAfter: {},
            activeAfter: [],
            displayedAfter: 5,
        },
        beforeRows: (api) => api.setFilterModel({ ghost: AGE_LT_20 }),
    },
    {
        name: 'S5 not filterable, made filterable before rows',
        expected: {
            modelBefore: { age: { filterType: 'number', type: 'lessThan', filter: 20 } },
            activeBefore: ['age'],
            events: ['after:api:[age]:rows=2'],
            warnings: [],
            modelAfter: { age: { filterType: 'number', type: 'lessThan', filter: 20 } },
            activeAfter: ['age'],
            displayedAfter: 2,
        },
        cols: [BASE_COLS[0], { field: 'age', filter: false }, BASE_COLS[2]],
        beforeRows: (api) => api.setFilterModel({ age: AGE_LT_20 }),
        beforeRowsLate: (api) => api.setGridOption('columnDefs', BASE_COLS),
    },
    {
        name: 'S5b not filterable, stays so',
        expected: {
            modelBefore: {},
            activeBefore: [],
            events: [],
            warnings: ['after:63'],
            modelAfter: {},
            activeAfter: [],
            displayedAfter: 5,
        },
        cols: [BASE_COLS[0], { field: 'age', filter: false }, BASE_COLS[2]],
        beforeRows: (api) => api.setFilterModel({ age: AGE_LT_20 }),
    },
    {
        name: 'S6 custom filter setModel timing',
        withoutHandlersOnly: true,
        expected: {
            modelBefore: { athlete: { value: 'Mi' } },
            activeBefore: ['athlete'],
            events: ['after:api:[athlete]:rows=2'],
            warnings: [],
            customSetModel: ['before:rows=0:{"value":"Mi"}'],
            modelAfter: { athlete: { value: 'Mi' } },
            activeAfter: ['athlete'],
            displayedAfter: 2,
        },
        cols: [{ field: 'athlete', filter: RecordingFilter }, BASE_COLS[1]],
        beforeRows: (api) => api.setFilterModel({ athlete: { value: 'Mi' } }),
    },
    {
        name: 'S7a untyped number lessThan',
        expected: {
            modelBefore: { age: { type: 'lessThan', filter: 20 } },
            activeBefore: ['age'],
            events: ['after:columnFilter:[age]:rows=2', 'after:api:[age]:rows=2'],
            warnings: [],
            modelAfter: { age: { type: 'lessThan', filter: 20, filterType: 'number' } },
            activeAfter: ['age'],
            displayedAfter: 2,
        },
        beforeRows: (api) => api.setFilterModel({ age: { type: 'lessThan', filter: 20 } }),
    },
    {
        name: 'S7b untyped number equals',
        expected: {
            modelBefore: { age: { type: 'equals', filter: 17 } },
            activeBefore: ['age'],
            events: ['after:columnFilter:[age]:rows=2', 'after:api:[age]:rows=2'],
            warnings: [],
            modelAfter: { age: { type: 'equals', filter: 17, filterType: 'number' } },
            activeAfter: ['age'],
            displayedAfter: 2,
        },
        beforeRows: (api) => api.setFilterModel({ age: { type: 'equals', filter: 17 } }),
    },
    {
        name: 'S7c untyped text contains',
        expected: {
            modelBefore: { athlete: { type: 'contains', filter: 'Mi' } },
            activeBefore: ['athlete'],
            events: ['after:columnFilter:[athlete]:rows=2', 'after:api:[athlete]:rows=2'],
            warnings: [],
            modelAfter: { athlete: { type: 'contains', filter: 'Mi', filterType: 'text' } },
            activeAfter: ['athlete'],
            displayedAfter: 2,
        },
        beforeRows: (api) => api.setFilterModel({ athlete: { type: 'contains', filter: 'Mi' } }),
    },
    {
        name: 'S7d untyped date equals',
        expected: {
            modelBefore: { date: { type: 'equals', dateFrom: '2000-10-01' } },
            activeBefore: ['date'],
            events: ['after:columnFilter:[date]:rows=2', 'after:api:[date]:rows=2'],
            warnings: [],
            modelAfter: { date: { type: 'equals', dateFrom: '2000-10-01', filterType: 'date' } },
            activeAfter: ['date'],
            displayedAfter: 2,
        },
        cols: [...BASE_COLS, { field: 'date', filter: true }],
        beforeRows: (api) => api.setFilterModel({ date: { type: 'equals', dateFrom: '2000-10-01' } }),
    },
    {
        name: 'S7e untyped number as string',
        expected: {
            modelBefore: { age: { type: 'equals', filter: '17' } },
            activeBefore: ['age'],
            events: ['after:columnFilter:[age]:rows=0', 'after:api:[age]:rows=0'],
            warnings: [],
            modelAfter: { age: { type: 'equals', filter: '17', filterType: 'number' } },
            activeAfter: ['age'],
            displayedAfter: 0,
        },
        beforeRows: (api) => api.setFilterModel({ age: { type: 'equals', filter: '17' } }),
    },
    {
        name: 'S8 filterType mismatch text on number',
        expected: {
            modelBefore: { age: { filterType: 'text', type: 'contains', filter: '2' } },
            activeBefore: ['age'],
            events: ['after:columnFilter:[age]:rows=5'],
            warnings: [],
            modelAfter: {},
            activeAfter: [],
            displayedAfter: 5,
        },
        beforeRows: (api) => api.setFilterModel({ age: { filterType: 'text', type: 'contains', filter: '2' } }),
    },
    {
        name: 'S10 two setFilterModel calls',
        expected: {
            modelBefore: { athlete: { filterType: 'text', type: 'contains', filter: 'Mi' } },
            activeBefore: ['athlete'],
            events: ['after:api:[age]:rows=2', 'after:api:[age,athlete]:rows=2'],
            warnings: [],
            modelAfter: { athlete: { filterType: 'text', type: 'contains', filter: 'Mi' } },
            activeAfter: ['athlete'],
            displayedAfter: 2,
        },
        beforeRows: (api) => {
            api.setFilterModel({ age: AGE_LT_20 });
            api.setFilterModel({ athlete: { filterType: 'text', type: 'contains', filter: 'Mi' } });
        },
    },
    {
        name: 'S11 initialState, rowData unset',
        expected: {
            modelBefore: { age: { filterType: 'number', type: 'lessThan', filter: 20 } },
            activeBefore: ['age'],
            events: ['after:columnFilter:[age]:rows=2'],
            warnings: [],
            modelAfter: { age: { filterType: 'number', type: 'lessThan', filter: 20 } },
            activeAfter: ['age'],
            displayedAfter: 2,
        },
        options: { initialState: { filter: { filterModel: { age: AGE_LT_20 } } } },
    },
    {
        name: 'S11b initialState, rowData empty',
        expected: {
            modelBefore: { age: { filterType: 'number', type: 'lessThan', filter: 20 } },
            activeBefore: ['age'],
            events: ['after:columnFilter:[age]:rows=2'],
            warnings: [],
            modelAfter: { age: { filterType: 'number', type: 'lessThan', filter: 20 } },
            activeAfter: ['age'],
            displayedAfter: 2,
        },
        options: { rowData: [], initialState: { filter: { filterModel: { age: AGE_LT_20 } } } },
    },
    {
        name: 'S12 advanced filter set before rows',
        expected: {
            modelBefore: {},
            advBefore: { filterType: 'number', colId: 'age', type: 'lessThan', filter: 20 },
            activeBefore: [],
            events: ['after:api:[]:rows=2'],
            warnings: [],
            modelAfter: {},
            advAfter: { filterType: 'number', colId: 'age', type: 'lessThan', filter: 20 },
            activeAfter: [],
            displayedAfter: 2,
        },
        options: { enableAdvancedFilter: true },
        beforeRows: (api) =>
            api.setAdvancedFilterModel({ filterType: 'number', colId: 'age', type: 'lessThan', filter: 20 }),
    },
    {
        name: 'S12b advanced filter initialState',
        expected: {
            modelBefore: {},
            advBefore: { filterType: 'number', colId: 'age', type: 'lessThan', filter: 20 },
            activeBefore: [],
            events: ['after:advancedFilter:[]:rows=2'],
            warnings: [],
            modelAfter: {},
            advAfter: { filterType: 'number', colId: 'age', type: 'lessThan', filter: 20 },
            activeAfter: [],
            displayedAfter: 2,
        },
        options: {
            enableAdvancedFilter: true,
            initialState: {
                filter: { advancedFilterModel: { filterType: 'number', colId: 'age', type: 'lessThan', filter: 20 } },
            },
        },
    },
    {
        name: 'S13 set then cleared before rows',
        expected: {
            modelBefore: {},
            activeBefore: [],
            events: ['after:api:[age]:rows=5', 'after:api:[age]:rows=5'],
            warnings: [],
            modelAfter: {},
            activeAfter: [],
            displayedAfter: 5,
        },
        beforeRows: (api) => {
            api.setFilterModel({ age: AGE_LT_20 });
            api.setFilterModel(null);
        },
    },
    {
        name: 'S15 later change through the filter instance',
        expected: {
            modelBefore: {},
            activeBefore: [],
            events: ['before:columnFilter:[age]:rows=0', 'before:api:[]:rows=0', 'after:api:[age]:rows=5'],
            warnings: ['before:286'],
            modelAfter: {},
            activeAfter: [],
            displayedAfter: 5,
        },
        beforeRows: async (api) => {
            api.setFilterModel({ age: AGE_LT_20 });
            const instance = await api.getColumnFilterInstance<IFilterComp>('age');
            await instance!.setModel({ filterType: 'number', type: 'greaterThan', filter: 24 });
            api.onFilterChanged();
        },
    },
    {
        name: 'S16 column model then cleared',
        expected: {
            modelBefore: {},
            activeBefore: [],
            events: ['after:api:[athlete]:rows=5'],
            warnings: [],
            modelAfter: {},
            activeAfter: [],
            displayedAfter: 5,
        },
        beforeRows: (api) => {
            void api.setColumnFilterModel('athlete', { filterType: 'text', type: 'contains', filter: 'Mi' });
            api.setFilterModel(null);
        },
    },
    {
        name: 'S17 floating filter edit after setFilterModel',
        expected: {
            modelBefore: { athlete: { filterType: 'text', type: 'contains', filter: 'Mi' } },
            activeBefore: ['athlete'],
            events: ['before:columnFilter:[athlete]:rows=0', 'after:api:[athlete]:rows=2'],
            warnings: [],
            modelAfter: { athlete: { filterType: 'text', type: 'contains', filter: 'Mi' } },
            activeAfter: ['athlete'],
            displayedAfter: 2,
        },
        cols: [{ field: 'athlete', filter: true, filterParams: { debounceMs: 0 } }, BASE_COLS[1]],
        beforeRows: async (api) => {
            api.setFilterModel({ athlete: { filterType: 'text', type: 'contains', filter: 'Ian' } });
            await asyncSetTimeout(0);
            await FloatingFilterHarness.get(api, 'athlete').setValue('Mi');
        },
    },
    {
        name: 'S18 floating filter edit after setColumnFilterModel',
        expected: {
            modelBefore: { athlete: { filterType: 'text', type: 'contains', filter: 'Mi' } },
            activeBefore: ['athlete'],
            events: ['before:columnFilter:[athlete]:rows=0'],
            warnings: [],
            modelAfter: { athlete: { filterType: 'text', type: 'contains', filter: 'Mi' } },
            activeAfter: ['athlete'],
            displayedAfter: 2,
        },
        cols: [{ field: 'athlete', filter: true, filterParams: { debounceMs: 0 } }, BASE_COLS[1]],
        beforeRows: async (api) => {
            void api.setColumnFilterModel('athlete', { filterType: 'text', type: 'contains', filter: 'Ian' });
            await asyncSetTimeout(0);
            await FloatingFilterHarness.get(api, 'athlete').setValue('Mi');
        },
    },
    {
        name: 'S14 destroy before rows with pending column model',
        expected: { promise: 'pending', events: [], warnings: [] },
        skipRows: true,
        beforeRows: (api, log) => {
            log.promise = 'pending';
            void api.setColumnFilterModel('age', AGE_LT_20).then(() => {
                log.promise = phase;
            });
            phase = 'destroyed';
            api.destroy();
        },
    },
];

const SET_SCENARIOS: Scenario[] = [
    {
        name: 'S9 set filter from grid values',
        expected: {
            modelBefore: { country: { filterType: 'set', values: ['Russia'] } },
            activeBefore: ['country'],
            events: ['after:api:[country]:rows=1'],
            warnings: [],
            modelAfter: { country: { filterType: 'set', values: ['Russia'] } },
            activeAfter: ['country'],
            displayedAfter: 1,
        },
        cols: [BASE_COLS[0], { field: 'country', filter: 'agSetColumnFilter' }],
        beforeRows: (api) => api.setFilterModel({ country: { filterType: 'set', values: ['Russia'] } }),
    },
];

describe.each([
    [false, false],
    [true, false],
    [false, true],
    [true, true],
])(
    'filter models set before rows load, with enableFilterHandlers %s, and the Set Filter registered for its own scenarios only: %s',
    (enableFilterHandlers, withSet) => {
        const gridsManager = new TestGridsManager({
            modules: [
                ClientSideRowModelModule,
                TextFilterModule,
                NumberFilterModule,
                DateFilterModule,
                ...(withSet ? [SetFilterModule] : []),
                CustomFilterModule,
                GridStateModule,
                AdvancedFilterModule,
            ],
        });

        beforeEach(() => {
            enableDevValidations({ throwOn: [] });
            phase = 'before';
            customSetModelSeen = [];
        });
        afterEach(() => {
            gridsManager.reset();
            vi.restoreAllMocks();
        });

        const scenarios = (withSet ? SET_SCENARIOS : SCENARIOS).filter(
            (s) => !enableFilterHandlers || !s.withoutHandlersOnly
        );
        test.each(scenarios)('$name', async (scenario) => {
            const warnings: string[] = [];
            vi.spyOn(console, 'warn').mockImplementation((...args: any[]) => {
                const code = /#(\d+)/.exec(args.join(' '))?.[1] ?? args.join(' ').slice(0, 60);
                warnings.push(`${phase}:${code}`);
            });
            vi.spyOn(console, 'error').mockImplementation((...args: any[]) => {
                const code = /#(\d+)/.exec(args.join(' '))?.[1] ?? args.join(' ').slice(0, 60);
                warnings.push(`${phase}:error:${code}`);
            });
            const events: string[] = [];
            const log: Record<string, unknown> = {};
            const api: GridApi = gridsManager.createGrid('grid1', {
                columnDefs: scenario.cols ?? BASE_COLS,
                defaultColDef: { floatingFilter: true },
                enableFilterHandlers,
                ...scenario.options,
                onFilterChanged: ({ source, columns }) =>
                    events.push(
                        `${phase}:${source}:[${columns.map((c) => c.getColId()).join(',')}]:rows=${api.getDisplayedRowCount()}`
                    ),
            });
            await asyncSetTimeout(0);
            await scenario.beforeRows?.(api, log);
            await asyncSetTimeout(0);
            if (!api.isDestroyed()) {
                await scenario.beforeRowsLate?.(api);
                await asyncSetTimeout(0);
                log.modelBefore = api.getFilterModel();
                log.advBefore = scenario.options?.enableAdvancedFilter ? api.getAdvancedFilterModel() : undefined;
                log.activeBefore = (api.getColumns() ?? []).filter((c) => c.isFilterActive()).map((c) => c.getColId());
                log.presentBefore = api.isAnyFilterPresent();
                log.columnPresentBefore = api.isColumnFilterPresent();
                log.headerBefore = Array.from(document.querySelectorAll('.ag-header-cell-filtered')).map((e) =>
                    e.getAttribute('col-id')
                );
                if (!scenario.skipRows) {
                    phase = 'after';
                    api.setGridOption('rowData', ROWS);
                    await asyncSetTimeout(0);
                    await asyncSetTimeout(0);
                    await scenario.afterRows?.(api, log);
                    log.modelAfter = api.getFilterModel();
                    log.advAfter = scenario.options?.enableAdvancedFilter ? api.getAdvancedFilterModel() : undefined;
                    log.activeAfter = (api.getColumns() ?? [])
                        .filter((c) => c.isFilterActive())
                        .map((c) => c.getColId());
                    log.displayedAfter = api.getDisplayedRowCount();
                    log.headerAfter = Array.from(document.querySelectorAll('.ag-header-cell-filtered')).map((e) =>
                        e.getAttribute('col-id')
                    );
                }
            } else {
                await asyncSetTimeout(0);
            }
            log.events = events;
            log.warnings = warnings;
            if (customSetModelSeen.length) {
                log.customSetModel = customSetModelSeen;
            }
            const { headerBefore, headerAfter, presentBefore, columnPresentBefore, ...observed } = log;
            expect(headerBefore).toEqual(observed.activeBefore);
            expect(headerAfter).toEqual(observed.activeAfter);
            if (presentBefore !== undefined) {
                expect(presentBefore).toBe((observed.activeBefore as string[]).length > 0);
                expect(columnPresentBefore).toBe(presentBefore);
            }
            expect(JSON.parse(JSON.stringify(observed))).toEqual(scenario.expected);
        });
    }
);

describe('filter models held before rows load', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, TextFilterModule, NumberFilterModule, CustomFilterModule, GridStateModule],
    });

    beforeEach(() => {
        enableDevValidations({ throwOn: ALL_SEVERITIES });
        phase = 'before';
    });
    afterEach(() => {
        gridsManager.reset();
        vi.restoreAllMocks();
    });

    test('a null model for a column whose type the rows decide holds nothing and fires nothing', async () => {
        const onFilterChanged = vi.fn();
        const api: GridApi = gridsManager.createGrid('grid1', { columnDefs: BASE_COLS, onFilterChanged });
        await asyncSetTimeout(0);
        api.setFilterModel({ age: null });
        expect(api.getFilterModel()).toEqual({});
        expect(api.isAnyFilterPresent()).toBe(false);

        api.setGridOption('rowData', ROWS);
        await asyncSetTimeout(0);
        expect(onFilterChanged).not.toHaveBeenCalled();
        expect(api.getDisplayedRowCount()).toBe(ROWS.length);
    });

    test('a custom filter built for a column added before rows load starts from the model held for it', async () => {
        customSetModelSeen = [];
        const api: GridApi = gridsManager.createGrid('grid1', { columnDefs: [BASE_COLS[1]] });
        await asyncSetTimeout(0);
        api.setFilterModel({ athlete: { value: 'Mi' } });
        api.setGridOption('columnDefs', [{ field: 'athlete', filter: RecordingFilter }, BASE_COLS[1]]);
        await asyncSetTimeout(0);
        const filter = await api.getColumnFilterInstance<IFilterComp>('athlete');
        expect(filter!.getModel()).toEqual({ value: 'Mi' });
        expect(customSetModelSeen).toEqual(['before:rows=0:{"value":"Mi"}']);

        api.setGridOption('rowData', ROWS);
        await asyncSetTimeout(0);
        expect(customSetModelSeen).toHaveLength(1);
        expect(api.getDisplayedRowCount()).toBe(2);
    });

    test('a column model set before rows load for a column that never comes is dropped without a warning', async () => {
        const warnSpy = vi.spyOn(console, 'warn');
        const api: GridApi = gridsManager.createGrid('grid1', { columnDefs: BASE_COLS });
        await asyncSetTimeout(0);
        const applied = api.setColumnFilterModel('ghost', AGE_LT_20);
        api.setGridOption('rowData', ROWS);
        await expect(applied).resolves.toBeUndefined();
        expect(warnSpy).not.toHaveBeenCalled();
        expect(api.getFilterModel()).toEqual({});
    });

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

    test('with rows loaded, a column model for a column the grid lacks sets nothing', async () => {
        const api: GridApi = gridsManager.createGrid('grid1', { columnDefs: BASE_COLS, rowData: ROWS });
        await asyncSetTimeout(0);
        await api.setColumnFilterModel('ghost', AGE_LT_20);
        expect(api.getFilterModel()).toEqual({});
    });

    test('a grid destroyed while a custom filter takes a held model as rows load tells nothing', async () => {
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
        let settled = false;
        void api.setColumnFilterModel('age', AGE_LT_20).then(() => {
            settled = true;
        });
        api.setGridOption('columnDefs', [
            { field: 'athlete', filter: SlowFilter },
            { field: 'age', filter: false },
        ]);
        api.setGridOption('rowData', ROWS);
        api.destroy();
        finishSetModel();
        await asyncSetTimeout(0);
        expect(onFilterChanged).not.toHaveBeenCalled();
        expect(settled).toBe(false);
    });

    test('an explicit filter tells a model it normalises before rows load once they do, kept through its column being re-added', async () => {
        const events: string[] = [];
        const ageCol = { field: 'age', filter: 'agNumberColumnFilter' };
        const api: GridApi = gridsManager.createGrid('grid1', {
            columnDefs: [BASE_COLS[0], ageCol],
            onFilterChanged: ({ source }) => events.push(`${phase}:${source}`),
        });
        await asyncSetTimeout(0);
        api.setFilterModel({ age: { type: 'lessThan', filter: 20 } });
        await asyncSetTimeout(0);
        expect(events).toEqual([]);

        api.setGridOption('columnDefs', [BASE_COLS[0]]);
        api.setGridOption('columnDefs', [BASE_COLS[0], ageCol]);
        await asyncSetTimeout(0);
        phase = 'after';
        api.setGridOption('rowData', ROWS);
        await asyncSetTimeout(0);
        expect(api.getFilterModel()).toEqual({ age: AGE_LT_20 });
        expect(api.getDisplayedRowCount()).toBe(2);
        // the column's removal is told at once; the model it normalises only once the rows load
        expect(events).toEqual(['before:api', 'after:columnFilter', 'after:api']);
    });

    test('a component still being built when a whole model replaces the one held for it is given only the newer', async () => {
        customSetModelSeen = [];
        let finishInit: () => void = () => {};
        class SlowInitFilter extends RecordingFilter {
            public override init(params: IFilterParams): Promise<void> {
                super.init(params);
                return new Promise((resolve) => {
                    finishInit = resolve;
                });
            }
        }
        const api: GridApi = gridsManager.createGrid('grid1', { columnDefs: [BASE_COLS[1]] });
        await asyncSetTimeout(0);
        api.setFilterModel({ athlete: { value: 'Mi' } });
        api.setGridOption('columnDefs', [{ field: 'athlete', filter: SlowInitFilter }, BASE_COLS[1]]);
        await asyncSetTimeout(0);
        const built = api.getColumnFilterInstance('athlete');
        api.setFilterModel({ athlete: { value: 'Ian' } });
        finishInit();
        await built;
        await asyncSetTimeout(0);
        expect(customSetModelSeen).toEqual(['before:rows=0:{"value":"Ian"}']);
        expect(api.getFilterModel()).toEqual({ athlete: { value: 'Ian' } });
    });

    test('a floating filter created while its custom filter is being built before rows load shows the model set for it', async () => {
        let finishInit: () => void = () => {};
        class SlowInitFilter extends RecordingFilter {
            public override init(params: IFilterParams): Promise<void> {
                super.init(params);
                return new Promise((resolve) => {
                    finishInit = resolve;
                });
            }
        }
        const parentModels: unknown[] = [];
        class RecordingFloatingFilter implements IFloatingFilterComp {
            private readonly gui = document.createElement('div');
            public init(): void {}
            public getGui(): HTMLElement {
                return this.gui;
            }
            public onParentModelChanged(parentModel: unknown): void {
                parentModels.push(parentModel);
            }
        }
        const api: GridApi = gridsManager.createGrid('grid1', {
            columnDefs: [
                { field: 'athlete', filter: SlowInitFilter, floatingFilterComponent: RecordingFloatingFilter },
            ],
        });
        await asyncSetTimeout(0);
        const built = api.getColumnFilterInstance('athlete');
        api.setFilterModel({ athlete: { value: 'Mi' } });
        api.setGridOption('defaultColDef', { floatingFilter: true });
        await asyncSetTimeout(0);
        expect(parentModels).toEqual([{ value: 'Mi' }]);
        finishInit();
        await built;
    });

    test('destroying a filter not built before rows load clears the indicator of the model held for it', async () => {
        const api: GridApi = gridsManager.createGrid('grid1', { columnDefs: BASE_COLS });
        await asyncSetTimeout(0);
        api.setFilterModel({ age: AGE_LT_20 });
        await asyncSetTimeout(0);
        expect(api.getColumn('age')!.isFilterActive()).toBe(true);

        api.destroyFilter('age');
        expect(api.getColumn('age')!.isFilterActive()).toBe(false);
        expect(api.getFilterModel()).toEqual({});
    });

    test('without the grid state module, an initial state model is left for its filter once rows load', async () => {
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [200] });
        const stateless = new TestGridsManager({
            modules: [ClientSideRowModelModule, TextFilterModule, NumberFilterModule],
        });
        const api: GridApi = stateless.createGrid('grid1', {
            columnDefs: BASE_COLS,
            initialState: { filter: { filterModel: { age: AGE_LT_20 } } },
        });
        await asyncSetTimeout(0);
        void api.setColumnFilterModel('athlete', { filterType: 'text', type: 'contains', filter: 'Mi' });
        api.setGridOption('rowData', ROWS);
        await asyncSetTimeout(0);
        expect(api.getFilterModel()).toEqual({
            athlete: { filterType: 'text', type: 'contains', filter: 'Mi' },
            age: AGE_LT_20,
        });
        expect(api.getDisplayedRowCount()).toBe(2);
        stateless.reset();
    });
});

describe('filter models set before rows load, with the Set Filter as the default', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, TextFilterModule, NumberFilterModule, SetFilterModule],
    });

    beforeEach(() => enableDevValidations({ throwOn: ALL_SEVERITIES }));
    afterEach(() => {
        gridsManager.reset();
        vi.restoreAllMocks();
    });

    test.each([false, true])(
        'with enableFilterHandlers %s, the Set Filter that filter: true builds holds the model at once, its type not waiting for the rows',
        async (enableFilterHandlers) => {
            enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [285] });
            const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
            const russia = { filterType: 'set', values: ['Russia'] };
            const api: GridApi = gridsManager.createGrid('grid1', {
                columnDefs: [BASE_COLS[0], { field: 'country', filter: true }],
                enableFilterHandlers,
            });
            await asyncSetTimeout(0);
            api.setFilterModel({ country: russia });
            const filter = await api.getColumnFilterInstance<IFilterComp>('country');
            expect(filter!.getModel()).toEqual(russia);
            expect(warnSpy.mock.calls.flat().join(' ')).toContain('warning #285');

            api.setGridOption('rowData', ROWS);
            await asyncSetTimeout(0);
            expect(api.getDisplayedRowCount()).toBe(1);
        }
    );
});

describe('filter models held before rows load are not lost before they apply', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, TextFilterModule, NumberFilterModule, CustomFilterModule],
    });
    const IAN = { filterType: 'text', type: 'contains', filter: 'Ian' };

    beforeAll(() => {
        setupAgTestIds();
        installFilterLayoutMock();
    });
    afterAll(() => uninstallFilterLayoutMock());
    beforeEach(() => {
        enableDevValidations({ throwOn: ALL_SEVERITIES });
        phase = 'before';
    });
    afterEach(() => {
        gridsManager.reset();
        vi.restoreAllMocks();
    });

    test('with filter handlers, Apply on every filter before rows load keeps a model held for one whose type they decide', async () => {
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

    test('with filter handlers, Apply in the popup before rows load keeps a model held for a filter whose type they decide', async () => {
        const api: GridApi = gridsManager.createGrid('grid1', {
            columnDefs: [BASE_COLS[0], { field: 'age', filter: true, filterParams: { buttons: ['apply'] } }],
            enableFilterHandlers: true,
            rowData: [],
        });
        await asyncSetTimeout(0);
        api.setFilterModel({ age: AGE_LT_20 });
        const popup = await ColumnFilterHarness.open(api, 'age');
        await popup.apply();
        api.hideColumnFilter();
        expect(api.getFilterModel()).toEqual({ age: AGE_LT_20 });

        api.setGridOption('rowData', ROWS);
        await asyncSetTimeout(0);
        expect(api.getDisplayedRowCount()).toBe(2);
    });

    test('a custom filter rebuilt before rows load holds the model set for it, and a model then given to it wins', async () => {
        class RebuiltFilter extends RecordingFilter {
            public refresh(): boolean {
                return false;
            }
        }
        const api: GridApi = gridsManager.createGrid('grid1', {
            columnDefs: [{ field: 'athlete', filter: RebuiltFilter }, BASE_COLS[1]],
        });
        await asyncSetTimeout(0);
        await api.getColumnFilterInstance('athlete');
        api.setFilterModel({ athlete: { value: 'Mi' } });
        api.setGridOption('columnDefs', [
            { field: 'athlete', filter: RebuiltFilter, filterParams: { rebuilt: true } },
            BASE_COLS[1],
        ]);
        await asyncSetTimeout(0);
        const rebuilt = await api.getColumnFilterInstance<IFilterComp>('athlete');
        expect(rebuilt!.getModel()).toEqual({ value: 'Mi' });

        rebuilt!.setModel({ value: 'Ian' });
        api.setGridOption('rowData', ROWS);
        await asyncSetTimeout(0);
        expect(api.getFilterModel()).toEqual({ athlete: { value: 'Ian' } });
    });

    test.each([false, true])(
        'with enableFilterHandlers %s, a column model set after a floating filter edit before rows load wins once they do',
        async (enableFilterHandlers) => {
            const api: GridApi = gridsManager.createGrid('grid1', {
                columnDefs: [{ field: 'athlete', filter: true, filterParams: { debounceMs: 0 } }, BASE_COLS[1]],
                defaultColDef: { floatingFilter: true },
                enableFilterHandlers,
                rowData: [],
            });
            await asyncSetTimeout(0);
            await FloatingFilterHarness.get(api, 'athlete').setValue('Mi');
            const applied = api.setColumnFilterModel('athlete', IAN);
            await asyncSetTimeout(0);
            expect(api.getFilterModel()).toEqual({ athlete: IAN });
            expect(FloatingFilterHarness.get(api, 'athlete').input().value).not.toBe('Mi');

            api.setGridOption('rowData', ROWS);
            await applied;
            expect(api.getFilterModel()).toEqual({ athlete: IAN });
            expect(api.getDisplayedRowCount()).toBe(1);
        }
    );

    test('with filter handlers, the unapplied model of a built filter whose type the rows decide is the one set before they load', async () => {
        const api: GridApi = gridsManager.createGrid('grid1', { columnDefs: BASE_COLS, enableFilterHandlers: true });
        await asyncSetTimeout(0);
        api.getColumnFilterHandler('age');
        api.setFilterModel({ age: AGE_LT_20 });
        await asyncSetTimeout(0);
        expect(api.getColumnFilterModel('age', true)).toEqual(AGE_LT_20);
        expect(api.getColumn('age')!.isFilterActive()).toBe(true);
    });

    test.each([false, true])(
        'with enableFilterHandlers %s, removing a built filter before rows load tells it at once, and a model set for it is kept for the column coming back',
        async (enableFilterHandlers) => {
            const events: string[] = [];
            const api: GridApi = gridsManager.createGrid('grid1', {
                columnDefs: BASE_COLS,
                enableFilterHandlers,
                onFilterChanged: ({ columns }) =>
                    events.push(`${phase}:${columns.map((c) => c.getColId())}:${JSON.stringify(api.getFilterModel())}`),
            });
            await asyncSetTimeout(0);
            await api.getColumnFilterInstance('age');
            api.setFilterModel({ age: AGE_LT_20 });
            api.setGridOption('columnDefs', [BASE_COLS[0]]);
            await asyncSetTimeout(0);
            expect(events).toEqual(['before:age:{}']);
            api.setGridOption('columnDefs', BASE_COLS);
            await asyncSetTimeout(0);
            expect(api.getFilterModel()).toEqual({ age: AGE_LT_20 });

            phase = 'after';
            api.setGridOption('rowData', ROWS);
            await asyncSetTimeout(0);
            expect(events).toEqual(['before:age:{}', `after:age:${JSON.stringify({ age: AGE_LT_20 })}`]);
            expect(api.getDisplayedRowCount()).toBe(2);
        }
    );

    test('with filter handlers, the floating filter of a column removed and added again before rows load shows the model set for it', async () => {
        const ageCol: ColDef = { field: 'age', filter: 'agNumberColumnFilter', floatingFilter: true };
        const api: GridApi = gridsManager.createGrid('grid1', {
            columnDefs: [BASE_COLS[0], ageCol],
            enableFilterHandlers: true,
        });
        await asyncSetTimeout(0);
        api.setFilterModel({ age: AGE_LT_20 });
        api.setGridOption('columnDefs', [BASE_COLS[0]]);
        await asyncSetTimeout(0);
        api.setGridOption('columnDefs', [BASE_COLS[0], ageCol]);
        await asyncSetTimeout(0);
        expect(FloatingFilterHarness.get(api, 'age').input().value).toBe('20');
    });

    test('a custom filter throwing as it takes a model before rows load leaves later changes told as they happen', async () => {
        let changeModel: () => void = () => {};
        class ThrowOnceFilter extends RecordingFilter {
            private thrown = false;
            public override init(params: IFilterParams): void {
                super.init(params);
                changeModel = () => {
                    super.setModel({ value: 'Mi' });
                    params.filterChangedCallback();
                };
            }
            public override setModel(model: any): void {
                if (!this.thrown) {
                    this.thrown = true;
                    throw new Error('setModel failed');
                }
                super.setModel(model);
            }
        }
        const onFilterChanged = vi.fn();
        const api: GridApi = gridsManager.createGrid('grid1', {
            columnDefs: [{ field: 'athlete', filter: ThrowOnceFilter }, BASE_COLS[1]],
            onFilterChanged,
        });
        await asyncSetTimeout(0);
        await api.getColumnFilterInstance('athlete');
        expect(() => api.setFilterModel({ athlete: { value: 'Ian' } })).toThrow('setModel failed');
        api.setGridOption('rowData', ROWS);
        await asyncSetTimeout(0);
        onFilterChanged.mockClear();

        changeModel();
        await asyncSetTimeout(0);
        expect(onFilterChanged).toHaveBeenCalledTimes(1);
        expect(api.getDisplayedRowCount()).toBe(2);
    });

    test('setColumnFilterModel before rows load resolves once they load and its custom filter has taken the model', async () => {
        let finishSetModel: () => void = () => {};
        class SlowSetModelFilter extends RecordingFilter {
            public override setModel(model: any): Promise<void> {
                super.setModel(model);
                return new Promise((resolve) => {
                    finishSetModel = resolve;
                });
            }
        }
        const api: GridApi = gridsManager.createGrid('grid1', {
            columnDefs: [{ field: 'athlete', filter: SlowSetModelFilter }, BASE_COLS[1]],
        });
        await asyncSetTimeout(0);
        await api.getColumnFilterInstance('athlete');
        let settled = false;
        const applied = api.setColumnFilterModel('athlete', { value: 'Mi' }).then(() => {
            settled = true;
        });
        api.setGridOption('rowData', ROWS);
        await asyncSetTimeout(0);
        expect(settled).toBe(false);

        finishSetModel();
        await applied;
        api.onFilterChanged();
        expect(api.getDisplayedRowCount()).toBe(2);
    });

    test('a model set before rows load on a custom filter whose init finishes after they do filters them, told once', async () => {
        let finishInit: () => void = () => {};
        class SlowInitFilter extends RecordingFilter {
            public override init(params: IFilterParams): Promise<void> {
                super.init(params);
                return new Promise((resolve) => {
                    finishInit = resolve;
                });
            }
        }
        const onFilterChanged = vi.fn();
        const api: GridApi = gridsManager.createGrid('grid1', {
            columnDefs: [{ field: 'athlete', filter: SlowInitFilter }, { field: 'age' }],
            onFilterChanged,
        });
        await asyncSetTimeout(0);
        api.setFilterModel({ athlete: { value: 'Mi' } });
        api.setGridOption('rowData', ROWS);
        finishInit();
        await asyncSetTimeout(0);
        await asyncSetTimeout(0);
        expect(api.getFilterModel()).toEqual({ athlete: { value: 'Mi' } });
        expect(api.getDisplayedRowCount()).toBe(2);
        expect(onFilterChanged).toHaveBeenCalledTimes(1);
    });
});

describe('a Multi Filter whose children the rows decide, built before they load', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, TextFilterModule, NumberFilterModule, SetFilterModule, MultiFilterModule],
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

    test('an edit in it before rows load wins over a model set earlier', async () => {
        const multi = { filterType: 'multi', filterModels: [{ filterType: 'text', type: 'contains', filter: 'Mi' }] };
        const api: GridApi = gridsManager.createGrid('grid1', {
            columnDefs: [{ field: 'athlete', filter: 'agMultiColumnFilter' }, { field: 'age' }],
            rowData: [],
        });
        await asyncSetTimeout(0);
        api.setFilterModel({ athlete: multi });
        const popup = await ColumnFilterHarness.open(api, 'athlete');
        await popup.setText('Ian');
        await waitFor(() => expect(api.getFilterModel().athlete?.filterModels?.[0]?.filter).toBe('Ian'));
        api.hideColumnFilter();

        api.setGridOption('rowData', ROWS);
        await asyncSetTimeout(0);
        expect(api.getFilterModel().athlete.filterModels[0].filter).toBe('Ian');
        expect(api.getDisplayedRowCount()).toBe(1);
    });

    test('shows and applies a model set before rows load', async () => {
        const multi = { filterType: 'multi', filterModels: [{ filterType: 'text', type: 'contains', filter: 'Mi' }] };
        const api: GridApi = gridsManager.createGrid('grid1', {
            columnDefs: [{ field: 'athlete', filter: 'agMultiColumnFilter' }, { field: 'age' }],
            rowData: [],
        });
        await asyncSetTimeout(0);
        await api.getColumnFilterInstance('athlete');
        api.setFilterModel({ athlete: multi });
        await asyncSetTimeout(0);
        expect(api.getFilterModel()).toEqual({ athlete: multi });
        expect(api.getColumn('athlete')!.isFilterActive()).toBe(true);

        api.setGridOption('rowData', ROWS);
        await asyncSetTimeout(0);
        expect(api.getDisplayedRowCount()).toBe(2);
    });
});

describe('a Selectable Filter whose choice the rows decide', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, TextFilterModule, NumberFilterModule, NewFiltersToolPanelModule],
    });

    beforeEach(() => {
        enableDevValidations({ throwOn: ALL_SEVERITIES });
    });
    afterEach(() => {
        gridsManager.reset();
    });

    test('applies a model set before rows load once they do', async () => {
        const api: GridApi = gridsManager.createGrid('grid1', {
            columnDefs: [
                BASE_COLS[0],
                {
                    field: 'age',
                    filter: 'agSelectableColumnFilter',
                    filterParams: { filters: [{ filter: true }, { filter: 'agTextColumnFilter' }] },
                },
            ],
            enableFilterHandlers: true,
        });
        await asyncSetTimeout(0);
        api.getColumnFilterHandler('age');
        api.setFilterModel({ age: AGE_LT_20 });
        await asyncSetTimeout(0);
        expect(api.getFilterModel()).toEqual({ age: AGE_LT_20 });

        api.setGridOption('rowData', ROWS);
        await asyncSetTimeout(0);
        expect(api.getFilterModel()).toEqual({ age: AGE_LT_20 });
        expect(api.getDisplayedRowCount()).toBe(2);
    });
});

describe('column filter models in the initial state with the Advanced Filter enabled', () => {
    const gridsManager = new TestGridsManager({
        modules: [
            ClientSideRowModelModule,
            TextFilterModule,
            NumberFilterModule,
            GridStateModule,
            AdvancedFilterModule,
        ],
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('are not reported present, as the Advanced Filter replaces column filters', async () => {
        enableDevValidations({ throwOn: [] });
        const api: GridApi = gridsManager.createGrid('grid1', {
            columnDefs: BASE_COLS,
            rowData: ROWS,
            enableAdvancedFilter: true,
            initialState: { filter: { filterModel: { age: AGE_LT_20 } } },
        });
        await asyncSetTimeout(0);
        expect(api.isColumnFilterPresent()).toBe(false);
        expect(api.isAnyFilterPresent()).toBe(false);
        expect(api.getColumn('age')!.isFilterActive()).toBe(false);
    });
});

describe('a change before rows load to a filter holding none of the model set for it', () => {
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
        phase = 'before';
    });
    afterEach(() => {
        gridsManager.reset();
        vi.restoreAllMocks();
    });

    test('a custom filter still being built when its definition changes keeps the model set for it', async () => {
        let finishInit: () => void = () => {};
        class SlowFilter extends RecordingFilter {
            public override init(params: IFilterParams): AgPromise<void> {
                super.init(params);
                return new AgPromise<void>((resolve) => {
                    finishInit = resolve;
                });
            }
        }
        class OtherFilter extends RecordingFilter {}
        const api: GridApi = gridsManager.createGrid('grid1', {
            columnDefs: [{ field: 'athlete', filter: SlowFilter }, BASE_COLS[1]],
        });
        await asyncSetTimeout(0);
        void api.getColumnFilterInstance('athlete');
        api.setFilterModel({ athlete: { value: 'Ian' } });
        api.setGridOption('columnDefs', [{ field: 'athlete', filter: OtherFilter }, BASE_COLS[1]]);
        await asyncSetTimeout(0);
        finishInit();
        await asyncSetTimeout(0);
        expect(api.getFilterModel()).toEqual({ athlete: { value: 'Ian' } });

        api.setGridOption('rowData', ROWS);
        await asyncSetTimeout(0);
        expect(api.getFilterModel()).toEqual({ athlete: { value: 'Ian' } });
        expect(api.getDisplayedRowCount()).toBe(1);
    });

    test('clearing the floating filter of a filter whose type the rows decide drops the model set for it before they load', async () => {
        const api: GridApi = gridsManager.createGrid('grid1', {
            columnDefs: [
                { field: 'athlete', filter: true, filterParams: { debounceMs: 0 }, floatingFilter: true },
                BASE_COLS[1],
            ],
            rowData: [],
        });
        await asyncSetTimeout(0);
        api.setFilterModel({ athlete: { filterType: 'text', type: 'contains', filter: 'Ian' } });
        await asyncSetTimeout(0);
        const floating = FloatingFilterHarness.get(api, 'athlete');
        expect(floating.input().value).toBe('Ian');
        await floating.setValue('');
        await asyncSetTimeout(0);
        expect(api.getFilterModel()).toEqual({});
        expect(api.getColumn('athlete')!.isFilterActive()).toBe(false);

        api.setGridOption('rowData', ROWS);
        await asyncSetTimeout(0);
        expect(api.getDisplayedRowCount()).toBe(ROWS.length);
    });

    test('with filter handlers, a reset before rows load drops a model held for a filter whose type they decide', async () => {
        const api: GridApi = gridsManager.createGrid('grid1', {
            columnDefs: BASE_COLS,
            enableFilterHandlers: true,
            rowData: [],
        });
        await asyncSetTimeout(0);
        api.getColumnFilterHandler('age');
        api.getColumnFilterHandler('country');
        api.setFilterModel({ age: AGE_LT_20, country: { filterType: 'text', type: 'contains', filter: 'Rus' } });
        api.doFilterAction({ colId: 'age', action: 'reset' });
        await asyncSetTimeout(0);
        expect(Object.keys(api.getFilterModel())).toEqual(['country']);
        expect(api.getColumn('age')!.isFilterActive()).toBe(false);

        api.doFilterAction({ action: 'reset' });
        await asyncSetTimeout(0);
        expect(api.getFilterModel()).toEqual({});

        api.setGridOption('rowData', ROWS);
        await asyncSetTimeout(0);
        expect(api.getDisplayedRowCount()).toBe(ROWS.length);
    });

    test('without inferred types, the indicator of an initial state model goes with the model', async () => {
        const create = () =>
            gridsManager.createGrid('grid1', {
                columnDefs: BASE_COLS,
                defaultColDef: { cellDataType: false },
                initialState: {
                    filter: { filterModel: { athlete: { filterType: 'text', type: 'contains', filter: 'Ian' } } },
                },
            });
        let api: GridApi = create();
        await asyncSetTimeout(0);
        expect(api.getColumn('athlete')!.isFilterActive()).toBe(true);
        api.destroyFilter('athlete');
        await asyncSetTimeout(0);
        expect(api.getColumn('athlete')!.isFilterActive()).toBe(false);
        gridsManager.reset();

        api = create();
        await asyncSetTimeout(0);
        api.setGridOption('enableAdvancedFilter', true);
        await asyncSetTimeout(0);
        expect(api.getColumn('athlete')!.isFilterActive()).toBe(false);
    });

    test('an edit in a popup before rows load reaches the grid state', async () => {
        const api: GridApi = gridsManager.createGrid('grid1', {
            columnDefs: [{ field: 'athlete', filter: 'agTextColumnFilter' }, BASE_COLS[1]],
        });
        await asyncSetTimeout(0);
        api.setFilterModel({ athlete: { filterType: 'text', type: 'contains', filter: 'Ian' } });
        const popup = await ColumnFilterHarness.open(api, 'athlete');
        await popup.setText('Mi');
        await waitFor(() => expect(api.getFilterModel().athlete?.filter).toBe('Mi'));
        api.hideColumnFilter();
        expect(api.getState().filter?.filterModel?.athlete?.filter).toBe('Mi');
    });

    test('with filter handlers, a Selectable Filter switched before rows load from a choice whose type they decide starts empty', async () => {
        const api: GridApi = gridsManager.createGrid('grid1', {
            columnDefs: [
                BASE_COLS[0],
                {
                    field: 'age',
                    filter: 'agSelectableColumnFilter',
                    filterParams: { filters: [{ filter: true }, { filter: 'agNumberColumnFilter' }] },
                },
            ],
            enableFilterHandlers: true,
        });
        await asyncSetTimeout(0);
        api.getColumnFilterHandler('age');
        api.setFilterModel({ age: AGE_LT_20 });
        api.setState({ filter: { selectableFilters: { age: 1 } } });
        await asyncSetTimeout(0);
        expect(api.getFilterModel()).toEqual({});
        expect(api.getColumn('age')!.isFilterActive()).toBe(false);

        api.setGridOption('rowData', ROWS);
        await asyncSetTimeout(0);
        expect(api.getDisplayedRowCount()).toBe(ROWS.length);
    });

    test('destroying a built filter before rows load tells it at once, as with rows', async () => {
        const events: string[] = [];
        const api: GridApi = gridsManager.createGrid('grid1', {
            columnDefs: [{ field: 'athlete', filter: 'agTextColumnFilter' }, BASE_COLS[1]],
            onFilterChanged: ({ columns }) => events.push(`${phase}:${columns.map((c) => c.getColId())}`),
        });
        await asyncSetTimeout(0);
        const popup = await ColumnFilterHarness.open(api, 'athlete');
        await popup.setText('Mi');
        await waitFor(() => expect(events).toEqual(['before:athlete']));
        api.hideColumnFilter();
        api.setGridOption('columnDefs', [{ field: 'athlete', filter: false }, BASE_COLS[1]]);
        await asyncSetTimeout(0);
        expect(events).toEqual(['before:athlete', 'before:athlete']);

        phase = 'after';
        api.setGridOption('rowData', ROWS);
        await asyncSetTimeout(0);
        expect(events).toEqual(['before:athlete', 'before:athlete']);
    });

    test('a model cleared before rows load for a column not there yet is not told once they load', async () => {
        const events: string[] = [];
        const api: GridApi = gridsManager.createGrid('grid1', {
            columnDefs: [BASE_COLS[0]],
            onFilterChanged: ({ columns }) => events.push(columns.map((c) => c.getColId()).join()),
        });
        await asyncSetTimeout(0);
        api.setFilterModel({ athlete: { filterType: 'text', type: 'contains', filter: 'Ian' }, age: null });
        api.setGridOption('columnDefs', BASE_COLS);
        api.setGridOption('rowData', ROWS);
        await asyncSetTimeout(0);
        expect(events).toEqual(['athlete']);
    });

    test('a model set before rows load and then cleared for its column is told once they load', async () => {
        const events: string[] = [];
        const api: GridApi = gridsManager.createGrid('grid1', {
            columnDefs: [{ field: 'athlete', filter: 'agTextColumnFilter' }, BASE_COLS[1]],
            onFilterChanged: ({ columns }) => events.push(columns.map((c) => c.getColId()).join()),
        });
        await asyncSetTimeout(0);
        api.setFilterModel({ athlete: { filterType: 'text', type: 'contains', filter: 'Ian' } });
        void api.setColumnFilterModel('athlete', null);
        api.setGridOption('rowData', ROWS);
        await asyncSetTimeout(0);
        expect(events).toEqual(['athlete']);
        expect(api.getDisplayedRowCount()).toBe(ROWS.length);
    });

    test('a column without its filter built tells each model set for it before rows load', async () => {
        const api: GridApi = gridsManager.createGrid('grid1', { columnDefs: BASE_COLS });
        await asyncSetTimeout(0);
        const told: string[] = [];
        const age = api.getColumn('age')!;
        age.addEventListener('filterChanged', () => told.push(`${age.isFilterActive()}`));
        api.setFilterModel({ age: AGE_LT_20 });
        api.setFilterModel({ age: { filterType: 'number', type: 'lessThan', filter: 24 } });
        api.setFilterModel({});
        expect(told).toEqual(['true', 'true', 'false']);
    });

    test('with filter handlers, a built filter rejecting the model set before rows load tells only its own change', async () => {
        const events: string[] = [];
        const api: GridApi = gridsManager.createGrid('grid1', {
            columnDefs: BASE_COLS,
            enableFilterHandlers: true,
            onFilterChanged: ({ source, columns }) => events.push(`${source}:${columns.map((c) => c.getColId())}`),
        });
        await asyncSetTimeout(0);
        api.getColumnFilterHandler('age');
        api.setFilterModel({ age: { filterType: 'text', type: 'contains', filter: '2' } });
        api.setGridOption('rowData', ROWS);
        await asyncSetTimeout(0);
        expect(events).toEqual(['columnFilter:age']);
        expect(api.getFilterModel()).toEqual({});
    });

    test('with the Advanced Filter enabled, column models in the initial state are not read back', async () => {
        enableDevValidations({ throwOn: [] });
        const api: GridApi = gridsManager.createGrid('grid1', {
            columnDefs: BASE_COLS,
            rowData: ROWS,
            enableAdvancedFilter: true,
            initialState: { filter: { filterModel: { age: AGE_LT_20 } } },
        });
        await asyncSetTimeout(0);
        expect(api.getFilterModel()).toEqual({});
        expect(api.getColumnFilterModel('age')).toBeNull();
    });
});
