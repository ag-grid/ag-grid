import type { AgColumn, BeanCollection, ColumnModel, LocaleTextFunc, RowNode } from 'ag-grid-community';

export function setRowNodeGroupValue(
    rowNode: RowNode,
    colModel: ColumnModel,
    colKey: string | AgColumn,
    newValue: any
): void {
    const column = colModel.getCol(colKey)!;

    let groupData = rowNode._groupData;
    if (!groupData) {
        groupData = {};
        rowNode._groupData = groupData;
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

/**
 * In AG-16700 the locale introduced a ${variable} and stopped concatenating the column name in the code
 * To avoid a breaking change we need to check if the variable is present and if not fallback to the old way of concatenating the column name.
 */
export function getGroupingLocaleText(
    localeTextFunc: LocaleTextFunc,
    key: 'groupBy' | 'ungroupBy',
    displayName: string
): string {
    const prefix = key === 'groupBy' ? 'Group by' : 'Un-Group by';

    const localStr = localeTextFunc(key, `${prefix} ${displayName}`, [displayName]);

    // Check if the displayName variable is present in the localized string, if not fallback to the old way of concatenating the column name
    if (localStr.indexOf(displayName) >= 0) {
        return localStr;
    } else {
        return `${localStr} ${displayName}`;
    }
}
