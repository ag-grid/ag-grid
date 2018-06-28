import {RowNode} from "./entities/rowNode";
import {
    GetContextMenuItems,
    GetMainMenuItems,
    GetRowNodeIdFunc,
    GridOptions,
    IsRowMaster,
    IsRowSelectable,
    NavigateToNextCellParams,
    NodeChildDetails,
    PaginationNumberFormatterParams,
    PostProcessPopupParams, ProcessDataFromClipboardParams,
    TabToNextCellParams
} from "./entities/gridOptions";
import {EventService} from "./eventService";
import {Constants} from "./constants";
import {ComponentUtil} from "./components/componentUtil";
import {GridApi} from "./gridApi";
import {ColDef, ColGroupDef, IAggFunc} from "./entities/colDef";
import {Autowired, Bean, PostConstruct, PreDestroy, Qualifier} from "./context/context";
import {ColumnApi} from "./columnController/columnApi";
import {ColumnController} from "./columnController/columnController";
import {Utils as _} from "./utils";
import {IViewportDatasource} from "./interfaces/iViewportDatasource";
import {IFrameworkFactory} from "./interfaces/iFrameworkFactory";
import {IDatasource} from "./rowModels/iDatasource";
import {GridCellDef} from "./entities/gridCell";
import {IServerSideDatasource} from "./interfaces/iServerSideDatasource";
import {BaseExportParams, ProcessCellForExportParams, ProcessHeaderForExportParams} from "./exportParams";
import {AgEvent} from "./events";
import {Environment} from "./environment";
import {PropertyKeys} from "./propertyKeys";
import {ColDefUtil} from "./components/colDefUtil";
import {Events} from "./eventKeys";
import {AutoHeightCalculator} from "./rendering/autoHeightCalculator";

let DEFAULT_ROW_HEIGHT = 25;
let DEFAULT_DETAIL_ROW_HEIGHT = 300;
let DEFAULT_VIEWPORT_ROW_MODEL_PAGE_SIZE = 5;
let DEFAULT_VIEWPORT_ROW_MODEL_BUFFER_SIZE = 5;

let legacyThemes = [
    'ag-fresh',
    'ag-bootstrap',
    'ag-blue',
    'ag-dark',
    'ag-material'
];

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

export interface PropertyChangedEvent extends AgEvent {
    currentValue: any;
    previousValue: any;
}

@Bean('gridOptionsWrapper')
export class GridOptionsWrapper {

    private static MIN_COL_WIDTH = 10;

    public static PROP_HEADER_HEIGHT = 'headerHeight';
    public static PROP_GROUP_REMOVE_SINGLE_CHILDREN = 'groupRemoveSingleChildren';
    public static PROP_GROUP_REMOVE_LOWEST_SINGLE_CHILDREN = 'groupRemoveLowestSingleChildren';
    public static PROP_PIVOT_HEADER_HEIGHT = 'pivotHeaderHeight';
    public static PROP_SUPPRESS_CLIPBOARD_PASTE = 'suppressClipboardPaste';

    public static PROP_GROUP_HEADER_HEIGHT = 'groupHeaderHeight';
    public static PROP_PIVOT_GROUP_HEADER_HEIGHT = 'pivotGroupHeaderHeight';

    public static PROP_FLOATING_FILTERS_HEIGHT = 'floatingFiltersHeight';

    public static PROP_SUPPRESS_ROW_DRAG = 'suppressRowDrag';
    public static PROP_POPUP_PARENT = 'popupParent';

    public static PROP_GRID_AUTO_HEIGHT = 'gridAutoHeight';

    @Autowired('gridOptions') private gridOptions: GridOptions;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('eventService') private eventService: EventService;
    @Autowired('enterprise') private enterprise: boolean;
    @Autowired('frameworkFactory') private frameworkFactory: IFrameworkFactory;
    @Autowired('gridApi') private gridApi: GridApi;
    @Autowired('columnApi') private columnApi: ColumnApi;
    @Autowired('environment') private environment: Environment;
    @Autowired('autoHeightCalculator') private autoHeightCalculator: AutoHeightCalculator;

    private propertyEventService: EventService = new EventService();

    private domDataKey = '__AG_'+Math.random().toString();

    private layoutElements: HTMLElement[] = [];

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

        if (! (this.gridOptions.suppressPropertyNamesCheck === true)) {
            this.checkGridOptionsProperties();
            this.checkColumnDefProperties();
        }

        let async = this.useAsyncEvents();
        this.eventService.addGlobalListener(this.globalEventHandler.bind(this), async);

        if (this.isGroupSelectsChildren() && this.isSuppressParentsInRowNodes()) {
            console.warn('ag-Grid: groupSelectsChildren does not work wth suppressParentsInRowNodes, this selection method needs the part in rowNode to work');
        }

        if (this.isGroupSelectsChildren()) {
            if (!this.isRowSelectionMulti()) {
                console.warn(`ag-Grid: rowSelection must be 'multiple' for groupSelectsChildren to make sense`);
            }
            if (this.isRowModelServerSide()) {
                console.warn('ag-Grid: group selects children is NOT support for Server Side Row Model. ' +
                    'This is because the rows are lazy loaded, so selecting a group is not possible as' +
                    'the grid has no way of knowing what the children are.');
            }
        }

        if (this.isGroupRemoveSingleChildren() && this.isGroupHideOpenParents()) {
            console.warn('ag-Grid: groupRemoveSingleChildren and groupHideOpenParents do not work with each other, you need to pick one. And don\'t ask us how to us these together on our support forum either you will get the same answer!');
        }

        this.addEventListener(GridOptionsWrapper.PROP_GRID_AUTO_HEIGHT, this.updateLayoutClasses.bind(this));
    }

    private checkColumnDefProperties() {
        if (this.gridOptions.columnDefs == null) return;

        this.gridOptions.columnDefs.forEach(colDef=>{
            let userProperties: string [] = Object.getOwnPropertyNames(colDef);
            let validProperties: string [] = ColDefUtil.ALL_PROPERTIES.concat(ColDefUtil.FRAMEWORK_PROPERTIES);

            this.checkProperties(
                userProperties,
                validProperties,
                validProperties,
                'colDef',
                'https://www.ag-grid.com/javascript-grid-column-properties/'
            );
        })
    }

    private checkGridOptionsProperties() {
        let userProperties: string [] = Object.getOwnPropertyNames(this.gridOptions);
        let validProperties: string [] = PropertyKeys.ALL_PROPERTIES.concat(PropertyKeys.FRAMEWORK_PROPERTIES);
        Object.keys(Events).forEach(it=>validProperties.push (ComponentUtil.getCallbackForEvent((<any>Events)[it])));
        let validPropertiesAndExceptions: string [] = validProperties.concat('api', 'columnApi');

        this.checkProperties(
            userProperties,
            validPropertiesAndExceptions,
            validProperties,
            'gridOptions',
            'https://www.ag-grid.com/javascript-grid-properties/'
        );
    }


    private checkProperties(
        userProperties: string[],
        validPropertiesAndExceptions: string[],
        validProperties: string[],
        containerName: string,
        docsUrl: string
    ) {
        let invalidProperties: { [p: string]: string[] } = _.fuzzyCheckStrings(
            userProperties,
            validPropertiesAndExceptions,
            validProperties
        );

        let invalidPropertyKeys = Object.keys(invalidProperties);
        invalidPropertyKeys.forEach(invalidPropertyKey => {
            let fuzzySuggestions: string[] = invalidProperties [invalidPropertyKey];
            console.warn(`ag-grid: invalid ${containerName} property '${invalidPropertyKey}' did you mean any of these: ${fuzzySuggestions.slice(0, 8).join(",")}`)
        });

        if (invalidPropertyKeys.length > 0) {
            console.warn(`ag-grid: to see all the valid ${containerName} properties please check: ${docsUrl}`)
        }
    }

// returns the dom data, or undefined if not found
    public getDomData(element: Node, key: string): any {
        let domData = (<any>element)[this.domDataKey];
        if (domData) {
            return domData[key];
        } else {
            return undefined;
        }
    }

    public setDomData(element: Element, key: string, value: any): any {
        let domData = (<any>element)[this.domDataKey];
        if (_.missing(domData)) {
            domData = {};
            (<any>element)[this.domDataKey] = domData;
        }
        domData[key] = value;
    }

    public isEnterprise() { return this.enterprise;}
    public isRowSelection() { return this.gridOptions.rowSelection === "single" || this.gridOptions.rowSelection === "multiple"; }
    public isRowDeselection() { return isTrue(this.gridOptions.rowDeselection); }
    public isRowSelectionMulti() { return this.gridOptions.rowSelection === 'multiple'; }
    public isRowMultiSelectWithClick() { return isTrue(this.gridOptions.rowMultiSelectWithClick); }
    public getContext() { return this.gridOptions.context; }
    public isPivotMode() { return isTrue(this.gridOptions.pivotMode); }
    public isPivotTotals() { return isTrue(this.gridOptions.pivotTotals); }
    public getPivotColumnGroupTotals() { return this.gridOptions.pivotColumnGroupTotals; }
    public getPivotRowTotals() { return this.gridOptions.pivotRowTotals; }
    public isRowModelInfinite() { return this.gridOptions.rowModelType === Constants.ROW_MODEL_TYPE_INFINITE; }
    public isRowModelViewport() { return this.gridOptions.rowModelType === Constants.ROW_MODEL_TYPE_VIEWPORT; }
    public isRowModelServerSide() { return this.gridOptions.rowModelType === Constants.ROW_MODEL_TYPE_SERVER_SIDE; }
    public isRowModelDefault() {
        return _.missing(this.gridOptions.rowModelType) ||
            this.gridOptions.rowModelType === Constants.ROW_MODEL_TYPE_CLIENT_SIDE ||
            this.gridOptions.rowModelType === Constants.DEPRECATED_ROW_MODEL_TYPE_NORMAL;
    }

    public isFullRowEdit() { return this.gridOptions.editType === 'fullRow'; }
    public isSuppressFocusAfterRefresh() { return isTrue(this.gridOptions.suppressFocusAfterRefresh); }
    public isShowToolPanel() { return isTrue(this.gridOptions.showToolPanel); }
    public isToolPanelSuppressValues() { return isTrue(this.gridOptions.toolPanelSuppressValues); }
    public isToolPanelSuppressPivots() {
        // we don't allow pivots when doing tree data
        return isTrue(this.gridOptions.toolPanelSuppressPivots) || this.isTreeData();
    }
    public isToolPanelSuppressRowGroups() {
        // we don't allow row grouping when doing tree data
        return isTrue(this.gridOptions.toolPanelSuppressRowGroups) || this.isTreeData();
    }
    public isToolPanelSuppressSideButtons() { return isTrue(this.gridOptions.toolPanelSuppressSideButtons); }
    public isToolPanelSuppressPivotMode() { return isTrue(this.gridOptions.toolPanelSuppressPivotMode) || this.isTreeData();}
    public isContractColumnSelection() { return isTrue(this.gridOptions.contractColumnSelection); }

    public isToolPanelSuppressColumnFilter() { return isTrue(this.gridOptions.toolPanelSuppressColumnFilter); }
    public isToolPanelSuppressColumnSelectAll() { return isTrue(this.gridOptions.toolPanelSuppressColumnSelectAll); }
    public isToolPanelSuppressColumnExpandAll() { return isTrue(this.gridOptions.toolPanelSuppressColumnExpandAll); }

    public isSuppressTouch() { return isTrue(this.gridOptions.suppressTouch); }
    public isSuppressRowTransform() { return isTrue(this.gridOptions.suppressRowTransform); }
    public useAsyncEvents() { return !isTrue(this.gridOptions.suppressAsyncEvents); }
    public isEnableCellChangeFlash() { return isTrue(this.gridOptions.enableCellChangeFlash); }
    public isGroupSelectsChildren() {
        let result = isTrue(this.gridOptions.groupSelectsChildren);
        if (result && this.isTreeData()) {
            console.warn('ag-Grid: groupSelectsChildren does not work with tree data');
            return false;
        } else {
            return result;
        }
    }

    public isSuppressRowHoverHighlight() { return isTrue(this.gridOptions.suppressRowHoverHighlight); }
    public isGroupSelectsFiltered() { return isTrue(this.gridOptions.groupSelectsFiltered); }
    public isGroupHideOpenParents() { return isTrue(this.gridOptions.groupHideOpenParents); }
    // if we are doing hideOpenParents, then we always have groupMultiAutoColumn, otherwise hideOpenParents would not work
    public isGroupMultiAutoColumn() { return isTrue(this.gridOptions.groupMultiAutoColumn) || isTrue(this.gridOptions.groupHideOpenParents); }
    public isGroupRemoveSingleChildren() { return isTrue(this.gridOptions.groupRemoveSingleChildren); }
    public isGroupRemoveLowestSingleChildren() { return isTrue(this.gridOptions.groupRemoveLowestSingleChildren); }
    public isGroupIncludeFooter() { return isTrue(this.gridOptions.groupIncludeFooter); }
    public isGroupIncludeTotalFooter() { return isTrue(this.gridOptions.groupIncludeTotalFooter); }
    public isGroupSuppressBlankHeader() { return isTrue(this.gridOptions.groupSuppressBlankHeader); }
    public isSuppressRowClickSelection() { return isTrue(this.gridOptions.suppressRowClickSelection); }
    public isSuppressCellSelection() { return isTrue(this.gridOptions.suppressCellSelection); }
    public isSuppressMultiSort() { return isTrue(this.gridOptions.suppressMultiSort); }
    public isMultiSortKeyCtrl() { return this.gridOptions.multiSortKey === 'ctrl'; }
    public isGroupSuppressAutoColumn() { return isTrue(this.gridOptions.groupSuppressAutoColumn); }
    public isSuppressDragLeaveHidesColumns() { return isTrue(this.gridOptions.suppressDragLeaveHidesColumns); }
    public isSuppressScrollOnNewData() { return isTrue(this.gridOptions.suppressScrollOnNewData); }
    public isRowDragManaged() { return isTrue(this.gridOptions.rowDragManaged); }
    public isSuppressRowDrag() { return isTrue(this.gridOptions.suppressRowDrag); }

    public isGridAutoHeight() { return isTrue(this.gridOptions.gridAutoHeight); }

    public isSuppressHorizontalScroll() { return isTrue(this.gridOptions.suppressHorizontalScroll); }
    public isSuppressLoadingOverlay() { return isTrue(this.gridOptions.suppressLoadingOverlay); }
    public isSuppressNoRowsOverlay() { return isTrue(this.gridOptions.suppressNoRowsOverlay); }
    public isSuppressFieldDotNotation() { return isTrue(this.gridOptions.suppressFieldDotNotation); }
    public getPinnedTopRowData(): any[] { return this.gridOptions.pinnedTopRowData; }
    public getPinnedBottomRowData(): any[] { return this.gridOptions.pinnedBottomRowData; }
    public isFunctionsPassive() { return isTrue(this.gridOptions.functionsPassive); }
    public isSuppressTabbing() { return isTrue(this.gridOptions.suppressTabbing); }
    public isSuppressChangeDetection() { return isTrue(this.gridOptions.suppressChangeDetection); }
    public isSuppressAnimationFrame() { return isTrue(this.gridOptions.suppressAnimationFrame); }

    public getQuickFilterText(): string { return this.gridOptions.quickFilterText; }
    public isCacheQuickFilter() { return isTrue(this.gridOptions.cacheQuickFilter); }
    public isUnSortIcon() { return isTrue(this.gridOptions.unSortIcon); }
    public isSuppressMenuHide() { return isTrue(this.gridOptions.suppressMenuHide); }
    public isEnterMovesDownAfterEdit() { return isTrue(this.gridOptions.enterMovesDownAfterEdit); }
    public isEnterMovesDown() { return isTrue(this.gridOptions.enterMovesDown); }
    public getRowStyle() { return this.gridOptions.rowStyle; }
    public getRowClass() { return this.gridOptions.rowClass; }
    public getRowStyleFunc() { return this.gridOptions.getRowStyle; }
    public getRowClassFunc() { return this.gridOptions.getRowClass; }
    public rowClassRules() { return this.gridOptions.rowClassRules; }
    public getPopupParent() { return this.gridOptions.popupParent; }
    public getPostProcessPopupFunc(): (params: PostProcessPopupParams)=>void { return this.gridOptions.postProcessPopup; }
    public getDoesDataFlowerFunc(): (data: any)=>boolean { return this.gridOptions.doesDataFlower; }
    public getPaginationNumberFormatterFunc(): (params: PaginationNumberFormatterParams)=>string { return this.gridOptions.paginationNumberFormatter; }
    public getChildCountFunc() { return this.gridOptions.getChildCount; }
    public getDefaultGroupSortComparator() { return this.gridOptions.defaultGroupSortComparator; }

    public getIsFullWidthCellFunc(): (rowNode: RowNode)=> boolean { return this.gridOptions.isFullWidthCell; }
    public getFullWidthCellRendererParams() { return this.gridOptions.fullWidthCellRendererParams; }
    public isEmbedFullWidthRows() { return isTrue(this.gridOptions.embedFullWidthRows); }
    public getBusinessKeyForNodeFunc() { return this.gridOptions.getBusinessKeyForNode; }
    public getApi(): GridApi { return this.gridOptions.api; }
    public getColumnApi(): ColumnApi { return this.gridOptions.columnApi; }
    public isDeltaRowDataMode() { return isTrue(this.gridOptions.deltaRowDataMode); }
    public isEnsureDomOrder() { return isTrue(this.gridOptions.ensureDomOrder); }
    public isEnableColResize() { return isTrue(this.gridOptions.enableColResize); }
    public getColResizeDefault() { return this.gridOptions.colResizeDefault; }
    public isSingleClickEdit() { return isTrue(this.gridOptions.singleClickEdit); }
    public isSuppressClickEdit() { return isTrue(this.gridOptions.suppressClickEdit); }
    public isStopEditingWhenGridLosesFocus() { return isTrue(this.gridOptions.stopEditingWhenGridLosesFocus); }
    public getGroupDefaultExpanded(): number { return this.gridOptions.groupDefaultExpanded; }

    public getMaxConcurrentDatasourceRequests(): number { return this.gridOptions.maxConcurrentDatasourceRequests; }
    public getMaxBlocksInCache(): number { return this.gridOptions.maxBlocksInCache; }
    public getCacheOverflowSize(): number { return this.gridOptions.cacheOverflowSize; }
    public getPaginationPageSize(): number { return this.gridOptions.paginationPageSize; }
    public getCacheBlockSize(): number { return this.gridOptions.cacheBlockSize; }
    public getInfiniteInitialRowCount(): number { return this.gridOptions.infiniteInitialRowCount; }
    public isPurgeClosedRowNodes() { return isTrue(this.gridOptions.purgeClosedRowNodes); }
    public isSuppressPaginationPanel() { return isTrue(this.gridOptions.suppressPaginationPanel); }

    public getRowData(): any[] { return this.gridOptions.rowData; }
    public isGroupUseEntireRow() { return isTrue(this.gridOptions.groupUseEntireRow); }
    public isEnableRtl() { return isTrue(this.gridOptions.enableRtl); }
    public getAutoGroupColumnDef(): ColDef { return this.gridOptions.autoGroupColumnDef; }
    public isGroupSuppressRow() { return isTrue(this.gridOptions.groupSuppressRow); }
    public getRowGroupPanelShow() { return this.gridOptions.rowGroupPanelShow; }
    public getPivotPanelShow() { return this.gridOptions.pivotPanelShow; }
    public isAngularCompileRows() { return isTrue(this.gridOptions.angularCompileRows); }
    public isAngularCompileFilters() { return isTrue(this.gridOptions.angularCompileFilters); }
    public isAngularCompileHeaders() { return isTrue(this.gridOptions.angularCompileHeaders); }
    public isDebug() { return isTrue(this.gridOptions.debug); }
    public getColumnDefs() { return this.gridOptions.columnDefs; }
    public getColumnTypes(): {[key: string]: ColDef} { return this.gridOptions.columnTypes; }
    public getDatasource(): IDatasource { return this.gridOptions.datasource; }
    public getViewportDatasource(): IViewportDatasource { return this.gridOptions.viewportDatasource; }
    public getServerSideDatasource(): IServerSideDatasource { return this.gridOptions.serverSideDatasource; }
    public isEnableSorting() { return isTrue(this.gridOptions.enableSorting) || isTrue(this.gridOptions.enableServerSideSorting); }
    public isAccentedSort() { return isTrue(this.gridOptions.accentedSort) }
    public isEnableCellExpressions() { return isTrue(this.gridOptions.enableCellExpressions); }
    public isEnableGroupEdit() { return isTrue(this.gridOptions.enableGroupEdit); }
    public isSuppressMiddleClickScrolls() { return isTrue(this.gridOptions.suppressMiddleClickScrolls); }
    public isSuppressPreventDefaultOnMouseWheel() { return isTrue(this.gridOptions.suppressPreventDefaultOnMouseWheel); }
    public isSuppressColumnVirtualisation() { return isTrue(this.gridOptions.suppressColumnVirtualisation); }
    public isSuppressContextMenu() { return isTrue(this.gridOptions.suppressContextMenu); }
    public isAllowContextMenuWithControlKey() { return isTrue(this.gridOptions.allowContextMenuWithControlKey); }
    public isSuppressCopyRowsToClipboard() { return isTrue(this.gridOptions.suppressCopyRowsToClipboard); }
    public isSuppressClipboardPaste() { return isTrue(this.gridOptions.suppressClipboardPaste); }
    public isEnableFilter() { return isTrue(this.gridOptions.enableFilter) || isTrue(this.gridOptions.enableServerSideFilter); }
    public isPagination() { return isTrue(this.gridOptions.pagination); }
    public isSuppressEnterpriseResetOnNewColumns() { return isTrue(this.gridOptions.suppressEnterpriseResetOnNewColumns); }
    public getProcessDataFromClipboardFunc(): ((params: ProcessDataFromClipboardParams)=>string[][]) { return this.gridOptions.processDataFromClipboard;}
    public getBatchUpdateWaitMillis(): number {
        return _.exists(this.gridOptions.batchUpdateWaitMillis) ? this.gridOptions.batchUpdateWaitMillis : Constants.BATCH_WAIT_MILLIS;
    }

    // these are deprecated, should remove them when we take out server side pagination
    public isEnableServerSideFilter() { return this.gridOptions.enableServerSideFilter; }
    public isEnableServerSideSorting() { return isTrue(this.gridOptions.enableServerSideSorting); }

    public isSuppressMovableColumns() { return isTrue(this.gridOptions.suppressMovableColumns); }
    public isAnimateRows() {
        // never allow animating if enforcing the row order
        if (this.isEnsureDomOrder()) { return false; }
        return isTrue(this.gridOptions.animateRows);
    }
    public isSuppressColumnMoveAnimation() { return isTrue(this.gridOptions.suppressColumnMoveAnimation); }
    public isSuppressAggFuncInHeader() { return isTrue(this.gridOptions.suppressAggFuncInHeader); }
    public isSuppressAggAtRootLevel() { return isTrue(this.gridOptions.suppressAggAtRootLevel); }
    public isEnableRangeSelection(): boolean { return isTrue(this.gridOptions.enableRangeSelection); }
    public isSuppressMultiRangeSelection(): boolean { return isTrue(this.gridOptions.suppressMultiRangeSelection); }
    public isPaginationAutoPageSize(): boolean { return isTrue(this.gridOptions.paginationAutoPageSize); }
    public isRememberGroupStateWhenNewData(): boolean { return isTrue(this.gridOptions.rememberGroupStateWhenNewData); }
    public getIcons() { return this.gridOptions.icons; }
    public getAggFuncs(): {[key: string]: IAggFunc} { return this.gridOptions.aggFuncs; }
    public getSortingOrder(): string[] { return this.gridOptions.sortingOrder; }
    public getAlignedGrids(): GridOptions[] { return this.gridOptions.alignedGrids; }
    public isMasterDetail() {
        let usingMasterDetail = isTrue(this.gridOptions.masterDetail);

        _.doOnce(() => {
            if (usingMasterDetail && !this.enterprise) {
                console.warn('ag-grid: Master Detail is an Enterprise feature of ag-Grid.')
            }
        }, 'MasterDetailEnterpriseCheck');

        return usingMasterDetail && this.enterprise;
    }
    public getIsRowMasterFunc(): IsRowMaster { return this.gridOptions.isRowMaster; }
    public getIsRowSelectableFunc(): IsRowSelectable { return this.gridOptions.isRowSelectable; }
    public getGroupRowRendererParams() { return this.gridOptions.groupRowRendererParams; }
    public getOverlayLoadingTemplate() { return this.gridOptions.overlayLoadingTemplate; }
    public getOverlayNoRowsTemplate() { return this.gridOptions.overlayNoRowsTemplate; }
    public isSuppressAutoSize() { return isTrue(this.gridOptions.suppressAutoSize); }
    public isSuppressParentsInRowNodes() { return isTrue(this.gridOptions.suppressParentsInRowNodes); }
    public isEnableStatusBar() { return isTrue(this.gridOptions.enableStatusBar); }
    public isAlwaysShowStatusBar() { return isTrue(this.gridOptions.alwaysShowStatusBar); }
    public isFunctionsReadOnly() { return isTrue(this.gridOptions.functionsReadOnly); }
    public isFloatingFilter(): boolean { return this.gridOptions.floatingFilter; }
    public isEnableOldSetFilterModel(): boolean { return isTrue(this.gridOptions.enableOldSetFilterModel); }
    // public isFloatingFilter(): boolean { return true; }

    public getDefaultColDef(): ColDef { return this.gridOptions.defaultColDef; }
    public getDefaultColGroupDef(): ColGroupDef { return this.gridOptions.defaultColGroupDef; }
    public getDefaultExportParams(): BaseExportParams { return this.gridOptions.defaultExportParams; }
    public isSuppressCsvExport() { return isTrue(this.gridOptions.suppressCsvExport); }
    public isSuppressExcelExport() { return isTrue(this.gridOptions.suppressExcelExport); }
    public isSuppressMakeColumnVisibleAfterUnGroup() { return isTrue(this.gridOptions.suppressMakeColumnVisibleAfterUnGroup); }

    public getNodeChildDetailsFunc(): ((dataItem: any)=> NodeChildDetails) { return this.gridOptions.getNodeChildDetails; }
    public getDataPathFunc(): ((dataItem: any) => string[]) { return this.gridOptions.getDataPath; }
    // public getIsGroupFunc(): ((dataItem: any) => boolean) { return this.gridOptions.isGroup }
    public getGroupRowAggNodesFunc() { return this.gridOptions.groupRowAggNodes; }
    public getContextMenuItemsFunc(): GetContextMenuItems { return this.gridOptions.getContextMenuItems; }
    public getMainMenuItemsFunc(): GetMainMenuItems { return this.gridOptions.getMainMenuItems; }
    public getRowNodeIdFunc(): GetRowNodeIdFunc { return this.gridOptions.getRowNodeId; }
    public getNavigateToNextCellFunc(): (params: NavigateToNextCellParams)=>GridCellDef { return this.gridOptions.navigateToNextCell; }
    public getTabToNextCellFunc(): (params: TabToNextCellParams)=>GridCellDef { return this.gridOptions.tabToNextCell; }

    public isTreeData(): boolean { return isTrue(this.gridOptions.treeData); }
    public isValueCache(): boolean { return isTrue(this.gridOptions.valueCache); }
    public isValueCacheNeverExpires(): boolean { return isTrue(this.gridOptions.valueCacheNeverExpires); }
    public isAggregateOnlyChangedColumns(): boolean { return isTrue(this.gridOptions.aggregateOnlyChangedColumns); }

    public getProcessSecondaryColDefFunc(): (colDef: ColDef)=>void { return this.gridOptions.processSecondaryColDef; }
    public getProcessSecondaryColGroupDefFunc(): (colGroupDef: ColGroupDef)=>void { return this.gridOptions.processSecondaryColGroupDef; }
    public getSendToClipboardFunc() { return this.gridOptions.sendToClipboard; }
    public getProcessRowPostCreateFunc() : any { return this.gridOptions.processRowPostCreate; }

    public getProcessCellForClipboardFunc(): (params: ProcessCellForExportParams)=>any { return this.gridOptions.processCellForClipboard; }
    public getProcessHeaderForClipboardFunc(): (params: ProcessHeaderForExportParams)=>any { return this.gridOptions.processHeaderForClipboard; }
    public getProcessCellFromClipboardFunc(): (params: ProcessCellForExportParams)=>any { return this.gridOptions.processCellFromClipboard; }
    public getViewportRowModelPageSize(): number { return oneOrGreater(this.gridOptions.viewportRowModelPageSize, DEFAULT_VIEWPORT_ROW_MODEL_PAGE_SIZE); }
    public getViewportRowModelBufferSize(): number { return zeroOrGreater(this.gridOptions.viewportRowModelBufferSize, DEFAULT_VIEWPORT_ROW_MODEL_BUFFER_SIZE); }
    // public getCellRenderers(): {[key: string]: {new(): ICellRenderer} | ICellRendererFunc} { return this.gridOptions.cellRenderers; }
    // public getCellEditors(): {[key: string]: {new(): ICellEditor}} { return this.gridOptions.cellEditors; }

    public isServerSideSortingAlwaysResets() { return isTrue(this.gridOptions.serverSideSortingAlwaysResets); }

    public getPostSortFunc(): (rowNodes: RowNode[]) => void { return this.gridOptions.postSort; }

    public getClipboardDeliminator() {
        return _.exists(this.gridOptions.clipboardDeliminator) ? this.gridOptions.clipboardDeliminator : '\t';
    }

    public setProperty(key: string, value: any): void {
        let gridOptionsNoType = <any> this.gridOptions;
        let previousValue = gridOptionsNoType[key];

        if (previousValue !== value) {
            gridOptionsNoType[key] = value;
            let event: PropertyChangedEvent = {
                type: key,
                currentValue: value,
                previousValue: previousValue
            };
            this.propertyEventService.dispatchEvent(event);
        }
    }

    // this logic is repeated in lots of places. any element that had different CSS
    // dependent on the layout needs to have the layout class added ot it.
    public addLayoutElement(element: HTMLElement): void {
        this.layoutElements.push(element);
        this.updateLayoutClasses();
    }

    private updateLayoutClasses(): void {
        let autoHeight = this.isGridAutoHeight();
        this.layoutElements.forEach( e => {
            _.addOrRemoveCssClass(e, 'ag-layout-auto-height', autoHeight);
            _.addOrRemoveCssClass(e, 'ag-layout-normal', !autoHeight);
        });
    }

    public addEventListener(key: string, listener: Function): void {
        GridOptionsWrapper.checkEventDeprecation(key);
        this.propertyEventService.addEventListener(key, listener);
    }

    public static checkEventDeprecation(eventName: string): void {
        if (eventName === 'floatingRowDataChanged') {
            console.warn('ag-Grid: floatingRowDataChanged is now called pinnedRowDataChanged');
        }
    }

    public removeEventListener(key: string, listener: Function): void {
        this.propertyEventService.removeEventListener(key, listener);
    }

    public getAutoSizePadding(): number {
        return this.gridOptions.autoSizePadding > 0 ? this.gridOptions.autoSizePadding : 20;
    }

    // properties
    public getHeaderHeight(): number {
        if (typeof this.gridOptions.headerHeight === 'number') {
            return this.gridOptions.headerHeight;
        } else {
            return this.specialForNewMaterial(25, 'headerHeight');
        }
    }

    public getFloatingFiltersHeight(): number {
        if (typeof this.gridOptions.floatingFiltersHeight === 'number') {
            return this.gridOptions.floatingFiltersHeight;
        } else {
            return this.specialForNewMaterial(25, 'headerHeight');
        }
    }

    public getGroupHeaderHeight(): number {
        if (typeof this.gridOptions.groupHeaderHeight === 'number') {
            return this.gridOptions.groupHeaderHeight;
        } else {
            return this.getHeaderHeight();
        }
    }

    public getPivotHeaderHeight(): number {
        if (typeof this.gridOptions.pivotHeaderHeight === 'number') {
            return this.gridOptions.pivotHeaderHeight;
        } else {
            return this.getHeaderHeight();
        }
    }

    public getPivotGroupHeaderHeight(): number {
        if (typeof this.gridOptions.pivotGroupHeaderHeight === 'number') {
            return this.gridOptions.pivotGroupHeaderHeight;
        } else {
            return this.getGroupHeaderHeight();
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
        let options: any = this.gridOptions;
        if (options.suppressUnSort) {
            console.warn('ag-grid: as of v1.12.4 suppressUnSort is not used. Please use sortingOrder instead.');
        }
        if (options.suppressDescSort) {
            console.warn('ag-grid: as of v1.12.4 suppressDescSort is not used. Please use sortingOrder instead.');
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
        if (options.paginationInitialRowCount) {
            console.warn('ag-grid: since version 9.0.x paginationInitialRowCount is now called infiniteInitialRowCount');
        }
        if (options.infinitePageSize) {
            console.warn('ag-grid: since version 9.0.x infinitePageSize is now called cacheBlockSize');
        }
        if (options.infiniteBlockSize) {
            console.warn('ag-grid: since version 10.0.x infiniteBlockSize is now called cacheBlockSize');
        }
        if (options.maxPagesInCache) {
            console.warn('ag-grid: since version 10.0.x maxPagesInCache is now called maxBlocksInCache');
        }
        if (options.paginationOverflowSize) {
            console.warn('ag-grid: since version 10.0.x paginationOverflowSize is now called cacheOverflowSize');
        }
        if (options.forPrint) {
            console.warn('ag-grid: since version 10.1.x, use property domLayout="forPrint" instead of forPrint=true');
        }
        if (options.suppressMenuFilterPanel) {
            console.warn(`ag-grid: since version 11.0.x, use property colDef.menuTabs=['generalMenuTab','columnsMenuTab'] instead of suppressMenuFilterPanel=true`);
        }
        if (options.suppressMenuMainPanel) {
            console.warn(`ag-grid: since version 11.0.x, use property colDef.menuTabs=['filterMenuTab','columnsMenuTab'] instead of suppressMenuMainPanel=true`);
        }
        if (options.suppressMenuColumnPanel) {
            console.warn(`ag-grid: since version 11.0.x, use property colDef.menuTabs=['generalMenuTab','filterMenuTab'] instead of suppressMenuColumnPanel=true`);
        }
        if (options.suppressUseColIdForGroups) {
            console.warn(`ag-grid: since version 11.0.x, this is not in use anymore. You should be able to remove it from your definition`);
        }
        if (options.groupColumnDef) {
            console.warn(`ag-grid: since version 11.0.x, groupColumnDef has been renamed, this property is now called autoGroupColumnDef. Please change your configuration accordingly`);
        }
        if (options.slaveGrids) {
            console.warn(`ag-grid: since version 12.x, slaveGrids has been renamed, this property is now called alignedGrids. Please change your configuration accordingly`);
        }
        if (options.floatingTopRowData) {
            console.warn(`ag-grid: since version 12.x, floatingTopRowData is now called pinnedTopRowData`);
        }
        if (options.floatingBottomRowData) {
            console.warn(`ag-grid: since version 12.x, floatingBottomRowData is now called pinnedBottomRowData`);
        }
        if (options.paginationStartPage) {
            console.warn(`ag-grid: since version 12.x, paginationStartPage is gone, please call api.paginationGoToPage(${options.paginationStartPage}) instead.`);
        }

        if (options.getHeaderCellTemplate) {
            console.warn(`ag-grid: since version 15.x, getHeaderCellTemplate is gone, please check the header documentation on how to set header templates.`);
        }
        if (options.headerCellTemplate) {
            console.warn(`ag-grid: since version 15.x, headerCellTemplate is gone, please check the header documentation on how to set header templates.`);
        }
        if (options.headerCellRenderer) {
            console.warn(`ag-grid: since version 15.x, headerCellRenderer is gone, please check the header documentation on how to set header templates.`);
        }
        if (options.angularCompileHeaders) {
            console.warn(`ag-grid: since version 15.x, angularCompileHeaders is gone, please see the getting started for Angular 1 docs to see how to do headers in Angular 1.x.`);
        }
        if (options.domLayout==='forPrint') {
            console.warn(`ag-grid: since version 18.x, forPrint is no longer supported, as same can be achieved using autoHeight (and set the grid width accordingly). please use autoHeight instead.`);
        }
        if (options.domLayout==='autoHeight') {
            console.warn(`ag-grid: since version 18.x, domLayout is gone, instead if doing auto-height, set gridAutoHeight=true.`);
            options.gridAutoHeight = true;
        }
        if (options.pivotTotals) {
            console.warn(`ag-grid: since version 18.x, pivotTotals has been removed, instead if using pivotTotals, set pivotColumnGroupTotals='before'|'after'.`);
            options.pivotColumnGroupTotals = 'before';
        }
        if (options.rowModelType==='inMemory') {
            console.warn(`ag-grid: since version 18.x, The In Memory Row Model has been renamed to the Client Side Row Model, set rowModelType='clientSide' instead.`);
            options.rowModelType = 'clientSide';
        }
        if (options.rowModelType==='enterprise') {
            console.warn(`ag-grid: since version 18.x, The Enterprise Row Model has been renamed to the Server Side Row Model, set rowModelType='serverSide' instead.`);
            options.rowModelType = 'serverSide';
        }
        if (options.layoutInterval) {
            console.warn(`ag-grid: since version 18.x, layoutInterval is no longer a property. This is because the grid now uses CSS Flex for layout.`);
        }
    }

    public getLocaleTextFunc() {
        if (this.gridOptions.localeTextFunc) {
            return this.gridOptions.localeTextFunc;
        }
        let that = this;
        return function(key: any, defaultValue: any) {
            let localeText = that.gridOptions.localeText;
            if (localeText && localeText[key]) {
                return localeText[key];
            } else {
                return defaultValue;
            }
        };
    }

    // responsible for calling the onXXX functions on gridOptions
    public globalEventHandler(eventName: string, event?: any): void {
        let callbackMethodName = ComponentUtil.getCallbackForEvent(eventName);
        if (typeof (<any>this.gridOptions)[callbackMethodName] === 'function') {
            (<any>this.gridOptions)[callbackMethodName](event);
        }
    }

    // we don't allow dynamic row height for virtual paging
    public getRowHeightAsNumber(): number {
        let rowHeight = this.gridOptions.rowHeight;
        if (_.missing(rowHeight)) {
            return this.getDefaultRowHeight();
        } else if (this.isNumeric(this.gridOptions.rowHeight)) {
            return this.gridOptions.rowHeight;
        } else {
            console.warn('ag-Grid row height must be a number if not using standard row model');
            return this.getDefaultRowHeight();
        }
    }

    public getRowHeightForNode(rowNode: RowNode): number {
        // check the function first, in case use set both function and
        // number, when using virtual pagination then function can be
        // used for pinned rows and the number for the body rows.

        if (typeof this.gridOptions.getRowHeight === 'function') {
            let params = {
                node: rowNode,
                data: rowNode.data,
                api: this.gridOptions.api,
                context: this.gridOptions.context
            };
            return this.gridOptions.getRowHeight(params);
        } else if (rowNode.detail && this.isMasterDetail()) {
            if (this.isNumeric(this.gridOptions.detailRowHeight)) {
                return this.gridOptions.detailRowHeight;
            } else {
                return DEFAULT_DETAIL_ROW_HEIGHT;
            }
        } else {
            let defaultHeight = this.isNumeric(this.gridOptions.rowHeight) ?
                this.gridOptions.rowHeight : this.getDefaultRowHeight();
            if (this.columnController.isAutoRowHeightActive()) {
                let autoHeight = this.autoHeightCalculator.getPreferredHeightForRow(rowNode);
                // never return less than the default row height - covers when auto height
                // cells are blank.
                if (autoHeight > defaultHeight) {
                    return autoHeight;
                } else {
                    return defaultHeight;
                }
            } else {
                return defaultHeight;
            }
        }
    }

    public isDynamicRowHeight(): boolean {
        return typeof this.gridOptions.getRowHeight === 'function';
    }

    public getVirtualItemHeight() {
        return this.specialForNewMaterial(20, 'virtualItemHeight');
    }

    private isNumeric(value:any) {
        return !isNaN(value) && typeof value === 'number';
    }

    // Material data table has strict guidelines about whitespace, and these values are different than the ones
    // ag-grid uses by default. We override the default ones for the sake of making it better out of the box
    private specialForNewMaterial(defaultValue: number, sassVariableName: string): number {
        var theme = this.environment.getTheme();
        if (theme.indexOf('ag-theme') === 0) {
            return this.environment.getSassVariable(theme, sassVariableName);
        } else {
            return defaultValue;
        }
    }

    private getDefaultRowHeight() {
        return this.specialForNewMaterial(DEFAULT_ROW_HEIGHT, 'rowHeight');
    }
}
