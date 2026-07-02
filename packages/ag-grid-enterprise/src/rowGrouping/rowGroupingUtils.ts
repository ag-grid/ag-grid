import type { LocaleTextFunc } from 'ag-stack';

import type { AgColumn, BeanCollection, ColumnModel, RowNode } from 'ag-grid-community';

import { setAggData } from '../aggregation/aggDataUtils';

export const setRowNodeGroupValue = (
    rowNode: RowNode,
    colModel: ColumnModel,
    colKey: string | AgColumn,
    newValue: any
): void => {
    const column = colModel.getCol(colKey)!;

    let groupData = rowNode._groupData;
    if (!groupData) {
        groupData = {};
        rowNode._groupData = groupData;
    }

    const columnId = column.colId;
    const oldValue = groupData[columnId];

    if (oldValue === newValue) {
        return;
    }

    groupData[columnId] = newValue;
    rowNode.dispatchCellChangedEvent(column, newValue, oldValue);
};

const doSetRowNodeGroup = (rowNode: RowNode | null | undefined, beans: BeanCollection, group: boolean): void => {
    if (!rowNode) {
        return;
    }
    const oldGroup = rowNode.group;
    if (oldGroup === group) {
        return;
    }

    rowNode.group = group;
    rowNode.updateHasChildren();

    // Clear stale aggData and allChildrenCount when demoting from group to leaf.
    // These must be cleared here because downstream stages (filterAggregatesStage)
    // won't visit this node via changedPath since it's no longer a group.
    if (oldGroup && !group) {
        setAggData(rowNode, null, beans.colModel);
        rowNode.setAllChildrenCount(null);
    }

    rowNode.dispatchRowEvent('groupChanged');
};

export const setRowNodeGroup = (rowNode: RowNode, beans: BeanCollection, group: boolean): void => {
    doSetRowNodeGroup(rowNode, beans, group);
    doSetRowNodeGroup(rowNode.pinnedSibling, beans, group);
};

export const isRowGroupColLocked = (column: AgColumn | undefined | null, beans: BeanCollection): boolean => {
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

    const colIndex = rowGroupColsSvc.columns.findIndex((groupCol) => groupCol.colId === column.colId);
    return groupLockGroupColumns > colIndex;
};

/**
 * In AG-16700 the locale introduced a ${variable} and stopped concatenating the column name in the code
 * To avoid a breaking change we need to check if the variable is present and if not fallback to the old way of concatenating the column name.
 */
export const getGroupingLocaleText = (
    localeTextFunc: LocaleTextFunc,
    key: 'groupBy' | 'ungroupBy',
    displayName: string
): string => {
    const prefix = key === 'groupBy' ? 'Group by' : 'Un-Group by';

    const localStr = localeTextFunc(key, `${prefix} ${displayName}`, [displayName]);

    // Check if the displayName variable is present in the localized string, if not fallback to the old way of concatenating the column name
    if (localStr.indexOf(displayName) >= 0) {
        return localStr;
    } else {
        return `${localStr} ${displayName}`;
    }
};
