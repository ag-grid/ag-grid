// ag-grid v4.0.3
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["agGrid"] = factory();
	else
		root["agGrid"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	// same as main.js, except also includes the styles, so webpack includes the css in the bundle

	var populateClientExports = __webpack_require__(1).populateClientExports;
	populateClientExports(exports);

	__webpack_require__(76);
	__webpack_require__(80);
	__webpack_require__(82);
	__webpack_require__(84);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
	 * @version v4.0.3
	 * @link http://www.ag-grid.com/
	 * @license MIT
	 */
	var grid_1 = __webpack_require__(2);
	var gridApi_1 = __webpack_require__(11);
	var events_1 = __webpack_require__(10);
	var componentUtil_1 = __webpack_require__(9);
	var columnController_1 = __webpack_require__(13);
	var agGridNg1_1 = __webpack_require__(70);
	var agGridWebComponent_1 = __webpack_require__(71);
	var gridCell_1 = __webpack_require__(31);
	var rowNode_1 = __webpack_require__(19);
	var originalColumnGroup_1 = __webpack_require__(17);
	var columnGroup_1 = __webpack_require__(14);
	var column_1 = __webpack_require__(15);
	var focusedCellController_1 = __webpack_require__(44);
	var functions_1 = __webpack_require__(53);
	var gridOptionsWrapper_1 = __webpack_require__(3);
	var groupCellRendererFactory_1 = __webpack_require__(35);
	var balancedColumnTreeBuilder_1 = __webpack_require__(47);
	var columnKeyCreator_1 = __webpack_require__(48);
	var columnUtils_1 = __webpack_require__(16);
	var displayedGroupCreator_1 = __webpack_require__(49);
	var groupInstanceIdCreator_1 = __webpack_require__(52);
	var context_1 = __webpack_require__(6);
	var dragAndDropService_1 = __webpack_require__(61);
	var dragService_1 = __webpack_require__(28);
	var filterManager_1 = __webpack_require__(40);
	var numberFilter_1 = __webpack_require__(43);
	var textFilter_1 = __webpack_require__(42);
	var gridPanel_1 = __webpack_require__(24);
	var mouseEventService_1 = __webpack_require__(30);
	var cssClassApplier_1 = __webpack_require__(58);
	var headerContainer_1 = __webpack_require__(55);
	var headerRenderer_1 = __webpack_require__(54);
	var headerTemplateLoader_1 = __webpack_require__(60);
	var horizontalDragService_1 = __webpack_require__(57);
	var moveColumnController_1 = __webpack_require__(62);
	var renderedHeaderCell_1 = __webpack_require__(59);
	var renderedHeaderGroupCell_1 = __webpack_require__(56);
	var standardMenu_1 = __webpack_require__(66);
	var borderLayout_1 = __webpack_require__(27);
	var tabbedLayout_1 = __webpack_require__(72);
	var verticalStack_1 = __webpack_require__(73);
	var autoWidthCalculator_1 = __webpack_require__(50);
	var renderedRow_1 = __webpack_require__(20);
	var rowRenderer_1 = __webpack_require__(23);
	var fillterStage_1 = __webpack_require__(67);
	var flattenStage_1 = __webpack_require__(69);
	var inMemoryRowController_1 = __webpack_require__(63);
	var sortStage_1 = __webpack_require__(68);
	var floatingRowModel_1 = __webpack_require__(26);
	var paginationController_1 = __webpack_require__(38);
	var virtualPageRowController_1 = __webpack_require__(64);
	var cMenuItem_1 = __webpack_require__(74);
	var component_1 = __webpack_require__(45);
	var menuList_1 = __webpack_require__(75);
	var cellNavigationService_1 = __webpack_require__(46);
	var columnChangeEvent_1 = __webpack_require__(51);
	var constants_1 = __webpack_require__(8);
	var csvCreator_1 = __webpack_require__(12);
	var eventService_1 = __webpack_require__(4);
	var expressionService_1 = __webpack_require__(22);
	var gridCore_1 = __webpack_require__(37);
	var logger_1 = __webpack_require__(5);
	var masterSlaveService_1 = __webpack_require__(25);
	var selectionController_1 = __webpack_require__(29);
	var selectionRendererFactory_1 = __webpack_require__(18);
	var sortController_1 = __webpack_require__(39);
	var svgFactory_1 = __webpack_require__(36);
	var templateService_1 = __webpack_require__(33);
	var utils_1 = __webpack_require__(7);
	var valueService_1 = __webpack_require__(34);
	var popupService_1 = __webpack_require__(41);
	var context_2 = __webpack_require__(6);
	var context_3 = __webpack_require__(6);
	var context_4 = __webpack_require__(6);
	var context_5 = __webpack_require__(6);
	var context_6 = __webpack_require__(6);
	var gridRow_1 = __webpack_require__(32);
	function populateClientExports(exports) {
	    // cellRenderers
	    exports.groupCellRendererFactory = groupCellRendererFactory_1.groupCellRendererFactory;
	    // columnController
	    exports.BalancedColumnTreeBuilder = balancedColumnTreeBuilder_1.BalancedColumnTreeBuilder;
	    exports.ColumnController = columnController_1.ColumnController;
	    exports.ColumnKeyCreator = columnKeyCreator_1.ColumnKeyCreator;
	    exports.ColumnUtils = columnUtils_1.ColumnUtils;
	    exports.DisplayedGroupCreator = displayedGroupCreator_1.DisplayedGroupCreator;
	    exports.GroupInstanceIdCreator = groupInstanceIdCreator_1.GroupInstanceIdCreator;
	    // components
	    exports.ComponentUtil = componentUtil_1.ComponentUtil;
	    exports.initialiseAgGridWithAngular1 = agGridNg1_1.initialiseAgGridWithAngular1;
	    exports.initialiseAgGridWithWebComponents = agGridWebComponent_1.initialiseAgGridWithWebComponents;
	    // context
	    exports.Context = context_1.Context;
	    exports.Autowired = context_2.Autowired;
	    exports.PostConstruct = context_3.PostConstruct;
	    exports.Optional = context_4.Optional;
	    exports.Bean = context_5.Bean;
	    exports.Qualifier = context_6.Qualifier;
	    // dragAndDrop
	    exports.DragAndDropService = dragAndDropService_1.DragAndDropService;
	    exports.DragService = dragService_1.DragService;
	    // entities
	    exports.Column = column_1.Column;
	    exports.ColumnGroup = columnGroup_1.ColumnGroup;
	    exports.GridCell = gridCell_1.GridCell;
	    exports.GridRow = gridRow_1.GridRow;
	    exports.OriginalColumnGroup = originalColumnGroup_1.OriginalColumnGroup;
	    exports.RowNode = rowNode_1.RowNode;
	    // filter
	    exports.FilterManager = filterManager_1.FilterManager;
	    exports.NumberFilter = numberFilter_1.NumberFilter;
	    exports.TextFilter = textFilter_1.TextFilter;
	    // gridPanel
	    exports.GridPanel = gridPanel_1.GridPanel;
	    exports.MouseEventService = mouseEventService_1.MouseEventService;
	    // headerRendering
	    exports.CssClassApplier = cssClassApplier_1.CssClassApplier;
	    exports.HeaderContainer = headerContainer_1.HeaderContainer;
	    exports.HeaderRenderer = headerRenderer_1.HeaderRenderer;
	    exports.HeaderTemplateLoader = headerTemplateLoader_1.HeaderTemplateLoader;
	    exports.HorizontalDragService = horizontalDragService_1.HorizontalDragService;
	    exports.MoveColumnController = moveColumnController_1.MoveColumnController;
	    exports.RenderedHeaderCell = renderedHeaderCell_1.RenderedHeaderCell;
	    exports.RenderedHeaderGroupCell = renderedHeaderGroupCell_1.RenderedHeaderGroupCell;
	    exports.StandardMenuFactory = standardMenu_1.StandardMenuFactory;
	    // layout
	    exports.BorderLayout = borderLayout_1.BorderLayout;
	    exports.TabbedLayout = tabbedLayout_1.TabbedLayout;
	    exports.VerticalStack = verticalStack_1.VerticalStack;
	    // rendering
	    exports.AutoWidthCalculator = autoWidthCalculator_1.AutoWidthCalculator;
	    exports.RenderedHeaderCell = renderedHeaderCell_1.RenderedHeaderCell;
	    exports.RenderedRow = renderedRow_1.RenderedRow;
	    exports.RowRenderer = rowRenderer_1.RowRenderer;
	    // rowControllers/inMemory
	    exports.FilterStage = fillterStage_1.FilterStage;
	    exports.FlattenStage = flattenStage_1.FlattenStage;
	    exports.InMemoryRowController = inMemoryRowController_1.InMemoryRowController;
	    exports.SortStage = sortStage_1.SortStage;
	    // rowControllers
	    exports.FloatingRowModel = floatingRowModel_1.FloatingRowModel;
	    exports.PaginationController = paginationController_1.PaginationController;
	    exports.VirtualPageRowController = virtualPageRowController_1.VirtualPageRowController;
	    // widgets
	    exports.PopupService = popupService_1.PopupService;
	    exports.CMenuItem = cMenuItem_1.CMenuItem;
	    exports.Component = component_1.Component;
	    exports.MenuList = menuList_1.MenuList;
	    // root
	    exports.CellNavigationService = cellNavigationService_1.CellNavigationService;
	    exports.ColumnChangeEvent = columnChangeEvent_1.ColumnChangeEvent;
	    exports.Constants = constants_1.Constants;
	    exports.CsvCreator = csvCreator_1.CsvCreator;
	    exports.Events = events_1.Events;
	    exports.EventService = eventService_1.EventService;
	    exports.ExpressionService = expressionService_1.ExpressionService;
	    exports.FocusedCellController = focusedCellController_1.FocusedCellController;
	    exports.defaultGroupComparator = functions_1.defaultGroupComparator;
	    exports.Grid = grid_1.Grid;
	    exports.GridApi = gridApi_1.GridApi;
	    exports.GridCore = gridCore_1.GridCore;
	    exports.GridOptionsWrapper = gridOptionsWrapper_1.GridOptionsWrapper;
	    exports.Logger = logger_1.Logger;
	    exports.MasterSlaveService = masterSlaveService_1.MasterSlaveService;
	    exports.SelectionController = selectionController_1.SelectionController;
	    exports.SelectionRendererFactory = selectionRendererFactory_1.SelectionRendererFactory;
	    exports.SortController = sortController_1.SortController;
	    exports.SvgFactory = svgFactory_1.SvgFactory;
	    exports.TemplateService = templateService_1.TemplateService;
	    exports.Utils = utils_1.Utils;
	    exports.ValueService = valueService_1.ValueService;
	}
	exports.populateClientExports = populateClientExports;


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
	 * @version v4.0.3
	 * @link http://www.ag-grid.com/
	 * @license MIT
	 */
	var gridOptionsWrapper_1 = __webpack_require__(3);
	var inMemoryRowController_1 = __webpack_require__(63);
	var paginationController_1 = __webpack_require__(38);
	var virtualPageRowController_1 = __webpack_require__(64);
	var floatingRowModel_1 = __webpack_require__(26);
	var selectionController_1 = __webpack_require__(29);
	var columnController_1 = __webpack_require__(13);
	var rowRenderer_1 = __webpack_require__(23);
	var headerRenderer_1 = __webpack_require__(54);
	var filterManager_1 = __webpack_require__(40);
	var valueService_1 = __webpack_require__(34);
	var masterSlaveService_1 = __webpack_require__(25);
	var eventService_1 = __webpack_require__(4);
	var oldToolPanelDragAndDropService_1 = __webpack_require__(65);
	var gridPanel_1 = __webpack_require__(24);
	var gridApi_1 = __webpack_require__(11);
	var constants_1 = __webpack_require__(8);
	var headerTemplateLoader_1 = __webpack_require__(60);
	var balancedColumnTreeBuilder_1 = __webpack_require__(47);
	var displayedGroupCreator_1 = __webpack_require__(49);
	var selectionRendererFactory_1 = __webpack_require__(18);
	var expressionService_1 = __webpack_require__(22);
	var templateService_1 = __webpack_require__(33);
	var popupService_1 = __webpack_require__(41);
	var logger_1 = __webpack_require__(5);
	var columnUtils_1 = __webpack_require__(16);
	var autoWidthCalculator_1 = __webpack_require__(50);
	var horizontalDragService_1 = __webpack_require__(57);
	var context_1 = __webpack_require__(6);
	var csvCreator_1 = __webpack_require__(12);
	var gridCore_1 = __webpack_require__(37);
	var standardMenu_1 = __webpack_require__(66);
	var dragAndDropService_1 = __webpack_require__(61);
	var dragService_1 = __webpack_require__(28);
	var sortController_1 = __webpack_require__(39);
	var columnController_2 = __webpack_require__(13);
	var focusedCellController_1 = __webpack_require__(44);
	var mouseEventService_1 = __webpack_require__(30);
	var cellNavigationService_1 = __webpack_require__(46);
	var utils_1 = __webpack_require__(7);
	var fillterStage_1 = __webpack_require__(67);
	var sortStage_1 = __webpack_require__(68);
	var flattenStage_1 = __webpack_require__(69);
	var Grid = (function () {
	    function Grid(eGridDiv, gridOptions, globalEventListener, $scope, $compile, quickFilterOnScope) {
	        if (globalEventListener === void 0) { globalEventListener = null; }
	        if ($scope === void 0) { $scope = null; }
	        if ($compile === void 0) { $compile = null; }
	        if (quickFilterOnScope === void 0) { quickFilterOnScope = null; }
	        if (!eGridDiv) {
	            console.error('ag-Grid: no div element provided to the grid');
	        }
	        if (!gridOptions) {
	            console.error('ag-Grid: no gridOptions provided to the grid');
	        }
	        var virtualPaging = gridOptions.rowModelType === constants_1.Constants.ROW_MODEL_TYPE_VIRTUAL;
	        var rowModelClass = virtualPaging ? virtualPageRowController_1.VirtualPageRowController : inMemoryRowController_1.InMemoryRowController;
	        var enterprise = utils_1.Utils.exists(Grid.enterpriseBeans);
	        this.context = new context_1.Context({
	            overrideBeans: Grid.enterpriseBeans,
	            seed: {
	                enterprise: enterprise,
	                gridOptions: gridOptions,
	                eGridDiv: eGridDiv,
	                $scope: $scope,
	                $compile: $compile,
	                quickFilterOnScope: quickFilterOnScope,
	                globalEventListener: globalEventListener
	            },
	            beans: [rowModelClass, horizontalDragService_1.HorizontalDragService, headerTemplateLoader_1.HeaderTemplateLoader, floatingRowModel_1.FloatingRowModel, dragService_1.DragService,
	                displayedGroupCreator_1.DisplayedGroupCreator, eventService_1.EventService, gridOptionsWrapper_1.GridOptionsWrapper, selectionController_1.SelectionController,
	                filterManager_1.FilterManager, selectionRendererFactory_1.SelectionRendererFactory, columnController_1.ColumnController, rowRenderer_1.RowRenderer,
	                headerRenderer_1.HeaderRenderer, expressionService_1.ExpressionService, balancedColumnTreeBuilder_1.BalancedColumnTreeBuilder, csvCreator_1.CsvCreator,
	                templateService_1.TemplateService, gridPanel_1.GridPanel, popupService_1.PopupService, valueService_1.ValueService, masterSlaveService_1.MasterSlaveService,
	                logger_1.LoggerFactory, oldToolPanelDragAndDropService_1.OldToolPanelDragAndDropService, columnUtils_1.ColumnUtils, autoWidthCalculator_1.AutoWidthCalculator, gridApi_1.GridApi,
	                paginationController_1.PaginationController, popupService_1.PopupService, gridCore_1.GridCore, standardMenu_1.StandardMenuFactory,
	                dragAndDropService_1.DragAndDropService, sortController_1.SortController, columnController_2.ColumnApi, focusedCellController_1.FocusedCellController, mouseEventService_1.MouseEventService,
	                cellNavigationService_1.CellNavigationService, fillterStage_1.FilterStage, sortStage_1.SortStage, flattenStage_1.FlattenStage],
	            debug: !!gridOptions.debug
	        });
	    }
	    Grid.setEnterpriseBeans = function (enterpriseBeans) {
	        this.enterpriseBeans = enterpriseBeans;
	    };
	    Grid.prototype.destroy = function () {
	        this.context.destroy();
	    };
	    return Grid;
	})();
	exports.Grid = Grid;


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
	 * @version v4.0.3
	 * @link http://www.ag-grid.com/
	 * @license MIT
	 */
	var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
	    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
	    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
	    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
	    return c > 3 && r && Object.defineProperty(target, key, r), r;
	};
	var __metadata = (this && this.__metadata) || function (k, v) {
	    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
	};
	var __param = (this && this.__param) || function (paramIndex, decorator) {
	    return function (target, key) { decorator(target, key, paramIndex); }
	};
	var eventService_1 = __webpack_require__(4);
	var constants_1 = __webpack_require__(8);
	var componentUtil_1 = __webpack_require__(9);
	var gridApi_1 = __webpack_require__(11);
	var context_1 = __webpack_require__(6);
	var context_2 = __webpack_require__(6);
	var columnController_1 = __webpack_require__(13);
	var context_3 = __webpack_require__(6);
	var events_1 = __webpack_require__(10);
	var columnController_2 = __webpack_require__(13);
	var context_4 = __webpack_require__(6);
	var DEFAULT_ROW_HEIGHT = 25;
	function isTrue(value) {
	    return value === true || value === 'true';
	}
	var GridOptionsWrapper = (function () {
	    function GridOptionsWrapper() {
	    }
	    GridOptionsWrapper.prototype.agWire = function (gridApi, columnApi) {
	        this.headerHeight = this.gridOptions.headerHeight;
	        this.gridOptions.api = gridApi;
	        this.gridOptions.columnApi = columnApi;
	        this.checkForDeprecated();
	    };
	    GridOptionsWrapper.prototype.init = function () {
	        this.eventService.addGlobalListener(this.globalEventHandler.bind(this));
	        if (this.isGroupSelectsChildren() && this.isSuppressParentsInRowNodes()) {
	            console.warn('ag-Grid: groupSelectsChildren does not work wth suppressParentsInRowNodes, this selection method needs the part in rowNode to work');
	        }
	        if (this.isGroupSelectsChildren() && !this.isRowSelectionMulti()) {
	            console.warn('ag-Grid: rowSelectionMulti must be true for groupSelectsChildren to make sense');
	        }
	    };
	    GridOptionsWrapper.prototype.isEnterprise = function () { return this.enterprise; };
	    GridOptionsWrapper.prototype.isRowSelection = function () { return this.gridOptions.rowSelection === "single" || this.gridOptions.rowSelection === "multiple"; };
	    GridOptionsWrapper.prototype.isRowDeselection = function () { return isTrue(this.gridOptions.rowDeselection); };
	    GridOptionsWrapper.prototype.isRowSelectionMulti = function () { return this.gridOptions.rowSelection === 'multiple'; };
	    GridOptionsWrapper.prototype.getContext = function () { return this.gridOptions.context; };
	    GridOptionsWrapper.prototype.isRowModelPagination = function () { return this.gridOptions.rowModelType === constants_1.Constants.ROW_MODEL_TYPE_PAGINATION; };
	    GridOptionsWrapper.prototype.isRowModelVirtual = function () { return this.gridOptions.rowModelType === constants_1.Constants.ROW_MODEL_TYPE_VIRTUAL; };
	    GridOptionsWrapper.prototype.isRowModelDefault = function () { return !(this.isRowModelPagination() || this.isRowModelVirtual()); };
	    GridOptionsWrapper.prototype.isShowToolPanel = function () { return isTrue(this.gridOptions.showToolPanel); };
	    GridOptionsWrapper.prototype.isToolPanelSuppressGroups = function () { return isTrue(this.gridOptions.toolPanelSuppressGroups); };
	    GridOptionsWrapper.prototype.isToolPanelSuppressValues = function () { return isTrue(this.gridOptions.toolPanelSuppressValues); };
	    GridOptionsWrapper.prototype.isGroupSelectsChildren = function () { return isTrue(this.gridOptions.groupSelectsChildren); };
	    GridOptionsWrapper.prototype.isGroupHideGroupColumns = function () { return isTrue(this.gridOptions.groupHideGroupColumns); };
	    GridOptionsWrapper.prototype.isGroupIncludeFooter = function () { return isTrue(this.gridOptions.groupIncludeFooter); };
	    GridOptionsWrapper.prototype.isGroupSuppressBlankHeader = function () { return isTrue(this.gridOptions.groupSuppressBlankHeader); };
	    GridOptionsWrapper.prototype.isSuppressRowClickSelection = function () { return isTrue(this.gridOptions.suppressRowClickSelection); };
	    GridOptionsWrapper.prototype.isSuppressCellSelection = function () { return isTrue(this.gridOptions.suppressCellSelection); };
	    GridOptionsWrapper.prototype.isSuppressMultiSort = function () { return isTrue(this.gridOptions.suppressMultiSort); };
	    GridOptionsWrapper.prototype.isGroupSuppressAutoColumn = function () { return isTrue(this.gridOptions.groupSuppressAutoColumn); };
	    GridOptionsWrapper.prototype.isForPrint = function () { return isTrue(this.gridOptions.forPrint); };
	    GridOptionsWrapper.prototype.isSuppressHorizontalScroll = function () { return isTrue(this.gridOptions.suppressHorizontalScroll); };
	    GridOptionsWrapper.prototype.isSuppressLoadingOverlay = function () { return isTrue(this.gridOptions.suppressLoadingOverlay); };
	    GridOptionsWrapper.prototype.isSuppressNoRowsOverlay = function () { return isTrue(this.gridOptions.suppressNoRowsOverlay); };
	    GridOptionsWrapper.prototype.isSuppressFieldDotNotation = function () { return isTrue(this.gridOptions.suppressFieldDotNotation); };
	    GridOptionsWrapper.prototype.getFloatingTopRowData = function () { return this.gridOptions.floatingTopRowData; };
	    GridOptionsWrapper.prototype.getFloatingBottomRowData = function () { return this.gridOptions.floatingBottomRowData; };
	    GridOptionsWrapper.prototype.isUnSortIcon = function () { return isTrue(this.gridOptions.unSortIcon); };
	    GridOptionsWrapper.prototype.isSuppressMenuHide = function () { return isTrue(this.gridOptions.suppressMenuHide); };
	    GridOptionsWrapper.prototype.getRowStyle = function () { return this.gridOptions.rowStyle; };
	    GridOptionsWrapper.prototype.getRowClass = function () { return this.gridOptions.rowClass; };
	    GridOptionsWrapper.prototype.getRowStyleFunc = function () { return this.gridOptions.getRowStyle; };
	    GridOptionsWrapper.prototype.getRowClassFunc = function () { return this.gridOptions.getRowClass; };
	    GridOptionsWrapper.prototype.getBusinessKeyForNodeFunc = function () { return this.gridOptions.getBusinessKeyForNode; };
	    GridOptionsWrapper.prototype.getHeaderCellRenderer = function () { return this.gridOptions.headerCellRenderer; };
	    GridOptionsWrapper.prototype.getApi = function () { return this.gridOptions.api; };
	    GridOptionsWrapper.prototype.getColumnApi = function () { return this.gridOptions.columnApi; };
	    GridOptionsWrapper.prototype.isEnableColResize = function () { return isTrue(this.gridOptions.enableColResize); };
	    GridOptionsWrapper.prototype.isSingleClickEdit = function () { return isTrue(this.gridOptions.singleClickEdit); };
	    GridOptionsWrapper.prototype.getGroupDefaultExpanded = function () { return this.gridOptions.groupDefaultExpanded; };
	    GridOptionsWrapper.prototype.getGroupAggFunction = function () { return this.gridOptions.groupAggFunction; };
	    GridOptionsWrapper.prototype.getRowData = function () { return this.gridOptions.rowData; };
	    GridOptionsWrapper.prototype.isGroupUseEntireRow = function () { return isTrue(this.gridOptions.groupUseEntireRow); };
	    GridOptionsWrapper.prototype.getGroupColumnDef = function () { return this.gridOptions.groupColumnDef; };
	    GridOptionsWrapper.prototype.isGroupSuppressRow = function () { return isTrue(this.gridOptions.groupSuppressRow); };
	    GridOptionsWrapper.prototype.getRowGroupPanelShow = function () { return this.gridOptions.rowGroupPanelShow; };
	    GridOptionsWrapper.prototype.isAngularCompileRows = function () { return isTrue(this.gridOptions.angularCompileRows); };
	    GridOptionsWrapper.prototype.isAngularCompileFilters = function () { return isTrue(this.gridOptions.angularCompileFilters); };
	    GridOptionsWrapper.prototype.isAngularCompileHeaders = function () { return isTrue(this.gridOptions.angularCompileHeaders); };
	    GridOptionsWrapper.prototype.isDebug = function () { return isTrue(this.gridOptions.debug); };
	    GridOptionsWrapper.prototype.getColumnDefs = function () { return this.gridOptions.columnDefs; };
	    GridOptionsWrapper.prototype.getDatasource = function () { return this.gridOptions.datasource; };
	    GridOptionsWrapper.prototype.isEnableSorting = function () { return isTrue(this.gridOptions.enableSorting) || isTrue(this.gridOptions.enableServerSideSorting); };
	    GridOptionsWrapper.prototype.isEnableCellExpressions = function () { return isTrue(this.gridOptions.enableCellExpressions); };
	    GridOptionsWrapper.prototype.isEnableServerSideSorting = function () { return isTrue(this.gridOptions.enableServerSideSorting); };
	    GridOptionsWrapper.prototype.isSuppressContextMenu = function () { return isTrue(this.gridOptions.suppressContextMenu); };
	    GridOptionsWrapper.prototype.isEnableFilter = function () { return isTrue(this.gridOptions.enableFilter) || isTrue(this.gridOptions.enableServerSideFilter); };
	    GridOptionsWrapper.prototype.isEnableServerSideFilter = function () { return this.gridOptions.enableServerSideFilter; };
	    GridOptionsWrapper.prototype.isSuppressScrollLag = function () { return isTrue(this.gridOptions.suppressScrollLag); };
	    GridOptionsWrapper.prototype.isSuppressMovableColumns = function () { return isTrue(this.gridOptions.suppressMovableColumns); };
	    GridOptionsWrapper.prototype.isSuppressColumnMoveAnimation = function () { return isTrue(this.gridOptions.suppressColumnMoveAnimation); };
	    GridOptionsWrapper.prototype.isSuppressMenuColumnPanel = function () { return isTrue(this.gridOptions.suppressMenuColumnPanel); };
	    GridOptionsWrapper.prototype.isSuppressMenuFilterPanel = function () { return isTrue(this.gridOptions.suppressMenuFilterPanel); };
	    GridOptionsWrapper.prototype.isSuppressMenuMainPanel = function () { return isTrue(this.gridOptions.suppressMenuMainPanel); };
	    GridOptionsWrapper.prototype.isEnableRangeSelection = function () { return isTrue(this.gridOptions.enableRangeSelection); };
	    GridOptionsWrapper.prototype.isRememberGroupStateWhenNewData = function () { return isTrue(this.gridOptions.rememberGroupStateWhenNewData); };
	    GridOptionsWrapper.prototype.getIcons = function () { return this.gridOptions.icons; };
	    GridOptionsWrapper.prototype.getIsScrollLag = function () { return this.gridOptions.isScrollLag; };
	    GridOptionsWrapper.prototype.getSortingOrder = function () { return this.gridOptions.sortingOrder; };
	    GridOptionsWrapper.prototype.getSlaveGrids = function () { return this.gridOptions.slaveGrids; };
	    GridOptionsWrapper.prototype.getGroupRowRenderer = function () { return this.gridOptions.groupRowRenderer; };
	    GridOptionsWrapper.prototype.getOverlayLoadingTemplate = function () { return this.gridOptions.overlayLoadingTemplate; };
	    GridOptionsWrapper.prototype.getOverlayNoRowsTemplate = function () { return this.gridOptions.overlayNoRowsTemplate; };
	    GridOptionsWrapper.prototype.getCheckboxSelection = function () { return this.gridOptions.checkboxSelection; };
	    GridOptionsWrapper.prototype.isSuppressAutoSize = function () { return isTrue(this.gridOptions.suppressAutoSize); };
	    GridOptionsWrapper.prototype.isSuppressParentsInRowNodes = function () { return isTrue(this.gridOptions.suppressParentsInRowNodes); };
	    GridOptionsWrapper.prototype.isEnableStatusBar = function () { return isTrue(this.gridOptions.enableStatusBar); };
	    GridOptionsWrapper.prototype.getHeaderCellTemplate = function () { return this.gridOptions.headerCellTemplate; };
	    GridOptionsWrapper.prototype.getHeaderCellTemplateFunc = function () { return this.gridOptions.getHeaderCellTemplate; };
	    GridOptionsWrapper.prototype.getNodeChildDetailsFunc = function () { return this.gridOptions.getNodeChildDetails; };
	    GridOptionsWrapper.prototype.getContextMenuItemsFunc = function () { return this.gridOptions.getContextMenuItems; };
	    GridOptionsWrapper.prototype.getMainMenuItemsFunc = function () { return this.gridOptions.getMainMenuItems; };
	    GridOptionsWrapper.prototype.getProcessCellForClipboardFunc = function () { return this.gridOptions.processCellForClipboard; };
	    GridOptionsWrapper.prototype.executeProcessRowPostCreateFunc = function (params) {
	        if (this.gridOptions.processRowPostCreate) {
	            this.gridOptions.processRowPostCreate(params);
	        }
	    };
	    // properties
	    GridOptionsWrapper.prototype.getHeaderHeight = function () {
	        if (typeof this.headerHeight === 'number') {
	            return this.headerHeight;
	        }
	        else {
	            return 25;
	        }
	    };
	    GridOptionsWrapper.prototype.setHeaderHeight = function (headerHeight) {
	        this.headerHeight = headerHeight;
	        this.eventService.dispatchEvent(events_1.Events.EVENT_HEADER_HEIGHT_CHANGED);
	    };
	    GridOptionsWrapper.prototype.isExternalFilterPresent = function () {
	        if (typeof this.gridOptions.isExternalFilterPresent === 'function') {
	            return this.gridOptions.isExternalFilterPresent();
	        }
	        else {
	            return false;
	        }
	    };
	    GridOptionsWrapper.prototype.doesExternalFilterPass = function (node) {
	        if (typeof this.gridOptions.doesExternalFilterPass === 'function') {
	            return this.gridOptions.doesExternalFilterPass(node);
	        }
	        else {
	            return false;
	        }
	    };
	    GridOptionsWrapper.prototype.getGroupRowInnerRenderer = function () {
	        return this.gridOptions.groupRowInnerRenderer;
	    };
	    GridOptionsWrapper.prototype.getMinColWidth = function () {
	        if (this.gridOptions.minColWidth > GridOptionsWrapper.MIN_COL_WIDTH) {
	            return this.gridOptions.minColWidth;
	        }
	        else {
	            return GridOptionsWrapper.MIN_COL_WIDTH;
	        }
	    };
	    GridOptionsWrapper.prototype.getMaxColWidth = function () {
	        if (this.gridOptions.maxColWidth > GridOptionsWrapper.MIN_COL_WIDTH) {
	            return this.gridOptions.maxColWidth;
	        }
	        else {
	            return null;
	        }
	    };
	    GridOptionsWrapper.prototype.getColWidth = function () {
	        if (typeof this.gridOptions.colWidth !== 'number' || this.gridOptions.colWidth < GridOptionsWrapper.MIN_COL_WIDTH) {
	            return 200;
	        }
	        else {
	            return this.gridOptions.colWidth;
	        }
	    };
	    GridOptionsWrapper.prototype.getRowBuffer = function () {
	        if (typeof this.gridOptions.rowBuffer === 'number') {
	            if (this.gridOptions.rowBuffer < 0) {
	                console.warn('ag-Grid: rowBuffer should not be negative');
	            }
	            return this.gridOptions.rowBuffer;
	        }
	        else {
	            return constants_1.Constants.ROW_BUFFER_SIZE;
	        }
	    };
	    GridOptionsWrapper.prototype.checkForDeprecated = function () {
	        // casting to generic object, so typescript compiles even though
	        // we are looking for attributes that don't exist
	        var options = this.gridOptions;
	        if (options.suppressUnSort) {
	            console.warn('ag-grid: as of v1.12.4 suppressUnSort is not used. Please use sortOrder instead.');
	        }
	        if (options.suppressDescSort) {
	            console.warn('ag-grid: as of v1.12.4 suppressDescSort is not used. Please use sortOrder instead.');
	        }
	        if (options.groupAggFields) {
	            console.warn('ag-grid: as of v3 groupAggFields is not used. Please add appropriate agg fields to your columns.');
	        }
	        if (options.groupHidePivotColumns) {
	            console.warn('ag-grid: as of v3 groupHidePivotColumns is not used as pivot columns are now called rowGroup columns. Please refer to the documentation');
	        }
	        if (options.groupKeys) {
	            console.warn('ag-grid: as of v3 groupKeys is not used. You need to set rowGroupIndex on the columns to group. Please refer to the documentation');
	        }
	        if (options.ready || options.onReady) {
	            console.warn('ag-grid: as of v3.3 ready event is now called gridReady, so the callback should be onGridReady');
	        }
	        if (typeof options.groupDefaultExpanded === 'boolean') {
	            console.warn('ag-grid: groupDefaultExpanded can no longer be boolean. for groupDefaultExpanded=true, use groupDefaultExpanded=9999 instead, to expand all the groups');
	        }
	        if (options.onRowDeselected || options.rowDeselected) {
	            console.warn('ag-grid: since version 3.4 event rowDeselected no longer exists, please check the docs');
	        }
	        if (options.rowsAlreadyGrouped) {
	            console.warn('ag-grid: since version 3.4 rowsAlreadyGrouped no longer exists, please use getNodeChildDetails() instead');
	        }
	    };
	    GridOptionsWrapper.prototype.getLocaleTextFunc = function () {
	        if (this.gridOptions.localeTextFunc) {
	            return this.gridOptions.localeTextFunc;
	        }
	        var that = this;
	        return function (key, defaultValue) {
	            var localeText = that.gridOptions.localeText;
	            if (localeText && localeText[key]) {
	                return localeText[key];
	            }
	            else {
	                return defaultValue;
	            }
	        };
	    };
	    // responsible for calling the onXXX functions on gridOptions
	    GridOptionsWrapper.prototype.globalEventHandler = function (eventName, event) {
	        var callbackMethodName = componentUtil_1.ComponentUtil.getCallbackForEvent(eventName);
	        if (typeof this.gridOptions[callbackMethodName] === 'function') {
	            this.gridOptions[callbackMethodName](event);
	        }
	    };
	    // we don't allow dynamic row height for virtual paging
	    GridOptionsWrapper.prototype.getRowHeightForVirtualPagination = function () {
	        if (typeof this.gridOptions.rowHeight === 'number') {
	            return this.gridOptions.rowHeight;
	        }
	        else {
	            return DEFAULT_ROW_HEIGHT;
	        }
	    };
	    GridOptionsWrapper.prototype.getRowHeightForNode = function (rowNode) {
	        if (typeof this.gridOptions.rowHeight === 'number') {
	            return this.gridOptions.rowHeight;
	        }
	        else if (typeof this.gridOptions.getRowHeight === 'function') {
	            var params = {
	                node: rowNode,
	                data: rowNode.data,
	                api: this.gridOptions.api,
	                context: this.gridOptions.context
	            };
	            return this.gridOptions.getRowHeight(params);
	        }
	        else {
	            return DEFAULT_ROW_HEIGHT;
	        }
	    };
	    GridOptionsWrapper.MIN_COL_WIDTH = 10;
	    __decorate([
	        context_3.Autowired('gridOptions'), 
	        __metadata('design:type', Object)
	    ], GridOptionsWrapper.prototype, "gridOptions", void 0);
	    __decorate([
	        context_3.Autowired('columnController'), 
	        __metadata('design:type', columnController_1.ColumnController)
	    ], GridOptionsWrapper.prototype, "columnController", void 0);
	    __decorate([
	        context_3.Autowired('eventService'), 
	        __metadata('design:type', eventService_1.EventService)
	    ], GridOptionsWrapper.prototype, "eventService", void 0);
	    __decorate([
	        context_3.Autowired('enterprise'), 
	        __metadata('design:type', Boolean)
	    ], GridOptionsWrapper.prototype, "enterprise", void 0);
	    __decorate([
	        __param(0, context_2.Qualifier('gridApi')),
	        __param(1, context_2.Qualifier('columnApi')), 
	        __metadata('design:type', Function), 
	        __metadata('design:paramtypes', [gridApi_1.GridApi, columnController_2.ColumnApi]), 
	        __metadata('design:returntype', void 0)
	    ], GridOptionsWrapper.prototype, "agWire", null);
	    __decorate([
	        context_4.PostConstruct, 
	        __metadata('design:type', Function), 
	        __metadata('design:paramtypes', []), 
	        __metadata('design:returntype', void 0)
	    ], GridOptionsWrapper.prototype, "init", null);
	    GridOptionsWrapper = __decorate([
	        context_1.Bean('gridOptionsWrapper'), 
	        __metadata('design:paramtypes', [])
	    ], GridOptionsWrapper);
	    return GridOptionsWrapper;
	})();
	exports.GridOptionsWrapper = GridOptionsWrapper;


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
	 * @version v4.0.3
	 * @link http://www.ag-grid.com/
	 * @license MIT
	 */
	var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
	    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
	    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
	    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
	    return c > 3 && r && Object.defineProperty(target, key, r), r;
	};
	var __metadata = (this && this.__metadata) || function (k, v) {
	    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
	};
	var __param = (this && this.__param) || function (paramIndex, decorator) {
	    return function (target, key) { decorator(target, key, paramIndex); }
	};
	var logger_1 = __webpack_require__(5);
	var utils_1 = __webpack_require__(7);
	var context_1 = __webpack_require__(6);
	var context_2 = __webpack_require__(6);
	var EventService = (function () {
	    function EventService() {
	        this.allListeners = {};
	        this.globalListeners = [];
	    }
	    EventService.prototype.agWire = function (loggerFactory, globalEventListener) {
	        if (globalEventListener === void 0) { globalEventListener = null; }
	        this.logger = loggerFactory.create('EventService');
	        if (globalEventListener) {
	            this.addGlobalListener(globalEventListener);
	        }
	    };
	    EventService.prototype.getListenerList = function (eventType) {
	        var listenerList = this.allListeners[eventType];
	        if (!listenerList) {
	            listenerList = [];
	            this.allListeners[eventType] = listenerList;
	        }
	        return listenerList;
	    };
	    EventService.prototype.addEventListener = function (eventType, listener) {
	        var listenerList = this.getListenerList(eventType);
	        if (listenerList.indexOf(listener) < 0) {
	            listenerList.push(listener);
	        }
	    };
	    // for some events, it's important that the model gets to hear about them before the view,
	    // as the model may need to update before the view works on the info. if you register
	    // via this method, you get notified before the view parts
	    EventService.prototype.addModalPriorityEventListener = function (eventType, listener) {
	        this.addEventListener(eventType + EventService.PRIORITY, listener);
	    };
	    EventService.prototype.addGlobalListener = function (listener) {
	        this.globalListeners.push(listener);
	    };
	    EventService.prototype.removeEventListener = function (eventType, listener) {
	        var listenerList = this.getListenerList(eventType);
	        utils_1.Utils.removeFromArray(listenerList, listener);
	    };
	    EventService.prototype.removeGlobalListener = function (listener) {
	        utils_1.Utils.removeFromArray(this.globalListeners, listener);
	    };
	    // why do we pass the type here? the type is in ColumnChangeEvent, so unless the
	    // type is not in other types of events???
	    EventService.prototype.dispatchEvent = function (eventType, event) {
	        if (!event) {
	            event = {};
	        }
	        //this.logger.log('dispatching: ' + event);
	        // this allows the columnController to get events before anyone else
	        var p1ListenerList = this.getListenerList(eventType + EventService.PRIORITY);
	        p1ListenerList.forEach(function (listener) {
	            listener(event);
	        });
	        var listenerList = this.getListenerList(eventType);
	        listenerList.forEach(function (listener) {
	            listener(event);
	        });
	        this.globalListeners.forEach(function (listener) {
	            listener(eventType, event);
	        });
	    };
	    EventService.PRIORITY = '-P1';
	    __decorate([
	        __param(0, context_2.Qualifier('loggerFactory')),
	        __param(1, context_2.Qualifier('globalEventListener')), 
	        __metadata('design:type', Function), 
	        __metadata('design:paramtypes', [logger_1.LoggerFactory, Function]), 
	        __metadata('design:returntype', void 0)
	    ], EventService.prototype, "agWire", null);
	    EventService = __decorate([
	        context_1.Bean('eventService'), 
	        __metadata('design:paramtypes', [])
	    ], EventService);
	    return EventService;
	})();
	exports.EventService = EventService;


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
	 * @version v4.0.3
	 * @link http://www.ag-grid.com/
	 * @license MIT
	 */
	var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
	    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
	    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
	    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
	    return c > 3 && r && Object.defineProperty(target, key, r), r;
	};
	var __metadata = (this && this.__metadata) || function (k, v) {
	    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
	};
	var __param = (this && this.__param) || function (paramIndex, decorator) {
	    return function (target, key) { decorator(target, key, paramIndex); }
	};
	var gridOptionsWrapper_1 = __webpack_require__(3);
	var context_1 = __webpack_require__(6);
	var context_2 = __webpack_require__(6);
	var LoggerFactory = (function () {
	    function LoggerFactory() {
	    }
	    LoggerFactory.prototype.agWire = function (gridOptionsWrapper) {
	        this.logging = gridOptionsWrapper.isDebug();
	    };
	    LoggerFactory.prototype.create = function (name) {
	        return new Logger(name, this.logging);
	    };
	    __decorate([
	        __param(0, context_2.Qualifier('gridOptionsWrapper')), 
	        __metadata('design:type', Function), 
	        __metadata('design:paramtypes', [gridOptionsWrapper_1.GridOptionsWrapper]), 
	        __metadata('design:returntype', void 0)
	    ], LoggerFactory.prototype, "agWire", null);
	    LoggerFactory = __decorate([
	        context_1.Bean('loggerFactory'), 
	        __metadata('design:paramtypes', [])
	    ], LoggerFactory);
	    return LoggerFactory;
	})();
	exports.LoggerFactory = LoggerFactory;
	var Logger = (function () {
	    function Logger(name, logging) {
	        this.name = name;
	        this.logging = logging;
	    }
	    Logger.prototype.log = function (message) {
	        if (this.logging) {
	            console.log('ag-Grid.' + this.name + ': ' + message);
	        }
	    };
	    return Logger;
	})();
	exports.Logger = Logger;


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
	 * @version v4.0.3
	 * @link http://www.ag-grid.com/
	 * @license MIT
	 */
	var utils_1 = __webpack_require__(7);
	var logger_1 = __webpack_require__(5);
	var Context = (function () {
	    function Context(params) {
	        this.beans = {};
	        this.destroyed = false;
	        if (!params || !params.beans) {
	            return;
	        }
	        this.contextParams = params;
	        this.logger = new logger_1.Logger('Context', this.contextParams.debug);
	        this.logger.log('>> creating ag-Application Context');
	        this.createBeans();
	        var beans = utils_1.Utils.mapObject(this.beans, function (beanEntry) { return beanEntry.beanInstance; });
	        this.wireBeans(beans);
	        this.logger.log('>> ag-Application Context ready - component is alive');
	    }
	    Context.prototype.wireBean = function (bean) {
	        this.wireBeans([bean]);
	    };
	    Context.prototype.wireBeans = function (beans) {
	        this.autoWireBeans(beans);
	        this.methodWireBeans(beans);
	        this.postWire(beans);
	        this.wireCompleteBeans(beans);
	    };
	    Context.prototype.createBeans = function () {
	        var _this = this;
	        // register all normal beans
	        this.contextParams.beans.forEach(this.createBeanEntry.bind(this));
	        // register override beans, these will overwrite beans above of same name
	        if (this.contextParams.overrideBeans) {
	            this.contextParams.overrideBeans.forEach(this.createBeanEntry.bind(this));
	        }
	        // instantiate all beans - overridden beans will be left out
	        utils_1.Utils.iterateObject(this.beans, function (key, beanEntry) {
	            var constructorParamsMeta;
	            if (beanEntry.bean.prototype.__agBeanMetaData
	                && beanEntry.bean.prototype.__agBeanMetaData.agConstructor) {
	                constructorParamsMeta = beanEntry.bean.prototype.__agBeanMetaData.agConstructor;
	            }
	            var constructorParams = _this.getBeansForParameters(constructorParamsMeta, beanEntry.beanName);
	            var newInstance = applyToConstructor(beanEntry.bean, constructorParams);
	            beanEntry.beanInstance = newInstance;
	            _this.logger.log('bean ' + _this.getBeanName(newInstance) + ' created');
	        });
	    };
	    Context.prototype.createBeanEntry = function (Bean) {
	        var metaData = Bean.prototype.__agBeanMetaData;
	        if (!metaData) {
	            var beanName;
	            if (Bean.prototype.constructor) {
	                beanName = Bean.prototype.constructor.name;
	            }
	            else {
	                beanName = '' + Bean;
	            }
	            console.error('context item ' + beanName + ' is not a bean');
	            return;
	        }
	        var beanEntry = {
	            bean: Bean,
	            beanInstance: null,
	            beanName: metaData.beanName
	        };
	        this.beans[metaData.beanName] = beanEntry;
	    };
	    Context.prototype.autoWireBeans = function (beans) {
	        var _this = this;
	        beans.forEach(function (bean) { return _this.autoWireBean(bean); });
	    };
	    Context.prototype.methodWireBeans = function (beans) {
	        var _this = this;
	        beans.forEach(function (bean) { return _this.methodWireBean(bean); });
	    };
	    Context.prototype.autoWireBean = function (bean) {
	        var _this = this;
	        if (!bean
	            || !bean.__agBeanMetaData
	            || !bean.__agBeanMetaData.agClassAttributes) {
	            return;
	        }
	        var attributes = bean.__agBeanMetaData.agClassAttributes;
	        if (!attributes) {
	            return;
	        }
	        var beanName = this.getBeanName(bean);
	        attributes.forEach(function (attribute) {
	            var otherBean = _this.lookupBeanInstance(beanName, attribute.beanName, attribute.optional);
	            bean[attribute.attributeName] = otherBean;
	        });
	    };
	    Context.prototype.getBeanName = function (bean) {
	        var constructorString = bean.constructor.toString();
	        var beanName = constructorString.substring(9, constructorString.indexOf('('));
	        return beanName;
	    };
	    Context.prototype.methodWireBean = function (bean) {
	        var beanName = this.getBeanName(bean);
	        // if no init method, skip he bean
	        if (!bean.agWire) {
	            return;
	        }
	        var wireParams;
	        if (bean.__agBeanMetaData
	            && bean.__agBeanMetaData.agWire) {
	            wireParams = bean.__agBeanMetaData.agWire;
	        }
	        var initParams = this.getBeansForParameters(wireParams, beanName);
	        bean.agWire.apply(bean, initParams);
	    };
	    Context.prototype.getBeansForParameters = function (parameters, beanName) {
	        var _this = this;
	        var beansList = [];
	        if (parameters) {
	            utils_1.Utils.iterateObject(parameters, function (paramIndex, otherBeanName) {
	                var otherBean = _this.lookupBeanInstance(beanName, otherBeanName);
	                beansList[Number(paramIndex)] = otherBean;
	            });
	        }
	        return beansList;
	    };
	    Context.prototype.lookupBeanInstance = function (wiringBean, beanName, optional) {
	        if (optional === void 0) { optional = false; }
	        if (beanName === 'context') {
	            return this;
	        }
	        else if (this.contextParams.seed && this.contextParams.seed.hasOwnProperty(beanName)) {
	            return this.contextParams.seed[beanName];
	        }
	        else {
	            var beanEntry = this.beans[beanName];
	            if (beanEntry) {
	                return beanEntry.beanInstance;
	            }
	            if (!optional) {
	                console.error('ag-Grid: unable to find bean reference ' + beanName + ' while initialising ' + wiringBean);
	            }
	            return null;
	        }
	    };
	    Context.prototype.postWire = function (beans) {
	        beans.forEach(function (bean) {
	            // try calling init methods
	            if (bean.__agBeanMetaData && bean.__agBeanMetaData.postConstructMethods) {
	                bean.__agBeanMetaData.postConstructMethods.forEach(function (methodName) { return bean[methodName](); });
	            }
	        });
	    };
	    Context.prototype.wireCompleteBeans = function (beans) {
	        beans.forEach(function (bean) {
	            if (bean.agApplicationBoot) {
	                bean.agApplicationBoot();
	            }
	        });
	    };
	    Context.prototype.destroy = function () {
	        var _this = this;
	        // should only be able to destroy once
	        if (this.destroyed) {
	            return;
	        }
	        this.logger.log('>> Shutting down ag-Application Context');
	        utils_1.Utils.iterateObject(this.beans, function (key, beanEntry) {
	            if (beanEntry.beanInstance.agDestroy) {
	                if (_this.contextParams.debug) {
	                    console.log('ag-Grid: destroying ' + beanEntry.beanName);
	                }
	                beanEntry.beanInstance.agDestroy();
	            }
	            _this.logger.log('bean ' + _this.getBeanName(beanEntry.beanInstance) + ' destroyed');
	        });
	        this.destroyed = true;
	        this.logger.log('>> ag-Application Context shut down - component is dead');
	    };
	    return Context;
	})();
	exports.Context = Context;
	// taken from: http://stackoverflow.com/questions/3362471/how-can-i-call-a-javascript-constructor-using-call-or-apply
	// allows calling 'apply' on a constructor
	function applyToConstructor(constructor, argArray) {
	    var args = [null].concat(argArray);
	    var factoryFunction = constructor.bind.apply(constructor, args);
	    return new factoryFunction();
	}
	function PostConstruct(target, methodName, descriptor) {
	    // it's an attribute on the class
	    var props = getOrCreateProps(target);
	    if (!props.postConstructMethods) {
	        props.postConstructMethods = [];
	    }
	    props.postConstructMethods.push(methodName);
	}
	exports.PostConstruct = PostConstruct;
	function Bean(beanName) {
	    return function (classConstructor) {
	        var props = getOrCreateProps(classConstructor.prototype);
	        props.beanName = beanName;
	    };
	}
	exports.Bean = Bean;
	function Autowired(name) {
	    return autowiredFunc.bind(this, name, false);
	}
	exports.Autowired = Autowired;
	function Optional(name) {
	    return autowiredFunc.bind(this, name, true);
	}
	exports.Optional = Optional;
	function autowiredFunc(name, optional, classPrototype, methodOrAttributeName, index) {
	    if (name === null) {
	        console.error('ag-Grid: Autowired name should not be null');
	        return;
	    }
	    if (typeof index === 'number') {
	        console.error('ag-Grid: Autowired should be on an attribute');
	        return;
	    }
	    // it's an attribute on the class
	    var props = getOrCreateProps(classPrototype);
	    if (!props.agClassAttributes) {
	        props.agClassAttributes = [];
	    }
	    props.agClassAttributes.push({
	        attributeName: methodOrAttributeName,
	        beanName: name,
	        optional: optional
	    });
	}
	function Qualifier(name) {
	    return function (classPrototype, methodOrAttributeName, index) {
	        var props;
	        if (typeof index === 'number') {
	            // it's a parameter on a method
	            var methodName;
	            if (methodOrAttributeName) {
	                props = getOrCreateProps(classPrototype);
	                methodName = methodOrAttributeName;
	            }
	            else {
	                props = getOrCreateProps(classPrototype.prototype);
	                methodName = 'agConstructor';
	            }
	            if (!props[methodName]) {
	                props[methodName] = {};
	            }
	            props[methodName][index] = name;
	        }
	    };
	}
	exports.Qualifier = Qualifier;
	function getOrCreateProps(target) {
	    var props = target.__agBeanMetaData;
	    if (!props) {
	        props = {};
	        target.__agBeanMetaData = props;
	    }
	    return props;
	}


/***/ },
/* 7 */
/***/ function(module, exports) {

	/**
	 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
	 * @version v4.0.3
	 * @link http://www.ag-grid.com/
	 * @license MIT
	 */
	var FUNCTION_STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
	var FUNCTION_ARGUMENT_NAMES = /([^\s,]+)/g;
	var Utils = (function () {
	    function Utils() {
	    }
	    Utils.iterateObject = function (object, callback) {
	        var keys = Object.keys(object);
	        for (var i = 0; i < keys.length; i++) {
	            var key = keys[i];
	            var value = object[key];
	            callback(key, value);
	        }
	    };
	    Utils.cloneObject = function (object) {
	        var copy = {};
	        var keys = Object.keys(object);
	        for (var i = 0; i < keys.length; i++) {
	            var key = keys[i];
	            var value = object[key];
	            copy[key] = value;
	        }
	        return copy;
	    };
	    Utils.map = function (array, callback) {
	        var result = [];
	        for (var i = 0; i < array.length; i++) {
	            var item = array[i];
	            var mappedItem = callback(item);
	            result.push(mappedItem);
	        }
	        return result;
	    };
	    Utils.mapObject = function (object, callback) {
	        var result = [];
	        Utils.iterateObject(object, function (key, value) {
	            result.push(callback(value));
	        });
	        return result;
	    };
	    Utils.forEach = function (array, callback) {
	        if (!array) {
	            return;
	        }
	        for (var i = 0; i < array.length; i++) {
	            var value = array[i];
	            callback(value, i);
	        }
	    };
	    Utils.filter = function (array, callback) {
	        var result = [];
	        array.forEach(function (item) {
	            if (callback(item)) {
	                result.push(item);
	            }
	        });
	        return result;
	    };
	    Utils.assign = function (object, source) {
	        Utils.iterateObject(source, function (key, value) {
	            object[key] = value;
	        });
	    };
	    Utils.getFunctionParameters = function (func) {
	        var fnStr = func.toString().replace(FUNCTION_STRIP_COMMENTS, '');
	        var result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(FUNCTION_ARGUMENT_NAMES);
	        if (result === null) {
	            return [];
	        }
	        else {
	            return result;
	        }
	    };
	    Utils.find = function (collection, predicate, value) {
	        if (collection === null || collection === undefined) {
	            return null;
	        }
	        var firstMatchingItem;
	        for (var i = 0; i < collection.length; i++) {
	            var item = collection[i];
	            if (typeof predicate === 'string') {
	                if (item[predicate] === value) {
	                    firstMatchingItem = item;
	                    break;
	                }
	            }
	            else {
	                var callback = predicate;
	                if (callback(item)) {
	                    firstMatchingItem = item;
	                    break;
	                }
	            }
	        }
	        return firstMatchingItem;
	    };
	    Utils.toStrings = function (array) {
	        return this.map(array, function (item) {
	            if (item === undefined || item === null || !item.toString) {
	                return null;
	            }
	            else {
	                return item.toString();
	            }
	        });
	    };
	    Utils.iterateArray = function (array, callback) {
	        for (var index = 0; index < array.length; index++) {
	            var value = array[index];
	            callback(value, index);
	        }
	    };
	    //Returns true if it is a DOM node
	    //taken from: http://stackoverflow.com/questions/384286/javascript-isdom-how-do-you-check-if-a-javascript-object-is-a-dom-object
	    Utils.isNode = function (o) {
	        return (typeof Node === "function" ? o instanceof Node :
	            o && typeof o === "object" && typeof o.nodeType === "number" && typeof o.nodeName === "string");
	    };
	    //Returns true if it is a DOM element
	    //taken from: http://stackoverflow.com/questions/384286/javascript-isdom-how-do-you-check-if-a-javascript-object-is-a-dom-object
	    Utils.isElement = function (o) {
	        return (typeof HTMLElement === "function" ? o instanceof HTMLElement :
	            o && typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName === "string");
	    };
	    Utils.isNodeOrElement = function (o) {
	        return this.isNode(o) || this.isElement(o);
	    };
	    //adds all type of change listeners to an element, intended to be a text field
	    Utils.addChangeListener = function (element, listener) {
	        element.addEventListener("changed", listener);
	        element.addEventListener("paste", listener);
	        element.addEventListener("input", listener);
	        // IE doesn't fire changed for special keys (eg delete, backspace), so need to
	        // listen for this further ones
	        element.addEventListener("keydown", listener);
	        element.addEventListener("keyup", listener);
	    };
	    //if value is undefined, null or blank, returns null, otherwise returns the value
	    Utils.makeNull = function (value) {
	        if (value === null || value === undefined || value === "") {
	            return null;
	        }
	        else {
	            return value;
	        }
	    };
	    Utils.missing = function (value) {
	        return !this.exists(value);
	    };
	    Utils.missingOrEmpty = function (value) {
	        return this.missing(value) || value.length === 0;
	    };
	    Utils.exists = function (value) {
	        if (value === null || value === undefined || value === '') {
	            return false;
	        }
	        else {
	            return true;
	        }
	    };
	    Utils.existsAndNotEmpty = function (value) {
	        return this.exists(value) && value.length > 0;
	    };
	    Utils.removeAllChildren = function (node) {
	        if (node) {
	            while (node.hasChildNodes()) {
	                node.removeChild(node.lastChild);
	            }
	        }
	    };
	    Utils.removeElement = function (parent, cssSelector) {
	        this.removeFromParent(parent.querySelector(cssSelector));
	    };
	    Utils.removeFromParent = function (node) {
	        if (node && node.parentNode) {
	            node.parentNode.removeChild(node);
	        }
	    };
	    Utils.isVisible = function (element) {
	        return (element.offsetParent !== null);
	    };
	    /**
	     * loads the template and returns it as an element. makes up for no simple way in
	     * the dom api to load html directly, eg we cannot do this: document.createElement(template)
	     */
	    Utils.loadTemplate = function (template) {
	        var tempDiv = document.createElement("div");
	        tempDiv.innerHTML = template;
	        return tempDiv.firstChild;
	    };
	    Utils.addOrRemoveCssClass = function (element, className, addOrRemove) {
	        if (addOrRemove) {
	            this.addCssClass(element, className);
	        }
	        else {
	            this.removeCssClass(element, className);
	        }
	    };
	    Utils.callIfPresent = function (func) {
	        if (func) {
	            func();
	        }
	    };
	    Utils.addCssClass = function (element, className) {
	        var _this = this;
	        if (!className || className.length === 0) {
	            return;
	        }
	        if (className.indexOf(' ') >= 0) {
	            className.split(' ').forEach(function (value) { return _this.addCssClass(element, value); });
	            return;
	        }
	        if (element.classList) {
	            element.classList.add(className);
	        }
	        else {
	            if (element.className && element.className.length > 0) {
	                var cssClasses = element.className.split(' ');
	                if (cssClasses.indexOf(className) < 0) {
	                    cssClasses.push(className);
	                    element.className = cssClasses.join(' ');
	                }
	            }
	            else {
	                element.className = className;
	            }
	        }
	    };
	    Utils.offsetHeight = function (element) {
	        return element && element.clientHeight ? element.clientHeight : 0;
	    };
	    Utils.offsetWidth = function (element) {
	        return element && element.clientWidth ? element.clientWidth : 0;
	    };
	    Utils.removeCssClass = function (element, className) {
	        if (element.className && element.className.length > 0) {
	            var cssClasses = element.className.split(' ');
	            var index = cssClasses.indexOf(className);
	            if (index >= 0) {
	                cssClasses.splice(index, 1);
	                element.className = cssClasses.join(' ');
	            }
	        }
	    };
	    Utils.removeFromArray = function (array, object) {
	        if (array.indexOf(object) >= 0) {
	            array.splice(array.indexOf(object), 1);
	        }
	    };
	    Utils.defaultComparator = function (valueA, valueB) {
	        var valueAMissing = valueA === null || valueA === undefined;
	        var valueBMissing = valueB === null || valueB === undefined;
	        if (valueAMissing && valueBMissing) {
	            return 0;
	        }
	        if (valueAMissing) {
	            return -1;
	        }
	        if (valueBMissing) {
	            return 1;
	        }
	        if (valueA < valueB) {
	            return -1;
	        }
	        else if (valueA > valueB) {
	            return 1;
	        }
	        else {
	            return 0;
	        }
	    };
	    Utils.formatWidth = function (width) {
	        if (typeof width === "number") {
	            return width + "px";
	        }
	        else {
	            return width;
	        }
	    };
	    Utils.formatNumberTwoDecimalPlacesAndCommas = function (value) {
	        // took this from: http://blog.tompawlak.org/number-currency-formatting-javascript
	        if (typeof value === 'number') {
	            return (Math.round(value * 100) / 100).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
	        }
	        else {
	            return '';
	        }
	    };
	    /**
	     * Tries to use the provided renderer.
	     */
	    Utils.useRenderer = function (eParent, eRenderer, params) {
	        var resultFromRenderer = eRenderer(params);
	        //TypeScript type inference magic
	        if (typeof resultFromRenderer === 'string') {
	            var eTextSpan = document.createElement('span');
	            eTextSpan.innerHTML = resultFromRenderer;
	            eParent.appendChild(eTextSpan);
	        }
	        else if (this.isNodeOrElement(resultFromRenderer)) {
	            //a dom node or element was returned, so add child
	            eParent.appendChild(resultFromRenderer);
	        }
	        else {
	            if (this.exists(resultFromRenderer)) {
	                console.warn('ag-Grid: result from render should be either a string or a DOM object, got ' + typeof resultFromRenderer);
	            }
	        }
	    };
	    /**
	     * If icon provided, use this (either a string, or a function callback).
	     * if not, then use the second parameter, which is the svgFactory function
	     */
	    Utils.createIcon = function (iconName, gridOptionsWrapper, column, svgFactoryFunc) {
	        var eResult = document.createElement('span');
	        eResult.appendChild(this.createIconNoSpan(iconName, gridOptionsWrapper, column, svgFactoryFunc));
	        return eResult;
	    };
	    Utils.createIconNoSpan = function (iconName, gridOptionsWrapper, colDefWrapper, svgFactoryFunc) {
	        var userProvidedIcon;
	        // check col for icon first
	        if (colDefWrapper && colDefWrapper.getColDef().icons) {
	            userProvidedIcon = colDefWrapper.getColDef().icons[iconName];
	        }
	        // it not in col, try grid options
	        if (!userProvidedIcon && gridOptionsWrapper.getIcons()) {
	            userProvidedIcon = gridOptionsWrapper.getIcons()[iconName];
	        }
	        // now if user provided, use it
	        if (userProvidedIcon) {
	            var rendererResult;
	            if (typeof userProvidedIcon === 'function') {
	                rendererResult = userProvidedIcon();
	            }
	            else if (typeof userProvidedIcon === 'string') {
	                rendererResult = userProvidedIcon;
	            }
	            else {
	                throw 'icon from grid options needs to be a string or a function';
	            }
	            if (typeof rendererResult === 'string') {
	                return this.loadTemplate(rendererResult);
	            }
	            else if (this.isNodeOrElement(rendererResult)) {
	                return rendererResult;
	            }
	            else {
	                throw 'iconRenderer should return back a string or a dom object';
	            }
	        }
	        else {
	            // otherwise we use the built in icon
	            return svgFactoryFunc();
	        }
	    };
	    Utils.addStylesToElement = function (eElement, styles) {
	        if (!styles) {
	            return;
	        }
	        Object.keys(styles).forEach(function (key) {
	            eElement.style[key] = styles[key];
	        });
	    };
	    Utils.getScrollbarWidth = function () {
	        var outer = document.createElement("div");
	        outer.style.visibility = "hidden";
	        outer.style.width = "100px";
	        outer.style.msOverflowStyle = "scrollbar"; // needed for WinJS apps
	        document.body.appendChild(outer);
	        var widthNoScroll = outer.offsetWidth;
	        // force scrollbars
	        outer.style.overflow = "scroll";
	        // add innerdiv
	        var inner = document.createElement("div");
	        inner.style.width = "100%";
	        outer.appendChild(inner);
	        var widthWithScroll = inner.offsetWidth;
	        // remove divs
	        outer.parentNode.removeChild(outer);
	        return widthNoScroll - widthWithScroll;
	    };
	    Utils.isKeyPressed = function (event, keyToCheck) {
	        var pressedKey = event.which || event.keyCode;
	        return pressedKey === keyToCheck;
	    };
	    Utils.setVisible = function (element, visible, visibleStyle) {
	        if (visible) {
	            if (this.exists(visibleStyle)) {
	                element.style.display = visibleStyle;
	            }
	            else {
	                element.style.display = 'inline';
	            }
	        }
	        else {
	            element.style.display = 'none';
	        }
	    };
	    Utils.isBrowserIE = function () {
	        if (this.isIE === undefined) {
	            this.isIE = false || !!document.documentMode; // At least IE6
	        }
	        return this.isIE;
	    };
	    Utils.isBrowserSafari = function () {
	        if (this.isSafari === undefined) {
	            this.isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
	        }
	        return this.isSafari;
	    };
	    // taken from: http://stackoverflow.com/questions/1038727/how-to-get-browser-width-using-javascript-code
	    Utils.getBodyWidth = function () {
	        if (document.body) {
	            return document.body.clientWidth;
	        }
	        if (window.innerHeight) {
	            return window.innerWidth;
	        }
	        if (document.documentElement && document.documentElement.clientWidth) {
	            return document.documentElement.clientWidth;
	        }
	        return -1;
	    };
	    // taken from: http://stackoverflow.com/questions/1038727/how-to-get-browser-width-using-javascript-code
	    Utils.getBodyHeight = function () {
	        if (document.body) {
	            return document.body.clientHeight;
	        }
	        if (window.innerHeight) {
	            return window.innerHeight;
	        }
	        if (document.documentElement && document.documentElement.clientHeight) {
	            return document.documentElement.clientHeight;
	        }
	        return -1;
	    };
	    Utils.setCheckboxState = function (eCheckbox, state) {
	        if (typeof state === 'boolean') {
	            eCheckbox.checked = state;
	            eCheckbox.indeterminate = false;
	        }
	        else {
	            // isNodeSelected returns back undefined if it's a group and the children
	            // are a mix of selected and unselected
	            eCheckbox.indeterminate = true;
	        }
	    };
	    Utils.traverseNodesWithKey = function (nodes, callback) {
	        var keyParts = [];
	        recursiveSearchNodes(nodes);
	        function recursiveSearchNodes(nodes) {
	            nodes.forEach(function (node) {
	                if (node.group) {
	                    keyParts.push(node.key);
	                    var key = keyParts.join('|');
	                    callback(node, key);
	                    recursiveSearchNodes(node.children);
	                    keyParts.pop();
	                }
	            });
	        }
	    };
	    // Taken from here: https://github.com/facebook/fixed-data-table/blob/master/src/vendor_upstream/dom/normalizeWheel.js
	    /**
	     * Mouse wheel (and 2-finger trackpad) support on the web sucks.  It is
	     * complicated, thus this doc is long and (hopefully) detailed enough to answer
	     * your questions.
	     *
	     * If you need to react to the mouse wheel in a predictable way, this code is
	     * like your bestest friend. * hugs *
	     *
	     * As of today, there are 4 DOM event types you can listen to:
	     *
	     *   'wheel'                -- Chrome(31+), FF(17+), IE(9+)
	     *   'mousewheel'           -- Chrome, IE(6+), Opera, Safari
	     *   'MozMousePixelScroll'  -- FF(3.5 only!) (2010-2013) -- don't bother!
	     *   'DOMMouseScroll'       -- FF(0.9.7+) since 2003
	     *
	     * So what to do?  The is the best:
	     *
	     *   normalizeWheel.getEventType();
	     *
	     * In your event callback, use this code to get sane interpretation of the
	     * deltas.  This code will return an object with properties:
	     *
	     *   spinX   -- normalized spin speed (use for zoom) - x plane
	     *   spinY   -- " - y plane
	     *   pixelX  -- normalized distance (to pixels) - x plane
	     *   pixelY  -- " - y plane
	     *
	     * Wheel values are provided by the browser assuming you are using the wheel to
	     * scroll a web page by a number of lines or pixels (or pages).  Values can vary
	     * significantly on different platforms and browsers, forgetting that you can
	     * scroll at different speeds.  Some devices (like trackpads) emit more events
	     * at smaller increments with fine granularity, and some emit massive jumps with
	     * linear speed or acceleration.
	     *
	     * This code does its best to normalize the deltas for you:
	     *
	     *   - spin is trying to normalize how far the wheel was spun (or trackpad
	     *     dragged).  This is super useful for zoom support where you want to
	     *     throw away the chunky scroll steps on the PC and make those equal to
	     *     the slow and smooth tiny steps on the Mac. Key data: This code tries to
	     *     resolve a single slow step on a wheel to 1.
	     *
	     *   - pixel is normalizing the desired scroll delta in pixel units.  You'll
	     *     get the crazy differences between browsers, but at least it'll be in
	     *     pixels!
	     *
	     *   - positive value indicates scrolling DOWN/RIGHT, negative UP/LEFT.  This
	     *     should translate to positive value zooming IN, negative zooming OUT.
	     *     This matches the newer 'wheel' event.
	     *
	     * Why are there spinX, spinY (or pixels)?
	     *
	     *   - spinX is a 2-finger side drag on the trackpad, and a shift + wheel turn
	     *     with a mouse.  It results in side-scrolling in the browser by default.
	     *
	     *   - spinY is what you expect -- it's the classic axis of a mouse wheel.
	     *
	     *   - I dropped spinZ/pixelZ.  It is supported by the DOM 3 'wheel' event and
	     *     probably is by browsers in conjunction with fancy 3D controllers .. but
	     *     you know.
	     *
	     * Implementation info:
	     *
	     * Examples of 'wheel' event if you scroll slowly (down) by one step with an
	     * average mouse:
	     *
	     *   OS X + Chrome  (mouse)     -    4   pixel delta  (wheelDelta -120)
	     *   OS X + Safari  (mouse)     -  N/A   pixel delta  (wheelDelta  -12)
	     *   OS X + Firefox (mouse)     -    0.1 line  delta  (wheelDelta  N/A)
	     *   Win8 + Chrome  (mouse)     -  100   pixel delta  (wheelDelta -120)
	     *   Win8 + Firefox (mouse)     -    3   line  delta  (wheelDelta -120)
	     *
	     * On the trackpad:
	     *
	     *   OS X + Chrome  (trackpad)  -    2   pixel delta  (wheelDelta   -6)
	     *   OS X + Firefox (trackpad)  -    1   pixel delta  (wheelDelta  N/A)
	     *
	     * On other/older browsers.. it's more complicated as there can be multiple and
	     * also missing delta values.
	     *
	     * The 'wheel' event is more standard:
	     *
	     * http://www.w3.org/TR/DOM-Level-3-Events/#events-wheelevents
	     *
	     * The basics is that it includes a unit, deltaMode (pixels, lines, pages), and
	     * deltaX, deltaY and deltaZ.  Some browsers provide other values to maintain
	     * backward compatibility with older events.  Those other values help us
	     * better normalize spin speed.  Example of what the browsers provide:
	     *
	     *                          | event.wheelDelta | event.detail
	     *        ------------------+------------------+--------------
	     *          Safari v5/OS X  |       -120       |       0
	     *          Safari v5/Win7  |       -120       |       0
	     *         Chrome v17/OS X  |       -120       |       0
	     *         Chrome v17/Win7  |       -120       |       0
	     *                IE9/Win7  |       -120       |   undefined
	     *         Firefox v4/OS X  |     undefined    |       1
	     *         Firefox v4/Win7  |     undefined    |       3
	     *
	     */
	    Utils.normalizeWheel = function (event) {
	        var PIXEL_STEP = 10;
	        var LINE_HEIGHT = 40;
	        var PAGE_HEIGHT = 800;
	        // spinX, spinY
	        var sX = 0;
	        var sY = 0;
	        // pixelX, pixelY
	        var pX = 0;
	        var pY = 0;
	        // Legacy
	        if ('detail' in event) {
	            sY = event.detail;
	        }
	        if ('wheelDelta' in event) {
	            sY = -event.wheelDelta / 120;
	        }
	        if ('wheelDeltaY' in event) {
	            sY = -event.wheelDeltaY / 120;
	        }
	        if ('wheelDeltaX' in event) {
	            sX = -event.wheelDeltaX / 120;
	        }
	        // side scrolling on FF with DOMMouseScroll
	        if ('axis' in event && event.axis === event.HORIZONTAL_AXIS) {
	            sX = sY;
	            sY = 0;
	        }
	        pX = sX * PIXEL_STEP;
	        pY = sY * PIXEL_STEP;
	        if ('deltaY' in event) {
	            pY = event.deltaY;
	        }
	        if ('deltaX' in event) {
	            pX = event.deltaX;
	        }
	        if ((pX || pY) && event.deltaMode) {
	            if (event.deltaMode == 1) {
	                pX *= LINE_HEIGHT;
	                pY *= LINE_HEIGHT;
	            }
	            else {
	                pX *= PAGE_HEIGHT;
	                pY *= PAGE_HEIGHT;
	            }
	        }
	        // Fall-back if spin cannot be determined
	        if (pX && !sX) {
	            sX = (pX < 1) ? -1 : 1;
	        }
	        if (pY && !sY) {
	            sY = (pY < 1) ? -1 : 1;
	        }
	        return { spinX: sX,
	            spinY: sY,
	            pixelX: pX,
	            pixelY: pY };
	    };
	    return Utils;
	})();
	exports.Utils = Utils;


/***/ },
/* 8 */
/***/ function(module, exports) {

	/**
	 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
	 * @version v4.0.3
	 * @link http://www.ag-grid.com/
	 * @license MIT
	 */
	var Constants = (function () {
	    function Constants() {
	    }
	    Constants.STEP_EVERYTHING = 0;
	    Constants.STEP_FILTER = 1;
	    Constants.STEP_AGGREGATE = 4;
	    Constants.STEP_SORT = 2;
	    Constants.STEP_MAP = 3;
	    Constants.ROW_BUFFER_SIZE = 2;
	    Constants.KEY_TAB = 9;
	    Constants.KEY_ENTER = 13;
	    Constants.KEY_BACKSPACE = 8;
	    Constants.KEY_DELETE = 46;
	    Constants.KEY_ESCAPE = 27;
	    Constants.KEY_SPACE = 32;
	    Constants.KEY_DOWN = 40;
	    Constants.KEY_UP = 38;
	    Constants.KEY_LEFT = 37;
	    Constants.KEY_RIGHT = 39;
	    Constants.KEY_A = 65;
	    Constants.KEY_C = 67;
	    Constants.KEY_V = 86;
	    Constants.ROW_MODEL_TYPE_PAGINATION = 'pagination';
	    Constants.ROW_MODEL_TYPE_VIRTUAL = 'virtual';
	    Constants.ALWAYS = 'always';
	    Constants.ONLY_WHEN_GROUPING = 'onlyWhenGrouping';
	    Constants.FLOATING_TOP = 'top';
	    Constants.FLOATING_BOTTOM = 'bottom';
	    return Constants;
	})();
	exports.Constants = Constants;


/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
	 * @version v4.0.3
	 * @link http://www.ag-grid.com/
	 * @license MIT
	 */
	var events_1 = __webpack_require__(10);
	var utils_1 = __webpack_require__(7);
	var ComponentUtil = (function () {
	    function ComponentUtil() {
	    }
	    ComponentUtil.getEventCallbacks = function () {
	        if (!ComponentUtil.EVENT_CALLBACKS) {
	            ComponentUtil.EVENT_CALLBACKS = [];
	            ComponentUtil.EVENTS.forEach(function (eventName) {
	                ComponentUtil.EVENT_CALLBACKS.push(ComponentUtil.getCallbackForEvent(eventName));
	            });
	        }
	        return ComponentUtil.EVENT_CALLBACKS;
	    };
	    ComponentUtil.copyAttributesToGridOptions = function (gridOptions, component) {
	        checkForDeprecated(component);
	        // create empty grid options if none were passed
	        if (typeof gridOptions !== 'object') {
	            gridOptions = {};
	        }
	        // to allow array style lookup in TypeScript, take type away from 'this' and 'gridOptions'
	        var pGridOptions = gridOptions;
	        // add in all the simple properties
	        ComponentUtil.ARRAY_PROPERTIES
	            .concat(ComponentUtil.STRING_PROPERTIES)
	            .concat(ComponentUtil.OBJECT_PROPERTIES)
	            .concat(ComponentUtil.FUNCTION_PROPERTIES)
	            .forEach(function (key) {
	            if (typeof (component)[key] !== 'undefined') {
	                pGridOptions[key] = component[key];
	            }
	        });
	        ComponentUtil.BOOLEAN_PROPERTIES.forEach(function (key) {
	            if (typeof (component)[key] !== 'undefined') {
	                pGridOptions[key] = ComponentUtil.toBoolean(component[key]);
	            }
	        });
	        ComponentUtil.NUMBER_PROPERTIES.forEach(function (key) {
	            if (typeof (component)[key] !== 'undefined') {
	                pGridOptions[key] = ComponentUtil.toNumber(component[key]);
	            }
	        });
	        ComponentUtil.getEventCallbacks().forEach(function (funcName) {
	            if (typeof (component)[funcName] !== 'undefined') {
	                pGridOptions[funcName] = component[funcName];
	            }
	        });
	        return gridOptions;
	    };
	    ComponentUtil.getCallbackForEvent = function (eventName) {
	        if (!eventName || eventName.length < 2) {
	            return eventName;
	        }
	        else {
	            return 'on' + eventName[0].toUpperCase() + eventName.substr(1);
	        }
	    };
	    // change this method, the caller should know if it's initialised or not, plus 'initialised'
	    // is not relevant for all component types.
	    // maybe pass in the api and columnApi instead???
	    ComponentUtil.processOnChange = function (changes, gridOptions, api) {
	        //if (!component._initialised || !changes) { return; }
	        if (!changes) {
	            return;
	        }
	        checkForDeprecated(changes);
	        // to allow array style lookup in TypeScript, take type away from 'this' and 'gridOptions'
	        var pGridOptions = gridOptions;
	        // check if any change for the simple types, and if so, then just copy in the new value
	        ComponentUtil.ARRAY_PROPERTIES
	            .concat(ComponentUtil.OBJECT_PROPERTIES)
	            .concat(ComponentUtil.STRING_PROPERTIES)
	            .forEach(function (key) {
	            if (changes[key]) {
	                pGridOptions[key] = changes[key].currentValue;
	            }
	        });
	        ComponentUtil.BOOLEAN_PROPERTIES.forEach(function (key) {
	            if (changes[key]) {
	                pGridOptions[key] = ComponentUtil.toBoolean(changes[key].currentValue);
	            }
	        });
	        ComponentUtil.NUMBER_PROPERTIES.forEach(function (key) {
	            if (changes[key]) {
	                pGridOptions[key] = ComponentUtil.toNumber(changes[key].currentValue);
	            }
	        });
	        ComponentUtil.getEventCallbacks().forEach(function (funcName) {
	            if (changes[funcName]) {
	                pGridOptions[funcName] = changes[funcName].currentValue;
	            }
	        });
	        if (changes.showToolPanel) {
	            api.showToolPanel(changes.showToolPanel.currentValue);
	        }
	        if (changes.quickFilterText) {
	            api.setQuickFilter(changes.quickFilterText.currentValue);
	        }
	        if (changes.rowData) {
	            api.setRowData(changes.rowData.currentValue);
	        }
	        if (changes.floatingTopRowData) {
	            api.setFloatingTopRowData(changes.floatingTopRowData.currentValue);
	        }
	        if (changes.floatingBottomRowData) {
	            api.setFloatingBottomRowData(changes.floatingBottomRowData.currentValue);
	        }
	        if (changes.columnDefs) {
	            api.setColumnDefs(changes.columnDefs.currentValue);
	        }
	        if (changes.datasource) {
	            api.setDatasource(changes.datasource.currentValue);
	        }
	        if (changes.headerHeight) {
	            api.setHeaderHeight(changes.headerHeight.currentValue);
	        }
	    };
	    ComponentUtil.toBoolean = function (value) {
	        if (typeof value === 'boolean') {
	            return value;
	        }
	        else if (typeof value === 'string') {
	            // for boolean, compare to empty String to allow attributes appearing with
	            // not value to be treated as 'true'
	            return value.toUpperCase() === 'TRUE' || value == '';
	        }
	        else {
	            return false;
	        }
	    };
	    ComponentUtil.toNumber = function (value) {
	        if (typeof value === 'number') {
	            return value;
	        }
	        else if (typeof value === 'string') {
	            return Number(value);
	        }
	        else {
	            return undefined;
	        }
	    };
	    // all the events are populated in here AFTER this class (at the bottom of the file).
	    ComponentUtil.EVENTS = [];
	    ComponentUtil.STRING_PROPERTIES = [
	        'sortingOrder', 'rowClass', 'rowSelection', 'overlayLoadingTemplate',
	        'overlayNoRowsTemplate', 'headerCellTemplate', 'quickFilterText', 'rowModelType'];
	    ComponentUtil.OBJECT_PROPERTIES = [
	        'rowStyle', 'context', 'groupColumnDef', 'localeText', 'icons', 'datasource'
	    ];
	    ComponentUtil.ARRAY_PROPERTIES = [
	        'slaveGrids', 'rowData', 'floatingTopRowData', 'floatingBottomRowData', 'columnDefs'
	    ];
	    ComponentUtil.NUMBER_PROPERTIES = [
	        'rowHeight', 'rowBuffer', 'colWidth', 'headerHeight', 'groupDefaultExpanded',
	        'minColWidth', 'maxColWidth'
	    ];
	    ComponentUtil.BOOLEAN_PROPERTIES = [
	        'toolPanelSuppressGroups', 'toolPanelSuppressValues',
	        'suppressRowClickSelection', 'suppressCellSelection', 'suppressHorizontalScroll', 'debug',
	        'enableColResize', 'enableCellExpressions', 'enableSorting', 'enableServerSideSorting',
	        'enableFilter', 'enableServerSideFilter', 'angularCompileRows', 'angularCompileFilters',
	        'angularCompileHeaders', 'groupSuppressAutoColumn', 'groupSelectsChildren', 'groupHideGroupColumns',
	        'groupIncludeFooter', 'groupUseEntireRow', 'groupSuppressRow', 'groupSuppressBlankHeader', 'forPrint',
	        'suppressMenuHide', 'rowDeselection', 'unSortIcon', 'suppressMultiSort', 'suppressScrollLag',
	        'singleClickEdit', 'suppressLoadingOverlay', 'suppressNoRowsOverlay', 'suppressAutoSize',
	        'suppressParentsInRowNodes', 'showToolPanel', 'suppressColumnMoveAnimation', 'suppressMovableColumns',
	        'suppressFieldDotNotation', 'enableRangeSelection', 'suppressEnterprise', 'rowGroupPanelShow',
	        'suppressContextMenu', 'suppressMenuFilterPanel', 'suppressMenuMainPanel', 'suppressMenuColumnPanel',
	        'enableStatusBar', 'rememberGroupStateWhenNewData'
	    ];
	    ComponentUtil.FUNCTION_PROPERTIES = ['headerCellRenderer', 'localeTextFunc', 'groupRowInnerRenderer',
	        'groupRowRenderer', 'groupAggFunction', 'isScrollLag', 'isExternalFilterPresent', 'getRowHeight',
	        'doesExternalFilterPass', 'getRowClass', 'getRowStyle', 'getHeaderCellTemplate', 'traverseNode',
	        'getContextMenuItems', 'getMainMenuItems', 'processRowPostCreate', 'processCellForClipboard'];
	    ComponentUtil.ALL_PROPERTIES = ComponentUtil.ARRAY_PROPERTIES
	        .concat(ComponentUtil.OBJECT_PROPERTIES)
	        .concat(ComponentUtil.STRING_PROPERTIES)
	        .concat(ComponentUtil.NUMBER_PROPERTIES)
	        .concat(ComponentUtil.FUNCTION_PROPERTIES)
	        .concat(ComponentUtil.BOOLEAN_PROPERTIES);
	    return ComponentUtil;
	})();
	exports.ComponentUtil = ComponentUtil;
	utils_1.Utils.iterateObject(events_1.Events, function (key, value) {
	    ComponentUtil.EVENTS.push(value);
	});
	function checkForDeprecated(changes) {
	    if (changes.ready || changes.onReady) {
	        console.warn('ag-grid: as of v3.3 ready event is now called gridReady, so the callback should be onGridReady');
	    }
	    if (changes.rowDeselected || changes.onRowDeselected) {
	        console.warn('ag-grid: as of v3.4 rowDeselected no longer exists. Please check the docs.');
	    }
	}


/***/ },
/* 10 */
/***/ function(module, exports) {

	/**
	 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
	 * @version v4.0.3
	 * @link http://www.ag-grid.com/
	 * @license MIT
	 */
	var Events = (function () {
	    function Events() {
	    }
	    /** A new set of columns has been entered, everything has potentially changed. */
	    Events.EVENT_COLUMN_EVERYTHING_CHANGED = 'columnEverythingChanged';
	    Events.EVENT_NEW_COLUMNS_LOADED = 'newColumnsLoaded';
	    /** A row group column was added, removed or order changed. */
	    Events.EVENT_COLUMN_ROW_GROUP_CHANGE = 'columnRowGroupChanged';
	    /** A value column was added, removed or agg function was changed. */
	    Events.EVENT_COLUMN_VALUE_CHANGE = 'columnValueChanged';
	    /** A column was moved */
	    Events.EVENT_COLUMN_MOVED = 'columnMoved';
	    /** One or more columns was shown / hidden */
	    Events.EVENT_COLUMN_VISIBLE = 'columnVisible';
	    /** One or more columns was pinned / unpinned*/
	    Events.EVENT_COLUMN_PINNED = 'columnPinned';
	    /** A column group was opened / closed */
	    Events.EVENT_COLUMN_GROUP_OPENED = 'columnGroupOpened';
	    /** One or more columns was resized. If just one, the column in the event is set. */
	    Events.EVENT_COLUMN_RESIZED = 'columnResized';
	    /** A row group was opened / closed */
	    Events.EVENT_ROW_GROUP_OPENED = 'rowGroupOpened';
	    Events.EVENT_ROW_DATA_CHANGED = 'rowDataChanged';
	    Events.EVENT_FLOATING_ROW_DATA_CHANGED = 'floatingRowDataChanged';
	    Events.EVENT_RANGE_SELECTION_CHANGED = 'rangeSelectionChanged';
	    Events.EVENT_FLASH_CELLS = 'clipboardPaste';
	    Events.EVENT_HEADER_HEIGHT_CHANGED = 'headerHeightChanged';
	    Events.EVENT_MODEL_UPDATED = 'modelUpdated';
	    Events.EVENT_CELL_CLICKED = 'cellClicked';
	    Events.EVENT_CELL_DOUBLE_CLICKED = 'cellDoubleClicked';
	    Events.EVENT_CELL_CONTEXT_MENU = 'cellContextMenu';
	    Events.EVENT_CELL_VALUE_CHANGED = 'cellValueChanged';
	    Events.EVENT_CELL_FOCUSED = 'cellFocused';
	    Events.EVENT_ROW_SELECTED = 'rowSelected';
	    Events.EVENT_SELECTION_CHANGED = 'selectionChanged';
	    Events.EVENT_BEFORE_FILTER_CHANGED = 'beforeFilterChanged';
	    Events.EVENT_FILTER_CHANGED = 'filterChanged';
	    Events.EVENT_AFTER_FILTER_CHANGED = 'afterFilterChanged';
	    Events.EVENT_FILTER_MODIFIED = 'filterModified';
	    Events.EVENT_BEFORE_SORT_CHANGED = 'beforeSortChanged';
	    Events.EVENT_SORT_CHANGED = 'sortChanged';
	    Events.EVENT_AFTER_SORT_CHANGED = 'afterSortChanged';
	    Events.EVENT_VIRTUAL_ROW_REMOVED = 'virtualRowRemoved';
	    Events.EVENT_ROW_CLICKED = 'rowClicked';
	    Events.EVENT_ROW_DOUBLE_CLICKED = 'rowDoubleClicked';
	    Events.EVENT_GRID_READY = 'gridReady';
	    Events.EVENT_GRID_SIZE_CHANGED = 'gridSizeChanged';
	    return Events;
	})();
	exports.Events = Events;


/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
	 * @version v4.0.3
	 * @link http://www.ag-grid.com/
	 * @license MIT
	 */
	var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
	    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
	    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
	    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
	    return c > 3 && r && Object.defineProperty(target, key, r), r;
	};
	var __metadata = (this && this.__metadata) || function (k, v) {
	    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
	};
	var csvCreator_1 = __webpack_require__(12);
	var rowRenderer_1 = __webpack_require__(23);
	var headerRenderer_1 = __webpack_require__(54);
	var filterManager_1 = __webpack_require__(40);
	var columnController_1 = __webpack_require__(13);
	var selectionController_1 = __webpack_require__(29);
	var gridOptionsWrapper_1 = __webpack_require__(3);
	var gridPanel_1 = __webpack_require__(24);
	var valueService_1 = __webpack_require__(34);
	var masterSlaveService_1 = __webpack_require__(25);
	var eventService_1 = __webpack_require__(4);
	var floatingRowModel_1 = __webpack_require__(26);
	var constants_1 = __webpack_require__(8);
	var context_1 = __webpack_require__(6);
	var gridCore_1 = __webpack_require__(37);
	var context_2 = __webpack_require__(6);
	var context_3 = __webpack_require__(6);
	var sortController_1 = __webpack_require__(39);
	var paginationController_1 = __webpack_require__(38);
	var focusedCellController_1 = __webpack_require__(44);
	var context_4 = __webpack_require__(6);
	var GridApi = (function () {
	    function GridApi() {
	    }
	    /** Used internally by grid. Not intended to be used by the client. Interface may change between releases. */
	    GridApi.prototype.__getMasterSlaveService = function () {
	        return this.masterSlaveService;
	    };
	    GridApi.prototype.getFirstRenderedRow = function () {
	        return this.rowRenderer.getFirstVirtualRenderedRow();
	    };
	    GridApi.prototype.getLastRenderedRow = function () {
	        return this.rowRenderer.getLastVirtualRenderedRow();
	    };
	    GridApi.prototype.getDataAsCsv = function (params) {
	        return this.csvCreator.getDataAsCsv(params);
	    };
	    GridApi.prototype.exportDataAsCsv = function (params) {
	        this.csvCreator.exportDataAsCsv(params);
	    };
	    GridApi.prototype.setDatasource = function (datasource) {
	        if (this.gridOptionsWrapper.isRowModelPagination()) {
	            this.paginationController.setDatasource(datasource);
	        }
	        else if (this.gridOptionsWrapper.isRowModelVirtual()) {
	            this.rowModel.setDatasource(datasource);
	        }
	        else {
	            console.warn("ag-Grid: you can only use a datasource when gridOptions.rowModelType is '" + constants_1.Constants.ROW_MODEL_TYPE_VIRTUAL + "' or '" + constants_1.Constants.ROW_MODEL_TYPE_PAGINATION + "'");
	        }
	    };
	    GridApi.prototype.setRowData = function (rowData) {
	        this.rowModel.setRowData(rowData, true);
	    };
	    GridApi.prototype.setFloatingTopRowData = function (rows) {
	        this.floatingRowModel.setFloatingTopRowData(rows);
	    };
	    GridApi.prototype.setFloatingBottomRowData = function (rows) {
	        this.floatingRowModel.setFloatingBottomRowData(rows);
	    };
	    GridApi.prototype.setColumnDefs = function (colDefs) {
	        this.columnController.setColumnDefs(colDefs);
	    };
	    GridApi.prototype.refreshRows = function (rowNodes) {
	        this.rowRenderer.refreshRows(rowNodes);
	    };
	    GridApi.prototype.refreshCells = function (rowNodes, colIds) {
	        this.rowRenderer.refreshCells(rowNodes, colIds);
	    };
	    GridApi.prototype.rowDataChanged = function (rows) {
	        this.rowRenderer.rowDataChanged(rows);
	    };
	    GridApi.prototype.refreshView = function () {
	        this.rowRenderer.refreshView();
	    };
	    GridApi.prototype.softRefreshView = function () {
	        this.rowRenderer.softRefreshView();
	    };
	    GridApi.prototype.refreshGroupRows = function () {
	        this.rowRenderer.refreshGroupRows();
	    };
	    GridApi.prototype.refreshHeader = function () {
	        // need to review this - the refreshHeader should also refresh all icons in the header
	        this.headerRenderer.refreshHeader();
	    };
	    GridApi.prototype.isAnyFilterPresent = function () {
	        return this.filterManager.isAnyFilterPresent();
	    };
	    GridApi.prototype.isAdvancedFilterPresent = function () {
	        return this.filterManager.isAdvancedFilterPresent();
	    };
	    GridApi.prototype.isQuickFilterPresent = function () {
	        return this.filterManager.isQuickFilterPresent();
	    };
	    GridApi.prototype.getModel = function () {
	        return this.rowModel;
	    };
	    GridApi.prototype.onGroupExpandedOrCollapsed = function (refreshFromIndex) {
	        this.rowModel.refreshModel(constants_1.Constants.STEP_MAP, refreshFromIndex);
	    };
	    GridApi.prototype.expandAll = function () {
	        this.rowModel.expandOrCollapseAll(true);
	    };
	    GridApi.prototype.collapseAll = function () {
	        this.rowModel.expandOrCollapseAll(false);
	    };
	    GridApi.prototype.addVirtualRowListener = function (eventName, rowIndex, callback) {
	        if (typeof eventName !== 'string') {
	            console.log('ag-Grid: addVirtualRowListener is deprecated, please use addRenderedRowListener.');
	        }
	        this.addRenderedRowListener(eventName, rowIndex, callback);
	    };
	    GridApi.prototype.addRenderedRowListener = function (eventName, rowIndex, callback) {
	        if (eventName === 'virtualRowRemoved') {
	            console.log('ag-Grid: event virtualRowRemoved is deprecated, now called renderedRowRemoved');
	            eventName = '' +
	                '';
	        }
	        if (eventName === 'virtualRowSelected') {
	            console.log('ag-Grid: event virtualRowSelected is deprecated, to register for individual row ' +
	                'selection events, add a listener directly to the row node.');
	        }
	        this.rowRenderer.addRenderedRowListener(eventName, rowIndex, callback);
	    };
	    GridApi.prototype.setQuickFilter = function (newFilter) {
	        this.filterManager.setQuickFilter(newFilter);
	    };
	    GridApi.prototype.selectIndex = function (index, tryMulti, suppressEvents) {
	        console.log('ag-Grid: do not use api for selection, call node.setSelected(value) instead');
	        this.selectionController.selectIndex(index, tryMulti, suppressEvents);
	    };
	    GridApi.prototype.deselectIndex = function (index, suppressEvents) {
	        if (suppressEvents === void 0) { suppressEvents = false; }
	        console.log('ag-Grid: do not use api for selection, call node.setSelected(value) instead');
	        this.selectionController.deselectIndex(index, suppressEvents);
	    };
	    GridApi.prototype.selectNode = function (node, tryMulti, suppressEvents) {
	        if (tryMulti === void 0) { tryMulti = false; }
	        if (suppressEvents === void 0) { suppressEvents = false; }
	        console.log('ag-Grid: API for selection is deprecated, call node.setSelected(value) instead');
	        node.setSelected(true, !tryMulti, suppressEvents);
	    };
	    GridApi.prototype.deselectNode = function (node, suppressEvents) {
	        if (suppressEvents === void 0) { suppressEvents = false; }
	        console.log('ag-Grid: API for selection is deprecated, call node.setSelected(value) instead');
	        node.setSelected(false, false, suppressEvents);
	    };
	    GridApi.prototype.selectAll = function () {
	        this.selectionController.selectAllRowNodes();
	    };
	    GridApi.prototype.deselectAll = function () {
	        this.selectionController.deselectAllRowNodes();
	    };
	    GridApi.prototype.recomputeAggregates = function () {
	        this.rowModel.refreshModel(constants_1.Constants.STEP_AGGREGATE);
	    };
	    GridApi.prototype.sizeColumnsToFit = function () {
	        if (this.gridOptionsWrapper.isForPrint()) {
	            console.warn('ag-grid: sizeColumnsToFit does not work when forPrint=true');
	            return;
	        }
	        this.gridPanel.sizeColumnsToFit();
	    };
	    GridApi.prototype.showLoadingOverlay = function () {
	        this.gridPanel.showLoadingOverlay();
	    };
	    GridApi.prototype.showNoRowsOverlay = function () {
	        this.gridPanel.showNoRowsOverlay();
	    };
	    GridApi.prototype.hideOverlay = function () {
	        this.gridPanel.hideOverlay();
	    };
	    GridApi.prototype.isNodeSelected = function (node) {
	        console.log('ag-Grid: no need to call api.isNodeSelected(), just call node.isSelected() instead');
	        return node.isSelected();
	    };
	    GridApi.prototype.getSelectedNodesById = function () {
	        console.error('ag-Grid: since version 3.4, getSelectedNodesById no longer exists, use getSelectedNodes() instead');
	        return null;
	    };
	    GridApi.prototype.getSelectedNodes = function () {
	        return this.selectionController.getSelectedNodes();
	    };
	    GridApi.prototype.getSelectedRows = function () {
	        return this.selectionController.getSelectedRows();
	    };
	    GridApi.prototype.getBestCostNodeSelection = function () {
	        return this.selectionController.getBestCostNodeSelection();
	    };
	    GridApi.prototype.getRenderedNodes = function () {
	        return this.rowRenderer.getRenderedNodes();
	    };
	    GridApi.prototype.ensureColIndexVisible = function (index) {
	        console.warn('ag-Grid: ensureColIndexVisible(index) no longer supported, use ensureColumnVisible(colKey) instead.');
	    };
	    GridApi.prototype.ensureColumnVisible = function (key) {
	        this.gridPanel.ensureColumnVisible(key);
	    };
	    GridApi.prototype.ensureIndexVisible = function (index) {
	        this.gridPanel.ensureIndexVisible(index);
	    };
	    GridApi.prototype.ensureNodeVisible = function (comparator) {
	        this.gridCore.ensureNodeVisible(comparator);
	    };
	    GridApi.prototype.forEachNode = function (callback) {
	        this.rowModel.forEachNode(callback);
	    };
	    GridApi.prototype.forEachNodeAfterFilter = function (callback) {
	        this.rowModel.forEachNodeAfterFilter(callback);
	    };
	    GridApi.prototype.forEachNodeAfterFilterAndSort = function (callback) {
	        this.rowModel.forEachNodeAfterFilterAndSort(callback);
	    };
	    GridApi.prototype.getFilterApiForColDef = function (colDef) {
	        console.warn('ag-grid API method getFilterApiForColDef deprecated, use getFilterApi instead');
	        return this.getFilterApi(colDef);
	    };
	    GridApi.prototype.getFilterApi = function (key) {
	        var column = this.columnController.getColumn(key);
	        return this.filterManager.getFilterApi(column);
	    };
	    GridApi.prototype.getColumnDef = function (key) {
	        var column = this.columnController.getColumn(key);
	        if (column) {
	            return column.getColDef();
	        }
	        else {
	            return null;
	        }
	    };
	    GridApi.prototype.onFilterChanged = function () {
	        this.filterManager.onFilterChanged();
	    };
	    GridApi.prototype.setSortModel = function (sortModel) {
	        this.sortController.setSortModel(sortModel);
	    };
	    GridApi.prototype.getSortModel = function () {
	        return this.sortController.getSortModel();
	    };
	    GridApi.prototype.setFilterModel = function (model) {
	        this.filterManager.setFilterModel(model);
	    };
	    GridApi.prototype.getFilterModel = function () {
	        return this.filterManager.getFilterModel();
	    };
	    GridApi.prototype.getFocusedCell = function () {
	        return this.focusedCellController.getFocusedCell();
	    };
	    GridApi.prototype.setFocusedCell = function (rowIndex, colKey, floating) {
	        this.focusedCellController.setFocusedCell(rowIndex, colKey, floating);
	    };
	    GridApi.prototype.setHeaderHeight = function (headerHeight) {
	        this.gridOptionsWrapper.setHeaderHeight(headerHeight);
	    };
	    GridApi.prototype.showToolPanel = function (show) {
	        this.gridCore.showToolPanel(show);
	    };
	    GridApi.prototype.isToolPanelShowing = function () {
	        return this.gridCore.isToolPanelShowing();
	    };
	    GridApi.prototype.doLayout = function () {
	        this.gridCore.doLayout();
	    };
	    GridApi.prototype.getValue = function (colKey, rowNode) {
	        var column = this.columnController.getColumn(colKey);
	        return this.valueService.getValue(column, rowNode);
	    };
	    GridApi.prototype.addEventListener = function (eventType, listener) {
	        this.eventService.addEventListener(eventType, listener);
	    };
	    GridApi.prototype.addGlobalListener = function (listener) {
	        this.eventService.addGlobalListener(listener);
	    };
	    GridApi.prototype.removeEventListener = function (eventType, listener) {
	        this.eventService.removeEventListener(eventType, listener);
	    };
	    GridApi.prototype.removeGlobalListener = function (listener) {
	        this.eventService.removeGlobalListener(listener);
	    };
	    GridApi.prototype.dispatchEvent = function (eventType, event) {
	        this.eventService.dispatchEvent(eventType, event);
	    };
	    GridApi.prototype.destroy = function () {
	        this.context.destroy();
	    };
	    GridApi.prototype.resetQuickFilter = function () {
	        this.rowModel.forEachNode(function (node) { return node.quickFilterAggregateText = null; });
	    };
	    GridApi.prototype.getRangeSelections = function () {
	        if (this.rangeController) {
	            return this.rangeController.getCellRanges();
	        }
	        else {
	            console.warn('ag-Grid: cell range selection is only available in ag-Grid Enterprise');
	            return null;
	        }
	    };
	    GridApi.prototype.addRangeSelection = function (rangeSelection) {
	        if (!this.rangeController) {
	            console.warn('ag-Grid: cell range selection is only available in ag-Grid Enterprise');
	        }
	        this.rangeController.addRange(rangeSelection);
	    };
	    GridApi.prototype.clearRangeSelection = function () {
	        if (!this.rangeController) {
	            console.warn('ag-Grid: cell range selection is only available in ag-Grid Enterprise');
	        }
	        this.rangeController.clearSelection();
	    };
	    GridApi.prototype.copySelectedRowsToClipboard = function () {
	        this.clipboardService.copySelectedRowsToClipboard();
	    };
	    GridApi.prototype.copySelectedRangeToClipboard = function () {
	        this.clipboardService.copySelectedRangeToClipboard();
	    };
	    __decorate([
	        context_3.Autowired('csvCreator'), 
	        __metadata('design:type', csvCreator_1.CsvCreator)
	    ], GridApi.prototype, "csvCreator", void 0);
	    __decorate([
	        context_3.Autowired('gridCore'), 
	        __metadata('design:type', gridCore_1.GridCore)
	    ], GridApi.prototype, "gridCore", void 0);
	    __decorate([
	        context_3.Autowired('rowRenderer'), 
	        __metadata('design:type', rowRenderer_1.RowRenderer)
	    ], GridApi.prototype, "rowRenderer", void 0);
	    __decorate([
	        context_3.Autowired('headerRenderer'), 
	        __metadata('design:type', headerRenderer_1.HeaderRenderer)
	    ], GridApi.prototype, "headerRenderer", void 0);
	    __decorate([
	        context_3.Autowired('filterManager'), 
	        __metadata('design:type', filterManager_1.FilterManager)
	    ], GridApi.prototype, "filterManager", void 0);
	    __decorate([
	        context_3.Autowired('columnController'), 
	        __metadata('design:type', columnController_1.ColumnController)
	    ], GridApi.prototype, "columnController", void 0);
	    __decorate([
	        context_3.Autowired('selectionController'), 
	        __metadata('design:type', selectionController_1.SelectionController)
	    ], GridApi.prototype, "selectionController", void 0);
	    __decorate([
	        context_3.Autowired('gridOptionsWrapper'), 
	        __metadata('design:type', gridOptionsWrapper_1.GridOptionsWrapper)
	    ], GridApi.prototype, "gridOptionsWrapper", void 0);
	    __decorate([
	        context_3.Autowired('gridPanel'), 
	        __metadata('design:type', gridPanel_1.GridPanel)
	    ], GridApi.prototype, "gridPanel", void 0);
	    __decorate([
	        context_3.Autowired('valueService'), 
	        __metadata('design:type', valueService_1.ValueService)
	    ], GridApi.prototype, "valueService", void 0);
	    __decorate([
	        context_3.Autowired('masterSlaveService'), 
	        __metadata('design:type', masterSlaveService_1.MasterSlaveService)
	    ], GridApi.prototype, "masterSlaveService", void 0);
	    __decorate([
	        context_3.Autowired('eventService'), 
	        __metadata('design:type', eventService_1.EventService)
	    ], GridApi.prototype, "eventService", void 0);
	    __decorate([
	        context_3.Autowired('floatingRowModel'), 
	        __metadata('design:type', floatingRowModel_1.FloatingRowModel)
	    ], GridApi.prototype, "floatingRowModel", void 0);
	    __decorate([
	        context_3.Autowired('context'), 
	        __metadata('design:type', context_2.Context)
	    ], GridApi.prototype, "context", void 0);
	    __decorate([
	        context_3.Autowired('rowModel'), 
	        __metadata('design:type', Object)
	    ], GridApi.prototype, "rowModel", void 0);
	    __decorate([
	        context_3.Autowired('sortController'), 
	        __metadata('design:type', sortController_1.SortController)
	    ], GridApi.prototype, "sortController", void 0);
	    __decorate([
	        context_3.Autowired('paginationController'), 
	        __metadata('design:type', paginationController_1.PaginationController)
	    ], GridApi.prototype, "paginationController", void 0);
	    __decorate([
	        context_3.Autowired('focusedCellController'), 
	        __metadata('design:type', focusedCellController_1.FocusedCellController)
	    ], GridApi.prototype, "focusedCellController", void 0);
	    __decorate([
	        context_4.Optional('rangeController'), 
	        __metadata('design:type', Object)
	    ], GridApi.prototype, "rangeController", void 0);
	    __decorate([
	        context_4.Optional('clipboardService'), 
	        __metadata('design:type', Object)
	    ], GridApi.prototype, "clipboardService", void 0);
	    GridApi = __decorate([
	        context_1.Bean('gridApi'), 
	        __metadata('design:paramtypes', [])
	    ], GridApi);
	    return GridApi;
	})();
	exports.GridApi = GridApi;


/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
	 * @version v4.0.3
	 * @link http://www.ag-grid.com/
	 * @license MIT
	 */
	var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
	    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
	    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
	    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
	    return c > 3 && r && Object.defineProperty(target, key, r), r;
	};
	var __metadata = (this && this.__metadata) || function (k, v) {
	    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
	};
	var columnController_1 = __webpack_require__(13);
	var valueService_1 = __webpack_require__(34);
	var context_1 = __webpack_require__(6);
	var context_2 = __webpack_require__(6);
	var gridOptionsWrapper_1 = __webpack_require__(3);
	var LINE_SEPARATOR = '\r\n';
	var CsvCreator = (function () {
	    function CsvCreator() {
	    }
	    CsvCreator.prototype.exportDataAsCsv = function (params) {
	        var csvString = this.getDataAsCsv(params);
	        var fileNamePresent = params && params.fileName && params.fileName.length !== 0;
	        var fileName = fileNamePresent ? params.fileName : 'export.csv';
	        // for Excel, we need \ufeff at the start
	        // http://stackoverflow.com/questions/17879198/adding-utf-8-bom-to-string-blob
	        var blobObject = new Blob(["\ufeff", csvString], {
	            type: "text/csv;charset=utf-8;"
	        });
	        // Internet Explorer
	        if (window.navigator.msSaveOrOpenBlob) {
	            window.navigator.msSaveOrOpenBlob(blobObject, fileName);
	        }
	        else {
	            // Chrome
	            var downloadLink = document.createElement("a");
	            downloadLink.href = window.URL.createObjectURL(blobObject);
	            downloadLink.download = fileName;
	            document.body.appendChild(downloadLink);
	            downloadLink.click();
	            document.body.removeChild(downloadLink);
	        }
	    };
	    CsvCreator.prototype.getDataAsCsv = function (params) {
	        var _this = this;
	        if (this.gridOptionsWrapper.isRowModelVirtual()) {
	            console.log('ag-Grid: getDataAsCsv not available when doing virtual pagination');
	            return '';
	        }
	        var result = '';
	        var skipGroups = params && params.skipGroups;
	        var skipHeader = params && params.skipHeader;
	        var skipFooters = params && params.skipFooters;
	        var includeCustomHeader = params && params.customHeader;
	        var includeCustomFooter = params && params.customFooter;
	        var allColumns = params && params.allColumns;
	        var onlySelected = params && params.onlySelected;
	        var columnSeparator = (params && params.columnSeparator) || ',';
	        var processCellCallback = params.processCellCallback;
	        var columnsToExport;
	        if (allColumns) {
	            columnsToExport = this.columnController.getAllColumns();
	        }
	        else {
	            columnsToExport = this.columnController.getAllDisplayedColumns();
	        }
	        if (!columnsToExport || columnsToExport.length === 0) {
	            return '';
	        }
	        if (includeCustomHeader) {
	            result += params.customHeader;
	        }
	        // first pass, put in the header names of the cols
	        if (!skipHeader) {
	            columnsToExport.forEach(function (column, index) {
	                var nameForCol = _this.columnController.getDisplayNameForCol(column);
	                if (nameForCol === null || nameForCol === undefined) {
	                    nameForCol = '';
	                }
	                if (index != 0) {
	                    result += columnSeparator;
	                }
	                result += '"' + _this.escape(nameForCol) + '"';
	            });
	            result += LINE_SEPARATOR;
	        }
	        this.rowModel.forEachNodeAfterFilterAndSort(function (node) {
	            if (skipGroups && node.group) {
	                return;
	            }
	            if (skipFooters && node.footer) {
	                return;
	            }
	            if (onlySelected && !node.isSelected()) {
	                return;
	            }
	            columnsToExport.forEach(function (column, index) {
	                var valueForCell;
	                if (node.group && index === 0) {
	                    valueForCell = _this.createValueForGroupNode(node);
	                }
	                else {
	                    valueForCell = _this.valueService.getValue(column, node);
	                }
	                valueForCell = _this.processCell(node, column, valueForCell, processCellCallback);
	                if (valueForCell === null || valueForCell === undefined) {
	                    valueForCell = '';
	                }
	                if (index != 0) {
	                    result += columnSeparator;
	                }
	                result += '"' + _this.escape(valueForCell) + '"';
	            });
	            result += LINE_SEPARATOR;
	        });
	        if (includeCustomFooter) {
	            result += params.customFooter;
	        }
	        return result;
	    };
	    CsvCreator.prototype.processCell = function (rowNode, column, value, processCellCallback) {
	        if (processCellCallback) {
	            return processCellCallback({
	                column: column,
	                node: rowNode,
	                value: value,
	                api: this.gridOptionsWrapper.getApi(),
	                columnApi: this.gridOptionsWrapper.getColumnApi(),
	                context: this.gridOptionsWrapper.getContext()
	            });
	        }
	        else {
	            return value;
	        }
	    };
	    CsvCreator.prototype.createValueForGroupNode = function (node) {
	        var keys = [node.key];
	        while (node.parent) {
	            node = node.parent;
	            keys.push(node.key);
	        }
	        return keys.reverse().join(' -> ');
	    };
	    // replace each " with "" (ie two sets of double quotes is how to do double quotes in csv)
	    CsvCreator.prototype.escape = function (value) {
	        if (value === null || value === undefined) {
	            return '';
	        }
	        var stringValue;
	        if (typeof value === 'string') {
	            stringValue = value;
	        }
	        else if (typeof value.toString === 'function') {
	            stringValue = value.toString();
	        }
	        else {
	            console.warn('known value type during csv conversion');
	            stringValue = '';
	        }
	        return stringValue.replace(/"/g, "\"\"");
	    };
	    __decorate([
	        context_2.Autowired('rowModel'), 
	        __metadata('design:type', Object)
	    ], CsvCreator.prototype, "rowModel", void 0);
	    __decorate([
	        context_2.Autowired('columnController'), 
	        __metadata('design:type', columnController_1.ColumnController)
	    ], CsvCreator.prototype, "columnController", void 0);
	    __decorate([
	        context_2.Autowired('valueService'), 
	        __metadata('design:type', valueService_1.ValueService)
	    ], CsvCreator.prototype, "valueService", void 0);
	    __decorate([
	        context_2.Autowired('gridOptionsWrapper'), 
	        __metadata('design:type', gridOptionsWrapper_1.GridOptionsWrapper)
	    ], CsvCreator.prototype, "gridOptionsWrapper", void 0);
	    CsvCreator = __decorate([
	        context_1.Bean('csvCreator'), 
	        __metadata('design:paramtypes', [])
	    ], CsvCreator);
	    return CsvCreator;
	})();
	exports.CsvCreator = CsvCreator;


/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
	 * @version v4.0.3
	 * @link http://www.ag-grid.com/
	 * @license MIT
	 */
	var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
	    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
	    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
	    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
	    return c > 3 && r && Object.defineProperty(target, key, r), r;
	};
	var __metadata = (this && this.__metadata) || function (k, v) {
	    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
	};
	var __param = (this && this.__param) || function (paramIndex, decorator) {
	    return function (target, key) { decorator(target, key, paramIndex); }
	};
	var utils_1 = __webpack_require__(7);
	var columnGroup_1 = __webpack_require__(14);
	var column_1 = __webpack_require__(15);
	var gridOptionsWrapper_1 = __webpack_require__(3);
	var selectionRendererFactory_1 = __webpack_require__(18);
	var expressionService_1 = __webpack_require__(22);
	var balancedColumnTreeBuilder_1 = __webpack_require__(47);
	var displayedGroupCreator_1 = __webpack_require__(49);
	var autoWidthCalculator_1 = __webpack_require__(50);
	var eventService_1 = __webpack_require__(4);
	var columnUtils_1 = __webpack_require__(16);
	var logger_1 = __webpack_require__(5);
	var events_1 = __webpack_require__(10);
	var columnChangeEvent_1 = __webpack_require__(51);
	var originalColumnGroup_1 = __webpack_require__(17);
	var groupInstanceIdCreator_1 = __webpack_require__(52);
	var functions_1 = __webpack_require__(53);
	var context_1 = __webpack_require__(6);
	var context_2 = __webpack_require__(6);
	var context_3 = __webpack_require__(6);
	var gridPanel_1 = __webpack_require__(24);
	var context_4 = __webpack_require__(6);
	var context_5 = __webpack_require__(6);
	var ColumnApi = (function () {
	    function ColumnApi() {
	    }
	    ColumnApi.prototype.sizeColumnsToFit = function (gridWidth) { this._columnController.sizeColumnsToFit(gridWidth); };
	    ColumnApi.prototype.setColumnGroupOpened = function (group, newValue, instanceId) { this._columnController.setColumnGroupOpened(group, newValue, instanceId); };
	    ColumnApi.prototype.getColumnGroup = function (name, instanceId) { return this._columnController.getColumnGroup(name, instanceId); };
	    ColumnApi.prototype.getDisplayNameForCol = function (column) { return this._columnController.getDisplayNameForCol(column); };
	    ColumnApi.prototype.getColumn = function (key) { return this._columnController.getColumn(key); };
	    ColumnApi.prototype.setColumnState = function (columnState) { return this._columnController.setColumnState(columnState); };
	    ColumnApi.prototype.getColumnState = function () { return this._columnController.getColumnState(); };
	    ColumnApi.prototype.resetColumnState = function () { this._columnController.resetColumnState(); };
	    ColumnApi.prototype.isPinning = function () { return this._columnController.isPinningLeft() || this._columnController.isPinningRight(); };
	    ColumnApi.prototype.isPinningLeft = function () { return this._columnController.isPinningLeft(); };
	    ColumnApi.prototype.isPinningRight = function () { return this._columnController.isPinningRight(); };
	    ColumnApi.prototype.getDisplayedColAfter = function (col) { return this._columnController.getDisplayedColAfter(col); };
	    ColumnApi.prototype.getDisplayedColBefore = function (col) { return this._columnController.getDisplayedColBefore(col); };
	    ColumnApi.prototype.setColumnVisible = function (key, visible) { this._columnController.setColumnVisible(key, visible); };
	    ColumnApi.prototype.setColumnsVisible = function (keys, visible) { this._columnController.setColumnsVisible(keys, visible); };
	    ColumnApi.prototype.setColumnPinned = function (key, pinned) { this._columnController.setColumnPinned(key, pinned); };
	    ColumnApi.prototype.setColumnsPinned = function (keys, pinned) { this._columnController.setColumnsPinned(keys, pinned); };
	    ColumnApi.prototype.getAllColumns = function () { return this._columnController.getAllColumns(); };
	    ColumnApi.prototype.getDisplayedLeftColumns = function () { return this._columnController.getDisplayedLeftColumns(); };
	    ColumnApi.prototype.getDisplayedCenterColumns = function () { return this._columnController.getDisplayedCenterColumns(); };
	    ColumnApi.prototype.getDisplayedRightColumns = function () { return this._columnController.getDisplayedRightColumns(); };
	    ColumnApi.prototype.getAllDisplayedColumns = function () { return this._columnController.getAllDisplayedColumns(); };
	    ColumnApi.prototype.getRowGroupColumns = function () { return this._columnController.getRowGroupColumns(); };
	    ColumnApi.prototype.getValueColumns = function () { return this._columnController.getValueColumns(); };
	    ColumnApi.prototype.moveColumn = function (fromIndex, toIndex) { this._columnController.moveColumnByIndex(fromIndex, toIndex); };
	    ColumnApi.prototype.moveRowGroupColumn = function (fromIndex, toIndex) { this._columnController.moveRowGroupColumn(fromIndex, toIndex); };
	    ColumnApi.prototype.setColumnAggFunction = function (column, aggFunc) { this._columnController.setColumnAggFunction(column, aggFunc); };
	    ColumnApi.prototype.setColumnWidth = function (key, newWidth, finished) {
	        if (finished === void 0) { finished = true; }
	        this._columnController.setColumnWidth(key, newWidth, finished);
	    };
	    ColumnApi.prototype.removeValueColumn = function (column) { this._columnController.removeValueColumn(column); };
	    ColumnApi.prototype.addValueColumn = function (column) { this._columnController.addValueColumn(column); };
	    ColumnApi.prototype.removeRowGroupColumn = function (column) { this._columnController.removeRowGroupColumn(column); };
	    ColumnApi.prototype.addRowGroupColumn = function (column) { this._columnController.addRowGroupColumn(column); };
	    ColumnApi.prototype.getLeftDisplayedColumnGroups = function () { return this._columnController.getLeftDisplayedColumnGroups(); };
	    ColumnApi.prototype.getCenterDisplayedColumnGroups = function () { return this._columnController.getCenterDisplayedColumnGroups(); };
	    ColumnApi.prototype.getRightDisplayedColumnGroups = function () { return this._columnController.getRightDisplayedColumnGroups(); };
	    ColumnApi.prototype.getAllDisplayedColumnGroups = function () { return this._columnController.getAllDisplayedColumnGroups(); };
	    ColumnApi.prototype.autoSizeColumn = function (key) { return this._columnController.autoSizeColumn(key); };
	    ColumnApi.prototype.autoSizeColumns = function (keys) { return this._columnController.autoSizeColumns(keys); };
	    ColumnApi.prototype.columnGroupOpened = function (group, newValue) {
	        console.error('ag-Grid: columnGroupOpened no longer exists, use setColumnGroupOpened');
	        this.setColumnGroupOpened(group, newValue);
	    };
	    ColumnApi.prototype.hideColumns = function (colIds, hide) {
	        console.error('ag-Grid: hideColumns is deprecated, use setColumnsVisible');
	        this._columnController.setColumnsVisible(colIds, !hide);
	    };
	    ColumnApi.prototype.hideColumn = function (colId, hide) {
	        console.error('ag-Grid: hideColumn is deprecated, use setColumnVisible');
	        this._columnController.setColumnVisible(colId, !hide);
	    };
	    ColumnApi.prototype.setState = function (columnState) {
	        console.error('ag-Grid: setState is deprecated, use setColumnState');
	        return this.setColumnState(columnState);
	    };
	    ColumnApi.prototype.getState = function () {
	        console.error('ag-Grid: hideColumn is getState, use getColumnState');
	        return this.getColumnState();
	    };
	    ColumnApi.prototype.resetState = function () {
	        console.error('ag-Grid: hideColumn is resetState, use resetColumnState');
	        this.resetColumnState();
	    };
	    __decorate([
	        context_3.Autowired('columnController'), 
	        __metadata('design:type', ColumnController)
	    ], ColumnApi.prototype, "_columnController", void 0);
	    ColumnApi = __decorate([
	        context_1.Bean('columnApi'), 
	        __metadata('design:paramtypes', [])
	    ], ColumnApi);
	    return ColumnApi;
	})();
	exports.ColumnApi = ColumnApi;
	var ColumnController = (function () {
	    function ColumnController() {
	        // these are the lists used by the rowRenderer to render nodes. almost the leaf nodes of the above
	        // displayed trees, however it also takes into account if the groups are open or not.
	        this.displayedLeftColumns = [];
	        this.displayedRightColumns = [];
	        this.displayedCenterColumns = [];
	        this.headerRowCount = 0;
	        this.ready = false;
	    }
	    ColumnController.prototype.init = function () {
	        if (this.gridOptionsWrapper.getColumnDefs()) {
	            this.setColumnDefs(this.gridOptionsWrapper.getColumnDefs());
	        }
	    };
	    ColumnController.prototype.agWire = function (loggerFactory) {
	        this.logger = loggerFactory.create('ColumnController');
	    };
	    ColumnController.prototype.setFirstRightAndLastLeftPinned = function () {
	        var lastLeft = this.displayedLeftColumns ? this.displayedLeftColumns[this.displayedLeftColumns.length - 1] : null;
	        var firstRight = this.displayedRightColumns ? this.displayedRightColumns[0] : null;
	        this.allColumns.forEach(function (column) {
	            column.setLastLeftPinned(column === lastLeft);
	            column.setFirstRightPinned(column === firstRight);
	        });
	    };
	    ColumnController.prototype.autoSizeColumns = function (keys) {
	        var _this = this;
	        this.actionOnColumns(keys, function (column) {
	            var requiredWidth = _this.autoWidthCalculator.getPreferredWidthForColumn(column);
	            if (requiredWidth > 0) {
	                var newWidth = _this.normaliseColumnWidth(column, requiredWidth);
	                column.setActualWidth(newWidth);
	            }
	        }, function () {
	            return new columnChangeEvent_1.ColumnChangeEvent(events_1.Events.EVENT_COLUMN_RESIZED).withFinished(true);
	        });
	    };
	    ColumnController.prototype.autoSizeColumn = function (key) {
	        this.autoSizeColumns([key]);
	    };
	    ColumnController.prototype.autoSizeAllColumns = function () {
	        var allDisplayedColumns = this.getAllDisplayedColumns();
	        this.autoSizeColumns(allDisplayedColumns);
	    };
	    ColumnController.prototype.getColumnsFromTree = function (rootColumns) {
	        var result = [];
	        recursiveFindColumns(rootColumns);
	        return result;
	        function recursiveFindColumns(childColumns) {
	            for (var i = 0; i < childColumns.length; i++) {
	                var child = childColumns[i];
	                if (child instanceof column_1.Column) {
	                    result.push(child);
	                }
	                else if (child instanceof originalColumnGroup_1.OriginalColumnGroup) {
	                    recursiveFindColumns(child.getChildren());
	                }
	            }
	        }
	    };
	    ColumnController.prototype.getAllDisplayedColumnGroups = function () {
	        if (this.displayedLeftColumnTree && this.displayedRightColumnTree && this.displayedCentreColumnTree) {
	            return this.displayedLeftColumnTree
	                .concat(this.displayedCentreColumnTree)
	                .concat(this.displayedRightColumnTree);
	        }
	        else {
	            return null;
	        }
	    };
	    ColumnController.prototype.getOriginalColumnTree = function () {
	        return this.originalBalancedTree;
	    };
	    // + gridPanel -> for resizing the body and setting top margin
	    ColumnController.prototype.getHeaderRowCount = function () {
	        return this.headerRowCount;
	    };
	    // + headerRenderer -> setting pinned body width
	    ColumnController.prototype.getLeftDisplayedColumnGroups = function () {
	        return this.displayedLeftColumnTree;
	    };
	    // + headerRenderer -> setting pinned body width
	    ColumnController.prototype.getRightDisplayedColumnGroups = function () {
	        return this.displayedRightColumnTree;
	    };
	    // + headerRenderer -> setting pinned body width
	    ColumnController.prototype.getCenterDisplayedColumnGroups = function () {
	        return this.displayedCentreColumnTree;
	    };
	    ColumnController.prototype.getDisplayedColumnGroups = function (type) {
	        switch (type) {
	            case column_1.Column.PINNED_LEFT: return this.getLeftDisplayedColumnGroups();
	            case column_1.Column.PINNED_RIGHT: return this.getRightDisplayedColumnGroups();
	            default: return this.getCenterDisplayedColumnGroups();
	        }
	    };
	    // gridPanel -> ensureColumnVisible
	    ColumnController.prototype.isColumnDisplayed = function (column) {
	        return this.getAllDisplayedColumns().indexOf(column) >= 0;
	    };
	    // + csvCreator
	    ColumnController.prototype.getAllDisplayedColumns = function () {
	        // order we add the arrays together is important, so the result
	        // has the columns left to right, as they appear on the screen.
	        return this.displayedLeftColumns
	            .concat(this.displayedCenterColumns)
	            .concat(this.displayedRightColumns);
	    };
	    // used by:
	    // + angularGrid -> setting pinned body width
	    // todo: this needs to be cached
	    ColumnController.prototype.getPinnedLeftContainerWidth = function () {
	        return this.getWithOfColsInList(this.displayedLeftColumns);
	    };
	    // todo: this needs to be cached
	    ColumnController.prototype.getPinnedRightContainerWidth = function () {
	        return this.getWithOfColsInList(this.displayedRightColumns);
	    };
	    ColumnController.prototype.addRowGroupColumn = function (column) {
	        if (this.allColumns.indexOf(column) < 0) {
	            console.warn('not a valid column: ' + column);
	            return;
	        }
	        if (this.rowGroupColumns.indexOf(column) >= 0) {
	            console.warn('column is already a value column');
	            return;
	        }
	        this.rowGroupColumns.push(column);
	        // because we could be taking out columns, the displayed
	        // columns may differ, so need to work out all the columns again
	        this.updateModel();
	        var event = new columnChangeEvent_1.ColumnChangeEvent(events_1.Events.EVENT_COLUMN_ROW_GROUP_CHANGE);
	        this.eventService.dispatchEvent(events_1.Events.EVENT_COLUMN_ROW_GROUP_CHANGE, event);
	    };
	    ColumnController.prototype.removeRowGroupColumn = function (column) {
	        if (this.rowGroupColumns.indexOf(column) < 0) {
	            console.warn('column not a row group');
	            return;
	        }
	        utils_1.Utils.removeFromArray(this.rowGroupColumns, column);
	        this.updateModel();
	        var event = new columnChangeEvent_1.ColumnChangeEvent(events_1.Events.EVENT_COLUMN_ROW_GROUP_CHANGE);
	        this.eventService.dispatchEvent(events_1.Events.EVENT_COLUMN_ROW_GROUP_CHANGE, event);
	    };
	    ColumnController.prototype.addValueColumn = function (column) {
	        if (this.allColumns.indexOf(column) < 0) {
	            console.warn('not a valid column: ' + column);
	            return;
	        }
	        if (this.valueColumns.indexOf(column) >= 0) {
	            console.warn('column is already a value column');
	            return;
	        }
	        if (!column.getAggFunc()) {
	            column.setAggFunc(column_1.Column.AGG_SUM);
	        }
	        this.valueColumns.push(column);
	        var event = new columnChangeEvent_1.ColumnChangeEvent(events_1.Events.EVENT_COLUMN_VALUE_CHANGE);
	        this.eventService.dispatchEvent(events_1.Events.EVENT_COLUMN_VALUE_CHANGE, event);
	    };
	    ColumnController.prototype.removeValueColumn = function (column) {
	        if (this.valueColumns.indexOf(column) < 0) {
	            console.warn('column not a value');
	            return;
	        }
	        utils_1.Utils.removeFromArray(this.valueColumns, column);
	        var event = new columnChangeEvent_1.ColumnChangeEvent(events_1.Events.EVENT_COLUMN_VALUE_CHANGE);
	        this.eventService.dispatchEvent(events_1.Events.EVENT_COLUMN_VALUE_CHANGE, event);
	    };
	    // returns the width we can set to this col, taking into consideration min and max widths
	    ColumnController.prototype.normaliseColumnWidth = function (column, newWidth) {
	        if (newWidth < column.getMinWidth()) {
	            newWidth = column.getMinWidth();
	        }
	        if (column.isGreaterThanMax(newWidth)) {
	            newWidth = column.getMaxWidth();
	        }
	        return newWidth;
	    };
	    ColumnController.prototype.setColumnWidth = function (key, newWidth, finished) {
	        var column = this.getColumn(key);
	        if (!column) {
	            return;
	        }
	        newWidth = this.normaliseColumnWidth(column, newWidth);
	        var widthChanged = column.getActualWidth() !== newWidth;
	        if (widthChanged) {
	            column.setActualWidth(newWidth);
	            this.setLeftValues();
	        }
	        // check for change first, to avoid unnecessary firing of events
	        // however we always fire 'finished' events. this is important
	        // when groups are resized, as if the group is changing slowly,
	        // eg 1 pixel at a time, then each change will fire change events
	        // in all the columns in the group, but only one with get the pixel.
	        if (finished || widthChanged) {
	            var event = new columnChangeEvent_1.ColumnChangeEvent(events_1.Events.EVENT_COLUMN_RESIZED).withColumn(column).withFinished(finished);
	            this.eventService.dispatchEvent(events_1.Events.EVENT_COLUMN_RESIZED, event);
	        }
	    };
	    ColumnController.prototype.setColumnAggFunction = function (column, aggFunc) {
	        column.setAggFunc(aggFunc);
	        var event = new columnChangeEvent_1.ColumnChangeEvent(events_1.Events.EVENT_COLUMN_VALUE_CHANGE);
	        this.eventService.dispatchEvent(events_1.Events.EVENT_COLUMN_VALUE_CHANGE, event);
	    };
	    ColumnController.prototype.moveRowGroupColumn = function (fromIndex, toIndex) {
	        var column = this.rowGroupColumns[fromIndex];
	        this.rowGroupColumns.splice(fromIndex, 1);
	        this.rowGroupColumns.splice(toIndex, 0, column);
	        var event = new columnChangeEvent_1.ColumnChangeEvent(events_1.Events.EVENT_COLUMN_ROW_GROUP_CHANGE);
	        this.eventService.dispatchEvent(events_1.Events.EVENT_COLUMN_ROW_GROUP_CHANGE, event);
	    };
	    ColumnController.prototype.getPathForColumn = function (column) {
	        return this.columnUtils.getPathForColumn(column, this.getAllDisplayedColumnGroups());
	    };
	    ColumnController.prototype.moveColumns = function (keys, toIndex) {
	        var _this = this;
	        this.gridPanel.turnOnAnimationForABit();
	        this.actionOnColumns(keys, function (column) {
	            var fromIndex = _this.allColumns.indexOf(column);
	            _this.allColumns.splice(fromIndex, 1);
	            _this.allColumns.splice(toIndex, 0, column);
	        }, function () {
	            return new columnChangeEvent_1.ColumnChangeEvent(events_1.Events.EVENT_COLUMN_MOVED).withToIndex(toIndex);
	        });
	        this.updateModel();
	    };
	    ColumnController.prototype.moveColumn = function (key, toIndex) {
	        this.moveColumns([key], toIndex);
	    };
	    ColumnController.prototype.moveColumnByIndex = function (fromIndex, toIndex) {
	        var column = this.allColumns[fromIndex];
	        this.moveColumn(column, toIndex);
	    };
	    // used by:
	    // + angularGrid -> for setting body width
	    // + rowController -> setting main row widths (when inserting and resizing)
	    // need to cache this
	    ColumnController.prototype.getBodyContainerWidth = function () {
	        var result = this.getWithOfColsInList(this.displayedCenterColumns);
	        return result;
	    };
	    // + rowController
	    ColumnController.prototype.getValueColumns = function () {
	        return this.valueColumns;
	    };
	    // + toolPanel
	    ColumnController.prototype.getRowGroupColumns = function () {
	        return this.rowGroupColumns;
	    };
	    ColumnController.prototype.isColumnRowGrouped = function (column) {
	        return this.rowGroupColumns.indexOf(column) >= 0;
	    };
	    // + rowController -> while inserting rows
	    ColumnController.prototype.getDisplayedCenterColumns = function () {
	        return this.displayedCenterColumns.slice(0);
	    };
	    // + rowController -> while inserting rows
	    ColumnController.prototype.getDisplayedLeftColumns = function () {
	        return this.displayedLeftColumns.slice(0);
	    };
	    ColumnController.prototype.getDisplayedRightColumns = function () {
	        return this.displayedRightColumns.slice(0);
	    };
	    ColumnController.prototype.getDisplayedColumns = function (type) {
	        switch (type) {
	            case column_1.Column.PINNED_LEFT: return this.getDisplayedLeftColumns();
	            case column_1.Column.PINNED_RIGHT: return this.getDisplayedRightColumns();
	            default: return this.getDisplayedCenterColumns();
	        }
	    };
	    // used by:
	    // + inMemoryRowController -> sorting, building quick filter text
	    // + headerRenderer -> sorting (clearing icon)
	    ColumnController.prototype.getAllColumns = function () {
	        return this.allColumns;
	    };
	    ColumnController.prototype.isEmpty = function () {
	        return utils_1.Utils.missingOrEmpty(this.allColumns);
	    };
	    ColumnController.prototype.isRowGroupEmpty = function () {
	        return utils_1.Utils.missingOrEmpty(this.rowGroupColumns);
	    };
	    ColumnController.prototype.setColumnVisible = function (key, visible) {
	        this.setColumnsVisible([key], visible);
	    };
	    ColumnController.prototype.setColumnsVisible = function (keys, visible) {
	        this.gridPanel.turnOnAnimationForABit();
	        this.actionOnColumns(keys, function (column) {
	            column.setVisible(visible);
	        }, function () {
	            return new columnChangeEvent_1.ColumnChangeEvent(events_1.Events.EVENT_COLUMN_VISIBLE).withVisible(visible);
	        });
	    };
	    ColumnController.prototype.setColumnPinned = function (key, pinned) {
	        this.setColumnsPinned([key], pinned);
	    };
	    ColumnController.prototype.setColumnsPinned = function (keys, pinned) {
	        this.gridPanel.turnOnAnimationForABit();
	        var actualPinned;
	        if (pinned === true || pinned === column_1.Column.PINNED_LEFT) {
	            actualPinned = column_1.Column.PINNED_LEFT;
	        }
	        else if (pinned === column_1.Column.PINNED_RIGHT) {
	            actualPinned = column_1.Column.PINNED_RIGHT;
	        }
	        else {
	            actualPinned = null;
	        }
	        this.actionOnColumns(keys, function (column) {
	            column.setPinned(actualPinned);
	        }, function () {
	            return new columnChangeEvent_1.ColumnChangeEvent(events_1.Events.EVENT_COLUMN_PINNED).withPinned(actualPinned);
	        });
	    };
	    // does an action on a set of columns. provides common functionality for looking up the
	    // columns based on key, getting a list of effected columns, and then updated the event
	    // with either one column (if it was just one col) or a list of columns
	    ColumnController.prototype.actionOnColumns = function (keys, action, createEvent) {
	        var _this = this;
	        if (!keys || keys.length === 0) {
	            return;
	        }
	        var updatedColumns = [];
	        keys.forEach(function (key) {
	            var column = _this.getColumn(key);
	            if (!column) {
	                return;
	            }
	            action(column);
	            updatedColumns.push(column);
	        });
	        if (updatedColumns.length === 0) {
	            return;
	        }
	        this.updateModel();
	        var event = createEvent();
	        event.withColumns(updatedColumns);
	        if (updatedColumns.length === 1) {
	            event.withColumn(updatedColumns[0]);
	        }
	        this.eventService.dispatchEvent(event.getType(), event);
	    };
	    ColumnController.prototype.getDisplayedColBefore = function (col) {
	        var allDisplayedColumns = this.getAllDisplayedColumns();
	        var oldIndex = allDisplayedColumns.indexOf(col);
	        if (oldIndex > 0) {
	            return allDisplayedColumns[oldIndex - 1];
	        }
	        else {
	            return null;
	        }
	    };
	    // used by:
	    // + rowRenderer -> for navigation
	    ColumnController.prototype.getDisplayedColAfter = function (col) {
	        var allDisplayedColumns = this.getAllDisplayedColumns();
	        var oldIndex = allDisplayedColumns.indexOf(col);
	        if (oldIndex < (allDisplayedColumns.length - 1)) {
	            return allDisplayedColumns[oldIndex + 1];
	        }
	        else {
	            return null;
	        }
	    };
	    ColumnController.prototype.isPinningLeft = function () {
	        return this.displayedLeftColumns.length > 0;
	    };
	    ColumnController.prototype.isPinningRight = function () {
	        return this.displayedRightColumns.length > 0;
	    };
	    ColumnController.prototype.getAllColumnsIncludingAuto = function () {
	        var result = this.allColumns.slice(0);
	        if (this.groupAutoColumnActive) {
	            result.push(this.groupAutoColumn);
	        }
	        return result;
	    };
	    ColumnController.prototype.getColumnState = function () {
	        if (!this.allColumns || this.allColumns.length < 0) {
	            return [];
	        }
	        var result = [];
	        for (var i = 0; i < this.allColumns.length; i++) {
	            var column = this.allColumns[i];
	            var rowGroupIndex = this.rowGroupColumns.indexOf(column);
	            var resultItem = {
	                colId: column.getColId(),
	                hide: !column.isVisible(),
	                aggFunc: column.getAggFunc() ? column.getAggFunc() : null,
	                width: column.getActualWidth(),
	                pinned: column.getPinned(),
	                rowGroupIndex: rowGroupIndex >= 0 ? rowGroupIndex : null
	            };
	            result.push(resultItem);
	        }
	        return result;
	    };
	    ColumnController.prototype.resetColumnState = function () {
	        // we can't use 'allColumns' as the order might of messed up, so get the original ordered list
	        var originalColumns = this.allColumns = this.getColumnsFromTree(this.originalBalancedTree);
	        var state = [];
	        if (originalColumns) {
	            originalColumns.forEach(function (column) {
	                state.push({
	                    colId: column.getColId(),
	                    aggFunc: column.getColDef().aggFunc,
	                    hide: column.getColDef().hide,
	                    pinned: column.getColDef().pinned,
	                    rowGroupIndex: column.getColDef().rowGroupIndex,
	                    width: column.getColDef().width
	                });
	            });
	        }
	        this.setColumnState(state);
	    };
	    ColumnController.prototype.setColumnState = function (columnState) {
	        var _this = this;
	        var oldColumnList = this.allColumns;
	        this.allColumns = [];
	        this.rowGroupColumns = [];
	        this.valueColumns = [];
	        var success = true;
	        if (columnState) {
	            columnState.forEach(function (stateItem) {
	                var oldColumn = utils_1.Utils.find(oldColumnList, 'colId', stateItem.colId);
	                if (!oldColumn) {
	                    console.warn('ag-grid: column ' + stateItem.colId + ' not found');
	                    success = false;
	                }
	                // following ensures we are left with boolean true or false, eg converts (null, undefined, 0) all to true
	                oldColumn.setVisible(!stateItem.hide);
	                // sets pinned to 'left' or 'right'
	                oldColumn.setPinned(stateItem.pinned);
	                // if width provided and valid, use it, otherwise stick with the old width
	                if (stateItem.width >= _this.gridOptionsWrapper.getMinColWidth()) {
	                    oldColumn.setActualWidth(stateItem.width);
	                }
	                // accept agg func only if valid
	                var aggFuncValid = [column_1.Column.AGG_MIN, column_1.Column.AGG_MAX, column_1.Column.AGG_SUM, column_1.Column.AGG_FIRST, column_1.Column.AGG_LAST].indexOf(stateItem.aggFunc) >= 0;
	                if (aggFuncValid) {
	                    oldColumn.setAggFunc(stateItem.aggFunc);
	                    _this.valueColumns.push(oldColumn);
	                }
	                else {
	                    oldColumn.setAggFunc(null);
	                }
	                // if rowGroup
	                if (typeof stateItem.rowGroupIndex === 'number' && stateItem.rowGroupIndex >= 0) {
	                    _this.rowGroupColumns.push(oldColumn);
	                }
	                _this.allColumns.push(oldColumn);
	                oldColumnList.splice(oldColumnList.indexOf(oldColumn), 1);
	            });
	        }
	        // anything left over, we got no data for, so add in the column as non-value, non-rowGroup and hidden
	        oldColumnList.forEach(function (oldColumn) {
	            oldColumn.setVisible(false);
	            oldColumn.setAggFunc(null);
	            oldColumn.setPinned(null);
	            _this.allColumns.push(oldColumn);
	        });
	        // sort the row group columns
	        this.rowGroupColumns.sort(function (colA, colB) {
	            var rowGroupIndexA = -1;
	            var rowGroupIndexB = -1;
	            for (var i = 0; i < columnState.length; i++) {
	                var state = columnState[i];
	                if (state.colId === colA.getColId()) {
	                    rowGroupIndexA = state.rowGroupIndex;
	                }
	                if (state.colId === colB.getColId()) {
	                    rowGroupIndexB = state.rowGroupIndex;
	                }
	            }
	            return rowGroupIndexA - rowGroupIndexB;
	        });
	        this.updateModel();
	        var event = new columnChangeEvent_1.ColumnChangeEvent(events_1.Events.EVENT_COLUMN_EVERYTHING_CHANGED);
	        this.eventService.dispatchEvent(events_1.Events.EVENT_COLUMN_EVERYTHING_CHANGED, event);
	        return success;
	    };
	    ColumnController.prototype.getColumns = function (keys) {
	        var _this = this;
	        var foundColumns = [];
	        if (keys) {
	            keys.forEach(function (key) {
	                var column = _this.getColumn(key);
	                if (column) {
	                    foundColumns.push(column);
	                }
	            });
	        }
	        return foundColumns;
	    };
	    ColumnController.prototype.getColumnWithValidation = function (key) {
	        var column = this.getColumn(key);
	        if (!column) {
	            console.warn('ag-Grid: could not find column ' + column);
	        }
	        return column;
	    };
	    ColumnController.prototype.getColumn = function (key) {
	        if (!key) {
	            return null;
	        }
	        for (var i = 0; i < this.allColumns.length; i++) {
	            if (colMatches(this.allColumns[i])) {
	                return this.allColumns[i];
	            }
	        }
	        if (this.groupAutoColumnActive && colMatches(this.groupAutoColumn)) {
	            return this.groupAutoColumn;
	        }
	        function colMatches(column) {
	            var columnMatches = column === key;
	            var colDefMatches = column.getColDef() === key;
	            var idMatches = column.getColId() === key;
	            return columnMatches || colDefMatches || idMatches;
	        }
	        return null;
	    };
	    ColumnController.prototype.getDisplayNameForCol = function (column) {
	        var colDef = column.colDef;
	        var headerValueGetter = colDef.headerValueGetter;
	        if (headerValueGetter) {
	            var params = {
	                colDef: colDef,
	                api: this.gridOptionsWrapper.getApi(),
	                context: this.gridOptionsWrapper.getContext()
	            };
	            if (typeof headerValueGetter === 'function') {
	                // valueGetter is a function, so just call it
	                return headerValueGetter(params);
	            }
	            else if (typeof headerValueGetter === 'string') {
	                // valueGetter is an expression, so execute the expression
	                return this.expressionService.evaluate(headerValueGetter, params);
	            }
	            else {
	                console.warn('ag-grid: headerValueGetter must be a function or a string');
	            }
	        }
	        else if (colDef.displayName) {
	            console.warn("ag-grid: Found displayName " + colDef.displayName + ", please use headerName instead, displayName is deprecated.");
	            return colDef.displayName;
	        }
	        else {
	            return colDef.headerName;
	        }
	    };
	    // returns the group with matching colId and instanceId. If instanceId is missing,
	    // matches only on the colId.
	    ColumnController.prototype.getColumnGroup = function (colId, instanceId) {
	        if (!colId) {
	            return null;
	        }
	        if (colId instanceof columnGroup_1.ColumnGroup) {
	            return colId;
	        }
	        var allColumnGroups = this.getAllDisplayedColumnGroups();
	        var checkInstanceId = typeof instanceId === 'number';
	        var result = null;
	        this.columnUtils.deptFirstAllColumnTreeSearch(allColumnGroups, function (child) {
	            if (child instanceof columnGroup_1.ColumnGroup) {
	                var columnGroup = child;
	                var matched;
	                if (checkInstanceId) {
	                    matched = colId === columnGroup.getGroupId() && instanceId === columnGroup.getInstanceId();
	                }
	                else {
	                    matched = colId === columnGroup.getGroupId();
	                }
	                if (matched) {
	                    result = columnGroup;
	                }
	            }
	        });
	        return result;
	    };
	    ColumnController.prototype.getColumnDept = function () {
	        var dept = 0;
	        getDept(this.getAllDisplayedColumnGroups(), 1);
	        return dept;
	        function getDept(children, currentDept) {
	            if (dept < currentDept) {
	                dept = currentDept;
	            }
	            if (dept > currentDept) {
	                return;
	            }
	            children.forEach(function (child) {
	                if (child instanceof columnGroup_1.ColumnGroup) {
	                    var columnGroup = child;
	                    getDept(columnGroup.getChildren(), currentDept + 1);
	                }
	            });
	        }
	    };
	    ColumnController.prototype.setColumnDefs = function (columnDefs) {
	        var balancedTreeResult = this.balancedColumnTreeBuilder.createBalancedColumnGroups(columnDefs);
	        this.originalBalancedTree = balancedTreeResult.balancedTree;
	        this.headerRowCount = balancedTreeResult.treeDept + 1;
	        this.allColumns = this.getColumnsFromTree(this.originalBalancedTree);
	        this.extractRowGroupColumns();
	        this.createValueColumns();
	        this.updateModel();
	        this.ready = true;
	        var event = new columnChangeEvent_1.ColumnChangeEvent(events_1.Events.EVENT_COLUMN_EVERYTHING_CHANGED);
	        this.eventService.dispatchEvent(events_1.Events.EVENT_COLUMN_EVERYTHING_CHANGED, event);
	        this.eventService.dispatchEvent(events_1.Events.EVENT_NEW_COLUMNS_LOADED);
	    };
	    ColumnController.prototype.isReady = function () {
	        return this.ready;
	    };
	    ColumnController.prototype.extractRowGroupColumns = function () {
	        var _this = this;
	        this.rowGroupColumns = [];
	        // pull out the columns
	        this.allColumns.forEach(function (column) {
	            if (typeof column.getColDef().rowGroupIndex === 'number') {
	                _this.rowGroupColumns.push(column);
	            }
	        });
	        // then sort them
	        this.rowGroupColumns.sort(function (colA, colB) {
	            return colA.getColDef().rowGroupIndex - colB.getColDef().rowGroupIndex;
	        });
	    };
	    // called by headerRenderer - when a header is opened or closed
	    ColumnController.prototype.setColumnGroupOpened = function (passedGroup, newValue, instanceId) {
	        var groupToUse = this.getColumnGroup(passedGroup, instanceId);
	        if (!groupToUse) {
	            return;
	        }
	        this.logger.log('columnGroupOpened(' + groupToUse.getGroupId() + ',' + newValue + ')');
	        groupToUse.setExpanded(newValue);
	        this.gridPanel.turnOnAnimationForABit();
	        this.updateGroupsAndDisplayedColumns();
	        var event = new columnChangeEvent_1.ColumnChangeEvent(events_1.Events.EVENT_COLUMN_GROUP_OPENED).withColumnGroup(groupToUse);
	        this.eventService.dispatchEvent(events_1.Events.EVENT_COLUMN_GROUP_OPENED, event);
	    };
	    // used by updateModel
	    ColumnController.prototype.getColumnGroupState = function () {
	        var groupState = {};
	        this.columnUtils.deptFirstDisplayedColumnTreeSearch(this.getAllDisplayedColumnGroups(), function (child) {
	            if (child instanceof columnGroup_1.ColumnGroup) {
	                var columnGroup = child;
	                var key = columnGroup.getGroupId();
	                // if more than one instance of the group, we only record the state of the first item
	                if (!groupState.hasOwnProperty(key)) {
	                    groupState[key] = columnGroup.isExpanded();
	                }
	            }
	        });
	        return groupState;
	    };
	    // used by updateModel
	    ColumnController.prototype.setColumnGroupState = function (groupState) {
	        this.columnUtils.deptFirstDisplayedColumnTreeSearch(this.getAllDisplayedColumnGroups(), function (child) {
	            if (child instanceof columnGroup_1.ColumnGroup) {
	                var columnGroup = child;
	                var key = columnGroup.getGroupId();
	                var shouldExpandGroup = groupState[key] === true && columnGroup.isExpandable();
	                if (shouldExpandGroup) {
	                    columnGroup.setExpanded(true);
	                }
	            }
	        });
	    };
	    ColumnController.prototype.updateModel = function () {
	        // save opened / closed state
	        var oldGroupState = this.getColumnGroupState();
	        // following 3 methods are only called from here
	        this.createGroupAutoColumn();
	        var visibleColumns = this.updateVisibleColumns();
	        this.buildAllGroups(visibleColumns);
	        // restore opened / closed state
	        this.setColumnGroupState(oldGroupState);
	        // this is also called when a group is opened or closed
	        this.updateGroupsAndDisplayedColumns();
	        this.setFirstRightAndLastLeftPinned();
	    };
	    ColumnController.prototype.updateGroupsAndDisplayedColumns = function () {
	        this.updateGroups();
	        this.updateDisplayedColumnsFromGroups();
	    };
	    ColumnController.prototype.updateDisplayedColumnsFromGroups = function () {
	        this.addToDisplayedColumns(this.displayedLeftColumnTree, this.displayedLeftColumns);
	        this.addToDisplayedColumns(this.displayedRightColumnTree, this.displayedRightColumns);
	        this.addToDisplayedColumns(this.displayedCentreColumnTree, this.displayedCenterColumns);
	        this.setLeftValues();
	    };
	    ColumnController.prototype.setLeftValues = function () {
	        // go through each list of displayed columns
	        var allColumns = this.allColumns.slice(0);
	        [this.displayedLeftColumns, this.displayedRightColumns, this.displayedCenterColumns].forEach(function (columns) {
	            var left = 0;
	            columns.forEach(function (column) {
	                column.setLeft(left);
	                left += column.getActualWidth();
	                utils_1.Utils.removeFromArray(allColumns, column);
	            });
	        });
	        // items left in allColumns are columns not displayed, so remove the left position. this is
	        // important for the rows, as if a col is made visible, then taken out, then made visible again,
	        // we don't want the animation of the cell floating in from the old position, whatever that was.
	        allColumns.forEach(function (column) {
	            column.setLeft(null);
	        });
	    };
	    ColumnController.prototype.addToDisplayedColumns = function (displayedColumnTree, displayedColumns) {
	        displayedColumns.length = 0;
	        this.columnUtils.deptFirstDisplayedColumnTreeSearch(displayedColumnTree, function (child) {
	            if (child instanceof column_1.Column) {
	                displayedColumns.push(child);
	            }
	        });
	    };
	    // called from api
	    ColumnController.prototype.sizeColumnsToFit = function (gridWidth) {
	        var _this = this;
	        // avoid divide by zero
	        var allDisplayedColumns = this.getAllDisplayedColumns();
	        if (gridWidth <= 0 || allDisplayedColumns.length === 0) {
	            return;
	        }
	        var colsToNotSpread = utils_1.Utils.filter(allDisplayedColumns, function (column) {
	            return column.getColDef().suppressSizeToFit === true;
	        });
	        var colsToSpread = utils_1.Utils.filter(allDisplayedColumns, function (column) {
	            return column.getColDef().suppressSizeToFit !== true;
	        });
	        // make a copy of the cols that are going to be resized
	        var colsToFireEventFor = colsToSpread.slice(0);
	        var finishedResizing = false;
	        while (!finishedResizing) {
	            finishedResizing = true;
	            var availablePixels = gridWidth - getTotalWidth(colsToNotSpread);
	            if (availablePixels <= 0) {
	                // no width, set everything to minimum
	                colsToSpread.forEach(function (column) {
	                    column.setMinimum();
	                });
	            }
	            else {
	                var scale = availablePixels / getTotalWidth(colsToSpread);
	                // we set the pixels for the last col based on what's left, as otherwise
	                // we could be a pixel or two short or extra because of rounding errors.
	                var pixelsForLastCol = availablePixels;
	                // backwards through loop, as we are removing items as we go
	                for (var i = colsToSpread.length - 1; i >= 0; i--) {
	                    var column = colsToSpread[i];
	                    var newWidth = Math.round(column.getActualWidth() * scale);
	                    if (newWidth < column.getMinWidth()) {
	                        column.setMinimum();
	                        moveToNotSpread(column);
	                        finishedResizing = false;
	                    }
	                    else if (column.isGreaterThanMax(newWidth)) {
	                        column.setActualWidth(column.getMaxWidth());
	                        moveToNotSpread(column);
	                        finishedResizing = false;
	                    }
	                    else {
	                        var onLastCol = i === 0;
	                        if (onLastCol) {
	                            column.setActualWidth(pixelsForLastCol);
	                        }
	                        else {
	                            pixelsForLastCol -= newWidth;
	                            column.setActualWidth(newWidth);
	                        }
	                    }
	                }
	            }
	        }
	        this.setLeftValues();
	        // widths set, refresh the gui
	        colsToFireEventFor.forEach(function (column) {
	            var event = new columnChangeEvent_1.ColumnChangeEvent(events_1.Events.EVENT_COLUMN_RESIZED).withColumn(column);
	            _this.eventService.dispatchEvent(events_1.Events.EVENT_COLUMN_RESIZED, event);
	        });
	        function moveToNotSpread(column) {
	            utils_1.Utils.removeFromArray(colsToSpread, column);
	            colsToNotSpread.push(column);
	        }
	        function getTotalWidth(columns) {
	            var result = 0;
	            for (var i = 0; i < columns.length; i++) {
	                result += columns[i].getActualWidth();
	            }
	            return result;
	        }
	    };
	    ColumnController.prototype.buildAllGroups = function (visibleColumns) {
	        var leftVisibleColumns = utils_1.Utils.filter(visibleColumns, function (column) {
	            return column.getPinned() === 'left';
	        });
	        var rightVisibleColumns = utils_1.Utils.filter(visibleColumns, function (column) {
	            return column.getPinned() === 'right';
	        });
	        var centerVisibleColumns = utils_1.Utils.filter(visibleColumns, function (column) {
	            return column.getPinned() !== 'left' && column.getPinned() !== 'right';
	        });
	        //// if pinning left, then group column is also always pinned left. if not
	        //// pinning, then group column is either pinned left or center.
	        //if (this.groupAutoColumn) {
	        //    if (leftVisibleColumns.length > 0 || this.groupAutoColumn.isPinnedLeft()) {
	        //        leftVisibleColumns.unshift(this.groupAutoColumn);
	        //    } else {
	        //        centerVisibleColumns.unshift(this.groupAutoColumn);
	        //    }
	        //}
	        var groupInstanceIdCreator = new groupInstanceIdCreator_1.GroupInstanceIdCreator();
	        this.displayedLeftColumnTree = this.displayedGroupCreator.createDisplayedGroups(leftVisibleColumns, this.originalBalancedTree, groupInstanceIdCreator);
	        this.displayedRightColumnTree = this.displayedGroupCreator.createDisplayedGroups(rightVisibleColumns, this.originalBalancedTree, groupInstanceIdCreator);
	        this.displayedCentreColumnTree = this.displayedGroupCreator.createDisplayedGroups(centerVisibleColumns, this.originalBalancedTree, groupInstanceIdCreator);
	    };
	    ColumnController.prototype.updateGroups = function () {
	        var allGroups = this.getAllDisplayedColumnGroups();
	        this.columnUtils.deptFirstAllColumnTreeSearch(allGroups, function (child) {
	            if (child instanceof columnGroup_1.ColumnGroup) {
	                var group = child;
	                group.calculateDisplayedColumns();
	            }
	        });
	    };
	    ColumnController.prototype.createGroupAutoColumn = function () {
	        // see if we need to insert the default grouping column
	        var needAGroupColumn = this.rowGroupColumns.length > 0
	            && !this.gridOptionsWrapper.isGroupSuppressAutoColumn()
	            && !this.gridOptionsWrapper.isGroupUseEntireRow()
	            && !this.gridOptionsWrapper.isGroupSuppressRow();
	        this.groupAutoColumnActive = needAGroupColumn;
	        // lazy create group auto-column
	        if (needAGroupColumn && !this.groupAutoColumn) {
	            // if one provided by user, use it, otherwise create one
	            var autoColDef = this.gridOptionsWrapper.getGroupColumnDef();
	            if (!autoColDef) {
	                var localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
	                autoColDef = {
	                    headerName: localeTextFunc('group', 'Group'),
	                    comparator: functions_1.defaultGroupComparator,
	                    valueGetter: function (params) {
	                        if (params.node.group) {
	                            return params.node.key;
	                        }
	                        else if (params.data && params.colDef.field) {
	                            return params.data[params.colDef.field];
	                        }
	                        else {
	                            return null;
	                        }
	                    },
	                    suppressAggregation: true,
	                    suppressRowGroup: true,
	                    cellRenderer: {
	                        renderer: 'group'
	                    }
	                };
	            }
	            // we never allow moving the group column
	            autoColDef.suppressMovable = true;
	            var colId = 'ag-Grid-AutoColumn';
	            this.groupAutoColumn = new column_1.Column(autoColDef, colId);
	            this.context.wireBean(this.groupAutoColumn);
	        }
	    };
	    ColumnController.prototype.updateVisibleColumns = function () {
	        var visibleColumns = utils_1.Utils.filter(this.allColumns, function (column) { return column.isVisible(); });
	        if (this.groupAutoColumnActive) {
	            visibleColumns.unshift(this.groupAutoColumn);
	        }
	        return visibleColumns;
	    };
	    ColumnController.prototype.createValueColumns = function () {
	        this.valueColumns = [];
	        // override with columns that have the aggFunc specified explicitly
	        for (var i = 0; i < this.allColumns.length; i++) {
	            var column = this.allColumns[i];
	            if (column.getColDef().aggFunc) {
	                column.setAggFunc(column.getColDef().aggFunc);
	                this.valueColumns.push(column);
	            }
	        }
	    };
	    ColumnController.prototype.getWithOfColsInList = function (columnList) {
	        var result = 0;
	        for (var i = 0; i < columnList.length; i++) {
	            result += columnList[i].getActualWidth();
	        }
	        return result;
	    };
	    __decorate([
	        context_3.Autowired('gridOptionsWrapper'), 
	        __metadata('design:type', gridOptionsWrapper_1.GridOptionsWrapper)
	    ], ColumnController.prototype, "gridOptionsWrapper", void 0);
	    __decorate([
	        context_3.Autowired('selectionRendererFactory'), 
	        __metadata('design:type', selectionRendererFactory_1.SelectionRendererFactory)
	    ], ColumnController.prototype, "selectionRendererFactory", void 0);
	    __decorate([
	        context_3.Autowired('expressionService'), 
	        __metadata('design:type', expressionService_1.ExpressionService)
	    ], ColumnController.prototype, "expressionService", void 0);
	    __decorate([
	        context_3.Autowired('balancedColumnTreeBuilder'), 
	        __metadata('design:type', balancedColumnTreeBuilder_1.BalancedColumnTreeBuilder)
	    ], ColumnController.prototype, "balancedColumnTreeBuilder", void 0);
	    __decorate([
	        context_3.Autowired('displayedGroupCreator'), 
	        __metadata('design:type', displayedGroupCreator_1.DisplayedGroupCreator)
	    ], ColumnController.prototype, "displayedGroupCreator", void 0);
	    __decorate([
	        context_3.Autowired('autoWidthCalculator'), 
	        __metadata('design:type', autoWidthCalculator_1.AutoWidthCalculator)
	    ], ColumnController.prototype, "autoWidthCalculator", void 0);
	    __decorate([
	        context_3.Autowired('valueService'), 
	        __metadata('design:type', Array)
	    ], ColumnController.prototype, "valueColumns", void 0);
	    __decorate([
	        context_3.Autowired('eventService'), 
	        __metadata('design:type', eventService_1.EventService)
	    ], ColumnController.prototype, "eventService", void 0);
	    __decorate([
	        context_3.Autowired('columnUtils'), 
	        __metadata('design:type', columnUtils_1.ColumnUtils)
	    ], ColumnController.prototype, "columnUtils", void 0);
	    __decorate([
	        context_3.Autowired('gridPanel'), 
	        __metadata('design:type', gridPanel_1.GridPanel)
	    ], ColumnController.prototype, "gridPanel", void 0);
	    __decorate([
	        context_3.Autowired('context'), 
	        __metadata('design:type', context_5.Context)
	    ], ColumnController.prototype, "context", void 0);
	    __decorate([
	        context_4.PostConstruct, 
	        __metadata('design:type', Function), 
	        __metadata('design:paramtypes', []), 
	        __metadata('design:returntype', void 0)
	    ], ColumnController.prototype, "init", null);
	    __decorate([
	        __param(0, context_2.Qualifier('loggerFactory')), 
	        __metadata('design:type', Function), 
	        __metadata('design:paramtypes', [logger_1.LoggerFactory]), 
	        __metadata('design:returntype', void 0)
	    ], ColumnController.prototype, "agWire", null);
	    ColumnController = __decorate([
	        context_1.Bean('columnController'), 
	        __metadata('design:paramtypes', [])
	    ], ColumnController);
	    return ColumnController;
	})();
	exports.ColumnController = ColumnController;


/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
	 * @version v4.0.3
	 * @link http://www.ag-grid.com/
	 * @license MIT
	 */
	var column_1 = __webpack_require__(15);
	var ColumnGroup = (function () {
	    function ColumnGroup(originalColumnGroup, groupId, instanceId) {
	        // depends on the open/closed state of the group, only displaying columns are stored here
	        this.displayedChildren = [];
	        this.groupId = groupId;
	        this.instanceId = instanceId;
	        this.originalColumnGroup = originalColumnGroup;
	    }
	    // returns header name if it exists, otherwise null. if will not exist if
	    // this group is a padding group, as they don't have colGroupDef's
	    ColumnGroup.prototype.getHeaderName = function () {
	        if (this.originalColumnGroup.getColGroupDef()) {
	            return this.originalColumnGroup.getColGroupDef().headerName;
	        }
	        else {
	            return null;
	        }
	    };
	    ColumnGroup.prototype.getGroupId = function () {
	        return this.groupId;
	    };
	    ColumnGroup.prototype.getInstanceId = function () {
	        return this.instanceId;
	    };
	    ColumnGroup.prototype.isChildInThisGroupDeepSearch = function (wantedChild) {
	        var result = false;
	        this.children.forEach(function (foundChild) {
	            if (wantedChild === foundChild) {
	                result = true;
	            }
	            if (foundChild instanceof ColumnGroup) {
	                if (foundChild.isChildInThisGroupDeepSearch(wantedChild)) {
	                    result = true;
	                }
	            }
	        });
	        return result;
	    };
	    ColumnGroup.prototype.getActualWidth = function () {
	        var groupActualWidth = 0;
	        if (this.displayedChildren) {
	            this.displayedChildren.forEach(function (child) {
	                groupActualWidth += child.getActualWidth();
	            });
	        }
	        return groupActualWidth;
	    };
	    ColumnGroup.prototype.getMinWidth = function () {
	        var result = 0;
	        this.displayedChildren.forEach(function (groupChild) {
	            result += groupChild.getMinWidth();
	        });
	        return result;
	    };
	    ColumnGroup.prototype.addChild = function (child) {
	        if (!this.children) {
	            this.children = [];
	        }
	        this.children.push(child);
	    };
	    ColumnGroup.prototype.getDisplayedChildren = function () {
	        return this.displayedChildren;
	    };
	    ColumnGroup.prototype.getLeafColumns = function () {
	        var result = [];
	        this.addLeafColumns(result);
	        return result;
	    };
	    ColumnGroup.prototype.getDisplayedLeafColumns = function () {
	        var result = [];
	        this.addDisplayedLeafColumns(result);
	        return result;
	    };
	    // why two methods here doing the same thing?
	    ColumnGroup.prototype.getDefinition = function () {
	        return this.originalColumnGroup.getColGroupDef();
	    };
	    ColumnGroup.prototype.getColGroupDef = function () {
	        return this.originalColumnGroup.getColGroupDef();
	    };
	    ColumnGroup.prototype.isExpandable = function () {
	        return this.originalColumnGroup.isExpandable();
	    };
	    ColumnGroup.prototype.isExpanded = function () {
	        return this.originalColumnGroup.isExpanded();
	    };
	    ColumnGroup.prototype.setExpanded = function (expanded) {
	        this.originalColumnGroup.setExpanded(expanded);
	    };
	    ColumnGroup.prototype.addDisplayedLeafColumns = function (leafColumns) {
	        this.displayedChildren.forEach(function (child) {
	            if (child instanceof column_1.Column) {
	                leafColumns.push(child);
	            }
	            else if (child instanceof ColumnGroup) {
	                child.addDisplayedLeafColumns(leafColumns);
	            }
	        });
	    };
	    ColumnGroup.prototype.addLeafColumns = function (leafColumns) {
	        this.children.forEach(function (child) {
	            if (child instanceof column_1.Column) {
	                leafColumns.push(child);
	            }
	            else if (child instanceof ColumnGroup) {
	                child.addLeafColumns(leafColumns);
	            }
	        });
	    };
	    ColumnGroup.prototype.getChildren = function () {
	        return this.children;
	    };
	    ColumnGroup.prototype.getColumnGroupShow = function () {
	        return this.originalColumnGroup.getColumnGroupShow();
	    };
	    ColumnGroup.prototype.calculateDisplayedColumns = function () {
	        // clear out last time we calculated
	        this.displayedChildren = [];
	        // it not expandable, everything is visible
	        if (!this.originalColumnGroup.isExpandable()) {
	            this.displayedChildren = this.children;
	            return;
	        }
	        // and calculate again
	        for (var i = 0, j = this.children.length; i < j; i++) {
	            var abstractColumn = this.children[i];
	            var headerGroupShow = abstractColumn.getColumnGroupShow();
	            switch (headerGroupShow) {
	                case ColumnGroup.HEADER_GROUP_SHOW_OPEN:
	                    // when set to open, only show col if group is open
	                    if (this.originalColumnGroup.isExpanded()) {
	                        this.displayedChildren.push(abstractColumn);
	                    }
	                    break;
	                case ColumnGroup.HEADER_GROUP_SHOW_CLOSED:
	                    // when set to open, only show col if group is open
	                    if (!this.originalColumnGroup.isExpanded()) {
	                        this.displayedChildren.push(abstractColumn);
	                    }
	                    break;
	                default:
	                    // default is always show the column
	                    this.displayedChildren.push(abstractColumn);
	                    break;
	            }
	        }
	    };
	    ColumnGroup.HEADER_GROUP_SHOW_OPEN = 'open';
	    ColumnGroup.HEADER_GROUP_SHOW_CLOSED = 'closed';
	    return ColumnGroup;
	})();
	exports.ColumnGroup = ColumnGroup;


/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
	 * @version v4.0.3
	 * @link http://www.ag-grid.com/
	 * @license MIT
	 */
	var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
	    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
	    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
	    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
	    return c > 3 && r && Object.defineProperty(target, key, r), r;
	};
	var __metadata = (this && this.__metadata) || function (k, v) {
	    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
	};
	var eventService_1 = __webpack_require__(4);
	var utils_1 = __webpack_require__(7);
	var context_1 = __webpack_require__(6);
	var gridOptionsWrapper_1 = __webpack_require__(3);
	var context_2 = __webpack_require__(6);
	var columnUtils_1 = __webpack_require__(16);
	// Wrapper around a user provide column definition. The grid treats the column definition as ready only.
	// This class contains all the runtime information about a column, plus some logic (the definition has no logic).
	// This class implements both interfaces ColumnGroupChild and OriginalColumnGroupChild as the class can
	// appear as a child of either the original tree or the displayed tree. However the relevant group classes
	// for each type only implements one, as each group can only appear in it's associated tree (eg OriginalColumnGroup
	// can only appear in OriginalColumn tree).
	var Column = (function () {
	    function Column(colDef, colId) {
	        this.moving = false;
	        this.filterActive = false;
	        this.eventService = new eventService_1.EventService();
	        this.colDef = colDef;
	        this.visible = !colDef.hide;
	        this.sort = colDef.sort;
	        this.sortedAt = colDef.sortedAt;
	        this.colId = colId;
	    }
	    // this is done after constructor as it uses gridOptionsWrapper
	    Column.prototype.initialise = function () {
	        this.setPinned(this.colDef.pinned);
	        var minColWidth = this.gridOptionsWrapper.getMinColWidth();
	        var maxColWidth = this.gridOptionsWrapper.getMaxColWidth();
	        if (this.colDef.minWidth) {
	            this.minWidth = this.colDef.minWidth;
	        }
	        else {
	            this.minWidth = minColWidth;
	        }
	        if (this.colDef.maxWidth) {
	            this.maxWidth = this.colDef.maxWidth;
	        }
	        else {
	            this.maxWidth = maxColWidth;
	        }
	        this.actualWidth = this.columnUtils.calculateColInitialWidth(this.colDef);
	        this.validate();
	    };
	    Column.prototype.validate = function () {
	        if (!this.gridOptionsWrapper.isEnterprise()) {
	            if (utils_1.Utils.exists(this.colDef.aggFunc)) {
	                console.warn('ag-Grid: aggFunc is only valid in ag-Grid-Enterprise');
	            }
	            if (utils_1.Utils.exists(this.colDef.rowGroupIndex)) {
	                console.warn('ag-Grid: rowGroupIndex is only valid in ag-Grid-Enterprise');
	            }
	        }
	    };
	    Column.prototype.addEventListener = function (eventType, listener) {
	        this.eventService.addEventListener(eventType, listener);
	    };
	    Column.prototype.removeEventListener = function (eventType, listener) {
	        this.eventService.removeEventListener(eventType, listener);
	    };
	    Column.prototype.isCellEditable = function (rowNode) {
	        // if boolean set, then just use it
	        if (typeof this.colDef.editable === 'boolean') {
	            return this.colDef.editable;
	        }
	        // if function, then call the function to find out
	        if (typeof this.colDef.editable === 'function') {
	            var params = {
	                node: rowNode,
	                column: this,
	                colDef: this.colDef,
	                context: this.gridOptionsWrapper.getContext(),
	                api: this.gridOptionsWrapper.getApi(),
	                columnApi: this.gridOptionsWrapper.getColumnApi()
	            };
	            var editableFunc = this.colDef.editable;
	            return editableFunc(params);
	        }
	        return false;
	    };
	    Column.prototype.setMoving = function (moving) {
	        this.moving = moving;
	        this.eventService.dispatchEvent(Column.EVENT_MOVING_CHANGED);
	    };
	    Column.prototype.isMoving = function () {
	        return this.moving;
	    };
	    Column.prototype.getSort = function () {
	        return this.sort;
	    };
	    Column.prototype.setSort = function (sort) {
	        if (this.sort !== sort) {
	            this.sort = sort;
	            this.eventService.dispatchEvent(Column.EVENT_SORT_CHANGED);
	        }
	    };
	    Column.prototype.isSortAscending = function () {
	        return this.sort === Column.SORT_ASC;
	    };
	    Column.prototype.isSortDescending = function () {
	        return this.sort === Column.SORT_DESC;
	    };
	    Column.prototype.isSortNone = function () {
	        return utils_1.Utils.missing(this.sort);
	    };
	    Column.prototype.getSortedAt = function () {
	        return this.sortedAt;
	    };
	    Column.prototype.setSortedAt = function (sortedAt) {
	        this.sortedAt = sortedAt;
	    };
	    Column.prototype.setAggFunc = function (aggFunc) {
	        this.aggFunc = aggFunc;
	    };
	    Column.prototype.getAggFunc = function () {
	        return this.aggFunc;
	    };
	    Column.prototype.getLeft = function () {
	        return this.left;
	    };
	    Column.prototype.getRight = function () {
	        return this.left + this.actualWidth;
	    };
	    Column.prototype.setLeft = function (left) {
	        if (this.left !== left) {
	            this.left = left;
	            this.eventService.dispatchEvent(Column.EVENT_LEFT_CHANGED);
	        }
	    };
	    Column.prototype.isFilterActive = function () {
	        return this.filterActive;
	    };
	    Column.prototype.setFilterActive = function (active) {
	        if (this.filterActive !== active) {
	            this.filterActive = active;
	            this.eventService.dispatchEvent(Column.EVENT_FILTER_ACTIVE_CHANGED);
	        }
	    };
	    Column.prototype.setPinned = function (pinned) {
	        // pinning is not allowed when doing 'forPrint'
	        if (this.gridOptionsWrapper.isForPrint()) {
	            return;
	        }
	        if (pinned === true || pinned === Column.PINNED_LEFT) {
	            this.pinned = Column.PINNED_LEFT;
	        }
	        else if (pinned === Column.PINNED_RIGHT) {
	            this.pinned = Column.PINNED_RIGHT;
	        }
	        else {
	            this.pinned = null;
	        }
	    };
	    Column.prototype.setFirstRightPinned = function (firstRightPinned) {
	        if (this.firstRightPinned !== firstRightPinned) {
	            this.firstRightPinned = firstRightPinned;
	            this.eventService.dispatchEvent(Column.EVENT_FIRST_RIGHT_PINNED_CHANGED);
	        }
	    };
	    Column.prototype.setLastLeftPinned = function (lastLeftPinned) {
	        if (this.lastLeftPinned !== lastLeftPinned) {
	            this.lastLeftPinned = lastLeftPinned;
	            this.eventService.dispatchEvent(Column.EVENT_LAST_LEFT_PINNED_CHANGED);
	        }
	    };
	    Column.prototype.isFirstRightPinned = function () {
	        return this.firstRightPinned;
	    };
	    Column.prototype.isLastLeftPinned = function () {
	        return this.lastLeftPinned;
	    };
	    Column.prototype.isPinned = function () {
	        return this.pinned === Column.PINNED_LEFT || this.pinned === Column.PINNED_RIGHT;
	    };
	    Column.prototype.isPinnedLeft = function () {
	        return this.pinned === Column.PINNED_LEFT;
	    };
	    Column.prototype.isPinnedRight = function () {
	        return this.pinned === Column.PINNED_RIGHT;
	    };
	    Column.prototype.getPinned = function () {
	        return this.pinned;
	    };
	    Column.prototype.setVisible = function (visible) {
	        var newValue = visible === true;
	        if (this.visible !== newValue) {
	            this.visible = newValue;
	            this.eventService.dispatchEvent(Column.EVENT_VISIBLE_CHANGED);
	        }
	    };
	    Column.prototype.isVisible = function () {
	        return this.visible;
	    };
	    Column.prototype.getColDef = function () {
	        return this.colDef;
	    };
	    Column.prototype.getColumnGroupShow = function () {
	        return this.colDef.columnGroupShow;
	    };
	    Column.prototype.getColId = function () {
	        return this.colId;
	    };
	    Column.prototype.getId = function () {
	        return this.getColId();
	    };
	    Column.prototype.getDefinition = function () {
	        return this.colDef;
	    };
	    Column.prototype.getActualWidth = function () {
	        return this.actualWidth;
	    };
	    Column.prototype.setActualWidth = function (actualWidth) {
	        if (this.actualWidth !== actualWidth) {
	            this.actualWidth = actualWidth;
	            this.eventService.dispatchEvent(Column.EVENT_WIDTH_CHANGED);
	        }
	    };
	    Column.prototype.isGreaterThanMax = function (width) {
	        if (this.maxWidth) {
	            return width > this.maxWidth;
	        }
	        else {
	            return false;
	        }
	    };
	    Column.prototype.getMinWidth = function () {
	        return this.minWidth;
	    };
	    Column.prototype.getMaxWidth = function () {
	        return this.maxWidth;
	    };
	    Column.prototype.setMinimum = function () {
	        this.setActualWidth(this.minWidth);
	    };
	    // + renderedHeaderCell - for making header cell transparent when moving
	    Column.EVENT_MOVING_CHANGED = 'movingChanged';
	    // + renderedCell - changing left position
	    Column.EVENT_LEFT_CHANGED = 'leftChanged';
	    // + renderedCell - changing width
	    Column.EVENT_WIDTH_CHANGED = 'widthChanged';
	    // + renderedCell - for changing pinned classes
	    Column.EVENT_LAST_LEFT_PINNED_CHANGED = 'lastLeftPinnedChanged';
	    Column.EVENT_FIRST_RIGHT_PINNED_CHANGED = 'firstRightPinnedChanged';
	    // + renderedColumn - for changing visibility icon
	    Column.EVENT_VISIBLE_CHANGED = 'visibleChanged';
	    // + renderedHeaderCell - marks the header with filter icon
	    Column.EVENT_FILTER_ACTIVE_CHANGED = 'filterChanged';
	    // + renderedHeaderCell - marks the header with sort icon
	    Column.EVENT_SORT_CHANGED = 'filterChanged';
	    Column.PINNED_RIGHT = 'right';
	    Column.PINNED_LEFT = 'left';
	    Column.AGG_SUM = 'sum';
	    Column.AGG_MIN = 'min';
	    Column.AGG_MAX = 'max';
	    Column.AGG_FIRST = 'first';
	    Column.AGG_LAST = 'last';
	    Column.SORT_ASC = 'asc';
	    Column.SORT_DESC = 'desc';
	    __decorate([
	        context_1.Autowired('gridOptionsWrapper'), 
	        __metadata('design:type', gridOptionsWrapper_1.GridOptionsWrapper)
	    ], Column.prototype, "gridOptionsWrapper", void 0);
	    __decorate([
	        context_1.Autowired('columnUtils'), 
	        __metadata('design:type', columnUtils_1.ColumnUtils)
	    ], Column.prototype, "columnUtils", void 0);
	    __decorate([
	        context_2.PostConstruct, 
	        __metadata('design:type', Function), 
	        __metadata('design:paramtypes', []), 
	        __metadata('design:returntype', void 0)
	    ], Column.prototype, "initialise", null);
	    return Column;
	})();
	exports.Column = Column;


/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
	 * @version v4.0.3
	 * @link http://www.ag-grid.com/
	 * @license MIT
	 */
	var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
	    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
	    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
	    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
	    return c > 3 && r && Object.defineProperty(target, key, r), r;
	};
	var __metadata = (this && this.__metadata) || function (k, v) {
	    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
	};
	var gridOptionsWrapper_1 = __webpack_require__(3);
	var columnGroup_1 = __webpack_require__(14);
	var originalColumnGroup_1 = __webpack_require__(17);
	var context_1 = __webpack_require__(6);
	var context_2 = __webpack_require__(6);
	// takes in a list of columns, as specified by the column definitions, and returns column groups
	var ColumnUtils = (function () {
	    function ColumnUtils() {
	    }
	    ColumnUtils.prototype.calculateColInitialWidth = function (colDef) {
	        if (!colDef.width) {
	            // if no width defined in colDef, use default
	            return this.gridOptionsWrapper.getColWidth();
	        }
	        else if (colDef.width < this.gridOptionsWrapper.getMinColWidth()) {
	            // if width in col def to small, set to min width
	            return this.gridOptionsWrapper.getMinColWidth();
	        }
	        else {
	            // otherwise use the provided width
	            return colDef.width;
	        }
	    };
	    ColumnUtils.prototype.getPathForColumn = function (column, allDisplayedColumnGroups) {
	        var result = [];
	        var found = false;
	        recursePath(allDisplayedColumnGroups, 0);
	        // we should always find the path, but in case there is a bug somewhere, returning null
	        // will make it fail rather than provide a 'hard to track down' bug
	        if (found) {
	            return result;
	        }
	        else {
	            return null;
	        }
	        function recursePath(balancedColumnTree, dept) {
	            for (var i = 0; i < balancedColumnTree.length; i++) {
	                if (found) {
	                    // quit the search, so 'result' is kept with the found result
	                    return;
	                }
	                var node = balancedColumnTree[i];
	                if (node instanceof columnGroup_1.ColumnGroup) {
	                    var nextNode = node;
	                    recursePath(nextNode.getChildren(), dept + 1);
	                    result[dept] = node;
	                }
	                else {
	                    if (node === column) {
	                        found = true;
	                    }
	                }
	            }
	        }
	    };
	    ColumnUtils.prototype.deptFirstOriginalTreeSearch = function (tree, callback) {
	        var _this = this;
	        if (!tree) {
	            return;
	        }
	        tree.forEach(function (child) {
	            if (child instanceof originalColumnGroup_1.OriginalColumnGroup) {
	                _this.deptFirstOriginalTreeSearch(child.getChildren(), callback);
	            }
	            callback(child);
	        });
	    };
	    ColumnUtils.prototype.deptFirstAllColumnTreeSearch = function (tree, callback) {
	        var _this = this;
	        if (!tree) {
	            return;
	        }
	        tree.forEach(function (child) {
	            if (child instanceof columnGroup_1.ColumnGroup) {
	                _this.deptFirstAllColumnTreeSearch(child.getChildren(), callback);
	            }
	            callback(child);
	        });
	    };
	    ColumnUtils.prototype.deptFirstDisplayedColumnTreeSearch = function (tree, callback) {
	        var _this = this;
	        if (!tree) {
	            return;
	        }
	        tree.forEach(function (child) {
	            if (child instanceof columnGroup_1.ColumnGroup) {
	                _this.deptFirstDisplayedColumnTreeSearch(child.getDisplayedChildren(), callback);
	            }
	            callback(child);
	        });
	    };
	    __decorate([
	        context_2.Autowired('gridOptionsWrapper'), 
	        __metadata('design:type', gridOptionsWrapper_1.GridOptionsWrapper)
	    ], ColumnUtils.prototype, "gridOptionsWrapper", void 0);
	    ColumnUtils = __decorate([
	        context_1.Bean('columnUtils'), 
	        __metadata('design:paramtypes', [])
	    ], ColumnUtils);
	    return ColumnUtils;
	})();
	exports.ColumnUtils = ColumnUtils;


/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
	 * @version v4.0.3
	 * @link http://www.ag-grid.com/
	 * @license MIT
	 */
	var columnGroup_1 = __webpack_require__(14);
	var column_1 = __webpack_require__(15);
	var OriginalColumnGroup = (function () {
	    function OriginalColumnGroup(colGroupDef, groupId) {
	        this.expandable = false;
	        this.expanded = false;
	        this.colGroupDef = colGroupDef;
	        this.groupId = groupId;
	    }
	    OriginalColumnGroup.prototype.setExpanded = function (expanded) {
	        this.expanded = expanded;
	    };
	    OriginalColumnGroup.prototype.isExpandable = function () {
	        return this.expandable;
	    };
	    OriginalColumnGroup.prototype.isExpanded = function () {
	        return this.expanded;
	    };
	    OriginalColumnGroup.prototype.getGroupId = function () {
	        return this.groupId;
	    };
	    OriginalColumnGroup.prototype.getId = function () {
	        return this.getGroupId();
	    };
	    OriginalColumnGroup.prototype.setChildren = function (children) {
	        this.children = children;
	    };
	    OriginalColumnGroup.prototype.getChildren = function () {
	        return this.children;
	    };
	    OriginalColumnGroup.prototype.getColGroupDef = function () {
	        return this.colGroupDef;
	    };
	    OriginalColumnGroup.prototype.getLeafColumns = function () {
	        var result = [];
	        this.addLeafColumns(result);
	        return result;
	    };
	    OriginalColumnGroup.prototype.addLeafColumns = function (leafColumns) {
	        this.children.forEach(function (child) {
	            if (child instanceof column_1.Column) {
	                leafColumns.push(child);
	            }
	            else if (child instanceof OriginalColumnGroup) {
	                child.addLeafColumns(leafColumns);
	            }
	        });
	    };
	    OriginalColumnGroup.prototype.getColumnGroupShow = function () {
	        if (this.colGroupDef) {
	            return this.colGroupDef.columnGroupShow;
	        }
	        else {
	            // if there is no col def, then this must be a padding
	            // group, which means we have exactly only child. we then
	            // take the value from the child and push it up, making
	            // this group 'invisible'.
	            return this.children[0].getColumnGroupShow();
	        }
	    };
	    // need to check that this group has at least one col showing when both expanded and contracted.
	    // if not, then we don't allow expanding and contracting on this group
	    OriginalColumnGroup.prototype.calculateExpandable = function () {
	        // want to make sure the group doesn't disappear when it's open
	        var atLeastOneShowingWhenOpen = false;
	        // want to make sure the group doesn't disappear when it's closed
	        var atLeastOneShowingWhenClosed = false;
	        // want to make sure the group has something to show / hide
	        var atLeastOneChangeable = false;
	        for (var i = 0, j = this.children.length; i < j; i++) {
	            var abstractColumn = this.children[i];
	            // if the abstractColumn is a grid generated group, there will be no colDef
	            var headerGroupShow = abstractColumn.getColumnGroupShow();
	            if (headerGroupShow === columnGroup_1.ColumnGroup.HEADER_GROUP_SHOW_OPEN) {
	                atLeastOneShowingWhenOpen = true;
	                atLeastOneChangeable = true;
	            }
	            else if (headerGroupShow === columnGroup_1.ColumnGroup.HEADER_GROUP_SHOW_CLOSED) {
	                atLeastOneShowingWhenClosed = true;
	                atLeastOneChangeable = true;
	            }
	            else {
	                atLeastOneShowingWhenOpen = true;
	                atLeastOneShowingWhenClosed = true;
	            }
	        }
	        this.expandable = atLeastOneShowingWhenOpen && atLeastOneShowingWhenClosed && atLeastOneChangeable;
	    };
	    return OriginalColumnGroup;
	})();
	exports.OriginalColumnGroup = OriginalColumnGroup;


/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
	 * @version v4.0.3
	 * @link http://www.ag-grid.com/
	 * @license MIT
	 */
	var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
	    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
	    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
	    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
	    return c > 3 && r && Object.defineProperty(target, key, r), r;
	};
	var __metadata = (this && this.__metadata) || function (k, v) {
	    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
	};
	var context_1 = __webpack_require__(6);
	var rowNode_1 = __webpack_require__(19);
	var renderedRow_1 = __webpack_require__(20);
	var utils_1 = __webpack_require__(7);
	var SelectionRendererFactory = (function () {
	    function SelectionRendererFactory() {
	    }
	    SelectionRendererFactory.prototype.createSelectionCheckbox = function (rowNode, rowIndex, addRenderedRowEventListener) {
	        var eCheckbox = document.createElement('input');
	        eCheckbox.type = "checkbox";
	        eCheckbox.name = "name";
	        eCheckbox.className = 'ag-selection-checkbox';
	        utils_1.Utils.setCheckboxState(eCheckbox, rowNode.isSelected());
	        eCheckbox.addEventListener('click', function (event) { return event.stopPropagation(); });
	        eCheckbox.addEventListener('change', function () {
	            var newValue = eCheckbox.checked;
	            if (newValue) {
	                rowNode.setSelected(newValue);
	            }
	            else {
	                rowNode.setSelected(newValue);
	            }
	        });
	        var selectionChangedCallback = function () { return utils_1.Utils.setCheckboxState(eCheckbox, rowNode.isSelected()); };
	        rowNode.addEventListener(rowNode_1.RowNode.EVENT_ROW_SELECTED, selectionChangedCallback);
	        addRenderedRowEventListener(renderedRow_1.RenderedRow.EVENT_RENDERED_ROW_REMOVED, function () {
	            rowNode.removeEventListener(rowNode_1.RowNode.EVENT_ROW_SELECTED, selectionChangedCallback);
	        });
	        return eCheckbox;
	    };
	    SelectionRendererFactory = __decorate([
	        context_1.Bean('selectionRendererFactory'), 
	        __metadata('design:paramtypes', [])
	    ], SelectionRendererFactory);
	    return SelectionRendererFactory;
	})();
	exports.SelectionRendererFactory = SelectionRendererFactory;


/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
	 * @version v4.0.3
	 * @link http://www.ag-grid.com/
	 * @license MIT
	 */
	var eventService_1 = __webpack_require__(4);
	var events_1 = __webpack_require__(10);
	var RowNode = (function () {
	    function RowNode(mainEventService, gridOptionsWrapper, selectionController) {
	        this.selected = false;
	        this.mainEventService = mainEventService;
	        this.gridOptionsWrapper = gridOptionsWrapper;
	        this.selectionController = selectionController;
	    }
	    RowNode.prototype.resetQuickFilterAggregateText = function () {
	        this.quickFilterAggregateText = null;
	    };
	    RowNode.prototype.isSelected = function () {
	        // for footers, we just return what our sibling selected state is, as cannot select a footer
	        if (this.footer) {
	            return this.sibling.isSelected();
	        }
	        return this.selected;
	    };
	    RowNode.prototype.deptFirstSearch = function (callback) {
	        if (this.children) {
	            this.children.forEach(function (child) { return child.deptFirstSearch(callback); });
	        }
	        callback(this);
	    };
	    // + rowController.updateGroupsInSelection()
	    RowNode.prototype.calculateSelectedFromChildren = function () {
	        var atLeastOneSelected = false;
	        var atLeastOneDeSelected = false;
	        var atLeastOneMixed = false;
	        var newSelectedValue;
	        if (this.children) {
	            for (var i = 0; i < this.children.length; i++) {
	                var childState = this.children[i].isSelected();
	                switch (childState) {
	                    case true:
	                        atLeastOneSelected = true;
	                        break;
	                    case false:
	                        atLeastOneDeSelected = true;
	                        break;
	                    default:
	                        atLeastOneMixed = true;
	                        break;
	                }
	            }
	        }
	        if (atLeastOneMixed) {
	            newSelectedValue = undefined;
	        }
	        else if (atLeastOneSelected && !atLeastOneDeSelected) {
	            newSelectedValue = true;
	        }
	        else if (!atLeastOneSelected && atLeastOneDeSelected) {
	            newSelectedValue = false;
	        }
	        else {
	            newSelectedValue = undefined;
	        }
	        this.selectThisNode(newSelectedValue);
	    };
	    RowNode.prototype.calculateSelectedFromChildrenBubbleUp = function () {
	        this.calculateSelectedFromChildren();
	        if (this.parent) {
	            this.parent.calculateSelectedFromChildren();
	        }
	    };
	    RowNode.prototype.setSelectedInitialValue = function (selected) {
	        this.selected = selected;
	    };
	    /** Returns true if this row is selected */
	    RowNode.prototype.setSelected = function (newValue, clearSelection, tailingNodeInSequence) {
	        if (clearSelection === void 0) { clearSelection = false; }
	        if (tailingNodeInSequence === void 0) { tailingNodeInSequence = false; }
	        if (this.floating) {
	            console.log('ag-Grid: cannot select floating rows');
	            return;
	        }
	        // if we are a footer, we don't do selection, just pass the info
	        // to the sibling (the parent of the group)
	        if (this.footer) {
	            this.sibling.setSelected(newValue, clearSelection, tailingNodeInSequence);
	            return;
	        }
	        this.selectThisNode(newValue);
	        var groupSelectsChildren = this.gridOptionsWrapper.isGroupSelectsChildren();
	        if (groupSelectsChildren && this.group) {
	            this.selectChildNodes(newValue);
	        }
	        // clear other nodes if not doing multi select
	        var actionWasOnThisNode = !tailingNodeInSequence;
	        if (actionWasOnThisNode) {
	            if (newValue && (clearSelection || !this.gridOptionsWrapper.isRowSelectionMulti())) {
	                this.selectionController.clearOtherNodes(this);
	            }
	            if (groupSelectsChildren && this.parent) {
	                this.parent.calculateSelectedFromChildrenBubbleUp();
	            }
	            // this is the very end of the 'action node', so we are finished all the updates,
	            // include any parent / child changes that this method caused
	            this.mainEventService.dispatchEvent(events_1.Events.EVENT_SELECTION_CHANGED);
	        }
	    };
	    RowNode.prototype.selectThisNode = function (newValue) {
	        if (this.selected !== newValue) {
	            this.selected = newValue;
	            if (this.eventService) {
	                this.eventService.dispatchEvent(RowNode.EVENT_ROW_SELECTED);
	            }
	            var event = { node: this };
	            this.mainEventService.dispatchEvent(events_1.Events.EVENT_ROW_SELECTED, event);
	        }
	    };
	    RowNode.prototype.selectChildNodes = function (newValue) {
	        for (var i = 0; i < this.children.length; i++) {
	            this.children[i].setSelected(newValue, false, true);
	        }
	    };
	    RowNode.prototype.addEventListener = function (eventType, listener) {
	        if (!this.eventService) {
	            this.eventService = new eventService_1.EventService();
	        }
	        this.eventService.addEventListener(eventType, listener);
	    };
	    RowNode.prototype.removeEventListener = function (eventType, listener) {
	        this.eventService.removeEventListener(eventType, listener);
	    };
	    RowNode.EVENT_ROW_SELECTED = 'rowSelected';
	    return RowNode;
	})();
	exports.RowNode = RowNode;


/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
	 * @version v4.0.3
	 * @link http://www.ag-grid.com/
	 * @license MIT
	 */
	var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
	    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
	    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
	    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
	    return c > 3 && r && Object.defineProperty(target, key, r), r;
	};
	var __metadata = (this && this.__metadata) || function (k, v) {
	    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
	};
	var utils_1 = __webpack_require__(7);
	var renderedCell_1 = __webpack_require__(21);
	var rowNode_1 = __webpack_require__(19);
	var gridOptionsWrapper_1 = __webpack_require__(3);
	var columnController_1 = __webpack_require__(13);
	var column_1 = __webpack_require__(15);
	var events_1 = __webpack_require__(10);
	var eventService_1 = __webpack_require__(4);
	var context_1 = __webpack_require__(6);
	var context_2 = __webpack_require__(6);
	var context_3 = __webpack_require__(6);
	var focusedCellController_1 = __webpack_require__(44);
	var constants_1 = __webpack_require__(8);
	var RenderedRow = (function () {
	    function RenderedRow(parentScope, cellRendererMap, rowRenderer, eBodyContainer, ePinnedLeftContainer, ePinnedRightContainer, node, rowIndex) {
	        this.renderedCells = {};
	        this.destroyFunctions = [];
	        this.parentScope = parentScope;
	        this.cellRendererMap = cellRendererMap;
	        this.rowRenderer = rowRenderer;
	        this.eBodyContainer = eBodyContainer;
	        this.ePinnedLeftContainer = ePinnedLeftContainer;
	        this.ePinnedRightContainer = ePinnedRightContainer;
	        this.rowIndex = rowIndex;
	        this.rowNode = node;
	    }
	    RenderedRow.prototype.init = function () {
	        var _this = this;
	        this.pinningLeft = this.columnController.isPinningLeft();
	        this.pinningRight = this.columnController.isPinningRight();
	        this.createContainers();
	        var groupHeaderTakesEntireRow = this.gridOptionsWrapper.isGroupUseEntireRow();
	        this.rowIsHeaderThatSpans = this.rowNode.group && groupHeaderTakesEntireRow;
	        this.scope = this.createChildScopeOrNull(this.rowNode.data);
	        if (this.rowIsHeaderThatSpans) {
	            this.createGroupRow();
	        }
	        else {
	            this.refreshCellsIntoRow();
	        }
	        this.addDynamicStyles();
	        this.addDynamicClasses();
	        this.addRowIds();
	        this.setTopAndHeightCss();
	        this.addRowSelectedListener();
	        this.addCellFocusedListener();
	        this.addColumnListener();
	        this.attachContainers();
	        this.gridOptionsWrapper.executeProcessRowPostCreateFunc({
	            eRow: this.eBodyRow,
	            ePinnedLeftRow: this.ePinnedLeftRow,
	            ePinnedRightRow: this.ePinnedRightRow,
	            node: this.rowNode,
	            api: this.gridOptionsWrapper.getApi(),
	            rowIndex: this.rowIndex,
	            addRenderedRowListener: this.addEventListener.bind(this),
	            columnApi: this.gridOptionsWrapper.getColumnApi(),
	            context: this.gridOptionsWrapper.getContext()
	        });
	        if (this.scope) {
	            this.eLeftCenterAndRightRows.forEach(function (row) { return _this.$compile(row)(_this.scope); });
	        }
	    };
	    RenderedRow.prototype.addColumnListener = function () {
	        var _this = this;
	        var columnListener = this.onColumnChanged.bind(this);
	        this.mainEventService.addEventListener(events_1.Events.EVENT_COLUMN_GROUP_OPENED, columnListener);
	        //this.mainEventService.addEventListener(Events.EVENT_COLUMN_MOVED, columnListener);
	        //this.mainEventService.addEventListener(Events.EVENT_COLUMN_ROW_GROUP_CHANGE, columnListener);
	        //this.mainEventService.addEventListener(Events.EVENT_COLUMN_RESIZED, columnListener);
	        //this.mainEventService.addEventListener(Events.EVENT_COLUMN_VALUE_CHANGE, columnListener);
	        this.mainEventService.addEventListener(events_1.Events.EVENT_COLUMN_VISIBLE, columnListener);
	        this.mainEventService.addEventListener(events_1.Events.EVENT_COLUMN_PINNED, columnListener);
	        this.destroyFunctions.push(function () {
	            _this.mainEventService.removeEventListener(events_1.Events.EVENT_COLUMN_GROUP_OPENED, columnListener);
	            //this.mainEventService.removeEventListener(Events.EVENT_COLUMN_MOVED, columnListener);
	            //this.mainEventService.removeEventListener(Events.EVENT_COLUMN_ROW_GROUP_CHANGE, columnListener);
	            //this.mainEventService.removeEventListener(Events.EVENT_COLUMN_RESIZED, columnListener);
	            //this.mainEventService.removeEventListener(Events.EVENT_COLUMN_VALUE_CHANGE, columnListener);
	            _this.mainEventService.removeEventListener(events_1.Events.EVENT_COLUMN_VISIBLE, columnListener);
	            _this.mainEventService.removeEventListener(events_1.Events.EVENT_COLUMN_PINNED, columnListener);
	        });
	    };
	    RenderedRow.prototype.onColumnChanged = function (event) {
	        // if row is a group row that spans, then it's not impacted by column changes
	        if (this.rowIsHeaderThatSpans) {
	            return;
	        }
	        this.refreshCellsIntoRow();
	    };
	    RenderedRow.prototype.refreshCellsIntoRow = function () {
	        var _this = this;
	        var columns = this.columnController.getAllDisplayedColumns();
	        var renderedCellKeys = Object.keys(this.renderedCells);
	        columns.forEach(function (column) {
	            var renderedCell = _this.getOrCreateCell(column);
	            _this.ensureCellInCorrectRow(renderedCell);
	            renderedCell.checkPinnedClasses();
	            utils_1.Utils.removeFromArray(renderedCellKeys, column.getColId());
	        });
	        // remove old cells from gui, but we don't destroy them, we might use them again
	        renderedCellKeys.forEach(function (key) {
	            var renderedCell = _this.renderedCells[key];
	            // could be old reference, ie removed cell
	            if (!renderedCell) {
	                return;
	            }
	            if (renderedCell.getParentRow()) {
	                renderedCell.getParentRow().removeChild(renderedCell.getGui());
	                renderedCell.setParentRow(null);
	            }
	            renderedCell.destroy();
	            _this.renderedCells[key] = null;
	        });
	    };
	    RenderedRow.prototype.ensureCellInCorrectRow = function (renderedCell) {
	        var eRowGui = renderedCell.getGui();
	        var column = renderedCell.getColumn();
	        var rowWeWant;
	        switch (column.getPinned()) {
	            case column_1.Column.PINNED_LEFT:
	                rowWeWant = this.ePinnedLeftRow;
	                break;
	            case column_1.Column.PINNED_RIGHT:
	                rowWeWant = this.ePinnedRightRow;
	                break;
	            default:
	                rowWeWant = this.eBodyRow;
	                break;
	        }
	        // if in wrong container, remove it
	        var oldRow = renderedCell.getParentRow();
	        var inWrongRow = oldRow !== rowWeWant;
	        if (inWrongRow) {
	            // take out from old row
	            if (oldRow) {
	                oldRow.removeChild(eRowGui);
	            }
	            rowWeWant.appendChild(eRowGui);
	            renderedCell.setParentRow(rowWeWant);
	        }
	    };
	    RenderedRow.prototype.getOrCreateCell = function (column) {
	        var colId = column.getColId();
	        if (this.renderedCells[colId]) {
	            return this.renderedCells[colId];
	        }
	        else {
	            var renderedCell = new renderedCell_1.RenderedCell(column, this.cellRendererMap, this.rowNode, this.rowIndex, this.scope, this);
	            this.context.wireBean(renderedCell);
	            this.renderedCells[colId] = renderedCell;
	            return renderedCell;
	        }
	    };
	    RenderedRow.prototype.addRowSelectedListener = function () {
	        var _this = this;
	        var rowSelectedListener = function () {
	            var selected = _this.rowNode.isSelected();
	            _this.eLeftCenterAndRightRows.forEach(function (row) { return utils_1.Utils.addOrRemoveCssClass(row, 'ag-row-selected', selected); });
	        };
	        this.rowNode.addEventListener(rowNode_1.RowNode.EVENT_ROW_SELECTED, rowSelectedListener);
	        this.destroyFunctions.push(function () {
	            _this.rowNode.removeEventListener(rowNode_1.RowNode.EVENT_ROW_SELECTED, rowSelectedListener);
	        });
	    };
	    RenderedRow.prototype.addCellFocusedListener = function () {
	        var _this = this;
	        var rowFocusedLastTime = null;
	        var rowFocusedListener = function () {
	            var rowFocused = _this.focusedCellController.isRowFocused(_this.rowIndex, _this.rowNode.floating);
	            if (rowFocused !== rowFocusedLastTime) {
	                _this.eLeftCenterAndRightRows.forEach(function (row) { return utils_1.Utils.addOrRemoveCssClass(row, 'ag-row-focus', rowFocused); });
	                _this.eLeftCenterAndRightRows.forEach(function (row) { return utils_1.Utils.addOrRemoveCssClass(row, 'ag-row-no-focus', !rowFocused); });
	                rowFocusedLastTime = rowFocused;
	            }
	        };
	        this.mainEventService.addEventListener(events_1.Events.EVENT_CELL_FOCUSED, rowFocusedListener);
	        this.destroyFunctions.push(function () {
	            _this.mainEventService.removeEventListener(events_1.Events.EVENT_CELL_FOCUSED, rowFocusedListener);
	        });
	        rowFocusedListener();
	    };
	    RenderedRow.prototype.createContainers = function () {
	        this.eBodyRow = this.createRowContainer();
	        this.eLeftCenterAndRightRows = [this.eBodyRow];
	        if (!this.gridOptionsWrapper.isForPrint()) {
	            this.ePinnedLeftRow = this.createRowContainer();
	            this.ePinnedRightRow = this.createRowContainer();
	            this.eLeftCenterAndRightRows.push(this.ePinnedLeftRow);
	            this.eLeftCenterAndRightRows.push(this.ePinnedRightRow);
	        }
	    };
	    RenderedRow.prototype.attachContainers = function () {
	        this.eBodyContainer.appendChild(this.eBodyRow);
	        if (!this.gridOptionsWrapper.isForPrint()) {
	            this.ePinnedLeftContainer.appendChild(this.ePinnedLeftRow);
	            this.ePinnedRightContainer.appendChild(this.ePinnedRightRow);
	        }
	    };
	    RenderedRow.prototype.onMouseEvent = function (eventName, mouseEvent, eventSource, cell) {
	        var renderedCell = this.renderedCells[cell.column.getId()];
	        if (renderedCell) {
	            renderedCell.onMouseEvent(eventName, mouseEvent, eventSource);
	        }
	    };
	    RenderedRow.prototype.setTopAndHeightCss = function () {
	        // if showing scrolls, position on the container
	        if (!this.gridOptionsWrapper.isForPrint()) {
	            var topPx = this.rowNode.rowTop + "px";
	            this.eLeftCenterAndRightRows.forEach(function (row) { return row.style.top = topPx; });
	        }
	        var heightPx = this.rowNode.rowHeight + 'px';
	        this.eLeftCenterAndRightRows.forEach(function (row) { return row.style.height = heightPx; });
	    };
	    // adds in row and row-id attributes to the row
	    RenderedRow.prototype.addRowIds = function () {
	        var rowStr = this.rowIndex.toString();
	        if (this.rowNode.floating === constants_1.Constants.FLOATING_BOTTOM) {
	            rowStr = 'fb-' + rowStr;
	        }
	        else if (this.rowNode.floating === constants_1.Constants.FLOATING_TOP) {
	            rowStr = 'ft-' + rowStr;
	        }
	        this.eLeftCenterAndRightRows.forEach(function (row) { return row.setAttribute('row', rowStr); });
	        if (typeof this.gridOptionsWrapper.getBusinessKeyForNodeFunc() === 'function') {
	            var businessKey = this.gridOptionsWrapper.getBusinessKeyForNodeFunc()(this.rowNode);
	            if (typeof businessKey === 'string' || typeof businessKey === 'number') {
	                this.eLeftCenterAndRightRows.forEach(function (row) { return row.setAttribute('row-id', businessKey); });
	            }
	        }
	    };
	    RenderedRow.prototype.addEventListener = function (eventType, listener) {
	        if (!this.renderedRowEventService) {
	            this.renderedRowEventService = new eventService_1.EventService();
	        }
	        this.renderedRowEventService.addEventListener(eventType, listener);
	    };
	    RenderedRow.prototype.removeEventListener = function (eventType, listener) {
	        this.renderedRowEventService.removeEventListener(eventType, listener);
	    };
	    RenderedRow.prototype.softRefresh = function () {
	        utils_1.Utils.iterateObject(this.renderedCells, function (key, renderedCell) {
	            if (renderedCell && renderedCell.isVolatile()) {
	                renderedCell.refreshCell();
	            }
	        });
	    };
	    RenderedRow.prototype.getRenderedCellForColumn = function (column) {
	        return this.renderedCells[column.getColId()];
	    };
	    RenderedRow.prototype.getCellForCol = function (column) {
	        var renderedCell = this.renderedCells[column.getColId()];
	        if (renderedCell) {
	            return renderedCell.getGui();
	        }
	        else {
	            return null;
	        }
	    };
	    RenderedRow.prototype.destroy = function () {
	        this.destroyFunctions.forEach(function (func) { return func(); });
	        this.destroyScope();
	        this.eBodyContainer.removeChild(this.eBodyRow);
	        if (!this.gridOptionsWrapper.isForPrint()) {
	            this.ePinnedLeftContainer.removeChild(this.ePinnedLeftRow);
	            this.ePinnedRightContainer.removeChild(this.ePinnedRightRow);
	        }
	        utils_1.Utils.iterateObject(this.renderedCells, function (key, renderedCell) {
	            if (renderedCell) {
	                renderedCell.destroy();
	            }
	        });
	        if (this.renderedRowEventService) {
	            this.renderedRowEventService.dispatchEvent(RenderedRow.EVENT_RENDERED_ROW_REMOVED, { node: this.rowNode });
	        }
	    };
	    RenderedRow.prototype.destroyScope = function () {
	        if (this.scope) {
	            this.scope.$destroy();
	            this.scope = null;
	        }
	    };
	    RenderedRow.prototype.isDataInList = function (rows) {
	        return rows.indexOf(this.rowNode.data) >= 0;
	    };
	    RenderedRow.prototype.isGroup = function () {
	        return this.rowNode.group === true;
	    };
	    RenderedRow.prototype.createGroupRow = function () {
	        var eGroupRow = this.createGroupSpanningEntireRowCell(false);
	        if (this.pinningLeft) {
	            this.ePinnedLeftRow.appendChild(eGroupRow);
	            var eGroupRowPadding = this.createGroupSpanningEntireRowCell(true);
	            this.eBodyRow.appendChild(eGroupRowPadding);
	        }
	        else {
	            this.eBodyRow.appendChild(eGroupRow);
	        }
	        if (this.pinningRight) {
	            var ePinnedRightPadding = this.createGroupSpanningEntireRowCell(true);
	            this.ePinnedRightRow.appendChild(ePinnedRightPadding);
	        }
	    };
	    RenderedRow.prototype.createGroupSpanningEntireRowCell = function (padding) {
	        var eRow;
	        // padding means we are on the right hand side of a pinned table, ie
	        // in the main body.
	        if (padding) {
	            eRow = document.createElement('span');
	        }
	        else {
	            var rowCellRenderer = this.gridOptionsWrapper.getGroupRowRenderer();
	            if (!rowCellRenderer) {
	                rowCellRenderer = {
	                    renderer: 'group',
	                    innerRenderer: this.gridOptionsWrapper.getGroupRowInnerRenderer()
	                };
	            }
	            var params = {
	                node: this.rowNode,
	                data: this.rowNode.data,
	                rowIndex: this.rowIndex,
	                api: this.gridOptionsWrapper.getApi(),
	                colDef: {
	                    cellRenderer: rowCellRenderer
	                }
	            };
	            // start duplicated code
	            var actualCellRenderer;
	            if (typeof rowCellRenderer === 'object' && rowCellRenderer !== null) {
	                var cellRendererObj = rowCellRenderer;
	                actualCellRenderer = this.cellRendererMap[cellRendererObj.renderer];
	                if (!actualCellRenderer) {
	                    throw 'Cell renderer ' + rowCellRenderer + ' not found, available are ' + Object.keys(this.cellRendererMap);
	                }
	            }
	            else if (typeof rowCellRenderer === 'function') {
	                actualCellRenderer = rowCellRenderer;
	            }
	            else {
	                throw 'Cell Renderer must be String or Function';
	            }
	            var resultFromRenderer = actualCellRenderer(params);
	            // end duplicated code
	            if (utils_1.Utils.isNodeOrElement(resultFromRenderer)) {
	                // a dom node or element was returned, so add child
	                eRow = resultFromRenderer;
	            }
	            else {
	                // otherwise assume it was html, so just insert
	                eRow = utils_1.Utils.loadTemplate(resultFromRenderer);
	            }
	        }
	        if (this.rowNode.footer) {
	            utils_1.Utils.addCssClass(eRow, 'ag-footer-cell-entire-row');
	        }
	        else {
	            utils_1.Utils.addCssClass(eRow, 'ag-group-cell-entire-row');
	        }
	        return eRow;
	    };
	    RenderedRow.prototype.createChildScopeOrNull = function (data) {
	        if (this.gridOptionsWrapper.isAngularCompileRows()) {
	            var newChildScope = this.parentScope.$new();
	            newChildScope.data = data;
	            return newChildScope;
	        }
	        else {
	            return null;
	        }
	    };
	    RenderedRow.prototype.addDynamicStyles = function () {
	        var rowStyle = this.gridOptionsWrapper.getRowStyle();
	        if (rowStyle) {
	            if (typeof rowStyle === 'function') {
	                console.log('ag-Grid: rowStyle should be an object of key/value styles, not be a function, use getRowStyle() instead');
	            }
	            else {
	                this.eLeftCenterAndRightRows.forEach(function (row) { return utils_1.Utils.addStylesToElement(row, rowStyle); });
	            }
	        }
	        var rowStyleFunc = this.gridOptionsWrapper.getRowStyleFunc();
	        if (rowStyleFunc) {
	            var params = {
	                data: this.rowNode.data,
	                node: this.rowNode,
	                api: this.gridOptionsWrapper.getApi(),
	                context: this.gridOptionsWrapper.getContext(),
	                $scope: this.scope
	            };
	            var cssToUseFromFunc = rowStyleFunc(params);
	            this.eLeftCenterAndRightRows.forEach(function (row) { return utils_1.Utils.addStylesToElement(row, cssToUseFromFunc); });
	        }
	    };
	    RenderedRow.prototype.createParams = function () {
	        var params = {
	            node: this.rowNode,
	            data: this.rowNode.data,
	            rowIndex: this.rowIndex,
	            $scope: this.scope,
	            context: this.gridOptionsWrapper.getContext(),
	            api: this.gridOptionsWrapper.getApi()
	        };
	        return params;
	    };
	    RenderedRow.prototype.createEvent = function (event, eventSource) {
	        var agEvent = this.createParams();
	        agEvent.event = event;
	        agEvent.eventSource = eventSource;
	        return agEvent;
	    };
	    RenderedRow.prototype.createRowContainer = function () {
	        var _this = this;
	        var vRow = document.createElement('div');
	        vRow.addEventListener("click", this.onRowClicked.bind(this));
	        vRow.addEventListener("dblclick", function (event) {
	            var agEvent = _this.createEvent(event, _this);
	            _this.mainEventService.dispatchEvent(events_1.Events.EVENT_ROW_DOUBLE_CLICKED, agEvent);
	        });
	        return vRow;
	    };
	    RenderedRow.prototype.onRowClicked = function (event) {
	        var agEvent = this.createEvent(event, this);
	        this.mainEventService.dispatchEvent(events_1.Events.EVENT_ROW_CLICKED, agEvent);
	        // ctrlKey for windows, metaKey for Apple
	        var multiSelectKeyPressed = event.ctrlKey || event.metaKey;
	        // we do not allow selecting groups by clicking (as the click here expands the group)
	        // so return if it's a group row
	        if (this.rowNode.group) {
	            return;
	        }
	        // we also don't allow selection of floating rows
	        if (this.rowNode.floating) {
	            return;
	        }
	        // making local variables to make the below more readable
	        var gridOptionsWrapper = this.gridOptionsWrapper;
	        // if no selection method enabled, do nothing
	        if (!gridOptionsWrapper.isRowSelection()) {
	            return;
	        }
	        // if click selection suppressed, do nothing
	        if (gridOptionsWrapper.isSuppressRowClickSelection()) {
	            return;
	        }
	        if (this.rowNode.isSelected()) {
	            if (multiSelectKeyPressed) {
	                if (gridOptionsWrapper.isRowDeselection()) {
	                    this.rowNode.setSelected(false);
	                }
	            }
	            else {
	                // selected with no multi key, must make sure anything else is unselected
	                this.rowNode.setSelected(true, true);
	            }
	        }
	        else {
	            this.rowNode.setSelected(true, !multiSelectKeyPressed);
	        }
	    };
	    RenderedRow.prototype.getRowNode = function () {
	        return this.rowNode;
	    };
	    RenderedRow.prototype.getRowIndex = function () {
	        return this.rowIndex;
	    };
	    RenderedRow.prototype.refreshCells = function (colIds) {
	        if (!colIds) {
	            return;
	        }
	        var columnsToRefresh = this.columnController.getColumns(colIds);
	        utils_1.Utils.iterateObject(this.renderedCells, function (key, renderedCell) {
	            if (!renderedCell) {
	                return;
	            }
	            var colForCel = renderedCell.getColumn();
	            if (columnsToRefresh.indexOf(colForCel) >= 0) {
	                renderedCell.refreshCell();
	            }
	        });
	    };
	    RenderedRow.prototype.addDynamicClasses = function () {
	        var _this = this;
	        var classes = [];
	        classes.push('ag-row');
	        classes.push('ag-row-no-focus');
	        classes.push(this.rowIndex % 2 == 0 ? "ag-row-even" : "ag-row-odd");
	        if (this.rowNode.isSelected()) {
	            classes.push("ag-row-selected");
	        }
	        if (this.rowNode.group) {
	            classes.push("ag-row-group");
	            // if a group, put the level of the group in
	            classes.push("ag-row-level-" + this.rowNode.level);
	            if (!this.rowNode.footer && this.rowNode.expanded) {
	                classes.push("ag-row-group-expanded");
	            }
	            if (!this.rowNode.footer && !this.rowNode.expanded) {
	                // opposite of expanded is contracted according to the internet.
	                classes.push("ag-row-group-contracted");
	            }
	            if (this.rowNode.footer) {
	                classes.push("ag-row-footer");
	            }
	        }
	        else {
	            // if a leaf, and a parent exists, put a level of the parent, else put level of 0 for top level item
	            if (this.rowNode.parent) {
	                classes.push("ag-row-level-" + (this.rowNode.parent.level + 1));
	            }
	            else {
	                classes.push("ag-row-level-0");
	            }
	        }
	        // add in extra classes provided by the config
	        var gridOptionsRowClass = this.gridOptionsWrapper.getRowClass();
	        if (gridOptionsRowClass) {
	            if (typeof gridOptionsRowClass === 'function') {
	                console.warn('ag-Grid: rowClass should not be a function, please use getRowClass instead');
	            }
	            else {
	                if (typeof gridOptionsRowClass === 'string') {
	                    classes.push(gridOptionsRowClass);
	                }
	                else if (Array.isArray(gridOptionsRowClass)) {
	                    gridOptionsRowClass.forEach(function (classItem) {
	                        classes.push(classItem);
	                    });
	                }
	            }
	        }
	        var gridOptionsRowClassFunc = this.gridOptionsWrapper.getRowClassFunc();
	        if (gridOptionsRowClassFunc) {
	            var params = {
	                node: this.rowNode,
	                data: this.rowNode.data,
	                rowIndex: this.rowIndex,
	                context: this.gridOptionsWrapper.getContext(),
	                api: this.gridOptionsWrapper.getApi()
	            };
	            var classToUseFromFunc = gridOptionsRowClassFunc(params);
	            if (classToUseFromFunc) {
	                if (typeof classToUseFromFunc === 'string') {
	                    classes.push(classToUseFromFunc);
	                }
	                else if (Array.isArray(classToUseFromFunc)) {
	                    classToUseFromFunc.forEach(function (classItem) {
	                        classes.push(classItem);
	                    });
	                }
	            }
	        }
	        classes.forEach(function (classStr) {
	            _this.eLeftCenterAndRightRows.forEach(function (row) { return utils_1.Utils.addCssClass(row, classStr); });
	        });
	    };
	    RenderedRow.EVENT_RENDERED_ROW_REMOVED = 'renderedRowRemoved';
	    __decorate([
	        context_2.Autowired('gridOptionsWrapper'), 
	        __metadata('design:type', gridOptionsWrapper_1.GridOptionsWrapper)
	    ], RenderedRow.prototype, "gridOptionsWrapper", void 0);
	    __decorate([
	        context_2.Autowired('columnController'), 
	        __metadata('design:type', columnController_1.ColumnController)
	    ], RenderedRow.prototype, "columnController", void 0);
	    __decorate([
	        context_2.Autowired('$compile'), 
	        __metadata('design:type', Object)
	    ], RenderedRow.prototype, "$compile", void 0);
	    __decorate([
	        context_2.Autowired('eventService'), 
	        __metadata('design:type', eventService_1.EventService)
	    ], RenderedRow.prototype, "mainEventService", void 0);
	    __decorate([
	        context_2.Autowired('context'), 
	        __metadata('design:type', context_1.Context)
	    ], RenderedRow.prototype, "context", void 0);
	    __decorate([
	        context_2.Autowired('focusedCellController'), 
	        __metadata('design:type', focusedCellController_1.FocusedCellController)
	    ], RenderedRow.prototype, "focusedCellController", void 0);
	    __decorate([
	        context_3.PostConstruct, 
	        __metadata('design:type', Function), 
	        __metadata('design:paramtypes', []), 
	        __metadata('design:returntype', void 0)
	    ], RenderedRow.prototype, "init", null);
	    return RenderedRow;
	})();
	exports.RenderedRow = RenderedRow;


/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
	 * @version v4.0.3
	 * @link http://www.ag-grid.com/
	 * @license MIT
	 */
	var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
	    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
	    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
	    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
	    return c > 3 && r && Object.defineProperty(target, key, r), r;
	};
	var __metadata = (this && this.__metadata) || function (k, v) {
	    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
	};
	var utils_1 = __webpack_require__(7);
	var column_1 = __webpack_require__(15);
	var gridOptionsWrapper_1 = __webpack_require__(3);
	var expressionService_1 = __webpack_require__(22);
	var selectionRendererFactory_1 = __webpack_require__(18);
	var rowRenderer_1 = __webpack_require__(23);
	var templateService_1 = __webpack_require__(33);
	var columnController_1 = __webpack_require__(13);
	var valueService_1 = __webpack_require__(34);
	var eventService_1 = __webpack_require__(4);
	var constants_1 = __webpack_require__(8);
	var events_1 = __webpack_require__(10);
	var context_1 = __webpack_require__(6);
	var columnController_2 = __webpack_require__(13);
	var gridApi_1 = __webpack_require__(11);
	var context_2 = __webpack_require__(6);
	var focusedCellController_1 = __webpack_require__(44);
	var context_3 = __webpack_require__(6);
	var gridCell_1 = __webpack_require__(31);
	var RenderedCell = (function () {
	    function RenderedCell(column, cellRendererMap, node, rowIndex, scope, renderedRow) {
	        this.destroyMethods = [];
	        this.firstRightPinned = false;
	        this.lastLeftPinned = false;
	        this.column = column;
	        this.cellRendererMap = cellRendererMap;
	        this.node = node;
	        this.rowIndex = rowIndex;
	        this.scope = scope;
	        this.renderedRow = renderedRow;
	    }
	    RenderedCell.prototype.checkPinnedClasses = function () {
	    };
	    RenderedCell.prototype.setPinnedClasses = function () {
	        var _this = this;
	        var firstPinnedChangedListener = function () {
	            if (_this.firstRightPinned !== _this.column.isFirstRightPinned()) {
	                _this.firstRightPinned = _this.column.isFirstRightPinned();
	                utils_1.Utils.addOrRemoveCssClass(_this.eGridCell, 'ag-cell-first-right-pinned', _this.firstRightPinned);
	            }
	            if (_this.lastLeftPinned !== _this.column.isLastLeftPinned()) {
	                _this.lastLeftPinned = _this.column.isLastLeftPinned();
	                utils_1.Utils.addOrRemoveCssClass(_this.eGridCell, 'ag-cell-last-left-pinned', _this.lastLeftPinned);
	            }
	        };
	        this.column.addEventListener(column_1.Column.EVENT_FIRST_RIGHT_PINNED_CHANGED, firstPinnedChangedListener);
	        this.column.addEventListener(column_1.Column.EVENT_LAST_LEFT_PINNED_CHANGED, firstPinnedChangedListener);
	        this.destroyMethods.push(function () {
	            _this.column.removeEventListener(column_1.Column.EVENT_FIRST_RIGHT_PINNED_CHANGED, firstPinnedChangedListener);
	            _this.column.removeEventListener(column_1.Column.EVENT_LAST_LEFT_PINNED_CHANGED, firstPinnedChangedListener);
	        });
	        firstPinnedChangedListener();
	    };
	    RenderedCell.prototype.getParentRow = function () {
	        return this.eParentRow;
	    };
	    RenderedCell.prototype.setParentRow = function (eParentRow) {
	        this.eParentRow = eParentRow;
	    };
	    RenderedCell.prototype.init = function () {
	        this.data = this.getDataForRow();
	        this.value = this.getValue();
	        this.checkboxSelection = this.calculateCheckboxSelection();
	        this.setupComponents();
	    };
	    RenderedCell.prototype.destroy = function () {
	        this.destroyMethods.forEach(function (theFunction) {
	            theFunction();
	        });
	    };
	    RenderedCell.prototype.calculateCheckboxSelection = function () {
	        // never allow selection on floating rows
	        if (this.node.floating) {
	            return false;
	        }
	        // if boolean set, then just use it
	        var colDef = this.column.getColDef();
	        if (typeof colDef.checkboxSelection === 'boolean') {
	            return colDef.checkboxSelection;
	        }
	        // if function, then call the function to find out. we first check colDef for
	        // a function, and if missing then check gridOptions, so colDef has precedence
	        var selectionFunc;
	        if (typeof colDef.checkboxSelection === 'function') {
	            selectionFunc = colDef.checkboxSelection;
	        }
	        if (!selectionFunc && this.gridOptionsWrapper.getCheckboxSelection()) {
	            selectionFunc = this.gridOptionsWrapper.getCheckboxSelection();
	        }
	        if (selectionFunc) {
	            var params = this.createParams();
	            return selectionFunc(params);
	        }
	        return false;
	    };
	    RenderedCell.prototype.getColumn = function () {
	        return this.column;
	    };
	    RenderedCell.prototype.getValue = function () {
	        return this.valueService.getValueUsingSpecificData(this.column, this.data, this.node);
	    };
	    RenderedCell.prototype.getGui = function () {
	        return this.eGridCell;
	    };
	    RenderedCell.prototype.getDataForRow = function () {
	        if (this.node.footer) {
	            // if footer, we always show the data
	            return this.node.data;
	        }
	        else if (this.node.group) {
	            // if header and header is expanded, we show data in footer only
	            var footersEnabled = this.gridOptionsWrapper.isGroupIncludeFooter();
	            var suppressHideHeader = this.gridOptionsWrapper.isGroupSuppressBlankHeader();
	            if (this.node.expanded && footersEnabled && !suppressHideHeader) {
	                return undefined;
	            }
	            else {
	                return this.node.data;
	            }
	        }
	        else {
	            // otherwise it's a normal node, just return data as normal
	            return this.node.data;
	        }
	    };
	    RenderedCell.prototype.setLeftOnCell = function () {
	        var _this = this;
	        var leftChangedListener = function () {
	            var newLeft = _this.column.getLeft();
	            if (utils_1.Utils.exists(newLeft)) {
	                _this.eGridCell.style.left = _this.column.getLeft() + 'px';
	            }
	            else {
	                _this.eGridCell.style.left = '';
	            }
	        };
	        this.column.addEventListener(column_1.Column.EVENT_LEFT_CHANGED, leftChangedListener);
	        this.destroyMethods.push(function () {
	            _this.column.removeEventListener(column_1.Column.EVENT_LEFT_CHANGED, leftChangedListener);
	        });
	        leftChangedListener();
	    };
	    RenderedCell.prototype.addRangeSelectedListener = function () {
	        var _this = this;
	        if (!this.rangeController) {
	            return;
	        }
	        var rangeCountLastTime = 0;
	        var rangeSelectedListener = function () {
	            var rangeCount = _this.rangeController.getCellRangeCount(new gridCell_1.GridCell(_this.rowIndex, _this.node.floating, _this.column));
	            if (rangeCountLastTime !== rangeCount) {
	                utils_1.Utils.addOrRemoveCssClass(_this.eGridCell, 'ag-cell-range-selected', rangeCount !== 0);
	                utils_1.Utils.addOrRemoveCssClass(_this.eGridCell, 'ag-cell-range-selected-1', rangeCount === 1);
	                utils_1.Utils.addOrRemoveCssClass(_this.eGridCell, 'ag-cell-range-selected-2', rangeCount === 2);
	                utils_1.Utils.addOrRemoveCssClass(_this.eGridCell, 'ag-cell-range-selected-3', rangeCount === 3);
	                utils_1.Utils.addOrRemoveCssClass(_this.eGridCell, 'ag-cell-range-selected-4', rangeCount >= 4);
	                rangeCountLastTime = rangeCount;
	            }
	        };
	        this.eventService.addEventListener(events_1.Events.EVENT_RANGE_SELECTION_CHANGED, rangeSelectedListener);
	        this.destroyMethods.push(function () {
	            _this.eventService.removeEventListener(events_1.Events.EVENT_RANGE_SELECTION_CHANGED, rangeSelectedListener);
	        });
	        rangeSelectedListener();
	    };
	    RenderedCell.prototype.addHighlightListener = function () {
	        var _this = this;
	        if (!this.rangeController) {
	            return;
	        }
	        var clipboardListener = function (event) {
	            utils_1.Utils.removeCssClass(_this.eGridCell, 'ag-cell-highlight');
	            utils_1.Utils.removeCssClass(_this.eGridCell, 'ag-cell-highlight-animation');
	            var cellId = new gridCell_1.GridCell(_this.rowIndex, _this.node.floating, _this.column).createId();
	            var shouldFlash = event.cells[cellId];
	            if (shouldFlash) {
	                _this.flashCellForClipboardInteraction();
	            }
	        };
	        this.eventService.addEventListener(events_1.Events.EVENT_FLASH_CELLS, clipboardListener);
	        this.destroyMethods.push(function () {
	            _this.eventService.removeEventListener(events_1.Events.EVENT_FLASH_CELLS, clipboardListener);
	        });
	    };
	    RenderedCell.prototype.flashCellForClipboardInteraction = function () {
	        var _this = this;
	        // so tempted to not put a comment here!!!! but because i'm going to release and enterprise version,
	        // i think maybe i should do....   first thing, we do this in a timeout, to make sure the previous
	        // CSS is cleared, that's the css removal in addClipboardListener() method
	        setTimeout(function () {
	            // once css is cleared, we want to highlight the cells, without any animation
	            utils_1.Utils.addCssClass(_this.eGridCell, 'ag-cell-highlight');
	            setTimeout(function () {
	                // then once that is applied, we remove the highlight with animation
	                utils_1.Utils.removeCssClass(_this.eGridCell, 'ag-cell-highlight');
	                utils_1.Utils.addCssClass(_this.eGridCell, 'ag-cell-highlight-animation');
	                setTimeout(function () {
	                    // and then to leave things as we got them, we remove the animation
	                    utils_1.Utils.removeCssClass(_this.eGridCell, 'ag-cell-highlight-animation');
	                }, 1000);
	            }, 500);
	        }, 0);
	    };
	    RenderedCell.prototype.addCellFocusedListener = function () {
	        var _this = this;
	        // set to null, not false, as we need to set 'ag-cell-no-focus' first time around
	        var cellFocusedLastTime = null;
	        var cellFocusedListener = function (event) {
	            var cellFocused = _this.focusedCellController.isCellFocused(_this.rowIndex, _this.column, _this.node.floating);
	            if (cellFocused !== cellFocusedLastTime) {
	                utils_1.Utils.addOrRemoveCssClass(_this.eGridCell, 'ag-cell-focus', cellFocused);
	                utils_1.Utils.addOrRemoveCssClass(_this.eGridCell, 'ag-cell-no-focus', !cellFocused);
	                cellFocusedLastTime = cellFocused;
	            }
	            if (cellFocused && event && event.forceBrowserFocus) {
	                _this.eGridCell.focus();
	            }
	        };
	        this.eventService.addEventListener(events_1.Events.EVENT_CELL_FOCUSED, cellFocusedListener);
	        this.destroyMethods.push(function () {
	            _this.eventService.removeEventListener(events_1.Events.EVENT_CELL_FOCUSED, cellFocusedListener);
	        });
	        cellFocusedListener();
	    };
	    RenderedCell.prototype.setWidthOnCell = function () {
	        var _this = this;
	        var widthChangedListener = function () {
	            _this.eGridCell.style.width = _this.column.getActualWidth() + "px";
	        };
	        this.column.addEventListener(column_1.Column.EVENT_WIDTH_CHANGED, widthChangedListener);
	        this.destroyMethods.push(function () {
	            _this.column.removeEventListener(column_1.Column.EVENT_WIDTH_CHANGED, widthChangedListener);
	        });
	        widthChangedListener();
	    };
	    RenderedCell.prototype.setupComponents = function () {
	        this.eGridCell = document.createElement('div');
	        this.setLeftOnCell();
	        this.setWidthOnCell();
	        this.setPinnedClasses();
	        this.addRangeSelectedListener();
	        this.addHighlightListener();
	        this.addCellFocusedListener();
	        // only set tab index if cell selection is enabled
	        if (!this.gridOptionsWrapper.isSuppressCellSelection()) {
	            this.eGridCell.setAttribute("tabindex", "-1");
	        }
	        // these are the grid styles, don't change between soft refreshes
	        this.addClasses();
	        this.addCellNavigationHandler();
	        this.createParentOfValue();
	        this.populateCell();
	    };
	    // called by rowRenderer when user navigates via tab key
	    RenderedCell.prototype.startEditing = function (key) {
	        var _this = this;
	        var that = this;
	        this.editingCell = true;
	        utils_1.Utils.removeAllChildren(this.eGridCell);
	        var eInput = document.createElement('input');
	        eInput.type = 'text';
	        utils_1.Utils.addCssClass(eInput, 'ag-cell-edit-input');
	        var startWithOldValue = key !== constants_1.Constants.KEY_BACKSPACE && key !== constants_1.Constants.KEY_DELETE;
	        var value = this.getValue();
	        if (startWithOldValue && value !== null && value !== undefined) {
	            eInput.value = value;
	        }
	        eInput.style.width = (this.column.getActualWidth() - 14) + 'px';
	        this.eGridCell.appendChild(eInput);
	        eInput.focus();
	        eInput.select();
	        var blurListener = function () {
	            that.stopEditing(eInput, blurListener);
	        };
	        //stop entering if we loose focus
	        eInput.addEventListener("blur", blurListener);
	        //stop editing if enter pressed
	        eInput.addEventListener('keypress', function (event) {
	            var key = event.which || event.keyCode;
	            if (key === constants_1.Constants.KEY_ENTER) {
	                _this.stopEditing(eInput, blurListener);
	                _this.focusCell(true);
	            }
	        });
	        //stop editing if enter pressed
	        eInput.addEventListener('keydown', function (event) {
	            var key = event.which || event.keyCode;
	            if (key === constants_1.Constants.KEY_ESCAPE) {
	                _this.stopEditing(eInput, blurListener, true);
	                _this.focusCell(true);
	            }
	        });
	        // tab key doesn't generate keypress, so need keydown to listen for that
	        eInput.addEventListener('keydown', function (event) {
	            var key = event.which || event.keyCode;
	            if (key == constants_1.Constants.KEY_TAB) {
	                that.stopEditing(eInput, blurListener);
	                that.rowRenderer.startEditingNextCell(that.rowIndex, that.column, that.node.floating, event.shiftKey);
	                // we don't want the default tab action, so return false, this stops the event from bubbling
	                event.preventDefault();
	                return false;
	            }
	        });
	    };
	    RenderedCell.prototype.focusCell = function (forceBrowserFocus) {
	        this.focusedCellController.setFocusedCell(this.rowIndex, this.column, this.node.floating, forceBrowserFocus);
	    };
	    RenderedCell.prototype.stopEditing = function (eInput, blurListener, reset) {
	        if (reset === void 0) { reset = false; }
	        this.editingCell = false;
	        var newValue = eInput.value;
	        //If we don't remove the blur listener first, we get:
	        //Uncaught NotFoundError: Failed to execute 'removeChild' on 'Node': The node to be removed is no longer a child of this node. Perhaps it was moved in a 'blur' event handler?
	        eInput.removeEventListener('blur', blurListener);
	        if (!reset) {
	            this.valueService.setValue(this.node, this.column, newValue);
	            this.value = this.getValue();
	        }
	        utils_1.Utils.removeAllChildren(this.eGridCell);
	        if (this.checkboxSelection) {
	            this.eGridCell.appendChild(this.eCellWrapper);
	        }
	        this.refreshCell();
	    };
	    RenderedCell.prototype.createParams = function () {
	        var params = {
	            node: this.node,
	            data: this.node.data,
	            value: this.value,
	            rowIndex: this.rowIndex,
	            colDef: this.column.getColDef(),
	            $scope: this.scope,
	            context: this.gridOptionsWrapper.getContext(),
	            api: this.gridApi,
	            columnApi: this.columnApi
	        };
	        return params;
	    };
	    RenderedCell.prototype.createEvent = function (event, eventSource) {
	        var agEvent = this.createParams();
	        agEvent.event = event;
	        //agEvent.eventSource = eventSource;
	        return agEvent;
	    };
	    RenderedCell.prototype.isCellEditable = function () {
	        if (this.editingCell) {
	            return false;
	        }
	        // never allow editing of groups
	        if (this.node.group) {
	            return false;
	        }
	        return this.column.isCellEditable(this.node);
	    };
	    RenderedCell.prototype.onMouseEvent = function (eventName, mouseEvent, eventSource) {
	        switch (eventName) {
	            case 'click':
	                this.onCellClicked(mouseEvent);
	                break;
	            case 'mousedown':
	                this.onMouseDown();
	                break;
	            case 'dblclick':
	                this.onCellDoubleClicked(mouseEvent, eventSource);
	                break;
	            case 'contextmenu':
	                this.onContextMenu(mouseEvent);
	                break;
	        }
	    };
	    RenderedCell.prototype.onContextMenu = function (mouseEvent) {
	        // to allow us to debug in chrome, we ignore the event if ctrl is pressed,
	        // thus the normal menu is displayed
	        if (mouseEvent.ctrlKey || mouseEvent.metaKey) {
	            return;
	        }
	        var colDef = this.column.getColDef();
	        var agEvent = this.createEvent(mouseEvent);
	        this.eventService.dispatchEvent(events_1.Events.EVENT_CELL_CONTEXT_MENU, agEvent);
	        if (colDef.onCellContextMenu) {
	            colDef.onCellContextMenu(agEvent);
	        }
	        if (this.contextMenuFactory && !this.gridOptionsWrapper.isSuppressContextMenu()) {
	            this.contextMenuFactory.showMenu(this.node, this.column, this.value, mouseEvent);
	            console.log('preventing default');
	            mouseEvent.preventDefault();
	        }
	    };
	    RenderedCell.prototype.onCellDoubleClicked = function (mouseEvent, eventSource) {
	        var colDef = this.column.getColDef();
	        // always dispatch event to eventService
	        var agEvent = this.createEvent(mouseEvent, eventSource);
	        this.eventService.dispatchEvent(events_1.Events.EVENT_CELL_DOUBLE_CLICKED, agEvent);
	        // check if colDef also wants to handle event
	        if (typeof colDef.onCellDoubleClicked === 'function') {
	            colDef.onCellDoubleClicked(agEvent);
	        }
	        if (!this.gridOptionsWrapper.isSingleClickEdit() && this.isCellEditable()) {
	            this.startEditing();
	        }
	    };
	    RenderedCell.prototype.onMouseDown = function () {
	        // we pass false to focusCell, as we don't want the cell to focus
	        // also get the browser focus. if we did, then the cellRenderer could
	        // have a text field in it, for example, and as the user clicks on the
	        // text field, the text field, the focus doesn't get to the text
	        // field, instead to goes to the div behind, making it impossible to
	        // select the text field.
	        this.focusCell(false);
	        // if it's a right click, then if the cell is already in range,
	        // don't change the range, however if the cell is not in a range,
	        // we set a new range
	        if (this.rangeController) {
	            var thisCell = new gridCell_1.GridCell(this.rowIndex, this.node.floating, this.column);
	            var cellAlreadyInRange = this.rangeController.isCellInAnyRange(thisCell);
	            if (!cellAlreadyInRange) {
	                this.rangeController.setRangeToCell(thisCell);
	            }
	        }
	    };
	    RenderedCell.prototype.onCellClicked = function (mouseEvent) {
	        var agEvent = this.createEvent(mouseEvent, this);
	        this.eventService.dispatchEvent(events_1.Events.EVENT_CELL_CLICKED, agEvent);
	        var colDef = this.column.getColDef();
	        if (colDef.onCellClicked) {
	            colDef.onCellClicked(agEvent);
	        }
	        if (this.gridOptionsWrapper.isSingleClickEdit() && this.isCellEditable()) {
	            this.startEditing();
	        }
	    };
	    RenderedCell.prototype.populateCell = function () {
	        // populate
	        this.putDataIntoCell();
	        // style
	        this.addStylesFromCollDef();
	        this.addClassesFromCollDef();
	        this.addClassesFromRules();
	    };
	    RenderedCell.prototype.addStylesFromCollDef = function () {
	        var colDef = this.column.getColDef();
	        if (colDef.cellStyle) {
	            var cssToUse;
	            if (typeof colDef.cellStyle === 'function') {
	                var cellStyleParams = {
	                    value: this.value,
	                    data: this.node.data,
	                    node: this.node,
	                    colDef: colDef,
	                    column: this.column,
	                    $scope: this.scope,
	                    context: this.gridOptionsWrapper.getContext(),
	                    api: this.gridOptionsWrapper.getApi()
	                };
	                var cellStyleFunc = colDef.cellStyle;
	                cssToUse = cellStyleFunc(cellStyleParams);
	            }
	            else {
	                cssToUse = colDef.cellStyle;
	            }
	            if (cssToUse) {
	                utils_1.Utils.addStylesToElement(this.eGridCell, cssToUse);
	            }
	        }
	    };
	    RenderedCell.prototype.addClassesFromCollDef = function () {
	        var _this = this;
	        var colDef = this.column.getColDef();
	        if (colDef.cellClass) {
	            var classToUse;
	            if (typeof colDef.cellClass === 'function') {
	                var cellClassParams = {
	                    value: this.value,
	                    data: this.node.data,
	                    node: this.node,
	                    colDef: colDef,
	                    $scope: this.scope,
	                    context: this.gridOptionsWrapper.getContext(),
	                    api: this.gridOptionsWrapper.getApi()
	                };
	                var cellClassFunc = colDef.cellClass;
	                classToUse = cellClassFunc(cellClassParams);
	            }
	            else {
	                classToUse = colDef.cellClass;
	            }
	            if (typeof classToUse === 'string') {
	                utils_1.Utils.addCssClass(this.eGridCell, classToUse);
	            }
	            else if (Array.isArray(classToUse)) {
	                classToUse.forEach(function (cssClassItem) {
	                    utils_1.Utils.addCssClass(_this.eGridCell, cssClassItem);
	                });
	            }
	        }
	    };
	    RenderedCell.prototype.addClassesFromRules = function () {
	        var colDef = this.column.getColDef();
	        var classRules = colDef.cellClassRules;
	        if (typeof classRules === 'object' && classRules !== null) {
	            var params = {
	                value: this.value,
	                data: this.node.data,
	                node: this.node,
	                colDef: colDef,
	                rowIndex: this.rowIndex,
	                api: this.gridOptionsWrapper.getApi(),
	                context: this.gridOptionsWrapper.getContext()
	            };
	            var classNames = Object.keys(classRules);
	            for (var i = 0; i < classNames.length; i++) {
	                var className = classNames[i];
	                var rule = classRules[className];
	                var resultOfRule;
	                if (typeof rule === 'string') {
	                    resultOfRule = this.expressionService.evaluate(rule, params);
	                }
	                else if (typeof rule === 'function') {
	                    resultOfRule = rule(params);
	                }
	                if (resultOfRule) {
	                    utils_1.Utils.addCssClass(this.eGridCell, className);
	                }
	                else {
	                    utils_1.Utils.removeCssClass(this.eGridCell, className);
	                }
	            }
	        }
	    };
	    // rename this to 'add key event listener
	    RenderedCell.prototype.addCellNavigationHandler = function () {
	        var _this = this;
	        this.eGridCell.addEventListener('keydown', function (event) {
	            if (_this.editingCell) {
	                return;
	            }
	            // only interested on key presses that are directly on this element, not any children elements. this
	            // stops navigation if the user is in, for example, a text field inside the cell, and user hits
	            // on of the keys we are looking for.
	            if (event.target !== _this.eGridCell) {
	                return;
	            }
	            var key = event.which || event.keyCode;
	            var startNavigation = key === constants_1.Constants.KEY_DOWN || key === constants_1.Constants.KEY_UP
	                || key === constants_1.Constants.KEY_LEFT || key === constants_1.Constants.KEY_RIGHT;
	            if (startNavigation) {
	                event.preventDefault();
	                _this.rowRenderer.navigateToNextCell(key, _this.rowIndex, _this.column, _this.node.floating);
	                return;
	            }
	            var startEdit = _this.isKeycodeForStartEditing(key);
	            if (startEdit && _this.isCellEditable()) {
	                _this.startEditing(key);
	                // if we don't prevent default, then the editor that get displayed also picks up the 'enter key'
	                // press, and stops editing immediately, hence giving he user experience that nothing happened
	                event.preventDefault();
	                return;
	            }
	            var selectRow = key === constants_1.Constants.KEY_SPACE;
	            if (selectRow && _this.gridOptionsWrapper.isRowSelection()) {
	                var selected = _this.node.isSelected();
	                if (selected) {
	                    _this.node.setSelected(false);
	                }
	                else {
	                    _this.node.setSelected(true);
	                }
	                event.preventDefault();
	                return;
	            }
	        });
	    };
	    RenderedCell.prototype.isKeycodeForStartEditing = function (key) {
	        return key === constants_1.Constants.KEY_ENTER || key === constants_1.Constants.KEY_BACKSPACE || key === constants_1.Constants.KEY_DELETE;
	    };
	    RenderedCell.prototype.createParentOfValue = function () {
	        if (this.checkboxSelection) {
	            this.eCellWrapper = document.createElement('span');
	            utils_1.Utils.addCssClass(this.eCellWrapper, 'ag-cell-wrapper');
	            this.eGridCell.appendChild(this.eCellWrapper);
	            //this.createSelectionCheckbox();
	            this.eCheckbox = this.selectionRendererFactory.createSelectionCheckbox(this.node, this.rowIndex, this.renderedRow.addEventListener.bind(this.renderedRow));
	            this.eCellWrapper.appendChild(this.eCheckbox);
	            // eventually we call eSpanWithValue.innerHTML = xxx, so cannot include the checkbox (above) in this span
	            this.eSpanWithValue = document.createElement('span');
	            utils_1.Utils.addCssClass(this.eSpanWithValue, 'ag-cell-value');
	            this.eCellWrapper.appendChild(this.eSpanWithValue);
	            this.eParentOfValue = this.eSpanWithValue;
	        }
	        else {
	            utils_1.Utils.addCssClass(this.eGridCell, 'ag-cell-value');
	            this.eParentOfValue = this.eGridCell;
	        }
	    };
	    RenderedCell.prototype.isVolatile = function () {
	        return this.column.getColDef().volatile;
	    };
	    RenderedCell.prototype.refreshCell = function () {
	        utils_1.Utils.removeAllChildren(this.eParentOfValue);
	        this.value = this.getValue();
	        this.populateCell();
	        // if angular compiling, then need to also compile the cell again (angular compiling sucks, please wait...)
	        if (this.gridOptionsWrapper.isAngularCompileRows()) {
	            this.$compile(this.eGridCell)(this.scope);
	        }
	    };
	    RenderedCell.prototype.putDataIntoCell = function () {
	        // template gets preference, then cellRenderer, then do it ourselves
	        var colDef = this.column.getColDef();
	        if (colDef.template) {
	            this.eParentOfValue.innerHTML = colDef.template;
	        }
	        else if (colDef.templateUrl) {
	            var template = this.templateService.getTemplate(colDef.templateUrl, this.refreshCell.bind(this, true));
	            if (template) {
	                this.eParentOfValue.innerHTML = template;
	            }
	        }
	        else if (colDef.floatingCellRenderer && this.node.floating) {
	            this.useCellRenderer(colDef.floatingCellRenderer);
	        }
	        else if (colDef.cellRenderer) {
	            this.useCellRenderer(colDef.cellRenderer);
	        }
	        else {
	            // if we insert undefined, then it displays as the string 'undefined', ugly!
	            if (this.value !== undefined && this.value !== null && this.value !== '') {
	                this.eParentOfValue.innerHTML = this.value.toString();
	            }
	        }
	    };
	    RenderedCell.prototype.useCellRenderer = function (cellRenderer) {
	        var colDef = this.column.getColDef();
	        var rendererParams = {
	            value: this.value,
	            valueGetter: this.getValue,
	            data: this.node.data,
	            node: this.node,
	            colDef: colDef,
	            column: this.column,
	            $scope: this.scope,
	            rowIndex: this.rowIndex,
	            api: this.gridOptionsWrapper.getApi(),
	            context: this.gridOptionsWrapper.getContext(),
	            refreshCell: this.refreshCell.bind(this),
	            eGridCell: this.eGridCell,
	            eParentOfValue: this.eParentOfValue,
	            addRenderedRowListener: this.renderedRow.addEventListener.bind(this.renderedRow)
	        };
	        // start duplicated code
	        var actualCellRenderer;
	        if (typeof cellRenderer === 'object' && cellRenderer !== null) {
	            var cellRendererObj = cellRenderer;
	            actualCellRenderer = this.cellRendererMap[cellRendererObj.renderer];
	            if (!actualCellRenderer) {
	                throw 'Cell renderer ' + cellRenderer + ' not found, available are ' + Object.keys(this.cellRendererMap);
	            }
	        }
	        else if (typeof cellRenderer === 'function') {
	            actualCellRenderer = cellRenderer;
	        }
	        else {
	            throw 'Cell Renderer must be String or Function';
	        }
	        var resultFromRenderer = actualCellRenderer(rendererParams);
	        // end duplicated code
	        if (resultFromRenderer === null || resultFromRenderer === '') {
	            return;
	        }
	        if (utils_1.Utils.isNodeOrElement(resultFromRenderer)) {
	            // a dom node or element was returned, so add child
	            this.eParentOfValue.appendChild(resultFromRenderer);
	        }
	        else {
	            // otherwise assume it was html, so just insert
	            this.eParentOfValue.innerHTML = resultFromRenderer;
	        }
	    };
	    RenderedCell.prototype.addClasses = function () {
	        utils_1.Utils.addCssClass(this.eGridCell, 'ag-cell');
	        this.eGridCell.setAttribute("colId", this.column.getColId());
	        if (this.node.group && this.node.footer) {
	            utils_1.Utils.addCssClass(this.eGridCell, 'ag-footer-cell');
	        }
	        if (this.node.group && !this.node.footer) {
	            utils_1.Utils.addCssClass(this.eGridCell, 'ag-group-cell');
	        }
	    };
	    __decorate([
	        context_1.Autowired('columnApi'), 
	        __metadata('design:type', columnController_2.ColumnApi)
	    ], RenderedCell.prototype, "columnApi", void 0);
	    __decorate([
	        context_1.Autowired('gridApi'), 
	        __metadata('design:type', gridApi_1.GridApi)
	    ], RenderedCell.prototype, "gridApi", void 0);
	    __decorate([
	        context_1.Autowired('gridOptionsWrapper'), 
	        __metadata('design:type', gridOptionsWrapper_1.GridOptionsWrapper)
	    ], RenderedCell.prototype, "gridOptionsWrapper", void 0);
	    __decorate([
	        context_1.Autowired('expressionService'), 
	        __metadata('design:type', expressionService_1.ExpressionService)
	    ], RenderedCell.prototype, "expressionService", void 0);
	    __decorate([
	        context_1.Autowired('selectionRendererFactory'), 
	        __metadata('design:type', selectionRendererFactory_1.SelectionRendererFactory)
	    ], RenderedCell.prototype, "selectionRendererFactory", void 0);
	    __decorate([
	        context_1.Autowired('rowRenderer'), 
	        __metadata('design:type', rowRenderer_1.RowRenderer)
	    ], RenderedCell.prototype, "rowRenderer", void 0);
	    __decorate([
	        context_1.Autowired('$compile'), 
	        __metadata('design:type', Object)
	    ], RenderedCell.prototype, "$compile", void 0);
	    __decorate([
	        context_1.Autowired('templateService'), 
	        __metadata('design:type', templateService_1.TemplateService)
	    ], RenderedCell.prototype, "templateService", void 0);
	    __decorate([
	        context_1.Autowired('valueService'), 
	        __metadata('design:type', valueService_1.ValueService)
	    ], RenderedCell.prototype, "valueService", void 0);
	    __decorate([
	        context_1.Autowired('eventService'), 
	        __metadata('design:type', eventService_1.EventService)
	    ], RenderedCell.prototype, "eventService", void 0);
	    __decorate([
	        context_1.Autowired('columnController'), 
	        __metadata('design:type', columnController_1.ColumnController)
	    ], RenderedCell.prototype, "columnController", void 0);
	    __decorate([
	        context_3.Optional('rangeController'), 
	        __metadata('design:type', Object)
	    ], RenderedCell.prototype, "rangeController", void 0);
	    __decorate([
	        context_1.Autowired('focusedCellController'), 
	        __metadata('design:type', focusedCellController_1.FocusedCellController)
	    ], RenderedCell.prototype, "focusedCellController", void 0);
	    __decorate([
	        context_3.Optional('contextMenuFactory'), 
	        __metadata('design:type', Object)
	    ], RenderedCell.prototype, "contextMenuFactory", void 0);
	    __decorate([
	        context_2.PostConstruct, 
	        __metadata('design:type', Function), 
	        __metadata('design:paramtypes', []), 
	        __metadata('design:returntype', void 0)
	    ], RenderedCell.prototype, "init", null);
	    return RenderedCell;
	})();
	exports.RenderedCell = RenderedCell;


/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
	 * @version v4.0.3
	 * @link http://www.ag-grid.com/
	 * @license MIT
	 */
	var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
	    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
	    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
	    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
	    return c > 3 && r && Object.defineProperty(target, key, r), r;
	};
	var __metadata = (this && this.__metadata) || function (k, v) {
	    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
	};
	var __param = (this && this.__param) || function (paramIndex, decorator) {
	    return function (target, key) { decorator(target, key, paramIndex); }
	};
	var logger_1 = __webpack_require__(5);
	var context_1 = __webpack_require__(6);
	var context_2 = __webpack_require__(6);
	var ExpressionService = (function () {
	    function ExpressionService() {
	        this.expressionToFunctionCache = {};
	    }
	    ExpressionService.prototype.agWire = function (loggerFactory) {
	        this.logger = loggerFactory.create('ExpressionService');
	    };
	    ExpressionService.prototype.evaluate = function (expression, params) {
	        try {
	            var javaScriptFunction = this.createExpressionFunction(expression);
	            var result = javaScriptFunction(params.value, params.context, params.node, params.data, params.colDef, params.rowIndex, params.api, params.getValue);
	            return result;
	        }
	        catch (e) {
	            // the expression failed, which can happen, as it's the client that
	            // provides the expression. so print a nice message
	            this.logger.log('Processing of the expression failed');
	            this.logger.log('Expression = ' + expression);
	            this.logger.log('Exception = ' + e);
	            return null;
	        }
	    };
	    ExpressionService.prototype.createExpressionFunction = function (expression) {
	        // check cache first
	        if (this.expressionToFunctionCache[expression]) {
	            return this.expressionToFunctionCache[expression];
	        }
	        // if not found in cache, return the function
	        var functionBody = this.createFunctionBody(expression);
	        var theFunction = new Function('x, ctx, node, data, colDef, rowIndex, api, getValue', functionBody);
	        // store in cache
	        this.expressionToFunctionCache[expression] = theFunction;
	        return theFunction;
	    };
	    ExpressionService.prototype.createFunctionBody = function (expression) {
	        // if the expression has the 'return' word in it, then use as is,
	        // if not, then wrap it with return and ';' to make a function
	        if (expression.indexOf('return') >= 0) {
	            return expression;
	        }
	        else {
	            return 'return ' + expression + ';';
	        }
	    };
	    __decorate([
	        __param(0, context_2.Qualifier('loggerFactory')), 
	        __metadata('design:type', Function), 
	        __metadata('design:paramtypes', [logger_1.LoggerFactory]), 
	        __metadata('design:returntype', void 0)
	    ], ExpressionService.prototype, "agWire", null);
	    ExpressionService = __decorate([
	        context_1.Bean('expressionService'), 
	        __metadata('design:paramtypes', [])
	    ], ExpressionService);
	    return ExpressionService;
	})();
	exports.ExpressionService = ExpressionService;


/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
	 * @version v4.0.3
	 * @link http://www.ag-grid.com/
	 * @license MIT
	 */
	var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
	    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
	    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
	    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
	    return c > 3 && r && Object.defineProperty(target, key, r), r;
	};
	var __metadata = (this && this.__metadata) || function (k, v) {
	    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
	};
	var __param = (this && this.__param) || function (paramIndex, decorator) {
	    return function (target, key) { decorator(target, key, paramIndex); }
	};
	var utils_1 = __webpack_require__(7);
	var gridOptionsWrapper_1 = __webpack_require__(3);
	var selectionRendererFactory_1 = __webpack_require__(18);
	var gridPanel_1 = __webpack_require__(24);
	var expressionService_1 = __webpack_require__(22);
	var templateService_1 = __webpack_require__(33);
	var valueService_1 = __webpack_require__(34);
	var eventService_1 = __webpack_require__(4);
	var floatingRowModel_1 = __webpack_require__(26);
	var renderedRow_1 = __webpack_require__(20);
	var groupCellRendererFactory_1 = __webpack_require__(35);
	var events_1 = __webpack_require__(10);
	var constants_1 = __webpack_require__(8);
	var context_1 = __webpack_require__(6);
	var context_2 = __webpack_require__(6);
	var gridCore_1 = __webpack_require__(37);
	var columnController_1 = __webpack_require__(13);
	var context_3 = __webpack_require__(6);
	var context_4 = __webpack_require__(6);
	var logger_1 = __webpack_require__(5);
	var context_5 = __webpack_require__(6);
	var focusedCellController_1 = __webpack_require__(44);
	var context_6 = __webpack_require__(6);
	var cellNavigationService_1 = __webpack_require__(46);
	var gridCell_1 = __webpack_require__(31);
	var RowRenderer = (function () {
	    function RowRenderer() {
	        // map of row ids to row objects. keeps track of which elements
	        // are rendered for which rows in the dom.
	        this.renderedRows = {};
	        this.renderedTopFloatingRows = [];
	        this.renderedBottomFloatingRows = [];
	    }
	    RowRenderer.prototype.agWire = function (loggerFactory) {
	        this.logger = this.loggerFactory.create('RowRenderer');
	        this.logger = loggerFactory.create('BalancedColumnTreeBuilder');
	    };
	    RowRenderer.prototype.init = function () {
	        this.cellRendererMap = {
	            'group': groupCellRendererFactory_1.groupCellRendererFactory(this.gridOptionsWrapper, this.selectionRendererFactory, this.expressionService, this.eventService),
	            'default': function (params) {
	                return params.value;
	            }
	        };
	        this.getContainersFromGridPanel();
	        this.eventService.addEventListener(events_1.Events.EVENT_COLUMN_GROUP_OPENED, this.onColumnEvent.bind(this));
	        this.eventService.addEventListener(events_1.Events.EVENT_COLUMN_VISIBLE, this.onColumnEvent.bind(this));
	        this.eventService.addEventListener(events_1.Events.EVENT_COLUMN_RESIZED, this.onColumnEvent.bind(this));
	        this.eventService.addEventListener(events_1.Events.EVENT_COLUMN_PINNED, this.onColumnEvent.bind(this));
	        this.eventService.addEventListener(events_1.Events.EVENT_COLUMN_ROW_GROUP_CHANGE, this.onColumnEvent.bind(this));
	        this.eventService.addEventListener(events_1.Events.EVENT_MODEL_UPDATED, this.refreshView.bind(this));
	        this.eventService.addEventListener(events_1.Events.EVENT_FLOATING_ROW_DATA_CHANGED, this.refreshView.bind(this, null));
	        //this.eventService.addEventListener(Events.EVENT_COLUMN_VALUE_CHANGE, this.refreshView.bind(this, null));
	        //this.eventService.addEventListener(Events.EVENT_COLUMN_EVERYTHING_CHANGED, this.refreshView.bind(this, null));
	        //this.eventService.addEventListener(Events.EVENT_COLUMN_ROW_GROUP_CHANGE, this.refreshView.bind(this, null));
	        this.refreshView();
	    };
	    RowRenderer.prototype.onColumnEvent = function (event) {
	        if (event.isContainerWidthImpacted()) {
	            this.setMainRowWidths();
	        }
	    };
	    RowRenderer.prototype.getContainersFromGridPanel = function () {
	        this.eBodyContainer = this.gridPanel.getBodyContainer();
	        this.ePinnedLeftColsContainer = this.gridPanel.getPinnedLeftColsContainer();
	        this.ePinnedRightColsContainer = this.gridPanel.getPinnedRightColsContainer();
	        this.eFloatingTopContainer = this.gridPanel.getFloatingTopContainer();
	        this.eFloatingTopPinnedLeftContainer = this.gridPanel.getPinnedLeftFloatingTop();
	        this.eFloatingTopPinnedRightContainer = this.gridPanel.getPinnedRightFloatingTop();
	        this.eFloatingBottomContainer = this.gridPanel.getFloatingBottomContainer();
	        this.eFloatingBottomPinnedLeftContainer = this.gridPanel.getPinnedLeftFloatingBottom();
	        this.eFloatingBottomPinnedRightContainer = this.gridPanel.getPinnedRightFloatingBottom();
	        this.eBodyViewport = this.gridPanel.getBodyViewport();
	        this.eAllBodyContainers = [this.eBodyContainer, this.eFloatingBottomContainer,
	            this.eFloatingTopContainer];
	        this.eAllPinnedLeftContainers = [
	            this.ePinnedLeftColsContainer,
	            this.eFloatingBottomPinnedLeftContainer,
	            this.eFloatingTopPinnedLeftContainer];
	        this.eAllPinnedRightContainers = [
	            this.ePinnedRightColsContainer,
	            this.eFloatingBottomPinnedRightContainer,
	            this.eFloatingTopPinnedRightContainer];
	    };
	    RowRenderer.prototype.setRowModel = function (rowModel) {
	        this.rowModel = rowModel;
	    };
	    RowRenderer.prototype.getAllCellsForColumn = function (column) {
	        var eCells = [];
	        utils_1.Utils.iterateObject(this.renderedRows, callback);
	        utils_1.Utils.iterateObject(this.renderedBottomFloatingRows, callback);
	        utils_1.Utils.iterateObject(this.renderedBottomFloatingRows, callback);
	        function callback(key, renderedRow) {
	            var eCell = renderedRow.getCellForCol(column);
	            if (eCell) {
	                eCells.push(eCell);
	            }
	        }
	        return eCells;
	    };
	    RowRenderer.prototype.setMainRowWidths = function () {
	        var mainRowWidth = this.columnController.getBodyContainerWidth() + "px";
	        this.eAllBodyContainers.forEach(function (container) {
	            var unpinnedRows = container.querySelectorAll(".ag-row");
	            for (var i = 0; i < unpinnedRows.length; i++) {
	                unpinnedRows[i].style.width = mainRowWidth;
	            }
	        });
	    };
	    RowRenderer.prototype.refreshAllFloatingRows = function () {
	        this.refreshFloatingRows(this.renderedTopFloatingRows, this.floatingRowModel.getFloatingTopRowData(), this.eFloatingTopPinnedLeftContainer, this.eFloatingTopPinnedRightContainer, this.eFloatingTopContainer);
	        this.refreshFloatingRows(this.renderedBottomFloatingRows, this.floatingRowModel.getFloatingBottomRowData(), this.eFloatingBottomPinnedLeftContainer, this.eFloatingBottomPinnedRightContainer, this.eFloatingBottomContainer);
	    };
	    RowRenderer.prototype.refreshFloatingRows = function (renderedRows, rowNodes, pinnedLeftContainer, pinnedRightContainer, bodyContainer) {
	        var _this = this;
	        renderedRows.forEach(function (row) {
	            row.destroy();
	        });
	        renderedRows.length = 0;
	        // if no cols, don't draw row - can we get rid of this???
	        var columns = this.columnController.getAllDisplayedColumns();
	        if (!columns || columns.length == 0) {
	            return;
	        }
	        if (rowNodes) {
	            rowNodes.forEach(function (node, rowIndex) {
	                var renderedRow = new renderedRow_1.RenderedRow(_this.$scope, _this.cellRendererMap, _this, bodyContainer, pinnedLeftContainer, pinnedRightContainer, node, rowIndex);
	                _this.context.wireBean(renderedRow);
	                renderedRows.push(renderedRow);
	            });
	        }
	    };
	    RowRenderer.prototype.refreshView = function (refreshEvent) {
	        this.logger.log('refreshView');
	        var refreshFromIndex = refreshEvent ? refreshEvent.fromIndex : null;
	        if (!this.gridOptionsWrapper.isForPrint()) {
	            var containerHeight = this.rowModel.getRowCombinedHeight();
	            this.eBodyContainer.style.height = containerHeight + "px";
	            this.ePinnedLeftColsContainer.style.height = containerHeight + "px";
	            this.ePinnedRightColsContainer.style.height = containerHeight + "px";
	        }
	        this.refreshAllVirtualRows(refreshFromIndex);
	        this.refreshAllFloatingRows();
	    };
	    RowRenderer.prototype.softRefreshView = function () {
	        utils_1.Utils.iterateObject(this.renderedRows, function (key, renderedRow) {
	            renderedRow.softRefresh();
	        });
	    };
	    RowRenderer.prototype.addRenderedRowListener = function (eventName, rowIndex, callback) {
	        var renderedRow = this.renderedRows[rowIndex];
	        renderedRow.addEventListener(eventName, callback);
	    };
	    RowRenderer.prototype.refreshRows = function (rowNodes) {
	        if (!rowNodes || rowNodes.length == 0) {
	            return;
	        }
	        // we only need to be worried about rendered rows, as this method is
	        // called to whats rendered. if the row isn't rendered, we don't care
	        var indexesToRemove = [];
	        utils_1.Utils.iterateObject(this.renderedRows, function (key, renderedRow) {
	            var rowNode = renderedRow.getRowNode();
	            if (rowNodes.indexOf(rowNode) >= 0) {
	                indexesToRemove.push(key);
	            }
	        });
	        // remove the rows
	        this.removeVirtualRow(indexesToRemove);
	        // add draw them again
	        this.drawVirtualRows();
	    };
	    RowRenderer.prototype.refreshCells = function (rowNodes, colIds) {
	        if (!rowNodes || rowNodes.length == 0) {
	            return;
	        }
	        // we only need to be worried about rendered rows, as this method is
	        // called to whats rendered. if the row isn't rendered, we don't care
	        utils_1.Utils.iterateObject(this.renderedRows, function (key, renderedRow) {
	            var rowNode = renderedRow.getRowNode();
	            if (rowNodes.indexOf(rowNode) >= 0) {
	                renderedRow.refreshCells(colIds);
	            }
	        });
	    };
	    RowRenderer.prototype.rowDataChanged = function (rows) {
	        // we only need to be worried about rendered rows, as this method is
	        // called to whats rendered. if the row isn't rendered, we don't care
	        var indexesToRemove = [];
	        var renderedRows = this.renderedRows;
	        Object.keys(renderedRows).forEach(function (key) {
	            var renderedRow = renderedRows[key];
	            // see if the rendered row is in the list of rows we have to update
	            if (renderedRow.isDataInList(rows)) {
	                indexesToRemove.push(key);
	            }
	        });
	        // remove the rows
	        this.removeVirtualRow(indexesToRemove);
	        // add draw them again
	        this.drawVirtualRows();
	    };
	    RowRenderer.prototype.agDestroy = function () {
	        var rowsToRemove = Object.keys(this.renderedRows);
	        this.removeVirtualRow(rowsToRemove);
	    };
	    RowRenderer.prototype.refreshAllVirtualRows = function (fromIndex) {
	        // remove all current virtual rows, as they have old data
	        var rowsToRemove = Object.keys(this.renderedRows);
	        this.removeVirtualRow(rowsToRemove, fromIndex);
	        // add in new rows
	        this.drawVirtualRows();
	    };
	    // public - removes the group rows and then redraws them again
	    RowRenderer.prototype.refreshGroupRows = function () {
	        // find all the group rows
	        var rowsToRemove = [];
	        var that = this;
	        Object.keys(this.renderedRows).forEach(function (key) {
	            var renderedRow = that.renderedRows[key];
	            if (renderedRow.isGroup()) {
	                rowsToRemove.push(key);
	            }
	        });
	        // remove the rows
	        this.removeVirtualRow(rowsToRemove);
	        // and draw them back again
	        this.ensureRowsRendered();
	    };
	    // takes array of row indexes
	    RowRenderer.prototype.removeVirtualRow = function (rowsToRemove, fromIndex) {
	        var that = this;
	        // if no fromIndex then set to -1, which will refresh everything
	        var realFromIndex = (typeof fromIndex === 'number') ? fromIndex : -1;
	        rowsToRemove.forEach(function (indexToRemove) {
	            if (indexToRemove >= realFromIndex) {
	                that.unbindVirtualRow(indexToRemove);
	            }
	        });
	    };
	    RowRenderer.prototype.unbindVirtualRow = function (indexToRemove) {
	        var renderedRow = this.renderedRows[indexToRemove];
	        renderedRow.destroy();
	        var event = { node: renderedRow.getRowNode(), rowIndex: indexToRemove };
	        this.eventService.dispatchEvent(events_1.Events.EVENT_VIRTUAL_ROW_REMOVED, event);
	        delete this.renderedRows[indexToRemove];
	    };
	    RowRenderer.prototype.drawVirtualRows = function () {
	        this.workOutFirstAndLastRowsToRender();
	        this.ensureRowsRendered();
	    };
	    RowRenderer.prototype.workOutFirstAndLastRowsToRender = function () {
	        if (!this.rowModel.isRowsToRender()) {
	            this.firstVirtualRenderedRow = 0;
	            this.lastVirtualRenderedRow = -1; // setting to -1 means nothing in range
	            return;
	        }
	        var rowCount = this.rowModel.getRowCount();
	        if (this.gridOptionsWrapper.isForPrint()) {
	            this.firstVirtualRenderedRow = 0;
	            this.lastVirtualRenderedRow = rowCount;
	        }
	        else {
	            var topPixel = this.eBodyViewport.scrollTop;
	            var bottomPixel = topPixel + this.eBodyViewport.offsetHeight;
	            var first = this.rowModel.getRowAtPixel(topPixel);
	            var last = this.rowModel.getRowAtPixel(bottomPixel);
	            //add in buffer
	            var buffer = this.gridOptionsWrapper.getRowBuffer();
	            first = first - buffer;
	            last = last + buffer;
	            // adjust, in case buffer extended actual size
	            if (first < 0) {
	                first = 0;
	            }
	            if (last > rowCount - 1) {
	                last = rowCount - 1;
	            }
	            this.firstVirtualRenderedRow = first;
	            this.lastVirtualRenderedRow = last;
	        }
	    };
	    RowRenderer.prototype.getFirstVirtualRenderedRow = function () {
	        return this.firstVirtualRenderedRow;
	    };
	    RowRenderer.prototype.getLastVirtualRenderedRow = function () {
	        return this.lastVirtualRenderedRow;
	    };
	    RowRenderer.prototype.ensureRowsRendered = function () {
	        //var start = new Date().getTime();
	        var _this = this;
	        // at the end, this array will contain the items we need to remove
	        var rowsToRemove = Object.keys(this.renderedRows);
	        // add in new rows
	        for (var rowIndex = this.firstVirtualRenderedRow; rowIndex <= this.lastVirtualRenderedRow; rowIndex++) {
	            // see if item already there, and if yes, take it out of the 'to remove' array
	            if (rowsToRemove.indexOf(rowIndex.toString()) >= 0) {
	                rowsToRemove.splice(rowsToRemove.indexOf(rowIndex.toString()), 1);
	                continue;
	            }
	            // check this row actually exists (in case overflow buffer window exceeds real data)
	            var node = this.rowModel.getRow(rowIndex);
	            if (node) {
	                this.insertRow(node, rowIndex);
	            }
	        }
	        // at this point, everything in our 'rowsToRemove' . . .
	        this.removeVirtualRow(rowsToRemove);
	        // if we are doing angular compiling, then do digest the scope here
	        if (this.gridOptionsWrapper.isAngularCompileRows()) {
	            // we do it in a timeout, in case we are already in an apply
	            setTimeout(function () { _this.$scope.$apply(); }, 0);
	        }
	        //var end = new Date().getTime();
	        //console.log(end-start);
	    };
	    RowRenderer.prototype.onMouseEvent = function (eventName, mouseEvent, eventSource, cell) {
	        var renderedRow;
	        switch (cell.floating) {
	            case constants_1.Constants.FLOATING_TOP:
	                renderedRow = this.renderedTopFloatingRows[cell.rowIndex];
	                break;
	            case constants_1.Constants.FLOATING_BOTTOM:
	                renderedRow = this.renderedBottomFloatingRows[cell.rowIndex];
	                break;
	            default:
	                renderedRow = this.renderedRows[cell.rowIndex];
	                break;
	        }
	        if (renderedRow) {
	            renderedRow.onMouseEvent(eventName, mouseEvent, eventSource, cell);
	        }
	    };
	    RowRenderer.prototype.insertRow = function (node, rowIndex) {
	        var columns = this.columnController.getAllDisplayedColumns();
	        // if no cols, don't draw row
	        if (!columns || columns.length == 0) {
	            return;
	        }
	        var renderedRow = new renderedRow_1.RenderedRow(this.$scope, this.cellRendererMap, this, this.eBodyContainer, this.ePinnedLeftColsContainer, this.ePinnedRightColsContainer, node, rowIndex);
	        this.context.wireBean(renderedRow);
	        this.renderedRows[rowIndex] = renderedRow;
	    };
	    RowRenderer.prototype.getRenderedNodes = function () {
	        var renderedRows = this.renderedRows;
	        return Object.keys(renderedRows).map(function (key) {
	            return renderedRows[key].getRowNode();
	        });
	    };
	    // we use index for rows, but column object for columns, as the next column (by index) might not
	    // be visible (header grouping) so it's not reliable, so using the column object instead.
	    RowRenderer.prototype.navigateToNextCell = function (key, rowIndex, column, floating) {
	        var nextCell = new gridCell_1.GridCell(rowIndex, floating, column);
	        // we keep searching for a next cell until we find one. this is how the group rows get skipped
	        while (true) {
	            nextCell = this.cellNavigationService.getNextCellToFocus(key, nextCell);
	            if (utils_1.Utils.missing(nextCell)) {
	                break;
	            }
	            var skipGroupRows = this.gridOptionsWrapper.isGroupUseEntireRow();
	            if (skipGroupRows) {
	                var rowNode = this.rowModel.getRow(nextCell.rowIndex);
	                if (!rowNode.group) {
	                    break;
	                }
	            }
	            else {
	                break;
	            }
	        }
	        // no next cell means we have reached a grid boundary, eg left, right, top or bottom of grid
	        if (!nextCell) {
	            return;
	        }
	        // this scrolls the row into view
	        if (utils_1.Utils.missing(nextCell.floating)) {
	            this.gridPanel.ensureIndexVisible(nextCell.rowIndex);
	        }
	        if (!nextCell.column.isPinned()) {
	            this.gridPanel.ensureColumnVisible(nextCell.column);
	        }
	        // need to nudge the scrolls for the floating items. otherwise when we set focus on a non-visible
	        // floating cell, the scrolls get out of sync
	        this.gridPanel.horizontallyScrollHeaderCenterAndFloatingCenter();
	        this.focusedCellController.setFocusedCell(nextCell.rowIndex, nextCell.column, nextCell.floating, true);
	        if (this.rangeController) {
	            this.rangeController.setRangeToCell(new gridCell_1.GridCell(nextCell.rowIndex, nextCell.floating, nextCell.column));
	        }
	    };
	    // called by the cell, when tab is pressed while editing
	    RowRenderer.prototype.startEditingNextCell = function (rowIndex, column, floating, shiftKey) {
	        var nextCell = new gridCell_1.GridCell(rowIndex, floating, column);
	        while (true) {
	            if (shiftKey) {
	                nextCell = this.cellNavigationService.getNextTabbedCellBackwards(nextCell);
	            }
	            else {
	                nextCell = this.cellNavigationService.getNextTabbedCellForwards(nextCell);
	            }
	            var nextRenderedRow;
	            switch (nextCell.floating) {
	                case constants_1.Constants.FLOATING_TOP:
	                    nextRenderedRow = this.renderedTopFloatingRows[nextCell.rowIndex];
	                    break;
	                case constants_1.Constants.FLOATING_BOTTOM:
	                    nextRenderedRow = this.renderedBottomFloatingRows[nextCell.rowIndex];
	                    break;
	                default:
	                    nextRenderedRow = this.renderedRows[nextCell.rowIndex];
	                    break;
	            }
	            if (!nextRenderedRow) {
	                // this happens if we are on floating row and try to jump to body
	                return;
	            }
	            var nextRenderedCell = nextRenderedRow.getRenderedCellForColumn(nextCell.column);
	            if (nextRenderedCell.isCellEditable()) {
	                // this scrolls the row into view
	                if (utils_1.Utils.missing(nextCell.floating)) {
	                    this.gridPanel.ensureIndexVisible(nextCell.rowIndex);
	                }
	                this.gridPanel.ensureColumnVisible(nextCell.column);
	                // need to nudge the scrolls for the floating items. otherwise when we set focus on a non-visible
	                // floating cell, the scrolls get out of sync
	                this.gridPanel.horizontallyScrollHeaderCenterAndFloatingCenter();
	                nextRenderedCell.startEditing();
	                nextRenderedCell.focusCell(false);
	                if (this.rangeController) {
	                    this.rangeController.setRangeToCell(new gridCell_1.GridCell(nextCell.rowIndex, nextCell.floating, nextCell.column));
	                }
	                return;
	            }
	        }
	    };
	    __decorate([
	        context_4.Autowired('columnController'), 
	        __metadata('design:type', columnController_1.ColumnController)
	    ], RowRenderer.prototype, "columnController", void 0);
	    __decorate([
	        context_4.Autowired('gridOptionsWrapper'), 
	        __metadata('design:type', gridOptionsWrapper_1.GridOptionsWrapper)
	    ], RowRenderer.prototype, "gridOptionsWrapper", void 0);
	    __decorate([
	        context_4.Autowired('gridCore'), 
	        __metadata('design:type', gridCore_1.GridCore)
	    ], RowRenderer.prototype, "gridCore", void 0);
	    __decorate([
	        context_4.Autowired('selectionRendererFactory'), 
	        __metadata('design:type', selectionRendererFactory_1.SelectionRendererFactory)
	    ], RowRenderer.prototype, "selectionRendererFactory", void 0);
	    __decorate([
	        context_4.Autowired('gridPanel'), 
	        __metadata('design:type', gridPanel_1.GridPanel)
	    ], RowRenderer.prototype, "gridPanel", void 0);
	    __decorate([
	        context_4.Autowired('$compile'), 
	        __metadata('design:type', Object)
	    ], RowRenderer.prototype, "$compile", void 0);
	    __decorate([
	        context_4.Autowired('$scope'), 
	        __metadata('design:type', Object)
	    ], RowRenderer.prototype, "$scope", void 0);
	    __decorate([
	        context_4.Autowired('expressionService'), 
	        __metadata('design:type', expressionService_1.ExpressionService)
	    ], RowRenderer.prototype, "expressionService", void 0);
	    __decorate([
	        context_4.Autowired('templateService'), 
	        __metadata('design:type', templateService_1.TemplateService)
	    ], RowRenderer.prototype, "templateService", void 0);
	    __decorate([
	        context_4.Autowired('valueService'), 
	        __metadata('design:type', valueService_1.ValueService)
	    ], RowRenderer.prototype, "valueService", void 0);
	    __decorate([
	        context_4.Autowired('eventService'), 
	        __metadata('design:type', eventService_1.EventService)
	    ], RowRenderer.prototype, "eventService", void 0);
	    __decorate([
	        context_4.Autowired('floatingRowModel'), 
	        __metadata('design:type', floatingRowModel_1.FloatingRowModel)
	    ], RowRenderer.prototype, "floatingRowModel", void 0);
	    __decorate([
	        context_4.Autowired('context'), 
	        __metadata('design:type', context_3.Context)
	    ], RowRenderer.prototype, "context", void 0);
	    __decorate([
	        context_4.Autowired('loggerFactory'), 
	        __metadata('design:type', logger_1.LoggerFactory)
	    ], RowRenderer.prototype, "loggerFactory", void 0);
	    __decorate([
	        context_4.Autowired('rowModel'), 
	        __metadata('design:type', Object)
	    ], RowRenderer.prototype, "rowModel", void 0);
	    __decorate([
	        context_4.Autowired('focusedCellController'), 
	        __metadata('design:type', focusedCellController_1.FocusedCellController)
	    ], RowRenderer.prototype, "focusedCellController", void 0);
	    __decorate([
	        context_6.Optional('rangeController'), 
	        __metadata('design:type', Object)
	    ], RowRenderer.prototype, "rangeController", void 0);
	    __decorate([
	        context_4.Autowired('cellNavigationService'), 
	        __metadata('design:type', cellNavigationService_1.CellNavigationService)
	    ], RowRenderer.prototype, "cellNavigationService", void 0);
	    __decorate([
	        __param(0, context_2.Qualifier('loggerFactory')), 
	        __metadata('design:type', Function), 
	        __metadata('design:paramtypes', [logger_1.LoggerFactory]), 
	        __metadata('design:returntype', void 0)
	    ], RowRenderer.prototype, "agWire", null);
	    __decorate([
	        context_5.PostConstruct, 
	        __metadata('design:type', Function), 
	        __metadata('design:paramtypes', []), 
	        __metadata('design:returntype', void 0)
	    ], RowRenderer.prototype, "init", null);
	    RowRenderer = __decorate([
	        context_1.Bean('rowRenderer'), 
	        __metadata('design:paramtypes', [])
	    ], RowRenderer);
	    return RowRenderer;
	})();
	exports.RowRenderer = RowRenderer;


/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
	 * @version v4.0.3
	 * @link http://www.ag-grid.com/
	 * @license MIT
	 */
	var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
	    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
	    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
	    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
	    return c > 3 && r && Object.defineProperty(target, key, r), r;
	};
	var __metadata = (this && this.__metadata) || function (k, v) {
	    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
	};
	var __param = (this && this.__param) || function (paramIndex, decorator) {
	    return function (target, key) { decorator(target, key, paramIndex); }
	};
	var utils_1 = __webpack_require__(7);
	var masterSlaveService_1 = __webpack_require__(25);
	var gridOptionsWrapper_1 = __webpack_require__(3);
	var columnController_1 = __webpack_require__(13);
	var rowRenderer_1 = __webpack_require__(23);
	var floatingRowModel_1 = __webpack_require__(26);
	var borderLayout_1 = __webpack_require__(27);
	var logger_1 = __webpack_require__(5);
	var context_1 = __webpack_require__(6);
	var context_2 = __webpack_require__(6);
	var context_3 = __webpack_require__(6);
	var eventService_1 = __webpack_require__(4);
	var events_1 = __webpack_require__(10);
	var context_4 = __webpack_require__(6);
	var dragService_1 = __webpack_require__(28);
	var constants_1 = __webpack_require__(8);
	var selectionController_1 = __webpack_require__(29);
	var csvCreator_1 = __webpack_require__(12);
	var context_5 = __webpack_require__(6);
	var mouseEventService_1 = __webpack_require__(30);
	// in the html below, it is important that there are no white space between some of the divs, as if there is white space,
	// it won't render correctly in safari, as safari renders white space as a gap
	var gridHtml = '<div>' +
	    // header
	    '<div class="ag-header">' +
	    '<div class="ag-pinned-left-header"></div>' +
	    '<div class="ag-pinned-right-header"></div>' +
	    '<div class="ag-header-viewport">' +
	    '<div class="ag-header-container"></div>' +
	    '</div>' +
	    '<div class="ag-header-overlay"></div>' +
	    '</div>' +
	    // floating top
	    '<div class="ag-floating-top">' +
	    '<div class="ag-pinned-left-floating-top"></div>' +
	    '<div class="ag-pinned-right-floating-top"></div>' +
	    '<div class="ag-floating-top-viewport">' +
	    '<div class="ag-floating-top-container"></div>' +
	    '</div>' +
	    '</div>' +
	    // floating bottom
	    '<div class="ag-floating-bottom">' +
	    '<div class="ag-pinned-left-floating-bottom"></div>' +
	    '<div class="ag-pinned-right-floating-bottom"></div>' +
	    '<div class="ag-floating-bottom-viewport">' +
	    '<div class="ag-floating-bottom-container"></div>' +
	    '</div>' +
	    '</div>' +
	    // body
	    '<div class="ag-body">' +
	    '<div class="ag-pinned-left-cols-viewport">' +
	    '<div class="ag-pinned-left-cols-container"></div>' +
	    '</div>' +
	    '<div class="ag-pinned-right-cols-viewport">' +
	    '<div class="ag-pinned-right-cols-container"></div>' +
	    '</div>' +
	    '<div class="ag-body-viewport-wrapper">' +
	    '<div class="ag-body-viewport">' +
	    '<div class="ag-body-container"></div>' +
	    '</div>' +
	    '</div>' +
	    '</div>' +
	    '</div>';
	var gridForPrintHtml = '<div>' +
	    // header
	    '<div class="ag-header-container"></div>' +
	    // floating
	    '<div class="ag-floating-top-container"></div>' +
	    // body
	    '<div class="ag-body-container"></div>' +
	    // floating bottom
	    '<div class="ag-floating-bottom-container"></div>' +
	    '</div>';
	// wrapping in outer div, and wrapper, is needed to center the loading icon
	// The idea for centering came from here: http://www.vanseodesign.com/css/vertical-centering/
	var mainOverlayTemplate = '<div class="ag-overlay-panel">' +
	    '<div class="ag-overlay-wrapper ag-overlay-[OVERLAY_NAME]-wrapper">[OVERLAY_TEMPLATE]</div>' +
	    '</div>';
	var defaultLoadingOverlayTemplate = '<span class="ag-overlay-loading-center">[LOADING...]</span>';
	var defaultNoRowsOverlayTemplate = '<span class="ag-overlay-no-rows-center">[NO_ROWS_TO_SHOW]</span>';
	var GridPanel = (function () {
	    function GridPanel() {
	        this.scrollLagCounter = 0;
	        this.lastLeftPosition = -1;
	        this.lastTopPosition = -1;
	        this.animationThreadCount = 0;
	    }
	    GridPanel.prototype.agWire = function (loggerFactory) {
	        // makes code below more readable if we pull 'forPrint' out
	        this.forPrint = this.gridOptionsWrapper.isForPrint();
	        this.scrollWidth = utils_1.Utils.getScrollbarWidth();
	        this.logger = loggerFactory.create('GridPanel');
	        this.findElements();
	    };
	    GridPanel.prototype.onRowDataChanged = function () {
	        if (this.rowModel.isEmpty() && !this.gridOptionsWrapper.isSuppressNoRowsOverlay()) {
	            this.showNoRowsOverlay();
	        }
	        else {
	            this.hideOverlay();
	        }
	    };
	    GridPanel.prototype.getLayout = function () {
	        return this.layout;
	    };
	    GridPanel.prototype.init = function () {
	        this.addEventListeners();
	        this.addDragListeners();
	        this.layout = new borderLayout_1.BorderLayout({
	            overlays: {
	                loading: utils_1.Utils.loadTemplate(this.createLoadingOverlayTemplate()),
	                noRows: utils_1.Utils.loadTemplate(this.createNoRowsOverlayTemplate())
	            },
	            center: this.eRoot,
	            dontFill: this.forPrint,
	            name: 'eGridPanel'
	        });
	        this.layout.addSizeChangeListener(this.sizeHeaderAndBody.bind(this));
	        this.addScrollListener();
	        if (this.gridOptionsWrapper.isSuppressHorizontalScroll()) {
	            this.eBodyViewport.style.overflowX = 'hidden';
	        }
	        if (this.gridOptionsWrapper.isRowModelDefault() && !this.gridOptionsWrapper.getRowData()) {
	            this.showLoadingOverlay();
	        }
	        this.setWidthsOfContainers();
	        this.showPinnedColContainersIfNeeded();
	        this.sizeHeaderAndBody();
	        this.disableBrowserDragging();
	        this.addShortcutKeyListeners();
	        this.addCellListeners();
	    };
	    // if we do not do this, then the user can select a pic in the grid (eg an image in a custom cell renderer)
	    // and then that will start the browser native drag n' drop, which messes up with our own drag and drop.
	    GridPanel.prototype.disableBrowserDragging = function () {
	        this.eRoot.addEventListener('dragstart', function (event) {
	            if (event.target instanceof HTMLImageElement) {
	                event.preventDefault();
	                return false;
	            }
	        });
	    };
	    GridPanel.prototype.addEventListeners = function () {
	        this.eventService.addEventListener(events_1.Events.EVENT_COLUMN_EVERYTHING_CHANGED, this.onColumnsChanged.bind(this));
	        this.eventService.addEventListener(events_1.Events.EVENT_COLUMN_GROUP_OPENED, this.onColumnsChanged.bind(this));
	        this.eventService.addEventListener(events_1.Events.EVENT_COLUMN_MOVED, this.onColumnsChanged.bind(this));
	        this.eventService.addEventListener(events_1.Events.EVENT_COLUMN_ROW_GROUP_CHANGE, this.onColumnsChanged.bind(this));
	        this.eventService.addEventListener(events_1.Events.EVENT_COLUMN_RESIZED, this.onColumnsChanged.bind(this));
	        //this.eventService.addEventListener(Events.EVENT_COLUMN_VALUE_CHANGE, this.onColumnsChanged.bind(this));
	        this.eventService.addEventListener(events_1.Events.EVENT_COLUMN_VISIBLE, this.onColumnsChanged.bind(this));
	        this.eventService.addEventListener(events_1.Events.EVENT_COLUMN_PINNED, this.onColumnsChanged.bind(this));
	        this.eventService.addEventListener(events_1.Events.EVENT_FLOATING_ROW_DATA_CHANGED, this.sizeHeaderAndBody.bind(this));
	        this.eventService.addEventListener(events_1.Events.EVENT_HEADER_HEIGHT_CHANGED, this.sizeHeaderAndBody.bind(this));
	        this.eventService.addEventListener(events_1.Events.EVENT_ROW_DATA_CHANGED, this.onRowDataChanged.bind(this));
	    };
	    GridPanel.prototype.addDragListeners = function () {
	        var _this = this;
	        if (this.forPrint // no range select when doing 'for print'
	            || !this.gridOptionsWrapper.isEnableRangeSelection() // no range selection if no property
	            || utils_1.Utils.missing(this.rangeController)) {
	            return;
	        }
	        var containers = [this.ePinnedLeftColsContainer, this.ePinnedRightColsContainer, this.eBodyContainer,
	            this.eFloatingTop, this.eFloatingBottom];
	        containers.forEach(function (container) {
	            _this.dragService.addDragSource({
	                dragStartPixels: 0,
	                eElement: container,
	                onDragStart: _this.rangeController.onDragStart.bind(_this.rangeController),
	                onDragStop: _this.rangeController.onDragStop.bind(_this.rangeController),
	                onDragging: _this.rangeController.onDragging.bind(_this.rangeController)
	            });
	        });
	    };
	    GridPanel.prototype.addCellListeners = function () {
	        var _this = this;
	        var eventNames = ['click', 'mousedown', 'dblclick', 'contextmenu'];
	        var that = this;
	        eventNames.forEach(function (eventName) {
	            _this.eAllCellContainers.forEach(function (container) {
	                return container.addEventListener(eventName, function (mouseEvent) {
	                    var eventSource = this;
	                    that.processMouseEvent(eventName, mouseEvent, eventSource);
	                });
	            });
	        });
	    };
	    GridPanel.prototype.processMouseEvent = function (eventName, mouseEvent, eventSource) {
	        var cell = this.mouseEventService.getCellForMouseEvent(mouseEvent);
	        if (utils_1.Utils.exists(cell)) {
	            //console.log(`row = ${cell.rowIndex}, floating = ${floating}`);
	            this.rowRenderer.onMouseEvent(eventName, mouseEvent, eventSource, cell);
	        }
	    };
	    GridPanel.prototype.addShortcutKeyListeners = function () {
	        var _this = this;
	        this.eAllCellContainers.forEach(function (container) {
	            container.addEventListener('keydown', function (event) {
	                if (event.ctrlKey || event.metaKey) {
	                    switch (event.which) {
	                        case constants_1.Constants.KEY_A: return _this.onCtrlAndA(event);
	                        case constants_1.Constants.KEY_C: return _this.onCtrlAndC(event);
	                        case constants_1.Constants.KEY_V: return _this.onCtrlAndV(event);
	                    }
	                }
	            });
	        });
	    };
	    GridPanel.prototype.onCtrlAndA = function (event) {
	        if (this.rangeController && this.rowModel.isRowsToRender()) {
	            var rowEnd;
	            var floatingStart;
	            var floatingEnd;
	            if (this.floatingRowModel.isEmpty(constants_1.Constants.FLOATING_TOP)) {
	                floatingStart = null;
	            }
	            else {
	                floatingStart = constants_1.Constants.FLOATING_TOP;
	            }
	            if (this.floatingRowModel.isEmpty(constants_1.Constants.FLOATING_BOTTOM)) {
	                floatingEnd = null;
	                rowEnd = this.rowModel.getRowCount() - 1;
	            }
	            else {
	                floatingEnd = constants_1.Constants.FLOATING_BOTTOM;
	                rowEnd = this.floatingRowModel.getFloatingBottomRowData().length = 1;
	            }
	            var allDisplayedColumns = this.columnController.getAllDisplayedColumns();
	            if (utils_1.Utils.missingOrEmpty(allDisplayedColumns)) {
	                return;
	            }
	            this.rangeController.setRange({
	                rowStart: 0,
	                floatingStart: floatingStart,
	                rowEnd: rowEnd,
	                floatingEnd: floatingEnd,
	                columnStart: allDisplayedColumns[0],
	                columnEnd: allDisplayedColumns[allDisplayedColumns.length - 1]
	            });
	        }
	        event.preventDefault();
	        return false;
	    };
	    GridPanel.prototype.onCtrlAndC = function (event) {
	        if (!this.clipboardService) {
	            return;
	        }
	        this.clipboardService.copyToClipboard();
	        event.preventDefault();
	        return false;
	    };
	    GridPanel.prototype.onCtrlAndV = function (event) {
	        if (!this.clipboardService) {
	            return;
	        }
	        this.clipboardService.pasteFromClipboard();
	        //event.preventDefault();
	        return false;
	    };
	    GridPanel.prototype.getPinnedLeftFloatingTop = function () {
	        return this.ePinnedLeftFloatingTop;
	    };
	    GridPanel.prototype.getPinnedRightFloatingTop = function () {
	        return this.ePinnedRightFloatingTop;
	    };
	    GridPanel.prototype.getFloatingTopContainer = function () {
	        return this.eFloatingTopContainer;
	    };
	    GridPanel.prototype.getPinnedLeftFloatingBottom = function () {
	        return this.ePinnedLeftFloatingBottom;
	    };
	    GridPanel.prototype.getPinnedRightFloatingBottom = function () {
	        return this.ePinnedRightFloatingBottom;
	    };
	    GridPanel.prototype.getFloatingBottomContainer = function () {
	        return this.eFloatingBottomContainer;
	    };
	    GridPanel.prototype.createOverlayTemplate = function (name, defaultTemplate, userProvidedTemplate) {
	        var template = mainOverlayTemplate
	            .replace('[OVERLAY_NAME]', name);
	        if (userProvidedTemplate) {
	            template = template.replace('[OVERLAY_TEMPLATE]', userProvidedTemplate);
	        }
	        else {
	            template = template.replace('[OVERLAY_TEMPLATE]', defaultTemplate);
	        }
	        return template;
	    };
	    GridPanel.prototype.createLoadingOverlayTemplate = function () {
	        var userProvidedTemplate = this.gridOptionsWrapper.getOverlayLoadingTemplate();
	        var templateNotLocalised = this.createOverlayTemplate('loading', defaultLoadingOverlayTemplate, userProvidedTemplate);
	        var localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
	        var templateLocalised = templateNotLocalised.replace('[LOADING...]', localeTextFunc('loadingOoo', 'Loading...'));
	        return templateLocalised;
	    };
	    GridPanel.prototype.createNoRowsOverlayTemplate = function () {
	        var userProvidedTemplate = this.gridOptionsWrapper.getOverlayNoRowsTemplate();
	        var templateNotLocalised = this.createOverlayTemplate('no-rows', defaultNoRowsOverlayTemplate, userProvidedTemplate);
	        var localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
	        var templateLocalised = templateNotLocalised.replace('[NO_ROWS_TO_SHOW]', localeTextFunc('noRowsToShow', 'No Rows To Show'));
	        return templateLocalised;
	    };
	    GridPanel.prototype.ensureIndexVisible = function (index) {
	        this.logger.log('ensureIndexVisible: ' + index);
	        var lastRow = this.rowModel.getRowCount();
	        if (typeof index !== 'number' || index < 0 || index >= lastRow) {
	            console.warn('invalid row index for ensureIndexVisible: ' + index);
	            return;
	        }
	        var nodeAtIndex = this.rowModel.getRow(index);
	        var rowTopPixel = nodeAtIndex.rowTop;
	        var rowBottomPixel = rowTopPixel + nodeAtIndex.rowHeight;
	        var viewportTopPixel = this.eBodyViewport.scrollTop;
	        var viewportHeight = this.eBodyViewport.offsetHeight;
	        var scrollShowing = this.isHorizontalScrollShowing();
	        if (scrollShowing) {
	            viewportHeight -= this.scrollWidth;
	        }
	        var viewportBottomPixel = viewportTopPixel + viewportHeight;
	        var viewportScrolledPastRow = viewportTopPixel > rowTopPixel;
	        var viewportScrolledBeforeRow = viewportBottomPixel < rowBottomPixel;
	        var eViewportToScroll = this.columnController.isPinningRight() ? this.ePinnedRightColsViewport : this.eBodyViewport;
	        if (viewportScrolledPastRow) {
	            // if row is before, scroll up with row at top
	            eViewportToScroll.scrollTop = rowTopPixel;
	        }
	        else if (viewportScrolledBeforeRow) {
	            // if row is below, scroll down with row at bottom
	            var newScrollPosition = rowBottomPixel - viewportHeight;
	            eViewportToScroll.scrollTop = newScrollPosition;
	        }
	        // otherwise, row is already in view, so do nothing
	    };
	    // + moveColumnController
	    GridPanel.prototype.getCenterWidth = function () {
	        return this.eBodyViewport.clientWidth;
	    };
	    GridPanel.prototype.isHorizontalScrollShowing = function () {
	        var result = this.eBodyViewport.clientWidth < this.eBodyViewport.scrollWidth;
	        return result;
	    };
	    GridPanel.prototype.isVerticalScrollShowing = function () {
	        if (this.columnController.isPinningRight()) {
	            // if pinning right, then the scroll bar can show, however for some reason
	            // it overlays the grid and doesn't take space.
	            return false;
	        }
	        else {
	            return this.eBodyViewport.clientHeight < this.eBodyViewport.scrollHeight;
	        }
	    };
	    // gets called every 500 ms. we use this to set padding on right pinned column
	    GridPanel.prototype.periodicallyCheck = function () {
	        if (this.columnController.isPinningRight()) {
	            var bodyHorizontalScrollShowing = this.eBodyViewport.clientWidth < this.eBodyViewport.scrollWidth;
	            if (bodyHorizontalScrollShowing) {
	                this.ePinnedRightColsContainer.style.marginBottom = this.scrollWidth + 'px';
	            }
	            else {
	                this.ePinnedRightColsContainer.style.marginBottom = '';
	            }
	        }
	    };
	    GridPanel.prototype.ensureColumnVisible = function (key) {
	        var column = this.columnController.getColumn(key);
	        if (column.isPinned()) {
	            console.warn('calling ensureIndexVisible on a ' + column.getPinned() + ' pinned column doesn\'t make sense for column ' + column.getColId());
	            return;
	        }
	        if (!this.columnController.isColumnDisplayed(column)) {
	            console.warn('column is not currently visible');
	            return;
	        }
	        var colLeftPixel = column.getLeft();
	        var colRightPixel = colLeftPixel + column.getActualWidth();
	        var viewportLeftPixel = this.eBodyViewport.scrollLeft;
	        var viewportWidth = this.eBodyViewport.offsetWidth;
	        var scrollShowing = this.eBodyViewport.clientHeight < this.eBodyViewport.scrollHeight;
	        if (scrollShowing) {
	            viewportWidth -= this.scrollWidth;
	        }
	        var viewportRightPixel = viewportLeftPixel + viewportWidth;
	        var viewportScrolledPastCol = viewportLeftPixel > colLeftPixel;
	        var viewportScrolledBeforeCol = viewportRightPixel < colRightPixel;
	        if (viewportScrolledPastCol) {
	            // if viewport's left side is after col's left side, scroll right to pull col into viewport at left
	            this.eBodyViewport.scrollLeft = colLeftPixel;
	        }
	        else if (viewportScrolledBeforeCol) {
	            // if viewport's right side is before col's right side, scroll left to pull col into viewport at right
	            var newScrollPosition = colRightPixel - viewportWidth;
	            this.eBodyViewport.scrollLeft = newScrollPosition;
	        }
	        // otherwise, col is already in view, so do nothing
	    };
	    GridPanel.prototype.showLoadingOverlay = function () {
	        if (!this.gridOptionsWrapper.isSuppressLoadingOverlay()) {
	            this.layout.showOverlay('loading');
	        }
	    };
	    GridPanel.prototype.showNoRowsOverlay = function () {
	        if (!this.gridOptionsWrapper.isSuppressNoRowsOverlay()) {
	            this.layout.showOverlay('noRows');
	        }
	    };
	    GridPanel.prototype.hideOverlay = function () {
	        this.layout.hideOverlay();
	    };
	    GridPanel.prototype.getWidthForSizeColsToFit = function () {
	        var availableWidth = this.eBody.clientWidth;
	        var scrollShowing = this.isVerticalScrollShowing();
	        if (scrollShowing) {
	            availableWidth -= this.scrollWidth;
	        }
	        return availableWidth;
	    };
	    // method will call itself if no available width. this covers if the grid
	    // isn't visible, but is just about to be visible.
	    GridPanel.prototype.sizeColumnsToFit = function (nextTimeout) {
	        var _this = this;
	        var availableWidth = this.getWidthForSizeColsToFit();
	        if (availableWidth > 0) {
	            this.columnController.sizeColumnsToFit(availableWidth);
	        }
	        else {
	            if (nextTimeout === undefined) {
	                setTimeout(function () {
	                    _this.sizeColumnsToFit(100);
	                }, 0);
	            }
	            else if (nextTimeout === 100) {
	                setTimeout(function () {
	                    _this.sizeColumnsToFit(-1);
	                }, 100);
	            }
	            else {
	                console.log('ag-Grid: tried to call sizeColumnsToFit() but the grid is coming back with ' +
	                    'zero width, maybe the grid is not visible yet on the screen?');
	            }
	        }
	    };
	    GridPanel.prototype.getBodyContainer = function () {
	        return this.eBodyContainer;
	    };
	    GridPanel.prototype.getDropTargetBodyContainers = function () {
	        if (this.forPrint) {
	            return [this.eBodyContainer, this.eFloatingTopContainer, this.eFloatingBottomContainer];
	        }
	        else {
	            return [this.eBodyViewport, this.eFloatingTopViewport, this.eFloatingBottomViewport];
	        }
	    };
	    GridPanel.prototype.getBodyViewport = function () {
	        return this.eBodyViewport;
	    };
	    GridPanel.prototype.getPinnedLeftColsContainer = function () {
	        return this.ePinnedLeftColsContainer;
	    };
	    GridPanel.prototype.getDropTargetLeftContainers = function () {
	        if (this.forPrint) {
	            return [];
	        }
	        else {
	            return [this.ePinnedLeftColsViewport, this.ePinnedLeftFloatingBottom, this.ePinnedLeftFloatingTop];
	        }
	    };
	    GridPanel.prototype.getPinnedRightColsContainer = function () {
	        return this.ePinnedRightColsContainer;
	    };
	    GridPanel.prototype.getDropTargetPinnedRightContainers = function () {
	        if (this.forPrint) {
	            return [];
	        }
	        else {
	            return [this.ePinnedRightColsViewport, this.ePinnedRightFloatingBottom, this.ePinnedRightFloatingTop];
	        }
	    };
	    GridPanel.prototype.getHeaderContainer = function () {
	        return this.eHeaderContainer;
	    };
	    GridPanel.prototype.getHeaderOverlay = function () {
	        return this.eHeaderOverlay;
	    };
	    GridPanel.prototype.getRoot = function () {
	        return this.eRoot;
	    };
	    GridPanel.prototype.getPinnedLeftHeader = function () {
	        return this.ePinnedLeftHeader;
	    };
	    GridPanel.prototype.getPinnedRightHeader = function () {
	        return this.ePinnedRightHeader;
	    };
	    GridPanel.prototype.queryHtmlElement = function (selector) {
	        return this.eRoot.querySelector(selector);
	    };
	    GridPanel.prototype.findElements = function () {
	        if (this.forPrint) {
	            this.eRoot = utils_1.Utils.loadTemplate(gridForPrintHtml);
	            utils_1.Utils.addCssClass(this.eRoot, 'ag-root');
	            utils_1.Utils.addCssClass(this.eRoot, 'ag-font-style');
	            utils_1.Utils.addCssClass(this.eRoot, 'ag-no-scrolls');
	        }
	        else {
	            this.eRoot = utils_1.Utils.loadTemplate(gridHtml);
	            utils_1.Utils.addCssClass(this.eRoot, 'ag-root');
	            utils_1.Utils.addCssClass(this.eRoot, 'ag-font-style');
	            utils_1.Utils.addCssClass(this.eRoot, 'ag-scrolls');
	        }
	        if (this.forPrint) {
	            this.eHeaderContainer = this.queryHtmlElement('.ag-header-container');
	            this.eBodyContainer = this.queryHtmlElement('.ag-body-container');
	            this.eFloatingTopContainer = this.queryHtmlElement('.ag-floating-top-container');
	            this.eFloatingBottomContainer = this.queryHtmlElement('.ag-floating-bottom-container');
	            this.eAllCellContainers = [this.eBodyContainer, this.eFloatingTopContainer, this.eFloatingBottomContainer];
	        }
	        else {
	            this.eBody = this.queryHtmlElement('.ag-body');
	            this.eBodyContainer = this.queryHtmlElement('.ag-body-container');
	            this.eBodyViewport = this.queryHtmlElement('.ag-body-viewport');
	            this.eBodyViewportWrapper = this.queryHtmlElement('.ag-body-viewport-wrapper');
	            this.ePinnedLeftColsContainer = this.queryHtmlElement('.ag-pinned-left-cols-container');
	            this.ePinnedRightColsContainer = this.queryHtmlElement('.ag-pinned-right-cols-container');
	            this.ePinnedLeftColsViewport = this.queryHtmlElement('.ag-pinned-left-cols-viewport');
	            this.ePinnedRightColsViewport = this.queryHtmlElement('.ag-pinned-right-cols-viewport');
	            this.ePinnedLeftHeader = this.queryHtmlElement('.ag-pinned-left-header');
	            this.ePinnedRightHeader = this.queryHtmlElement('.ag-pinned-right-header');
	            this.eHeader = this.queryHtmlElement('.ag-header');
	            this.eHeaderContainer = this.queryHtmlElement('.ag-header-container');
	            this.eHeaderOverlay = this.queryHtmlElement('.ag-header-overlay');
	            this.eHeaderViewport = this.queryHtmlElement('.ag-header-viewport');
	            this.eFloatingTop = this.queryHtmlElement('.ag-floating-top');
	            this.ePinnedLeftFloatingTop = this.queryHtmlElement('.ag-pinned-left-floating-top');
	            this.ePinnedRightFloatingTop = this.queryHtmlElement('.ag-pinned-right-floating-top');
	            this.eFloatingTopContainer = this.queryHtmlElement('.ag-floating-top-container');
	            this.eFloatingTopViewport = this.queryHtmlElement('.ag-floating-top-viewport');
	            this.eFloatingBottom = this.queryHtmlElement('.ag-floating-bottom');
	            this.ePinnedLeftFloatingBottom = this.queryHtmlElement('.ag-pinned-left-floating-bottom');
	            this.ePinnedRightFloatingBottom = this.queryHtmlElement('.ag-pinned-right-floating-bottom');
	            this.eFloatingBottomContainer = this.queryHtmlElement('.ag-floating-bottom-container');
	            this.eFloatingBottomViewport = this.queryHtmlElement('.ag-floating-bottom-viewport');
	            this.eAllCellContainers = [this.ePinnedLeftColsContainer, this.ePinnedRightColsContainer, this.eBodyContainer,
	                this.eFloatingTop, this.eFloatingBottom];
	            // IE9, Chrome, Safari, Opera
	            this.ePinnedLeftColsViewport.addEventListener('mousewheel', this.pinnedLeftMouseWheelListener.bind(this));
	            this.eBodyViewport.addEventListener('mousewheel', this.centerMouseWheelListener.bind(this));
	            // Firefox
	            this.ePinnedLeftColsViewport.addEventListener('DOMMouseScroll', this.pinnedLeftMouseWheelListener.bind(this));
	            this.eBodyViewport.addEventListener('DOMMouseScroll', this.centerMouseWheelListener.bind(this));
	        }
	    };
	    GridPanel.prototype.getHeaderViewport = function () {
	        return this.eHeaderViewport;
	    };
	    GridPanel.prototype.centerMouseWheelListener = function (event) {
	        // we are only interested in mimicking the mouse wheel if we are pinning on the right,
	        // as if we are not pinning on the right, then we have scrollbars in the center body, and
	        // as such we just use the default browser wheel behaviour.
	        if (this.columnController.isPinningRight()) {
	            return this.generalMouseWheelListener(event, this.ePinnedRightColsViewport);
	        }
	    };
	    GridPanel.prototype.pinnedLeftMouseWheelListener = function (event) {
	        var targetPanel;
	        if (this.columnController.isPinningRight()) {
	            targetPanel = this.ePinnedRightColsViewport;
	        }
	        else {
	            targetPanel = this.eBodyViewport;
	        }
	        return this.generalMouseWheelListener(event, targetPanel);
	    };
	    /*    private generalMouseWheelListener(event: any, targetPanel: HTMLElement): boolean {
	            var delta: number;
	            if (event.deltaY && event.deltaX != 0) {
	                // tested on chrome
	                delta = event.deltaY;
	            } else if (event.wheelDelta && event.wheelDelta != 0) {
	                // tested on IE
	                delta = -event.wheelDelta;
	            } else if (event.detail && event.detail != 0) {
	                // tested on Firefox. Firefox appears to be slower, 20px rather than the 100px in Chrome and IE
	                delta = event.detail * 20;
	            } else {
	                // couldn't find delta
	                return;
	            }
	    
	            var newTopPosition = this.eBodyViewport.scrollTop + delta;
	            targetPanel.scrollTop = newTopPosition;
	    
	            // if we don't prevent default, then the whole browser will scroll also as well as the grid
	            event.preventDefault();
	            return false;
	        }*/
	    GridPanel.prototype.generalMouseWheelListener = function (event, targetPanel) {
	        var wheelEvent = utils_1.Utils.normalizeWheel(event);
	        // we need to detect in which direction scroll is happening to allow trackpads scroll horizontally
	        // horizontal scroll
	        if (Math.abs(wheelEvent.pixelX) > Math.abs(wheelEvent.pixelY)) {
	            var newLeftPosition = this.eBodyViewport.scrollLeft + wheelEvent.pixelX;
	            this.eBodyViewport.scrollLeft = newLeftPosition;
	        }
	        else {
	            var newTopPosition = this.eBodyViewport.scrollTop + wheelEvent.pixelY;
	            targetPanel.scrollTop = newTopPosition;
	        }
	        // if we don't prevent default, then the whole browser will scroll also as well as the grid
	        event.preventDefault();
	        return false;
	    };
	    GridPanel.prototype.onColumnsChanged = function (event) {
	        if (event.isContainerWidthImpacted()) {
	            this.setWidthsOfContainers();
	        }
	        if (event.isPinnedPanelVisibilityImpacted()) {
	            this.showPinnedColContainersIfNeeded();
	        }
	        if (event.getType() === events_1.Events.EVENT_COLUMN_EVERYTHING_CHANGED) {
	            this.sizeHeaderAndBody();
	        }
	    };
	    GridPanel.prototype.setWidthsOfContainers = function () {
	        this.logger.log('setWidthsOfContainers()');
	        this.showPinnedColContainersIfNeeded();
	        var mainRowWidth = this.columnController.getBodyContainerWidth() + 'px';
	        this.eBodyContainer.style.width = mainRowWidth;
	        if (this.forPrint) {
	            // pinned col doesn't exist when doing forPrint
	            return;
	        }
	        this.eFloatingBottomContainer.style.width = mainRowWidth;
	        this.eFloatingTopContainer.style.width = mainRowWidth;
	        var pinnedLeftWidth = this.columnController.getPinnedLeftContainerWidth() + 'px';
	        this.ePinnedLeftColsContainer.style.width = pinnedLeftWidth;
	        this.ePinnedLeftFloatingBottom.style.width = pinnedLeftWidth;
	        this.ePinnedLeftFloatingTop.style.width = pinnedLeftWidth;
	        this.eBodyViewportWrapper.style.marginLeft = pinnedLeftWidth;
	        var pinnedRightWidth = this.columnController.getPinnedRightContainerWidth() + 'px';
	        this.ePinnedRightColsContainer.style.width = pinnedRightWidth;
	        this.ePinnedRightFloatingBottom.style.width = pinnedRightWidth;
	        this.ePinnedRightFloatingTop.style.width = pinnedRightWidth;
	        this.eBodyViewportWrapper.style.marginRight = pinnedRightWidth;
	    };
	    GridPanel.prototype.showPinnedColContainersIfNeeded = function () {
	        // no need to do this if not using scrolls
	        if (this.forPrint) {
	            return;
	        }
	        //some browsers had layout issues with the blank divs, so if blank,
	        //we don't display them
	        if (this.columnController.isPinningLeft()) {
	            this.ePinnedLeftHeader.style.display = 'inline-block';
	            this.ePinnedLeftColsViewport.style.display = 'inline';
	        }
	        else {
	            this.ePinnedLeftHeader.style.display = 'none';
	            this.ePinnedLeftColsViewport.style.display = 'none';
	        }
	        if (this.columnController.isPinningRight()) {
	            this.ePinnedRightHeader.style.display = 'inline-block';
	            this.ePinnedRightColsViewport.style.display = 'inline';
	            this.eBodyViewport.style.overflowY = 'hidden';
	        }
	        else {
	            this.ePinnedRightHeader.style.display = 'none';
	            this.ePinnedRightColsViewport.style.display = 'none';
	            this.eBodyViewport.style.overflowY = 'auto';
	        }
	    };
	    GridPanel.prototype.sizeHeaderAndBody = function () {
	        if (this.forPrint) {
	            // if doing 'for print', then the header and footers are laid
	            // out naturally by the browser. it whatever size that's needed to fit.
	            return;
	        }
	        var heightOfContainer = this.layout.getCentreHeight();
	        if (!heightOfContainer) {
	            return;
	        }
	        var headerHeight = this.gridOptionsWrapper.getHeaderHeight();
	        var numberOfRowsInHeader = this.columnController.getHeaderRowCount();
	        var totalHeaderHeight = headerHeight * numberOfRowsInHeader;
	        this.eHeader.style['height'] = totalHeaderHeight + 'px';
	        // padding top covers the header and the floating rows on top
	        var floatingTopHeight = this.floatingRowModel.getFloatingTopTotalHeight();
	        var paddingTop = totalHeaderHeight + floatingTopHeight;
	        // bottom is just the bottom floating rows
	        var floatingBottomHeight = this.floatingRowModel.getFloatingBottomTotalHeight();
	        var floatingBottomTop = heightOfContainer - floatingBottomHeight;
	        var heightOfCentreRows = heightOfContainer - totalHeaderHeight - floatingBottomHeight - floatingTopHeight;
	        this.eBody.style.paddingTop = paddingTop + 'px';
	        this.eBody.style.paddingBottom = floatingBottomHeight + 'px';
	        this.eFloatingTop.style.top = totalHeaderHeight + 'px';
	        this.eFloatingTop.style.height = floatingTopHeight + 'px';
	        this.eFloatingBottom.style.height = floatingBottomHeight + 'px';
	        this.eFloatingBottom.style.top = floatingBottomTop + 'px';
	        this.ePinnedLeftColsViewport.style.height = heightOfCentreRows + 'px';
	        this.ePinnedRightColsViewport.style.height = heightOfCentreRows + 'px';
	    };
	    GridPanel.prototype.setHorizontalScrollPosition = function (hScrollPosition) {
	        this.eBodyViewport.scrollLeft = hScrollPosition;
	    };
	    // tries to scroll by pixels, but returns what the result actually was
	    GridPanel.prototype.scrollHorizontally = function (pixels) {
	        var oldScrollPosition = this.eBodyViewport.scrollLeft;
	        this.setHorizontalScrollPosition(oldScrollPosition + pixels);
	        var newScrollPosition = this.eBodyViewport.scrollLeft;
	        return newScrollPosition - oldScrollPosition;
	    };
	    GridPanel.prototype.getHorizontalScrollPosition = function () {
	        if (this.forPrint) {
	            return 0;
	        }
	        else {
	            return this.eBodyViewport.scrollLeft;
	        }
	    };
	    GridPanel.prototype.turnOnAnimationForABit = function () {
	        var _this = this;
	        if (this.gridOptionsWrapper.isSuppressColumnMoveAnimation()) {
	            return;
	        }
	        this.animationThreadCount++;
	        var animationThreadCountCopy = this.animationThreadCount;
	        utils_1.Utils.addCssClass(this.eRoot, 'ag-column-moving');
	        setTimeout(function () {
	            if (_this.animationThreadCount === animationThreadCountCopy) {
	                utils_1.Utils.removeCssClass(_this.eRoot, 'ag-column-moving');
	            }
	        }, 300);
	    };
	    GridPanel.prototype.addScrollListener = function () {
	        var _this = this;
	        // if printing, then no scrolling, so no point in listening for scroll events
	        if (this.forPrint) {
	            return;
	        }
	        this.eBodyViewport.addEventListener('scroll', function () {
	            // we are always interested in horizontal scrolls of the body
	            var newLeftPosition = _this.eBodyViewport.scrollLeft;
	            if (newLeftPosition !== _this.lastLeftPosition) {
	                _this.lastLeftPosition = newLeftPosition;
	                _this.horizontallyScrollHeaderCenterAndFloatingCenter();
	                _this.masterSlaveService.fireHorizontalScrollEvent(newLeftPosition);
	            }
	            // if we are pinning to the right, then it's the right pinned container
	            // that has the scroll.
	            if (!_this.columnController.isPinningRight()) {
	                var newTopPosition = _this.eBodyViewport.scrollTop;
	                if (newTopPosition !== _this.lastTopPosition) {
	                    _this.lastTopPosition = newTopPosition;
	                    _this.verticallyScrollLeftPinned(newTopPosition);
	                    _this.requestDrawVirtualRows();
	                }
	            }
	        });
	        this.ePinnedRightColsViewport.addEventListener('scroll', function () {
	            var newTopPosition = _this.ePinnedRightColsViewport.scrollTop;
	            if (newTopPosition !== _this.lastTopPosition) {
	                _this.lastTopPosition = newTopPosition;
	                _this.verticallyScrollLeftPinned(newTopPosition);
	                _this.verticallyScrollBody(newTopPosition);
	                _this.requestDrawVirtualRows();
	            }
	        });
	        // this means the pinned panel was moved, which can only
	        // happen when the user is navigating in the pinned container
	        // as the pinned col should never scroll. so we rollback
	        // the scroll on the pinned.
	        this.ePinnedLeftColsViewport.addEventListener('scroll', function () {
	            _this.ePinnedLeftColsViewport.scrollTop = 0;
	        });
	    };
	    GridPanel.prototype.requestDrawVirtualRows = function () {
	        var _this = this;
	        // if we are in IE or Safari, then we only redraw if there was no scroll event
	        // in the 50ms following this scroll event. without this, these browsers have
	        // a bad scrolling feel, where the redraws clog the scroll experience
	        // (makes the scroll clunky and sticky). this method is like throttling
	        // the scroll events.
	        var useScrollLag;
	        // let the user override scroll lag option
	        if (this.gridOptionsWrapper.isSuppressScrollLag()) {
	            useScrollLag = false;
	        }
	        else if (this.gridOptionsWrapper.getIsScrollLag()) {
	            useScrollLag = this.gridOptionsWrapper.getIsScrollLag()();
	        }
	        else {
	            useScrollLag = utils_1.Utils.isBrowserIE() || utils_1.Utils.isBrowserSafari();
	        }
	        if (useScrollLag) {
	            this.scrollLagCounter++;
	            var scrollLagCounterCopy = this.scrollLagCounter;
	            setTimeout(function () {
	                if (_this.scrollLagCounter === scrollLagCounterCopy) {
	                    _this.rowRenderer.drawVirtualRows();
	                }
	            }, 50);
	        }
	        else {
	            this.rowRenderer.drawVirtualRows();
	        }
	    };
	    GridPanel.prototype.horizontallyScrollHeaderCenterAndFloatingCenter = function () {
	        var bodyLeftPosition = this.eBodyViewport.scrollLeft;
	        this.eHeaderContainer.style.left = -bodyLeftPosition + 'px';
	        this.eFloatingBottomContainer.style.left = -bodyLeftPosition + 'px';
	        this.eFloatingTopContainer.style.left = -bodyLeftPosition + 'px';
	    };
	    GridPanel.prototype.verticallyScrollLeftPinned = function (bodyTopPosition) {
	        this.ePinnedLeftColsContainer.style.top = -bodyTopPosition + 'px';
	    };
	    GridPanel.prototype.verticallyScrollBody = function (position) {
	        this.eBodyViewport.scrollTop = position;
	    };
	    GridPanel.prototype.getVerticalScrollPosition = function () {
	        if (this.forPrint) {
	            return 0;
	        }
	        else {
	            return this.eBodyViewport.scrollTop;
	        }
	    };
	    GridPanel.prototype.getBodyViewportClientRect = function () {
	        if (this.forPrint) {
	            return this.eBodyContainer.getBoundingClientRect();
	        }
	        else {
	            return this.eBodyViewport.getBoundingClientRect();
	        }
	    };
	    GridPanel.prototype.getFloatingTopClientRect = function () {
	        if (this.forPrint) {
	            return this.eFloatingTopContainer.getBoundingClientRect();
	        }
	        else {
	            return this.eFloatingTop.getBoundingClientRect();
	        }
	    };
	    GridPanel.prototype.getFloatingBottomClientRect = function () {
	        if (this.forPrint) {
	            return this.eFloatingBottomContainer.getBoundingClientRect();
	        }
	        else {
	            return this.eFloatingBottom.getBoundingClientRect();
	        }
	    };
	    GridPanel.prototype.getPinnedLeftColsViewportClientRect = function () {
	        return this.ePinnedLeftColsViewport.getBoundingClientRect();
	    };
	    GridPanel.prototype.getPinnedRightColsViewportClientRect = function () {
	        return this.ePinnedRightColsViewport.getBoundingClientRect();
	    };
	    GridPanel.prototype.addScrollEventListener = function (listener) {
	        this.eBodyViewport.addEventListener('scroll', listener);
	    };
	    GridPanel.prototype.removeScrollEventListener = function (listener) {
	        this.eBodyViewport.removeEventListener('scroll', listener);
	    };
	    __decorate([
	        context_3.Autowired('masterSlaveService'), 
	        __metadata('design:type', masterSlaveService_1.MasterSlaveService)
	    ], GridPanel.prototype, "masterSlaveService", void 0);
	    __decorate([
	        context_3.Autowired('gridOptionsWrapper'), 
	        __metadata('design:type', gridOptionsWrapper_1.GridOptionsWrapper)
	    ], GridPanel.prototype, "gridOptionsWrapper", void 0);
	    __decorate([
	        context_3.Autowired('columnController'), 
	        __metadata('design:type', columnController_1.ColumnController)
	    ], GridPanel.prototype, "columnController", void 0);
	    __decorate([
	        context_3.Autowired('rowRenderer'), 
	        __metadata('design:type', rowRenderer_1.RowRenderer)
	    ], GridPanel.prototype, "rowRenderer", void 0);
	    __decorate([
	        context_3.Autowired('floatingRowModel'), 
	        __metadata('design:type', floatingRowModel_1.FloatingRowModel)
	    ], GridPanel.prototype, "floatingRowModel", void 0);
	    __decorate([
	        context_3.Autowired('eventService'), 
	        __metadata('design:type', eventService_1.EventService)
	    ], GridPanel.prototype, "eventService", void 0);
	    __decorate([
	        context_3.Autowired('rowModel'), 
	        __metadata('design:type', Object)
	    ], GridPanel.prototype, "rowModel", void 0);
	    __decorate([
	        context_5.Optional('rangeController'), 
	        __metadata('design:type', Object)
	    ], GridPanel.prototype, "rangeController", void 0);
	    __decorate([
	        context_3.Autowired('dragService'), 
	        __metadata('design:type', dragService_1.DragService)
	    ], GridPanel.prototype, "dragService", void 0);
	    __decorate([
	        context_3.Autowired('selectionController'), 
	        __metadata('design:type', selectionController_1.SelectionController)
	    ], GridPanel.prototype, "selectionController", void 0);
	    __decorate([
	        context_5.Optional('clipboardService'), 
	        __metadata('design:type', Object)
	    ], GridPanel.prototype, "clipboardService", void 0);
	    __decorate([
	        context_3.Autowired('csvCreator'), 
	        __metadata('design:type', csvCreator_1.CsvCreator)
	    ], GridPanel.prototype, "csvCreator", void 0);
	    __decorate([
	        context_3.Autowired('mouseEventService'), 
	        __metadata('design:type', mouseEventService_1.MouseEventService)
	    ], GridPanel.prototype, "mouseEventService", void 0);
	    __decorate([
	        __param(0, context_2.Qualifier('loggerFactory')), 
	        __metadata('design:type', Function), 
	        __metadata('design:paramtypes', [logger_1.LoggerFactory]), 
	        __metadata('design:returntype', void 0)
	    ], GridPanel.prototype, "agWire", null);
	    __decorate([
	        context_4.PostConstruct, 
	        __metadata('design:type', Function), 
	        __metadata('design:paramtypes', []), 
	        __metadata('design:returntype', void 0)
	    ], GridPanel.prototype, "init", null);
	    GridPanel = __decorate([
	        context_1.Bean('gridPanel'), 
	        __metadata('design:paramtypes', [])
	    ], GridPanel);
	    return GridPanel;
	})();
	exports.GridPanel = GridPanel;


/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
	 * @version v4.0.3
	 * @link http://www.ag-grid.com/
	 * @license MIT
	 */
	var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
	    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
	    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
	    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
	    return c > 3 && r && Object.defineProperty(target, key, r), r;
	};
	var __metadata = (this && this.__metadata) || function (k, v) {
	    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
	};
	var __param = (this && this.__param) || function (paramIndex, decorator) {
	    return function (target, key) { decorator(target, key, paramIndex); }
	};
	var gridOptionsWrapper_1 = __webpack_require__(3);
	var columnController_1 = __webpack_require__(13);
	var gridPanel_1 = __webpack_require__(24);
	var eventService_1 = __webpack_require__(4);
	var logger_1 = __webpack_require__(5);
	var events_1 = __webpack_require__(10);
	var context_1 = __webpack_require__(6);
	var context_2 = __webpack_require__(6);
	var context_3 = __webpack_require__(6);
	var context_4 = __webpack_require__(6);
	var MasterSlaveService = (function () {
	    function MasterSlaveService() {
	        // flag to mark if we are consuming. to avoid cyclic events (ie slave firing back to master
	        // while processing a master event) we mark this if consuming an event, and if we are, then
	        // we don't fire back any events.
	        this.consuming = false;
	    }
	    MasterSlaveService.prototype.agWire = function (loggerFactory) {
	        this.logger = loggerFactory.create('MasterSlaveService');
	    };
	    MasterSlaveService.prototype.init = function () {
	        this.eventService.addEventListener(events_1.Events.EVENT_COLUMN_MOVED, this.fireColumnEvent.bind(this));
	        this.eventService.addEventListener(events_1.Events.EVENT_COLUMN_VISIBLE, this.fireColumnEvent.bind(this));
	        this.eventService.addEventListener(events_1.Events.EVENT_COLUMN_PINNED, this.fireColumnEvent.bind(this));
	        this.eventService.addEventListener(events_1.Events.EVENT_COLUMN_GROUP_OPENED, this.fireColumnEvent.bind(this));
	        this.eventService.addEventListener(events_1.Events.EVENT_COLUMN_RESIZED, this.fireColumnEvent.bind(this));
	    };
	    // common logic across all the fire methods
	    MasterSlaveService.prototype.fireEvent = function (callback) {
	        // if we are already consuming, then we are acting on an event from a master,
	        // so we don't cause a cyclic firing of events
	        if (this.consuming) {
	            return;
	        }
	        // iterate through the slave grids, and pass each slave service to the callback
	        var slaveGrids = this.gridOptionsWrapper.getSlaveGrids();
	        if (slaveGrids) {
	            slaveGrids.forEach(function (slaveGridOptions) {
	                if (slaveGridOptions.api) {
	                    var slaveService = slaveGridOptions.api.__getMasterSlaveService();
	                    callback(slaveService);
	                }
	            });
	        }
	    };
	    // common logic across all consume methods. very little common logic, however extracting
	    // guarantees consistency across the methods.
	    MasterSlaveService.prototype.onEvent = function (callback) {
	        this.consuming = true;
	        callback();
	        this.consuming = false;
	    };
	    MasterSlaveService.prototype.fireColumnEvent = function (event) {
	        this.fireEvent(function (slaveService) {
	            slaveService.onColumnEvent(event);
	        });
	    };
	    MasterSlaveService.prototype.fireHorizontalScrollEvent = function (horizontalScroll) {
	        this.fireEvent(function (slaveService) {
	            slaveService.onScrollEvent(horizontalScroll);
	        });
	    };
	    MasterSlaveService.prototype.onScrollEvent = function (horizontalScroll) {
	        var _this = this;
	        this.onEvent(function () {
	            _this.gridPanel.setHorizontalScrollPosition(horizontalScroll);
	        });
	    };
	    MasterSlaveService.prototype.getMasterColumns = function (event) {
	        var result = [];
	        if (event.getColumn()) {
	            result.push(event.getColumn());
	        }
	        if (event.getColumns()) {
	            event.getColumns().forEach(function (column) {
	                result.push(column);
	            });
	        }
	        return result;
	    };
	    MasterSlaveService.prototype.getColumnIds = function (event) {
	        var result = [];
	        if (event.getColumn()) {
	            result.push(event.getColumn().getColId());
	        }
	        if (event.getColumns()) {
	            event.getColumns().forEach(function (column) {
	                result.push(column.getColId());
	            });
	        }
	        return result;
	    };
	    MasterSlaveService.prototype.onColumnEvent = function (event) {
	        var _this = this;
	        this.onEvent(function () {
	            // the column in the event is from the master grid. need to
	            // look up the equivalent from this (slave) grid
	            var masterColumn = event.getColumn();
	            var slaveColumn;
	            if (masterColumn) {
	                slaveColumn = _this.columnController.getColumn(masterColumn.getColId());
	            }
	            // if event was with respect to a master column, that is not present in this
	            // grid, then we ignore the event
	            if (masterColumn && !slaveColumn) {
	                return;
	            }
	            // likewise for column group
	            var masterColumnGroup = event.getColumnGroup();
	            var slaveColumnGroup;
	            if (masterColumnGroup) {
	                var colId = masterColumnGroup.getGroupId();
	                var instanceId = masterColumnGroup.getInstanceId();
	                slaveColumnGroup = _this.columnController.getColumnGroup(colId, instanceId);
	            }
	            if (masterColumnGroup && !slaveColumnGroup) {
	                return;
	            }
	            // in time, all the methods below should use the column ids, it's a more generic way
	            // of handling columns, and also allows for single or multi column events
	            var columnIds = _this.getColumnIds(event);
	            var masterColumns = _this.getMasterColumns(event);
	            switch (event.getType()) {
	                case events_1.Events.EVENT_COLUMN_MOVED:
	                    _this.logger.log('onColumnEvent-> processing ' + event + ' toIndex = ' + event.getToIndex());
	                    _this.columnController.moveColumns(columnIds, event.getToIndex());
	                    break;
	                case events_1.Events.EVENT_COLUMN_VISIBLE:
	                    _this.logger.log('onColumnEvent-> processing ' + event + ' visible = ' + event.isVisible());
	                    _this.columnController.setColumnsVisible(columnIds, event.isVisible());
	                    break;
	                case events_1.Events.EVENT_COLUMN_PINNED:
	                    _this.logger.log('onColumnEvent-> processing ' + event + ' pinned = ' + event.getPinned());
	                    _this.columnController.setColumnsPinned(columnIds, event.getPinned());
	                    break;
	                case events_1.Events.EVENT_COLUMN_GROUP_OPENED:
	                    _this.logger.log('onColumnEvent-> processing ' + event + ' expanded = ' + masterColumnGroup.isExpanded());
	                    _this.columnController.setColumnGroupOpened(slaveColumnGroup, masterColumnGroup.isExpanded());
	                    break;
	                case events_1.Events.EVENT_COLUMN_RESIZED:
	                    masterColumns.forEach(function (masterColumn) {
	                        _this.logger.log('onColumnEvent-> processing ' + event + ' actualWidth = ' + masterColumn.getActualWidth());
	                        _this.columnController.setColumnWidth(masterColumn.getColId(), masterColumn.getActualWidth(), event.isFinished());
	                    });
	                    break;
	            }
	        });
	    };
	    __decorate([
	        context_3.Autowired('gridOptionsWrapper'), 
	        __metadata('design:type', gridOptionsWrapper_1.GridOptionsWrapper)
	    ], MasterSlaveService.prototype, "gridOptionsWrapper", void 0);
	    __decorate([
	        context_3.Autowired('columnController'), 
	        __metadata('design:type', columnController_1.ColumnController)
	    ], MasterSlaveService.prototype, "columnController", void 0);
	    __decorate([
	        context_3.Autowired('gridPanel'), 
	        __metadata('design:type', gridPanel_1.GridPanel)
	    ], MasterSlaveService.prototype, "gridPanel", void 0);
	    __decorate([
	        context_3.Autowired('eventService'), 
	        __metadata('design:type', eventService_1.EventService)
	    ], MasterSlaveService.prototype, "eventService", void 0);
	    __decorate([
	        __param(0, context_2.Qualifier('loggerFactory')), 
	        __metadata('design:type', Function), 
	        __metadata('design:paramtypes', [logger_1.LoggerFactory]), 
	        __metadata('design:returntype', void 0)
	    ], MasterSlaveService.prototype, "agWire", null);
	    __decorate([
	        context_4.PostConstruct, 
	        __metadata('design:type', Function), 
	        __metadata('design:paramtypes', []), 
	        __metadata('design:returntype', void 0)
	    ], MasterSlaveService.prototype, "init", null);
	    MasterSlaveService = __decorate([
	        context_1.Bean('masterSlaveService'), 
	        __metadata('design:paramtypes', [])
	    ], MasterSlaveService);
	    return MasterSlaveService;
	})();
	exports.MasterSlaveService = MasterSlaveService;


/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
	 * @version v4.0.3
	 * @link http://www.ag-grid.com/
	 * @license MIT
	 */
	var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
	    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
	    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
	    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
	    return c > 3 && r && Object.defineProperty(target, key, r), r;
	};
	var __metadata = (this && this.__metadata) || function (k, v) {
	    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
	};
	var gridOptionsWrapper_1 = __webpack_require__(3);
	var rowNode_1 = __webpack_require__(19);
	var context_1 = __webpack_require__(6);
	var eventService_1 = __webpack_require__(4);
	var context_2 = __webpack_require__(6);
	var events_1 = __webpack_require__(10);
	var context_3 = __webpack_require__(6);
	var constants_1 = __webpack_require__(8);
	var utils_1 = __webpack_require__(7);
	var FloatingRowModel = (function () {
	    function FloatingRowModel() {
	    }
	    FloatingRowModel.prototype.init = function () {
	        this.setFloatingTopRowData(this.gridOptionsWrapper.getFloatingTopRowData());
	        this.setFloatingBottomRowData(this.gridOptionsWrapper.getFloatingBottomRowData());
	    };
	    FloatingRowModel.prototype.isEmpty = function (floating) {
	        var rows = floating === constants_1.Constants.FLOATING_TOP ? this.floatingTopRows : this.floatingBottomRows;
	        return utils_1.Utils.missingOrEmpty(rows);
	    };
	    FloatingRowModel.prototype.isRowsToRender = function (floating) {
	        return !this.isEmpty(floating);
	    };
	    FloatingRowModel.prototype.getRowAtPixel = function (pixel, floating) {
	        var rows = floating === constants_1.Constants.FLOATING_TOP ? this.floatingTopRows : this.floatingBottomRows;
	        if (utils_1.Utils.missingOrEmpty(rows)) {
	            return 0; // this should never happen, just in case, 0 is graceful failure
	        }
	        for (var i = 0; i < rows.length; i++) {
	            var rowNode = rows[i];
	            var rowTopPixel = rowNode.rowTop + rowNode.rowHeight - 1;
	            // only need to range check against the top pixel, as we are going through the list
	            // in order, first row to hit the pixel wins
	            if (rowTopPixel >= pixel) {
	                return i;
	            }
	        }
	        return rows.length - 1;
	    };
	    FloatingRowModel.prototype.setFloatingTopRowData = function (rowData) {
	        this.floatingTopRows = this.createNodesFromData(rowData, true);
	        this.eventService.dispatchEvent(events_1.Events.EVENT_FLOATING_ROW_DATA_CHANGED);
	    };
	    FloatingRowModel.prototype.setFloatingBottomRowData = function (rowData) {
	        this.floatingBottomRows = this.createNodesFromData(rowData, false);
	        this.eventService.dispatchEvent(events_1.Events.EVENT_FLOATING_ROW_DATA_CHANGED);
	    };
	    FloatingRowModel.prototype.createNodesFromData = function (allData, isTop) {
	        var _this = this;
	        var rowNodes = [];
	        if (allData) {
	            var nextRowTop = 0;
	            allData.forEach(function (dataItem) {
	                var rowNode = new rowNode_1.RowNode(_this.eventService, _this.gridOptionsWrapper, null);
	                rowNode.data = dataItem;
	                rowNode.floating = isTop ? constants_1.Constants.FLOATING_TOP : constants_1.Constants.FLOATING_BOTTOM;
	                rowNode.rowTop = nextRowTop;
	                rowNode.rowHeight = _this.gridOptionsWrapper.getRowHeightForNode(rowNode);
	                nextRowTop += rowNode.rowHeight;
	                rowNodes.push(rowNode);
	            });
	        }
	        return rowNodes;
	    };
	    FloatingRowModel.prototype.getFloatingTopRowData = function () {
	        return this.floatingTopRows;
	    };
	    FloatingRowModel.prototype.getFloatingBottomRowData = function () {
	        return this.floatingBottomRows;
	    };
	    FloatingRowModel.prototype.getFloatingTopTotalHeight = function () {
	        return this.getTotalHeight(this.floatingTopRows);
	    };
	    FloatingRowModel.prototype.getFloatingBottomTotalHeight = function () {
	        return this.getTotalHeight(this.floatingBottomRows);
	    };
	    FloatingRowModel.prototype.getTotalHeight = function (rowNodes) {
	        if (!rowNodes || rowNodes.length === 0) {
	            return 0;
	        }
	        else {
	            var lastNode = rowNodes[rowNodes.length - 1];
	            return lastNode.rowTop + lastNode.rowHeight;
	        }
	    };
	    __decorate([
	        context_2.Autowired('gridOptionsWrapper'), 
	        __metadata('design:type', gridOptionsWrapper_1.GridOptionsWrapper)
	    ], FloatingRowModel.prototype, "gridOptionsWrapper", void 0);
	    __decorate([
	        context_2.Autowired('eventService'), 
	        __metadata('design:type', eventService_1.EventService)
	    ], FloatingRowModel.prototype, "eventService", void 0);
	    __decorate([
	        context_3.PostConstruct, 
	        __metadata('design:type', Function), 
	        __metadata('design:paramtypes', []), 
	        __metadata('design:returntype', void 0)
	    ], FloatingRowModel.prototype, "init", null);
	    FloatingRowModel = __decorate([
	        context_1.Bean('floatingRowModel'), 
	        __metadata('design:paramtypes', [])
	    ], FloatingRowModel);
	    return FloatingRowModel;
	})();
	exports.FloatingRowModel = FloatingRowModel;


/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
	 * @version v4.0.3
	 * @link http://www.ag-grid.com/
	 * @license MIT
	 */
	var utils_1 = __webpack_require__(7);
	var BorderLayout = (function () {
	    function BorderLayout(params) {
	        this.sizeChangeListeners = [];
	        this.isLayoutPanel = true;
	        this.fullHeight = !params.north && !params.south;
	        var template;
	        if (!params.dontFill) {
	            if (this.fullHeight) {
	                template =
	                    '<div style="height: 100%; overflow: auto; position: relative;">' +
	                        '<div id="west" style="height: 100%; float: left;"></div>' +
	                        '<div id="east" style="height: 100%; float: right;"></div>' +
	                        '<div id="center" style="height: 100%;"></div>' +
	                        '<div id="overlay" style="pointer-events: none; position: absolute; height: 100%; width: 100%; top: 0px; left: 0px;"></div>' +
	                        '</div>';
	            }
	            else {
	                template =
	                    '<div style="height: 100%; position: relative;">' +
	                        '<div id="north"></div>' +
	                        '<div id="centerRow" style="height: 100%; overflow: hidden;">' +
	                        '<div id="west" style="height: 100%; float: left;"></div>' +
	                        '<div id="east" style="height: 100%; float: right;"></div>' +
	                        '<div id="center" style="height: 100%;"></div>' +
	                        '</div>' +
	                        '<div id="south"></div>' +
	                        '<div id="overlay" style="pointer-events: none; position: absolute; height: 100%; width: 100%; top: 0px; left: 0px;"></div>' +
	                        '</div>';
	            }
	            this.layoutActive = true;
	        }
	        else {
	            template =
	                '<div style="position: relative;">' +
	                    '<div id="north"></div>' +
	                    '<div id="centerRow">' +
	                    '<div id="west"></div>' +
	                    '<div id="east"></div>' +
	                    '<div id="center"></div>' +
	                    '</div>' +
	                    '<div id="south"></div>' +
	                    '<div id="overlay" style="pointer-events: none; position: absolute; height: 100%; width: 100%; top: 0px; left: 0px;"></div>' +
	                    '</div>';
	            this.layoutActive = false;
	        }
	        this.eGui = utils_1.Utils.loadTemplate(template);
	        this.id = 'borderLayout';
	        if (params.name) {
	            this.id += '_' + params.name;
	        }
	        this.eGui.setAttribute('id', this.id);
	        this.childPanels = [];
	        if (params) {
	            this.setupPanels(params);
	        }
	        this.overlays = params.overlays;
	        this.setupOverlays();
	    }
	    BorderLayout.prototype.addSizeChangeListener = function (listener) {
	        this.sizeChangeListeners.push(listener);
	    };
	    BorderLayout.prototype.fireSizeChanged = function () {
	        this.sizeChangeListeners.forEach(function (listener) {
	            listener();
	        });
	    };
	    BorderLayout.prototype.setupPanels = function (params) {
	        this.eNorthWrapper = this.eGui.querySelector('#north');
	        this.eSouthWrapper = this.eGui.querySelector('#south');
	        this.eEastWrapper = this.eGui.querySelector('#east');
	        this.eWestWrapper = this.eGui.querySelector('#west');
	        this.eCenterWrapper = this.eGui.querySelector('#center');
	        this.eOverlayWrapper = this.eGui.querySelector('#overlay');
	        this.eCenterRow = this.eGui.querySelector('#centerRow');
	        this.eNorthChildLayout = this.setupPanel(params.north, this.eNorthWrapper);
	        this.eSouthChildLayout = this.setupPanel(params.south, this.eSouthWrapper);
	        this.eEastChildLayout = this.setupPanel(params.east, this.eEastWrapper);
	        this.eWestChildLayout = this.setupPanel(params.west, this.eWestWrapper);
	        this.eCenterChildLayout = this.setupPanel(params.center, this.eCenterWrapper);
	    };
	    BorderLayout.prototype.setupPanel = function (content, ePanel) {
	        if (!ePanel) {
	            return;
	        }
	        if (content) {
	            if (content.isLayoutPanel) {
	                this.childPanels.push(content);
	                ePanel.appendChild(content.getGui());
	                return content;
	            }
	            else {
	                ePanel.appendChild(content);
	                return null;
	            }
	        }
	        else {
	            ePanel.parentNode.removeChild(ePanel);
	            return null;
	        }
	    };
	    BorderLayout.prototype.getGui = function () {
	        return this.eGui;
	    };
	    // returns true if any item changed size, otherwise returns false
	    BorderLayout.prototype.doLayout = function () {
	        if (!utils_1.Utils.isVisible(this.eGui)) {
	            return false;
	        }
	        var atLeastOneChanged = false;
	        var childLayouts = [this.eNorthChildLayout, this.eSouthChildLayout, this.eEastChildLayout, this.eWestChildLayout];
	        var that = this;
	        utils_1.Utils.forEach(childLayouts, function (childLayout) {
	            var childChangedSize = that.layoutChild(childLayout);
	            if (childChangedSize) {
	                atLeastOneChanged = true;
	            }
	        });
	        if (this.layoutActive) {
	            var ourHeightChanged = this.layoutHeight();
	            var ourWidthChanged = this.layoutWidth();
	            if (ourHeightChanged || ourWidthChanged) {
	                atLeastOneChanged = true;
	            }
	        }
	        var centerChanged = this.layoutChild(this.eCenterChildLayout);
	        if (centerChanged) {
	            atLeastOneChanged = true;
	        }
	        if (atLeastOneChanged) {
	            this.fireSizeChanged();
	        }
	        return atLeastOneChanged;
	    };
	    BorderLayout.prototype.layoutChild = function (childPanel) {
	        if (childPanel) {
	            return childPanel.doLayout();
	        }
	        else {
	            return false;
	        }
	    };
	    BorderLayout.prototype.layoutHeight = function () {
	        if (this.fullHeight) {
	            return this.layoutHeightFullHeight();
	        }
	        else {
	            return this.layoutHeightNormal();
	        }
	    };
	    // full height never changes the height, because the center is always 100%,
	    // however we do check for change, to inform the listeners
	    BorderLayout.prototype.layoutHeightFullHeight = function () {
	        var centerHeight = utils_1.Utils.offsetHeight(this.eGui);
	        if (centerHeight < 0) {
	            centerHeight = 0;
	        }
	        if (this.centerHeightLastTime !== centerHeight) {
	            this.centerHeightLastTime = centerHeight;
	            return true;
	        }
	        else {
	            return false;
	        }
	    };
	    BorderLayout.prototype.layoutHeightNormal = function () {
	        var totalHeight = utils_1.Utils.offsetHeight(this.eGui);
	        var northHeight = utils_1.Utils.offsetHeight(this.eNorthWrapper);
	        var southHeight = utils_1.Utils.offsetHeight(this.eSouthWrapper);
	        var centerHeight = totalHeight - northHeight - southHeight;
	        if (centerHeight < 0) {
	            centerHeight = 0;
	        }
	        if (this.centerHeightLastTime !== centerHeight) {
	            this.eCenterRow.style.height = centerHeight + 'px';
	            this.centerHeightLastTime = centerHeight;
	            return true; // return true because there was a change
	        }
	        else {
	            return false;
	        }
	    };
	    BorderLayout.prototype.getCentreHeight = function () {
	        return this.centerHeightLastTime;
	    };
	    BorderLayout.prototype.layoutWidth = function () {
	        var totalWidth = utils_1.Utils.offsetWidth(this.eGui);
	        var eastWidth = utils_1.Utils.offsetWidth(this.eEastWrapper);
	        var westWidth = utils_1.Utils.offsetWidth(this.eWestWrapper);
	        var centerWidth = totalWidth - eastWidth - westWidth;
	        if (centerWidth < 0) {
	            centerWidth = 0;
	        }
	        if (this.centerWidthLastTime !== centerWidth) {
	            this.centerWidthLastTime = centerWidth;
	            this.eCenterWrapper.style.width = centerWidth + 'px';
	            return true; // return true because there was a change
	        }
	        else {
	            return false;
	        }
	    };
	    BorderLayout.prototype.setEastVisible = function (visible) {
	        if (this.eEastWrapper) {
	            this.eEastWrapper.style.display = visible ? '' : 'none';
	        }
	        this.doLayout();
	    };
	    BorderLayout.prototype.setNorthVisible = function (visible) {
	        if (this.eNorthWrapper) {
	            this.eNorthWrapper.style.display = visible ? '' : 'none';
	        }
	        this.doLayout();
	    };
	    BorderLayout.prototype.setupOverlays = function () {
	        // if no overlays, just remove the panel
	        if (!this.overlays) {
	            this.eOverlayWrapper.parentNode.removeChild(this.eOverlayWrapper);
	            return;
	        }
	        this.hideOverlay();
	        //
	        //this.setOverlayVisible(false);
	    };
	    BorderLayout.prototype.hideOverlay = function () {
	        utils_1.Utils.removeAllChildren(this.eOverlayWrapper);
	        this.eOverlayWrapper.style.display = 'none';
	    };
	    BorderLayout.prototype.showOverlay = function (key) {
	        var overlay = this.overlays ? this.overlays[key] : null;
	        if (overlay) {
	            utils_1.Utils.removeAllChildren(this.eOverlayWrapper);
	            this.eOverlayWrapper.style.display = '';
	            this.eOverlayWrapper.appendChild(overlay);
	        }
	        else {
	            console.log('ag-Grid: unknown overlay');
	            this.hideOverlay();
	        }
	    };
	    BorderLayout.prototype.setSouthVisible = function (visible) {
	        if (this.eSouthWrapper) {
	            this.eSouthWrapper.style.display = visible ? '' : 'none';
	        }
	        this.doLayout();
	    };
	    return BorderLayout;
	})();
	exports.BorderLayout = BorderLayout;


/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
	 * @version v4.0.3
	 * @link http://www.ag-grid.com/
	 * @license MIT
	 */
	var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
	    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
	    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
	    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
	    return c > 3 && r && Object.defineProperty(target, key, r), r;
	};
	var __metadata = (this && this.__metadata) || function (k, v) {
	    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
	};
	var context_1 = __webpack_require__(6);
	var context_2 = __webpack_require__(6);
	var logger_1 = __webpack_require__(5);
	var context_3 = __webpack_require__(6);
	var utils_1 = __webpack_require__(7);
	var DragService = (function () {
	    function DragService() {
	        this.onMouseUpListener = this.onMouseUp.bind(this);
	        this.onMouseMoveListener = this.onMouseMove.bind(this);
	    }
	    DragService.prototype.init = function () {
	        this.logger = this.loggerFactory.create('HorizontalDragService');
	    };
	    DragService.prototype.addDragSource = function (params) {
	        params.eElement.addEventListener('mousedown', this.onMouseDown.bind(this, params));
	    };
	    DragService.prototype.onMouseDown = function (params, mouseEvent) {
	        // only interested in left button clicks
	        if (mouseEvent.button !== 0) {
	            return;
	        }
	        this.currentDragParams = params;
	        this.dragging = false;
	        this.eventLastTime = mouseEvent;
	        this.dragStartEvent = mouseEvent;
	        document.addEventListener('mousemove', this.onMouseMoveListener);
	        document.addEventListener('mouseup', this.onMouseUpListener);
	        // see if we want to start dragging straight away
	        if (params.dragStartPixels === 0) {
	            this.onMouseMove(mouseEvent);
	        }
	    };
	    DragService.prototype.isEventNearStartEvent = function (event) {
	        // by default, we wait 4 pixels before starting the drag
	        var requiredPixelDiff = utils_1.Utils.exists(this.currentDragParams.dragStartPixels) ? this.currentDragParams.dragStartPixels : 4;
	        if (requiredPixelDiff === 0) {
	            return false;
	        }
	        var diffX = Math.abs(event.clientX - this.dragStartEvent.clientX);
	        var diffY = Math.abs(event.clientY - this.dragStartEvent.clientY);
	        return Math.max(diffX, diffY) <= requiredPixelDiff;
	    };
	    DragService.prototype.onMouseMove = function (mouseEvent) {
	        if (!this.dragging) {
	            // we want to have moved at least 4px before the drag starts
	            if (this.isEventNearStartEvent(mouseEvent)) {
	                return;
	            }
	            else {
	                this.dragging = true;
	                this.currentDragParams.onDragStart(this.dragStartEvent);
	            }
	        }
	        this.currentDragParams.onDragging(mouseEvent);
	    };
	    DragService.prototype.onMouseUp = function (mouseEvent) {
	        this.logger.log('onMouseUp');
	        document.removeEventListener('mouseup', this.onMouseUpListener);
	        document.removeEventListener('mousemove', this.onMouseMoveListener);
	        if (this.dragging) {
	            this.currentDragParams.onDragStop(mouseEvent);
	        }
	        this.dragStartEvent = null;
	        this.eventLastTime = null;
	        this.dragging = false;
	    };
	    __decorate([
	        context_2.Autowired('loggerFactory'), 
	        __metadata('design:type', logger_1.LoggerFactory)
	    ], DragService.prototype, "loggerFactory", void 0);
	    __decorate([
	        context_3.PostConstruct, 
	        __metadata('design:type', Function), 
	        __metadata('design:paramtypes', []), 
	        __metadata('design:returntype', void 0)
	    ], DragService.prototype, "init", null);
	    DragService = __decorate([
	        context_1.Bean('dragService'), 
	        __metadata('design:paramtypes', [])
	    ], DragService);
	    return DragService;
	})();
	exports.DragService = DragService;


/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
	 * @version v4.0.3
	 * @link http://www.ag-grid.com/
	 * @license MIT
	 */
	var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
	    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
	    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
	    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
	    return c > 3 && r && Object.defineProperty(target, key, r), r;
	};
	var __metadata = (this && this.__metadata) || function (k, v) {
	    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
	};
	var __param = (this && this.__param) || function (paramIndex, decorator) {
	    return function (target, key) { decorator(target, key, paramIndex); }
	};
	var utils_1 = __webpack_require__(7);
	var context_1 = __webpack_require__(6);
	var context_2 = __webpack_require__(6);
	var logger_1 = __webpack_require__(5);
	var eventService_1 = __webpack_require__(4);
	var events_1 = __webpack_require__(10);
	var context_3 = __webpack_require__(6);
	var gridOptionsWrapper_1 = __webpack_require__(3);
	var context_4 = __webpack_require__(6);
	var SelectionController = (function () {
	    function SelectionController() {
	    }
	    SelectionController.prototype.agWire = function (loggerFactory) {
	        this.logger = loggerFactory.create('SelectionController');
	        this.reset();
	        if (this.gridOptionsWrapper.isRowModelDefault()) {
	            this.eventService.addEventListener(events_1.Events.EVENT_ROW_DATA_CHANGED, this.reset.bind(this));
	        }
	        else {
	            this.logger.log('dont know what to do here');
	        }
	    };
	    SelectionController.prototype.init = function () {
	        this.eventService.addEventListener(events_1.Events.EVENT_ROW_SELECTED, this.onRowSelected.bind(this));
	    };
	    SelectionController.prototype.getSelectedNodes = function () {
	        var selectedNodes = [];
	        utils_1.Utils.iterateObject(this.selectedNodes, function (key, rowNode) {
	            if (rowNode) {
	                selectedNodes.push(rowNode);
	            }
	        });
	        return selectedNodes;
	    };
	    SelectionController.prototype.getSelectedRows = function () {
	        var selectedRows = [];
	        utils_1.Utils.iterateObject(this.selectedNodes, function (key, rowNode) {
	            if (rowNode) {
	                selectedRows.push(rowNode.data);
	            }
	        });
	        return selectedRows;
	    };
	    SelectionController.prototype.removeGroupsFromSelection = function () {
	        var _this = this;
	        utils_1.Utils.iterateObject(this.selectedNodes, function (key, rowNode) {
	            if (rowNode) {
	                _this.selectedNodes[rowNode.id] = undefined;
	            }
	        });
	    };
	    // should only be called if groupSelectsChildren=true
	    SelectionController.prototype.updateGroupsFromChildrenSelections = function () {
	        this.rowModel.getTopLevelNodes().forEach(function (rowNode) {
	            rowNode.deptFirstSearch(function (rowNode) {
	                if (rowNode.group) {
	                    rowNode.calculateSelectedFromChildren();
	                }
	            });
	        });
	    };
	    SelectionController.prototype.getNodeForIdIfSelected = function (id) {
	        return this.selectedNodes[id];
	    };
	    SelectionController.prototype.clearOtherNodes = function (rowNodeToKeepSelected) {
	        var _this = this;
	        utils_1.Utils.iterateObject(this.selectedNodes, function (key, otherRowNode) {
	            if (otherRowNode && otherRowNode.id !== rowNodeToKeepSelected.id) {
	                _this.selectedNodes[otherRowNode.id].setSelected(false, false, true);
	            }
	        });
	    };
	    SelectionController.prototype.onRowSelected = function (event) {
	        var rowNode = event.node;
	        if (rowNode.isSelected()) {
	            this.selectedNodes[rowNode.id] = rowNode;
	        }
	        else {
	            this.selectedNodes[rowNode.id] = undefined;
	        }
	    };
	    SelectionController.prototype.syncInRowNode = function (rowNode) {
	        if (this.selectedNodes[rowNode.id] !== undefined) {
	            rowNode.setSelectedInitialValue(true);
	            this.selectedNodes[rowNode.id] = rowNode;
	        }
	    };
	    SelectionController.prototype.reset = function () {
	        this.logger.log('reset');
	        this.selectedNodes = {};
	    };
	    // returns a list of all nodes at 'best cost' - a feature to be used
	    // with groups / trees. if a group has all it's children selected,
	    // then the group appears in the result, but not the children.
	    // Designed for use with 'children' as the group selection type,
	    // where groups don't actually appear in the selection normally.
	    SelectionController.prototype.getBestCostNodeSelection = function () {
	        var topLevelNodes = this.rowModel.getTopLevelNodes();
	        if (topLevelNodes === null) {
	            console.warn('selectAll not available doing rowModel=virtual');
	            return;
	        }
	        var result = [];
	        // recursive function, to find the selected nodes
	        function traverse(nodes) {
	            for (var i = 0, l = nodes.length; i < l; i++) {
	                var node = nodes[i];
	                if (node.isSelected()) {
	                    result.push(node);
	                }
	                else {
	                    // if not selected, then if it's a group, and the group
	                    // has children, continue to search for selections
	                    if (node.group && node.children) {
	                        traverse(node.children);
	                    }
	                }
	            }
	        }
	        traverse(topLevelNodes);
	        return result;
	    };
	    SelectionController.prototype.setRowModel = function (rowModel) {
	        this.rowModel = rowModel;
	    };
	    SelectionController.prototype.isEmpty = function () {
	        var count = 0;
	        utils_1.Utils.iterateObject(this.selectedNodes, function (nodeId, rowNode) {
	            if (rowNode) {
	                count++;
	            }
	        });
	        return count === 0;
	    };
	    SelectionController.prototype.deselectAllRowNodes = function () {
	        utils_1.Utils.iterateObject(this.selectedNodes, function (nodeId, rowNode) {
	            if (rowNode) {
	                rowNode.selectThisNode(false);
	            }
	        });
	        // we should not have to do this, as deselecting the nodes fires events
	        // that we pick up, however it's good to clean it down, as we are still
	        // left with entries pointing to 'undefined'
	        this.selectedNodes = {};
	    };
	    SelectionController.prototype.selectAllRowNodes = function () {
	        if (this.rowModel.getTopLevelNodes() === null) {
	            throw 'selectAll not available when doing virtual pagination';
	        }
	        this.rowModel.forEachNode(function (rowNode) {
	            rowNode.setSelected(true, false, true);
	        });
	        // because we passed in 'false' as third parameter above, the
	        // eventSelectionChanged event was not fired.
	        this.eventService.dispatchEvent(events_1.Events.EVENT_SELECTION_CHANGED);
	    };
	    // Deprecated method
	    SelectionController.prototype.selectNode = function (rowNode, tryMulti, suppressEvents) {
	        rowNode.setSelected(true, !tryMulti, suppressEvents);
	    };
	    // Deprecated method
	    SelectionController.prototype.deselectIndex = function (rowIndex, suppressEvents) {
	        if (suppressEvents === void 0) { suppressEvents = false; }
	        var node = this.rowModel.getRow(rowIndex);
	        this.deselectNode(node, suppressEvents);
	    };
	    // Deprecated method
	    SelectionController.prototype.deselectNode = function (rowNode, suppressEvents) {
	        if (suppressEvents === void 0) { suppressEvents = false; }
	        rowNode.setSelected(false, false, suppressEvents);
	    };
	    // Deprecated method
	    SelectionController.prototype.selectIndex = function (index, tryMulti, suppressEvents) {
	        if (suppressEvents === void 0) { suppressEvents = false; }
	        var node = this.rowModel.getRow(index);
	        this.selectNode(node, tryMulti, suppressEvents);
	    };
	    __decorate([
	        context_3.Autowired('eventService'), 
	        __metadata('design:type', eventService_1.EventService)
	    ], SelectionController.prototype, "eventService", void 0);
	    __decorate([
	        context_3.Autowired('rowModel'), 
	        __metadata('design:type', Object)
	    ], SelectionController.prototype, "rowModel", void 0);
	    __decorate([
	        context_3.Autowired('gridOptionsWrapper'), 
	        __metadata('design:type', gridOptionsWrapper_1.GridOptionsWrapper)
	    ], SelectionController.prototype, "gridOptionsWrapper", void 0);
	    __decorate([
	        __param(0, context_2.Qualifier('loggerFactory')), 
	        __metadata('design:type', Function), 
	        __metadata('design:paramtypes', [logger_1.LoggerFactory]), 
	        __metadata('design:returntype', void 0)
	    ], SelectionController.prototype, "agWire", null);
	    __decorate([
	        context_4.PostConstruct, 
	        __metadata('design:type', Function), 
	        __metadata('design:paramtypes', []), 
	        __metadata('design:returntype', void 0)
	    ], SelectionController.prototype, "init", null);
	    SelectionController = __decorate([
	        context_1.Bean('selectionController'), 
	        __metadata('design:paramtypes', [])
	    ], SelectionController);
	    return SelectionController;
	})();
	exports.SelectionController = SelectionController;


/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
	 * @version v4.0.3
	 * @link http://www.ag-grid.com/
	 * @license MIT
	 */
	var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
	    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
	    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
	    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
	    return c > 3 && r && Object.defineProperty(target, key, r), r;
	};
	var __metadata = (this && this.__metadata) || function (k, v) {
	    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
	};
	var context_1 = __webpack_require__(6);
	var context_2 = __webpack_require__(6);
	var gridPanel_1 = __webpack_require__(24);
	var columnController_1 = __webpack_require__(13);
	var column_1 = __webpack_require__(15);
	var constants_1 = __webpack_require__(8);
	var floatingRowModel_1 = __webpack_require__(26);
	var utils_1 = __webpack_require__(7);
	var gridCell_1 = __webpack_require__(31);
	var gridOptionsWrapper_1 = __webpack_require__(3);
	var MouseEventService = (function () {
	    function MouseEventService() {
	    }
	    MouseEventService.prototype.getCellForMouseEvent = function (mouseEvent) {
	        var floating = this.getFloating(mouseEvent);
	        var rowIndex = this.getRowIndex(mouseEvent, floating);
	        var column = this.getColumn(mouseEvent);
	        if (rowIndex >= 0 && utils_1.Utils.exists(column)) {
	            return new gridCell_1.GridCell(rowIndex, floating, column);
	        }
	        else {
	            return null;
	        }
	    };
	    MouseEventService.prototype.getFloating = function (mouseEvent) {
	        var floatingTopRect = this.gridPanel.getFloatingTopClientRect();
	        var floatingBottomRect = this.gridPanel.getFloatingBottomClientRect();
	        var floatingTopRowsExist = !this.floatingRowModel.isEmpty(constants_1.Constants.FLOATING_TOP);
	        var floatingBottomRowsExist = !this.floatingRowModel.isEmpty(constants_1.Constants.FLOATING_BOTTOM);
	        if (floatingTopRowsExist && floatingTopRect.bottom >= mouseEvent.clientY) {
	            return constants_1.Constants.FLOATING_TOP;
	        }
	        else if (floatingBottomRowsExist && floatingBottomRect.top <= mouseEvent.clientY) {
	            return constants_1.Constants.FLOATING_BOTTOM;
	        }
	        else {
	            return null;
	        }
	    };
	    MouseEventService.prototype.getFloatingRowIndex = function (mouseEvent, floating) {
	        var clientRect;
	        switch (floating) {
	            case constants_1.Constants.FLOATING_TOP:
	                clientRect = this.gridPanel.getFloatingTopClientRect();
	                break;
	            case constants_1.Constants.FLOATING_BOTTOM:
	                clientRect = this.gridPanel.getFloatingBottomClientRect();
	                break;
	        }
	        var bodyY = mouseEvent.clientY - clientRect.top;
	        var rowIndex = this.floatingRowModel.getRowAtPixel(bodyY, floating);
	        return rowIndex;
	    };
	    MouseEventService.prototype.getRowIndex = function (mouseEvent, floating) {
	        switch (floating) {
	            case constants_1.Constants.FLOATING_TOP:
	            case constants_1.Constants.FLOATING_BOTTOM:
	                return this.getFloatingRowIndex(mouseEvent, floating);
	            default: return this.getBodyRowIndex(mouseEvent);
	        }
	    };
	    MouseEventService.prototype.getBodyRowIndex = function (mouseEvent) {
	        var clientRect = this.gridPanel.getBodyViewportClientRect();
	        var scrollY = this.gridPanel.getVerticalScrollPosition();
	        var bodyY = mouseEvent.clientY - clientRect.top + scrollY;
	        var rowIndex = this.rowModel.getRowAtPixel(bodyY);
	        return rowIndex;
	    };
	    MouseEventService.prototype.getContainer = function (mouseEvent) {
	        var centerRect = this.gridPanel.getBodyViewportClientRect();
	        var mouseX = mouseEvent.clientX;
	        if (mouseX < centerRect.left && this.columnController.isPinningLeft()) {
	            return column_1.Column.PINNED_LEFT;
	        }
	        else if (mouseX > centerRect.right && this.columnController.isPinningRight()) {
	            return column_1.Column.PINNED_RIGHT;
	        }
	        else {
	            return null;
	        }
	    };
	    MouseEventService.prototype.getColumn = function (mouseEvent) {
	        if (this.columnController.isEmpty()) {
	            return null;
	        }
	        var container = this.getContainer(mouseEvent);
	        var columns = this.getColumnsForContainer(container);
	        var containerX = this.getXForContainer(container, mouseEvent);
	        var hoveringColumn;
	        if (containerX < 0) {
	            hoveringColumn = columns[0];
	        }
	        columns.forEach(function (column) {
	            var afterLeft = containerX >= column.getLeft();
	            var beforeRight = containerX <= column.getRight();
	            if (afterLeft && beforeRight) {
	                hoveringColumn = column;
	            }
	        });
	        if (!hoveringColumn) {
	            hoveringColumn = columns[columns.length - 1];
	        }
	        return hoveringColumn;
	    };
	    MouseEventService.prototype.getColumnsForContainer = function (container) {
	        switch (container) {
	            case column_1.Column.PINNED_LEFT: return this.columnController.getDisplayedLeftColumns();
	            case column_1.Column.PINNED_RIGHT: return this.columnController.getDisplayedRightColumns();
	            default: return this.columnController.getDisplayedCenterColumns();
	        }
	    };
	    MouseEventService.prototype.getXForContainer = function (container, mouseEvent) {
	        var containerX;
	        switch (container) {
	            case column_1.Column.PINNED_LEFT:
	                containerX = this.gridPanel.getPinnedLeftColsViewportClientRect().left;
	                break;
	            case column_1.Column.PINNED_RIGHT:
	                containerX = this.gridPanel.getPinnedRightColsViewportClientRect().left;
	                break;
	            default:
	                var centerRect = this.gridPanel.getBodyViewportClientRect();
	                var centerScroll = this.gridPanel.getHorizontalScrollPosition();
	                containerX = centerRect.left - centerScroll;
	        }
	        var result = mouseEvent.clientX - containerX;
	        return result;
	    };
	    __decorate([
	        context_2.Autowired('gridPanel'), 
	        __metadata('design:type', gridPanel_1.GridPanel)
	    ], MouseEventService.prototype, "gridPanel", void 0);
	    __decorate([
	        context_2.Autowired('columnController'), 
	        __metadata('design:type', columnController_1.ColumnController)
	    ], MouseEventService.prototype, "columnController", void 0);
	    __decorate([
	        context_2.Autowired('rowModel'), 
	        __metadata('design:type', Object)
	    ], MouseEventService.prototype, "rowModel", void 0);
	    __decorate([
	        context_2.Autowired('floatingRowModel'), 
	        __metadata('design:type', floatingRowModel_1.FloatingRowModel)
	    ], MouseEventService.prototype, "floatingRowModel", void 0);
	    __decorate([
	        context_2.Autowired('gridOptionsWrapper'), 
	        __metadata('design:type', gridOptionsWrapper_1.GridOptionsWrapper)
	    ], MouseEventService.prototype, "gridOptionsWrapper", void 0);
	    MouseEventService = __decorate([
	        context_1.Bean('mouseEventService'), 
	        __metadata('design:paramtypes', [])
	    ], MouseEventService);
	    return MouseEventService;
	})();
	exports.MouseEventService = MouseEventService;


/***/ },
/* 31 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
	 * @version v4.0.3
	 * @link http://www.ag-grid.com/
	 * @license MIT
	 */
	var utils_1 = __webpack_require__(7);
	var gridRow_1 = __webpack_require__(32);
	var GridCell = (function () {
	    function GridCell(rowIndex, floating, column) {
	        this.rowIndex = rowIndex;
	        this.column = column;
	        this.floating = utils_1.Utils.makeNull(floating);
	    }
	    GridCell.prototype.getGridRow = function () {
	        return new gridRow_1.GridRow(this.rowIndex, this.floating);
	    };
	    GridCell.prototype.toString = function () {
	        return "rowIndex = " + this.rowIndex + ", floating = " + this.floating + ", column = " + (this.column ? this.column.getId() : null);
	    };
	    GridCell.prototype.createId = function () {
	        return this.rowIndex + "." + this.floating + "." + this.column.getId();
	    };
	    return GridCell;
	})();
	exports.GridCell = GridCell;


/***/ },
/* 32 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
	 * @version v4.0.3
	 * @link http://www.ag-grid.com/
	 * @license MIT
	 */
	var constants_1 = __webpack_require__(8);
	var utils_1 = __webpack_require__(7);
	var gridCell_1 = __webpack_require__(31);
	var GridRow = (function () {
	    function GridRow(rowIndex, floating) {
	        this.rowIndex = rowIndex;
	        this.floating = utils_1.Utils.makeNull(floating);
	    }
	    GridRow.prototype.isFloatingTop = function () {
	        return this.floating === constants_1.Constants.FLOATING_TOP;
	    };
	    GridRow.prototype.isFloatingBottom = function () {
	        return this.floating === constants_1.Constants.FLOATING_BOTTOM;
	    };
	    GridRow.prototype.isNotFloating = function () {
	        return !this.isFloatingBottom() && !this.isFloatingTop();
	    };
	    GridRow.prototype.equals = function (otherSelection) {
	        return this.rowIndex === otherSelection.rowIndex
	            && this.floating === otherSelection.floating;
	    };
	    GridRow.prototype.toString = function () {
	        return "rowIndex = " + this.rowIndex + ", floating = " + this.floating;
	    };
	    GridRow.prototype.getGridCell = function (column) {
	        return new gridCell_1.GridCell(this.rowIndex, this.floating, column);
	    };
	    // tests if this row selection is before the other row selection
	    GridRow.prototype.before = function (otherSelection) {
	        var otherFloating = otherSelection.floating;
	        switch (this.floating) {
	            case constants_1.Constants.FLOATING_TOP:
	                // we we are floating top, and other isn't, then we are always before
	                if (otherFloating !== constants_1.Constants.FLOATING_TOP) {
	                    return true;
	                }
	                break;
	            case constants_1.Constants.FLOATING_BOTTOM:
	                // if we are floating bottom, and the other isn't, then we are never before
	                if (otherFloating !== constants_1.Constants.FLOATING_BOTTOM) {
	                    return false;
	                }
	                break;
	            default:
	                // if we are not floating, but the other one is floating...
	                if (utils_1.Utils.exists(otherFloating)) {
	                    if (otherFloating === constants_1.Constants.FLOATING_TOP) {
	                        // we are not floating, other is floating top, we are first
	                        return false;
	                    }
	                    else {
	                        // we are not floating, other is floating bottom, we are always first
	                        return true;
	                    }
	                }
	                break;
	        }
	        return this.rowIndex <= otherSelection.rowIndex;
	    };
	    return GridRow;
	})();
	exports.GridRow = GridRow;


/***/ },
/* 33 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
	 * @version v4.0.3
	 * @link http://www.ag-grid.com/
	 * @license MIT
	 */
	var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
	    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
	    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
	    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
	    return c > 3 && r && Object.defineProperty(target, key, r), r;
	};
	var __metadata = (this && this.__metadata) || function (k, v) {
	    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
	};
	var context_1 = __webpack_require__(6);
	var context_2 = __webpack_require__(6);
	var TemplateService = (function () {
	    function TemplateService() {
	        this.templateCache = {};
	        this.waitingCallbacks = {};
	    }
	    // returns the template if it is loaded, or null if it is not loaded
	    // but will call the callback when it is loaded
	    TemplateService.prototype.getTemplate = function (url, callback) {
	        var templateFromCache = this.templateCache[url];
	        if (templateFromCache) {
	            return templateFromCache;
	        }
	        var callbackList = this.waitingCallbacks[url];
	        var that = this;
	        if (!callbackList) {
	            // first time this was called, so need a new list for callbacks
	            callbackList = [];
	            this.waitingCallbacks[url] = callbackList;
	            // and also need to do the http request
	            var client = new XMLHttpRequest();
	            client.onload = function () {
	                that.handleHttpResult(this, url);
	            };
	            client.open("GET", url);
	            client.send();
	        }
	        // add this callback
	        if (callback) {
	            callbackList.push(callback);
	        }
	        // caller needs to wait for template to load, so return null
	        return null;
	    };
	    TemplateService.prototype.handleHttpResult = function (httpResult, url) {
	        if (httpResult.status !== 200 || httpResult.response === null) {
	            console.warn('Unable to get template error ' + httpResult.status + ' - ' + url);
	            return;
	        }
	        // response success, so process it
	        // in IE9 the response is in - responseText
	        this.templateCache[url] = httpResult.response || httpResult.responseText;
	        // inform all listeners that this is now in the cache
	        var callbacks = this.waitingCallbacks[url];
	        for (var i = 0; i < callbacks.length; i++) {
	            var callback = callbacks[i];
	            // we could pass the callback the response, however we know the client of this code
	            // is the cell renderer, and it passes the 'cellRefresh' method in as the callback
	            // which doesn't take any parameters.
	            callback();
	        }
	        if (this.$scope) {
	            var that = this;
	            setTimeout(function () {
	                that.$scope.$apply();
	            }, 0);
	        }
	    };
	    __decorate([
	        context_2.Autowired('$scope'), 
	        __metadata('design:type', Object)
	    ], TemplateService.prototype, "$scope", void 0);
	    TemplateService = __decorate([
	        context_1.Bean('templateService'), 
	        __metadata('design:paramtypes', [])
	    ], TemplateService);
	    return TemplateService;
	})();
	exports.TemplateService = TemplateService;


/***/ },
/* 34 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
	 * @version v4.0.3
	 * @link http://www.ag-grid.com/
	 * @license MIT
	 */
	var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
	    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
	    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
	    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
	    return c > 3 && r && Object.defineProperty(target, key, r), r;
	};
	var __metadata = (this && this.__metadata) || function (k, v) {
	    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
	};
	var gridOptionsWrapper_1 = __webpack_require__(3);
	var expressionService_1 = __webpack_require__(22);
	var columnController_1 = __webpack_require__(13);
	var context_1 = __webpack_require__(6);
	var context_2 = __webpack_require__(6);
	var context_3 = __webpack_require__(6);
	var utils_1 = __webpack_require__(7);
	var events_1 = __webpack_require__(10);
	var eventService_1 = __webpack_require__(4);
	var ValueService = (function () {
	    function ValueService() {
	    }
	    ValueService.prototype.init = function () {
	        this.suppressDotNotation = this.gridOptionsWrapper.isSuppressFieldDotNotation();
	    };
	    ValueService.prototype.getValue = function (column, node) {
	        return this.getValueUsingSpecificData(column, node.data, node);
	    };
	    ValueService.prototype.getValueUsingSpecificData = function (column, data, node) {
	        var cellExpressions = this.gridOptionsWrapper.isEnableCellExpressions();
	        var colDef = column.getColDef();
	        var field = colDef.field;
	        var result;
	        // if there is a value getter, this gets precedence over a field
	        if (colDef.valueGetter) {
	            result = this.executeValueGetter(colDef.valueGetter, data, column, node);
	        }
	        else if (field && data) {
	            result = this.getValueUsingField(data, field);
	        }
	        else {
	            result = undefined;
	        }
	        // the result could be an expression itself, if we are allowing cell values to be expressions
	        if (cellExpressions && (typeof result === 'string') && result.indexOf('=') === 0) {
	            var cellValueGetter = result.substring(1);
	            result = this.executeValueGetter(cellValueGetter, data, column, node);
	        }
	        return result;
	    };
	    ValueService.prototype.getValueUsingField = function (data, field) {
	        if (!field || !data) {
	            return;
	        }
	        // if no '.', then it's not a deep value
	        if (this.suppressDotNotation || field.indexOf('.') < 0) {
	            return data[field];
	        }
	        else {
	            // otherwise it is a deep value, so need to dig for it
	            var fields = field.split('.');
	            var currentObject = data;
	            for (var i = 0; i < fields.length; i++) {
	                currentObject = currentObject[fields[i]];
	                if (!currentObject) {
	                    return null;
	                }
	            }
	            return currentObject;
	        }
	    };
	    ValueService.prototype.setValue = function (rowNode, column, newValue) {
	        if (!rowNode || !column) {
	            return;
	        }
	        // this will only happen if user is trying to paste into a group row, which doesn't make sense
	        // the user should not be trying to paste into group rows
	        var data = rowNode.data;
	        if (utils_1.Utils.missing(data)) {
	            return;
	        }
	        var field = column.getColDef().field;
	        var newValueHandler = column.getColDef().newValueHandler;
	        // need either a field or a newValueHandler for this to work
	        if (utils_1.Utils.missing(field) && utils_1.Utils.missing(newValueHandler)) {
	            return;
	        }
	        var paramsForCallbacks = {
	            node: rowNode,
	            data: rowNode.data,
	            oldValue: this.getValue(column, rowNode),
	            newValue: newValue,
	            colDef: column.getColDef(),
	            api: this.gridOptionsWrapper.getApi(),
	            context: this.gridOptionsWrapper.getContext()
	        };
	        if (newValueHandler) {
	            newValueHandler(paramsForCallbacks);
	        }
	        else {
	            this.setValueUsingField(data, field, newValue);
	        }
	        // reset quick filter on this row
	        rowNode.resetQuickFilterAggregateText();
	        paramsForCallbacks.newValue = this.getValue(column, rowNode);
	        if (typeof column.getColDef().onCellValueChanged === 'function') {
	            column.getColDef().onCellValueChanged(paramsForCallbacks);
	        }
	        this.eventService.dispatchEvent(events_1.Events.EVENT_CELL_VALUE_CHANGED, paramsForCallbacks);
	    };
	    ValueService.prototype.setValueUsingField = function (data, field, newValue) {
	        // if no '.', then it's not a deep value
	        if (this.suppressDotNotation || field.indexOf('.') < 0) {
	            data[field] = newValue;
	        }
	        else {
	            // otherwise it is a deep value, so need to dig for it
	            var fieldPieces = field.split('.');
	            var currentObject = data;
	            while (fieldPieces.length > 0 && currentObject) {
	                var fieldPiece = fieldPieces.shift();
	                if (fieldPieces.length === 0) {
	                    currentObject[fieldPiece] = newValue;
	                }
	                else {
	                    currentObject = currentObject[fieldPiece];
	                }
	            }
	        }
	    };
	    ValueService.prototype.executeValueGetter = function (valueGetter, data, column, node) {
	        var context = this.gridOptionsWrapper.getContext();
	        var api = this.gridOptionsWrapper.getApi();
	        var params = {
	            data: data,
	            node: node,
	            colDef: column.getColDef(),
	            api: api,
	            context: context,
	            getValue: this.getValueCallback.bind(this, data, node)
	        };
	        if (typeof valueGetter === 'function') {
	            // valueGetter is a function, so just call it
	            return valueGetter(params);
	        }
	        else if (typeof valueGetter === 'string') {
	            // valueGetter is an expression, so execute the expression
	            return this.expressionService.evaluate(valueGetter, params);
	        }
	    };
	    ValueService.prototype.getValueCallback = function (data, node, field) {
	        var otherColumn = this.columnController.getColumn(field);
	        if (otherColumn) {
	            return this.getValueUsingSpecificData(otherColumn, data, node);
	        }
	        else {
	            return null;
	        }
	    };
	    __decorate([
	        context_2.Autowired('gridOptionsWrapper'), 
	        __metadata('design:type', gridOptionsWrapper_1.GridOptionsWrapper)
	    ], ValueService.prototype, "gridOptionsWrapper", void 0);
	    __decorate([
	        context_2.Autowired('expressionService'), 
	        __metadata('design:type', expressionService_1.ExpressionService)
	    ], ValueService.prototype, "expressionService", void 0);
	    __decorate([
	        context_2.Autowired('columnController'), 
	        __metadata('design:type', columnController_1.ColumnController)
	    ], ValueService.prototype, "columnController", void 0);
	    __decorate([
	        context_2.Autowired('eventService'), 
	        __metadata('design:type', eventService_1.EventService)
	    ], ValueService.prototype, "eventService", void 0);
	    __decorate([
	        context_3.PostConstruct, 
	        __metadata('design:type', Function), 
	        __metadata('design:paramtypes', []), 
	        __metadata('design:returntype', void 0)
	    ], ValueService.prototype, "init", null);
	    ValueService = __decorate([
	        context_1.Bean('valueService'), 
	        __metadata('design:paramtypes', [])
	    ], ValueService);
	    return ValueService;
	})();
	exports.ValueService = ValueService;


/***/ },
/* 35 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
	 * @version v4.0.3
	 * @link http://www.ag-grid.com/
	 * @license MIT
	 */
	var svgFactory_1 = __webpack_require__(36);
	var utils_1 = __webpack_require__(7);
	var constants_1 = __webpack_require__(8);
	var events_1 = __webpack_require__(10);
	var svgFactory = svgFactory_1.SvgFactory.getInstance();
	function groupCellRendererFactory(gridOptionsWrapper, selectionRendererFactory, expressionService, eventService) {
	    return function groupCellRenderer(params) {
	        var eGroupCell = document.createElement('span');
	        var node = params.node;
	        var cellExpandable = node.group && !node.footer;
	        if (cellExpandable) {
	            addExpandAndContract(eGroupCell, params);
	        }
	        var checkboxNeeded = params.colDef && params.colDef.cellRenderer && params.colDef.cellRenderer.checkbox && !node.footer;
	        if (checkboxNeeded) {
	            var eCheckbox = selectionRendererFactory.createSelectionCheckbox(node, params.rowIndex, params.addRenderedRowListener);
	            eGroupCell.appendChild(eCheckbox);
	        }
	        if (params.colDef && params.colDef.cellRenderer && params.colDef.cellRenderer.innerRenderer) {
	            createFromInnerRenderer(eGroupCell, params, params.colDef.cellRenderer.innerRenderer);
	        }
	        else if (node.footer) {
	            createFooterCell(eGroupCell, params);
	        }
	        else if (node.group) {
	            createGroupCell(eGroupCell, params);
	        }
	        else {
	            createLeafCell(eGroupCell, params);
	        }
	        // only do this if an indent - as this overwrites the padding that
	        // the theme set, which will make things look 'not aligned' for the
	        // first group level.
	        var suppressPadding = params.colDef && params.colDef.cellRenderer
	            && params.colDef.cellRenderer.suppressPadding;
	        if (!suppressPadding && (node.footer || node.level > 0)) {
	            var paddingFactor;
	            if (params.colDef && params.colDef.cellRenderer && params.colDef.cellRenderer.padding >= 0) {
	                paddingFactor = params.colDef.cellRenderer.padding;
	            }
	            else {
	                paddingFactor = 10;
	            }
	            var paddingPx = node.level * paddingFactor;
	            if (node.footer) {
	                paddingPx += 10;
	            }
	            else if (!node.group) {
	                paddingPx += 5;
	            }
	            eGroupCell.style.paddingLeft = paddingPx + 'px';
	        }
	        return eGroupCell;
	    };
	    function addExpandAndContract(eGroupCell, params) {
	        var eExpandIcon = createGroupExpandIcon(true);
	        var eContractIcon = createGroupExpandIcon(false);
	        eGroupCell.appendChild(eExpandIcon);
	        eGroupCell.appendChild(eContractIcon);
	        eExpandIcon.addEventListener('click', expandOrContract);
	        eContractIcon.addEventListener('click', expandOrContract);
	        eGroupCell.addEventListener('dblclick', expandOrContract);
	        showAndHideExpandAndContract(eExpandIcon, eContractIcon, params.node.expanded);
	        // if parent cell was passed, then we can listen for when focus is on the cell,
	        // and then expand / contract as the user hits enter or space-bar
	        if (params.eGridCell) {
	            params.eGridCell.addEventListener('keydown', function (event) {
	                if (utils_1.Utils.isKeyPressed(event, constants_1.Constants.KEY_ENTER)) {
	                    expandOrContract();
	                    event.preventDefault();
	                }
	            });
	        }
	        function expandOrContract() {
	            expandGroup(eExpandIcon, eContractIcon, params);
	        }
	    }
	    function showAndHideExpandAndContract(eExpandIcon, eContractIcon, expanded) {
	        utils_1.Utils.setVisible(eExpandIcon, !expanded);
	        utils_1.Utils.setVisible(eContractIcon, expanded);
	    }
	    function createFromInnerRenderer(eGroupCell, params, renderer) {
	        utils_1.Utils.useRenderer(eGroupCell, renderer, params);
	    }
	    function getRefreshFromIndex(params) {
	        if (gridOptionsWrapper.isGroupIncludeFooter()) {
	            return params.rowIndex;
	        }
	        else {
	            return params.rowIndex + 1;
	        }
	    }
	    function expandGroup(eExpandIcon, eContractIcon, params) {
	        params.node.expanded = !params.node.expanded;
	        var refreshIndex = getRefreshFromIndex(params);
	        params.api.onGroupExpandedOrCollapsed(refreshIndex);
	        showAndHideExpandAndContract(eExpandIcon, eContractIcon, params.node.expanded);
	        var event = { node: params.node };
	        eventService.dispatchEvent(events_1.Events.EVENT_ROW_GROUP_OPENED, event);
	    }
	    function createGroupExpandIcon(expanded) {
	        var eIcon;
	        if (expanded) {
	            eIcon = utils_1.Utils.createIcon('groupContracted', gridOptionsWrapper, null, svgFactory.createArrowRightSvg);
	        }
	        else {
	            eIcon = utils_1.Utils.createIcon('groupExpanded', gridOptionsWrapper, null, svgFactory.createArrowDownSvg);
	        }
	        utils_1.Utils.addCssClass(eIcon, 'ag-group-expand');
	        return eIcon;
	    }
	    // creates cell with 'Total {{key}}' for a group
	    function createFooterCell(eGroupCell, params) {
	        var footerValue;
	        var groupName = getGroupName(params);
	        if (params.colDef && params.colDef.cellRenderer && params.colDef.cellRenderer.footerValueGetter) {
	            var footerValueGetter = params.colDef.cellRenderer.footerValueGetter;
	            // params is same as we were given, except we set the value as the item to display
	            var paramsClone = utils_1.Utils.cloneObject(params);
	            paramsClone.value = groupName;
	            if (typeof footerValueGetter === 'function') {
	                footerValue = footerValueGetter(paramsClone);
	            }
	            else if (typeof footerValueGetter === 'string') {
	                footerValue = expressionService.evaluate(footerValueGetter, paramsClone);
	            }
	            else {
	                console.warn('ag-Grid: footerValueGetter should be either a function or a string (expression)');
	            }
	        }
	        else {
	            footerValue = 'Total ' + groupName;
	        }
	        var eText = document.createTextNode(footerValue);
	        eGroupCell.appendChild(eText);
	    }
	    function getGroupName(params) {
	        var cellRenderer = params.colDef.cellRenderer;
	        if (cellRenderer && cellRenderer.keyMap
	            && typeof cellRenderer.keyMap === 'object' && params.colDef.cellRenderer !== null) {
	            var valueFromMap = cellRenderer.keyMap[params.node.key];
	            if (valueFromMap) {
	                return valueFromMap;
	            }
	            else {
	                return params.node.key;
	            }
	        }
	        else {
	            return params.node.key;
	        }
	    }
	    // creates cell with '{{key}} ({{childCount}})' for a group
	    function createGroupCell(eGroupCell, params) {
	        var groupName = getGroupName(params);
	        var colDefOfGroupedCol = params.api.getColumnDef(params.node.field);
	        if (colDefOfGroupedCol && typeof colDefOfGroupedCol.cellRenderer === 'function') {
	            params.value = groupName;
	            utils_1.Utils.useRenderer(eGroupCell, colDefOfGroupedCol.cellRenderer, params);
	        }
	        else {
	            eGroupCell.appendChild(document.createTextNode(groupName));
	        }
	        // only include the child count if it's included, eg if user doing custom aggregation,
	        // then this could be left out, or set to -1, ie no child count
	        var suppressCount = params.colDef.cellRenderer && params.colDef.cellRenderer.suppressCount;
	        if (!suppressCount && params.node.allChildrenCount >= 0) {
	            eGroupCell.appendChild(document.createTextNode(" (" + params.node.allChildrenCount + ")"));
	        }
	    }
	    // creates cell with '{{key}} ({{childCount}})' for a group
	    function createLeafCell(eParent, params) {
	        if (utils_1.Utils.exists(params.value)) {
	            var eText = document.createTextNode(' ' + params.value);
	            eParent.appendChild(eText);
	        }
	    }
	}
	exports.groupCellRendererFactory = groupCellRendererFactory;


/***/ },
/* 36 */
/***/ function(module, exports) {

	/**
	 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
	 * @version v4.0.3
	 * @link http://www.ag-grid.com/
	 * @license MIT
	 */
	var SVG_NS = "http://www.w3.org/2000/svg";
	var SvgFactory = (function () {
	    function SvgFactory() {
	    }
	    SvgFactory.getInstance = function () {
	        if (!this.theInstance) {
	            this.theInstance = new SvgFactory();
	        }
	        return this.theInstance;
	    };
	    SvgFactory.prototype.createFilterSvg = function () {
	        var eSvg = createIconSvg();
	        var eFunnel = document.createElementNS(SVG_NS, "polygon");
	        eFunnel.setAttribute("points", "0,0 4,4 4,10 6,10 6,4 10,0");
	        eFunnel.setAttribute("class", "ag-header-icon");
	        eSvg.appendChild(eFunnel);
	        return eSvg;
	    };
	    SvgFactory.prototype.createFilterSvg12 = function () {
	        var eSvg = createIconSvg(12);
	        var eFunnel = document.createElementNS(SVG_NS, "polygon");
	        eFunnel.setAttribute("points", "0,0 5,5 5,12 7,12 7,5 12,0");
	        eFunnel.setAttribute("class", "ag-header-icon");
	        eSvg.appendChild(eFunnel);
	        return eSvg;
	    };
	    SvgFactory.prototype.createMenuSvg = function () {
	        var eSvg = document.createElementNS(SVG_NS, "svg");
	        var size = "12";
	        eSvg.setAttribute("width", size);
	        eSvg.setAttribute("height", size);
	        ["0", "5", "10"].forEach(function (y) {
	            var eLine = document.createElementNS(SVG_NS, "rect");
	            eLine.setAttribute("y", y);
	            eLine.setAttribute("width", size);
	            eLine.setAttribute("height", "2");
	            eLine.setAttribute("class", "ag-header-icon");
	            eSvg.appendChild(eLine);
	        });
	        return eSvg;
	    };
	    SvgFactory.prototype.createColumnsSvg12 = function () {
	        var eSvg = createIconSvg(12);
	        [0, 4, 8].forEach(function (y) {
	            [0, 7].forEach(function (x) {
	                var eBar = document.createElementNS(SVG_NS, "rect");
	                eBar.setAttribute("y", y.toString());
	                eBar.setAttribute("x", x.toString());
	                eBar.setAttribute("width", "5");
	                eBar.setAttribute("height", "3");
	                eBar.setAttribute("class", "ag-header-icon");
	                eSvg.appendChild(eBar);
	            });
	        });
	        return eSvg;
	    };
	    SvgFactory.prototype.createArrowUpSvg = function () {
	        return createPolygonSvg("0,10 5,0 10,10");
	    };
	    SvgFactory.prototype.createArrowLeftSvg = function () {
	        return createPolygonSvg("10,0 0,5 10,10");
	    };
	    SvgFactory.prototype.createArrowDownSvg = function () {
	        return createPolygonSvg("0,0 5,10 10,0");
	    };
	    SvgFactory.prototype.createArrowRightSvg = function () {
	        return createPolygonSvg("0,0 10,5 0,10");
	    };
	    SvgFactory.prototype.createSmallArrowRightSvg = function () {
	        return createPolygonSvg("0,0 6,3 0,6", 6);
	    };
	    SvgFactory.prototype.createSmallArrowDownSvg = function () {
	        return createPolygonSvg("0,0 3,6 6,0", 6);
	    };
	    //public createOpenSvg() {
	    //    return createPlusMinus(true);
	    //}
	    //
	    //public createCloseSvg() {
	    //    return createPlusMinus(false);
	    //}
	    // UnSort Icon SVG
	    SvgFactory.prototype.createArrowUpDownSvg = function () {
	        var svg = createIconSvg();
	        var eAscIcon = document.createElementNS(SVG_NS, "polygon");
	        eAscIcon.setAttribute("points", '0,4 5,0 10,4');
	        svg.appendChild(eAscIcon);
	        var eDescIcon = document.createElementNS(SVG_NS, "polygon");
	        eDescIcon.setAttribute("points", '0,6 5,10 10,6');
	        svg.appendChild(eDescIcon);
	        return svg;
	    };
	    //public createFolderOpen(size: number): HTMLElement {
	    //    var svg = `<svg width="${size}" height="${size}" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg"><path d="M1717 931q0-35-53-35h-1088q-40 0-85.5 21.5t-71.5 52.5l-294 363q-18 24-18 40 0 35 53 35h1088q40 0 86-22t71-53l294-363q18-22 18-39zm-1141-163h768v-160q0-40-28-68t-68-28h-576q-40 0-68-28t-28-68v-64q0-40-28-68t-68-28h-320q-40 0-68 28t-28 68v853l256-315q44-53 116-87.5t140-34.5zm1269 163q0 62-46 120l-295 363q-43 53-116 87.5t-140 34.5h-1088q-92 0-158-66t-66-158v-960q0-92 66-158t158-66h320q92 0 158 66t66 158v32h544q92 0 158 66t66 158v160h192q54 0 99 24.5t67 70.5q15 32 15 68z"/></svg>`;
	    //    return _.loadTemplate(svg);
	    //}
	    //
	    //public createFolderClosed(size: number): HTMLElement {
	    //    var svg = `<svg width="${size}" height="${size}" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg"><path d="M1600 1312v-704q0-40-28-68t-68-28h-704q-40 0-68-28t-28-68v-64q0-40-28-68t-68-28h-320q-40 0-68 28t-28 68v960q0 40 28 68t68 28h1216q40 0 68-28t28-68zm128-704v704q0 92-66 158t-158 66h-1216q-92 0-158-66t-66-158v-960q0-92 66-158t158-66h320q92 0 158 66t66 158v32h672q92 0 158 66t66 158z"/></svg>`;
	    //    return _.loadTemplate(svg);
	    //}
	    SvgFactory.prototype.createFolderOpen = function () {
	        var eImg = document.createElement('img');
	        eImg.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAZpJREFUeNqkU0tLQkEUPjN3ShAzF66CaNGiaNEviFpLgbSpXf2ACIqgFkELaVFhtAratQ8qokU/oFVbMQtJvWpWGvYwtet9TWfu1QorvOGBb84M5/WdOTOEcw7tCKHBlT8sMIhr4BfLGXC4BrALM8QUoveHG9oPQ/NhwVCQbOjp0C5F6zDiwE7Aed/p5tKWruufTlY8bkqliqVN8wvH6wvhydWd5UYdkYCqqgaKotQTCEewnJuDBSqVmshOrWhKgCJVqeHcKtiGKdqTgGIOQmwGum7AxVUKinXKzX1/1y5Xp6g8gpe8iBxuGZhcKjyXQZIkmBkfczS62YnRQCKX75/b3t8QDNhD8QX83V5Ipe7Bybug2Pt5NJ7A4nEqGOQKT+Bzu0HTDNB1syUYYxCJy0kwzIRogb0rKjAiQVXXHLVQrqqvsZtsFu8hbyXwe73WeMQtO5GonJGxuiyeC+Oa4fF5PEirw9nbx9FdxtN5eMwkzcgRnoeCa9DVM/CvH/R2l+axkz3clQguOFjw1f+FUzEQCqJG2v3OHwIMAOW1JPnAAAJxAAAAAElFTkSuQmCC';
	        return eImg;
	    };
	    SvgFactory.prototype.createFolderClosed = function () {
	        var eImg = document.createElement('img');
	        eImg.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAARlJREFUeNqsUz1PwzAUPDtOUASpYKkQVWcQA/+DhbLA32CoKAMSTAwgFsQfQWLoX4GRDFXGIiqiyk4e7wUWmg8phJPOtvzunc6WrYgIXaD06KKhij0eD2uqUxBeDC9OmcNKCYd7ujm7ryodXz5ong6UPpqcP9+O76y1vwS+7yOOY1jr0OttlQyiaB0n148TAyK9XFqkaboiSTEYDNnkDUkyKxkkiSQkzQbwsiyHcBXz+Tv6/W1m+QiSEDT1igTO5RBWYbH4rNwPw/AnQU5ek0EdCj33SgLjHEHYzoAkgfmHBDmZuktsQqHPvxN0MyCbbWjtIQjWWhlIj/QqtT+6QrSz+6ef9DF7VTwFzE2madnu5K2prt/5S4ABADcIlSf6Ag8YAAAAAElFTkSuQmCC';
	        return eImg;
	    };
	    SvgFactory.prototype.createColumnIcon = function () {
	        var eImg = document.createElement('img');
	        eImg.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAYAAAAOCAYAAAAMn20lAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6RTcwQ0JFMzlENjZEMTFFNUFEQ0U5RDRCNjFFRENGMUMiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6RTcwQ0JFM0FENjZEMTFFNUFEQ0U5RDRCNjFFRENGMUMiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpFNzBDQkUzN0Q2NkQxMUU1QURDRTlENEI2MUVEQ0YxQyIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpFNzBDQkUzOEQ2NkQxMUU1QURDRTlENEI2MUVEQ0YxQyIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PqDOrJYAAABxSURBVHjalJBBDsAgCAQXxXvj2/o/X9Cvmd4lUpV4MXroJMTAuihQSklVMSCysxSBW4uWKzjG6zZLDxrlWis5EVEThoWmi3N+nxAYs2WnXQY34L3HisMWPQlHB+2FPtNW6D/8+ziBRcroOXc0B/wEGABY6TPS1FU0bwAAAABJRU5ErkJggg==';
	        return eImg;
	    };
	    SvgFactory.prototype.createColumnsIcon = function () {
	        var eImg = document.createElement('img');
	        eImg.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6OENFQkI4NDhENzJDMTFFNUJDNEVFRjgwRDI3MkU1Q0EiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6OENFQkI4NDlENzJDMTFFNUJDNEVFRjgwRDI3MkU1Q0EiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo4Q0VCQjg0NkQ3MkMxMUU1QkM0RUVGODBEMjcyRTVDQSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo4Q0VCQjg0N0Q3MkMxMUU1QkM0RUVGODBEMjcyRTVDQSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pj6ozGQAAAAuSURBVHjaYmRgYPjPgBswQml8anBK/idGDQsxNpCghnTAOBoGo2EwGgZgABBgAHbrH/l4grETAAAAAElFTkSuQmCC';
	        return eImg;
	    };
	    SvgFactory.prototype.createPinIcon = function () {
	        var eImg = document.createElement('img');
	        eImg.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAedJREFUeNqkUktLG1EYPTN31CIN0oWbIAWhKJR0FXcG6gOqkKGKVvEXCKULC91YSBcK7jXgQoIbFxn3ErFgFlIfCxUsQsCoIJYEm9LWNsGmJjPTM+Oo44Aa6IUzd+bec77H+UYyTRP/s5SsLFfCCxEjOhD9CXw64ccXJj7nLleYaMSvaa/+Au9Y73P3RUUBDIuXyaAxGu35A7xnkM57A7icCZXIO8/nkVleRn1/f9cv0xzjfVclFdi9N8ZivfnDQxQKBTwoFvFicLCVQSesJIpHMEY8dSqQWa54Eov1fF9ZQVHXsZNMblhnNE/wPmJPIX1zjOG2+fkgslnozHR2eopLcSIe3yoD48y45FbIxoVJNjimyMehoW3T58PvdBq53V18zeWwFo+vUfyBlCVvj0Li4/M1DnaAUtXCQkNDR4f/294eaoTAwdHRCROMWlzJZfC+1cKcJF07b5o+btWvV1eDyVBouyUcDj5UFDg924tVYtERpz0mCkmSulOp1GQgEIj0yvKPYiKBlwMDQXfPU47walEEmb8z0a5p2qaiKMPEoz6ezQLdM8DWNDDzltym24YthHimquoshSoDicvzZkK9S+h48pjCN4ZhrBPHTptlD0qevezwdCtAHVHrMti4A7rr3eb+E2AAoGnGkgkzpg8AAAAASUVORK5CYII=';
	        return eImg;
	    };
	    SvgFactory.prototype.createPlusIcon = function () {
	        var eImg = document.createElement('img');
	        eImg.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAatJREFUeNqkU71KA0EQ/vaiib+lWCiordidpSg+QHwDBSt7n8DGhwhYCPoEgqCCINomARuLVIqgYKFG5f6z68xOzrvzYuXA3P7MzLffN7unjDH4jw3xx91bQXuxU4woNDjUX7VgsFOIH3/BnHgC0J65AzwFjDpZgoG7vb7lMsPDq6MiuK+B+kjGwFpCUjwK1DIQ3/dl0ssVh5TTM0UJP8aBgBKGleSGIWyP0oKYRm3KPSgYJ0Q0EpEgCASA2WmWZQY3kazBmjP9UhBFEbTWAgA0f9W2yHeG+vrd+tqGy5r5xNTT9erSqpvfdxwHN7fXOQZ0QhzH1oWArLsfXXieJ/KTGEZLcbVaTVn9ALTOLk9L+mYX5lxd0Xh6eGyVgspK6APwI8n3x9hmNpORJOuBo5ah8GcTc7dAHmkhNpYQlpHr47Hq2NspA1yEwHkoO/MVYLMmWJNarjEUQBzQw7rPvardFC8tZuOEwwB4p9PHqXgCdm738sUDJPB8mnwKj7qCTtJ527+XyAs6tOf2Bb6SP0OeGxRTVMp2h9nweWMoKS20l3+QT/vwqfZbgAEAUCrnlLQ+w4QAAAAASUVORK5CYII=';
	        return eImg;
	    };
	    SvgFactory.prototype.createMinusIcon = function () {
	        var eImg = document.createElement('img');
	        eImg.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAKVJREFUeNpi/P//PwMlgImBQjBqAAMDy3JGRgZGBoaZQGxMikZg3J0F4nSWHxC+cUBamvHXr18Zfv36Bca/f/8G43///oExKLphmImJieHagQMQF7QDiSwg/vnzJ8P3799RDPj79y+KRhhmBLr6I1DPNJABtxkYZM4xMFx7uXAhSX5/CtQD0gv0OgMfyCAgZgViZiL1/wXi30D8h3E0KVNuAECAAQDr51qtGxzf1wAAAABJRU5ErkJggg==';
	        return eImg;
	    };
	    SvgFactory.prototype.createMoveIcon = function () {
	        var eImg = document.createElement('img');
	        eImg.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAoZJREFUeNpsU81rE0EUf7uzu2lNVJL6Eb0IBWusepqcKm3wEFkvxqDgQbwUtYeeg5cccwj4F7QKChEPipRcdMGDiaAoJAexLYViwYsfbU1JYkx3Zz98b8220Wbg7ez7vXm/mffmN9Kh1G2QGQOmMDiRyYEkSaCoKjDGdAAooOUdxzFsIcDzPPhSvgeO7YDrOLBRmQdlJHULVE0DNRSCvqFjUuHqhWP8+etvhR5m0CeengVhmiAsywdl2Dt03K1wZSrO220XaCaf8AFrQel32s0mrDcaWfovrq3Vc9OTvHj/Tb0Xzh6JxQwNyxtIgPXpqqJk94fDM+1Oh6CaEF4QTiIOGJ/DdQtBObsEmGxbll/rkCyDPDwMzW4XhHD88EH0NcRxDUeX4/qdnsi0s8Aas+kEp8Zg82pMkmpDigKbjSbQTD7hFL94/jin9ZRHBNLo3Wrt+uUkbzQsiEZVMPGKfv76DaawodnahkhY86+PNnXxs77ZgVOjMahWVuufi1NJRZhWvvT0beHGtQn++Nm7en+DzqXO8vfVxX+wsYnT/JWxWEe95P0eILsvkkdPKn4PUEBJmunILab5992PLVU++skoNmOniT7JX2Fkt5GM1EjqbMohXzQmqo7KwCQ6zYKiabu30PpQAnZ0HKSRMcMRwnBddw4ZOO4GLRYKFFdDhrrteTMMdWB9/QTdH8sIp0EKmNT4GWDjGZAPJ3TcrbBv+ibfwtwDqBvzYck/truxYjjLZRDflwLt7JUmEoAymdPV7INa5IXn0Uw+4f8PIqATMLQIWpQ0E/RFTmQ4nLx0B1Zfzrsr5eAmbLQW2hYpHwkcqfegNBJhzwY9sGC4aCZaF81CAvePAAMAcwtApJX/Wo0AAAAASUVORK5CYII=';
	        return eImg;
	    };
	    SvgFactory.prototype.createLeftIcon = function () {
	        var eImg = document.createElement('img');
	        eImg.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAe9JREFUeNqkUz1oE2EYfu7uuyRKLCFt6g+4VNQWWod+mQRRR1En0UFOHKoNCMKNju4SEQsOzsFNcRGl4CS42AzaKhKcsqhk0Etj7u+773y/6+USbOLSF5574b33eX+e906L4xh7MaYeC/c/IFcowMznEzDTBGPMoldnqEFtkPy708mIqvHHe0s7BcaYJYSwRwPu9vbYRH1XJI4tEYb2jYtHOHko9LvdxE9cYZQcBoF9+9oJ7jgRQt+HFAJSyv9rkO6UkGvXF3mr9QelkpkUINsYR6T8Jrkay8i+b9+5yfnmppMmSFw6e4yrIynBBsdS3jQ1PH/zeTiBIt+9dZpvbTlZh1+Oh/Z3F33XRUj7R1GUxA3DwMx0EYHnDUUMPe9Rfe1tc26uiL6M8aXno+UH6O7PIShPIapMQx6sQMxW4JbL+MkKCKhwNgGN2FD7Pnz82j63coF/aoc4ekDHtxfrzUniaZrW/FfEBomI9Scv7fnVq7zdBwIqajBWpeTd99d3vgBNCaQSzMOLyJ+6ApSPWxSzD61a/MfThupSjVuvxk2A3sazYYGBGbML0OcvW9rMyeRLFO8eVGXnKyacMiug5ikSplLs05dXzqNQWpbv6/URjpK+m6JH3GhQQI2QI+RTmBO0EwQ/RUBcqe31d/4rwAB0lPTXqN6HzgAAAABJRU5ErkJggg==';
	        return eImg;
	    };
	    SvgFactory.prototype.createRightIcon = function () {
	        var eImg = document.createElement('img');
	        eImg.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAfBJREFUeNqkUz1s00AU/hwSh1SEhiFCYuhCVSExgHRiYKjEVCEyMMGAsjCxZunesWM7dIgEA8JISPyoUhFDFoZOSE2GgtrSIAYWSEPb1HUS23c+8+7iuE5/JKQ+6fOdz/e+970fG2EY4jyWVo9b819hGEZ8WCgW4z2dV2lZFUJYgnNwz9PwXRebc3cGBMfN6XSQy+eHryyCMuv43dRpBCpSz7b1qlB+cI3RWkEYlv+LQFkgBLxuV8s9OAhQLk0w7vsnSHQKVMhqQuYRSRBouK5AqyXwpHSdvfywUYkKb8UEFIU9fXybOY6A+jbszGAP7O/7RBKg2eR4dH+KvV5ej0k0gaqobXO0214c3acUDnt99Pp9cKqDUqLsx68LuHd3gtU+b1eOCOiSaaZQKJjgMsSOy7EnJcSYCZnLwKbojic1weTVMXz81KhTexeSKdSXqrUzh2X84Qxr9SQmx1P48q6mnTPZrJUs4jMp5QlHlSd1Y203fRGFK8DPV28HzqZpjXShW3+D00bamCrpNU9DuvvcGsjea1rO+nvw39+AxRCGckyO8ciQFG8gPT27ptX8/b4gt1asYGdzRGE6MVCXCJcj5NShbG9B/NnYhttpyMYL5XmTYEdw1KgMFSgJJiEbIXNGPQXBi+CTrzTO+zv/E2AA3Y8Nbp4Kn1sAAAAASUVORK5CYII=';
	        return eImg;
	    };
	    SvgFactory.prototype.createColumnVisibleIcon = function () {
	        var eImg = document.createElement('img');
	        eImg.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAdhJREFUeNrUk01LAlEUhu845QdRUxZBhIIWtFBso2AwRAVNLqKltHCb63b9A/9AixZCELhyYdAmEyYCBcOlNa1CSQoxog/DMY3x9p5B27Zw1YGH8XrO+55759wROOdsmLCwIWNoAwFh/ugfZQKsAQV4gbNf9woqIAeuQHOgGxgIMNix2Wx7iqIsxmKxWU3TxgqFgpWSsix3fT5fK5VKPedyuftOp5OE7oz60hHsYD8UCh3k83k5k8ksGYYx5XK5rK2WzgiIrPQf5aiGakljakVRjKDrZaPR6Oi6zglVVTlFMnnMZXmdK8o2x674IE+1pCHtCFx2w+GwE9u3drtd81yJRAKdDXZ4eGSuFxb87PHxjg3yVEsaNNolg5NSqTTVbDaX7Agq8Hg8TFWLbGVl0xTY7TY2Our5NfhCQPNAWtFisdSr1WqvWCwawWBwRpKkcZyXadoN83qXmSQ50V1jGxurpnGlUqnH4/FzvItTmoo5ApjQNMIOh2MrEon4o9Gov1arzZXL5XHKBwKBT7fbXU+n07fZbPa23W5f4BVd93o9TgYimATTMHHCbB5PN9ZSf0LmrsEHRDWInvB8w/oFvAv920iFDkBzF/64fHTjvoFOxsL//5h+BBgAwjbgRLl5ImwAAAAASUVORK5CYII=';
	        return eImg;
	    };
	    SvgFactory.prototype.createColumnHiddenIcon = function () {
	        var eImg = document.createElement('img');
	        eImg.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6N0ZGNDRBMkJENkU3MTFFNUIwOTBGRTc0MTA3OTI2OEYiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6N0ZGNDRBMkNENkU3MTFFNUIwOTBGRTc0MTA3OTI2OEYiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo3RkY0NEEyOUQ2RTcxMUU1QjA5MEZFNzQxMDc5MjY4RiIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo3RkY0NEEyQUQ2RTcxMUU1QjA5MEZFNzQxMDc5MjY4RiIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PjQ0mkwAAACISURBVHjaYvz//z8DJYCJgUIwDAxgKSwspMwAIOYDYlcgtgNiJSBWBGJhIGaHyoHAJyD+CcRvgfg+EN8D4kNAvBtkwGEg1iNgkSCUlgBibSg7D4gvgwywRXKBChArALEIELMCsQBU8Qcg/g3Eb4D4ARDfBeKDMBeAnLcWikkGjKMpcRAYABBgACqXGpPEq63VAAAAAElFTkSuQmCC';
	        return eImg;
	    };
	    SvgFactory.prototype.createGroupIcon = function () {
	        var eImg = document.createElement('img');
	        eImg.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6NUVCNUI1OUNENkYwMTFFNThGNjJDNUE3ODIwMEZERDciIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6NUVCNUI1OURENkYwMTFFNThGNjJDNUE3ODIwMEZERDciPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo1RUI1QjU5QUQ2RjAxMUU1OEY2MkM1QTc4MjAwRkRENyIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo1RUI1QjU5QkQ2RjAxMUU1OEY2MkM1QTc4MjAwRkRENyIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PlkCTGoAAACDSURBVHjaYmRgYPjPgBswQun/+BT8X3x5DoZErG4KCj/3/DcMNZMNuRiYGPADRiRX4HYBJV5AB0QrhAGW//8hehgZES6FiaGLYzUAq7sxNf0nxQCsinHFAguegCPKBYxoYfAfWQxNnPgwINJVYMDEQCEYfLHASGoKRQlxPN7BqQggwAAN+SopPnDCwgAAAABJRU5ErkJggg==';
	        return eImg;
	    };
	    SvgFactory.prototype.createAggregationIcon = function () {
	        var eImg = document.createElement('img');
	        eImg.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAMZJREFUeNpi/P//PwMlgImBQjDwBrCgmMYENq8RiLVxqL8KxPX//v1DiIACEYYZGRlBmBOIe4B4PRDrQMUYoGyQGIoebAbADJkAxFuAWA9JXJdYA0CYC4inAPFOINZHlkPWgxKIcFMhQA0aFveB+DbOUERxDhQAbTEC4qNAPBfqEmRx3F6AAhOgojNAvBikGckumDiKHhY0B3ECcTVQQhRIg/B1NNeeB1IgQ7/BXYvmdE6oAnYcPv4NxF+BerAbMDTzAkCAAQChYIl8b86M1gAAAABJRU5ErkJggg==';
	        return eImg;
	    };
	    SvgFactory.prototype.createGroupIcon12 = function () {
	        var eImg = document.createElement('img');
	        eImg.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAYAAABWdVznAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6MTNFQzE0NTdEOTk1MTFFNUI4MjJGMjBFRDk4MkMxNjAiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6MTNFQzE0NThEOTk1MTFFNUI4MjJGMjBFRDk4MkMxNjAiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDoxM0VDMTQ1NUQ5OTUxMUU1QjgyMkYyMEVEOTgyQzE2MCIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDoxM0VDMTQ1NkQ5OTUxMUU1QjgyMkYyMEVEOTgyQzE2MCIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PiInRbAAAAEjSURBVHjaYuTi5XqkpKvI9/fXHwZWDlaGZ/eeM7x59raDAQj4pOQrBBUVGP78+MfAzMbE8PLKhU8Mhnb6/6//P/f/8N/d/x8AWUn1cf+BaleCsFPt5P/T/v//3/zj//8JQFrB1vM/I5IN3EAbfgBt+Au0QRBqw3sMG0DiQMwPxFuB2BzKZmLAAViA+BOU/QOI7wPxRyhfCIhT0NT/ZETi7AZiZiD+DOXL6EdlGdkWFzF8evaDgUuIg2F9eiTYBrhuIJ4NxHegfDsgnobuJGQbNgBxMRDfhfLFgDgB3UnInPVALMxAACDbcBGItwDxAyhfCRismejBiuyHiUBsDMQmUL6cSXIJf0hTDsNboEN42RkYJth58TPisV0eaMNFdBsAAgwANVJzd8zQrUcAAAAASUVORK5CYII=';
	        return eImg;
	    };
	    SvgFactory.prototype.createCutIcon = function () {
	        var eImg = document.createElement('img');
	        eImg.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAlRJREFUeNqkU09okmEcfj6ThNRhjUEJDhxDZ1t4sI3lDrKDhESHpC6x6yBoh52GfcdBJDvtElEUdKhOSq1JjF0SabSton9OmIeRxVKIrUgdU5xvv8e+hXXYpRcefv+e5/mh7/tpSin8z9Gi0Sg0TTsv+edarfa+Wq2iUqmgXC6DudVqhd1uh81ma+UWi8Uv3G5ZPJ9MJmGq1+twOBynBOek6T9oG+fkkU8djymVSiGTyWBiYuL6QSb7YvLIp679+D0ej57NZpX8JD0QCPj7+vrgcrnAyJp9zskj3zD928Tr9er5fF5FIhFdiH4aMLJmn/N98R+Dq5qGSUFQwKFs1AuFggqFQrrT6bzIyJp9zoMGn7qWQU6ST4JNQeK3kd/n8+nFYlGFw+HFdDqtWLOfMHjk5wwDjckRwGYGeJVnBMdXgaNrbveJKysr/etu91pHtVo8BnyXWUnwsgHM7wAVX7MJ0cEmjWvW4eGzjpGRXnNnZ8cFeRi9pRI+dnXtjMbj/cLp57rG1tbPH0tLwd3l5QHp3RBU8E7Txr4MDb1V8bh60tOzfhN4vTc9rRYkCm4tGDX7nJNHPnWt/+CFpt1rF9emptScxKfA2DNZwThn9NtNWjoxMH1Tqru+va02NzbK47FY4PHMzJtdYPYD8OChGDCyZp9z8sinrnWXt4E7q4ODRbrelw0x2Xjyn1fImn3OySOfutYt+IDRSeCycAZeAYm7wKLkshR87A1+cILDAss4EDkNXJI8Ows8yin1nENn+5MXNA3hnpHzHBKYjWhqe4lffwkwAMRcPMqRQZ4vAAAAAElFTkSuQmCC';
	        return eImg;
	    };
	    SvgFactory.prototype.createCopyIcon = function () {
	        var eImg = document.createElement('img');
	        eImg.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAgBJREFUeNqMk79rFEEcxd/M7V2QAzVFEOMFGwNiIGCjEdIEhYODmEawsFf8G4QQSCPYyqUWCdhY2qSQECSpInvFJYT8Ki6dZO8Sb2P29pfvu+4sm+UKv/AYZna/b95ndla9WFyEUmoewG0Mr+9hGB5EYYhypZIseO0fCHa3sP/LhxVFkazd+by0tOIFAQac+3w5imPYto1Pa2tv+VxR+8bRuv8EevIRxn5uQoszpWI2RjSIBgMMLi/hui76/T6+Li+v8Pkz9k0Wo409pFHAJooUCiWqYlk46nTQ2ttD+/gY75pNPKjVmmfd7gf2vKbu5U0sMWBpzWatNcAkv7n789lZ1GdmMqQ3cbxApIUikg58H5S0JgkSE/L/L1JmoNJmMZEDzCNdK5cxwtFxHHxcXcXTqalm27Zf7rRaRKBBhkAhxcgjiYlUo16HfKlqtYpv29u95Az81EClCFLyaQ0SCib/dtNJ6qsGfDmJnRqoXIKiyVUDz8sSSGy5VnI3ikh5k1KplBnog/V19BxnRCZmV15dGCSdO1wziphcS3rrT7d71zk5Ob8+Pf3eMN4aH3/8qtGYM0hp7iyJbO0bBOrMPTz8kl6OpGoTEzEncwapaCLrRNfu6Wli0Etl6mbfdb0MiYrlXsjZyAUTE0qwOxsbo9aQ3/dGEWlYRRcX5xxG/wowAC8cIjzfyA4lAAAAAElFTkSuQmCC';
	        return eImg;
	    };
	    SvgFactory.prototype.createPasteIcon = function () {
	        var eImg = document.createElement('img');
	        eImg.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAadJREFUeNpinGLPAAaMjAxwcJ9Tk+0Bt7YPkCkKFXqt8PXqFsXv13/B1Pz/D6FZENoYZgKxMYgh9OI6i567q5hFUp4kiH9i3qTnT3auqWPgZ/gDVXsWiNPBFk+2hxtwxi0syfjy5csM0vFzGTg42Bj4+XnAEh8/fmH48eMXw9OFyQy6uroMu1bNAxlgAnbB338IJ6hlzWU4uXgJw6FDO4Ga+Rl4eXkZWFlZGb58/crw6eNHBjG7Iga1yAiG7SvmwfWw/P2LMADkraiYaIb79+4xYAOKSkpgNch6UFzwFxgy//79Y5BTUMBqwF+g3H8mJgZkPSgu+Ac04M+/fwz4AAswulBc8Ocfqg1/kGWxAEagAch6WP78RfUCIQOYmJkZ/qC44A+qAb8JeIEZZMkfXC4gwgsQNUgG/CbRC2BXIhvw8AsDgzQnkgEEvACxBMJ++h0YJmufMTA8ABry8xckGkFOxIdBakBqQXpAekGZiXPTSwbeUAEgB5hsObm58acDoJp3nxkYNn1gEANyP4MNAGKxh18ZbsXxsjMQA97/Z7gF0gPEfwACDAB/y9xB1I3/FQAAAABJRU5ErkJggg==';
	        return eImg;
	    };
	    SvgFactory.prototype.createMenuIcon = function () {
	        var eImg = document.createElement('img');
	        eImg.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6QjM3MUVBMzlERkJEMTFFNUEwMjFFNDJDMDlCMUY3OTciIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6QjM3MUVBM0FERkJEMTFFNUEwMjFFNDJDMDlCMUY3OTciPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpCMzcxRUEzN0RGQkQxMUU1QTAyMUU0MkMwOUIxRjc5NyIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpCMzcxRUEzOERGQkQxMUU1QTAyMUU0MkMwOUIxRjc5NyIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pux7nZcAAAGtSURBVHjalFM9a8JQFL0veYkfYJUQEYuIIF07uToVpGuHOgid3dJN+i+K4C6CXQqFjplcCoKbXZ0EqRUFP/CTxCS9NzTdNOmBx32P3Nx3zj33sXq9/tRqtbRYLCaLomhBANi2La5WK7NSqTRYNpt1LMsCLACO47iLMXY2CoIAm80GZFkGoVQqfWy3WzBNE6gQVveNhmHAbreDYrHYZaPRKKTr+i0ykTDBPnUzgfYEvFkYDAZWoVDQWb/fB9QD6XQajscjBCkQDodhOBzCcrkEVq1WXfoEL9EPlEdSZrMZ8Pl8frVYLO7QgRB+sPx+/GUk4qUGNvOdYSO+JpPJJdHyc8ADnUluIpH45vv9XiFbiFIQC71IjuBe5ZlM5gYlPHLOL7C4AcEgofXbXC7X4PF4vKuqahf+AWJxOBwgEokA6/V67kFRFFcGLU/SqShJkusATSNbr9fQ6XSuU6mUQP3BBIaJZyM6BuPx2Mnn85+sVqu9ttvt+2QyGXgOqInT6RTK5fIbwwl0iFI0Gv2btCA9QPdcOVzTtOdms/mAnnKkaAexES0UcG/hc375EWAA94tOP0vEOEcAAAAASUVORK5CYII=';
	        return eImg;
	    };
	    return SvgFactory;
	})();
	exports.SvgFactory = SvgFactory;
	// i couldn't figure out how to not make these blurry
	/*function createPlusMinus(plus: boolean) {
	    var eSvg = document.createElementNS(SVG_NS, "svg");
	    var size = "14";
	    eSvg.setAttribute("width", size);
	    eSvg.setAttribute("height", size);

	    var eRect = document.createElementNS(SVG_NS, "rect");
	    eRect.setAttribute('x', '1');
	    eRect.setAttribute('y', '1');
	    eRect.setAttribute('width', '12');
	    eRect.setAttribute('height', '12');
	    eRect.setAttribute('rx', '2');
	    eRect.setAttribute('ry', '2');
	    eRect.setAttribute('fill', 'none');
	    eRect.setAttribute('stroke', 'black');
	    eRect.setAttribute('stroke-width', '1');
	    eRect.setAttribute('stroke-linecap', 'butt');
	    eSvg.appendChild(eRect);

	    var eLineAcross = document.createElementNS(SVG_NS, "line");
	    eLineAcross.setAttribute('x1','2');
	    eLineAcross.setAttribute('x2','12');
	    eLineAcross.setAttribute('y1','7');
	    eLineAcross.setAttribute('y2','7');
	    eLineAcross.setAttribute('stroke','black');
	    eLineAcross.setAttribute('stroke-width', '1');
	    eLineAcross.setAttribute('stroke-linecap', 'butt');
	    eSvg.appendChild(eLineAcross);

	    if (plus) {
	        var eLineDown = document.createElementNS(SVG_NS, "line");
	        eLineDown.setAttribute('x1','7');
	        eLineDown.setAttribute('x2','7');
	        eLineDown.setAttribute('y1','2');
	        eLineDown.setAttribute('y2','12');
	        eLineDown.setAttribute('stroke','black');
	        eLineDown.setAttribute('stroke-width', '1');
	        eLineDown.setAttribute('stroke-linecap', 'butt');
	        eSvg.appendChild(eLineDown);
	    }

	    return eSvg;
	}*/
	function createPolygonSvg(points, width) {
	    var eSvg = createIconSvg(width);
	    var eDescIcon = document.createElementNS(SVG_NS, "polygon");
	    eDescIcon.setAttribute("points", points);
	    eSvg.appendChild(eDescIcon);
	    return eSvg;
	}
	// util function for the above
	function createIconSvg(width) {
	    var eSvg = document.createElementNS(SVG_NS, "svg");
	    if (width > 0) {
	        eSvg.setAttribute("width", width);
	        eSvg.setAttribute("height", width);
	    }
	    else {
	        eSvg.setAttribute("width", "10");
	        eSvg.setAttribute("height", "10");
	    }
	    return eSvg;
	}
	function createCircle(fill) {
	    var eSvg = createIconSvg();
	    var eCircle = document.createElementNS(SVG_NS, "circle");
	    eCircle.setAttribute("cx", "5");
	    eCircle.setAttribute("cy", "5");
	    eCircle.setAttribute("r", "5");
	    eCircle.setAttribute("stroke", "black");
	    eCircle.setAttribute("stroke-width", "2");
	    if (fill) {
	        eCircle.setAttribute("fill", "black");
	    }
	    else {
	        eCircle.setAttribute("fill", "none");
	    }
	    eSvg.appendChild(eCircle);
	    return eSvg;
	}


/***/ },
/* 37 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
	 * @version v4.0.3
	 * @link http://www.ag-grid.com/
	 * @license MIT
	 */
	var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
	    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
	    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
	    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
	    return c > 3 && r && Object.defineProperty(target, key, r), r;
	};
	var __metadata = (this && this.__metadata) || function (k, v) {
	    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
	};
	var __param = (this && this.__param) || function (paramIndex, decorator) {
	    return function (target, key) { decorator(target, key, paramIndex); }
	};
	var gridOptionsWrapper_1 = __webpack_require__(3);
	var paginationController_1 = __webpack_require__(38);
	var columnController_1 = __webpack_require__(13);
	var rowRenderer_1 = __webpack_require__(23);
	var filterManager_1 = __webpack_require__(40);
	var eventService_1 = __webpack_require__(4);
	var gridPanel_1 = __webpack_require__(24);
	var constants_1 = __webpack_require__(8);
	var popupService_1 = __webpack_require__(41);
	var logger_1 = __webpack_require__(5);
	var events_1 = __webpack_require__(10);
	var borderLayout_1 = __webpack_require__(27);
	var context_1 = __webpack_require__(6);
	var context_2 = __webpack_require__(6);
	var context_3 = __webpack_require__(6);
	var context_4 = __webpack_require__(6);
	var focusedCellController_1 = __webpack_require__(44);
	var context_5 = __webpack_require__(6);
	var component_1 = __webpack_require__(45);
	var GridCore = (function () {
	    function GridCore(loggerFactory) {
	        this.logger = loggerFactory.create('GridCore');
	    }
	    GridCore.prototype.init = function () {
	        var _this = this;
	        // and the last bean, done in it's own section, as it's optional
	        var toolPanelGui;
	        var eSouthPanel = this.createSouthPanel();
	        if (this.toolPanel && !this.gridOptionsWrapper.isForPrint()) {
	            toolPanelGui = this.toolPanel.getGui();
	        }
	        var rowGroupGui;
	        if (this.rowGroupPanel) {
	            rowGroupGui = this.rowGroupPanel.getGui();
	        }
	        this.eRootPanel = new borderLayout_1.BorderLayout({
	            center: this.gridPanel.getLayout(),
	            east: toolPanelGui,
	            north: rowGroupGui,
	            south: eSouthPanel,
	            dontFill: this.gridOptionsWrapper.isForPrint(),
	            name: 'eRootPanel'
	        });
	        // see what the grid options are for default of toolbar
	        this.showToolPanel(this.gridOptionsWrapper.isShowToolPanel());
	        this.eGridDiv.appendChild(this.eRootPanel.getGui());
	        // if using angular, watch for quickFilter changes
	        if (this.$scope) {
	            this.$scope.$watch(this.quickFilterOnScope, function (newFilter) { return _this.filterManager.setQuickFilter(newFilter); });
	        }
	        if (!this.gridOptionsWrapper.isForPrint()) {
	            this.addWindowResizeListener();
	        }
	        this.doLayout();
	        this.finished = false;
	        this.periodicallyDoLayout();
	        this.popupService.setPopupParent(this.eRootPanel.getGui());
	        this.eventService.addEventListener(events_1.Events.EVENT_COLUMN_ROW_GROUP_CHANGE, this.onRowGroupChanged.bind(this));
	        this.eventService.addEventListener(events_1.Events.EVENT_COLUMN_EVERYTHING_CHANGED, this.onRowGroupChanged.bind(this));
	        this.onRowGroupChanged();
	        this.logger.log('ready');
	    };
	    GridCore.prototype.createSouthPanel = function () {
	        if (!this.statusBar && this.gridOptionsWrapper.isEnableStatusBar()) {
	            console.warn('ag-Grid: status bar is only available in ag-Grid-Enterprise');
	        }
	        var statusBarEnabled = this.statusBar && this.gridOptionsWrapper.isEnableStatusBar();
	        var paginationPanelEnabled = this.gridOptionsWrapper.isRowModelPagination() && !this.gridOptionsWrapper.isForPrint();
	        if (!statusBarEnabled && !paginationPanelEnabled) {
	            return null;
	        }
	        var eSouthPanel = document.createElement('div');
	        if (statusBarEnabled) {
	            eSouthPanel.appendChild(this.statusBar.getGui());
	        }
	        if (paginationPanelEnabled) {
	            eSouthPanel.appendChild(this.paginationController.getGui());
	        }
	        return eSouthPanel;
	    };
	    GridCore.prototype.onRowGroupChanged = function () {
	        if (!this.rowGroupPanel) {
	            return;
	        }
	        var rowGroupPanelShow = this.gridOptionsWrapper.getRowGroupPanelShow();
	        if (rowGroupPanelShow === constants_1.Constants.ALWAYS) {
	            this.eRootPanel.setNorthVisible(true);
	        }
	        else if (rowGroupPanelShow === constants_1.Constants.ONLY_WHEN_GROUPING) {
	            var grouping = !this.columnController.isRowGroupEmpty();
	            this.eRootPanel.setNorthVisible(grouping);
	        }
	        else {
	            this.eRootPanel.setNorthVisible(false);
	        }
	    };
	    GridCore.prototype.agApplicationBoot = function () {
	        var readyEvent = {
	            api: this.gridOptions.api,
	            columnApi: this.gridOptions.columnApi
	        };
	        this.eventService.dispatchEvent(events_1.Events.EVENT_GRID_READY, readyEvent);
	    };
	    GridCore.prototype.addWindowResizeListener = function () {
	        var that = this;
	        // putting this into a function, so when we remove the function,
	        // we are sure we are removing the exact same function (i'm not
	        // sure what 'bind' does to the function reference, if it's safe
	        // the result from 'bind').
	        this.windowResizeListener = function resizeListener() {
	            that.doLayout();
	        };
	        window.addEventListener('resize', this.windowResizeListener);
	    };
	    GridCore.prototype.periodicallyDoLayout = function () {
	        if (!this.finished) {
	            var that = this;
	            setTimeout(function () {
	                that.doLayout();
	                that.gridPanel.periodicallyCheck();
	                that.periodicallyDoLayout();
	            }, 500);
	        }
	    };
	    GridCore.prototype.showToolPanel = function (show) {
	        if (show && !this.toolPanel) {
	            console.warn('ag-Grid: toolPanel is only available in ag-Grid Enterprise');
	            this.toolPanelShowing = false;
	            return;
	        }
	        this.toolPanelShowing = show;
	        this.eRootPanel.setEastVisible(show);
	    };
	    GridCore.prototype.isToolPanelShowing = function () {
	        return this.toolPanelShowing;
	    };
	    GridCore.prototype.agDestroy = function () {
	        if (this.windowResizeListener) {
	            window.removeEventListener('resize', this.windowResizeListener);
	            this.logger.log('Removing windowResizeListener');
	        }
	        this.finished = true;
	        this.eGridDiv.removeChild(this.eRootPanel.getGui());
	        this.logger.log('Grid DOM removed');
	    };
	    GridCore.prototype.ensureNodeVisible = function (comparator) {
	        if (this.doingVirtualPaging) {
	            throw 'Cannot use ensureNodeVisible when doing virtual paging, as we cannot check rows that are not in memory';
	        }
	        // look for the node index we want to display
	        var rowCount = this.rowModel.getRowCount();
	        var comparatorIsAFunction = typeof comparator === 'function';
	        var indexToSelect = -1;
	        // go through all the nodes, find the one we want to show
	        for (var i = 0; i < rowCount; i++) {
	            var node = this.rowModel.getRow(i);
	            if (comparatorIsAFunction) {
	                if (comparator(node)) {
	                    indexToSelect = i;
	                    break;
	                }
	            }
	            else {
	                // check object equality against node and data
	                if (comparator === node || comparator === node.data) {
	                    indexToSelect = i;
	                    break;
	                }
	            }
	        }
	        if (indexToSelect >= 0) {
	            this.gridPanel.ensureIndexVisible(indexToSelect);
	        }
	    };
	    GridCore.prototype.doLayout = function () {
	        // need to do layout first, as drawVirtualRows and setPinnedColHeight
	        // need to know the result of the resizing of the panels.
	        var sizeChanged = this.eRootPanel.doLayout();
	        // both of the two below should be done in gridPanel, the gridPanel should register 'resize' to the panel
	        if (sizeChanged) {
	            this.rowRenderer.drawVirtualRows();
	            var event = {
	                clientWidth: this.eRootPanel.getGui().clientWidth,
	                clientHeight: this.eRootPanel.getGui().clientHeight
	            };
	            this.eventService.dispatchEvent(events_1.Events.EVENT_GRID_SIZE_CHANGED, event);
	        }
	    };
	    __decorate([
	        context_3.Autowired('gridOptions'), 
	        __metadata('design:type', Object)
	    ], GridCore.prototype, "gridOptions", void 0);
	    __decorate([
	        context_3.Autowired('gridOptionsWrapper'), 
	        __metadata('design:type', gridOptionsWrapper_1.GridOptionsWrapper)
	    ], GridCore.prototype, "gridOptionsWrapper", void 0);
	    __decorate([
	        context_3.Autowired('paginationController'), 
	        __metadata('design:type', paginationController_1.PaginationController)
	    ], GridCore.prototype, "paginationController", void 0);
	    __decorate([
	        context_3.Autowired('rowModel'), 
	        __metadata('design:type', Object)
	    ], GridCore.prototype, "rowModel", void 0);
	    __decorate([
	        context_3.Autowired('columnController'), 
	        __metadata('design:type', columnController_1.ColumnController)
	    ], GridCore.prototype, "columnController", void 0);
	    __decorate([
	        context_3.Autowired('rowRenderer'), 
	        __metadata('design:type', rowRenderer_1.RowRenderer)
	    ], GridCore.prototype, "rowRenderer", void 0);
	    __decorate([
	        context_3.Autowired('filterManager'), 
	        __metadata('design:type', filterManager_1.FilterManager)
	    ], GridCore.prototype, "filterManager", void 0);
	    __decorate([
	        context_3.Autowired('eventService'), 
	        __metadata('design:type', eventService_1.EventService)
	    ], GridCore.prototype, "eventService", void 0);
	    __decorate([
	        context_3.Autowired('gridPanel'), 
	        __metadata('design:type', gridPanel_1.GridPanel)
	    ], GridCore.prototype, "gridPanel", void 0);
	    __decorate([
	        context_3.Autowired('eGridDiv'), 
	        __metadata('design:type', HTMLElement)
	    ], GridCore.prototype, "eGridDiv", void 0);
	    __decorate([
	        context_3.Autowired('$scope'), 
	        __metadata('design:type', Object)
	    ], GridCore.prototype, "$scope", void 0);
	    __decorate([
	        context_3.Autowired('quickFilterOnScope'), 
	        __metadata('design:type', String)
	    ], GridCore.prototype, "quickFilterOnScope", void 0);
	    __decorate([
	        context_3.Autowired('popupService'), 
	        __metadata('design:type', popupService_1.PopupService)
	    ], GridCore.prototype, "popupService", void 0);
	    __decorate([
	        context_3.Autowired('focusedCellController'), 
	        __metadata('design:type', focusedCellController_1.FocusedCellController)
	    ], GridCore.prototype, "focusedCellController", void 0);
	    __decorate([
	        context_5.Optional('rowGroupPanel'), 
	        __metadata('design:type', component_1.Component)
	    ], GridCore.prototype, "rowGroupPanel", void 0);
	    __decorate([
	        context_5.Optional('toolPanel'), 
	        __metadata('design:type', component_1.Component)
	    ], GridCore.prototype, "toolPanel", void 0);
	    __decorate([
	        context_5.Optional('statusBar'), 
	        __metadata('design:type', component_1.Component)
	    ], GridCore.prototype, "statusBar", void 0);
	    __decorate([
	        context_4.PostConstruct, 
	        __metadata('design:type', Function), 
	        __metadata('design:paramtypes', []), 
	        __metadata('design:returntype', void 0)
	    ], GridCore.prototype, "init", null);
	    GridCore = __decorate([
	        context_1.Bean('gridCore'),
	        __param(0, context_2.Qualifier('loggerFactory')), 
	        __metadata('design:paramtypes', [logger_1.LoggerFactory])
	    ], GridCore);
	    return GridCore;
	})();
	exports.GridCore = GridCore;


/***/ },
/* 38 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
	 * @version v4.0.3
	 * @link http://www.ag-grid.com/
	 * @license MIT
	 */
	var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
	    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
	    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
	    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
	    return c > 3 && r && Object.defineProperty(target, key, r), r;
	};
	var __metadata = (this && this.__metadata) || function (k, v) {
	    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
	};
	var utils_1 = __webpack_require__(7);
	var gridOptionsWrapper_1 = __webpack_require__(3);
	var context_1 = __webpack_require__(6);
	var gridPanel_1 = __webpack_require__(24);
	var selectionController_1 = __webpack_require__(29);
	var context_2 = __webpack_require__(6);
	var sortController_1 = __webpack_require__(39);
	var context_3 = __webpack_require__(6);
	var eventService_1 = __webpack_require__(4);
	var events_1 = __webpack_require__(10);
	var filterManager_1 = __webpack_require__(40);
	var template = '<div class="ag-paging-panel ag-font-style">' +
	    '<span id="pageRowSummaryPanel" class="ag-paging-row-summary-panel">' +
	    '<span id="firstRowOnPage"></span>' +
	    ' [TO] ' +
	    '<span id="lastRowOnPage"></span>' +
	    ' [OF] ' +
	    '<span id="recordCount"></span>' +
	    '</span>' +
	    '<span class="ag-paging-page-summary-panel">' +
	    '<button type="button" class="ag-paging-button" id="btFirst">[FIRST]</button>' +
	    '<button type="button" class="ag-paging-button" id="btPrevious">[PREVIOUS]</button>' +
	    '[PAGE] ' +
	    '<span id="current"></span>' +
	    ' [OF] ' +
	    '<span id="total"></span>' +
	    '<button type="button" class="ag-paging-button" id="btNext">[NEXT]</button>' +
	    '<button type="button" class="ag-paging-button" id="btLast">[LAST]</button>' +
	    '</span>' +
	    '</div>';
	var PaginationController = (function () {
	    function PaginationController() {
	    }
	    PaginationController.prototype.init = function () {
	        var _this = this;
	        this.setupComponents();
	        this.callVersion = 0;
	        var paginationEnabled = this.gridOptionsWrapper.isRowModelPagination();
	        this.eventService.addEventListener(events_1.Events.EVENT_FILTER_CHANGED, function () {
	            if (paginationEnabled && _this.gridOptionsWrapper.isEnableServerSideFilter()) {
	                _this.reset();
	            }
	        });
	        this.eventService.addEventListener(events_1.Events.EVENT_SORT_CHANGED, function () {
	            if (paginationEnabled && _this.gridOptionsWrapper.isEnableServerSideSorting()) {
	                _this.reset();
	            }
	        });
	        if (paginationEnabled && this.gridOptionsWrapper.getDatasource()) {
	            this.setDatasource(this.gridOptionsWrapper.getDatasource());
	        }
	    };
	    PaginationController.prototype.setDatasource = function (datasource) {
	        this.datasource = datasource;
	        if (!datasource) {
	            // only continue if we have a valid datasource to work with
	            return;
	        }
	        this.reset();
	    };
	    PaginationController.prototype.reset = function () {
	        this.selectionController.reset();
	        // copy pageSize, to guard against it changing the the datasource between calls
	        if (this.datasource.pageSize && typeof this.datasource.pageSize !== 'number') {
	            console.warn('datasource.pageSize should be a number');
	        }
	        this.pageSize = this.datasource.pageSize;
	        // see if we know the total number of pages, or if it's 'to be decided'
	        if (typeof this.datasource.rowCount === 'number' && this.datasource.rowCount >= 0) {
	            this.rowCount = this.datasource.rowCount;
	            this.foundMaxRow = true;
	            this.calculateTotalPages();
	        }
	        else {
	            this.rowCount = 0;
	            this.foundMaxRow = false;
	            this.totalPages = null;
	        }
	        this.currentPage = 0;
	        // hide the summary panel until something is loaded
	        this.ePageRowSummaryPanel.style.visibility = 'hidden';
	        this.setTotalLabels();
	        this.loadPage();
	    };
	    // the native method number.toLocaleString(undefined, {minimumFractionDigits: 0}) puts in decimal places in IE
	    PaginationController.prototype.myToLocaleString = function (input) {
	        if (typeof input !== 'number') {
	            return '';
	        }
	        else {
	            // took this from: http://blog.tompawlak.org/number-currency-formatting-javascript
	            return input.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
	        }
	    };
	    PaginationController.prototype.setTotalLabels = function () {
	        if (this.foundMaxRow) {
	            this.lbTotal.innerHTML = this.myToLocaleString(this.totalPages);
	            this.lbRecordCount.innerHTML = this.myToLocaleString(this.rowCount);
	        }
	        else {
	            var moreText = this.gridOptionsWrapper.getLocaleTextFunc()('more', 'more');
	            this.lbTotal.innerHTML = moreText;
	            this.lbRecordCount.innerHTML = moreText;
	        }
	    };
	    PaginationController.prototype.calculateTotalPages = function () {
	        this.totalPages = Math.floor((this.rowCount - 1) / this.pageSize) + 1;
	    };
	    PaginationController.prototype.pageLoaded = function (rows, lastRowIndex) {
	        var firstId = this.currentPage * this.pageSize;
	        this.rowModel.setRowData(rows, true, firstId);
	        // see if we hit the last row
	        if (!this.foundMaxRow && typeof lastRowIndex === 'number' && lastRowIndex >= 0) {
	            this.foundMaxRow = true;
	            this.rowCount = lastRowIndex;
	            this.calculateTotalPages();
	            this.setTotalLabels();
	            // if overshot pages, go back
	            if (this.currentPage > this.totalPages) {
	                this.currentPage = this.totalPages - 1;
	                this.loadPage();
	            }
	        }
	        this.enableOrDisableButtons();
	        this.updateRowLabels();
	    };
	    PaginationController.prototype.updateRowLabels = function () {
	        var startRow;
	        var endRow;
	        if (this.isZeroPagesToDisplay()) {
	            startRow = 0;
	            endRow = 0;
	        }
	        else {
	            startRow = (this.pageSize * this.currentPage) + 1;
	            endRow = startRow + this.pageSize - 1;
	            if (this.foundMaxRow && endRow > this.rowCount) {
	                endRow = this.rowCount;
	            }
	        }
	        this.lbFirstRowOnPage.innerHTML = this.myToLocaleString(startRow);
	        this.lbLastRowOnPage.innerHTML = this.myToLocaleString(endRow);
	        // show the summary panel, when first shown, this is blank
	        this.ePageRowSummaryPanel.style.visibility = "";
	    };
	    PaginationController.prototype.loadPage = function () {
	        this.enableOrDisableButtons();
	        var startRow = this.currentPage * this.datasource.pageSize;
	        var endRow = (this.currentPage + 1) * this.datasource.pageSize;
	        this.lbCurrent.innerHTML = this.myToLocaleString(this.currentPage + 1);
	        this.callVersion++;
	        var callVersionCopy = this.callVersion;
	        var that = this;
	        this.gridPanel.showLoadingOverlay();
	        var sortModel;
	        if (this.gridOptionsWrapper.isEnableServerSideSorting()) {
	            sortModel = this.sortController.getSortModel();
	        }
	        var filterModel;
	        if (this.gridOptionsWrapper.isEnableServerSideFilter()) {
	            filterModel = this.filterManager.getFilterModel();
	        }
	        var params = {
	            startRow: startRow,
	            endRow: endRow,
	            successCallback: successCallback,
	            failCallback: failCallback,
	            sortModel: sortModel,
	            filterModel: filterModel
	        };
	        // check if old version of datasource used
	        var getRowsParams = utils_1.Utils.getFunctionParameters(this.datasource.getRows);
	        if (getRowsParams.length > 1) {
	            console.warn('ag-grid: It looks like your paging datasource is of the old type, taking more than one parameter.');
	            console.warn('ag-grid: From ag-grid 1.9.0, now the getRows takes one parameter. See the documentation for details.');
	        }
	        this.datasource.getRows(params);
	        function successCallback(rows, lastRowIndex) {
	            if (that.isCallDaemon(callVersionCopy)) {
	                return;
	            }
	            that.pageLoaded(rows, lastRowIndex);
	        }
	        function failCallback() {
	            if (that.isCallDaemon(callVersionCopy)) {
	                return;
	            }
	            // set in an empty set of rows, this will at
	            // least get rid of the loading panel, and
	            // stop blocking things
	            that.rowModel.setRowData([], true);
	        }
	    };
	    PaginationController.prototype.isCallDaemon = function (versionCopy) {
	        return versionCopy !== this.callVersion;
	    };
	    PaginationController.prototype.onBtNext = function () {
	        this.currentPage++;
	        this.loadPage();
	    };
	    PaginationController.prototype.onBtPrevious = function () {
	        this.currentPage--;
	        this.loadPage();
	    };
	    PaginationController.prototype.onBtFirst = function () {
	        this.currentPage = 0;
	        this.loadPage();
	    };
	    PaginationController.prototype.onBtLast = function () {
	        this.currentPage = this.totalPages - 1;
	        this.loadPage();
	    };
	    PaginationController.prototype.isZeroPagesToDisplay = function () {
	        return this.foundMaxRow && this.totalPages === 0;
	    };
	    PaginationController.prototype.enableOrDisableButtons = function () {
	        var disablePreviousAndFirst = this.currentPage === 0;
	        this.btPrevious.disabled = disablePreviousAndFirst;
	        this.btFirst.disabled = disablePreviousAndFirst;
	        var zeroPagesToDisplay = this.isZeroPagesToDisplay();
	        var onLastPage = this.foundMaxRow && this.currentPage === (this.totalPages - 1);
	        var disableNext = onLastPage || zeroPagesToDisplay;
	        this.btNext.disabled = disableNext;
	        var disableLast = !this.foundMaxRow || zeroPagesToDisplay || this.currentPage === (this.totalPages - 1);
	        this.btLast.disabled = disableLast;
	    };
	    PaginationController.prototype.createTemplate = function () {
	        var localeTextFunc = this.gridOptionsWrapper.getLocaleTextFunc();
	        return template
	            .replace('[PAGE]', localeTextFunc('page', 'Page'))
	            .replace('[TO]', localeTextFunc('to', 'to'))
	            .replace('[OF]', localeTextFunc('of', 'of'))
	            .replace('[OF]', localeTextFunc('of', 'of'))
	            .replace('[FIRST]', localeTextFunc('first', 'First'))
	            .replace('[PREVIOUS]', localeTextFunc('previous', 'Previous'))
	            .replace('[NEXT]', localeTextFunc('next', 'Next'))
	            .replace('[LAST]', localeTextFunc('last', 'Last'));
	    };
	    PaginationController.prototype.getGui = function () {
	        return this.eGui;
	    };
	    PaginationController.prototype.setupComponents = function () {
	        this.eGui = utils_1.Utils.loadTemplate(this.createTemplate());
	        this.btNext = this.eGui.querySelector('#btNext');
	        this.btPrevious = this.eGui.querySelector('#btPrevious');
	        this.btFirst = this.eGui.querySelector('#btFirst');
	        this.btLast = this.eGui.querySelector('#btLast');
	        this.lbCurrent = this.eGui.querySelector('#current');
	        this.lbTotal = this.eGui.querySelector('#total');
	        this.lbRecordCount = this.eGui.querySelector('#recordCount');
	        this.lbFirstRowOnPage = this.eGui.querySelector('#firstRowOnPage');
	        this.lbLastRowOnPage = this.eGui.querySelector('#lastRowOnPage');
	        this.ePageRowSummaryPanel = this.eGui.querySelector('#pageRowSummaryPanel');
	        var that = this;
	        this.btNext.addEventListener('click', function () {
	            that.onBtNext();
	        });
	        this.btPrevious.addEventListener('click', function () {
	            that.onBtPrevious();
	        });
	        this.btFirst.addEventListener('click', function () {
	            that.onBtFirst();
	        });
	        this.btLast.addEventListener('click', function () {
	            that.onBtLast();
	        });
	    };
	    __decorate([
	        context_2.Autowired('filterManager'), 
	        __metadata('design:type', filterManager_1.FilterManager)
	    ], PaginationController.prototype, "filterManager", void 0);
	    __decorate([
	        context_2.Autowired('gridPanel'), 
	        __metadata('design:type', gridPanel_1.GridPanel)
	    ], PaginationController.prototype, "gridPanel", void 0);
	    __decorate([
	        context_2.Autowired('gridOptionsWrapper'), 
	        __metadata('design:type', gridOptionsWrapper_1.GridOptionsWrapper)
	    ], PaginationController.prototype, "gridOptionsWrapper", void 0);
	    __decorate([
	        context_2.Autowired('selectionController'), 
	        __metadata('design:type', selectionController_1.SelectionController)
	    ], PaginationController.prototype, "selectionController", void 0);
	    __decorate([
	        context_2.Autowired('rowModel'), 
	        __metadata('design:type', Object)
	    ], PaginationController.prototype, "rowModel", void 0);
	    __decorate([
	        context_2.Autowired('sortController'), 
	        __metadata('design:type', sortController_1.SortController)
	    ], PaginationController.prototype, "sortController", void 0);
	    __decorate([
	        context_2.Autowired('eventService'), 
	        __metadata('design:type', eventService_1.EventService)
	    ], PaginationController.prototype, "eventService", void 0);
	    __decorate([
	        context_3.PostConstruct, 
	        __metadata('design:type', Function), 
	        __metadata('design:paramtypes', []), 
	        __metadata('design:returntype', void 0)
	    ], PaginationController.prototype, "init", null);
	    PaginationController = __decorate([
	        context_1.Bean('paginationController'), 
	        __metadata('design:paramtypes', [])
	    ], PaginationController);
	    return PaginationController;
	})();
	exports.PaginationController = PaginationController;


/***/ },
/* 39 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
	 * @version v4.0.3
	 * @link http://www.ag-grid.com/
	 * @license MIT
	 */
	var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
	    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
	    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
	    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
	    return c > 3 && r && Object.defineProperty(target, key, r), r;
	};
	var __metadata = (this && this.__metadata) || function (k, v) {
	    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
	};
	var column_1 = __webpack_require__(15);
	var context_1 = __webpack_require__(6);
	var gridOptionsWrapper_1 = __webpack_require__(3);
	var columnController_1 = __webpack_require__(13);
	var eventService_1 = __webpack_require__(4);
	var events_1 = __webpack_require__(10);
	var context_2 = __webpack_require__(6);
	var utils_1 = __webpack_require__(7);
	var SortController = (function () {
	    function SortController() {
	    }
	    SortController.prototype.progressSort = function (column, multiSort) {
	        // update sort on current col
	        column.setSort(this.getNextSortDirection(column));
	        // sortedAt used for knowing order of cols when multi-col sort
	        if (column.getSort()) {
	            column.setSortedAt(new Date().valueOf());
	        }
	        else {
	            column.setSortedAt(null);
	        }
	        var doingMultiSort = multiSort && !this.gridOptionsWrapper.isSuppressMultiSort();
	        // clear sort on all columns except this one, and update the icons
	        if (!doingMultiSort) {
	            this.clearSortBarThisColumn(column);
	        }
	        this.dispatchSortChangedEvents();
	    };
	    SortController.prototype.dispatchSortChangedEvents = function () {
	        this.eventService.dispatchEvent(events_1.Events.EVENT_BEFORE_SORT_CHANGED);
	        this.eventService.dispatchEvent(events_1.Events.EVENT_SORT_CHANGED);
	        this.eventService.dispatchEvent(events_1.Events.EVENT_AFTER_SORT_CHANGED);
	    };
	    SortController.prototype.clearSortBarThisColumn = function (columnToSkip) {
	        this.columnController.getAllColumnsIncludingAuto().forEach(function (columnToClear) {
	            // Do not clear if either holding shift, or if column in question was clicked
	            if (!(columnToClear === columnToSkip)) {
	                columnToClear.setSort(null);
	            }
	        });
	    };
	    SortController.prototype.getNextSortDirection = function (column) {
	        var sortingOrder;
	        if (column.getColDef().sortingOrder) {
	            sortingOrder = column.getColDef().sortingOrder;
	        }
	        else if (this.gridOptionsWrapper.getSortingOrder()) {
	            sortingOrder = this.gridOptionsWrapper.getSortingOrder();
	        }
	        else {
	            sortingOrder = SortController.DEFAULT_SORTING_ORDER;
	        }
	        if (!Array.isArray(sortingOrder) || sortingOrder.length <= 0) {
	            console.warn('ag-grid: sortingOrder must be an array with at least one element, currently it\'s ' + sortingOrder);
	            return;
	        }
	        var currentIndex = sortingOrder.indexOf(column.getSort());
	        var notInArray = currentIndex < 0;
	        var lastItemInArray = currentIndex == sortingOrder.length - 1;
	        var result;
	        if (notInArray || lastItemInArray) {
	            result = sortingOrder[0];
	        }
	        else {
	            result = sortingOrder[currentIndex + 1];
	        }
	        // verify the sort type exists, as the user could provide the sortOrder, need to make sure it's valid
	        if (SortController.DEFAULT_SORTING_ORDER.indexOf(result) < 0) {
	            console.warn('ag-grid: invalid sort type ' + result);
	            return null;
	        }
	        return result;
	    };
	    // used by the public api, for saving the sort model
	    SortController.prototype.getSortModel = function () {
	        var columnsWithSorting = this.getColumnsWithSortingOrdered();
	        return utils_1.Utils.map(columnsWithSorting, function (column) {
	            return {
	                colId: column.getColId(),
	                sort: column.getSort()
	            };
	        });
	    };
	    SortController.prototype.setSortModel = function (sortModel) {
	        if (!this.gridOptionsWrapper.isEnableSorting()) {
	            console.warn('ag-grid: You are setting the sort model on a grid that does not have sorting enabled');
	            return;
	        }
	        // first up, clear any previous sort
	        var sortModelProvided = sortModel && sortModel.length > 0;
	        var allColumnsIncludingAuto = this.columnController.getAllColumnsIncludingAuto();
	        allColumnsIncludingAuto.forEach(function (column) {
	            var sortForCol = null;
	            var sortedAt = -1;
	            if (sortModelProvided && !column.getColDef().suppressSorting) {
	                for (var j = 0; j < sortModel.length; j++) {
	                    var sortModelEntry = sortModel[j];
	                    if (typeof sortModelEntry.colId === 'string'
	                        && typeof column.getColId() === 'string'
	                        && sortModelEntry.colId === column.getColId()) {
	                        sortForCol = sortModelEntry.sort;
	                        sortedAt = j;
	                    }
	                }
	            }
	            if (sortForCol) {
	                column.setSort(sortForCol);
	                column.setSortedAt(sortedAt);
	            }
	            else {
	                column.setSort(null);
	                column.setSortedAt(null);
	            }
	        });
	        this.dispatchSortChangedEvents();
	    };
	    SortController.prototype.getColumnsWithSortingOrdered = function () {
	        // pull out all the columns that have sorting set
	        var allColumnsIncludingAuto = this.columnController.getAllColumnsIncludingAuto();
	        var columnsWithSorting = utils_1.Utils.filter(allColumnsIncludingAuto, function (column) { return !!column.getSort(); });
	        // put the columns in order of which one got sorted first
	        columnsWithSorting.sort(function (a, b) { return a.sortedAt - b.sortedAt; });
	        return columnsWithSorting;
	    };
	    // used by row controller, when doing the sorting
	    SortController.prototype.getSortForRowController = function () {
	        var columnsWithSorting = this.getColumnsWithSortingOrdered();
	        return utils_1.Utils.map(columnsWithSorting, function (column) {
	            var ascending = column.getSort() === column_1.Column.SORT_ASC;
	            return {
	                inverter: ascending ? 1 : -1,
	                column: column
	            };
	        });
	    };
	    SortController.DEFAULT_SORTING_ORDER = [column_1.Column.SORT_ASC, column_1.Column.SORT_DESC, null];
	    __decorate([
	        context_1.Autowired('gridOptionsWrapper'), 
	        __metadata('design:type', gridOptionsWrapper_1.GridOptionsWrapper)
	    ], SortController.prototype, "gridOptionsWrapper", void 0);
	    __decorate([
	        context_1.Autowired('columnController'), 
	        __metadata('design:type', columnController_1.ColumnController)
	    ], SortController.prototype, "columnController", void 0);
	    __decorate([
	        context_1.Autowired('eventService'), 
	        __metadata('design:type', eventService_1.EventService)
	    ], SortController.prototype, "eventService", void 0);
	    SortController = __decorate([
	        context_2.Bean('sortController'), 
	        __metadata('design:paramtypes', [])
	    ], SortController);
	    return SortController;
	})();
	exports.SortController = SortController;


/***/ },
/* 40 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
	 * @version v4.0.3
	 * @link http://www.ag-grid.com/
	 * @license MIT
	 */
	var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
	    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
	    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
	    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
	    return c > 3 && r && Object.defineProperty(target, key, r), r;
	};
	var __metadata = (this && this.__metadata) || function (k, v) {
	    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
	};
	var utils_1 = __webpack_require__(7);
	var gridOptionsWrapper_1 = __webpack_require__(3);
	var popupService_1 = __webpack_require__(41);
	var valueService_1 = __webpack_require__(34);
	var columnController_1 = __webpack_require__(13);
	var textFilter_1 = __webpack_require__(42);
	var numberFilter_1 = __webpack_require__(43);
	var context_1 = __webpack_require__(6);
	var context_2 = __webpack_require__(6);
	var eventService_1 = __webpack_require__(4);
	var events_1 = __webpack_require__(10);
	var context_3 = __webpack_require__(6);
	var FilterManager = (function () {
	    function FilterManager() {
	        this.allFilters = {};
	        this.quickFilter = null;
	        this.availableFilters = {
	            'text': textFilter_1.TextFilter,
	            'number': numberFilter_1.NumberFilter
	        };
	    }
	    FilterManager.prototype.init = function () {
	        this.eventService.addEventListener(events_1.Events.EVENT_ROW_DATA_CHANGED, this.onNewRowsLoaded.bind(this));
	        this.eventService.addEventListener(events_1.Events.EVENT_NEW_COLUMNS_LOADED, this.onNewColumnsLoaded.bind(this));
	    };
	    FilterManager.prototype.registerFilter = function (key, Filter) {
	        this.availableFilters[key] = Filter;
	    };
	    FilterManager.prototype.setFilterModel = function (model) {
	        var _this = this;
	        if (model) {
	            // mark the filters as we set them, so any active filters left over we stop
	            var modelKeys = Object.keys(model);
	            utils_1.Utils.iterateObject(this.allFilters, function (colId, filterWrapper) {
	                utils_1.Utils.removeFromArray(modelKeys, colId);
	                var newModel = model[colId];
	                _this.setModelOnFilterWrapper(filterWrapper.filter, newModel);
	            });
	            // at this point, processedFields contains data for which we don't have a filter working yet
	            utils_1.Utils.iterateArray(modelKeys, function (colId) {
	                var column = _this.columnController.getColumn(colId);
	                if (!column) {
	                    console.warn('Warning ag-grid setFilterModel - no column found for colId ' + colId);
	                    return;
	                }
	                var filterWrapper = _this.getOrCreateFilterWrapper(column);
	                _this.setModelOnFilterWrapper(filterWrapper.filter, model[colId]);
	            });
	        }
	        else {
	            utils_1.Utils.iterateObject(this.allFilters, function (key, filterWrapper) {
	                _this.setModelOnFilterWrapper(filterWrapper.filter, null);
	            });
	        }
	        this.onFilterChanged();
	    };
	    FilterManager.prototype.setModelOnFilterWrapper = function (filter, newModel) {
	        // because user can provide filters, we provide useful error checking and messages
	        if (typeof filter.getApi !== 'function') {
	            console.warn('Warning ag-grid - filter missing getApi method, which is needed for getFilterModel');
	            return;
	        }
	        var filterApi = filter.getApi();
	        if (typeof filterApi.setModel !== 'function') {
	            console.warn('Warning ag-grid - filter API missing setModel method, which is needed for setFilterModel');
	            return;
	        }
	        filterApi.setModel(newModel);
	    };
	    FilterManager.prototype.getFilterModel = function () {
	        var result = {};
	        utils_1.Utils.iterateObject(this.allFilters, function (key, filterWrapper) {
	            // because user can provide filters, we provide useful error checking and messages
	            if (typeof filterWrapper.filter.getApi !== 'function') {
	                console.warn('Warning ag-grid - filter missing getApi method, which is needed for getFilterModel');
	                return;
	            }
	            var filterApi = filterWrapper.filter.getApi();
	            if (typeof filterApi.getModel !== 'function') {
	                console.warn('Warning ag-grid - filter API missing getModel method, which is needed for getFilterModel');
	                return;
	            }
	            var model = filterApi.getModel();
	            if (utils_1.Utils.exists(model)) {
	                result[key] = model;
	            }
	        });
	        return result;
	    };
	    // returns true if any advanced filter (ie not quick filter) active
	    FilterManager.prototype.isAdvancedFilterPresent = function () {
	        var atLeastOneActive = false;
	        utils_1.Utils.iterateObject(this.allFilters, function (key, filterWrapper) {
	            if (!filterWrapper.filter.isFilterActive) {
	                console.error('Filter is missing method isFilterActive');
	            }
	            if (filterWrapper.filter.isFilterActive()) {
	                atLeastOneActive = true;
	                filterWrapper.column.setFilterActive(true);
	            }
	            else {
	                filterWrapper.column.setFilterActive(false);
	            }
	        });
	        return atLeastOneActive;
	    };
	    // returns true if quickFilter or advancedFilter
	    FilterManager.prototype.isAnyFilterPresent = function () {
	        return this.isQuickFilterPresent() || this.advancedFilterPresent || this.externalFilterPresent;
	    };
	    FilterManager.prototype.doesFilterPass = function (node, filterToSkip) {
	        var data = node.data;
	        var colKeys = Object.keys(this.allFilters);
	        for (var i = 0, l = colKeys.length; i < l; i++) {
	            var colId = colKeys[i];
	            var filterWrapper = this.allFilters[colId];
	            // if no filter, always pass
	            if (filterWrapper === undefined) {
	                continue;
	            }
	            if (filterWrapper.filter === filterToSkip) {
	                continue;
	            }
	            // don't bother with filters that are not active
	            if (!filterWrapper.filter.isFilterActive()) {
	                continue;
	            }
	            if (!filterWrapper.filter.doesFilterPass) {
	                console.error('Filter is missing method doesFilterPass');
	            }
	            var params = {
	                node: node,
	                data: data
	            };
	            if (!filterWrapper.filter.doesFilterPass(params)) {
	                return false;
	            }
	        }
	        // all filters passed
	        return true;
	    };
	    // returns true if it has changed (not just same value again)
	    FilterManager.prototype.setQuickFilter = function (newFilter) {
	        if (newFilter === undefined || newFilter === "") {
	            newFilter = null;
	        }
	        if (this.quickFilter !== newFilter) {
	            if (this.gridOptionsWrapper.isRowModelVirtual()) {
	                console.warn('ag-grid: cannot do quick filtering when doing virtual paging');
	                return;
	            }
	            //want 'null' to mean to filter, so remove undefined and empty string
	            if (newFilter === undefined || newFilter === "") {
	                newFilter = null;
	            }
	            if (newFilter !== null) {
	                newFilter = newFilter.toUpperCase();
	            }
	            this.quickFilter = newFilter;
	            this.onFilterChanged();
	        }
	    };
	    FilterManager.prototype.onFilterChanged = function () {
	        this.eventService.dispatchEvent(events_1.Events.EVENT_BEFORE_FILTER_CHANGED);
	        this.advancedFilterPresent = this.isAdvancedFilterPresent();
	        this.externalFilterPresent = this.gridOptionsWrapper.isExternalFilterPresent();
	        utils_1.Utils.iterateObject(this.allFilters, function (key, filterWrapper) {
	            if (filterWrapper.filter.onAnyFilterChanged) {
	                filterWrapper.filter.onAnyFilterChanged();
	            }
	        });
	        this.eventService.dispatchEvent(events_1.Events.EVENT_FILTER_CHANGED);
	        this.eventService.dispatchEvent(events_1.Events.EVENT_AFTER_FILTER_CHANGED);
	    };
	    FilterManager.prototype.isQuickFilterPresent = function () {
	        return this.quickFilter !== null;
	    };
	    FilterManager.prototype.doesRowPassOtherFilters = function (filterToSkip, node) {
	        return this.doesRowPassFilter(node, filterToSkip);
	    };
	    FilterManager.prototype.doesRowPassFilter = function (node, filterToSkip) {
	        //first up, check quick filter
	        if (this.isQuickFilterPresent()) {
	            if (!node.quickFilterAggregateText) {
	                this.aggregateRowForQuickFilter(node);
	            }
	            if (node.quickFilterAggregateText.indexOf(this.quickFilter) < 0) {
	                //quick filter fails, so skip item
	                return false;
	            }
	        }
	        //secondly, give the client a chance to reject this row
	        if (this.externalFilterPresent) {
	            if (!this.gridOptionsWrapper.doesExternalFilterPass(node)) {
	                return false;
	            }
	        }
	        //lastly, check our internal advanced filter
	        if (this.advancedFilterPresent) {
	            if (!this.doesFilterPass(node, filterToSkip)) {
	                return false;
	            }
	        }
	        //got this far, all filters pass
	        return true;
	    };
	    FilterManager.prototype.aggregateRowForQuickFilter = function (node) {
	        var aggregatedText = '';
	        var that = this;
	        this.columnController.getAllColumns().forEach(function (column) {
	            var value = that.valueService.getValue(column, node);
	            if (value && value !== '') {
	                aggregatedText = aggregatedText + value.toString().toUpperCase() + "_";
	            }
	        });
	        node.quickFilterAggregateText = aggregatedText;
	    };
	    FilterManager.prototype.onNewRowsLoaded = function () {
	        var that = this;
	        Object.keys(this.allFilters).forEach(function (field) {
	            var filter = that.allFilters[field].filter;
	            if (filter.onNewRowsLoaded) {
	                filter.onNewRowsLoaded();
	            }
	        });
	    };
	    FilterManager.prototype.createValueGetter = function (column) {
	        var that = this;
	        return function valueGetter(node) {
	            return that.valueService.getValue(column, node);
	        };
	    };
	    FilterManager.prototype.getFilterApi = function (column) {
	        var filterWrapper = this.getOrCreateFilterWrapper(column);
	        if (filterWrapper) {
	            if (typeof filterWrapper.filter.getApi === 'function') {
	                return filterWrapper.filter.getApi();
	            }
	        }
	    };
	    FilterManager.prototype.getOrCreateFilterWrapper = function (column) {
	        var filterWrapper = this.allFilters[column.getColId()];
	        if (!filterWrapper) {
	            filterWrapper = this.createFilterWrapper(column);
	            this.allFilters[column.getColId()] = filterWrapper;
	        }
	        return filterWrapper;
	    };
	    FilterManager.prototype.createFilterWrapper = function (column) {
	        var _this = this;
	        var colDef = column.getColDef();
	        var filterWrapper = {
	            column: column,
	            filter: null,
	            scope: null,
	            gui: null
	        };
	        if (typeof colDef.filter === 'function') {
	            // if user provided a filter, just use it
	            // first up, create child scope if needed
	            if (this.gridOptionsWrapper.isAngularCompileFilters()) {
	                filterWrapper.scope = this.$scope.$new();
	            }
	            // now create filter (had to cast to any to get 'new' working)
	            this.assertMethodHasNoParameters(colDef.filter);
	            filterWrapper.filter = new colDef.filter();
	        }
	        else if (utils_1.Utils.missing(colDef.filter) || typeof colDef.filter === 'string') {
	            var Filter = this.getFilterFromCache(colDef.filter);
	            filterWrapper.filter = new Filter();
	        }
	        else {
	            console.error('ag-Grid: colDef.filter should be function or a string');
	        }
	        var filterChangedCallback = this.onFilterChanged.bind(this);
	        var filterModifiedCallback = function () { return _this.eventService.dispatchEvent(events_1.Events.EVENT_FILTER_MODIFIED); };
	        var doesRowPassOtherFilters = this.doesRowPassOtherFilters.bind(this, filterWrapper.filter);
	        var filterParams = colDef.filterParams;
	        var params = {
	            colDef: colDef,
	            rowModel: this.rowModel,
	            filterChangedCallback: filterChangedCallback,
	            filterModifiedCallback: filterModifiedCallback,
	            filterParams: filterParams,
	            localeTextFunc: this.gridOptionsWrapper.getLocaleTextFunc(),
	            valueGetter: this.createValueGetter(column),
	            doesRowPassOtherFilter: doesRowPassOtherFilters,
	            context: this.gridOptionsWrapper.getContext(),
	            $scope: filterWrapper.scope
	        };
	        if (!filterWrapper.filter.init) {
	            throw 'Filter is missing method init';
	        }
	        filterWrapper.filter.init(params);
	        if (!filterWrapper.filter.getGui) {
	            throw 'Filter is missing method getGui';
	        }
	        var eFilterGui = document.createElement('div');
	        eFilterGui.className = 'ag-filter';
	        var guiFromFilter = filterWrapper.filter.getGui();
	        if (utils_1.Utils.isNodeOrElement(guiFromFilter)) {
	            //a dom node or element was returned, so add child
	            eFilterGui.appendChild(guiFromFilter);
	        }
	        else {
	            //otherwise assume it was html, so just insert
	            var eTextSpan = document.createElement('span');
	            eTextSpan.innerHTML = guiFromFilter;
	            eFilterGui.appendChild(eTextSpan);
	        }
	        if (filterWrapper.scope) {
	            filterWrapper.gui = this.$compile(eFilterGui)(filterWrapper.scope)[0];
	        }
	        else {
	            filterWrapper.gui = eFilterGui;
	        }
	        return filterWrapper;
	    };
	    FilterManager.prototype.getFilterFromCache = function (filterType) {
	        var defaultFilterType = this.enterprise ? 'set' : 'text';
	        var defaultFilter = this.availableFilters[defaultFilterType];
	        if (utils_1.Utils.missing(filterType)) {
	            return defaultFilter;
	        }
	        if (!this.enterprise && filterType === 'set') {
	            console.warn('ag-Grid: Set filter is only available in Enterprise ag-Grid');
	            filterType = 'text';
	        }
	        if (this.availableFilters[filterType]) {
	            return this.availableFilters[filterType];
	        }
	        else {
	            console.error('ag-Grid: Could not find filter type ' + filterType);
	            return this.availableFilters[defaultFilter];
	        }
	    };
	    FilterManager.prototype.onNewColumnsLoaded = function () {
	        this.agDestroy();
	    };
	    FilterManager.prototype.agDestroy = function () {
	        utils_1.Utils.iterateObject(this.allFilters, function (key, filterWrapper) {
	            if (filterWrapper.filter.destroy) {
	                filterWrapper.filter.destroy();
	                filterWrapper.column.setFilterActive(false);
	            }
	        });
	        this.allFilters = {};
	    };
	    FilterManager.prototype.assertMethodHasNoParameters = function (theMethod) {
	        var getRowsParams = utils_1.Utils.getFunctionParameters(theMethod);
	        if (getRowsParams.length > 0) {
	            console.warn('ag-grid: It looks like your filter is of the old type and expecting parameters in the constructor.');
	            console.warn('ag-grid: From ag-grid 1.14, the constructor should take no parameters and init() used instead.');
	        }
	    };
	    __decorate([
	        context_2.Autowired('$compile'), 
	        __metadata('design:type', Object)
	    ], FilterManager.prototype, "$compile", void 0);
	    __decorate([
	        context_2.Autowired('$scope'), 
	        __metadata('design:type', Object)
	    ], FilterManager.prototype, "$scope", void 0);
	    __decorate([
	        context_2.Autowired('gridOptionsWrapper'), 
	        __metadata('design:type', gridOptionsWrapper_1.GridOptionsWrapper)
	    ], FilterManager.prototype, "gridOptionsWrapper", void 0);
	    __decorate([
	        context_2.Autowired('gridCore'), 
	        __metadata('design:type', Object)
	    ], FilterManager.prototype, "gridCore", void 0);
	    __decorate([
	        context_2.Autowired('popupService'), 
	        __metadata('design:type', popupService_1.PopupService)
	    ], FilterManager.prototype, "popupService", void 0);
	    __decorate([
	        context_2.Autowired('valueService'), 
	        __metadata('design:type', valueService_1.ValueService)
	    ], FilterManager.prototype, "valueService", void 0);
	    __decorate([
	        context_2.Autowired('columnController'), 
	        __metadata('design:type', columnController_1.ColumnController)
	    ], FilterManager.prototype, "columnController", void 0);
	    __decorate([
	        context_2.Autowired('rowModel'), 
	        __metadata('design:type', Object)
	    ], FilterManager.prototype, "rowModel", void 0);
	    __decorate([
	        context_2.Autowired('eventService'), 
	        __metadata('design:type', eventService_1.EventService)
	    ], FilterManager.prototype, "eventService", void 0);
	    __decorate([
	        context_2.Autowired('enterprise'), 
	        __metadata('design:type', Boolean)
	    ], FilterManager.prototype, "enterprise", void 0);
	    __decorate([
	        context_3.PostConstruct, 
	        __metadata('design:type', Function), 
	        __metadata('design:paramtypes', []), 
	        __metadata('design:returntype', void 0)
	    ], FilterManager.prototype, "init", null);
	    FilterManager = __decorate([
	        context_1.Bean('filterManager'), 
	        __metadata('design:paramtypes', [])
	    ], FilterManager);
	    return FilterManager;
	})();
	exports.FilterManager = FilterManager;


/***/ },
/* 41 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
	 * @version v4.0.3
	 * @link http://www.ag-grid.com/
	 * @license MIT
	 */
	var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
	    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
	    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
	    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
	    return c > 3 && r && Object.defineProperty(target, key, r), r;
	};
	var __metadata = (this && this.__metadata) || function (k, v) {
	    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
	};
	var utils_1 = __webpack_require__(7);
	var constants_1 = __webpack_require__(8);
	var context_1 = __webpack_require__(6);
	var PopupService = (function () {
	    function PopupService() {
	    }
	    PopupService.prototype.setPopupParent = function (ePopupParent) {
	        this.ePopupParent = ePopupParent;
	    };
	    PopupService.prototype.positionPopupForMenu = function (params) {
	        var sourceRect = params.eventSource.getBoundingClientRect();
	        var parentRect = this.ePopupParent.getBoundingClientRect();
	        var x = sourceRect.right - parentRect.left - 2;
	        var y = sourceRect.top - parentRect.top;
	        var minWidth;
	        if (params.ePopup.clientWidth > 0) {
	            minWidth = params.ePopup.clientWidth;
	        }
	        else {
	            minWidth = 200;
	        }
	        var widthOfParent = parentRect.right - parentRect.left;
	        var maxX = widthOfParent - minWidth;
	        if (x > maxX) {
	            // try putting menu to the left
	            x = sourceRect.left - minWidth;
	        }
	        if (x < 0) {
	            x = 0;
	        }
	        params.ePopup.style.left = x + "px";
	        params.ePopup.style.top = y + "px";
	    };
	    PopupService.prototype.positionPopupUnderMouseEvent = function (params) {
	        var parentRect = this.ePopupParent.getBoundingClientRect();
	        this.positionPopup({
	            ePopup: params.ePopup,
	            x: params.mouseEvent.clientX - parentRect.left,
	            y: params.mouseEvent.clientY - parentRect.top,
	            keepWithinBounds: true
	        });
	    };
	    PopupService.prototype.positionPopupUnderComponent = function (params) {
	        var sourceRect = params.eventSource.getBoundingClientRect();
	        var parentRect = this.ePopupParent.getBoundingClientRect();
	        this.positionPopup({
	            ePopup: params.ePopup,
	            minWidth: params.minWidth,
	            nudgeX: params.nudgeX,
	            nudgeY: params.nudgeY,
	            x: sourceRect.left - parentRect.left,
	            y: sourceRect.top - parentRect.top + sourceRect.height,
	            keepWithinBounds: params.keepWithinBounds
	        });
	    };
	    PopupService.prototype.positionPopup = function (params) {
	        var parentRect = this.ePopupParent.getBoundingClientRect();
	        var x = params.x;
	        var y = params.y;
	        if (params.nudgeX) {
	            x += params.nudgeX;
	        }
	        if (params.nudgeY) {
	            y += params.nudgeY;
	        }
	        // if popup is overflowing to the right, move it left
	        if (params.keepWithinBounds) {
	            var minWidth;
	            if (params.minWidth > 0) {
	                minWidth = params.minWidth;
	            }
	            else if (params.ePopup.clientWidth > 0) {
	                minWidth = params.ePopup.clientWidth;
	            }
	            else {
	                minWidth = 200;
	            }
	            var widthOfParent = parentRect.right - parentRect.left;
	            var maxX = widthOfParent - minWidth;
	            if (x > maxX) {
	                x = maxX;
	            }
	            if (x < 0) {
	                x = 0;
	            }
	        }
	        params.ePopup.style.left = x + "px";
	        params.ePopup.style.top = y + "px";
	    };
	    //adds an element to a div, but also listens to background checking for clicks,
	    //so that when the background is clicked, the child is removed again, giving
	    //a model look to popups.
	    PopupService.prototype.addAsModalPopup = function (eChild, closeOnEsc, closedCallback) {
	        var eBody = document.body;
	        if (!eBody) {
	            console.warn('ag-grid: could not find the body of the document, document.body is empty');
	            return;
	        }
	        var popupAlreadyShown = utils_1.Utils.isVisible(eChild);
	        if (popupAlreadyShown) {
	            return;
	        }
	        this.ePopupParent.appendChild(eChild);
	        var that = this;
	        // if we add these listeners now, then the current mouse
	        // click will be included, which we don't want
	        setTimeout(function () {
	            if (closeOnEsc) {
	                eBody.addEventListener('keydown', hidePopupOnEsc);
	            }
	            eBody.addEventListener('click', hidePopup);
	            eBody.addEventListener('contextmenu', hidePopup);
	            //eBody.addEventListener('mousedown', hidePopup);
	            eChild.addEventListener('click', consumeClick);
	            //eChild.addEventListener('mousedown', consumeClick);
	        }, 0);
	        var eventFromChild = null;
	        function hidePopupOnEsc(event) {
	            var key = event.which || event.keyCode;
	            if (key === constants_1.Constants.KEY_ESCAPE) {
	                hidePopup(null);
	            }
	        }
	        function hidePopup(event) {
	            if (event && event === eventFromChild) {
	                return;
	            }
	            that.ePopupParent.removeChild(eChild);
	            eBody.removeEventListener('keydown', hidePopupOnEsc);
	            //eBody.removeEventListener('mousedown', hidePopupOnEsc);
	            eBody.removeEventListener('click', hidePopup);
	            eBody.removeEventListener('contextmenu', hidePopup);
	            eChild.removeEventListener('click', consumeClick);
	            //eChild.removeEventListener('mousedown', consumeClick);
	            if (closedCallback) {
	                closedCallback();
	            }
	        }
	        function consumeClick(event) {
	            eventFromChild = event;
	        }
	        return hidePopup;
	    };
	    PopupService = __decorate([
	        context_1.Bean('popupService'), 
	        __metadata('design:paramtypes', [])
	    ], PopupService);
	    return PopupService;
	})();
	exports.PopupService = PopupService;


/***/ },
/* 42 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
	 * @version v4.0.3
	 * @link http://www.ag-grid.com/
	 * @license MIT
	 */
	var utils_1 = __webpack_require__(7);
	var template = '<div>' +
	    '<div>' +
	    '<select class="ag-filter-select" id="filterType">' +
	    '<option value="1">[CONTAINS]</option>' +
	    '<option value="2">[EQUALS]</option>' +
	    '<option value="3">[STARTS WITH]</option>' +
	    '<option value="4">[ENDS WITH]</option>' +
	    '</select>' +
	    '</div>' +
	    '<div>' +
	    '<input class="ag-filter-filter" id="filterText" type="text" placeholder="[FILTER...]"/>' +
	    '</div>' +
	    '<div class="ag-filter-apply-panel" id="applyPanel">' +
	    '<button type="button" id="applyButton">[APPLY FILTER]</button>' +
	    '</div>' +
	    '</div>';
	var CONTAINS = 1;
	var EQUALS = 2;
	var STARTS_WITH = 3;
	var ENDS_WITH = 4;
	var TextFilter = (function () {
	    function TextFilter() {
	    }
	    TextFilter.prototype.init = function (params) {
	        this.filterParams = params.filterParams;
	        this.applyActive = this.filterParams && this.filterParams.apply === true;
	        this.filterChangedCallback = params.filterChangedCallback;
	        this.filterModifiedCallback = params.filterModifiedCallback;
	        this.localeTextFunc = params.localeTextFunc;
	        this.valueGetter = params.valueGetter;
	        this.createGui();
	        this.filterText = null;
	        this.filterType = CONTAINS;
	        this.createApi();
	    };
	    TextFilter.prototype.onNewRowsLoaded = function () {
	        var keepSelection = this.filterParams && this.filterParams.newRowsAction === 'keep';
	        if (!keepSelection) {
	            this.api.setType(CONTAINS);
	            this.api.setFilter(null);
	        }
	    };
	    TextFilter.prototype.afterGuiAttached = function () {
	        this.eFilterTextField.focus();
	    };
	    TextFilter.prototype.doesFilterPass = function (node) {
	        if (!this.filterText) {
	            return true;
	        }
	        var value = this.valueGetter(node);
	        if (!value) {
	            return false;
	        }
	        var valueLowerCase = value.toString().toLowerCase();
	        switch (this.filterType) {
	            case CONTAINS:
	                return valueLowerCase.indexOf(this.filterText) >= 0;
	            case EQUALS:
	                return valueLowerCase === this.filterText;
	            case STARTS_WITH:
	                return valueLowerCase.indexOf(this.filterText) === 0;
	            case ENDS_WITH:
	                var index = valueLowerCase.lastIndexOf(this.filterText);
	                return index >= 0 && index === (valueLowerCase.length - this.filterText.length);
	            default:
	                // should never happen
	                console.warn('invalid filter type ' + this.filterType);
	                return false;
	        }
	    };
	    TextFilter.prototype.getGui = function () {
	        return this.eGui;
	    };
	    TextFilter.prototype.isFilterActive = function () {
	        return this.filterText !== null;
	    };
	    TextFilter.prototype.createTemplate = function () {
	        return template
	            .replace('[FILTER...]', this.localeTextFunc('filterOoo', 'Filter...'))
	            .replace('[EQUALS]', this.localeTextFunc('equals', 'Equals'))
	            .replace('[CONTAINS]', this.localeTextFunc('contains', 'Contains'))
	            .replace('[STARTS WITH]', this.localeTextFunc('startsWith', 'Starts with'))
	            .replace('[ENDS WITH]', this.localeTextFunc('endsWith', 'Ends with'))
	            .replace('[APPLY FILTER]', this.localeTextFunc('applyFilter', 'Apply Filter'));
	    };
	    TextFilter.prototype.createGui = function () {
	        this.eGui = utils_1.Utils.loadTemplate(this.createTemplate());
	        this.eFilterTextField = this.eGui.querySelector("#filterText");
	        this.eTypeSelect = this.eGui.querySelector("#filterType");
	        utils_1.Utils.addChangeListener(this.eFilterTextField, this.onFilterChanged.bind(this));
	        this.eTypeSelect.addEventListener("change", this.onTypeChanged.bind(this));
	        this.setupApply();
	    };
	    TextFilter.prototype.setupApply = function () {
	        var _this = this;
	        if (this.applyActive) {
	            this.eApplyButton = this.eGui.querySelector('#applyButton');
	            this.eApplyButton.addEventListener('click', function () {
	                _this.filterChangedCallback();
	            });
	        }
	        else {
	            utils_1.Utils.removeElement(this.eGui, '#applyPanel');
	        }
	    };
	    TextFilter.prototype.onTypeChanged = function () {
	        this.filterType = parseInt(this.eTypeSelect.value);
	        this.filterChanged();
	    };
	    TextFilter.prototype.onFilterChanged = function () {
	        var filterText = utils_1.Utils.makeNull(this.eFilterTextField.value);
	        if (filterText && filterText.trim() === '') {
	            filterText = null;
	        }
	        var newFilterText;
	        if (filterText !== null && filterText !== undefined) {
	            newFilterText = filterText.toLowerCase();
	        }
	        else {
	            newFilterText = null;
	        }
	        if (this.filterText !== newFilterText) {
	            this.filterText = newFilterText;
	            this.filterChanged();
	        }
	    };
	    TextFilter.prototype.filterChanged = function () {
	        this.filterModifiedCallback();
	        if (!this.applyActive) {
	            this.filterChangedCallback();
	        }
	    };
	    TextFilter.prototype.createApi = function () {
	        var that = this;
	        this.api = {
	            EQUALS: EQUALS,
	            CONTAINS: CONTAINS,
	            STARTS_WITH: STARTS_WITH,
	            ENDS_WITH: ENDS_WITH,
	            setType: function (type) {
	                that.filterType = type;
	                that.eTypeSelect.value = type;
	            },
	            setFilter: function (filter) {
	                filter = utils_1.Utils.makeNull(filter);
	                if (filter) {
	                    that.filterText = filter.toLowerCase();
	                    that.eFilterTextField.value = filter;
	                }
	                else {
	                    that.filterText = null;
	                    that.eFilterTextField.value = null;
	                }
	            },
	            getType: function () {
	                return that.filterType;
	            },
	            getFilter: function () {
	                return that.filterText;
	            },
	            getModel: function () {
	                if (that.isFilterActive()) {
	                    return {
	                        type: that.filterType,
	                        filter: that.filterText
	                    };
	                }
	                else {
	                    return null;
	                }
	            },
	            setModel: function (dataModel) {
	                if (dataModel) {
	                    this.setType(dataModel.type);
	                    this.setFilter(dataModel.filter);
	                }
	                else {
	                    this.setFilter(null);
	                }
	            }
	        };
	    };
	    TextFilter.prototype.getApi = function () {
	        return this.api;
	    };
	    return TextFilter;
	})();
	exports.TextFilter = TextFilter;


/***/ },
/* 43 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
	 * @version v4.0.3
	 * @link http://www.ag-grid.com/
	 * @license MIT
	 */
	var utils_1 = __webpack_require__(7);
	var template = '<div>' +
	    '<div>' +
	    '<select class="ag-filter-select" id="filterType">' +
	    '<option value="1">[EQUALS]</option>' +
	    '<option value="2">[LESS THAN]</option>' +
	    '<option value="3">[GREATER THAN]</option>' +
	    '</select>' +
	    '</div>' +
	    '<div>' +
	    '<input class="ag-filter-filter" id="filterText" type="text" placeholder="[FILTER...]"/>' +
	    '</div>' +
	    '<div class="ag-filter-apply-panel" id="applyPanel">' +
	    '<button type="button" id="applyButton">[APPLY FILTER]</button>' +
	    '</div>' +
	    '</div>';
	var EQUALS = 1;
	var LESS_THAN = 2;
	var GREATER_THAN = 3;
	var NumberFilter = (function () {
	    function NumberFilter() {
	    }
	    NumberFilter.prototype.init = function (params) {
	        this.filterParams = params.filterParams;
	        this.applyActive = this.filterParams && this.filterParams.apply === true;
	        this.filterChangedCallback = params.filterChangedCallback;
	        this.filterModifiedCallback = params.filterModifiedCallback;
	        this.localeTextFunc = params.localeTextFunc;
	        this.valueGetter = params.valueGetter;
	        this.createGui();
	        this.filterNumber = null;
	        this.filterType = EQUALS;
	        this.createApi();
	    };
	    NumberFilter.prototype.onNewRowsLoaded = function () {
	        var keepSelection = this.filterParams && this.filterParams.newRowsAction === 'keep';
	        if (!keepSelection) {
	            this.api.setType(EQUALS);
	            this.api.setFilter(null);
	        }
	    };
	    NumberFilter.prototype.afterGuiAttached = function () {
	        this.eFilterTextField.focus();
	    };
	    NumberFilter.prototype.doesFilterPass = function (node) {
	        if (this.filterNumber === null) {
	            return true;
	        }
	        var value = this.valueGetter(node);
	        if (!value && value !== 0) {
	            return false;
	        }
	        var valueAsNumber;
	        if (typeof value === 'number') {
	            valueAsNumber = value;
	        }
	        else {
	            valueAsNumber = parseFloat(value);
	        }
	        switch (this.filterType) {
	            case EQUALS:
	                return valueAsNumber === this.filterNumber;
	            case LESS_THAN:
	                return valueAsNumber < this.filterNumber;
	            case GREATER_THAN:
	                return valueAsNumber > this.filterNumber;
	            default:
	                // should never happen
	                console.warn('invalid filter type ' + this.filterType);
	                return false;
	        }
	    };
	    NumberFilter.prototype.getGui = function () {
	        return this.eGui;
	    };
	    NumberFilter.prototype.isFilterActive = function () {
	        return this.filterNumber !== null;
	    };
	    NumberFilter.prototype.createTemplate = function () {
	        return template
	            .replace('[FILTER...]', this.localeTextFunc('filterOoo', 'Filter...'))
	            .replace('[EQUALS]', this.localeTextFunc('equals', 'Equals'))
	            .replace('[LESS THAN]', this.localeTextFunc('lessThan', 'Less than'))
	            .replace('[GREATER THAN]', this.localeTextFunc('greaterThan', 'Greater than'))
	            .replace('[APPLY FILTER]', this.localeTextFunc('applyFilter', 'Apply Filter'));
	    };
	    NumberFilter.prototype.createGui = function () {
	        this.eGui = utils_1.Utils.loadTemplate(this.createTemplate());
	        this.eFilterTextField = this.eGui.querySelector("#filterText");
	        this.eTypeSelect = this.eGui.querySelector("#filterType");
	        utils_1.Utils.addChangeListener(this.eFilterTextField, this.onFilterChanged.bind(this));
	        this.eTypeSelect.addEventListener("change", this.onTypeChanged.bind(this));
	        this.setupApply();
	    };
	    NumberFilter.prototype.setupApply = function () {
	        var _this = this;
	        if (this.applyActive) {
	            this.eApplyButton = this.eGui.querySelector('#applyButton');
	            this.eApplyButton.addEventListener('click', function () {
	                _this.filterChangedCallback();
	            });
	        }
	        else {
	            utils_1.Utils.removeElement(this.eGui, '#applyPanel');
	        }
	    };
	    NumberFilter.prototype.onTypeChanged = function () {
	        this.filterType = parseInt(this.eTypeSelect.value);
	        this.filterChanged();
	    };
	    NumberFilter.prototype.filterChanged = function () {
	        this.filterModifiedCallback();
	        if (!this.applyActive) {
	            this.filterChangedCallback();
	        }
	    };
	    NumberFilter.prototype.onFilterChanged = function () {
	        var filterText = utils_1.Utils.makeNull(this.eFilterTextField.value);
	        if (filterText && filterText.trim() === '') {
	            filterText = null;
	        }
	        var newFilter;
	        if (filterText !== null && filterText !== undefined) {
	            newFilter = parseFloat(filterText);
	        }
	        else {
	            newFilter = null;
	        }
	        if (this.filterNumber !== newFilter) {
	            this.filterNumber = newFilter;
	            this.filterChanged();
	        }
	    };
	    NumberFilter.prototype.createApi = function () {
	        var that = this;
	        this.api = {
	            EQUALS: EQUALS,
	            LESS_THAN: LESS_THAN,
	            GREATER_THAN: GREATER_THAN,
	            setType: function (type) {
	                that.filterType = type;
	                that.eTypeSelect.value = type;
	            },
	            setFilter: function (filter) {
	                filter = utils_1.Utils.makeNull(filter);
	                if (filter !== null && !(typeof filter === 'number')) {
	                    filter = parseFloat(filter);
	                }
	                that.filterNumber = filter;
	                that.eFilterTextField.value = filter;
	            },
	            getType: function () {
	                return that.filterType;
	            },
	            getFilter: function () {
	                return that.filterNumber;
	            },
	            getModel: function () {
	                if (that.isFilterActive()) {
	                    return {
	                        type: that.filterType,
	                        filter: that.filterNumber
	                    };
	                }
	                else {
	                    return null;
	                }
	            },
	            setModel: function (dataModel) {
	                if (dataModel) {
	                    this.setType(dataModel.type);
	                    this.setFilter(dataModel.filter);
	                }
	                else {
	                    this.setFilter(null);
	                }
	            }
	        };
	    };
	    NumberFilter.prototype.getApi = function () {
	        return this.api;
	    };
	    return NumberFilter;
	})();
	exports.NumberFilter = NumberFilter;


/***/ },
/* 44 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
	 * @version v4.0.3
	 * @link http://www.ag-grid.com/
	 * @license MIT
	 */
	var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
	    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
	    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
	    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
	    return c > 3 && r && Object.defineProperty(target, key, r), r;
	};
	var __metadata = (this && this.__metadata) || function (k, v) {
	    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
	};
	var context_1 = __webpack_require__(6);
	var context_2 = __webpack_require__(6);
	var eventService_1 = __webpack_require__(4);
	var context_3 = __webpack_require__(6);
	var events_1 = __webpack_require__(10);
	var gridOptionsWrapper_1 = __webpack_require__(3);
	var columnController_1 = __webpack_require__(13);
	var utils_1 = __webpack_require__(7);
	var gridCell_1 = __webpack_require__(31);
	var FocusedCellController = (function () {
	    function FocusedCellController() {
	    }
	    FocusedCellController.prototype.init = function () {
	        this.eventService.addEventListener(events_1.Events.EVENT_COLUMN_EVERYTHING_CHANGED, this.clearFocusedCell.bind(this));
	        this.eventService.addEventListener(events_1.Events.EVENT_COLUMN_GROUP_OPENED, this.clearFocusedCell.bind(this));
	        this.eventService.addEventListener(events_1.Events.EVENT_COLUMN_MOVED, this.clearFocusedCell.bind(this));
	        this.eventService.addEventListener(events_1.Events.EVENT_COLUMN_PINNED, this.clearFocusedCell.bind(this));
	        this.eventService.addEventListener(events_1.Events.EVENT_COLUMN_ROW_GROUP_CHANGE, this.clearFocusedCell.bind(this));
	        this.eventService.addEventListener(events_1.Events.EVENT_COLUMN_VISIBLE, this.clearFocusedCell.bind(this));
	        //this.eventService.addEventListener(Events.EVENT_COLUMN_VISIBLE, this.clearFocusedCell.bind(this));
	    };
	    FocusedCellController.prototype.clearFocusedCell = function () {
	        this.focusedCell = null;
	        this.onCellFocused(false);
	    };
	    FocusedCellController.prototype.getFocusedCell = function () {
	        return this.focusedCell;
	    };
	    FocusedCellController.prototype.setFocusedCell = function (rowIndex, colKey, floating, forceBrowserFocus) {
	        if (forceBrowserFocus === void 0) { forceBrowserFocus = false; }
	        if (this.gridOptionsWrapper.isSuppressCellSelection()) {
	            return;
	        }
	        var column = utils_1.Utils.makeNull(this.columnController.getColumn(colKey));
	        this.focusedCell = new gridCell_1.GridCell(rowIndex, utils_1.Utils.makeNull(floating), column);
	        this.onCellFocused(forceBrowserFocus);
	    };
	    FocusedCellController.prototype.isCellFocused = function (rowIndex, column, floating) {
	        if (utils_1.Utils.missing(this.focusedCell)) {
	            return false;
	        }
	        return this.focusedCell.column === column && this.isRowFocused(rowIndex, floating);
	    };
	    FocusedCellController.prototype.isRowFocused = function (rowIndex, floating) {
	        if (utils_1.Utils.missing(this.focusedCell)) {
	            return false;
	        }
	        var floatingOrNull = utils_1.Utils.makeNull(floating);
	        return this.focusedCell.rowIndex === rowIndex && this.focusedCell.floating === floatingOrNull;
	    };
	    FocusedCellController.prototype.onCellFocused = function (forceBrowserFocus) {
	        var event = {
	            rowIndex: null,
	            column: null,
	            floating: null,
	            forceBrowserFocus: forceBrowserFocus
	        };
	        if (this.focusedCell) {
	            event.rowIndex = this.focusedCell.rowIndex;
	            event.column = this.focusedCell.column;
	            event.floating = this.focusedCell.floating;
	        }
	        this.eventService.dispatchEvent(events_1.Events.EVENT_CELL_FOCUSED, event);
	    };
	    __decorate([
	        context_2.Autowired('eventService'), 
	        __metadata('design:type', eventService_1.EventService)
	    ], FocusedCellController.prototype, "eventService", void 0);
	    __decorate([
	        context_2.Autowired('gridOptionsWrapper'), 
	        __metadata('design:type', gridOptionsWrapper_1.GridOptionsWrapper)
	    ], FocusedCellController.prototype, "gridOptionsWrapper", void 0);
	    __decorate([
	        context_2.Autowired('columnController'), 
	        __metadata('design:type', columnController_1.ColumnController)
	    ], FocusedCellController.prototype, "columnController", void 0);
	    __decorate([
	        context_3.PostConstruct, 
	        __metadata('design:type', Function), 
	        __metadata('design:paramtypes', []), 
	        __metadata('design:returntype', void 0)
	    ], FocusedCellController.prototype, "init", null);
	    FocusedCellController = __decorate([
	        context_1.Bean('focusedCellController'), 
	        __metadata('design:paramtypes', [])
	    ], FocusedCellController);
	    return FocusedCellController;
	})();
	exports.FocusedCellController = FocusedCellController;


/***/ },
/* 45 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
	 * @version v4.0.3
	 * @link http://www.ag-grid.com/
	 * @license MIT
	 */
	var utils_1 = __webpack_require__(7);
	var eventService_1 = __webpack_require__(4);
	var Component = (function () {
	    function Component(template) {
	        this.destroyFunctions = [];
	        this.eGui = utils_1.Utils.loadTemplate(template);
	    }
	    Component.prototype.addEventListener = function (eventType, listener) {
	        if (!this.localEventService) {
	            this.localEventService = new eventService_1.EventService();
	        }
	        this.localEventService.addEventListener(eventType, listener);
	    };
	    Component.prototype.dispatchEvent = function (eventType, event) {
	        if (this.localEventService) {
	            this.localEventService.dispatchEvent(eventType, event);
	        }
	    };
	    Component.prototype.getGui = function () {
	        return this.eGui;
	    };
	    Component.prototype.queryForHtmlElement = function (cssSelector) {
	        return this.eGui.querySelector(cssSelector);
	    };
	    Component.prototype.queryForHtmlInputElement = function (cssSelector) {
	        return this.eGui.querySelector(cssSelector);
	    };
	    Component.prototype.appendChild = function (newChild) {
	        if (utils_1.Utils.isNodeOrElement(newChild)) {
	            this.eGui.appendChild(newChild);
	        }
	        else {
	            this.eGui.appendChild(newChild.getGui());
	        }
	    };
	    Component.prototype.setVisible = function (visible) {
	        utils_1.Utils.addOrRemoveCssClass(this.eGui, 'ag-hidden', !visible);
	    };
	    Component.prototype.destroy = function () {
	        this.destroyFunctions.forEach(function (func) { return func(); });
	    };
	    Component.prototype.addGuiEventListener = function (event, listener) {
	        var _this = this;
	        this.getGui().addEventListener(event, listener);
	        this.destroyFunctions.push(function () { return _this.getGui().removeEventListener(event, listener); });
	    };
	    Component.prototype.addDestroyableEventListener = function (eElement, event, listener) {
	        if (eElement instanceof eventService_1.EventService) {
	            eElement.addEventListener(event, listener);
	        }
	        else {
	            eElement.addEventListener(event, listener);
	        }
	        this.destroyFunctions.push(function () {
	            if (eElement instanceof eventService_1.EventService) {
	                eElement.removeEventListener(event, listener);
	            }
	            else {
	                eElement.removeEventListener(event, listener);
	            }
	        });
	    };
	    Component.prototype.addDestroyFunc = function (func) {
	        this.destroyFunctions.push(func);
	    };
	    return Component;
	})();
	exports.Component = Component;


/***/ },
/* 46 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
	 * @version v4.0.3
	 * @link http://www.ag-grid.com/
	 * @license MIT
	 */
	var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
	    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
	    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
	    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
	    return c > 3 && r && Object.defineProperty(target, key, r), r;
	};
	var __metadata = (this && this.__metadata) || function (k, v) {
	    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
	};
	var context_1 = __webpack_require__(6);
	var constants_1 = __webpack_require__(8);
	var context_2 = __webpack_require__(6);
	var columnController_1 = __webpack_require__(13);
	var floatingRowModel_1 = __webpack_require__(26);
	var utils_1 = __webpack_require__(7);
	var gridRow_1 = __webpack_require__(32);
	var gridCell_1 = __webpack_require__(31);
	var CellNavigationService = (function () {
	    function CellNavigationService() {
	    }
	    CellNavigationService.prototype.getNextCellToFocus = function (key, lastCellToFocus) {
	        switch (key) {
	            case constants_1.Constants.KEY_UP: return this.getCellAbove(lastCellToFocus);
	            case constants_1.Constants.KEY_DOWN: return this.getCellBelow(lastCellToFocus);
	            case constants_1.Constants.KEY_RIGHT: return this.getCellToRight(lastCellToFocus);
	            case constants_1.Constants.KEY_LEFT: return this.getCellToLeft(lastCellToFocus);
	            default: console.log('ag-Grid: unknown key for navigation ' + key);
	        }
	    };
	    CellNavigationService.prototype.getCellToLeft = function (lastCell) {
	        var colToLeft = this.columnController.getDisplayedColBefore(lastCell.column);
	        if (!colToLeft) {
	            return null;
	        }
	        else {
	            return new gridCell_1.GridCell(lastCell.rowIndex, lastCell.floating, colToLeft);
	        }
	    };
	    CellNavigationService.prototype.getCellToRight = function (lastCell) {
	        var colToRight = this.columnController.getDisplayedColAfter(lastCell.column);
	        // if already on right, do nothing
	        if (!colToRight) {
	            return null;
	        }
	        else {
	            return new gridCell_1.GridCell(lastCell.rowIndex, lastCell.floating, colToRight);
	        }
	    };
	    CellNavigationService.prototype.getRowBelow = function (lastRow) {
	        // if already on top row, do nothing
	        if (this.isLastRowInContainer(lastRow)) {
	            if (lastRow.isFloatingBottom()) {
	                return null;
	            }
	            else if (lastRow.isNotFloating()) {
	                if (this.floatingRowModel.isRowsToRender(constants_1.Constants.FLOATING_BOTTOM)) {
	                    return new gridRow_1.GridRow(0, constants_1.Constants.FLOATING_BOTTOM);
	                }
	                else {
	                    return null;
	                }
	            }
	            else {
	                if (this.rowModel.isRowsToRender()) {
	                    return new gridRow_1.GridRow(0, null);
	                }
	                else if (this.floatingRowModel.isRowsToRender(constants_1.Constants.FLOATING_BOTTOM)) {
	                    return new gridRow_1.GridRow(0, constants_1.Constants.FLOATING_BOTTOM);
	                }
	                else {
	                    return null;
	                }
	            }
	        }
	        else {
	            return new gridRow_1.GridRow(lastRow.rowIndex + 1, lastRow.floating);
	        }
	    };
	    CellNavigationService.prototype.getCellBelow = function (lastCell) {
	        var rowBelow = this.getRowBelow(lastCell.getGridRow());
	        if (rowBelow) {
	            return new gridCell_1.GridCell(rowBelow.rowIndex, rowBelow.floating, lastCell.column);
	        }
	        else {
	            return null;
	        }
	    };
	    CellNavigationService.prototype.isLastRowInContainer = function (gridRow) {
	        if (gridRow.isFloatingTop()) {
	            var lastTopIndex = this.floatingRowModel.getFloatingTopRowData().length - 1;
	            return lastTopIndex === gridRow.rowIndex;
	        }
	        else if (gridRow.isFloatingBottom()) {
	            var lastBottomIndex = this.floatingRowModel.getFloatingBottomRowData().length - 1;
	            return lastBottomIndex === gridRow.rowIndex;
	        }
	        else {
	            var lastBodyIndex = this.rowModel.getRowCount() - 1;
	            return lastBodyIndex === gridRow.rowIndex;
	        }
	    };
	    CellNavigationService.prototype.getRowAbove = function (lastRow) {
	        // if already on top row, do nothing
	        if (lastRow.rowIndex === 0) {
	            if (lastRow.isFloatingTop()) {
	                return null;
	            }
	            else if (lastRow.isNotFloating()) {
	                if (this.floatingRowModel.isRowsToRender(constants_1.Constants.FLOATING_TOP)) {
	                    return this.getLastFloatingTopRow();
	                }
	                else {
	                    return null;
	                }
	            }
	            else {
	                // last floating bottom
	                if (this.rowModel.isRowsToRender()) {
	                    return this.getLastBodyCell();
	                }
	                else if (this.floatingRowModel.isRowsToRender(constants_1.Constants.FLOATING_TOP)) {
	                    return this.getLastFloatingTopRow();
	                }
	                else {
	                    return null;
	                }
	            }
	        }
	        else {
	            return new gridRow_1.GridRow(lastRow.rowIndex - 1, lastRow.floating);
	        }
	    };
	    CellNavigationService.prototype.getCellAbove = function (lastCell) {
	        var rowAbove = this.getRowAbove(lastCell.getGridRow());
	        if (rowAbove) {
	            return new gridCell_1.GridCell(rowAbove.rowIndex, rowAbove.floating, lastCell.column);
	        }
	        else {
	            return null;
	        }
	    };
	    CellNavigationService.prototype.getLastBodyCell = function () {
	        var lastBodyRow = this.rowModel.getRowCount() - 1;
	        return new gridRow_1.GridRow(lastBodyRow, null);
	    };
	    CellNavigationService.prototype.getLastFloatingTopRow = function () {
	        var lastFloatingRow = this.floatingRowModel.getFloatingTopRowData().length - 1;
	        return new gridRow_1.GridRow(lastFloatingRow, constants_1.Constants.FLOATING_TOP);
	    };
	    CellNavigationService.prototype.getNextTabbedCellForwards = function (gridCell) {
	        var displayedColumns = this.columnController.getAllDisplayedColumns();
	        var newRowIndex = gridCell.rowIndex;
	        var newFloating = gridCell.floating;
	        // move along to the next cell
	        var newColumn = this.columnController.getDisplayedColAfter(gridCell.column);
	        // check if end of the row, and if so, go forward a row
	        if (!newColumn) {
	            newColumn = displayedColumns[0];
	            var rowBelow = this.getRowBelow(gridCell.getGridRow());
	            if (utils_1.Utils.missing(rowBelow)) {
	                return;
	            }
	            newRowIndex = rowBelow.rowIndex;
	            newFloating = rowBelow.floating;
	        }
	        return new gridCell_1.GridCell(newRowIndex, newFloating, newColumn);
	    };
	    CellNavigationService.prototype.getNextTabbedCellBackwards = function (gridCell) {
	        var displayedColumns = this.columnController.getAllDisplayedColumns();
	        var newRowIndex = gridCell.rowIndex;
	        var newFloating = gridCell.floating;
	        // move along to the next cell
	        var newColumn = this.columnController.getDisplayedColBefore(gridCell.column);
	        // check if end of the row, and if so, go forward a row
	        if (!newColumn) {
	            newColumn = displayedColumns[displayedColumns.length - 1];
	            var rowAbove = this.getRowAbove(gridCell.getGridRow());
	            if (utils_1.Utils.missing(rowAbove)) {
	                return;
	            }
	            newRowIndex = rowAbove.rowIndex;
	            newFloating = rowAbove.floating;
	        }
	        return new gridCell_1.GridCell(newRowIndex, newFloating, newColumn);
	    };
	    __decorate([
	        context_2.Autowired('columnController'), 
	        __metadata('design:type', columnController_1.ColumnController)
	    ], CellNavigationService.prototype, "columnController", void 0);
	    __decorate([
	        context_2.Autowired('rowModel'), 
	        __metadata('design:type', Object)
	    ], CellNavigationService.prototype, "rowModel", void 0);
	    __decorate([
	        context_2.Autowired('floatingRowModel'), 
	        __metadata('design:type', floatingRowModel_1.FloatingRowModel)
	    ], CellNavigationService.prototype, "floatingRowModel", void 0);
	    CellNavigationService = __decorate([
	        context_1.Bean('cellNavigationService'), 
	        __metadata('design:paramtypes', [])
	    ], CellNavigationService);
	    return CellNavigationService;
	})();
	exports.CellNavigationService = CellNavigationService;


/***/ },
/* 47 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
	 * @version v4.0.3
	 * @link http://www.ag-grid.com/
	 * @license MIT
	 */
	var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
	    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
	    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
	    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
	    return c > 3 && r && Object.defineProperty(target, key, r), r;
	};
	var __metadata = (this && this.__metadata) || function (k, v) {
	    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
	};
	var __param = (this && this.__param) || function (paramIndex, decorator) {
	    return function (target, key) { decorator(target, key, paramIndex); }
	};
	var gridOptionsWrapper_1 = __webpack_require__(3);
	var logger_1 = __webpack_require__(5);
	var columnUtils_1 = __webpack_require__(16);
	var columnKeyCreator_1 = __webpack_require__(48);
	var originalColumnGroup_1 = __webpack_require__(17);
	var column_1 = __webpack_require__(15);
	var context_1 = __webpack_require__(6);
	var context_2 = __webpack_require__(6);
	var context_3 = __webpack_require__(6);
	var context_4 = __webpack_require__(6);
	// takes in a list of columns, as specified by the column definitions, and returns column groups
	var BalancedColumnTreeBuilder = (function () {
	    function BalancedColumnTreeBuilder() {
	    }
	    BalancedColumnTreeBuilder.prototype.agWire = function (loggerFactory) {
	        this.logger = loggerFactory.create('BalancedColumnTreeBuilder');
	    };
	    BalancedColumnTreeBuilder.prototype.createBalancedColumnGroups = function (abstractColDefs) {
	        // column key creator dishes out unique column id's in a deterministic way,
	        // so if we have two grids (that cold be master/slave) with same column definitions,
	        // then this ensures the two grids use identical id's.
	        var columnKeyCreator = new columnKeyCreator_1.ColumnKeyCreator();
	        // create am unbalanced tree that maps the provided definitions
	        var unbalancedTree = this.recursivelyCreateColumns(abstractColDefs, 0, columnKeyCreator);
	        var treeDept = this.findMaxDept(unbalancedTree, 0);
	        this.logger.log('Number of levels for grouped columns is ' + treeDept);
	        var balancedTree = this.balanceColumnTree(unbalancedTree, 0, treeDept, columnKeyCreator);
	        this.columnUtils.deptFirstOriginalTreeSearch(balancedTree, function (child) {
	            if (child instanceof originalColumnGroup_1.OriginalColumnGroup) {
	                child.calculateExpandable();
	            }
	        });
	        return {
	            balancedTree: balancedTree,
	            treeDept: treeDept
	        };
	    };
	    BalancedColumnTreeBuilder.prototype.balanceColumnTree = function (unbalancedTree, currentDept, columnDept, columnKeyCreator) {
	        var _this = this;
	        var result = [];
	        // go through each child, for groups, recurse a level deeper,
	        // for columns we need to pad
	        unbalancedTree.forEach(function (child) {
	            if (child instanceof originalColumnGroup_1.OriginalColumnGroup) {
	                var originalGroup = child;
	                var newChildren = _this.balanceColumnTree(originalGroup.getChildren(), currentDept + 1, columnDept, columnKeyCreator);
	                originalGroup.setChildren(newChildren);
	                result.push(originalGroup);
	            }
	            else {
	                var newChild = child;
	                for (var i = columnDept - 1; i >= currentDept; i--) {
	                    var newColId = columnKeyCreator.getUniqueKey(null, null);
	                    var paddedGroup = new originalColumnGroup_1.OriginalColumnGroup(null, newColId);
	                    paddedGroup.setChildren([newChild]);
	                    newChild = paddedGroup;
	                }
	                result.push(newChild);
	            }
	        });
	        return result;
	    };
	    BalancedColumnTreeBuilder.prototype.findMaxDept = function (treeChildren, dept) {
	        var maxDeptThisLevel = dept;
	        for (var i = 0; i < treeChildren.length; i++) {
	            var abstractColumn = treeChildren[i];
	            if (abstractColumn instanceof originalColumnGroup_1.OriginalColumnGroup) {
	                var originalGroup = abstractColumn;
	                var newDept = this.findMaxDept(originalGroup.getChildren(), dept + 1);
	                if (maxDeptThisLevel < newDept) {
	                    maxDeptThisLevel = newDept;
	                }
	            }
	        }
	        return maxDeptThisLevel;
	    };
	    BalancedColumnTreeBuilder.prototype.recursivelyCreateColumns = function (abstractColDefs, level, columnKeyCreator) {
	        var _this = this;
	        var result = [];
	        if (!abstractColDefs) {
	            return result;
	        }
	        abstractColDefs.forEach(function (abstractColDef) {
	            _this.checkForDeprecatedItems(abstractColDef);
	            if (_this.isColumnGroup(abstractColDef)) {
	                var groupColDef = abstractColDef;
	                var groupId = columnKeyCreator.getUniqueKey(groupColDef.groupId, null);
	                var originalGroup = new originalColumnGroup_1.OriginalColumnGroup(groupColDef, groupId);
	                var children = _this.recursivelyCreateColumns(groupColDef.children, level + 1, columnKeyCreator);
	                originalGroup.setChildren(children);
	                result.push(originalGroup);
	            }
	            else {
	                var colDef = abstractColDef;
	                var colId = columnKeyCreator.getUniqueKey(colDef.colId, colDef.field);
	                var column = new column_1.Column(colDef, colId);
	                _this.context.wireBean(column);
	                result.push(column);
	            }
	        });
	        return result;
	    };
	    BalancedColumnTreeBuilder.prototype.checkForDeprecatedItems = function (colDef) {
	        if (colDef) {
	            var colDefNoType = colDef; // take out the type, so we can access attributes not defined in the type
	            if (colDefNoType.group !== undefined) {
	                console.warn('ag-grid: colDef.group is invalid, please check documentation on how to do grouping as it changed in version 3');
	            }
	            if (colDefNoType.headerGroup !== undefined) {
	                console.warn('ag-grid: colDef.headerGroup is invalid, please check documentation on how to do grouping as it changed in version 3');
	            }
	            if (colDefNoType.headerGroupShow !== undefined) {
	                console.warn('ag-grid: colDef.headerGroupShow is invalid, should be columnGroupShow, please check documentation on how to do grouping as it changed in version 3');
	            }
	        }
	    };
	    // if object has children, we assume it's a group
	    BalancedColumnTreeBuilder.prototype.isColumnGroup = function (abstractColDef) {
	        return abstractColDef.children !== undefined;
	    };
	    __decorate([
	        context_3.Autowired('gridOptionsWrapper'), 
	        __metadata('design:type', gridOptionsWrapper_1.GridOptionsWrapper)
	    ], BalancedColumnTreeBuilder.prototype, "gridOptionsWrapper", void 0);
	    __decorate([
	        context_3.Autowired('columnUtils'), 
	        __metadata('design:type', columnUtils_1.ColumnUtils)
	    ], BalancedColumnTreeBuilder.prototype, "columnUtils", void 0);
	    __decorate([
	        context_3.Autowired('context'), 
	        __metadata('design:type', context_4.Context)
	    ], BalancedColumnTreeBuilder.prototype, "context", void 0);
	    __decorate([
	        __param(0, context_2.Qualifier('loggerFactory')), 
	        __metadata('design:type', Function), 
	        __metadata('design:paramtypes', [logger_1.LoggerFactory]), 
	        __metadata('design:returntype', void 0)
	    ], BalancedColumnTreeBuilder.prototype, "agWire", null);
	    BalancedColumnTreeBuilder = __decorate([
	        context_1.Bean('balancedColumnTreeBuilder'), 
	        __metadata('design:paramtypes', [])
	    ], BalancedColumnTreeBuilder);
	    return BalancedColumnTreeBuilder;
	})();
	exports.BalancedColumnTreeBuilder = BalancedColumnTreeBuilder;


/***/ },
/* 48 */
/***/ function(module, exports) {

	/**
	 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
	 * @version v4.0.3
	 * @link http://www.ag-grid.com/
	 * @license MIT
	 */
	// class returns a unique id to use for the column. it checks the existing columns, and if the requested
	// id is already taken, it will start appending numbers until it gets a unique id.
	// eg, if the col field is 'name', it will try ids: {name, name_1, name_2...}
	// if no field or id provided in the col, it will try the ids of natural numbers
	var ColumnKeyCreator = (function () {
	    function ColumnKeyCreator() {
	        this.existingKeys = [];
	    }
	    ColumnKeyCreator.prototype.getUniqueKey = function (colId, colField) {
	        var count = 0;
	        while (true) {
	            var idToTry;
	            if (colId) {
	                idToTry = colId;
	                if (count !== 0) {
	                    idToTry += '_' + count;
	                }
	            }
	            else if (colField) {
	                idToTry = colField;
	                if (count !== 0) {
	                    idToTry += '_' + count;
	                }
	            }
	            else {
	                idToTry = '' + count;
	            }
	            if (this.existingKeys.indexOf(idToTry) < 0) {
	                this.existingKeys.push(idToTry);
	                return idToTry;
	            }
	            count++;
	        }
	    };
	    return ColumnKeyCreator;
	})();
	exports.ColumnKeyCreator = ColumnKeyCreator;


/***/ },
/* 49 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
	 * @version v4.0.3
	 * @link http://www.ag-grid.com/
	 * @license MIT
	 */
	var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
	    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
	    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
	    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
	    return c > 3 && r && Object.defineProperty(target, key, r), r;
	};
	var __metadata = (this && this.__metadata) || function (k, v) {
	    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
	};
	var columnUtils_1 = __webpack_require__(16);
	var columnGroup_1 = __webpack_require__(14);
	var originalColumnGroup_1 = __webpack_require__(17);
	var context_1 = __webpack_require__(6);
	var context_2 = __webpack_require__(6);
	// takes in a list of columns, as specified by the column definitions, and returns column groups
	var DisplayedGroupCreator = (function () {
	    function DisplayedGroupCreator() {
	    }
	    DisplayedGroupCreator.prototype.createDisplayedGroups = function (sortedVisibleColumns, balancedColumnTree, groupInstanceIdCreator) {
	        var _this = this;
	        var result = [];
	        var previousRealPath;
	        var previousOriginalPath;
	        // go through each column, then do a bottom up comparison to the previous column, and start
	        // to share groups if they converge at any point.
	        sortedVisibleColumns.forEach(function (currentColumn) {
	            var currentOriginalPath = _this.getOriginalPathForColumn(balancedColumnTree, currentColumn);
	            var currentRealPath = [];
	            var firstColumn = !previousOriginalPath;
	            for (var i = 0; i < currentOriginalPath.length; i++) {
	                if (firstColumn || currentOriginalPath[i] !== previousOriginalPath[i]) {
	                    // new group needed
	                    var originalGroup = currentOriginalPath[i];
	                    var groupId = originalGroup.getGroupId();
	                    var instanceId = groupInstanceIdCreator.getInstanceIdForKey(groupId);
	                    var newGroup = new columnGroup_1.ColumnGroup(originalGroup, groupId, instanceId);
	                    currentRealPath[i] = newGroup;
	                    // if top level, add to result, otherwise add to parent
	                    if (i == 0) {
	                        result.push(newGroup);
	                    }
	                    else {
	                        currentRealPath[i - 1].addChild(newGroup);
	                    }
	                }
	                else {
	                    // reuse old group
	                    currentRealPath[i] = previousRealPath[i];
	                }
	            }
	            var noColumnGroups = currentRealPath.length === 0;
	            if (noColumnGroups) {
	                // if we are not grouping, then the result of the above is an empty
	                // path (no groups), and we just add the column to the root list.
	                result.push(currentColumn);
	            }
	            else {
	                var leafGroup = currentRealPath[currentRealPath.length - 1];
	                leafGroup.addChild(currentColumn);
	            }
	            previousRealPath = currentRealPath;
	            previousOriginalPath = currentOriginalPath;
	        });
	        return result;
	    };
	    DisplayedGroupCreator.prototype.createFakePath = function (balancedColumnTree) {
	        var result = [];
	        var currentChildren = balancedColumnTree;
	        // this while look does search on the balanced tree, so our result is the right length
	        var index = 0;
	        while (currentChildren && currentChildren[0] && currentChildren[0] instanceof originalColumnGroup_1.OriginalColumnGroup) {
	            // putting in a deterministic fake id, in case the API in the future needs to reference the col
	            result.push(new originalColumnGroup_1.OriginalColumnGroup(null, 'FAKE_PATH_' + index));
	            currentChildren = currentChildren[0].getChildren();
	            index++;
	        }
	        return result;
	    };
	    DisplayedGroupCreator.prototype.getOriginalPathForColumn = function (balancedColumnTree, column) {
	        var result = [];
	        var found = false;
	        recursePath(balancedColumnTree, 0);
	        // it's possible we didn't find a path. this happens if the column is generated
	        // by the grid, in that the definition didn't come from the client. in this case,
	        // we create a fake original path.
	        if (found) {
	            return result;
	        }
	        else {
	            return this.createFakePath(balancedColumnTree);
	        }
	        function recursePath(balancedColumnTree, dept) {
	            for (var i = 0; i < balancedColumnTree.length; i++) {
	                if (found) {
	                    // quit the search, so 'result' is kept with the found result
	                    return;
	                }
	                var node = balancedColumnTree[i];
	                if (node instanceof originalColumnGroup_1.OriginalColumnGroup) {
	                    var nextNode = node;
	                    recursePath(nextNode.getChildren(), dept + 1);
	                    result[dept] = node;
	                }
	                else {
	                    if (node === column) {
	                        found = true;
	                    }
	                }
	            }
	        }
	    };
	    __decorate([
	        context_2.Autowired('columnUtils'), 
	        __metadata('design:type', columnUtils_1.ColumnUtils)
	    ], DisplayedGroupCreator.prototype, "columnUtils", void 0);
	    DisplayedGroupCreator = __decorate([
	        context_1.Bean('displayedGroupCreator'), 
	        __metadata('design:paramtypes', [])
	    ], DisplayedGroupCreator);
	    return DisplayedGroupCreator;
	})();
	exports.DisplayedGroupCreator = DisplayedGroupCreator;


/***/ },
/* 50 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
	 * @version v4.0.3
	 * @link http://www.ag-grid.com/
	 * @license MIT
	 */
	var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
	    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
	    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
	    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
	    return c > 3 && r && Object.defineProperty(target, key, r), r;
	};
	var __metadata = (this && this.__metadata) || function (k, v) {
	    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
	};
	var rowRenderer_1 = __webpack_require__(23);
	var gridPanel_1 = __webpack_require__(24);
	var context_1 = __webpack_require__(6);
	var context_2 = __webpack_require__(6);
	var AutoWidthCalculator = (function () {
	    function AutoWidthCalculator() {
	    }
	    // this is the trick: we create a dummy container and clone all the cells
	    // into the dummy, then check the dummy's width. then destroy the dummy
	    // as we don't need it any more.
	    // drawback: only the cells visible on the screen are considered
	    AutoWidthCalculator.prototype.getPreferredWidthForColumn = function (column) {
	        var eDummyContainer = document.createElement('span');
	        // position fixed, so it isn't restricted to the boundaries of the parent
	        eDummyContainer.style.position = 'fixed';
	        // we put the dummy into the body container, so it will inherit all the
	        // css styles that the real cells are inheriting
	        var eBodyContainer = this.gridPanel.getBodyContainer();
	        eBodyContainer.appendChild(eDummyContainer);
	        // get all the cells that are currently displayed (this only brings back
	        // rendered cells, rows not rendered due to row visualisation will not be here)
	        var eOriginalCells = this.rowRenderer.getAllCellsForColumn(column);
	        eOriginalCells.forEach(function (eCell, index) {
	            // make a deep clone of the cell
	            var eCellClone = eCell.cloneNode(true);
	            // the original has a fixed width, we remove this to allow the natural width based on content
	            eCellClone.style.width = '';
	            // the original has position = absolute, we need to remove this so it's positioned normally
	            eCellClone.style.position = 'static';
	            eCellClone.style.left = '';
	            // we put the cell into a containing div, as otherwise the cells would just line up
	            // on the same line, standard flow layout, by putting them into divs, they are laid
	            // out one per line
	            var eCloneParent = document.createElement('div');
	            // table-row, so that each cell is on a row. i also tried display='block', but this
	            // didn't work in IE
	            eCloneParent.style.display = 'table-row';
	            // the twig on the branch, the branch on the tree, the tree in the hole,
	            // the hole in the bog, the bog in the clone, the clone in the parent,
	            // the parent in the dummy, and the dummy down in the vall-e-ooo, OOOOOOOOO! Oh row the rattling bog....
	            eCloneParent.appendChild(eCellClone);
	            eDummyContainer.appendChild(eCloneParent);
	        });
	        // at this point, all the clones are lined up vertically with natural widths. the dummy
	        // container will have a width wide enough just to fit the largest.
	        var dummyContainerWidth = eDummyContainer.offsetWidth;
	        // we are finished with the dummy container, so get rid of it
	        eBodyContainer.removeChild(eDummyContainer);
	        // we add 4 as I found without it, the gui still put '...' after some of the texts
	        return dummyContainerWidth + 4;
	    };
	    __decorate([
	        context_2.Autowired('rowRenderer'), 
	        __metadata('design:type', rowRenderer_1.RowRenderer)
	    ], AutoWidthCalculator.prototype, "rowRenderer", void 0);
	    __decorate([
	        context_2.Autowired('gridPanel'), 
	        __metadata('design:type', gridPanel_1.GridPanel)
	    ], AutoWidthCalculator.prototype, "gridPanel", void 0);
	    AutoWidthCalculator = __decorate([
	        context_1.Bean('autoWidthCalculator'), 
	        __metadata('design:paramtypes', [])
	    ], AutoWidthCalculator);
	    return AutoWidthCalculator;
	})();
	exports.AutoWidthCalculator = AutoWidthCalculator;


/***/ },
/* 51 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
	 * @version v4.0.3
	 * @link http://www.ag-grid.com/
	 * @license MIT
	 */
	var events_1 = __webpack_require__(10);
	var ColumnChangeEvent = (function () {
	    function ColumnChangeEvent(type) {
	        this.type = type;
	    }
	    ColumnChangeEvent.prototype.toString = function () {
	        var result = 'ColumnChangeEvent {type: ' + this.type;
	        if (this.column) {
	            result += ', column: ' + this.column.getColId();
	        }
	        if (this.columnGroup) {
	            result +=  true ? this.columnGroup.getColGroupDef().headerName : '(not defined]';
	        }
	        if (this.toIndex) {
	            result += ', toIndex: ' + this.toIndex;
	        }
	        if (this.visible) {
	            result += ', visible: ' + this.visible;
	        }
	        if (this.pinned) {
	            result += ', pinned: ' + this.pinned;
	        }
	        if (typeof this.finished == 'boolean') {
	            result += ', finished: ' + this.finished;
	        }
	        result += '}';
	        return result;
	    };
	    ColumnChangeEvent.prototype.withPinned = function (pinned) {
	        this.pinned = pinned;
	        return this;
	    };
	    ColumnChangeEvent.prototype.withVisible = function (visible) {
	        this.visible = visible;
	        return this;
	    };
	    ColumnChangeEvent.prototype.isVisible = function () {
	        return this.visible;
	    };
	    ColumnChangeEvent.prototype.getPinned = function () {
	        return this.pinned;
	    };
	    ColumnChangeEvent.prototype.withColumn = function (column) {
	        this.column = column;
	        return this;
	    };
	    ColumnChangeEvent.prototype.withColumns = function (columns) {
	        this.columns = columns;
	        return this;
	    };
	    ColumnChangeEvent.prototype.withFinished = function (finished) {
	        this.finished = finished;
	        return this;
	    };
	    ColumnChangeEvent.prototype.withColumnGroup = function (columnGroup) {
	        this.columnGroup = columnGroup;
	        return this;
	    };
	    ColumnChangeEvent.prototype.withToIndex = function (toIndex) {
	        this.toIndex = toIndex;
	        return this;
	    };
	    ColumnChangeEvent.prototype.getToIndex = function () {
	        return this.toIndex;
	    };
	    ColumnChangeEvent.prototype.getType = function () {
	        return this.type;
	    };
	    ColumnChangeEvent.prototype.getColumn = function () {
	        return this.column;
	    };
	    ColumnChangeEvent.prototype.getColumns = function () {
	        return this.columns;
	    };
	    ColumnChangeEvent.prototype.getColumnGroup = function () {
	        return this.columnGroup;
	    };
	    ColumnChangeEvent.prototype.isPinnedPanelVisibilityImpacted = function () {
	        return this.type === events_1.Events.EVENT_COLUMN_EVERYTHING_CHANGED ||
	            this.type === events_1.Events.EVENT_COLUMN_GROUP_OPENED ||
	            this.type === events_1.Events.EVENT_COLUMN_VISIBLE ||
	            this.type === events_1.Events.EVENT_COLUMN_PINNED;
	    };
	    ColumnChangeEvent.prototype.isContainerWidthImpacted = function () {
	        return this.type === events_1.Events.EVENT_COLUMN_EVERYTHING_CHANGED ||
	            this.type === events_1.Events.EVENT_COLUMN_GROUP_OPENED ||
	            this.type === events_1.Events.EVENT_COLUMN_VISIBLE ||
	            this.type === events_1.Events.EVENT_COLUMN_RESIZED ||
	            this.type === events_1.Events.EVENT_COLUMN_PINNED ||
	            this.type === events_1.Events.EVENT_COLUMN_ROW_GROUP_CHANGE;
	    };
	    ColumnChangeEvent.prototype.isIndividualColumnResized = function () {
	        return this.type === events_1.Events.EVENT_COLUMN_RESIZED && this.column !== undefined && this.column !== null;
	    };
	    ColumnChangeEvent.prototype.isFinished = function () {
	        return this.finished;
	    };
	    return ColumnChangeEvent;
	})();
	exports.ColumnChangeEvent = ColumnChangeEvent;


/***/ },
/* 52 */
/***/ function(module, exports) {

	/**
	 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
	 * @version v4.0.3
	 * @link http://www.ag-grid.com/
	 * @license MIT
	 */
	// class returns unique instance id's for columns.
	// eg, the following calls (in this order) will result in:
	//
	// getInstanceIdForKey('country') => 0
	// getInstanceIdForKey('country') => 1
	// getInstanceIdForKey('country') => 2
	// getInstanceIdForKey('country') => 3
	// getInstanceIdForKey('age') => 0
	// getInstanceIdForKey('age') => 1
	// getInstanceIdForKey('country') => 4
	var GroupInstanceIdCreator = (function () {
	    function GroupInstanceIdCreator() {
	        // this map contains keys to numbers, so we remember what the last call was
	        this.existingIds = {};
	    }
	    GroupInstanceIdCreator.prototype.getInstanceIdForKey = function (key) {
	        var lastResult = this.existingIds[key];
	        var result;
	        if (typeof lastResult !== 'number') {
	            // first time this key
	            result = 0;
	        }
	        else {
	            result = lastResult + 1;
	        }
	        this.existingIds[key] = result;
	        return result;
	    };
	    return GroupInstanceIdCreator;
	})();
	exports.GroupInstanceIdCreator = GroupInstanceIdCreator;


/***/ },
/* 53 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
	 * @version v4.0.3
	 * @link http://www.ag-grid.com/
	 * @license MIT
	 */
	var utils_1 = __webpack_require__(7);
	function defaultGroupComparator(valueA, valueB, nodeA, nodeB) {
	    var nodeAIsGroup = utils_1.Utils.exists(nodeA) && nodeA.group;
	    var nodeBIsGroup = utils_1.Utils.exists(nodeB) && nodeB.group;
	    var bothAreGroups = nodeAIsGroup && nodeBIsGroup;
	    var bothAreNormal = !nodeAIsGroup && !nodeBIsGroup;
	    if (bothAreGroups) {
	        return utils_1.Utils.defaultComparator(nodeA.key, nodeB.key);
	    }
	    else if (bothAreNormal) {
	        return utils_1.Utils.defaultComparator(valueA, valueB);
	    }
	    else if (nodeAIsGroup) {
	        return 1;
	    }
	    else {
	        return -1;
	    }
	}
	exports.defaultGroupComparator = defaultGroupComparator;


/***/ },
/* 54 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
	 * @version v4.0.3
	 * @link http://www.ag-grid.com/
	 * @license MIT
	 */
	var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
	    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
	    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
	    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
	    return c > 3 && r && Object.defineProperty(target, key, r), r;
	};
	var __metadata = (this && this.__metadata) || function (k, v) {
	    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
	};
	var gridOptionsWrapper_1 = __webpack_require__(3);
	var columnController_1 = __webpack_require__(13);
	var gridPanel_1 = __webpack_require__(24);
	var column_1 = __webpack_require__(15);
	var context_1 = __webpack_require__(6);
	var context_2 = __webpack_require__(6);
	var context_3 = __webpack_require__(6);
	var headerContainer_1 = __webpack_require__(55);
	var eventService_1 = __webpack_require__(4);
	var events_1 = __webpack_require__(10);
	var context_4 = __webpack_require__(6);
	var HeaderRenderer = (function () {
	    function HeaderRenderer() {
	    }
	    HeaderRenderer.prototype.init = function () {
	        this.eHeaderViewport = this.gridPanel.getHeaderViewport();
	        this.eRoot = this.gridPanel.getRoot();
	        this.eHeaderOverlay = this.gridPanel.getHeaderOverlay();
	        this.pinnedLeftContainer = new headerContainer_1.HeaderContainer(this.gridPanel.getPinnedLeftHeader(), null, this.eRoot, column_1.Column.PINNED_LEFT);
	        this.pinnedRightContainer = new headerContainer_1.HeaderContainer(this.gridPanel.getPinnedRightHeader(), null, this.eRoot, column_1.Column.PINNED_RIGHT);
	        this.centerContainer = new headerContainer_1.HeaderContainer(this.gridPanel.getHeaderContainer(), this.gridPanel.getHeaderViewport(), this.eRoot, null);
	        this.context.wireBean(this.pinnedLeftContainer);
	        this.context.wireBean(this.pinnedRightContainer);
	        this.context.wireBean(this.centerContainer);
	        // unlike the table data, the header more often 'refreshes everything' as a way to redraw, rather than
	        // do delta changes based on the event. this is because groups have bigger impacts, eg a column move
	        // can end up in a group splitting into two, or joining into one. this complexity makes the job much
	        // harder to do delta updates. instead we just shotgun - which is fine, as the header is relatively
	        // small compared to the body, so the cpu cost is low in comparison. it does mean we don't get any
	        // animations.
	        this.eventService.addEventListener(events_1.Events.EVENT_COLUMN_EVERYTHING_CHANGED, this.refreshHeader.bind(this));
	        this.eventService.addEventListener(events_1.Events.EVENT_COLUMN_ROW_GROUP_CHANGE, this.refreshHeader.bind(this));
	        this.eventService.addEventListener(events_1.Events.EVENT_COLUMN_MOVED, this.refreshHeader.bind(this));
	        this.eventService.addEventListener(events_1.Events.EVENT_COLUMN_VISIBLE, this.refreshHeader.bind(this));
	        this.eventService.addEventListener(events_1.Events.EVENT_COLUMN_GROUP_OPENED, this.refreshHeader.bind(this));
	        this.eventService.addEventListener(events_1.Events.EVENT_COLUMN_PINNED, this.refreshHeader.bind(this));
	        this.eventService.addEventListener(events_1.Events.EVENT_HEADER_HEIGHT_CHANGED, this.refreshHeader.bind(this));
	        // for resized, the individual cells take care of this, so don't need to refresh everything
	        this.eventService.addEventListener(events_1.Events.EVENT_COLUMN_RESIZED, this.setPinnedColContainerWidth.bind(this));
	        if (this.columnController.isReady()) {
	            this.refreshHeader();
	        }
	    };
	    // this is called from the API and refreshes everything, should be broken out
	    // into refresh everything vs just something changed
	    HeaderRenderer.prototype.refreshHeader = function () {
	        this.pinnedLeftContainer.removeAllChildren();
	        this.pinnedRightContainer.removeAllChildren();
	        this.centerContainer.removeAllChildren();
	        this.pinnedLeftContainer.insertHeaderRowsIntoContainer();
	        this.pinnedRightContainer.insertHeaderRowsIntoContainer();
	        this.centerContainer.insertHeaderRowsIntoContainer();
	        // if forPrint, overlay is missing
	        var rowHeight = this.gridOptionsWrapper.getHeaderHeight();
	        // we can probably get rid of this when we no longer need the overlay
	        var dept = this.columnController.getColumnDept();
	        if (this.eHeaderOverlay) {
	            this.eHeaderOverlay.style.height = rowHeight + 'px';
	            this.eHeaderOverlay.style.top = ((dept - 1) * rowHeight) + 'px';
	        }
	        this.setPinnedColContainerWidth();
	    };
	    HeaderRenderer.prototype.setPinnedColContainerWidth = function () {
	        if (this.gridOptionsWrapper.isForPrint()) {
	            // pinned col doesn't exist when doing forPrint
	            return;
	        }
	        var pinnedLeftWidth = this.columnController.getPinnedLeftContainerWidth() + 'px';
	        this.eHeaderViewport.style.marginLeft = pinnedLeftWidth;
	        var pinnedRightWidth = this.columnController.getPinnedRightContainerWidth() + 'px';
	        this.eHeaderViewport.style.marginRight = pinnedRightWidth;
	    };
	    HeaderRenderer.prototype.onIndividualColumnResized = function (column) {
	        this.pinnedLeftContainer.onIndividualColumnResized(column);
	        this.pinnedRightContainer.onIndividualColumnResized(column);
	        this.centerContainer.onIndividualColumnResized(column);
	    };
	    __decorate([
	        context_2.Autowired('gridOptionsWrapper'), 
	        __metadata('design:type', gridOptionsWrapper_1.GridOptionsWrapper)
	    ], HeaderRenderer.prototype, "gridOptionsWrapper", void 0);
	    __decorate([
	        context_2.Autowired('columnController'), 
	        __metadata('design:type', columnController_1.ColumnController)
	    ], HeaderRenderer.prototype, "columnController", void 0);
	    __decorate([
	        context_2.Autowired('gridPanel'), 
	        __metadata('design:type', gridPanel_1.GridPanel)
	    ], HeaderRenderer.prototype, "gridPanel", void 0);
	    __decorate([
	        context_2.Autowired('context'), 
	        __metadata('design:type', context_3.Context)
	    ], HeaderRenderer.prototype, "context", void 0);
	    __decorate([
	        context_2.Autowired('eventService'), 
	        __metadata('design:type', eventService_1.EventService)
	    ], HeaderRenderer.prototype, "eventService", void 0);
	    __decorate([
	        context_4.PostConstruct, 
	        __metadata('design:type', Function), 
	        __metadata('design:paramtypes', []), 
	        __metadata('design:returntype', void 0)
	    ], HeaderRenderer.prototype, "init", null);
	    HeaderRenderer = __decorate([
	        context_1.Bean('headerRenderer'), 
	        __metadata('design:paramtypes', [])
	    ], HeaderRenderer);
	    return HeaderRenderer;
	})();
	exports.HeaderRenderer = HeaderRenderer;


/***/ },
/* 55 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
	 * @version v4.0.3
	 * @link http://www.ag-grid.com/
	 * @license MIT
	 */
	var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
	    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
	    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
	    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
	    return c > 3 && r && Object.defineProperty(target, key, r), r;
	};
	var __metadata = (this && this.__metadata) || function (k, v) {
	    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
	};
	var utils_1 = __webpack_require__(7);
	var columnGroup_1 = __webpack_require__(14);
	var gridOptionsWrapper_1 = __webpack_require__(3);
	var context_1 = __webpack_require__(6);
	var column_1 = __webpack_require__(15);
	var context_2 = __webpack_require__(6);
	var renderedHeaderGroupCell_1 = __webpack_require__(56);
	var renderedHeaderCell_1 = __webpack_require__(59);
	var dragAndDropService_1 = __webpack_require__(61);
	var moveColumnController_1 = __webpack_require__(62);
	var columnController_1 = __webpack_require__(13);
	var gridPanel_1 = __webpack_require__(24);
	var context_3 = __webpack_require__(6);
	var HeaderContainer = (function () {
	    function HeaderContainer(eContainer, eViewport, eRoot, pinned) {
	        this.headerElements = [];
	        this.eContainer = eContainer;
	        this.eRoot = eRoot;
	        this.pinned = pinned;
	        this.eViewport = eViewport;
	    }
	    HeaderContainer.prototype.init = function () {
	        var moveColumnController = new moveColumnController_1.MoveColumnController(this.pinned);
	        this.context.wireBean(moveColumnController);
	        var secondaryContainers;
	        switch (this.pinned) {
	            case column_1.Column.PINNED_LEFT:
	                secondaryContainers = this.gridPanel.getDropTargetLeftContainers();
	                break;
	            case column_1.Column.PINNED_RIGHT:
	                secondaryContainers = this.gridPanel.getDropTargetPinnedRightContainers();
	                break;
	            default:
	                secondaryContainers = this.gridPanel.getDropTargetBodyContainers();
	                break;
	        }
	        var icon = this.pinned ? dragAndDropService_1.DragAndDropService.ICON_PINNED : dragAndDropService_1.DragAndDropService.ICON_MOVE;
	        this.dropTarget = {
	            eContainer: this.eViewport ? this.eViewport : this.eContainer,
	            iconName: icon,
	            eSecondaryContainers: secondaryContainers,
	            onDragging: moveColumnController.onDragging.bind(moveColumnController),
	            onDragEnter: moveColumnController.onDragEnter.bind(moveColumnController),
	            onDragLeave: moveColumnController.onDragLeave.bind(moveColumnController),
	            onDragStop: moveColumnController.onDragStop.bind(moveColumnController)
	        };
	        this.dragAndDropService.addDropTarget(this.dropTarget);
	    };
	    HeaderContainer.prototype.removeAllChildren = function () {
	        this.headerElements.forEach(function (headerElement) {
	            headerElement.destroy();
	        });
	        this.headerElements.length = 0;
	        utils_1.Utils.removeAllChildren(this.eContainer);
	    };
	    HeaderContainer.prototype.insertHeaderRowsIntoContainer = function () {
	        var _this = this;
	        var cellTree = this.columnController.getDisplayedColumnGroups(this.pinned);
	        // if we are displaying header groups, then we have many rows here.
	        // go through each row of the header, one by one.
	        var rowHeight = this.gridOptionsWrapper.getHeaderHeight();
	        for (var dept = 0;; dept++) {
	            var nodesAtDept = [];
	            this.addTreeNodesAtDept(cellTree, dept, nodesAtDept);
	            // we want to break the for loop when we get to an empty set of cells,
	            // that's how we know we have finished rendering the last row.
	            if (nodesAtDept.length === 0) {
	                break;
	            }
	            var eRow = document.createElement('div');
	            eRow.className = 'ag-header-row';
	            eRow.style.top = (dept * rowHeight) + 'px';
	            eRow.style.height = rowHeight + 'px';
	            nodesAtDept.forEach(function (child) {
	                // skip groups that have no displayed children. this can happen when the group is broken,
	                // and this section happens to have nothing to display for the open / closed state
	                if (child instanceof columnGroup_1.ColumnGroup && child.getDisplayedChildren().length == 0) {
	                    return;
	                }
	                var renderedHeaderElement = _this.createHeaderElement(child);
	                _this.headerElements.push(renderedHeaderElement);
	                var eGui = renderedHeaderElement.getGui();
	                eRow.appendChild(eGui);
	            });
	            this.eContainer.appendChild(eRow);
	        }
	    };
	    HeaderContainer.prototype.addTreeNodesAtDept = function (cellTree, dept, result) {
	        var _this = this;
	        cellTree.forEach(function (abstractColumn) {
	            if (dept === 0) {
	                result.push(abstractColumn);
	            }
	            else if (abstractColumn instanceof columnGroup_1.ColumnGroup) {
	                var columnGroup = abstractColumn;
	                _this.addTreeNodesAtDept(columnGroup.getDisplayedChildren(), dept - 1, result);
	            }
	            else {
	            }
	        });
	    };
	    HeaderContainer.prototype.createHeaderElement = function (columnGroupChild) {
	        var result;
	        if (columnGroupChild instanceof columnGroup_1.ColumnGroup) {
	            result = new renderedHeaderGroupCell_1.RenderedHeaderGroupCell(columnGroupChild, this.eRoot, this.$scope);
	        }
	        else {
	            result = new renderedHeaderCell_1.RenderedHeaderCell(columnGroupChild, this.$scope, this.eRoot, this.dropTarget);
	        }
	        this.context.wireBean(result);
	        return result;
	    };
	    HeaderContainer.prototype.onIndividualColumnResized = function (column) {
	        this.headerElements.forEach(function (headerElement) {
	            headerElement.onIndividualColumnResized(column);
	        });
	    };
	    __decorate([
	        context_1.Autowired('gridOptionsWrapper'), 
	        __metadata('design:type', gridOptionsWrapper_1.GridOptionsWrapper)
	    ], HeaderContainer.prototype, "gridOptionsWrapper", void 0);
	    __decorate([
	        context_1.Autowired('context'), 
	        __metadata('design:type', context_2.Context)
	    ], HeaderContainer.prototype, "context", void 0);
	    __decorate([
	        context_1.Autowired('$scope'), 
	        __metadata('design:type', Object)
	    ], HeaderContainer.prototype, "$scope", void 0);
	    __decorate([
	        context_1.Autowired('dragAndDropService'), 
	        __metadata('design:type', dragAndDropService_1.DragAndDropService)
	    ], HeaderContainer.prototype, "dragAndDropService", void 0);
	    __decorate([
	        context_1.Autowired('columnController'), 
	        __metadata('design:type', columnController_1.ColumnController)
	    ], HeaderContainer.prototype, "columnController", void 0);
	    __decorate([
	        context_1.Autowired('gridPanel'), 
	        __metadata('design:type', gridPanel_1.GridPanel)
	    ], HeaderContainer.prototype, "gridPanel", void 0);
	    __decorate([
	        context_3.PostConstruct, 
	        __metadata('design:type', Function), 
	        __metadata('design:paramtypes', []), 
	        __metadata('design:returntype', void 0)
	    ], HeaderContainer.prototype, "init", null);
	    return HeaderContainer;
	})();
	exports.HeaderContainer = HeaderContainer;


/***/ },
/* 56 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
	 * @version v4.0.3
	 * @link http://www.ag-grid.com/
	 * @license MIT
	 */
	var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
	    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
	    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
	    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
	    return c > 3 && r && Object.defineProperty(target, key, r), r;
	};
	var __metadata = (this && this.__metadata) || function (k, v) {
	    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
	};
	var utils_1 = __webpack_require__(7);
	var svgFactory_1 = __webpack_require__(36);
	var columnController_1 = __webpack_require__(13);
	var filterManager_1 = __webpack_require__(40);
	var gridOptionsWrapper_1 = __webpack_require__(3);
	var column_1 = __webpack_require__(15);
	var horizontalDragService_1 = __webpack_require__(57);
	var context_1 = __webpack_require__(6);
	var cssClassApplier_1 = __webpack_require__(58);
	var context_2 = __webpack_require__(6);
	var svgFactory = svgFactory_1.SvgFactory.getInstance();
	var RenderedHeaderGroupCell = (function () {
	    function RenderedHeaderGroupCell(columnGroup, eRoot, parentScope) {
	        this.destroyFunctions = [];
	        this.columnGroup = columnGroup;
	        this.parentScope = parentScope;
	        this.eRoot = eRoot;
	        this.parentScope = parentScope;
	    }
	    // required by interface, but we don't use
	    RenderedHeaderGroupCell.prototype.refreshFilterIcon = function () { };
	    // required by interface, but we don't use
	    RenderedHeaderGroupCell.prototype.refreshSortIcon = function () { };
	    RenderedHeaderGroupCell.prototype.getGui = function () {
	        return this.eHeaderGroupCell;
	    };
	    RenderedHeaderGroupCell.prototype.onIndividualColumnResized = function (column) {
	        if (this.columnGroup.isChildInThisGroupDeepSearch(column)) {
	            this.setWidthOfGroupHeaderCell();
	        }
	    };
	    RenderedHeaderGroupCell.prototype.init = function () {
	        var _this = this;
	        this.eHeaderGroupCell = document.createElement('div');
	        var classNames = ['ag-header-group-cell'];
	        // having different classes below allows the style to not have a bottom border
	        // on the group header, if no group is specified
	        if (this.columnGroup.getColGroupDef()) {
	            classNames.push('ag-header-group-cell-with-group');
	        }
	        else {
	            classNames.push('ag-header-group-cell-no-group');
	        }
	        this.eHeaderGroupCell.className = classNames.join(' ');
	        //this.eHeaderGroupCell.style.height = this.getGridOptionsWrapper().getHeaderHeight() + 'px';
	        cssClassApplier_1.CssClassApplier.addHeaderClassesFromCollDef(this.columnGroup.getColGroupDef(), this.eHeaderGroupCell, this.gridOptionsWrapper);
	        if (this.gridOptionsWrapper.isEnableColResize()) {
	            this.eHeaderCellResize = document.createElement("div");
	            this.eHeaderCellResize.className = "ag-header-cell-resize";
	            this.eHeaderGroupCell.appendChild(this.eHeaderCellResize);
	            this.dragService.addDragHandling({
	                eDraggableElement: this.eHeaderCellResize,
	                eBody: this.eRoot,
	                cursor: 'col-resize',
	                startAfterPixels: 0,
	                onDragStart: this.onDragStart.bind(this),
	                onDragging: this.onDragging.bind(this)
	            });
	            if (!this.gridOptionsWrapper.isSuppressAutoSize()) {
	                this.eHeaderCellResize.addEventListener('dblclick', function (event) {
	                    // get list of all the column keys we are responsible for
	                    var keys = [];
	                    _this.columnGroup.getDisplayedLeafColumns().forEach(function (column) {
	                        // not all cols in the group may be participating with auto-resize
	                        if (!column.getColDef().suppressAutoSize) {
	                            keys.push(column.getColId());
	                        }
	                    });
	                    if (keys.length > 0) {
	                        _this.columnController.autoSizeColumns(keys);
	                    }
	                });
	            }
	        }
	        // no renderer, default text render
	        var groupName = this.columnGroup.getHeaderName();
	        if (groupName && groupName !== '') {
	            var eGroupCellLabel = document.createElement("div");
	            eGroupCellLabel.className = 'ag-header-group-cell-label';
	            this.eHeaderGroupCell.appendChild(eGroupCellLabel);
	            if (utils_1.Utils.isBrowserSafari()) {
	                eGroupCellLabel.style.display = 'table-cell';
	            }
	            var eInnerText = document.createElement("span");
	            eInnerText.className = 'ag-header-group-text';
	            eInnerText.innerHTML = groupName;
	            eGroupCellLabel.appendChild(eInnerText);
	            if (this.columnGroup.isExpandable()) {
	                this.addGroupExpandIcon(eGroupCellLabel);
	            }
	        }
	        this.setWidthOfGroupHeaderCell();
	    };
	    RenderedHeaderGroupCell.prototype.setWidthOfGroupHeaderCell = function () {
	        var _this = this;
	        var widthChangedListener = function () {
	            _this.eHeaderGroupCell.style.width = _this.columnGroup.getActualWidth() + 'px';
	        };
	        this.columnGroup.getLeafColumns().forEach(function (column) {
	            column.addEventListener(column_1.Column.EVENT_WIDTH_CHANGED, widthChangedListener);
	            _this.destroyFunctions.push(function () {
	                column.removeEventListener(column_1.Column.EVENT_WIDTH_CHANGED, widthChangedListener);
	            });
	        });
	        widthChangedListener();
	    };
	    RenderedHeaderGroupCell.prototype.destroy = function () {
	        this.destroyFunctions.forEach(function (func) {
	            func();
	        });
	    };
	    RenderedHeaderGroupCell.prototype.addGroupExpandIcon = function (eGroupCellLabel) {
	        var eGroupIcon;
	        if (this.columnGroup.isExpanded()) {
	            eGroupIcon = utils_1.Utils.createIcon('columnGroupOpened', this.gridOptionsWrapper, null, svgFactory.createArrowLeftSvg);
	        }
	        else {
	            eGroupIcon = utils_1.Utils.createIcon('columnGroupClosed', this.gridOptionsWrapper, null, svgFactory.createArrowRightSvg);
	        }
	        eGroupIcon.className = 'ag-header-expand-icon';
	        eGroupCellLabel.appendChild(eGroupIcon);
	        var that = this;
	        eGroupIcon.onclick = function () {
	            var newExpandedValue = !that.columnGroup.isExpanded();
	            that.columnController.setColumnGroupOpened(that.columnGroup, newExpandedValue);
	        };
	    };
	    RenderedHeaderGroupCell.prototype.onDragStart = function () {
	        var _this = this;
	        this.groupWidthStart = this.columnGroup.getActualWidth();
	        this.childrenWidthStarts = [];
	        this.columnGroup.getDisplayedLeafColumns().forEach(function (column) {
	            _this.childrenWidthStarts.push(column.getActualWidth());
	        });
	    };
	    RenderedHeaderGroupCell.prototype.onDragging = function (dragChange, finished) {
	        var _this = this;
	        var newWidth = this.groupWidthStart + dragChange;
	        var minWidth = this.columnGroup.getMinWidth();
	        if (newWidth < minWidth) {
	            newWidth = minWidth;
	        }
	        // distribute the new width to the child headers
	        var changeRatio = newWidth / this.groupWidthStart;
	        // keep track of pixels used, and last column gets the remaining,
	        // to cater for rounding errors, and min width adjustments
	        var pixelsToDistribute = newWidth;
	        var displayedColumns = this.columnGroup.getDisplayedLeafColumns();
	        displayedColumns.forEach(function (column, index) {
	            var notLastCol = index !== (displayedColumns.length - 1);
	            var newChildSize;
	            if (notLastCol) {
	                // if not the last col, calculate the column width as normal
	                var startChildSize = _this.childrenWidthStarts[index];
	                newChildSize = startChildSize * changeRatio;
	                if (newChildSize < column.getMinWidth()) {
	                    newChildSize = column.getMinWidth();
	                }
	                pixelsToDistribute -= newChildSize;
	            }
	            else {
	                // if last col, give it the remaining pixels
	                newChildSize = pixelsToDistribute;
	            }
	            _this.columnController.setColumnWidth(column, newChildSize, finished);
	        });
	    };
	    __decorate([
	        context_1.Autowired('filterManager'), 
	        __metadata('design:type', filterManager_1.FilterManager)
	    ], RenderedHeaderGroupCell.prototype, "filterManager", void 0);
	    __decorate([
	        context_1.Autowired('gridOptionsWrapper'), 
	        __metadata('design:type', gridOptionsWrapper_1.GridOptionsWrapper)
	    ], RenderedHeaderGroupCell.prototype, "gridOptionsWrapper", void 0);
	    __decorate([
	        context_1.Autowired('$compile'), 
	        __metadata('design:type', Object)
	    ], RenderedHeaderGroupCell.prototype, "$compile", void 0);
	    __decorate([
	        context_1.Autowired('horizontalDragService'), 
	        __metadata('design:type', horizontalDragService_1.HorizontalDragService)
	    ], RenderedHeaderGroupCell.prototype, "dragService", void 0);
	    __decorate([
	        context_1.Autowired('columnController'), 
	        __metadata('design:type', columnController_1.ColumnController)
	    ], RenderedHeaderGroupCell.prototype, "columnController", void 0);
	    __decorate([
	        context_2.PostConstruct, 
	        __metadata('design:type', Function), 
	        __metadata('design:paramtypes', []), 
	        __metadata('design:returntype', void 0)
	    ], RenderedHeaderGroupCell.prototype, "init", null);
	    return RenderedHeaderGroupCell;
	})();
	exports.RenderedHeaderGroupCell = RenderedHeaderGroupCell;


/***/ },
/* 57 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
	 * @version v4.0.3
	 * @link http://www.ag-grid.com/
	 * @license MIT
	 */
	var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
	    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
	    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
	    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
	    return c > 3 && r && Object.defineProperty(target, key, r), r;
	};
	var __metadata = (this && this.__metadata) || function (k, v) {
	    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
	};
	var context_1 = __webpack_require__(6);
	var HorizontalDragService = (function () {
	    function HorizontalDragService() {
	    }
	    HorizontalDragService.prototype.addDragHandling = function (params) {
	        params.eDraggableElement.addEventListener('mousedown', function (startEvent) {
	            new DragInstance(params, startEvent);
	        });
	    };
	    HorizontalDragService = __decorate([
	        context_1.Bean('horizontalDragService'), 
	        __metadata('design:paramtypes', [])
	    ], HorizontalDragService);
	    return HorizontalDragService;
	})();
	exports.HorizontalDragService = HorizontalDragService;
	var DragInstance = (function () {
	    function DragInstance(params, startEvent) {
	        this.mouseMove = this.onMouseMove.bind(this);
	        this.mouseUp = this.onMouseUp.bind(this);
	        this.mouseLeave = this.onMouseLeave.bind(this);
	        this.lastDelta = 0;
	        this.params = params;
	        this.eDragParent = document.querySelector('body');
	        this.dragStartX = startEvent.clientX;
	        this.startEvent = startEvent;
	        this.eDragParent.addEventListener('mousemove', this.mouseMove);
	        this.eDragParent.addEventListener('mouseup', this.mouseUp);
	        this.eDragParent.addEventListener('mouseleave', this.mouseLeave);
	        this.draggingStarted = false;
	        var startAfterPixelsExist = typeof params.startAfterPixels === 'number' && params.startAfterPixels > 0;
	        if (!startAfterPixelsExist) {
	            this.startDragging();
	        }
	    }
	    DragInstance.prototype.startDragging = function () {
	        this.draggingStarted = true;
	        this.oldBodyCursor = this.params.eBody.style.cursor;
	        this.oldParentCursor = this.eDragParent.style.cursor;
	        this.oldMsUserSelect = this.eDragParent.style.msUserSelect;
	        this.oldWebkitUserSelect = this.eDragParent.style.webkitUserSelect;
	        // change the body cursor, so when drag moves out of the drag bar, the cursor is still 'resize' (or 'move'
	        this.params.eBody.style.cursor = this.params.cursor;
	        // same for outside the grid, we want to keep the resize (or move) cursor
	        this.eDragParent.style.cursor = this.params.cursor;
	        // we don't want text selection outside the grid (otherwise it looks weird as text highlights when we move)
	        this.eDragParent.style.msUserSelect = 'none';
	        this.eDragParent.style.webkitUserSelect = 'none';
	        this.params.onDragStart(this.startEvent);
	    };
	    DragInstance.prototype.onMouseMove = function (moveEvent) {
	        var newX = moveEvent.clientX;
	        this.lastDelta = newX - this.dragStartX;
	        if (!this.draggingStarted) {
	            var dragExceededStartAfterPixels = Math.abs(this.lastDelta) >= this.params.startAfterPixels;
	            if (dragExceededStartAfterPixels) {
	                this.startDragging();
	            }
	        }
	        if (this.draggingStarted) {
	            this.params.onDragging(this.lastDelta, false);
	        }
	    };
	    DragInstance.prototype.onMouseUp = function () {
	        this.stopDragging();
	    };
	    DragInstance.prototype.onMouseLeave = function () {
	        this.stopDragging();
	    };
	    DragInstance.prototype.stopDragging = function () {
	        // reset cursor back to original cursor, if they were changed in the first place
	        if (this.draggingStarted) {
	            this.params.eBody.style.cursor = this.oldBodyCursor;
	            this.eDragParent.style.cursor = this.oldParentCursor;
	            this.eDragParent.style.msUserSelect = this.oldMsUserSelect;
	            this.eDragParent.style.webkitUserSelect = this.oldWebkitUserSelect;
	            this.params.onDragging(this.lastDelta, true);
	        }
	        // always remove the listeners, as these are always added
	        this.eDragParent.removeEventListener('mousemove', this.mouseMove);
	        this.eDragParent.removeEventListener('mouseup', this.mouseUp);
	        this.eDragParent.removeEventListener('mouseleave', this.mouseLeave);
	    };
	    return DragInstance;
	})();


/***/ },
/* 58 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
	 * @version v4.0.3
	 * @link http://www.ag-grid.com/
	 * @license MIT
	 */
	var utils_1 = __webpack_require__(7);
	var CssClassApplier = (function () {
	    function CssClassApplier() {
	    }
	    CssClassApplier.addHeaderClassesFromCollDef = function (abstractColDef, eHeaderCell, gridOptionsWrapper) {
	        if (abstractColDef && abstractColDef.headerClass) {
	            var classToUse;
	            if (typeof abstractColDef.headerClass === 'function') {
	                var params = {
	                    // bad naming, as colDef here can be a group or a column,
	                    // however most people won't appreciate the difference,
	                    // so keeping it as colDef to avoid confusion.
	                    colDef: abstractColDef,
	                    context: gridOptionsWrapper.getContext(),
	                    api: gridOptionsWrapper.getApi()
	                };
	                var headerClassFunc = abstractColDef.headerClass;
	                classToUse = headerClassFunc(params);
	            }
	            else {
	                classToUse = abstractColDef.headerClass;
	            }
	            if (typeof classToUse === 'string') {
	                utils_1.Utils.addCssClass(eHeaderCell, classToUse);
	            }
	            else if (Array.isArray(classToUse)) {
	                classToUse.forEach(function (cssClassItem) {
	                    utils_1.Utils.addCssClass(eHeaderCell, cssClassItem);
	                });
	            }
	        }
	    };
	    return CssClassApplier;
	})();
	exports.CssClassApplier = CssClassApplier;


/***/ },
/* 59 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
	 * @version v4.0.3
	 * @link http://www.ag-grid.com/
	 * @license MIT
	 */
	var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
	    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
	    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
	    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
	    return c > 3 && r && Object.defineProperty(target, key, r), r;
	};
	var __metadata = (this && this.__metadata) || function (k, v) {
	    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
	};
	var utils_1 = __webpack_require__(7);
	var column_1 = __webpack_require__(15);
	var filterManager_1 = __webpack_require__(40);
	var columnController_1 = __webpack_require__(13);
	var headerTemplateLoader_1 = __webpack_require__(60);
	var gridOptionsWrapper_1 = __webpack_require__(3);
	var horizontalDragService_1 = __webpack_require__(57);
	var gridCore_1 = __webpack_require__(37);
	var context_1 = __webpack_require__(6);
	var context_2 = __webpack_require__(6);
	var cssClassApplier_1 = __webpack_require__(58);
	var dragAndDropService_1 = __webpack_require__(61);
	var sortController_1 = __webpack_require__(39);
	var context_3 = __webpack_require__(6);
	var RenderedHeaderCell = (function () {
	    function RenderedHeaderCell(column, parentScope, eRoot, dragSourceDropTarget) {
	        // for better structured code, anything we need to do when this column gets destroyed,
	        // we put a function in here. otherwise we would have a big destroy function with lots
	        // of 'if / else' mapping to things that got created.
	        this.destroyFunctions = [];
	        this.column = column;
	        this.parentScope = parentScope;
	        this.eRoot = eRoot;
	        this.dragSourceDropTarget = dragSourceDropTarget;
	    }
	    RenderedHeaderCell.prototype.init = function () {
	        this.eHeaderCell = this.headerTemplateLoader.createHeaderElement(this.column);
	        utils_1.Utils.addCssClass(this.eHeaderCell, 'ag-header-cell');
	        this.createScope(this.parentScope);
	        this.addAttributes();
	        cssClassApplier_1.CssClassApplier.addHeaderClassesFromCollDef(this.column.getColDef(), this.eHeaderCell, this.gridOptionsWrapper);
	        // label div
	        var eHeaderCellLabel = this.eHeaderCell.querySelector('#agHeaderCellLabel');
	        this.setupMovingCss();
	        this.setupTooltip();
	        this.setupResize();
	        this.setupMove(eHeaderCellLabel);
	        this.setupMenu();
	        this.setupSort(eHeaderCellLabel);
	        this.setupFilterIcon();
	        this.setupText();
	        this.setupWidth();
	    };
	    RenderedHeaderCell.prototype.setupTooltip = function () {
	        var colDef = this.column.getColDef();
	        // add tooltip if exists
	        if (colDef.headerTooltip) {
	            this.eHeaderCell.title = colDef.headerTooltip;
	        }
	    };
	    RenderedHeaderCell.prototype.setupText = function () {
	        var colDef = this.column.getColDef();
	        // render the cell, use a renderer if one is provided
	        var headerCellRenderer;
	        if (colDef.headerCellRenderer) {
	            headerCellRenderer = colDef.headerCellRenderer;
	        }
	        else if (this.gridOptionsWrapper.getHeaderCellRenderer()) {
	            headerCellRenderer = this.gridOptionsWrapper.getHeaderCellRenderer();
	        }
	        var headerNameValue = this.columnController.getDisplayNameForCol(this.column);
	        var eText = this.eHeaderCell.querySelector('#agText');
	        if (eText) {
	            if (headerCellRenderer) {
	                this.useRenderer(headerNameValue, headerCellRenderer, eText);
	            }
	            else {
	                // no renderer, default text render
	                eText.className = 'ag-header-cell-text';
	                eText.innerHTML = headerNameValue;
	            }
	        }
	    };
	    RenderedHeaderCell.prototype.setupFilterIcon = function () {
	        var _this = this;
	        var eFilterIcon = this.eHeaderCell.querySelector('#agFilter');
	        if (!eFilterIcon) {
	            return;
	        }
	        var filterChangedListener = function () {
	            var filterPresent = _this.column.isFilterActive();
	            utils_1.Utils.addOrRemoveCssClass(_this.eHeaderCell, 'ag-header-cell-filtered', filterPresent);
	            utils_1.Utils.addOrRemoveCssClass(eFilterIcon, 'ag-hidden', !filterPresent);
	        };
	        this.column.addEventListener(column_1.Column.EVENT_FILTER_ACTIVE_CHANGED, filterChangedListener);
	        this.destroyFunctions.push(function () {
	            _this.column.removeEventListener(column_1.Column.EVENT_FILTER_ACTIVE_CHANGED, filterChangedListener);
	        });
	        filterChangedListener();
	    };
	    RenderedHeaderCell.prototype.setupWidth = function () {
	        var _this = this;
	        var widthChangedListener = function () {
	            _this.eHeaderCell.style.width = _this.column.getActualWidth() + 'px';
	        };
	        this.column.addEventListener(column_1.Column.EVENT_WIDTH_CHANGED, widthChangedListener);
	        this.destroyFunctions.push(function () {
	            _this.column.removeEventListener(column_1.Column.EVENT_WIDTH_CHANGED, widthChangedListener);
	        });
	        widthChangedListener();
	    };
	    RenderedHeaderCell.prototype.getGui = function () {
	        return this.eHeaderCell;
	    };
	    RenderedHeaderCell.prototype.destroy = function () {
	        this.destroyFunctions.forEach(function (func) {
	            func();
	        });
	    };
	    RenderedHeaderCell.prototype.createScope = function (parentScope) {
	        var _this = this;
	        if (this.gridOptionsWrapper.isAngularCompileHeaders()) {
	            this.childScope = parentScope.$new();
	            this.childScope.colDef = this.column.getColDef();
	            this.childScope.colDefWrapper = this.column;
	            this.destroyFunctions.push(function () {
	                _this.childScope.$destroy();
	            });
	        }
	    };
	    RenderedHeaderCell.prototype.addAttributes = function () {
	        this.eHeaderCell.setAttribute("colId", this.column.getColId());
	    };
	    RenderedHeaderCell.prototype.setupMenu = function () {
	        var eMenu = this.eHeaderCell.querySelector('#agMenu');
	        // if no menu provided in template, do nothing
	        if (!eMenu) {
	            return;
	        }
	        var weWantMenu = this.menuFactory.isMenuEnabled(this.column) && !this.column.getColDef().suppressMenu;
	        if (!weWantMenu) {
	            utils_1.Utils.removeFromParent(eMenu);
	            return;
	        }
	        var that = this;
	        eMenu.addEventListener('click', function () {
	            that.showMenu(this);
	        });
	        if (!this.gridOptionsWrapper.isSuppressMenuHide()) {
	            eMenu.style.opacity = '0';
	            this.eHeaderCell.addEventListener('mouseover', function () {
	                eMenu.style.opacity = '1';
	            });
	            this.eHeaderCell.addEventListener('mouseout', function () {
	                eMenu.style.opacity = '0';
	            });
	        }
	        var style = eMenu.style;
	        style['transition'] = 'opacity 0.2s, border 0.2s';
	        style['-webkit-transition'] = 'opacity 0.2s, border 0.2s';
	    };
	    RenderedHeaderCell.prototype.showMenu = function (eventSource) {
	        this.menuFactory.showMenu(this.column, eventSource);
	    };
	    RenderedHeaderCell.prototype.setupMovingCss = function () {
	        var _this = this;
	        // this function adds or removes the moving css, based on if the col is moving
	        var addMovingCssFunc = function () {
	            if (_this.column.isMoving()) {
	                utils_1.Utils.addCssClass(_this.eHeaderCell, 'ag-header-cell-moving');
	            }
	            else {
	                utils_1.Utils.removeCssClass(_this.eHeaderCell, 'ag-header-cell-moving');
	            }
	        };
	        // call it now once, so the col is set up correctly
	        addMovingCssFunc();
	        // then call it every time we are informed of a moving state change in the col
	        this.column.addEventListener(column_1.Column.EVENT_MOVING_CHANGED, addMovingCssFunc);
	        // finally we remove the listener when this cell is no longer rendered
	        this.destroyFunctions.push(function () {
	            _this.column.removeEventListener(column_1.Column.EVENT_MOVING_CHANGED, addMovingCssFunc);
	        });
	    };
	    RenderedHeaderCell.prototype.setupMove = function (eHeaderCellLabel) {
	        if (this.gridOptionsWrapper.isSuppressMovableColumns() || this.column.getColDef().suppressMovable) {
	            return;
	        }
	        if (this.gridOptionsWrapper.isForPrint()) {
	            // don't allow moving of headers when forPrint, as the header overlay doesn't exist
	            return;
	        }
	        if (eHeaderCellLabel) {
	            var dragSource = {
	                eElement: eHeaderCellLabel,
	                dragItem: this.column,
	                dragSourceDropTarget: this.dragSourceDropTarget
	            };
	            this.dragAndDropService.addDragSource(dragSource);
	        }
	    };
	    RenderedHeaderCell.prototype.setupResize = function () {
	        var _this = this;
	        var colDef = this.column.getColDef();
	        var eResize = this.eHeaderCell.querySelector('#agResizeBar');
	        // if no eResize in template, do nothing
	        if (!eResize) {
	            return;
	        }
	        var weWantResize = this.gridOptionsWrapper.isEnableColResize() && !colDef.suppressResize;
	        if (!weWantResize) {
	            utils_1.Utils.removeFromParent(eResize);
	            return;
	        }
	        this.dragService.addDragHandling({
	            eDraggableElement: eResize,
	            eBody: this.eRoot,
	            cursor: 'col-resize',
	            startAfterPixels: 0,
	            onDragStart: this.onDragStart.bind(this),
	            onDragging: this.onDragging.bind(this)
	        });
	        var weWantAutoSize = !this.gridOptionsWrapper.isSuppressAutoSize() && !colDef.suppressAutoSize;
	        if (weWantAutoSize) {
	            eResize.addEventListener('dblclick', function () {
	                _this.columnController.autoSizeColumn(_this.column);
	            });
	        }
	    };
	    RenderedHeaderCell.prototype.useRenderer = function (headerNameValue, headerCellRenderer, eText) {
	        // renderer provided, use it
	        var cellRendererParams = {
	            colDef: this.column.getColDef(),
	            $scope: this.childScope,
	            context: this.gridOptionsWrapper.getContext(),
	            value: headerNameValue,
	            api: this.gridOptionsWrapper.getApi(),
	            eHeaderCell: this.eHeaderCell
	        };
	        var cellRendererResult = headerCellRenderer(cellRendererParams);
	        var childToAppend;
	        if (utils_1.Utils.isNodeOrElement(cellRendererResult)) {
	            // a dom node or element was returned, so add child
	            childToAppend = cellRendererResult;
	        }
	        else {
	            // otherwise assume it was html, so just insert
	            var eTextSpan = document.createElement("span");
	            eTextSpan.innerHTML = cellRendererResult;
	            childToAppend = eTextSpan;
	        }
	        // angular compile header if option is turned on
	        if (this.gridOptionsWrapper.isAngularCompileHeaders()) {
	            var childToAppendCompiled = this.$compile(childToAppend)(this.childScope)[0];
	            eText.appendChild(childToAppendCompiled);
	        }
	        else {
	            eText.appendChild(childToAppend);
	        }
	    };
	    RenderedHeaderCell.prototype.setupSort = function (eHeaderCellLabel) {
	        var _this = this;
	        var enableSorting = this.gridOptionsWrapper.isEnableSorting() && !this.column.getColDef().suppressSorting;
	        if (!enableSorting) {
	            utils_1.Utils.removeFromParent(this.eHeaderCell.querySelector('#agSortAsc'));
	            utils_1.Utils.removeFromParent(this.eHeaderCell.querySelector('#agSortDesc'));
	            utils_1.Utils.removeFromParent(this.eHeaderCell.querySelector('#agNoSort'));
	            return;
	        }
	        // add the event on the header, so when clicked, we do sorting
	        if (eHeaderCellLabel) {
	            eHeaderCellLabel.addEventListener("click", function (event) {
	                _this.sortController.progressSort(_this.column, event.shiftKey);
	            });
	        }
	        // add listener for sort changing, and update the icons accordingly
	        var eSortAsc = this.eHeaderCell.querySelector('#agSortAsc');
	        var eSortDesc = this.eHeaderCell.querySelector('#agSortDesc');
	        var eSortNone = this.eHeaderCell.querySelector('#agNoSort');
	        var sortChangedListener = function () {
	            utils_1.Utils.addOrRemoveCssClass(_this.eHeaderCell, 'ag-header-cell-sorted-asc', _this.column.isSortAscending());
	            utils_1.Utils.addOrRemoveCssClass(_this.eHeaderCell, 'ag-header-cell-sorted-desc', _this.column.isSortDescending());
	            utils_1.Utils.addOrRemoveCssClass(_this.eHeaderCell, 'ag-header-cell-sorted-none', _this.column.isSortNone());
	            if (eSortAsc) {
	                utils_1.Utils.addOrRemoveCssClass(eSortAsc, 'ag-hidden', !_this.column.isSortAscending());
	            }
	            if (eSortDesc) {
	                utils_1.Utils.addOrRemoveCssClass(eSortDesc, 'ag-hidden', !_this.column.isSortDescending());
	            }
	            if (eSortNone) {
	                var alwaysHideNoSort = !_this.column.getColDef().unSortIcon && !_this.gridOptionsWrapper.isUnSortIcon();
	                utils_1.Utils.addOrRemoveCssClass(eSortNone, 'ag-hidden', alwaysHideNoSort || !_this.column.isSortNone());
	            }
	        };
	        this.column.addEventListener(column_1.Column.EVENT_SORT_CHANGED, sortChangedListener);
	        this.destroyFunctions.push(function () {
	            _this.column.removeEventListener(column_1.Column.EVENT_SORT_CHANGED, sortChangedListener);
	        });
	        sortChangedListener();
	    };
	    RenderedHeaderCell.prototype.onDragStart = function () {
	        this.startWidth = this.column.getActualWidth();
	    };
	    RenderedHeaderCell.prototype.onDragging = function (dragChange, finished) {
	        var newWidth = this.startWidth + dragChange;
	        this.columnController.setColumnWidth(this.column, newWidth, finished);
	    };
	    RenderedHeaderCell.prototype.onIndividualColumnResized = function (column) {
	        if (this.column !== column) {
	            return;
	        }
	        var newWidthPx = column.getActualWidth() + "px";
	        this.eHeaderCell.style.width = newWidthPx;
	    };
	    __decorate([
	        context_1.Autowired('context'), 
	        __metadata('design:type', context_2.Context)
	    ], RenderedHeaderCell.prototype, "context", void 0);
	    __decorate([
	        context_1.Autowired('filterManager'), 
	        __metadata('design:type', filterManager_1.FilterManager)
	    ], RenderedHeaderCell.prototype, "filterManager", void 0);
	    __decorate([
	        context_1.Autowired('columnController'), 
	        __metadata('design:type', columnController_1.ColumnController)
	    ], RenderedHeaderCell.prototype, "columnController", void 0);
	    __decorate([
	        context_1.Autowired('$compile'), 
	        __metadata('design:type', Object)
	    ], RenderedHeaderCell.prototype, "$compile", void 0);
	    __decorate([
	        context_1.Autowired('gridCore'), 
	        __metadata('design:type', gridCore_1.GridCore)
	    ], RenderedHeaderCell.prototype, "gridCore", void 0);
	    __decorate([
	        context_1.Autowired('headerTemplateLoader'), 
	        __metadata('design:type', headerTemplateLoader_1.HeaderTemplateLoader)
	    ], RenderedHeaderCell.prototype, "headerTemplateLoader", void 0);
	    __decorate([
	        context_1.Autowired('horizontalDragService'), 
	        __metadata('design:type', horizontalDragService_1.HorizontalDragService)
	    ], RenderedHeaderCell.prototype, "dragService", void 0);
	    __decorate([
	        context_1.Autowired('menuFactory'), 
	        __metadata('design:type', Object)
	    ], RenderedHeaderCell.prototype, "menuFactory", void 0);
	    __decorate([
	        context_1.Autowired('gridOptionsWrapper'), 
	        __metadata('design:type', gridOptionsWrapper_1.GridOptionsWrapper)
	    ], RenderedHeaderCell.prototype, "gridOptionsWrapper", void 0);
	    __decorate([
	        context_1.Autowired('dragAndDropService'), 
	        __metadata('design:type', dragAndDropService_1.DragAndDropService)
	    ], RenderedHeaderCell.prototype, "dragAndDropService", void 0);
	    __decorate([
	        context_1.Autowired('sortController'), 
	        __metadata('design:type', sortController_1.SortController)
	    ], RenderedHeaderCell.prototype, "sortController", void 0);
	    __decorate([
	        context_3.PostConstruct, 
	        __metadata('design:type', Function), 
	        __metadata('design:paramtypes', []), 
	        __metadata('design:returntype', void 0)
	    ], RenderedHeaderCell.prototype, "init", null);
	    return RenderedHeaderCell;
	})();
	exports.RenderedHeaderCell = RenderedHeaderCell;


/***/ },
/* 60 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
	 * @version v4.0.3
	 * @link http://www.ag-grid.com/
	 * @license MIT
	 */
	var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
	    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
	    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
	    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
	    return c > 3 && r && Object.defineProperty(target, key, r), r;
	};
	var __metadata = (this && this.__metadata) || function (k, v) {
	    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
	};
	var utils_1 = __webpack_require__(7);
	var svgFactory_1 = __webpack_require__(36);
	var gridOptionsWrapper_1 = __webpack_require__(3);
	var context_1 = __webpack_require__(6);
	var context_2 = __webpack_require__(6);
	var svgFactory = svgFactory_1.SvgFactory.getInstance();
	var HeaderTemplateLoader = (function () {
	    function HeaderTemplateLoader() {
	    }
	    HeaderTemplateLoader.prototype.createHeaderElement = function (column) {
	        var params = {
	            column: column,
	            colDef: column.getColDef,
	            context: this.gridOptionsWrapper.getContext(),
	            api: this.gridOptionsWrapper.getApi()
	        };
	        // option 1 - see if user provided a template in colDef
	        var userProvidedTemplate = column.getColDef().headerCellTemplate;
	        if (typeof userProvidedTemplate === 'function') {
	            var colDefFunc = userProvidedTemplate;
	            userProvidedTemplate = colDefFunc(params);
	        }
	        // option 2 - check the gridOptions for cellTemplate
	        if (!userProvidedTemplate && this.gridOptionsWrapper.getHeaderCellTemplate()) {
	            userProvidedTemplate = this.gridOptionsWrapper.getHeaderCellTemplate();
	        }
	        // option 3 - check the gridOptions for templateFunction
	        if (!userProvidedTemplate && this.gridOptionsWrapper.getHeaderCellTemplateFunc()) {
	            var gridOptionsFunc = this.gridOptionsWrapper.getHeaderCellTemplateFunc();
	            userProvidedTemplate = gridOptionsFunc(params);
	        }
	        // finally, if still no template, use the default
	        if (!userProvidedTemplate) {
	            userProvidedTemplate = this.createDefaultHeaderElement(column);
	        }
	        // template can be a string or a dom element, if string we need to convert to a dom element
	        var result;
	        if (typeof userProvidedTemplate === 'string') {
	            result = utils_1.Utils.loadTemplate(userProvidedTemplate);
	        }
	        else if (utils_1.Utils.isNodeOrElement(userProvidedTemplate)) {
	            result = userProvidedTemplate;
	        }
	        else {
	            console.error('ag-Grid: header template must be a string or an HTML element');
	        }
	        return result;
	    };
	    HeaderTemplateLoader.prototype.createDefaultHeaderElement = function (column) {
	        var eTemplate = utils_1.Utils.loadTemplate(HeaderTemplateLoader.HEADER_CELL_TEMPLATE);
	        this.addInIcon(eTemplate, 'sortAscending', '#agSortAsc', column, svgFactory.createArrowUpSvg);
	        this.addInIcon(eTemplate, 'sortDescending', '#agSortDesc', column, svgFactory.createArrowDownSvg);
	        this.addInIcon(eTemplate, 'sortUnSort', '#agNoSort', column, svgFactory.createArrowUpDownSvg);
	        this.addInIcon(eTemplate, 'menu', '#agMenu', column, svgFactory.createMenuSvg);
	        this.addInIcon(eTemplate, 'filter', '#agFilter', column, svgFactory.createFilterSvg);
	        return eTemplate;
	    };
	    HeaderTemplateLoader.prototype.addInIcon = function (eTemplate, iconName, cssSelector, column, defaultIconFactory) {
	        var eIcon = utils_1.Utils.createIconNoSpan(iconName, this.gridOptionsWrapper, column, defaultIconFactory);
	        eTemplate.querySelector(cssSelector).appendChild(eIcon);
	    };
	    // used when cell is dragged
	    HeaderTemplateLoader.HEADER_CELL_DND_TEMPLATE = '<div class="ag-header-cell ag-header-cell-ghost">' +
	        '  <span id="eGhostIcon" class="ag-header-cell-ghost-icon ag-shake-left-to-right"></span>' +
	        '  <div id="agHeaderCellLabel" class="ag-header-cell-label">' +
	        '    <span id="agText" class="ag-header-cell-text"></span>' +
	        '  </div>' +
	        '</div>';
	    HeaderTemplateLoader.HEADER_CELL_TEMPLATE = '<div class="ag-header-cell">' +
	        '  <div id="agResizeBar" class="ag-header-cell-resize"></div>' +
	        '  <span id="agMenu" class="ag-header-icon ag-header-cell-menu-button"></span>' +
	        '  <div id="agHeaderCellLabel" class="ag-header-cell-label">' +
	        '    <span id="agSortAsc" class="ag-header-icon ag-sort-ascending-icon"></span>' +
	        '    <span id="agSortDesc" class="ag-header-icon ag-sort-descending-icon"></span>' +
	        '    <span id="agNoSort" class="ag-header-icon ag-sort-none-icon"></span>' +
	        '    <span id="agFilter" class="ag-header-icon ag-filter-icon"></span>' +
	        '    <span id="agText" class="ag-header-cell-text"></span>' +
	        '  </div>' +
	        '</div>';
	    __decorate([
	        context_2.Autowired('gridOptionsWrapper'), 
	        __metadata('design:type', gridOptionsWrapper_1.GridOptionsWrapper)
	    ], HeaderTemplateLoader.prototype, "gridOptionsWrapper", void 0);
	    HeaderTemplateLoader = __decorate([
	        context_1.Bean('headerTemplateLoader'), 
	        __metadata('design:paramtypes', [])
	    ], HeaderTemplateLoader);
	    return HeaderTemplateLoader;
	})();
	exports.HeaderTemplateLoader = HeaderTemplateLoader;


/***/ },
/* 61 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
	 * @version v4.0.3
	 * @link http://www.ag-grid.com/
	 * @license MIT
	 */
	var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
	    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
	    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
	    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
	    return c > 3 && r && Object.defineProperty(target, key, r), r;
	};
	var __metadata = (this && this.__metadata) || function (k, v) {
	    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
	};
	var __param = (this && this.__param) || function (paramIndex, decorator) {
	    return function (target, key) { decorator(target, key, paramIndex); }
	};
	var context_1 = __webpack_require__(6);
	var logger_1 = __webpack_require__(5);
	var context_2 = __webpack_require__(6);
	var headerTemplateLoader_1 = __webpack_require__(60);
	var utils_1 = __webpack_require__(7);
	var gridOptionsWrapper_1 = __webpack_require__(3);
	var context_3 = __webpack_require__(6);
	var svgFactory_1 = __webpack_require__(36);
	var dragService_1 = __webpack_require__(28);
	var svgFactory = svgFactory_1.SvgFactory.getInstance();
	var DragAndDropService = (function () {
	    function DragAndDropService() {
	        this.dropTargets = [];
	        this.ePinnedIcon = svgFactory.createPinIcon();
	        this.ePlusIcon = svgFactory.createPlusIcon();
	        this.eHiddenIcon = svgFactory.createColumnHiddenIcon();
	        this.eMoveIcon = svgFactory.createMoveIcon();
	        this.eLeftIcon = svgFactory.createLeftIcon();
	        this.eRightIcon = svgFactory.createRightIcon();
	        this.eGroupIcon = svgFactory.createGroupIcon();
	    }
	    DragAndDropService.prototype.agWire = function (loggerFactory) {
	        this.logger = loggerFactory.create('OldToolPanelDragAndDropService');
	        this.eBody = document.querySelector('body');
	        if (!this.eBody) {
	            console.warn('ag-Grid: could not find document body, it is needed for dragging columns');
	        }
	    };
	    // we do not need to clean up drag sources, as we are just adding a listener to the element.
	    // when the element is disposed, the drag source is also disposed, even though this service
	    // remains. this is a bit different to normal 'addListener' methods
	    DragAndDropService.prototype.addDragSource = function (params) {
	        this.dragService.addDragSource({
	            eElement: params.eElement,
	            onDragStart: this.onDragStart.bind(this, params),
	            onDragStop: this.onDragStop.bind(this),
	            onDragging: this.onDragging.bind(this)
	        });
	        //params.eElement.addEventListener('mousedown', this.onMouseDown.bind(this, params));
	    };
	    DragAndDropService.prototype.nudge = function () {
	        if (this.dragging) {
	            this.onDragging(this.eventLastTime);
	        }
	    };
	    DragAndDropService.prototype.onDragStart = function (dragSource, mouseEvent) {
	        this.logger.log('startDrag');
	        this.dragging = true;
	        this.dragSource = dragSource;
	        this.eventLastTime = mouseEvent;
	        this.dragSource.dragItem.setMoving(true);
	        this.dragItem = this.dragSource.dragItem;
	        this.lastDropTarget = this.dragSource.dragSourceDropTarget;
	        this.createGhost();
	    };
	    DragAndDropService.prototype.onDragStop = function (mouseEvent) {
	        this.logger.log('onDragStop');
	        this.eventLastTime = null;
	        this.dragging = false;
	        this.dragItem.setMoving(false);
	        if (this.lastDropTarget && this.lastDropTarget.onDragStop) {
	            var draggingEvent = this.createDropTargetEvent(this.lastDropTarget, mouseEvent, null);
	            this.lastDropTarget.onDragStop(draggingEvent);
	        }
	        this.lastDropTarget = null;
	        this.dragItem = null;
	        this.removeGhost();
	    };
	    DragAndDropService.prototype.onDragging = function (mouseEvent) {
	        var direction = this.workOutDirection(mouseEvent);
	        this.eventLastTime = mouseEvent;
	        this.positionGhost(mouseEvent);
	        // check if mouseEvent intersects with any of the drop targets
	        var dropTarget = utils_1.Utils.find(this.dropTargets, function (dropTarget) {
	            var targetsToCheck = [dropTarget.eContainer];
	            if (dropTarget.eSecondaryContainers) {
	                targetsToCheck = targetsToCheck.concat(dropTarget.eSecondaryContainers);
	            }
	            var gotMatch = false;
	            targetsToCheck.forEach(function (eContainer) {
	                if (!eContainer) {
	                    return;
	                } // secondary can be missing
	                var rect = eContainer.getBoundingClientRect();
	                // if element is not visible, then width and height are zero
	                if (rect.width === 0 || rect.height === 0) {
	                    return;
	                }
	                var horizontalFit = mouseEvent.clientX >= rect.left && mouseEvent.clientX <= rect.right;
	                var verticalFit = mouseEvent.clientY >= rect.top && mouseEvent.clientY <= rect.bottom;
	                //console.log(`rect.width = ${rect.width} || rect.height = ${rect.height} ## verticalFit = ${verticalFit}, horizontalFit = ${horizontalFit}, `);
	                if (horizontalFit && verticalFit) {
	                    gotMatch = true;
	                }
	            });
	            return gotMatch;
	        });
	        if (dropTarget !== this.lastDropTarget) {
	            if (this.lastDropTarget) {
	                this.logger.log('onDragLeave');
	                var dragLeaveEvent = this.createDropTargetEvent(this.lastDropTarget, mouseEvent, direction);
	                this.lastDropTarget.onDragLeave(dragLeaveEvent);
	                this.setGhostIcon(null);
	            }
	            if (dropTarget) {
	                this.logger.log('onDragEnter');
	                var dragEnterEvent = this.createDropTargetEvent(dropTarget, mouseEvent, direction);
	                dropTarget.onDragEnter(dragEnterEvent);
	                this.setGhostIcon(dropTarget.iconName);
	            }
	            this.lastDropTarget = dropTarget;
	        }
	        else if (dropTarget) {
	            var draggingEvent = this.createDropTargetEvent(dropTarget, mouseEvent, direction);
	            dropTarget.onDragging(draggingEvent);
	        }
	    };
	    DragAndDropService.prototype.addDropTarget = function (dropTarget) {
	        this.dropTargets.push(dropTarget);
	    };
	    DragAndDropService.prototype.workOutDirection = function (event) {
	        var direction;
	        if (this.eventLastTime.clientX > event.clientX) {
	            direction = DragAndDropService.DIRECTION_LEFT;
	        }
	        else if (this.eventLastTime.clientX < event.clientX) {
	            direction = DragAndDropService.DIRECTION_RIGHT;
	        }
	        else {
	            direction = null;
	        }
	        return direction;
	    };
	    DragAndDropService.prototype.createDropTargetEvent = function (dropTarget, event, direction) {
	        // localise x and y to the target component
	        var rect = dropTarget.eContainer.getBoundingClientRect();
	        var x = event.clientX - rect.left;
	        var y = event.clientY - rect.top;
	        var dropTargetEvent = {
	            event: event,
	            x: x,
	            y: y,
	            direction: direction,
	            dragItem: this.dragItem,
	            dragSource: this.dragSource
	        };
	        return dropTargetEvent;
	    };
	    DragAndDropService.prototype.positionGhost = function (event) {
	        var ghostRect = this.eGhost.getBoundingClientRect();
	        var ghostHeight = ghostRect.height;
	        // for some reason, without the '-2', it still overlapped by 1 or 2 pixels, which
	        // then brought in scrollbars to the browser. no idea why, but putting in -2 here
	        // works around it which is good enough for me.
	        var browserWidth = utils_1.Utils.getBodyWidth() - 2;
	        var browserHeight = utils_1.Utils.getBodyHeight() - 2;
	        // put ghost vertically in middle of cursor
	        var top = event.pageY - (ghostHeight / 2);
	        // horizontally, place cursor just right of icon
	        var left = event.pageX - 30;
	        // check ghost is not positioned outside of the browser
	        if (browserWidth > 0) {
	            if ((left + this.eGhost.clientWidth) > browserWidth) {
	                left = browserWidth - this.eGhost.clientWidth;
	            }
	        }
	        if (left < 0) {
	            left = 0;
	        }
	        if (browserHeight > 0) {
	            if ((top + this.eGhost.clientHeight) > browserHeight) {
	                top = browserHeight - this.eGhost.clientHeight;
	            }
	        }
	        if (top < 0) {
	            top = 0;
	        }
	        this.eGhost.style.left = left + 'px';
	        this.eGhost.style.top = top + 'px';
	    };
	    DragAndDropService.prototype.removeGhost = function () {
	        if (this.eGhost) {
	            this.eBody.removeChild(this.eGhost);
	        }
	        this.eGhost = null;
	    };
	    DragAndDropService.prototype.createGhost = function () {
	        var dragItem = this.dragSource.dragItem;
	        this.eGhost = utils_1.Utils.loadTemplate(headerTemplateLoader_1.HeaderTemplateLoader.HEADER_CELL_DND_TEMPLATE);
	        this.eGhostIcon = this.eGhost.querySelector('#eGhostIcon');
	        if (this.lastDropTarget) {
	            this.setGhostIcon(this.lastDropTarget.iconName);
	        }
	        var eText = this.eGhost.querySelector('#agText');
	        if (dragItem.getColDef().headerName) {
	            eText.innerHTML = dragItem.getColDef().headerName;
	        }
	        else {
	            eText.innerHTML = dragItem.getColId();
	        }
	        this.eGhost.style.width = dragItem.getActualWidth() + 'px';
	        this.eGhost.style.height = this.gridOptionsWrapper.getHeaderHeight() + 'px';
	        this.eGhost.style.top = '20px';
	        this.eGhost.style.left = '20px';
	        this.eBody.appendChild(this.eGhost);
	    };
	    DragAndDropService.prototype.setGhostIcon = function (iconName, shake) {
	        if (shake === void 0) { shake = false; }
	        utils_1.Utils.removeAllChildren(this.eGhostIcon);
	        var eIcon;
	        switch (iconName) {
	            case DragAndDropService.ICON_ADD:
	                eIcon = this.ePlusIcon;
	                break;
	            case DragAndDropService.ICON_PINNED:
	                eIcon = this.ePinnedIcon;
	                break;
	            case DragAndDropService.ICON_MOVE:
	                eIcon = this.eMoveIcon;
	                break;
	            case DragAndDropService.ICON_LEFT:
	                eIcon = this.eLeftIcon;
	                break;
	            case DragAndDropService.ICON_RIGHT:
	                eIcon = this.eRightIcon;
	                break;
	            case DragAndDropService.ICON_GROUP:
	                eIcon = this.eGroupIcon;
	                break;
	            default:
	                eIcon = this.eHiddenIcon;
	                break;
	        }
	        this.eGhostIcon.appendChild(eIcon);
	        utils_1.Utils.addOrRemoveCssClass(this.eGhostIcon, 'ag-shake-left-to-right', shake);
	    };
	    DragAndDropService.DIRECTION_LEFT = 'left';
	    DragAndDropService.DIRECTION_RIGHT = 'right';
	    DragAndDropService.ICON_PINNED = 'pinned';
	    DragAndDropService.ICON_ADD = 'add';
	    DragAndDropService.ICON_MOVE = 'move';
	    DragAndDropService.ICON_LEFT = 'left';
	    DragAndDropService.ICON_RIGHT = 'right';
	    DragAndDropService.ICON_GROUP = 'group';
	    __decorate([
	        context_3.Autowired('gridOptionsWrapper'), 
	        __metadata('design:type', gridOptionsWrapper_1.GridOptionsWrapper)
	    ], DragAndDropService.prototype, "gridOptionsWrapper", void 0);
	    __decorate([
	        context_3.Autowired('dragService'), 
	        __metadata('design:type', dragService_1.DragService)
	    ], DragAndDropService.prototype, "dragService", void 0);
	    __decorate([
	        __param(0, context_1.Qualifier('loggerFactory')), 
	        __metadata('design:type', Function), 
	        __metadata('design:paramtypes', [logger_1.LoggerFactory]), 
	        __metadata('design:returntype', void 0)
	    ], DragAndDropService.prototype, "agWire", null);
	    DragAndDropService = __decorate([
	        context_2.Bean('dragAndDropService'), 
	        __metadata('design:paramtypes', [])
	    ], DragAndDropService);
	    return DragAndDropService;
	})();
	exports.DragAndDropService = DragAndDropService;


/***/ },
/* 62 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
	 * @version v4.0.3
	 * @link http://www.ag-grid.com/
	 * @license MIT
	 */
	var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
	    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
	    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
	    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
	    return c > 3 && r && Object.defineProperty(target, key, r), r;
	};
	var __metadata = (this && this.__metadata) || function (k, v) {
	    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
	};
	var context_1 = __webpack_require__(6);
	var logger_1 = __webpack_require__(5);
	var columnController_1 = __webpack_require__(13);
	var column_1 = __webpack_require__(15);
	var utils_1 = __webpack_require__(7);
	var dragAndDropService_1 = __webpack_require__(61);
	var gridPanel_1 = __webpack_require__(24);
	var context_2 = __webpack_require__(6);
	var MoveColumnController = (function () {
	    function MoveColumnController(pinned) {
	        this.needToMoveLeft = false;
	        this.needToMoveRight = false;
	        this.pinned = pinned;
	        this.centerContainer = !utils_1.Utils.exists(pinned);
	    }
	    MoveColumnController.prototype.init = function () {
	        this.logger = this.loggerFactory.create('MoveColumnController');
	    };
	    MoveColumnController.prototype.onDragEnter = function (draggingEvent) {
	        // we do dummy drag, so make sure column appears in the right location when first placed
	        this.columnController.setColumnVisible(draggingEvent.dragItem, true);
	        this.columnController.setColumnPinned(draggingEvent.dragItem, this.pinned);
	        this.onDragging(draggingEvent);
	    };
	    MoveColumnController.prototype.onDragLeave = function (draggingEvent) {
	        this.columnController.setColumnVisible(draggingEvent.dragItem, false);
	        this.ensureIntervalCleared();
	    };
	    MoveColumnController.prototype.onDragStop = function () {
	        this.ensureIntervalCleared();
	    };
	    MoveColumnController.prototype.adjustXForScroll = function (draggingEvent) {
	        if (this.centerContainer) {
	            return draggingEvent.x + this.gridPanel.getHorizontalScrollPosition();
	        }
	        else {
	            return draggingEvent.x;
	        }
	    };
	    MoveColumnController.prototype.workOutNewIndex = function (displayedColumns, allColumns, draggingEvent, xAdjustedForScroll) {
	        if (draggingEvent.direction === dragAndDropService_1.DragAndDropService.DIRECTION_LEFT) {
	            return this.getNewIndexForColMovingLeft(displayedColumns, allColumns, draggingEvent.dragItem, xAdjustedForScroll);
	        }
	        else {
	            return this.getNewIndexForColMovingRight(displayedColumns, allColumns, draggingEvent.dragItem, xAdjustedForScroll);
	        }
	    };
	    MoveColumnController.prototype.checkCenterForScrolling = function (xAdjustedForScroll) {
	        if (this.centerContainer) {
	            // scroll if the mouse has gone outside the grid (or just outside the scrollable part if pinning)
	            // putting in 50 buffer, so even if user gets to edge of grid, a scroll will happen
	            var firstVisiblePixel = this.gridPanel.getHorizontalScrollPosition();
	            var lastVisiblePixel = firstVisiblePixel + this.gridPanel.getCenterWidth();
	            this.needToMoveLeft = xAdjustedForScroll < (firstVisiblePixel + 50);
	            this.needToMoveRight = xAdjustedForScroll > (lastVisiblePixel - 50);
	            if (this.needToMoveLeft || this.needToMoveRight) {
	                this.ensureIntervalStarted();
	            }
	            else {
	                this.ensureIntervalCleared();
	            }
	        }
	    };
	    MoveColumnController.prototype.onDragging = function (draggingEvent) {
	        this.lastDraggingEvent = draggingEvent;
	        // if moving up or down (ie not left or right) then do nothing
	        if (!draggingEvent.direction) {
	            return;
	        }
	        var xAdjustedForScroll = this.adjustXForScroll(draggingEvent);
	        this.checkCenterForScrolling(xAdjustedForScroll);
	        // find out what the correct position is for this column
	        this.checkColIndexAndMove(draggingEvent, xAdjustedForScroll);
	    };
	    MoveColumnController.prototype.checkColIndexAndMove = function (draggingEvent, xAdjustedForScroll) {
	        var displayedColumns = this.columnController.getDisplayedColumns(this.pinned);
	        var allColumns = this.columnController.getAllColumns();
	        var newIndex = this.workOutNewIndex(displayedColumns, allColumns, draggingEvent, xAdjustedForScroll);
	        var oldColumn = allColumns[newIndex];
	        // if col already at required location, do nothing
	        if (oldColumn === draggingEvent.dragItem) {
	            return;
	        }
	        // we move one column, UNLESS the column is the only visible column
	        // of a group, in which case we move the whole group.
	        var columnsToMove = this.getColumnsAndOrphans(draggingEvent.dragItem);
	        this.columnController.moveColumns(columnsToMove.reverse(), newIndex);
	    };
	    MoveColumnController.prototype.getNewIndexForColMovingLeft = function (displayedColumns, allColumns, dragItem, x) {
	        var usedX = 0;
	        var leftColumn = null;
	        for (var i = 0; i < displayedColumns.length; i++) {
	            var currentColumn = displayedColumns[i];
	            if (currentColumn === dragItem) {
	                continue;
	            }
	            usedX += currentColumn.getActualWidth();
	            if (usedX > x) {
	                break;
	            }
	            leftColumn = currentColumn;
	        }
	        var newIndex;
	        if (leftColumn) {
	            newIndex = allColumns.indexOf(leftColumn) + 1;
	            var oldIndex = allColumns.indexOf(dragItem);
	            if (oldIndex < newIndex) {
	                newIndex--;
	            }
	        }
	        else {
	            newIndex = 0;
	        }
	        return newIndex;
	    };
	    MoveColumnController.prototype.getNewIndexForColMovingRight = function (displayedColumns, allColumns, dragItem, x) {
	        var usedX = dragItem.getActualWidth();
	        var leftColumn = null;
	        for (var i = 0; i < displayedColumns.length; i++) {
	            if (usedX > x) {
	                break;
	            }
	            var currentColumn = displayedColumns[i];
	            if (currentColumn === dragItem) {
	                continue;
	            }
	            usedX += currentColumn.getActualWidth();
	            leftColumn = currentColumn;
	        }
	        var newIndex;
	        if (leftColumn) {
	            newIndex = allColumns.indexOf(leftColumn) + 1;
	            var oldIndex = allColumns.indexOf(dragItem);
	            if (oldIndex < newIndex) {
	                newIndex--;
	            }
	        }
	        else {
	            newIndex = 0;
	        }
	        return newIndex;
	    };
	    MoveColumnController.prototype.getColumnsAndOrphans = function (column) {
	        // if this column was to move, how many children would be left without a parent
	        var pathToChild = this.columnController.getPathForColumn(column);
	        for (var i = pathToChild.length - 1; i >= 0; i--) {
	            var columnGroup = pathToChild[i];
	            var onlyDisplayedChild = columnGroup.getDisplayedChildren().length === 1;
	            var moreThanOneChild = columnGroup.getChildren().length > 1;
	            if (onlyDisplayedChild && moreThanOneChild) {
	                // return total columns below here, not including the column under inspection
	                var leafColumns = columnGroup.getLeafColumns();
	                return leafColumns;
	            }
	        }
	        return [column];
	    };
	    MoveColumnController.prototype.ensureIntervalStarted = function () {
	        if (!this.movingIntervalId) {
	            this.intervalCount = 0;
	            this.failedMoveAttempts = 0;
	            this.movingIntervalId = setInterval(this.moveInterval.bind(this), 100);
	            if (this.needToMoveLeft) {
	                this.dragAndDropService.setGhostIcon(dragAndDropService_1.DragAndDropService.ICON_LEFT, true);
	            }
	            else {
	                this.dragAndDropService.setGhostIcon(dragAndDropService_1.DragAndDropService.ICON_RIGHT, true);
	            }
	        }
	    };
	    MoveColumnController.prototype.ensureIntervalCleared = function () {
	        if (this.moveInterval) {
	            clearInterval(this.movingIntervalId);
	            this.movingIntervalId = null;
	            this.dragAndDropService.setGhostIcon(dragAndDropService_1.DragAndDropService.ICON_MOVE);
	        }
	    };
	    MoveColumnController.prototype.moveInterval = function () {
	        var pixelsToMove;
	        this.intervalCount++;
	        pixelsToMove = 10 + (this.intervalCount * 5);
	        if (pixelsToMove > 100) {
	            pixelsToMove = 100;
	        }
	        var pixelsMoved;
	        if (this.needToMoveLeft) {
	            pixelsMoved = this.gridPanel.scrollHorizontally(-pixelsToMove);
	        }
	        else if (this.needToMoveRight) {
	            pixelsMoved = this.gridPanel.scrollHorizontally(pixelsToMove);
	        }
	        if (pixelsMoved !== 0) {
	            this.onDragging(this.lastDraggingEvent);
	            this.failedMoveAttempts = 0;
	        }
	        else {
	            this.failedMoveAttempts++;
	            if (this.failedMoveAttempts > 7) {
	                if (this.needToMoveLeft) {
	                    this.columnController.setColumnPinned(this.lastDraggingEvent.dragItem, column_1.Column.PINNED_LEFT);
	                }
	                else {
	                    this.columnController.setColumnPinned(this.lastDraggingEvent.dragItem, column_1.Column.PINNED_RIGHT);
	                }
	                this.dragAndDropService.nudge();
	            }
	        }
	    };
	    __decorate([
	        context_1.Autowired('loggerFactory'), 
	        __metadata('design:type', logger_1.LoggerFactory)
	    ], MoveColumnController.prototype, "loggerFactory", void 0);
	    __decorate([
	        context_1.Autowired('columnController'), 
	        __metadata('design:type', columnController_1.ColumnController)
	    ], MoveColumnController.prototype, "columnController", void 0);
	    __decorate([
	        context_1.Autowired('gridPanel'), 
	        __metadata('design:type', gridPanel_1.GridPanel)
	    ], MoveColumnController.prototype, "gridPanel", void 0);
	    __decorate([
	        context_1.Autowired('dragAndDropService'), 
	        __metadata('design:type', dragAndDropService_1.DragAndDropService)
	    ], MoveColumnController.prototype, "dragAndDropService", void 0);
	    __decorate([
	        context_2.PostConstruct, 
	        __metadata('design:type', Function), 
	        __metadata('design:paramtypes', []), 
	        __metadata('design:returntype', void 0)
	    ], MoveColumnController.prototype, "init", null);
	    return MoveColumnController;
	})();
	exports.MoveColumnController = MoveColumnController;


/***/ },
/* 63 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
	 * @version v4.0.3
	 * @link http://www.ag-grid.com/
	 * @license MIT
	 */
	var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
	    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
	    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
	    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
	    return c > 3 && r && Object.defineProperty(target, key, r), r;
	};
	var __metadata = (this && this.__metadata) || function (k, v) {
	    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
	};
	var utils_1 = __webpack_require__(7);
	var constants_1 = __webpack_require__(8);
	var gridOptionsWrapper_1 = __webpack_require__(3);
	var columnController_1 = __webpack_require__(13);
	var filterManager_1 = __webpack_require__(40);
	var rowNode_1 = __webpack_require__(19);
	var eventService_1 = __webpack_require__(4);
	var events_1 = __webpack_require__(10);
	var context_1 = __webpack_require__(6);
	var selectionController_1 = __webpack_require__(29);
	var context_2 = __webpack_require__(6);
	var constants_2 = __webpack_require__(8);
	var context_3 = __webpack_require__(6);
	var context_4 = __webpack_require__(6);
	var RecursionType;
	(function (RecursionType) {
	    RecursionType[RecursionType["Normal"] = 0] = "Normal";
	    RecursionType[RecursionType["AfterFilter"] = 1] = "AfterFilter";
	    RecursionType[RecursionType["AfterFilterAndSort"] = 2] = "AfterFilterAndSort";
	})(RecursionType || (RecursionType = {}));
	;
	var InMemoryRowController = (function () {
	    function InMemoryRowController() {
	        // the rows go through a pipeline of steps, each array below is the result
	        // after a certain step.
	        this.allRows = []; // the rows, in a list, as provided by the user, but wrapped in RowNode objects
	    }
	    InMemoryRowController.prototype.init = function () {
	        this.eventService.addModalPriorityEventListener(events_1.Events.EVENT_COLUMN_EVERYTHING_CHANGED, this.refreshModel.bind(this, constants_2.Constants.STEP_EVERYTHING));
	        this.eventService.addModalPriorityEventListener(events_1.Events.EVENT_COLUMN_ROW_GROUP_CHANGE, this.refreshModel.bind(this, constants_2.Constants.STEP_EVERYTHING));
	        this.eventService.addModalPriorityEventListener(events_1.Events.EVENT_COLUMN_VALUE_CHANGE, this.refreshModel.bind(this, constants_2.Constants.STEP_AGGREGATE));
	        this.eventService.addModalPriorityEventListener(events_1.Events.EVENT_FILTER_CHANGED, this.refreshModel.bind(this, constants_1.Constants.STEP_FILTER));
	        this.eventService.addModalPriorityEventListener(events_1.Events.EVENT_SORT_CHANGED, this.refreshModel.bind(this, constants_1.Constants.STEP_SORT));
	        if (this.gridOptionsWrapper.isRowModelDefault()) {
	            this.setRowData(this.gridOptionsWrapper.getRowData(), this.columnController.isReady());
	        }
	    };
	    InMemoryRowController.prototype.refreshModel = function (step, fromIndex, groupState) {
	        // this goes through the pipeline of stages. what's in my head is similar
	        // to the diagram on this page:
	        // http://commons.apache.org/sandbox/commons-pipeline/pipeline_basics.html
	        // however we want to keep the results of each stage, hence we manually call
	        // each step rather than have them chain each other.
	        var _this = this;
	        // fallthrough in below switch is on purpose,
	        // eg if STEP_FILTER, then all steps below this
	        // step get done
	        switch (step) {
	            case constants_1.Constants.STEP_EVERYTHING:
	                this.doRowGrouping(groupState);
	            case constants_1.Constants.STEP_FILTER:
	                this.doFilter();
	            case constants_1.Constants.STEP_AGGREGATE:
	                this.doAggregate();
	            case constants_1.Constants.STEP_SORT:
	                this.doSort();
	            case constants_1.Constants.STEP_MAP:
	                this.doRowsToDisplay();
	        }
	        this.eventService.dispatchEvent(events_1.Events.EVENT_MODEL_UPDATED, { fromIndex: fromIndex });
	        if (this.$scope) {
	            setTimeout(function () {
	                _this.$scope.$apply();
	            }, 0);
	        }
	    };
	    InMemoryRowController.prototype.isEmpty = function () {
	        return this.allRows === null || this.allRows.length === 0 || !this.columnController.isReady();
	    };
	    InMemoryRowController.prototype.isRowsToRender = function () {
	        return utils_1.Utils.exists(this.rowsToDisplay) && this.rowsToDisplay.length > 0;
	    };
	    InMemoryRowController.prototype.setDatasource = function (datasource) {
	        console.error('ag-Grid: should never call setDatasource on inMemoryRowController');
	    };
	    InMemoryRowController.prototype.getTopLevelNodes = function () {
	        return this.rowsAfterGroup;
	    };
	    InMemoryRowController.prototype.getRow = function (index) {
	        return this.rowsToDisplay[index];
	    };
	    InMemoryRowController.prototype.getVirtualRowCount = function () {
	        console.warn('ag-Grid: rowModel.getVirtualRowCount() is not longer a function, use rowModel.getRowCount() instead');
	        return this.getRowCount();
	    };
	    InMemoryRowController.prototype.getRowCount = function () {
	        if (this.rowsToDisplay) {
	            return this.rowsToDisplay.length;
	        }
	        else {
	            return 0;
	        }
	    };
	    InMemoryRowController.prototype.getRowAtPixel = function (pixelToMatch) {
	        if (this.isEmpty()) {
	            return -1;
	        }
	        // do binary search of tree
	        // http://oli.me.uk/2013/06/08/searching-javascript-arrays-with-a-binary-search/
	        var bottomPointer = 0;
	        var topPointer = this.rowsToDisplay.length - 1;
	        // quick check, if the pixel is out of bounds, then return last row
	        if (pixelToMatch <= 0) {
	            // if pixel is less than or equal zero, it's always the first row
	            return 0;
	        }
	        var lastNode = this.rowsToDisplay[this.rowsToDisplay.length - 1];
	        if (lastNode.rowTop <= pixelToMatch) {
	            return this.rowsToDisplay.length - 1;
	        }
	        while (true) {
	            var midPointer = Math.floor((bottomPointer + topPointer) / 2);
	            var currentRowNode = this.rowsToDisplay[midPointer];
	            if (this.isRowInPixel(currentRowNode, pixelToMatch)) {
	                return midPointer;
	            }
	            else if (currentRowNode.rowTop < pixelToMatch) {
	                bottomPointer = midPointer + 1;
	            }
	            else if (currentRowNode.rowTop > pixelToMatch) {
	                topPointer = midPointer - 1;
	            }
	        }
	    };
	    InMemoryRowController.prototype.isRowInPixel = function (rowNode, pixelToMatch) {
	        var topPixel = rowNode.rowTop;
	        var bottomPixel = rowNode.rowTop + rowNode.rowHeight;
	        var pixelInRow = topPixel <= pixelToMatch && bottomPixel > pixelToMatch;
	        return pixelInRow;
	    };
	    InMemoryRowController.prototype.getRowCombinedHeight = function () {
	        if (this.rowsToDisplay && this.rowsToDisplay.length > 0) {
	            var lastRow = this.rowsToDisplay[this.rowsToDisplay.length - 1];
	            var lastPixel = lastRow.rowTop + lastRow.rowHeight;
	            return lastPixel;
	        }
	        else {
	            return 0;
	        }
	    };
	    InMemoryRowController.prototype.forEachNode = function (callback) {
	        this.recursivelyWalkNodesAndCallback(this.rowsAfterGroup, callback, RecursionType.Normal, 0);
	    };
	    InMemoryRowController.prototype.forEachNodeAfterFilter = function (callback) {
	        this.recursivelyWalkNodesAndCallback(this.rowsAfterFilter, callback, RecursionType.AfterFilter, 0);
	    };
	    InMemoryRowController.prototype.forEachNodeAfterFilterAndSort = function (callback) {
	        this.recursivelyWalkNodesAndCallback(this.rowsAfterSort, callback, RecursionType.AfterFilterAndSort, 0);
	    };
	    // iterates through each item in memory, and calls the callback function
	    // nodes - the rowNodes to traverse
	    // callback - the user provided callback
	    // recursion type - need this to know what child nodes to recurse, eg if looking at all nodes, or filtered notes etc
	    // index - works similar to the index in forEach in javascripts array function
	    InMemoryRowController.prototype.recursivelyWalkNodesAndCallback = function (nodes, callback, recursionType, index) {
	        if (nodes) {
	            for (var i = 0; i < nodes.length; i++) {
	                var node = nodes[i];
	                callback(node, index++);
	                // go to the next level if it is a group
	                if (node.group) {
	                    // depending on the recursion type, we pick a difference set of children
	                    var nodeChildren;
	                    switch (recursionType) {
	                        case RecursionType.Normal:
	                            nodeChildren = node.children;
	                            break;
	                        case RecursionType.AfterFilter:
	                            nodeChildren = node.childrenAfterFilter;
	                            break;
	                        case RecursionType.AfterFilterAndSort:
	                            nodeChildren = node.childrenAfterSort;
	                            break;
	                    }
	                    if (nodeChildren) {
	                        index = this.recursivelyWalkNodesAndCallback(nodeChildren, callback, recursionType, index);
	                    }
	                }
	            }
	        }
	        return index;
	    };
	    // it's possible to recompute the aggregate without doing the other parts
	    // + gridApi.recomputeAggregates()
	    InMemoryRowController.prototype.doAggregate = function () {
	        if (this.aggregationStage) {
	            this.aggregationStage.execute(this.rowsAfterFilter);
	        }
	    };
	    // + gridApi.expandAll()
	    // + gridApi.collapseAll()
	    InMemoryRowController.prototype.expandOrCollapseAll = function (expand) {
	        recursiveExpandOrCollapse(this.rowsAfterGroup);
	        function recursiveExpandOrCollapse(rowNodes) {
	            if (!rowNodes) {
	                return;
	            }
	            rowNodes.forEach(function (rowNode) {
	                if (rowNode.group) {
	                    rowNode.expanded = expand;
	                    recursiveExpandOrCollapse(rowNode.children);
	                }
	            });
	        }
	        this.refreshModel(constants_2.Constants.STEP_MAP);
	    };
	    InMemoryRowController.prototype.doSort = function () {
	        this.rowsAfterSort = this.sortStage.execute(this.rowsAfterFilter);
	    };
	    InMemoryRowController.prototype.doRowGrouping = function (groupState) {
	        // grouping is enterprise only, so if service missing, skip the step
	        var rowsAlreadyGrouped = utils_1.Utils.exists(this.gridOptionsWrapper.getNodeChildDetailsFunc());
	        if (this.groupStage && !rowsAlreadyGrouped) {
	            // remove old groups from the selection model, as we are about to replace them
	            // with new groups
	            this.selectionController.removeGroupsFromSelection();
	            this.rowsAfterGroup = this.groupStage.execute(this.allRows);
	            this.restoreGroupState(groupState);
	            if (this.gridOptionsWrapper.isGroupSelectsChildren()) {
	                this.selectionController.updateGroupsFromChildrenSelections();
	            }
	        }
	        else {
	            this.rowsAfterGroup = this.allRows;
	        }
	    };
	    InMemoryRowController.prototype.restoreGroupState = function (groupState) {
	        if (!groupState) {
	            return;
	        }
	        utils_1.Utils.traverseNodesWithKey(this.rowsAfterGroup, function (node, key) {
	            node.expanded = groupState[key] === true;
	        });
	    };
	    InMemoryRowController.prototype.doFilter = function () {
	        this.rowsAfterFilter = this.filterStage.execute(this.rowsAfterGroup);
	    };
	    // rows: the rows to put into the model
	    // firstId: the first id to use, used for paging, where we are not on the first page
	    InMemoryRowController.prototype.setRowData = function (rowData, refresh, firstId) {
	        // remember group state, so we can expand groups that should be expanded
	        var groupState = this.getGroupState();
	        // place each row into a wrapper
	        this.allRows = this.createRowNodesFromData(rowData, firstId);
	        this.eventService.dispatchEvent(events_1.Events.EVENT_ROW_DATA_CHANGED);
	        if (refresh) {
	            this.refreshModel(constants_2.Constants.STEP_EVERYTHING, null, groupState);
	        }
	    };
	    InMemoryRowController.prototype.getGroupState = function () {
	        if (!this.rowsAfterGroup || !this.gridOptionsWrapper.isRememberGroupStateWhenNewData()) {
	            return null;
	        }
	        var result = {};
	        utils_1.Utils.traverseNodesWithKey(this.rowsAfterGroup, function (node, key) { return result[key] = node.expanded; });
	        return result;
	    };
	    InMemoryRowController.prototype.createRowNodesFromData = function (rowData, firstId) {
	        if (!rowData) {
	            return [];
	        }
	        var rowNodeId = utils_1.Utils.exists(firstId) ? firstId : 0;
	        // func below doesn't have 'this' pointer, so need to pull out these bits
	        var nodeChildDetailsFunc = this.gridOptionsWrapper.getNodeChildDetailsFunc();
	        var suppressParentsInRowNodes = this.gridOptionsWrapper.isSuppressParentsInRowNodes();
	        var eventService = this.eventService;
	        var gridOptionsWrapper = this.gridOptionsWrapper;
	        var selectionController = this.selectionController;
	        // kick off recursion
	        var result = recursiveFunction(rowData, null, 0);
	        return result;
	        function recursiveFunction(rowData, parent, level) {
	            var rowNodes = [];
	            rowData.forEach(function (dataItem) {
	                var node = new rowNode_1.RowNode(eventService, gridOptionsWrapper, selectionController);
	                var nodeChildDetails = nodeChildDetailsFunc ? nodeChildDetailsFunc(dataItem) : null;
	                if (nodeChildDetails && nodeChildDetails.group) {
	                    node.group = true;
	                    node.children = recursiveFunction(nodeChildDetails.children, node, level + 1);
	                    node.expanded = nodeChildDetails.expanded === true;
	                    node.field = nodeChildDetails.field;
	                    node.key = nodeChildDetails.key;
	                }
	                if (parent && !suppressParentsInRowNodes) {
	                    node.parent = parent;
	                }
	                node.level = level;
	                node.id = rowNodeId++;
	                node.data = dataItem;
	                rowNodes.push(node);
	            });
	            return rowNodes;
	        }
	    };
	    InMemoryRowController.prototype.doRowsToDisplay = function () {
	        this.rowsToDisplay = this.flattenStage.execute(this.rowsAfterSort);
	    };
	    __decorate([
	        context_2.Autowired('gridOptionsWrapper'), 
	        __metadata('design:type', gridOptionsWrapper_1.GridOptionsWrapper)
	    ], InMemoryRowController.prototype, "gridOptionsWrapper", void 0);
	    __decorate([
	        context_2.Autowired('columnController'), 
	        __metadata('design:type', columnController_1.ColumnController)
	    ], InMemoryRowController.prototype, "columnController", void 0);
	    __decorate([
	        context_2.Autowired('filterManager'), 
	        __metadata('design:type', filterManager_1.FilterManager)
	    ], InMemoryRowController.prototype, "filterManager", void 0);
	    __decorate([
	        context_2.Autowired('$scope'), 
	        __metadata('design:type', Object)
	    ], InMemoryRowController.prototype, "$scope", void 0);
	    __decorate([
	        context_2.Autowired('selectionController'), 
	        __metadata('design:type', selectionController_1.SelectionController)
	    ], InMemoryRowController.prototype, "selectionController", void 0);
	    __decorate([
	        context_2.Autowired('eventService'), 
	        __metadata('design:type', eventService_1.EventService)
	    ], InMemoryRowController.prototype, "eventService", void 0);
	    __decorate([
	        context_2.Autowired('filterStage'), 
	        __metadata('design:type', Object)
	    ], InMemoryRowController.prototype, "filterStage", void 0);
	    __decorate([
	        context_2.Autowired('sortStage'), 
	        __metadata('design:type', Object)
	    ], InMemoryRowController.prototype, "sortStage", void 0);
	    __decorate([
	        context_2.Autowired('flattenStage'), 
	        __metadata('design:type', Object)
	    ], InMemoryRowController.prototype, "flattenStage", void 0);
	    __decorate([
	        context_4.Optional('groupStage'), 
	        __metadata('design:type', Object)
	    ], InMemoryRowController.prototype, "groupStage", void 0);
	    __decorate([
	        context_4.Optional('aggregationStage'), 
	        __metadata('design:type', Object)
	    ], InMemoryRowController.prototype, "aggregationStage", void 0);
	    __decorate([
	        // the rows mapped to rows to display
	        context_3.PostConstruct, 
	        __metadata('design:type', Function), 
	        __metadata('design:paramtypes', []), 
	        __metadata('design:returntype', void 0)
	    ], InMemoryRowController.prototype, "init", null);
	    InMemoryRowController = __decorate([
	        context_1.Bean('rowModel'), 
	        __metadata('design:paramtypes', [])
	    ], InMemoryRowController);
	    return InMemoryRowController;
	})();
	exports.InMemoryRowController = InMemoryRowController;


/***/ },
/* 64 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
	 * @version v4.0.3
	 * @link http://www.ag-grid.com/
	 * @license MIT
	 */
	var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
	    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
	    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
	    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
	    return c > 3 && r && Object.defineProperty(target, key, r), r;
	};
	var __metadata = (this && this.__metadata) || function (k, v) {
	    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
	};
	var utils_1 = __webpack_require__(7);
	var gridOptionsWrapper_1 = __webpack_require__(3);
	var rowNode_1 = __webpack_require__(19);
	var context_1 = __webpack_require__(6);
	var eventService_1 = __webpack_require__(4);
	var selectionController_1 = __webpack_require__(29);
	var context_2 = __webpack_require__(6);
	var context_3 = __webpack_require__(6);
	var events_1 = __webpack_require__(10);
	var sortController_1 = __webpack_require__(39);
	var filterManager_1 = __webpack_require__(40);
	/*
	* This row controller is used for infinite scrolling only. For normal 'in memory' table,
	* or standard pagination, the inMemoryRowController is used.
	*/
	var logging = false;
	var VirtualPageRowController = (function () {
	    function VirtualPageRowController() {
	        this.datasourceVersion = 0;
	    }
	    VirtualPageRowController.prototype.init = function () {
	        var _this = this;
	        var virtualEnabled = this.gridOptionsWrapper.isRowModelVirtual();
	        this.eventService.addEventListener(events_1.Events.EVENT_FILTER_CHANGED, function () {
	            if (virtualEnabled && _this.gridOptionsWrapper.isEnableServerSideFilter()) {
	                _this.reset();
	            }
	        });
	        this.eventService.addEventListener(events_1.Events.EVENT_SORT_CHANGED, function () {
	            if (virtualEnabled && _this.gridOptionsWrapper.isEnableServerSideSorting()) {
	                _this.reset();
	            }
	        });
	        if (virtualEnabled && this.gridOptionsWrapper.getDatasource()) {
	            this.setDatasource(this.gridOptionsWrapper.getDatasource());
	        }
	    };
	    VirtualPageRowController.prototype.getTopLevelNodes = function () {
	        return null;
	    };
	    VirtualPageRowController.prototype.setDatasource = function (datasource) {
	        this.datasource = datasource;
	        if (!datasource) {
	            // only continue if we have a valid datasource to working with
	            return;
	        }
	        this.reset();
	    };
	    VirtualPageRowController.prototype.isEmpty = function () {
	        return !this.datasource;
	    };
	    VirtualPageRowController.prototype.isRowsToRender = function () {
	        return utils_1.Utils.exists(this.datasource);
	    };
	    VirtualPageRowController.prototype.reset = function () {
	        this.selectionController.reset();
	        // see if datasource knows how many rows there are
	        if (typeof this.datasource.rowCount === 'number' && this.datasource.rowCount >= 0) {
	            this.virtualRowCount = this.datasource.rowCount;
	            this.foundMaxRow = true;
	        }
	        else {
	            this.virtualRowCount = 0;
	            this.foundMaxRow = false;
	        }
	        // in case any daemon requests coming from datasource, we know it ignore them
	        this.datasourceVersion++;
	        // map of page numbers to rows in that page
	        this.pageCache = {};
	        this.pageCacheSize = 0;
	        // if a number is in this array, it means we are pending a load from it
	        this.pageLoadsInProgress = [];
	        this.pageLoadsQueued = [];
	        this.pageAccessTimes = {}; // keeps a record of when each page was last viewed, used for LRU cache
	        this.accessTime = 0; // rather than using the clock, we use this counter
	        // the number of concurrent loads we are allowed to the server
	        if (typeof this.datasource.maxConcurrentRequests === 'number' && this.datasource.maxConcurrentRequests > 0) {
	            this.maxConcurrentDatasourceRequests = this.datasource.maxConcurrentRequests;
	        }
	        else {
	            this.maxConcurrentDatasourceRequests = 2;
	        }
	        // the number of pages to keep in browser cache
	        if (typeof this.datasource.maxPagesInCache === 'number' && this.datasource.maxPagesInCache > 0) {
	            this.maxPagesInCache = this.datasource.maxPagesInCache;
	        }
	        else {
	            // null is default, means don't  have any max size on the cache
	            this.maxPagesInCache = null;
	        }
	        this.pageSize = this.datasource.pageSize; // take a copy of page size, we don't want it changing
	        this.overflowSize = this.datasource.overflowSize; // take a copy of page size, we don't want it changing
	        this.doLoadOrQueue(0);
	        this.rowRenderer.refreshView();
	    };
	    VirtualPageRowController.prototype.createNodesFromRows = function (pageNumber, rows) {
	        var nodes = [];
	        if (rows) {
	            for (var i = 0, j = rows.length; i < j; i++) {
	                var virtualRowIndex = (pageNumber * this.pageSize) + i;
	                var node = this.createNode(rows[i], virtualRowIndex, true);
	                nodes.push(node);
	            }
	        }
	        return nodes;
	    };
	    VirtualPageRowController.prototype.createNode = function (data, virtualRowIndex, realNode) {
	        var rowHeight = this.getRowHeightAsNumber();
	        var top = rowHeight * virtualRowIndex;
	        var rowNode;
	        if (realNode) {
	            // if a real node, then always create a new one
	            rowNode = new rowNode_1.RowNode(this.eventService, this.gridOptionsWrapper, this.selectionController);
	            rowNode.id = virtualRowIndex;
	            rowNode.data = data;
	            // and see if the previous one was selected, and if yes, swap it out
	            this.selectionController.syncInRowNode(rowNode);
	        }
	        else {
	            // if creating a proxy node, see if there is a copy in selected memory that we can use
	            var rowNode = this.selectionController.getNodeForIdIfSelected(virtualRowIndex);
	            if (!rowNode) {
	                rowNode = new rowNode_1.RowNode(this.eventService, this.gridOptionsWrapper, this.selectionController);
	                rowNode.id = virtualRowIndex;
	                rowNode.data = data;
	            }
	        }
	        rowNode.rowTop = top;
	        rowNode.rowHeight = rowHeight;
	        return rowNode;
	    };
	    VirtualPageRowController.prototype.removeFromLoading = function (pageNumber) {
	        var index = this.pageLoadsInProgress.indexOf(pageNumber);
	        this.pageLoadsInProgress.splice(index, 1);
	    };
	    VirtualPageRowController.prototype.pageLoadFailed = function (pageNumber) {
	        this.removeFromLoading(pageNumber);
	        this.checkQueueForNextLoad();
	    };
	    VirtualPageRowController.prototype.pageLoaded = function (pageNumber, rows, lastRow) {
	        this.putPageIntoCacheAndPurge(pageNumber, rows);
	        this.checkMaxRowAndInformRowRenderer(pageNumber, lastRow);
	        this.removeFromLoading(pageNumber);
	        this.checkQueueForNextLoad();
	    };
	    VirtualPageRowController.prototype.putPageIntoCacheAndPurge = function (pageNumber, rows) {
	        this.pageCache[pageNumber] = this.createNodesFromRows(pageNumber, rows);
	        this.pageCacheSize++;
	        if (logging) {
	            console.log('adding page ' + pageNumber);
	        }
	        var needToPurge = this.maxPagesInCache && this.maxPagesInCache < this.pageCacheSize;
	        if (needToPurge) {
	            // find the LRU page
	            var youngestPageIndex = this.findLeastRecentlyAccessedPage(Object.keys(this.pageCache));
	            if (logging) {
	                console.log('purging page ' + youngestPageIndex + ' from cache ' + Object.keys(this.pageCache));
	            }
	            delete this.pageCache[youngestPageIndex];
	            this.pageCacheSize--;
	        }
	    };
	    VirtualPageRowController.prototype.checkMaxRowAndInformRowRenderer = function (pageNumber, lastRow) {
	        if (!this.foundMaxRow) {
	            // if we know the last row, use if
	            if (typeof lastRow === 'number' && lastRow >= 0) {
	                this.virtualRowCount = lastRow;
	                this.foundMaxRow = true;
	            }
	            else {
	                // otherwise, see if we need to add some virtual rows
	                var thisPagePlusBuffer = ((pageNumber + 1) * this.pageSize) + this.overflowSize;
	                if (this.virtualRowCount < thisPagePlusBuffer) {
	                    this.virtualRowCount = thisPagePlusBuffer;
	                }
	            }
	            // if rowCount changes, refreshView, otherwise just refreshAllVirtualRows
	            this.rowRenderer.refreshView();
	        }
	        else {
	            this.rowRenderer.refreshAllVirtualRows();
	        }
	    };
	    VirtualPageRowController.prototype.isPageAlreadyLoading = function (pageNumber) {
	        var result = this.pageLoadsInProgress.indexOf(pageNumber) >= 0 || this.pageLoadsQueued.indexOf(pageNumber) >= 0;
	        return result;
	    };
	    VirtualPageRowController.prototype.doLoadOrQueue = function (pageNumber) {
	        // if we already tried to load this page, then ignore the request,
	        // otherwise server would be hit 50 times just to display one page, the
	        // first row to find the page missing is enough.
	        if (this.isPageAlreadyLoading(pageNumber)) {
	            return;
	        }
	        // try the page load - if not already doing a load, then we can go ahead
	        if (this.pageLoadsInProgress.length < this.maxConcurrentDatasourceRequests) {
	            // go ahead, load the page
	            this.loadPage(pageNumber);
	        }
	        else {
	            // otherwise, queue the request
	            this.addToQueueAndPurgeQueue(pageNumber);
	        }
	    };
	    VirtualPageRowController.prototype.addToQueueAndPurgeQueue = function (pageNumber) {
	        if (logging) {
	            console.log('queueing ' + pageNumber + ' - ' + this.pageLoadsQueued);
	        }
	        this.pageLoadsQueued.push(pageNumber);
	        // see if there are more pages queued that are actually in our cache, if so there is
	        // no point in loading them all as some will be purged as soon as loaded
	        var needToPurge = this.maxPagesInCache && this.maxPagesInCache < this.pageLoadsQueued.length;
	        if (needToPurge) {
	            // find the LRU page
	            var youngestPageIndex = this.findLeastRecentlyAccessedPage(this.pageLoadsQueued);
	            if (logging) {
	                console.log('de-queueing ' + pageNumber + ' - ' + this.pageLoadsQueued);
	            }
	            var indexToRemove = this.pageLoadsQueued.indexOf(youngestPageIndex);
	            this.pageLoadsQueued.splice(indexToRemove, 1);
	        }
	    };
	    VirtualPageRowController.prototype.findLeastRecentlyAccessedPage = function (pageIndexes) {
	        var youngestPageIndex = -1;
	        var youngestPageAccessTime = Number.MAX_VALUE;
	        var that = this;
	        pageIndexes.forEach(function (pageIndex) {
	            var accessTimeThisPage = that.pageAccessTimes[pageIndex];
	            if (accessTimeThisPage < youngestPageAccessTime) {
	                youngestPageAccessTime = accessTimeThisPage;
	                youngestPageIndex = pageIndex;
	            }
	        });
	        return youngestPageIndex;
	    };
	    VirtualPageRowController.prototype.checkQueueForNextLoad = function () {
	        if (this.pageLoadsQueued.length > 0) {
	            // take from the front of the queue
	            var pageToLoad = this.pageLoadsQueued[0];
	            this.pageLoadsQueued.splice(0, 1);
	            if (logging) {
	                console.log('dequeueing ' + pageToLoad + ' - ' + this.pageLoadsQueued);
	            }
	            this.loadPage(pageToLoad);
	        }
	    };
	    VirtualPageRowController.prototype.loadPage = function (pageNumber) {
	        this.pageLoadsInProgress.push(pageNumber);
	        var startRow = pageNumber * this.pageSize;
	        var endRow = (pageNumber + 1) * this.pageSize;
	        var that = this;
	        var datasourceVersionCopy = this.datasourceVersion;
	        var sortModel;
	        if (this.gridOptionsWrapper.isEnableServerSideSorting()) {
	            sortModel = this.sortController.getSortModel();
	        }
	        var filterModel;
	        if (this.gridOptionsWrapper.isEnableServerSideFilter()) {
	            filterModel = this.filterManager.getFilterModel();
	        }
	        var params = {
	            startRow: startRow,
	            endRow: endRow,
	            successCallback: successCallback,
	            failCallback: failCallback,
	            sortModel: sortModel,
	            filterModel: filterModel
	        };
	        // check if old version of datasource used
	        var getRowsParams = utils_1.Utils.getFunctionParameters(this.datasource.getRows);
	        if (getRowsParams.length > 1) {
	            console.warn('ag-grid: It looks like your paging datasource is of the old type, taking more than one parameter.');
	            console.warn('ag-grid: From ag-grid 1.9.0, now the getRows takes one parameter. See the documentation for details.');
	        }
	        this.datasource.getRows(params);
	        function successCallback(rows, lastRowIndex) {
	            if (that.requestIsDaemon(datasourceVersionCopy)) {
	                return;
	            }
	            that.pageLoaded(pageNumber, rows, lastRowIndex);
	        }
	        function failCallback() {
	            if (that.requestIsDaemon(datasourceVersionCopy)) {
	                return;
	            }
	            that.pageLoadFailed(pageNumber);
	        }
	    };
	    VirtualPageRowController.prototype.expandOrCollapseAll = function (expand) {
	        console.warn('ag-Grid: can not expand or collapse all when doing virtual pagination');
	    };
	    // check that the datasource has not changed since the lats time we did a request
	    VirtualPageRowController.prototype.requestIsDaemon = function (datasourceVersionCopy) {
	        return this.datasourceVersion !== datasourceVersionCopy;
	    };
	    VirtualPageRowController.prototype.getRow = function (rowIndex) {
	        if (rowIndex > this.virtualRowCount) {
	            return null;
	        }
	        var pageNumber = Math.floor(rowIndex / this.pageSize);
	        var page = this.pageCache[pageNumber];
	        // for LRU cache, track when this page was last hit
	        this.pageAccessTimes[pageNumber] = this.accessTime++;
	        if (!page) {
	            this.doLoadOrQueue(pageNumber);
	            // return back an empty row, so table can at least render empty cells
	            var dummyNode = this.createNode(null, rowIndex, false);
	            return dummyNode;
	        }
	        else {
	            var indexInThisPage = rowIndex % this.pageSize;
	            return page[indexInThisPage];
	        }
	    };
	    VirtualPageRowController.prototype.forEachNode = function (callback) {
	        var pageKeys = Object.keys(this.pageCache);
	        for (var i = 0; i < pageKeys.length; i++) {
	            var pageKey = pageKeys[i];
	            var page = this.pageCache[pageKey];
	            for (var j = 0; j < page.length; j++) {
	                var node = page[j];
	                callback(node);
	            }
	        }
	    };
	    VirtualPageRowController.prototype.getRowHeightAsNumber = function () {
	        var rowHeight = this.gridOptionsWrapper.getRowHeightForVirtualPagination();
	        if (typeof rowHeight === 'number') {
	            return rowHeight;
	        }
	        else {
	            console.warn('ag-Grid row height must be a number when doing virtual paging');
	            return 25;
	        }
	    };
	    VirtualPageRowController.prototype.getRowCombinedHeight = function () {
	        return this.virtualRowCount * this.getRowHeightAsNumber();
	    };
	    VirtualPageRowController.prototype.getRowAtPixel = function (pixel) {
	        var rowHeight = this.getRowHeightAsNumber();
	        if (rowHeight !== 0) {
	            return Math.floor(pixel / rowHeight);
	        }
	        else {
	            return 0;
	        }
	    };
	    VirtualPageRowController.prototype.getRowCount = function () {
	        return this.virtualRowCount;
	    };
	    VirtualPageRowController.prototype.setRowData = function (rows, refresh, firstId) {
	        console.warn('setRowData - does not work with virtual pagination');
	    };
	    VirtualPageRowController.prototype.forEachNodeAfterFilter = function (callback) {
	        console.warn('forEachNodeAfterFilter - does not work with virtual pagination');
	    };
	    VirtualPageRowController.prototype.forEachNodeAfterFilterAndSort = function (callback) {
	        console.warn('forEachNodeAfterFilter - does not work with virtual pagination');
	    };
	    VirtualPageRowController.prototype.refreshModel = function () {
	        console.warn('forEachNodeAfterFilter - does not work with virtual pagination');
	    };
	    __decorate([
	        context_2.Autowired('rowRenderer'), 
	        __metadata('design:type', Object)
	    ], VirtualPageRowController.prototype, "rowRenderer", void 0);
	    __decorate([
	        context_2.Autowired('gridOptionsWrapper'), 
	        __metadata('design:type', gridOptionsWrapper_1.GridOptionsWrapper)
	    ], VirtualPageRowController.prototype, "gridOptionsWrapper", void 0);
	    __decorate([
	        context_2.Autowired('filterManager'), 
	        __metadata('design:type', filterManager_1.FilterManager)
	    ], VirtualPageRowController.prototype, "filterManager", void 0);
	    __decorate([
	        context_2.Autowired('sortController'), 
	        __metadata('design:type', sortController_1.SortController)
	    ], VirtualPageRowController.prototype, "sortController", void 0);
	    __decorate([
	        context_2.Autowired('selectionController'), 
	        __metadata('design:type', selectionController_1.SelectionController)
	    ], VirtualPageRowController.prototype, "selectionController", void 0);
	    __decorate([
	        context_2.Autowired('eventService'), 
	        __metadata('design:type', eventService_1.EventService)
	    ], VirtualPageRowController.prototype, "eventService", void 0);
	    __decorate([
	        context_3.PostConstruct, 
	        __metadata('design:type', Function), 
	        __metadata('design:paramtypes', []), 
	        __metadata('design:returntype', void 0)
	    ], VirtualPageRowController.prototype, "init", null);
	    VirtualPageRowController = __decorate([
	        context_1.Bean('rowModel'), 
	        __metadata('design:paramtypes', [])
	    ], VirtualPageRowController);
	    return VirtualPageRowController;
	})();
	exports.VirtualPageRowController = VirtualPageRowController;


/***/ },
/* 65 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
	 * @version v4.0.3
	 * @link http://www.ag-grid.com/
	 * @license MIT
	 */
	var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
	    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
	    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
	    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
	    return c > 3 && r && Object.defineProperty(target, key, r), r;
	};
	var __metadata = (this && this.__metadata) || function (k, v) {
	    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
	};
	var __param = (this && this.__param) || function (paramIndex, decorator) {
	    return function (target, key) { decorator(target, key, paramIndex); }
	};
	var utils_1 = __webpack_require__(7);
	var logger_1 = __webpack_require__(5);
	var context_1 = __webpack_require__(6);
	var context_2 = __webpack_require__(6);
	/** Functionality for internal DnD functionality between GUI widgets. Eg this service is used to drag columns
	 * from the 'available columns' list and putting them into the 'grouped columns' in the tool panel.
	 * This service is NOT used by the column headers for resizing and moving, that is a different use case. */
	var OldToolPanelDragAndDropService = (function () {
	    function OldToolPanelDragAndDropService() {
	        this.destroyFunctions = [];
	    }
	    OldToolPanelDragAndDropService.prototype.agWire = function (loggerFactory) {
	        this.logger = loggerFactory.create('OldToolPanelDragAndDropService');
	        // need to clean this up, add to 'finished' logic in grid
	        var mouseUpListener = this.stopDragging.bind(this);
	        document.addEventListener('mouseup', mouseUpListener);
	        this.destroyFunctions.push(function () { document.removeEventListener('mouseup', mouseUpListener); });
	    };
	    OldToolPanelDragAndDropService.prototype.agDestroy = function () {
	        this.destroyFunctions.forEach(function (func) { return func(); });
	        document.removeEventListener('mouseup', this.mouseUpEventListener);
	    };
	    OldToolPanelDragAndDropService.prototype.stopDragging = function () {
	        if (this.dragItem) {
	            this.setDragCssClasses(this.dragItem.eDragSource, false);
	            this.dragItem = null;
	        }
	    };
	    OldToolPanelDragAndDropService.prototype.setDragCssClasses = function (eListItem, dragging) {
	        utils_1.Utils.addOrRemoveCssClass(eListItem, 'ag-dragging', dragging);
	        utils_1.Utils.addOrRemoveCssClass(eListItem, 'ag-not-dragging', !dragging);
	    };
	    OldToolPanelDragAndDropService.prototype.addDragSource = function (eDragSource, dragSourceCallback) {
	        this.setDragCssClasses(eDragSource, false);
	        eDragSource.addEventListener('mousedown', this.onMouseDownDragSource.bind(this, eDragSource, dragSourceCallback));
	    };
	    OldToolPanelDragAndDropService.prototype.onMouseDownDragSource = function (eDragSource, dragSourceCallback) {
	        if (this.dragItem) {
	            this.stopDragging();
	        }
	        var data;
	        if (dragSourceCallback.getData) {
	            data = dragSourceCallback.getData();
	        }
	        var containerId;
	        if (dragSourceCallback.getContainerId) {
	            containerId = dragSourceCallback.getContainerId();
	        }
	        this.dragItem = {
	            eDragSource: eDragSource,
	            data: data,
	            containerId: containerId
	        };
	        this.setDragCssClasses(this.dragItem.eDragSource, true);
	    };
	    OldToolPanelDragAndDropService.prototype.addDropTarget = function (eDropTarget, dropTargetCallback) {
	        var _this = this;
	        var mouseIn = false;
	        var acceptDrag = false;
	        eDropTarget.addEventListener('mouseover', function () {
	            if (!mouseIn) {
	                mouseIn = true;
	                if (_this.dragItem) {
	                    acceptDrag = dropTargetCallback.acceptDrag(_this.dragItem);
	                }
	                else {
	                    acceptDrag = false;
	                }
	            }
	        });
	        eDropTarget.addEventListener('mouseout', function () {
	            if (acceptDrag) {
	                dropTargetCallback.noDrop();
	            }
	            mouseIn = false;
	            acceptDrag = false;
	        });
	        eDropTarget.addEventListener('mouseup', function () {
	            // dragItem should never be null, checking just in case
	            if (acceptDrag && _this.dragItem) {
	                dropTargetCallback.drop(_this.dragItem);
	            }
	        });
	    };
	    __decorate([
	        __param(0, context_2.Qualifier('loggerFactory')), 
	        __metadata('design:type', Function), 
	        __metadata('design:paramtypes', [logger_1.LoggerFactory]), 
	        __metadata('design:returntype', void 0)
	    ], OldToolPanelDragAndDropService.prototype, "agWire", null);
	    OldToolPanelDragAndDropService = __decorate([
	        context_1.Bean('oldToolPanelDragAndDropService'), 
	        __metadata('design:paramtypes', [])
	    ], OldToolPanelDragAndDropService);
	    return OldToolPanelDragAndDropService;
	})();
	exports.OldToolPanelDragAndDropService = OldToolPanelDragAndDropService;


/***/ },
/* 66 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
	 * @version v4.0.3
	 * @link http://www.ag-grid.com/
	 * @license MIT
	 */
	var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
	    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
	    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
	    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
	    return c > 3 && r && Object.defineProperty(target, key, r), r;
	};
	var __metadata = (this && this.__metadata) || function (k, v) {
	    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
	};
	var context_1 = __webpack_require__(6);
	var filterManager_1 = __webpack_require__(40);
	var utils_1 = __webpack_require__(7);
	var context_2 = __webpack_require__(6);
	var popupService_1 = __webpack_require__(41);
	var gridOptionsWrapper_1 = __webpack_require__(3);
	var StandardMenuFactory = (function () {
	    function StandardMenuFactory() {
	    }
	    StandardMenuFactory.prototype.showMenu = function (column, eventSource) {
	        var filterWrapper = this.filterManager.getOrCreateFilterWrapper(column);
	        var eMenu = document.createElement('div');
	        utils_1.Utils.addCssClass(eMenu, 'ag-menu');
	        eMenu.appendChild(filterWrapper.gui);
	        // need to show filter before positioning, as only after filter
	        // is visible can we find out what the width of it is
	        var hidePopup = this.popupService.addAsModalPopup(eMenu, true);
	        this.popupService.positionPopupUnderComponent({ eventSource: eventSource, ePopup: eMenu, keepWithinBounds: true });
	        if (filterWrapper.filter.afterGuiAttached) {
	            var params = {
	                hidePopup: hidePopup,
	                eventSource: eventSource
	            };
	            filterWrapper.filter.afterGuiAttached(params);
	        }
	    };
	    StandardMenuFactory.prototype.isMenuEnabled = function (column) {
	        // for standard, we show menu if filter is enabled, and he menu is not suppressed
	        return this.gridOptionsWrapper.isEnableFilter();
	    };
	    __decorate([
	        context_2.Autowired('filterManager'), 
	        __metadata('design:type', filterManager_1.FilterManager)
	    ], StandardMenuFactory.prototype, "filterManager", void 0);
	    __decorate([
	        context_2.Autowired('popupService'), 
	        __metadata('design:type', popupService_1.PopupService)
	    ], StandardMenuFactory.prototype, "popupService", void 0);
	    __decorate([
	        context_2.Autowired('gridOptionsWrapper'), 
	        __metadata('design:type', gridOptionsWrapper_1.GridOptionsWrapper)
	    ], StandardMenuFactory.prototype, "gridOptionsWrapper", void 0);
	    StandardMenuFactory = __decorate([
	        context_1.Bean('menuFactory'), 
	        __metadata('design:paramtypes', [])
	    ], StandardMenuFactory);
	    return StandardMenuFactory;
	})();
	exports.StandardMenuFactory = StandardMenuFactory;


/***/ },
/* 67 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
	 * @version v4.0.3
	 * @link http://www.ag-grid.com/
	 * @license MIT
	 */
	var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
	    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
	    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
	    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
	    return c > 3 && r && Object.defineProperty(target, key, r), r;
	};
	var __metadata = (this && this.__metadata) || function (k, v) {
	    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
	};
	var context_1 = __webpack_require__(6);
	var context_2 = __webpack_require__(6);
	var gridOptionsWrapper_1 = __webpack_require__(3);
	var filterManager_1 = __webpack_require__(40);
	var FilterStage = (function () {
	    function FilterStage() {
	    }
	    FilterStage.prototype.execute = function (rowsToFilter) {
	        var filterActive;
	        if (this.gridOptionsWrapper.isEnableServerSideFilter()) {
	            filterActive = false;
	        }
	        else {
	            filterActive = this.filterManager.isAnyFilterPresent();
	        }
	        var result;
	        if (filterActive) {
	            result = this.filterItems(rowsToFilter);
	        }
	        else {
	            // do it here
	            result = rowsToFilter;
	            this.recursivelyResetFilter(rowsToFilter);
	        }
	        return result;
	    };
	    FilterStage.prototype.filterItems = function (rowNodes) {
	        var result = [];
	        for (var i = 0, l = rowNodes.length; i < l; i++) {
	            var node = rowNodes[i];
	            if (node.group) {
	                // deal with group
	                node.childrenAfterFilter = this.filterItems(node.children);
	                if (node.childrenAfterFilter.length > 0) {
	                    node.allChildrenCount = this.getTotalChildCount(node.childrenAfterFilter);
	                    result.push(node);
	                }
	            }
	            else {
	                if (this.filterManager.doesRowPassFilter(node)) {
	                    result.push(node);
	                }
	            }
	        }
	        return result;
	    };
	    FilterStage.prototype.recursivelyResetFilter = function (nodes) {
	        if (!nodes) {
	            return;
	        }
	        for (var i = 0, l = nodes.length; i < l; i++) {
	            var node = nodes[i];
	            if (node.group && node.children) {
	                node.childrenAfterFilter = node.children;
	                this.recursivelyResetFilter(node.children);
	                node.allChildrenCount = this.getTotalChildCount(node.childrenAfterFilter);
	            }
	        }
	    };
	    FilterStage.prototype.getTotalChildCount = function (rowNodes) {
	        var count = 0;
	        for (var i = 0, l = rowNodes.length; i < l; i++) {
	            var item = rowNodes[i];
	            if (item.group) {
	                count += item.allChildrenCount;
	            }
	            else {
	                count++;
	            }
	        }
	        return count;
	    };
	    __decorate([
	        context_2.Autowired('gridOptionsWrapper'), 
	        __metadata('design:type', gridOptionsWrapper_1.GridOptionsWrapper)
	    ], FilterStage.prototype, "gridOptionsWrapper", void 0);
	    __decorate([
	        context_2.Autowired('filterManager'), 
	        __metadata('design:type', filterManager_1.FilterManager)
	    ], FilterStage.prototype, "filterManager", void 0);
	    FilterStage = __decorate([
	        context_1.Bean('filterStage'), 
	        __metadata('design:paramtypes', [])
	    ], FilterStage);
	    return FilterStage;
	})();
	exports.FilterStage = FilterStage;


/***/ },
/* 68 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
	 * @version v4.0.3
	 * @link http://www.ag-grid.com/
	 * @license MIT
	 */
	var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
	    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
	    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
	    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
	    return c > 3 && r && Object.defineProperty(target, key, r), r;
	};
	var __metadata = (this && this.__metadata) || function (k, v) {
	    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
	};
	var context_1 = __webpack_require__(6);
	var context_2 = __webpack_require__(6);
	var gridOptionsWrapper_1 = __webpack_require__(3);
	var sortController_1 = __webpack_require__(39);
	var valueService_1 = __webpack_require__(34);
	var utils_1 = __webpack_require__(7);
	var SortStage = (function () {
	    function SortStage() {
	    }
	    SortStage.prototype.execute = function (rowsToSort) {
	        var sorting;
	        // if the sorting is already done by the server, then we should not do it here
	        if (this.gridOptionsWrapper.isEnableServerSideSorting()) {
	            sorting = false;
	        }
	        else {
	            //see if there is a col we are sorting by
	            var sortingOptions = this.sortController.getSortForRowController();
	            sorting = sortingOptions.length > 0;
	        }
	        var result = rowsToSort.slice(0);
	        if (sorting) {
	            this.sortList(result, sortingOptions);
	        }
	        else {
	            // if no sorting, set all group children after sort to the original list.
	            // note: it is important to do this, even if doing server side sorting,
	            // to allow the rows to pass to the next stage (ie set the node value
	            // childrenAfterSort)
	            this.recursivelyResetSort(result);
	        }
	        return result;
	    };
	    SortStage.prototype.sortList = function (nodes, sortOptions) {
	        // sort any groups recursively
	        for (var i = 0, l = nodes.length; i < l; i++) {
	            var node = nodes[i];
	            if (node.group && node.children) {
	                node.childrenAfterSort = node.childrenAfterFilter.slice(0);
	                this.sortList(node.childrenAfterSort, sortOptions);
	            }
	        }
	        var that = this;
	        function compare(nodeA, nodeB, column, isInverted) {
	            var valueA = that.valueService.getValue(column, nodeA);
	            var valueB = that.valueService.getValue(column, nodeB);
	            if (column.getColDef().comparator) {
	                //if comparator provided, use it
	                return column.getColDef().comparator(valueA, valueB, nodeA, nodeB, isInverted);
	            }
	            else {
	                //otherwise do our own comparison
	                return utils_1.Utils.defaultComparator(valueA, valueB);
	            }
	        }
	        nodes.sort(function (nodeA, nodeB) {
	            // Iterate columns, return the first that doesn't match
	            for (var i = 0, len = sortOptions.length; i < len; i++) {
	                var sortOption = sortOptions[i];
	                var compared = compare(nodeA, nodeB, sortOption.column, sortOption.inverter === -1);
	                if (compared !== 0) {
	                    return compared * sortOption.inverter;
	                }
	            }
	            // All matched, these are identical as far as the sort is concerned:
	            return 0;
	        });
	        this.updateChildIndexes(nodes);
	    };
	    SortStage.prototype.recursivelyResetSort = function (rowNodes) {
	        if (!rowNodes) {
	            return;
	        }
	        for (var i = 0, l = rowNodes.length; i < l; i++) {
	            var item = rowNodes[i];
	            if (item.group && item.children) {
	                item.childrenAfterSort = item.childrenAfterFilter;
	                this.recursivelyResetSort(item.children);
	            }
	        }
	        this.updateChildIndexes(rowNodes);
	    };
	    SortStage.prototype.updateChildIndexes = function (nodes) {
	        for (var j = 0; j < nodes.length; j++) {
	            var node = nodes[j];
	            node.firstChild = j === 0;
	            node.lastChild = j === nodes.length - 1;
	            node.childIndex = j;
	        }
	    };
	    __decorate([
	        context_2.Autowired('gridOptionsWrapper'), 
	        __metadata('design:type', gridOptionsWrapper_1.GridOptionsWrapper)
	    ], SortStage.prototype, "gridOptionsWrapper", void 0);
	    __decorate([
	        context_2.Autowired('sortController'), 
	        __metadata('design:type', sortController_1.SortController)
	    ], SortStage.prototype, "sortController", void 0);
	    __decorate([
	        context_2.Autowired('valueService'), 
	        __metadata('design:type', valueService_1.ValueService)
	    ], SortStage.prototype, "valueService", void 0);
	    SortStage = __decorate([
	        context_1.Bean('sortStage'), 
	        __metadata('design:paramtypes', [])
	    ], SortStage);
	    return SortStage;
	})();
	exports.SortStage = SortStage;


/***/ },
/* 69 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
	 * @version v4.0.3
	 * @link http://www.ag-grid.com/
	 * @license MIT
	 */
	var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
	    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
	    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
	    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
	    return c > 3 && r && Object.defineProperty(target, key, r), r;
	};
	var __metadata = (this && this.__metadata) || function (k, v) {
	    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
	};
	var context_1 = __webpack_require__(6);
	var rowNode_1 = __webpack_require__(19);
	var utils_1 = __webpack_require__(7);
	var gridOptionsWrapper_1 = __webpack_require__(3);
	var context_2 = __webpack_require__(6);
	var selectionController_1 = __webpack_require__(29);
	var eventService_1 = __webpack_require__(4);
	var FlattenStage = (function () {
	    function FlattenStage() {
	    }
	    FlattenStage.prototype.execute = function (rowsToFlatten) {
	        // even if not doing grouping, we do the mapping, as the client might
	        // of passed in data that already has a grouping in it somewhere
	        var result = [];
	        // putting value into a wrapper so it's passed by reference
	        var nextRowTop = { value: 0 };
	        this.recursivelyAddToRowsToDisplay(rowsToFlatten, result, nextRowTop);
	        return result;
	    };
	    FlattenStage.prototype.recursivelyAddToRowsToDisplay = function (rowsToFlatten, result, nextRowTop) {
	        if (utils_1.Utils.missingOrEmpty(rowsToFlatten)) {
	            return;
	        }
	        var groupSuppressRow = this.gridOptionsWrapper.isGroupSuppressRow();
	        for (var i = 0; i < rowsToFlatten.length; i++) {
	            var rowNode = rowsToFlatten[i];
	            var skipGroupNode = groupSuppressRow && rowNode.group;
	            if (!skipGroupNode) {
	                this.addRowNodeToRowsToDisplay(rowNode, result, nextRowTop);
	            }
	            if (rowNode.group && rowNode.expanded) {
	                this.recursivelyAddToRowsToDisplay(rowNode.childrenAfterSort, result, nextRowTop);
	                // put a footer in if user is looking for it
	                if (this.gridOptionsWrapper.isGroupIncludeFooter()) {
	                    var footerNode = this.createFooterNode(rowNode);
	                    this.addRowNodeToRowsToDisplay(footerNode, result, nextRowTop);
	                }
	            }
	        }
	    };
	    // duplicated method, it's also in floatingRowModel
	    FlattenStage.prototype.addRowNodeToRowsToDisplay = function (rowNode, result, nextRowTop) {
	        result.push(rowNode);
	        rowNode.rowHeight = this.gridOptionsWrapper.getRowHeightForNode(rowNode);
	        rowNode.rowTop = nextRowTop.value;
	        nextRowTop.value += rowNode.rowHeight;
	    };
	    FlattenStage.prototype.createFooterNode = function (groupNode) {
	        var footerNode = new rowNode_1.RowNode(this.eventService, this.gridOptionsWrapper, this.selectionController);
	        Object.keys(groupNode).forEach(function (key) {
	            footerNode[key] = groupNode[key];
	        });
	        footerNode.footer = true;
	        // get both header and footer to reference each other as siblings. this is never undone,
	        // only overwritten. so if a group is expanded, then contracted, it will have a ghost
	        // sibling - but that's fine, as we can ignore this if the header is contracted.
	        footerNode.sibling = groupNode;
	        groupNode.sibling = footerNode;
	        return footerNode;
	    };
	    __decorate([
	        context_2.Autowired('gridOptionsWrapper'), 
	        __metadata('design:type', gridOptionsWrapper_1.GridOptionsWrapper)
	    ], FlattenStage.prototype, "gridOptionsWrapper", void 0);
	    __decorate([
	        context_2.Autowired('selectionController'), 
	        __metadata('design:type', selectionController_1.SelectionController)
	    ], FlattenStage.prototype, "selectionController", void 0);
	    __decorate([
	        context_2.Autowired('eventService'), 
	        __metadata('design:type', eventService_1.EventService)
	    ], FlattenStage.prototype, "eventService", void 0);
	    FlattenStage = __decorate([
	        context_1.Bean('flattenStage'), 
	        __metadata('design:paramtypes', [])
	    ], FlattenStage);
	    return FlattenStage;
	})();
	exports.FlattenStage = FlattenStage;


/***/ },
/* 70 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
	 * @version v4.0.3
	 * @link http://www.ag-grid.com/
	 * @license MIT
	 */
	var grid_1 = __webpack_require__(2);
	function initialiseAgGridWithAngular1(angular) {
	    var angularModule = angular.module("agGrid", []);
	    angularModule.directive("agGrid", function () {
	        return {
	            restrict: "A",
	            controller: ['$element', '$scope', '$compile', '$attrs', AngularDirectiveController],
	            scope: true
	        };
	    });
	}
	exports.initialiseAgGridWithAngular1 = initialiseAgGridWithAngular1;
	function AngularDirectiveController($element, $scope, $compile, $attrs) {
	    var gridOptions;
	    var quickFilterOnScope;
	    var keyOfGridInScope = $attrs.agGrid;
	    quickFilterOnScope = keyOfGridInScope + '.quickFilterText';
	    gridOptions = $scope.$eval(keyOfGridInScope);
	    if (!gridOptions) {
	        console.warn("WARNING - grid options for ag-Grid not found. Please ensure the attribute ag-grid points to a valid object on the scope");
	        return;
	    }
	    var eGridDiv = $element[0];
	    var grid = new grid_1.Grid(eGridDiv, gridOptions, null, $scope, $compile, quickFilterOnScope);
	    $scope.$on("$destroy", function () {
	        grid.destroy();
	    });
	}


/***/ },
/* 71 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
	 * @version v4.0.3
	 * @link http://www.ag-grid.com/
	 * @license MIT
	 */
	var componentUtil_1 = __webpack_require__(9);
	var grid_1 = __webpack_require__(2);
	var registered = false;
	function initialiseAgGridWithWebComponents() {
	    // only register to WebComponents once
	    if (registered) {
	        return;
	    }
	    registered = true;
	    if (typeof document === 'undefined' || !document.registerElement) {
	        console.error('ag-Grid: unable to find document.registerElement() function, unable to initialise ag-Grid as a Web Component');
	    }
	    // i don't think this type of extension is possible in TypeScript, so back to
	    // plain Javascript to create this object
	    var AgileGridProto = Object.create(HTMLElement.prototype);
	    // wrap each property with a get and set method, so we can track when changes are done
	    componentUtil_1.ComponentUtil.ALL_PROPERTIES.forEach(function (key) {
	        Object.defineProperty(AgileGridProto, key, {
	            set: function (v) {
	                this.__agGridSetProperty(key, v);
	            },
	            get: function () {
	                return this.__agGridGetProperty(key);
	            }
	        });
	    });
	    AgileGridProto.__agGridSetProperty = function (key, value) {
	        if (!this.__attributes) {
	            this.__attributes = {};
	        }
	        this.__attributes[key] = value;
	        // keeping this consistent with the ng2 onChange, so I can reuse the handling code
	        var changeObject = {};
	        changeObject[key] = { currentValue: value };
	        this.onChange(changeObject);
	    };
	    AgileGridProto.onChange = function (changes) {
	        if (this._initialised) {
	            componentUtil_1.ComponentUtil.processOnChange(changes, this._gridOptions, this.api);
	        }
	    };
	    AgileGridProto.__agGridGetProperty = function (key) {
	        if (!this.__attributes) {
	            this.__attributes = {};
	        }
	        return this.__attributes[key];
	    };
	    AgileGridProto.setGridOptions = function (options) {
	        var globalEventListener = this.globalEventListener.bind(this);
	        this._gridOptions = componentUtil_1.ComponentUtil.copyAttributesToGridOptions(options, this);
	        this._agGrid = new grid_1.Grid(this, this._gridOptions, globalEventListener);
	        this.api = options.api;
	        this.columnApi = options.columnApi;
	        this._initialised = true;
	    };
	    // copies all the attributes into this object
	    AgileGridProto.createdCallback = function () {
	        for (var i = 0; i < this.attributes.length; i++) {
	            var attribute = this.attributes[i];
	            this.setPropertyFromAttribute(attribute);
	        }
	    };
	    AgileGridProto.setPropertyFromAttribute = function (attribute) {
	        var name = toCamelCase(attribute.nodeName);
	        var value = attribute.nodeValue;
	        if (componentUtil_1.ComponentUtil.ALL_PROPERTIES.indexOf(name) >= 0) {
	            this[name] = value;
	        }
	    };
	    AgileGridProto.attachedCallback = function (params) { };
	    AgileGridProto.detachedCallback = function (params) { };
	    AgileGridProto.attributeChangedCallback = function (attributeName) {
	        var attribute = this.attributes[attributeName];
	        this.setPropertyFromAttribute(attribute);
	    };
	    AgileGridProto.globalEventListener = function (eventType, event) {
	        var eventLowerCase = eventType.toLowerCase();
	        var browserEvent = new Event(eventLowerCase);
	        var browserEventNoType = browserEvent;
	        browserEventNoType.agGridDetails = event;
	        this.dispatchEvent(browserEvent);
	        var callbackMethod = 'on' + eventLowerCase;
	        if (typeof this[callbackMethod] === 'function') {
	            this[callbackMethod](browserEvent);
	        }
	    };
	    // finally, register
	    document.registerElement('ag-grid', { prototype: AgileGridProto });
	}
	exports.initialiseAgGridWithWebComponents = initialiseAgGridWithWebComponents;
	function toCamelCase(myString) {
	    if (typeof myString === 'string') {
	        var result = myString.replace(/-([a-z])/g, function (g) {
	            return g[1].toUpperCase();
	        });
	        return result;
	    }
	    else {
	        return myString;
	    }
	}


/***/ },
/* 72 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
	 * @version v4.0.3
	 * @link http://www.ag-grid.com/
	 * @license MIT
	 */
	var utils_1 = __webpack_require__(7);
	var TabbedLayout = (function () {
	    function TabbedLayout(params) {
	        var _this = this;
	        this.items = [];
	        this.params = params;
	        this.eGui = document.createElement('div');
	        this.eGui.innerHTML = TabbedLayout.TEMPLATE;
	        this.eHeader = this.eGui.querySelector('#tabHeader');
	        this.eBody = this.eGui.querySelector('#tabBody');
	        utils_1.Utils.addCssClass(this.eGui, params.cssClass);
	        if (params.items) {
	            params.items.forEach(function (item) { return _this.addItem(item); });
	        }
	    }
	    TabbedLayout.prototype.setAfterAttachedParams = function (params) {
	        this.afterAttachedParams = params;
	    };
	    TabbedLayout.prototype.getMinWidth = function () {
	        var eDummyContainer = document.createElement('span');
	        // position fixed, so it isn't restricted to the boundaries of the parent
	        eDummyContainer.style.position = 'fixed';
	        // we put the dummy into the body container, so it will inherit all the
	        // css styles that the real cells are inheriting
	        this.eGui.appendChild(eDummyContainer);
	        var minWidth = 0;
	        this.items.forEach(function (itemWrapper) {
	            utils_1.Utils.removeAllChildren(eDummyContainer);
	            var eClone = itemWrapper.tabbedItem.body.cloneNode(true);
	            eDummyContainer.appendChild(eClone);
	            if (minWidth < eDummyContainer.offsetWidth) {
	                minWidth = eDummyContainer.offsetWidth;
	            }
	        });
	        this.eGui.removeChild(eDummyContainer);
	        return minWidth;
	    };
	    TabbedLayout.prototype.showFirstItem = function () {
	        if (this.items.length > 0) {
	            this.showItemWrapper(this.items[0]);
	        }
	    };
	    TabbedLayout.prototype.addItem = function (item) {
	        var eHeaderButton = document.createElement('span');
	        eHeaderButton.appendChild(item.title);
	        utils_1.Utils.addCssClass(eHeaderButton, 'ag-tab');
	        this.eHeader.appendChild(eHeaderButton);
	        var wrapper = {
	            tabbedItem: item,
	            eHeaderButton: eHeaderButton
	        };
	        this.items.push(wrapper);
	        eHeaderButton.addEventListener('click', this.showItemWrapper.bind(this, wrapper));
	    };
	    TabbedLayout.prototype.showItem = function (tabbedItem) {
	        var itemWrapper = utils_1.Utils.find(this.items, function (itemWrapper) {
	            return itemWrapper.tabbedItem === tabbedItem;
	        });
	        if (itemWrapper) {
	            this.showItemWrapper(itemWrapper);
	        }
	    };
	    TabbedLayout.prototype.showItemWrapper = function (wrapper) {
	        if (this.params.onItemClicked) {
	            this.params.onItemClicked({ item: wrapper.tabbedItem });
	        }
	        if (this.activeItem === wrapper) {
	            utils_1.Utils.callIfPresent(this.params.onActiveItemClicked);
	            return;
	        }
	        utils_1.Utils.removeAllChildren(this.eBody);
	        this.eBody.appendChild(wrapper.tabbedItem.body);
	        if (this.activeItem) {
	            utils_1.Utils.removeCssClass(this.activeItem.eHeaderButton, 'ag-tab-selected');
	        }
	        utils_1.Utils.addCssClass(wrapper.eHeaderButton, 'ag-tab-selected');
	        this.activeItem = wrapper;
	        if (wrapper.tabbedItem.afterAttachedCallback) {
	            wrapper.tabbedItem.afterAttachedCallback(this.afterAttachedParams);
	        }
	    };
	    TabbedLayout.prototype.getGui = function () {
	        return this.eGui;
	    };
	    TabbedLayout.TEMPLATE = '<div>' +
	        '<div id="tabHeader" class="ag-tab-header"></div>' +
	        '<div id="tabBody" class="ag-tab-body"></div>' +
	        '</div>';
	    return TabbedLayout;
	})();
	exports.TabbedLayout = TabbedLayout;


/***/ },
/* 73 */
/***/ function(module, exports) {

	/**
	 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
	 * @version v4.0.3
	 * @link http://www.ag-grid.com/
	 * @license MIT
	 */
	var VerticalStack = (function () {
	    function VerticalStack() {
	        this.isLayoutPanel = true;
	        this.childPanels = [];
	        this.eGui = document.createElement('div');
	        this.eGui.style.height = '100%';
	    }
	    VerticalStack.prototype.addPanel = function (panel, height) {
	        var component;
	        if (panel.isLayoutPanel) {
	            this.childPanels.push(panel);
	            component = panel.getGui();
	        }
	        else {
	            component = panel;
	        }
	        if (height) {
	            component.style.height = height;
	        }
	        this.eGui.appendChild(component);
	    };
	    VerticalStack.prototype.getGui = function () {
	        return this.eGui;
	    };
	    VerticalStack.prototype.doLayout = function () {
	        for (var i = 0; i < this.childPanels.length; i++) {
	            this.childPanels[i].doLayout();
	        }
	    };
	    return VerticalStack;
	})();
	exports.VerticalStack = VerticalStack;


/***/ },
/* 74 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
	 * @version v4.0.3
	 * @link http://www.ag-grid.com/
	 * @license MIT
	 */
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
	    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
	    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
	    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
	    return c > 3 && r && Object.defineProperty(target, key, r), r;
	};
	var __metadata = (this && this.__metadata) || function (k, v) {
	    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
	};
	var component_1 = __webpack_require__(45);
	var context_1 = __webpack_require__(6);
	var popupService_1 = __webpack_require__(41);
	var utils_1 = __webpack_require__(7);
	var svgFactory_1 = __webpack_require__(36);
	var svgFactory = svgFactory_1.SvgFactory.getInstance();
	var CMenuItem = (function (_super) {
	    __extends(CMenuItem, _super);
	    function CMenuItem(params) {
	        _super.call(this, CMenuItem.TEMPLATE);
	        this.params = params;
	        if (params.checked) {
	            this.queryForHtmlElement('#eIcon').innerHTML = '&#10004;';
	        }
	        else if (params.icon) {
	            if (utils_1.Utils.isNodeOrElement(params.icon)) {
	                this.queryForHtmlElement('#eIcon').appendChild(params.icon);
	            }
	            else if (typeof params.icon === 'string') {
	                this.queryForHtmlElement('#eIcon').innerHTML = params.icon;
	            }
	            else {
	                console.log('ag-Grid: menu item icon must be DOM node or string');
	            }
	        }
	        else {
	            // if i didn't put space here, the alignment was messed up, probably
	            // fixable with CSS but i was spending to much time trying to figure
	            // it out.
	            this.queryForHtmlElement('#eIcon').innerHTML = '&nbsp;';
	        }
	        if (params.shortcut) {
	            this.queryForHtmlElement('#eShortcut').innerHTML = params.shortcut;
	        }
	        if (params.childMenu) {
	            this.queryForHtmlElement('#ePopupPointer').appendChild(svgFactory.createSmallArrowRightSvg());
	        }
	        else {
	            this.queryForHtmlElement('#ePopupPointer').innerHTML = '&nbsp;';
	        }
	        this.queryForHtmlElement('#eName').innerHTML = params.name;
	        if (params.disabled) {
	            utils_1.Utils.addCssClass(this.getGui(), 'ag-menu-option-disabled');
	        }
	        this.addGuiEventListener('click', this.onOptionSelected.bind(this));
	    }
	    CMenuItem.prototype.onOptionSelected = function () {
	        this.dispatchEvent(CMenuItem.EVENT_ITEM_SELECTED, this.params);
	        if (this.params.action) {
	            this.params.action();
	        }
	    };
	    CMenuItem.TEMPLATE = '<div class="ag-menu-option">' +
	        '  <span id="eIcon" class="ag-menu-option-icon"></span>' +
	        '  <span id="eName" class="ag-menu-option-text"></span>' +
	        '  <span id="eShortcut" class="ag-menu-option-shortcut"></span>' +
	        '  <span id="ePopupPointer" class="ag-menu-option-popup-pointer"></span>' +
	        '</div>';
	    CMenuItem.EVENT_ITEM_SELECTED = 'itemSelected';
	    __decorate([
	        context_1.Autowired('popupService'), 
	        __metadata('design:type', popupService_1.PopupService)
	    ], CMenuItem.prototype, "popupService", void 0);
	    return CMenuItem;
	})(component_1.Component);
	exports.CMenuItem = CMenuItem;


/***/ },
/* 75 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
	 * @version v4.0.3
	 * @link http://www.ag-grid.com/
	 * @license MIT
	 */
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
	    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
	    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
	    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
	    return c > 3 && r && Object.defineProperty(target, key, r), r;
	};
	var __metadata = (this && this.__metadata) || function (k, v) {
	    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
	};
	var component_1 = __webpack_require__(45);
	var utils_1 = __webpack_require__(7);
	var context_1 = __webpack_require__(6);
	var context_2 = __webpack_require__(6);
	var popupService_1 = __webpack_require__(41);
	var cMenuItem_1 = __webpack_require__(74);
	var MenuList = (function (_super) {
	    __extends(MenuList, _super);
	    function MenuList() {
	        _super.call(this, MenuList.TEMPLATE);
	        this.timerCount = 0;
	    }
	    MenuList.prototype.clearActiveItem = function () {
	        this.removeActiveItem();
	        this.removeOldChildPopup();
	    };
	    MenuList.prototype.addMenuItems = function (menuItems, defaultMenuItems) {
	        var _this = this;
	        if (utils_1.Utils.missing(menuItems)) {
	            return;
	        }
	        menuItems.forEach(function (listItem) {
	            if (listItem === 'separator') {
	                _this.addSeparator();
	            }
	            else {
	                var menuItem;
	                if (typeof listItem === 'string') {
	                    menuItem = defaultMenuItems[listItem];
	                }
	                else {
	                    menuItem = listItem;
	                }
	                _this.addItem(menuItem);
	            }
	        });
	    };
	    MenuList.prototype.addItem = function (params) {
	        var _this = this;
	        var cMenuItem = new cMenuItem_1.CMenuItem(params);
	        this.context.wireBean(cMenuItem);
	        this.getGui().appendChild(cMenuItem.getGui());
	        cMenuItem.addEventListener(cMenuItem_1.CMenuItem.EVENT_ITEM_SELECTED, function (event) {
	            if (params.childMenu) {
	                _this.showChildMenu(params, cMenuItem);
	            }
	            else {
	                _this.dispatchEvent(cMenuItem_1.CMenuItem.EVENT_ITEM_SELECTED, event);
	            }
	        });
	        cMenuItem.addGuiEventListener('mouseenter', this.mouseEnterItem.bind(this, params, cMenuItem));
	        cMenuItem.addGuiEventListener('mouseleave', function () { return _this.timerCount++; });
	        if (params.childMenu) {
	            this.addDestroyFunc(function () { return params.childMenu.destroy(); });
	        }
	    };
	    MenuList.prototype.mouseEnterItem = function (menuItemParams, menuItem) {
	        if (menuItemParams.disabled) {
	            return;
	        }
	        if (this.activeMenuItemParams !== menuItemParams) {
	            this.removeOldChildPopup();
	        }
	        this.removeActiveItem();
	        this.activeMenuItemParams = menuItemParams;
	        this.activeMenuItem = menuItem;
	        utils_1.Utils.addCssClass(this.activeMenuItem.getGui(), 'ag-menu-option-active');
	        if (menuItemParams.childMenu) {
	            this.addHoverForChildPopup(menuItemParams, menuItem);
	        }
	    };
	    MenuList.prototype.removeActiveItem = function () {
	        if (this.activeMenuItem) {
	            utils_1.Utils.removeCssClass(this.activeMenuItem.getGui(), 'ag-menu-option-active');
	            this.activeMenuItem = null;
	            this.activeMenuItemParams = null;
	        }
	    };
	    MenuList.prototype.addHoverForChildPopup = function (menuItemParams, menuItem) {
	        var _this = this;
	        var timerCountCopy = this.timerCount;
	        setTimeout(function () {
	            var shouldShow = timerCountCopy === _this.timerCount;
	            var showingThisMenu = _this.showingChildMenu === menuItemParams.childMenu;
	            if (shouldShow && !showingThisMenu) {
	                _this.showChildMenu(menuItemParams, menuItem);
	            }
	        }, 500);
	    };
	    MenuList.prototype.showChildMenu = function (menuItemParams, menuItem) {
	        this.removeOldChildPopup();
	        var ePopup = utils_1.Utils.loadTemplate('<div class="ag-menu"></div>');
	        ePopup.appendChild(menuItemParams.childMenu.getGui());
	        this.childPopupRemoveFunc = this.popupService.addAsModalPopup(ePopup, true);
	        this.popupService.positionPopupForMenu({
	            eventSource: menuItem.getGui(),
	            ePopup: ePopup
	        });
	        this.showingChildMenu = menuItemParams.childMenu;
	    };
	    MenuList.prototype.addSeparator = function () {
	        this.getGui().appendChild(utils_1.Utils.loadTemplate(MenuList.SEPARATOR_TEMPLATE));
	    };
	    MenuList.prototype.removeOldChildPopup = function () {
	        if (this.childPopupRemoveFunc) {
	            this.showingChildMenu.clearActiveItem();
	            this.childPopupRemoveFunc();
	            this.childPopupRemoveFunc = null;
	            this.showingChildMenu = null;
	        }
	    };
	    MenuList.prototype.destroy = function () {
	        this.removeOldChildPopup();
	        _super.prototype.destroy.call(this);
	    };
	    MenuList.TEMPLATE = '<div class="ag-menu-list"></div>';
	    MenuList.SEPARATOR_TEMPLATE = '<div class="ag-menu-separator">' +
	        '  <span class="ag-menu-separator-cell"></span>' +
	        '  <span class="ag-menu-separator-cell"></span>' +
	        '  <span class="ag-menu-separator-cell"></span>' +
	        '  <span class="ag-menu-separator-cell"></span>' +
	        '</div>';
	    __decorate([
	        context_1.Autowired('context'), 
	        __metadata('design:type', context_2.Context)
	    ], MenuList.prototype, "context", void 0);
	    __decorate([
	        context_1.Autowired('popupService'), 
	        __metadata('design:type', popupService_1.PopupService)
	    ], MenuList.prototype, "popupService", void 0);
	    return MenuList;
	})(component_1.Component);
	exports.MenuList = MenuList;


/***/ },
/* 76 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(77);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(79)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../node_modules/css-loader/index.js!./ag-grid.css", function() {
				var newContent = require("!!./../../node_modules/css-loader/index.js!./ag-grid.css");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 77 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(78)();
	// imports


	// module
	exports.push([module.id, "ag-grid-ng2 {\n  display: inline-block;\n}\n.ag-root {\n/* set to relative, so absolute popups appear relative to this */\n  position: relative;\n  -webkit-box-sizing: border-box;\n  -moz-box-sizing: border-box;\n  box-sizing: border-box;\n/* was getting some 'should be there' scrolls, this sorts it out */\n  overflow: hidden;\n}\n.ag-font-style {\n  cursor: default;\n  font-size: 14px;\n/* disable user mouse selection */\n  -webkit-user-select: none;\n  -moz-user-select: none;\n  -ms-user-select: none;\n  user-select: none;\n}\n.ag-no-scrolls {\n  white-space: nowrap;\n  display: inline-block;\n}\n.ag-scrolls {\n  height: 100%;\n}\n.ag-popup-backdrop {\n  position: fixed;\n  left: 0px;\n  top: 0px;\n  width: 100%;\n  height: 100%;\n}\n.ag-header {\n  position: absolute;\n  top: 0px;\n  left: 0px;\n  white-space: nowrap;\n  -webkit-box-sizing: border-box;\n  -moz-box-sizing: border-box;\n  box-sizing: border-box;\n  overflow: hidden;\n  width: 100%;\n}\n.ag-pinned-left-header {\n  float: left;\n  -webkit-box-sizing: border-box;\n  -moz-box-sizing: border-box;\n  box-sizing: border-box;\n  display: inline-block;\n  overflow: hidden;\n  height: 100%;\n}\n.ag-pinned-right-header {\n  float: right;\n  -webkit-box-sizing: border-box;\n  -moz-box-sizing: border-box;\n  box-sizing: border-box;\n  display: inline-block;\n  overflow: hidden;\n  height: 100%;\n}\n.ag-header-viewport {\n  -webkit-box-sizing: border-box;\n  -moz-box-sizing: border-box;\n  box-sizing: border-box;\n  overflow: hidden;\n  height: 100%;\n}\n.ag-scrolls .ag-header-container {\n  -webkit-box-sizing: border-box;\n  -moz-box-sizing: border-box;\n  box-sizing: border-box;\n  position: relative;\n  white-space: nowrap;\n  height: 100%;\n}\n.ag-no-scrolls .ag-header-container {\n  white-space: nowrap;\n}\n.ag-header-overlay {\n  display: block;\n  position: absolute;\n}\n.ag-header-cell {\n  -webkit-box-sizing: border-box;\n  -moz-box-sizing: border-box;\n  box-sizing: border-box;\n  vertical-align: bottom;\n  text-align: center;\n  display: inline-block;\n  height: 100%;\n}\n.ag-header-cell-ghost {\n  font-size: 14px;\n  font-family: \"Helvetica Neue\", Helvetica, Arial, sans-serif;\n  position: absolute;\n  background: #e5e5e5;\n  border: 1px solid #000;\n  cursor: move;\n  -webkit-user-select: none;\n  -moz-user-select: none;\n  -ms-user-select: none;\n  user-select: none;\n  -webkit-box-sizing: border-box;\n  -moz-box-sizing: border-box;\n  box-sizing: border-box;\n  overflow: hidden;\n  -o-text-overflow: ellipsis;\n  text-overflow: ellipsis;\n  padding: 3px;\n  line-height: 1.4;\n}\n.ag-header-cell-ghost img {\n  vertical-align: middle;\n  border: 0px;\n}\n.ag-header-cell-ghost-icon {\n  float: left;\n  padding-left: 2px;\n  padding-right: 2px;\n}\n.ag-header-group-cell {\n  height: 100%;\n  display: inline-block;\n  -webkit-box-sizing: border-box;\n  -moz-box-sizing: border-box;\n  box-sizing: border-box;\n  -o-text-overflow: ellipsis;\n  text-overflow: ellipsis;\n  overflow: hidden;\n}\n.ag-header-group-cell-label {\n  -o-text-overflow: ellipsis;\n  text-overflow: ellipsis;\n  overflow: hidden;\n}\n.ag-header-cell-label {\n  -o-text-overflow: ellipsis;\n  text-overflow: ellipsis;\n  overflow: hidden;\n}\n.ag-header-cell-resize {\n  height: 100%;\n  width: 4px;\n  float: right;\n  cursor: col-resize;\n}\n.ag-header-expand-icon {\n  padding-left: 4px;\n}\n.ag-header-cell-menu-button {\n  float: right;\n}\n.ag-overlay-panel {\n  display: table;\n  width: 100%;\n  height: 100%;\n  pointer-events: none;\n}\n.ag-overlay-wrapper {\n  display: table-cell;\n  vertical-align: middle;\n  text-align: center;\n}\n.ag-body {\n  height: 100%;\n  -webkit-box-sizing: border-box;\n  -moz-box-sizing: border-box;\n  box-sizing: border-box;\n}\n.ag-floating-top {\n  position: absolute;\n  left: 0px;\n  width: 100%;\n  white-space: nowrap;\n  -webkit-box-sizing: border-box;\n  -moz-box-sizing: border-box;\n  box-sizing: border-box;\n  overflow: hidden;\n}\n.ag-pinned-left-floating-top {\n  float: left;\n  -webkit-box-sizing: border-box;\n  -moz-box-sizing: border-box;\n  box-sizing: border-box;\n  display: inline-block;\n  overflow: hidden;\n  height: 100%;\n}\n.ag-pinned-right-floating-top {\n  float: right;\n  -webkit-box-sizing: border-box;\n  -moz-box-sizing: border-box;\n  box-sizing: border-box;\n  display: inline-block;\n  overflow: hidden;\n  height: 100%;\n}\n.ag-floating-top-viewport {\n  -webkit-box-sizing: border-box;\n  -moz-box-sizing: border-box;\n  box-sizing: border-box;\n  overflow: hidden;\n  height: 100%;\n}\n.ag-floating-top-container {\n  -webkit-box-sizing: border-box;\n  -moz-box-sizing: border-box;\n  box-sizing: border-box;\n  position: relative;\n  white-space: nowrap;\n}\n.ag-floating-bottom {\n  position: absolute;\n  left: 0px;\n  width: 100%;\n  white-space: nowrap;\n  -webkit-box-sizing: border-box;\n  -moz-box-sizing: border-box;\n  box-sizing: border-box;\n  overflow: hidden;\n}\n.ag-pinned-left-floating-bottom {\n  float: left;\n  -webkit-box-sizing: border-box;\n  -moz-box-sizing: border-box;\n  box-sizing: border-box;\n  display: inline-block;\n  overflow: hidden;\n  height: 100%;\n}\n.ag-pinned-right-floating-bottom {\n  float: right;\n  -webkit-box-sizing: border-box;\n  -moz-box-sizing: border-box;\n  box-sizing: border-box;\n  display: inline-block;\n  overflow: hidden;\n  height: 100%;\n}\n.ag-floating-bottom-viewport {\n  -webkit-box-sizing: border-box;\n  -moz-box-sizing: border-box;\n  box-sizing: border-box;\n  overflow: hidden;\n  height: 100%;\n}\n.ag-floating-bottom-container {\n  -webkit-box-sizing: border-box;\n  -moz-box-sizing: border-box;\n  box-sizing: border-box;\n  position: relative;\n  white-space: nowrap;\n}\n.ag-pinned-left-cols-viewport {\n  float: left;\n  overflow: hidden;\n}\n.ag-pinned-left-cols-container {\n  display: inline-block;\n  position: relative;\n}\n.ag-pinned-right-cols-viewport {\n  float: right;\n  overflow-x: hidden;\n  overflow-y: auto;\n}\n.ag-pinned-right-cols-container {\n  display: inline-block;\n  position: relative;\n}\n.ag-body-viewport-wrapper {\n  height: 100%;\n}\n.ag-body-viewport {\n  overflow-x: auto;\n  overflow-y: auto;\n  height: 100%;\n}\n.ag-scrolls .ag-body-container {\n  position: relative;\n  display: inline-block;\n}\n.ag-scrolls .ag-row {\n  white-space: nowrap;\n  position: absolute;\n  width: 100%;\n}\n.ag-no-scrolls .ag-row {\n  position: relative;\n}\n.agile-gird-row:hover {\n  background-color: #f0f8ff;\n}\n.ag-row-group-panel {\n  width: 100%;\n  -webkit-box-sizing: border-box;\n  -moz-box-sizing: border-box;\n  box-sizing: border-box;\n}\n.ag-cell {\n  display: inline-block;\n  white-space: nowrap;\n  height: 100%;\n  -webkit-box-sizing: border-box;\n  -moz-box-sizing: border-box;\n  box-sizing: border-box;\n  -o-text-overflow: ellipsis;\n  text-overflow: ellipsis;\n  overflow: hidden;\n  position: absolute;\n}\n.ag-group-cell-entire-row {\n  width: 100%;\n  display: inline-block;\n  white-space: nowrap;\n  height: 100%;\n  -webkit-box-sizing: border-box;\n  -moz-box-sizing: border-box;\n  box-sizing: border-box;\n  -o-text-overflow: ellipsis;\n  text-overflow: ellipsis;\n  overflow: hidden;\n}\n.ag-footer-cell-entire-row {\n  width: 100%;\n  display: inline-block;\n  white-space: nowrap;\n  height: 100%;\n  -webkit-box-sizing: border-box;\n  -moz-box-sizing: border-box;\n  box-sizing: border-box;\n  -o-text-overflow: ellipsis;\n  text-overflow: ellipsis;\n  overflow: hidden;\n}\n.ag-large .ag-root {\n  font-size: 20px;\n}\n.ag-menu {\n  position: absolute;\n  -webkit-user-select: none;\n  -moz-user-select: none;\n  -ms-user-select: none;\n  user-select: none;\n}\n.ag-menu-column-select-wrapper {\n  width: 200px;\n  height: 300px;\n}\n.ag-menu-list {\n  display: table;\n  border-collapse: collapse;\n}\n.ag-menu-option {\n  display: table-row;\n}\n.ag-menu-option-text {\n  display: table-cell;\n}\n.ag-menu-option-shortcut {\n  display: table-cell;\n}\n.ag-menu-option-icon {\n  display: table-cell;\n}\n.ag-menu-option-popup-pointer {\n  display: table-cell;\n}\n.ag-menu-separator {\n  display: table-row;\n}\n.ag-menu-separator-cell {\n  display: table-cell;\n}\n.ag-filter-list-viewport {\n  overflow-x: auto;\n  height: 200px;\n  width: 200px;\n}\n.ag-filter-list-container {\n  position: relative;\n  overflow: hidden;\n}\n.ag-filter-item {\n  -o-text-overflow: ellipsis;\n  text-overflow: ellipsis;\n  overflow: hidden;\n  white-space: nowrap;\n  position: absolute;\n}\n.ag-filter-filter {\n  width: 170px;\n  margin: 4px;\n}\n.ag-filter-select {\n  width: 110px;\n  margin: 4px 4px 0px 4px;\n}\n.ag-no-vertical-scroll .ag-scrolls {\n  height: unset;\n}\n.ag-no-vertical-scroll .ag-body {\n  height: unset;\n}\n.ag-no-vertical-scroll .ag-body-viewport-wrapper {\n  height: unset;\n}\n.ag-no-vertical-scroll .ag-body-viewport {\n  height: unset;\n}\n.ag-list-selection {\n  -webkit-user-select: none;\n  -moz-user-select: none;\n  -ms-user-select: none;\n  user-select: none;\n  cursor: default;\n}\n.ag-tool-panel {\n  width: 200px;\n  -webkit-user-select: none;\n  -moz-user-select: none;\n  -ms-user-select: none;\n  user-select: none;\n  cursor: default;\n  height: 100%;\n  -webkit-box-sizing: border-box;\n  -moz-box-sizing: border-box;\n  box-sizing: border-box;\n}\n.ag-column-select-indent {\n  display: inline-block;\n}\n.ag-column-select-column {\n  margin-left: 14px;\n  white-space: nowrap;\n}\n.ag-column-select-column-group {\n  white-space: nowrap;\n}\n.ag-column-select-panel {\n  height: 100%;\n  overflow: auto;\n}\n.ag-hidden {\n  display: none;\n}\n.ag-faded {\n  opacity: 0.3;\n  -ms-filter: \"progid:DXImageTransform.Microsoft.Alpha(Opacity=30)\";\n  filter: alpha(opacity=30);\n}\n.ag-shake-left-to-right {\n  -webkit-animation-name: ag-shake-left-to-right;\n  -moz-animation-name: ag-shake-left-to-right;\n  -o-animation-name: ag-shake-left-to-right;\n  -ms-animation-name: ag-shake-left-to-right;\n  animation-name: ag-shake-left-to-right;\n  -webkit-animation-duration: 0.2s;\n  -moz-animation-duration: 0.2s;\n  -o-animation-duration: 0.2s;\n  -ms-animation-duration: 0.2s;\n  animation-duration: 0.2s;\n  -webkit-animation-iteration-count: infinite;\n  -moz-animation-iteration-count: infinite;\n  -o-animation-iteration-count: infinite;\n  -ms-animation-iteration-count: infinite;\n  animation-iteration-count: infinite;\n  -webkit-animation-direction: alternate;\n  -moz-animation-direction: alternate;\n  -o-animation-direction: alternate;\n  -ms-animation-direction: alternate;\n  animation-direction: alternate;\n}\n@-moz-keyframes ag-shake-left-to-right {\n  from {\n    padding-left: 6px;\n    padding-right: 2px;\n  }\n  to {\n    padding-left: 2px;\n    padding-right: 6px;\n  }\n}\n@-webkit-keyframes ag-shake-left-to-right {\n  from {\n    padding-left: 6px;\n    padding-right: 2px;\n  }\n  to {\n    padding-left: 2px;\n    padding-right: 6px;\n  }\n}\n@-o-keyframes ag-shake-left-to-right {\n  from {\n    padding-left: 6px;\n    padding-right: 2px;\n  }\n  to {\n    padding-left: 2px;\n    padding-right: 6px;\n  }\n}\n@keyframes ag-shake-left-to-right {\n  from {\n    padding-left: 6px;\n    padding-right: 2px;\n  }\n  to {\n    padding-left: 2px;\n    padding-right: 6px;\n  }\n}\n", ""]);

	// exports


/***/ },
/* 78 */
/***/ function(module, exports) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	// css base code, injected by the css-loader
	module.exports = function() {
		var list = [];

		// return the list of modules as css string
		list.toString = function toString() {
			var result = [];
			for(var i = 0; i < this.length; i++) {
				var item = this[i];
				if(item[2]) {
					result.push("@media " + item[2] + "{" + item[1] + "}");
				} else {
					result.push(item[1]);
				}
			}
			return result.join("");
		};

		// import a list of modules into the list
		list.i = function(modules, mediaQuery) {
			if(typeof modules === "string")
				modules = [[null, modules, ""]];
			var alreadyImportedModules = {};
			for(var i = 0; i < this.length; i++) {
				var id = this[i][0];
				if(typeof id === "number")
					alreadyImportedModules[id] = true;
			}
			for(i = 0; i < modules.length; i++) {
				var item = modules[i];
				// skip already imported module
				// this implementation is not 100% perfect for weird media query combinations
				//  when a module is imported multiple times with different media queries.
				//  I hope this will never occur (Hey this way we have smaller bundles)
				if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
					if(mediaQuery && !item[2]) {
						item[2] = mediaQuery;
					} else if(mediaQuery) {
						item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
					}
					list.push(item);
				}
			}
		};
		return list;
	};


/***/ },
/* 79 */
/***/ function(module, exports, __webpack_require__) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	var stylesInDom = {},
		memoize = function(fn) {
			var memo;
			return function () {
				if (typeof memo === "undefined") memo = fn.apply(this, arguments);
				return memo;
			};
		},
		isOldIE = memoize(function() {
			return /msie [6-9]\b/.test(window.navigator.userAgent.toLowerCase());
		}),
		getHeadElement = memoize(function () {
			return document.head || document.getElementsByTagName("head")[0];
		}),
		singletonElement = null,
		singletonCounter = 0,
		styleElementsInsertedAtTop = [];

	module.exports = function(list, options) {
		if(false) {
			if(typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
		}

		options = options || {};
		// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
		// tags it will allow on a page
		if (typeof options.singleton === "undefined") options.singleton = isOldIE();

		// By default, add <style> tags to the bottom of <head>.
		if (typeof options.insertAt === "undefined") options.insertAt = "bottom";

		var styles = listToStyles(list);
		addStylesToDom(styles, options);

		return function update(newList) {
			var mayRemove = [];
			for(var i = 0; i < styles.length; i++) {
				var item = styles[i];
				var domStyle = stylesInDom[item.id];
				domStyle.refs--;
				mayRemove.push(domStyle);
			}
			if(newList) {
				var newStyles = listToStyles(newList);
				addStylesToDom(newStyles, options);
			}
			for(var i = 0; i < mayRemove.length; i++) {
				var domStyle = mayRemove[i];
				if(domStyle.refs === 0) {
					for(var j = 0; j < domStyle.parts.length; j++)
						domStyle.parts[j]();
					delete stylesInDom[domStyle.id];
				}
			}
		};
	}

	function addStylesToDom(styles, options) {
		for(var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];
			if(domStyle) {
				domStyle.refs++;
				for(var j = 0; j < domStyle.parts.length; j++) {
					domStyle.parts[j](item.parts[j]);
				}
				for(; j < item.parts.length; j++) {
					domStyle.parts.push(addStyle(item.parts[j], options));
				}
			} else {
				var parts = [];
				for(var j = 0; j < item.parts.length; j++) {
					parts.push(addStyle(item.parts[j], options));
				}
				stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
			}
		}
	}

	function listToStyles(list) {
		var styles = [];
		var newStyles = {};
		for(var i = 0; i < list.length; i++) {
			var item = list[i];
			var id = item[0];
			var css = item[1];
			var media = item[2];
			var sourceMap = item[3];
			var part = {css: css, media: media, sourceMap: sourceMap};
			if(!newStyles[id])
				styles.push(newStyles[id] = {id: id, parts: [part]});
			else
				newStyles[id].parts.push(part);
		}
		return styles;
	}

	function insertStyleElement(options, styleElement) {
		var head = getHeadElement();
		var lastStyleElementInsertedAtTop = styleElementsInsertedAtTop[styleElementsInsertedAtTop.length - 1];
		if (options.insertAt === "top") {
			if(!lastStyleElementInsertedAtTop) {
				head.insertBefore(styleElement, head.firstChild);
			} else if(lastStyleElementInsertedAtTop.nextSibling) {
				head.insertBefore(styleElement, lastStyleElementInsertedAtTop.nextSibling);
			} else {
				head.appendChild(styleElement);
			}
			styleElementsInsertedAtTop.push(styleElement);
		} else if (options.insertAt === "bottom") {
			head.appendChild(styleElement);
		} else {
			throw new Error("Invalid value for parameter 'insertAt'. Must be 'top' or 'bottom'.");
		}
	}

	function removeStyleElement(styleElement) {
		styleElement.parentNode.removeChild(styleElement);
		var idx = styleElementsInsertedAtTop.indexOf(styleElement);
		if(idx >= 0) {
			styleElementsInsertedAtTop.splice(idx, 1);
		}
	}

	function createStyleElement(options) {
		var styleElement = document.createElement("style");
		styleElement.type = "text/css";
		insertStyleElement(options, styleElement);
		return styleElement;
	}

	function createLinkElement(options) {
		var linkElement = document.createElement("link");
		linkElement.rel = "stylesheet";
		insertStyleElement(options, linkElement);
		return linkElement;
	}

	function addStyle(obj, options) {
		var styleElement, update, remove;

		if (options.singleton) {
			var styleIndex = singletonCounter++;
			styleElement = singletonElement || (singletonElement = createStyleElement(options));
			update = applyToSingletonTag.bind(null, styleElement, styleIndex, false);
			remove = applyToSingletonTag.bind(null, styleElement, styleIndex, true);
		} else if(obj.sourceMap &&
			typeof URL === "function" &&
			typeof URL.createObjectURL === "function" &&
			typeof URL.revokeObjectURL === "function" &&
			typeof Blob === "function" &&
			typeof btoa === "function") {
			styleElement = createLinkElement(options);
			update = updateLink.bind(null, styleElement);
			remove = function() {
				removeStyleElement(styleElement);
				if(styleElement.href)
					URL.revokeObjectURL(styleElement.href);
			};
		} else {
			styleElement = createStyleElement(options);
			update = applyToTag.bind(null, styleElement);
			remove = function() {
				removeStyleElement(styleElement);
			};
		}

		update(obj);

		return function updateStyle(newObj) {
			if(newObj) {
				if(newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap)
					return;
				update(obj = newObj);
			} else {
				remove();
			}
		};
	}

	var replaceText = (function () {
		var textStore = [];

		return function (index, replacement) {
			textStore[index] = replacement;
			return textStore.filter(Boolean).join('\n');
		};
	})();

	function applyToSingletonTag(styleElement, index, remove, obj) {
		var css = remove ? "" : obj.css;

		if (styleElement.styleSheet) {
			styleElement.styleSheet.cssText = replaceText(index, css);
		} else {
			var cssNode = document.createTextNode(css);
			var childNodes = styleElement.childNodes;
			if (childNodes[index]) styleElement.removeChild(childNodes[index]);
			if (childNodes.length) {
				styleElement.insertBefore(cssNode, childNodes[index]);
			} else {
				styleElement.appendChild(cssNode);
			}
		}
	}

	function applyToTag(styleElement, obj) {
		var css = obj.css;
		var media = obj.media;
		var sourceMap = obj.sourceMap;

		if(media) {
			styleElement.setAttribute("media", media)
		}

		if(styleElement.styleSheet) {
			styleElement.styleSheet.cssText = css;
		} else {
			while(styleElement.firstChild) {
				styleElement.removeChild(styleElement.firstChild);
			}
			styleElement.appendChild(document.createTextNode(css));
		}
	}

	function updateLink(linkElement, obj) {
		var css = obj.css;
		var media = obj.media;
		var sourceMap = obj.sourceMap;

		if(sourceMap) {
			// http://stackoverflow.com/a/26603875
			css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
		}

		var blob = new Blob([css], { type: "text/css" });

		var oldSrc = linkElement.href;

		linkElement.href = URL.createObjectURL(blob);

		if(oldSrc)
			URL.revokeObjectURL(oldSrc);
	}


/***/ },
/* 80 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(81);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(79)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../node_modules/css-loader/index.js!./theme-blue.css", function() {
				var newContent = require("!!./../../node_modules/css-loader/index.js!./theme-blue.css");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 81 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(78)();
	// imports


	// module
	exports.push([module.id, ".ag-blue {\n  line-height: 1.4;\n}\n.ag-blue img {\n  vertical-align: middle;\n  border: 0px;\n}\n.ag-blue .ag-root {\n  border: 1px solid #9bc2e6;\n  font: 10pt Calibri, \"Segoe UI\", Thonburi, Arial, Verdana, sans-serif;\n}\n.ag-blue .ag-row-group-cell {\n  background: #5b9bd5;\n  border: 1px solid #808080;\n  padding: 2px;\n}\n.ag-blue .ag-row-group-cell-ghost {\n  opacity: 0.5;\n  -ms-filter: \"progid:DXImageTransform.Microsoft.Alpha(Opacity=50)\";\n  filter: alpha(opacity=50);\n}\n.ag-blue .ag-row-group-cell-text {\n  padding-left: 2px;\n  padding-right: 2px;\n}\n.ag-blue .ag-row-group-cell-button {\n  border: 1px solid transparent;\n  padding-left: 2px;\n  padding-right: 2px;\n  -webkit-border-radius: 3px;\n  border-radius: 3px;\n}\n.ag-blue .ag-row-group-cell-button:hover {\n  border: 1px solid #000;\n}\n.ag-blue .ag-row-group-empty-message {\n  padding-left: 2px;\n  padding-right: 2px;\n  border: 1px solid transparent;\n  color: #808080;\n}\n.ag-blue .ag-row-group-icon {\n  padding-right: 4px;\n}\n.ag-blue .ag-row-group-panel {\n  border-top: 1px solid #9bc2e6;\n  border-left: 1px solid #9bc2e6;\n  border-right: 1px solid #9bc2e6;\n  padding: 4px;\n  background-color: #ddebf7;\n  color: #fff;\n}\n.ag-blue .ag-cell {\n  top: -1px;\n  padding-left: 2px;\n  padding-right: 2px;\n  overflow: hidden;\n  white-space: nowrap;\n  letter-spacing: -0.02em;\n}\n.ag-blue .ag-cell-range-selected-1:not(.ag-cell-focus) {\n  background-color: rgba(120,120,120,0.4);\n}\n.ag-blue .ag-cell-range-selected-2:not(.ag-cell-focus) {\n  background-color: rgba(80,80,80,0.4);\n}\n.ag-blue .ag-cell-range-selected-3:not(.ag-cell-focus) {\n  background-color: rgba(40,40,40,0.4);\n}\n.ag-blue .ag-cell-range-selected-4:not(.ag-cell-focus) {\n  background-color: rgba(0,0,0,0.4);\n}\n.ag-blue .ag-column-moving .ag-cell {\n  -webkit-transition: left 0.2s;\n  -moz-transition: left 0.2s;\n  -o-transition: left 0.2s;\n  -ms-transition: left 0.2s;\n  transition: left 0.2s;\n}\n.ag-blue .ag-cell-focus {\n  background: #fff;\n  border: 2px solid #217346;\n}\n.ag-blue .ag-cell-no-focus {\n  border-right: 1px dotted #9bc2e6;\n  border-top: 2px solid transparent;\n  border-left: 2px solid transparent;\n  border-bottom: 1px solid #9bc2e6;\n}\n.ag-blue .ag-cell-first-right-pinned {\n  border-left: 1px solid #9bc2e6;\n}\n.ag-blue .ag-cell-last-left-pinned {\n  border-right: 1px solid #9bc2e6;\n}\n.ag-blue .ag-cell-highlight {\n  border: 1px solid #006400;\n}\n.ag-blue .ag-cell-highlight-animation {\n  -webkit-transition: border 1s;\n  -moz-transition: border 1s;\n  -o-transition: border 1s;\n  -ms-transition: border 1s;\n  transition: border 1s;\n}\n.ag-blue .ag-header {\n  background-color: #5b9bd5;\n  border-bottom: 1px solid #9bc2e6;\n}\n.ag-blue .ag-no-scrolls .ag-header-container {\n  background-color: #5b9bd5;\n  border-bottom: 1px solid #9bc2e6;\n}\n.ag-blue .ag-header-cell {\n  border-right: 1px solid #9bc2e6;\n}\n.ag-blue .ag-header-cell-moving .ag-header-cell-label {\n  opacity: 0;\n  -ms-filter: \"progid:DXImageTransform.Microsoft.Alpha(Opacity=0)\";\n  filter: alpha(opacity=0);\n}\n.ag-blue .ag-header-cell-moving-clone {\n  border-right: 1px solid #808080;\n  border-left: 1px solid #808080;\n  background-color: rgba(91,155,213,0.8);\n}\n.ag-blue .ag-header-cell-moving {\n  background-color: #9bc2e6;\n}\n.ag-blue .ag-header-group-cell {\n  border-right: 1px solid #9bc2e6;\n}\n.ag-blue .ag-header-group-cell-with-group {\n  border-bottom: 1px solid #9bc2e6;\n}\n.ag-blue .ag-pinned-right-header {\n  border-left: 1px solid #9bc2e6;\n}\n.ag-blue .ag-header-cell-label {\n  padding: 4px 2px 4px 2px;\n  font-weight: bold;\n  color: #fff;\n}\n.ag-blue .ag-header-cell-text {\n  padding-left: 2px;\n}\n.ag-blue .ag-header-group-cell-label {\n  padding: 4px;\n  font-weight: bold;\n  color: #fff;\n  padding-left: 10px;\n}\n.ag-blue .ag-header-group-text {\n  margin-right: 2px;\n}\n.ag-blue .ag-header-cell-menu-button {\n  color: #fff;\n  border: 1px solid #a6acb3;\n  padding: 2px;\n  margin-top: 3px;\n  -webkit-border-radius: 3px;\n  border-radius: 3px;\n  -webkit-box-sizing: content-box;\n  -moz-box-sizing: content-box;\n  box-sizing: content-box;\n  line-height: 0px; /* normal line height, a space was appearing below the menu button */\n/* When using bootstrap, box-sizing was set to 'border-box' */\n}\n.ag-blue .ag-header-icon {\n  color: #fff;\n  stroke: #fff;\n  fill: #fff;\n}\n.ag-blue .ag-dark .ag-header-expand-icon:hover {\n  cursor: pointer;\n}\n.ag-blue .ag-row-odd {\n  background-color: #ddebf7;\n}\n.ag-blue .ag-row-even {\n  background-color: #fff;\n}\n.ag-blue .ag-overlay-loading-wrapper {\n  background-color: rgba(255,255,255,0.5);\n}\n.ag-blue .ag-overlay-loading-center {\n  background-color: #fff;\n  border: 1px solid #a9a9a9;\n  -webkit-border-radius: 10px;\n  border-radius: 10px;\n  padding: 10px;\n}\n.ag-blue .ag-body {\n  background-color: #fafafa;\n}\n.ag-blue .ag-row-selected {\n  background-color: #c7c7c7;\n}\n.ag-blue .ag-group-cell-entire-row {\n  background-color: #fff;\n  font-weight: bold;\n  padding: 2px 4px;\n  border-bottom: solid 1px #9bc2e6;\n  overflow: hidden;\n  white-space: nowrap;\n}\n.ag-blue .ag-footer-cell-entire-row {\n  background-color: #fff;\n  font-weight: bold;\n  padding: 4px;\n  border-bottom: solid 1px #9bc2e6;\n}\n.ag-blue .ag-group-cell {\n  font-style: italic;\n}\n.ag-blue .ag-group-expand {\n  padding-right: 2px;\n}\n.ag-blue .ag-footer-cell {\n  font-style: italic;\n}\n.ag-blue .ag-menu {\n  border: 1px solid #7070a0;\n  background-color: #f0f0f0;\n  cursor: default;\n  font-family: \"Helvetica Neue\", Helvetica, Arial, sans-serif;\n  font-size: 14px;\n}\n.ag-blue .ag-menu .ag-tab-header {\n  background-color: #5b9bd5;\n}\n.ag-blue .ag-menu .ag-tab {\n  padding: 6px 8px 6px 8px;\n  margin: 2px 2px 0px 2px;\n  display: inline-block;\n  border-right: 1px solid transparent;\n  border-left: 1px solid transparent;\n  border-top: 1px solid transparent;\n  border-top-right-radius: 2px;\n  border-top-left-radius: 2px;\n}\n.ag-blue .ag-menu .ag-tab-selected {\n  background-color: #9bc2e6;\n  border-right: 1px solid #7070a0;\n  border-left: 1px solid #7070a0;\n  border-top: 1px solid #7070a0;\n}\n.ag-blue .ag-menu-separator {\n  border-top: 1px solid #d3d3d3;\n}\n.ag-blue .ag-menu-option-active {\n  background-color: #bde2e5;\n}\n.ag-blue .ag-menu-option-icon {\n  padding: 2px 4px 2px 4px;\n  vertical-align: middle;\n}\n.ag-blue .ag-menu-option-text {\n  padding: 2px 4px 2px 4px;\n  vertical-align: middle;\n}\n.ag-blue .ag-menu-option-shortcut {\n  padding: 2px 2px 2px 20px;\n  vertical-align: middle;\n}\n.ag-blue .ag-menu-option-popup-pointer {\n  padding: 2px 4px 2px 4px;\n  vertical-align: middle;\n}\n.ag-blue .ag-menu-option-disabled {\n  opacity: 0.5;\n  -ms-filter: \"progid:DXImageTransform.Microsoft.Alpha(Opacity=50)\";\n  filter: alpha(opacity=50);\n}\n.ag-blue .ag-menu-column-select-wrapper {\n  margin: 2px;\n}\n.ag-blue .ag-filter-checkbox {\n  position: relative;\n  top: 2px;\n  left: 2px;\n  padding-right: 2px;\n}\n.ag-blue .ag-filter-header-container {\n  border-bottom: 1px solid #d3d3d3;\n  font: 10pt Calibri, \"Segoe UI\", Thonburi, Arial, Verdana, sans-serif;\n}\n.ag-blue .ag-filter-apply-panel {\n  border-top: 1px solid #d3d3d3;\n  padding: 2px;\n}\n.ag-blue .ag-filter-filter {\n  background-color: #fff;\n  border: 1px solid #c6c6c6;\n  width: 192px;\n}\n.ag-blue .ag-filter-value {\n  margin-left: 4px;\n}\n.ag-blue .ag-filter-value:hover {\n  background-color: #39f;\n  border: 1px dotted #000;\n  color: #fff;\n}\n.ag-blue .ag-selection-checkbox {\n  margin-left: 4px;\n}\n.ag-blue .ag-paging-panel {\n  padding: 4px;\n}\n.ag-blue .ag-paging-button {\n  margin-left: 4px;\n  margin-right: 4px;\n}\n.ag-blue .ag-paging-row-summary-panel {\n  display: inline-block;\n  width: 300px;\n}\n.ag-blue .ag-tool-panel {\n  background-color: #eee;\n  border-right: 1px solid #9bc2e6;\n  border-bottom: 1px solid #9bc2e6;\n  border-top: 1px solid #9bc2e6;\n}\n.ag-blue .ag-status-bar {\n  font-size: 12px;\n  height: 20px;\n  border-bottom: 1px solid #9bc2e6;\n  border-left: 1px solid #9bc2e6;\n  border-right: 1px solid #9bc2e6;\n  background-color: #ddebf7;\n  color: #fff;\n}\n.ag-blue .ag-status-bar-aggregations {\n  float: right;\n}\n.ag-blue .ag-status-bar-item {\n  padding-left: 10px;\n}\n", ""]);

	// exports


/***/ },
/* 82 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(83);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(79)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../node_modules/css-loader/index.js!./theme-dark.css", function() {
				var newContent = require("!!./../../node_modules/css-loader/index.js!./theme-dark.css");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 83 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(78)();
	// imports


	// module
	exports.push([module.id, ".ag-dark {\n  line-height: 1.4;\n}\n.ag-dark img {\n  vertical-align: middle;\n  border: 0px;\n}\n.ag-dark .ag-root {\n  border: 1px solid #808080;\n  color: #e0e0e0;\n  font-family: \"Helvetica Neue\", Helvetica, Arial, sans-serif;\n}\n.ag-dark .ag-row-group-cell {\n  background: #430000;\n  border: 1px solid #808080;\n  padding: 2px;\n}\n.ag-dark .ag-row-group-cell-ghost {\n  opacity: 0.3;\n  -ms-filter: \"progid:DXImageTransform.Microsoft.Alpha(Opacity=30)\";\n  filter: alpha(opacity=30);\n}\n.ag-dark .ag-row-group-cell-text {\n  padding-left: 2px;\n  padding-right: 2px;\n}\n.ag-dark .ag-row-group-cell-button {\n  border: 1px solid transparent;\n  padding-left: 2px;\n  padding-right: 2px;\n  -webkit-border-radius: 3px;\n  border-radius: 3px;\n}\n.ag-dark .ag-row-group-cell-button:hover {\n  border: 1px solid #808080;\n}\n.ag-dark .ag-row-group-empty-message {\n  padding-left: 2px;\n  padding-right: 2px;\n  border: 1px solid transparent;\n  color: #909090;\n}\n.ag-dark .ag-row-group-icon {\n  padding-right: 4px;\n}\n.ag-dark .ag-row-group-panel {\n  border-top: 1px solid #808080;\n  border-left: 1px solid #808080;\n  border-right: 1px solid #808080;\n  padding: 4px;\n  background-color: #403e3e;\n  color: #e0e0e0;\n}\n.ag-dark .ag-cell {\n  border-right: 1px solid #808080;\n  padding: 2px;\n}\n.ag-dark .ag-cell-range-selected-1:not(.ag-cell-focus) {\n  background-color: rgba(100,160,160,0.4);\n}\n.ag-dark .ag-cell-range-selected-2:not(.ag-cell-focus) {\n  background-color: rgba(100,190,190,0.4);\n}\n.ag-dark .ag-cell-range-selected-3:not(.ag-cell-focus) {\n  background-color: rgba(100,220,220,0.4);\n}\n.ag-dark .ag-cell-range-selected-4:not(.ag-cell-focus) {\n  background-color: rgba(100,250,250,0.4);\n}\n.ag-dark .ag-column-moving .ag-cell {\n  -webkit-transition: left 0.2s;\n  -moz-transition: left 0.2s;\n  -o-transition: left 0.2s;\n  -ms-transition: left 0.2s;\n  transition: left 0.2s;\n}\n.ag-dark .ag-cell-focus {\n  border: 1px solid #a9a9a9;\n}\n.ag-dark .ag-cell-no-focus {\n  border-right: 1px dotted #808080;\n  border-top: 1px solid transparent;\n  border-left: 1px solid transparent;\n  border-bottom: 1px solid transparent;\n}\n.ag-dark .ag-cell-first-right-pinned {\n  border-left: 1px solid #808080;\n}\n.ag-dark .ag-cell-last-left-pinned {\n  border-right: 1px solid #808080;\n}\n.ag-dark .ag-cell-highlight {\n  border: 1px solid #90ee90;\n}\n.ag-dark .ag-cell-highlight-animation {\n  -webkit-transition: border 1s;\n  -moz-transition: border 1s;\n  -o-transition: border 1s;\n  -ms-transition: border 1s;\n  transition: border 1s;\n}\n.ag-dark .ag-header {\n  background-color: #430000;\n  border-bottom: 1px solid #808080;\n}\n.ag-dark .ag-no-scrolls .ag-header-container {\n  background-color: #430000;\n  border-bottom: 1px solid #808080;\n}\n.ag-dark .ag-header-cell {\n  border-right: 1px solid #808080;\n}\n.ag-dark .ag-header-cell-moving .ag-header-cell-label {\n  opacity: 0;\n  -ms-filter: \"progid:DXImageTransform.Microsoft.Alpha(Opacity=0)\";\n  filter: alpha(opacity=0);\n}\n.ag-dark .ag-header-cell-moving-clone {\n  border-right: 1px solid #808080;\n  border-left: 1px solid #808080;\n  background-color: rgba(43,0,0,0.8);\n}\n.ag-dark .ag-header-cell-moving {\n  background-color: #808080;\n}\n.ag-dark .ag-pinned-right-header {\n  border-left: 1px solid #808080;\n}\n.ag-dark .ag-header-cell-label {\n  padding: 4px 2px 4px 2px;\n}\n.ag-dark .ag-header-cell-text {\n  padding: 2px;\n}\n.ag-dark .ag-header-group-cell-label {\n  font-weight: bold;\n  padding: 4px;\n  padding-left: 10px;\n}\n.ag-dark .ag-header-group-cell {\n  border-right: 1px solid #808080;\n}\n.ag-dark .ag-header-group-text {\n  margin-right: 2px;\n}\n.ag-dark .ag-header-group-cell-with-group {\n  border-bottom: 1px solid #808080;\n}\n.ag-dark .ag-header-cell-menu-button {\n  padding: 2px;\n  margin-top: 4px;\n  border: 1px solid transparent;\n  -webkit-border-radius: 3px;\n  border-radius: 3px;\n  -webkit-box-sizing: content-box;\n  -moz-box-sizing: content-box;\n  box-sizing: content-box; /* When using bootstrap, box-sizing was set to 'border-box' */\n  line-height: 0px; /* normal line height, a space was appearing below the menu button */\n}\n.ag-dark .ag-header-cell-menu-button:hover {\n  border: 1px solid #e0e0e0;\n}\n.ag-dark .ag-header-icon {\n  stroke: #e0e0e0;\n  fill: #e0e0e0;\n}\n.ag-dark .ag-header-expand-icon:hover {\n  cursor: pointer;\n}\n.ag-dark .ag-row-odd {\n  background-color: #302e2e;\n}\n.ag-dark .ag-row-even {\n  background-color: #403e3e;\n}\n.ag-dark .ag-overlay-loading-wrapper {\n  background-color: rgba(255,255,255,0.5);\n}\n.ag-dark .ag-overlay-loading-center {\n  background-color: #fff;\n  border: 1px solid #a9a9a9;\n  -webkit-border-radius: 10px;\n  border-radius: 10px;\n  padding: 10px;\n  color: #000;\n}\n.ag-dark .ag-body {\n  background-color: #ddd;\n}\n.ag-dark .ag-row-selected {\n  background-color: #000;\n}\n.ag-dark .ag-group-cell-entire-row {\n  background-color: #aaa;\n  color: 222;\n  padding: 4px;\n}\n.ag-dark .ag-footer-cell-entire-row {\n  background-color: #aaa;\n  color: 222;\n  padding: 4px;\n}\n.ag-dark .ag-group-cell {\n  font-style: italic;\n}\n.ag-dark .ag-group-expand {\n  padding-right: 2px;\n}\n.ag-dark .ag-footer-cell {\n  font-style: italic;\n}\n.ag-dark .ag-menu {\n  border: 1px solid #555;\n  background-color: #f0f0f0;\n  cursor: default;\n  font-family: \"Helvetica Neue\", Helvetica, Arial, sans-serif;\n  font-size: 14px;\n}\n.ag-dark .ag-menu .ag-tab-header {\n  background-color: #430000;\n}\n.ag-dark .ag-menu .ag-tab {\n  padding: 6px 8px 6px 8px;\n  margin: 2px 2px 0px 2px;\n  display: inline-block;\n  border-right: 1px solid transparent;\n  border-left: 1px solid transparent;\n  border-top: 1px solid transparent;\n  border-top-right-radius: 2px;\n  border-top-left-radius: 2px;\n}\n.ag-dark .ag-menu .ag-tab-selected {\n  background-color: #403e3e;\n  border-right: 1px solid #555;\n  border-left: 1px solid #555;\n  border-top: 1px solid #555;\n}\n.ag-dark .ag-menu-separator {\n  border-top: 1px solid #d3d3d3;\n}\n.ag-dark .ag-menu-option-active {\n  background-color: #bde2e5;\n}\n.ag-dark .ag-menu-option-icon {\n  padding: 2px 4px 2px 4px;\n  vertical-align: middle;\n}\n.ag-dark .ag-menu-option-text {\n  padding: 2px 4px 2px 4px;\n  vertical-align: middle;\n}\n.ag-dark .ag-menu-option-shortcut {\n  padding: 2px 2px 2px 20px;\n  vertical-align: middle;\n}\n.ag-dark .ag-menu-option-popup-pointer {\n  padding: 2px 4px 2px 4px;\n  vertical-align: middle;\n}\n.ag-dark .ag-menu-option-disabled {\n  opacity: 0.5;\n  -ms-filter: \"progid:DXImageTransform.Microsoft.Alpha(Opacity=50)\";\n  filter: alpha(opacity=50);\n}\n.ag-dark .ag-menu-column-select-wrapper {\n  margin: 2px;\n}\n.ag-dark .ag-filter-checkbox {\n  position: relative;\n  top: 2px;\n  left: 2px;\n}\n.ag-dark .ag-filter-header-container {\n  border-bottom: 1px solid #d3d3d3;\n}\n.ag-dark .ag-filter-header-container {\n  border-bottom: 1px solid #d3d3d3;\n}\n.ag-dark .ag-filter-apply-panel {\n  border-top: 1px solid #d3d3d3;\n  padding: 2px;\n}\n.ag-dark .ag-selection-checkbox {\n  margin-left: 4px;\n}\n.ag-dark .ag-paging-panel {\n  color: #000;\n  padding: 4px;\n}\n.ag-dark .ag-paging-button {\n  margin-left: 4px;\n  margin-right: 4px;\n}\n.ag-dark .ag-paging-row-summary-panel {\n  display: inline-block;\n  width: 300px;\n}\n.ag-dark .ag-tool-panel {\n  background-color: #eee;\n  border-right: 1px solid #808080;\n  border-bottom: 1px solid #808080;\n  border-top: 1px solid #808080;\n}\n.ag-dark .ag-status-bar {\n  font-size: 12px;\n  height: 20px;\n  border-bottom: 1px solid #808080;\n  border-left: 1px solid #808080;\n  border-right: 1px solid #808080;\n  padding: 2px;\n  background-color: #403e3e;\n  color: #e0e0e0;\n}\n.ag-dark .ag-status-bar-aggregations {\n  float: right;\n}\n", ""]);

	// exports


/***/ },
/* 84 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(85);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(79)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../node_modules/css-loader/index.js!./theme-fresh.css", function() {
				var newContent = require("!!./../../node_modules/css-loader/index.js!./theme-fresh.css");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 85 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(78)();
	// imports


	// module
	exports.push([module.id, ".ag-fresh {\n  line-height: 1.4;\n  font-family: \"Helvetica Neue\", Helvetica, Arial, sans-serif;\n}\n.ag-fresh img {\n  vertical-align: middle;\n  border: 0px;\n}\n.ag-fresh .ag-root {\n  border: 1px solid #808080;\n}\n.ag-fresh .ag-row-group-cell {\n  background: -webkit-linear-gradient(#fff, #d3d3d3);\n  background: -moz-linear-gradient(#fff, #d3d3d3);\n  background: -o-linear-gradient(#fff, #d3d3d3);\n  background: -ms-linear-gradient(#fff, #d3d3d3);\n  background: linear-gradient(#fff, #d3d3d3);\n  border: 1px solid #808080;\n  padding: 2px;\n}\n.ag-fresh .ag-row-group-cell-ghost {\n  opacity: 0.5;\n  -ms-filter: \"progid:DXImageTransform.Microsoft.Alpha(Opacity=50)\";\n  filter: alpha(opacity=50);\n}\n.ag-fresh .ag-row-group-cell-text {\n  padding-left: 2px;\n  padding-right: 2px;\n}\n.ag-fresh .ag-row-group-cell-button {\n  border: 1px solid transparent;\n  padding-left: 2px;\n  padding-right: 2px;\n  -webkit-border-radius: 3px;\n  border-radius: 3px;\n}\n.ag-fresh .ag-row-group-cell-button:hover {\n  border: 1px solid #000;\n}\n.ag-fresh .ag-row-group-empty-message {\n  padding-left: 2px;\n  padding-right: 2px;\n  border: 1px solid transparent;\n  color: #808080;\n}\n.ag-fresh .ag-row-group-icon {\n  padding-right: 4px;\n}\n.ag-fresh .ag-row-group-panel {\n  border-top: 1px solid #808080;\n  border-left: 1px solid #808080;\n  border-right: 1px solid #808080;\n  padding: 4px;\n  background-color: #f0f0f0;\n}\n.ag-fresh .ag-cell {\n  padding: 2px;\n}\n.ag-fresh .ag-cell-range-selected-1:not(.ag-cell-focus) {\n  background-color: rgba(120,120,120,0.4);\n}\n.ag-fresh .ag-cell-range-selected-2:not(.ag-cell-focus) {\n  background-color: rgba(80,80,80,0.4);\n}\n.ag-fresh .ag-cell-range-selected-3:not(.ag-cell-focus) {\n  background-color: rgba(40,40,40,0.4);\n}\n.ag-fresh .ag-cell-range-selected-4:not(.ag-cell-focus) {\n  background-color: rgba(0,0,0,0.4);\n}\n.ag-fresh .ag-column-moving .ag-cell {\n  -webkit-transition: left 0.2s;\n  -moz-transition: left 0.2s;\n  -o-transition: left 0.2s;\n  -ms-transition: left 0.2s;\n  transition: left 0.2s;\n}\n.ag-fresh .ag-cell-focus {\n  border: 1px solid #a9a9a9;\n}\n.ag-fresh .ag-cell-no-focus {\n  border-right: 1px dotted #808080;\n  border-top: 1px solid transparent;\n  border-left: 1px solid transparent;\n  border-bottom: 1px solid transparent;\n}\n.ag-fresh .ag-cell-first-right-pinned {\n  border-left: 1px solid #000;\n}\n.ag-fresh .ag-cell-last-left-pinned {\n  border-right: 1px solid #000;\n}\n.ag-fresh .ag-cell-highlight {\n  border: 1px solid #006400;\n}\n.ag-fresh .ag-cell-highlight-animation {\n  -webkit-transition: border 1s;\n  -moz-transition: border 1s;\n  -o-transition: border 1s;\n  -ms-transition: border 1s;\n  transition: border 1s;\n}\n.ag-fresh .ag-header {\n  background: -webkit-linear-gradient(#fff, #d3d3d3);\n  background: -moz-linear-gradient(#fff, #d3d3d3);\n  background: -o-linear-gradient(#fff, #d3d3d3);\n  background: -ms-linear-gradient(#fff, #d3d3d3);\n  background: linear-gradient(#fff, #d3d3d3);\n  border-bottom: 1px solid #808080;\n}\n.ag-fresh .ag-no-scrolls .ag-header-container {\n  background: -webkit-linear-gradient(#fff, #d3d3d3);\n  background: -moz-linear-gradient(#fff, #d3d3d3);\n  background: -o-linear-gradient(#fff, #d3d3d3);\n  background: -ms-linear-gradient(#fff, #d3d3d3);\n  background: linear-gradient(#fff, #d3d3d3);\n  border-bottom: 1px solid #808080;\n}\n.ag-fresh .ag-header-cell {\n  border-right: 1px solid #808080;\n}\n.ag-fresh .ag-header-cell-moving .ag-header-cell-label {\n  opacity: 0.5;\n  -ms-filter: \"progid:DXImageTransform.Microsoft.Alpha(Opacity=50)\";\n  filter: alpha(opacity=50);\n}\n.ag-fresh .ag-header-cell-moving {\n  background-color: #bebebe;\n}\n.ag-fresh .ag-header-cell-moving-clone {\n  border-right: 1px solid #808080;\n  border-left: 1px solid #808080;\n  background-color: rgba(220,220,220,0.8);\n}\n.ag-fresh .ag-header-group-cell {\n  border-right: 1px solid #808080;\n}\n.ag-fresh .ag-header-group-cell-with-group {\n  border-bottom: 1px solid #808080;\n}\n.ag-fresh .ag-header-cell-label {\n  padding: 4px 2px 4px 2px;\n}\n.ag-fresh .ag-header-cell-text {\n  padding-left: 2px;\n}\n.ag-fresh .ag-header-group-cell-label {\n  padding: 4px;\n  padding-left: 10px;\n}\n.ag-fresh .ag-header-group-text {\n  margin-right: 2px;\n}\n.ag-fresh .ag-header-cell-menu-button {\n  padding: 2px;\n  margin-top: 4px;\n  border: 1px solid transparent;\n  -webkit-border-radius: 3px;\n  border-radius: 3px;\n  -webkit-box-sizing: content-box;\n  -moz-box-sizing: content-box;\n  box-sizing: content-box; /* When using bootstrap, box-sizing was set to 'border-box' */\n  line-height: 0px; /* normal line height, a space was appearing below the menu button */\n}\n.ag-fresh .ag-pinned-right-header {\n  border-left: 1px solid #808080;\n}\n.ag-fresh .ag-header-cell-menu-button:hover {\n  border: 1px solid #000;\n}\n.ag-fresh .ag-header-icon {\n  color: #800000;\n}\n.ag-fresh .ag-row-selected {\n  background-color: #b0e0e6 !important;\n}\n.ag-fresh .ag-body .ag-row-odd {\n  background-color: #f6f6f6;\n}\n.ag-fresh .ag-body .ag-row-even {\n  background-color: #fff;\n}\n.ag-fresh .ag-floating-top .ag-row {\n  background-color: #f0f0f0;\n}\n.ag-fresh .ag-floating-bottom .ag-row {\n  background-color: #f0f0f0;\n}\n.ag-fresh .ag-overlay-loading-wrapper {\n  background-color: rgba(255,255,255,0.5);\n}\n.ag-fresh .ag-overlay-loading-center {\n  background-color: #fff;\n  border: 1px solid #a9a9a9;\n  -webkit-border-radius: 10px;\n  border-radius: 10px;\n  padding: 10px;\n}\n.ag-fresh .ag-overlay-no-rows-center {\n  background-color: #fff;\n  border: 1px solid #a9a9a9;\n  -webkit-border-radius: 10px;\n  border-radius: 10px;\n  padding: 10px;\n}\n.ag-fresh .ag-body {\n  background-color: #fafafa;\n}\n.ag-fresh .ag-group-cell-entire-row {\n  background-color: #aaa;\n  padding: 4px;\n}\n.ag-fresh .ag-footer-cell-entire-row {\n  background-color: #aaa;\n  padding: 4px;\n}\n.ag-fresh .ag-group-cell {\n  font-style: italic;\n}\n.ag-fresh .ag-group-expand {\n  padding-right: 2px;\n}\n.ag-fresh .ag-footer-cell {\n  font-style: italic;\n}\n.ag-fresh .ag-menu {\n  border: 1px solid #000;\n  background-color: #f0f0f0;\n  cursor: default;\n  font-family: \"Helvetica Neue\", Helvetica, Arial, sans-serif;\n  font-size: 14px;\n}\n.ag-fresh .ag-menu .ag-tab-header {\n  background-color: #f8f8f8;\n}\n.ag-fresh .ag-menu .ag-tab {\n  padding: 6px 8px 6px 8px;\n  margin: 2px 2px 0px 2px;\n  display: inline-block;\n  border-right: 1px solid transparent;\n  border-left: 1px solid transparent;\n  border-top: 1px solid transparent;\n  border-top-right-radius: 2px;\n  border-top-left-radius: 2px;\n}\n.ag-fresh .ag-menu .ag-tab-selected {\n  background-color: #f0f0f0;\n  border-right: 1px solid #000;\n  border-left: 1px solid #000;\n  border-top: 1px solid #000;\n}\n.ag-fresh .ag-menu-separator {\n  border-top: 1px solid #d3d3d3;\n}\n.ag-fresh .ag-menu-option-active {\n  background-color: #bde2e5;\n}\n.ag-fresh .ag-menu-option-icon {\n  padding: 2px 4px 2px 4px;\n  vertical-align: middle;\n}\n.ag-fresh .ag-menu-option-text {\n  padding: 2px 4px 2px 4px;\n  vertical-align: middle;\n}\n.ag-fresh .ag-menu-option-shortcut {\n  padding: 2px 2px 2px 20px;\n  vertical-align: middle;\n}\n.ag-fresh .ag-menu-option-popup-pointer {\n  padding: 2px 4px 2px 4px;\n  vertical-align: middle;\n}\n.ag-fresh .ag-menu-option-disabled {\n  opacity: 0.5;\n  -ms-filter: \"progid:DXImageTransform.Microsoft.Alpha(Opacity=50)\";\n  filter: alpha(opacity=50);\n}\n.ag-fresh .ag-menu-column-select-wrapper {\n  margin: 2px;\n}\n.ag-fresh .ag-filter-checkbox {\n  position: relative;\n  top: 2px;\n  left: 2px;\n}\n.ag-fresh .ag-filter-header-container {\n  border-bottom: 1px solid #d3d3d3;\n}\n.ag-fresh .ag-filter-apply-panel {\n  border-top: 1px solid #d3d3d3;\n  padding: 2px;\n}\n.ag-fresh .ag-filter-value {\n  margin-left: 4px;\n}\n.ag-fresh .ag-selection-checkbox {\n  margin-left: 4px;\n}\n.ag-fresh .ag-paging-panel {\n  padding: 4px;\n}\n.ag-fresh .ag-paging-button {\n  margin-left: 4px;\n  margin-right: 4px;\n}\n.ag-fresh .ag-paging-row-summary-panel {\n  display: inline-block;\n  width: 300px;\n}\n.ag-fresh .ag-tool-panel {\n  background-color: #eee;\n  border-right: 1px solid #808080;\n  border-bottom: 1px solid #808080;\n  border-top: 1px solid #808080;\n}\n.ag-fresh .ag-status-bar {\n  font-size: 12px;\n  height: 20px;\n  border-bottom: 1px solid #808080;\n  border-left: 1px solid #808080;\n  border-right: 1px solid #808080;\n  padding: 2px;\n  background-color: #f0f0f0;\n}\n.ag-fresh .ag-status-bar-aggregations {\n  float: right;\n}\n.ag-fresh .ag-status-bar-item {\n  padding-left: 10px;\n}\n/*\n///// old toolpanel items\n.ag-not-dragging\n    border: 1px solid transparent;\n\n.ag-drop-target-above\n    border-top: 5px solid darkgrey;\n\n.ag-drop-target-below\n    border-bottom: 5px solid darkgrey;\n\n.ag-dragging\n    border: 1px dotted darkgrey;\n\n.ag-list-item-selected\n    color #f0f0f0;\n\n.ag-list-item-not-selected\n    font-style italic;\n    color #a0a0a0;\n\n.ag-list-selection\n    background-color: white;\n    border: 1px solid darkgrey;\n    box-sizing: border-box;\n\n.ag-popup-list .ag-list-item:hover\n    background-color: lightblue;\n\n.ag-visible-icons\n    padding-left: 2px;\n    padding-right: 2px;\n*/\n", ""]);

	// exports


/***/ }
/******/ ])
});
;