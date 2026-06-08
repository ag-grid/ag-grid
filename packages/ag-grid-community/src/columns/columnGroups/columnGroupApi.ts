import type { BeanCollection } from '../../context/context';
import type { AgColumnGroup } from '../../entities/agColumnGroup';
import type { AgProvidedColumnGroup } from '../../entities/agProvidedColumnGroup';
import type { HeaderLocation } from '../../entities/colDef';
import type { Column, ColumnGroup, ProvidedColumnGroup } from '../../interfaces/iColumn';
import { _getColGroupState, _resetColGroupState, _setColGroupOpen, _setColGroupState } from './columnGroupState';

export function setColumnGroupOpened(
    beans: BeanCollection,
    group: ProvidedColumnGroup | string,
    newValue: boolean
): void {
    _setColGroupOpen(beans, group as AgProvidedColumnGroup | string, newValue, 'api');
}

export function getColumnGroup(beans: BeanCollection, name: string, instanceId?: number): ColumnGroup | null {
    const instances = name != null ? beans.colModel.colsGroupsById.get(name)?.displayInstances : undefined;
    return (instances && (typeof instanceId === 'number' ? instances[instanceId] : instances[0])) || null;
}

export function getProvidedColumnGroup(beans: BeanCollection, name: string): ProvidedColumnGroup | null {
    return beans.colModel.getColGroup(name) ?? null;
}

export function getDisplayNameForColumnGroup(
    beans: BeanCollection,
    columnGroup: ColumnGroup,
    location: HeaderLocation
): string {
    return beans.colNames.getDisplayNameForColumnGroup(columnGroup as AgColumnGroup, location) || '';
}

export function getColumnGroupState(beans: BeanCollection): { groupId: string; open: boolean }[] {
    return _getColGroupState(beans);
}

export function setColumnGroupState(beans: BeanCollection, stateItems: { groupId: string; open: boolean }[]): void {
    _setColGroupState(beans, stateItems, 'api');
}

export function resetColumnGroupState(beans: BeanCollection): void {
    _resetColGroupState(beans, 'api');
}

export function getLeftDisplayedColumnGroups(beans: BeanCollection): (Column | ColumnGroup)[] {
    return beans.visibleCols.treeLeft;
}

export function getCenterDisplayedColumnGroups(beans: BeanCollection): (Column | ColumnGroup)[] {
    return beans.visibleCols.treeCenter;
}

export function getRightDisplayedColumnGroups(beans: BeanCollection): (Column | ColumnGroup)[] {
    return beans.visibleCols.treeRight;
}

export function getAllDisplayedColumnGroups(beans: BeanCollection): (Column | ColumnGroup)[] | null {
    const { treeLeft, treeCenter, treeRight } = beans.visibleCols;
    return treeLeft.concat(treeCenter, treeRight);
}
