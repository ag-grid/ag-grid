import { _, ExternalPromise, Promise } from '../utils';
import { GridOptionsWrapper } from '../gridOptionsWrapper';
import { ValueService } from '../valueService/valueService';
import { ColumnController } from '../columnController/columnController';
import { ColumnApi } from '../columnController/columnApi';
import { RowNode } from '../entities/rowNode';
import { Column } from '../entities/column';
import { Autowired, Bean, PostConstruct, PreDestroy } from '../context/context';
import { IRowModel } from '../interfaces/iRowModel';
import { EventService } from '../eventService';
import { ColumnEventType, Events, FilterChangedEvent, FilterModifiedEvent, FilterOpenedEvent } from '../events';
import { IFilterComp, IFilterParams } from '../interfaces/iFilter';
import { ColDef, GetQuickFilterTextParams } from '../entities/colDef';
import { GridApi } from '../gridApi';
import { UserComponentFactory } from '../components/framework/userComponentFactory';
import { ModuleNames } from '../modules/moduleNames';
import { ModuleRegistry } from '../modules/moduleRegistry';
import { forEach } from '../utils/array';

export type FilterRequestSource = 'COLUMN_MENU' | 'TOOLBAR' | 'NO_UI';

@Bean('filterManager')
export class FilterManager {
    @Autowired('$compile') private $compile: any;
    @Autowired('$scope') private $scope: any;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('valueService') private valueService: ValueService;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('rowModel') private rowModel: IRowModel;
    @Autowired('eventService') private eventService: EventService;
    @Autowired('columnApi') private columnApi: ColumnApi;
    @Autowired('gridApi') private gridApi: GridApi;
    @Autowired('userComponentFactory') private userComponentFactory: UserComponentFactory;

    public static QUICK_FILTER_SEPARATOR = '\n';

    private allFilters = new Map<string, FilterWrapper>();
    private quickFilter: string = null;
    private quickFilterParts: string[] = null;

    private advancedFilterPresent: boolean;
    private externalFilterPresent: boolean;

    // this is true when the grid is processing the filter change. this is used by the cell comps, so that they
    // don't flash when data changes due to filter changes. there is no need to flash when filter changes as the
    // user is in control, so doesn't make sense to show flashing changes. for example, go to main demo where
    // this feature is turned off (hack code to always return false for isSuppressFlashingCellsBecauseFiltering(), put in)
    // 100,000 rows and group by country. then do some filtering. all the cells flash, which is silly.
    private processingFilterChange = false;
    private allowShowChangeAfterFilter: boolean;

    private eventListenerDestroyers: (() => void)[] = [];

    @PostConstruct
    public init(): void {
        this.eventListenerDestroyers = [
            this.eventService.addEventListener(Events.EVENT_ROW_DATA_CHANGED, this.onNewRowsLoaded.bind(this)),
            this.eventService.addEventListener(Events.EVENT_NEW_COLUMNS_LOADED, this.onNewColumnsLoaded.bind(this))
        ];

        this.quickFilter = this.parseQuickFilter(this.gridOptionsWrapper.getQuickFilterText());
        this.setQuickFilterParts();

        this.allowShowChangeAfterFilter = this.gridOptionsWrapper.isAllowShowChangeAfterFilter();

        // check this here, in case there is a filter from the start
        this.checkExternalFilter();
    }

    private setQuickFilterParts(): void {
        this.quickFilterParts = this.quickFilter ? this.quickFilter.split(' ') : null;
    }

    public setFilterModel(model: { [key: string]: any; }): void {
        const allPromises: Promise<IFilterComp>[] = [];

        if (model) {
            // mark the filters as we set them, so any active filters left over we stop
            const modelKeys = _.convertToSet(Object.keys(model));

            this.allFilters.forEach((filterWrapper, colId) => {
                const newModel = model[colId];

                this.setModelOnFilterWrapper(filterWrapper.filterPromise, newModel);

                allPromises.push(filterWrapper.filterPromise);
                modelKeys.delete(colId);
            });

            // at this point, processedFields contains data for which we don't have a filter working yet
            modelKeys.forEach(colId => {
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
            this.allFilters.forEach(filterWrapper => {
                this.setModelOnFilterWrapper(filterWrapper.filterPromise, null);
                allPromises.push(filterWrapper.filterPromise);
            });
        }

        Promise.all(allPromises).then(_ => this.onFilterChanged());
    }

    private setModelOnFilterWrapper(filterPromise: Promise<IFilterComp>, newModel: any): void {
        filterPromise.then(filter => {
            if (typeof filter.setModel !== 'function') {
                console.warn('Warning ag-grid - filter missing setModel method, which is needed for setFilterModel');
                return;
            }

            filter.setModel(newModel);
        });
    }

    public getFilterModel(): { [key: string]: any; } {
        const result: { [key: string]: any; } = {};

        this.allFilters.forEach((filterWrapper, key) => {
            // because user can provide filters, we provide useful error checking and messages
            const filterPromise = filterWrapper.filterPromise;
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
    public isAdvancedFilterPresent(): boolean {
        return this.advancedFilterPresent;
    }

    // called by:
    // 1) onFilterChanged()
    // 2) onNewRowsLoaded()
    private setAdvancedFilterPresent(): void {
        let atLeastOneActive = false;

        this.allFilters.forEach(filterWrapper => {
            if (atLeastOneActive) { return; } // no need to check any more

            if (filterWrapper.filterPromise.resolveNow(false, filter => filter.isFilterActive())) {
                atLeastOneActive = true;
            }
        });

        this.advancedFilterPresent = atLeastOneActive;
    }

    private updateFilterFlagInColumns(source: ColumnEventType, additionalEventAttributes?: any): void {
        this.allFilters.forEach(filterWrapper => {
            const isFilterActive = filterWrapper.filterPromise.resolveNow(false, filter => filter.isFilterActive());

            filterWrapper.column.setFilterActive(isFilterActive, source, additionalEventAttributes);
        });
    }

    // returns true if quickFilter or advancedFilter
    public isAnyFilterPresent(): boolean {
        return this.isQuickFilterPresent() || this.advancedFilterPresent || this.externalFilterPresent;
    }

    private doesFilterPass(node: RowNode, filterToSkip?: any): boolean {
        const { data } = node;
        const allFilters = _.values(this.allFilters);

        return _.every(allFilters, filterWrapper => {
            // if no filter, always pass
            if (filterWrapper == null) {
                return true;
            }

            const filter = filterWrapper.filterPromise.resolveNow(undefined, filter => filter);

            if (filter == null || filter === filterToSkip || !filter.isFilterActive()) {
                return true;
            }

            if (!filter.doesFilterPass) { // because users can do custom filters, give nice error message
                throw new Error('Filter is missing method doesFilterPass');
            }

            return filter.doesFilterPass({ node, data });
        });
    }

    private parseQuickFilter(newFilter: string): string {
        if (!_.exists(newFilter)) {
            return null;
        }

        if (!this.gridOptionsWrapper.isRowModelDefault()) {
            console.warn('ag-grid: quick filtering only works with the Client-side Row Model');
            return null;
        }

        return newFilter.toUpperCase();
    }

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
        this.updateFilterFlagInColumns('filterChanged', additionalEventAttributes);
        this.checkExternalFilter();

        this.allFilters.forEach(filterWrapper => {
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
        // if user has elected to always flash cell changes, then always return false, otherwise we suppress flashing
        // changes when filtering
        return !this.allowShowChangeAfterFilter && this.processingFilterChange;
    }

    public isQuickFilterPresent(): boolean {
        return this.quickFilter !== null;
    }

    public doesRowPassOtherFilters(filterToSkip: any, node: any): boolean {
        return this.doesRowPassFilter(node, filterToSkip);
    }

    private doesRowPassQuickFilterNoCache(node: RowNode, filterPart: string): boolean {
        const columns = this.columnController.getAllColumnsForQuickFilter();

        return _.some(columns, column => {
            const part = this.getQuickFilterTextForColumn(column, node);

            return _.exists(part) && part.indexOf(filterPart) >= 0;
        });
    }

    private doesRowPassQuickFilterCache(node: RowNode, filterPart: string): boolean {
        if (!node.quickFilterAggregateText) {
            this.aggregateRowForQuickFilter(node);
        }

        return node.quickFilterAggregateText.indexOf(filterPart) >= 0;
    }

    private doesRowPassQuickFilter(node: RowNode): boolean {
        const usingCache = this.gridOptionsWrapper.isCacheQuickFilter();

        // each part must pass, if any fails, then the whole filter fails
        return _.every(this.quickFilterParts, part =>
            usingCache ? this.doesRowPassQuickFilterCache(node, part) : this.doesRowPassQuickFilterNoCache(node, part)
        );
    }

    public doesRowPassFilter(node: any, filterToSkip?: any): boolean {
        // the row must pass ALL of the filters, so if any of them fail,
        // we return true. that means if a row passes the quick filter,
        // but fails the column filter, it fails overall

        // first up, check quick filter
        if (this.isQuickFilterPresent() && !this.doesRowPassQuickFilter(node)) {
            return false;
        }

        // secondly, give the client a chance to reject this row
        if (this.externalFilterPresent && !this.gridOptionsWrapper.doesExternalFilterPass(node)) {
            return false;
        }

        // lastly, check our internal advanced filter
        if (this.advancedFilterPresent && !this.doesFilterPass(node, filterToSkip)) {
            return false;
        }

        // got this far, all filters pass
        return true;
    }

    private getQuickFilterTextForColumn(column: Column, node: RowNode): string {
        let value = this.valueService.getValue(column, node, true);
        const colDef = column.getColDef();

        if (colDef.getQuickFilterText) {
            const params: GetQuickFilterTextParams = {
                value,
                node,
                data: node.data,
                column,
                colDef,
                context: this.gridOptionsWrapper.getContext()
            };

            value = colDef.getQuickFilterText(params);
        }

        return _.exists(value) ? value.toString().toUpperCase() : null;
    }

    private aggregateRowForQuickFilter(node: RowNode): void {
        const stringParts: string[] = [];
        const columns = this.columnController.getAllColumnsForQuickFilter();

        forEach(columns, column => {
            const part = this.getQuickFilterTextForColumn(column, node);

            if (_.exists(part)) {
                stringParts.push(part);
            }
        });

        node.quickFilterAggregateText = stringParts.join(FilterManager.QUICK_FILTER_SEPARATOR);
    }

    private onNewRowsLoaded(source: ColumnEventType): void {
        this.allFilters.forEach(filterWrapper => {
            filterWrapper.filterPromise.then(filter => {
                if (filter.onNewRowsLoaded) {
                    filter.onNewRowsLoaded();
                }
            });
        });

        this.updateFilterFlagInColumns(source);
        this.setAdvancedFilterPresent();
    }

    private createValueGetter(column: Column): (node: RowNode) => any {
        return node => this.valueService.getValue(column, node, true);
    }

    public getFilterComponent(column: Column, source: FilterRequestSource): Promise<IFilterComp> {
        return this.getOrCreateFilterWrapper(column, source).filterPromise;
    }

    public isFilterActive(column: Column): boolean {
        const filterWrapper = this.cachedFilter(column);

        return filterWrapper && filterWrapper.filterPromise.resolveNow(false, filter => filter.isFilterActive());
    }

    public getOrCreateFilterWrapper(column: Column, source: FilterRequestSource): FilterWrapper {
        let filterWrapper = this.cachedFilter(column);

        if (!filterWrapper) {
            filterWrapper = this.createFilterWrapper(column, source);
            this.allFilters.set(column.getColId(), filterWrapper);
        } else if (source !== 'NO_UI') {
            this.putIntoGui(filterWrapper, source);
        }

        return filterWrapper;
    }

    public cachedFilter(column: Column): FilterWrapper {
        return this.allFilters.get(column.getColId());
    }

    private createFilterInstance(column: Column, $scope: any): Promise<IFilterComp> {
        const defaultFilter =
            ModuleRegistry.isRegistered(ModuleNames.SetFilterModule) ? 'agSetColumnFilter' : 'agTextColumnFilter';

        const sanitisedColDef = _.cloneObject(column.getColDef());

        let filterInstance: IFilterComp;

        const params = this.createFilterParams(column, sanitisedColDef, $scope);

        params.filterChangedCallback = this.onFilterChanged.bind(this);
        params.filterModifiedCallback = () => {
            const event: FilterModifiedEvent = {
                type: Events.EVENT_FILTER_MODIFIED,
                api: this.gridApi,
                columnApi: this.columnApi,
                column,
                filterInstance
            };

            this.eventService.dispatchEvent(event);
        };

        // we modify params in a callback as we need the filter instance, and this isn't available
        // when creating the params above
        const modifyParamsCallback = (params: any, filterInstance: IFilterComp) => _.assign(params, {
            doesRowPassOtherFilter: this.doesRowPassOtherFilters.bind(this, filterInstance),
        });

        const res = this.userComponentFactory.newFilterComponent(sanitisedColDef, params, defaultFilter, modifyParamsCallback);

        if (res) {
            res.then(r => filterInstance = r);
        }

        return res;
    }

    public createFilterParams(column: Column, colDef: ColDef, $scope: any = null): IFilterParams {
        const params: IFilterParams = {
            api: this.gridOptionsWrapper.getApi(),
            column,
            colDef,
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

        if (filterWrapper.filterPromise) {
            this.putIntoGui(filterWrapper, source);
        }

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
                source,
                eGui: eFilterGui,
                api: this.gridApi,
                columnApi: this.columnApi
            } as FilterOpenedEvent);
        });
    }

    private onNewColumnsLoaded(): void {
        let atLeastOneFilterGone = false;

        this.allFilters.forEach(filterWrapper => {
            const oldColumn = !this.columnController.getPrimaryColumn(filterWrapper.column);

            if (oldColumn) {
                atLeastOneFilterGone = true;
                this.disposeFilterWrapper(filterWrapper, 'filterDestroyed');
            }
        });

        if (atLeastOneFilterGone) {
            this.onFilterChanged();
        }
    }

    // destroys the filter, so it not longer takes part
    public destroyFilter(column: Column, source: ColumnEventType = 'api'): void {
        const filterWrapper = this.allFilters.get(column.getColId());

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

            this.allFilters.delete(filterWrapper.column.getColId());
        });
    }

    @PreDestroy
    public destroy() {
        this.allFilters.forEach(filterWrapper => this.disposeFilterWrapper(filterWrapper, 'filterDestroyed'));

        if (this.eventListenerDestroyers.length) {
            this.eventListenerDestroyers.forEach(func => func());
            this.eventListenerDestroyers.length = 0;
        }
    }
}

export interface FilterWrapper {
    compiledElement: any;
    column: Column;
    filterPromise: Promise<IFilterComp>;
    scope: any;
    guiPromise: ExternalPromise<HTMLElement>;
}
