import type {
    AgColumn,
    AgProvidedColumnGroup,
    BeanCollection,
    ColDef,
    ColGroupDef,
    ColKey,
    ColumnEventType,
    ColumnModel,
    IPivotResultColsService,
    NamedBean,
    VisibleColsService,
} from 'ag-grid-community';
import {
    BeanStub,
    _areEqual,
    _createColumnTree,
    _createColumnTreeWithIds,
    _destroyColumnTree,
} from 'ag-grid-community';

export class PivotResultColsService extends BeanStub implements NamedBean, IPivotResultColsService {
    beanName = 'pivotResultCols' as const;

    private colModel: ColumnModel;
    private visibleCols: VisibleColsService;

    public wireBeans(beans: BeanCollection): void {
        this.colModel = beans.colModel;
        this.visibleCols = beans.visibleCols;
    }

    public pivotCols: AgColumn[] | null = null;
    public pivotTree: (AgColumn | AgProvidedColumnGroup)[] = [];
    public pivotTreeDepth = 0;
    /** Held between clear and the next apply so generated col instances are reused. */
    private savedPivotTree: (AgColumn | AgProvidedColumnGroup)[] | null = null;

    /** `undefined` = uncached, `null` = cached-but-empty. */
    private aggOrderedList: AgColumn[] | null | undefined;

    public isPivotResultColsPresent(): boolean {
        return this.pivotCols != null;
    }

    public lookupPivotResultCol(pivotKeys: string[], valueColKey: ColKey): AgColumn | null {
        const pivotCols = this.pivotCols;
        if (pivotCols == null) {
            return null;
        }
        const valueColumnToFind = this.colModel.getColDefCol(valueColKey);
        for (let i = 0, len = pivotCols.length; i < len; ++i) {
            const column = pivotCols[i];
            const colDef = column.colDef;
            if (colDef.pivotValueColumn === valueColumnToFind && _areEqual(colDef.pivotKeys, pivotKeys)) {
                return column;
            }
        }
        return null;
    }

    public getAggregationOrderedList(): AgColumn[] | null {
        const cached = this.aggOrderedList;
        if (cached !== undefined) {
            return cached;
        }
        const list = this.pivotCols;
        if (!list || list.length === 0) {
            this.aggOrderedList = null;
            return null;
        }
        // Partition: regular columns first (no pivotTotalColumnIds), totals appended after.
        // Aggregation requires this order because total columns read already-computed regular results.
        // Defer allocation: until a total is seen the input list is the right answer (returned by reference).
        let regular: AgColumn[] | null = null;
        let totals: AgColumn[] | null = null;
        for (let i = 0, len = list.length; i < len; ++i) {
            const col = list[i];
            if (col.colDef.pivotTotalColumnIds != null) {
                if (totals === null) {
                    totals = [];
                    regular = list.slice(0, i);
                }
                totals.push(col);
            } else if (regular !== null) {
                regular.push(col);
            }
        }
        const result = totals === null ? list : regular!.concat(totals);
        this.aggOrderedList = result;
        return result;
    }

    public setPivotResultCols(colDefs: (ColDef | ColGroupDef)[] | null, source: ColumnEventType): void {
        this.aggOrderedList = undefined;
        const colModel = this.colModel;
        if (!colModel.ready) {
            return;
        }
        if (colDefs) {
            this.processPivotResultColDef(colDefs);
            this.applyPivotResultColDefs(colDefs, source);
        } else if (this.pivotCols != null) {
            this.clearPivotResultCols(source);
        } else {
            return;
        }
        this.visibleCols.refresh(source);
    }

    /** Release pivot trees including any saved tree held over a clear/restore window. */
    public destroyTrees(): void {
        _destroyColumnTree(this.pivotTree);
        if (this.savedPivotTree) {
            _destroyColumnTree(this.savedPivotTree);
        }
    }

    /** Builds a new pivot result column tree from the supplied colDefs and refreshes display. */
    private applyPivotResultColDefs(colDefs: (ColDef | ColGroupDef)[], source: ColumnEventType): void {
        const beans = this.beans;
        // If the attempt has come from the API, can't guarantee the user has provided IDs.
        const createColTreeFunc = source === 'api' ? _createColumnTree : _createColumnTreeWithIds;
        const currentPivotTree = this.pivotCols ? this.pivotTree : null;
        // Restoring after clear when no current tree but savedPivotTree carries the prior cols.
        const restoring = currentPivotTree == null && this.savedPivotTree != null;
        const previousTree = currentPivotTree ?? this.savedPivotTree;
        const balanced = createColTreeFunc(beans, colDefs, false, previousTree ?? undefined, source);
        // Destroy nodes from the prior tree (current or saved) that weren't reused by `balanced`.
        // Using `previousTree` here — not `currentPivotTree` — covers the clear/restore window
        // where `currentPivotTree` is null but `savedPivotTree` still holds bean references.
        _destroyColumnTree(previousTree, balanced.columnTree);

        this.pivotCols = balanced.columns;
        this.pivotTree = balanced.columnTree;
        this.pivotTreeDepth = balanced.treeDepth;
        this.savedPivotTree = null;

        // `newColDefs=true` resets sticky col order; suppress when restoring pivot after a clear
        // so the prior column order is preserved.
        this.colModel.refreshCols(!restoring, source);
    }

    private clearPivotResultCols(source: ColumnEventType): void {
        this.savedPivotTree = this.pivotTree;
        this.pivotCols = null;
        this.pivotTree = [];
        this.pivotTreeDepth = 0;
        this.colModel.refreshCols(false, source);
    }

    private processPivotResultColDef(colDefs: (ColDef | ColGroupDef)[]): void {
        const columnCallback = this.gos.get('processPivotResultColDef');
        const groupCallback = this.gos.get('processPivotResultColGroupDef');
        if (columnCallback || groupCallback) {
            visitColDefs(colDefs, columnCallback, groupCallback);
        }
    }
}

const visitColDefs = (
    colDefs: (ColDef | ColGroupDef)[],
    columnCallback: ((colDef: ColDef) => void) | undefined,
    groupCallback: ((colGroupDef: ColGroupDef) => void) | undefined
): void => {
    for (let i = 0, len = colDefs.length; i < len; ++i) {
        const def = colDefs[i];
        const children = (def as ColGroupDef).children;
        if (children) {
            groupCallback?.(def as ColGroupDef);
            visitColDefs(children, columnCallback, groupCallback);
        } else {
            columnCallback?.(def);
        }
    }
};
