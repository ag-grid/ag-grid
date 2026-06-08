import type { ColumnModel, RowNode } from 'ag-grid-community';

/**
 * Traverses `rowNode.childrenMapped` using pivot keys to resolve the matching RowNode array.
 * Used by {@link AggregatedChildrenSvc} to resolve pivot children for `getAggregatedChildren`,
 * and by {@link AggregationStage} to collect values for pivot column aggregation.
 */
export const getNodesFromMappedSet = (mappedSet: any, keys: string[] | null | undefined): RowNode[] => {
    if (!keys) {
        return [];
    }
    let mapPointer = mappedSet;
    for (let i = 0, len = keys.length; i < len && mapPointer; ++i) {
        mapPointer = mapPointer[keys[i]];
    }
    return Array.isArray(mapPointer) ? mapPointer : [];
};

/** Sets aggData and fires cell-changed events if listeners are registered. */
export const setAggData = (rowNode: RowNode, newAggData: Record<string, any> | null, colModel: ColumnModel): void => {
    const oldAggData = rowNode.aggData;
    if (oldAggData === newAggData) {
        return;
    }
    rowNode.aggData = newAggData;
    if (rowNode.__localEventService) {
        fireAggDataChangedEvents(rowNode, oldAggData, newAggData, colModel);
    }
};

/** Sets aggData on a row node and all its siblings (footer + pinned). */
export const setAggDataWithSiblings = (
    rowNode: RowNode,
    newAggData: Record<string, any> | null,
    colModel: ColumnModel
): void => {
    setAggData(rowNode, newAggData, colModel);

    const pinnedSibling = rowNode.pinnedSibling;
    if (pinnedSibling) {
        setAggData(pinnedSibling, newAggData, colModel);
    }

    const sibling = rowNode.sibling;
    if (sibling) {
        setAggData(sibling, newAggData, colModel);

        const siblingPinnedSibling = sibling.pinnedSibling;
        if (siblingPinnedSibling) {
            setAggData(siblingPinnedSibling, newAggData, colModel);
        }
    }
};

/** Cold path: dispatches cell-changed events for changed/added/removed agg values. */
const fireAggDataChangedEvents = (
    rowNode: RowNode,
    oldAggData: Record<string, any> | null | undefined,
    newAggData: Record<string, any> | null,
    colModel: ColumnModel
): void => {
    if (!newAggData) {
        if (!oldAggData) {
            return;
        }
        const oldKeys = Object.keys(oldAggData);
        for (let i = 0, len = oldKeys.length; i < len; ++i) {
            const colId = oldKeys[i];
            const column = colModel.colsById[colId];
            if (column) {
                rowNode.dispatchCellChangedEvent(column, undefined, oldAggData[colId]);
            }
        }
        return;
    }

    const newKeys = Object.keys(newAggData);
    for (let i = 0, len = newKeys.length; i < len; ++i) {
        const colId = newKeys[i];
        const value = newAggData[colId];
        const oldValue = oldAggData ? oldAggData[colId] : undefined;
        if (value === oldValue) {
            continue;
        }
        const column = colModel.colsById[colId];
        if (column) {
            rowNode.dispatchCellChangedEvent(column, value, oldValue);
        }
    }

    // Detect removed columns (old key not present in new aggData).
    if (!oldAggData) {
        return;
    }
    const oldKeys = Object.keys(oldAggData);
    for (let i = 0, len = oldKeys.length; i < len; ++i) {
        const colId = oldKeys[i];
        if (colId in newAggData) {
            continue;
        }
        const column = colModel.colsById[colId];
        if (column) {
            rowNode.dispatchCellChangedEvent(column, undefined, oldAggData[colId]);
        }
    }
};
