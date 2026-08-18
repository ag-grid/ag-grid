import { waitFor } from '@testing-library/dom';
import { userEvent } from '@testing-library/user-event';
import {
    EditEventTracker,
    GridRows,
    TestGridsManager,
    asyncSetTimeout,
    waitForInput,
    waitForPopup,
} from 'ag-test-utils';
import { ALL_SEVERITIES } from 'ag-test-utils/dev-validations';

import type { GridApi, GridOptions, ICellEditorComp, ICellEditorParams } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    CustomEditorModule,
    NumberEditorModule,
    ScrollApiModule,
    TextEditorModule,
    TextFilterModule,
    enableDevValidations,
    getGridElement,
    setupAgTestIds,
} from 'ag-grid-community';

interface NumRow {
    name: string;
    number: number;
}

// Inline custom editor that auto-commits via params.stopEditing() (a picker/"Done" pattern). Validity
// is pull-only: getValidationErrors reads the live value; the editor never calls params.validate().
class AutoCommitEditor implements ICellEditorComp {
    private params!: ICellEditorParams<NumRow>;
    private eGui!: HTMLElement;
    private eInput!: HTMLInputElement;
    private value: number | null = null;

    public init(params: ICellEditorParams<NumRow>): void {
        this.params = params;
        this.eGui = document.createElement('div');
        this.eInput = document.createElement('input');
        this.eInput.className = 'auto-input';
        this.eGui.appendChild(this.eInput);

        const commit = document.createElement('button');
        commit.className = 'auto-commit';
        commit.addEventListener('click', () => this.params.stopEditing(false));
        this.eGui.appendChild(commit);

        this.value = params.value == null ? null : Number(params.value);
        this.eInput.value = this.value == null ? '' : String(this.value);
        this.eInput.addEventListener('input', (e) => {
            const v = (e.target as HTMLInputElement).value;
            this.value = v === '' ? null : Number(v);
        });
    }
    public getGui(): HTMLElement {
        return this.eGui;
    }
    public afterGuiAttached(): void {
        this.eInput.focus();
    }
    public getValue(): number | null {
        return this.value;
    }
    public getValidationErrors(): string[] | null {
        return this.value != null && this.value > 100 ? ['Value over 100'] : null;
    }
    public getValidationElement(): HTMLElement {
        return this.eInput;
    }
}

// Mirrors a Firefox date input: typed text stays buffered and only reaches the value (and therefore
// getValidationErrors) once the grid calls agFlushInput on the stop read.
class BufferedFlushEditor implements ICellEditorComp {
    private eInput!: HTMLInputElement;
    private buffered = '';
    private value: number | null = null;

    public init(params: ICellEditorParams<NumRow>): void {
        this.eInput = document.createElement('input');
        this.eInput.className = 'buffered-input';
        this.value = params.value == null ? null : Number(params.value);
        this.buffered = this.value == null ? '' : String(this.value);
        this.eInput.value = this.buffered;
        this.eInput.addEventListener('input', (e) => {
            this.buffered = (e.target as HTMLInputElement).value; // withheld from value until flush
        });
    }
    public getGui(): HTMLElement {
        return this.eInput;
    }
    public afterGuiAttached(): void {
        this.eInput.focus();
    }
    public agFlushInput(): void {
        this.value = this.buffered === '' ? null : Number(this.buffered);
    }
    public getValue(): number | null {
        return this.value;
    }
    public getValidationErrors(): string[] | null {
        return this.value != null && this.value > 100 ? ['Value over 100'] : null;
    }
    public getValidationElement(): HTMLElement {
        return this.eInput;
    }
}

interface PersonRow {
    athlete: string;
    age: number;
}

// Pull-only text editor: validity is exposed only via getValidationErrors (never per-cell invalid here);
// it never calls params.validate() on keystroke, so the validation maps stay stale until a stop repopulates.
class PullOnlyTextEditor implements ICellEditorComp {
    private eInput!: HTMLInputElement;
    public init(params: ICellEditorParams<PersonRow>): void {
        this.eInput = document.createElement('input');
        this.eInput.type = 'text';
        this.eInput.value = params.value == null ? '' : String(params.value);
    }
    public getGui(): HTMLElement {
        return this.eInput;
    }
    public afterGuiAttached(): void {
        this.eInput.focus();
        this.eInput.select();
    }
    public getValue(): string {
        return this.eInput.value;
    }
    public getValidationErrors(): string[] | null {
        return null;
    }
}

const gridsManager = new TestGridsManager({
    includeDefaultModules: true,
    modules: [
        ClientSideRowModelModule,
        NumberEditorModule,
        TextEditorModule,
        CustomEditorModule,
        TextFilterModule,
        ScrollApiModule,
    ],
});

beforeAll(() => setupAgTestIds());
afterEach(() => {
    gridsManager.reset();
    vi.clearAllMocks();
});

const cell = (api: GridApi, r: number, colId: string): HTMLElement =>
    (getGridElement(api)! as HTMLElement).querySelector<HTMLElement>(`[row-index="${r}"] [col-id="${colId}"]`)!;

const editorCount = (api: GridApi): number => api.getCellEditorInstances().length;

describe('Cell editing validation — block mode holds invalid values across all stop paths', () => {
    const makeNumGrid = (rowData: NumRow[]) =>
        gridsManager.createGridAndWait('block-stop', {
            columnDefs: [{ field: 'name' }, { field: 'number', cellEditor: AutoCommitEditor }],
            rowData,
            defaultColDef: { editable: true, filter: true },
            editType: 'singleCell',
            invalidEditValueMode: 'block',
        } satisfies GridOptions<NumRow>);

    // An editor that auto-commits via params.stopEditing() while its value is invalid must be HELD open
    // in block mode (matching api.stopEditing()), not silently discarded and closed.
    test('editor-initiated params.stopEditing() on an invalid value is held open', async () => {
        const rowData: NumRow[] = [
            { name: 'Bob', number: 10 },
            { name: 'Harry', number: 3 },
        ];
        const api = await makeNumGrid(rowData);
        const grid = getGridElement(api)! as HTMLElement;
        const user = userEvent.setup();
        const tracker = new EditEventTracker(api);

        await user.dblClick(cell(api, 0, 'number'));
        const input = await waitForInput(grid, cell(api, 0, 'number'));

        await new GridRows(api, 'block: editor opened on source value').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF 🖍️ id:0 name:"Bob" number:10
            └── LEAF id:1 name:"Harry" number:3
        `);

        await user.clear(input);
        await user.type(input, '150'); // invalid: > 100

        await new GridRows(api, 'block: invalid 150 typed, not yet auto-committed').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF 🖍️ id:0 name:"Bob" number:10
            └── LEAF id:1 name:"Harry" number:3
        `);

        // The editor auto-commits (its "Done" button calls params.stopEditing()).
        await user.click(grid.querySelector<HTMLElement>('.auto-commit')!);
        await asyncSetTimeout(0);

        // Block mode holds the editor open; nothing is committed.
        expect(editorCount(api)).toBe(1);
        expect(rowData[0].number).toBe(10);
        expect(tracker.counts.cellEditingStopped).toBe(0);

        await new GridRows(api, 'block: invalid auto-commit held open').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF 🖍️ ❌ id:0 name:"Bob" number:10❌
            └── LEAF id:1 name:"Harry" number:3
        `);

        // Correct the value and commit with Enter: the editor closes and the value lands.
        const inputAgain = await waitForInput(grid, cell(api, 0, 'number'));
        await user.clear(inputAgain);

        await new GridRows(api, 'block: invalid value cleared, still held').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF 🖍️ ❌ id:0 name:"Bob" number:10❌
            └── LEAF id:1 name:"Harry" number:3
        `);

        await user.type(inputAgain, '50{Enter}');
        await asyncSetTimeout(0);

        expect(editorCount(api)).toBe(0);
        expect(rowData[0].number).toBe(50);
        expect(tracker.counts.cellEditingStopped).toBe(1);

        await new GridRows(api, 'block: corrected value committed').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 name:"Bob" number:50
            └── LEAF id:1 name:"Harry" number:3
        `);
        tracker.destroy();
    });

    const makeRowLevelGrid = (rowData: PersonRow[]) =>
        gridsManager.createGridAndWait('block-rowlevel', {
            columnDefs: [
                { field: 'athlete', cellEditor: PullOnlyTextEditor },
                { field: 'age', editable: false },
            ],
            rowData,
            defaultColDef: { editable: true, filter: true },
            editType: 'fullRow',
            invalidEditValueMode: 'block',
            getFullRowEditValidationErrors: ({ editorsState }) => {
                const athlete = editorsState.find((e) => e.colId === 'athlete')?.newValue;
                return athlete === 'Invalid' ? ['Row is invalid'] : [];
            },
        } satisfies GridOptions<PersonRow>);

    // A row-level-invalid value (valid per-cell, rejected by getFullRowEditValidationErrors) must not be
    // committed by api.stopEditing() in block mode — the stop reads validation fresh, not from stale maps.
    test('api.stopEditing() holds a row-level-invalid value', async () => {
        const rowData: PersonRow[] = [{ athlete: 'Alice', age: 23 }];
        const api = await makeRowLevelGrid(rowData);
        const grid = getGridElement(api)! as HTMLElement;
        const user = userEvent.setup();

        await user.dblClick(cell(api, 0, 'athlete'));
        const input = await waitForInput(grid, cell(api, 0, 'athlete'));
        await user.clear(input);
        await user.type(input, 'Invalid');

        await new GridRows(api, 'block row-level: row-invalid value typed, before stop').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF 🖍️ id:0 athlete:"Alice" age:23
        `);

        api.stopEditing();
        await asyncSetTimeout(0);

        expect(rowData[0].athlete).toBe('Alice'); // held, not committed
        expect(api.getEditingCells().length).toBeGreaterThan(0);

        // Held open: the invalid "Invalid" is staged as the pending value, the source "Alice" is unchanged.
        await new GridRows(api, 'block row-level: invalid held on stopEditing').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF 🖍️ id:0 athlete:🖍️"Invalid" "Alice" age:23
        `);
    });

    // A filter change goes through the sort/filter handler, which cancels an invalid edit. It must
    // repopulate validation first, or a stale read would commit the invalid row instead of discarding it.
    test('a filter change discards a row-level-invalid value instead of committing it', async () => {
        const rowData: PersonRow[] = [{ athlete: 'Alice', age: 23 }];
        const api = await makeRowLevelGrid(rowData);
        const grid = getGridElement(api)! as HTMLElement;
        const user = userEvent.setup();

        await user.dblClick(cell(api, 0, 'athlete'));
        const input = await waitForInput(grid, cell(api, 0, 'athlete'));
        await user.clear(input);
        await user.type(input, 'Invalid');

        await new GridRows(api, 'block row-level: row-invalid value typed, before filter change').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF 🖍️ id:0 athlete:"Alice" age:23
        `);

        api.onFilterChanged();
        await asyncSetTimeout(0);

        expect(rowData[0].athlete).toBe('Alice'); // discarded, not committed
        expect(api.getEditingCells()).toHaveLength(0);

        // Invalid edit reverted: no pending value, source intact.
        await new GridRows(api, 'block row-level: invalid discarded on filter change').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 athlete:"Alice" age:23
        `);
    });

    // A pull-only editor never reports through params.validate(), so the sort/filter handler is the only
    // thing that can discover the value is invalid — it must repopulate before choosing cancel or commit.
    test('a filter change discards a pull-only editor invalid value instead of committing it', async () => {
        const rowData: NumRow[] = [{ name: 'Bob', number: 10 }];
        const api = await makeNumGrid(rowData);
        const grid = getGridElement(api)! as HTMLElement;
        const user = userEvent.setup();

        await user.dblClick(cell(api, 0, 'number'));
        const input = grid.querySelector<HTMLInputElement>('.auto-input')!;
        await user.clear(input);
        await user.type(input, '150'); // invalid, and only ever visible via getValidationErrors()

        await new GridRows(api, 'pull-only: invalid 150 held open before the filter change').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF 🖍️ id:0 name:"Bob" number:10
        `);

        api.onFilterChanged();
        await waitFor(() => expect(editorCount(api)).toBe(0));

        expect(rowData[0].number).toBe(10);
        expect(api.getEditingCells()).toHaveLength(0);

        await new GridRows(api, 'pull-only invalid discarded on filter change').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 name:"Bob" number:10
        `);
    });

    // Popups warn against fullRow (98) but the pairing is reachable, and a modal popup closes the moment
    // focus reaches a sibling. Ending the row edit there commits every sibling at whatever half-typed
    // value it holds, so the popup close only closes its own editor — the row owns its own stop.
    test('full-row: a popup closing as focus moves to a sibling does not commit the row', async () => {
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [98] });
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

        const rowData = [{ number: 10, other: 5 }];
        const api = await gridsManager.createGridAndWait('block-fullrow-popup', {
            columnDefs: [
                { field: 'number', cellEditor: 'agNumberCellEditor', cellEditorPopup: true },
                { field: 'other', cellEditor: 'agNumberCellEditor', cellEditorParams: { max: 100 } },
            ],
            rowData,
            defaultColDef: { editable: true },
            editType: 'fullRow',
            invalidEditValueMode: 'block',
            stopEditingWhenCellsLoseFocus: true,
        } satisfies GridOptions);
        const grid = getGridElement(api)! as HTMLElement;
        const user = userEvent.setup();
        const committed: string[] = [];
        api.addEventListener('cellValueChanged', (e) => committed.push(e.column.getColId()));

        await user.dblClick(cell(api, 0, 'number'));

        // The unsupported pairing must announce itself rather than fail silently.
        await waitFor(() => expect(warnSpy).toHaveBeenCalled());

        await new GridRows(api, 'full-row popup: row editors open, all valid').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF 🖍️ id:0 number:10 other:5
        `);

        // Clearing passes the sibling through null; committing the row here would persist that.
        const otherInput = grid.querySelector<HTMLInputElement>('[col-id="other"] input')!;
        await user.clear(otherInput);
        await user.type(otherInput, '150');
        await asyncSetTimeout(0);

        expect(committed).toEqual([]);
        expect(rowData[0].other).toBe(5);
        expect(rowData[0].number).toBe(10);

        await new GridRows(api, 'full-row popup: sibling invalid, nothing committed').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF 🖍️ ❌ id:0 number:10 other:5❌
        `);
    });

    // Full-row block mode: an editor calling params.stopEditing() from a VALID cell while a sibling in
    // the same row is invalid. The row stop is rejected, so that requesting cell's editor must not be
    // torn down — a per-cell validity check would destroy it and orphan the still-open row session.
    test('full-row: a valid cell auto-committing does not tear down its editor while a sibling is invalid', async () => {
        const rowData = [{ number: 10, other: 5 }];
        const api = await gridsManager.createGridAndWait('block-fullrow-autocommit', {
            columnDefs: [
                { field: 'number', cellEditor: AutoCommitEditor },
                { field: 'other', cellEditor: AutoCommitEditor },
            ],
            rowData,
            defaultColDef: { editable: true },
            editType: 'fullRow',
            invalidEditValueMode: 'block',
        } satisfies GridOptions);
        const grid = getGridElement(api)! as HTMLElement;
        const user = userEvent.setup();

        // Full-row edit opens editors for the whole row. Make 'other' invalid, leave 'number' valid.
        await user.dblClick(cell(api, 0, 'number'));
        await asyncSetTimeout(0);

        await new GridRows(api, 'full-row: all row editors opened, all valid').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF 🖍️ id:0 number:10 other:5
        `);

        const otherInput = grid.querySelector<HTMLInputElement>(`[col-id="other"] .auto-input`)!;
        await user.clear(otherInput);
        await user.type(otherInput, '150'); // invalid sibling: > 100

        const editorsBefore = editorCount(api);
        expect(editorsBefore).toBeGreaterThan(1);

        await new GridRows(api, 'full-row: invalid sibling typed, row held open').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF 🖍️ id:0 number:10 other:5
        `);

        // The VALID 'number' cell auto-commits via its "Done" button.
        await user.click(grid.querySelector<HTMLElement>(`[col-id="number"] .auto-commit`)!);
        await asyncSetTimeout(0);

        // Row stop rejected by the invalid sibling: every editor (incl. the requesting one) stays open.
        expect(editorCount(api)).toBe(editorsBefore);
        expect(api.getEditingCells().length).toBeGreaterThan(1);
        expect(rowData[0].number).toBe(10);
        expect(rowData[0].other).toBe(5);

        await new GridRows(api, 'full-row: auto-commit rejected, editors still open').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF 🖍️ ❌ id:0 number:10 other:5❌
        `);
    });

    // A pull-only editor never reports through params.validate(), so the recorded state stays behind the
    // editor until something validates: reading it must not be what brings it up to date.
    test('getEditValidationErrors reads the recorded state, validateEdit refreshes it', async () => {
        const rowData: NumRow[] = [{ name: 'Bob', number: 10 }];
        const api = await makeNumGrid(rowData);
        const grid = getGridElement(api)! as HTMLElement;
        const user = userEvent.setup();

        await user.dblClick(cell(api, 0, 'number'));
        const input = await waitForInput(grid, cell(api, 0, 'number'));
        await user.clear(input);
        await user.type(input, '150'); // invalid, and unreported by this editor

        expect(api.getEditValidationErrors()).toEqual([]);

        const validated = api.validateEdit()!;
        expect(validated.map((e) => [e.column.getColId(), e.messages])).toEqual([['number', ['Value over 100']]]);
        expect(api.getEditValidationErrors()).toEqual(validated); // the refreshed state, read back

        await new GridRows(api, 'pull-only: invalid value recorded once validated').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF 🖍️ ❌ id:0 name:"Bob" number:10❌
        `);
    });

    // An editor that buffers input until agFlushInput (as a Firefox date segment does) must be flushed
    // BEFORE the stop reads validity, or the newly-invalid value validates as the old valid one and is
    // then flushed and committed — defeating block mode.
    test('block: buffered input is flushed before validation, so a newly-invalid value is held', async () => {
        const rowData: NumRow[] = [{ name: 'Bob', number: 10 }];
        const api = await gridsManager.createGridAndWait('block-buffered-flush', {
            columnDefs: [{ field: 'name' }, { field: 'number', cellEditor: BufferedFlushEditor }],
            rowData,
            defaultColDef: { editable: true },
            editType: 'singleCell',
            invalidEditValueMode: 'block',
        } satisfies GridOptions<NumRow>);
        const grid = getGridElement(api)! as HTMLElement;
        const user = userEvent.setup();

        await user.dblClick(cell(api, 0, 'number'));
        const input = await waitForInput(grid, cell(api, 0, 'number'));

        await new GridRows(api, 'buffered: editor opened on source value').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF 🖍️ id:0 name:"Bob" number:10
        `);

        await user.clear(input);
        await user.type(input, '150'); // invalid, but buffered — not yet in the editor's value

        await new GridRows(api, 'buffered: typed but not yet flushed').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF 🖍️ id:0 name:"Bob" number:10
        `);

        api.stopEditing();
        await asyncSetTimeout(0);

        // Flushed first, so 150 is seen as invalid: block mode holds it and commits nothing.
        expect(rowData[0].number).toBe(10);
        expect(editorCount(api)).toBe(1);
        expect(api.getEditingCells()).toHaveLength(1);

        await new GridRows(api, 'buffered: flushed value seen as invalid and held').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF 🖍️ ❌ id:0 name:"Bob" number:10❌
        `);
    });

    // An explicit revalidation is the caller asking about what has been typed, so it flushes first —
    // otherwise a buffered value validates as the old one, and the API disagrees with the next stop.
    test('api.validateEdit() flushes buffered input before revalidating', async () => {
        const rowData: NumRow[] = [{ name: 'Bob', number: 10 }];
        const api = await gridsManager.createGridAndWait('validate-edit-flush', {
            columnDefs: [{ field: 'name' }, { field: 'number', cellEditor: BufferedFlushEditor }],
            rowData,
            defaultColDef: { editable: true },
            editType: 'singleCell',
            invalidEditValueMode: 'block',
        } satisfies GridOptions<NumRow>);
        const grid = getGridElement(api)! as HTMLElement;
        const user = userEvent.setup();

        await user.dblClick(cell(api, 0, 'number'));
        const input = await waitForInput(grid, cell(api, 0, 'number'));
        await user.clear(input);
        await user.type(input, '150'); // invalid, but withheld from the editor's value until flushed

        expect(api.getEditValidationErrors()).toEqual([]); // nothing has read the buffer yet

        const errors = api.validateEdit();
        expect(errors).toHaveLength(1);
        expect(errors![0].messages).toEqual(['Value over 100']);
        expect(errors![0].column.getColId()).toBe('number');
        expect(api.getEditValidationErrors()).toEqual(errors); // and it is recorded, not just reported
    });
});

describe('Cell editing validation — an edit ending off-screen still fires cellEditingStopped', () => {
    const makeGrid = (rowData: NumRow[]) =>
        gridsManager.createGridAndWait('offscreen', {
            columnDefs: [{ field: 'name' }, { field: 'number', cellEditor: AutoCommitEditor }],
            rowData,
            defaultColDef: { editable: true, filter: true },
            editType: 'singleCell',
            invalidEditValueMode: 'block',
        } satisfies GridOptions<NumRow>);

    // Hiding the edited column destroys its cell controller; ending the edit afterwards must still fire
    // cellEditingStopped (the event pair must balance even though the cell is no longer rendered).
    test('hiding the edited column then stopping fires cellEditingStopped', async () => {
        const rowData: NumRow[] = [
            { name: 'Bob', number: 10 },
            { name: 'Harry', number: 3 },
        ];
        const api = await makeGrid(rowData);
        const grid = getGridElement(api)! as HTMLElement;
        const user = userEvent.setup();
        const tracker = new EditEventTracker(api);

        await user.dblClick(cell(api, 0, 'number'));
        await waitForInput(grid, cell(api, 0, 'number'));
        expect(api.getEditingCells()).toHaveLength(1);
        expect(tracker.counts.cellEditingStarted).toBe(1);

        await new GridRows(api, 'offscreen: editing before the column is hidden').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF 🖍️ id:0 name:"Bob" number:10
            └── LEAF id:1 name:"Harry" number:3
        `);

        api.setColumnsVisible(['number'], false); // cell controller destroyed, edit retained
        api.onFilterChanged();
        await asyncSetTimeout(0);

        expect(api.getEditingCells()).toHaveLength(0);
        expect(tracker.counts.cellEditingStopped).toBe(1);

        await new GridRows(api, 'offscreen: column hidden, edit ended with no orphan').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 name:"Bob" number:10
            └── LEAF id:1 name:"Harry" number:3
        `);
        tracker.destroy();
    });

    // Removing the edited row via a transaction purges its edit; that purge must go through the editor
    // teardown so cellEditingStopped fires and the held validation error is cleared (not orphaned).
    test('removing the edited row via transaction fires cellEditingStopped and clears validation', async () => {
        const rowData: NumRow[] = [
            { name: 'Bob', number: 10 },
            { name: 'Harry', number: 3 },
        ];
        const api = await makeGrid(rowData);
        const grid = getGridElement(api)! as HTMLElement;
        const user = userEvent.setup();
        const tracker = new EditEventTracker(api);

        await user.dblClick(cell(api, 0, 'number'));
        const input = await waitForInput(grid, cell(api, 0, 'number'));
        await user.clear(input);
        await user.type(input, '150'); // invalid → validation populated
        await asyncSetTimeout(0);
        expect(tracker.counts.cellEditingStarted).toBe(1);

        await new GridRows(api, 'offscreen: invalid value held before the row is removed').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF 🖍️ id:0 name:"Bob" number:10
            └── LEAF id:1 name:"Harry" number:3
        `);

        api.applyTransaction({ remove: [api.getRenderedNodes()[0].data] });
        await asyncSetTimeout(0);

        expect(tracker.counts.cellEditingStopped).toBe(1);
        expect(api.getEditingCells()).toHaveLength(0);

        // The removed row's held validation error must not linger: re-opening the other row edits cleanly.
        await new GridRows(api, 'after row removal: no orphaned edit/validation').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:1 name:"Harry" number:3
        `);
        tracker.destroy();
    });
});

describe('Cell editing validation — a held invalid value survives column virtualisation', () => {
    const COLS = 30;

    // Scrolling the edited column out of view and back (column virtualisation) must NOT release the
    // block: the grid keeps the editing cell mounted, so the invalid value stays held, not silently reset.
    test('scrolling the edited column out and back keeps the invalid value held', async () => {
        const columnDefs = Array.from({ length: COLS }, (_, i) => ({
            field: `c${i}`,
            width: 200,
            cellEditor: i === 0 ? AutoCommitEditor : undefined,
        }));
        const rowData = [Object.fromEntries(Array.from({ length: COLS }, (_, i) => [`c${i}`, i === 0 ? 10 : i]))];

        const api = await gridsManager.createGridAndWait('virt-block', {
            columnDefs,
            rowData,
            defaultColDef: { editable: true },
            editType: 'singleCell',
            invalidEditValueMode: 'block',
            suppressColumnVirtualisation: false,
            suppressAnimationFrame: true,
        } satisfies GridOptions);

        const grid = getGridElement(api)! as HTMLElement;
        const user = userEvent.setup();
        const editorRendered = () => !!grid.querySelector(`[row-index="0"] [col-id="c0"] .auto-input`);
        const lastColRendered = () => !!grid.querySelector(`[row-index="0"] [col-id="c${COLS - 1}"]`);

        await user.dblClick(grid.querySelector<HTMLElement>(`[row-index="0"] [col-id="c0"]`)!);
        const input = await waitForInput(grid, grid.querySelector<HTMLElement>(`[row-index="0"] [col-id="c0"]`)!);
        await user.clear(input);
        await user.type(input, '150'); // invalid, held
        await asyncSetTimeout(0);
        expect(lastColRendered()).toBe(false); // far column virtualised out initially

        api.ensureColumnVisible(`c${COLS - 1}`); // scroll editing column out of view
        await asyncSetTimeout(0);
        expect(lastColRendered()).toBe(true); // virtualisation genuinely active
        expect(editorRendered()).toBe(true); // editing cell kept mounted (doNotUnVirtualiseRow)

        api.ensureColumnVisible('c0'); // scroll back
        await asyncSetTimeout(0);

        const editors = api.getCellEditorInstances();
        expect(editors).toHaveLength(1);
        expect((editors[0] as AutoCommitEditor).getValue()).toBe(150); // typed value survived
        expect((api.getRenderedNodes()[0].data as any).c0).toBe(10); // block held, nothing committed
        expect(api.getEditingCells()).toHaveLength(1);

        await new GridRows(api, 'virtualisation: invalid value still held after scrolling back').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF 🖍️ id:0 c0:10 c1:1 c2:2 c3:3 c4:4 c5:5 c6:6 c7:7 c8:8 c9:9 c10:10 c11:11 c12:12 c13:13 c14:14 c15:15 c16:16 c17:17 c18:18 c19:19 c20:20 c21:21 c22:22 c23:23 c24:24 c25:25 c26:26 c27:27 c28:28 c29:29
        `);
    });

    // A popup close is not a row stop, so the blocked branch must revert only its own cell. Cancelling
    // the row there would end the whole row edit along with the invalid value.
    test('full-row: a popup closing on an invalid value reverts that cell only, leaving the row editing', async () => {
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [98] });
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

        const rowData = [{ name: 'a', number: 10 }];
        const api = await gridsManager.createGridAndWait('block-fullrow-popup-invalid', {
            columnDefs: [
                { field: 'name', cellEditor: 'agTextCellEditor' },
                {
                    field: 'number',
                    cellEditor: 'agNumberCellEditor',
                    cellEditorPopup: true,
                    cellEditorParams: { max: 100 },
                },
            ],
            rowData,
            defaultColDef: { editable: true },
            editType: 'fullRow',
            invalidEditValueMode: 'block',
            stopEditingWhenCellsLoseFocus: true,
        } satisfies GridOptions);
        const grid = getGridElement(api)! as HTMLElement;
        const user = userEvent.setup();
        const committed: string[] = [];
        api.addEventListener('cellValueChanged', (e) => committed.push(e.column.getColId()));

        await user.dblClick(cell(api, 0, 'number'));
        const popup = await waitForPopup(grid);

        // The unsupported popup/fullRow pairing must announce itself rather than fail silently.
        expect(warnSpy).toHaveBeenCalled();

        const numberInput = popup.querySelector<HTMLInputElement>('input')!;
        await user.clear(numberInput);
        await user.type(numberInput, '150'); // above max, so the row is held invalid
        await asyncSetTimeout(0);

        await new GridRows(api, 'full-row popup: popup cell invalid, row held').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF 🖍️ ❌ id:0 name:"a" number:10❌
        `);

        // Focus a sibling: the popup closes, but that must not end the row edit.
        const nameInput = grid.querySelector<HTMLInputElement>('[col-id="name"] input')!;
        await user.click(nameInput);
        await asyncSetTimeout(0);

        expect(committed).toEqual([]); // nothing invalid written
        expect(api.getEditingCells().length).toBeGreaterThan(0); // row edit survived the popup close
        expect(api.getEditValidationErrors()).toEqual([]); // the reverted cell keeps no error

        await new GridRows(api, 'full-row popup: invalid cell reverted, row still editing').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF 🖍️ id:0 name:"a" number:10
        `);

        // The surviving row edit is still usable: a sibling can be edited and committed.
        await user.clear(grid.querySelector<HTMLInputElement>('[col-id="name"] input')!);
        await user.type(grid.querySelector<HTMLInputElement>('[col-id="name"] input')!, 'edited{Enter}');
        await asyncSetTimeout(0);

        expect(rowData[0].name).toBe('edited');
        expect(rowData[0].number).toBe(10);
    });
});

describe('Cell editing validation — a full-row popup close only ends its own cell', () => {
    const makePopupRowGrid = (rowData: { number: number; other: number }[]) =>
        gridsManager.createGridAndWait('fullrow-popup-close', {
            columnDefs: [
                {
                    field: 'number',
                    cellEditor: 'agNumberCellEditor',
                    cellEditorPopup: true,
                    cellEditorParams: { max: 100 },
                },
                { field: 'other', cellEditor: 'agNumberCellEditor', cellEditorParams: { max: 100 } },
            ],
            rowData,
            defaultColDef: { editable: true },
            editType: 'fullRow',
            invalidEditValueMode: 'block',
            stopEditingWhenCellsLoseFocus: true,
        } satisfies GridOptions);

    // The popup close ends that cell's editor while the row edit carries on, so the value typed into it
    // has to be staged on the way out — the row stop that follows is the only thing that commits it.
    test('full-row: a value typed in a popup survives the close and commits with the row', async () => {
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [98] });
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

        const rowData = [{ number: 10, other: 1 }];
        const api = await makePopupRowGrid(rowData);
        const grid = getGridElement(api)! as HTMLElement;
        const user = userEvent.setup();

        await user.dblClick(cell(api, 0, 'number'));
        const popup = await waitForPopup(grid);
        expect(warnSpy).toHaveBeenCalled(); // the unsupported popup/fullRow pairing announces itself

        const numberInput = popup.querySelector<HTMLInputElement>('input')!;
        await user.clear(numberInput);
        await user.type(numberInput, '42'); // valid
        await asyncSetTimeout(0);

        // Focusing the sibling closes the popup; full-row commits on the row stop, not here.
        const otherInput = grid.querySelector<HTMLInputElement>('[col-id="other"] input')!;
        await user.click(otherInput);
        await asyncSetTimeout(0);

        expect(rowData[0].number).toBe(10); // not committed yet
        expect(api.getEditingCells().length).toBeGreaterThan(0);

        await new GridRows(api, 'full-row popup: typed value staged by the popup close').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF 🖍️ ⏳ id:0 number:🖍️42 10 other:1
        `);

        await user.type(otherInput, '{Enter}'); // row stop
        await asyncSetTimeout(0);

        expect(rowData[0].number).toBe(42);

        await new GridRows(api, 'full-row popup: staged value committed by the row stop').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 number:42 other:1
        `);
    });

    // Block mode holds the row's commit for any error in it, but the revert decision is this cell's alone:
    // reverting because a sibling is invalid would discard a value the user validly typed in the popup.
    test('full-row: a popup closing while a sibling is invalid keeps its own typed value', async () => {
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [98] });
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

        // The sibling starts out above its max, so it is already invalid when the popup closes.
        const rowData = [{ number: 10, other: 500 }];
        const api = await makePopupRowGrid(rowData);
        const grid = getGridElement(api)! as HTMLElement;
        const user = userEvent.setup();

        await user.dblClick(cell(api, 0, 'number'));
        const popup = await waitForPopup(grid);
        expect(warnSpy).toHaveBeenCalled(); // the unsupported popup/fullRow pairing announces itself

        const numberInput = popup.querySelector<HTMLInputElement>('input')!;
        await user.clear(numberInput);
        await user.type(numberInput, '42'); // valid, while the sibling is not
        await asyncSetTimeout(0);

        const otherInput = grid.querySelector<HTMLInputElement>('[col-id="other"] input')!;
        await user.click(otherInput);
        await asyncSetTimeout(0);

        await new GridRows(api, 'full-row popup: valid popup value kept, invalid sibling held').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF 🖍️ ⏳ ❌ id:0 number:🖍️42 10 other:500❌
        `);

        // The row is still blocked by the sibling: fixing it commits both values, including the popup's.
        await user.clear(otherInput);
        await user.type(otherInput, '5{Enter}');
        await asyncSetTimeout(0);

        expect(rowData[0].number).toBe(42);
        expect(rowData[0].other).toBe(5);

        await new GridRows(api, 'full-row popup: row committed once the sibling was fixed').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 number:42 other:5
        `);
    });

    // A row-level error belongs to no cell, so reverting the popup's value cannot clear it — it would only
    // discard a value validly typed there while the row stays blocked either way.
    test('full-row: a popup closing while the row itself is invalid keeps its own typed value', async () => {
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [98] });
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

        const rowData = [{ number: 10, other: 1 }];
        const api = await gridsManager.createGridAndWait('fullrow-popup-row-invalid', {
            columnDefs: [
                {
                    field: 'number',
                    cellEditor: 'agNumberCellEditor',
                    cellEditorPopup: true,
                    cellEditorParams: { max: 100 },
                },
                { field: 'other', cellEditor: 'agNumberCellEditor', cellEditorParams: { max: 100 } },
            ],
            rowData,
            defaultColDef: { editable: true },
            editType: 'fullRow',
            invalidEditValueMode: 'block',
            stopEditingWhenCellsLoseFocus: true,
            // Cross-field rule: every cell can be valid while the row is not.
            getFullRowEditValidationErrors: ({ editorsState }) => {
                const number = editorsState.find((e) => e.colId === 'number')?.newValue;
                const other = editorsState.find((e) => e.colId === 'other')?.newValue;
                return number > other ? ['number must not exceed other'] : [];
            },
        } satisfies GridOptions);
        const grid = getGridElement(api)! as HTMLElement;
        const user = userEvent.setup();

        await user.dblClick(cell(api, 0, 'number'));
        const popup = await waitForPopup(grid);
        expect(warnSpy).toHaveBeenCalled(); // the unsupported popup/fullRow pairing announces itself

        const numberInput = popup.querySelector<HTMLInputElement>('input')!;
        await user.clear(numberInput);
        await user.type(numberInput, '42'); // within max, but above the sibling
        await asyncSetTimeout(0);

        const otherInput = grid.querySelector<HTMLInputElement>('[col-id="other"] input')!;
        await user.click(otherInput);
        await asyncSetTimeout(0);

        expect(api.getEditValidationErrors()).toEqual([]); // the hold is the row's, no cell is at fault

        // No ❌: the diagram marks cell errors, and a row-level one belongs to no cell. The row is still
        // held all the same — nothing is committed until the rule is satisfied below.
        await new GridRows(api, 'full-row popup: valid popup value kept, row-level error held').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF 🖍️ ⏳ id:0 number:🖍️42 10 other:1
        `);

        // Satisfying the row rule commits both values, including the one typed in the popup.
        await user.clear(otherInput);
        await user.type(otherInput, '100{Enter}');
        await asyncSetTimeout(0);

        expect(rowData[0].number).toBe(42);
        expect(rowData[0].other).toBe(100);

        await new GridRows(api, 'full-row popup: row committed once the row rule was satisfied').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 number:42 other:100
        `);
    });

    // A blocked value never reaches the edit model (the sync drops it), so the row rule keeps seeing the
    // source value while it is held. The revert then restores the staged value: recompute, or the row
    // carries the verdict on a value it no longer holds.
    test('full-row: reverting a blocked popup value revalidates the row against the value left behind', async () => {
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [98] });
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

        const rowData = [{ number: 10, other: 50 }];
        const api = await gridsManager.createGridAndWait('fullrow-popup-revert-row-error', {
            columnDefs: [
                {
                    field: 'number',
                    cellEditor: 'agNumberCellEditor',
                    cellEditorPopup: true,
                    cellEditorParams: { max: 100 },
                },
                { field: 'other', cellEditor: 'agNumberCellEditor', cellEditorParams: { max: 100 } },
            ],
            rowData,
            defaultColDef: { editable: true },
            editType: 'fullRow',
            invalidEditValueMode: 'block',
            stopEditingWhenCellsLoseFocus: true,
            getFullRowEditValidationErrors: ({ editorsState }) => {
                const number = editorsState.find((e) => e.colId === 'number')?.newValue;
                return number != null && number > 20 ? ['number must not exceed 20'] : [];
            },
        } satisfies GridOptions);
        const grid = getGridElement(api)! as HTMLElement;
        const user = userEvent.setup();
        const rowShowsInvalid = () => !!grid.querySelector('.ag-row[row-index="0"].ag-row-editing-invalid');
        const otherInput = () => grid.querySelector<HTMLInputElement>('[col-id="other"] input')!;

        // 42 breaks the row rule but not the cell's own max, so it is staged by the popup close.
        await user.dblClick(cell(api, 0, 'number'));
        const numberInput = (await waitForPopup(grid)).querySelector<HTMLInputElement>('input')!;
        expect(warnSpy).toHaveBeenCalled(); // the unsupported popup/fullRow pairing announces itself
        await user.clear(numberInput);
        await user.type(numberInput, '42');
        await user.click(otherInput());
        await asyncSetTimeout(0);

        expect(rowShowsInvalid()).toBe(true);
        await new GridRows(api, 'full-row popup: 42 staged, row rule broken by it').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF 🖍️ ⏳ id:0 number:🖍️42 10 other:50
        `);

        // Reopening and typing over its max drops 42 from the model, so the row rule now sees 10.
        api.startEditingCell({ rowIndex: 0, colKey: 'number' });
        const reopened = (await waitForPopup(grid)).querySelector<HTMLInputElement>('input')!;
        await user.clear(reopened);
        await user.type(reopened, '500');
        await asyncSetTimeout(0);

        expect(rowShowsInvalid()).toBe(false);

        // Closing the popup reverts the blocked 500, leaving the staged 42 — which the rule rejects.
        await user.click(otherInput());
        await asyncSetTimeout(0);

        expect(api.getEditValidationErrors()).toEqual([]); // no cell is at fault, the hold is the row's
        expect(rowShowsInvalid()).toBe(true);
        await new GridRows(api, 'full-row popup: revert restored 42, row rule broken again').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF 🖍️ ⏳ id:0 number:🖍️42 10 other:50
        `);

        // Block mode holds the row for its own error: nothing commits until the rule is satisfied.
        await user.type(otherInput(), '{Enter}');
        await asyncSetTimeout(0);

        expect(rowData[0].number).toBe(10);
        expect(api.getEditingCells().length).toBeGreaterThan(0);
    });

    // Escape on a held invalid value cancels the edit, which reverts it in place and so re-creates the
    // editor before closing it. The close still belongs to the session that fired cellEditingStarted.
    test('block: Escape in a popup holding an invalid value fires cellEditingStopped', async () => {
        const rowData: NumRow[] = [{ name: 'Bob', number: 10 }];
        const api = await gridsManager.createGridAndWait('block-popup-escape', {
            columnDefs: [
                { field: 'name' },
                {
                    field: 'number',
                    cellEditor: 'agNumberCellEditor',
                    cellEditorPopup: true,
                    cellEditorParams: { max: 100 },
                },
            ],
            rowData,
            defaultColDef: { editable: true },
            editType: 'singleCell',
            invalidEditValueMode: 'block',
        } satisfies GridOptions<NumRow>);
        const grid = getGridElement(api)! as HTMLElement;
        const user = userEvent.setup();
        const tracker = new EditEventTracker(api);

        await user.dblClick(cell(api, 0, 'number'));
        const popup = await waitForPopup(grid);
        const input = popup.querySelector<HTMLInputElement>('input')!;
        await user.clear(input);
        await user.type(input, '150'); // above max: held by block mode
        await asyncSetTimeout(0);

        expect(tracker.counts.cellEditingStarted).toBe(1);
        expect(tracker.counts.cellEditingStopped).toBe(0);

        await user.keyboard('{Escape}');
        await asyncSetTimeout(0);

        expect(tracker.counts.cellEditingStopped).toBe(1);
        expect(api.getEditingCells()).toHaveLength(0);
        expect(rowData[0].number).toBe(10); // cancelled, so nothing written

        await new GridRows(api, 'popup escape: edit cancelled, nothing held').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 name:"Bob" number:10
        `);
        tracker.destroy();
    });

    // A popup editor that buffers input (as a Firefox date segment does) must be flushed before the close
    // reads validity, or the stop that follows rejects a value whose popup DOM has already gone.
    test('block: a buffered popup value is flushed before the close decides, not left held', async () => {
        const rowData: NumRow[] = [{ name: 'Bob', number: 10 }];
        const api = await gridsManager.createGridAndWait('block-popup-buffered', {
            columnDefs: [
                { field: 'name' },
                { field: 'number', cellEditor: BufferedFlushEditor, cellEditorPopup: true },
            ],
            rowData,
            defaultColDef: { editable: true },
            editType: 'singleCell',
            invalidEditValueMode: 'block',
            stopEditingWhenCellsLoseFocus: true,
        } satisfies GridOptions<NumRow>);
        const grid = getGridElement(api)! as HTMLElement;
        const user = userEvent.setup();

        await user.dblClick(cell(api, 0, 'number'));
        const popup = await waitForPopup(grid);
        const input = popup.querySelector<HTMLInputElement>('.buffered-input')!;
        await user.clear(input);
        await user.type(input, '150'); // invalid once flushed, buffered until then

        await user.click(cell(api, 0, 'name')); // closes the popup
        await asyncSetTimeout(0);

        // Seen as invalid at the close, so the edit is reverted rather than held with no editor to fix it.
        expect(rowData[0].number).toBe(10);
        expect(api.getEditingCells()).toHaveLength(0);
        expect(editorCount(api)).toBe(0);

        await new GridRows(api, 'buffered popup: closed on an invalid value, nothing left held').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 name:"Bob" number:10
        `);
    });
});

describe('Cell editing validation — a rule removed while its error is held', () => {
    // Neither validation hook, so nothing but the row callback can report an error while this editor is open.
    class PlainEditor implements ICellEditorComp {
        private eInput!: HTMLInputElement;
        public init(params: ICellEditorParams): void {
            this.eInput = document.createElement('input');
            this.eInput.value = params.value == null ? '' : String(params.value);
        }
        public getGui(): HTMLElement {
            return this.eInput;
        }
        public afterGuiAttached(): void {
            this.eInput.focus();
        }
        public getValue(): number | null {
            const value = this.eInput.value;
            return value === '' ? null : Number(value);
        }
    }

    // Block mode holds the row on an error nothing revisits, so a rule dropped mid-edit would wedge the row:
    // no rule left to satisfy, and the recorded verdict outliving the rule that formed it.
    test('removing the last rule releases the row it was holding', async () => {
        const rowData = [{ name: 'Bob', number: 23 }];
        const api = await gridsManager.createGridAndWait('rule-removed-mid-edit', {
            columnDefs: [{ field: 'name' }, { field: 'number', editable: true, cellEditor: PlainEditor }],
            rowData,
            editType: 'fullRow',
            invalidEditValueMode: 'block',
            getFullRowEditValidationErrors: ({ editorsState }) => {
                const number = editorsState.find((e) => e.colId === 'number')?.newValue;
                return number != null && number > 30 ? ['number must not exceed 30'] : [];
            },
        } satisfies GridOptions);
        const grid = getGridElement(api)! as HTMLElement;
        const user = userEvent.setup();
        const numberInput = () => grid.querySelector<HTMLInputElement>('[col-id="number"] input')!;

        await user.dblClick(cell(api, 0, 'number'));
        await user.clear(numberInput());
        await user.type(numberInput(), '40{Enter}');
        await asyncSetTimeout(0);

        expect(rowData[0].number).toBe(23); // held by the row rule
        expect(api.getEditingCells().length).toBeGreaterThan(0);

        await new GridRows(api, 'row held by the rule, 40 not committed').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF 🖍️ id:0 name:"Bob" number:🖍️40 23
        `);

        api.setGridOption('getFullRowEditValidationErrors', undefined);
        await user.type(numberInput(), '{Enter}');
        await asyncSetTimeout(0);

        expect(rowData[0].number).toBe(40);
        expect(api.getEditingCells()).toEqual([]);

        await new GridRows(api, 'rule gone, the row it held commits').check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 name:"Bob" number:40
        `);
    });
});
