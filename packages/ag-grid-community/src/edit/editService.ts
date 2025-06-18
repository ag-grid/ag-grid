import { KeyCode } from '../constants/keyCode';
import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import type { AgColumn } from '../entities/agColumn';
import { _getRowNode } from '../entities/positionUtils';
import type { RowNode } from '../entities/rowNode';
import type { AgEventType } from '../eventTypes';
import { _isClientSideRowModel } from '../gridOptionsUtils';
import type { CellRange, IRangeService } from '../interfaces/IRangeService';
import type { EditStrategyType } from '../interfaces/editStrategyType';
import type {
    EditingCellPosition,
    ICellEditorParams,
    ICellEditorValidationError,
    SetEditingCellsParams,
} from '../interfaces/iCellEditor';
import type { RefreshCellsParams } from '../interfaces/iCellsParams';
import type { EditMap, EditRow, EditValue, GetEditsParams, IEditModelService } from '../interfaces/iEditModelService';
import type {
    EditPosition,
    EditRowPosition,
    EditSource,
    IEditService,
    IsEditingParams,
    StartEditParams,
    StopEditParams,
} from '../interfaces/iEditService';
import type { IRowNode } from '../interfaces/iRowNode';
import type { IRowStyleFeature } from '../interfaces/iRowStyleFeature';
import type { UserCompDetails } from '../interfaces/iUserCompDetails';
import type { CellPosition } from '../main-umd-noStyles';
import { CellCtrl } from '../rendering/cell/cellCtrl';
import { _createCellEvent } from '../rendering/cell/cellEvent';
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
    _purgeUnchangedEdits,
    _refreshEditorOnColDefChanged,
    _syncFromEditor,
    _syncFromEditors,
    _validateEdit,
    _valuesDiffer,
} from './utils/editors';
import { _refreshEditCells } from './utils/refresh';

type BatchPrepDetails = { compDetails?: UserCompDetails; valueToDisplay?: any };

// stop editing sources that we treat as UI-originated so we follow standard processing.
const SOURCE_TRANSFORM: Record<string, EditSource> = {
    paste: 'ui',
    rangeSvc: 'ui',
    fillHandle: 'api',
    cellClear: 'api',
};

const SOURCE_TRANSFORM_KEYS: Set<string> = new Set(Object.keys(SOURCE_TRANSFORM));

const CANCEL_PARAMS: StopEditParams = { cancel: true, source: 'api' };

export class EditService extends BeanStub implements NamedBean, IEditService {
    beanName = 'editSvc' as const;
    private batch: boolean = false;

    private model: IEditModelService;
    private valueSvc: ValueService;
    private rangeSvc: IRangeService;
    private strategy?: BaseEditStrategy;
    private includeParents: boolean = true;

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

        this.addManagedEventListeners({
            columnPinned: handler,
            columnVisible: handler,
            columnRowGroupChanged: handler,
            rowGroupOpened: handler,
            pinnedRowsChanged: handler,
            displayedRowsChanged: handler,
            rowDataUpdated: () => {
                if (this.isEditing()) {
                    if (this.isBatchEditing()) {
                        _destroyEditors(beans, this.model.getEditPositions());
                    } else {
                        this.stopEditing(undefined, CANCEL_PARAMS);
                    }
                }
            },
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
        const nodeIsEditing = this.model.hasEdits(position, params);

        if (nodeIsEditing) {
            return true;
        }

        const { rowNode, column } = position || {};
        const pinnedSibling = (rowNode as RowNode)?.pinnedSibling;
        const siblingIsEditing = pinnedSibling && this.model.hasEdits({ rowNode: pinnedSibling, column }, params);

        return siblingIsEditing ?? false;
    }

    public isRowEditing({ rowNode }: EditRowPosition, params?: IsEditingParams): boolean {
        return this.model.hasEdits({ rowNode }, params) ?? false;
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

        this.strategy!.start(position, event, source, silent, ignoreEventKey);

        return;
    }

    public stopEditing(position?: EditPosition, params?: StopEditParams): boolean {
        const { event, cancel, source = 'ui', suppressNavigateAfterEdit } = params || {};
        const { beans, model } = this;

        if (SOURCE_TRANSFORM_KEYS.has(source)) {
            if (this.isBatchEditing()) {
                // if we are in batch editing, we do not stop editing on paste
                this.bulkRefresh(position);
                return false;
            }

            return this.stopEditing(position, { ...params, source: SOURCE_TRANSFORM[source] });
        }

        if (!this.isEditing() || !this.strategy) {
            return false;
        }

        const cellCtrl = _getCellCtrl(beans, position);
        if (cellCtrl) {
            cellCtrl.onEditorAttachedFuncs = [];
        }

        let edits = model.getEditMap(true);

        let res = false;

        const willStop = !cancel && !!this.shouldStopEditing(position, event, source);
        const willCancel = cancel && !!this.shouldCancelEditing(position, event, source);

        if (willStop || willCancel) {
            _syncFromEditors(beans);
            const freshEdits = model.getEditMap();

            this.strategy?.stop();

            this.processEdits(freshEdits, cancel);

            this.bulkRefresh(undefined, edits);

            edits = freshEdits;

            res ||= willStop;
        } else if (event instanceof KeyboardEvent && this.batch && this.strategy?.midBatchInputsAllowed(position)) {
            const key = event.key;
            const isEnter = key === KeyCode.ENTER;
            const isEscape = key === KeyCode.ESCAPE;

            if (isEnter || isEscape) {
                if (isEnter) {
                    _syncFromEditors(beans);
                } else if (position) {
                    this.strategy?.clearEdits(position);
                }

                _destroyEditors(beans, model.getEditPositions());

                event.preventDefault();

                this.bulkRefresh(position, edits, { suppressFlash: true });

                edits = model.getEditMap();
            }
        } else {
            _syncFromEditors(beans);
            edits = model.getEditMap();
        }

        if (res && position) {
            this.model.removeEdits(position);
        }

        if (!suppressNavigateAfterEdit && cellCtrl) {
            this.navigateAfterEdit(event instanceof KeyboardEvent && event.shiftKey, cellCtrl.cellPosition);
        }

        _purgeUnchangedEdits(beans);

        this.bulkRefresh();

        if (cancel) {
            this.beans.rowRenderer.refreshRows({ suppressFlash: true, force: true });
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

    private processEdits(edits: EditMap, cancel: boolean = false): void {
        const rowNodes = Array.from(edits.keys());
        const { beans } = this;

        for (const rowNode of rowNodes) {
            const editRow = edits.get(rowNode)!;
            for (const column of editRow.keys()) {
                const { newValue, oldValue } = editRow.get(column)!;
                const position: Required<EditPosition> = { rowNode, column };

                const cellCtrl = _getCellCtrl(beans, position);

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

                    cellCtrl?.refreshCell({ force: true, suppressFlash: true });
                }

                this.dispatchCellEvent({ rowNode, column }, undefined, 'cellEditingStopped', {
                    ..._createCellEvent(beans, null, 'cellEditingStopped', position, newValue),
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

        beans.rowRenderer.refreshCells({
            rowNodes,
            suppressFlash: true,
            force: true,
        });
    }

    public setEditMap(edits: EditMap): void {
        this.strategy ??= this.createStrategy();
        this.strategy?.setEditMap(edits);

        this.bulkRefresh();

        // force refresh of all row cells as custom renderers may depend on multiple cell values
        this.beans.rowRenderer.refreshCells({ force: true, suppressFlash: true });
    }

    private dispatchEditValuesChanged(
        { rowNode, column }: EditPosition,
        edit: Partial<Pick<EditValue, 'newValue' | 'oldValue'>> = {}
    ): void {
        if (!rowNode || !column || !edit) {
            return;
        }

        const { newValue, oldValue } = edit;
        const { rowIndex, rowPinned, data } = rowNode;
        this.beans.eventSvc.dispatchEvent({
            type: 'cellEditValuesChanged',
            node: rowNode,
            rowIndex,
            rowPinned,
            column,
            source: 'api',
            data,
            newValue,
            oldValue,
            value: newValue,
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

    public moveToNextCell(
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

        let edit = this.model.getEdit({ rowNode, column });

        const pinnedSibling = (rowNode as RowNode).pinnedSibling;
        if (pinnedSibling) {
            const siblingEdit = this.model.getEdit({ rowNode: pinnedSibling, column });
            if (siblingEdit) {
                edit = siblingEdit;
            }
        }

        const newValue = edit?.newValue;

        return newValue === UNEDITED ? this.valueSvc.getValue(column as AgColumn, rowNode, true, 'api') : newValue;
    }

    getRowDataValue(position: Required<EditRowPosition>, params?: GetEditsParams | undefined) {
        return this.model.getEditRowDataValue(position, params);
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
        if (
            (!this.isEditing() || eventSource === 'commit') &&
            eventSource !== 'paste' &&
            eventSource !== 'rangeSvc' &&
            eventSource !== 'renderer'
        ) {
            return;
        }

        const { beans } = this;

        this.strategy ??= this.createStrategy();

        const existing = this.model.getEdit(position);
        if (existing) {
            if (existing.newValue === newValue) {
                return false;
            }

            if (existing.oldValue !== newValue) {
                _syncFromEditor(beans, position, newValue, eventSource);
                return true;
            }

            if (existing.oldValue === newValue) {
                beans.editModelSvc?.removeEdits(position);

                this.dispatchEditValuesChanged(position, {
                    newValue,
                    oldValue: existing.oldValue,
                });

                return true;
            }
        }

        _syncFromEditor(beans, position, newValue, eventSource);

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

        const hasEdits = this.model.hasRowEdits(position, { checkSiblings: true });

        if (!hasEdits) {
            return;
        }

        const { rowNode, column } = position;
        const { compDetails, valueToDisplay } = params;

        if (compDetails) {
            const { params } = compDetails;
            params.data = this.model.getEditRowDataValue({ rowNode }, { checkSiblings: true });
            return { compDetails };
        }

        const editRow = this.model.getEditRow(position, { checkSiblings: true });

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

        const { beans, rangeSvc, valueSvc } = this;

        _syncFromEditors(beans);

        const edits: EditMap = this.model.getEditMap(true);
        const editValue = edits.get(rowNode)?.get(column!)?.newValue;

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

            if (this.batch) {
                this.cleanupEditors();

                _purgeUnchangedEdits(beans);

                // force refresh of all row cells as custom renderers may depend on multiple cell values
                this.bulkRefresh();
                return;
            }

            this.stopEditing(undefined, { source: 'api' });
        });

        this.bulkRefresh();
    }

    public createCellStyleFeature(cellCtrl: CellCtrl, beans: BeanCollection): CellEditStyleFeature {
        return new CellEditStyleFeature(cellCtrl, beans);
    }

    public createRowStyleFeature(rowCtrl: RowCtrl, beans: BeanCollection): IRowStyleFeature {
        return new RowEditStyleFeature(rowCtrl, beans);
    }

    public setEditingCells(cells: EditingCellPosition[], params?: SetEditingCellsParams): void {
        const { beans, model } = this;
        const { colModel, valueSvc } = beans;

        if (!this?.isBatchEditing()) {
            return;
        }

        let edits: EditMap = new Map();

        if (params?.update) {
            const existingEdits = model.getEditMap();
            edits = new Map(existingEdits?.entries() ?? []);
        }

        cells.forEach(({ colId, column, colKey, rowIndex, rowPinned, newValue, state }) => {
            const col = colId ? colModel.getCol(colId) : colKey ? colModel.getCol(colKey) : column;

            if (!col) {
                return;
            }

            const rowNode = _getRowNode(beans, { rowIndex, rowPinned });

            if (!rowNode) {
                return;
            }
            const oldValue = valueSvc.getValue(col as AgColumn, rowNode, true, 'api');

            if (!_valuesDiffer({ newValue, oldValue }) && state !== 'editing') {
                // If the new value is the same as the old value, we don't need to update
                return;
            }

            let editRow = edits.get(rowNode);

            if (!editRow) {
                editRow = new Map();
                edits.set(rowNode, editRow);
            }

            // translate undefined to unedited, don't translate null as that means cell was cleared
            if (newValue === undefined) {
                newValue = UNEDITED;
            }

            editRow.set(col, { newValue, oldValue, state: state ?? 'changed' });
        });

        this.setEditMap(edits);
    }
}
