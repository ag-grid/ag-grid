/// <reference path="constants.ts" />

module awk.grid {

    var DEFAULT_ROW_HEIGHT = 30;
    var constants = Constants;

    function isTrue(value: any) {
        return value === true || value === 'true';
    }

    export class GridOptionsWrapper {

        private gridOptions: GridOptions;

        constructor(gridOptions: GridOptions) {
            this.gridOptions = gridOptions;
            this.setupDefaults();
            this.checkForDeprecated();
        }

        public isRowSelection() { return this.gridOptions.rowSelection === "single" || this.gridOptions.rowSelection === "multiple"; }
        public isRowDeselection() { return isTrue(this.gridOptions.rowDeselection); }
        public isRowSelectionMulti() { return this.gridOptions.rowSelection === 'multiple'; }
        public getContext() { return this.gridOptions.context; }
        public isVirtualPaging() { return isTrue(this.gridOptions.virtualPaging); }
        public isShowToolPanel() { return isTrue(this.gridOptions.showToolPanel); }
        public isToolPanelSuppressPivot() { return isTrue(this.gridOptions.toolPanelSuppressPivot); }
        public isToolPanelSuppressValues() { return isTrue(this.gridOptions.toolPanelSuppressValues); }
        public isRowsAlreadyGrouped() { return isTrue(this.gridOptions.rowsAlreadyGrouped); }
        public isGroupSelectsChildren() { return isTrue(this.gridOptions.groupSelectsChildren); }
        public isGroupHidePivotColumns() { return isTrue(this.gridOptions.groupHidePivotColumns); }
        public isGroupIncludeFooter() { return isTrue(this.gridOptions.groupIncludeFooter); }
        public isGroupSuppressBlankHeader() { return isTrue(this.gridOptions.groupSuppressBlankHeader); }
        public isSuppressRowClickSelection() { return isTrue(this.gridOptions.suppressRowClickSelection); }
        public isSuppressCellSelection() { return isTrue(this.gridOptions.suppressCellSelection); }
        public isSuppressMultiSort() { return isTrue(this.gridOptions.suppressMultiSort); }
        public isGroupSuppressAutoColumn() { return isTrue(this.gridOptions.groupSuppressAutoColumn); }
        public isGroupHeaders() { return isTrue(this.gridOptions.groupHeaders); }
        public isDontUseScrolls() { return isTrue(this.gridOptions.dontUseScrolls); }
        public isSuppressHorizontalScroll() { return isTrue(this.gridOptions.suppressHorizontalScroll); }
        public isUnSortIcon() { return isTrue(this.gridOptions.unSortIcon); }
        public isSuppressMenuHide() { return isTrue(this.gridOptions.suppressMenuHide); }
        public getRowStyle() { return this.gridOptions.rowStyle; }
        public getRowClass() { return this.gridOptions.rowClass; }
        public getHeaderCellRenderer() { return this.gridOptions.headerCellRenderer; }
        public getApi() { return this.gridOptions.api; }
        public isEnableColResize() { return isTrue(this.gridOptions.enableColResize); }
        public getGroupDefaultExpanded() { return this.gridOptions.groupDefaultExpanded; }
        public getGroupKeys() { return this.gridOptions.groupKeys; }
        public getGroupAggFunction() { return this.gridOptions.groupAggFunction; }
        public getGroupAggFields() { return this.gridOptions.groupAggFields; }
        public getAllRows() { return this.gridOptions.rowData; }
        public isGroupUseEntireRow() { return isTrue(this.gridOptions.groupUseEntireRow); }
        public getGroupColumnDef() { return this.gridOptions.groupColumnDef; }
        public isGroupSuppressRow() { return isTrue(this.gridOptions.groupSuppressRow); }
        public isAngularCompileRows() { return isTrue(this.gridOptions.angularCompileRows); }
        public isAngularCompileFilters() { return isTrue(this.gridOptions.angularCompileFilters); }
        public isAngularCompileHeaders() { return isTrue(this.gridOptions.angularCompileHeaders); }
        public isDebug() { return isTrue(this.gridOptions.debug); }
        public getColumnDefs() { return this.gridOptions.columnDefs; }
        public getRowHeight() { return this.gridOptions.rowHeight; }
        public getBeforeFilterChanged() { return this.gridOptions.beforeFilterChanged; }
        public getAfterFilterChanged() { return this.gridOptions.afterFilterChanged; }
        public getFilterModified() { return this.gridOptions.filterModified; }
        public getBeforeSortChanged() { return this.gridOptions.beforeSortChanged; }
        public getAfterSortChanged() { return this.gridOptions.afterSortChanged; }
        public getModelUpdated() { return this.gridOptions.modelUpdated; }
        public getCellClicked() { return this.gridOptions.cellClicked; }
        public getCellDoubleClicked() { return this.gridOptions.cellDoubleClicked; }
        public getCellValueChanged() { return this.gridOptions.cellValueChanged; }
        public getCellFocused() { return this.gridOptions.cellFocused; }
        public getRowSelected() { return this.gridOptions.rowSelected; }
        public getColumnResized() { return this.gridOptions.columnResized; }
        public getColumnVisibilityChanged() { return this.gridOptions.columnVisibilityChanged; }
        public getColumnOrderChanged() { return this.gridOptions.columnOrderChanged; }
        public getSelectionChanged() { return this.gridOptions.selectionChanged; }
        public getVirtualRowRemoved() { return this.gridOptions.virtualRowRemoved; }
        public getDatasource() { return this.gridOptions.datasource; }
        public getReady() { return this.gridOptions.ready; }
        public getRowBuffer() { return this.gridOptions.rowBuffer; }
        public isEnableSorting() { return isTrue(this.gridOptions.enableSorting) || isTrue(this.gridOptions.enableServerSideSorting); }
        public isEnableCellExpressions() { return isTrue(this.gridOptions.enableCellExpressions); }
        public isEnableServerSideSorting() { return isTrue(this.gridOptions.enableServerSideSorting); }
        public isEnableFilter() { return isTrue(this.gridOptions.enableFilter) || isTrue(this.gridOptions.enableServerSideFilter); }
        public isEnableServerSideFilter() { return this.gridOptions.enableServerSideFilter; }
        public isSuppressScrollLag() { return isTrue(this.gridOptions.suppressScrollLag); }
        public setSelectedRows(newSelectedRows: any) { return this.gridOptions.selectedRows = newSelectedRows; }
        public setSelectedNodesById(newSelectedNodes: any) { return this.gridOptions.selectedNodesById = newSelectedNodes; }
        public getIcons() { return this.gridOptions.icons; }
        public getIsScrollLag() { return this.gridOptions.isScrollLag; }
        public getSortingOrder(): string[] { return this.gridOptions.sortingOrder; }
        public getSlaveGrids(): GridOptions[] { return this.gridOptions.slaveGrids; }
        public getGroupRowRenderer() { return this.gridOptions.groupRowRenderer; }

        public getGroupRowInnerRenderer() {
            if (this.gridOptions.groupInnerRenderer) {
                console.warn('ag-grid: as of v1.10.0 (21st Jun 2015) groupInnerRenderer is now called groupRowInnerRenderer. Please change you code as groupInnerRenderer is deprecated.');
                return this.gridOptions.groupInnerRenderer;
            } else {
                return this.gridOptions.groupRowInnerRenderer;
            }
        }

        public getColWidth() {
            if (typeof this.gridOptions.colWidth !== 'number' || this.gridOptions.colWidth < constants.MIN_COL_WIDTH) {
                return 200;
            } else {
                return this.gridOptions.colWidth;
            }
        }

        public getHeaderHeight() {
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

        private setupDefaults() {
            if (!this.gridOptions.rowHeight) {
                this.gridOptions.rowHeight = DEFAULT_ROW_HEIGHT;
            }
        }

        private checkForDeprecated() {
            // casting to generic object, so typescript compiles even though
            // we are looking for attributes that don't exist
            var options: any = this.gridOptions;
            if (options.suppressUnSort) {
                console.warn('ag-grid: as of v1.12.4 suppressUnSort is not used. Please use sortOrder instead.');
            }
            if (options.suppressDescSort) {
                console.warn('ag-grid: as of v1.12.4 suppressDescSort is not used. Please use sortOrder instead.');
            }
        }

        public getPinnedColCount() {
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

        public getLocaleTextFunc() {
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
