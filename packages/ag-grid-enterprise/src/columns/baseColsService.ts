import { _areEqual, _indexMap } from 'ag-stack';

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
import { BeanStub } from 'ag-grid-community';

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
    private pendingChanged: Set<AgColumn> | null = null;

    /** Order index recorded per active col during the current state-apply pass; consumed by {@link sortByPendingState}. */
    protected pendingStateOrder: Map<AgColumn, number> | null = null;

    /** Set when the current state-apply pass changed membership/order → re-sort at {@link sortByPendingState}. */
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

    /** Active columns, in order. Never changed in place: a new array after a change to them, even one later undone. */
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
        this.stampActiveIndexes();
    }

    public replaceCol(old: AgColumn, col: AgColumn, source: ColumnEventType): void {
        const pending = this.pendingChanged;
        if (pending?.delete(old)) {
            pending.add(col);
        }
        if (!this.activeColSet.has(old)) {
            return;
        }
        const cols = this.columns.slice();
        cols[cols.indexOf(old)] = col;
        this.writeColActive(col, true, source);
        this.resetActiveCols(cols);
        this.stampActiveIndexes();
        this.recordColChange(col);
        this.colModel.stageColDispatch(source);
    }

    /** Stamps each active col's position (`rowGroupActiveIndex`, …), as each change to the active cols ends. */
    protected abstract stampActiveIndexes(): void;

    /** Diff `before`→`after`, staging every changed col straight into `pendingChanged` (no intermediate array,
     *  left null when nothing changed): `'none'` identical, `'reorder'` same set moved, `'membership'` added/removed. */
    private stageChangedColsBetween(before: AgColumn[], after: AgColumn[]): 'none' | 'membership' | 'reorder' {
        const afterIndex = _indexMap(after);
        const beforeSet = before.length > 0 ? new Set(before) : null;
        let pending: Set<AgColumn> | null = null;
        let membership = false;
        for (let i = 0, len = before.length; i < len; ++i) {
            const col = before[i];
            const newIndex = afterIndex.get(col);
            if (newIndex === undefined) {
                membership = true; // removed
                pending ??= this.pendingColChangeSet();
                pending.add(col);
            } else if (newIndex !== i) {
                pending ??= this.pendingColChangeSet(); // moved
                pending.add(col);
            }
        }
        for (let i = 0, len = after.length; i < len; ++i) {
            const col = after[i];
            if (!beforeSet?.has(col)) {
                membership = true; // added
                pending ??= this.pendingColChangeSet();
                pending.add(col);
            }
        }
        if (pending === null) {
            return 'none';
        }
        return membership ? 'membership' : 'reorder';
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
        const change = this.stageChangedColsBetween(before, orderedArr);
        if (change === 'none') {
            return; // identical membership + order — nothing to refresh or dispatch
        }
        colModel.beginColUpdate();
        try {
            this.applyActiveCols(before, orderedSet, orderedArr, source, true);
            colModel.stageColRefresh(source); // animated refresh, run when the update ends
            if (change === 'membership') {
                colModel.stageEverythingChanged(source); // a reorder keeps the set, so raises no legacy event
            }
        } finally {
            colModel.endColUpdate();
        }
    }

    /** Seat a col into `res` (`OrderedColsService` seats its hierarchy levels before it). */
    protected seatActiveCol(
        res: Set<AgColumn>,
        col: AgColumn,
        _provided: Set<AgColumn> | undefined,
        _asNewGrid: boolean,
        _newColDefs: boolean
    ): void {
        res.add(col);
    }

    /** Expand to active order via {@link seatActiveCol}; dedupes into a fresh Set (insertion order = active order). */
    private expandActiveCols(cols: AgColumn[]): Set<AgColumn> {
        const res = new Set<AgColumn>();
        const provided = new Set(cols);
        for (let i = 0, len = cols.length; i < len; ++i) {
            this.seatActiveCol(res, cols[i], provided, false, true);
        }
        return res;
    }

    /** Stages, in their order in `before`, the cols a removal moved: the first removed one and every one after it. */
    protected stageRemovedFrom(before: AgColumn[]): void {
        const active = this.activeColSet;
        const len = before.length;
        let i = 0;
        while (i < len && active.has(before[i])) {
            ++i;
        }
        this.stageColsFrom(before, i);
    }

    /** Records `cols` from `start` on, in their order, for the next {@link dispatchColChange}. */
    private stageColsFrom(cols: AgColumn[], start: number): void {
        const len = cols.length;
        if (start >= len) {
            return;
        }
        const pending = this.pendingColChangeSet();
        for (let i = start; i < len; ++i) {
            pending.add(cols[i]);
        }
    }

    /** Records a col for the next {@link dispatchColChange} (a `Set` dedupes the payload). */
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

    /** Dispatch this service's staged change (if any); called when the column update that staged it ends. */
    public dispatchColChange(source: ColumnEventType): void {
        const pending = this.pendingChanged;
        if (pending) {
            this.pendingChanged = null;
            this.colModel.dispatchColumnChangedEvent(this.eventName, Array.from(pending), source);
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
        // a removal reports the cols it moves up, so it needs the order before it
        const before = add ? null : this.columns;
        const sizeBefore = this.activeColSet.size;
        colModel.beginColUpdate();
        try {
            let changed = false;
            for (let i = 0, len = keys.length; i < len; ++i) {
                const key = keys[i];
                const col = key ? colModel.getNonPivotCol(key) : null;
                if (col && this.setColActive(col, add, src, true)) {
                    changed = true;
                }
            }
            if (!changed) {
                return;
            }
            if (before === null) {
                // activating only appends, so the added cols are the tail, in their order
                this.stageColsFrom(this.columns, sizeBefore);
            } else {
                this.stageRemovedFrom(before);
            }
            this.stampActiveIndexes();
            // add/remove → animated refresh, run when the update ends
            colModel.stageColRefresh(src);
            colModel.stageEverythingChanged(src);
        } finally {
            colModel.endColUpdate();
        }
    }

    /** Bucket one primary col for the pass; `colIsNew` ⇒ `initial*` apply; no `newColDefs`: an existing col stays. */
    public abstract extractCol(col: AgColumn, colIsNew: boolean, source: ColumnEventType, newColDefs: boolean): void;

    /** Finalise the pass: order the buckets, diff vs the previous active cols (flagging changes), re-seat,
     *  then release the buckets. */
    public commitExtract(source: ColumnEventType, asNewGrid: boolean, newColDefs: boolean): void {
        const extractColsWithIndex = this.extractColsWithIndex;
        const extractColsWithValue = this.extractColsWithValue;
        // Prior active cols, in prior order; flags still hold the OLD state until the diff below.
        const previousCols = this.columns;

        // Order: indexed cols (sorted), then prior-order value cols, then the rest. `Set` keeps order + dedupes.
        const res = new Set<AgColumn>();
        if (extractColsWithIndex !== null) {
            if (extractColsWithIndex.length > 1) {
                extractColsWithIndex.sort((a, b) => a.key - b.key);
            }
            for (let i = 0, len = extractColsWithIndex.length; i < len; ++i) {
                this.seatActiveCol(res, extractColsWithIndex[i].col, undefined, asNewGrid, newColDefs);
            }
        }
        if (extractColsWithValue !== null) {
            // Existing value cols keep their prior order (none as new)...
            for (let i = 0, len = asNewGrid ? 0 : previousCols.length; i < len; ++i) {
                const col = previousCols[i];
                if (extractColsWithValue.has(col)) {
                    this.seatActiveCol(res, col, undefined, false, newColDefs);
                }
            }
            // ...then newly-included value cols in col-def order.
            for (const col of extractColsWithValue) {
                if (!asNewGrid && res.has(col)) {
                    continue;
                }
                this.seatActiveCol(res, col, undefined, asNewGrid, newColDefs);
            }
        }

        // No side-effects; `res` becomes the active set; an unchanged result keeps the previous `columns` array.
        this.applyActiveCols(previousCols, res, isSameOrder(previousCols, res) ? previousCols : null, source, false);
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

    /** Ends a state pass: re-orders the active cols when it changed membership or order, then stamps them. */
    public sortByPendingState(_source: ColumnEventType): void {
        if (this.pendingStateChanged) {
            this.pendingStateChanged = false;
            const cols = this.columns;
            const sorted = cols.length > 0 ? this.sortPendingCols(cols) : null;
            if (sorted !== null && !_areEqual(sorted, cols)) {
                this.resetActiveCols(sorted);
            }
            this.pendingStateOrder = null;
        }
        this.stampActiveIndexes();
    }

    /** A sorted copy of `cols`, or null to keep their order; never sorts `cols`, which callers may hold. */
    protected sortPendingCols(cols: readonly AgColumn[]): AgColumn[] | null {
        return this.pendingStateOrder ? cols.slice().sort(this.compareByStateIndex) : null;
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

/** Whether `set` holds exactly `cols`, in the same order. */
const isSameOrder = (cols: readonly AgColumn[], set: ReadonlySet<AgColumn>): boolean => {
    if (cols.length !== set.size) {
        return false;
    }
    let i = 0;
    for (const col of set) {
        if (cols[i] !== col) {
            return false;
        }
        ++i;
    }
    return true;
};
