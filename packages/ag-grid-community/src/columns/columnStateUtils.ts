import { _areEqual, _symmetricDiff } from 'ag-stack';

import { doesMovePassMarryChildren, placeLockedColumns } from '../columnMove/columnMoveUtils';
import type { BeanCollection } from '../context/context';
import type { AgColumn } from '../entities/agColumn';
import {
    _normalizeSortType,
    getSortDefFromInput,
    isSortDirectionValid,
    isSortTypeValid,
    normalizeSortDirection,
} from '../entities/agColumn';
import type { AgProvidedColumnGroup } from '../entities/agProvidedColumnGroup';
import type { ColAggFunc, IAggFunc } from '../entities/colDef';
import type { ShowValuesAsStateValue } from '../entities/colDef-showValuesAs';
import type { ColumnEventType, ColumnsResetEvent } from '../events';
import { _addGridCommonParams } from '../gridOptionsUtils';
import type { ColumnPinnedType } from '../interfaces/iColumn';
import type { SortDef, SortDirection, SortType } from '../interfaces/iSort';
import {
    _dispatchColumnChangedEvent,
    dispatchColumnPinnedEvent,
    dispatchColumnResizedEvent,
    dispatchColumnVisibleEvent,
} from './columnEventUtils';
import { GROUP_AUTO_COLUMN_ID, SELECTION_COLUMN_ID } from './columnUtils';

export interface ColumnStateParams {
    /** True if the column is hidden */
    hide?: boolean | null;
    /** Width of the column in pixels */
    width?: number | null;
    /** Column's flex if flex is set */
    flex?: number | null;
    /** The sort direction of the column */
    sort?: SortDirection;
    /** The type of sort applied to the column */
    sortType?: SortType | null;
    /** The order of the sort, if sorting by many columns */
    sortIndex?: number | null;
    /** The aggregation function applied */
    aggFunc?: string | IAggFunc | null;
    /**
     * The position of this column in the order of value columns when aggregating in pivot mode.
     * When aggregating by a single column, any number can be used. When aggregating by multiple
     * columns, this determines the order (e.g. `0` for first, `1` for second).
     */
    valueIndex?: number | null;
    /** True if pivot active */
    pivot?: boolean | null;
    /** The order of the pivot, if pivoting by many columns */
    pivotIndex?: number | null;
    /** The sort direction applied to this column's pivot result columns. Isolated from `sort`. */
    pivotSort?: SortDirection;
    /** Set if column is pinned */
    pinned?: ColumnPinnedType;
    /** True if row group active */
    rowGroup?: boolean | null;
    /** The order of the row group, if grouping by many columns */
    rowGroupIndex?: number | null;
    /** The active "Show Values As" selection: the mode name, or the object form (with `params` / `precision`)
     *  for modes that take input. `null` clears it. */
    showValuesAs?: ShowValuesAsStateValue;
}

export interface ColumnState extends ColumnStateParams {
    /** ID of the column */
    colId: string;
}

export interface ApplyColumnStateParams {
    /** The state from `getColumnState` */
    state?: ColumnState[];
    /** Whether column order should be applied */
    applyOrder?: boolean;
    /** State to apply to columns where state is missing for those columns */
    defaultState?: ColumnStateParams;
}

/** Pre-mutation snapshot; `dispatchColStateChanges` diffs against it to fire the right column events. */
interface ColumnStateChanges {
    /** Pre-mutation snapshot (`sortColumns` mutates `.columns` in place); `undefined` when empty/absent. */
    rowGroupColumns: AgColumn[] | undefined;
    pivotColumns: AgColumn[] | undefined;
    /** Per-column scalar snapshot keyed by colId; insertion order = capture order. */
    before: Map<string, ColumnStateBefore>;
    /** Pre-mutation `colsList` ref. Unchanged ref ⇒ order untouched (only ever reassigned) ⇒ skip the O(n) diff. */
    colsList: AgColumn[];
}

/** Minimal pre-apply snapshot: only the fields `dispatchColumnFieldChanges` diffs. */
interface ColumnStateBefore {
    width: number;
    hide: boolean;
    pinned: ColumnPinnedType;
    sort: SortDirection;
    sortType: SortType | undefined;
    sortIndex: number | null;
    aggFunc: ColAggFunc;
    pivotSort: SortDirection | undefined;
}

/** Updates hide/sort/sortIndex/pinned/flex. Per field: `null`/empty clears, only `undefined` is skipped. */
export const updateSomeColumnState = (
    beans: BeanCollection,
    column: AgColumn,
    hide: boolean | null | undefined,
    sort: SortDirection | SortDef | undefined,
    sortIndex: number | null | undefined,
    pinned: boolean | 'left' | 'right' | null | undefined,
    flex: number | null | undefined,
    source: ColumnEventType
): void => {
    const { sortSvc, pinnedCols, colFlex } = beans;
    if (hide !== undefined) {
        column.setVisible(!hide, source);
    }
    if (sortSvc) {
        sortSvc.updateColSort(column, sort, source);
        if (sortIndex !== undefined) {
            sortSvc.setColSortIndex(column, sortIndex);
        }
    }
    if (pinned !== undefined) {
        pinnedCols?.setColPinned(column, pinned);
    }
    if (flex !== undefined) {
        colFlex?.setColFlex(column, flex);
    }
};

/** Show/hide columns — skips the full `_applyColumnState` rebuild (visibility can't change colsList membership/order).
 *  `filterLockedColumns` (UI paths) skips `lockVisible` cols; the API path passes `false`.
 *  @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _setColsVisible(
    beans: BeanCollection,
    keys: (string | AgColumn)[],
    visible = false,
    source: ColumnEventType,
    filterLockedColumns = false
): void {
    const colModel = beans.colModel;
    const newVisible = visible === true;
    let changed: AgColumn[] | null = null;
    for (let i = 0, len = keys.length; i < len; ++i) {
        const key = keys[i];
        const col = typeof key === 'string' ? colModel.getCol(key) : key;
        if (col === undefined || (filterLockedColumns && col.colDef.lockVisible)) {
            continue;
        }
        if (col.visible !== newVisible) {
            col.setVisible(newVisible, source);
            changed ??= [];
            changed.push(col);
        }
    }
    if (changed) {
        const { colAnimation, eventSvc } = beans;
        colAnimation?.start();
        colModel.refreshColsDerivedState();
        beans.visibleCols.refresh(source, false);
        eventSvc.dispatchEvent({ type: 'columnEverythingChanged', source });
        dispatchColumnVisibleEvent(eventSvc, changed, source);
        colAnimation?.finish();
    }
}

/** Apply `ColumnState` across two passes, then — once for the whole operation — re-order, refresh the
 *  visible cols and dispatch the resulting events. Returns `true` if every provided state matched a column.
 *  @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _applyColumnState(
    beans: BeanCollection,
    params: ApplyColumnStateParams,
    source: ColumnEventType
): boolean {
    const { colModel, colAnimation, calculatedColsSvc } = beans;
    const state = params.state;
    if (state && !Array.isArray(state)) {
        beans.log.warn(32); // state is not an array
        return false;
    }

    // Re-add calc cols this state names that a prior reset parked — via the calc svc, so the rebuild
    // suppresses calc lifecycle/validation events (a state op, not a user calc-col change).
    if (state && calculatedColsSvc?.restoreDynamicColumnDefs(state)) {
        calculatedColsSvc.refreshDynamicColumns(source);
    }

    const providedCols = colModel.colDefList;
    const selectionCol = beans.selectionColSvc?.column;
    if (!providedCols.length && !selectionCol) {
        return false;
    }

    colAnimation?.start();

    // Capture once, before any mutation: the single dispatch below diffs the whole operation.
    const stateChanges = captureColumnStateChanges(beans);

    // Pass 1 — primary cols. Structural: `refreshCols` (re)creates auto/pivot-result/service cols.
    let unmatched = applyStateToCols(beans, state ?? null, providedCols, params, source, true);

    // Pass 2 — leftover states/defaults land on pass 1's pivot-result cols. Non-structural, no `refreshCols`.
    if (unmatched !== null || params.defaultState) {
        const pivotResultColsList = beans.pivotResultCols?.pivotCols;
        unmatched = applyStateToCols(beans, unmatched, pivotResultColsList, params, source, false);
    }

    // Finalize once: re-order, single visible-cols refresh, single everything-changed + dispatch.
    finalizeChange(beans, params, source, stateChanges);

    colAnimation?.finish();

    return unmatched === null; // true ⇒ every provided state matched a column
}

/** Apply `states` to `existingColumns` (by colId); the primary pass also runs the structural changes.
 *  Ordering/refresh/dispatch happen once in the caller. Returns the unmatched states (`null` if all matched). */
function applyStateToCols(
    beans: BeanCollection,
    states: ColumnState[] | null,
    existingColumns: AgColumn[] | null | undefined,
    params: ApplyColumnStateParams,
    source: ColumnEventType,
    primaryPass: boolean
): ColumnState[] | null {
    const colModel = beans.colModel;
    const defaultState = params.defaultState;
    let autoColStates: ColumnState[] | null = null;
    let selectionColStates: ColumnState[] | null = null;
    let unmatchedStates: ColumnState[] | null = null;
    const matched: Set<AgColumn> | null = defaultState ? new Set() : null;

    if (states) {
        for (let i = 0, len = states.length; i < len; ++i) {
            const state = states[i];
            const colId = state.colId;
            let column: AgColumn | null | undefined;

            if (colId != null) {
                // Service cols are (re)created by the refresh, so collect their states for `syncServiceColumnsWithState`
                // — not into `unmatchedStates` (that would wrongly force the pivot pass).
                if (colId.startsWith(GROUP_AUTO_COLUMN_ID)) {
                    autoColStates ??= [];
                    autoColStates.push(state);
                    continue;
                }
                if (colId.startsWith(SELECTION_COLUMN_ID)) {
                    selectionColStates ??= [];
                    selectionColStates.push(state);
                    continue;
                }
                if (primaryPass) {
                    column = colModel.getNonPivotColById(colId);
                } else {
                    // Pivot-result pass: only match generated pivot cols (those carrying pivotKeys).
                    const col = colModel.getCol(colId);
                    column = col?.colDef.pivotKeys == null ? null : col;
                }
            }

            if (!column) {
                unmatchedStates ??= [];
                unmatchedStates.push(state);
            } else {
                applyFieldState(beans, column, state, defaultState, source);
                matched?.add(column);
            }
        }
    }

    // Cols not named in `state` get `defaultState` (loop skipped when none supplied or no cols).
    if (matched !== null && existingColumns) {
        for (let i = 0, len = existingColumns.length; i < len; ++i) {
            const col = existingColumns[i];
            if (!matched.has(col)) {
                applyFieldState(beans, col, null, defaultState, source);
            }
        }
    }

    // Only the primary pass is structural (rowGroup/pivot membership, service cols, sort/refresh/sync).
    if (primaryPass) {
        applyStructuralStateChanges(beans, autoColStates, selectionColStates, defaultState, source);
    }

    return unmatchedStates;
}

/** Primary-pass tail: order row-group/pivot cols, rebuild cols, then sync the (re)created service cols. */
function applyStructuralStateChanges(
    beans: BeanCollection,
    autoColStates: ColumnState[] | null,
    selectionColStates: ColumnState[] | null,
    defaultState: ColumnStateParams | undefined,
    source: ColumnEventType
): void {
    const { autoColSvc, selectionColSvc, rowGroupColsSvc, pivotColsSvc, valueColsSvc } = beans;

    // Must run before refreshCols, which reads `service.columns` as-is to build auto cols + colsList
    // (value-col order drives pivot result column order).
    rowGroupColsSvc?.sortByPendingState();
    pivotColsSvc?.sortByPendingState();
    valueColsSvc?.sortByPendingState();

    beans.colModel.refreshCols(false, source);

    const selectionCol = selectionColSvc?.column;
    syncServiceColumnsWithState(beans, autoColStates, autoColSvc?.columns ?? [], defaultState, source);
    syncServiceColumnsWithState(beans, selectionColStates, selectionCol ? [selectionCol] : [], defaultState, source);
}

/** Sync service cols (auto/selection) post-refresh: apply each state to its matching `serviceCols` entry,
 *  and `defaultState` to the rest. `serviceCols` is read-only. */
function syncServiceColumnsWithState(
    beans: BeanCollection,
    colStates: ColumnState[] | null,
    serviceCols: readonly AgColumn[],
    defaultState: ColumnStateParams | undefined,
    source: ColumnEventType
): void {
    let matched: Set<AgColumn> | null = null;
    if (colStates !== null) {
        matched = new Set<AgColumn>();
        for (let s = 0, sLen = colStates.length; s < sLen; ++s) {
            const stateItem = colStates[s];
            const stateColId = stateItem.colId;
            for (let i = 0, len = serviceCols.length; i < len; ++i) {
                const sc = serviceCols[i];
                if (sc.colId === stateColId) {
                    matched.add(sc);
                    applyFieldState(beans, sc, stateItem, defaultState, source);
                    break;
                }
            }
        }
    }
    // Service cols with no matching state get `defaultState`; skipped entirely when none supplied.
    if (defaultState) {
        for (let i = 0, len = serviceCols.length; i < len; ++i) {
            const c = serviceCols[i];
            if (!matched?.has(c)) {
                applyFieldState(beans, c, null, defaultState, source);
            }
        }
    }
}

/** Apply one `ColumnState`/`defaultState` to a column: field state always; membership only for primary cols. */
function applyFieldState(
    beans: BeanCollection,
    column: AgColumn,
    stateItem: ColumnState | null,
    defaultState: ColumnStateParams | undefined,
    source: ColumnEventType
): void {
    // `orDefault` falls back only on `undefined` — an explicit `null` is kept, so state can clear a property.
    const flex = orDefault(stateItem?.flex, defaultState?.flex);
    const maybeSortDir = orDefault(stateItem?.sort, defaultState?.sort);
    const maybeSortType = orDefault(stateItem?.sortType, defaultState?.sortType);
    const isSortUpdate = isSortDirectionValid(maybeSortDir) || isSortTypeValid(maybeSortType);
    // Direction alone → default sort type; both must be provided to preserve a specific sort type.
    const newSortDef = isSortUpdate
        ? { type: _normalizeSortType(maybeSortType), direction: normalizeSortDirection(maybeSortDir) }
        : undefined;

    updateSomeColumnState(
        beans,
        column,
        orDefault(stateItem?.hide, defaultState?.hide),
        newSortDef,
        orDefault(stateItem?.sortIndex, defaultState?.sortIndex),
        orDefault(stateItem?.pinned, defaultState?.pinned),
        flex,
        source
    );

    // No flex → fall back to width.
    if (flex == null) {
        const width = orDefault(stateItem?.width, defaultState?.width);
        if (width != null) {
            // Apply width only if valid (>= min), else keep the old width.
            const minColWidth = column.colDef.minWidth ?? beans.environment.getDefaultColumnMinWidth();
            if (minColWidth != null && width >= minColWidth) {
                column.setActualWidth(width, source);
            }
        }
    }

    // Membership is for primary user cols only — never auto-group (primary, but generated) or non-primary cols.
    if (column.colKind === 'auto-group' || !column.primary) {
        return;
    }

    beans.valueColsSvc?.syncColState(column, stateItem, defaultState, source);
    beans.rowGroupColsSvc?.syncColState(column, stateItem, defaultState, source);
    beans.pivotColsSvc?.syncColState(column, stateItem, defaultState, source);
    beans.showValuesAsSvc?.syncColState(column, stateItem, defaultState, source);

    // Pivot sort is isolated from `sort` - applied directly, never routed through the sort service.
    const maybePivotSort = orDefault(stateItem?.pivotSort, defaultState?.pivotSort);
    if (maybePivotSort !== undefined) {
        column.pivotSort = normalizeSortDirection(maybePivotSort);
    }
}

/** Reset all columns to the state declared in their colDefs (`initial*`/explicit), re-apply the colDef
 *  order, and fire `columnsReset`.
 *  @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _resetColumnState(beans: BeanCollection, source: ColumnEventType): void {
    const { colModel, autoColSvc, selectionColSvc, eventSvc, gos, colAnimation, calculatedColsSvc } = beans;

    // Park API/dialog-added calc cols and revert edits/removals of declared ones, so the reset below runs
    // against the original set — via the calc svc, so the rebuild emits no calc lifecycle/validation events.
    if (calculatedColsSvc?.resetDynamicColumnDefs(true)) {
        calculatedColsSvc.refreshDynamicColumns(source);
    }

    if (!colModel.colDefList.length) {
        return;
    }

    // Reset state per colDef, tracking max explicit rowGroup/pivot index so boolean-only cols get fallback
    // indexes after them. `colDefList` is `colDefTree`'s flat leaf set (same count), sizing the array exactly.
    const selectionCol = selectionColSvc?.column ?? null;
    const initialAutoCols = autoColSvc?.columns;
    const initialAutoLen = initialAutoCols?.length ?? 0;
    const columnStates: ColumnState[] = new Array(initialAutoLen + (selectionCol ? 1 : 0) + colModel.colDefList.length);
    let stateIdx = 0;
    let maxRowGroupIndex = -1;
    let maxPivotIndex = -1;
    const addColState = (col: AgColumn) => {
        const stateItem = getColumnStateFromColDef(beans, col);
        const { rowGroupIndex, pivotIndex } = stateItem;
        if (rowGroupIndex != null && rowGroupIndex > maxRowGroupIndex) {
            maxRowGroupIndex = rowGroupIndex;
        }
        if (pivotIndex != null && pivotIndex > maxPivotIndex) {
            maxPivotIndex = pivotIndex;
        }
        columnStates[stateIdx++] = stateItem;
    };

    if (initialAutoCols) {
        for (let i = 0; i < initialAutoLen; ++i) {
            addColState(initialAutoCols[i]);
        }
    }
    if (selectionCol) {
        addColState(selectionCol);
    }
    // Leaves in colDef declaration order (stable; colDefList can be permuted by a tool-panel reorder).
    forEachColTreeLeaf(colModel.colDefTree, addColState);

    // Second pass: assign fallback indexes to boolean-only group/pivot cols (after the max above).
    for (let i = 0, len = columnStates.length; i < len; ++i) {
        const stateItem = columnStates[i];
        if (stateItem.rowGroup && stateItem.rowGroupIndex == null) {
            stateItem.rowGroupIndex = ++maxRowGroupIndex;
        }
        if (stateItem.pivot && stateItem.pivotIndex == null) {
            stateItem.pivotIndex = ++maxPivotIndex;
        }
    }

    colAnimation?.start();
    // Single capture before any mutation — the lone finalize dispatch diffs the whole reset.
    const stateChanges = captureColumnStateChanges(beans);

    // Apply field state; the structural pass (re)creates auto/service cols. No dispatch yet.
    applyStateToCols(beans, columnStates, colModel.colDefList, {}, source, true);

    // Force `pivotSort` back to its colDef default: `applyFieldState` skips an `undefined` target (so an
    // omitted `pivotSort` in `applyColumnState` leaves it alone), but a reset must clear a user-applied sort.
    const primaryCols = colModel.colDefList;
    for (let i = 0, len = primaryCols.length; i < len; ++i) {
        const col = primaryCols[i];
        col.pivotSort = resolveInitialPivotSort(col.colDef);
    }

    // Order from the now-current service cols: auto cols may have been recreated above (their colIds change
    // with the row-group set), so use the post-apply instances, not the pre-apply ids in `columnStates`.
    const autoCols = autoColSvc?.columns;
    const autoColsLen = autoCols?.length ?? 0;
    const orderState = new Array<ColumnState>((selectionCol ? 1 : 0) + autoColsLen + colModel.colDefList.length);
    let orderIdx = 0;
    if (selectionCol) {
        orderState[orderIdx++] = { colId: selectionCol.colId };
    }
    for (let i = 0; i < autoColsLen; ++i) {
        orderState[orderIdx++] = { colId: autoCols![i].colId };
    }
    forEachColTreeLeaf(colModel.colDefTree, (col) => {
        orderState[orderIdx++] = { colId: col.colId };
    });

    // Re-order + refresh + dispatch once, over the final (ordered) structure.
    finalizeChange(beans, { state: orderState, applyOrder: true }, source, stateChanges);
    colAnimation?.finish();

    eventSvc.dispatchEvent(_addGridCommonParams<ColumnsResetEvent>(gos, { type: 'columnsReset', source }));
}

/** Shared tail of a state change: apply order, refresh visible cols once, dispatch the diffed events.
 *  Separate so {@link _resetColumnState} can build its order from the post-apply (recreated) service cols. */
function finalizeChange(
    beans: BeanCollection,
    params: ApplyColumnStateParams,
    source: ColumnEventType,
    changes: ColumnStateChanges
): void {
    orderLiveColsLikeState(beans, params);
    beans.visibleCols.refresh(source, false);
    beans.eventSvc.dispatchEvent({ type: 'columnEverythingChanged', source });
    dispatchColStateChanges(beans, source, changes);
}

/** Reorder `colsList`: state-ordered cols first, rest after (auto-group at front), locked cols at the edges.
 *  Runs post-rebuild, so `col.inColsList` is the live-membership source (`false` for parked pivot primaries). */
function orderLiveColsLikeState(beans: BeanCollection, params: ApplyColumnStateParams): void {
    const colModel = beans.colModel;
    const state = params.state;
    if (!params.applyOrder || !state || !colModel.ready) {
        return;
    }

    const colsById = colModel.colsById;
    const currentList = colModel.colsList;
    const consumed = new Set<AgColumn>();
    const newOrder: AgColumn[] = [];

    // Pass 1: state-ordered cols that are currently displayed (deduped via `consumed`).
    for (let i = 0, len = state.length; i < len; ++i) {
        const colId = state[i].colId;
        if (colId == null) {
            continue;
        }
        const col = colsById[colId];
        if (col != null && col.inColsList && !consumed.has(col)) {
            newOrder.push(col);
            consumed.add(col);
        }
    }

    // Pass 2: remaining displayed cols in `colsList` order. Auto-group cols collect separately to be prepended.
    let autoGroupMissed: AgColumn[] | null = null;
    for (let i = 0, len = currentList.length; i < len; ++i) {
        const col = currentList[i];
        if (consumed.has(col)) {
            continue;
        }
        if (col.colKind === 'auto-group') {
            autoGroupMissed ??= [];
            autoGroupMissed.push(col);
        } else {
            newOrder.push(col);
        }
    }

    const ordered = autoGroupMissed ?? newOrder;
    if (autoGroupMissed !== null) {
        for (let i = 0, len = newOrder.length; i < len; ++i) {
            ordered.push(newOrder[i]);
        }
    }

    // The reorder above ignored lockPosition, so re-place locked cols here.
    const finalOrder = placeLockedColumns(ordered, beans.gos);
    if (_areEqual(finalOrder, currentList)) {
        return;
    }
    if (colModel.hasMarryChildren && !doesMovePassMarryChildren(finalOrder, colModel.colsTree)) {
        beans.log.warn(39);
        return;
    }
    colModel.colsList = finalOrder;
    colModel.markColsListIndexDirty();
}

/** Snapshot column state before a mutation. Pair with {@link dispatchColStateChanges} after the
 *  mutation to fire the resulting events. Used by both apply-column-state and apply-new-column-defs. */
export function captureColumnStateChanges(beans: BeanCollection): ColumnStateChanges {
    const { rowGroupColsSvc, pivotColsSvc, colModel } = beans;
    const rowGroupCols = rowGroupColsSvc?.columns;
    const pivotCols = pivotColsSvc?.columns;
    const cols = colModel.getColsInStateOrder();
    const before = new Map<string, ColumnStateBefore>();
    for (let i = 0, len = cols.length; i < len; ++i) {
        const column = cols[i];
        const sortDef = column.sortDef;
        const direction = sortDef.direction;
        before.set(column.colId, {
            width: column.actualWidth,
            hide: !column.visible,
            pinned: column.pinned,
            sort: direction,
            sortType: direction ? sortDef.type : undefined,
            sortIndex: column.sortIndex ?? null,
            aggFunc: column.aggregationActive ? column.aggFunc : null,
            pivotSort: column.pivotSort,
        });
    }
    return {
        rowGroupColumns: rowGroupCols?.length ? rowGroupCols.slice() : undefined,
        pivotColumns: pivotCols?.length ? pivotCols.slice() : undefined,
        before,
        colsList: colModel.colsList,
    };
}

/** Diff current column state against a {@link captureColumnStateChanges} snapshot and dispatch the changed
 *  column events (value/resize/pin/visible/sort/rowGroup/pivot/moved). */
export function dispatchColStateChanges(
    beans: BeanCollection,
    source: ColumnEventType,
    changes: ColumnStateChanges
): void {
    const rowGroupCols = beans.rowGroupColsSvc?.columns;
    const pivotCols = beans.pivotColsSvc?.columns;
    dispatchColumnListChanged(beans, source, 'columnRowGroupChanged', changes.rowGroupColumns, rowGroupCols);
    dispatchColumnListChanged(beans, source, 'columnPivotChanged', changes.pivotColumns, pivotCols);
    dispatchColumnFieldChanges(beans, source, changes.before);
    dispatchColumnMoved(beans, source, changes);
}

/** Fire `columnRowGroupChanged`/`columnPivotChanged` when the col list changed in membership OR order. Payload
 *  is the symmetric diff (added/removed); a pure reorder fires with empty `columns`. No event when identical. */
function dispatchColumnListChanged(
    beans: BeanCollection,
    source: ColumnEventType,
    eventType: 'columnPivotChanged' | 'columnRowGroupChanged',
    before: AgColumn[] | undefined,
    after: AgColumn[] | undefined
): void {
    if (!areSameColIds(before, after)) {
        _dispatchColumnChangedEvent(beans.eventSvc, eventType, _symmetricDiff(before, after), source);
    }
}

/** Single pass over all cols, bucketing per-field changes against the before-snapshot, then firing one
 *  event per non-empty bucket (value/resize/pin/visible/sort). */
function dispatchColumnFieldChanges(
    beans: BeanCollection,
    source: ColumnEventType,
    before: Map<string, ColumnStateBefore>
): void {
    const { eventSvc, sortSvc } = beans;
    const allCols = beans.colModel.getAllCols();
    let changedValues: AgColumn[] | null = null;
    let changedResizes: AgColumn[] | null = null;
    let changedPinned: AgColumn[] | null = null;
    let changedVisible: AgColumn[] | null = null;
    let changedSort: AgColumn[] | null = null;
    let changedPivotSort: AgColumn[] | null = null;
    for (let i = 0, len = allCols.length; i < len; ++i) {
        const col = allCols[i];
        const cs = before.get(col.colId);
        if (!cs) {
            continue;
        }
        if (cs.width != col.actualWidth) {
            changedResizes ??= [];
            changedResizes.push(col);
        }
        if (cs.pinned != col.pinned) {
            changedPinned ??= [];
            changedPinned.push(col);
        }
        if (cs.hide == col.visible) {
            changedVisible ??= [];
            changedVisible.push(col);
        }
        if (isAggChanged(col, cs)) {
            changedValues ??= [];
            changedValues.push(col);
        }
        if (sortSvc && isSortChanged(col, cs)) {
            changedSort ??= [];
            changedSort.push(col);
        }
        if (cs.pivotSort !== col.pivotSort) {
            changedPivotSort ??= [];
            changedPivotSort.push(col);
        }
    }
    if (changedValues) {
        _dispatchColumnChangedEvent(eventSvc, 'columnValueChanged', changedValues, source);
    }
    if (changedResizes) {
        dispatchColumnResizedEvent(eventSvc, changedResizes, true, source);
    }
    if (changedPinned) {
        dispatchColumnPinnedEvent(eventSvc, changedPinned, source);
    }
    if (changedVisible) {
        dispatchColumnVisibleEvent(eventSvc, changedVisible, source);
    }
    if (changedSort) {
        sortSvc?.dispatchSortChangedEvents(source, changedSort);
    }
    // Pivot sort is isolated from sort - a pivotSort change fires columnPivotChanged to rebuild pivot columns.
    if (changedPivotSort) {
        _dispatchColumnChangedEvent(eventSvc, 'columnPivotChanged', changedPivotSort, source);
    }
}

/** Fire `columnMoved` for cols whose position changed vs others in both snapshots: compares before-order
 *  (Map insertion order) against current order position-by-position; a slot mismatch means that col moved. */
function dispatchColumnMoved(beans: BeanCollection, source: ColumnEventType, changes: ColumnStateChanges): void {
    const colModel = beans.colModel;
    const after = colModel.colsList;
    if (after === changes.colsList) {
        return; // Same array ref => order untouched (colsList never mutated in place)
    }
    const before = changes.before;
    const colsById = colModel.colsById;

    // Intersection in before-order (Map insertion order = capture order).
    let beforeCommon: AgColumn[] | undefined;
    for (const colId of before.keys()) {
        const col = colsById[colId];
        if (col?.inColsList) {
            beforeCommon ??= [];
            beforeCommon.push(col);
        }
    }
    if (!beforeCommon) {
        return;
    }

    let commonIdx = 0;
    let movedColumns: AgColumn[] | undefined;
    const commonLen = beforeCommon.length;
    for (let i = 0, len = after.length; i < len && commonIdx < commonLen; ++i) {
        const col = after[i];
        if (before.has(col.colId)) {
            // Same intersection slot in before-order vs after-order — a ref mismatch means it moved.
            const beforeCol = beforeCommon[commonIdx++];
            if (beforeCol !== col) {
                movedColumns ??= [];
                movedColumns.push(beforeCol);
            }
        }
    }

    if (movedColumns) {
        beans.eventSvc.dispatchEvent({
            type: 'columnMoved',
            columns: movedColumns,
            column: movedColumns.length === 1 ? movedColumns[0] : null,
            finished: true,
            source,
        });
    }
}

export const _getColumnState = (beans: BeanCollection): ColumnState[] => {
    const colModel = beans.colModel;
    if (!colModel.isAlive()) {
        return [];
    }
    const cols = colModel.getColsInStateOrder();
    const res = new Array<ColumnState>(cols.length);
    for (let i = 0, len = cols.length; i < len; ++i) {
        const column = cols[i];
        const rowGroupActive = column.rowGroupActive;
        const pivotActive = column.pivotActive;
        const sortDef = column.sortDef;
        const direction = sortDef.direction;
        res[i] = {
            colId: column.colId,
            width: column.actualWidth,
            hide: !column.visible,
            pinned: column.pinned,
            sort: direction,
            sortType: direction ? (sortDef.type ?? null) : null,
            sortIndex: column.sortIndex ?? null,
            aggFunc: column.aggregationActive ? column.aggFunc : null,
            valueIndex: column.aggregationActive ? column.aggregationActiveIndex : null,
            rowGroup: rowGroupActive,
            rowGroupIndex: rowGroupActive ? column.rowGroupActiveIndex : null,
            pivot: pivotActive,
            pivotIndex: pivotActive ? column.pivotActiveIndex : null,
            pivotSort: column.pivotSort === undefined ? 'asc' : column.pivotSort,
            flex: column.flex ?? null,
            showValuesAs: beans.showValuesAsSvc?.toColState(column) ?? null,
        };
    }
    return res;
};

// Unset (`undefined`) is left as-is so it resolves to ascending; an explicit `null` ("no sort") is preserved.
function resolveInitialPivotSort(colDef: AgColumn['colDef']): SortDirection | undefined {
    const pivotSortLike = colDef.pivotSort !== undefined ? colDef.pivotSort : colDef.initialPivotSort;
    return pivotSortLike === undefined ? undefined : normalizeSortDirection(pivotSortLike);
}

export function getColumnStateFromColDef(beans: BeanCollection, column: AgColumn): ColumnState {
    const colDef = column.colDef;
    const sortDef = getSortDefFromInput(colDef.sort ?? colDef.initialSort ?? null);
    const rowGroupIndex: number | null = colDef.rowGroupIndex ?? colDef.initialRowGroupIndex ?? null;
    let rowGroup: boolean | null = colDef.rowGroup ?? colDef.initialRowGroup ?? null;
    if (rowGroupIndex == null && rowGroup === false) {
        rowGroup = null; // normalise: no index + not grouped → null
    }
    const pivotIndex: number | null = colDef.pivotIndex ?? colDef.initialPivotIndex ?? null;
    let pivot: boolean | null = colDef.pivot ?? colDef.initialPivot ?? null;
    if (pivotIndex == null && pivot === false) {
        pivot = null; // normalise: no index + not pivoted → null
    }
    return {
        colId: column.colId,
        sort: sortDef.direction,
        sortType: sortDef.type,
        sortIndex: colDef.sortIndex ?? colDef.initialSortIndex ?? null,
        hide: colDef.hide ?? colDef.initialHide ?? null,
        pinned: colDef.pinned ?? colDef.initialPinned ?? null,
        width: colDef.width ?? colDef.initialWidth ?? null,
        flex: colDef.flex ?? colDef.initialFlex ?? null,
        rowGroup,
        rowGroupIndex,
        pivot,
        pivotIndex,
        pivotSort: resolveInitialPivotSort(colDef),
        aggFunc: colDef.aggFunc ?? colDef.initialAggFunc ?? null,
        showValuesAs: beans.showValuesAsSvc?.colDefSelection(colDef) ?? null,
    };
}

const orDefault = <T>(stateValue: T | undefined, defaultValue: T | undefined): T | undefined =>
    stateValue !== undefined ? stateValue : defaultValue;

/** Invoke `cb` for each leaf column of a built col tree, in declaration order. */
const forEachColTreeLeaf = (nodes: (AgColumn | AgProvidedColumnGroup)[], cb: (col: AgColumn) => void): void => {
    for (let i = 0, len = nodes.length; i < len; ++i) {
        const node = nodes[i];
        const children = (node as Partial<AgProvidedColumnGroup>).children;
        if (children) {
            forEachColTreeLeaf(children, cb);
        } else {
            cb(node as AgColumn);
        }
    }
};

const isAggChanged = (col: AgColumn, before: ColumnStateBefore): boolean => {
    const oldAggFunc = before.aggFunc;
    const wasActive = oldAggFunc != null;
    return wasActive !== col.aggregationActive || (wasActive && oldAggFunc != col.aggFunc);
};

const isSortChanged = (col: AgColumn, before: ColumnStateBefore): boolean => {
    if (before.sortIndex != col.sortIndex) {
        return true;
    }
    const sortDef = col.getSortDef();
    const beforeType = before.sortType ?? 'default';
    return sortDef ? sortDef.direction !== before.sort || sortDef.type !== beforeType : before.sort !== null;
};

const areSameColIds = (a: AgColumn[] | undefined, b: AgColumn[] | undefined): boolean => {
    if (a === b) {
        return true;
    }
    const len = a?.length ?? 0;
    if (len !== (b?.length ?? 0)) {
        return false;
    }
    for (let i = 0; i < len; ++i) {
        const colA = a![i];
        const colB = b![i];
        // Same instance ⇒ same colId; only string-compare when they differ.
        if (colA !== colB && colA.colId !== colB.colId) {
            return false;
        }
    }
    return true;
};
