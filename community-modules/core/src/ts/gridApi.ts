import { AlignedGridsService } from "./alignedGridsService";
import { ColumnApi } from "./columns/columnApi";
import { ColumnModel } from "./columns/columnModel";
import { FrameworkComponentWrapper } from "./components/framework/frameworkComponentWrapper";
import { Constants } from "./constants/constants";
import { Autowired, Bean, Context, Optional, PostConstruct, PreDestroy } from "./context/context";
import { CtrlsService } from "./ctrlsService";
import { DragAndDropService } from "./dragAndDrop/dragAndDropService";
import { CellPosition } from "./entities/cellPosition";
import { ColDef, ColGroupDef, IAggFunc } from "./entities/colDef";
import { Column } from "./entities/column";
import {
    ChartRef,
    GetChartToolbarItems,
    GetContextMenuItems,
    GetMainMenuItems,
    GetRowIdFunc,
    GetRowNodeIdFunc,
    GetServerSideGroupKey,
    IsApplyServerSideTransaction,
    IsRowMaster,
    IsRowSelectable,
    IsServerSideGroup,
    RowClassParams,
    ServerSideGroupLevelParams,
} from "./entities/gridOptions";
import {
    GetGroupRowAggParams,
    GetServerSideGroupLevelParamsParams,
    InitialGroupOrderComparatorParams,
    IsServerSideGroupOpenByDefaultParams,
    NavigateToNextCellParams,
    NavigateToNextHeaderParams,
    PaginationNumberFormatterParams,
    PostProcessPopupParams,
    PostSortRowsParams,
    ProcessRowParams,
    RowHeightParams,
    TabToNextCellParams,
    TabToNextHeaderParams
} from "./entities/iCallbackParams";
import { RowNode } from "./entities/rowNode";
import { SideBarDef, SideBarDefParser } from "./entities/sideBar";
import { AgEvent, ColumnEventType } from "./events";
import { EventService } from "./eventService";
import { FilterManager } from "./filter/filterManager";
import { FocusService } from "./focusService";
import { GridBodyCtrl } from "./gridBodyComp/gridBodyCtrl";
import { NavigationService } from "./gridBodyComp/navigationService";
import { RowDropZoneEvents, RowDropZoneParams } from "./gridBodyComp/rowDragFeature";
import { GridOptionsWrapper } from "./gridOptionsWrapper";
import { HeaderPosition } from "./headerRendering/common/headerPosition";
import { CsvExportParams, ProcessCellForExportParams } from "./interfaces/exportParams";
import { AgChartThemeOverrides, AgChartThemePalette } from "./interfaces/iAgChartOptions";
import { IAggFuncService } from "./interfaces/iAggFuncService";
import { ICellEditor } from "./interfaces/iCellEditor";
import { ChartType, CrossFilterChartType, SeriesChartType } from "./interfaces/iChartOptions";
import { ChartModel, GetChartImageDataUrlParams, IChartService } from "./interfaces/IChartService";
import { ClientSideRowModelSteps, IClientSideRowModel, RefreshModelParams } from "./interfaces/iClientSideRowModel";
import { IClipboardCopyParams, IClipboardCopyRowsParams, IClipboardService } from "./interfaces/iClipboardService";
import { IContextMenuFactory } from "./interfaces/iContextMenuFactory";
import { ICsvCreator } from "./interfaces/iCsvCreator";
import { IDatasource } from "./interfaces/iDatasource";
import {
    ExcelExportMultipleSheetParams,
    ExcelExportParams,
    ExcelFactoryMode,
    IExcelCreator
} from "./interfaces/iExcelCreator";
import { IFilter, IFilterComp } from "./interfaces/iFilter";
import { IImmutableService } from "./interfaces/iImmutableService";
import { IInfiniteRowModel } from "./interfaces/iInfiniteRowModel";
import { IMenuFactory } from "./interfaces/iMenuFactory";
import { CellRange, CellRangeParams, IRangeService } from "./interfaces/IRangeService";
import { IRowModel } from "./interfaces/iRowModel";
import { IServerSideDatasource } from "./interfaces/iServerSideDatasource";
import {
    IServerSideRowModel,
    IServerSideTransactionManager,
    RefreshServerSideParams
} from "./interfaces/iServerSideRowModel";
import { ServerSideGroupLevelState } from "./interfaces/IServerSideStore";
import { ISideBar } from "./interfaces/iSideBar";
import { IStatusBarService } from "./interfaces/iStatusBarService";
import { IStatusPanel } from "./interfaces/iStatusPanel";
import { IToolPanel } from "./interfaces/iToolPanel";
import { IViewportDatasource } from "./interfaces/iViewportDatasource";
import { RowDataTransaction } from "./interfaces/rowDataTransaction";
import { RowNodeTransaction } from "./interfaces/rowNodeTransaction";
import { ServerSideTransaction, ServerSideTransactionResult } from "./interfaces/serverSideTransaction";
import { AnimationFrameService } from "./misc/animationFrameService";
import { ModuleNames } from "./modules/moduleNames";
import { ModuleRegistry } from "./modules/moduleRegistry";
import { PaginationProxy } from "./pagination/paginationProxy";
import { PinnedRowModel } from "./pinnedRowModel/pinnedRowModel";
import { ICellRenderer } from "./rendering/cellRenderers/iCellRenderer";
import { OverlayWrapperComponent } from "./rendering/overlays/overlayWrapperComponent";
import { RowRenderer } from "./rendering/rowRenderer";
import { RowNodeBlockLoader } from "./rowNodeCache/rowNodeBlockLoader";
import { SelectionService } from "./selectionService";
import { SortController } from "./sortController";
import { UndoRedoService } from "./undoRedo/undoRedoService";
import { _ } from "./utils";
import { doOnce } from "./utils/function";
import { message } from "./utils/general";
import { exists, missing } from "./utils/generic";
import { iterateObject, removeAllReferences } from "./utils/object";
import { camelCaseToHumanText } from "./utils/string";
import { ValueCache } from "./valueService/valueCache";
import { ValueService } from "./valueService/valueService";

export interface StartEditingCellParams {
    /** The row index of the row to start editing */
    rowIndex: number;
    /** The column key of the row to start editing */
    colKey: string | Column;
    /** Set to `'top'` or `'bottom'` to start editing a pinned row */
    rowPinned?: string;
    /** The key to pass to the cell editor */
    key?: string;
    /** The charPress to pass to the cell editor */
    charPress?: string;
}

export interface GetCellsParams {
    /** Optional list of row nodes to restrict operation to */
    rowNodes?: RowNode[];
    /** Optional list of columns to restrict operation to */
    columns?: (string | Column)[];
}

export interface RefreshCellsParams extends GetCellsParams {
    /** Skip change detection, refresh everything. */
    force?: boolean;
    /** Skip cell flashing, if cell flashing is enabled. */
    suppressFlash?: boolean;
}

export interface FlashCellsParams extends GetCellsParams {
    flashDelay?: number;
    fadeDelay?: number;
}

export interface GetCellRendererInstancesParams extends GetCellsParams { }

export interface GetCellEditorInstancesParams extends GetCellsParams { }

export interface RedrawRowsParams {
    /** Row nodes to redraw */
    rowNodes?: RowNode[];
}

interface CreateChartParams {
    /** The type of chart to create. */
    chartType: ChartType;
    /** The default theme to use, either a default option or your own custom theme. */
    chartThemeName?: string;
    /** Provide to display the chart outside of the grid in your own container. */
    chartContainer?: HTMLElement;
    /** Allows specific chart options in the current theme to be overridden. */
    chartThemeOverrides?: AgChartThemeOverrides;
    /** When enabled the chart will be unlinked from the grid after creation, any updates to the data will not be reflected in the chart. */
    unlinkChart?: boolean;
}

export type ChartParamsCellRange = Partial<Omit<CellRangeParams, 'rowStartPinned' | 'rowEndPinned'>>;
export interface CreateRangeChartParams extends CreateChartParams {
    /** The range of cells to be charted. If no rows / rowIndexes are specified all rows will be included. */
    cellRange: ChartParamsCellRange;
    /** Suppress highlighting the selected range in the grid. */
    suppressChartRanges?: boolean;
    /** The aggregation function that should be applied to all series data. */
    aggFunc?: string | IAggFunc;
    /** The series chart type configurations used in combination charts */
    seriesChartTypes?: SeriesChartType[];
}
export interface CreateCrossFilterChartParams extends CreateChartParams {
    /** The type of cross-filter chart to create. */
    chartType: CrossFilterChartType;
    /** The range of cells to be charted. If no rows / rowIndexes are specified all rows will be included. */
    cellRange: ChartParamsCellRange;
    /** Suppress highlighting the selected range in the grid. */
    suppressChartRanges?: boolean;
    /** The aggregation function that should be applied to all series data. */
    aggFunc?: string | IAggFunc;
}

export interface CreatePivotChartParams extends CreateChartParams { }

export interface DetailGridInfo {
    /**
     * Id of the detail grid, the format is `detail_<ROW_ID>`,
     * where ROW_ID is the `id` of the parent row.
     */
    id: string;
    /** Grid api of the detail grid. */
    api?: GridApi;
    /** Column api of the detail grid. */
    columnApi?: ColumnApi;
}

export function unwrapUserComp<T>(comp: T): T {
    const compAsAny = comp as any;
    const isProxy = compAsAny != null && compAsAny.getFrameworkComponentInstance != null;
    return isProxy ? compAsAny.getFrameworkComponentInstance() : comp;
}

@Bean('gridApi')
export class GridApi {

    @Optional('immutableService') private immutableService: IImmutableService;
    @Optional('csvCreator') private csvCreator: ICsvCreator;
    @Optional('excelCreator') private excelCreator: IExcelCreator;
    @Autowired('rowRenderer') private rowRenderer: RowRenderer;
    @Autowired('navigationService') private navigationService: NavigationService;
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
    @Optional('rowNodeBlockLoader') private rowNodeBlockLoader: RowNodeBlockLoader;
    @Optional('ssrmTransactionManager') private serverSideTransactionManager: IServerSideTransactionManager;
    @Autowired('ctrlsService') private ctrlsService: CtrlsService;
    @Optional('frameworkComponentWrapper') private frameworkComponentWrapper: FrameworkComponentWrapper;

    private overlayWrapperComp: OverlayWrapperComponent;

    private gridBodyCtrl: GridBodyCtrl;
    private sideBarComp: ISideBar;

    private clientSideRowModel: IClientSideRowModel;
    private infiniteRowModel: IInfiniteRowModel;

    private serverSideRowModel: IServerSideRowModel;

    private detailGridInfoMap: { [id: string]: DetailGridInfo | undefined; } = {};

    private destroyCalled = false;

    public registerOverlayWrapperComp(overlayWrapperComp: OverlayWrapperComponent): void {
        this.overlayWrapperComp = overlayWrapperComp;
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

        this.ctrlsService.whenReady(() => {
            this.gridBodyCtrl = this.ctrlsService.getGridBodyCtrl();
        });
    }

    /** Used internally by grid. Not intended to be used by the client. Interface may change between releases. */
    public __getAlignedGridService(): AlignedGridsService {
        return this.alignedGridsService;
    }

    /** Used internally by grid. Not intended to be used by the client. Interface may change between releases. */
    public __getContext(): Context {
        return this.context;
    }

    /** Register a detail grid with the master grid when it is created. */
    public addDetailGridInfo(id: string, gridInfo: DetailGridInfo): void {
        this.detailGridInfoMap[id] = gridInfo;
    }

    /** Unregister a detail grid from the master grid when it is destroyed. */
    public removeDetailGridInfo(id: string): void {
        this.detailGridInfoMap[id] = undefined;
    }

    /** Returns the `DetailGridInfo` corresponding to the supplied `detailGridId`. */
    public getDetailGridInfo(id: string): DetailGridInfo | undefined {
        return this.detailGridInfoMap[id];
    }

    /** Iterates through each `DetailGridInfo` in the grid and calls the supplied callback on each. */
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

    /** Similar to `exportDataAsCsv`, except returns the result as a string rather than download it. */
    public getDataAsCsv(params?: CsvExportParams): string | undefined {
        if (ModuleRegistry.assertRegistered(ModuleNames.CsvExportModule, 'api.getDataAsCsv')) {
            return this.csvCreator.getDataAsCsv(params);
        }
    }

    /** Downloads a CSV export of the grid's data. */
    public exportDataAsCsv(params?: CsvExportParams): void {
        if (ModuleRegistry.assertRegistered(ModuleNames.CsvExportModule, 'api.exportDataAsCSv')) {
            this.csvCreator.exportDataAsCsv(params);
        }
    }

    private getExcelExportMode(params?: ExcelExportParams): 'xlsx' | 'xml' {
        const baseParams = this.gridOptionsWrapper.getDefaultExportParams('excel');
        const mergedParams = Object.assign({ exportMode: 'xlsx' }, baseParams, params);
        return mergedParams.exportMode;
    }

    /** Similar to `exportDataAsExcel`, except instead of downloading a file, it will return a [Blob](https://developer.mozilla.org/en-US/docs/Web/API/Blob) to be processed by the user. */
    public getDataAsExcel(params?: ExcelExportParams): string | Blob | undefined {
        if (!ModuleRegistry.assertRegistered(ModuleNames.ExcelExportModule, 'api.getDataAsExcel')) { return; }
        const exportMode = this.getExcelExportMode(params);
        if (this.excelCreator.getFactoryMode(exportMode) === ExcelFactoryMode.MULTI_SHEET) {
            console.warn('AG Grid: The Excel Exporter is currently on Multi Sheet mode. End that operation by calling `api.getMultipleSheetAsExcel()` or `api.exportMultipleSheetsAsExcel()`');
            return;
        }
        return this.excelCreator.getDataAsExcel(params);
    }

    /** Downloads an Excel export of the grid's data. */
    public exportDataAsExcel(params?: ExcelExportParams): void {
        if (!ModuleRegistry.assertRegistered(ModuleNames.ExcelExportModule, 'api.exportDataAsExcel')) { return; }
        const exportMode = this.getExcelExportMode(params);
        if (this.excelCreator.getFactoryMode(exportMode) === ExcelFactoryMode.MULTI_SHEET) {
            console.warn('AG Grid: The Excel Exporter is currently on Multi Sheet mode. End that operation by calling `api.getMultipleSheetAsExcel()` or `api.exportMultipleSheetsAsExcel()`');
            return;
        }
        this.excelCreator.exportDataAsExcel(params);
    }

    /** This is method to be used to get the grid's data as a sheet, that will later be exported either by `getMultipleSheetsAsExcel()` or `exportMultipleSheetsAsExcel()`. */
    public getSheetDataForExcel(params?: ExcelExportParams): string | undefined {
        if (!ModuleRegistry.assertRegistered(ModuleNames.ExcelExportModule, 'api.getSheetDataForExcel')) { return; }
        const exportMode = this.getExcelExportMode(params);
        this.excelCreator.setFactoryMode(ExcelFactoryMode.MULTI_SHEET, exportMode);

        return this.excelCreator.getSheetDataForExcel(params);
    }

    /** Similar to `exportMultipleSheetsAsExcel`, except instead of downloading a file, it will return a [Blob](https://developer.mozilla.org/en-US/docs/Web/API/Blob) to be processed by the user. */
    public getMultipleSheetsAsExcel(params: ExcelExportMultipleSheetParams): Blob | undefined {
        if (ModuleRegistry.assertRegistered(ModuleNames.ExcelExportModule, 'api.getMultipleSheetsAsExcel')) {
            return this.excelCreator.getMultipleSheetsAsExcel(params);
        }
    }

    /** Downloads an Excel export of multiple sheets in one file. */
    public exportMultipleSheetsAsExcel(params: ExcelExportMultipleSheetParams): void {
        if (ModuleRegistry.assertRegistered(ModuleNames.ExcelExportModule, 'api.exportMultipleSheetsAsExcel')) {
            return this.excelCreator.exportMultipleSheetsAsExcel(params);
        }
    }

    /** @deprecated */
    public setEnterpriseDatasource(datasource: IServerSideDatasource) {
        console.warn(`AG Grid: since version 18.x, api.setEnterpriseDatasource() should be replaced with api.setServerSideDatasource()`);
        this.setServerSideDatasource(datasource);
    }

    /**
     * Sets an ARIA property in the grid panel (element with `role=\"grid\"`), and removes an ARIA property when the value is null.
     *
     * Example: `api.setGridAriaProperty('label', 'my grid')` will set `aria-label=\"my grid\"`.
     *
     * `api.setGridAriaProperty('label', null)` will remove the `aria-label` attribute from the grid element.
     */
    public setGridAriaProperty(property: string, value: string | null): void {
        if (!property) { return; }
        const eGrid = this.ctrlsService.getGridBodyCtrl().getGui();
        const ariaProperty = `aria-${property}`;

        if (value === null) {
            eGrid.removeAttribute(ariaProperty);
        } else {
            eGrid.setAttribute(ariaProperty, value);
        }

    }

    /** Set new datasource for Server-Side Row Model. */
    public setServerSideDatasource(datasource: IServerSideDatasource) {
        if (this.serverSideRowModel) {
            // should really have an IEnterpriseRowModel interface, so we are not casting to any
            this.serverSideRowModel.setDatasource(datasource);
        } else {
            console.warn(`AG Grid: you can only use an enterprise datasource when gridOptions.rowModelType is '${Constants.ROW_MODEL_TYPE_SERVER_SIDE}'`);
        }
    }

    /** Set new datasource for Infinite Row Model. */
    public setDatasource(datasource: IDatasource) {
        if (this.gridOptionsWrapper.isRowModelInfinite()) {
            (this.rowModel as IInfiniteRowModel).setDatasource(datasource);
        } else {
            console.warn(`AG Grid: you can only use a datasource when gridOptions.rowModelType is '${Constants.ROW_MODEL_TYPE_INFINITE}'`);
        }
    }

    /** Set new datasource for Viewport Row Model. */
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

    /** Set the row data. */
    public setRowData(rowData: any[]) {
        // immutable service is part of the CSRM module, if missing, no CSRM
        const missingImmutableService = this.immutableService == null;

        if (missingImmutableService) {
            console.warn('AG Grid: you can only set rowData when using the Client Side Row Model');
            return;
        }

        // if no keys provided provided for rows, then we can tread the operation as Immutable
        if (this.immutableService.isActive()) {
            this.immutableService.setRowData(rowData);
        } else {
            this.selectionService.reset();
            this.clientSideRowModel.setRowData(rowData);
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
    public getFloatingTopRow(index: number): RowNode | undefined {
        console.warn('AG Grid: since v12, api.getFloatingTopRow() is now api.getPinnedTopRow()');
        return this.getPinnedTopRow(index);
    }

    /** @deprecated */
    public getFloatingBottomRow(index: number): RowNode | undefined {
        console.warn('AG Grid: since v12, api.getFloatingBottomRow() is now api.getPinnedBottomRow()');
        return this.getPinnedBottomRow(index);
    }

    /** Set the top pinned rows. Call with no rows / undefined to clear top pinned rows. */
    public setPinnedTopRowData(rows?: any[]): void {
        this.pinnedRowModel.setPinnedTopRowData(rows);
    }

    /** Set the bottom pinned rows. Call with no rows / undefined to clear bottom pinned rows. */
    public setPinnedBottomRowData(rows?: any[]): void {
        this.pinnedRowModel.setPinnedBottomRowData(rows);
    }

    /** Gets the number of top pinned rows. */
    public getPinnedTopRowCount(): number {
        return this.pinnedRowModel.getPinnedTopRowCount();
    }

    /** Gets the number of bottom pinned rows. */
    public getPinnedBottomRowCount(): number {
        return this.pinnedRowModel.getPinnedBottomRowCount();
    }

    /** Gets the top pinned row with the specified index. */
    public getPinnedTopRow(index: number): RowNode | undefined {
        return this.pinnedRowModel.getPinnedTopRow(index);
    }

    /** Gets the top pinned row with the specified index. */
    public getPinnedBottomRow(index: number): RowNode | undefined {
        return this.pinnedRowModel.getPinnedBottomRow(index);
    }

    /**
     * Call to set new column definitions. The grid will redraw all the column headers, and then redraw all of the rows.
     */
    public setColumnDefs(colDefs: (ColDef | ColGroupDef)[], source: ColumnEventType = "api") {
        this.columnModel.setColumnDefs(colDefs, source);
    }

    /** Call to set new auto group column definition. The grid will recreate any auto-group columns if present. */
    public setAutoGroupColumnDef(colDef: ColDef, source: ColumnEventType = "api") {
        this.gridOptionsWrapper.setProperty('autoGroupColumnDef', colDef, true);
    }

    /** Call to set new Default Column Definition. */
    public setDefaultColDef(colDef: ColDef, source: ColumnEventType = "api") {
        this.gridOptionsWrapper.setProperty('defaultColDef', colDef, true);
    }

    public expireValueCache(): void {
        this.valueCache.expire();
    }

    /**
     * Returns an object with two properties:
     *  - `top`: The top pixel position of the current scroll in the grid
     *  - `bottom`: The bottom pixel position of the current scroll in the grid
     */
    public getVerticalPixelRange(): { top: number, bottom: number; } {
        return this.gridBodyCtrl.getScrollFeature().getVScrollPosition();
    }

    /**
     * Returns an object with two properties:
     * - `left`: The left pixel position of the current scroll in the grid
     * - `right`: The right pixel position of the current scroll in the grid
     */
    public getHorizontalPixelRange(): { left: number, right: number; } {
        return this.gridBodyCtrl.getScrollFeature().getHScrollPosition();
    }

    /** If `true`, the horizontal scrollbar will always be present, even if not required. Otherwise, it will only be displayed when necessary. */
    public setAlwaysShowHorizontalScroll(show: boolean) {
        this.gridOptionsWrapper.setProperty('alwaysShowHorizontalScroll', show);
    }

    /** If `true`, the vertical scrollbar will always be present, even if not required. Otherwise it will only be displayed when necessary. */
    public setAlwaysShowVerticalScroll(show: boolean) {
        this.gridOptionsWrapper.setProperty('alwaysShowVerticalScroll', show);
    }

    /** Force refresh all tool panels by calling their `refresh` method. */
    public refreshToolPanel(): void {
        if (!this.sideBarComp) { return; }
        this.sideBarComp.refresh();
    }

    /** Performs change detection on all cells, refreshing cells where required. */
    public refreshCells(params: RefreshCellsParams = {}): void {
        if (Array.isArray(params)) {
            // the old version of refreshCells() took an array of rowNodes for the first argument
            console.warn('since AG Grid v11.1, refreshCells() now takes parameters, please see the documentation.');
            return;
        }
        this.rowRenderer.refreshCells(params);
    }

    /** Flash rows, columns or individual cells. */
    public flashCells(params: FlashCellsParams = {}): void {
        this.rowRenderer.flashCells(params);
    }

    /** Remove row(s) from the DOM and recreate them again from scratch. */
    public redrawRows(params: RedrawRowsParams = {}): void {
        const rowNodes = params ? params.rowNodes : undefined;
        this.rowRenderer.redrawRows(rowNodes);
    }

    public setFunctionsReadOnly(readOnly: boolean) {
        this.gridOptionsWrapper.setProperty('functionsReadOnly', readOnly);
    }

    /** Redraws the header. Useful if a column name changes, or something else that changes how the column header is displayed. */
    public refreshHeader() {
        this.ctrlsService.getHeaderRowContainerCtrls().forEach(c => c.refresh());
    }

    /** Returns `true` if any filter is set. This includes quick filter, advanced filter or external filter. */
    public isAnyFilterPresent(): boolean {
        return this.filterManager.isAnyFilterPresent();
    }

    /** Returns `true` if any column filter is set, otherwise `false`. */
    public isColumnFilterPresent(): boolean {
        return this.filterManager.isColumnFilterPresent() || this.filterManager.isAggregateFilterPresent();
    }

    /** Returns `true` if the quick filter is set, otherwise `false`. */
    public isQuickFilterPresent(): boolean {
        return this.filterManager.isQuickFilterPresent();
    }

    /**
     * Returns the row model inside the table.
     * From here you can see the original rows, rows after filter has been applied,
     * rows after aggregation has been applied, and the final set of 'to be displayed' rows.
     */
    public getModel(): IRowModel {
        return this.rowModel;
    }

    /** Expand or collapse a specific row node. */
    public setRowNodeExpanded(rowNode: RowNode, expanded: boolean): void {
        if (rowNode) {
            rowNode.setExpanded(expanded);
        }
    }

    /**
     *  If after getting the model, you expand or collapse a group, call this method to inform the grid.
     *  It will work out the final set of 'to be displayed' rows again (i.e. expand or collapse the group visually).
     */
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

    /** Gets the Client-Side Row Model to refresh, executing the grouping, filtering and sorting again. */
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
        const animate = !this.gridOptionsWrapper.isSuppressAnimationFrame();
        const modelParams: RefreshModelParams = {
            step: paramsStep,
            keepRenderedRows: true,
            keepEditingRows: true,
            animate
        };

        this.clientSideRowModel.refreshModel(modelParams);
    }

    /** Returns `true` when there are no more animation frames left to process. */
    public isAnimationFrameQueueEmpty(): boolean {
        return this.animationFrameService.isQueueEmpty();
    }

    public flushAllAnimationFrames(): void {
        this.animationFrameService.flushAllFrames();
    }

    /**
     * Returns the row node with the given ID.
     * The row node ID is the one you provide from the callback `getRowId(params)`,
     * otherwise the ID is a number (cast as string) auto-generated by the grid when
     * the row data is set.
     */
    public getRowNode(id: string): RowNode | undefined {
        return this.rowModel.getRowNode(id);
    }

    /**
     * Gets the sizes that various UI elements will be rendered at with the current theme.
     * If you override the row or header height using `gridOptions`, the override value you provided will be returned.
     */
    public getSizesForCurrentTheme() {
        return {
            rowHeight: this.gridOptionsWrapper.getRowHeightAsNumber(),
            headerHeight: this.gridOptionsWrapper.getHeaderHeight()
        };
    }

    /** Expand all groups. */
    public expandAll() {
        if (this.clientSideRowModel) {
            this.clientSideRowModel.expandOrCollapseAll(true);
        } else if (this.serverSideRowModel) {
            this.serverSideRowModel.expandAll(true);
        } else {
            console.warn('AG Grid: expandAll only works with Client Side Row Model and Server Side Row Model');
        }
    }

    /** Collapse all groups. */
    public collapseAll() {
        if (this.clientSideRowModel) {
            this.clientSideRowModel.expandOrCollapseAll(false);
        } else if (this.serverSideRowModel) {
            this.serverSideRowModel.expandAll(false);
        } else {
            console.warn('AG Grid: collapseAll only works with Client Side Row Model and Server Side Row Model');
        }
    }

    /** Gets the tool panel instance corresponding to the supplied `id`. */
    public getToolPanelInstance(id: string): IToolPanel | undefined {
        if (!this.sideBarComp) {
            console.warn('AG Grid: toolPanel is only available in AG Grid Enterprise');
            return;
        }
        const comp = this.sideBarComp.getToolPanelInstance(id);
        return unwrapUserComp(comp);
    }

    public addVirtualRowListener(eventName: string, rowIndex: number, callback: Function) {
        if (typeof eventName !== 'string') {
            console.warn('AG Grid: addVirtualRowListener is deprecated, please use addRenderedRowListener.');
        }
        this.addRenderedRowListener(eventName, rowIndex, callback);
    }

    /**
     * Registers a callback to a virtual row.
     * A virtual row is a row that is visually rendered on the screen (rows that are not visible because of the scroll position are not rendered).
     * Unlike normal events, you do not need to unregister rendered row listeners.
     * When the rendered row is removed from the grid, all associated rendered row listeners will also be removed.
     * Currently supports only one event, `virtualRowRemoved`;
     * listen for this event if your `cellRenderer` needs to do cleanup when the row no longer exists.
     */
    public addRenderedRowListener(eventName: string, rowIndex: number, callback: Function) {
        if (eventName === 'virtualRowSelected') {
            console.warn(`AG Grid: event virtualRowSelected is deprecated, to register for individual row
                selection events, add a listener directly to the row node.`);
        }
        this.rowRenderer.addRenderedRowListener(eventName, rowIndex, callback);
    }

    /** Pass a quick filter text into the grid for filtering. */
    public setQuickFilter(newFilter: string): void {
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

    /** Select all rows, regardless of filtering and rows that are not visible due to grouping being enabled and their groups not expanded. */
    public selectAll() {
        this.selectionService.selectAllRowNodes();
    }

    /** Clear all row selections, regardless of filtering. */
    public deselectAll() {
        this.selectionService.deselectAllRowNodes();
    }

    /** Select all filtered rows. */
    public selectAllFiltered() {
        this.selectionService.selectAllRowNodes(true);
    }

    /** Clear all filtered selections. */
    public deselectAllFiltered() {
        this.selectionService.deselectAllRowNodes(true);
    }

    public recomputeAggregates(): void {
        if (missing(this.clientSideRowModel)) { console.warn('cannot call recomputeAggregates unless using normal row model'); }
        console.warn(`recomputeAggregates is deprecated, please call api.refreshClientSideRowModel('aggregate') instead`);
        this.clientSideRowModel.refreshModel({ step: ClientSideRowModelSteps.AGGREGATE });
    }

    /** Sets columns to adjust in size to fit the grid horizontally. */
    public sizeColumnsToFit() {
        this.gridBodyCtrl.sizeColumnsToFit();
    }

    /** Show the 'loading' overlay. */
    public showLoadingOverlay(): void {
        this.overlayWrapperComp.showLoadingOverlay();
    }

    /** Show the 'no rows' overlay. */
    public showNoRowsOverlay(): void {
        this.overlayWrapperComp.showNoRowsOverlay();
    }

    /** Hides the overlay if showing. */
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

    /**
     * Returns a list of selected nodes.
     * Getting the underlying node (rather than the data) is useful when working with tree / aggregated data,
     * as the node can be traversed.
     */
    public getSelectedNodes(): RowNode[] {
        return this.selectionService.getSelectedNodes();
    }
    /** Returns a list of selected rows (i.e. row data that you provided). */
    public getSelectedRows(): any[] {
        return this.selectionService.getSelectedRows();
    }

    /**
     * Returns a list of all selected nodes at 'best cost', a feature to be used with groups / trees.
     * If a group has all its children selected, then the group appears in the result, but not the children.
     * Designed for use with `'children'` as the group selection type, where groups don't actually appear in the selection normally.
     */
    public getBestCostNodeSelection(): RowNode[] | undefined {
        return this.selectionService.getBestCostNodeSelection();
    }

    /** Retrieve rendered nodes. Due to virtualisation this will contain only the current visible rows and those in the buffer. */
    public getRenderedNodes(): RowNode[] {
        return this.rowRenderer.getRenderedNodes();
    }

    public ensureColIndexVisible(index: any) {
        console.warn('AG Grid: ensureColIndexVisible(index) no longer supported, use ensureColumnVisible(colKey) instead.');
    }

    /**
     *  Ensures the column is visible by scrolling the table if needed.
     * @param key - The column to ensure visible
     * @param position - Where the column will be positioned.
     * - `auto` - Scrolls the minimum amount to make sure the column is visible.
     * - `start` - Scrolls the column to the start of the viewport.
     * - `middle` - Scrolls the column to the middle of the viewport.
     * - `end` - Scrolls the column to the end of the viewport.
    */
    public ensureColumnVisible(key: string | Column, position: 'auto' | 'start' | 'middle' | 'end' = 'auto') {
        this.gridBodyCtrl.getScrollFeature().ensureColumnVisible(key, position);
    }

    /**
     * Ensures the row index is visible by vertically scrolling the grid.
     * If a position of `'top'`, `'middle'` or `'bottom'` is supplied, the grid will scroll the grid to place the row at the top, middle or bottom respectively.
     * Otherwise, the grid will do the minimum scrolling possible to show the row.
     * i.e.
     * - if the grid needs to scroll up then it will scroll so that the row is at the top,
     * - if the grid needs to scroll down then it will scroll so that the row is at the bottom,
     * - if the row is already in view then the grid will do nothing.
     */
    public ensureIndexVisible(index: any, position?: 'top' | 'bottom' | 'middle' | null) {
        this.gridBodyCtrl.getScrollFeature().ensureIndexVisible(index, position);
    }

    /**
     * Ensures a row node is visible, scrolling the grid if needed.
     * Provide either:
     * - the node,
     * - the data object
     * - a comparator function (that takes the node as a parameter, and returns `true` for match or `false` for no match).
     */
    public ensureNodeVisible(comparator: any, position: 'top' | 'bottom' | 'middle' | null = null) {
        this.gridBodyCtrl.getScrollFeature().ensureNodeVisible(comparator, position);
    }

    /**
     * Similar to `forEachNode`, except lists all the leaf nodes.
     * This effectively goes through all the data that you provided to the grid before the grid performed any grouping.
     * If using tree data, goes through all the nodes for the data you provided, including nodes that have children,
     * but excluding groups the grid created where gaps were missing in the hierarchy.
     */
    public forEachLeafNode(callback: (rowNode: RowNode) => void) {
        if (missing(this.clientSideRowModel)) { console.warn('cannot call forEachNode unless using normal row model'); }
        this.clientSideRowModel.forEachLeafNode(callback);
    }

    /**
     * Iterates through each node (row) in the grid and calls the callback for each node.
     * This works similar to the `forEach` method on a JavaScript array.
     * This is called for every node, ignoring any filtering or sorting applied within the grid.
     * If using the Infinite Row Model, then this gets called for each page loaded in the page cache.
     */
    public forEachNode(callback: (rowNode: RowNode, index: number) => void) {
        this.rowModel.forEachNode(callback);
    }

    /** Similar to `forEachNode`, except skips any filtered out data. */
    public forEachNodeAfterFilter(callback: (rowNode: RowNode, index: number) => void) {
        if (missing(this.clientSideRowModel)) { console.warn('cannot call forEachNodeAfterFilter unless using normal row model'); }
        this.clientSideRowModel.forEachNodeAfterFilter(callback);
    }

    /** Similar to `forEachNodeAfterFilter`, except the callbacks are called in the order the rows are displayed in the grid. */
    public forEachNodeAfterFilterAndSort(callback: (rowNode: RowNode, index: number) => void) {
        if (missing(this.clientSideRowModel)) { console.warn('cannot call forEachNodeAfterFilterAndSort unless using normal row model'); }
        this.clientSideRowModel.forEachNodeAfterFilterAndSort(callback);
    }

    /**
     * Returns the filter component instance for a column.
     * `key` can be a string field name or a ColDef object (matches on object reference, useful if field names are not unique).
     * If your filter is created asynchronously, `getFilterInstance` will return `null` so you will need to use the `callback` to access the filter instance instead.
     */
    public getFilterInstance(key: string | Column, callback?: (filter: IFilter | null) => void): IFilter | null | undefined {
        const res = this.getFilterInstanceImpl(key, instance => {
            if (!callback) { return; }
            const unwrapped = unwrapUserComp(instance);
            callback(unwrapped);
        });
        const unwrapped = unwrapUserComp(res);
        return unwrapped;
    }

    private getFilterInstanceImpl(key: string | Column, callback: (filter: IFilter) => void): IFilter | null | undefined {
        const column = this.columnModel.getPrimaryColumn(key);

        if (!column) { return undefined; }

        const filterPromise = this.filterManager.getFilterComponent(column, 'NO_UI');
        const currentValue = filterPromise && filterPromise.resolveNow<IFilterComp | null>(null, filterComp => filterComp);

        if (currentValue) {
            setTimeout(callback, 0, currentValue);
        } else if (filterPromise) {
            filterPromise.then(comp => {
                callback(comp!);
            });
        }

        return currentValue;
    }

    /** Destroys a filter. Useful to force a particular filter to be created from scratch again. */
    public destroyFilter(key: string | Column) {
        const column = this.columnModel.getPrimaryColumn(key);
        if (column) {
            return this.filterManager.destroyFilter(column, "filterDestroyed");
        }
    }

    /** Gets the status panel instance corresponding to the supplied `id`. */
    public getStatusPanel(key: string): IStatusPanel | undefined {
        if (!this.statusBarService) { return; }

        const comp = this.statusBarService.getStatusPanel(key);
        return unwrapUserComp(comp);
    }

    public getColumnDef(key: string | Column) {
        const column = this.columnModel.getPrimaryColumn(key);
        if (column) {
            return column.getColDef();
        }
        return null;
    }

    /**
     * Returns the current column definitions.
    */
    public getColumnDefs(): (ColDef | ColGroupDef)[] | undefined { return this.columnModel.getColumnDefs(); }

    /** Informs the grid that a filter has changed. This is typically called after a filter change through one of the filter APIs. */
    public onFilterChanged() {
        this.filterManager.onFilterChanged();
    }

    /**
     * Gets the grid to act as if the sort was changed.
     * Useful if you update some values and want to get the grid to reorder them according to the new values.
     */
    public onSortChanged() {
        this.sortController.onSortChanged('api');
    }

    /** Sets the state of all the advanced filters. Provide it with what you get from `getFilterModel()` to restore filter state. */
    public setFilterModel(model: any) {
        this.filterManager.setFilterModel(model);
    }

    /** Gets the current state of all the advanced filters. Used for saving filter state. */
    public getFilterModel(): { [key: string]: any; } {
        return this.filterManager.getFilterModel();
    }

    /** Returns the focused cell (or the last focused cell if the grid lost focus). */
    public getFocusedCell(): CellPosition | null {
        return this.focusService.getFocusedCell();
    }

    /** Clears the focused cell. */
    public clearFocusedCell(): void {
        return this.focusService.clearFocusedCell();
    }

    /** Sets the focus to the specified cell. `rowPinned` can be either 'top', 'bottom' or null (for not pinned). */
    public setFocusedCell(rowIndex: number, colKey: string | Column, rowPinned?: string) {
        this.focusService.setFocusedCell(rowIndex, colKey, rowPinned, true);
    }

    /** Sets the `suppressRowDrag` property. */
    public setSuppressRowDrag(value: boolean): void {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_SUPPRESS_ROW_DRAG, value);
    }

    /** Sets the `suppressMoveWhenRowDragging` property. */
    public setSuppressMoveWhenRowDragging(value: boolean): void {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_SUPPRESS_MOVE_WHEN_ROW_DRAG, value);
    }

    /** Sets the `suppressRowClickSelection` property. */
    public setSuppressRowClickSelection(value: boolean): void {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_SUPPRESS_ROW_CLICK_SELECTION, value);
    }

    /** Adds a drop zone outside of the grid where rows can be dropped. */
    public addRowDropZone(params: RowDropZoneParams): void {
        this.gridBodyCtrl.getRowDragFeature().addRowDropZone(params);
    }

    /** Removes an external drop zone added by `addRowDropZone`. */
    public removeRowDropZone(params: RowDropZoneParams): void {
        const activeDropTarget = this.dragAndDropService.findExternalZone(params);

        if (activeDropTarget) {
            this.dragAndDropService.removeDropTarget(activeDropTarget);
        }
    }

    /** Returns the `RowDropZoneParams` to be used by another grid's `addRowDropZone` method. */
    public getRowDropZoneParams(events?: RowDropZoneEvents): RowDropZoneParams {
        return this.gridBodyCtrl.getRowDragFeature().getRowDropZone(events);
    }

    /** Sets the height in pixels for the row containing the column label header. */
    public setHeaderHeight(headerHeight?: number) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_HEADER_HEIGHT, headerHeight);
    }

    /**
     * Switch between layout options: `normal`, `autoHeight`, `print`.
     * Defaults to `normal` if no domLayout provided.
     */
    public setDomLayout(domLayout?: 'normal' | 'autoHeight' | 'print') {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_DOM_LAYOUT, domLayout);
    }

    /** Sets the `enableCellTextSelection` property. */
    public setEnableCellTextSelection(selectable: boolean) {
        this.gridBodyCtrl.setCellTextSelection(selectable);
    }

    /** Sets the preferred direction for the selection fill handle. */
    public setFillHandleDirection(direction: 'x' | 'y' | 'xy') {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_FILL_HANDLE_DIRECTION, direction);
    }

    /** Sets the height in pixels for the rows containing header column groups. */
    public setGroupHeaderHeight(headerHeight?: number) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_GROUP_HEADER_HEIGHT, headerHeight);
    }

    /** Sets the height in pixels for the row containing the floating filters. */
    public setFloatingFiltersHeight(headerHeight?: number) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_FLOATING_FILTERS_HEIGHT, headerHeight);
    }

    /** Sets the height in pixels for the row containing the columns when in pivot mode. */
    public setPivotHeaderHeight(headerHeight?: number) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_PIVOT_HEADER_HEIGHT, headerHeight);
    }

    /** Sets the height in pixels for the row containing header column groups when in pivot mode. */
    public setPivotGroupHeaderHeight(headerHeight?: number) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_PIVOT_GROUP_HEADER_HEIGHT, headerHeight);
    }

    public setIsExternalFilterPresent(isExternalFilterPresentFunc: () => boolean): void {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_IS_EXTERNAL_FILTER_PRESENT, isExternalFilterPresentFunc);
    }

    public setDoesExternalFilterPass(doesExternalFilterPassFunc: (node: RowNode) => boolean): void {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_DOES_EXTERNAL_FILTER_PASS, doesExternalFilterPassFunc);
    }

    public setNavigateToNextCell(navigateToNextCellFunc: (params: NavigateToNextCellParams) => (CellPosition | null)): void {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_NAVIGATE_TO_NEXT_CELL, navigateToNextCellFunc);
    }

    public setTabToNextCell(tabToNextCellFunc: (params: TabToNextCellParams) => (CellPosition | null)): void {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_TAB_TO_NEXT_CELL, tabToNextCellFunc);
    }

    public setTabToNextHeader(tabToNextHeaderFunc: (params: TabToNextHeaderParams) => (HeaderPosition | null)): void {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_TAB_TO_NEXT_HEADER, tabToNextHeaderFunc);
    }

    public setNavigateToNextHeader(navigateToNextHeaderFunc: (params: NavigateToNextHeaderParams) => (HeaderPosition | null)): void {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_NAVIGATE_TO_NEXT_HEADER, navigateToNextHeaderFunc);
    }

    public setGroupRowAggNodes(groupRowAggNodesFunc: (nodes: RowNode[]) => any): void {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_GROUP_ROW_AGG_NODES, groupRowAggNodesFunc);
    }
    public setGetGroupRowAgg(getGroupRowAggFunc: (params: GetGroupRowAggParams) => any): void {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_GET_GROUP_ROW_AGG, getGroupRowAggFunc);
    }

    public setGetBusinessKeyForNode(getBusinessKeyForNodeFunc: (nodes: RowNode) => string): void {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_GET_BUSINESS_KEY_FOR_NODE, getBusinessKeyForNodeFunc);
    }

    public setGetChildCount(getChildCountFunc: (dataItem: any) => number): void {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_GET_CHILD_COUNT, getChildCountFunc);
    }

    public setProcessRowPostCreate(processRowPostCreateFunc: (params: ProcessRowParams) => void): void {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_PROCESS_ROW_POST_CREATE, processRowPostCreateFunc);
    }

    public setGetRowNodeId(getRowNodeIdFunc: GetRowNodeIdFunc): void {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_GET_ROW_NODE_ID, getRowNodeIdFunc);
    }
    public setGetRowId(getRowIdFunc: GetRowIdFunc): void {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_GET_ROW_ID, getRowIdFunc);
    }

    public setGetRowClass(rowClassFunc: (params: RowClassParams) => string | string[]): void {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_GET_ROW_CLASS, rowClassFunc);
    }

    public setIsFullWidthCell(isFullWidthCellFunc: (rowNode: RowNode) => boolean): void {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_IS_FULL_WIDTH_CELL, isFullWidthCellFunc);
    }
    public setIsFullWidthRow(isFullWidthRowFunc: (rowNode: RowNode) => boolean): void {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_IS_FULL_WIDTH_ROW, isFullWidthRowFunc);
    }

    public setIsRowSelectable(isRowSelectableFunc: IsRowSelectable): void {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_IS_ROW_SELECTABLE, isRowSelectableFunc);
    }

    public setIsRowMaster(isRowMasterFunc: IsRowMaster): void {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_IS_ROW_MASTER, isRowMasterFunc);
    }

    public setPostSort(postSortFunc: (nodes: RowNode[]) => void): void {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_POST_SORT, postSortFunc);
    }
    public setPostSortRows(postSortRowsFunc: (params: PostSortRowsParams) => void): void {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_POST_SORT_ROWS, postSortRowsFunc);
    }

    public setGetDocument(getDocumentFunc: () => Document): void {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_GET_DOCUMENT, getDocumentFunc);
    }

    public setGetContextMenuItems(getContextMenuItemsFunc: GetContextMenuItems): void {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_GET_CONTEXT_MENU_ITEMS, getContextMenuItemsFunc);
    }

    public setGetMainMenuItems(getMainMenuItemsFunc: GetMainMenuItems): void {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_GET_MAIN_MENU_ITEMS, getMainMenuItemsFunc);
    }

    public setProcessCellForClipboard(processCellForClipboardFunc: (params: ProcessCellForExportParams) => any): void {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_PROCESS_CELL_FOR_CLIPBOARD, processCellForClipboardFunc);
    }

    public setSendToClipboard(sendToClipboardFunc: (params: { data: string }) => void): void {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_SEND_TO_CLIPBOARD, sendToClipboardFunc);
    }

    public setProcessCellFromClipboard(processCellFromClipboardFunc: (params: ProcessCellForExportParams) => any): void {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_PROCESS_CELL_FROM_CLIPBOARD, processCellFromClipboardFunc);
    }

    /** @deprecated use `setProcessPivotResultColDef` instead */
    public setProcessSecondaryColDef(processSecondaryColDefFunc: (colDef: ColDef) => void): void {
        console.warn('AG Grid: since version 28.0.x setProcessSecondaryColDef has been renamed, please use setProcessPivotResultColDef instead');
        this.setProcessPivotResultColDef(processSecondaryColDefFunc);
    }

    /** @deprecated use `setProcessPivotResultColGroupDef` instead */
    public setProcessSecondaryColGroupDef(processSecondaryColGroupDefFunc: (colDef: ColDef) => void): void {
        console.warn('AG Grid: since version 28.0.x setProcessSecondaryColGroupDef has been renamed, please use setProcessPivotResultColGroupDef instead');
        this.setProcessPivotResultColGroupDef(processSecondaryColGroupDefFunc);
    }

    public setProcessPivotResultColDef(processPivotResultColDefFunc: (colDef: ColDef) => void): void {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_PROCESS_PIVOT_RESULT_COL_DEF, processPivotResultColDefFunc);
    }

    public setProcessPivotResultColGroupDef(processPivotResultColGroupDefFunc: (colDef: ColDef) => void): void {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_PROCESS_PIVOT_RESULT_COL_GROUP_DEF, processPivotResultColGroupDefFunc);
    }

    public setPostProcessPopup(postProcessPopupFunc: (params: PostProcessPopupParams) => void): void {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_POST_PROCESS_POPUP, postProcessPopupFunc);
    }

    public setDefaultGroupOrderComparator(defaultGroupOrderComparatorFunc: (nodeA: RowNode, nodeB: RowNode) => number): void {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_DEFAULT_GROUP_ORDER_COMPARATOR, defaultGroupOrderComparatorFunc);
    }
    public setInitialGroupOrderComparator(initialGroupOrderComparatorFunc: (params: InitialGroupOrderComparatorParams) => number): void {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_INITIAL_GROUP_ORDER_COMPARATOR, initialGroupOrderComparatorFunc);
    }

    public setGetChartToolbarItems(getChartToolbarItemsFunc: GetChartToolbarItems): void {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_GET_CHART_TOOLBAR_ITEMS, getChartToolbarItemsFunc);
    }

    public setPaginationNumberFormatter(paginationNumberFormatterFunc: (params: PaginationNumberFormatterParams) => string): void {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_PAGINATION_NUMBER_FORMATTER, paginationNumberFormatterFunc);
    }

    /** @deprecated
     * use setGetServerSideGroupLevelParams instead
     */
    public setGetServerSideStoreParams(getServerSideStoreParamsFunc: (params: GetServerSideGroupLevelParamsParams) => ServerSideGroupLevelParams): void {
        this.setGetServerSideGroupLevelParams(getServerSideStoreParamsFunc);
    }

    public setGetServerSideGroupLevelParams(getServerSideGroupLevelParamsFunc: (params: GetServerSideGroupLevelParamsParams) => ServerSideGroupLevelParams): void {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_GET_SERVER_SIDE_GROUP_PARAMS, getServerSideGroupLevelParamsFunc);
    }

    public setIsServerSideGroupOpenByDefault(isServerSideGroupOpenByDefaultFunc: (params: IsServerSideGroupOpenByDefaultParams) => boolean): void {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_IS_SERVER_SIDE_GROUPS_OPEN_BY_DEFAULT, isServerSideGroupOpenByDefaultFunc);
    }

    public setIsApplyServerSideTransaction(isApplyServerSideTransactionFunc: IsApplyServerSideTransaction): void {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_IS_APPLY_SERVER_SIDE_TRANSACTION, isApplyServerSideTransactionFunc);
    }

    public setIsServerSideGroup(isServerSideGroupFunc: IsServerSideGroup): void {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_IS_SERVER_SIDE_GROUP, isServerSideGroupFunc);
    }

    public setGetServerSideGroupKey(getServerSideGroupKeyFunc: GetServerSideGroupKey): void {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_GET_SERVER_SIDE_GROUP_KEY, getServerSideGroupKeyFunc);
    }

    public setGetRowStyle(rowStyleFunc: (params: RowClassParams) => {}): void {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_GET_ROW_STYLE, rowStyleFunc);
    }

    public setGetRowHeight(rowHeightFunc: (params: RowHeightParams) => number): void {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_GET_ROW_HEIGHT, rowHeightFunc);
    }

    /** Returns `true` if the side bar is visible. */
    public isSideBarVisible(): boolean {
        return this.sideBarComp ? this.sideBarComp.isDisplayed() : false;
    }

    /** Show/hide the entire side bar, including any visible panel and the tab buttons. */
    public setSideBarVisible(show: boolean) {
        if (!this.sideBarComp) {
            if (show) {
                console.warn('AG Grid: sideBar is not loaded');
            }
            return;
        }
        this.sideBarComp.setDisplayed(show);
    }

    /** Sets the side bar position relative to the grid. Possible values are `'left'` or `'right'`. */
    public setSideBarPosition(position: 'left' | 'right') {
        if (!this.sideBarComp) {
            console.warn('AG Grid: sideBar is not loaded');
            return;
        }
        this.sideBarComp.setSideBarPosition(position);
    }

    /** Opens a particular tool panel. Provide the ID of the tool panel to open. */
    public openToolPanel(key: string) {
        if (!this.sideBarComp) {
            console.warn('AG Grid: toolPanel is only available in AG Grid Enterprise');
            return;
        }
        this.sideBarComp.openToolPanel(key);
    }

    /** Closes the currently open tool panel (if any). */
    public closeToolPanel() {
        if (!this.sideBarComp) {
            console.warn('AG Grid: toolPanel is only available in AG Grid Enterprise');
            return;
        }
        this.sideBarComp.close();
    }

    /** Returns the ID of the currently shown tool panel if any, otherwise `null`. */
    public getOpenedToolPanel(): string | null {
        return this.sideBarComp ? this.sideBarComp.openedItem() : null;
    }

    /** Returns the current side bar configuration. If a shortcut was used, returns the detailed long form. */
    public getSideBar(): SideBarDef {
        return this.gridOptionsWrapper.getSideBar();
    }

    /** Resets the side bar to the provided configuration. The parameter is the same as the sideBar grid property. The side bar is re-created from scratch with the new config. */
    public setSideBar(def: SideBarDef | string | string[] | boolean): void {
        this.gridOptionsWrapper.setProperty('sideBar', SideBarDefParser.parse(def));
    }

    public setSuppressClipboardPaste(value: boolean): void {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_SUPPRESS_CLIPBOARD_PASTE, value);
    }

    /** Returns `true` if the tool panel is showing, otherwise `false`. */
    public isToolPanelShowing(): boolean {
        return this.sideBarComp.isToolPanelShowing();
    }

    public doLayout() {
        const message = `AG Grid - since version 25.1, doLayout was taken out, as it's not needed. The grid responds to grid size changes automatically`;
        doOnce(() => console.warn(message), 'doLayoutDeprecated');
    }

    /** Tells the grid to recalculate the row heights. */
    public resetRowHeights() {
        if (exists(this.clientSideRowModel)) {
            if (this.columnModel.isAutoRowHeightActive()) {
                console.warn('AG Grid: calling gridApi.resetRowHeights() makes no sense when using Auto Row Height.');
                return;
            }
            this.clientSideRowModel.resetRowHeights();
        }
    }

    public setGroupRemoveSingleChildren(value: boolean) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_GROUP_REMOVE_SINGLE_CHILDREN, value);
    }

    public setGroupRemoveLowestSingleChildren(value: boolean) {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_GROUP_REMOVE_LOWEST_SINGLE_CHILDREN, value);
    }

    /** Tells the grid a row height has changed. To be used after calling `rowNode.setRowHeight(newHeight)`. */
    public onRowHeightChanged() {
        if (this.clientSideRowModel) {
            this.clientSideRowModel.onRowHeightChanged();
        } else if (this.serverSideRowModel) {
            this.serverSideRowModel.onRowHeightChanged();
        }
    }

    /**
     * Gets the value for a column for a particular `rowNode` (row).
     * This is useful if you want the raw value of a cell e.g. if implementing your own CSV export.
     */
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

    /** Add an event listener for the specified `eventType`. Works similar to `addEventListener` for a browser DOM element. */
    public addEventListener(eventType: string, listener: Function): void {
        const async = this.gridOptionsWrapper.useAsyncEvents();
        this.eventService.addEventListener(eventType, listener, async);
    }

    /** Add an event listener for all event types coming from the grid. */
    public addGlobalListener(listener: Function): void {
        const async = this.gridOptionsWrapper.useAsyncEvents();
        this.eventService.addGlobalListener(listener, async);
    }

    /** Remove an event listener. */
    public removeEventListener(eventType: string, listener: Function): void {
        const async = this.gridOptionsWrapper.useAsyncEvents();
        this.eventService.removeEventListener(eventType, listener, async);
    }

    /** Remove a global event listener. */
    public removeGlobalListener(listener: Function): void {
        const async = this.gridOptionsWrapper.useAsyncEvents();
        this.eventService.removeGlobalListener(listener, async);
    }

    public dispatchEvent(event: AgEvent): void {
        this.eventService.dispatchEvent(event);
    }

    /** Will destroy the grid and release resources. If you are using a framework you do not need to call this, as the grid links in with the framework lifecycle. However if you are using Web Components or native JavaScript, you do need to call this, to avoid a memory leak in your application. */
    public destroy(): void {
        // this is needed as GridAPI is a bean, and GridAPI.destroy() is called as part
        // of context.destroy(). so we need to stop the infinite loop.
        if (this.destroyCalled) { return; }
        this.destroyCalled = true;

        // destroy the UI first (as they use the services)
        const gridCtrl = this.ctrlsService.getGridCtrl();

        if (gridCtrl) {
            gridCtrl.destroyGridUi();
        }

        // destroy the services
        this.context.destroy();
    }

    @PreDestroy
    private cleanDownReferencesToAvoidMemoryLeakInCaseApplicationIsKeepingReferenceToDestroyedGrid(): void {
        // some users were raising support issues with regards memory leaks. the problem was the customers applications
        // were keeping references to the API. trying to educate them all would be difficult, easier to just remove
        // all references in the API so at least the core grid can be garbage collected.
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

    /** Reset the quick filter cache text on every rowNode. */
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

    /** Returns the list of selected cell ranges. */
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
    /** Adds the provided cell range to the selected ranges. */
    public addCellRange(params: CellRangeParams): void {
        if (!this.rangeService) { console.warn('AG Grid: cell range selection is only available in AG Grid Enterprise'); }
        this.rangeService.addCellRange(params);
    }

    /** Clears the selected ranges. */
    public clearRangeSelection(): void {
        if (!this.rangeService) { console.warn('AG Grid: cell range selection is only available in AG Grid Enterprise'); }
        this.rangeService.removeAllCellRanges();
    }
    /** Reverts the last cell edit. */
    public undoCellEditing(): void {
        this.undoRedoService.undo();
    }
    /** Re-applies the most recently undone cell edit. */
    public redoCellEditing(): void {
        this.undoRedoService.redo();
    }

    /** Returns current number of available cell edit undo operations. */
    public getCurrentUndoSize(): number {
        return this.undoRedoService.getCurrentUndoStackSize();
    }
    /** Returns current number of available cell edit redo operations. */
    public getCurrentRedoSize(): number {
        return this.undoRedoService.getCurrentRedoStackSize();
    }

    /** Returns a list of models with information about the charts that are currently rendered from the grid. */
    public getChartModels(): ChartModel[] | undefined {
        if (ModuleRegistry.assertRegistered(ModuleNames.RangeSelectionModule, 'api.getChartModels') &&
            ModuleRegistry.assertRegistered(ModuleNames.GridChartsModule, 'api.getChartModels')) {
            return this.chartService.getChartModels();
        }
    }

    /** Returns the `ChartRef` using the supplied `chartId`. */
    public getChartRef(chartId: string): ChartRef | undefined {
        if (ModuleRegistry.assertRegistered(ModuleNames.RangeSelectionModule, 'api.getChartRef') &&
            ModuleRegistry.assertRegistered(ModuleNames.GridChartsModule, 'api.getChartRef')) {
            return this.chartService.getChartRef(chartId);
        }
    }

    /** Returns a string containing the requested data URL which contains a representation of the chart image. */
    public getChartImageDataURL(params: GetChartImageDataUrlParams): string | undefined {
        if (ModuleRegistry.assertRegistered(ModuleNames.RangeSelectionModule, 'api.getChartImageDataURL') &&
            ModuleRegistry.assertRegistered(ModuleNames.GridChartsModule, 'api.getChartImageDataURL')) {
            return this.chartService.getChartImageDataURL(params);
        }
    }

    /** Used to programmatically create charts from a range. */
    public createRangeChart(params: CreateRangeChartParams): ChartRef | undefined {
        if (ModuleRegistry.assertRegistered(ModuleNames.RangeSelectionModule, 'api.createRangeChart') &&
            ModuleRegistry.assertRegistered(ModuleNames.GridChartsModule, 'api.createRangeChart')) {
            return this.chartService.createRangeChart(params);
        }
    }

    /** Used to programmatically create cross filter charts from a range. */
    public createCrossFilterChart(params: CreateCrossFilterChartParams): ChartRef | undefined {
        if (ModuleRegistry.assertRegistered(ModuleNames.RangeSelectionModule, 'api.createCrossFilterChart') &&
            ModuleRegistry.assertRegistered(ModuleNames.GridChartsModule, 'api.createCrossFilterChart')) {
            return this.chartService.createCrossFilterChart(params);
        }
    }

    /** Restores a chart using the `ChartModel` that was previously obtained from `getChartModels()`. */
    public restoreChart(chartModel: ChartModel, chartContainer?: HTMLElement): ChartRef | undefined {
        if (ModuleRegistry.assertRegistered(ModuleNames.RangeSelectionModule, 'api.restoreChart') &&
            ModuleRegistry.assertRegistered(ModuleNames.GridChartsModule, 'api.restoreChart')) {
            return this.chartService.restoreChart(chartModel, chartContainer);
        }
    }

    /** Used to programmatically create pivot charts from a grid. */
    public createPivotChart(params: CreatePivotChartParams): ChartRef | undefined {
        if (ModuleRegistry.assertRegistered(ModuleNames.RangeSelectionModule, 'api.createPivotChart') &&
            ModuleRegistry.assertRegistered(ModuleNames.GridChartsModule, 'api.createPivotChart')) {
            return this.chartService.createPivotChart(params);
        }
    }

    /** Copies the selected rows to the clipboard. */
    public copySelectedRowsToClipboard(params?: IClipboardCopyRowsParams): void {
        if (!this.clipboardService) { console.warn('AG Grid: clipboard is only available in AG Grid Enterprise'); }
        this.clipboardService.copySelectedRowsToClipboard(params);
    }

    /** Copies the selected ranges to the clipboard. */
    public copySelectedRangeToClipboard(params?: IClipboardCopyParams): void {
        if (!this.clipboardService) { console.warn('AG Grid: clipboard is only available in AG Grid Enterprise'); }
        this.clipboardService.copySelectedRangeToClipboard(params);
    }

    /** Copies the selected range down, similar to `Ctrl + D` in Excel. */
    public copySelectedRangeDown(): void {
        if (!this.clipboardService) { console.warn('AG Grid: clipboard is only available in AG Grid Enterprise'); }
        this.clipboardService.copyRangeDown();
    }

    /** Shows the column menu after and positions it relative to the provided button element. Use in conjunction with your own header template. */
    public showColumnMenuAfterButtonClick(colKey: string | Column, buttonElement: HTMLElement): void {
        // use grid column so works with pivot mode
        const column = this.columnModel.getGridColumn(colKey);
        this.menuFactory.showMenuAfterButtonClick(column, buttonElement, 'columnMenu');
    }

    /** Shows the column menu after and positions it relative to the mouse event. Use in conjunction with your own header template. */
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

    /** Hides any visible context menu or column menu. */
    public hidePopupMenu(): void {
        // hide the context menu if in enterprise
        if (this.contextMenuFactory) {
            this.contextMenuFactory.hideActiveMenu();
        }
        // and hide the column menu always
        this.menuFactory.hideActiveMenu();
    }

    /** DOM element to use as the popup parent for grid popups (context menu, column menu etc). */
    public setPopupParent(ePopupParent: HTMLElement): void {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_POPUP_PARENT, ePopupParent);
    }

    /** Navigates the grid focus to the next cell, as if tabbing. */
    public tabToNextCell(event?: KeyboardEvent): boolean {
        return this.navigationService.tabToNextCell(false, event);
    }

    /** Navigates the grid focus to the previous cell, as if shift-tabbing. */
    public tabToPreviousCell(event?: KeyboardEvent): boolean {
        return this.navigationService.tabToNextCell(true, event);
    }

    /** Returns the list of active cell renderer instances. */
    public getCellRendererInstances(params: GetCellRendererInstancesParams = {}): ICellRenderer[] {
        const res = this.rowRenderer.getCellRendererInstances(params);
        const unwrapped = res.map(unwrapUserComp);
        return unwrapped;
    }

    /** Returns the list of active cell editor instances. Optionally provide parameters to restrict to certain columns / row nodes. */
    public getCellEditorInstances(params: GetCellEditorInstancesParams = {}): ICellEditor[] {
        const res = this.rowRenderer.getCellEditorInstances(params);
        const unwrapped = res.map(unwrapUserComp);
        return unwrapped;
    }

    /** If the grid is editing, returns back details of the editing cell(s). */
    public getEditingCells(): CellPosition[] {
        return this.rowRenderer.getEditingCells();
    }

    /** If a cell is editing, it stops the editing. Pass `true` if you want to cancel the editing (i.e. don't accept changes). */
    public stopEditing(cancel: boolean = false): void {
        this.rowRenderer.stopEditing(cancel);
    }

    /** Start editing the provided cell. If another cell is editing, the editing will be stopped in that other cell. */
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
        const notPinned = params.rowPinned == null;
        if (notPinned) {
            this.gridBodyCtrl.getScrollFeature().ensureIndexVisible(params.rowIndex);
        }

        const cell = this.navigationService.getCellByPosition(cellPosition);
        if (!cell) { return; }
        cell.startRowOrCellEdit(params.key, params.charPress);
    }

    /** Add an aggregation function with the specified key. */
    public addAggFunc(key: string, aggFunc: IAggFunc): void {
        if (this.aggFuncService) {
            this.aggFuncService.addAggFunc(key, aggFunc);
        }
    }

    /** Add aggregations function with the specified keys. */
    public addAggFuncs(aggFuncs: { [key: string]: IAggFunc; }): void {
        if (this.aggFuncService) {
            this.aggFuncService.addAggFuncs(aggFuncs);
        }
    }

    /** Clears all aggregation functions (including those provided by the grid). */
    public clearAggFuncs(): void {
        if (this.aggFuncService) {
            this.aggFuncService.clear();
        }
    }

    /** Apply transactions to the server side row model. */
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

    /** Gets all failed server side loads to retry. */
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

    /** Update row data. Pass a transaction object with lists for `add`, `remove` and `update`. */
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

    /** Sets the `deltaSort` property */
    public setDeltaSort(enable: boolean): void {
        this.gridOptionsWrapper.setProperty('deltaSort', enable);
    }

    /** @deprecated */
    public updateRowData(rowDataTransaction: RowDataTransaction): RowNodeTransaction | null | undefined {
        const message = 'AG Grid: as of v23.1, grid API updateRowData(transaction) is now called applyTransaction(transaction). updateRowData is deprecated and will be removed in a future major release.';
        doOnce(() => console.warn(message), 'updateRowData deprecated');

        return this.applyTransaction(rowDataTransaction);
    }

    /** Same as `applyTransaction` except executes asynchronously for efficiency. */
    public applyTransactionAsync(rowDataTransaction: RowDataTransaction, callback?: (res: RowNodeTransaction) => void): void {
        if (!this.clientSideRowModel) {
            console.error('AG Grid: api.applyTransactionAsync() only works with ClientSideRowModel.');
            return;
        }
        this.clientSideRowModel.batchUpdateRowData(rowDataTransaction, callback);
    }

    /** Executes any remaining asynchronous grid transactions, if any are waiting to be executed. */
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

    /**
     * Marks all the currently loaded blocks in the cache for reload.
     * If you have 10 blocks in the cache, all 10 will be marked for reload.
     * The old data will continue to be displayed until the new data is loaded.
     */
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

    /**
     * Purges the cache.
     * The grid is then told to refresh. Only the blocks required to display the current data on screen are fetched (typically no more than 2).
     * The grid will display nothing while the new blocks are loaded.
     * Use this to immediately remove the old data from the user.
     */
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

    /**
     * Refresh a server-side level.
     * If you pass no parameters, then the top level store is purged.
     * To purge a child level, pass in the string of keys to get to the desired level.
     */
    public refreshServerSide(params?: RefreshServerSideParams): void {
        if (!this.serverSideRowModel) {
            console.warn(`AG Grid: api.refreshServerSideStore is only available when rowModelType='serverSide'.`);
        }
        this.serverSideRowModel.refreshStore(params);
    }

    /** @deprecated use `refreshServerSide` instead */
    public refreshServerSideStore(params?: RefreshServerSideParams): void {
        const message = `AG Grid: Grid API refreshServerSideStore() was renamed to refreshServerSide() in v28.0`;
        doOnce( ()=> console.warn(message), 'refreshServerSideStore-renamed');
        return this.refreshServerSide(params);
    }

    /** @deprecated use `getServerSideGroupLevelState` instead */
    public getServerSideStoreState(): ServerSideGroupLevelState[] {
        const message = `AG Grid: Grid API getServerSideStoreState() was renamed to getServerSideGroupLevelState() in v28.0`;
        doOnce( ()=> console.warn(message), 'getServerSideStoreState-renamed');
        return this.getServerSideGroupLevelState();
    }

    /** Returns info on all server side group levels. */
    public getServerSideGroupLevelState(): ServerSideGroupLevelState[] {
        if (!this.serverSideRowModel) {
            console.warn(`AG Grid: api.getServerSideGroupLevelState is only available when rowModelType='serverSide'.`);
            return [];
        }
        return this.serverSideRowModel.getStoreState();
    }

    public getVirtualRowCount(): number | null | undefined {
        console.warn('AG Grid: getVirtualRowCount() is now called getInfiniteRowCount(), please call getInfiniteRowCount() instead');
        return this.getInfiniteRowCount();
    }

    /** The row count defines how many rows the grid allows scrolling to. */
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

    /** Returns `true` if grid allows for scrolling past the last row to load more rows, thus providing infinite scroll. */
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

    /**
     * Sets the `rowCount` and `lastRowIndexKnown` properties.
     * The second parameter, `lastRowIndexKnown`, is optional and if left out, only `rowCount` is set.
     * Set `rowCount` to adjust the height of the vertical scroll.
     * Set `lastRowIndexKnown` to enable / disable searching for more rows.
     * Use this method if you add or remove rows into the dataset and need to reset the number of rows or put the data back into 'look for data' mode.
     */
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

    /**
     * Returns an object representing the state of the cache. This is useful for debugging and understanding how the cache is working.
     */
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

    /** Get the index of the first displayed row due to scrolling (includes invisible rendered rows in the buffer). */
    public getFirstDisplayedRow(): number {
        return this.rowRenderer.getFirstVirtualRenderedRow();
    }

    public getLastRenderedRow(): number {
        console.warn('in AG Grid v12, getLastRenderedRow() was renamed to getLastDisplayedRow()');
        return this.getLastDisplayedRow();
    }

    /** Get the index of the last displayed row due to scrolling (includes invisible rendered rows in the buffer). */
    public getLastDisplayedRow(): number {
        return this.rowRenderer.getLastVirtualRenderedRow();
    }

    /** Returns the displayed `RowNode` at the given `index`. */
    public getDisplayedRowAtIndex(index: number): RowNode | undefined {
        return this.rowModel.getRow(index);
    }

    /** Returns the total number of displayed rows. */
    public getDisplayedRowCount(): number {
        return this.rowModel.getRowCount();
    }

    /**
     * Returns `true` when the last page is known.
     * This will always be `true` if you are using the Client-Side Row Model for pagination.
     * Returns `false` when the last page is not known; this only happens when using Infinite Row Model.
     */
    public paginationIsLastPageFound(): boolean {
        return this.paginationProxy.isLastPageFound();
    }

    /** Returns how many rows are being shown per page. */
    public paginationGetPageSize(): number {
        return this.paginationProxy.getPageSize();
    }

    /** Sets the `paginationPageSize`, then re-paginates the grid so the changes are applied immediately. */
    public paginationSetPageSize(size?: number): void {
        this.gridOptionsWrapper.setProperty('paginationPageSize', size);
    }

    /** Returns the 0-based index of the page which is showing. */
    public paginationGetCurrentPage(): number {
        return this.paginationProxy.getCurrentPage();
    }

    /** Returns the total number of pages. Returns `null` if `paginationIsLastPageFound() === false`. */
    public paginationGetTotalPages(): number {
        return this.paginationProxy.getTotalPages();
    }

    /** The total number of rows. Returns `null` if `paginationIsLastPageFound() === false`. */
    public paginationGetRowCount(): number {
        return this.paginationProxy.getMasterRowCount();
    }

    /** Navigates to the next page. */
    public paginationGoToNextPage(): void {
        this.paginationProxy.goToNextPage();
    }

    /** Navigates to the previous page. */
    public paginationGoToPreviousPage(): void {
        this.paginationProxy.goToPreviousPage();
    }

    /** Navigates to the first page. */
    public paginationGoToFirstPage(): void {
        this.paginationProxy.goToFirstPage();
    }

    /** Navigates to the last page. */
    public paginationGoToLastPage(): void {
        this.paginationProxy.goToLastPage();
    }

    /** Goes to the specified page. If the page requested doesn't exist, it will go to the last page. */
    public paginationGoToPage(page: number): void {
        this.paginationProxy.goToPage(page);
    }

    public setRowClass(className: string | undefined): void {
        this.gridOptionsWrapper.setProperty(GridOptionsWrapper.PROP_ROW_CLASS, className);
    }
}
