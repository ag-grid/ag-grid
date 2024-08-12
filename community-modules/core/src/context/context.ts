import type { AlignedGridsService } from '../alignedGridsService';
import type { ApiFunctionService } from '../api/apiFunctionService';
import type { GridApi } from '../api/gridApi';
import type { RowModelHelperService } from '../api/rowModelHelperService';
import type { CellNavigationService } from '../cellNavigationService';
import type { ColumnApplyStateService } from '../columns/columnApplyStateService';
import type { ColumnAutosizeService } from '../columns/columnAutosizeService';
import type { ColumnDefFactory } from '../columns/columnDefFactory';
import type { ColumnEventDispatcher } from '../columns/columnEventDispatcher';
import type { ColumnFactory } from '../columns/columnFactory';
import type { ColumnGetStateService } from '../columns/columnGetStateService';
import type { ColumnGroupStateService } from '../columns/columnGroupStateService';
import type { ColumnModel } from '../columns/columnModel';
import type { ColumnMoveService } from '../columns/columnMoveService';
import type { ColumnNameService } from '../columns/columnNameService';
import type { ColumnSizeService } from '../columns/columnSizeService';
import type { ColumnViewportService } from '../columns/columnViewportService';
import type { IControlsColService } from '../columns/controlsColService';
import type { DataTypeService } from '../columns/dataTypeService';
import type { FuncColsService } from '../columns/funcColsService';
import type { PivotResultColsService } from '../columns/pivotResultColsService';
import type { VisibleColsService } from '../columns/visibleColsService';
import type { AgComponentUtils } from '../components/framework/agComponentUtils';
import type { ComponentMetadataProvider } from '../components/framework/componentMetadataProvider';
import type { FrameworkComponentWrapper } from '../components/framework/frameworkComponentWrapper';
import type { UserComponentFactory } from '../components/framework/userComponentFactory';
import type { UserComponentRegistry } from '../components/framework/userComponentRegistry';
import type { CtrlsFactory } from '../ctrlsFactory';
import type { CtrlsService } from '../ctrlsService';
import type { DragAndDropService } from '../dragAndDrop/dragAndDropService';
import type { DragService } from '../dragAndDrop/dragService';
import type { EditService } from '../edit/editService';
import type { RowEditService } from '../edit/rowEditService';
import type { CellPositionUtils } from '../entities/cellPositionUtils';
import type { GridOptions } from '../entities/gridOptions';
import type { RowNodeEventThrottle } from '../entities/rowNodeEventThrottle';
import type { RowPositionUtils } from '../entities/rowPositionUtils';
import type { Environment } from '../environment';
import type { EventService } from '../eventService';
import type { AgGlobalEventListener } from '../events';
import type { ColumnFilterService } from '../filter/columnFilterService';
import type { FilterManager } from '../filter/filterManager';
import type { QuickFilterService } from '../filter/quickFilterService';
import type { FocusService } from '../focusService';
import type { MouseEventService } from '../gridBodyComp/mouseEventService';
import type { NavigationService } from '../gridBodyComp/navigationService';
import type { PinnedWidthService } from '../gridBodyComp/pinnedWidthService';
import type { ScrollVisibleService } from '../gridBodyComp/scrollVisibleService';
import type { GridDestroyService } from '../gridDestroyService';
import type { GridOptionsService } from '../gridOptionsService';
import type { HeaderNavigationService } from '../headerRendering/common/headerNavigationService';
import type { HeaderPositionUtils } from '../headerRendering/common/headerPosition';
import type { HorizontalResizeService } from '../headerRendering/common/horizontalResizeService';
import type { IChartService } from '../interfaces/IChartService';
import type { IRangeService, ISelectionHandleFactory } from '../interfaces/IRangeService';
import type { IAdvancedFilterService } from '../interfaces/iAdvancedFilterService';
import type { IAggFuncService } from '../interfaces/iAggFuncService';
import type { IAutoColService } from '../interfaces/iAutoColService';
import type { IClipboardService } from '../interfaces/iClipboardService';
import type { IColumnChooserFactory } from '../interfaces/iColumnChooserFactory';
import type { IContextMenuFactory } from '../interfaces/iContextMenuFactory';
import type { ICsvCreator } from '../interfaces/iCsvCreator';
import type { IDetailGridApiService } from '../interfaces/iDetailGridApiService';
import type { IExcelCreator } from '../interfaces/iExcelCreator';
import type { IExpansionService } from '../interfaces/iExpansionService';
import type { IFrameworkOverrides } from '../interfaces/iFrameworkOverrides';
import type { IMenuFactory } from '../interfaces/iMenuFactory';
import type { IPivotColDefService } from '../interfaces/iPivotColDefService';
import type { IRowModel } from '../interfaces/iRowModel';
import type { IRowNodeStage } from '../interfaces/iRowNodeStage';
import type { ISelectionService } from '../interfaces/iSelectionService';
import type { IServerSideTransactionManager } from '../interfaces/iServerSideRowModel';
import type { IColumnDropZonesService, IShowRowGroupColsService } from '../interfaces/iShowRowGroupColsService';
import type { ISideBarService } from '../interfaces/iSideBar';
import type { IStatusBarService } from '../interfaces/iStatusBarService';
import type { LocaleService } from '../localeService';
import type { AnimationFrameService } from '../misc/animationFrameService';
import type { ApiEventService } from '../misc/apiEventService';
import type { MenuService } from '../misc/menuService';
import type { ResizeObserverService } from '../misc/resizeObserverService';
import type { StateService } from '../misc/state/stateService';
import { ModuleRegistry } from '../modules/moduleRegistry';
import type { PageBoundsListener } from '../pagination/pageBoundsListener';
import type { PageBoundsService } from '../pagination/pageBoundsService';
import type { PaginationAutoPageSizeService } from '../pagination/paginationAutoPageSizeService';
import type { PaginationService } from '../pagination/paginationService';
import type { PinnedRowModel } from '../pinnedRowModel/pinnedRowModel';
import type { AriaAnnouncementService } from '../rendering/ariaAnnouncementService';
import type { AutoWidthCalculator } from '../rendering/autoWidthCalculator';
import type { ColumnAnimationService } from '../rendering/columnAnimationService';
import type { ColumnHoverService } from '../rendering/columnHoverService';
import type { OverlayService } from '../rendering/overlays/overlayService';
import type { RowCssClassCalculator } from '../rendering/row/rowCssClassCalculator';
import type { RowContainerHeightService } from '../rendering/rowContainerHeightService';
import type { RowRenderer } from '../rendering/rowRenderer';
import type { RowNodeBlockLoader } from '../rowNodeCache/rowNodeBlockLoader';
import type { RowNodeSorter } from '../rowNodes/rowNodeSorter';
import type { SelectableService } from '../rowNodes/selectableService';
import type { SortController } from '../sortController';
import type { StylingService } from '../styling/stylingService';
import type { SyncService } from '../syncService';
import type { UndoRedoService } from '../undoRedo/undoRedoService';
import type { ValidationService } from '../validation/validationService';
import type { ExpressionService } from '../valueService/expressionService';
import type { ValueCache } from '../valueService/valueCache';
import type { ValueService } from '../valueService/valueService';
import type { PopupService } from '../widgets/popupService';
import type { GenericContextParams, GenericSingletonBean } from './genericContext';
import { GenericContext } from './genericContext';

export interface ContextParams extends GenericContextParams<BeanName, BeanCollection> {
    gridId: string;
}

export interface SingletonBean extends GenericSingletonBean<BeanName, BeanCollection> {}

export type ControllerName = 'headerFilterCell' | 'detailCellRenderer' | 'groupCellRendererCtrl';
export type UserComponentName =
    | 'agColumnHeader'
    | 'agColumnGroupHeader'
    | 'agSortIndicator'
    | 'agAnimateShowChangeCellRenderer'
    | 'agAnimateSlideCellRenderer'
    | 'agLoadingCellRenderer'
    | 'agSkeletonCellRenderer'
    | 'agCheckboxCellRenderer'
    | 'agLoadingOverlay'
    | 'agNoRowsOverlay'
    | 'agTooltipComponent'
    | 'agReadOnlyFloatingFilter'
    | 'agTextColumnFilter'
    | 'agNumberColumnFilter'
    | 'agDateColumnFilter'
    | 'agDateInput'
    | 'agTextColumnFloatingFilter'
    | 'agNumberColumnFloatingFilter'
    | 'agDateColumnFloatingFilter'
    | 'agMultiColumnFilter'
    | 'agMultiColumnFloatingFilter'
    | 'agGroupColumnFilter'
    | 'agGroupColumnFloatingFilter'
    | 'agSetColumnFilter'
    | 'agSetColumnFloatingFilter'
    | 'agCellEditor'
    | 'agSelectCellEditor'
    | 'agTextCellEditor'
    | 'agNumberCellEditor'
    | 'agDateCellEditor'
    | 'agDateStringCellEditor'
    | 'agCheckboxCellEditor'
    | 'agLargeTextCellEditor'
    | 'agRichSelect'
    | 'agRichSelectCellEditor'
    | 'agMenuItem'
    | 'agColumnsToolPanel'
    | 'agFiltersToolPanel'
    | 'agGroupRowRenderer'
    | 'agGroupCellRenderer'
    | 'agDetailCellRenderer'
    | 'agSparklineCellRenderer'
    | 'agAggregationComponent'
    | 'agSelectedRowCountComponent'
    | 'agTotalRowCountComponent'
    | 'agFilteredRowCountComponent'
    | 'agTotalAndFilteredRowCountComponent';
export interface NamedClass<TName = string> {
    classImp: new (...args: []) => object;
    name: TName;
}
export type ControllerMeta = NamedClass<ControllerName>;
export type ComponentMeta = NamedClass<UserComponentName>;

export interface CoreBeanCollection {
    context: Context;
    resizeObserverService: ResizeObserverService;
    pageBoundsListener: PageBoundsListener;
    gos: GridOptionsService;
    environment: Environment;
    rowRenderer: RowRenderer;
    valueService: ValueService;
    eventService: EventService;
    columnModel: ColumnModel;
    columnViewportService: ColumnViewportService;
    columnNameService: ColumnNameService;
    visibleColsService: VisibleColsService;
    columnMoveService: ColumnMoveService;
    columnSizeService: ColumnSizeService;
    headerNavigationService: HeaderNavigationService;
    navigationService: NavigationService;
    columnAnimationService: ColumnAnimationService;
    focusService: FocusService;
    popupService: PopupService;
    stylingService: StylingService;
    columnHoverService: ColumnHoverService;
    userComponentFactory: UserComponentFactory;
    userComponentRegistry: UserComponentRegistry;
    animationFrameService: AnimationFrameService;
    dragService: DragService;
    dragAndDropService: DragAndDropService;
    sortController: SortController;
    columnFilterService?: ColumnFilterService;
    filterManager?: FilterManager;
    rowContainerHeightService: RowContainerHeightService;
    frameworkOverrides: IFrameworkOverrides;
    cellPositionUtils: CellPositionUtils;
    rowPositionUtils: RowPositionUtils;
    selectionService: ISelectionService;
    rowCssClassCalculator: RowCssClassCalculator;
    rowModel: IRowModel;
    ctrlsService: CtrlsService;
    ctrlsFactory: CtrlsFactory;
    valueCache: ValueCache;
    rowNodeEventThrottle: RowNodeEventThrottle;
    localeService: LocaleService;
    syncService: SyncService;
    ariaAnnouncementService: AriaAnnouncementService;
    rangeService?: IRangeService;
    selectionHandleFactory: ISelectionHandleFactory;
    validationService?: ValidationService;
    gridApi: GridApi;
    gridOptions: GridOptions;
    eGridDiv: HTMLElement;
    columnApplyStateService: ColumnApplyStateService;
    columnFactory: ColumnFactory;
    pivotResultColsService: PivotResultColsService;
    autoColService?: IAutoColService;
    controlsColService?: IControlsColService;
    columnDefFactory: ColumnDefFactory;
    columnGroupStateService: ColumnGroupStateService;
    columnEventDispatcher: ColumnEventDispatcher;
    columnAutosizeService: ColumnAutosizeService;
    funcColsService: FuncColsService;
    quickFilterService?: QuickFilterService;
    showRowGroupColsService?: IShowRowGroupColsService;
    columnDropZonesService?: IColumnDropZonesService;
    headerPositionUtils: HeaderPositionUtils;
    dataTypeService?: DataTypeService;
    globalEventListener: AgGlobalEventListener;
    globalSyncEventListener: AgGlobalEventListener;
    stateService?: StateService;
    overlayService: OverlayService;
    columnGetStateService: ColumnGetStateService;
    pinnedRowModel: PinnedRowModel;
    menuService: MenuService;
    apiEventService: ApiEventService;
    undoRedoService?: UndoRedoService;
    rowNodeBlockLoader?: RowNodeBlockLoader;
    csvCreator?: ICsvCreator;
    excelCreator?: IExcelCreator;
    clipboardService?: IClipboardService;
    mouseEventService: MouseEventService;
    cellNavigationService: CellNavigationService;
    scrollVisibleService: ScrollVisibleService;
    pinnedWidthService: PinnedWidthService;
    expressionService: ExpressionService;
    autoWidthCalculator: AutoWidthCalculator;
    componentMetadataProvider: ComponentMetadataProvider;
    agComponentUtils: AgComponentUtils;
    frameworkComponentWrapper: FrameworkComponentWrapper;
    horizontalResizeService: HorizontalResizeService;
    filterMenuFactory: IMenuFactory;
    enterpriseMenuFactory?: IMenuFactory;
    contextMenuFactory?: IContextMenuFactory;
    editService?: EditService;
    rowEditService?: RowEditService;
    alignedGridsService?: AlignedGridsService;
    paginationAutoPageSizeService?: PaginationAutoPageSizeService;
    paginationService?: PaginationService;
    pageBoundsService: PageBoundsService;
    apiFunctionService: ApiFunctionService;
    rowModelHelperService?: RowModelHelperService;
    detailGridApiService?: IDetailGridApiService;
    gridDestroyService: GridDestroyService;
    expansionService: IExpansionService;
    sideBarService?: ISideBarService;
    ssrmTransactionManager?: IServerSideTransactionManager;
    columnChooserFactory?: IColumnChooserFactory;
    aggFuncService?: IAggFuncService;
    advancedFilterService: IAdvancedFilterService;
    filterStage?: IRowNodeStage;
    sortStage?: IRowNodeStage;
    flattenStage?: IRowNodeStage;
    groupStage?: IRowNodeStage;
    aggregationStage?: IRowNodeStage;
    pivotStage?: IRowNodeStage;
    filterAggregatesStage?: IRowNodeStage;
    rowNodeSorter: RowNodeSorter;
    pivotColDefService?: IPivotColDefService;
    statusBarService?: IStatusBarService;
    chartService?: IChartService;
    selectableService: SelectableService;
}

export type BeanCollection = CoreBeanCollection & {
    // `unknown | undefined` to make sure the type is handled correctly when used
    [key in Exclude<BeanName, keyof CoreBeanCollection>]?: unknown;
};

export class Context extends GenericContext<BeanName, BeanCollection> {
    private gridId: string;

    protected override init(params: ContextParams): void {
        this.gridId = params.gridId;

        this.beans.context = this;
        super.init(params);
    }

    public override destroy(): void {
        super.destroy();

        ModuleRegistry.__unRegisterGridModules(this.gridId);
    }

    public getGridId(): string {
        return this.gridId;
    }
}

export type BeanName =
    | 'advancedFilterExpressionService'
    | 'advancedFilterService'
    | 'advancedSettingsMenuFactory'
    | 'aggFuncService'
    | 'agGridAngular'
    | 'agGridReact'
    | 'agGridVue'
    | 'agComponentUtils'
    | 'aggregationStage'
    | 'alignedGridsService'
    | 'animationFrameService'
    | 'apiFunctionService'
    | 'ariaAnnouncementService'
    | 'apiEventService'
    | 'autoColService'
    | 'autoWidthCalculator'
    | 'beans'
    | 'cellEditorFactory'
    | 'cellNavigationService'
    | 'cellPositionUtils'
    | 'cellRendererFactory'
    | 'cellRendererService'
    | 'changeDetectionService'
    | 'chartColumnService'
    | 'chartCrossFilterService'
    | 'chartMenuItemMapper'
    | 'chartMenuListFactory'
    | 'chartMenuService'
    | 'chartTranslationService'
    | 'chartService'
    | 'clipboardService'
    | 'columnAutosizeService'
    | 'columnChooserFactory'
    | 'columnController'
    | 'columnDefFactory'
    | 'columnDropZonesService'
    | 'columnEditorFactory'
    | 'columnEventDispatcher'
    | 'columnFilterService'
    | 'columnGetStateService'
    | 'columnSizeService'
    | 'columnFactory'
    | 'columnAnimationService'
    | 'columnHoverService'
    | 'columnMenuFactory'
    | 'columnModel'
    | 'columnMoveService'
    | 'columnPositionService'
    | 'columnNameService'
    | 'columnViewportService'
    | 'columnGroupStateService'
    | 'columnApplyStateService'
    | 'columnUtils'
    | 'pivotResultColsService'
    | 'componentMetadataProvider'
    | 'context'
    | 'contextMenuFactory'
    | 'controlsColService'
    | 'ctrlsFactory'
    | 'ctrlsService'
    | 'csvCreator'
    | 'dataTypeService'
    | 'visibleColsService'
    | 'detailGridApiService'
    | 'dragAndDropService'
    | 'dragService'
    | 'editService'
    | 'excelCreator'
    | 'enterpriseMenuFactory'
    | 'environment'
    | 'eventService'
    | 'eGridDiv'
    | 'expansionService'
    | 'expressionService'
    | 'filterAggregatesStage'
    | 'filterManager'
    | 'filterMenuFactory'
    | 'filterStage'
    | 'flattenStage'
    | 'focusService'
    | 'funcColsService'
    | 'frameworkComponentWrapper'
    | 'frameworkOverrides'
    | 'globalEventListener'
    | 'globalSyncEventListener'
    | 'gridApi'
    | 'gridDestroyService'
    | 'gridOptions'
    | 'gos'
    | 'gridOptionsWrapper'
    | 'gridSerializer'
    | 'groupStage'
    | 'headerNavigationService'
    | 'headerPositionUtils'
    | 'horizontalResizeService'
    | 'immutableService'
    | 'lazyBlockLoadingService'
    | 'licenseManager'
    | 'localeService'
    | 'loggerFactory'
    | 'menuItemMapper'
    | 'menuService'
    | 'menuUtils'
    | 'modelItemUtils'
    | 'mouseEventService'
    | 'navigationService'
    | 'overlayService'
    | 'paginationAutoPageSizeService'
    | 'paginationService'
    | 'pinnedRowModel'
    | 'pinnedWidthService'
    | 'pivotColDefService'
    | 'pivotStage'
    | 'popupService'
    | 'quickFilterService'
    | 'rangeService'
    | 'resizeObserverService'
    | 'pageBoundsListener'
    | 'pageBoundsService'
    | 'renderStatusService'
    | 'rowContainerHeightService'
    | 'rowCssClassCalculator'
    | 'rowEditService'
    | 'rowModel'
    | 'rowNodeBlockLoader'
    | 'rowNodeEventThrottle'
    | 'rowModelHelperService'
    | 'rowNodeSorter'
    | 'rowPositionUtils'
    | 'rowRenderer'
    | 'scrollVisibleService'
    | 'selectableService'
    | 'selectionController'
    | 'selectionHandleFactory'
    | 'selectionService'
    | 'showRowGroupColsService'
    | 'sideBarService'
    | 'sortController'
    | 'sortService'
    | 'sortStage'
    | 'sparklineTooltipSingleton'
    | 'ssrmBlockUtils'
    | 'ssrmExpandListener'
    | 'ssrmFilterListener'
    | 'ssrmListenerUtils'
    | 'ssrmNodeManager'
    | 'ssrmSortService'
    | 'ssrmStoreFactory'
    | 'ssrmStoreUtils'
    | 'ssrmTransactionManager'
    | 'stateService'
    | 'statusBarService'
    | 'stylingService'
    | 'syncService'
    | 'templateService'
    | 'toolPanelColDefService'
    | 'undoRedoService'
    | 'userComponentFactory'
    | 'userComponentRegistry'
    | 'valueCache'
    | 'valueService'
    | 'validationLogger'
    | 'validationService';
