import type { ColumnModel } from '../columns/columnModel';
import type { ColumnMoveService } from '../columns/columnMoveService';
import type { ColumnNameService } from '../columns/columnNameService';
import type { ColumnSizeService } from '../columns/columnSizeService';
import type { ColumnViewportService } from '../columns/columnViewportService';
import type { VisibleColsService } from '../columns/visibleColsService';
import type { AgStackComponentsRegistry } from '../components/agStackComponentsRegistry';
import type { UserComponentFactory } from '../components/framework/userComponentFactory';
import type { UserComponentRegistry } from '../components/framework/userComponentRegistry';
import type { CtrlsFactory } from '../ctrlsFactory';
import type { CtrlsService } from '../ctrlsService';
import type { DragAndDropService } from '../dragAndDrop/dragAndDropService';
import type { DragService } from '../dragAndDrop/dragService';
import type { CellPositionUtils } from '../entities/cellPositionUtils';
import type { RowNodeEventThrottle } from '../entities/rowNodeEventThrottle';
import type { RowPositionUtils } from '../entities/rowPositionUtils';
import type { Environment } from '../environment';
import type { EventService } from '../eventService';
import type { FilterManager } from '../filter/filterManager';
import type { FocusService } from '../focusService';
import type { NavigationService } from '../gridBodyComp/navigationService';
import type { GridOptionsService } from '../gridOptionsService';
import type { HeaderNavigationService } from '../headerRendering/common/headerNavigationService';
import type { IRangeService, ISelectionHandleFactory } from '../interfaces/IRangeService';
import type { IFrameworkOverrides } from '../interfaces/iFrameworkOverrides';
import type { IRowModel } from '../interfaces/iRowModel';
import type { ISelectionService } from '../interfaces/iSelectionService';
import type { LocaleService } from '../localeService';
import type { AnimationFrameService } from '../misc/animationFrameService';
import type { ResizeObserverService } from '../misc/resizeObserverService';
import { ModuleRegistry } from '../modules/moduleRegistry';
import type { PaginationProxy } from '../pagination/paginationProxy';
import type { AriaAnnouncementService } from '../rendering/ariaAnnouncementService';
import type { ColumnAnimationService } from '../rendering/columnAnimationService';
import type { ColumnHoverService } from '../rendering/columnHoverService';
import type { RowCssClassCalculator } from '../rendering/row/rowCssClassCalculator';
import type { RowContainerHeightService } from '../rendering/rowContainerHeightService';
import type { RowRenderer } from '../rendering/rowRenderer';
import type { SortController } from '../sortController';
import type { StylingService } from '../styling/stylingService';
import type { SyncService } from '../syncService';
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
    controllerClass: new () => object;
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
    filterManager: FilterManager;
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
}

export type BeanCollection = CoreBeanCollection & {
    [key in Exclude<BeanName, keyof CoreBeanCollection>]: any;
};

export class Context extends GenericContext<BeanName, BeanCollection> {
    private gridId: string;

    protected init(params: ContextParams): void {
        this.gridId = params.gridId;

        this.beans.context = this;
        super.init(params);
    }

    public destroy(): void {
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
    | 'filterService'
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
