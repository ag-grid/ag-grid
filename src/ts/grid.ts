
import {GridOptions} from "./entities/gridOptions";
import GridOptionsWrapper from "./gridOptionsWrapper";
import InMemoryRowController from "./rowControllers/inMemoryRowController";
import PaginationController from "./rowControllers/paginationController";
import VirtualPageRowController from "./rowControllers/virtualPageRowController";
import FloatingRowModel from "./rowControllers/floatingRowModel";
import SelectionController from "./selectionController";
import {ColumnController} from "./columnController/columnController";
import RowRenderer from "./rendering/rowRenderer";
import HeaderRenderer from "./headerRendering/headerRenderer";
import FilterManager from "./filter/filterManager";
import ValueService from "./valueService";
import MasterSlaveService from "./masterSlaveService";
import EventService from "./eventService";
import DragAndDropService from "./dragAndDrop/dragAndDropService";
import GridPanel from "./gridPanel/gridPanel";
import {Logger} from "./logger";
import {GridApi} from "./gridApi";
import Constants from "./constants";
import HeaderTemplateLoader from "./headerRendering/headerTemplateLoader";
import BalancedColumnTreeBuilder from "./columnController/balancedColumnTreeBuilder";
import DisplayedGroupCreator from "./columnController/displayedGroupCreator";
import SelectionRendererFactory from "./selectionRendererFactory";
import ExpressionService from "./expressionService";
import TemplateService from "./templateService";
import PopupService from "./widgets/agPopupService";
import GroupCreator from "./groupCreator";
import {LoggerFactory} from "./logger";
import ColumnUtils from "./columnController/columnUtils";
import AutoWidthCalculator from "./rendering/autoWidthCalculator";
import {Events} from "./events";
import ToolPanel from "./toolPanel/toolPanel";
import BorderLayout from "./layout/borderLayout";
import ColumnChangeEvent from "./columnChangeEvent";
import Column from "./entities/column";
import {RowNode} from "./entities/rowNode";
import {ColDef} from "./entities/colDef";
import {DragService} from "./headerRendering/dragService";

export class Grid {

    public static VIRTUAL_ROW_REMOVED = 'virtualRowRemoved';
    public static VIRTUAL_ROW_SELECTED = 'virtualRowSelected';

    private virtualRowListeners: { [key: string]: { [key: number]: Function[] } } = {
        virtualRowRemoved: {},
        virtualRowSelected: {}
    };

    private gridOptions: GridOptions;
    private gridOptionsWrapper: GridOptionsWrapper;
    private inMemoryRowController: InMemoryRowController;
    private doingVirtualPaging: boolean;
    private paginationController: PaginationController;
    private virtualPageRowController: VirtualPageRowController;
    private floatingRowModel: FloatingRowModel;
    private finished: boolean;

    private selectionController: SelectionController;
    private columnController: ColumnController;
    private rowRenderer: RowRenderer;
    private headerRenderer: HeaderRenderer;
    private filterManager: FilterManager;
    private valueService: ValueService;
    private masterSlaveService: MasterSlaveService;
    private eventService: EventService;
    private dragAndDropService: DragAndDropService;
    private toolPanel: any;
    private gridPanel: GridPanel;
    private eRootPanel: any;
    private toolPanelShowing: boolean;
    private doingPagination: boolean;
    private usingInMemoryModel: boolean;
    private rowModel: any;

    private windowResizeListener: EventListener;
    private eUserProvidedDiv: HTMLElement;
    private logger: Logger;

    constructor(eGridDiv: any, gridOptions: any, globalEventListener: Function = null, $scope: any = null, $compile: any = null, quickFilterOnScope: any = null) {

        if (!eGridDiv) {
            console.warn('ag-Grid: no div element provided to the grid');
        }
        if (!gridOptions) {
            console.warn('ag-Grid: no gridOptions provided to the grid');
        }

        this.gridOptions = gridOptions;
        this.setupComponents($scope, $compile, eGridDiv, globalEventListener);

        this.gridOptions.api = new GridApi(this, this.rowRenderer, this.headerRenderer, this.filterManager,
            this.columnController, this.inMemoryRowController, this.selectionController,
            this.gridOptionsWrapper, this.gridPanel, this.valueService, this.masterSlaveService,
            this.eventService, this.floatingRowModel);
        this.gridOptions.columnApi = this.columnController.getColumnApi();

        var that = this;

        // if using angular, watch for quickFilter changes
        if ($scope) {
            $scope.$watch(quickFilterOnScope, function (newFilter: any) {
                that.onQuickFilterChanged(newFilter);
            });
        }

        if (!this.gridOptionsWrapper.isForPrint()) {
            this.addWindowResizeListener();
        }

        this.inMemoryRowController.setAllRows(this.gridOptionsWrapper.getRowData());
        this.setupColumns();
        this.updateModelAndRefresh(Constants.STEP_EVERYTHING);

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
        this.eventService.dispatchEvent(Events.EVENT_GRID_READY, readyEvent);

        this.logger.log('initialised');
    }

    private decideStartingOverlay() {
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
    }

    private addWindowResizeListener(): void {
        var that = this;
        // putting this into a function, so when we remove the function,
        // we are sure we are removing the exact same function (i'm not
        // sure what 'bind' does to the function reference, if it's safe
        // the result from 'bind').
        this.windowResizeListener = function resizeListener() {
            that.doLayout();
        };
        window.addEventListener('resize', this.windowResizeListener);
    }

    public getRowModel(): any {
        return this.rowModel;
    }

    private periodicallyDoLayout() {
        if (!this.finished) {
            var that = this;
            setTimeout(function () {
                that.doLayout();
                that.gridPanel.periodicallyCheck();
                that.periodicallyDoLayout();
            }, 500);
        }
    }

    private setupComponents($scope: any, $compile: any, eUserProvidedDiv: HTMLElement, globalEventListener: Function) {
        this.eUserProvidedDiv = eUserProvidedDiv;

        // create all the beans
        var dragService = new DragService();
        var headerTemplateLoader = new HeaderTemplateLoader();
        var floatingRowModel = new FloatingRowModel();
        var balancedColumnTreeBuilder = new BalancedColumnTreeBuilder();
        var displayedGroupCreator = new DisplayedGroupCreator();
        var eventService = new EventService();
        var gridOptionsWrapper = new GridOptionsWrapper();
        var selectionController = new SelectionController();
        var filterManager = new FilterManager();
        var selectionRendererFactory = new SelectionRendererFactory();
        var columnController = new ColumnController();
        var rowRenderer: RowRenderer = new RowRenderer();
        var headerRenderer = new HeaderRenderer();
        var inMemoryRowController = new InMemoryRowController();
        var virtualPageRowController = new VirtualPageRowController();
        var expressionService = new ExpressionService();
        var templateService = new TemplateService();
        var gridPanel = new GridPanel();
        var popupService = new PopupService();
        var valueService = new ValueService();
        var groupCreator = new GroupCreator();
        var masterSlaveService = new MasterSlaveService();
        var loggerFactory = new LoggerFactory();
        var dragAndDropService = new DragAndDropService();
        var columnUtils = new ColumnUtils();
        var autoWidthCalculator = new AutoWidthCalculator();

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
        filterManager.init(this, gridOptionsWrapper, $compile, $scope,
            columnController, popupService, valueService);
        selectionRendererFactory.init(this, selectionController);
        balancedColumnTreeBuilder.init(gridOptionsWrapper, loggerFactory, columnUtils);
        displayedGroupCreator.init(columnUtils);
        columnController.init(this, selectionRendererFactory, gridOptionsWrapper,
            expressionService, valueService, masterSlaveService, eventService,
            balancedColumnTreeBuilder, displayedGroupCreator, columnUtils,
            autoWidthCalculator, loggerFactory);
        rowRenderer.init(columnController, gridOptionsWrapper, gridPanel, this, selectionRendererFactory,
            $compile, $scope, selectionController, expressionService, templateService, valueService,
            eventService, floatingRowModel);
        headerRenderer.init(gridOptionsWrapper, columnController, gridPanel, this, filterManager,
            $scope, $compile, headerTemplateLoader, dragService);
        inMemoryRowController.init(gridOptionsWrapper, columnController, this, filterManager, $scope,
            groupCreator, valueService, eventService);
        virtualPageRowController.init(rowRenderer, gridOptionsWrapper, this);
        valueService.init(gridOptionsWrapper, expressionService, columnController);
        groupCreator.init(valueService, gridOptionsWrapper);
        masterSlaveService.init(gridOptionsWrapper, columnController, gridPanel, loggerFactory, eventService);

        if (globalEventListener) {
            eventService.addGlobalListener(globalEventListener);
        }

        var toolPanelLayout: any = null;
        var toolPanel: any = null;
        if (!gridOptionsWrapper.isForPrint()) {
            toolPanel = new ToolPanel();
            toolPanelLayout = toolPanel.layout;
            toolPanel.init(columnController, inMemoryRowController, gridOptionsWrapper,
                popupService, eventService, dragAndDropService);
        }

        // this is a child bean, get a reference and pass it on
        // CAN WE DELETE THIS? it's done in the setDatasource section
        var rowModel = inMemoryRowController.getModel();
        selectionController.setRowModel(rowModel);
        filterManager.setRowModel(rowModel);
        rowRenderer.setRowModel(rowModel);
        gridPanel.setRowModel(rowModel);

        // and the last bean, done in it's own section, as it's optional
        var paginationController: any = null;
        var paginationGui: any = null;
        if (!gridOptionsWrapper.isForPrint()) {
            paginationController = new PaginationController();
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

        this.eRootPanel = new BorderLayout({
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

        eventService.addEventListener(Events.EVENT_COLUMN_EVERYTHING_CHANGED, this.onColumnChanged.bind(this));
        eventService.addEventListener(Events.EVENT_COLUMN_GROUP_OPENED, this.onColumnChanged.bind(this));
        eventService.addEventListener(Events.EVENT_COLUMN_MOVED, this.onColumnChanged.bind(this));
        eventService.addEventListener(Events.EVENT_COLUMN_ROW_GROUP_CHANGE, this.onColumnChanged.bind(this));
        eventService.addEventListener(Events.EVENT_COLUMN_RESIZED, this.onColumnChanged.bind(this));
        eventService.addEventListener(Events.EVENT_COLUMN_VALUE_CHANGE, this.onColumnChanged.bind(this));
        eventService.addEventListener(Events.EVENT_COLUMN_VISIBLE, this.onColumnChanged.bind(this));
        eventService.addEventListener(Events.EVENT_COLUMN_PINNED, this.onColumnChanged.bind(this));
    }

    private onColumnChanged(event: ColumnChangeEvent): void {
        if (event.isRowGroupChanged()) {
            this.inMemoryRowController.onRowGroupChanged();
        }
        if (event.isValueChanged()) {
            this.inMemoryRowController.doAggregate();
        }

        if (event.isIndividualColumnResized()) {
            this.onIndividualColumnResized(event.getColumn());
        } else if (event.getType()===Events.EVENT_COLUMN_MOVED) {
            this.refreshHeader();
        } else {
            this.refreshHeaderAndBody();
        }

        this.gridPanel.showPinnedColContainersIfNeeded();
    }

    public refreshRowGroup(): void {
        this.inMemoryRowController.onRowGroupChanged();
        this.refreshHeaderAndBody();
    }

    private onIndividualColumnResized(column: Column): void {
        this.headerRenderer.onIndividualColumnResized(column);
        //this.rowRenderer.onIndividualColumnResized(column);
        if (column.isPinned()) {
            this.updatePinnedColContainerWidthAfterColResize();
        } else {
            this.updateBodyContainerWidthAfterColResize();
        }
    }

    public showToolPanel(show: any) {
        if (!this.toolPanel) {
            this.toolPanelShowing = false;
            return;
        }

        this.toolPanelShowing = show;
        this.eRootPanel.setEastVisible(show);
    }

    public isToolPanelShowing() {
        return this.toolPanelShowing;
    }

    public isUsingInMemoryModel(): boolean {
        return this.usingInMemoryModel;
    }

    public setDatasource(datasource?: any) {
        // if datasource provided, then set it
        if (datasource) {
            this.gridOptions.datasource = datasource;
        }
        // get the set datasource (if null was passed to this method,
        // then need to get the actual datasource from options
        var datasourceToUse = this.gridOptionsWrapper.getDatasource();
        this.doingVirtualPaging = this.gridOptionsWrapper.isVirtualPaging() && datasourceToUse;
        this.doingPagination = datasourceToUse && !this.doingVirtualPaging;
        var showPagingPanel: any;

        if (this.doingVirtualPaging) {
            this.paginationController.setDatasource(null);
            this.virtualPageRowController.setDatasource(datasourceToUse);
            this.rowModel = this.virtualPageRowController.getModel();
            this.usingInMemoryModel = false;
            showPagingPanel = false;
        } else if (this.doingPagination) {
            this.paginationController.setDatasource(datasourceToUse);
            this.virtualPageRowController.setDatasource(null);
            this.rowModel = this.inMemoryRowController.getModel();
            this.usingInMemoryModel = true;
            showPagingPanel = true;
        } else {
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
    }

    // gets called after columns are shown / hidden from groups expanding
    private refreshHeaderAndBody() {
        this.logger.log('refreshHeaderAndBody');
        this.refreshHeader();
        this.refreshBody();
    }

    private refreshHeader() {
        this.headerRenderer.refreshHeader();
        this.headerRenderer.updateFilterIcons();
        this.headerRenderer.updateSortIcons();
        this.headerRenderer.setPinnedColContainerWidth();
    }

    private refreshBody() {
        this.gridPanel.setBodyContainerWidth();
        this.gridPanel.setPinnedColContainerWidth();
        this.rowRenderer.refreshView();
    }

    public destroy() {
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
    }

    public onQuickFilterChanged(newFilter: any) {
        var actuallyChanged = this.filterManager.setQuickFilter(newFilter);
        if (actuallyChanged) {
            this.onFilterChanged();
        }
    }

    public onFilterModified() {
        this.eventService.dispatchEvent(Events.EVENT_FILTER_MODIFIED);
    }

    public onFilterChanged() {
        this.eventService.dispatchEvent(Events.EVENT_BEFORE_FILTER_CHANGED);
        this.filterManager.onFilterChanged();
        this.headerRenderer.updateFilterIcons();
        if (this.gridOptionsWrapper.isEnableServerSideFilter()) {
            // if doing server side filtering, changing the sort has the impact
            // of resetting the datasource
            this.setDatasource();
        } else {
            // if doing in memory filtering, we just update the in memory data
            this.updateModelAndRefresh(Constants.STEP_FILTER);
        }
        this.eventService.dispatchEvent(Events.EVENT_AFTER_FILTER_CHANGED);
    }

    public onRowClicked(multiSelectKeyPressed: boolean, rowIndex: number, node: RowNode) {

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
        } else {
            selectionController.selectNode(node, multiSelectKeyPressed);
        }
    }

    public showLoadingOverlay(): void {
        this.gridPanel.showLoadingOverlay();
    }

    public showNoRowsOverlay(): void {
        this.gridPanel.showNoRowsOverlay();
    }

    public hideOverlay(): void {
        this.gridPanel.hideOverlay();
    }

    private setupColumns() {
        this.columnController.onColumnsChanged();
        this.gridPanel.showPinnedColContainersIfNeeded();
        this.gridPanel.onBodyHeightChange();
    }

    // rowsToRefresh is at what index to start refreshing the rows. the assumption is
    // if we are expanding or collapsing a group, then only he rows below the group
    // need to be refresh. this allows the context (eg focus) of the other cells to
    // remain.
    public updateModelAndRefresh(step: any, refreshFromIndex?: any) {
        this.inMemoryRowController.updateModel(step);
        this.rowRenderer.refreshView(refreshFromIndex);
    }

    public setRowData(rows?: any, firstId?: any) {
        if (rows) {
            this.gridOptions.rowData = rows;
        }
        var rowData = this.gridOptionsWrapper.getRowData();
        this.inMemoryRowController.setAllRows(rowData, firstId);
        this.selectionController.deselectAll();
        this.filterManager.onNewRowsLoaded();
        this.updateModelAndRefresh(Constants.STEP_EVERYTHING);
        this.headerRenderer.updateFilterIcons();
        if (rowData && rowData.length > 0) {
            this.hideOverlay();
        } else {
            this.showNoRowsOverlay();
        }
    }

    public ensureNodeVisible(comparator: any) {
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
            } else {
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
    }

    public getFilterModel() {
        return this.filterManager.getFilterModel();
    }

    public setFocusedCell(rowIndex: number, colKey: string|ColDef|Column) {
        this.gridPanel.ensureIndexVisible(rowIndex);
        this.gridPanel.ensureColumnVisible(colKey);
        var that = this;
        setTimeout(function () {
            that.rowRenderer.setFocusedCell(rowIndex, colKey);
        }, 10);
    }

    public getSortModel() {
        return this.columnController.getSortModel();
    }

    public setSortModel(sortModel: any) {
        this.columnController.setSortModel(sortModel);
        this.onSortingChanged();
    }

    public onSortingChanged() {
        this.eventService.dispatchEvent(Events.EVENT_BEFORE_SORT_CHANGED);
        this.headerRenderer.updateSortIcons();
        if (this.gridOptionsWrapper.isEnableServerSideSorting()) {
            // if doing server side sorting, changing the sort has the impact
            // of resetting the datasource
            this.setDatasource();
        } else {
            // if doing in memory sorting, we just update the in memory data
            this.updateModelAndRefresh(Constants.STEP_SORT);
        }
        this.eventService.dispatchEvent(Events.EVENT_AFTER_SORT_CHANGED);
    }

    public addVirtualRowListener(eventName: string, rowIndex: number, callback: Function): void {
        var listenersMap = this.virtualRowListeners[eventName];
        if (!listenersMap) {
            console.warn('ag-Grid: invalid listener type ' + eventName + ', expected values are ' + Object.keys(this.virtualRowListeners));
            return;
        }
        if (!listenersMap[rowIndex]) {
            listenersMap[rowIndex] = [];
        }
        listenersMap[rowIndex].push(callback);
    }

    public onVirtualRowSelected(rowIndex: number, selected: boolean): void {
        // inform the callbacks of the event
        var listenersMap = this.virtualRowListeners[Grid.VIRTUAL_ROW_SELECTED];
        if (listenersMap[rowIndex]) {
            listenersMap[rowIndex].forEach(function (callback: any) {
                if (typeof callback === 'function') {
                    callback(selected);
                }
            });
        }
        this.rowRenderer.onRowSelected(rowIndex, selected);
    }

    public onVirtualRowRemoved(rowIndex: number) {
        // inform the callbacks of the event
        var listenersMap = this.virtualRowListeners[Grid.VIRTUAL_ROW_REMOVED];
        if (listenersMap[rowIndex]) {
            listenersMap[rowIndex].forEach(function (callback:any) {
                if (typeof callback === 'function') {
                    callback();
                }
            });
        }
        this.removeVirtualCallbacksForRow(rowIndex);
    }

    private removeVirtualCallbacksForRow(rowIndex: number) {
        delete this.virtualRowListeners[Grid.VIRTUAL_ROW_REMOVED][rowIndex];
        delete this.virtualRowListeners[Grid.VIRTUAL_ROW_SELECTED][rowIndex];
    }

    public setColumnDefs(colDefs?: ColDef[]) {
        if (colDefs) {
            this.gridOptions.columnDefs = colDefs;
        }
        this.setupColumns();
        this.updateModelAndRefresh(Constants.STEP_EVERYTHING);
        // found that adding pinned column can upset the layout
        this.doLayout();
    }

    public updateBodyContainerWidthAfterColResize() {
        this.rowRenderer.setMainRowWidths();
        this.gridPanel.setBodyContainerWidth();
    }

    public updatePinnedColContainerWidthAfterColResize() {
        this.gridPanel.setPinnedColContainerWidth();
        this.headerRenderer.setPinnedColContainerWidth();
    }

    public doLayout() {
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
            this.eventService.dispatchEvent(Events.EVENT_GRID_SIZE_CHANGED, event);
        }
    }
}
