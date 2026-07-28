import type { AgColumn, BeanCollection, ColDef, ColGroupDef, ColKey, Column } from 'ag-grid-community';
import { _dispatchColumnChangedEvent } from 'ag-grid-community';

export function isPivotMode(beans: BeanCollection): boolean {
    return beans.colModel.pivotMode;
}

export function getPivotResultColumn<TValue = any, TData = any>(
    beans: BeanCollection,
    pivotKeys: string[],
    valueColKey: ColKey<TData, TValue>
): Column<TValue> | null {
    return beans.pivotResultCols?.lookupPivotResultCol(pivotKeys, valueColKey) ?? null;
}

export function setValueColumns(beans: BeanCollection, colKeys: ColKey[]): void {
    beans.valueColsSvc?.setColumns(colKeys, 'api');
}

export function getValueColumns(beans: BeanCollection): Column[] {
    return beans.valueColsSvc?.columns ?? [];
}

export function removeValueColumns(beans: BeanCollection, colKeys: ColKey[]): void {
    beans.valueColsSvc?.removeColumns(colKeys, 'api');
}

export function addValueColumns(beans: BeanCollection, colKeys: ColKey[]): void {
    beans.valueColsSvc?.addColumns(colKeys, 'api');
}

export function setPivotColumns(beans: BeanCollection, colKeys: ColKey[]): void {
    beans.pivotColsSvc?.setColumns(colKeys, 'api');
}

export function removePivotColumns(beans: BeanCollection, colKeys: ColKey[]): void {
    beans.pivotColsSvc?.removeColumns(colKeys, 'api');
}

export function addPivotColumns(beans: BeanCollection, colKeys: ColKey[]): void {
    beans.pivotColsSvc?.addColumns(colKeys, 'api');
}

export function getPivotColumns(beans: BeanCollection): Column[] {
    return beans.pivotColsSvc?.columns ?? [];
}

export function setPivotResultColumns(beans: BeanCollection, colDefs: (ColDef | ColGroupDef)[] | null): void {
    const cleared = clearPivotSort(beans);
    beans.pivotResultCols?.setPivotResultCols(colDefs, 'api', true);
    // Dispatched only once the new columns are applied, so listeners never re-order the outgoing ones.
    if (cleared) {
        _dispatchColumnChangedEvent(beans.eventSvc, 'columnPivotChanged', cleared, 'api');
    }
}

/** The app owns the pivot result column order once it supplies the columns itself, so any `pivotSort` is
 *  cleared to the explicit "no sort" value rather than left claiming an ordering the grid didn't apply.
 *  Returns the cleared cols for the caller to announce. */
function clearPivotSort(beans: BeanCollection): AgColumn[] | null {
    const pivotCols = beans.pivotColsSvc?.columns ?? [];
    let cleared: AgColumn[] | null = null;
    for (let i = 0, len = pivotCols.length; i < len; ++i) {
        const col = pivotCols[i];
        if (col.pivotSort !== null) {
            col.pivotSort = null;
            cleared ??= [];
            cleared.push(col);
        }
    }
    return cleared;
}

export function getPivotResultColumns(beans: BeanCollection): Column[] | null {
    return beans.pivotResultCols?.pivotCols ?? null;
}
