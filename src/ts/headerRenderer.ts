/// <reference path="utils.ts" />
/// <reference path="constants.ts" />
/// <reference path="svgFactory.ts" />

module awk.grid {

    var utils = Utils;
    var constants = Constants;
    var svgFactory = SvgFactory.getInstance();

    export class HeaderRenderer {

        gridOptionsWrapper: any;
        columnModel: any;
        columnController: any;
        angularGrid: any;
        filterManager: any;
        $scope: any;
        $compile: any;
        ePinnedHeader: any;
        eHeaderContainer: any;
        eHeader: any;
        eRoot: any;
        childScopes: any;
        dragStartX: any;

        init(gridOptionsWrapper: any, columnController: any, columnModel: any, gridPanel: any, angularGrid: any,
             filterManager: any, $scope: any, $compile: any) {
            this.gridOptionsWrapper = gridOptionsWrapper;
            this.columnModel = columnModel;
            this.columnController = columnController;
            this.angularGrid = angularGrid;
            this.filterManager = filterManager;
            this.$scope = $scope;
            this.$compile = $compile;
            this.findAllElements(gridPanel);
        }

        findAllElements(gridPanel: any) {
            this.ePinnedHeader = gridPanel.getPinnedHeader();
            this.eHeaderContainer = gridPanel.getHeaderContainer();
            this.eHeader = gridPanel.getHeader();
            this.eRoot = gridPanel.getRoot();
        }

        refreshHeader() {
            utils.removeAllChildren(this.ePinnedHeader);
            utils.removeAllChildren(this.eHeaderContainer);

            if (this.childScopes) {
                this.childScopes.forEach(function (childScope: any) {
                    childScope.$destroy();
                });
            }
            this.childScopes = [];

            if (this.gridOptionsWrapper.isGroupHeaders()) {
                this.insertHeadersWithGrouping();
            } else {
                this.insertHeadersWithoutGrouping();
            }
        }

        insertHeadersWithGrouping() {
            var groups: HeaderGroup[] = this.columnModel.getHeaderGroups();
            var that = this;
            groups.forEach(function (group: HeaderGroup) {
                var eHeaderCell = that.createGroupedHeaderCell(group);
                var eContainerToAddTo = group.pinned ? that.ePinnedHeader : that.eHeaderContainer;
                eContainerToAddTo.appendChild(eHeaderCell);
            });
        }

        createGroupedHeaderCell(group: HeaderGroup) {

            var eHeaderGroup = document.createElement('div');
            eHeaderGroup.className = 'ag-header-group';

            var eHeaderGroupCell = document.createElement('div');
            group.eHeaderGroupCell = eHeaderGroupCell;
            var classNames = ['ag-header-group-cell'];
            // having different classes below allows the style to not have a bottom border
            // on the group header, if no group is specified
            if (group.name) {
                classNames.push('ag-header-group-cell-with-group');
            } else {
                classNames.push('ag-header-group-cell-no-group');
            }
            eHeaderGroupCell.className = classNames.join(' ');

            if (this.gridOptionsWrapper.isEnableColResize()) {
                var eHeaderCellResize = document.createElement("div");
                eHeaderCellResize.className = "ag-header-cell-resize";
                eHeaderGroupCell.appendChild(eHeaderCellResize);
                group.eHeaderCellResize = eHeaderCellResize;
                var dragCallback = this.groupDragCallbackFactory(group);
                this.addDragHandler(eHeaderCellResize, dragCallback, group);
            }

            // no renderer, default text render
            var groupName = group.name;
            if (groupName && groupName !== '') {
                var eGroupCellLabel = document.createElement("div");
                eGroupCellLabel.className = 'ag-header-group-cell-label';
                eHeaderGroupCell.appendChild(eGroupCellLabel);

                var eInnerText = document.createElement("span");
                eInnerText.className = 'ag-header-group-text';
                eInnerText.innerHTML = groupName;
                eGroupCellLabel.appendChild(eInnerText);

                if (group.expandable) {
                    this.addGroupExpandIcon(group, eGroupCellLabel, group.expanded);
                }
            }
            eHeaderGroup.appendChild(eHeaderGroupCell);

            var that = this;
            group.displayedColumns.forEach(function (column: any) {
                var eHeaderCell = that.createHeaderCell(column, true, group);
                eHeaderGroup.appendChild(eHeaderCell);
            });

            that.setWidthOfGroupHeaderCell(group);

            return eHeaderGroup;
        }

        fireColumnResized(column: any) {
            if (typeof this.gridOptionsWrapper.getColumnResized() === 'function') {
                this.gridOptionsWrapper.getColumnResized()(column);
            }
        }

        addGroupExpandIcon(group: any, eHeaderGroup: any, expanded: any) {
            var eGroupIcon: any;
            if (expanded) {
                eGroupIcon = utils.createIcon('headerGroupOpened', this.gridOptionsWrapper, null, svgFactory.createArrowLeftSvg);
            } else {
                eGroupIcon = utils.createIcon('headerGroupClosed', this.gridOptionsWrapper, null, svgFactory.createArrowRightSvg);
            }
            eGroupIcon.className = 'ag-header-expand-icon';
            eHeaderGroup.appendChild(eGroupIcon);

            var that = this;
            eGroupIcon.onclick = function() {
                that.columnController.headerGroupOpened(group);
            };
        }

        addDragHandler(eDraggableElement: any, dragCallback: any, column: any) {
            var that = this;
            eDraggableElement.addEventListener('mousedown', function (downEvent: any) {
                dragCallback.onDragStart();
                that.eRoot.style.cursor = "col-resize";
                that.dragStartX = downEvent.clientX;

                var listenersToRemove = <any> {};

                listenersToRemove.mousemove = function (moveEvent: any) {
                    var newX = moveEvent.clientX;
                    var change = newX - that.dragStartX;
                    dragCallback.onDragging(change);
                };

                listenersToRemove.mouseup = function () {
                    that.stopDragging(listenersToRemove, column);
                };

                listenersToRemove.mouseleave = function () {
                    that.stopDragging(listenersToRemove, column);
                };

                that.eRoot.addEventListener('mousemove', listenersToRemove.mousemove);
                that.eRoot.addEventListener('mouseup', listenersToRemove.mouseup);
                that.eRoot.addEventListener('mouseleave', listenersToRemove.mouseleave);
            });
        }

        setWidthOfGroupHeaderCell(headerGroup: any) {
            var totalWidth = 0;
            headerGroup.displayedColumns.forEach(function (column: any) {
                totalWidth += column.actualWidth;
            });
            headerGroup.eHeaderGroupCell.style.width = utils.formatWidth(totalWidth);
            headerGroup.actualWidth = totalWidth;
        }

        insertHeadersWithoutGrouping() {
            var ePinnedHeader = this.ePinnedHeader;
            var eHeaderContainer = this.eHeaderContainer;
            var that = this;

            this.columnModel.getDisplayedColumns().forEach(function (column: any) {
                // only include the first x cols
                var headerCell = that.createHeaderCell(column, false);
                if (column.pinned) {
                    ePinnedHeader.appendChild(headerCell);
                } else {
                    eHeaderContainer.appendChild(headerCell);
                }
            });
        }

        createHeaderCell(column: any, grouped: any, headerGroup?: any) {
            var that = this;
            var colDef = column.colDef;
            var eHeaderCell = document.createElement("div");
            // stick the header cell in column, as we access it when group is re-sized
            column.eHeaderCell = eHeaderCell;

            var newChildScope: any;
            if (this.gridOptionsWrapper.isAngularCompileHeaders()) {
                newChildScope = this.$scope.$new();
                newChildScope.colDef = colDef;
                newChildScope.colIndex = colDef.index;
                newChildScope.colDefWrapper = column;
                this.childScopes.push(newChildScope);
            }

            var headerCellClasses = ['ag-header-cell'];
            if (grouped) {
                headerCellClasses.push('ag-header-cell-grouped'); // this takes 50% height
            } else {
                headerCellClasses.push('ag-header-cell-not-grouped'); // this takes 100% height
            }
            eHeaderCell.className = headerCellClasses.join(' ');

            this.addHeaderClassesFromCollDef(colDef, newChildScope, eHeaderCell);

            // add tooltip if exists
            if (colDef.headerTooltip) {
                eHeaderCell.title = colDef.headerTooltip;
            }

            if (this.gridOptionsWrapper.isEnableColResize() && !colDef.suppressResize) {
                var headerCellResize = document.createElement("div");
                headerCellResize.className = "ag-header-cell-resize";
                eHeaderCell.appendChild(headerCellResize);
                var dragCallback = this.headerDragCallbackFactory(eHeaderCell, column, headerGroup);
                this.addDragHandler(headerCellResize, dragCallback, column);
            }

            // filter button
            var showMenu = this.gridOptionsWrapper.isEnableFilter() && !colDef.suppressMenu;
            if (showMenu) {
                var eMenuButton = utils.createIcon('menu', this.gridOptionsWrapper, column, svgFactory.createMenuSvg);
                utils.addCssClass(eMenuButton, 'ag-header-icon');

                eMenuButton.setAttribute("class", "ag-header-cell-menu-button");
                eMenuButton.onclick = function () {
                    that.filterManager.showFilter(column, this);
                };
                eHeaderCell.appendChild(eMenuButton);
                eHeaderCell.onmouseenter = function () {
                    eMenuButton.style.opacity = '1';
                };
                eHeaderCell.onmouseleave = function () {
                    eMenuButton.style.opacity = '0';
                };
                eMenuButton.style.opacity = '0';
                eMenuButton.style['transition'] = 'opacity 0.5s, border 0.2s';
                var style: any = eMenuButton.style;
                style['-webkit-transition'] = 'opacity 0.5s, border 0.2s';
            }

            // label div
            var headerCellLabel = document.createElement("div");
            headerCellLabel.className = "ag-header-cell-label";

            // add in sort icons
            if (this.gridOptionsWrapper.isEnableSorting() && !colDef.suppressSorting) {
                column.eSortAsc = utils.createIcon('sortAscending', this.gridOptionsWrapper, column, svgFactory.createArrowUpSvg);
                column.eSortDesc = utils.createIcon('sortDescending', this.gridOptionsWrapper, column, svgFactory.createArrowDownSvg);
                utils.addCssClass(column.eSortAsc, 'ag-header-icon ag-sort-ascending-icon');
                utils.addCssClass(column.eSortDesc, 'ag-header-icon ag-sort-descending-icon');
                headerCellLabel.appendChild(column.eSortAsc);
                headerCellLabel.appendChild(column.eSortDesc);

                // 'no sort' icon
                if (colDef.unSortIcon || this.gridOptionsWrapper.isUnSortIcon()) {
                    column.eSortNone = utils.createIcon('sortUnSort', this.gridOptionsWrapper, column, svgFactory.createArrowUpDownSvg);
                    utils.addCssClass(column.eSortNone, 'ag-header-icon ag-sort-none-icon');
                    headerCellLabel.appendChild(column.eSortNone);
                }

                column.eSortAsc.style.display = 'none';
                column.eSortDesc.style.display = 'none';
                this.addSortHandling(headerCellLabel, column);
            }

            // add in filter icon
            column.eFilterIcon = utils.createIcon('filter', this.gridOptionsWrapper, column, svgFactory.createFilterSvg);
            utils.addCssClass(column.eFilterIcon, 'ag-header-icon');
            headerCellLabel.appendChild(column.eFilterIcon);

            // render the cell, use a renderer if one is provided
            var headerCellRenderer: any;
            if (colDef.headerCellRenderer) { // first look for a renderer in col def
                headerCellRenderer = colDef.headerCellRenderer;
            } else if (this.gridOptionsWrapper.getHeaderCellRenderer()) { // second look for one in grid options
                headerCellRenderer = this.gridOptionsWrapper.getHeaderCellRenderer();
            }

            var headerNameValue = this.columnModel.getDisplayNameForCol(column);

            if (headerCellRenderer) {
                // renderer provided, use it
                var cellRendererParams = {
                    colDef: colDef,
                    $scope: newChildScope,
                    context: this.gridOptionsWrapper.getContext(),
                    value: headerNameValue,
                    api: this.gridOptionsWrapper.getApi()
                };
                var cellRendererResult = headerCellRenderer(cellRendererParams);
                var childToAppend: any;
                if (utils.isNodeOrElement(cellRendererResult)) {
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
                    var childToAppendCompiled = this.$compile(childToAppend)(newChildScope)[0];
                    headerCellLabel.appendChild(childToAppendCompiled);
                } else {
                    headerCellLabel.appendChild(childToAppend);
                }
            } else {
                // no renderer, default text render
                var eInnerText = document.createElement("span");
                eInnerText.className = 'ag-header-cell-text';
                eInnerText.innerHTML = headerNameValue;
                headerCellLabel.appendChild(eInnerText);
            }

            eHeaderCell.appendChild(headerCellLabel);
            eHeaderCell.style.width = utils.formatWidth(column.actualWidth);

            return eHeaderCell;
        }

        addHeaderClassesFromCollDef(colDef: any, $childScope: any, eHeaderCell: any) {
            if (colDef.headerClass) {
                var classToUse: any;
                if (typeof colDef.headerClass === 'function') {
                    var params = {
                        colDef: colDef,
                        $scope: $childScope,
                        context: this.gridOptionsWrapper.getContext(),
                        api: this.gridOptionsWrapper.getApi()
                    };
                    classToUse = colDef.headerClass(params);
                } else {
                    classToUse = colDef.headerClass;
                }

                if (typeof classToUse === 'string') {
                    utils.addCssClass(eHeaderCell, classToUse);
                } else if (Array.isArray(classToUse)) {
                    classToUse.forEach(function (cssClassItem: any) {
                        utils.addCssClass(eHeaderCell, cssClassItem);
                    });
                }
            }
        }

        getNextSortDirection(direction: any) {
            var suppressUnSort = this.gridOptionsWrapper.isSuppressUnSort();
            var suppressDescSort = this.gridOptionsWrapper.isSuppressDescSort();

            switch (direction) {
                case constants.DESC:
                    if (suppressUnSort) {
                        return constants.ASC;
                    } else {
                        return null;
                    }
                case constants.ASC:
                    if (suppressUnSort && suppressDescSort) {
                        return constants.ASC;
                    } else if (suppressDescSort) {
                        return null;
                    } else {
                        return constants.DESC;
                    }
                default :
                    return constants.ASC;
            }
        }

        addSortHandling(headerCellLabel: any, column: any) {
            var that = this;

            headerCellLabel.addEventListener("click", function (e: any) {

                // update sort on current col
                column.sort = that.getNextSortDirection(column.sort);

                // sortedAt used for knowing order of cols when multi-col sort
                if (column.sort) {
                    column.sortedAt = new Date().valueOf();
                } else {
                    column.sortedAt = null;
                }

                var doingMultiSort = !that.gridOptionsWrapper.isSuppressMultiSort() && e.shiftKey;

                // clear sort on all columns except this one, and update the icons
                that.columnModel.getAllColumns().forEach(function (columnToClear: any) {
                    // Do not clear if either holding shift, or if column in question was clicked
                    if (!(doingMultiSort || columnToClear === column)) {
                        columnToClear.sort = null;
                    }
                });

                that.angularGrid.onSortingChanged();
            });
        }

        updateSortIcons() {
            this.columnModel.getAllColumns().forEach(function (column: any) {
                // update visibility of icons
                var sortAscending = column.sort === constants.ASC;
                var sortDescending = column.sort === constants.DESC;
                var unSort = column.sort !== constants.DESC && column.sort !== constants.ASC;

                if (column.eSortAsc) {
                    utils.setVisible(column.eSortAsc, sortAscending);
                }
                if (column.eSortDesc) {
                    utils.setVisible(column.eSortDesc, sortDescending);
                }
                // UnSort Icon
                if (column.eSortNone) {
                    utils.setVisible(column.eSortNone, unSort);
                }
            });
        }

        groupDragCallbackFactory(currentGroup: HeaderGroup) {
            var parent = this;
            var displayedColumns = currentGroup.displayedColumns;
            return {
                onDragStart: function () {
                    this.groupWidthStart = currentGroup.actualWidth;
                    this.childrenWidthStarts = [];
                    var that = this;
                    displayedColumns.forEach(function (column: Column) {
                        that.childrenWidthStarts.push(column.actualWidth);
                    });
                    this.minWidth = currentGroup.getMinimumWidth();
                },
                onDragging: function (dragChange: any) {

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
                    currentGroup.displayedColumns.forEach(function (column: Column, index: any) {
                        var notLastCol = index !== (displayedColumns.length - 1);
                        var newChildSize: any;
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
                        var eHeaderCell = displayedColumns[index].eHeaderCell;
                        parent.adjustColumnWidth(newChildSize, column, eHeaderCell);
                    });

                    // should not be calling these here, should do something else
                    if (currentGroup.pinned) {
                        parent.angularGrid.updatePinnedColContainerWidthAfterColResize();
                    } else {
                        parent.angularGrid.updateBodyContainerWidthAfterColResize();
                    }
                }
            };
        }

        adjustColumnWidth(newWidth: any, column: any, eHeaderCell: any) {
            var newWidthPx = newWidth + "px";
            var selectorForAllColsInCell = ".cell-col-" + column.index;
            var cellsForThisCol = this.eRoot.querySelectorAll(selectorForAllColsInCell);
            for (var i = 0; i < cellsForThisCol.length; i++) {
                cellsForThisCol[i].style.width = newWidthPx;
            }

            eHeaderCell.style.width = newWidthPx;
            column.actualWidth = newWidth;
        }

        // gets called when a header (not a header group) gets resized
        headerDragCallbackFactory(headerCell: any, column: Column, headerGroup: any) {
            var that = this;
            return {
                onDragStart: function () {
                    this.startWidth = column.actualWidth;
                },
                onDragging: function (dragChange: any) {
                    var newWidth = this.startWidth + dragChange;
                    if (newWidth < column.getMinimumWidth()) {
                        newWidth = column.getMinimumWidth();
                    }

                    if (column.isGreaterThanMax(newWidth)) {
                        newWidth = column.colDef.maxWidth;
                    }

                    that.adjustColumnWidth(newWidth, column, headerCell);

                    if (headerGroup) {
                        that.setWidthOfGroupHeaderCell(headerGroup);
                    }

                    // should not be calling these here, should do something else
                    if (column.pinned) {
                        that.angularGrid.updatePinnedColContainerWidthAfterColResize();
                    } else {
                        that.angularGrid.updateBodyContainerWidthAfterColResize();
                    }
                }
            };
        }

        stopDragging(listenersToRemove: any, column: any) {
            this.eRoot.style.cursor = "";
            var that = this;
            utils.iterateObject(listenersToRemove, function (key: any, listener: any) {
                that.eRoot.removeEventListener(key, listener);
            });

            this.fireColumnResized(column);
        }

        updateFilterIcons() {
            var that = this;
            this.columnModel.getDisplayedColumns().forEach(function (column: any) {
                // todo: need to change this, so only updates if column is visible
                if (column.eFilterIcon) {
                    var filterPresent = that.filterManager.isFilterPresentForCol(column.colId);
                    var displayStyle = filterPresent ? 'inline' : 'none';
                    column.eFilterIcon.style.display = displayStyle;
                }
            });
        }
    }
}

