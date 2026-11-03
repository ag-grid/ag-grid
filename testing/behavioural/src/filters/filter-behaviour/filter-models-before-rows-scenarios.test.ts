import { waitFor } from '@testing-library/dom';
import {
    ColumnFilterHarness,
    FloatingFilterHarness,
    TestGridsManager,
    asyncSetTimeout,
    clickSelectOption,
    getSelectOptionLabels,
    installFilterLayoutMock,
    openPicker,
    uninstallFilterLayoutMock,
} from 'ag-test-utils';

import type { ColDef, GridApi, GridOptions, IFilterParams } from 'ag-grid-community';
import {
    AgPromise,
    ClientSideRowModelModule,
    CustomFilterModule,
    DateFilterModule,
    GridStateModule,
    NumberFilterModule,
    QuickFilterModule,
    TextFilterModule,
    enableDevValidations,
    getGridElement,
    setupAgTestIds,
} from 'ag-grid-community';
import { MultiFilterModule, NewFiltersToolPanelModule, SetFilterModule } from 'ag-grid-enterprise';

import { AGE_LT_20, BASE_COLS, ROWS, RecordingFilter, timeline } from './filterModelsBeforeRowsHarness';

interface Scenario {
    name: string;
    /** A custom filter without a handler, which `enableFilterHandlers` does not take. */
    withoutHandlersOnly?: boolean;
    /** A filter given as a handler, which needs `enableFilterHandlers`. */
    withHandlersOnly?: boolean;
    cols?: ColDef[];
    options?: GridOptions;
    beforeRows?: (api: GridApi, log: Record<string, unknown>) => void | Promise<void>;
    beforeRowsLate?: (api: GridApi) => void | Promise<void>;
    /** The calls destroy the grid before rows load, so there is no grid with rows to compare. */
    destroysGrid?: boolean;
    /** Why the grid ends otherwise than when the same calls are made with rows. */
    notAsWithRows?: string;
    /** Rows shown once the rows load, read off `ROWS` and the model, so a cell no grid filters cannot pass. */
    displayed?: number;
    /** Why the grid warns otherwise than when the same calls are made with rows. */
    warningsDiffer?: string;
}

/** A scenario whose readers are checked against stated values, not only against a grid with rows. */
interface ExpectedScenario extends Scenario {
    /** What the grid reports and the events it fires before and after rows load. */
    expected: Record<string, unknown>;
}

const WARNS_AS_ROWS_LOAD =
    'a model set before rows load applies as they load, warning then for a column gone or unable to filter';

const SCENARIOS: ExpectedScenario[] = [
    {
        name: 'setFilterModel missing column, then a whole model not naming it, column added before rows',
        notAsWithRows: 'a model for a column that cannot take it yet waits for the rows, which it can take by then',
        expected: {
            modelBefore: {},
            activeBefore: [],
            presentBefore: false,
            columnPresentBefore: false,
            events: ['after:api:[height]:rows=5', 'after:api:[height]:rows=5'],
            warnings: [],
            modelAfter: {},
            activeAfter: [],
            displayedAfter: 5,
        },
        beforeRows: (api) => {
            api.setFilterModel({ height: { filterType: 'number', type: 'greaterThan', filter: 190 } });
            api.setFilterModel({});
        },
        beforeRowsLate: (api) => api.setGridOption('columnDefs', [...BASE_COLS, { field: 'height', filter: true }]),
    },
    {
        name: 'missing column never added',
        expected: {
            modelBefore: {},
            activeBefore: [],
            presentBefore: false,
            columnPresentBefore: false,
            events: [],
            warnings: ['after:62'],
            modelAfter: {},
            activeAfter: [],
            displayedAfter: 5,
        },
        beforeRows: (api) => api.setFilterModel({ ghost: AGE_LT_20 }),
    },
    {
        name: 'not filterable, stays so',
        expected: {
            modelBefore: {},
            activeBefore: [],
            presentBefore: false,
            columnPresentBefore: false,
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
        name: 'set then cleared before rows',
        expected: {
            modelBefore: {},
            activeBefore: [],
            presentBefore: false,
            columnPresentBefore: false,
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
        name: 'column model then cleared',
        expected: {
            modelBefore: {},
            activeBefore: [],
            presentBefore: false,
            columnPresentBefore: false,
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
        name: 'setFilterModel to the model a floating filter edit gave',
        expected: {
            modelBefore: {
                athlete: {
                    filterType: 'text',
                    type: 'contains',
                    filter: 'Mi',
                },
            },
            activeBefore: ['athlete'],
            presentBefore: true,
            columnPresentBefore: true,
            events: ['before:columnFilter:[athlete]:rows=0'],
            warnings: [],
            modelAfter: {
                athlete: {
                    filterType: 'text',
                    type: 'contains',
                    filter: 'Mi',
                },
            },
            activeAfter: ['athlete'],
            displayedAfter: 2,
        },
        cols: [{ field: 'athlete', filter: true, filterParams: { debounceMs: 0 } }, BASE_COLS[1]],
        beforeRows: async (api) => {
            await FloatingFilterHarness.get(api, 'athlete').setValue('Mi');
            await asyncSetTimeout(0);
            api.setFilterModel({ athlete: { filterType: 'text', type: 'contains', filter: 'Mi' } });
        },
    },
    {
        name: 'destroy before rows with pending column model',
        expected: {
            promise: 'pending',
            events: [],
            warnings: [],
        },
        destroysGrid: true,
        beforeRows: (api, log) => {
            log.promise = 'pending';
            // the documented continuation, which must not reach a destroyed grid
            void api.setColumnFilterModel('age', AGE_LT_20).then(() => {
                log.promise = timeline.phase;
                api.onFilterChanged();
            });
            timeline.phase = 'destroyed';
            api.destroy();
        },
    },
];

describe.each([false, true])(
    'filter models set before rows load, with enableFilterHandlers %s',
    (enableFilterHandlers) => {
        const gridsManager = new TestGridsManager({
            modules: [
                ClientSideRowModelModule,
                TextFilterModule,
                NumberFilterModule,
                DateFilterModule,
                SetFilterModule,
                CustomFilterModule,
                GridStateModule,
                QuickFilterModule,
            ],
        });

        beforeEach(() => {
            enableDevValidations({ throwOn: [] });
            timeline.phase = 'before';
            timeline.customSetModelSeen = [];
        });
        afterEach(() => {
            gridsManager.reset();
            vi.restoreAllMocks();
        });

        const scenarios = SCENARIOS.filter((s) =>
            enableFilterHandlers ? !s.withoutHandlersOnly : !s.withHandlersOnly
        );
        test.each(scenarios)('$name', async (scenario) => {
            const warnings: string[] = [];
            vi.spyOn(console, 'warn').mockImplementation((...args: any[]) => {
                const code = /#(\d+)/.exec(args.join(' '))?.[1] ?? args.join(' ').slice(0, 60);
                warnings.push(`${timeline.phase}:${code}`);
            });
            vi.spyOn(console, 'error').mockImplementation((...args: any[]) => {
                const code = /#(\d+)/.exec(args.join(' '))?.[1] ?? args.join(' ').slice(0, 60);
                warnings.push(`${timeline.phase}:error:${code}`);
            });
            const events: string[] = [];
            const log: Record<string, unknown> = {};
            const api: GridApi = gridsManager.createGrid('grid1', {
                columnDefs: scenario.cols ?? BASE_COLS,
                defaultColDef: { floatingFilter: true },
                enableFilterHandlers,
                suppressSetFilterByDefault: true,
                ...scenario.options,
                onFilterChanged: ({ source, columns }) =>
                    events.push(
                        `${timeline.phase}:${source}:[${columns.map((c) => c.getColId()).join(',')}]:rows=${api.getDisplayedRowCount()}`
                    ),
            });
            await asyncSetTimeout(0);
            await scenario.beforeRows?.(api, log);
            await asyncSetTimeout(0);
            if (!api.isDestroyed()) {
                await scenario.beforeRowsLate?.(api);
                await asyncSetTimeout(0);
                log.modelBefore = api.getFilterModel();
                log.activeBefore = (api.getColumns() ?? []).filter((c) => c.isFilterActive()).map((c) => c.getColId());
                log.presentBefore = api.isAnyFilterPresent();
                log.columnPresentBefore = api.isColumnFilterPresent();
                const headerBefore = Array.from(getGridElement(api)!.querySelectorAll('.ag-header-cell-filtered')).map(
                    (e) => e.getAttribute('col-id')
                );
                expect(headerBefore).toEqual(log.activeBefore);
                timeline.phase = 'after';
                api.setGridOption('rowData', ROWS);
                await asyncSetTimeout(0);
                await asyncSetTimeout(0);
                log.modelAfter = api.getFilterModel();
                log.activeAfter = (api.getColumns() ?? []).filter((c) => c.isFilterActive()).map((c) => c.getColId());
                log.displayedAfter = api.getDisplayedRowCount();
                const headerAfter = Array.from(getGridElement(api)!.querySelectorAll('.ag-header-cell-filtered')).map(
                    (e) => e.getAttribute('col-id')
                );
                expect(headerAfter).toEqual(log.activeAfter);
            } else {
                await asyncSetTimeout(0);
            }
            log.events = events;
            log.warnings = warnings;
            if (timeline.customSetModelSeen.length) {
                log.customSetModel = timeline.customSetModelSeen;
            }
            expect(JSON.parse(JSON.stringify(log))).toEqual(scenario.expected);
        });
    }
);

/** A custom filter whose `init` finishes when `finishPendingInit` is called. */
let finishPendingInit: () => void = () => {};
class InitPendingFilter extends RecordingFilter {
    public override init(params: IFilterParams): AgPromise<void> {
        super.init(params);
        return new AgPromise<void>((resolve) => {
            finishPendingInit = resolve;
        });
    }
}
class RefusingRefreshFilter extends RecordingFilter {
    public refresh(): boolean {
        return false;
    }
}

/** Filters rebuilt by new column definitions, or shown in their popup, while a model set for them waits for the rows. */
const REBUILT_SCENARIOS: Scenario[] = [
    {
        name: 'a built custom filter refusing new params, rebuilt for the types the rows give',
        withoutHandlersOnly: true,
        cols: [{ field: 'athlete', filter: RefusingRefreshFilter }, BASE_COLS[1]],
        beforeRows: async (api) => {
            await api.getColumnFilterInstance('athlete');
            api.setFilterModel({ athlete: { value: 'Ian' } });
        },
    },
    {
        name: 'a Text Filter given new params',
        cols: [
            { field: 'athlete', filter: 'agTextColumnFilter' },
            { field: 'age', filter: 'agNumberColumnFilter' },
        ],
        beforeRows: (api) => {
            api.setFilterModel({ athlete: { filterType: 'text', type: 'contains', filter: 'Ian' } });
            api.setGridOption('columnDefs', [
                { field: 'athlete', filter: 'agTextColumnFilter', filterParams: { caseSensitive: true } },
                { field: 'age', filter: 'agNumberColumnFilter' },
            ]);
        },
    },
    ...[false, true].map((turnedOnAgain): Scenario => ({
        name: `a whole model, its Number Filter turned off${turnedOnAgain ? ' and on again' : ''}`,
        warningsDiffer: turnedOnAgain ? undefined : WARNS_AS_ROWS_LOAD,
        notAsWithRows: turnedOnAgain
            ? 'a model set before rows load applies as they load, to a column able to filter again by then'
            : undefined,
        cols: [
            { field: 'athlete', filter: 'agTextColumnFilter' },
            { field: 'age', filter: 'agNumberColumnFilter' },
        ],
        beforeRows: (api) => {
            api.setFilterModel({ age: AGE_LT_20 });
            api.setGridOption('columnDefs', [
                { field: 'athlete', filter: 'agTextColumnFilter' },
                { field: 'age', filter: false },
            ]);
            if (turnedOnAgain) {
                api.setGridOption('columnDefs', [
                    { field: 'athlete', filter: 'agTextColumnFilter' },
                    { field: 'age', filter: 'agNumberColumnFilter' },
                ]);
            }
        },
    })),
    {
        name: 'a whole model, its Number Filter swapped for a Text Filter',
        cols: [
            { field: 'athlete', filter: 'agTextColumnFilter' },
            { field: 'age', filter: 'agNumberColumnFilter' },
        ],
        beforeRows: (api) => {
            api.setFilterModel({ age: AGE_LT_20 });
            api.setGridOption('columnDefs', [
                { field: 'athlete', filter: 'agTextColumnFilter' },
                { field: 'age', filter: 'agTextColumnFilter' },
            ]);
        },
    },
    {
        name: 'a number model for a Selectable Filter whose default choice is the Set Filter',
        withHandlersOnly: true,
        cols: [BASE_COLS[0], { field: 'age', filter: 'agSelectableColumnFilter' }],
        options: { suppressSetFilterByDefault: false },
        beforeRows: (api) => api.setFilterModel({ age: AGE_LT_20 }),
    },
    {
        name: 'a Selectable Filter with its default choices switched from the Number to the Set Filter',
        withHandlersOnly: true,
        cols: [BASE_COLS[0], { field: 'age', filter: 'agSelectableColumnFilter' }],
        beforeRows: (api) => {
            api.setFilterModel({ age: AGE_LT_20 });
            api.setState({ filter: { selectableFilters: { age: 1 } } });
        },
    },
];

const NO_INFERRED_TYPES: ColDef = { floatingFilter: true, cellDataType: false };

/** Filters given an initial state, with types the rows do not decide, then changed in their UI before rows load. */
const INITIAL_STATE_SCENARIOS: Scenario[] = [
    {
        name: 'an initial state model, without inferred types',
        options: {
            defaultColDef: NO_INFERRED_TYPES,
            initialState: { filter: { filterModel: { age: AGE_LT_20 } } },
        },
    },
    {
        name: 'a Set Filter mini filter typed, without inferred types',
        cols: [BASE_COLS[0], { field: 'country', filter: 'agSetColumnFilter' }],
        options: { defaultColDef: NO_INFERRED_TYPES },
        beforeRows: async (api) => {
            await (await ColumnFilterHarness.open(api, 'country', 'floatingFilter')).miniFilterSearch('Ru');
        },
    },
    {
        name: 'a Selectable Filter switched in the filters tool panel, without inferred types',
        withHandlersOnly: true,
        cols: [
            BASE_COLS[0],
            {
                field: 'age',
                filter: 'agSelectableColumnFilter',
                filterParams: { filters: [{ filter: 'agNumberColumnFilter' }, { filter: 'agTextColumnFilter' }] },
            },
        ],
        options: {
            defaultColDef: NO_INFERRED_TYPES,
            sideBar: 'filters-new',
            initialState: {
                sideBar: {
                    visible: true,
                    position: 'right',
                    openToolPanel: 'filters-new',
                    toolPanels: { 'filters-new': { filters: [{ colId: 'age', expanded: true }] } },
                },
            },
        },
        beforeRows: async (api) => {
            const select = () => getGridElement(api)!.querySelector<HTMLElement>('.ag-filter-type-select');
            await waitFor(() => expect(select()).not.toBeNull());
            await openPicker(select()!);
            await clickSelectOption(getSelectOptionLabels()[1]);
        },
    },
    {
        name: 'a Selectable Filter with an initial choice switched in the filters tool panel, with inferred types',
        withHandlersOnly: true,
        cols: [
            BASE_COLS[0],
            {
                field: 'age',
                filter: 'agSelectableColumnFilter',
                filterParams: { filters: [{ filter: 'agNumberColumnFilter' }, { filter: 'agTextColumnFilter' }] },
            },
        ],
        options: {
            sideBar: 'filters-new',
            initialState: {
                filter: { selectableFilters: { age: 0 } },
                sideBar: {
                    visible: true,
                    position: 'right',
                    openToolPanel: 'filters-new',
                    toolPanels: { 'filters-new': { filters: [{ colId: 'age', expanded: true }] } },
                },
            },
        },
        beforeRows: async (api) => {
            const select = () => getGridElement(api)!.querySelector<HTMLElement>('.ag-filter-type-select');
            await waitFor(() => expect(select()).not.toBeNull());
            await openPicker(select()!);
            await clickSelectOption(getSelectOptionLabels()[1]);
        },
    },
];

/** Models set before rows load that wait for them, beside those in `filter-models-before-rows.test.ts`. */
const HELD_SCENARIOS: Scenario[] = [
    {
        name: 'a whole model for a filter whose type the rows decide, its column then removed',
        warningsDiffer: WARNS_AS_ROWS_LOAD,
        beforeRows: (api) => {
            api.setFilterModel({ age: AGE_LT_20 });
            api.setGridOption('columnDefs', [BASE_COLS[0], BASE_COLS[2]]);
        },
        displayed: ROWS.length,
    },
    {
        name: 'a whole model for a custom filter still being built, its column then removed',
        warningsDiffer: WARNS_AS_ROWS_LOAD,
        withoutHandlersOnly: true,
        cols: [BASE_COLS[0], { field: 'country', filter: InitPendingFilter }],
        beforeRows: (api) => {
            api.setFilterModel({ country: { value: 'Ian' } });
            api.setGridOption('columnDefs', [BASE_COLS[0]]);
        },
        beforeRowsLate: () => finishPendingInit(),
        displayed: ROWS.length,
    },
    {
        name: 'a whole model for a filter whose type the rows decide, then a Quick Filter',
        beforeRows: (api) => {
            api.setFilterModel({ age: AGE_LT_20 });
            api.setGridOption('quickFilterText', 'Ian');
        },
        displayed: 1,
    },
];

const AGE_MULTI = { filterType: 'multi', filterModels: [AGE_LT_20, null] };
const AGE_NUMBER_CHILD = { filterType: 'multi', filterModels: [AGE_LT_20] };
const NUMBER_CHILD = { filters: [{ filter: 'agNumberColumnFilter' }] };

/** Each form a column's filter can take, with a model it accepts once its type is known. */
const FILTER_FORMS: { form: string; col: ColDef; model: unknown }[] = [
    { form: 'true', col: { field: 'age', filter: true }, model: AGE_LT_20 },
    { form: 'number', col: { field: 'age', filter: 'agNumberColumnFilter' }, model: AGE_LT_20 },
    { form: 'set', col: { field: 'age', filter: 'agSetColumnFilter' }, model: { filterType: 'set', values: ['17'] } },
    { form: 'multi default', col: { field: 'age', filter: 'agMultiColumnFilter' }, model: AGE_MULTI },
    {
        form: 'multi explicit',
        col: { field: 'age', filter: 'agMultiColumnFilter', filterParams: NUMBER_CHILD },
        model: AGE_NUMBER_CHILD,
    },
    {
        form: 'multi function',
        col: { field: 'age', filter: 'agMultiColumnFilter', filterParams: () => NUMBER_CHILD },
        model: AGE_NUMBER_CHILD,
    },
    { form: 'selectable default', col: { field: 'age', filter: 'agSelectableColumnFilter' }, model: AGE_LT_20 },
    {
        form: 'selectable true',
        col: { field: 'age', filter: 'agSelectableColumnFilter', filterParams: { filters: [{ filter: true }] } },
        model: AGE_LT_20,
    },
    {
        form: 'selectable multi',
        col: {
            field: 'age',
            filter: 'agSelectableColumnFilter',
            filterParams: { filters: [{ filter: 'agMultiColumnFilter' }] },
        },
        model: AGE_MULTI,
    },
];

/** Each way to set a model, and each later change to it, made before rows load. */
const ENTRY_PATHS: {
    path: string;
    options?: (model: any) => GridOptions;
    beforeRows?: (api: GridApi, model: any) => void;
}[] = [
    { path: 'setFilterModel', beforeRows: (api, model) => api.setFilterModel({ age: model }) },
    {
        path: 'setColumnFilterModel',
        beforeRows: (api, model) => void api.setColumnFilterModel('age', model).then(() => api.onFilterChanged()),
    },
    {
        path: 'initialState',
        options: (model) => ({ initialState: { filter: { filterModel: { age: model } } } }),
    },
    { path: 'setState', beforeRows: (api, model) => api.setState({ filter: { filterModel: { age: model } } }) },
    {
        path: 'set twice',
        beforeRows: (api, model) => {
            api.setFilterModel({ age: model });
            api.setFilterModel({ age: model });
        },
    },
    {
        path: 'set then column cleared',
        beforeRows: (api, model) => {
            api.setFilterModel({ age: model, athlete: { filterType: 'text', type: 'contains', filter: 'i' } });
            void api.setColumnFilterModel('age', null).then(() => api.onFilterChanged());
        },
    },
    {
        path: 'column set twice',
        beforeRows: (api, model) => {
            void api.setColumnFilterModel('age', model);
            void api.setColumnFilterModel('age', model).then(() => api.onFilterChanged());
        },
    },
    {
        path: 'set then onFilterChanged',
        beforeRows: (api, model) => {
            api.setFilterModel({ age: model });
            api.onFilterChanged();
        },
    },
    {
        path: 'set then Apply',
        beforeRows: (api, model) => {
            api.setFilterModel({ age: model });
            api.doFilterAction({ action: 'apply' });
        },
    },
];

/** Each leaf where `actual` differs from `expected`, as `path: actual ≠ expected`. */
const differences = (actual: unknown, expected: unknown, path = ''): string[] => {
    if (JSON.stringify(actual) === JSON.stringify(expected)) {
        return [];
    }
    const isRecord = (value: unknown): value is Record<string, unknown> =>
        typeof value === 'object' && value !== null && !Array.isArray(value);
    if (isRecord(actual) && isRecord(expected)) {
        const keys = new Set([...Object.keys(actual), ...Object.keys(expected)]);
        return [...keys].flatMap((key) => differences(actual[key], expected[key], path ? `${path}.${key}` : key));
    }
    return [`${path}: ${JSON.stringify(actual)} ≠ ${JSON.stringify(expected)}`];
};

/** What every reader of a grid's filters reports. */
const observeFilters = (api: GridApi) => {
    const gridDiv = getGridElement(api) as HTMLElement;
    const columns = api.getColumns() ?? [];
    return {
        model: api.getFilterModel(),
        active: columns.filter((c) => c.isFilterActive()).map((c) => c.getColId()),
        header: Array.from(gridDiv.querySelectorAll('.ag-header-cell-filtered')).map((e) => e.getAttribute('col-id')),
        present: api.isAnyFilterPresent(),
        state: api.getState().filter ?? null,
        displayed: api.getDisplayedRowCount(),
        floating: Array.from(gridDiv.querySelectorAll('.ag-header-cell.ag-floating-filter[col-id]')).map(
            (cell) =>
                `${cell.getAttribute('col-id')}=${Array.from(cell.querySelectorAll('input'))
                    .filter((input) => !input.closest('.ag-hidden'))
                    .map((input) => input.value)
                    .join('|')}`
        ),
    };
};

describe.each([false, true])(
    'filter models set before rows load end as when set with rows, with enableFilterHandlers %s',
    (enableFilterHandlers) => {
        const gridsManager = new TestGridsManager({
            modules: [
                ClientSideRowModelModule,
                TextFilterModule,
                NumberFilterModule,
                DateFilterModule,
                SetFilterModule,
                MultiFilterModule,
                CustomFilterModule,
                GridStateModule,
                NewFiltersToolPanelModule,
                QuickFilterModule,
            ],
        });

        beforeAll(() => {
            setupAgTestIds();
            installFilterLayoutMock();
        });
        afterAll(() => uninstallFilterLayoutMock());
        beforeEach(() => {
            enableDevValidations({ throwOn: [] });
        });
        afterEach(() => {
            gridsManager.reset();
            vi.restoreAllMocks();
        });

        /** The calls made on a grid given its rows first, or before they load and then loaded. */
        const run = async (scenario: Scenario, withRows: boolean) => {
            timeline.phase = 'before';
            timeline.customSetModelSeen = [];
            const warnings: string[] = [];
            const report = (...args: any[]) => warnings.push(/#(\d+)/.exec(args.join(' '))?.[1] ?? args.join(' '));
            const warn = vi.spyOn(console, 'warn').mockImplementation(report);
            const error = vi.spyOn(console, 'error').mockImplementation(report);
            const api: GridApi = gridsManager.createGrid(withRows ? 'withRows' : 'withoutRows', {
                columnDefs: scenario.cols ?? BASE_COLS,
                defaultColDef: { floatingFilter: true },
                enableFilterHandlers,
                suppressSetFilterByDefault: true,
                ...scenario.options,
                ...(withRows ? { rowData: ROWS } : {}),
            });
            await asyncSetTimeout(0);
            await scenario.beforeRows?.(api, {});
            await asyncSetTimeout(0);
            await scenario.beforeRowsLate?.(api);
            await asyncSetTimeout(0);
            timeline.phase = 'after';
            api.setGridOption('rowData', ROWS);
            await asyncSetTimeout(0);
            await asyncSetTimeout(0);
            const settled = observeFilters(api);
            // also clears the warnings already given, which the other grid must give again
            gridsManager.reset();
            warn.mockRestore();
            error.mockRestore();
            return JSON.parse(JSON.stringify({ settled, warnings }));
        };

        // each form through setFilterModel, and each entry path on the form whose type the rows decide
        const formScenarios: Scenario[] = [];
        for (const { form, col, model } of FILTER_FORMS) {
            for (const { path, options, beforeRows } of ENTRY_PATHS) {
                if (form === 'true' || path === 'setFilterModel') {
                    formScenarios.push({
                        name: `${form} × ${path}`,
                        cols: [{ field: 'athlete', filter: 'agTextColumnFilter' }, col],
                        options: options?.(model),
                        beforeRows: beforeRows && ((api) => beforeRows(api, model)),
                    });
                }
            }
        }
        const scenarios = [
            ...SCENARIOS,
            ...REBUILT_SCENARIOS,
            ...INITIAL_STATE_SCENARIOS,
            ...HELD_SCENARIOS,
            ...formScenarios,
        ].filter(
            (s) =>
                !s.destroysGrid &&
                !s.notAsWithRows &&
                (enableFilterHandlers ? !s.withoutHandlersOnly : !s.withHandlersOnly)
        );
        test.each(scenarios)('$name', async (scenario) => {
            const withRows = await run(scenario, true);
            const withoutRows = await run(scenario, false);
            if (scenario.warningsDiffer) {
                withoutRows.warnings = withRows.warnings;
            }
            expect(differences(withoutRows, withRows)).toEqual([]);
            if (scenario.displayed !== undefined) {
                expect(withRows.settled.displayed).toBe(scenario.displayed);
            }
        });
    }
);
