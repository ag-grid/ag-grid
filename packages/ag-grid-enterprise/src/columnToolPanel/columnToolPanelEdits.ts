import type {
    AgColumn,
    ColumnEventType,
    ColumnState,
    ColumnToolPanelEditStrategyBean,
    IAggFunc,
    SortDef,
} from 'ag-grid-community';
import { BeanStub, _applyColumnState, isColumnGroupAutoCol, isSpecialCol } from 'ag-grid-community';

import type {
    BaseColumnToolPanelEdits,
    CommitOperation,
    CommitOperations,
    DeferredState,
} from './columnToolPanelEditsTypes';

const noop = () => {};

export class ColumnToolPanelSyncUpdateStrategy extends BeanStub implements BaseColumnToolPanelEdits {
    beanName = 'colToolPanelSyncUpdateStrategy' as ColumnToolPanelEditStrategyBean;
    private lastPivotColIds: string[] = [];

    public reset = noop;
    public commit = noop;

    public applyColumnState(state: ColumnState[], eventType: ColumnEventType): void {
        if (state.length === 0) {
            return;
        }

        _applyColumnState(this.beans, { state }, eventType); // apply column state
    }

    public moveColumns(columns: AgColumn[], targetIndex: number, eventType: ColumnEventType): void {
        this.beans.colMoves?.moveColumns(columns, targetIndex, eventType); // animation + dispatchEvent
        syncPrimaryColDefOrderFromCurrentColumns(this.beans);
    }

    public setColumnsVisible(columns: AgColumn[], visible: boolean, eventType: ColumnEventType): void {
        const allowedCols = columns.filter((column) => !column.getColDef().lockVisible);
        this.beans.colModel.setColsVisible(allowedCols, visible, eventType); // apply column state
    }

    public setRowGroupColumns(columns: AgColumn[], eventType: ColumnEventType): void {
        this.beans.rowGroupColsSvc?.setColumns(columns, eventType); // computes which columns actually changed + dispatchEvent
    }

    public getRowGroupColumns(): AgColumn[] {
        return this.beans.rowGroupColsSvc?.columns ?? [];
    }

    public setValueColumns(columns: AgColumn[], eventType: ColumnEventType): void {
        this.beans.valueColsSvc?.setColumns(columns, eventType); // computes which columns actually changed + dispatchEvent
    }

    public getValueColumns(): AgColumn[] {
        return this.beans.valueColsSvc?.columns ?? [];
    }

    public setColumnAggFunc(
        column: AgColumn,
        aggFunc: string | IAggFunc | null | undefined,
        eventType: ColumnEventType
    ): void {
        this.beans.valueColsSvc?.setColumnAggFunc?.(column, aggFunc, eventType); // dispatchEvent
    }

    public getColumnAggFunc(column: AgColumn): string | IAggFunc | null | undefined {
        return column.getAggFunc();
    }

    public setPivotColumns(columns: AgColumn[], eventType: ColumnEventType): void {
        this.lastPivotColIds = columns.map((column) => column.getColId());
        this.beans.pivotColsSvc?.setColumns(columns, eventType); // computes which columns actually changed + dispatchEvent
    }

    public getPivotColumns(): AgColumn[] {
        return this.beans.pivotColsSvc?.columns ?? [];
    }

    public setPivotMode(pivotMode: boolean, eventType: ColumnEventType): void {
        const { colModel, gos, ctrlsSvc } = this.beans;
        if (pivotMode === colModel.isPivotMode()) {
            return;
        }

        const currentPivotColIds = this.beans.pivotColsSvc?.columns.map((col) => col.getColId()) ?? [];
        if (currentPivotColIds.length > 0) {
            this.lastPivotColIds = currentPivotColIds;
        }

        if (!pivotMode) {
            const cols = this.beans.colModel.getColDefCols() ?? [];
            _applyColumnState(
                this.beans,
                {
                    state: cols.map((col) => ({
                        colId: col.getColId(),
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
        for (const c of ctrlsSvc.getHeaderRowContainerCtrls()) {
            c.refresh();
        }
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
        return this.beans.colModel.isPivotMode();
    }

    public getSortDef(column: AgColumn): SortDef | null {
        return column.getSortDef();
    }
}

export class ColumnToolPanelDeferredEdit extends BeanStub implements BaseColumnToolPanelEdits {
    beanName = 'colToolPanelDeferredEdit' as ColumnToolPanelEditStrategyBean;

    private state: DeferredState = {};
    private sequence = 0;

    public reset() {
        this.sequence = 0;
        this.state = {};
    }

    public commit() {
        const { beans, state } = this;
        const operations: CommitOperations = [];
        for (const [type, operation] of Object.entries(state) as [
            CommitOperation['type'],
            DeferredState[CommitOperation['type']],
        ][]) {
            if (operation) {
                operations.push({ type, ...operation } as CommitOperation);
            }
        }

        const sortedEntries = operations.sort((a, b) => a.seq - b.seq);
        for (const operation of sortedEntries) {
            switch (operation.type) {
                case 'columnState': {
                    _applyColumnState(beans, { state: [...operation.patches.values()] }, operation.eventType);
                    break;
                }
                case 'columnOrder': {
                    const orderedColumns = operation.colIds
                        .map((colId) => beans.colModel.getColDefCol(colId))
                        .filter((column): column is AgColumn => !!column && isPrimaryColDefColumn(column));
                    if (!beans.colModel.isPivotMode()) {
                        const allColumns = beans.colModel.getCols();
                        for (let targetIndex = 0; targetIndex < orderedColumns.length; targetIndex++) {
                            const column = orderedColumns[targetIndex];
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
                    beans.pivotColsSvc?.setColumns(operation.colIds, operation.eventType);
                    break;
                }
                case 'pivotMode': {
                    const { colModel, ctrlsSvc, gos, stateSvc } = beans;
                    if (operation.pivotMode !== colModel.isPivotMode()) {
                        const currentPivotColIds = beans.pivotColsSvc?.columns.map((col) => col.getColId()) ?? [];
                        const previousPivotColIds = stateSvc?.getState().pivot?.pivotColIds ?? currentPivotColIds;
                        stateSvc?.setState(
                            {
                                ...stateSvc.getState(),
                                pivot: {
                                    pivotMode: operation.pivotMode,
                                    pivotColIds: operation.pivotMode
                                        ? this.state.pivot?.colIds ?? currentPivotColIds
                                        : previousPivotColIds,
                                },
                            },
                            ['pivot']
                        );

                        if (!operation.pivotMode) {
                            const cols = beans.colModel.getColDefCols() ?? [];
                            _applyColumnState(
                                beans,
                                {
                                    state: cols.map((col) => ({
                                        colId: col.getColId(),
                                        pivot: false,
                                        pivotIndex: null,
                                    })),
                                },
                                operation.eventType
                            );
                        }

                        gos.updateGridOptions({
                            options: { pivotMode: operation.pivotMode },
                            source: operation.eventType as any,
                        });
                        for (const c of ctrlsSvc.getHeaderRowContainerCtrls()) {
                            c.refresh();
                        }
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
                        const column = beans.colModel.getColDefCol(colId);
                        if (!column) {
                            continue;
                        }
                        beans.valueColsSvc?.setColumnAggFunc?.(column, aggFunc, operation.eventType);
                    }
                    break;
                }
            }
        }

        this.reset();
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
        const movingColIds = new Set(columns.map((column) => column.getColId()));
        const liveOrderedColIds = getPrimaryColumnIds(this.beans);
        const orderedColIds = this.state.columnOrder?.colIds ?? liveOrderedColIds;

        const remaining = orderedColIds.filter((colId) => !movingColIds.has(colId));
        const movedIds = columns.map((column) => column.getColId());
        const adjustedTargetIndex = getDeferredMoveTargetIndex(liveOrderedColIds, remaining, movingColIds, targetIndex);
        const seq = nextSeq(this.sequence);
        this.sequence = seq;

        this.state.columnOrder = {
            colIds: [...remaining.slice(0, adjustedTargetIndex), ...movedIds, ...remaining.slice(adjustedTargetIndex)],
            eventType,
            seq,
        };
    }

    public setColumnsVisible(columns: AgColumn[], visible: boolean, eventType: ColumnEventType): void {
        for (const column of columns) {
            if (column.getColDef().lockVisible) {
                continue;
            }
            mergeColumnStatePatch(this.state, { colId: column.getColId(), hide: !visible });
        }
        const columnState = ensureColumnStateDraft(this.state);
        columnState.seq = nextSeq(this.sequence);
        this.sequence = columnState.seq;
        columnState.eventType = eventType;
    }

    public setRowGroupColumns(columns: AgColumn[], eventType: ColumnEventType): void {
        const seq = nextSeq(this.sequence);
        this.sequence = seq;
        this.state.rowGroup = {
            colIds: columns.map((column) => column.getColId()),
            eventType,
            seq,
        };
    }

    public setValueColumns(columns: AgColumn[], eventType: ColumnEventType): void {
        const seq = nextSeq(this.sequence);
        this.sequence = seq;
        this.state.aggregation = {
            colIds: columns.map((column) => column.getColId()),
            eventType,
            seq,
        };
    }

    public setColumnAggFunc(
        column: AgColumn,
        aggFunc: string | IAggFunc | null | undefined,
        eventType: ColumnEventType
    ): void {
        mergeColumnStatePatch(this.state, { colId: column.getColId(), aggFunc });
        const columnState = ensureColumnStateDraft(this.state);
        columnState.seq = nextSeq(this.sequence);
        this.sequence = columnState.seq;
        columnState.eventType = eventType;
        const aggFuncs = ensureAggFuncsDraft(this.state);
        aggFuncs.seq = columnState.seq;
        aggFuncs.eventType = eventType;
        aggFuncs.values.set(column.getColId(), aggFunc);
    }

    public getColumnAggFunc(column: AgColumn): string | IAggFunc | null | undefined {
        const colId = column.getColId();
        if (this.state.aggFuncs?.values.has(colId)) {
            return this.state.aggFuncs.values.get(colId);
        }
        return column.getAggFunc();
    }

    public isColumnVisibleInToolPanel(column: AgColumn): boolean {
        const columnState = this.state.columnState?.patches.get(column.getColId());
        if (columnState?.hide !== undefined) {
            return !columnState.hide;
        }
        return column.isVisible();
    }

    public isColumnSelectedInPivotModeToolPanel(column: AgColumn): boolean {
        const colId = column.getColId();
        const columnState = this.state.columnState?.patches.get(colId);

        let rowGroupActive: boolean;
        if (columnState?.rowGroup !== undefined) {
            rowGroupActive = !!columnState.rowGroup;
        } else if (this.state.rowGroup) {
            rowGroupActive = this.state.rowGroup.colIds.includes(colId);
        } else {
            rowGroupActive = column.isRowGroupActive();
        }

        let pivotActive: boolean;
        if (columnState?.pivot !== undefined) {
            pivotActive = !!columnState.pivot;
        } else if (this.state.pivot) {
            pivotActive = this.state.pivot.colIds.includes(colId);
        } else {
            pivotActive = column.isPivotActive();
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
        const seq = nextSeq(this.sequence);
        this.sequence = seq;
        this.state.pivot = {
            colIds: columns.map((column) => column.getColId()),
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
        return getDraftColumns(this.beans, this.state.rowGroup?.colIds, this.beans.rowGroupColsSvc?.columns);
    }

    public getValueColumns(): AgColumn[] {
        return getDraftColumns(this.beans, this.state.aggregation?.colIds, this.beans.valueColsSvc?.columns);
    }

    public getPivotColumns(): AgColumn[] {
        if (!this.getPivotMode()) {
            return [];
        }

        return getDraftColumns(this.beans, this.state.pivot?.colIds, this.beans.pivotColsSvc?.columns);
    }

    public getPivotMode(): boolean {
        return this.state.pivotMode?.pivotMode ?? this.beans.colModel.isPivotMode();
    }

    public getSortDef(column: AgColumn): SortDef | null {
        const draftSortState = this.state.sort;
        const colId = column.getColId();
        const sortDefsByColId = draftSortState?.sortDefsByColId;
        if (sortDefsByColId?.has(colId)) {
            return sortDefsByColId.get(colId) ?? null;
        }
        if (draftSortState?.baselineCleared) {
            return null;
        }
        return column.getSortDef();
    }

    public progressSortFromEvent(column: AgColumn, event: MouseEvent | KeyboardEvent): void {
        const currentDraft = this.state.sort ?? {
            sortDefsByColId: new Map<string, SortDef | null>(),
            baselineCleared: false,
            seq: 0,
            eventType: 'toolPanelUi',
        };
        const { sortSvc } = this.beans;
        const colId = column.getColId();
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

        const sortUsingCtrl = this.gos.get('multiSortKey') === 'ctrl';
        const multiSort = sortUsingCtrl ? event.ctrlKey || event.metaKey : event.shiftKey;
        const doingMultiSort = (multiSort || this.gos.get('alwaysMultiSort')) && !this.gos.get('suppressMultiSort');

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

function getDraftColumns(
    beans: BeanStub['beans'],
    colIds: string[] | undefined,
    fallback: AgColumn[] | undefined
): AgColumn[] {
    if (!colIds) {
        return fallback ?? [];
    }

    return colIds.map((colId) => beans.colModel.getColDefCol(colId)).filter((column): column is AgColumn => !!column);
}

function syncPrimaryColDefOrderFromCurrentColumns(beans: BeanStub['beans']): void {
    const orderedPrimaryColumns = beans.colModel
        .getCols()
        .filter((column) => isPrimaryColDefColumn(column))
        .map((column) => beans.colModel.getColDefCol(column.getColId()))
        .filter((column): column is AgColumn => !!column);
    syncPrimaryColDefOrder(beans, orderedPrimaryColumns);
}

function syncPrimaryColDefOrder(beans: BeanStub['beans'], orderedPrimaryColumns: AgColumn[]): void {
    const colDefCols = getMutablePrimaryColDefCollection(beans);
    if (!colDefCols) {
        return;
    }

    const orderedSet = new Set(orderedPrimaryColumns);
    colDefCols.list = [
        ...orderedPrimaryColumns,
        ...colDefCols.list.filter((col) => isPrimaryColDefColumn(col) && !orderedSet.has(col)),
    ];
}

function getPrimaryColumnIds(beans: BeanStub['beans']): string[] {
    return (beans.colModel.getColDefCols() ?? beans.colModel.getCols())
        .filter((column) => isPrimaryColDefColumn(column))
        .map((column) => column.getColId());
}

function getDeferredMoveTargetIndex(
    liveOrderedColIds: string[],
    remainingDraftColIds: string[],
    movingColIds: Set<string>,
    targetIndex: number
): number {
    if (targetIndex <= 0) {
        return 0;
    }
    if (targetIndex >= remainingDraftColIds.length || targetIndex >= liveOrderedColIds.length) {
        return remainingDraftColIds.length;
    }

    for (let i = targetIndex - 1; i >= 0; i--) {
        const colId = liveOrderedColIds[i];
        if (movingColIds.has(colId)) {
            continue;
        }

        const draftIndex = remainingDraftColIds.indexOf(colId);
        if (draftIndex >= 0) {
            return draftIndex + 1;
        }
    }

    for (let i = targetIndex; i < liveOrderedColIds.length; i++) {
        const colId = liveOrderedColIds[i];
        if (movingColIds.has(colId)) {
            continue;
        }

        const draftIndex = remainingDraftColIds.indexOf(colId);
        if (draftIndex >= 0) {
            return draftIndex;
        }
    }

    return remainingDraftColIds.length;
}

function getMutablePrimaryColDefCollection(
    beans: BeanStub['beans']
): { list: AgColumn[] } | undefined {
    const colDefCols = (beans.colModel as any).colDefCols;
    const colDefList = colDefCols?.list;

    if (!Array.isArray(colDefList)) {
        return undefined;
    }

    return colDefCols as { list: AgColumn[] };
}

function isPrimaryColDefColumn(column: AgColumn): boolean {
    if (!column.isPrimary()) {
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
            values: new Map<string, string | IAggFunc | null | undefined>(),
            seq: 0,
            eventType: 'toolPanelUi',
        };
        state.aggFuncs = aggFuncs;
    }
    return aggFuncs;
}
