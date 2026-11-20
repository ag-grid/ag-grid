import type {
    ColDef,
    ColumnEventType,
    ColumnState,
    IAutoColService,
    IRowNode,
    ITooltipParams,
    NamedBean,
    RowNode,
    TooltipCallbackParams,
    TooltipComponentSelectorResult,
} from 'ag-grid-community';
import {
    AgColumn,
    BeanStub,
    GROUP_AUTO_COLUMN_ID,
    _addColumnDefaultAndTypes,
    _applyColumnState,
    _getColumnStateFromColDef,
    _getLegacyTooltipFieldValue,
    _isCellTooltipConfigured,
    _isColumnsSortingCoupledToGroup,
    _isGroupHideColumnsUntilExpanded,
    _isGroupMultiAutoColumn,
    _isGroupUseEntireRow,
    _mergeDeep,
    _resolveGroupTooltipValue,
} from 'ag-grid-community';

import { isGroupFilterDef } from './rowHierarchyUtils';

const AUTO_COLS_NONE = 0;
const AUTO_COLS_SINGLE = 1;
const AUTO_COLS_MULTI = 2;
const AUTO_COLS_TREE_DATA = 3;
type AutoColsMode =
    typeof AUTO_COLS_NONE | typeof AUTO_COLS_SINGLE | typeof AUTO_COLS_MULTI | typeof AUTO_COLS_TREE_DATA;

const hasTooltipComponent = (colDef: ColDef | undefined): colDef is ColDef =>
    !!colDef && (colDef.tooltipComponent != null || colDef.tooltipComponentSelector != null);

const getGroupedColDef = (node: IRowNode | undefined): ColDef | undefined =>
    node?.group ? (node.rowGroupColumn as AgColumn | null)?.colDef : undefined;

export class AutoColService extends BeanStub implements NamedBean, IAutoColService {
    beanName = 'autoColSvc' as const;

    /** Generated auto-group columns; empty when no auto-cols are active. Wrappers around these
     *  leaves are built/destroyed by `colGroupSvc.serviceWrapperCache`. */
    public columns: AgColumn[] = [];

    /** Set by the first {@link updateColumnVisibility}, which the client-side row model calls on every refresh; until
     *  then, as always in other row models, {@link refreshCols} sets the visibility of the auto cols it creates. */
    private modelEverUpdated = false;
    /** The auto cols a build's `processColDef` asked for, by colId, made ahead of the `refreshCols` taking them. */
    private readonly madeAhead = new Map<string, AgColumn>();

    public onHeaderNameChanged(column: AgColumn, source: ColumnEventType): void {
        const cols = this.columns;
        for (let i = 0, len = cols.length; i < len; ++i) {
            const col = cols[i];
            if (col.derivedFromCol === column) {
                // setColDef alone, as refreshCols does: re-applying colDef state would reset width and sort.
                col.setColDef(this.createAutoColDef(col.colId, column, i), null, source);
            }
        }
    }

    public updateColumnVisibility(): void {
        this.modelEverUpdated = true;
        this.updateGroupColumnVisibility(true);
    }

    /** Generates or destroys auto-group columns based on grouping state. ColumnGroupService owns
     *  the balanced-tree wrappers and catches depth-only changes. */
    public refreshCols(source: ColumnEventType): AgColumn[] | null {
        const cols = this.refreshColsFromGrouping(source);
        const madeAhead = this.madeAhead;
        if (madeAhead.size !== 0) {
            for (const col of madeAhead.values()) {
                col.destroy(); // the grouping the build was predicted to have did not ask for it
            }
            madeAhead.clear();
        }
        return cols;
    }

    private refreshColsFromGrouping(source: ColumnEventType): AgColumn[] | null {
        const gos = this.gos;
        const rowGroupCols = this.beans.rowGroupColsSvc?.columns;
        const autoColsMode = this.getAutoColsMode(!!rowGroupCols?.length);
        const currentCols = this.columns;

        if (autoColsMode === AUTO_COLS_NONE) {
            if (currentCols.length > 0) {
                this.destroyColumns();
            }
            return null;
        }

        const doingMultiAutoColumn = autoColsMode === AUTO_COLS_MULTI;
        if (autoColsMode === AUTO_COLS_TREE_DATA && _isGroupMultiAutoColumn(gos)) {
            this.warn(182); // multipleColumns isn't supported with tree data — a single auto col is used
        }

        // Bench-critical: refreshCols runs on every pivot / grouping transaction, so compare without an array.
        if (autoColsInOrder(currentCols, rowGroupCols, doingMultiAutoColumn)) {
            // Existing col instances stay; refresh their colDefs so options changes propagate.
            for (let i = 0, len = currentCols.length; i < len; ++i) {
                const col = currentCols[i];
                const rowGroupCol = doingMultiAutoColumn ? rowGroupCols![i] : undefined;
                col.setColDef(this.createAutoColDef(col.colId, rowGroupCol, i), null, source);
            }
            return currentCols;
        }

        // Set and/or order changed: reconcile — reuse surviving instances (so they keep their state and
        // slide), creating only genuinely new cols and destroying only removed ones.
        const newCols = this.reconcileAutoCols(currentCols, doingMultiAutoColumn ? rowGroupCols! : undefined, source);
        this.columns = newCols;
        if (!this.modelEverUpdated) {
            // Mid-refreshCols: set visibility flags only; the enclosing refresh does the display refresh.
            this.updateGroupColumnVisibility(false);
        }
        return newCols;
    }

    public isColKept(col: AgColumn, rowGroupCols: ReadonlySet<AgColumn>): boolean {
        const autoColsMode = this.getAutoColsMode(rowGroupCols.size > 0);
        if (autoColsMode === AUTO_COLS_MULTI) {
            const rowGroupCol = col.derivedFromCol;
            return rowGroupCol !== null && rowGroupCols.has(rowGroupCol);
        }
        return autoColsMode !== AUTO_COLS_NONE && col.derivedFromCol === null;
    }

    public getColForBuild(colId: string, rowGroupCols: ReadonlySet<AgColumn>): AgColumn | null {
        const autoColsMode = this.getAutoColsMode(rowGroupCols.size > 0);
        let rowGroupCol: AgColumn | undefined;
        if (autoColsMode === AUTO_COLS_MULTI) {
            for (const col of rowGroupCols) {
                if (autoColId(col) !== colId) {
                    continue;
                }
                rowGroupCol = col;
                break;
            }
            if (rowGroupCol === undefined) {
                return null;
            }
        } else if (autoColsMode === AUTO_COLS_NONE || colId !== GROUP_AUTO_COLUMN_ID) {
            return null;
        }
        let col = this.madeAhead.get(colId);
        if (col?.derivedFromCol !== (rowGroupCol ?? null)) {
            col?.destroy();
            col = this.createOneAutoCol(colId, rowGroupCol, undefined);
            this.madeAhead.set(colId, col);
        }
        return col;
    }

    /** The auto columns grouping calls for: none, the one shared column, one per row group column, or tree data's one. */
    private getAutoColsMode(anyColGrouped: boolean): AutoColsMode {
        const gos = this.gos;
        const isPivotMode = this.beans.colModel.pivotMode;
        const treeData = gos.get('treeData');
        // pivot suppresses it on its own: its columns are grid-generated, so no user group column can stand in
        const suppressAutoColumn = isPivotMode ? gos.get('pivotSuppressAutoColumn') : this.isSuppressAutoCol();
        if (!(anyColGrouped || treeData) || suppressAutoColumn || _isGroupUseEntireRow(gos, isPivotMode)) {
            return AUTO_COLS_NONE;
        }
        if (treeData) {
            return AUTO_COLS_TREE_DATA;
        }
        return _isGroupMultiAutoColumn(gos) ? AUTO_COLS_MULTI : AUTO_COLS_SINGLE;
    }

    public applyAutoGroupColumnDef(source: ColumnEventType): void {
        const cols = this.columns;
        const len = cols.length;
        if (len === 0) {
            return;
        }
        const beans = this.beans;
        const state = new Array<ColumnState>(len);
        const colModel = beans.colModel;
        const colDefsVersion = colModel.colDefsVersion;
        for (let i = 0; i < len; ++i) {
            const col = cols[i];
            const colId = col.colId;
            // applying the state runs refreshCols, which sets the colDef
            const colDef = this.createAutoColDef(colId, col.derivedFromCol ?? undefined, i);
            state[i] = _getColumnStateFromColDef(beans, colDef, colId);
        }
        // one state pass lays the auto cols out once, and raises their events together
        _applyColumnState(beans, { state }, source, true);
        if (colModel.colDefsVersion === colDefsVersion) {
            return;
        }
        // redefined while it filters or sorts the rows: they re-filter or re-sort by its new definition
        let filters = false;
        let sorts = false;
        for (let i = 0; i < len; ++i) {
            const col = cols[i];
            filters ||= col.isFilterActive();
            sorts ||= col.sortDef.direction != null;
        }
        if (filters) {
            colModel.refreshRowsForFilter(true, true);
        }
        if (sorts) {
            colModel.refreshRowsForSort();
        }
    }

    public override destroy(): void {
        this.destroyColumns();
        for (const col of this.madeAhead.values()) {
            col.destroy();
        }
        super.destroy();
    }

    private destroyColumns(): void {
        const list = this.columns;
        this.columns = [];
        for (let i = 0, len = list.length; i < len; ++i) {
            const col = list[i];
            if (col.isAlive()) {
                col.destroy();
            }
        }
    }

    /** Reconcile the auto cols to `rowGroupCols` (undefined: the one shared auto col), kept by colId and source. */
    private reconcileAutoCols(
        currentCols: AgColumn[],
        rowGroupCols: readonly AgColumn[] | undefined,
        source: ColumnEventType
    ): AgColumn[] {
        const survivors = new Map<string, AgColumn>();
        for (let i = 0, len = currentCols.length; i < len; ++i) {
            const col = currentCols[i];
            survivors.set(col.colId, col);
        }
        let result: AgColumn[];
        if (rowGroupCols) {
            const len = rowGroupCols.length;
            result = new Array<AgColumn>(len);
            for (let i = 0; i < len; ++i) {
                result[i] = this.reuseOrCreateAutoCol(survivors, rowGroupCols[i], i, source);
            }
        } else {
            result = [this.reuseOrCreateAutoCol(survivors, undefined, undefined, source)];
        }
        // Whatever's left in `survivors` was removed from the grouping — destroy those instances.
        for (const col of survivors.values()) {
            if (col.isAlive()) {
                col.destroy();
            }
        }
        return result;
    }

    /** Reuse the existing auto col for `rowGroupCol` (refreshing its colDef + index) if present, else create it. */
    private reuseOrCreateAutoCol(
        survivors: Map<string, AgColumn>,
        rowGroupCol: AgColumn | undefined,
        index: number | undefined,
        source: ColumnEventType
    ): AgColumn {
        const colId = autoColId(rowGroupCol);
        const existing = survivors.get(colId);
        if (existing?.derivedFromCol === (rowGroupCol ?? null)) {
            survivors.delete(colId);
            existing.setColDef(this.createAutoColDef(colId, rowGroupCol, index), null, source);
            return existing;
        }
        return this.createOneAutoCol(colId, rowGroupCol, index);
    }

    private isSuppressAutoCol() {
        const gos = this.gos;
        const groupDisplayType = gos.get('groupDisplayType');
        const isCustomRowGroups = groupDisplayType === 'custom';
        if (isCustomRowGroups) {
            return true;
        }
        return gos.get('treeDataDisplayType') === 'custom';
    }

    // rowGroupCol and index are missing if groupDisplayType != "multipleColumns"
    private createOneAutoCol(colId: string, rowGroupCol: AgColumn | undefined, index: number | undefined): AgColumn {
        const colDef = this.createAutoColDef(colId, rowGroupCol, index);
        const madeAhead = this.madeAhead.get(colId);
        if (madeAhead?.derivedFromCol === (rowGroupCol ?? null)) {
            this.madeAhead.delete(colId);
            madeAhead.setColDef(colDef, null, 'api');
            return madeAhead;
        }
        const newCol = new AgColumn(colDef, null, colId, true, 'auto-group');
        newCol.derivedFromCol = rowGroupCol ?? null;
        this.beans.context.createBean(newCol);
        return newCol;
    }

    private createAutoColDef(colId: string, underlyingColumn?: AgColumn, index?: number): ColDef {
        // if one provided by user, use it, otherwise create one
        let res: ColDef = this.createBaseColDef(underlyingColumn);

        const autoGroupColumnDef = this.gos.get('autoGroupColumnDef');
        _mergeDeep(res, autoGroupColumnDef);

        res = _addColumnDefaultAndTypes(this.beans, res, colId, true);
        res.colId = colId;

        // TODO: Remove this guard once auto-group-column editing is properly supported.
        // Don't inherit groupRowEditable / groupRowValueSetter from defaultColDef — only honour
        // them when explicitly set on autoGroupColumnDef.
        if (autoGroupColumnDef?.groupRowEditable == null) {
            res.groupRowEditable = undefined;
        }
        if (autoGroupColumnDef?.groupRowValueSetter == null) {
            res.groupRowValueSetter = undefined;
        }

        // For tree data the filter is always allowed
        if (!this.gos.get('treeData')) {
            // we would only allow filter if the user has provided field or value getter. otherwise the filter
            // would not be able to work.
            const noFieldOrValueGetter =
                !res.field && !res.valueGetter && !res.filterValueGetter && !isGroupFilterDef(res.filter);
            if (noFieldOrValueGetter) {
                res.filter = false;
            }
        }

        // if showing many cols, we don't want to show more than one with a checkbox for selection
        if (index && index > 0) {
            res.headerCheckboxSelection = false;
        }

        const isSortingCoupled = _isColumnsSortingCoupledToGroup(this.gos);
        const hasOwnData = res.valueGetter || res.field != null;
        if (isSortingCoupled && !hasOwnData) {
            // if col is coupled sorting, and has sort attribute, we want to ignore this
            // because we only accept the sort on creation of the col
            res.sortIndex = undefined;
            res.initialSort = undefined;
        }

        if (!underlyingColumn) {
            this.applyDynamicSingleColumnTooltips(res, autoGroupColumnDef);
        }

        return res;
    }

    // Each group row's `rowGroupColumn` differs per row, so tooltips must dispatch at render time.
    private applyDynamicSingleColumnTooltips(res: ColDef, autoGroupColumnDef: ColDef | undefined): void {
        const rowGroupCols = this.beans.rowGroupColsSvc?.columns ?? [];
        const anyGroupColHasTooltip = rowGroupCols.some((col) => _isCellTooltipConfigured(col.colDef));
        const anyGroupColHasTooltipComponent = rowGroupCols.some(({ colDef }) => hasTooltipComponent(colDef));
        const leafHasTooltip = !!autoGroupColumnDef && _isCellTooltipConfigured(autoGroupColumnDef);
        const leafHasTooltipComponent = hasTooltipComponent(autoGroupColumnDef);

        if (!anyGroupColHasTooltip && !anyGroupColHasTooltipComponent && !leafHasTooltip && !leafHasTooltipComponent) {
            return;
        }

        res.tooltip = undefined;
        res.tooltipField = undefined;
        res.tooltipValueGetter = undefined;
        res.tooltipComponent = undefined;
        res.tooltipComponentParams = undefined;
        res.tooltipComponentSelector = undefined;

        if (anyGroupColHasTooltip || leafHasTooltip) {
            res.tooltip = (params) => this.resolveDynamicSingleColumnTooltip(params, autoGroupColumnDef);
        }

        if (!anyGroupColHasTooltipComponent && !leafHasTooltipComponent) {
            return;
        }

        res.tooltipComponentSelector = (params) =>
            this.resolveDynamicSingleColumnTooltipComponent(params, autoGroupColumnDef);
    }

    private resolveDynamicSingleColumnTooltip(
        params: TooltipCallbackParams,
        autoGroupColumnDef: ColDef | undefined
    ): any {
        const groupedColDef = getGroupedColDef(params.node);
        const colDef = groupedColDef ?? autoGroupColumnDef;
        if (!colDef) {
            return undefined;
        }

        return _resolveGroupTooltipValue(colDef, params, () => {
            if (groupedColDef) {
                return { resolved: true, value: params.value };
            }
            const { tooltipField } = colDef;
            if (!tooltipField || !params.data) {
                return { resolved: false };
            }
            const containsDots = !this.gos.get('suppressFieldDotNotation') && tooltipField.includes('.');
            return {
                resolved: true,
                value: _getLegacyTooltipFieldValue(params.data, tooltipField, containsDots),
            };
        });
    }

    private resolveDynamicSingleColumnTooltipComponent(
        params: ITooltipParams,
        autoGroupColumnDef: ColDef | undefined
    ): TooltipComponentSelectorResult | undefined {
        const colDef = getGroupedColDef(params.node) ?? autoGroupColumnDef;
        if (!hasTooltipComponent(colDef)) {
            return undefined;
        }
        if (colDef.tooltipComponentSelector) {
            return colDef.tooltipComponentSelector(params);
        }
        return { component: colDef.tooltipComponent, params: colDef.tooltipComponentParams };
    }

    private createBaseColDef(rowGroupCol?: AgColumn): ColDef {
        const userDef = this.gos.get('autoGroupColumnDef');
        const localeTextFunc = this.getLocaleTextFunc();
        const res: ColDef = {
            headerName: localeTextFunc('group', 'Group'),
            showRowGroup: rowGroupCol?.colId ?? true,
        };
        // only add the default group cell renderer if user hasn't provided one
        const userHasProvidedGroupCellRenderer = userDef && (userDef.cellRenderer || userDef.cellRendererSelector);
        if (!userHasProvidedGroupCellRenderer) {
            res.cellRenderer = 'agGroupCellRenderer';
        }
        if (rowGroupCol) {
            res.headerName = this.beans.colNames.getDisplayNameForColumn(rowGroupCol, 'header') ?? undefined;
            res.headerValueGetter = rowGroupCol.colDef.headerValueGetter;
            res.headerTooltip = rowGroupCol.colDef.headerTooltip;
            res.headerTooltipValueGetter = rowGroupCol.colDef.headerTooltipValueGetter;
            res.tooltip = rowGroupCol.colDef.tooltip;
            res.tooltipField = rowGroupCol.colDef.tooltipField;
            res.tooltipValueGetter = rowGroupCol.colDef.tooltipValueGetter;
            res.tooltipComponent = rowGroupCol.colDef.tooltipComponent;
            res.tooltipComponentParams = rowGroupCol.colDef.tooltipComponentParams;
            res.tooltipComponentSelector = rowGroupCol.colDef.tooltipComponentSelector;
        }
        return res;
    }

    private getDeepestExpandedLevel(nodes: RowNode[] | null | undefined, maxLevel: number): number {
        let deepest = -1;
        if (!nodes) {
            return deepest;
        }
        for (let i = 0, len = nodes.length; i < len; ++i) {
            const node = nodes[i];
            if (!node.group || !node.expanded) {
                continue;
            }
            if (node.level > deepest) {
                deepest = node.level;
            }
            if (deepest >= maxLevel) {
                return deepest;
            }
            // only expanded nodes recurse into their child groups; collapsed branches are skipped.
            const childDeepest = this.getDeepestExpandedLevel(node.childrenAfterGroup, maxLevel);
            if (childDeepest > deepest) {
                deepest = childDeepest;
            }
            if (deepest >= maxLevel) {
                return deepest;
            }
        }
        return deepest;
    }

    /** Sets auto-col visibility flags for the "group hide columns until expanded" feature. When called
     *  mid-`refreshCols` (`canRefresh=false`), only the flags are set — the enclosing refresh assembles
     *  the new colsList and runs `visibleCols.refresh` itself, so refreshing here would run against the
     *  stale colsList and dispatch a premature `displayedColumnsChanged`. */
    private updateGroupColumnVisibility(canRefresh: boolean): void {
        const columns = this.columns;
        if (columns.length === 0) {
            return;
        }
        const { gos, visibleCols, rowModel, colModel } = this.beans;
        const isFeatureEnabled = _isGroupHideColumnsUntilExpanded(gos);
        let changed = false;
        colModel.beginColUpdate();
        try {
            if (!isFeatureEnabled) {
                if (setAllColumnsVisible(columns)) {
                    changed = true;
                }
            } else if (columns.length > 1) {
                // Only applies with multiple columns: the first is always visible, so a single
                // column needs no adjustment.
                const maxLevel = columns.length - 2;
                const rootChildren = rowModel?.rootNode?.childrenAfterGroup;
                const deepestExpandedLevel = this.getDeepestExpandedLevel(rootChildren, maxLevel);

                if (deepestExpandedLevel >= maxLevel) {
                    if (setAllColumnsVisible(columns)) {
                        changed = true;
                    }
                } else {
                    for (let level = 0; level < columns.length - 1; level++) {
                        if (setColumnVisible(columns[level + 1], deepestExpandedLevel >= level)) {
                            changed = true;
                        }
                    }
                }
            }
            if (changed && canRefresh) {
                // skipTreeBuild=false: visibility changed, so the displayed-col partition must be rebuilt.
                visibleCols.refresh('api', false);
            }
        } finally {
            colModel.endColUpdate();
        }
    }
}

/** Auto-col colId for a grouped col (or the shared single auto col when none). */
const autoColId = (rowGroupCol?: AgColumn): string =>
    rowGroupCol ? `${GROUP_AUTO_COLUMN_ID}-${rowGroupCol.colId}` : GROUP_AUTO_COLUMN_ID;

/** True when `currentCols` were generated for `rowGroupCols`, in order: the fast path skipping the reconcile. */
const autoColsInOrder = (
    currentCols: readonly AgColumn[],
    rowGroupCols: readonly AgColumn[] | undefined,
    doingMultiAutoColumn: boolean
): boolean => {
    if (!doingMultiAutoColumn || !rowGroupCols) {
        return currentCols.length === 1 && currentCols[0].colId === GROUP_AUTO_COLUMN_ID;
    }
    const len = rowGroupCols.length;
    if (currentCols.length !== len) {
        return false;
    }
    for (let i = 0; i < len; ++i) {
        if (currentCols[i].derivedFromCol !== rowGroupCols[i]) {
            return false;
        }
    }
    return true;
};

const setColumnVisible = (col: AgColumn, visible: boolean): boolean => {
    if (visible !== col.visible) {
        col.setVisible(visible, 'api');
        return true;
    }
    return false;
};

const setAllColumnsVisible = (columns: AgColumn[]): boolean => {
    let changed = false;
    for (let i = 0, len = columns.length; i < len; ++i) {
        if (setColumnVisible(columns[i], true)) {
            changed = true;
        }
    }
    return changed;
};
