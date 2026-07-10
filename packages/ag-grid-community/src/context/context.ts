import type {
    AgCoreBeanCollection,
    AgSingletonBeanClass,
    ClassImp,
    IAriaAnnouncementService,
    IContext,
} from 'ag-stack';

import type { AlignedGridsService } from '../alignedGrids/alignedGridsService';
import type { ApiFunctionService } from '../api/apiFunctionService';
import type { GridApi } from '../api/gridApi';
import type { FilterStage } from '../clientSideRowModel/filterStage';
import type { SortStage } from '../clientSideRowModel/sortStage';
import type { ColumnAutosizeService } from '../columnAutosize/columnAutosizeService';
import type { ColumnAnimationService } from '../columnMove/columnAnimationService';
import type { ColumnMoveService } from '../columnMove/columnMoveService';
import type { ColumnResizeService } from '../columnResize/columnResizeService';
import type { ColumnDefFactory } from '../columns/columnDefFactory';
import type { ColumnFlexService } from '../columns/columnFlexService';
import type { ColumnGroupService } from '../columns/columnGroups/columnGroupService';
import type { ColumnHoverService } from '../columns/columnHover/columnHoverService';
import type { ColumnModel } from '../columns/columnModel';
import type { ColumnNameService } from '../columns/columnNameService';
import type { ColumnViewportService } from '../columns/columnViewportService';
import type { DataTypeService } from '../columns/dataTypeService';
import type { SelectionColService } from '../columns/selectionColService';
import type { VisibleColsService } from '../columns/visibleColsService';
import type { AgComponentUtils } from '../components/framework/agComponentUtils';
import type { FrameworkComponentWrapper } from '../components/framework/frameworkComponentWrapper';
import type { Registry } from '../components/framework/registry';
import type { UserComponentFactory } from '../components/framework/userComponentFactory';
import type { CtrlsService } from '../ctrlsService';
import type { DragAndDropService } from '../dragAndDrop/dragAndDropService';
import type { DragService } from '../dragAndDrop/dragService';
import type { HorizontalResizeService } from '../dragAndDrop/horizontalResizeService';
import type { RowDragService } from '../dragAndDrop/rowDragService';
import type { RowDropHighlightService } from '../dragAndDrop/rowDropHighlightService';
import type { EditModelService } from '../edit/editModelService';
import type { EditService } from '../edit/editService';
import type { GridOptions } from '../entities/gridOptions';
import type { Environment } from '../environment';
import type { AgEventTypeParams, AgGlobalEventListener } from '../events';
import type { GridSerializer } from '../export/gridSerializer';
import type { ColumnFilterService } from '../filter/columnFilterService';
import type { FilterManager } from '../filter/filterManager';
import type { FilterValueService } from '../filter/filterValueService';
import type { QuickFilterService } from '../filter/quickFilterService';
import type { FocusService } from '../focusService';
import type { ScrollVisibleService } from '../gridBodyComp/scrollVisibleService';
import type { GridDestroyService } from '../gridDestroyService';
import type { GridOptionsWithDefaults } from '../gridOptionsDefault';
import type { GridOptionsService } from '../gridOptionsService';
import type { RowNodeBlockLoader } from '../infiniteRowModel/rowNodeBlockLoader';
import type { IChartService } from '../interfaces/IChartService';
import type { IRangeService } from '../interfaces/IRangeService';
import type { EditStrategyType } from '../interfaces/editStrategyType';
import type { IFormulaDataService, IFormulaInputManagerService, IFormulaService } from '../interfaces/formulas';
import type { IAdvancedFilterService } from '../interfaces/iAdvancedFilterService';
import type { IAggColumnNameService } from '../interfaces/iAggColumnNameService';
import type { IAggFuncService } from '../interfaces/iAggFuncService';
import type { IAggregatedChildrenSvc } from '../interfaces/iAggregatedChildrenSvc';
import type { IAutoColService } from '../interfaces/iAutoColService';
import type { ICalculatedColumnsService } from '../interfaces/iCalculatedColumns';
import type { IClipboardService } from '../interfaces/iClipboardService';
import type { IPivotColsService, IRowGroupColsService, IValueColsService } from '../interfaces/iColsService';
import type { IColumnStateUpdateStrategy } from '../interfaces/iColumnStateUpdateStrategy';
import type { AgGridCommon } from '../interfaces/iCommon';
import type { IContextMenuService } from '../interfaces/iContextMenu';
import type { ICsvCreator } from '../interfaces/iCsvCreator';
import type { IExcelCreator } from '../interfaces/iExcelCreator';
import type {
    IExpansionService,
    RowGroupBulkExpansionState,
    RowGroupExpansionState,
} from '../interfaces/iExpansionService';
import type { IFindService } from '../interfaces/iFind';
import type { IFooterService } from '../interfaces/iFooterService';
import type { IFrameworkOverrides } from '../interfaces/iFrameworkOverrides';
import type { IGroupEditService } from '../interfaces/iGroupEditService';
import type { IGroupFilterService } from '../interfaces/iGroupFilterService';
import type { IGroupHierarchyColService } from '../interfaces/iGroupHierarchyColService';
import type { IMenuFactory } from '../interfaces/iMenuFactory';
import type { IMultiFilterService } from '../interfaces/iMultiFilterService';
import type { IFilterPanelService, ISelectableFilterService } from '../interfaces/iNewFiltersToolPanel';
import type { IPdfCreator } from '../interfaces/iPdfCreator';
import type { IPinnedRowModel } from '../interfaces/iPinnedRowModel';
import type { IPivotColDefService } from '../interfaces/iPivotColDefService';
import type { IPivotResultColsService } from '../interfaces/iPivotResultColsService';
import type { IRowChildrenService } from '../interfaces/iRowChildrenService';
import type { IRowGroupPanelBuilder } from '../interfaces/iRowGroupPanelBuilder';
import type { IRowGroupingEditValueSvc } from '../interfaces/iRowGroupingEditValueSvc';
import type { IRowModel } from '../interfaces/iRowModel';
import type {
    IRowNodeAggregationStage,
    IRowNodeFilterAggregateStage,
    IRowNodeFilterStage,
    IRowNodeFlattenStage,
    IRowNodeGroupStage,
    IRowNodePivotStage,
    IRowNodeSortStage,
} from '../interfaces/iRowNodeStage';
import type { ISelectionService } from '../interfaces/iSelectionService';
import type { IServerSideTransactionManager } from '../interfaces/iServerSideRowModel';
import type { IShowRowGroupColsService } from '../interfaces/iShowRowGroupColsService';
import type { IShowRowGroupColsValueService } from '../interfaces/iShowRowGroupColsValueService';
import type { IShowValuesAsService } from '../interfaces/iShowValuesAsService';
import type { ISideBarService } from '../interfaces/iSideBar';
import type { IStickyRowService } from '../interfaces/iStickyRows';
import type { ITestIdService } from '../interfaces/iTestIdService';
import type { IToolbarService } from '../interfaces/iToolbar';
import type { IWatermark } from '../interfaces/iWatermark';
import type { IMasterDetailService } from '../interfaces/masterDetail';
import type { INotesDataService, INotesService } from '../interfaces/notes';
import type { IRenderStatusService } from '../interfaces/renderStatusService';
import type { IRowNumbersService } from '../interfaces/rowNumbers';
import type { IChangedPathFactory } from '../main-internal';
import type { AnimationFrameService } from '../misc/animationFrameService';
import type { ApiEventService } from '../misc/apiEvents/apiEventService';
import type { IconService } from '../misc/iconService';
import type { MenuService } from '../misc/menu/menuService';
import type { StateService } from '../misc/state/stateService';
import type { TouchService } from '../misc/touchService';
import type { CellNavigationService } from '../navigation/cellNavigationService';
import type { HeaderNavigationService } from '../navigation/headerNavigationService';
import type { NavigationService } from '../navigation/navigationService';
import type { PageBoundsListener } from '../pagination/pageBoundsListener';
import type { PageBoundsService } from '../pagination/pageBoundsService';
import type { PaginationAutoPageSizeService } from '../pagination/paginationAutoPageSizeService';
import type { PaginationService } from '../pagination/paginationService';
import type { PinnedColumnService } from '../pinnedColumns/pinnedColumnService';
import type { AutoWidthCalculator } from '../rendering/autoWidthCalculator';
import type { CellFlashService } from '../rendering/cell/cellFlashService';
import type { ColumnDelayRenderService } from '../rendering/columnDelayRenderService';
import type { OverlayService } from '../rendering/overlays/overlayService';
import type { RowAutoHeightService } from '../rendering/row/rowAutoHeightService';
import type { RowContainerHeightService } from '../rendering/rowContainerHeightService';
import type { RowRenderer } from '../rendering/rowRenderer';
import type { RowSpanService } from '../rendering/spanning/rowSpanService';
import type { SpannedRowRenderer } from '../rendering/spanning/spannedRowRenderer';
import type { RowNodeSorter } from '../sort/rowNodeSorter';
import type { SortService } from '../sort/sortService';
import type { CellStyleService } from '../styling/cellStyleService';
import type { RowStyleService } from '../styling/rowStyleService';
import type { SyncService } from '../syncService';
import type { TooltipService } from '../tooltip/tooltipService';
import type { UndoRedoService } from '../undoRedo/undoRedoService';
import type { ErrorOverlayService } from '../validation/errorOverlay/errorOverlayService';
import type { LogService } from '../validation/logService';
import type { ValidationService } from '../validation/validationService';
import type { ChangeDetectionService } from '../valueService/changeDetectionService';
import type { ExpressionService } from '../valueService/expressionService';
import type { ValueCache } from '../valueService/valueCache';
import type { ValueService } from '../valueService/valueService';
import type { PopupService } from '../widgets/popupService';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface SingletonBean extends AgSingletonBeanClass<BeanCollection> {}

export type DynamicBeanName =
    | 'detailCellRendererCtrl'
    | 'dndSourceComp'
    | 'fillHandle'
    | 'groupCellRendererCtrl'
    | 'headerFilterCellCtrl'
    | 'headerGroupCellCtrl'
    | 'rangeHandle'
    | 'pageNumbers'
    | 'tooltipFeature'
    | 'highlightTooltipFeature'
    | 'tooltipStateManager'
    | 'groupStrategy'
    | 'treeGroupStrategy'
    | EditStrategyType
    | 'rowNumberRowResizer'
    | 'agSetColumnFilterHandler'
    | 'agMultiColumnFilterHandler'
    | 'agGroupColumnFilterHandler'
    | 'agNumberColumnFilterHandler'
    | 'agBigIntColumnFilterHandler'
    | 'agDateColumnFilterHandler'
    | 'agTextColumnFilterHandler';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export type ToolbarItemComponentName =
    | 'agButtonToolbarItem'
    | 'agFindToolbarItem'
    | 'agMenuToolbarItem'
    | 'agPivotPanelToolbarItem'
    | 'agQuickFilterToolbarItem'
    | 'agRowGroupPanelToolbarItem';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export type StatusPanelComponentName =
    | 'agAggregationComponent'
    | 'agSelectedRowCountComponent'
    | 'agTotalRowCountComponent'
    | 'agFilteredRowCountComponent'
    | 'agTotalAndFilteredRowCountComponent';

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
    | 'agExportingOverlay'
    | 'agNoRowsOverlay'
    | 'agNoMatchingRowsOverlay'
    | 'agFileInputOverlay'
    | 'agErrorOverlay'
    | 'agTooltipComponent'
    | 'agReadOnlyFloatingFilter'
    | 'agTextColumnFilter'
    | 'agNumberColumnFilter'
    | 'agBigIntColumnFilter'
    | 'agDateColumnFilter'
    | 'agDateInput'
    | 'agTextColumnFloatingFilter'
    | 'agNumberColumnFloatingFilter'
    | 'agBigIntColumnFloatingFilter'
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
    | 'agFormulaCellEditor'
    | 'agRichSelect'
    | 'agRichSelectCellEditor'
    | 'agMenuItem'
    | 'agColumnsToolPanel'
    | 'agFiltersToolPanel'
    | 'agNewFiltersToolPanel'
    | 'agGroupRowRenderer'
    | 'agGroupCellRenderer'
    | 'agDetailCellRenderer'
    | 'agSparklineCellRenderer'
    | StatusPanelComponentName
    | ToolbarItemComponentName
    | 'agFindCellRenderer';

interface ComponentMetaWithParams {
    classImp: ClassImp;
    /** Default params for provided components */
    params?: any;
    /** Update params for provided components before they are created */
    processParams?: ProcessParamsFunc;
}
interface ComponentMetaFunc {
    getComp: (beans: BeanCollection) => ClassImp | ComponentMetaWithParams;
}

export function isComponentMetaFunc(
    componentMeta: ClassImp | ComponentMetaWithParams | ComponentMetaFunc
): componentMeta is ComponentMetaFunc {
    return typeof componentMeta === 'object' && !!(componentMeta as ComponentMetaFunc).getComp;
}

export type ComponentMeta = ClassImp | ComponentMetaWithParams | ComponentMetaFunc;

export type ProcessParamsFunc<TParams = any> = (params: TParams, beans: BeanCollection) => TParams;

interface CoreBeanCollection extends AgCoreBeanCollection<
    GridOptionsWithDefaults,
    AgEventTypeParams,
    AgGridCommon<any, any>,
    GridOptionsService
> {
    pageBoundsListener: PageBoundsListener;
    environment: Environment;
    rowRenderer: RowRenderer;
    valueSvc: ValueService;
    colModel: ColumnModel;
    colViewport: ColumnViewportService;
    colNames: ColumnNameService;
    visibleCols: VisibleColsService;
    colMoves?: ColumnMoveService;
    colFlex?: ColumnFlexService;
    colResize?: ColumnResizeService;
    headerNavigation?: HeaderNavigationService;
    navigation?: NavigationService;
    colAnimation?: ColumnAnimationService;
    focusSvc: FocusService;
    popupSvc?: PopupService;
    cellStyles?: CellStyleService;
    colHover?: ColumnHoverService;
    userCompFactory: UserComponentFactory;
    registry: Registry;
    animationFrameSvc?: AnimationFrameService;
    dragSvc?: DragService;
    dragAndDrop?: DragAndDropService;
    sortSvc?: SortService;
    colFilter?: ColumnFilterService;
    filterManager?: FilterManager;
    rowContainerHeight: RowContainerHeightService;
    frameworkOverrides: IFrameworkOverrides;
    selectionSvc?: ISelectionService;
    rowStyleSvc?: RowStyleService;
    rowModel: IRowModel;
    ctrlsSvc: CtrlsService;
    valueCache?: ValueCache;
    syncSvc: SyncService;
    ariaAnnounce: IAriaAnnouncementService;
    rangeSvc?: IRangeService;
    validation?: ValidationService;
    log: LogService;
    gridApi: GridApi;
    gridOptions: GridOptions;
    eGridDiv: HTMLElement;
    eRootDiv: HTMLElement;
    withinStudio?: boolean;
    pivotResultCols?: IPivotResultColsService;
    autoColSvc?: IAutoColService;
    selectionColSvc?: SelectionColService;
    rowNumbersSvc?: IRowNumbersService;
    colDefFactory?: ColumnDefFactory;
    colAutosize?: ColumnAutosizeService;
    rowGroupColsSvc?: IRowGroupColsService;
    valueColsSvc?: IValueColsService;
    showValuesAsSvc?: IShowValuesAsService;
    pivotColsSvc?: IPivotColsService;
    quickFilter?: QuickFilterService;
    showRowGroupCols?: IShowRowGroupColsService;
    showRowGroupColValueSvc?: IShowRowGroupColsValueService;
    dataTypeSvc?: DataTypeService;
    globalListener: AgGlobalEventListener;
    globalSyncListener: AgGlobalEventListener;
    stateSvc?: StateService;
    overlays?: OverlayService;
    errorOverlay?: ErrorOverlayService;
    pinnedRowModel?: IPinnedRowModel;
    menuSvc?: MenuService;
    apiEventSvc?: ApiEventService;
    undoRedo?: UndoRedoService;
    rowNodeBlockLoader?: RowNodeBlockLoader;
    csvCreator?: ICsvCreator;
    excelCreator?: IExcelCreator;
    pdfCreator?: IPdfCreator;
    clipboardSvc?: IClipboardService;
    cellNavigation?: CellNavigationService;
    scrollVisibleSvc: ScrollVisibleService;
    pinnedCols?: PinnedColumnService;
    expressionSvc?: ExpressionService;
    autoWidthCalc?: AutoWidthCalculator;
    agCompUtils?: AgComponentUtils;
    frameworkCompWrapper: FrameworkComponentWrapper;
    horizontalResizeSvc?: HorizontalResizeService;
    filterMenuFactory?: IMenuFactory;
    enterpriseMenuFactory?: IMenuFactory;
    contextMenuSvc?: IContextMenuService;
    editSvc?: EditService;
    editModelSvc?: EditModelService;
    alignedGridsSvc?: AlignedGridsService;
    paginationAutoPageSizeSvc?: PaginationAutoPageSizeService;
    pagination?: PaginationService;
    pageBounds: PageBoundsService;
    apiFunctionSvc: ApiFunctionService;
    gridDestroySvc: GridDestroyService;
    expansionSvc?: IExpansionService<RowGroupExpansionState | RowGroupBulkExpansionState>;
    sideBar?: ISideBarService;
    toolbar?: IToolbarService;
    ssrmTxnManager?: IServerSideTransactionManager;
    aggFuncSvc?: IAggFuncService;
    advancedFilter: IAdvancedFilterService;
    filterStage?: FilterStage;
    sortStage?: SortStage;
    groupFilterStage?: IRowNodeFilterStage;
    groupSortStage?: IRowNodeSortStage;
    flattenStage?: IRowNodeFlattenStage;
    groupStage?: IRowNodeGroupStage;
    aggStage?: IRowNodeAggregationStage;
    aggChildrenSvc?: IAggregatedChildrenSvc;
    pivotStage?: IRowNodePivotStage;
    filterAggStage?: IRowNodeFilterAggregateStage;
    rowNodeSorter?: RowNodeSorter;
    pivotColDefSvc?: IPivotColDefService;
    chartSvc?: IChartService;
    aggColNameSvc?: IAggColumnNameService;
    renderStatus?: IRenderStatusService;
    rowDropHighlightSvc?: RowDropHighlightService;
    rowDragSvc?: RowDragService;
    groupEditSvc?: IGroupEditService;
    rowGroupingEditValueSvc?: IRowGroupingEditValueSvc;
    stickyRowSvc?: IStickyRowService;
    filterValueSvc?: FilterValueService;
    cellFlashSvc?: CellFlashService;
    masterDetailSvc?: IMasterDetailService;
    tooltipSvc?: TooltipService;
    colGroupSvc: ColumnGroupService;
    rowAutoHeight?: RowAutoHeightService;
    rowChildrenSvc?: IRowChildrenService;
    footerSvc?: IFooterService;
    touchSvc?: TouchService;
    rowSpanSvc?: RowSpanService;
    spannedRowRenderer?: SpannedRowRenderer;
    findSvc?: IFindService;
    rowGroupPanelBuilder?: IRowGroupPanelBuilder;
    groupFilter?: IGroupFilterService;
    multiFilter?: IMultiFilterService;
    filterPanelSvc?: IFilterPanelService;
    selectableFilter?: ISelectableFilterService;
    testIdSvc?: ITestIdService;
    colDelayRenderSvc?: ColumnDelayRenderService;
    gridSerializer?: GridSerializer;
    licenseManager?: IWatermark;
    changedPathFactory?: IChangedPathFactory;
    changeDetectionSvc?: ChangeDetectionService;
    iconSvc: IconService;
    groupHierarchyColSvc?: IGroupHierarchyColService;
    formulaDataSvc?: IFormulaDataService;
    formula?: IFormulaService;
    formulaInputManager?: IFormulaInputManagerService;
    calculatedColsSvc?: ICalculatedColumnsService;
    notesDataSvc?: INotesDataService;
    notesSvc?: INotesService;
    columnStateUpdateStrategy: IColumnStateUpdateStrategy;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export type BeanCollection = CoreBeanCollection & {
    // `unknown | undefined` to make sure the type is handled correctly when used
    [key in UntypedBeanNames]?: unknown;
};

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export type Context = IContext<BeanCollection>;

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export type BeanName = keyof BeanCollection;

/** Things used in enterprise or elsewhere that we haven't created interfaces for */
type UntypedBeanNames =
    | 'advFilterExpSvc'
    | 'advSettingsMenuFactory'
    | 'autoGenColsSvc'
    | 'agChartsExports'
    | 'chartCrossFilterSvc'
    | 'chartMenuItemMapper'
    | 'chartMenuListFactory'
    | 'chartMenuSvc'
    | 'chartTranslation'
    | 'colChooserFactory'
    | 'colMenuFactory'
    | 'colToolPanelFactory'
    | 'enterpriseChartProxyFactory'
    | 'lazyBlockLoadingSvc'
    | 'menuItemMapper'
    | 'menuUtils'
    | 'ssrmBlockUtils'
    | 'ssrmExpandListener'
    | 'ssrmFilterListener'
    | 'ssrmListenerUtils'
    | 'ssrmNodeManager'
    | 'ssrmSortSvc'
    | 'ssrmStoreFactory'
    | 'ssrmStoreUtils'
    | 'statusBarSvc'
    | 'testIdSvc'
    | 'toolbarMenuBuilder'
    | 'formula'
    | 'showValuesAsSvc';
