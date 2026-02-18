import type { AgColumn, BeanCollection, ColumnEventType, ColumnState, IAggFunc } from 'ag-grid-community';
import { _applyColumnState } from 'ag-grid-community';

import type { ColumnModelItem } from './columnModelItem';

/** Apply select-all from groups while supporting deferred-mode staging callbacks. */
export function selectAllChildren(
    beans: BeanCollection,
    colTree: ColumnModelItem[],
    selectAllChecked: boolean,
    eventType: ColumnEventType,
    onDeferredPivotColumnStateUpdate?: (stateItems: ColumnState[]) => void,
    onDeferredVisibilityColumnStateUpdate?: (stateItems: ColumnState[]) => void,
    pivotModeOverride?: boolean,
    getToolPanelColumnFunctionState?: (column: AgColumn) => { rowGroup: boolean; pivot: boolean; value: boolean }
): void {
    const cols = extractAllLeafColumns(colTree);
    setAllColumns(
        beans,
        cols,
        selectAllChecked,
        eventType,
        onDeferredPivotColumnStateUpdate,
        onDeferredVisibilityColumnStateUpdate,
        pivotModeOverride,
        getToolPanelColumnFunctionState
    );
}

/** Route select-all updates to pivot/value or visibility paths, with optional deferred overrides. */
export function setAllColumns(
    beans: BeanCollection,
    cols: AgColumn[],
    selectAllChecked: boolean,
    eventType: ColumnEventType,
    onDeferredPivotColumnStateUpdate?: (stateItems: ColumnState[]) => void,
    onDeferredVisibilityColumnStateUpdate?: (stateItems: ColumnState[]) => void,
    pivotModeOverride?: boolean,
    getToolPanelColumnFunctionState?: (column: AgColumn) => { rowGroup: boolean; pivot: boolean; value: boolean }
): void {
    if (pivotModeOverride ?? beans.colModel.isPivotMode()) {
        setAllPivot(
            beans,
            cols,
            selectAllChecked,
            eventType,
            onDeferredPivotColumnStateUpdate,
            getToolPanelColumnFunctionState
        );
    } else {
        setAllVisible(beans, cols, selectAllChecked, eventType, onDeferredVisibilityColumnStateUpdate);
    }
}

function extractAllLeafColumns(allItems: ColumnModelItem[]): AgColumn[] {
    const res: AgColumn[] = [];

    const recursiveFunc = (items: ColumnModelItem[]) => {
        for (const item of items) {
            if (!item.passesFilter) {
                continue;
            }
            if (item.group) {
                recursiveFunc(item.children);
            } else {
                res.push(item.column);
            }
        }
    };

    recursiveFunc(allItems);

    return res;
}

function setAllVisible(
    beans: BeanCollection,
    columns: AgColumn[],
    visible: boolean,
    eventType: ColumnEventType,
    onDeferredVisibilityColumnStateUpdate?: (stateItems: ColumnState[]) => void
): void {
    const colStateItems: ColumnState[] = [];
    /** Stage full desired visibility in deferred mode, not only visible diffs against applied state. */
    const shouldAlwaysStageDeferredVisibility = !!onDeferredVisibilityColumnStateUpdate;

    for (const col of columns) {
        if (col.getColDef().lockVisible) {
            continue;
        }
        if (shouldAlwaysStageDeferredVisibility || col.isVisible() != visible) {
            colStateItems.push({
                colId: col.getId(),
                hide: !visible,
            });
        }
    }

    if (colStateItems.length > 0) {
        if (onDeferredVisibilityColumnStateUpdate) {
            onDeferredVisibilityColumnStateUpdate(colStateItems);
            return;
        }
        _applyColumnState(beans, { state: colStateItems }, eventType);
    }
}

function setAllPivot(
    beans: BeanCollection,
    columns: AgColumn[],
    value: boolean,
    eventType: ColumnEventType,
    onDeferredPivotColumnStateUpdate?: (stateItems: ColumnState[]) => void,
    getToolPanelColumnFunctionState?: (column: AgColumn) => { rowGroup: boolean; pivot: boolean; value: boolean }
): void {
    setAllPivotActive(
        beans,
        columns,
        value,
        eventType,
        onDeferredPivotColumnStateUpdate,
        getToolPanelColumnFunctionState
    );
}

function setAllPivotActive(
    beans: BeanCollection,
    columns: AgColumn[],
    value: boolean,
    eventType: ColumnEventType,
    onDeferredPivotColumnStateUpdate?: (stateItems: ColumnState[]) => void,
    getToolPanelColumnFunctionState?: (column: AgColumn) => { rowGroup: boolean; pivot: boolean; value: boolean }
): void {
    const colStateItems: ColumnState[] = [];
    /** Stage explicit pivot off actions in deferred mode, even if applied state is already inactive. */
    const shouldAlwaysStageDeferredPivot = !!onDeferredPivotColumnStateUpdate;

    const turnOnAction = (col: AgColumn) => {
        const currentFunctionState = getToolPanelColumnFunctionState?.(col);
        const isAnyFunctionActive = currentFunctionState
            ? currentFunctionState.rowGroup || currentFunctionState.pivot || currentFunctionState.value
            : col.isAnyFunctionActive();
        // don't change any column that's already got a function active
        if (isAnyFunctionActive) {
            return;
        }

        if (col.isAllowValue()) {
            const aggFunc =
                typeof col.getAggFunc() === 'string' ? col.getAggFunc() : beans.aggFuncSvc?.getDefaultAggFunc(col);
            colStateItems.push({
                colId: col.getId(),
                aggFunc: aggFunc,
            });
        } else if (col.isAllowRowGroup()) {
            colStateItems.push({
                colId: col.getId(),
                rowGroup: true,
            });
        } else if (col.isAllowPivot()) {
            colStateItems.push({
                colId: col.getId(),
                pivot: true,
            });
        }
    };

    const turnOffAction = (col: AgColumn) => {
        const isActive = col.isPivotActive() || col.isRowGroupActive() || col.isValueActive();
        if (shouldAlwaysStageDeferredPivot || isActive) {
            colStateItems.push({
                colId: col.getId(),
                pivot: false,
                rowGroup: false,
                aggFunc: null,
            });
        }
    };

    const action = value ? turnOnAction : turnOffAction;

    columns.forEach(action);

    if (colStateItems.length > 0) {
        if (onDeferredPivotColumnStateUpdate) {
            onDeferredPivotColumnStateUpdate(colStateItems);
            return;
        }
        _applyColumnState(beans, { state: colStateItems }, eventType);
    }
}

export function updateColumns(
    beans: BeanCollection,
    params: {
        columns: AgColumn[];
        visibleState?: { [key: string]: boolean };
        pivotState?: {
            [key: string]: {
                pivot?: boolean;
                rowGroup?: boolean;
                aggFunc?: string | IAggFunc | null;
            };
        };
        eventType: ColumnEventType;
    }
): void {
    const { columns, visibleState, pivotState, eventType } = params;
    const state: ColumnState[] = columns.map((column) => {
        const colId = column.getColId();
        if (beans.colModel.isPivotMode()) {
            const pivotStateForColumn = pivotState?.[colId];
            return {
                colId,
                pivot: pivotStateForColumn?.pivot,
                rowGroup: pivotStateForColumn?.rowGroup,
                aggFunc: pivotStateForColumn?.aggFunc,
            };
        } else {
            return {
                colId,
                hide: !visibleState?.[colId],
            };
        }
    });
    _applyColumnState(beans, { state }, eventType);
}

export function createPivotState(column: AgColumn): {
    pivot?: boolean;
    rowGroup?: boolean;
    aggFunc?: string | IAggFunc | null;
} {
    return {
        pivot: column.isPivotActive(),
        rowGroup: column.isRowGroupActive(),
        aggFunc: column.isValueActive() ? column.getAggFunc() : undefined,
    };
}
