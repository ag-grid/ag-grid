import { AgPromise, _ } from '../utils';
import { ValueService } from '../valueService/valueService';
import { ColumnModel } from '../columns/columnModel';
import { RowNode } from '../entities/rowNode';
import { Column } from '../entities/column';
import { Autowired, Bean, PostConstruct, PreDestroy } from '../context/context';
import { IRowModel } from '../interfaces/iRowModel';
import { ColumnEventType, Events, FilterChangedEvent, FilterModifiedEvent, FilterOpenedEvent } from '../events';
import { IFilterComp, IFilter, IFilterParams } from '../interfaces/iFilter';
import { ColDef, GetQuickFilterTextParams } from '../entities/colDef';
import { UserComponentFactory } from '../components/framework/userComponentFactory';
import { ModuleNames } from '../modules/moduleNames';
import { ModuleRegistry } from '../modules/moduleRegistry';
import { BeanStub } from '../context/beanStub';
import { convertToSet } from '../utils/set';
import { exists } from '../utils/generic';
import { mergeDeep, cloneObject } from '../utils/object';
import { loadTemplate } from '../utils/dom';
import { RowRenderer } from '../rendering/rowRenderer';
import { WithoutGridCommon } from '../interfaces/iCommon';

export type FilterRequestSource = 'COLUMN_MENU' | 'TOOLBAR' | 'NO_UI';

@Bean('filterManager')
export class FilterManager extends BeanStub {

    @Autowired('valueService') private valueService: ValueService;
    @Autowired('columnModel') private columnModel: ColumnModel;
    @Autowired('rowModel') private rowModel: IRowModel;
    @Autowired('userComponentFactory') private userComponentFactory: UserComponentFactory;
    @Autowired('rowRenderer') private rowRenderer: RowRenderer;

    public static QUICK_FILTER_SEPARATOR = '\n';

    private allColumnFilters = new Map<string, FilterWrapper>();
    private activeAggregateFilters: IFilterComp[] = [];
    private activeColumnFilters: IFilterComp[] = [];

    private quickFilter: string | null = null;
    private quickFilterParts: string[] | null = null;

    // this is true when the grid is processing the filter change. this is used by the cell comps, so that they
    // don't flash when data changes due to filter changes. there is no need to flash when filter changes as the
    // user is in control, so doesn't make sense to show flashing changes. for example, go to main demo where
    // this feature is turned off (hack code to always return false for isSuppressFlashingCellsBecauseFiltering(), put in)
    // 100,000 rows and group by country. then do some filtering. all the cells flash, which is silly.
    private processingFilterChange = false;
    private allowShowChangeAfterFilter: boolean;

    // A cached version of gridOptions.isExternalFilterPresent so its not called for every row
    private externalFilterPresent: boolean;

    @PostConstruct
    public init(): void {
        this.addManagedListener(this.eventService, Events.EVENT_GRID_COLUMNS_CHANGED, () => this.onColumnsChanged());
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_VALUE_CHANGED, () => this.refreshFiltersForAggregations());
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_PIVOT_CHANGED, () => this.refreshFiltersForAggregations());
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_PIVOT_MODE_CHANGED, () => this.refreshFiltersForAggregations());

        this.quickFilter = this.parseQuickFilter(this.gridOptionsService.get('quickFilterText'));
        this.setQuickFilterParts();

        this.allowShowChangeAfterFilter = this.gridOptionsService.is('allowShowChangeAfterFilter');
        this.externalFilterPresent = this.isExternalFilterPresentCallback();
    }

    private isExternalFilterPresentCallback() {
        const isFilterPresent = this.gridOptionsService.getCallback('isExternalFilterPresent');
        if (typeof isFilterPresent === 'function') {
            return isFilterPresent({});
        }
        return false;
    }

    private doesExternalFilterPass(node: RowNode) {
        const doesFilterPass = this.gridOptionsService.get('doesExternalFilterPass');
        if (typeof doesFilterPass === 'function') {
            return doesFilterPass(node);
        }
        return false;
    }

    private setQuickFilterParts(): void {
        this.quickFilterParts = this.quickFilter ? this.quickFilter.split(' ') : null;
    }

    public setFilterModel(model: { [key: string]: any; }): void {
        const allPromises: AgPromise<void>[] = [];
        const previousModel = this.getFilterModel();

        if (model) {
            // mark the filters as we set them, so any active filters left over we stop
            const modelKeys = convertToSet(Object.keys(model));

            this.allColumnFilters.forEach((filterWrapper, colId) => {
                const newModel = model[colId];

                allPromises.push(this.setModelOnFilterWrapper(filterWrapper.filterPromise!, newModel));
                modelKeys.delete(colId);
            });

            // at this point, processedFields contains data for which we don't have a filter working yet
            modelKeys.forEach(colId => {
                const column = this.columnModel.getPrimaryColumn(colId) || this.columnModel.getGridColumn(colId);

                if (!column) {
                    console.warn('AG Grid: setFilterModel() - no column found for colId: ' + colId);
                    return;
                }

                if (!column.isFilterAllowed()) {
                    console.warn('AG Grid: setFilterModel() - unable to fully apply model, filtering disabled for colId: ' + colId);
                    return;
                }

                const filterWrapper = this.getOrCreateFilterWrapper(column, 'NO_UI');
                if (!filterWrapper) {
                    console.warn('AG-Grid: setFilterModel() - unable to fully apply model, unable to create filter for colId: ' + colId);
                    return;
                }
                allPromises.push(this.setModelOnFilterWrapper(filterWrapper.filterPromise!, model[colId]));
            });
        } else {
            this.allColumnFilters.forEach(filterWrapper => {
                allPromises.push(this.setModelOnFilterWrapper(filterWrapper.filterPromise!, null));
            });
        }

        AgPromise.all(allPromises).then(() => {
            const currentModel = this.getFilterModel();

            const columns: Column[] = [];
            this.allColumnFilters.forEach((filterWrapper, colId) => {
                const before = previousModel ? previousModel[colId] : null;
                const after = currentModel ? currentModel[colId] : null;

                if (!_.jsonEquals(before, after)) {
                    columns.push(filterWrapper.column);
                }
            });

            if (columns.length > 0) {
                this.onFilterChanged({ columns });
            }
        });
    }

    private setModelOnFilterWrapper(filterPromise: AgPromise<IFilterComp>, newModel: any): AgPromise<void> {
        return new AgPromise<void>(resolve => {
            filterPromise.then(filter => {
                if (typeof filter!.setModel !== 'function') {
                    console.warn('AG Grid: filter missing setModel method, which is needed for setFilterModel');
                    resolve();
                }

                (filter!.setModel(newModel) || AgPromise.resolve()).then(() => resolve());
            });
        });
    }

    public getFilterModel(): { [key: string]: any; } {
        const result: { [key: string]: any; } = {};

        this.allColumnFilters.forEach((filterWrapper, key) => {
            // because user can provide filters, we provide useful error checking and messages
            const filterPromise = filterWrapper.filterPromise;
            const filter = filterPromise!.resolveNow(null, promiseFilter => promiseFilter);

            if (filter == null) { return null; }

            if (typeof filter.getModel !== 'function') {
                console.warn('AG Grid: filter API missing getModel method, which is needed for getFilterModel');
                return;
            }

            const model = filter.getModel();

            if (exists(model)) {
                result[key] = model;
            }
        });

        return result;
    }

    public isColumnFilterPresent(): boolean {
        return this.activeColumnFilters.length > 0;
    }

    public isAggregateFilterPresent(): boolean {
        return !!this.activeAggregateFilters.length;
    }

    public isExternalFilterPresent(): boolean {
        return this.externalFilterPresent;
    }

    private doAggregateFiltersPass(node: RowNode, filterToSkip?: IFilterComp) {
        return this.doColumnFiltersPass(node, filterToSkip, true);
    }

    // called by:
    // 1) onFilterChanged()
    // 2) onNewRowsLoaded()
    private updateActiveFilters(): void {
        this.activeColumnFilters.length = 0;
        this.activeAggregateFilters.length = 0;

        const isFilterActive = (filter: IFilter | null) => {
            if (!filter) { return false; } // this never happens, including to avoid compile error
            if (!filter.isFilterActive) {
                console.warn('AG Grid: Filter is missing isFilterActive() method');
                return false;
            }
            return filter.isFilterActive();
        };

        const groupFilterEnabled = !!this.gridOptionsWrapper.getGroupAggFiltering();

        const isAggFilter = (column: Column) => {

            const isSecondary = !column.isPrimary();
            // the only filters that can appear on secondary columns are groupAgg filters
            if (isSecondary) { return true; }

            const isShowingPrimaryColumns = !this.columnModel.isPivotActive();
            const isValueActive = column.isValueActive();

            // primary columns are only ever groupAgg filters if a) value is active and b) showing primary columns
            if (!isValueActive || !isShowingPrimaryColumns) { return false; }
            
            // from here on we know: isPrimary=true, isValueActive=true, isShowingPrimaryColumns=true
            if (this.columnModel.isPivotMode()) { 
                // primary column is pretending to be a pivot column, ie pivotMode=true, but we are
                // still showing primary columns
                return true; 
            } else {
                // we are not pivoting, so we groupFilter when it's an agg column
                return groupFilterEnabled;
            }
        };

        this.allColumnFilters.forEach(filterWrapper => {
            if (filterWrapper.filterPromise!.resolveNow(false, isFilterActive)) {
                const filterComp = filterWrapper.filterPromise!.resolveNow(null, filter => filter);
                if (isAggFilter(filterWrapper.column)) {
                    this.activeAggregateFilters.push(filterComp!);
                } else {
                    this.activeColumnFilters.push(filterComp!);
                }
            }
        });
    }

    private updateFilterFlagInColumns(source: ColumnEventType, additionalEventAttributes?: any): void {
        this.allColumnFilters.forEach(filterWrapper => {
            const isFilterActive = filterWrapper.filterPromise!.resolveNow(false, filter => filter!.isFilterActive());

            filterWrapper.column.setFilterActive(isFilterActive, source, additionalEventAttributes);
        });
    }

    public isAnyFilterPresent(): boolean {
        return this.isQuickFilterPresent() || this.isColumnFilterPresent() || this.isAggregateFilterPresent() || this.isExternalFilterPresent();
    }

    private doColumnFiltersPass(node: RowNode, filterToSkip?: IFilterComp, targetAggregates?: boolean): boolean {
        const { data, aggData } = node;

        const targetedFilters = targetAggregates ? this.activeAggregateFilters : this.activeColumnFilters;
        const targetedData = targetAggregates ? aggData : data;
        for (let i = 0; i < targetedFilters.length; i++) {
            const filter = targetedFilters[i];

            if (filter == null || filter === filterToSkip) { continue; }

            if (typeof filter.doesFilterPass !== 'function') {
                // because users can do custom filters, give nice error message
                throw new Error('Filter is missing method doesFilterPass');
            }

            if (!filter.doesFilterPass({ node, data: targetedData })) {
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
            console.warn('AG Grid - Quick filtering only works with the Client-Side Row Model');
            return null;
        }

        return newFilter.toUpperCase();
    }

    public setQuickFilter(newFilter: string): void {
        if (newFilter != null && typeof newFilter !== 'string') {
            console.warn(`AG Grid - setQuickFilter() only supports string inputs, received: ${typeof newFilter}`);
            return;
        }

        const parsedFilter = this.parseQuickFilter(newFilter);

        if (this.quickFilter !== parsedFilter) {
            this.quickFilter = parsedFilter;
            this.setQuickFilterParts();
            this.onFilterChanged();
        }
    }

    public refreshFiltersForAggregations() {
        const isAggFiltering = this.gridOptionsWrapper.getGroupAggFiltering();
        if (isAggFiltering) {
            this.onFilterChanged();
        }
    }

    // sometimes (especially in React) the filter can call onFilterChanged when we are in the middle
    // of a render cycle. this would be bad, so we wait for render cycle to complete when this happens.
    // this happens in react when we change React State in the grid (eg setting RowCtrl's in RowContainer)
    // which results in React State getting applied in the main application, triggering a useEffect() to
    // be kicked off adn then the application calling the grid's API. in AG-6554, the custom filter was
    // getting it's useEffect() triggered in this way.
    public callOnFilterChangedOutsideRenderCycle(params: { filterInstance?: IFilterComp, additionalEventAttributes?: any, columns?: Column[] } = {}): void {
        const action = () => this.onFilterChanged(params);
        if (this.rowRenderer.isRefreshInProgress()) {
            setTimeout(action, 0);
        } else {
            action();
        }
    }

    public onFilterChanged(params: { filterInstance?: IFilterComp, additionalEventAttributes?: any, columns?: Column[] } = {}): void {
        const { filterInstance, additionalEventAttributes, columns } = params;

        this.updateActiveFilters();
        this.updateFilterFlagInColumns('filterChanged', additionalEventAttributes);
        this.externalFilterPresent = this.isExternalFilterPresentCallback();

        this.allColumnFilters.forEach(filterWrapper => {
            if (!filterWrapper.filterPromise) { return; }
            filterWrapper.filterPromise.then(filter => {
                if (filter && filter !== filterInstance && filter.onAnyFilterChanged) {
                    filter!.onAnyFilterChanged();
                }
            });
        });

        const filterChangedEvent: WithoutGridCommon<FilterChangedEvent> = {
            type: Events.EVENT_FILTER_CHANGED,
            columns: columns || [],
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

        return columns.some(column => {
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
        const usingCache = this.gridOptionsService.is('cacheQuickFilter');

        // each part must pass, if any fails, then the whole filter fails
        return this.quickFilterParts!.every(part =>
            usingCache ? this.doesRowPassQuickFilterCache(node, part) : this.doesRowPassQuickFilterNoCache(node, part)
        );
    }

    public doesRowPassAggregateFilters(params: {
        rowNode: RowNode;
        filterInstanceToSkip?: IFilterComp;
    }): boolean {
        if (this.isAggregateFilterPresent() && !this.doAggregateFiltersPass(params.rowNode, params.filterInstanceToSkip)) {
            return false;
        }

        // got this far, all filters pass
        return true;
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
        if (this.isExternalFilterPresent() && !this.doesExternalFilterPass(params.rowNode)) {
            return false;
        }

        // lastly, check column filter
        if (this.isColumnFilterPresent() && !this.doColumnFiltersPass(params.rowNode, params.filterInstanceToSkip)) {
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
                api: this.gridOptionsService.get('api')!,
                columnApi: this.gridOptionsService.get('columnApi')!,
                context: this.gridOptionsService.get('context')
            };

            value = colDef.getQuickFilterText(params);
        }

        return exists(value) ? value.toString().toUpperCase() : null;
    }

    private aggregateRowForQuickFilter(node: RowNode): void {
        const stringParts: string[] = [];
        const columns = this.columnModel.getAllColumnsForQuickFilter();

        columns.forEach(column => {
            const part = this.getQuickFilterTextForColumn(column, node);

            if (exists(part)) {
                stringParts.push(part);
            }
        });

        node.quickFilterAggregateText = stringParts.join(FilterManager.QUICK_FILTER_SEPARATOR);
    }

    public onNewRowsLoaded(source: ColumnEventType): void {
        this.allColumnFilters.forEach(filterWrapper => {
            filterWrapper.filterPromise!.then(filter => {
                if (filter!.onNewRowsLoaded) {
                    filter!.onNewRowsLoaded();
                }
            });
        });

        this.updateFilterFlagInColumns(source);
        this.updateActiveFilters();
    }

    private createValueGetter(column: Column): IFilterParams['valueGetter'] {
        return ({ node }) => this.valueService.getValue(column, node, true);
    }

    public getFilterComponent(column: Column, source: FilterRequestSource, createIfDoesNotExist = true): AgPromise<IFilterComp> | null {
        if (createIfDoesNotExist) {
            return this.getOrCreateFilterWrapper(column, source)?.filterPromise || null;
        }

        const filterWrapper = this.cachedFilter(column);

        return filterWrapper ? filterWrapper.filterPromise : null;
    }

    public isFilterActive(column: Column): boolean {
        const filterWrapper = this.cachedFilter(column);

        return !!filterWrapper && filterWrapper.filterPromise!.resolveNow(false, filter => filter!.isFilterActive());
    }

    public getOrCreateFilterWrapper(column: Column, source: FilterRequestSource): FilterWrapper | null {
        if (!column.isFilterAllowed()) {
            return null;
        }

        let filterWrapper = this.cachedFilter(column);

        if (!filterWrapper) {
            filterWrapper = this.createFilterWrapper(column, source);
            this.allColumnFilters.set(column.getColId(), filterWrapper);
        } else if (source !== 'NO_UI') {
            this.putIntoGui(filterWrapper, source);
        }

        return filterWrapper;
    }

    public cachedFilter(column: Column): FilterWrapper | undefined {
        return this.allColumnFilters.get(column.getColId());
    }

    private createFilterInstance(column: Column): AgPromise<IFilterComp> | null {
        const defaultFilter =
            ModuleRegistry.isRegistered(ModuleNames.SetFilterModule) ? 'agSetColumnFilter' : 'agTextColumnFilter';

        const colDef = column.getColDef();

        let filterInstance: IFilterComp;

        const params: IFilterParams = {
            ...this.createFilterParams(column, colDef),
            filterModifiedCallback: () => {
                const event: WithoutGridCommon<FilterModifiedEvent> = {
                    type: Events.EVENT_FILTER_MODIFIED,
                    column,
                    filterInstance
                };

                this.eventService.dispatchEvent(event);
            },
            filterChangedCallback: (additionalEventAttributes?: any) => {
                const params = { filterInstance, additionalEventAttributes, columns: [column] };
                this.callOnFilterChangedOutsideRenderCycle(params);
            },
            doesRowPassOtherFilter: node => this.doesRowPassOtherFilters(filterInstance, node),
        };

        const compDetails = this.userComponentFactory.getFilterDetails(colDef, params, defaultFilter);
        if (!compDetails) { return null; }
        const componentPromise = compDetails.newAgStackInstance();

        if (componentPromise) {
            componentPromise.then(r => filterInstance = r!);
        }

        return componentPromise;
    }

    public createFilterParams(column: Column, colDef: ColDef): IFilterParams {
        const params: IFilterParams = {
            column,
            colDef: cloneObject(colDef),
            rowModel: this.rowModel,
            filterChangedCallback: () => { },
            filterModifiedCallback: () => { },
            valueGetter: this.createValueGetter(column),
            doesRowPassOtherFilter: () => true,
            api: this.gridOptionsService.get('api')!,
            columnApi: this.gridOptionsService.get('columnApi')!,
            context: this.gridOptionsService.get('context'),
        };

        return params;
    }

    private createFilterWrapper(column: Column, source: FilterRequestSource): FilterWrapper {
        const filterWrapper: FilterWrapper = {
            column: column,
            filterPromise: null,
            compiledElement: null,
            guiPromise: AgPromise.resolve(null)
        };

        filterWrapper.filterPromise = this.createFilterInstance(column);

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
                    console.warn(`AG Grid: getGui method from filter returned ${guiFromFilter}, it should be a DOM element or an HTML template string.`);
                }

                // for backwards compatibility with Angular 1 - we
                // used to allow providing back HTML from getGui().
                // once we move away from supporting Angular 1
                // directly, we can change this.
                if (typeof guiFromFilter === 'string') {
                    guiFromFilter = loadTemplate(guiFromFilter as string);
                }

                eFilterGui.appendChild(guiFromFilter);
                resolve(eFilterGui);
                const event: WithoutGridCommon<FilterOpenedEvent> = {
                    type: Events.EVENT_FILTER_OPENED,
                    column: filterWrapper.column,
                    source,
                    eGui: eFilterGui
                };

                this.eventService.dispatchEvent(event);
            });
        });
    }

    private onColumnsChanged(): void {
        const columns: Column[] = [];

        this.allColumnFilters.forEach((wrapper, colId) => {
            let currentColumn: Column | null;
            if (wrapper.column.isPrimary()) {
                currentColumn = this.columnModel.getPrimaryColumn(colId);
            } else {
                currentColumn = this.columnModel.getGridColumn(colId);
            }
            if (currentColumn) { return; }

            columns.push(wrapper.column);
            this.disposeFilterWrapper(wrapper, 'filterDestroyed');
        });

        if (columns.length > 0) {
            this.onFilterChanged({ columns });
        }
    }

    // destroys the filter, so it not longer takes part
    public destroyFilter(column: Column, source: ColumnEventType = 'api'): void {
        const filterWrapper = this.allColumnFilters.get(column.getColId());

        if (filterWrapper) {
            this.disposeFilterWrapper(filterWrapper, source);
            this.onFilterChanged({ columns: [column] });
        }
    }

    private disposeFilterWrapper(filterWrapper: FilterWrapper, source: ColumnEventType): void {
        filterWrapper.filterPromise!.then(filter => {
            (filter!.setModel(null) || AgPromise.resolve()).then(() => {
                this.getContext().destroyBean(filter);

                filterWrapper.column.setFilterActive(false, source);

                this.allColumnFilters.delete(filterWrapper.column.getColId());
            });
        });
    }

    @PreDestroy
    protected destroy() {
        super.destroy();
        this.allColumnFilters.forEach(filterWrapper => this.disposeFilterWrapper(filterWrapper, 'filterDestroyed'));
    }
}

export interface FilterWrapper {
    compiledElement: any;
    column: Column;
    filterPromise: AgPromise<IFilterComp> | null;
    guiPromise: AgPromise<HTMLElement | null>;
}
