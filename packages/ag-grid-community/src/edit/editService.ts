import { KeyCode } from '../constants/keyCode';
import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { AgColumn } from '../entities/agColumn';
import { _getRowNode } from '../entities/positionUtils';
import type { AgEventType } from '../eventTypes';
import type { CellRange, IRangeService } from '../interfaces/IRangeService';
import type { EditStrategyType } from '../interfaces/editStrategyType';
import type { ICellEditorParams } from '../interfaces/iCellEditor';
import type { EditMap, EditRow, IEditModelService } from '../interfaces/iEditModelService';
import type {
    EditPosition,
    EditRowPosition,
    IEditService,
    IsEditingParams,
    StartEditParams,
    StopEditParams,
} from '../interfaces/iEditService';
import type { IRowNode } from '../interfaces/iRowNode';
import type { UserCompDetails } from '../interfaces/iUserCompDetails';
import type { CellPosition } from '../main-umd-noStyles';
import { CellCtrl } from '../rendering/cell/cellCtrl';
import { _createCellEvent } from '../rendering/cell/cellEvent';
import type { RowCtrl } from '../rendering/row/rowCtrl';
import type { ValueService } from '../valueService/valueService';
import { PopupEditorWrapper } from './cellEditors/popupEditorWrapper';
import type { BaseEditStrategy } from './strategy/baseEditStrategy';
import { _addStopEditingWhenGridLosesFocus, _getCellCtrl, _getRowCtrl, _getSiblingRows } from './utils/controllers';
import {
    UNEDITED,
    _destroyEditors,
    _purgeUnchangedEdits,
    _refreshEditorOnColDefChanged,
    _syncFromEditor,
    _syncFromEditors,
    _valuesDiffer,
} from './utils/editors';
import { _refreshEditCells } from './utils/refresh';

type BatchPrepDetails = { compDetails?: UserCompDetails; valueToDisplay?: any };

export class EditService extends BeanStub implements NamedBean, IEditService {
    beanName = 'editSvc' as const;
    public batch: boolean;

    private model: IEditModelService;
    private valueSvc: ValueService;
    private rangeSvc: IRangeService;
    private strategy?: BaseEditStrategy;
    private includeParents: boolean = true;

    postConstruct(): void {
        this.model = this.beans.editModelSvc!;
        this.valueSvc = this.beans.valueSvc;
        this.rangeSvc = this.beans.rangeSvc!;

        this.addManagedPropertyListener('editType', ({ currentValue }: any) => {
            this.stopEditing(undefined, { cancel: true, source: 'api' });

            // will re-create if different
            this.createStrategy(currentValue);
        });

        const handler = _refreshEditCells(this.beans);

        this.addManagedEventListeners({
            columnPinned: handler,
            columnVisible: handler,
            columnRowGroupChanged: handler,
            rowGroupOpened: handler,
            pinnedRowsChanged: handler,
            displayedRowsChanged: handler,
        });
    }

    public enableBatchEditing(): void {
        this.batch = true;
        this.stopEditing(undefined, { cancel: true, source: 'api' });
    }

    public disableBatchEditing(): void {
        this.stopEditing(undefined, { cancel: true, source: 'api' });
        this.batch = false;
    }

    private createStrategy(editType?: EditStrategyType): BaseEditStrategy {
        const { beans, gos, strategy } = this;

        const name: EditStrategyType = editType ?? gos.get('editType') ?? 'singleCell';

        if (strategy) {
            if ((strategy.beanName as EditStrategyType) === name) {
                return strategy;
            }
            this.destroyStrategy();
        }

        return (this.strategy = this.createOptionalManagedBean(
            beans.registry.createDynamicBean<BaseEditStrategy>(name, true)
        )!);
    }

    private destroyStrategy(): void {
        if (!this.strategy) {
            return;
        }

        this.strategy.destroy();

        this.strategy = this.destroyBean(this.strategy);
    }

    shouldStartEditing(
        position: Required<EditPosition>,
        event?: KeyboardEvent | MouseEvent | null,
        cellStartedEdit?: boolean | null,
        source: 'api' | 'ui' = 'ui'
    ): boolean | null {
        return this.strategy?.shouldStart(position, event, cellStartedEdit, source) ?? null;
    }

    shouldStopEditing(
        position?: EditPosition,
        event?: KeyboardEvent | MouseEvent | null | undefined,
        source: 'api' | 'ui' = 'ui'
    ): boolean | null {
        return this.strategy?.shouldStop(position, event, source) ?? null;
    }

    shouldCancelEditing(
        position?: EditPosition,
        event?: KeyboardEvent | MouseEvent | null | undefined,
        source: 'api' | 'ui' = 'ui'
    ): boolean | null {
        return this.strategy?.shouldCancel(position, event, source) ?? null;
    }

    public isEditing(position?: EditPosition, params?: IsEditingParams): boolean {
        return this.model.hasEdits(position, params) ?? false;
    }

    public isRowEditing(position: EditRowPosition, params?: IsEditingParams): boolean {
        return this.model.hasEdits({ rowNode: position?.rowNode }, params) ?? false;
    }

    /** @return whether to prevent default on event */
    public startEditing(position: Required<EditPosition>, params: StartEditParams): void {
        const { startedEdit = true, event = null, source = 'ui', silent = false, ignoreEventKey = false } = params;

        this.strategy ??= this.createStrategy();

        if (!this.isCellEditable(position, 'api')) {
            return;
        }

        // because of async in React, the cellComp may not be set yet, if no cellComp then we are
        // yet to initialise the cell, so we re-schedule this operation for when celLComp is attached
        const cellCtrl = _getCellCtrl(this.beans, position)!;
        if (!cellCtrl.comp) {
            cellCtrl.onCompAttachedFuncs.push(() => this.startEditing(position, params));
            return;
        }

        const res = this.shouldStartEditing?.(position, event, startedEdit, source);

        if (res === false && source !== 'api') {
            this.isEditing(position) && this.stopEditing();
            return;
        }

        if (!this.batch && this.shouldStopEditing(position, undefined, source)) {
            this.stopEditing(undefined, { source });
        }

        this.strategy!.start(position, event, source, silent, ignoreEventKey);

        this.updateCells();

        return;
    }

    public updateCells(
        edits?: EditMap,
        forcedState?: boolean,
        suppressFlash?: boolean,
        includeParents = this.includeParents
    ): void {
        this.strategy?.updateCells(edits, forcedState, suppressFlash, includeParents);
    }

    public stopEditing(position?: EditPosition, params?: StopEditParams): boolean {
        const { event, cancel, source = 'ui', suppressNavigateAfterEdit } = params || {};

        if (!this.isEditing() || !this.strategy) {
            return false;
        }

        const cellCtrl = _getCellCtrl(this.beans, position);
        if (cellCtrl) {
            cellCtrl.onEditorAttachedFuncs = [];
        }

        let edits = this.model.getEditMap(true);

        let res = false;
        let forcedState: boolean | undefined = undefined;

        const willStop = !cancel && !!this.shouldStopEditing(position, event, source);
        const willCancel = cancel && !!this.shouldCancelEditing(position, event, source);

        if (willStop || willCancel) {
            _syncFromEditors(this.beans);
            const freshEdits = this.model.getEditMap();

            this.strategy?.stop();

            this.processEdits(freshEdits, cancel);

            edits = freshEdits;

            res ||= willStop;
            forcedState = false;
        } else if (event instanceof KeyboardEvent && this.batch && this.strategy?.midBatchInputsAllowed(position)) {
            const key = event.key;
            const isEnter = key === KeyCode.ENTER;
            const isEscape = key === KeyCode.ESCAPE;

            if (isEnter || isEscape) {
                if (isEnter) {
                    _syncFromEditors(this.beans);
                } else if (position) {
                    this.strategy?.clearEdits(position);
                }

                _destroyEditors(this.beans, this.model.getEditPositions());

                event.preventDefault();

                edits = this.model.getEditMap();
            }
        } else {
            _syncFromEditors(this.beans);
            edits = this.model.getEditMap();
        }

        if (!suppressNavigateAfterEdit && cellCtrl) {
            this.navigateAfterEdit(event instanceof KeyboardEvent && event.shiftKey, cellCtrl.cellPosition);
        }

        this.updateCells(edits, forcedState, true, true);

        _purgeUnchangedEdits(this.beans);

        this.refreshAllRows(edits, this.includeParents);

        this.beans.eventSvc.dispatchEvent({
            type: 'cellEditValuesChanged',
        });

        return res;
    }

    private refreshAllRows(edits: EditMap, includeParents: boolean = false): void {
        edits.forEach((_, node) =>
            _getSiblingRows(this.beans, node, true, includeParents).forEach((sibling) => this.refreshAllCells(sibling))
        );
    }

    private refreshAllCells(rowNode?: IRowNode | null): void {
        if (!rowNode) {
            return;
        }
        const rowCtrl = _getRowCtrl(this.beans, { rowNode });

        rowCtrl
            ?.getAllCellCtrls()
            .forEach((cellCtrl) => cellCtrl.refreshCell({ suppressFlash: true, forceRefresh: true }));
    }

    private navigateAfterEdit(shiftKey: boolean, cellPosition: CellPosition): void {
        const navAfterEdit = this.gos.get('enterNavigatesVerticallyAfterEdit');

        if (navAfterEdit) {
            const key = shiftKey ? KeyCode.UP : KeyCode.DOWN;
            this.beans.navigation?.navigateToNextCell(null, key, cellPosition, false);
        }
    }

    private processEdits(edits: EditMap, cancel: boolean = false): void {
        const rowNodes = Array.from(edits.keys());

        for (const rowNode of rowNodes) {
            const editRow = edits.get(rowNode)!;
            for (const column of editRow.keys()) {
                const { newValue, oldValue } = editRow.get(column)!;
                const position: Required<EditPosition> = { rowNode, column };

                const cellCtrl = _getCellCtrl(this.beans, position);

                const valueChanged = _valuesDiffer({ newValue, oldValue });

                if (!cancel && valueChanged) {
                    // we suppressRefreshCell because the call to rowNode.setDataValue() results in change detection
                    // getting triggered, which results in all cells getting refreshed. we do not want this refresh
                    // to happen on this call as we want to call it explicitly below. otherwise refresh gets called twice.
                    // if we only did this refresh (and not the one below) then the cell would flash and not be forced.
                    if (cellCtrl) {
                        cellCtrl.suppressRefreshCell = true;
                    }
                    rowNode.setDataValue(column, newValue, 'commit');
                    if (cellCtrl) {
                        cellCtrl.suppressRefreshCell = false;
                    }
                }

                this.dispatchCellEvent({ rowNode, column }, undefined, 'cellEditingStopped', {
                    ..._createCellEvent(this.beans, null, 'cellEditingStopped', position, newValue),
                    oldValue,
                    newValue,
                    value: newValue,
                    valueChanged,
                });
            }
        }

        for (const rowNode of rowNodes) {
            this.dispatchRowEvent({ rowNode }, 'rowEditingStopped');
        }
    }

    public setEditMap(edits: EditMap): void {
        this.strategy ??= this.createStrategy();
        this.strategy?.setEditMap(edits);
        this.beans.eventSvc.dispatchEvent({
            type: 'cellEditValuesChanged',
        });
    }

    public stopAllEditing(cancel: boolean = false, source: 'api' | 'ui' = 'ui'): void {
        if (this.isEditing()) {
            this.stopEditing(undefined, { cancel, source });
        }
    }

    public isCellEditable(position: Required<EditPosition>, source: 'api' | 'ui' = 'ui'): boolean {
        const { rowNode } = position;
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
        return this.strategy?.isCellEditable(position, source) ?? false;
    }

    moveToNextCell(
        prev: CellCtrl | RowCtrl,
        backwards: boolean,
        event?: KeyboardEvent,
        source: 'api' | 'ui' = 'ui'
    ): boolean | null {
        let res: boolean | null | undefined;

        if (prev instanceof CellCtrl && this.isEditing()) {
            // if we are editing, we know it's not a Full Width Row (RowComp)
            res = this.strategy?.moveToNextEditingCell(prev, backwards, event, source);
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

    public getCellDataValue({ rowNode, column }: Required<EditPosition>): any {
        if (!rowNode || !column) {
            return undefined;
        }

        const newValue = this.model.getEdit({ rowNode, column })?.newValue;
        return newValue === UNEDITED ? this.valueSvc.getValue(column as AgColumn, rowNode, true, 'api') : newValue;
    }

    public addStopEditingWhenGridLosesFocus(viewports: HTMLElement[]): void {
        // TODO: find a better place for this
        _addStopEditingWhenGridLosesFocus(this, this.beans, viewports);
    }

    public createPopupEditorWrapper(params: ICellEditorParams): PopupEditorWrapper {
        // TODO: find a better place for this
        return new PopupEditorWrapper(params);
    }

    setDataValue(position: Required<EditPosition>, newValue: any, eventSource?: string): boolean | undefined {
        if ((!this.isEditing() || eventSource === 'commit') && eventSource !== 'paste') {
            return;
        }

        this.strategy ??= this.createStrategy();

        _syncFromEditor(this.beans, position, newValue, eventSource);

        this.updateCells();

        return true;
    }

    public handleColDefChanged(cellCtrl: CellCtrl): void {
        _refreshEditorOnColDefChanged(this.beans, cellCtrl);
    }

    public override destroy(): void {
        this.model.clear();
        this.destroyStrategy();
        super.destroy();
    }

    public prepDetailsDuringBatch(
        position: Required<EditPosition>,
        params: BatchPrepDetails
    ): BatchPrepDetails | undefined {
        if (!this.batch) {
            return;
        }
        let editRow = this.model.getEditRow(position);

        if (!editRow) {
            const rowNode = this.model.getEditSiblingRow(position);
            if (rowNode) {
                editRow = this.model.getEditRow({ rowNode });
            }
        }

        if (!editRow) {
            return;
        }

        const { rowNode, column } = position;
        const { compDetails } = params;

        if (compDetails) {
            const { params } = compDetails;
            params.data = Object.assign({}, params.data);
            editRow?.forEach(({ newValue }, col) => {
                if (newValue !== undefined && newValue !== UNEDITED) {
                    // if(newValue === UNEDITED) {
                    //     newValue = undefined;
                    // }
                    params.data[col.getColId()] = newValue;
                }
            });
            return { compDetails };
        } else if (params.valueToDisplay !== undefined && editRow?.has(column)) {
            return { valueToDisplay: this.valueSvc.getValue(column as AgColumn, rowNode) };
        }
    }

    public cleanupEditors() {
        this.strategy?.cleanupEditors();
    }

    public dispatchCellEvent<T extends AgEventType>(
        position: Required<EditPosition>,
        event?: Event | null,
        type?: T,
        payload?: any
    ): void {
        this.strategy?.dispatchCellEvent(position, event, type, payload);
    }

    public dispatchRowEvent(
        position: Required<EditRowPosition>,
        type: 'rowEditingStarted' | 'rowEditingStopped'
    ): void {
        this.strategy?.dispatchRowEvent(position, type);
    }

    public applyBulkEdit({ rowNode, column }: Required<EditPosition>, ranges: CellRange[]): void {
        if (!ranges || ranges.length === 0) {
            return;
        }

        const { rangeSvc, valueSvc } = this;

        _syncFromEditors(this.beans);

        const edits: EditMap = this.model.getEditMap(true);
        const editValue = edits.get(rowNode)?.get(column!)?.newValue;

        ranges.forEach((range: CellRange) => {
            rangeSvc?.forEachRowInRange(range, (position) => {
                const rowNode = _getRowNode(this.beans, position);
                if (rowNode === undefined) {
                    return;
                }

                const editRow: EditRow = edits.get(rowNode) ?? new Map();
                for (const column of range.columns) {
                    if (!column) {
                        continue;
                    }

                    if (this.isCellEditable({ rowNode, column }, 'api')) {
                        const oldValue = valueSvc.getValue(column as AgColumn, rowNode, true, 'api');
                        let newValue = valueSvc.parseValue(column as AgColumn, rowNode ?? null, editValue, oldValue);

                        if (Number.isNaN(newValue)) {
                            // non-number was bulk edited into a number column
                            newValue = null;
                        }

                        editRow.set(column, {
                            newValue,
                            oldValue,
                            state: 'changed',
                        });
                    }
                }
                if (editRow.size > 0) {
                    edits.set(rowNode, editRow);
                }
            });

            this.setEditMap(edits);

            // update editing styles
            this.updateCells(edits, undefined, true, true);

            if (this.batch) {
                this.cleanupEditors();

                _purgeUnchangedEdits(this.beans);

                // force refresh of all row cells as custom renderers may depend on multiple cell values
                this.refreshAllRows(edits, this.includeParents);
                return;
            }

            this.stopEditing(undefined, { source: 'api' });
        });
    }
}
