import { getByTestId, waitFor } from '@testing-library/dom';
import '@testing-library/jest-dom/vitest';
import { userEvent } from '@testing-library/user-event';
import {
    EditEventTracker,
    GridColumns,
    GridRows,
    TestGridsManager,
    asyncSetTimeout,
    waitForInput,
} from 'ag-test-utils';
import type { EditorFormControl } from 'ag-test-utils';

import type { CellValueChangedEvent, ColDef, GridApi, NewValueParams } from 'ag-grid-community';
import {
    CheckboxEditorModule,
    DateEditorModule,
    LargeTextEditorModule,
    NumberEditorModule,
    RenderApiModule,
    SelectEditorModule,
    TextEditorModule,
    ValueCacheModule,
    agTestIdFor,
    getGridElement,
    setupAgTestIds,
} from 'ag-grid-community';

/** Asserts the value of a form control, handling number/date/checkbox inputs correctly. */
function expectInputValue(input: EditorFormControl, expected: unknown): void {
    // `agLargeTextCellEditor` is a textarea, which has plain text and none of the typed value accessors.
    if (input instanceof HTMLTextAreaElement) {
        expect(input.value).toBe(expected == null ? '' : String(expected));
        return;
    }
    const type = input.type;
    if (type === 'number' || type === 'range') {
        if (expected == null || (typeof expected === 'number' && isNaN(expected))) {
            expect(input.valueAsNumber).toBeNaN();
        } else {
            expect(input.valueAsNumber).toBe(Number(expected));
        }
    } else if (type === 'checkbox' || type === 'radio') {
        expect(input.checked).toBe(Boolean(expected));
    } else if (type === 'date' || type === 'datetime-local' || type === 'time') {
        if (expected == null || expected === undefined) {
            expect(input.value).toBe('');
        } else if (expected instanceof Date) {
            expect(input.valueAsDate?.getTime()).toBe(expected.getTime());
        } else {
            expect(input.value).toBe(String(expected));
        }
    } else {
        expect(input.value).toBe(expected == null ? '' : String(expected));
    }
}

describe('Cell Editing Start', () => {
    const gridMgr = new TestGridsManager({
        includeDefaultModules: true,
        modules: [
            RenderApiModule,
            ValueCacheModule,
            TextEditorModule,
            NumberEditorModule,
            DateEditorModule,
            LargeTextEditorModule,
            CheckboxEditorModule,
            SelectEditorModule,
        ],
    });

    const rowDataFactory = () => [
        {
            number: 10,
            string1: 'test',
            string2: 'test',
            date: new Date('2025-01-01'),
            dateStr: '2025-01-01',
            boolean: true,
        },
        {
            number: undefined,
            string1: undefined,
            string2: undefined,
            date: undefined,
            dateStr: undefined,
            boolean: undefined,
        },
    ];

    const columnDefs: ColDef[] = [
        { field: 'number', cellEditor: 'agNumberCellEditor' },
        { field: 'string1', cellEditor: 'agTextCellEditor' },
        { field: 'string2', cellEditor: 'agLargeTextCellEditor' },
        { field: 'date', cellEditor: 'agDateCellEditor' },
        { field: 'dateStr', cellEditor: 'agDateStringCellEditor' },
        { field: 'boolean', cellEditor: 'agCheckboxCellEditor' },
    ];

    let rowData: any[];

    beforeAll(() => setupAgTestIds());

    beforeEach(() => {
        rowData = rowDataFactory();
    });

    afterEach(() => {
        gridMgr.reset();
        vi.resetAllMocks();
        vi.clearAllMocks();
    });

    describe('Keydown start', () => {
        test.each([
            { field: 'number', input: '1', expected: '1', popup: false },
            { field: 'string1', input: '1', expected: '1', popup: false },
            { field: 'string2', input: '1', expected: '1', popup: true },
            { field: 'date', input: '1', expected: null, popup: false },
            { field: 'dateStr', input: '1', expected: null, popup: false },
            { field: 'boolean', input: '1', expected: true, popup: false },
        ])('$field', async ({ field, input, expected, popup }) => {
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs,
                rowData,
                defaultColDef: {
                    editable: true,
                },
            });

            const gridDiv = getGridElement(api)! as HTMLElement;

            const cell = await waitFor(() => getByTestId(gridDiv, agTestIdFor.cell('0', field!)));
            await userEvent.click(cell);
            await userEvent.keyboard(input);

            // get input element inside the cell and check text contents, don't use agTestIdFor
            // as it might not be available for all cell editors, use testing-library
            const inputElement = await waitForInput(gridDiv, cell, { popup });
            expectInputValue(inputElement, expected);

            await new GridColumns(api, 'columns').checkColumns(`
                CENTER
                ├── number "Number" width:200 editable
                ├── string1 "String1" width:200 editable
                ├── string2 "String2" width:200 editable
                ├── date "Date" width:200 editable
                ├── dateStr "Date Str" width:200 editable
                └── boolean "Boolean" width:200 editable
            `);
        });
    });

    describe('Double-click', () => {
        test.each([
            { field: 'number', popup: false, selectionStart: null, selectionEnd: null },
            { field: 'string1', popup: false, selectionStart: 0, selectionEnd: 4 },
            { field: 'string2', popup: true, selectionStart: 0, selectionEnd: 4 },
            { field: 'date', popup: false, selectionStart: null, selectionEnd: null },
            { field: 'dateStr', popup: false, selectionStart: null, selectionEnd: null },
            { field: 'boolean', popup: false, selectionStart: null, selectionEnd: null },
        ])('$field (popup: $popup)', async ({ field, popup, selectionStart, selectionEnd }) => {
            const expected = rowData[0][field!];

            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs,
                rowData,
                defaultColDef: {
                    editable: true,
                },
            });

            const gridDiv = getGridElement(api)! as HTMLElement;

            const cell = await waitFor(() => getByTestId(gridDiv, agTestIdFor.cell('0', field!)));
            await userEvent.dblClick(cell);

            const inputElement = await waitForInput(gridDiv, cell, { popup });
            expectInputValue(inputElement, expected);

            expect(inputElement.selectionStart).toEqual(selectionStart);
            expect(inputElement.selectionEnd).toEqual(selectionEnd);

            await new GridColumns(api, 'columns').checkColumns(`
                CENTER
                ├── number "Number" width:200 editable
                ├── string1 "String1" width:200 editable
                ├── string2 "String2" width:200 editable
                ├── date "Date" width:200 editable
                ├── dateStr "Date Str" width:200 editable
                └── boolean "Boolean" width:200 editable
            `);
        });
    });

    describe('F2 key', () => {
        test.each([
            { field: 'number', popup: false, selectionStart: null, selectionEnd: null },
            { field: 'string1', popup: false, selectionStart: 4, selectionEnd: 4 },
            { field: 'string2', popup: true, selectionStart: 4, selectionEnd: 4 },
            { field: 'date', popup: false, selectionStart: null, selectionEnd: null },
            { field: 'dateStr', popup: false, selectionStart: null, selectionEnd: null },
            { field: 'boolean', popup: false, selectionStart: null, selectionEnd: null },
        ])('$field (popup: $popup)', async ({ field, popup, selectionStart, selectionEnd }) => {
            const expected = rowData[0][field!];

            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs,
                rowData,
                defaultColDef: {
                    editable: true,
                },
            });

            const gridDiv = getGridElement(api)! as HTMLElement;

            const cell = await waitFor(() => getByTestId(gridDiv, agTestIdFor.cell('0', field!)));
            await userEvent.click(cell);
            await userEvent.keyboard(`{F2}`);

            const inputElement = await waitForInput(gridDiv, cell, { popup });
            expectInputValue(inputElement, expected);

            expect(inputElement.selectionStart).toEqual(selectionStart);
            expect(inputElement.selectionEnd).toEqual(selectionEnd);
        });
    });

    describe('Escape key', () => {
        test('leaves the browser default intact when nothing is editing, prevents it while editing', async () => {
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs,
                rowData,
                defaultColDef: {
                    editable: true,
                },
            });

            const gridDiv = getGridElement(api)! as HTMLElement;
            const cell = await waitFor(() => getByTestId(gridDiv, agTestIdFor.cell('0', 'string1')));
            await userEvent.click(cell);

            // A host dialog wrapping the grid closes on Escape only if the grid leaves the key unhandled.
            const idleEscape = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
            cell.dispatchEvent(idleEscape);
            expect(idleEscape.defaultPrevented).toBe(false);
            expect(api.getCellEditorInstances()).toHaveLength(0);

            await userEvent.dblClick(cell);
            const input = await waitForInput(gridDiv, cell);

            const editingEscape = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
            input.dispatchEvent(editingEscape);
            expect(editingEscape.defaultPrevented).toBe(true);

            await waitFor(() => expect(api.getCellEditorInstances()).toHaveLength(0));
        });
    });

    describe('Backspace key', () => {
        // Backspace starts editing with an empty value
        // For non-popup editors, this also removes the renderer and hence clears the cell text.
        // For popup editors, the renderer remains so cell text remains unchanged
        test.each([
            { field: 'number', popup: false, expectedValue: NaN, expectedText: '' },
            { field: 'string1', popup: false, expectedValue: '', expectedText: '' },
            { field: 'string2', popup: true, expectedValue: '', expectedText: 'test' },
            { field: 'date', popup: false, expectedValue: undefined, expectedText: '' },
            { field: 'dateStr', popup: false, expectedValue: undefined, expectedText: '' },
            { field: 'boolean', popup: false, expectedValue: true, expectedText: '' },
        ])('$field (popup: $popup)', async ({ field, popup, expectedValue, expectedText }) => {
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs,
                rowData,
                defaultColDef: {
                    editable: true,
                },
            });

            const gridDiv = getGridElement(api)! as HTMLElement;

            const cell = await waitFor(() => getByTestId(gridDiv, agTestIdFor.cell('0', field!)));
            await userEvent.click(cell);
            await userEvent.keyboard(`{Backspace}`);

            await waitFor(() => expect(api.getCellEditorInstances()).toHaveLength(1));

            // Row 0 shows 🖍️ (row is editing) but column values still show committed data —
            // Backspace clears the editor input without changing the data model until editing stops.
            await new GridRows(api, `during Backspace edit of ${field}`).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF 🖍️ id:0 number:10 string1:"test" string2:"test" date:"2025-01-01" dateStr:"2025-01-01" boolean:true
                └── LEAF id:1
            `);

            const inputElement = await waitForInput(gridDiv, cell, { popup });
            expectInputValue(inputElement, expectedValue);

            expect(cell).toHaveTextContent(expectedText as any);
        });
    });

    describe('Delete key', () => {
        // Delete key bypasses editors and clears the value of the cell.
        test.each([
            { field: 'number', expectedText: '' },
            { field: 'string1', expectedText: '' },
            { field: 'string2', expectedText: '' },
            { field: 'date', expectedText: '' },
            { field: 'dateStr', expectedText: '' },
            { field: 'boolean', expectedText: '' },
        ])('$field', async ({ field, expectedText }) => {
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs,
                rowData,
                defaultColDef: {
                    editable: true,
                },
            });

            const gridDiv = getGridElement(api)! as HTMLElement;

            const cell = await waitFor(() => getByTestId(gridDiv, agTestIdFor.cell('0', field!)));
            await userEvent.click(cell);
            await userEvent.keyboard(`{Delete}`);

            // Delete clears the rendered cell text synchronously with the keypress; gate on that
            // change before asserting the editor never opened for this key.
            await waitFor(() => expect(cell).toHaveTextContent(expectedText as any));

            expect(api.getCellEditorInstances()).toHaveLength(0);
        });
    });

    describe('refData start value', () => {
        const refData = { cb: 'Cadet Blue', bw: 'Burlywood', fg: 'Forest Green' };

        const openEditor = async (api: GridApi, field: string, rowId: string) => {
            const gridDiv = getGridElement(api)! as HTMLElement;
            const cell = await waitFor(() => getByTestId(gridDiv, agTestIdFor.cell(rowId, field)));
            await userEvent.dblClick(cell);
            return waitForInput(gridDiv, cell);
        };

        test('the text editor opens on the stored code, not the mapped label', async () => {
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [{ field: 'colour', refData }],
                rowData: [{ colour: 'bw' }, { colour: 'cb' }],
                defaultColDef: { editable: true },
            });

            expectInputValue(await openEditor(api, 'colour', '0'), 'bw');
            await userEvent.keyboard('{Escape}');
            await waitFor(() => expect(api.getEditingCells()).toHaveLength(0));

            expectInputValue(await openEditor(api, 'colour', '1'), 'cb');
        });

        test('committing an untouched editor leaves the stored code alone', async () => {
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [{ field: 'colour', refData }],
                rowData: [{ colour: 'bw' }, { colour: 'cb' }],
                defaultColDef: { editable: true },
            });

            const eventTracker = new EditEventTracker(api);

            await openEditor(api, 'colour', '0');
            await userEvent.keyboard('{Enter}');
            await waitFor(() => expect(api.getEditingCells()).toHaveLength(0));

            await openEditor(api, 'colour', '1');
            await userEvent.keyboard('{Enter}');
            await waitFor(() => expect(api.getEditingCells()).toHaveLength(0));

            expect(eventTracker.counts.cellValueChanged).toBe(0);
            await new GridRows(api, 'codes survive an untouched edit', { useFormatter: false }).check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 colour:"bw"
                └── LEAF id:1 colour:"cb"
            `);
        });

        test('typing a code still commits it, and the cell renders the mapped label', async () => {
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [{ field: 'colour', refData }],
                rowData: [{ colour: 'bw' }],
                defaultColDef: { editable: true },
            });

            const input = await openEditor(api, 'colour', '0');
            await userEvent.clear(input);
            await userEvent.keyboard('fg');
            await userEvent.keyboard('{Enter}');
            await waitFor(() => expect(api.getEditingCells()).toHaveLength(0));

            await new GridRows(api, 'typed code committed', { useFormatter: false }).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 colour:"fg"
            `);
            const gridDiv = getGridElement(api)! as HTMLElement;
            await waitFor(() =>
                expect(getByTestId(gridDiv, agTestIdFor.cell('0', 'colour'))).toHaveTextContent('Forest Green')
            );
        });

        // The counterpart to the untouched case: an emptied input differs from the seed, so it
        // must still commit, or the guard would swallow a deliberate clear.
        test('clearing the input still writes a blank', async () => {
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [{ field: 'colour', refData }],
                rowData: [{ colour: 'bw' }],
                defaultColDef: { editable: true },
            });

            const input = await openEditor(api, 'colour', '0');
            await userEvent.clear(input);
            await userEvent.keyboard('{Enter}');
            await waitFor(() => expect(api.getEditingCells()).toHaveLength(0));

            await new GridRows(api, 'cleared refData cell', { useFormatter: false }).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 colour:""
            `);
        });

        test('useFormatter still opens on the mapped label', async () => {
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [
                    {
                        field: 'colour',
                        refData,
                        cellEditor: 'agTextCellEditor',
                        cellEditorParams: { useFormatter: true },
                    },
                ],
                rowData: [{ colour: 'bw' }],
                defaultColDef: { editable: true },
            });

            expectInputValue(await openEditor(api, 'colour', '0'), 'Burlywood');
        });
    });

    // Opening an editor and committing without touching it must never report a change.
    describe('untouched edit writes nothing', () => {
        test.each([
            { field: 'number', popup: false },
            { field: 'string1', popup: false },
            { field: 'string2', popup: true },
            { field: 'date', popup: false },
            { field: 'dateStr', popup: false },
            { field: 'boolean', popup: false },
        ])('$field', async ({ field, popup }) => {
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs,
                rowData,
                defaultColDef: { editable: true },
            });
            const eventTracker = new EditEventTracker(api);
            const gridDiv = getGridElement(api)! as HTMLElement;

            const cell = await waitFor(() => getByTestId(gridDiv, agTestIdFor.cell('0', field)));
            await userEvent.dblClick(cell);
            await waitForInput(gridDiv, cell, { popup });
            await userEvent.keyboard('{Enter}');
            await waitFor(() => expect(api.getEditingCells()).toHaveLength(0));

            expect(eventTracker.counts.cellValueChanged).toBe(0);
        });

        // Characterisation: the inferred number data type supplies the parser that restores the type,
        // so a text editor over a numeric column was never at risk here.
        test('text editor on a numeric column keeps the number', async () => {
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [{ field: 'n', cellEditor: 'agTextCellEditor' }],
                rowData: [{ n: 5 }],
                defaultColDef: { editable: true },
            });
            const eventTracker = new EditEventTracker(api);
            const gridDiv = getGridElement(api)! as HTMLElement;

            const cell = await waitFor(() => getByTestId(gridDiv, agTestIdFor.cell('0', 'n')));
            await userEvent.dblClick(cell);
            await waitForInput(gridDiv, cell);
            await userEvent.keyboard('{Enter}');
            await waitFor(() => expect(api.getEditingCells()).toHaveLength(0));

            expect(eventTracker.counts.cellValueChanged).toBe(0);
            expect(api.getDisplayedRowAtIndex(0)!.data.n).toBe(5);
        });

        // The widget normalises what it is given, so the seed has to be read back off it rather than
        // assumed: precision truncates 5.6789 to 5.67 and nothing would report the change.
        test('number editor with precision keeps the full stored value', async () => {
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [{ field: 'n', cellEditor: 'agNumberCellEditor', cellEditorParams: { precision: 2 } }],
                rowData: [{ n: 5.6789 }],
                defaultColDef: { editable: true },
            });
            const eventTracker = new EditEventTracker(api);
            const gridDiv = getGridElement(api)! as HTMLElement;

            const cell = await waitFor(() => getByTestId(gridDiv, agTestIdFor.cell('0', 'n')));
            await userEvent.dblClick(cell);
            await waitForInput(gridDiv, cell);
            api.stopEditing();
            await waitFor(() => expect(api.getEditingCells()).toHaveLength(0));

            expect(api.getDisplayedRowAtIndex(0)!.data.n).toBe(5.6789);
            expect(eventTracker.counts.cellValueChanged).toBe(0);
        });

        test('full row editing commits nothing for untouched cells', async () => {
            const api = await gridMgr.createGridAndWait('myGrid', {
                // No popup editor: warning #98 forbids agLargeTextCellEditor under fullRow.
                columnDefs: columnDefs.filter((c) => c.field !== 'string2'),
                rowData,
                defaultColDef: { editable: true },
                editType: 'fullRow',
            });
            const eventTracker = new EditEventTracker(api);
            const gridDiv = getGridElement(api)! as HTMLElement;

            const cell = await waitFor(() => getByTestId(gridDiv, agTestIdFor.cell('0', 'string1')));
            await userEvent.dblClick(cell);
            await waitForInput(gridDiv, cell);
            api.stopEditing();
            await waitFor(() => expect(api.getEditingCells()).toHaveLength(0));

            expect(eventTracker.counts.cellValueChanged).toBe(0);
        });

        // The parser is what makes this discriminating: `setDataValue(..., 'edit')` hands the editor a
        // model value, so committing it must not run the column parser over it a second time.
        test('re-seeding an open editor still commits nothing', async () => {
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [
                    {
                        field: 'a',
                        cellEditor: 'agTextCellEditor',
                        valueParser: (p) => String(p.newValue).toUpperCase(),
                    },
                ],
                rowData: [{ a: 'one' }],
                defaultColDef: { editable: true },
            });
            const gridDiv = getGridElement(api)! as HTMLElement;

            const cell = await waitFor(() => getByTestId(gridDiv, agTestIdFor.cell('0', 'a')));
            await userEvent.dblClick(cell);
            await waitForInput(gridDiv, cell);

            const node = api.getDisplayedRowAtIndex(0)!;
            node.setDataValue('a', 'two', 'edit');
            await waitFor(() => expect(api.getCellEditorInstances()[0]?.getValue()).toBe('two'));

            api.stopEditing();
            await waitFor(() => expect(api.getEditingCells()).toHaveLength(0));
            expect(node.data.a).toBe('two');
        });

        test('validation grades the value that will be committed', async () => {
            const seen: unknown[] = [];
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [
                    {
                        field: 'a',
                        cellEditor: 'agTextCellEditor',
                        valueParser: (p) => String(p.newValue).toUpperCase(),
                        cellEditorParams: {
                            getValidationErrors: ({ value }: { value: unknown }) => {
                                seen.push(value);
                                return null;
                            },
                        },
                    },
                ],
                rowData: [{ a: 'abc' }],
                defaultColDef: { editable: true },
            });
            const gridDiv = getGridElement(api)! as HTMLElement;

            const cell = await waitFor(() => getByTestId(gridDiv, agTestIdFor.cell('0', 'a')));
            await userEvent.dblClick(cell);
            await waitForInput(gridDiv, cell);
            api.stopEditing();
            await waitFor(() => expect(api.getEditingCells()).toHaveLength(0));

            expect(api.getDisplayedRowAtIndex(0)!.data.a).toBe('abc');
            expect(seen).not.toHaveLength(0);
            expect(seen.every((v) => v === 'abc')).toBe(true);
        });

        // The number widget withholds its value while the input breaks a native bound, so two
        // different out-of-range entries both read as empty and an edit between them looks untouched.
        // A custom callback may accept those values, which is what makes the state reachable.
        test('an edit between two values outside min is committed', async () => {
            const seen: unknown[] = [];
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [
                    {
                        field: 'n',
                        cellEditor: 'agNumberCellEditor',
                        cellEditorParams: {
                            min: 0,
                            getValidationErrors: ({ value }: { value: unknown }) => {
                                seen.push(value);
                                return null;
                            },
                        },
                    },
                ],
                rowData: [{ n: -1 }],
                defaultColDef: { editable: true },
            });
            const gridDiv = getGridElement(api)! as HTMLElement;

            const cell = await waitFor(() => getByTestId(gridDiv, agTestIdFor.cell('0', 'n')));
            await userEvent.dblClick(cell);
            const input = (await waitForInput(gridDiv, cell)) as HTMLInputElement;
            await userEvent.clear(input);
            await userEvent.type(input, '-2');
            api.stopEditing();
            await waitFor(() => expect(api.getEditingCells()).toHaveLength(0));

            expect(api.getDisplayedRowAtIndex(0)!.data.n).toBe(-2);
            expect(seen.at(-1)).toBe(-2);
        });

        test('number validation grades the preserved value, not the truncated one', async () => {
            const seen: unknown[] = [];
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [
                    {
                        field: 'n',
                        cellEditor: 'agNumberCellEditor',
                        cellEditorParams: {
                            precision: 2,
                            getValidationErrors: ({ value }: { value: unknown }) => {
                                seen.push(value);
                                return null;
                            },
                        },
                    },
                ],
                rowData: [{ n: 5.6789 }],
                defaultColDef: { editable: true },
            });
            const gridDiv = getGridElement(api)! as HTMLElement;

            const cell = await waitFor(() => getByTestId(gridDiv, agTestIdFor.cell('0', 'n')));
            await userEvent.dblClick(cell);
            await waitForInput(gridDiv, cell);
            api.stopEditing();
            await waitFor(() => expect(api.getEditingCells()).toHaveLength(0));

            expect(api.getDisplayedRowAtIndex(0)!.data.n).toBe(5.6789);
            expect(seen).not.toHaveLength(0);
            expect(seen.every((v) => v === 5.6789)).toBe(true);
        });

        test('date string validation grades the preserved value, not the reparsed one', async () => {
            const seen: unknown[] = [];
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [
                    {
                        field: 'd',
                        cellEditor: 'agDateStringCellEditor',
                        valueParser: (p) => `parsed:${p.newValue}`,
                        cellEditorParams: {
                            getValidationErrors: ({ value }: { value: unknown }) => {
                                seen.push(value);
                                return null;
                            },
                        },
                    },
                ],
                rowData: [{ d: '2025-01-01' }],
                defaultColDef: { editable: true },
            });
            const gridDiv = getGridElement(api)! as HTMLElement;

            const cell = await waitFor(() => getByTestId(gridDiv, agTestIdFor.cell('0', 'd')));
            await userEvent.dblClick(cell);
            await waitForInput(gridDiv, cell);
            api.stopEditing();
            await waitFor(() => expect(api.getEditingCells()).toHaveLength(0));

            expect(api.getDisplayedRowAtIndex(0)!.data.d).toBe('2025-01-01');
            expect(seen).not.toHaveLength(0);
            expect(seen.every((v) => v === '2025-01-01')).toBe(true);
        });

        // `valueAsDate` is null for the `datetime-local` input `includeTime` switches to, which left
        // both options unenforced and handed the callback null instead of the entered date.
        test('date min and max are enforced when includeTime is set', async () => {
            const seen: { value: unknown; internalErrors: string[] | null }[] = [];
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [
                    {
                        field: 'd',
                        cellEditor: 'agDateCellEditor',
                        cellEditorParams: {
                            includeTime: true,
                            min: new Date(2025, 1, 1),
                            getValidationErrors: (p: { value: unknown; internalErrors: string[] | null }) => {
                                seen.push({ value: p.value, internalErrors: p.internalErrors });
                                return null;
                            },
                        },
                    },
                ],
                rowData: [{ d: new Date(2025, 1, 10, 9, 0) }],
                defaultColDef: { editable: true },
            });
            const gridDiv = getGridElement(api)! as HTMLElement;

            const cell = await waitFor(() => getByTestId(gridDiv, agTestIdFor.cell('0', 'd')));
            await userEvent.dblClick(cell);
            const input = (await waitForInput(gridDiv, cell)) as HTMLInputElement;
            expect(input.type).toBe('datetime-local');
            input.value = '2025-01-15T08:15';
            input.dispatchEvent(new Event('input', { bubbles: true }));
            api.stopEditing();
            await waitFor(() => expect(api.getEditingCells()).toHaveLength(0));

            const last = seen.at(-1)!;
            expect(last.internalErrors).toEqual([expect.stringContaining('Date must be after')]);
            expect(last.value).toEqual(new Date(2025, 0, 15, 8, 15));
        });

        // The plain `date` control for the case above: it always worked, so it proves the
        // includeTime test is discriminating rather than asserting a shared no-op.
        test('date min and max are enforced without includeTime', async () => {
            const seen: (string[] | null)[] = [];
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [
                    {
                        field: 'd',
                        cellEditor: 'agDateCellEditor',
                        cellEditorParams: {
                            min: new Date(2025, 1, 1),
                            getValidationErrors: (p: { internalErrors: string[] | null }) => {
                                seen.push(p.internalErrors);
                                return null;
                            },
                        },
                    },
                ],
                rowData: [{ d: new Date(2025, 1, 10) }],
                defaultColDef: { editable: true },
            });
            const gridDiv = getGridElement(api)! as HTMLElement;

            const cell = await waitFor(() => getByTestId(gridDiv, agTestIdFor.cell('0', 'd')));
            await userEvent.dblClick(cell);
            const input = (await waitForInput(gridDiv, cell)) as HTMLInputElement;
            expect(input.type).toBe('date');
            input.value = '2025-01-15';
            input.dispatchEvent(new Event('input', { bubbles: true }));
            api.stopEditing();
            await waitFor(() => expect(api.getEditingCells()).toHaveLength(0));

            expect(seen.at(-1)).toEqual([expect.stringContaining('Date must be after')]);
        });

        // A normalising parser is the discriminating input: without one, every editor round-trips
        // the value unchanged and an untouched commit looks correct whether or not it is guarded.
        test.each([
            { name: 'text', cellEditor: 'agTextCellEditor', popup: false },
            { name: 'largeText', cellEditor: 'agLargeTextCellEditor', popup: true },
        ])('$name editor does not run a normalising parser on an untouched commit', async ({ cellEditor, popup }) => {
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [
                    {
                        field: 'a',
                        cellEditor,
                        cellEditorPopup: popup,
                        valueParser: (p) => String(p.newValue).toUpperCase(),
                    },
                ],
                rowData: [{ a: 'abc' }],
                defaultColDef: { editable: true },
            });
            const eventTracker = new EditEventTracker(api);
            const gridDiv = getGridElement(api)! as HTMLElement;

            const cell = await waitFor(() => getByTestId(gridDiv, agTestIdFor.cell('0', 'a')));
            await userEvent.dblClick(cell);
            await waitForInput(gridDiv, cell, { popup });
            api.stopEditing();
            await waitFor(() => expect(api.getEditingCells()).toHaveLength(0));

            expect(api.getDisplayedRowAtIndex(0)!.data.a).toBe('abc');
            expect(eventTracker.counts.cellValueChanged).toBe(0);
        });

        test('largeText editor still commits a typed value through the parser', async () => {
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [
                    {
                        field: 'a',
                        cellEditor: 'agLargeTextCellEditor',
                        cellEditorPopup: true,
                        valueParser: (p) => String(p.newValue).toUpperCase(),
                    },
                ],
                rowData: [{ a: 'abc' }],
                defaultColDef: { editable: true },
            });
            const gridDiv = getGridElement(api)! as HTMLElement;

            const cell = await waitFor(() => getByTestId(gridDiv, agTestIdFor.cell('0', 'a')));
            await userEvent.dblClick(cell);
            const input = await waitForInput(gridDiv, cell, { popup: true });
            await userEvent.clear(input as HTMLElement);
            await userEvent.type(input as HTMLElement, 'xyz');
            api.stopEditing();
            await waitFor(() => expect(api.getEditingCells()).toHaveLength(0));

            expect(api.getDisplayedRowAtIndex(0)!.data.a).toBe('XYZ');
        });

        // The widget cannot hold null, so reading the value back off it narrowed the stored null.
        test('checkbox editor keeps a null value on an untouched commit', async () => {
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [{ field: 'a', cellEditor: 'agCheckboxCellEditor' }],
                rowData: [{ a: null }],
                defaultColDef: { editable: true },
            });
            const eventTracker = new EditEventTracker(api);

            api.startEditingCell({ rowIndex: 0, colKey: 'a' });
            await waitFor(() => expect(api.getEditingCells()).toHaveLength(1));
            api.stopEditing();
            await waitFor(() => expect(api.getEditingCells()).toHaveLength(0));

            expect(api.getDisplayedRowAtIndex(0)!.data.a).toBeNull();
            expect(eventTracker.counts.cellValueChanged).toBe(0);
        });

        // The dropdown falls back to values[0] when the stored value is not an option, which is a
        // display concern; committing it without touching the picker wrote that option over the data.
        test('select editor keeps a value that is not in the list on an untouched commit', async () => {
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [
                    { field: 'a', cellEditor: 'agSelectCellEditor', cellEditorParams: { values: ['x', 'y'] } },
                ],
                rowData: [{ a: 'zzz' }],
                defaultColDef: { editable: true },
            });
            const eventTracker = new EditEventTracker(api);

            api.startEditingCell({ rowIndex: 0, colKey: 'a' });
            await waitFor(() => expect(api.getEditingCells()).toHaveLength(1));
            api.stopEditing();
            await waitFor(() => expect(api.getEditingCells()).toHaveLength(0));

            expect(api.getDisplayedRowAtIndex(0)!.data.a).toBe('zzz');
            expect(eventTracker.counts.cellValueChanged).toBe(0);
        });

        test('select editor still commits a value chosen from the list', async () => {
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [
                    { field: 'a', cellEditor: 'agSelectCellEditor', cellEditorParams: { values: ['x', 'y'] } },
                ],
                rowData: [{ a: 'zzz' }],
                defaultColDef: { editable: true },
            });

            api.startEditingCell({ rowIndex: 0, colKey: 'a' });
            await waitFor(() => expect(api.getEditingCells()).toHaveLength(1));
            const [editor] = api.getCellEditorInstances() as unknown as [{ agSetEditValue?: (v: unknown) => void }];
            editor?.agSetEditValue?.('y');
            api.stopEditing();
            await waitFor(() => expect(api.getEditingCells()).toHaveLength(0));

            expect(api.getDisplayedRowAtIndex(0)!.data.a).toBe('y');
        });

        test('useFormatter without a valueParser', async () => {
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [
                    {
                        field: 'colour',
                        valueFormatter: (p) => ({ bw: 'Burlywood' })[p.value as string] ?? '',
                        cellEditor: 'agTextCellEditor',
                        cellEditorParams: { useFormatter: true },
                    },
                ],
                rowData: [{ colour: 'bw' }],
                defaultColDef: { editable: true },
            });
            const eventTracker = new EditEventTracker(api);
            const gridDiv = getGridElement(api)! as HTMLElement;

            const cell = await waitFor(() => getByTestId(gridDiv, agTestIdFor.cell('0', 'colour')));
            await userEvent.dblClick(cell);
            await waitForInput(gridDiv, cell);
            await userEvent.keyboard('{Enter}');
            await waitFor(() => expect(api.getEditingCells()).toHaveLength(0));

            expect(eventTracker.counts.cellValueChanged).toBe(0);
            await new GridRows(api, 'useFormatter untouched edit', { useFormatter: false }).check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 colour:"bw"
            `);
        });
    });

    describe('Editing Events', () => {
        test('agLargeTextCellEditor popup editing state', async () => {
            // Tests that the 🖍️ editing indicator shows correctly for popup editors (agLargeTextCellEditor),
            // and that the DOM validator correctly handles cells with popup editors (input is outside the cell).
            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs,
                rowData,
                defaultColDef: {
                    editable: true,
                },
            });

            const gridDiv = getGridElement(api)! as HTMLElement;

            const cell = await waitFor(() => getByTestId(gridDiv, agTestIdFor.cell('0', 'string2')));
            await userEvent.dblClick(cell);
            await waitFor(() => expect(api.getCellEditorInstances()).toHaveLength(1));

            // Editor is open — the row has a 🖍️ editing indicator.
            // The cell value shows the committed value (popup editors render outside the cell,
            // so the cell DOM is not replaced with an editor and there's no 🖍️ on the cell value).
            await new GridRows(api, 'during large text popup edit').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF 🖍️ id:0 number:10 string1:"test" string2:"test" date:"2025-01-01" dateStr:"2025-01-01" boolean:true
                └── LEAF id:1
            `);

            // Find the popup textarea and update its value
            const textarea = await waitForInput(gridDiv, cell, { popup: true });
            await userEvent.clear(textarea);
            await userEvent.type(textarea, 'updated text');

            // Wait for the grid to sync the typed value into the edit model (GridRows reads the
            // live edit value via getCellValue(from: 'edit'), not the popup editor's DOM text).
            const rowNode = api.getDisplayedRowAtIndex(0)!;
            await waitFor(() =>
                expect(api.getCellValue({ rowNode, colKey: 'string2', useFormatter: false, from: 'edit' })).toBe(
                    'updated text'
                )
            );

            // Editor still open — row shows 🖍️, and the cell value shows 🖍️editValue dataValue
            // because the grid has synced the typed value with the edit model
            await new GridRows(api, 'during large text popup edit - after typing').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF 🖍️ id:0 number:10 string1:"test" string2:🖍️"updated text" "test" date:"2025-01-01" dateStr:"2025-01-01" boolean:true
                └── LEAF id:1
            `);

            // Commit by stopping editing programmatically (avoids starting a new edit on the next cell)
            api.stopEditing();
            await waitFor(() => expect(api.getCellEditorInstances()).toHaveLength(0));

            // After commit: string2 is updated, no more editing indicator
            await new GridRows(api, 'after large text popup edit committed').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 number:10 string1:"test" string2:"updated text" date:"2025-01-01" dateStr:"2025-01-01" boolean:true
                └── LEAF id:1
            `);
        });

        test('onValueChanged', async () => {
            const onCellValueChangedGrid = vi.fn();
            const onCellValueChangedColumn = vi.fn();

            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [
                    {
                        field: 'number',
                        cellEditor: 'agNumberCellEditor',
                        onCellValueChanged: () => onCellValueChangedColumn(),
                    },
                ],
                rowData,
                defaultColDef: {
                    editable: true,
                },
                onCellValueChanged: () => onCellValueChangedGrid(),
            });
            const eventTracker = new EditEventTracker(api);

            const gridDiv = getGridElement(api)! as HTMLElement;

            const cell = await waitFor(() => getByTestId(gridDiv, agTestIdFor.cell('0', 'number')));
            await userEvent.dblClick(cell);
            await waitFor(() => expect(api.getCellEditorInstances()).toHaveLength(1));

            await new GridRows(api, 'during edit, dblClick opened editor').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF 🖍️ id:0 number:10
                └── LEAF id:1
            `);

            await userEvent.keyboard('12{Enter}');

            await waitFor(() => expect(cell).toHaveTextContent('12'));

            await new GridRows(api, 'after edit committed').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 number:12
                └── LEAF id:1
            `);

            expect(cell).toHaveTextContent('12');
            expect(onCellValueChangedColumn).toHaveBeenCalledTimes(1);
            expect(onCellValueChangedGrid).toHaveBeenCalledTimes(1);

            // 1 editor started/stopped with 1 value change
            expect(eventTracker.counts).toEqual({
                cellEditingStarted: 1,
                cellEditingStopped: 1,
                cellValueChanged: 1,
                rowValueChanged: 0,
                cellEditRequest: 0,
                bulkEditingStarted: 0,
                bulkEditingStopped: 0,
                batchEditingStarted: 0,
                batchEditingStopped: 0,
            });
        });

        test('onValueChanged - valueSetter', async () => {
            const onCellValueChangedGrid = vi.fn();
            const onCellValueChangedColumn = vi.fn();
            const valueSetter = vi.fn();

            const api = await gridMgr.createGridAndWait('myGrid', {
                columnDefs: [
                    {
                        field: 'number',
                        cellEditor: 'agNumberCellEditor',
                        editable: true,
                        valueSetter: vi.fn((params) => {
                            valueSetter(params);
                            params.data.number = params.newValue;
                            return true;
                        }),
                        onCellValueChanged: () => onCellValueChangedColumn(),
                    },
                ],
                rowData,
                onCellValueChanged: () => onCellValueChangedGrid(),
            });
            const eventTracker = new EditEventTracker(api);

            const gridDiv = getGridElement(api)! as HTMLElement;

            const cell = await waitFor(() => getByTestId(gridDiv, agTestIdFor.cell('0', 'number')));
            await userEvent.dblClick(cell);

            await waitFor(() => expect(api.getCellEditorInstances()).toHaveLength(1));

            await new GridRows(api, 'during edit with valueSetter, dblClick opened editor').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF 🖍️ id:0 number:10
                └── LEAF id:1
            `);

            await userEvent.keyboard('12{Enter}');

            await waitFor(() => expect(cell).toHaveTextContent('12'));

            await new GridRows(api, 'after edit with valueSetter committed').check(`
                ROOT id:ROOT_NODE_ID
                ├── LEAF id:0 number:12
                └── LEAF id:1
            `);

            expect(cell).not.toHaveTextContent('10');
            expect(cell).toHaveTextContent('12');
            expect(valueSetter).toHaveBeenCalledTimes(1);
            expect(onCellValueChangedColumn).toHaveBeenCalledTimes(1);
            expect(onCellValueChangedGrid).toHaveBeenCalledTimes(1);

            // 1 editor started/stopped with 1 value change
            expect(eventTracker.counts).toEqual({
                cellEditingStarted: 1,
                cellEditingStopped: 1,
                cellValueChanged: 1,
                rowValueChanged: 0,
                cellEditRequest: 0,
                bulkEditingStarted: 0,
                bulkEditingStopped: 0,
                batchEditingStarted: 0,
                batchEditingStopped: 0,
            });
        });
    });

    test('valueGetter does not read live value from another cell editor (AG-16448)', async () => {
        const api = await gridMgr.createGridAndWait('myGrid', {
            columnDefs: [
                { field: 'a', editable: true },
                {
                    field: 'b',
                    valueGetter: (params) => params.getValue('a'),
                },
            ],
            rowData: [{ id: '0', a: 'initial' }],
            getRowId: (params) => params.data.id,
        });
        await new GridColumns(api, `valueGetter does not read live value from another cell editor (AG-16448) setup`)
            .checkColumns(`
                CENTER
                ├── a "A" width:200 editable
                └── b "B" width:200
            `);
        await new GridRows(api, `valueGetter does not read live value from another cell editor (AG-16448) setup`).check(
            `
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 a:"initial" b:"initial"
            `
        );
        const eventTracker = new EditEventTracker(api);

        const gridDiv = getGridElement(api)! as HTMLElement;

        const cellA = await waitFor(() => getByTestId(gridDiv, agTestIdFor.cell('0', 'a')));
        const cellB = getByTestId(gridDiv, agTestIdFor.cell('0', 'b'));
        expect(cellB).toHaveTextContent('initial');

        await userEvent.dblClick(cellA);

        const input = await waitForInput(gridDiv, cellA, { popup: false });
        await userEvent.clear(input);
        await userEvent.type(input, 'xx');

        api.refreshCells({ columns: ['b'], force: true });

        // AG-16448: valueGetter should NOT see live editing value - should still show original value
        // (refreshCells is synchronous, and this value never changes across the edit - nothing to poll)
        expect(cellB).toHaveTextContent('initial');

        // Commit first edit and start a new edit session to test cancel
        await userEvent.keyboard('{Enter}');

        // After commit, cellB should update to the committed value
        await waitFor(() => expect(cellB).toHaveTextContent('xx'));

        await userEvent.dblClick(cellA);
        const input2 = await waitForInput(gridDiv, cellA, { popup: false });
        await userEvent.clear(input2);
        await userEvent.type(input2, 'yy');

        api.refreshCells({ columns: ['b'], force: true });

        // AG-16448: valueGetter should NOT see live editing value - should show last committed value
        // (refreshCells is synchronous, and this value never changes across the edit - nothing to poll)
        expect(cellB).toHaveTextContent('xx');

        // Cancel edit by pressing ESC, should stay at last committed value
        await userEvent.keyboard('{Escape}');

        // Editor closing is the genuine signal that the cancel has taken effect; cellB's value is
        // unchanged either side of it, so gate on the editor count rather than the unchanging text.
        await waitFor(() => expect(api.getCellEditorInstances()).toHaveLength(0));

        expect(cellB).toHaveTextContent('xx');

        // 2 edit sessions: first committed with value change, second cancelled
        expect(eventTracker.counts).toEqual({
            cellEditingStarted: 2,
            cellEditingStopped: 2,
            cellValueChanged: 1,
            rowValueChanged: 0,
            cellEditRequest: 0,
            bulkEditingStarted: 0,
            bulkEditingStopped: 0,
            batchEditingStarted: 0,
            batchEditingStopped: 0,
        });
        await new GridRows(api, `valueGetter does not read live value from another cell editor (AG-16448) final state`)
            .check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 a:"xx" b:"xx"
            `);
    });

    test('valueCache does not store or cache editing values; cancel and commit both correct (AG-16448)', async () => {
        // This test verifies BOTH:
        // 1. The cell being edited shows its editing value (UI feedback via input.value)
        // 2. valueGetter using getValue() NEVER receives the editing value — verified by tracking the
        //    actual values passed to the callback, not just the cell display
        // 3. Cancel does not leak a cached editing value
        // 4. Commit correctly expires the cache and updates the dependent column
        let valueGetterValues: string[] = [];
        const api = await gridMgr.createGridAndWait('myGrid', {
            columnDefs: [
                { field: 'a', editable: true },
                {
                    colId: 'computed',
                    headerName: 'Computed',
                    valueGetter: (params) => {
                        const value = params.getValue('a');
                        valueGetterValues.push(value);
                        return `Echo: ${value}`;
                    },
                },
            ],
            rowData: [{ id: '0', a: 'initial' }],
            getRowId: (params) => params.data.id,
            valueCache: true,
        });
        await new GridColumns(
            api,
            `valueCache does not store or cache editing values; cancel and commit both correc setup`
        ).checkColumns(`
            CENTER
            ├── a "A" width:200 editable
            └── computed "Computed" width:200
        `);
        await new GridRows(
            api,
            `valueCache does not store or cache editing values; cancel and commit both correc setup`
        ).check(`
            ROOT id:ROOT_NODE_ID computed:"Echo: undefined"
            └── LEAF id:0 a:"initial" computed:"Echo: initial"
        `);
        const eventTracker = new EditEventTracker(api);

        const gridDiv = getGridElement(api)! as HTMLElement;

        const cellA = await waitFor(() => getByTestId(gridDiv, agTestIdFor.cell('0', 'a')));
        const cellComputed = getByTestId(gridDiv, agTestIdFor.cell('0', 'computed'));

        // Initial state
        expect(cellA).toHaveTextContent('initial');
        expect(cellComputed).toHaveTextContent('Echo: initial');

        // Reset tracking before the edit session
        valueGetterValues = [];

        // Phase A: during edit, valueGetter never receives the editing value
        await userEvent.dblClick(cellA);
        const input = await waitForInput(gridDiv, cellA, { popup: false });
        await userEvent.clear(input);
        await userEvent.type(input, 'typing');

        // Single-tick yield after setting the native input's value before reading it back.
        await asyncSetTimeout(0);

        // The editor input itself shows the live typing value
        expect(input.value).toBe('typing');

        // Multiple refreshes during edit — valueGetter should never see the typing value
        api.refreshCells({ columns: ['computed'], force: true });
        api.refreshCells({ columns: ['computed'], force: true });

        await waitFor(() => {
            expect(valueGetterValues.every((v) => v === 'initial')).toBe(true);
            expect(cellComputed).toHaveTextContent('Echo: initial');
        });

        // Phase B: cancel — should not leak a cached editing value
        await userEvent.keyboard('{Escape}');

        // Editor closing is the genuine signal that the cancel has landed.
        await waitFor(() => expect(api.getCellEditorInstances()).toHaveLength(0));

        api.refreshCells({ columns: ['computed'], force: true });

        // refreshCells is synchronous; this value is unchanged from before the cancel, so there is
        // nothing new to poll for here (the editor-close wait above is the real gate).
        expect(cellComputed).toHaveTextContent('Echo: initial');

        // Phase C: commit — cache expires on data change; dependent column updates
        await userEvent.dblClick(cellA);
        const input2 = await waitForInput(gridDiv, cellA, { popup: false });
        await userEvent.clear(input2);
        await userEvent.type(input2, 'committed');

        await userEvent.keyboard('{Enter}');

        await waitFor(() => {
            expect(cellA).toHaveTextContent('committed');
            expect(cellComputed).toHaveTextContent('Echo: committed');
        });

        // Refresh again — cached value should be correct post-commit
        api.refreshCells({ columns: ['computed'], force: true });

        // refreshCells is synchronous, and the value is unchanged from the commit above — nothing
        // new to poll for; this re-checks the cache stays consistent, not a new async transition.
        expect(cellComputed).toHaveTextContent('Echo: committed');

        // 2 sessions: first cancelled (no value change), second committed (1 value change)
        expect(eventTracker.counts).toEqual({
            cellEditingStarted: 2,
            cellEditingStopped: 2,
            cellValueChanged: 1,
            rowValueChanged: 0,
            cellEditRequest: 0,
            bulkEditingStarted: 0,
            bulkEditingStopped: 0,
            batchEditingStarted: 0,
            batchEditingStopped: 0,
        });
        await new GridRows(
            api,
            `valueCache does not store or cache editing values; cancel and commit both correc final state`
        ).check(`
            ROOT id:ROOT_NODE_ID computed:"Echo: undefined"
            └── LEAF id:0 a:"committed" computed:"Echo: committed"
        `);
    });

    test('valueCache is actually caching values', async () => {
        // This test verifies that the value cache is actually active and caching
        let valueGetterCallCount = 0;
        const api = await gridMgr.createGridAndWait('myGrid', {
            columnDefs: [
                { field: 'a', editable: true },
                {
                    colId: 'computed',
                    valueGetter: () => {
                        valueGetterCallCount++;
                        return `call-${valueGetterCallCount}`;
                    },
                },
            ],
            rowData: [{ id: '0', a: 'test' }],
            getRowId: (params) => params.data.id,
            valueCache: true,
        });
        await new GridColumns(api, `valueCache is actually caching values setup`).checkColumns(`
            CENTER
            ├── a "A" width:200 editable
            └── computed width:200
        `);
        await new GridRows(api, `valueCache is actually caching values setup`).check(`
            ROOT id:ROOT_NODE_ID computed:"call-2"
            └── LEAF id:0 a:"test" computed:"call-1"
        `);

        const gridDiv = getGridElement(api)! as HTMLElement;

        const cellComputed = await waitFor(() => getByTestId(gridDiv, agTestIdFor.cell('0', 'computed')));
        const initialCallCount = valueGetterCallCount;

        // Multiple refreshes should use cached value (no new calls). refreshCells is synchronous,
        // so there is nothing to poll between the two calls.
        api.refreshCells({ columns: ['computed'], force: true });
        api.refreshCells({ columns: ['computed'], force: true });

        // With valueCache enabled, the call count should NOT have increased
        // because the cached value is being reused
        expect(valueGetterCallCount).toBe(initialCallCount);

        // The cell should show the first computed value (cached)
        expect(cellComputed).toHaveTextContent('call-1');

        // Now expire the cache by making a data change
        const rowNode = api.getDisplayedRowAtIndex(0)!;
        rowNode.setDataValue('a', 'changed');

        // After data change, cache should expire and valueGetter should be called again
        api.refreshCells({ columns: ['computed'], force: true });

        await waitFor(() => expect(valueGetterCallCount).toBeGreaterThan(initialCallCount));
        await new GridRows(api, `valueCache is actually caching values final state`).check(`
            ROOT id:ROOT_NODE_ID computed:"call-4"
            └── LEAF id:0 a:"changed" computed:"call-3"
        `);
    });

    test('cellValueChanged newRawValue is the raw edit value, newValue is the resolved value via valueGetter', async () => {
        const cellValueChangedEvents: Pick<CellValueChangedEvent, 'oldValue' | 'newValue' | 'newRawValue'>[] = [];

        const api = await gridMgr.createGridAndWait('myGrid', {
            columnDefs: [
                {
                    field: 'a',
                    editable: true,
                    valueGetter: (params) => (params.data?.a != null ? `prefix_${params.data.a}` : null),
                    valueSetter: (params) => {
                        params.data.a = params.newValue;
                        return true;
                    },
                },
            ],
            rowData: [{ id: '0', a: 'initial' }],
            getRowId: (params) => params.data.id,
            onCellValueChanged: ({ oldValue, newValue, newRawValue }) => {
                cellValueChangedEvents.push({ oldValue, newValue, newRawValue });
            },
        });
        await new GridColumns(
            api,
            `cellValueChanged newRawValue is the raw edit value, newValue is the resolved val setup`
        ).checkColumns(`
            CENTER
            └── a "A" width:200 editable
        `);
        await new GridRows(
            api,
            `cellValueChanged newRawValue is the raw edit value, newValue is the resolved val setup`
        ).check(`
            ROOT id:ROOT_NODE_ID a:null
            └── LEAF id:0 a:"prefix_initial"
        `);

        const rowNode = api.getDisplayedRowAtIndex(0)!;
        rowNode.setDataValue('a', 'changed');
        await waitFor(() => expect(cellValueChangedEvents).toHaveLength(1));

        expect(cellValueChangedEvents[0]).toEqual({
            oldValue: 'prefix_initial',
            newValue: 'prefix_changed',
            newRawValue: 'changed',
        });
        await new GridRows(
            api,
            `cellValueChanged newRawValue is the raw edit value, newValue is the resolved val final state`
        ).check(`
            ROOT id:ROOT_NODE_ID a:null
            └── LEAF id:0 a:"prefix_changed"
        `);
    });

    test('cellValueChanged newRawValue equals newValue when no valueGetter is configured', async () => {
        const cellValueChangedEvents: Pick<CellValueChangedEvent, 'oldValue' | 'newValue' | 'newRawValue'>[] = [];

        const api = await gridMgr.createGridAndWait('myGrid', {
            columnDefs: [{ field: 'a', editable: true }],
            rowData: [{ id: '0', a: 'initial' }],
            getRowId: (params) => params.data.id,
            onCellValueChanged: ({ oldValue, newValue, newRawValue }) => {
                cellValueChangedEvents.push({ oldValue, newValue, newRawValue });
            },
        });
        await new GridColumns(
            api,
            `cellValueChanged newRawValue equals newValue when no valueGetter is configured setup`
        ).checkColumns(`
            CENTER
            └── a "A" width:200 editable
        `);
        await new GridRows(api, `cellValueChanged newRawValue equals newValue when no valueGetter is configured setup`)
            .check(`
                ROOT id:ROOT_NODE_ID
                └── LEAF id:0 a:"initial"
            `);

        const rowNode = api.getDisplayedRowAtIndex(0)!;
        rowNode.setDataValue('a', 'changed');
        await waitFor(() => expect(cellValueChangedEvents).toHaveLength(1));

        expect(cellValueChangedEvents[0]).toEqual({
            oldValue: 'initial',
            newValue: 'changed',
            newRawValue: 'changed',
        });
        await new GridRows(
            api,
            `cellValueChanged newRawValue equals newValue when no valueGetter is configured final state`
        ).check(`
            ROOT id:ROOT_NODE_ID
            └── LEAF id:0 a:"changed"
        `);
    });

    test('colDef onCellValueChanged receives newRawValue and source', async () => {
        const colDefEvents: Pick<NewValueParams, 'oldValue' | 'newValue' | 'newRawValue' | 'source'>[] = [];

        const api = await gridMgr.createGridAndWait('myGrid', {
            columnDefs: [
                {
                    field: 'a',
                    editable: true,
                    valueGetter: (params) => (params.data?.a != null ? `prefix_${params.data.a}` : null),
                    valueSetter: (params) => {
                        params.data.a = params.newValue;
                        return true;
                    },
                    onCellValueChanged: ({ oldValue, newValue, newRawValue, source }) => {
                        colDefEvents.push({ oldValue, newValue, newRawValue, source });
                    },
                },
            ],
            rowData: [{ id: '0', a: 'initial' }],
            getRowId: (params) => params.data.id,
        });
        await new GridColumns(api, `colDef onCellValueChanged receives newRawValue and source setup`).checkColumns(`
            CENTER
            └── a "A" width:200 editable
        `);
        await new GridRows(api, `colDef onCellValueChanged receives newRawValue and source setup`).check(`
            ROOT id:ROOT_NODE_ID a:null
            └── LEAF id:0 a:"prefix_initial"
        `);

        const rowNode = api.getDisplayedRowAtIndex(0)!;
        rowNode.setDataValue('a', 'changed');
        await waitFor(() => expect(colDefEvents).toHaveLength(1));

        expect(colDefEvents[0]).toEqual({
            oldValue: 'prefix_initial',
            newValue: 'prefix_changed',
            newRawValue: 'changed',
            source: undefined,
        });
        await new GridRows(api, `colDef onCellValueChanged receives newRawValue and source final state`).check(`
            ROOT id:ROOT_NODE_ID a:null
            └── LEAF id:0 a:"prefix_changed"
        `);
    });
});
