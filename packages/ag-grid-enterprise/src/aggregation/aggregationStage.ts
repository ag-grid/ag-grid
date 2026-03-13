import type {
    AgColumn,
    ChangedCellsPath,
    ChangedPath,
    ClientSideRowModelStage,
    ColDef,
    ColumnModel,
    GridOptions,
    IAggFunc,
    IAggFuncService,
    IPivotResultColsService,
    NamedBean,
    RowNode,
    ValueService,
    _IRowNodeAggregationStage,
} from 'ag-grid-community';
import {
    BeanStub,
    _forEachChangedGroupDepthFirst,
    _getGrandTotalRow,
    _getGroupAggFiltering,
    _isClientSideRowModel,
    _warn,
} from 'ag-grid-community';

import { setAggData, setAggDataWithSiblings } from './aggDataUtils';

/** Pre-resolved value column metadata for the per-group aggregation loop. */
interface ResolvedValueColumn {
    column: AgColumn;
    colId: string;
    colDef: ColDef;
    aggFunc: IAggFunc | null;
    /** Bitmask slot for ChangedCellsPath column tracking. -1 when inactive. */
    colSlot: number;
}

/** Pre-resolved pivot result column for the pivot aggregation loop. */
interface ResolvedPivotColumn {
    column: AgColumn;
    colId: string;
    aggFunc: IAggFunc | null;
    /** The secondary (pivot result) column produced by this aggregation. */
    pivotResultCol: AgColumn;
    /** Pivot key path for leaf-group child lookup via childrenMapped. */
    pivotKeys: string[] | null | undefined;
    /** Column IDs whose results are aggregated into this total. Defined only for total columns. */
    totalColIds: string[] | undefined;
}

/** Resolved pivot columns: regular columns come first, totals appended after. */
type ResolvedPivotData = ResolvedPivotColumn[];

export class AggregationStage extends BeanStub implements NamedBean, _IRowNodeAggregationStage {
    beanName = 'aggStage' as const;

    public readonly step: ClientSideRowModelStage = 'aggregate';
    public readonly refreshProps: (keyof GridOptions<any>)[] = [
        'getGroupRowAgg',
        'alwaysAggregateAtRootLevel',
        'suppressAggFilteredOnly',
        'grandTotalRow',
    ];

    /** Tracks whether the previous execute() call produced aggData, so we only clear once on transition. */
    private hadAgg = false;

    /** Cached once — row model type never changes after init. */
    private csrm = false;

    public postConstruct(): void {
        this.csrm = _isClientSideRowModel(this.gos);
    }

    // Stale aggData on demoted nodes is cleared by the group stage (setRowNodeGroup), not here.
    public execute(changedPath: ChangedPath | undefined): void {
        const { gos, beans } = this;
        const userAggFunc = gos.getCallback('getGroupRowAgg');
        const valueColumns = beans.valueColsSvc?.columns;

        if (!valueColumns?.length && !userAggFunc) {
            if (this.hadAgg && !changedPath) {
                // Full refresh with no value columns: clear stale aggData from all groups.
                // Skip during transaction updates (changedPath defined) — the config-change
                // full refresh will handle it.
                this.hadAgg = false;
                const colModel = beans.colModel;
                _forEachChangedGroupDepthFirst(beans.rowModel.rootNode, undefined, (rowNode) => {
                    setAggDataWithSiblings(rowNode, null, colModel);
                });
            }
            return;
        }

        this.hadAgg = true;

        const colModel = beans.colModel;
        const aggFuncSvc = beans.aggFuncSvc;
        const aggregateRoot =
            gos.get('alwaysAggregateAtRootLevel') || !!_getGrandTotalRow(gos) || colModel.isPivotMode();
        const filteredOnly = !_getGroupAggFiltering(gos) && !gos.get('suppressAggFilteredOnly');

        // Hoist service lookups once — they are accessed per-group inside the traversal callback.
        const valueSvc = beans.valueSvc;
        const api = beans.gridApi;
        const context = beans.gridOptions.context;

        // Pre-resolve value column metadata so the per-group hot loop avoids
        // repeated property access on AgColumn (colId, colDef, getAggFunc).
        // The ?? [] fallback is for TS narrowing only — valueColumns is non-empty when userAggFunc is falsy.
        const resolvedValueColumns = valueColumns ?? [];
        const colCount = resolvedValueColumns.length;

        const narrowedCellsPath = changedPath?.kind === 'cells' ? changedPath : undefined;
        let cellsChangedPath: ChangedCellsPath | undefined;
        const valueCols = new Array<ResolvedValueColumn>(colCount);
        for (let i = 0; i < colCount; ++i) {
            const col = resolvedValueColumns[i];
            const colSlot = narrowedCellsPath ? narrowedCellsPath.getSlot(col.colId) : -1;
            if (colSlot >= 0) {
                cellsChangedPath = narrowedCellsPath;
            }
            valueCols[i] = {
                column: col,
                colId: col.colId,
                colDef: col.colDef,
                aggFunc: resolveAggFunc(col.getAggFunc(), aggFuncSvc!, col),
                colSlot,
            };
        }

        // Resolve pivot columns — null when pivot is inactive or has no result columns.
        const pivotData = resolvePivotColumns(colModel, beans.pivotResultCols, aggFuncSvc!);

        // Pre-allocate reusable values2d outer array — reused across groups to avoid
        // per-group allocation. Inner arrays are still fresh per group (user-facing via aggFunc params).
        const values2d = colCount > 0 ? new Array<any[] | null>(colCount) : null;

        _forEachChangedGroupDepthFirst(beans.rowModel.rootNode, changedPath, (rowNode) => {
            if (rowNode.level === -1 && !aggregateRoot) {
                setAggData(rowNode, null, colModel);
                return;
            }

            let aggResult: Record<string, any> | null;
            if (userAggFunc) {
                aggResult = userAggFunc({ nodes: rowNode.childrenAfterFilter! });
            } else if (!values2d) {
                aggResult = null;
            } else if (pivotData) {
                aggResult = aggregateValuesAndPivot(rowNode, pivotData, valueSvc, api, context);
            } else {
                aggResult = aggregateValuesOnly(
                    rowNode,
                    valueCols,
                    colCount,
                    values2d,
                    cellsChangedPath,
                    filteredOnly,
                    valueSvc,
                    api,
                    context
                );
            }

            setAggDataWithSiblings(rowNode, aggResult, colModel);
        });
    }

    public getAggregatedChildren(rowNode: RowNode | null | undefined, col: AgColumn | null | undefined): RowNode[] {
        const { gos } = this;
        if (!rowNode?.group || !this.csrm) {
            return [];
        }

        // For pinned siblings, delegate to the source row which has the actual children.
        if (rowNode.rowPinned) {
            rowNode = rowNode.pinnedSibling;
            if (!rowNode) {
                return [];
            }
        }

        const colDef = col?.colDef;
        const pivotKeys = colDef?.pivotKeys;
        if (pivotKeys) {
            if (rowNode.leafGroup && pivotKeys.length && !colDef.pivotTotalColumnIds) {
                return getNodesFromMappedSet(rowNode.childrenMapped, pivotKeys);
            }
            return rowNode.childrenAfterFilter ?? rowNode.childrenAfterGroup ?? [];
        }

        if (_getGroupAggFiltering(gos) || gos.get('suppressAggFilteredOnly')) {
            return rowNode.childrenAfterGroup ?? [];
        }

        return rowNode.childrenAfterFilter ?? rowNode.childrenAfterGroup ?? [];
    }
}

// ── Module-level aggregation functions ────────────────────────────────────

/** Aggregates value columns for a single group node (non-pivot path). */
const aggregateValuesOnly = (
    rowNode: RowNode,
    valueCols: ResolvedValueColumn[],
    colCount: number,
    values2d: (any[] | null)[],
    cellsChangedPath: ChangedCellsPath | undefined,
    filteredOnly: boolean,
    valueSvc: ValueService,
    api: any,
    context: any
): Record<string, any> => {
    const aggregatedChildren = (filteredOnly ? rowNode.childrenAfterFilter : rowNode.childrenAfterGroup) ?? [];
    const childCount = aggregatedChildren.length;
    const data = rowNode.data;
    const result: Record<string, any> = Object.create(null);

    // When column tracking is active, only re-aggregate changed columns; copy the rest.
    // rowSlot >= 0 means this group is tracked by cellsChangedPath; -1 means re-aggregate all.
    const rowSlot = cellsChangedPath ? cellsChangedPath.getSlot(rowNode) : -1;
    const oldAggData = rowSlot >= 0 ? rowNode.aggData : undefined;

    // Pre-allocate per-column value arrays only for changed columns; copy unchanged ones.
    // The outer values2d array is reused across groups (passed in from execute).
    let changedCount = 0;
    for (let j = 0; j < colCount; ++j) {
        const vc = valueCols[j];
        if (rowSlot >= 0 && !cellsChangedPath!.hasCellBySlot(rowSlot, vc.colSlot)) {
            values2d[j] = null;
            if (oldAggData) {
                result[vc.colId] = oldAggData[vc.colId];
            }
        } else {
            values2d[j] = new Array<any>(childCount);
            ++changedCount;
        }
    }

    if (changedCount === 0) {
        return result;
    }

    // Collect values row-major: children outer, columns inner (single pass over children).
    // For group children, read aggData[colId] directly — depth-first traversal guarantees
    // child aggData is already computed, and getValue() would resolve to the same value.
    // Falls back to getValue() when aggData[colId] is undefined (custom aggFunc edge case).
    for (let c = 0; c < childCount; ++c) {
        const child = aggregatedChildren[c];
        const childAggData = child.aggData;
        if (childAggData) {
            for (let j = 0; j < colCount; ++j) {
                const colValues = values2d[j];
                if (colValues !== null) {
                    const vc = valueCols[j];
                    const v = childAggData[vc.colId];
                    colValues[c] = v !== undefined ? v : valueSvc.getValue(vc.column, child, 'data');
                }
            }
        } else {
            for (let j = 0; j < colCount; ++j) {
                const colValues = values2d[j];
                if (colValues !== null) {
                    colValues[c] = valueSvc.getValue(valueCols[j].column, child, 'data');
                }
            }
        }
    }

    for (let j = 0; j < colCount; ++j) {
        const colValues = values2d[j];
        if (colValues === null) {
            continue;
        }
        const rc = valueCols[j];
        const aggFunc = rc.aggFunc;
        result[rc.colId] = aggFunc
            ? aggFunc({
                  values: colValues,
                  column: rc.column,
                  colDef: rc.colDef,
                  rowNode,
                  data,
                  aggregatedChildren,
                  api,
                  context,
              })
            : null;
    }

    return result;
};

/** Aggregates pivot result columns for a single group node. */
const aggregateValuesAndPivot = (
    rowNode: RowNode,
    pivotData: ResolvedPivotData,
    valueSvc: ValueService,
    api: any,
    context: any
): Record<string, any> => {
    const pivotColCount = pivotData.length;
    const isLeafGroup = rowNode.leafGroup;
    const data = rowNode.data;
    const childrenMapped = rowNode.childrenMapped;
    const childrenAfterFilter = rowNode.childrenAfterFilter ?? [];
    const result: Record<string, any> = Object.create(null);

    // Memoize getNodesFromMappedSet — consecutive pivot columns that share the same
    // pivotKeys reference (identity check) reuse the previously resolved children array.
    let prevPivotKeys: string[] | null | undefined;
    let prevPivotChildren: RowNode[] | undefined;

    // Single loop over sorted pivot columns: regular cols first, then totals.
    // Regular columns populate `result`; total columns read from it.
    for (let i = 0; i < pivotColCount; ++i) {
        const rc = pivotData[i];
        const column = rc.column;
        const colId = rc.colId;
        const totalColIds = rc.totalColIds;
        let values: any[];
        let aggregatedChildren: RowNode[];

        if (totalColIds != null) {
            // Total column — aggregate from already-computed regular column results.
            const tLen = totalColIds.length;
            values = new Array<any>(tLen);
            for (let t = 0; t < tLen; ++t) {
                values[t] = result[totalColIds[t]];
            }
            aggregatedChildren = childrenAfterFilter;
        } else if (isLeafGroup) {
            // Regular column on leaf group — resolve children via pivot keys.
            const pivotKeys = rc.pivotKeys;
            if (!prevPivotChildren || pivotKeys !== prevPivotKeys) {
                prevPivotKeys = pivotKeys;
                prevPivotChildren = getNodesFromMappedSet(childrenMapped, pivotKeys);
            }
            aggregatedChildren = prevPivotChildren;
            const nodeCount = aggregatedChildren.length;
            values = new Array<any>(nodeCount);
            for (let n = 0; n < nodeCount; ++n) {
                values[n] = valueSvc.getValue(column, aggregatedChildren[n], 'data');
            }
        } else {
            // Regular column on non-leaf group — read aggData from children directly.
            // Same optimization as the non-pivot path: bypasses getValue() for group children.
            // Falls back to getValue() if aggData[colId] is undefined (consistency with non-pivot).
            aggregatedChildren = childrenAfterFilter;
            const nodeCount = aggregatedChildren.length;
            values = new Array<any>(nodeCount);
            for (let n = 0; n < nodeCount; ++n) {
                const childNode = aggregatedChildren[n];
                const childAggData = childNode.aggData;
                const v = childAggData ? childAggData[colId] : undefined;
                values[n] = v !== undefined ? v : valueSvc.getValue(column, childNode, 'data');
            }
        }

        const aggFunc = rc.aggFunc;
        result[colId] = aggFunc
            ? aggFunc({
                  values,
                  column,
                  colDef: column.colDef,
                  pivotResultColumn: rc.pivotResultCol,
                  rowNode,
                  data,
                  aggregatedChildren,
                  api,
                  context,
              })
            : null;
    }

    return result;
};

// ── Module-level helpers ───────────────────────────────────────────────────

/** Resolves aggFunc from a string name or returns the function directly. Returns null with a warning for invalid names. */
const resolveAggFunc = (
    aggFuncOrString: string | IAggFunc | null | undefined,
    aggFuncSvc: IAggFuncService,
    column: AgColumn
): IAggFunc | null => {
    if (typeof aggFuncOrString === 'function') {
        return aggFuncOrString;
    }
    if (aggFuncOrString == null) {
        return null;
    }
    const aggFunc = aggFuncSvc.getAggFunc(aggFuncOrString);
    if (typeof aggFunc !== 'function') {
        _warn(109, { inputValue: aggFuncOrString.toString(), allSuggestions: aggFuncSvc.getFuncNames(column) });
        return null;
    }
    return aggFunc;
};

/** Resolves pivot result columns. Returns null when pivot is inactive or has no result columns.
 * Uses getAggregationOrderedList() which is cached by the pivot service — avoids
 * re-partitioning regular vs total columns on every aggregation refresh. */
const resolvePivotColumns = (
    colModel: ColumnModel,
    pivotResultCols: IPivotResultColsService | undefined,
    aggFuncSvc: IAggFuncService
): ResolvedPivotData | null => {
    if (!colModel.isPivotActive()) {
        return null;
    }
    // getAggregationOrderedList() returns columns pre-sorted: regular first, totals after.
    // The list is cached and only recomputed when pivot result columns change.
    const orderedList = pivotResultCols?.getAggregationOrderedList();
    if (!orderedList || orderedList.length === 0) {
        return null;
    }
    const len = orderedList.length;
    const resolved = new Array<ResolvedPivotColumn>(len);
    let count = 0;
    for (let i = 0; i < len; ++i) {
        const pivotResultCol = orderedList[i];
        const resultColDef = pivotResultCol.colDef;
        const valueCol = resultColDef.pivotValueColumn as AgColumn | null | undefined;
        if (!valueCol) {
            continue;
        }
        resolved[count++] = {
            column: valueCol,
            colId: resultColDef.colId!,
            aggFunc: resolveAggFunc(valueCol.getAggFunc(), aggFuncSvc, valueCol),
            pivotResultCol: pivotResultCol,
            pivotKeys: resultColDef.pivotKeys,
            totalColIds: resultColDef.pivotTotalColumnIds,
        };
    }
    if (count === 0) {
        return null;
    }
    resolved.length = count;
    return resolved;
};

/** Traverses childrenMapped using pivot keys to get the matching RowNode array. */
const getNodesFromMappedSet = (mappedSet: any, keys: string[] | null | undefined): RowNode[] => {
    if (!keys) {
        return [];
    }
    let mapPointer = mappedSet;
    for (let i = 0, len = keys.length; i < len && mapPointer; ++i) {
        mapPointer = mapPointer[keys[i]];
    }
    return Array.isArray(mapPointer) ? mapPointer : [];
};
