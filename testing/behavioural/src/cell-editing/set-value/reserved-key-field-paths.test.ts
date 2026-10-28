import { getByTestId, waitFor } from '@testing-library/dom';
import { userEvent } from '@testing-library/user-event';
import {
    ALL_SEVERITIES,
    TestGridsManager,
    asyncSetTimeout,
    clipboardUtils,
    waitForEvent,
    waitForInput,
} from 'ag-test-utils';

import type { GridApi, GridOptions } from 'ag-grid-community';
import {
    AutoGenerateColumnsModule,
    ClientSideRowModelModule,
    TextEditorModule,
    UndoRedoEditModule,
    agTestIdFor,
    enableDevValidations,
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

/** A row holding `__proto__` and `constructor` as its own data, as `JSON.parse` produces them. */
const ownReservedRow = () =>
    JSON.parse(
        `{"id":"own","nested":{},"__proto__":{"${KEY}":"own proto"},"constructor":{"prototype":{"${KEY}":"own ctor"}}}`
    );

/** Runs `fn` with `console.warn` captured, returning the warnings that mention `#id`. */
async function captureWarnings(id: number, fn: () => Promise<void>): Promise<string[]> {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    try {
        await fn();
        return warn.mock.calls.map((args) => args.join(' ')).filter((msg) => msg.includes(`#${id}`));
    } finally {
        warn.mockRestore();
    }
}

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
        // Refused writes log warning #339 and `__proto__` fields #340, which these tests trigger on purpose
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [339, 340] });
    });

    afterEach(() => {
        gridMgr.reset();
        clipboardUtils.reset();
        enableDevValidations({ throwOn: ALL_SEVERITIES, suppress: [] });
        // Keep a failure in one test from leaking into the others
        delete (Object.prototype as Record<string, unknown>)[KEY];
        delete (Object.prototype.toString as unknown as Record<string, unknown>)[KEY];
        delete (Array.prototype.map as unknown as Record<string, unknown>)[KEY];
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

    describe('`__proto__` fields', () => {
        test.each([
            { position: 'the whole field', field: '__proto__', options: {} },
            { position: 'the first segment', field: PROTO_FIELD, options: {} },
            { position: 'the last segment', field: 'nested.__proto__', options: {} },
            {
                position: 'the whole field without dot notation',
                field: '__proto__',
                options: { suppressFieldDotNotation: true },
            },
        ])('are neither read nor written when `__proto__` is $position', async ({ field, options }) => {
            const api = await createGrid({
                columnDefs: [{ field: 'id' }, { field }],
                rowData: [ownReservedRow(), { id: 'plain', nested: {} }],
                ...options,
            });

            for (const id of ['own', 'plain']) {
                const row = api.getRowNode(id)!;
                expect(api.getCellValue({ rowNode: row, colKey: field })).toBeUndefined();
                expect(row.setDataValue(field, { [KEY]: 'changed' })).toBe(false);
                expect(Object.getPrototypeOf(row.data)).toBe(Object.prototype);
                expect(Object.getPrototypeOf(row.data.nested)).toBe(Object.prototype);
            }
            expect(Object.getOwnPropertyDescriptor(api.getRowNode('own')!.data, '__proto__')!.value).toEqual({
                [KEY]: 'own proto',
            });
            expectObjectPrototypeUnchanged();
        });

        test('warns once per column when the column is set up', async () => {
            const field = `warned.__proto__.${KEY}`;
            const warnings = await captureWarnings(340, async () => {
                const api = await createGrid({
                    columnDefs: [{ field: 'id' }, { field }],
                    rowData: [{ id: 'plain' }],
                });
                const row = api.getRowNode('plain')!;
                expect(row.setDataValue(field, 'changed')).toBe(false);
                expect(row.setDataValue(field, 'changed again')).toBe(false);
            });

            expect(warnings).toHaveLength(1);
            expect(warnings[0]).toContain(field);
        });

        test('does not warn when the column has its own getter and setter', async () => {
            const field = `custom.__proto__.${KEY}`;
            let stored = 'initial';
            const warnings = await captureWarnings(340, async () => {
                const api = await createGrid({
                    columnDefs: [
                        { field: 'id' },
                        {
                            field,
                            valueGetter: () => stored,
                            valueSetter: ({ newValue }) => {
                                stored = newValue;
                                return true;
                            },
                        },
                    ],
                    rowData: [{ id: 'plain' }],
                });
                const row = api.getRowNode('plain')!;
                expect(row.setDataValue(field, 'changed')).toBe(true);
                expect(api.getCellValue({ rowNode: row, colKey: field })).toBe('changed');
            });

            expect(warnings).toEqual([]);
            expectObjectPrototypeUnchanged();
        });
    });

    describe('writing through a field path', () => {
        test('writes through objects the row holds as its own data, including `constructor`', async () => {
            const api = await createFieldGrid();
            const own = api.getRowNode('own')!;

            expect(api.getCellValue({ rowNode: own, colKey: CTOR_FIELD })).toBe('own ctor');
            expect(own.setDataValue(CTOR_FIELD, 'changed')).toBe(true);
            expect(api.getCellValue({ rowNode: own, colKey: CTOR_FIELD })).toBe('changed');
            expectObjectPrototypeUnchanged();
        });

        const callback = () => undefined;
        test.each([
            { through: 'an inherited `constructor`', field: CTOR_FIELD, data: {}, target: () => Object.prototype },
            {
                through: 'an inherited method',
                field: `toString.${KEY}`,
                data: {},
                target: () => Object.prototype.toString,
            },
            {
                through: 'an array method',
                field: `items.map.${KEY}`,
                data: { items: [1] },
                target: () => Array.prototype.map,
            },
            {
                through: 'a function held as own data',
                field: `callback.${KEY}`,
                data: { callback },
                target: () => callback,
            },
            { through: 'a string', field: `label.${KEY}`, data: { label: 'text' }, target: () => String.prototype },
        ])('refuses a write through $through', async ({ field, data, target }) => {
            const api = await createGrid({
                columnDefs: [{ field: 'id' }, { field }],
                rowData: [{ id: 'r', ...data }],
            });
            const row = api.getRowNode('r')!;

            expect(row.setDataValue(field, 'changed')).toBe(false);
            expect(row.data).toEqual({ id: 'r', ...data });
            expect(Object.hasOwn(target(), KEY)).toBe(false);
            expectObjectPrototypeUnchanged();
        });

        test('warns once per field when a write is refused', async () => {
            const field = `warnedLabel.${KEY}`;
            const warnings = await captureWarnings(339, async () => {
                const api = await createGrid({
                    columnDefs: [{ field: 'id' }, { field }],
                    rowData: [{ id: 'r', warnedLabel: 'text' }],
                });
                const row = api.getRowNode('r')!;
                expect(row.setDataValue(field, 'changed')).toBe(false);
                expect(row.setDataValue(field, 'changed again')).toBe(false);
            });

            expect(warnings).toHaveLength(1);
            expect(warnings[0]).toContain(field);
        });

        test('reads inherited keys from class instance rows', async () => {
            class Driver {
                constructor(public id: string) {}
            }
            const api = await createGrid({
                columnDefs: [{ field: 'id' }, { field: 'constructor.name' }],
                rowData: [new Driver('1')],
            });

            expect(api.getCellValue({ rowNode: api.getRowNode('1')!, colKey: 'constructor.name' })).toBe('Driver');
        });

        test('reads and writes through class getters and setters', async () => {
            class Person {
                private first = 'Ada';
                private home = { city: 'London' };
                constructor(public id: string) {}
                get name() {
                    return this.first;
                }
                set name(value: string) {
                    this.first = value;
                }
                get address() {
                    return this.home;
                }
            }
            const api = await createGrid({
                columnDefs: [{ field: 'id' }, { field: 'name' }, { field: 'address.city' }],
                rowData: [new Person('1')],
            });
            const row = api.getRowNode('1')!;

            expect(row.setDataValue('name', 'Grace')).toBe(true);
            expect(row.setDataValue('address.city', 'Paris')).toBe(true);
            expect(api.getCellValue({ rowNode: row, colKey: 'name' })).toBe('Grace');
            expect(api.getCellValue({ rowNode: row, colKey: 'address.city' })).toBe('Paris');
        });
    });

    describe('every write path', () => {
        test('cell editing', async () => {
            const api = await createFieldGrid();

            await editCellViaUi(api, 'plain', PROTO_FIELD, 'edited');
            await editCellViaUi(api, 'plain', CTOR_FIELD, 'edited');
            expect(api.getRowNode('plain')!.data).toEqual({ id: 'plain' });

            await editCellViaUi(api, 'own', PROTO_FIELD, 'edited');
            await editCellViaUi(api, 'own', CTOR_FIELD, 'edited');
            const own = api.getRowNode('own')!;
            expect(api.getCellValue({ rowNode: own, colKey: PROTO_FIELD })).toBeUndefined();
            expect(api.getCellValue({ rowNode: own, colKey: CTOR_FIELD })).toBe('edited');
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

            await editCellViaUi(api, 'own', CTOR_FIELD, 'edited');
            await editCellViaUi(api, 'plain', CTOR_FIELD, 'edited');
            const own = api.getRowNode('own')!;

            api.undoCellEditing();
            api.undoCellEditing();
            expect(api.getCellValue({ rowNode: own, colKey: CTOR_FIELD })).toBe('own ctor');

            api.redoCellEditing();
            api.redoCellEditing();
            expect(api.getCellValue({ rowNode: own, colKey: CTOR_FIELD })).toBe('edited');
            expect(api.getRowNode('plain')!.data).toEqual({ id: 'plain' });
            expectObjectPrototypeUnchanged();
        });

        test('group row editing', async () => {
            const api = await createGrid({
                columnDefs: [
                    { field: 'country', rowGroup: true, hide: true },
                    { field: PROTO_FIELD },
                    { field: CTOR_FIELD },
                ],
                defaultColDef: { editable: true },
                enableGroupEdit: true,
                groupDefaultExpanded: -1,
                getRowId: undefined,
                rowData: [{ country: 'UK' }],
            });
            const groupNode = api.getDisplayedRowAtIndex(0)!;
            expect(groupNode.group).toBe(true);

            expect(groupNode.setDataValue(PROTO_FIELD, 'group value')).toBe(false);
            expect(groupNode.setDataValue(CTOR_FIELD, 'group value')).toBe(false);
            expectObjectPrototypeUnchanged();
        });
    });

    describe('autoGenerateColumnDefs', () => {
        // rowData is supplied after creation: generating columns during grid init with an editing module
        // registered currently fails in EditService.releaseColumnsLeaving
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

        test('skips keys whose path has a `__proto__` segment', async () => {
            const api = await createGeneratedGrid({ autoGenerateColumnDefs: true }, [
                JSON.parse(
                    `{"id":"own","__proto__.a":1,"b.__proto__":2,"__proto__":{"c":3},"constructor":{"name":"d"},"prototype":true,"group":{"__proto__.e":4,"name":"n"}}`
                ),
            ]);

            expect(api.getColumns()!.map((col) => col.getColDef().field)).toEqual([
                'id',
                'constructor.name',
                'prototype',
                'group.name',
            ]);
        });

        test('keeps other dotted keys as nested paths', async () => {
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
