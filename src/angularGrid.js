
//todo: full row group doesn't work when columns are pinned
//todo: compile into angular
//todo: moving & hiding columns
//todo: grouping

define([
    "angular",
    "text!./angularGrid.html",
    "./utils",
    "./svgFactory",
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
], function(angular, template, utils, SvgFactory, FilterManager, RowModel, RowController, RowRenderer, HeaderRenderer, GridOptionsWrapper, constants) {

    var module = angular.module("angularGrid", []);

    var svgFactory = new SvgFactory();

    module.directive("angularGrid", function () {
        return {
            restrict: "A",
            template: template,
            controller: ["$scope", "$element", "$compile", Grid],
            scope: {
                angularGrid: "="
            }
        };
    });

    function Grid($scope, $element, $compile) {

        var _this = this;
        $scope.grid = this;
        this.$scope = $scope;
        this.$compile = $compile;
        this.gridOptions = $scope.angularGrid;
        this.gridOptionsWrapper = new GridOptionsWrapper(this.gridOptions);
        this.quickFilter = null;

        $scope.$watch("angularGrid.quickFilterText", function (newFilter) {
            _this.onQuickFilterChanged(newFilter);
        });
        $scope.$watch("angularGrid.pinnedColumnCount", function () {
            _this.onNewCols();
        });

        this.gridOptions.selectedRows = [];

        this.addApi();
        this.findAllElements($element);
        this.filterManager = new FilterManager(this);

        this.rowModel = new RowModel();
        this.rowModel.setAllRows(this.gridOptionsWrapper.getAllRows());
        this.rowController = new RowController(this.gridOptionsWrapper, this.rowModel, this, this.filterManager);
        this.rowRenderer = new RowRenderer(this.gridOptions, this.rowModel, this.gridOptionsWrapper, $element[0], this, $compile);
        //this.headerRenderer = new HeaderRenderer(this.gridOptions);

        this.addScrollListener();

        this.setBodySize(); //setting sizes of body (containing viewports), doesn't change container sizes

        //done when cols change
        this.setupColumns();

        //done when rows change
        this.setupRows(constants.STEP_EVERYTHING);

        //flag to mark when the directive is destroyed
        this.finished = false;
        var _this = this;
        $scope.$on("$destroy", function () {
            _this.finished = true;
        });
    }

    Grid.prototype.getRowData = function () {
        return this.gridOptions.rowData;
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
        this.setupRows(constants.STEP_FILTER);
        this.updateFilterIcons();
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
            if (this.gridOptions.rowSelected && typeof this.gridOptions.rowSelected === "function") {
                this.gridOptions.rowSelected(row);
            }
            //if single selection, clear any previous
            if (selected && this.gridOptions.rowSelection === "single") {
                this.gridOptions.selectedRows.length = 0;
                var eRowsWithSelectedClass = this.eBody.querySelectorAll(".ag-row-selected");
                for (var i = 0; i < eRowsWithSelectedClass.length; i++) {
                    utils.removeCssClass(eRowsWithSelectedClass[i], "ag-row-selected");
                }
            }
            this.gridOptions.selectedRows.push(row);
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
            this.$scope.$apply();
        }

    };

    Grid.prototype.setupColumns = function () {
        this.gridOptionsWrapper.ensureEachColHasSize();
        this.showPinnedColContainersIfNeeded();
        this.insertHeader();
        this.setPinnedColContainerWidth();
        this.setBodyContainerWidth();
        this.updateFilterIcons();
    };

    Grid.prototype.setBodyContainerWidth = function () {
        var mainRowWidth = this.gridOptionsWrapper.getTotalUnpinnedColWidth() + "px";
        this.eBodyContainer.style.width = mainRowWidth;
    };

    Grid.prototype.setupRows = function (step) {
        this.rowController.setupRows(step);
        this.rowRenderer.render();
    };

    Grid.prototype.addApi = function () {
        var _this = this;
        var api = {
            onNewRows: function () {
                _this.rowModel.setAllRows(_this.gridOptionsWrapper.getAllRows());
                _this.gridOptions.selectedRows.length = 0;
                _this.filterManager.clearAllFilters();
                _this.setupRows(constants.STEP_EVERYTHING);
                _this.updateFilterIcons();
            },
            onNewCols: function () {
                _this.onNewCols();
            },
            expandAll: function() {
                _this.expandOrCollapseAll(true, null);
                _this.setupRows(constants.STEP_MAP);
            },
            collapseAll: function() {
                _this.expandOrCollapseAll(false, null);
                _this.setupRows(constants.STEP_MAP);
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
        this.setupRows(constants.STEP_EVERYTHING);
    };

    Grid.prototype.findAllElements = function ($element) {
        var eGrid = $element[0];
        this.eRoot = eGrid.querySelector(".ag-root");
        this.eBody = eGrid.querySelector(".ag-body");
        this.eHeaderContainer = eGrid.querySelector(".ag-header-container");
        this.eBodyContainer = eGrid.querySelector(".ag-body-container");
        this.eBodyViewport = eGrid.querySelector(".ag-body-viewport");
        this.ePinnedHeader = eGrid.querySelector(".ag-pinned-header");
        this.ePinnedColsContainer = eGrid.querySelector(".ag-pinned-cols-container");
        this.ePinnedColsViewport = eGrid.querySelector(".ag-pinned-cols-viewport");
        this.eHeader = eGrid.querySelector(".ag-header");
    };

    Grid.prototype.showPinnedColContainersIfNeeded = function () {
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

    Grid.prototype.setPinnedColContainerWidth = function () {
        var pinnedColWidth = this.getTotalPinnedColWidth();
        this.ePinnedColsContainer.style.width = pinnedColWidth + "px";
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

    Grid.prototype.createHeaderCell = function(colDef, colIndex, colPinned) {
        var headerCell = document.createElement("div");
        var _this = this;

        headerCell.className = "ag-header-cell";

        if (this.gridOptions.enableColResize) {
            var headerCellResize = document.createElement("div");
            headerCellResize.className = "ag-header-cell-resize";
            headerCell.appendChild(headerCellResize);
            this.addColResizeHandling(headerCellResize, headerCell, colDef, colIndex, colPinned);
        }

        //filter button
        if (this.gridOptions.enableFilter) {
            var eMenuButton = svgFactory.createMenuSvg();
            eMenuButton.setAttribute("class", "ag-header-cell-menu-button");
            eMenuButton.onclick = function () {
                _this.filterManager.showFilter(colDef, this);
            };
            headerCell.appendChild(eMenuButton);
        }

        //label div
        var headerCellLabel = document.createElement("div");
        headerCellLabel.className = "ag-header-cell-label";
        //add in sort icon
        if (this.gridOptions.enableSorting) {
            var headerSortIcon = svgFactory.createSortArrowSvg(colIndex);
            headerCellLabel.appendChild(headerSortIcon);
            this.addSortHandling(headerCellLabel, colDef);
        }

        //add in filter icon
        var filterIcon = svgFactory.createFilterSvg();
        this.headerFilterIcons[colDef.field] = filterIcon;
        headerCellLabel.appendChild(filterIcon);

        //add in text label
        var eInnerText = document.createElement("span");
        eInnerText.innerHTML = colDef.displayName;
        headerCellLabel.appendChild(eInnerText);

        headerCell.appendChild(headerCellLabel);
        headerCell.style.width = utils.formatWidth(colDef.actualWidth);

        return headerCell;
    };

    Grid.prototype.updateFilterIcons = function() {
        var _this = this;
        this.gridOptions.columnDefs.forEach(function(colDef) {
            var filterPresent = _this.filterManager.isFilterPresentForCol(colDef.field);
            var displayStyle = filterPresent ? "inline" : "none";
            _this.headerFilterIcons[colDef.field].style.display = displayStyle;
        });
    };

    Grid.prototype.addSortHandling = function(headerCellLabel, colDef) {
        var _this = this;
        headerCellLabel.addEventListener("click", function() {

            //update sort on current col
            if (colDef.sort === constants.ASC) {
                colDef.sort = constants.DESC;
            } else if (colDef.sort === constants.DESC) {
                colDef.sort = null
            } else {
                colDef.sort = constants.ASC;
            }

            //clear sort on all columns except this one, and update the icons
            _this.gridOptions.columnDefs.forEach(function(colToClear, colIndex) {
                if (colToClear!==colDef) {
                    colToClear.sort = null;
                }

                //update visibility of icons
                var sortAscending = colToClear.sort===constants.ASC;
                var sortDescending = colToClear.sort===constants.DESC;
                var sortAny = sortAscending || sortDescending;

                var eSortAscending = _this.eHeader.querySelector(".ag-header-cell-sort-asc-" + colIndex);
                eSortAscending.setAttribute("style", sortAscending ? constants.SORT_STYLE_SHOW : constants.SORT_STYLE_HIDE);

                var eSortDescending = _this.eHeader.querySelector(".ag-header-cell-sort-desc-" + colIndex);
                eSortDescending.setAttribute("style", sortDescending ? constants.SORT_STYLE_SHOW : constants.SORT_STYLE_HIDE);

                var eParentSvg = eSortAscending.parentNode;
                eParentSvg.setAttribute("display", sortAny ? "inline" : "none");
            });

            _this.setupRows(constants.STEP_SORT);
        });
    };

    Grid.prototype.addColResizeHandling = function(headerCellResize, headerCell, colDef, colIndex, colPinned) {
        var _this = this;
        headerCellResize.onmousedown = function(downEvent) {
            _this.eRoot.style.cursor = "col-resize";
            _this.dragStartX = downEvent.clientX;
            _this.colWidthStart = colDef.actualWidth;

            _this.eRoot.onmousemove = function(moveEvent) {
                var newX = moveEvent.clientX;
                var change = newX - _this.dragStartX;
                var newWidth = _this.colWidthStart + change;
                if (newWidth < constants.MIN_COL_WIDTH) {
                    newWidth = constants.MIN_COL_WIDTH;
                }
                var newWidthPx = newWidth + "px";
                var selectorForAllColsInCell = ".cell-col-"+colIndex;
                var cellsForThisCol = _this.eRoot.querySelectorAll(selectorForAllColsInCell);
                for (var i = 0; i<cellsForThisCol.length; i++) {
                    cellsForThisCol[i].style.width = newWidthPx;
                }

                headerCell.style.width = newWidthPx;
                colDef.actualWidth = newWidth;

                if (colPinned) {
                    _this.setPinnedColContainerWidth();
                } else {
                    _this.rowRenderer.setMainRowWidths();
                    _this.setBodyContainerWidth();
                }
            };
            _this.eRoot.onmouseup = function() {
                _this.eRoot.style.cursor = "";
                _this.stopDragging();
            };
            _this.eRoot.onmouseleave = function() {
                _this.stopDragging();
            };
        };
    };

    Grid.prototype.stopDragging = function() {
        this.eRoot.style.cursor = "";
        this.eRoot.onmouseup = null;
        this.eRoot.onmouseleave = null;
        this.eRoot.onmousemove = null;
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

    Grid.prototype.insertHeader = function() {
        var ePinnedHeader = this.ePinnedHeader;
        var eHeaderContainer = this.eHeaderContainer;
        utils.removeAllChildren(ePinnedHeader);
        utils.removeAllChildren(eHeaderContainer);
        this.headerFilterIcons = {};

        var pinnedColumnCount = this.gridOptionsWrapper.getPinnedColCount();
        var _this = this;

        this.gridOptions.columnDefs.forEach(function(colDef, index) {
            //only include the first x cols
            if (index<pinnedColumnCount) {
                var headerCell = _this.createHeaderCell(colDef, index, true);
                ePinnedHeader.appendChild(headerCell);
            } else {
                var headerCell = _this.createHeaderCell(colDef, index, false);
                eHeaderContainer.appendChild(headerCell);
            }
        });
    };

});
