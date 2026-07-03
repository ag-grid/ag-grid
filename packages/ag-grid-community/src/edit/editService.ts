import { KeyCode } from 'ag-stack';

import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { AgColumn } from '../entities/agColumn';
import { _getRowNode } from '../entities/positionUtils';
import type { RowNode } from '../entities/rowNode';
import type { AgEventType } from '../eventTypes';
import type { BatchEditingStartedEvent, BatchEditingStoppedEvent, CellFocusedEvent } from '../events';
import type { GridOptionsService } from '../gridOptionsService';
import { _addGridCommonParams, _isClientSideRowModel } from '../gridOptionsUtils';
import type { CellRange, IRangeService } from '../interfaces/IRangeService';
import type { EditStrategyType } from '../interfaces/editStrategyType';
import type {
    AgBaseCellEditor,
    EditingCellPosition,
    ICellEditorParams,
    ICellEditorValidationError,
} from '../interfaces/iCellEditor';
import type { CellPosition } from '../interfaces/iCellPosition';
import type { RefreshCellsParams } from '../interfaces/iCellsParams';
import type { Column } from '../interfaces/iColumn';
import type { EditMap, EditPositionValue, EditRow, EditValue } from '../interfaces/iEditModelService';
import type {
    CellValueResolveFrom,
    EditNavOnValidationResult,
    EditPosition,
    EditSource,
    IsEditingParams,
    StartEditParams,
    StopEditParams,
    _SetEditingCellsParams,
} from '../interfaces/iEditService';
import type { IRowNode } from '../interfaces/iRowNode';
import type { CellValueChange } from '../interfaces/iUndoRedo';
import type { UserCompDetails } from '../interfaces/iUserCompDetails';
import { CellCtrl } from '../rendering/cell/cellCtrl';
import type { RowCtrl } from '../rendering/row/rowCtrl';
import type { ValueService } from '../valueService/valueService';
import { PopupEditorWrapper } from './cellEditors/popupEditorWrapper';
import type { EditModelService } from './editModelService';
import type { BaseEditStrategy } from './strategy/baseEditStrategy';
import { isCellEditable, isFullRowCellEditable, shouldStartEditing } from './strategy/strategyUtils';
import { _applyCellEditStyles } from './styles/cellEditStyleFeature';
import { _applyRowEditStyles } from './styles/rowEditStyleFeature';
import { _addStopEditingWhenGridLosesFocus, _getCellCtrl } from './utils/controllers';
import {
    UNEDITED,
    _destroyEditors,
    _filterChangedEdits,
    _populateModelValidationErrors,
    _purgeUnchangedEdits,
    _refreshEditorOnColDefChanged,
    _setupEditor,
    _sourceAndPendingDiffer,
    _syncFromEditor,
    _syncFromEditors,
    _validateEdit,
} from './utils/editors';
import { _refreshEditCells } from './utils/refresh';

type BatchPrepDetails = { compDetails?: UserCompDetails; valueToDisplay?: any };

type StopContext = {
    cancel: boolean;
    cellCtrl: CellCtrl | undefined;
    commit: boolean;
    edits: EditMap;
    event: KeyboardEvent | MouseEvent | null;
    forceCancel: boolean;
    forceStop: boolean;
    position: EditPosition | undefined;
    source: EditSource;
    treatAsSource: EditSource;
    willCancel: boolean;
    willStop: boolean;
};

type StopOutcome = { edits: EditMap; res: boolean };

// these are event sources for setDataValue that will not cause the editors to close
const KEEP_EDITOR_SOURCES = new Set(['undo', 'redo', 'paste', 'bulk', 'rangeSvc']);

const INTERNAL_EDITOR_SOURCES = new Set(['ui', 'api']);

// stop editing sources that we treat as UI-originated so we follow standard processing.
const STOP_EDIT_SOURCE_TRANSFORM: Record<string, EditSource> = {
    paste: 'api',
    rangeSvc: 'api',
    fillHandle: 'api',
    cellClear: 'api',
    bulk: 'api',
};

const STOP_EDIT_SOURCE_TRANSFORM_KEYS: Set<string> = new Set(Object.keys(STOP_EDIT_SOURCE_TRANSFORM));

// These are sources that we treat as API-originated so we presume API behaviour.
const SET_DATA_SOURCE_AS_API: Set<string | undefined> = new Set(['paste', 'rangeSvc', 'cellClear', 'redo', 'undo']);

const CANCEL_PARAMS: StopEditParams = { cancel: true, source: 'api' };

const COMMIT_PARAMS: StopEditParams = { cancel: false, source: 'api' };

/** Params to also check the pinnedSibling row when looking up edits (pinned rows share edit state with their unpinned counterpart). */
const CHECK_SIBLING = { checkSiblings: true };

const FORCE_REFRESH = { force: true, suppressFlash: true };
const FORCE_REFRESH_FLASH = { force: true };

export class EditService extends BeanStub implements NamedBean {
    public beanName = 'editSvc' as const;

    public committing = false;

    private batch: boolean = false;
    private batchStartDispatched: boolean = false;
    private model: EditModelService;
    private valueSvc: ValueService;
    private rangeSvc: IRangeService;
    private strategy?: BaseEditStrategy;
    private stopping = false;
    private rangeSelectionWhileEditing = 0;

    public postConstruct(): void {
        const { beans } = this;
        this.model = beans.editModelSvc!;
        this.valueSvc = beans.valueSvc;
        this.rangeSvc = beans.rangeSvc!;

        this.addManagedPropertyListener('editType', ({ currentValue }: any) => {
            this.stopEditing(undefined, CANCEL_PARAMS);

            // will re-create if different
            this.createStrategy(currentValue);
        });

        const handler = _refreshEditCells(beans);
        const stopInvalidEdits = () => {
            const hasCellValidation = this.model.getCellValidationModel().getCellValidationMap().size > 0;
            const hasRowValidation = this.model.getRowValidationModel().getRowValidationMap().size > 0;

            if (hasCellValidation || hasRowValidation) {
                this.stopEditing(undefined, CANCEL_PARAMS);
            } else if (this.isEditing()) {
                if (this.batch) {
                    _destroyEditors(beans, this.model.getEditPositions());
                } else {
                    this.stopEditing(undefined, COMMIT_PARAMS);
                }
            }

            return false;
        };

        this.addManagedEventListeners({
            columnPinned: handler,
            columnVisible: handler,
            columnRowGroupChanged: handler,
            rowExpansionStateChanged: handler,
            pinnedRowsChanged: handler,
            displayedRowsChanged: handler,
            sortChanged: stopInvalidEdits,
            filterChanged: stopInvalidEdits,
            cellFocused: this.onCellFocused.bind(this),
        });
    }

    public isBatchEditing(): boolean {
        return this.batch;
    }

    public startBatchEditing(): void {
        if (this.batch) {
            return;
        }
        this.batch = true;
        this.batchStartDispatched = false;
        this.stopEditing(undefined, CANCEL_PARAMS);
    }

    public stopBatchEditing(params?: StopEditParams): void {
        if (!this.batch) {
            return;
        }
        if (params) {
            this.stopEditing(undefined, params);
        }
        // If batchEditingStarted was dispatched but stopEditing didn't reach dispatchBatchStopped
        // (e.g. all edits were purged so prepareStopContext returned null), fire it now to
        // balance the event pair. Use cancel semantics since the batch didn't complete normally.
        if (this.batchStartDispatched) {
            this.dispatchBatchStopped(new Map(), false);
        }
        this.batch = false;
        this.batchStartDispatched = false;
    }

    /** Lazily dispatch batchEditingStarted when the first write or editor open occurs during a batch session. */
    private ensureBatchStarted(): void {
        if (!this.batch || this.batchStartDispatched) {
            return;
        }
        this.batchStartDispatched = true;
        this.dispatchBatchEvent('batchEditingStarted', new Map());
    }

    private createStrategy(editType?: EditStrategyType): BaseEditStrategy {
        const { beans, gos, strategy } = this;

        const name: EditStrategyType = getEditType(gos, editType);

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

    public shouldStartEditing(
        position: Required<EditPosition>,
        event?: KeyboardEvent | MouseEvent | null,
        cellStartedEdit?: boolean | null,
        source: EditSource = 'ui'
    ): boolean {
        const shouldStart = shouldStartEditing(this.beans, position, event, cellStartedEdit, source);
        if (shouldStart) {
            this.strategy ??= this.createStrategy();
        }
        return shouldStart;
    }

    public shouldStopEditing(
        position?: EditPosition,
        event?: KeyboardEvent | MouseEvent | null | undefined,
        source: EditSource = 'ui'
    ): boolean | null {
        return this.strategy?.shouldStop(position, event, source) ?? null;
    }

    public shouldCancelEditing(
        position?: EditPosition,
        event?: KeyboardEvent | MouseEvent | null | undefined,
        source: EditSource = 'ui'
    ): boolean | null {
        return this.strategy?.shouldCancel(position, event, source) ?? null;
    }

    public validateEdit(): ICellEditorValidationError[] | null {
        return _validateEdit(this.beans);
    }

    public isEditing(position?: EditPosition | null, params?: IsEditingParams): boolean {
        return this.model.hasEdits(position ?? undefined, params ?? CHECK_SIBLING);
    }

    public isRowEditing(rowNode?: IRowNode, params?: IsEditingParams): boolean {
        return !!rowNode && this.model.hasRowEdits(rowNode, params);
    }

    public enableRangeSelectionWhileEditing(): void {
        if (this.beans.rangeSvc && this.gos.get('cellSelection')) {
            this.rangeSelectionWhileEditing++;
        }
    }

    public disableRangeSelectionWhileEditing(): void {
        this.rangeSelectionWhileEditing = Math.max(0, this.rangeSelectionWhileEditing - 1);
    }

    public isRangeSelectionEnabledWhileEditing(): boolean {
        return this.rangeSelectionWhileEditing > 0;
    }

    /** @returns whether to prevent default on event */
    public startEditing(position: Required<EditPosition>, params: StartEditParams): void {
        const { startedEdit = true, event = null, source = 'ui', ignoreEventKey = false, silent } = params;

        this.strategy ??= this.createStrategy();

        const editable = params.editable ?? this.isCellEditable(position, 'api');
        if (!editable) {
            return;
        }

        // because of async in React, the cellComp may not be set yet, if no cellComp then we are
        // yet to initialise the cell, so we re-schedule this operation for when celLComp is attached
        const cellCtrl = _getCellCtrl(this.beans, position)!;
        if (cellCtrl && !cellCtrl.comp) {
            params.editable = undefined; // So we re-evaluate editable later
            cellCtrl.onCompAttachedFuncs.push(() => this.startEditing(position, params));
            return;
        }

        const res = this.shouldStartEditing(position, event, startedEdit, source);

        if (res === false && source !== 'api') {
            if (this.isEditing(position)) {
                this.stopEditing();
            }
            return;
        }

        if (!this.batch && this.shouldStopEditing(position, undefined, source) && !params.continueEditing) {
            this.stopEditing(undefined, { source });
        }

        if (res) {
            this.ensureBatchStarted();
        }

        this.strategy.start({
            position,
            event,
            source,
            ignoreEventKey,
            startedEdit,
            silent,
        });
    }

    public stopEditing(position?: EditPosition, params?: StopEditParams): boolean {
        const context = this.prepareStopContext(position, params);
        if (!context) {
            return false;
        }

        this.stopping = true;

        let res = false;

        try {
            const outcome = this.processStopRequest(context);
            res ||= outcome.res;

            this.finishStopEditing({
                ...context,
                edits: outcome.edits,
                params,
                position,
                res,
            });

            return res;
        } finally {
            this.rangeSelectionWhileEditing = 0;
            this.stopping = false;
        }
    }

    private prepareStopContext(position?: EditPosition, params?: StopEditParams): StopContext | null {
        const {
            event = null,
            cancel = false,
            source = 'ui',
            forceCancel = false,
            forceStop = false,
            commit = false,
        } = params || {};

        if (STOP_EDIT_SOURCE_TRANSFORM_KEYS.has(source) && this.batch) {
            // if we are in batch editing, we do not stop editing on paste
            if (position?.rowNode && position?.column) {
                this.bulkRefreshCell(position as Required<EditPosition>);
            }
            return null;
        }

        const treatAsSource: EditSource = this.committing ? STOP_EDIT_SOURCE_TRANSFORM[source] : source;
        const isEditingOrBatchWithEdits =
            this.committing || this.isEditing(position) || (this.batch && this.model.hasEdits(position, CHECK_SIBLING));

        if (!isEditingOrBatchWithEdits || !this.strategy || this.stopping) {
            return null;
        }

        const cellCtrl = _getCellCtrl(this.beans, position);
        if (cellCtrl) {
            cellCtrl.onEditorAttachedFuncs = [];
        }

        const willStop =
            (!cancel &&
                (!!this.shouldStopEditing(position, event, treatAsSource) ||
                    ((this.committing || source === 'paste') && !this.batch))) ||
            forceStop;
        const willCancel = (cancel && !!this.shouldCancelEditing(position, event, treatAsSource)) || forceCancel;

        return {
            cancel,
            cellCtrl,
            edits: this.model.getEditMap(true),
            event: event ?? null,
            forceCancel,
            forceStop,
            commit,
            position,
            source,
            treatAsSource,
            willCancel,
            willStop,
        };
    }

    private processStopRequest(context: StopContext): StopOutcome {
        const { event, position, willCancel, willStop } = context;

        if (willStop || willCancel) {
            return this.handleStopOrCancel(context);
        }

        if (this.shouldHandleMidBatchKey(event, position)) {
            return {
                res: false,
                edits: this.handleMidBatchKey(event, position, context),
            };
        }

        _syncFromEditors(this.beans, { persist: true });

        if (this.batch) {
            this.strategy?.cleanupEditors(position);
        }

        return { res: false, edits: this.model.getEditMap() };
    }

    private handleStopOrCancel(context: StopContext): StopOutcome {
        const { beans, model } = this;
        const { cancel, commit, edits, event, source, willCancel, willStop } = context;

        // In batch cancel, don't persist editorValue→pendingValue: per-cell Escape preserves the
        // previous pending value, and batch-wide cancel (forceCancel) discards all edits anyway.
        const persist = !this.batch || !willCancel;
        _syncFromEditors(beans, { persist, isCancelling: willCancel || cancel, isStopping: willStop });

        const freshEdits = model.getEditMap();
        const shouldCommit = !willCancel && (!this.batch || commit);
        const editsToDelete = shouldCommit ? this.processEdits(freshEdits, source) : [];

        if (cancel) {
            this.strategy?.stopCancelled(context.forceCancel);
        } else {
            this.strategy?.stopCommitted(event, commit);
        }

        this.clearValidationIfNoOpenEditors();

        // clear any dangling edits, after editor destruction
        for (const position of editsToDelete) {
            model.clearEditValue(position);
        }

        this.bulkRefreshMap(edits);

        // refresh previously edited cells
        for (const pos of model.getEditPositions(freshEdits)) {
            const cellCtrl = _getCellCtrl(beans, pos);
            const valueChanged = _sourceAndPendingDiffer(pos);
            cellCtrl?.refreshCell({ force: true, suppressFlash: !valueChanged });
        }

        return { res: willStop, edits: freshEdits };
    }

    private shouldHandleMidBatchKey(
        event?: KeyboardEvent | MouseEvent | null,
        position?: EditPosition
    ): event is KeyboardEvent {
        return (
            event instanceof KeyboardEvent &&
            this.batch &&
            !!this.strategy?.midBatchInputsAllowed(position) &&
            this.isEditing(position, { withOpenEditor: true })
        );
    }

    private handleMidBatchKey(event: KeyboardEvent, position: EditPosition | undefined, context: StopContext): EditMap {
        const { beans, model } = this;
        const { cellCtrl, edits } = context;
        const { key } = event;

        const isEnter = key === KeyCode.ENTER;
        const isEscape = key === KeyCode.ESCAPE;
        const isTab = key === KeyCode.TAB;

        if (isEnter || isTab || isEscape) {
            if (isEnter || isTab) {
                _syncFromEditors(beans, { persist: true });
            } else if (isEscape && cellCtrl) {
                const { rowNode, column } = cellCtrl;
                if (this.batch && rowNode && column) {
                    // Defensive: this Escape branch handles the case where the strategy blocked
                    // direct cancellation (shouldCancelEditing returned false), so processStopRequest
                    // fell through to handleMidBatchKey instead of handleStopOrCancel.
                    // In batch mode, Escape reverts to previous pending value, not source value.
                    const pos: Required<EditPosition> = { rowNode, column };
                    _destroyEditors(beans, [pos], { silent: true });
                    this.model.stop(pos, true, true);
                    _getCellCtrl(beans, pos)?.refreshCell(FORCE_REFRESH);
                } else {
                    this.revertSingleCellEdit(cellCtrl);
                }
            }

            if (this.batch) {
                this.strategy?.cleanupEditors();
            } else {
                _destroyEditors(beans, model.getEditPositions(), { event, cancel: isEscape });
            }

            event.preventDefault();

            this.bulkRefreshMap(edits, { suppressFlash: true });

            return model.getEditMap();
        }

        return edits;
    }

    private finishStopEditing({
        cellCtrl,
        edits,
        params,
        position,
        res,
        commit,
        forceCancel,
        willCancel,
        willStop,
    }: StopContext & { params?: StopEditParams; res: boolean }): void {
        const beans = this.beans;
        if (res && position) {
            if (!this.batch || commit) {
                this.model.removeEdits(position);
            }
        }

        // Suppress navigation is required for bulk activities like pasting or fill handle via setDataValue,
        // otherwise navigateAfterEdit will cause the grid to redundantly scan for the next available cell
        // to edit, which causes focus and rendering changes, for each cell in the bulk operation
        this.navigateAfterEdit(params, cellCtrl?.cellPosition);

        _purgeUnchangedEdits(beans);

        this.clearValidationIfNoOpenEditors();

        const { rowRenderer, formula } = beans;

        if (willCancel) {
            // if we cancelled the edit, we need to refresh the rows to remove the pending value and editing styles
            rowRenderer.refreshRows({ rowNodes: Array.from(edits.keys()) });
        }

        if (this.batch) {
            if (formula) {
                formula.refreshFormulas(true);
            } else {
                rowRenderer.refreshRows({ suppressFlash: true, force: true });
            }

            const batchCommit = willStop && commit;
            const batchCancel = willCancel && forceCancel;

            // Only fire batchEditingStopped when the batch is genuinely ending:
            // - commit: commitBatchEdit() was called (forceStop + commit)
            // - forceCancel: cancelBatchEdit() was called (cancel + forceCancel)
            // Do NOT fire during mid-batch row transitions (Tab/Enter across rows in fullRow mode).
            if (batchCommit || batchCancel) {
                this.dispatchBatchStopped(edits, batchCommit);
            }
        }
    }

    /** Dispatch batchEditingStopped if batchEditingStarted was (or should have been) dispatched. */
    private dispatchBatchStopped(edits: EditMap, commit: boolean): void {
        let eventEdits: EditMap | undefined;
        if (commit) {
            // Filter the snapshot to only include cells with actual value changes
            eventEdits = _filterChangedEdits(edits);
            if (eventEdits.size > 0) {
                // Safety: if real edits exist but batchEditingStarted was somehow missed, fire it now
                // so that batchEditingStopped is guaranteed to follow.
                this.ensureBatchStarted();
            }
        }

        if (this.batchStartDispatched) {
            this.batchStartDispatched = false;
            this.dispatchBatchEvent('batchEditingStopped', eventEdits ?? new Map());
        }
    }

    private clearValidationIfNoOpenEditors(): void {
        const hasOpenEditors = this.model.hasEdits(undefined, { withOpenEditor: true });

        if (!hasOpenEditors) {
            this.model.getCellValidationModel().clearCellValidationMap();
            this.model.getRowValidationModel().clearRowValidationMap();
        }
    }

    private navigateAfterEdit(params?: StopEditParams, cellPosition?: CellPosition): void {
        if (!params || !cellPosition) {
            return;
        }

        const { event, suppressNavigateAfterEdit } = params;
        const isKeyBoardEvent = event instanceof KeyboardEvent;

        if (!isKeyBoardEvent || suppressNavigateAfterEdit) {
            return;
        }

        const { key, shiftKey } = event;
        const navAfterEdit = this.gos.get('enterNavigatesVerticallyAfterEdit');

        if (key !== KeyCode.ENTER || !navAfterEdit) {
            return;
        }

        const direction = shiftKey ? KeyCode.UP : KeyCode.DOWN;
        this.beans.navigation?.navigateToNextCell(null, direction, cellPosition, false);
    }

    private processEdits(edits: EditMap, source: EditSource): EditPosition[] {
        const rowNodes = Array.from(edits.keys());

        const hasValidationErrors =
            this.model.getCellValidationModel().getCellValidationMap().size > 0 ||
            this.model.getRowValidationModel().getRowValidationMap().size > 0;

        const editsToDelete: EditPosition[] = [];

        const { changeDetectionSvc } = this.beans;
        changeDetectionSvc?.beginDeferred();
        try {
            for (const rowNode of rowNodes) {
                const editRow = edits.get(rowNode)!;
                for (const column of editRow.keys()) {
                    const editValue = editRow.get(column)!;
                    const position: Required<EditPosition> = { rowNode, column };

                    if (_sourceAndPendingDiffer(editValue) && !hasValidationErrors) {
                        const cellCtrl = _getCellCtrl(this.beans, position);
                        const success = this.setNodeDataValue(
                            rowNode,
                            column,
                            editValue.pendingValue,
                            cellCtrl,
                            source
                        );
                        if (!success) {
                            editsToDelete.push(position);
                        }
                    }
                }
            }
        } finally {
            changeDetectionSvc?.endDeferred();
        }

        return editsToDelete;
    }

    /**
     * Commits a value to the row node's data via `rowNode.setDataValue`.
     *
     * This is a low-level helper that only writes to data; it does NOT update the
     * edit model. Callers are responsible for any model reconciliation — see
     * `syncEditAfterCommit` for the non-batch case and `processEdits` for the
     * batch-finalisation case (where edits are removed immediately after commit).
     */
    private setNodeDataValue(
        rowNode: IRowNode,
        column: Column,
        newValue: any,
        cellCtrl: CellCtrl | null | undefined,
        originalSource: string = 'edit'
    ): boolean {
        const translatedSource = INTERNAL_EDITOR_SOURCES.has(originalSource) ? 'edit' : originalSource;

        // we suppressRefreshCell because the call to rowNode.setDataValue() results in change detection
        // getting triggered, which results in all cells getting refreshed. we do not want this refresh
        // to happen on this call as we want to call it explicitly below. otherwise refresh gets called twice.
        // if we only did this refresh (and not the one below) then the cell would flash and not be forced.
        if (cellCtrl) {
            cellCtrl.suppressRefreshCell = true;
        }
        this.committing = true;
        try {
            return rowNode.setDataValue(column, newValue, translatedSource);
        } finally {
            this.committing = false;
            if (cellCtrl) {
                cellCtrl.suppressRefreshCell = false;
            }
        }
    }

    /**
     * Syncs the edit model after a non-batch commit so sourceValue never becomes stale.
     * On success, re-reads the actual committed value from data (via getValue) because
     * a custom valueSetter may transform or store it differently than the passed value.
     * On failure, reverts the pending edit back to sourceValue.
     *
     * Skipped when an editor is open (state === 'editing'), because the upcoming
     * stopEditing flow will call _syncFromEditors which reads from the editor widget;
     * updating sourceValue here would cause that flow to re-commit stale editor content.
     *
     * NOTE: The re-read via `getValue` happens after `setNodeDataValue` has dispatched
     * `cellValueChanged`. If a `cellValueChanged` listener synchronously mutates the
     * same data field, the re-read will pick up that mutation. This is acceptable because
     * the listener intentionally transformed the value and the model should track the
     * actual committed state.
     */
    private syncEditAfterCommit(position: Required<EditPosition>, success: boolean): void {
        const edit = this.model.getEdit(position);
        if (edit && edit.state !== 'editing') {
            if (success) {
                // Use pendingValue as the new sourceValue: we just committed it, so it IS the source.
                // Reading from valueSvc.getValue('data') can return stale aggData for group nodes when
                // aggregation is deferred (e.g. inside a changeDetectionSvc batch), causing the edit
                // to appear as pending (⏳) even after undo/redo restores the original value.
                this.beans.editModelSvc?.setEdit(position, { sourceValue: edit.pendingValue });
            } else {
                this.model.clearEditValue(position);
            }
        }
    }

    public setEditMap(edits: EditMap, params?: _SetEditingCellsParams): void {
        this.strategy ??= this.createStrategy();
        this.strategy?.setEditMap(edits, params);

        this.bulkRefreshMap(edits);

        // force refresh of all row cells as custom renderers may depend on multiple cell values
        let refreshParams = FORCE_REFRESH;
        if (params?.forceRefreshOfEditCellsOnly) {
            // Only refresh the cells for the current edits
            refreshParams = {
                ...getRowColumnsFromMap(edits),
                ...FORCE_REFRESH,
            };
        }
        this.beans.rowRenderer.refreshCells(refreshParams);
    }

    private dispatchEditValuesChanged(
        { rowNode, column }: EditPosition,
        edit: Partial<Pick<EditValue, 'pendingValue' | 'sourceValue'>> = {}
    ): void {
        if (!rowNode || !column || !edit) {
            return;
        }

        const { pendingValue, sourceValue } = edit;
        const { rowIndex, rowPinned, data } = rowNode;
        this.beans.eventSvc.dispatchEvent({
            type: 'cellEditValuesChanged',
            node: rowNode,
            rowIndex,
            rowPinned,
            column,
            source: 'api',
            data,
            newValue: pendingValue,
            oldValue: sourceValue,
            value: pendingValue,
            colDef: column.getColDef(),
        });
    }

    private bulkRefreshCell(position: Required<EditPosition>, params?: RefreshCellsParams): void {
        if (_isClientSideRowModel(this.gos, this.beans.rowModel)) {
            this.refCell(position, this.model.getEdit(position), params);
        }
    }

    private bulkRefreshMap(editMap: EditMap, params?: RefreshCellsParams): void {
        if (_isClientSideRowModel(this.gos, this.beans.rowModel)) {
            editMap.forEach((editRow, rowNode) => {
                for (const column of editRow.keys()) {
                    this.refCell({ rowNode, column }, editRow.get(column), params);
                }
            });
        }
    }

    private refCell(
        { rowNode, column }: Required<EditPosition>,
        edit?: EditValue,
        params: RefreshCellsParams = {}
    ): void {
        const { beans, gos } = this;

        const updatedNodes: Set<IRowNode> = new Set([rowNode]);
        const refreshNodes: Set<IRowNode> = new Set();

        const pinnedSibling = (rowNode as RowNode).pinnedSibling;
        if (pinnedSibling) {
            updatedNodes.add(pinnedSibling);
        }

        const sibling = rowNode.sibling;
        if (sibling) {
            refreshNodes.add(sibling);
        }

        let parent = rowNode.parent;
        while (parent) {
            if (parent.sibling?.footer && gos.get('groupTotalRow')) {
                refreshNodes.add(parent.sibling);
            } else if (!parent.parent && parent.sibling && gos.get('grandTotalRow')) {
                refreshNodes.add(parent.sibling);
            } else {
                refreshNodes.add(parent);
            }
            parent = parent.parent;
        }

        for (const node of updatedNodes) {
            this.dispatchEditValuesChanged({ rowNode: node, column }, edit);
        }
        for (const node of updatedNodes) {
            _getCellCtrl(beans, { rowNode: node, column })?.refreshCell(params);
        }
        for (const node of refreshNodes) {
            const cellCtrl = _getCellCtrl(beans, { rowNode: node, column });
            if (cellCtrl) {
                cellCtrl.refreshCell(params);
                // During batch, parent/group/grand-total rows need their batch edit CSS
                // updated even when their aggregated value hasn't changed (dataNeedsUpdating
                // is false, so refreshCell alone won't run _applyCellEditStyles).
                if (!params.force && this.batch) {
                    _applyCellEditStyles(beans, cellCtrl);
                }
            }
        }
    }

    public stopAllEditing(cancel: boolean = false, source: 'api' | 'ui' = 'ui'): void {
        if (this.isEditing()) {
            this.stopEditing(undefined, { cancel, source });
        }
    }

    public isCellEditable(position: Required<EditPosition>, source: 'api' | 'ui' = 'ui'): boolean {
        const { gos, beans } = this;

        const rowNode = position.rowNode;
        if (rowNode.group && position.column.getColDef().groupRowEditable == null) {
            // This is a group - it could be a tree group or a grouping group...
            if (gos.get('treeData')) {
                // tree - allow editing of groups with data by default.
                // Allow editing filler nodes (node without data) only if enableGroupEdit is true.
                if (!rowNode.data && !gos.get('enableGroupEdit')) {
                    return false;
                }
            }
            // grouping - allow editing of groups if the user has enableGroupEdit option enabled
            else if (!gos.get('enableGroupEdit')) {
                return false;
            }
        }

        const isEditable =
            getEditType(gos) === 'fullRow'
                ? isFullRowCellEditable(beans, position, source)
                : isCellEditable(beans, position);

        if (isEditable) {
            this.strategy ??= this.createStrategy();
        }

        return isEditable;
    }

    public cellEditingInvalidCommitBlocks(): boolean {
        return this.gos.get('invalidEditValueMode') === 'block';
    }

    public checkNavWithValidation(
        position?: EditPosition,
        event?: Event | CellFocusedEvent,
        focus: boolean = true
    ): EditNavOnValidationResult {
        if (this.hasValidationErrors(position)) {
            const cellCtrl = _getCellCtrl(this.beans, position);
            if (this.cellEditingInvalidCommitBlocks()) {
                (event as Event)?.preventDefault?.();
                if (focus) {
                    if (cellCtrl && !cellCtrl.hasBrowserFocus()) {
                        cellCtrl.focusCell();
                    }
                    cellCtrl?.comp?.getCellEditor()?.focusIn?.();
                }
                return 'block-stop';
            }

            if (cellCtrl) {
                this.revertSingleCellEdit(cellCtrl);
            }

            return 'revert-continue';
        }

        return 'continue';
    }

    /** Calls through to standalone method for treeshaking via the editService */
    public populateModelValidationErrors() {
        _populateModelValidationErrors(this.beans);
    }

    public revertSingleCellEdit(cellPosition: Required<EditPosition>, focus = false): void {
        const cellCtrl = _getCellCtrl(this.beans, cellPosition);
        if (!cellCtrl?.comp?.getCellEditor()) {
            // don't cancel/revert if there is no editor
            return;
        }

        _destroyEditors(this.beans, [cellPosition], { silent: true });

        this.model.clearEditValue(cellPosition);

        _setupEditor(this.beans, cellPosition, { silent: true });

        _populateModelValidationErrors(this.beans);

        cellCtrl?.refreshCell(FORCE_REFRESH);

        if (!focus) {
            return;
        }

        cellCtrl?.focusCell();
        cellCtrl?.comp?.getCellEditor()?.focusIn?.();
    }

    public hasValidationErrors(position?: EditPosition): boolean {
        _populateModelValidationErrors(this.beans);
        const cellCtrl = _getCellCtrl(this.beans, position);
        if (cellCtrl) {
            cellCtrl.refreshCell(FORCE_REFRESH);
            // refresh the styles directly rather than through refreshRow as that causes the group cell renderer to
            // be recreated and would discard future mouse click events
            this.applyRowEditStyles(cellCtrl.rowCtrl);
        }

        let invalid = false;
        if (position?.rowNode) {
            invalid ||= this.model.getRowValidationModel().hasRowValidation({ rowNode: position.rowNode });
            if (position.column) {
                invalid ||= this.model
                    .getCellValidationModel()
                    .hasCellValidation({ rowNode: position.rowNode, column: position.column });
            }
        } else {
            invalid ||= this.model.getCellValidationModel().getCellValidationMap().size > 0;
            invalid ||= this.model.getRowValidationModel().getRowValidationMap().size > 0;
        }

        return invalid;
    }

    public moveToNextCell(
        prev: CellCtrl | RowCtrl,
        backwards: boolean,
        event?: KeyboardEvent,
        source: 'api' | 'ui' = 'ui'
    ): boolean | null {
        let res: boolean | null | undefined;

        const editing = this.isEditing();

        // check for validation errors
        const preventNavigation = editing && this.checkNavWithValidation(undefined, event) === 'block-stop';

        if (prev instanceof CellCtrl && editing) {
            // if we are editing, we know it's not a Full Width Row (RowComp)
            res = this.strategy?.moveToNextEditingCell(prev, backwards, event, source, preventNavigation);
        }

        if (res === null) {
            return res;
        }

        // if a cell wasn't found, it's possible that focus was moved to the header
        res = res || !!this.beans.focusSvc.focusedHeader;

        if (res === false && !preventNavigation) {
            // not a header and not the table
            this.stopEditing();
        }

        return res;
    }

    /**
     * Gets the pending edit value for a cell (used by ValueService).
     * Returns undefined to fallback to committed data/valueGetter.
     */
    public getPendingEditValue(rowNode: IRowNode, column: Column, from: Exclude<CellValueResolveFrom, 'data'>): any {
        // Caller (ValueService.getValue) has already resolved any pivot result column.
        if (from === 'batch' && !this.batch) {
            return undefined; // 'batch' mode: only return edit values when batch editing is active
        }

        const edit = this.model.getEdit({ rowNode, column }, CHECK_SIBLING);
        if (!edit) {
            return undefined;
        }

        // Skip during stopEditing when value was already committed (non-batch, no editor opened)
        if (this.stopping && !this.batch && !edit.editorState?.cellStartedEditing) {
            return undefined;
        }

        if (from === 'edit') {
            const editorValue = edit.editorValue;
            if (editorValue != null && editorValue !== UNEDITED) {
                return editorValue; // For 'edit' mode: return editorValue (live typing) if available
            }
        }

        const pendingValue = edit.pendingValue;
        if (pendingValue !== UNEDITED) {
            return pendingValue; // Return batch pending value if available
        }

        return undefined;
    }

    public getCellDataValue(position: Required<EditPosition>): any {
        const edit = this.model.getEdit(position, CHECK_SIBLING);
        if (edit) {
            const newValue = edit.pendingValue;
            if (newValue !== UNEDITED) {
                return newValue; // return edit value if exists
            }
            const sourceValue = edit.sourceValue;
            if (sourceValue != null) {
                return sourceValue; // return source value if no edit value
            }
        }

        // fallback to getting value from ValueService
        return this.valueSvc.getValueFromData(position.column as AgColumn, position.rowNode);
    }

    public addStopEditingWhenGridLosesFocus(viewports: HTMLElement[]): void {
        // TODO: find a better place for this
        _addStopEditingWhenGridLosesFocus(this, this.beans, viewports);
    }

    public createPopupEditorWrapper(params: ICellEditorParams): PopupEditorWrapper {
        // TODO: find a better place for this
        return new PopupEditorWrapper(params);
    }

    public batchResetToSourceValue(position: Required<EditPosition>): boolean {
        if (!this.batch) {
            return false;
        }
        const existing = this.model.getEdit(position);
        if (!existing) {
            return false; // no edit, nothing to reset
        }
        const { pendingValue, sourceValue, state } = existing;
        if (pendingValue === sourceValue) {
            return false; // nothing to do, already at source value
        }
        if (state === 'editing') {
            return false; // don't toggle-back if currently being edited
        }

        this.dispatchEditValuesChanged(position, { ...existing, pendingValue: sourceValue });
        this.beans.editModelSvc?.removeEdits(position);
        _getCellCtrl(this.beans, position)?.refreshCell(FORCE_REFRESH);
        return true; // toggled back to source value
    }

    /**
     * Applies a data value change to a cell, handling batch editing, undo/redo, paste, and range operations.
     */
    public setDataValue(position: Required<EditPosition>, newValue: any, eventSource?: string): boolean | undefined {
        try {
            const batch = this.batch;
            const editing = this.isEditing(batch ? undefined : position);

            if ((!editing || this.committing) && !batch && !SET_DATA_SOURCE_AS_API.has(eventSource)) {
                return; // Ignore non-edit edits that are not treated as API sources and not in batch mode.
            }

            if (!editing && !batch && eventSource === 'paste') {
                return; // Paste on non editable cells and not batching
            }

            // 'batch' source: write to batch pending value if batch is active (ignoring any open editor),
            // otherwise fall through to direct data write in rowNode.setDataValue.
            if (eventSource === 'batch' && !batch) {
                return; // Not in batch mode, fall through to direct data write
            }

            // 'edit' source: update the open editor's value without closing it or committing.
            // If no editor is open, stage as pending (batch) or fall through to direct data write.
            if (eventSource === 'edit') {
                if (editing && this.applyEditorValue(position, newValue)) {
                    return true;
                }
                if (!batch) {
                    return; // No editor and not in batch → fall through to direct data write
                }
            }

            this.strategy ??= this.createStrategy();

            if (eventSource === 'batch' || eventSource === 'edit') {
                return this.applyDirectValue(position, newValue, eventSource);
            }

            const beans = this.beans;

            let source: string;
            if (batch) {
                source = 'ui';
            } else if (this.committing) {
                source = eventSource ?? 'api';
            } else {
                source = 'api';
            }

            if (!eventSource || KEEP_EDITOR_SOURCES.has(eventSource)) {
                return this.applyDirectValue(position, newValue, eventSource);
            }

            const result = this.applyExistingEdit(position, newValue, eventSource, source);
            if (result !== undefined) {
                return result; // existing edit handled, return its result
            }

            _syncFromEditor(beans, position, newValue, eventSource, undefined, { persist: true });
            this.ensureBatchStarted();
            this.stopEditing(position, {
                source: source as any,
                suppressNavigateAfterEdit: true,
            });

            return true; // edit applied and cell refreshed, so return true to indicate the event was handled
        } finally {
            this.committing = false;
        }
    }

    /** Handles setDataValue when an edit already exists for the cell. */
    private applyExistingEdit(
        position: Required<EditPosition>,
        newValue: any,
        eventSource: string | undefined,
        source: string
    ): boolean | undefined {
        const existing = this.model.getEdit(position);
        if (!existing) {
            return undefined; // signal to caller that there is no existing edit, so the normal setDataValue flow should proceed
        }

        if (existing.pendingValue === newValue) {
            return false; // no change, so no need to update model or refresh cell
        }

        if (existing.sourceValue !== newValue) {
            _syncFromEditor(this.beans, position, newValue, eventSource, undefined, { persist: true });
            this.ensureBatchStarted();
            this.stopEditing(position, {
                source: source as any,
                suppressNavigateAfterEdit: true,
            });
            return true; // value was synced (in batch, stopEditing stays active but the edit is applied)
        }

        // sourceValue === newValue: setting back to original value removes the edit entirely.
        this.beans.editModelSvc?.removeEdits(position);
        this.ensureBatchStarted();

        this.dispatchEditValuesChanged(position, {
            ...existing,
            pendingValue: newValue,
        });

        return true; // edit removed and cell refreshed, so return true to indicate the event was handled
    }

    /**
     * Pushes a value into an open cell editor without closing it or committing.
     * Updates editorValue and pendingValue in the edit model, then refreshes the editor DOM.
     * Returns true if an editor was open and updated, false otherwise.
     */
    private applyEditorValue(position: Required<EditPosition>, newValue: any): boolean {
        const beans = this.beans;
        const cellCtrl = _getCellCtrl(beans, position);
        const editor = cellCtrl?.comp?.getCellEditor();
        if (!cellCtrl || !editor) {
            return false;
        }

        // Update both editorValue and pendingValue in the edit model
        _syncFromEditor(beans, position, newValue, 'edit', undefined, { persist: true });

        // Refresh cell styles after updating the edit model so that the ag-cell-editing
        // class and batch-edit styling reflect the new pending value.
        _applyCellEditStyles(beans, cellCtrl);

        // Fast path for built-in editors: update value in-place without recreating
        if ('agSetEditValue' in editor) {
            (editor as AgBaseCellEditor).agSetEditValue(newValue);
            return true;
        }

        // Fast path for framework wrappers (React/Angular/Vue): update via refresh()
        if (editor.refresh && cellCtrl.editCompDetails) {
            editor.refresh({ ...cellCtrl.editCompDetails.params, value: newValue });
            return true;
        }

        // Fallback for editors that don't implement refresh(): recreate the editor to pick up the new value.
        const restoreFocus = cellCtrl.hasBrowserFocus();
        if (restoreFocus) {
            cellCtrl.onEditorAttachedFuncs.push(() => {
                const latestCellCtrl = _getCellCtrl(this.beans, position);
                latestCellCtrl?.focusCell(true);
                latestCellCtrl?.comp?.getCellEditor()?.focusIn?.();
            });
        }

        _destroyEditors(beans, [position], { silent: true, cancel: true });
        _setupEditor(beans, position, { silent: true });
        _populateModelValidationErrors(beans);
        _getCellCtrl(beans, position)?.refreshCell(FORCE_REFRESH);

        return true;
    }

    /** editApi or undoRedoApi apply change without involving the editor. */
    private applyDirectValue(position: Required<EditPosition>, newValue: any, eventSource?: string): boolean {
        const beans = this.beans;

        if (this.batch) {
            if (eventSource === 'batch' && _getCellCtrl(beans, position)?.comp?.getCellEditor()) {
                // 'batch' source with an open editor: write ONLY to pendingValue,
                // leaving editorValue untouched so the editor keeps showing what
                // the user typed. The staged value is accessible via getCellValue 'batch'.
                const { editModelSvc, valueSvc } = beans;
                const { rowNode, column } = position;
                const existingEdit = editModelSvc?.getEdit(position);
                if (existingEdit?.sourceValue === undefined) {
                    editModelSvc?.setEdit(position, {
                        sourceValue: valueSvc.getValueFromData(column as AgColumn, rowNode),
                    });
                }
                editModelSvc?.setEdit(position, { pendingValue: newValue });
            } else {
                // All other sources: sync through the editor model layer.
                _syncFromEditor(beans, position, newValue, eventSource, undefined, { persist: true });

                // 'batch' source (no open editor) stages a pending value without disrupting display;
                // other sources close the editor, symmetrically with how default setDataValue works.
                if (eventSource !== 'batch') {
                    this.cleanupEditors();
                }
            }

            _purgeUnchangedEdits(beans);

            // Lazily dispatch batchEditingStarted for direct API writes during batch.
            this.ensureBatchStarted();

            // Refresh the changed cell and dispatch cellEditValuesChanged so consumers
            // (e.g. find service) react to the pending value update.
            this.bulkRefreshCell(position);
            return true;
        }

        _syncFromEditor(beans, position, newValue, eventSource, undefined, { persist: true });

        const cellCtrl = _getCellCtrl(beans, position);
        const success = this.setNodeDataValue(position.rowNode, position.column, newValue, cellCtrl, eventSource);

        this.syncEditAfterCommit(position, success);

        // After undo/redo or direct data writes, the edit's pendingValue may now match sourceValue.
        // Purge such entries so they don't show as batch-pending (⏳) when the value was restored.
        _purgeUnchangedEdits(beans);

        // Re-fetch: change detection during setDataValue may have recreated the CellCtrl.
        // Only allow flash when the value was actually committed; suppress when setDataValue
        // returned false (e.g. readOnlyEdit, rejected valueSetter, unchanged value).
        _getCellCtrl(beans, position)?.refreshCell(success ? FORCE_REFRESH_FLASH : FORCE_REFRESH);
        return success;
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
        const { model } = this;
        if (!this.batch) {
            return;
        }

        const hasEdits = model.hasRowEdits(position.rowNode, CHECK_SIBLING);

        if (!hasEdits) {
            return;
        }

        const { rowNode } = position;
        const { compDetails, valueToDisplay } = params;

        if (compDetails) {
            const { params } = compDetails;
            params.data = model.getEditRowDataValue(rowNode, CHECK_SIBLING);
            return { compDetails };
        }

        return { valueToDisplay };
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

    public dispatchBatchEvent(type: 'batchEditingStarted' | 'batchEditingStopped', edits: EditMap): void {
        this.eventSvc.dispatchEvent(this.createBatchEditEvent(type, edits));
    }

    public createBatchEditEvent(
        type: 'batchEditingStarted' | 'batchEditingStopped',
        edits: EditMap
    ): BatchEditingStartedEvent | BatchEditingStoppedEvent {
        return _addGridCommonParams(this.gos, {
            type,
            ...(type === 'batchEditingStopped'
                ? {
                      changes: this.toEventChangeList(edits),
                  }
                : {}),
        });
    }

    private toEventChangeList(edits: EditMap): CellValueChange[] {
        return this.model.getEditPositions(edits).map((edit: EditPositionValue) => ({
            rowIndex: edit.rowNode.rowIndex!,
            rowPinned: edit.rowNode.rowPinned,
            columnId: edit.column.getColId(),
            newValue: edit.pendingValue,
            oldValue: edit.sourceValue,
        }));
    }

    public applyBulkEdit({ rowNode, column }: Required<EditPosition>, ranges: CellRange[]): void {
        if (!ranges || ranges.length === 0) {
            return;
        }
        const { beans, rangeSvc, valueSvc } = this;
        const { formula } = beans;

        _syncFromEditors(beans, { persist: true });

        const edits: EditMap = this.model.getEditMap(true);
        let editValue = edits.get(rowNode)?.get(column)?.pendingValue;

        let bulkStartDispatched = false;
        if (!this.batch) {
            // bulk edits occurring during batch are handled as a batch set of changes
            this.eventSvc.dispatchEvent({ type: 'bulkEditingStarted' });
            bulkStartDispatched = true;
        }

        const isFormula = formula?.isFormula(editValue) ?? false;

        ranges.forEach((range: CellRange) => {
            const rangeColumns = range.columns as AgColumn[];
            const hasFormulaColumnsInRange = rangeColumns.some((col) => col?.allowFormula);
            rangeSvc?.forEachRowInRange(range, (position) => {
                const rowNode = _getRowNode(beans, position);
                if (rowNode === undefined) {
                    return;
                }

                const editRow: EditRow = edits.get(rowNode) ?? new Map();
                let valueForColumn = editValue;
                for (const column of rangeColumns) {
                    if (!column) {
                        continue;
                    }

                    const isFormulaForColumn = !!isFormula && column.allowFormula;

                    if (this.isCellEditable({ rowNode, column }, 'api')) {
                        const sourceValue = valueSvc.getValueFromData(column as AgColumn, rowNode, true);
                        let pendingValue = valueSvc.parseValue(
                            column as AgColumn,
                            rowNode ?? null,
                            valueForColumn,
                            sourceValue
                        );

                        if (Number.isNaN(pendingValue)) {
                            // non-number was bulk edited into a number column
                            pendingValue = null;
                        }

                        editRow.set(column, {
                            editorValue: undefined,
                            pendingValue,
                            sourceValue,
                            state: 'changed',
                            editorState: {
                                isCancelAfterEnd: undefined,
                                isCancelBeforeStart: undefined,
                            },
                        });
                    }
                    if (isFormulaForColumn) {
                        valueForColumn = formula?.updateFormulaByOffset({ value: valueForColumn, columnDelta: 1 });
                    }
                }
                if (editRow.size > 0) {
                    edits.set(rowNode, editRow);
                }
                if (isFormula && hasFormulaColumnsInRange) {
                    editValue = formula?.updateFormulaByOffset({ value: editValue, rowDelta: 1 });
                }
            });

            this.setEditMap(edits);

            if (this.batch) {
                this.cleanupEditors();

                _purgeUnchangedEdits(beans);

                this.ensureBatchStarted();

                return;
            }

            this.committing = true;
            try {
                this.stopEditing(undefined, { source: 'bulk' });
            } finally {
                this.committing = false;
                if (bulkStartDispatched) {
                    this.eventSvc.dispatchEvent({ type: 'bulkEditingStopped', changes: this.toEventChangeList(edits) });
                }
            }
        });

        // focus the first cell in the range
        const cellCtrl = _getCellCtrl(beans, { rowNode, column })!;
        if (cellCtrl) {
            cellCtrl.focusCell(true);
        }
    }

    public applyCellEditStyles(cellCtrl: CellCtrl): void {
        _applyCellEditStyles(this.beans, cellCtrl);
    }

    public applyRowEditStyles(rowCtrl: RowCtrl): void {
        _applyRowEditStyles(this.beans, rowCtrl);
    }

    public setEditingCells(cells: EditingCellPosition[], params?: _SetEditingCellsParams): void {
        const { beans } = this;
        const { colModel, valueSvc } = beans;

        const edits: EditMap = new Map();

        for (let { colId, column, colKey, rowIndex, rowPinned, newValue: pendingValue, state } of cells) {
            const col = colId ? colModel.colsById[colId] : colKey ? colModel.getCol(colKey) : column;

            if (!col) {
                continue;
            }

            const rowNode = _getRowNode(beans, { rowIndex, rowPinned });

            if (!rowNode) {
                continue;
            }
            const sourceValue = valueSvc.getValueFromData(col as AgColumn, rowNode, true);

            if (
                !params?.forceRefreshOfEditCellsOnly &&
                !_sourceAndPendingDiffer({ pendingValue, sourceValue }) &&
                state !== 'editing'
            ) {
                // If the new value is the same as the old value, we don't need to update
                // Unless forceRefreshOfEditCellsOnly is true, in which case we don't short-circuit
                continue;
            }

            let editRow = edits.get(rowNode);

            if (!editRow) {
                editRow = new Map();
                edits.set(rowNode, editRow);
            }

            // translate undefined to unedited, don't translate null as that means cell was cleared
            if (pendingValue === undefined) {
                pendingValue = UNEDITED;
            }

            editRow.set(col, {
                editorValue: undefined,
                pendingValue,
                sourceValue,
                state: state ?? 'changed',
                editorState: {
                    isCancelAfterEnd: undefined,
                    isCancelBeforeStart: undefined,
                },
            });
        }

        this.setEditMap(edits, params);
    }

    onCellFocused(event: CellFocusedEvent): void {
        const cellCtrl = _getCellCtrl(this.beans, event);

        if (!cellCtrl || !this.isEditing(cellCtrl, CHECK_SIBLING)) {
            return;
        }

        const edit = this.model.getEdit(cellCtrl);

        if (!edit || !_sourceAndPendingDiffer(edit)) {
            return;
        }

        const translate = this.getLocaleTextFunc();
        const label = translate('ariaPendingChange', 'Pending Change');

        this.beans.ariaAnnounce?.announceValue(label, 'pendingChange');
    }

    allowedFocusTargetOnValidation(cellPosition: EditPosition): CellCtrl | undefined {
        return _getCellCtrl(this.beans, cellPosition);
    }
}

function getRowColumnsFromMap(edits: EditMap): { rowNodes: IRowNode[] | undefined; columns: Column[] | undefined } {
    return {
        rowNodes: edits ? Array.from(edits.keys()) : undefined,
        columns: edits
            ? [...new Set(Array.from(edits.values()).flatMap((er: EditRow) => Array.from(er.keys())))]
            : undefined,
    };
}

function getEditType(gos: GridOptionsService, editType?: EditStrategyType) {
    return editType ?? gos.get('editType') ?? 'singleCell';
}
