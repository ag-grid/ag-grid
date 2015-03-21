
// ideas:
// moving & hiding columns
// allow sort (and clear) via api
// allow filter (and clear) via api
// allow 'scroll to row' via api
// pinned columns not using scrollbar property (see website example)
// provide example of file browsing, then ansewr: http://stackoverflow.com/questions/22775031/hierarchical-grid-in-angular-js
// fill width of columns option
// reorder columns (popup)
// reorder columns (drag)
// allow dragging outside grid (currently last col can't be resized)
// selecting should be like excel, and have keyboard navigation
// filtering blocks the aggregations - the summary numbers go missing!!
// should not be able to edit groups
// editing a checkbox field fails

/* breaking changes:

 row records now stored in 'node' objects, previously records were stored directing in a list (with the exception of
 group rows). each node object has attribute 'data' with the rows data. in addition, the following attributes also
 exist:
  -> parent (reference to the parent node, if it exists)
  -> group - set to 'true' if this node is a group node (ie has children)
      -> children: the groups children
      -> field: the field grouped by (for information purposes only, if doing your own grouping, not needed)
      -> key: the group key (what text to display beside the group when rendering)
      -> expanded: whether the group is expanded or not
      -> allChildrenCount: how many children (including grand children) this group has. number is displayed
                           in brackets beside the group, set to -1 if doing own group and don't want this displayed
      -> level: group level, 0 is top most level. use this to add padding to your cell, if displaying something
                in the group column

 for selection, the grid now works off nodes, so a list of 'selectedNodes' as well as 'selectedRows' is kept (the
 nodes is the primary, each time this changes, the grid updates selectedRows, the user can choose which one to work
 off).

 all the callbacks, where 'params' is passed, now 'node' is also passed inside the param object.

*/

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

    var module = angular.module("angularGrid", []);

    module.directive("angularGrid", function () {
        return {
            restrict: "A",
            controller: ['$scope', '$element', '$compile', '$timeout', Grid],
            scope: {
                angularGrid: "="
            }
        };
    });

    function Grid($scope, $element, $compile, $timeout) {

        this.gridOptions = $scope.angularGrid;
        if (!this.gridOptions) {
            console.warn("WARNING - grid options for angularGrid not found. Please ensure the attribute angular-grid points to a valid object on the scope");
            return;
        }
        this.gridOptionsWrapper = new GridOptionsWrapper(this.gridOptions);

        var useScrolls = !this.gridOptionsWrapper.isDontUseScrolls();
        if (useScrolls) {
            $element[0].innerHTML = template;
        } else {
            $element[0].innerHTML = templateNoScrolls;
        }

        var that = this;
        $scope.grid = this;
        this.$scope = $scope;
        this.$compile = $compile;
        this.quickFilter = null;

        $scope.$watch("angularGrid.quickFilterText", function (newFilter) {
            that.onQuickFilterChanged(newFilter);
        });

        this.virtualRowCallbacks = {};

        this.addApi();
        this.findAllElements($element);

        this.rowModel = new RowModel();

        this.selectionController = new SelectionController();
        var selectionRendererFactory = new SelectionRendererFactory(this, this.selectionController);

        this.colModel = new ColModel(this, selectionRendererFactory);
        this.filterManager = new FilterManager(this, this.rowModel, this.gridOptionsWrapper, $compile, $scope);
        this.rowController = new RowController(this.gridOptionsWrapper, this.rowModel, this.colModel, this,
                                this.filterManager);
        this.rowRenderer = new RowRenderer(this.gridOptions, this.rowModel, this.colModel, this.gridOptionsWrapper,
                                $element[0], this, selectionRendererFactory, $compile, $scope, $timeout,
                                this.selectionController);
        this.headerRenderer = new HeaderRenderer(this.gridOptionsWrapper, this.colModel, $element[0], this,
                                this.filterManager, $scope, $compile);

        this.rowController.setAllRows(this.gridOptionsWrapper.getAllRows());

        this.selectionController.init(this, this.eRowsParent, this.gridOptionsWrapper, this.rowModel, $scope, this.rowRenderer);

        if (useScrolls) {
            this.addScrollListener();
            this.setBodySize(); //setting sizes of body (containing viewports), doesn't change container sizes
        }

        //done when cols change
        this.setupColumns();

        //done when rows change
        this.updateModelAndRefresh(constants.STEP_EVERYTHING);

        //flag to mark when the directive is destroyed
        this.finished = false;
        $scope.$on("$destroy", function () {
            that.finished = true;
        });
    }

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
            this.gridOptions.rowClicked(node.rowData, event);
        }

        // if no selection method enabled, do nothing
        if (!this.gridOptionsWrapper.isRowSelection()) {
            return;
        }

        // if click selection suppressed, do nothing
        if (this.gridOptionsWrapper.isSuppressRowClickSelection()) {
            return;
        }

        var tryMulti = event.ctrlKey;
        this.selectionController.selectNode(node, tryMulti);
    };

    Grid.prototype.setHeaderHeight = function () {
        var headerHeight = this.gridOptionsWrapper.getHeaderHeight();
        var headerHeightPixels = headerHeight + 'px';
        var dontUseScrolls = this.gridOptionsWrapper.isDontUseScrolls();
        if (dontUseScrolls) {
            this.eHeaderContainer.style['height'] = headerHeightPixels;
        } else {
            this.eHeader.style['height'] = headerHeightPixels;
            this.eBody.style['padding-top'] = headerHeightPixels;
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
        var _this = this;
        var api = {
            onNewRows: function () {
                _this.rowController.setAllRows(_this.gridOptionsWrapper.getAllRows());
                _this.selectionController.clearSelection();
                _this.filterManager.onNewRowsLoaded();
                _this.updateModelAndRefresh(constants.STEP_EVERYTHING);
                _this.headerRenderer.updateFilterIcons();
            },
            onNewCols: function () {
                _this.onNewCols();
            },
            unselectAll: function () {
                _this.selectionController.clearSelection();
                _this.rowRenderer.refreshView();
            },
            refreshView: function () {
                _this.rowRenderer.refreshView();
            },
            getModel: function () {
                _this.rowModel;
            },
            onGroupExpandedOrCollapsed: function() {
                _this.updateModelAndRefresh(constants.STEP_MAP);
            },
            expandAll: function() {
                _this.expandOrCollapseAll(true, null);
                _this.updateModelAndRefresh(constants.STEP_MAP);
            },
            collapseAll: function() {
                _this.expandOrCollapseAll(false, null);
                _this.updateModelAndRefresh(constants.STEP_MAP);
            },
            addVirtualRowListener: function(rowIndex, callback) {
                _this.addVirtualRowListener(rowIndex, callback);
            },
            rowDataChanged: function(rows) {
                _this.rowRenderer.rowDataChanged(rows);
            },
            selectIndex: function(index, tryMulti) {
                _this.selectionController.selectIndex(index, tryMulti);
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

    Grid.prototype.findAllElements = function ($element) {
        var eGrid = $element[0];

        if (this.gridOptionsWrapper.isDontUseScrolls()) {
            this.eRoot = eGrid.querySelector(".ag-root");
            this.eHeaderContainer = eGrid.querySelector(".ag-header-container");
            this.eBodyContainer = eGrid.querySelector(".ag-body-container");
            // for no-scrolls, all rows live in the body container
            this.eRowsParent = this.eBodyContainer;
        } else {
            this.eRoot = eGrid.querySelector(".ag-root");
            this.eBody = eGrid.querySelector(".ag-body");
            this.eBodyContainer = eGrid.querySelector(".ag-body-container");
            this.eBodyViewport = eGrid.querySelector(".ag-body-viewport");
            this.eBodyViewportWrapper = eGrid.querySelector(".ag-body-viewport-wrapper");
            this.ePinnedColsContainer = eGrid.querySelector(".ag-pinned-cols-container");
            this.ePinnedColsViewport = eGrid.querySelector(".ag-pinned-cols-viewport");
            this.ePinnedHeader = eGrid.querySelector(".ag-pinned-header");
            this.eHeader = eGrid.querySelector(".ag-header");
            this.eHeaderContainer = eGrid.querySelector(".ag-header-container");
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



});
