import type { AlignedGridsService } from '../alignedGrids/alignedGridsService';
import type { ApiFunctionService } from '../api/apiFunctionService';
import type { GridApi } from '../api/gridApi';
import type { RowModelHelperService } from '../api/rowModelHelperService';
import type { CellNavigationService } from '../cellNavigationService';
import type { ColumnAutosizeService } from '../columnAutosize/columnAutosizeService';
import type { ColumnMoveService } from '../columnMove/columnMoveService';
import type { ColumnResizeService } from '../columnResize/columnResizeService';
import type { ColumnApplyStateService } from '../columns/columnApplyStateService';
import type { ColumnDefFactory } from '../columns/columnDefFactory';
import type { ColumnFactory } from '../columns/columnFactory';
import type { ColumnFlexService } from '../columns/columnFlexService';
import type { ColumnGetStateService } from '../columns/columnGetStateService';
import type { ColumnGroupStateService } from '../columns/columnGroupStateService';
import type { ColumnModel } from '../columns/columnModel';
import type { ColumnNameService } from '../columns/columnNameService';
import type { ColumnViewportService } from '../columns/columnViewportService';
import type { ControlsColService } from '../columns/controlsColService';
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
import type { HorizontalResizeService } from '../dragAndDrop/horizontalResizeService';
import type { RowDragService } from '../dragAndDrop/rowDragService';
import type { EditService } from '../edit/editService';
import type { RowEditService } from '../edit/rowEditService';
import type { GridOptions } from '../entities/gridOptions';
import type { RowNodeEventThrottle } from '../entities/rowNodeEventThrottle';
import type { RowPositionUtils } from '../entities/rowPositionUtils';
import type { Environment } from '../environment';
import type { EventService } from '../eventService';
import type { AgGlobalEventListener } from '../events';
import type { ColumnFilterService } from '../filter/columnFilterService';
import type { FilterManager } from '../filter/filterManager';
import type { FilterValueService } from '../filter/filterValueService';
import type { QuickFilterService } from '../filter/quickFilterService';
import type { FocusService } from '../focusService';
import type { MouseEventService } from '../gridBodyComp/mouseEventService';
import type { NavigationService } from '../gridBodyComp/navigationService';
import type { PinnedWidthService } from '../gridBodyComp/pinnedWidthService';
import type { ScrollVisibleService } from '../gridBodyComp/scrollVisibleService';
import type { GridDestroyService } from '../gridDestroyService';
import type { GridOptionsService } from '../gridOptionsService';
import type { HeaderNavigationService } from '../headerRendering/common/headerNavigationService';
import type { IChartService } from '../interfaces/IChartService';
import type { IRangeService, ISelectionHandleFactory } from '../interfaces/IRangeService';
import type { IAdvancedFilterService } from '../interfaces/iAdvancedFilterService';
import type { IAggColumnNameService } from '../interfaces/iAggColumnNameService';
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
import type { IGroupHideOpenParentsService } from '../interfaces/iGroupHideOpenParentsService';
import type { IMenuFactory } from '../interfaces/iMenuFactory';
import type { IPivotColDefService } from '../interfaces/iPivotColDefService';
import type { IRowModel } from '../interfaces/iRowModel';
import type { IRowNodeStage } from '../interfaces/iRowNodeStage';
import type { ISelectionService } from '../interfaces/iSelectionService';
import type { IServerSideTransactionManager } from '../interfaces/iServerSideRowModel';
import type { IColumnDropZonesService, IShowRowGroupColsService } from '../interfaces/iShowRowGroupColsService';
import type { ISideBarService } from '../interfaces/iSideBar';
import type { IStatusBarService } from '../interfaces/iStatusBarService';
import type { IRenderStatusService } from '../interfaces/renderStatusService';
import type { LocaleService } from '../localeService';
import type { AnimationFrameService } from '../misc/animationFrameService';
import type { ApiEventService } from '../misc/apiEventService';
import type { MenuService } from '../misc/menuService';
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
import type { StickyRowService } from '../rendering/features/stickyRowService';
import type { OverlayService } from '../rendering/overlays/overlayService';
import type { RowCssClassCalculator } from '../rendering/row/rowCssClassCalculator';
import type { RowContainerHeightService } from '../rendering/rowContainerHeightService';
import type { RowRenderer } from '../rendering/rowRenderer';
import type { RowNodeBlockLoader } from '../rowNodeCache/rowNodeBlockLoader';
import type { RowNodeSorter } from '../sort/rowNodeSorter';
import type { SortController } from '../sort/sortController';
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
    | 'agDragAndDropImage'
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
export type ComponentMeta = NamedClass<UserComponentName> & {
    /** Default params for provided components */
    params?: any;
};

export interface CoreBeanCollection {
    context: Context;
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
    columnMoveService?: ColumnMoveService;
    columnFlexService: ColumnFlexService;
    columnResizeService?: ColumnResizeService;
    headerNavigationService: HeaderNavigationService;
    navigationService: NavigationService;
    columnAnimationService: ColumnAnimationService;
    focusService: FocusService;
    popupService?: PopupService;
    stylingService: StylingService;
    columnHoverService: ColumnHoverService;
    userComponentFactory: UserComponentFactory;
    userComponentRegistry: UserComponentRegistry;
    animationFrameService: AnimationFrameService;
    dragService?: DragService;
    dragAndDropService?: DragAndDropService;
    sortController?: SortController;
    columnFilterService?: ColumnFilterService;
    filterManager?: FilterManager;
    rowContainerHeightService: RowContainerHeightService;
    frameworkOverrides: IFrameworkOverrides;
    rowPositionUtils: RowPositionUtils;
    selectionService?: ISelectionService;
    rowCssClassCalculator: RowCssClassCalculator;
    rowModel: IRowModel;
    ctrlsService: CtrlsService;
    ctrlsFactory: CtrlsFactory;
    valueCache?: ValueCache;
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
    controlsColService?: ControlsColService;
    columnDefFactory: ColumnDefFactory;
    columnGroupStateService: ColumnGroupStateService;
    columnAutosizeService?: ColumnAutosizeService;
    funcColsService: FuncColsService;
    quickFilterService?: QuickFilterService;
    showRowGroupColsService?: IShowRowGroupColsService;
    columnDropZonesService?: IColumnDropZonesService;
    dataTypeService?: DataTypeService;
    globalEventListener: AgGlobalEventListener;
    globalSyncEventListener: AgGlobalEventListener;
    stateService?: StateService;
    overlayService: OverlayService;
    columnGetStateService: ColumnGetStateService;
    pinnedRowModel?: PinnedRowModel;
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
    expressionService?: ExpressionService;
    autoWidthCalculator: AutoWidthCalculator;
    componentMetadataProvider: ComponentMetadataProvider;
    agComponentUtils?: AgComponentUtils;
    frameworkComponentWrapper: FrameworkComponentWrapper;
    horizontalResizeService?: HorizontalResizeService;
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
    expansionService?: IExpansionService;
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
    rowNodeSorter?: RowNodeSorter;
    pivotColDefService?: IPivotColDefService;
    statusBarService?: IStatusBarService;
    chartService?: IChartService;
    aggColumnNameService?: IAggColumnNameService;
    renderStatusService?: IRenderStatusService;
    rowDragService?: RowDragService;
    stickyRowService?: StickyRowService;
    groupHideOpenParentsService?: IGroupHideOpenParentsService;
    filterValueService?: FilterValueService;
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
    | 'agComponentUtils'
    | 'aggColumnNameService'
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
    | 'columnFilterService'
    | 'columnFlexService'
    | 'columnGetStateService'
    | 'columnResizeService'
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
    | 'filterValueService'
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
    | 'groupHideOpenParentsService'
    | 'groupStage'
    | 'headerNavigationService'
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
    | 'pageBoundsListener'
    | 'pageBoundsService'
    | 'renderStatusService'
    | 'rowContainerHeightService'
    | 'rowCssClassCalculator'
    | 'rowDragService'
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
    | 'stickyRowService'
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
