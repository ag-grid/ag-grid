import { userEvent } from '@testing-library/user-event';
import { GridRows, TestGridsManager, asyncSetTimeout, waitForInput, waitForPopup } from 'ag-test-utils';

import type { GridApi, GridOptions, ICellEditorComp, ICellEditorParams } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    CustomEditorModule,
    NumberEditorModule,
    TextEditorModule,
    TextFilterModule,
    getGridElement,
    setupAgTestIds,
} from 'ag-grid-community';

interface PersonRow {
    athlete: string;
    age: number;
    // Seeded as undefined so the custom editor starts from a null/undefined source value.
    phone?: string;
    hideable?: string;
}

function makeRowData(): PersonRow[] {
    return [
        { athlete: 'Alice', age: 23, hideable: 'x' },
        { athlete: 'Bob', age: 40, hideable: 'y' },
    ];
}

// Faithful port of the reported PhoneEditor: getValidationErrors + getValidationElement, driving
// validation via an async params.validate() on input/blur (as the React editor did).
const PHONE_REGEX = /^\(\d{3}\)\s\d{3}-\d{4}$/;
let lastPhoneParams: ICellEditorParams<PersonRow> | undefined;

class PhoneEditor implements ICellEditorComp {
    private params!: ICellEditorParams<PersonRow>;
    private eInput!: HTMLInputElement;

    public init(params: ICellEditorParams<PersonRow>): void {
        lastPhoneParams = params;
        this.params = params;
        this.eInput = document.createElement('input');
        this.eInput.type = 'text';
        this.eInput.value = String(params.value ?? '');

        this.eInput.addEventListener('input', () => {
            setTimeout(() => this.params.validate?.());
        });
        this.eInput.addEventListener('blur', () => this.params.validate?.());
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
        const trimmed = (this.eInput.value || '').trim();
        return PHONE_REGEX.test(trimmed) ? null : ['Invalid phone format. Use (123) 456-7890'];
    }

    public getValidationElement(): HTMLElement {
        return this.eInput;
    }
}

interface NumericRow {
    name: string;
    number: number;
}

// Faithful port of the reported popup NumericEditor (TC3): getValidationErrors reads the grid-managed
// value, getValidationElement returns a wrapper div, and updateValue drives synchronous validation.
class NumericEditor implements ICellEditorComp {
    private params!: ICellEditorParams<NumericRow>;
    private eGui!: HTMLElement;
    private eInput!: HTMLInputElement;
    private value: number | null = null;
    // Push validation into the model on each keystroke; PullOnlyNumericEditor turns this off.
    protected pushValidation = true;

    public init(params: ICellEditorParams<NumericRow>): void {
        this.params = params;
        this.eGui = document.createElement('div');
        this.eGui.className = 'numeric-editor-wrapper';
        this.eInput = document.createElement('input');
        this.eInput.className = 'numeric-input';
        this.eGui.appendChild(this.eInput);

        const startValue = params.value == null ? '' : String(params.value);
        this.updateValue(startValue);
        this.eInput.value = this.value == null ? '' : String(this.value);

        this.eInput.addEventListener('input', (event) => this.updateValue((event.target as HTMLInputElement).value));
    }

    private updateValue(val: string): void {
        this.value = val === '' ? null : parseInt(val, 10);
        if (this.pushValidation) {
            this.params.validate?.();
        }
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

    public isPopup(): boolean {
        return true;
    }

    public getValidationErrors(): string[] | null {
        return this.value != null && this.value > 100 ? ['Value over 100'] : null;
    }

    public getValidationElement(): HTMLElement {
        return this.eGui;
    }
}

// Pull-only popup editor: exposes validity via getValidationErrors but never pushes it through
// params.validate(), so the validation model stays empty until the grid reads it on stop.
class PullOnlyNumericEditor extends NumericEditor {
    protected override pushValidation = false;
}

describe('Cell editing validation — custom editor state after focus/filter/column changes', () => {
    const gridsManager = new TestGridsManager({
        includeDefaultModules: true,
        modules: [ClientSideRowModelModule, NumberEditorModule, TextEditorModule, CustomEditorModule, TextFilterModule],
    });

    beforeAll(() => {
        setupAgTestIds();
    });

    afterEach(() => {
        gridsManager.reset();
        lastPhoneParams = undefined;
        vi.clearAllMocks();
    });

    const cell = (api: GridApi, rowIndex: number, colId: string): HTMLElement => {
        const gridElement = getGridElement(api)! as HTMLElement;
        return gridElement.querySelector<HTMLElement>(`[row-index="${rowIndex}"] [col-id="${colId}"]`)!;
    };

    const editorCount = (api: GridApi): number => api.getCellEditorInstances().length;

    const createPhoneGrid = (rowData: PersonRow[]) =>
        gridsManager.createGridAndWait('filter-change-edit', {
            columnDefs: [
                {
                    field: 'athlete',
                    cellEditorParams: {
                        getValidationErrors: ({ value }: { value: string }) =>
                            !value || value.length < 3 ? ['Name must be at least 3 characters long'] : null,
                    },
                },
                { field: 'age', cellEditor: 'agNumberCellEditor', cellEditorParams: { min: 0, max: 100 } },
                { field: 'phone', headerName: 'Custom Phone Editor', cellEditor: PhoneEditor },
                { field: 'hideable', hide: true },
            ],
            rowData,
            defaultColDef: { editable: true },
            editType: 'singleCell',
            invalidEditValueMode: 'block',
            stopEditingWhenCellsLoseFocus: true,
        } satisfies GridOptions<PersonRow>);

    test('built-in: invalid in-flight age is discarded when the filter changes', async () => {
        const rowData = makeRowData();
        const api = await createPhoneGrid(rowData);
        const gridElement = getGridElement(api)! as HTMLElement;
        const user = userEvent.setup();

        const ageCell = cell(api, 0, 'age');
        await user.dblClick(ageCell);
        const ageInput = await waitForInput(gridElement, ageCell);
        await user.clear(ageInput);
        await user.type(ageInput, '999');

        expect(editorCount(api)).toBeGreaterThan(0);
        expect(api.getEditingCells()).toHaveLength(1);

        await new GridRows(api, 'built-in: invalid age in flight').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF 🖍️ ❌ id:0 athlete:"Alice" age:23❌ hideable:"x"
            └── LEAF id:1 athlete:"Bob" age:40 hideable:"y"
        `);

        api.setColumnsVisible(['hideable'], true);
        api.onFilterChanged();

        expect(editorCount(api)).toBe(0);
        expect(api.getEditingCells()).toHaveLength(0);
        expect(rowData[0].age).toBe(23);

        await new GridRows(api, 'built-in: the filter change discarded the invalid age').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 athlete:"Alice" age:23 hideable:"x"
            └── LEAF id:1 athlete:"Bob" age:40 hideable:"y"
        `);
    });

    test('custom (undefined source): invalid in-flight phone is discarded when the filter changes', async () => {
        const rowData = makeRowData();
        const api = await createPhoneGrid(rowData);
        const gridElement = getGridElement(api)! as HTMLElement;
        const user = userEvent.setup();

        const phoneCell = cell(api, 0, 'phone');
        await user.dblClick(phoneCell);
        const phoneInput = await waitForInput(gridElement, phoneCell);
        await user.clear(phoneInput);
        await user.type(phoneInput, 'ab'); // invalid format
        await asyncSetTimeout(0); // flush the editor's async validate()

        expect(api.getEditingCells()).toHaveLength(1);

        await new GridRows(api, 'custom: invalid phone in flight').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF 🖍️ ❌ id:0 athlete:"Alice" age:23 hideable:"x"
            └── LEAF id:1 athlete:"Bob" age:40 hideable:"y"
        `);

        api.setColumnsVisible(['hideable'], true);
        api.onFilterChanged();
        await asyncSetTimeout(0);

        // Expected: custom editor behaves like the built-in — edit discarded, editor closed, no orphan.
        expect(editorCount(api)).toBe(0);
        expect(api.getEditingCells()).toHaveLength(0);
        expect(rowData[0].phone).toBeUndefined();

        await new GridRows(api, 'custom: the filter change discarded the invalid phone').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 athlete:"Alice" age:23 hideable:"x"
            └── LEAF id:1 athlete:"Bob" age:40 hideable:"y"
        `);

        // The reporter's symptom was an orphaned error + stuck focus. Prove the cell re-opens cleanly.
        await user.dblClick(cell(api, 0, 'phone'));
        const reopened = await waitForInput(getGridElement(api)! as HTMLElement, cell(api, 0, 'phone'));
        expect(reopened.disabled).toBe(false);
        expect(editorCount(api)).toBe(1);

        await new GridRows(api, 'custom: the cell re-opened cleanly').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF 🖍️ ❌ id:0 athlete:"Alice" age:23 hideable:"x"
            └── LEAF id:1 athlete:"Bob" age:40 hideable:"y"
        `);
    });

    test('custom: re-opening after a filter change still receives its params', async () => {
        const rowData = makeRowData();
        const api = await createPhoneGrid(rowData);
        const gridElement = getGridElement(api)! as HTMLElement;
        const user = userEvent.setup();

        const phoneCell = cell(api, 0, 'phone');
        await user.dblClick(phoneCell);
        let phoneInput = await waitForInput(gridElement, phoneCell);
        await user.clear(phoneInput);
        await user.type(phoneInput, 'ab');
        await asyncSetTimeout(0);

        await new GridRows(api, 'custom: invalid phone in flight before the filter change').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF 🖍️ ❌ id:0 athlete:"Alice" age:23 hideable:"x"
            └── LEAF id:1 athlete:"Bob" age:40 hideable:"y"
        `);

        api.setColumnsVisible(['hideable'], true);
        api.onFilterChanged();
        await asyncSetTimeout(0);

        await new GridRows(api, 'custom: editor closed by the filter change').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 athlete:"Alice" age:23 hideable:"x"
            └── LEAF id:1 athlete:"Bob" age:40 hideable:"y"
        `);

        lastPhoneParams = undefined;

        const phoneCellAgain = cell(api, 0, 'phone');
        await user.dblClick(phoneCellAgain);
        phoneInput = await waitForInput(gridElement, phoneCellAgain);

        await new GridRows(api, 'custom: re-opened editor on the source value').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF 🖍️ ❌ id:0 athlete:"Alice" age:23 hideable:"x"
            └── LEAF id:1 athlete:"Bob" age:40 hideable:"y"
        `);

        expect(lastPhoneParams).toBeDefined();
        expect(lastPhoneParams!.colDef?.field).toBe('phone');
        expect(lastPhoneParams!.column).toBeDefined();
        expect(lastPhoneParams!.node).toBeDefined();
    });

    // TC3: a popup custom editor blocked on an invalid value must still be editable after the grid
    // loses focus and the cell is re-opened — its inputs must not come back disabled.
    test('TC3 popup custom: invalid value + focus loss + re-open leaves the cell editable', async () => {
        const numericGrid = () =>
            gridsManager.createGridAndWait('numeric-popup-block', {
                columnDefs: [
                    {
                        headerName: 'Provided Text',
                        field: 'name',
                        cellEditorParams: {
                            getValidationErrors: ({ value }: { value: string }) =>
                                !value || value.length > 10 ? ['this is an error'] : null,
                        },
                    },
                    { headerName: 'Custom Numeric', field: 'number', cellEditor: NumericEditor, cellEditorPopup: true },
                ],
                rowData: [
                    { name: 'Bob', number: 10 },
                    { name: 'Harry', number: 3 },
                ] satisfies NumericRow[],
                defaultColDef: { editable: true, filter: true },
                editType: 'singleCell',
                invalidEditValueMode: 'block',
                stopEditingWhenCellsLoseFocus: true,
            } satisfies GridOptions<NumericRow>);

        const api = await numericGrid();
        const gridElement = getGridElement(api)! as HTMLElement;
        const user = userEvent.setup();

        const numberCell = cell(api, 0, 'number');
        await user.dblClick(numberCell);
        let popup = await waitForPopup(gridElement);
        let numberInput = popup.querySelector<HTMLInputElement>('.numeric-input')!;
        await user.clear(numberInput);
        await user.type(numberInput, '150'); // invalid: > 100

        // Click out of the grid — stopEditingWhenCellsLoseFocus stops editing and closes the popup.
        await user.click(document.body);
        await asyncSetTimeout(0);

        // Re-open the same cell — a fresh, usable popup editor must appear.
        await user.dblClick(cell(api, 0, 'number'));
        popup = await waitForPopup(gridElement);
        numberInput = popup.querySelector<HTMLInputElement>('.numeric-input')!;

        // The input must be usable: present, not disabled/readonly, and correctable.
        expect(numberInput).toBeTruthy();
        expect(numberInput.disabled).toBe(false);
        expect(numberInput.readOnly).toBe(false);

        await user.clear(numberInput);
        await user.type(numberInput, '50'); // valid correction
        await user.keyboard('{Enter}');

        expect(editorCount(api)).toBe(0);
        expect((api.getRenderedNodes()[0].data as NumericRow).number).toBe(50);

        await new GridRows(api, 'TC3: invalid value corrected after focus loss + re-open').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 name:"Bob" number:50
            └── LEAF id:1 name:"Harry" number:3
        `);
    });

    // TC3 variant: a pull-only popup editor (validity only via getValidationErrors) leaves the validation
    // model empty while typing, so onPopupEditorClosed must read fresh validation before deciding. The
    // popup DOM is already gone, so block mode reverts rather than holds — a hold leaves the cell dead.
    test('TC3 pull-only popup: invalid value + focus loss reverts and leaves the cell editable', async () => {
        const api = await gridsManager.createGridAndWait('numeric-popup-pull-only-block', {
            columnDefs: [
                { headerName: 'Provided Text', field: 'name' },
                {
                    headerName: 'Custom Numeric',
                    field: 'number',
                    cellEditor: PullOnlyNumericEditor,
                    cellEditorPopup: true,
                },
            ],
            rowData: [
                { name: 'Bob', number: 10 },
                { name: 'Harry', number: 3 },
            ] satisfies NumericRow[],
            defaultColDef: { editable: true, filter: true },
            editType: 'singleCell',
            invalidEditValueMode: 'block',
            stopEditingWhenCellsLoseFocus: true,
        } satisfies GridOptions<NumericRow>);
        const gridElement = getGridElement(api)! as HTMLElement;
        const user = userEvent.setup();

        const numberCell = cell(api, 0, 'number');
        await user.dblClick(numberCell);
        let popup = await waitForPopup(gridElement);
        let numberInput = popup.querySelector<HTMLInputElement>('.numeric-input')!;
        await user.clear(numberInput);
        await user.type(numberInput, '150'); // invalid: > 100, never pushed to the model

        // Click out of the grid — the popup closes; the invalid held value must revert, not orphan.
        await user.click(document.body);
        await asyncSetTimeout(0);

        expect(editorCount(api)).toBe(0);
        expect(api.getEditingCells()).toHaveLength(0);
        expect((api.getRenderedNodes()[0].data as NumericRow).number).toBe(10);

        await new GridRows(api, 'pull-only popup: invalid attempt reverted on focus loss').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 name:"Bob" number:10
            └── LEAF id:1 name:"Harry" number:3
        `);

        // Re-open the same cell — a fresh, usable popup editor must appear and commit a correction.
        await user.dblClick(cell(api, 0, 'number'));
        popup = await waitForPopup(gridElement);
        numberInput = popup.querySelector<HTMLInputElement>('.numeric-input')!;
        expect(numberInput.disabled).toBe(false);
        await user.clear(numberInput);
        await user.type(numberInput, '50');
        await user.keyboard('{Enter}');

        expect(editorCount(api)).toBe(0);
        expect((api.getRenderedNodes()[0].data as NumericRow).number).toBe(50);

        await new GridRows(api, 'pull-only popup: corrected 50 committed').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 name:"Bob" number:50
            └── LEAF id:1 name:"Harry" number:3
        `);
    });
});
