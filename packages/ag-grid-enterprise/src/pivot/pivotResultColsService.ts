import type {
    AgColumn,
    AgProvidedColumnGroup,
    ColDef,
    ColGroupDef,
    ColKey,
    ColumnEventType,
    IPivotResultColsService,
    NamedBean,
} from 'ag-grid-community';
import {
    BeanStub,
    _areEqual,
    _createColumnTree,
    _createColumnTreeWithIds,
    _destroyColumnTree,
    _getColumnsFromTree,
} from 'ag-grid-community';

export class PivotResultColsService extends BeanStub implements NamedBean, IPivotResultColsService {
    beanName = 'pivotResultCols' as const;

    /** The pivot result column tree, or null when not pivoting. */
    public pivotTree: (AgColumn | AgProvidedColumnGroup)[] | null = null;
    public pivotTreeDepth = 0;

    /** Leaf columns lazily derived from pivotTree. Invalidated when pivotTree changes. */
    private cachedPivotCols: AgColumn[] | null = null;

    /**
     * Aggregation-ordered column list: regular columns first, total columns after.
     * `undefined` means stale (needs rebuild), `null` means no pivot columns exist.
     */
    private cachedAggOrderedList: AgColumn[] | null | undefined;

    /** Lazy colId→column lookup. Cleared when pivot columns change, rebuilt on first miss. */
    private readonly pivotColsById = new Map<string, AgColumn>();

    /** Saved when pivot is disabled so columns can be reused when pivot is restored. */
    private previousPivotTree: (AgColumn | AgProvidedColumnGroup)[] | null = null;

    /** Leaf pivot columns, lazily derived from pivotTree. Undefined when not pivoting. */
    public get pivotCols(): AgColumn[] | undefined {
        const tree = this.pivotTree;
        if (!tree) {
            return undefined;
        }
        return (this.cachedPivotCols ??= _getColumnsFromTree(tree));
    }

    public override destroy(): void {
        _destroyColumnTree(this.beans, this.pivotTree);
        this.pivotTree = null;
        this.cachedPivotCols = null;
        this.previousPivotTree = null;
        this.cachedAggOrderedList = undefined;
        this.pivotColsById.clear();
        super.destroy();
    }

    /** Finds a pivot result column whose pivotKeys and pivotValueColumn match the given arguments. */
    public lookupPivotResultCol(pivotKeys: string[], valueColKey: ColKey): AgColumn | null {
        const list = this.pivotCols;
        if (!list) {
            return null;
        }
        const valueColumnToFind = this.beans.colModel.getColDefCol(valueColKey);
        for (let i = 0, len = list.length; i < len; ++i) {
            const col = list[i];
            const colDef = col.getColDef();
            if (_areEqual(colDef.pivotKeys, pivotKeys) && colDef.pivotValueColumn === valueColumnToFind) {
                return col;
            }
        }
        return null;
    }

    /** Looks up a pivot result column by colId. Uses lazy Map for O(1) repeat lookups. */
    public getPivotResultCol(colId: string): AgColumn | null {
        return this.pivotColsById.get(colId) ?? this.rebuildPivotColsMap(colId);
    }

    /**
     * Returns pivot columns ordered for aggregation: regular columns first, total columns after.
     * Aggregation requires this order because total columns read from already-computed regular results.
     * Lazily computed and cached; invalidated when pivot result columns change.
     */
    public getAggregationOrderedList(): AgColumn[] | null {
        return this.cachedAggOrderedList !== undefined ? this.cachedAggOrderedList : this.buildAggOrderedList();
    }

    /**
     * Sets or clears pivot result columns and triggers a full column refresh.
     * When colDefs is non-null, builds a new pivot column tree (reusing the previous tree for ID stability).
     * When colDefs is null, saves the current tree for later reuse and clears pivot state.
     */
    public setPivotResultCols(colDefs: (ColDef | ColGroupDef)[] | null, source: ColumnEventType): void {
        this.invalidateCaches();

        const beans = this.beans;
        const colModel = beans.colModel;

        if (!colModel.ready || (colDefs == null && this.pivotTree == null)) {
            return;
        }

        let newColDefs = false;
        if (colDefs) {
            this.processPivotResultColDef(colDefs);

            // When called from the API, user may not have provided IDs — fall back to auto-generated IDs
            const createTreeFn = source === 'api' ? _createColumnTree : _createColumnTreeWithIds;
            const treeResult = createTreeFn(
                beans,
                colDefs,
                false,
                this.pivotTree || this.previousPivotTree || undefined,
                source
            );
            _destroyColumnTree(beans, this.pivotTree, treeResult.columnTree);

            this.pivotTree = treeResult.columnTree;
            this.pivotTreeDepth = treeResult.treeDepth;
            newColDefs = !this.previousPivotTree;
            this.previousPivotTree = null;
        } else {
            this.previousPivotTree = this.pivotTree;
            this.pivotTree = null;
            this.pivotTreeDepth = 0;
        }

        colModel.invalidateAllColsCache();
        colModel.refreshCols(newColDefs, source);
        beans.visibleCols.refresh(source);
    }

    private invalidateCaches(): void {
        this.cachedAggOrderedList = undefined;
        this.pivotColsById.clear();
        this.cachedPivotCols = null;
    }

    /** Rebuilds the colId→column Map on first miss after invalidation. */
    private rebuildPivotColsMap(colId: string): AgColumn | null {
        const list = this.pivotCols;
        if (!list) {
            return null;
        }
        const map = this.pivotColsById;
        if (map.size === 0 && list.length > 0) {
            for (let i = 0, len = list.length; i < len; ++i) {
                map.set(list[i].colId, list[i]);
            }
        }
        return map.get(colId) ?? null;
    }

    /**
     * Partitions pivot columns: regular columns first, total columns after.
     * Zero allocation when no totals exist (returns the original list).
     */
    private buildAggOrderedList(): AgColumn[] | null {
        const list = this.pivotCols;
        if (!list || list.length === 0) {
            this.cachedAggOrderedList = null;
            return null;
        }
        let result: AgColumn[] | undefined;
        let totals: AgColumn[] | undefined;
        for (let i = 0, len = list.length; i < len; ++i) {
            const col = list[i];
            if (col.colDef.pivotTotalColumnIds) {
                if (totals) {
                    totals.push(col);
                } else {
                    result = list.slice(0, i);
                    totals = [col];
                }
            } else if (result) {
                result.push(col);
            }
        }
        if (!result) {
            this.cachedAggOrderedList = list;
            return list;
        }
        for (let i = 0, len = totals!.length; i < len; ++i) {
            result.push(totals![i]);
        }
        this.cachedAggOrderedList = result;
        return result;
    }

    /** Invokes user-provided processPivotResultColDef/processPivotResultColGroupDef callbacks. */
    private processPivotResultColDef(colDefs: (ColDef | ColGroupDef)[]): void {
        const processPivotResultColDef = this.gos.get('processPivotResultColDef');
        const processPivotResultColGroupDef = this.gos.get('processPivotResultColGroupDef');
        if (!processPivotResultColDef && !processPivotResultColGroupDef) {
            return;
        }
        const walk = (defs: (ColDef | ColGroupDef)[]): void => {
            for (let i = 0, len = defs.length; i < len; ++i) {
                const def = defs[i];
                const children = (def as ColGroupDef).children;
                if (children) {
                    processPivotResultColGroupDef?.(def as ColGroupDef);
                    walk(children);
                } else {
                    processPivotResultColDef?.(def as ColDef);
                }
            }
        };
        walk(colDefs);
    }
}
