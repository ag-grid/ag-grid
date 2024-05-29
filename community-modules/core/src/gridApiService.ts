import type { ApplyColumnStateParams, ColumnApplyStateService, ColumnState } from './columns/columnApplyStateService';
import type { ColumnAutosizeService } from './columns/columnAutosizeService';
import type { ColumnGetStateService } from './columns/columnGetStateService';
import type { ColumnGroupStateService } from './columns/columnGroupStateService';
import type { ColumnModel } from './columns/columnModel';
import type { ColumnMoveService } from './columns/columnMoveService';
import type { ColumnNameService } from './columns/columnNameService';
import type { ColumnSizeService, ISizeColumnsToFitParams } from './columns/columnSizeService';
import type { ColumnViewportService } from './columns/columnViewportService';
import type { FuncColsService } from './columns/funcColsService';
import type { PivotResultColsService } from './columns/pivotResultColsService';
import type { VisibleColsService } from './columns/visibleColsService';
import { BeanStub } from './context/beanStub';
import type { BeanCollection, BeanName, Context } from './context/context';
import type { CtrlsService } from './ctrlsService';
import type { DragAndDropService } from './dragAndDrop/dragAndDropService';
import type { CellPosition } from './entities/cellPositionUtils';
import type { ColDef, ColGroupDef, ColumnChooserParams, HeaderLocation, IAggFunc } from './entities/colDef';
import type { Column, ColumnPinnedType } from './entities/column';
import type { ColumnGroup } from './entities/columnGroup';
import type { ChartRef, GridOptions } from './entities/gridOptions';
import type { ProvidedColumnGroup } from './entities/providedColumnGroup';
import type { RowNode } from './entities/rowNode';
import { Events } from './eventKeys';
import type {
    AgEvent,
    AgEventListener,
    AgGlobalEventListener,
    ColumnEventType,
    FilterChangedEventSourceType,
    GridPreDestroyedEvent,
    SelectionEventSourceType,
} from './events';
import type { FilterManager } from './filter/filterManager';
import type { FocusService } from './focusService';
import type { DetailGridInfo, GetCellValueParams, GridApi, StartEditingCellParams } from './gridApi';
import { unwrapUserComp } from './gridApi';
import type { GridBodyCtrl } from './gridBodyComp/gridBodyCtrl';
import type { NavigationService } from './gridBodyComp/navigationService';
import type { RowDropZoneEvents, RowDropZoneParams } from './gridBodyComp/rowDragFeature';
import type {
    ChartDownloadParams,
    ChartModel,
    CloseChartToolPanelParams,
    CreateCrossFilterChartParams,
    CreatePivotChartParams,
    CreateRangeChartParams,
    GetChartImageDataUrlParams,
    IChartService,
    OpenChartToolPanelParams,
    UpdateChartParams,
} from './interfaces/IChartService';
import type { CellRange, CellRangeParams, IRangeService } from './interfaces/IRangeService';
import type { ServerSideGroupLevelState } from './interfaces/IServerSideStore';
import type { AdvancedFilterModel } from './interfaces/advancedFilterModel';
import type { CsvExportParams } from './interfaces/exportParams';
import type { GridState } from './interfaces/gridState';
import type { IAggFuncService } from './interfaces/iAggFuncService';
import type { ICellEditor } from './interfaces/iCellEditor';
import type { ClientSideRowModelStep, IClientSideRowModel } from './interfaces/iClientSideRowModel';
import type { IClipboardCopyParams, IClipboardCopyRowsParams, IClipboardService } from './interfaces/iClipboardService';
import type { WithoutGridCommon } from './interfaces/iCommon';
import type { ICsvCreator } from './interfaces/iCsvCreator';
import type { ExcelExportMultipleSheetParams, ExcelExportParams, IExcelCreator } from './interfaces/iExcelCreator';
import { ExcelFactoryMode } from './interfaces/iExcelCreator';
import type { IExpansionService } from './interfaces/iExpansionService';
import type { FilterModel, IFilter } from './interfaces/iFilter';
import type { IHeaderColumn } from './interfaces/iHeaderColumn';
import type { IInfiniteRowModel } from './interfaces/iInfiniteRowModel';
import type { IRowModel, RowModelType } from './interfaces/iRowModel';
import type { IRowNode, RowPinnedType } from './interfaces/iRowNode';
import type { ISelectionService } from './interfaces/iSelectionService';
import type {
    IServerSideRowModel,
    IServerSideTransactionManager,
    RefreshServerSideParams,
} from './interfaces/iServerSideRowModel';
import type { IServerSideGroupSelectionState, IServerSideSelectionState } from './interfaces/iServerSideSelection';
import type { ISideBarService, SideBarDef } from './interfaces/iSideBar';
import type { IStatusBarService } from './interfaces/iStatusBarService';
import type { IStatusPanel } from './interfaces/iStatusPanel';
import type { IToolPanel } from './interfaces/iToolPanel';
import type { RowDataTransaction } from './interfaces/rowDataTransaction';
import type { RowNodeTransaction } from './interfaces/rowNodeTransaction';
import type { ServerSideTransaction, ServerSideTransactionResult } from './interfaces/serverSideTransaction';
import type { AnimationFrameService } from './misc/animationFrameService';
import type { ApiEventService } from './misc/apiEventService';
import type { IContextMenuParams, MenuService } from './misc/menuService';
import type { StateService } from './misc/stateService';
import { ModuleNames } from './modules/moduleNames';
import { ModuleRegistry } from './modules/moduleRegistry';
import type { PaginationProxy } from './pagination/paginationProxy';
import type { PinnedRowModel } from './pinnedRowModel/pinnedRowModel';
import type { ManagedGridOptionKey, ManagedGridOptions } from './propertyKeys';
import type { ICellRenderer } from './rendering/cellRenderers/iCellRenderer';
import type { OverlayService } from './rendering/overlays/overlayService';
import type {
    FlashCellsParams,
    GetCellEditorInstancesParams,
    GetCellRendererInstancesParams,
    RedrawRowsParams,
    RefreshCellsParams,
    RowRenderer,
} from './rendering/rowRenderer';
import type { LoadSuccessParams } from './rowNodeCache/rowNodeBlock';
import type { RowNodeBlockLoader } from './rowNodeCache/rowNodeBlockLoader';
import type { SortController } from './sortController';
import type { UndoRedoService } from './undoRedo/undoRedoService';
import { _warnOnce } from './utils/function';
import { _exists, _missing } from './utils/generic';
import { _iterateObject, _removeAllReferences } from './utils/object';
import { _escapeString } from './utils/string';
import type { ValueCache } from './valueService/valueCache';
import type { ValueService } from './valueService/valueService';

export class GridApiService<TData = any> extends BeanStub implements GridApi {
    beanName: BeanName = 'gridApi';

    private context: Context;
    private rowRenderer: RowRenderer;
    private navigationService: NavigationService;
    private filterManager: FilterManager;
    private columnModel: ColumnModel;
    private columnNameService: ColumnNameService;
    private pivotResultColsService: PivotResultColsService;
    private columnViewportService: ColumnViewportService;
    private visibleColsService: VisibleColsService;
    private columnSizeService: ColumnSizeService;
    private columnGetStateService: ColumnGetStateService;
    private columnGroupStateService: ColumnGroupStateService;
    private columnApplyStateService: ColumnApplyStateService;
    private columnAutosizeService: ColumnAutosizeService;
    private columnMoveService: ColumnMoveService;
    private funcColsService: FuncColsService;
    private selectionService: ISelectionService;
    private valueService: ValueService;
    private pinnedRowModel: PinnedRowModel;
    private rowModel: IRowModel;
    private sortController: SortController;
    private paginationProxy: PaginationProxy;
    private focusService: FocusService;
    private dragAndDropService: DragAndDropService;
    private menuService: MenuService;
    private valueCache: ValueCache;
    private animationFrameService: AnimationFrameService;
    private ctrlsService: CtrlsService;
    private overlayService: OverlayService;
    private stateService: StateService;
    private expansionService: IExpansionService;
    private apiEventService: ApiEventService;
    private undoRedoService: UndoRedoService;
    private rowNodeBlockLoader: RowNodeBlockLoader;

    private csvCreator?: ICsvCreator;
    private excelCreator?: IExcelCreator;
    private rangeService?: IRangeService;
    private clipboardService?: IClipboardService;
    private aggFuncService?: IAggFuncService;
    private statusBarService?: IStatusBarService;
    private chartService?: IChartService;
    private serverSideTransactionManager?: IServerSideTransactionManager;
    private sideBarService?: ISideBarService;

    private gridBodyCtrl: GridBodyCtrl;

    private clientSideRowModel: IClientSideRowModel;
    private infiniteRowModel: IInfiniteRowModel;

    private serverSideRowModel: IServerSideRowModel;

    private detailGridInfoMap: { [id: string]: DetailGridInfo | undefined } = {};

    private destroyCalled = false;

    public wireBeans(beans: BeanCollection): void {
        super.wireBeans(beans);
        this.context = beans.context;
        this.rowRenderer = beans.rowRenderer;
        this.navigationService = beans.navigationService;
        this.filterManager = beans.filterManager;
        this.columnModel = beans.columnModel;
        this.columnNameService = beans.columnNameService;
        this.pivotResultColsService = beans.pivotResultColsService;
        this.columnViewportService = beans.columnViewportService;
        this.visibleColsService = beans.visibleColsService;
        this.columnSizeService = beans.columnSizeService;
        this.columnGetStateService = beans.columnGetStateService;
        this.columnGroupStateService = beans.columnGroupStateService;
        this.columnApplyStateService = beans.columnApplyStateService;
        this.columnAutosizeService = beans.columnAutosizeService;
        this.columnMoveService = beans.columnMoveService;
        this.funcColsService = beans.funcColsService;
        this.selectionService = beans.selectionService;
        this.valueService = beans.valueService;
        this.pinnedRowModel = beans.pinnedRowModel;
        this.rowModel = beans.rowModel;
        this.sortController = beans.sortController;
        this.paginationProxy = beans.paginationProxy;
        this.focusService = beans.focusService;
        this.dragAndDropService = beans.dragAndDropService;
        this.menuService = beans.menuService;
        this.valueCache = beans.valueCache;
        this.animationFrameService = beans.animationFrameService;
        this.ctrlsService = beans.ctrlsService;
        this.overlayService = beans.overlayService;
        this.stateService = beans.stateService;
        this.expansionService = beans.expansionService;
        this.apiEventService = beans.apiEventService;
        this.undoRedoService = beans.undoRedoService;
        this.rowNodeBlockLoader = beans.rowNodeBlockLoader;

        this.csvCreator = beans.csvCreator;
        this.excelCreator = beans.excelCreator;
        this.rangeService = beans.rangeService;
        this.clipboardService = beans.clipboardService;
        this.aggFuncService = beans.aggFuncService;
        this.statusBarService = beans.statusBarService;
        this.chartService = beans.chartService;
        this.serverSideTransactionManager = beans.ssrmTransactionManager;
        this.sideBarService = beans.sideBarService;

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
    }

    public postConstruct(): void {
        this.ctrlsService.whenReady((p) => {
            this.gridBodyCtrl = p.gridBodyCtrl;
        });
    }

    public getGridId(): string {
        return this.gridId;
    }

    public addDetailGridInfo(id: string, gridInfo: DetailGridInfo): void {
        this.detailGridInfoMap[id] = gridInfo;
    }

    public removeDetailGridInfo(id: string): void {
        delete this.detailGridInfoMap[id];
    }

    public getDetailGridInfo(id: string): DetailGridInfo | undefined {
        return this.detailGridInfoMap[id];
    }

    public forEachDetailGridInfo(callback: (gridInfo: DetailGridInfo, index: number) => void) {
        let index = 0;
        _iterateObject(this.detailGridInfoMap, (id: string, gridInfo: DetailGridInfo) => {
            // check for undefined, as old references will still be lying around
            if (_exists(gridInfo)) {
                callback(gridInfo, index);
                index++;
            }
        });
    }

    public getDataAsCsv(params?: CsvExportParams): string | undefined {
        if (ModuleRegistry.__assertRegistered(ModuleNames.CsvExportModule, 'api.getDataAsCsv', this.gridId)) {
            return this.csvCreator!.getDataAsCsv(params);
        }
    }

    public exportDataAsCsv(params?: CsvExportParams): void {
        if (ModuleRegistry.__assertRegistered(ModuleNames.CsvExportModule, 'api.exportDataAsCsv', this.gridId)) {
            this.csvCreator!.exportDataAsCsv(params);
        }
    }

    private assertNotExcelMultiSheet(method: keyof GridApi): boolean {
        if (!ModuleRegistry.__assertRegistered(ModuleNames.ExcelExportModule, 'api.' + method, this.gridId)) {
            return false;
        }
        if (this.excelCreator!.getFactoryMode() === ExcelFactoryMode.MULTI_SHEET) {
            console.warn(
                "AG Grid: The Excel Exporter is currently on Multi Sheet mode. End that operation by calling 'api.getMultipleSheetAsExcel()' or 'api.exportMultipleSheetsAsExcel()'"
            );
            return false;
        }
        return true;
    }

    public getDataAsExcel(params?: ExcelExportParams): string | Blob | undefined {
        if (this.assertNotExcelMultiSheet('getDataAsExcel')) {
            return this.excelCreator!.getDataAsExcel(params);
        }
    }

    public exportDataAsExcel(params?: ExcelExportParams): void {
        if (this.assertNotExcelMultiSheet('exportDataAsExcel')) {
            this.excelCreator!.exportDataAsExcel(params);
        }
    }

    public getSheetDataForExcel(params?: ExcelExportParams): string | undefined {
        if (
            !ModuleRegistry.__assertRegistered(ModuleNames.ExcelExportModule, 'api.getSheetDataForExcel', this.gridId)
        ) {
            return;
        }
        this.excelCreator!.setFactoryMode(ExcelFactoryMode.MULTI_SHEET);

        return this.excelCreator!.getSheetDataForExcel(params);
    }

    public getMultipleSheetsAsExcel(params: ExcelExportMultipleSheetParams): Blob | undefined {
        if (
            ModuleRegistry.__assertRegistered(
                ModuleNames.ExcelExportModule,
                'api.getMultipleSheetsAsExcel',
                this.gridId
            )
        ) {
            return this.excelCreator!.getMultipleSheetsAsExcel(params);
        }
    }

    public exportMultipleSheetsAsExcel(params: ExcelExportMultipleSheetParams): void {
        if (
            ModuleRegistry.__assertRegistered(
                ModuleNames.ExcelExportModule,
                'api.exportMultipleSheetsAsExcel',
                this.gridId
            )
        ) {
            this.excelCreator!.exportMultipleSheetsAsExcel(params);
        }
    }

    public setGridAriaProperty(property: string, value: string | null): void {
        if (!property) {
            return;
        }
        const eGrid = this.ctrlsService.getGridBodyCtrl().getGui();
        const ariaProperty = `aria-${property}`;

        if (value === null) {
            eGrid.removeAttribute(ariaProperty);
        } else {
            eGrid.setAttribute(ariaProperty, value);
        }
    }

    private logMissingRowModel(apiMethod: keyof GridApi, ...requiredRowModels: RowModelType[]) {
        console.error(
            `AG Grid: api.${apiMethod} can only be called when gridOptions.rowModelType is ${requiredRowModels.join(' or ')}`
        );
    }

    private logDeprecation(
        version: string,
        apiMethod: StartsWithGridApi,
        replacement: StartsWithGridApi,
        message?: string
    ) {
        _warnOnce(
            `Since ${version} api.${apiMethod} is deprecated. Please use ${replacement} instead. ${message ?? ''}`
        );
    }

    public getPinnedTopRowCount(): number {
        return this.pinnedRowModel.getPinnedTopRowCount();
    }

    public getPinnedBottomRowCount(): number {
        return this.pinnedRowModel.getPinnedBottomRowCount();
    }

    public getPinnedTopRow(index: number): IRowNode | undefined {
        return this.pinnedRowModel.getPinnedTopRow(index);
    }

    public getPinnedBottomRow(index: number): IRowNode | undefined {
        return this.pinnedRowModel.getPinnedBottomRow(index);
    }

    public expireValueCache(): void {
        this.valueCache.expire();
    }

    public getVerticalPixelRange(): { top: number; bottom: number } {
        return this.gridBodyCtrl.getScrollFeature().getVScrollPosition();
    }

    public getHorizontalPixelRange(): { left: number; right: number } {
        return this.gridBodyCtrl.getScrollFeature().getHScrollPosition();
    }

    public refreshCells(params: RefreshCellsParams<TData> = {}): void {
        this.frameworkOverrides.wrapIncoming(() => this.rowRenderer.refreshCells(params));
    }

    public flashCells(params: FlashCellsParams<TData> = {}): void {
        const warning = (prop: 'fade' | 'flash') =>
            _warnOnce(
                `Since v31.1 api.flashCells parameter '${prop}Delay' is deprecated. Please use '${prop}Duration' instead.`
            );
        if (_exists(params.fadeDelay)) {
            warning('fade');
        }
        if (_exists(params.flashDelay)) {
            warning('flash');
        }

        this.frameworkOverrides.wrapIncoming(() => this.rowRenderer.flashCells(params));
    }

    public redrawRows(params: RedrawRowsParams<TData> = {}): void {
        const rowNodes = params ? params.rowNodes : undefined;
        this.frameworkOverrides.wrapIncoming(() => this.rowRenderer.redrawRows(rowNodes));
    }

    public refreshHeader() {
        this.frameworkOverrides.wrapIncoming(() =>
            this.ctrlsService.getHeaderRowContainerCtrls().forEach((c) => c.refresh())
        );
    }

    public isAnyFilterPresent(): boolean {
        return this.filterManager.isAnyFilterPresent();
    }

    public isColumnFilterPresent(): boolean {
        return this.filterManager.isColumnFilterPresent() || this.filterManager.isAggregateFilterPresent();
    }

    public isQuickFilterPresent(): boolean {
        return this.filterManager.isQuickFilterPresent();
    }

    public getModel(): IRowModel {
        _warnOnce('Since v31.1 getModel() is deprecated. Please use the appropriate grid API methods instead.');
        return this.rowModel;
    }

    public setRowNodeExpanded(
        rowNode: IRowNode,
        expanded: boolean,
        expandParents?: boolean,
        forceSync?: boolean
    ): void {
        this.expansionService.setRowNodeExpanded(rowNode, expanded, expandParents, forceSync);
    }

    public onGroupExpandedOrCollapsed() {
        if (_missing(this.clientSideRowModel)) {
            this.logMissingRowModel('onGroupExpandedOrCollapsed', 'clientSide');
            return;
        }
        this.expansionService.onGroupExpandedOrCollapsed();
    }

    public refreshClientSideRowModel(step?: ClientSideRowModelStep): any {
        if (_missing(this.clientSideRowModel)) {
            this.logMissingRowModel('refreshClientSideRowModel', 'clientSide');
            return;
        }

        this.clientSideRowModel.refreshModel(step);
    }

    public isAnimationFrameQueueEmpty(): boolean {
        return this.animationFrameService.isQueueEmpty();
    }

    public flushAllAnimationFrames(): void {
        this.animationFrameService.flushAllFrames();
    }

    public getRowNode(id: string): IRowNode<TData> | undefined {
        return this.rowModel.getRowNode(id);
    }

    public getSizesForCurrentTheme() {
        return {
            rowHeight: this.gos.getRowHeightAsNumber(),
            headerHeight: this.columnModel.getHeaderHeight(),
        };
    }

    public expandAll() {
        if (this.clientSideRowModel || this.serverSideRowModel) {
            this.expansionService.expandAll(true);
        } else {
            this.logMissingRowModel('expandAll', 'clientSide', 'serverSide');
        }
    }

    public collapseAll() {
        if (this.clientSideRowModel || this.serverSideRowModel) {
            this.expansionService.expandAll(false);
        } else {
            this.logMissingRowModel('collapseAll', 'clientSide', 'serverSide');
        }
    }

    public addRenderedRowListener(eventName: string, rowIndex: number, callback: Function) {
        this.rowRenderer.addRenderedRowListener(eventName, rowIndex, callback as any);
    }

    public getQuickFilter(): string | undefined {
        return this.gos.get('quickFilterText');
    }

    public getAdvancedFilterModel(): AdvancedFilterModel | null {
        if (
            ModuleRegistry.__assertRegistered(
                ModuleNames.AdvancedFilterModule,
                'api.getAdvancedFilterModel',
                this.gridId
            )
        ) {
            return this.filterManager.getAdvancedFilterModel();
        }
        return null;
    }

    public setAdvancedFilterModel(advancedFilterModel: AdvancedFilterModel | null): void {
        this.filterManager.setAdvancedFilterModel(advancedFilterModel);
    }

    public showAdvancedFilterBuilder(): void {
        if (
            ModuleRegistry.__assertRegistered(
                ModuleNames.AdvancedFilterModule,
                'api.setAdvancedFilterModel',
                this.gridId
            )
        ) {
            this.filterManager.showAdvancedFilterBuilder('api');
        }
    }

    public setNodesSelected(params: { nodes: IRowNode[]; newValue: boolean; source?: SelectionEventSourceType }) {
        const allNodesValid = params.nodes.every((node) => {
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

    public selectAll(source: SelectionEventSourceType = 'apiSelectAll') {
        this.selectionService.selectAllRowNodes({ source });
    }

    public deselectAll(source: SelectionEventSourceType = 'apiSelectAll') {
        this.selectionService.deselectAllRowNodes({ source });
    }

    public selectAllFiltered(source: SelectionEventSourceType = 'apiSelectAllFiltered') {
        this.selectionService.selectAllRowNodes({ source, justFiltered: true });
    }

    public deselectAllFiltered(source: SelectionEventSourceType = 'apiSelectAllFiltered') {
        this.selectionService.deselectAllRowNodes({ source, justFiltered: true });
    }

    public getServerSideSelectionState(): IServerSideSelectionState | IServerSideGroupSelectionState | null {
        if (_missing(this.serverSideRowModel)) {
            this.logMissingRowModel('getServerSideSelectionState', 'serverSide');
            return null;
        }

        return this.selectionService.getSelectionState() as
            | IServerSideSelectionState
            | IServerSideGroupSelectionState
            | null;
    }

    public setServerSideSelectionState(state: IServerSideSelectionState | IServerSideGroupSelectionState) {
        if (_missing(this.serverSideRowModel)) {
            this.logMissingRowModel('setServerSideSelectionState', 'serverSide');
            return;
        }

        this.selectionService.setSelectionState(state, 'api');
    }

    public selectAllOnCurrentPage(source: SelectionEventSourceType = 'apiSelectAllCurrentPage') {
        this.selectionService.selectAllRowNodes({ source, justCurrentPage: true });
    }

    public deselectAllOnCurrentPage(source: SelectionEventSourceType = 'apiSelectAllCurrentPage') {
        this.selectionService.deselectAllRowNodes({ source, justCurrentPage: true });
    }

    public showLoadingOverlay(): void {
        this.overlayService.showLoadingOverlay();
    }

    public showNoRowsOverlay(): void {
        this.overlayService.showNoRowsOverlay();
    }

    public hideOverlay(): void {
        this.overlayService.hideOverlay();
    }

    public getSelectedNodes(): IRowNode<TData>[] {
        return this.selectionService.getSelectedNodes();
    }

    public getSelectedRows(): TData[] {
        return this.selectionService.getSelectedRows();
    }

    public getBestCostNodeSelection(): IRowNode<TData>[] | undefined {
        if (_missing(this.clientSideRowModel)) {
            this.logMissingRowModel('getBestCostNodeSelection', 'clientSide');
            return;
        }
        return this.selectionService.getBestCostNodeSelection();
    }

    public getRenderedNodes(): IRowNode<TData>[] {
        return this.rowRenderer.getRenderedNodes();
    }

    public ensureColumnVisible(key: string | Column, position: 'auto' | 'start' | 'middle' | 'end' = 'auto') {
        this.frameworkOverrides.wrapIncoming(
            () => this.gridBodyCtrl.getScrollFeature().ensureColumnVisible(key, position),
            'ensureVisible'
        );
    }

    public ensureIndexVisible(index: number, position?: 'top' | 'bottom' | 'middle' | null) {
        this.frameworkOverrides.wrapIncoming(
            () => this.gridBodyCtrl.getScrollFeature().ensureIndexVisible(index, position),
            'ensureVisible'
        );
    }

    public ensureNodeVisible(
        nodeSelector: TData | IRowNode<TData> | ((row: IRowNode<TData>) => boolean),
        position: 'top' | 'bottom' | 'middle' | null = null
    ) {
        this.frameworkOverrides.wrapIncoming(
            () => this.gridBodyCtrl.getScrollFeature().ensureNodeVisible(nodeSelector, position),
            'ensureVisible'
        );
    }

    public forEachLeafNode(callback: (rowNode: IRowNode<TData>) => void) {
        if (_missing(this.clientSideRowModel)) {
            this.logMissingRowModel('forEachLeafNode', 'clientSide');
            return;
        }
        this.clientSideRowModel.forEachLeafNode(callback);
    }

    public forEachNode(callback: (rowNode: IRowNode<TData>, index: number) => void, includeFooterNodes?: boolean) {
        this.rowModel.forEachNode(callback, includeFooterNodes);
    }

    public forEachNodeAfterFilter(callback: (rowNode: IRowNode<TData>, index: number) => void) {
        if (_missing(this.clientSideRowModel)) {
            this.logMissingRowModel('forEachNodeAfterFilter', 'clientSide');
            return;
        }
        this.clientSideRowModel.forEachNodeAfterFilter(callback);
    }

    public forEachNodeAfterFilterAndSort(callback: (rowNode: IRowNode<TData>, index: number) => void) {
        if (_missing(this.clientSideRowModel)) {
            this.logMissingRowModel('forEachNodeAfterFilterAndSort', 'clientSide');
            return;
        }
        this.clientSideRowModel.forEachNodeAfterFilterAndSort(callback);
    }

    public getFilterInstance<TFilter extends IFilter>(
        key: string | Column,
        callback?: (filter: TFilter | null) => void
    ): TFilter | null | undefined {
        _warnOnce(
            `'getFilterInstance' is deprecated. To get/set individual filter models, use 'getColumnFilterModel' or 'setColumnFilterModel' instead. To get hold of the filter instance, use 'getColumnFilterInstance' which returns the instance asynchronously.`
        );
        return this.filterManager.getFilterInstance(key, callback);
    }

    public getColumnFilterInstance<TFilter extends IFilter>(key: string | Column): Promise<TFilter | null | undefined> {
        return this.filterManager.getColumnFilterInstance(key);
    }

    public destroyFilter(key: string | Column) {
        const column = this.columnModel.getColDefCol(key);
        if (column) {
            return this.filterManager.destroyFilter(column, 'api');
        }
    }

    public getStatusPanel<TStatusPanel = IStatusPanel>(key: string): TStatusPanel | undefined {
        if (!ModuleRegistry.__assertRegistered(ModuleNames.StatusBarModule, 'api.getStatusPanel', this.gridId)) {
            return;
        }
        const comp = this.statusBarService!.getStatusPanel(key);
        return unwrapUserComp(comp) as any;
    }

    public getColumnDef<TValue = any>(key: string | Column<TValue>): ColDef<TData, TValue> | null {
        const column = this.columnModel.getColDefCol(key);
        if (column) {
            return column.getColDef();
        }
        return null;
    }

    public getColumnDefs(): (ColDef<TData> | ColGroupDef<TData>)[] | undefined {
        return this.columnModel.getColumnDefs();
    }

    public onFilterChanged(source: FilterChangedEventSourceType = 'api') {
        this.filterManager.onFilterChanged({ source });
    }

    public onSortChanged() {
        this.sortController.onSortChanged('api');
    }

    public setFilterModel(model: FilterModel | null): void {
        this.frameworkOverrides.wrapIncoming(() => this.filterManager.setFilterModel(model));
    }

    public getFilterModel(): FilterModel {
        return this.filterManager.getFilterModel();
    }

    public getColumnFilterModel<TModel>(column: string | Column): TModel | null {
        return this.filterManager.getColumnFilterModel(column);
    }

    public setColumnFilterModel<TModel>(column: string | Column, model: TModel | null): Promise<void> {
        return this.filterManager.setColumnFilterModel(column, model);
    }

    public getFocusedCell(): CellPosition | null {
        return this.focusService.getFocusedCell();
    }

    public clearFocusedCell(): void {
        return this.focusService.clearFocusedCell();
    }

    public setFocusedCell(rowIndex: number, colKey: string | Column, rowPinned?: RowPinnedType) {
        this.focusService.setFocusedCell({ rowIndex, column: colKey, rowPinned, forceBrowserFocus: true });
    }

    public addRowDropZone(params: RowDropZoneParams): void {
        this.gridBodyCtrl.getRowDragFeature().addRowDropZone(params);
    }

    public removeRowDropZone(params: RowDropZoneParams): void {
        const activeDropTarget = this.dragAndDropService.findExternalZone(params);

        if (activeDropTarget) {
            this.dragAndDropService.removeDropTarget(activeDropTarget);
        }
    }

    public getRowDropZoneParams(events?: RowDropZoneEvents): RowDropZoneParams {
        return this.gridBodyCtrl.getRowDragFeature().getRowDropZone(events);
    }

    private assertSideBarLoaded(apiMethod: keyof GridApi): boolean {
        return ModuleRegistry.__assertRegistered(ModuleNames.SideBarModule, 'api.' + apiMethod, this.gridId);
    }

    public isSideBarVisible(): boolean {
        return this.assertSideBarLoaded('isSideBarVisible') && this.sideBarService!.getSideBarComp().isDisplayed();
    }

    public setSideBarVisible(show: boolean) {
        if (this.assertSideBarLoaded('setSideBarVisible')) {
            this.sideBarService!.getSideBarComp().setDisplayed(show);
        }
    }

    public setSideBarPosition(position: 'left' | 'right') {
        if (this.assertSideBarLoaded('setSideBarPosition')) {
            this.sideBarService!.getSideBarComp().setSideBarPosition(position);
        }
    }

    public openToolPanel(key: string) {
        if (this.assertSideBarLoaded('openToolPanel')) {
            this.sideBarService!.getSideBarComp().openToolPanel(key, 'api');
        }
    }

    public closeToolPanel() {
        if (this.assertSideBarLoaded('closeToolPanel')) {
            this.sideBarService!.getSideBarComp().close('api');
        }
    }

    public getOpenedToolPanel(): string | null {
        if (this.assertSideBarLoaded('getOpenedToolPanel')) {
            return this.sideBarService!.getSideBarComp().openedItem();
        }
        return null;
    }

    public refreshToolPanel(): void {
        if (this.assertSideBarLoaded('refreshToolPanel')) {
            this.sideBarService!.getSideBarComp().refresh();
        }
    }

    public isToolPanelShowing(): boolean {
        return (
            this.assertSideBarLoaded('isToolPanelShowing') && this.sideBarService!.getSideBarComp().isToolPanelShowing()
        );
    }

    public getToolPanelInstance<TToolPanel = IToolPanel>(id: string): TToolPanel | undefined {
        if (this.assertSideBarLoaded('getToolPanelInstance')) {
            const comp = this.sideBarService!.getSideBarComp().getToolPanelInstance(id);
            return unwrapUserComp(comp) as any;
        }
    }

    public getSideBar(): SideBarDef | undefined {
        if (this.assertSideBarLoaded('getSideBar')) {
            return this.sideBarService!.getSideBarComp().getDef();
        }
        return undefined;
    }

    public resetRowHeights() {
        if (_exists(this.clientSideRowModel)) {
            if (this.columnModel.isAutoRowHeightActive()) {
                console.warn('AG Grid: calling gridApi.resetRowHeights() makes no sense when using Auto Row Height.');
                return;
            }
            this.clientSideRowModel.resetRowHeights();
        }
    }

    public setRowCount(rowCount: number, maxRowFound?: boolean): void {
        if (this.serverSideRowModel) {
            if (this.funcColsService.isRowGroupEmpty()) {
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

    public onRowHeightChanged() {
        if (this.clientSideRowModel) {
            this.clientSideRowModel.onRowHeightChanged();
        } else if (this.serverSideRowModel) {
            this.serverSideRowModel.onRowHeightChanged();
        }
    }

    public getValue<TValue = any>(colKey: string | Column<TValue>, rowNode: IRowNode): TValue | null | undefined {
        this.logDeprecation('31.3', 'getValue', 'getCellValue');
        return this.getCellValue({ colKey, rowNode }) as TValue | null | undefined;
    }

    public getCellValue<TValue = any>(params: GetCellValueParams<TValue>): any {
        const { colKey, rowNode, useFormatter } = params;

        const column = this.columnModel.getColDefCol(colKey) ?? this.columnModel.getCol(colKey);
        if (_missing(column)) {
            return null;
        }

        const value = this.valueService.getValue(column, rowNode);

        if (useFormatter) {
            const formattedValue = this.valueService.formatValue(column, rowNode, value);
            // Match the logic in the default cell renderer insertValueWithoutCellRenderer if no formatter is used
            return formattedValue ?? _escapeString(value, true);
        }

        return value;
    }

    public addEventListener(eventType: string, listener: Function): void {
        this.apiEventService.addEventListener(eventType, listener as AgEventListener);
    }

    public addGlobalListener(listener: Function): void {
        this.apiEventService.addGlobalListener(listener as AgGlobalEventListener);
    }

    public removeEventListener(eventType: string, listener: Function): void {
        this.apiEventService.removeEventListener(eventType, listener as AgEventListener);
    }

    public removeGlobalListener(listener: Function): void {
        this.apiEventService.removeGlobalListener(listener as AgGlobalEventListener);
    }

    public dispatchEvent(event: AgEvent): void {
        this.eventService.dispatchEvent(event);
    }

    public destroy(): void {
        // Get framework link before this is destroyed
        const preDestroyLink = `See ${this.frameworkOverrides.getDocLink('grid-lifecycle/#grid-pre-destroyed')}`;

        // this is needed as GridAPI is a bean, and GridAPI.destroy() is called as part
        // of context.destroy(). so we need to stop the infinite loop.
        if (this.destroyCalled) {
            return;
        }

        const event: WithoutGridCommon<GridPreDestroyedEvent<TData>> = {
            type: Events.EVENT_GRID_PRE_DESTROYED,
            state: this.getState(),
        };
        this.dispatchEvent(event);

        // Set after pre-destroy so user can still use the api in pre-destroy event and it is not marked as destroyed yet.
        this.destroyCalled = true;

        // destroy the UI first (as they use the services)
        this.ctrlsService.get('gridCtrl')?.destroyGridUi();

        // destroy the services
        this.context.destroy();

        this.detailGridInfoMap = {};

        // some users were raising support issues with regards memory leaks. the problem was the customers applications
        // were keeping references to the API. trying to educate them all would be difficult, easier to just remove
        // all references in the API so at least the core grid can be garbage collected.
        _removeAllReferences<GridApi>(this, ['isDestroyed'], preDestroyLink);
    }

    public isDestroyed(): boolean {
        return this.destroyCalled;
    }

    public resetQuickFilter(): void {
        this.filterManager.resetQuickFilterCache();
    }

    public getCellRanges(): CellRange[] | null {
        if (this.rangeService) {
            return this.rangeService.getCellRanges();
        }

        ModuleRegistry.__assertRegistered(ModuleNames.RangeSelectionModule, 'api.getCellRanges', this.gridId);
        return null;
    }

    public addCellRange(params: CellRangeParams): void {
        if (this.rangeService) {
            this.rangeService.addCellRange(params);
            return;
        }
        ModuleRegistry.__assertRegistered(ModuleNames.RangeSelectionModule, 'api.addCellRange', this.gridId);
    }

    public clearRangeSelection(): void {
        if (this.rangeService) {
            this.rangeService.removeAllCellRanges();
        }
        ModuleRegistry.__assertRegistered(ModuleNames.RangeSelectionModule, 'gridApi.clearRangeSelection', this.gridId);
    }

    public undoCellEditing(): void {
        this.undoRedoService.undo('api');
    }

    public redoCellEditing(): void {
        this.undoRedoService.redo('api');
    }

    public getCurrentUndoSize(): number {
        return this.undoRedoService.getCurrentUndoStackSize();
    }

    public getCurrentRedoSize(): number {
        return this.undoRedoService.getCurrentRedoStackSize();
    }

    private assertChart<T>(methodName: keyof GridApi, func: () => T): T | undefined {
        if (ModuleRegistry.__assertRegistered(ModuleNames.GridChartsModule, 'api.' + methodName, this.gridId)) {
            return this.frameworkOverrides.wrapIncoming(() => func());
        }
    }

    public getChartModels(): ChartModel[] | undefined {
        return this.assertChart('getChartModels', () => this.chartService!.getChartModels());
    }

    public getChartRef(chartId: string): ChartRef | undefined {
        return this.assertChart('getChartRef', () => this.chartService!.getChartRef(chartId));
    }

    public getChartImageDataURL(params: GetChartImageDataUrlParams): string | undefined {
        return this.assertChart('getChartImageDataURL', () => this.chartService!.getChartImageDataURL(params));
    }

    public downloadChart(params: ChartDownloadParams) {
        return this.assertChart('downloadChart', () => this.chartService!.downloadChart(params));
    }

    public openChartToolPanel(params: OpenChartToolPanelParams) {
        return this.assertChart('openChartToolPanel', () => this.chartService!.openChartToolPanel(params));
    }

    public closeChartToolPanel(params: CloseChartToolPanelParams) {
        return this.assertChart('closeChartToolPanel', () => this.chartService!.closeChartToolPanel(params.chartId));
    }

    public createRangeChart(params: CreateRangeChartParams): ChartRef | undefined {
        return this.assertChart('createRangeChart', () => this.chartService!.createRangeChart(params));
    }

    public createPivotChart(params: CreatePivotChartParams): ChartRef | undefined {
        return this.assertChart('createPivotChart', () => this.chartService!.createPivotChart(params));
    }

    public createCrossFilterChart(params: CreateCrossFilterChartParams): ChartRef | undefined {
        return this.assertChart('createCrossFilterChart', () => this.chartService!.createCrossFilterChart(params));
    }

    public updateChart(params: UpdateChartParams): void {
        return this.assertChart('updateChart', () => this.chartService!.updateChart(params));
    }

    public restoreChart(chartModel: ChartModel, chartContainer?: HTMLElement): ChartRef | undefined {
        return this.assertChart('restoreChart', () => this.chartService!.restoreChart(chartModel, chartContainer));
    }

    private assertClipboard<T>(methodName: keyof GridApi, func: () => T): void {
        if (ModuleRegistry.__assertRegistered(ModuleNames.ClipboardModule, 'api' + methodName, this.gridId)) {
            func();
        }
    }

    public copyToClipboard(params?: IClipboardCopyParams) {
        this.assertClipboard('copyToClipboard', () => this.clipboardService!.copyToClipboard(params));
    }

    public cutToClipboard(params?: IClipboardCopyParams) {
        this.assertClipboard('cutToClipboard', () => this.clipboardService!.cutToClipboard(params));
    }

    public copySelectedRowsToClipboard(params?: IClipboardCopyRowsParams): void {
        this.assertClipboard('copySelectedRowsToClipboard', () =>
            this.clipboardService!.copySelectedRowsToClipboard(params)
        );
    }

    public copySelectedRangeToClipboard(params?: IClipboardCopyParams): void {
        this.assertClipboard('copySelectedRangeToClipboard', () =>
            this.clipboardService!.copySelectedRangeToClipboard(params)
        );
    }

    public copySelectedRangeDown(): void {
        this.assertClipboard('copySelectedRangeDown', () => this.clipboardService!.copyRangeDown());
    }

    public pasteFromClipboard(): void {
        this.assertClipboard('pasteFromClipboard', () => this.clipboardService!.pasteFromClipboard());
    }

    public showColumnMenuAfterButtonClick(colKey: string | Column, buttonElement: HTMLElement): void {
        _warnOnce(
            `'showColumnMenuAfterButtonClick' is deprecated. Use 'IHeaderParams.showColumnMenu' within a header component, or 'api.showColumnMenu' elsewhere.`
        );
        // use grid column so works with pivot mode
        const column = this.columnModel.getCol(colKey)!;
        this.menuService.showColumnMenu({
            column,
            buttonElement,
            positionBy: 'button',
        });
    }

    public showColumnMenuAfterMouseClick(colKey: string | Column, mouseEvent: MouseEvent | Touch): void {
        _warnOnce(
            `'showColumnMenuAfterMouseClick' is deprecated. Use 'IHeaderParams.showColumnMenuAfterMouseClick' within a header component, or 'api.showColumnMenu' elsewhere.`
        );
        // use grid column so works with pivot mode
        let column = this.columnModel.getCol(colKey);
        if (!column) {
            column = this.columnModel.getColDefCol(colKey);
        }
        if (!column) {
            console.error(`AG Grid: column '${colKey}' not found`);
            return;
        }
        this.menuService.showColumnMenu({
            column,
            mouseEvent,
            positionBy: 'mouse',
        });
    }

    public showContextMenu(params?: IContextMenuParams) {
        const { rowNode, column, value, x, y } = params || {};
        let { x: clientX, y: clientY } = this.menuService.getContextMenuPosition(rowNode, column);

        if (x != null) {
            clientX = x;
        }

        if (y != null) {
            clientY = y;
        }

        this.menuService.showContextMenu({
            mouseEvent: new MouseEvent('mousedown', { clientX, clientY }),
            rowNode,
            column,
            value,
        });
    }

    public showColumnChooser(params?: ColumnChooserParams): void {
        this.menuService.showColumnChooser({ chooserParams: params });
    }

    public showColumnFilter(colKey: string | Column): void {
        const column = this.columnModel.getCol(colKey);
        if (!column) {
            console.error(`AG Grid: column '${colKey}' not found`);
            return;
        }
        this.menuService.showFilterMenu({
            column,
            containerType: 'columnFilter',
            positionBy: 'auto',
        });
    }

    public showColumnMenu(colKey: string | Column): void {
        const column = this.columnModel.getCol(colKey);
        if (!column) {
            console.error(`AG Grid: column '${colKey}' not found`);
            return;
        }
        this.menuService.showColumnMenu({
            column,
            positionBy: 'auto',
        });
    }

    public hidePopupMenu(): void {
        this.menuService.hidePopupMenu();
    }

    public hideColumnChooser(): void {
        this.menuService.hideColumnChooser();
    }

    public tabToNextCell(event?: KeyboardEvent): boolean {
        return this.navigationService.tabToNextCell(false, event);
    }

    public tabToPreviousCell(event?: KeyboardEvent): boolean {
        return this.navigationService.tabToNextCell(true, event);
    }

    public getCellRendererInstances(params: GetCellRendererInstancesParams<TData> = {}): ICellRenderer[] {
        const res = this.rowRenderer.getCellRendererInstances(params);
        const unwrapped = res.map(unwrapUserComp);
        return unwrapped;
    }

    public getCellEditorInstances(params: GetCellEditorInstancesParams<TData> = {}): ICellEditor[] {
        const res = this.rowRenderer.getCellEditorInstances(params);
        const unwrapped = res.map(unwrapUserComp);
        return unwrapped;
    }

    public getEditingCells(): CellPosition[] {
        return this.rowRenderer.getEditingCells();
    }

    public stopEditing(cancel: boolean = false): void {
        this.rowRenderer.stopEditing(cancel);
    }

    public startEditingCell(params: StartEditingCellParams): void {
        const column = this.columnModel.getCol(params.colKey);
        if (!column) {
            console.warn(`AG Grid: no column found for ${params.colKey}`);
            return;
        }
        const cellPosition: CellPosition = {
            rowIndex: params.rowIndex,
            rowPinned: params.rowPinned || null,
            column: column,
        };
        const notPinned = params.rowPinned == null;
        if (notPinned) {
            this.ensureIndexVisible(params.rowIndex);
        }

        this.ensureColumnVisible(params.colKey);

        const cell = this.navigationService.getCellByPosition(cellPosition);
        if (!cell) {
            return;
        }
        if (!this.focusService.isCellFocused(cellPosition)) {
            this.focusService.setFocusedCell(cellPosition);
        }
        cell.startRowOrCellEdit(params.key);
    }

    public addAggFunc(key: string, aggFunc: IAggFunc): void {
        this.logDeprecation('v31.1', 'addAggFunc(key, func)', 'addAggFuncs({ key: func })');
        if (this.aggFuncService) {
            this.aggFuncService.addAggFuncs({ key: aggFunc });
        }
    }

    public addAggFuncs(aggFuncs: { [key: string]: IAggFunc }): void {
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
            this.logMissingRowModel('applyServerSideTransaction', 'serverSide');
            return;
        }
        return this.serverSideTransactionManager.applyTransaction(transaction);
    }

    public applyServerSideTransactionAsync(
        transaction: ServerSideTransaction,
        callback?: (res: ServerSideTransactionResult) => void
    ): void {
        if (!this.serverSideTransactionManager) {
            this.logMissingRowModel('applyServerSideTransactionAsync', 'serverSide');
            return;
        }
        return this.serverSideTransactionManager.applyTransactionAsync(transaction, callback);
    }

    public applyServerSideRowData(params: { successParams: LoadSuccessParams; route?: string[]; startRow?: number }) {
        const startRow = params.startRow ?? 0;
        const route = params.route ?? [];
        if (startRow < 0) {
            console.warn(`AG Grid: invalid value ${params.startRow} for startRow, the value should be >= 0`);
            return;
        }

        if (this.serverSideRowModel) {
            this.serverSideRowModel.applyRowData(params.successParams, startRow, route);
        } else {
            this.logMissingRowModel('applyServerSideRowData', 'serverSide');
        }
    }

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

    public applyTransaction(
        rowDataTransaction: RowDataTransaction<TData>
    ): RowNodeTransaction<TData> | null | undefined {
        if (!this.clientSideRowModel) {
            this.logMissingRowModel('applyTransaction', 'clientSide');
            return;
        }
        return this.frameworkOverrides.wrapIncoming(() => this.clientSideRowModel.updateRowData(rowDataTransaction));
    }

    public applyTransactionAsync(
        rowDataTransaction: RowDataTransaction<TData>,
        callback?: (res: RowNodeTransaction<TData>) => void
    ): void {
        if (!this.clientSideRowModel) {
            this.logMissingRowModel('applyTransactionAsync', 'clientSide');
            return;
        }
        this.frameworkOverrides.wrapIncoming(() =>
            this.clientSideRowModel.batchUpdateRowData(rowDataTransaction, callback)
        );
    }

    public flushAsyncTransactions(): void {
        if (!this.clientSideRowModel) {
            this.logMissingRowModel('flushAsyncTransactions', 'clientSide');
            return;
        }
        this.frameworkOverrides.wrapIncoming(() => this.clientSideRowModel.flushAsyncTransactions());
    }

    public refreshInfiniteCache(): void {
        if (this.infiniteRowModel) {
            this.infiniteRowModel.refreshCache();
        } else {
            this.logMissingRowModel('refreshInfiniteCache', 'infinite');
        }
    }

    public purgeInfiniteCache(): void {
        if (this.infiniteRowModel) {
            this.infiniteRowModel.purgeCache();
        } else {
            this.logMissingRowModel('purgeInfiniteCache', 'infinite');
        }
    }

    public refreshServerSide(params?: RefreshServerSideParams): void {
        if (!this.serverSideRowModel) {
            this.logMissingRowModel('refreshServerSide', 'serverSide');
            return;
        }
        this.serverSideRowModel.refreshStore(params);
    }

    public getServerSideGroupLevelState(): ServerSideGroupLevelState[] {
        if (!this.serverSideRowModel) {
            this.logMissingRowModel('getServerSideGroupLevelState', 'serverSide');
            return [];
        }
        return this.serverSideRowModel.getStoreState();
    }

    public getInfiniteRowCount(): number | undefined {
        if (this.infiniteRowModel) {
            return this.infiniteRowModel.getRowCount();
        } else {
            this.logMissingRowModel('getInfiniteRowCount', 'infinite');
        }
    }

    public isLastRowIndexKnown(): boolean | undefined {
        if (this.infiniteRowModel) {
            return this.infiniteRowModel.isLastRowIndexKnown();
        } else {
            this.logMissingRowModel('isLastRowIndexKnown', 'infinite');
        }
    }

    public getCacheBlockState(): any {
        return this.rowNodeBlockLoader.getBlockState();
    }

    public getFirstDisplayedRow(): number {
        this.logDeprecation('v31.1', 'getFirstDisplayedRow', 'getFirstDisplayedRowIndex');
        return this.getFirstDisplayedRowIndex();
    }

    public getFirstDisplayedRowIndex(): number {
        return this.rowRenderer.getFirstVirtualRenderedRow();
    }

    public getLastDisplayedRow(): number {
        this.logDeprecation('v31.1', 'getLastDisplayedRow', 'getLastDisplayedRowIndex');
        return this.getLastDisplayedRowIndex();
    }

    public getLastDisplayedRowIndex(): number {
        return this.rowRenderer.getLastVirtualRenderedRow();
    }

    public getDisplayedRowAtIndex(index: number): IRowNode<TData> | undefined {
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

    public sizeColumnsToFit(paramsOrGridWidth?: ISizeColumnsToFitParams | number) {
        if (typeof paramsOrGridWidth === 'number') {
            this.columnSizeService.sizeColumnsToFit(paramsOrGridWidth, 'api');
        } else {
            this.gridBodyCtrl.sizeColumnsToFit(paramsOrGridWidth);
        }
    }

    public setColumnGroupOpened(group: ProvidedColumnGroup | string, newValue: boolean): void {
        this.columnModel.setColumnGroupOpened(group, newValue, 'api');
    }

    public getColumnGroup(name: string, instanceId?: number): ColumnGroup | null {
        return this.visibleColsService.getColumnGroup(name, instanceId);
    }

    public getProvidedColumnGroup(name: string): ProvidedColumnGroup | null {
        return this.columnModel.getProvidedColGroup(name);
    }

    public getDisplayNameForColumn(column: Column, location: HeaderLocation): string {
        return this.columnNameService.getDisplayNameForColumn(column, location) || '';
    }

    public getDisplayNameForColumnGroup(columnGroup: ColumnGroup, location: HeaderLocation): string {
        return this.columnNameService.getDisplayNameForColumnGroup(columnGroup, location) || '';
    }

    public getColumn<TValue = any>(key: string | ColDef<TData, TValue> | Column<TValue>): Column<TValue> | null {
        return this.columnModel.getColDefCol(key);
    }

    public getColumns(): Column[] | null {
        return this.columnModel.getColDefCols();
    }

    public applyColumnState(params: ApplyColumnStateParams): boolean {
        return this.columnApplyStateService.applyColumnState(params, 'api');
    }

    public getColumnState(): ColumnState[] {
        return this.columnGetStateService.getColumnState();
    }

    public resetColumnState(): void {
        this.columnApplyStateService.resetColumnState('api');
    }

    public getColumnGroupState(): { groupId: string; open: boolean }[] {
        return this.columnGroupStateService.getColumnGroupState();
    }

    public setColumnGroupState(stateItems: { groupId: string; open: boolean }[]): void {
        this.columnGroupStateService.setColumnGroupState(stateItems, 'api');
    }

    public resetColumnGroupState(): void {
        this.columnGroupStateService.resetColumnGroupState('api');
    }

    public isPinning(): boolean {
        return this.visibleColsService.isPinningLeft() || this.visibleColsService.isPinningRight();
    }

    public isPinningLeft(): boolean {
        return this.visibleColsService.isPinningLeft();
    }

    public isPinningRight(): boolean {
        return this.visibleColsService.isPinningRight();
    }

    public getDisplayedColAfter(col: Column): Column | null {
        return this.visibleColsService.getColAfter(col);
    }

    public getDisplayedColBefore(col: Column): Column | null {
        return this.visibleColsService.getColBefore(col);
    }

    public setColumnVisible(key: string | Column, visible: boolean): void {
        this.logDeprecation('v31.1', 'setColumnVisible(key,visible)', 'setColumnsVisible([key],visible)');
        this.columnModel.setColsVisible([key], visible, 'api');
    }

    public setColumnsVisible(keys: (string | Column)[], visible: boolean): void {
        this.columnModel.setColsVisible(keys, visible, 'api');
    }

    public setColumnPinned(key: string | ColDef | Column, pinned: ColumnPinnedType): void {
        this.logDeprecation('v31.1', 'setColumnPinned(key,pinned)', 'setColumnsPinned([key],pinned)');
        this.columnModel.setColsPinned([key], pinned, 'api');
    }

    public setColumnsPinned(keys: (string | ColDef | Column)[], pinned: ColumnPinnedType): void {
        this.columnModel.setColsPinned(keys, pinned, 'api');
    }

    public getAllGridColumns(): Column[] {
        return this.columnModel.getCols();
    }

    public getDisplayedLeftColumns(): Column[] {
        return this.visibleColsService.getLeftCols();
    }

    public getDisplayedCenterColumns(): Column[] {
        return this.visibleColsService.getCenterCols();
    }

    public getDisplayedRightColumns(): Column[] {
        return this.visibleColsService.getRightCols();
    }

    public getAllDisplayedColumns(): Column[] {
        return this.visibleColsService.getAllCols();
    }

    public getAllDisplayedVirtualColumns(): Column[] {
        return this.columnViewportService.getViewportColumns();
    }

    public moveColumn(key: string | ColDef | Column, toIndex: number): void {
        this.logDeprecation('v31.1', 'moveColumn(key, toIndex)', 'moveColumns([key], toIndex)');
        this.columnMoveService.moveColumns([key], toIndex, 'api');
    }

    public moveColumnByIndex(fromIndex: number, toIndex: number): void {
        this.columnMoveService.moveColumnByIndex(fromIndex, toIndex, 'api');
    }

    public moveColumns(columnsToMoveKeys: (string | ColDef | Column)[], toIndex: number) {
        this.columnMoveService.moveColumns(columnsToMoveKeys, toIndex, 'api');
    }

    public moveRowGroupColumn(fromIndex: number, toIndex: number): void {
        this.funcColsService.moveRowGroupColumn(fromIndex, toIndex, 'api');
    }

    public setColumnAggFunc(key: string | ColDef | Column, aggFunc: string | IAggFunc | null | undefined): void {
        this.funcColsService.setColumnAggFunc(key, aggFunc, 'api');
    }

    public setColumnWidth(
        key: string | ColDef | Column,
        newWidth: number,
        finished: boolean = true,
        source: ColumnEventType = 'api'
    ): void {
        this.logDeprecation('v31.1', 'setColumnWidth(col, width)', 'setColumnWidths([{key: col, newWidth: width}])');
        this.columnSizeService.setColumnWidths([{ key, newWidth }], false, finished, source);
    }

    public setColumnWidths(
        columnWidths: { key: string | ColDef | Column; newWidth: number }[],
        finished: boolean = true,
        source: ColumnEventType = 'api'
    ): void {
        this.columnSizeService.setColumnWidths(columnWidths, false, finished, source);
    }

    public isPivotMode(): boolean {
        return this.columnModel.isPivotMode();
    }

    public getPivotResultColumn<TValue = any>(
        pivotKeys: string[],
        valueColKey: string | ColDef<TData, TValue> | Column<TValue>
    ): Column<TValue> | null {
        return this.pivotResultColsService.lookupPivotResultCol(pivotKeys, valueColKey);
    }

    public setValueColumns(colKeys: (string | ColDef | Column)[]): void {
        this.funcColsService.setValueColumns(colKeys, 'api');
    }

    public getValueColumns(): Column[] {
        return this.funcColsService.getValueColumns();
    }

    public removeValueColumn(colKey: string | ColDef | Column): void {
        this.logDeprecation('v31.1', 'removeValueColumn(colKey)', 'removeValueColumns([colKey])');
        this.funcColsService.removeValueColumns([colKey], 'api');
    }

    public removeValueColumns(colKeys: (string | ColDef | Column)[]): void {
        this.funcColsService.removeValueColumns(colKeys, 'api');
    }

    public addValueColumn(colKey: string | ColDef | Column): void {
        this.logDeprecation('v31.1', 'addValueColumn(colKey)', 'addValueColumns([colKey])');
        this.funcColsService.addValueColumns([colKey], 'api');
    }

    public addValueColumns(colKeys: (string | ColDef | Column)[]): void {
        this.funcColsService.addValueColumns(colKeys, 'api');
    }

    public setRowGroupColumns(colKeys: (string | ColDef | Column)[]): void {
        this.funcColsService.setRowGroupColumns(colKeys, 'api');
    }

    public removeRowGroupColumn(colKey: string | ColDef | Column): void {
        this.logDeprecation('v31.1', 'removeRowGroupColumn(colKey)', 'removeRowGroupColumns([colKey])');
        this.funcColsService.removeRowGroupColumns([colKey], 'api');
    }

    public removeRowGroupColumns(colKeys: (string | ColDef | Column)[]): void {
        this.funcColsService.removeRowGroupColumns(colKeys, 'api');
    }

    public addRowGroupColumn(colKey: string | ColDef | Column): void {
        this.logDeprecation('v31.1', 'addRowGroupColumn(colKey)', 'addRowGroupColumns([colKey])');
        this.funcColsService.addRowGroupColumns([colKey], 'api');
    }

    public addRowGroupColumns(colKeys: (string | ColDef | Column)[]): void {
        this.funcColsService.addRowGroupColumns(colKeys, 'api');
    }

    public getRowGroupColumns(): Column[] {
        return this.funcColsService.getRowGroupColumns();
    }

    public setPivotColumns(colKeys: (string | ColDef | Column)[]): void {
        this.funcColsService.setPivotColumns(colKeys, 'api');
    }

    public removePivotColumn(colKey: string | ColDef | Column): void {
        this.logDeprecation('v31.1', 'removePivotColumn(colKey)', 'removePivotColumns([colKey])');
        this.funcColsService.removePivotColumns([colKey], 'api');
    }

    public removePivotColumns(colKeys: (string | ColDef | Column)[]): void {
        this.funcColsService.removePivotColumns(colKeys, 'api');
    }

    public addPivotColumn(colKey: string | ColDef | Column): void {
        this.logDeprecation('v31.1', 'addPivotColumn(colKey)', 'addPivotColumns([colKey])');
        this.funcColsService.addPivotColumns([colKey], 'api');
    }

    public addPivotColumns(colKeys: (string | ColDef | Column)[]): void {
        this.funcColsService.addPivotColumns(colKeys, 'api');
    }

    public getPivotColumns(): Column[] {
        return this.funcColsService.getPivotColumns();
    }

    public getLeftDisplayedColumnGroups(): IHeaderColumn[] {
        return this.visibleColsService.getTreeLeft();
    }

    public getCenterDisplayedColumnGroups(): IHeaderColumn[] {
        return this.visibleColsService.getTreeCenter();
    }

    public getRightDisplayedColumnGroups(): IHeaderColumn[] {
        return this.visibleColsService.getTreeRight();
    }

    public getAllDisplayedColumnGroups(): IHeaderColumn[] | null {
        return this.visibleColsService.getAllTrees();
    }

    public autoSizeColumn(key: string | ColDef | Column, skipHeader?: boolean): void {
        this.logDeprecation('v31.1', 'autoSizeColumn(key, skipHeader)', 'autoSizeColumns([key], skipHeader)');
        return this.columnAutosizeService.autoSizeCols({ colKeys: [key], skipHeader: skipHeader, source: 'api' });
    }

    public autoSizeColumns(keys: (string | ColDef | Column)[], skipHeader?: boolean): void {
        this.columnAutosizeService.autoSizeCols({ colKeys: keys, skipHeader: skipHeader, source: 'api' });
    }

    public autoSizeAllColumns(skipHeader?: boolean): void {
        this.columnAutosizeService.autoSizeAllColumns('api', skipHeader);
    }

    public setPivotResultColumns(colDefs: (ColDef | ColGroupDef)[] | null): void {
        this.pivotResultColsService.setPivotResultCols(colDefs, 'api');
    }

    public getPivotResultColumns(): Column[] | null {
        const pivotResultCols = this.pivotResultColsService.getPivotResultCols();
        return pivotResultCols ? pivotResultCols.list : null;
    }

    public getState(): GridState {
        return this.stateService.getState();
    }

    public getGridOption<Key extends keyof GridOptions<TData>>(key: Key): GridOptions<TData>[Key] {
        return this.gos.get(key);
    }

    public setGridOption<Key extends ManagedGridOptionKey>(key: Key, value: GridOptions<TData>[Key]): void {
        this.updateGridOptions({ [key]: value });
    }

    public updateGridOptions<TDataUpdate extends TData>(options: ManagedGridOptions<TDataUpdate>): void {
        // NOTE: The TDataUpdate generic is used to ensure that the update options match the generic passed into the GridApi above as TData.
        // This is required because if we just use TData directly then Typescript will get into an infinite loop due to callbacks which recursively include the GridApi.
        this.gos.updateGridOptions({ options });
    }
}

/** Utility type to support adding params to a grid api method. */
type StartsWithGridApi = `${keyof GridApi}${string}`;
