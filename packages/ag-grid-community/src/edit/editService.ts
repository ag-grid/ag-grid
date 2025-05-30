import { KeyCode } from '../constants/keyCode';
import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { AgColumn } from '../entities/agColumn';
import type { EditingCellPosition, ICellEditorParams } from '../interfaces/iCellEditor';
import type { Column } from '../interfaces/iColumn';
import type { IRowNode } from '../interfaces/iRowNode';
import type { CellPosition } from '../main-umd-noStyles';
import { CellCtrl } from '../rendering/cell/cellCtrl';
import { _createCellEvent } from '../rendering/cell/cellEvent';
import type { RowCtrl } from '../rendering/row/rowCtrl';
import { PopupEditorWrapper } from './cellEditors/popupEditorWrapper';
import type { CellIdPositions, EditModelService, PendingUpdates } from './editModelService';
import { _createUpdates } from './editModelService';
import type { BaseEditStrategy } from './strategy/baseEditStrategy';
import { _addStopEditingWhenGridLosesFocus, _resolveCellController } from './utils/controllers';
import {
    _refreshEditorOnColDefChanged,
    _syncModelFromEditor,
    _syncModelsFromEditors,
    _valuesDiffer,
} from './utils/editors';
import { _refreshPendingCells } from './utils/refresh';

export class EditService extends BeanStub implements NamedBean {
    beanName = 'editSvc' as const;
    private model?: EditModelService;
    public strategy?: BaseEditStrategy;
    public batchEditing: boolean;

    postConstruct(): void {
        this.model = this.beans.editModelSvc;

        this.addManagedPropertyListener(
            'editType',
            (({ currentValue }: any) => {
                this.stopEditing(undefined, undefined, undefined, undefined, true, 'api');

                // will re-create if different
                this.createStrategy(currentValue);
            }).bind(this)
        );

        this.addManagedEventListeners({
            columnPinned: _refreshPendingCells(this.beans, 'columnPinned'),
            columnVisible: _refreshPendingCells(this.beans, 'columnVisible'),
            columnRowGroupChanged: _refreshPendingCells(this.beans, 'columnRowGroupChanged'),
            rowGroupOpened: _refreshPendingCells(this.beans, 'rowGroupOpened'),
            pinnedRowsChanged: _refreshPendingCells(this.beans, 'pinnedRowsChanged'),
            displayedRowsChanged: _refreshPendingCells(this.beans, 'displayedRowsChanged'),
        });
    }

    public enableBatchEditing(): void {
        this.batchEditing = true;
        this.stopEditing(undefined, undefined, undefined, undefined, true, 'api');
    }

    public disableBatchEditing(): void {
        this.stopEditing(undefined, undefined, undefined, undefined, true, 'api');
        this.batchEditing = false;
    }

    private createStrategy(editType?: string): BaseEditStrategy {
        const { beans, gos, strategy: editStrategy } = this;

        const strategyName: any = editType ?? gos.get('editType') ?? 'singleCell';

        if (editStrategy) {
            if (editStrategy.beanName === strategyName) {
                return editStrategy;
            }
            this.destroyStrategy();
        }

        return (this.strategy = this.createOptionalManagedBean(
            beans.registry.createDynamicBean<BaseEditStrategy>(strategyName, true)
        )!);
    }

    private destroyStrategy(): void {
        if (!this.strategy) {
            return;
        }

        this.strategy.destroy();

        this.destroyBean(this.strategy);
        this.strategy = undefined;
    }

    shouldStartEditing(
        rowNode?: IRowNode,
        column?: Column,
        key?: string | null,
        event?: KeyboardEvent | MouseEvent | null,
        cellStartedEdit?: boolean | null,
        source: 'api' | 'ui' = 'ui'
    ): boolean | null {
        return this.strategy?.shouldStartEditing?.(rowNode, column, key, event, cellStartedEdit, source) ?? null;
    }

    shouldStopEditing(
        rowNode?: IRowNode,
        column?: Column,
        key?: string | null | undefined,
        event?: KeyboardEvent | MouseEvent | null | undefined,
        source: 'api' | 'ui' = 'ui'
    ): boolean | null {
        return this.strategy?.shouldStopEditing?.(rowNode, column, key, event, source) ?? null;
    }

    shouldCancelEditing(
        rowNode?: IRowNode,
        column?: Column,
        key?: string | null | undefined,
        event?: KeyboardEvent | MouseEvent | null | undefined,
        source: 'api' | 'ui' = 'ui'
    ): boolean | null {
        return this.strategy?.shouldCancelEditing?.(rowNode, column, key, event, source) ?? null;
    }

    public isEditing(rowNode?: IRowNode | null, column?: Column | null): boolean {
        return this.model?.hasPending?.(rowNode, column) ?? false;
    }

    /** @return whether to prevent default on event */
    public startEditing(
        rowNode: IRowNode,
        column: Column,
        key: string | null = null,
        cellStartedEdit: boolean | null = true,
        event: KeyboardEvent | MouseEvent | null = null,
        source: 'api' | 'ui' = 'ui',
        silent: boolean = false
    ): boolean {
        this.strategy ??= this.createStrategy();

        if (!this.isCellEditable(rowNode, column, 'api')) {
            return false;
        }

        // because of async in React, the cellComp may not be set yet, if no cellComp then we are
        // yet to initialise the cell, so we re-schedule this operation for when celLComp is attached
        const cellCtrl = _resolveCellController(this.beans, { rowNode, column })!;
        if (!cellCtrl.comp) {
            cellCtrl.onCompAttachedFuncs.push(() => {
                this.startEditing(rowNode, column, key, cellStartedEdit, event, source, silent);
            });
            return true;
        }

        const res = this.shouldStartEditing?.(rowNode, column, key, event, cellStartedEdit, source);

        if (res === false && source !== 'api') {
            if (this.isEditing(rowNode, column)) {
                this.stopEditing();
            }
            return false;
        }

        if (!this.batchEditing && this.strategy.shouldStopEditing(rowNode, column, undefined, undefined, source)) {
            this.stopEditing(undefined, undefined, undefined, undefined, undefined, source);
        }

        const result = this.strategy!.startEditing?.(rowNode, column, key, event, source, silent);

        this.strategy.updateCells(this.model?.getPendingUpdates());

        return result;
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
        if (!this.isEditing() || !this.strategy) {
            return false;
        }

        const cellCtrl = _resolveCellController(this.beans, { rowNode, column });
        if (cellCtrl) {
            cellCtrl.onEditorAttachedFuncs = [];
        }

        _syncModelsFromEditors(this.beans);

        const updates = _createUpdates(this.beans);
        const pendingUpdates = this.model?.getPendingUpdates();

        let res = false;
        let updateCells = false;

        if (!cancel && this.shouldStopEditing?.(rowNode, column, key, event, source)) {
            this.strategy?.stopEditing?.() ?? false;

            this.processUpdates(updates, false);

            res = true;
            updateCells = true;
        } else if (cancel && this.shouldCancelEditing?.(rowNode, column, key, event, source)) {
            this.strategy?.stopEditing?.() ?? false;

            this.processUpdates(updates, true);

            updateCells = true;
        }

        if (!suppressNavigateAfterEdit && cellCtrl) {
            this.navigateAfterEdit(shiftKey, cellCtrl.cellPosition);
        }

        if (updateCells) {
            this.strategy.updateCells(pendingUpdates, false, false);
        }

        return res;
    }

    private navigateAfterEdit(shiftKey: boolean, cellPosition: CellPosition): void {
        const navAfterEdit = this.gos.get('enterNavigatesVerticallyAfterEdit');

        if (navAfterEdit) {
            const key = shiftKey ? KeyCode.UP : KeyCode.DOWN;
            this.beans.navigation?.navigateToNextCell(null, key, cellPosition, false);
        }
    }

    private processUpdates(updates: CellIdPositions[], cancel: boolean): void {
        updates.forEach(({ rowNode, column, newValue, oldValue }) => {
            const cellCtrl = _resolveCellController(this.beans, { rowNode, column });

            const valueChanged = _valuesDiffer({ newValue, oldValue });
            if (!cancel && valueChanged) {
                // we suppressRefreshCell because the call to rowNode.setDataValue() results in change detection
                // getting triggered, which results in all cells getting refreshed. we do not want this refresh
                // to happen on this call as we want to call it explicitly below. otherwise refresh gets called twice.
                // if we only did this refresh (and not the one below) then the cell would flash and not be forced.
                if (cellCtrl) {
                    cellCtrl.suppressRefreshCell = true;
                }
                rowNode.setDataValue(column.getColId(), newValue, 'commit');
                if (cellCtrl) {
                    cellCtrl.suppressRefreshCell = false;
                }
            }

            this.beans.eventSvc.dispatchEvent({
                ..._createCellEvent(this.beans, null, 'cellEditingStopped', rowNode, column, newValue),
                oldValue,
                newValue,
                value: newValue,
                valueChanged,
            });
        });
    }

    public setPendingUpdates(updates: PendingUpdates): void {
        this.strategy ??= this.createStrategy();
        this.strategy?.setPendingUpdates(updates);
    }

    public getEditingCellPositions(): EditingCellPosition[] {
        return this.beans.editSvc?.model?.getPendingCellPositions() ?? [];
    }

    public stopAllEditing(cancel: boolean = false, source: 'api' | 'ui' = 'ui'): void {
        if (this.isEditing()) {
            this.stopEditing(undefined, undefined, undefined, undefined, cancel, source);
        }
    }

    public isCellEditable(rowNode: IRowNode, column: Column, source: 'api' | 'ui' = 'ui'): boolean {
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

        this.strategy ??= this.createStrategy();
        return this.strategy?.isCellEditable(rowNode, column as AgColumn, source) ?? false;
    }

    moveToNextCell(
        previous: CellCtrl | RowCtrl,
        backwards: boolean,
        event?: KeyboardEvent,
        source: 'api' | 'ui' = 'ui'
    ): boolean | null {
        let res: boolean | null | undefined;

        if (previous instanceof CellCtrl && this.isEditing()) {
            // if we are editing, we know it's not a Full Width Row (RowComp)
            res = this.strategy?.moveToNextEditingCell(previous, backwards, event, source);
        }

        if (res === null) {
            return res;
        }

        // if a cell wasn't found, it's possible that focus was moved to the header
        res = res || !!this.beans.focusSvc.focusedHeader;

        if (res === false) {
            // not a header and not the table
            this.stopEditing();
        }

        return res;
    }

    public getCellDataValue(rowNode?: IRowNode | null, column?: Column | null): any {
        if (!rowNode || !column) {
            return undefined;
        }

        return this.model?.getPendingUpdate(rowNode!, column!)?.newValue;
    }

    public addStopEditingWhenGridLosesFocus(viewports: HTMLElement[]): void {
        // TODO: find a better place for this
        _addStopEditingWhenGridLosesFocus(this, this.beans, viewports);
    }

    public createPopupEditorWrapper(params: ICellEditorParams): PopupEditorWrapper {
        // TODO: find a better place for this
        return new PopupEditorWrapper(params);
    }

    setDataValue(
        rowNode: IRowNode,
        column: string | Column<any>,
        newValue: any,
        eventSource?: string
    ): boolean | undefined {
        if (eventSource === 'commit') {
            return;
        }

        if (typeof column === 'string') {
            column = this.beans.colModel.getCol(column)!;
        }

        this.strategy ??= this.createStrategy();

        _syncModelFromEditor(this.beans, rowNode, column, newValue, eventSource);

        this.strategy?.updateCells();

        return true;
    }

    public handleColDefChanged(cellCtrl: CellCtrl): void {
        _refreshEditorOnColDefChanged(this.beans, cellCtrl);
    }

    public override destroy(): void {
        this.destroyStrategy();
        this.model?.destroy();
        super.destroy();
    }
}
