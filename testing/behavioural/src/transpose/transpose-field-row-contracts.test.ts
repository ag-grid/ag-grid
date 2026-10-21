import { waitFor } from '@testing-library/dom';
import { userEvent } from '@testing-library/user-event';
import { TestGridsManager } from 'ag-test-utils';

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
import { TransposeModule } from 'ag-grid-enterprise';

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
                { field: 'region' },
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

    test('row callbacks are not called for field rows', async () => {
        const nodes: (string | undefined)[] = [];
        const record = (params: { node: IRowNode }) => {
            nodes.push(params.node.id);
            return undefined;
        };
        const { api } = await create({
            getRowStyle: record,
            getRowClass: record,
            getRowHeight: record,
            rowClassRules: { 'never-applied': (params) => record(params) ?? false },
        });
        expect(nodes).toEqual([]);
        api.setGridOption('transpose', false);
        await waitFor(() => expect(nodes).toContain('a'));
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
