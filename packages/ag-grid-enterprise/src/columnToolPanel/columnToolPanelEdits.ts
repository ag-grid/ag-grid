import type {
    AgColumn,
    BeanName,
    ColumnEventType,
    ColumnState,
    IAggFunc,
    IColumnToolPanelEdits,
    NamedBean,
    SortDef,
    SortDirection,
} from 'ag-grid-community';
import { BeanStub, _applyColumnState } from 'ag-grid-community';
import type { ColumnToolPanelEditStrategyBean } from 'ag-grid-community';

export type ColumnToolPanelEditParams = { deferApply?: boolean };

const noop = () => {};

export abstract class BaseColumnToolPanelEdits extends BeanStub implements IColumnToolPanelEdits, NamedBean {
    abstract beanName: BeanName;
    abstract applyColumnState(state: ColumnState[], eventType: ColumnEventType): void;
    abstract commit(): void;
    abstract getColumnAggFunc(column: AgColumn): string | IAggFunc | null | undefined;
    abstract getPivotColumns(): AgColumn[];
    abstract getPivotMode(): boolean;
    abstract getPivotModeForToolPanel(): boolean;
    abstract getRowGroupColumns(): AgColumn[];
    abstract getSortDef(column: AgColumn): SortDef | null;
    abstract getSortDefForToolPanel(column: AgColumn): SortDef | null;
    abstract getValueColumns(): AgColumn[];
    abstract isColumnSelectedInPivotModeToolPanel(column: AgColumn): boolean;
    abstract isColumnVisibleInToolPanel(column: AgColumn): boolean;
    abstract moveColumns(columns: AgColumn[], targetIndex: number, eventType: ColumnEventType): void;
    abstract progressSortFromEvent(column: AgColumn, event: MouseEvent | KeyboardEvent): void;
    abstract reset(): void;
    abstract setColumnAggFunc(
        column: AgColumn,
        aggFunc: string | IAggFunc | null | undefined,
        eventType: ColumnEventType
    ): void;
    abstract setColumnsVisible(columns: AgColumn[], visible: boolean, eventType: ColumnEventType): void;
    abstract setPivotColumns(columns: AgColumn[], eventType: ColumnEventType): void;
    abstract setPivotMode(pivotMode: boolean, eventType: ColumnEventType): void;
    abstract setRowGroupColumns(columns: AgColumn[], eventType: ColumnEventType): void;
    abstract setValueColumns(columns: AgColumn[], eventType: ColumnEventType): void;
}

export class ColumnToolPanelSynchronousEdit extends BaseColumnToolPanelEdits {
    static beanName = 'colToolPanelSynchronousEdit';
    beanName = ColumnToolPanelSynchronousEdit.beanName as ColumnToolPanelEditStrategyBean;

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

        gos.updateGridOptions({ options: { pivotMode }, source: eventType as any }); // update grid option + refresh
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
        return column.isValueActive() || column.isPivotActive() || column.isRowGroupActive();
    }

    public getPivotModeForToolPanel(): boolean {
        return this.getPivotMode();
    }

    public getPivotMode(): boolean {
        return this.beans.colModel.isPivotMode();
    }

    public getSortDef(column: AgColumn): SortDef | null {
        return column.getSortDef();
    }

    public getSortDefForToolPanel(column: AgColumn): SortDef | null {
        return this.getSortDef(column);
    }
}

export class ColumnToolPanelDeferredEdit extends BaseColumnToolPanelEdits {
    static beanName = 'colToolPanelDeferredEdit';
    beanName = ColumnToolPanelDeferredEdit.beanName as ColumnToolPanelEditStrategyBean;

    private state = this.getDefaultState();
    private sequence = 0;

    private getDefaultState() {
        return {
            // Draft mirrors grid-state style slices and collapses repeated changes to latest effective values.
            columnStateByColId: new Map<string, ColumnState>(),
            columnStateSeq: 0,
            columnStateEventType: 'toolPanelUi' as ColumnEventType,
            columnOrder: undefined as { orderedColIds: string[]; eventType: ColumnEventType; seq: number } | undefined,
            rowGroup: undefined as { groupColIds: string[]; eventType: ColumnEventType; seq: number } | undefined,
            aggregation: undefined as { valueColIds: string[]; eventType: ColumnEventType; seq: number } | undefined,
            pivot: undefined as { pivotColIds: string[]; eventType: ColumnEventType; seq: number } | undefined,
            pivotMode: undefined as { pivotMode: boolean; eventType: ColumnEventType; seq: number } | undefined,
            sort: undefined as
                | {
                      sortDefsByColId: Map<string, SortDef | null>;
                      baselineCleared: boolean;
                      seq: number;
                  }
                | undefined,
            draftAggFuncsByColId: new Map<string, string | IAggFunc | null | undefined>(),
        };
    }

    private nextSeq(): number {
        this.sequence += 1;
        return this.sequence;
    }

    private mergeColumnStatePatch(patch: ColumnState): void {
        const existing = this.state.columnStateByColId.get(patch.colId);
        this.state.columnStateByColId.set(patch.colId, existing ? { ...existing, ...patch } : patch);
    }

    public reset() {
        this.sequence = 0;
        this.state = this.getDefaultState();
    }

    public commit() {
        const cols = this.beans.colModel.getCols();
        const colIds = cols.map((column) => column.getColId());
        const colStateByColId = new Map<string, ColumnState>();
        const ensureState = (colId: string): ColumnState => {
            const existing = colStateByColId.get(colId);
            if (existing) {
                return existing;
            }
            const created: ColumnState = { colId };
            colStateByColId.set(colId, created);
            return created;
        };

        let eventType: ColumnEventType = 'toolPanelUi';
        let applyOrder = false;
        let orderedColIds: string[] | undefined;
        let defaultSortCleared = false;

        const operations: Array<
            | { type: 'columnState'; seq: number; eventType: ColumnEventType; state: Map<string, ColumnState> }
            | { type: 'columnOrder'; seq: number; eventType: ColumnEventType; orderedColIds: string[] }
            | { type: 'rowGroup'; seq: number; eventType: ColumnEventType; groupColIds: string[] }
            | { type: 'aggregation'; seq: number; eventType: ColumnEventType; valueColIds: string[] }
            | { type: 'pivot'; seq: number; eventType: ColumnEventType; pivotColIds: string[] }
            | {
                  type: 'sort';
                  seq: number;
                  eventType: ColumnEventType;
                  sortDefsByColId: Map<string, SortDef | null>;
                  baselineCleared: boolean;
              }
        > = [];

        if (this.state.columnStateByColId.size > 0) {
            operations.push({
                type: 'columnState',
                seq: this.state.columnStateSeq,
                eventType: this.state.columnStateEventType,
                state: this.state.columnStateByColId,
            });
        }
        if (this.state.columnOrder) {
            operations.push({ type: 'columnOrder', ...this.state.columnOrder });
        }
        if (this.state.rowGroup) {
            operations.push({ type: 'rowGroup', ...this.state.rowGroup });
        }
        if (this.state.aggregation) {
            operations.push({ type: 'aggregation', ...this.state.aggregation });
        }
        if (this.state.pivot) {
            operations.push({ type: 'pivot', ...this.state.pivot });
        }
        if (this.state.sort) {
            operations.push({
                type: 'sort',
                seq: this.state.sort.seq,
                eventType: 'toolPanelUi',
                sortDefsByColId: this.state.sort.sortDefsByColId,
                baselineCleared: this.state.sort.baselineCleared,
            });
        }

        operations.sort((a, b) => a.seq - b.seq);

        for (const operation of operations) {
            eventType = operation.eventType;
            switch (operation.type) {
                case 'columnState': {
                    for (const [colId, patch] of operation.state) {
                        Object.assign(ensureState(colId), patch);
                    }
                    break;
                }
                case 'columnOrder': {
                    applyOrder = true;
                    orderedColIds = operation.orderedColIds;
                    break;
                }
                case 'rowGroup': {
                    const groupIndexByColId = new Map<string, number>();
                    operation.groupColIds.forEach((colId, index) => groupIndexByColId.set(colId, index));
                    for (const colId of colIds) {
                        const state = ensureState(colId);
                        if (groupIndexByColId.has(colId)) {
                            state.rowGroup = true;
                            state.rowGroupIndex = groupIndexByColId.get(colId);
                        } else {
                            state.rowGroup = false;
                            state.rowGroupIndex = null;
                        }
                    }
                    break;
                }
                case 'aggregation': {
                    const valueColIdSet = new Set(operation.valueColIds);
                    for (const column of cols) {
                        const colId = column.getColId();
                        const state = ensureState(colId);
                        if (valueColIdSet.has(colId)) {
                            const draftAggFunc = this.state.draftAggFuncsByColId.get(colId);
                            const currentAggFunc = column.getAggFunc();
                            const fallbackAggFunc = this.beans.aggFuncSvc?.getDefaultAggFunc(column) ?? null;
                            state.aggFunc = draftAggFunc ?? currentAggFunc ?? fallbackAggFunc;
                        } else {
                            state.aggFunc = null;
                        }
                    }
                    break;
                }
                case 'pivot': {
                    const pivotIndexByColId = new Map<string, number>();
                    operation.pivotColIds.forEach((colId, index) => pivotIndexByColId.set(colId, index));
                    for (const colId of colIds) {
                        const state = ensureState(colId);
                        if (pivotIndexByColId.has(colId)) {
                            state.pivot = true;
                            state.pivotIndex = pivotIndexByColId.get(colId);
                        } else {
                            state.pivot = false;
                            state.pivotIndex = null;
                        }
                    }
                    break;
                }
                case 'sort': {
                    defaultSortCleared = defaultSortCleared || operation.baselineCleared;
                    let sortIndex = 0;
                    for (const [colId, sortDef] of operation.sortDefsByColId) {
                        const state = ensureState(colId);
                        state.sort = sortDef?.direction ?? null;
                        state.sortIndex = sortDef?.direction ? sortIndex++ : null;
                    }
                    break;
                }
            }
        }

        if (applyOrder && orderedColIds) {
            for (const colId of orderedColIds) {
                ensureState(colId);
            }
        }

        if (colStateByColId.size > 0 || applyOrder || defaultSortCleared) {
            const finalState =
                applyOrder && orderedColIds
                    ? orderedColIds.map((colId) => colStateByColId.get(colId) ?? { colId })
                    : [...colStateByColId.values()];
            _applyColumnState(
                this.beans,
                {
                    state: finalState,
                    applyOrder,
                    defaultState: defaultSortCleared ? { sort: null, sortIndex: null } : undefined,
                },
                eventType
            );
        }

        if (this.state.pivotMode) {
            const { pivotMode, eventType: pivotModeEventType } = this.state.pivotMode;
            const { colModel, gos, ctrlsSvc } = this.beans;
            if (pivotMode !== colModel.isPivotMode()) {
                gos.updateGridOptions({ options: { pivotMode }, source: pivotModeEventType as any });
                for (const c of ctrlsSvc.getHeaderRowContainerCtrls()) {
                    c.refresh();
                }
            }
        }

        this.reset();
    }

    public applyColumnState(state: ColumnState[], eventType: ColumnEventType): void {
        for (const patch of state) {
            this.mergeColumnStatePatch(patch);
        }
        this.state.columnStateSeq = this.nextSeq();
        this.state.columnStateEventType = eventType;
    }

    public moveColumns(columns: AgColumn[], targetIndex: number, eventType: ColumnEventType): void {
        const movingColIds = new Set(columns.map((column) => column.getColId()));
        const orderedColIds =
            this.state.columnOrder?.orderedColIds ?? this.beans.colModel.getCols().map((column) => column.getColId());

        const remaining = orderedColIds.filter((colId) => !movingColIds.has(colId));
        const beforeTarget = orderedColIds.slice(0, targetIndex);
        const movedBeforeTargetCount = beforeTarget.filter((colId) => movingColIds.has(colId)).length;
        const adjustedTargetIndex = Math.min(Math.max(targetIndex - movedBeforeTargetCount, 0), remaining.length);
        const movedIds = columns.map((column) => column.getColId());

        this.state.columnOrder = {
            orderedColIds: [
                ...remaining.slice(0, adjustedTargetIndex),
                ...movedIds,
                ...remaining.slice(adjustedTargetIndex),
            ],
            eventType,
            seq: this.nextSeq(),
        };
    }

    public setColumnsVisible(columns: AgColumn[], visible: boolean, eventType: ColumnEventType): void {
        for (const column of columns) {
            if (column.getColDef().lockVisible) {
                continue;
            }
            this.mergeColumnStatePatch({ colId: column.getColId(), hide: !visible });
        }
        this.state.columnStateSeq = this.nextSeq();
        this.state.columnStateEventType = eventType;
    }

    public setRowGroupColumns(columns: AgColumn[], eventType: ColumnEventType): void {
        this.state.rowGroup = {
            groupColIds: columns.map((column) => column.getColId()),
            eventType,
            seq: this.nextSeq(),
        };
    }

    public setValueColumns(columns: AgColumn[], eventType: ColumnEventType): void {
        this.state.aggregation = {
            valueColIds: columns.map((column) => column.getColId()),
            eventType,
            seq: this.nextSeq(),
        };
    }

    public setColumnAggFunc(
        column: AgColumn,
        aggFunc: string | IAggFunc | null | undefined,
        eventType: ColumnEventType
    ): void {
        this.mergeColumnStatePatch({ colId: column.getColId(), aggFunc });
        this.state.columnStateSeq = this.nextSeq();
        this.state.columnStateEventType = eventType;
        this.state.draftAggFuncsByColId.set(column.getColId(), aggFunc);
    }

    public getColumnAggFunc(column: AgColumn): string | IAggFunc | null | undefined {
        const colId = column.getColId();
        if (this.state.draftAggFuncsByColId.has(colId)) {
            return this.state.draftAggFuncsByColId.get(colId);
        }
        return column.getAggFunc();
    }

    public isColumnVisibleInToolPanel(column: AgColumn): boolean {
        const columnState = this.state.columnStateByColId.get(column.getColId());
        if (columnState?.hide !== undefined) {
            return !columnState.hide;
        }
        return column.isVisible();
    }

    public isColumnSelectedInPivotModeToolPanel(column: AgColumn): boolean {
        const colId = column.getColId();
        const columnState = this.state.columnStateByColId.get(colId);

        const rowGroupActive =
            columnState?.rowGroup !== undefined
                ? !!columnState.rowGroup
                : this.state.rowGroup
                  ? this.state.rowGroup.groupColIds.includes(colId)
                  : column.isRowGroupActive();

        const pivotActive =
            columnState?.pivot !== undefined
                ? !!columnState.pivot
                : this.state.pivot
                  ? this.state.pivot.pivotColIds.includes(colId)
                  : column.isPivotActive();

        const valueActive =
            columnState?.aggFunc !== undefined
                ? columnState.aggFunc != null
                : this.state.aggregation
                  ? this.state.aggregation.valueColIds.includes(colId)
                  : column.isValueActive();

        return rowGroupActive || pivotActive || valueActive;
    }

    public setPivotColumns(columns: AgColumn[], eventType: ColumnEventType): void {
        this.state.pivot = {
            pivotColIds: columns.map((column) => column.getColId()),
            eventType,
            seq: this.nextSeq(),
        };
    }

    public setPivotMode(pivotMode: boolean, eventType: ColumnEventType): void {
        this.state.pivotMode = {
            pivotMode,
            eventType,
            seq: this.nextSeq(),
        };
    }

    public getRowGroupColumns(): AgColumn[] {
        const colIds = this.state.rowGroup?.groupColIds;
        if (!colIds) {
            return this.beans.rowGroupColsSvc?.columns ?? [];
        }

        return colIds
            .map((colId) => this.beans.colModel.getColDefCol(colId))
            .filter((column): column is AgColumn => !!column);
    }

    public getValueColumns(): AgColumn[] {
        const colIds = this.state.aggregation?.valueColIds;
        if (!colIds) {
            return this.beans.valueColsSvc?.columns ?? [];
        }

        return colIds
            .map((colId) => this.beans.colModel.getColDefCol(colId))
            .filter((column): column is AgColumn => !!column);
    }

    public getPivotColumns(): AgColumn[] {
        const colIds = this.state.pivot?.pivotColIds;
        if (!colIds) {
            return this.beans.pivotColsSvc?.columns ?? [];
        }

        return colIds
            .map((colId) => this.beans.colModel.getColDefCol(colId))
            .filter((column): column is AgColumn => !!column);
    }

    public getPivotMode(): boolean {
        return this.state.pivotMode?.pivotMode ?? this.beans.colModel.isPivotMode();
    }

    public getPivotModeForToolPanel(): boolean {
        return this.getPivotMode();
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

    public getSortDefForToolPanel(column: AgColumn): SortDef | null {
        return this.getSortDef(column);
    }

    public progressSortFromEvent(column: AgColumn, event: MouseEvent | KeyboardEvent): void {
        const currentDraft = this.state.sort ?? {
            sortDefsByColId: new Map<string, SortDef | null>(),
            baselineCleared: false,
            seq: 0,
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
        currentDraft.seq = this.nextSeq();
        this.state.sort = currentDraft;
    }
}
