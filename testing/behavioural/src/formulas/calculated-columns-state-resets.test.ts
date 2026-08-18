import { waitFor } from '@testing-library/dom';
import { GridColumns, GridRows } from 'ag-test-utils';

import type { GridOptions } from 'ag-grid-community';

import {
    STATIC_ROW_DATA,
    addViaDialog,
    cellValue,
    createGrid,
    editViaDialog,
    entryOf,
    order,
    removeViaMenu,
    setTitle,
    setupCalculatedColumnsStateSuite,
    staticColumnDefs,
} from './calculatedColumnsStateHarness';

describe('calculated columns - grid state persistence - resets and reclaims', () => {
    setupCalculatedColumnsStateSuite();

    // A `columnDefs` change is the developer declaring the column set afresh, so it reclaims the declared
    // column and drops the user's calc-col edits and deletions with it. Only state saved beforehand brings
    // them back.
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
