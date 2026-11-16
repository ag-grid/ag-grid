import { waitFor } from '@testing-library/dom';
import { userEvent } from '@testing-library/user-event';
import {
    ALL_SEVERITIES,
    ColumnFilterHarness,
    FloatingFilterHarness,
    GridRows,
    TestGridsManager,
    asyncSetTimeout,
    installFilterLayoutMock,
    uninstallFilterLayoutMock,
} from 'ag-test-utils';

import type { ColDef, GridApi, IDoesFilterPassParams, IFilterComp } from 'ag-grid-community';
import {
    AgPromise,
    ClientSideRowModelModule,
    CustomFilterModule,
    DateFilterModule,
    GridStateModule,
    NumberFilterModule,
    TextFilterModule,
    enableDevValidations,
    getGridElement,
    setupAgTestIds,
} from 'ag-grid-community';
import { AdvancedFilterModule, NewFiltersToolPanelModule, SetFilterModule } from 'ag-grid-enterprise';

import type { Scenario } from './filterModelsBeforeRowsHarness';
import { AGE_LT_20, BASE_COLS, ROWS, differences, setupAsWithRowsSuite } from './filterModelsBeforeRowsHarness';

let phase = 'before';

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

/** Each change made before rows load that leaves no model. */
const ENTRY_PATHS: { path: string; beforeRows: (api: GridApi, model: any) => void }[] = [
    {
        path: 'set then cleared',
        beforeRows: (api, model) => {
            api.setFilterModel({ age: model });
            api.setFilterModel(null);
        },
    },
    {
        path: 'column cleared holding nothing',
        beforeRows: (api) => void api.setColumnFilterModel('age', null).then(() => api.onFilterChanged()),
    },
];

describe.each([false, true])(
    'filter models set before rows load end as when set with rows, with enableFilterHandlers %s',
    (enableFilterHandlers) => {
        const run = setupAsWithRowsSuite(enableFilterHandlers);

        const formScenarios: Scenario[] = [];
        for (const { form, col, model } of FILTER_FORMS) {
            for (const { path, beforeRows } of ENTRY_PATHS) {
                formScenarios.push({
                    name: `a ${form} filter's model ${path}`,
                    cols: [{ field: 'athlete', filter: 'agTextColumnFilter' }, col],
                    beforeRows: (api) => beforeRows(api, model),
                    displayed: ROWS.length,
                });
            }
        }
        test.each(formScenarios)('$name', async (scenario) => {
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

    test('turning off a built filter before rows load tells it at once, as with rows', async () => {
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

    test('a model cleared before rows load for a column not there yet is in no grid filterChanged once they load', async () => {
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

    test('a model held before rows load tells its column filterChanged once as they load, beside the one for the rows', async () => {
        const api: GridApi = gridsManager.createGrid('grid1', { columnDefs: BASE_COLS });
        await asyncSetTimeout(0);
        api.setFilterModel({ age: AGE_LT_20 });
        const told: string[] = [];
        api.getColumn('age')!.addEventListener('filterChanged', (event: any) =>
            told.push(event.afterDataChange ? 'rows' : 'model')
        );
        api.setGridOption('rowData', ROWS);
        await asyncSetTimeout(0);
        expect(told.sort()).toEqual(['model', 'rows']);
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
});

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

    test('a model set before the rows arrive for a column that cannot filter once they do is dropped', async () => {
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [63] });
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const age = { filterType: 'number', type: 'lessThan', filter: 20 };
        const api: GridApi = gridsManager.createGrid('grid1', { columnDefs: threeFilterCols, rowData: [] });
        await asyncSetTimeout(0);
        api.setFilterModel({ age });
        api.setGridOption('columnDefs', [threeFilterCols[0], { field: 'age', filter: false }, threeFilterCols[2]]);
        expect(warnSpy).not.toHaveBeenCalled();
        api.setGridOption('rowData', PEOPLE);
        await asyncSetTimeout(0);
        expect(warnSpy.mock.calls.flat().join(' ')).toContain('warning #63');

        api.setGridOption('columnDefs', threeFilterCols);
        await asyncSetTimeout(0);
        expect(api.getFilterModel()).toEqual({});
        expect(api.isColumnFilterPresent()).toBe(false);
        expect(api.getDisplayedRowCount()).toBe(PEOPLE.length);
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

    test('a column model then an equal whole-grid model set before the rows arrive apply with no grid filterChanged', async () => {
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

    test.each([false, true])(
        'with enableFilterHandlers %s, an edit before rows load in the Text Filter they replace with a Number Filter goes with it',
        async (enableFilterHandlers) => {
            const changed: string[][] = [];
            const api: GridApi = gridsManager.createGrid('grid1', {
                columnDefs: [{ field: 'age', filter: true, floatingFilter: true, filterParams: { debounceMs: 0 } }],
                rowData: [],
                enableFilterHandlers,
                onFilterChanged: (event) => changed.push(event.columns.map((column) => column.getColId())),
            });
            const filteredHeaders = () =>
                Array.from(getGridElement(api)!.querySelectorAll('.ag-header-cell-filtered'), (cell) =>
                    cell.getAttribute('col-id')
                );
            await asyncSetTimeout(0);
            await userEvent.setup().type(FloatingFilterHarness.get(api, 'age').input(), '2');
            await asyncSetTimeout(0);
            expect({ model: api.getFilterModel(), headers: filteredHeaders() }).toEqual({
                model: { age: { filterType: 'text', type: 'contains', filter: '2' } },
                headers: ['age'],
            });
            changed.length = 0;

            api.applyTransaction({ add: PEOPLE });
            await asyncSetTimeout(0);
            expect({ model: api.getFilterModel(), changed, headers: filteredHeaders() }).toEqual({
                model: {},
                changed: [['age']],
                headers: [],
            });
            expect(api.getDisplayedRowCount()).toBe(PEOPLE.length);
        }
    );
});
