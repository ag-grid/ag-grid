import { getByTestId, waitFor } from '@testing-library/dom';
import { userEvent } from '@testing-library/user-event';
import { TestGridsManager, asyncSetTimeout, clipboardUtils, waitForEvent, waitForInput } from 'ag-test-utils';

import type { GridApi, GridOptions } from 'ag-grid-community';
import {
    AutoGenerateColumnsModule,
    ClientSideRowModelModule,
    TextEditorModule,
    UndoRedoEditModule,
    agTestIdFor,
    getGridElement,
    setupAgTestIds,
} from 'ag-grid-community';
import { CellSelectionModule, ClipboardModule, RowGroupingEditModule, RowGroupingModule } from 'ag-grid-enterprise';

/** Property name the tests write through reserved keys; it must never appear on `Object.prototype`. */
const KEY = 'agReservedKeyCheck';
const PROTO_FIELD = `__proto__.${KEY}`;
const CTOR_FIELD = `constructor.prototype.${KEY}`;

const expectObjectPrototypeUnchanged = () => {
    expect(Object.hasOwn(Object.prototype, KEY)).toBe(false);
    expect(({} as Record<string, unknown>)[KEY]).toBeUndefined();
};

/** A row holding the reserved keys as its own data, as `JSON.parse` produces them. */
const ownReservedRow = () =>
    JSON.parse(`{"id":"own","__proto__":{"${KEY}":"own proto"},"constructor":{"prototype":{"${KEY}":"own ctor"}}}`);

describe('Reserved key handling in field paths', () => {
    const gridMgr = new TestGridsManager({
        modules: [
            ClientSideRowModelModule,
            AutoGenerateColumnsModule,
            TextEditorModule,
            UndoRedoEditModule,
            CellSelectionModule,
            ClipboardModule,
            RowGroupingModule,
            RowGroupingEditModule,
        ],
    });

    beforeAll(() => {
        setupAgTestIds();
        clipboardUtils.init();
    });

    beforeEach(() => {
        clipboardUtils.init();
    });

    afterEach(() => {
        gridMgr.reset();
        clipboardUtils.reset();
        // Keep a failure in one test from leaking into the others
        delete (Object.prototype as Record<string, unknown>)[KEY];
    });

    const createGrid = (options: GridOptions) =>
        gridMgr.createGridAndWait('reservedKeyGrid', {
            getRowId: ({ data }) => data.id,
            suppressColumnVirtualisation: true,
            ...options,
        });

    const createFieldGrid = (options: GridOptions = {}) =>
        createGrid({
            columnDefs: [{ field: 'id' }, { field: PROTO_FIELD }, { field: CTOR_FIELD }],
            defaultColDef: { editable: true },
            rowData: [ownReservedRow(), { id: 'plain' }],
            ...options,
        });

    async function editCellViaUi(api: GridApi, rowId: string, colId: string, value: string) {
        const gridDiv = getGridElement(api) as HTMLElement;
        const rowIndex = api.getRowNode(rowId)!.rowIndex!;
        api.setFocusedCell(rowIndex, colId);
        api.startEditingCell({ rowIndex, colKey: colId });
        const cell = await waitFor(() => getByTestId(gridDiv, agTestIdFor.cell(rowId, colId)));
        const input = await waitForInput(gridDiv, cell);
        await userEvent.clear(input);
        await userEvent.type(input, `${value}{Enter}`);
        await waitFor(() => expect(api.getEditingCells()).toEqual([]));
    }

    describe('field with dot notation', () => {
        test('reads reserved keys only where the row holds them as own data', async () => {
            const api = await createFieldGrid();

            expect(api.getCellValue({ rowNode: api.getRowNode('own')!, colKey: PROTO_FIELD })).toBe('own proto');
            expect(api.getCellValue({ rowNode: api.getRowNode('own')!, colKey: CTOR_FIELD })).toBe('own ctor');
            expect(api.getCellValue({ rowNode: api.getRowNode('plain')!, colKey: PROTO_FIELD })).toBeUndefined();
            expect(api.getCellValue({ rowNode: api.getRowNode('plain')!, colKey: CTOR_FIELD })).toBeUndefined();
        });

        test.each([PROTO_FIELD, CTOR_FIELD])('setDataValue on %s', async (field) => {
            const api = await createFieldGrid();
            const own = api.getRowNode('own')!;
            const plain = api.getRowNode('plain')!;

            expect(plain.setDataValue(field, 'changed')).toBe(false);
            expect(plain.data).toEqual({ id: 'plain' });
            expectObjectPrototypeUnchanged();

            expect(own.setDataValue(field, 'changed')).toBe(true);
            expect(api.getCellValue({ rowNode: own, colKey: field })).toBe('changed');
            expectObjectPrototypeUnchanged();
        });

        test.each([PROTO_FIELD, CTOR_FIELD])('cell editing on %s', async (field) => {
            const api = await createFieldGrid();

            await editCellViaUi(api, 'plain', field, 'edited');
            expect(api.getRowNode('plain')!.data).toEqual({ id: 'plain' });
            expectObjectPrototypeUnchanged();

            await editCellViaUi(api, 'own', field, 'edited');
            expect(api.getCellValue({ rowNode: api.getRowNode('own')!, colKey: field })).toBe('edited');
            expectObjectPrototypeUnchanged();
        });

        test('clipboard paste', async () => {
            const api = await createFieldGrid();

            clipboardUtils.setText('pasted\tpasted');
            api.setFocusedCell(api.getRowNode('plain')!.rowIndex!, PROTO_FIELD);
            const pasteEnd = waitForEvent('pasteEnd', api);
            api.pasteFromClipboard();
            await pasteEnd;

            expect(api.getRowNode('plain')!.data).toEqual({ id: 'plain' });
            expectObjectPrototypeUnchanged();
        });

        test('fill handle', async () => {
            const api = await createFieldGrid({ cellSelection: { handle: { mode: 'fill' } } });
            const gridDiv = getGridElement(api) as HTMLElement;

            api.addCellRange({ rowStartIndex: 0, rowEndIndex: 0, columns: [PROTO_FIELD, CTOR_FIELD] });
            const fillHandle = await waitFor(() => getByTestId(gridDiv, agTestIdFor.fillHandle()));
            const fillEnd = waitForEvent('fillEnd', api);
            await userEvent.dblClick(fillHandle);
            await fillEnd;

            expect(api.getRowNode('plain')!.data).toEqual({ id: 'plain' });
            expectObjectPrototypeUnchanged();
        });

        test('deleting a cell range', async () => {
            const api = await createFieldGrid();
            const gridDiv = getGridElement(api) as HTMLElement;
            await asyncSetTimeout(0);

            const user = userEvent.setup({ skipHover: true });
            await user.click(getByTestId(gridDiv, agTestIdFor.cell('plain', PROTO_FIELD)));
            api.addCellRange({ rowStartIndex: 0, rowEndIndex: 1, columns: [PROTO_FIELD, CTOR_FIELD] });
            await user.keyboard('{Delete}');
            await asyncSetTimeout(0);

            expect(api.getRowNode('plain')!.data).toEqual({ id: 'plain' });
            expectObjectPrototypeUnchanged();
        });

        test('undo and redo', async () => {
            const api = await createFieldGrid({ undoRedoCellEditing: true });

            await editCellViaUi(api, 'own', PROTO_FIELD, 'edited');
            await editCellViaUi(api, 'plain', PROTO_FIELD, 'edited');
            const own = api.getRowNode('own')!;

            api.undoCellEditing();
            api.undoCellEditing();
            expect(api.getCellValue({ rowNode: own, colKey: PROTO_FIELD })).toBe('own proto');

            api.redoCellEditing();
            api.redoCellEditing();
            expect(api.getCellValue({ rowNode: own, colKey: PROTO_FIELD })).toBe('edited');
            expect(api.getRowNode('plain')!.data).toEqual({ id: 'plain' });
            expectObjectPrototypeUnchanged();
        });

        test('group row editing creates no reserved keys', async () => {
            const api = await createGrid({
                columnDefs: [{ field: 'country', rowGroup: true, hide: true }, { field: PROTO_FIELD }],
                defaultColDef: { editable: true },
                enableGroupEdit: true,
                groupDefaultExpanded: -1,
                getRowId: undefined,
                rowData: [{ country: 'UK' }],
            });
            const groupNode = api.getDisplayedRowAtIndex(0)!;
            expect(groupNode.group).toBe(true);

            expect(groupNode.setDataValue(PROTO_FIELD, 'group value')).toBe(false);
            expectObjectPrototypeUnchanged();
        });
    });

    describe('autoGenerateColumnDefs', () => {
        // rowData is supplied after creation: generating columns during grid init with an editing module
        // registered currently fails in EditService.releaseColumnsLeaving, which is tracked separately
        async function createGeneratedGrid(options: GridOptions, rowData: any[]) {
            const api = gridMgr.createGrid('reservedKeyGrid', {
                getRowId: ({ data }) => data.id,
                suppressColumnVirtualisation: true,
                ...options,
            });
            api.setGridOption('rowData', rowData);
            await waitFor(() => expect(api.getDisplayedRowCount()).toBe(rowData.length));
            return api;
        }

        const generatedRows = () => [
            JSON.parse(
                `{"id":"own","${PROTO_FIELD}":"a","${CTOR_FIELD}":"b","__proto__":{"${KEY}":"c"},"constructor":{"${KEY}":"d"}}`
            ),
            { id: 'plain', [PROTO_FIELD]: 'e', [CTOR_FIELD]: 'f' },
        ];

        test('skips keys whose path has a reserved segment', async () => {
            const api = await createGeneratedGrid({ autoGenerateColumnDefs: true }, [
                ...generatedRows(),
                { id: 'nested', group: { 'constructor.prototype': { [KEY]: 'g' }, name: 'n' } },
            ]);

            expect(api.getColumns()!.map((col) => col.getColDef().field)).toEqual(['id']);
        });

        test('keeps dotted keys without reserved segments as nested paths', async () => {
            const api = await createGeneratedGrid({ autoGenerateColumnDefs: true }, [
                { id: 'r1', 'user.name': 'Alice', group: { 'a.b': 1, name: 'n' } },
            ]);

            expect(api.getColumns()!.map((col) => col.getColDef().field)).toEqual([
                'id',
                'user.name',
                'group.a.b',
                'group.name',
            ]);
        });

        test.each(['group', 'flatten'] as const)(
            'nested objects still use field paths (objectValues: %s)',
            async (objectValues) => {
                const api = await createGeneratedGrid(
                    { autoGenerateColumnDefs: { objectValues }, defaultColDef: { editable: true } },
                    [{ id: 'r1', address: { city: 'London' } }]
                );

                expect(api.getColumn('address.city')!.getColDef().field).toBe('address.city');

                await editCellViaUi(api, 'r1', 'address.city', 'Paris');
                expect(api.getRowNode('r1')!.data).toEqual({ id: 'r1', address: { city: 'Paris' } });
            }
        );
    });
});
