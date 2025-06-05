import { KeyCode } from '../constants/keyCode';
import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { AgColumn } from '../entities/agColumn';
import type { AgEventType } from '../eventTypes';
import type { EditingCellPosition, ICellEditorParams } from '../interfaces/iCellEditor';
import type { Column } from '../interfaces/iColumn';
import type { IRowNode } from '../interfaces/iRowNode';
import type { UserCompDetails } from '../interfaces/iUserCompDetails';
import type { CellPosition } from '../main-umd-noStyles';
import { CellCtrl } from '../rendering/cell/cellCtrl';
import { _createCellEvent } from '../rendering/cell/cellEvent';
import type { RowCtrl } from '../rendering/row/rowCtrl';
import { PopupEditorWrapper } from './cellEditors/popupEditorWrapper';
import type { EditModelService, PendingUpdates } from './editModelService';
import type { BaseEditStrategy } from './strategy/baseEditStrategy';
import {
    _addStopEditingWhenGridLosesFocus,
    _getSiblingRows,
    _resolveCellController,
    _resolveRowController,
} from './utils/controllers';
import {
    UNEDITED,
    _destroyEditors,
    _purgeUnchangedEdits,
    _refreshEditorOnColDefChanged,
    _syncModelFromEditor,
    _syncModelsFromEditors,
    _valuesDiffer,
} from './utils/editors';
import { _refreshPendingCells } from './utils/refresh';

export class EditService extends BeanStub implements NamedBean {
    beanName = 'editSvc' as const;
    public batchEditing: boolean;

    private model: EditModelService;
    private strategy?: BaseEditStrategy;
    private includeParents: boolean = true;

    postConstruct(): void {
        this.model = this.beans.editModelSvc!;

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

    public isEditing(
        rowNode?: IRowNode | null,
        column?: Column | null,
        checkSiblings = false,
        withOpenEditor = false
    ): boolean {
        return this.model.hasPending(rowNode, column, checkSiblings, undefined, withOpenEditor) ?? false;
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

        if (!this.batchEditing && this.shouldStopEditing(rowNode, column, undefined, undefined, source)) {
            this.stopEditing(undefined, undefined, undefined, undefined, undefined, source);
        }

        const result = this.strategy!.startEditing?.(rowNode, column, key, event, source, silent);

        this.updateCells(this.model.getPendingUpdates());

        return result;
    }

    public updateCells(
        updates?: PendingUpdates,
        forcedState?: boolean | undefined,
        suppressFlash?: boolean,
        includeParents = this.includeParents
    ): void {
        this.strategy?.updateCells(updates, forcedState, suppressFlash, includeParents);
    }

    private isStopping: boolean = false;
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
        if (!this.isEditing() || !this.strategy || this.isStopping) {
            return false;
        }

        this.isStopping = true;

        const cellCtrl = _resolveCellController(this.beans, { rowNode, column });
        if (cellCtrl) {
            cellCtrl.onEditorAttachedFuncs = [];
        }

        let pendingUpdates = this.model.getPendingUpdates(true);

        let res = false;
        let forcedState: boolean | undefined = undefined;

        const willStop = !cancel && !!this.shouldStopEditing?.(rowNode, column, key, event, source);
        const willCancel = cancel && !!this.shouldCancelEditing?.(rowNode, column, key, event, source);

        if (willStop || willCancel) {
            _syncModelsFromEditors(this.beans);
            const freshUpdates = this.model.getPendingUpdates();

            this.strategy?.stopEditing?.() ?? false;

            this.processUpdates(freshUpdates, cancel);

            pendingUpdates = freshUpdates;

            res ||= willStop;
            forcedState = false;
        } else if (
            event instanceof KeyboardEvent &&
            this.batchEditing &&
            this.strategy?.shouldAcceptMidBatchInteractions(rowNode, column)
        ) {
            // handle mid-batch edit interactions
            const isEnter = key === KeyCode.ENTER;
            const isEscape = key === KeyCode.ESCAPE;

            if (isEnter || isEscape) {
                if (isEnter) {
                    _syncModelsFromEditors(this.beans);
                } else {
                    this.strategy?.clearPendingEditors?.(rowNode, column);
                }

                _destroyEditors(this.beans, this.model.getPendingCellIds());

                event.preventDefault();

                pendingUpdates = this.model.getPendingUpdates();
            }
        } else {
            _syncModelsFromEditors(this.beans);
            pendingUpdates = this.model.getPendingUpdates();
        }

        if (!suppressNavigateAfterEdit && cellCtrl) {
            this.navigateAfterEdit(shiftKey, cellCtrl.cellPosition);
        }

        // update editing styles
        this.updateCells(pendingUpdates, forcedState, true, true);

        _purgeUnchangedEdits(this.beans);

        // force refresh of all row cells as custom renderers may depend on multiple cell values
        this.refreshAllRows(pendingUpdates, this.includeParents);

        this.isStopping = false;

        // Integrated charts listen to this event to update the chart data
        this.beans.eventSvc.dispatchEvent({
            type: 'cellEditValuesChanged',
        });

        return res;
    }

    private refreshAllRows(pendingUpdates: PendingUpdates, includeParents: boolean = false): void {
        pendingUpdates.forEach((_, rowNode) => {
            const relatedRowNodes = _getSiblingRows(this.beans, rowNode, true, includeParents);
            return relatedRowNodes.forEach((sibling) => this.refreshAllCells(sibling));
        });
    }

    private refreshAllCells(rowNode?: IRowNode | null): void {
        if (!rowNode) {
            return;
        }
        const rowCtrl = _resolveRowController(this.beans, { rowNode });

        rowCtrl?.getAllCellCtrls().forEach((cellCtrl) => {
            cellCtrl.refreshCell({ suppressFlash: true, forceRefresh: true });
        });
    }

    private navigateAfterEdit(shiftKey: boolean, cellPosition: CellPosition): void {
        const navAfterEdit = this.gos.get('enterNavigatesVerticallyAfterEdit');

        if (navAfterEdit) {
            const key = shiftKey ? KeyCode.UP : KeyCode.DOWN;
            this.beans.navigation?.navigateToNextCell(null, key, cellPosition, false);
        }
    }

    private processUpdates(updates: PendingUpdates, cancel: boolean): void {
        const rowNodes = Array.from(updates.keys());

        for (const rowNode of rowNodes) {
            const rowUpdateMap = updates.get(rowNode)!;
            for (const column of rowUpdateMap.keys()) {
                const { newValue, oldValue } = rowUpdateMap.get(column)!;

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

                this.dispatchCellEvent(rowNode, column, undefined, 'cellEditingStopped', {
                    ..._createCellEvent(this.beans, null, 'cellEditingStopped', rowNode, column, newValue),
                    oldValue,
                    newValue,
                    value: newValue,
                    valueChanged,
                });
            }
        }

        for (const rowNode of rowNodes) {
            this.dispatchRowEvent(rowNode, 'rowEditingStopped');
        }
    }

    public setPendingUpdates(updates: PendingUpdates): void {
        this.strategy ??= this.createStrategy();
        this.strategy?.setPendingUpdates(updates);
        this.beans.eventSvc.dispatchEvent({
            type: 'cellEditValuesChanged',
        });
    }

    public getEditingCellPositions(): EditingCellPosition[] {
        _purgeUnchangedEdits(this.beans);
        return this.beans.editSvc?.model.getPendingCellPositions() ?? [];
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

        const newValue = this.model.getPendingUpdate(rowNode!, column!)?.newValue;
        return newValue !== UNEDITED
            ? newValue
            : this.beans.valueSvc.getValue(column as AgColumn, rowNode, true, 'api');
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
        if ((!this.isEditing() || eventSource === 'commit') && eventSource !== 'paste') {
            return;
        }

        if (typeof column === 'string') {
            column = this.beans.colModel.getCol(column)!;
        }

        this.strategy ??= this.createStrategy();

        _syncModelFromEditor(this.beans, rowNode, column, newValue, eventSource);

        this.updateCells();

        return true;
    }

    public handleColDefChanged(cellCtrl: CellCtrl): void {
        _refreshEditorOnColDefChanged(this.beans, cellCtrl);
    }

    public override destroy(): void {
        this.destroyStrategy();
        this.model.destroy();
        super.destroy();
    }

    prepDetailsDuringBatch(
        { compDetails, valueToDisplay }: { compDetails?: UserCompDetails<any>; valueToDisplay: any },
        rowNode: IRowNode,
        column: Column
    ): { compDetails?: UserCompDetails<any>; valueToDisplay?: any } | undefined {
        if (!this.batchEditing) {
            return undefined;
        }
        let updateRow = this.model.getPendingUpdateRow(rowNode);

        if (!updateRow) {
            const sibling = this.model.getPendingSiblingRow(rowNode);
            if (sibling) {
                updateRow = this.model.getPendingUpdateRow(sibling);
            }
        }

        if (!updateRow) {
            return undefined;
        }

        if (compDetails) {
            compDetails!.params.data = Object.assign({}, compDetails!.params.data);
            updateRow?.forEach((update, col) => {
                const newValue = update.newValue;
                if (newValue !== undefined) {
                    compDetails!.params.data[col.getColId()] = newValue;
                }
            });
            return { compDetails };
        } else if (valueToDisplay !== undefined && updateRow?.has(column)) {
            const newValue = this.beans.valueSvc.getValue(column as AgColumn, rowNode);

            if (newValue !== undefined) {
                return { valueToDisplay: newValue };
            }
        }

        return undefined;
    }

    public cleanupEditors() {
        this.strategy?.cleanupEditors();
    }

    public dispatchCellEvent<T extends AgEventType>(
        rowNode: IRowNode | undefined | null,
        column: Column | undefined | null,
        event?: Event | null,
        type?: T,
        payload?: any
    ): void {
        this.strategy?.dispatchCellEvent(rowNode, column, event, type, payload);
    }

    public dispatchRowEvent(
        rowNode: IRowNode | undefined | null,
        type: 'rowEditingStarted' | 'rowEditingStopped'
    ): void {
        this.strategy?.dispatchRowEvent(rowNode, type);
    }
}
