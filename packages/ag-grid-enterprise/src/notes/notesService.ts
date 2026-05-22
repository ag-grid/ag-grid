import type {
    CellCtrl,
    GetNoteParams,
    INoteAccess,
    INotesService,
    NamedBean,
    Note,
    RefreshNotesParams,
    RowCtrl,
    SetNoteParams,
} from 'ag-grid-community';
import { BeanStub } from 'ag-grid-community';

import { AgFullWidthRowNotesFeature, AgNotesFeature } from './agNotesFeature';
import type { INotePopupOwner, INotesFeatureSupport, InternalSetNoteParams } from './notesShared';
import { isFullWidthRowNoteParams } from './notesShared';

export class NotesService extends BeanStub implements INotesService, INotesFeatureSupport, NamedBean {
    public readonly beanName = 'notesSvc' as const;

    private activePopupOwner?: INotePopupOwner;
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

    public createNotesFeature(ctrl: CellCtrl) {
        if (!this.hasDataSource()) {
            return undefined;
        }

        const feature = new AgNotesFeature(this.beans, ctrl, this);
        feature.initialise();
        return feature;
    }

    public createFullWidthNotesFeature(ctrl: RowCtrl) {
        if (!this.hasDataSource() || !this.beans.notesDataSvc?.supportsFullWidthRows()) {
            return undefined;
        }

        const feature = new AgFullWidthRowNotesFeature(this.beans, ctrl, this);
        feature.initialise();
        return feature;
    }

    public getNoteAccess(params: GetNoteParams): INoteAccess | undefined {
        const { colModel, notesDataSvc } = this.beans;

        if (!this.hasDataSource()) {
            return undefined;
        }

        if (isFullWidthRowNoteParams(params) && !notesDataSvc!.supportsFullWidthRows()) {
            return undefined;
        }

        if (isFullWidthRowNoteParams(params) && params.pinned && !this.gos.get('embedFullWidthRows')) {
            params = { ...params, pinned: undefined };
        }

        const column = isFullWidthRowNoteParams(params)
            ? this.getColumnForFullWidth(params.pinned)
            : colModel.getCol(params.column);
        const note = notesDataSvc!.getNote(params);

        if (!column) {
            return undefined;
        }

        const isSuppressed = column.isColumnFunc(params.rowNode, column.colDef.suppressNoteActions ?? null);
        const isReadOnly = !!note?.readOnly;

        return {
            params,
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

    public getNote(params: GetNoteParams): Note | undefined {
        return this.getNoteAccess(params)?.note;
    }

    public replaceActivePopupOwner(owner: INotePopupOwner): INotePopupOwner | undefined {
        const previousOwner = this.activePopupOwner;

        if (previousOwner === owner) {
            return undefined;
        }

        this.activePopupOwner = owner;
        return previousOwner;
    }

    public clearActivePopupOwner(owner: INotePopupOwner): void {
        if (this.activePopupOwner === owner) {
            this.activePopupOwner = undefined;
        }
    }

    private resetActivePopupState(save = true): void {
        this.hoverGeneration++;
        this.activePopupOwner?.closeNotePopup(save);
    }

    public showNote(params: GetNoteParams, focusEditor = false): boolean {
        const access = this.getNoteAccess(params);

        if (!access || (!access.canView && !(focusEditor && access.canCreate))) {
            return false;
        }

        const { rowRenderer } = this.beans;

        if (isFullWidthRowNoteParams(access.params)) {
            const rowCtrl = rowRenderer.getRowCtrlByNode(params.rowNode);
            const feature = rowCtrl?.getNotesFeature();

            if (!feature) {
                return false;
            }

            feature.show({ pinned: access.params.pinned, focusEditor });
            return true;
        }

        const cellCtrl = rowRenderer.getCellCtrls([params.rowNode], [access.column])[0];

        if (cellCtrl) {
            cellCtrl.showNote(focusEditor);
            return true;
        }

        return false;
    }

    public setNote(params: SetNoteParams | InternalSetNoteParams): void {
        const { notesDataSvc } = this.beans;

        if (!this.hasDataSource()) {
            return;
        }

        const access = this.getNoteAccess(params);
        if (!access) {
            return;
        }

        const { note } = params;
        const previousNote = (params as InternalSetNoteParams).previousNote ?? access.note;
        const source = (params as InternalSetNoteParams).source ?? 'api';

        if (!note && !previousNote) {
            return;
        }

        if (source === 'ui' && (access.isSuppressed || previousNote?.readOnly)) {
            return;
        }

        if (source === 'api') {
            this.activePopupOwner?.closeNotePopup(false);
        }

        notesDataSvc!.setNote(
            isFullWidthRowNoteParams(access.params)
                ? { ...access.params, note }
                : { rowNode: access.rowNode, column: access.column, note }
        );

        this.refreshNotes(
            isFullWidthRowNoteParams(access.params)
                ? { rowNodes: [params.rowNode] }
                : { rowNodes: [params.rowNode], columns: [access.column] }
        );
    }

    public refreshNotes(params: RefreshNotesParams = {}): void {
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
            rowCtrl.refreshRow({ force: true, suppressFlash: true });
        }
    }

    private getColumnForFullWidth(pinned?: 'left' | 'right') {
        const { visibleCols } = this.beans;

        switch (pinned) {
            case 'left':
                return visibleCols.leftCols[0];
            case 'right':
                return visibleCols.rightCols[0];
            default:
                return visibleCols.centerCols[0] ?? visibleCols.allCols[0];
        }
    }
}
