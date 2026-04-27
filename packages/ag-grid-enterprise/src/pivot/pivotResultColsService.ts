import type {
    AbstractColDef,
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
    _ColumnCollections,
} from 'ag-grid-community';
import {
    BeanStub,
    _areEqual,
    _createColumnTree,
    _createColumnTreeWithIds,
    _destroyColumnTree,
    _exists,
    _getColumnsFromTree,
} from 'ag-grid-community';

export class PivotResultColsService extends BeanStub implements NamedBean, IPivotResultColsService {
    beanName = 'pivotResultCols' as const;

    private colModel: ColumnModel;
    private visibleCols: VisibleColsService;

    public wireBeans(beans: BeanCollection): void {
        this.colModel = beans.colModel;
        this.visibleCols = beans.visibleCols;
    }

    // if pivoting, these are the generated columns as a result of the pivot
    private pivotResultCols: _ColumnCollections | null;

    // Cached aggregation-ordered list: regular columns first, total columns after.
    // Lazily computed on first access, invalidated when pivot result columns change.
    private aggOrderedList: AgColumn[] | null | undefined;

    // Saved when pivot is disabled, available to re-use when pivot is restored
    private previousPivotResultCols: (AgColumn | AgProvidedColumnGroup)[] | null;

    public override destroy(): void {
        _destroyColumnTree(this.beans, this.pivotResultCols?.tree);
        super.destroy();
    }

    public isPivotResultColsPresent(): boolean {
        return this.pivotResultCols != null;
    }

    public lookupPivotResultCol(pivotKeys: string[], valueColKey: ColKey): AgColumn | null {
        if (this.pivotResultCols == null) {
            return null;
        }

        const valueColumnToFind = this.colModel.getColDefCol(valueColKey);

        let foundColumn: AgColumn | null = null;

        for (const column of this.pivotResultCols.list) {
            const colDef = column.colDef;
            const thisPivotKeys = colDef.pivotKeys;
            const pivotValueColumn = colDef.pivotValueColumn;

            const pivotKeyMatches = _areEqual(thisPivotKeys, pivotKeys);
            const pivotValueMatches = pivotValueColumn === valueColumnToFind;

            if (pivotKeyMatches && pivotValueMatches) {
                foundColumn = column;
            }
        }

        return foundColumn;
    }

    public getPivotResultCols(): _ColumnCollections | null {
        return this.pivotResultCols;
    }

    public getPivotResultCol(key: ColKey): AgColumn | null {
        if (!this.pivotResultCols) {
            return null;
        }
        return this.colModel.getColFromCollection(key, this.pivotResultCols);
    }

    public getAggregationOrderedList(): AgColumn[] | null {
        let result = this.aggOrderedList;
        if (result !== undefined) {
            return result;
        }
        const list = this.pivotResultCols?.list;
        if (!list || list.length === 0) {
            this.aggOrderedList = null;
            return null;
        }
        // Partition: regular columns first (no pivotTotalColumnIds), totals appended after.
        // Aggregation requires this order because total columns read from already-computed regular results.
        let hasAnyTotals = false;
        for (let i = 0; i < list.length; ++i) {
            const colDef = list[i].colDef;
            if (colDef.pivotTotalColumnIds != null) {
                hasAnyTotals = true;
                break;
            }
        }
        if (!hasAnyTotals) {
            // No totals — the list is already in the right order.
            result = list;
        } else {
            const regular: AgColumn[] = [];
            const totals: AgColumn[] = [];
            for (let i = 0; i < list.length; ++i) {
                const col = list[i];
                if (col.colDef.pivotTotalColumnIds != null) {
                    totals.push(col);
                } else {
                    regular.push(col);
                }
            }
            result = regular.concat(totals);
        }
        this.aggOrderedList = result;
        return result;
    }

    public setPivotResultCols(
        colDefs: (ColDef | ColGroupDef)[] | null,
        source: ColumnEventType,
        useGeneratedOrder: boolean = false
    ): void {
        this.aggOrderedList = undefined; // Invalidate cached aggregation order
        if (!this.colModel.ready) {
            return;
        }

        // if no cols passed, and we had no cols anyway, then do nothing
        if (colDefs == null && this.pivotResultCols == null) {
            return;
        }

        if (colDefs) {
            this.processPivotResultColDef(colDefs);
            // if the attempt has come from the API, can't guarantee the user has provided IDs.
            const createColTreeFunc = source === 'api' ? _createColumnTree : _createColumnTreeWithIds;
            const balancedTreeResult = createColTreeFunc(
                this.beans,
                colDefs,
                false,
                this.pivotResultCols?.tree || this.previousPivotResultCols || undefined,
                source
            );
            _destroyColumnTree(this.beans, this.pivotResultCols?.tree, balancedTreeResult.columnTree);

            const tree = balancedTreeResult.columnTree;
            const treeDepth = balancedTreeResult.treeDepth;
            const list = _getColumnsFromTree(tree);
            const map = {};

            this.pivotResultCols = { tree, treeDepth, list, map };
            for (const col of this.pivotResultCols.list) {
                this.pivotResultCols.map[col.getId()] = col;
            }
            const hasPreviousCols = !!this.previousPivotResultCols;
            this.previousPivotResultCols = null;
            this.colModel.refreshCols(!hasPreviousCols, source, useGeneratedOrder);
        } else {
            this.previousPivotResultCols = this.pivotResultCols ? this.pivotResultCols.tree : null;
            this.pivotResultCols = null;

            this.colModel.refreshCols(false, source);
        }
        this.visibleCols.refresh(source);
    }

    private processPivotResultColDef(colDefs: (ColDef | ColGroupDef)[] | null) {
        const columnCallback = this.gos.get('processPivotResultColDef');
        const groupCallback = this.gos.get('processPivotResultColGroupDef');

        if (!columnCallback && !groupCallback) {
            return undefined;
        }

        const searchForColDefs = (colDefs2: (ColDef | ColGroupDef)[]): void => {
            colDefs2.forEach((abstractColDef: AbstractColDef) => {
                const isGroup = _exists((abstractColDef as any).children);
                if (isGroup) {
                    const colGroupDef = abstractColDef as ColGroupDef;
                    if (groupCallback) {
                        groupCallback(colGroupDef);
                    }
                    searchForColDefs(colGroupDef.children);
                } else {
                    const colDef = abstractColDef as ColDef;
                    if (columnCallback) {
                        columnCallback(colDef);
                    }
                }
            });
        };

        if (colDefs) {
            searchForColDefs(colDefs);
        }
    }
}
