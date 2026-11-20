import { waitFor } from '@testing-library/dom';
import {
    ALL_SEVERITIES,
    ColumnFilterHarness,
    TestGridsManager,
    installFilterLayoutMock,
    uninstallFilterLayoutMock,
} from 'ag-test-utils';

import type { ColDef, GridApi, GridOptions, ICellRendererParams, IFilterComp, IFilterParams } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    CustomFilterModule,
    TextEditorModule,
    TextFilterModule,
    enableDevValidations,
    setupAgTestIds,
} from 'ag-grid-community';
import { MultiFilterModule } from 'ag-grid-enterprise';

/** The "grid-supplied param is ignored" warning. */
const RESERVED_PARAM_WARNING_ID = 343;

const isReservedParamWarning = (args: unknown[]) =>
    args.some((arg) => String(arg).includes(`#${RESERVED_PARAM_WARNING_ID}`));

class PassThroughFilter implements IFilterComp {
    public static lastParams: IFilterParams | undefined;
    private readonly gui = document.createElement('div');

    public init(params: IFilterParams): void {
        PassThroughFilter.lastParams = params;
    }
    public getGui(): HTMLElement {
        return this.gui;
    }
    public isFilterActive(): boolean {
        return false;
    }
    public doesFilterPass(): boolean {
        return true;
    }
    public getModel(): null {
        return null;
    }
    public setModel(): void {}
}

const athlete = (colDef: ColDef): ColDef => ({ field: 'athlete', flex: 1, minWidth: 96, ...colDef });

describe('filterParams keys that clash with grid-supplied params', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, CustomFilterModule, TextEditorModule, TextFilterModule, MultiFilterModule],
    });

    beforeAll(() => {
        setupAgTestIds();
        installFilterLayoutMock();
    });
    afterAll(() => uninstallFilterLayoutMock());
    let warnSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        PassThroughFilter.lastParams = undefined;
        // Every clash raises the warning, which the behavioural setup would otherwise throw; any other diagnostic still does.
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [RESERVED_PARAM_WARNING_ID] });
        const warn = console.warn;
        warnSpy = vi.spyOn(console, 'warn').mockImplementation((...args: unknown[]) => {
            if (!isReservedParamWarning(args)) {
                warn(...args);
            }
        });
    });
    afterEach(() => {
        vi.restoreAllMocks();
        gridsManager.reset();
    });

    const reservedParamWarnings = () => warnSpy.mock.calls.filter(isReservedParamWarning);

    const createGrid = (athleteColDef: ColDef, options?: Partial<GridOptions>): Promise<GridApi> =>
        gridsManager.createGridAndWait('grid1', {
            columnDefs: [athlete(athleteColDef), { field: 'country', flex: 1 }],
            rowData: [
                { athlete: 'Michael Phelps', country: 'United States' },
                { athlete: 'Ian Thorpe', country: 'Australia' },
            ],
            ...options,
        });

    test('a custom "column" param on a built-in text filter does not change the live column min width', async () => {
        const api = await createGrid({ filter: 'agTextColumnFilter', filterParams: { column: { minWidth: '6rem' } } });

        expect(api.getColumn('athlete')!.getMinWidth()).toBe(96);

        await ColumnFilterHarness.open(api, 'athlete');

        expect(api.getColumn('athlete')!.getMinWidth()).toBe(96);
        expect(api.getColumnDef('athlete')!.minWidth).toBe(96);

        await api.setColumnFilterModel('athlete', { filterType: 'text', type: 'equals', filter: 'Ian Thorpe' });
        api.onFilterChanged();
        expect(api.getDisplayedRowCount()).toBe(1);
    });

    test('a custom "column" param on a custom filter does not change the live column min width', async () => {
        const api = await createGrid({ filter: PassThroughFilter, filterParams: { column: { minWidth: '6rem' } } });

        await ColumnFilterHarness.open(api, 'athlete');

        expect(api.getColumn('athlete')!.getMinWidth()).toBe(96);
        expect(PassThroughFilter.lastParams!.column).toBe(api.getColumn('athlete'));
    });

    test('moving a column after opening the filter keeps column widths numeric', async () => {
        const api = await createGrid({ filter: 'agTextColumnFilter', filterParams: { column: { minWidth: '6rem' } } });

        await ColumnFilterHarness.open(api, 'athlete');
        api.moveColumns(['country'], 0);

        expect(api.getAllDisplayedColumns().map((c) => c.getColId())).toEqual(['country', 'athlete']);
        const width = api.getColumn('athlete')!.getActualWidth();
        expect(Number.isFinite(width)).toBe(true);
        expect(width).toBeGreaterThanOrEqual(96);
    });

    test('a clashing filterParams key with a floating filter does not change the column before the filter opens', async () => {
        const api = await createGrid({
            filter: 'agTextColumnFilter',
            floatingFilter: true,
            filterParams: { column: { minWidth: '6rem' } },
        });

        expect(api.getColumn('athlete')!.getMinWidth()).toBe(96);
    });

    test('a clashing floatingFilterComponentParams key does not change the live column', async () => {
        const api = await createGrid({
            filter: 'agTextColumnFilter',
            floatingFilter: true,
            floatingFilterComponentParams: { column: { minWidth: '6rem' } },
        });

        expect(api.getColumn('athlete')!.getMinWidth()).toBe(96);
    });

    test('a clashing key in a multi filter child filterParams does not change the live column', async () => {
        const api = await createGrid({
            filter: 'agMultiColumnFilter',
            floatingFilter: true,
            filterParams: {
                filters: [{ filter: 'agTextColumnFilter', filterParams: { column: { minWidth: '6rem' } } }],
            },
        });

        expect(api.getColumn('athlete')!.getMinWidth()).toBe(96);
    });

    test('clashing cellRendererParams keys do not change the live column or the row data', async () => {
        const api = await createGrid({
            cellRenderer: (params: ICellRendererParams) => String(params.value),
            cellRendererParams: {
                column: { minWidth: '6rem' },
                node: { data: { athlete: 'changed via node' } },
                data: { athlete: 'changed via data' },
            },
        });

        expect(api.getColumn('athlete')!.getMinWidth()).toBe(96);
        expect(api.getDisplayedRowAtIndex(0)!.data).toEqual({ athlete: 'Michael Phelps', country: 'United States' });
    });

    test('a cellRendererParams "value" does not write into an object-valued cell', async () => {
        const medals = { gold: 1 };
        let rendererValue: unknown;
        await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                {
                    field: 'medals',
                    cellDataType: false,
                    cellRenderer: (params: ICellRendererParams) => {
                        rendererValue = params.value;
                        return '';
                    },
                    cellRendererParams: { value: { gold: 99 } },
                },
            ],
            rowData: [{ medals }],
        });

        expect(medals).toEqual({ gold: 1 });
        expect(rendererValue).toBe(medals);
    });

    test('a primitive cellRendererParams "value" still overrides the cell value', async () => {
        let rendererValue: unknown;
        await createGrid({
            cellRenderer: (params: ICellRendererParams) => {
                rendererValue = params.value;
                return '';
            },
            cellRendererParams: { value: 'custom' },
        });

        expect(rendererValue).toBe('custom');
        expect(reservedParamWarnings()).toHaveLength(0);
    });

    test('cellRendererSelector params are checked against the grid-supplied params, not the merged ones', async () => {
        let rendererContext: unknown;
        const api = await createGrid({
            cellRendererSelector: () => ({
                component: (params: ICellRendererParams) => {
                    rendererContext = params.context;
                    return '';
                },
                params: { column: { minWidth: '6rem' }, context: { tenant: 'selector' } },
            }),
            cellRendererParams: { context: { tenant: 'params' } },
        });

        expect(api.getColumn('athlete')!.getMinWidth()).toBe(96);
        expect(rendererContext).toEqual({ tenant: 'selector' });
    });

    test('a filterParams "model" does not replace the null model the grid supplies', async () => {
        let displayModel: unknown = 'not initialised';
        class DisplayComp {
            private readonly gui = document.createElement('div');
            public init(params: { model: unknown }): void {
                displayModel = params.model;
            }
            public getGui(): HTMLElement {
                return this.gui;
            }
        }
        const api = await createGrid(
            {
                filter: { component: DisplayComp, doesFilterPass: () => true },
                filterParams: { model: { filterType: 'custom' } },
            },
            { enableFilterHandlers: true }
        );

        await ColumnFilterHarness.open(api, 'athlete');

        expect(displayModel).toBeNull();
    });

    test('a clashing headerComponentParams key does not change the live column', async () => {
        const api = await createGrid({ headerComponentParams: { column: { minWidth: '6rem' } } });

        expect(api.getColumn('athlete')!.getMinWidth()).toBe(96);
    });

    test('a clashing filterParams "context" does not change the grid context', async () => {
        const context = { tenant: 'grid' };
        const api = await createGrid(
            { filter: PassThroughFilter, filterParams: { context: { tenant: 'user' } } },
            { context }
        );

        await ColumnFilterHarness.open(api, 'athlete');

        expect(context).toEqual({ tenant: 'grid' });
        expect(PassThroughFilter.lastParams!.context).toBe(context);
    });

    test('a clashing cellEditorParams key does not change the live column', async () => {
        const api = await createGrid({ editable: true, cellEditorParams: { column: { minWidth: '6rem' } } });

        api.startEditingCell({ rowIndex: 0, colKey: 'athlete' });
        await waitFor(() => expect(api.getEditingCells()).toHaveLength(1));

        expect(api.getColumn('athlete')!.getMinWidth()).toBe(96);
    });

    test('a filterParams "context" still reaches the filter when the grid has no context', async () => {
        const api = await createGrid({ filter: PassThroughFilter, filterParams: { context: { tenant: 'user' } } });

        await ColumnFilterHarness.open(api, 'athlete');

        expect(PassThroughFilter.lastParams!.context).toEqual({ tenant: 'user' });
    });

    test('function-form filterParams that spread the grid params keep working without a warning', async () => {
        const api = await createGrid({
            filter: PassThroughFilter,
            filterParams: (params: IFilterParams) => ({ ...params, extra: 1 }),
        });

        await ColumnFilterHarness.open(api, 'athlete');

        expect((PassThroughFilter.lastParams as any).extra).toBe(1);
        expect(PassThroughFilter.lastParams!.column).toBe(api.getColumn('athlete'));
        expect(reservedParamWarnings()).toHaveLength(0);
    });

    test('a clashing key warns once per grid, however many components use it', async () => {
        await createGrid({
            cellRenderer: (params: ICellRendererParams) => String(params.value),
            cellRendererParams: { column: { minWidth: '6rem' } },
        });

        expect(reservedParamWarnings()).toHaveLength(1);
    });
});
