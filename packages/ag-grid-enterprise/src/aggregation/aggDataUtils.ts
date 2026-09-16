import type { AgColumn, ColumnModel, RowNode } from 'ag-grid-community';

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

/** An aggData key and the column it came from. Structurally a {@link ResolvedValueColumn}. */
export interface AggDataEventCol {
    readonly colId: string;
    readonly column: AgColumn;
}

/**
 * The columns an aggData object is keyed by, resolved once per aggregation, so the per-row event loop
 * costs no `Object.keys` allocation. Only the non-pivot path can supply it.
 */
export interface AggDataEventCols {
    readonly cols: readonly AggDataEventCol[];
    /** Whether the previous aggData can hold a key `cols` no longer names, so removals need detecting. */
    readonly checkRemoved: boolean;
}

/** Sets aggData and fires cell-changed events if listeners are registered. */
export const setAggData = (
    rowNode: RowNode,
    newAggData: Record<string, any> | null,
    colModel: ColumnModel,
    eventCols?: AggDataEventCols
): void => {
    const oldAggData = rowNode.aggData;
    if (oldAggData === newAggData) {
        return;
    }
    rowNode.aggData = newAggData;
    if (rowNode.__localEventService) {
        fireAggDataChangedEvents(rowNode, oldAggData, newAggData, colModel, eventCols);
    }
};

/** Sets aggData on a row node and all its siblings (footer + pinned). */
export const setAggDataWithSiblings = (
    rowNode: RowNode,
    newAggData: Record<string, any> | null,
    colModel: ColumnModel,
    eventCols?: AggDataEventCols
): void => {
    setAggData(rowNode, newAggData, colModel, eventCols);

    const pinnedSibling = rowNode.pinnedSibling;
    if (pinnedSibling) {
        setAggData(pinnedSibling, newAggData, colModel, eventCols);
    }

    const sibling = rowNode.sibling;
    if (sibling) {
        setAggData(sibling, newAggData, colModel, eventCols);

        const siblingPinnedSibling = sibling.pinnedSibling;
        if (siblingPinnedSibling) {
            setAggData(siblingPinnedSibling, newAggData, colModel, eventCols);
        }
    }
};

/** Cold path: dispatches cell-changed events for changed/added/removed agg values. */
const fireAggDataChangedEvents = (
    rowNode: RowNode,
    oldAggData: Record<string, any> | null | undefined,
    newAggData: Record<string, any> | null,
    colModel: ColumnModel,
    eventCols: AggDataEventCols | undefined
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

    if (eventCols) {
        const cols = eventCols.cols;
        for (let i = 0, len = cols.length; i < len; ++i) {
            const { colId, column } = cols[i];
            const value = newAggData[colId];
            const oldValue = oldAggData ? oldAggData[colId] : undefined;
            if (value !== oldValue) {
                rowNode.dispatchCellChangedEvent(column, value, oldValue);
            }
        }
        if (!oldAggData || !eventCols.checkRemoved) {
            return;
        }
        fireRemovedAggDataEvents(rowNode, oldAggData, newAggData, colModel);
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

    if (!oldAggData) {
        return;
    }
    fireRemovedAggDataEvents(rowNode, oldAggData, newAggData, colModel);
};

/** Colder still: an old key the new aggData no longer names, which only a column change can produce. */
const fireRemovedAggDataEvents = (
    rowNode: RowNode,
    oldAggData: Record<string, any>,
    newAggData: Record<string, any>,
    colModel: ColumnModel
): void => {
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
