import {RowNode} from "./entities/rowNode";
import {
    GridOptions,
    NodeChildDetails,
    GetContextMenuItems,
    NavigateToNextCellParams,
    TabToNextCellParams, GetMainMenuItems, GetRowNodeIdFunc, ProcessRowParams
} from "./entities/gridOptions";
import {EventService} from "./eventService";
import {Constants} from "./constants";
import {ComponentUtil} from "./components/componentUtil";
import {GridApi} from "./gridApi";
import {ColDef, IAggFunc, ColGroupDef} from "./entities/colDef";
import {Bean, Qualifier, Autowired, PostConstruct, PreDestroy} from "./context/context";
import {ColumnController, ColumnApi} from "./columnController/columnController";
import {Utils as _} from "./utils";
import {IViewportDatasource} from "./interfaces/iViewportDatasource";
import {ICellRendererFunc, ICellRenderer, ICellRendererComp} from "./rendering/cellRenderers/iCellRenderer";
import {IFrameworkFactory} from "./interfaces/iFrameworkFactory";
import {IDatasource} from "./rowModels/iDatasource";
import {GridCellDef} from "./entities/gridCell";
import {IEnterpriseDatasource} from "./interfaces/iEnterpriseDatasource";
import {CsvExportParams, ProcessCellForExportParams} from "./exportParams";

var DEFAULT_ROW_HEIGHT = 25;
var DEFAULT_VIEWPORT_ROW_MODEL_PAGE_SIZE = 5;
var DEFAULT_VIEWPORT_ROW_MODEL_BUFFER_SIZE = 5;

function isTrue(value: any): boolean {
    return value === true || value === 'true';
}

function zeroOrGreater(value: any, defaultValue: number): number {
    if (value >= 0) {
        return value;
    } else {
        // zero gets returned if number is missing or the wrong type
        return defaultValue;
    }
}

function oneOrGreater(value: any, defaultValue: number): number {
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
    @Autowired('frameworkFactory') private frameworkFactory: IFrameworkFactory;

    private propertyEventService: EventService = new EventService();

    private fullWidthCellRenderer : {new(): ICellRendererComp} | ICellRendererFunc | string;
    private groupRowRenderer : {new(): ICellRendererComp} | ICellRendererFunc | string;
    private groupRowInnerRenderer : {new(): ICellRendererComp} | ICellRendererFunc | string;

    private domDataKey = '__AG_'+Math.random().toString();

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

        this.setupFrameworkComponents();

        if (this.isGroupSelectsChildren() && this.isSuppressParentsInRowNodes()) {
            console.warn('ag-Grid: groupSelectsChildren does not work wth suppressParentsInRowNodes, this selection method needs the part in rowNode to work');
        }

        if (this.isGroupSelectsChildren() && !this.isRowSelectionMulti()) {
            console.warn('ag-Grid: rowSelectionMulti must be true for groupSelectsChildren to make sense');
        }

        if (this.isGroupRemoveSingleChildren() && this.isGroupHideOpenParents()) {
            console.warn('ag-Grid: groupRemoveSingleChildren and groupHideOpenParents do not work with each other, you need to pick one. And don\'t ask us how to us these together on our support forum either you will get the same answer!');
        }
    }

    private setupFrameworkComponents(): void {
        this.fullWidthCellRenderer = this.frameworkFactory.gridOptionsFullWidthCellRenderer(this.gridOptions);
        this.groupRowRenderer = this.frameworkFactory.gridOptionsGroupRowRenderer(this.gridOptions);
        this.groupRowInnerRenderer = this.frameworkFactory.gridOptionsGroupRowInnerRenderer(this.gridOptions);
    }

    public getDomDataKey(): string {
        return this.domDataKey;
    }

    // the cellRenderers come from the instances for this class, not from gridOptions, which allows
    // the baseFrameworkFactory to replace with framework specific ones
    public getFullWidthCellRenderer(): {new(): ICellRendererComp} | ICellRendererFunc | string { return this.fullWidthCellRenderer; }
    public getGroupRowRenderer(): {new(): ICellRendererComp} | ICellRendererFunc | string { return this.groupRowRenderer; }
    public getGroupRowInnerRenderer(): {new(): ICellRendererComp} | ICellRendererFunc | string { return this.groupRowInnerRenderer; }

    public isEnterprise() { return this.enterprise;}
    public isRowSelection() { return this.gridOptions.rowSelection === "single" || this.gridOptions.rowSelection === "multiple"; }
    public isRowDeselection() { return isTrue(this.gridOptions.rowDeselection); }
    public isRowSelectionMulti() { return this.gridOptions.rowSelection === 'multiple'; }
    public getContext() { return this.gridOptions.context; }
    public isPivotMode() { return isTrue(this.gridOptions.pivotMode); }

    public isRowModelServerPagination() { return this.gridOptions.rowModelType === Constants.ROW_MODEL_TYPE_PAGINATION; }
    public isRowModelInfinite() { return this.gridOptions.rowModelType === Constants.ROW_MODEL_TYPE_VIRTUAL_DEPRECATED
                                        || this.gridOptions.rowModelType === Constants.ROW_MODEL_TYPE_INFINITE; }
    public isRowModelViewport() { return this.gridOptions.rowModelType === Constants.ROW_MODEL_TYPE_VIEWPORT; }
    public isRowModelEnterprise() { return this.gridOptions.rowModelType === Constants.ROW_MODEL_TYPE_ENTERPRISE; }
    public isRowModelDefault() { return !(
        this.isRowModelServerPagination() ||
        this.isRowModelInfinite() ||
        this.isRowModelViewport());
    }

    public isFullRowEdit() { return this.gridOptions.editType === 'fullRow'; }
    public isSuppressFocusAfterRefresh() { return isTrue(this.gridOptions.suppressFocusAfterRefresh); }
    public isShowToolPanel() { return isTrue(this.gridOptions.showToolPanel); }
    public isToolPanelSuppressRowGroups() { return isTrue(this.gridOptions.toolPanelSuppressRowGroups); }
    public isToolPanelSuppressValues() { return isTrue(this.gridOptions.toolPanelSuppressValues); }
    public isToolPanelSuppressPivots() {
        // never allow pivot mode when using enterprise model
        if (this.isRowModelEnterprise()) { return true; }
        // otherwise, let user decide
        return isTrue(this.gridOptions.toolPanelSuppressPivots);
    }
    public isToolPanelSuppressPivotMode() {
        // never allow pivot mode when using enterprise model
        if (this.isRowModelEnterprise()) { return true; }
        // otherwise, let user decide
        return isTrue(this.gridOptions.toolPanelSuppressPivotMode);
    }
    public isSuppressTouch() { return isTrue(this.gridOptions.suppressTouch); }
    public isEnableCellChangeFlash() { return isTrue(this.gridOptions.enableCellChangeFlash); }
    public isGroupSelectsChildren() { return isTrue(this.gridOptions.groupSelectsChildren); }
    public isGroupSelectsFiltered() { return isTrue(this.gridOptions.groupSelectsFiltered); }
    public isGroupHideOpenParents() { return isTrue(this.gridOptions.groupHideOpenParents); }
    public isGroupMultiAutoColumn() { return isTrue(this.gridOptions.groupMultiAutoColumn); }
    public isGroupRemoveSingleChildren() { return isTrue(this.gridOptions.groupRemoveSingleChildren); }
    public isGroupIncludeFooter() { return isTrue(this.gridOptions.groupIncludeFooter); }
    public isGroupSuppressBlankHeader() { return isTrue(this.gridOptions.groupSuppressBlankHeader); }
    public isSuppressRowClickSelection() { return isTrue(this.gridOptions.suppressRowClickSelection); }
    public isSuppressCellSelection() { return isTrue(this.gridOptions.suppressCellSelection); }
    public isSuppressMultiSort() { return isTrue(this.gridOptions.suppressMultiSort); }
    public isGroupSuppressAutoColumn() { return isTrue(this.gridOptions.groupSuppressAutoColumn); }
    public isSuppressDragLeaveHidesColumns() { return isTrue(this.gridOptions.suppressDragLeaveHidesColumns); }
    public isSuppressScrollOnNewData() { return isTrue(this.gridOptions.suppressScrollOnNewData); }
    public isForPrint() { return isTrue(this.gridOptions.forPrint); }
    public isSuppressHorizontalScroll() { return isTrue(this.gridOptions.suppressHorizontalScroll); }
    public isSuppressLoadingOverlay() { return isTrue(this.gridOptions.suppressLoadingOverlay); }
    public isSuppressNoRowsOverlay() { return isTrue(this.gridOptions.suppressNoRowsOverlay); }
    public isSuppressFieldDotNotation() { return isTrue(this.gridOptions.suppressFieldDotNotation); }
    public getFloatingTopRowData(): any[] { return this.gridOptions.floatingTopRowData; }
    public getFloatingBottomRowData(): any[] { return this.gridOptions.floatingBottomRowData; }
    public isFunctionsPassive() { return isTrue(this.gridOptions.functionsPassive); }
    public isSuppressRowHoverClass() { return isTrue(this.gridOptions.suppressRowHoverClass); }
    public isSuppressTabbing() { return isTrue(this.gridOptions.suppressTabbing); }

    public getQuickFilterText(): string { return this.gridOptions.quickFilterText; }
    public isUnSortIcon() { return isTrue(this.gridOptions.unSortIcon); }
    public isSuppressMenuHide() { return isTrue(this.gridOptions.suppressMenuHide); }
    public getRowStyle() { return this.gridOptions.rowStyle; }
    public getRowClass() { return this.gridOptions.rowClass; }
    public getRowStyleFunc() { return this.gridOptions.getRowStyle; }
    public getRowClassFunc() { return this.gridOptions.getRowClass; }
    public getDoesDataFlowerFunc(): (data: any)=>boolean { return this.gridOptions.doesDataFlower; }

    public getIsFullWidthCellFunc(): (rowNode: RowNode)=> boolean { return this.gridOptions.isFullWidthCell; }
    public getFullWidthCellRendererParams() { return this.gridOptions.fullWidthCellRendererParams; }
    public isEmbedFullWidthRows() { return isTrue(this.gridOptions.embedFullWidthRows); }

    public getBusinessKeyForNodeFunc() { return this.gridOptions.getBusinessKeyForNode; }
    public getHeaderCellRenderer() { return this.gridOptions.headerCellRenderer; }
    public getApi(): GridApi { return this.gridOptions.api; }
    public getColumnApi(): ColumnApi { return this.gridOptions.columnApi; }
    public isEnableColResize() { return isTrue(this.gridOptions.enableColResize); }
    public isSingleClickEdit() { return isTrue(this.gridOptions.singleClickEdit); }
    public isSuppressClickEdit() { return isTrue(this.gridOptions.suppressClickEdit); }
    public isStopEditingWhenGridLosesFocus() { return isTrue(this.gridOptions.stopEditingWhenGridLosesFocus); }
    public getGroupDefaultExpanded(): number { return this.gridOptions.groupDefaultExpanded; }
    public getAutoSizePadding(): number { return this.gridOptions.autoSizePadding; }

    public getMaxConcurrentDatasourceRequests(): number { return this.gridOptions.maxConcurrentDatasourceRequests; }
    public getMaxPagesInCache(): number { return this.gridOptions.maxPagesInCache; }
    public getPaginationOverflowSize(): number { return this.gridOptions.paginationOverflowSize; }
    public getPaginationPageSize(): number { return this.gridOptions.paginationPageSize; }
    public getInfiniteBlockSize(): number { return this.gridOptions.infiniteBlockSize; }
    public getInfiniteInitialRowCount(): number { return this.gridOptions.infiniteInitialRowCount; }
    public getPaginationStartPage(): number { return this.gridOptions.paginationStartPage; }
    public isSuppressPaginationPanel() { return isTrue(this.gridOptions.suppressPaginationPanel); }

    public getRowData(): any[] { return this.gridOptions.rowData; }
    public isGroupUseEntireRow() { return isTrue(this.gridOptions.groupUseEntireRow); }
    public isEnableRtl() { return isTrue(this.gridOptions.enableRtl); }
    public getGroupColumnDef(): ColDef { return this.gridOptions.groupColumnDef; }
    public isGroupSuppressRow() { return isTrue(this.gridOptions.groupSuppressRow); }
    public getRowGroupPanelShow() { return this.gridOptions.rowGroupPanelShow; }
    public getPivotPanelShow() { return this.gridOptions.pivotPanelShow; }
    public isAngularCompileRows() { return isTrue(this.gridOptions.angularCompileRows); }
    public isAngularCompileFilters() { return isTrue(this.gridOptions.angularCompileFilters); }
    public isAngularCompileHeaders() { return isTrue(this.gridOptions.angularCompileHeaders); }
    public isDebug() { return isTrue(this.gridOptions.debug); }
    public getColumnDefs() { return this.gridOptions.columnDefs; }
    public getDatasource(): IDatasource { return this.gridOptions.datasource; }
    public getViewportDatasource(): IViewportDatasource { return this.gridOptions.viewportDatasource; }
    public getEnterpriseDatasource(): IEnterpriseDatasource { return this.gridOptions.enterpriseDatasource; }
    public isEnableSorting() { return isTrue(this.gridOptions.enableSorting) || isTrue(this.gridOptions.enableServerSideSorting); }
    public isEnableCellExpressions() { return isTrue(this.gridOptions.enableCellExpressions); }
    public isEnableGroupEdit() { return isTrue(this.gridOptions.enableGroupEdit); }
    public isSuppressMiddleClickScrolls() { return isTrue(this.gridOptions.suppressMiddleClickScrolls); }
    public isSuppressPreventDefaultOnMouseWheel() { return isTrue(this.gridOptions.suppressPreventDefaultOnMouseWheel); }
    public isSuppressColumnVirtualisation() { return isTrue(this.gridOptions.suppressColumnVirtualisation); }
    public isSuppressContextMenu() { return isTrue(this.gridOptions.suppressContextMenu); }
    public isAllowContextMenuWithControlKey() { return isTrue(this.gridOptions.allowContextMenuWithControlKey); }
    public isSuppressCopyRowsToClipboard() { return isTrue(this.gridOptions.suppressCopyRowsToClipboard); }
    public isEnableFilter() { return isTrue(this.gridOptions.enableFilter) || isTrue(this.gridOptions.enableServerSideFilter); }
    public isPagination() { return isTrue(this.gridOptions.pagination); }

    // these are deprecated, should remove them when we take out server side pagination
    public isEnableServerSideFilter() { return this.gridOptions.enableServerSideFilter; }
    public isEnableServerSideSorting() { return isTrue(this.gridOptions.enableServerSideSorting); }

    public isSuppressScrollLag() { return isTrue(this.gridOptions.suppressScrollLag); }
    public isSuppressMovableColumns() { return isTrue(this.gridOptions.suppressMovableColumns); }
    public isAnimateRows() { return isTrue(this.gridOptions.animateRows); }
    public isSuppressColumnMoveAnimation() { return isTrue(this.gridOptions.suppressColumnMoveAnimation); }
    public isSuppressMenuColumnPanel() { return isTrue(this.gridOptions.suppressMenuColumnPanel); }
    public isSuppressMenuFilterPanel() { return isTrue(this.gridOptions.suppressMenuFilterPanel); }
    public isSuppressUseColIdForGroups() { return isTrue(this.gridOptions.suppressUseColIdForGroups); }
    public isSuppressAggFuncInHeader() { return isTrue(this.gridOptions.suppressAggFuncInHeader); }
    public isSuppressMenuMainPanel() { return isTrue(this.gridOptions.suppressMenuMainPanel); }
    public isEnableRangeSelection(): boolean { return isTrue(this.gridOptions.enableRangeSelection); }
    public isPaginationAutoPageSize(): boolean { return isTrue(this.gridOptions.paginationAutoPageSize); }
    public isRememberGroupStateWhenNewData(): boolean { return isTrue(this.gridOptions.rememberGroupStateWhenNewData); }
    public getIcons() { return this.gridOptions.icons; }
    public getAggFuncs(): {[key: string]: IAggFunc} { return this.gridOptions.aggFuncs; }
    public getIsScrollLag() { return this.gridOptions.isScrollLag; }
    public getSortingOrder(): string[] { return this.gridOptions.sortingOrder; }
    public getSlaveGrids(): GridOptions[] { return this.gridOptions.slaveGrids; }
    public getGroupRowRendererParams() { return this.gridOptions.groupRowRendererParams; }
    public getOverlayLoadingTemplate() { return this.gridOptions.overlayLoadingTemplate; }
    public getOverlayNoRowsTemplate() { return this.gridOptions.overlayNoRowsTemplate; }
    public isSuppressAutoSize() { return isTrue(this.gridOptions.suppressAutoSize); }
    public isSuppressParentsInRowNodes() { return isTrue(this.gridOptions.suppressParentsInRowNodes); }
    public isEnableStatusBar() { return isTrue(this.gridOptions.enableStatusBar); }
    public isFunctionsReadOnly() { return isTrue(this.gridOptions.functionsReadOnly); }
    public isFloatingFilter(): boolean { return this.gridOptions.floatingFilter; }
    // public isFloatingFilter(): boolean { return true; }

    public getDefaultColDef(): ColDef { return this.gridOptions.defaultColDef; }
    public getDefaultColGroupDef(): ColGroupDef { return this.gridOptions.defaultColGroupDef; }
    public getDefaultExportParams(): CsvExportParams { return this.gridOptions.defaultExportParams; }

    public getHeaderCellTemplate() { return this.gridOptions.headerCellTemplate; }
    public getHeaderCellTemplateFunc() { return this.gridOptions.getHeaderCellTemplate; }
    public getNodeChildDetailsFunc(): ((dataItem: any)=> NodeChildDetails) { return this.gridOptions.getNodeChildDetails; }
    public getGroupRowAggNodesFunc() { return this.gridOptions.groupRowAggNodes; }
    public getContextMenuItemsFunc(): GetContextMenuItems { return this.gridOptions.getContextMenuItems; }
    public getMainMenuItemsFunc(): GetMainMenuItems { return this.gridOptions.getMainMenuItems; }
    public getRowNodeIdFunc(): GetRowNodeIdFunc { return this.gridOptions.getRowNodeId; }
    public getNavigateToNextCellFunc(): (params: NavigateToNextCellParams)=>GridCellDef { return this.gridOptions.navigateToNextCell; }
    public getTabToNextCellFunc(): (params: TabToNextCellParams)=>GridCellDef { return this.gridOptions.tabToNextCell; }

    public getProcessSecondaryColDefFunc(): (colDef: ColDef)=>void { return this.gridOptions.processSecondaryColDef; }
    public getProcessSecondaryColGroupDefFunc(): (colGroupDef: ColGroupDef)=>void { return this.gridOptions.processSecondaryColGroupDef; }
    public getSendToClipboardFunc() { return this.gridOptions.sendToClipboard; }

    public getProcessCellForClipboardFunc(): (params: ProcessCellForExportParams)=>any { return this.gridOptions.processCellForClipboard; }
    public getProcessCellFromClipboardFunc(): (params: ProcessCellForExportParams)=>any { return this.gridOptions.processCellFromClipboard; }
    public getViewportRowModelPageSize(): number { return oneOrGreater(this.gridOptions.viewportRowModelPageSize, DEFAULT_VIEWPORT_ROW_MODEL_PAGE_SIZE); }
    public getViewportRowModelBufferSize(): number { return zeroOrGreater(this.gridOptions.viewportRowModelBufferSize, DEFAULT_VIEWPORT_ROW_MODEL_BUFFER_SIZE); }
    // public getCellRenderers(): {[key: string]: {new(): ICellRenderer} | ICellRendererFunc} { return this.gridOptions.cellRenderers; }
    // public getCellEditors(): {[key: string]: {new(): ICellEditor}} { return this.gridOptions.cellEditors; }

    public setProperty(key: string, value: any): void {
        var gridOptionsNoType = <any> this.gridOptions;
        var previousValue = gridOptionsNoType[key];

        if (previousValue !== value) {
            gridOptionsNoType[key] = value;
            this.propertyEventService.dispatchEvent(key, {currentValue: value, previousValue: previousValue});
        }
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

    public getDocument(): Document {
        // if user is providing document, we use the users one,
        // otherwise we use the document on the global namespace.
        let result: Document;
        if (_.exists(this.gridOptions.getDocument)) {
            result = this.gridOptions.getDocument();
        }
        if (_.exists(result)) {
            return result;
        } else {
            return document;
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

    // the user might be using some non-standard scrollbar, eg a scrollbar that has zero
    // width and overlays (like the Safari scrollbar, but presented in Chrome). so we
    // allow the user to provide the scroll width before we work it out.
    public getScrollbarWidth() {
        let scrollbarWidth = this.gridOptions.scrollbarWidth;
        if (typeof scrollbarWidth !== 'number' || scrollbarWidth < 0) {
            scrollbarWidth = _.getScrollbarWidth();
        }
        return scrollbarWidth;
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
        if (options.checkboxSelection) {
            console.warn('ag-grid: since version 8.0.x checkboxSelection is not supported as a grid option. ' +
                'If you want this on all columns, use defaultColDef instead and set it there');
        }
        if (this.gridOptions.rowModelType===Constants.ROW_MODEL_TYPE_VIRTUAL_DEPRECATED) {
            console.warn('ag-grid: since version 8.3.x row model type "virtual" is now called "infinite", ' +
                'the grid will still work, but please change the property to use "infinite"');
        }
        if (options.paginationInitialRowCount) {
            console.warn('ag-grid: since version 9.0.x paginationInitialRowCount is now called infiniteInitialRowCount');
        }
        if (options.infinitePageSize) {
            console.warn('ag-grid: since version 9.0.x infinitePageSize is now called infiniteBlockSize');
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
        } else if (this.isNumeric(this.gridOptions.rowHeight)) {
            return this.gridOptions.rowHeight;
        } else {
            console.warn('ag-Grid row height must be a number if not using standard row model');
            return DEFAULT_ROW_HEIGHT;
        }
    }

    public getRowHeightForNode(rowNode: RowNode): number {
        // check the function first, in case use set both function and
        // number, when using virtual pagination then function can be
        // used for floating rows and the number for the body rows.
        if (typeof this.gridOptions.getRowHeight === 'function') {
            var params = {
                node: rowNode,
                data: rowNode.data,
                api: this.gridOptions.api,
                context: this.gridOptions.context
            };
            return this.gridOptions.getRowHeight(params);
        } else if (this.isNumeric(this.gridOptions.rowHeight)) {
            return this.gridOptions.rowHeight;
        } else {
            return DEFAULT_ROW_HEIGHT;
        }
    }

    private isNumeric(value:any) {
        return !isNaN(value) && typeof value === 'number';
    }
}
