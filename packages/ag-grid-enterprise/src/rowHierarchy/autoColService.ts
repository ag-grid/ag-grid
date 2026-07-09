import type {
    CellRendererSelectorResult,
    ColDef,
    ColumnEventType,
    IAutoColService,
    ITooltipParams,
    NamedBean,
    PropertyValueChangedEvent,
    RowNode,
} from 'ag-grid-community';
import {
    AgColumn,
    BeanStub,
    GROUP_AUTO_COLUMN_ID,
    _addColumnDefaultAndTypes,
    _applyColumnState,
    _convertColumnEventSourceType,
    _getColumnStateFromColDef,
    _isClientSideRowModel,
    _isColumnsSortingCoupledToGroup,
    _isGroupHideColumnsUntilExpanded,
    _isGroupMultiAutoColumn,
    _isGroupUseEntireRow,
    _mergeDeep,
} from 'ag-grid-community';

export class AutoColService extends BeanStub implements NamedBean, IAutoColService {
    beanName = 'autoColSvc' as const;

    /** Generated auto-group columns; empty when no auto-cols are active. Wrappers around these
     *  leaves are built/destroyed by `colGroupSvc.serviceWrapperCache`. */
    public columns: AgColumn[] = [];

    /** Flips true on the first `modelUpdated` — used to detect the CSRM-no-rowData edge case
     *  where the modelUpdated hook (and therefore the visibility update) never fires. */
    private modelEverUpdated = false;

    public postConstruct(): void {
        this.addManagedPropertyListener('autoGroupColumnDef', this.updateColumns.bind(this));

        this.setupGroupHideColumnsUntilExpanded();
    }

    private setupGroupHideColumnsUntilExpanded() {
        const updateGroupColumnVisibility = () => {
            this.modelEverUpdated = true;
            this.updateGroupColumnVisibility(true);
        };
        this.addManagedEventListeners({
            // modelUpdated is fired when rowGroup events are fired so we do not duplicate work by also listening to "rowGroupOpened" and "expandOrCollapseAll"
            modelUpdated: updateGroupColumnVisibility,
        });
        // Ensure the properties are reactive.
        this.addManagedPropertyListeners(
            ['groupHideColumnsUntilExpanded', 'groupDisplayType', 'groupHideOpenParents'],
            updateGroupColumnVisibility
        );
    }

    /** Generates or destroys auto-group columns based on grouping state. ColumnGroupService owns
     *  the balanced-tree wrappers and catches depth-only changes. */
    public refreshCols(source: ColumnEventType): AgColumn[] | null {
        const beans = this.beans;
        const { colModel, gos, rowGroupColsSvc } = beans;
        const isPivotMode = colModel.pivotMode;
        const groupFullWidthRow = _isGroupUseEntireRow(gos, isPivotMode);
        // Suppress auto-col separately for group vs pivot: in CSRM the user provides their own group
        // column for the normal view, but pivot columns are grid-generated (no chance to provide one),
        // so grouping must be suppressible independently. With Viewport/SSRM the user may also want
        // full control of the group column.
        const suppressAutoColumn = isPivotMode ? gos.get('pivotSuppressAutoColumn') : this.isSuppressAutoCol();

        const treeData = gos.get('treeData');
        const rowGroupCols = rowGroupColsSvc?.columns;
        const groupingActive = (rowGroupCols && rowGroupCols.length > 0) || treeData;
        const noAutoCols = !groupingActive || suppressAutoColumn || groupFullWidthRow;
        const currentCols = this.columns;

        if (noAutoCols) {
            if (currentCols.length > 0) {
                this.destroyColumns();
            }
            return null;
        }

        // Cheap "same as before?" check — bench-critical: refreshCols runs on every pivot /
        // grouping transaction. Matches colIds element-by-element with no allocation.
        const doingMultiAutoColumn = !treeData && _isGroupMultiAutoColumn(gos);
        if (autoColIdsMatch(currentCols, rowGroupCols, doingMultiAutoColumn)) {
            // Existing col instances stay; refresh their colDefs so options changes propagate.
            for (let i = 0, len = currentCols.length; i < len; ++i) {
                const col = currentCols[i];
                const rowGroupCol = doingMultiAutoColumn ? rowGroupCols![i] : undefined;
                const colDef = this.createAutoColDef(col.colId, rowGroupCol, i);
                col.setColDef(colDef, null, source);
            }
            return currentCols;
        }

        // Columns changed — destroy old, generate new.
        this.destroyColumns();
        const newCols = this.generateAutoCols(rowGroupCols);
        this.columns = newCols;
        if (!this.modelEverUpdated && _isClientSideRowModel(this.gos)) {
            // Mid-refreshCols: set visibility flags only; the enclosing refresh does the display refresh.
            this.updateGroupColumnVisibility(false);
        }
        return newCols;
    }

    public updateColumns(event: PropertyValueChangedEvent<'autoGroupColumnDef'>) {
        const source = _convertColumnEventSourceType(event.source);
        const cols = this.columns;
        for (let i = 0, len = cols.length; i < len; ++i) {
            this.updateOneAutoCol(cols[i], i, source);
        }
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

    private generateAutoCols(rowGroupCols: AgColumn[] = []): AgColumn[] {
        const autoCols: AgColumn[] = [];
        const gos = this.gos;
        const doingTreeData = gos.get('treeData');
        let doingMultiAutoColumn = _isGroupMultiAutoColumn(gos);
        if (doingTreeData && doingMultiAutoColumn) {
            this.warn(182);
            doingMultiAutoColumn = false;
        }

        // if doing "multipleColumns", then we call the method multiple times, once for each column we are grouping by
        if (doingMultiAutoColumn) {
            for (let i = 0, len = rowGroupCols.length; i < len; ++i) {
                autoCols.push(this.createOneAutoCol(rowGroupCols[i], i));
            }
        } else {
            autoCols.push(this.createOneAutoCol());
        }
        return autoCols;
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
    private createOneAutoCol(rowGroupCol?: AgColumn, index?: number): AgColumn {
        // if doing multi, set the field
        let colId: string;
        if (rowGroupCol) {
            colId = `${GROUP_AUTO_COLUMN_ID}-${rowGroupCol.colId}`;
        } else {
            colId = GROUP_AUTO_COLUMN_ID;
        }
        const colDef = this.createAutoColDef(colId, rowGroupCol, index);
        const newCol = new AgColumn(colDef, null, colId, true, 'auto-group');
        this.beans.context.createBean(newCol);
        return newCol;
    }

    /** Refreshes an auto group col to load changes from defaultColDef or autoGroupColDef */
    private updateOneAutoCol(colToUpdate: AgColumn, index: number, source: ColumnEventType) {
        const beans = this.beans;
        const oldColDef = colToUpdate.colDef;
        const underlyingColId = typeof oldColDef.showRowGroup == 'string' ? oldColDef.showRowGroup : undefined;
        const underlyingColumn = underlyingColId != null ? beans.colModel.getNonPivotCol(underlyingColId) : undefined;
        const colId = colToUpdate.colId;
        const colDef = this.createAutoColDef(colId, underlyingColumn ?? undefined, index);
        colToUpdate.setColDef(colDef, null, source);
        _applyColumnState(beans, { state: [_getColumnStateFromColDef(beans, colDef, colId)] }, source);
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
                !res.field && !res.valueGetter && !res.filterValueGetter && res.filter !== 'agGroupColumnFilter';
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
        const leafTooltipValueGetter = autoGroupColumnDef?.tooltipValueGetter;
        const leafTooltipField = autoGroupColumnDef?.tooltipField;
        const leafTooltipComponent = autoGroupColumnDef?.tooltipComponent;
        const leafTooltipComponentParams = autoGroupColumnDef?.tooltipComponentParams;
        const leafTooltipComponentSelector = autoGroupColumnDef?.tooltipComponentSelector;

        const rowGroupCols = this.beans.rowGroupColsSvc?.columns ?? [];
        const anyGroupColHasTooltip = rowGroupCols.some(
            (col) =>
                col.colDef.tooltipValueGetter ||
                col.colDef.tooltipField ||
                col.colDef.tooltipComponent ||
                col.colDef.tooltipComponentSelector
        );

        const hasTooltipConfig =
            anyGroupColHasTooltip ||
            leafTooltipValueGetter != null ||
            leafTooltipField != null ||
            leafTooltipComponent != null ||
            leafTooltipComponentSelector != null;

        if (!hasTooltipConfig) {
            return;
        }

        res.tooltipField = undefined;
        res.tooltipComponent = undefined;
        res.tooltipComponentParams = undefined;

        res.tooltipValueGetter = (params) => {
            if (params.node?.group) {
                const groupedCol = params.node.rowGroupColumn as AgColumn | undefined;
                if (!groupedCol) {
                    return undefined;
                }
                const colDef = groupedCol.colDef;
                if (colDef.tooltipValueGetter) {
                    return colDef.tooltipValueGetter(params);
                }
                if (colDef.tooltipField) {
                    return params.value;
                }
                return undefined;
            }
            if (leafTooltipValueGetter) {
                return leafTooltipValueGetter(params);
            }
            if (leafTooltipField && params.data) {
                return (params.data as Record<string, unknown>)[leafTooltipField];
            }
            return undefined;
        };

        const needsSelector =
            anyGroupColHasTooltip || leafTooltipComponent != null || leafTooltipComponentSelector != null;
        if (!needsSelector) {
            return;
        }

        // tooltipComponentSelector is typed for cell params but called with ITooltipParams at runtime
        const callSelector = (
            sel: ColDef['tooltipComponentSelector'],
            params: ITooltipParams
        ): CellRendererSelectorResult | undefined =>
            (sel as unknown as (p: ITooltipParams) => CellRendererSelectorResult | undefined)(params);

        const selector = (params: ITooltipParams): CellRendererSelectorResult | undefined => {
            if (params.node?.group) {
                const groupedCol = params.node.rowGroupColumn as AgColumn | undefined;
                const colDef = groupedCol?.colDef;
                if (!colDef) {
                    return undefined;
                }
                if (colDef.tooltipComponentSelector) {
                    return callSelector(colDef.tooltipComponentSelector, params);
                }
                if (!colDef.tooltipComponent) {
                    return undefined;
                }
                return { component: colDef.tooltipComponent, params: colDef.tooltipComponentParams };
            }
            if (leafTooltipComponentSelector) {
                return callSelector(leafTooltipComponentSelector, params);
            }
            if (leafTooltipComponent == null) {
                return undefined;
            }
            return { component: leafTooltipComponent, params: leafTooltipComponentParams };
        };
        res.tooltipComponentSelector = selector as unknown as ColDef['tooltipComponentSelector'];
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
        const { gos, visibleCols, rowModel } = this.beans;
        const isFeatureEnabled = _isGroupHideColumnsUntilExpanded(gos);
        let changed = false;

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
    }
}

/** True when `currentCols` matches the colIds `generateAutoCols(rowGroupCols)` would produce for
 *  `doingMultiAutoColumn`, without allocating an intermediate string array. */
const autoColIdsMatch = (
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
        if (currentCols[i].colId !== `${GROUP_AUTO_COLUMN_ID}-${rowGroupCols[i].colId}`) {
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
