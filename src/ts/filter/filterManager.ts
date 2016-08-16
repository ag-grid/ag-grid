import {Utils as _} from "../utils";
import {GridOptionsWrapper} from "../gridOptionsWrapper";
import {PopupService} from "../widgets/popupService";
import {ValueService} from "../valueService";
import {ColumnController} from "../columnController/columnController";
import {RowNode} from "../entities/rowNode";
import {Column} from "../entities/column";
import {TextFilter} from "./textFilter";
import {NumberFilter} from "./numberFilter";
import {Bean, PreDestroy, Autowired, PostConstruct, Context} from "../context/context";
import {IRowModel} from "../interfaces/iRowModel";
import {EventService} from "../eventService";
import {Events} from "../events";

@Bean('filterManager')
export class FilterManager {

    @Autowired('$compile') private $compile: any;
    @Autowired('$scope') private $scope: any;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('gridCore') private gridCore: any;
    @Autowired('popupService') private popupService: PopupService;
    @Autowired('valueService') private valueService: ValueService;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('rowModel') private rowModel: IRowModel;
    @Autowired('eventService') private eventService: EventService;
    @Autowired('enterprise') private enterprise: boolean;
    @Autowired('context') private context: Context;

    private allFilters: any = {};
    private quickFilter: string = null;

    private advancedFilterPresent: boolean;
    private externalFilterPresent: boolean;

    private availableFilters: {[key: string]: any} = {
        'text': TextFilter,
        'number': NumberFilter
    };

    @PostConstruct
    public init(): void {
        this.eventService.addEventListener(Events.EVENT_ROW_DATA_CHANGED, this.onNewRowsLoaded.bind(this));
        this.eventService.addEventListener(Events.EVENT_NEW_COLUMNS_LOADED, this.onNewColumnsLoaded.bind(this));

        this.quickFilter = this.parseQuickFilter(this.gridOptionsWrapper.getQuickFilterText());

        // check this here, in case there is a filter from the start
        this.checkExternalFilter();
    }

    public registerFilter(key: string, Filter: any): void {
        this.availableFilters[key] = Filter;
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
                var column = this.columnController.getPrimaryColumn(colId);
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
        this.onFilterChanged();
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
            if (_.exists(model)) {
                result[key] = model;
            }
        });
        return result;
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
                filterWrapper.column.setFilterActive(true);
            } else {
                filterWrapper.column.setFilterActive(false);
            }
        });

        return atLeastOneActive;
    }

    // returns true if quickFilter or advancedFilter
    public isAnyFilterPresent(): boolean {
        return this.isQuickFilterPresent() || this.advancedFilterPresent || this.externalFilterPresent;
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

            // don't bother with filters that are not active
            if (!filterWrapper.filter.isFilterActive()) {
                continue;
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

    private parseQuickFilter(newFilter: string): string {
        if (_.missing(newFilter) || newFilter === "") {
            return null;
        }

        if (this.gridOptionsWrapper.isRowModelVirtual()) {
            console.warn('ag-grid: cannot do quick filtering when doing virtual paging');
            return null;
        }

        return newFilter.toUpperCase();
    }

    // returns true if it has changed (not just same value again)
    public setQuickFilter(newFilter: any): void {
        var parsedFilter = this.parseQuickFilter(newFilter);
        if (this.quickFilter !== parsedFilter) {
            this.quickFilter = parsedFilter;
            this.onFilterChanged();
        }
    }

    private checkExternalFilter(): void {
        this.externalFilterPresent = this.gridOptionsWrapper.isExternalFilterPresent();
    }

    public onFilterChanged(): void {
        this.eventService.dispatchEvent(Events.EVENT_BEFORE_FILTER_CHANGED);

        this.advancedFilterPresent = this.isAdvancedFilterPresent();
        this.checkExternalFilter();

        _.iterateObject(this.allFilters, function (key, filterWrapper) {
            if (filterWrapper.filter.onAnyFilterChanged) {
                filterWrapper.filter.onAnyFilterChanged();
            }
        });

        this.eventService.dispatchEvent(Events.EVENT_FILTER_CHANGED);

        this.eventService.dispatchEvent(Events.EVENT_AFTER_FILTER_CHANGED);
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
        this.columnController.getAllPrimaryColumns().forEach(function (column: Column) {
            var value = that.valueService.getValue(column, node);
            if (value && value !== '') {
                aggregatedText = aggregatedText + value.toString().toUpperCase() + "_";
            }
        });
        node.quickFilterAggregateText = aggregatedText;
    }

    private onNewRowsLoaded() {
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
            return that.valueService.getValue(column, node);
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

    public getOrCreateFilterWrapper(column: Column): FilterWrapper {
        var filterWrapper = this.allFilters[column.getColId()];

        if (!filterWrapper) {
            filterWrapper = this.createFilterWrapper(column);
            this.allFilters[column.getColId()] = filterWrapper;
        }

        return filterWrapper;
    }

    // destroys the filter, so it not longer takes par
    public destroyFilter(column: Column): void {
        var filterWrapper = this.allFilters[column.getColId()];
        if (filterWrapper) {
            if (filterWrapper.destroy) {
                filterWrapper.destroy();
            }
            delete this.allFilters[column.getColId()];
            this.onFilterChanged();
            filterWrapper.column.setFilterActive(false);
        }
    }

    private createFilterWrapper(column: Column): FilterWrapper {
        var colDef = column.getColDef();

        var filterWrapper: FilterWrapper = {
            column: column,
            filter: <any> null,
            scope: <any> null,
            gui: <any> null
        };

        if (typeof colDef.filter === 'function') {
            // if user provided a filter, just use it
            // first up, create child scope if needed
            if (this.gridOptionsWrapper.isAngularCompileFilters()) {
                filterWrapper.scope = this.$scope.$new();
                filterWrapper.scope.context = this.gridOptionsWrapper.getContext();
            }
            // now create filter (had to cast to any to get 'new' working)
            this.assertMethodHasNoParameters(colDef.filter);
            filterWrapper.filter = new (<any>colDef.filter)();
        } else if (_.missing(colDef.filter) || typeof colDef.filter === 'string') {
            var Filter = this.getFilterFromCache(<string>colDef.filter);
            filterWrapper.filter = new Filter();
        } else {
            console.error('ag-Grid: colDef.filter should be function or a string');
        }

        this.context.wireBean(filterWrapper.filter);

        var filterChangedCallback = this.onFilterChanged.bind(this);
        var filterModifiedCallback = () => this.eventService.dispatchEvent(Events.EVENT_FILTER_MODIFIED);
        var doesRowPassOtherFilters = this.doesRowPassOtherFilters.bind(this, filterWrapper.filter);
        var filterParams = colDef.filterParams;

        var params = {
            column: column,
            colDef: colDef,
            rowModel: this.rowModel,
            filterChangedCallback: filterChangedCallback,
            filterModifiedCallback: filterModifiedCallback,
            filterParams: filterParams,
            localeTextFunc: this.gridOptionsWrapper.getLocaleTextFunc(),
            valueGetter: this.createValueGetter(column),
            doesRowPassOtherFilter: doesRowPassOtherFilters,
            context: this.gridOptionsWrapper.getContext(),
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

    private getFilterFromCache(filterType: string): any {
        var defaultFilterType = this.enterprise ? 'set' : 'text';
        var defaultFilter = this.availableFilters[defaultFilterType];

        if (_.missing(filterType)) {
            return defaultFilter;
        }

        if (!this.enterprise && filterType==='set') {
            console.warn('ag-Grid: Set filter is only available in Enterprise ag-Grid');
            filterType = 'text';
        }

        if (this.availableFilters[filterType]) {
            return this.availableFilters[filterType];
        } else {
            console.error('ag-Grid: Could not find filter type ' + filterType);
            return this.availableFilters[defaultFilter];
        }
    }

    private onNewColumnsLoaded(): void {
        this.destroy();
    }

    @PreDestroy
    public destroy() {
        _.iterateObject(this.allFilters, (key: string, filterWrapper: any) => {
            if (filterWrapper.filter.destroy) {
                filterWrapper.filter.destroy();
                filterWrapper.column.setFilterActive(false);
            }
        });
        this.allFilters = {};
    }

    private assertMethodHasNoParameters(theMethod: any) {
        var getRowsParams = _.getFunctionParameters(theMethod);
        if (getRowsParams.length > 0) {
            console.warn('ag-grid: It looks like your filter is of the old type and expecting parameters in the constructor.');
            console.warn('ag-grid: From ag-grid 1.14, the constructor should take no parameters and init() used instead.');
        }
    }

}

export interface FilterWrapper {
    column: Column,
    filter: any,
    scope: any,
    gui: HTMLElement
}
