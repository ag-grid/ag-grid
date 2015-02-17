
//todo: full row group doesn't work when columns are pinned
//todo: moving & hiding columns
//todo: allow sort (and clear) via api
//todo: allow filter (and clear) via api
//todo: allow custom filtering
//todo: allow null rows to start
//todo: pinned columns not using scrollbar property (see website example)

define([
    "angular",
    "text!./template.html",
    "text!./templateNoScrolls.html",
    "./utils",
    "./filterManager",
    "./rowModel",
    "./rowController",
    "./rowRenderer",
    "./headerRenderer",
    "./gridOptionsWrapper",
    "./constants",
    "css!./css/core.css",
    "css!./css/theme-dark.css",
    "css!./css/theme-fresh.css"
], function(angular, template, templateNoScrolls, utils, FilterManager, RowModel, RowController, RowRenderer, HeaderRenderer, GridOptionsWrapper, constants) {

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

        var _this = this;
        $scope.grid = this;
        this.$scope = $scope;
        this.$compile = $compile;
        this.quickFilter = null;

        $scope.$watch("angularGrid.quickFilterText", function (newFilter) {
            _this.onQuickFilterChanged(newFilter);
        });

        this.gridOptions.selectedRows = [];

        this.addApi();
        this.findAllElements($element);

        this.rowModel = new RowModel();
        this.rowModel.setAllRows(this.gridOptionsWrapper.getAllRows());

        this.filterManager = new FilterManager(this, this.rowModel);
        this.rowController = new RowController(this.gridOptionsWrapper, this.rowModel, this, this.filterManager);
        this.rowRenderer = new RowRenderer(this.gridOptions, this.rowModel, this.gridOptionsWrapper, $element[0], this, $compile, $scope, $timeout);
        this.headerRenderer = new HeaderRenderer(this.gridOptionsWrapper, $element[0], this, this.filterManager);

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
        var _this = this;
        $scope.$on("$destroy", function () {
            _this.finished = true;
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

        //if no selection method enabled, do nothing
        if (this.gridOptions.rowSelection !== "single" && this.gridOptions.rowSelection !== "multiple") {
            return;
        }

        //if not in array, then it's a new selection, thus selected = true
        var selected = this.gridOptions.selectedRows.indexOf(row) < 0;

        if (selected) {
            //if single selection, clear any previous
            if (selected && this.gridOptions.rowSelection === "single") {
                this.gridOptions.selectedRows.length = 0;
                var eRowsWithSelectedClass = this.eBody.querySelectorAll(".ag-row-selected");
                for (var i = 0; i < eRowsWithSelectedClass.length; i++) {
                    utils.removeCssClass(eRowsWithSelectedClass[i], "ag-row-selected");
                }
            }
            this.gridOptions.selectedRows.push(row);
            if (this.gridOptions.rowSelected && typeof this.gridOptions.rowSelected === "function") {
                this.gridOptions.rowSelected(row);
            }
        } else {
            utils.removeFromArray(this.gridOptions.selectedRows, row);
        }

        //update css class on selected row
        var eRows = this.eBody.querySelectorAll("[row='" + rowIndex + "']");
        for (var i = 0; i < eRows.length; i++) {
            if (selected) {
                utils.addCssClass(eRows[i], "ag-row-selected")
            } else {
                utils.removeCssClass(eRows[i], "ag-row-selected")
            }
        }

        if (this.gridOptions.selectionChanged && typeof this.gridOptions.selectionChanged === "function") {
            this.gridOptions.selectionChanged();
        }

        this.$scope.$apply();
    };

    Grid.prototype.setupColumns = function () {
        this.gridOptionsWrapper.ensureEachColHasSize();
        this.showPinnedColContainersIfNeeded();
        this.headerRenderer.insertHeader();
        if (!this.gridOptionsWrapper.isDontUseScrolls()) {
            this.setPinnedColContainerWidth();
            this.setBodyContainerWidth();
        }
        this.headerRenderer.updateFilterIcons();
    };

    Grid.prototype.setBodyContainerWidth = function () {
        var mainRowWidth = this.gridOptionsWrapper.getTotalUnpinnedColWidth() + "px";
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
                _this.filterManager.clearAllFilters();
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
            rowDataChanged: function(rows) {
                _this.rowRenderer.rowDataChanged(rows);
            }
        };
        this.gridOptions.api = api;
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
        this.eRoot = eGrid.querySelector(".ag-root");
        this.eBody = eGrid.querySelector(".ag-body");
        this.eBodyContainer = eGrid.querySelector(".ag-body-container");
        this.eBodyViewport = eGrid.querySelector(".ag-body-viewport");
        this.eBodyViewportWrapper = eGrid.querySelector(".ag-body-viewport-wrapper");
        this.ePinnedColsContainer = eGrid.querySelector(".ag-pinned-cols-container");
        this.ePinnedColsViewport = eGrid.querySelector(".ag-pinned-cols-viewport");
        this.ePinnedHeader = eGrid.querySelector(".ag-pinned-header");
        this.eHeaderContainer = eGrid.querySelector(".ag-header-container");
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
        var pinnedColWidth = this.getTotalPinnedColWidth() + "px";
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

    Grid.prototype.getTotalPinnedColWidth = function() {
        var pinnedColCount = this.gridOptionsWrapper.getPinnedColCount();
        var widthSoFar = 0;
        var colCount = pinnedColCount;
        if (this.gridOptions.columnDefs.length < pinnedColCount) {
            colCount = this.gridOptions.columnDefs.length;
        }
        for (var colIndex = 0; colIndex<colCount; colIndex++) {
            widthSoFar += this.gridOptions.columnDefs[colIndex].actualWidth;
        }
        return widthSoFar;
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
