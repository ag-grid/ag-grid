import type { AgColumn, BeanCollection, ColumnEventType, ColumnState, IAggFunc } from 'ag-grid-community';

import type { ColumnModelItem } from './columnModelItem';
import { getColumnToolPanelEditStrategy } from './columnToolPanelEditUtils';
import type { ColumnToolPanelEditParams } from './columnToolPanelEditsTypes';

export function selectAllChildren(
    beans: BeanCollection,
    colTree: ColumnModelItem[],
    selectAllChecked: boolean,
    eventType: ColumnEventType,
    params: ColumnToolPanelEditParams
): void {
    const cols = extractAllLeafColumns(colTree);
    setAllColumns(beans, cols, selectAllChecked, eventType, params);
}

export function setAllColumns(
    beans: BeanCollection,
    cols: AgColumn[],
    selectAllChecked: boolean,
    eventType: ColumnEventType,
    params: ColumnToolPanelEditParams
): void {
    if (beans.colModel.isPivotMode()) {
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
    params: ColumnToolPanelEditParams
): void {
    const edits = getColumnToolPanelEditStrategy(beans, params.deferApply);
    const colStateItems: ColumnState[] = [];

    for (const col of columns) {
        if (col.getColDef().lockVisible) {
            continue;
        }
        if (edits.isColumnVisibleInToolPanel(col) !== visible) {
            colStateItems.push({
                colId: col.getId(),
                hide: !visible,
            });
        }
    }

    edits.applyColumnState(colStateItems, eventType);
}

function setAllPivot(
    beans: BeanCollection,
    columns: AgColumn[],
    value: boolean,
    eventType: ColumnEventType,
    params: ColumnToolPanelEditParams
): void {
    setAllPivotActive(beans, columns, value, eventType, params);
}

function setAllPivotActive(
    beans: BeanCollection,
    columns: AgColumn[],
    value: boolean,
    eventType: ColumnEventType,
    params: ColumnToolPanelEditParams
): void {
    const edits = getColumnToolPanelEditStrategy(beans, params.deferApply);
    const colStateItems: ColumnState[] = [];

    const turnOnAction = (col: AgColumn) => {
        // don't change any column that's already got a function active
        if (edits.isColumnSelectedInPivotModeToolPanel(col)) {
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
        const isActive = edits.isColumnSelectedInPivotModeToolPanel(col);
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

    edits.applyColumnState(colStateItems, eventType);
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
        deferApply?: boolean;
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
    getColumnToolPanelEditStrategy(beans, params.deferApply).applyColumnState(state, eventType);
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
