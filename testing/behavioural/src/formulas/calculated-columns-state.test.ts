import { waitFor } from '@testing-library/dom';

import type { GridApi, GridOptions, GridState, Module, UserColumnProperty } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    GridStateModule,
    NumberEditorModule,
    NumberFilterModule,
    TextEditorModule,
    TextFilterModule,
    ValidationModule,
    enableDevValidations,
} from 'ag-grid-community';
import {
    CalculatedColumnsModule,
    ColumnMenuModule,
    ContextMenuModule,
    FormulaModule,
    RowGroupingModule,
    RowNumbersModule,
} from 'ag-grid-enterprise';

import { ALL_SEVERITIES, GridColumns, GridRows, TestGridsManager, asyncSetTimeout } from '../test-utils';

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

    /** A `userColumns` entry's properties as an object — the array is a list, so its order is an
     *  implementation detail no assertion should depend on. */
    function propertiesOf(state: GridState, colId: string): Record<string, unknown> | undefined {
        const entry = state.userColumns?.find((userColumn) => userColumn.colId === colId);
        if (!entry?.properties) {
            return undefined;
        }
        const result: Record<string, unknown> = {};
        for (const { property, value } of entry.properties) {
            result[property] = value;
        }
        return result;
    }

    function entryOf(state: GridState, colId: string): NonNullable<GridState['userColumns']>[number] {
        const entry = state.userColumns?.find((userColumn) => userColumn.colId === colId);
        expect(entry).toBeTruthy();
        return entry!;
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
        const option = await waitFor(() => {
            const found = Array.from(document.querySelectorAll<HTMLElement>('.ag-list-item')).find(
                (element) => element.textContent?.trim() === label
            );
            expect(found).toBeTruthy();
            return found!;
        });
        option.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
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
        await clickColumnMenuItem('Add Calculated Column');
        await waitFor(() => getDialog());
        setExpression(expression);
        clickDialogButton('Apply');
        // Under the default 'live' mode, "Add" creates the column up front (with an empty expression)
        // and opens the dialog over it, so the new colId is in `order()` immediately — before the
        // rAF-coalesced live-apply flush (`scheduleLiveApplyUpdate`) commits the typed expression. Poll
        // for the expression itself landing, not just the column's presence.
        const added = await waitFor(() => {
            const result = order(api).filter((id) => !before.has(id));
            expect(result).toHaveLength(1);
            expect(api.getColumn(result[0])!.getColDef().calculatedExpression).toBeTruthy();
            return result;
        });
        return added[0];
    }

    /** Edits an existing calc col through its header menu, under the default 'live' apply mode. */
    async function editViaDialog(
        api: GridApi,
        colId: string,
        edits: { expression?: string; title?: string }
    ): Promise<void> {
        api.showColumnMenu(colId);
        await clickColumnMenuItem('Edit Calculated Column');
        await waitFor(() => getDialog());
        // Only an actual edit schedules a live-apply flush (a no-op Apply, as used to merely open the
        // dialog, never fires the draft-change listener), so only then is there a flush to wait for.
        const willChange = edits.title !== undefined || edits.expression !== undefined;
        const colDefBefore = willChange ? api.getColumn(colId)!.getColDef() : undefined;
        if (edits.title !== undefined) {
            setTitle(edits.title);
        }
        if (edits.expression !== undefined) {
            setExpression(edits.expression);
        }
        clickDialogButton('Apply');
        if (willChange) {
            await waitFor(() => expect(api.getColumn(colId)!.getColDef()).not.toBe(colDefBefore));
        }
    }

    /** Removes a dynamic calc col through its header menu — dynamic calc cols are not in `columnDefs`,
     *  so the menu's "Remove Calculated Column" action is the only way a user can drop one. */
    async function removeViaMenu(api: GridApi, colId: string): Promise<void> {
        api.showColumnMenu(colId);
        await clickColumnMenuItem('Remove Calculated Column');
        await waitFor(() => expect(api.getColumn(colId)).toBeNull());
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
        // A column the user created at top level: no containing group, and only the properties the dialog set.
        expect(entryOf(savedState, calcId).parentGroupId).toBeNull();
        expect(propertiesOf(savedState, calcId)).toEqual({
            calculatedExpression: '[a] * 2',
            cellDataType: 'text',
            headerName: 'Double A',
        });

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
        expect(propertiesOf(savedState, calcId)).toMatchObject({ calculatedExpression: '[a] * 2' });

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
        expect(propertiesOf(api.getState(), calcId)).toMatchObject({
            calculatedExpression: '[a] * 2',
            cellDataType: 'text',
        });

        // Reopen the column menu and edit the expression live (default apply mode).
        api.showColumnMenu(calcId);
        await clickColumnMenuItem('Edit Calculated Column');
        await waitFor(() => getDialog());
        setExpression('[A] * 3');
        await waitFor(() => expect(api.getColumn(calcId)!.getColDef().calculatedExpression).toBe('[a] * 3'));
        clickDialogButton('Apply');

        await waitFor(() =>
            expect(propertiesOf(api.getState(), calcId)).toMatchObject({ calculatedExpression: '[a] * 3' })
        );
    });

    // === non-lossy when the feature is disabled: provided userColumns survive a re-save ==========

    test('userColumns in initialState are preserved by getState when calculated columns are disabled', async () => {
        const userColumns: GridState['userColumns'] = [
            {
                colId: 'calc_1',
                created: true,
                parentGroupId: null,
                properties: [
                    { property: 'calculatedExpression', value: '[a] * 2' },
                    { property: 'cellDataType', value: 'text' },
                    { property: 'headerName', value: 'Double A' },
                ],
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

    test('overrides and removals of declared columns are inert when calculated columns are disabled', async () => {
        const userColumns: GridState['userColumns'] = [
            { colId: 'a', properties: [{ property: 'headerName', value: 'Overridden' }] },
            { colId: 'b', removed: true },
        ];
        const api = createGrid('state-disabled-declared', {
            rowData: [{ id: 'r1', a: 5, b: 2 }],
            columnDefs: [{ field: 'a' }, { field: 'b' }],
            calculatedColumns: false,
            initialState: { userColumns },
        });
        await asyncSetTimeout(0);

        // Disabling the feature must not leave state half-applied: no column is changed or removed, and
        // everything re-saves unchanged for a grid that does enable it.
        expect(order(api)).toEqual(['a', 'b']);
        expect(api.getColumn('a')!.getColDef().headerName).toBeUndefined();
        expect(api.getState().userColumns).toEqual(userColumns);
    });

    // === columnGroupShow is persisted, not re-derived from the anchor on restore =================

    test('a calc col keeps its columnGroupShow when the anchor leaf no longer declares one', async () => {
        // The col inherits `columnGroupShow` from its anchor leaf when created, but the value is
        // serialised on the descriptor — restore must not re-read it from whatever the anchor happens
        // to declare in the target grid's columnDefs.
        const group = (revenueGroupShow?: 'open') => [
            {
                groupId: 'money',
                headerName: 'Money',
                openByDefault: true,
                children: [
                    { field: 'revenue', headerName: 'Revenue', columnGroupShow: revenueGroupShow },
                    // `closed` keeps the group expandable in both grids, so the assertions below turn
                    // only on the calc col's own columnGroupShow.
                    { field: 'cost', headerName: 'Cost', columnGroupShow: 'closed' as const },
                ],
            },
        ];
        const rowData = [{ id: 'r1', revenue: 10, cost: 3 }];

        const source = createGrid('state-group-show-source', { rowData, columnDefs: group('open') });
        const calcId = await addViaDialog(source, 'revenue', '[Revenue] - [Cost]');
        expect(source.getColumn(calcId)!.getColDef().columnGroupShow).toBe('open');

        // Target declares `revenue` with no columnGroupShow, so an anchor lookup would yield nothing.
        const target = createGrid('state-group-show-target', {
            rowData,
            columnDefs: group(),
            initialState: source.getState(),
        });
        await waitFor(() => expect(order(target)).toContain(calcId));
        expect(target.getColumn(calcId)!.getColDef().columnGroupShow).toBe('open');
        await new GridColumns(target, 'calc col keeps persisted columnGroupShow').checkColumns(`
            CENTER
            └─┬ "Money" GROUP open
              ├── revenue "Revenue" width:200
              ├── ${calcId} "Untitled" width:200 ƒ columnGroupShow:open
              └── cost "Cost" width:200 columnGroupShow:closed hidden
        `);
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
        // Group membership is recorded against the containing group, not the anchor leaf it was added from.
        expect(entryOf(savedState, calcId).parentGroupId).toBe('money');
        expect(propertiesOf(savedState, calcId)).toEqual({
            calculatedExpression: '[revenue] - [cost]',
            cellDataType: 'text',
            headerName: 'Untitled',
        });

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
        expect(propertiesOf(savedState, calcId)).toMatchObject({ headerName: 'Double A' });
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
        // The auto-group column sits at the top level, so the calc col beside it records no parent group.
        expect(entryOf(savedState, calcId).parentGroupId).toBeNull();

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

    test('a calc col stays in its column group when the leaf it was added from no longer exists', async () => {
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
        expect(entryOf(savedState, calcId).parentGroupId).toBe('medals');

        // The target grid has dropped the `gold` column the calc col was added from, but keeps the group.
        const api2 = createGrid('state-anchor-gone-target', {
            rowData,
            columnDefs: [
                { field: 'athlete' },
                { headerName: 'Medals', groupId: 'medals', children: [{ field: 'silver' }] },
            ],
            initialState: savedState,
        });
        await waitFor(() => expect(order(api2)).toContain(calcId));
        // Placement is recorded against the group, so it survives the loss of the leaf it was added from.
        expect(api2.getColumn(calcId)!.getParent()!.getGroupId()).toBe('medals');
        await new GridColumns(api2, 'calc col restored into its group after its anchor leaf went').checkColumns(`
            CENTER
            ├── athlete "Athlete" width:200
            └─┬ "Medals" GROUP
              ├── ${calcId} "Untitled" width:200 ƒ
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
        expect(propertiesOf(savedState, calcId)).toMatchObject({ calculatedExpression: '[a] + [b]' });

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
            expect.stringContaining(`userColumns: colId 'calculated_1' is declared in columnDefs; skipping.`)
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
        await clickColumnMenuItem('Add Calculated Column');
        await waitFor(() => getDialog());
        setExpression('[A] * 2');
        // Typing does not commit under deferred mode, so nothing is persisted yet.
        expect(order(api)).toEqual(['a', 'b']);
        expect(api.getState().userColumns).toBeUndefined();

        clickDialogButton('Apply');
        await waitFor(() =>
            expect(propertiesOf(api.getState(), 'calculated_1')).toMatchObject({ calculatedExpression: '[a] * 2' })
        );
    });

    test('under deferred apply mode a cancelled dialog leaves the state untouched', async () => {
        const api = createGrid('state-deferred-cancel', {
            calculatedColumns: { applyMode: 'deferred' },
            rowData: [{ id: 'r1', a: 5, b: 2 }],
            columnDefs: [{ field: 'a' }, { field: 'b' }],
        });

        api.showColumnMenu('a');
        await clickColumnMenuItem('Add Calculated Column');
        await waitFor(() => getDialog());
        setExpression('[A] * 2');
        clickDialogButton('Cancel');

        // Gate on the cancellation completing (the dialog closing), not on the pre-cancel column order —
        // that already held, so polling it would let a delayed erroneous commit slip through.
        await waitFor(() => expect(document.querySelectorAll('.ag-calculated-column-form')).toHaveLength(0));
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
        await clickColumnMenuItem('Add Calculated Column');
        await waitFor(() => getDialog());
        setExpression('[A] * 2');
        clickDialogButton('Apply');
        await waitFor(() => expect(api.getColumn('calculated_1')).toBeTruthy());

        api.showColumnMenu('calculated_1');
        await clickColumnMenuItem('Edit Calculated Column');
        await waitFor(() => getDialog());
        setExpression('[A] * 3');
        clickDialogButton('Cancel');

        expect(propertiesOf(api.getState(), 'calculated_1')).toMatchObject({ calculatedExpression: '[a] * 2' });
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
        expect(api.getState().userColumns!.map((entry) => entry.colId)).toEqual([calcId2]);

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
        expect(propertiesOf(savedState, calcId)).toMatchObject({ cellDataType: 'number' });

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
        const entry = savedState.userColumns![0];
        api.setState({
            ...savedState,
            userColumns: [
                {
                    ...entry,
                    properties: entry.properties!.map((property) =>
                        property.property === 'calculatedExpression' ? { ...property, value: '[a] * 3' } : property
                    ),
                },
            ],
        });
        await waitFor(() => expect(api.getColumn(calcId)!.getColDef().calculatedExpression).toBe('[a] * 3'));
        expect(api.getColumn(calcId)!.getColDef()).not.toBe(colDefBefore);
    });

    // === columnDefs-declared calc cols: user edits and deletions are the state's to keep ==========

    // These calc cols are created by `columnDefs`, so `userColumns` carries only what the user changed
    // about them (`kind: 'calculatedOverride'`) — never the column itself. State stays authoritative:
    // a listed entry re-applies the change, an absent one reverts to the declared definition.
    const STATIC_ROW_DATA = [{ id: 'r1', a: 10, b: 3 }];
    const staticColumnDefs = (): GridOptions['columnDefs'] => [
        { field: 'a' },
        { field: 'b' },
        { colId: 'declared', headerName: 'Declared', calculatedExpression: '[a] + [b]' },
    ];
    function cellValue(api: GridApi, colKey: string): unknown {
        return api.getCellValue({ colKey, rowNode: api.getRowNode('r1')! });
    }

    test('an untouched columnDefs-declared calc col is not reported in userColumns', async () => {
        const api = createGrid('state-declared-untouched', {
            rowData: STATIC_ROW_DATA,
            columnDefs: staticColumnDefs(),
        });
        await waitFor(() => expect(cellValue(api, 'declared')).toBe(13));
        // Nothing user-changed, so nothing to persist: the column is the developer's to declare, and a
        // state entry would let saved state resurrect or suppress it behind their back.
        expect(api.getState().userColumns).toBeUndefined();
    });

    test('an edit to a columnDefs-declared calc col is persisted and re-applied on restore', async () => {
        const source = createGrid('state-declared-edit-source', {
            rowData: STATIC_ROW_DATA,
            columnDefs: staticColumnDefs(),
        });
        await waitFor(() => expect(cellValue(source, 'declared')).toBe(13));
        await editViaDialog(source, 'declared', { expression: '[a] * [b]' });
        expect(cellValue(source, 'declared')).toBe(30);

        const savedState = source.getState();
        // An override records only the properties the user changed, against the declared column's colId.
        expect(propertiesOf(savedState, 'declared')).toMatchObject({ calculatedExpression: '[a] * [b]' });
        expect(entryOf(savedState, 'declared').parentGroupId).toBeUndefined();

        const target = createGrid('state-declared-edit-target', {
            rowData: STATIC_ROW_DATA,
            columnDefs: staticColumnDefs(),
            initialState: savedState,
        });
        await waitFor(() => expect(cellValue(target, 'declared')).toBe(30));
        // The override merges over the declared colDef, so untouched properties survive.
        expect(target.getColumn('declared')!.getColDef().headerName).toBe('Declared');
        expect(target.getState().userColumns).toEqual(savedState.userColumns);
    });

    test('an edit to a declared calc col with no colId is not applied, and cannot be misapplied to another column', async () => {
        // `calculatedExpression` without a `colId` is warned against (#319), so this covers what the layer
        // does when the developer ignores that: identity falls back to the build's positional ids, which
        // the layer cannot match, so nothing the user does through the dialog takes effect.
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [319] });
        const anonymousColumnDefs = (): GridOptions['columnDefs'] => [
            { field: 'a' },
            { field: 'b' },
            { headerName: 'Sum', calculatedExpression: '[a] + [b]' },
            { headerName: 'Product', calculatedExpression: '[a] * [b]' },
        ];
        const headerNames = (api: GridApi): (string | undefined)[] =>
            order(api).map((colId) => api.getColumn(colId)!.getColDef().headerName);

        const source = createGrid('state-declared-anonymous-source', {
            rowData: STATIC_ROW_DATA,
            columnDefs: anonymousColumnDefs(),
        });
        // With neither colId nor field to key on, both calc cols land on positional ids.
        await waitFor(() => expect(order(source)).toEqual(['a', 'b', '0', '1']));

        await editViaDialog(source, '0', { title: 'Renamed Sum' });
        // The rename is dropped by the rebuild the edit triggers: the entry it wrote is keyed by the
        // positional id, which the build never looks up for a column with no declared key.
        expect(headerNames(source)).toEqual([undefined, undefined, 'Sum', 'Product']);
        expect(entryOf(source.getState(), '0').colId).toBe('0');

        // A later `columnDefs` set clears the unmatched entry, so the edit is gone for good.
        source.setGridOption('columnDefs', anonymousColumnDefs());
        await asyncSetTimeout(0);
        expect(source.getState().userColumns).toBeUndefined();

        const savedState = source.getState();
        const target = createGrid('state-declared-anonymous-target', {
            rowData: STATIC_ROW_DATA,
            // Declared in the opposite order, so a positional match would rename the wrong column.
            columnDefs: [
                { field: 'a' },
                { field: 'b' },
                { headerName: 'Product', calculatedExpression: '[a] * [b]' },
                { headerName: 'Sum', calculatedExpression: '[a] + [b]' },
            ],
            initialState: savedState,
        });
        await asyncSetTimeout(0);
        expect(headerNames(target)).toEqual([undefined, undefined, 'Product', 'Sum']);
    });

    test('a columnDefs-declared calc col deleted by the user stays deleted after a state round-trip', async () => {
        const source = createGrid('state-declared-remove-source', {
            rowData: STATIC_ROW_DATA,
            columnDefs: staticColumnDefs(),
        });
        await waitFor(() => expect(order(source)).toEqual(['a', 'b', 'declared']));
        await removeViaMenu(source, 'declared');
        await waitFor(() => expect(order(source)).toEqual(['a', 'b']));

        const savedState = source.getState();
        expect(savedState.userColumns).toEqual([{ colId: 'declared', removed: true }]);

        const target = createGrid('state-declared-remove-target', {
            rowData: STATIC_ROW_DATA,
            columnDefs: staticColumnDefs(),
            initialState: savedState,
        });
        await asyncSetTimeout(0);
        expect(order(target)).toEqual(['a', 'b']);
        // The tombstone survives a re-save, so the deletion is not lost on the next reload.
        expect(target.getState().userColumns).toEqual(savedState.userColumns);
    });

    test('successive edits of a declared calc col each add to the persisted override', async () => {
        const source = createGrid('state-declared-successive-edits', {
            rowData: STATIC_ROW_DATA,
            columnDefs: staticColumnDefs(),
        });
        await waitFor(() => expect(cellValue(source, 'declared')).toBe(13));
        await editViaDialog(source, 'declared', { expression: '[a] * [b]' });
        await editViaDialog(source, 'declared', { title: 'Renamed' });

        // The second edit must not replace the first: both properties differ from the declaration.
        const savedState = source.getState();
        expect(propertiesOf(savedState, 'declared')).toMatchObject({
            calculatedExpression: '[a] * [b]',
            headerName: 'Renamed',
        });

        const target = createGrid('state-declared-successive-edits-target', {
            rowData: STATIC_ROW_DATA,
            columnDefs: staticColumnDefs(),
            initialState: savedState,
        });
        await waitFor(() => expect(cellValue(target, 'declared')).toBe(30));
        expect(target.getColumn('declared')!.getColDef().headerName).toBe('Renamed');
    });

    test('an override applies to a declared calc col that the previous state had removed', async () => {
        const api = createGrid('state-declared-tombstone-then-override', {
            rowData: STATIC_ROW_DATA,
            columnDefs: staticColumnDefs(),
        });
        await waitFor(() => expect(order(api)).toEqual(['a', 'b', 'declared']));
        await removeViaMenu(api, 'declared');
        await waitFor(() => expect(order(api)).toEqual(['a', 'b']));

        // The column is absent only because of the tombstone, so an override arriving for it must still be
        // recognised as belonging to a declared column and bring the column back.
        api.setState({
            userColumns: [
                { colId: 'declared', properties: [{ property: 'calculatedExpression', value: '[a] * [b]' }] },
            ],
        });
        await waitFor(() => expect(order(api)).toEqual(['a', 'b', 'declared']));
        expect(cellValue(api, 'declared')).toBe(30);
    });

    test('a created column cannot take the colId of a declared column the user had removed', async () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const api = createGrid('state-created-vs-tombstoned-declared', {
            rowData: STATIC_ROW_DATA,
            columnDefs: staticColumnDefs(),
        });
        await waitFor(() => expect(order(api)).toEqual(['a', 'b', 'declared']));
        await removeViaMenu(api, 'declared');
        await waitFor(() => expect(order(api)).toEqual(['a', 'b']));

        // The colId belongs to `columnDefs` whether or not a column is currently built for it, so a created
        // entry claiming it is refused rather than shadowing the developer's column.
        api.setState({
            userColumns: [
                {
                    colId: 'declared',
                    created: true,
                    parentGroupId: null,
                    properties: [{ property: 'calculatedExpression', value: '[a] * 5' }],
                },
            ],
        });
        await waitFor(() => expect(order(api)).toEqual(['a', 'b', 'declared']));
        expect(cellValue(api, 'declared')).toBe(13);
        expect(warn).toHaveBeenCalledWith(
            expect.stringContaining(`userColumns: colId 'declared' is declared in columnDefs; skipping.`)
        );
        warn.mockRestore();
    });

    // === the layer only accepts what the owning UI can produce ===================================

    /** State properties as they arrive from outside the type system, which `UserColumnProperty` refuses at
     *  compile time: a stored JSON payload, or `initialState` hand-authored in plain JavaScript. */
    const UNTYPED_PROPERTIES = (properties: { property: string; value: unknown }[]): UserColumnProperty[] =>
        properties as UserColumnProperty[];

    // `userColumns` is a record of the user's own choices, not a second route into `columnDefs`. A
    // hand-authored entry naming a property no dialog offers is dropped, so state cannot define columns
    // behind `columnDefs`' back, nor contend with the sections that own width/visibility/sort/order.

    test('an override entry only applies the properties the dialog can produce', async () => {
        const api = createGrid('state-override-unowned-properties', {
            rowData: STATIC_ROW_DATA,
            columnDefs: staticColumnDefs(),
        });
        await waitFor(() => expect(order(api)).toEqual(['a', 'b', 'declared']));

        api.setState({
            userColumns: [
                {
                    colId: 'declared',
                    properties: UNTYPED_PROPERTIES([
                        { property: 'headerName', value: 'Renamed' },
                        { property: 'editable', value: true },
                        { property: 'width', value: 400 },
                        { property: 'valueGetter', value: () => 99 },
                    ]),
                },
            ],
        });

        const colDef = await waitFor(() => {
            const declared = api.getColumn('declared')!.getColDef();
            expect(declared.headerName).toBe('Renamed');
            return declared;
        });
        expect(colDef.editable).toBeUndefined();
        expect(colDef.valueGetter).toBeUndefined();
        expect(api.getColumn('declared')!.getActualWidth()).not.toBe(400);
        expect(cellValue(api, 'declared')).toBe(13);
        // The dropped properties must not come back on a re-save either.
        expect(Object.keys(propertiesOf(api.getState(), 'declared')!)).toEqual(['headerName']);
    });

    test('a created entry only applies the properties the dialog can produce', async () => {
        const api = createGrid('state-created-unowned-properties', {
            rowData: STATIC_ROW_DATA,
            columnDefs: [{ field: 'a' }, { field: 'b' }],
        });
        await waitFor(() => expect(order(api)).toEqual(['a', 'b']));

        api.setState({
            userColumns: [
                {
                    colId: 'calculated_1',
                    created: true,
                    parentGroupId: null,
                    properties: UNTYPED_PROPERTIES([
                        { property: 'calculatedExpression', value: '[a] * [b]' },
                        { property: 'headerName', value: 'Product' },
                        { property: 'pinned', value: 'left' },
                        { property: 'rowGroup', value: true },
                    ]),
                },
            ],
        });

        await waitFor(() => expect(order(api)).toContain('calculated_1'));
        const colDef = api.getColumn('calculated_1')!.getColDef();
        expect(colDef.headerName).toBe('Product');
        expect(cellValue(api, 'calculated_1')).toBe(30);
        expect(colDef.pinned).toBeUndefined();
        expect(colDef.rowGroup).toBeUndefined();
        expect(api.getColumn('calculated_1')!.isRowGroupActive()).toBe(false);
    });

    test('replacing a grouped calc col through setState keeps the replacement in the group', async () => {
        const groupedColumnDefs = (): GridOptions['columnDefs'] => [
            { field: 'a' },
            { groupId: 'derived', headerName: 'Derived', children: [{ field: 'b' }] },
        ];
        const api = createGrid('state-grouped-calc-col-replaced', {
            rowData: STATIC_ROW_DATA,
            columnDefs: groupedColumnDefs(),
        });
        const firstId = await addViaDialog(api, 'b', '[a] + [b]');
        expect(api.getColumn(firstId)!.getParent()!.getGroupId()).toBe('derived');

        // The outgoing column still sits in `colDefList` when the incoming one looks for an anchor, so an
        // anchor search that does not filter it out seats the replacement at the top level instead.
        api.setState({
            userColumns: [
                {
                    colId: 'calculated_9',
                    created: true,
                    parentGroupId: 'derived',
                    properties: [{ property: 'calculatedExpression', value: '[a] * [b]' }],
                },
            ],
        });
        await waitFor(() => expect(api.getColumn('calculated_9')).toBeTruthy());
        expect(api.getColumn(firstId)).toBeNull();
        expect(api.getColumn('calculated_9')!.getParent()!.getGroupId()).toBe('derived');
    });

    // === incoming state is authoritative over an existing dynamic calc col ======================

    // A dynamic calc col only survives `setState` when the incoming entry still describes it as a created
    // calculated column. An entry of any other kind names the same colId but does not define that column,
    // so the old one must go rather than linger because an entry happens to exist.
    test.each([
        ['a tombstone', { colId: 'calculated_1', removed: true }],
        ['an override', { colId: 'calculated_1', properties: [{ property: 'headerName', value: 'Renamed' }] }],
        ['a created entry with no expression', { colId: 'calculated_1', created: true, parentGroupId: null }],
    ])('api.setState replacing an existing calc col with %s removes it', async (name, entry) => {
        const api = createGrid(`state-existing-dynamic-vs-${name.replace(/\s+/g, '-')}`, {
            rowData: STATIC_ROW_DATA,
            columnDefs: [{ field: 'a' }, { field: 'b' }],
        });
        const calcId = await addViaDialog(api, 'a', '[a] + [b]');
        expect(calcId).toBe('calculated_1');

        api.setState({ userColumns: [entry as NonNullable<GridState['userColumns']>[number]] });
        await waitFor(() => expect(order(api)).toEqual(['a', 'b']));
    });

    test('api.setState moves an existing calc col into the group its saved entry names', async () => {
        const api = createGrid('state-existing-dynamic-regroup', {
            rowData: STATIC_ROW_DATA,
            columnDefs: [{ field: 'a' }, { groupId: 'derived', headerName: 'Derived', children: [{ field: 'b' }] }],
        });
        const calcId = await addViaDialog(api, 'a', '[a] + [b]');
        // Added with no anchor, so it lands at the top level — inside the synthetic root group, not 'derived'.
        expect(api.getColumn(calcId)!.getParent()!.getGroupId()).not.toBe('derived');

        // Same colId and same properties, but the state places it inside the group: placement is part of
        // what the entry describes, so adoption must reconcile it and not keep the previous position.
        api.setState({
            userColumns: [
                {
                    colId: calcId,
                    created: true,
                    parentGroupId: 'derived',
                    properties: [{ property: 'calculatedExpression', value: '[a] + [b]' }],
                },
            ],
        });
        await waitFor(() => expect(api.getColumn(calcId)!.getParent()!.getGroupId()).toBe('derived'));
    });

    test('applying a state that lists no override reverts a live edit to the declared definition', async () => {
        const clean = createGrid('state-declared-revert-clean', {
            rowData: STATIC_ROW_DATA,
            columnDefs: staticColumnDefs(),
        });
        await waitFor(() => expect(cellValue(clean, 'declared')).toBe(13));
        const cleanState = clean.getState();

        const api = createGrid('state-declared-revert', {
            rowData: STATIC_ROW_DATA,
            columnDefs: staticColumnDefs(),
        });
        await waitFor(() => expect(cellValue(api, 'declared')).toBe(13));
        await editViaDialog(api, 'declared', { expression: '[a] * [b]' });
        expect(cellValue(api, 'declared')).toBe(30);

        api.setState(cleanState);
        await waitFor(() => expect(cellValue(api, 'declared')).toBe(13));
        expect(api.getState().userColumns).toBeUndefined();
    });

    test('a persisted override is dropped when columnDefs no longer declares the calc col', async () => {
        const source = createGrid('state-declared-gone-source', {
            rowData: STATIC_ROW_DATA,
            columnDefs: staticColumnDefs(),
        });
        await waitFor(() => expect(cellValue(source, 'declared')).toBe(13));
        await editViaDialog(source, 'declared', { expression: '[a] * [b]' });

        // The developer owns the column's existence, so dropping it from columnDefs drops the override
        // with it — the state cannot reinstate a column the developer no longer declares.
        const target = createGrid('state-declared-gone-target', {
            rowData: STATIC_ROW_DATA,
            columnDefs: [{ field: 'a' }, { field: 'b' }],
            initialState: source.getState(),
        });
        await asyncSetTimeout(0);
        expect(order(target)).toEqual(['a', 'b']);
        expect(target.getState().userColumns).toBeUndefined();
    });

    test('applying a state that deletes a columnDefs-declared calc col closes its open dialog', async () => {
        const source = createGrid('state-declared-tombstone-dialog-source', {
            rowData: STATIC_ROW_DATA,
            columnDefs: staticColumnDefs(),
        });
        await waitFor(() => expect(order(source)).toEqual(['a', 'b', 'declared']));
        await removeViaMenu(source, 'declared');
        const tombstoneState = source.getState();

        const api = createGrid('state-declared-tombstone-dialog', {
            rowData: STATIC_ROW_DATA,
            columnDefs: staticColumnDefs(),
        });
        await waitFor(() => expect(order(api)).toEqual(['a', 'b', 'declared']));
        api.showColumnMenu('declared');
        await clickColumnMenuItem('Edit Calculated Column');
        await waitFor(() => expect(document.querySelectorAll('.ag-calculated-column-form')).toHaveLength(1));

        // The dialog edits a column the state has just deleted, so it cannot be left open — same
        // contract as removing the column through its header menu.
        api.setState(tombstoneState);
        await waitFor(() => expect(order(api)).toEqual(['a', 'b']));
        expect(document.querySelectorAll('.ag-calculated-column-form')).toHaveLength(0);
    });

    test('a restored override whose expression references a missing column shows an error value', async () => {
        const source = createGrid('state-declared-badref-source', {
            rowData: STATIC_ROW_DATA,
            columnDefs: staticColumnDefs(),
        });
        await waitFor(() => expect(cellValue(source, 'declared')).toBe(13));
        await editViaDialog(source, 'declared', { expression: '[a] * [b]' });

        // `b` is gone from the target grid, so the persisted expression cannot resolve. The override
        // still applies — the column reports the error rather than silently keeping its declared value.
        const target = createGrid('state-declared-badref-target', {
            rowData: [{ id: 'r1', a: 10 }],
            columnDefs: [{ field: 'a' }, { colId: 'declared', headerName: 'Declared', calculatedExpression: '[a]' }],
            initialState: source.getState(),
        });
        await waitFor(() => expect(cellValue(target, 'declared')).toBe('#PARSE!'));
    });

    // A `columnDefs` change is the developer reasserting which columns exist — it does not speak for the
    // user's calc-col edits and deletions, which are state. They therefore survive `columnDefs` churn and
    // re-apply if the column comes back. Only `resetColumnState` clears them.
    test('setting columnDefs reclaims a calc col the user deleted', async () => {
        const api = createGrid('state-declared-live-redeclare', {
            rowData: STATIC_ROW_DATA,
            columnDefs: staticColumnDefs(),
        });
        await waitFor(() => expect(order(api)).toEqual(['a', 'b', 'declared']));
        await removeViaMenu(api, 'declared');
        await waitFor(() => expect(order(api)).toEqual(['a', 'b']));

        // Setting `columnDefs` is the developer declaring the column set afresh, so it takes the user's
        // deletion with it; only restoring grid state brings user changes back.
        api.setGridOption('columnDefs', staticColumnDefs());
        await waitFor(() => expect(order(api)).toEqual(['a', 'b', 'declared']));
        expect(api.getState().userColumns).toBeUndefined();
    });

    test('setting columnDefs reclaims a calc col the user edited, and the saved state restores the edit', async () => {
        const api = createGrid('state-declared-live-drop', {
            rowData: STATIC_ROW_DATA,
            columnDefs: staticColumnDefs(),
        });
        await waitFor(() => expect(cellValue(api, 'declared')).toBe(13));
        await editViaDialog(api, 'declared', { expression: '[a] * [b]' });
        expect(cellValue(api, 'declared')).toBe(30);
        const savedState = api.getState();

        api.setGridOption('columnDefs', staticColumnDefs());
        await waitFor(() => expect(cellValue(api, 'declared')).toBe(13));
        expect(api.getState().userColumns).toBeUndefined();

        // State saved before the reset still carries the edit, which is how the user gets it back.
        api.setState(savedState);
        await waitFor(() => expect(cellValue(api, 'declared')).toBe(30));
    });

    test('resetColumnState clears a user edit of a columnDefs-declared calc col', async () => {
        const api = createGrid('state-declared-reset', {
            rowData: STATIC_ROW_DATA,
            columnDefs: staticColumnDefs(),
        });
        await waitFor(() => expect(cellValue(api, 'declared')).toBe(13));
        await editViaDialog(api, 'declared', { expression: '[a] * [b]' });
        expect(cellValue(api, 'declared')).toBe(30);

        // An explicit reset does speak for the user's edits — unlike a `columnDefs` change.
        api.resetColumnState();
        await waitFor(() => expect(cellValue(api, 'declared')).toBe(13));
        expect(api.getState().userColumns).toBeUndefined();
    });

    test('a state round-trip restores an edited calc col into its column group', async () => {
        const groupedColumnDefs = (): GridOptions['columnDefs'] => [
            { field: 'a' },
            {
                groupId: 'derived',
                headerName: 'Derived',
                children: [{ field: 'b' }, { colId: 'declared', calculatedExpression: '[a] + [b]' }],
            },
        ];
        const api = createGrid('state-declared-group-drop', {
            rowData: STATIC_ROW_DATA,
            columnDefs: groupedColumnDefs(),
        });
        await waitFor(() => expect(cellValue(api, 'declared')).toBe(13));
        await editViaDialog(api, 'declared', { expression: '[a] * [b]' });
        expect(cellValue(api, 'declared')).toBe(30);

        const target = createGrid('state-declared-group-target', {
            rowData: STATIC_ROW_DATA,
            columnDefs: groupedColumnDefs(),
            initialState: api.getState(),
        });
        await waitFor(() => expect(cellValue(target, 'declared')).toBe(30));
        // The declared column keeps the group the developer put it in — an override changes properties only.
        expect(target.getColumn('declared')!.getParent()!.getGroupId()).toBe('derived');
    });

    test('a later columnDefs expression change replaces a user edit of a declared calc col', async () => {
        const api = createGrid('state-declared-vs-coldef', {
            rowData: STATIC_ROW_DATA,
            columnDefs: staticColumnDefs(),
        });
        await waitFor(() => expect(cellValue(api, 'declared')).toBe(13));
        await editViaDialog(api, 'declared', { expression: '[a] * [b]' });
        expect(cellValue(api, 'declared')).toBe(30);

        // Re-declaring the column set is the developer reclaiming it, so their expression takes effect and
        // the user's edit is not left behind in the state.
        api.setGridOption('columnDefs', [
            { field: 'a' },
            { field: 'b' },
            { colId: 'declared', headerName: 'Declared', calculatedExpression: '[a] - [b]' },
        ]);
        await waitFor(() => expect(cellValue(api, 'declared')).toBe(7));
        expect(api.getState().userColumns).toBeUndefined();
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

    test('a grouped calc col resurrected by applyColumnState keeps its group in the state round-trip', async () => {
        const api = createGrid('state-parked-group-roundtrip', {
            rowData: [{ id: 'r1', a: 5, b: 2 }],
            columnDefs: [{ groupId: 'g', headerName: 'G', children: [{ field: 'a' }, { field: 'b' }] }],
        });
        const calcId = await addViaDialog(api, 'a', '[A] * 2');
        const columnStateWithCalc = api.getColumnState();

        api.resetColumnState();
        await waitFor(() => expect(order(api)).toEqual(['a', 'b']));
        expect(api.getState().userColumns).toBeUndefined();

        // The resurrected column must be re-recorded with its group, not just rendered inside it — a
        // state saved after the resurrection restores the column into the group on another grid.
        api.applyColumnState({ state: columnStateWithCalc, applyOrder: true });
        await waitFor(() => expect(order(api)).toEqual(['a', calcId, 'b']));
        const savedState = api.getState();
        expect(entryOf(savedState, calcId).parentGroupId).toBe('g');

        const api2 = createGrid('state-parked-group-target', {
            rowData: [{ id: 'r1', a: 5, b: 2 }],
            columnDefs: [{ groupId: 'g', headerName: 'G', children: [{ field: 'a' }, { field: 'b' }] }],
            initialState: savedState,
        });
        await waitFor(() => expect(order(api2)).toContain(calcId));
        await new GridColumns(api2, 'parked grouped calc col restored into its group').checkColumns(`
            CENTER
            └─┬ "G" GROUP
              ├── a "A" width:200
              ├── ${calcId} "Untitled" width:200 ƒ
              └── b "B" width:200
        `);
    });

    test('column state alone cannot restore a calc col into another grid, only grid state can', async () => {
        const rowData = [{ id: 'r1', a: 5, b: 2 }];
        const columnDefs: GridOptions['columnDefs'] = [{ field: 'a' }, { field: 'b' }];
        const api = createGrid('state-colstate-limitation-source', { rowData, columnDefs });
        const calcId = await addViaDialog(api, 'a', '[A] * 2');
        const columnStateWithCalc = api.getColumnState();
        expect(columnStateWithCalc.map((columnState) => columnState.colId)).toContain(calcId);

        // Column state carries layout only — width, sort, order, visibility — never a definition, so it has
        // no expression to build the column from. Within one grid `applyColumnState` still resurrects the
        // column because the service parked it, but a grid that never held it has nothing to resurrect.
        const columnStateOnly = createGrid('state-colstate-limitation-target', { rowData, columnDefs });
        columnStateOnly.applyColumnState({ state: columnStateWithCalc, applyOrder: true });
        await waitFor(() => expect(order(columnStateOnly)).toEqual(['a', 'b']));
        expect(columnStateOnly.getState().userColumns).toBeUndefined();

        // The same journey through grid state does restore it: `userColumns` is what carries the definition.
        const gridStateTarget = createGrid('state-colstate-limitation-gridstate', {
            rowData,
            columnDefs,
            initialState: api.getState(),
        });
        await waitFor(() => expect(order(gridStateTarget)).toEqual(['a', calcId, 'b']));
        await new GridRows(gridStateTarget, 'calc col restored via grid state, not column state - rows').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:r1 a:5 ${calcId}:10 b:2
        `);
    });

    test('editing a restored top-level calc col keeps its position and padded header among grouped columns', async () => {
        const rowData = [{ id: 'r1', athlete: 'A', age: 20, gold: 3, silver: 1 }];
        const columnDefs: GridOptions['columnDefs'] = [
            { field: 'athlete' },
            { field: 'age' },
            { headerName: 'Medals', groupId: 'medals', children: [{ field: 'gold' }, { field: 'silver' }] },
        ];
        const api = createGrid('state-toplevel-edit-source', { rowData, columnDefs });
        const calcId = await addViaDialog(api, 'athlete', '[age] * 2');
        expect(order(api)).toEqual(['athlete', calcId, 'age', 'gold', 'silver']);

        const savedState = api.getState();
        const api2 = createGrid('state-toplevel-edit-target', { rowData, columnDefs, initialState: savedState });
        await waitFor(() => expect(order(api2)).toContain(calcId));
        expect(order(api2)).toEqual(['athlete', calcId, 'age', 'gold', 'silver']);
        await new GridColumns(api2, 'restored calc col before edit').checkColumns(`
            CENTER
            ├── athlete "Athlete" width:200
            ├── ${calcId} "Untitled" width:200 ƒ
            ├── age "Age" width:200
            └─┬ "Medals" GROUP
              ├── gold "Gold" width:200
              └── silver "Silver" width:200
        `);

        await editViaDialog(api2, calcId, { title: 'Renamed' });
        expect(api2.getColumn(calcId)!.getColDef().headerName).toBe('Renamed');
        expect(order(api2)).toEqual(['athlete', calcId, 'age', 'gold', 'silver']);
        // The rebuild the edit triggers must keep the column padded to the tree depth: an unpadded leaf
        // renders at the group header's level and sorts ahead of the grouped columns.
        await new GridColumns(api2, 'restored calc col edited - layout unchanged').checkColumns(`
            CENTER
            ├── athlete "Athlete" width:200
            ├── ${calcId} "Renamed" width:200 ƒ
            ├── age "Age" width:200
            └─┬ "Medals" GROUP
              ├── gold "Gold" width:200
              └── silver "Silver" width:200
        `);
    });

    test('a calc col saved from a grouped grid is editable after restoring into an ungrouped one', async () => {
        const rowData = [{ id: 'r1', athlete: 'A', age: 20, gold: 3 }];
        const api = createGrid('state-depth-change-source', {
            rowData,
            columnDefs: [
                { field: 'athlete' },
                { headerName: 'Medals', groupId: 'medals', children: [{ field: 'gold' }, { field: 'age' }] },
            ],
        });
        const calcId = await addViaDialog(api, 'athlete', '[age] * 2');
        const savedState = api.getState();

        // The target declares the same fields with no groups, so the tree depth the restored column pads
        // to changes: it needs no padding at all here.
        const api2 = createGrid('state-depth-change-target', {
            rowData,
            columnDefs: [{ field: 'athlete' }, { field: 'gold' }, { field: 'age' }],
            initialState: savedState,
        });
        await waitFor(() => expect(order(api2)).toContain(calcId));
        await editViaDialog(api2, calcId, { title: 'Renamed' });
        expect(api2.getColumn(calcId)!.getColDef().headerName).toBe('Renamed');
        await new GridColumns(api2, 'calc col restored into an ungrouped grid').checkColumns(`
            CENTER
            ├── athlete "Athlete" width:200
            ├── ${calcId} "Renamed" width:200 ƒ
            ├── gold "Gold" width:200
            └── age "Age" width:200
        `);
    });

    // === created / restored parity ==============================================================
    // A restored calc col is rebuilt from `userColumns` rather than from the dialog bookkeeping that
    // produced it, so every behaviour has two constructions to keep honest. Each behaviour below runs
    // against a freshly created col and then against the same col recreated in a new grid from the
    // state of a destroyed one, and both runs must leave the grid in the same observable place.

    /** Exercises `check` on a calc col the dialog just created, then on the same col recreated from the
     *  saved state of a destroyed grid, asserting both runs end in an identical column and row layout.
     *  The state is captured before `check` runs, so the restored col starts where the created one did. */
    async function checkCreatedAndRestored(
        id: string,
        anchorColId: string,
        check: (api: GridApi, calcId: string) => Promise<void>
    ): Promise<{ api: GridApi; calcId: string }> {
        const rowData = [
            { id: 'r1', athlete: 'A', age: 20, gold: 3, silver: 1 },
            { id: 'r2', athlete: 'B', age: 30, gold: 1, silver: 2 },
        ];
        const columnDefs: GridOptions['columnDefs'] = [
            { field: 'athlete' },
            { field: 'age' },
            { headerName: 'Medals', groupId: 'medals', children: [{ field: 'gold' }, { field: 'silver' }] },
        ];
        const layouts: string[] = [];
        const captureLayout = async (api: GridApi, label: string) => {
            // `makeDiagram(true)` annotates structural errors, so a restored col that renders wrongly
            // differs from the created one in the compared text rather than passing quietly.
            layouts.push(new GridColumns(api, label).makeDiagram(true));
            layouts.push(new GridRows(api, label).makeDiagram(true));
        };

        const created = createGrid(`${id}-created`, { rowData, columnDefs });
        const calcId = await addViaDialog(created, anchorColId, '[age] * 2');
        const savedState = created.getState();
        await check(created, calcId);
        await captureLayout(created, `${id} created`);
        created.destroy();

        const restored = createGrid(`${id}-restored`, { rowData, columnDefs, initialState: savedState });
        await waitFor(() => expect(restored.getColumn(calcId)).not.toBeNull());
        await check(restored, calcId);
        await captureLayout(restored, `${id} restored`);
        expect(layouts[2]).toBe(layouts[0]);
        expect(layouts[3]).toBe(layouts[1]);
        return { api: restored, calcId };
    }

    // `athlete` is a top-level leaf and `gold` sits in the Medals group: the two placements take
    // different restore paths, as only a grouped col has a `parentGroupId` to resolve an anchor from.
    for (const [placement, anchorColId] of [
        ['at the top level', 'athlete'],
        ['inside a column group', 'gold'],
    ] as const) {
        describe(`created/restored parity - a calc col ${placement}`, () => {
            test('renaming it in the dialog updates the header in place', async () => {
                const { api, calcId } = await checkCreatedAndRestored(
                    `parity-rename-${anchorColId}`,
                    anchorColId,
                    async (gridApi, colId) => {
                        await editViaDialog(gridApi, colId, { title: 'Renamed' });
                    }
                );
                expect(api.getColumn(calcId)!.getColDef().headerName).toBe('Renamed');
            });

            test('editing its expression recalculates its values', async () => {
                const { api, calcId } = await checkCreatedAndRestored(
                    `parity-expression-${anchorColId}`,
                    anchorColId,
                    async (gridApi, colId) => {
                        await editViaDialog(gridApi, colId, { expression: '[age] * 3' });
                    }
                );
                expect(api.getCellValue({ rowNode: api.getDisplayedRowAtIndex(0)!, colKey: calcId })).toBe(60);
            });

            test('changing its data type in the dialog retypes it', async () => {
                const { api, calcId } = await checkCreatedAndRestored(
                    `parity-datatype-${anchorColId}`,
                    anchorColId,
                    async (gridApi, colId) => {
                        await editViaDialog(gridApi, colId, {});
                        await selectDataType('Number');
                        clickDialogButton('Apply');
                        await waitFor(() => expect(gridApi.getColumn(colId)!.getColDef().cellDataType).toBe('number'));
                    }
                );
                expect(api.getCellValue({ rowNode: api.getDisplayedRowAtIndex(0)!, colKey: calcId })).toBe(40);
            });

            test('a later dialog edit leaves it where it was moved to', async () => {
                await checkCreatedAndRestored(`parity-moved-${anchorColId}`, anchorColId, async (gridApi, colId) => {
                    gridApi.moveColumns([colId], 0);
                    await asyncSetTimeout(0);
                    await editViaDialog(gridApi, colId, { title: 'Moved' });
                });
            });

            test('a later dialog edit leaves it pinned', async () => {
                const { api, calcId } = await checkCreatedAndRestored(
                    `parity-pinned-${anchorColId}`,
                    anchorColId,
                    async (gridApi, colId) => {
                        gridApi.setColumnsPinned([colId], 'left');
                        await asyncSetTimeout(0);
                        await editViaDialog(gridApi, colId, { title: 'Pinned' });
                    }
                );
                expect(api.getColumn(calcId)!.getPinned()).toBe('left');
            });

            // Hiding drops the col from the header, so it is re-shown before the dialog edit — the point
            // is that the round trip through hidden leaves an editable col in its original place.
            test('a dialog edit after it is hidden and re-shown leaves it in place', async () => {
                const { api, calcId } = await checkCreatedAndRestored(
                    `parity-hidden-${anchorColId}`,
                    anchorColId,
                    async (gridApi, colId) => {
                        gridApi.setColumnsVisible([colId], false);
                        await asyncSetTimeout(0);
                        gridApi.setColumnsVisible([colId], true);
                        await asyncSetTimeout(0);
                        await editViaDialog(gridApi, colId, { title: 'Reshown' });
                    }
                );
                expect(api.getColumn(calcId)!.isVisible()).toBe(true);
            });

            test('sorting on it orders the rows by its values', async () => {
                await checkCreatedAndRestored(`parity-sort-${anchorColId}`, anchorColId, async (gridApi, colId) => {
                    gridApi.applyColumnState({ state: [{ colId, sort: 'desc' }] });
                    await asyncSetTimeout(0);
                });
            });

            test('removing it through its header menu drops it and its state entry', async () => {
                const { api, calcId } = await checkCreatedAndRestored(
                    `parity-removed-${anchorColId}`,
                    anchorColId,
                    async (gridApi, colId) => {
                        await removeViaMenu(gridApi, colId);
                    }
                );
                expect(api.getColumn(calcId)).toBeNull();
                expect(api.getState().userColumns).toBeUndefined();
            });

            test('a second calc col can be chained onto it', async () => {
                const { api } = await checkCreatedAndRestored(
                    `parity-chained-${anchorColId}`,
                    anchorColId,
                    async (gridApi, colId) => {
                        await addViaDialog(gridApi, colId, `[${colId}] + 1`);
                    }
                );
                expect(api.getCellValue({ rowNode: api.getDisplayedRowAtIndex(0)!, colKey: 'calculated_2' })).toBe(41);
            });
        });
    }

    // === colId allocation: an index handed out is never reused, so nothing can rebind to it ===========

    test('deleting a calc col does not free its colId for the next one added', async () => {
        const api = createGrid('state-colid-no-reuse', {
            rowData: [{ id: 'r1', a: 5, b: 2 }],
            columnDefs: [{ field: 'a' }, { field: 'b' }],
        });
        expect(await addViaDialog(api, 'a', '[A] * 2')).toBe('calculated_1');

        // Removal drops the entry outright — no tombstone, since nothing declares the column and so nothing
        // could resurrect it — leaving no record of the colId beyond the allocator's own high-water mark.
        await removeViaMenu(api, 'calculated_1');
        await waitFor(() => expect(order(api)).toEqual(['a', 'b']));
        expect(api.getState().userColumns).toBeUndefined();

        expect(await addViaDialog(api, 'a', '[B] * 100')).toBe('calculated_2');
    });

    test('a sort saved against a since-deleted calc col cannot attach to a later calc col', async () => {
        const api = createGrid('state-colid-no-reuse-sort', {
            rowData: [
                { id: 'r1', a: 5, b: 2 },
                { id: 'r2', a: 1, b: 9 },
            ],
            columnDefs: [{ field: 'a' }, { field: 'b' }],
        });
        const firstId = await addViaDialog(api, 'a', '[A] * 2');
        api.applyColumnState({ state: [{ colId: firstId, sort: 'desc' }] });
        const staleSort = api.getState().sort;
        expect(staleSort).toMatchObject({ sortModel: [{ colId: firstId, sort: 'desc' }] });

        await removeViaMenu(api, firstId);
        await waitFor(() => expect(order(api)).toEqual(['a', 'b']));
        const secondId = await addViaDialog(api, 'a', '[B] * 100');
        expect(secondId).not.toBe(firstId);

        // The stale sort alongside the live column's own entry — what an app gets by keeping a saved sort
        // across sessions, or by merging sections from two states. It names the deleted column's colId, which
        // no longer resolves to anything, rather than a column the user never sorted.
        api.setState({ userColumns: api.getState().userColumns, sort: staleSort });
        await waitFor(() => expect(order(api)).toContain(secondId));
        expect(api.getColumn(secondId)!.getSort()).toBeNull();
    });

    test('an expression referencing a deleted calc col cannot rebind to a later calc col', async () => {
        const api = createGrid('state-colid-no-reuse-reference', {
            rowData: [{ id: 'r1', a: 5, b: 2 }],
            columnDefs: [{ field: 'a' }, { field: 'b' }],
        });
        const sourceId = await addViaDialog(api, 'a', '[A] * 2');
        setTitle('Doubled');
        await waitFor(() => expect(api.getColumn(sourceId)!.getColDef().headerName).toBe('Doubled'));

        // Stored internally against `sourceId`, not against the header text, so the reference outlives the
        // column it names — which is what a recycled colId would silently satisfy.
        const dependentId = await addViaDialog(api, 'b', '[Doubled] + 1');
        const row = () => api.getDisplayedRowAtIndex(0)!;
        expect(api.getCellValue({ rowNode: row(), colKey: dependentId })).toBe(11);

        await removeViaMenu(api, sourceId);
        await waitFor(() => expect(order(api)).not.toContain(sourceId));

        const laterId = await addViaDialog(api, 'a', '[B] * 100');
        expect(laterId).not.toBe(sourceId);

        // The reference stays dangling rather than resolving to unrelated data: 201 would mean the dependent
        // column silently adopted the new one (b * 100 = 200) in place of what it was written against.
        await waitFor(() => expect(api.getCellValue({ rowNode: row(), colKey: dependentId })).toBe('#PARSE!'));
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
                colId: 'calc_1',
                created: true,
                parentGroupId: null,
                properties: [
                    { property: 'calculatedExpression', value: '[a] * 2' },
                    { property: 'cellDataType', value: 'text' },
                    { property: 'headerName', value: 'Double A' },
                ],
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

    test('overrides and removals of declared columns are inert when the module is not registered', () => {
        const userColumns: GridState['userColumns'] = [
            { colId: 'a', properties: [{ property: 'headerName', value: 'Overridden' }] },
            { colId: 'b', removed: true },
        ];
        const api = gridsManager.createGrid('state-no-module-declared', {
            rowData: [{ id: 'r1', a: 5, b: 2 }],
            columnDefs: [{ field: 'a' }, { field: 'b' }],
            initialState: { userColumns },
        });

        // With no owner to interpret them, entries must not touch the developer's columns — an applied
        // tombstone would destroy a column for a feature that is not even loaded.
        expect(api.getAllGridColumns().map((col) => col.getColId())).toEqual(['a', 'b']);
        expect(api.getColumn('a')!.getColDef().headerName).toBeUndefined();
        expect(api.getState().userColumns).toEqual(userColumns);
    });

    test('setting columnDefs clears the layer when the module is not registered', () => {
        const api = gridsManager.createGrid('state-no-module-clear', {
            rowData: [{ id: 'r1', a: 5, b: 2 }],
            columnDefs: [{ field: 'a' }, { field: 'b' }],
            initialState: { userColumns: [{ colId: 'b', removed: true }] },
        });
        expect(api.getState().userColumns).toHaveLength(1);

        // Clearing cannot depend on an owning service that was never registered.
        api.setGridOption('columnDefs', [{ field: 'a' }, { field: 'b' }]);
        expect(api.getState().userColumns).toBeUndefined();
    });
});
