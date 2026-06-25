import { waitFor } from '@testing-library/dom';

import type { GridApi, IAggFunc, IRowNode, ShowValuesAsModeDef } from 'ag-grid-community';
import { ClientSideRowModelModule, LocaleModule } from 'ag-grid-community';
import { ColumnMenuModule, RowGroupingModule, ShowValuesAsModule } from 'ag-grid-enterprise';

import { GridColumns, GridRows, TestGridsManager, asyncSetTimeout } from '../test-utils';

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
async function openShowValuesAsSubmenu(api: GridApi, colKey: string): Promise<void> {
    enableOffsetParentPolyfill();
    api.showColumnMenu(colKey);
    const parent = await openMenuOption('Show Values As');
    parent.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    await openMenuOption('% of Grand Total'); // an always-applicable item — confirms the submenu is open
}

describe('showValuesAs column menu', () => {
    const gridMgr = new TestGridsManager({
        modules: [ClientSideRowModelModule, LocaleModule, ColumnMenuModule, RowGroupingModule, ShowValuesAsModule],
    });

    afterEach(() => {
        gridMgr.reset();
        restoreOffsetParent?.();
    });

    test('menu eligibility: a defaultColDef opt-in offers it only where supported; a direct `true` forces any type; `false` blocks', async () => {
        const captured: Record<string, string[]> = {};
        const api = await gridMgr.createGridAndWait('sva-menu-gate', {
            defaultColDef: { enableShowValuesAs: true }, // grid-wide opt-in — still gated by column support
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'region' }, // text + inherited opt-in → NOT offered (column doesn't support it)
                { field: 'score' }, // numeric + inherited opt-in → offered (promotable)
                { field: 'units', aggFunc: 'sum' }, // value column + inherited opt-in → offered
                { field: 'label', enableShowValuesAs: true }, // text, enabled DIRECTLY on the column → forced on
                { field: 'note', showValuesAsDef: { precision: 1 } }, // text + config but inherited opt-in → NOT offered
                { field: 'amount', aggFunc: 'sum', enableShowValuesAs: false }, // value but explicitly blocked → not offered
            ],
            groupDefaultExpanded: -1,
            getMainMenuItems: (params) => {
                captured[params.column?.getColId() ?? ''] = params.defaultItems.slice();
                return params.defaultItems;
            },
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', country: 'A', region: 'X', score: 10, units: 4, label: 'L1', note: 'n1', amount: 25 },
                { id: '2', country: 'B', region: 'Y', score: 20, units: 6, label: 'L2', note: 'n2', amount: 75 },
            ],
        });

        enableOffsetParentPolyfill();
        for (const colId of ['region', 'score', 'units', 'label', 'note', 'amount']) {
            api.showColumnMenu(colId);
            await waitFor(() => expect(captured[colId]).toBeTruthy());
            api.hidePopupMenu();
            await asyncSetTimeout(10);
        }

        expect(captured['score']).toContain('showValuesAsSubMenu'); // numeric — supported
        expect(captured['units']).toContain('showValuesAsSubMenu'); // value column — supported
        expect(captured['label']).toContain('showValuesAsSubMenu'); // text, enabled directly → forced on
        expect(captured['region']).not.toContain('showValuesAsSubMenu'); // text + only inherited opt-in → not offered
        expect(captured['note']).not.toContain('showValuesAsSubMenu'); // showValuesAsDef config is not a support signal
        expect(captured['amount']).not.toContain('showValuesAsSubMenu'); // explicitly blocked
    });

    test('showValuesAsDef:null disables the feature; showValuesAs:null clears the mode; enableShowValuesAs:false hides only the menu', async () => {
        const captured: Record<string, string[]> = {};
        const api = await gridMgr.createGridAndWait('sva-menu-optout', {
            // `showValuesAs` is the selector: null clears the mode but the menu stays. `showValuesAsDef: null`
            // disables the feature + menu. `enableShowValuesAs: false` hides the menu while the mode still transforms.
            defaultColDef: { showValuesAs: 'percentOfGrandTotal', enableShowValuesAs: true },
            columnDefs: [
                { field: 'a', aggFunc: 'sum' }, // inherits the mode → offered + active
                { field: 'b', aggFunc: 'sum', showValuesAs: null }, // clears the inherited mode, menu still offered
                { field: 'c', aggFunc: 'sum', showValuesAsDef: null }, // feature off → no menu, no transform
                { field: 'd', aggFunc: 'sum', enableShowValuesAs: false }, // menu hidden, inherited mode still transforms
            ],
            getMainMenuItems: (params) => {
                captured[params.column?.getColId() ?? ''] = params.defaultItems.slice();
                return params.defaultItems;
            },
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', a: 1, b: 2, c: 3, d: 4 },
                { id: '2', a: 6, b: 7, c: 8, d: 16 }, // d grand total = 20
            ],
        });

        enableOffsetParentPolyfill();
        for (const colId of ['a', 'b', 'c', 'd']) {
            api.showColumnMenu(colId);
            await waitFor(() => expect(captured[colId]).toBeTruthy());
            api.hidePopupMenu();
            await asyncSetTimeout(10);
        }

        expect(captured['a']).toContain('showValuesAsSubMenu'); // inherits the mode → offered
        expect(captured['b']).toContain('showValuesAsSubMenu'); // showValuesAs:null clears the mode, menu stays
        expect(captured['c']).not.toContain('showValuesAsSubMenu'); // showValuesAsDef:null → feature off
        expect(captured['d']).not.toContain('showValuesAsSubMenu'); // enableShowValuesAs:false → menu hidden

        // Selections: 'a' and 'd' keep the inherited mode (d's is only UI-hidden); 'b' cleared; 'c' disabled.
        const stateOf = (colId: string) => api.getColumnState().find((s) => s.colId === colId)?.showValuesAs ?? null;
        expect(stateOf('a')).toBe('percentOfGrandTotal');
        expect(stateOf('b')).toBeNull();
        expect(stateOf('c')).toBeNull();
        expect(stateOf('d')).toBe('percentOfGrandTotal');

        // enableShowValuesAs:false hides the menu, but the active mode still transforms (d = 4/20).
        expect(api.getCellValue({ rowNode: leaf(api, '1'), colKey: 'd', transformValues: true })).toBeCloseTo(0.2);

        // A cleared column is still overridable per-column at runtime (the menu's path): applying a mode sticks.
        api.applyColumnState({ state: [{ colId: 'b', showValuesAs: 'percentOfGrandTotal' }] });
        expect(stateOf('b')).toBe('percentOfGrandTotal');
    });

    test('enableShowValuesAs:false on defaultColDef hides the menu for inheriting columns', async () => {
        const captured: Record<string, string[]> = {};
        const api = await gridMgr.createGridAndWait('sva-menu-default-optout', {
            defaultColDef: { enableShowValuesAs: false },
            columnDefs: [
                { field: 'a', aggFunc: 'sum' }, // inherits enableShowValuesAs:false → menu hidden
                { field: 'b', aggFunc: 'sum', enableShowValuesAs: true }, // overrides back to true → menu offered
            ],
            getMainMenuItems: (params) => {
                captured[params.column?.getColId() ?? ''] = params.defaultItems.slice();
                return params.defaultItems;
            },
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', a: 1, b: 2 },
                { id: '2', a: 6, b: 7 },
            ],
        });

        enableOffsetParentPolyfill();
        for (const colId of ['a', 'b']) {
            api.showColumnMenu(colId);
            await waitFor(() => expect(captured[colId]).toBeTruthy());
            api.hidePopupMenu();
            await asyncSetTimeout(10);
        }

        expect(captured['a']).not.toContain('showValuesAsSubMenu'); // inherited enableShowValuesAs:false → hidden
        expect(captured['b']).toContain('showValuesAsSubMenu'); // per-column override → offered
    });

    test('a mode applied via column state respects the menu gate: transforms always, menu only when enabled', async () => {
        // `enableShowValuesAs` is not part of column state — applyColumnState sets only the mode. So a state-applied
        // mode transforms regardless, but the submenu still appears only on the column that opted the menu in.
        const captured: Record<string, string[]> = {};
        const api = await gridMgr.createGridAndWait('sva-menu-state-gate', {
            columnDefs: [
                { field: 'gated', aggFunc: 'sum' }, // value column, menu not enabled
                { field: 'shown', aggFunc: 'sum', enableShowValuesAs: true }, // menu enabled
            ],
            getMainMenuItems: (params) => {
                captured[params.column?.getColId() ?? ''] = params.defaultItems.slice();
                return params.defaultItems;
            },
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', gated: 25, shown: 25 },
                { id: '2', gated: 75, shown: 75 }, // grand total 100 each
            ],
        });

        api.applyColumnState({
            state: [
                { colId: 'gated', showValuesAs: 'percentOfGrandTotal' },
                { colId: 'shown', showValuesAs: 'percentOfGrandTotal' },
            ],
        });

        // Both transform — the menu gate is independent of the active mode.
        expect(api.getCellValue({ rowNode: leaf(api, '1'), colKey: 'gated', transformValues: true })).toBeCloseTo(0.25);
        expect(api.getCellValue({ rowNode: leaf(api, '1'), colKey: 'shown', transformValues: true })).toBeCloseTo(0.25);

        enableOffsetParentPolyfill();
        for (const colId of ['gated', 'shown']) {
            api.showColumnMenu(colId);
            await waitFor(() => expect(captured[colId]).toBeTruthy());
            api.hidePopupMenu();
            await asyncSetTimeout(10);
        }

        expect(captured['shown']).toContain('showValuesAsSubMenu'); // enabled → menu offered
        expect(captured['gated']).not.toContain('showValuesAsSubMenu'); // not enabled → state set only the mode
    });

    test('selecting an aggregation mode promotes a non-aggregated numeric column; None keeps it a value column', async () => {
        const api = await gridMgr.createGridAndWait('sva-menu-promote', {
            columnDefs: [
                { field: 'country', rowGroup: true, hide: true },
                { field: 'amount', enableShowValuesAs: true }, // numeric, NO aggFunc
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

        await openShowValuesAsSubmenu(api, 'amount');
        (await openMenuOption('% of Grand Total')).click();
        await asyncSetTimeout(10);

        // Promoted to a value column (default sum), showing the grand-total percentage.
        expect(api.getColumn('amount')!.isValueActive()).toBe(true);
        expect(api.getCellValue({ rowNode: leaf(api, '1'), colKey: 'amount', transformValues: true })).toBeCloseTo(0.3);

        await new GridColumns(api, 'promote percentOfGrandTotal').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            └── amount "Amount" width:200 aggFunc:sum %:percentOfGrandTotal
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
        await openShowValuesAsSubmenu(api, 'amount');
        (await openMenuOption('None')).click();
        await asyncSetTimeout(10);

        // None keeps the field a value column (Excel "No Calculation"), showing the raw aggregate.
        expect(api.getColumn('amount')!.isValueActive()).toBe(true);
        expect(api.getCellValue({ rowNode: leaf(api, '1'), colKey: 'amount', transformValues: true })).toBe(30);

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
                {
                    field: 'amount',
                    aggFunc: countingSum,
                    showValuesAs: 'percentOfGrandTotal',
                    enableShowValuesAs: true,
                },
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
        expect(api.getCellValue({ rowNode: leaf(api, '1'), colKey: 'amount', transformValues: true })).toBeCloseTo(0.3);
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
        expect(api.getCellValue({ rowNode: leaf(api, '1'), colKey: 'amount', transformValues: true })).toBeCloseTo(
            0.75
        );

        await new GridColumns(api, 'switch to percentOfParentRowTotal').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            └── amount "Amount" width:200 aggFunc:custom %:percentOfParentRowTotal
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

    test('an inapplicable built-in mode is shown greyed and non-interactive — never hidden', async () => {
        // Flat grid: the parent modes are inapplicable (no row hierarchy). They appear greyed and cannot be
        // selected — only the grouping/pivoting that activates them makes them available.
        const api = await gridMgr.createGridAndWait('sva-menu-inapplicable', {
            columnDefs: [
                { field: 'country' },
                { field: 'amount', aggFunc: 'sum', showValuesAs: 'percentOfGrandTotal', enableShowValuesAs: true },
            ],
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', country: 'A', amount: 25 },
                { id: '2', country: 'B', amount: 75 },
            ],
        });
        await openShowValuesAsSubmenu(api, 'amount');

        expect(menuOption('% of Grand Total')).toBeTruthy(); // applicable — shown normally

        const parentRow = menuOption('% of Parent Row Total');
        expect(parentRow).toBeTruthy(); // inapplicable, but NOT hidden
        expect(parentRow!.classList.contains('ag-menu-option-disabled')).toBe(true); // greyed AND non-interactive

        // Clicking it does nothing — an inapplicable, non-active mode cannot be selected.
        parentRow!.click();
        await asyncSetTimeout(10);
        expect(api.getColumnState().find((s) => s.colId === 'amount')?.showValuesAs).toBe('percentOfGrandTotal');
    });

    test('an active built-in mode that becomes inapplicable is greyed, checked, and non-interactive', async () => {
        // Flat grid with an inapplicable mode active (e.g. left over from a grouped view). The menu shows it
        // checked but disabled — it is changed away from by choosing an applicable mode, not by re-selecting it.
        const api = await gridMgr.createGridAndWait('sva-menu-inapplicable-active', {
            columnDefs: [
                { field: 'country' },
                { field: 'amount', aggFunc: 'sum', showValuesAs: 'percentOfParentRowTotal', enableShowValuesAs: true },
            ],
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', country: 'A', amount: 25 },
                { id: '2', country: 'B', amount: 75 },
            ],
        });
        await openShowValuesAsSubmenu(api, 'amount');

        const active = menuOption('% of Parent Row Total');
        expect(active).toBeTruthy();
        expect(active!.classList.contains('ag-menu-option-disabled')).toBe(true); // greyed AND non-interactive

        // Clicking the active inapplicable mode does nothing — it stays put, to be changed away from.
        active!.click();
        await asyncSetTimeout(10);
        expect(api.getColumnState().find((s) => s.colId === 'amount')?.showValuesAs).toBe('percentOfParentRowTotal');
    });

    test('built-in modes stay inapplicable-and-non-interactive even when their required module is not registered', async () => {
        // This suite registers RowGrouping but not Pivot/TreeData. Built-in modes are never hidden for being in the
        // wrong view — pivot-axis modes show greyed-and-disabled here too, so the feature stays discoverable.
        const api = await gridMgr.createGridAndWait('sva-menu-unregistered-module', {
            columnDefs: [
                { field: 'country' },
                { field: 'amount', aggFunc: 'sum', showValuesAs: 'percentOfGrandTotal', enableShowValuesAs: true },
            ],
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', country: 'A', amount: 25 },
                { id: '2', country: 'B', amount: 75 },
            ],
        });
        await openShowValuesAsSubmenu(api, 'amount');

        // Pivot-axis modes (Pivot module not registered) and the parent-row mode (RowGrouping inactive) all stay
        // greyed-and-disabled — never hidden.
        for (const name of ['% of Row Total', '% of Parent Column Total', '% of Parent Row Total']) {
            const option = menuOption(name);
            expect(option).toBeTruthy();
            expect(option!.classList.contains('ag-menu-option-disabled')).toBe(true); // greyed AND non-interactive
        }
    });

    test("`'hide'` omits an inapplicable mode — but keeps an active one greyed and still selectable", async () => {
        // A user-provided override whose `applicability` is 'hide' is omitted from the menu, unless it is the active
        // selection, when it stays greyed-but-selectable so it remains visible and changeable.
        const hidden: Partial<ShowValuesAsModeDef> = { applicability: 'hide' };
        const api = await gridMgr.createGridAndWait('sva-menu-hide', {
            columnDefs: [
                { field: 'country' },
                {
                    field: 'amount',
                    aggFunc: 'sum',
                    showValuesAs: 'percentOfColumnTotal',
                    showValuesAsDef: { modes: { percentOfColumnTotal: hidden } },
                    enableShowValuesAs: true,
                },
            ],
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', country: 'A', amount: 25 },
                { id: '2', country: 'B', amount: 75 },
            ],
        });

        await openShowValuesAsSubmenu(api, 'amount');
        const active = menuOption('% of Column Total');
        expect(active).toBeTruthy(); // kept because it is the active selection
        expect(active!.classList.contains('ag-show-values-as-inapplicable')).toBe(true); // greyed
        expect(active!.classList.contains('ag-menu-option-disabled')).toBe(false); // still selectable

        // Clear it via the always-enabled "None"; reopening, the now-inactive mode is fully omitted.
        (await openMenuOption('None')).click();
        await asyncSetTimeout(10);
        expect(api.getColumnState().find((s) => s.colId === 'amount')?.showValuesAs ?? null).toBeNull();
        api.hidePopupMenu();
        await asyncSetTimeout(10);
        await openShowValuesAsSubmenu(api, 'amount');
        expect(menuOption('% of Column Total')).toBeNull();
    });

    test("`'disabled'` shows the mode greyed and non-interactive — disabled altogether", async () => {
        // A user-provided override whose `applicability` is 'disabled' stays in the menu but is fully disabled.
        const disabled: Partial<ShowValuesAsModeDef> = { applicability: 'disabled' };
        const api = await gridMgr.createGridAndWait('sva-menu-disabled', {
            columnDefs: [
                { field: 'country' },
                {
                    field: 'amount',
                    aggFunc: 'sum',
                    showValuesAs: 'percentOfGrandTotal',
                    showValuesAsDef: { modes: { percentOfColumnTotal: disabled } },
                    enableShowValuesAs: true,
                },
            ],
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', country: 'A', amount: 25 },
                { id: '2', country: 'B', amount: 75 },
            ],
        });

        await openShowValuesAsSubmenu(api, 'amount');
        const item = menuOption('% of Column Total');
        expect(item).toBeTruthy(); // shown, not hidden
        expect(item!.classList.contains('ag-menu-option-disabled')).toBe(true); // greyed AND non-interactive
    });

    test("`'enabled'` is an alias for `true` — overrides an otherwise-inapplicable mode to applicable", async () => {
        // percentOfParentRowTotal is inapplicable on a flat grid; forcing `applicability: 'enabled'` makes it apply —
        // shown normally (not greyed) and the transform runs (parent is the root → grand total).
        const enabled: Partial<ShowValuesAsModeDef> = { applicability: 'enabled' };
        const api = await gridMgr.createGridAndWait('sva-menu-enabled-alias', {
            columnDefs: [
                { field: 'country' },
                {
                    field: 'amount',
                    aggFunc: 'sum',
                    showValuesAs: 'percentOfParentRowTotal',
                    showValuesAsDef: { modes: { percentOfParentRowTotal: enabled } },
                    enableShowValuesAs: true,
                },
            ],
            getRowId: ({ data }) => data.id,
            rowData: [
                { id: '1', country: 'A', amount: 25 },
                { id: '2', country: 'B', amount: 75 },
            ],
        });

        await openShowValuesAsSubmenu(api, 'amount');
        const item = menuOption('% of Parent Row Total');
        expect(item).toBeTruthy();
        expect(item!.classList.contains('ag-show-values-as-inapplicable')).toBe(false); // applicable — not greyed
        expect(item!.classList.contains('ag-menu-option-disabled')).toBe(false);

        // The transform runs (not dormant): 25 / grand-total 100 = 25%.
        expect(api.getCellValue({ rowNode: leaf(api, '1'), colKey: 'amount', transformValues: true })).toBeCloseTo(
            0.25
        );
    });

    // Reviewer finding (built-in labels frozen at first locale resolution): a built-in mode's label is a callback
    // resolved per menu render, so a runtime locale change is reflected on the next menu open (not baked once).
    test('built-in mode labels follow a runtime locale change', async () => {
        let pctLabel = '% of Grand Total';
        const api = await gridMgr.createGridAndWait('sva-locale-runtime', {
            columnDefs: [
                { field: 'country' },
                { field: 'amount', aggFunc: 'sum', showValuesAs: 'percentOfGrandTotal', enableShowValuesAs: true },
            ],
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
