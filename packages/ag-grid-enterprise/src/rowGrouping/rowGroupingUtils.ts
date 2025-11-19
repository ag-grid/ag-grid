import type { AgColumn, BeanCollection, ColumnModel, RowNode } from 'ag-grid-community';

import { setGroupData } from '../rowHierarchy/rowHierarchyUtils';

export function setRowNodeGroupValue(
    rowNode: RowNode,
    colModel: ColumnModel,
    colKey: string | AgColumn,
    newValue: any
): void {
    const column = colModel.getCol(colKey)!;

    let groupData = rowNode.groupData;
    if (!groupData) {
        groupData = {};
        setGroupData(rowNode, groupData);
    }

    const columnId = column.getColId();
    const oldValue = groupData[columnId];

    if (oldValue === newValue) {
        return;
    }

    groupData[columnId] = newValue;
    rowNode.dispatchCellChangedEvent(column, newValue, oldValue);
}

export function setRowNodeGroup(rowNode: RowNode, beans: BeanCollection, group: boolean): void {
    if (rowNode.group === group) {
        return;
    }

    // if we used to be a group, and no longer, then close the node
    if (rowNode.group && !group) {
        rowNode.expanded = false;
    }

    rowNode.group = group;
    rowNode.updateHasChildren();
    beans.selectionSvc?.updateRowSelectable(rowNode);
    rowNode.dispatchRowEvent('groupChanged');
}

export function isRowGroupColLocked(column: AgColumn | undefined | null, beans: BeanCollection): boolean {
    const { gos, rowGroupColsSvc } = beans;

    if (!rowGroupColsSvc || !column) {
        return false;
    }

    const groupLockGroupColumns = gos.get('groupLockGroupColumns');
    if (!column.isRowGroupActive() || groupLockGroupColumns === 0) {
        return false;
    }

    if (groupLockGroupColumns === -1) {
        return true;
    }

    const colIndex = rowGroupColsSvc.columns.findIndex((groupCol) => groupCol.getColId() === column.getColId());
    return groupLockGroupColumns > colIndex;
}
