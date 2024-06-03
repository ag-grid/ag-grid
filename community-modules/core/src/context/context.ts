import type { CellNavigationService } from '../cellNavigationService';
import type { AutoColService } from '../columns/autoColService';
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
import type { DataTypeService } from '../columns/dataTypeService';
import type { FuncColsService } from '../columns/funcColsService';
import type { PivotResultColsService } from '../columns/pivotResultColsService';
import type { ShowRowGroupColsService } from '../columns/showRowGroupColsService';
import type { VisibleColsService } from '../columns/visibleColsService';
import type { AgStackComponentsRegistry } from '../components/agStackComponentsRegistry';
import type { AgComponentUtils } from '../components/framework/agComponentUtils';
import type { ComponentMetadataProvider } from '../components/framework/componentMetadataProvider';
import type { FrameworkComponentWrapper } from '../components/framework/frameworkComponentWrapper';
import type { UserComponentFactory } from '../components/framework/userComponentFactory';
import type { UserComponentRegistry } from '../components/framework/userComponentRegistry';
import type { CtrlsFactory } from '../ctrlsFactory';
import type { CtrlsService } from '../ctrlsService';
import type { DragAndDropService } from '../dragAndDrop/dragAndDropService';
import type { DragService } from '../dragAndDrop/dragService';
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
import type { GridApiService } from '../gridApiService';
import type { MouseEventService } from '../gridBodyComp/mouseEventService';
import type { NavigationService } from '../gridBodyComp/navigationService';
import type { PinnedWidthService } from '../gridBodyComp/pinnedWidthService';
import type { ScrollVisibleService } from '../gridBodyComp/scrollVisibleService';
import type { GridOptionsService } from '../gridOptionsService';
import type { HeaderNavigationService } from '../headerRendering/common/headerNavigationService';
import type { HeaderPositionUtils } from '../headerRendering/common/headerPosition';
import type { HorizontalResizeService } from '../headerRendering/common/horizontalResizeService';
import type { IRangeService, ISelectionHandleFactory } from '../interfaces/IRangeService';
import type { IClipboardService } from '../interfaces/iClipboardService';
import type { IContextMenuFactory } from '../interfaces/iContextMenuFactory';
import type { ICsvCreator } from '../interfaces/iCsvCreator';
import type { IExcelCreator } from '../interfaces/iExcelCreator';
import type { IFrameworkOverrides } from '../interfaces/iFrameworkOverrides';
import type { IMenuFactory } from '../interfaces/iMenuFactory';
import type { IRowModel } from '../interfaces/iRowModel';
import type { ISelectionService } from '../interfaces/iSelectionService';
import type { LocaleService } from '../localeService';
import type { LoggerFactory } from '../logger';
import type { AnimationFrameService } from '../misc/animationFrameService';
import type { ApiEventService } from '../misc/apiEventService';
import type { MenuService } from '../misc/menuService';
import type { ResizeObserverService } from '../misc/resizeObserverService';
import type { StateService } from '../misc/stateService';
import { ModuleRegistry } from '../modules/moduleRegistry';
import type { PaginationProxy } from '../pagination/paginationProxy';
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

export interface ControllerMeta {
    controllerClass: new (...args: []) => object;
    controllerName: string;
}

export interface CoreBeanCollection {
    context: Context;
    resizeObserverService: ResizeObserverService;
    paginationProxy: PaginationProxy;
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
    agStackComponentsRegistry: AgStackComponentsRegistry;
    valueCache: ValueCache;
    rowNodeEventThrottle: RowNodeEventThrottle;
    localeService: LocaleService;
    syncService: SyncService;
    ariaAnnouncementService: AriaAnnouncementService;
    rangeService: IRangeService;
    selectionHandleFactory: ISelectionHandleFactory;
    validationService?: ValidationService;
    gridApi: GridApiService;
    gridOptions: GridOptions;
    eGridDiv: HTMLElement;
    loggerFactory: LoggerFactory;
    columnApplyStateService: ColumnApplyStateService;
    columnFactory: ColumnFactory;
    pivotResultColsService: PivotResultColsService;
    autoColService: AutoColService;
    columnDefFactory: ColumnDefFactory;
    columnGroupStateService: ColumnGroupStateService;
    columnEventDispatcher: ColumnEventDispatcher;
    columnAutosizeService: ColumnAutosizeService;
    funcColsService: FuncColsService;
    quickFilterService?: QuickFilterService;
    showRowGroupColsService: ShowRowGroupColsService;
    headerPositionUtils: HeaderPositionUtils;
    dataTypeService: DataTypeService;
    globalEventListener: AgGlobalEventListener;
    globalSyncEventListener: AgGlobalEventListener;
    stateService: StateService;
    overlayService: OverlayService;
    columnGetStateService: ColumnGetStateService;
    pinnedRowModel: PinnedRowModel;
    menuService: MenuService;
    apiEventService: ApiEventService;
    undoRedoService: UndoRedoService;
    rowNodeBlockLoader: RowNodeBlockLoader;
    csvCreator: ICsvCreator;
    excelCreator: IExcelCreator;
    clipboardService: IClipboardService;
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
    enterpriseMenuFactory: IMenuFactory;
    contextMenuFactory: IContextMenuFactory;
}

export type BeanCollection = CoreBeanCollection & {
    [key in Exclude<BeanName, keyof CoreBeanCollection>]: any;
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
    | 'agStackComponentsRegistry'
    | 'aggregationStage'
    | 'alignedGridsService'
    | 'animationFrameService'
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
    | 'ctrlsFactory'
    | 'ctrlsService'
    | 'csvCreator'
    | 'dataTypeService'
    | 'visibleColsService'
    | 'dragAndDropService'
    | 'dragService'
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
    | 'paginationProxy'
    | 'pinnedRowModel'
    | 'pinnedWidthService'
    | 'pivotColDefService'
    | 'pivotStage'
    | 'popupService'
    | 'quickFilterService'
    | 'rangeService'
    | 'resizeObserverService'
    | 'rowContainerHeightService'
    | 'rowCssClassCalculator'
    | 'rowModel'
    | 'rowNodeBlockLoader'
    | 'rowNodeEventThrottle'
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
    | 'validationService';
