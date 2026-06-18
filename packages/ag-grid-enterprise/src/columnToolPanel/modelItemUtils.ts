import type {
    AgColumn,
    BeanCollection,
    ColumnEventType,
    ColumnState,
    IAggFunc,
    IColumnStateUpdateStrategy,
} from 'ag-grid-community';

import type { ColumnModelItem } from './columnModelItem';
import { isDeferredMode, refreshDeferredToolPanelUi } from './toolPanelDeferredUiUtils';
import type { ColumnStateUpdateParams } from './updates/columnStateUpdateTypes';

export function selectAllChildren(
    beans: BeanCollection,
    colTree: ColumnModelItem[],
    selectAllChecked: boolean,
    eventType: ColumnEventType,
    params: ColumnStateUpdateParams
): void {
    const cols = extractAllLeafColumns(colTree);
    setAllColumns(beans, cols, selectAllChecked, eventType, params);
}

export function setAllColumns(
    beans: BeanCollection,
    cols: AgColumn[],
    selectAllChecked: boolean,
    eventType: ColumnEventType,
    params: ColumnStateUpdateParams
): void {
    const updateStrategy = beans.columnStateUpdateStrategy;
    const isPivotMode = updateStrategy.getPivotMode(isDeferredMode(params));

    if (isPivotMode) {
        setAllPivot(beans, cols, selectAllChecked, eventType, params);
    } else {
        setAllVisible(beans, cols, selectAllChecked, eventType, params);
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
    params: ColumnStateUpdateParams
): void {
    const updateStrategy = beans.columnStateUpdateStrategy;
    const colStateItems: ColumnState[] = [];

    for (const col of columns) {
        if (col.colDef.lockVisible) {
            continue;
        }
        if (updateStrategy.isColumnVisibleInToolPanel(isDeferredMode(params), col) !== visible) {
            colStateItems.push({
                colId: col.getId(),
                hide: !visible,
            });
        }
    }

    updateStrategy.applyColumnState(isDeferredMode(params), colStateItems, eventType);
    refreshDeferredToolPanelUi(beans, params);
}

function setAllPivot(
    beans: BeanCollection,
    columns: AgColumn[],
    value: boolean,
    eventType: ColumnEventType,
    params: ColumnStateUpdateParams
): void {
    setAllPivotActive(beans, columns, value, eventType, params);
}

function setAllPivotActive(
    beans: BeanCollection,
    columns: AgColumn[],
    value: boolean,
    eventType: ColumnEventType,
    params: ColumnStateUpdateParams
): void {
    const updateStrategy = beans.columnStateUpdateStrategy;
    const colStateItems: ColumnState[] = [];

    const turnOnAction = (col: AgColumn) => {
        // don't change any column that's already got a function active
        if (updateStrategy.isColumnSelectedInPivotModeToolPanel(isDeferredMode(params), col)) {
            return;
        }

        if (col.isAllowValue()) {
            const aggFunc = typeof col.aggFunc === 'string' ? col.aggFunc : beans.aggFuncSvc?.getDefaultAggFunc(col);
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
        const isActive = updateStrategy.isColumnSelectedInPivotModeToolPanel(isDeferredMode(params), col);
        if (isActive) {
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

    updateStrategy.applyColumnState(isDeferredMode(params), colStateItems, eventType);
    refreshDeferredToolPanelUi(beans, params);
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
    } & ColumnStateUpdateParams
): void {
    const { columns, visibleState, pivotState, eventType } = params;
    const updateStrategy = beans.columnStateUpdateStrategy;
    const isPivotMode = updateStrategy.getPivotMode(isDeferredMode(params));
    const state: ColumnState[] = columns.map((column) => {
        const colId = column.colId;
        if (isPivotMode) {
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
    updateStrategy.applyColumnState(isDeferredMode(params), state, eventType);
    refreshDeferredToolPanelUi(beans, params);
}

function createPivotState(column: AgColumn): {
    pivot?: boolean;
    rowGroup?: boolean;
    aggFunc?: string | IAggFunc | null;
} {
    return {
        pivot: column.isPivotActive(),
        rowGroup: column.isRowGroupActive(),
        aggFunc: column.isValueActive() ? column.aggFunc : undefined,
    };
}

export function createPivotStateForToolPanel(
    column: AgColumn,
    updateStrategy: IColumnStateUpdateStrategy,
    deferApply: boolean
): {
    pivot?: boolean;
    rowGroup?: boolean;
    aggFunc?: string | IAggFunc | null;
} {
    if (!deferApply) {
        return createPivotState(column);
    }

    const rowGroup = updateStrategy.getRowGroupColumns(deferApply).includes(column);
    const pivot = updateStrategy.getPivotColumns(deferApply).includes(column);
    const value = updateStrategy.getValueColumns(deferApply).includes(column);

    return {
        pivot,
        rowGroup,
        aggFunc: value ? updateStrategy.getColumnAggFunc(deferApply, column) : undefined,
    };
}
