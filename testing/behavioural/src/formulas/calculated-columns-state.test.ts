import { waitFor } from '@testing-library/dom';

import type { GridApi, GridOptions, GridState, Module } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    GridStateModule,
    NumberEditorModule,
    NumberFilterModule,
    TextEditorModule,
    TextFilterModule,
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
            TextFilterModule,
            NumberFilterModule,
            ValidationModule,
        ] as Module[],
    });

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
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

    async function selectDataType(label: string): Promise<void> {
        getDialog()
            .querySelector<HTMLElement>('.ag-select .ag-picker-field-wrapper')!
            .dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
        await asyncSetTimeout(1);
        const option = Array.from(document.querySelectorAll<HTMLElement>('.ag-list-item')).find(
            (element) => element.textContent?.trim() === label
        );
        expect(option).toBeTruthy();
        option!.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
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

    /** Removes a dynamic calc col through its header menu — dynamic calc cols are not in `columnDefs`,
     *  so the menu's "Remove Calculated Column" action is the only way a user can drop one. */
    async function removeViaMenu(api: GridApi, colId: string): Promise<void> {
        api.showColumnMenu(colId);
        await asyncSetTimeout(10);
        await clickColumnMenuItem('Remove Calculated Column');
        await asyncSetTimeout(1);
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

    // === layout sections apply to the recreated col ==============================================
    // Recreation runs BEFORE the column-state sections precisely so their colIds exist by then. These
    // tests pin that contract: everything a user can configure on a calc col must come back with it.

    test('width, sort, pinning and filter configured on a dynamic calc col are all restored alongside it', async () => {
        const rowData = [
            { id: 'r1', a: 5, b: 2 },
            { id: 'r2', a: 3, b: 7 },
        ];
        const columnDefs = [{ field: 'a' }, { field: 'b' }];
        const defaultColDef = { filter: true };
        const api = createGrid('state-layout-source', { rowData, columnDefs, defaultColDef });
        const calcId = await addViaDialog(api, 'a', '[A] + [B]');

        const filterModel = { filterType: 'text', type: 'notEqual', filter: '99' };
        api.setColumnWidths([{ key: calcId, newWidth: 320 }]);
        api.setColumnsPinned([calcId], 'left');
        api.applyColumnState({ state: [{ colId: calcId, sort: 'desc' }] });
        await api.setColumnFilterModel(calcId, filterModel);
        api.onFilterChanged();
        await asyncSetTimeout(0);
        expect(api.getColumnFilterModel(calcId)).toEqual(filterModel);

        const savedState = api.getState();
        expect(savedState.sort).toMatchObject({ sortModel: [{ colId: calcId, sort: 'desc' }] });
        expect(savedState.filter).toMatchObject({ filterModel: { [calcId]: filterModel } });

        const api2 = createGrid('state-layout-target', {
            rowData,
            columnDefs,
            defaultColDef,
            initialState: savedState,
        });
        await waitFor(() => expect(order(api2)).toContain(calcId));
        const restored = api2.getColumn(calcId)!;
        expect(restored.getActualWidth()).toBe(320);
        expect(restored.getPinned()).toBe('left');
        expect(restored.getSort()).toBe('desc');
        expect(api2.getColumnFilterModel(calcId)).toEqual(filterModel);
        await new GridColumns(api2, 'calc col restored with its layout state').checkColumns(`
            LEFT
            └── ${calcId} "Untitled" width:320 sort:desc sortIndex:0 ƒ filter
            CENTER
            ├── a "A" width:200
            └── b "B" width:200
        `);
        // Sort applies to the restored col, so the higher total (a+b) leads.
        await new GridRows(api2, 'calc col restored with its layout state - rows').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:r2 a:3 ${calcId}:10 b:7
            └── LEAF id:r1 a:5 ${calcId}:7 b:2
        `);
    });

    test('a hidden dynamic calc col is restored still hidden', async () => {
        const rowData = [{ id: 'r1', a: 5, b: 2 }];
        const columnDefs = [{ field: 'a' }, { field: 'b' }];
        const api = createGrid('state-hidden-source', { rowData, columnDefs });
        const calcId = await addViaDialog(api, 'a', '[A] * 2');
        api.setColumnsVisible([calcId], false);
        await asyncSetTimeout(0);

        const savedState = api.getState();
        expect(savedState.columnVisibility).toEqual({ hiddenColIds: [calcId] });

        const api2 = createGrid('state-hidden-target', { rowData, columnDefs, initialState: savedState });
        await waitFor(() => expect(api2.getColumn(calcId)).not.toBeNull());
        // The column exists (so unhiding it in the tool panel brings back a working calc col) but is
        // not displayed.
        expect(api2.getColumn(calcId)!.isVisible()).toBe(false);
        expect(api2.getAllDisplayedColumns().map((col) => col.getColId())).toEqual(['a', 'b']);
    });

    test('a header name override on a dynamic calc col is restored, and layered over the persisted colDef title', async () => {
        const rowData = [{ id: 'r1', a: 5, b: 2 }];
        const columnDefs = [{ field: 'a' }, { field: 'b' }];
        const api = createGrid('state-headername-source', { rowData, columnDefs });
        const calcId = await addViaDialog(api, 'a', '[A] * 2');
        setTitle('Double A');
        await waitFor(() => expect(api.getColumn(calcId)!.getColDef().headerName).toBe('Double A'));
        api.applyColumnState({ state: [{ colId: calcId, headerName: 'Renamed' }] });
        await asyncSetTimeout(0);

        const savedState = api.getState();
        // The dialog title lives in `userColumns` (it is part of the column's definition); the override
        // lives in `columnHeaderName`. Both must survive, since either can be reverted independently.
        expect(savedState.userColumns).toMatchObject([{ colId: calcId, headerName: 'Double A' }]);
        expect(savedState.columnHeaderName).toEqual({ columnHeaderNames: [{ colId: calcId, headerName: 'Renamed' }] });

        const api2 = createGrid('state-headername-target', { rowData, columnDefs, initialState: savedState });
        await waitFor(() => expect(api2.getColumn(calcId)).not.toBeNull());
        const restored = api2.getColumn(calcId)!;
        expect(restored.getColDef().headerName).toBe('Double A');
        expect(api2.getDisplayNameForColumn(restored, 'header')).toBe('Renamed');
        // Clearing the override falls back to the persisted dialog title, not to 'Untitled'.
        api2.applyColumnState({ state: [{ colId: calcId, headerName: null }] });
        await asyncSetTimeout(0);
        expect(api2.getDisplayNameForColumn(restored, 'header')).toBe('Double A');
    });

    // === display order is owned by columnOrder, not by the anchor ================================

    test('a dynamic calc col moved away from its anchor is restored at the moved position, not next to the anchor', async () => {
        const rowData = [{ id: 'r1', a: 5, b: 2, c: 1 }];
        const columnDefs = [{ field: 'a' }, { field: 'b' }, { field: 'c' }];
        const api = createGrid('state-order-moved-source', { rowData, columnDefs });
        const calcId = await addViaDialog(api, 'a', '[A] * 2');
        expect(order(api)).toEqual(['a', calcId, 'b', 'c']);

        // Drag the calc col to the front, away from its anchor `a`.
        api.moveColumns([calcId], 0);
        await asyncSetTimeout(0);
        expect(order(api)).toEqual([calcId, 'a', 'b', 'c']);

        const savedState = api.getState();
        expect(savedState.columnOrder).toEqual({ orderedColIds: [calcId, 'a', 'b', 'c'] });

        const api2 = createGrid('state-order-moved-target', { rowData, columnDefs, initialState: savedState });
        await waitFor(() => expect(order(api2)).toContain(calcId));
        // The anchor only decides group membership; `columnOrder` decides the position, so the col must
        // come back at the front rather than back beside `a`.
        expect(order(api2)).toEqual([calcId, 'a', 'b', 'c']);
        await new GridRows(api2, 'moved calc col restored at its moved position - rows').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:r1 ${calcId}:10 a:5 b:2 c:1
        `);
    });

    test('a dynamic calc col dragged out of its anchor group round-trips to the same layout it had before the save', async () => {
        const rowData = [{ id: 'r1', athlete: 'A', gold: 3, silver: 1 }];
        const columnDefs: GridOptions['columnDefs'] = [
            { field: 'athlete' },
            { headerName: 'Medals', groupId: 'medals', children: [{ field: 'gold' }, { field: 'silver' }] },
        ];
        const api = createGrid('state-order-outofgroup-source', { rowData, columnDefs });
        const calcId = await addViaDialog(api, 'gold', '[gold] * 2');
        expect(api.getColumn(calcId)!.getParent()!.getGroupId()).toBe('medals');

        // Dragging the col to the front keeps its Medals group membership, so the group renders split
        // across two instances. Whatever that layout is, the round-trip must reproduce it exactly —
        // the anchor carries group membership and `columnOrder` carries the position, independently.
        api.moveColumns([calcId], 0);
        await asyncSetTimeout(0);
        expect(order(api)).toEqual([calcId, 'athlete', 'gold', 'silver']);
        const splitGroupLayout = `
            CENTER
            ├─┬ "Medals" GROUP
            │ └── ${calcId} "Untitled" width:200 ƒ
            ├── athlete "Athlete" width:200
            └─┬ "Medals" GROUP
              ├── gold "Gold" width:200
              └── silver "Silver" width:200
        `;
        await new GridColumns(api, 'calc col dragged out of its anchor group - before save').checkColumns(
            splitGroupLayout
        );

        const savedState = api.getState();
        const api2 = createGrid('state-order-outofgroup-target', { rowData, columnDefs, initialState: savedState });
        await waitFor(() => expect(order(api2)).toContain(calcId));
        expect(order(api2)).toEqual([calcId, 'athlete', 'gold', 'silver']);
        await new GridColumns(api2, 'calc col dragged out of its anchor group - after restore').checkColumns(
            splitGroupLayout
        );
    });

    // === non-leaf anchors: generated columns can be anchors but are not columnDefs leaves ========

    test('a calc col anchored on the auto-group column round-trips and comes back beside it', async () => {
        const rowData = [
            { id: 'r1', region: 'EMEA', revenue: 10, cost: 3 },
            { id: 'r2', region: 'APAC', revenue: 20, cost: 8 },
        ];
        const columnDefs: GridOptions['columnDefs'] = [
            { field: 'region', rowGroup: true, hide: true },
            { field: 'revenue', headerName: 'Revenue', aggFunc: 'sum' },
            { field: 'cost', headerName: 'Cost', aggFunc: 'sum' },
        ];
        const api = createGrid('state-autogroup-source', { rowData, columnDefs });
        await waitFor(() => expect(order(api)).toContain('ag-Grid-AutoColumn'));
        const calcId = await addViaDialog(api, 'ag-Grid-AutoColumn', '[Revenue] - [Cost]');
        expect(order(api)).toEqual(['ag-Grid-AutoColumn', calcId, 'region', 'revenue', 'cost']);

        // The auto-group col is generated, not a columnDefs leaf, but it is still the serialised anchor:
        // it exists again in the target grid because `region` carries `rowGroup: true` in columnDefs.
        const savedState = api.getState();
        expect(savedState.userColumns).toMatchObject([{ colId: calcId, groupAnchorColId: 'ag-Grid-AutoColumn' }]);

        const api2 = createGrid('state-autogroup-target', { rowData, columnDefs, initialState: savedState });
        await waitFor(() => expect(order(api2)).toContain(calcId));
        expect(order(api2)).toEqual(['ag-Grid-AutoColumn', calcId, 'region', 'revenue', 'cost']);
        await new GridColumns(api2, 'calc col anchored on the auto-group column restored').checkColumns(`
            CENTER
            ├── ag-Grid-AutoColumn "Group" width:200
            ├── ${calcId} "Untitled" width:200 ƒ
            ├── revenue "Revenue" width:200 aggFunc:sum
            └── cost "Cost" width:200 aggFunc:sum
        `);
    });

    test('a calc col anchored on the auto-group column is restored top-level when the target grid is not grouped', async () => {
        const rowData = [{ id: 'r1', region: 'EMEA', revenue: 10, cost: 3 }];
        const groupedColumnDefs: GridOptions['columnDefs'] = [
            { field: 'region', rowGroup: true, hide: true },
            { field: 'revenue', headerName: 'Revenue', aggFunc: 'sum' },
            { field: 'cost', headerName: 'Cost', aggFunc: 'sum' },
        ];
        const api = createGrid('state-autogroup-missing-source', { rowData, columnDefs: groupedColumnDefs });
        await waitFor(() => expect(order(api)).toContain('ag-Grid-AutoColumn'));
        const calcId = await addViaDialog(api, 'ag-Grid-AutoColumn', '[Revenue] - [Cost]');
        const savedState = api.getState();

        // Restoring into a grid whose columnDefs do not group means the anchor never exists. The calc
        // col must still be recreated (with its expression working) rather than dropped.
        const api2 = createGrid('state-autogroup-missing-target', {
            rowData,
            columnDefs: [
                { field: 'region' },
                { field: 'revenue', headerName: 'Revenue' },
                { field: 'cost', headerName: 'Cost' },
            ],
            initialState: { ...savedState, rowGroup: undefined },
        });
        await waitFor(() => expect(order(api2)).toContain(calcId));
        expect(api2.getColumn(calcId)!.getParent()).toBeNull();
        // `columnOrder` still seats it where it was saved, ahead of the columns that followed the
        // now-absent auto-group anchor.
        expect(order(api2)).toEqual([calcId, 'region', 'revenue', 'cost']);
        await new GridRows(api2, 'calc col with a missing anchor restored top-level - rows').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:r1 ${calcId}:7 region:"EMEA" revenue:10 cost:3
        `);
    });

    // === restoring into a grid whose columnDefs have since changed ================================
    // A saved state outlives the app's columnDefs, so restore must degrade predictably rather than
    // throw or silently drop the user's column.

    test('a calc col whose anchor leaf no longer exists is still recreated, at the top level', async () => {
        const rowData = [{ id: 'r1', athlete: 'A', gold: 3, silver: 1 }];
        const api = createGrid('state-anchor-gone-source', {
            rowData,
            columnDefs: [
                { field: 'athlete' },
                { headerName: 'Medals', groupId: 'medals', children: [{ field: 'gold' }, { field: 'silver' }] },
            ],
        });
        const calcId = await addViaDialog(api, 'gold', '34');
        const savedState = api.getState();
        expect(savedState.userColumns).toMatchObject([{ colId: calcId, groupAnchorColId: 'gold' }]);

        // The target grid has dropped the `gold` column (and with it the Medals group's first child).
        const api2 = createGrid('state-anchor-gone-target', {
            rowData,
            columnDefs: [
                { field: 'athlete' },
                { headerName: 'Medals', groupId: 'medals', children: [{ field: 'silver' }] },
            ],
            initialState: savedState,
        });
        await waitFor(() => expect(order(api2)).toContain(calcId));
        // No anchor to inherit from, so it lands at the top level. Its saved neighbour is gone too, so
        // the order restoration cannot seat it after `athlete` and it falls to the front.
        expect(api2.getColumn(calcId)!.getParent()).toBeNull();
        await new GridColumns(api2, 'calc col with a removed anchor leaf restored top-level').checkColumns(`
            CENTER
            ├── ${calcId} "Untitled" width:200 ƒ
            ├── athlete "Athlete" width:200
            └─┬ "Medals" GROUP
              └── silver "Silver" width:200
        `);
    });

    test('a calc col whose expression references a column missing from the target grid is restored showing an error value', async () => {
        const api = createGrid('state-missing-ref-source', {
            rowData: [{ id: 'r1', a: 5, b: 2 }],
            columnDefs: [{ field: 'a' }, { field: 'b' }],
        });
        const calcId = await addViaDialog(api, 'a', '[A] + [B]');
        const savedState = api.getState();
        expect(savedState.userColumns).toMatchObject([{ calculatedExpression: '[a] + [b]' }]);

        // `b` is gone in the target grid, so the persisted expression cannot resolve. The column must
        // still come back — the user can then edit the expression to fix it.
        const api2 = createGrid('state-missing-ref-target', {
            rowData: [{ id: 'r1', a: 5, b: 2 }],
            columnDefs: [{ field: 'a' }],
            initialState: savedState,
        });
        await waitFor(() => expect(order(api2)).toContain(calcId));
        expect(api2.getColumn(calcId)!.getColDef().calculatedExpression).toBe('[a] + [b]');
        expect(api2.getCellValue({ rowNode: api2.getDisplayedRowAtIndex(0)!, colKey: calcId })).toBe('#PARSE!');
    });

    test('a calc col whose colId is now taken by a columnDefs column is skipped with a warning', async () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const rowData = [{ id: 'r1', a: 5, b: 2, calculated_1: 'taken' }];
        const api = createGrid('state-collision-source', {
            rowData,
            columnDefs: [{ field: 'a' }, { field: 'b' }],
        });
        const calcId = await addViaDialog(api, 'a', '[A] * 2');
        expect(calcId).toBe('calculated_1');
        const savedState = api.getState();

        // The target grid declares a real column on that colId, so recreating would clobber it.
        const api2 = createGrid('state-collision-target', {
            rowData,
            columnDefs: [{ field: 'a' }, { field: 'b' }, { field: 'calculated_1' }],
            initialState: savedState,
        });
        await asyncSetTimeout(0);
        // `columnOrder` still seats the colId where the calc col used to be, but the column itself is
        // the declared one, not a calculated column.
        expect(order(api2)).toEqual(['a', 'calculated_1', 'b']);
        expect(api2.getColumn('calculated_1')!.getColDef().calculatedExpression).toBeUndefined();
        expect(warn).toHaveBeenCalledWith(
            expect.stringContaining(`reconcileUserColumns: colId 'calculated_1' already exists; skipping.`)
        );
        await new GridRows(api2, 'calc col colId collision skipped - rows').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:r1 a:5 calculated_1:"taken" b:2
        `);
        warn.mockRestore();
    });

    // === deferred apply mode: only committed columns reach the state ==============================

    test('under deferred apply mode a calc col reaches getState only once Apply is clicked', async () => {
        const api = createGrid('state-deferred-apply', {
            calculatedColumns: { applyMode: 'deferred' },
            rowData: [{ id: 'r1', a: 5, b: 2 }],
            columnDefs: [{ field: 'a' }, { field: 'b' }],
        });

        api.showColumnMenu('a');
        await asyncSetTimeout(10);
        await clickColumnMenuItem('Add Calculated Column');
        await asyncSetTimeout(1);
        setExpression('[A] * 2');
        // Typing does not commit under deferred mode, so nothing is persisted yet.
        expect(order(api)).toEqual(['a', 'b']);
        expect(api.getState().userColumns).toBeUndefined();

        clickDialogButton('Apply');
        await asyncSetTimeout(1);
        expect(api.getState().userColumns).toMatchObject([{ colId: 'calculated_1', calculatedExpression: '[a] * 2' }]);
    });

    test('under deferred apply mode a cancelled dialog leaves the state untouched', async () => {
        const api = createGrid('state-deferred-cancel', {
            calculatedColumns: { applyMode: 'deferred' },
            rowData: [{ id: 'r1', a: 5, b: 2 }],
            columnDefs: [{ field: 'a' }, { field: 'b' }],
        });

        api.showColumnMenu('a');
        await asyncSetTimeout(10);
        await clickColumnMenuItem('Add Calculated Column');
        await asyncSetTimeout(1);
        setExpression('[A] * 2');
        clickDialogButton('Cancel');
        await asyncSetTimeout(1);

        expect(order(api)).toEqual(['a', 'b']);
        expect(api.getState().userColumns).toBeUndefined();
    });

    test('under deferred apply mode a cancelled edit keeps the previously applied definition in the state', async () => {
        const api = createGrid('state-deferred-cancel-edit', {
            calculatedColumns: { applyMode: 'deferred' },
            rowData: [{ id: 'r1', a: 5, b: 2 }],
            columnDefs: [{ field: 'a' }, { field: 'b' }],
        });

        api.showColumnMenu('a');
        await asyncSetTimeout(10);
        await clickColumnMenuItem('Add Calculated Column');
        await asyncSetTimeout(1);
        setExpression('[A] * 2');
        clickDialogButton('Apply');
        await asyncSetTimeout(1);

        api.showColumnMenu('calculated_1');
        await asyncSetTimeout(10);
        await clickColumnMenuItem('Edit Calculated Column');
        await asyncSetTimeout(1);
        setExpression('[A] * 3');
        clickDialogButton('Cancel');
        await asyncSetTimeout(1);

        expect(api.getState().userColumns).toMatchObject([{ colId: 'calculated_1', calculatedExpression: '[a] * 2' }]);
    });

    // === removal through the dialog: the user's own way of dropping a calc col ====================

    test('removing a dynamic calc col through its header menu drops it from getState', async () => {
        const api = createGrid('state-remove-via-menu', {
            rowData: [{ id: 'r1', a: 5, b: 2 }],
            columnDefs: [{ field: 'a' }, { field: 'b' }],
        });
        const calcId = await addViaDialog(api, 'a', '[A] * 2');
        const calcId2 = await addViaDialog(api, 'b', '[B] * 3');
        expect(api.getState().userColumns).toHaveLength(2);

        await removeViaMenu(api, calcId);
        expect(api.getColumn(calcId)).toBeNull();
        // Only the removed descriptor goes; the other calc col is untouched.
        expect(api.getState().userColumns).toMatchObject([{ colId: calcId2 }]);

        await removeViaMenu(api, calcId2);
        expect(api.getState().userColumns).toBeUndefined();
        await new GridRows(api, 'calc cols removed via header menu - rows').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:r1 a:5 b:2
        `);
    });

    // === cellDataType chosen in the dialog survives the round-trip ================================

    test('a calc col typed as Number in the dialog is restored as a number column, not as text', async () => {
        const rowData = [{ id: 'r1', a: 5, b: 2 }];
        const columnDefs = [{ field: 'a' }, { field: 'b' }];
        const api = createGrid('state-datatype-source', { rowData, columnDefs });
        const calcId = await addViaDialog(api, 'a', '[A] + [B]');
        await editViaDialog(api, calcId, {});
        await selectDataType('Number');
        clickDialogButton('Apply');
        await waitFor(() => expect(api.getColumn(calcId)!.getColDef().cellDataType).toBe('number'));

        const savedState = api.getState();
        expect(savedState.userColumns).toMatchObject([{ colId: calcId, cellDataType: 'number' }]);

        const api2 = createGrid('state-datatype-target', { rowData, columnDefs, initialState: savedState });
        await waitFor(() => expect(order(api2)).toContain(calcId));
        expect(api2.getColumn(calcId)!.getColDef().cellDataType).toBe('number');
        // A number-typed column produces a numeric value, so the restored type is not merely cosmetic.
        expect(api2.getCellValue({ rowNode: api2.getDisplayedRowAtIndex(0)!, colKey: calcId })).toBe(7);
    });

    // === empty and no-op state applications =======================================================

    test('an empty userColumns array removes existing calc cols, exactly as an absent section does', async () => {
        const api = createGrid('state-empty-array', {
            rowData: [{ id: 'r1', a: 5, b: 2 }],
            columnDefs: [{ field: 'a' }, { field: 'b' }],
        });
        const calcId = await addViaDialog(api, 'a', '[A] * 2');
        const savedState = api.getState();

        api.setState({ ...savedState, userColumns: [] });
        await waitFor(() => expect(api.getColumn(calcId)).toBeNull());
        expect(order(api)).toEqual(['a', 'b']);
        expect(api.getState().userColumns).toBeUndefined();
    });

    test('re-applying an unchanged state leaves the calc col colDef untouched, but a changed definition re-applies it', async () => {
        const api = createGrid('state-idempotent', {
            rowData: [{ id: 'r1', a: 5, b: 2 }],
            columnDefs: [{ field: 'a' }, { field: 'b' }],
        });
        const calcId = await addViaDialog(api, 'a', '[A] * 2');
        const savedState = api.getState();
        const colDefBefore = api.getColumn(calcId)!.getColDef();

        api.setState(savedState);
        await asyncSetTimeout(0);
        api.setState(savedState);
        await asyncSetTimeout(0);
        // The persisted definition matched what is already there, so the colDef was never re-applied.
        expect(api.getColumn(calcId)!.getColDef()).toBe(colDefBefore);
        expect(order(api)).toEqual(['a', calcId, 'b']);
        expect(api.getState().userColumns).toEqual(savedState.userColumns);

        // A changed expression must re-apply, otherwise the guard would be swallowing real updates.
        api.setState({
            ...savedState,
            userColumns: [{ ...savedState.userColumns![0], calculatedExpression: '[a] * 3' }],
        });
        await waitFor(() => expect(api.getColumn(calcId)!.getColDef().calculatedExpression).toBe('[a] * 3'));
        expect(api.getColumn(calcId)!.getColDef()).not.toBe(colDefBefore);
    });

    // === parked columns: resetColumnState / applyColumnState ======================================

    test('resetColumnState drops the calc col from getState, and applyColumnState brings it back', async () => {
        const api = createGrid('state-parked-roundtrip', {
            rowData: [{ id: 'r1', a: 5, b: 2 }],
            columnDefs: [{ field: 'a' }, { field: 'b' }],
        });
        const calcId = await addViaDialog(api, 'a', '[A] * 2');
        const savedState = api.getState();
        const columnStateWithCalc = api.getColumnState();

        // Parked columns are not part of the grid, so they must not be reported as user columns.
        api.resetColumnState();
        await waitFor(() => expect(order(api)).toEqual(['a', 'b']));
        expect(api.getState().userColumns).toBeUndefined();

        // Restoring the column state resurrects the parked col, and the state reports it again.
        api.applyColumnState({ state: columnStateWithCalc, applyOrder: true });
        await waitFor(() => expect(order(api)).toEqual(['a', calcId, 'b']));
        expect(api.getState().userColumns).toEqual(savedState.userColumns);
        await new GridRows(api, 'parked calc col resurrected by applyColumnState - rows').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:r1 a:5 ${calcId}:10 b:2
        `);
    });
});

// The calculated-columns module being absent is a different grid setup, so it needs its own manager.
describe('calculated columns - grid state persistence without the calculated columns module', () => {
    const gridsManager = new TestGridsManager({
        modules: [ClientSideRowModelModule, GridStateModule, ValidationModule] as Module[],
    });

    beforeEach(() => {
        gridsManager.reset();
    });

    afterEach(() => {
        gridsManager.reset();
    });

    test('userColumns in initialState are preserved by getState when the module is not registered', () => {
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
        const api = gridsManager.createGrid('state-no-module', {
            rowData: [{ id: 'r1', a: 5, b: 2 }],
            columnDefs: [{ field: 'a' }, { field: 'b' }],
            initialState: { userColumns },
        });

        // No calc col is created, but the descriptors must survive a re-save untouched so the state can
        // later be restored into a grid that does register the module.
        expect(api.getAllGridColumns().map((col) => col.getColId())).toEqual(['a', 'b']);
        expect(api.getState().userColumns).toEqual(userColumns);
    });
});
