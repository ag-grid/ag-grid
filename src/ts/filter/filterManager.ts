import {ExternalPromise, Promise, Utils as _} from "../utils";
import {GridOptionsWrapper} from "../gridOptionsWrapper";
import {PopupService} from "../widgets/popupService";
import {ValueService} from "../valueService/valueService";
import {ColumnController} from "../columnController/columnController";
import {ColumnApi} from "../columnController/columnApi";
import {RowNode} from "../entities/rowNode";
import {Column} from "../entities/column";
import {Autowired, Bean, Context, PostConstruct, PreDestroy} from "../context/context";
import {IRowModel} from "../interfaces/iRowModel";
import {EventService} from "../eventService";
import {ColumnEventType, Events, FilterChangedEvent, FilterModifiedEvent} from "../events";
import {IDoesFilterPassParams, IFilterComp, IFilterParams} from "../interfaces/iFilter";
import {ColDef, GetQuickFilterTextParams} from "../entities/colDef";
import {GridApi} from "../gridApi";
import {ComponentResolver} from "../components/framework/componentResolver";

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
    @Autowired('columnApi') private columnApi: ColumnApi;
    @Autowired('gridApi') private gridApi: GridApi;
    @Autowired('componentResolver') private componentResolver: ComponentResolver;

    public static QUICK_FILTER_SEPARATOR = '\n';

    private allFilters: {[p:string]:FilterWrapper} = {};
    private quickFilter: string = null;

    private advancedFilterPresent: boolean;
    private externalFilterPresent: boolean;


    @PostConstruct
    public init(): void {
        this.eventService.addEventListener(Events.EVENT_ROW_DATA_CHANGED, this.onNewRowsLoaded.bind(this));
        this.eventService.addEventListener(Events.EVENT_NEW_COLUMNS_LOADED, this.onNewColumnsLoaded.bind(this));

        this.quickFilter = this.parseQuickFilter(this.gridOptionsWrapper.getQuickFilterText());

        // check this here, in case there is a filter from the start
        this.checkExternalFilter();
    }


    public setFilterModel(model: any) {
        let allPromises:Promise<IFilterComp> [] = [];
        if (model) {
            // mark the filters as we set them, so any active filters left over we stop
            let modelKeys = Object.keys(model);
            _.iterateObject(this.allFilters, (colId: string, filterWrapper: FilterWrapper) => {
                _.removeFromArray(modelKeys, colId);
                let newModel = model[colId];
                this.setModelOnFilterWrapper(filterWrapper.filterPromise, newModel);
                allPromises.push(filterWrapper.filterPromise);
            });
            // at this point, processedFields contains data for which we don't have a filter working yet
            _.iterateArray(modelKeys, (colId) => {
                let column = this.columnController.getPrimaryColumn(colId);
                if (!column) {
                    console.warn('Warning ag-grid setFilterModel - no column found for colId ' + colId);
                    return;
                }
                let filterWrapper = this.getOrCreateFilterWrapper(column);
                this.setModelOnFilterWrapper(filterWrapper.filterPromise, model[colId]);
                allPromises.push(filterWrapper.filterPromise);
            });
        } else {
            _.iterateObject(this.allFilters, (key, filterWrapper: FilterWrapper) => {
                this.setModelOnFilterWrapper(filterWrapper.filterPromise, null);
                allPromises.push(filterWrapper.filterPromise);
            });
        }
        Promise.all(allPromises).then(whatever=>{
            this.onFilterChanged();
        });
    }

    private setModelOnFilterWrapper(filterPromise: Promise<IFilterComp>, newModel: any) {
        filterPromise.then(filter=>{
            if (typeof filter.setModel !== 'function') {
                console.warn('Warning ag-grid - filter missing setModel method, which is needed for setFilterModel');
                return;
            }
            filter.setModel(newModel);
        });
    }

    public getFilterModel(): any {
        let result = <any>{};
        _.iterateObject(this.allFilters, function (key: any, filterWrapper: FilterWrapper) {
            // because user can provide filters, we provide useful error checking and messages
            let filterPromise: Promise<IFilterComp> = filterWrapper.filterPromise;
            let filter = filterPromise.resolveNow(null, filter=>filter);
            if (filter == null) return null;

            if (typeof filter.getModel !== 'function') {
                console.warn('Warning ag-grid - filter API missing getModel method, which is needed for getFilterModel');
                return;
            }
            let model = filter.getModel();
            if (_.exists(model)) {
                result[key] = model;
            }
        });
        return result;
    }

    // returns true if any advanced filter (ie not quick filter) active
    public isAdvancedFilterPresent() {
        return this.advancedFilterPresent;
    }

    private setAdvancedFilterPresent() {
        let atLeastOneActive = false;

        _.iterateObject(this.allFilters, function (key, filterWrapper:FilterWrapper) {
            if (filterWrapper.filterPromise.resolveNow(false, filter=>filter.isFilterActive())) {
                atLeastOneActive = true;
            }
        });

        this.advancedFilterPresent = atLeastOneActive;
    }

    private updateFilterFlagInColumns(source:ColumnEventType): void {
        _.iterateObject(this.allFilters, function (key, filterWrapper:FilterWrapper) {
            let filterActive = filterWrapper.filterPromise.resolveNow(false, filter=>filter.isFilterActive());
            filterWrapper.column.setFilterActive(filterActive, source);
        });
    }

    // returns true if quickFilter or advancedFilter
    public isAnyFilterPresent(): boolean {
        return this.isQuickFilterPresent() || this.advancedFilterPresent || this.externalFilterPresent;
    }

    private doesFilterPass(node: RowNode, filterToSkip?: any) {
        let data = node.data;
        let colKeys = Object.keys(this.allFilters);
        for (let i = 0, l = colKeys.length; i < l; i++) { // critical code, don't use functional programming
            let colId = colKeys[i];
            let filterWrapper: FilterWrapper = this.allFilters[colId];

            // if no filter, always pass
            if (filterWrapper === undefined) {
                continue;
            }

            let filter:IFilterComp = filterWrapper.filterPromise.resolveNow(undefined, filter=>filter);

            // if filter not yet there, continue
            if (filter === undefined) {
                continue;
            }

            if (filter === filterToSkip) {
                continue
            }

            // don't bother with filters that are not active
            if (!filter.isFilterActive()) {
                continue;
            }

            if (!filter.doesFilterPass) { // because users can do custom filters, give nice error message
                console.error('Filter is missing method doesFilterPass');
            }
            let params: IDoesFilterPassParams = {
                node: node,
                data: data
            };
            if (!filter.doesFilterPass(params)) {
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

        if (this.gridOptionsWrapper.isRowModelInfinite()) {
            console.warn('ag-grid: cannot do quick filtering when doing virtual paging');
            return null;
        }

        return newFilter.toUpperCase();
    }

    // returns true if it has changed (not just same value again)
    public setQuickFilter(newFilter: any): void {
        let parsedFilter = this.parseQuickFilter(newFilter);
        if (this.quickFilter !== parsedFilter) {
            this.quickFilter = parsedFilter;
            this.onFilterChanged();
        }
    }

    private checkExternalFilter(): void {
        this.externalFilterPresent = this.gridOptionsWrapper.isExternalFilterPresent();
    }

    public onFilterChanged(): void {
        this.setAdvancedFilterPresent();
        this.updateFilterFlagInColumns("filterChanged");
        this.checkExternalFilter();

        _.iterateObject(this.allFilters, function (key, filterWrapper:FilterWrapper) {
            filterWrapper.filterPromise.then(filter=>{
                if (filter.onAnyFilterChanged) {
                    filter.onAnyFilterChanged();
                }
            })
        });

        let event: FilterChangedEvent = {
            type: Events.EVENT_FILTER_CHANGED,
            api: this.gridApi,
            columnApi: this.columnApi
        };
        this.eventService.dispatchEvent(event);
    }

    public isQuickFilterPresent(): boolean {
        return this.quickFilter !== null;
    }

    public doesRowPassOtherFilters(filterToSkip: any, node: any): boolean {
        return this.doesRowPassFilter(node, filterToSkip);
    }

    private doesRowPassQuickFilterNoCache(node: RowNode): boolean {
        let columns = this.columnController.getAllColumnsForQuickFilter();
        let filterPasses = false;
        columns.forEach( column => {
            if (filterPasses) { return; }
            let part = this.getQuickFilterTextForColumn(column, node);
            if (_.exists(part)) {
                if (part.indexOf(this.quickFilter)>=0) {
                    filterPasses = true;
                }
            }
        });
        return filterPasses;
    }

    private doesRowPassQuickFilterCache(node: any): boolean {
        if (!node.quickFilterAggregateText) {
            this.aggregateRowForQuickFilter(node);
        }
        let filterPasses = node.quickFilterAggregateText.indexOf(this.quickFilter) >= 0;
        return filterPasses;
    }

    private doesRowPassQuickFilter(node: any): boolean {
        let filterPasses: boolean;
        if (this.gridOptionsWrapper.isCacheQuickFilter()) {
            filterPasses = this.doesRowPassQuickFilterCache(node);
        } else {
            filterPasses = this.doesRowPassQuickFilterNoCache(node);
        }
        return filterPasses;
    }

    public doesRowPassFilter(node: any, filterToSkip?: any): boolean {

        // the row must pass ALL of the filters, so if any of them fail,
        // we return true. that means if a row passes the quick filter,
        // but fails the column filter, it fails overall

        // first up, check quick filter
        if (this.isQuickFilterPresent()) {
            if (!this.doesRowPassQuickFilter(node)) {
                return false;
            }
        }

        // secondly, give the client a chance to reject this row
        if (this.externalFilterPresent) {
            if (!this.gridOptionsWrapper.doesExternalFilterPass(node)) {
                return false;
            }
        }

        // lastly, check our internal advanced filter
        if (this.advancedFilterPresent) {
            if (!this.doesFilterPass(node, filterToSkip)) {
                return false;
            }
        }

        // got this far, all filters pass
        return true;
    }

    private getQuickFilterTextForColumn(column: Column, rowNode: RowNode): string {
        let value = this.valueService.getValue(column, rowNode);

        let valueAfterCallback: any;
        let colDef = column.getColDef();
        if (column.getColDef().getQuickFilterText) {
            let params: GetQuickFilterTextParams = {
                value: value,
                node: rowNode,
                data: rowNode.data,
                column: column,
                colDef: colDef
            };
            valueAfterCallback = column.getColDef().getQuickFilterText(params);
        } else {
            valueAfterCallback = value;
        }

        if (valueAfterCallback && valueAfterCallback !== '') {
            return valueAfterCallback.toString().toUpperCase();
        } else {
            return null;
        }
    }

    private aggregateRowForQuickFilter(node: RowNode) {
        let stringParts: string[] = [];
        let columns = this.columnController.getAllColumnsForQuickFilter();
        columns.forEach( column => {
            let part = this.getQuickFilterTextForColumn(column, node);
            if (_.exists(part)) {
                stringParts.push(part);
            }
        });
        node.quickFilterAggregateText = stringParts.join(FilterManager.QUICK_FILTER_SEPARATOR);
    }

    private onNewRowsLoaded(source: ColumnEventType) {
        _.iterateObject(this.allFilters, function (key, filterWrapper: FilterWrapper) {
            filterWrapper.filterPromise.then(filter=>{
                if (filter.onNewRowsLoaded) {
                    filter.onNewRowsLoaded();
                }
            });
        });
        this.updateFilterFlagInColumns(source);
        this.setAdvancedFilterPresent();
    }

    private createValueGetter(column: Column) {
        let that = this;
        return function valueGetter(node: RowNode) {
            return that.valueService.getValue(column, node);
        };
    }

    public getFilterComponent(column: Column):Promise<IFilterComp> {
        let filterWrapper = this.getOrCreateFilterWrapper(column);
        return filterWrapper.filterPromise;
    }

    public getOrCreateFilterWrapper(column: Column): FilterWrapper {
        let filterWrapper:FilterWrapper = this.cachedFilter(column);

        if (!filterWrapper) {
            filterWrapper = this.createFilterWrapper(column);
            this.allFilters[column.getColId()] = filterWrapper;
        }

        return filterWrapper;

    }

    public cachedFilter (column: Column):FilterWrapper{
        return this.allFilters[column.getColId()];
    }

    private createFilterInstance(column: Column, $scope:any): Promise<IFilterComp> {
        let defaultFilter:string = 'agTextColumnFilter';

        if (this.gridOptionsWrapper.isEnterprise()) {
            defaultFilter = 'agSetColumnFilter';
        }
        let sanitisedColDef:ColDef = _.cloneObject(column.getColDef());

        let event: FilterModifiedEvent = {
            type: Events.EVENT_FILTER_MODIFIED,
            api: this.gridApi,
            columnApi: this.columnApi
        };

        let filterChangedCallback = this.onFilterChanged.bind(this);
        let filterModifiedCallback = () => this.eventService.dispatchEvent(event);

        let params: IFilterParams = {
            column: column,
            colDef: sanitisedColDef,
            rowModel: this.rowModel,
            filterChangedCallback: filterChangedCallback,
            filterModifiedCallback: filterModifiedCallback,
            valueGetter: this.createValueGetter(column),
            context: this.gridOptionsWrapper.getContext(),
            doesRowPassOtherFilter: null,
            $scope: $scope
        };

        return this.componentResolver.createAgGridComponent<IFilterComp>(
            sanitisedColDef,
            params,
            'filter',
            {
                api: this.gridApi,
                columnApi: this.columnApi,
                column: column,
                colDef: sanitisedColDef
            },
            defaultFilter,
            true,
            (params, filter)=>_.assign(params, {
                doesRowPassOtherFilter: this.doesRowPassOtherFilters.bind(this, filter),
            })
        );
    }

    private createFilterWrapper(column: Column): FilterWrapper {
        let filterWrapper: FilterWrapper = {
            column: column,
            filterPromise: null,
            scope: <any> null,
            guiPromise: Promise.external<HTMLElement>()
        };

        filterWrapper.scope = this.gridOptionsWrapper.isAngularCompileFilters() ? this.$scope.$new() : null;

        filterWrapper.filterPromise = this.createFilterInstance(column, filterWrapper.scope);

        this.putIntoGui(filterWrapper);

        return filterWrapper;
    }

    private putIntoGui(filterWrapper: FilterWrapper): void {
        let eFilterGui = document.createElement('div');
        eFilterGui.className = 'ag-filter';
        filterWrapper.filterPromise.then(filter=>{
            let guiFromFilter = filter.getGui();

            if (_.missing(guiFromFilter)) {
                console.warn(`getGui method from filter returned ${guiFromFilter}, it should be a DOM element or an HTML template string.`);
            }

            // for backwards compatibility with Angular 1 - we
            // used to allow providing back HTML from getGui().
            // once we move away from supporting Angular 1
            // directly, we can change this.
            if (typeof guiFromFilter === 'string') {
                guiFromFilter = _.loadTemplate(<string>guiFromFilter);
            }

            eFilterGui.appendChild(guiFromFilter);

            if (filterWrapper.scope) {
                this.$compile(eFilterGui)(filterWrapper.scope);
                setTimeout( () => filterWrapper.scope.$apply(), 0);
            }

            filterWrapper.guiPromise.resolve(eFilterGui);
        });
    }

    private onNewColumnsLoaded(): void {
        this.destroy();
    }

    // destroys the filter, so it not longer takes part
    public destroyFilter(column: Column, source: ColumnEventType = "api"): void {
        let filterWrapper:FilterWrapper = this.allFilters[column.getColId()];
        if (filterWrapper) {
            this.disposeFilterWrapper(filterWrapper, source);
            this.onFilterChanged();
        }
    }

    private disposeFilterWrapper(filterWrapper: FilterWrapper, source: ColumnEventType): void {
        filterWrapper.filterPromise.then(filter=>{
            filter.setModel(null);
            if (filter.destroy) {
                filter.destroy();
            }
            filterWrapper.column.setFilterActive(false, source);
            if (filterWrapper.scope) {
                filterWrapper.scope.$destroy();
            }
            delete this.allFilters[filterWrapper.column.getColId()];
        })
    }

    @PreDestroy
    public destroy() {
        _.iterateObject(this.allFilters, (key: string, filterWrapper: any) => {
            this.disposeFilterWrapper(filterWrapper, "filterDestroyed");
        });
    }


}

export interface FilterWrapper {
    column: Column,
    filterPromise: Promise<IFilterComp>,
    scope: any,
    guiPromise: ExternalPromise<HTMLElement>
}
