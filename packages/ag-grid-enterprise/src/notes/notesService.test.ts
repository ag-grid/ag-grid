import type { Mock } from 'vitest';

import type { AgColumn, BeanCollection, ColDef, IRowNode, Note } from 'ag-grid-community';

import { NotesService } from './notesService';

describe('NotesService', () => {
    let service: NotesService;
    let beans: BeanCollection;
    let rowNode: IRowNode;
    let colDef: ColDef;
    let column: AgColumn;
    let currentNote: Note | undefined;
    let cellCtrl: { showNote: Mock };
    let rowCtrl: { isFullWidth: Mock; refreshRow: Mock; rowNode: IRowNode };
    let fullWidthNotesFeature: { show: Mock };
    let fullWidthRowCtrl: { isFullWidth: Mock; getNotesFeature: Mock };

    beforeEach(() => {
        rowNode = {
            id: '1',
            data: { athlete: 'Usain Bolt' },
        } as unknown as IRowNode;

        colDef = {};
        currentNote = undefined;
        cellCtrl = { showNote: vi.fn() };
        rowCtrl = {
            isFullWidth: vi.fn(() => true),
            refreshRow: vi.fn(),
            rowNode,
        };
        fullWidthNotesFeature = { show: vi.fn() };
        fullWidthRowCtrl = {
            isFullWidth: vi.fn(() => true),
            getNotesFeature: vi.fn(() => fullWidthNotesFeature),
        };

        column = {
            colId: 'athlete',
            colDef,
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
                getCol: vi.fn(() => column),
            },
            visibleCols: {
                centerCols: [column],
                leftCols: [],
                rightCols: [],
                allCols: [column],
            },
            notesDataSvc: {
                hasDataSource: vi.fn(() => true),
                supportsFullWidthRows: vi.fn(() => true),
                getNote: vi.fn(() => currentNote),
                setNote: vi.fn(),
            },
            rowRenderer: {
                getCellCtrls: vi.fn(() => [cellCtrl]),
                getRowCtrlByNode: vi.fn(() => undefined),
                refreshCells: vi.fn(),
                getAllRowCtrls: vi.fn(() => []),
            },
        } as unknown as BeanCollection;

        service = new NotesService();
        (service as any).beans = beans;
        (service as any).gos = { get: vi.fn(() => false) };
    });

    it('resolves access flags for read-only notes', () => {
        currentNote = { text: 'Read only', readOnly: true };

        expect(service.getNoteAccess({ rowNode, column: 'athlete' })).toEqual(
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
        colDef.suppressNoteActions = true;

        expect(service.getNoteAccess({ rowNode, column: 'athlete' })).toEqual(
            expect.objectContaining({
                canView: true,
                isSuppressed: true,
                canEdit: false,
                canDelete: false,
            })
        );
        expect(service.getNote({ rowNode, column: 'athlete' })).toEqual(currentNote);
    });

    it('evaluates suppressNoteActions callbacks when resolving access', () => {
        colDef.suppressNoteActions = ({ data, column: callbackColumn, colDef: callbackColDef, node }) =>
            data === rowNode.data && callbackColumn === column && callbackColDef === colDef && node === rowNode;

        expect(service.getNoteAccess({ rowNode, column: 'athlete' })).toEqual(
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

        expect(service.showNote({ rowNode, column: 'athlete' }, true)).toBe(true);
        expect(cellCtrl.showNote).toHaveBeenCalledWith(true);
    });

    it('opens suppressed existing notes through the cell controller', () => {
        currentNote = { text: 'Suppressed note' };
        colDef.suppressNoteActions = true;

        expect(service.showNote({ rowNode, column: 'athlete' }, true)).toBe(true);
        expect(cellCtrl.showNote).toHaveBeenCalledWith(true);
    });

    it('resolves full-width note access without a column key', () => {
        currentNote = { text: 'Full width note' };

        expect(service.getNoteAccess({ rowNode, location: 'fullWidthRow' })).toEqual(
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

    it('opens full-width notes through the notes feature', () => {
        currentNote = { text: 'Full width note' };
        (beans.visibleCols as any).leftCols = [column];
        ((service as any).gos.get as Mock).mockReturnValue(true);
        (beans.rowRenderer!.getRowCtrlByNode as Mock).mockReturnValue(fullWidthRowCtrl);

        expect(service.showNote({ rowNode, location: 'fullWidthRow', pinned: 'left' }, true)).toBe(true);
        expect(fullWidthNotesFeature.show).toHaveBeenCalledWith({ pinned: 'left', focusEditor: true });
        expect(cellCtrl.showNote).not.toHaveBeenCalled();
    });

    it('strips pinned from full-width note params when embedFullWidthRows is off', () => {
        currentNote = { text: 'Full width note' };
        ((service as any).gos.get as Mock).mockReturnValue(false);

        const access = service.getNoteAccess({ rowNode, location: 'fullWidthRow', pinned: 'left' });

        expect(access?.params).toEqual({ rowNode, location: 'fullWidthRow', pinned: undefined });
    });

    it('does not expose full-width notes when the datasource does not support them', () => {
        (beans.notesDataSvc!.supportsFullWidthRows as Mock).mockReturnValue(false);

        expect(service.getNoteAccess({ rowNode, location: 'fullWidthRow' })).toBeUndefined();
        expect(service.showNote({ rowNode, location: 'fullWidthRow' }, true)).toBe(false);
    });

    it('does not write notes for suppressed cells via UI', () => {
        colDef.suppressNoteActions = true;

        service.setNote({
            rowNode,
            column: 'athlete',
            note: { text: 'Blocked note' },
            source: 'ui',
        } as any);

        expect(beans.notesDataSvc!.setNote).not.toHaveBeenCalled();
        expect(beans.rowRenderer!.refreshCells).not.toHaveBeenCalled();
    });

    it('allows API writes to suppressed cells', () => {
        colDef.suppressNoteActions = true;

        service.setNote({
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

        service.setNote({
            rowNode,
            column: 'athlete',
            note: { text: 'Updated' },
            source: 'ui',
        });
        service.setNote({
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

        service.setNote({
            rowNode,
            column: 'athlete',
            note: { text: 'Updated', readOnly: undefined },
        });
        service.setNote({
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
        const readOnlyNote = { text: 'Created as read only', readOnly: true } satisfies Note;

        service.setNote({
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

    it('refreshes matching full width rows through row refresh', () => {
        (beans.rowRenderer!.getAllRowCtrls as Mock).mockReturnValue([
            rowCtrl,
            { isFullWidth: () => false, rowNode, refreshRow: vi.fn() },
        ]);

        service.refreshNotes({ rowNodes: [rowNode], columns: ['athlete'] });

        expect(beans.rowRenderer!.refreshCells).toHaveBeenCalledWith({
            rowNodes: [rowNode],
            columns: ['athlete'],
            force: true,
            suppressFlash: true,
        });
        expect(rowCtrl.refreshRow).toHaveBeenCalledWith({ force: true, suppressFlash: true });
    });
});
