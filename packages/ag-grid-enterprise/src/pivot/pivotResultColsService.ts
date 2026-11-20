import { _areEqual, _pushToMapArray } from 'ag-stack';

import type {
    AgColumn,
    BeanCollection,
    ColDef,
    ColGroupDef,
    ColKey,
    ColumnEventType,
    ColumnModel,
    ColumnTreeBuild,
    IPivotResultColsService,
    NamedBean,
    VisibleColsService,
} from 'ag-grid-community';
import { BeanStub, _buildColumnTree, _destroyColumnTreeAll, _finalizeColumnTree } from 'ag-grid-community';

export class PivotResultColsService extends BeanStub implements NamedBean, IPivotResultColsService {
    beanName = 'pivotResultCols' as const;

    private colModel: ColumnModel;
    private visibleCols: VisibleColsService;

    public wireBeans(beans: BeanCollection): void {
        this.colModel = beans.colModel;
        this.visibleCols = beans.visibleCols;
    }

    public pivotCols: AgColumn[] | null = null;
    public pivotBuild: ColumnTreeBuild | null = null;
    /** Source value col → `pivotBuild`'s cols derived from it; `null` till the first lookup after a build. */
    private dependentsByValueCol: Map<AgColumn, AgColumn[]> | null = null;
    /** The colDefs last passed to `setPivotResultColumns`, exactly as the application supplied them; `null` when
     *  the grid generated the current pivot result cols itself. Held so {@link resortPivotResultCols} can re-derive
     *  the order on a `pivotSort` change, and so `pivotSort: null` resolves back to the supplied order rather than
     *  to whatever the last direction produced. Never mutated - it is the application's array. */
    public suppliedColDefs: (ColDef | ColGroupDef)[] | null = null;

    /** `undefined` = uncached, `null` = cached-but-empty. */
    private aggOrderedList: AgColumn[] | null | undefined;

    public lookupPivotResultCol(pivotKeys: string[], valueColKey: ColKey): AgColumn | null {
        const pivotCols = this.pivotCols;
        if (pivotCols == null) {
            return null;
        }
        const valueColumnToFind = this.colModel.getNonPivotCol(valueColKey);
        for (let i = 0, len = pivotCols.length; i < len; ++i) {
            const column = pivotCols[i];
            if (column.pivotValueColumn === valueColumnToFind && _areEqual(column.colDef.pivotKeys, pivotKeys)) {
                return column;
            }
        }
        return null;
    }

    public getAggregationOrderedList(): AgColumn[] | null {
        const aggOrderedList = this.aggOrderedList;
        return aggOrderedList !== undefined ? aggOrderedList : this.loadAggregationOrderedList();
    }

    public buildAllCols(): AgColumn[] {
        // Displayed cols in display order, then any parked primaries.
        const parked = this.collectParkedPrimaries();
        const colsList = this.colModel.colsList;
        return parked === null ? colsList : colsList.concat(parked); // no parked → colsList is the full set (no alloc)
    }

    public buildColsInStateOrder(): AgColumn[] {
        // Parked primaries first, then the displayed cols in display order.
        const parked = this.collectParkedPrimaries();
        const colsList = this.colModel.colsList;
        if (parked === null) {
            return colsList; // no parked → colsList is already the full order (no alloc)
        }
        for (let i = 0, len = colsList.length; i < len; ++i) {
            parked.push(colsList[i]);
        }
        return parked;
    }

    /** Primaries in `colsById` but not `colsList` (hidden/parked), in col-def order; `null` if there are none. */
    private collectParkedPrimaries(): AgColumn[] | null {
        const colDefList = this.colModel.colDefList;
        let parked: AgColumn[] | null = null;
        for (let i = 0, len = colDefList.length; i < len; ++i) {
            const col = colDefList[i];
            if (!col.inColsList) {
                parked ??= [];
                parked.push(col);
            }
        }
        return parked;
    }

    private loadAggregationOrderedList(): AgColumn[] | null {
        const list = this.pivotCols;
        if (!list || list.length === 0) {
            this.aggOrderedList = null;
            return null;
        }
        // Regular cols first, totals after: totals read already-computed regular results during
        // aggregation. Defer allocation — until a total is seen the input list is correct (returned by ref).
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

    public setPivotResultCols(
        colDefs: (ColDef | ColGroupDef)[] | null,
        source: ColumnEventType,
        appSupplied?: boolean
    ): void {
        this.aggOrderedList = undefined;
        const colModel = this.colModel;
        if (!colModel.ready) {
            return;
        }
        if (!colDefs && this.pivotCols == null) {
            this.suppliedColDefs = null;
            return;
        }
        colModel.beginColUpdate();
        try {
            if (colDefs) {
                this.processPivotResultColDef(colDefs);
                if (appSupplied) {
                    this.suppliedColDefs = colDefs;
                    this.applyPivotResultColDefs(this.orderColDefs(colDefs), source, true);
                } else {
                    // Generated colDefs arrive already ordered (row totals included), and own the order from here.
                    this.suppliedColDefs = null;
                    this.applyPivotResultColDefs(colDefs, source, false);
                }
            } else {
                this.suppliedColDefs = null;
                this.clearPivotResultCols(source);
            }
            this.visibleCols.refresh(source, false);
        } finally {
            colModel.endColUpdate();
        }
    }

    /** Re-order the applied pivot result columns for the pivot columns' current `pivotSort`. Lets pill sorting
     *  reach application-supplied columns, which no `createColDefsFromFields` pass regenerates. */
    public resortPivotResultCols(source: ColumnEventType): void {
        const suppliedColDefs = this.suppliedColDefs;
        if (!suppliedColDefs) {
            return;
        }
        this.aggOrderedList = undefined;
        const colModel = this.colModel;
        colModel.beginColUpdate();
        try {
            // Always re-derived from the supplied order, so "no sort" resolves to it rather than to the last direction.
            this.applyPivotResultColDefs(this.orderColDefs(suppliedColDefs), source, false);
            this.visibleCols.refresh(source, false);
        } finally {
            colModel.endColUpdate();
        }
    }

    private orderColDefs(colDefs: (ColDef | ColGroupDef)[]): (ColDef | ColGroupDef)[] {
        return this.beans.pivotColDefSvc?.orderPivotResultColDefs(colDefs) ?? colDefs;
    }

    public override destroy(): void {
        // Release the last build's cols/groups, held over a clear too.
        const build = this.pivotBuild;
        this.pivotCols = null;
        this.pivotBuild = null;
        this.dependentsByValueCol = null;
        if (build) {
            _destroyColumnTreeAll(build.columns, build.allGroups);
        }
        super.destroy();
    }

    /** Builds the pivot result tree and refreshes; `newColDefs`: from the application, so kept cols re-apply state. */
    private applyPivotResultColDefs(
        colDefs: (ColDef | ColGroupDef)[],
        source: ColumnEventType,
        newColDefs: boolean
    ): void {
        const beans = this.beans;
        const previous = this.pivotBuild;
        const restoring =
            this.pivotCols == null && previous != null && !(beans.pivotColsSvc?.isStrictColumnOrder() ?? false);
        const balanced = _buildColumnTree(
            beans,
            /* defs */ colDefs,
            /* primaryColumns */ false,
            /* previous */ previous,
            /* source */ source,
            /* newColDefs */ newColDefs,
            /* wrapperCache */ null
        );
        // `previous` covers the clear/restore window too, where `pivotCols` is null but its columns survive.
        _finalizeColumnTree(balanced, previous);

        this.pivotCols = balanced.columns;
        this.pivotBuild = balanced;
        this.dependentsByValueCol = null;

        // refreshCols(true) resets sticky col order; false when restoring after a clear keeps it.
        this.colModel.refreshCols(!restoring, source);
    }

    private clearPivotResultCols(source: ColumnEventType): void {
        this.pivotCols = null; // `pivotBuild` is kept, so the next apply reuses its columns
        this.colModel.refreshCols(false, source);
    }

    public recreateColDefsForSource(sourceCol: AgColumn, source: ColumnEventType): void {
        const deps = this.dependentsOf(sourceCol);
        const pivotColDefSvc = this.beans.pivotColDefSvc;
        if (deps === undefined || !pivotColDefSvc) {
            return;
        }
        for (let i = 0, len = deps.length; i < len; ++i) {
            const pivotCol = deps[i];
            const newColDef = pivotColDefSvc.recreateColDef(pivotCol.colDef);
            pivotCol.setColDef(newColDef, newColDef, source);
        }
    }

    public onValueColRenamed(valueCol: AgColumn, source: ColumnEventType): void {
        const colModel = this.colModel;
        if (
            this.suppliedColDefs ||
            !this.pivotCols ||
            !colModel.isPivotActive() ||
            this.dependentsOf(valueCol) === undefined
        ) {
            return;
        }
        const change = colModel.rowsChange;
        change.columns = true;
        change.pivotResultNames = true;
        change.pivotSource = source;
    }

    public reapplyStateForSource(sourceCol: AgColumn, source: ColumnEventType): void {
        const deps = this.dependentsOf(sourceCol);
        if (deps === undefined) {
            return;
        }
        for (let i = 0, len = deps.length; i < len; ++i) {
            deps[i].applyColDefState(undefined, source); // shown when created, then as the user leaves it
        }
    }

    /** The pivot result cols of the last build derived from `sourceCol`, also while kept across a clear. */
    private dependentsOf(sourceCol: AgColumn): AgColumn[] | undefined {
        const cols = this.pivotBuild?.columns;
        if (cols == null) {
            return undefined;
        }
        let map = this.dependentsByValueCol;
        if (map === null) {
            map = new Map<AgColumn, AgColumn[]>();
            for (let i = 0, len = cols.length; i < len; ++i) {
                const pivotCol = cols[i];
                const src = pivotCol.pivotValueColumn as AgColumn | null | undefined;
                if (src == null) {
                    continue;
                }
                _pushToMapArray(map, src, pivotCol);
            }
            this.dependentsByValueCol = map;
        }
        return map.get(sourceCol);
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
