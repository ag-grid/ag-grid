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

    HeaderRenderer.prototype.insertHeader = function () {
        utils.removeAllChildren(this.ePinnedHeader);
        utils.removeAllChildren(this.eHeaderContainer);

        if (this.childScopes) {
            this.childScopes.forEach(function (childScope) {
                childScope.$destroy();
            });
        }
        this.childScopes = [];

        if (this.gridOptionsWrapper.isGroupHeaders()) {
            this.insertHeadersWithGrouping();
        } else {
            this.insertHeadersWithoutGrouping();
        }

    };

    HeaderRenderer.prototype.insertHeadersWithGrouping = function() {
        // split the columns into groups
        var currentGroup = null;
        var pinnedColumnCount = this.gridOptionsWrapper.getPinnedColCount();
        var colDefWrappers = this.colModel.getColDefWrappers();
        var that = this;
        // this logic is called twice below, so refactored it out here.
        // not in a public method, keeping it private to this method
        var addGroupFunc = function () {
            // see if it's just a normal column
            var eHeaderCell = that.createGroupedHeaderCell(currentGroup);
            var eContainerToAddTo = currentGroup.pinned ? that.ePinnedHeader : that.eHeaderContainer;
            eContainerToAddTo.appendChild(eHeaderCell);
        };
        colDefWrappers.forEach(function (colDefWrapper, index) {
            // do we need a new group, because we move from pinned to non-pinned columns?
            var endOfPinnedHeader = index === pinnedColumnCount;
            // do we need a new group, because the group names doesn't match from previous col?
            var groupKeyMismatch = currentGroup && colDefWrapper.colDef.group !== currentGroup.name;
            // we don't group columns where no group is specified
            var colNotInGroup = currentGroup && !currentGroup.name;
            // do we need a new group, because we are just starting
            var processingFirstCol = index === 0;
            var newGroupNeeded = processingFirstCol || endOfPinnedHeader || groupKeyMismatch || colNotInGroup;
            // flush the last group out, if it exists
            if (newGroupNeeded && !processingFirstCol) {
                addGroupFunc();
            }
            // create new group, if it's needed
            if (newGroupNeeded) {
                currentGroup = {
                    colDefWrappers: [],
                    eHeaderCells: [], // contains the child header cells, they get re-sized when parent width changed
                    firstIndex: index,
                    pinned: index < pinnedColumnCount,
                    name: colDefWrapper.colDef.group
                };
            }
            currentGroup.colDefWrappers.push(colDefWrapper);
        });
        // one more group to insert, do it here
        if (currentGroup) {
            addGroupFunc();
        }
    };

    HeaderRenderer.prototype.createGroupedHeaderCell = function(currentGroup) {

        var eHeaderGroup = document.createElement('div');
        eHeaderGroup.className = 'ag-header-group';

        var eHeaderGroupCell = document.createElement('div');
        currentGroup.eHeaderGroupCell = eHeaderGroupCell;
        var classNames = ['ag-header-group-cell'];
        // having different classes below allows the style to not have a bottom border
        // on the group header, if no group is specified
        if (currentGroup.name) {
            classNames.push('ag-header-group-cell-with-group');
        } else {
            classNames.push('ag-header-group-cell-no-group');
        }
        eHeaderGroupCell.className = classNames.join(' ');

        if (this.gridOptionsWrapper.isEnableColResize()) {
            var eHeaderCellResize = document.createElement("div");
            eHeaderCellResize.className = "ag-header-cell-resize";
            eHeaderGroupCell.appendChild(eHeaderCellResize);
            currentGroup.eHeaderCellResize = eHeaderCellResize;
            var dragCallback = this.groupDragCallbackFactory(currentGroup);
            this.addDragHandler(eHeaderCellResize, dragCallback);
        }

        // no renderer, default text render
        var groupName = currentGroup.name;
        if (groupName && groupName !== '') {
            var eGroupCellLabel = document.createElement("div");
            eGroupCellLabel.className = 'ag-header-group-cell-label';
            eHeaderGroupCell.appendChild(eGroupCellLabel);

            var eInnerText = document.createElement("span");
            eInnerText.innerHTML = groupName;
            eGroupCellLabel.appendChild(eInnerText);
        }

        eHeaderGroup.appendChild(eHeaderGroupCell);

        var that = this;
        currentGroup.colDefWrappers.forEach(function (colDefWrapper, index) {
            var colIndex = index + currentGroup.firstIndex;
            var eHeaderCell = that.createHeaderCell(colDefWrapper, colIndex, currentGroup.pinned, true, currentGroup);
            that.setWidthOfGroupHeaderCell(currentGroup);
            eHeaderGroup.appendChild(eHeaderCell);
            currentGroup.eHeaderCells.push(eHeaderCell);
        });

        return eHeaderGroup;
    };

    HeaderRenderer.prototype.addDragHandler = function (eDraggableElement, dragCallback) {
        var that = this;
        eDraggableElement.onmousedown = function(downEvent) {
            dragCallback.onDragStart();
            that.eRoot.style.cursor = "col-resize";
            that.dragStartX = downEvent.clientX;

            that.eRoot.onmousemove = function(moveEvent) {
                var newX = moveEvent.clientX;
                var change = newX - that.dragStartX;
                dragCallback.onDragging(change);
            };
            that.eRoot.onmouseup = function() {
                that.stopDragging();
            };
            that.eRoot.onmouseleave = function() {
                that.stopDragging();
            };
        };
    };

    HeaderRenderer.prototype.setWidthOfGroupHeaderCell = function(headerGroup) {
        var totalWidth = 0;
        headerGroup.colDefWrappers.forEach( function (colDefWrapper) {
            totalWidth += colDefWrapper.actualWidth;
        });
        headerGroup.eHeaderGroupCell.style.width = utils.formatWidth(totalWidth);
        headerGroup.actualWidth = totalWidth;
    };

    HeaderRenderer.prototype.insertHeadersWithoutGrouping = function() {
        var ePinnedHeader = this.ePinnedHeader;
        var eHeaderContainer = this.eHeaderContainer;
        var pinnedColumnCount = this.gridOptionsWrapper.getPinnedColCount();
        var that = this;

        this.colModel.getColDefWrappers().forEach(function (colDefWrapper, index) {
            // only include the first x cols
            if (index < pinnedColumnCount) {
                var headerCell = that.createHeaderCell(colDefWrapper, index, true, false);
                ePinnedHeader.appendChild(headerCell);
            } else {
                var headerCell = that.createHeaderCell(colDefWrapper, index, false, false);
                eHeaderContainer.appendChild(headerCell);
            }
        });
    };

    HeaderRenderer.prototype.createFilterIcon = function() {
        if (typeof this.gridOptionsWrapper.getFilterIconRenderer() === 'function') {
            var rendererResult = this.gridOptionsWrapper.getFilterIconRenderer()();
            if (typeof rendererResult === 'string') {
                var eSpan = document.createElement('span');
                eSpan.innerHTML = rendererResult;
                return eSpan;
            } else if (utils.isNodeOrElement(rendererResult)) {
                return rendererResult;
            } else {
                throw 'filterIconRenderer - function should return DOM object or String';
            }
        } else {
            return svgFactory.createFilterSvg();
        }
    };

    HeaderRenderer.prototype.getIcon = function(iconFromGridOptions, theDefaultFunc) {
        if (typeof iconFromGridOptions === 'function') {
            var rendererResult = iconFromGridOptions();
            if (typeof rendererResult === 'string') {
                var eSpan = document.createElement('span');
                eSpan.innerHTML = rendererResult;
                return eSpan;
            } else if (utils.isNodeOrElement(rendererResult)) {
                return rendererResult;
            } else {
                throw 'iconRenderer should return back a string or a dom object';
            }
        } else {
            return theDefaultFunc();
        }
    };

    HeaderRenderer.prototype.createHeaderCell = function(colDefWrapper, colIndex, colPinned, grouped, headerGroup) {
        var that = this;
        var colDef = colDefWrapper.colDef;
        var eHeaderCell = document.createElement("div");

        var headerCellClasses = ['ag-header-cell'];
        if (grouped) {
            headerCellClasses.push('ag-header-cell-grouped'); // this takes 50% height
        } else {
            headerCellClasses.push('ag-header-cell-not-grouped'); // this takes 100% height
        }
        eHeaderCell.className = headerCellClasses.join(' ');

        // add tooltip if exists
        if (colDef.headerTooltip) {
            eHeaderCell.title = colDef.headerTooltip;
        }

        if (this.gridOptionsWrapper.isEnableColResize()) {
            var headerCellResize = document.createElement("div");
            headerCellResize.className = "ag-header-cell-resize";
            eHeaderCell.appendChild(headerCellResize);
            var dragCallback = this.headerDragCallbackFactory(colIndex, colPinned, eHeaderCell, colDefWrapper, headerGroup);
            this.addDragHandler(headerCellResize, dragCallback)
        }

        // filter button
        var showMenu = this.gridOptionsWrapper.isEnableFilter() && !colDef.suppressMenu;
        if (showMenu) {
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
            eMenuButton.style["-webkit-transition"] = "opacity 0.5s, border 0.2s";
            eMenuButton.style["transition"] = "opacity 0.5s, border 0.2s";
        }

        // label div
        var headerCellLabel = document.createElement("div");
        headerCellLabel.className = "ag-header-cell-label";

        // add in sort icon
        if (this.gridOptionsWrapper.isEnableSorting() && !colDef.suppressSorting) {
            colDefWrapper.eSortAsc = svgFactory.createSortAscSvg();
            colDefWrapper.eSortDesc = svgFactory.createSortDescSvg();
            headerCellLabel.appendChild(colDefWrapper.eSortAsc);
            headerCellLabel.appendChild(colDefWrapper.eSortDesc);
            colDefWrapper.eSortAsc.setAttribute('display', 'none');
            colDefWrapper.eSortDesc.setAttribute('display', 'none');
            this.addSortHandling(headerCellLabel, colDefWrapper);
        }

        // add in filter icon
        colDefWrapper.eFilterIcon = this.createFilterIcon();
        headerCellLabel.appendChild(colDefWrapper.eFilterIcon);

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

                // check in case no sorting on this particular col, as sorting is optional per col
                if (colWrapperToClear.colDef.suppressSorting) {
                    return;
                }

                // update visibility of icons
                var sortAscending = colWrapperToClear.sort === constants.ASC;
                var sortDescending = colWrapperToClear.sort === constants.DESC;

                colWrapperToClear.eSortAsc.setAttribute("display", sortAscending ? 'inline' : 'none');
                colWrapperToClear.eSortDesc.setAttribute("display", sortDescending ? 'inline' : 'none');
            });

            that.angularGrid.updateModelAndRefresh(constants.STEP_SORT);
        });
    };

    HeaderRenderer.prototype.groupDragCallbackFactory = function (currentGroup) {
        var parent = this;
        return {
            onDragStart: function() {
                this.groupWidthStart = currentGroup.actualWidth;
                this.childrenWidthStarts = [];
                var that = this;
                currentGroup.colDefWrappers.forEach( function (colDefWrapper) {
                    that.childrenWidthStarts.push(colDefWrapper.actualWidth);
                });
                this.minWidth = currentGroup.colDefWrappers.length * constants.MIN_COL_WIDTH;
            },
            onDragging: function(dragChange) {

                var newWidth = this.groupWidthStart + dragChange;
                if (newWidth < this.minWidth) {
                    newWidth = this.minWidth;
                }

                // set the new width to the group header
                var newWidthPx = newWidth + "px";
                currentGroup.eHeaderGroupCell.style.width = newWidthPx;
                currentGroup.actualWidth = newWidth;

                // distribute the new width to the child headers
                var changeRatio = newWidth / this.groupWidthStart;
                // keep track of pixels used, and last column gets the remaining,
                // to cater for rounding errors, and min width adjustments
                var pixelsToDistribute = newWidth;
                var that = this;
                currentGroup.colDefWrappers.forEach( function (colDefWrapper, index) {
                    var notLastCol = index !== (currentGroup.colDefWrappers.length-1);
                    var newChildSize;
                    if (notLastCol) {
                        // if not the last col, calculate the column width as normal
                        var startChildSize = that.childrenWidthStarts[index];
                        newChildSize = startChildSize * changeRatio;
                        if (newChildSize < constants.MIN_COL_WIDTH) {
                            newChildSize = constants.MIN_COL_WIDTH;
                        }
                        pixelsToDistribute -= newChildSize;
                    } else {
                        // if last col, give it the remaining pixels
                        newChildSize = pixelsToDistribute;
                    }
                    var childColIndex = currentGroup.firstIndex + index;
                    var eHeaderCell = currentGroup.eHeaderCells[index];
                    parent.adjustColumnWidth(newChildSize, childColIndex, colDefWrapper, eHeaderCell);
                });

                // show not be calling these here, should do something else
                if (currentGroup.pinned) {
                    parent.angularGrid.updatePinnedColContainerWidthAfterColResize();
                } else {
                    parent.angularGrid.updateBodyContainerWidthAfterColResize();
                }
            }
        };
    };

    HeaderRenderer.prototype.adjustColumnWidth = function(newWidth, colIndex, colDefWrapper, eHeaderCell) {
        var newWidthPx = newWidth + "px";
        var selectorForAllColsInCell = ".cell-col-"+colIndex;
        var cellsForThisCol = this.eRoot.querySelectorAll(selectorForAllColsInCell);
        for (var i = 0; i<cellsForThisCol.length; i++) {
            cellsForThisCol[i].style.width = newWidthPx;
        }

        eHeaderCell.style.width = newWidthPx;
        colDefWrapper.actualWidth = newWidth;
    };

    // gets called when a header (not a header group) gets resized
    HeaderRenderer.prototype.headerDragCallbackFactory = function (colIndex, colPinned, headerCell, colDefWrapper, headerGroup) {
        var parent = this;
        return {
            onDragStart: function() {
                this.startWidth = colDefWrapper.actualWidth;
            },
            onDragging: function(dragChange) {
                var newWidth = this.startWidth + dragChange;
                if (newWidth < constants.MIN_COL_WIDTH) {
                    newWidth = constants.MIN_COL_WIDTH;
                }

                parent.adjustColumnWidth(newWidth, colIndex, colDefWrapper, headerCell);

                if (headerGroup) {
                    parent.setWidthOfGroupHeaderCell(headerGroup);
                }

                // show not be calling these here, should do something else
                if (colPinned) {
                    parent.angularGrid.updatePinnedColContainerWidthAfterColResize();
                } else {
                    parent.angularGrid.updateBodyContainerWidthAfterColResize();
                }
            }
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
            colDefWrapper.eFilterIcon.style.display = displayStyle;
        });
    };

    return HeaderRenderer;

});