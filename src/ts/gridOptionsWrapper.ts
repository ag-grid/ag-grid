import {RowNode} from "./entities/rowNode";
import {
    GridOptions,
    NodeChildDetails,
    GetContextMenuItems,
    GetMainMenuItems,
    ProcessRowParams,
    ProcessCellForExportParams, GetRowNodeIdFunc
} from "./entities/gridOptions";
import {EventService} from "./eventService";
import {Constants} from "./constants";
import {ComponentUtil} from "./components/componentUtil";
import {GridApi} from "./gridApi";
import {ColDef, IAggFunc} from "./entities/colDef";
import {Bean, Qualifier, Autowired, PostConstruct, PreDestroy} from "./context/context";
import {ColumnController, ColumnApi} from "./columnController/columnController";
import {Events} from "./events";
import {Utils as _} from "./utils";
import {IViewportDatasource} from "./interfaces/iViewportDatasource";
import {ICellRendererFunc, ICellRenderer} from "./rendering/cellRenderers/iCellRenderer";
import {Logger, LoggerFactory} from "./logger";

var DEFAULT_ROW_HEIGHT = 25;
var DEFAULT_VIEWPORT_ROW_MODEL_PAGE_SIZE = 5;
var DEFAULT_VIEWPORT_ROW_MODEL_BUFFER_SIZE = 5;

function isTrue(value: any): boolean {
    return value === true || value === 'true';
}

function positiveNumberOrZero(value: any, defaultValue: number): number {
    if (value > 0) {
        return value;
    } else {
        // zero gets returned if number is missing or the wrong type
        return defaultValue;
    }
}

@Bean('gridOptionsWrapper')
export class GridOptionsWrapper {

    private static MIN_COL_WIDTH = 10;

    public static PROP_HEADER_HEIGHT = 'headerHeight';

    @Autowired('gridOptions') private gridOptions: GridOptions;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('eventService') private eventService: EventService;
    @Autowired('enterprise') private enterprise: boolean;

    private propertyEventService: EventService = new EventService();

    private agWire(@Qualifier('gridApi') gridApi: GridApi, @Qualifier('columnApi') columnApi: ColumnApi): void {
        this.gridOptions.api = gridApi;
        this.gridOptions.columnApi = columnApi;
        this.checkForDeprecated();
    }

    @PreDestroy
    private destroy(): void {
        // need to remove these, as we don't own the lifecycle of the gridOptions, we need to
        // remove the references in case the user keeps the grid options, we want the rest
        // of the grid to be picked up by the garbage collector
        this.gridOptions.api = null;
        this.gridOptions.columnApi = null;
    }

    @PostConstruct
    public init(): void {
        this.eventService.addGlobalListener(this.globalEventHandler.bind(this));

        if (this.isGroupSelectsChildren() && this.isSuppressParentsInRowNodes()) {
            console.warn('ag-Grid: groupSelectsChildren does not work wth suppressParentsInRowNodes, this selection method needs the part in rowNode to work');
        }

        if (this.isGroupSelectsChildren() && !this.isRowSelectionMulti()) {
            console.warn('ag-Grid: rowSelectionMulti must be true for groupSelectsChildren to make sense');
        }
    }

    public isEnterprise() { return this.enterprise;}
    public isRowSelection() { return this.gridOptions.rowSelection === "single" || this.gridOptions.rowSelection === "multiple"; }
    public isRowDeselection() { return isTrue(this.gridOptions.rowDeselection); }
    public isRowSelectionMulti() { return this.gridOptions.rowSelection === 'multiple'; }
    public getContext() { return this.gridOptions.context; }
    public isPivotMode() { return isTrue(this.gridOptions.pivotMode); }

    public isRowModelPagination() { return this.gridOptions.rowModelType === Constants.ROW_MODEL_TYPE_PAGINATION; }
    public isRowModelVirtual() { return this.gridOptions.rowModelType === Constants.ROW_MODEL_TYPE_VIRTUAL; }
    public isRowModelViewport() { return this.gridOptions.rowModelType === Constants.ROW_MODEL_TYPE_VIEWPORT; }
    public isRowModelDefault() { return !(this.isRowModelPagination() || this.isRowModelVirtual() || this.isRowModelViewport()); }

    public isSuppressFocusAfterRefresh() { return isTrue(this.gridOptions.suppressFocusAfterRefresh); }
    public isShowToolPanel() { return isTrue(this.gridOptions.showToolPanel); }
    public isToolPanelSuppressRowGroups() { return isTrue(this.gridOptions.toolPanelSuppressRowGroups); }
    public isToolPanelSuppressValues() { return isTrue(this.gridOptions.toolPanelSuppressValues); }
    public isToolPanelSuppressPivots() { return isTrue(this.gridOptions.toolPanelSuppressPivots); }
    public isToolPanelSuppressPivotMode() { return isTrue(this.gridOptions.toolPanelSuppressPivotMode); }
    public isEnableCellChangeFlash() { return isTrue(this.gridOptions.enableCellChangeFlash); }
    public isGroupSelectsChildren() { return isTrue(this.gridOptions.groupSelectsChildren); }
    public isGroupIncludeFooter() { return isTrue(this.gridOptions.groupIncludeFooter); }
    public isGroupSuppressBlankHeader() { return isTrue(this.gridOptions.groupSuppressBlankHeader); }
    public isSuppressRowClickSelection() { return isTrue(this.gridOptions.suppressRowClickSelection); }
    public isSuppressCellSelection() { return isTrue(this.gridOptions.suppressCellSelection); }
    public isSuppressMultiSort() { return isTrue(this.gridOptions.suppressMultiSort); }
    public isGroupSuppressAutoColumn() { return isTrue(this.gridOptions.groupSuppressAutoColumn); }
    public isSuppressDragLeaveHidesColumns() { return isTrue(this.gridOptions.suppressDragLeaveHidesColumns); }
    public isForPrint() { return isTrue(this.gridOptions.forPrint); }
    public isSuppressHorizontalScroll() { return isTrue(this.gridOptions.suppressHorizontalScroll); }
    public isSuppressLoadingOverlay() { return isTrue(this.gridOptions.suppressLoadingOverlay); }
    public isSuppressNoRowsOverlay() { return isTrue(this.gridOptions.suppressNoRowsOverlay); }
    public isSuppressFieldDotNotation() { return isTrue(this.gridOptions.suppressFieldDotNotation); }
    public getFloatingTopRowData(): any[] { return this.gridOptions.floatingTopRowData; }
    public getFloatingBottomRowData(): any[] { return this.gridOptions.floatingBottomRowData; }
    public isFunctionsPassive() { return isTrue(this.gridOptions.functionsPassive); }

    public getQuickFilterText(): string { return this.gridOptions.quickFilterText; }
    public isUnSortIcon() { return isTrue(this.gridOptions.unSortIcon); }
    public isSuppressMenuHide() { return isTrue(this.gridOptions.suppressMenuHide); }
    public getRowStyle() { return this.gridOptions.rowStyle; }
    public getRowClass() { return this.gridOptions.rowClass; }
    public getRowStyleFunc() { return this.gridOptions.getRowStyle; }
    public getRowClassFunc() { return this.gridOptions.getRowClass; }
    public getDoesDataFlowerFunc(): (data: any)=>boolean { return this.gridOptions.doesDataFlower; }

    public getIsFullWidthCellFunc(): (rowNode: RowNode)=> boolean { return this.gridOptions.isFullWidthCell; }
    public getFullWidthCellRenderer(): {new(): ICellRenderer} | ICellRendererFunc | string { return this.gridOptions.fullWidthCellRenderer; }
    public getFullWidthCellRendererParams() { return this.gridOptions.fullWidthCellRendererParams; }

    public getBusinessKeyForNodeFunc() { return this.gridOptions.getBusinessKeyForNode; }
    public getHeaderCellRenderer() { return this.gridOptions.headerCellRenderer; }
    public getApi(): GridApi { return this.gridOptions.api; }
    public getColumnApi(): ColumnApi { return this.gridOptions.columnApi; }
    public isEnableColResize() { return isTrue(this.gridOptions.enableColResize); }
    public isSingleClickEdit() { return isTrue(this.gridOptions.singleClickEdit); }
    public getGroupDefaultExpanded(): number { return this.gridOptions.groupDefaultExpanded; }
    public getAutoSizePadding(): number { return this.gridOptions.autoSizePadding; }

    public getMaxConcurrentDatasourceRequests(): number { return this.gridOptions.maxConcurrentDatasourceRequests; }
    public getMaxPagesInCache(): number { return this.gridOptions.maxPagesInCache; }
    public getPaginationOverflowSize(): number { return this.gridOptions.paginationOverflowSize; }
    public getPaginationPageSize(): number { return this.gridOptions.paginationPageSize; }
    public getPaginationInitialRowCount(): number { return this.gridOptions.paginationInitialRowCount; }

    public getRowData(): any[] { return this.gridOptions.rowData; }
    public isGroupUseEntireRow() { return isTrue(this.gridOptions.groupUseEntireRow); }
    public getGroupColumnDef(): ColDef { return this.gridOptions.groupColumnDef; }
    public isGroupSuppressRow() { return isTrue(this.gridOptions.groupSuppressRow); }
    public getRowGroupPanelShow() { return this.gridOptions.rowGroupPanelShow; }
    public getPivotPanelShow() { return this.gridOptions.pivotPanelShow; }
    public isAngularCompileRows() { return isTrue(this.gridOptions.angularCompileRows); }
    public isAngularCompileFilters() { return isTrue(this.gridOptions.angularCompileFilters); }
    public isAngularCompileHeaders() { return isTrue(this.gridOptions.angularCompileHeaders); }
    public isDebug() { return isTrue(this.gridOptions.debug); }
    public getColumnDefs() { return this.gridOptions.columnDefs; }
    public getDatasource() { return this.gridOptions.datasource; }
    public getViewportDatasource(): IViewportDatasource { return this.gridOptions.viewportDatasource; }
    public isEnableSorting() { return isTrue(this.gridOptions.enableSorting) || isTrue(this.gridOptions.enableServerSideSorting); }
    public isEnableCellExpressions() { return isTrue(this.gridOptions.enableCellExpressions); }
    public isSuppressMiddleClickScrolls() { return isTrue(this.gridOptions.suppressMiddleClickScrolls); }
    public isSuppressPreventDefaultOnMouseWheel() { return isTrue(this.gridOptions.suppressPreventDefaultOnMouseWheel); }
    public isEnableServerSideSorting() { return isTrue(this.gridOptions.enableServerSideSorting); }
    public isSuppressColumnVirtualisation() { return isTrue(this.gridOptions.suppressColumnVirtualisation); }
    public isSuppressContextMenu() { return isTrue(this.gridOptions.suppressContextMenu); }
    public isSuppressCopyRowsToClipboard() { return isTrue(this.gridOptions.suppressCopyRowsToClipboard); }
    public isEnableFilter() { return isTrue(this.gridOptions.enableFilter) || isTrue(this.gridOptions.enableServerSideFilter); }
    public isEnableServerSideFilter() { return this.gridOptions.enableServerSideFilter; }
    public isSuppressScrollLag() { return isTrue(this.gridOptions.suppressScrollLag); }
    public isSuppressMovableColumns() { return isTrue(this.gridOptions.suppressMovableColumns); }
    public isSuppressColumnMoveAnimation() { return isTrue(this.gridOptions.suppressColumnMoveAnimation); }
    public isSuppressMenuColumnPanel() { return isTrue(this.gridOptions.suppressMenuColumnPanel); }
    public isSuppressMenuFilterPanel() { return isTrue(this.gridOptions.suppressMenuFilterPanel); }
    public isSuppressUseColIdForGroups() { return isTrue(this.gridOptions.suppressUseColIdForGroups); }
    public isSuppressAggFuncInHeader() { return isTrue(this.gridOptions.suppressAggFuncInHeader); }
    public isSuppressMenuMainPanel() { return isTrue(this.gridOptions.suppressMenuMainPanel); }
    public isEnableRangeSelection(): boolean { return isTrue(this.gridOptions.enableRangeSelection); }
    public isRememberGroupStateWhenNewData(): boolean { return isTrue(this.gridOptions.rememberGroupStateWhenNewData); }
    public getIcons() { return this.gridOptions.icons; }
    public getAggFuncs(): {[key: string]: IAggFunc} { return this.gridOptions.aggFuncs; }
    public getIsScrollLag() { return this.gridOptions.isScrollLag; }
    public getSortingOrder(): string[] { return this.gridOptions.sortingOrder; }
    public getSlaveGrids(): GridOptions[] { return this.gridOptions.slaveGrids; }
    public getGroupRowRenderer(): {new(): ICellRenderer} | ICellRendererFunc | string { return this.gridOptions.groupRowRenderer; }
    public getGroupRowRendererParams() { return this.gridOptions.groupRowRendererParams; }
    public getGroupRowInnerRenderer(): {new(): ICellRenderer} | ICellRendererFunc | string { return this.gridOptions.groupRowInnerRenderer; }
    public getOverlayLoadingTemplate() { return this.gridOptions.overlayLoadingTemplate; }
    public getOverlayNoRowsTemplate() { return this.gridOptions.overlayNoRowsTemplate; }
    public getCheckboxSelection(): Function { return this.gridOptions.checkboxSelection; }
    public isSuppressAutoSize() { return isTrue(this.gridOptions.suppressAutoSize); }
    public isSuppressParentsInRowNodes() { return isTrue(this.gridOptions.suppressParentsInRowNodes); }
    public isEnableStatusBar() { return isTrue(this.gridOptions.enableStatusBar); }
    public isFunctionsReadOnly() { return isTrue(this.gridOptions.functionsReadOnly); }

    public getHeaderCellTemplate() { return this.gridOptions.headerCellTemplate; }
    public getHeaderCellTemplateFunc() { return this.gridOptions.getHeaderCellTemplate; }
    public getNodeChildDetailsFunc(): ((dataItem: any)=> NodeChildDetails) { return this.gridOptions.getNodeChildDetails; }
    public getGroupRowAggNodesFunc() { return this.gridOptions.groupRowAggNodes; }
    public getContextMenuItemsFunc(): GetContextMenuItems { return this.gridOptions.getContextMenuItems; }
    public getMainMenuItemsFunc(): GetMainMenuItems { return this.gridOptions.getMainMenuItems; }
    public getRowNodeIdFunc(): GetRowNodeIdFunc { return this.gridOptions.getRowNodeId; }

    public getProcessCellForClipboardFunc(): (params: ProcessCellForExportParams)=>any { return this.gridOptions.processCellForClipboard; }
    public getViewportRowModelPageSize(): number { return positiveNumberOrZero(this.gridOptions.viewportRowModelPageSize, DEFAULT_VIEWPORT_ROW_MODEL_PAGE_SIZE); }
    public getViewportRowModelBufferSize(): number { return positiveNumberOrZero(this.gridOptions.viewportRowModelBufferSize, DEFAULT_VIEWPORT_ROW_MODEL_BUFFER_SIZE); }
    // public getCellRenderers(): {[key: string]: {new(): ICellRenderer} | ICellRendererFunc} { return this.gridOptions.cellRenderers; }
    // public getCellEditors(): {[key: string]: {new(): ICellEditor}} { return this.gridOptions.cellEditors; }

    public setProperty(key: string, value: any): void {
        var gridOptionsNoType = <any> this.gridOptions;
        var previousValue = gridOptionsNoType[key];
        gridOptionsNoType[key] = value;
        this.propertyEventService.dispatchEvent(key, {currentValue: value, previousValue: previousValue});
    }

    public addEventListener(key: string, listener: Function): void {
        this.propertyEventService.addEventListener(key, listener);
    }

    public removeEventListener(key: string, listener: Function): void {
        this.propertyEventService.removeEventListener(key, listener);
    }

    public executeProcessRowPostCreateFunc(params: ProcessRowParams): void {
        if (this.gridOptions.processRowPostCreate) {
            this.gridOptions.processRowPostCreate(params);
        }
    }

    // properties
    public getHeaderHeight(): number {
        if (typeof this.gridOptions.headerHeight === 'number') {
            return this.gridOptions.headerHeight;
        } else {
            return 25;
        }
    }

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

    public getLayoutInterval(): number {
        if (typeof this.gridOptions.layoutInterval === 'number') {
            return this.gridOptions.layoutInterval;
        } else {
            return Constants.LAYOUT_INTERVAL;
        }
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
        if (options.onRowDeselected || options.rowDeselected) {
            console.warn('ag-grid: since version 3.4 event rowDeselected no longer exists, please check the docs');
        }
        if (options.rowsAlreadyGrouped) {
            console.warn('ag-grid: since version 3.4 rowsAlreadyGrouped no longer exists, please use getNodeChildDetails() instead');
        }
        if (options.groupAggFunction) {
            console.warn('ag-grid: since version 4.3.x groupAggFunction is now called groupRowAggNodes');
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
    public getRowHeightAsNumber(): number {
        var rowHeight = this.gridOptions.rowHeight;
        if (_.missing(rowHeight)) {
            return DEFAULT_ROW_HEIGHT;
        } else if (typeof this.gridOptions.rowHeight === 'number') {
            return this.gridOptions.rowHeight;
        } else {
            console.warn('ag-Grid row height must be a number if not using standard row model');
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
