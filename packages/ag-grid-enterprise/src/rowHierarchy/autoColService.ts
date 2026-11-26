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
    _isClientSideRowModel,
    _isGroupHideColumnsUntilExpanded,
    _isGroupMultiAutoColumn,
    _isGroupUseEntireRow,
    _mergeDeep,
    _mergedEqual,
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

    private singleColumnTooltipDef?: ColDef;
    private singleColumnLeafTooltipDef?: ColDef;

    /** A multi auto col copies its row-group column's name into its colDef, so re-derive it on a rename. */
    public onHeaderNameChanged(column: AgColumn, source: ColumnEventType): void {
        const cols = this.columns;
        for (let i = 0, len = cols.length; i < len; ++i) {
            const col = cols[i];
            if (col.derivedFromCol === column) {
                // the definition alone, as refreshCols does: re-applying colDef state would reset width and sort.
                this.redefineCol(col, i, source);
            }
        }
    }

    public updateColumnVisibility(): void {
        const columns = this.columns;
        const len = columns.length;
        // without the option a level of the column count shows them all; with it, -1 still shows the first
        let level = len;
        if (_isGroupHideColumnsUntilExpanded(this.gos)) {
            // capped where every auto col shows; one col shows at any level, so no row is read
            const maxLevel = len - 2;
            const nodes = maxLevel < 0 ? null : this.beans.rowModel?.rootNode?.childrenAfterGroup;
            level = this.getDeepestExpandedLevel(nodes, maxLevel);
        }
        let changed = false;
        for (let i = 0; i < len; ++i) {
            const col = columns[i];
            const visible = level >= i - 1;
            if (visible !== col.visible) {
                col.setVisible(visible, 'api');
                changed = true;
            }
        }
        if (changed) {
            this.beans.visibleCols.markLayoutOwed('api');
        }
    }

    /** Generates or destroys auto-group columns based on grouping state. ColumnGroupService owns
     *  the balanced-tree wrappers and catches depth-only changes. */
    public refreshCols(source: ColumnEventType): AgColumn[] | null {
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
        if (autoColsMode === AUTO_COLS_TREE_DATA && _isGroupMultiAutoColumn(this.gos)) {
            this.warn(182); // multipleColumns isn't supported with tree data — a single auto col is used
        }

        // Bench-critical: refreshCols runs on every pivot / grouping transaction, so compare without an array.
        if (autoColsInOrder(currentCols, rowGroupCols, doingMultiAutoColumn)) {
            // Existing col instances stay; refresh their colDefs so options changes propagate.
            this.applyAutoGroupColumnDef(source);
            return currentCols;
        }

        // Set and/or order changed: reconcile — reuse surviving instances (so they keep their state and
        // slide), creating only genuinely new cols and destroying only removed ones.
        const newCols = this.reconcileAutoCols(currentCols, doingMultiAutoColumn ? rowGroupCols! : undefined, source);
        this.columns = newCols;
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

    /** The auto columns grouping calls for: none, the one shared column, one per row group column, or tree data's one. */
    private getAutoColsMode(anyColGrouped: boolean): AutoColsMode {
        const gos = this.gos;
        const isPivotMode = this.beans.colModel.pivotMode;
        const treeData = gos.get('treeData');
        // suppressed separately for grouping and for pivoting: a pivot's group column is grid-generated, where
        // the user may supply their own for the plain view, or want full control of it with Viewport or SSRM
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
        for (let i = 0, len = cols.length; i < len; ++i) {
            this.redefineCol(cols[i], i, source);
        }
    }

    /** Defines `col` from the options again; the rows follow a new comparator or new filter params it uses. */
    private redefineCol(col: AgColumn, index: number | undefined, source: ColumnEventType): void {
        const oldColDef = col.colDef;
        const colDef = this.createAutoColDef(col.colId, col.derivedFromCol ?? undefined, index);
        // an unchanged definition changes neither; only rows sorted and filtered on the client read them
        if (!col.setColDef(colDef, null, source) || !_isClientSideRowModel(this.gos)) {
            return;
        }
        const changes = this.beans.syncSvc.changes;
        // the comparator orders the groups of a sorted auto column; a coupling it flips, the row node sorter tells
        if (col.sortDef.direction != null && !_mergedEqual(colDef.comparator, oldColDef.comparator)) {
            changes.sortChanged();
        }
        if (col.isFilterActive() && !_mergedEqual(colDef.filterParams, oldColDef.filterParams)) {
            changes.filterChanged(true, true);
        }
    }

    public applyColDefState(source: ColumnEventType): void {
        const cols = this.columns;
        const len = cols.length;
        if (len === 0) {
            return;
        }
        const beans = this.beans;
        const state = new Array<ColumnState>(len);
        for (let i = 0; i < len; ++i) {
            const col = cols[i];
            state[i] = _getColumnStateFromColDef(beans, col.colDef, col.colId);
        }
        // one state pass lays the auto cols out once, and tells them together
        _applyColumnState(beans, { state }, source, true);
    }

    public override destroy(): void {
        this.destroyColumns();
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

    /** Reconcile the auto cols to `rowGroupCols` (undefined: the one shared auto col), kept by source column. */
    private reconcileAutoCols(
        currentCols: AgColumn[],
        rowGroupCols: readonly AgColumn[] | undefined,
        source: ColumnEventType
    ): AgColumn[] {
        const survivors = new Map<AgColumn | null, AgColumn>();
        for (let i = 0, len = currentCols.length; i < len; ++i) {
            const col = currentCols[i];
            survivors.set(col.derivedFromCol, col);
        }
        let result: AgColumn[];
        if (rowGroupCols) {
            const len = rowGroupCols.length;
            result = new Array<AgColumn>(len);
            let created = false;
            for (let i = 0; i < len; ++i) {
                const kept = this.reuseAutoCol(survivors, rowGroupCols[i], i, source);
                if (kept === undefined) {
                    created = true;
                } else {
                    result[i] = kept;
                }
            }
            if (created) {
                // after every kept column is placed, so a new column's id skips theirs
                const claimed = new Set<string>();
                for (let i = 0; i < len; ++i) {
                    const kept = result[i];
                    if (kept === undefined) {
                        continue;
                    }
                    claimed.add(kept.colId);
                }
                for (let i = 0; i < len; ++i) {
                    if (result[i] !== undefined) {
                        continue;
                    }
                    const newCol = this.createAutoCol(rowGroupCols[i], i, claimed);
                    claimed.add(newCol.colId);
                    result[i] = newCol;
                }
            }
        } else {
            result = [
                this.reuseAutoCol(survivors, undefined, undefined, source) ??
                    this.createAutoCol(undefined, undefined, null),
            ];
        }
        // Whatever's left in `survivors` was removed from the grouping — destroy those instances.
        for (const col of survivors.values()) {
            if (col.isAlive()) {
                col.destroy();
            }
        }
        return result;
    }

    /** The existing auto col for `rowGroupCol`, its colDef and index refreshed, or undefined when it has none. */
    private reuseAutoCol(
        survivors: Map<AgColumn | null, AgColumn>,
        rowGroupCol: AgColumn | undefined,
        index: number | undefined,
        source: ColumnEventType
    ): AgColumn | undefined {
        const sourceCol = rowGroupCol ?? null;
        const existing = survivors.get(sourceCol);
        if (existing !== undefined) {
            survivors.delete(sourceCol);
            this.redefineCol(existing, index, source);
        }
        return existing;
    }

    /** `claimed`: the ids of this reconcile's auto cols, which the new one skips. */
    private createAutoCol(
        rowGroupCol: AgColumn | undefined,
        index: number | undefined,
        claimed: ReadonlySet<string> | null
    ): AgColumn {
        const colId = this.beans.colModel.getServiceColId(autoColId(rowGroupCol), claimed);
        const newCol = new AgColumn(this.createAutoColDef(colId, rowGroupCol, index), null, colId, true, 'auto-group');
        newCol.derivedFromCol = rowGroupCol ?? null;
        this.beans.context.createBean(newCol);
        return newCol;
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

    private createAutoColDef(colId: string, underlyingColumn?: AgColumn, index?: number): ColDef {
        // if one provided by user, use it, otherwise create one
        let res: ColDef = this.createBaseColDef(underlyingColumn);

        const gos = this.gos;
        const autoGroupColumnDef = gos.get('autoGroupColumnDef');
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
        if (!gos.get('treeData')) {
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

        // the grid shows and hides auto cols: one past the first starts hidden until its group is expanded
        res.hide = !!index && _isGroupHideColumnsUntilExpanded(gos);
        res.initialHide = undefined;

        const isSortingCoupled = !!this.beans.rowNodeSorter?.sortingCoupledToGroup;
        const hasOwnData = res.valueGetter || res.field != null;
        if (isSortingCoupled && !hasOwnData) {
            // if col is coupled sorting, and has sort attribute, we want to ignore this
            // because we only accept the sort on creation of the col
            res.sortIndex = undefined;
            res.initialSort = undefined;
        }

        if (!underlyingColumn) {
            this.applyDynamicSingleColumnTooltips(res);
        }

        return res;
    }

    public getTooltipColDef(column: AgColumn, node: IRowNode): ColDef {
        const colDef = column.colDef;
        if (colDef !== this.singleColumnTooltipDef || colDef.tooltip === false) {
            return colDef;
        }
        return getGroupedColDef(node) ?? this.singleColumnLeafTooltipDef ?? colDef;
    }

    // Each group row's `rowGroupColumn` differs per row, so tooltips must dispatch at render time.
    private applyDynamicSingleColumnTooltips(res: ColDef): void {
        this.singleColumnTooltipDef = res;
        this.singleColumnLeafTooltipDef = res;
        const rowGroupCols = this.beans.rowGroupColsSvc?.columns ?? [];
        const anyGroupColHasTooltip = rowGroupCols.some((col) => _isCellTooltipConfigured(col.colDef));
        const anyGroupColHasTooltipComponent = rowGroupCols.some(({ colDef }) => hasTooltipComponent(colDef));
        const leafHasTooltip = _isCellTooltipConfigured(res);
        const leafHasTooltipComponent = hasTooltipComponent(res);

        if (!anyGroupColHasTooltip && !anyGroupColHasTooltipComponent && !leafHasTooltip && !leafHasTooltipComponent) {
            return;
        }

        // Preserve merged leaf settings before replacing them with the per-row dispatcher.
        const leafColDef = { ...res };
        this.singleColumnLeafTooltipDef = leafColDef;
        res.tooltip = undefined;
        res.tooltipField = undefined;
        res.tooltipValueGetter = undefined;
        res.tooltipComponent = undefined;
        res.tooltipComponentParams = undefined;
        res.tooltipComponentSelector = undefined;

        if (anyGroupColHasTooltip || leafHasTooltip) {
            res.tooltip = (params) => this.resolveDynamicSingleColumnTooltip(params, leafColDef);
        }

        if (!anyGroupColHasTooltipComponent && !leafHasTooltipComponent) {
            return;
        }

        res.tooltipComponentSelector = (params) => this.resolveDynamicSingleColumnTooltipComponent(params, leafColDef);
    }

    private resolveDynamicSingleColumnTooltip(params: TooltipCallbackParams, leafColDef: ColDef): any {
        const groupedColDef = getGroupedColDef(params.node);
        const colDef = groupedColDef ?? leafColDef;

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
        leafColDef: ColDef
    ): TooltipComponentSelectorResult | undefined {
        const colDef = getGroupedColDef(params.node) ?? leafColDef;
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

    public isHidingUntilExpanded(): boolean {
        return this.columns.length > 0 && _isGroupHideColumnsUntilExpanded(this.gos);
    }
}

/** Auto-col colId for a grouped col (or the shared single auto col when none). */
const autoColId = (rowGroupCol?: AgColumn): string =>
    rowGroupCol ? `${GROUP_AUTO_COLUMN_ID}-${rowGroupCol.colId}` : GROUP_AUTO_COLUMN_ID;

/** True when `currentCols` were generated for `rowGroupCols`, in order — the no-allocation
 *  fast path skipping the reconcile. */
const autoColsInOrder = (
    currentCols: readonly AgColumn[],
    rowGroupCols: readonly AgColumn[] | undefined,
    doingMultiAutoColumn: boolean
): boolean => {
    if (!doingMultiAutoColumn || !rowGroupCols) {
        return currentCols.length === 1 && currentCols[0].derivedFromCol === null;
    }
    const len = rowGroupCols.length;
    if (currentCols.length !== len) {
        return false;
    }
    let i = 0;
    while (i < len && currentCols[i].derivedFromCol === rowGroupCols[i]) {
        ++i;
    }
    return i === len;
};
