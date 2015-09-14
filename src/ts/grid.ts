/// <reference path="constants.ts" />
/// <reference path="gridOptionsWrapper.ts" />
/// <reference path="utils.ts" />
/// <reference path="filter/filterManager.ts" />
/// <reference path="columnController.ts" />
/// <reference path="selectionController.ts" />
/// <reference path="selectionRendererFactory.ts" />
/// <reference path="rendering/rowRenderer.ts" />
/// <reference path="headerRendering/headerRenderer.ts" />
/// <reference path="rowControllers/inMemoryRowController.ts" />
/// <reference path="rowControllers/virtualPageRowController.ts" />
/// <reference path="rowControllers/paginationController.ts" />
/// <reference path="expressionService.ts" />
/// <reference path="templateService.ts" />
/// <reference path="gridPanel/gridPanel.ts" />
/// <reference path="toolPanel/toolPanel.ts" />
/// <reference path="widgets/agPopupService.ts" />
/// <reference path="entities/gridOptions.ts" />
/// <reference path="gridApi.ts" />
/// <reference path="valueService.ts" />
/// <reference path="masterSlaveService.ts" />
/// <reference path="logger.ts" />

module awk.grid {

    export class Grid {

        private virtualRowCallbacks = <any>{};
        private gridOptions: GridOptions;
        private gridOptionsWrapper: GridOptionsWrapper;
        private inMemoryRowController: InMemoryRowController;
        private doingVirtualPaging: boolean;
        private paginationController: PaginationController;
        private virtualPageRowController: VirtualPageRowController;
        private finished: boolean;

        private selectionController: SelectionController;
        private columnController: ColumnController;
        private rowRenderer: RowRenderer;
        private headerRenderer: HeaderRenderer;
        private filterManager: FilterManager;
        private valueService: ValueService;
        private masterSlaveService: MasterSlaveService;
        private toolPanel: any;
        private gridPanel: GridPanel;
        private eRootPanel: any;
        private toolPanelShowing: boolean;
        private doingPagination: boolean;
        private rowModel: any;

        constructor(eGridDiv: any, gridOptions: any, genericEventListener: GenericEventListener = null, $scope: any = null, $compile: any = null, quickFilterOnScope: any = null) {

            this.gridOptions = gridOptions;
            this.gridOptionsWrapper = new GridOptionsWrapper(this.gridOptions, genericEventListener);

            this.setupComponents($scope, $compile, eGridDiv);
            this.gridOptions.api = new GridApi(this, this.rowRenderer, this.headerRenderer, this.filterManager,
                this.columnController, this.inMemoryRowController, this.selectionController,
                this.gridOptionsWrapper, this.gridPanel, this.valueService, this.masterSlaveService);
            this.gridOptions.columnApi = this.columnController.getColumnApi();

            var that = this;

            // if using angular, watch for quickFilter changes
            if ($scope) {
                $scope.$watch(quickFilterOnScope, function (newFilter: any) {
                    that.onQuickFilterChanged(newFilter);
                });
            }

            var forPrint = this.gridOptionsWrapper.isDontUseScrolls();
            if (!forPrint) {
                window.addEventListener('resize', this.doLayout.bind(this));
            }

            this.inMemoryRowController.setAllRows(this.gridOptionsWrapper.getRowData());
            this.setupColumns();
            this.updateModelAndRefresh(Constants.STEP_EVERYTHING);

            // if no data provided initially, and not doing infinite scrolling, show the loading panel
            var showLoading = !this.gridOptionsWrapper.getRowData() && !this.gridOptionsWrapper.isVirtualPaging();
            this.showLoadingPanel(showLoading);

            // if datasource provided, use it
            if (this.gridOptionsWrapper.getDatasource()) {
                this.setDatasource();
            }

            this.doLayout();

            this.finished = false;
            this.periodicallyDoLayout();

            // if ready function provided, use it
            var readyParams = {api: gridOptions.api};
            this.gridOptionsWrapper.fireEvent(Constants.EVENT_READY, readyParams);
        }

        public getRowModel(): any {
            return this.rowModel;
        }

        private periodicallyDoLayout() {
            if (!this.finished) {
                var that = this;
                setTimeout(function () {
                    that.doLayout();
                    that.periodicallyDoLayout();
                }, 500);
            }
        }

        private setupComponents($scope: any, $compile: any, eUserProvidedDiv: any) {

            // make local references, to make the below more human readable
            var gridOptionsWrapper = this.gridOptionsWrapper;
            var forPrint = gridOptionsWrapper.isDontUseScrolls();

            // create all the beans
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
            var gridPanel = new GridPanel(gridOptionsWrapper);
            var popupService = new PopupService();
            var valueService = new ValueService();
            var groupCreator = new GroupCreator();
            var masterSlaveService = new MasterSlaveService();
            var loggerFactory = new LoggerFactory(gridOptionsWrapper.isDebug());

            // initialise all the beans
            templateService.init($scope);
            expressionService.init(loggerFactory);
            selectionController.init(this, gridPanel, gridOptionsWrapper, $scope, rowRenderer);
            filterManager.init(this, gridOptionsWrapper, $compile, $scope,
                columnController, popupService, valueService);
            selectionRendererFactory.init(this, selectionController);
            columnController.init(this, selectionRendererFactory, gridOptionsWrapper,
                expressionService, valueService, masterSlaveService);
            rowRenderer.init(columnController, gridOptionsWrapper, gridPanel, this, selectionRendererFactory, $compile,
                $scope, selectionController, expressionService, templateService, valueService);
            headerRenderer.init(gridOptionsWrapper, columnController, gridPanel, this, filterManager,
                $scope, $compile);
            inMemoryRowController.init(gridOptionsWrapper, columnController, this, filterManager, $scope,
                groupCreator, valueService);
            virtualPageRowController.init(rowRenderer, gridOptionsWrapper, this);
            gridPanel.init(columnController, rowRenderer, masterSlaveService);
            valueService.init(gridOptionsWrapper, expressionService, columnController);
            groupCreator.init(valueService);
            masterSlaveService.init(gridOptionsWrapper, columnController, gridPanel, loggerFactory);

            var toolPanelLayout: any = null;
            var toolPanel: any = null;
            if (!forPrint) {
                toolPanel = new ToolPanel();
                toolPanelLayout = toolPanel.layout;
                toolPanel.init(columnController, inMemoryRowController, gridOptionsWrapper, popupService);
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
            if (!forPrint) {
                paginationController = new PaginationController();
                paginationController.init(this, gridOptionsWrapper);
                paginationGui = paginationController.getGui();
            }

            this.rowModel = rowModel;
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

            this.eRootPanel = new BorderLayout({
                center: gridPanel.getLayout(),
                east: toolPanelLayout,
                south: paginationGui,
                dontFill: forPrint,
                name: 'eRootPanel'
            });
            popupService.init(this.eRootPanel.getGui());

            // default is we don't show paging panel, this is set to true when datasource is set
            this.eRootPanel.setSouthVisible(false);

            // see what the grid options are for default of toolbar
            this.showToolPanel(gridOptionsWrapper.isShowToolPanel());

            eUserProvidedDiv.appendChild(this.eRootPanel.getGui());

            columnController.addChangeListener( (event: ColumnChangeEvent) => {
                if (event.isPivotChanged()) {
                    this.inMemoryRowController.onPivotChanged();
                }
                if (event.isValueChanged()) {
                    this.inMemoryRowController.doAggregate();
                }

                if (event.isIndividualColumnResized()) {
                    this.onIndividualColumnResized(event.getColumn());
                } else {
                    this.refreshHeaderAndBody();
                }

                this.gridPanel.showPinnedColContainersIfNeeded();
            });
        }

        private onIndividualColumnResized(column: Column): void {
            this.headerRenderer.onIndividualColumnResized(column);
            this.rowRenderer.onIndividualColumnResized(column);
            if (column.pinned) {
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
                showPagingPanel = false;
            } else if (this.doingPagination) {
                this.paginationController.setDatasource(datasourceToUse);
                this.virtualPageRowController.setDatasource(null);
                this.rowModel = this.inMemoryRowController.getModel();
                showPagingPanel = true;
            } else {
                this.paginationController.setDatasource(null);
                this.virtualPageRowController.setDatasource(null);
                this.rowModel = this.inMemoryRowController.getModel();
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
            this.headerRenderer.refreshHeader();
            this.headerRenderer.updateFilterIcons();
            this.headerRenderer.updateSortIcons();
            this.gridPanel.setBodyContainerWidth();
            this.gridPanel.setPinnedColContainerWidth();
            this.rowRenderer.refreshView();
        }

        public setFinished() {
            window.removeEventListener('resize', this.doLayout);
            this.finished = true;
        }

        public onQuickFilterChanged(newFilter: any) {
            var actuallyChanged = this.filterManager.setQuickFilter(newFilter);
            if (actuallyChanged) {
                this.onFilterChanged();
            }
        }

        public onFilterModified() {
            this.gridOptionsWrapper.fireEvent(Constants.EVENT_FILTER_MODIFIED);
        }

        public onFilterChanged() {
            this.gridOptionsWrapper.fireEvent(Constants.EVENT_BEFORE_FILTER_CHANGED);
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
            this.gridOptionsWrapper.fireEvent(Constants.EVENT_AFTER_FILTER_CHANGED);
        }

        public onRowClicked(event: any, rowIndex: any, node: any) {

            var params = {
                node: node,
                data: node.data,
                event: event,
                rowIndex: rowIndex
            };
            this.gridOptionsWrapper.fireEvent(Constants.EVENT_ROW_CLICKED, params)

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

            // ctrlKey for windows, metaKey for Apple
            var ctrlKeyPressed = event.ctrlKey || event.metaKey;

            var doDeselect = ctrlKeyPressed
                && selectionController.isNodeSelected(node)
                && gridOptionsWrapper.isRowDeselection();

            if (doDeselect) {
                selectionController.deselectNode(node);
            } else {
                var tryMulti = ctrlKeyPressed;
                selectionController.selectNode(node, tryMulti);
            }
        }

        public showLoadingPanel(show: any) {
            this.gridPanel.showLoading(show);
        }

        private setupColumns() {
            this.columnController.onColumnsChanged();
            this.gridPanel.showPinnedColContainersIfNeeded();
        }

        // rowsToRefresh is at what index to start refreshing the rows. the assumption is
        // if we are expanding or collapsing a group, then only he rows below the group
        // need to be refresh. this allows the context (eg focus) of the other cells to
        // remain.
        public updateModelAndRefresh(step: any, refreshFromIndex?: any) {
            this.inMemoryRowController.updateModel(step);
            this.rowRenderer.refreshView(refreshFromIndex);
        }

        public setRows(rows?: any, firstId?: any) {
            if (rows) {
                this.gridOptions.rowData = rows;
            }
            this.inMemoryRowController.setAllRows(this.gridOptionsWrapper.getRowData(), firstId);
            this.selectionController.deselectAll();
            this.filterManager.onNewRowsLoaded();
            this.updateModelAndRefresh(Constants.STEP_EVERYTHING);
            this.headerRenderer.updateFilterIcons();
            this.showLoadingPanel(false);
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

        public setFocusedCell(rowIndex: any, colIndex: any) {
            this.gridPanel.ensureIndexVisible(rowIndex);
            this.gridPanel.ensureColIndexVisible(colIndex);
            var that = this;
            setTimeout(function () {
                that.rowRenderer.setFocusedCell(rowIndex, colIndex);
            }, 10);
        }

        public getSortModel() {
            var allColumns = this.columnController.getAllColumns();
            var columnsWithSorting = <any>[];
            var i: any;
            for (i = 0; i < allColumns.length; i++) {
                if (allColumns[i].sort) {
                    columnsWithSorting.push(allColumns[i]);
                }
            }
            columnsWithSorting.sort(function (a: any, b: any) {
                return a.sortedAt - b.sortedAt;
            });

            var result = <any>[];
            for (i = 0; i < columnsWithSorting.length; i++) {
                var resultEntry = {
                    colId: columnsWithSorting[i].colId,
                    sort: columnsWithSorting[i].sort
                };
                result.push(resultEntry);
            }

            return result;
        }

        public setSortModel(sortModel: any) {
            if (!this.gridOptionsWrapper.isEnableSorting()) {
                console.warn('ag-grid: You are setting the sort model on a grid that does not have sorting enabled');
                return;
            }
            // first up, clear any previous sort
            var sortModelProvided = sortModel !== null && sortModel !== undefined && sortModel.length > 0;
            var allColumns = this.columnController.getAllColumns();
            for (var i = 0; i < allColumns.length; i++) {
                var column = allColumns[i];

                var sortForCol: any = null;
                var sortedAt = -1;
                if (sortModelProvided && !column.colDef.suppressSorting) {
                    for (var j = 0; j < sortModel.length; j++) {
                        var sortModelEntry = sortModel[j];
                        if (typeof sortModelEntry.colId === 'string'
                            && typeof column.colId === 'string'
                            && sortModelEntry.colId === column.colId) {
                            sortForCol = sortModelEntry.sort;
                            sortedAt = j;
                        }
                    }
                }

                if (sortForCol) {
                    column.sort = sortForCol;
                    column.sortedAt = sortedAt;
                } else {
                    column.sort = null;
                    column.sortedAt = null;
                }
            }

            this.onSortingChanged();
        }

        public onSortingChanged() {
            this.gridOptionsWrapper.fireEvent(Constants.EVENT_BEFORE_SORT_CHANGED);
            this.headerRenderer.updateSortIcons();
            if (this.gridOptionsWrapper.isEnableServerSideSorting()) {
                // if doing server side sorting, changing the sort has the impact
                // of resetting the datasource
                this.setDatasource();
            } else {
                // if doing in memory sorting, we just update the in memory data
                this.updateModelAndRefresh(Constants.STEP_SORT);
            }
            this.gridOptionsWrapper.fireEvent(Constants.EVENT_AFTER_SORT_CHANGED);
        }

        public addVirtualRowListener(rowIndex: any, callback: any) {
            if (!this.virtualRowCallbacks[rowIndex]) {
                this.virtualRowCallbacks[rowIndex] = [];
            }
            this.virtualRowCallbacks[rowIndex].push(callback);
        }

        public onVirtualRowSelected(rowIndex: any, selected: any) {
            // inform the callbacks of the event
            if (this.virtualRowCallbacks[rowIndex]) {
                this.virtualRowCallbacks[rowIndex].forEach(function (callback: any) {
                    if (typeof callback.rowRemoved === 'function') {
                        callback.rowSelected(selected);
                    }
                });
            }
            this.rowRenderer.onRowSelected(rowIndex, selected);
        }

        public onVirtualRowRemoved(rowIndex: any) {
            // inform the callbacks of the event
            if (this.virtualRowCallbacks[rowIndex]) {
                this.virtualRowCallbacks[rowIndex].forEach(function (callback: any) {
                    if (typeof callback.rowRemoved === 'function') {
                        callback.rowRemoved();
                    }
                });
            }
            // remove the callbacks
            delete this.virtualRowCallbacks[rowIndex];
        }

        public onNewCols() {
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
        }

        public doLayout() {
            // need to do layout first, as drawVirtualRows and setPinnedColHeight
            // need to know the result of the resizing of the panels.
            var sizeChanged = this.eRootPanel.doLayout();
            // both of the two below should be done in gridPanel, the gridPanel should register 'resize' to the panel
            if (sizeChanged) {
                this.rowRenderer.drawVirtualRows();
            }
        }
    }
}

