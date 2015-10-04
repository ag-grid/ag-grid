/// <reference path="../utils.ts" />
/// <reference path="textFilter.ts" />
/// <reference path="numberFilter.ts" />
/// <reference path="setFilter.ts" />
/// <reference path="../widgets/agPopupService.ts" />
/// <reference path="../widgets/agPopupService.ts" />
/// <reference path="../grid.ts" />
/// <reference path="../entities/rowNode.ts" />

module ag.grid {

    var _ = Utils;

    export class FilterManager {

        private $compile: any;
        private $scope: any;
        private gridOptionsWrapper: GridOptionsWrapper;
        private grid: any;
        private allFilters: any;
        private rowModel: any;
        private popupService: PopupService;
        private valueService: ValueService;
        private columnController: ColumnController;
        private quickFilter: string;

        private advancedFilterPresent: boolean;
        private externalFilterPresent: boolean;

        public init(grid: Grid, gridOptionsWrapper: GridOptionsWrapper, $compile: any, $scope: any,
                    columnController: ColumnController, popupService: PopupService, valueService: ValueService) {
            this.$compile = $compile;
            this.$scope = $scope;
            this.gridOptionsWrapper = gridOptionsWrapper;
            this.grid = grid;
            this.allFilters = {};
            this.columnController = columnController;
            this.popupService = popupService;
            this.valueService = valueService;
            this.columnController = columnController;
            this.quickFilter = null;
        }

        public setFilterModel(model: any) {
            if (model) {
                // mark the filters as we set them, so any active filters left over we stop
                var modelKeys = Object.keys(model);
                _.iterateObject(this.allFilters, (colId, filterWrapper) => {
                    _.removeFromArray(modelKeys, colId);
                    var newModel = model[colId];
                    this.setModelOnFilterWrapper(filterWrapper.filter, newModel);
                });
                // at this point, processedFields contains data for which we don't have a filter working yet
                _.iterateArray(modelKeys, (colId) => {
                    var column = this.columnController.getColumn(colId);
                    if (!column) {
                        console.warn('Warning ag-grid setFilterModel - no column found for colId ' + colId);
                        return;
                    }
                    var filterWrapper = this.getOrCreateFilterWrapper(column);
                    this.setModelOnFilterWrapper(filterWrapper.filter, model[colId]);
                });
            } else {
                _.iterateObject(this.allFilters, (key, filterWrapper) => {
                    this.setModelOnFilterWrapper(filterWrapper.filter, null);
                });
            }
            this.grid.onFilterChanged();
        }

        private setModelOnFilterWrapper(filter: { getApi: () => { setModel: Function }}, newModel: any) {
            // because user can provide filters, we provide useful error checking and messages
            if (typeof filter.getApi !== 'function') {
                console.warn('Warning ag-grid - filter missing getApi method, which is needed for getFilterModel');
                return;
            }
            var filterApi = filter.getApi();
            if (typeof filterApi.setModel !== 'function') {
                console.warn('Warning ag-grid - filter API missing setModel method, which is needed for setFilterModel');
                return;
            }
            filterApi.setModel(newModel);
        }

        public getFilterModel() {
            var result = <any>{};
            _.iterateObject(this.allFilters, function (key: any, filterWrapper: any) {
                // because user can provide filters, we provide useful error checking and messages
                if (typeof filterWrapper.filter.getApi !== 'function') {
                    console.warn('Warning ag-grid - filter missing getApi method, which is needed for getFilterModel');
                    return;
                }
                var filterApi = filterWrapper.filter.getApi();
                if (typeof filterApi.getModel !== 'function') {
                    console.warn('Warning ag-grid - filter API missing getModel method, which is needed for getFilterModel');
                    return;
                }
                var model = filterApi.getModel();
                if (model) {
                    result[key] = model;
                }
            });
            return result;
        }

        public setRowModel(rowModel: any) {
            this.rowModel = rowModel;
        }

        // returns true if any advanced filter (ie not quick filter) active
        public isAdvancedFilterPresent() {
            var atLeastOneActive = false;

            _.iterateObject(this.allFilters, function (key, filterWrapper) {
                if (!filterWrapper.filter.isFilterActive) { // because users can do custom filters, give nice error message
                    console.error('Filter is missing method isFilterActive');
                }
                if (filterWrapper.filter.isFilterActive()) {
                    atLeastOneActive = true;
                }
            });

            return atLeastOneActive;
        }

        // returns true if quickFilter or advancedFilter
        public isAnyFilterPresent(): boolean {
            return this.isQuickFilterPresent() || this.advancedFilterPresent || this.externalFilterPresent;
        }

        // returns true if given col has a filter active
        public isFilterPresentForCol(colId: any) {
            var filterWrapper = this.allFilters[colId];
            if (!filterWrapper) {
                return false;
            }
            if (!filterWrapper.filter.isFilterActive) { // because users can do custom filters, give nice error message
                console.error('Filter is missing method isFilterActive');
            }
            var filterPresent = filterWrapper.filter.isFilterActive();
            return filterPresent;
        }

        private doesFilterPass(node: RowNode, filterToSkip?: any) {
            var data = node.data;
            var colKeys = Object.keys(this.allFilters);
            for (var i = 0, l = colKeys.length; i < l; i++) { // critical code, don't use functional programming
                var colId = colKeys[i];
                var filterWrapper = this.allFilters[colId];

                // if no filter, always pass
                if (filterWrapper === undefined) {
                    continue;
                }

                if (filterWrapper.filter === filterToSkip) {
                    continue
                }

                if (!filterWrapper.filter.doesFilterPass) { // because users can do custom filters, give nice error message
                    console.error('Filter is missing method doesFilterPass');
                }
                var params = {
                    node: node,
                    data: data
                };
                if (!filterWrapper.filter.doesFilterPass(params)) {
                    return false;
                }
            }
            // all filters passed
            return true;
        }

        // returns true if it has changed (not just same value again)
        public setQuickFilter(newFilter: any): boolean {
            if (newFilter === undefined || newFilter === "") {
                newFilter = null;
            }
            if (this.quickFilter !== newFilter) {
                if (this.gridOptionsWrapper.isVirtualPaging()) {
                    console.warn('ag-grid: cannot do quick filtering when doing virtual paging');
                    return;
                }

                //want 'null' to mean to filter, so remove undefined and empty string
                if (newFilter === undefined || newFilter === "") {
                    newFilter = null;
                }
                if (newFilter !== null) {
                    newFilter = newFilter.toUpperCase();
                }
                this.quickFilter = newFilter;
                return true;
            } else {
                return false;
            }
        }

        public onFilterChanged(): void {
            this.advancedFilterPresent = this.isAdvancedFilterPresent();
            this.externalFilterPresent = this.gridOptionsWrapper.isExternalFilterPresent();

            _.iterateObject(this.allFilters, function (key, filterWrapper) {
                if (filterWrapper.filter.onAnyFilterChanged) {
                    filterWrapper.filter.onAnyFilterChanged();
                }
            });
        }

        public isQuickFilterPresent(): boolean {
            return this.quickFilter !== null;
        }

        public doesRowPassOtherFilters(filterToSkip: any, node: any): boolean {
            return this.doesRowPassFilter(node, filterToSkip);
        }

        public doesRowPassFilter(node: any, filterToSkip?: any): boolean {
            //first up, check quick filter
            if (this.isQuickFilterPresent()) {
                if (!node.quickFilterAggregateText) {
                    this.aggregateRowForQuickFilter(node);
                }
                if (node.quickFilterAggregateText.indexOf(this.quickFilter) < 0) {
                    //quick filter fails, so skip item
                    return false;
                }
            }

            //secondly, give the client a chance to reject this row
            if (this.externalFilterPresent) {
                if (!this.gridOptionsWrapper.doesExternalFilterPass(node)) {
                    return false;
                }
            }

            //lastly, check our internal advanced filter
            if (this.advancedFilterPresent) {
                if (!this.doesFilterPass(node, filterToSkip)) {
                    return false;
                }
            }

            //got this far, all filters pass
            return true;
        }

        private aggregateRowForQuickFilter(node: RowNode) {
            var aggregatedText = '';
            var that = this;
            this.columnController.getAllColumns().forEach(function (column: Column) {
                var data = node.data;
                var value = that.valueService.getValue(column.colDef, data, node);
                if (value && value !== '') {
                    aggregatedText = aggregatedText + value.toString().toUpperCase() + "_";
                }
            });
            node.quickFilterAggregateText = aggregatedText;
        }

        public onNewRowsLoaded() {
            var that = this;
            Object.keys(this.allFilters).forEach(function (field) {
                var filter = that.allFilters[field].filter;
                if (filter.onNewRowsLoaded) {
                    filter.onNewRowsLoaded();
                }
            });
        }

        private createValueGetter(column: Column) {
            var that = this;
            return function valueGetter(node: any) {
                return that.valueService.getValue(column.colDef, node.data, node);
            };
        }

        public getFilterApi(column: Column) {
            var filterWrapper = this.getOrCreateFilterWrapper(column);
            if (filterWrapper) {
                if (typeof filterWrapper.filter.getApi === 'function') {
                    return filterWrapper.filter.getApi();
                }
            }
        }

        private getOrCreateFilterWrapper(column: Column) {
            var filterWrapper = this.allFilters[column.colId];

            if (!filterWrapper) {
                filterWrapper = this.createFilterWrapper(column);
                this.allFilters[column.colId] = filterWrapper;
            }

            return filterWrapper;
        }

        private createFilterWrapper(column: Column) {
            var colDef = column.colDef;

            var filterWrapper = {
                column: column,
                filter: <any> null,
                scope: <any> null,
                gui: <any> null
            };

            if (typeof colDef.filter === 'function') {
                // if user provided a filter, just use it
                // first up, create child scope if needed
                if (this.gridOptionsWrapper.isAngularCompileFilters()) {
                    filterWrapper.scope = this.$scope.$new();;
                }
                // now create filter (had to cast to any to get 'new' working)
                this.assertMethodHasNoParameters(colDef.filter);
                filterWrapper.filter = new (<any>colDef.filter)();
            } else if (colDef.filter === 'text') {
                filterWrapper.filter = new TextFilter();
            } else if (colDef.filter === 'number') {
                filterWrapper.filter = new NumberFilter();
            } else {
                filterWrapper.filter = new SetFilter();
            }

            var filterChangedCallback = this.grid.onFilterChanged.bind(this.grid);
            var filterModifiedCallback = this.grid.onFilterModified.bind(this.grid);
            var doesRowPassOtherFilters = this.doesRowPassOtherFilters.bind(this, filterWrapper.filter);
            var filterParams = colDef.filterParams;

            var params = {
                colDef: colDef,
                rowModel: this.rowModel,
                filterChangedCallback: filterChangedCallback,
                filterModifiedCallback: filterModifiedCallback,
                filterParams: filterParams,
                localeTextFunc: this.gridOptionsWrapper.getLocaleTextFunc(),
                valueGetter: this.createValueGetter(column),
                doesRowPassOtherFilter: doesRowPassOtherFilters,
                context: this.gridOptionsWrapper.getContext,
                $scope: filterWrapper.scope
            };
            if (!filterWrapper.filter.init) { // because users can do custom filters, give nice error message
                throw 'Filter is missing method init';
            }
            filterWrapper.filter.init(params);

            if (!filterWrapper.filter.getGui) { // because users can do custom filters, give nice error message
                throw 'Filter is missing method getGui';
            }

            var eFilterGui = document.createElement('div');
            eFilterGui.className = 'ag-filter';
            var guiFromFilter = filterWrapper.filter.getGui();
            if (_.isNodeOrElement(guiFromFilter)) {
                //a dom node or element was returned, so add child
                eFilterGui.appendChild(guiFromFilter);
            } else {
                //otherwise assume it was html, so just insert
                var eTextSpan = document.createElement('span');
                eTextSpan.innerHTML = guiFromFilter;
                eFilterGui.appendChild(eTextSpan);
            }

            if (filterWrapper.scope) {
                filterWrapper.gui = this.$compile(eFilterGui)(filterWrapper.scope)[0];
            } else {
                filterWrapper.gui = eFilterGui;
            }

            return filterWrapper;
        }

        private assertMethodHasNoParameters(theMethod: any) {
            var getRowsParams = _.getFunctionParameters(theMethod);
            if (getRowsParams.length > 0) {
                console.warn('ag-grid: It looks like your filter is of the old type and expecting parameters in the constructor.');
                console.warn('ag-grid: From ag-grid 1.14, the constructor should take no parameters and init() used instead.');
            }
        }

        public showFilter(column: Column, eventSource: any) {

            var filterWrapper = this.getOrCreateFilterWrapper(column);

            // need to show filter before positioning, as only after filter
            // is visible can we find out what the width of it is
            var hidePopup = this.popupService.addAsModalPopup(filterWrapper.gui, true);
            this.popupService.positionPopup(eventSource, filterWrapper.gui, true);

            if (filterWrapper.filter.afterGuiAttached) {
                var params = {
                    hidePopup: hidePopup,
                    eventSource: eventSource
                };
                filterWrapper.filter.afterGuiAttached(params);
            }
        }
    }
}

