
// ideas:
// moving & hiding columns
// allow sort (and clear) via api
// allow filter (and clear) via api
// allow 'scroll to row' via api
// pinned columns not using scrollbar property (see website example)
// provide example of file browsing, then answer: http://stackoverflow.com/questions/22775031/hierarchical-grid-in-angular-js
// fill width of columns option
// reorder columns (popup)
// reorder columns (drag)
// allow dragging outside grid (currently last col can't be resized)
// selecting should be like excel, and have keyboard navigation
// should not be able to edit groups

// bugs:
// editing a checkbox field fails

define([
    'angular',
    'text!./template.html',
    'text!./templateNoScrolls.html',
    './utils',
    './filter/filterManager',
    './rowModel',
    './rowController',
    './rowRenderer',
    './headerRenderer',
    './gridOptionsWrapper',
    './constants',
    './colModel',
    './selectionRendererFactory',
    './selectionController',
    'css!./css/core.css',
    'css!./css/theme-dark.css',
    'css!./css/theme-fresh.css'
], function(angular, template, templateNoScrolls, utils, FilterManager,
            RowModel, RowController, RowRenderer, HeaderRenderer, GridOptionsWrapper,
            constants, ColModel, SelectionRendererFactory, SelectionController) {

    // if angular is present, register the directive
    if (angular) {
        var angularModule = angular.module("angularGrid", []);
        angularModule.directive("angularGrid", function () {
            return {
                restrict: "A",
                controller: ['$element', '$scope', '$compile', AngularDirectiveController],
                scope: {
                    angularGrid: "="
                }
            };
        });
    }

    // this function is used for creating a grid, outside of any AngularJS
    function angularGridGlobalFunction(element, gridOptions) {
        // see if element is a query selector, or a real element
        var eGridDiv;
        if (typeof element === 'string') {
            eGridDiv = document.querySelector(element);
            if (!eGridDiv) {
                console.log('WARNING - was not able to find element ' + element + ' in the DOM, Angular Grid initialisation aborted.');
                return;
            }
        }
        new Grid(eGridDiv, gridOptions, null, null);
    }

    function AngularDirectiveController($element, $scope, $compile) {
        var eGridDiv = $element[0];
        var gridOptions = $scope.angularGrid;
        if (!gridOptions) {
            console.warn("WARNING - grid options for Angular Grid not found. Please ensure the attribute angular-grid points to a valid object on the scope");
            return;
        }
        var grid = new Grid(eGridDiv, gridOptions, $scope, $compile);

        $scope.$on("$destroy", function () {
            grid.setFinished();
        });
    }

    function Grid(eGridDiv, gridOptions, $scope, $compile) {

        this.gridOptions = gridOptions;
        this.gridOptionsWrapper = new GridOptionsWrapper(this.gridOptions);

        var useScrolls = !this.gridOptionsWrapper.isDontUseScrolls();
        if (useScrolls) {
            eGridDiv.innerHTML = template;
        } else {
            eGridDiv.innerHTML = templateNoScrolls;
        }

        var that = this;
        this.$scope = $scope;
        this.$compile = $compile;
        this.quickFilter = null;

        // if using angular, watch for quickFilter changes
        if ($scope) {
            $scope.$watch("angularGrid.quickFilterText", function (newFilter) {
                that.onQuickFilterChanged(newFilter);
            });
        }

        this.virtualRowCallbacks = {};

        this.addApi();
        this.findAllElements(eGridDiv);

        this.rowModel = new RowModel();

        this.selectionController = new SelectionController();
        var selectionRendererFactory = new SelectionRendererFactory(this, this.selectionController);

        this.colModel = new ColModel(this, selectionRendererFactory);
        this.filterManager = new FilterManager(this, this.rowModel, this.gridOptionsWrapper, $compile, $scope);
        this.rowController = new RowController(this.gridOptionsWrapper, this.rowModel, this.colModel, this,
                                this.filterManager, $scope);
        this.rowRenderer = new RowRenderer(this.gridOptions, this.rowModel, this.colModel, this.gridOptionsWrapper,
                                eGridDiv, this, selectionRendererFactory, $compile, $scope,
                                this.selectionController);
        this.headerRenderer = new HeaderRenderer(this.gridOptionsWrapper, this.colModel, eGridDiv, this,
                                this.filterManager, $scope, $compile);

        this.rowController.setAllRows(this.gridOptionsWrapper.getAllRows());

        this.selectionController.init(this, this.eRowsParent, this.gridOptionsWrapper, this.rowModel, $scope, this.rowRenderer);

        if (useScrolls) {
            this.addScrollListener();
            this.setBodySize(); //setting sizes of body (containing viewports), doesn't change container sizes
        }

        // done when cols change
        this.setupColumns();

        // done when rows change
        this.updateModelAndRefresh(constants.STEP_EVERYTHING);

        // flag to mark when the directive is destroyed
        this.finished = false;

        // if no data provided initially, show the loading panel
        var showLoading = !this.gridOptionsWrapper.getAllRows();
        this.showLoadingPanel(showLoading);
    }

    Grid.prototype.setFinished = function () {
        this.finished = true;
    };

    Grid.prototype.getPopupParent = function () {
        return this.eRoot;
    };

    Grid.prototype.getQuickFilter = function () {
        return this.quickFilter;
    };

    Grid.prototype.onQuickFilterChanged = function (newFilter) {
        if (newFilter === undefined || newFilter === "") {
            newFilter = null;
        }
        if (this.quickFilter !== newFilter) {
            //want 'null' to mean to filter, so remove undefined and empty string
            if (newFilter===undefined || newFilter==="") {
                newFilter = null;
            }
            if (newFilter !== null) {
                newFilter = newFilter.toUpperCase();
            }
            this.quickFilter = newFilter;
            this.onFilterChanged();
        }
    };

    Grid.prototype.onFilterChanged = function () {
        this.updateModelAndRefresh(constants.STEP_FILTER);
        this.headerRenderer.updateFilterIcons();
    };

    Grid.prototype.onRowClicked = function (event, rowIndex) {

        var node = this.rowModel.getRowsAfterMap()[rowIndex];
        if (this.gridOptions.rowClicked) {
            var params = {node: node, data: node.data, event: event};
            this.gridOptions.rowClicked(params);
        }

        // if no selection method enabled, do nothing
        if (!this.gridOptionsWrapper.isRowSelection()) {
            return;
        }

        // if click selection suppressed, do nothing
        if (this.gridOptionsWrapper.isSuppressRowClickSelection()) {
            return;
        }

        // ctrlKey for windows, metaKey for Apple
        var tryMulti = event.ctrlKey || event.metaKey;
        this.selectionController.selectNode(node, tryMulti);
    };

    Grid.prototype.setHeaderHeight = function () {
        var headerHeight = this.gridOptionsWrapper.getHeaderHeight();
        var headerHeightPixels = headerHeight + 'px';
        var dontUseScrolls = this.gridOptionsWrapper.isDontUseScrolls();
        if (dontUseScrolls) {
            this.eHeaderContainer.style['height'] = headerHeightPixels;
            //this.eLoadingPanel.style['margin-top'] = headerHeightPixels;
        } else {
            this.eHeader.style['height'] = headerHeightPixels;
            this.eBody.style['padding-top'] = headerHeightPixels;
            //this.eLoadingPanel.style['margin-top'] = headerHeightPixels;
        }
    };

    Grid.prototype.showLoadingPanel = function (show) {
        if (show) {
            this.eLoadingPanel.style.display = 'table';
        } else {
            this.eLoadingPanel.style.display = 'none';
        }
    };

    Grid.prototype.setupColumns = function () {
        this.setHeaderHeight();
        var pinnedColCount = this.gridOptionsWrapper.getPinnedColCount();
        this.colModel.setColumnDefs(this.gridOptions.columnDefs, pinnedColCount);
        this.showPinnedColContainersIfNeeded();
        this.headerRenderer.insertHeader();
        if (!this.gridOptionsWrapper.isDontUseScrolls()) {
            this.setPinnedColContainerWidth();
            this.setBodyContainerWidth();
        }
        this.headerRenderer.updateFilterIcons();
    };

    Grid.prototype.setBodyContainerWidth = function () {
        var mainRowWidth = this.colModel.getTotalUnpinnedColWidth() + "px";
        this.eBodyContainer.style.width = mainRowWidth;
    };

    Grid.prototype.updateModelAndRefresh = function (step) {
        this.rowController.updateModel(step);
        this.rowRenderer.refreshView();
    };

    Grid.prototype.addApi = function () {
        var that = this;
        var api = {
            onNewRows: function () {
                that.rowController.setAllRows(that.gridOptionsWrapper.getAllRows());
                that.selectionController.clearSelection();
                that.filterManager.onNewRowsLoaded();
                that.updateModelAndRefresh(constants.STEP_EVERYTHING);
                that.headerRenderer.updateFilterIcons();
                that.showLoadingPanel(false);
            },
            onNewCols: function () {
                that.onNewCols();
            },
            unselectAll: function () {
                that.selectionController.clearSelection();
                that.rowRenderer.refreshView();
            },
            refreshView: function () {
                that.rowRenderer.refreshView();
            },
            getModel: function () {
                return that.rowModel;
            },
            onGroupExpandedOrCollapsed: function() {
                that.updateModelAndRefresh(constants.STEP_MAP);
            },
            expandAll: function() {
                that.expandOrCollapseAll(true, null);
                that.updateModelAndRefresh(constants.STEP_MAP);
            },
            collapseAll: function() {
                that.expandOrCollapseAll(false, null);
                that.updateModelAndRefresh(constants.STEP_MAP);
            },
            addVirtualRowListener: function(rowIndex, callback) {
                that.addVirtualRowListener(rowIndex, callback);
            },
            rowDataChanged: function(rows) {
                that.rowRenderer.rowDataChanged(rows);
            },
            setQuickFilter: function(newFilter) {
                that.onQuickFilterChanged(newFilter)
            },
            selectIndex: function(index, tryMulti) {
                that.selectionController.selectIndex(index, tryMulti);
            },
            showLoading: function(show) {
                that.showLoadingPanel(show);
            }
        };
        this.gridOptions.api = api;
    };

    Grid.prototype.addVirtualRowListener = function(rowIndex, callback) {
        if (!this.virtualRowCallbacks[rowIndex]) {
            this.virtualRowCallbacks[rowIndex] = [];
        }
        this.virtualRowCallbacks[rowIndex].push(callback);
    };

    Grid.prototype.onVirtualRowSelected = function(rowIndex, selected) {
        // inform the callbacks of the event
        if (this.virtualRowCallbacks[rowIndex]) {
            this.virtualRowCallbacks[rowIndex].forEach( function (callback) {
                if (typeof callback.rowRemoved === 'function') {
                    callback.rowSelected(selected);
                }
            });
        }
    };

    Grid.prototype.onVirtualRowRemoved = function(rowIndex) {
        // inform the callbacks of the event
        if (this.virtualRowCallbacks[rowIndex]) {
            this.virtualRowCallbacks[rowIndex].forEach( function (callback) {
                if (typeof callback.rowRemoved === 'function') {
                    callback.rowRemoved();
                }
            });
        }
        // remove the callbacks
        delete this.virtualRowCallbacks[rowIndex];
    };

    Grid.prototype.expandOrCollapseAll = function(expand, rowNodes) {
        //if first call in recursion, we set list to parent list
        if (rowNodes==null) { rowNodes = this.rowModel.getRowsAfterGroup(); }

        if (!rowNodes) { return; }

        var _this = this;
        rowNodes.forEach(function(node) {
            if (node.group) {
                node.expanded = expand;
                _this.expandOrCollapseAll(expand, node.children);
            }
        });
    };

    Grid.prototype.onNewCols = function () {
        this.setupColumns();
        this.updateModelAndRefresh(constants.STEP_EVERYTHING);
    };

    Grid.prototype.findAllElements = function (eGridDiv) {
        if (this.gridOptionsWrapper.isDontUseScrolls()) {
            this.eRoot = eGridDiv.querySelector(".ag-root");
            this.eHeaderContainer = eGridDiv.querySelector(".ag-header-container");
            this.eBodyContainer = eGridDiv.querySelector(".ag-body-container");
            this.eLoadingPanel = eGridDiv.querySelector('.ag-loading-panel');
                // for no-scrolls, all rows live in the body container
            this.eRowsParent = this.eBodyContainer;
        } else {
            this.eRoot = eGridDiv.querySelector(".ag-root");
            this.eBody = eGridDiv.querySelector(".ag-body");
            this.eBodyContainer = eGridDiv.querySelector(".ag-body-container");
            this.eBodyViewport = eGridDiv.querySelector(".ag-body-viewport");
            this.eBodyViewportWrapper = eGridDiv.querySelector(".ag-body-viewport-wrapper");
            this.ePinnedColsContainer = eGridDiv.querySelector(".ag-pinned-cols-container");
            this.ePinnedColsViewport = eGridDiv.querySelector(".ag-pinned-cols-viewport");
            this.ePinnedHeader = eGridDiv.querySelector(".ag-pinned-header");
            this.eHeader = eGridDiv.querySelector(".ag-header");
            this.eHeaderContainer = eGridDiv.querySelector(".ag-header-container");
            this.eLoadingPanel = eGridDiv.querySelector('.ag-loading-panel');
            // for scrolls, all rows live in eBody (containing pinned and normal body)
            this.eRowsParent = this.eBody;
        }
    };

    Grid.prototype.showPinnedColContainersIfNeeded = function () {
        // no need to do this if not using scrolls
        if (this.gridOptionsWrapper.isDontUseScrolls()) {
            return;
        }

        var showingPinnedCols = this.gridOptionsWrapper.getPinnedColCount() > 0;

        //some browsers had layout issues with the blank divs, so if blank,
        //we don't display them
        if (showingPinnedCols) {
            this.ePinnedHeader.style.display = 'inline-block';
            this.ePinnedColsViewport.style.display = 'inline';
        } else {
            this.ePinnedHeader.style.display = 'none';
            this.ePinnedColsViewport.style.display = 'none';
        }
    };

    Grid.prototype.updateBodyContainerWidthAfterColResize = function() {
        this.rowRenderer.setMainRowWidths();
        this.setBodyContainerWidth();
    };

    Grid.prototype.updatePinnedColContainerWidthAfterColResize = function() {
        this.setPinnedColContainerWidth();
    };

    Grid.prototype.setPinnedColContainerWidth = function () {
        var pinnedColWidth = this.colModel.getTotalPinnedColWidth() + "px";
        this.ePinnedColsContainer.style.width = pinnedColWidth;
        this.eBodyViewportWrapper.style.marginLeft = pinnedColWidth;
    };

    //see if a grey box is needed at the bottom of the pinned col
    Grid.prototype.setPinnedColHeight = function () {
        //var bodyHeight = utils.pixelStringToNumber(this.eBody.style.height);
        var scrollShowing = this.eBodyViewport.clientWidth < this.eBodyViewport.scrollWidth;
        var bodyHeight = this.eBodyViewport.offsetHeight;
        if (scrollShowing) {
            this.ePinnedColsViewport.style.height = (bodyHeight - 20) + "px";
        } else {
            this.ePinnedColsViewport.style.height = bodyHeight + "px";
        }
    };

    Grid.prototype.setBodySize = function() {
        var _this = this;

        var bodyHeight = this.eBodyViewport.offsetHeight;

        if (this.bodyHeightLastTime != bodyHeight) {
            this.bodyHeightLastTime = bodyHeight;
            this.setPinnedColHeight();

            //only draw virtual rows if done sort & filter - this
            //means we don't draw rows if table is not yet initialised
            if (this.rowModel.getRowsAfterMap()) {
                this.rowRenderer.drawVirtualRows();
            }
        }

        if (!this.finished) {
            setTimeout(function() {
                _this.setBodySize();
            }, 200);
        }
    };

    Grid.prototype.addScrollListener = function() {
        var _this = this;

        this.eBodyViewport.addEventListener("scroll", function() {
            _this.scrollHeaderAndPinned();
            _this.rowRenderer.drawVirtualRows();
        });
    };

    Grid.prototype.scrollHeaderAndPinned = function() {
        this.eHeaderContainer.style.left = -this.eBodyViewport.scrollLeft + "px";
        this.ePinnedColsContainer.style.top = -this.eBodyViewport.scrollTop + "px";
    };

    return angularGridGlobalFunction;
});
