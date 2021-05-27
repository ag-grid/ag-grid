import { RowRenderer } from "./rendering/rowRenderer";
import { FilterManager } from "./filter/filterManager";
import { ColumnModel, ColumnState } from "./columns/columnModel";
import { ColumnApi } from "./columns/columnApi";
import { SelectionService } from "./selectionService";
import { GridOptionsWrapper } from "./gridOptionsWrapper";
import { GridBodyComp } from "./gridBodyComp/gridBodyComp";
import { ValueService } from "./valueService/valueService";
import { EventService } from "./eventService";
import { ColDef, ColGroupDef, IAggFunc } from "./entities/colDef";
import { RowNode } from "./entities/rowNode";
import { Constants } from "./constants/constants";
import { Column } from "./entities/column";
import { Autowired, Bean, Context, Optional, PostConstruct, PreDestroy } from "./context/context";
import { IRowModel } from "./interfaces/iRowModel";
import { SortController } from "./sortController";
import { FocusService } from "./focusService";
import { CellRange, CellRangeParams, IRangeService } from "./interfaces/IRangeService";
import { CellPosition } from "./entities/cellPosition";
import { IClipboardService } from "./interfaces/iClipboardService";
import { IViewportDatasource } from "./interfaces/iViewportDatasource";
import { IMenuFactory } from "./interfaces/iMenuFactory";
import { IAggFuncService } from "./interfaces/iAggFuncService";
import { IFilterComp } from "./interfaces/iFilter";
import { CsvExportParams, ProcessCellForExportParams } from "./interfaces/exportParams";
import {
    ExcelExportMultipleSheetParams,
    ExcelExportParams,
    ExcelFactoryMode,
    IExcelCreator
} from "./interfaces/iExcelCreator";
import { IDatasource } from "./interfaces/iDatasource";
import { IServerSideDatasource } from "./interfaces/iServerSideDatasource";
import { PaginationProxy } from "./pagination/paginationProxy";
import { ValueCache } from "./valueService/valueCache";
import { AlignedGridsService } from "./alignedGridsService";
import { AgEvent, ColumnEventType } from "./events";
import { IContextMenuFactory } from "./interfaces/iContextMenuFactory";
import { ICellRendererComp } from "./rendering/cellRenderers/iCellRenderer";
import { ICellEditorComp } from "./interfaces/iCellEditor";
import { DragAndDropService } from "./dragAndDrop/dragAndDropService";
import { HeaderRootComp } from "./headerRendering/headerRootComp";
import { AnimationFrameService } from "./misc/animationFrameService";
import {
    IServerSideRowModel,
    IServerSideTransactionManager,
    RefreshStoreParams
} from "./interfaces/iServerSideRowModel";
import { IStatusBarService } from "./interfaces/iStatusBarService";
import { IStatusPanelComp } from "./interfaces/iStatusPanel";
import { SideBarDef, SideBarDefParser } from "./entities/sideBar";
import { ChartModel, IChartService } from "./interfaces/IChartService";
import { ModuleNames } from "./modules/moduleNames";
import {
    ChartRef,
    GetChartToolbarItems,
    GetContextMenuItems,
    GetMainMenuItems,
    GetRowNodeIdFunc, GetServerSideGroupKey,
    GetServerSideStoreParamsParams, IsApplyServerSideTransaction,
    IsRowMaster,
    IsRowSelectable, IsServerSideGroup, IsServerSideGroupOpenByDefaultParams,
    NavigateToNextCellParams,
    NavigateToNextHeaderParams,
    PaginationNumberFormatterParams,
    PostProcessPopupParams,
    ProcessChartOptionsParams,
    ProcessRowParams, ServerSideStoreParams,
    TabToNextCellParams,
    TabToNextHeaderParams
} from "./entities/gridOptions";
import { ChartOptions, ChartType } from "./interfaces/iChartOptions";
import { IToolPanel } from "./interfaces/iToolPanel";
import { RowNodeTransaction } from "./interfaces/rowNodeTransaction";
import { ClientSideRowModelSteps, IClientSideRowModel, RefreshModelParams } from "./interfaces/iClientSideRowModel";
import { RowDataTransaction } from "./interfaces/rowDataTransaction";
import { PinnedRowModel } from "./pinnedRowModel/pinnedRowModel";
import { IImmutableService } from "./interfaces/iImmutableService";
import { IInfiniteRowModel } from "./interfaces/iInfiniteRowModel";
import { ICsvCreator } from "./interfaces/iCsvCreator";
import { ModuleRegistry } from "./modules/moduleRegistry";
import { UndoRedoService } from "./undoRedo/undoRedoService";
import { RowDropZoneEvents, RowDropZoneParams } from "./gridBodyComp/rowDragFeature";
import { iterateObject, removeAllReferences } from "./utils/object";
import { exists, missing } from "./utils/generic";
import { camelCaseToHumanText } from "./utils/string";
import { doOnce } from "./utils/function";
import { AgChartThemeOverrides } from "./interfaces/iAgChartOptions";
import { RowNodeBlockLoader } from "./rowNodeCache/rowNodeBlockLoader";
import { ServerSideTransaction, ServerSideTransactionResult } from "./interfaces/serverSideTransaction";
import { ServerSideStoreState } from "./interfaces/IServerSideStore";
import { HeadlessService } from "./headless/headlessService";
import { GridCtrl } from "./gridComp/gridCtrl";
import { ISideBar } from "./interfaces/iSideBar";
import { ControllersService } from "./controllersService";
import { GridBodyCtrl } from "./gridBodyComp/gridBodyCtrl";
import { OverlayWrapperComponent } from "./rendering/overlays/overlayWrapperComponent";
import { HeaderPosition } from "./headerRendering/header/headerPosition";

export interface StartEditingCellParams {
    rowIndex: number;
    colKey: string | Column;
    rowPinned?: string;
    keyPress?: number;
    charPress?: string;
}

export interface GetCellsParams {
    rowNodes?: RowNode[];
    columns?: (string | Column)[];
}

export interface RefreshCellsParams extends GetCellsParams {
    force?: boolean;
    suppressFlash?: boolean;
}

export interface FlashCellsParams extends GetCellsParams {
    flashDelay?: number;
    fadeDelay?: number;
}

export interface GetCellRendererInstancesParams extends GetCellsParams { }

export interface GetCellEditorInstancesParams extends GetCellsParams { }

export interface RedrawRowsParams {
    rowNodes?: RowNode[];
}

export interface CreateRangeChartParams {
    cellRange: CellRangeParams;
    chartType: ChartType;
    chartThemeName?: string;
    chartContainer?: HTMLElement;
    suppressChartRanges?: boolean;
    aggFunc?: string | IAggFunc;
    chartThemeOverrides?: AgChartThemeOverrides;
    unlinkChart?: boolean;
    /** @deprecated since v24.0.0, use `chartThemeOverrides` instead */
    processChartOptions?: (params: ProcessChartOptionsParams) => ChartOptions<any>;
}

export interface CreatePivotChartParams {
    chartType: ChartType;
    chartThemeName?: string;
    chartContainer?: HTMLElement;
    chartThemeOverrides?: AgChartThemeOverrides;
    unlinkChart?: boolean;
    /** @deprecated since v24.0.0, use `chartThemeOverrides` instead */
    processChartOptions?: (params: ProcessChartOptionsParams) => ChartOptions<any>;
}

export interface CreateCrossFilterChartParams {
    cellRange: CellRangeParams;
    chartType: ChartType;
    chartThemeName?: string;
    chartContainer?: HTMLElement;
    suppressChartRanges?: boolean;
    aggFunc?: string | IAggFunc;
    chartThemeOverrides?: AgChartThemeOverrides;
    unlinkChart?: boolean;
}

export interface DetailGridInfo {
    api?: GridApi;
    columnApi?: ColumnApi;
    id: string;
}

@Bean('gridApi')
export class GridApi {

    @Optional('immutableService') private immutableService: IImmutableService;
    @Optional('csvCreator') private csvCreator: ICsvCreator;
    @Optional('excelCreator') private excelCreator: IExcelCreator;
    @Autowired('rowRenderer') private rowRenderer: RowRenderer;
    @Autowired('filterManager') private filterManager: FilterManager;
    @Autowired('columnModel') private columnModel: ColumnModel;
    @Autowired('selectionService') private selectionService: SelectionService;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('valueService') private valueService: ValueService;
    @Autowired('alignedGridsService') private alignedGridsService: AlignedGridsService;
    @Autowired('eventService') private eventService: EventService;
    @Autowired('pinnedRowModel') private pinnedRowModel: PinnedRowModel;
    @Autowired('context') private context: Context;
    @Autowired('rowModel') private rowModel: IRowModel;
    @Autowired('sortController') private sortController: SortController;
    @Autowired('paginationProxy') private paginationProxy: PaginationProxy;
    @Autowired('focusService') private focusService: FocusService;
    @Autowired('dragAndDropService') private dragAndDropService: DragAndDropService;
    @Optional('rangeService') private rangeService: IRangeService;
    @Optional('clipboardService') private clipboardService: IClipboardService;
    @Optional('aggFuncService') private aggFuncService: IAggFuncService;
    @Autowired('menuFactory') private menuFactory: IMenuFactory;
    @Optional('contextMenuFactory') private contextMenuFactory: IContextMenuFactory;
    @Autowired('valueCache') private valueCache: ValueCache;
    @Autowired('animationFrameService') private animationFrameService: AnimationFrameService;
    @Optional('statusBarService') private statusBarService: IStatusBarService;
    @Optional('chartService') private chartService: IChartService;
    @Optional('undoRedoService') private undoRedoService: UndoRedoService;
    @Optional('headlessService') private headlessService: HeadlessService;
    @Optional('rowNodeBlockLoader') private rowNodeBlockLoader: RowNodeBlockLoader;
    @Optional('ssrmTransactionManager') private serverSideTransactionManager: IServerSideTransactionManager;
    @Optional('controllersService') private controllersService: ControllersService;

    private overlayWrapperComp: OverlayWrapperComponent;
    private gridBodyComp: GridBodyComp;
    private gridBodyCon: GridBodyCtrl;
    private gridCompController: GridCtrl;
    private sideBarComp: ISideBar;

    private headerRootComp: HeaderRootComp;
    private clientSideRowModel: IClientSideRowModel;
    private infiniteRowModel: IInfiniteRowModel;

    private serverSideRowModel: IServerSideRowModel;

    private detailGridInfoMap: { [id: string]: DetailGridInfo | undefined; } = {};

    private destroyCalled = false;

    public registerGridComp(gridBodyComp: GridBodyComp): void {
        this.gridBodyComp = gridBodyComp;
    }

    public registerOverlayWrapperComp(overlayWrapperComp: OverlayWrapperComponent): void {
        this.overlayWrapperComp = overlayWrapperComp;
    }

    public registerGridCompController(gridCompController: GridCtrl): void {
        this.gridCompController = gridCompController;
    }

    public registerHeaderRootComp(headerRootComp: HeaderRootComp): void {
        this.headerRootComp = headerRootComp;
    }

    public registerSideBarComp(sideBarComp: ISideBar): void {
        this.sideBarComp = sideBarComp;
    }

    @PostConstruct
    private init(): void {
        switch (this.rowModel.getType()) {
            case Constants.ROW_MODEL_TYPE_CLIENT_SIDE:
                this.clientSideRowModel = this.rowModel as IClientSideRowModel;
                break;
            case Constants.ROW_MODEL_TYPE_INFINITE:
                this.infiniteRowModel = this.rowModel as IInfiniteRowModel;
                break;
            case Constants.ROW_MODEL_TYPE_SERVER_SIDE:
                this.serverSideRowModel = this.rowModel as IServerSideRowModel;
                break;
        }

        this.controllersService.whenReady(() => {
            this.gridBodyCon = this.controllersService.getGridBodyController();
        });
    }

    /** Used internally by grid. Not intended to be used by the client. Interface may change between releases. */
    public __getAlignedGridService(): AlignedGridsService {
        return this.alignedGridsService;
    }

    public addDetailGridInfo(id: string, gridInfo: DetailGridInfo): void {
        this.detailGridInfoMap[id] = gridInfo;
    }

    public removeDetailGridInfo(id: string): void {
        this.detailGridInfoMap[id] = undefined;
    }

    public getDetailGridInfo(id: string): DetailGridInfo | undefined {
        return this.detailGridInfoMap[id];
    }

    public forEachDetailGridInfo(callback: (gridInfo: DetailGridInfo, index: number) => void) {
        let index = 0;
        iterateObject(this.detailGridInfoMap, (id: string, gridInfo: DetailGridInfo) => {
            // check for undefined, as old references will still be lying around
            if (exists(gridInfo)) {
                callback(gridInfo, index);
                index++;
            }
        });
    }

    public getDataAsCsv(params?: CsvExportParams): string | undefined {
        if (ModuleRegistry.assertRegistered(ModuleNames.CsvExportModule, 'api.getDataAsCsv')) {
            return this.csvCreator.getDataAsCsv(params);
        }
    }

    public exportDataAsCsv(params?: CsvExportParams): void {
        if (ModuleRegistry.assertRegistered(ModuleNames.CsvExportModule, 'api.exportDataAsCSv')) {
            this.csvCreator.exportDataAsCsv(params);
        }
    }

    public getDataAsExcel(params?: ExcelExportParams): string | Blob | undefined {
        if (ModuleRegistry.assertRegistered(ModuleNames.ExcelExportModule, 'api.getDataAsExcel')) {
            const exportMode: 'xml' | 'xlsx' = (params && params.exportMode) || 'xlsx';
            if (this.excelCreator.getFactoryMode(exportMode) === ExcelFactoryMode.MULTI_SHEET) {
                console.warn('AG Grid: The Excel Exporter is currently on Multi Sheet mode. End that operation by calling `api.getMultipleSheetAsExcel()` or `api.exportMultipleSheetsAsExcel()`');
                return;
            }
            return this.excelCreator.getDataAsExcel(params);
        }
    }

    public exportDataAsExcel(params?: ExcelExportParams): void {
        if (ModuleRegistry.assertRegistered(ModuleNames.ExcelExportModule, 'api.exportDataAsExcel')) {
            const exportMode: 'xml' | 'xlsx' = (params && params.exportMode) || 'xlsx';
            if (this.excelCreator.getFactoryMode(exportMode) === ExcelFactoryMode.MULTI_SHEET) {
                console.warn('AG Grid: The Excel Exporter is currently on Multi Sheet mode. End that operation by calling `api.getMultipleSheetAsExcel()` or `api.exportMultipleSheetsAsExcel()`');
                return;
            }
            this.excelCreator.exportDataAsExcel(params);
        }
    }

    public getSheetDataForExcel(params?: ExcelExportParams): string | undefined {
        if (ModuleRegistry.assertRegistered(ModuleNames.ExcelExportModule, 'api.getSheetDataForExcel')) {
            const exportMode: 'xml' | 'xlsx' = (params && params.exportMode) || 'xlsx';
            this.excelCreator.setFactoryMode(ExcelFactoryMode.MULTI_SHEET, exportMode);
            return this.excelCreator.getSheetDataForExcel(params);
        }
    }

    public getMultipleSheetsAsExcel(params: ExcelExportMultipleSheetParams): Blob | undefined {
        if (ModuleRegistry.assertRegistered(ModuleNames.ExcelExportModule, 'api.getMultipleSheetsAsExcel')) {
            return this.excelCreator.getMultipleSheetsAsExcel(params);
        }
    }

    public exportMultipleSheetsAsExcel(params: ExcelExportMultipleSheetParams): void {
        if (ModuleRegistry.assertRegistered(ModuleNames.ExcelExportModule, 'api.exportMultipleSheetsAsExcel')) {
            return this.excelCreator.exportMultipleSheetsAsExcel(params);
        }
    }

    /** @deprecated */
    public setEnterpriseDatasource(datasource: IServerSideDatasource) {
        console.warn(`ag-grid: since version 18.x, api.setEnterpriseDatasource() should be replaced with api.setServerSideDatasource()`);
        this.setServerSideDatasource(datasource);
    }

    public setGridAriaProperty(property: string, value: string | null): void {
        if (!property) { return; }
        const eGrid = this.gridBodyComp.getGui();
        const ariaProperty = `aria-${property}`;

        if (value === null) {
            eGrid.removeAttribute(ariaProperty);
        } else {
            eGrid.setAttribute(ariaProperty, value);
        }

    }

    public setServerSideDatasource(datasource: IServerSideDatasource) {
        if (this.serverSideRowModel) {
            // should really have an IEnterpriseRowModel interface, so we are not casting to any
            this.serverSideRowModel.setDatasource(datasource);
        } else {
            console.warn(`AG Grid: you can only use an enterprise datasource when gridOptions.rowModelType is '${Constants.ROW_MODEL_TYPE_SERVER_SIDE}'`);
        }
    }

    public setDatasource(datasource: IDatasource) {
        if (this.gridOptionsWrapper.isRowModelInfinite()) {
            (this.rowModel as IInfiniteRowModel).setDatasource(datasource);
        } else {
            console.warn(`AG Grid: you can only use a datasource when gridOptions.rowModelType is '${Constants.ROW_MODEL_TYPE_INFINITE}'`);
        }
    }

    public setViewportDatasource(viewportDatasource: IViewportDatasource) {
        if (this.gridOptionsWrapper.isRowModelViewport()) {
            // this is bad coding, because it's using an interface that's exposed in the enterprise.
            // really we should create an interface in the core for viewportDatasource and let
            // the enterprise implement it, rather than casting to 'any' here
            (this.rowModel as any).setViewportDatasource(viewportDatasource);
        } else {
            console.warn(`AG Grid: you can only use a viewport datasource when gridOptions.rowModelType is '${Constants.ROW_MODEL_TYPE_VIEWPORT}'`);
        }
    }

    public setRowData(rowData: any[]) {
        if (this.gridOptionsWrapper.isRowModelDefault()) {
            if (this.gridOptionsWrapper.isImmutableData()) {
                const transactionAndMap = this.immutableService.createTransactionForRowData(rowData);

                if (!transactionAndMap) { return; }

                const [transaction, orderIdMap] = transactionAndMap;
                const nodeTransaction = this.clientSideRowModel.updateRowData(transaction, orderIdMap);
                // need to force updating of full width rows - note this wouldn't be necessary the full width cell comp listened
                // to the data change event on the row node and refreshed itself.
                if (nodeTransaction) {
                    this.rowRenderer.refreshFullWidthRows(nodeTransaction.update);
                }
            } else {
                this.selectionService.reset();
                this.clientSideRowModel.setRowData(rowData);
            }
        } else {
            console.warn('cannot call setRowData unless using normal row model');
        }
    }

    /** @deprecated */
    public setFloatingTopRowData(rows: any[]): void {
        console.warn('AG Grid: since v12, api.setFloatingTopRowData() is now api.setPinnedTopRowData()');
        this.setPinnedTopRowData(rows);
    }

    /** @deprecated */
    public setFloatingBottomRowData(rows: any[]): void {
        console.warn('AG Grid: since v12, api.setFloatingBottomRowData() is now api.setPinnedBottomRowData()');
        this.setPinnedBottomRowData(rows);
    }

    /** @deprecated */
    public getFloatingTopRowCount(): number {
        console.warn('AG Grid: since v12, api.getFloatingTopRowCount() is now api.getPinnedTopRowCount()');
        return this.getPinnedTopRowCount();
    }

    /** @deprecated */
    public getFloatingBottomRowCount(): number {
        console.warn('AG Grid: since v12, api.getFloatingBottomRowCount() is now api.getPinnedBottomRowCount()');
        return this.getPinnedBottomRowCount();
    }

    /** @deprecated */
    public getFloatingTopRow(index: number): RowNode {
        console.warn('AG Grid: since v12, api.getFloatingTopRow() is now api.getPinnedTopRow()');
        return this.getPinnedTopRow(index);
    }

    /** @deprecated */
    public getFloatingBottomRow(index: number): RowNode {
        console.warn('AG Grid: since v12, api.getFloatingBottomRow() is now api.getPinnedBottomRow()');
        return this.getPinnedBottomRow(index);
    }

    public setPinnedTopRowData(rows: any[]): void {
        this.pinnedRowModel.setPinnedTopRowData(rows);
    }

    public setPinnedBottomRowData(rows: any[]): void {
        this.pinnedRowModel.setPinnedBottomRowData(rows);
    }

    public getPinnedTopRowCount(): number {
        return this.pinnedRowModel.getPinnedTopRowCount();
    }

    public getPinnedBottomRowCount(): number {
        return this.pinnedRowModel.getPinnedBottomRowCount();
    }

    public getPinnedTopRow(index: number): RowNode {
        return this.pinnedRowModel.getPinnedTopRow(index);
    }

    public getPinnedBottomRow(index: number): RowNode {
        return this.pinnedRowModel.getPinnedBottomRow(index);
    }

    public setColumnDefs(colDefs: (ColDef | ColGroupDef)[], source: ColumnEventType = "api") {
        this.columnModel.setColumnDefs(colDefs, source);
    }

    public setAutoGroupColumnDef(colDef: ColDef, source: ColumnEventType = "api") {
        this.gridOptionsWrapper.setProperty('autoGroupColumnDef', colDef, true);
    }

    public expireValueCache(): void {
        this.valueCache.expire();
    }

    public getVerticalPixelRange(): { top: number, bottom: number; } {
        return this.gridBodyCon.getScrollFeature().getVScrollPosition();
    }

    public getHorizontalPixelRange(): { left: number, right: number; } {
        return this.gridBodyCon.getScrollFeature().getHScrollPosition();
    }

    public setAlwaysShowHorizontalScroll(show: boolean) {
        this.gridOptionsWrapper.setProperty('alwaysShowHorizontalScroll', show);
    }

    public setAlwaysShowVerticalScroll(show: boolean) {
        this.gridOptionsWrapper.setProperty('alwaysShowVerticalScroll', show);
    }

    public refreshToolPanel(): void {
        if (!this.sideBarComp) { return; }
        this.sideBarComp.refresh();
    }

    public refreshCells(params: RefreshCellsParams = {}): void {
        if (Array.isArray(params)) {
            // the old version of refreshCells() took an array of rowNodes for the first argument
            console.warn('since AG Grid v11.1, refreshCells() now takes parameters, please see the documentation.');
            return;
        }
        this.rowRenderer.refreshCells(params);
    }

    public flashCells(params: FlashCellsParams = {}): void {
        this.rowRenderer.flashCells(params);
    }

    public redrawRows(params: RedrawRowsParams = {}): void {
        const rowNodes = params ? params.rowNodes : undefined;
        this.rowRenderer.redrawRows(rowNodes);
    }

    /** @deprecated */
    public refreshView() {
        console.warn('AG Grid: since v11.1, refreshView() is deprecated, please call refreshCells() or redrawRows() instead');
        this.redrawRows();
    }

    /** @deprecated */
    public refreshRows(rowNodes: RowNode[]): void {
        console.warn('since AG Grid v11.1, refreshRows() is deprecated, please use refreshCells({rowNodes: rows}) or redrawRows({rowNodes: rows}) instead');
        this.refreshCells({ rowNodes: rowNodes });
    }

    /** @deprecated */
    public rowDataChanged(rows: any) {
        console.warn('AG Grid: rowDataChanged is deprecated, either call refreshView() to refresh everything, or call rowNode.setRowData(newData) to set value on a particular node');
        this.redrawRows();
    }

    /** @deprecated */
    public softRefreshView() {
        console.error('AG Grid: since v16, softRefreshView() is no longer supported. Please check the documentation on how to refresh.');
    }

    /** @deprecated */
    public refreshGroupRows() {
        console.warn('AG Grid: since v11.1, refreshGroupRows() is no longer supported, call refreshCells() instead. ' +
            'Because refreshCells() now does dirty checking, it will only refresh cells that have changed, so it should ' +
            'not be necessary to only refresh the group rows.');
        this.refreshCells();
    }

    public setFunctionsReadOnly(readOnly: boolean) {
        this.gridOptionsWrapper.setProperty('functionsReadOnly', readOnly);
    }

    public refreshHeader() {
        this.headerRootComp.refreshHeader();
    }

    public isAnyFilterPresent(): boolean {
        return this.filterManager.isAnyFilterPresent();
    }

    /** @deprecated */
    public isAdvancedFilterPresent(): boolean {
        console.warn('AG Grid: isAdvancedFilterPresent() is deprecated, please use isColumnFilterPresent()');
        return this.isColumnFilterPresent();
    }

    public isColumnFilterPresent(): boolean {
        return this.filterManager.isAdvancedFilterPresent();
    }

    public isQuickFilterPresent(): boolean {
        return this.filterManager.isQuickFilterPresent();
    }

    public getModel(): IRowModel {
        return this.rowModel;
    }

    public setRowNodeExpanded(rowNode: RowNode, expanded: boolean): void {
        if (rowNode) {
            rowNode.setExpanded(expanded);
        }
    }

    public onGroupExpandedOrCollapsed(deprecated_refreshFromIndex?: any) {
        if (missing(this.clientSideRowModel)) { console.warn('AG Grid: cannot call onGroupExpandedOrCollapsed unless using normal row model'); }
        if (exists(deprecated_refreshFromIndex)) { console.warn('AG Grid: api.onGroupExpandedOrCollapsed - refreshFromIndex parameter is no longer used, the grid will refresh all rows'); }
        // we don't really want the user calling this if only one rowNode was expanded, instead they should be
        // calling rowNode.setExpanded(boolean) - this way we do a 'keepRenderedRows=false' so that the whole
        // grid gets refreshed again - otherwise the row with the rowNodes that were changed won't get updated,
        // and thus the expand icon in the group cell won't get 'opened' or 'closed'.
        this.clientSideRowModel.refreshModel({ step: ClientSideRowModelSteps.MAP });
    }

    public refreshInMemoryRowModel(step?: string): any {
        console.warn(`ag-grid: since version 18.x, api.refreshInMemoryRowModel() should be replaced with api.refreshClientSideRowModel()`);
        this.refreshClientSideRowModel(step);
    }

    public refreshClientSideRowModel(step?: string): any {
        if (missing(this.clientSideRowModel)) { console.warn('cannot call refreshClientSideRowModel unless using normal row model'); }

        let paramsStep = ClientSideRowModelSteps.EVERYTHING;
        const stepsMapped: any = {
            group: ClientSideRowModelSteps.EVERYTHING,
            filter: ClientSideRowModelSteps.FILTER,
            map: ClientSideRowModelSteps.MAP,
            aggregate: ClientSideRowModelSteps.AGGREGATE,
            sort: ClientSideRowModelSteps.SORT,
            pivot: ClientSideRowModelSteps.PIVOT
        };

        if (exists(step)) {
            paramsStep = stepsMapped[step];
        }
        if (missing(paramsStep)) {
            console.error(`AG Grid: invalid step ${step}, available steps are ${Object.keys(stepsMapped).join(', ')}`);
            return;
        }

        const modelParams: RefreshModelParams = {
            step: paramsStep,
            keepRenderedRows: true,
            animate: true,
            keepEditingRows: true
        };

        this.clientSideRowModel.refreshModel(modelParams);
    }

    public isAnimationFrameQueueEmpty(): boolean {
        return this.animationFrameService.isQueueEmpty();
    }

    public getRowNode(id: string): RowNode | null {
        return this.rowModel.getRowNode(id);
    }

    public getSizesForCurrentTheme() {
        return {
            rowHeight: this.gridOptionsWrapper.getRowHeightAsNumber(),
            headerHeight: this.gridOptionsWrapper.getHeaderHeight()
        };
    }

    public expandAll() {
        if (this.clientSideRowModel) {
            this.clientSideRowModel.expandOrCollapseAll(true);
        } else if (this.serverSideRowModel) {
            this.serverSideRowModel.expandAll(true);
        } else {
            console.warn('AG Grid: expandAll only works with Client Side Row Model and Server Side Row Model');
        }
    }

    public collapseAll() {
        if (this.clientSideRowModel) {
            this.clientSideRowModel.expandOrCollapseAll(false);
        } else if (this.serverSideRowModel) {
            this.serverSideRowModel.expandAll(false);
        } else {
            console.warn('AG Grid: collapseAll only works with Client Side Row Model and Server Side Row Model');
        }
    }

    public getToolPanelInstance(id: string): IToolPanel | undefined {
        if (!this.sideBarComp) {
            console.warn('AG Grid: toolPanel is only available in AG Grid Enterprise');
            return;
        }
        return this.sideBarComp.getToolPanelInstance(id);
    }

    public addVirtualRowListener(eventName: string, rowIndex: number, callback: Function) {
        if (typeof eventName !== 'string') {
            console.warn('AG Grid: addVirtualRowListener is deprecated, please use addRenderedRowListener.');
        }
        this.addRenderedRowListener(eventName, rowIndex, callback);
    }

    public addRenderedRowListener(eventName: string, rowIndex: number, callback: Function) {
        if (eventName === 'virtualRowSelected') {
            console.warn(`AG Grid: event virtualRowSelected is deprecated, to register for individual row
                selection events, add a listener directly to the row node.`);
        }
        this.rowRenderer.addRenderedRowListener(eventName, rowIndex, callback);
    }

    public setQuickFilter(newFilter: any): void {
        this.filterManager.setQuickFilter(newFilter);
    }

    public selectIndex(index: any, tryMulti: any, suppressEvents: any) {
        console.warn('AG Grid: do not use api for selection, call node.setSelected(value) instead');
        if (suppressEvents) {
            console.warn('AG Grid: suppressEvents is no longer supported, stop listening for the event if you no longer want it');
        }
        this.selectionService.selectIndex(index, tryMulti);
    }

    public deselectIndex(index: number, suppressEvents: boolean = false) {
        console.warn('AG Grid: do not use api for selection, call node.setSelected(value) instead');
        if (suppressEvents) {
            console.warn('AG Grid: suppressEvents is no longer supported, stop listening for the event if you no longer want it');
        }
        this.selectionService.deselectIndex(index);
    }

    public selectNode(node: RowNode, tryMulti: boolean = false, suppressEvents: boolean = false) {
        console.warn('AG Grid: API for selection is deprecated, call node.setSelected(value) instead');
        if (suppressEvents) {
            console.warn('AG Grid: suppressEvents is no longer supported, stop listening for the event if you no longer want it');
        }
        node.setSelectedParams({ newValue: true, clearSelection: !tryMulti });
    }

    public deselectNode(node: RowNode, suppressEvents: boolean = false) {
        console.warn('AG Grid: API for selection is deprecated, call node.setSelected(value) instead');
        if (suppressEvents) {
            console.warn('AG Grid: suppressEvents is no longer supported, stop listening for the event if you no longer want it');
        }
        node.setSelectedParams({ newValue: false });
    }

    public selectAll() {
        this.selectionService.selectAllRowNodes();
    }

    public deselectAll() {
        this.selectionService.deselectAllRowNodes();
    }

    public selectAllFiltered() {
        this.selectionService.selectAllRowNodes(true);
    }

    public deselectAllFiltered() {
        this.selectionService.deselectAllRowNodes(true);
    }

    public recomputeAggregates(): void {
        if (missing(this.clientSideRowModel)) { console.warn('cannot call recomputeAggregates unless using normal row model'); }
        console.warn(`recomputeAggregates is deprecated, please call api.refreshClientSideRowModel('aggregate') instead`);
        this.clientSideRowModel.refreshModel({ step: ClientSideRowModelSteps.AGGREGATE });
    }

    public sizeColumnsToFit() {
        this.gridBodyCon.sizeColumnsToFit();
    }

    public showLoadingOverlay(): void {
        this.overlayWrapperComp.showLoadingOverlay();
    }

    public showNoRowsOverlay(): void {
        this.overlayWrapperComp.showNoRowsOverlay();
    }

    public hideOverlay(): void {
        this.overlayWrapperComp.hideOverlay();
    }

    public isNodeSelected(node: any) {
        console.warn('AG Grid: no need to call api.isNodeSelected(), just call node.isSelected() instead');
        return node.isSelected();
    }

    public getSelectedNodesById(): { [nodeId: number]: RowNode; } | null {
        console.error('AG Grid: since version 3.4, getSelectedNodesById no longer exists, use getSelectedNodes() instead');
        return null;
    }

    public getSelectedNodes(): RowNode[] {
        return this.selectionService.getSelectedNodes();
    }

    public getSelectedRows(): any[] {
        return this.selectionService.getSelectedRows();
    }

    public getBestCostNodeSelection() {
        return this.selectionService.getBestCostNodeSelection();
    }

    public getRenderedNodes() {
        return this.rowRenderer.getRenderedNodes();
    }

    public ensureColIndexVisible(index: any) {
        console.warn('AG Grid: ensureColIndexVisible(index) no longer supported, use ensureColumnVisible(colKey) instead.');
    }

    public ensureColumnVisible(key: string | Column) {
        this.gridBodyCon.getScrollFeature().ensureColumnVisible(key);
    }

    // Valid values for position are bottom, middle and top
    public ensureIndexVisible(index: any, position?: string | null) {
        this.gridBodyCon.getScrollFeature().ensureIndexVisible(index, position);
    }

    // Valid values for position are bottom, middle and top
    public ensureNodeVisible(comparator: any, position: string | null = null) {
        this.gridBodyCon.getScrollFeature().ensureNodeVisible(comparator, position);
    }

    public forEachLeafNode(callback: (rowNode: RowNode) => void) {
        if (missing(this.clientSideRowModel)) { console.warn('cannot call forEachNode unless using normal row model'); }
        this.clientSideRowModel.forEachLeafNode(callback);
    }

    public forEachNode(callback: (rowNode: RowNode, index: number) => void) {
        this.rowModel.forEachNode(callback);
    }

    public forEachNodeAfterFilter(callback: (rowNode: RowNode, index: number) => void) {
        if (missing(this.clientSideRowModel)) { console.warn('cannot call forEachNodeAfterFilter unless using normal row model'); }
        this.clientSideRowModel.forEachNodeAfterFilter(callback);
    }

    public forEachNodeAfterFilterAndSort(callback: (rowNode: RowNode, index: number) => void) {
        if (missing(this.clientSideRowModel)) { console.warn('cannot call forEachNodeAfterFilterAndSort unless using normal row model'); }
        this.clientSideRowModel.forEachNodeAfterFilterAndSort(callback);
    }

    public getFilterApiForColDef(colDef: any): any {
        console.warn('ag-grid API method getFilterApiForColDef deprecated, use getFilterInstance instead');
        return this.getFilterInstance(colDef);
    }

    public getFilterInstance(key: string | Column, callback?: (filter: IFilterComp) => void): IFilterComp | null | undefined {
        const column = this.columnModel.getPrimaryColumn(key);

        if (column) {
            const filterPromise = this.filterManager.getFilterComponent(column, 'NO_UI');
            const currentValue = filterPromise && filterPromise.resolveNow<IFilterComp | null>(null, filterComp => filterComp);

            if (callback) {
                if (currentValue) {
                    setTimeout(callback, 0, currentValue);
                } else if (filterPromise) {
                    filterPromise.then(callback);
                }
            }

            return currentValue;
        }
    }

    public getFilterApi(key: string | Column) {
        console.warn('AG Grid: getFilterApi is deprecated, use getFilterInstance instead');
        return this.getFilterInstance(key);
    }

    public destroyFilter(key: string | Column) {
        const column = this.columnModel.getPrimaryColumn(key);
        if (column) {
            return this.filterManager.destroyFilter(column, "filterDestroyed");
        }
    }

    public getStatusPanel(key: string): IStatusPanelComp | undefined {
        if (this.statusBarService) {
            return this.statusBarService.getStatusPanel(key);
        }
    }

    public getColumnDef(key: string | Column) {
        const column = this.columnModel.getPrimaryColumn(key);
        if (column) {
            return column.getColDef();
        }
        return null;
    }

    public getColumnDefs(): (ColDef | ColGroupDef)[] { return this.columnModel.getColumnDefs(); }

    public onFilterChanged() {
        this.filterManager.onFilterChanged();
    }

    public onSortChanged() {
        this.sortController.onSortChanged();
    }

    public setSortModel(sortModel: any, source: ColumnEventType = "api") {
        console.warn('AG Grid: as of version 24.0.0, setSortModel() is deprecated, sort information is now part of Column State. Please use columnApi.applyColumnState() instead.');
        const columnState: ColumnState[] = [];
        if (sortModel) {
            sortModel.forEach((item: any, index: number) => {
                columnState.push({
                    colId: item.colId,
                    sort: item.sort,
                    sortIndex: index
                });
            });
        }
        this.columnModel.applyColumnState({ state: columnState, defaultState: { sort: null } });
    }

    public getSortModel() {
        console.warn('AG Grid: as of version 24.0.0, getSortModel() is deprecated, sort information is now part of Column State. Please use columnApi.getColumnState() instead.');
        const columnState = this.columnModel.getColumnState();
        const filteredStates = columnState.filter(item => item.sort != null);

        const indexes: { [colId: string]: number; } = {};
        filteredStates.forEach(state => {
            const id = state.colId as string;
            const sortIndex = state.sortIndex as number;
            indexes[id] = sortIndex;
        });

        const res = filteredStates.map(s => {
            return { colId: s.colId, sort: s.sort };
        });

        res.sort((a: any, b: any) => indexes[a.colId] - indexes[b.colId]);

        return res;
    }

    public setFilterModel(model: any) {
        this.filterManager.setFilterModel(model);
    }

    public getFilterModel() {
        return this.filterManager.getFilterModel();
    }

    public getFocusedCell(): CellPosition | null {
        return this.focusService.getFocusedCell();
    }

    public clearFocusedCell(): void {
        return this.focusService.clearFocusedCell();
    }

    public setFocusedCell(rowIndex: number, colKey: string | Column, floating?: string) {
        this.focusService.setFocusedCell(rowIndex, colKey, floating, true);
    }

    public setSuppressRowDrag(value: boolean): void {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_SUPPRESS_ROW_DRAG, value);
    }

    public setSuppressMoveWhenRowDragging(value: boolean): void {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_SUPPRESS_MOVE_WHEN_ROW_DRAG, value);
    }

    public setSuppressRowClickSelection(value: boolean): void {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_SUPPRESS_ROW_CLICK_SELECTION, value);
    }

    public addRowDropZone(params: RowDropZoneParams): void {
        this.gridBodyCon.getRowDragFeature().addRowDropZone(params);
    }

    public removeRowDropZone(params: RowDropZoneParams): void {
        const activeDropTarget = this.dragAndDropService.findExternalZone(params);

        if (activeDropTarget) {
            this.dragAndDropService.removeDropTarget(activeDropTarget);
        }
    }

    public getRowDropZoneParams(events: RowDropZoneEvents): RowDropZoneParams {
        return this.gridBodyCon.getRowDragFeature().getRowDropZone(events);
    }

    public setHeaderHeight(headerHeight?: number) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_HEADER_HEIGHT, headerHeight);
    }

    public setDomLayout(domLayout: string) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_DOM_LAYOUT, domLayout);
    }

    public setEnableCellTextSelection(selectable: boolean) {
        this.gridBodyCon.setCellTextSelection(selectable);
    }

    public setFillHandleDirection(direction: 'x' | 'y' | 'xy') {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_FILL_HANDLE_DIRECTION, direction);
    }

    public setGroupHeaderHeight(headerHeight: number) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_GROUP_HEADER_HEIGHT, headerHeight);
    }

    public setFloatingFiltersHeight(headerHeight: number) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_FLOATING_FILTERS_HEIGHT, headerHeight);
    }

    public setPivotGroupHeaderHeight(headerHeight: number) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_PIVOT_GROUP_HEADER_HEIGHT, headerHeight);
    }

    public setIsExternalFilterPresent(isExternalFilterPresentFunc: () => boolean) :  void {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_IS_EXTERNAL_FILTER_PRESENT, isExternalFilterPresentFunc);
    }

    public setDoesExternalFilterPass(doesExternalFilterPassFunc: (node: RowNode) => boolean) :  void {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_DOES_EXTERNAL_FILTER_PASS, doesExternalFilterPassFunc);
    }

    public setNavigateToNextCell(navigateToNextCellFunc: (params: NavigateToNextCellParams) => CellPosition) :  void {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_NAVIGATE_TO_NEXT_CELL, navigateToNextCellFunc);
    }

    public setTabToNextCell(tabToNextCellFunc: (params: TabToNextCellParams) => CellPosition) :  void {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_TAB_TO_NEXT_CELL, tabToNextCellFunc);
    }

    public setTabToNextHeader(tabToNextHeaderFunc: (params: TabToNextHeaderParams) => HeaderPosition) :  void {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_TAB_TO_NEXT_HEADER, tabToNextHeaderFunc);
    }

    public setNavigateToNextHeader(navigateToNextHeaderFunc: (params: NavigateToNextHeaderParams) => HeaderPosition) :  void {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_NAVIGATE_TO_NEXT_HEADER, navigateToNextHeaderFunc);
    }

    public setGroupRowAggNodes(groupRowAggNodesFunc: (nodes: RowNode[]) => any) :  void {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_GROUP_ROW_AGG_NODES, groupRowAggNodesFunc);
    }

    public setGetBusinessKeyForNode(getBusinessKeyForNodeFunc: (nodes: RowNode) => string) :  void {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_GET_BUSINESS_KEY_FOR_NODE, getBusinessKeyForNodeFunc);
    }

    public setGetChildCount(getChildCountFunc: (dataItem: any) => number) :  void {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_GET_CHILD_COUNT, getChildCountFunc);
    }

    public setProcessRowPostCreate(processRowPostCreateFunc: (params: ProcessRowParams) => void) :  void {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_PROCESS_ROW_POST_CREATE, processRowPostCreateFunc);
    }

    public setGetRowNodeId(getRowNodeIdFunc: GetRowNodeIdFunc) :  void {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_GET_ROW_NODE_ID, getRowNodeIdFunc);
    }

    public setGetRowClass(rowClassFunc: (params: any) => string | string[]) :  void {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_GET_ROW_CLASS, rowClassFunc);
    }

    public setIsFullWidthCell(isFullWidthCellFunc: (rowNode: RowNode) => boolean) :  void {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_IS_FULL_WIDTH_CELL, isFullWidthCellFunc);
    }

    public setIsRowSelectable(isRowSelectableFunc: IsRowSelectable) :  void {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_IS_ROW_SELECTABLE, isRowSelectableFunc);
    }

    public setIsRowMaster(isRowMasterFunc: IsRowMaster) :  void {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_IS_ROW_MASTER, isRowMasterFunc);
    }

    public setPostSort(postSortFunc: (nodes: RowNode[]) => void) :  void {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_POST_SORT, postSortFunc);
    }

    public setGetDocument(getDocumentFunc: () => Document) :  void {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_GET_DOCUMENT, getDocumentFunc);
    }

    public setGetContextMenuItems(getContextMenuItemsFunc: GetContextMenuItems) :  void {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_GET_CONTEXT_MENU_ITEMS, getContextMenuItemsFunc);
    }

    public setGetMainMenuItems(getMainMenuItemsFunc: GetMainMenuItems) :  void {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_GET_MAIN_MENU_ITEMS, getMainMenuItemsFunc);
    }

    public setProcessCellForClipboard(processCellForClipboardFunc: (params: ProcessCellForExportParams) => any) :  void {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_PROCESS_CELL_FOR_CLIPBOARD, processCellForClipboardFunc);
    }

    public setSendToClipboard(sendToClipboardFunc: (params: any) => void) :  void {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_SEND_TO_CLIPBOARD, sendToClipboardFunc);
    }

    public setProcessCellFromClipboard(processCellFromClipboardFunc: (params: ProcessCellForExportParams) => any) :  void {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_PROCESS_CELL_FROM_CLIPBOARD, processCellFromClipboardFunc);
    }

    public setProcessSecondaryColDef(processSecondaryColDefFunc: (colDef: ColDef) => void) :  void {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_PROCESS_TO_SECONDARY_COLDEF, processSecondaryColDefFunc);
    }

    public setProcessSecondaryColGroupDef(processSecondaryColGroupDefFunc: (colDef: ColDef) => void) :  void {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_PROCESS_SECONDARY_COL_GROUP_DEF, processSecondaryColGroupDefFunc);
    }

    public setPostProcessPopup(postProcessPopupFunc: (params: PostProcessPopupParams) => void) :  void {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_POST_PROCESS_POPUP, postProcessPopupFunc);
    }

    public setDefaultGroupSortComparator(defaultGroupSortComparatorFunc: (nodeA: RowNode, nodeB: RowNode) => number) :  void {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_DEFAULT_GROUP_SORT_COMPARATOR, defaultGroupSortComparatorFunc);
    }

    public setProcessChartOptions(processChartOptionsFunc: (params: ProcessChartOptionsParams) => ChartOptions<any>) :  void {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_PROCESS_CHART_OPTIONS, processChartOptionsFunc);
    }

    public setGetChartToolbarItems(getChartToolbarItemsFunc: GetChartToolbarItems) :  void {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_GET_CHART_TOOLBAR_ITEMS, getChartToolbarItemsFunc);
    }

    public setPaginationNumberFormatter(paginationNumberFormatterFunc: (params: PaginationNumberFormatterParams) => string) :  void {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_PAGINATION_NUMBER_FORMATTER, paginationNumberFormatterFunc);
    }

    public setGetServerSideStoreParams(getServerSideStoreParamsFunc: (params: GetServerSideStoreParamsParams) => ServerSideStoreParams) :  void {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_GET_SERVER_SIDE_STORE_PARAMS, getServerSideStoreParamsFunc);
    }

    public setIsServerSideGroupOpenByDefault(isServerSideGroupOpenByDefaultFunc: (params: IsServerSideGroupOpenByDefaultParams) => boolean) :  void {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_IS_SERVER_SIDE_GROUPS_OPEN_BY_DEFAULT, isServerSideGroupOpenByDefaultFunc);
    }

    public setIsApplyServerSideTransaction(isApplyServerSideTransactionFunc: IsApplyServerSideTransaction) :  void {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_IS_APPLY_SERVER_SIDE_TRANSACTION, isApplyServerSideTransactionFunc);
    }

    public setIsServerSideGroup(isServerSideGroupFunc: IsServerSideGroup) :  void {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_IS_SERVER_SIDE_GROUP, isServerSideGroupFunc);
    }

    public setGetServerSideGroupKey(getServerSideGroupKeyFunc: GetServerSideGroupKey) :  void {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_GET_SERVER_SIDE_GROUP_KEY, getServerSideGroupKeyFunc);
    }

    public setGetRowStyle(rowStyleFunc: (params: any) => {}) :  void {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_GET_ROW_STYLE, rowStyleFunc);
    }

    public setGetRowHeight(rowHeightFunc: (params: any) => number) :  void {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_GET_ROW_HEIGHT, rowHeightFunc);
    }

    public setPivotHeaderHeight(headerHeight: number) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_PIVOT_HEADER_HEIGHT, headerHeight);
    }

    public isSideBarVisible() {
        return this.sideBarComp ? this.sideBarComp.isDisplayed() : false;
    }

    public setSideBarVisible(show: boolean) {
        if (!this.sideBarComp) {
            if (show) {
                console.warn('AG Grid: sideBar is not loaded');
            }
            return;
        }
        this.sideBarComp.setDisplayed(show);
    }

    public setSideBarPosition(position: 'left' | 'right') {
        if (!this.sideBarComp) {
            console.warn('AG Grid: sideBar is not loaded');
            return;
        }
        this.sideBarComp.setSideBarPosition(position);
    }

    public openToolPanel(key: string) {
        if (!this.sideBarComp) {
            console.warn('AG Grid: toolPanel is only available in AG Grid Enterprise');
            return;
        }
        this.sideBarComp.openToolPanel(key);
    }

    public closeToolPanel() {
        if (!this.sideBarComp) {
            console.warn('AG Grid: toolPanel is only available in AG Grid Enterprise');
            return;
        }
        this.sideBarComp.close();
    }

    public getOpenedToolPanel(): string | null {
        return this.sideBarComp ? this.sideBarComp.openedItem() : null;
    }

    public getSideBar(): SideBarDef {
        return this.gridOptionsWrapper.getSideBar();
    }

    public setSideBar(def: SideBarDef): void {
        this.gridOptionsWrapper.setProperty('sideBar', SideBarDefParser.parse(def));
    }

    public setSuppressClipboardPaste(value: boolean): void {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_SUPPRESS_CLIPBOARD_PASTE, value);
    }

    public isToolPanelShowing() {
        return this.sideBarComp.isToolPanelShowing();
    }

    public doLayout() {
        const message = `AG Grid - since version 25.1, doLayout was taken out, as it's not needed. The grid responds to grid size changes automatically`;
        doOnce(() => console.warn(message), 'doLayoutDeprecated');
    }

    public resetRowHeights() {
        if (exists(this.clientSideRowModel)) {
            this.clientSideRowModel.resetRowHeights();
        }
    }

    public setGroupRemoveSingleChildren(value: boolean) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_GROUP_REMOVE_SINGLE_CHILDREN, value);
    }

    public setGroupRemoveLowestSingleChildren(value: boolean) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_GROUP_REMOVE_LOWEST_SINGLE_CHILDREN, value);
    }

    public onRowHeightChanged() {
        if (this.clientSideRowModel) {
            this.clientSideRowModel.onRowHeightChanged();
        } else if (this.serverSideRowModel) {
            this.serverSideRowModel.onRowHeightChanged();
        }
    }

    public getValue(colKey: string | Column, rowNode: RowNode): any {
        let column = this.columnModel.getPrimaryColumn(colKey);
        if (missing(column)) {
            column = this.columnModel.getGridColumn(colKey);
        }
        if (missing(column)) {
            return null;
        }
        return this.valueService.getValue(column, rowNode);
    }

    public addEventListener(eventType: string, listener: Function): void {
        const async = this.gridOptionsWrapper.useAsyncEvents();
        this.eventService.addEventListener(eventType, listener, async);
    }

    public addGlobalListener(listener: Function): void {
        const async = this.gridOptionsWrapper.useAsyncEvents();
        this.eventService.addGlobalListener(listener, async);
    }

    public removeEventListener(eventType: string, listener: Function): void {
        const async = this.gridOptionsWrapper.useAsyncEvents();
        this.eventService.removeEventListener(eventType, listener, async);
    }

    public removeGlobalListener(listener: Function): void {
        const async = this.gridOptionsWrapper.useAsyncEvents();
        this.eventService.removeGlobalListener(listener, async);
    }

    public dispatchEvent(event: AgEvent): void {
        this.eventService.dispatchEvent(event);
    }

    public destroy(): void {
        // this is needed as GridAPI is a bean, and GridAPI.destroy() is called as part
        // of context.destroy(). so we need to stop the infinite loop.
        if (this.destroyCalled) { return; }
        this.destroyCalled = true;

        // destroy the UI first (as they use the services)
        this.gridCompController.destroyGridUi();

        // destroy the services
        this.context.destroy();
    }

    @PreDestroy
    private cleanDownReferencesToAvoidMemoryLeakInCaseApplicationIsKeepingReferenceToDestroyedGrid(): void {
        // some users were raising support issues with regards memory leaks. the problem was the customers applications
        // were keeping references to the API. trying to educate them all would be difficult, easier to just remove
        // all references in teh API so at least the core grid can be garbage collected.
        //
        // wait about 100ms before clearing down the references, in case user has some cleanup to do,
        // and needs to deference the API first
        setTimeout(removeAllReferences.bind(window, this, 'Grid API'), 100);
    }

    private warnIfDestroyed(methodName: string): boolean {
        if (this.destroyCalled) {
            console.warn(`AG Grid: Grid API method ${methodName} was called on a grid that was destroyed.`);
        }
        return this.destroyCalled;
    }

    public resetQuickFilter(): void {
        if (this.warnIfDestroyed('resetQuickFilter')) { return; }
        this.rowModel.forEachNode(node => node.quickFilterAggregateText = null);
    }

    public getRangeSelections(): any {
        console.warn(`AG Grid: in v20.1.x, api.getRangeSelections() is gone, please use getCellRanges() instead.
        We had to change how cell selections works a small bit to allow charting to integrate. The return type of
        getCellRanges() is a bit different, please check the AG Grid documentation.`);
        return null;
    }

    public getCellRanges(): CellRange[] | null {
        if (this.rangeService) {
            return this.rangeService.getCellRanges();
        }

        console.warn('AG Grid: cell range selection is only available in AG Grid Enterprise');
        return null;
    }

    public camelCaseToHumanReadable(camelCase: string): string | null {
        return camelCaseToHumanText(camelCase);
    }

    public addRangeSelection(deprecatedNoLongerUsed: any): void {
        console.warn('AG Grid: As of version 21.x, range selection changed slightly to allow charting integration. Please call api.addCellRange() instead of api.addRangeSelection()');
    }

    public addCellRange(params: CellRangeParams): void {
        if (!this.rangeService) { console.warn('AG Grid: cell range selection is only available in AG Grid Enterprise'); }
        this.rangeService.addCellRange(params);
    }

    public clearRangeSelection(): void {
        if (!this.rangeService) { console.warn('AG Grid: cell range selection is only available in AG Grid Enterprise'); }
        this.rangeService.removeAllCellRanges();
    }

    public undoCellEditing(): void {
        this.undoRedoService.undo();
    }

    public redoCellEditing(): void {
        this.undoRedoService.redo();
    }

    public getCurrentUndoSize(): number {
        return this.undoRedoService.getCurrentUndoStackSize();
    }

    public getCurrentRedoSize(): number {
        return this.undoRedoService.getCurrentRedoStackSize();
    }

    public getChartModels(): ChartModel[] | undefined {
        if (ModuleRegistry.assertRegistered(ModuleNames.RangeSelectionModule, 'api.getChartModels') &&
            ModuleRegistry.assertRegistered(ModuleNames.GridChartsModule, 'api.getChartModels')) {
            return this.chartService.getChartModels();
        }
    }

    public createRangeChart(params: CreateRangeChartParams): ChartRef | undefined {
        if (ModuleRegistry.assertRegistered(ModuleNames.RangeSelectionModule, 'api.createRangeChart') &&
            ModuleRegistry.assertRegistered(ModuleNames.GridChartsModule, 'api.createRangeChart')) {
            return this.chartService.createRangeChart(params);
        }
    }

    public createCrossFilterChart(params: CreateRangeChartParams): ChartRef | undefined {
        if (ModuleRegistry.assertRegistered(ModuleNames.RangeSelectionModule, 'api.createCrossFilterChart') &&
            ModuleRegistry.assertRegistered(ModuleNames.GridChartsModule, 'api.createCrossFilterChart')) {
            return this.chartService.createCrossFilterChart(params);
        }
    }

    public restoreChart(chartModel: ChartModel, chartContainer?: HTMLElement): ChartRef | undefined {
        if (ModuleRegistry.assertRegistered(ModuleNames.RangeSelectionModule, 'api.restoreChart') &&
            ModuleRegistry.assertRegistered(ModuleNames.GridChartsModule, 'api.restoreChart')) {
            return this.chartService.restoreChart(chartModel, chartContainer);
        }
    }

    public createPivotChart(params: CreatePivotChartParams): ChartRef | undefined {
        if (ModuleRegistry.assertRegistered(ModuleNames.RangeSelectionModule, 'api.createPivotChart') &&
            ModuleRegistry.assertRegistered(ModuleNames.GridChartsModule, 'api.createPivotChart')) {
            return this.chartService.createPivotChart(params);
        }
    }

    public copySelectedRowsToClipboard(includeHeader: boolean, columnKeys?: (string | Column)[]): void {
        if (!this.clipboardService) { console.warn('AG Grid: clipboard is only available in AG Grid Enterprise'); }
        this.clipboardService.copySelectedRowsToClipboard(includeHeader, columnKeys);
    }

    public copySelectedRangeToClipboard(includeHeader: boolean): void {
        if (!this.clipboardService) { console.warn('AG Grid: clipboard is only available in AG Grid Enterprise'); }
        this.clipboardService.copySelectedRangeToClipboard(includeHeader);
    }

    public copySelectedRangeDown(): void {
        if (!this.clipboardService) { console.warn('AG Grid: clipboard is only available in AG Grid Enterprise'); }
        this.clipboardService.copyRangeDown();
    }

    public showColumnMenuAfterButtonClick(colKey: string | Column, buttonElement: HTMLElement): void {
        // use grid column so works with pivot mode
        const column = this.columnModel.getGridColumn(colKey);
        this.menuFactory.showMenuAfterButtonClick(column, buttonElement);
    }

    public showColumnMenuAfterMouseClick(colKey: string | Column, mouseEvent: MouseEvent | Touch): void {
        // use grid column so works with pivot mode
        let column = this.columnModel.getGridColumn(colKey);

        if (!column) {
            column = this.columnModel.getPrimaryColumn(colKey);
        }

        if (!column) {
            console.error(`AG Grid: column '${colKey}' not found`);
            return;
        }

        this.menuFactory.showMenuAfterMouseEvent(column, mouseEvent);
    }

    public hidePopupMenu(): void {
        // hide the context menu if in enterprise
        if (this.contextMenuFactory) {
            this.contextMenuFactory.hideActiveMenu();
        }
        // and hide the column menu always
        this.menuFactory.hideActiveMenu();
    }

    public setPopupParent(ePopupParent: HTMLElement): void {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_POPUP_PARENT, ePopupParent);
    }

    public tabToNextCell(): boolean {
        return this.rowRenderer.tabToNextCell(false);
    }

    public tabToPreviousCell(): boolean {
        return this.rowRenderer.tabToNextCell(true);
    }

    public getCellRendererInstances(params: GetCellRendererInstancesParams = {}): ICellRendererComp[] {
        return this.rowRenderer.getCellRendererInstances(params);
    }

    public getCellEditorInstances(params: GetCellEditorInstancesParams = {}): ICellEditorComp[] {
        return this.rowRenderer.getCellEditorInstances(params);
    }

    public getEditingCells(): CellPosition[] {
        return this.rowRenderer.getEditingCells();
    }

    public stopEditing(cancel: boolean = false): void {
        this.rowRenderer.stopEditing(cancel);
    }

    public startEditingCell(params: StartEditingCellParams): void {
        const column = this.columnModel.getGridColumn(params.colKey);
        if (!column) {
            console.warn(`AG Grid: no column found for ${params.colKey}`);
            return;
        }
        const cellPosition: CellPosition = {
            rowIndex: params.rowIndex,
            rowPinned: params.rowPinned || null,
            column: column
        };
        const notPinned = missing(params.rowPinned);
        if (notPinned) {
            this.gridBodyCon.getScrollFeature().ensureIndexVisible(params.rowIndex);
        }
        this.rowRenderer.startEditingCell(cellPosition, params.keyPress, params.charPress);
    }

    public addAggFunc(key: string, aggFunc: IAggFunc): void {
        if (this.aggFuncService) {
            this.aggFuncService.addAggFunc(key, aggFunc);
        }
    }

    public addAggFuncs(aggFuncs: { [key: string]: IAggFunc; }): void {
        if (this.aggFuncService) {
            this.aggFuncService.addAggFuncs(aggFuncs);
        }
    }

    public clearAggFuncs(): void {
        if (this.aggFuncService) {
            this.aggFuncService.clear();
        }
    }

    public applyServerSideTransaction(transaction: ServerSideTransaction): ServerSideTransactionResult | undefined {
        if (!this.serverSideTransactionManager) {
            console.warn('AG Grid: Cannot apply Server Side Transaction if not using the Server Side Row Model.');
            return;
        }
        return this.serverSideTransactionManager.applyTransaction(transaction);
    }

    public applyServerSideTransactionAsync(transaction: ServerSideTransaction, callback?: (res: ServerSideTransactionResult) => void): void {
        if (!this.serverSideTransactionManager) {
            console.warn('AG Grid: Cannot apply Server Side Transaction if not using the Server Side Row Model.');
            return;
        }
        return this.serverSideTransactionManager.applyTransactionAsync(transaction, callback);
    }

    public retryServerSideLoads(): void {
        if (!this.serverSideRowModel) {
            console.warn('AG Grid: API retryServerSideLoads() can only be used when using Server-Side Row Model.');
            return;
        }
        this.serverSideRowModel.retryLoads();
    }

    public flushServerSideAsyncTransactions(): void {
        if (!this.serverSideTransactionManager) {
            console.warn('AG Grid: Cannot flush Server Side Transaction if not using the Server Side Row Model.');
            return;
        }
        return this.serverSideTransactionManager.flushAsyncTransactions();
    }

    public applyTransaction(rowDataTransaction: RowDataTransaction): RowNodeTransaction | null | undefined {
        if (!this.clientSideRowModel) {
            console.error('AG Grid: updateRowData() only works with ClientSideRowModel. Working with InfiniteRowModel was deprecated in v23.1 and removed in v24.1');
            return;
        }

        const res: RowNodeTransaction | null = this.clientSideRowModel.updateRowData(rowDataTransaction);

        // refresh all the full width rows
        this.rowRenderer.refreshFullWidthRows(res!.update);

        // do change detection for all present cells
        if (!this.gridOptionsWrapper.isSuppressChangeDetection()) {
            this.rowRenderer.refreshCells();
        }

        return res;
    }

    /** @deprecated */
    public updateRowData(rowDataTransaction: RowDataTransaction): RowNodeTransaction | null | undefined {
        const message = 'AG Grid: as of v23.1, grid API updateRowData(transaction) is now called applyTransaction(transaction). updateRowData is deprecated and will be removed in a future major release.';
        doOnce(() => console.warn(message), 'updateRowData deprecated');

        return this.applyTransaction(rowDataTransaction);
    }

    public applyTransactionAsync(rowDataTransaction: RowDataTransaction, callback?: (res: RowNodeTransaction) => void): void {
        if (!this.clientSideRowModel) {
            console.error('AG Grid: api.applyTransactionAsync() only works with ClientSideRowModel.');
            return;
        }
        this.clientSideRowModel.batchUpdateRowData(rowDataTransaction, callback);
    }

    public flushAsyncTransactions(): void {
        if (!this.clientSideRowModel) {
            console.error('AG Grid: api.applyTransactionAsync() only works with ClientSideRowModel.');
            return;
        }
        this.clientSideRowModel.flushAsyncTransactions();
    }

    /** @deprecated */
    public batchUpdateRowData(rowDataTransaction: RowDataTransaction, callback?: (res: RowNodeTransaction) => void): void {
        const message = 'AG Grid: as of v23.1, grid API batchUpdateRowData(transaction, callback) is now called applyTransactionAsync(transaction, callback). batchUpdateRowData is deprecated and will be removed in a future major release.';
        doOnce(() => console.warn(message), 'batchUpdateRowData deprecated');

        this.applyTransactionAsync(rowDataTransaction, callback);
    }

    public insertItemsAtIndex(index: number, items: any[], skipRefresh = false): void {
        console.warn('AG Grid: insertItemsAtIndex() is deprecated, use updateRowData(transaction) instead.');
        this.updateRowData({ add: items, addIndex: index, update: null, remove: null });
    }

    public removeItems(rowNodes: RowNode[], skipRefresh = false): void {
        console.warn('AG Grid: removeItems() is deprecated, use updateRowData(transaction) instead.');
        const dataToRemove: any[] = rowNodes.map(rowNode => rowNode.data);
        this.updateRowData({ add: null, addIndex: null, update: null, remove: dataToRemove });
    }

    public addItems(items: any[], skipRefresh = false): void {
        console.warn('AG Grid: addItems() is deprecated, use updateRowData(transaction) instead.');
        this.updateRowData({ add: items, addIndex: null, update: null, remove: null });
    }

    public refreshVirtualPageCache(): void {
        console.warn('AG Grid: refreshVirtualPageCache() is now called refreshInfiniteCache(), please call refreshInfiniteCache() instead');
        this.refreshInfiniteCache();
    }

    public refreshInfinitePageCache(): void {
        console.warn('AG Grid: refreshInfinitePageCache() is now called refreshInfiniteCache(), please call refreshInfiniteCache() instead');
        this.refreshInfiniteCache();
    }

    public refreshInfiniteCache(): void {
        if (this.infiniteRowModel) {
            this.infiniteRowModel.refreshCache();
        } else {
            console.warn(`AG Grid: api.refreshInfiniteCache is only available when rowModelType='infinite'.`);
        }
    }

    public purgeVirtualPageCache(): void {
        console.warn('AG Grid: purgeVirtualPageCache() is now called purgeInfiniteCache(), please call purgeInfiniteCache() instead');
        this.purgeInfinitePageCache();
    }

    public purgeInfinitePageCache(): void {
        console.warn('AG Grid: purgeInfinitePageCache() is now called purgeInfiniteCache(), please call purgeInfiniteCache() instead');
        this.purgeInfiniteCache();
    }

    public purgeInfiniteCache(): void {
        if (this.infiniteRowModel) {
            this.infiniteRowModel.purgeCache();
        } else {
            console.warn(`AG Grid: api.purgeInfiniteCache is only available when rowModelType='infinite'.`);
        }
    }

    /** @deprecated */
    public purgeEnterpriseCache(route?: string[]): void {
        console.warn(`ag-grid: since version 18.x, api.purgeEnterpriseCache() should be replaced with api.purgeServerSideCache()`);
        this.purgeServerSideCache(route);
    }

    /** @deprecated */
    public purgeServerSideCache(route: string[] = []): void {
        if (this.serverSideRowModel) {
            console.warn(`AG Grid: since v25.0, api.purgeServerSideCache is deprecated. Please use api.refreshServerSideStore({purge: true}) instead.`);
            this.refreshServerSideStore({
                route: route,
                purge: true
            });
        } else {
            console.warn(`AG Grid: api.purgeServerSideCache is only available when rowModelType='serverSide'.`);
        }
    }

    public refreshServerSideStore(params: RefreshStoreParams): void {
        if (this.serverSideRowModel) {
            this.serverSideRowModel.refreshStore(params);
        } else {
            console.warn(`AG Grid: api.refreshServerSideStore is only available when rowModelType='serverSide'.`);
        }
    }

    public getServerSideStoreState(): ServerSideStoreState[] {
        if (this.serverSideRowModel) {
            return this.serverSideRowModel.getStoreState();
        } else {
            console.warn(`AG Grid: api.getServerSideStoreState is only available when rowModelType='serverSide'.`);
            return [];
        }
    }

    public getVirtualRowCount(): number | null | undefined {
        console.warn('AG Grid: getVirtualRowCount() is now called getInfiniteRowCount(), please call getInfiniteRowCount() instead');
        return this.getInfiniteRowCount();
    }

    public getInfiniteRowCount(): number | undefined {
        if (this.infiniteRowModel) {
            return this.infiniteRowModel.getRowCount();
        } else {
            console.warn(`AG Grid: api.getVirtualRowCount is only available when rowModelType='virtual'.`);
        }
    }

    public isMaxRowFound(): boolean | undefined {
        console.warn(`AG Grid: api.isLastRowIndexKnown is deprecated, please use api.isLastRowIndexKnown()`);
        return this.isLastRowIndexKnown();
    }

    public isLastRowIndexKnown(): boolean | undefined {
        if (this.infiniteRowModel) {
            return this.infiniteRowModel.isLastRowIndexKnown();
        } else {
            console.warn(`AG Grid: api.isMaxRowFound is only available when rowModelType='virtual'.`);
        }
    }

    public setVirtualRowCount(rowCount: number, maxRowFound?: boolean): void {
        console.warn('AG Grid: setVirtualRowCount() is now called setInfiniteRowCount(), please call setInfiniteRowCount() instead');
        this.setRowCount(rowCount, maxRowFound);
    }

    public setInfiniteRowCount(rowCount: number, maxRowFound?: boolean): void {
        console.warn('AG Grid: setInfiniteRowCount() is now called setRowCount(), please call setRowCount() instead');
        this.setRowCount(rowCount, maxRowFound);
    }

    public setRowCount(rowCount: number, maxRowFound?: boolean): void {
        if (this.infiniteRowModel) {
            this.infiniteRowModel.setRowCount(rowCount, maxRowFound);
        } else {
            console.warn(`AG Grid: api.setRowCount is only available for Infinite Row Model.`);
        }
    }

    public getVirtualPageState(): any {
        console.warn('AG Grid: getVirtualPageState() is now called getCacheBlockState(), please call getCacheBlockState() instead');
        return this.getCacheBlockState();
    }

    public getInfinitePageState(): any {
        console.warn('AG Grid: getInfinitePageState() is now called getCacheBlockState(), please call getCacheBlockState() instead');
        return this.getCacheBlockState();
    }

    public getCacheBlockState(): any {
        return this.rowNodeBlockLoader.getBlockState();
    }

    public checkGridSize(): void {
        console.warn(`in AG Grid v25.2.0, checkGridSize() was removed, as it was legacy and didn't do anything uesful.`);
    }

    public getFirstRenderedRow(): number {
        console.warn('in AG Grid v12, getFirstRenderedRow() was renamed to getFirstDisplayedRow()');
        return this.getFirstDisplayedRow();
    }

    public getFirstDisplayedRow(): number {
        return this.rowRenderer.getFirstVirtualRenderedRow();
    }

    public getLastRenderedRow(): number {
        console.warn('in AG Grid v12, getLastRenderedRow() was renamed to getLastDisplayedRow()');
        return this.getLastDisplayedRow();
    }

    public getLastDisplayedRow(): number {
        return this.rowRenderer.getLastVirtualRenderedRow();
    }

    public getDisplayedRowAtIndex(index: number): RowNode | null {
        return this.rowModel.getRow(index);
    }

    public getDisplayedRowCount(): number {
        return this.rowModel.getRowCount();
    }

    public paginationIsLastPageFound(): boolean {
        return this.paginationProxy.isLastPageFound();
    }

    public paginationGetPageSize(): number {
        return this.paginationProxy.getPageSize();
    }

    public paginationSetPageSize(size?: number): void {
        this.gridOptionsWrapper.setProperty('paginationPageSize', size);
    }

    public paginationGetCurrentPage(): number {
        return this.paginationProxy.getCurrentPage();
    }

    public paginationGetTotalPages(): number {
        return this.paginationProxy.getTotalPages();
    }

    public paginationGetRowCount(): number {
        return this.paginationProxy.getMasterRowCount();
    }

    public paginationGoToNextPage(): void {
        this.paginationProxy.goToNextPage();
    }

    public paginationGoToPreviousPage(): void {
        this.paginationProxy.goToPreviousPage();
    }

    public paginationGoToFirstPage(): void {
        this.paginationProxy.goToFirstPage();
    }

    public paginationGoToLastPage(): void {
        this.paginationProxy.goToLastPage();
    }

    public paginationGoToPage(page: number): void {
        this.paginationProxy.goToPage(page);
    }
}
