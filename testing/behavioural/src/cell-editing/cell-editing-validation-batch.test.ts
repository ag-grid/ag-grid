import { getByTestId, waitFor } from '@testing-library/dom';
import { userEvent } from '@testing-library/user-event';

import type {
    BatchEditingStoppedEvent,
    CellEditingStoppedEvent,
    ColDef,
    GridApi,
    GridOptions,
    ICellEditorComp,
    ICellEditorParams,
} from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    CustomEditorModule,
    NumberEditorModule,
    RenderApiModule,
    ScrollApiModule,
    TextEditorModule,
    UndoRedoEditModule,
    agTestIdFor,
    getGridElement,
    setupAgTestIds,
} from 'ag-grid-community';
import { BatchEditModule } from 'ag-grid-enterprise';

import {
    EditEventTracker,
    GridRows,
    TestGridsManager,
    asyncSetTimeout,
    waitForInput,
    waitForPopup,
} from '../test-utils';

interface PersonRow {
    athlete: string;
    age: number;
}

const columnDefs: ColDef<PersonRow>[] = [
    { field: 'athlete', cellEditor: 'agTextCellEditor', cellEditorParams: { maxLength: 10 } },
    { field: 'age', cellEditor: 'agNumberCellEditor', cellEditorParams: { min: 0, max: 100 } },
];

function makeRowData(): PersonRow[] {
    return [
        { athlete: 'Alice', age: 23 },
        { athlete: 'Bob', age: 40 },
    ];
}

/** Carries its validation on the component, so nothing in the colDefs advertises validation. */
class ValidatingEditor implements ICellEditorComp {
    private eGui!: HTMLInputElement;

    public init(params: ICellEditorParams): void {
        this.eGui = document.createElement('input');
        this.eGui.value = String(params.value ?? '');
    }

    public getGui(): HTMLElement {
        return this.eGui;
    }

    public afterGuiAttached(): void {
        this.eGui.focus();
    }

    public getValue(): string {
        return this.eGui.value;
    }

    public getValidationErrors(): string[] | null {
        return this.eGui.value === 'INVALID' ? ['Custom editor rejected value'] : null;
    }
}

/** Picker-style editor that commits itself via params.stopEditing(), like agSelectCellEditor on pick. */
class DoneCellEditor implements ICellEditorComp {
    private eGui!: HTMLElement;
    private value: any;

    public init(params: ICellEditorParams): void {
        this.value = params.value;
        this.eGui = document.createElement('div');
        const button = document.createElement('button');
        button.textContent = 'Done';
        button.setAttribute('data-testid', 'done-button');
        button.addEventListener('click', () => {
            this.value = 'picked';
            params.stopEditing(false);
        });
        this.eGui.appendChild(button);
    }

    public getGui(): HTMLElement {
        return this.eGui;
    }

    public getValue(): any {
        return this.value;
    }
}

describe('Cell editing validation + batch editing', () => {
    const gridsManager = new TestGridsManager({
        includeDefaultModules: true,
        modules: [
            ClientSideRowModelModule,
            CustomEditorModule,
            NumberEditorModule,
            TextEditorModule,
            RenderApiModule,
            ScrollApiModule,
            BatchEditModule,
            UndoRedoEditModule,
        ],
    });

    beforeAll(() => {
        setupAgTestIds();
    });

    afterEach(() => {
        gridsManager.reset();
        vi.clearAllMocks();
    });

    const cell = (api: GridApi, rowIndex: number, colId: string): HTMLElement => {
        const gridDiv = getGridElement(api)! as HTMLElement;
        return getByTestId(gridDiv, agTestIdFor.cell(String(rowIndex), colId));
    };

    const editorCount = (api: GridApi): number => api.getCellEditorInstances().length;

    describe('editType: singleCell', () => {
        const editType = 'singleCell' as const;
        const create = async (invalidEditValueMode: 'revert' | 'block', rowData: PersonRow[]) =>
            gridsManager.createGridAndWait(`validation-batch-${editType}-${invalidEditValueMode}`, {
                columnDefs,
                rowData,
                defaultColDef: { editable: true },
                editType,
                invalidEditValueMode,
            } satisfies GridOptions<PersonRow>);

        // Block mode holds an invalid editor open, but a closed popup has no DOM left to hold. In a batch
        // this must still leave the cell usable — re-opening it must give a working editor, not an
        // inaccessible held one whose popup is gone.
        test('block batch: an invalid popup editor closed by focus loss leaves the cell editable', async () => {
            const rowData = makeRowData();
            const api = await gridsManager.createGridAndWait('validation-batch-popup-block', {
                columnDefs: [
                    { field: 'athlete' },
                    {
                        field: 'age',
                        cellEditor: 'agNumberCellEditor',
                        cellEditorPopup: true,
                        cellEditorParams: { min: 0, max: 100 },
                    },
                ],
                rowData,
                defaultColDef: { editable: true },
                editType: 'singleCell',
                invalidEditValueMode: 'block',
                stopEditingWhenCellsLoseFocus: true,
            } satisfies GridOptions<PersonRow>);
            const gridDiv = getGridElement(api)! as HTMLElement;

            api.startBatchEdit();
            // rows render asynchronously: poll until the cell lookup succeeds
            await waitFor(() => cell(api, 0, 'age'));

            await userEvent.dblClick(cell(api, 0, 'age'));
            const popup = await waitForPopup(gridDiv);
            const input = popup.querySelector<HTMLInputElement>('input')!;
            await userEvent.clear(input);
            await userEvent.type(input, '999'); // invalid

            await new GridRows(api, 'batch popup: invalid 999 open in popup').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF 🖍️ ❌ id:0 athlete:"Alice" age:23❌
                └── LEAF id:1 athlete:"Bob" age:40
            `);

            // Click away: the popup closes, so an invalid value cannot stay held in it.
            await userEvent.click(document.body);

            expect(rowData[0].age).toBe(23); // nothing invalid committed
            // The reverted attempt's error goes with it: this cell is neither editing nor invalid.
            expect(api.getEditValidationErrors()).toEqual([]);

            await new GridRows(api, 'batch popup: invalid attempt reverted on popup close').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Alice" age:23
                └── LEAF id:1 athlete:"Bob" age:40
            `);

            // Re-open the cell: a fresh, usable popup editor must appear and accept a correction.
            await userEvent.dblClick(cell(api, 0, 'age'));
            const reopened = await waitForPopup(gridDiv);
            const reopenedInput = reopened.querySelector<HTMLInputElement>('input')!;
            expect(reopenedInput).toBeTruthy();
            expect(reopenedInput.disabled).toBe(false);

            await userEvent.clear(reopenedInput);
            await userEvent.type(reopenedInput, '55{Enter}');

            api.commitBatchEdit();

            expect(rowData[0].age).toBe(55);
            expect(api.isBatchEditing()).toBe(false);

            await new GridRows(api, 'batch popup: corrected 55 committed, batch ended').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Alice" age:55
                └── LEAF id:1 athlete:"Bob" age:40
            `);
        });

        // A staged batch edit's editor has already stopped (cellEditingStopped fired once). Removing its
        // row purges the staged edit off-screen; that purge must NOT fire a second cellEditingStopped.
        test('removing a staged batch row fires cellEditingStopped once, not twice', async () => {
            const rowData = makeRowData();
            const api = await create('block', rowData);
            const gridDiv = getGridElement(api)! as HTMLElement;
            const tracker = new EditEventTracker(api);

            api.startBatchEdit();
            // rows render asynchronously: poll until the cell lookup succeeds
            await waitFor(() => cell(api, 0, 'age'));

            const ageCell = cell(api, 0, 'age');
            await userEvent.dblClick(ageCell);
            const ageInput = await waitForInput(gridDiv, ageCell);
            await userEvent.clear(ageInput);
            await userEvent.type(ageInput, '55{Enter}'); // stage valid 55; editor closes, stopped #1

            expect(tracker.counts.cellEditingStarted).toBe(1);
            expect(tracker.counts.cellEditingStopped).toBe(1);

            await new GridRows(api, 'batch: 55 staged as pending before row removal').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF ⏳ id:0 athlete:"Alice" age:⏳55 23
                └── LEAF id:1 athlete:"Bob" age:40
            `);

            api.applyTransaction({ remove: [rowData[0]] });

            // The purge of the staged edit must not emit a duplicate stopped for an already-closed editor.
            expect(tracker.counts.cellEditingStopped).toBe(1);
            tracker.destroy();

            await new GridRows(api, 'batch: staged row removed, edit purged').check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:1 athlete:"Bob" age:40
            `);
        });

        // The same purge reached by removing the COLUMN rather than the row: _destroyEditor runs again
        // for an edit whose editor already closed, and must not emit a second cellEditingStopped.
        test('removing a staged batch column fires cellEditingStopped once, not twice', async () => {
            const rowData = makeRowData();
            const api = await create('block', rowData);
            const gridDiv = getGridElement(api)! as HTMLElement;
            const tracker = new EditEventTracker(api);

            api.startBatchEdit();
            // rows render asynchronously: poll until the cell lookup succeeds
            await waitFor(() => cell(api, 0, 'age'));

            const ageCell = cell(api, 0, 'age');
            await userEvent.dblClick(ageCell);
            const ageInput = await waitForInput(gridDiv, ageCell);
            await userEvent.clear(ageInput);
            await userEvent.type(ageInput, '55{Enter}'); // stage valid 55; editor closes, stopped #1

            expect(tracker.counts.cellEditingStarted).toBe(1);
            expect(tracker.counts.cellEditingStopped).toBe(1);

            await new GridRows(api, 'batch: 55 staged as pending before column removal').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF ⏳ id:0 athlete:"Alice" age:⏳55 23
                └── LEAF id:1 athlete:"Bob" age:40
            `);

            api.setGridOption('columnDefs', [{ field: 'athlete' }]);

            expect(tracker.counts.cellEditingStopped).toBe(1);
            tracker.destroy();

            await new GridRows(api, 'batch: staged column removed, edit purged').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Alice"
                └── LEAF id:1 athlete:"Bob"
            `);
        });

        test('block: commitBatchEdit is rejected while invalid, then commits after the fix', async () => {
            const rowData = makeRowData();
            const api = await create('block', rowData);
            const gridDiv = getGridElement(api)! as HTMLElement;
            const stopped: BatchEditingStoppedEvent[] = [];
            api.addEventListener('batchEditingStopped', (e) => stopped.push(e));

            api.startBatchEdit();
            // rows render asynchronously: poll until the cell lookup succeeds
            await waitFor(() => cell(api, 0, 'age'));

            const ageCell = cell(api, 0, 'age');
            await userEvent.dblClick(ageCell);
            const ageInput = await waitForInput(gridDiv, ageCell);
            await userEvent.clear(ageInput);
            await userEvent.type(ageInput, '999');
            await userEvent.keyboard('{Enter}');
            await waitFor(() => expect(api.getEditValidationErrors()?.length ?? 0).toBeGreaterThan(0));

            // block mode keeps the invalid editor open rather than staging it
            expect(editorCount(api)).toBeGreaterThan(0);

            // Pre-commit: invalid 999 held in the open editor (🖍️ + ❌), nothing written yet.
            await new GridRows(api, 'block: invalid 999 held open before commit').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF 🖍️ ❌ id:0 athlete:"Alice" age:23❌
                └── LEAF id:1 athlete:"Bob" age:40
            `);

            api.commitBatchEdit();

            // Block mode rejects the commit: nothing is written, the editor stays open, and the
            // batch session is held so the user can correct the value. No batchEditingStopped fires.
            expect(rowData[0].age).toBe(23);
            expect(api.isBatchEditing()).toBe(true);
            expect(editorCount(api)).toBeGreaterThan(0);
            expect(stopped).toHaveLength(0);

            // Rejected commit held the batch: invalid 999 still in the editor (🖍️ + ❌), data still 23.
            await new GridRows(api, 'block: rejected commit held, invalid value still open').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF 🖍️ ❌ id:0 athlete:"Alice" age:23❌
                └── LEAF id:1 athlete:"Bob" age:40
            `);

            // Correct the value and re-commit: the batch now ends and the corrected value lands.
            const ageInputAgain = await waitForInput(gridDiv, cell(api, 0, 'age'));
            await userEvent.clear(ageInputAgain);
            await userEvent.type(ageInputAgain, '55{Enter}');

            api.commitBatchEdit();
            await waitFor(() => expect(stopped).toHaveLength(1));

            expect(rowData[0].age).toBe(55);
            expect(api.isBatchEditing()).toBe(false);
            expect(stopped[0].changes).toEqual([
                { rowIndex: 0, rowPinned: undefined, columnId: 'age', oldValue: 23, newValue: 55 },
            ]);

            // Batch ended, corrected value committed, no pending/invalid markers remain.
            await new GridRows(api, 'block: corrected value committed, batch ended').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Alice" age:55
                └── LEAF id:1 athlete:"Bob" age:40
            `);
        });

        // api.stopEditing() closes a batch's editors without ending the batch. Block mode must hold there
        // as on every other stop path, or the invalid value and its staged edit are dropped silently.
        test('block: api.stopEditing() holds the invalid editor rather than discarding the edit', async () => {
            const rowData = makeRowData();
            const api = await create('block', rowData);
            const gridDiv = getGridElement(api)! as HTMLElement;

            api.startBatchEdit();
            // rows render asynchronously: poll until the cell lookup succeeds
            await waitFor(() => cell(api, 0, 'age'));

            const ageCell = cell(api, 0, 'age');
            await userEvent.dblClick(ageCell);
            const ageInput = await waitForInput(gridDiv, ageCell);
            await userEvent.clear(ageInput);
            await userEvent.type(ageInput, '999');
            await waitFor(() => expect(api.getEditValidationErrors()?.length ?? 0).toBeGreaterThan(0));

            api.stopEditing();

            expect(editorCount(api)).toBeGreaterThan(0);
            expect(api.isBatchEditing()).toBe(true);

            await new GridRows(api, 'block: api.stopEditing() held the invalid editor').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF 🖍️ ❌ id:0 athlete:"Alice" age:23❌
                └── LEAF id:1 athlete:"Bob" age:40
            `);

            // Correcting it and stopping again closes the editor and stages the value as usual.
            const fixed = await waitForInput(gridDiv, cell(api, 0, 'age'));
            await userEvent.clear(fixed);
            await userEvent.type(fixed, '55');

            api.stopEditing();

            expect(editorCount(api)).toBe(0);

            await new GridRows(api, 'block: corrected value staged after the hold').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF ⏳ id:0 athlete:"Alice" age:⏳55 23
                └── LEAF id:1 athlete:"Bob" age:40
            `);

            api.commitBatchEdit();

            expect(rowData[0].age).toBe(55);
            expect(api.isBatchEditing()).toBe(false);
        });

        // The same hold on the focus-loss path, which closes a batch's editors through its own route.
        test('block: losing grid focus holds the invalid editor rather than discarding the edit', async () => {
            const rowData = makeRowData();
            const api = await gridsManager.createGridAndWait('validation-batch-block-focus-loss', {
                columnDefs,
                rowData,
                defaultColDef: { editable: true },
                editType: 'singleCell',
                invalidEditValueMode: 'block',
                stopEditingWhenCellsLoseFocus: true,
            } satisfies GridOptions<PersonRow>);
            const gridDiv = getGridElement(api)! as HTMLElement;

            api.startBatchEdit();
            // rows render asynchronously: poll until the cell lookup succeeds
            await waitFor(() => cell(api, 0, 'age'));

            const ageCell = cell(api, 0, 'age');
            await userEvent.dblClick(ageCell);
            const ageInput = await waitForInput(gridDiv, ageCell);
            await userEvent.clear(ageInput);
            await userEvent.type(ageInput, '999');
            await waitFor(() => expect(api.getEditValidationErrors()?.length ?? 0).toBeGreaterThan(0));

            await userEvent.click(document.body);

            expect(editorCount(api)).toBeGreaterThan(0);
            expect(rowData[0].age).toBe(23);

            await new GridRows(api, 'block: focus loss held the invalid editor').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF 🖍️ ❌ id:0 athlete:"Alice" age:23❌
                └── LEAF id:1 athlete:"Bob" age:40
            `);
        });

        // Revert mode is untouched by the hold: the same stop discards the attempt and closes the editor.
        test('revert: api.stopEditing() discards the invalid edit and closes the editor', async () => {
            const rowData = makeRowData();
            const api = await create('revert', rowData);
            const gridDiv = getGridElement(api)! as HTMLElement;

            api.startBatchEdit();
            // rows render asynchronously: poll until the cell lookup succeeds
            await waitFor(() => cell(api, 0, 'age'));

            const ageCell = cell(api, 0, 'age');
            await userEvent.dblClick(ageCell);
            const ageInput = await waitForInput(gridDiv, ageCell);
            await userEvent.clear(ageInput);
            await userEvent.type(ageInput, '999');
            await waitFor(() => expect(api.getEditValidationErrors()?.length ?? 0).toBeGreaterThan(0));

            api.stopEditing();

            expect(editorCount(api)).toBe(0);
            expect(rowData[0].age).toBe(23);
            expect(api.getEditValidationErrors()).toEqual([]); // discarded, so nothing recorded against it

            await new GridRows(api, 'revert: invalid edit discarded on api.stopEditing()').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Alice" age:23
                └── LEAF id:1 athlete:"Bob" age:40
            `);
        });
        test('block: valid staged edits commit cleanly and fire batchEditingStopped once', async () => {
            const rowData = makeRowData();
            const api = await create('block', rowData);
            const gridDiv = getGridElement(api)! as HTMLElement;
            const stopped: BatchEditingStoppedEvent[] = [];
            api.addEventListener('batchEditingStopped', (e) => stopped.push(e));

            api.startBatchEdit();
            // rows render asynchronously: poll until the cell lookup succeeds
            await waitFor(() => cell(api, 0, 'age'));

            const ageCell = cell(api, 0, 'age');
            await userEvent.dblClick(ageCell);
            const ageInput = await waitForInput(gridDiv, ageCell);
            await userEvent.clear(ageInput);
            await userEvent.type(ageInput, '55{Enter}');

            await new GridRows(api, 'valid value staged as pending 55 over 23').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF ⏳ id:0 athlete:"Alice" age:⏳55 23
                └── LEAF id:1 athlete:"Bob" age:40
            `);

            api.commitBatchEdit();
            await waitFor(() => expect(stopped).toHaveLength(1));

            expect(rowData[0].age).toBe(55);
            expect(stopped[0].changes).toEqual([
                { rowIndex: 0, rowPinned: undefined, columnId: 'age', oldValue: 23, newValue: 55 },
            ]);

            await new GridRows(api, 'valid value committed to 55').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Alice" age:55
                └── LEAF id:1 athlete:"Bob" age:40
            `);
        });

        test('revert: invalid value reverts, valid staged cell still commits', async () => {
            const rowData = makeRowData();
            const api = await create('revert', rowData);
            const gridDiv = getGridElement(api)! as HTMLElement;
            const stopped: BatchEditingStoppedEvent[] = [];
            api.addEventListener('batchEditingStopped', (e) => stopped.push(e));

            api.startBatchEdit();
            // rows render asynchronously: poll until the cell lookup succeeds
            await waitFor(() => cell(api, 0, 'athlete'));

            // Stage a valid athlete edit first.
            const athleteCell = cell(api, 0, 'athlete');
            await userEvent.dblClick(athleteCell);
            const athleteInput = await waitForInput(gridDiv, athleteCell);
            await userEvent.clear(athleteInput);
            await userEvent.type(athleteInput, 'Amy{Enter}');

            // Now enter an invalid age; in revert mode Enter discards it back to source.
            const ageCell = cell(api, 0, 'age');
            await userEvent.dblClick(ageCell);
            const ageInput = await waitForInput(gridDiv, ageCell);
            await userEvent.clear(ageInput);
            await userEvent.type(ageInput, '999{Enter}');

            expect(editorCount(api)).toBe(0);

            await new GridRows(api, 'revert: athlete pending Amy, age reverted to 23').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF ⏳ id:0 athlete:⏳"Amy" "Alice" age:23
                └── LEAF id:1 athlete:"Bob" age:40
            `);

            api.commitBatchEdit();
            await waitFor(() => expect(stopped).toHaveLength(1));

            expect(rowData[0].athlete).toBe('Amy');
            expect(rowData[0].age).toBe(23);
            expect(stopped[0].changes).toEqual([
                { rowIndex: 0, rowPinned: undefined, columnId: 'athlete', oldValue: 'Alice', newValue: 'Amy' },
            ]);

            await new GridRows(api, 'revert: only valid athlete committed').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Amy" age:23
                └── LEAF id:1 athlete:"Bob" age:40
            `);
        });

        test('revert: commitBatchEdit with an invalid value still open discards it and ends the batch', async () => {
            const rowData = makeRowData();
            const api = await create('revert', rowData);
            const gridDiv = getGridElement(api)! as HTMLElement;
            const stopped: BatchEditingStoppedEvent[] = [];
            api.addEventListener('batchEditingStopped', (e) => stopped.push(e));

            api.startBatchEdit();
            // rows render asynchronously: poll until the cell lookup succeeds
            await waitFor(() => cell(api, 0, 'athlete'));

            // Stage a valid athlete edit.
            const athleteCell = cell(api, 0, 'athlete');
            await userEvent.dblClick(athleteCell);
            const athleteInput = await waitForInput(gridDiv, athleteCell);
            await userEvent.clear(athleteInput);
            await userEvent.type(athleteInput, 'Amy{Enter}');

            // Leave an invalid age in an OPEN editor — no Enter, so revert hasn't fired yet.
            const ageCell = cell(api, 0, 'age');
            await userEvent.dblClick(ageCell);
            const ageInput = await waitForInput(gridDiv, ageCell);
            await userEvent.clear(ageInput);
            await userEvent.type(ageInput, '999');
            await waitFor(() => expect(editorCount(api)).toBeGreaterThan(0));

            // Mid-edit: athlete staged, age editor open holding the invalid 999 (🖍️ + ❌).
            await new GridRows(api, 'revert: athlete staged, invalid age held open').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF 🖍️ ⏳ ❌ id:0 athlete:⏳"Amy" "Alice" age:23❌
                └── LEAF id:1 athlete:"Bob" age:40
            `);

            // Revert mode: the commit discards the invalid value, commits the valid one, and ends the
            // batch — it must NOT be rejected like block mode.
            api.commitBatchEdit();
            await waitFor(() => expect(stopped).toHaveLength(1));

            expect(api.isBatchEditing()).toBe(false);
            expect(editorCount(api)).toBe(0);
            expect(rowData[0].athlete).toBe('Amy');
            expect(rowData[0].age).toBe(23);
            expect(stopped[0].changes).toEqual([
                { rowIndex: 0, rowPinned: undefined, columnId: 'athlete', oldValue: 'Alice', newValue: 'Amy' },
            ]);

            await new GridRows(api, 'revert: invalid age discarded, valid athlete committed').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Amy" age:23
                └── LEAF id:1 athlete:"Bob" age:40
            `);
        });

        test('revert: reopening a valid staged cell with an invalid value commits the previous pending on batch commit', async () => {
            const rowData = makeRowData();
            const api = await create('revert', rowData);
            const gridDiv = getGridElement(api)! as HTMLElement;
            const stopped: BatchEditingStoppedEvent[] = [];
            api.addEventListener('batchEditingStopped', (e) => stopped.push(e));

            api.startBatchEdit();
            // rows render asynchronously: poll until the cell lookup succeeds
            await waitFor(() => cell(api, 0, 'age'));

            // Stage a valid age (50) as the previous pending value.
            const ageCell = cell(api, 0, 'age');
            await userEvent.dblClick(ageCell);
            let ageInput = await waitForInput(gridDiv, ageCell);
            await userEvent.clear(ageInput);
            await userEvent.type(ageInput, '50{Enter}');

            await new GridRows(api, 'revert: age staged pending 50').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF ⏳ id:0 athlete:"Alice" age:⏳50 23
                └── LEAF id:1 athlete:"Bob" age:40
            `);

            // Reopen the same cell and type an invalid value, leaving the editor open.
            await userEvent.dblClick(ageCell);
            ageInput = await waitForInput(gridDiv, ageCell);
            await userEvent.clear(ageInput);
            await userEvent.type(ageInput, '999');
            await waitFor(() => expect(editorCount(api)).toBeGreaterThan(0));

            await new GridRows(api, 'revert: invalid 999 held open over previous pending 50').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF 🖍️ ❌ id:0 athlete:"Alice" age:🖍️23 ⏳50 23❌
                └── LEAF id:1 athlete:"Bob" age:40
            `);

            // Commit: the invalid attempt is discarded back to the previous pending 50, which commits.
            api.commitBatchEdit();
            await waitFor(() => expect(stopped).toHaveLength(1));

            expect(api.isBatchEditing()).toBe(false);
            expect(editorCount(api)).toBe(0);
            expect(rowData[0].age).toBe(50);
            expect(stopped[0].changes).toEqual([
                { rowIndex: 0, rowPinned: undefined, columnId: 'age', oldValue: 23, newValue: 50 },
            ]);

            await new GridRows(api, 'revert: previous pending 50 committed, invalid attempt discarded').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Alice" age:50
                └── LEAF id:1 athlete:"Bob" age:40
            `);
        });

        test('cancelBatchEdit discards all staged edits', async () => {
            const rowData = makeRowData();
            const api = await create('revert', rowData);
            const gridDiv = getGridElement(api)! as HTMLElement;
            const stopped: BatchEditingStoppedEvent[] = [];
            api.addEventListener('batchEditingStopped', (e) => stopped.push(e));

            api.startBatchEdit();
            // rows render asynchronously: poll until the cell lookup succeeds
            await waitFor(() => cell(api, 0, 'age'));

            const ageCell = cell(api, 0, 'age');
            await userEvent.dblClick(ageCell);
            const ageInput = await waitForInput(gridDiv, ageCell);
            await userEvent.clear(ageInput);
            await userEvent.type(ageInput, '77{Enter}');

            await new GridRows(api, 'age staged pending 77 before cancel').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF ⏳ id:0 athlete:"Alice" age:⏳77 23
                └── LEAF id:1 athlete:"Bob" age:40
            `);

            api.cancelBatchEdit();
            await waitFor(() => expect(stopped).toHaveLength(1));

            expect(rowData[0].age).toBe(23);
            expect(api.isBatchEditing()).toBe(false);
            expect(stopped[0].changes).toEqual([]);

            await new GridRows(api, 'cancel restored source values').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Alice" age:23
                └── LEAF id:1 athlete:"Bob" age:40
            `);
        });

        test('block: commitBatchEdit with nothing staged still ends the batch', async () => {
            const rowData = makeRowData();
            const api = await create('block', rowData);
            const stopped: BatchEditingStoppedEvent[] = [];
            api.addEventListener('batchEditingStopped', (e) => stopped.push(e));

            api.startBatchEdit();
            // rows render asynchronously: poll until the cell lookup succeeds
            await waitFor(() => expect(api.isBatchEditing()).toBe(true));

            // No edits staged: the commit has nothing to reject, so it must not be mistaken for a
            // validation hold — the batch ends cleanly rather than being stranded open.
            api.commitBatchEdit();

            expect(api.isBatchEditing()).toBe(false);
            expect(editorCount(api)).toBe(0);
            expect(rowData[0].age).toBe(23);

            await new GridRows(api, 'no-op commit left the data untouched').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Alice" age:23
                └── LEAF id:1 athlete:"Bob" age:40
            `);
        });

        test('block: a rejected commit must not overwrite the previous valid pending value', async () => {
            const rowData = makeRowData();
            const api = await create('block', rowData);
            const gridDiv = getGridElement(api)! as HTMLElement;

            api.startBatchEdit();
            // rows render asynchronously: poll until the cell lookup succeeds
            await waitFor(() => cell(api, 0, 'age'));

            // Stage a valid age (50) as the previous pending value.
            const ageCell = cell(api, 0, 'age');
            await userEvent.dblClick(ageCell);
            let ageInput = await waitForInput(gridDiv, ageCell);
            await userEvent.clear(ageInput);
            await userEvent.type(ageInput, '50{Enter}');

            // Valid 50 staged as the previous pending value before the invalid reopen.
            await new GridRows(api, 'block: age staged pending 50').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF ⏳ id:0 athlete:"Alice" age:⏳50 23
                └── LEAF id:1 athlete:"Bob" age:40
            `);

            // Reopen the same cell and type an invalid value, leaving the editor open.
            await userEvent.dblClick(ageCell);
            ageInput = await waitForInput(gridDiv, ageCell);
            await userEvent.clear(ageInput);
            await userEvent.type(ageInput, '999');
            await waitFor(() => expect(api.getEditValidationErrors()?.length ?? 0).toBeGreaterThan(0));

            // Block-mode commit is rejected: batch held, editor stays open, nothing written.
            api.commitBatchEdit();
            await waitFor(() => expect(api.isBatchEditing()).toBe(true));

            // The rejected commit must NOT persist the invalid 999 over the staged pending 50: the
            // previous valid value survives the hold (⏳50), so it can still commit once corrected.
            await new GridRows(api, 'block: rejected commit held, previous pending 50 preserved').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF 🖍️ ❌ id:0 athlete:"Alice" age:🖍️23 ⏳50 23❌
                └── LEAF id:1 athlete:"Bob" age:40
            `);

            // Correct the value and re-commit: the batch ends and the corrected value lands.
            await userEvent.clear(ageInput);
            await userEvent.type(ageInput, '60{Enter}');

            api.commitBatchEdit();
            await waitFor(() => expect(rowData[0].age).toBe(60));
            expect(api.isBatchEditing()).toBe(false);

            await new GridRows(api, 'block: corrected value committed').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Alice" age:60
                └── LEAF id:1 athlete:"Bob" age:40
            `);
        });
    });

    describe('editType: fullRow', () => {
        const editType = 'fullRow' as const;
        const create = async (invalidEditValueMode: 'revert' | 'block', rowData: PersonRow[]) =>
            gridsManager.createGridAndWait(`validation-batch-${editType}-${invalidEditValueMode}`, {
                columnDefs,
                rowData,
                defaultColDef: { editable: true },
                editType,
                invalidEditValueMode,
            } satisfies GridOptions<PersonRow>);

        test('block: commitBatchEdit is rejected while invalid, then commits after the fix', async () => {
            const rowData = makeRowData();
            const api = await create('block', rowData);
            const gridDiv = getGridElement(api)! as HTMLElement;
            const stopped: BatchEditingStoppedEvent[] = [];
            api.addEventListener('batchEditingStopped', (e) => stopped.push(e));

            api.startBatchEdit();
            // rows render asynchronously: poll until the cell lookup succeeds
            await waitFor(() => cell(api, 0, 'age'));

            const ageCell = cell(api, 0, 'age');
            await userEvent.dblClick(ageCell);
            const ageInput = await waitForInput(gridDiv, ageCell);
            await userEvent.clear(ageInput);
            await userEvent.type(ageInput, '999');
            await userEvent.keyboard('{Enter}');
            await waitFor(() => expect(api.getEditValidationErrors()?.length ?? 0).toBeGreaterThan(0));

            // block mode keeps the invalid editor open rather than staging it
            expect(editorCount(api)).toBeGreaterThan(0);

            // Pre-commit: invalid 999 held in the open editor (🖍️ + ❌), nothing written yet.
            await new GridRows(api, 'block: invalid 999 held open before commit').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF 🖍️ ❌ id:0 athlete:"Alice" age:23❌
                └── LEAF id:1 athlete:"Bob" age:40
            `);

            api.commitBatchEdit();

            // Block mode rejects the commit: nothing is written, the editor stays open, and the
            // batch session is held so the user can correct the value. No batchEditingStopped fires.
            expect(rowData[0].age).toBe(23);
            expect(api.isBatchEditing()).toBe(true);
            expect(editorCount(api)).toBeGreaterThan(0);
            expect(stopped).toHaveLength(0);

            // Rejected commit held the batch: invalid 999 still in the editor (🖍️ + ❌), data still 23.
            await new GridRows(api, 'block: rejected commit held, invalid value still open').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF 🖍️ ❌ id:0 athlete:"Alice" age:23❌
                └── LEAF id:1 athlete:"Bob" age:40
            `);

            // Correct the value and re-commit: the batch now ends and the corrected value lands.
            const ageInputAgain = await waitForInput(gridDiv, cell(api, 0, 'age'));
            await userEvent.clear(ageInputAgain);
            await userEvent.type(ageInputAgain, '55{Enter}');

            api.commitBatchEdit();
            await waitFor(() => expect(stopped).toHaveLength(1));

            expect(rowData[0].age).toBe(55);
            expect(api.isBatchEditing()).toBe(false);
            expect(stopped[0].changes).toEqual([
                { rowIndex: 0, rowPinned: undefined, columnId: 'age', oldValue: 23, newValue: 55 },
            ]);

            // Batch ended, corrected value committed, no pending/invalid markers remain.
            await new GridRows(api, 'block: corrected value committed, batch ended').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Alice" age:55
                └── LEAF id:1 athlete:"Bob" age:40
            `);
        });

        test('block: valid staged edits commit cleanly and fire batchEditingStopped once', async () => {
            const rowData = makeRowData();
            const api = await create('block', rowData);
            const gridDiv = getGridElement(api)! as HTMLElement;
            const stopped: BatchEditingStoppedEvent[] = [];
            api.addEventListener('batchEditingStopped', (e) => stopped.push(e));

            api.startBatchEdit();
            // rows render asynchronously: poll until the cell lookup succeeds
            await waitFor(() => cell(api, 0, 'age'));

            const ageCell = cell(api, 0, 'age');
            await userEvent.dblClick(ageCell);
            const ageInput = await waitForInput(gridDiv, ageCell);
            await userEvent.clear(ageInput);
            await userEvent.type(ageInput, '55{Enter}');

            await new GridRows(api, 'valid value staged as pending 55 over 23').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF ⏳ id:0 athlete:"Alice" age:⏳55 23
                └── LEAF id:1 athlete:"Bob" age:40
            `);

            api.commitBatchEdit();
            await waitFor(() => expect(stopped).toHaveLength(1));

            expect(rowData[0].age).toBe(55);
            expect(stopped[0].changes).toEqual([
                { rowIndex: 0, rowPinned: undefined, columnId: 'age', oldValue: 23, newValue: 55 },
            ]);

            await new GridRows(api, 'valid value committed to 55').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Alice" age:55
                └── LEAF id:1 athlete:"Bob" age:40
            `);
        });

        test('revert: invalid value reverts, valid staged cell still commits', async () => {
            const rowData = makeRowData();
            const api = await create('revert', rowData);
            const gridDiv = getGridElement(api)! as HTMLElement;
            const stopped: BatchEditingStoppedEvent[] = [];
            api.addEventListener('batchEditingStopped', (e) => stopped.push(e));

            api.startBatchEdit();
            // rows render asynchronously: poll until the cell lookup succeeds
            await waitFor(() => cell(api, 0, 'athlete'));

            // Stage a valid athlete edit first.
            const athleteCell = cell(api, 0, 'athlete');
            await userEvent.dblClick(athleteCell);
            const athleteInput = await waitForInput(gridDiv, athleteCell);
            await userEvent.clear(athleteInput);
            await userEvent.type(athleteInput, 'Amy{Enter}');

            // Now enter an invalid age; in revert mode Enter discards it back to source.
            const ageCell = cell(api, 0, 'age');
            await userEvent.dblClick(ageCell);
            const ageInput = await waitForInput(gridDiv, ageCell);
            await userEvent.clear(ageInput);
            await userEvent.type(ageInput, '999{Enter}');

            expect(editorCount(api)).toBe(0);

            await new GridRows(api, 'revert: athlete pending Amy, age reverted to 23').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF ⏳ id:0 athlete:⏳"Amy" "Alice" age:23
                └── LEAF id:1 athlete:"Bob" age:40
            `);

            api.commitBatchEdit();
            await waitFor(() => expect(stopped).toHaveLength(1));

            expect(rowData[0].athlete).toBe('Amy');
            expect(rowData[0].age).toBe(23);
            expect(stopped[0].changes).toEqual([
                { rowIndex: 0, rowPinned: undefined, columnId: 'athlete', oldValue: 'Alice', newValue: 'Amy' },
            ]);

            await new GridRows(api, 'revert: only valid athlete committed').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Amy" age:23
                └── LEAF id:1 athlete:"Bob" age:40
            `);
        });

        test('revert: commitBatchEdit with an invalid value still open discards it and ends the batch', async () => {
            const rowData = makeRowData();
            const api = await create('revert', rowData);
            const gridDiv = getGridElement(api)! as HTMLElement;
            const stopped: BatchEditingStoppedEvent[] = [];
            api.addEventListener('batchEditingStopped', (e) => stopped.push(e));

            api.startBatchEdit();
            // rows render asynchronously: poll until the cell lookup succeeds
            await waitFor(() => cell(api, 0, 'athlete'));

            // Stage a valid athlete edit.
            const athleteCell = cell(api, 0, 'athlete');
            await userEvent.dblClick(athleteCell);
            const athleteInput = await waitForInput(gridDiv, athleteCell);
            await userEvent.clear(athleteInput);
            await userEvent.type(athleteInput, 'Amy{Enter}');

            // Leave an invalid age in an OPEN editor — no Enter, so revert hasn't fired yet.
            const ageCell = cell(api, 0, 'age');
            await userEvent.dblClick(ageCell);
            const ageInput = await waitForInput(gridDiv, ageCell);
            await userEvent.clear(ageInput);
            await userEvent.type(ageInput, '999');
            await waitFor(() => expect(editorCount(api)).toBeGreaterThan(0));

            // Mid-edit: athlete staged, age editor open holding the invalid 999 (🖍️ + ❌).
            await new GridRows(api, 'revert: athlete staged, invalid age held open').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF 🖍️ ❌ id:0 athlete:⏳"Amy" "Alice" age:23❌
                └── LEAF id:1 athlete:"Bob" age:40
            `);

            // Revert mode: the commit discards the invalid value, commits the valid one, and ends the
            // batch — it must NOT be rejected like block mode.
            api.commitBatchEdit();
            await waitFor(() => expect(stopped).toHaveLength(1));

            expect(api.isBatchEditing()).toBe(false);
            expect(editorCount(api)).toBe(0);
            expect(rowData[0].athlete).toBe('Amy');
            expect(rowData[0].age).toBe(23);
            expect(stopped[0].changes).toEqual([
                { rowIndex: 0, rowPinned: undefined, columnId: 'athlete', oldValue: 'Alice', newValue: 'Amy' },
            ]);

            await new GridRows(api, 'revert: invalid age discarded, valid athlete committed').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Amy" age:23
                └── LEAF id:1 athlete:"Bob" age:40
            `);
        });

        test('revert: reopening a valid staged cell with an invalid value commits the previous pending on batch commit', async () => {
            const rowData = makeRowData();
            const api = await create('revert', rowData);
            const gridDiv = getGridElement(api)! as HTMLElement;
            const stopped: BatchEditingStoppedEvent[] = [];
            api.addEventListener('batchEditingStopped', (e) => stopped.push(e));

            api.startBatchEdit();
            // rows render asynchronously: poll until the cell lookup succeeds
            await waitFor(() => cell(api, 0, 'age'));

            // Stage a valid age (50) as the previous pending value.
            const ageCell = cell(api, 0, 'age');
            await userEvent.dblClick(ageCell);
            let ageInput = await waitForInput(gridDiv, ageCell);
            await userEvent.clear(ageInput);
            await userEvent.type(ageInput, '50{Enter}');

            await new GridRows(api, 'revert: age staged pending 50').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF ⏳ id:0 athlete:"Alice" age:⏳50 23
                └── LEAF id:1 athlete:"Bob" age:40
            `);

            // Reopen the same cell and type an invalid value, leaving the editor open.
            await userEvent.dblClick(ageCell);
            ageInput = await waitForInput(gridDiv, ageCell);
            await userEvent.clear(ageInput);
            await userEvent.type(ageInput, '999');
            await waitFor(() => expect(editorCount(api)).toBeGreaterThan(0));

            await new GridRows(api, 'revert: invalid 999 held open over previous pending 50').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF 🖍️ ❌ id:0 athlete:"Alice" age:🖍️23 ⏳50 23❌
                └── LEAF id:1 athlete:"Bob" age:40
            `);

            // Commit: the invalid attempt is discarded back to the previous pending 50, which commits.
            api.commitBatchEdit();
            await waitFor(() => expect(stopped).toHaveLength(1));

            expect(api.isBatchEditing()).toBe(false);
            expect(editorCount(api)).toBe(0);
            expect(rowData[0].age).toBe(50);
            expect(stopped[0].changes).toEqual([
                { rowIndex: 0, rowPinned: undefined, columnId: 'age', oldValue: 23, newValue: 50 },
            ]);

            await new GridRows(api, 'revert: previous pending 50 committed, invalid attempt discarded').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Alice" age:50
                └── LEAF id:1 athlete:"Bob" age:40
            `);
        });

        test('cancelBatchEdit discards all staged edits', async () => {
            const rowData = makeRowData();
            const api = await create('revert', rowData);
            const gridDiv = getGridElement(api)! as HTMLElement;
            const stopped: BatchEditingStoppedEvent[] = [];
            api.addEventListener('batchEditingStopped', (e) => stopped.push(e));

            api.startBatchEdit();
            // rows render asynchronously: poll until the cell lookup succeeds
            await waitFor(() => cell(api, 0, 'age'));

            const ageCell = cell(api, 0, 'age');
            await userEvent.dblClick(ageCell);
            const ageInput = await waitForInput(gridDiv, ageCell);
            await userEvent.clear(ageInput);
            await userEvent.type(ageInput, '77{Enter}');

            await new GridRows(api, 'age staged pending 77 before cancel').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF ⏳ id:0 athlete:"Alice" age:⏳77 23
                └── LEAF id:1 athlete:"Bob" age:40
            `);

            api.cancelBatchEdit();
            await waitFor(() => expect(stopped).toHaveLength(1));

            expect(rowData[0].age).toBe(23);
            expect(api.isBatchEditing()).toBe(false);
            expect(stopped[0].changes).toEqual([]);

            await new GridRows(api, 'cancel restored source values').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Alice" age:23
                └── LEAF id:1 athlete:"Bob" age:40
            `);
        });

        test('block: commitBatchEdit with nothing staged still ends the batch', async () => {
            const rowData = makeRowData();
            const api = await create('block', rowData);
            const stopped: BatchEditingStoppedEvent[] = [];
            api.addEventListener('batchEditingStopped', (e) => stopped.push(e));

            api.startBatchEdit();
            // rows render asynchronously: poll until the cell lookup succeeds
            await waitFor(() => expect(api.isBatchEditing()).toBe(true));

            // No edits staged: the commit has nothing to reject, so it must not be mistaken for a
            // validation hold — the batch ends cleanly rather than being stranded open.
            api.commitBatchEdit();

            expect(api.isBatchEditing()).toBe(false);
            expect(editorCount(api)).toBe(0);
            expect(rowData[0].age).toBe(23);

            await new GridRows(api, 'no-op commit left the data untouched').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 athlete:"Alice" age:23
                └── LEAF id:1 athlete:"Bob" age:40
            `);
        });
    });

    test('singleCell revert: per-cell Escape reverts to previous pending value, other cell stays', async () => {
        const rowData = makeRowData();
        const api = await gridsManager.createGridAndWait('validation-batch-escape', {
            columnDefs,
            rowData,
            defaultColDef: { editable: true },
            editType: 'singleCell',
            invalidEditValueMode: 'revert',
        } satisfies GridOptions<PersonRow>);
        const gridDiv = getGridElement(api)! as HTMLElement;

        api.startBatchEdit();
        // rows render asynchronously: poll until the cell lookup succeeds
        await waitFor(() => cell(api, 0, 'age'));

        // Stage age = 50 (valid) as the previous pending value.
        const ageCell = cell(api, 0, 'age');
        await userEvent.dblClick(ageCell);
        let ageInput = await waitForInput(gridDiv, ageCell);
        await userEvent.clear(ageInput);
        await userEvent.type(ageInput, '50{Enter}');

        // Stage a valid athlete edit in the same batch.
        const athleteCell = cell(api, 0, 'athlete');
        await userEvent.dblClick(athleteCell);
        const athleteInput = await waitForInput(gridDiv, athleteCell);
        await userEvent.clear(athleteInput);
        await userEvent.type(athleteInput, 'Amy{Enter}');

        await new GridRows(api, 'age pending 50, athlete pending Amy').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF ⏳ id:0 athlete:⏳"Amy" "Alice" age:⏳50 23
            └── LEAF id:1 athlete:"Bob" age:40
        `);

        // Re-open age, type 60, then Escape: reverts to previous pending (50), not source (23).
        await userEvent.dblClick(ageCell);
        ageInput = await waitForInput(gridDiv, ageCell);
        await userEvent.clear(ageInput);
        await userEvent.type(ageInput, '60');
        await userEvent.keyboard('{Escape}');

        await new GridRows(api, 'age reverted to previous pending 50, athlete pending Amy remains').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF ⏳ id:0 athlete:⏳"Amy" "Alice" age:⏳50 23
            └── LEAF id:1 athlete:"Bob" age:40
        `);

        api.commitBatchEdit();

        expect(rowData[0].age).toBe(50);
        expect(rowData[0].athlete).toBe('Amy');
    });

    test('singleCell revert: commitBatchEdit discarding an open invalid editor still fires cellEditingStopped', async () => {
        const rowData = makeRowData();
        const api = await gridsManager.createGridAndWait('validation-batch-lifecycle-singleCell', {
            columnDefs,
            rowData,
            defaultColDef: { editable: true },
            editType: 'singleCell',
            invalidEditValueMode: 'revert',
        } satisfies GridOptions<PersonRow>);
        const gridDiv = getGridElement(api)! as HTMLElement;
        const started: string[] = [];
        const stoppedCells: string[] = [];
        api.addEventListener('cellEditingStarted', (e) => started.push(e.column.getColId()));
        api.addEventListener('cellEditingStopped', (e) => stoppedCells.push(e.column.getColId()));

        api.startBatchEdit();
        // rows render asynchronously: poll until the cell lookup succeeds
        await waitFor(() => cell(api, 0, 'age'));

        // Open an invalid age editor and leave it open (no Enter) — cellEditingStarted has fired.
        const ageCell = cell(api, 0, 'age');
        await userEvent.dblClick(ageCell);
        const ageInput = await waitForInput(gridDiv, ageCell);
        await userEvent.clear(ageInput);
        await userEvent.type(ageInput, '999');
        await waitFor(() => expect(started).toEqual(['age']));
        expect(stoppedCells).toEqual([]);

        await new GridRows(api, 'singleCell revert: invalid 999 held open before commit').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF 🖍️ ❌ id:0 athlete:"Alice" age:23❌
            └── LEAF id:1 athlete:"Bob" age:40
        `);

        api.commitBatchEdit();
        await waitFor(() => expect(stoppedCells).toEqual(['age']));

        // The discarded invalid editor must balance its start with exactly one cellEditingStopped.
        expect(api.isBatchEditing()).toBe(false);
        expect(editorCount(api)).toBe(0);
        expect(rowData[0].age).toBe(23);

        await new GridRows(api, 'singleCell revert: invalid age discarded, editor closed').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 athlete:"Alice" age:23
            └── LEAF id:1 athlete:"Bob" age:40
        `);
    });

    test('fullRow revert: commitBatchEdit discarding an open invalid editor still fires cellEditingStopped', async () => {
        const rowData = makeRowData();
        const api = await gridsManager.createGridAndWait('validation-batch-lifecycle-fullRow', {
            columnDefs,
            rowData,
            defaultColDef: { editable: true },
            editType: 'fullRow',
            invalidEditValueMode: 'revert',
        } satisfies GridOptions<PersonRow>);
        const gridDiv = getGridElement(api)! as HTMLElement;
        const started: string[] = [];
        const stoppedCells: string[] = [];
        api.addEventListener('cellEditingStarted', (e) => started.push(e.column.getColId()));
        api.addEventListener('cellEditingStopped', (e) => stoppedCells.push(e.column.getColId()));

        api.startBatchEdit();
        // rows render asynchronously: poll until the cell lookup succeeds
        await waitFor(() => cell(api, 0, 'age'));

        // fullRow opens the whole row; make age invalid and leave the row's editors open.
        await userEvent.dblClick(cell(api, 0, 'age'));
        const ageInput = await waitForInput(gridDiv, cell(api, 0, 'age'));
        await userEvent.clear(ageInput);
        await userEvent.type(ageInput, '999');
        await waitFor(() => expect(started).toContain('age'));
        expect(stoppedCells).not.toContain('age');

        await new GridRows(api, 'fullRow revert: invalid 999 held open before commit').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF 🖍️ ❌ id:0 athlete:"Alice" age:23❌
            └── LEAF id:1 athlete:"Bob" age:40
        `);

        api.commitBatchEdit();
        await waitFor(() => expect(stoppedCells.filter((c) => c === 'age')).toEqual(['age']));

        // The discarded invalid age editor must balance its start with exactly one cellEditingStopped.
        expect(api.isBatchEditing()).toBe(false);
        expect(editorCount(api)).toBe(0);
        expect(rowData[0].age).toBe(23);

        await new GridRows(api, 'fullRow revert: invalid age discarded, editors closed').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 athlete:"Alice" age:23
            └── LEAF id:1 athlete:"Bob" age:40
        `);
    });

    test('fullRow revert: a row-level error reverts EVERY edited cell in the row, not just the first', async () => {
        // A row-level error flags the whole row, so every edited position must revert — including a
        // later, cell-valid one, which would otherwise leak through and commit.
        const rowData = makeRowData();
        const api = await gridsManager.createGridAndWait('validation-batch-fullrow-rowlevel-revert', {
            columnDefs,
            rowData,
            defaultColDef: { editable: true },
            editType: 'fullRow',
            invalidEditValueMode: 'revert',
            // Whole row is invalid when the athlete name is "Invalid" (7 chars, so no cell-level ❌).
            getFullRowEditValidationErrors: ({ editorsState }) => {
                const athlete = editorsState.find((e) => e.colId === 'athlete')?.newValue;
                return athlete === 'Invalid' ? ['Row is invalid'] : null;
            },
        } satisfies GridOptions<PersonRow>);
        const gridDiv = getGridElement(api)! as HTMLElement;
        const stopped: BatchEditingStoppedEvent[] = [];
        api.addEventListener('batchEditingStopped', (e) => stopped.push(e));

        api.startBatchEdit();
        // rows render asynchronously: poll until the cell lookup succeeds
        await waitFor(() => cell(api, 0, 'athlete'));

        // fullRow opens both editors; athlete makes the ROW invalid, age is individually valid.
        await userEvent.dblClick(cell(api, 0, 'athlete'));
        const athleteInput = await waitForInput(gridDiv, cell(api, 0, 'athlete'));
        await userEvent.clear(athleteInput);
        await userEvent.type(athleteInput, 'Invalid');

        const ageInput = await waitForInput(gridDiv, cell(api, 0, 'age'));
        await userEvent.clear(ageInput);
        await userEvent.type(ageInput, '55');

        // Both editors staged and held open: row-level error marks no single cell (no ❌), age is 55.
        await new GridRows(api, 'fullRow revert: row invalid, both cells staged and held open').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF 🖍️ id:0 athlete:🖍️"Invalid" "Alice" age:🖍️55 23
            └── LEAF id:1 athlete:"Bob" age:40
        `);

        api.commitBatchEdit();

        // Whole-row revert: neither cell commits — not the row-invalidating athlete, nor the
        // cell-valid age. age must NOT survive as 55 (the "only the first cell reverts" bug).
        expect(api.isBatchEditing()).toBe(false);
        expect(editorCount(api)).toBe(0);
        expect(rowData[0].athlete).toBe('Alice');
        expect(rowData[0].age).toBe(23);
        expect(stopped.flatMap((e) => e.changes ?? [])).toEqual([]);

        await new GridRows(api, 'fullRow revert: row-level error reverted both cells, nothing committed').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 athlete:"Alice" age:23
            └── LEAF id:1 athlete:"Bob" age:40
        `);
    });

    test('fullRow block: one invalid cell blocks the whole row commit', async () => {
        const rowData = makeRowData();
        const api = await gridsManager.createGridAndWait('validation-batch-fullrow-block', {
            columnDefs,
            rowData,
            defaultColDef: { editable: true },
            editType: 'fullRow',
            invalidEditValueMode: 'block',
        } satisfies GridOptions<PersonRow>);
        const gridDiv = getGridElement(api)! as HTMLElement;
        const stopped: BatchEditingStoppedEvent[] = [];
        api.addEventListener('batchEditingStopped', (e) => stopped.push(e));

        api.startBatchEdit();
        // rows render asynchronously: poll until the cell lookup succeeds
        await waitFor(() => cell(api, 0, 'athlete'));

        // fullRow opens the whole row; edit athlete (valid) and age (invalid) in the same row.
        const athleteCell = cell(api, 0, 'athlete');
        await userEvent.dblClick(athleteCell);
        const athleteInput = await waitForInput(gridDiv, athleteCell);
        await userEvent.clear(athleteInput);
        await userEvent.type(athleteInput, 'Amy');

        const ageInput = await waitForInput(gridDiv, cell(api, 0, 'age'));
        await userEvent.clear(ageInput);
        await userEvent.type(ageInput, '999');
        await waitFor(() => expect(api.getEditValidationErrors()?.length ?? 0).toBeGreaterThan(0));

        api.commitBatchEdit();

        // One invalid cell rejects the whole commit: NEITHER the invalid age NOR the valid athlete
        // in the same row is persisted, the batch stays open, and no batchEditingStopped fires.
        expect(rowData[0].athlete).toBe('Alice');
        expect(rowData[0].age).toBe(23);
        expect(api.isBatchEditing()).toBe(true);
        expect(editorCount(api)).toBeGreaterThan(0);
        expect(stopped).toHaveLength(0);

        // Held row: the valid athlete edit (🖍️) is kept open alongside the invalid age (❌) — block
        // mode commits neither until the row is valid, so the rejected commit stages nothing (🖍️, not
        // ⏳) and nothing reached the data.
        await new GridRows(api, 'fullRow block: whole row held, valid athlete + invalid age both open').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF 🖍️ ❌ id:0 athlete:🖍️"Amy" "Alice" age:23❌
            └── LEAF id:1 athlete:"Bob" age:40
        `);
    });

    test('fullRow block: a blocked batch commit leaves nothing for redo to reapply', async () => {
        const rowData = makeRowData();
        const api = await gridsManager.createGridAndWait('validation-batch-fullrow-block-undo', {
            columnDefs,
            rowData,
            defaultColDef: { editable: true },
            editType: 'fullRow',
            invalidEditValueMode: 'block',
        } satisfies GridOptions<PersonRow>);
        const gridDiv = getGridElement(api)! as HTMLElement;

        api.startBatchEdit();
        // rows render asynchronously: poll until the cell lookup succeeds
        await waitFor(() => cell(api, 0, 'athlete'));

        const athleteCell = cell(api, 0, 'athlete');
        await userEvent.dblClick(athleteCell);
        const athleteInput = await waitForInput(gridDiv, athleteCell);
        await userEvent.clear(athleteInput);
        await userEvent.type(athleteInput, 'Amy');

        const ageInput = await waitForInput(gridDiv, cell(api, 0, 'age'));
        await userEvent.clear(ageInput);
        await userEvent.type(ageInput, '999');
        await waitFor(() => expect(api.getEditValidationErrors()?.length ?? 0).toBeGreaterThan(0));

        api.commitBatchEdit();

        // The blocked commit produced no undo action, so redo cannot resurrect the rejected value.
        expect(api.getCurrentUndoSize()).toBe(0);
        api.redoCellEditing();
        await waitFor(() => expect(rowData[0].athlete).toBe('Alice'));
        expect(rowData[0].age).toBe(23);
    });

    test('fullRow block: a rejected commit holds the batch even when the invalid column is scrolled off-screen', async () => {
        const wideCols: ColDef[] = Array.from({ length: 15 }, (_, i) => ({
            field: `c${i}`,
            width: 200,
            cellEditor: 'agNumberCellEditor',
            cellEditorParams: { min: 0, max: 100 },
        }));
        const rowData = [Object.fromEntries(wideCols.map((_, i) => [`c${i}`, i]))];
        const api = await gridsManager.createGridAndWait('validation-batch-wide-block', {
            columnDefs: wideCols,
            rowData,
            defaultColDef: { editable: true },
            editType: 'fullRow',
            invalidEditValueMode: 'block',
            suppressColumnVirtualisation: false,
            suppressAnimationFrame: true,
        });
        const gridDiv = getGridElement(api)! as HTMLElement;
        const stopped: BatchEditingStoppedEvent[] = [];
        api.addEventListener('batchEditingStopped', (e) => stopped.push(e));

        api.startBatchEdit();
        // rows render asynchronously: poll until the cell lookup succeeds
        await waitFor(() => cell(api, 0, 'c0'));

        // Open the row, make the first column invalid, then scroll it far out of the viewport.
        await userEvent.dblClick(cell(api, 0, 'c0'));
        const firstInput = await waitForInput(gridDiv, cell(api, 0, 'c0'));
        await userEvent.clear(firstInput);
        await userEvent.type(firstInput, '999');
        api.ensureColumnVisible('c14');
        await asyncSetTimeout(0);

        // The invalid editing cell is kept mounted despite virtualisation, so the rejected commit is
        // held: the batch stays open and no batchEditingStopped fires for a commit that never happened.
        api.commitBatchEdit();

        expect(api.isBatchEditing()).toBe(true);
        expect(editorCount(api)).toBeGreaterThan(0);
        expect(stopped).toHaveLength(0);
        expect(rowData[0].c0).toBe(0);
    });

    // A mid-batch `params.stopEditing()` is not a grid-wide stop (the batch stays open), so it reports
    // false. The editor that asked to close must still close — only a block-mode hold may keep it.
    test('block: an editor that commits itself via params.stopEditing() closes', async () => {
        const api = await gridsManager.createGridAndWait('validation-batch-self-commit-editor', {
            columnDefs: [{ field: 'athlete', cellEditor: DoneCellEditor }, { field: 'age' }],
            rowData: makeRowData(),
            defaultColDef: { editable: true },
            editType: 'singleCell',
            invalidEditValueMode: 'block',
        } satisfies GridOptions<PersonRow>);
        const gridDiv = getGridElement(api)! as HTMLElement;

        const stopped: CellEditingStoppedEvent[] = [];
        api.addEventListener('cellEditingStopped', (e) => stopped.push(e));

        api.startBatchEdit();
        // rows render asynchronously: poll until the cell lookup succeeds
        await waitFor(() => cell(api, 0, 'athlete'));

        await userEvent.dblClick(cell(api, 0, 'athlete'));
        await waitFor(() => expect(editorCount(api)).toBe(1));

        await userEvent.click(getByTestId(gridDiv, 'done-button'));

        // The editor asked to be closed and nothing is holding it: it must be gone, with a balanced event.
        expect(editorCount(api)).toBe(0);
        expect(stopped).toHaveLength(1);

        await new GridRows(api, 'block: self-committed editor closed, value staged').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF ⏳ id:0 athlete:⏳"picked" "Alice" age:23
            └── LEAF id:1 athlete:"Bob" age:40
        `);
    });

    // A rejected commit holds the batch open. If the held edits then disappear, the next commit has no
    // context to build, and must still end the batch rather than wedge it open forever.
    test('block: a rejected commit does not wedge the batch when its edits are purged', async () => {
        const api = await gridsManager.createGridAndWait('validation-batch-stale-block-rejected', {
            columnDefs,
            rowData: makeRowData(),
            defaultColDef: { editable: true },
            editType: 'singleCell',
            invalidEditValueMode: 'block',
        } satisfies GridOptions<PersonRow>);
        const gridDiv = getGridElement(api)! as HTMLElement;

        api.startBatchEdit();
        // rows render asynchronously: poll until the cell lookup succeeds
        await waitFor(() => cell(api, 0, 'age'));

        const ageCell = cell(api, 0, 'age');
        await userEvent.dblClick(ageCell);
        const ageInput = await waitForInput(gridDiv, ageCell);
        await userEvent.clear(ageInput);
        await userEvent.type(ageInput, '999');
        await userEvent.keyboard('{Enter}');
        await waitFor(() => expect(api.getEditValidationErrors()?.length ?? 0).toBeGreaterThan(0));

        api.commitBatchEdit();

        // Correctly rejected: the batch is held so the user can fix the value.
        expect(api.isBatchEditing()).toBe(true);

        // The held edit vanishes — fresh row data means fresh nodes, so the purge drops every edit.
        api.setGridOption('rowData', makeRowData());

        api.commitBatchEdit();

        // Nothing is left to reject, so the batch must end rather than stay stuck open.
        expect(api.isBatchEditing()).toBe(false);

        await new GridRows(api, 'block: purged edits still end the batch').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 athlete:"Alice" age:23
            └── LEAF id:1 athlete:"Bob" age:40
        `);
    });

    // With the grid's only validation on a custom editor, purging that editor leaves no probe able to
    // rebuild the map, so the purge must drop the error itself or it rejects every later commit.
    test('block: purging an invalid custom editor row does not strand its validation error', async () => {
        const rowData = makeRowData();
        const api = await gridsManager.createGridAndWait('validation-batch-custom-editor-purged', {
            columnDefs: [{ field: 'athlete', cellEditor: ValidatingEditor }, { field: 'age' }],
            rowData,
            defaultColDef: { editable: true },
            editType: 'singleCell',
            invalidEditValueMode: 'block',
        } satisfies GridOptions<PersonRow>);
        const gridDiv = getGridElement(api)! as HTMLElement;

        api.startBatchEdit();
        // rows render asynchronously: poll until the cell lookup succeeds
        await waitFor(() => cell(api, 1, 'age'));

        // Stage a valid edit on Bob first — once Alice is invalid, block mode refuses to open any editor.
        const ageCell = cell(api, 1, 'age');
        await userEvent.dblClick(ageCell);
        const ageInput = await waitForInput(gridDiv, ageCell);
        await userEvent.clear(ageInput);
        await userEvent.type(ageInput, '31{Enter}');

        await new GridRows(api, 'Bob staged 31, nothing invalid yet').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 athlete:"Alice" age:23
            └── LEAF ⏳ id:1 athlete:"Bob" age:⏳31 40
        `);

        const athleteCell = cell(api, 0, 'athlete');
        await userEvent.dblClick(athleteCell);
        const athleteInput = await waitForInput(gridDiv, athleteCell);
        await userEvent.clear(athleteInput);
        await userEvent.type(athleteInput, 'INVALID{Enter}');
        expect(editorCount(api)).toBeGreaterThan(0);

        await new GridRows(api, 'Alice held invalid, Bob staged 31').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF 🖍️ ❌ id:0 athlete:"Alice"❌ age:23
            └── LEAF ⏳ id:1 athlete:"Bob" age:⏳31 40
        `);

        // Alice goes: her edit is purged with no cell controller left to clear its validation.
        api.applyTransaction({ remove: [rowData[0]] });
        expect(editorCount(api)).toBe(0);

        await new GridRows(api, 'Alice purged, Bob still staged and valid').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF ⏳ id:1 athlete:"Bob" age:⏳31 40
        `);

        api.commitBatchEdit();

        expect(rowData[1].age).toBe(31);
        expect(api.isBatchEditing()).toBe(false);

        await new GridRows(api, 'purged custom-editor error does not reject a later commit').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:1 athlete:"Bob" age:31
        `);
    });

    // A rejected commit refreshes the batch rows before commitBatchEdit() reads the rejection, so a
    // renderer can re-enter the stop — which must not clear the rejection it is nested inside.
    test('block: a re-entrant commit during the rejection refresh cannot end the batch', async () => {
        const rowData = makeRowData();
        let armed = false;
        let reentered = false;
        const api = await gridsManager.createGridAndWait('validation-batch-reentrant-stop', {
            columnDefs: [
                ...columnDefs,
                {
                    colId: 'reenter',
                    editable: false,
                    valueGetter: () => '',
                    cellRenderer: (params: { api: GridApi }) => {
                        if (armed) {
                            armed = false; // one shot: the nested commit refreshes these rows again
                            reentered = true;
                            params.api.commitBatchEdit();
                        }
                        return '';
                    },
                },
            ],
            rowData,
            defaultColDef: { editable: true },
            editType: 'singleCell',
            invalidEditValueMode: 'block',
        } satisfies GridOptions<PersonRow>);
        const gridDiv = getGridElement(api)! as HTMLElement;

        const stopped: BatchEditingStoppedEvent[] = [];
        api.addEventListener('batchEditingStopped', (e) => stopped.push(e));

        api.startBatchEdit();
        // rows render asynchronously: poll until the cell lookup succeeds
        await waitFor(() => cell(api, 0, 'age'));

        const ageCell = cell(api, 0, 'age');
        await userEvent.dblClick(ageCell);
        const ageInput = await waitForInput(gridDiv, ageCell);
        await userEvent.clear(ageInput);
        await userEvent.type(ageInput, '999');

        await new GridRows(api, 'invalid 999 held open before the re-entrant commit').check(`
            ROOT id:ROOT_NODE_ID reenter:""
            ├── LEAF 🖍️ ❌ id:0 athlete:"Alice" age:23❌ reenter:""
            └── LEAF id:1 athlete:"Bob" age:40 reenter:""
        `);

        armed = true;
        api.commitBatchEdit();

        expect(reentered).toBe(true);
        expect(api.isBatchEditing()).toBe(true);
        expect(stopped).toHaveLength(0);
        expect(editorCount(api)).toBeGreaterThan(0);
        expect(rowData[0].age).toBe(23);

        await new GridRows(api, 'block: re-entrant stop leaves the rejection intact').check(`
            ROOT id:ROOT_NODE_ID reenter:""
            ├── LEAF 🖍️ ❌ id:0 athlete:"Alice" age:23❌ reenter:""
            └── LEAF id:1 athlete:"Bob" age:40 reenter:""
        `);
    });
});
