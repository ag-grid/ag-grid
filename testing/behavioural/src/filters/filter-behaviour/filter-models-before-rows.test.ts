import {
    ALL_SEVERITIES,
    ColumnFilterHarness,
    TestGridsManager,
    asyncSetTimeout,
    installFilterLayoutMock,
    uninstallFilterLayoutMock,
} from 'ag-test-utils';

import type {
    ColDef,
    GridApi,
    IDoesFilterPassParams,
    IFilterComp,
    IFilterParams,
    SetFilterHandler,
} from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    CustomFilterModule,
    GridStateModule,
    NumberFilterModule,
    TextFilterModule,
    enableDevValidations,
    setupAgTestIds,
} from 'ag-grid-community';

import type { Scenario } from './filterModelsBeforeRowsHarness';
import { AGE_LT_20, BASE_COLS, ROWS, differences, setupAsWithRowsSuite } from './filterModelsBeforeRowsHarness';

let phase = 'before';

class RecordingFilter implements IFilterComp {
    private model: any = null;
    private readonly gui = document.createElement('div');
    public init(_params: IFilterParams): void {}
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
        this.model = model;
    }
}

const IAN = { filterType: 'text', type: 'contains', filter: 'Ian' };
const UNDER_190 = { filterType: 'number', type: 'lessThan', filter: 190 };
const SET_COLS: ColDef[] = [
    { field: 'athlete', filter: 'agTextColumnFilter', filterParams: { debounceMs: 0 } },
    { field: 'age', filter: 'agNumberColumnFilter', filterParams: { debounceMs: 0 } },
    { field: 'country', filter: 'agSetColumnFilter' },
];

/** Changes made before rows load that leave the grid holding no model. */
const SCENARIOS: Scenario[] = [
    {
        name: 'a model for a column never added',
        beforeRows: (api) => api.setFilterModel({ ghost: AGE_LT_20 }),
        displayed: ROWS.length,
    },
    {
        name: 'a model for a column that cannot filter',
        cols: [BASE_COLS[0], { field: 'age', filter: false }, BASE_COLS[2]],
        beforeRows: (api) => api.setFilterModel({ age: AGE_LT_20 }),
        displayed: ROWS.length,
    },
    {
        name: 'a whole model set then cleared',
        beforeRows: (api) => {
            api.setFilterModel({ age: AGE_LT_20 });
            api.setFilterModel(null);
        },
        displayed: ROWS.length,
    },
    {
        name: 'a column model set then the whole model cleared',
        beforeRows: (api) => {
            void api.setColumnFilterModel('athlete', { filterType: 'text', type: 'contains', filter: 'Mi' });
            api.setFilterModel(null);
        },
        displayed: ROWS.length,
    },
    {
        name: 'a column model set then cleared for a column added after it',
        cols: [BASE_COLS[0]],
        beforeRows: (api) => {
            void api.setColumnFilterModel('age', AGE_LT_20);
            void api.setColumnFilterModel('age', null);
            api.setGridOption('columnDefs', BASE_COLS);
        },
        displayed: ROWS.length,
    },
    {
        name: 'a Set Filter column model while its values refresh',
        cols: SET_COLS,
        options: { rowData: [] },
        beforeRows: (api) => {
            void api.setColumnFilterModel('country', { filterType: 'set', values: ['Russia'] });
            api.getColumnFilterHandler<SetFilterHandler>('country')?.refreshFilterValues();
        },
        displayed: 1,
    },
];

/** Models set before rows load that the grid holds until they do. */
const HELD_SCENARIOS: Scenario[] = [
    {
        name: 'a whole model for a filter whose type the rows decide',
        beforeRows: (api) => api.setFilterModel({ age: AGE_LT_20 }),
        displayed: 2,
    },
    {
        name: 'a whole model, then Apply on every filter',
        options: { rowData: [] },
        beforeRows: (api) => {
            api.getColumnFilterHandler('age');
            api.setFilterModel({ age: AGE_LT_20 });
            api.doFilterAction({ action: 'apply' });
        },
        displayed: 2,
    },
    ...[undefined, 'athlete'].map((colId): Scenario => ({
        name: `an initial state model, then Apply on ${colId ?? 'every filter'}`,
        options: {
            defaultColDef: { floatingFilter: true, cellDataType: false },
            initialState: { filter: { filterModel: { athlete: IAN } } },
        },
        beforeRows: (api) => api.doFilterAction({ action: 'apply', colId }),
        displayed: 1,
    })),
    {
        name: 'a whole model, then Apply in the popup',
        cols: [BASE_COLS[0], { field: 'age', filter: true, filterParams: { buttons: ['apply'] } }],
        options: { rowData: [], defaultColDef: {} },
        beforeRows: async (api) => {
            api.setFilterModel({ age: AGE_LT_20 });
            const popup = await ColumnFilterHarness.open(api, 'age');
            await popup.apply();
            api.hideColumnFilter();
        },
        displayed: 2,
    },
    {
        name: 'a whole model for Selectable Filters of Multi Filters',
        cols: [
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
        options: { rowData: [] },
        beforeRows: (api) =>
            api.setFilterModel({
                age: { filterType: 'multi', filterModels: [AGE_LT_20, null] },
                height: { filterType: 'multi', filterModels: [UNDER_190, null] },
            }),
        displayed: 1,
    },
    {
        name: 'a whole model for Selectable Filters choosing `true` or their default',
        cols: [
            BASE_COLS[0],
            {
                field: 'age',
                filter: 'agSelectableColumnFilter',
                filterParams: { filters: [{ filter: true }, { filter: 'agTextColumnFilter' }] },
            },
            { field: 'height', filter: 'agSelectableColumnFilter' },
        ],
        beforeRows: (api) => {
            api.getColumnFilterHandler('age');
            api.getColumnFilterHandler('height');
            api.setFilterModel({ age: AGE_LT_20, height: UNDER_190 });
        },
        displayed: 1,
    },
    {
        name: 'a whole model with a null entry for a column added after it',
        cols: [BASE_COLS[0]],
        beforeRows: (api) => {
            api.setFilterModel({ athlete: IAN, age: null });
            api.setGridOption('columnDefs', BASE_COLS);
        },
        displayed: 1,
    },
    {
        name: 'a Set Filter model, its popup opened and closed',
        cols: SET_COLS,
        options: { rowData: [], defaultColDef: {} },
        beforeRows: async (api) => {
            api.setFilterModel({ country: { filterType: 'set', values: ['Australia'] } });
            await ColumnFilterHarness.open(api, 'country');
            api.hideColumnFilter();
        },
        displayed: 1,
    },
    {
        name: 'a whole model for a column that cannot filter once the rows load',
        cols: SET_COLS,
        options: { rowData: [] },
        beforeRows: (api) => {
            api.setFilterModel({ age: AGE_LT_20 });
            api.setGridOption('columnDefs', [SET_COLS[0], { field: 'age', filter: false }, SET_COLS[2]]);
        },
        displayed: ROWS.length,
    },
    {
        name: 'a whole and a column model for a column then removed',
        cols: SET_COLS,
        options: { rowData: [] },
        beforeRows: (api) => {
            api.setFilterModel({ athlete: IAN, age: AGE_LT_20 });
            void api.setColumnFilterModel('age', AGE_LT_20);
            api.setGridOption('columnDefs', [SET_COLS[0], SET_COLS[2]]);
        },
        displayed: 1,
    },
    {
        name: 'a whole model and a column model for no column',
        cols: SET_COLS,
        options: { rowData: [] },
        beforeRows: (api) => {
            api.setFilterModel({ age: AGE_LT_20 });
            // @ts-expect-error a JavaScript caller passing no column
            void api.setColumnFilterModel(null, IAN);
        },
        displayed: 2,
    },
    {
        name: 'a whole model cleared over an initial state model for a filter whose type the rows decide',
        cols: [{ field: 'athlete', filter: true }],
        options: { rowData: [], initialState: { filter: { filterModel: { athlete: IAN } } } },
        beforeRows: (api) => api.setFilterModel(null),
        displayed: ROWS.length,
    },
];

describe.each([false, true])(
    'filter models set before rows load end as when set with rows, with enableFilterHandlers %s',
    (enableFilterHandlers) => {
        const run = setupAsWithRowsSuite(enableFilterHandlers);

        const heldScenarios = HELD_SCENARIOS.map((scenario) => ({ ...scenario, held: true }));
        test.each([...SCENARIOS, ...heldScenarios])('$name', async (scenario) => {
            // before rows load, a held model reads back but shows in no indicator, state or event until they do
            const compared = ({ atCalls, settled, ...told }: Awaited<ReturnType<typeof run>>) =>
                scenario.held ? { model: atCalls.model, settled } : { atCalls, settled, ...told };
            const withRows = await run(scenario, true);
            const withoutRows = await run(scenario, false);
            expect(differences(compared(withoutRows), compared(withRows))).toEqual([]);
            expect(withRows.settled.displayed).toBe(scenario.displayed);
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
        const ageChanged = vi.fn();
        const api: GridApi = gridsManager.createGrid('grid1', { columnDefs: BASE_COLS, onFilterChanged });
        await asyncSetTimeout(0);
        api.getColumn('age')!.addEventListener('filterChanged', ageChanged);
        api.setFilterModel({ age: null });
        expect(api.getFilterModel()).toEqual({});
        expect(api.isAnyFilterPresent()).toBe(false);
        expect(ageChanged).not.toHaveBeenCalled();

        api.setGridOption('rowData', ROWS);
        await asyncSetTimeout(0);
        expect(onFilterChanged).not.toHaveBeenCalled();
        expect(api.getDisplayedRowCount()).toBe(ROWS.length);
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

describe('filter models held before rows load are not lost before they apply', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, TextFilterModule, NumberFilterModule, CustomFilterModule, GridStateModule],
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
