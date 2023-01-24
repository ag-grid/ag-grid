import { Autowired, Bean, Context, Optional, PostConstruct } from "../context/context";
import { ColumnApi } from "../columns/columnApi";
import { ColumnModel } from "../columns/columnModel";
import { HeaderNavigationService } from "../headerRendering/common/headerNavigationService";
import { GridApi } from "../gridApi";
import { ExpressionService } from "../valueService/expressionService";
import { RowRenderer } from "./rowRenderer";
import { TemplateService } from "../templateService";
import { ValueService } from "../valueService/valueService";
import { EventService } from "../eventService";
import { ColumnAnimationService } from "./columnAnimationService";
import { IRangeService, ISelectionHandleFactory } from "../interfaces/IRangeService";
import { FocusService } from "../focusService";
import { IContextMenuFactory } from "../interfaces/iContextMenuFactory";
import { PopupService } from "../widgets/popupService";
import { ValueFormatterService } from "./valueFormatterService";
import { StylingService } from "../styling/stylingService";
import { ColumnHoverService } from "./columnHoverService";
import { PaginationProxy } from "../pagination/paginationProxy";
import { AnimationFrameService } from "../misc/animationFrameService";
import { UserComponentFactory } from "../components/framework/userComponentFactory";
import { DragAndDropService } from "../dragAndDrop/dragAndDropService";
import { SortController } from "../sortController";
import { FilterManager } from "../filter/filterManager";
import { RowContainerHeightService } from "./rowContainerHeightService";
import { IFrameworkOverrides } from "../interfaces/iFrameworkOverrides";
import { CellPositionUtils } from "../entities/cellPositionUtils";
import { RowPositionUtils } from "../entities/rowPositionUtils";
import { SelectionService } from "../selectionService";
import { RowCssClassCalculator } from "./row/rowCssClassCalculator";
import { IRowModel } from "../interfaces/iRowModel";
import { IClientSideRowModel } from "../interfaces/iClientSideRowModel";
import { IServerSideRowModel } from "../interfaces/iServerSideRowModel";
import { ResizeObserverService } from "../misc/resizeObserverService";
import { CtrlsService } from "../ctrlsService";
import { NavigationService } from "../gridBodyComp/navigationService";
import { AgStackComponentsRegistry } from "../components/agStackComponentsRegistry";
import { CtrlsFactory } from "../ctrlsFactory";
import { UserComponentRegistry } from "../components/framework/userComponentRegistry";
import { ValueCache } from "../valueService/valueCache";
import { RowNodeEventThrottle } from "../entities/rowNodeEventThrottle";
import { GridOptionsService } from "../gridOptionsService";
import { LocaleService } from "../localeService";
import { Environment } from "../environment";

/** Using the IoC has a slight performance consideration, which is no problem most of the
 * time, unless we are trashing objects - which is the case when scrolling and rowComp
 * and cellComp. So for performance reasons, RowComp and CellComp do not get autowired
 * with the IoC. Instead they get passed this object which is all the beans the RowComp
 * and CellComp need. Not autowiring all the cells gives performance improvement. */
@Bean('beans')
export class Beans {

    @Autowired('resizeObserverService') public resizeObserverService: ResizeObserverService;
    @Autowired('paginationProxy') public paginationProxy: PaginationProxy;
    @Autowired('context') public context: Context;
    @Autowired('columnApi') public columnApi: ColumnApi;
    @Autowired('gridApi') public gridApi: GridApi;
    @Autowired('gridOptionsService') public gridOptionsService: GridOptionsService;
    @Autowired('expressionService') public expressionService: ExpressionService;
    @Autowired('environment') public environment: Environment;
    @Autowired('rowRenderer') public rowRenderer: RowRenderer;
    @Autowired('templateService') public templateService: TemplateService;
    @Autowired('valueService') public valueService: ValueService;
    @Autowired('eventService') public eventService: EventService;
    @Autowired('columnModel') public columnModel: ColumnModel;
    @Autowired('headerNavigationService') public headerNavigationService: HeaderNavigationService;
    @Autowired('navigationService') public navigationService: NavigationService;
    @Autowired('columnAnimationService') public columnAnimationService: ColumnAnimationService;
    @Optional('rangeService') public rangeService: IRangeService;
    @Autowired('focusService') public focusService: FocusService;
    @Optional('contextMenuFactory') public contextMenuFactory: IContextMenuFactory;
    @Autowired('popupService') public popupService: PopupService;
    @Autowired('valueFormatterService') public valueFormatterService: ValueFormatterService;
    @Autowired('stylingService') public stylingService: StylingService;
    @Autowired('columnHoverService') public columnHoverService: ColumnHoverService;
    @Autowired('userComponentFactory') public userComponentFactory: UserComponentFactory;
    @Autowired('userComponentRegistry') public userComponentRegistry: UserComponentRegistry;
    @Autowired('animationFrameService') public animationFrameService: AnimationFrameService;
    @Autowired('dragAndDropService') public dragAndDropService: DragAndDropService;
    @Autowired('sortController') public sortController: SortController;
    @Autowired('filterManager') public filterManager: FilterManager;
    @Autowired('rowContainerHeightService') public rowContainerHeightService: RowContainerHeightService;
    @Autowired('frameworkOverrides') public frameworkOverrides: IFrameworkOverrides;
    @Autowired('cellPositionUtils') public cellPositionUtils: CellPositionUtils;
    @Autowired('rowPositionUtils') public rowPositionUtils: RowPositionUtils;
    @Autowired('selectionService') public selectionService: SelectionService;
    @Optional('selectionHandleFactory') public selectionHandleFactory: ISelectionHandleFactory;
    @Autowired('rowCssClassCalculator') public rowCssClassCalculator: RowCssClassCalculator;
    @Autowired('rowModel') public rowModel: IRowModel;
    @Autowired('ctrlsService') public ctrlsService: CtrlsService;
    @Autowired('ctrlsFactory') public ctrlsFactory: CtrlsFactory;
    @Autowired('agStackComponentsRegistry') public agStackComponentsRegistry: AgStackComponentsRegistry;
    @Autowired('valueCache') public valueCache: ValueCache;
    @Autowired('rowNodeEventThrottle') public rowNodeEventThrottle: RowNodeEventThrottle;
    @Autowired('localeService') public localeService: LocaleService;

    public doingMasterDetail: boolean;

    public clientSideRowModel: IClientSideRowModel;
    public serverSideRowModel: IServerSideRowModel;

    @PostConstruct
    private postConstruct(): void {
        this.doingMasterDetail = this.gridOptionsService.isMasterDetail();

        if (this.gridOptionsService.isRowModelType('clientSide')) {
            this.clientSideRowModel = this.rowModel as IClientSideRowModel;
        }
        if (this.gridOptionsService.isRowModelType('serverSide')) {
            this.serverSideRowModel = this.rowModel as IServerSideRowModel;
        }
    }
}
