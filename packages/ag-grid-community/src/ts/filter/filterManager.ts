import { ExternalPromise, Promise, _ } from "../utils";
import { GridOptionsWrapper } from "../gridOptionsWrapper";
import { PopupService } from "../widgets/popupService";
import { ValueService } from "../valueService/valueService";
import { ColumnController } from "../columnController/columnController";
import { ColumnApi } from "../columnController/columnApi";
import { RowNode } from "../entities/rowNode";
import { Column } from "../entities/column";
import { Autowired, Bean, Context, PostConstruct, PreDestroy } from "../context/context";
import { IRowModel } from "../interfaces/iRowModel";
import { EventService } from "../eventService";
import { ColumnEventType, Events, FilterChangedEvent, FilterModifiedEvent, FilterOpenedEvent } from "../events";
import { IDoesFilterPassParams, IFilterComp, IFilterParams } from "../interfaces/iFilter";
import { ColDef, GetQuickFilterTextParams } from "../entities/colDef";
import { GridApi } from "../gridApi";
import { UserComponentFactory } from "../components/framework/userComponentFactory";
import { GridCore } from "../gridCore";

export type FilterRequestSource = 'COLUMN_MENU' | 'TOOLBAR' | 'NO_UI';

@Bean('filterManager')
export class FilterManager {

    @Autowired('$compile') private $compile: any;
    @Autowired('$scope') private $scope: any;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('popupService') private popupService: PopupService;
    @Autowired('valueService') private valueService: ValueService;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('rowModel') private rowModel: IRowModel;
    @Autowired('eventService') private eventService: EventService;
    @Autowired('enterprise') private enterprise: boolean;
    @Autowired('context') private context: Context;
    @Autowired('columnApi') private columnApi: ColumnApi;
    @Autowired('gridApi') private gridApi: GridApi;
    @Autowired('userComponentFactory') private userComponentFactory: UserComponentFactory;

    public static QUICK_FILTER_SEPARATOR = '\n';

    private allFilters: {[p: string]: FilterWrapper} = {};
    private quickFilter: string = null;
    private quickFilterParts: string[] = null;

    private advancedFilterPresent: boolean;
    private externalFilterPresent: boolean;

    private gridCore: GridCore;

    // this is true when the grid is processing the filter change. this is used by the cell comps, so that they
    // don't flash when data changes due to filter changes. there is no need to flash when filter changes as the
    // user is in control, so doesn't make sense to show flashing changes. for example, go to main demo where
    // this feature is turned off (hack code to always return false for isSuppressFlashingCellsBecauseFiltering(), put in)
    // 100,000 rows and group by country. then do some filtering. all the cells flash, which is silly.
    private processingFilterChange = false;
    private allowShowChangeAfterFilter: boolean;

    public registerGridCore(gridCore: GridCore): void {
        this.gridCore = gridCore;
    }

    @PostConstruct
    public init(): void {
        this.eventService.addEventListener(Events.EVENT_ROW_DATA_CHANGED, this.onNewRowsLoaded.bind(this));
        this.eventService.addEventListener(Events.EVENT_NEW_COLUMNS_LOADED, this.onNewColumnsLoaded.bind(this));

        this.quickFilter = this.parseQuickFilter(this.gridOptionsWrapper.getQuickFilterText());
        this.setQuickFilterParts();

        this.allowShowChangeAfterFilter = this.gridOptionsWrapper.isAllowShowChangeAfterFilter();

        // check this here, in case there is a filter from the start
        this.checkExternalFilter();
    }

    private setQuickFilterParts(): void {
        if (this.quickFilter) {
             this.quickFilterParts = this.quickFilter.split(' ');
        } else {
            this.quickFilterParts = null;
        }
    }

    public setFilterModel(model: any) {
        const allPromises: Promise<IFilterComp> [] = [];
        if (model) {
            // mark the filters as we set them, so any active filters left over we stop
            const modelKeys = Object.keys(model);
            _.iterateObject(this.allFilters, (colId: string, filterWrapper: FilterWrapper) => {
                _.removeFromArray(modelKeys, colId);
                const newModel = model[colId];
                this.setModelOnFilterWrapper(filterWrapper.filterPromise, newModel);
                allPromises.push(filterWrapper.filterPromise);
            });
            // at this point, processedFields contains data for which we don't have a filter working yet
            _.iterateArray(modelKeys, (colId) => {
                const column = this.columnController.getPrimaryColumn(colId);
                if (!column) {
                    console.warn('Warning ag-grid setFilterModel - no column found for colId ' + colId);
                    return;
                }
                const filterWrapper = this.getOrCreateFilterWrapper(column, 'NO_UI');
                this.setModelOnFilterWrapper(filterWrapper.filterPromise, model[colId]);
                allPromises.push(filterWrapper.filterPromise);
            });
        } else {
            _.iterateObject(this.allFilters, (key, filterWrapper: FilterWrapper) => {
                this.setModelOnFilterWrapper(filterWrapper.filterPromise, null);
                allPromises.push(filterWrapper.filterPromise);
            });
        }
        Promise.all(allPromises).then(whatever => {
            this.onFilterChanged();
        });
    }

    private setModelOnFilterWrapper(filterPromise: Promise<IFilterComp>, newModel: any) {
        filterPromise.then(filter => {
            if (typeof filter.setModel !== 'function') {
                console.warn('Warning ag-grid - filter missing setModel method, which is needed for setFilterModel');
                return;
            }
            filter.setModel(newModel);
        });
    }

    public getFilterModel(): any {
        const result = {} as any;
        _.iterateObject(this.allFilters, function(key: any, filterWrapper: FilterWrapper) {
            // because user can provide filters, we provide useful error checking and messages
            const filterPromise: Promise<IFilterComp> = filterWrapper.filterPromise;
            const filter = filterPromise.resolveNow(null, filter => filter);
            if (filter == null) { return null; }

            if (typeof filter.getModel !== 'function') {
                console.warn('Warning ag-grid - filter API missing getModel method, which is needed for getFilterModel');
                return;
            }
            const model = filter.getModel();
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

    // called by:
    // 1) onFilterChanged()
    // 2) onNewRowsLoaded()
    private setAdvancedFilterPresent() {
        let atLeastOneActive = false;

        _.iterateObject(this.allFilters, function(key, filterWrapper: FilterWrapper) {
            if (filterWrapper.filterPromise.resolveNow(false, filter => filter.isFilterActive())) {
                atLeastOneActive = true;
            }
        });

        this.advancedFilterPresent = atLeastOneActive;
    }

    private updateFilterFlagInColumns(source: ColumnEventType, additionalEventAttributes?: any): void {
        _.iterateObject(this.allFilters, function(key, filterWrapper: FilterWrapper) {
            const filterActive = filterWrapper.filterPromise.resolveNow(false, filter => filter.isFilterActive());
            filterWrapper.column.setFilterActive(filterActive, source, additionalEventAttributes);
        });
    }

    // returns true if quickFilter or advancedFilter
    public isAnyFilterPresent(): boolean {
        return this.isQuickFilterPresent() || this.advancedFilterPresent || this.externalFilterPresent;
    }

    private doesFilterPass(node: RowNode, filterToSkip?: any) {
        const data = node.data;
        const colKeys = Object.keys(this.allFilters);
        for (let i = 0, l = colKeys.length; i < l; i++) { // critical code, don't use functional programming
            const colId = colKeys[i];
            const filterWrapper: FilterWrapper = this.allFilters[colId];

            // if no filter, always pass
            if (filterWrapper === undefined) {
                continue;
            }

            const filter: IFilterComp = filterWrapper.filterPromise.resolveNow(undefined, filter => filter);

            // if filter not yet there, continue
            if (filter === undefined) {
                continue;
            }

            if (filter === filterToSkip) {
                continue;
            }

            // don't bother with filters that are not active
            if (!filter.isFilterActive()) {
                continue;
            }

            if (!filter.doesFilterPass) { // because users can do custom filters, give nice error message
                console.error('Filter is missing method doesFilterPass');
            }
            const params: IDoesFilterPassParams = {
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

        if (!this.gridOptionsWrapper.isRowModelDefault()) {
            console.warn('ag-grid: quick filtering only works with the Client-side Row Model');
            return null;
        }

        return newFilter.toUpperCase();
    }

    // returns true if it has changed (not just same value again)
    public setQuickFilter(newFilter: any): void {
        const parsedFilter = this.parseQuickFilter(newFilter);
        if (this.quickFilter !== parsedFilter) {
            this.quickFilter = parsedFilter;
            this.setQuickFilterParts();
            this.onFilterChanged();
        }
    }

    private checkExternalFilter(): void {
        this.externalFilterPresent = this.gridOptionsWrapper.isExternalFilterPresent();
    }

    public onFilterChanged(additionalEventAttributes?: any): void {
        this.setAdvancedFilterPresent();
        this.updateFilterFlagInColumns("filterChanged", additionalEventAttributes);
        this.checkExternalFilter();

        _.iterateObject(this.allFilters, function(key, filterWrapper: FilterWrapper) {
            filterWrapper.filterPromise.then(filter => {
                if (filter.onAnyFilterChanged) {
                    filter.onAnyFilterChanged();
                }
            });
        });

        const filterChangedEvent: FilterChangedEvent = {
            type: Events.EVENT_FILTER_CHANGED,
            api: this.gridApi,
            columnApi: this.columnApi
        };
        if (additionalEventAttributes) {
            _.mergeDeep(filterChangedEvent, additionalEventAttributes);
        }

        // because internal events are not async in ag-grid, when the dispatchEvent
        // method comes back, we know all listeners have finished executing.
        this.processingFilterChange = true;

        this.eventService.dispatchEvent(filterChangedEvent);

        this.processingFilterChange = false;
    }

    public isSuppressFlashingCellsBecauseFiltering(): boolean {
        if (this.allowShowChangeAfterFilter) {
            // if user has elected to always flash cell changes, then return false always
            return false;
        } else {
            // otherwise we suppress flashing changes when filtering
            return this.processingFilterChange;
        }
    }

    public isQuickFilterPresent(): boolean {
        return this.quickFilter !== null;
    }

    public doesRowPassOtherFilters(filterToSkip: any, node: any): boolean {
        return this.doesRowPassFilter(node, filterToSkip);
    }

    private doesRowPassQuickFilterNoCache(node: RowNode, filterPart: string): boolean {
        const columns = this.columnController.getAllColumnsForQuickFilter();
        let filterPasses = false;
        columns.forEach(column => {
            if (filterPasses) { return; }
            const part = this.getQuickFilterTextForColumn(column, node);
            if (_.exists(part)) {
                if (part.indexOf(filterPart) >= 0) {
                    filterPasses = true;
                }
            }
        });
        return filterPasses;
    }

    private doesRowPassQuickFilterCache(node: any, filterPart: string): boolean {
        if (!node.quickFilterAggregateText) {
            this.aggregateRowForQuickFilter(node);
        }
        const filterPasses = node.quickFilterAggregateText.indexOf(filterPart) >= 0;
        return filterPasses;
    }

    private doesRowPassQuickFilter(node: any): boolean {

        let filterPasses = true;
        const usingCache = this.gridOptionsWrapper.isCacheQuickFilter();

        this.quickFilterParts.forEach(filterPart => {
            const partPasses = usingCache ?
                this.doesRowPassQuickFilterCache(node, filterPart) : this.doesRowPassQuickFilterNoCache(node, filterPart);

            // each part must pass, if any fails, then the whole filter fails
            if (!partPasses) {
                filterPasses = false;
            }
        });

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
        const value = this.valueService.getValue(column, rowNode, true);

        let valueAfterCallback: any;
        const colDef = column.getColDef();
        if (column.getColDef().getQuickFilterText) {
            const params: GetQuickFilterTextParams = {
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

        if (_.exists(valueAfterCallback)) {
            return valueAfterCallback.toString().toUpperCase();
        } else {
            return null;
        }
    }

    private aggregateRowForQuickFilter(node: RowNode) {
        const stringParts: string[] = [];
        const columns = this.columnController.getAllColumnsForQuickFilter();
        columns.forEach(column => {
            const part = this.getQuickFilterTextForColumn(column, node);
            if (_.exists(part)) {
                stringParts.push(part);
            }
        });
        node.quickFilterAggregateText = stringParts.join(FilterManager.QUICK_FILTER_SEPARATOR);
    }

    private onNewRowsLoaded(source: ColumnEventType) {
        _.iterateObject(this.allFilters, function(key, filterWrapper: FilterWrapper) {
            filterWrapper.filterPromise.then(filter => {
                if (filter.onNewRowsLoaded) {
                    filter.onNewRowsLoaded();
                }
            });
        });
        this.updateFilterFlagInColumns(source);
        this.setAdvancedFilterPresent();
    }

    private createValueGetter(column: Column) {
        return (node: RowNode) => {
            return this.valueService.getValue(column, node, true);
        };
    }

    public getFilterComponent(column: Column, source: FilterRequestSource): Promise<IFilterComp> {
        const filterWrapper = this.getOrCreateFilterWrapper(column, source);
        return filterWrapper.filterPromise;
    }

    public isFilterActive(column: Column): boolean {
        const filterWrapper: FilterWrapper = this.cachedFilter(column);
        if (filterWrapper) {
            return filterWrapper.filterPromise.resolveNow(false, filter => filter.isFilterActive());
        } else {
            return false;
        }
    }

    public getOrCreateFilterWrapper(column: Column, source: FilterRequestSource): FilterWrapper {
        let filterWrapper: FilterWrapper = this.cachedFilter(column);

        if (!filterWrapper) {
            filterWrapper = this.createFilterWrapper(column, source);
            this.allFilters[column.getColId()] = filterWrapper;
        } else {
            if (source !== 'NO_UI') {
                this.putIntoGui(filterWrapper, source);
            }
        }

        return filterWrapper;
    }

    public cachedFilter(column: Column): FilterWrapper {
        return this.allFilters[column.getColId()];
    }

    private createFilterInstance(column: Column, $scope: any): Promise<IFilterComp> {
        let defaultFilter: string = 'agTextColumnFilter';

        if (this.gridOptionsWrapper.isEnterprise()) {
            defaultFilter = 'agSetColumnFilter';
        }

        const event: FilterModifiedEvent = {
            type: Events.EVENT_FILTER_MODIFIED,
            api: this.gridApi,
            columnApi: this.columnApi
        };

        const sanitisedColDef: ColDef = _.cloneObject(column.getColDef());

        const params = this.createFilterParams(column, sanitisedColDef, $scope);
        params.filterChangedCallback = this.onFilterChanged.bind(this);
        params.filterModifiedCallback = () => this.eventService.dispatchEvent(event);

        // we modify params in a callback as we need the filter instance, and this isn't available
        // when creating the params above
        const modifyParamsCallback = (params: any, filter: IFilterComp) => _.assign(params, {
            doesRowPassOtherFilter: this.doesRowPassOtherFilters.bind(this, filter),
        });

        return this.userComponentFactory.newFilterComponent(sanitisedColDef, params, defaultFilter, modifyParamsCallback);
    }

    public createFilterParams(column: Column, colDef: ColDef, $scope: any = null): IFilterParams {
        const params: IFilterParams = {
            api: this.gridOptionsWrapper.getApi(),
            column: column,
            colDef: colDef,
            rowModel: this.rowModel,
            filterChangedCallback: null,
            filterModifiedCallback: null,
            valueGetter: this.createValueGetter(column),
            context: this.gridOptionsWrapper.getContext(),
            doesRowPassOtherFilter: null
        };

        // hack in scope if using AngularJS
        if ($scope) {
            (params as any).$scope = $scope;
        }

        return params;
    }

    private createFilterWrapper(column: Column, source: FilterRequestSource): FilterWrapper {
        const filterWrapper: FilterWrapper = {
            column: column,
            filterPromise: null,
            scope: null as any,
            compiledElement: null,
            guiPromise: Promise.external<HTMLElement>()
        };

        filterWrapper.scope = this.gridOptionsWrapper.isAngularCompileFilters() ? this.$scope.$new() : null;

        filterWrapper.filterPromise = this.createFilterInstance(column, filterWrapper.scope);

        this.putIntoGui(filterWrapper, source);

        return filterWrapper;
    }

    private putIntoGui(filterWrapper: FilterWrapper, source: FilterRequestSource): void {
        const eFilterGui = document.createElement('div');
        eFilterGui.className = 'ag-filter';
        filterWrapper.filterPromise.then(filter => {
            let guiFromFilter = filter.getGui();

            if (_.missing(guiFromFilter)) {
                console.warn(`getGui method from filter returned ${guiFromFilter}, it should be a DOM element or an HTML template string.`);
            }

            // for backwards compatibility with Angular 1 - we
            // used to allow providing back HTML from getGui().
            // once we move away from supporting Angular 1
            // directly, we can change this.
            if (typeof guiFromFilter === 'string') {
                guiFromFilter = _.loadTemplate(guiFromFilter as string);
            }

            eFilterGui.appendChild(guiFromFilter);

            if (filterWrapper.scope) {
                const compiledElement = this.$compile(eFilterGui)(filterWrapper.scope);
                filterWrapper.compiledElement = compiledElement;
                window.setTimeout(() => filterWrapper.scope.$apply(), 0);
            }

            filterWrapper.guiPromise.resolve(eFilterGui);

            this.eventService.dispatchEvent({
                type: Events.EVENT_FILTER_OPENED,
                column: filterWrapper.column,
                source: source,
                eGui: eFilterGui,
                api: this.gridApi,
                columnApi: this.columnApi
            } as FilterOpenedEvent);

        });
    }

    private onNewColumnsLoaded(): void {
        let atLeastOneFilterGone = false;
        _.iterateObject(this.allFilters, (key: string, filterWrapper: FilterWrapper) => {
            const oldColumn = !this.columnController.getPrimaryColumn(filterWrapper.column);
            if (oldColumn) {
                atLeastOneFilterGone = true;
                this.disposeFilterWrapper(filterWrapper, "filterDestroyed");
            }
        });

        if (atLeastOneFilterGone) {
            this.onFilterChanged();
        }
    }

    // destroys the filter, so it not longer takes part
    public destroyFilter(column: Column, source: ColumnEventType = "api"): void {
        const filterWrapper: FilterWrapper = this.allFilters[column.getColId()];
        if (filterWrapper) {
            this.disposeFilterWrapper(filterWrapper, source);
            this.onFilterChanged();
        }
    }

    private disposeFilterWrapper(filterWrapper: FilterWrapper, source: ColumnEventType): void {
        filterWrapper.filterPromise.then(filter => {
            filter.setModel(null);
            if (filter.destroy) {
                filter.destroy();
            }
            filterWrapper.column.setFilterActive(false, source);
            if (filterWrapper.scope) {
                if (filterWrapper.compiledElement) {
                    filterWrapper.compiledElement.remove();
                }
                filterWrapper.scope.$destroy();
            }
            delete this.allFilters[filterWrapper.column.getColId()];
        });
    }

    @PreDestroy
    public destroy() {
        _.iterateObject(this.allFilters, (key: string, filterWrapper: any) => {
            this.disposeFilterWrapper(filterWrapper, "filterDestroyed");
        });
    }

}

export interface FilterWrapper {
    compiledElement: any;
    column: Column;
    filterPromise: Promise<IFilterComp>;
    scope: any;
    guiPromise: ExternalPromise<HTMLElement>;
}
