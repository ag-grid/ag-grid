import type {
    CellCtrl,
    CellNote,
    GetNoteParams,
    INotesService,
    NamedBean,
    RefreshCellNotesParams,
    RowCtrl,
    SetNoteParams,
} from 'ag-grid-community';
import { BeanStub } from 'ag-grid-community';

import { AgCellNotesFeature, AgFullWidthRowNotesFeature } from './agCellNotesFeature';
import type { ICellNotePopupOwner, INotesFeatureSupport, InternalSetNoteParams } from './notesShared';

export class NotesService extends BeanStub implements INotesService, INotesFeatureSupport, NamedBean {
    public readonly beanName = 'notesSvc' as const;

    private activePopupOwner?: ICellNotePopupOwner;

    public createCellNotesFeature(ctrl: CellCtrl) {
        if (!this.beans.notesDataSvc?.hasDataSource()) {
            return undefined;
        }

        const feature = new AgCellNotesFeature(this.beans, ctrl, this);
        feature.initialise();
        return feature;
    }

    public createFullWidthRowNotesFeature(ctrl: RowCtrl) {
        if (!this.beans.notesDataSvc?.hasDataSource()) {
            return undefined;
        }

        const feature = new AgFullWidthRowNotesFeature(this.beans, ctrl, this);
        feature.initialise();
        return feature;
    }

    public getCellNote(params: GetNoteParams): CellNote | undefined {
        return this.beans.notesDataSvc?.getNote(params);
    }

    public replaceActivePopupOwner(owner: ICellNotePopupOwner): ICellNotePopupOwner | undefined {
        const previousOwner = this.activePopupOwner;

        if (previousOwner === owner) {
            return undefined;
        }

        this.activePopupOwner = owner;
        return previousOwner;
    }

    public clearActivePopupOwner(owner: ICellNotePopupOwner): void {
        if (this.activePopupOwner === owner) {
            this.activePopupOwner = undefined;
        }
    }

    public showCellNoteEditor(params: GetNoteParams): void {
        const { rowRenderer } = this.beans;
        const cellCtrl = rowRenderer.getCellCtrls([params.rowNode], [params.column])[0];

        if (cellCtrl) {
            cellCtrl.showCellNote(true);
            return;
        }

        const rowCtrl = rowRenderer.getRowCtrlByNode(params.rowNode);
        if (rowCtrl?.isFullWidth()) {
            rowCtrl.showFullWidthCellNote(params.column, true);
        }
    }

    public setCellNote(params: SetNoteParams): void;
    public setCellNote(params: InternalSetNoteParams): void;
    public setCellNote(params: SetNoteParams | InternalSetNoteParams): void {
        const dataSvc = this.beans.notesDataSvc;
        if (!dataSvc?.hasDataSource()) {
            return;
        }

        const previousNote = ('previousNote' in params ? params.previousNote : undefined) ?? dataSvc.getNote(params);
        const note = params.note;
        const source = ('source' in params ? params.source : undefined) ?? 'api';

        if (!note && !previousNote) {
            return;
        }

        if (source === 'api') {
            this.activePopupOwner?.closeNotePopup(false);
        }

        dataSvc.setNote({
            rowNode: params.rowNode,
            column: params.column,
            note,
        });

        this.refreshCellNotes({ rowNodes: [params.rowNode], columns: [params.column] });
    }

    public removeCellNote(params: GetNoteParams): void {
        this.setCellNote({
            ...params,
            note: undefined,
            previousNote: this.beans.notesDataSvc?.getNote(params),
            source: 'api',
        });
    }

    public refreshCellNotes(params: RefreshCellNotesParams = {}): void {
        const { rowRenderer } = this.beans;
        rowRenderer.refreshCells({
            rowNodes: params.rowNodes,
            columns: params.columns,
            force: true,
            suppressFlash: true,
        });

        const rowNodes = params.rowNodes;
        const rowNodeSet = rowNodes ? new Set(rowNodes) : undefined;
        for (const rowCtrl of rowRenderer.getAllRowCtrls()) {
            if (!rowCtrl.isFullWidth()) {
                continue;
            }
            if (rowNodeSet && !rowNodeSet.has(rowCtrl.rowNode)) {
                continue;
            }
            rowCtrl.refreshFullWidth();
        }
    }
}
