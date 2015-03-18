
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
    'css!./css/core.css',
    'css!./css/theme-dark.css',
    'css!./css/theme-fresh.css'
], function(angular, template, templateNoScrolls, utils, FilterManager,
            RowModel, RowController, RowRenderer, HeaderRenderer, GridOptionsWrapper,
            constants, ColModel, SelectionRendererFactory) {

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

        this.gridOptions.selectedRows = [];
        this.virtualRowCallbacks = {};

        this.addApi();
        this.findAllElements($element);

        this.rowModel = new RowModel();
        this.rowModel.setAllRows(this.gridOptionsWrapper.getAllRows());

        var selectionRendererFactory = new SelectionRendererFactory(this);

        this.colModel = new ColModel(this, selectionRendererFactory);
        this.filterManager = new FilterManager(this, this.rowModel, this.gridOptionsWrapper, $compile, $scope);
        this.rowController = new RowController(this.gridOptionsWrapper, this.rowModel, this.colModel, this,
                                this.filterManager);
        this.rowRenderer = new RowRenderer(this.gridOptions, this.rowModel, this.colModel, this.gridOptionsWrapper,
                                $element[0], this, selectionRendererFactory, $compile, $scope, $timeout);
        this.headerRenderer = new HeaderRenderer(this.gridOptionsWrapper, this.colModel, $element[0], this,
                                this.filterManager, $scope, $compile);

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

        var row = this.rowModel.getRowsAfterMap()[rowIndex];
        if (this.gridOptions.rowClicked) {
            this.gridOptions.rowClicked(row, event);
        }

        // if no selection method enabled, do nothing
        if (this.gridOptions.rowSelection !== "single" && this.gridOptions.rowSelection !== "multiple") {
            return;
        }

        // if click selection suppressed, do nothing
        if (this.gridOptionsWrapper.isSuppressRowClickSelection()) {
            return;
        }

        var tryMulti = event.ctrlKey;
        this.selectRow(row, tryMulti);
    };

    Grid.prototype.isRowSelected = function(row) {
        return this.gridOptions.selectedRows.indexOf(row) >= 0;
    };

    Grid.prototype.unselectRow = function (rowIndex, row) {
        if (this.gridOptions.selectedRows.indexOf(row)>= 0) {
            this.unselectRowDontFireListeners(rowIndex, row);
            this.gridOptions.selectionChanged();
        }
    };

    Grid.prototype.unselectRowDontFireListeners = function (rowIndex, row) {
        // deselect the css
        utils.querySelectorAll_removeCssClass(this.eRowsParent, '[row="' + rowIndex + '"]', 'ag-row-selected');

        // remove the row
        var selectedRows = this.gridOptions.selectedRows;
        var indexToRemove = selectedRows.indexOf(row);
        selectedRows.splice(indexToRemove, 1);

        // inform virtual row listener
        this.onVirtualRowSelected(rowIndex, false);
    };

    Grid.prototype.selectRow = function (row, tryMulti) {
        var selectedRows = this.gridOptions.selectedRows;
        var multiSelect = this.gridOptions.rowSelection === "multiple" && tryMulti;

        // at the end, if this is true, we inform the callback
        var atLeastOneSelectionChange = false;

        // see if rows to be deselected
        if (!multiSelect) {
            // not doing multi-select, so deselect everything other than the 'just selected' row
            for (var i = (selectedRows.length - 1); i>=0; i--) {
                // skip the 'just selected' row
                if (selectedRows[i] === row) {
                    continue;
                }

                // deselect the css
                var indexOfPreviousSelection = this.rowModel.getRowsAfterMap().indexOf(selectedRows[i]);
                this.unselectRowDontFireListeners(indexOfPreviousSelection, selectedRows[i]);

                atLeastOneSelectionChange = true;
            }
        }

        // see if row needs to be selected
        if (selectedRows.indexOf(row) < 0) {
            selectedRows.push(row);

            // set css class on selected row
            var virtualRowIndex = this.rowModel.getVirtualIndex(row);
            // NOTE: should also check the row renderer - that this row is actually rendered,
            // ie not outside the scrolling viewport
            if (virtualRowIndex >= 0) {
                utils.querySelectorAll_addCssClass(this.eRowsParent, '[row="' + virtualRowIndex + '"]', 'ag-row-selected');

                // inform virtual row listener
                this.onVirtualRowSelected(virtualRowIndex, true);
            }

            // inform the rowSelected listener, if any
            if (typeof this.gridOptions.rowSelected === "function") {
                this.gridOptions.rowSelected(row);
            }

            atLeastOneSelectionChange = true;
        }

        if (atLeastOneSelectionChange && typeof this.gridOptions.selectionChanged === "function") {
            this.gridOptions.selectionChanged();
        }

        this.$scope.$apply();
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
                _this.rowModel.setAllRows(_this.gridOptionsWrapper.getAllRows());
                _this.gridOptions.selectedRows.length = 0;
                _this.filterManager.onNewRowsLoaded();
                _this.updateModelAndRefresh(constants.STEP_EVERYTHING);
                _this.headerRenderer.updateFilterIcons();
            },
            onNewCols: function () {
                _this.onNewCols();
            },
            unselectAll: function () {
                _this.gridOptionsWrapper.clearSelection();
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
            selectRow: function(row, tryMulti) {
                _this.selectRow(row, tryMulti);
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

    Grid.prototype.expandOrCollapseAll = function(expand, list) {
        //if first call in recursion, we set list to parent list
        if (list==null) { list = this.rowModel.getRowsAfterGroup(); }

        if (!list) { return; }

        var _this = this;
        list.forEach(function(item) {
            var itemIsAGroup = item._angularGrid_group; //_angularGrid_group is set to true on groups
            if (itemIsAGroup) {
                item.expanded = expand;
                _this.expandOrCollapseAll(expand, item.children);
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
