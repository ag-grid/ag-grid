import { _areEqual } from '../agStack/utils/array';
import { placeLockedColumns } from '../columnMove/columnMoveUtils';
import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { AgColumn } from '../entities/agColumn';
import type { AgProvidedColumnGroup } from '../entities/agProvidedColumnGroup';
import type { ColDef, ColGroupDef, ColKey } from '../entities/colDef';
import type { GridOptions } from '../entities/gridOptions';
import type { ColumnEventType } from '../events';
import type { GridOptionsService, PropertyChangedEvent, PropertyValueChangedEvent } from '../gridOptionsService';
import { _shouldMaintainColumnOrder } from '../gridOptionsUtils';
import { _createColumnTree } from './columnFactoryUtils';
import type { ColumnState } from './columnStateUtils';
import { _applyColumnState, _compareColumnStatesAndDispatchEvents } from './columnStateUtils';
import {
    _convertColumnEventSourceType,
    _destroyColumnTree,
    isColumnGroupAutoCol,
    isColumnSelectionCol,
    isRowNumberCol,
} from './columnUtils';

export type Maybe<T> = T | null | undefined;

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export class ColumnModel extends BeanStub implements NamedBean {
    beanName = 'colModel' as const;

    public pivotMode = false;
    public colSpanActive = false;
    public ready = false;
    /** Suppresses row model refreshes during batch column state dispatching. */
    public changeEventsDispatching = false;
    public showingPivotResult = false;

    // === Two parallel col representations ===
    //   colDefList / colDefTree  — the PRIMARY cols: user-defined leaves (+ hierarchy virtuals),
    //                              in user-defined tree shape. Stable across pivot mode toggling.
    //   colsList   / colsTree    — the DISPLAY cols: what's actually rendered in the header.
    //                              In normal mode: [serviceCols, ...colDefList].
    //                              In pivot mode:  [serviceCols, ...pivotResultCols].

    /** Display leaves (header order). */
    public colsList: AgColumn[] = [];
    /** Display header tree (service col wrappers + source tree). */
    public colsTree: (AgColumn | AgProvidedColumnGroup)[] = [];
    public colsTreeDepth = 0;

    /** Primary leaves: user-defined cols + hierarchy virtuals. */
    public colDefList: AgColumn[] = [];
    /** Primary tree shape. */
    public colDefTree: (AgColumn | AgProvidedColumnGroup)[] = [];
    public colDefTreeDepth = 0;

    /** Unified colId → AgColumn map. Single source of truth for `getCol`. Pivot result colIds are
     *  namespaced (`pivot_…`, `pivotGroup_…`) so all col sources share one map without collision. */
    public colsById: { [id: string]: AgColumn } = {};

    /** Fallback lookup for ColDef-shaped keys whose `colId` doesn't hit `colsById`. Maps both
     *  `colDef` (merged) and `userProvidedColDef` (original) by reference, plus `colDef.field`
     *  as a string when `field !== colId`. Field-key writes are first-write-wins: when two cols
     *  share a `field`, the first encountered (in `colsList` order, primary cols before pivot
     *  cols) owns the key — see test 'string field lookup with two cols sharing field: first
     *  registered wins'. Built lazily, invalidated whenever `colsById` changes. */
    private cachedColsByDef: Map<ColKey, AgColumn> | null = null;

    private cachedAllCols: AgColumn[] | null = null;

    /** Snapshot of prior `colsList` colIds (one per pivot mode) so service-col replacements
     *  resolve transparently through `colsById` — no stale AgColumn refs. */
    private lastOrder: string[] | null = null;
    private lastPivotOrder: string[] | null = null;

    private colDefs?: (ColDef | ColGroupDef)[];

    public postConstruct(): void {
        this.pivotMode = this.gos.get('pivotMode');

        this.addManagedPropertyListeners(
            [
                'groupDisplayType',
                'treeData',
                'treeDataDisplayType',
                'groupHideOpenParents',
                'groupHideColumnsUntilExpanded',
                'rowNumbers',
                'hidePaddedHeaderRows',
            ],
            (event) => this.refreshAll(_convertColumnEventSourceType(event.source))
        );
        this.addManagedPropertyListeners(
            ['defaultColDef', 'defaultColGroupDef', 'columnTypes', 'suppressFieldDotNotation'],
            this.recreateColumnDefs.bind(this)
        );
        this.addManagedPropertyListener('pivotMode', (event) =>
            this.setPivotMode(this.gos.get('pivotMode'), _convertColumnEventSourceType(event.source))
        );
    }

    // called from SyncService, when grid has finished initialising
    private createColsFromColDefs(source: ColumnEventType): void {
        const beans = this.beans;
        const {
            valueCache,
            colAutosize,
            rowGroupColsSvc,
            pivotColsSvc,
            valueColsSvc,
            visibleCols,
            eventSvc,
            groupHierarchyColSvc,
        } = beans;

        // only need to dispatch before/after events if updating columns, never if setting columns for first time
        const dispatchEventsFunc = this.colDefs ? _compareColumnStatesAndDispatchEvents(beans, source) : undefined;
        // always invalidate cache on changing columns, as the column id's for the new columns
        // could overlap with the old id's, so the cache would return old values for new columns.
        valueCache?.expire();

        const oldCols = this.colDefList;
        const oldTree = this.colDefTree;
        const newTree = _createColumnTree(beans, this.colDefs, true, oldTree, source);

        this.colDefTree = newTree.columnTree;
        this.colDefTreeDepth = newTree.treeDepth;
        this.colDefList = newTree.columns;

        // Apply hierarchy cols before destroying the old tree: reused hierarchy beans (and their
        // wrappers) must stay alive across the tree diff. The service owns the cols, the wrappers,
        // and the splice — returns the composed list/tree (with hierarchy at head), or the input
        // references when nothing changed.
        if (groupHierarchyColSvc) {
            const merged = groupHierarchyColSvc.applyToColDefTree(
                this.colDefList,
                this.colDefTree,
                this.colDefTreeDepth
            );
            this.colDefList = merged.list;
            this.colDefTree = merged.tree;
        }

        _destroyColumnTree(oldTree, this.colDefTree);

        // Seed colsById for `extractCols` — refreshCols rebuilds it shortly after.
        const colsById: { [id: string]: AgColumn } = {};
        const list = this.colDefList;
        for (let i = 0, len = list.length; i < len; ++i) {
            colsById[list[i].colId] = list[i];
        }
        this.colsById = colsById;
        this.cachedColsByDef = null;

        rowGroupColsSvc?.extractCols(source, oldCols);
        pivotColsSvc?.extractCols(source, oldCols);
        valueColsSvc?.extractCols(source, oldCols);

        this.ready = true;

        this.changeEventsDispatching = true;
        try {
            this.refreshCols(true, source);
        } finally {
            this.changeEventsDispatching = false;
        }

        visibleCols.refresh(source);

        // this event is not used by AG Grid, but left here for backwards compatibility,
        // in case applications use it
        eventSvc.dispatchEvent({ type: 'columnEverythingChanged', source });

        if (dispatchEventsFunc) {
            this.changeEventsDispatching = true;
            try {
                dispatchEventsFunc();
            } finally {
                this.changeEventsDispatching = false;
            }
        }

        eventSvc.dispatchEvent({ type: 'newColumnsLoaded', source });

        if (source === 'gridInitializing') {
            colAutosize?.applyAutosizeStrategy();
        }
    }

    // called from: buildAutoGroupColumns (events 'groupDisplayType', 'treeData', 'treeDataDisplayType', 'groupHideOpenParents')
    // createColsFromColDefs (recreateColumnDefs, setColumnsDefs),
    // setPivotMode, applyColumnState,
    // functionColsService.setPrimaryColList, functionColsService.updatePrimaryColList,
    // pivotResultCols.setPivotResultCols
    public refreshCols(newColDefs: boolean, source: ColumnEventType): void {
        if (!this.ready) {
            return;
        }
        const beans = this.beans;
        const prevColTree = this.colsTree;
        // Invalidate at entry: an event listener fired during service refresh below could
        // otherwise read a stale cache.
        this.cachedAllCols = null;

        const oldColsList = this.colsList;
        const oldLen = oldColsList.length;
        if (oldLen > 0) {
            const oldIds = new Array<string>(oldLen);
            for (let i = 0; i < oldLen; ++i) {
                oldIds[i] = oldColsList[i].colId;
            }
            if (this.showingPivotResult) {
                this.lastPivotOrder = oldIds;
            } else {
                this.lastOrder = oldIds;
            }
        }

        const pivotResultCols = beans.pivotResultCols;
        const pivotCols = pivotResultCols?.pivotCols ?? null;
        const usePivot = this.pivotMode && pivotCols != null;
        this.showingPivotResult = usePivot;
        const sourceList = usePivot ? pivotCols : this.colDefList;
        const sourceTree = usePivot ? pivotResultCols!.pivotTree : this.colDefTree;
        const sourceTreeDepth = usePivot ? pivotResultCols!.pivotTreeDepth : this.colDefTreeDepth;
        this.colsTreeDepth = sourceTreeDepth;

        // Service refresh runs in dependency order (auto → selection → rowNumbers): selection
        // visibility depends on whether auto cols exist. Formula init must precede — rowNumbers
        // auto-activates when formulas are present.
        beans.formula?.setFormulasActive(sourceList);
        beans.autoColSvc?.refreshCols(source);
        beans.selectionColSvc?.refreshCols();
        beans.rowNumbersSvc?.refreshCols();

        // Emit in display order: rowNumbers → selection → autoGroup → user/pivot body cols.
        const colDefList = this.colDefList;
        const colsList: AgColumn[] = [];
        const colsTree: (AgColumn | AgProvidedColumnGroup)[] = [];
        const colsById: { [id: string]: AgColumn } = {};
        const rowNumberCol = beans.rowNumbersSvc?.column;
        if (rowNumberCol) {
            colsList.push(rowNumberCol);
        }
        const selectionCol = beans.selectionColSvc?.column;
        if (selectionCol) {
            colsList.push(selectionCol);
        }
        const autoCols = beans.autoColSvc?.columns;
        if (autoCols) {
            for (let i = 0, len = autoCols.length; i < len; ++i) {
                colsList.push(autoCols[i]);
            }
        }
        // `colGroupSvc` is optional (community grids without the column-group module won't have
        // it). When present we wrap each service col into a depth-balanced tree and evict any
        // cache entries not touched this pass; otherwise we just populate `colsById`.
        const serviceWrapperCache = beans.colGroupSvc?.serviceWrapperCache;
        if (serviceWrapperCache) {
            const inUse = new Set<AgColumn>();
            for (let i = 0, len = colsList.length; i < len; ++i) {
                const col = colsList[i];
                colsById[col.colId] = col;
                colsTree.push(serviceWrapperCache.wrapOrReuse(col, sourceTreeDepth, inUse));
            }
            serviceWrapperCache.evictStale(inUse);
        } else {
            for (let i = 0, len = colsList.length; i < len; ++i) {
                colsById[colsList[i].colId] = colsList[i];
            }
        }

        // In pivot mode, sourceList = pivotCols; colDefList cols still need colsById entries for
        // lookups. Non-pivot covers colDefList via the next loop (sourceList === colDefList).
        if (usePivot) {
            for (let i = 0, len = colDefList.length; i < len; ++i) {
                colsById[colDefList[i].colId] = colDefList[i];
            }
        }

        for (let i = 0, len = sourceList.length; i < len; ++i) {
            const col = sourceList[i];
            colsList.push(col);
            colsById[col.colId] = col;
        }
        for (let i = 0, len = sourceTree.length; i < len; ++i) {
            colsTree.push(sourceTree[i]);
        }
        const restoreOrder = !newColDefs || _shouldMaintainColumnOrder(this.gos, usePivot);
        const lastOrder = this.showingPivotResult ? this.lastPivotOrder : this.lastOrder;
        const prevOrder = restoreOrder ? lastOrder : null;
        this.colsList = restoreOrLockColumns(colsList, colsById, prevOrder, this.gos);
        this.colsTree = colsTree;
        this.colsById = colsById;
        this.cachedColsByDef = null;

        beans.showRowGroupCols?.refresh();
        beans.quickFilter?.refreshCols();
        this.computeColSpanAndAutoHeight();

        beans.visibleCols.clear();
        beans.colViewport.clear();
        this.cachedAllCols = null;

        if (!_areEqual(prevColTree, this.colsTree)) {
            beans.eventSvc.dispatchEvent({ type: 'gridColumnsChanged' });
        }
    }

    /** Single pass: set `colSpanActive` and `rowAutoHeight.active` from `colsList`. */
    private computeColSpanAndAutoHeight(): void {
        const colsList = this.colsList;
        const rowAutoHeight = this.beans.rowAutoHeight;
        const trackAutoHeight = rowAutoHeight != null;
        let colSpan = false;
        let autoHeight = false;
        for (let i = 0, len = colsList.length; i < len; ++i) {
            const col = colsList[i];
            const colDef = col.colDef;
            if (!colSpan && colDef.colSpan != null) {
                colSpan = true;
            }
            if (trackAutoHeight && !autoHeight && colDef.autoHeight && col.visible) {
                autoHeight = true;
            }
            if (colSpan && (autoHeight || !trackAutoHeight)) {
                break;
            }
        }
        this.colSpanActive = colSpan;
        if (rowAutoHeight && rowAutoHeight.active !== autoHeight) {
            rowAutoHeight.active = autoHeight;
        }
    }

    // on events 'groupDisplayType', 'treeData', 'treeDataDisplayType', 'groupHideOpenParents'
    public refreshAll(source: ColumnEventType) {
        if (!this.ready) {
            return;
        }
        this.refreshCols(false, source);
        this.beans.visibleCols.refresh(source);
    }

    public setColsVisible(keys: (string | AgColumn)[], visible = false, source: ColumnEventType): void {
        const hide = !visible;
        const state: ColumnState[] = new Array(keys.length);
        for (let i = 0, len = keys.length; i < len; ++i) {
            const key = keys[i];
            state[i] = { colId: typeof key === 'string' ? key : key.colId, hide };
        }
        _applyColumnState(this.beans, { state }, source);
    }

    /** Reorder `colDefList` only — `newList` MUST be a permutation of the existing col instances.
     *  `@internal`; caller is responsible for the invariant. A full refresh should follow to
     *  propagate to display cols. `colsById` is unchanged; `getAllCols` is order-agnostic. */
    public replaceColDefList(newList: AgColumn[]): void {
        if (this.ready) {
            this.colDefList = newList;
        }
    }

    public getColumnDefs(sorted?: boolean): (ColDef | ColGroupDef)[] | undefined {
        if (!this.ready) {
            return undefined;
        }
        return this.beans.colDefFactory?.getColumnDefs(
            this.colDefList,
            this.showingPivotResult,
            this.lastOrder,
            this.colsList,
            sorted
        );
    }

    private setPivotMode(pivotMode: boolean, source: ColumnEventType): void {
        if (pivotMode === this.pivotMode) {
            return;
        }

        this.pivotMode = pivotMode;

        if (!this.ready) {
            return;
        }

        // we need to update grid columns to cover the scenario where user has groupDisplayType = 'custom', as
        // this means we don't use auto group column UNLESS we are in pivot mode (it's mandatory in pivot mode),
        // so need to updateCols() to check it autoGroupCol needs to be added / removed
        this.refreshCols(false, source);
        const { visibleCols, eventSvc } = this.beans;
        visibleCols.refresh(source);

        eventSvc.dispatchEvent({
            type: 'columnPivotModeChanged',
        });
    }

    // + clientSideRowModel
    public isPivotActive(): boolean {
        const pivotColumns = this.beans.pivotColsSvc?.columns;
        return this.pivotMode && !!pivotColumns?.length;
    }

    // called when dataTypes change
    public recreateColumnDefs(e: PropertyChangedEvent | PropertyValueChangedEvent<keyof GridOptions>): void {
        if (!this.ready) {
            return;
        }

        // if we aren't going to force, update the auto cols in place
        this.beans.autoColSvc?.updateColumns(e);
        const source = _convertColumnEventSourceType(e.source);
        this.createColsFromColDefs(source);
    }

    public setColumnDefs(columnDefs: (ColDef | ColGroupDef)[], source: ColumnEventType) {
        this.colDefs = columnDefs;
        this.createColsFromColDefs(source);
    }

    public override destroy(): void {
        _destroyColumnTree(this.colDefTree);
        // Pivot trees live in PivotResultColsService — it destroys its own trees on tear-down.
        this.beans.pivotResultCols?.destroyTrees();
        // Service col wrappers (auto/sel/rowNum) live only in `colsTree`, not in `colDefTree`, so
        // they aren't reached by the tree-destroy above. `colGroupSvc` owns the cache and
        // destroys them. Hierarchy wrappers live inside `colDefTree` and were already destroyed
        // by `_destroyColumnTree` above — the hierarchy service drops its own refs in its destroy.
        this.beans.colGroupSvc?.serviceWrapperCache.destroyAll();
        super.destroy();
    }

    // Accessors retained for historic callers — read the underlying field directly.
    public getColTree(): (AgColumn | AgProvidedColumnGroup)[] {
        return this.colsTree;
    }
    public getColDefColTree(): (AgColumn | AgProvidedColumnGroup)[] {
        return this.colDefTree;
    }
    public getColDefCols(): AgColumn[] | null {
        return this.colDefList;
    }
    public getCols(): AgColumn[] {
        return this.colsList;
    }
    public isPivotMode(): boolean {
        return this.pivotMode;
    }

    /** Every column known to the grid (user, hierarchy, service, pivot result) in colsById
     *  insertion order. Lazily computed on first read after invalidation. */
    public getAllCols(): AgColumn[] {
        let cached = this.cachedAllCols;
        if (cached === null) {
            cached = Object.values(this.colsById);
            this.cachedAllCols = cached;
        }
        return cached;
    }

    /** Resolve any key (colId string, AgColumn, or ColDef) to its current AgColumn.
     *  Fast path inline: string colId or object with a `colId` that hits `colsById` (O(1)).
     *  Misses delegate to `getColSlow` for the ref / field fallback paths. */
    public getCol(key: Maybe<ColKey>): AgColumn | null {
        if (typeof key === 'string') {
            return this.colsById[key] ?? this.getColFallback(key);
        }
        if (key == null) {
            return null;
        }
        if (typeof key === 'object') {
            const id = (key as { colId?: string }).colId;
            if (typeof id === 'string') {
                const col = this.colsById[id];
                if (col != null) {
                    return col;
                }
            }
        }
        return this.getColFallback(key);
    }

    /** Slow-path fallback for `getCol`: ColDef/ColGroupDef ref lookup + `field`-string fallback.
     *  Builds the lazy `colsByDef` map on first use. Stale AgColumn refs naturally return null —
     *  AgColumn is not registered in the map and has no top-level `field`. */
    private getColFallback(key: ColKey): AgColumn | null {
        const map = this.cachedColsByDef ?? this.loadColsByDef();
        const byRef = map.get(key);
        if (byRef != null) {
            return byRef;
        }
        if (typeof key !== 'object') {
            return null;
        }
        const field = (key as { field?: string }).field;
        return typeof field === 'string' ? (map.get(field) ?? null) : null;
    }

    // Historic combined-lookup names — same semantics as `getCol` since `colsById` unifies every
    // col source. Kept as delegating methods to avoid diff churn at the many call sites.
    public getColDefColOrCol(key: Maybe<ColKey>): AgColumn | null {
        return this.getCol(key);
    }
    public getColOrColDefCol(key: Maybe<ColKey>): AgColumn | null {
        return this.getCol(key);
    }

    /** Find a column excluding pivot result cols. `pivotKeys` is the grid-set discriminator —
     *  `getColumnDefs()` reads `colDefList`, never pivot cols, so it doesn't round-trip onto
     *  primary colDefs. O(1) field check; equivalent to a `pivotCols`-membership test. */
    public getColDefCol(key: ColKey): AgColumn | null {
        const col = this.getCol(key);
        return col != null && col.colDef.pivotKeys == null ? col : null;
    }

    /** Get column by string ID. Skips the key-type check that `getCol` does — use this when the
     *  caller already knows the key is a colId string and is on a hot path (e.g. formula resolver,
     *  aggregation lookup). */
    public getColById(key: string): AgColumn | null {
        return this.colsById[key] ?? null;
    }

    private loadColsByDef(): Map<ColKey, AgColumn> {
        const map = new Map<ColKey, AgColumn>();

        const colsList = this.colsList;
        for (let i = 0, len = colsList.length; i < len; ++i) {
            const col = colsList[i];
            const colDef = col.colDef;
            map.set(colDef, col);
            const provided = col.userProvidedColDef;
            if (provided != null) {
                map.set(provided, col);
            }
            const field = colDef.field;
            if (field && field !== col.colId && !map.has(field)) {
                map.set(field, col);
            }
        }
        // In pivot mode colDefList cols are in colsById but not colsList — include them too
        if (this.showingPivotResult) {
            const colDefList = this.colDefList;
            for (let i = 0, len = colDefList.length; i < len; ++i) {
                const col = colDefList[i];
                const colDef = col.colDef;
                map.set(colDef, col);
                const provided = col.userProvidedColDef;
                if (provided != null) {
                    map.set(provided, col);
                }
                const field = colDef.field;
                if (field && field !== col.colId && !map.has(field)) {
                    map.set(field, col);
                }
            }
        }

        this.cachedColsByDef = map;
        return map;
    }
}

/** Apply prevOrder restoration (if any) then lock-position partitioning. Both phases are
 *  short-circuit on no-op: prevOrder=null skips order restore, no lockPosition skips partition. */
const restoreOrLockColumns = (
    colsList: AgColumn[],
    colsById: { [id: string]: AgColumn },
    prevOrder: string[] | null,
    gos: GridOptionsService
): AgColumn[] => {
    const ordered = prevOrder == null ? colsList : applyPrevOrder(colsList, colsById, prevOrder);
    return placeLockedColumns(ordered, gos);
};

/** Restores `colsList` order to match `prevOrder` (a snapshot of colIds from the previous refresh).
 *  Cols present in `prevOrder` appear in that order; service cols newly added go to the head; user
 *  cols newly added go after their last-known sibling in the prevOrder. */
const applyPrevOrder = (
    colsList: AgColumn[],
    colsById: { [id: string]: AgColumn },
    prevOrder: string[]
): AgColumn[] => {
    // Phase 1: resolve prevOrder colIds against current colsById.
    const preservedOrder: AgColumn[] = [];
    const colPositionMap = new Map<AgColumn, number>();
    for (let i = 0, len = prevOrder.length; i < len; ++i) {
        const current = colsById[prevOrder[i]];
        if (current != null) {
            colPositionMap.set(current, preservedOrder.length);
            preservedOrder.push(current);
        }
    }
    if (preservedOrder.length === colsList.length) {
        // All preserved — new order is correct already.
        return preservedOrder;
    }
    if (preservedOrder.length === 0) {
        // No preserved anchors; keep current order (service cols already at head).
        return colsList;
    }

    // Phase 2: partition new cols into servicePrepend / additionalCols.
    const servicePrepend: AgColumn[] = [];
    const additionalCols: AgColumn[] = [];
    for (let i = 0, len = colsList.length; i < len; ++i) {
        const col = colsList[i];
        if (colPositionMap.has(col)) {
            continue;
        }
        if (isColumnGroupAutoCol(col) || isColumnSelectionCol(col) || isRowNumberCol(col)) {
            servicePrepend.push(col);
        } else {
            additionalCols.push(col);
        }
    }

    // Phase 3: resolve sibling anchors for additional user cols. Skip the anchor walk when no
    // preserved col is inside a group (common case: flat colDefs).
    let followers: Map<AgColumn, AgColumn[]> | null = null;
    let noSiblings: AgColumn[] = additionalCols;
    if (additionalCols.length > 0) {
        let anyHasSiblings = false;
        for (let i = 0, len = preservedOrder.length; i < len; ++i) {
            if (hasSiblings(preservedOrder[i])) {
                anyHasSiblings = true;
                break;
            }
        }
        if (anyHasSiblings) {
            followers = new Map();
            noSiblings = [];
            for (let i = 0, len = additionalCols.length; i < len; ++i) {
                const col = additionalCols[i];
                const anchor = findPreviousSibling(col, null, colPositionMap);
                if (anchor == null) {
                    noSiblings.push(col);
                    continue;
                }
                const bucket = followers.get(anchor);
                if (bucket) {
                    bucket.push(col);
                } else {
                    followers.set(anchor, [col]);
                }
            }
        }
    }

    // Phase 4: emit forward.
    const totalLen = servicePrepend.length + preservedOrder.length + additionalCols.length;
    const result = new Array<AgColumn>(totalLen);
    let pos = 0;
    for (let i = 0, len = servicePrepend.length; i < len; ++i) {
        result[pos++] = servicePrepend[i];
    }
    for (let i = 0, len = preservedOrder.length; i < len; ++i) {
        const col = preservedOrder[i];
        result[pos++] = col;
        const bucket = followers?.get(col);
        if (bucket !== undefined) {
            for (let j = 0, m = bucket.length; j < m; ++j) {
                result[pos++] = bucket[j];
            }
        }
    }
    for (let i = 0, len = noSiblings.length; i < len; ++i) {
        result[pos++] = noSiblings[i];
    }
    return result;
};

/** Walks ancestors until one with multiple children is found (true), or the root (false). */
const hasSiblings = (col: AgColumn | AgProvidedColumnGroup): boolean => {
    let ancestor = col.originalParent;
    while (ancestor != null) {
        if (ancestor.children.length > 1) {
            return true;
        }
        ancestor = ancestor.originalParent;
    }
    return false;
};

/** Walks up the parent chain looking for a sibling cousin already present in `positionMap`.
 *  Returns the sibling with the highest position (i.e. last seen in last-order). */
const findPreviousSibling = (
    col: AgColumn,
    group: AgProvidedColumnGroup | null,
    positionMap: Map<AgColumn, number>
): AgColumn | null => {
    let parent = group ? group.originalParent : col.originalParent;
    let currentGroup = group;
    while (parent != null) {
        let highestIdx = -1;
        let highestSibling: AgColumn | null = null;
        const children = parent.children;
        for (let i = 0, len = children.length; i < len; ++i) {
            const child = children[i];
            if (child === currentGroup || child === col) {
                continue;
            }
            if (child.isColumn) {
                const idx = positionMap.get(child);
                if (idx != null && idx > highestIdx) {
                    highestIdx = idx;
                    highestSibling = child;
                }
                continue;
            }
            child.forEachLeafColumn((leaf) => {
                const idx = positionMap.get(leaf);
                if (idx != null && idx > highestIdx) {
                    highestIdx = idx;
                    highestSibling = leaf;
                }
            });
        }
        if (highestSibling != null) {
            return highestSibling;
        }
        currentGroup = parent;
        parent = parent.originalParent;
    }
    return null;
};
