define(["./utils", "./svgFactory", "./constants"], function(utils, SvgFactory, constants) {

    var svgFactory = new SvgFactory();

    function HeaderRenderer(gridOptionsWrapper, colModel, eGrid, angularGrid, filterManager, $scope, $compile) {
        this.gridOptionsWrapper = gridOptionsWrapper;
        this.colModel = colModel;
        this.angularGrid = angularGrid;
        this.filterManager = filterManager;
        this.$scope = $scope;
        this.$compile = $compile;
        this.findAllElements(eGrid);
    }

    HeaderRenderer.prototype.findAllElements = function (eGrid) {

        if (this.gridOptionsWrapper.isDontUseScrolls()) {
            this.eHeaderContainer = eGrid.querySelector(".ag-header-container");
            this.eRoot = eGrid.querySelector(".ag-root");
            // for no-scroll, all header cells live in the header container (the ag-header doesn't exist)
            this.eHeaderParent = this.eHeaderContainer;
        } else {
            this.ePinnedHeader = eGrid.querySelector(".ag-pinned-header");
            this.eHeaderContainer = eGrid.querySelector(".ag-header-container");
            this.eHeader = eGrid.querySelector(".ag-header");
            this.eRoot = eGrid.querySelector(".ag-root");
            // for scroll, all header cells live in the header (contains both normal and pinned headers)
            this.eHeaderParent = this.eHeader;
        }
    };

    HeaderRenderer.prototype.insertHeader = function() {
        var ePinnedHeader = this.ePinnedHeader;
        var eHeaderContainer = this.eHeaderContainer;
        utils.removeAllChildren(ePinnedHeader);
        utils.removeAllChildren(eHeaderContainer);
        this.headerFilterIcons = {};

        if (this.childScopes) {
            this.childScopes.forEach(function(childScope) {
                childScope.$destroy();
            });
        }
        this.childScopes = [];

        var pinnedColumnCount = this.gridOptionsWrapper.getPinnedColCount();
        var that = this;

        this.colModel.getColDefWrappers().forEach(function(colDefWrapper, index) {
            // only include the first x cols
            if (index<pinnedColumnCount) {
                var headerCell = that.createHeaderCell(colDefWrapper, index, true);
                ePinnedHeader.appendChild(headerCell);
            } else {
                var headerCell = that.createHeaderCell(colDefWrapper, index, false);
                eHeaderContainer.appendChild(headerCell);
            }
        });
    };

    HeaderRenderer.prototype.createHeaderCell = function(colDefWrapper, colIndex, colPinned) {
        var that = this;
        var colDef = colDefWrapper.colDef;
        var eHeaderCell = document.createElement("div");

        eHeaderCell.className = "ag-header-cell";

        // add tooltip if exists
        if (colDef.headerTooltip) {
            eHeaderCell.title = colDef.headerTooltip;
        }

        if (this.gridOptionsWrapper.isEnableColResize()) {
            var headerCellResize = document.createElement("div");
            headerCellResize.className = "ag-header-cell-resize";
            eHeaderCell.appendChild(headerCellResize);
            this.addColResizeHandling(headerCellResize, eHeaderCell, colDefWrapper, colIndex, colPinned);
        }

        // filter button
        if (this.gridOptionsWrapper.isEnableFilter()) {
            var eMenuButton = svgFactory.createMenuSvg();
            eMenuButton.setAttribute("class", "ag-header-cell-menu-button");
            eMenuButton.onclick = function () {
                that.filterManager.showFilter(colDefWrapper, this);
            };
            eHeaderCell.appendChild(eMenuButton);
            eHeaderCell.onmouseenter = function() {
                eMenuButton.style.opacity = 1;
            };
            eHeaderCell.onmouseleave = function() {
                eMenuButton.style.opacity = 0;
            };
            eMenuButton.style.opacity = 0;
            eMenuButton.style["-webkit-transition"] = "opacity 0.5s";
            eMenuButton.style["transition"] = "opacity 0.5s";
        }

        // label div
        var headerCellLabel = document.createElement("div");
        headerCellLabel.className = "ag-header-cell-label";
        // add in sort icon
        if (this.gridOptionsWrapper.isEnableSorting()) {
            var headerSortIcon = svgFactory.createSortArrowSvg(colIndex);
            headerCellLabel.appendChild(headerSortIcon);
            this.addSortHandling(headerCellLabel, colDefWrapper);
        }

        // add in filter icon
        var filterIcon = svgFactory.createFilterSvg();
        this.headerFilterIcons[colDefWrapper.colKey] = filterIcon;
        headerCellLabel.appendChild(filterIcon);

        // render the cell, use a renderer if one is provided
        var headerCellRenderer;
        if (colDef.headerCellRenderer) { // first look for a renderer in col def
            headerCellRenderer = colDef.headerCellRenderer;
        } else if (this.gridOptionsWrapper.getHeaderCellRenderer()) { // second look for one in grid options
            headerCellRenderer = this.gridOptionsWrapper.getHeaderCellRenderer();
        }
        if (headerCellRenderer) {
            // renderer provided, use it
            var newChildScope;
            if (this.gridOptionsWrapper.isAngularCompileHeaders()) {
                newChildScope = this.$scope.$new();
            }
            var cellRendererParams = {colDef: colDef, $scope: newChildScope, gridOptions: this.gridOptionsWrapper.getGridOptions()};
            var cellRendererResult = headerCellRenderer(cellRendererParams);
            var childToAppend;
            if (utils.isNode(cellRendererResult) || utils.isElement(cellRendererResult)) {
                // a dom node or element was returned, so add child
                childToAppend = cellRendererResult;
            } else {
                // otherwise assume it was html, so just insert
                var eTextSpan = document.createElement("span");
                eTextSpan.innerHTML = cellRendererResult;
                childToAppend = eTextSpan;
            }
            // angular compile header if option is turned on
            if (this.gridOptionsWrapper.isAngularCompileHeaders()) {
                newChildScope.colDef = colDef;
                newChildScope.colIndex = colIndex;
                newChildScope.colDefWrapper = colDefWrapper;
                this.childScopes.push(newChildScope);
                var childToAppendCompiled = this.$compile(childToAppend)(newChildScope)[0];
                headerCellLabel.appendChild(childToAppendCompiled);
            } else {
                headerCellLabel.appendChild(childToAppend);
            }
        } else {
            // no renderer, default text render
            var eInnerText = document.createElement("span");
            eInnerText.innerHTML = colDef.displayName;
            headerCellLabel.appendChild(eInnerText);
        }

        eHeaderCell.appendChild(headerCellLabel);
        eHeaderCell.style.width = utils.formatWidth(colDefWrapper.actualWidth);

        return eHeaderCell;
    };

    HeaderRenderer.prototype.addSortHandling = function(headerCellLabel, colDefWrapper) {
        var that = this;

        headerCellLabel.addEventListener("click", function() {

            // update sort on current col
            if (colDefWrapper.sort === constants.ASC) {
                colDefWrapper.sort = constants.DESC;
            } else if (colDefWrapper.sort === constants.DESC) {
                colDefWrapper.sort = null
            } else {
                colDefWrapper.sort = constants.ASC;
            }

            // clear sort on all columns except this one, and update the icons
            that.colModel.getColDefWrappers().forEach(function(colWrapperToClear, colIndex) {
                if (colWrapperToClear!==colDefWrapper) {
                    colWrapperToClear.sort = null;
                }

                // update visibility of icons
                var sortAscending = colWrapperToClear.sort===constants.ASC;
                var sortDescending = colWrapperToClear.sort===constants.DESC;
                var sortAny = sortAscending || sortDescending;

                var eSortAscending = that.eHeaderParent.querySelector(".ag-header-cell-sort-asc-" + colIndex);
                eSortAscending.setAttribute("style", sortAscending ? constants.SORT_STYLE_SHOW : constants.SORT_STYLE_HIDE);

                var eSortDescending = that.eHeaderParent.querySelector(".ag-header-cell-sort-desc-" + colIndex);
                eSortDescending.setAttribute("style", sortDescending ? constants.SORT_STYLE_SHOW : constants.SORT_STYLE_HIDE);

                var eParentSvg = eSortAscending.parentNode;
                eParentSvg.setAttribute("display", sortAny ? "inline" : "none");
            });

            that.angularGrid.updateModelAndRefresh(constants.STEP_SORT);
        });
    };

    HeaderRenderer.prototype.addColResizeHandling = function(headerCellResize, headerCell, colDefWrapper, colIndex, colPinned) {
        var that = this;
        headerCellResize.onmousedown = function(downEvent) {
            that.eRoot.style.cursor = "col-resize";
            that.dragStartX = downEvent.clientX;
            that.colWidthStart = colDefWrapper.actualWidth;

            that.eRoot.onmousemove = function(moveEvent) {
                var newX = moveEvent.clientX;
                var change = newX - that.dragStartX;
                var newWidth = that.colWidthStart + change;
                if (newWidth < constants.MIN_COL_WIDTH) {
                    newWidth = constants.MIN_COL_WIDTH;
                }
                var newWidthPx = newWidth + "px";
                var selectorForAllColsInCell = ".cell-col-"+colIndex;
                var cellsForThisCol = that.eRoot.querySelectorAll(selectorForAllColsInCell);
                for (var i = 0; i<cellsForThisCol.length; i++) {
                    cellsForThisCol[i].style.width = newWidthPx;
                }

                headerCell.style.width = newWidthPx;
                colDefWrapper.actualWidth = newWidth;

                // show not be calling these here, should do something else
                if (colPinned) {
                    that.angularGrid.updatePinnedColContainerWidthAfterColResize();
                } else {
                    that.angularGrid.updateBodyContainerWidthAfterColResize();
                }
            };
            that.eRoot.onmouseup = function() {
                that.stopDragging();
            };
            that.eRoot.onmouseleave = function() {
                that.stopDragging();
            };
        };
    };

    HeaderRenderer.prototype.stopDragging = function() {
        this.eRoot.style.cursor = "";
        this.eRoot.onmouseup = null;
        this.eRoot.onmouseleave = null;
        this.eRoot.onmousemove = null;
    };

    HeaderRenderer.prototype.updateFilterIcons = function() {
        var that = this;
        this.colModel.getColDefWrappers().forEach(function(colDefWrapper) {
            var filterPresent = that.filterManager.isFilterPresentForCol(colDefWrapper.colKey);
            var displayStyle = filterPresent ? "inline" : "none";
            that.headerFilterIcons[colDefWrapper.colKey].style.display = displayStyle;
        });
    };

    return HeaderRenderer;

});