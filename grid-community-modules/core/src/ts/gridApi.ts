import { AlignedGridsService } from "./alignedGridsService";
import { ColumnApi } from "./columns/columnApi";
import { ApplyColumnStateParams, ColumnModel, ColumnState, ISizeColumnsToFitParams } from "./columns/columnModel";
import { Autowired, Bean, Context, Optional, PostConstruct } from "./context/context";
import { CtrlsService } from "./ctrlsService";
import { DragAndDropService } from "./dragAndDrop/dragAndDropService";
import { CellPosition } from "./entities/cellPositionUtils";
import { ColDef, ColGroupDef, ColumnChooserParams, HeaderLocation, IAggFunc } from "./entities/colDef";
import { Column, ColumnPinnedType } from "./entities/column";
import {
    ChartRef,
    DomLayoutType,
    GetChartToolbarItems,
    GetContextMenuItems,
    GetMainMenuItems,
    GetRowIdFunc,
    GetServerSideGroupKey,
    GridOptions,
    IsApplyServerSideTransaction,
    IsRowMaster,
    IsRowSelectable,
    IsServerSideGroup,
    RowClassParams,
    RowGroupingDisplayType,
    ServerSideGroupLevelParams,
    UseGroupFooter
} from "./entities/gridOptions";
import {
    GetGroupRowAggParams,
    GetServerSideGroupLevelParamsParams,
    InitialGroupOrderComparatorParams,
    IsFullWidthRowParams,
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
} from "./interfaces/iCallbackParams";
import { IRowNode, RowPinnedType } from "./interfaces/iRowNode";
import { AgEvent, AgEventListener, AgGlobalEventListener, ColumnEventType, FilterChangedEventSourceType, GridPreDestroyedEvent, SelectionEventSourceType } from "./events";
import { EventService } from "./eventService";
import { FilterManager } from "./filter/filterManager";
import { FocusService } from "./focusService";
import { GridBodyCtrl } from "./gridBodyComp/gridBodyCtrl";
import { NavigationService } from "./gridBodyComp/navigationService";
import { RowDropZoneEvents, RowDropZoneParams } from "./gridBodyComp/rowDragFeature";
import { GridOptionsService } from "./gridOptionsService";
import { HeaderPosition } from "./headerRendering/common/headerPosition";
import { CsvExportParams, ProcessCellForExportParams } from "./interfaces/exportParams";
import { IAggFuncService } from "./interfaces/iAggFuncService";
import { ICellEditor } from "./interfaces/iCellEditor";
import {
    ChartDownloadParams,
    ChartModel,
    CloseChartToolPanelParams,
    CreateCrossFilterChartParams,
    CreatePivotChartParams,
    CreateRangeChartParams,
    GetChartImageDataUrlParams,
    IChartService,
    OpenChartToolPanelParams, UpdateChartParams,
} from './interfaces/IChartService';
import { ClientSideRowModelStep, IClientSideRowModel } from "./interfaces/iClientSideRowModel";
import { IClipboardCopyParams, IClipboardCopyRowsParams, IClipboardService } from "./interfaces/iClipboardService";
import { IColumnToolPanel } from "./interfaces/iColumnToolPanel";
import { ICsvCreator } from "./interfaces/iCsvCreator";
import { IDatasource } from "./interfaces/iDatasource";
import {
    ExcelExportMultipleSheetParams,
    ExcelExportParams,
    ExcelFactoryMode,
    IExcelCreator
} from "./interfaces/iExcelCreator";
import { FilterModel, IFilter } from "./interfaces/iFilter";
import { IFiltersToolPanel } from "./interfaces/iFiltersToolPanel";
import { IInfiniteRowModel } from "./interfaces/iInfiniteRowModel";
import { CellRange, CellRangeParams, IRangeService } from "./interfaces/IRangeService";
import { IRowModel, RowModelType } from "./interfaces/iRowModel";
import { IServerSideDatasource } from "./interfaces/iServerSideDatasource";
import {
    IServerSideRowModel,
    IServerSideTransactionManager,
    RefreshServerSideParams
} from "./interfaces/iServerSideRowModel";
import { ServerSideGroupLevelState } from "./interfaces/IServerSideStore";
import { ISideBarService, SideBarDef } from "./interfaces/iSideBar";
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
import {
    FlashCellsParams,
    GetCellEditorInstancesParams,
    GetCellRendererInstancesParams,
    RedrawRowsParams,
    RefreshCellsParams,
    RowRenderer
} from "./rendering/rowRenderer";
import { RowNodeBlockLoader } from "./rowNodeCache/rowNodeBlockLoader";
import { SortController } from "./sortController";
import { UndoRedoService } from "./undoRedo/undoRedoService";
import { exists, missing } from "./utils/generic";
import { iterateObject, removeAllReferences } from "./utils/object";
import { ValueCache } from "./valueService/valueCache";
import { ValueService } from "./valueService/valueService";
import { ISelectionService } from "./interfaces/iSelectionService";
import { IServerSideGroupSelectionState, IServerSideSelectionState } from "./interfaces/iServerSideSelection";
import { DataTypeDefinition } from "./entities/dataType";
import { RowNode } from "./entities/rowNode";
import { AdvancedFilterModel } from "./interfaces/advancedFilterModel";
import { LoadSuccessParams } from "./rowNodeCache/rowNodeBlock";
import { Events } from './eventKeys';
import { IAdvancedFilterBuilderParams } from "./interfaces/iAdvancedFilterBuilderParams";
import { IHeaderColumn } from "./interfaces/iHeaderColumn";
import { ProvidedColumnGroup } from "./entities/providedColumnGroup";
import { ColumnGroup } from "./entities/columnGroup";
import { OverlayService } from "./rendering/overlays/overlayService";
import { GridState } from "./interfaces/gridState";
import { StateService } from "./misc/stateService";
import { IExpansionService } from "./interfaces/iExpansionService";
import { warnOnce } from "./utils/function";
import { ApiEventService } from "./misc/apiEventService";
import { IFrameworkOverrides } from "./interfaces/iFrameworkOverrides";
import { ManagedGridOptionKey, ManagedGridOptions } from "./propertyKeys";
import { WithoutGridCommon } from "./interfaces/iCommon";
import { MenuService } from "./misc/menuService";

export interface DetailGridInfo {
    /**
     * Id of the detail grid, the format is `detail_{ROW-ID}`,
     * where `ROW-ID` is the `id` of the parent row.
     */
    id: string;
    /** Grid api of the detail grid. */
    api?: GridApi;
    /** @deprecated v31 ColumnApi has been deprecated and all methods moved to the api. */
    columnApi?: ColumnApi;
}

export interface StartEditingCellParams {
    /** The row index of the row to start editing */
    rowIndex: number;
    /** The column key of the row to start editing */
    colKey: string | Column;
    /** Set to `'top'` or `'bottom'` to start editing a pinned row */
    rowPinned?: RowPinnedType;
    /** The key to pass to the cell editor */
    key?: string;
}

export function unwrapUserComp<T>(comp: T): T {
    const compAsAny = comp as any;
    const isProxy = compAsAny != null && compAsAny.getFrameworkComponentInstance != null;
    return isProxy ? compAsAny.getFrameworkComponentInstance() : comp;
}

@Bean('gridApi')
export class GridApi<TData = any> {

    @Optional('csvCreator') private csvCreator: ICsvCreator;
    @Optional('excelCreator') private excelCreator: IExcelCreator;
    @Autowired('rowRenderer') private rowRenderer: RowRenderer;
    @Autowired('navigationService') private navigationService: NavigationService;
    @Autowired('filterManager') private filterManager: FilterManager;
    @Autowired('columnModel') private columnModel: ColumnModel;
    @Autowired('selectionService') private selectionService: ISelectionService;
    @Autowired('gridOptionsService') private gos: GridOptionsService;
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
    @Autowired('menuService') private menuService: MenuService;
    @Autowired('valueCache') private valueCache: ValueCache;
    @Autowired('animationFrameService') private animationFrameService: AnimationFrameService;
    @Optional('statusBarService') private statusBarService: IStatusBarService;
    @Optional('chartService') private chartService: IChartService;
    @Optional('undoRedoService') private undoRedoService: UndoRedoService;
    @Optional('rowNodeBlockLoader') private rowNodeBlockLoader: RowNodeBlockLoader;
    @Optional('ssrmTransactionManager') private serverSideTransactionManager: IServerSideTransactionManager;
    @Autowired('ctrlsService') private ctrlsService: CtrlsService;
    @Autowired('overlayService') private overlayService: OverlayService;
    @Optional('sideBarService') private sideBarService?: ISideBarService;
    @Autowired('stateService') private stateService: StateService;
    @Autowired('expansionService') private expansionService: IExpansionService;
    @Autowired('apiEventService') private apiEventService: ApiEventService;
    @Autowired('frameworkOverrides') private frameworkOverrides: IFrameworkOverrides;

    private gridBodyCtrl: GridBodyCtrl;

    private clientSideRowModel: IClientSideRowModel;
    private infiniteRowModel: IInfiniteRowModel;

    private serverSideRowModel: IServerSideRowModel;

    private detailGridInfoMap: { [id: string]: DetailGridInfo | undefined; } = {};

    private destroyCalled = false;

    @PostConstruct
    private init(): void {
        switch (this.rowModel.getType()) {
            case 'clientSide':
                this.clientSideRowModel = this.rowModel as IClientSideRowModel;
                break;
            case 'infinite':
                this.infiniteRowModel = this.rowModel as IInfiniteRowModel;
                break;
            case 'serverSide':
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

    /** Used internally by grid. Not intended to be used by the client. Interface may change between releases. */
    public __getModel(): IRowModel {
        return this.rowModel;
    }

    /** Returns the `gridId` for the current grid as specified via the gridOptions property `gridId` or the auto assigned grid id if none was provided. */
    public getGridId(): string {
        return this.context.getGridId();
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
        if (ModuleRegistry.__assertRegistered(ModuleNames.CsvExportModule, 'api.getDataAsCsv', this.context.getGridId())) {
            return this.csvCreator.getDataAsCsv(params);
        }
    }

    /** Downloads a CSV export of the grid's data. */
    public exportDataAsCsv(params?: CsvExportParams): void {
        if (ModuleRegistry.__assertRegistered(ModuleNames.CsvExportModule, 'api.exportDataAsCSv', this.context.getGridId())) {
            this.csvCreator.exportDataAsCsv(params);
        }
    }

    private assertNotExcelMultiSheet(method: keyof GridApi, params?: ExcelExportParams): boolean {
        if (!ModuleRegistry.__assertRegistered(ModuleNames.ExcelExportModule, 'api.' + method, this.context.getGridId())) { return false }
        if (this.excelCreator.getFactoryMode() === ExcelFactoryMode.MULTI_SHEET) {
            console.warn("AG Grid: The Excel Exporter is currently on Multi Sheet mode. End that operation by calling 'api.getMultipleSheetAsExcel()' or 'api.exportMultipleSheetsAsExcel()'");
            return false;
        }
        return true;
    }

    /** Similar to `exportDataAsExcel`, except instead of downloading a file, it will return a [Blob](https://developer.mozilla.org/en-US/docs/Web/API/Blob) to be processed by the user. */
    public getDataAsExcel(params?: ExcelExportParams): string | Blob | undefined {
        if (this.assertNotExcelMultiSheet('getDataAsExcel', params)) {
            return this.excelCreator.getDataAsExcel(params);
        }
    }

    /** Downloads an Excel export of the grid's data. */
    public exportDataAsExcel(params?: ExcelExportParams): void {
        if (this.assertNotExcelMultiSheet('exportDataAsExcel', params)) {
            this.excelCreator.exportDataAsExcel(params);
        }
    }

    /** This is method to be used to get the grid's data as a sheet, that will later be exported either by `getMultipleSheetsAsExcel()` or `exportMultipleSheetsAsExcel()`. */
    public getSheetDataForExcel(params?: ExcelExportParams): string | undefined {
        if (!ModuleRegistry.__assertRegistered(ModuleNames.ExcelExportModule, 'api.getSheetDataForExcel', this.context.getGridId())) { return; }
        this.excelCreator.setFactoryMode(ExcelFactoryMode.MULTI_SHEET);

        return this.excelCreator.getSheetDataForExcel(params);
    }

    /** Similar to `exportMultipleSheetsAsExcel`, except instead of downloading a file, it will return a [Blob](https://developer.mozilla.org/en-US/docs/Web/API/Blob) to be processed by the user. */
    public getMultipleSheetsAsExcel(params: ExcelExportMultipleSheetParams): Blob | undefined {
        if (ModuleRegistry.__assertRegistered(ModuleNames.ExcelExportModule, 'api.getMultipleSheetsAsExcel', this.context.getGridId())) {
            return this.excelCreator.getMultipleSheetsAsExcel(params);
        }
    }

    /** Downloads an Excel export of multiple sheets in one file. */
    public exportMultipleSheetsAsExcel(params: ExcelExportMultipleSheetParams): void {
        if (ModuleRegistry.__assertRegistered(ModuleNames.ExcelExportModule, 'api.exportMultipleSheetsAsExcel', this.context.getGridId())) {
            this.excelCreator.exportMultipleSheetsAsExcel(params);
        }
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

    private logMissingRowModel(apiMethod: keyof GridApi, ...requiredRowModels: RowModelType[]) {
        console.error(`AG Grid: api.${apiMethod} can only be called when gridOptions.rowModelType is ${requiredRowModels.join(' or ')}`);
    }

    private logDeprecation(version: string, apiMethod: StartsWithGridApi, replacement: StartsWithGridApi, message?: string) {
        warnOnce(`Since ${version} api.${apiMethod} is deprecated. Please use ${replacement} instead. ${message}`);
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
    public getPinnedTopRow(index: number): IRowNode | undefined {
        return this.pinnedRowModel.getPinnedTopRow(index);
    }

    /** Gets the bottom pinned row with the specified index. */
    public getPinnedBottomRow(index: number): IRowNode | undefined {
        return this.pinnedRowModel.getPinnedBottomRow(index);
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

    /** Performs change detection on all cells, refreshing cells where required. */
    public refreshCells(params: RefreshCellsParams<TData> = {}): void {
        this.frameworkOverrides.wrapIncoming(() => this.rowRenderer.refreshCells(params));
    }

    /** Flash rows, columns or individual cells. */
    public flashCells(params: FlashCellsParams<TData> = {}): void {
        const warning = (prop: 'fade' | 'flash') => warnOnce(`Since v31.1 api.flashCells parameter '${prop}Delay' is deprecated. Please use '${prop}Duration' instead.`);
        if(exists(params.fadeDelay)){ warning('fade') }
        if(exists(params.flashDelay)){ warning('flash') }

        this.frameworkOverrides.wrapIncoming(() => this.rowRenderer.flashCells(params));
    }

    /** Remove row(s) from the DOM and recreate them again from scratch. */
    public redrawRows(params: RedrawRowsParams<TData> = {}): void {
        const rowNodes = params ? params.rowNodes : undefined;
        this.frameworkOverrides.wrapIncoming(() => this.rowRenderer.redrawRows(rowNodes));
    }

    /** Redraws the header. Useful if a column name changes, or something else that changes how the column header is displayed. */
    public refreshHeader() {
        this.frameworkOverrides.wrapIncoming(() => this.ctrlsService.getHeaderRowContainerCtrls().forEach(c => c.refresh()));
    }

    /** Returns `true` if any filter is set. This includes quick filter, column filter, external filter or advanced filter. */
    public isAnyFilterPresent(): boolean {
        return this.filterManager.isAnyFilterPresent();
    }

    /** Returns `true` if any column filter is set, otherwise `false`. */
    public isColumnFilterPresent(): boolean {
        return this.filterManager.isColumnFilterPresent() || this.filterManager.isAggregateFilterPresent();
    }

    /** Returns `true` if the Quick Filter is set, otherwise `false`. */
    public isQuickFilterPresent(): boolean {
        return this.filterManager.isQuickFilterPresent();
    }

    /**
     * Returns the row model inside the table.
     * From here you can see the original rows, rows after filter has been applied,
     * rows after aggregation has been applied, and the final set of 'to be displayed' rows.
     *
     * @deprecated As of v31.1, getModel() is deprecated and will not be available in future versions.
     * Please use the appropriate grid API methods instead
     */
    public getModel(): IRowModel {
        warnOnce('Since v31.1 getModel() is deprecated. Please use the appropriate grid API methods instead.');
        return this.rowModel;
    }

    /** Expand or collapse a specific row node, optionally expanding/collapsing all of its parent nodes. */
    public setRowNodeExpanded(rowNode: IRowNode, expanded: boolean, expandParents?: boolean): void {
        this.expansionService.setRowNodeExpanded(rowNode, expanded, expandParents);
    }

    /**
     * Informs the grid that row group expanded state has changed and it needs to rerender the group nodes.
     * Typically called after updating the row node expanded state explicitly, i.e `rowNode.expanded = false`,
     * across multiple groups and you want to update the grid view in a single rerender instead of on every group change.
     */
    public onGroupExpandedOrCollapsed() {
        if (missing(this.clientSideRowModel)) {
            this.logMissingRowModel('onGroupExpandedOrCollapsed', 'clientSide');
            return;
        }
        this.expansionService.onGroupExpandedOrCollapsed();
    }

    /**
     * Refresh the Client-Side Row Model, executing the grouping, filtering and sorting again.
     * Optionally provide the step you wish the refresh to apply from. Defaults to `everything`.
     */
    public refreshClientSideRowModel(step?: ClientSideRowModelStep): any {
        if (missing(this.clientSideRowModel)) {
            this.logMissingRowModel('refreshClientSideRowModel', 'clientSide');
            return;
        }

        this.clientSideRowModel.refreshModel(step);
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
    public getRowNode(id: string): IRowNode<TData> | undefined {
        return this.rowModel.getRowNode(id);
    }

    /**
     * Gets the sizes that various UI elements will be rendered at with the current theme.
     * If you override the row or header height using `gridOptions`, the override value you provided will be returned.
     */
    public getSizesForCurrentTheme() {
        return {
            rowHeight: this.gos.getRowHeightAsNumber(),
            headerHeight: this.columnModel.getHeaderHeight()
        };
    }

    /** Expand all groups. */
    public expandAll() {
        if (this.clientSideRowModel || this.serverSideRowModel) {
            this.expansionService.expandAll(true);
        } else {
            this.logMissingRowModel('expandAll', 'clientSide', 'serverSide');
        }
    }

    /** Collapse all groups. */
    public collapseAll() {
        if (this.clientSideRowModel || this.serverSideRowModel) {
            this.expansionService.expandAll(false);
        } else {
            this.logMissingRowModel('collapseAll', 'clientSide', 'serverSide');
        }
    }

    /**
     * Registers a callback to a virtual row.
     * A virtual row is a row that is visually rendered on the screen (rows that are not visible because of the scroll position are not rendered).
     * Unlike normal events, you do not need to unregister rendered row listeners.
     * When the rendered row is removed from the grid, all associated rendered row listeners will also be removed.
     * listen for this event if your `cellRenderer` needs to do cleanup when the row no longer exists.
     */
    public addRenderedRowListener(eventName: string, rowIndex: number, callback: Function) {
        this.rowRenderer.addRenderedRowListener(eventName, rowIndex, callback as any);
    }

    /** Get the current Quick Filter text from the grid, or `undefined` if none is set. */
    public getQuickFilter(): string | undefined {
        return this.gos.get('quickFilterText');
    }


    /** Get the state of the Advanced Filter. Used for saving Advanced Filter state */
    public getAdvancedFilterModel(): AdvancedFilterModel | null {
        if (ModuleRegistry.__assertRegistered(ModuleNames.AdvancedFilterModule, 'api.getAdvancedFilterModel', this.context.getGridId())) {
            return this.filterManager.getAdvancedFilterModel();
        }
        return null;
    }

    /** Set the state of the Advanced Filter. Used for restoring Advanced Filter state */
    public setAdvancedFilterModel(advancedFilterModel: AdvancedFilterModel | null): void {
        this.filterManager.setAdvancedFilterModel(advancedFilterModel);
    }

    /** Open the Advanced Filter Builder dialog (if enabled). */
    public showAdvancedFilterBuilder(): void {
        if (ModuleRegistry.__assertRegistered(ModuleNames.AdvancedFilterModule, 'api.setAdvancedFilterModel', this.context.getGridId())) {
            this.filterManager.showAdvancedFilterBuilder('api');
        }
    }

    /**
     * Set all of the provided nodes selection state to the provided value.
     */
    public setNodesSelected(params: { nodes: IRowNode[], newValue: boolean, source?: SelectionEventSourceType }) {
        const allNodesValid = params.nodes.every(node => {
            if (node.rowPinned) {
                console.warn('AG Grid: cannot select pinned rows');
                return false;
            }

            if (node.id === undefined) {
                console.warn('AG Grid: cannot select node until id for node is known');
                return false;
            }
            return true;
        });

        if (!allNodesValid) {
            return;
        }


        const { nodes, source, newValue } = params;
        const nodesAsRowNode = nodes as RowNode[];
        this.selectionService.setNodesSelected({ nodes: nodesAsRowNode, source: source ?? 'api', newValue });
    }


    /**
     * Select all rows, regardless of filtering and rows that are not visible due to grouping being enabled and their groups not expanded.
     * @param source Source property that will appear in the `selectionChanged` event, defaults to `'apiSelectAll'`
     */
    public selectAll(source: SelectionEventSourceType = 'apiSelectAll') {
        this.selectionService.selectAllRowNodes({ source });
    }

    /**
     * Clear all row selections, regardless of filtering.
     * @param source Source property that will appear in the `selectionChanged` event, defaults to `'apiSelectAll'`
     */
    public deselectAll(source: SelectionEventSourceType = 'apiSelectAll') {
        this.selectionService.deselectAllRowNodes({ source });
    }

    /**
     * Select all filtered rows.
     * @param source Source property that will appear in the `selectionChanged` event, defaults to `'apiSelectAllFiltered'`
     */
    public selectAllFiltered(source: SelectionEventSourceType = 'apiSelectAllFiltered') {
        this.selectionService.selectAllRowNodes({ source, justFiltered: true });
    }

    /**
     * Clear all filtered selections.
     * @param source Source property that will appear in the `selectionChanged` event, defaults to `'apiSelectAllFiltered'`
     */
    public deselectAllFiltered(source: SelectionEventSourceType = 'apiSelectAllFiltered') {
        this.selectionService.deselectAllRowNodes({ source, justFiltered: true });
    }

    /**
     * Returns an object containing rules matching the selected rows in the SSRM.
     * 
     * If `groupSelectsChildren=false` the returned object will be flat, and will conform to IServerSideSelectionState.
     * If `groupSelectsChildren=true` the returned object will be hierarchical, and will conform to IServerSideGroupSelectionState.
     */
    public getServerSideSelectionState(): IServerSideSelectionState | IServerSideGroupSelectionState | null {
        if (missing(this.serverSideRowModel)) {
            this.logMissingRowModel('getServerSideSelectionState', 'serverSide');
            return null;
        }

        return this.selectionService.getSelectionState() as IServerSideSelectionState | IServerSideGroupSelectionState | null;
    }

    /**
     * Set the rules matching the selected rows in the SSRM.
     * 
     * If `groupSelectsChildren=false` the param will be flat, and should conform to IServerSideSelectionState.
     * If `groupSelectsChildren=true` the param will be hierarchical, and should conform to IServerSideGroupSelectionState.
     */
    public setServerSideSelectionState(state: IServerSideSelectionState | IServerSideGroupSelectionState) {
        if (missing(this.serverSideRowModel)) {
            this.logMissingRowModel('setServerSideSelectionState', 'serverSide');
            return;
        }

        this.selectionService.setSelectionState(state, 'api');
    }

    /**
     * Select all rows on the current page.
     * @param source Source property that will appear in the `selectionChanged` event, defaults to `'apiSelectAllCurrentPage'`
     */
    public selectAllOnCurrentPage(source: SelectionEventSourceType = 'apiSelectAllCurrentPage') {
        this.selectionService.selectAllRowNodes({ source, justCurrentPage: true });
    }

    /**
     * Clear all filtered on the current page.
     * @param source Source property that will appear in the `selectionChanged` event, defaults to `'apiSelectAllCurrentPage'`
     */
    public deselectAllOnCurrentPage(source: SelectionEventSourceType = 'apiSelectAllCurrentPage') {
        this.selectionService.deselectAllRowNodes({ source, justCurrentPage: true });
    }

    /** Show the 'loading' overlay. */
    public showLoadingOverlay(): void {
        this.overlayService.showLoadingOverlay();
    }

    /** Show the 'no rows' overlay. */
    public showNoRowsOverlay(): void {
        this.overlayService.showNoRowsOverlay();
    }

    /** Hides the overlay if showing. */
    public hideOverlay(): void {
        this.overlayService.hideOverlay();
    }

    /**
     * Returns an unsorted list of selected nodes.
     * Getting the underlying node (rather than the data) is useful when working with tree / aggregated data,
     * as the node can be traversed.
     */
    public getSelectedNodes(): IRowNode<TData>[] {
        return this.selectionService.getSelectedNodes();
    }
    /** Returns an unsorted list of selected rows (i.e. row data that you provided). */
    public getSelectedRows(): TData[] {
        return this.selectionService.getSelectedRows();
    }

    /**
     * Returns a list of all selected nodes at 'best cost', a feature to be used with groups / trees.
     * If a group has all its children selected, then the group appears in the result, but not the children.
     * Designed for use with `'children'` as the group selection type, where groups don't actually appear in the selection normally.
     */
    public getBestCostNodeSelection(): IRowNode<TData>[] | undefined {
        if (missing(this.clientSideRowModel)) {
            this.logMissingRowModel('getBestCostNodeSelection', 'clientSide');
            return;
        }
        return this.selectionService.getBestCostNodeSelection();
    }

    /** Retrieve rendered nodes. Due to virtualisation this will contain only the current visible rows and those in the buffer. */
    public getRenderedNodes(): IRowNode<TData>[] {
        return this.rowRenderer.getRenderedNodes();
    }

    /**
     *  Ensures the column is visible by scrolling the table if needed.
     *
     * This will have no effect before the firstDataRendered event has fired.
     *
     * @param key - The column to ensure visible
     * @param position - Where the column will be positioned.
     * - `auto` - Scrolls the minimum amount to make sure the column is visible.
     * - `start` - Scrolls the column to the start of the viewport.
     * - `middle` - Scrolls the column to the middle of the viewport.
     * - `end` - Scrolls the column to the end of the viewport.
    */
    public ensureColumnVisible(key: string | Column, position: 'auto' | 'start' | 'middle' | 'end' = 'auto') {
        this.frameworkOverrides.wrapIncoming(() => this.gridBodyCtrl.getScrollFeature().ensureColumnVisible(key, position), 'ensureVisible');
    }

    /**
     * Vertically scrolls the grid until the provided row index is inside the visible viewport.
     * If a position is provided, the grid will attempt to scroll until the row is at the given position within the viewport.
     * This will have no effect before the firstDataRendered event has fired.
     */
    public ensureIndexVisible(index: number, position?: 'top' | 'bottom' | 'middle' | null) {
        this.frameworkOverrides.wrapIncoming(() => this.gridBodyCtrl.getScrollFeature().ensureIndexVisible(index, position), 'ensureVisible');
    }

    /**
     * Vertically scrolls the grid until the provided row (or a row matching the provided comparator) is inside the visible viewport.
     * If a position is provided, the grid will attempt to scroll until the row is at the given position within the viewport.
     * This will have no effect before the firstDataRendered event has fired.
     */
    public ensureNodeVisible(
        nodeSelector: TData | IRowNode<TData> | ((row: IRowNode<TData>) => boolean),
        position: 'top' | 'bottom' | 'middle' | null = null
    ) {
        this.frameworkOverrides.wrapIncoming(() => this.gridBodyCtrl.getScrollFeature().ensureNodeVisible(nodeSelector, position), 'ensureVisible');
    }

    /**
     * Similar to `forEachNode`, except lists all the leaf nodes.
     * This effectively goes through all the data that you provided to the grid before the grid performed any grouping.
     * If using tree data, goes through all the nodes for the data you provided, including nodes that have children,
     * but excluding groups the grid created where gaps were missing in the hierarchy.
     */
    public forEachLeafNode(callback: (rowNode: IRowNode<TData>) => void) {
        if (missing(this.clientSideRowModel)) {
            this.logMissingRowModel('forEachLeafNode', 'clientSide');
            return;
        }
        this.clientSideRowModel.forEachLeafNode(callback);
    }

    /**
     * Iterates through each node (row) in the grid and calls the callback for each node.
     * This works similar to the `forEach` method on a JavaScript array.
     * This is called for every node, ignoring any filtering or sorting applied within the grid.
     * If using the Infinite Row Model, then this gets called for each page loaded in the page cache.
     */
    public forEachNode(callback: (rowNode: IRowNode<TData>, index: number) => void, includeFooterNodes?: boolean) {
        this.rowModel.forEachNode(callback, includeFooterNodes);
    }

    /** Similar to `forEachNode`, except skips any filtered out data. */
    public forEachNodeAfterFilter(callback: (rowNode: IRowNode<TData>, index: number) => void) {
        if (missing(this.clientSideRowModel)) {
            this.logMissingRowModel('forEachNodeAfterFilter', 'clientSide');
            return;
        }
        this.clientSideRowModel.forEachNodeAfterFilter(callback);
    }

    /** Similar to `forEachNodeAfterFilter`, except the callbacks are called in the order the rows are displayed in the grid. */
    public forEachNodeAfterFilterAndSort(callback: (rowNode: IRowNode<TData>, index: number) => void) {
        if (missing(this.clientSideRowModel)) {
            this.logMissingRowModel('forEachNodeAfterFilterAndSort', 'clientSide');
            return;
        }
        this.clientSideRowModel.forEachNodeAfterFilterAndSort(callback);
    }

    /**
     * @deprecated v31.1 To get/set individual filter models, use `getColumnFilterModel` or `setColumnFilterModel` instead.
     * To get hold of the filter instance, use `getColumnFilterInstance` which returns the instance asynchronously.
     */
    public getFilterInstance<TFilter extends IFilter>(key: string | Column, callback?: (filter: TFilter | null) => void): TFilter | null | undefined {
        warnOnce(`'getFilterInstance' is deprecated. To get/set individual filter models, use 'getColumnFilterModel' or 'setColumnFilterModel' instead. To get hold of the filter instance, use 'getColumnFilterInstance' which returns the instance asynchronously.`);
        return this.filterManager.getFilterInstance(key, callback);
    }

    /**
     * Returns the filter component instance for a column.
     * For getting/setting models for individual column filters, use `getColumnFilterModel` and `setColumnFilterModel` instead of this.
     * `key` can be a column ID or a `Column` object.
     */
    public getColumnFilterInstance<TFilter extends IFilter>(key: string | Column): Promise<TFilter | null | undefined> {
        return this.filterManager.getColumnFilterInstance(key);
    }

    /** Destroys a filter. Useful to force a particular filter to be created from scratch again. */
    public destroyFilter(key: string | Column) {
        const column = this.columnModel.getPrimaryColumn(key);
        if (column) {
            return this.filterManager.destroyFilter(column, 'api');
        }
    }

    /** Gets the status panel instance corresponding to the supplied `id`. */
    public getStatusPanel<TStatusPanel = IStatusPanel>(key: string): TStatusPanel | undefined {
        if (!ModuleRegistry.__assertRegistered(ModuleNames.StatusBarModule, 'api.getStatusPanel', this.context.getGridId())) { return; }
        const comp = this.statusBarService.getStatusPanel(key);
        return unwrapUserComp(comp) as any;
    }

    public getColumnDef<TValue = any>(key: string | Column<TValue>): ColDef<TData, TValue> | null {
        const column = this.columnModel.getPrimaryColumn(key);
        if (column) {
            return column.getColDef();
        }
        return null;
    }

    /**
     * Returns the current column definitions.
    */
    public getColumnDefs(): (ColDef<TData> | ColGroupDef<TData>)[] | undefined { return this.columnModel.getColumnDefs(); }

    /**
     * Informs the grid that a filter has changed. This is typically called after a filter change through one of the filter APIs.
     * @param source The source of the filter change event. If not specified defaults to `'api'`.
     */
    public onFilterChanged(source: FilterChangedEventSourceType = 'api') {
        this.filterManager.onFilterChanged({ source });
    }

    /**
     * Gets the grid to act as if the sort was changed.
     * Useful if you update some values and want to get the grid to reorder them according to the new values.
     */
    public onSortChanged() {
        this.sortController.onSortChanged('api');
    }

    /**
     * Sets the state of all the column filters. Provide it with what you get from `getFilterModel()` to restore filter state.
     * If inferring cell data types, and row data is provided asynchronously and is yet to be set,
     * the filter model will be applied asynchronously after row data is added.
     * To always perform this synchronously, set `cellDataType = false` on the default column definition,
     * or provide cell data types for every column.
     */
    public setFilterModel(model: FilterModel | null): void {
        this.frameworkOverrides.wrapIncoming(() => this.filterManager.setFilterModel(model));
    }

    /** Gets the current state of all the column filters. Used for saving filter state. */
    public getFilterModel(): FilterModel {
        return this.filterManager.getFilterModel();
    }

    /**
     * Gets the current filter model for the specified column.
     * Will return `null` if no active filter.
     */
    public getColumnFilterModel<TModel>(column: string | Column): TModel | null {
        return this.filterManager.getColumnFilterModel(column);
    }

    /**
     * Sets the filter model for the specified column.
     * Setting a `model` of `null` will reset the filter (make inactive).
     * Must wait on the response before calling `api.onFilterChanged()`.
     */
    public setColumnFilterModel<TModel>(column: string | Column, model: TModel | null): Promise<void> {
        return this.filterManager.setColumnFilterModel(column, model);
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
    public setFocusedCell(rowIndex: number, colKey: string | Column, rowPinned?: RowPinnedType) {
        this.focusService.setFocusedCell({ rowIndex, column: colKey, rowPinned, forceBrowserFocus: true });
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

    private assertSideBarLoaded(apiMethod: keyof GridApi): boolean {
        return ModuleRegistry.__assertRegistered(ModuleNames.SideBarModule, 'api.' + apiMethod, this.context.getGridId());
    }

    /** Returns `true` if the side bar is visible. */
    public isSideBarVisible(): boolean {
        return this.assertSideBarLoaded('isSideBarVisible') && this.sideBarService!.getSideBarComp().isDisplayed();
    }

    /** Show/hide the entire side bar, including any visible panel and the tab buttons. */
    public setSideBarVisible(show: boolean) {
        if (this.assertSideBarLoaded('setSideBarVisible')) {
            this.sideBarService!.getSideBarComp().setDisplayed(show);
        }
    }

    /** Sets the side bar position relative to the grid. Possible values are `'left'` or `'right'`. */
    public setSideBarPosition(position: 'left' | 'right') {
        if (this.assertSideBarLoaded('setSideBarPosition')) {
            this.sideBarService!.getSideBarComp().setSideBarPosition(position);
        }
    }

    /** Opens a particular tool panel. Provide the ID of the tool panel to open. */
    public openToolPanel(key: string) {
        if (this.assertSideBarLoaded('openToolPanel')) {
            this.sideBarService!.getSideBarComp().openToolPanel(key, 'api');
        }
    }

    /** Closes the currently open tool panel (if any). */
    public closeToolPanel() {
        if (this.assertSideBarLoaded('closeToolPanel')) {
            this.sideBarService!.getSideBarComp().close('api');
        }
    }

    /** Returns the ID of the currently shown tool panel if any, otherwise `null`. */
    public getOpenedToolPanel(): string | null {
        if (this.assertSideBarLoaded('getOpenedToolPanel')) {
            return this.sideBarService!.getSideBarComp().openedItem()
        }
        return null;
    }

    /** Force refresh all tool panels by calling their `refresh` method. */
    public refreshToolPanel(): void {
        if (this.assertSideBarLoaded('refreshToolPanel')) {
            this.sideBarService!.getSideBarComp().refresh();
        }
    }

    /** Returns `true` if the tool panel is showing, otherwise `false`. */
    public isToolPanelShowing(): boolean {
        return this.assertSideBarLoaded('isToolPanelShowing') && this.sideBarService!.getSideBarComp().isToolPanelShowing();
    }

    public getToolPanelInstance(id: 'columns'): IColumnToolPanel | undefined;
    public getToolPanelInstance(id: 'filters'): IFiltersToolPanel | undefined;
    // This override is a duplicate but is required to make the general override public.
    public getToolPanelInstance<TToolPanel = IToolPanel>(id: string): TToolPanel | undefined;
    /** Gets the tool panel instance corresponding to the supplied `id`. */
    public getToolPanelInstance<TToolPanel = IToolPanel>(id: string): TToolPanel | undefined {
        if (this.assertSideBarLoaded('getToolPanelInstance')) {
            const comp = this.sideBarService!.getSideBarComp().getToolPanelInstance(id);
            return unwrapUserComp(comp) as any;
        }
    }

    /** Returns the current side bar configuration. If a shortcut was used, returns the detailed long form. */
    public getSideBar(): SideBarDef | undefined {
        if (this.assertSideBarLoaded('getSideBar')) {
            return this.sideBarService!.getSideBarComp().getDef();
        }
        return undefined;
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

    /**
     * Sets the `rowCount` and `maxRowFound` properties.
     * The second parameter, `maxRowFound`, is optional and if left out, only `rowCount` is set.
     * Set `rowCount` to adjust the height of the vertical scroll.
     * Set `maxRowFound` to enable / disable searching for more rows.
     * Use this method if you add or remove rows into the dataset and need to reset the number of rows or instruct the grid that the entire row count is no longer known.
     */
    public setRowCount(rowCount: number, maxRowFound?: boolean): void {
        if (this.serverSideRowModel) {
            if (this.columnModel.isRowGroupEmpty()) {
                this.serverSideRowModel.setRowCount(rowCount, maxRowFound);
                return;
            }
            console.error('AG Grid: setRowCount cannot be used while using row grouping.');
            return;
        }

        if (this.infiniteRowModel) {
            this.infiniteRowModel.setRowCount(rowCount, maxRowFound);
            return;
        }

        this.logMissingRowModel('setRowCount', 'infinite', 'serverSide');
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
    public getValue<TValue = any>(colKey: string | Column<TValue>, rowNode: IRowNode): TValue | null | undefined {
        let column = this.columnModel.getPrimaryColumn(colKey);
        if (missing(column)) {
            column = this.columnModel.getGridColumn(colKey);
        }
        if (missing(column)) {
            return null;
        }
        return this.valueService.getValue(column, rowNode);
    }

    /**
     * Add an event listener for the specified `eventType`.
     * Works similar to `addEventListener` for a browser DOM element.
     * Listeners will be automatically removed when the grid is destroyed.
     */
    public addEventListener(eventType: string, listener: Function): void {
        this.apiEventService.addEventListener(eventType, listener as AgEventListener);
    }

    /**
     * Add an event listener for all event types coming from the grid.
     * Listeners will be automatically removed when the grid is destroyed.
     */
    public addGlobalListener(listener: Function): void {
        this.apiEventService.addGlobalListener(listener as AgGlobalEventListener);
    }

    /** Remove an event listener. */
    public removeEventListener(eventType: string, listener: Function): void {
        this.apiEventService.removeEventListener(eventType, listener as AgEventListener);
    }

    /** Remove a global event listener. */
    public removeGlobalListener(listener: Function): void {
        this.apiEventService.removeGlobalListener(listener as AgGlobalEventListener);
    }

    public dispatchEvent(event: AgEvent): void {
        this.eventService.dispatchEvent(event);
    }

    /** Will destroy the grid and release resources. If you are using a framework you do not need to call this, as the grid links in with the framework lifecycle. However if you are using Web Components or native JavaScript, you do need to call this, to avoid a memory leak in your application. */
    public destroy(): void {

        // Get framework link before this is destroyed
        const preDestroyLink = `See ${this.frameworkOverrides.getDocLink('grid-lifecycle/#grid-pre-destroyed')}`;

        // this is needed as GridAPI is a bean, and GridAPI.destroy() is called as part
        // of context.destroy(). so we need to stop the infinite loop.
        if (this.destroyCalled) { return; }

        const event: WithoutGridCommon<GridPreDestroyedEvent<TData>> = {
            type: Events.EVENT_GRID_PRE_DESTROYED,
            state: this.getState()
        };
        this.dispatchEvent(event);

        // Set after pre-destroy so user can still use the api in pre-destroy event and it is not marked as destroyed yet.
        this.destroyCalled = true;

        // destroy the UI first (as they use the services)
        const gridCtrl = this.ctrlsService.getGridCtrl();
        if (gridCtrl) {
            gridCtrl.destroyGridUi();
        }

        // destroy the services
        this.context.destroy();

        // some users were raising support issues with regards memory leaks. the problem was the customers applications
        // were keeping references to the API. trying to educate them all would be difficult, easier to just remove
        // all references in the API so at least the core grid can be garbage collected.
        removeAllReferences<GridApi>(this, ['isDestroyed'], preDestroyLink);
    }

    /** Returns `true` if the grid has been destroyed. */
    public isDestroyed(): boolean {
        return this.destroyCalled;
    }

    /** Reset the Quick Filter cache text on every rowNode. */
    public resetQuickFilter(): void {
        this.filterManager.resetQuickFilterCache();
    }

    /** Returns the list of selected cell ranges. */
    public getCellRanges(): CellRange[] | null {
        if (this.rangeService) {
            return this.rangeService.getCellRanges();
        }

        ModuleRegistry.__assertRegistered(ModuleNames.RangeSelectionModule, 'api.getCellRanges', this.context.getGridId());
        return null;
    }

    /** Adds the provided cell range to the selected ranges. */
    public addCellRange(params: CellRangeParams): void {
        if (this.rangeService) {
            this.rangeService.addCellRange(params);
            return;
        }
        ModuleRegistry.__assertRegistered(ModuleNames.RangeSelectionModule, 'api.addCellRange', this.context.getGridId());
    }

    /** Clears the selected ranges. */
    public clearRangeSelection(): void {
        if (this.rangeService) {
            this.rangeService.removeAllCellRanges();
        }
        ModuleRegistry.__assertRegistered(ModuleNames.RangeSelectionModule, 'gridApi.clearRangeSelection', this.context.getGridId());
    }
    /** Reverts the last cell edit. */
    public undoCellEditing(): void {
        this.undoRedoService.undo('api');
    }
    /** Re-applies the most recently undone cell edit. */
    public redoCellEditing(): void {
        this.undoRedoService.redo('api');
    }

    /** Returns current number of available cell edit undo operations. */
    public getCurrentUndoSize(): number {
        return this.undoRedoService.getCurrentUndoStackSize();
    }
    /** Returns current number of available cell edit redo operations. */
    public getCurrentRedoSize(): number {
        return this.undoRedoService.getCurrentRedoStackSize();
    }

    private assertChart<T>(methodName: string ,func: () => T): T | undefined {
        if (ModuleRegistry.__assertRegistered(ModuleNames.GridChartsModule, 'api.' + methodName, this.context.getGridId())) {
            return this.frameworkOverrides.wrapIncoming(() => func());
        }
    }

    /** Returns a list of models with information about the charts that are currently rendered from the grid. */
    public getChartModels(): ChartModel[] | undefined {
        return this.assertChart('getChartModels', () => this.chartService.getChartModels());
    }

    /** Returns the `ChartRef` using the supplied `chartId`. */
    public getChartRef(chartId: string): ChartRef | undefined {
        return this.assertChart('getChartRef', () => this.chartService.getChartRef(chartId));
    }

    /** Returns a base64-encoded image data URL for the referenced chartId. */
    public getChartImageDataURL(params: GetChartImageDataUrlParams): string | undefined {
        return this.assertChart('getChartImageDataURL', () => this.chartService.getChartImageDataURL(params));
    }

    /** Starts a browser-based image download for the referenced chartId. */
    public downloadChart(params: ChartDownloadParams) {
        return this.assertChart('downloadChart', () => this.chartService.downloadChart(params));
    }

    /** Open the Chart Tool Panel. */
    public openChartToolPanel(params: OpenChartToolPanelParams) {
        return this.assertChart('openChartToolPanel', () => this.chartService.openChartToolPanel(params));
    }

    /** Close the Chart Tool Panel. */
    public closeChartToolPanel(params: CloseChartToolPanelParams) {
        return this.assertChart('closeChartToolPanel', () => this.chartService.closeChartToolPanel(params.chartId));
    }

    /** Used to programmatically create charts from a range. */
    public createRangeChart(params: CreateRangeChartParams): ChartRef | undefined {
        return this.assertChart('createRangeChart', () => this.chartService.createRangeChart(params));
    }

    /** Used to programmatically create pivot charts from a grid. */
    public createPivotChart(params: CreatePivotChartParams): ChartRef | undefined {
        return this.assertChart('createPivotChart', () => this.chartService.createPivotChart(params));
    }

    /** Used to programmatically create cross filter charts from a range. */
    public createCrossFilterChart(params: CreateCrossFilterChartParams): ChartRef | undefined {
        return this.assertChart('createCrossFilterChart', () => this.chartService.createCrossFilterChart(params));
    }

    /** Used to programmatically update a chart. */
    public updateChart(params: UpdateChartParams): void {
        return this.assertChart('updateChart', () => this.chartService.updateChart(params));
    }

    /** Restores a chart using the `ChartModel` that was previously obtained from `getChartModels()`. */
    public restoreChart(chartModel: ChartModel, chartContainer?: HTMLElement): ChartRef | undefined {
        return this.assertChart('restoreChart', () => this.chartService.restoreChart(chartModel, chartContainer));
    }

    private assertClipboard<T>(methodName: string, func: () => T): void {
        if (ModuleRegistry.__assertRegistered(ModuleNames.ClipboardModule, 'api' + methodName, this.context.getGridId())) {
            func();
        }
    }
    /** Copies data to clipboard by following the same rules as pressing Ctrl+C. */
    public copyToClipboard(params?: IClipboardCopyParams) {
        this.assertClipboard('copyToClipboard', () => this.clipboardService.copyToClipboard(params));
    }

    /** Cuts data to clipboard by following the same rules as pressing Ctrl+X. */
    public cutToClipboard(params?: IClipboardCopyParams) {
        this.assertClipboard('cutToClipboard', () => this.clipboardService.cutToClipboard(params));
    }

    /** Copies the selected rows to the clipboard. */
    public copySelectedRowsToClipboard(params?: IClipboardCopyRowsParams): void {
        this.assertClipboard('copySelectedRowsToClipboard', () => this.clipboardService.copySelectedRowsToClipboard(params));
    }

    /** Copies the selected ranges to the clipboard. */
    public copySelectedRangeToClipboard(params?: IClipboardCopyParams): void {
        this.assertClipboard('copySelectedRangeToClipboard', () => this.clipboardService.copySelectedRangeToClipboard(params));
    }

    /** Copies the selected range down, similar to `Ctrl + D` in Excel. */
    public copySelectedRangeDown(): void {
        this.assertClipboard('copySelectedRangeDown', () => this.clipboardService.copyRangeDown());
    }

    /** Pastes the data from the Clipboard into the focused cell of the grid. If no grid cell is focused, calling this method has no effect. */
    public pasteFromClipboard(): void {
        this.assertClipboard('pasteFromClipboard', () => this.clipboardService.pasteFromClipboard());
    }

    /** @deprecated v31.1 Use `IHeaderParams.showColumnMenu` within a header component, or `api.showColumnMenu` elsewhere. */
    public showColumnMenuAfterButtonClick(colKey: string | Column, buttonElement: HTMLElement): void {
        warnOnce(`'showColumnMenuAfterButtonClick' is deprecated. Use 'IHeaderParams.showColumnMenu' within a header component, or 'api.showColumnMenu' elsewhere.`);
        // use grid column so works with pivot mode
        const column = this.columnModel.getGridColumn(colKey)!;
        this.menuService.showColumnMenu({
            column,
            buttonElement,
            positionBy: 'button'
        });
    }

    /** @deprecated v31.1 Use `IHeaderParams.showColumnMenuAfterMouseClick` within a header component, or `api.showColumnMenu` elsewhere. */
    public showColumnMenuAfterMouseClick(colKey: string | Column, mouseEvent: MouseEvent | Touch): void {
        warnOnce(`'showColumnMenuAfterMouseClick' is deprecated. Use 'IHeaderParams.showColumnMenuAfterMouseClick' within a header component, or 'api.showColumnMenu' elsewhere.`);
        // use grid column so works with pivot mode
        let column = this.columnModel.getGridColumn(colKey);
        if (!column) {
            column = this.columnModel.getPrimaryColumn(colKey);
        }
        if (!column) {
            console.error(`AG Grid: column '${colKey}' not found`);
            return;
        }
        this.menuService.showColumnMenu({
            column,
            mouseEvent,
            positionBy: 'mouse'
        });
    }

    /** Show the column chooser. */
    public showColumnChooser(params?: ColumnChooserParams): void {
        this.menuService.showColumnChooser({ chooserParams: params });
    }

    /** Show the filter for the provided column. */
    public showColumnFilter(colKey: string | Column): void {
        const column = this.columnModel.getGridColumn(colKey);
        if (!column) {
            console.error(`AG Grid: column '${colKey}' not found`);
            return;
        }
        this.menuService.showFilterMenu({
            column,
            containerType: 'columnFilter',
            positionBy: 'auto'
        });
    }

    /** Show the column menu for the provided column. */
    public showColumnMenu(colKey: string | Column): void {
        const column = this.columnModel.getGridColumn(colKey);
        if (!column) {
            console.error(`AG Grid: column '${colKey}' not found`);
            return;
        }
        this.menuService.showColumnMenu({
            column,
            positionBy: 'auto'
        });
    }

    /** Hides any visible context menu or column menu. */
    public hidePopupMenu(): void {
        this.menuService.hidePopupMenu();
    }

    /** Hide the column chooser if visible. */
    public hideColumnChooser(): void {
        this.menuService.hideColumnChooser();
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
    public getCellRendererInstances(params: GetCellRendererInstancesParams<TData> = {}): ICellRenderer[] {
        const res = this.rowRenderer.getCellRendererInstances(params);
        const unwrapped = res.map(unwrapUserComp);
        return unwrapped;
    }

    /** Returns the list of active cell editor instances. Optionally provide parameters to restrict to certain columns / row nodes. */
    public getCellEditorInstances(params: GetCellEditorInstancesParams<TData> = {}): ICellEditor[] {
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
            this.ensureIndexVisible(params.rowIndex);
        }

        this.ensureColumnVisible(params.colKey);

        const cell = this.navigationService.getCellByPosition(cellPosition);
        if (!cell) { return; }
        if (!this.focusService.isCellFocused(cellPosition)) {
            this.focusService.setFocusedCell(cellPosition);
        }
        cell.startRowOrCellEdit(params.key);
    }

    /** @deprecated v31.1 addAggFunc(key, func) is  deprecated, please use addAggFuncs({ key: func }) instead. */
    public addAggFunc(key: string, aggFunc: IAggFunc): void {
        this.logDeprecation('v31.1', 'addAggFunc(key, func)', 'addAggFuncs({ key: func })');
        if (this.aggFuncService) {
            this.aggFuncService.addAggFuncs({ key: aggFunc });
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
            this.logMissingRowModel('applyServerSideTransaction', 'serverSide');
            return;
        }
        return this.serverSideTransactionManager.applyTransaction(transaction);
    }

    /** Batch apply transactions to the server side row model. */
    public applyServerSideTransactionAsync(transaction: ServerSideTransaction, callback?: (res: ServerSideTransactionResult) => void): void {
        if (!this.serverSideTransactionManager) {
            this.logMissingRowModel('applyServerSideTransactionAsync', 'serverSide');
            return;
        }
        return this.serverSideTransactionManager.applyTransactionAsync(transaction, callback);
    }

    /**
     * Applies row data to a server side store.
     * New rows will overwrite rows at the same index in the same way as if provided by a datasource success callback.
    */
    public applyServerSideRowData(params: { successParams: LoadSuccessParams, route?: string[], startRow?: number }) {
        const startRow = params.startRow ?? 0;
        const route = params.route ?? [];
        if (startRow < 0) {
            console.warn(`AG Grid: invalid value ${params.startRow} for startRow, the value should be >= 0`);
            return;
        }

        if (this.serverSideRowModel) {
            this.serverSideRowModel.applyRowData(params.successParams, startRow, route);
        } else {
            this.logMissingRowModel('setServerSideDatasource', 'serverSide');
        }
    }

    /** Gets all failed server side loads to retry. */
    public retryServerSideLoads(): void {
        if (!this.serverSideRowModel) {
            this.logMissingRowModel('retryServerSideLoads', 'serverSide');
            return;
        }
        this.serverSideRowModel.retryLoads();
    }

    public flushServerSideAsyncTransactions(): void {
        if (!this.serverSideTransactionManager) {
            this.logMissingRowModel('flushServerSideAsyncTransactions', 'serverSide');
            return;
        }
        return this.serverSideTransactionManager.flushAsyncTransactions();
    }

    /** Update row data. Pass a transaction object with lists for `add`, `remove` and `update`. */
    public applyTransaction(rowDataTransaction: RowDataTransaction<TData>): RowNodeTransaction<TData> | null | undefined {
        if (!this.clientSideRowModel) {
            this.logMissingRowModel('applyTransaction', 'clientSide');
            return;
        }
        return this.frameworkOverrides.wrapIncoming(() => this.clientSideRowModel.updateRowData(rowDataTransaction));
    }

    /** Same as `applyTransaction` except executes asynchronously for efficiency. */
    public applyTransactionAsync(rowDataTransaction: RowDataTransaction<TData>, callback?: (res: RowNodeTransaction<TData>) => void): void {
        if (!this.clientSideRowModel) {
            this.logMissingRowModel('applyTransactionAsync', 'clientSide');
            return;
        }
        this.frameworkOverrides.wrapIncoming(() => this.clientSideRowModel.batchUpdateRowData(rowDataTransaction, callback));
    }

    /** Executes any remaining asynchronous grid transactions, if any are waiting to be executed. */
    public flushAsyncTransactions(): void {
        if (!this.clientSideRowModel) {
            this.logMissingRowModel('flushAsyncTransactions', 'clientSide');
            return;
        }
        this.frameworkOverrides.wrapIncoming(() => this.clientSideRowModel.flushAsyncTransactions());
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
            this.logMissingRowModel('refreshInfiniteCache', 'infinite');
        }
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
            this.logMissingRowModel('purgeInfiniteCache', 'infinite');
        }
    }

    /**
     * Refresh a server-side store level.
     * If you pass no parameters, then the top level store is refreshed.
     * To refresh a child level, pass in the string of keys to get to the desired level.
     * Once the store refresh is complete, the storeRefreshed event is fired.
     */
    public refreshServerSide(params?: RefreshServerSideParams): void {
        if (!this.serverSideRowModel) {
            this.logMissingRowModel('refreshServerSide', 'serverSide');
            return;
        }
        this.serverSideRowModel.refreshStore(params);
    }

    /** Returns info on all server side group levels. */
    public getServerSideGroupLevelState(): ServerSideGroupLevelState[] {
        if (!this.serverSideRowModel) {
            this.logMissingRowModel('getServerSideGroupLevelState', 'serverSide')
            return [];
        }
        return this.serverSideRowModel.getStoreState();
    }

    /** The row count defines how many rows the grid allows scrolling to. */
    public getInfiniteRowCount(): number | undefined {
        if (this.infiniteRowModel) {
            return this.infiniteRowModel.getRowCount();
        } else {
            this.logMissingRowModel('getInfiniteRowCount', 'infinite')
        }
    }

    /** Returns `true` if grid allows for scrolling past the last row to load more rows, thus providing infinite scroll. */
    public isLastRowIndexKnown(): boolean | undefined {
        if (this.infiniteRowModel) {
            return this.infiniteRowModel.isLastRowIndexKnown();
        } else {
            this.logMissingRowModel('isLastRowIndexKnown', 'infinite');
        }
    }

    /**
     * Returns an object representing the state of the cache. This is useful for debugging and understanding how the cache is working.
     */
    public getCacheBlockState(): any {
        return this.rowNodeBlockLoader.getBlockState();
    }

    /** @deprecated v31.1 `getFirstDisplayedRow` is deprecated. Please use `getFirstDisplayedRowIndex` instead. */
    public getFirstDisplayedRow(): number {
        this.logDeprecation('v31.1', 'getFirstDisplayedRow', 'getFirstDisplayedRowIndex');
        return this.getFirstDisplayedRowIndex();
    }
    /** Get the index of the first displayed row due to scrolling (includes invisible rendered rows in the buffer). */
    public getFirstDisplayedRowIndex(): number {
        return this.rowRenderer.getFirstVirtualRenderedRow();
    }

    /** @deprecated v31.1 `getLastDisplayedRow` is deprecated. Please use `getLastDisplayedRowIndex` instead. */
    public getLastDisplayedRow(): number {
        this.logDeprecation('v31.1', 'getLastDisplayedRow', 'getLastDisplayedRowIndex');
        return this.getLastDisplayedRowIndex();
    }
    /** Get the index of the last displayed row due to scrolling (includes invisible rendered rows in the buffer). */
    public getLastDisplayedRowIndex(): number {
        return this.rowRenderer.getLastVirtualRenderedRow();
    }

    /** Returns the displayed `RowNode` at the given `index`. */
    public getDisplayedRowAtIndex(index: number): IRowNode<TData> | undefined {
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

    // Methods migrated from old ColumnApi

    /**
     * Adjusts the size of columns to fit the available horizontal space.
     *
     * Note: it is not recommended to call this method rapidly e.g. in response
     * to window resize events or as the container size is animated. This can
     * cause the scrollbar to flicker. Use column flex for smoother results.
     * 
     * If inferring cell data types with custom column types
     * and row data is provided asynchronously, the column sizing will happen asynchronously when row data is added.
     * To always perform this synchronously, set `cellDataType = false` on the default column definition.
     **/
    public sizeColumnsToFit(paramsOrGridWidth?: ISizeColumnsToFitParams | number) {
        if (typeof paramsOrGridWidth === 'number') {
            this.columnModel.sizeColumnsToFit(paramsOrGridWidth, 'api');
        } else {
            this.gridBodyCtrl.sizeColumnsToFit(paramsOrGridWidth);
        }
    }

    /** Call this if you want to open or close a column group. */
    public setColumnGroupOpened(group: ProvidedColumnGroup | string, newValue: boolean): void { this.columnModel.setColumnGroupOpened(group, newValue, 'api'); }
    /** Returns the column group with the given name. */
    public getColumnGroup(name: string, instanceId?: number): ColumnGroup | null { return this.columnModel.getColumnGroup(name, instanceId); }
    /** Returns the provided column group with the given name. */
    public getProvidedColumnGroup(name: string): ProvidedColumnGroup | null { return this.columnModel.getProvidedColumnGroup(name); }

    /** Returns the display name for a column. Useful if you are doing your own header rendering and want the grid to work out if `headerValueGetter` is used, or if you are doing your own column management GUI, to know what to show as the column name. */
    public getDisplayNameForColumn(column: Column, location: HeaderLocation): string { return this.columnModel.getDisplayNameForColumn(column, location) || ''; }
    /** Returns the display name for a column group (when grouping columns). */
    public getDisplayNameForColumnGroup(columnGroup: ColumnGroup, location: HeaderLocation): string { return this.columnModel.getDisplayNameForColumnGroup(columnGroup, location) || ''; }

    /** Returns the column with the given `colKey`, which can either be the `colId` (a string) or the `colDef` (an object). */
    public getColumn<TValue = any>(key: string | ColDef<TData, TValue> | Column<TValue>): Column<TValue> | null { return this.columnModel.getPrimaryColumn(key); }
    /** Returns all the columns, regardless of visible or not. */
    public getColumns(): Column[] | null { return this.columnModel.getAllPrimaryColumns(); }
    /** Applies the state of the columns from a previous state. Returns `false` if one or more columns could not be found. */
    public applyColumnState(params: ApplyColumnStateParams): boolean { return this.columnModel.applyColumnState(params, 'api'); }
    /** Gets the state of the columns. Typically used when saving column state. */
    public getColumnState(): ColumnState[] { return this.columnModel.getColumnState(); }
    /** Sets the state back to match the originally provided column definitions. */
    public resetColumnState(): void { this.columnModel.resetColumnState('api'); }
    /** Gets the state of the column groups. Typically used when saving column group state. */
    public getColumnGroupState(): { groupId: string, open: boolean }[] { return this.columnModel.getColumnGroupState(); }
    /** Sets the state of the column group state from a previous state. */
    public setColumnGroupState(stateItems: ({ groupId: string, open: boolean })[]): void { this.columnModel.setColumnGroupState(stateItems, 'api'); }
    /** Sets the state back to match the originally provided column definitions. */
    public resetColumnGroupState(): void { this.columnModel.resetColumnGroupState('api'); }

    /** Returns `true` if pinning left or right, otherwise `false`. */
    public isPinning(): boolean { return this.columnModel.isPinningLeft() || this.columnModel.isPinningRight(); }
    /** Returns `true` if pinning left, otherwise `false`. */
    public isPinningLeft(): boolean { return this.columnModel.isPinningLeft(); }
    /** Returns `true` if pinning right, otherwise `false`. */
    public isPinningRight(): boolean { return this.columnModel.isPinningRight(); }
    /** Returns the column to the right of the provided column, taking into consideration open / closed column groups and visible columns. This is useful if you need to know what column is beside yours e.g. if implementing your own cell navigation. */
    public getDisplayedColAfter(col: Column): Column | null { return this.columnModel.getDisplayedColAfter(col); }
    /** Same as `getVisibleColAfter` except gives column to the left. */
    public getDisplayedColBefore(col: Column): Column | null { return this.columnModel.getDisplayedColBefore(col); }
    /** @deprecated v31.1 setColumnVisible(key, visible) deprecated, please use setColumnsVisible([key], visible) instead. */
    public setColumnVisible(key: string | Column, visible: boolean): void { 
        this.logDeprecation('v31.1', 'setColumnVisible(key,visible)', 'setColumnsVisible([key],visible)');
        this.columnModel.setColumnsVisible([key], visible, 'api'); 
    }
    /** Sets the visibility of columns. Key can be the column ID or `Column` object. */
    public setColumnsVisible(keys: (string | Column)[], visible: boolean): void { this.columnModel.setColumnsVisible(keys, visible, 'api'); }
    /** @deprecated v31.1 setColumnPinned(key, pinned) deprecated, please use setColumnsPinned([key], pinned) instead. */
    public setColumnPinned(key: string | ColDef | Column, pinned: ColumnPinnedType): void { 
        this.logDeprecation('v31.1', 'setColumnPinned(key,pinned)', 'setColumnsPinned([key],pinned)');
        this.columnModel.setColumnsPinned([key], pinned, 'api'); 
    }
    /** Set a column's pinned / unpinned state. Key can be the column ID, field, `ColDef` object or `Column` object. */
    public setColumnsPinned(keys: (string | ColDef |Column)[], pinned: ColumnPinnedType): void { this.columnModel.setColumnsPinned(keys, pinned, 'api'); }

    /**
     * Returns all the grid columns, same as `getColumns()`, except
     *
     *  a) it has the order of the columns that are presented in the grid
     *
     *  b) it's after the 'pivot' step, so if pivoting, has the value columns for the pivot.
     */
    public getAllGridColumns(): Column[] { return this.columnModel.getAllGridColumns(); }
    /** Same as `getAllDisplayedColumns` but just for the pinned left portion of the grid. */
    public getDisplayedLeftColumns(): Column[] { return this.columnModel.getDisplayedLeftColumns(); }
    /** Same as `getAllDisplayedColumns` but just for the center portion of the grid. */
    public getDisplayedCenterColumns(): Column[] { return this.columnModel.getDisplayedCenterColumns(); }
    /** Same as `getAllDisplayedColumns` but just for the pinned right portion of the grid. */
    public getDisplayedRightColumns(): Column[] { return this.columnModel.getDisplayedRightColumns(); }
    /** Returns all columns currently displayed (e.g. are visible and if in a group, the group is showing the columns) for the pinned left, centre and pinned right portions of the grid. */
    public getAllDisplayedColumns(): Column[] { return this.columnModel.getAllDisplayedColumns(); }
    /** Same as `getAllGridColumns()`, except only returns rendered columns, i.e. columns that are not within the viewport and therefore not rendered, due to column virtualisation, are not displayed. */
    public getAllDisplayedVirtualColumns(): Column[] { return this.columnModel.getViewportColumns(); }

    /** @deprecated v31.1 moveColumn(key, toIndex) deprecated, please use moveColumns([key], toIndex) instead. */
    public moveColumn(key: string | ColDef | Column, toIndex: number): void {
        this.logDeprecation('v31.1', 'moveColumn(key, toIndex)', 'moveColumns([key], toIndex)');
        this.columnModel.moveColumns([key], toIndex, 'api');
    }
    /** Moves the column at `fromIdex` to `toIndex`. The column is first removed, then added at the `toIndex` location, thus index locations will change to the right of the column after the removal. */
    public moveColumnByIndex(fromIndex: number, toIndex: number): void { this.columnModel.moveColumnByIndex(fromIndex, toIndex, 'api'); }
    /** Moves columns to `toIndex`. The columns are first removed, then added at the `toIndex` location, thus index locations will change to the right of the column after the removal. */
    public moveColumns(columnsToMoveKeys: (string | ColDef | Column)[], toIndex: number) { this.columnModel.moveColumns(columnsToMoveKeys, toIndex, 'api'); }
    /** Move the column to a new position in the row grouping order. */
    public moveRowGroupColumn(fromIndex: number, toIndex: number): void { this.columnModel.moveRowGroupColumn(fromIndex, toIndex, 'api'); }
    /** Sets the agg function for a column. `aggFunc` can be one of the built-in aggregations or a custom aggregation by name or direct function. */
    public setColumnAggFunc(key: string | ColDef | Column, aggFunc: string | IAggFunc | null | undefined): void { this.columnModel.setColumnAggFunc(key, aggFunc, 'api'); }
    /** @deprecated v31.1 setColumnWidths(key, newWidth) deprecated, please use setColumnWidths( [{key: newWidth}] ) instead. */
    public setColumnWidth(key: string | ColDef | Column, newWidth: number, finished: boolean = true, source: ColumnEventType = 'api'): void {
        this.logDeprecation('v31.1', 'setColumnWidth(col, width)', 'setColumnWidths([{key: col, newWidth: width}])');
        this.columnModel.setColumnWidths([{ key, newWidth }], false, finished, source);
    }
    /** Sets the column widths of the columns provided. The finished flag gets included in the resulting event and not used internally by the grid. The finished flag is intended for dragging, where a dragging action will produce many `columnWidth` events, so the consumer of events knows when it receives the last event in a stream. The finished parameter is optional, and defaults to `true`. */
    public setColumnWidths(columnWidths: { key: string | ColDef | Column, newWidth: number }[], finished: boolean = true, source: ColumnEventType = 'api'): void {
        this.columnModel.setColumnWidths(columnWidths, false, finished, source);
    }

    /** Get the pivot mode. */
    public isPivotMode(): boolean { return this.columnModel.isPivotMode(); }

    /** Returns the pivot result column for the given `pivotKeys` and `valueColId`. Useful to then call operations on the pivot column. */
    public getPivotResultColumn<TValue = any>(pivotKeys: string[], valueColKey: string | ColDef<TData, TValue> | Column<TValue>): Column<TValue> | null { return this.columnModel.getSecondaryPivotColumn(pivotKeys, valueColKey); }

    /** Set the value columns to the provided list of columns. */
    public setValueColumns(colKeys: (string | ColDef | Column)[]): void { this.columnModel.setValueColumns(colKeys, 'api'); }
    /** Get a list of the existing value columns. */
    public getValueColumns(): Column[] { return this.columnModel.getValueColumns(); }
    /** @deprecated v31.1 removeValueColumn(colKey) deprecated, please use removeValueColumns([colKey]) instead. */
    public removeValueColumn(colKey: (string | ColDef | Column)): void {
        this.logDeprecation('v31.1', 'removeValueColumn(colKey)', 'removeValueColumns([colKey])');
        this.columnModel.removeValueColumns([colKey], 'api'); 
    }
    /** Remove the given list of columns from the existing set of value columns. */
    public removeValueColumns(colKeys: (string | ColDef | Column)[]): void { this.columnModel.removeValueColumns(colKeys, 'api'); }
    /** @deprecated v31.1 addValueColumn(colKey) deprecated, please use addValueColumns([colKey]) instead. */
    public addValueColumn(colKey: (string | ColDef | Column)): void {
        this.logDeprecation('v31.1', 'addValueColumn(colKey)', 'addValueColumns([colKey])');
        this.columnModel.addValueColumns([colKey], 'api');
    }
    /** Add the given list of columns to the existing set of value columns. */
    public addValueColumns(colKeys: (string | ColDef | Column)[]): void { this.columnModel.addValueColumns(colKeys, 'api'); }

    /** Set the row group columns. */
    public setRowGroupColumns(colKeys: (string | ColDef | Column)[]): void { this.columnModel.setRowGroupColumns(colKeys, 'api'); }
    /** @deprecated v31.1 removeRowGroupColumn(colKey) deprecated, please use removeRowGroupColumns([colKey]) instead. */
    public removeRowGroupColumn(colKey: string | ColDef | Column): void {
        this.logDeprecation('v31.1', 'removeRowGroupColumn(colKey)', 'removeRowGroupColumns([colKey])');
        this.columnModel.removeRowGroupColumns([colKey], 'api');
    }
    /** Remove columns from the row groups. */
    public removeRowGroupColumns(colKeys: (string | ColDef | Column)[]): void { this.columnModel.removeRowGroupColumns(colKeys, 'api'); }
    /** @deprecated v31.1 addRowGroupColumn(colKey) deprecated, please use addRowGroupColumns([colKey]) instead. */
    public addRowGroupColumn(colKey: string | ColDef | Column): void { 
        this.logDeprecation('v31.1', 'addRowGroupColumn(colKey)', 'addRowGroupColumns([colKey])');
        this.columnModel.addRowGroupColumns([colKey], 'api');
    }
    /** Add columns to the row groups. */
    public addRowGroupColumns(colKeys: (string | ColDef | Column)[]): void { this.columnModel.addRowGroupColumns(colKeys, 'api'); }
    /** Get row group columns. */
    public getRowGroupColumns(): Column[] { return this.columnModel.getRowGroupColumns(); }

    /** Set the pivot columns. */
    public setPivotColumns(colKeys: (string | ColDef | Column)[]): void { this.columnModel.setPivotColumns(colKeys, 'api'); }
    /** @deprecated v31.1 removePivotColumn(colKey) deprecated, please use removePivotColumns([colKey]) instead. */
    public removePivotColumn(colKey: string | ColDef | Column): void {
        this.logDeprecation('v31.1', 'removePivotColumn(colKey)', 'removePivotColumns([colKey])');
        this.columnModel.removePivotColumns([colKey], 'api');
    }
    /** Remove pivot columns. */
    public removePivotColumns(colKeys: (string | ColDef | Column)[]): void { this.columnModel.removePivotColumns(colKeys, 'api'); }
    /** @deprecated v31.1 addPivotColumn(colKey) deprecated, please use addPivotColumns([colKey]) instead. */
    public addPivotColumn(colKey: string | ColDef | Column): void {
        this.logDeprecation('v31.1', 'addPivotColumn(colKey)', 'addPivotColumns([colKey])');
        this.columnModel.addPivotColumns([colKey], 'api');
    }
    /** Add pivot columns. */
    public addPivotColumns(colKeys: (string | ColDef | Column)[]): void { this.columnModel.addPivotColumns(colKeys, 'api'); }
    /** Get the pivot columns. */
    public getPivotColumns(): Column[] { return this.columnModel.getPivotColumns(); }

    /** Same as `getAllDisplayedColumnGroups` but just for the pinned left portion of the grid. */
    public getLeftDisplayedColumnGroups(): IHeaderColumn[] { return this.columnModel.getDisplayedTreeLeft(); }
    /** Same as `getAllDisplayedColumnGroups` but just for the center portion of the grid. */
    public getCenterDisplayedColumnGroups(): IHeaderColumn[] { return this.columnModel.getDisplayedTreeCentre(); }
    /** Same as `getAllDisplayedColumnGroups` but just for the pinned right portion of the grid. */
    public getRightDisplayedColumnGroups(): IHeaderColumn[] { return this.columnModel.getDisplayedTreeRight(); }
    /** Returns all 'root' column headers. If you are not grouping columns, these return the columns. If you are grouping, these return the top level groups - you can navigate down through each one to get the other lower level headers and finally the columns at the bottom. */
    public getAllDisplayedColumnGroups(): IHeaderColumn[] | null { return this.columnModel.getAllDisplayedTrees(); }
    /** @deprecated v31.1 autoSizeColumn(key) deprecated, please use autoSizeColumns([colKey]) instead. */
    public autoSizeColumn(key: string | ColDef | Column, skipHeader?: boolean): void {
        this.logDeprecation('v31.1', 'autoSizeColumn(key, skipHeader)', 'autoSizeColumns([key], skipHeader)');
        return this.columnModel.autoSizeColumns({ columns: [key], skipHeader: skipHeader, source: 'api'});
    }

    /**
     * Auto-sizes columns based on their contents. If inferring cell data types with custom column types
     * and row data is provided asynchronously, the column sizing will happen asynchronously when row data is added.
     * To always perform this synchronously, set `cellDataType = false` on the default column definition.
     */
    public autoSizeColumns(keys: (string | ColDef | Column)[], skipHeader?: boolean): void {
        this.columnModel.autoSizeColumns({ columns: keys, skipHeader: skipHeader, source: 'api'});
    }

    /**
     * Calls `autoSizeColumns` on all displayed columns. If inferring cell data types with custom column types
     * and row data is provided asynchronously, the column sizing will happen asynchronously when row data is added.
     * To always perform this synchronously, set `cellDataType = false` on the default column definition.
     */
    public autoSizeAllColumns(skipHeader?: boolean): void { this.columnModel.autoSizeAllColumns('api', skipHeader); }

    /** Set the pivot result columns. */
    public setPivotResultColumns(colDefs: (ColDef | ColGroupDef)[]): void { this.columnModel.setSecondaryColumns(colDefs, 'api'); }

    /** Returns the grid's pivot result columns. */
    public getPivotResultColumns(): Column[] | null { return this.columnModel.getSecondaryColumns(); }

    /** Get the current state of the grid. Can be used in conjunction with the `initialState` grid option to save and restore grid state. */
    public getState(): GridState {
        return this.stateService.getState();
    }

    /**
     * Returns the grid option value for a provided key.
     */
    public getGridOption<Key extends keyof GridOptions<TData>>(key: Key): GridOptions<TData>[Key] {
        return this.gos.get(key);
    }

    /**
     * Updates a single gridOption to the new value provided. (Cannot be used on `Initial` properties.)
     * If updating multiple options, it is recommended to instead use `api.updateGridOptions()` which batches update logic.
     */
    public setGridOption<Key extends ManagedGridOptionKey>(key: Key, value: GridOptions<TData>[Key]): void {
        this.updateGridOptions({ [key]: value });
    }

    /**
     * Updates the provided subset of gridOptions with the provided values. (Cannot be used on `Initial` properties.)
     */    
    public updateGridOptions<TDataUpdate extends TData>(options: ManagedGridOptions<TDataUpdate>): void {
        // NOTE: The TDataUpdate generic is used to ensure that the update options match the generic passed into the GridApi above as TData.
        // This is required because if we just use TData directly then Typescript will get into an infinite loop due to callbacks which recursively include the GridApi.
        this.gos.updateGridOptions({ options });
    }

    /** Used internally by grid. Not intended to be used by the client. Interface may change between releases. */
    public __internalUpdateGridOptions(options: GridOptions): void {
        this.gos.updateGridOptions({ options, source: 'gridOptionsUpdated' });
    }

    private deprecatedUpdateGridOption<K extends keyof GridOptions & ManagedGridOptionKey>(key: K, value: GridOptions<TData>[K]) {
        warnOnce(`set${key.charAt(0).toUpperCase()}${key.slice(1, key.length)} is deprecated. Please use 'api.setGridOption('${key}', newValue)' or 'api.updateGridOptions({ ${key}: newValue })' instead.`);
        this.setGridOption(key, value);
    }

    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     * Set the top pinned rows. Call with no rows / undefined to clear top pinned rows. 
     **/
    public setPivotMode(pivotMode: boolean) {
        this.deprecatedUpdateGridOption('pivotMode', pivotMode);
    }

    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     * Set the top pinned rows. Call with no rows / undefined to clear top pinned rows. 
     **/
    public setPinnedTopRowData(rows?: any[]): void {
        this.deprecatedUpdateGridOption('pinnedTopRowData', rows);
    }

    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     * Set the bottom pinned rows. Call with no rows / undefined to clear bottom pinned rows.
     * */
    public setPinnedBottomRowData(rows?: any[]): void {
        this.deprecatedUpdateGridOption('pinnedBottomRowData', rows);
    }

    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     * DOM element to use as the popup parent for grid popups (context menu, column menu etc).
     * */
    public setPopupParent(ePopupParent: HTMLElement): void {
        this.deprecatedUpdateGridOption('popupParent', ePopupParent);
    }

    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     */
    public setSuppressModelUpdateAfterUpdateTransaction(value: boolean) {
        this.deprecatedUpdateGridOption('suppressModelUpdateAfterUpdateTransaction', value);
    }

    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     * Resets the data type definitions. This will update the columns in the grid.
     * */
    public setDataTypeDefinitions(dataTypeDefinitions: {
        [cellDataType: string]: DataTypeDefinition<TData>;
    }): void {
        this.deprecatedUpdateGridOption('dataTypeDefinitions', dataTypeDefinitions);
    }

    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     * Set whether the grid paginates the data or not.
     *  - `true` to enable pagination
     *  - `false` to disable pagination
     */
    public setPagination(value: boolean) {
        this.deprecatedUpdateGridOption('pagination', value);
    }

    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     * Sets the `paginationPageSize`, then re-paginates the grid so the changes are applied immediately.
     * */
    public paginationSetPageSize(size?: number): void {
        this.deprecatedUpdateGridOption('paginationPageSize', size);
    }

    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     * Resets the side bar to the provided configuration. The parameter is the same as the sideBar grid property. The side bar is re-created from scratch with the new config.
     * */
    public setSideBar(def: SideBarDef | string | string[] | boolean): void {
        this.deprecatedUpdateGridOption('sideBar', def);
    }

    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     */
    public setSuppressClipboardPaste(value: boolean): void {
        this.deprecatedUpdateGridOption('suppressClipboardPaste', value);
    }

    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     */
    public setGroupRemoveSingleChildren(value: boolean) {
        this.deprecatedUpdateGridOption('groupRemoveSingleChildren', value);
    }

    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     */
    public setGroupRemoveLowestSingleChildren(value: boolean) {
        this.deprecatedUpdateGridOption('groupRemoveLowestSingleChildren', value);
    }

    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     */
    public setGroupDisplayType(value: RowGroupingDisplayType) {
        this.deprecatedUpdateGridOption('groupDisplayType', value);
    }

    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     * Sets the `groupIncludeFooter` property
     */
    public setGroupIncludeFooter(value: boolean | UseGroupFooter<TData>) {
        this.deprecatedUpdateGridOption('groupIncludeFooter', value);
    }

    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     * Sets the `groupIncludeTotalFooter` property
     */
    public setGroupIncludeTotalFooter(value: boolean) {
        this.deprecatedUpdateGridOption('groupIncludeTotalFooter', value);
    }

    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     */
    public setRowClass(className: string | undefined): void {
        this.deprecatedUpdateGridOption('rowClass', className);
    }

    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     * Sets the `deltaSort` property
     * */
    public setDeltaSort(enable: boolean): void {
        this.deprecatedUpdateGridOption('deltaSort', enable);
    }

    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     * Sets the `suppressRowDrag` property.
     * */
    public setSuppressRowDrag(value: boolean): void {
        this.deprecatedUpdateGridOption('suppressRowDrag', value);
    }

    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     * Sets the `suppressMoveWhenRowDragging` property.
     * */
    public setSuppressMoveWhenRowDragging(value: boolean): void {
        this.deprecatedUpdateGridOption('suppressMoveWhenRowDragging', value);
    }

    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     * Sets the `suppressRowClickSelection` property.
     * */
    public setSuppressRowClickSelection(value: boolean): void {
        this.deprecatedUpdateGridOption('suppressRowClickSelection', value);
    }

    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     * Enable/disable the Advanced Filter
     * */
    public setEnableAdvancedFilter(enabled: boolean): void {
        this.deprecatedUpdateGridOption('enableAdvancedFilter', enabled);
    }

    /** 
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     * Updates the `includeHiddenColumnsInAdvancedFilter` grid option.
     * By default hidden columns are excluded from the Advanced Filter.
     * Set to `true` to include them.
     */
    public setIncludeHiddenColumnsInAdvancedFilter(value: boolean): void {
        this.deprecatedUpdateGridOption('includeHiddenColumnsInAdvancedFilter', value);
    }

    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     * DOM element to use as the parent for the Advanced Filter, to allow it to appear outside of the grid.
     * Set to `null` to appear inside the grid.
     */
    public setAdvancedFilterParent(advancedFilterParent: HTMLElement | null): void {
        this.deprecatedUpdateGridOption('advancedFilterParent', advancedFilterParent);
    }

    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     * Updates the Advanced Filter Builder parameters.
     * */
    public setAdvancedFilterBuilderParams(params?: IAdvancedFilterBuilderParams): void {
        this.deprecatedUpdateGridOption('advancedFilterBuilderParams', params);
    }


    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     * Pass a Quick Filter text into the grid for filtering.
     * */
    public setQuickFilter(newFilter: string): void {
        warnOnce(`setQuickFilter is deprecated. Please use 'api.setGridOption('quickFilterText', newValue)' or 'api.updateGridOptions({ quickFilterText: newValue })' instead.`);
        this.gos.updateGridOptions({ options: { quickFilterText: newFilter }});
    }

    /** 
     * @deprecated As of v30, hidden columns are excluded from the Quick Filter by default. To include hidden columns, use `setIncludeHiddenColumnsInQuickFilter` instead.
     */
    public setExcludeHiddenColumnsFromQuickFilter(value: boolean): void {
        this.deprecatedUpdateGridOption('includeHiddenColumnsInQuickFilter', !value);
    }

    /** 
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     * Updates the `includeHiddenColumnsInQuickFilter` grid option.
     * By default hidden columns are excluded from the Quick Filter.
     * Set to `true` to include them.
     */
    public setIncludeHiddenColumnsInQuickFilter(value: boolean): void {
        this.deprecatedUpdateGridOption('includeHiddenColumnsInQuickFilter', value);
    }

    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     * Updates the `quickFilterParser` grid option,
     * which changes how the Quick Filter splits the Quick Filter text into search terms.
     */
    public setQuickFilterParser(quickFilterParser?: (quickFilter: string) => string[]): void {
        this.deprecatedUpdateGridOption('quickFilterParser', quickFilterParser);
    }

    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     * Updates the `quickFilterMatcher` grid option,
     * which changes the matching logic for whether a row passes the Quick Filter.
     */
    public setQuickFilterMatcher(quickFilterMatcher?: (quickFilterParts: string[], rowQuickFilterAggregateText: string) => boolean): void {
        this.deprecatedUpdateGridOption('quickFilterMatcher', quickFilterMatcher);
    }


    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     * If `true`, the horizontal scrollbar will always be present, even if not required. Otherwise, it will only be displayed when necessary.
     * */
    public setAlwaysShowHorizontalScroll(show: boolean) {
        this.deprecatedUpdateGridOption('alwaysShowHorizontalScroll', show);
    }

    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     * If `true`, the vertical scrollbar will always be present, even if not required. Otherwise it will only be displayed when necessary.
     * */
    public setAlwaysShowVerticalScroll(show: boolean) {
        this.deprecatedUpdateGridOption('alwaysShowVerticalScroll', show);
    }

    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     */
    public setFunctionsReadOnly(readOnly: boolean) {
        this.deprecatedUpdateGridOption('functionsReadOnly', readOnly);
    }

    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     * Call to set new column definitions. The grid will redraw all the column headers, and then redraw all of the rows.
     */
    public setColumnDefs(colDefs: (ColDef<TData> | ColGroupDef<TData>)[], source: ColumnEventType = "api") {
        warnOnce(`setColumnDefs is deprecated. Please use 'api.setGridOption('columnDefs', newValue)' or 'api.updateGridOptions({ columnDefs: newValue })' instead.`);
        this.gos.updateGridOptions({
            options: { columnDefs: colDefs },
            source: source as any,
        });
    }

    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     * Call to set new auto group column definition. The grid will recreate any auto-group columns if present.
     * */
    public setAutoGroupColumnDef(colDef: ColDef<TData>, source: ColumnEventType = "api") {
        warnOnce(`setAutoGroupColumnDef is deprecated. Please use 'api.setGridOption('autoGroupColumnDef', newValue)' or 'api.updateGridOptions({ autoGroupColumnDef: newValue })' instead.`);
        this.gos.updateGridOptions({
            options: { autoGroupColumnDef: colDef },
            source: source as any,
        });
    }

    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     * Call to set new Default Column Definition.
     * */
    public setDefaultColDef(colDef: ColDef<TData>, source: ColumnEventType = "api") {
        warnOnce(`setDefaultColDef is deprecated. Please use 'api.setGridOption('defaultColDef', newValue)' or 'api.updateGridOptions({ defaultColDef: newValue })' instead.`);
        this.gos.updateGridOptions({
            options: { defaultColDef: colDef },
            source: source as any,
        });
    }

    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     * Call to set new Column Types.
     * */
    public setColumnTypes(columnTypes: { string: ColDef<TData> }, source: ColumnEventType = "api") {
        warnOnce(`setColumnTypes is deprecated. Please use 'api.setGridOption('columnTypes', newValue)' or 'api.updateGridOptions({ columnTypes: newValue })' instead.`);
        this.gos.updateGridOptions({
            options: { columnTypes: columnTypes },
            source: source as any,
        });
    }

    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     * Sets the `treeData` property.
     * */
    public setTreeData(newTreeData: boolean): void {
        this.deprecatedUpdateGridOption('treeData', newTreeData);
    }

    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     * Set new datasource for Server-Side Row Model.
     * */
    public setServerSideDatasource(datasource: IServerSideDatasource) {
        this.deprecatedUpdateGridOption('serverSideDatasource', datasource);
    }

    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     * 
     * Note this purges all the cached data and reloads all the rows of the grid.
     * */
    public setCacheBlockSize(blockSize: number) {
        this.deprecatedUpdateGridOption('cacheBlockSize', blockSize);
    }

    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     * Set new datasource for Infinite Row Model.
     * */
    public setDatasource(datasource: IDatasource) {
        this.deprecatedUpdateGridOption('datasource', datasource);
    }

    /** 
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     * Set new datasource for Viewport Row Model.
     * */
    public setViewportDatasource(viewportDatasource: IViewportDatasource) {
        this.deprecatedUpdateGridOption('viewportDatasource', viewportDatasource);
    }

    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     * Set the row data.
     * */
    public setRowData(rowData: TData[]) {
        this.deprecatedUpdateGridOption('rowData', rowData);
    }

    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     * Sets the `enableCellTextSelection` property.
     * */
    public setEnableCellTextSelection(selectable: boolean) {
        this.deprecatedUpdateGridOption('enableCellTextSelection', selectable);
    }

    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     * Sets the height in pixels for the row containing the column label header.
     * */
    public setHeaderHeight(headerHeight?: number) {
        this.deprecatedUpdateGridOption('headerHeight', headerHeight);
    }

    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     * Switch between layout options: `normal`, `autoHeight`, `print`.
     * Defaults to `normal` if no domLayout provided.
     */
    public setDomLayout(domLayout?: DomLayoutType) {
        this.deprecatedUpdateGridOption('domLayout', domLayout);
    }

    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     * Sets the preferred direction for the selection fill handle.
     * */
    public setFillHandleDirection(direction: 'x' | 'y' | 'xy') {
        this.deprecatedUpdateGridOption('fillHandleDirection', direction);
    }

    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     * Sets the height in pixels for the rows containing header column groups.
     * */
    public setGroupHeaderHeight(headerHeight?: number) {
        this.deprecatedUpdateGridOption('groupHeaderHeight', headerHeight);
    }

    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     * Sets the height in pixels for the row containing the floating filters.
     * */
    public setFloatingFiltersHeight(headerHeight?: number) {
        this.deprecatedUpdateGridOption('floatingFiltersHeight', headerHeight);
    }

    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     * Sets the height in pixels for the row containing the columns when in pivot mode.
     * */
    public setPivotHeaderHeight(headerHeight?: number) {
        this.deprecatedUpdateGridOption('pivotHeaderHeight', headerHeight);
    }

    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     * Sets the height in pixels for the row containing header column groups when in pivot mode.
     * */
    public setPivotGroupHeaderHeight(headerHeight?: number) {
        this.deprecatedUpdateGridOption('pivotGroupHeaderHeight', headerHeight);
    }

    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     *  */
    public setAnimateRows(animateRows: boolean): void {
        this.deprecatedUpdateGridOption('animateRows', animateRows);
    }

    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     *  */
    public setIsExternalFilterPresent(isExternalFilterPresentFunc: () => boolean): void {
        this.deprecatedUpdateGridOption('isExternalFilterPresent', isExternalFilterPresentFunc);
    }

    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     *  */
    public setDoesExternalFilterPass(doesExternalFilterPassFunc: (node: IRowNode) => boolean): void {
        this.deprecatedUpdateGridOption('doesExternalFilterPass', doesExternalFilterPassFunc);
    }

    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     *  */
    public setNavigateToNextCell(navigateToNextCellFunc: (params: NavigateToNextCellParams) => (CellPosition | null)): void {
        this.deprecatedUpdateGridOption('navigateToNextCell', navigateToNextCellFunc);
    }

    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     *  */
    public setTabToNextCell(tabToNextCellFunc: (params: TabToNextCellParams) => (CellPosition | null)): void {
        this.deprecatedUpdateGridOption('tabToNextCell', tabToNextCellFunc);
    }

    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     *  */
    public setTabToNextHeader(tabToNextHeaderFunc: (params: TabToNextHeaderParams) => (HeaderPosition | null)): void {
        this.deprecatedUpdateGridOption('tabToNextHeader', tabToNextHeaderFunc);
    }

    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     *  */
    public setNavigateToNextHeader(navigateToNextHeaderFunc: (params: NavigateToNextHeaderParams) => (HeaderPosition | null)): void {
        this.deprecatedUpdateGridOption('navigateToNextHeader', navigateToNextHeaderFunc);
    }

    public setRowGroupPanelShow(rowGroupPanelShow: 'always' | 'onlyWhenGrouping' | 'never'): void {
        this.deprecatedUpdateGridOption('rowGroupPanelShow', rowGroupPanelShow);
    }

    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     *  */
    public setGetGroupRowAgg(getGroupRowAggFunc: (params: GetGroupRowAggParams) => any): void {
        this.deprecatedUpdateGridOption('getGroupRowAgg', getGroupRowAggFunc);
    }

    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     *  */
    public setGetBusinessKeyForNode(getBusinessKeyForNodeFunc: (nodes: IRowNode) => string): void {
        this.deprecatedUpdateGridOption('getBusinessKeyForNode', getBusinessKeyForNodeFunc);
    }

    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     *  */
    public setGetChildCount(getChildCountFunc: (dataItem: any) => number): void {
        this.deprecatedUpdateGridOption('getChildCount', getChildCountFunc);
    }

    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     *  */
    public setProcessRowPostCreate(processRowPostCreateFunc: (params: ProcessRowParams) => void): void {
        this.deprecatedUpdateGridOption('processRowPostCreate', processRowPostCreateFunc);
    }

    /**
     * @deprecated v31 `getRowId` is a static property and cannot be updated.
     *  */
    public setGetRowId(getRowIdFunc: GetRowIdFunc): void {
        warnOnce(`getRowId is a static property and can no longer be updated.`);
    }

    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     *  */
    public setGetRowClass(rowClassFunc: (params: RowClassParams) => string | string[]): void {
        this.deprecatedUpdateGridOption('getRowClass', rowClassFunc);
    }

    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     *  */
    public setIsFullWidthRow(isFullWidthRowFunc: (params: IsFullWidthRowParams) => boolean): void {
        this.deprecatedUpdateGridOption('isFullWidthRow', isFullWidthRowFunc);
    }

    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     *  */
    public setIsRowSelectable(isRowSelectableFunc: IsRowSelectable): void {
        this.deprecatedUpdateGridOption('isRowSelectable', isRowSelectableFunc);
    }

    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     *  */
    public setIsRowMaster(isRowMasterFunc: IsRowMaster): void {
        this.deprecatedUpdateGridOption('isRowMaster', isRowMasterFunc);
    }

    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     *  */
    public setPostSortRows(postSortRowsFunc: (params: PostSortRowsParams) => void): void {
        this.deprecatedUpdateGridOption('postSortRows', postSortRowsFunc);
    }

    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     *  */
    public setGetDocument(getDocumentFunc: () => Document): void {
        this.deprecatedUpdateGridOption('getDocument', getDocumentFunc);
    }

    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     *  */
    public setGetContextMenuItems(getContextMenuItemsFunc: GetContextMenuItems): void {
        this.deprecatedUpdateGridOption('getContextMenuItems', getContextMenuItemsFunc);
    }

    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     *  */
    public setGetMainMenuItems(getMainMenuItemsFunc: GetMainMenuItems): void {
        this.deprecatedUpdateGridOption('getMainMenuItems', getMainMenuItemsFunc);
    }

    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     *  */
    public setProcessCellForClipboard(processCellForClipboardFunc: (params: ProcessCellForExportParams) => any): void {
        this.deprecatedUpdateGridOption('processCellForClipboard', processCellForClipboardFunc);
    }

    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     *  */
    public setSendToClipboard(sendToClipboardFunc: (params: { data: string }) => void): void {
        this.deprecatedUpdateGridOption('sendToClipboard', sendToClipboardFunc);
    }

    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     *  */
    public setProcessCellFromClipboard(processCellFromClipboardFunc: (params: ProcessCellForExportParams) => any): void {
        this.deprecatedUpdateGridOption('processCellFromClipboard', processCellFromClipboardFunc);
    }

    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     *  */
    public setProcessPivotResultColDef(processPivotResultColDefFunc: (colDef: ColDef) => void): void {
        this.deprecatedUpdateGridOption('processPivotResultColDef', processPivotResultColDefFunc);
    }

    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     *  */
    public setProcessPivotResultColGroupDef(processPivotResultColGroupDefFunc: (colDef: ColDef) => void): void {
        this.deprecatedUpdateGridOption('processPivotResultColGroupDef', processPivotResultColGroupDefFunc);
    }

    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     *  */
    public setPostProcessPopup(postProcessPopupFunc: (params: PostProcessPopupParams) => void): void {
        this.deprecatedUpdateGridOption('postProcessPopup', postProcessPopupFunc);
    }

    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     *  */
    public setInitialGroupOrderComparator(initialGroupOrderComparatorFunc: (params: InitialGroupOrderComparatorParams) => number): void {
        this.deprecatedUpdateGridOption('initialGroupOrderComparator', initialGroupOrderComparatorFunc);
    }

    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     *  */
    public setGetChartToolbarItems(getChartToolbarItemsFunc: GetChartToolbarItems): void {
        this.deprecatedUpdateGridOption('getChartToolbarItems', getChartToolbarItemsFunc);
    }

    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     *  */
    public setPaginationNumberFormatter(paginationNumberFormatterFunc: (params: PaginationNumberFormatterParams) => string): void {
        this.deprecatedUpdateGridOption('paginationNumberFormatter', paginationNumberFormatterFunc);
    }

    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     *  */
    public setGetServerSideGroupLevelParams(getServerSideGroupLevelParamsFunc: (params: GetServerSideGroupLevelParamsParams) => ServerSideGroupLevelParams): void {
        this.deprecatedUpdateGridOption('getServerSideGroupLevelParams', getServerSideGroupLevelParamsFunc);
    }

    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     *  */
    public setIsServerSideGroupOpenByDefault(isServerSideGroupOpenByDefaultFunc: (params: IsServerSideGroupOpenByDefaultParams) => boolean): void {
        this.deprecatedUpdateGridOption('isServerSideGroupOpenByDefault', isServerSideGroupOpenByDefaultFunc);
    }

    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     *  */
    public setIsApplyServerSideTransaction(isApplyServerSideTransactionFunc: IsApplyServerSideTransaction): void {
        this.deprecatedUpdateGridOption('isApplyServerSideTransaction', isApplyServerSideTransactionFunc);
    }

    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     *  */
    public setIsServerSideGroup(isServerSideGroupFunc: IsServerSideGroup): void {
        this.deprecatedUpdateGridOption('isServerSideGroup', isServerSideGroupFunc);
    }

    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     *  */
    public setGetServerSideGroupKey(getServerSideGroupKeyFunc: GetServerSideGroupKey): void {
        this.deprecatedUpdateGridOption('getServerSideGroupKey', getServerSideGroupKeyFunc);
    }

    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     *  */
    public setGetRowStyle(rowStyleFunc: (params: RowClassParams) => {}): void {
        this.deprecatedUpdateGridOption('getRowStyle', rowStyleFunc);
    }

    /**
     * @deprecated v31 Use `api.setGridOption` or `api.updateGridOptions` instead.
     *  */
    public setGetRowHeight(rowHeightFunc: (params: RowHeightParams) => number): void {
        this.deprecatedUpdateGridOption('getRowHeight', rowHeightFunc);
    }
}

/** Utility type to support adding params to a grid api method. */
type StartsWithGridApi = `${keyof GridApi}${string}`;