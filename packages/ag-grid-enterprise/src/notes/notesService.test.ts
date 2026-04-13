import { vi } from 'vitest';

import type { AgColumn, BeanCollection, CellNote, ColDef, IRowNode } from 'ag-grid-community';

import { NotesService } from './notesService';

describe('NotesService', () => {
    let service: NotesService;
    let beans: BeanCollection;
    let rowNode: IRowNode;
    let colDef: ColDef;
    let column: AgColumn;
    let currentNote: CellNote | undefined;
    let cellCtrl: { showCellNote: ReturnType<typeof vi.fn> };
    let fullWidthNotesFeature: { show: ReturnType<typeof vi.fn> };
    let fullWidthRowCtrl: { isFullWidth: ReturnType<typeof vi.fn>; getNotesFeature: ReturnType<typeof vi.fn> };

    beforeEach(() => {
        rowNode = {
            id: '1',
            data: { athlete: 'Usain Bolt' },
        } as unknown as IRowNode;

        colDef = {};
        currentNote = undefined;
        cellCtrl = { showCellNote: vi.fn() };
        fullWidthNotesFeature = { show: vi.fn() };
        fullWidthRowCtrl = {
            isFullWidth: vi.fn(() => true),
            getNotesFeature: vi.fn(() => fullWidthNotesFeature),
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
        (colDef as any).suppressCellNoteActions = true;

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
        (colDef as any).suppressCellNoteActions = ({
            data,
            column: callbackColumn,
            colDef: callbackColDef,
            node,
        }: any) => data === rowNode.data && callbackColumn === column && callbackColDef === colDef && node === rowNode;

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
        (colDef as any).suppressCellNoteActions = true;

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
        expect(vi.mocked(beans.notesDataSvc!.getNote)).toHaveBeenCalledWith({
            rowNode,
            location: 'fullWidthRow',
        });
    });

    it('opens full-width notes through the notes feature', () => {
        currentNote = { text: 'Full width note' };
        (beans.visibleCols as any).leftCols = [column];
        vi.mocked(beans.rowRenderer!.getRowCtrlByNode).mockReturnValue(fullWidthRowCtrl as any);
        vi.mocked((service as any).gos.get).mockReturnValue(true);

        expect(service.showCellNote({ rowNode, location: 'fullWidthRow', pinned: 'left' }, true)).toBe(true);
        expect(fullWidthNotesFeature.show).toHaveBeenCalledWith({ pinned: 'left', focusEditor: true });
        expect(cellCtrl.showCellNote).not.toHaveBeenCalled();
    });

    it('strips pinned from full-width note params when embedFullWidthRows is off', () => {
        currentNote = { text: 'Full width note' };
        vi.mocked((service as any).gos.get).mockReturnValue(false);

        const access = service.getCellNoteAccess({ rowNode, location: 'fullWidthRow', pinned: 'left' });

        expect(access).toEqual(
            expect.objectContaining({
                params: { rowNode, location: 'fullWidthRow', pinned: undefined },
            })
        );
    });

    it('does not write notes for suppressed cells via UI', () => {
        (colDef as any).suppressCellNoteActions = true;

        service.setCellNote({
            rowNode,
            column: 'athlete',
            note: { text: 'Blocked note' },
            source: 'ui',
        } as any);

        expect(vi.mocked(beans.notesDataSvc!.setNote)).not.toHaveBeenCalled();
        expect(vi.mocked(beans.rowRenderer!.refreshCells)).not.toHaveBeenCalled();
    });

    it('allows API writes to suppressed cells', () => {
        (colDef as any).suppressCellNoteActions = true;

        service.setCellNote({
            rowNode,
            column: 'athlete',
            note: { text: 'API note' },
        });

        expect(vi.mocked(beans.notesDataSvc!.setNote)).toHaveBeenCalledWith({
            rowNode,
            column,
            note: { text: 'API note' },
        });
        expect(vi.mocked(beans.rowRenderer!.refreshCells)).toHaveBeenCalled();
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

        expect(vi.mocked(beans.notesDataSvc!.setNote)).not.toHaveBeenCalled();
        expect(vi.mocked(beans.rowRenderer!.refreshCells)).not.toHaveBeenCalled();
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

        expect(vi.mocked(beans.notesDataSvc!.setNote)).toHaveBeenNthCalledWith(1, {
            rowNode,
            column,
            note: { text: 'Updated', readOnly: undefined },
        });
        expect(vi.mocked(beans.notesDataSvc!.setNote)).toHaveBeenNthCalledWith(2, {
            rowNode,
            column,
            note: undefined,
        });
        expect(vi.mocked(beans.rowRenderer!.refreshCells)).toHaveBeenCalledTimes(2);
    });

    it('can create a new read-only note when the cell is not suppressed', () => {
        const readOnlyNote = { text: 'Created as read only', readOnly: true } satisfies CellNote;

        service.setCellNote({
            rowNode,
            column: 'athlete',
            note: readOnlyNote,
        });

        expect(vi.mocked(beans.notesDataSvc!.setNote)).toHaveBeenCalledWith({
            rowNode,
            column,
            note: readOnlyNote,
        });
        expect(vi.mocked(beans.rowRenderer!.refreshCells)).toHaveBeenCalled();
    });
});
