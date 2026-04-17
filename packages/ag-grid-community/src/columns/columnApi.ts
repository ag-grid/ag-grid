import type { BeanCollection } from '../context/context';
import type { AgColumn } from '../entities/agColumn';
import type { ColDef, ColGroupDef, ColKey, HeaderLocation } from '../entities/colDef';
import type { Column, ColumnPinnedType } from '../interfaces/iColumn';
import { _applyColumnState, _getColumnState, _resetColumnState } from './columnStateUtils';
import type { ApplyColumnStateParams, ColumnState } from './columnStateUtils';
import { exportColumnDefs } from './exportColumnDefs';

export type ColumnChangedEventType = 'columnValueChanged' | 'columnPivotChanged' | 'columnRowGroupChanged';

export function getColumnDef<TValue = any, TData = any>(
    beans: BeanCollection,
    key: string | Column<TValue>
): ColDef<TData, TValue> | null {
    return beans.colModel.getColDefOrCol(key)?.colDef ?? null;
}

export function getColumnDefs(beans: BeanCollection): (ColDef | ColGroupDef)[] | undefined {
    return exportColumnDefs(beans);
}

export function getDisplayNameForColumn(beans: BeanCollection, column: Column, location: HeaderLocation): string {
    return beans.colNames.getDisplayNameForColumn(column as AgColumn, location) || '';
}

export function getColumn<TValue = any, TData = any>(
    beans: BeanCollection,
    key: ColKey<TData, TValue>
): Column<TValue> | null {
    return beans.colModel.getColDefOrCol(key) ?? null;
}

export function getColumns(beans: BeanCollection): Column[] | null {
    const cm = beans.colModel;
    return cm.ready ? cm.colDefList : null;
}

export function applyColumnState(beans: BeanCollection, params: ApplyColumnStateParams): boolean {
    return _applyColumnState(beans, params, 'api');
}

export function getColumnState(beans: BeanCollection): ColumnState[] {
    return _getColumnState(beans);
}

export function resetColumnState(beans: BeanCollection): void {
    _resetColumnState(beans, 'api');
}

export function isPinning(beans: BeanCollection): boolean {
    return beans.visibleCols.isPinningLeft() || beans.visibleCols.isPinningRight();
}

export function isPinningLeft(beans: BeanCollection): boolean {
    return beans.visibleCols.isPinningLeft();
}

export function isPinningRight(beans: BeanCollection): boolean {
    return beans.visibleCols.isPinningRight();
}

export function getDisplayedColAfter(beans: BeanCollection, col: Column): Column | null {
    return beans.visibleCols.getColAfter(col as AgColumn);
}

export function getDisplayedColBefore(beans: BeanCollection, col: Column): Column | null {
    return beans.visibleCols.getColBefore(col as AgColumn);
}

export function setColumnsVisible(beans: BeanCollection, keys: (string | Column)[], visible: boolean): void {
    beans.colModel.setColsVisible(keys as (string | AgColumn)[], visible, 'api');
}

export function setColumnsPinned(beans: BeanCollection, keys: ColKey[], pinned: ColumnPinnedType): void {
    beans.pinnedCols?.setColsPinned(keys, pinned, 'api');
}

export function getAllGridColumns(beans: BeanCollection): Column[] {
    return beans.colModel.colsList;
}

export function getDisplayedLeftColumns(beans: BeanCollection): Column[] {
    return beans.visibleCols.leftCols;
}

export function getDisplayedCenterColumns(beans: BeanCollection): Column[] {
    return beans.visibleCols.centerCols;
}

export function getDisplayedRightColumns(beans: BeanCollection): Column[] {
    return beans.visibleCols.rightCols;
}

export function getAllDisplayedColumns(beans: BeanCollection): Column[] {
    return beans.visibleCols.allCols;
}

export function getAllDisplayedVirtualColumns(beans: BeanCollection): Column[] {
    return beans.colViewport.getViewportColumns();
}
