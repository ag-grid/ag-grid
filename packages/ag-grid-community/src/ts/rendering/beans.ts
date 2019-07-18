import { Autowired, Bean, Context, Optional, PostConstruct } from "../context/context";
import { ColumnApi } from "../columnController/columnApi";
import { ColumnController } from "../columnController/columnController";
import { GridApi } from "../gridApi";
import { GridOptionsWrapper } from "../gridOptionsWrapper";
import { ExpressionService } from "../valueService/expressionService";
import { RowRenderer } from "./rowRenderer";
import { TemplateService } from "../templateService";
import { ValueService } from "../valueService/valueService";
import { EventService } from "../eventService";
import { ColumnAnimationService } from "./columnAnimationService";
import { IRangeController } from "../interfaces/iRangeController";
import { FocusedCellController } from "../focusedCellController";
import { IContextMenuFactory } from "../interfaces/iContextMenuFactory";
import { CellRendererFactory } from "./cellRendererFactory";
import { PopupService } from "../widgets/popupService";
import { ValueFormatterService } from "./valueFormatterService";
import { StylingService } from "../styling/stylingService";
import { ColumnHoverService } from "./columnHoverService";
import { GridPanel } from "../gridPanel/gridPanel";
import { PaginationProxy } from "../rowModels/paginationProxy";
import { AnimationFrameService } from "../misc/animationFrameService";
import { UserComponentFactory } from "../components/framework/userComponentFactory";
import { DragAndDropService } from "../dragAndDrop/dragAndDropService";
import { SortController } from "../sortController";
import { FilterManager } from "../filter/filterManager";
import { MaxDivHeightScaler } from "./maxDivHeightScaler";
import { TooltipManager } from "../widgets/tooltipManager";
import { IFrameworkOverrides } from "../interfaces/iFrameworkOverrides";
import { DetailRowCompCache } from "./detailRowCompCache";

/** Using the IoC has a slight performance consideration, which is no problem most of the
 * time, unless we are trashing objects - which is the case when scrolling and rowComp
 * and cellComp. So for performance reasons, RowComp and CellComp do not get autowired
 * with the IoC. Instead they get passed this object which is all the beans the RowComp
 * and CellComp need. Not autowiring all the cells gives performance improvement. */
@Bean('beans')
export class Beans {

    @Autowired('paginationProxy') public paginationProxy: PaginationProxy;
    @Autowired('context') public context: Context;
    @Autowired('columnApi') public columnApi: ColumnApi;
    @Autowired('gridApi') public gridApi: GridApi;
    @Autowired('gridOptionsWrapper') public gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('expressionService') public expressionService: ExpressionService;
    @Autowired('rowRenderer') public rowRenderer: RowRenderer;
    @Autowired('$compile') public $compile: any;
    @Autowired('templateService') public templateService: TemplateService;
    @Autowired('valueService') public valueService: ValueService;
    @Autowired('eventService') public eventService: EventService;
    @Autowired('columnController') public columnController: ColumnController;
    @Autowired('columnAnimationService') public columnAnimationService: ColumnAnimationService;
    @Optional('rangeController') public rangeController: IRangeController;
    @Autowired('focusedCellController') public focusedCellController: FocusedCellController;
    @Optional('contextMenuFactory') public contextMenuFactory: IContextMenuFactory;
    @Autowired('cellRendererFactory') public cellRendererFactory: CellRendererFactory;
    @Autowired('popupService') public popupService: PopupService;
    @Autowired('valueFormatterService') public valueFormatterService: ValueFormatterService;
    @Autowired('stylingService') public stylingService: StylingService;
    @Autowired('columnHoverService') public columnHoverService: ColumnHoverService;
    @Autowired('enterprise') public enterprise: boolean;
    @Autowired('userComponentFactory') public userComponentFactory: UserComponentFactory;
    @Autowired('animationFrameService') public taskQueue: AnimationFrameService;
    @Autowired('dragAndDropService') public dragAndDropService: DragAndDropService;
    @Autowired('sortController') public sortController: SortController;
    @Autowired('filterManager') public filterManager: FilterManager;
    @Autowired('maxDivHeightScaler') public maxDivHeightScaler: MaxDivHeightScaler;
    @Autowired('tooltipManager') public tooltipManager: TooltipManager;
    @Autowired('frameworkOverrides') public frameworkOverrides: IFrameworkOverrides;
    @Autowired('detailRowCompCache') public detailRowCompCache: DetailRowCompCache;

    public doingMasterDetail: boolean;

    public gridPanel: GridPanel;

    public registerGridComp(gridPanel: GridPanel): void {
        this.gridPanel = gridPanel;
    }

    @PostConstruct
    private postConstruct(): void {
        this.doingMasterDetail = this.gridOptionsWrapper.isMasterDetail();
    }
}
