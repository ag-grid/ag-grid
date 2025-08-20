import { KeyCode } from '../agStack/constants/keyCode';
import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import type { AgColumn } from '../entities/agColumn';
import { _getRowNode } from '../entities/positionUtils';
import type { RowNode } from '../entities/rowNode';
import type { AgEventType } from '../eventTypes';
import type { BatchEditingStartedEvent, BatchEditingStoppedEvent, CellFocusedEvent } from '../events';
import { _addGridCommonParams, _isClientSideRowModel } from '../gridOptionsUtils';
import type { CellRange, IRangeService } from '../interfaces/IRangeService';
import type { EditStrategyType } from '../interfaces/editStrategyType';
import type { EditingCellPosition, ICellEditorParams, ICellEditorValidationError } from '../interfaces/iCellEditor';
import type { CellPosition } from '../interfaces/iCellPosition';
import type { RefreshCellsParams } from '../interfaces/iCellsParams';
import type { Column } from '../interfaces/iColumn';
import type { EditMap, EditRow, EditValue, IEditModelService } from '../interfaces/iEditModelService';
import type {
    EditNavOnValidationResult,
    EditPosition,
    EditSource,
    IEditService,
    IsEditingParams,
    StartEditParams,
    StopEditParams,
    _SetEditingCellsParams,
} from '../interfaces/iEditService';
import type { IRowNode } from '../interfaces/iRowNode';
import type { IRowStyleFeature } from '../interfaces/iRowStyleFeature';
import type { CellValueChange } from '../interfaces/iUndoRedo';
import type { UserCompDetails } from '../interfaces/iUserCompDetails';
import { CellCtrl } from '../rendering/cell/cellCtrl';
import type { RowCtrl } from '../rendering/row/rowCtrl';
import type { ValueService } from '../valueService/valueService';
import { PopupEditorWrapper } from './cellEditors/popupEditorWrapper';
import type { BaseEditStrategy } from './strategy/baseEditStrategy';
import { CellEditStyleFeature } from './styles/cellEditStyleFeature';
import { RowEditStyleFeature } from './styles/rowEditStyleFeature';
import { _addStopEditingWhenGridLosesFocus, _getCellCtrl } from './utils/controllers';
import {
    UNEDITED,
    _destroyEditors,
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

// these are event sources for setDataValue that will not cause the editors to close
const KEEP_EDITOR_SOURCES = new Set(['undo', 'redo', 'paste', 'bulk']);

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
const SET_DATA_SOURCE_AS_API: Set<string | undefined> = new Set([
    'paste',
    'rangeSvc',
    'renderer',
    'cellClear',
    'redo',
    'undo',
]);

const CANCEL_PARAMS: StopEditParams = { cancel: true, source: 'api' };

const COMMIT_PARAMS: StopEditParams = { cancel: false, source: 'api' };

const CHECK_SIBLING = { checkSiblings: true };

const FORCE_REFRESH = { force: true, suppressFlash: true };

export class EditService extends BeanStub implements NamedBean, IEditService {
    beanName = 'editSvc' as const;
    private batch: boolean = false;

    private model: IEditModelService;
    private valueSvc: ValueService;
    private rangeSvc: IRangeService;
    private strategy?: BaseEditStrategy;
    private stopping = false;
    public committing = false;

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
            } else {
                if (this.isEditing()) {
                    if (this.isBatchEditing()) {
                        _destroyEditors(beans, this.model.getEditPositions());
                    } else {
                        this.stopEditing(undefined, COMMIT_PARAMS);
                    }
                }
            }

            return false;
        };

        this.addManagedEventListeners({
            columnPinned: handler,
            columnVisible: handler,
            columnRowGroupChanged: handler,
            rowGroupOpened: handler,
            pinnedRowsChanged: handler,
            displayedRowsChanged: handler,
            sortChanged: stopInvalidEdits,
            filterChanged: stopInvalidEdits,
            cellFocused: this.onCellFocused.bind(this),
        });
    }

    isBatchEditing(): boolean {
        return this.batch;
    }

    public setBatchEditing(enabled: boolean): void {
        if (enabled) {
            this.batch = true;
            this.stopEditing(undefined, CANCEL_PARAMS);
        } else {
            this.stopEditing(undefined, CANCEL_PARAMS);
            this.batch = false;
        }
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

    public shouldStartEditing(
        position: Required<EditPosition>,
        event?: KeyboardEvent | MouseEvent | null,
        cellStartedEdit?: boolean | null,
        source: EditSource = 'ui'
    ): boolean | null {
        this.strategy ??= this.createStrategy();
        return this.strategy?.shouldStart(position, event, cellStartedEdit, source) ?? null;
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

    public isEditing(position?: EditPosition, params?: IsEditingParams): boolean {
        return this.model.hasEdits(position, params ?? CHECK_SIBLING);
    }

    public isRowEditing(rowNode?: IRowNode, params?: IsEditingParams): boolean {
        return (rowNode && this.model.hasRowEdits(rowNode, params)) ?? false;
    }

    /** @returns whether to prevent default on event */
    public startEditing(position: Required<EditPosition>, params: StartEditParams): void {
        const { startedEdit = true, event = null, source = 'ui', ignoreEventKey = false, silent } = params;

        this.strategy ??= this.createStrategy();

        if (!this.isCellEditable(position, 'api')) {
            return;
        }

        // because of async in React, the cellComp may not be set yet, if no cellComp then we are
        // yet to initialise the cell, so we re-schedule this operation for when celLComp is attached
        const cellCtrl = _getCellCtrl(this.beans, position)!;
        if (cellCtrl && !cellCtrl.comp) {
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

        if (res && this.isBatchEditing()) {
            this.dispatchBatchEvent('batchEditingStarted', new Map());
        }

        this.strategy!.start({
            position,
            event,
            source,
            ignoreEventKey,
            startedEdit,
            silent,
        });

        return;
    }

    public stopEditing(position?: EditPosition, params?: StopEditParams): boolean {
        const { event, cancel, source = 'ui', suppressNavigateAfterEdit } = params || {};
        const { beans, model } = this;

        if (STOP_EDIT_SOURCE_TRANSFORM_KEYS.has(source)) {
            if (this.isBatchEditing()) {
                // if we are in batch editing, we do not stop editing on paste
                this.bulkRefresh(position);
                return false;
            }
        }

        const treatAsSource: EditSource = this.committing ? STOP_EDIT_SOURCE_TRANSFORM[source] : source;

        const isEditingOrBatchWithEdits =
            this.committing ||
            this.isEditing(position) ||
            (this.isBatchEditing() && model.hasEdits(position, CHECK_SIBLING));

        if (!isEditingOrBatchWithEdits || !this.strategy || this.stopping) {
            return false;
        }

        this.stopping = true;

        const cellCtrl = _getCellCtrl(beans, position);
        if (cellCtrl) {
            cellCtrl.onEditorAttachedFuncs = [];
        }

        let edits = model.getEditMap(true);

        let res = false;

        const willStop =
            !cancel && (!!this.shouldStopEditing(position, event, treatAsSource) || (this.committing && !this.batch));
        const willCancel = cancel && !!this.shouldCancelEditing(position, event, treatAsSource);

        if (willStop || willCancel) {
            _syncFromEditors(beans, true);

            const freshEdits = model.getEditMap();

            const editsToDelete = this.processEdits(freshEdits, cancel, source);

            this.strategy?.stop(cancel, event);

            // clear any dangling edits, after editor destruction
            editsToDelete.forEach((position) => {
                model.clearEditValue(position);
            });

            this.bulkRefresh(undefined, edits);

            // refresh previously edited cells
            model.getEditPositions(freshEdits).forEach((pos) => {
                const cellCtrl = _getCellCtrl(beans, pos);
                cellCtrl?.refreshCell({ force: true });
            });

            edits = freshEdits;

            res ||= willStop;
        } else if (
            event instanceof KeyboardEvent &&
            this.batch &&
            this.strategy?.midBatchInputsAllowed(position) &&
            this.isEditing(position, { withOpenEditor: true })
        ) {
            const key = event.key;

            const isEnter = key === KeyCode.ENTER;
            const isEscape = key === KeyCode.ESCAPE;
            const isTab = key === KeyCode.TAB;

            if (isEnter || isTab || isEscape) {
                if (isEnter || isTab) {
                    _syncFromEditors(beans, true);
                } else if (isEscape) {
                    // only if ESC is pressed while in the editor for this cell
                    this.revertSingleCellEdit(cellCtrl!);
                }

                if (this.isBatchEditing()) {
                    this.strategy?.cleanupEditors();
                } else {
                    _destroyEditors(beans, model.getEditPositions(), { event, cancel: isEscape });
                }

                event.preventDefault();

                this.bulkRefresh(position, edits, { suppressFlash: true });

                edits = model.getEditMap();
            }
        } else {
            _syncFromEditors(beans, true);
            edits = model.getEditMap();
        }

        if (res && position) {
            this.model.removeEdits(position);
        }

        // Suppress navigation is required for bulk activities like pasting or fill handle via setDataValue,
        // otherwise navigateAfterEdit will cause the grid to redundantly scan for the next available cell
        // to edit, which causes focus and rendering changes, for each cell in the bulk operation
        if (!suppressNavigateAfterEdit && cellCtrl) {
            this.navigateAfterEdit(event instanceof KeyboardEvent && event.shiftKey, cellCtrl.cellPosition);
        }

        _purgeUnchangedEdits(beans);

        if (!this.model.hasEdits()) {
            this.model.getCellValidationModel().clearCellValidationMap();
            this.model.getRowValidationModel().clearRowValidationMap();
        }

        this.bulkRefresh();

        if (willCancel) {
            // if we cancelled the edit, we need to refresh the rows to remove the pending value and editing styles
            this.beans.rowRenderer.refreshRows({ rowNodes: Array.from(edits.keys()) });
        }

        if (this.isBatchEditing()) {
            this.beans.rowRenderer.refreshRows({ suppressFlash: true, force: true });
            if (res && willStop) {
                this.dispatchBatchEvent('batchEditingStopped', edits);
            }
        }

        this.stopping = false;

        return res;
    }

    private navigateAfterEdit(shiftKey: boolean, cellPosition: CellPosition): void {
        const navAfterEdit = this.gos.get('enterNavigatesVerticallyAfterEdit');

        if (navAfterEdit) {
            const key = shiftKey ? KeyCode.UP : KeyCode.DOWN;
            this.beans.navigation?.navigateToNextCell(null, key, cellPosition, false);
        }
    }

    private processEdits(edits: EditMap, cancel: boolean = false, source: EditSource): EditPosition[] {
        const rowNodes = Array.from(edits.keys());
        const { beans } = this;

        const hasValidationErrors =
            this.model.getCellValidationModel().getCellValidationMap().size > 0 ||
            this.model.getRowValidationModel().getRowValidationMap().size > 0;

        const editsToDelete: EditPosition[] = [];

        for (const rowNode of rowNodes) {
            const editRow = edits.get(rowNode)!;
            for (const column of editRow.keys()) {
                const editValue = editRow.get(column)!;
                const position: Required<EditPosition> = { rowNode, column };
                const cellCtrl = _getCellCtrl(beans, position);
                const valueChanged = _sourceAndPendingDiffer(editValue);

                const isCancelAfterEnd = cellCtrl?.comp?.getCellEditor()?.isCancelAfterEnd?.();

                if (!cancel && !isCancelAfterEnd && valueChanged && !hasValidationErrors) {
                    const success = this.setNodeDataValue(rowNode, column, editValue.pendingValue, undefined, source);
                    if (!success) {
                        editsToDelete.push(position);
                    }
                }
            }
        }

        return editsToDelete;
    }

    private setNodeDataValue(
        rowNode: IRowNode,
        column: Column,
        newValue: any,
        refreshCell?: boolean,
        originalSource?: string
    ): boolean {
        const { beans } = this;
        const cellCtrl = _getCellCtrl(beans, { rowNode, column });

        // we suppressRefreshCell because the call to rowNode.setDataValue() results in change detection
        // getting triggered, which results in all cells getting refreshed. we do not want this refresh
        // to happen on this call as we want to call it explicitly below. otherwise refresh gets called twice.
        // if we only did this refresh (and not the one below) then the cell would flash and not be forced.
        if (cellCtrl) {
            cellCtrl.suppressRefreshCell = true;
        }
        this.commitNextEdit();
        const success = rowNode.setDataValue(column, newValue, originalSource === 'ui' ? 'edit' : originalSource);
        if (cellCtrl) {
            cellCtrl.suppressRefreshCell = false;
        }

        if (refreshCell) {
            cellCtrl?.refreshCell(FORCE_REFRESH);
        }

        return success;
    }

    public setEditMap(edits: EditMap, params?: _SetEditingCellsParams): void {
        this.strategy ??= this.createStrategy();
        this.strategy?.setEditMap(edits, params);

        this.bulkRefresh();

        // force refresh of all row cells as custom renderers may depend on multiple cell values
        this.beans.rowRenderer.refreshCells(FORCE_REFRESH);
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

    public bulkRefresh(position: EditPosition = {}, editMap?: EditMap, params: RefreshCellsParams = {}): void {
        const { beans, gos } = this;
        const { editModelSvc, rowModel } = beans;

        if (_isClientSideRowModel(gos, rowModel)) {
            if (position.rowNode && position.column) {
                this.refCell(position as Required<EditPosition>, this.model.getEdit(position), params);
            } else if (editMap) {
                editModelSvc?.getEditMap(false)?.forEach((editRow, rowNode) => {
                    for (const column of editRow.keys()) {
                        this.refCell({ rowNode, column }, editRow.get(column), params);
                    }
                });
            }
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

        updatedNodes.forEach((node) => this.dispatchEditValuesChanged({ rowNode: node, column }, edit));
        updatedNodes.forEach((node) => _getCellCtrl(beans, { rowNode: node, column })?.refreshCell(params));
        refreshNodes.forEach((node) => _getCellCtrl(beans, { rowNode: node, column })?.refreshCell(params));
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
                    !cellCtrl?.hasBrowserFocus() && cellCtrl?.focusCell();
                    cellCtrl?.comp?.getCellEditor()?.focusIn?.();
                }
                return 'block-stop';
            }

            cellCtrl && this.revertSingleCellEdit(cellCtrl);

            return 'revert-continue';
        }

        return 'continue';
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
        // refresh the styles directly rather than through refreshRow as that causes the group cell renderer to
        // be recreated and would discard future mouse click events
        cellCtrl.rowCtrl.rowEditStyleFeature?.applyRowStyles();

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
            cellCtrl.rowCtrl.rowEditStyleFeature?.applyRowStyles();
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

    public getCellDataValue({ rowNode, column }: Required<EditPosition>, preferEditor = true): any {
        if (!rowNode || !column) {
            return undefined;
        }

        let edit = this.model.getEdit({ rowNode, column });

        const pinnedSibling = (rowNode as RowNode).pinnedSibling;
        if (pinnedSibling) {
            const siblingEdit = this.model.getEdit({ rowNode: pinnedSibling, column });
            if (siblingEdit) {
                edit = siblingEdit;
            }
        }

        const newValue = preferEditor ? edit?.editorValue ?? edit?.pendingValue : edit?.pendingValue;

        return newValue === UNEDITED || !edit
            ? this.valueSvc.getValue(column as AgColumn, rowNode, true, 'api')
            : newValue;
    }

    public addStopEditingWhenGridLosesFocus(viewports: HTMLElement[]): void {
        // TODO: find a better place for this
        _addStopEditingWhenGridLosesFocus(this, this.beans, viewports);
    }

    public createPopupEditorWrapper(params: ICellEditorParams): PopupEditorWrapper {
        // TODO: find a better place for this
        return new PopupEditorWrapper(params);
    }

    public commitNextEdit(): void {
        this.committing = true;
    }

    public setDataValue(position: Required<EditPosition>, newValue: any, eventSource?: string): boolean | undefined {
        try {
            if ((!this.isEditing() || this.committing) && !SET_DATA_SOURCE_AS_API.has(eventSource)) {
                return;
            }

            const { beans } = this;

            this.strategy ??= this.createStrategy();
            const source = this.isBatchEditing() ? 'ui' : this.committing ? eventSource ?? 'api' : 'api';

            if (!eventSource || KEEP_EDITOR_SOURCES.has(eventSource)) {
                // editApi or undoRedoApi apply change without involving the editor
                _syncFromEditor(beans, position, true, newValue, eventSource);

                // a truthy return here indicates the operation succeeded, and if invoked from rowNode.setDataValue, will not result in a cell value change event
                return this.setNodeDataValue(position.rowNode, position.column, newValue, true, eventSource);
            }

            const existing = this.model.getEdit(position);
            if (existing) {
                if (existing.pendingValue === newValue) {
                    return false;
                }

                if (existing.sourceValue !== newValue) {
                    _syncFromEditor(beans, position, true, newValue, eventSource);
                    this.stopEditing(position, { source: source as any, suppressNavigateAfterEdit: true });
                    return true;
                }

                if (existing.sourceValue === newValue) {
                    beans.editModelSvc?.removeEdits(position);

                    this.dispatchEditValuesChanged(position, {
                        ...existing,
                        pendingValue: newValue,
                    });

                    return true;
                }
            }

            _syncFromEditor(beans, position, true, newValue, eventSource);
            this.stopEditing(position, { source: source as any, suppressNavigateAfterEdit: true });

            return true;
        } finally {
            this.committing = false;
        }
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

        const hasEdits = this.model.hasRowEdits(position.rowNode, CHECK_SIBLING);

        if (!hasEdits) {
            return;
        }

        const { rowNode, column } = position;
        const { compDetails, valueToDisplay } = params;

        if (compDetails) {
            const { params } = compDetails;
            params.data = this.model.getEditRowDataValue(rowNode, CHECK_SIBLING);
            return { compDetails };
        }

        const editRow = this.model.getEditRow(position.rowNode, CHECK_SIBLING);

        if (valueToDisplay !== undefined && editRow?.has(column)) {
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
        return this.model.getEditPositions(edits).map((edit) => ({
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

        _syncFromEditors(beans, true);

        const edits: EditMap = this.model.getEditMap(true);
        const editValue = edits.get(rowNode)?.get(column!)?.pendingValue;

        if (!this.batch) {
            // bulk edits occurring during batch are handled as a batch set of changes
            this.eventSvc.dispatchEvent({ type: 'bulkEditingStarted' });
        }

        ranges.forEach((range: CellRange) => {
            rangeSvc?.forEachRowInRange(range, (position) => {
                const rowNode = _getRowNode(beans, position);
                if (rowNode === undefined) {
                    return;
                }

                const editRow: EditRow = edits.get(rowNode) ?? new Map();
                for (const column of range.columns) {
                    if (!column) {
                        continue;
                    }

                    if (this.isCellEditable({ rowNode, column }, 'api')) {
                        const sourceValue = valueSvc.getValue(column as AgColumn, rowNode, true, 'api');
                        let pendingValue = valueSvc.parseValue(
                            column as AgColumn,
                            rowNode ?? null,
                            editValue,
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
                        });
                    }
                }
                if (editRow.size > 0) {
                    edits.set(rowNode, editRow);
                }
            });

            this.setEditMap(edits);

            if (this.batch) {
                this.cleanupEditors();

                _purgeUnchangedEdits(beans);

                // force refresh of all row cells as custom renderers may depend on multiple cell values
                this.bulkRefresh();
                return;
            }

            this.commitNextEdit();
            this.stopEditing(undefined, { source: 'bulk' });

            this.eventSvc.dispatchEvent({ type: 'bulkEditingStopped', changes: this.toEventChangeList(edits) });
        });

        this.bulkRefresh();

        // focus the first cell in the range
        const cellCtrl = _getCellCtrl(beans, { rowNode, column })!;
        if (cellCtrl) {
            cellCtrl.focusCell(true);
        }
    }

    public createCellStyleFeature(cellCtrl: CellCtrl, beans: BeanCollection): CellEditStyleFeature {
        return new CellEditStyleFeature(cellCtrl, beans);
    }

    public createRowStyleFeature(rowCtrl: RowCtrl, beans: BeanCollection): IRowStyleFeature {
        return new RowEditStyleFeature(rowCtrl, beans);
    }

    public setEditingCells(cells: EditingCellPosition[], params?: _SetEditingCellsParams): void {
        const { beans } = this;
        const { colModel, valueSvc } = beans;

        const edits: EditMap = new Map();

        cells.forEach(({ colId, column, colKey, rowIndex, rowPinned, newValue: pendingValue, state }) => {
            const col = colId ? colModel.getCol(colId) : colKey ? colModel.getCol(colKey) : column;

            if (!col) {
                return;
            }

            const rowNode = _getRowNode(beans, { rowIndex, rowPinned });

            if (!rowNode) {
                return;
            }
            const sourceValue = valueSvc.getValue(col as AgColumn, rowNode, true, 'api');

            if (!_sourceAndPendingDiffer({ pendingValue, sourceValue }) && state !== 'editing') {
                // If the new value is the same as the old value, we don't need to update
                return;
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
            });
        });

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
