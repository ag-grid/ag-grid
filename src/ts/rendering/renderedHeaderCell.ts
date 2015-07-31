/// <reference path='../utils.ts' />
/// <reference path='../filter/filterManager.ts' />
/// <reference path='../gridOptionsWrapper.ts' />
/// <reference path='../columnController.ts' />
/// <reference path='renderedHeaderElement.ts' />

module awk.grid {

    var _ = Utils;
    var constants = Constants;
    var svgFactory = SvgFactory.getInstance();

    export class RenderedHeaderCell extends RenderedHeaderElement {

        private eHeaderCell: HTMLElement;
        private eSortAsc: HTMLElement;
        private eSortDesc: HTMLElement;
        private eSortNone: HTMLElement;
        private eFilterIcon: HTMLElement;

        private column: Column;
        private grouped: boolean;
        private gridOptionsWrapper: GridOptionsWrapper;
        private parentScope: any;
        private childScope: any; //todo: destroy this
        private filterManager: FilterManager;
        private columnController: ColumnController;
        private $compile: any;
        private angularGrid: Grid;
        private parentGroup: RenderedHeaderGroupCell;

        private startWidth: number;

        constructor(column: Column, parentGroup: RenderedHeaderGroupCell, gridOptionsWrapper: GridOptionsWrapper,
                    parentScope: any, filterManager: FilterManager, columnController: ColumnController,
                    $compile: any, angularGrid: Grid, eRoot: HTMLElement) {
            super(eRoot);
            this.column = column;
            this.parentGroup = parentGroup;
            this.gridOptionsWrapper = gridOptionsWrapper;
            this.parentScope = parentScope;
            this.filterManager = filterManager;
            this.columnController = columnController;
            this.$compile = $compile;
            this.angularGrid = angularGrid;

            this.setupComponents();
        }

        public getGui(): HTMLElement {
            return this.eHeaderCell;
        }

        public destroy(): void {
            if (this.childScope) {
                this.childScope.$destroy();
            }
        }

        public fireColumnResized(): void {
            if (typeof this.gridOptionsWrapper.getColumnResized() === 'function') {
                this.gridOptionsWrapper.getColumnResized()(this.column);
            }
        }

        private createScope(): void {
            if (this.gridOptionsWrapper.isAngularCompileHeaders()) {
                this.childScope = this.parentScope.$new();
                this.childScope.colDef = this.column.colDef;
                this.childScope.colIndex = this.column.index;
                this.childScope.colDefWrapper = this.column;
            }
        }

        private addClasses(): void {
            _.addCssClass(this.eHeaderCell, 'ag-header-cell');
            if (this.grouped) {
                _.addCssClass(this.eHeaderCell, 'ag-header-cell-grouped'); // this takes 50% height
            } else {
                _.addCssClass(this.eHeaderCell, 'ag-header-cell-not-grouped'); // this takes 100% height
            }
        }

        private addMenu(): void {
            var showMenu = this.gridOptionsWrapper.isEnableFilter() && !this.column.colDef.suppressMenu;
            if (!showMenu) {
                return;
            }

            var eMenuButton = _.createIcon('menu', this.gridOptionsWrapper, this.column, svgFactory.createMenuSvg);
            _.addCssClass(eMenuButton, 'ag-header-icon');

            eMenuButton.setAttribute("class", "ag-header-cell-menu-button");
            var that = this;
            eMenuButton.onclick = function () {
                that.filterManager.showFilter(that.column, this);
            };
            this.eHeaderCell.appendChild(eMenuButton);
            this.eHeaderCell.onmouseenter = function () {
                eMenuButton.style.opacity = '1';
            };
            this.eHeaderCell.onmouseleave = function () {
                eMenuButton.style.opacity = '0';
            };
            eMenuButton.style.opacity = '0';
            eMenuButton.style['transition'] = 'opacity 0.5s, border 0.2s';
            var style: any = eMenuButton.style;
            style['-webkit-transition'] = 'opacity 0.5s, border 0.2s';
        }

        private addSortIcons(headerCellLabel: HTMLElement): void {
            var addSortIcons = this.gridOptionsWrapper.isEnableSorting() && !this.column.colDef.suppressSorting;
            if (!addSortIcons) {
                return;
            }

            this.eSortAsc = _.createIcon('sortAscending', this.gridOptionsWrapper, this.column, svgFactory.createArrowUpSvg);
            this.eSortDesc = _.createIcon('sortDescending', this.gridOptionsWrapper, this.column, svgFactory.createArrowDownSvg);
            _.addCssClass(this.eSortAsc, 'ag-header-icon ag-sort-ascending-icon');
            _.addCssClass(this.eSortDesc, 'ag-header-icon ag-sort-descending-icon');
            headerCellLabel.appendChild(this.eSortAsc);
            headerCellLabel.appendChild(this.eSortDesc);

            // 'no sort' icon
            if (this.column.colDef.unSortIcon || this.gridOptionsWrapper.isUnSortIcon()) {
                this.eSortNone = _.createIcon('sortUnSort', this.gridOptionsWrapper, this.column, svgFactory.createArrowUpDownSvg);
                _.addCssClass(this.eSortNone, 'ag-header-icon ag-sort-none-icon');
                headerCellLabel.appendChild(this.eSortNone);
            }

            this.eSortAsc.style.display = 'none';
            this.eSortDesc.style.display = 'none';
            this.addSortHandling(headerCellLabel);
        }

        private setupComponents(): void {
            this.eHeaderCell = document.createElement("div");

            this.createScope();
            this.addClasses();
            this.addHeaderClassesFromCollDef();

            // add tooltip if exists
            if (this.column.colDef.headerTooltip) {
                this.eHeaderCell.title = this.column.colDef.headerTooltip;
            }

            if (this.gridOptionsWrapper.isEnableColResize() && !this.column.colDef.suppressResize) {
                var headerCellResize = document.createElement("div");
                headerCellResize.className = "ag-header-cell-resize";
                this.eHeaderCell.appendChild(headerCellResize);
                this.addDragHandler(headerCellResize);
            }

            this.addMenu();

            // label div
            var headerCellLabel = document.createElement("div");
            headerCellLabel.className = "ag-header-cell-label";

            // add in sort icons
            this.addSortIcons(headerCellLabel);


            // add in filter icon
            this.eFilterIcon = _.createIcon('filter', this.gridOptionsWrapper, this.column, svgFactory.createFilterSvg);
            _.addCssClass(this.eFilterIcon, 'ag-header-icon');
            headerCellLabel.appendChild(this.eFilterIcon);

            // render the cell, use a renderer if one is provided
            var headerCellRenderer: any;
            if (this.column.colDef.headerCellRenderer) { // first look for a renderer in col def
                headerCellRenderer = this.column.colDef.headerCellRenderer;
            } else if (this.gridOptionsWrapper.getHeaderCellRenderer()) { // second look for one in grid options
                headerCellRenderer = this.gridOptionsWrapper.getHeaderCellRenderer();
            }

            var headerNameValue = this.columnController.getDisplayNameForCol(this.column);

            if (headerCellRenderer) {
                this.useRenderer(headerNameValue, headerCellRenderer, headerCellLabel);
            } else {
                // no renderer, default text render
                var eInnerText = document.createElement("span");
                eInnerText.className = 'ag-header-cell-text';
                eInnerText.innerHTML = headerNameValue;
                headerCellLabel.appendChild(eInnerText);
            }

            this.eHeaderCell.appendChild(headerCellLabel);
            this.eHeaderCell.style.width = _.formatWidth(this.column.actualWidth);

            this.refreshFilterIcon();
            this.refreshSortIcon();
        }

        private useRenderer(headerNameValue: string, headerCellRenderer: Function,
                            headerCellLabel: HTMLElement): void {
            // renderer provided, use it
            var cellRendererParams = {
                colDef: this.column.colDef,
                $scope: this.childScope,
                context: this.gridOptionsWrapper.getContext(),
                value: headerNameValue,
                api: this.gridOptionsWrapper.getApi()
            };
            var cellRendererResult = headerCellRenderer(cellRendererParams);
            var childToAppend: any;
            if (_.isNodeOrElement(cellRendererResult)) {
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
                var childToAppendCompiled = this.$compile(childToAppend)(this.childScope)[0];
                headerCellLabel.appendChild(childToAppendCompiled);
            } else {
                headerCellLabel.appendChild(childToAppend);
            }
        }

        public refreshFilterIcon(): void {
            if (this.eFilterIcon) {
                var filterPresent = this.filterManager.isFilterPresentForCol(this.column.colId);
                var displayStyle = filterPresent ? 'inline' : 'none';
                this.eFilterIcon.style.display = displayStyle;
            }
        }

        public refreshSortIcon(): void {
            // update visibility of icons
            var sortAscending = this.column.sort === constants.ASC;
            var sortDescending = this.column.sort === constants.DESC;
            var unSort = this.column.sort !== constants.DESC && this.column.sort !== constants.ASC;

            if (this.eSortAsc) {
                _.setVisible(this.eSortAsc, sortAscending);
            }
            if (this.eSortDesc) {
                _.setVisible(this.eSortDesc, sortDescending);
            }
            if (this.eSortNone) {
                _.setVisible(this.eSortNone, unSort);
            }
        }

        private getNextSortDirection() {
            var suppressUnSort = this.gridOptionsWrapper.isSuppressUnSort();
            var suppressDescSort = this.gridOptionsWrapper.isSuppressDescSort();

            switch (this.column.sort) {
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

        private addSortHandling(headerCellLabel: HTMLElement) {
            var that = this;

            headerCellLabel.addEventListener("click", function (event: any) {

                // update sort on current col
                that.column.sort = that.getNextSortDirection();

                // sortedAt used for knowing order of cols when multi-col sort
                if (that.column.sort) {
                    that.column.sortedAt = new Date().valueOf();
                } else {
                    that.column.sortedAt = null;
                }

                var doingMultiSort = !that.gridOptionsWrapper.isSuppressMultiSort() && event.shiftKey;

                // clear sort on all columns except this one, and update the icons
                if (!doingMultiSort) {
                    that.columnController.getAllColumns().forEach(function (columnToClear: any) {
                        // Do not clear if either holding shift, or if column in question was clicked
                        if (!(columnToClear === that.column)) {
                            columnToClear.sort = null;
                        }
                    });
                }

                that.angularGrid.onSortingChanged();
            });
        }

        public onDragStart(): void {
            this.startWidth = this.column.actualWidth;
        }

        public onDragging(dragChange: number): void {
            var newWidth = this.startWidth + dragChange;
            if (newWidth < this.column.getMinimumWidth()) {
                newWidth = this.column.getMinimumWidth();
            }

            if (this.column.isGreaterThanMax(newWidth)) {
                newWidth = this.column.colDef.maxWidth;
            }

            this.adjustColumnWidth(newWidth);

            if (this.parentGroup) {
                this.parentGroup.setWidthOfGroupHeaderCell();
            }

            // should not be calling these here, should do something else
            if (this.column.pinned) {
                this.angularGrid.updatePinnedColContainerWidthAfterColResize();
            } else {
                this.angularGrid.updateBodyContainerWidthAfterColResize();
            }
        }

        public adjustColumnWidth(newWidth: any) {
            var newWidthPx = newWidth + "px";
            var selectorForAllColsInCell = ".cell-col-" + this.column.index;
            var cellsForThisCol: NodeList = this.getERoot().querySelectorAll(selectorForAllColsInCell);
            for (var i = 0; i < cellsForThisCol.length; i++) {
                var element = <HTMLElement> cellsForThisCol[i];
                element.style.width = newWidthPx;
            }

            this.eHeaderCell.style.width = newWidthPx;
            this.column.actualWidth = newWidth;
        }

        private addHeaderClassesFromCollDef() {
            if (this.column.colDef.headerClass) {
                var classToUse: any;
                if (typeof this.column.colDef.headerClass === 'function') {
                    var params = {
                        colDef: this.column.colDef,
                        $scope: this.childScope,
                        context: this.gridOptionsWrapper.getContext(),
                        api: this.gridOptionsWrapper.getApi()
                    };
                    classToUse = this.column.colDef.headerClass(params);
                } else {
                    classToUse = this.column.colDef.headerClass;
                }

                if (typeof classToUse === 'string') {
                    _.addCssClass(this.eHeaderCell, classToUse);
                } else if (Array.isArray(classToUse)) {
                    classToUse.forEach(function (cssClassItem: any) {
                        _.addCssClass(this.eHeaderCell, cssClassItem);
                    });
                }
            }
        }

    }

}