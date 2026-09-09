import { waitFor } from '@testing-library/dom';
import { ALL_SEVERITIES, GridRows, asyncSetTimeout, clickMenuOption } from 'ag-test-utils';
import { vi } from 'vitest';

import type { GridApi, GridOptions, GridState } from 'ag-grid-community';
import { enableDevValidations } from 'ag-grid-community';

import {
    STATIC_ROW_DATA,
    UNTYPED_PROPERTIES,
    addViaDialog,
    cellValue,
    clickDialogButton,
    createGrid,
    editViaDialog,
    entryOf,
    getDialog,
    order,
    propertiesOf,
    removeViaMenu,
    selectDataType,
    setExpression,
    setupCalculatedColumnsStateSuite,
    staticColumnDefs,
} from './calculatedColumnsStateHarness';

describe('calculated columns - grid state persistence - overrides of columnDefs-declared calc cols', () => {
    setupCalculatedColumnsStateSuite();

    // === deferred apply mode: only committed columns reach the state ==============================
    test('under deferred apply mode a calc col reaches getState only once Apply is clicked', async () => {
        const api = createGrid('state-deferred-apply', {
            calculatedColumns: { applyMode: 'deferred' },
            rowData: [{ id: 'r1', a: 5, b: 2 }],
            columnDefs: [{ field: 'a' }, { field: 'b' }],
        });

        api.showColumnMenu('a');
        await clickMenuOption('Add Calculated Column');
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
        await clickMenuOption('Add Calculated Column');
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
        await clickMenuOption('Add Calculated Column');
        await waitFor(() => getDialog());
        setExpression('[A] * 2');
        clickDialogButton('Apply');
        await waitFor(() => expect(api.getColumn('calculated_1')).toBeTruthy());

        api.showColumnMenu('calculated_1');
        await clickMenuOption('Edit Calculated Column');
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
        // Suppression stops the throw but not the log, by design, so hold the console and assert #319 fires.
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
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
        expect(warn.mock.calls.flat().join(' ')).toContain('#319');
        warn.mockRestore();

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
        await clickMenuOption('Edit Calculated Column');
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
});
