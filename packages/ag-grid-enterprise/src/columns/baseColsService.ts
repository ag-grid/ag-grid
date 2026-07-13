import { _indexMap } from 'ag-stack';

import type {
    AgColumn,
    BeanCollection,
    ColKey,
    ColumnEventType,
    ColumnModel,
    ColumnState,
    ColumnStateParams,
    IColsService,
    _ColumnChangedEventType,
} from 'ag-grid-community';
import { BeanStub, _dispatchColumnChangedEvent } from 'ag-grid-community';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export abstract class BaseColsService extends BeanStub implements IColsService {
    protected colModel: ColumnModel;

    protected abstract eventName: _ColumnChangedEventType;

    /** Membership + insertion order; the single source of truth (O(1), idempotent add). The per-col flag
     *  (`rowGroupActive`/…) is a denormalised copy of `has(col)` for the public `Column` API. */
    protected activeColSet = new Set<AgColumn>();

    /** Lazy array view of {@link activeColSet}; `null` when stale. */
    private colsCache: AgColumn[] | null = null;

    /** Extract-pass buckets, opened lazily per pass and released by {@link commitExtract} (no stale carry-over).
     *  `…WithIndex` = cols with an order key (sorted first in commit); `…WithValue` = the rest. */
    private extractColsWithIndex: { col: AgColumn; key: number }[] | null = null;
    private extractColsWithValue: Set<AgColumn> | null = null;

    /** Cols changed since the last flush; non-null = dirty. Dispatched once by {@link dispatchColChange}. */
    public pendingChanged: Set<AgColumn> | null = null;

    /** A staged change moved the active set/order → re-stamp indexes once at flush ({@link flushReindex}). */
    private reindexPending = false;

    /** Order index recorded per active col during the current state-apply pass; consumed by {@link sortByPendingState}. */
    protected pendingStateOrder: Map<AgColumn, number> | null = null;

    /** Set when the current state-apply pass changed membership/order → re-sort + re-stamp at {@link sortByPendingState}. */
    protected pendingStateChanged = false;

    /** Bucket an indexed col, opening {@link extractColsWithIndex} lazily. */
    protected extractAddColWithIndex(col: AgColumn, key: number): void {
        let bucket = this.extractColsWithIndex;
        if (bucket === null) {
            bucket = [];
            this.extractColsWithIndex = bucket;
        }
        bucket.push({ col, key });
    }

    /** Bucket a non-indexed (value) col, opening {@link extractColsWithValue} lazily. */
    protected extractAddColWithValue(col: AgColumn): void {
        let bucket = this.extractColsWithValue;
        if (bucket === null) {
            bucket = new Set();
            this.extractColsWithValue = bucket;
        }
        bucket.add(col);
    }

    /** Bucket `col` by its resolved order `key`: indexed (non-null) cols sort in `commitExtract`, the rest keep order. */
    protected bucketByKey(col: AgColumn, key: number | null | undefined): void {
        if (key != null) {
            this.extractAddColWithIndex(col, key);
        } else {
            this.extractAddColWithValue(col);
        }
    }

    /** Active columns, in order. Ref-stable until the next edit. */
    public get columns(): AgColumn[] {
        let cache = this.colsCache;
        if (cache === null) {
            cache = Array.from(this.activeColSet);
            this.colsCache = cache;
        }
        return cache;
    }

    public wireBeans(beans: BeanCollection): void {
        this.colModel = beans.colModel;
    }

    /** Replace the active cols with `cols` (must be dup-free); `cols` doubles as the cached view. */
    protected resetActiveCols(cols: AgColumn[]): void {
        this.activeColSet = new Set(cols);
        this.colsCache = cols;
    }

    /** Activate/deactivate a col (O(1)): flag + per-col events via {@link writeColActive}, membership here, and
     *  the `runSideEffects`-gated {@link onColActiveChanged}. `OrderedColsService` overrides to seat virtuals. */
    protected setColActive(col: AgColumn, active: boolean, source: ColumnEventType, runSideEffects = false): boolean {
        if (!this.writeColActive(col, active, source)) {
            return false;
        }
        if (active) {
            this.activeColSet.add(col);
        } else {
            this.activeColSet.delete(col);
        }
        if (runSideEffects) {
            this.onColActiveChanged(col, active, source);
        }
        this.colsCache = null;
        return true;
    }

    /** Per-subclass: set the col's role flag and, if it changed, dispatch its per-col events; returns whether it
     *  flipped. Only this col's state — not the active set (that's {@link setColActive}). */
    protected abstract writeColActive(col: AgColumn, active: boolean, source: ColumnEventType): boolean;

    /** Auto side-effects of (de)activate (rowGroup auto-hide, value default agg-func); only on `runSideEffects`
     *  (imperative paths). Default no-op. */
    protected onColActiveChanged(_col: AgColumn, _active: boolean, _source: ColumnEventType): void {}

    /** Bulk diff: flip flags to match `targetSet` (insertion order = active order); `runSideEffects` runs
     *  {@link onColActiveChanged}. Reuses `targetSet` as the active set; `targetArr` seeds the cache, else lazy. */
    private applyActiveCols(
        before: AgColumn[],
        targetSet: Set<AgColumn>,
        targetArr: AgColumn[] | null,
        source: ColumnEventType,
        runSideEffects: boolean
    ): void {
        for (let i = 0, len = before.length; i < len; ++i) {
            const col = before[i];
            if (!targetSet.has(col) && this.writeColActive(col, false, source) && runSideEffects) {
                this.onColActiveChanged(col, false, source);
            }
        }
        for (const col of targetSet) {
            if (this.writeColActive(col, true, source) && runSideEffects) {
                this.onColActiveChanged(col, true, source);
            }
        }
        this.activeColSet = targetSet;
        this.colsCache = targetArr;
    }

    /** After a flush, dispatch batched per-col side-effects (rowGroup `columnVisible`). Default no-op. */
    protected onColActiveChangesComplete(_source: ColumnEventType): void {}

    /** React to a `this.columns` order/content change; `rowGroupColsSvc` stamps `rowGroupActiveIndex`. Default no-op. */
    protected onColumnsChanged(): void {}

    /** Stage cols differing in membership or position between `before` and `after` (removed/moved/added) and
     *  mark a reindex; returns whether any differed, so the caller can skip an unchanged apply. Records straight
     *  into `pendingChanged` — no intermediate array — leaving it untouched (and null) when nothing changed. */
    private stageChangedColsBetween(before: AgColumn[], after: AgColumn[]): boolean {
        const afterIndex = _indexMap(after);
        const beforeSet = before.length > 0 ? new Set(before) : null;
        let pending: Set<AgColumn> | null = null;
        for (let i = 0, len = before.length; i < len; ++i) {
            const col = before[i];
            const newIndex = afterIndex.get(col);
            if (newIndex === undefined || newIndex !== i) {
                pending ??= this.pendingColChangeSet(); // removed or moved
                pending.add(col);
            }
        }
        for (let i = 0, len = after.length; i < len; ++i) {
            const col = after[i];
            if (!beforeSet?.has(col)) {
                pending ??= this.pendingColChangeSet(); // added
                pending.add(col);
            }
        }
        if (pending === null) {
            return false;
        }
        this.reindexPending = true;
        return true;
    }

    public setColumns(colKeys: ColKey[] | undefined, source: ColumnEventType): void {
        const providedColKeys = colKeys ?? [];
        const colModel = this.colModel;
        if (colModel.colsList.length === 0) {
            return;
        }

        // `before` stays ref-stable: `applyActiveCols` reassigns the order array wholesale.
        const before = this.columns;

        const newCols: AgColumn[] = [];
        for (let i = 0, keysLen = providedColKeys.length; i < keysLen; ++i) {
            const column = colModel.getNonPivotCol(providedColKeys[i]);
            if (column) {
                newCols.push(column);
            }
        }
        // Provided keys, hierarchy virtuals expanded before each source.
        const orderedSet = this.expandActiveCols(newCols);
        const orderedArr = Array.from(orderedSet);
        if (!this.stageChangedColsBetween(before, orderedArr)) {
            return; // identical membership + order — nothing to refresh or dispatch
        }
        this.applyActiveCols(before, orderedSet, orderedArr, source, true);
        colModel.flushColChanges(source, true); // membership change → refresh; defers when batched
    }

    /** Seat a col into `res`; base adds just the col, `OrderedColsService` seats its virtuals first. */
    protected seatActiveCol(res: Set<AgColumn>, col: AgColumn): void {
        res.add(col);
    }

    /** Expand to active order via {@link seatActiveCol}; dedupes into a fresh Set (insertion order = active order). */
    private expandActiveCols(cols: AgColumn[]): Set<AgColumn> {
        const res = new Set<AgColumn>();
        for (let i = 0, len = cols.length; i < len; ++i) {
            this.seatActiveCol(res, cols[i]);
        }
        return res;
    }

    /** Stage a membership/order change of one col: mark the set for re-index at flush + record for dispatch. */
    protected stageColChange(col: AgColumn): void {
        this.reindexPending = true;
        this.pendingColChangeSet().add(col);
    }

    /** {@link stageColChange} for several cols at once. */
    protected stageColChanges(changedCols: Iterable<AgColumn>): void {
        this.reindexPending = true;
        const pending = this.pendingColChangeSet();
        for (const col of changedCols) {
            pending.add(col);
        }
    }

    /** Record a col for the next {@link dispatchColChange} WITHOUT a re-index — for value-only changes that
     *  keep the active set/order unchanged (a `Set` dedupes the payload). */
    protected recordColChange(col: AgColumn): void {
        this.pendingColChangeSet().add(col);
    }

    private pendingColChangeSet(): Set<AgColumn> {
        let pending = this.pendingChanged;
        if (pending === null) {
            pending = new Set();
            this.pendingChanged = pending;
        }
        return pending;
    }

    /** Re-stamp active-col indexes once if a staged change moved the set; called by
     *  {@link ColumnModel.flushColChanges} before refresh/dispatch read the stamped positions. */
    public flushReindex(): void {
        if (this.reindexPending) {
            this.reindexPending = false;
            this.onColumnsChanged();
        }
    }

    /** Dispatch this service's staged change (if any); called by {@link ColumnModel.flushColChanges}. */
    public dispatchColChange(source: ColumnEventType): void {
        // Drain batched side-effects (rowGroup visibility) unconditionally, so they're never stranded.
        this.onColActiveChangesComplete(source);
        const pending = this.pendingChanged;
        if (pending) {
            this.pendingChanged = null;
            _dispatchColumnChangedEvent(this.eventSvc, this.eventName, Array.from(pending), source);
        }
    }

    public addColumns(keys: (ColKey | null | undefined)[] | undefined, source: ColumnEventType): void {
        this.updateColList(keys, true, source);
    }

    public removeColumns(keys: (ColKey | null | undefined)[] | undefined, source: ColumnEventType): void {
        this.updateColList(keys, false, source);
    }

    private updateColList(keys: (ColKey | null | undefined)[] | undefined, add: boolean, src: ColumnEventType): void {
        if (!keys || keys.length === 0) {
            return;
        }

        const colModel = this.colModel;
        const updatedCols = new Set<AgColumn>();
        const before = add ? null : this.columns; // order snapshot for the removal shift below
        let atLeastOne = false;

        for (let i = 0, len = keys.length; i < len; ++i) {
            const key = keys[i];
            if (!key) {
                continue;
            }
            const col = colModel.getNonPivotCol(key);
            if (!col) {
                continue;
            }
            updatedCols.add(col);

            if (this.setColActive(col, add, src, true)) {
                atLeastOne = true;
                if (!add) {
                    // Removed col: subsequent cols shift up — mark them for the event payload.
                    for (let j = before!.indexOf(col) + 1, blen = before!.length; j < blen; ++j) {
                        updatedCols.add(before![j]);
                    }
                }
            }
        }

        if (!atLeastOne) {
            return;
        }

        this.stageColChanges(updatedCols);
        colModel.flushColChanges(src, true); // membership change → refresh; defers when batched
    }

    /** Bucket one primary col for the pass; no-op if not in this role. `colIsNew` ⇒ `initial*` props apply. */
    public abstract extractCol(col: AgColumn, colIsNew: boolean): void;

    /** Finalise the pass: order the buckets, diff vs the previous active cols (flagging changes), re-seat,
     *  then release the buckets. */
    public commitExtract(source: ColumnEventType): void {
        const extractColsWithIndex = this.extractColsWithIndex;
        const extractColsWithValue = this.extractColsWithValue;
        const activeColSet = this.activeColSet;
        // Prior active cols, in prior order; flags still hold the OLD state until the diff below.
        const previousCols = this.columns;

        // Order: indexed cols (sorted), then prior-order value cols, then the rest. `Set` keeps order + dedupes.
        const res = new Set<AgColumn>();
        if (extractColsWithIndex !== null) {
            if (extractColsWithIndex.length > 1) {
                extractColsWithIndex.sort((a, b) => a.key - b.key);
            }
            for (let i = 0, len = extractColsWithIndex.length; i < len; ++i) {
                this.seatActiveCol(res, extractColsWithIndex[i].col);
            }
        }
        if (extractColsWithValue !== null) {
            // Existing value cols keep their prior order...
            for (let i = 0, len = previousCols.length; i < len; ++i) {
                const col = previousCols[i];
                if (extractColsWithValue.has(col)) {
                    this.seatActiveCol(res, col);
                }
            }
            // ...then newly-included value cols in col-def order.
            for (const col of extractColsWithValue) {
                if (!activeColSet.has(col)) {
                    this.seatActiveCol(res, col);
                }
            }
        }

        // Rebuild path (no side-effects); reuse `res` as the active set, array view materialises lazily.
        this.applyActiveCols(previousCols, res, null, source, false);
        this.onColumnsChanged();
        this.extractColsWithIndex = null;
        this.extractColsWithValue = null;
    }

    /** Record a col's target order index for {@link sortByPendingState} and mark the pass dirty. */
    protected recordPendingStateOrder(col: AgColumn, index: number): void {
        let idxMap = this.pendingStateOrder;
        if (idxMap === null) {
            idxMap = new Map();
            this.pendingStateOrder = idxMap;
        }
        idxMap.set(col, index);
        this.pendingStateChanged = true;
    }

    /** Re-order + re-stamp active cols when this apply changed membership/order; else keep insertion order. */
    public sortByPendingState(): void {
        if (!this.pendingStateChanged) {
            return;
        }
        this.pendingStateChanged = false;
        const cols = this.columns;
        if (cols.length > 0 && this.sortPendingCols(cols)) {
            this.resetActiveCols(cols);
        }
        this.onColumnsChanged();
        this.pendingStateOrder = null;
    }

    protected sortPendingCols(cols: AgColumn[]): boolean {
        if (this.pendingStateOrder) {
            cols.sort(this.compareByStateIndex);
            return true;
        }
        return false;
    }

    protected readonly compareByStateIndex = (a: AgColumn, b: AgColumn): number => {
        const indexes = this.pendingStateOrder;
        if (!indexes) {
            return 0;
        }
        const aIdx = indexes.get(a);
        const bIdx = indexes.get(b);
        if (aIdx == null) {
            return bIdx == null ? 0 : 1;
        }
        return bIdx == null ? -1 : aIdx - bIdx;
    };

    /** Apply one `ColumnState` entry to this service; ordered services share the impl, `valueColsSvc` overrides. */
    public abstract syncColState(
        column: AgColumn,
        stateItem: ColumnState | null,
        defaultState: ColumnStateParams | undefined,
        source: ColumnEventType
    ): void;
}
