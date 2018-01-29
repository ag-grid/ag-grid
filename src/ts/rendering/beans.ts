
import {Autowired, Bean, Context, Optional, PostConstruct} from "../context/context";
import {ColumnApi} from "../columnController/columnApi";
import {ColumnController} from "../columnController/columnController";
import {GridApi} from "../gridApi";
import {GridOptionsWrapper} from "../gridOptionsWrapper";
import {ExpressionService} from "../valueService/expressionService";
import {RowRenderer} from "./rowRenderer";
import {TemplateService} from "../templateService";
import {ValueService} from "../valueService/valueService";
import {EventService} from "../eventService";
import {ColumnAnimationService} from "./columnAnimationService";
import {IRangeController} from "../interfaces/iRangeController";
import {FocusedCellController} from "../focusedCellController";
import {IContextMenuFactory} from "../interfaces/iContextMenuFactory";
import {CellEditorFactory} from "./cellEditorFactory";
import {CellRendererFactory} from "./cellRendererFactory";
import {PopupService} from "../widgets/popupService";
import {CellRendererService} from "./cellRendererService";
import {ValueFormatterService} from "./valueFormatterService";
import {StylingService} from "../styling/stylingService";
import {ColumnHoverService} from "./columnHoverService";
import {GridPanel} from "../gridPanel/gridPanel";
import {PaginationProxy} from "../rowModels/paginationProxy";
import {ComponentRecipes} from "../components/framework/componentRecipes";
import {AnimationFrameService} from "../misc/animationFrameService";
import {ComponentResolver} from "../components/framework/componentResolver";
import {_} from "../utils";
import {DragAndDropService} from "../dragAndDrop/dragAndDropService";
import {SortController} from "../sortController";
import {FilterManager} from "../filter/filterManager";

@Bean('beans')
export class Beans {

    @Autowired('paginationProxy') public paginationProxy: PaginationProxy;
    @Autowired('gridPanel') public gridPanel: GridPanel;
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
    @Autowired('cellEditorFactory') public cellEditorFactory: CellEditorFactory;
    @Autowired('cellRendererFactory') public cellRendererFactory: CellRendererFactory;
    @Autowired('popupService') public popupService: PopupService;
    @Autowired('cellRendererService') public cellRendererService: CellRendererService;
    @Autowired('valueFormatterService') public valueFormatterService: ValueFormatterService;
    @Autowired('stylingService') public stylingService: StylingService;
    @Autowired('columnHoverService') public columnHoverService: ColumnHoverService;
    @Autowired('enterprise') public enterprise: boolean;
    @Autowired('componentResolver') public componentResolver: ComponentResolver;
    @Autowired('animationFrameService') public taskQueue: AnimationFrameService;
    @Autowired('dragAndDropService') public dragAndDropService: DragAndDropService;
    @Autowired('sortController') public sortController: SortController;
    @Autowired('filterManager') public filterManager: FilterManager;

    public forPrint: boolean;
    public doingMasterDetail: boolean;

    @PostConstruct
    private postConstruct(): void {
        this.forPrint = this.gridOptionsWrapper.isForPrint();
        this.doingMasterDetail = this.gridOptionsWrapper.isMasterDetail();
    }
}
