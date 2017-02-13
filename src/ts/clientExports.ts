import {Grid} from "./grid";
import {GridApi} from "./gridApi";
import {Events} from "./events";
import {ComponentUtil} from "./components/componentUtil";
import {ColumnController} from "./columnController/columnController";
import {initialiseAgGridWithAngular1} from "./components/agGridNg1";
import {initialiseAgGridWithWebComponents} from "./components/agGridWebComponent";
import {GridCell} from "./entities/gridCell";
import {RowNode} from "./entities/rowNode";
import {OriginalColumnGroup} from "./entities/originalColumnGroup";
import {ColumnGroup} from "./entities/columnGroup";
import {Column} from "./entities/column";
import {FocusedCellController} from "./focusedCellController";
import {defaultGroupComparator} from "./functions";
import {GridOptionsWrapper} from "./gridOptionsWrapper";
import {BalancedColumnTreeBuilder} from "./columnController/balancedColumnTreeBuilder";
import {ColumnKeyCreator} from "./columnController/columnKeyCreator";
import {ColumnUtils} from "./columnController/columnUtils";
import {DisplayedGroupCreator} from "./columnController/displayedGroupCreator";
import {GroupInstanceIdCreator} from "./columnController/groupInstanceIdCreator";
import {Context, Autowired, PostConstruct, Optional, Bean, Qualifier, PreDestroy} from "./context/context";
import {DragAndDropService, DragSourceType, HDirection, VDirection} from "./dragAndDrop/dragAndDropService";
import {DragService} from "./dragAndDrop/dragService";
import {FilterManager} from "./filter/filterManager";
import {NumberFilter} from "./filter/numberFilter";
import {TextFilter} from "./filter/textFilter";
import {GridPanel} from "./gridPanel/gridPanel";
import {MouseEventService} from "./gridPanel/mouseEventService";
import {CssClassApplier} from "./headerRendering/cssClassApplier";
import {HeaderContainer} from "./headerRendering/headerContainer";
import {HeaderRenderer} from "./headerRendering/headerRenderer";
import {HeaderTemplateLoader} from "./headerRendering/deprecated/headerTemplateLoader";
import {HorizontalDragService} from "./headerRendering/horizontalDragService";
import {MoveColumnController} from "./headerRendering/moveColumnController";
import {RenderedHeaderCell} from "./headerRendering/deprecated/renderedHeaderCell";
import {StandardMenuFactory} from "./headerRendering/standardMenu";
import {BorderLayout} from "./layout/borderLayout";
import {TabbedLayout} from "./layout/tabbedLayout";
import {VerticalStack} from "./layout/verticalStack";
import {AutoWidthCalculator} from "./rendering/autoWidthCalculator";
import {RenderedRow} from "./rendering/renderedRow";
import {RowRenderer} from "./rendering/rowRenderer";
import {FilterStage} from "./rowControllers/inMemory/filterStage";
import {FlattenStage} from "./rowControllers/inMemory/flattenStage";
import {SortStage} from "./rowControllers/inMemory/sortStage";
import {FloatingRowModel} from "./rowControllers/floatingRowModel";
import {PaginationController} from "./rowControllers/paginationController";
import {Component} from "./widgets/component";
import {CellNavigationService} from "./cellNavigationService";
import {ColumnChangeEvent} from "./columnChangeEvent";
import {Constants} from "./constants";
import {CsvCreator} from "./csvCreator";
import {Downloader} from "./downloader";
import {EventService} from "./eventService";
import {ExpressionService} from "./expressionService";
import {GridCore} from "./gridCore";
import {Logger} from "./logger";
import {MasterSlaveService} from "./masterSlaveService";
import {SelectionController} from "./selectionController";
import {SortController} from "./sortController";
import {SvgFactory} from "./svgFactory";
import {TemplateService} from "./templateService";
import {Utils, NumberSequence, _} from "./utils";
import {ValueService} from "./valueService";
import {PopupService} from "./widgets/popupService";
import {GridRow} from "./entities/gridRow";
import {InMemoryRowModel} from "./rowControllers/inMemory/inMemoryRowModel";
import {VirtualPageRowModel} from "./rowControllers/virtualPagination/virtualPageRowModel";
import {AnimateSlideCellRenderer} from "./rendering/cellRenderers/animateSlideCellRenderer";
import {CellEditorFactory} from "./rendering/cellEditorFactory";
import {PopupEditorWrapper} from "./rendering/cellEditors/popupEditorWrapper";
import {PopupSelectCellEditor} from "./rendering/cellEditors/popupSelectCellEditor";
import {PopupTextCellEditor} from "./rendering/cellEditors/popupTextCellEditor";
import {SelectCellEditor} from "./rendering/cellEditors/selectCellEditor";
import {TextCellEditor} from "./rendering/cellEditors/textCellEditor";
import {LargeTextCellEditor} from "./rendering/cellEditors/largeTextCellEditor";
import {CellRendererFactory} from "./rendering/cellRendererFactory";
import {GroupCellRenderer} from "./rendering/cellRenderers/groupCellRenderer";
import {CellRendererService} from "./rendering/cellRendererService";
import {ValueFormatterService} from "./rendering/valueFormatterService";
import {CheckboxSelectionComponent} from "./rendering/checkboxSelectionComponent";
import {QuerySelector, Listener} from "./widgets/componentAnnotations";
import {AgCheckbox} from "./widgets/agCheckbox";
import {BodyDropPivotTarget} from "./headerRendering/bodyDropPivotTarget";
import {BodyDropTarget} from "./headerRendering/bodyDropTarget";
import {FocusService} from "./misc/focusService";
import {SetLeftFeature} from "./rendering/features/setLeftFeature";
import {RenderedCell} from "./rendering/renderedCell";
import {HeaderRowComp} from "./headerRendering/headerRowComp";
import {AnimateShowChangeCellRenderer} from "./rendering/cellRenderers/animateShowChangeCellRenderer";
import {InMemoryNodeManager} from "./rowControllers/inMemory/inMemoryNodeManager";
import {VirtualPageCache} from "./rowControllers/virtualPagination/virtualPageCache";
import {VirtualPage} from "./rowControllers/virtualPagination/virtualPage";
import {BaseFrameworkFactory} from "./baseFrameworkFactory";
import {MethodNotImplementedException} from "./misc/methodNotImplementedException";
import {TouchListener} from "./widgets/touchListener";
import {ScrollVisibleService} from "./gridPanel/scrollVisibleService";
import {XmlFactory} from "./xmlFactory";
import {BeanStub} from "./context/beanStub";
import {GridSerializer, BaseGridSerializingSession, RowType} from "./gridSerializer";
import {StylingService} from "./styling/stylingService";

export function populateClientExports(exports: any): void {

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
    exports.BeanStub = BeanStub;
    exports.Context = Context;
    exports.Autowired = Autowired;
    exports.PostConstruct = PostConstruct;
    exports.PreDestroy = PreDestroy;
    exports.Optional = Optional;
    exports.Bean = Bean;
    exports.Qualifier = Qualifier;
    exports.Listener = Listener;
    exports.QuerySelector = QuerySelector;

    // dragAndDrop
    exports.HDirection = HDirection;
    exports.VDirection = VDirection;
    exports.DragAndDropService = DragAndDropService;
    exports.DragService = DragService;
    exports.DragSourceType = DragSourceType;

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
    exports.ScrollVisibleService = ScrollVisibleService;
    exports.MouseEventService = MouseEventService;

    // headerRendering
    exports.BodyDropPivotTarget = BodyDropPivotTarget;
    exports.BodyDropTarget = BodyDropTarget;
    exports.CssClassApplier = CssClassApplier;
    exports.HeaderContainer = HeaderContainer;
    exports.HeaderRenderer = HeaderRenderer;
    exports.HeaderRowComp = HeaderRowComp;
    exports.HeaderTemplateLoader = HeaderTemplateLoader;
    exports.HorizontalDragService = HorizontalDragService;
    exports.MoveColumnController = MoveColumnController;
    exports.RenderedHeaderCell = RenderedHeaderCell;
    exports.StandardMenuFactory = StandardMenuFactory;

    // layout
    exports.BorderLayout = BorderLayout;
    exports.TabbedLayout = TabbedLayout;
    exports.VerticalStack = VerticalStack;

    // misc
    exports.FocusService = FocusService;
    exports.MethodNotImplementedException = MethodNotImplementedException;

    // rendering / cellEditors
    exports.LargeTextCellEditor = LargeTextCellEditor;
    exports.PopupEditorWrapper = PopupEditorWrapper;
    exports.PopupSelectCellEditor = PopupSelectCellEditor;
    exports.PopupTextCellEditor = PopupTextCellEditor;
    exports.SelectCellEditor = SelectCellEditor;
    exports.TextCellEditor = TextCellEditor;

    // rendering / cellRenderers
    exports.AnimateShowChangeCellRenderer = AnimateShowChangeCellRenderer;
    exports.AnimateSlideCellRenderer = AnimateSlideCellRenderer;
    exports.GroupCellRenderer = GroupCellRenderer;

    // features
    exports.SetLeftFeature = SetLeftFeature;

    // rendering
    exports.AutoWidthCalculator = AutoWidthCalculator;
    exports.CellEditorFactory = CellEditorFactory;
    exports.RenderedHeaderCell = RenderedHeaderCell;
    exports.CellRendererFactory = CellRendererFactory;
    exports.CellRendererService = CellRendererService;
    exports.CheckboxSelectionComponent = CheckboxSelectionComponent;
    exports.RenderedCell = RenderedCell;
    exports.RenderedRow = RenderedRow;
    exports.RowRenderer = RowRenderer;
    exports.ValueFormatterService = ValueFormatterService;

    // rowControllers/inMemory
    exports.FilterStage = FilterStage;
    exports.FlattenStage = FlattenStage;
    exports.InMemoryRowModel = InMemoryRowModel;
    exports.SortStage = SortStage;
    exports.InMemoryNodeManager = InMemoryNodeManager;

    // rowControllers
    exports.FloatingRowModel = FloatingRowModel;
    exports.PaginationController = PaginationController;
    exports.VirtualPageRowModel = VirtualPageRowModel;
    exports.VirtualPageCache = VirtualPageCache;
    exports.VirtualPage = VirtualPage;

    //styling
    exports.StylingService = StylingService;

    // widgets
    exports.AgCheckbox = AgCheckbox;
    exports.Component = Component;
    exports.PopupService = PopupService;
    exports.Listener = Listener;
    exports.QuerySelector = QuerySelector;
    exports.TouchListener = TouchListener;

    // root
    exports.BaseFrameworkFactory = BaseFrameworkFactory;
    exports.CellNavigationService = CellNavigationService;
    exports.ColumnChangeEvent = ColumnChangeEvent;
    exports.Constants = Constants;
    exports.CsvCreator = CsvCreator;
    exports.Downloader = Downloader;
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
    exports.CheckboxSelectionComponent = CheckboxSelectionComponent;
    exports.SortController = SortController;
    exports.SvgFactory = SvgFactory;
    exports.TemplateService = TemplateService;
    exports.Utils = Utils;
    exports._ = _;
    exports.NumberSequence = NumberSequence;
    exports.ValueService = ValueService;
    exports.XmlFactory = XmlFactory;
    exports.GridSerializer = GridSerializer;
    exports.BaseGridSerializingSession = BaseGridSerializingSession;
    exports.RowType = RowType;
}
