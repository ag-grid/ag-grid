import type { AgColumn, BeanCollection, CellNote, ColDef, IRowNode } from 'ag-grid-community';

import { NotesService } from './notesService';

describe('NotesService', () => {
    let service: NotesService;
    let beans: BeanCollection;
    let rowNode: IRowNode;
    let colDef: ColDef;
    let column: AgColumn;
    let currentNote: CellNote | undefined;
    let cellCtrl: { showCellNote: jest.Mock };
    let fullWidthRowCtrl: { isFullWidth: jest.Mock; showFullWidthCellNote: jest.Mock };

    beforeEach(() => {
        rowNode = {
            id: '1',
            data: { athlete: 'Usain Bolt' },
        } as unknown as IRowNode;

        colDef = {};
        currentNote = undefined;
        cellCtrl = { showCellNote: jest.fn() };
        fullWidthRowCtrl = {
            isFullWidth: jest.fn(() => true),
            showFullWidthCellNote: jest.fn(),
        };

        column = {
            getColId: () => 'athlete',
            getColDef: () => colDef,
            isColumnFunc: (_rowNode: IRowNode, value?: boolean | ((params: any) => boolean) | null) => {
                if (typeof value === 'boolean') {
                    return value;
                }

                if (typeof value === 'function') {
                    return value({
                        node: rowNode,
                        data: rowNode.data,
                        column,
                        colDef,
                        api: undefined,
                        context: undefined,
                    });
                }

                return false;
            },
        } as unknown as AgColumn;

        beans = {
            colModel: {
                getCol: jest.fn(() => column),
            },
            visibleCols: {
                centerCols: [column],
                leftCols: [],
                rightCols: [],
                allCols: [column],
            },
            notesDataSvc: {
                hasDataSource: jest.fn(() => true),
                getNote: jest.fn(() => currentNote),
                setNote: jest.fn(),
            },
            rowRenderer: {
                getCellCtrls: jest.fn(() => [cellCtrl]),
                getRowCtrlByNode: jest.fn(() => undefined),
                refreshCells: jest.fn(),
                getAllRowCtrls: jest.fn(() => []),
            },
        } as unknown as BeanCollection;

        service = new NotesService();
        (service as any).beans = beans;
    });

    it('resolves access flags for read-only notes', () => {
        currentNote = { text: 'Read only', readOnly: true };

        expect(service.getCellNoteAccess({ rowNode, column: 'athlete' })).toEqual(
            expect.objectContaining({
                note: currentNote,
                isReadOnly: true,
                isSuppressed: false,
                canView: true,
                canCreate: false,
                canEdit: false,
                canDelete: false,
            })
        );
    });

    it('allows suppressed notes to remain viewable', () => {
        currentNote = { text: 'Suppressed note' };
        colDef.suppressCellNoteActions = true;

        expect(service.getCellNoteAccess({ rowNode, column: 'athlete' })).toEqual(
            expect.objectContaining({
                canView: true,
                isSuppressed: true,
                canEdit: false,
                canDelete: false,
            })
        );
        expect(service.getCellNote({ rowNode, column: 'athlete' })).toEqual(currentNote);
    });

    it('evaluates suppressCellNoteActions callbacks when resolving access', () => {
        colDef.suppressCellNoteActions = ({ data, column: callbackColumn, colDef: callbackColDef, node }) =>
            data === rowNode.data && callbackColumn === column && callbackColDef === colDef && node === rowNode;

        expect(service.getCellNoteAccess({ rowNode, column: 'athlete' })).toEqual(
            expect.objectContaining({
                isSuppressed: true,
                canView: false,
                canCreate: false,
                canEdit: false,
                canDelete: false,
            })
        );
    });

    it('opens read-only notes through the cell controller', () => {
        currentNote = { text: 'Read only', readOnly: true };

        expect(service.showCellNote({ rowNode, column: 'athlete' }, true)).toBe(true);
        expect(cellCtrl.showCellNote).toHaveBeenCalledWith(true);
    });

    it('opens suppressed existing notes through the cell controller', () => {
        currentNote = { text: 'Suppressed note' };
        colDef.suppressCellNoteActions = true;

        expect(service.showCellNote({ rowNode, column: 'athlete' }, true)).toBe(true);
        expect(cellCtrl.showCellNote).toHaveBeenCalledWith(true);
    });

    it('resolves full-width note access without a column key', () => {
        currentNote = { text: 'Full width note' };

        expect(service.getCellNoteAccess({ rowNode, location: 'fullWidthRow' })).toEqual(
            expect.objectContaining({
                params: { rowNode, location: 'fullWidthRow' },
                note: currentNote,
                column,
                canView: true,
            })
        );
        expect(beans.notesDataSvc!.getNote).toHaveBeenCalledWith({
            rowNode,
            location: 'fullWidthRow',
        });
    });

    it('opens full-width notes through the row controller', () => {
        currentNote = { text: 'Full width note' };
        (beans.visibleCols as any).leftCols = [column];
        (beans.rowRenderer!.getRowCtrlByNode as jest.Mock).mockReturnValue(fullWidthRowCtrl);

        expect(service.showCellNote({ rowNode, location: 'fullWidthRow', pinned: 'left' }, true)).toBe(true);
        expect(fullWidthRowCtrl.showFullWidthCellNote).toHaveBeenCalledWith('left', true);
        expect(cellCtrl.showCellNote).not.toHaveBeenCalled();
    });

    it('does not write notes for suppressed cells via UI', () => {
        colDef.suppressCellNoteActions = true;

        service.setCellNote({
            rowNode,
            column: 'athlete',
            note: { text: 'Blocked note' },
            source: 'ui',
        } as any);

        expect(beans.notesDataSvc!.setNote).not.toHaveBeenCalled();
        expect(beans.rowRenderer!.refreshCells).not.toHaveBeenCalled();
    });

    it('allows API writes to suppressed cells', () => {
        colDef.suppressCellNoteActions = true;

        service.setCellNote({
            rowNode,
            column: 'athlete',
            note: { text: 'API note' },
        });

        expect(beans.notesDataSvc!.setNote).toHaveBeenCalledWith({
            rowNode,
            column,
            note: { text: 'API note' },
        });
        expect(beans.rowRenderer!.refreshCells).toHaveBeenCalled();
    });

    it('does not update or remove existing read-only notes through the built-in UI', () => {
        currentNote = { text: 'Locked', readOnly: true };

        service.setCellNote({
            rowNode,
            column: 'athlete',
            note: { text: 'Updated' },
            source: 'ui',
        });
        service.setCellNote({
            rowNode,
            column: 'athlete',
            note: undefined,
            source: 'ui',
        });

        expect(beans.notesDataSvc!.setNote).not.toHaveBeenCalled();
        expect(beans.rowRenderer!.refreshCells).not.toHaveBeenCalled();
    });

    it('allows API updates and removals for existing read-only notes', () => {
        currentNote = { text: 'Locked', readOnly: true };

        service.setCellNote({
            rowNode,
            column: 'athlete',
            note: { text: 'Updated', readOnly: undefined },
        });
        service.setCellNote({
            rowNode,
            column: 'athlete',
            note: undefined,
        });

        expect(beans.notesDataSvc!.setNote).toHaveBeenNthCalledWith(1, {
            rowNode,
            column,
            note: { text: 'Updated', readOnly: undefined },
        });
        expect(beans.notesDataSvc!.setNote).toHaveBeenNthCalledWith(2, {
            rowNode,
            column,
            note: undefined,
        });
        expect(beans.rowRenderer!.refreshCells).toHaveBeenCalledTimes(2);
    });

    it('can create a new read-only note when the cell is not suppressed', () => {
        const readOnlyNote = { text: 'Created as read only', readOnly: true } satisfies CellNote;

        service.setCellNote({
            rowNode,
            column: 'athlete',
            note: readOnlyNote,
        });

        expect(beans.notesDataSvc!.setNote).toHaveBeenCalledWith({
            rowNode,
            column,
            note: readOnlyNote,
        });
        expect(beans.rowRenderer!.refreshCells).toHaveBeenCalled();
    });
});
