import { _areEqual } from 'ag-stack';

import type {
    AgColumn,
    BeanCollection,
    ColAggFunc,
    ColumnEventType,
    ColumnState,
    IColumnStateUpdateStrategy,
    SortDef,
    SortDirection,
} from 'ag-grid-community';
import {
    BeanStub,
    _applyColumnState,
    _dispatchColumnChangedEvent,
    _setColsVisible,
    isColumnGroupAutoCol,
    isSpecialCol,
} from 'ag-grid-community';

import type {
    ColumnStateConcreteUpdateStrategy,
    CommitOperation,
    CommitOperations,
    DeferredState,
} from './columnStateUpdateTypes';

const noop = () => {};
type StrategyBeans = BeanCollection;

/** Cycle: ascending default (`undefined`/`'asc'`) -> descending -> `null` (no sort, natural order) -> ascending. */
function getNextPivotSort(current: SortDirection | undefined): SortDirection {
    if (current === 'desc') {
        return null;
    }
    if (current === null) {
        return 'asc';
    }
    return 'desc';
}

export class ColumnStateUpdateExecutionStrategy extends BeanStub implements IColumnStateUpdateStrategy {
    public beanName = 'columnStateUpdateExecutionStrategy' as const;
    private syncUpdateStrategy?: SynchronousColumnStateUpdateStrategy;
    private deferredUpdateStrategy?: DeferredColumnStateUpdateStrategy;

    public applyColumnState(deferMode: boolean, state: ColumnState[], eventType: ColumnEventType): void {
        this.getUpdateStrategy(deferMode).applyColumnState(state, eventType);
    }
    public commit(deferMode: boolean): void {
        this.getUpdateStrategy(deferMode).commit();
    }
    public hasPendingChanges(deferMode: boolean): boolean {
        return this.getUpdateStrategy(deferMode).hasPendingChanges();
    }
    public moveColumns(deferMode: boolean, columns: AgColumn[], targetIndex: number, eventType: ColumnEventType): void {
        this.getUpdateStrategy(deferMode).moveColumns(columns, targetIndex, eventType);
    }
    public reset(deferMode: boolean): void {
        this.getUpdateStrategy(deferMode).reset();
    }
    public setColumnsVisible(
        deferMode: boolean,
        columns: AgColumn[],
        visible: boolean,
        eventType: ColumnEventType
    ): void {
        this.getUpdateStrategy(deferMode).setColumnsVisible(columns, visible, eventType);
    }
    public isColumnVisibleInToolPanel(deferMode: boolean, column: AgColumn): boolean {
        return this.getUpdateStrategy(deferMode).isColumnVisibleInToolPanel(column);
    }
    public setRowGroupColumns(deferMode: boolean, columns: AgColumn[], eventType: ColumnEventType): void {
        this.getUpdateStrategy(deferMode).setRowGroupColumns(columns, eventType);
    }
    public getRowGroupColumns(deferMode: boolean): AgColumn[] {
        return this.getUpdateStrategy(deferMode).getRowGroupColumns();
    }
    public getPrimaryColumns(deferMode: boolean): AgColumn[] {
        return this.getUpdateStrategy(deferMode).getPrimaryColumns();
    }
    public hasDeferredColumnOrder(deferMode: boolean): boolean {
        return this.getUpdateStrategy(deferMode).hasDeferredColumnOrder();
    }
    public setValueColumns(deferMode: boolean, columns: AgColumn[], eventType: ColumnEventType): void {
        this.getUpdateStrategy(deferMode).setValueColumns(columns, eventType);
    }
    public getValueColumns(deferMode: boolean): AgColumn[] {
        return this.getUpdateStrategy(deferMode).getValueColumns();
    }
    public setColumnAggFunc(
        deferMode: boolean,
        column: AgColumn,
        aggFunc: ColAggFunc,
        eventType: ColumnEventType
    ): void {
        this.getUpdateStrategy(deferMode).setColumnAggFunc(column, aggFunc, eventType);
    }
    public getColumnAggFunc(deferMode: boolean, column: AgColumn): ColAggFunc {
        return this.getUpdateStrategy(deferMode).getColumnAggFunc(column);
    }
    public setPivotColumns(deferMode: boolean, columns: AgColumn[], eventType: ColumnEventType): void {
        this.getUpdateStrategy(deferMode).setPivotColumns(columns, eventType);
    }
    public getPivotColumns(deferMode: boolean): AgColumn[] {
        return this.getUpdateStrategy(deferMode).getPivotColumns();
    }
    public setPivotMode(deferMode: boolean, pivotMode: boolean, eventType: ColumnEventType): void {
        this.getUpdateStrategy(deferMode).setPivotMode(pivotMode, eventType);
    }
    public getPivotMode(deferMode: boolean): boolean {
        return this.getUpdateStrategy(deferMode).getPivotMode();
    }
    public isColumnSelectedInPivotModeToolPanel(deferMode: boolean, column: AgColumn): boolean {
        return this.getUpdateStrategy(deferMode).isColumnSelectedInPivotModeToolPanel(column);
    }
    public progressSortFromEvent(deferMode: boolean, column: AgColumn, event: MouseEvent | KeyboardEvent): void {
        this.getUpdateStrategy(deferMode).progressSortFromEvent(column, event);
    }
    public getSortDef(deferMode: boolean, column: AgColumn): SortDef | null {
        return this.getUpdateStrategy(deferMode).getSortDef(column);
    }
    public progressPivotSortFromEvent(deferMode: boolean, column: AgColumn): void {
        this.getUpdateStrategy(deferMode).progressPivotSortFromEvent(column);
    }
    public getPivotSort(deferMode: boolean, column: AgColumn): SortDirection | undefined {
        return this.getUpdateStrategy(deferMode).getPivotSort(column);
    }

    private getUpdateStrategy(deferApply: boolean): ColumnStateConcreteUpdateStrategy {
        return deferApply ? this.getDeferredUpdateStrategy() : this.getSyncUpdateStrategy();
    }

    private getSyncUpdateStrategy(): SynchronousColumnStateUpdateStrategy {
        return (this.syncUpdateStrategy ??= new SynchronousColumnStateUpdateStrategy(this.beans));
    }

    private getDeferredUpdateStrategy(): DeferredColumnStateUpdateStrategy {
        return (this.deferredUpdateStrategy ??= new DeferredColumnStateUpdateStrategy(this.beans));
    }
}

class SynchronousColumnStateUpdateStrategy implements ColumnStateConcreteUpdateStrategy {
    private lastPivotColIds: string[] = [];

    constructor(private readonly beans: StrategyBeans) {}

    public reset = noop;
    public commit = noop;
    public hasPendingChanges = () => false;
    public hasDeferredColumnOrder = () => false;

    public applyColumnState(state: ColumnState[], eventType: ColumnEventType): void {
        if (state.length) {
            _applyColumnState(this.beans, { state }, eventType);
        }
    }

    public moveColumns(columns: AgColumn[], targetIndex: number, eventType: ColumnEventType): void {
        this.beans.colMoves?.moveColumns(columns, targetIndex, eventType); // animation + dispatchEvent
        syncPrimaryColDefOrderFromCurrentColumns(this.beans);
    }

    public setColumnsVisible(columns: AgColumn[], visible: boolean, eventType: ColumnEventType): void {
        _setColsVisible(this.beans, columns, visible, eventType, true);
    }

    public setRowGroupColumns(columns: AgColumn[], eventType: ColumnEventType): void {
        this.beans.rowGroupColsSvc?.setColumns(columns, eventType); // computes which columns actually changed + dispatchEvent
    }

    public getRowGroupColumns(): AgColumn[] {
        return this.beans.rowGroupColsSvc?.columns ?? [];
    }

    public getPrimaryColumns(): AgColumn[] {
        return getPrimaryColumns(this.beans);
    }

    public setValueColumns(columns: AgColumn[], eventType: ColumnEventType): void {
        this.beans.valueColsSvc?.setColumns(columns, eventType); // computes which columns actually changed + dispatchEvent
    }

    public getValueColumns(): AgColumn[] {
        return this.beans.valueColsSvc?.columns ?? [];
    }

    public setColumnAggFunc(column: AgColumn, aggFunc: ColAggFunc, eventType: ColumnEventType): void {
        this.beans.valueColsSvc?.setColumnAggFunc(column, aggFunc, eventType); // dispatchEvent
    }

    public getColumnAggFunc(column: AgColumn): ColAggFunc {
        return column.aggFunc;
    }

    public setPivotColumns(columns: AgColumn[], eventType: ColumnEventType): void {
        this.lastPivotColIds = columns.map((column) => column.colId);
        this.beans.pivotColsSvc?.setColumns(columns, eventType); // computes which columns actually changed + dispatchEvent
    }

    public getPivotColumns(): AgColumn[] {
        return this.beans.pivotColsSvc?.columns ?? [];
    }

    public setPivotMode(pivotMode: boolean, eventType: ColumnEventType): void {
        const { gos, colModel, ctrlsSvc } = this.beans;
        if (pivotMode === colModel.pivotMode) {
            return;
        }

        const currentPivotColIds = this.beans.pivotColsSvc?.columns.map((col) => col.colId) ?? [];
        if (currentPivotColIds.length > 0) {
            this.lastPivotColIds = currentPivotColIds;
        }

        if (!pivotMode) {
            const cols = this.beans.colModel.colDefList;
            _applyColumnState(
                this.beans,
                {
                    state: cols.map((col) => ({
                        colId: col.colId,
                        pivot: false,
                        pivotIndex: null,
                    })),
                },
                eventType
            );
        }
        gos.updateGridOptions({ options: { pivotMode }, source: eventType as any }); // update grid option + refresh
        if (pivotMode && this.lastPivotColIds.length > 0) {
            this.beans.pivotColsSvc?.setColumns(this.lastPivotColIds, eventType);
        }
        ctrlsSvc.getHeaderRowContainerCtrl()?.refresh();
    }

    public progressSortFromEvent(column: AgColumn, event: MouseEvent | KeyboardEvent): void {
        this.beans.sortSvc?.progressSortFromEvent(column, event); // set sort + dispatch event
    }

    public isColumnVisibleInToolPanel(column: AgColumn): boolean {
        return column.isVisible();
    }

    public isColumnSelectedInPivotModeToolPanel(column: AgColumn): boolean {
        return column.isAnyFunctionActive();
    }

    public getPivotMode(): boolean {
        return this.beans.colModel.pivotMode;
    }

    public getSortDef(column: AgColumn): SortDef | null {
        return column.getSortDef();
    }

    public progressPivotSortFromEvent(column: AgColumn): void {
        column.pivotSort = getNextPivotSort(column.pivotSort);
        // Pivot membership is unchanged, so applyColumnState wouldn't fire this - dispatch it to trigger
        // the pivot refresh (columnPivotChanged → refreshModel step 'pivot') that re-derives column order.
        _dispatchColumnChangedEvent(this.beans.eventSvc, 'columnPivotChanged', [column], 'uiColumnSorted');
    }

    public getPivotSort(column: AgColumn): SortDirection | undefined {
        return column.pivotSort;
    }
}

class DeferredColumnStateUpdateStrategy implements ColumnStateConcreteUpdateStrategy {
    private state: DeferredState = {};
    private sequence = 0;
    private lastPivotColIds: string[] = [];

    constructor(private readonly beans: StrategyBeans) {}

    public reset() {
        this.sequence = 0;
        this.state = {};
    }

    public hasPendingChanges(): boolean {
        const { state, beans } = this;
        const { columnState, columnOrder, rowGroup, aggregation, pivot, pivotMode, sort, aggFuncs } = state;
        const getColIds = (cols: AgColumn[] | undefined) => (cols ?? []).map((c) => c.colId);

        if (columnState) {
            for (const [colId, patch] of columnState.patches) {
                const column = beans.colModel.getNonPivotColById(colId);
                if (!column) {
                    continue;
                }
                if (
                    (patch.hide !== undefined && patch.hide !== !column.visible) ||
                    (patch.rowGroup !== undefined && !!patch.rowGroup !== column.rowGroupActive) ||
                    (patch.pivot !== undefined && !!patch.pivot !== column.pivotActive) ||
                    (patch.aggFunc !== undefined &&
                        ((patch.aggFunc ?? null) !== (column.aggFunc ?? null) ||
                            (patch.aggFunc != null) !== column.isValueActive()))
                ) {
                    return true;
                }
            }
        }

        if (columnOrder && !_areEqual(columnOrder.colIds, getPrimaryColumnIds(beans))) {
            return true;
        }
        if (rowGroup && !_areEqual(rowGroup.colIds, getColIds(beans.rowGroupColsSvc?.columns))) {
            return true;
        }
        if (aggregation && !_areEqual(aggregation.colIds, getColIds(beans.valueColsSvc?.columns))) {
            return true;
        }
        if (pivot && !_areEqual(pivot.colIds, getColIds(beans.pivotColsSvc?.columns))) {
            return true;
        }
        if (pivotMode && pivotMode.pivotMode !== beans.colModel.pivotMode) {
            return true;
        }

        if (sort) {
            for (const [colId, sortDef] of sort.sortDefsByColId) {
                const column = beans.colModel.getNonPivotColById(colId);
                if (!column) {
                    continue;
                }
                if ((sortDef?.direction ?? null) !== (column.getSortDef()?.direction ?? null)) {
                    return true;
                }
            }
            if (sort.baselineCleared) {
                const primaryColumns = getPrimaryColumns(beans);
                for (const col of primaryColumns) {
                    if (!sort.sortDefsByColId.has(col.colId) && col.getSortDef() !== null) {
                        return true;
                    }
                }
            }
        }

        if (aggFuncs) {
            for (const [colId, aggFunc] of aggFuncs.values) {
                const column = beans.colModel.getNonPivotColById(colId);
                if (!column) {
                    continue;
                }
                if (aggFunc !== column.aggFunc) {
                    return true;
                }
            }
        }

        return false;
    }

    public commit() {
        const { beans, state } = this;
        const operations: CommitOperations = [];
        for (const type of Object.keys(state) as CommitOperation['type'][]) {
            const operation = state[type];
            if (operation) {
                operations.push({ type, ...operation } as CommitOperation);
            }
        }

        const sortedEntries = operations.sort((a, b) => a.seq - b.seq);

        // Batch the role-column operations (rowGroup/aggregation/pivot) so consecutive ones share one
        // refresh. Order-sensitive ops read live model state that a deferred role op leaves stale until
        // refreshCols runs — columnOrder reads `colModel.colsList`, pivotMode reads `pivotColsSvc.columns`
        // — so flush the batch before each, exactly as the unbatched path would.
        // All ops here carry `eventType: 'toolPanelUi'`, so the flush source matches every dispatch.
        const colModel = beans.colModel;
        colModel.beginColBatch();
        try {
            for (const operation of sortedEntries) {
                if (!isRoleColumnOperation(operation)) {
                    // Close + reopen the batch to flush staged role changes, so this op reads fresh state.
                    colModel.endColBatch('toolPanelUi');
                    colModel.beginColBatch();
                }
                this.applyOperation(operation);
            }
        } finally {
            colModel.endColBatch('toolPanelUi');
        }

        this.reset();
    }

    private applyOperation(operation: CommitOperation): void {
        const { beans } = this;
        switch (operation.type) {
            case 'columnState': {
                _applyColumnState(beans, { state: [...operation.patches.values()] }, operation.eventType);
                break;
            }
            case 'columnOrder': {
                const orderedColumns = operation.colIds
                    .map((colId) => beans.colModel.getNonPivotColById(colId))
                    .filter((column): column is AgColumn => !!column && isPrimaryColDefColumn(column));
                if (!beans.colModel.pivotMode) {
                    for (let i = 0; i < orderedColumns.length; i++) {
                        const column = orderedColumns[i];
                        const allColumns = beans.colModel.colsList;
                        const nonPrimaryPrefix = allColumns.findIndex((col) => isPrimaryColDefColumn(col));
                        const targetIndex = (nonPrimaryPrefix >= 0 ? nonPrimaryPrefix : 0) + i;
                        if (allColumns[targetIndex] !== column) {
                            beans.colMoves?.moveColumns([column], targetIndex, operation.eventType, true);
                        }
                    }
                }
                syncPrimaryColDefOrder(beans, orderedColumns);
                break;
            }
            case 'rowGroup': {
                beans.rowGroupColsSvc?.setColumns(operation.colIds, operation.eventType);
                break;
            }
            case 'aggregation': {
                beans.valueColsSvc?.setColumns(operation.colIds, operation.eventType);
                break;
            }
            case 'pivot': {
                this.lastPivotColIds = operation.colIds;
                beans.pivotColsSvc?.setColumns(operation.colIds, operation.eventType);
                break;
            }
            case 'pivotMode': {
                const { colModel, ctrlsSvc, gos } = beans;
                if (operation.pivotMode !== colModel.pivotMode) {
                    // Remember the cols being pivoted on so re-enabling pivot mode restores them.
                    const currentPivotColIds = beans.pivotColsSvc?.columns.map((col) => col.colId) ?? [];
                    if (currentPivotColIds.length > 0) {
                        this.lastPivotColIds = currentPivotColIds;
                    }

                    if (!operation.pivotMode) {
                        const cols = beans.colModel.colDefList;
                        const state = cols.map((col) => ({ colId: col.colId, pivot: false, pivotIndex: null }));
                        _applyColumnState(beans, { state }, operation.eventType);
                    }

                    gos.updateGridOptions({
                        options: { pivotMode: operation.pivotMode },
                        source: operation.eventType as any,
                    });
                    if (operation.pivotMode) {
                        const pivotColIds = this.state.pivot?.colIds ?? this.lastPivotColIds;
                        if (pivotColIds.length > 0) {
                            beans.pivotColsSvc?.setColumns(pivotColIds, operation.eventType);
                        }
                    }
                    ctrlsSvc.getHeaderRowContainerCtrl()?.refresh();
                }
                break;
            }
            case 'sort': {
                const sortState: ColumnState[] = [];
                let sortIndex = 0;
                for (const [colId, sortDef] of operation.sortDefsByColId) {
                    sortState.push({
                        colId,
                        sort: sortDef?.direction ?? null,
                        sortIndex: sortDef?.direction ? sortIndex++ : null,
                        sortType: sortDef?.type ?? undefined,
                    });
                }

                _applyColumnState(
                    beans,
                    {
                        state: sortState,
                        defaultState: operation.baselineCleared
                            ? { sort: null, sortIndex: null, sortType: undefined }
                            : undefined,
                    },
                    operation.eventType
                );
                break;
            }
            case 'aggFuncs': {
                for (const [colId, aggFunc] of operation.values) {
                    const column = beans.colModel.getNonPivotColById(colId);
                    if (!column) {
                        continue;
                    }
                    beans.valueColsSvc?.setColumnAggFunc(column, aggFunc, operation.eventType);
                }
                break;
            }
        }
    }

    public applyColumnState(state: ColumnState[], eventType: ColumnEventType): void {
        for (const patch of state) {
            mergeColumnStatePatch(this.state, patch);
        }
        const columnState = ensureColumnStateDraft(this.state);
        columnState.seq = nextSeq(this.sequence);
        this.sequence = columnState.seq;
        columnState.eventType = eventType;
    }

    public moveColumns(columns: AgColumn[], targetIndex: number, eventType: ColumnEventType): void {
        const movingColIds = new Set(columns.map((column) => column.colId));
        const orderedColIds = this.state.columnOrder?.colIds ?? getPrimaryColumnIds(this.beans);

        const remaining = orderedColIds.filter((colId) => !movingColIds.has(colId));
        const movedIds = columns.map((column) => column.colId);
        const seq = nextSeq(this.sequence);
        this.sequence = seq;

        this.state.columnOrder = {
            colIds: [...remaining.slice(0, targetIndex), ...movedIds, ...remaining.slice(targetIndex)],
            eventType,
            seq,
        };
    }

    public setColumnsVisible(columns: AgColumn[], visible: boolean, eventType: ColumnEventType): void {
        for (const column of columns) {
            if (column.colDef.lockVisible) {
                continue;
            }
            mergeColumnStatePatch(this.state, { colId: column.colId, hide: !visible });
        }
        const columnState = ensureColumnStateDraft(this.state);
        columnState.seq = nextSeq(this.sequence);
        this.sequence = columnState.seq;
        columnState.eventType = eventType;
    }

    public setRowGroupColumns(columns: AgColumn[], eventType: ColumnEventType): void {
        clearDeferredFunctionPatches(this.state, 'rowGroup');
        const seq = nextSeq(this.sequence);
        this.sequence = seq;
        this.state.rowGroup = {
            colIds: columns.map((column) => column.colId),
            eventType,
            seq,
        };
    }

    public setValueColumns(columns: AgColumn[], eventType: ColumnEventType): void {
        clearDeferredFunctionPatches(this.state, 'aggFunc');
        const liveValueColIds = new Set((this.beans.valueColsSvc?.columns ?? []).map((col) => col.colId));
        const aggFuncs = ensureAggFuncsDraft(this.state);
        for (const col of columns) {
            if (!liveValueColIds.has(col.colId) && !aggFuncs.values.has(col.colId)) {
                const existingAggFunc = col.aggFunc;
                const aggFunc =
                    existingAggFunc != null ? existingAggFunc : this.beans.aggFuncSvc?.getDefaultAggFunc(col);
                if (aggFunc != null) {
                    aggFuncs.values.set(col.colId, aggFunc);
                }
            }
        }
        const seq = nextSeq(this.sequence);
        this.sequence = seq;
        aggFuncs.seq = seq;
        aggFuncs.eventType = eventType;
        this.state.aggregation = {
            colIds: columns.map((column) => column.colId),
            eventType,
            seq,
        };
    }

    public setColumnAggFunc(column: AgColumn, aggFunc: ColAggFunc, eventType: ColumnEventType): void {
        mergeColumnStatePatch(this.state, { colId: column.colId, aggFunc });
        const columnState = ensureColumnStateDraft(this.state);
        columnState.seq = nextSeq(this.sequence);
        this.sequence = columnState.seq;
        columnState.eventType = eventType;
        const aggFuncs = ensureAggFuncsDraft(this.state);
        aggFuncs.seq = columnState.seq;
        aggFuncs.eventType = eventType;
        aggFuncs.values.set(column.colId, aggFunc);
    }

    public getColumnAggFunc(column: AgColumn): ColAggFunc {
        const colId = column.colId;
        if (this.state.aggFuncs?.values.has(colId)) {
            return this.state.aggFuncs.values.get(colId);
        }
        return column.aggFunc;
    }

    public isColumnVisibleInToolPanel(column: AgColumn): boolean {
        const columnState = this.state.columnState?.patches.get(column.colId);
        if (columnState?.hide !== undefined) {
            return !columnState.hide;
        }
        return column.visible;
    }

    public isColumnSelectedInPivotModeToolPanel(column: AgColumn): boolean {
        const colId = column.colId;
        const columnState = this.state.columnState?.patches.get(colId);

        let rowGroupActive: boolean;
        if (columnState?.rowGroup !== undefined) {
            rowGroupActive = !!columnState.rowGroup;
        } else if (this.state.rowGroup) {
            rowGroupActive = this.state.rowGroup.colIds.includes(colId);
        } else {
            rowGroupActive = column.rowGroupActive;
        }

        let pivotActive: boolean;
        if (columnState?.pivot !== undefined) {
            pivotActive = !!columnState.pivot;
        } else if (this.state.pivot) {
            pivotActive = this.state.pivot.colIds.includes(colId);
        } else {
            pivotActive = column.pivotActive;
        }

        let valueActive: boolean;
        if (columnState?.aggFunc !== undefined) {
            valueActive = columnState.aggFunc != null;
        } else if (this.state.aggregation) {
            valueActive = this.state.aggregation.colIds.includes(colId);
        } else {
            valueActive = column.isValueActive();
        }

        return rowGroupActive || pivotActive || valueActive;
    }

    public setPivotColumns(columns: AgColumn[], eventType: ColumnEventType): void {
        clearDeferredFunctionPatches(this.state, 'pivot');
        const seq = nextSeq(this.sequence);
        this.sequence = seq;
        this.state.pivot = {
            colIds: columns.map((column) => column.colId),
            eventType,
            seq,
        };
    }

    public setPivotMode(pivotMode: boolean, eventType: ColumnEventType): void {
        const seq = nextSeq(this.sequence);
        this.sequence = seq;
        this.state.pivotMode = {
            pivotMode,
            eventType,
            seq,
        };
    }

    public getRowGroupColumns(): AgColumn[] {
        return getDraftColumns(
            this.beans,
            getDraftFunctionColumnIds(
                this.state.rowGroup?.colIds,
                this.beans.rowGroupColsSvc?.columns,
                this.state.columnState?.patches,
                (patch) => (patch.rowGroup == null ? undefined : !!patch.rowGroup)
            )
        );
    }

    public getPrimaryColumns(): AgColumn[] {
        return getDraftColumns(this.beans, this.state.columnOrder?.colIds ?? getPrimaryColumnIds(this.beans));
    }

    public hasDeferredColumnOrder(): boolean {
        return !!this.state.columnOrder;
    }

    public getValueColumns(): AgColumn[] {
        return getDraftColumns(
            this.beans,
            getDraftFunctionColumnIds(
                this.state.aggregation?.colIds,
                this.beans.valueColsSvc?.columns,
                this.state.columnState?.patches,
                (patch) => (patch.aggFunc === undefined ? undefined : patch.aggFunc != null)
            )
        );
    }

    public getPivotColumns(): AgColumn[] {
        if (!this.getPivotMode()) {
            return [];
        }

        const livePivotColumns = this.beans.pivotColsSvc?.columns;
        const fallbackColumns = livePivotColumns?.length
            ? livePivotColumns
            : getDraftColumns(this.beans, this.lastPivotColIds);

        return getDraftColumns(
            this.beans,
            getDraftFunctionColumnIds(
                this.state.pivot?.colIds,
                fallbackColumns,
                this.state.columnState?.patches,
                (patch) => (patch.pivot == null ? undefined : !!patch.pivot)
            )
        );
    }

    public getPivotMode(): boolean {
        return this.state.pivotMode?.pivotMode ?? this.beans.colModel.pivotMode;
    }

    public getSortDef(column: AgColumn): SortDef | null {
        const draftSortState = this.state.sort;
        const colId = column.colId;
        const sortDefsByColId = draftSortState?.sortDefsByColId;
        if (sortDefsByColId?.has(colId)) {
            return sortDefsByColId.get(colId) ?? null;
        }
        if (draftSortState?.baselineCleared) {
            return null;
        }
        return column.getSortDef();
    }

    public progressPivotSortFromEvent(column: AgColumn): void {
        const next = getNextPivotSort(this.getPivotSort(column));
        mergeColumnStatePatch(this.state, { colId: column.colId, pivotSort: next });
        const columnState = ensureColumnStateDraft(this.state);
        columnState.seq = nextSeq(this.sequence);
        this.sequence = columnState.seq;
        columnState.eventType = 'uiColumnSorted';
    }

    public getPivotSort(column: AgColumn): SortDirection | undefined {
        const patch = this.state.columnState?.patches.get(column.colId);
        if (patch?.pivotSort !== undefined) {
            return patch.pivotSort;
        }
        return column.pivotSort;
    }

    public progressSortFromEvent(column: AgColumn, event: MouseEvent | KeyboardEvent): void {
        const currentDraft = this.state.sort ?? {
            sortDefsByColId: new Map<string, SortDef | null>(),
            baselineCleared: false,
            seq: 0,
            eventType: 'toolPanelUi',
        };
        const { sortSvc } = this.beans;
        const colId = column.colId;
        let currentSortDef: SortDef | null | undefined;
        if (currentDraft.sortDefsByColId.has(colId)) {
            currentSortDef = currentDraft.sortDefsByColId.get(colId);
        } else if (currentDraft.baselineCleared) {
            currentSortDef = null;
        } else {
            currentSortDef = column.getSortDef();
        }
        const nextSortDef = sortSvc?.getNextSortDirection(column, currentSortDef);
        if (!nextSortDef) {
            return;
        }

        const { gos } = this.beans;
        const sortUsingCtrl = gos.get('multiSortKey') === 'ctrl';
        const multiSort = sortUsingCtrl ? event.ctrlKey || event.metaKey : event.shiftKey;
        const doingMultiSort = (multiSort || gos.get('alwaysMultiSort')) && !gos.get('suppressMultiSort');

        if (!doingMultiSort) {
            currentDraft.sortDefsByColId.clear();
            currentDraft.baselineCleared = true;
        }

        currentDraft.sortDefsByColId.set(colId, nextSortDef.direction ? nextSortDef : null);
        currentDraft.seq = nextSeq(this.sequence);
        this.sequence = currentDraft.seq;
        this.state.sort = currentDraft;
    }
}

/** Operations that mutate a role set via `setColumns` (deferred refresh) — safe to batch together. Excludes
 *  pivotMode/columnOrder/columnState/sort, which run their own refreshes and are order-sensitive. */
function isRoleColumnOperation(operation: CommitOperation): boolean {
    const type = operation.type;
    return type === 'rowGroup' || type === 'aggregation' || type === 'pivot';
}

function getDraftColumns(beans: BeanStub['beans'], colIds: string[] | undefined): AgColumn[] {
    if (!colIds) {
        return [];
    }
    return colIds
        .map((colId) => beans.colModel.getNonPivotColById(colId))
        .filter((column): column is AgColumn => !!column);
}

function getDraftFunctionColumnIds(
    draftColIds: string[] | undefined,
    liveColumns: AgColumn[] | undefined,
    columnStatePatches: Map<string, ColumnState> | undefined,
    getPatchState: (patch: ColumnState) => boolean | undefined
): string[] {
    const colIds = [...(draftColIds ?? liveColumns?.map((column) => column.colId) ?? [])];

    if (!columnStatePatches?.size) {
        return colIds;
    }

    const colIdsSet = new Set(colIds);
    for (const [colId, patch] of columnStatePatches) {
        const nextState = getPatchState(patch);
        if (nextState === undefined) {
            continue;
        }

        if (nextState) {
            if (!colIdsSet.has(colId)) {
                colIds.push(colId);
                colIdsSet.add(colId);
            }
            continue;
        }

        if (!colIdsSet.has(colId)) {
            continue;
        }

        colIdsSet.delete(colId);
        const index = colIds.indexOf(colId);
        if (index >= 0) {
            colIds.splice(index, 1);
        }
    }

    return colIds;
}

function syncPrimaryColDefOrderFromCurrentColumns(beans: BeanStub['beans']): void {
    const orderedPrimaryColumns = beans.colModel.colsList
        .filter((column) => isPrimaryColDefColumn(column))
        .map((column) => beans.colModel.getNonPivotCol(column.colId))
        .filter((column): column is AgColumn => !!column);
    syncPrimaryColDefOrder(beans, orderedPrimaryColumns);
}

function syncPrimaryColDefOrder(beans: BeanStub['beans'], orderedPrimaryColumns: AgColumn[]): void {
    const colDefList = beans.colModel.colDefList;
    if (colDefList.length === 0) {
        return;
    }

    const orderedSet = new Set(orderedPrimaryColumns);
    beans.colModel.replaceColDefList([
        ...orderedPrimaryColumns,
        ...colDefList.filter((col) => isPrimaryColDefColumn(col) && !orderedSet.has(col)),
    ]);
}

function getPrimaryColumnIds(beans: BeanStub['beans']): string[] {
    return getPrimaryColumns(beans).map((column) => column.colId);
}

function getPrimaryColumns(beans: BeanStub['beans']): AgColumn[] {
    return beans.colModel.colDefList.filter(isPrimaryColDefColumn);
}

function isPrimaryColDefColumn(column: AgColumn): boolean {
    if (!column.primary) {
        return false;
    }
    return !isColumnGroupAutoCol(column) && !isSpecialCol(column);
}

function nextSeq(sequence: number): number {
    return sequence + 1;
}

function mergeColumnStatePatch(state: DeferredState, patch: ColumnState): void {
    const columnState = ensureColumnStateDraft(state);
    const existing = columnState.patches.get(patch.colId);
    columnState.patches.set(patch.colId, existing ? { ...existing, ...patch } : patch);
}

function clearDeferredFunctionPatches(state: DeferredState, patchKey: 'rowGroup' | 'pivot' | 'aggFunc'): void {
    const patches = state.columnState?.patches;
    if (!patches?.size) {
        return;
    }

    for (const [colId, patch] of patches) {
        if (!(patchKey in patch)) {
            continue;
        }

        const nextPatch = { ...patch } as Partial<ColumnState>;
        delete nextPatch[patchKey];

        if (Object.keys(nextPatch).length === 1) {
            patches.delete(colId);
            continue;
        }

        patches.set(colId, nextPatch as ColumnState);
    }
}

function ensureColumnStateDraft(state: DeferredState): NonNullable<DeferredState['columnState']> {
    let { columnState } = state;
    if (!columnState) {
        columnState = {
            patches: new Map<string, ColumnState>(),
            seq: 0,
            eventType: 'toolPanelUi',
        };
        state.columnState = columnState;
    }
    return columnState;
}

function ensureAggFuncsDraft(state: DeferredState): NonNullable<DeferredState['aggFuncs']> {
    let { aggFuncs } = state;
    if (!aggFuncs) {
        aggFuncs = {
            values: new Map<string, ColAggFunc>(),
            seq: 0,
            eventType: 'toolPanelUi',
        };
        state.aggFuncs = aggFuncs;
    }
    return aggFuncs;
}
