import { AgPromise } from '../utils';
import { ValueService } from '../valueService/valueService';
import { ColumnModel } from '../columns/columnModel';
import { ColumnApi } from '../columns/columnApi';
import { RowNode } from '../entities/rowNode';
import { Column } from '../entities/column';
import { Autowired, Bean, PostConstruct, PreDestroy } from '../context/context';
import { IRowModel } from '../interfaces/iRowModel';
import { ColumnEventType, Events, FilterChangedEvent, FilterModifiedEvent, FilterOpenedEvent } from '../events';
import { IFilterComp, IFilterParams } from '../interfaces/iFilter';
import { ColDef, GetQuickFilterTextParams } from '../entities/colDef';
import { GridApi } from '../gridApi';
import { UserComponentFactory } from '../components/framework/userComponentFactory';
import { ModuleNames } from '../modules/moduleNames';
import { ModuleRegistry } from '../modules/moduleRegistry';
import { forEach, some, every } from '../utils/array';
import { BeanStub } from '../context/beanStub';
import { convertToSet } from '../utils/set';
import { exists } from '../utils/generic';
import { mergeDeep, cloneObject } from '../utils/object';
import { loadTemplate } from '../utils/dom';

export type FilterRequestSource = 'COLUMN_MENU' | 'TOOLBAR' | 'NO_UI';

@Bean('filterManager')
export class FilterManager extends BeanStub {

    @Autowired('$compile') private $compile: any;
    @Autowired('$scope') private $scope: any;
    @Autowired('valueService') private valueService: ValueService;
    @Autowired('columnModel') private columnModel: ColumnModel;
    @Autowired('rowModel') private rowModel: IRowModel;
    @Autowired('columnApi') private columnApi: ColumnApi;
    @Autowired('gridApi') private gridApi: GridApi;
    @Autowired('userComponentFactory') private userComponentFactory: UserComponentFactory;

    public static QUICK_FILTER_SEPARATOR = '\n';

    private allAdvancedFilters = new Map<string, FilterWrapper>();
    private activeAdvancedFilters: IFilterComp[] = [];
    private quickFilter: string | null = null;
    private quickFilterParts: string[] | null = null;

    // this is true when the grid is processing the filter change. this is used by the cell comps, so that they
    // don't flash when data changes due to filter changes. there is no need to flash when filter changes as the
    // user is in control, so doesn't make sense to show flashing changes. for example, go to main demo where
    // this feature is turned off (hack code to always return false for isSuppressFlashingCellsBecauseFiltering(), put in)
    // 100,000 rows and group by country. then do some filtering. all the cells flash, which is silly.
    private processingFilterChange = false;
    private allowShowChangeAfterFilter: boolean;

    @PostConstruct
    public init(): void {
        this.addManagedListener(this.eventService, Events.EVENT_ROW_DATA_CHANGED, this.onNewRowsLoaded.bind(this));
        this.addManagedListener(this.eventService, Events.EVENT_NEW_COLUMNS_LOADED, this.onNewColumnsLoaded.bind(this));

        this.quickFilter = this.parseQuickFilter(this.gridOptionsWrapper.getQuickFilterText());
        this.setQuickFilterParts();

        this.allowShowChangeAfterFilter = this.gridOptionsWrapper.isAllowShowChangeAfterFilter();
    }

    private setQuickFilterParts(): void {
        this.quickFilterParts = this.quickFilter ? this.quickFilter.split(' ') : null;
    }

    public setFilterModel(model: { [key: string]: any; }): void {
        const allPromises: AgPromise<void>[] = [];

        if (model) {
            // mark the filters as we set them, so any active filters left over we stop
            const modelKeys = convertToSet(Object.keys(model));

            this.allAdvancedFilters.forEach((filterWrapper, colId) => {
                const newModel = model[colId];

                allPromises.push(this.setModelOnFilterWrapper(filterWrapper.filterPromise!, newModel));
                modelKeys.delete(colId);
            });

            // at this point, processedFields contains data for which we don't have a filter working yet
            modelKeys.forEach(colId => {
                const column = this.columnModel.getPrimaryColumn(colId);

                if (!column) {
                    console.warn('Warning ag-grid setFilterModel - no column found for colId ' + colId);
                    return;
                }

                const filterWrapper = this.getOrCreateFilterWrapper(column, 'NO_UI');

                allPromises.push(this.setModelOnFilterWrapper(filterWrapper.filterPromise!, model[colId]));
            });
        } else {
            this.allAdvancedFilters.forEach(filterWrapper => {
                allPromises.push(this.setModelOnFilterWrapper(filterWrapper.filterPromise!, null));
            });
        }

        AgPromise.all(allPromises).then(() => this.onFilterChanged());
    }

    private setModelOnFilterWrapper(filterPromise: AgPromise<IFilterComp>, newModel: any): AgPromise<void> {
        return new AgPromise<void>(resolve => {
            filterPromise.then(filter => {
                if (typeof filter!.setModel !== 'function') {
                    console.warn('Warning ag-grid - filter missing setModel method, which is needed for setFilterModel');
                    resolve();
                }

                (filter!.setModel(newModel) || AgPromise.resolve()).then(() => resolve());
            });
        });
    }

    public getFilterModel(): { [key: string]: any; } {
        const result: { [key: string]: any; } = {};

        this.allAdvancedFilters.forEach((filterWrapper, key) => {
            // because user can provide filters, we provide useful error checking and messages
            const filterPromise = filterWrapper.filterPromise;
            const filter = filterPromise!.resolveNow(null, promiseFilter => promiseFilter);

            if (filter == null) { return null; }

            if (typeof filter.getModel !== 'function') {
                console.warn('Warning ag-grid - filter API missing getModel method, which is needed for getFilterModel');
                return;
            }

            const model = filter.getModel();

            if (exists(model)) {
                result[key] = model;
            }
        });

        return result;
    }

    // returns true if any advanced filter (ie not quick filter) active
    public isAdvancedFilterPresent(): boolean {
        return this.activeAdvancedFilters.length > 0;
    }

    // called by:
    // 1) onFilterChanged()
    // 2) onNewRowsLoaded()
    private updateActiveFilters(): void {
        this.activeAdvancedFilters.length = 0;

        this.allAdvancedFilters.forEach(filterWrapper => {
            if (filterWrapper.filterPromise!.resolveNow(false, filter => filter!.isFilterActive())) {
                const resolvedPromise = filterWrapper.filterPromise!.resolveNow(null, filter => filter);
                this.activeAdvancedFilters.push(resolvedPromise!);
            }
        });
    }

    private updateFilterFlagInColumns(source: ColumnEventType, additionalEventAttributes?: any): void {
        this.allAdvancedFilters.forEach(filterWrapper => {
            const isFilterActive = filterWrapper.filterPromise!.resolveNow(false, filter => filter!.isFilterActive());

            filterWrapper.column.setFilterActive(isFilterActive, source, additionalEventAttributes);
        });
    }

    public isAnyFilterPresent(): boolean {
        return this.isQuickFilterPresent() || this.isAdvancedFilterPresent() || this.gridOptionsWrapper.isExternalFilterPresent();
    }

    private doAdvancedFiltersPass(node: RowNode, filterToSkip?: IFilterComp): boolean {
        const { data } = node;

        for (let i = 0; i < this.activeAdvancedFilters.length; i++) {
            const filter = this.activeAdvancedFilters[i];

            if (filter == null || filter === filterToSkip) { continue; }

            if (typeof filter.doesFilterPass !== 'function') {
                // because users can do custom filters, give nice error message
                throw new Error('Filter is missing method doesFilterPass');
            }

            if (!filter.doesFilterPass({ node, data })) {
                return false;
            }
        }

        return true;
    }

    private parseQuickFilter(newFilter?: string): string | null {
        if (!exists(newFilter)) {
            return null;
        }

        if (!this.gridOptionsWrapper.isRowModelDefault()) {
            console.warn('ag-grid: quick filtering only works with the Client-Side Row Model');
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

    public onFilterChanged(filterInstance?: IFilterComp, additionalEventAttributes?: any): void {
        this.updateActiveFilters();
        this.updateFilterFlagInColumns('filterChanged', additionalEventAttributes);

        this.allAdvancedFilters.forEach(filterWrapper => {
            filterWrapper.filterPromise!.then(filter => {
                if (filter !== filterInstance && filter!.onAnyFilterChanged) {
                    filter!.onAnyFilterChanged();
                }
            });
        });

        const filterChangedEvent: FilterChangedEvent = {
            type: Events.EVENT_FILTER_CHANGED,
            api: this.gridApi,
            columnApi: this.columnApi
        };

        if (additionalEventAttributes) {
            mergeDeep(filterChangedEvent, additionalEventAttributes);
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

    public doesRowPassOtherFilters(filterToSkip: IFilterComp, node: any): boolean {
        return this.doesRowPassFilter({ rowNode: node, filterInstanceToSkip: filterToSkip });
    }

    private doesRowPassQuickFilterNoCache(node: RowNode, filterPart: string): boolean {
        const columns = this.columnModel.getAllColumnsForQuickFilter();

        return some(columns, column => {
            const part = this.getQuickFilterTextForColumn(column, node);

            return exists(part) && part.indexOf(filterPart) >= 0;
        });
    }

    private doesRowPassQuickFilterCache(node: RowNode, filterPart: string): boolean {
        if (!node.quickFilterAggregateText) {
            this.aggregateRowForQuickFilter(node);
        }

        return node.quickFilterAggregateText!.indexOf(filterPart) >= 0;
    }

    private doesRowPassQuickFilter(node: RowNode): boolean {
        const usingCache = this.gridOptionsWrapper.isCacheQuickFilter();

        // each part must pass, if any fails, then the whole filter fails
        return every(this.quickFilterParts!, part =>
            usingCache ? this.doesRowPassQuickFilterCache(node, part) : this.doesRowPassQuickFilterNoCache(node, part)
        );
    }

    public doesRowPassFilter(params: {
        rowNode: RowNode,
        filterInstanceToSkip?: IFilterComp;
    }): boolean {
        // the row must pass ALL of the filters, so if any of them fail,
        // we return true. that means if a row passes the quick filter,
        // but fails the column filter, it fails overall

        // first up, check quick filter
        if (this.isQuickFilterPresent() && !this.doesRowPassQuickFilter(params.rowNode)) {
            return false;
        }

        // secondly, give the client a chance to reject this row
        if (this.gridOptionsWrapper.isExternalFilterPresent() && !this.gridOptionsWrapper.doesExternalFilterPass(params.rowNode)) {
            return false;
        }

        // lastly, check our internal advanced filter
        if (this.isAdvancedFilterPresent() && !this.doAdvancedFiltersPass(params.rowNode, params.filterInstanceToSkip)) {
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

        return exists(value) ? value.toString().toUpperCase() : null;
    }

    private aggregateRowForQuickFilter(node: RowNode): void {
        const stringParts: string[] = [];
        const columns = this.columnModel.getAllColumnsForQuickFilter();

        forEach(columns, column => {
            const part = this.getQuickFilterTextForColumn(column, node);

            if (exists(part)) {
                stringParts.push(part);
            }
        });

        node.quickFilterAggregateText = stringParts.join(FilterManager.QUICK_FILTER_SEPARATOR);
    }

    private onNewRowsLoaded(source: ColumnEventType): void {
        this.allAdvancedFilters.forEach(filterWrapper => {
            filterWrapper.filterPromise!.then(filter => {
                if (filter!.onNewRowsLoaded) {
                    filter!.onNewRowsLoaded();
                }
            });
        });

        this.updateFilterFlagInColumns(source);
        this.updateActiveFilters();
    }

    private createValueGetter(column: Column): (node: RowNode) => any {
        return node => this.valueService.getValue(column, node, true);
    }

    public getFilterComponent(column: Column, source: FilterRequestSource, createIfDoesNotExist = true): AgPromise<IFilterComp> | null {
        if (createIfDoesNotExist) {
            return this.getOrCreateFilterWrapper(column, source).filterPromise;
        }

        const filterWrapper = this.cachedFilter(column);

        return filterWrapper ? filterWrapper.filterPromise : null;
    }

    public isFilterActive(column: Column): boolean {
        const filterWrapper = this.cachedFilter(column);

        return !!filterWrapper && filterWrapper.filterPromise!.resolveNow(false, filter => filter!.isFilterActive());
    }

    public getOrCreateFilterWrapper(column: Column, source: FilterRequestSource): FilterWrapper {
        let filterWrapper = this.cachedFilter(column);

        if (!filterWrapper) {
            filterWrapper = this.createFilterWrapper(column, source);
            this.allAdvancedFilters.set(column.getColId(), filterWrapper);
        } else if (source !== 'NO_UI') {
            this.putIntoGui(filterWrapper, source);
        }

        return filterWrapper;
    }

    public cachedFilter(column: Column): FilterWrapper | undefined {
        return this.allAdvancedFilters.get(column.getColId());
    }

    private createFilterInstance(column: Column, $scope: any): AgPromise<IFilterComp> | null {
        const defaultFilter =
            ModuleRegistry.isRegistered(ModuleNames.SetFilterModule) ? 'agSetColumnFilter' : 'agTextColumnFilter';

        const colDef = column.getColDef();

        let filterInstance: IFilterComp;

        const params: IFilterParams = {
            ...this.createFilterParams(column, colDef, $scope),
            filterModifiedCallback: () => {
                const event: FilterModifiedEvent = {
                    type: Events.EVENT_FILTER_MODIFIED,
                    api: this.gridApi,
                    columnApi: this.columnApi,
                    column,
                    filterInstance
                };

                this.eventService.dispatchEvent(event);
            },
            filterChangedCallback: (additionalEventAttributes?: any) =>
                this.onFilterChanged(filterInstance, additionalEventAttributes),
            doesRowPassOtherFilter: node => this.doesRowPassOtherFilters(filterInstance, node),
        };

        const res = this.userComponentFactory.newFilterComponent(colDef, params, defaultFilter);

        if (res) {
            res.then(r => filterInstance = r!);
        }

        return res;
    }

    public createFilterParams(column: Column, colDef: ColDef, $scope: any = null): IFilterParams {
        const params: IFilterParams = {
            api: this.gridOptionsWrapper.getApi()!,
            columnApi: this.gridOptionsWrapper.getColumnApi()!,
            column,
            colDef: cloneObject(colDef),
            rowModel: this.rowModel,
            filterChangedCallback: () => { },
            filterModifiedCallback: () => { },
            valueGetter: this.createValueGetter(column),
            context: this.gridOptionsWrapper.getContext(),
            doesRowPassOtherFilter: () => true,
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
            guiPromise: AgPromise.resolve(null)
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

        filterWrapper.guiPromise = new AgPromise<HTMLElement>(resolve => {
            filterWrapper.filterPromise!.then(filter => {
                let guiFromFilter = filter!.getGui();

                if (!exists(guiFromFilter)) {
                    console.warn(`getGui method from filter returned ${guiFromFilter}, it should be a DOM element or an HTML template string.`);
                }

                // for backwards compatibility with Angular 1 - we
                // used to allow providing back HTML from getGui().
                // once we move away from supporting Angular 1
                // directly, we can change this.
                if (typeof guiFromFilter === 'string') {
                    guiFromFilter = loadTemplate(guiFromFilter as string);
                }

                eFilterGui.appendChild(guiFromFilter);

                if (filterWrapper.scope) {
                    const compiledElement = this.$compile(eFilterGui)(filterWrapper.scope);
                    filterWrapper.compiledElement = compiledElement;
                    window.setTimeout(() => filterWrapper.scope.$apply(), 0);
                }

                resolve(eFilterGui);

                this.eventService.dispatchEvent({
                    type: Events.EVENT_FILTER_OPENED,
                    column: filterWrapper.column,
                    source,
                    eGui: eFilterGui,
                    api: this.gridApi,
                    columnApi: this.columnApi
                } as FilterOpenedEvent);
            });
        });
    }

    private onNewColumnsLoaded(): void {
        let atLeastOneFilterGone = false;

        this.allAdvancedFilters.forEach(filterWrapper => {
            const oldColumn = !this.columnModel.getPrimaryColumn(filterWrapper.column);

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
        const filterWrapper = this.allAdvancedFilters.get(column.getColId());

        if (filterWrapper) {
            this.disposeFilterWrapper(filterWrapper, source);
            this.onFilterChanged();
        }
    }

    private disposeFilterWrapper(filterWrapper: FilterWrapper, source: ColumnEventType): void {
        filterWrapper.filterPromise!.then(filter => {
            (filter!.setModel(null) || AgPromise.resolve()).then(() => {
                this.getContext().destroyBean(filter);

                filterWrapper.column.setFilterActive(false, source);

                if (filterWrapper.scope) {
                    if (filterWrapper.compiledElement) {
                        filterWrapper.compiledElement.remove();
                    }

                    filterWrapper.scope.$destroy();
                }

                this.allAdvancedFilters.delete(filterWrapper.column.getColId());
            });
        });
    }

    @PreDestroy
    protected destroy() {
        super.destroy();
        this.allAdvancedFilters.forEach(filterWrapper => this.disposeFilterWrapper(filterWrapper, 'filterDestroyed'));
    }
}

export interface FilterWrapper {
    compiledElement: any;
    column: Column;
    filterPromise: AgPromise<IFilterComp> | null;
    scope: any;
    guiPromise: AgPromise<HTMLElement | null>;
}
