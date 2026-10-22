import { waitFor } from '@testing-library/dom';
import { TestGridsManager } from 'ag-test-utils';

import type { ColDef, GridApi, GridOptions, NotesDataSource } from 'ag-grid-community';
import {
    CellStyleModule,
    CheckboxEditorModule,
    ClientSideRowModelApiModule,
    ClientSideRowModelModule,
    ColumnApiModule,
    NumberEditorModule,
    RowApiModule,
    RowSelectionModule,
    TextEditorModule,
} from 'ag-grid-community';
import {
    CellSelectionModule,
    FormulaModule,
    NotesModule,
    RowGroupingModule,
    ShowValuesAsModule,
    StatusBarModule,
    TransposeModule,
} from 'ag-grid-enterprise';

interface Company {
    id: string;
    name: string;
    revenue: number;
    share: number;
    active: boolean;
    calc: string | number;
}

const makeRowData = (): Company[] => [
    { id: 'a', name: 'Northwind', revenue: 400, share: 1, active: false, calc: '=1+2' },
    { id: 'b', name: 'Contoso', revenue: 250, share: 1, active: false, calc: 5 },
    { id: 'c', name: 'Fabrikam', revenue: 900, share: 2, active: true, calc: 6 },
];

type Mode = 'untransposed' | 'transposed';
const MODES: Mode[] = ['untransposed', 'transposed'];

const fieldRow = (colId: string) => `ag-Grid-TransposeField-${colId}`;
const recordCol = (id: string) => `ag-Grid-TransposeRecord-${id}`;

describe('transposed cells read their original record and field', () => {
    const gridsManager = new TestGridsManager({
        modules: [
            CellSelectionModule,
            CellStyleModule,
            CheckboxEditorModule,
            ClientSideRowModelApiModule,
            ClientSideRowModelModule,
            ColumnApiModule,
            NumberEditorModule,
            FormulaModule,
            NotesModule,
            RowApiModule,
            RowGroupingModule,
            RowSelectionModule,
            TextEditorModule,
            ShowValuesAsModule,
            StatusBarModule,
            TransposeModule,
        ],
    });

    afterEach(() => gridsManager.reset());

    const create = async (mode: Mode, columnDefs: ColDef<Company>[], extra: GridOptions<Company> = {}) => {
        const api: GridApi<Company> = await gridsManager.createGridAndWait(`grid-${mode}`, {
            columnDefs: [{ field: 'name' }, ...columnDefs],
            rowData: makeRowData(),
            getRowId: (params) => params.data.id,
            transpose: mode === 'transposed',
            transposeHeaderColId: 'name',
            suppressColumnVirtualisation: true,
            ...extra,
        });
        const gridDiv = TestGridsManager.getHTMLElement(api)!;
        /** The displayed cell showing record `id`'s `colId`, in either view. */
        const cell = (id: string, colId: string) =>
            gridDiv.querySelector<HTMLElement>(
                mode === 'transposed'
                    ? `[row-id="${fieldRow(colId)}"] [col-id="${recordCol(id)}"]`
                    : `[row-id="${id}"] [col-id="${colId}"]`
            );
        /** The grid position of record `id`'s `colId`, in either view. */
        const position = (id: string, colId: string) => {
            const rowId = mode === 'transposed' ? fieldRow(colId) : id;
            return {
                rowIndex: api.getRowNode(rowId)?.rowIndex ?? findDisplayedIndex(api, rowId),
                colKey: mode === 'transposed' ? recordCol(id) : colId,
            };
        };
        return { api, gridDiv, cell, position };
    };

    const findDisplayedIndex = (api: GridApi, rowId: string) => {
        for (let i = 0, len = api.getDisplayedRowCount(); i < len; ++i) {
            if (api.getDisplayedRowAtIndex(i)?.id === rowId) {
                return i;
            }
        }
        return -1;
    };

    /** Notes stored by record id and field, as an app would store them. */
    const createNotes = (initial: Record<string, string> = {}) => {
        const notes = new Map(Object.entries(initial));
        const key = (params: Parameters<NotesDataSource['getNote']>[0]) =>
            `${params.rowNode.id}:${params.column.getColId()}`;
        const notesDataSource: NotesDataSource = {
            getNote: (params) => {
                const text = notes.get(key(params));
                return text == null ? undefined : { text };
            },
            setNote: (params) => {
                if (params.note) {
                    notes.set(key(params), params.note.text);
                } else {
                    notes.delete(key(params));
                }
            },
        };
        return { notes, notesDataSource };
    };
    const hasNote = (el: HTMLElement | null) => !!el?.classList.contains('ag-has-cell-notes');

    const pressSpace = (el: HTMLElement) =>
        el.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', code: 'Space', bubbles: true, cancelable: true }));

    test.each(MODES)('%s: the field colDef equals decides whether a refreshed value changed', async (mode) => {
        const equals = vi.fn((a: number, b: number) => a === b);
        const { api } = await create(mode, [{ field: 'revenue', equals }]);
        equals.mockClear();
        api.applyTransaction({ update: [{ ...makeRowData()[1], revenue: 260 }] });
        await waitFor(() => expect(equals).toHaveBeenCalledWith(250, 260));
    });

    test.each(MODES)('%s: Space on a cell selects the record', async (mode) => {
        const { api, cell, position } = await create(mode, [{ field: 'revenue' }], {
            rowSelection: { mode: 'multiRow', checkboxes: false },
        });
        const { rowIndex, colKey } = position('b', 'revenue');
        api.setFocusedCell(rowIndex, colKey);
        pressSpace(cell('b', 'revenue')!);
        await waitFor(() => expect(api.getSelectedNodes().map((node) => node.id)).toEqual(['b']));
    });

    test.each(MODES)('%s: Space on a boolean checkbox toggles the record value', async (mode) => {
        const { api, cell, position } = await create(mode, [
            { field: 'active', editable: true, cellDataType: 'boolean' },
        ]);
        await waitFor(() => expect(cell('b', 'active')?.querySelector('input')).toBeTruthy());
        const { rowIndex, colKey } = position('b', 'active');
        api.setFocusedCell(rowIndex, colKey);
        await waitFor(() => expect(document.activeElement).toBe(cell('b', 'active')));
        pressSpace(cell('b', 'active')!);
        await waitFor(() => expect(api.getRowNode('b')!.data!.active).toBe(true));
    });

    test.each(MODES)('%s: a formula field shows its result', async (mode) => {
        const { cell } = await create(mode, [{ field: 'calc', allowFormula: true }]);
        await waitFor(() => expect(cell('a', 'calc')?.textContent).toBe('3'));
    });

    test.each(MODES)('%s: Show Values As applies to the field', async (mode) => {
        const { cell } = await create(mode, [{ field: 'share', showValuesAs: 'percentOfColumnTotal' }]);
        await waitFor(() => expect(cell('c', 'share')?.textContent).toMatch(/^50(\.0+)?%$/));
    });

    test.each(MODES)('%s: the status bar sums the selected cells', async (mode) => {
        const { api, gridDiv, position } = await create(mode, [{ field: 'revenue' }], {
            cellSelection: true,
            statusBar: { statusPanels: [{ statusPanel: 'agAggregationComponent' }] },
        });
        const a = position('a', 'revenue');
        const b = position('b', 'revenue');
        api.addCellRange(
            mode === 'transposed'
                ? { rowStartIndex: a.rowIndex, rowEndIndex: a.rowIndex, columns: [a.colKey, b.colKey] }
                : { rowStartIndex: a.rowIndex, rowEndIndex: b.rowIndex, columns: ['revenue'] }
        );
        const statusValue = (label: string) => {
            for (const item of Array.from(gridDiv.querySelectorAll<HTMLElement>('.ag-status-name-value'))) {
                if (item.querySelector('span')?.textContent === label && !item.classList.contains('ag-hidden')) {
                    return item.querySelector('.ag-status-name-value-value')?.textContent ?? null;
                }
            }
            return null;
        };
        await waitFor(() => expect(statusValue('Sum')).toBe('650'));
        expect(statusValue('Count')).toBe('2');
    });

    test.each(MODES)('%s: Delete clears the cell through the field valueParser', async (mode) => {
        const { api, cell, position } = await create(mode, [
            {
                field: 'revenue',
                editable: true,
                valueParser: (params) => (params.newValue === '' ? 0 : Number(params.newValue)),
            },
        ]);
        const { rowIndex, colKey } = position('b', 'revenue');
        api.setFocusedCell(rowIndex, colKey);
        await waitFor(() => expect(document.activeElement).toBe(cell('b', 'revenue')));
        cell('b', 'revenue')!.dispatchEvent(
            new KeyboardEvent('keydown', { key: 'Delete', bubbles: true, cancelable: true })
        );
        await waitFor(() => expect(api.getRowNode('b')!.data!.revenue).toBe(0));
    });

    test.each(MODES)('%s: Delete clears a cell range through the field valueParser', async (mode) => {
        const { api, cell, position } = await create(
            mode,
            [
                {
                    field: 'revenue',
                    editable: true,
                    valueParser: (params) => (params.newValue === '' ? 0 : Number(params.newValue)),
                },
            ],
            { cellSelection: true }
        );
        const { rowIndex, colKey } = position('b', 'revenue');
        api.setFocusedCell(rowIndex, colKey);
        api.addCellRange({ rowStartIndex: rowIndex, rowEndIndex: rowIndex, columns: [colKey] });
        await waitFor(() => expect(document.activeElement).toBe(cell('b', 'revenue')));
        cell('b', 'revenue')!.dispatchEvent(
            new KeyboardEvent('keydown', { key: 'Delete', bubbles: true, cancelable: true })
        );
        await waitFor(() => expect(api.getRowNode('b')!.data!.revenue).toBe(0));
    });

    test.each(MODES)('%s: the field suppressKeyboardEvent blocks Delete', async (mode) => {
        const { api, cell, position } = await create(mode, [
            {
                field: 'revenue',
                editable: true,
                suppressKeyboardEvent: (params) => params.event.key === 'Delete' && params.data?.id === 'b',
            },
        ]);
        const { rowIndex, colKey } = position('b', 'revenue');
        api.setFocusedCell(rowIndex, colKey);
        await waitFor(() => expect(document.activeElement).toBe(cell('b', 'revenue')));
        const event = new KeyboardEvent('keydown', { key: 'Delete', bubbles: true, cancelable: true });
        cell('b', 'revenue')!.dispatchEvent(event);
        await new Promise((resolve) => setTimeout(resolve, 50));
        expect(api.getRowNode('b')!.data!.revenue).toBe(250);
    });

    test.each(MODES)('%s: Show Values As follows an edit to another record', async (mode) => {
        const { api, cell } = await create(mode, [
            { field: 'share', aggFunc: 'sum', showValuesAs: 'percentOfColumnTotal' },
        ]);
        await waitFor(() => expect(cell('c', 'share')?.textContent).toMatch(/^50(\.0+)?%$/));
        api.getRowNode('a')!.setDataValue('share', 2);
        await waitFor(() => expect(cell('c', 'share')?.textContent).toMatch(/^40(\.0+)?%$/));
    });

    test.each(MODES)('%s: a note on a record and field shows on the cell displaying them', async (mode) => {
        const { notesDataSource } = createNotes({ 'b:revenue': 'Check' });
        const { cell } = await create(mode, [{ field: 'revenue' }], { notesDataSource });
        await waitFor(() => expect(hasNote(cell('b', 'revenue'))).toBe(true));
        expect(hasNote(cell('a', 'revenue'))).toBe(false);
    });

    test.each(MODES)('%s: a note set on a displayed cell is stored on its record and field', async (mode) => {
        const { notes, notesDataSource } = createNotes();
        const { api, cell, position } = await create(mode, [{ field: 'revenue' }], { notesDataSource });
        const { rowIndex, colKey } = position('a', 'revenue');
        api.setNote({ rowNode: api.getDisplayedRowAtIndex(rowIndex)!, column: colKey, note: { text: 'Hi' } });
        expect([...notes.keys()]).toEqual(['a:revenue']);
        await waitFor(() => expect(hasNote(cell('a', 'revenue'))).toBe(true));
    });

    test.each(MODES)('%s: a note set by record and field shows on the cell displaying them', async (mode) => {
        const { notes, notesDataSource } = createNotes();
        const { api, cell } = await create(mode, [{ field: 'revenue' }], { notesDataSource });
        api.setNote({ rowNode: api.getRowNode('a')!, column: 'revenue', note: { text: 'Hi' } });
        expect([...notes.keys()]).toEqual(['a:revenue']);
        await waitFor(() => expect(hasNote(cell('a', 'revenue'))).toBe(true));
        expect(api.getNote({ rowNode: api.getRowNode('a')!, column: 'revenue' })?.text).toBe('Hi');
    });
});
