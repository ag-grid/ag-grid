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

/** Updates `aggData` and fires per-column cell-changed events. Returns `true` if the row has listeners and at least one aggregated value changed. */
export const setAggData = (
    rowNode: RowNode,
    newAggData: Record<string, any> | null,
    colModel: ColumnModel
): boolean => {
    const oldAggData = rowNode.aggData;
    if (oldAggData === newAggData) {
        return false;
    }
    rowNode.aggData = newAggData;
    if (!rowNode.__localEventService) {
        return false;
    }
    return fireAggDataChangedEvents(rowNode, oldAggData, newAggData, colModel);
};

/** Calls `setAggData` on the row and each sibling (footer / pinned / footer-pinned). Returns `true` if any row needs a refresh. */
export const setAggDataWithSiblings = (
    rowNode: RowNode,
    newAggData: Record<string, any> | null,
    colModel: ColumnModel
): boolean => {
    let changed = setAggData(rowNode, newAggData, colModel);

    const pinnedSibling = rowNode.pinnedSibling;
    if (pinnedSibling && setAggData(pinnedSibling, newAggData, colModel)) {
        changed = true;
    }

    const sibling = rowNode.sibling;
    if (sibling) {
        if (setAggData(sibling, newAggData, colModel)) {
            changed = true;
        }

        const siblingPinnedSibling = sibling.pinnedSibling;
        if (siblingPinnedSibling && setAggData(siblingPinnedSibling, newAggData, colModel)) {
            changed = true;
        }
    }
    return changed;
};

/**
 * Cold path: dispatches cell-changed events for changed/added/removed agg values.
 * Returns `true` if any value actually changed (i.e. at least one event was dispatched).
 */
const fireAggDataChangedEvents = (
    rowNode: RowNode,
    oldAggData: Record<string, any> | null | undefined,
    newAggData: Record<string, any> | null,
    colModel: ColumnModel
): boolean => {
    let changed = false;
    if (!newAggData) {
        if (!oldAggData) {
            return false;
        }
        const oldKeys = Object.keys(oldAggData);
        for (let i = 0, len = oldKeys.length; i < len; ++i) {
            const colId = oldKeys[i];
            const column = colModel.getColById(colId);
            if (column) {
                rowNode.dispatchCellChangedEvent(column, undefined, oldAggData[colId]);
                changed = true;
            }
        }
        return changed;
    }

    const newKeys = Object.keys(newAggData);
    for (let i = 0, len = newKeys.length; i < len; ++i) {
        const colId = newKeys[i];
        const value = newAggData[colId];
        const oldValue = oldAggData ? oldAggData[colId] : undefined;
        if (value === oldValue) {
            continue;
        }
        const column = colModel.getColById(colId);
        if (column) {
            rowNode.dispatchCellChangedEvent(column, value, oldValue);
            changed = true;
        }
    }

    // Detect removed columns (old key not present in new aggData).
    if (!oldAggData) {
        return changed;
    }
    const oldKeys = Object.keys(oldAggData);
    for (let i = 0, len = oldKeys.length; i < len; ++i) {
        const colId = oldKeys[i];
        if (colId in newAggData) {
            continue;
        }
        const column = colModel.getColById(colId);
        if (column) {
            rowNode.dispatchCellChangedEvent(column, undefined, oldAggData[colId]);
            changed = true;
        }
    }
    return changed;
};
