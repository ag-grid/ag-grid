/// <reference path='../utils.ts' />
/// <reference path='../filter/filterManager.ts' />
/// <reference path='../gridOptionsWrapper.ts' />
/// <reference path='../columnController/columnController.ts' />
/// <reference path='renderedHeaderElement.ts' />
/// <reference path='headerTemplateLoader.ts' />

module ag.grid {

    var _ = Utils;

    export class RenderedHeaderCell extends RenderedHeaderElement {

        private static DEFAULT_SORTING_ORDER = [Column.SORT_ASC, Column.SORT_DESC, null];

        private parentGroup: RenderedHeaderGroupCell;
        private eHeaderCell: HTMLElement;
        private eSortAsc: HTMLElement;
        private eSortDesc: HTMLElement;
        private eSortNone: HTMLElement;
        private eFilterIcon: HTMLElement;
        private eText: HTMLElement;

        private column: Column;

        private parentScope: any;
        private childScope: any;

        private gridOptionsWrapper: GridOptionsWrapper;
        private filterManager: FilterManager;
        private columnController: ColumnController;
        private $compile: any;
        private grid: Grid;
        private headerTemplateLoader: HeaderTemplateLoader;

        private startWidth: number;

        constructor(column: Column, parentGroup: RenderedHeaderGroupCell, gridOptionsWrapper: GridOptionsWrapper,
                    parentScope: any, filterManager: FilterManager, columnController: ColumnController,
                    $compile: any, angularGrid: Grid, eRoot: HTMLElement, headerTemplateLoader: HeaderTemplateLoader) {
            super(eRoot);
            this.column = column;
            this.parentGroup = parentGroup;
            this.gridOptionsWrapper = gridOptionsWrapper;
            this.parentScope = parentScope;
            this.filterManager = filterManager;
            this.columnController = columnController;
            this.$compile = $compile;
            this.grid = angularGrid;
            this.headerTemplateLoader = headerTemplateLoader;

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

        private addMenu(): void {
            var eMenu = <HTMLElement> this.eHeaderCell.querySelector('#agMenu');

            // if no menu provided in template, do nothing
            if (!eMenu) {
                return;
            }

            var weWantMenu = this.gridOptionsWrapper.isEnableFilter() && !this.column.getColDef().suppressMenu;
            if (!weWantMenu) {
                _.removeFromParent(eMenu);
                return;
            }

            var that = this;
            eMenu.addEventListener('click',function () {
                that.filterManager.showFilter(that.column, this);
            });

            if (!this.gridOptionsWrapper.isSuppressMenuHide()) {
                eMenu.style.opacity = '0';
                this.eHeaderCell.addEventListener('mouseenter', function () {
                    eMenu.style.opacity = '1';
                });
                this.eHeaderCell.addEventListener('mouseleave', function () {
                    eMenu.style.opacity = '0';
                });
            }
            var style = <any> eMenu.style;
            style['transition'] = 'opacity 0.5s, border 0.2s';
            style['-webkit-transition'] = 'opacity 0.5s, border 0.2s';
        }

        private removeSortIcons(): void {
            _.removeFromParent(this.eHeaderCell.querySelector('#agSortAsc'));
            _.removeFromParent(this.eHeaderCell.querySelector('#agSortDesc'));
            _.removeFromParent(this.eHeaderCell.querySelector('#agNoSort'));
        }

        private addSortIcons(): void {
            this.eSortAsc = <HTMLElement> this.eHeaderCell.querySelector('#agSortAsc');
            this.eSortDesc = <HTMLElement> this.eHeaderCell.querySelector('#agSortDesc');
            this.eSortNone = <HTMLElement> this.eHeaderCell.querySelector('#agNoSort');

            if (this.eSortAsc) {
                this.eSortAsc.style.display = 'none';
            }
            if (this.eSortDesc) {
                this.eSortDesc.style.display = 'none';
            }

            var showingNoSortIcon = this.column.getColDef().unSortIcon || this.gridOptionsWrapper.isUnSortIcon();
            // 'no sort' icon
            if (!showingNoSortIcon) {
                _.removeFromParent(this.eSortNone);
            }
        }

        private setupComponents(): void {
            this.eHeaderCell = this.headerTemplateLoader.createHeaderElement(this.column);

            _.addCssClass(this.eHeaderCell, 'ag-header-cell');

            this.createScope();
            this.addAttributes();
            this.addHeaderClassesFromCollDef();

            var colDef = this.column.getColDef();

            // add tooltip if exists
            if (colDef.headerTooltip) {
                this.eHeaderCell.title = colDef.headerTooltip;
            }

            this.addResize();

            this.addMenu();

            // label div
            this.eText = <HTMLElement> this.eHeaderCell.querySelector('#agText');

            // add in sort icons
            this.addSort();

            // add in filter icon
            this.eFilterIcon = <HTMLElement> this.eHeaderCell.querySelector('#agFilter');

            // render the cell, use a renderer if one is provided
            var headerCellRenderer: any;
            if (colDef.headerCellRenderer) { // first look for a renderer in col def
                headerCellRenderer = colDef.headerCellRenderer;
            } else if (this.gridOptionsWrapper.getHeaderCellRenderer()) { // second look for one in grid options
                headerCellRenderer = this.gridOptionsWrapper.getHeaderCellRenderer();
            }

            var headerNameValue = this.columnController.getDisplayNameForCol(this.column);

            if (this.eText) {
                if (headerCellRenderer) {
                    this.useRenderer(headerNameValue, headerCellRenderer);
                } else {
                    // no renderer, default text render
                    this.eText.className = 'ag-header-cell-text';
                    this.eText.innerHTML = headerNameValue;
                }
            }

            this.eHeaderCell.style.width = _.formatWidth(this.column.getActualWidth());

            this.refreshFilterIcon();
            this.refreshSortIcon();
        }

        private addSort(): void {
            var enableSorting = this.gridOptionsWrapper.isEnableSorting() && !this.column.getColDef().suppressSorting;
            if (enableSorting) {
                this.addSortIcons();
                this.addSortHandling();
            } else {
                this.removeSortIcons();
            }
        }

        private addResize(): void {
            var colDef = this.column.getColDef();
            var eResize = this.eHeaderCell.querySelector('#agResizeBar');

            // if no eResize in template, do nothing
            if (!eResize) {
                return;
            }

            var weWantResize = this.gridOptionsWrapper.isEnableColResize() && !colDef.suppressResize;
            if (!weWantResize) {
                _.removeFromParent(eResize);
                return;
            }

            this.addDragHandler(eResize);

            var weWantAutoSize = !this.gridOptionsWrapper.isSuppressAutoSize() && !colDef.suppressAutoSize;
            if (weWantAutoSize) {
                eResize.addEventListener('dblclick', (event: MouseEvent) => {
                    this.columnController.autoSizeColumn(this.column);
                });
            }
        }

        private useRenderer(headerNameValue: string, headerCellRenderer: Function): void {
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
                this.eText.appendChild(childToAppendCompiled);
            } else {
                this.eText.appendChild(childToAppend);
            }
        }

        public refreshFilterIcon(): void {
            var filterPresent = this.filterManager.isFilterPresentForCol(this.column.getColId());

            if (this.eFilterIcon) {
                _.addOrRemoveCssClass(this.eHeaderCell, 'ag-header-cell-filtered', filterPresent);
                this.eFilterIcon.style.display = filterPresent ? 'inline' : 'none';
            }
        }

        public refreshSortIcon(): void {
            // update visibility of icons
            var sortAscending = this.column.getSort() === Column.SORT_ASC;
            var sortDescending = this.column.getSort() === Column.SORT_DESC;
            var sortNone = this.column.getSort() !== Column.SORT_DESC && this.column.getSort() !== Column.SORT_ASC;

            if (this.eSortAsc) {
                _.setVisible(this.eSortAsc, sortAscending);
            }
            if (this.eSortDesc) {
                _.setVisible(this.eSortDesc, sortDescending);
            }
            if (this.eSortNone) {
                _.setVisible(this.eSortNone, sortNone);
            }

            _.addOrRemoveCssClass(this.eHeaderCell, 'ag-header-cell-sorted-asc', sortAscending);
            _.addOrRemoveCssClass(this.eHeaderCell, 'ag-header-cell-sorted-desc', sortDescending);
            _.addOrRemoveCssClass(this.eHeaderCell, 'ag-header-cell-sorted-none', sortNone);
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

        private addSortHandling() {
            this.eText.addEventListener("click", (event: any) => {

                // update sort on current col
                this.column.setSort(this.getNextSortDirection());

                // sortedAt used for knowing order of cols when multi-col sort
                if (this.column.getSort()) {
                    this.column.setSortedAt(new Date().valueOf());
                } else {
                    this.column.setSortedAt(null);
                }

                var doingMultiSort = !this.gridOptionsWrapper.isSuppressMultiSort() && event.shiftKey;

                // clear sort on all columns except this one, and update the icons
                if (!doingMultiSort) {
                    this.columnController.getAllColumns().forEach( (columnToClear: any)=> {
                        // Do not clear if either holding shift, or if column in question was clicked
                        if (!(columnToClear === this.column)) {
                            columnToClear.sort = null;
                        }
                    });
                }

                this.grid.onSortingChanged();
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