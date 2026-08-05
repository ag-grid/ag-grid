import type { ColumnState } from '../../columns/columnStateUtils';
import type {
    AggregationColumnState,
    ColumnGroupState,
    ColumnSizeState,
    GridState,
    PivotSortModelItem,
    ShowValuesAsColumnState,
} from '../../interfaces/gridState';
import type { SortModelItem } from '../../interfaces/iSortModelItem';
import { _cloneDeep } from '../../utils/mergeDeep';

/**
 * Converts state retrieved from `api.getColumnState()` to grid state.
 *
 * @param columnState
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
    | 'columnHeaderName'
    | 'showValuesAs'
> {
    const sortColumns: SortModelItem[] = [];
    const groupColIds: string[] = [];
    const aggregationColumns: IndexedAggregationColumnState[] = [];
    const showValuesAsColumns: ShowValuesAsColumnState[] = [];
    const pivotColIds: string[] = [];
    const pivotSortModel: PivotSortModelItem[] = [];
    const leftColIds: string[] = [];
    const rightColIds: string[] = [];
    const hiddenColIds: string[] = [];
    const columnSizes: ColumnSizeState[] = [];
    const columnHeaderNames: { colId: string; headerName: string }[] = [];
    const columns: string[] = [];

    let defaultSortIndex = 0;
    for (let i = 0; i < columnState.length; i++) {
        const {
            colId,
            sort,
            sortType,
            sortIndex,
            rowGroup,
            rowGroupIndex,
            aggFunc,
            valueIndex,
            showValuesAs,
            pivot,
            pivotIndex,
            pivotSort,
            pinned,
            hide,
            width,
            flex,
            headerName,
        } = columnState[i];
        columns.push(colId);
        if (headerName != null) {
            columnHeaderNames.push({ colId, headerName });
        }
        if (sort) {
            sortColumns[sortIndex ?? defaultSortIndex++] = { colId, sort, type: sortType ?? undefined };
        }
        if (rowGroup) {
            groupColIds[rowGroupIndex ?? 0] = colId;
        }
        if (typeof aggFunc === 'string') {
            aggregationColumns.push({ colId, aggFunc, valueIndex });
        }
        if (showValuesAs != null) {
            showValuesAsColumns.push({ colId, showValuesAs: _cloneDeep(showValuesAs) });
        }
        if (pivot) {
            pivotColIds[pivotIndex ?? 0] = colId;
            if (pivotSort !== undefined) {
                pivotSortModel.push({ colId, sort: pivotSort });
            }
        }
        if (pinned) {
            (pinned === 'right' ? rightColIds : leftColIds).push(colId);
        }
        if (hide) {
            hiddenColIds.push(colId);
        }
        if (flex != null || width) {
            columnSizes.push({ colId, flex: flex ?? undefined, width: width === null ? undefined : width });
        }
    }

    return {
        sort: sortColumns.length ? { sortModel: _removeEmptyValues(sortColumns) } : undefined,
        rowGroup: groupColIds.length ? { groupColIds: _removeEmptyValues(groupColIds) } : undefined,
        aggregation: aggregationColumns.length
            ? { aggregationModel: orderAggregationModel(aggregationColumns) }
            : undefined,
        showValuesAs: showValuesAsColumns.length ? { showValuesAsModel: showValuesAsColumns } : undefined,
        pivot:
            pivotColIds.length || enablePivotMode
                ? {
                      pivotMode: enablePivotMode,
                      pivotColIds: _removeEmptyValues(pivotColIds),
                      pivotSortModel: pivotSortModel.length ? pivotSortModel : undefined,
                  }
                : undefined,
        columnPinning: leftColIds.length || rightColIds.length ? { leftColIds, rightColIds } : undefined,
        columnVisibility: hiddenColIds.length ? { hiddenColIds } : undefined,
        columnSizing: columnSizes.length ? { columnSizingModel: columnSizes } : undefined,
        columnOrder: columns.length ? { orderedColIds: columns } : undefined,
        columnHeaderName: columnHeaderNames.length ? { columnHeaderNames } : undefined,
    };
}

// Fields of `ColumnState` that `convertColumnState` projects into `GridState` (and that
// `StateService.applyColumnGridState` reverses on `setState`).
type ProjectedColumnStateKeys =
    | 'colId'
    | 'sort'
    | 'sortType'
    | 'sortIndex'
    | 'rowGroup'
    | 'rowGroupIndex'
    | 'aggFunc'
    | 'valueIndex'
    | 'showValuesAs'
    | 'pivot'
    | 'pivotIndex'
    | 'pivotSort'
    | 'pinned'
    | 'hide'
    | 'width'
    | 'flex'
    | 'headerName';

// Fields intentionally NOT round-tripped through get/setState. Add a key here only with a
// justification comment for why it is excluded.
type ExcludedColumnStateKeys = never;

// Completeness guard: a `ColumnState` field that is neither projected nor excluded makes this
// resolve to the offending key name, so `const` assignment fails `build:types` and names it —
// forcing an explicit decision rather than a silent drop.
type ColumnStateKeysAccounted = [
    Exclude<keyof ColumnState, ProjectedColumnStateKeys | ExcludedColumnStateKeys>,
] extends [never]
    ? true
    : Exclude<keyof ColumnState, ProjectedColumnStateKeys | ExcludedColumnStateKeys>;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _columnStateKeysAccounted: ColumnStateKeysAccounted = true;

// Removes null or undefined values from an array to catch the case where sortIndex, rowGroupIndex or pivotIndex
// have invalid values resulting in sparse arrays which will break state persistence/restoration.
// e.g. [ 'colId1', undefined, 'colId3' ] => [ 'colId1', 'colId3' ]
function _removeEmptyValues<T>(array: T[]): T[] {
    return array.filter((a) => a != undefined);
}

type IndexedAggregationColumnState = AggregationColumnState & { valueIndex: number | null | undefined };

// Order the aggregation model by `valueIndex` without dropping columns: a stable sort keeps the relative
// order of entries that share (or lack) an index, so duplicate/invalid indexes can't overwrite each other.
function orderAggregationModel(columns: IndexedAggregationColumnState[]): AggregationColumnState[] {
    return columns
        .sort((a, b) => (a.valueIndex ?? Infinity) - (b.valueIndex ?? Infinity))
        .map((column) => ({ colId: column.colId, aggFunc: column.aggFunc }));
}

export function _convertColumnGroupState(
    columnGroupState: { groupId: string; open: boolean; headerName?: string | null }[]
): ColumnGroupState | undefined {
    const openColumnGroups: string[] = [];
    const headerNames: { groupId: string; headerName: string }[] = [];
    for (const { groupId, open, headerName } of columnGroupState) {
        if (open) {
            openColumnGroups.push(groupId);
        }
        if (headerName != null) {
            headerNames.push({ groupId, headerName });
        }
    }
    if (!openColumnGroups.length && !headerNames.length) {
        return undefined;
    }
    return {
        openColumnGroupIds: openColumnGroups,
        headerNames: headerNames.length ? headerNames : undefined,
    };
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
