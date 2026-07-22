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
 *  ordering and hierarchy seating. (`valueColsSvc` uses `aggFunc`, so extends the base directly.)
 *  @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
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
        col.dispatchStateUpdatedEvent(this.enableProp);
        return true;
    }

    /** Hierarchy virtuals apply only to the ordered services — kept here so `BaseColsService` stays hierarchy-free. */
    private groupHierarchCols?: IGroupHierarchyColService;

    public override wireBeans(beans: BeanCollection): void {
        super.wireBeans(beans);
        this.groupHierarchCols = beans.groupHierarchyColSvc;
    }

    private getActiveHierarchyCols(): IGroupHierarchyColService | undefined {
        const svc = this.groupHierarchCols;
        return svc?.columns.length ? svc : undefined;
    }

    public override extractCol(col: AgColumn, colIsNew: boolean): void {
        const colDef = col.colDef;
        const indexProp = this.indexProp;
        const initialIndexProp = this.initialIndexProp;
        let include = decideExtractCol(colDef[this.enableProp], colDef[indexProp]);
        if (include === undefined) {
            // At extract time membership still reflects the prior state — the order set is the role-generic read.
            include = colIsNew
                ? decideExtractCol(colDef[this.initialEnableProp], colDef[initialIndexProp])
                : this.activeColSet.has(col);
        }
        if (!include) {
            return;
        }
        const key = colDef[indexProp] ?? (colIsNew ? colDef[initialIndexProp] : null);
        this.bucketByKey(col, key);
    }

    /** This col's hierarchy virtuals (date-part group levels) to seat immediately before it; undefined if none. */
    private getActiveVirtuals(column: AgColumn): AgColumn[] | undefined {
        return this.groupHierarchCols?.getVirtualCols(column);
    }

    /** Seat the col's hierarchy virtuals before it (bulk path; their flags are set later by the diff). */
    protected override seatActiveCol(res: Set<AgColumn>, col: AgColumn): void {
        const virtuals = this.getActiveVirtuals(col);
        if (virtuals !== undefined) {
            for (let i = 0, len = virtuals.length; i < len; ++i) {
                res.add(virtuals[i]);
            }
        }
        res.add(col);
    }

    /** Incremental activate also seats (and flags) the col's hierarchy virtuals before it. */
    protected override setColActive(
        col: AgColumn,
        active: boolean,
        source: ColumnEventType,
        runSideEffects = false
    ): boolean {
        if (active) {
            const virtuals = this.getActiveVirtuals(col);
            if (virtuals !== undefined) {
                const set = this.activeColSet;
                for (let i = 0, len = virtuals.length; i < len; ++i) {
                    const vc = virtuals[i];
                    set.add(vc);
                    this.writeColActive(vc, true, source);
                }
            }
        }
        return super.setColActive(col, active, source, runSideEffects);
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
        if (typeof idx === 'number') {
            // An explicit index can reorder an already-active col, so flag regardless of whether it flipped.
            this.setColActive(column, true, source);
            this.recordPendingStateOrder(column, idx);
        } else if (this.setColActive(column, !!enable, source)) {
            this.pendingStateChanged = true;
        }
    }

    /** Fold hierarchy ordering in front of the state-index sort; else fall back to the base index sort. */
    protected override sortPendingCols(cols: AgColumn[]): boolean {
        const hierarchy = this.getActiveHierarchyCols();
        if (hierarchy) {
            cols.sort((a, b) => hierarchy.compareVirtualColumns(a, b) ?? this.compareByStateIndex(a, b));
            return true;
        }
        return super.sortPendingCols(cols);
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

function decideExtractCol(value: boolean | null | undefined, index: number | null | undefined): boolean | undefined {
    if (value !== undefined) {
        return !!value;
    }
    if (index !== undefined) {
        return index !== null && index >= 0; // `null` clears; a negative index excludes
    }
    return undefined;
}
