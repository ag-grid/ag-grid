/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v3.3.3
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var gridOptionsWrapper_1 = require("./gridOptionsWrapper");
var inMemoryRowController_1 = require("./rowControllers/inMemoryRowController");
var paginationController_1 = require("./rowControllers/paginationController");
var virtualPageRowController_1 = require("./rowControllers/virtualPageRowController");
var floatingRowModel_1 = require("./rowControllers/floatingRowModel");
var selectionController_1 = require("./selectionController");
var columnController_1 = require("./columnController/columnController");
var rowRenderer_1 = require("./rendering/rowRenderer");
var headerRenderer_1 = require("./headerRendering/headerRenderer");
var filterManager_1 = require("./filter/filterManager");
var valueService_1 = require("./valueService");
var masterSlaveService_1 = require("./masterSlaveService");
var eventService_1 = require("./eventService");
var dragAndDropService_1 = require("./dragAndDrop/dragAndDropService");
var gridPanel_1 = require("./gridPanel/gridPanel");
var gridApi_1 = require("./gridApi");
var constants_1 = require("./constants");
var headerTemplateLoader_1 = require("./headerRendering/headerTemplateLoader");
var balancedColumnTreeBuilder_1 = require("./columnController/balancedColumnTreeBuilder");
var displayedGroupCreator_1 = require("./columnController/displayedGroupCreator");
var selectionRendererFactory_1 = require("./selectionRendererFactory");
var expressionService_1 = require("./expressionService");
var templateService_1 = require("./templateService");
var agPopupService_1 = require("./widgets/agPopupService");
var groupCreator_1 = require("./groupCreator");
var logger_1 = require("./logger");
var columnUtils_1 = require("./columnController/columnUtils");
var autoWidthCalculator_1 = require("./rendering/autoWidthCalculator");
var events_1 = require("./events");
var toolPanel_1 = require("./toolPanel/toolPanel");
var borderLayout_1 = require("./layout/borderLayout");
var dragService_1 = require("./headerRendering/dragService");
var Grid = (function () {
    function Grid(eGridDiv, gridOptions, globalEventListener, $scope, $compile, quickFilterOnScope) {
        if (globalEventListener === void 0) { globalEventListener = null; }
        if ($scope === void 0) { $scope = null; }
        if ($compile === void 0) { $compile = null; }
        if (quickFilterOnScope === void 0) { quickFilterOnScope = null; }
        this.virtualRowListeners = {
            virtualRowRemoved: {},
            virtualRowSelected: {}
        };
        if (!eGridDiv) {
            console.warn('ag-Grid: no div element provided to the grid');
        }
        if (!gridOptions) {
            console.warn('ag-Grid: no gridOptions provided to the grid');
        }
        this.gridOptions = gridOptions;
        this.setupComponents($scope, $compile, eGridDiv, globalEventListener);
        this.gridOptions.api = new gridApi_1.GridApi(this, this.rowRenderer, this.headerRenderer, this.filterManager, this.columnController, this.inMemoryRowController, this.selectionController, this.gridOptionsWrapper, this.gridPanel, this.valueService, this.masterSlaveService, this.eventService, this.floatingRowModel);
        this.gridOptions.columnApi = this.columnController.getColumnApi();
        var that = this;
        // if using angular, watch for quickFilter changes
        if ($scope) {
            $scope.$watch(quickFilterOnScope, function (newFilter) {
                that.onQuickFilterChanged(newFilter);
            });
        }
        if (!this.gridOptionsWrapper.isForPrint()) {
            this.addWindowResizeListener();
        }
        this.inMemoryRowController.setAllRows(this.gridOptionsWrapper.getRowData());
        this.setupColumns();
        this.updateModelAndRefresh(constants_1.default.STEP_EVERYTHING);
        this.decideStartingOverlay();
        // if datasource provided, use it
        if (this.gridOptionsWrapper.getDatasource()) {
            this.setDatasource();
        }
        this.doLayout();
        this.finished = false;
        this.periodicallyDoLayout();
        // if ready function provided, use it
        var readyEvent = {
            api: gridOptions.api,
            columnApi: gridOptions.columnApi
        };
        this.eventService.dispatchEvent(events_1.Events.EVENT_GRID_READY, readyEvent);
        this.logger.log('initialised');
    }
    Grid.prototype.decideStartingOverlay = function () {
        // if not virtual paging, then we might need to show an overlay if no data
        var notDoingVirtualPaging = !this.gridOptionsWrapper.isVirtualPaging();
        if (notDoingVirtualPaging) {
            var showLoading = !this.gridOptionsWrapper.getRowData();
            var showNoData = this.gridOptionsWrapper.getRowData() && this.gridOptionsWrapper.getRowData().length == 0;
            if (showLoading) {
                this.showLoadingOverlay();
            }
            if (showNoData) {
                this.showNoRowsOverlay();
            }
        }
    };
    Grid.prototype.addWindowResizeListener = function () {
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
    Grid.prototype.getRowModel = function () {
        return this.rowModel;
    };
    Grid.prototype.periodicallyDoLayout = function () {
        if (!this.finished) {
            var that = this;
            setTimeout(function () {
                that.doLayout();
                that.gridPanel.periodicallyCheck();
                that.periodicallyDoLayout();
            }, 500);
        }
    };
    Grid.prototype.setupComponents = function ($scope, $compile, eUserProvidedDiv, globalEventListener) {
        this.eUserProvidedDiv = eUserProvidedDiv;
        // create all the beans
        var dragService = new dragService_1.DragService();
        var headerTemplateLoader = new headerTemplateLoader_1.default();
        var floatingRowModel = new floatingRowModel_1.default();
        var balancedColumnTreeBuilder = new balancedColumnTreeBuilder_1.default();
        var displayedGroupCreator = new displayedGroupCreator_1.default();
        var eventService = new eventService_1.default();
        var gridOptionsWrapper = new gridOptionsWrapper_1.default();
        var selectionController = new selectionController_1.default();
        var filterManager = new filterManager_1.default();
        var selectionRendererFactory = new selectionRendererFactory_1.default();
        var columnController = new columnController_1.ColumnController();
        var rowRenderer = new rowRenderer_1.default();
        var headerRenderer = new headerRenderer_1.default();
        var inMemoryRowController = new inMemoryRowController_1.default();
        var virtualPageRowController = new virtualPageRowController_1.default();
        var expressionService = new expressionService_1.default();
        var templateService = new templateService_1.default();
        var gridPanel = new gridPanel_1.default();
        var popupService = new agPopupService_1.default();
        var valueService = new valueService_1.default();
        var groupCreator = new groupCreator_1.default();
        var masterSlaveService = new masterSlaveService_1.default();
        var loggerFactory = new logger_1.LoggerFactory();
        var dragAndDropService = new dragAndDropService_1.default();
        var columnUtils = new columnUtils_1.default();
        var autoWidthCalculator = new autoWidthCalculator_1.default();
        // initialise all the beans
        gridOptionsWrapper.init(this.gridOptions, eventService);
        loggerFactory.init(gridOptionsWrapper);
        this.logger = loggerFactory.create('Grid');
        this.logger.log('initialising');
        headerTemplateLoader.init(gridOptionsWrapper);
        floatingRowModel.init(gridOptionsWrapper);
        columnUtils.init(gridOptionsWrapper);
        autoWidthCalculator.init(rowRenderer, gridPanel);
        dragAndDropService.init(loggerFactory);
        eventService.init(loggerFactory);
        gridPanel.init(gridOptionsWrapper, columnController, rowRenderer, masterSlaveService, loggerFactory, floatingRowModel);
        templateService.init($scope);
        expressionService.init(loggerFactory);
        selectionController.init(this, gridPanel, gridOptionsWrapper, $scope, rowRenderer, eventService);
        filterManager.init(this, gridOptionsWrapper, $compile, $scope, columnController, popupService, valueService);
        selectionRendererFactory.init(this, selectionController);
        balancedColumnTreeBuilder.init(gridOptionsWrapper, loggerFactory, columnUtils);
        displayedGroupCreator.init(columnUtils);
        columnController.init(this, selectionRendererFactory, gridOptionsWrapper, expressionService, valueService, masterSlaveService, eventService, balancedColumnTreeBuilder, displayedGroupCreator, columnUtils, autoWidthCalculator, loggerFactory);
        rowRenderer.init(columnController, gridOptionsWrapper, gridPanel, this, selectionRendererFactory, $compile, $scope, selectionController, expressionService, templateService, valueService, eventService, floatingRowModel);
        headerRenderer.init(gridOptionsWrapper, columnController, gridPanel, this, filterManager, $scope, $compile, headerTemplateLoader, dragService);
        inMemoryRowController.init(gridOptionsWrapper, columnController, this, filterManager, $scope, groupCreator, valueService, eventService);
        virtualPageRowController.init(rowRenderer, gridOptionsWrapper, this);
        valueService.init(gridOptionsWrapper, expressionService, columnController);
        groupCreator.init(valueService, gridOptionsWrapper);
        masterSlaveService.init(gridOptionsWrapper, columnController, gridPanel, loggerFactory, eventService);
        if (globalEventListener) {
            eventService.addGlobalListener(globalEventListener);
        }
        var toolPanelLayout = null;
        var toolPanel = null;
        if (!gridOptionsWrapper.isForPrint()) {
            toolPanel = new toolPanel_1.default();
            toolPanelLayout = toolPanel.layout;
            toolPanel.init(columnController, inMemoryRowController, gridOptionsWrapper, popupService, eventService, dragAndDropService);
        }
        // this is a child bean, get a reference and pass it on
        // CAN WE DELETE THIS? it's done in the setDatasource section
        var rowModel = inMemoryRowController.getModel();
        selectionController.setRowModel(rowModel);
        filterManager.setRowModel(rowModel);
        rowRenderer.setRowModel(rowModel);
        gridPanel.setRowModel(rowModel);
        // and the last bean, done in it's own section, as it's optional
        var paginationController = null;
        var paginationGui = null;
        if (!gridOptionsWrapper.isForPrint()) {
            paginationController = new paginationController_1.default();
            paginationController.init(this, gridOptionsWrapper);
            paginationGui = paginationController.getGui();
        }
        this.rowModel = rowModel;
        this.usingInMemoryModel = true;
        this.selectionController = selectionController;
        this.columnController = columnController;
        this.inMemoryRowController = inMemoryRowController;
        this.virtualPageRowController = virtualPageRowController;
        this.rowRenderer = rowRenderer;
        this.headerRenderer = headerRenderer;
        this.paginationController = paginationController;
        this.filterManager = filterManager;
        this.toolPanel = toolPanel;
        this.gridPanel = gridPanel;
        this.valueService = valueService;
        this.masterSlaveService = masterSlaveService;
        this.eventService = eventService;
        this.gridOptionsWrapper = gridOptionsWrapper;
        this.dragAndDropService = dragAndDropService;
        this.floatingRowModel = floatingRowModel;
        this.eRootPanel = new borderLayout_1.default({
            center: gridPanel.getLayout(),
            east: toolPanelLayout,
            south: paginationGui,
            dontFill: gridOptionsWrapper.isForPrint(),
            name: 'eRootPanel'
        });
        popupService.init(this.eRootPanel.getGui());
        // default is we don't show paging panel, this is set to true when datasource is set
        this.eRootPanel.setSouthVisible(false);
        // see what the grid options are for default of toolbar
        this.showToolPanel(gridOptionsWrapper.isShowToolPanel());
        eUserProvidedDiv.appendChild(this.eRootPanel.getGui());
        this.logger.log('grid DOM added');
        eventService.addEventListener(events_1.Events.EVENT_COLUMN_EVERYTHING_CHANGED, this.onColumnChanged.bind(this));
        eventService.addEventListener(events_1.Events.EVENT_COLUMN_GROUP_OPENED, this.onColumnChanged.bind(this));
        eventService.addEventListener(events_1.Events.EVENT_COLUMN_MOVED, this.onColumnChanged.bind(this));
        eventService.addEventListener(events_1.Events.EVENT_COLUMN_ROW_GROUP_CHANGE, this.onColumnChanged.bind(this));
        eventService.addEventListener(events_1.Events.EVENT_COLUMN_RESIZED, this.onColumnChanged.bind(this));
        eventService.addEventListener(events_1.Events.EVENT_COLUMN_VALUE_CHANGE, this.onColumnChanged.bind(this));
        eventService.addEventListener(events_1.Events.EVENT_COLUMN_VISIBLE, this.onColumnChanged.bind(this));
        eventService.addEventListener(events_1.Events.EVENT_COLUMN_PINNED, this.onColumnChanged.bind(this));
    };
    Grid.prototype.onColumnChanged = function (event) {
        if (event.isRowGroupChanged()) {
            this.inMemoryRowController.onRowGroupChanged();
        }
        if (event.isValueChanged()) {
            this.inMemoryRowController.doAggregate();
        }
        if (event.isIndividualColumnResized()) {
            this.onIndividualColumnResized(event.getColumn());
        }
        else if (event.getType() === events_1.Events.EVENT_COLUMN_MOVED) {
            this.refreshHeader();
        }
        else {
            this.refreshHeaderAndBody();
        }
        this.gridPanel.showPinnedColContainersIfNeeded();
    };
    Grid.prototype.refreshRowGroup = function () {
        this.inMemoryRowController.onRowGroupChanged();
        this.refreshHeaderAndBody();
    };
    Grid.prototype.onIndividualColumnResized = function (column) {
        this.headerRenderer.onIndividualColumnResized(column);
        //this.rowRenderer.onIndividualColumnResized(column);
        if (column.isPinned()) {
            this.updatePinnedColContainerWidthAfterColResize();
        }
        else {
            this.updateBodyContainerWidthAfterColResize();
        }
    };
    Grid.prototype.showToolPanel = function (show) {
        if (!this.toolPanel) {
            this.toolPanelShowing = false;
            return;
        }
        this.toolPanelShowing = show;
        this.eRootPanel.setEastVisible(show);
    };
    Grid.prototype.isToolPanelShowing = function () {
        return this.toolPanelShowing;
    };
    Grid.prototype.isUsingInMemoryModel = function () {
        return this.usingInMemoryModel;
    };
    Grid.prototype.setDatasource = function (datasource) {
        // if datasource provided, then set it
        if (datasource) {
            this.gridOptions.datasource = datasource;
        }
        // get the set datasource (if null was passed to this method,
        // then need to get the actual datasource from options
        var datasourceToUse = this.gridOptionsWrapper.getDatasource();
        this.doingVirtualPaging = this.gridOptionsWrapper.isVirtualPaging() && datasourceToUse;
        this.doingPagination = datasourceToUse && !this.doingVirtualPaging;
        var showPagingPanel;
        if (this.doingVirtualPaging) {
            this.paginationController.setDatasource(null);
            this.virtualPageRowController.setDatasource(datasourceToUse);
            this.rowModel = this.virtualPageRowController.getModel();
            this.usingInMemoryModel = false;
            showPagingPanel = false;
        }
        else if (this.doingPagination) {
            this.paginationController.setDatasource(datasourceToUse);
            this.virtualPageRowController.setDatasource(null);
            this.rowModel = this.inMemoryRowController.getModel();
            this.usingInMemoryModel = true;
            showPagingPanel = true;
        }
        else {
            this.paginationController.setDatasource(null);
            this.virtualPageRowController.setDatasource(null);
            this.rowModel = this.inMemoryRowController.getModel();
            this.usingInMemoryModel = true;
            showPagingPanel = false;
        }
        this.selectionController.setRowModel(this.rowModel);
        this.filterManager.setRowModel(this.rowModel);
        this.rowRenderer.setRowModel(this.rowModel);
        this.gridPanel.setRowModel(this.rowModel);
        this.eRootPanel.setSouthVisible(showPagingPanel);
        // because we just set the rowModel, need to update the gui
        this.rowRenderer.refreshView();
        this.doLayout();
    };
    // gets called after columns are shown / hidden from groups expanding
    Grid.prototype.refreshHeaderAndBody = function () {
        this.logger.log('refreshHeaderAndBody');
        this.refreshHeader();
        this.refreshBody();
    };
    Grid.prototype.refreshHeader = function () {
        this.headerRenderer.refreshHeader();
        this.headerRenderer.updateFilterIcons();
        this.headerRenderer.updateSortIcons();
        this.headerRenderer.setPinnedColContainerWidth();
    };
    Grid.prototype.refreshBody = function () {
        this.gridPanel.setBodyContainerWidth();
        this.gridPanel.setPinnedColContainerWidth();
        this.rowRenderer.refreshView();
    };
    Grid.prototype.destroy = function () {
        if (this.windowResizeListener) {
            window.removeEventListener('resize', this.windowResizeListener);
            this.logger.log('Removing windowResizeListener');
        }
        this.finished = true;
        this.dragAndDropService.destroy();
        this.rowRenderer.destroy();
        this.filterManager.destroy();
        this.eUserProvidedDiv.removeChild(this.eRootPanel.getGui());
        this.logger.log('Grid DOM removed');
    };
    Grid.prototype.onQuickFilterChanged = function (newFilter) {
        var actuallyChanged = this.filterManager.setQuickFilter(newFilter);
        if (actuallyChanged) {
            this.onFilterChanged();
        }
    };
    Grid.prototype.onFilterModified = function () {
        this.eventService.dispatchEvent(events_1.Events.EVENT_FILTER_MODIFIED);
    };
    Grid.prototype.onFilterChanged = function () {
        this.eventService.dispatchEvent(events_1.Events.EVENT_BEFORE_FILTER_CHANGED);
        this.filterManager.onFilterChanged();
        this.headerRenderer.updateFilterIcons();
        if (this.gridOptionsWrapper.isEnableServerSideFilter()) {
            // if doing server side filtering, changing the sort has the impact
            // of resetting the datasource
            this.setDatasource();
        }
        else {
            // if doing in memory filtering, we just update the in memory data
            this.updateModelAndRefresh(constants_1.default.STEP_FILTER);
        }
        this.eventService.dispatchEvent(events_1.Events.EVENT_AFTER_FILTER_CHANGED);
    };
    Grid.prototype.onRowClicked = function (multiSelectKeyPressed, rowIndex, node) {
        // we do not allow selecting groups by clicking (as the click here expands the group)
        // so return if it's a group row
        if (node.group) {
            return;
        }
        // we also don't allow selection of floating rows
        if (node.floating) {
            return;
        }
        // making local variables to make the below more readable
        var gridOptionsWrapper = this.gridOptionsWrapper;
        var selectionController = this.selectionController;
        // if no selection method enabled, do nothing
        if (!gridOptionsWrapper.isRowSelection()) {
            return;
        }
        // if click selection suppressed, do nothing
        if (gridOptionsWrapper.isSuppressRowClickSelection()) {
            return;
        }
        var doDeselect = multiSelectKeyPressed
            && selectionController.isNodeSelected(node)
            && gridOptionsWrapper.isRowDeselection();
        if (doDeselect) {
            selectionController.deselectNode(node);
        }
        else {
            selectionController.selectNode(node, multiSelectKeyPressed);
        }
    };
    Grid.prototype.showLoadingOverlay = function () {
        this.gridPanel.showLoadingOverlay();
    };
    Grid.prototype.showNoRowsOverlay = function () {
        this.gridPanel.showNoRowsOverlay();
    };
    Grid.prototype.hideOverlay = function () {
        this.gridPanel.hideOverlay();
    };
    Grid.prototype.setupColumns = function () {
        this.columnController.onColumnsChanged();
        this.gridPanel.showPinnedColContainersIfNeeded();
        this.gridPanel.onBodyHeightChange();
    };
    // rowsToRefresh is at what index to start refreshing the rows. the assumption is
    // if we are expanding or collapsing a group, then only he rows below the group
    // need to be refresh. this allows the context (eg focus) of the other cells to
    // remain.
    Grid.prototype.updateModelAndRefresh = function (step, refreshFromIndex) {
        this.inMemoryRowController.updateModel(step);
        this.rowRenderer.refreshView(refreshFromIndex);
    };
    Grid.prototype.setRowData = function (rows, firstId) {
        if (rows) {
            this.gridOptions.rowData = rows;
        }
        var rowData = this.gridOptionsWrapper.getRowData();
        this.inMemoryRowController.setAllRows(rowData, firstId);
        this.selectionController.deselectAll();
        this.filterManager.onNewRowsLoaded();
        this.updateModelAndRefresh(constants_1.default.STEP_EVERYTHING);
        this.headerRenderer.updateFilterIcons();
        if (rowData && rowData.length > 0) {
            this.hideOverlay();
        }
        else {
            this.showNoRowsOverlay();
        }
    };
    Grid.prototype.ensureNodeVisible = function (comparator) {
        if (this.doingVirtualPaging) {
            throw 'Cannot use ensureNodeVisible when doing virtual paging, as we cannot check rows that are not in memory';
        }
        // look for the node index we want to display
        var rowCount = this.rowModel.getVirtualRowCount();
        var comparatorIsAFunction = typeof comparator === 'function';
        var indexToSelect = -1;
        // go through all the nodes, find the one we want to show
        for (var i = 0; i < rowCount; i++) {
            var node = this.rowModel.getVirtualRow(i);
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
    Grid.prototype.getFilterModel = function () {
        return this.filterManager.getFilterModel();
    };
    Grid.prototype.setFocusedCell = function (rowIndex, colKey) {
        this.gridPanel.ensureIndexVisible(rowIndex);
        this.gridPanel.ensureColumnVisible(colKey);
        var that = this;
        setTimeout(function () {
            that.rowRenderer.setFocusedCell(rowIndex, colKey);
        }, 10);
    };
    Grid.prototype.getSortModel = function () {
        return this.columnController.getSortModel();
    };
    Grid.prototype.setSortModel = function (sortModel) {
        this.columnController.setSortModel(sortModel);
        this.onSortingChanged();
    };
    Grid.prototype.onSortingChanged = function () {
        this.eventService.dispatchEvent(events_1.Events.EVENT_BEFORE_SORT_CHANGED);
        this.headerRenderer.updateSortIcons();
        if (this.gridOptionsWrapper.isEnableServerSideSorting()) {
            // if doing server side sorting, changing the sort has the impact
            // of resetting the datasource
            this.setDatasource();
        }
        else {
            // if doing in memory sorting, we just update the in memory data
            this.updateModelAndRefresh(constants_1.default.STEP_SORT);
        }
        this.eventService.dispatchEvent(events_1.Events.EVENT_AFTER_SORT_CHANGED);
    };
    Grid.prototype.addVirtualRowListener = function (eventName, rowIndex, callback) {
        var listenersMap = this.virtualRowListeners[eventName];
        if (!listenersMap) {
            console.warn('ag-Grid: invalid listener type ' + eventName + ', expected values are ' + Object.keys(this.virtualRowListeners));
            return;
        }
        if (!listenersMap[rowIndex]) {
            listenersMap[rowIndex] = [];
        }
        listenersMap[rowIndex].push(callback);
    };
    Grid.prototype.onVirtualRowSelected = function (rowIndex, selected) {
        // inform the callbacks of the event
        var listenersMap = this.virtualRowListeners[Grid.VIRTUAL_ROW_SELECTED];
        if (listenersMap[rowIndex]) {
            listenersMap[rowIndex].forEach(function (callback) {
                if (typeof callback === 'function') {
                    callback(selected);
                }
            });
        }
        this.rowRenderer.onRowSelected(rowIndex, selected);
    };
    Grid.prototype.onVirtualRowRemoved = function (rowIndex) {
        // inform the callbacks of the event
        var listenersMap = this.virtualRowListeners[Grid.VIRTUAL_ROW_REMOVED];
        if (listenersMap[rowIndex]) {
            listenersMap[rowIndex].forEach(function (callback) {
                if (typeof callback === 'function') {
                    callback();
                }
            });
        }
        this.removeVirtualCallbacksForRow(rowIndex);
    };
    Grid.prototype.removeVirtualCallbacksForRow = function (rowIndex) {
        delete this.virtualRowListeners[Grid.VIRTUAL_ROW_REMOVED][rowIndex];
        delete this.virtualRowListeners[Grid.VIRTUAL_ROW_SELECTED][rowIndex];
    };
    Grid.prototype.setColumnDefs = function (colDefs) {
        if (colDefs) {
            this.gridOptions.columnDefs = colDefs;
        }
        this.setupColumns();
        this.updateModelAndRefresh(constants_1.default.STEP_EVERYTHING);
        // found that adding pinned column can upset the layout
        this.doLayout();
    };
    Grid.prototype.updateBodyContainerWidthAfterColResize = function () {
        this.rowRenderer.setMainRowWidths();
        this.gridPanel.setBodyContainerWidth();
    };
    Grid.prototype.updatePinnedColContainerWidthAfterColResize = function () {
        this.gridPanel.setPinnedColContainerWidth();
        this.headerRenderer.setPinnedColContainerWidth();
    };
    Grid.prototype.doLayout = function () {
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
    Grid.VIRTUAL_ROW_REMOVED = 'virtualRowRemoved';
    Grid.VIRTUAL_ROW_SELECTED = 'virtualRowSelected';
    return Grid;
})();
exports.Grid = Grid;
