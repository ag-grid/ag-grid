import { TestGridsManager, asyncSetTimeout, installFilterLayoutMock, uninstallFilterLayoutMock } from 'ag-test-utils';

import type {
    ColDef,
    GridApi,
    GridOptions,
    IDoesFilterPassParams,
    IFilterComp,
    IFilterParams,
} from 'ag-grid-community';
import {
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
import { MultiFilterModule, NewFiltersToolPanelModule, SetFilterModule } from 'ag-grid-enterprise';

export interface Scenario {
    name: string;
    cols?: ColDef[];
    options?: GridOptions;
    beforeRows?: (api: GridApi) => void | Promise<void>;
    /** Rows shown once the rows load, read off `ROWS` and the model, so a cell no grid filters cannot pass. */
    displayed: number;
    /** A model the grid holds until the rows load: compared as it reads back at the calls and once they load. */
    held?: boolean;
}

export const ROWS = [
    { athlete: 'Michael Phelps', age: 23, country: 'United States', height: 193, date: '2008-08-24' },
    { athlete: 'Natalie Coughlin', age: 25, country: 'United States', height: 173, date: '2008-08-24' },
    { athlete: 'Aleksey Nemov', age: 24, country: 'Russia', height: 174, date: '2000-10-01' },
    { athlete: 'Missy Franklin', age: 17, country: 'United States', height: 185, date: '2012-08-12' },
    { athlete: 'Ian Thorpe', age: 17, country: 'Australia', height: 195, date: '2000-10-01' },
];

export const AGE_LT_20 = { filterType: 'number', type: 'lessThan', filter: 20 };

/** The console logs the `enableFilterHandlers: false` deprecation once per page, so only a file's first grid would capture it. */
export const FILTER_HANDLERS_FALSE_DEPRECATION = '348';

/** The phase a test is in, and each model a `RecordingFilter` was given with the phase it came in. */
export const timeline = { phase: 'before', customSetModelSeen: [] as string[] };

export class RecordingFilter implements IFilterComp {
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
        timeline.customSetModelSeen.push(
            `${timeline.phase}:rows=${this.params.api.getDisplayedRowCount()}:${JSON.stringify(model)}`
        );
        this.model = model;
    }
}

export const BASE_COLS: ColDef[] = [
    { field: 'athlete', filter: true },
    { field: 'age', filter: true },
    { field: 'country', filter: true },
];

/** Each leaf where `actual` differs from `expected`, as `path: actual ≠ expected`. */
export const differences = (actual: unknown, expected: unknown, path = ''): string[] => {
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

/** Registers the hooks of a suite comparing grids given their rows before and after its calls, and returns the run. */
export function setupAsWithRowsSuite(enableFilterHandlers: boolean) {
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
        const warnings: string[] = [];
        const report = (...args: any[]) => {
            const code = /#(\d+)/.exec(args.join(' '))?.[1] ?? args.join(' ');
            if (code !== FILTER_HANDLERS_FALSE_DEPRECATION) {
                warnings.push(code);
            }
        };
        const warn = vi.spyOn(console, 'warn').mockImplementation(report);
        const error = vi.spyOn(console, 'error').mockImplementation(report);
        const events: string[] = [];
        const columnEvents: string[] = [];
        const api: GridApi = gridsManager.createGrid(withRows ? 'withRows' : 'withoutRows', {
            columnDefs: scenario.cols ?? BASE_COLS,
            defaultColDef: { floatingFilter: true },
            enableFilterHandlers,
            suppressSetFilterByDefault: true,
            ...scenario.options,
            ...(withRows ? { rowData: ROWS } : {}),
            onFilterChanged: ({ source, columns }) =>
                events.push(`${source}:[${columns.map((c) => c.getColId()).sort()}]`),
        });
        await asyncSetTimeout(0);
        for (const column of api.getColumns() ?? []) {
            column.addEventListener('filterChanged', () => columnEvents.push(column.getColId()));
        }
        await scenario.beforeRows?.(api);
        await asyncSetTimeout(0);
        // with no rows to filter, nothing is displayed, and a filter waiting for its type shows no model yet
        const { displayed: _, floating: __, ...atCalls } = observeFilters(api);
        // both grids are then given the rows, so each tells what a row load tells
        api.setGridOption('rowData', ROWS);
        await asyncSetTimeout(0);
        await asyncSetTimeout(0);
        const settled = observeFilters(api);
        // also clears the warnings already given, which the other grid must give again
        gridsManager.reset();
        warn.mockRestore();
        error.mockRestore();
        // a column's listeners re-read its filter, so which columns are told matters, not how often
        const toldColumns = [...new Set(columnEvents)].sort();
        return JSON.parse(JSON.stringify({ atCalls, settled, events, toldColumns, warnings }));
    };
    return run;
}
