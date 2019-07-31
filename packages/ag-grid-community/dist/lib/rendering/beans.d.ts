// Type definitions for ag-grid-community v21.1.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { Context } from "../context/context";
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
export declare class Beans {
    paginationProxy: PaginationProxy;
    context: Context;
    columnApi: ColumnApi;
    gridApi: GridApi;
    gridOptionsWrapper: GridOptionsWrapper;
    expressionService: ExpressionService;
    rowRenderer: RowRenderer;
    $compile: any;
    templateService: TemplateService;
    valueService: ValueService;
    eventService: EventService;
    columnController: ColumnController;
    columnAnimationService: ColumnAnimationService;
    rangeController: IRangeController;
    focusedCellController: FocusedCellController;
    contextMenuFactory: IContextMenuFactory;
    cellRendererFactory: CellRendererFactory;
    popupService: PopupService;
    valueFormatterService: ValueFormatterService;
    stylingService: StylingService;
    columnHoverService: ColumnHoverService;
    enterprise: boolean;
    userComponentFactory: UserComponentFactory;
    taskQueue: AnimationFrameService;
    dragAndDropService: DragAndDropService;
    sortController: SortController;
    filterManager: FilterManager;
    maxDivHeightScaler: MaxDivHeightScaler;
    tooltipManager: TooltipManager;
    frameworkOverrides: IFrameworkOverrides;
    detailRowCompCache: DetailRowCompCache;
    doingMasterDetail: boolean;
    gridPanel: GridPanel;
    registerGridComp(gridPanel: GridPanel): void;
    private postConstruct;
}
