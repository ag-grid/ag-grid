import {
    ColumnFilterHarness,
    TestGridsManager,
    installFilterLayoutMock,
    uninstallFilterLayoutMock,
} from 'ag-test-utils';

import type { ColDef, GridApi, GridOptions, ICellRendererParams, IFilterComp, IFilterParams } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    CustomFilterModule,
    TextFilterModule,
    enableDevValidations,
    setupAgTestIds,
} from 'ag-grid-community';
import { MultiFilterModule } from 'ag-grid-enterprise';

/** The "grid-supplied param is ignored" warning. */
const RESERVED_PARAM_WARNING_ID = 343;

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

/** AG-19297: a user `*Params` key that clashes with a grid-supplied param must not write into the grid's live object. */
describe('filterParams keys that clash with grid-supplied params', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, CustomFilterModule, TextFilterModule, MultiFilterModule],
    });

    beforeAll(() => {
        setupAgTestIds();
        installFilterLayoutMock();
    });
    afterAll(() => uninstallFilterLayoutMock());
    let warnSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        PassThroughFilter.lastParams = undefined;
        // Every clash raises the warning, which the behavioural setup would otherwise throw.
        enableDevValidations({ throwOn: [] });
        warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    });
    afterEach(() => {
        vi.restoreAllMocks();
        gridsManager.reset();
    });

    const reservedParamWarnings = () =>
        warnSpy.mock.calls.filter((args) => args.some((arg) => String(arg).includes(`#${RESERVED_PARAM_WARNING_ID}`)));

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
