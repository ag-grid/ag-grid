import { waitFor } from '@testing-library/dom';

import type { GridApi, GridOptions, GridState, Module } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    GridStateModule,
    NumberEditorModule,
    TextEditorModule,
    ValidationModule,
} from 'ag-grid-community';
import {
    CalculatedColumnsModule,
    ColumnMenuModule,
    ContextMenuModule,
    FormulaModule,
    RowGroupingModule,
    RowNumbersModule,
} from 'ag-grid-enterprise';

import { GridColumns, GridRows, TestGridsManager, asyncSetTimeout } from '../test-utils';

// Behavioural spec for PERSISTING runtime-added (dynamic) calculated columns in grid state.
// A dynamic calc col is added via the header-menu dialog, so it is not present in `columnDefs`.
// The `GridState.userColumns` section is responsible for recreating it when state is restored
// (via `initialState` or `api.setState`) into a grid whose `columnDefs` do NOT declare the calc col.

describe('calculated columns - grid state persistence', () => {
    const gridsManager = new TestGridsManager({
        modules: [
            ClientSideRowModelModule,
            GridStateModule,
            CalculatedColumnsModule,
            FormulaModule,
            ColumnMenuModule,
            ContextMenuModule,
            RowGroupingModule,
            RowNumbersModule,
            TextEditorModule,
            NumberEditorModule,
            ValidationModule,
        ] as Module[],
    });

    let restoreOffsetParent: (() => void) | undefined;

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
        restoreOffsetParent?.();
        restoreOffsetParent = undefined;
    });

    function createGrid(id: string, opts: Partial<GridOptions>): GridApi {
        return gridsManager.createGrid(id, {
            getRowId: (params) => params.data?.id,
            calculatedColumns: true,
            ...opts,
        });
    }

    function order(api: GridApi): string[] {
        return api.getAllGridColumns()!.map((col) => col.getColId());
    }

    // --- dialog plumbing (the only public surface that sets an anchor) ---------------------------

    function enableOffsetParentPolyfill(): void {
        if (restoreOffsetParent) {
            return;
        }
        const original = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetParent');
        Object.defineProperty(HTMLElement.prototype, 'offsetParent', {
            configurable: true,
            get(this: HTMLElement) {
                return this.parentElement;
            },
        });
        restoreOffsetParent = () => {
            if (original) {
                Object.defineProperty(HTMLElement.prototype, 'offsetParent', original);
            } else {
                delete (HTMLElement.prototype as any).offsetParent;
            }
        };
    }

    async function clickColumnMenuItem(name: string): Promise<void> {
        const menuItem = await waitFor(() => {
            const text = Array.from(document.querySelectorAll<HTMLElement>('.ag-menu-option-text')).find(
                (element) => element.textContent?.trim() === name
            );
            const element = text?.closest<HTMLElement>('.ag-menu-option');
            expect(element).toBeTruthy();
            return element!;
        });
        menuItem.click();
    }

    function getDialog(): HTMLElement {
        // Live-apply dialogs stay open after Apply, so target the most recently opened one.
        const dialogs = document.querySelectorAll<HTMLElement>('.ag-calculated-column-form');
        expect(dialogs.length).toBeGreaterThan(0);
        return dialogs[dialogs.length - 1];
    }

    function setExpression(expression: string): void {
        const input = getDialog().querySelector<HTMLTextAreaElement>('textarea')!;
        input.value = expression;
        input.dispatchEvent(new Event('input', { bubbles: true }));
    }

    function setTitle(title: string): void {
        const input = getDialog().querySelector<HTMLInputElement>('input');
        expect(input).toBeTruthy();
        input!.value = title;
        input!.dispatchEvent(new Event('input', { bubbles: true }));
    }

    function clickDialogButton(label: string): void {
        const button = Array.from(getDialog().querySelectorAll<HTMLButtonElement>('button')).find(
            (element) => element.textContent?.trim() === label
        );
        expect(button).toBeTruthy();
        button!.click();
    }

    /** Adds a calc col through the header menu of {@link anchorColId} (the documented "anchor").
     *  Returns the auto-generated colId of the new column, discovered by diffing the column set. */
    async function addViaDialog(api: GridApi, anchorColId: string, expression: string): Promise<string> {
        const before = new Set(order(api));
        enableOffsetParentPolyfill();
        api.showColumnMenu(anchorColId);
        await asyncSetTimeout(10);
        await clickColumnMenuItem('Add Calculated Column');
        await asyncSetTimeout(1);
        setExpression(expression);
        clickDialogButton('Apply');
        // Wait past the live-apply animation frame so no expression flush is in flight when the
        // caller starts toggling columns (under the default 'live' mode Apply is a no-op).
        await asyncSetTimeout(40);
        const added = order(api).filter((id) => !before.has(id));
        expect(added).toHaveLength(1);
        return added[0];
    }

    /** Edits an existing calc col through its header menu, under the default 'live' apply mode. */
    async function editViaDialog(
        api: GridApi,
        colId: string,
        edits: { expression?: string; title?: string }
    ): Promise<void> {
        enableOffsetParentPolyfill();
        api.showColumnMenu(colId);
        await asyncSetTimeout(10);
        await clickColumnMenuItem('Edit Calculated Column');
        await asyncSetTimeout(1);
        if (edits.title !== undefined) {
            setTitle(edits.title);
        }
        if (edits.expression !== undefined) {
            setExpression(edits.expression);
        }
        clickDialogButton('Apply');
        await asyncSetTimeout(40);
    }

    // === core repro: initialState round-trip =====================================================

    test('a dynamic calc col added via the dialog is saved in getState().userColumns and recreated via initialState on a fresh grid', async () => {
        const api = createGrid('state-initial-source', {
            rowData: [{ id: 'r1', a: 5, b: 2 }],
            columnDefs: [{ field: 'a' }, { field: 'b' }],
        });
        const calcId = await addViaDialog(api, 'a', '[A] * 2');
        setTitle('Double A');
        await waitFor(() => expect(api.getColumn(calcId)!.getColDef().headerName).toBe('Double A'));

        const savedState = api.getState();
        expect(savedState.userColumns).toEqual([
            {
                kind: 'calculated',
                colId: calcId,
                groupAnchorColId: 'a',
                calculatedExpression: '[a] * 2',
                cellDataType: 'text',
                headerName: 'Double A',
            },
        ]);

        // Restore into a brand new grid: same columnDefs, but WITHOUT the calc col declared anywhere.
        const api2 = createGrid('state-initial-target', {
            rowData: [{ id: 'r1', a: 5, b: 2 }],
            columnDefs: [{ field: 'a' }, { field: 'b' }],
            initialState: savedState,
        });
        await waitFor(() => expect(order(api2)).toContain(calcId));
        expect(order(api2)).toEqual(['a', calcId, 'b']);
        await new GridColumns(api2, 'dynamic calc col recreated via initialState').checkColumns(`
            CENTER
            ├── a "A" width:200
            ├── ${calcId} "Double A" width:200 ƒ
            └── b "B" width:200
        `);
        await new GridRows(api2, 'dynamic calc col recreated via initialState - rows').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:r1 a:5 ${calcId}:10 b:2
        `);
    });

    // === api.setState round-trip: exercises the setState re-entrancy path ========================

    test('a dynamic calc col is recreated via api.setState on a fresh grid, and cachedState round-trips afterwards', async () => {
        const api = createGrid('state-setstate-source', {
            rowData: [{ id: 'r1', a: 5, b: 2 }],
            columnDefs: [{ field: 'a' }, { field: 'b' }],
        });
        const calcId = await addViaDialog(api, 'a', '[A] * 2');
        const savedState = api.getState();
        expect(savedState.userColumns).toHaveLength(1);

        const api2 = createGrid('state-setstate-target', {
            rowData: [{ id: 'r1', a: 5, b: 2 }],
            columnDefs: [{ field: 'a' }, { field: 'b' }],
        });
        expect(order(api2)).toEqual(['a', 'b']);

        api2.setState(savedState);
        await waitFor(() => expect(order(api2)).toContain(calcId));
        expect(order(api2)).toEqual(['a', calcId, 'b']);
        await new GridRows(api2, 'dynamic calc col recreated via api.setState - rows').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:r1 a:5 ${calcId}:10 b:2
        `);

        // cachedState must not be corrupted by the setState re-entrancy: a subsequent getState() still
        // reports the recreated calc col's descriptor.
        const roundTripped = api2.getState();
        expect(roundTripped.userColumns).toEqual(savedState.userColumns);
    });

    // === removal: setState is authoritative — a calc col absent from the new state is removed ======

    test('api.setState with a state that omits an existing calc col removes it from the grid', async () => {
        const api = createGrid('state-remove', {
            rowData: [{ id: 'r1', a: 5, b: 2 }],
            columnDefs: [{ field: 'a' }, { field: 'b' }],
        });
        // Snapshot the pre-calc state (no userColumns), then add a calc col on top of it.
        const stateWithoutCalc = api.getState();
        expect(stateWithoutCalc.userColumns).toBeUndefined();
        const calcId = await addViaDialog(api, 'a', '[A] * 2');
        expect(order(api)).toEqual(['a', calcId, 'b']);

        // Re-applying the pre-calc state must drop the runtime-added calc col — the state does not list it.
        api.setState(stateWithoutCalc);
        await waitFor(() => expect(order(api)).toEqual(['a', 'b']));
        expect(api.getColumn(calcId)).toBeNull();
        expect(api.getState().userColumns).toBeUndefined();
        await new GridRows(api, 'calc col removed via setState - rows').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:r1 a:5 b:2
        `);
    });

    test('api.setState reconciles the calc-col set — cols not in the new state are removed, listed ones kept', async () => {
        const api = createGrid('state-reconcile', {
            rowData: [{ id: 'r1', a: 5, b: 2 }],
            columnDefs: [{ field: 'a' }, { field: 'b' }],
        });
        const calcId1 = await addViaDialog(api, 'a', '[A] * 2');
        // Snapshot with only the first calc col present, then add a second on top.
        const stateWithOneCalc = api.getState();
        expect(stateWithOneCalc.userColumns).toHaveLength(1);
        const calcId2 = await addViaDialog(api, 'b', '[B] * 3');
        expect(order(api)).toEqual(['a', calcId1, 'b', calcId2]);

        // Applying the one-calc state must keep calcId1 and drop calcId2.
        api.setState(stateWithOneCalc);
        await waitFor(() => expect(api.getColumn(calcId2)).toBeNull());
        expect(order(api)).toEqual(['a', calcId1, 'b']);
        expect(api.getColumn(calcId1)).not.toBeNull();
        expect(api.getState().userColumns).toEqual(stateWithOneCalc.userColumns);
        await new GridRows(api, 'calc col reconciled via setState - rows').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:r1 a:5 ${calcId1}:10 b:2
        `);
    });

    test('api.setState restores the persisted definition of a calc col that has since been edited', async () => {
        const api = createGrid('state-update-existing', {
            rowData: [{ id: 'r1', a: 5, b: 2 }],
            columnDefs: [{ field: 'a' }, { field: 'b' }],
        });
        const calcId = await addViaDialog(api, 'a', '[A] * 2');
        const savedState = api.getState();
        expect(savedState.userColumns).toMatchObject([{ colId: calcId, calculatedExpression: '[a] * 2' }]);

        // Edit the live column so its definition no longer matches the snapshot.
        await editViaDialog(api, calcId, { expression: '[A] * 3', title: 'Triple A' });
        expect(api.getColumn(calcId)!.getColDef().calculatedExpression).toBe('[a] * 3');
        expect(api.getColumn(calcId)!.getColDef().headerName).toBe('Triple A');

        // The incoming state is authoritative: the surviving column must be reverted to its persisted
        // definition, not left on the edited one just because a col of that colId already exists.
        api.setState(savedState);
        await waitFor(() => expect(api.getColumn(calcId)!.getColDef().calculatedExpression).toBe('[a] * 2'));
        expect(api.getColumn(calcId)!.getColDef().headerName).not.toBe('Triple A');
        expect(api.getState().userColumns).toEqual(savedState.userColumns);
        await new GridRows(api, 'calc col definition restored via setState - rows').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:r1 a:5 ${calcId}:10 b:2
        `);
    });

    test('api.setState drops a calc col parked by resetColumnState, so a later applyColumnState cannot resurrect it', async () => {
        const api = createGrid('state-parked-removal', {
            rowData: [{ id: 'r1', a: 5, b: 2 }],
            columnDefs: [{ field: 'a' }, { field: 'b' }],
        });
        const stateWithoutCalc = api.getState();
        const calcId = await addViaDialog(api, 'a', '[A] * 2');
        const columnStateWithCalc = api.getColumnState();

        // resetColumnState parks the runtime-added col so a later applyColumnState can bring it back.
        api.resetColumnState();
        await waitFor(() => expect(order(api)).toEqual(['a', 'b']));

        // Applying a state that does not list the calc col must also discard the parked copy.
        api.setState(stateWithoutCalc);
        await asyncSetTimeout(0);
        expect(order(api)).toEqual(['a', 'b']);

        // The parked copy is gone, so the old column state can no longer resurrect the removed column.
        api.applyColumnState({ state: columnStateWithCalc, applyOrder: true });
        await asyncSetTimeout(0);
        expect(order(api)).toEqual(['a', 'b']);
        expect(api.getColumn(calcId)).toBeNull();
        expect(api.getState().userColumns).toBeUndefined();
    });

    // === save-side freshness: getState reflects the current expression, not a stale snapshot =====

    test('getState reflects the current expression and cellDataType after a live edit through the dialog', async () => {
        const api = createGrid('state-freshness', {
            rowData: [{ id: 'r1', a: 5, b: 2 }],
            columnDefs: [{ field: 'a' }, { field: 'b' }],
        });
        const calcId = await addViaDialog(api, 'a', '[A] * 2');
        expect((api.getState().userColumns as GridState['userColumns'])?.[0]).toMatchObject({
            colId: calcId,
            calculatedExpression: '[a] * 2',
            cellDataType: 'text',
        });

        // Reopen the column menu and edit the expression live (default apply mode).
        enableOffsetParentPolyfill();
        api.showColumnMenu(calcId);
        await asyncSetTimeout(10);
        await clickColumnMenuItem('Edit Calculated Column');
        await asyncSetTimeout(1);
        setExpression('[A] * 3');
        await waitFor(() => expect(api.getColumn(calcId)!.getColDef().calculatedExpression).toBe('[a] * 3'));
        clickDialogButton('Apply');
        await asyncSetTimeout(40);

        expect((api.getState().userColumns as GridState['userColumns'])?.[0]).toMatchObject({
            colId: calcId,
            calculatedExpression: '[a] * 3',
        });
    });

    // === non-lossy when the feature is disabled: provided userColumns survive a re-save ==========

    test('userColumns in initialState are preserved by getState when calculated columns are disabled', async () => {
        const userColumns: GridState['userColumns'] = [
            {
                kind: 'calculated',
                colId: 'calc_1',
                groupAnchorColId: 'a',
                calculatedExpression: '[a] * 2',
                cellDataType: 'text',
                headerName: 'Double A',
            },
        ];
        const api = createGrid('state-disabled-non-lossy', {
            rowData: [{ id: 'r1', a: 5, b: 2 }],
            columnDefs: [{ field: 'a' }, { field: 'b' }],
            calculatedColumns: false,
            initialState: { userColumns },
        });
        // The column is not recreated (feature disabled), but the descriptors must survive a re-save
        // untouched so restoring the state later into a calc-enabled grid is not lossy.
        await asyncSetTimeout(0);
        expect(order(api)).toEqual(['a', 'b']);
        expect(api.getState().userColumns).toEqual(userColumns);
    });

    // === plural case: two calc cols, one anchored to the other, round-trip in order ==============

    test('two dynamic calc cols, one anchored to the other, round-trip in serialised order with group inheritance', async () => {
        const columnDefs = [
            {
                groupId: 'money',
                headerName: 'Money',
                openByDefault: true,
                children: [
                    { field: 'revenue', headerName: 'Revenue', columnGroupShow: 'open' as const },
                    { field: 'cost', headerName: 'Cost' },
                ],
            },
        ];
        const api = createGrid('state-plural-source', {
            rowData: [{ id: 'r1', revenue: 10, cost: 3 }],
            columnDefs,
        });
        const calcId1 = await addViaDialog(api, 'revenue', '[Revenue] - [Cost]');
        // The second col is added against the first calc col, but the anchor is a group-membership
        // pointer: it serialises the stable leaf (`revenue`), collapsing the runtime-added chain so
        // restore never depends on another runtime-added col existing first.
        const calcId2 = await addViaDialog(api, calcId1, '[Revenue] * 2');
        expect(order(api)).toEqual(['revenue', calcId1, calcId2, 'cost']);

        const savedState = api.getState();
        expect(savedState.userColumns?.map(({ colId, groupAnchorColId }) => ({ colId, groupAnchorColId }))).toEqual([
            { colId: calcId1, groupAnchorColId: 'revenue' },
            { colId: calcId2, groupAnchorColId: 'revenue' },
        ]);

        const api2 = createGrid('state-plural-target', {
            rowData: [{ id: 'r1', revenue: 10, cost: 3 }],
            columnDefs,
            initialState: savedState,
        });
        await waitFor(() => expect(order(api2)).toContain(calcId2));
        expect(order(api2)).toEqual(['revenue', calcId1, calcId2, 'cost']);
        // Both calc cols sit inside the group, inheriting columnGroupShow from the shared leaf anchor.
        expect(api2.getColumn(calcId1)!.getColDef().columnGroupShow).toBe('open');
        expect(api2.getColumn(calcId2)!.getColDef().columnGroupShow).toBe('open');
        await new GridColumns(api2, 'two chained dynamic calc cols restored').checkColumns(`
            CENTER
            └─┬ "Money" GROUP open
              ├── revenue "Revenue" width:200 columnGroupShow:open
              ├── ${calcId1} "Untitled" width:200 ƒ columnGroupShow:open
              ├── ${calcId2} "Untitled" width:200 ƒ columnGroupShow:open
              └── cost "Cost" width:200
        `);
        await new GridRows(api2, 'two chained dynamic calc cols restored - rows').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:r1 revenue:10 ${calcId1}:7 ${calcId2}:20 cost:3
        `);
    });

    // === order-independence: a chained calc col anchors to a stable leaf, so userColumns order is free =

    test('a calc col added against another calc col anchors to the shared leaf, so userColumns order does not affect restore', async () => {
        // calculated_2 is added against calculated_1, which is itself anchored to the `gold` leaf. The
        // anchor is a group-membership pointer (display order is owned by columnOrder), so it must
        // serialise the stable leaf `gold` — never the runtime-added calculated_1, which may not exist
        // yet on restore. That makes the userColumns order irrelevant: reversing it restores identically.
        const columnDefs: GridOptions['columnDefs'] = [
            { field: 'athlete' },
            {
                headerName: 'Medals',
                groupId: 'medals',
                children: [{ field: 'gold' }, { field: 'silver' }],
            },
        ];
        const rowData = [{ id: 'r1', athlete: 'A', gold: 3, silver: 1 }];

        const source = createGrid('state-order-source', { rowData, columnDefs });
        const calcId1 = await addViaDialog(source, 'gold', '[gold]*2');
        const calcId2 = await addViaDialog(source, calcId1, '34');
        expect(order(source)).toEqual(['athlete', 'gold', calcId1, calcId2, 'silver']);

        const savedState = source.getState();
        // Both calc cols anchor to the leaf `gold` — the chain through calcId1 is collapsed on save.
        expect(savedState.userColumns?.map(({ colId, groupAnchorColId }) => ({ colId, groupAnchorColId }))).toEqual([
            { colId: calcId1, groupAnchorColId: 'gold' },
            { colId: calcId2, groupAnchorColId: 'gold' },
        ]);

        // Restore the saved state and a variant with userColumns reversed: the two must be identical,
        // including group membership (the part columnOrder does not carry).
        const reversedState: GridState = {
            ...savedState,
            userColumns: [savedState.userColumns![1], savedState.userColumns![0]],
        };
        const apiNatural = createGrid('state-order-natural', { rowData, columnDefs, initialState: savedState });
        const apiReversed = createGrid('state-order-reversed', { rowData, columnDefs, initialState: reversedState });

        await waitFor(() => expect(order(apiReversed)).toContain(calcId2));
        const expectedOrder = ['athlete', 'gold', calcId1, calcId2, 'silver'];
        expect(order(apiNatural)).toEqual(expectedOrder);
        expect(order(apiReversed)).toEqual(expectedOrder);

        // Both calc cols land inside the Medals group regardless of userColumns order.
        for (const api of [apiNatural, apiReversed]) {
            expect(api.getColumn(calcId1)!.getParent()!.getGroupId()).toBe('medals');
            expect(api.getColumn(calcId2)!.getParent()!.getGroupId()).toBe('medals');
        }
        await new GridColumns(apiReversed, 'chained calc cols restored from reversed userColumns').checkColumns(`
            CENTER
            ├── athlete "Athlete" width:200
            └─┬ "Medals" GROUP
              ├── gold "Gold" width:200
              ├── ${calcId1} "Untitled" width:200 ƒ
              ├── ${calcId2} "Untitled" width:200 ƒ
              └── silver "Silver" width:200
        `);
        await new GridRows(apiReversed, 'chained calc cols restored from reversed userColumns - rows').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:r1 athlete:"A" gold:3 ${calcId1}:6 ${calcId2}:34 silver:1
        `);
    });

    // === grouped anchor: the calc col comes back inside the same column group ====================

    test('a dynamic calc col anchored inside a column group is restored into that group after a state round-trip', async () => {
        const api = createGrid('state-group-source', {
            rowData: [{ id: 'r1', revenue: 10, cost: 3 }],
            columnDefs: [
                {
                    groupId: 'money',
                    headerName: 'Money',
                    children: [
                        { field: 'revenue', headerName: 'Revenue' },
                        { field: 'cost', headerName: 'Cost' },
                    ],
                },
            ],
        });
        const calcId = await addViaDialog(api, 'revenue', '[Revenue] - [Cost]');
        expect(order(api)).toEqual(['revenue', calcId, 'cost']);

        const savedState = api.getState();
        expect(savedState.userColumns).toEqual([
            {
                kind: 'calculated',
                colId: calcId,
                groupAnchorColId: 'revenue',
                calculatedExpression: '[revenue] - [cost]',
                cellDataType: 'text',
                headerName: 'Untitled',
            },
        ]);

        const api2 = createGrid('state-group-target', {
            rowData: [{ id: 'r1', revenue: 10, cost: 3 }],
            columnDefs: [
                {
                    groupId: 'money',
                    headerName: 'Money',
                    children: [
                        { field: 'revenue', headerName: 'Revenue' },
                        { field: 'cost', headerName: 'Cost' },
                    ],
                },
            ],
            initialState: savedState,
        });
        await waitFor(() => expect(order(api2)).toContain(calcId));
        expect(order(api2)).toEqual(['revenue', calcId, 'cost']);
        await new GridColumns(api2, 'grouped dynamic calc col restored into its group').checkColumns(`
            CENTER
            └─┬ "Money" GROUP
              ├── revenue "Revenue" width:200
              ├── ${calcId} "Untitled" width:200 ƒ
              └── cost "Cost" width:200
        `);
        await new GridRows(api2, 'grouped dynamic calc col restored into its group - rows').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:r1 revenue:10 ${calcId}:7 cost:3
        `);
    });
});
