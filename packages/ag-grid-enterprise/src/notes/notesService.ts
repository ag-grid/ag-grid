import type {
    CellCtrl,
    CellNote,
    GetNoteParams,
    ICellNoteAccess,
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
    private hoverGeneration = 0;

    public postConstruct(): void {
        this.addManagedListeners(this.beans.eventSvc, {
            bodyScroll: () => this.resetActivePopupState(),
        });
    }

    public hasDataSource(): boolean {
        return !!this.beans.notesDataSvc?.hasDataSource();
    }

    public onDataSourceChanged(): void {
        this.resetActivePopupState(false);
        this.beans.rowRenderer.redrawRows();
    }

    public getHoverGeneration(): number {
        return this.hoverGeneration;
    }

    public createCellNotesFeature(ctrl: CellCtrl) {
        if (!this.hasDataSource()) {
            return undefined;
        }

        const feature = new AgCellNotesFeature(this.beans, ctrl, this);
        feature.initialise();
        return feature;
    }

    public createFullWidthRowNotesFeature(ctrl: RowCtrl) {
        if (!this.hasDataSource()) {
            return undefined;
        }

        const feature = new AgFullWidthRowNotesFeature(this.beans, ctrl, this);
        feature.initialise();
        return feature;
    }

    public getCellNoteAccess(params: GetNoteParams): ICellNoteAccess | undefined {
        const { colModel, notesDataSvc } = this.beans;

        if (!this.hasDataSource()) {
            return undefined;
        }

        const column = colModel.getCol(params.column);
        if (!column) {
            return undefined;
        }

        const note = notesDataSvc!.getNote({
            ...params,
            column,
        });
        const isSuppressed = column.isColumnFunc(params.rowNode, column.getColDef().suppressCellNoteActions ?? null);
        const isReadOnly = !!note?.readOnly;

        return {
            rowNode: params.rowNode,
            column,
            note,
            isReadOnly,
            isSuppressed,
            canView: !!note,
            canCreate: !note && !isSuppressed,
            canEdit: !!note && !isSuppressed && !isReadOnly,
            canDelete: !!note && !isSuppressed && !isReadOnly,
        };
    }

    public getCellNote(params: GetNoteParams): CellNote | undefined {
        return this.getCellNoteAccess(params)?.note;
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

    private resetActivePopupState(save = true): void {
        this.hoverGeneration++;
        this.activePopupOwner?.closeNotePopup(save);
    }

    public showCellNote(params: GetNoteParams, focusEditor = false): boolean {
        const access = this.getCellNoteAccess(params);

        if (!access || (!access.canView && !(focusEditor && access.canCreate))) {
            return false;
        }

        const { rowRenderer } = this.beans;
        const { column } = access;

        const cellCtrl = rowRenderer.getCellCtrls([params.rowNode], [column])[0];

        if (cellCtrl) {
            cellCtrl.showCellNote(focusEditor);
            return true;
        }

        const rowCtrl = rowRenderer.getRowCtrlByNode(params.rowNode);
        if (rowCtrl?.isFullWidth()) {
            rowCtrl.showFullWidthCellNote(column, focusEditor);
            return true;
        }

        return false;
    }

    public setCellNote(params: SetNoteParams | InternalSetNoteParams): void {
        const { notesDataSvc } = this.beans;

        if (!this.hasDataSource()) {
            return;
        }

        const access = this.getCellNoteAccess(params);
        if (!access) {
            return;
        }

        const { rowNode, note } = params;
        const previousNote = (params as InternalSetNoteParams).previousNote ?? access.note;
        const source = (params as InternalSetNoteParams).source ?? 'api';

        if ((!note && !previousNote) || previousNote?.readOnly) {
            return;
        }

        if (source === 'ui' && access.isSuppressed) {
            return;
        }

        if (source === 'api') {
            this.activePopupOwner?.closeNotePopup(false);
        }

        notesDataSvc!.setNote({
            rowNode,
            column: access.column,
            note,
        });

        this.refreshCellNotes({ rowNodes: [params.rowNode], columns: [access.column] });
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
