import {RowNode} from './entities/rowNode';
import {GridOptions} from './entities/gridOptions';
import EventService from "./eventService";
import Constants from "./constants";
import {ComponentUtil} from "./components/componentUtil";
import {GridApi} from "./gridApi";
import {ColDef} from "./entities/colDef";

var DEFAULT_ROW_HEIGHT = 25;

function isTrue(value: any) {
    return value === true || value === 'true';
}

export default class GridOptionsWrapper {

    private static MIN_COL_WIDTH = 10;

    private gridOptions: GridOptions;

    private headerHeight: number;

    public init(gridOptions: GridOptions, eventService: EventService): void {
        this.gridOptions = gridOptions;

        this.headerHeight = gridOptions.headerHeight;

        eventService.addGlobalListener(this.globalEventHandler.bind(this));

        this.checkForDeprecated();
    }

    public isRowSelection() { return this.gridOptions.rowSelection === "single" || this.gridOptions.rowSelection === "multiple"; }
    public isRowDeselection() { return isTrue(this.gridOptions.rowDeselection); }
    public isRowSelectionMulti() { return this.gridOptions.rowSelection === 'multiple'; }
    public getContext() { return this.gridOptions.context; }
    public isVirtualPaging() { return isTrue(this.gridOptions.virtualPaging); }
    public isShowToolPanel() { return isTrue(this.gridOptions.showToolPanel); }
    public isToolPanelSuppressGroups() { return isTrue(this.gridOptions.toolPanelSuppressGroups); }
    public isToolPanelSuppressValues() { return isTrue(this.gridOptions.toolPanelSuppressValues); }
    public isRowsAlreadyGrouped() { return isTrue(this.gridOptions.rowsAlreadyGrouped); }
    public isGroupSelectsChildren() { return isTrue(this.gridOptions.groupSelectsChildren); }
    public isGroupHideGroupColumns() { return isTrue(this.gridOptions.groupHideGroupColumns); }
    public isGroupIncludeFooter() { return isTrue(this.gridOptions.groupIncludeFooter); }
    public isGroupSuppressBlankHeader() { return isTrue(this.gridOptions.groupSuppressBlankHeader); }
    public isSuppressRowClickSelection() { return isTrue(this.gridOptions.suppressRowClickSelection); }
    public isSuppressCellSelection() { return isTrue(this.gridOptions.suppressCellSelection); }
    public isSuppressMultiSort() { return isTrue(this.gridOptions.suppressMultiSort); }
    public isGroupSuppressAutoColumn() { return isTrue(this.gridOptions.groupSuppressAutoColumn); }
    public isForPrint() { return isTrue(this.gridOptions.forPrint); }
    public isSuppressHorizontalScroll() { return isTrue(this.gridOptions.suppressHorizontalScroll); }
    public isSuppressLoadingOverlay() { return isTrue(this.gridOptions.suppressLoadingOverlay); }
    public isSuppressNoRowsOverlay() { return isTrue(this.gridOptions.suppressNoRowsOverlay); }
    public getFloatingTopRowData(): any[] { return this.gridOptions.floatingTopRowData; }
    public getFloatingBottomRowData(): any[] { return this.gridOptions.floatingBottomRowData; }

    public isUnSortIcon() { return isTrue(this.gridOptions.unSortIcon); }
    public isSuppressMenuHide() { return isTrue(this.gridOptions.suppressMenuHide); }
    public getRowStyle() { return this.gridOptions.rowStyle; }
    public getRowClass() { return this.gridOptions.rowClass; }
    public getRowStyleFunc() { return this.gridOptions.getRowStyle; }
    public getRowClassFunc() { return this.gridOptions.getRowClass; }
    public getBusinessKeyForNodeFunc() { return this.gridOptions.getBusinessKeyForNode; }
    public getHeaderCellRenderer() { return this.gridOptions.headerCellRenderer; }
    public getApi(): GridApi { return this.gridOptions.api; }
    public isEnableColResize() { return isTrue(this.gridOptions.enableColResize); }
    public isSingleClickEdit() { return isTrue(this.gridOptions.singleClickEdit); }
    public getGroupDefaultExpanded(): number { return this.gridOptions.groupDefaultExpanded; }
    public getGroupAggFunction() { return this.gridOptions.groupAggFunction; }
    public getRowData(): any[] { return this.gridOptions.rowData; }
    public isGroupUseEntireRow() { return isTrue(this.gridOptions.groupUseEntireRow); }
    public getGroupColumnDef(): ColDef { return this.gridOptions.groupColumnDef; }
    public isGroupSuppressRow() { return isTrue(this.gridOptions.groupSuppressRow); }
    public isAngularCompileRows() { return isTrue(this.gridOptions.angularCompileRows); }
    public isAngularCompileFilters() { return isTrue(this.gridOptions.angularCompileFilters); }
    public isAngularCompileHeaders() { return isTrue(this.gridOptions.angularCompileHeaders); }
    public isDebug() { return isTrue(this.gridOptions.debug); }
    public getColumnDefs() { return this.gridOptions.columnDefs; }
    public getDatasource() { return this.gridOptions.datasource; }
    public isEnableSorting() { return isTrue(this.gridOptions.enableSorting) || isTrue(this.gridOptions.enableServerSideSorting); }
    public isEnableCellExpressions() { return isTrue(this.gridOptions.enableCellExpressions); }
    public isEnableServerSideSorting() { return isTrue(this.gridOptions.enableServerSideSorting); }
    public isEnableFilter() { return isTrue(this.gridOptions.enableFilter) || isTrue(this.gridOptions.enableServerSideFilter); }
    public isEnableServerSideFilter() { return this.gridOptions.enableServerSideFilter; }
    public isSuppressScrollLag() { return isTrue(this.gridOptions.suppressScrollLag); }
    public isSuppressMovableColumns() { return isTrue(this.gridOptions.suppressMovableColumns); }
    public isSuppressMovingCss() { return isTrue(this.gridOptions.suppressMovingCss); }
    public getIcons() { return this.gridOptions.icons; }
    public getIsScrollLag() { return this.gridOptions.isScrollLag; }
    public getSortingOrder(): string[] { return this.gridOptions.sortingOrder; }
    public getSlaveGrids(): GridOptions[] { return this.gridOptions.slaveGrids; }
    public getGroupRowRenderer() { return this.gridOptions.groupRowRenderer; }
    public getOverlayLoadingTemplate() { return this.gridOptions.overlayLoadingTemplate; }
    public getOverlayNoRowsTemplate() { return this.gridOptions.overlayNoRowsTemplate; }
    public getCheckboxSelection(): Function { return this.gridOptions.checkboxSelection; }
    public isSuppressAutoSize() { return isTrue(this.gridOptions.suppressAutoSize); }
    public isSuppressParentsInRowNodes() { return isTrue(this.gridOptions.suppressParentsInRowNodes); }
    public getHeaderCellTemplate() { return this.gridOptions.headerCellTemplate; }
    public getHeaderCellTemplateFunc() { return this.gridOptions.getHeaderCellTemplate; }

    // properties
    public getHeaderHeight(): number {
        if (typeof this.headerHeight === 'number') {
            return this.headerHeight;
        } else {
            return 25;
        }
    }
    public setHeaderHeight(headerHeight: number): void { this.headerHeight = headerHeight; }

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
        return this.gridOptions.groupRowInnerRenderer;
    }

    public getMinColWidth() {
        if (this.gridOptions.minColWidth > GridOptionsWrapper.MIN_COL_WIDTH) {
            return this.gridOptions.minColWidth;
        } else {
            return GridOptionsWrapper.MIN_COL_WIDTH;
        }
    }

    public getMaxColWidth() {
        if (this.gridOptions.maxColWidth > GridOptionsWrapper.MIN_COL_WIDTH) {
            return this.gridOptions.maxColWidth;
        } else {
            return null;
        }
    }

    public getColWidth() {
        if (typeof this.gridOptions.colWidth !== 'number' || this.gridOptions.colWidth < GridOptionsWrapper.MIN_COL_WIDTH) {
            return 200;
        } else {
            return this.gridOptions.colWidth;
        }
    }

    public getRowBuffer() {
        if (typeof this.gridOptions.rowBuffer === 'number') {
            if (this.gridOptions.rowBuffer < 0) {
                console.warn('ag-Grid: rowBuffer should not be negative')
            }
            return this.gridOptions.rowBuffer;
        } else {
            return Constants.ROW_BUFFER_SIZE;
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
        if (options.groupAggFields) {
            console.warn('ag-grid: as of v3 groupAggFields is not used. Please add appropriate agg fields to your columns.');
        }
        if (options.groupHidePivotColumns) {
            console.warn('ag-grid: as of v3 groupHidePivotColumns is not used as pivot columns are now called rowGroup columns. Please refer to the documentation');
        }
        if (options.groupKeys) {
            console.warn('ag-grid: as of v3 groupKeys is not used. You need to set rowGroupIndex on the columns to group. Please refer to the documentation');
        }
        if (options.ready || options.onReady) {
            console.warn('ag-grid: as of v3.3 ready event is now called gridReady, so the callback should be onGridReady');
        }
        if (typeof options.groupDefaultExpanded === 'boolean') {
            console.warn('ag-grid: groupDefaultExpanded can no longer be boolean. for groupDefaultExpanded=true, use groupDefaultExpanded=9999 instead, to expand all the groups');
        }
    }

    public getLocaleTextFunc() {
        if (this.gridOptions.localeTextFunc) {
            return this.gridOptions.localeTextFunc;
        }
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

    // responsible for calling the onXXX functions on gridOptions
    public globalEventHandler(eventName: string, event?: any): void {
        var callbackMethodName = ComponentUtil.getCallbackForEvent(eventName);
        if (typeof (<any>this.gridOptions)[callbackMethodName] === 'function') {
            (<any>this.gridOptions)[callbackMethodName](event);
        }
    }

    // we don't allow dynamic row height for virtual paging
    public getRowHeightForVirtualPagiation(): number {
        if (typeof this.gridOptions.rowHeight === 'number') {
            return this.gridOptions.rowHeight;
        } else {
            return DEFAULT_ROW_HEIGHT;
        }
    }

    public getRowHeightForNode(rowNode: RowNode): number {
        if (typeof this.gridOptions.rowHeight === 'number') {
            return this.gridOptions.rowHeight;
        } else if (typeof this.gridOptions.getRowHeight === 'function') {
            var params = {
                node: rowNode,
                data: rowNode.data,
                api: this.gridOptions.api,
                context: this.gridOptions.context
            };
            return this.gridOptions.getRowHeight(params);
        } else {
            return DEFAULT_ROW_HEIGHT;
        }
    }
}
