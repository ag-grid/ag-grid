import { waitFor } from '@testing-library/dom';

import type { GridApi, IAggFunc, IRowNode } from 'ag-grid-community';
import { ClientSideRowModelModule, LocaleModule } from 'ag-grid-community';
import { ColumnMenuModule, RowGroupingModule, ShowValueAsModule } from 'ag-grid-enterprise';

import { GridColumns, GridRows, TestGridsManager, asyncSetTimeout, nextAnimationFrame } from '../test-utils';

let restoreOffsetParent: (() => void) | undefined;

function enableOffsetParentPolyfill(): void {
    if (restoreOffsetParent) {
        return;
    }
    const original = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetParent');
    Object.defineProperty(HTMLElement.prototype, 'offsetParent', {
        configurable: true,
        get(this: HTMLElement) {
            return this.closest('.ag-measurement-container') ? null : this.parentElement;
        },
    });
    restoreOffsetParent = () => {
        if (original) {
            Object.defineProperty(HTMLElement.prototype, 'offsetParent', original);
        }
        restoreOffsetParent = undefined;
    };
}

function leaf(api: GridApi, id: string): IRowNode {
    const node = api.getRowNode(id);
    if (!node) {
        throw new Error(`Leaf '${id}' not found`);
    }
    return node;
}

function menuOption(name: string): HTMLElement | null {
    const text = Array.from(document.querySelectorAll<HTMLElement>('.ag-menu-option-text')).find(
        (el) => el.textContent?.trim() === name
    );
    return text?.closest<HTMLElement>('.ag-menu-option') ?? null;
}

async function openMenuOption(name: string): Promise<HTMLElement> {
    return waitFor(() => {
        const option = menuOption(name);
        expect(option).toBeTruthy();
        return option!;
    });
}

/** Opens a column's menu and its "Show Values As" submenu; resolves once the submenu has rendered. */
async function openShowValueAsSubmenu(api: GridApi, colKey: string): Promise<void> {
    enableOffsetParentPolyfill();
    api.showColumnMenu(colKey);
    const parent = await openMenuOption('Show Values As');
    parent.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    await openMenuOption('% of Grand Total'); // an always-applicable item — confirms the submenu is open
}

describe('showValueAs column menu', () => {
    const gridMgr = new TestGridsManager({
        modules: [ClientSideRowModelModule, LocaleModule, ColumnMenuModule, RowGroupingModule, ShowValueAsModule],
    });

    afterEach(() => {
        gridMgr.reset();
        restoreOffsetParent?.();
    });

    test('the submenu is offered on value, numeric and opted-in columns — not on plain non-numeric columns', async () => {
        const captured: Record<string, string[]> = {};
        const api = await gridMgr.createGridAndWait('sva-menu-gate', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'region' }, // text, no aggFunc / showValueAs → not eligible
                { field: 'score' }, // numeric, no aggFunc → eligible (promotable)
                { field: 'units', aggFunc: 'sum' }, // value column, no showValueAs → eligible
                { field: 'amount', aggFunc: 'sum', showValueAs: 'percentOfGrandTotal' }, // opted in → eligible
            ],
            groupDefaultExpanded: -1,
            getMainMenuItems: (params) => {
                captured[params.column?.getColId() ?? ''] = params.defaultItems.slice();
                return params.defaultItems;
            },
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', country: 'A', region: 'X', amount: 25, units: 4, score: 10 },
                { id: '2', country: 'B', region: 'Y', amount: 75, units: 6, score: 20 },
            ],
        });

        await new GridColumns(api, 'sva-menu-gate columns').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            ├── region "Region" width:200
            ├── score "Score" width:200
            ├── units "Units" width:200 aggFunc:sum
            └── amount "Amount" width:200 aggFunc:sum showValueAs:percentOfGrandTotal
        `);
        await new GridRows(api, 'sva-menu-gate rows').check(`
            ROOT id:ROOT_NODE_ID units:10 amount:"100.00%"
            ├─┬ LEAF_GROUP id:row-group-country-A ag-Grid-AutoColumn:"A" units:4 amount:"25.00%"
            │ └── LEAF id:1 country:"A" region:"X" score:10 units:4 amount:"25.00%"
            └─┬ LEAF_GROUP id:row-group-country-B ag-Grid-AutoColumn:"B" units:6 amount:"75.00%"
            · └── LEAF id:2 country:"B" region:"Y" score:20 units:6 amount:"75.00%"
        `);

        enableOffsetParentPolyfill();
        for (const colId of ['amount', 'units', 'score', 'region']) {
            api.showColumnMenu(colId);
            await waitFor(() => expect(captured[colId]).toBeTruthy());
            api.hidePopupMenu();
            await asyncSetTimeout(10);
        }

        expect(captured['amount']).toContain('showValueAsSubMenu'); // opted in
        expect(captured['units']).toContain('showValueAsSubMenu'); // value column
        expect(captured['score']).toContain('showValueAsSubMenu'); // numeric — promotable
        expect(captured['region']).not.toContain('showValueAsSubMenu'); // non-numeric, not opted in
    });

    test('showValueAsConfig false/null disables the menu; showValueAs false/null only clears the selection', async () => {
        const captured: Record<string, string[]> = {};
        const api = await gridMgr.createGridAndWait('sva-menu-optout', {
            // `showValueAs` is the selector: false/null clear the mode but the menu stays. Only `showValueAsConfig`
            // false/null disables the feature + menu (`defaultColDef.showValueAs` provides the inherited selection).
            defaultColDef: { showValueAs: 'percentOfGrandTotal' },
            columnDefs: [
                { field: 'a', aggFunc: 'sum' }, // inherits the mode → offered + active
                { field: 'b', aggFunc: 'sum', showValueAs: false }, // clears inherited mode, menu still offered
                { field: 'c', aggFunc: 'sum', showValueAs: null }, // clears inherited mode, menu still offered
                { field: 'd', aggFunc: 'sum', showValueAsConfig: false }, // feature off → no menu
                { field: 'e', aggFunc: 'sum', showValueAsConfig: null }, // feature off → no menu
            ],
            getMainMenuItems: (params) => {
                captured[params.column?.getColId() ?? ''] = params.defaultItems.slice();
                return params.defaultItems;
            },
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', a: 1, b: 2, c: 3, d: 4, e: 5 },
                { id: '2', a: 6, b: 7, c: 8, d: 9, e: 10 },
            ],
        });

        enableOffsetParentPolyfill();
        for (const colId of ['a', 'b', 'c', 'd', 'e']) {
            api.showColumnMenu(colId);
            await waitFor(() => expect(captured[colId]).toBeTruthy());
            api.hidePopupMenu();
            await asyncSetTimeout(10);
        }

        expect(captured['a']).toContain('showValueAsSubMenu'); // inherits the mode → offered
        expect(captured['b']).toContain('showValueAsSubMenu'); // showValueAs:false clears the mode, menu stays
        expect(captured['c']).toContain('showValueAsSubMenu'); // showValueAs:null clears the mode, menu stays
        expect(captured['d']).not.toContain('showValueAsSubMenu'); // showValueAsConfig:false → feature off
        expect(captured['e']).not.toContain('showValueAsSubMenu'); // showValueAsConfig:null → feature off

        // The selection: 'a' inherited the mode; 'b'/'c' cleared it; the config-disabled columns have none.
        const stateOf = (colId: string) => api.getColumnState().find((s) => s.colId === colId)?.showValueAs ?? null;
        expect(stateOf('a')).toBe('percentOfGrandTotal');
        expect(stateOf('b')).toBeNull();
        expect(stateOf('c')).toBeNull();
        expect(stateOf('d')).toBeNull();

        // A cleared column is still overridable per-column at runtime (the menu's path): applying a mode sticks.
        api.applyColumnState({ state: [{ colId: 'b', showValueAs: 'percentOfGrandTotal' }] });
        expect(stateOf('b')).toBe('percentOfGrandTotal');
    });

    test('selecting an aggregation mode promotes a non-aggregated numeric column; None keeps it a value column', async () => {
        const api = await gridMgr.createGridAndWait('sva-menu-promote', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'amount' }, // numeric, NO aggFunc
            ],
            groupDefaultExpanded: -1,
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', country: 'A', amount: 30 },
                { id: '2', country: 'A', amount: 10 },
                { id: '3', country: 'B', amount: 60 }, // grand 100
            ],
        });

        expect(api.getColumn('amount')!.isValueActive()).toBe(false);

        await openShowValueAsSubmenu(api, 'amount');
        (await openMenuOption('% of Grand Total')).click();
        await asyncSetTimeout(10);

        // Promoted to a value column (default sum), showing the grand-total percentage.
        expect(api.getColumn('amount')!.isValueActive()).toBe(true);
        expect(api.getCellValue({ rowNode: leaf(api, '1'), colKey: 'amount', from: 'transformed' })).toBeCloseTo(0.3);

        await new GridColumns(api, 'promote percentOfGrandTotal').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            └── amount "Amount" width:200 aggFunc:sum showValueAs:percentOfGrandTotal
        `);
        await new GridRows(api, 'promote percentOfGrandTotal').check(`
            ROOT id:ROOT_NODE_ID amount:"100.00%"
            ├─┬ LEAF_GROUP id:row-group-country-A ag-Grid-AutoColumn:"A" amount:"40.00%"
            │ ├── LEAF id:1 country:"A" amount:"30.00%"
            │ └── LEAF id:2 country:"A" amount:"10.00%"
            └─┬ LEAF_GROUP id:row-group-country-B ag-Grid-AutoColumn:"B" amount:"60.00%"
            · └── LEAF id:3 country:"B" amount:"60.00%"
        `);

        api.hidePopupMenu();
        await asyncSetTimeout(10);
        await openShowValueAsSubmenu(api, 'amount');
        (await openMenuOption('None')).click();
        await asyncSetTimeout(10);

        // None keeps the field a value column (Excel "No Calculation"), showing the raw aggregate.
        expect(api.getColumn('amount')!.isValueActive()).toBe(true);
        expect(api.getCellValue({ rowNode: leaf(api, '1'), colKey: 'amount', from: 'transformed' })).toBe(30);

        await new GridColumns(api, 'promote None').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            └── amount "Amount" width:200 aggFunc:sum
        `);
        await new GridRows(api, 'promote None').check(`
            ROOT id:ROOT_NODE_ID amount:100
            ├─┬ LEAF_GROUP id:row-group-country-A ag-Grid-AutoColumn:"A" amount:40
            │ ├── LEAF id:1 country:"A" amount:30
            │ └── LEAF id:2 country:"A" amount:10
            └─┬ LEAF_GROUP id:row-group-country-B ag-Grid-AutoColumn:"B" amount:60
            · └── LEAF id:3 country:"B" amount:60
        `);
    });

    test('base picker: "% Of" lists base fields → items; choosing one shows each group as % of that item', async () => {
        const api = await gridMgr.createGridAndWait('sva-base-picker', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'amount', aggFunc: 'sum', showValueAs: 'percentOfGrandTotal' },
            ],
            groupDefaultExpanded: -1,
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', country: 'A', amount: 40 },
                { id: '2', country: 'A', amount: 10 },
                { id: '3', country: 'B', amount: 60 },
                { id: '4', country: 'B', amount: 40 },
            ],
        });

        enableOffsetParentPolyfill();
        api.showColumnMenu('amount');
        const parent = await openMenuOption('Show Values As');
        parent.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
        const pctOf = await openMenuOption('% Of');
        pctOf.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
        const country = await openMenuOption('Country'); // the base field (a row-group dimension)
        country.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
        (await openMenuOption('B')).click(); // the base item
        await asyncSetTimeout(10);

        // Each value as a % of B's total (100): groups A=50%/B=100%; leaves as a share of B's total too.
        await new GridColumns(api, 'base picker % Of').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            └── amount "Amount" width:200 aggFunc:sum showValueAs:percentOf
        `);
        await new GridRows(api, 'base picker % Of').check(`
            ROOT id:ROOT_NODE_ID amount:null
            ├─┬ LEAF_GROUP id:row-group-country-A ag-Grid-AutoColumn:"A" amount:"50.00%"
            │ ├── LEAF id:1 country:"A" amount:"40.00%"
            │ └── LEAF id:2 country:"A" amount:"10.00%"
            └─┬ LEAF_GROUP id:row-group-country-B ag-Grid-AutoColumn:"B" amount:"100.00%"
            · ├── LEAF id:3 country:"B" amount:"60.00%"
            · └── LEAF id:4 country:"B" amount:"40.00%"
        `);
    });

    test('base picker: "Another column" submenu compares against another measure', async () => {
        const api = await gridMgr.createGridAndWait('sva-base-column', {
            columnDefs: [
                { field: 'country' },
                { field: 'gold', aggFunc: 'sum' },
                { field: 'silver', aggFunc: 'sum', showValueAs: 'percentOfGrandTotal' },
            ],
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', country: 'A', gold: 10, silver: 40 },
                { id: '2', country: 'B', gold: 30, silver: 60 },
            ],
        });

        enableOffsetParentPolyfill();
        api.showColumnMenu('silver');
        const parent = await openMenuOption('Show Values As');
        parent.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
        const pctOf = await openMenuOption('% Of');
        pctOf.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
        const anotherColumn = await openMenuOption('Another column');
        anotherColumn.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
        (await openMenuOption('Gold')).click(); // silver as a % of gold
        await asyncSetTimeout(10);

        // silver ÷ gold at row 1 = 40 / 10.
        expect(api.getCellValue({ rowNode: leaf(api, '1'), colKey: 'silver', from: 'transformed' })).toBeCloseTo(4);
        await new GridRows(api, 'base picker another column').check(`
            ROOT id:ROOT_NODE_ID gold:40 silver:"250.00%"
            ├── LEAF id:1 country:"A" gold:10 silver:"400.00%"
            └── LEAF id:2 country:"B" gold:30 silver:"200.00%"
        `);
    });

    test("an inactive mode's submenu shows no checked option — its default is not ticked when it isn't selected", async () => {
        const api = await gridMgr.createGridAndWait('sva-inactive-submenu', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                // The active mode is percentOfGrandTotal, so "% of Parent Total" is NOT the current selection.
                { field: 'amount', aggFunc: 'sum', showValueAs: 'percentOfGrandTotal' },
            ],
            groupDefaultExpanded: -1,
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', country: 'A', amount: 40 },
                { id: '2', country: 'B', amount: 60 },
            ],
        });

        enableOffsetParentPolyfill();
        api.showColumnMenu('amount');
        const parent = await openMenuOption('Show Values As');
        parent.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
        const parentTotal = await openMenuOption('% of Parent Total');
        parentTotal.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));

        // "% of Parent Total" is not the active mode, so its default "Top level" must not show a checkmark.
        const topLevel = await openMenuOption('Top level');
        expect(topLevel.querySelector('.ag-icon-tick')).toBeFalsy();
    });

    test('base picker: "Custom value…" opens a number-input popup that commits a constant base', async () => {
        const api = await gridMgr.createGridAndWait('sva-constant', {
            columnDefs: [{ field: 'country' }, { field: 'amount', aggFunc: 'sum', showValueAs: 'percentOfGrandTotal' }],
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', country: 'A', amount: 40 },
                { id: '2', country: 'B', amount: 60 },
            ],
        });

        enableOffsetParentPolyfill();
        api.showColumnMenu('amount');
        const parent = await openMenuOption('Show Values As');
        parent.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
        const pctOf = await openMenuOption('% Of');
        pctOf.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
        (await openMenuOption('Custom value…')).click();

        const input = await waitFor(() => {
            const el = document.querySelector<HTMLInputElement>('.ag-show-value-as-value-popup input');
            expect(el).toBeTruthy();
            return el!;
        });
        input.value = '50';
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        await asyncSetTimeout(10);

        // percentOf with the constant base 50: amount 40 → 40 / 50.
        expect(api.getCellValue({ rowNode: leaf(api, '1'), colKey: 'amount', from: 'transformed' })).toBeCloseTo(0.8);

        await new GridColumns(api, 'custom value base').checkColumns(`
            CENTER
            ├── country "Country" width:200
            └── amount "Amount" width:200 aggFunc:sum showValueAs:percentOf
        `);
        await new GridRows(api, 'custom value base').check(`
            ROOT id:ROOT_NODE_ID amount:"200.00%"
            ├── LEAF id:1 country:"A" amount:"80.00%"
            └── LEAF id:2 country:"B" amount:"120.00%"
        `);
    });

    test('base picker: "Custom value…" pre-fills a configured bigint constant base (stringified)', async () => {
        const api = await gridMgr.createGridAndWait('sva-bigint-prefill', {
            columnDefs: [
                { field: 'country' },
                {
                    field: 'amount',
                    cellDataType: 'bigint',
                    aggFunc: 'sum',
                    showValueAs: { type: 'percentOf', params: { base: { value: 100n } } },
                },
            ],
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', country: 'A', amount: 40n },
                { id: '2', country: 'B', amount: 60n },
            ],
        });

        enableOffsetParentPolyfill();
        api.showColumnMenu('amount');
        const parent = await openMenuOption('Show Values As');
        parent.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
        const pctOf = await openMenuOption('% Of');
        pctOf.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
        (await openMenuOption('Custom value…')).click();

        const input = await waitFor(() => {
            const el = document.querySelector<HTMLInputElement>('.ag-show-value-as-value-popup input');
            expect(el).toBeTruthy();
            return el!;
        });
        // A bigint base constant is stringified for the input; it must not be dropped to a blank field.
        expect(input.value).toBe('100');
    });

    test('opening the value popup while one is already shown replaces it — the dialogs never stack', async () => {
        const api = await gridMgr.createGridAndWait('sva-popup-replace', {
            columnDefs: [
                { field: 'country' },
                {
                    field: 'amount',
                    aggFunc: 'sum',
                    showValueAs: 'percentOf',
                    showValueAsConfig: {
                        modes: {
                            // A single-option menu (collapses to this action) that opens the value editor twice in
                            // a row — the user opening a second dialog while the first is still shown.
                            percentOf: {
                                menu: (p) => [
                                    {
                                        name: 'Custom value…',
                                        action: () => {
                                            p.editValue(() => {});
                                            p.editValue(() => {});
                                        },
                                    },
                                ],
                            },
                        },
                    },
                },
            ],
            getRowId: ({ data }) => data.id,
            rowData: [{ id: '1', country: 'A', amount: 40 }],
        });

        enableOffsetParentPolyfill();
        api.showColumnMenu('amount');
        const parent = await openMenuOption('Show Values As');
        parent.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
        // "% Of"'s single-option submenu collapses, so clicking the mode runs its action (which opens twice).
        (await openMenuOption('% Of')).click();
        await nextAnimationFrame();
        await nextAnimationFrame();

        // Both opens happened; the second closed the first, so exactly one popup is in the DOM.
        expect(document.querySelector('.ag-show-value-as-value-popup input')).toBeTruthy();
        expect(document.querySelectorAll('.ag-show-value-as-value-popup').length).toBe(1);
    });

    test('a mode whose submenu has a single option collapses — clicking the mode runs that option directly', async () => {
        const api = await gridMgr.createGridAndWait('sva-collapse-single', {
            columnDefs: [
                { field: 'country' },
                {
                    field: 'amount',
                    aggFunc: 'sum',
                    showValueAsConfig: {
                        // A single-option menu has no real choice, so it collapses to this action (no submenu).
                        modes: {
                            tagged: {
                                transform: (p) => p.rawValue,
                                displayName: 'Tagged',
                                menu: (p) => [{ name: 'Apply tagged', action: () => p.apply({ note: 'x' }) }],
                            },
                        },
                    },
                },
            ],
            getRowId: ({ data }) => data.id,
            rowData: [{ id: '1', country: 'A', amount: 10 }],
        });

        enableOffsetParentPolyfill();
        api.showColumnMenu('amount');
        const parent = await openMenuOption('Show Values As');
        parent.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
        // No submenu to navigate — clicking the mode runs the single option's action, selecting the mode.
        (await openMenuOption('Tagged')).click();
        await asyncSetTimeout(10);

        expect(api.getColumn('amount')?.getShowValueAs()?.type).toBe('tagged');
        expect(api.getColumn('amount')?.getShowValueAs()?.params).toEqual({ note: 'x' });
    });

    test("a custom mode's menu action can apply a selection (e.g. from its own dialog)", async () => {
        let called = false;
        const api = await gridMgr.createGridAndWait('sva-custom-editor', {
            columnDefs: [
                { field: 'country' },
                {
                    field: 'amount',
                    aggFunc: 'sum',
                    showValueAs: 'percentOf',
                    showValueAsConfig: {
                        modes: {
                            // Override % Of's menu with a custom one: a "Custom value…" action stands in for the
                            // developer's own dialog, committing the selection via `apply`.
                            percentOf: {
                                menu: (p) => [
                                    {
                                        name: 'Custom value…',
                                        action: () => {
                                            called = true;
                                            p.apply({ base: { value: 50 } });
                                        },
                                    },
                                    { name: 'Reset', action: () => p.apply() },
                                ],
                            },
                        },
                    },
                },
            ],
            getRowId: ({ data }) => data.id,
            rowData: [{ id: '1', country: 'A', amount: 40 }],
        });

        enableOffsetParentPolyfill();
        api.showColumnMenu('amount');
        const parent = await openMenuOption('Show Values As');
        parent.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
        const pctOf = await openMenuOption('% Of');
        pctOf.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
        (await openMenuOption('Custom value…')).click();
        await asyncSetTimeout(10);

        expect(called).toBe(true);
        // The custom action applied base 50: amount 40 → 40 / 50.
        expect(api.getCellValue({ rowNode: leaf(api, '1'), colKey: 'amount', from: 'transformed' })).toBeCloseTo(0.8);
    });

    test('a custom mode can build its own menu from the helpers (door open for user menus)', async () => {
        const api = await gridMgr.createGridAndWait('sva-custom-menu', {
            columnDefs: [
                { field: 'country' },
                { field: 'gold', aggFunc: 'sum' },
                { field: 'bronze', aggFunc: 'sum' },
                {
                    field: 'silver',
                    aggFunc: 'sum',
                    showValueAs: 'ratioTo',
                    showValueAsConfig: {
                        modes: {
                            ratioTo: {
                                transform: (p) => {
                                    const base = p.baseColumnValue(
                                        (p.params as { base?: string } | undefined)?.base ?? ''
                                    );
                                    return base ? (p.rawValue as number) / Number(base) : null;
                                },
                                displayName: 'Ratio To',
                                // Build the submenu from the provided value-column list + apply helper.
                                menu: (p) =>
                                    p.columnLists.valueColumns.map((col) => ({
                                        name: col.getDisplayName(),
                                        action: () => p.apply({ base: col.getColId() }),
                                        checked:
                                            (p.currentParams as { base?: string } | undefined)?.base === col.getColId(),
                                    })),
                            },
                        },
                    },
                },
            ],
            getRowId: ({ data }) => data.id,
            rowData: [{ id: '1', country: 'A', gold: 10, bronze: 5, silver: 40 }],
        });

        enableOffsetParentPolyfill();
        api.showColumnMenu('silver');
        const parent = await openMenuOption('Show Values As');
        parent.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
        const ratioTo = await openMenuOption('Ratio To');
        ratioTo.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
        (await openMenuOption('Gold')).click();
        await asyncSetTimeout(10);

        expect(api.getCellValue({ rowNode: leaf(api, '1'), colKey: 'silver', from: 'transformed' })).toBeCloseTo(4);

        await new GridColumns(api, 'custom mode menu').checkColumns(`
            CENTER
            ├── country "Country" width:200
            ├── gold "Gold" width:200 aggFunc:sum
            ├── bronze "Bronze" width:200 aggFunc:sum
            └── silver "Silver" width:200 aggFunc:sum showValueAs:ratioTo
        `);
        await new GridRows(api, 'custom mode menu').check(`
            ROOT id:ROOT_NODE_ID gold:10 bronze:5 silver:4
            └── LEAF id:1 country:"A" gold:10 bronze:5 silver:4
        `);
    });

    test('the submenu lists modes, switching is a redraw (no re-aggregation) reflecting the new mode', async () => {
        let aggCalls = 0;
        const countingSum: IAggFunc = (params) => {
            aggCalls += 1;
            let sum = 0;
            for (const value of params.values ?? []) {
                sum += (value as number) ?? 0;
            }
            return sum;
        };

        const api = await gridMgr.createGridAndWait('sva-menu-switch', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'amount', aggFunc: countingSum, showValueAs: 'percentOfGrandTotal' },
            ],
            groupDefaultExpanded: -1,
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', country: 'A', amount: 30 },
                { id: '2', country: 'A', amount: 10 },
                { id: '3', country: 'B', amount: 60 }, // grand 100, group A 40
            ],
        });

        // Initially percentOfGrandTotal: leaf 1 = 30/100.
        expect(api.getCellValue({ rowNode: leaf(api, '1'), colKey: 'amount', from: 'transformed' })).toBeCloseTo(0.3);
        const callsBefore = aggCalls;

        enableOffsetParentPolyfill();
        api.showColumnMenu('amount');
        await asyncSetTimeout(10);

        // Open the "Show Values As" submenu and confirm the active mode is checked.
        const parent = await openMenuOption('Show Values As');
        parent.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
        const activeItem = await openMenuOption('% of Grand Total');
        expect(
            activeItem.classList.contains('ag-menu-option-active') || activeItem.querySelector('.ag-icon-tick')
        ).toBeTruthy();

        // Switch to "% of Parent Total".
        (await openMenuOption('% of Parent Row Total')).click();
        await asyncSetTimeout(10);

        // Redraw only — the aggFunc was not invoked again — but the cell now shows the parent-relative value.
        expect(aggCalls).toBe(callsBefore);
        expect(api.getCellValue({ rowNode: leaf(api, '1'), colKey: 'amount', from: 'transformed' })).toBeCloseTo(0.75);

        await new GridColumns(api, 'switch to percentOfParentRowTotal').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            └── amount "Amount" width:200 aggFunc:custom showValueAs:percentOfParentRowTotal
        `);
        await new GridRows(api, 'switch to percentOfParentRowTotal').check(`
            ROOT id:ROOT_NODE_ID amount:null
            ├─┬ LEAF_GROUP id:row-group-country-A ag-Grid-AutoColumn:"A" amount:"40.00%"
            │ ├── LEAF id:1 country:"A" amount:"75.00%"
            │ └── LEAF id:2 country:"A" amount:"25.00%"
            └─┬ LEAF_GROUP id:row-group-country-B ag-Grid-AutoColumn:"B" amount:"60.00%"
            · └── LEAF id:3 country:"B" amount:"100.00%"
        `);
    });

    test('a dormant mode is hidden — unless it is the active selection, when it stays (greyed)', async () => {
        // Flat grid: the parent modes are dormant (no row hierarchy), so they are omitted from the menu.
        const api = await gridMgr.createGridAndWait('sva-menu-indicate', {
            columnDefs: [{ field: 'country' }, { field: 'amount', aggFunc: 'sum', showValueAs: 'percentOfGrandTotal' }],
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', country: 'A', amount: 25 },
                { id: '2', country: 'B', amount: 75 },
            ],
        });
        await openShowValueAsSubmenu(api, 'amount');
        expect(menuOption('% of Grand Total')).toBeTruthy(); // an applicable mode is shown…
        expect(menuOption('% of Parent Row Total')).toBeNull(); // …a dormant, unselected mode is omitted
        expect(menuOption('% of Parent Total')).toBeNull();
        gridMgr.reset();

        // Same flat grid, but the dormant mode IS the active selection — it stays (greyed) so the selection
        // remains visible and changeable, and is hidden again once another mode is chosen.
        const activeApi = await gridMgr.createGridAndWait('sva-menu-indicate-active', {
            columnDefs: [
                { field: 'country' },
                { field: 'amount', aggFunc: 'sum', showValueAs: 'percentOfParentRowTotal' },
            ],
            getRowId: ({ data }) => data.id,
            rowData: [{ id: '1', country: 'A', amount: 25 }],
        });
        await openShowValueAsSubmenu(activeApi, 'amount');
        const selected = menuOption('% of Parent Row Total');
        expect(selected).toBeTruthy(); // kept because it is the active selection
        expect(selected!.classList.contains('ag-menu-option-disabled')).toBe(true); // greyed

        (await openMenuOption('None')).click();
        await asyncSetTimeout(10);
        expect(activeApi.getColumnState().find((s) => s.colId === 'amount')?.showValueAs ?? null).toBeNull();
    });

    test("a mode's applicable test controls its appearance ('disable' greys it, false omits it)", async () => {
        const disableApi = await gridMgr.createGridAndWait('sva-menu-disable', {
            columnDefs: [
                { field: 'country' },
                {
                    field: 'amount',
                    aggFunc: 'sum',
                    showValueAs: 'percentOfGrandTotal',
                    // 'disable' keeps the mode visible (greyed) when not applicable, rather than hiding it.
                    showValueAsConfig: {
                        modes: {
                            percentOfParentRowTotal: {
                                applicable: (params) => (params.rowGroupActive || params.treeData ? true : 'disable'),
                            },
                        },
                    },
                },
            ],
            getRowId: ({ data }) => data.id,
            rowData: [{ id: '1', country: 'A', amount: 25 }],
        });
        await openShowValueAsSubmenu(disableApi, 'amount');
        expect(menuOption('% of Parent Row Total')!.classList.contains('ag-menu-option-disabled')).toBe(true);
        gridMgr.reset();

        const hideApi = await gridMgr.createGridAndWait('sva-menu-hide', {
            columnDefs: [
                { field: 'country' },
                {
                    field: 'amount',
                    aggFunc: 'sum',
                    showValueAs: 'percentOfGrandTotal',
                    showValueAsConfig: { modes: { percentOfParentRowTotal: { applicable: false } } },
                },
            ],
            getRowId: ({ data }) => data.id,
            rowData: [{ id: '1', country: 'A', amount: 25 }],
        });
        await openShowValueAsSubmenu(hideApi, 'amount');
        expect(menuOption('% of Grand Total')).toBeTruthy(); // submenu is open…
        expect(menuOption('% of Parent Row Total')).toBeNull(); // …but the not-applicable mode is omitted
    });

    test('base picker: a row-group field lists its items in display (sorted) order', async () => {
        const api = await gridMgr.createGridAndWait('sva-base-items-sorted', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'amount', aggFunc: 'sum', showValueAs: 'percentOfGrandTotal' },
            ],
            groupDefaultExpanded: -1,
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', country: 'A', amount: 10 },
                { id: '2', country: 'B', amount: 30 },
                { id: '3', country: 'C', amount: 60 },
            ],
        });

        // Sort the groups descending → display order C, B, A (differs from the A, B, C grouping order).
        api.applyColumnState({ state: [{ colId: 'country', sort: 'desc' }] });
        await new GridRows(api, 'groups sorted desc').check(`
            ROOT id:ROOT_NODE_ID amount:"100.00%"
            ├─┬ LEAF_GROUP id:row-group-country-C ag-Grid-AutoColumn:"C" amount:"60.00%"
            │ └── LEAF id:3 country:"C" amount:"60.00%"
            ├─┬ LEAF_GROUP id:row-group-country-B ag-Grid-AutoColumn:"B" amount:"30.00%"
            │ └── LEAF id:2 country:"B" amount:"30.00%"
            └─┬ LEAF_GROUP id:row-group-country-A ag-Grid-AutoColumn:"A" amount:"10.00%"
            · └── LEAF id:1 country:"A" amount:"10.00%"
        `);

        enableOffsetParentPolyfill();
        api.showColumnMenu('amount');
        const parent = await openMenuOption('Show Values As');
        parent.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
        const pctOf = await openMenuOption('% Of');
        pctOf.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
        const country = await openMenuOption('Country');
        country.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
        await openMenuOption('C'); // the item submenu has rendered

        // The items follow the sorted display order, not the grouping order.
        const items = Array.from(document.querySelectorAll<HTMLElement>('.ag-menu-option-text'))
            .map((el) => el.textContent?.trim())
            .filter((t): t is string => t === 'A' || t === 'B' || t === 'C');
        expect(items).toEqual(['C', 'B', 'A']);
    });

    // Reviewer finding (built-in labels frozen at first locale resolution): a built-in mode's label is a callback
    // resolved per menu render, so a runtime locale change is reflected on the next menu open (not baked once).
    test('built-in mode labels follow a runtime locale change', async () => {
        let pctLabel = '% of Grand Total';
        const api = await gridMgr.createGridAndWait('sva-locale-runtime', {
            columnDefs: [{ field: 'country' }, { field: 'amount', aggFunc: 'sum', showValueAs: 'percentOfGrandTotal' }],
            getLocaleText: (params) => (params.key === 'percentOfGrandTotal' ? pctLabel : params.defaultValue),
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', country: 'A', amount: 25 },
                { id: '2', country: 'B', amount: 75 },
            ],
        });

        enableOffsetParentPolyfill();
        api.showColumnMenu('amount');
        let parent = await openMenuOption('Show Values As');
        parent.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
        expect(await openMenuOption('% of Grand Total')).toBeTruthy(); // initial label
        api.hidePopupMenu();
        await asyncSetTimeout(10);

        // The locale resolves to new text; reopening the menu re-resolves the label (not the old baked one).
        pctLabel = 'Pourcentage du total';
        api.showColumnMenu('amount');
        parent = await openMenuOption('Show Values As');
        parent.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
        expect(await openMenuOption('Pourcentage du total')).toBeTruthy();
        expect(menuOption('% of Grand Total')).toBeNull();
    });
});
