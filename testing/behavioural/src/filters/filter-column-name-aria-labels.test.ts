import { findByTestId, waitFor } from '@testing-library/dom';
import {
    ALL_SEVERITIES,
    ColumnFilterHarness,
    TestGridsManager,
    asyncSetTimeout,
    installFilterLayoutMock,
    uninstallFilterLayoutMock,
} from 'ag-test-utils';

import type { ColDef, GridApi } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ColumnApiModule,
    DateFilterModule,
    NumberFilterModule,
    TextFilterModule,
    agTestIdFor,
    enableDevValidations,
    getGridElement,
    setupAgTestIds,
} from 'ag-grid-community';
import { AggregationModule, FormulaModule, PivotModule, RowGroupingModule } from 'ag-grid-enterprise';

/**
 * The floating filter button, the filter popup and the controls inside it name the column they filter,
 * so a screen reader user tabbing between columns hears which one each control belongs to.
 */
describe('Filter controls name their column', () => {
    const gridsManager = new TestGridsManager({
        modules: [
            ClientSideRowModelModule,
            ColumnApiModule,
            DateFilterModule,
            NumberFilterModule,
            TextFilterModule,
            AggregationModule,
            FormulaModule,
            PivotModule,
            RowGroupingModule,
        ],
    });

    beforeAll(() => {
        setupAgTestIds();
        installFilterLayoutMock();
    });
    afterAll(() => uninstallFilterLayoutMock());
    afterEach(() => gridsManager.reset());

    const ROW_DATA = [{ value: 'Ireland', total: 3, awarded: '2024-01-01' }];

    const floatingFilterButtonLabel = async (api: GridApi, colId: string) => {
        const button = await findByTestId(getGridElement(api)! as HTMLElement, agTestIdFor.floatingFilterButton(colId));
        return button.getAttribute('aria-label');
    };
    const popup = () => document.querySelector<HTMLElement>('.ag-filter-menu')!;
    const operatorLabel = () =>
        popup().querySelector('.ag-filter-select .ag-picker-field-wrapper')!.getAttribute('aria-label');

    test.each<[string, ColDef, 'text' | 'date']>([
        ['text', { field: 'value', filter: 'agTextColumnFilter' }, 'text'],
        ['date', { field: 'awarded', filter: 'agDateColumnFilter', cellDataType: 'dateString' }, 'date'],
    ])('%s filter', async (_name, colDef, inputType) => {
        const api = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ ...colDef, headerName: 'Country', floatingFilter: true }],
            rowData: ROW_DATA,
        });
        const colId = colDef.field!;
        expect(await floatingFilterButtonLabel(api, colId)).toBe('Open Country Filter Menu');

        const harness = await ColumnFilterHarness.open(api, colId, 'floatingFilter');

        expect(popup().getAttribute('aria-label')).toBe('Country Column Filter');
        expect(operatorLabel()).toBe('Country Filtering Operator');
        expect(harness.input(inputType).getAttribute('aria-label')).toBe('Country Filter Value');
    });

    test('range inputs name the column on both ends', async () => {
        const api = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'total', filter: 'agNumberColumnFilter' }],
            rowData: ROW_DATA,
        });
        const harness = await ColumnFilterHarness.open(api, 'total');
        await harness.selectOperator('Between');

        expect(harness.inputs('number').map((input) => input.getAttribute('aria-label'))).toEqual([
            'Total Filter from value',
            'Total Filter to value',
        ]);
    });

    test.each<[string, (api: GridApi) => void]>([
        ['column state', (api) => api.applyColumnState({ state: [{ colId: 'value', headerName: 'Nation' }] })],
        [
            'column definition',
            (api) =>
                api.setGridOption('columnDefs', [
                    { field: 'value', headerName: 'Nation', filter: 'agTextColumnFilter', floatingFilter: true },
                ]),
        ],
    ])('labels follow a rename through the %s', async (_name, rename) => {
        const api = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'value', headerName: 'Country', filter: 'agTextColumnFilter', floatingFilter: true }],
            rowData: ROW_DATA,
        });
        const harness = await ColumnFilterHarness.open(api, 'value', 'floatingFilter');
        expect(operatorLabel()).toBe('Country Filtering Operator');

        rename(api);

        await waitFor(() => expect(operatorLabel()).toBe('Nation Filtering Operator'));
        expect(harness.input('text').getAttribute('aria-label')).toBe('Nation Filter Value');
        expect(popup().getAttribute('aria-label')).toBe('Nation Column Filter');
        expect(await floatingFilterButtonLabel(api, 'value')).toBe('Open Nation Filter Menu');
    });

    test('a rename refreshes the floating filter button label and not its component, which a redefinition refreshes', async () => {
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [344] });
        const refreshes: unknown[] = [];
        class FloatingFilter {
            private readonly eGui = document.createElement('div');
            public init(): void {}
            public getGui(): HTMLElement {
                return this.eGui;
            }
            public onParentModelChanged(): void {}
            public refresh(params: { step: number }): void {
                refreshes.push(params.step);
            }
        }
        const colDef: ColDef = {
            field: 'value',
            headerName: 'Country',
            filter: 'agTextColumnFilter',
            floatingFilter: true,
            floatingFilterComponent: FloatingFilter,
            floatingFilterComponentParams: { step: 1 },
        };
        const api = await gridsManager.createGridAndWait('grid1', { columnDefs: [colDef], rowData: ROW_DATA });
        expect(await floatingFilterButtonLabel(api, 'value')).toBe('Open Country Filter Menu');

        api.applyColumnState({ state: [{ colId: 'value', headerName: 'Nation' }] });
        await asyncSetTimeout(0);

        expect(await floatingFilterButtonLabel(api, 'value')).toBe('Open Nation Filter Menu');
        expect(refreshes).toEqual([]);

        api.setGridOption('columnDefs', [{ ...colDef, floatingFilterComponentParams: { step: 2 } }]);
        await waitFor(() => expect(refreshes).toEqual([2]));

        api.applyColumnState({ state: [{ colId: 'value', headerName: 'State' }] });
        await asyncSetTimeout(0);

        expect(await floatingFilterButtonLabel(api, 'value')).toBe('Open State Filter Menu');
        expect(refreshes).toEqual([2]);
    });

    test('a column redefined and renamed in one update refreshes its floating filter component once, as a redefinition alone does, and shows the new name', async () => {
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [344] });
        const events: Record<string, { built: number; destroyed: number; refreshes: number[] }> = {
            value: { built: 0, destroyed: 0, refreshes: [] },
            other: { built: 0, destroyed: 0, refreshes: [] },
        };
        class FloatingFilter {
            private readonly eGui = document.createElement('div');
            private colId = '';
            public init(params: { column: { getColId(): string } }): void {
                this.colId = params.column.getColId();
                ++events[this.colId].built;
            }
            public getGui(): HTMLElement {
                return this.eGui;
            }
            public onParentModelChanged(): void {}
            public refresh(params: { step: number }): void {
                events[this.colId].refreshes.push(params.step);
            }
            public destroy(): void {
                ++events[this.colId].destroyed;
            }
        }
        const colDef = (field: string, headerName: string, step: number): ColDef => ({
            field,
            headerName,
            filter: 'agTextColumnFilter',
            floatingFilter: true,
            floatingFilterComponent: FloatingFilter,
            floatingFilterComponentParams: { step },
        });
        const api = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [colDef('value', 'Country', 1), colDef('other', 'Other', 1)],
            rowData: [{ value: 'Ireland', other: 'x' }],
        });
        const headerText = (colId: string) =>
            getGridElement(api)!.querySelector(`.ag-header-cell[col-id="${colId}"] .ag-header-cell-text`)!.textContent;
        expect(await floatingFilterButtonLabel(api, 'value')).toBe('Open Country Filter Menu');
        expect({ headers: [headerText('value'), headerText('other')], events }).toEqual({
            headers: ['Country', 'Other'],
            events: {
                value: { built: 1, destroyed: 0, refreshes: [] },
                other: { built: 1, destroyed: 0, refreshes: [] },
            },
        });

        api.setGridOption('columnDefs', [colDef('value', 'Nation', 2), colDef('other', 'Other', 2)]);
        await waitFor(() => expect(events.other.refreshes).toEqual([2]));
        await asyncSetTimeout(0);

        expect(await floatingFilterButtonLabel(api, 'value')).toBe('Open Nation Filter Menu');
        expect({ headers: [headerText('value'), headerText('other')], events }).toEqual({
            headers: ['Nation', 'Other'],
            events: {
                value: { built: 1, destroyed: 0, refreshes: [2] },
                other: { built: 1, destroyed: 0, refreshes: [2] },
            },
        });
    });

    test('a formula column redefined in one update that moves its column letter refreshes its floating filter component once and shows the new letter', async () => {
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [344] });
        const refreshes: number[] = [];
        const lifecycle = { built: 0, destroyed: 0 };
        class FloatingFilter {
            private readonly eGui = document.createElement('div');
            public init(): void {
                ++lifecycle.built;
            }
            public getGui(): HTMLElement {
                return this.eGui;
            }
            public onParentModelChanged(): void {}
            public refresh(params: { step: number }): void {
                refreshes.push(params.step);
            }
            public destroy(): void {
                ++lifecycle.destroyed;
            }
        }
        const out = (step: number): ColDef => ({
            field: 'out',
            allowFormula: true,
            filter: 'agTextColumnFilter',
            floatingFilter: true,
            floatingFilterComponent: FloatingFilter,
            floatingFilterComponentParams: { step },
        });
        const api = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'a' }, out(1)],
            rowData: [{ a: 1, b: 2, out: '=1' }],
        });
        const letter = () =>
            getGridElement(api)!.querySelector('.ag-header-cell[col-id="out"] .ag-header-col-ref')?.textContent;
        await waitFor(() => expect(letter()).toBe('B'));
        expect({ lifecycle, refreshes }).toEqual({ lifecycle: { built: 1, destroyed: 0 }, refreshes: [] });

        api.setGridOption('columnDefs', [{ field: 'b' }, { field: 'a' }, out(2)]);
        await waitFor(() => expect(letter()).toBe('C'));
        await asyncSetTimeout(0);

        expect({ lifecycle, refreshes }).toEqual({ lifecycle: { built: 1, destroyed: 0 }, refreshes: [2] });
    });

    const floatingFilterLabels = (api: GridApi, colId: string) => {
        const cell = TestGridsManager.getHTMLElement(api)!.querySelector(`.ag-floating-filter[col-id="${colId}"]`);
        return {
            colId,
            button: cell?.querySelector('.ag-floating-filter-button button')?.getAttribute('aria-label') ?? null,
            input: cell?.querySelector('input')?.getAttribute('aria-label') ?? null,
        };
    };
    const labelsOf = (name: string, colId: string) => ({
        colId,
        button: `Open ${name} Filter Menu`,
        input: `${name} Filter Input`,
    });

    test.each<[string, (api: GridApi) => void]>([
        ['applyColumnState', (api) => api.applyColumnState({ state: [{ colId: 'n', aggFunc: 'avg' }] })],
        ['setColumnAggFunc', (api) => api.setColumnAggFunc('n', 'avg')],
    ])('pivot result columns follow a change of aggregation function through %s', async (_name, change) => {
        const api = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                { field: 'a', rowGroup: true },
                { field: 'b', pivot: true },
                { field: 'n', aggFunc: 'max', filter: true, floatingFilter: true },
            ],
            rowData: [
                { a: 'p', b: 'x', n: 1 },
                { a: 'p', b: 'y', n: 2 },
                { a: 'q', b: 'x', n: 3 },
                { a: 'q', b: 'y', n: 4 },
            ],
            pivotMode: true,
        });
        const colIds = api.getPivotResultColumns()!.map((col) => col.getColId());
        expect(colIds.length).toBe(2);

        await waitFor(() =>
            expect(colIds.map((colId) => floatingFilterLabels(api, colId))).toEqual(
                colIds.map((colId) => labelsOf('max(N)', colId))
            )
        );

        change(api);

        await waitFor(() =>
            expect(colIds.map((colId) => floatingFilterLabels(api, colId))).toEqual(
                colIds.map((colId) => labelsOf('avg(N)', colId))
            )
        );
    });

    const AGG_ROW_DATA = [
        { a: 'p', n: 1 },
        { a: 'q', n: 2 },
    ];

    test('labels follow the aggregation function, suppressAggFuncInHeader and the grouping going', async () => {
        const api = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                { field: 'a', rowGroup: true, hide: true },
                { field: 'n', aggFunc: 'sum', filter: 'agNumberColumnFilter', floatingFilter: true },
                {
                    field: 'd',
                    aggFunc: 'first',
                    cellDataType: 'dateString',
                    filter: 'agDateColumnFilter',
                    floatingFilter: true,
                },
            ],
            rowData: AGG_ROW_DATA.map((row) => ({ ...row, d: '2024-01-01' })),
        });
        const expectLabels = (name: string) =>
            waitFor(() => expect(floatingFilterLabels(api, 'n')).toEqual(labelsOf(name, 'n')));
        // the date floating filter also holds a read-only text input, named 'Date Filter Input'
        const dateLabels = () => {
            const cell = TestGridsManager.getHTMLElement(api)!.querySelector('.ag-floating-filter[col-id="d"]');
            return {
                button: cell?.querySelector('.ag-floating-filter-button button')?.getAttribute('aria-label') ?? null,
                dateInput:
                    cell?.querySelector('.ag-date-floating-filter-wrapper input')?.getAttribute('aria-label') ?? null,
            };
        };

        await expectLabels('sum(N)');
        expect(dateLabels()).toEqual({ button: 'Open first(D) Filter Menu', dateInput: 'first(D) Filter Input' });

        api.setColumnAggFunc('n', 'max');
        await expectLabels('max(N)');

        api.setColumnAggFunc('d', 'last');
        await waitFor(() =>
            expect(dateLabels()).toEqual({ button: 'Open last(D) Filter Menu', dateInput: 'last(D) Filter Input' })
        );

        api.setGridOption('suppressAggFuncInHeader', true);
        await expectLabels('N');

        api.setGridOption('suppressAggFuncInHeader', false);
        await expectLabels('max(N)');

        api.setRowGroupColumns([]);
        await expectLabels('N');
    });

    test('a custom floating filter is built again once by a change of its own column name, and not by a change leaving the name or changing another column', async () => {
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [344] });
        const counts: Record<string, { built: number; destroyed: number; refreshes: number }> = {
            n: { built: 0, destroyed: 0, refreshes: 0 },
            m: { built: 0, destroyed: 0, refreshes: 0 },
        };
        class FloatingFilter {
            private readonly eGui = document.createElement('div');
            private colId = '';
            public init(params: { column: { getColId(): string } }): void {
                this.colId = params.column.getColId();
                ++counts[this.colId].built;
            }
            public getGui(): HTMLElement {
                return this.eGui;
            }
            public onParentModelChanged(): void {}
            public refresh(): void {
                ++counts[this.colId].refreshes;
            }
            public destroy(): void {
                ++counts[this.colId].destroyed;
            }
        }
        const valueColumn = (field: string): ColDef => ({
            field,
            aggFunc: 'sum',
            filter: 'agNumberColumnFilter',
            floatingFilter: true,
            floatingFilterComponent: FloatingFilter,
        });
        const api = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'a', rowGroup: true, hide: true }, valueColumn('n'), valueColumn('m')],
            rowData: [
                { a: 'p', n: 1, m: 3 },
                { a: 'q', n: 2, m: 4 },
            ],
        });
        const observed = () => ({
            labels: {
                n: floatingFilterLabels(api, 'n').button,
                m: floatingFilterLabels(api, 'm').button,
            },
            counts: { n: { ...counts.n }, m: { ...counts.m } },
        });
        const count = (built: number, destroyed: number, refreshes: number) => ({ built, destroyed, refreshes });
        expect(await floatingFilterButtonLabel(api, 'n')).toBe('Open sum(N) Filter Menu');
        expect(observed()).toEqual({
            labels: { n: 'Open sum(N) Filter Menu', m: 'Open sum(M) Filter Menu' },
            counts: { n: count(1, 0, 0), m: count(1, 0, 0) },
        });

        api.setColumnAggFunc('n', 'max');
        await waitFor(() =>
            expect(observed()).toEqual({
                labels: { n: 'Open max(N) Filter Menu', m: 'Open sum(M) Filter Menu' },
                counts: { n: count(2, 1, 0), m: count(1, 0, 0) },
            })
        );

        api.applyColumnState({ state: [{ colId: 'n', sort: 'asc' }] });
        await asyncSetTimeout(0);

        expect(observed()).toEqual({
            labels: { n: 'Open max(N) Filter Menu', m: 'Open sum(M) Filter Menu' },
            counts: { n: count(2, 1, 0), m: count(1, 0, 0) },
        });

        api.setGridOption('suppressAggFuncInHeader', true);
        await waitFor(() =>
            expect(observed()).toEqual({
                labels: { n: 'Open N Filter Menu', m: 'Open M Filter Menu' },
                counts: { n: count(3, 2, 0), m: count(2, 1, 0) },
            })
        );
    });

    test('a floating filter showing a read-only model stays read-only when its column name changes', async () => {
        const api = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [
                { field: 'a', rowGroup: true, hide: true },
                { field: 'n', aggFunc: 'sum', filter: 'agNumberColumnFilter', floatingFilter: true },
                { field: 't', aggFunc: 'count', filter: 'agTextColumnFilter', floatingFilter: true },
            ],
            rowData: [
                { a: 'p', n: 1, t: 'x1' },
                { a: 'q', n: 2, t: 'x2' },
            ],
        });
        api.setFilterModel({
            n: { filterType: 'number', type: 'inRange', filter: 1, filterTo: 5 },
            t: {
                filterType: 'text',
                operator: 'OR',
                conditions: [
                    { filterType: 'text', type: 'contains', filter: '1' },
                    { filterType: 'text', type: 'contains', filter: '2' },
                ],
            },
        });
        const observed = () => {
            const readColumn = (colId: string) => {
                const cell = TestGridsManager.getHTMLElement(api)!.querySelector(
                    `.ag-floating-filter[col-id="${colId}"]`
                )!;
                return {
                    button: cell.querySelector('.ag-floating-filter-button button')!.getAttribute('aria-label'),
                    shownInputs: Array.from(cell.querySelectorAll('input'))
                        .filter((input) => !input.closest('.ag-hidden'))
                        .map((input) => ({ disabled: input.disabled, value: input.value })),
                };
            };
            return { n: readColumn('n'), t: readColumn('t') };
        };

        await waitFor(() =>
            expect(observed().n.shownInputs.map((input) => input.disabled && input.value !== '')).toEqual([true])
        );
        const before = observed();
        expect({
            buttons: [before.n.button, before.t.button],
            shown: [before.n.shownInputs.length, before.t.shownInputs.length],
            readOnly: [...before.n.shownInputs, ...before.t.shownInputs].map(
                (input) => input.disabled && input.value !== ''
            ),
        }).toEqual({
            buttons: ['Open sum(N) Filter Menu', 'Open count(T) Filter Menu'],
            shown: [1, 1],
            readOnly: [true, true],
        });

        api.setColumnAggFunc('n', 'max');
        api.setColumnAggFunc('t', 'first');
        await waitFor(() =>
            expect(observed()).toEqual({
                n: { ...before.n, button: 'Open max(N) Filter Menu' },
                t: { ...before.t, button: 'Open first(T) Filter Menu' },
            })
        );

        api.setGridOption('suppressAggFuncInHeader', true);
        await waitFor(() =>
            expect(observed()).toEqual({
                n: { ...before.n, button: 'Open N Filter Menu' },
                t: { ...before.t, button: 'Open T Filter Menu' },
            })
        );
    });

    test('a column with no header name keeps the unnamed labels', async () => {
        const api = await gridsManager.createGridAndWait('grid1', {
            columnDefs: [{ field: 'value', headerName: '', filter: 'agTextColumnFilter', floatingFilter: true }],
            rowData: ROW_DATA,
        });
        expect(await floatingFilterButtonLabel(api, 'value')).toBe('Open Filter Menu');
        expect(document.querySelector('.ag-floating-filter input')!.getAttribute('aria-label')).toBe('Filter Input');

        const harness = await ColumnFilterHarness.open(api, 'value', 'floatingFilter');

        expect(popup().getAttribute('aria-label')).toBe('Column Filter');
        expect(operatorLabel()).toBe('Filtering Operator');
        expect(harness.input('text').getAttribute('aria-label')).toBe('Filter Value');
    });
});
