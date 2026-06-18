import { _areEqual, _pushToMapArray } from 'ag-stack';

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
import { BeanStub, _buildColumnTree, _destroyColumnTreeAll, _destroyColumnTreeUnused } from 'ag-grid-community';

type SavedPivotCols = {
    tree: (AgColumn | AgProvidedColumnGroup)[];
    cols: AgColumn[] | null;
    groups: AgProvidedColumnGroup[];
};

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
    /** Source value col → pivot result cols derived from it; lazily built on first `recreateColDefsForSource`
     *  after a rebuild (`null` ⇒ needs rebuild), so a rebuild with no value-col def change skips the O(N) walk. */
    private dependentsByValueCol: Map<AgColumn, AgColumn[]> | null = null;
    /** True iff any `pivotTree` group carries `marryChildren`; `ColumnModel` reads it while pivoting. */
    public pivotHasMarryChildren = false;
    /** Non-padding groups in `pivotTree`, keyed by `groupId`. Built by `_buildColumnTree`. */
    public pivotGroupsById: Map<string, AgProvidedColumnGroup> = new Map();
    /** Cols in `pivotTree` keyed by colId / userProvidedColDef ref / field. Cached so the next
     *  build's reuse lookup can skip the existing-tree DFS. */
    private pivotColsByKey: Map<string | ColDef, AgColumn> = new Map();
    /** Every group (padding + non-padding) in `pivotTree`; the orphan sweep and `visibleColsService`
     *  (via `colModel.colsAllGroups`) need padding groups included when pruning/resetting `displayInstances`. */
    public pivotAllGroups: AgProvidedColumnGroup[] = [];
    /** Held between clear and the next apply so generated col instances are reused. */
    private savedPivot: SavedPivotCols | null = null;

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
        this.visibleCols.refresh(source, false);
    }

    public override destroy(): void {
        // Release pivot cols/groups including any saved set held over a clear/restore window.
        if (this.pivotCols) {
            _destroyColumnTreeAll(this.pivotCols, this.pivotAllGroups);
        }
        this.pivotTree = [];
        this.pivotCols = null;
        this.pivotAllGroups = [];
        this.dependentsByValueCol = null;
        const saved = this.savedPivot;
        if (saved) {
            this.savedPivot = null;
            _destroyColumnTreeAll(saved.cols, saved.groups);
        }
        super.destroy();
    }

    /** Builds a new pivot result column tree from the supplied colDefs and refreshes display. */
    private applyPivotResultColDefs(colDefs: (ColDef | ColGroupDef)[], source: ColumnEventType): void {
        const beans = this.beans;
        const currentPivotCols = this.pivotCols;
        const currentPivotTree = currentPivotCols ? this.pivotTree : null;
        const saved = this.savedPivot;
        const strictResort = beans.pivotColsSvc?.isStrictColumnOrder() ?? false;
        const restoring = currentPivotTree == null && saved != null && !strictResort;
        const previousTree = currentPivotTree ?? saved?.tree ?? null;
        // Pick the cols/groups lists that pair with `previousTree` for the post-build sweep.
        const previousCols = currentPivotTree ? currentPivotCols! : (saved?.cols ?? null);
        const previousAllGroups = currentPivotTree ? this.pivotAllGroups : (saved?.groups ?? null);
        const buildToken = beans.colModel.nextBuildToken();
        const balanced = _buildColumnTree(
            beans,
            /* defs */ colDefs,
            /* primaryColumns */ false,
            /* existingGroupsById */ this.pivotGroupsById,
            /* existingColsByKey */ this.pivotColsByKey,
            /* existingColsById */ beans.colModel.colsById,
            /* source */ source,
            // Generated cols: re-apply their stateful attrs each pivot rebuild (pre-live-state-flag behaviour).
            /* newColDefs */ true,
            /* buildToken */ buildToken,
            /* wrapperCache */ null
        );
        // `previousTree` (not `currentPivotTree`) covers the clear/restore window where `currentPivotTree` is
        // null but saved bean refs survive. Skip the sweep when the tree is missing or unchanged.
        if (previousTree && previousTree !== balanced.columnTree) {
            _destroyColumnTreeUnused(previousCols ?? [], previousAllGroups ?? [], buildToken);
        }

        this.pivotCols = balanced.columns;
        this.pivotTree = balanced.columnTree;
        this.pivotTreeDepth = balanced.treeDepth;
        this.pivotHasMarryChildren = balanced.marryChildren;
        this.pivotGroupsById = balanced.groupsById;
        this.pivotColsByKey = balanced.colsByKey;
        this.pivotAllGroups = balanced.allGroups;
        this.savedPivot = null;
        this.dependentsByValueCol = null;

        // `newColDefs=true` resets sticky col order; suppress when restoring pivot after a clear to preserve prev order.
        this.colModel.refreshCols(!restoring, source);
    }

    private clearPivotResultCols(source: ColumnEventType): void {
        this.savedPivot = { tree: this.pivotTree, cols: this.pivotCols, groups: this.pivotAllGroups };
        this.pivotCols = null;
        this.pivotTree = [];
        this.pivotTreeDepth = 0;
        this.pivotHasMarryChildren = false;
        this.pivotAllGroups = [];
        this.dependentsByValueCol = null;
        this.colModel.refreshCols(false, source);
    }

    public recreateColDefsForSource(sourceCol: AgColumn, source: ColumnEventType): void {
        const cols = this.pivotCols;
        if (cols == null) {
            return;
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
        const deps = map.get(sourceCol);
        if (deps === undefined) {
            return;
        }
        const pivotColDefSvc = this.beans.pivotColDefSvc;
        if (!pivotColDefSvc) {
            return;
        }
        for (let i = 0, len = deps.length; i < len; ++i) {
            const pivotCol = deps[i];
            const newColDef = pivotColDefSvc.recreateColDef(pivotCol.colDef);
            pivotCol.setColDef(newColDef, newColDef, source);
        }
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
