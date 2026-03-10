import type {
    AgColumn,
    BeanName,
    ColumnEventType,
    ColumnState,
    ColumnToolPanelEditStrategyBean,
    IAggFunc,
    NamedBean,
    SortDef,
} from 'ag-grid-community';
import { BeanStub, _applyColumnState } from 'ag-grid-community';

export type ColumnToolPanelEditParams = { deferApply?: boolean };
export const COLUMN_TOOL_PANEL_SYNCHRONOUS_EDIT_BEAN_NAME = 'colToolPanelSynchronousEdit';
export const COLUMN_TOOL_PANEL_DEFERRED_EDIT_BEAN_NAME = 'colToolPanelDeferredEdit';

const noop = () => {};

export interface BaseColumnToolPanelEdits extends NamedBean {
    applyColumnState(state: ColumnState[], eventType: ColumnEventType): void;
    commit(): void;
    moveColumns(columns: AgColumn[], targetIndex: number, eventType: ColumnEventType): void;
    reset(): void;
    setColumnsVisible(columns: AgColumn[], visible: boolean, eventType: ColumnEventType): void;
    isColumnVisibleInToolPanel(column: AgColumn): boolean;
    setRowGroupColumns(columns: AgColumn[], eventType: ColumnEventType): void;
    getRowGroupColumns(): AgColumn[];
    setValueColumns(columns: AgColumn[], eventType: ColumnEventType): void;
    getValueColumns(): AgColumn[];
    setColumnAggFunc(column: AgColumn, aggFunc: string | IAggFunc | null | undefined, eventType: ColumnEventType): void;
    getColumnAggFunc(column: AgColumn): string | IAggFunc | null | undefined;
    setPivotColumns(columns: AgColumn[], eventType: ColumnEventType): void;
    getPivotColumns(): AgColumn[];
    setPivotMode(pivotMode: boolean, eventType: ColumnEventType): void;
    getPivotMode(): boolean;
    isColumnSelectedInPivotModeToolPanel(column: AgColumn): boolean;
    progressSortFromEvent(column: AgColumn, event: MouseEvent | KeyboardEvent): void;
    getSortDef(column: AgColumn): SortDef | null;
}

type Seq = { seq: number; eventType: ColumnEventType };
type ColIdsDraft = { colIds: string[] } & Seq;
type ColumnStateDraft = { patches: Map<string, ColumnState> } & Seq;
type PivotModeDraft = { pivotMode: boolean } & Seq;
type SortDraft = { sortDefsByColId: Map<string, SortDef | null>; baselineCleared: boolean } & Seq;
type AggFuncsDraft = { values: Map<string, string | IAggFunc | null | undefined> } & Seq;

type DeferredState = {
    columnState?: ColumnStateDraft;
    columnOrder?: ColIdsDraft;
    rowGroup?: ColIdsDraft;
    aggregation?: ColIdsDraft;
    pivot?: ColIdsDraft;
    pivotMode?: PivotModeDraft;
    sort?: SortDraft;
    aggFuncs?: AggFuncsDraft;
};

type CommitOperation =
    | ({ type: 'columnState' } & ColumnStateDraft)
    | ({ type: 'columnOrder' } & ColIdsDraft)
    | ({ type: 'rowGroup' } & ColIdsDraft)
    | ({ type: 'aggregation' } & ColIdsDraft)
    | ({ type: 'pivot' } & ColIdsDraft)
    | ({ type: 'pivotMode' } & PivotModeDraft)
    | ({ type: 'sort' } & SortDraft)
    | ({ type: 'aggFuncs' } & AggFuncsDraft);
type CommitOperations = CommitOperation[];

export class ColumnToolPanelSynchronousEdit extends BeanStub implements BaseColumnToolPanelEdits {
    beanName = COLUMN_TOOL_PANEL_SYNCHRONOUS_EDIT_BEAN_NAME as ColumnToolPanelEditStrategyBean;
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
    beanName = COLUMN_TOOL_PANEL_DEFERRED_EDIT_BEAN_NAME as ColumnToolPanelEditStrategyBean;

    private state: DeferredState = {};
    private sequence = 0;

    public reset() {
        this.sequence = 0;
        this.state = {};
    }

    public commit() {
        const { state } = this;
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
                    _applyColumnState(this.beans, { state: [...operation.patches.values()] }, operation.eventType);
                    break;
                }
                case 'columnOrder': {
                    const orderedColumns = operation.colIds
                        .map((colId) => this.beans.colModel.getColDefCol(colId))
                        .filter((column): column is AgColumn => !!column && isPrimaryColDefColumn(column));
                    if (!this.beans.colModel.isPivotMode()) {
                        const allColumns = this.beans.colModel.getCols();
                        for (let targetIndex = 0; targetIndex < orderedColumns.length; targetIndex++) {
                            const column = orderedColumns[targetIndex];
                            if (allColumns[targetIndex] !== column) {
                                this.beans.colMoves?.moveColumns([column], targetIndex, operation.eventType, true);
                            }
                        }
                    }
                    const colDefCols = (this.beans.colModel as any).colDefCols;
                    const colDefList = colDefCols?.list as AgColumn[] | undefined;
                    if (colDefList) {
                        const orderedSet = new Set(orderedColumns);
                        colDefCols.list = [
                            ...orderedColumns,
                            ...colDefList.filter((col) => isPrimaryColDefColumn(col) && !orderedSet.has(col)),
                        ];
                    }
                    break;
                }
                case 'rowGroup': {
                    this.beans.rowGroupColsSvc?.setColumns(operation.colIds, operation.eventType);
                    break;
                }
                case 'aggregation': {
                    this.beans.valueColsSvc?.setColumns(operation.colIds, operation.eventType);
                    break;
                }
                case 'pivot': {
                    this.beans.pivotColsSvc?.setColumns(operation.colIds, operation.eventType);
                    break;
                }
                case 'pivotMode': {
                    const { colModel, ctrlsSvc, stateSvc } = this.beans;
                    if (operation.pivotMode !== colModel.isPivotMode()) {
                        const currentPivotColIds = this.beans.pivotColsSvc?.columns.map((col) => col.getColId()) ?? [];
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
                                operation.eventType
                            );
                        }

                        // Keep runtime pivot mode in sync without using extra mutating APIs.
                        (colModel as any).pivotMode = operation.pivotMode;
                        colModel.refreshCols(false, operation.eventType);
                        this.beans.visibleCols.refresh(operation.eventType);
                        this.beans.eventSvc.dispatchEvent({ type: 'columnPivotModeChanged' });
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
                        this.beans,
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
                        const column = this.beans.colModel.getColDefCol(colId);
                        if (!column) {
                            continue;
                        }
                        this.beans.valueColsSvc?.setColumnAggFunc?.(column, aggFunc, operation.eventType);
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
        const orderedColIds =
            this.state.columnOrder?.colIds ??
            (this.beans.colModel.getColDefCols() ?? this.beans.colModel.getCols())
                .filter((column) => isPrimaryColDefColumn(column))
                .map((column) => column.getColId());

        const remaining = orderedColIds.filter((colId) => !movingColIds.has(colId));
        const beforeTarget = orderedColIds.slice(0, targetIndex);
        const movedBeforeTargetCount = beforeTarget.filter((colId) => movingColIds.has(colId)).length;
        const adjustedTargetIndex = Math.min(Math.max(targetIndex - movedBeforeTargetCount, 0), remaining.length);
        const movedIds = columns.map((column) => column.getColId());
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

        const rowGroupActive =
            columnState?.rowGroup !== undefined
                ? !!columnState.rowGroup
                : this.state.rowGroup
                  ? this.state.rowGroup.colIds.includes(colId)
                  : column.isRowGroupActive();

        const pivotActive =
            columnState?.pivot !== undefined
                ? !!columnState.pivot
                : this.state.pivot
                  ? this.state.pivot.colIds.includes(colId)
                  : column.isPivotActive();

        const valueActive =
            columnState?.aggFunc !== undefined
                ? columnState.aggFunc != null
                : this.state.aggregation
                  ? this.state.aggregation.colIds.includes(colId)
                  : column.isValueActive();

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
        if (!this.getPivotMode()) {
            return [];
        }

        return getDraftColumns(this.beans, this.state.rowGroup?.colIds, this.beans.rowGroupColsSvc?.columns);
    }

    public getValueColumns(): AgColumn[] {
        if (!this.getPivotMode()) {
            return [];
        }

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
        const currentSortDef = currentDraft.sortDefsByColId.has(colId)
            ? currentDraft.sortDefsByColId.get(colId)
            : currentDraft.baselineCleared
              ? null
              : column.getSortDef();
        const nextSortDef = sortSvc!.getNextSortDirection(column, currentSortDef);

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
    const colDefCols = (beans.colModel as any).colDefCols;
    const colDefList = colDefCols?.list as AgColumn[] | undefined;
    if (!colDefList) {
        return;
    }

    const orderedPrimaryColumns = beans.colModel
        .getCols()
        .filter((column) => isPrimaryColDefColumn(column))
        .map((column) => beans.colModel.getColDefCol(column.getColId()))
        .filter((column): column is AgColumn => !!column);
    const orderedSet = new Set(orderedPrimaryColumns);
    colDefCols.list = [
        ...orderedPrimaryColumns,
        ...colDefList.filter((col) => isPrimaryColDefColumn(col) && !orderedSet.has(col)),
    ];
}

function isPrimaryColDefColumn(column: AgColumn): boolean {
    if (!column.isPrimary()) {
        return false;
    }
    const colId = column.getColId();
    return (
        !colId.startsWith('ag-Grid-AutoColumn') &&
        !colId.startsWith('ag-Grid-SelectionColumn') &&
        !colId.startsWith('ag-Grid-RowNumbers')
    );
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
