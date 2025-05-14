import { KeyCode } from '../constants/keyCode';
import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import { PopupEditorWrapper } from '../edit/cellEditors/popupEditorWrapper';
import type { AgColumn } from '../entities/agColumn';
import type { ICellEditorParams } from '../interfaces/iCellEditor';
import type { Column } from '../interfaces/iColumn';
import type { IRowNode } from '../interfaces/iRowNode';
import type { CellPosition } from '../main-umd-noStyles';
import { CellCtrl } from '../rendering/cell/cellCtrl';
import type { CellUpdate, EditingModelService } from './editModelService';
import { _createUpdates } from './editModelService';
import type { BaseEditStrategy } from './strategy/baseEditStrategy';
import { _addStopEditingWhenGridLosesFocus, _resolveCellController } from './utils/controllers';
import { _refreshEditorOnColDefChanged, _syncModelFromEditor, _syncModelsFromEditors } from './utils/editors';

export class EditingService extends BeanStub implements NamedBean {
    beanName = 'editingSvc' as const;
    private editModel?: EditingModelService;
    private editStrategy?: BaseEditStrategy;

    postConstruct(): void {
        this.editModel = this.beans.editingModelSvc;

        this.addManagedPropertyListener(
            'editType',
            (({ currentValue }: any) => {
                this.stopAllEditing(true, 'api');

                // will re-create if different
                this.createEditStrategy(currentValue);
            }).bind(this)
        );
        this.addManagedPropertyListener(
            'batchEdit',
            (() => {
                this.stopAllEditing(true, 'api');
            }).bind(this)
        );
    }

    private createEditStrategy(editType?: string): BaseEditStrategy {
        const { beans, gos, editStrategy } = this;

        const strategyName: any = editType ?? gos.get('editType') ?? 'singleCell';

        if (editStrategy) {
            if (editStrategy.beanName === strategyName) {
                return editStrategy;
            }
            this.destroyEditStrategy();
        }

        return (this.editStrategy = this.createOptionalManagedBean(
            beans.registry.createDynamicBean<BaseEditStrategy>(strategyName, true)
        )!);
    }

    private destroyEditStrategy(): void {
        if (!this.editStrategy) {
            return;
        }

        this.editStrategy.destroy();

        this.destroyBean(this.editStrategy);
        this.editStrategy = undefined;
    }

    shouldStartEditing(
        rowNode?: IRowNode,
        column?: Column,
        key?: string | null,
        event?: KeyboardEvent | MouseEvent | null,
        cellStartedEdit?: boolean | null,
        source: 'api' | 'ui' = 'ui'
    ): boolean | null {
        return this.editStrategy?.shouldStartEditing?.(rowNode, column, key, event, cellStartedEdit, source) ?? null;
    }

    shouldStopEditing(
        rowNode?: IRowNode,
        column?: Column,
        key?: string | null | undefined,
        event?: KeyboardEvent | MouseEvent | null | undefined,
        source: 'api' | 'ui' = 'ui'
    ): boolean | null {
        return this.editStrategy?.shouldStopEditing?.(rowNode, column, key, event, source) ?? null;
    }

    shouldCancelEditing(
        rowNode?: IRowNode,
        column?: Column,
        key?: string | null | undefined,
        event?: KeyboardEvent | MouseEvent | null | undefined,
        source: 'api' | 'ui' = 'ui'
    ): boolean | null {
        return this.editStrategy?.shouldCancelEditing?.(rowNode, column, key, event, source) ?? null;
    }

    public isEditing(rowNode?: IRowNode | null, column?: Column | null): boolean {
        return this.editModel?.hasPending?.(rowNode, column) ?? false;
    }

    /** @return whether to prevent default on event */
    public startEditing(
        rowNode: IRowNode,
        column: Column,
        key: string | null = null,
        cellStartedEdit: boolean | null = true,
        event: KeyboardEvent | MouseEvent | null = null,
        source: 'api' | 'ui' = 'ui'
    ): boolean {
        if (!column.isCellEditable(rowNode)) {
            return false;
        }

        if (this.isEditing(rowNode, column)) {
            return true;
        }

        this.editStrategy = this.createEditStrategy();

        // because of async in React, the cellComp may not be set yet, if no cellComp then we are
        // yet to initialise the cell, so we re-schedule this operation for when celLComp is attached
        const cellCtrl = _resolveCellController(this.beans, { rowNode, column })!;
        if (!cellCtrl.comp) {
            cellCtrl.onCompAttachedFuncs.push(() => {
                this.startEditing(rowNode, column, key, cellStartedEdit, event, source);
            });
            return true;
        }

        const res = this.shouldStartEditing?.(rowNode, column, key, event, cellStartedEdit, source);

        if (res === false && source !== 'api') {
            if (this.isEditing()) {
                this.stopEditing();
            }
            return false;
        }

        if (this.editStrategy.shouldStopEditing(rowNode, column, undefined, undefined, source)) {
            this.stopEditing(undefined, undefined, undefined, undefined, undefined, source);
        }

        return this.editStrategy!.startEditing?.(rowNode, column, key, event, source);
    }

    /**
     * Ends the Cell Editing
     * @param cancel `True` if the edit process is being canceled.
     * @returns `True` if the value of the `GridCell` has been updated, otherwise `False`.
     */
    public stopEditing(
        rowNode?: IRowNode,
        column?: Column,
        key?: string,
        event?: KeyboardEvent | MouseEvent | null,
        cancel: boolean = false,
        source: 'api' | 'ui' = 'ui',
        suppressNavigateAfterEdit: boolean = false,
        shiftKey: boolean = false
    ): boolean {
        if (!this.isEditing()) {
            return false;
        }

        const cellCtrl = _resolveCellController(this.beans, { rowNode, column });
        if (cellCtrl) {
            cellCtrl.onEditorAttachedFuncs = [];
        }

        this.editStrategy = this.createEditStrategy();

        _syncModelsFromEditors(this.beans);

        const updates = _createUpdates(this.beans);

        let res = false;

        if (!cancel && this.shouldStopEditing?.(rowNode, column, key, event, source)) {
            this.processUpdates(updates, false);

            this.editStrategy?.stopEditing?.() ?? false;

            res = true;
        } else if (cancel && this.shouldCancelEditing?.(rowNode, column, key, event, source)) {
            this.processUpdates(updates, true);

            this.editStrategy?.stopEditing?.() ?? false;
        }

        if (!suppressNavigateAfterEdit && cellCtrl) {
            this.navigateAfterEdit(shiftKey, cellCtrl.cellPosition);
        }

        return res;
    }

    private navigateAfterEdit(shiftKey: boolean, cellPosition: CellPosition): void {
        const enterNavigatesVerticallyAfterEdit = this.gos.get('enterNavigatesVerticallyAfterEdit');

        if (enterNavigatesVerticallyAfterEdit) {
            const key = shiftKey ? KeyCode.UP : KeyCode.DOWN;
            this.beans.navigation?.navigateToNextCell(null, key, cellPosition, false);
        }
    }

    private processUpdates(updates: CellUpdate[], cancel: boolean): void {
        updates.forEach(({ rowNode, column, newValue, oldValue }) => {
            const cellCtrl = _resolveCellController(this.beans, { rowNode, column });
            if (!cellCtrl) {
                return;
            }

            const valueChanged = newValue !== oldValue;
            if (!cancel && valueChanged) {
                // we suppressRefreshCell because the call to rowNode.setDataValue() results in change detection
                // getting triggered, which results in all cells getting refreshed. we do not want this refresh
                // to happen on this call as we want to call it explicitly below. otherwise refresh gets called twice.
                // if we only did this refresh (and not the one below) then the cell would flash and not be forced.
                cellCtrl.suppressRefreshCell = true;
                rowNode.setDataValue(column.getColId(), newValue, 'edit');
                cellCtrl.suppressRefreshCell = false;
            }

            this.beans.eventSvc.dispatchEvent({
                ...cellCtrl.createEvent(null, 'cellEditingStopped'),
                oldValue,
                newValue,
                value: newValue,
                valueChanged,
            });
        });
    }

    public getEditingCellPositions(): CellPosition[] {
        return this.beans.editingSvc?.editModel?.getPendingCellPositions() ?? [];
    }

    public stopAllEditing(cancel: boolean = false, source: 'api' | 'ui' = 'ui'): void {
        if (this.isEditing()) {
            this.stopEditing(undefined, undefined, undefined, undefined, cancel, source);
        }
    }

    public isCellEditable(column: AgColumn, rowNode: IRowNode): boolean {
        if (rowNode.group) {
            // This is a group - it could be a tree group or a grouping group...
            if (this.gos.get('treeData')) {
                // tree - allow editing of groups with data by default.
                // Allow editing filler nodes (node without data) only if enableGroupEdit is true.
                if (!rowNode.data && !this.gos.get('enableGroupEdit')) {
                    return false;
                }
            } else {
                // grouping - allow editing of groups if the user has enableGroupEdit option enabled
                if (!this.gos.get('enableGroupEdit')) {
                    return false;
                }
            }
        }

        return column.isColumnFunc(rowNode, column.colDef.editable);
    }

    moveToNextCell(previous: CellCtrl, backwards: boolean, event?: KeyboardEvent): boolean | null {
        let editing =
            previous instanceof CellCtrl
                ? this.isEditing(previous.rowCtrl.rowNode, previous.column)
                : this.isEditing(previous);

        // if cell is not editing, there is still chance row is editing if it's Full Row Editing
        if (!editing && previous instanceof CellCtrl) {
            const cell = previous as CellCtrl;
            const row = cell.rowCtrl;
            if (row) {
                editing = this.isEditing(row.rowNode);
            }
        }

        let res: boolean | null | undefined;

        if (editing) {
            // if we are editing, we know it's not a Full Width Row (RowComp)
            res = this.editStrategy?.moveToNextEditingCell(previous, backwards, event);
        }

        if (res === null) {
            return res;
        }

        // if a cell wasn't found, it's possible that focus was moved to the header
        res = res || !!this.beans.focusSvc.focusedHeader;

        if (res === false) {
            // not a header and not the table
            this.stopAllEditing();
        }

        return res;
    }

    public getCellDataValue(rowNode?: IRowNode | null, column?: Column | null): any {
        if (!rowNode || !column) {
            return undefined;
        }

        return this.editModel?.getPendingUpdate(rowNode!, column!);
    }

    public addStopEditingWhenGridLosesFocus(viewports: HTMLElement[]): void {
        // TODO: find a better place for this
        _addStopEditingWhenGridLosesFocus(this, this.beans, viewports);
    }

    public createPopupEditorWrapper(params: ICellEditorParams): PopupEditorWrapper {
        // TODO: find a better place for this
        return new PopupEditorWrapper(params);
    }

    setDataValue(rowNode: IRowNode, column: string | Column<any>, newValue: any, eventSource?: string): boolean | null {
        if (typeof column === 'string') {
            column = this.beans.colModel.getCol(column)!;
        }
        return _syncModelFromEditor(this.beans, rowNode, column, newValue, eventSource);
    }

    public handleColDefChanged(cellCtrl: CellCtrl): void {
        _refreshEditorOnColDefChanged(this.beans, cellCtrl);
    }

    public override destroy(): void {
        this.destroyEditStrategy();
        this.editModel?.destroy();
        super.destroy();
    }
}
