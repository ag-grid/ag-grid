import type { BeanCollection } from '../context/context';
import type { EditingCellPosition } from '../interfaces/iCellEditor';
import type { CellPosition } from '../interfaces/iCellPosition';
import type { Column } from '../interfaces/iColumn';
import type { EditMap, EditRow, IEditModelService } from '../interfaces/iEditModelService';
import type { IEditService } from '../interfaces/iEditService';
import type { IRowNode } from '../interfaces/iRowNode';
import type { CellCtrl } from '../rendering/cell/cellCtrl';
import type { RowCtrl } from '../rendering/row/rowCtrl';
import type { RowRenderer } from '../rendering/rowRenderer';
import type { ValueService } from '../valueService/valueService';
import { getEditingCells } from './editApi';
import { EditService } from './editService';
import { SingleCellEditStrategy } from './strategy/singleCellEditStrategy';
import { UNEDITED } from './utils/editors';

describe('Edit API', () => {
    const rowNode1 = { rowIndex: 0, rowPinned: undefined } as unknown as IRowNode;
    const rowNode2 = { rowIndex: 1, rowPinned: undefined } as unknown as IRowNode;
    const column1 = {
        getColId: () => 'col1',
        colId: 'col1',
        getColDef: () => ({ editable: true }),
        isColumnFunc: () => false,
    } as unknown as Column;
    const column2 = {
        getColId: () => 'col2',
        colId: 'col2',
        getColDef: () => ({ editable: true }),
        isColumnFunc: () => false,
    } as unknown as Column;
    const cellCtrl1 = { rowNode: rowNode1, focusCell: jest.fn(), onEditorAttachedFuncs: [] } as unknown as CellCtrl;
    const cellCtrl2 = { rowNode: rowNode2, focusCell: jest.fn(), onEditorAttachedFuncs: [] } as unknown as CellCtrl;

    const getCellCtrl = (column: Column) => {
        if (column.getColId() === 'col1') {
            return cellCtrl1;
        } else if (column.getColId() === 'col2') {
            return cellCtrl2;
        }
        return undefined;
    };

    const rowCtrl1 = {
        rowNode: rowNode1,
        getCellCtrl,
    } as unknown as RowCtrl;
    const rowCtrl2 = {
        rowNode: rowNode2,
        getCellCtrl,
    } as unknown as RowCtrl;

    let editMap: EditMap | undefined;
    let beans: BeanCollection;

    let editSvc: IEditService;
    let setEditingCells: (beans: BeanCollection, cells: EditingCellPosition[], params?: { update?: boolean }) => void;

    beforeEach(() => {
        editMap = new Map();
        beans = {
            editModelSvc: {
                getEditMap: jest.fn(() => editMap),
                setEditMap: jest.fn((em) => {
                    editMap?.clear();
                    em.forEach((value, key) => editMap!.set(key, value));
                }),
                hasEdits: jest.fn(() => editMap && editMap.size > 0),
            } as unknown as IEditModelService,
            colModel: {
                getCol: jest.fn((col: Column | string) => {
                    const colId = typeof col === 'string' ? col : col.getColId();
                    if (colId === 'col1') {
                        return column1;
                    } else if (colId === 'col2') {
                        return column2;
                    }
                    return undefined;
                }),
            },
            rowRenderer: {
                getRowByPosition: jest.fn((position: CellPosition) => {
                    if (position.rowIndex === 0) {
                        return rowCtrl1;
                    } else if (position.rowIndex === 1) {
                        return rowCtrl2;
                    }
                    return undefined;
                }),
                refreshCells: jest.fn(),
                getRowCtrls: jest.fn(() => [rowCtrl1, rowCtrl2]),
            } as unknown as RowRenderer,
            valueSvc: {
                getValue: jest.fn((col: Column, rowNode: IRowNode, _ignoreAggData: boolean, _source: string) => {
                    if (col.getColId() === 'col1' && rowNode.rowIndex === 0) {
                        return 'old1';
                    } else if (col.getColId() === 'col2' && rowNode.rowIndex === 0) {
                        return 'old2';
                    } else if (col.getColId() === 'col1' && rowNode.rowIndex === 1) {
                        return 'old1';
                    } else if (col.getColId() === 'col2' && rowNode.rowIndex === 1) {
                        return 'old2';
                    }
                    return undefined;
                }),
            } as unknown as ValueService,
            registry: {
                createDynamicBean: jest.fn(),
            },
            rowModel: {
                getRow: jest.fn((index: number) => {
                    if (index === 0) {
                        return rowNode1;
                    } else if (index === 1) {
                        return rowNode2;
                    }
                    return undefined;
                }),
            },
            gos: {
                get(key: string) {
                    if (key === 'editType') {
                        return 'fullRow';
                    }
                },
            },
        } as unknown as BeanCollection;

        editSvc = new EditService();
        beans.editSvc = editSvc;
        editSvc['beans'] = beans;
        editSvc['gos'] = beans.gos;
        editSvc['model'] = beans.editModelSvc;
        editSvc['strategy'] = new SingleCellEditStrategy();
        editSvc['strategy'].model = beans.editModelSvc;
        editSvc['strategy'].editSvc = editSvc;
        editSvc['strategy'].beans = beans;
        editSvc['strategy'].start = jest.fn();

        setEditingCells = (beans, cells: any[], params?: any) => editSvc.setEditingCells(cells, params);
    });

    afterEach(() => {
        jest.clearAllMocks();
        editMap = undefined;
    });

    describe('getEditingCells', () => {
        test('returns empty array when no edits', () => {
            const result = getEditingCells(beans);
            expect(result).toEqual([]);
        });
        test('returns editing cells with pending edits', () => {
            editMap!.set(
                rowNode1,
                new Map([
                    [column1, { editorValue: undefined, pendingValue: 'new1', sourceValue: 'old1', state: 'editing' }],
                    [column2, { editorValue: undefined, pendingValue: 'new2', sourceValue: 'old2', state: 'changed' }],
                ]) as EditRow
            );

            const result = getEditingCells(beans);
            expect(result).toEqual([
                {
                    newValue: 'new1',
                    oldValue: 'old1',
                    state: 'editing',
                    column: column1,
                    colId: 'col1',
                    colKey: 'col1',
                    rowIndex: 0,
                    rowPinned: undefined,
                },
                {
                    newValue: 'new2',
                    oldValue: 'old2',
                    state: 'changed',
                    column: column2,
                    colId: 'col2',
                    colKey: 'col2',
                    rowIndex: 0,
                    rowPinned: undefined,
                },
            ]);
        });
        test('handles multiple rows and columns', () => {
            editMap!.set(
                rowNode1,
                new Map([
                    [column1, { editorValue: undefined, pendingValue: 'new1', sourceValue: 'old1', state: 'editing' }],
                    [column2, { editorValue: undefined, pendingValue: 'new2', sourceValue: 'old2', state: 'changed' }],
                ]) as EditRow
            );
            editMap!.set(
                rowNode2,
                new Map([
                    [column1, { editorValue: undefined, pendingValue: 'new3', sourceValue: 'old3', state: 'editing' }],
                    [column2, { editorValue: undefined, pendingValue: 'new4', sourceValue: 'old4', state: 'changed' }],
                ]) as EditRow
            );

            const result = getEditingCells(beans);
            expect(result).toEqual([
                {
                    newValue: 'new1',
                    oldValue: 'old1',
                    state: 'editing',
                    column: column1,
                    colId: 'col1',
                    colKey: 'col1',
                    rowIndex: 0,
                    rowPinned: undefined,
                },
                {
                    newValue: 'new2',
                    oldValue: 'old2',
                    state: 'changed',
                    column: column2,
                    colId: 'col2',
                    colKey: 'col2',
                    rowIndex: 0,
                    rowPinned: undefined,
                },
                {
                    newValue: 'new3',
                    oldValue: 'old3',
                    state: 'editing',
                    column: column1,
                    colId: 'col1',
                    colKey: 'col1',
                    rowIndex: 1,
                    rowPinned: undefined,
                },
                {
                    newValue: 'new4',
                    oldValue: 'old4',
                    state: 'changed',
                    column: column2,
                    colId: 'col2',
                    colKey: 'col2',
                    rowIndex: 1,
                    rowPinned: undefined,
                },
            ]);
        });
        test('handles edits with UNEDITED state', () => {
            editMap!.set(
                rowNode1,
                new Map([
                    [
                        column1,
                        { editorValue: undefined, pendingValue: UNEDITED, sourceValue: 'old1', state: 'editing' },
                    ],
                    [column2, { editorValue: undefined, pendingValue: 'new2', sourceValue: 'old2', state: 'changed' }],
                ]) as EditRow
            );

            const result = getEditingCells(beans);
            expect(result).toEqual([
                {
                    colId: 'col1',
                    colKey: 'col1',
                    column: column1,
                    newValue: undefined,
                    oldValue: 'old1',
                    rowId: undefined,
                    rowIndex: 0,
                    rowPinned: undefined,
                    state: 'editing',
                },
                {
                    colId: 'col2',
                    colKey: 'col2',
                    column: column2,
                    newValue: 'new2',
                    oldValue: 'old2',
                    rowId: undefined,
                    rowIndex: 0,
                    rowPinned: undefined,
                    state: 'changed',
                },
            ]);
        });
    });

    describe('setEditingCells', () => {
        test('does not set edits when not in batch editing mode', () => {
            editSvc!.isBatchEditing = jest.fn().mockReturnValue(false);
            const cells = [
                { colId: 'col1', rowIndex: 0, rowPinned: undefined, newValue: 'new1', state: 'editing' },
            ] as EditingCellPosition[];
            setEditingCells(beans, cells);
            expect(beans.editModelSvc!.setEditMap).toHaveBeenCalled();
            expect(editMap).toMatchObject(
                new Map([
                    [
                        { rowIndex: 0, rowPinned: undefined },
                        new Map([
                            [
                                expect.objectContaining({
                                    colId: 'col1',
                                    getColId: expect.any(Function),
                                    getColDef: expect.any(Function),
                                    isColumnFunc: expect.any(Function),
                                }),
                                { pendingValue: 'new1', sourceValue: 'old1', state: 'editing' },
                            ],
                        ]),
                    ],
                ])
            );
        });

        test('sets edits in batch editing mode, using colId', () => {
            editSvc!.isBatchEditing = jest.fn().mockReturnValue(true);
            const cells = [
                { colId: 'col1', rowIndex: 0, rowPinned: undefined, newValue: 'new1', state: 'editing' },
                { colId: 'col2', rowIndex: 1, rowPinned: undefined, newValue: 'new2', state: 'changed' },
            ] as EditingCellPosition[];
            setEditingCells(beans, cells);
            expect(beans.editModelSvc!.setEditMap).toHaveBeenCalledWith(
                expect.objectContaining(
                    new Map([
                        [
                            { rowIndex: 0, rowPinned: undefined },
                            new Map([
                                [
                                    {
                                        getColId: expect.any(Function),
                                        colId: 'col1',
                                        getColDef: expect.any(Function),
                                        isColumnFunc: expect.any(Function),
                                    },
                                    { pendingValue: 'new1', sourceValue: 'old1', state: 'editing' },
                                ],
                            ]),
                        ],
                        [
                            { rowIndex: 1, rowPinned: undefined },
                            new Map([
                                [
                                    {
                                        getColId: expect.any(Function),
                                        colId: 'col2',
                                        getColDef: expect.any(Function),
                                        isColumnFunc: expect.any(Function),
                                    },
                                    { pendingValue: 'new2', sourceValue: 'old2', state: 'changed' },
                                ],
                            ]),
                        ],
                    ]) as any
                )
            );
        });

        test('sets edits in batch editing mode, using colKey:string', () => {
            editSvc!.isBatchEditing = jest.fn().mockReturnValue(true);
            const cells = [
                { colKey: 'col1', rowIndex: 0, rowPinned: undefined, newValue: 'new1', state: 'editing' },
                { colKey: 'col2', rowIndex: 1, rowPinned: undefined, newValue: 'new2', state: 'changed' },
            ] as EditingCellPosition[];
            setEditingCells(beans, cells);
            expect(beans.editModelSvc!.setEditMap).toHaveBeenCalledWith(
                expect.objectContaining(
                    new Map([
                        [
                            { rowIndex: 0, rowPinned: undefined },
                            new Map([
                                [
                                    {
                                        getColId: expect.any(Function),
                                        colId: 'col1',
                                        getColDef: expect.any(Function),
                                        isColumnFunc: expect.any(Function),
                                    },
                                    { pendingValue: 'new1', sourceValue: 'old1', state: 'editing' },
                                ],
                            ]),
                        ],
                        [
                            { rowIndex: 1, rowPinned: undefined },
                            new Map([
                                [
                                    {
                                        getColId: expect.any(Function),
                                        colId: 'col2',
                                        getColDef: expect.any(Function),
                                        isColumnFunc: expect.any(Function),
                                    },
                                    { pendingValue: 'new2', sourceValue: 'old2', state: 'changed' },
                                ],
                            ]),
                        ],
                    ])
                )
            );
        });

        test('sets edits in batch editing mode, using colKey:column', () => {
            editSvc!.isBatchEditing = jest.fn().mockReturnValue(true);
            const cells = [
                { colKey: column1, rowIndex: 0, rowPinned: undefined, newValue: 'new1', state: 'editing' },
                { colKey: column2, rowIndex: 1, rowPinned: undefined, newValue: 'new2', state: 'changed' },
            ] as EditingCellPosition[];
            setEditingCells(beans, cells);
            expect(beans.editModelSvc!.setEditMap).toHaveBeenCalledWith(
                expect.objectContaining(
                    new Map([
                        [
                            { rowIndex: 0, rowPinned: undefined },
                            new Map([
                                [
                                    {
                                        getColId: expect.any(Function),
                                        colId: 'col1',
                                        getColDef: expect.any(Function),
                                        isColumnFunc: expect.any(Function),
                                    },
                                    { pendingValue: 'new1', sourceValue: 'old1', state: 'editing' },
                                ],
                            ]),
                        ],
                        [
                            { rowIndex: 1, rowPinned: undefined },
                            new Map([
                                [
                                    {
                                        getColId: expect.any(Function),
                                        colId: 'col2',
                                        getColDef: expect.any(Function),
                                        isColumnFunc: expect.any(Function),
                                    },
                                    { pendingValue: 'new2', sourceValue: 'old2', state: 'changed' },
                                ],
                            ]),
                        ],
                    ])
                )
            );
        });

        test('sets edits in batch editing mode, using column', () => {
            editSvc!.isBatchEditing = jest.fn().mockReturnValue(true);
            const cells = [
                { column: column1, rowIndex: 0, rowPinned: undefined, newValue: 'new1', state: 'editing' },
                { column: column2, rowIndex: 1, rowPinned: undefined, newValue: 'new2', state: 'changed' },
            ] as EditingCellPosition[];
            setEditingCells(beans, cells);
            expect(beans.editModelSvc!.setEditMap).toHaveBeenCalledWith(
                expect.objectContaining(
                    new Map([
                        [
                            { rowIndex: 0, rowPinned: undefined },
                            new Map([
                                [
                                    {
                                        getColId: expect.any(Function),
                                        colId: 'col1',
                                        getColDef: expect.any(Function),
                                        isColumnFunc: expect.any(Function),
                                    },
                                    { pendingValue: 'new1', sourceValue: 'old1', state: 'editing' },
                                ],
                            ]),
                        ],
                        [
                            { rowIndex: 1, rowPinned: undefined },
                            new Map([
                                [
                                    {
                                        getColId: expect.any(Function),
                                        colId: 'col2',
                                        getColDef: expect.any(Function),
                                        isColumnFunc: expect.any(Function),
                                    },
                                    { pendingValue: 'new2', sourceValue: 'old2', state: 'changed' },
                                ],
                            ]),
                        ],
                    ])
                )
            );
        });

        test('sets edits in batch editing mode, using all three column options', () => {
            editSvc!.isBatchEditing = jest.fn().mockReturnValue(true);
            const cells = [
                {
                    colId: 'col1',
                    colKey: 'colA',
                    column: {},
                    rowIndex: 0,
                    rowPinned: undefined,
                    newValue: 'new1',
                    state: 'editing',
                },
                {
                    colId: 'col2',
                    colKey: 'colB',
                    column: {},
                    rowIndex: 1,
                    rowPinned: undefined,
                    newValue: 'new2',
                    state: 'changed',
                },
            ] as EditingCellPosition[];
            setEditingCells(beans, cells);
            expect(beans.editModelSvc!.setEditMap).toHaveBeenCalledWith(
                expect.objectContaining(
                    new Map([
                        [
                            { rowIndex: 0, rowPinned: undefined },
                            new Map([
                                [
                                    {
                                        getColId: expect.any(Function),
                                        colId: 'col1',
                                        getColDef: expect.any(Function),
                                        isColumnFunc: expect.any(Function),
                                    },
                                    {
                                        editorValue: undefined,
                                        pendingValue: 'new1',
                                        sourceValue: 'old1',
                                        state: 'editing',
                                    },
                                ],
                            ]),
                        ],
                        [
                            { rowIndex: 1, rowPinned: undefined },
                            new Map([
                                [
                                    {
                                        getColId: expect.any(Function),
                                        colId: 'col2',
                                        getColDef: expect.any(Function),
                                        isColumnFunc: expect.any(Function),
                                    },
                                    {
                                        editorValue: undefined,
                                        pendingValue: 'new2',
                                        sourceValue: 'old2',
                                        state: 'changed',
                                    },
                                ],
                            ]),
                        ],
                    ])
                )
            );
        });

        test('updates existing edits when update flag is true (append)', () => {
            editSvc!.isBatchEditing = jest.fn().mockReturnValue(true);
            const cells = [
                { colId: 'col2', rowIndex: 1, rowPinned: undefined, newValue: 'new2', state: 'changed' },
            ] as EditingCellPosition[];
            setEditingCells(beans, cells, { update: true });
            expect(editMap).toMatchObject(
                new Map([
                    [
                        rowNode2,
                        new Map([
                            [
                                {
                                    getColId: expect.any(Function),
                                    colId: 'col2',
                                    getColDef: expect.any(Function),
                                    isColumnFunc: expect.any(Function),
                                },
                                { editorValue: undefined, pendingValue: 'new2', sourceValue: 'old2', state: 'changed' },
                            ],
                        ]) as unknown as EditRow,
                    ],
                ])
            );
        });

        test('updates existing edits when update flag is true (replace)', () => {
            editSvc!.isBatchEditing = jest.fn().mockReturnValue(true);
            editMap!.set(
                rowNode1,
                new Map([
                    [
                        column1,
                        { editorValue: undefined, pendingValue: 'old1', sourceValue: UNEDITED, state: 'editing' },
                    ],
                ]) as EditRow
            );
            const cells = [
                { colId: 'col1', rowIndex: 0, rowPinned: undefined, newValue: 'new1', state: 'editing' },
            ] as EditingCellPosition[];
            setEditingCells(beans, cells, { update: true });
            expect(editMap).toMatchObject(
                new Map([
                    [
                        rowNode1,
                        new Map([
                            [
                                {
                                    getColId: expect.any(Function),
                                    colId: 'col1',
                                    getColDef: expect.any(Function),
                                    isColumnFunc: expect.any(Function),
                                },
                                { editorValue: undefined, pendingValue: 'new1', sourceValue: 'old1', state: 'editing' },
                            ],
                        ]) as unknown as EditRow,
                    ],
                ])
            );
        });
    });
});
