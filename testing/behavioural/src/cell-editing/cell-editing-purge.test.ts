import { findByTestId, waitFor } from '@testing-library/dom';
import { userEvent } from '@testing-library/user-event';
import { GridRows, TestGridsManager, waitForInput } from 'ag-test-utils';

import type { CellEditingStoppedEvent, GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    NumberEditorModule,
    PinnedRowModule,
    RenderApiModule,
    TextEditorModule,
    agTestIdFor,
    getGridElement,
    setupAgTestIds,
} from 'ag-grid-community';
import { BatchEditModule, PivotModule, RowGroupingEditModule, RowGroupingModule } from 'ag-grid-enterprise';

/**
 * A row or column leaving the grid ends its own edits rather than a sweep noticing later. These cover the
 * departures that leave the node alive, which a destroy hook on its own would miss.
 */
describe('Cell editing: purging edits on departure', () => {
    const gridsManager = new TestGridsManager({
        includeDefaultModules: true,
        modules: [
            ClientSideRowModelModule,
            NumberEditorModule,
            PinnedRowModule,
            TextEditorModule,
            RenderApiModule,
            BatchEditModule,
            PivotModule,
            RowGroupingModule,
            RowGroupingEditModule,
        ],
    });

    beforeAll(() => setupAgTestIds());
    afterEach(() => gridsManager.reset());

    /** Polls rather than reads once: a row renders a tick or two after the state change that added it. */
    const cell = (api: GridApi, rowId: string, colId: string): Promise<HTMLElement> =>
        findByTestId(getGridElement(api)! as HTMLElement, agTestIdFor.cell(rowId, colId));

    /** Opens the cell's editor and types `value` into it, leaving it uncommitted. */
    const type = async (api: GridApi, rowId: string, colId: string, value: string): Promise<void> => {
        const gridDiv = getGridElement(api)! as HTMLElement;
        const target = await cell(api, rowId, colId);
        await userEvent.dblClick(target);
        const input = await waitForInput(gridDiv, target);
        await userEvent.clear(input);
        await userEvent.type(input, value);
    };

    /** Types `value` into the cell and commits with Enter, staging it as a pending batch edit. */
    const stage = async (api: GridApi, rowId: string, colId: string, value: string): Promise<void> => {
        await type(api, rowId, colId, `${value}{Enter}`);
    };

    // Entering pivot mode parks the primary columns out of colsList while leaving them alive, so a
    // destroy-only hook would strand the edit staged on one.
    test('entering pivot mode purges an edit staged on a parked primary column', async () => {
        const api = await gridsManager.createGridAndWait('purge-pivot-enter', {
            columnDefs: [
                { field: 'country', rowGroup: true },
                { field: 'sport', pivot: true },
                { field: 'gold', aggFunc: 'sum' },
                { field: 'note', editable: true },
            ],
            rowData: [
                { id: '0', country: 'Russia', sport: 'Gymnastics', gold: 3, note: 'a' },
                { id: '1', country: 'USA', sport: 'Swimming', gold: 2, note: 'b' },
            ],
            getRowId: (params) => params.data.id,
            groupDefaultExpanded: -1,
        } satisfies GridOptions);

        const stopped: CellEditingStoppedEvent[] = [];
        api.addEventListener('cellEditingStopped', (e) => stopped.push(e));

        api.startBatchEdit();

        await new GridRows(api, 'pivot: grouped rows before any edit').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Russia ag-Grid-AutoColumn:"Russia" gold:3
            │ └── LEAF id:0 country:"Russia" sport:"Gymnastics" gold:3 note:"a"
            └─┬ LEAF_GROUP id:row-group-country-USA ag-Grid-AutoColumn:"USA" gold:2
            · └── LEAF id:1 country:"USA" sport:"Swimming" gold:2 note:"b"
        `);

        await stage(api, '1', 'note', 'EDITED');

        await waitFor(() => {
            expect(api.getEditingCells()).toHaveLength(1);
            expect(stopped).toHaveLength(1); // the editor closed as it staged
        });

        await new GridRows(api, 'pivot: note staged as pending on the primary column').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Russia ag-Grid-AutoColumn:"Russia" gold:3
            │ └── LEAF id:0 country:"Russia" sport:"Gymnastics" gold:3 note:"a"
            └─┬ LEAF_GROUP id:row-group-country-USA ag-Grid-AutoColumn:"USA" gold:2
            · └── LEAF ⏳ id:1 country:"USA" sport:"Swimming" gold:2 note:⏳"EDITED" "b"
        `);

        api.setGridOption('pivotMode', true);

        // The primary column is parked, so its staged edit went with it rather than lingering unreachable.
        await waitFor(() => {
            expect(api.getEditingCells()).toHaveLength(0);
            expect(stopped).toHaveLength(1); // already stopped once; the purge must not fire a second
        });

        await new GridRows(api, 'pivot: primaries parked, staged edit purged').check(`
            ROOT id:ROOT_NODE_ID pivot_sport_Gymnastics_gold:3 pivot_sport_Swimming_gold:2
            ├─┬ LEAF_GROUP collapsed id:row-group-country-Russia ag-Grid-AutoColumn:"Russia" pivot_sport_Gymnastics_gold:3 pivot_sport_Swimming_gold:null
            │ └── LEAF hidden id:0 pivot_sport_Gymnastics_gold:3 pivot_sport_Swimming_gold:3
            └─┬ LEAF_GROUP collapsed id:row-group-country-USA ag-Grid-AutoColumn:"USA" pivot_sport_Gymnastics_gold:null pivot_sport_Swimming_gold:2
            · └── LEAF hidden id:1 pivot_sport_Gymnastics_gold:2 pivot_sport_Swimming_gold:2
        `);
    });

    // Leaving pivot mode brings the parked primaries back. The purge must not have left the column in a
    // half-torn-down state: a fresh edit on it has to behave normally.
    test('a column purged by pivot parking is editable again once pivot mode is left', async () => {
        const api = await gridsManager.createGridAndWait('purge-pivot-round-trip', {
            columnDefs: [
                { field: 'country', rowGroup: true },
                { field: 'sport', pivot: true },
                { field: 'gold', aggFunc: 'sum' },
                { field: 'note', editable: true },
            ],
            rowData: [
                { id: '0', country: 'Russia', sport: 'Gymnastics', gold: 3, note: 'a' },
                { id: '1', country: 'USA', sport: 'Swimming', gold: 2, note: 'b' },
            ],
            getRowId: (params) => params.data.id,
            groupDefaultExpanded: -1,
        } satisfies GridOptions);

        api.startBatchEdit();

        await new GridRows(api, 'pivot round trip: grouped rows before the edit').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Russia ag-Grid-AutoColumn:"Russia" gold:3
            │ └── LEAF id:0 country:"Russia" sport:"Gymnastics" gold:3 note:"a"
            └─┬ LEAF_GROUP id:row-group-country-USA ag-Grid-AutoColumn:"USA" gold:2
            · └── LEAF id:1 country:"USA" sport:"Swimming" gold:2 note:"b"
        `);

        await stage(api, '1', 'note', 'EDITED');
        await waitFor(() => expect(api.getEditingCells()).toHaveLength(1)); // staged, before pivot parks it

        api.setGridOption('pivotMode', true);
        await waitFor(() => expect(api.getEditingCells()).toHaveLength(0));

        api.setGridOption('pivotMode', false);

        await new GridRows(api, 'pivot round trip: purged edit did not come back').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Russia ag-Grid-AutoColumn:"Russia" gold:3
            │ └── LEAF id:0 country:"Russia" sport:"Gymnastics" gold:3 note:"a"
            └─┬ LEAF_GROUP id:row-group-country-USA ag-Grid-AutoColumn:"USA" gold:2
            · └── LEAF id:1 country:"USA" sport:"Swimming" gold:2 note:"b"
        `);

        // The column survived its own purge, so it still stages and commits normally.
        await stage(api, '1', 'note', 'AGAIN');
        await waitFor(() => expect(api.getEditingCells()).toHaveLength(1));

        await new GridRows(api, 'pivot round trip: fresh edit staged after the purge').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Russia ag-Grid-AutoColumn:"Russia" gold:3
            │ └── LEAF id:0 country:"Russia" sport:"Gymnastics" gold:3 note:"a"
            └─┬ LEAF_GROUP id:row-group-country-USA ag-Grid-AutoColumn:"USA" gold:2
            · └── LEAF ⏳ id:1 country:"USA" sport:"Swimming" gold:2 note:⏳"AGAIN" "b"
        `);

        api.commitBatchEdit();

        await new GridRows(api, 'pivot round trip: fresh edit committed').check(`
            ROOT id:ROOT_NODE_ID
            ├─┬ LEAF_GROUP id:row-group-country-Russia ag-Grid-AutoColumn:"Russia" gold:3
            │ └── LEAF id:0 country:"Russia" sport:"Gymnastics" gold:3 note:"a"
            └─┬ LEAF_GROUP id:row-group-country-USA ag-Grid-AutoColumn:"USA" gold:2
            · └── LEAF id:1 country:"USA" sport:"Swimming" gold:2 note:"AGAIN"
        `);
    });

    // Static pinned rows leave their section without being destroyed, so they cannot report their own
    // departure — the one case still resolved by a sweep, on pinnedRowsChanged.
    test('replacing pinnedTopRowData purges an edit staged on the removed pinned row', async () => {
        const api = await gridsManager.createGridAndWait('purge-pinned', {
            columnDefs: [{ field: 'a' }, { field: 'b' }],
            rowData: [{ id: '0', a: 'A0', b: 'B0' }],
            pinnedTopRowData: [{ id: 'PIN', a: 'PIN-A', b: 'PIN-B' }],
            defaultColDef: { editable: true },
            getRowId: (params) => params.data.id,
        } satisfies GridOptions);

        const stopped: CellEditingStoppedEvent[] = [];
        api.addEventListener('cellEditingStopped', (e) => stopped.push(e));

        api.startBatchEdit();

        await new GridRows(api, 'pinned row present before the edit').check(`
            PINNED_TOP id:PIN a:"PIN-A" b:"PIN-B"
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 a:"A0" b:"B0"
        `);

        await stage(api, 'PIN', 'a', 'EDITED');

        await waitFor(() => {
            expect(api.getEditingCells()).toHaveLength(1);
            expect(stopped).toHaveLength(1);
        });

        await new GridRows(api, 'pinned row edit staged as pending').check(`
            PINNED_TOP id:PIN a:⏳"EDITED" "PIN-A" b:"PIN-B"
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 a:"A0" b:"B0"
        `);

        api.setGridOption('pinnedTopRowData', [{ id: 'OTHER', a: 'OTHER-A', b: 'OTHER-B' }]);

        await waitFor(() => {
            expect(api.getEditingCells()).toHaveLength(0);
            expect(stopped).toHaveLength(1);
        });

        await new GridRows(api, 'pinned row replaced, its staged edit purged').check(`
            PINNED_TOP id:OTHER a:"OTHER-A" b:"OTHER-B"
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 a:"A0" b:"B0"
        `);
    });

    // The purge runs before the node's position is cleared, so the event reports where the row actually
    // was rather than a null index.
    test('a row removed mid-edit reports its real rowIndex on cellEditingStopped', async () => {
        const rowData = [
            { id: '0', a: 'A0', b: 'B0' },
            { id: '1', a: 'A1', b: 'B1' },
        ];
        const api = await gridsManager.createGridAndWait('purge-row-index', {
            columnDefs: [{ field: 'a' }, { field: 'b' }],
            rowData,
            defaultColDef: { editable: true },
            getRowId: (params) => params.data.id,
        } satisfies GridOptions);

        const stopped: CellEditingStoppedEvent[] = [];
        api.addEventListener('cellEditingStopped', (e) => stopped.push(e));

        await new GridRows(api, 'two rows before the edit').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 a:"A0" b:"B0"
            └── LEAF id:1 a:"A1" b:"B1"
        `);

        await type(api, '1', 'a', 'CHANGED');

        await new GridRows(api, 'row 1 mid-edit, uncommitted').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 a:"A0" b:"B0"
            └── LEAF 🖍️ id:1 a:🖍️"CHANGED" "A1" b:"B1"
        `);

        api.applyTransaction({ remove: [rowData[1]] });

        // cellEditingStopped flushes off the async event queue, not synchronously with the transaction.
        await waitFor(() => expect(stopped).toHaveLength(1));
        expect(stopped[0].rowIndex).toBe(1);
        expect(stopped[0].node.id).toBe('1');

        await new GridRows(api, 'row 1 removed mid-edit').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 a:"A0" b:"B0"
        `);
    });

    // The removal takes the cell controller with it, so the event's value has to be resolved from the model.
    // Read as the raw field it would report neither the pending edit nor anything at all for a computed column.
    test('a column removal reports the value being edited, computed or not', async () => {
        const rowData = [{ id: '0', a: 'A0' }];
        const api = await gridsManager.createGridAndWait('purge-computed-value', {
            columnDefs: [
                { field: 'a' },
                {
                    colId: 'shout',
                    editable: true,
                    valueGetter: ({ data }) => (data ? `${data.a}!` : null),
                    valueSetter: (params) => {
                        params.data.a = String(params.newValue).replace(/!$/, '');
                        return true;
                    },
                },
            ],
            rowData,
            getRowId: (params) => params.data.id,
        } satisfies GridOptions);

        const stopped: CellEditingStoppedEvent[] = [];
        api.addEventListener('cellEditingStopped', (e) => stopped.push(e));

        await type(api, '0', 'shout', 'LOUD');

        await new GridRows(api, 'computed column mid-edit, uncommitted').check(`
            ROOT id:ROOT_NODE_ID shout:null
            └── LEAF 🖍️ id:0 a:"A0" shout:🖍️"LOUD" "A0!"
        `);

        api.setGridOption('columnDefs', [{ field: 'a' }]);

        // cellEditingStopped flushes off the async event queue, not synchronously with the column rebuild.
        await waitFor(() => expect(stopped).toHaveLength(1));
        expect(stopped[0].value).toBe('LOUD');
        expect(rowData[0].a).toBe('A0'); // the purge cancels, so nothing was written

        await new GridRows(api, 'the computed column and its edit are gone').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 a:"A0"
        `);
    });

    // Tearing the grid down must not surface edit events: listeners are unsubscribing, and a stop reaching
    // a half-destroyed grid has nothing meaningful to report.
    test('destroying the grid mid-edit fires no cellEditingStopped', async () => {
        const api = await gridsManager.createGridAndWait('purge-grid-destroy', {
            columnDefs: [{ field: 'a' }, { field: 'b' }],
            rowData: [{ id: '0', a: 'A0', b: 'B0' }],
            defaultColDef: { editable: true },
            getRowId: (params) => params.data.id,
        } satisfies GridOptions);

        const stopped: CellEditingStoppedEvent[] = [];
        api.addEventListener('cellEditingStopped', (e) => stopped.push(e));

        await new GridRows(api, 'one row before the edit').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 a:"A0" b:"B0"
        `);

        await type(api, '0', 'a', 'CHANGED');

        await new GridRows(api, 'editing before the grid is destroyed').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF 🖍️ id:0 a:🖍️"CHANGED" "A0" b:"B0"
        `);

        await new GridRows(api, 'row 0 mid-edit before grid destroy').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF 🖍️ id:0 a:🖍️"CHANGED" "A0" b:"B0"
        `);

        // destroy() checks its own destroyCalled flag synchronously before the purge would fire, so no
        // event escapes it — nothing async to wait on for a call that never happens.
        api.destroy();

        expect(stopped).toHaveLength(0);
    });

    // The purge dispatches synchronously from the column rebuild, so a stopped listener must never see
    // the departing column still in the grid's column list.
    test('a column removal purges its edits without exposing the departing column to listeners', async () => {
        const api = await gridsManager.createGridAndWait('purge-col-order', {
            columnDefs: [
                { field: 'a', editable: true },
                { field: 'b', editable: true },
            ],
            rowData: [{ id: '1', a: '1', b: '2' }],
            getRowId: ({ data }) => data.id,
        } satisfies GridOptions);

        const colsDuringStop: string[][] = [];
        const displayedColsDuringStop: string[][] = [];
        api.addEventListener('cellEditingStopped', () => {
            colsDuringStop.push(api.getAllGridColumns().map((c) => c.getColId()));
            displayedColsDuringStop.push(api.getAllDisplayedColumns().map((c) => c.getColId()));
        });

        await type(api, '1', 'a', 'EDITED');
        expect(api.getEditingCells()).toHaveLength(1);

        await new GridRows(api, 'editing a, before its column is removed').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF 🖍️ id:1 a:🖍️"EDITED" "1" b:"2"
        `);

        api.setGridOption('columnDefs', [{ field: 'b', editable: true }]);

        // cellEditingStopped flushes off the async event queue, not synchronously with the column rebuild.
        await waitFor(() => expect(colsDuringStop).toEqual([['b']])); // 'a' already out of colsList when the stop was observed
        expect(api.getEditingCells()).toHaveLength(0);
        expect(displayedColsDuringStop).toEqual([['b']]); // ...and out of the derived state, not just colsList

        await new GridRows(api, 'column a removed, its edit purged').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:1 b:"2"
        `);
    });

    // A row-level error is recorded against the row, not a cell, so purging the edit that caused it must
    // take the error with it — nothing else revisits it until the row's next stop.
    test('a column removal purges the row-level error its edit had caused', async () => {
        const api = await gridsManager.createGridAndWait('purge-row-validation', {
            columnDefs: [
                { field: 'a', editable: true },
                { field: 'b', editable: true },
            ],
            rowData: [{ id: '1', a: '1', b: '2' }],
            getRowId: ({ data }) => data.id,
            editType: 'fullRow',
            invalidEditValueMode: 'block',
            getFullRowEditValidationErrors: ({ editorsState }) =>
                editorsState.find((e) => e.colId === 'a')?.newValue === 'BAD' ? ['a must not be BAD'] : [],
        } satisfies GridOptions);

        const rowElement = () => getGridElement(api)!.querySelector('.ag-row[row-index="0"]')!;

        await type(api, '1', 'a', 'BAD');
        expect(rowElement().classList.contains('ag-row-editing-invalid')).toBe(true);

        await new GridRows(api, 'the edit in column a that breaks the row rule').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF 🖍️ id:1 a:🖍️"BAD" "1" b:"2"
        `);

        api.setGridOption('columnDefs', [{ field: 'b', editable: true }]);

        // The row edit carries on through column b, so the stale error would still be styling it as invalid.
        await waitFor(() => expect(rowElement().classList.contains('ag-row-editing-invalid')).toBe(false));
        expect(api.getEditingCells()).toHaveLength(1);

        await new GridRows(api, 'column a gone: the row error went with its edit').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF 🖍️ id:1 b:"2"
        `);
    });

    // The other side of it: what the row still holds can break the rule on its own, so the purge has to
    // recompute the row error rather than assume the departing edit was the only cause.
    test('a column removal keeps a row-level error the remaining edit still causes', async () => {
        const api = await gridsManager.createGridAndWait('purge-row-validation-retained', {
            columnDefs: [
                { field: 'a', editable: true },
                { field: 'b', editable: true },
            ],
            rowData: [{ id: '1', a: '1', b: '2' }],
            getRowId: ({ data }) => data.id,
            editType: 'fullRow',
            invalidEditValueMode: 'block',
            // Either column can break the rule, so removing one leaves the other's breach standing.
            getFullRowEditValidationErrors: ({ editorsState }) =>
                editorsState.some((e) => e.newValue === 'BAD') ? ['no cell may be BAD'] : [],
        } satisfies GridOptions);

        const rowElement = () => getGridElement(api)!.querySelector('.ag-row[row-index="0"]')!;

        await type(api, '1', 'b', 'BAD');
        await type(api, '1', 'a', 'ALSO BAD');
        expect(rowElement().classList.contains('ag-row-editing-invalid')).toBe(true);

        await new GridRows(api, 'both edits in place, each breaking the row rule').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF 🖍️ id:1 a:🖍️"ALSO BAD" "1" b:🖍️"BAD" "2"
        `);

        api.setGridOption('columnDefs', [{ field: 'b', editable: true }]);

        // column a's editing cell drops out of the count once the rebuild lands; b's stays.
        await waitFor(() => expect(api.getEditingCells()).toHaveLength(1));

        // b is still BAD, so the row is still invalid — and still blocked from committing.
        expect(rowElement().classList.contains('ag-row-editing-invalid')).toBe(true);

        await new GridRows(api, 'column a gone: the remaining edit still breaks the row rule').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF 🖍️ id:1 b:🖍️"BAD" "2"
        `);
    });
});
