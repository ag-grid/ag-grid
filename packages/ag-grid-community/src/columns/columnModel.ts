import { _areEqual } from 'ag-stack';

import { placeLockedColumns } from '../columnMove/columnMoveUtils';
import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { AgColumn } from '../entities/agColumn';
import type { AgProvidedColumnGroup } from '../entities/agProvidedColumnGroup';
import type { ColDef, ColGroupDef, ColKey } from '../entities/colDef';
import type { GridOptions } from '../entities/gridOptions';
import type { ColumnEventType } from '../events';
import type { PropertyChangedEvent, PropertyValueChangedEvent } from '../gridOptionsService';
import { _shouldMaintainColumnOrder } from '../gridOptionsUtils';
import { _buildColumnTree, finalizeColumnTree } from './buildColumnTree';
import { applyPrevColumnsOrder } from './colsApplyPrevOrder';
import { ColWrapperCache } from './columnGroups/colWrapperCache';
import { captureColumnStateChanges, dispatchColStateChanges } from './columnStateUtils';
import { _convertColumnEventSourceType, _destroyColumnTreeAll, _destroyColumnTreeUnused } from './columnUtils';

// Two parallel col representations:
//   colDefList / colDefTree  — PRIMARY cols (user-defined leaves + hierarchy virtuals).
//   colsList   / colsTree    — DISPLAY cols: [serviceCols, ...colDefList] (or pivot result).

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export class ColumnModel extends BeanStub implements NamedBean {
    beanName = 'colModel' as const;

    public pivotMode = false;
    public colSpanActive = false;
    public ready = false;
    /** Suppresses row model refreshes during batch column state dispatching. */
    public changeEventsDispatching = false;
    public showingPivotResult = false;

    /** >0 inside a {@link beginColBatch}/{@link endColBatch} pair: cols services defer their flush to the outermost close. */
    private colBatchDepth = 0;
    /** Set when a staged change needs a display rebuild; consumed (cleared) once by {@link performRefresh}. */
    private pendingRefresh = false;
    /** A batched `buildFromColDefs` already raised `columnEverythingChanged`; stops the batch flush re-raising it. */
    private everythingChangedInBatch = false;
    public colsList: AgColumn[] = [];
    public colsTree: (AgColumn | AgProvidedColumnGroup)[] = [];
    public colsTreeDepth = 0;
    public colDefList: AgColumn[] = [];
    public colDefTree: (AgColumn | AgProvidedColumnGroup)[] = [];
    public colDefTreeDepth = 0;
    private colDefHasMarryChildren = false;
    public hasMarryChildren = false;

    /** Single source of truth for `getCol`. Pivot result colIds are namespaced (`pivot_…`). */
    public colsById: { [id: string]: AgColumn } = Object.create(null);

    public colDefGroupsById: Map<string, AgProvidedColumnGroup> = new Map();
    /** Primary cols keyed by colId / userProvidedColDef ref / field; passed back for next-build reuse. */
    private colDefColsByKey: Map<string | ColDef, AgColumn> = new Map();
    /** Every primary group (padding + non-padding) — sweep uses this to find orphans whose parent's
     *  `.children` was reassigned. */
    private colDefAllGroups: AgProvidedColumnGroup[] = [];

    /** Non-padding displayed groups by `groupId`. Pivot mode = pivot's groups; else = colDefGroupsById. */
    public colsGroupsById: Map<string, AgProvidedColumnGroup> = new Map();
    /** Every displayed group — padding groups carry `displayInstances` */
    public colsAllGroups: AgProvidedColumnGroup[] = [];

    /** Lazy fallback for ColDef-shaped keys not in `colsById`: by-ref (merged + user colDef) plus
     *  `field` when distinct from colId (first-write-wins). */
    private cachedColsByDef: Map<ColKey, AgColumn> | null = null;

    private cachedAllCols: AgColumn[] | null = null;

    /** Cache for getColsInStateOrder (pivot only). Invalidated on `colsList` mutation — ref equality
     *  can't substitute, as `moveColumns` reorders in place. */
    private cachedColsInStateOrder: AgColumn[] | null = null;

    /** Prior display order per mode, as colId snapshots, so the next refresh can restore user moves. */
    private lastOrder: string[] | null = null;
    private lastPivotOrder: string[] | null = null;
    /** True when `lastPivotOrder` came from a strictly-ordered (comparator/pivotSort) refresh, so it must not
     *  be treated as a user order to restore. */
    private prevPivotStrict = false;
    /** Set when colsList order changes; {@link ensureColsListIndex} re-stamps `colsListIndex` lazily. */
    private colsListIndexDirty = true;

    /** User provided column definitions */
    public colDefs: (ColDef | ColGroupDef)[] | undefined = undefined;

    private buildTokenCounter = 0;

    /** Persistent padding-group cache for hierarchy virtual cols, handed to each column-tree build
     *  so `(col, depth)`-stable wrappers survive rebuilds. Owns the padding-group bean lifecycle. */
    private hierarchyWrapperCache: ColWrapperCache;

    public postConstruct(): void {
        this.pivotMode = this.gos.get('pivotMode');
        this.hierarchyWrapperCache = new ColWrapperCache(this.beans);

        this.addManagedPropertyListeners(
            ['groupDisplayType', 'treeData', 'treeDataDisplayType', 'groupHideOpenParents', 'hidePaddedHeaderRows'],
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

    public override destroy(): void {
        _destroyColumnTreeAll(this.colDefList, this.colDefAllGroups);
        this.hierarchyWrapperCache.destroy();
        super.destroy();
    }

    public nextBuildToken(): number {
        return ++this.buildTokenCounter;
    }

    public isPivotActive(): boolean {
        return this.pivotMode && !!this.beans.pivotColsSvc?.columns?.length;
    }

    public getCols(): AgColumn[] {
        return this.colsList;
    }

    /** Every column known to the grid (user, hierarchy, service, pivot result) in display (`colsList`)
     *  order, with parked pivot primaries appended. Lazily computed on first read after invalidation. */
    public getAllCols(): AgColumn[] {
        let allCols = this.cachedAllCols;
        if (!allCols) {
            // While pivoting, pivot result cols are the full set (primaries are parked); `??` keeps an empty result.
            const pivotAllCols = this.showingPivotResult ? this.beans.pivotResultCols?.buildAllCols() : undefined;
            allCols = pivotAllCols ?? this.colsList;
            this.cachedAllCols = allCols;
        }
        return allCols;
    }

    /** Resolve a provided group by id, falling back to parked primaries while pivoting (mirrors `getCol`). */
    public getColGroup(groupId: string): AgProvidedColumnGroup | undefined {
        return (
            this.colsGroupsById.get(groupId) ??
            (this.showingPivotResult ? this.colDefGroupsById.get(groupId) : undefined)
        );
    }

    /** Columns in column-state order: hidden pivot primaries first, then `colsList`. Must not be mutated. */
    public getColsInStateOrder(): AgColumn[] {
        // Only pivot has hidden primaries (built enterprise-side); cached on colsList.
        if (!this.showingPivotResult) {
            return this.colsList;
        }
        let ordered = this.cachedColsInStateOrder;
        if (ordered) {
            return ordered;
        }
        ordered = this.beans.pivotResultCols?.buildColsInStateOrder() ?? this.colsList;
        this.cachedColsInStateOrder = ordered;
        return ordered;
    }

    /** `newColDefs`: true = colDefs changed (order restored only with `maintainColumnOrder`); false =
     *  dynamic refresh with unchanged colDefs (prior order restored). */
    private buildFromColDefs(source: ColumnEventType, newColDefs: boolean): void {
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
            calculatedColsSvc,
        } = beans;

        // only dispatch before/after events when updating an existing column model, not on first set.
        const colDefs = this.colDefs;
        const stateChanges = this.ready ? captureColumnStateChanges(beans) : undefined;
        valueCache?.expire(); // new ids may collide with old ids, so cached values would be wrong for new cols

        const oldCols = this.colDefList;
        const oldTree = this.colDefTree;
        const oldAllGroups = this.colDefAllGroups;

        const builder = _buildColumnTree(
            beans,
            /* defs */ colDefs,
            /* primaryColumns */ true,
            /* existingGroupsById */ this.colDefGroupsById,
            /* existingColsByKey */ this.colDefColsByKey,
            /* existingColsById */ this.colsById,
            /* source */ source,
            /* newColDefs */ newColDefs,
            /* buildToken */ this.nextBuildToken(),
            /* wrapperCache */ this.hierarchyWrapperCache
        );
        groupHierarchyColSvc?.contributeTo(builder);
        calculatedColsSvc?.contributeTo(builder);
        finalizeColumnTree(builder);

        const tree = builder.columnTree;
        const cols = builder.columns;
        this.colDefTree = tree;
        this.colDefTreeDepth = builder.treeDepth;
        this.colDefList = cols;
        this.colDefHasMarryChildren = builder.marryChildren;
        this.colDefGroupsById = builder.groupsById;
        this.colDefColsByKey = builder.colsByKey;
        this.colDefAllGroups = builder.allGroups;

        // Seed colsById from the finalized primary cols (user leaves + hierarchy virtuals + calc cols).
        const colsById: { [id: string]: AgColumn } = Object.create(null);
        for (let i = 0, len = cols.length; i < len; ++i) {
            colsById[cols[i].colId] = cols[i];
        }
        this.colsById = colsById;

        if (oldTree !== tree) {
            // Skip sweep when the tree ref is unchanged (group reuse + unchanged colDefs short-circuit).
            _destroyColumnTreeUnused(oldCols, oldAllGroups, builder.buildToken);
        }

        this.invalidateColsDerivedState();

        // Single shared scan: each service classifies independently, bucketing lazily until commit.
        const oldProvidedSet = oldCols.length > 0 ? new Set(oldCols) : null;
        for (let i = 0, len = cols.length; i < len; ++i) {
            const col = cols[i];
            const colIsNew = !oldProvidedSet?.has(col);
            rowGroupColsSvc?.extractCol(col, colIsNew);
            pivotColsSvc?.extractCol(col, colIsNew);
            valueColsSvc?.extractCol(col, colIsNew);
        }
        rowGroupColsSvc?.commitExtract(source);
        pivotColsSvc?.commitExtract(source);
        valueColsSvc?.commitExtract(source);

        this.ready = true;
        this.changeEventsDispatching = true;
        try {
            this.refreshCols(newColDefs, source);
        } finally {
            this.changeEventsDispatching = false;
        }

        visibleCols.refresh(source, false);

        // unused by AG Grid but kept for backwards compatibility
        eventSvc.dispatchEvent({ type: 'columnEverythingChanged', source });
        if (this.colBatchDepth > 0) {
            this.everythingChangedInBatch = true; // batch flush must not re-raise it
        }

        if (stateChanges) {
            this.changeEventsDispatching = true;
            try {
                dispatchColStateChanges(beans, source, stateChanges);
            } finally {
                this.changeEventsDispatching = false;
            }
        }

        eventSvc.dispatchEvent({ type: 'newColumnsLoaded', source });

        if (source === 'gridInitializing') {
            colAutosize?.applyAutosizeStrategy();
        }
    }

    /** Open a column-change batch; mutations until the {@link endColBatch} share one flush. Active-col indexes
     *  (`*ActiveIndex`) are re-stamped only at the flush, so they read stale inside an open batch. */
    public beginColBatch(): void {
        this.colBatchDepth++;
    }

    /** Close a {@link beginColBatch}; the outermost close flushes once (one source for the whole action). */
    public endColBatch(source: ColumnEventType): void {
        this.colBatchDepth = Math.max(0, this.colBatchDepth - 1);
        this.flushColChanges(source, false); // refresh only if a staged op accumulated one
    }

    /** Refresh once (if needed) + dispatch each touched service. Fires immediately, or defers to {@link endColBatch}
     *  when batched. `refresh` accumulates into {@link pendingRefresh}: membership passes `true`, order-only or a
     *  func change on an already-active col (`moveColumn`, `setColumnAggFunc`) pass `false` to dispatch without a rebuild. */
    public flushColChanges(source: ColumnEventType, refresh: boolean): void {
        if (refresh) {
            this.pendingRefresh = true;
        }
        if (this.colBatchDepth > 0) {
            return; // inside a batch: endColBatch will flush
        }
        const { rowGroupColsSvc, pivotColsSvc, valueColsSvc } = this.beans;
        const pendingRefresh = this.pendingRefresh;
        // A batched `buildFromColDefs` may already have raised it; consume the flag either way.
        const everythingAlreadyRaised = this.everythingChangedInBatch;
        this.everythingChangedInBatch = false;
        const nothingStaged =
            !rowGroupColsSvc?.pendingChanged && !pivotColsSvc?.pendingChanged && !valueColsSvc?.pendingChanged;
        if (nothingStaged && !pendingRefresh) {
            return; // no staged dispatch and no deferred refresh
        }
        // Re-stamp active-col indexes once, before refresh/dispatch (and their listeners) read them.
        rowGroupColsSvc?.flushReindex();
        pivotColsSvc?.flushReindex();
        valueColsSvc?.flushReindex();
        if (pendingRefresh) {
            this.performRefresh(source); // clears pendingRefresh
            // Legacy compat: a role membership change (rowGroup/pivot/value add/remove/set) raised this.
            if (!everythingAlreadyRaised) {
                this.eventSvc.dispatchEvent({ type: 'columnEverythingChanged', source });
            }
        }
        rowGroupColsSvc?.dispatchColChange(source);
        pivotColsSvc?.dispatchColChange(source);
        valueColsSvc?.dispatchColChange(source);
    }

    public refreshCols(newColDefs: boolean, source: ColumnEventType): void {
        if (!this.ready) {
            return;
        }
        const beans = this.beans;
        const gos = this.gos;
        // Pivot-sort reorders existing columns, so reuse the column-move animation to slide them.
        const animatePivotSort = this.isPivotSortReorder();
        if (animatePivotSort) {
            beans.colAnimation?.start();
        }
        const colDefList = this.colDefList;
        const prevColTree = this.colsTree;
        const prevWasPivot = this.showingPivotResult;
        const resultColsSvc = this.pivotMode ? beans.pivotResultCols : null;
        const pivotCols = resultColsSvc?.pivotCols ?? null;
        const pivotResultCols = pivotCols != null ? resultColsSvc : null;
        const showingPivotResult = !!pivotResultCols;
        this.showingPivotResult = showingPivotResult;
        const sourceList = pivotCols ?? colDefList;
        const sourceTree = pivotResultCols ? pivotResultCols.pivotTree : this.colDefTree;
        const sourceTreeDepth = pivotResultCols ? pivotResultCols.pivotTreeDepth : this.colDefTreeDepth;
        this.colsTreeDepth = sourceTreeDepth;
        this.hasMarryChildren = pivotResultCols ? pivotResultCols.pivotHasMarryChildren : this.colDefHasMarryChildren;
        this.colsGroupsById = pivotResultCols ? pivotResultCols.pivotGroupsById : this.colDefGroupsById;
        this.colsAllGroups = pivotResultCols ? pivotResultCols.pivotAllGroups : this.colDefAllGroups;
        // Service refresh runs in dependency order; formulas operate on the primary cols (colDefList).
        beans.formula?.setFormulasActive(colDefList);
        const autoCols = beans.autoColSvc?.refreshCols(source);
        const selectionCol = beans.selectionColSvc?.refreshCols();
        const rowNumberCol = beans.rowNumbersSvc?.refreshCols();
        // Snapshot prior colsList colIds into the mode's lastOrder so the next refresh restores user moves.
        const oldColsList = this.colsList;
        if (oldColsList.length > 0) {
            if (prevWasPivot) {
                // A strict pivot order (comparator/pivotSort) isn't a user arrangement to preserve - skip it so
                // clearing pivotSort restores the prior non-strict order rather than the transient asc/desc one.
                if (!this.prevPivotStrict) {
                    this.lastPivotOrder = snapshotColIds(oldColsList, this.lastPivotOrder);
                }
            } else {
                this.lastOrder = snapshotColIds(oldColsList, this.lastOrder);
            }
        }
        this.prevPivotStrict = showingPivotResult && (beans.pivotColsSvc?.isStrictColumnOrder() ?? false);
        // Emit in display order: rowNumbers → selection → autoGroup → user/pivot body cols.
        const autoColsLen = autoCols?.length ?? 0;
        const sourceListLen = sourceList.length;
        const sourceTreeLen = sourceTree.length;
        const serviceColsLen = (rowNumberCol ? 1 : 0) + (selectionCol ? 1 : 0) + autoColsLen;
        // Pre-allocated at final size — the assemble loops below fill by index, not push.
        const colsList = new Array<AgColumn>(serviceColsLen + sourceListLen);
        const colsTree = new Array<AgColumn | AgProvidedColumnGroup>(serviceColsLen + sourceTreeLen);
        const colsById: { [id: string]: AgColumn } = Object.create(null);
        let colsIdx = 0;
        if (rowNumberCol) {
            colsList[colsIdx++] = rowNumberCol;
        }
        if (selectionCol) {
            colsList[colsIdx++] = selectionCol;
        }
        for (let i = 0; i < autoColsLen; ++i) {
            colsList[colsIdx++] = autoCols![i];
        }
        // At depth 0 the wrapper IS the col, so skip the wrap loop; still drop cached wrappers from
        // a prior depth>0 build so service cols don't point at a stale wrapper.
        const serviceWrapperCache = beans.colGroupSvc.wrapperCache;
        if (sourceTreeDepth > 0) {
            const buildToken = this.nextBuildToken();
            for (let i = 0; i < serviceColsLen; ++i) {
                const col = colsList[i];
                colsById[col.colId] = col;
                col.inColsList = true;
                colsTree[i] = serviceWrapperCache.wrap(col, sourceTreeDepth, buildToken);
            }
            serviceWrapperCache.evict(buildToken);
        } else {
            serviceWrapperCache.destroy();
            for (let i = 0; i < serviceColsLen; ++i) {
                const col = colsList[i];
                colsById[col.colId] = col;
                col.inColsList = true;
                col.originalParent = null;
                colsTree[i] = col;
            }
        }

        // In pivot mode, sourceList = pivotCols; primaries (colDefList) need colsById entries for lookups
        // but are parked out of colsList (`inColsList = false`). Non-pivot covers them via the next loop.
        if (pivotResultCols) {
            // Entering pivot: freeze the current display order so `getColumnDefs` keeps reporting it.
            if (!prevWasPivot) {
                this.ensureColsListIndex();
            }
            // A col added while pivoting has no frozen index (-1); seat it after its left colDef neighbour so
            // `getColumnDefs` reports it in colDef order (stable sort breaks the tie) without disturbing others.
            let lastIndex = -1;
            for (let i = 0, len = colDefList.length; i < len; ++i) {
                const col = colDefList[i];
                colsById[col.colId] = col;
                col.inColsList = false;
                if (col.colsListIndex < 0) {
                    col.colsListIndex = lastIndex;
                } else {
                    lastIndex = col.colsListIndex;
                }
            }
        }
        for (let i = 0; i < sourceListLen; ++i) {
            const col = sourceList[i];
            colsList[colsIdx++] = col;
            colsById[col.colId] = col;
            col.inColsList = true;
        }
        for (let i = 0; i < sourceTreeLen; ++i) {
            colsTree[serviceColsLen + i] = sourceTree[i];
        }
        // An active interactive pivotSort forces strict pivot column order, overriding sticky-order preservation.
        const restoreOrder = !newColDefs || _shouldMaintainColumnOrder(gos, showingPivotResult);
        const lastOrder = showingPivotResult ? this.lastPivotOrder : this.lastOrder;
        let prevOrder = restoreOrder ? lastOrder : null;
        // pivotSort reorders the groups but keeps the user's within-group order and widths: re-rank the
        // preserved order by the freshly-sorted group order rather than discarding it.
        const pivotColsSvc = beans.pivotColsSvc;
        if (prevOrder != null && showingPivotResult && !!pivotColsSvc?.hasInteractivePivotSort()) {
            prevOrder = pivotColsSvc.reRankByPivotGroupOrder(colsList, prevOrder, colsById);
        }
        const ordered = prevOrder == null ? colsList : applyPrevColumnsOrder(colsList, colsById, prevOrder);
        const finalColsList = placeLockedColumns(ordered, gos);
        const colsListChanged = !_areEqual(finalColsList, oldColsList);
        if (colsListChanged) {
            this.colsListIndexDirty = true;
        }
        this.colsList = colsListChanged ? finalColsList : oldColsList;
        this.colsTree = _areEqual(colsTree, prevColTree) ? prevColTree : colsTree;
        this.colsById = colsById;
        this.invalidateColsDerivedState();
        this.refreshColsDerivedState();
        if (colsListChanged) {
            beans.rowSpanSvc?.refreshCols();
        }
        if (this.colsTree !== prevColTree) {
            this.eventSvc.dispatchEvent({ type: 'gridColumnsChanged' });
        }
        if (animatePivotSort) {
            beans.colAnimation?.finish();
        }
    }

    /** True when this refresh reorders pivot columns due to an interactive pivot sort - either a sort is active,
     *  or the prior refresh was a strict pivot-sort order being cleared (desc→null) back to the default order. */
    private isPivotSortReorder(): boolean {
        return !!this.beans.pivotColsSvc?.hasInteractivePivotSort() || this.prevPivotStrict;
    }

    /** Refresh state derived from `colsList` (group + quick-filter cols, colSpan/autoHeight flags) and
     *  reset displayed-col + viewport caches, ahead of `visibleCols.refresh`. Shared by full refreshCols
     *  and by a visibility-only change (which leaves `colsList` unchanged, so skips the rebuild). */
    public refreshColsDerivedState(): void {
        const beans = this.beans;
        beans.showRowGroupCols?.refresh();
        beans.quickFilter?.refreshCols();
        this.computeColSpanAndAutoHeight();
        beans.visibleCols.clear();
        beans.colViewport.clear();
    }

    /** Single pass: set `colSpanActive` and `rowAutoHeight.active` from `colsList`. */
    private computeColSpanAndAutoHeight(): void {
        const colsList = this.colsList;
        const rowAutoHeight = this.beans.rowAutoHeight;
        let colSpan = false;
        let autoHeight = false;
        for (let i = 0, len = colsList.length; i < len; ++i) {
            const col = colsList[i];
            const colDef = col.colDef;
            colSpan ||= colDef.colSpan != null;
            autoHeight ||= !!rowAutoHeight && !!colDef.autoHeight && col.visible;
            if (colSpan && (autoHeight || !rowAutoHeight)) {
                break;
            }
        }
        this.colSpanActive = colSpan;
        rowAutoHeight?.setAutoHeightActive(autoHeight);
    }

    /** Full refresh (rebuild cols + recompute visible); immediate, or deferred to {@link endColBatch} when batched. */
    public refreshAll(source: ColumnEventType): void {
        if (!this.ready) {
            return;
        }
        if (this.colBatchDepth > 0) {
            this.pendingRefresh = true; // defer; the flush at endColBatch performs it
            return;
        }
        this.performRefresh(source);
    }

    private performRefresh(source: ColumnEventType): void {
        this.pendingRefresh = false; // consumed: this refresh satisfies the pending request
        if (this.ready) {
            this.refreshCols(false, source);
            this.beans.visibleCols.refresh(source, false);
        }
    }

    /** Reorder `colDefList` only — `newList` MUST be a permutation of the existing col instances
     *  (caller owns the invariant). A full refresh should follow to propagate to display cols.
     *  `colsById` unchanged; `getAllCols` is order-agnostic. */
    public replaceColDefList(newList: AgColumn[]): void {
        if (this.ready) {
            this.colDefList = newList;
        }
    }

    private setPivotMode(pivotMode: boolean, source: ColumnEventType): void {
        if (pivotMode === this.pivotMode) {
            return;
        }
        this.pivotMode = pivotMode;
        if (this.ready) {
            // Refresh in case the auto-group col must be added/removed: with `groupDisplayType: 'custom'`
            // it's only used in pivot mode (where it's mandatory).
            this.refreshCols(false, source);
            this.beans.visibleCols.refresh(source, false);
            this.eventSvc.dispatchEvent({ type: 'columnPivotModeChanged' });
        }
    }

    public recreateColumnDefs(e: PropertyChangedEvent | PropertyValueChangedEvent<keyof GridOptions>): void {
        if (this.ready) {
            // Auto cols aren't in `colDefs`, so refresh their derived defs before the rebuild re-reads user colDefs.
            this.beans.autoColSvc?.updateColumns(e);
            this.buildFromColDefs(_convertColumnEventSourceType(e.source), true);
        }
    }

    public setColumnDefs(columnDefs: (ColDef | ColGroupDef)[], source: ColumnEventType) {
        this.beans.calculatedColsSvc?.resetDynamicColumnDefs();
        this.colDefs = columnDefs;
        this.buildFromColDefs(source, true);
    }

    /** Full structural rebuild from current `colDefs` + all contributors (hierarchy, calc cols, …).
     *  Used by contributors whose mutation changes tree structure (e.g. calc-col add/update/remove). */
    public rebuildCols(source: ColumnEventType): void {
        if (this.ready) {
            this.buildFromColDefs(source, false);
        }
    }

    /** Mark `AgColumn.colsListIndex` stale — called when `colsList`'s order changes outside a refresh
     *  (`moveColumns`, `applyColumnState` with `applyOrder`); next `ensureColsListIndex` re-stamps. */
    public markColsListIndexDirty(): void {
        this.colsListIndexDirty = true;
        // Both order-derived views snapshot `colsList` order while pivoting (parked-primary concat) — drop both.
        this.cachedColsInStateOrder = null;
        this.cachedAllCols = null;
    }

    /** Drop all col-set/order-derived state after a structural (`colsList`) rebuild — this model's caches plus
     *  the sort service's column-derived cache. (An order-only move uses {@link markColsListIndexDirty} instead.) */
    private invalidateColsDerivedState(): void {
        this.cachedColsByDef = null;
        this.cachedAllCols = null;
        this.cachedColsInStateOrder = null;
        this.beans.sortSvc?.invalidate();
    }

    /** Lazily stamp each col's index in `colsList` onto `AgColumn.colsListIndex`, once per order change.
     *  Readers (e.g. `getColumnDefs`) call this before reading `col.colsListIndex`, so a burst of moves
     *  costs one O(N) pass on the next read, not one per move. */
    public ensureColsListIndex(): void {
        if (this.colsListIndexDirty) {
            const colsList = this.colsList;
            for (let i = 0, len = colsList.length; i < len; ++i) {
                colsList[i].colsListIndex = i;
            }
            this.colsListIndexDirty = false;
        }
    }

    /** Resolve any key (colId string, AgColumn, or ColDef) to its current AgColumn. Fast path inline:
     *  string colId, or object whose `colId` hits `colsById` (O(1)); misses delegate to `getColFallback`. */
    public getCol(key: ColKey | null | undefined): AgColumn | undefined {
        if (typeof key === 'string') {
            return this.colsById[key] ?? this.getColFallback(key);
        }
        // `?.colId` collapses the null/undefined + non-object checks into one access: both yield
        // `undefined`, falling through to the slow path.
        const id = (key as { colId?: unknown } | null | undefined)?.colId;
        if (typeof id === 'string') {
            const col = this.colsById[id];
            if (col !== undefined) {
                return col;
            }
        }
        return key == null ? undefined : this.getColFallback(key);
    }

    /** Slow-path fallback for `getCol`: ColDef/ColGroupDef ref lookup + `field`-string fallback, building
     *  the lazy `colsByDef` map on first use. Stale AgColumn refs return `undefined` (unregistered, no `field`). */
    private getColFallback(key: ColKey): AgColumn | undefined {
        const map = this.cachedColsByDef ?? this.loadColsByDef();
        const byRef = map.get(key);
        if (byRef !== undefined) {
            return byRef;
        }
        if (typeof key !== 'object') {
            return undefined;
        }
        const field = (key as { field?: string }).field;
        return typeof field === 'string' ? map.get(field) : undefined;
    }

    /** Find a column excluding pivot result cols. `pivotKeys` (grid-set) is an O(1) discriminator
     *  standing in for a `pivotCols`-membership test, so `getColumnDefs()` doesn't round-trip them. */
    public getNonPivotCol(key: ColKey): AgColumn | undefined {
        const col = this.getCol(key);
        return col !== undefined && col.colDef.pivotKeys == null ? col : undefined;
    }

    /** Like `getNonPivotCol` for hot paths where the key is a known colId string — skips the type-check + field-fallback. */
    public getNonPivotColById(key: string): AgColumn | undefined {
        const col = this.colsById[key];
        return col !== undefined && col.colDef.pivotKeys == null ? col : undefined;
    }

    private loadColsByDef(): Map<ColKey, AgColumn> {
        const map = new Map<ColKey, AgColumn>();
        addColsToDefMap(map, this.colsList);
        // In pivot mode colDefList cols are in colsById but not colsList — include them too
        if (this.showingPivotResult) {
            addColsToDefMap(map, this.colDefList);
        }
        this.cachedColsByDef = map;
        return map;
    }
}

const snapshotColIds = (list: AgColumn[], out?: string[] | null): string[] => {
    const len = list.length;
    out ??= [];
    out.length = len;
    for (let i = 0; i < len; ++i) {
        out[i] = list[i].colId;
    }
    return out;
};

/** Indexes each col by its colDef, its user-provided colDef and (as a fallback) its field. */
const addColsToDefMap = (map: Map<ColKey, AgColumn>, list: AgColumn[]): void => {
    for (let i = 0, len = list.length; i < len; ++i) {
        const col = list[i];
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
};
