import type { ColumnState } from '../../columns/columnStateUtils';
import type { AggregationColumnState, ColumnGroupState, ColumnSizeState, GridState } from '../../interfaces/gridState';
import type { SortModelItem } from '../../interfaces/iSortModelItem';

/**
 * Converts state retrieved from `api.getColumnState()` to grid state.
 *
 * @param enablePivotMode Whether pivot mode should be enabled or not. Default `false`.
 * @returns A partial `GridState` object containing only the properties relevant to columns
 */
export function convertColumnState(
    columnState: ColumnState[],
    enablePivotMode: boolean = false
): Pick<
    GridState,
    | 'sort'
    | 'rowGroup'
    | 'aggregation'
    | 'pivot'
    | 'columnPinning'
    | 'columnVisibility'
    | 'columnSizing'
    | 'columnOrder'
> {
    const sortColumns: SortModelItem[] = [];
    const groupColIds: string[] = [];
    const aggregationColumns: AggregationColumnState[] = [];
    const pivotColIds: string[] = [];
    const leftColIds: string[] = [];
    const rightColIds: string[] = [];
    const hiddenColIds: string[] = [];
    const columnSizes: ColumnSizeState[] = [];
    const columns: string[] = [];

    let defaultSortIndex = 0;
    for (let i = 0; i < columnState.length; i++) {
        const {
            colId,
            sort,
            sortIndex,
            rowGroup,
            rowGroupIndex,
            aggFunc,
            pivot,
            pivotIndex,
            pinned,
            hide,
            width,
            flex,
        } = columnState[i];
        columns.push(colId);
        if (sort) {
            sortColumns[sortIndex ?? defaultSortIndex++] = { colId, sort };
        }
        if (rowGroup) {
            groupColIds[rowGroupIndex ?? 0] = colId;
        }
        if (typeof aggFunc === 'string') {
            aggregationColumns.push({ colId, aggFunc });
        }
        if (pivot) {
            pivotColIds[pivotIndex ?? 0] = colId;
        }
        if (pinned) {
            (pinned === 'right' ? rightColIds : leftColIds).push(colId);
        }
        if (hide) {
            hiddenColIds.push(colId);
        }
        if (flex != null || width) {
            columnSizes.push({ colId, flex: flex ?? undefined, width });
        }
    }

    return {
        sort: sortColumns.length ? { sortModel: sortColumns } : undefined,
        rowGroup: groupColIds.length ? { groupColIds } : undefined,
        aggregation: aggregationColumns.length ? { aggregationModel: aggregationColumns } : undefined,
        pivot: pivotColIds.length || enablePivotMode ? { pivotMode: enablePivotMode, pivotColIds } : undefined,
        columnPinning: leftColIds.length || rightColIds.length ? { leftColIds, rightColIds } : undefined,
        columnVisibility: hiddenColIds.length ? { hiddenColIds } : undefined,
        columnSizing: columnSizes.length ? { columnSizingModel: columnSizes } : undefined,
        columnOrder: columns.length ? { orderedColIds: columns } : undefined,
    };
}

export function _convertColumnGroupState(
    columnGroupState: { groupId: string; open: boolean }[]
): ColumnGroupState | undefined {
    const openColumnGroups: string[] = [];
    columnGroupState.forEach(({ groupId, open }) => {
        if (open) {
            openColumnGroups.push(groupId);
        }
    });
    return openColumnGroups.length ? { openColumnGroupIds: openColumnGroups } : undefined;
}

/**
 * Converts state retrieved from `api.getColumnGroupState()` to grid state.
 *
 * @returns A partial `GridState` object containing only the properties relevant to column groups
 */
export function convertColumnGroupState(
    columnGroupState: { groupId: string; open: boolean }[]
): Pick<GridState, 'columnGroup'> {
    return { columnGroup: _convertColumnGroupState(columnGroupState) };
}
