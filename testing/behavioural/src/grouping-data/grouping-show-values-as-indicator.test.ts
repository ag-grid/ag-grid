import { waitFor } from '@testing-library/dom';
import { GridColumns, GridRows, TestGridsManager, asyncSetTimeout } from 'ag-test-utils';

import type { IHeaderParams } from 'ag-grid-community';
import { ClientSideRowModelModule } from 'ag-grid-community';
import { PivotModule, RowGroupingModule, ShowValuesAsModule, TreeDataModule } from 'ag-grid-enterprise';

function indicator(colId: string): HTMLElement {
    const el = document.querySelector<HTMLElement>(`.ag-header-cell[col-id="${colId}"] .ag-show-values-as-icon`);
    if (!el) {
        throw new Error(`No show-values-as indicator for column '${colId}'`);
    }
    return el;
}

const isShown = (colId: string): boolean => !indicator(colId).classList.contains('ag-hidden');
const isDormant = (colId: string): boolean => indicator(colId).classList.contains('ag-show-values-as-dormant');
const ariaText = (): string => document.querySelector('.ag-aria-description-container')?.textContent ?? '';

describe('showValuesAs header indicator', () => {
    const gridMgr = new TestGridsManager({
        modules: [ClientSideRowModelModule, RowGroupingModule, ShowValuesAsModule, TreeDataModule, PivotModule],
    });

    afterEach(() => {
        gridMgr.reset();
    });

    test('the indicator reflects active / dormant / off, honours suppress, and updates reactively', async () => {
        const api = await gridMgr.createGridAndWait('sva-indicator', {
            columnDefs: [
                { field: 'amount', aggFunc: 'sum', showValuesAs: 'percentOfGrandTotal' }, // applies on a flat grid
                { field: 'units', aggFunc: 'sum', showValuesAs: 'percentOfParentRowTotal' }, // dormant — no hierarchy
                { field: 'price', aggFunc: 'sum' }, // no mode
                {
                    field: 'cost',
                    aggFunc: 'sum',
                    showValuesAs: 'percentOfGrandTotal',
                    showValuesAsDef: { suppressHeaderIndicator: true },
                },
            ],
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', amount: 25, units: 4, price: 1, cost: 5 },
                { id: '2', amount: 75, units: 6, price: 2, cost: 5 },
            ],
        });

        expect(isShown('amount')).toBe(true); // applying
        expect(isDormant('amount')).toBe(false);
        expect(isShown('units')).toBe(true); // dormant — shown but muted
        expect(isDormant('units')).toBe(true);
        expect(isShown('price')).toBe(false); // no mode
        expect(isShown('cost')).toBe(false); // suppressed despite an active mode

        // amount/cost (%grandTotal) applying → percentages; units (%parentTotal, flat) dormant → raw; price has no mode.
        await new GridColumns(api, 'indicator mixed modes').checkColumns(`
            CENTER
            ├── amount "Amount" width:200 aggFunc:sum %:percentOfGrandTotal
            ├── units "Units" width:200 aggFunc:sum %:percentOfParentRowTotal
            ├── price "Price" width:200 aggFunc:sum
            └── cost "Cost" width:200 aggFunc:sum %:percentOfGrandTotal
        `);
        await new GridRows(api, 'indicator mixed modes').check(`
            ROOT id:ROOT_NODE_ID amount:"100.00%" units:"#N/A" price:3 cost:"100.00%"
            ├── LEAF id:1 amount:"25.00%" units:"#N/A" price:1 cost:"50.00%"
            └── LEAF id:2 amount:"75.00%" units:"#N/A" price:2 cost:"50.00%"
        `);

        api.applyColumnState({ state: [{ colId: 'amount', showValuesAs: null }] });
        await asyncSetTimeout(0);
        expect(isShown('amount')).toBe(false);

        api.applyColumnState({ state: [{ colId: 'amount', showValuesAs: 'percentOfGrandTotal' }] });
        await asyncSetTimeout(0);
        expect(isShown('amount')).toBe(true);
        expect(isDormant('amount')).toBe(false);

        // Active-to-active switch to a mode with DIFFERENT applicability: the header recomputes dormancy even
        // though `showValuesAs` stayed non-null (the applicability memo is rebuilt on every mode change, and the
        // header refreshes on the columnStateUpdated the switch dispatches).
        api.applyColumnState({ state: [{ colId: 'amount', showValuesAs: 'percentOfParentRowTotal' }] });
        await asyncSetTimeout(0);
        expect(isShown('amount')).toBe(true);
        expect(isDormant('amount')).toBe(true); // flat grid → parent-total is dormant
    });

    test('enableShowValuesAs:false hides the selection menu but keeps the indicator — the values are still transformed', async () => {
        // The indicator is informational: it signals the displayed values aren't raw. It tracks an active mode (and
        // `suppressHeaderIndicator`), independent of `enableShowValuesAs`, which governs only the selection menu.
        const api = await gridMgr.createGridAndWait('sva-indicator-disabled-ui', {
            columnDefs: [
                {
                    field: 'amount',
                    aggFunc: 'sum',
                    showValuesAs: 'percentOfGrandTotal',
                    enableShowValuesAs: false, // hides the selection menu; transform + indicator still show
                },
            ],
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', amount: 25 },
                { id: '2', amount: 75 },
            ],
        });

        expect(isShown('amount')).toBe(true); // indicator shown — a mode is active
        expect(isDormant('amount')).toBe(false); // and applying

        await new GridRows(api, 'enableShowValuesAs false transform still runs').check(`
            ROOT id:ROOT_NODE_ID amount:"100.00%"
            ├── LEAF id:1 amount:"25.00%"
            └── LEAF id:2 amount:"75.00%"
        `);
    });

    test('a parent-total indicator goes from dormant to active when grouping is added', async () => {
        const api = await gridMgr.createGridAndWait('sva-indicator-group', {
            columnDefs: [
                { field: 'country' },
                { field: 'amount', aggFunc: 'sum', showValuesAs: 'percentOfParentRowTotal' },
            ],
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', country: 'A', amount: 25 },
                { id: '2', country: 'B', amount: 75 },
            ],
        });

        expect(isDormant('amount')).toBe(true); // flat — no parent

        // Flat → %parentTotal dormant → raw amounts.
        await new GridColumns(api, 'flat dormant').checkColumns(`
            CENTER
            ├── country "Country" width:200
            └── amount "Amount" width:200 aggFunc:sum %:percentOfParentRowTotal
        `);
        await new GridRows(api, 'flat dormant').check(`
            ROOT id:ROOT_NODE_ID amount:"#N/A"
            ├── LEAF id:1 country:"A" amount:"#N/A"
            └── LEAF id:2 country:"B" amount:"#N/A"
        `);

        api.applyColumnState({ state: [{ colId: 'country', rowGroup: true }] });
        // `amount` was dormant before the grouping was added, so this cannot pass before it lands.
        await waitFor(() => expect(isDormant('amount')).toBe(false)); // now meaningful
        expect(isShown('amount')).toBe(true);

        // Grouping added → %parentTotal applies → percentages.
        await new GridColumns(api, 'after grouping added').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            ├── country "Country" width:200 rowGroup
            └── amount "Amount" width:200 aggFunc:sum %:percentOfParentRowTotal
        `);
        await new GridRows(api, 'after grouping added').check(`
            ROOT id:ROOT_NODE_ID amount:null
            ├─┬ LEAF_GROUP collapsed id:row-group-country-A ag-Grid-AutoColumn:"A" amount:"25.00%"
            │ └── LEAF hidden id:1 country:"A" amount:"100.00%"
            └─┬ LEAF_GROUP collapsed id:row-group-country-B ag-Grid-AutoColumn:"B" amount:"75.00%"
            · └── LEAF hidden id:2 country:"B" amount:"100.00%"
        `);
    });

    test('focusing the header announces an applying mode for screen readers', async () => {
        const api = await gridMgr.createGridAndWait('sva-indicator-aria-on', {
            columnDefs: [{ field: 'amount', aggFunc: 'sum', showValuesAs: 'percentOfGrandTotal' }],
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', amount: 25 },
                { id: '2', amount: 75 },
            ],
        });

        api.setFocusedHeader('amount');
        await waitFor(() => expect(ariaText()).toContain('Showing Values As % of Grand Total'));
    });

    test('focusing the header after its mode changes announces the mode while on, and none once it is off', async () => {
        const api = await gridMgr.createGridAndWait('sva-indicator-aria-follows', {
            columnDefs: [{ field: 'id' }, { field: 'amount', aggFunc: 'sum' }],
            getRowId: (params) => params.data.id,
            rowData: [
                { id: '1', amount: 25 },
                { id: '2', amount: 75 },
            ],
        });
        const refocusAmount = () => {
            api.setFocusedHeader('id');
            api.setFocusedHeader('amount');
        };

        refocusAmount();
        // described by its sorting alone, with no mode yet: the positive control for the later absences
        await waitFor(() => {
            const text = ariaText();
            expect(text).toContain('sort');
            expect(text).not.toContain('Showing Values As');
        });

        api.applyColumnState({ state: [{ colId: 'amount', showValuesAs: 'percentOfGrandTotal' }] });
        refocusAmount();
        await waitFor(() => expect(ariaText()).toContain('Showing Values As % of Grand Total'));

        api.applyColumnState({ state: [{ colId: 'amount', showValuesAs: null }] });
        refocusAmount();
        await waitFor(() => {
            const text = ariaText();
            expect(text).toContain('sort');
            expect(text).not.toContain('Showing Values As');
        });
    });

    test('a dormant mode is not announced — the raw value is shown', async () => {
        const api = await gridMgr.createGridAndWait('sva-indicator-aria-dormant', {
            // Flat grid: percentOfParentRowTotal is dormant, so no transform to announce.
            columnDefs: [{ field: 'amount', aggFunc: 'sum', showValuesAs: 'percentOfParentRowTotal' }],
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', amount: 25 },
                { id: '2', amount: 75 },
            ],
        });

        api.setFocusedHeader('amount');
        // The header still announces (proving the description ran), but without the transform.
        await waitFor(() => expect(ariaText()).toContain('sort'));
        expect(ariaText()).not.toContain('Showing Values As');
    });

    test('a grid created grouped shows its parent-total indicator as applying, and announces the mode', async () => {
        const api = await gridMgr.createGridAndWait('sva-indicator-created-grouped', {
            columnDefs: [
                { field: 'country', rowGroup: true },
                { field: 'amount', aggFunc: 'sum', showValuesAs: 'percentOfParentRowTotal' },
            ],
            getRowId: (params) => params.data.id,
            rowData: [
                { id: '1', country: 'A', amount: 25 },
                { id: '2', country: 'B', amount: 75 },
            ],
        });

        expect({ shown: isShown('amount'), dormant: isDormant('amount') }).toEqual({ shown: true, dormant: false });

        api.setFocusedHeader('amount');
        await waitFor(() => expect(ariaText()).toContain('Showing Values As'));
    });

    test('a grid created with tree data shows its parent-total indicator as applying, and announces the mode', async () => {
        const api = await gridMgr.createGridAndWait('sva-indicator-created-tree', {
            treeData: true,
            columnDefs: [{ field: 'amount', aggFunc: 'sum', showValuesAs: 'percentOfParentRowTotal' }],
            getRowId: (params) => params.data.id,
            getDataPath: (d) => d.path,
            rowData: [
                { id: '1', path: ['A'], amount: 25 },
                { id: '2', path: ['A', 'B'], amount: 75 },
                { id: '3', path: ['C'], amount: 50 },
            ],
        });

        expect({ shown: isShown('amount'), dormant: isDormant('amount') }).toEqual({ shown: true, dormant: false });

        api.setFocusedHeader('amount');
        await waitFor(() => expect(ariaText()).toContain('Showing Values As'));
    });

    test("focusing the header announces a mode only while the grid's grouping, pivot or tree data lets it apply", async () => {
        const api = await gridMgr.createGridAndWait('sva-indicator-aria-hierarchy', {
            // the header name then never changes with the grouping, so only the show-values state can refresh the text
            suppressAggFuncInHeader: true,
            columnDefs: [
                { field: 'country' },
                { field: 'sport' },
                { field: 'amount', aggFunc: 'sum', showValuesAs: 'percentOfParentRowTotal' },
            ],
            getRowId: (params) => params.data.id,
            getDataPath: (d) => d.path,
            rowData: [
                { id: '1', path: ['A'], country: 'A', sport: 'x', amount: 25 },
                { id: '2', path: ['A', 'B'], country: 'A', sport: 'y', amount: 75 },
                { id: '3', path: ['C'], country: 'C', sport: 'x', amount: 50 },
            ],
        });

        // `other` must exist in the step: pivot mode hides the row group column country
        const expectAnnouncement = async (step: string, applies: boolean, other = 'country') => {
            api.setFocusedHeader(other);
            api.setFocusedHeader('amount');
            await waitFor(() => {
                const text = ariaText();
                // the amount header's own description (its sort instruction) is the positive signal for absence
                expect(text).toContain('sort');
                expect({ step, announced: text.includes('Showing Values As') }).toEqual({ step, announced: applies });
            });
            expect({ step, dormant: isDormant('amount') }).toEqual({ step, dormant: !applies });
        };

        await expectAnnouncement('flat', false);

        api.setGridOption('treeData', true);
        await expectAnnouncement('tree data on', true);

        api.setGridOption('treeData', false);
        await expectAnnouncement('tree data off', false);

        api.applyColumnState({ state: [{ colId: 'country', rowGroup: true }] });
        await expectAnnouncement('row group added', true);

        api.setRowGroupColumns([]);
        await expectAnnouncement('row group removed', false);

        api.setRowGroupColumns(['country']);
        api.setGridOption('pivotMode', true);
        await expectAnnouncement('pivot mode with a row group', true, 'ag-Grid-AutoColumn');

        api.setGridOption('pivotMode', false);
        api.setRowGroupColumns([]);
        await expectAnnouncement('pivot mode off, no row group', false);
    });

    test("a mode set by a listener of another column's visibility change shows its indicator as applying, and announces the mode", async () => {
        const api = await gridMgr.createGridAndWait('sva-indicator-listener', {
            columnDefs: [{ field: 'country', rowGroup: true }, { field: 'sport' }, { field: 'amount', aggFunc: 'sum' }],
            getRowId: (params) => params.data.id,
            rowData: [
                { id: '1', country: 'A', sport: 'x', amount: 25 },
                { id: '2', country: 'B', sport: 'y', amount: 75 },
            ],
        });
        expect({ shown: isShown('amount'), dormant: isDormant('amount') }).toEqual({ shown: false, dormant: false });

        api.getColumn('sport')!.addEventListener('visibleChanged', () =>
            api.applyColumnState({ state: [{ colId: 'amount', showValuesAs: 'percentOfParentRowTotal' }] })
        );
        api.setColumnsVisible(['sport'], false);

        await waitFor(() =>
            expect({ shown: isShown('amount'), dormant: isDormant('amount') }).toEqual({ shown: true, dormant: false })
        );
        api.setFocusedHeader('amount');
        await waitFor(() => expect(ariaText()).toContain('Showing Values As'));
    });

    test('the indicator follows a mode set, then cleared, through the column definitions', async () => {
        const defs = (amountMode?: 'percentOfGrandTotal' | null) => [
            { field: 'amount', aggFunc: 'sum', showValuesAs: amountMode },
            { field: 'units', aggFunc: 'sum' },
        ];
        const api = await gridMgr.createGridAndWait('sva-indicator-coldefs', {
            columnDefs: defs(),
            getRowId: (params) => params.data.id,
            rowData: [
                { id: '1', amount: 25, units: 4 },
                { id: '2', amount: 75, units: 6 },
            ],
        });
        const observe = () => ({
            amount: { shown: isShown('amount'), dormant: isDormant('amount') },
            units: { shown: isShown('units'), dormant: isDormant('units') },
        });

        expect(observe()).toEqual({
            amount: { shown: false, dormant: false },
            units: { shown: false, dormant: false },
        });

        api.setGridOption('columnDefs', defs('percentOfGrandTotal'));
        await waitFor(() =>
            expect(observe()).toEqual({
                amount: { shown: true, dormant: false },
                units: { shown: false, dormant: false },
            })
        );
        expect(indicator('amount').title).toContain('Grand Total');

        api.setGridOption('columnDefs', defs(null));
        await waitFor(() =>
            expect(observe()).toEqual({
                amount: { shown: false, dormant: false },
                units: { shown: false, dormant: false },
            })
        );
    });

    test('a custom header component keeps its own DOM through sort, grouping, value, show-values and pin changes', async () => {
        // x has no refresh method; y has one returning true; d is a default header beside them.
        class NoRefreshHeader {
            private eGui = document.createElement('div');
            init(params: IHeaderParams): void {
                this.eGui.className = 'custom-header-x';
                this.eGui.textContent = `custom ${params.displayName}`;
            }
            getGui(): HTMLElement {
                return this.eGui;
            }
        }
        class RefreshHeader {
            private eGui = document.createElement('div');
            init(params: IHeaderParams): void {
                this.eGui.className = 'custom-header-y';
                this.eGui.textContent = `custom ${params.displayName}`;
            }
            getGui(): HTMLElement {
                return this.eGui;
            }
            refresh(): boolean {
                return true;
            }
        }

        const api = await gridMgr.createGridAndWait('sva-custom-header', {
            // a custom header without refresh is rebuilt when its displayName changes; the name stays fixed here
            suppressAggFuncInHeader: true,
            columnDefs: [
                { colId: 'g', field: 'g' },
                { colId: 'x', field: 'x', aggFunc: 'sum', headerComponent: NoRefreshHeader },
                { colId: 'y', field: 'y', aggFunc: 'sum', headerComponent: RefreshHeader },
                { colId: 'd', field: 'd', aggFunc: 'sum' },
            ],
            getRowId: (params) => params.data.id,
            rowData: [
                { id: '1', g: 'a', x: 1, y: 2, d: 3 },
                { id: '2', g: 'b', x: 4, y: 5, d: 6 },
            ],
        });

        const header = (colId: string) => document.querySelector<HTMLElement>(`.ag-header-cell[col-id="${colId}"]`);
        const own = (colId: string) =>
            header(colId)?.querySelector<HTMLElement>(colId === 'x' ? '.custom-header-x' : '.custom-header-y') ?? null;
        const sortedClassesIn = (el: HTMLElement | null): string[] =>
            el
                ? [el, ...Array.from(el.querySelectorAll<HTMLElement>('*'))].flatMap((e) =>
                      Array.from(e.classList).filter((c) => c.startsWith('ag-header-cell-sorted-'))
                  )
                : ['<missing>'];
        const defaultLabelClasses = () =>
            Array.from(header('d')?.querySelector('.ag-cell-label-container')?.classList ?? []).filter((c) =>
                c.startsWith('ag-header-cell-sorted-')
            );

        const x0 = own('x')!;
        const y0 = own('y')!;
        expect({ x: x0?.textContent, y: y0?.textContent }).toEqual({ x: 'custom X', y: 'custom Y' });

        // the observed state of the custom headers, `===` the elements captured at the start
        const customState = () => ({
            xSame: own('x') === x0,
            ySame: own('y') === y0,
            xText: x0.textContent,
            yText: y0.textContent,
            xSorted: sortedClassesIn(x0),
            ySorted: sortedClassesIn(y0),
            xAria: header('x')?.getAttribute('aria-sort') ?? null,
            yAria: header('y')?.getAttribute('aria-sort') ?? null,
        });
        const expectCustomKept = (ariaSort: string | null) =>
            expect(customState()).toEqual({
                xSame: true,
                ySame: true,
                xText: 'custom X',
                yText: 'custom Y',
                xSorted: [],
                ySorted: [],
                xAria: ariaSort,
                yAria: ariaSort,
            });

        api.applyColumnState({
            state: [
                { colId: 'x', sort: 'asc', sortIndex: 0 },
                { colId: 'y', sort: 'asc', sortIndex: 1 },
                { colId: 'd', sort: 'asc', sortIndex: 2 },
            ],
        });
        await waitFor(() => expect(defaultLabelClasses()).toEqual(['ag-header-cell-sorted-asc']));
        expectCustomKept('ascending');

        api.setRowGroupColumns(['g']);
        await waitFor(() => expect(header('ag-Grid-AutoColumn')).not.toBeNull());
        expectCustomKept('ascending');
        api.setRowGroupColumns([]);
        await waitFor(() => expect(header('ag-Grid-AutoColumn')).toBeNull());
        expectCustomKept('ascending');

        api.setValueColumns(['y', 'd']);
        expect(api.getColumnState().map((c) => [c.colId, c.aggFunc ?? null])).toEqual([
            ['g', null],
            ['x', null],
            ['y', 'sum'],
            ['d', 'sum'],
        ]);
        expectCustomKept('ascending');
        api.setValueColumns(['x', 'y', 'd']);
        expect(api.getColumnState().map((c) => [c.colId, c.aggFunc ?? null])).toEqual([
            ['g', null],
            ['x', 'sum'],
            ['y', 'sum'],
            ['d', 'sum'],
        ]);
        await asyncSetTimeout(0);
        expect(defaultLabelClasses()).toEqual(['ag-header-cell-sorted-asc']);
        expectCustomKept('ascending');

        api.applyColumnState({
            state: [
                { colId: 'x', showValuesAs: 'percentOfGrandTotal' },
                { colId: 'y', showValuesAs: 'percentOfGrandTotal' },
            ],
        });
        expect(api.getColumnState().map((c) => [c.colId, c.showValuesAs ?? null])).toEqual([
            ['g', null],
            ['x', 'percentOfGrandTotal'],
            ['y', 'percentOfGrandTotal'],
            ['d', null],
        ]);
        await asyncSetTimeout(0);
        expectCustomKept('ascending');

        api.applyColumnState({ state: [{ colId: 'x', pinned: 'left' }] });
        await waitFor(() => expect(api.getColumnState().find((c) => c.colId === 'x')?.pinned).toBe('left'));
        const pinned = own('x')!;
        expect({
            text: pinned.textContent,
            sorted: sortedClassesIn(pinned),
            aria: header('x')?.getAttribute('aria-sort'),
            yKept: own('y') === y0,
            ySorted: sortedClassesIn(y0),
            yAria: header('y')?.getAttribute('aria-sort'),
            d: defaultLabelClasses(),
        }).toEqual({
            text: 'custom X',
            sorted: [],
            aria: 'ascending',
            yKept: true,
            ySorted: [],
            yAria: 'ascending',
            d: ['ag-header-cell-sorted-asc'],
        });
    });
});
