/// <reference path="constants.ts" />

module awk.grid {

    var DEFAULT_ROW_HEIGHT = 25;
    var constants = Constants;

    function isTrue(value: any) {
        return value === true || value === 'true';
    }

    export interface GenericEventListener {
        (eventName: string, event: any): void;
    }

    export class GridOptionsWrapper {

        private gridOptions: GridOptions;

        private groupHeaders: boolean;
        private headerHeight: number;
        private rowHeight: number;
        private floatingTopRowData: any[];
        private floatingBottomRowData: any[];

        private genericEventListeners: GenericEventListener [] = [];

        constructor(gridOptions: GridOptions, genericEventListener: GenericEventListener) {
            this.gridOptions = gridOptions;
            if (genericEventListener) {
                this.genericEventListeners.push(genericEventListener);
            }

            this.headerHeight = gridOptions.headerHeight;
            this.groupHeaders = gridOptions.groupHeaders;
            this.rowHeight = gridOptions.rowHeight;
            this.floatingTopRowData = gridOptions.floatingTopRowData;
            this.floatingBottomRowData = gridOptions.floatingBottomRowData;

            // set defaults
            if (!this.rowHeight) {
                this.rowHeight = DEFAULT_ROW_HEIGHT;
            }

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
        public getRowData(): any[] { return this.gridOptions.rowData; }
        public isGroupUseEntireRow() { return isTrue(this.gridOptions.groupUseEntireRow); }
        public getGroupColumnDef() { return this.gridOptions.groupColumnDef; }
        public isGroupSuppressRow() { return isTrue(this.gridOptions.groupSuppressRow); }
        public isAngularCompileRows() { return isTrue(this.gridOptions.angularCompileRows); }
        public isAngularCompileFilters() { return isTrue(this.gridOptions.angularCompileFilters); }
        public isAngularCompileHeaders() { return isTrue(this.gridOptions.angularCompileHeaders); }
        public isDebug() { return isTrue(this.gridOptions.debug); }
        public getColumnDefs() { return this.gridOptions.columnDefs; }
        public getColumnResized() { return this.gridOptions.columnResized; }
        public getColumnVisibilityChanged() { return this.gridOptions.columnVisibilityChanged; }
        public getColumnOrderChanged() { return this.gridOptions.columnOrderChanged; }
        public getDatasource() { return this.gridOptions.datasource; }
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
        public getRowHeight() { return this.rowHeight; }

        // properties
        public getHeaderHeight(): number {
            if (typeof this.headerHeight === 'number') {
                return this.headerHeight;
            } else {
                // otherwise return 25 if no grouping, 50 if grouping
                if (this.groupHeaders) {
                    return 50;
                } else {
                    return 25;
                }
            }
        }
        public setHeaderHeight(headerHeight: number): void { this.headerHeight = headerHeight; }

        public isGroupHeaders(): boolean { return isTrue(this.groupHeaders); }
        public setGroupHeaders(groupHeaders: boolean): void { this.groupHeaders = groupHeaders; }

        public getFloatingTopRowData(): any[] { return this.floatingTopRowData; }
        public setFloatingTopRowData(rows: any[]): void { this.floatingTopRowData = rows; }
        public getFloatingBottomRowData(): any[] { return this.floatingBottomRowData; }
        public setFloatingBottomRowData(rows: any[]): void { this.floatingBottomRowData = rows; }

        public isExternalFilterPresent() {
            if (typeof this.gridOptions.isExternalFilterPresent === 'function') {
                return this.gridOptions.isExternalFilterPresent();
            } else {
                return false;
            }
        }

        public doesExternalFilterPass(node: RowNode) {
            if (typeof this.gridOptions.doesExternalFilterPass === 'function') {
                return this.gridOptions.doesExternalFilterPass(node);
            } else {
                return false;
            }
        }

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

        public fireEvent(eventName: string, event?: any): void {
            if (typeof (<any>this.gridOptions)[eventName] === 'function') {
                (<any>this.gridOptions)[eventName](event);
            }
            this.genericEventListeners.forEach( (listener: GenericEventListener) => {
                listener(eventName, event);
            });
        }
    }
}
