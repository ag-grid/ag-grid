import { KeyCode } from 'ag-stack';

import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import type { AgColumn } from '../entities/agColumn';
import { _getRowNode } from '../entities/positionUtils';
import type { RowNode } from '../entities/rowNode';
import type { AgEventType } from '../eventTypes';
import type { BatchEditingStartedEvent, BatchEditingStoppedEvent, CellFocusedEvent } from '../events';
import type { GridOptionsService } from '../gridOptionsService';
import { _addGridCommonParams, _isClientSideRowModel } from '../gridOptionsUtils';
import type { CellRange, IRangeService } from '../interfaces/IRangeService';
import type { EditStrategyType } from '../interfaces/editStrategyType';
import type { AgBaseCellEditor, EditingCellPosition, ICellEditorParams } from '../interfaces/iCellEditor';
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
import { _addStopEditingWhenGridLosesFocus, _getCellCtrl, _getRowCtrl } from './utils/controllers';
import type { EditorValidationCache } from './utils/editors';
import {
    UNEDITED,
    _collectEditorValidationCache,
    _destroyEditor,
    _destroyEditors,
    _filterChangedEdits,
    _flushEditors,
    _onPopupEditorClosed,
    _populateModelValidationErrors,
    _populateRowValidationErrors,
    _purgeUnchangedEdit,
    _purgeUnchangedEdits,
    _refreshEditorOnColDefChanged,
    _scanEditorsForValidation,
    _setupEditor,
    _sourceAndPendingDiffer,
    _syncFromEditor,
    _syncFromEditorComp,
    _syncFromEditors,
} from './utils/editors';
import { _purgeEdits, _purgeStalePinnedEdits } from './utils/refresh';
import {
    _announceChangedValidationErrors,
    _announceFullRowEditValidationErrors,
} from './utils/validationAnnouncements';

type BatchPrepDetails = { compDetails?: UserCompDetails; valueToDisplay?: any };

/** An async editor may attach after navigation has finished; bind its validation pass to that exact request. */
type PendingEditorAttachValidation = {
    compDetails: UserCompDetails;
    validationCache: EditorValidationCache;
};

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

    private csrm = false;
    private batch: boolean = false;
    private batchStartDispatched: boolean = false;
    private model: EditModelService;
    private valueSvc: ValueService;
    private rangeSvc: IRangeService;
    private strategy?: BaseEditStrategy;
    private stopping = false;
    private rangeSelectionWhileEditing = 0;
    /**
     * Whether the last stop was rejected by block mode holding an invalid value. `res === false` can't
     * stand in for this: a consumed mid-batch key also reports false but is a real stop that must still
     * navigate and must still be able to end the batch.
     */
    private stopBlockRejected = false;

    /** Memo for hasConfiguredValidation, keyed on colModel.colDefsVersion. -1 never matches a real version. */
    private validationConfigVersion = -1;
    private validationConfigResult = false;
    /** Memo for editorsRequireValidation; undefined means "not scanned yet". */
    private editorsValidation: boolean | undefined;
    /** Covers vanilla editors that attach inside `_setupEditor`. */
    private editorAttachValidationCache: EditorValidationCache | undefined;
    /** Covers framework editors that attach after `_setupEditor` returns. */
    private readonly pendingEditorAttachValidation = new WeakMap<CellCtrl, PendingEditorAttachValidation>();
    /** Cell whose editor takes focus as it attaches, and whether the cell itself must be focused first. */
    private pendingEditorFocus: CellCtrl | null = null;
    private pendingEditorFocusCell = false;

    // Nonzero while a bulk write coalesces per-cell cleanup/refresh (see beginBulkWrite).
    private bulkWriteDepth = 0;
    private bulkWriteTouched: Required<EditPosition>[] = [];

    public postConstruct(): void {
        const { beans } = this;
        this.model = beans.editModelSvc!;
        this.valueSvc = beans.valueSvc;
        this.rangeSvc = beans.rangeSvc!;
        this.csrm = _isClientSideRowModel(this.gos, beans.rowModel);

        // The row-level callback feeds hasConfiguredValidation's memo, which is keyed on the colDef version.
        this.addManagedPropertyListener('getFullRowEditValidationErrors', () => {
            this.validationConfigVersion = -1;
        });

        this.addManagedPropertyListener('editType', ({ currentValue }: any) => {
            this.stopEditing(undefined, CANCEL_PARAMS);

            // will re-create if different
            this.createStrategy(currentValue);
        });

        const pinnedSweep = _purgeStalePinnedEdits(beans);
        const stopInvalidEdits = () => {
            if (!this.isEditing()) {
                return;
            }

            // Flushes and repopulates first: a pull-only editor never calls params.validate(), so a stale
            // read here would let the commit-vs-cancel choice persist an invalid value.
            const validationCache = this.revalidate();
            if (this.checkValidated()) {
                this.stopEditing(undefined, CANCEL_PARAMS, validationCache);
            } else if (this.batch) {
                _destroyEditors(beans, this.model.getEditPositions(), {}, validationCache);
            } else {
                this.stopEditing(undefined, COMMIT_PARAMS, validationCache);
            }
        };

        this.addManagedEventListeners({
            // Static pinned rows are dropped without being destroyed and without reporting it, so pinned
            // membership is re-tested here. Manual pinning pushes from PinnedRows.delete instead.
            pinnedRowsChanged: pinnedSweep,
            pinnedRowDataChanged: pinnedSweep,
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
            // A block-mode commit rejected by validation keeps its editors open: hold the batch so the
            // user can fix the value and re-commit (or cancel). Any other incomplete stop (an empty or
            // fully purged batch, a re-entrant call) must still end the batch rather than strand it.
            if (params.commit && this.stopBlockRejected) {
                return;
            }
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

    /**
     * Closes a batch's open editors, staging their values, without ending the batch. Block mode holds
     * instead: an invalid edit keeps its editor open so it can be corrected, as on every other stop path.
     */
    public stopBatchEditors(cancel: boolean): void {
        const { beans, model } = this;
        let validationCache: EditorValidationCache | undefined;

        if (cancel) {
            const positions = model.getEditPositions();
            // Closing editors during an active batch cancels only their transient attempts. The previously
            // staged pending values remain in the batch, and cancellation never needs a validation pass.
            this.strategy?.stopCancelled(false);
            for (let i = 0, len = positions.length; i < len; ++i) {
                this.bulkRefreshCell(positions[i], { force: true, suppressFlash: true });
            }
            this.clearValidationIfNoOpenEditors();
            return;
        } else {
            if (this.cellEditingInvalidCommitBlocks()) {
                validationCache = this.revalidate();
                if (this.checkValidated()) {
                    return;
                }
            } else if (this.hasValidationRules()) {
                // Revert mode still asks validators while staging and destroying editors. Capture that answer
                // without repopulating models/styles so both consumers share the same explicit pass.
                validationCache = _collectEditorValidationCache(beans);
            }
            _syncFromEditors(beans, { persist: true }, validationCache);
        }

        _destroyEditors(beans, model.getEditPositions(), { cancel }, validationCache);
        // Every editor is closed, so the errors they were holding go with them.
        this.clearValidationIfNoOpenEditors();
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

    public isEditing(position?: EditPosition | null, params?: IsEditingParams): boolean {
        return this.model.hasEdits(position ?? undefined, params ?? CHECK_SIBLING);
    }

    public isRowEditing(rowNode?: IRowNode, params?: IsEditingParams): boolean {
        return !!rowNode && this.model.hasRowEdits(rowNode, params?.checkSiblings);
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
            // On the cell, so a second cell asking while this one waits to mount cannot displace it.
            cellCtrl.pendingEditStart = params;
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

    public stopEditing(
        position?: EditPosition,
        params?: StopEditParams,
        validationCache?: EditorValidationCache
    ): boolean {
        // Cleared early so a stop that bails below can't leave a stale rejection for stopBatchEditing —
        // but never from a nested stop, which would wipe the live rejection it sits inside.
        if (!this.stopping) {
            this.stopBlockRejected = false;
        }

        const context = this.prepareStopContext(position, params);
        if (!context) {
            return false;
        }

        this.stopping = true;

        let res = false;

        try {
            const outcome = this.processStopRequest(context, validationCache);
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

        // A stop cancels any focus still waiting on an editor that is about to go.
        this.pendingEditorFocus = null;

        const cellCtrl = _getCellCtrl(this.beans, position);

        const willStop =
            (!cancel &&
                (!!this.shouldStopEditing(position, event, treatAsSource) ||
                    ((this.committing || source === 'paste') && !this.batch))) ||
            forceStop;
        const willCancel = (cancel && !!this.shouldCancelEditing(position, event, treatAsSource)) || forceCancel;

        return {
            cancel,
            cellCtrl,
            edits: this.model.getEditMapCopy(),
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

    private processStopRequest(context: StopContext, validationCache?: EditorValidationCache): StopOutcome {
        const { event, position, willCancel, willStop } = context;

        if (willStop || willCancel) {
            return this.handleStopOrCancel(context, validationCache);
        }

        if (this.shouldHandleMidBatchKey(event, position)) {
            return { res: false, edits: this.handleMidBatchKey(event, position, context, validationCache) };
        }

        _syncFromEditors(this.beans, { persist: true }, validationCache);

        if (this.batch) {
            this.strategy?.cleanupEditors(position, undefined, validationCache);
        }

        return { res: false, edits: this.model.getEditMapCopy() };
    }

    private handleStopOrCancel(context: StopContext, preflightValidationCache?: EditorValidationCache): StopOutcome {
        const { beans, model } = this;
        const { cancel, commit, edits, event, position, source, willCancel, willStop } = context;

        // A pull-only editor leaves the validation maps stale, and buffered input has to reach the value
        // before validity is read, or the stop validates the old value and commits the flushed one.
        const applying = !willCancel && !cancel;
        let validationCache = preflightValidationCache;
        if (applying) {
            _flushEditors(beans);
            validationCache ??= _populateModelValidationErrors(beans);
        }

        // Grid-wide by design: cell validation only holds cells with an open editor, and a batch commit
        // must block on all of them. Read directly — a populate on cancel would refresh styles.
        const invalid = model.hasValidationErrors();
        // Revert mode must discard each invalid cell's in-flight attempt before the persist below
        // overwrites it (see revertInvalidEdits); block mode instead holds the whole commit.
        const blockMode = this.cellEditingInvalidCommitBlocks();
        const revertBatchCommit = invalid && !blockMode && this.batch && commit;
        if (revertBatchCommit) {
            this.revertInvalidEdits();
        }

        // A block-mode invalid commit is rejected (batch or not): persist nothing and report the stop as
        // not completed, so the held edit, its editor and the previous valid pending value all survive.
        const blockRejected = invalid && blockMode && willStop && applying;
        this.stopBlockRejected = blockRejected;
        if (blockRejected && this.gos.get('editType') === 'fullRow') {
            _announceFullRowEditValidationErrors(beans, position?.rowNode ?? this.getOpenEditorRowNode());
        }

        // Batch cancel also skips the persist: per-cell Escape keeps the previous pending value, and
        // forceCancel discards everything anyway.
        const persist = (!this.batch || !willCancel) && !blockRejected;
        _syncFromEditors(beans, { persist, isCancelling: willCancel || cancel, isStopping: willStop }, validationCache);

        const freshEdits = model.getEditMapCopy();
        const shouldCommit = !willCancel && (!this.batch || commit);
        const editsToDelete = shouldCommit ? this.processEdits(freshEdits, source, invalid && !revertBatchCommit) : [];

        if (cancel) {
            this.strategy?.stopCancelled(context.forceCancel, validationCache);
        } else if (!blockRejected) {
            this.strategy?.stopCommitted(event, commit, validationCache);
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

        return { res: willStop && !blockRejected, edits: freshEdits };
    }

    /** The row the user is currently editing supplies context for a global batch-validation summary. */
    private getOpenEditorRowNode(): IRowNode | undefined {
        const cellCtrls = this.beans.rowRenderer.getCellCtrls();
        for (let i = 0, len = cellCtrls.length; i < len; ++i) {
            const cellCtrl = cellCtrls[i];
            if (cellCtrl.comp?.getCellEditor()) {
                return cellCtrl.rowNode;
            }
        }
        return undefined;
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

    private handleMidBatchKey(
        event: KeyboardEvent,
        position: EditPosition | undefined,
        context: StopContext,
        validationCache?: EditorValidationCache
    ): EditMap {
        const { beans, model } = this;
        const { edits } = context;
        const { key } = event;

        const isEnter = key === KeyCode.ENTER;
        const isEscape = key === KeyCode.ESCAPE;
        const isTab = key === KeyCode.TAB;

        if (isEnter || isTab || isEscape) {
            if (isEnter || isTab) {
                _syncFromEditors(beans, { persist: true }, validationCache);
            } else {
                // Mid-batch Escape cancels every live editor attempt while preserving values already staged
                // in the batch. The cancellation path deliberately never runs application validators.
                this.strategy?.stopCancelled(false);
            }

            if (!isEscape && this.batch) {
                this.strategy?.cleanupEditors(undefined, undefined, validationCache);
            } else if (!this.batch) {
                _destroyEditors(beans, model.getEditPositions(), { event, cancel: isEscape }, validationCache);
            }

            event.preventDefault();

            this.bulkRefreshMap(edits, { suppressFlash: true });

            return model.getEditMapCopy();
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
    }: StopContext & { params?: StopEditParams; res: boolean }): void {
        const beans = this.beans;
        if (res && position) {
            if (!this.batch || commit) {
                this.model.removeEdits(position);
            }
        }

        // Suppress navigation is required for bulk activities like pasting or fill handle via setDataValue,
        // otherwise navigateAfterEdit will cause the grid to redundantly scan for the next available cell
        // to edit, which causes focus and rendering changes, for each cell in the bulk operation.
        // A block-rejected stop never happened, so navigating would strand the held invalid editor.
        if (!this.stopBlockRejected) {
            this.navigateAfterEdit(params, cellCtrl?.cellPosition);
        }

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

            // res is false when block mode rejected the commit, so the batch stays open (see
            // stopBatchEditing) and no batchEditingStopped fires — the batch has not stopped.
            const batchCommit = res && commit;
            const batchCancel = willCancel && forceCancel;

            // Only fire batchEditingStopped when the batch is genuinely ending:
            // - commit: commitBatchEdit() was called (forceStop + commit) and validation passed
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

    /**
     * Reverts each invalid cell to its previous pending value, so a revert-mode batch commit still
     * writes an earlier valid edit and drops cells that never held one. A row error invalidates the row.
     */
    private revertInvalidEdits(): void {
        const model = this.model;
        const positions = model.getEditPositions();
        // Chosen up front: each revert revalidates the row, and a row error clearing part-way through
        // would spare the siblings it had invalidated.
        const invalid: Required<EditPosition>[] = [];
        for (let i = 0, len = positions.length; i < len; ++i) {
            const position = positions[i];
            if (model.hasValidationErrors(position)) {
                invalid.push(position);
            }
        }
        for (let i = 0, len = invalid.length; i < len; ++i) {
            this.revertCellEdit(invalid[i]);
        }
    }

    /** Closes one cell's editor while its row keeps editing, so the edit and its pending value survive. */
    public closeCellEditor(position: Required<EditPosition>, validationCache?: EditorValidationCache): void {
        const beans = this.beans;
        // Staged first: the editor goes while the row edit carries on, so an unstaged value would be lost.
        _syncFromEditorComp(beans, position, { persist: true, isStopping: true }, validationCache);
        _destroyEditor(beans, position, {}, undefined, validationCache);
    }

    /**
     * Drops a cell's in-flight editor attempt, keeping any earlier pending value (per-cell Escape
     * semantics), leaving any surrounding row or batch edit untouched. Callers that must revert one
     * cell without a key event go through here.
     */
    public revertCellEdit(position: Required<EditPosition>, validationCache?: EditorValidationCache): void {
        const beans = this.beans;
        _destroyEditor(beans, position, { cancel: true }, undefined, validationCache);
        const model = this.model;
        const previousRowValidationModel = model.getRowValidationModel();
        model.stop(position, true, true);
        // The dropped attempt takes its error with it — outside the stop pipeline nothing else clears it.
        model.getCellValidationModel().clearCellValidation(position);
        // The row rule was last run against the value just dropped, so its verdict is about a value the
        // row no longer holds — recompute it and announce any resulting change.
        _populateRowValidationErrors(beans);
        const cellValidationModel = model.getCellValidationModel();
        _announceChangedValidationErrors(
            beans,
            { cell: cellValidationModel, row: previousRowValidationModel },
            { cell: cellValidationModel, row: model.getRowValidationModel() }
        );
        const rowCtrl = _getRowCtrl(beans, position);
        if (rowCtrl) {
            this.applyRowEditStyles(rowCtrl);
        }
        _getCellCtrl(beans, position)?.refreshCell(FORCE_REFRESH);
    }

    private processEdits(edits: EditMap, source: EditSource, skipAllCommits: boolean): EditPosition[] {
        const rowNodes = Array.from(edits.keys());

        const editsToDelete: EditPosition[] = [];

        const { changeDetectionSvc } = this.beans;
        changeDetectionSvc?.beginDeferred();
        try {
            for (const rowNode of rowNodes) {
                const editRow = edits.get(rowNode)!;
                for (const column of editRow.keys()) {
                    const editValue = editRow.get(column)!;
                    const position: Required<EditPosition> = { rowNode, column };

                    if (_sourceAndPendingDiffer(editValue) && !skipAllCommits) {
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
                this.model.setEdit(position, { sourceValue: edit.pendingValue });
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
        let refreshParams: RefreshCellsParams = FORCE_REFRESH;
        if (params?.forceRefreshOfEditCellsOnly) {
            // Only refresh the current edit cells: gather row keys + deduped columns in one pass.
            const rowNodes: IRowNode[] = [];
            const columns = new Set<Column>();
            edits.forEach((editRow, rowNode) => {
                rowNodes.push(rowNode);
                for (const column of editRow.keys()) {
                    columns.add(column);
                }
            });
            refreshParams = { rowNodes, columns: Array.from(columns), ...FORCE_REFRESH };
        }
        this.beans.rowRenderer.refreshCells(refreshParams);
    }

    private dispatchEditValuesChanged(
        rowNode: IRowNode,
        column: Column,
        edit: Partial<Pick<EditValue, 'pendingValue' | 'sourceValue'>> = {}
    ): void {
        const { pendingValue, sourceValue } = edit;
        const { rowIndex, rowPinned, data } = rowNode;
        this.eventSvc.dispatchEvent({
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

    // A bulk write (paste/fill/range-delete/undo) stages many cells via setDataValue. Between
    // beginBulkWrite/endBulkWrite the per-cell editor cleanup and refresh are deferred, then applied
    // once on the outermost endBulkWrite — turning O(N^2) per-cell work into O(N). Callers own try/finally.
    public beginBulkWrite(): void {
        this.bulkWriteDepth++;
    }

    public endBulkWrite(): void {
        if (--this.bulkWriteDepth === 0) {
            this.flushBulkWrite();
        }
    }

    private flushBulkWrite(): void {
        const touched = this.bulkWriteTouched;
        this.bulkWriteTouched = [];
        if (!this.batch || touched.length === 0) {
            return;
        }

        // A pre-existing open editor (rare during a bulk write) is torn down once here; the common
        // no-editor case skips it in O(1). Staged cells were already scope-purged per cell.
        if (this.model.hasOpenEditors()) {
            this.cleanupEditors();
        }

        // refCell drives CSRM-only ancestor/group refresh, matching bulkRefreshCell/bulkRefreshMap.
        if (!this.csrm) {
            return;
        }

        // Refresh each cell once (a cell can be staged more than once per bulk write), and dedup shared
        // ancestor (group/total) refreshes across cells too.
        const seenCells = new Map<IRowNode, Set<Column>>();
        const seenAncestors = new Map<IRowNode, Set<Column>>();
        for (let i = 0, len = touched.length; i < len; ++i) {
            const position = touched[i];
            const { rowNode, column } = position;
            if (markSeen(seenCells, rowNode, column)) {
                this.refCell(rowNode, column, this.model.getCellEdit(rowNode, column), undefined, seenAncestors);
            }
        }
    }

    private bulkRefreshCell(position: Required<EditPosition>, params?: RefreshCellsParams): void {
        if (this.csrm) {
            const { rowNode, column } = position;
            this.refCell(rowNode, column, this.model.getCellEdit(rowNode, column), params);
        }
    }

    private bulkRefreshMap(editMap: EditMap, params?: RefreshCellsParams): void {
        if (this.csrm) {
            editMap.forEach((editRow, rowNode) => {
                for (const column of editRow.keys()) {
                    this.refCell(rowNode, column, editRow.get(column), params);
                }
            });
        }
    }

    private refCell(
        rowNode: IRowNode,
        column: Column,
        edit: EditValue | undefined,
        params: RefreshCellsParams = {},
        seenAncestors?: Map<IRowNode, Set<Column>>
    ): void {
        const { beans, gos } = this;
        const pinnedSibling = (rowNode as RowNode).pinnedSibling;

        // Primary cell(s): the row and its pinned sibling (always distinct). Dispatch both, then refresh both.
        this.dispatchEditValuesChanged(rowNode, column, edit);
        if (pinnedSibling) {
            this.dispatchEditValuesChanged(pinnedSibling, column, edit);
        }
        _getCellCtrl(beans, { rowNode, column })?.refreshCell(params);
        if (pinnedSibling) {
            _getCellCtrl(beans, { rowNode: pinnedSibling, column })?.refreshCell(params);
        }

        // Ancestor cells whose displayed value depends on this cell (sibling/group/total rows).
        const batch = this.batch;
        const sibling = rowNode.sibling;
        if (sibling) {
            refreshAncestorCell(beans, sibling, column, params, batch, seenAncestors);
        }

        let parent = rowNode.parent;
        if (!parent) {
            return; // no parent (e.g. pinned rows) — no ancestor cells to refresh
        }
        const groupTotalRow = gos.get('groupTotalRow');
        const grandTotalRow = gos.get('grandTotalRow');
        while (parent) {
            const parentSibling = parent.sibling;
            // Group/grand-total footer rows mirror the aggregated cell; otherwise refresh the parent itself.
            const target =
                parentSibling && ((parentSibling.footer && groupTotalRow) || (!parent.parent && grandTotalRow))
                    ? parentSibling
                    : parent;
            refreshAncestorCell(beans, target, column, params, batch, seenAncestors);
            parent = parent.parent;
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

    /**
     * Whether anything can report a validation error: a configured rule, or an open editor that validates
     * itself. Both halves are memoised — every probe would otherwise rescan the colDefs and the cell ctrls.
     */
    public hasValidationRules(): boolean {
        return this.hasConfiguredValidation() || this.editorsRequireValidation();
    }

    /** Configured validation: a row-level callback or a colDef rule, so it changes only with the colDefs. */
    private hasConfiguredValidation(): boolean {
        const colModel = this.beans.colModel;
        const version = colModel.colDefsVersion;
        if (this.validationConfigVersion === version) {
            return this.validationConfigResult;
        }
        this.validationConfigVersion = version;

        let required = !!this.gos.get('getFullRowEditValidationErrors');
        const cols = colModel.colDefList;
        for (let i = 0, len = cols.length; !required && i < len; ++i) {
            const colDef = cols[i].colDef;
            const params = colDef.cellEditorParams;
            if (!params || (!colDef.editable && !colDef.groupRowEditable)) {
                continue;
            }
            required =
                // cellEditorParams can be a function, whose per-row rules can't be read from the colDef.
                typeof params === 'function' ||
                params.minLength !== undefined ||
                params.maxLength !== undefined ||
                params.getValidationErrors !== undefined ||
                params.min !== undefined ||
                params.max !== undefined;
        }
        this.validationConfigResult = required;
        return required;
    }

    /** Editor-supplied validation: the scan materialises every rendered cell ctrl, hence the memo. */
    private editorsRequireValidation(): boolean {
        // Only an open editor can match, so with none there is nothing to scan or to remember.
        if (!this.model.hasOpenEditors()) {
            return false;
        }
        this.editorsValidation ??= _scanEditorsForValidation(this.beans);
        return this.editorsValidation;
    }

    /** Called wherever an editor comes or goes: created, attached (React mounts late) or gone with its cell. */
    public invalidateEditorsValidation(): void {
        this.editorsValidation = undefined;
    }

    /** Rows whose edits were purged without a stop: the strategy still holds them, so let it release. */
    public releasePurgedRows(rowNodes: Set<IRowNode>): void {
        this.strategy?.releaseRows(rowNodes);
    }

    /** Ends a row's edits as it is torn down; its position can never be reached again. */
    public releaseRowEdits(rowNode: IRowNode): void {
        const editRow = this.model.getEditRow(rowNode);
        if (!editRow?.size || this.beans.gridDestroySvc.destroyCalled) {
            return;
        }
        // Snapshot: the purge dispatches cellEditingStopped, and a listener may edit the map underneath.
        const positions: Required<EditPosition>[] = [];
        for (const column of editRow.keys()) {
            positions.push({ rowNode, column });
        }
        _purgeEdits(this.beans, positions);
    }

    /** Ends edits on every column dropping out of colsList, destroyed or merely parked. */
    public releaseColumnsLeaving(newCols: AgColumn[]): void {
        const editMap = this.model.getEditMap();
        if (!editMap?.size) {
            return;
        }

        // Driven from the edited columns, a handful, rather than diffing a list that can be thousands long.
        const leaving = new Set<Column>();
        for (const editRow of editMap.values()) {
            for (const column of editRow.keys()) {
                leaving.add(column);
            }
        }
        for (let i = 0, len = newCols.length; leaving.size > 0 && i < len; ++i) {
            leaving.delete(newCols[i]);
        }
        if (!leaving.size) {
            return;
        }

        const positions: Required<EditPosition>[] = [];
        editMap.forEach((editRow, rowNode) => {
            for (const column of editRow.keys()) {
                if (leaving.has(column)) {
                    positions.push({ rowNode, column });
                }
            }
        });
        _purgeEdits(this.beans, positions);
    }

    public cellEditingInvalidCommitBlocks(): boolean {
        return this.gos.get('invalidEditValueMode') === 'block';
    }

    public checkNavWithValidation(
        position?: EditPosition,
        event?: Event | CellFocusedEvent,
        focus: boolean = true
    ): EditNavOnValidationResult {
        return this.checkNavWithValidationAndCache(position, event, focus).result;
    }

    /** Returns the validation snapshot so an immediately following stop can reuse the same pass. */
    public checkNavWithValidationAndCache(
        position?: EditPosition,
        event?: Event | CellFocusedEvent,
        focus: boolean = true
    ): { result: EditNavOnValidationResult; validationCache: EditorValidationCache } {
        const validationCache = this.revalidate();
        if (this.checkValidated(position)) {
            const cellCtrl = _getCellCtrl(this.beans, position);
            if (this.cellEditingInvalidCommitBlocks()) {
                (event as Event)?.preventDefault?.();
                if (focus) {
                    if (cellCtrl && !cellCtrl.hasBrowserFocus()) {
                        cellCtrl.focusCell();
                    }
                    cellCtrl?.comp?.getCellEditor()?.focusIn?.();
                }
                return { result: 'block-stop', validationCache };
            }

            if (cellCtrl) {
                this.revertSingleCellEdit(cellCtrl);
            }

            return { result: 'revert-continue', validationCache };
        }

        return { result: 'continue', validationCache };
    }

    /**
     * Runs editor setup against an existing validation pass. Attaching the new editor refreshes validation;
     * seeding that refresh avoids invoking every already-validated editor again and appends only new editors.
     */
    public withEditorAttachValidationCache(
        validationCache: EditorValidationCache | undefined,
        cellCtrl: CellCtrl,
        action: () => void
    ): EditorValidationCache | undefined {
        // A new setup supersedes any unresolved request for this cell.
        this.pendingEditorAttachValidation.delete(cellCtrl);
        if (!validationCache) {
            action();
            return undefined;
        }

        // Share the map: each delayed restored editor must append to the snapshot later used by stopEditing.
        const previousCompDetails = cellCtrl.editCompDetails;
        const previousCache = this.editorAttachValidationCache;
        const augmentedCache = validationCache;
        this.editorAttachValidationCache = augmentedCache;
        try {
            action();
        } finally {
            this.editorAttachValidationCache = previousCache;
        }

        const compDetails = cellCtrl.editCompDetails;
        if (compDetails && compDetails !== previousCompDetails && !cellCtrl.comp?.getCellEditor()) {
            // `compDetails` is the request token: CellCtrl alone could lend the verdict to a replacement editor.
            this.pendingEditorAttachValidation.set(cellCtrl, { compDetails, validationCache: augmentedCache });
        }
        return augmentedCache;
    }

    /** Calls through to standalone method for treeshaking via the editService */
    public populateModelValidationErrors(cellCtrl?: CellCtrl): void {
        let validationCache = this.editorAttachValidationCache;
        if (!validationCache && cellCtrl) {
            const pending = this.pendingEditorAttachValidation.get(cellCtrl);
            // Take before validating: a duplicate/stale attachment must never consume the same hand-off.
            this.pendingEditorAttachValidation.delete(cellCtrl);
            if (pending && pending.compDetails === cellCtrl.editCompDetails) {
                validationCache = pending.validationCache;
            }
        }
        _populateModelValidationErrors(this.beans, false, validationCache);
    }

    /** The editor request was cancelled or recycled before it could consume its validation hand-off. */
    public clearPendingEditorAttachValidation(cellCtrl: CellCtrl): void {
        this.pendingEditorAttachValidation.delete(cellCtrl);
    }

    /** Same-row Tab must not schedule a second editor while the restored editor is still attaching. */
    public hasPendingEditorAttachValidation(cellCtrl: CellCtrl): boolean {
        const pending = this.pendingEditorAttachValidation.get(cellCtrl);
        if (pending && pending.compDetails === cellCtrl.editCompDetails) {
            return true;
        }
        this.pendingEditorAttachValidation.delete(cellCtrl);
        return false;
    }

    public announceFullRowEditValidationErrors(rowNode?: IRowNode): void {
        _announceFullRowEditValidationErrors(this.beans, rowNode);
    }

    /**
     * A cell component has attached: opens its editor if the cell is (or is starting) editing.
     * @returns whether the cell is editing, so the caller renders its value only when it is not.
     */
    public onCompAttached(cellCtrl: CellCtrl, startEdit?: boolean): boolean {
        const editable = startEdit ? cellCtrl.isCellEditable() : undefined;
        const editing = !!editable || this.isEditing(cellCtrl, { withOpenEditor: true });
        if (editing) {
            this.startEditing(cellCtrl, {
                startedEdit: false,
                source: 'api',
                silent: true,
                continueEditing: true,
                editable,
            });
        }

        return editing;
    }

    /** Replays a start that was waiting for a component — React mounts one a turn late. Called after the
     *  cell has rendered, so the editor takes over a cell that is already showing its value. */
    public replayPendingStart(cellCtrl: CellCtrl): void {
        const params = cellCtrl.pendingEditStart!;
        cellCtrl.pendingEditStart = null;
        this.startEditing(cellCtrl, params);
    }

    /** A cell leaving takes its validation, and the focus it was owed, with it. */
    public onCellDestroyed(cellCtrl: CellCtrl): void {
        this.pendingEditorAttachValidation.delete(cellCtrl);
        if (this.pendingEditorFocus === cellCtrl) {
            this.pendingEditorFocus = null;
        }
        if (cellCtrl.comp?.getCellEditor()) {
            this.invalidateEditorsValidation();
        }
    }

    /** Focus can only be in one place, so a later request replaces an earlier one. */
    public focusEditorOnAttach(cellCtrl: CellCtrl, focusCell: boolean): void {
        this.pendingEditorFocus = cellCtrl;
        this.pendingEditorFocusCell = focusCell;
    }

    /** An editor has attached to its cell — both view layers route here once the editor is live. */
    public onEditorAttached(cellCtrl: CellCtrl): void {
        // The editor lands after the setup that created it, so the validation memo is stale until now.
        this.invalidateEditorsValidation();
        cellCtrl.rangeFeature?.unsetComp();

        if (this.pendingEditorFocus !== cellCtrl) {
            return;
        }
        const focusCell = this.pendingEditorFocusCell;
        this.pendingEditorFocus = null;
        if (focusCell) {
            cellCtrl.focusCell({ forceBrowserFocus: true });
        }
        cellCtrl.comp?.getCellEditor()?.focusIn?.();
    }

    /** Calls through to standalone method for treeshaking via the editService */
    public onPopupEditorClosed(cellCtrl: CellCtrl, event?: MouseEvent | TouchEvent | KeyboardEvent): void {
        _onPopupEditorClosed(this.beans, cellCtrl, event);
    }

    public revertSingleCellEdit(cellPosition: Required<EditPosition>, focus = false): void {
        const cellCtrl = _getCellCtrl(this.beans, cellPosition);
        if (!cellCtrl?.comp?.getCellEditor()) {
            // don't cancel/revert if there is no editor
            return;
        }

        _destroyEditor(this.beans, cellPosition, { silent: true });

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

    /**
     * Brings the validation state up to date, then reports it. Not a plain query: use the model's
     * {@link EditModelService.hasValidationErrors} when the state is known to be current.
     */
    public revalidateAndCheck(position?: EditPosition): boolean {
        this.revalidate();
        return this.checkValidated(position);
    }

    private revalidate(): EditorValidationCache {
        // Buffered input has to reach the value before validity is read, or the answer describes the
        // pre-flush value while the stop that follows commits the flushed one.
        _flushEditors(this.beans);
        return _populateModelValidationErrors(this.beans);
    }

    /** The read half of {@link revalidateAndCheck}, for a caller that has just revalidated. */
    public checkValidated(position?: EditPosition): boolean {
        const cellCtrl = _getCellCtrl(this.beans, position);
        if (cellCtrl) {
            cellCtrl.refreshCell(FORCE_REFRESH);
            // refresh the styles directly rather than through refreshRow as that causes the group cell renderer to
            // be recreated and would discard future mouse click events
            this.applyRowEditStyles(cellCtrl.rowCtrl);
        }

        return this.model.hasValidationErrors(position);
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
        const validation = editing ? this.checkNavWithValidationAndCache(undefined, event) : undefined;
        const preventNavigation = validation?.result === 'block-stop';

        if (prev instanceof CellCtrl && editing) {
            // if we are editing, we know it's not a Full Width Row (RowComp)
            res = this.strategy?.moveToNextEditingCell(
                prev,
                backwards,
                event,
                source,
                preventNavigation,
                validation?.validationCache
            );
        }

        if (res === null) {
            return res;
        }

        // if a cell wasn't found, it's possible that focus was moved to the header
        res = res || !!this.beans.focusSvc.focusedHeader;

        if (res === false && !preventNavigation) {
            // not a header and not the table
            this.stopEditing(undefined, undefined, validation?.validationCache);
        }

        return res;
    }

    /**
     * Gets the pending edit value for a cell (used by ValueService).
     * Returns undefined to fallback to committed data/valueGetter.
     */
    public getPendingEditValue(rowNode: IRowNode, column: Column, from: Exclude<CellValueResolveFrom, 'data'>): any {
        // Caller (ValueService.getValue) has already resolved any pivot result column.
        const batch = this.batch;
        if (from === 'batch' && !batch) {
            return undefined; // 'batch' mode: only return edit values when batch editing is active
        }

        const edit = this.model.getCellEditWithSibling(rowNode, column);
        if (!edit) {
            return undefined;
        }

        // Skip during stopEditing when value was already committed (non-batch, no editor opened)
        if (this.stopping && !batch && !edit.editorState?.cellStartedEditing) {
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
        const edit = this.model.getCellEditWithSibling(position.rowNode, position.column);
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

        this.dispatchEditValuesChanged(position.rowNode, position.column, { ...existing, pendingValue: sourceValue });
        this.model.removeEdits(position);
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

            _syncFromEditor(beans, position, newValue, { persist: true });
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
            _syncFromEditor(this.beans, position, newValue, { persist: true });
            this.ensureBatchStarted();
            this.stopEditing(position, {
                source: source as any,
                suppressNavigateAfterEdit: true,
            });
            return true; // value was synced (in batch, stopEditing stays active but the edit is applied)
        }

        // sourceValue === newValue: setting back to original value removes the edit entirely.
        this.model.removeEdits(position);
        this.ensureBatchStarted();

        this.dispatchEditValuesChanged(position.rowNode, position.column, {
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
        _syncFromEditor(beans, position, newValue, { persist: true });

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
        if (cellCtrl.hasBrowserFocus()) {
            this.focusEditorOnAttach(cellCtrl, true);
        }

        _destroyEditor(beans, position, { silent: true, cancel: true });
        _setupEditor(beans, position, { silent: true });
        _populateModelValidationErrors(beans);
        _getCellCtrl(beans, position)?.refreshCell(FORCE_REFRESH);

        return true;
    }

    /** editApi or undoRedoApi apply change without involving the editor. */
    private applyDirectValue(position: Required<EditPosition>, newValue: any, eventSource?: string): boolean {
        const beans = this.beans;

        if (this.batch) {
            const bulkWrite = this.bulkWriteDepth > 0;
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
                _syncFromEditor(beans, position, newValue, { persist: true });

                // 'batch' source (no open editor) stages a pending value without disrupting display;
                // other sources close the editor, symmetrically with how default setDataValue works.
                // Within a bulk write this cleanup is coalesced into a single flush pass.
                if (eventSource !== 'batch' && !bulkWrite) {
                    this.cleanupEditors();
                }
            }

            // Only the cell just staged can have become unchanged; a full-map rescan here is O(N^2)
            // across a bulk paste/fill (each staged cell would rescan every pending edit).
            _purgeUnchangedEdit(beans, position);

            // Lazily dispatch batchEditingStarted for direct API writes during batch.
            this.ensureBatchStarted();

            if (bulkWrite) {
                this.bulkWriteTouched.push(position);
            } else {
                // Refresh the changed cell and dispatch cellEditValuesChanged so consumers
                // (e.g. find service) react to the pending value update.
                this.bulkRefreshCell(position);
            }
            return true;
        }

        _syncFromEditor(beans, position, newValue, { persist: true });

        const cellCtrl = _getCellCtrl(beans, position);
        const success = this.setNodeDataValue(position.rowNode, position.column, newValue, cellCtrl, eventSource);

        this.syncEditAfterCommit(position, success);

        // After undo/redo or direct data writes, the edit's pendingValue may now match sourceValue.
        // Only this cell changed, so a scoped purge suffices (a full rescan here would be O(N^2) in bulk).
        _purgeUnchangedEdit(beans, position);

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

        const hasEdits = model.hasRowEdits(position.rowNode, true);

        if (!hasEdits) {
            return;
        }

        const { rowNode } = position;
        const { compDetails, valueToDisplay } = params;

        if (compDetails) {
            const { params } = compDetails;
            params.data = model.getEditRowDataValue(rowNode);
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
        const event: BatchEditingStartedEvent | BatchEditingStoppedEvent = _addGridCommonParams(this.gos, {
            type,
            // Only the stopped event carries what changed.
            ...(type === 'batchEditingStopped' ? { changes: this.toEventChangeList(edits) } : {}),
        });
        this.eventSvc.dispatchEvent(event);
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

        const edits: EditMap = this.model.getEditMapCopy();
        let editValue = edits.get(rowNode)?.get(column)?.pendingValue;

        let bulkStartDispatched = false;
        if (!this.batch) {
            // bulk edits occurring during batch are handled as a batch set of changes
            this.eventSvc.dispatchEvent({ type: 'bulkEditingStarted' });
            bulkStartDispatched = true;
        }

        const isFormula = formula?.isFormula(editValue) ?? false;

        for (let i = 0, len = ranges.length; i < len; ++i) {
            const range = ranges[i];
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
        }

        // One bulk edit however many ranges it spans, so commit once: a stopped event per range leaves
        // the pair unbalanced, and consumers that latch on the first (undo/redo) drop every later range.
        this.setEditMap(edits);

        if (this.batch) {
            this.cleanupEditors();

            _purgeUnchangedEdits(beans);

            this.ensureBatchStarted();
        } else {
            this.committing = true;
            try {
                this.stopEditing(undefined, { source: 'bulk' });
            } finally {
                this.committing = false;
                if (bulkStartDispatched) {
                    this.eventSvc.dispatchEvent({ type: 'bulkEditingStopped', changes: this.toEventChangeList(edits) });
                }
            }
        }

        // focus the first cell in the range
        const cellCtrl = _getCellCtrl(beans, { rowNode, column })!;
        if (cellCtrl) {
            cellCtrl.focusCell({ forceBrowserFocus: true });
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

function getEditType(gos: GridOptionsService, editType?: EditStrategyType) {
    return editType ?? gos.get('editType') ?? 'singleCell';
}

/** Records a (node, column) pair; returns false if it was already recorded (a duplicate). */
const markSeen = (seen: Map<IRowNode, Set<Column>>, node: IRowNode, column: Column): boolean => {
    let cols = seen.get(node);
    if (!cols) {
        cols = new Set();
        seen.set(node, cols);
    }
    if (cols.has(column)) {
        return false;
    }
    cols.add(column);
    return true;
};

/** Refreshes one ancestor (group/total/sibling) cell, deduping across a bulk-write flush via `seenAncestors`. */
const refreshAncestorCell = (
    beans: BeanCollection,
    node: IRowNode,
    column: Column,
    params: RefreshCellsParams,
    batch: boolean,
    seenAncestors: Map<IRowNode, Set<Column>> | undefined
): void => {
    if (seenAncestors && !markSeen(seenAncestors, node, column)) {
        return; // already refreshed this ancestor cell earlier in the bulk-write flush
    }
    const cellCtrl = _getCellCtrl(beans, { rowNode: node, column });
    if (cellCtrl) {
        cellCtrl.refreshCell(params);
        // During batch, parent/group/grand-total rows need their batch edit CSS updated even when their
        // aggregated value is unchanged (dataNeedsUpdating is false, so refreshCell alone won't run it).
        if (!params.force && batch) {
            _applyCellEditStyles(beans, cellCtrl);
        }
    }
};
