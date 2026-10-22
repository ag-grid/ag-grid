import { waitFor } from '@testing-library/dom';
import { userEvent } from '@testing-library/user-event';
import { DragEventDispatcher, TestGridsManager, clipboardUtils, waitForEvent } from 'ag-test-utils';

import type { CellEditRequestEvent, GridApi, GridOptions, IRowNode } from 'ag-grid-community';
import {
    ClientSideRowModelApiModule,
    ClientSideRowModelModule,
    ColumnApiModule,
    NumberEditorModule,
    RowApiModule,
    RowSelectionModule,
    RowStyleModule,
    TextEditorModule,
    UndoRedoEditModule,
} from 'ag-grid-community';
import { CellSelectionModule, ClipboardModule, TransposeModule } from 'ag-grid-enterprise';

interface Company {
    id: string;
    name: string;
    region: string;
    revenue: number;
}

const makeRowData = (): Company[] => [
    { id: 'a', name: 'Northwind', region: 'EMEA', revenue: 400 },
    { id: 'b', name: 'Contoso', region: 'APAC', revenue: 250 },
];

const FIELD_NAME_COL = 'ag-Grid-TransposeField';
const fieldRow = (colId: string) => `ag-Grid-TransposeField-${colId}`;
const recordCol = (id: string) => `ag-Grid-TransposeRecord-${id}`;

/** The parts of a cell event that say which record and field it is about. */
const target = (event: { node?: IRowNode | null; data?: any; column?: any; colDef?: any }) => ({
    node: event.node?.id,
    data: event.data?.id,
    column: event.column?.getColId(),
    field: event.colDef?.field,
});

describe('transposed view: what callbacks and events receive', () => {
    const gridsManager = new TestGridsManager({
        modules: [
            ClientSideRowModelApiModule,
            ClientSideRowModelModule,
            ColumnApiModule,
            NumberEditorModule,
            RowApiModule,
            RowSelectionModule,
            RowStyleModule,
            TextEditorModule,
            TransposeModule,
            UndoRedoEditModule,
        ],
    });

    afterEach(() => gridsManager.reset());

    const create = async (extra: GridOptions<Company> = {}, revenueColDef = {}) => {
        const api: GridApi<Company> = await gridsManager.createGridAndWait('contracts', {
            columnDefs: [
                { field: 'name' },
                { headerName: 'Details', groupId: 'details', children: [{ field: 'region' }] },
                { field: 'revenue', editable: true, cellEditor: 'agNumberCellEditor', ...revenueColDef },
            ],
            rowData: makeRowData(),
            getRowId: (params) => params.data.id,
            transpose: true,
            transposeHeaderColId: 'name',
            suppressColumnVirtualisation: true,
            ...extra,
        });
        const gridDiv = TestGridsManager.getHTMLElement(api)!;
        const cell = (rowId: string, colId: string) =>
            gridDiv.querySelector<HTMLElement>(`[row-id="${rowId}"] [col-id="${colId}"]`)!;
        await waitFor(() => expect(cell(fieldRow('revenue'), recordCol('b'))).toBeTruthy());
        return { api, cell, revenueB: () => cell(fieldRow('revenue'), recordCol('b')) };
    };

    const editTo = async (el: HTMLElement, value: string) => {
        const user = userEvent.setup();
        await user.dblClick(el);
        const input = await waitFor(() => {
            const found = el.querySelector('input');
            if (!found) {
                throw new Error('editor not open');
            }
            return found;
        });
        await user.clear(input);
        await user.type(input, `${value}{Enter}`);
    };

    /** The field a row names: a column id, `group:<id>` for a field group row, or `none` for a record. */
    const fieldOf = (node: IRowNode) => {
        const field = node.transposeField;
        if (field == null) {
            return 'none';
        }
        return 'getColId' in field ? field.getColId() : `group:${field.getGroupId()}`;
    };

    const REVENUE_OF_B = { node: 'b', data: 'b', column: 'revenue', field: 'revenue' };

    test('cell events report the real record and field', async () => {
        const seen: Record<string, unknown> = {};
        const record = (type: string) => (event: any) => (seen[type] = target(event));
        const { revenueB } = await create({
            onCellClicked: record('cellClicked'),
            onCellDoubleClicked: record('cellDoubleClicked'),
            onCellContextMenu: record('cellContextMenu'),
            onCellEditingStarted: record('cellEditingStarted'),
            onCellEditingStopped: record('cellEditingStopped'),
        });
        revenueB().dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true }));
        await editTo(revenueB(), '260');
        await waitFor(() => expect(seen.cellEditingStopped).toBeDefined());
        for (const type of ['cellClicked', 'cellDoubleClicked', 'cellContextMenu', 'cellEditingStarted']) {
            expect([type, seen[type]]).toEqual([type, REVENUE_OF_B]);
        }
        expect(seen.cellEditingStopped).toEqual(REVENUE_OF_B);
    });

    test("the field's and the record column's onCellClicked both run, with the real record", async () => {
        const fieldClicks: unknown[] = [];
        const recordClicks: unknown[] = [];
        const { revenueB } = await create(
            { transposeRecordColumnDef: { onCellClicked: (event) => recordClicks.push(target(event)) } },
            { onCellClicked: (event: any) => fieldClicks.push(target(event)) }
        );
        await userEvent.setup().click(revenueB());
        await waitFor(() => expect(fieldClicks).toEqual([REVENUE_OF_B]));
        await waitFor(() => expect(recordClicks).toEqual([REVENUE_OF_B]));
    });

    test('readOnlyEdit: cellEditRequest names the real record and field, so the app can apply it', async () => {
        const requests: unknown[] = [];
        const { api, revenueB } = await create({
            readOnlyEdit: true,
            onCellEditRequest: (event: CellEditRequestEvent<Company>) => {
                requests.push({ ...target(event), newValue: event.newValue });
                // The documented pattern: the app writes the change to its own copy of the data.
                const field = event.colDef.field as keyof Company;
                event.api.applyTransaction({ update: [{ ...event.data, [field]: event.newValue }] });
            },
        });
        await editTo(revenueB(), '270');
        await waitFor(() => expect(requests).toEqual([{ ...REVENUE_OF_B, newValue: 270 }]));
        await waitFor(() => expect(api.getRowNode('b')!.data!.revenue).toBe(270));
    });

    test('row callbacks receive field rows, which name their field and have no data', async () => {
        const seen: Record<string, Set<string>> = {};
        const record = (hook: string) => (params: { node: IRowNode; data?: unknown }) => {
            const data = params.data === undefined ? 'no data' : 'data';
            (seen[hook] ??= new Set()).add(`${fieldOf(params.node)}, ${data}`);
            return undefined;
        };
        await create({
            getRowStyle: record('getRowStyle'),
            getRowClass: record('getRowClass'),
            getRowHeight: record('getRowHeight'),
            rowClassRules: { 'never-applied': (params) => record('rowClassRules')(params) ?? false },
        });
        const fieldRows = ['group:details, no data', 'region, no data', 'revenue, no data'];
        for (const hook of ['getRowStyle', 'getRowClass', 'getRowHeight', 'rowClassRules']) {
            expect([hook, Array.from(seen[hook] ?? []).sort()]).toEqual([hook, fieldRows]);
        }
    });

    test('a getRowClass rule styles a whole field line, label included', async () => {
        const { cell } = await create({
            getRowClass: (params) => (fieldOf(params.node) === 'revenue' ? 'subtotal' : undefined),
        });
        const rowOf = (el: HTMLElement) => el.closest('.ag-row')!;
        expect(rowOf(cell(fieldRow('revenue'), FIELD_NAME_COL)).classList.contains('subtotal')).toBe(true);
        expect(rowOf(cell(fieldRow('revenue'), recordCol('a'))).classList.contains('subtotal')).toBe(true);
        expect(rowOf(cell(fieldRow('region'), recordCol('a'))).classList.contains('subtotal')).toBe(false);
    });

    test('getRowHeight sets the height of a field row', async () => {
        const { api } = await create({
            getRowHeight: (params) => (fieldOf(params.node) === 'revenue' ? 80 : undefined),
        });
        const heights: Record<string, number | null | undefined> = {};
        for (let i = 0; i < api.getDisplayedRowCount(); ++i) {
            const node = api.getDisplayedRowAtIndex(i)!;
            heights[fieldOf(node)] = node.rowHeight;
        }
        expect(heights.revenue).toBe(80);
        expect(heights.region).not.toBe(80);
    });

    test("rowClicked and rowDoubleClicked report the clicked column's record, and not the field-name column", async () => {
        const clicks: unknown[] = [];
        const { cell, revenueB } = await create({
            onRowClicked: (event) => clicks.push(['rowClicked', target(event)]),
            onRowDoubleClicked: (event) => clicks.push(['rowDoubleClicked', target(event)]),
        });
        const user = userEvent.setup();
        await user.click(cell(fieldRow('revenue'), FIELD_NAME_COL));
        await user.click(revenueB());
        await user.dblClick(cell(fieldRow('region'), recordCol('a')));
        await waitFor(() => expect(clicks.length).toBeGreaterThanOrEqual(4));
        const record = { column: undefined, field: undefined };
        expect(clicks).toEqual([
            ['rowClicked', { ...record, node: 'b', data: 'b' }],
            ['rowClicked', { ...record, node: 'a', data: 'a' }],
            ['rowClicked', { ...record, node: 'a', data: 'a' }],
            ['rowDoubleClicked', { ...record, node: 'a', data: 'a' }],
        ]);
    });

    test('clicking a cell selects its record; clicking a field name selects nothing', async () => {
        const { api, cell, revenueB } = await create({
            rowSelection: { mode: 'multiRow', checkboxes: false, enableClickSelection: true },
        });
        const user = userEvent.setup();
        await user.click(cell(fieldRow('revenue'), FIELD_NAME_COL));
        expect(api.getSelectedNodes().map((node) => node.id)).toEqual([]);
        await user.click(revenueB());
        await waitFor(() => expect(api.getSelectedNodes().map((node) => node.id)).toEqual(['b']));
    });

    test('undo and redo replay a transposed edit on the right record', async () => {
        const { api, revenueB } = await create({ undoRedoCellEditing: true });
        await editTo(revenueB(), '260');
        await waitFor(() => expect(api.getRowNode('b')!.data!.revenue).toBe(260));
        api.undoCellEditing();
        await waitFor(() => expect(api.getRowNode('b')!.data!.revenue).toBe(250));
        expect(api.getRowNode('a')!.data!.revenue).toBe(400);
        api.redoCellEditing();
        await waitFor(() => expect(api.getRowNode('b')!.data!.revenue).toBe(260));
    });
});

describe('transposed view: the fill handle and paste', () => {
    interface Account {
        id: string;
        name: string;
        revenue: number;
        cost: number;
    }

    const gridsManager = new TestGridsManager({
        modules: [
            CellSelectionModule,
            ClientSideRowModelModule,
            ClipboardModule,
            ColumnApiModule,
            NumberEditorModule,
            TransposeModule,
            UndoRedoEditModule,
        ],
    });

    beforeEach(() => clipboardUtils.init());
    afterEach(() => {
        gridsManager.reset();
        clipboardUtils.reset();
    });

    const create = async () => {
        const api: GridApi<Account> = await gridsManager.createGridAndWait('fill', {
            columnDefs: [{ field: 'name' }, { field: 'revenue', editable: true }, { field: 'cost', editable: true }],
            rowData: [
                { id: 'a', name: 'Northwind', revenue: 400, cost: 180 },
                { id: 'b', name: 'Contoso', revenue: 250, cost: 120 },
                { id: 'c', name: 'Fabrikam', revenue: 600, cost: 300 },
            ],
            getRowId: (params) => params.data.id,
            transpose: true,
            transposeHeaderColId: 'name',
            suppressColumnVirtualisation: true,
            cellSelection: { handle: { mode: 'fill' } },
            undoRedoCellEditing: true,
        });
        const gridDiv = TestGridsManager.getHTMLElement(api)!;
        const cell = (field: string, record: string) =>
            gridDiv.querySelector<HTMLElement>(`[row-id="${fieldRow(field)}"] [col-id="${recordCol(record)}"]`)!;
        await waitFor(() => expect(cell('cost', 'c')).toBeTruthy());
        const rowIndexOf = (field: string) => {
            for (let i = 0; i < api.getDisplayedRowCount(); i++) {
                if (api.getDisplayedRowAtIndex(i)?.id === fieldRow(field)) {
                    return i;
                }
            }
            throw new Error(`no field row for ${field}`);
        };
        const dragFill = async (field: string, record: string, toField: string, toRecord: string) => {
            const rowIndex = rowIndexOf(field);
            api.setFocusedCell(rowIndex, recordCol(record));
            api.addCellRange({ rowStartIndex: rowIndex, rowEndIndex: rowIndex, columns: [recordCol(record)] });
            const fillHandle = await waitFor(() => {
                const el = gridDiv.querySelector('.ag-fill-handle');
                if (!el) {
                    throw new Error('no fill handle');
                }
                return el;
            });
            const drag = new DragEventDispatcher('pointer', null, false);
            await drag.startDrag(fillHandle, 0, 0);
            // The fill direction follows whichever way the pointer moved further.
            const across = toRecord !== record;
            await drag.movePointer(cell(toField, toRecord), across ? 150 : 0, across ? 0 : 150);
            await drag.movePointer(cell(toField, toRecord), across ? 300 : 0, across ? 0 : 300);
            const fillEnd = waitForEvent('fillEnd', api);
            await drag.finishDrag();
            await fillEnd;
        };
        const values = (field: keyof Account) => ['a', 'b', 'c'].map((id) => api.getRowNode(id)!.data![field]);
        return { api, dragFill, rowIndexOf, values };
    };

    test('filling across records changes each record, and undo and redo replay the fill', async () => {
        const { api, dragFill, values } = await create();
        await dragFill('revenue', 'a', 'revenue', 'c');
        expect(values('revenue')).toEqual([400, 400, 400]);
        expect(values('cost')).toEqual([180, 120, 300]);
        api.undoCellEditing();
        await waitFor(() => expect(values('revenue')).toEqual([400, 250, 600]));
        api.redoCellEditing();
        await waitFor(() => expect(values('revenue')).toEqual([400, 400, 400]));
    });

    test("filling down a record's fields changes only that record, and undo replays the fill", async () => {
        const { api, dragFill, values } = await create();
        await dragFill('revenue', 'b', 'cost', 'b');
        expect(values('cost')).toEqual([180, 250, 300]);
        expect(values('revenue')).toEqual([400, 250, 600]);
        api.undoCellEditing();
        await waitFor(() => expect(values('cost')).toEqual([180, 120, 300]));
    });

    test('pasting across records changes each record, and undo replays the paste', async () => {
        const { api, rowIndexOf, values } = await create();
        api.setFocusedCell(rowIndexOf('revenue'), recordCol('a'));
        clipboardUtils.setText('999\t888');
        const pasteEnd = waitForEvent('pasteEnd', api);
        api.pasteFromClipboard();
        await pasteEnd;
        expect(values('revenue')).toEqual([999, 888, 600]);
        api.undoCellEditing();
        await waitFor(() => expect(values('revenue')).toEqual([400, 250, 600]));
    });
});
