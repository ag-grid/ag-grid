import { placeLockedColumns } from '../columnMove/columnMoveUtils';
import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { AgColumn } from '../entities/agColumn';
import { isColumn } from '../entities/agColumn';
import type { AgProvidedColumnGroup } from '../entities/agProvidedColumnGroup';
import type { ColDef, ColGroupDef, ColKey } from '../entities/colDef';
import type { GridOptions } from '../entities/gridOptions';
import type { ColumnEventType } from '../events';
import type { PropertyChangedEvent, PropertyValueChangedEvent } from '../gridOptionsService';
import { _isGroupHideColumnsUntilExpanded, _isRowNumbers, _shouldMaintainColumnOrder } from '../gridOptionsUtils';
import { _createColumnTree } from './columnFactoryUtils';
import type { ColumnState } from './columnStateUtils';
import { _applyColumnState, _compareColumnStatesAndDispatchEvents } from './columnStateUtils';
import {
    _convertColumnEventSourceType,
    _destroyColumnTree,
    _getColumnsFromTree,
    isColumnGroupAutoCol,
    isColumnSelectionCol,
    isRowNumberCol,
} from './columnUtils';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export class ColumnModel extends BeanStub implements NamedBean {
    beanName = 'colModel' as const;

    /** Display columns: the flattened ordered list used by rendering, sorting, and filtering.
     *  Built from [colDefCols OR pivotResultCols] + autoGroupCols + selectionCols.
     *
     *  Written externally by:
     *  - columnMoveService.ts — reorders after column drag/drop
     *  - columnStateUtils.ts — reorders when applying column state
     *  External writes only reorder; column instances stay the same, so colsMap remains valid. */
    public colsList: AgColumn[] = [];

    /** Leaf columns from colDefTree. Eagerly populated when tree changes.
     *  External code (column tool panel) may reassign to reorder. */
    public colDefList: AgColumn[] = [];

    /** Whether createColsFromColDefs has completed at least once. Guards all entry points. */
    public ready = false;

    /** True if any column has colDef.colSpan set. */
    public colSpanActive = false;

    /** Suppresses row model refreshes during batch column state dispatching. */
    public changeEventsDispatching = false;

    /** pivotMode can be on without showing pivot results (when no pivot columns are set). */
    public pivotMode = false;

    /** True when pivotResultCols are in colsList. */
    private showingPivotResult = false;

    /** getAllCols cache — null means stale, rebuilt on next access. */
    private cachedAllCols: AgColumn[] | null = null;

    /** User-defined column tree (from columnDefs). Source of truth for colDefList.
     *  Order doesn't change unless the columnDefs property changes. */
    public colDefTree: (AgColumn | AgProvidedColumnGroup)[] = [];
    public colDefTreeDepth = 0;

    public colsTree: (AgColumn | AgProvidedColumnGroup)[] = [];
    public colsTreeDepth = 0;

    private lastOrder: AgColumn[] | null = null;
    private lastPivotOrder: AgColumn[] | null = null;
    private colDefs: (ColDef | ColGroupDef)[] | null = null;

    /** Multi-key lookup maps (colId string, AgColumn instance, ColDef, userProvidedColDef).
     *  Cleared and repopulated on every refreshCols. */
    private readonly colsMap = new Map<ColKey | null | undefined, AgColumn>();
    private readonly colDefColsMap = new Map<ColKey | null | undefined, AgColumn>();

    public postConstruct(): void {
        this.pivotMode = this.gos.get('pivotMode');

        this.addManagedPropertyListeners(
            [
                'groupDisplayType',
                'treeData',
                'treeDataDisplayType',
                'groupHideOpenParents',
                'groupHideColumnsUntilExpanded',
                'rowNumbers',
                'hidePaddedHeaderRows',
            ],
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
        _destroyColumnTree(this.beans, this.colDefTree);
        _destroyColumnTree(this.beans, this.colsTree);
        super.destroy();
    }

    /** Sets new column definitions and rebuilds all columns. */
    public setColumnDefs(columnDefs: (ColDef | ColGroupDef)[], source: ColumnEventType): void {
        this.colDefs = columnDefs;
        this.createColsFromColDefs(source);
    }

    /** Rebuilds columns in response to defaultColDef/columnTypes changes. */
    public recreateColumnDefs(e: PropertyChangedEvent | PropertyValueChangedEvent<keyof GridOptions>): void {
        if (!this.ready) {
            return;
        }
        this.beans.autoColSvc?.updateColumns(e);
        this.createColsFromColDefs(_convertColumnEventSourceType(e.source));
    }

    /** Called from SyncService when the grid has finished initialising, and on every columnDefs update. */
    private createColsFromColDefs(source: ColumnEventType): void {
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
        } = beans;

        // only need to dispatch before/after events if updating columns, never if setting columns for first time
        const dispatchEventsFunc = this.colDefs ? _compareColumnStatesAndDispatchEvents(beans, source) : undefined;

        // always invalidate cache on changing columns, as the column id's for the new columns
        // could overlap with the old id's, so the cache would return old values for new columns.
        valueCache?.expire();

        const oldCols = this.colDefList;
        const oldTree = this.colDefTree;
        const newTree = _createColumnTree(beans, this.colDefs, true, oldTree, source);

        this.colDefTree = newTree.columnTree;
        this.colDefTreeDepth = newTree.treeDepth;

        this.colDefList = _getColumnsFromTree(newTree.columnTree);

        groupHierarchyColSvc?.createColumns(this.colDefList);
        this.mergeHierarchyColumns(groupHierarchyColSvc?.columns);

        _destroyColumnTree(beans, oldTree, this.colDefTree);

        rebuildColMap(this.colDefColsMap, this.colDefList);

        rowGroupColsSvc?.extractCols(source, oldCols);
        pivotColsSvc?.extractCols(source, oldCols);
        valueColsSvc?.extractCols(source, oldCols);

        this.ready = true;

        // Row Models react to all of these events as well as newColumnsLoaded,
        // this flag instructs row model to ignore these events to reduce refreshes.
        this.changeEventsDispatching = true;
        try {
            this.refreshCols(true, source);
        } finally {
            this.changeEventsDispatching = false;
        }

        visibleCols.refresh(source);

        // this event is not used by AG Grid, but left here for backwards compatibility,
        // in case applications use it
        eventSvc.dispatchEvent({ type: 'columnEverythingChanged', source });

        if (dispatchEventsFunc) {
            this.changeEventsDispatching = true;
            try {
                dispatchEventsFunc();
            } finally {
                this.changeEventsDispatching = false;
            }
        }

        eventSvc.dispatchEvent({ type: 'newColumnsLoaded', source });

        if (source === 'gridInitializing') {
            colAutosize?.applyAutosizeStrategy();
        }
    }

    /** Rebuilds display columns (colsList/colsTree) from source + service columns. */
    public refreshCols(newColDefs: boolean, source: ColumnEventType): void {
        if (!this.ready) {
            return;
        }

        // Save current column order before rebuilding
        const prevColsList = this.colsList;
        if (this.showingPivotResult) {
            this.lastPivotOrder = prevColsList.length > 0 ? prevColsList : null;
        } else {
            this.lastOrder = prevColsList.length > 0 ? prevColsList : null;
        }

        const beans = this.beans;

        // Pick source columns (pivot results or user-defined)
        const pivotResultColSvc = beans.pivotResultCols;
        const pivotList = pivotResultColSvc?.pivotCols;
        this.showingPivotResult = pivotList != null;

        const sourceList = pivotList ?? this.colDefList;

        beans.formula?.setFormulasActive(sourceList);

        const autoChanged = beans.autoColSvc?.createColumns(source) ?? false;
        const selChanged = beans.selectionColSvc?.createColumns() ?? false;
        const rnChanged = beans.rowNumbersSvc?.createColumn(sourceList) ?? false;

        const autoList = beans.autoColSvc?.columns;
        const selList = beans.selectionColSvc?.columns;
        const rnCol = beans.rowNumbersSvc?.column ?? undefined;
        const lastOrder = this.showingPivotResult ? this.lastPivotOrder : this.lastOrder;
        const maintainOrder =
            lastOrder && (!newColDefs || _shouldMaintainColumnOrder(this.gos, this.showingPivotResult));
        const list = maintainOrder
            ? this.buildDisplayListMaintainOrder(sourceList, lastOrder, autoList, selList, rnCol)
            : this.buildDisplayListNatural(sourceList, autoList, selList, rnCol);

        const sourceTree = pivotResultColSvc?.pivotTree ?? this.colDefTree;
        const treeChanged = this.buildDisplayTree(sourceTree, autoList, selList, rnCol);

        this.colsList = list;

        if (newColDefs || autoChanged || selChanged || rnChanged) {
            this.cachedAllCols = null;
        }

        rebuildColMap(this.colsMap, list);

        beans.showRowGroupCols?.refresh();
        beans.quickFilter?.refreshCols();
        this.updateColFlags(list);

        // make sure any part of the gui that tries to draw, eg the header,
        // will get empty lists of columns rather than stale columns.
        // for example, the header will receive gridColumnsChanged event, so will try and draw,
        // but it will draw successfully when it acts on the virtualColumnsChanged event
        beans.visibleCols.clear();
        beans.colViewport.clear();

        if (treeChanged) {
            beans.eventSvc.dispatchEvent({ type: 'gridColumnsChanged' });
        }
    }

    /** Refreshes columns and visible columns. Called on grid option changes. */
    public refreshAll(source: ColumnEventType): void {
        if (!this.ready) {
            return;
        }
        this.refreshCols(false, source);
        this.beans.visibleCols.refresh(source);
    }

    /** Builds the display list preserving previous column order.
     *  Resolves lastOrder entries to current instances by colId; new columns are appended. */
    private buildDisplayListMaintainOrder(
        sourceCols: AgColumn[],
        lastOrder: AgColumn[],
        autoList: AgColumn[] | undefined,
        selList: AgColumn[] | undefined,
        rnCol: AgColumn | undefined
    ): AgColumn[] {
        // Build colId→AgColumn map to resolve previous order to current instances
        const colById = new Map<string, AgColumn>();
        for (let i = 0, len = sourceCols.length; i < len; ++i) {
            const col = sourceCols[i];
            colById.set(col.colId, col);
        }
        if (autoList) {
            for (let i = 0, len = autoList.length; i < len; ++i) {
                const col = autoList[i];
                colById.set(col.colId, col);
            }
        }
        if (selList) {
            for (let i = 0, len = selList.length; i < len; ++i) {
                const col = selList[i];
                colById.set(col.colId, col);
            }
        }
        if (rnCol) {
            colById.set(rnCol.colId, rnCol);
        }

        // Resolve lastOrder to current instances — services may have recreated columns.
        const inOrder = new Set<string>();
        const preserved: AgColumn[] = [];
        for (let i = 0, len = lastOrder.length; i < len; ++i) {
            const current = colById.get(lastOrder[i].colId);
            if (current) {
                preserved.push(current);
                inOrder.add(current.colId);
            }
        }

        // Find new columns not present in lastOrder.
        // Iterate source lists directly (avoids Map iterator allocation and startsWith checks).
        // Order matches buildDisplayListNatural: rn, sel, auto, then source.
        const head: AgColumn[] = [];
        const newUserCols: AgColumn[] = [];
        if (rnCol && !inOrder.has(rnCol.colId)) {
            head.push(rnCol);
        }
        if (selList) {
            for (let i = 0, len = selList.length; i < len; ++i) {
                if (!inOrder.has(selList[i].colId)) {
                    head.push(selList[i]);
                }
            }
        }
        if (autoList) {
            for (let i = 0, len = autoList.length; i < len; ++i) {
                if (!inOrder.has(autoList[i].colId)) {
                    head.push(autoList[i]);
                }
            }
        }
        for (let i = 0, len = sourceCols.length; i < len; ++i) {
            if (!inOrder.has(sourceCols[i].colId)) {
                newUserCols.push(sourceCols[i]);
            }
        }

        let list: AgColumn[];
        if (head.length === 0 && newUserCols.length === 0) {
            list = preserved;
        } else if (head.length === 0) {
            list = preserved;
            this.insertAtGroupSiblingPositions(list, newUserCols);
        } else {
            // Pre-allocate instead of concat to avoid intermediate array
            list = new Array<AgColumn>(head.length + preserved.length);
            let pos = 0;
            for (let i = 0, len = head.length; i < len; ++i) {
                list[pos++] = head[i];
            }
            for (let i = 0, len = preserved.length; i < len; ++i) {
                list[pos++] = preserved[i];
            }
            if (newUserCols.length > 0) {
                this.insertAtGroupSiblingPositions(list, newUserCols);
            }
        }

        return placeLockedColumns(list, this.gos);
    }

    /** Builds the display list in natural order: service cols + source cols.
     *  Pre-allocates the result array to avoid incremental growth. */
    private buildDisplayListNatural(
        sourceCols: AgColumn[],
        autoList: AgColumn[] | undefined,
        selList: AgColumn[] | undefined,
        rnCol: AgColumn | undefined
    ): AgColumn[] {
        const sourceLen = sourceCols.length;
        const autoLen = autoList?.length ?? 0;
        const selLen = selList?.length ?? 0;
        const rnLen = rnCol ? 1 : 0;
        const list = new Array<AgColumn>(rnLen + selLen + autoLen + sourceLen);
        let pos = 0;
        if (rnCol) {
            list[pos++] = rnCol;
        }
        for (let i = 0; i < selLen; ++i) {
            list[pos++] = selList![i];
        }
        for (let i = 0; i < autoLen; ++i) {
            list[pos++] = autoList![i];
        }
        for (let i = 0; i < sourceLen; ++i) {
            list[pos++] = sourceCols[i];
        }
        return placeLockedColumns(list, this.gos);
    }

    /** Builds the display tree by concatenating balanced service trees + source tree.
     *  Replaces this.colsTree and updates this.colsTreeDepth.
     *  Returns true if the tree changed compared to the previous value. */
    private buildDisplayTree(
        sourceTree: (AgColumn | AgProvidedColumnGroup)[],
        autoList?: AgColumn[],
        selList?: AgColumn[],
        rnCol?: AgColumn
    ): boolean {
        const colGroupSvc = this.beans.colGroupSvc;
        const treeDepth = colGroupSvc?.findDepth(sourceTree) ?? 0;

        const rnBalanced = rnCol ? colGroupSvc?.balanceTreeForAutoCols([rnCol], treeDepth) : undefined;
        const selBalanced =
            selList && selList.length > 0 ? colGroupSvc?.balanceTreeForAutoCols(selList, treeDepth) : undefined;
        const autoBalanced =
            autoList && autoList.length > 0 ? colGroupSvc?.balanceTreeForAutoCols(autoList, treeDepth) : undefined;

        // Compare element-by-element against the existing tree before allocating a new array.
        // In the stable case (most refreshes) this avoids the allocation and copy entirely.
        if (
            this.colsTreeDepth === treeDepth &&
            colsTreeEquals(this.colsTree, rnBalanced, selBalanced, autoBalanced, sourceTree)
        ) {
            return false;
        }

        this.colsTree = buildColsTree(rnBalanced, selBalanced, autoBalanced, sourceTree);
        this.colsTreeDepth = treeDepth;
        return true;
    }

    /** Merges hierarchy columns into colDefTree/colDefList with duplicate filtering. */
    private mergeHierarchyColumns(hierarchyCols: AgColumn[] | undefined): void {
        const existingTree = this.colDefTree;
        if (!hierarchyCols || hierarchyCols.length === 0 || existingTree.length === 0) {
            return;
        }

        const colGroupSvc = this.beans.colGroupSvc;
        const treeDepth = colGroupSvc?.findDepth(existingTree) ?? 0;
        const balancedTree = colGroupSvc?.balanceTreeForAutoCols(hierarchyCols, treeDepth) ?? [];

        // Build set of existing IDs for O(1) duplicate check
        const existingIds = new Set<string>();
        for (let i = 0, len = existingTree.length; i < len; ++i) {
            existingIds.add(existingTree[i].getId());
        }

        // Prepend non-duplicate hierarchy nodes
        const result = new Array<AgColumn | AgProvidedColumnGroup>(balancedTree.length + existingTree.length);
        let pos = 0;
        for (let i = 0, len = balancedTree.length; i < len; ++i) {
            if (!existingIds.has(balancedTree[i].getId())) {
                result[pos++] = balancedTree[i];
            }
        }
        for (let i = 0, len = existingTree.length; i < len; ++i) {
            result[pos++] = existingTree[i];
        }
        const newTree = pos < result.length ? result.slice(0, pos) : result;
        this.colDefTree = newTree;
        this.colDefList = _getColumnsFromTree(newTree);
    }

    /** Inserts new columns into `list` near their group siblings.
     *  Uses a single-pass rebuild: O(n + m) instead of O(n * m) from repeated splice. */
    private insertAtGroupSiblingPositions(list: AgColumn[], newCols: AgColumn[]): void {
        // Build position index of current list for O(1) sibling lookup
        const posMap = new Map<AgColumn, number>();
        for (let i = 0, len = list.length; i < len; ++i) {
            posMap.set(list[i], i);
        }

        // Build a map: original index → columns to insert after that index
        // Columns without siblings go at the end
        const insertAfterMap = new Map<number, AgColumn[]>();
        const noSibling: AgColumn[] = [];
        for (let i = 0, len = newCols.length; i < len; ++i) {
            const nc = newCols[i];
            const afterIdx = findSiblingInsertPosition(nc, posMap);
            if (afterIdx >= 0) {
                const bucket = insertAfterMap.get(afterIdx);
                if (bucket) {
                    bucket.push(nc);
                } else {
                    insertAfterMap.set(afterIdx, [nc]);
                }
            } else {
                noSibling.push(nc);
            }
        }

        if (insertAfterMap.size > 0) {
            const origLen = list.length;
            const result = new Array<AgColumn>(origLen + newCols.length - noSibling.length);
            let pos = 0;
            for (let i = 0; i < origLen; ++i) {
                result[pos++] = list[i];
                const bucket = insertAfterMap.get(i);
                if (bucket) {
                    for (let j = 0, bLen = bucket.length; j < bLen; ++j) {
                        result[pos++] = bucket[j];
                    }
                }
            }
            list.length = pos;
            for (let i = 0; i < pos; ++i) {
                list[i] = result[i];
            }
        }
        // Append columns with no siblings at the end
        for (let i = 0, len = noSibling.length; i < len; ++i) {
            list.push(noSibling[i]);
        }
    }

    /** Single pass over colsList to set colSpanActive and rowAutoHeight.active. */
    private updateColFlags(list: AgColumn[]): void {
        let colSpan = false;
        let autoHeight = false;
        for (let i = 0, len = list.length; i < len; ++i) {
            const col = list[i];
            const colDef = col.colDef;
            if (!colSpan && colDef.colSpan != null) {
                colSpan = true;
            }
            if (!autoHeight && colDef.autoHeight && col.isVisible()) {
                autoHeight = true;
            }
            if (colSpan && autoHeight) {
                break;
            }
        }
        this.colSpanActive = colSpan;
        const rowAutoHeight = this.beans.rowAutoHeight;
        if (rowAutoHeight) {
            rowAutoHeight.active = autoHeight;
        }
    }

    /** Returns the columns that should be visible. When pivot mode is on but no pivot results exist,
     *  only shows value columns, auto-group columns, selection column and row numbers. */
    public getColsToShow(): AgColumn[] {
        const colsList = this.colsList;
        const beans = this.beans;
        const showAutoGroupAndValuesOnly = this.pivotMode && !this.showingPivotResult;
        const hideEmptyAutoColGroups = _isGroupHideColumnsUntilExpanded(beans.gos);
        const showSelectionColumn = showAutoGroupAndValuesOnly && beans.selectionColSvc?.isSelectionColumnEnabled();
        const showRowNumbers = showAutoGroupAndValuesOnly && _isRowNumbers(beans);

        const result: AgColumn[] = [];
        for (let i = 0, len = colsList.length; i < len; ++i) {
            const col = colsList[i];
            if (showAutoGroupAndValuesOnly) {
                if (
                    col.aggregationActive ||
                    (isColumnGroupAutoCol(col) && (!hideEmptyAutoColGroups || col.isVisible())) ||
                    (showSelectionColumn && isColumnSelectionCol(col)) ||
                    (showRowNumbers && isRowNumberCol(col))
                ) {
                    result.push(col);
                }
            } else if (col.isVisible() || (!hideEmptyAutoColGroups && isColumnGroupAutoCol(col))) {
                result.push(col);
            }
        }
        return result;
    }

    /** Returns the column order reference for getColumnDefs export.
     *  In non-pivot: colsList (display order including user columns).
     *  In pivot: lastOrder (user's pre-pivot display order, since colsList has pivot columns). */
    public getColOrderForExport(): AgColumn[] | null {
        return this.showingPivotResult ? this.lastOrder : this.colsList;
    }

    /** Invalidates the getAllCols cache. Called by services that change its inputs externally. */
    public invalidateAllColsCache(): void {
        this.cachedAllCols = null;
    }

    /** All columns from all sources. Cached; invalidated by refreshCols and invalidateAllColsCache. */
    public getAllCols(): AgColumn[] {
        return this.cachedAllCols ?? this.loadAllCols();
    }

    private loadAllCols(): AgColumn[] {
        const beans = this.beans;
        const colDefList = this.colDefList;
        const autoList = beans.autoColSvc?.columns;
        const selList = beans.selectionColSvc?.columns;
        const rnCol = beans.rowNumbersSvc?.column;
        const pivotList = beans.pivotResultCols?.pivotCols;

        const colDefLen = colDefList.length;
        const autoLen = autoList?.length ?? 0;
        const selLen = selList?.length ?? 0;
        const rnLen = rnCol ? 1 : 0;
        const pivotLen = pivotList?.length ?? 0;

        const result = new Array<AgColumn>(colDefLen + autoLen + selLen + rnLen + pivotLen);
        let pos = 0;
        for (let i = 0; i < colDefLen; ++i) {
            result[pos++] = colDefList[i];
        }
        for (let i = 0; i < autoLen; ++i) {
            result[pos++] = autoList![i];
        }
        for (let i = 0; i < selLen; ++i) {
            result[pos++] = selList![i];
        }
        if (rnCol) {
            result[pos++] = rnCol;
        }
        for (let i = 0; i < pivotLen; ++i) {
            result[pos++] = pivotList![i];
        }
        this.cachedAllCols = result;
        return result;
    }

    /** Looks up a user-defined column by any ColKey variant (string colId, AgColumn instance, ColDef, or userProvidedColDef). */
    public getColDefCol(key: ColKey | null | undefined): AgColumn | undefined {
        const map = this.colDefColsMap;
        return map.get(key) ?? (typeof key === 'object' && key !== null ? map.get((key as AgColumn).colId) : undefined);
    }

    /** Looks up a display column by any ColKey variant (string colId, AgColumn instance, ColDef, or userProvidedColDef). */
    public getCol(key: ColKey | null | undefined): AgColumn | undefined {
        const map = this.colsMap;
        return map.get(key) ?? (typeof key === 'object' && key !== null ? map.get((key as AgColumn).colId) : undefined);
    }

    /** Looks up a column in display columns first, then user-defined columns.
     *  Use for internal code that prefers display columns (e.g. getDataValue, setDataValue). */
    public getColOrColDef(key: ColKey | null | undefined): AgColumn | undefined {
        const colsMap = this.colsMap;
        let found = colsMap.get(key);
        if (found !== undefined) {
            return found;
        }
        const colDefColsMap = this.colDefColsMap;
        found = colDefColsMap.get(key);
        if (found === undefined && typeof key === 'object' && key !== null) {
            const colId = (key as AgColumn).colId;
            found = colsMap.get(colId) ?? colDefColsMap.get(colId);
        }
        return found;
    }

    /** Looks up a column in user-defined columns first, then display columns.
     *  Use for public API where the user references their own column definitions. */
    public getColDefOrCol(key: ColKey | null | undefined): AgColumn | undefined {
        const colDefColsMap = this.colDefColsMap;
        let found = colDefColsMap.get(key);
        if (found !== undefined) {
            return found;
        }
        const colsMap = this.colsMap;
        found = colsMap.get(key);
        if (found === undefined && typeof key === 'object' && key !== null) {
            const colId = (key as AgColumn).colId;
            found = colDefColsMap.get(colId) ?? colsMap.get(colId);
        }
        return found;
    }

    public isPivotActive(): boolean {
        return this.pivotMode && !!this.beans.pivotColsSvc?.columns?.length;
    }

    /** Refreshes columns when pivot mode changes. Needs refreshCols() because groupDisplayType='custom'
     *  skips auto-group columns unless pivot mode is on (mandatory in pivot mode). */
    private setPivotMode(pivotMode: boolean, source: ColumnEventType): void {
        if (pivotMode === this.pivotMode) {
            return;
        }
        this.pivotMode = pivotMode;
        if (!this.ready) {
            return;
        }
        this.refreshCols(false, source);
        const beans = this.beans;
        beans.visibleCols.refresh(source);
        beans.eventSvc.dispatchEvent({ type: 'columnPivotModeChanged' });
    }

    public setColsVisible(keys: (string | AgColumn)[], visible = false, source: ColumnEventType): void {
        _applyColumnState(
            this.beans,
            {
                state: keys.map<ColumnState>((key) => ({
                    colId: typeof key === 'string' ? key : key.colId,
                    hide: !visible,
                })),
            },
            source
        );
    }
}

/** For a group's children, finds the rightmost position of any leaf column in posMap. */
function bestLeafPosition(children: (AgColumn | AgProvidedColumnGroup)[], posMap: Map<AgColumn, number>): number {
    let best = -1;
    for (let i = 0, len = children.length; i < len; ++i) {
        const child = children[i];
        if (isColumn(child)) {
            const p = posMap.get(child);
            if (p !== undefined && p > best) {
                best = p;
            }
        } else {
            const p = bestLeafPosition(child.getChildren(), posMap);
            if (p > best) {
                best = p;
            }
        }
    }
    return best;
}

/** Walks up the original parent chain of `col` to find the rightmost sibling position in posMap.
 *  Returns the index in the original list after which `col` should be inserted, or -1 if no sibling found. */
function findSiblingInsertPosition(col: AgColumn, posMap: Map<AgColumn, number>): number {
    let parent = col.getOriginalParent();
    while (parent) {
        const children = parent.getChildren();
        let bestPos = -1;
        for (let i = 0, len = children.length; i < len; ++i) {
            const child = children[i];
            if (child === col) {
                continue;
            }
            if (isColumn(child)) {
                const p = posMap.get(child);
                if (p !== undefined && p > bestPos) {
                    bestPos = p;
                }
            } else {
                const p = bestLeafPosition(child.getChildren(), posMap);
                if (p > bestPos) {
                    bestPos = p;
                }
            }
        }
        if (bestPos >= 0) {
            return bestPos;
        }
        parent = parent.getOriginalParent();
    }
    return -1;
}

/** Clears and repopulates a multi-key lookup Map from a column list.
 *  Each column is indexed by: colId string, AgColumn instance, ColDef, and userProvidedColDef. */
/** Checks whether `existing` equals the concatenation of the given segments, element-by-element,
 *  without allocating. Any undefined segment is treated as empty. */
const colsTreeEquals = (
    existing: (AgColumn | AgProvidedColumnGroup)[],
    rn: (AgColumn | AgProvidedColumnGroup)[] | undefined,
    sel: (AgColumn | AgProvidedColumnGroup)[] | undefined,
    auto: (AgColumn | AgProvidedColumnGroup)[] | undefined,
    src: (AgColumn | AgProvidedColumnGroup)[]
): boolean => {
    const rnLen = rn?.length ?? 0;
    const selLen = sel?.length ?? 0;
    const autoLen = auto?.length ?? 0;
    const srcLen = src.length;
    if (existing.length !== rnLen + selLen + autoLen + srcLen) {
        return false;
    }
    let pos = 0;
    for (let i = 0; i < rnLen; ++i) {
        if (existing[pos++] !== rn![i]) {
            return false;
        }
    }
    for (let i = 0; i < selLen; ++i) {
        if (existing[pos++] !== sel![i]) {
            return false;
        }
    }
    for (let i = 0; i < autoLen; ++i) {
        if (existing[pos++] !== auto![i]) {
            return false;
        }
    }
    for (let i = 0; i < srcLen; ++i) {
        if (existing[pos++] !== src[i]) {
            return false;
        }
    }
    return true;
};

/** Allocates a new array containing the concatenation of the given segments in order. */
const buildColsTree = (
    rn: (AgColumn | AgProvidedColumnGroup)[] | undefined,
    sel: (AgColumn | AgProvidedColumnGroup)[] | undefined,
    auto: (AgColumn | AgProvidedColumnGroup)[] | undefined,
    src: (AgColumn | AgProvidedColumnGroup)[]
): (AgColumn | AgProvidedColumnGroup)[] => {
    const rnLen = rn?.length ?? 0;
    const selLen = sel?.length ?? 0;
    const autoLen = auto?.length ?? 0;
    const srcLen = src.length;
    const tree = new Array<AgColumn | AgProvidedColumnGroup>(rnLen + selLen + autoLen + srcLen);
    let pos = 0;
    for (let i = 0; i < rnLen; ++i) {
        tree[pos++] = rn![i];
    }
    for (let i = 0; i < selLen; ++i) {
        tree[pos++] = sel![i];
    }
    for (let i = 0; i < autoLen; ++i) {
        tree[pos++] = auto![i];
    }
    for (let i = 0; i < srcLen; ++i) {
        tree[pos++] = src[i];
    }
    return tree;
};

const rebuildColMap = (map: Map<ColKey | null | undefined, AgColumn>, list: AgColumn[]): void => {
    map.clear();
    for (let i = 0, len = list.length; i < len; ++i) {
        const col = list[i];
        map.set(col.colId, col);
        map.set(col, col);
        map.set(col.colDef, col);
        const userDef = col.userProvidedColDef;
        if (userDef) {
            map.set(userDef, col);
        }
    }
};
