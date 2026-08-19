import { waitFor } from '@testing-library/dom';
import { act, cleanup, render } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { GridRows, asyncSetTimeout, waitForPopup } from 'ag-test-utils';
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { vi } from 'vitest';

import type { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import {
    CellApiModule,
    ClientSideRowModelModule,
    ColumnApiModule,
    CustomEditorModule,
    ModuleRegistry,
    NumberEditorModule,
    RowApiModule,
    TextEditorModule,
    TextFilterModule,
    ValidationModule,
    getGridElement,
    setupAgTestIds,
} from 'ag-grid-community';
import type { CustomCellEditorProps } from 'ag-grid-react';
import { AgGridReact, useGridCellEditor } from 'ag-grid-react';

interface PersonRow {
    athlete: string;
    age: number;
    phone?: string;
    hideable?: string;
}

const PHONE_REGEX = /^\(\d{3}\)\s\d{3}-\d{4}$/;

// Records the props last handed to the phone editor (TC2: verify cellEditorParams reach the component).
let lastPhoneProps: CustomCellEditorProps<PersonRow, string> | undefined;

// Faithful port of docs reactFunctionalTs/phoneEditor.tsx (the editor the ticket was reported against).
const PhoneEditor = memo((props: CustomCellEditorProps<PersonRow, string>) => {
    lastPhoneProps = props;
    const { value, onValueChange, validate, cellStartedEdit, eventKey } = props;
    const inputRef = useRef<HTMLInputElement>(null);
    const [internalValue, setInternalValue] = useState(value || '');

    const getValidationErrors = useCallback(
        () => (PHONE_REGEX.test(internalValue.trim()) ? null : ['Invalid phone format. Use (123) 456-7890']),
        [internalValue]
    );
    const getValidationElement = useCallback(() => inputRef.current!, []);

    useGridCellEditor({ getValidationErrors, getValidationElement });

    useEffect(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
        if (cellStartedEdit && eventKey?.length === 1) {
            setInternalValue(eventKey);
        }
    }, []);

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setInternalValue(val);
        onValueChange(val);
        setTimeout(() => validate?.());
    };

    return (
        <input
            ref={inputRef}
            type="text"
            className="phone-cell-editor"
            value={internalValue}
            onChange={onChange}
            onBlur={() => validate?.()}
        />
    );
});

interface NumericRow {
    name: string;
    number: number;
}

// Faithful port of the reported popup NumericEditor: value > 100 is invalid, validation element is the wrapper.
const NumericEditor = memo((props: CustomCellEditorProps<NumericRow, number>) => {
    const { value, onValueChange, validate } = props;
    const wrapperRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const [internalValue, setInternalValue] = useState<number | null>(value ?? null);

    const getValidationErrors = useCallback(
        () => (internalValue != null && internalValue > 100 ? ['Value over 100'] : null),
        [internalValue]
    );
    const getValidationElement = useCallback(() => wrapperRef.current!, []);

    useGridCellEditor({ getValidationErrors, getValidationElement });

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value;
        const parsed = raw === '' ? null : parseInt(raw, 10);
        setInternalValue(parsed);
        onValueChange(parsed);
        setTimeout(() => validate?.());
    };

    return (
        <div ref={wrapperRef} className="numeric-editor-wrapper">
            <input ref={inputRef} className="numeric-input" value={internalValue ?? ''} onChange={onChange} />
        </div>
    );
});

/**
 * Flushes a macrotask with React's updates inside `act`. The grid re-renders rows asynchronously, so an
 * update scheduled by an api call lands in the *next* tick - after a synchronous `act(...)` has closed - and
 * React reports it as unwrapped. `waitFor` is already act-aware; a bare sleep is not.
 */
const flush = async (): Promise<void> => {
    await act(async () => {
        await asyncSetTimeout(0);
    });
};

async function renderGrid<T>(options: {
    columnDefs: ColDef<T>[];
    rowData: T[];
    editType?: 'singleCell' | 'fullRow';
}): Promise<{ api: GridApi; gridDiv: HTMLElement; user: ReturnType<typeof userEvent.setup> }> {
    let readyResolve!: (api: GridApi) => void;
    const readyPromise = new Promise<GridApi>((resolve) => {
        readyResolve = resolve;
    });

    render(
        <div style={{ width: 800, height: 400 }}>
            <AgGridReact<T>
                columnDefs={options.columnDefs}
                rowData={options.rowData}
                defaultColDef={{ editable: true, filter: true }}
                editType={options.editType ?? 'singleCell'}
                invalidEditValueMode="block"
                stopEditingWhenCellsLoseFocus
                onGridReady={(params: GridReadyEvent) => readyResolve(params.api)}
            />
        </div>
    );

    const api = await readyPromise;
    const gridDiv = getGridElement(api)! as HTMLElement;
    const user = userEvent.setup({ skipHover: true });
    await flush();
    return { api, gridDiv, user };
}

describe('Cell editing validation — custom editor state after focus/filter/column changes (React)', () => {
    beforeAll(() => {
        ModuleRegistry.registerModules([
            ValidationModule,
            ClientSideRowModelModule,
            ColumnApiModule,
            NumberEditorModule,
            TextEditorModule,
            CustomEditorModule,
            TextFilterModule,
            // GridRows reads the grid through the API: the row model, and each cell's value.
            RowApiModule,
            CellApiModule,
        ]);
        setupAgTestIds();
    });

    afterEach(() => {
        cleanup();
        lastPhoneProps = undefined;
        vi.clearAllMocks();
    });

    const cellOf = (gridDiv: HTMLElement, rowIndex: number, colId: string): HTMLElement =>
        gridDiv.querySelector<HTMLElement>(`[row-index="${rowIndex}"] [col-id="${colId}"]`)!;

    const inputIn = (container: HTMLElement, selector = 'input'): Promise<HTMLInputElement> =>
        waitFor(() => {
            const input = container.querySelector<HTMLInputElement>(selector);
            if (!input) {
                throw new Error(`input not found for selector ${selector}`);
            }
            return input;
        });

    const phoneColumns: ColDef<PersonRow>[] = [
        {
            field: 'athlete',
            cellEditorParams: {
                getValidationErrors: ({ value }: { value: string }) =>
                    !value || value.length < 3 ? ['Name must be at least 3 characters long'] : null,
            },
        },
        { field: 'age', cellEditor: 'agNumberCellEditor', cellEditorParams: { min: 0, max: 100 } },
        // A marker param to assert it flows to the component on (re-)open (TC2).
        {
            field: 'phone',
            headerName: 'Custom Phone Editor',
            cellEditor: PhoneEditor,
            cellEditorParams: { marker: 42 },
        },
        { field: 'hideable', hide: true },
    ];

    const makeRowData = (): PersonRow[] => [
        { athlete: 'Alice', age: 23, hideable: 'x' },
        { athlete: 'Bob', age: 40, hideable: 'y' },
    ];

    // TC1 baseline: built-in editor over a populated value discards the in-flight edit on filter change.
    test('TC1 built-in: invalid in-flight age is discarded when the filter changes', async () => {
        const rowData = makeRowData();
        const { api, gridDiv, user } = await renderGrid<PersonRow>({ columnDefs: phoneColumns, rowData });

        await user.dblClick(cellOf(gridDiv, 0, 'age'));
        const ageInput = await inputIn(cellOf(gridDiv, 0, 'age'));
        await user.clear(ageInput);
        await user.type(ageInput, '999');

        await waitFor(() => expect(api.getEditingCells()).toHaveLength(1));

        await new GridRows(api, 'built-in: invalid age in flight').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF 🖍️ ❌ id:0 athlete:"Alice" age:23❌ hideable:"x"
            └── LEAF id:1 athlete:"Bob" age:40 hideable:"y"
        `);

        act(() => {
            api.setColumnsVisible(['hideable'], true);
            api.onFilterChanged();
        });
        await flush();

        await waitFor(() => expect(api.getCellEditorInstances()).toHaveLength(0));
        expect(api.getEditingCells()).toHaveLength(0);
        expect(rowData[0].age).toBe(23);

        await new GridRows(api, 'built-in: the filter change discarded the invalid age').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 athlete:"Alice" age:23 hideable:"x"
            └── LEAF id:1 athlete:"Bob" age:40 hideable:"y"
        `);
    });

    // TC1 bug: custom editor over an undefined value must behave like the built-in editor.
    test('TC1 custom (undefined source): invalid in-flight phone is discarded when the filter changes', async () => {
        const rowData = makeRowData();
        const { api, gridDiv, user } = await renderGrid<PersonRow>({ columnDefs: phoneColumns, rowData });

        await user.dblClick(cellOf(gridDiv, 0, 'phone'));
        const phoneInput = await inputIn(cellOf(gridDiv, 0, 'phone'), '.phone-cell-editor');
        await user.clear(phoneInput);
        await user.type(phoneInput, 'ab'); // invalid format
        await flush(); // flush editor's async validate()

        await waitFor(() => expect(api.getEditingCells()).toHaveLength(1));

        act(() => {
            api.setColumnsVisible(['hideable'], true);
            api.onFilterChanged();
        });
        await flush();

        await waitFor(() => expect(api.getCellEditorInstances()).toHaveLength(0));
        expect(api.getEditingCells()).toHaveLength(0);
        expect(rowData[0].phone).toBeUndefined();

        await new GridRows(api, 'custom: the filter change discarded the invalid phone').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 athlete:"Alice" age:23 hideable:"x"
            └── LEAF id:1 athlete:"Bob" age:40 hideable:"y"
        `);

        // The reporter's symptom was an orphaned error + stuck focus. Prove the cell re-opens cleanly.
        await user.dblClick(cellOf(gridDiv, 0, 'phone'));
        const reopened = await inputIn(cellOf(gridDiv, 0, 'phone'), '.phone-cell-editor');
        expect(reopened.disabled).toBe(false);
        await waitFor(() => expect(api.getCellEditorInstances()).toHaveLength(1));

        await new GridRows(api, 'custom: the cell re-opened cleanly').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF 🖍️ ❌ id:0 athlete:"Alice" age:23 hideable:"x"
            └── LEAF id:1 athlete:"Bob" age:40 hideable:"y"
        `);
    });

    // TC2: after the filter change closes the editor, re-opening must still pass cellEditorParams.
    test('TC2 custom: re-opening after a filter change still receives its cellEditorParams', async () => {
        const rowData = makeRowData();
        const { api, gridDiv, user } = await renderGrid<PersonRow>({ columnDefs: phoneColumns, rowData });

        await user.dblClick(cellOf(gridDiv, 0, 'phone'));
        let phoneInput = await inputIn(cellOf(gridDiv, 0, 'phone'), '.phone-cell-editor');
        await user.clear(phoneInput);
        await user.type(phoneInput, 'ab');
        await flush();

        await new GridRows(api, 'custom: invalid phone in flight before the filter change').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF 🖍️ ❌ id:0 athlete:"Alice" age:23 hideable:"x"
            └── LEAF id:1 athlete:"Bob" age:40 hideable:"y"
        `);

        act(() => {
            api.setColumnsVisible(['hideable'], true);
            api.onFilterChanged();
        });
        await flush();
        await waitFor(() => expect(api.getCellEditorInstances()).toHaveLength(0));

        await new GridRows(api, 'custom: editor closed by the filter change').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 athlete:"Alice" age:23 hideable:"x"
            └── LEAF id:1 athlete:"Bob" age:40 hideable:"y"
        `);

        lastPhoneProps = undefined;

        // Re-open the same cell.
        await user.dblClick(cellOf(gridDiv, 0, 'phone'));
        phoneInput = await inputIn(cellOf(gridDiv, 0, 'phone'), '.phone-cell-editor');

        await new GridRows(api, 'custom: re-opened editor on the source value').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF 🖍️ ❌ id:0 athlete:"Alice" age:23 hideable:"x"
            └── LEAF id:1 athlete:"Bob" age:40 hideable:"y"
        `);

        await waitFor(() => expect(lastPhoneProps).toBeDefined());
        expect(lastPhoneProps!.colDef?.field).toBe('phone');
        expect(lastPhoneProps!.column).toBeDefined();
        expect(lastPhoneProps!.node).toBeDefined();
        expect((lastPhoneProps!.colDef?.cellEditorParams as { marker: number })?.marker).toBe(42);
    });

    // TC3: a popup custom editor blocked on an invalid value stays editable after focus loss + re-open.
    test('TC3 popup custom: invalid value + focus loss + re-open leaves the cell editable', async () => {
        const rowData: NumericRow[] = [
            { name: 'Bob', number: 10 },
            { name: 'Harry', number: 3 },
        ];
        const { api, gridDiv, user } = await renderGrid<NumericRow>({
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
            rowData,
        });

        await user.dblClick(cellOf(gridDiv, 0, 'number'));
        let popup = await waitForPopup(gridDiv);
        let numberInput = await inputIn(popup, '.numeric-input');
        await user.clear(numberInput);
        await user.type(numberInput, '150'); // invalid: > 100
        await flush();

        await new GridRows(api, 'popup: invalid value typed in the popup').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF 🖍️ ❌ id:0 name:"Bob" number:10❌
            └── LEAF id:1 name:"Harry" number:3
        `);

        // Click out of the grid — stopEditingWhenCellsLoseFocus triggers a stop; block holds it open.
        await user.click(document.body);
        await flush();

        // Re-open the same cell — a fresh, usable popup editor must appear.
        await user.dblClick(cellOf(gridDiv, 0, 'number'));
        popup = await waitForPopup(gridDiv);
        numberInput = await inputIn(popup, '.numeric-input');

        expect(numberInput.disabled).toBe(false);
        expect(numberInput.readOnly).toBe(false);

        await user.clear(numberInput);
        await user.type(numberInput, '50'); // valid correction
        await user.keyboard('{Enter}');

        await waitFor(() => expect(api.getCellEditorInstances()).toHaveLength(0));
        expect(rowData[0].number).toBe(50);

        await new GridRows(api, 'popup: the corrected value committed').check(`
            ROOT id:ROOT_NODE_ID
            ├── LEAF id:0 name:"Bob" number:50
            └── LEAF id:1 name:"Harry" number:3
        `);
    });
});
