/// <reference path='../utils.ts' />
/// <reference path='../filter/filterManager.ts' />
/// <reference path='../gridOptionsWrapper.ts' />
/// <reference path='../columnController/columnController.ts' />
/// <reference path='renderedHeaderElement.ts' />

module ag.grid {

    var _ = Utils;
    var constants = Constants;
    var svgFactory = SvgFactory.getInstance();

    export class RenderedHeaderCell extends RenderedHeaderElement {

        private static DEFAULT_SORTING_ORDER = [Column.SORT_ASC, Column.SORT_DESC, null];

        private eHeaderCell: HTMLElement;
        private eSortAsc: HTMLElement;
        private eSortDesc: HTMLElement;
        private eSortNone: HTMLElement;
        private eFilterIcon: HTMLElement;

        private column: Column;
        private gridOptionsWrapper: GridOptionsWrapper;
        private parentScope: any;
        private childScope: any;
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

        private createScope(): void {
            if (this.gridOptionsWrapper.isAngularCompileHeaders()) {
                this.childScope = this.parentScope.$new();
                this.childScope.colDef = this.column.getColDef();
                this.childScope.colIndex = this.column.getIndex();
                this.childScope.colDefWrapper = this.column;
            }
        }

        private addAttributes(): void {
            this.eHeaderCell.setAttribute("col", (
                                this.column.getIndex() !== undefined
                                && this.column.getIndex() !== null)
                                ? this.column.getIndex().toString() : '');
            this.eHeaderCell.setAttribute("colId", this.column.getColId());
        }

        private addClasses(): void {
            _.addCssClass(this.eHeaderCell, 'ag-header-cell');
        }

        private addMenu(): void {
            var showMenu = this.gridOptionsWrapper.isEnableFilter() && !this.column.getColDef().suppressMenu;
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

            if (!this.gridOptionsWrapper.isSuppressMenuHide()) {
                eMenuButton.style.opacity = '0';
                this.eHeaderCell.onmouseenter = function () {
                    eMenuButton.style.opacity = '1';
                };
                this.eHeaderCell.onmouseleave = function () {
                    eMenuButton.style.opacity = '0';
                };
            }
            eMenuButton.style['transition'] = 'opacity 0.5s, border 0.2s';
            var style: any = eMenuButton.style;
            style['-webkit-transition'] = 'opacity 0.5s, border 0.2s';
        }

        private addSortIcons(headerCellLabel: HTMLElement): void {
            var addSortIcons = this.gridOptionsWrapper.isEnableSorting() && !this.column.getColDef().suppressSorting;
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
            if (this.column.getColDef().unSortIcon || this.gridOptionsWrapper.isUnSortIcon()) {
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
            this.addAttributes();
            this.addHeaderClassesFromCollDef();

            var colDef = this.column.getColDef();

            // add tooltip if exists
            if (colDef.headerTooltip) {
                this.eHeaderCell.title = colDef.headerTooltip;
            }

            if (this.gridOptionsWrapper.isEnableColResize() && !colDef.suppressResize) {
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
            if (colDef.headerCellRenderer) { // first look for a renderer in col def
                headerCellRenderer = colDef.headerCellRenderer;
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
            this.eHeaderCell.style.width = _.formatWidth(this.column.getActualWidth());

            this.refreshFilterIcon();
            this.refreshSortIcon();
        }

        private useRenderer(headerNameValue: string, headerCellRenderer: Function,
                            headerCellLabel: HTMLElement): void {
            // renderer provided, use it
            var cellRendererParams = {
                colDef: this.column.getColDef(),
                $scope: this.childScope,
                context: this.gridOptionsWrapper.getContext(),
                value: headerNameValue,
                api: this.gridOptionsWrapper.getApi(),
                eHeaderCell: this.eHeaderCell
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
            var filterPresent = this.filterManager.isFilterPresentForCol(this.column.getColId());
            if (filterPresent) {
                _.addCssClass(this.eHeaderCell, 'ag-header-cell-filtered');
                this.eFilterIcon.style.display = 'inline';
            } else {
                _.removeCssClass(this.eHeaderCell, 'ag-header-cell-filtered');
                this.eFilterIcon.style.display = 'none';
            }
        }

        public refreshSortIcon(): void {
            // update visibility of icons
            var sortAscending = this.column.getSort() === Column.SORT_ASC;
            var sortDescending = this.column.getSort() === Column.SORT_DESC;
            var unSort = this.column.getSort() !== Column.SORT_DESC && this.column.getSort() !== Column.SORT_ASC;

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

        private getNextSortDirection(): string {

            var sortingOrder: string[];
            if (this.column.getColDef().sortingOrder) {
                sortingOrder = this.column.getColDef().sortingOrder;
            } else if (this.gridOptionsWrapper.getSortingOrder()) {
                sortingOrder = this.gridOptionsWrapper.getSortingOrder();
            } else {
                sortingOrder = RenderedHeaderCell.DEFAULT_SORTING_ORDER;
            }

            if ( !Array.isArray(sortingOrder) || sortingOrder.length <= 0) {
                console.warn('ag-grid: sortingOrder must be an array with at least one element, currently it\'s ' + sortingOrder);
                return;
            }

            var currentIndex = sortingOrder.indexOf(this.column.getSort());
            var notInArray = currentIndex < 0;
            var lastItemInArray = currentIndex == sortingOrder.length - 1;
            var result: string;
            if (notInArray || lastItemInArray) {
                result = sortingOrder[0];
            } else {
                result = sortingOrder[currentIndex + 1];
            }

            // verify the sort type exists, as the user could provide the sortOrder, need to make sure it's valid
            if (RenderedHeaderCell.DEFAULT_SORTING_ORDER.indexOf(result) < 0) {
                console.warn('ag-grid: invalid sort type ' + result);
                return null;
            }

            return result;
        }

        private addSortHandling(headerCellLabel: HTMLElement) {
            var that = this;

            headerCellLabel.addEventListener("click", function (event: any) {

                // update sort on current col
                that.column.setSort(that.getNextSortDirection());

                // sortedAt used for knowing order of cols when multi-col sort
                if (that.column.getSort()) {
                    that.column.setSortedAt(new Date().valueOf());
                } else {
                    that.column.setSortedAt(null);
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
            this.startWidth = this.column.getActualWidth();
        }

        public onDragging(dragChange: number, finished: boolean): void {
            var newWidth = this.startWidth + dragChange;
            this.columnController.setColumnWidth(this.column, newWidth, finished);
        }

        public onIndividualColumnResized(column: Column) {
            if (this.column !== column) {
                return;
            }
            var newWidthPx = column.getActualWidth() + "px";
            this.eHeaderCell.style.width = newWidthPx;
        }

        private addHeaderClassesFromCollDef() {
            if (this.column.getColDef().headerClass) {
                var classToUse: string | string[];
                if (typeof this.column.getColDef().headerClass === 'function') {
                    var params = {
                        colDef: this.column.getColDef(),
                        $scope: this.childScope,
                        context: this.gridOptionsWrapper.getContext(),
                        api: this.gridOptionsWrapper.getApi()
                    };
                    var headerClassFunc = <(params: any) => string | string[]> this.column.getColDef().headerClass;
                    classToUse = headerClassFunc(params);
                } else {
                    classToUse = <string | string[]> this.column.getColDef().headerClass;
                }

                if (typeof classToUse === 'string') {
                    _.addCssClass(this.eHeaderCell, classToUse);
                } else if (Array.isArray(classToUse)) {
                    classToUse.forEach((cssClassItem: any): void => {
                        _.addCssClass(this.eHeaderCell, cssClassItem);
                    });
                }
            }
        }

    }

}