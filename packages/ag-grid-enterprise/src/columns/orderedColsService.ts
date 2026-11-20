import type {
    AgColumn,
    BeanCollection,
    ColumnEventType,
    ColumnState,
    ColumnStateParams,
    IGroupHierarchyColService,
    IOrderedColsService,
} from 'ag-grid-community';

import { BaseColsService } from './baseColsService';

/** Index-ordered boolean-activation services (`rowGroupColsSvc`/`pivotColsSvc`); owns shared state-sync,
 *  ordering and hierarchy seating. (`valueColsSvc` uses `aggFunc`, so extends the base directly.) */
export abstract class OrderedColsService extends BaseColsService implements IOrderedColsService {
    // ColDef/ColumnState prop names for this role; `initial*` are the new-col fallbacks.
    protected abstract readonly enableProp: 'rowGroup' | 'pivot';
    protected abstract readonly indexProp: 'rowGroupIndex' | 'pivotIndex';
    protected abstract readonly initialEnableProp: 'initialRowGroup' | 'initialPivot';
    protected abstract readonly initialIndexProp: 'initialRowGroupIndex' | 'initialPivotIndex';

    /** Writes just this col's role flag (`rowGroupActive`/`pivotActive`), returning false if already set (no-op). */
    protected abstract setActiveFlag(col: AgColumn, active: boolean): boolean;

    /** Flag write + per-col events; only the flag field (via {@link setActiveFlag}) and `enableProp` differ per service. */
    protected override writeColActive(col: AgColumn, active: boolean, source: ColumnEventType): boolean {
        if (!this.setActiveFlag(col, active)) {
            return false;
        }
        col.dispatchColEvent(this.eventName, source);
        col.dispatchStateUpdatedEvent(this.enableProp, source);
        return true;
    }

    /** Hierarchy virtuals apply only to the ordered services — kept here so `BaseColsService` stays hierarchy-free. */
    private groupHierarchCols?: IGroupHierarchyColService;
    /** Hierarchy cols and sources the state pass sets this role on or off, each to whether the pass changed it. */
    private readonly stateDecided = new Map<AgColumn, boolean>();

    public override wireBeans(beans: BeanCollection): void {
        super.wireBeans(beans);
        this.groupHierarchCols = beans.groupHierarchyColSvc;
    }

    public override extractCol(col: AgColumn, colIsNew: boolean, _source: ColumnEventType, newColDefs: boolean): void {
        if (!this.willExtractCol(col, colIsNew, newColDefs)) {
            return;
        }
        if (!colIsNew && !newColDefs) {
            this.bucketByKey(col, null); // a rebuild keeps an existing col's place
            return;
        }
        const colDef = col.colDef;
        this.bucketByKey(col, colDef[this.indexProp] ?? (colIsNew ? colDef[this.initialIndexProp] : null));
    }

    public willExtractCol(col: AgColumn, colIsNew: boolean, newColDefs: boolean): boolean {
        if (!colIsNew && !newColDefs) {
            return this.activeColSet.has(col); // only definitions set again decide an existing col's role
        }
        const colDef = col.colDef;
        const include = decideExtractCol(colDef[this.enableProp], colDef[this.indexProp]);
        if (include !== undefined) {
            return include;
        }
        if (colIsNew) {
            return !!decideExtractCol(colDef[this.initialEnableProp], colDef[this.initialIndexProp]);
        }
        // Membership still holds the prior state here.
        if (!this.activeColSet.has(col)) {
            return false;
        }
        // A hierarchy level its own def leaves undecided follows its source when the source decides false.
        const source = col.derivedFromCol;
        return !source || decideExtractCol(source.colDef[this.enableProp], source.colDef[this.indexProp]) !== false;
    }

    /** Seats the col's levels before it: those `provided` names, else all, or only new ones unless new definitions
     *  set this role's flag or index on the col. */
    protected override seatActiveCol(
        res: Set<AgColumn>,
        col: AgColumn,
        provided: Set<AgColumn> | undefined,
        asNewGrid: boolean,
        newColDefs: boolean
    ): void {
        const virtuals = this.groupHierarchCols?.getVirtualCols(col);
        if (virtuals !== undefined && !choosesAnyLevel(virtuals, provided, undefined)) {
            const colDef = col.colDef;
            const keepLevels =
                !asNewGrid &&
                !provided &&
                (!newColDefs || decideExtractCol(colDef[this.enableProp], colDef[this.indexProp]) === undefined);
            const colModel = this.colModel;
            for (let i = 0, len = virtuals.length; i < len; ++i) {
                const level = virtuals[i];
                if (!keepLevels || colModel.isColNew(level)) {
                    res.add(level);
                }
            }
        }
        res.add(col);
    }

    /** Activating an inactive col also seats (and flags) its hierarchy virtuals before it, as `seatActiveCol` does. */
    protected override setColActive(
        col: AgColumn,
        active: boolean,
        source: ColumnEventType,
        runSideEffects = false
    ): boolean {
        const virtuals =
            active && !this.activeColSet.has(col) ? this.groupHierarchCols?.getVirtualCols(col) : undefined;
        if (virtuals !== undefined) {
            this.seatLevels(virtuals, source, undefined);
        }
        return super.setColActive(col, active, source, runSideEffects);
    }

    /** Seats `virtuals` but those in `excluded` (flags and per-col events); whether any was not seated already. */
    private seatLevels(
        virtuals: readonly AgColumn[],
        source: ColumnEventType,
        excluded: ReadonlyMap<AgColumn, boolean> | undefined
    ): boolean {
        let seated = false;
        for (let i = 0, len = virtuals.length; i < len; ++i) {
            const level = virtuals[i];
            if (!excluded?.has(level) && super.setColActive(level, true, source)) {
                seated = true;
            }
        }
        return seated;
    }

    public override syncColState(
        column: AgColumn,
        stateItem: ColumnState | null,
        defaultState: ColumnStateParams | undefined,
        source: ColumnEventType
    ): void {
        // Enable + index read as a unit: `stateItem` wins if it mentions either, else both fall back to `defaultState`.
        const enableProp = this.enableProp;
        const indexProp = this.indexProp;
        let enable = stateItem?.[enableProp];
        let idx = stateItem?.[indexProp];
        if (enable === undefined && idx === undefined) {
            if (defaultState) {
                enable = defaultState[enableProp];
                idx = defaultState[indexProp];
            }
            if (enable === undefined && idx === undefined) {
                return;
            }
        }
        // `super`: the pass seats hierarchy levels at its end, so the order of its items cannot change them.
        let changed = super.setColActive(column, typeof idx === 'number' || !!enable, source);
        if (typeof idx === 'number') {
            // An explicit index can reorder an already-active col: a change whether or not it flipped.
            this.recordPendingStateOrder(column, idx);
            changed = true;
        }
        this.pendingStateChanged ||= changed;
        if (column.colKind === 'hierarchy' || this.groupHierarchCols?.getVirtualCols(column) !== undefined) {
            const decided = this.stateDecided;
            decided.set(column, changed || decided.get(column) === true);
        }
    }

    /** Ends a state pass: a source it activated without its levels gets every level it left unset, then the sort. */
    public override sortByPendingState(source: ColumnEventType): void {
        const { stateDecided: decided, activeColSet: active, groupHierarchCols } = this;
        for (const col of decided.keys()) {
            const virtuals = active.has(col) ? groupHierarchCols?.getVirtualCols(col) : undefined;
            if (
                virtuals !== undefined &&
                !choosesAnyLevel(virtuals, decided, active) &&
                this.seatLevels(virtuals, source, decided)
            ) {
                decided.set(col, true);
                this.pendingStateChanged = true;
            }
        }
        super.sortByPendingState(source);
        decided.clear();
    }

    /** A hierarchy col without an index sorts before its active source col if the pass changed either, else stays. */
    protected override sortPendingCols(cols: readonly AgColumn[]): AgColumn[] | null {
        const hierarchy = this.groupHierarchCols;
        if (!hierarchy?.columns.length) {
            return super.sortPendingCols(cols);
        }
        const { activeColSet, pendingStateOrder, stateDecided } = this;
        // Groups by first member (stable sort); a joining hierarchy col is in its source's group.
        const groups = new Set<AgColumn>();
        for (let i = 0, len = cols.length; i < len; ++i) {
            const col = cols[i];
            const source = col.colKind === 'hierarchy' ? col.derivedFromCol : null;
            const joins =
                source !== null &&
                activeColSet.has(source) &&
                !pendingStateOrder?.has(col) &&
                (stateDecided.get(source) === true || stateDecided.get(col) === true);
            groups.add(joins ? source : col);
        }
        const heads = Array.from(groups).sort(this.compareByStateIndex);
        const res: AgColumn[] = [];
        for (let i = 0, len = heads.length; i < len; ++i) {
            const head = heads[i];
            const virtuals = hierarchy.getVirtualCols(head);
            if (virtuals) {
                for (let j = 0, vLen = virtuals.length; j < vLen; ++j) {
                    const level = virtuals[j];
                    if (activeColSet.has(level) && !groups.has(level)) {
                        res.push(level);
                    }
                }
            }
            res.push(head);
        }
        return res;
    }

    /** Stamps synthetic `indexProp` onto `incoming`/`accumulator` so a `cellDataType`-inferred rowGroup/pivot
     *  flip keeps the original primary-col order (new cols slot in at their col-def position). */
    public restoreColumnOrder(
        incoming: { [colId: string]: ColumnState },
        accumulator: { [colId: string]: ColumnState }
    ): void {
        const colList = this.columns;
        if (!colList.length) {
            return;
        }
        const isRowGroup = this.enableProp === 'rowGroup';
        const indexProp = this.indexProp;

        // `newColIds`: incoming colIds minus those already in `colList` — i.e. not-yet-known ones.
        const newColIds = new Set(Object.keys(incoming));
        const allColIds = new Set(newColIds);
        for (let i = 0, len = colList.length; i < len; ++i) {
            const colId = colList[i].colId;
            newColIds.delete(colId);
            allColIds.add(colId);
        }

        const colIdsInOriginalOrder: string[] = [];
        const originalOrderMap: { [colId: string]: number } = Object.create(null);
        let orderIndex = 0;
        const primaryCols = this.colModel.colDefList;
        for (let i = 0, len = primaryCols.length; i < len; ++i) {
            const colId = primaryCols[i].colId;
            if (allColIds.has(colId)) {
                colIdsInOriginalOrder.push(colId);
                originalOrderMap[colId] = orderIndex++;
            }
        }

        // follow approach in `resetColumnState`
        let index = 1000;
        let hasAddedNewCols = false;
        let lastIndex = 0;

        const processPrecedingNewCols = (colId: string): void => {
            const originalOrderIndex = originalOrderMap[colId];
            for (let i = lastIndex; i < originalOrderIndex; ++i) {
                const newColId = colIdsInOriginalOrder[i];
                if (newColIds.has(newColId)) {
                    incoming[newColId][indexProp] = index++;
                    newColIds.delete(newColId);
                }
            }
            lastIndex = originalOrderIndex;
        };

        for (let c = 0, cLen = colList.length; c < cLen; ++c) {
            const column = colList[c];
            const colId = column.colId;
            // Already in `incoming`? Its entries always carry a non-null colId, so this is the presence test.
            if (incoming[colId]?.colId != null) {
                // Already in incoming — place any new cols that slot before it, then assign next index.
                processPrecedingNewCols(colId);
                incoming[colId][indexProp] = index++;
                continue;
            }
            const colDef = column.colDef;
            const idx = isRowGroup ? colDef.rowGroupIndex : colDef.pivotIndex;
            const initialIdx = isRowGroup ? colDef.initialRowGroupIndex : colDef.initialPivotIndex;
            if (idx === null || (idx === undefined && initialIdx == null)) {
                if (!hasAddedNewCols) {
                    const value = isRowGroup ? colDef.rowGroup : colDef.pivot;
                    const initialValue = isRowGroup ? colDef.initialRowGroup : colDef.initialPivot;
                    const propEnabled = value || (value === undefined && initialValue);
                    if (propEnabled) {
                        processPrecedingNewCols(colId);
                    } else {
                        // First manually added col — place all remaining new cols now, by original order index (needn't be contiguous).
                        for (const newColId of newColIds) {
                            incoming[newColId][indexProp] = index + originalOrderMap[newColId];
                        }
                        index += colIdsInOriginalOrder.length;
                        hasAddedNewCols = true;
                    }
                }
                if (!accumulator[colId]) {
                    accumulator[colId] = { colId };
                }
                accumulator[colId][indexProp] = index++;
            }
        }
    }
}

/** Whether `chosen` holds one of a source's levels (and `active`, if given): then its levels are those, else all. */
function choosesAnyLevel(
    virtuals: readonly AgColumn[],
    chosen: ReadonlySet<AgColumn> | ReadonlyMap<AgColumn, boolean> | undefined,
    active: ReadonlySet<AgColumn> | undefined
): boolean {
    if (!chosen) {
        return false;
    }
    for (let i = 0, len = virtuals.length; i < len; ++i) {
        const level = virtuals[i];
        if (chosen.has(level) && (active === undefined || active.has(level))) {
            return true;
        }
    }
    return false;
}

function decideExtractCol(value: boolean | null | undefined, index: number | null | undefined): boolean | undefined {
    if (value !== undefined) {
        return !!value;
    }
    if (index !== undefined) {
        return index !== null && index >= 0; // `null` clears; a negative index excludes
    }
    return undefined;
}
