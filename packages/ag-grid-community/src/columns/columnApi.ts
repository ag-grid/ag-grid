import type { BeanCollection } from '../context/context';
import type { AgColumn } from '../entities/agColumn';
import type { AgColumnGroup } from '../entities/agColumnGroup';
import type { AgProvidedColumnGroup } from '../entities/agProvidedColumnGroup';
import type { ColDef, ColGroupDef, HeaderLocation } from '../entities/colDef';
import type { Column, ColumnGroup, ColumnPinnedType, ProvidedColumnGroup } from '../interfaces/iColumn';
import type { ApplyColumnStateParams, ColumnState } from './columnApplyStateService';

export function getColumnDef<TValue = any, TData = any>(
    beans: BeanCollection,
    key: string | Column<TValue>
): ColDef<TData, TValue> | null {
    const column = beans.columnModel.getColDefCol(key);
    if (column) {
        return column.getColDef();
    }
    return null;
}

export function getColumnDefs<TData = any>(beans: BeanCollection): (ColDef<TData> | ColGroupDef<TData>)[] | undefined {
    return beans.columnModel.getColumnDefs();
}

export function setColumnGroupOpened(
    beans: BeanCollection,
    group: ProvidedColumnGroup | string,
    newValue: boolean
): void {
    beans.columnModel.setColumnGroupOpened(group as AgProvidedColumnGroup | string, newValue, 'api');
}

export function getColumnGroup(beans: BeanCollection, name: string, instanceId?: number): ColumnGroup | null {
    return beans.visibleColsService.getColumnGroup(name, instanceId);
}

export function getProvidedColumnGroup(beans: BeanCollection, name: string): ProvidedColumnGroup | null {
    return beans.columnModel.getProvidedColGroup(name);
}

export function getDisplayNameForColumn(beans: BeanCollection, column: Column, location: HeaderLocation): string {
    return beans.columnNameService.getDisplayNameForColumn(column as AgColumn, location) || '';
}

export function getDisplayNameForColumnGroup(
    beans: BeanCollection,
    columnGroup: ColumnGroup,
    location: HeaderLocation
): string {
    return beans.columnNameService.getDisplayNameForColumnGroup(columnGroup as AgColumnGroup, location) || '';
}

export function getColumn<TValue = any, TData = any>(
    beans: BeanCollection,
    key: string | ColDef<TData, TValue> | Column<TValue>
): Column<TValue> | null {
    return beans.columnModel.getColDefCol(key);
}

export function getColumns(beans: BeanCollection): Column[] | null {
    return beans.columnModel.getColDefCols();
}

export function applyColumnState(beans: BeanCollection, params: ApplyColumnStateParams): boolean {
    return beans.columnApplyStateService.applyColumnState(params, 'api');
}

export function getColumnState(beans: BeanCollection): ColumnState[] {
    return beans.columnGetStateService.getColumnState();
}

export function resetColumnState(beans: BeanCollection): void {
    beans.columnApplyStateService.resetColumnState('api');
}

export function getColumnGroupState(beans: BeanCollection): { groupId: string; open: boolean }[] {
    return beans.columnGroupStateService.getColumnGroupState();
}

export function setColumnGroupState(beans: BeanCollection, stateItems: { groupId: string; open: boolean }[]): void {
    beans.columnGroupStateService.setColumnGroupState(stateItems, 'api');
}

export function resetColumnGroupState(beans: BeanCollection): void {
    beans.columnGroupStateService.resetColumnGroupState('api');
}

export function isPinning(beans: BeanCollection): boolean {
    return beans.visibleColsService.isPinningLeft() || beans.visibleColsService.isPinningRight();
}

export function isPinningLeft(beans: BeanCollection): boolean {
    return beans.visibleColsService.isPinningLeft();
}

export function isPinningRight(beans: BeanCollection): boolean {
    return beans.visibleColsService.isPinningRight();
}

export function getDisplayedColAfter(beans: BeanCollection, col: Column): Column | null {
    return beans.visibleColsService.getColAfter(col as AgColumn);
}

export function getDisplayedColBefore(beans: BeanCollection, col: Column): Column | null {
    return beans.visibleColsService.getColBefore(col as AgColumn);
}

/** @deprecated v31.1 */
export function setColumnVisible(beans: BeanCollection, key: string | Column, visible: boolean): void {
    beans.columnModel.setColsVisible([key as string | AgColumn], visible, 'api');
}

export function setColumnsVisible(beans: BeanCollection, keys: (string | Column)[], visible: boolean): void {
    beans.columnModel.setColsVisible(keys as (string | AgColumn)[], visible, 'api');
}

/** @deprecated v31.1 */
export function setColumnPinned(beans: BeanCollection, key: string | ColDef | Column, pinned: ColumnPinnedType): void {
    beans.columnModel.setColsPinned([key], pinned, 'api');
}

export function setColumnsPinned(
    beans: BeanCollection,
    keys: (string | ColDef | Column)[],
    pinned: ColumnPinnedType
): void {
    beans.columnModel.setColsPinned(keys, pinned, 'api');
}

export function getAllGridColumns(beans: BeanCollection): Column[] {
    return beans.columnModel.getCols();
}

export function getDisplayedLeftColumns(beans: BeanCollection): Column[] {
    return beans.visibleColsService.leftCols;
}

export function getDisplayedCenterColumns(beans: BeanCollection): Column[] {
    return beans.visibleColsService.centerCols;
}

export function getDisplayedRightColumns(beans: BeanCollection): Column[] {
    return beans.visibleColsService.rightCols;
}

export function getAllDisplayedColumns(beans: BeanCollection): Column[] {
    return beans.visibleColsService.allCols;
}

export function getAllDisplayedVirtualColumns(beans: BeanCollection): Column[] {
    return beans.columnViewportService.getViewportColumns();
}

export function getLeftDisplayedColumnGroups(beans: BeanCollection): (Column | ColumnGroup)[] {
    return beans.visibleColsService.treeLeft;
}

export function getCenterDisplayedColumnGroups(beans: BeanCollection): (Column | ColumnGroup)[] {
    return beans.visibleColsService.treeCenter;
}

export function getRightDisplayedColumnGroups(beans: BeanCollection): (Column | ColumnGroup)[] {
    return beans.visibleColsService.treeRight;
}

export function getAllDisplayedColumnGroups(beans: BeanCollection): (Column | ColumnGroup)[] | null {
    return beans.visibleColsService.getAllTrees();
}
