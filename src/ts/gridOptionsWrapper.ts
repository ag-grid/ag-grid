/// <reference path="constants.ts" />

module awk.grid {

    var DEFAULT_ROW_HEIGHT = 30;
    var constants = Constants;

    function isTrue(value: any) {
        return value === true || value === 'true';
    }

    export class GridOptionsWrapper {

        gridOptions: GridOptions;

        constructor(gridOptions: GridOptions) {
            this.gridOptions = gridOptions;
            this.setupDefaults();
        }

        isRowSelection() { return this.gridOptions.rowSelection === "single" || this.gridOptions.rowSelection === "multiple"; }
        isRowDeselection() { return isTrue(this.gridOptions.rowDeselection); }
        isRowSelectionMulti() { return this.gridOptions.rowSelection === 'multiple'; }
        getContext() { return this.gridOptions.context; }
        isVirtualPaging() { return isTrue(this.gridOptions.virtualPaging); }
        isShowToolPanel() { return isTrue(this.gridOptions.showToolPanel); }
        isToolPanelSuppressPivot() { return isTrue(this.gridOptions.toolPanelSuppressPivot); }
        isToolPanelSuppressValues() { return isTrue(this.gridOptions.toolPanelSuppressValues); }
        isRowsAlreadyGrouped() { return isTrue(this.gridOptions.rowsAlreadyGrouped); }
        isGroupSelectsChildren() { return isTrue(this.gridOptions.groupSelectsChildren); }
        isGroupHidePivotColumns() { return isTrue(this.gridOptions.groupHidePivotColumns); }
        isGroupIncludeFooter() { return isTrue(this.gridOptions.groupIncludeFooter); }
        isSuppressRowClickSelection() { return isTrue(this.gridOptions.suppressRowClickSelection); }
        isSuppressCellSelection() { return isTrue(this.gridOptions.suppressCellSelection); }
        isSuppressUnSort() { return isTrue(this.gridOptions.suppressUnSort); }
        isSuppressMultiSort() { return isTrue(this.gridOptions.suppressMultiSort); }
        isGroupSuppressAutoColumn() { return isTrue(this.gridOptions.groupSuppressAutoColumn); }
        isGroupHeaders() { return isTrue(this.gridOptions.groupHeaders); }
        isDontUseScrolls() { return isTrue(this.gridOptions.dontUseScrolls); }
        isSuppressDescSort() { return isTrue(this.gridOptions.suppressDescSort); }
        isUnSortIcon() { return isTrue(this.gridOptions.unSortIcon); }
        getRowStyle() { return this.gridOptions.rowStyle; }
        getRowClass() { return this.gridOptions.rowClass; }
        getHeaderCellRenderer() { return this.gridOptions.headerCellRenderer; }
        getApi() { return this.gridOptions.api; }
        isEnableColResize() { return isTrue(this.gridOptions.enableColResize); }
        getGroupDefaultExpanded() { return this.gridOptions.groupDefaultExpanded; }
        getGroupKeys() { return this.gridOptions.groupKeys; }
        getGroupAggFunction() { return this.gridOptions.groupAggFunction; }
        getGroupAggFields() { return this.gridOptions.groupAggFields; }
        getAllRows() { return this.gridOptions.rowData; }
        isGroupUseEntireRow() { return isTrue(this.gridOptions.groupUseEntireRow); }
        getGroupColumnDef() { return this.gridOptions.groupColumnDef; }
        isAngularCompileRows() { return isTrue(this.gridOptions.angularCompileRows); }
        isAngularCompileFilters() { return isTrue(this.gridOptions.angularCompileFilters); }
        isAngularCompileHeaders() { return isTrue(this.gridOptions.angularCompileHeaders); }
        getColumnDefs() { return this.gridOptions.columnDefs; }
        getRowHeight() { return this.gridOptions.rowHeight; }
        getBeforeFilterChanged() { return this.gridOptions.beforeFilterChanged; }
        getAfterFilterChanged() { return this.gridOptions.afterFilterChanged; }
        getBeforeSortChanged() { return this.gridOptions.beforeSortChanged; }
        getAfterSortChanged() { return this.gridOptions.afterSortChanged; }
        getModelUpdated() { return this.gridOptions.modelUpdated; }
        getCellClicked() { return this.gridOptions.cellClicked; }
        getCellDoubleClicked() { return this.gridOptions.cellDoubleClicked; }
        getCellValueChanged() { return this.gridOptions.cellValueChanged; }
        getCellFocused() { return this.gridOptions.cellFocused; }
        getRowSelected() { return this.gridOptions.rowSelected; }
        getColumnResized() { return this.gridOptions.columnResized; }
        getColumnVisibilityChanged() { return this.gridOptions.columnVisibilityChanged; }
        getColumnOrderChanged() { return this.gridOptions.columnOrderChanged; }
        getSelectionChanged() { return this.gridOptions.selectionChanged; }
        getVirtualRowRemoved() { return this.gridOptions.virtualRowRemoved; }
        getDatasource() { return this.gridOptions.datasource; }
        getReady() { return this.gridOptions.ready; }
        getRowBuffer() { return this.gridOptions.rowBuffer; }
        isEnableSorting() { return isTrue(this.gridOptions.enableSorting) || isTrue(this.gridOptions.enableServerSideSorting); }
        isEnableCellExpressions() { return isTrue(this.gridOptions.enableCellExpressions); }
        isEnableServerSideSorting() { return isTrue(this.gridOptions.enableServerSideSorting); }
        isEnableFilter() { return isTrue(this.gridOptions.enableFilter) || isTrue(this.gridOptions.enableServerSideFilter); }
        isEnableServerSideFilter() { return this.gridOptions.enableServerSideFilter; }
        isSuppressScrollLag() { return isTrue(this.gridOptions.suppressScrollLag); }
        setSelectedRows(newSelectedRows: any) { return this.gridOptions.selectedRows = newSelectedRows; }
        setSelectedNodesById(newSelectedNodes: any) { return this.gridOptions.selectedNodesById = newSelectedNodes; }
        getIcons() { return this.gridOptions.icons; }
        getIsScrollLag() { return this.gridOptions.isScrollLag; }

        getGroupRowInnerRenderer() {
            if (this.gridOptions.groupInnerRenderer) {
                console.warn('ag-grid: as of v1.10.0 (21st Jun 2015) groupInnerRenderer is now called groupRowInnerRenderer. Please change you code as groupInnerRenderer is deprecated.');
                return this.gridOptions.groupInnerRenderer;
            } else {
                return this.gridOptions.groupRowInnerRenderer;
            }
        }

        getColWidth() {
            if (typeof this.gridOptions.colWidth !== 'number' || this.gridOptions.colWidth < constants.MIN_COL_WIDTH) {
                return 200;
            } else {
                return this.gridOptions.colWidth;
            }
        }

        getHeaderHeight() {
            if (typeof this.gridOptions.headerHeight === 'number') {
                // if header height provided, used it
                return this.gridOptions.headerHeight;
            } else {
                // otherwise return 25 if no grouping, 50 if grouping
                if (this.isGroupHeaders()) {
                    return 50;
                } else {
                    return 25;
                }
            }
        }

        setupDefaults() {
            if (!this.gridOptions.rowHeight) {
                this.gridOptions.rowHeight = DEFAULT_ROW_HEIGHT;
            }
        }

        getPinnedColCount() {
            // if not using scrolls, then pinned columns doesn't make
            // sense, so always return 0
            if (this.isDontUseScrolls()) {
                return 0;
            }
            if (this.gridOptions.pinnedColumnCount) {
                //in case user puts in a string, cast to number
                return Number(this.gridOptions.pinnedColumnCount);
            } else {
                return 0;
            }
        }

        getLocaleTextFunc() {
            var that = this;
            return function (key: any, defaultValue: any) {
                var localeText = that.gridOptions.localeText;
                if (localeText && localeText[key]) {
                    return localeText[key];
                } else {
                    return defaultValue;
                }
            };
        }
    }
}
