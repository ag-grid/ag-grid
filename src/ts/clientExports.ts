import {Grid} from "./grid";
import {GridApi} from "./gridApi";
import {Events} from "./events";
import {ComponentUtil} from "./components/componentUtil";
import {ColumnController} from "./columnController/columnController";
import {initialiseAgGridWithAngular1} from "./components/agGridNg1";
import {initialiseAgGridWithWebComponents} from "./components/agGridWebComponent";
import {IRowModel} from "./interfaces/iRowModel";
import {TextAndNumberFilterParameters} from "./filter/textAndNumberFilterParameters";
import {GridCell} from "./entities/gridCell";
import {RowNode} from "./entities/rowNode";
import {OriginalColumnGroupChild} from "./entities/originalColumnGroupChild";
import {OriginalColumnGroup} from "./entities/originalColumnGroup";
import {ColumnGroupChild} from "./entities/columnGroupChild";
import {ColumnGroup} from "./entities/columnGroup";
import {Column} from "./entities/column";
import {ColGroupDef} from "./entities/colDef";
import {ColDef} from "./entities/colDef";
import {AbstractColDef} from "./entities/colDef";
import {NodeChildDetails} from "./entities/gridOptions";
import {FocusedCellController} from "./focusedCellController";
import {defaultGroupComparator} from "./functions";
import {GridOptions} from "./entities/gridOptions";
import {GridOptionsWrapper} from "./gridOptionsWrapper";
import {MenuItem} from "./widgets/cMenuItem";
import {groupCellRendererFactory} from "./cellRenderers/groupCellRendererFactory";
import {BalancedColumnTreeBuilder} from "./columnController/balancedColumnTreeBuilder";
import {ColumnKeyCreator} from "./columnController/columnKeyCreator";
import {ColumnUtils} from "./columnController/columnUtils";
import {DisplayedGroupCreator} from "./columnController/displayedGroupCreator";
import {GroupInstanceIdCreator} from "./columnController/groupInstanceIdCreator";
import {Context} from "./context/context";
import {DragAndDropService} from "./dragAndDrop/dragAndDropService";
import {DragService} from "./dragAndDrop/dragService";
import {Filter} from "./filter/filter";
import {FilterManager} from "./filter/filterManager";
import {NumberFilter} from "./filter/numberFilter";
import {SetFilterParameters} from "./filter/setFilterParameters";
import {TextFilter} from "./filter/textFilter";
import {GridPanel} from "./gridPanel/gridPanel";
import {MouseEventService} from "./gridPanel/mouseEventService";
import {CssClassApplier} from "./headerRendering/cssClassApplier";
import {HeaderContainer} from "./headerRendering/headerContainer";
import {HeaderRenderer} from "./headerRendering/headerRenderer";
import {HeaderTemplateLoader} from "./headerRendering/headerTemplateLoader";
import {HorizontalDragService} from "./headerRendering/horizontalDragService";
import {IRenderedHeaderElement} from "./headerRendering/iRenderedHeaderElement";
import {MoveColumnController} from "./headerRendering/moveColumnController";
import {RenderedHeaderCell} from "./headerRendering/renderedHeaderCell";
import {RenderedHeaderGroupCell} from "./headerRendering/renderedHeaderGroupCell";
import {StandardMenuFactory} from "./headerRendering/standardMenu";
import {BorderLayout} from "./layout/borderLayout";
import {TabbedLayout} from "./layout/tabbedLayout";
import {VerticalStack} from "./layout/verticalStack";
import {AutoWidthCalculator} from "./rendering/autoWidthCalculator";
import {RenderedRow} from "./rendering/renderedRow";
import {RowRenderer} from "./rendering/rowRenderer";
import {FilterStage} from "./rowControllers/inMemory/fillterStage";
import {FlattenStage} from "./rowControllers/inMemory/flattenStage";
import {InMemoryRowController} from "./rowControllers/inMemory/inMemoryRowController";
import {SortStage} from "./rowControllers/inMemory/sortStage";
import {FloatingRowModel} from "./rowControllers/floatingRowModel";
import {PaginationController} from "./rowControllers/paginationController";
import {VirtualPageRowController} from "./rowControllers/virtualPageRowController";
import {CMenuItem} from "./widgets/cMenuItem";
import {Component} from "./widgets/component";
import {MenuList} from "./widgets/menuList";
import {CellNavigationService} from "./cellNavigationService";
import {ColumnChangeEvent} from "./columnChangeEvent";
import {Constants} from "./constants";
import {CsvCreator} from "./csvCreator";
import {EventService} from "./eventService";
import {ExpressionService} from "./expressionService";
import {GridCore} from "./gridCore";
import {Logger} from "./logger";
import {MasterSlaveService} from "./masterSlaveService";
import {SelectionController} from "./selectionController";
import {SelectionRendererFactory} from "./selectionRendererFactory";
import {SortController} from "./sortController";
import {SvgFactory} from "./svgFactory";
import {TemplateService} from "./templateService";
import {Utils} from "./utils";
import {ValueService} from "./valueService";
import {PopupService} from "./widgets/popupService";
import {Autowired} from "./context/context";
import {PostConstruct} from "./context/context";
import {Optional} from "./context/context";
import {Bean} from "./context/context";
import {Qualifier} from "./context/context";
import {GridRow} from "./entities/gridRow";

export function populateClientExports(exports: any): void {

    // cellRenderers
    exports.groupCellRendererFactory = groupCellRendererFactory;

    // columnController
    exports.BalancedColumnTreeBuilder = BalancedColumnTreeBuilder;
    exports.ColumnController = ColumnController;
    exports.ColumnKeyCreator = ColumnKeyCreator;
    exports.ColumnUtils = ColumnUtils;
    exports.DisplayedGroupCreator = DisplayedGroupCreator;
    exports.GroupInstanceIdCreator = GroupInstanceIdCreator;

    // components
    exports.ComponentUtil = ComponentUtil;
    exports.initialiseAgGridWithAngular1 = initialiseAgGridWithAngular1;
    exports.initialiseAgGridWithWebComponents = initialiseAgGridWithWebComponents;

    // context
    exports.Context = Context;
    exports.Autowired = Autowired;
    exports.PostConstruct = PostConstruct;
    exports.Optional = Optional;
    exports.Bean = Bean;
    exports.Qualifier = Qualifier;

    // dragAndDrop
    exports.DragAndDropService = DragAndDropService;
    exports.DragService = DragService;

    // entities
    exports.Column = Column;
    exports.ColumnGroup = ColumnGroup;
    exports.GridCell = GridCell;
    exports.GridRow = GridRow;
    exports.OriginalColumnGroup = OriginalColumnGroup;
    exports.RowNode = RowNode;

    // filter
    exports.FilterManager = FilterManager;
    exports.NumberFilter = NumberFilter;
    exports.TextFilter = TextFilter;

    // gridPanel
    exports.GridPanel = GridPanel;
    exports.MouseEventService = MouseEventService;

    // headerRendering
    exports.CssClassApplier = CssClassApplier;
    exports.HeaderContainer = HeaderContainer;
    exports.HeaderRenderer = HeaderRenderer;
    exports.HeaderTemplateLoader = HeaderTemplateLoader;
    exports.HorizontalDragService = HorizontalDragService;
    exports.MoveColumnController = MoveColumnController;
    exports.RenderedHeaderCell = RenderedHeaderCell;
    exports.RenderedHeaderGroupCell = RenderedHeaderGroupCell;
    exports.StandardMenuFactory = StandardMenuFactory;

    // layout
    exports.BorderLayout = BorderLayout;
    exports.TabbedLayout = TabbedLayout;
    exports.VerticalStack = VerticalStack;

    // rendering
    exports.AutoWidthCalculator = AutoWidthCalculator;
    exports.RenderedHeaderCell = RenderedHeaderCell;
    exports.RenderedRow = RenderedRow;
    exports.RowRenderer = RowRenderer;

    // rowControllers/inMemory
    exports.FilterStage = FilterStage;
    exports.FlattenStage = FlattenStage;
    exports.InMemoryRowController = InMemoryRowController;
    exports.SortStage = SortStage;

    // rowControllers
    exports.FloatingRowModel = FloatingRowModel;
    exports.PaginationController = PaginationController;
    exports.VirtualPageRowController = VirtualPageRowController;

    // widgets
    exports.PopupService = PopupService;
    exports.CMenuItem = CMenuItem;
    exports.Component = Component;
    exports.MenuList = MenuList;

    // root
    exports.CellNavigationService = CellNavigationService;
    exports.ColumnChangeEvent = ColumnChangeEvent;
    exports.Constants = Constants;
    exports.CsvCreator = CsvCreator;
    exports.Events = Events;
    exports.EventService = EventService;
    exports.ExpressionService = ExpressionService;
    exports.FocusedCellController = FocusedCellController;
    exports.defaultGroupComparator = defaultGroupComparator;
    exports.Grid = Grid;
    exports.GridApi = GridApi;
    exports.GridCore = GridCore;
    exports.GridOptionsWrapper = GridOptionsWrapper;
    exports.Logger = Logger;
    exports.MasterSlaveService = MasterSlaveService;
    exports.SelectionController = SelectionController;
    exports.SelectionRendererFactory = SelectionRendererFactory;
    exports.SortController = SortController;
    exports.SvgFactory = SvgFactory;
    exports.TemplateService = TemplateService;
    exports.Utils = Utils;
    exports.ValueService = ValueService;

}
