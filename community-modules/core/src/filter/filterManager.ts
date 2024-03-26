import { AgPromise, _ } from '../utils';
import { ValueService } from '../valueService/valueService';
import { ColumnModel } from '../columns/columnModel';
import { RowNode } from '../entities/rowNode';
import { Column } from '../entities/column';
import { Autowired, Bean, Optional, PostConstruct } from '../context/context';
import { IRowModel } from '../interfaces/iRowModel';
import { ColumnEventType, Events, FilterChangedEvent, FilterModifiedEvent, FilterDestroyedEvent, AdvancedFilterEnabledChangedEvent, FilterChangedEventSourceType } from '../events';
import { IFilterComp, IFilter, IFilterParams, FilterModel } from '../interfaces/iFilter';
import { ColDef } from '../entities/colDef';
import { UserCompDetails, UserComponentFactory } from '../components/framework/userComponentFactory';
import { ModuleNames } from '../modules/moduleNames';
import { ModuleRegistry } from '../modules/moduleRegistry';
import { BeanStub } from '../context/beanStub';
import { convertToSet } from '../utils/set';
import { exists } from '../utils/generic';
import { mergeDeep, cloneObject } from '../utils/object';
import { RowRenderer } from '../rendering/rowRenderer';
import { WithoutGridCommon } from '../interfaces/iCommon';
import { FilterComponent } from '../components/framework/componentTypes';
import { IFloatingFilterParams, IFloatingFilterParentCallback } from './floating/floatingFilter';
import { unwrapUserComp } from '../gridApi';
import { AdvancedFilterModel } from '../interfaces/advancedFilterModel';
import { IAdvancedFilterService } from '../interfaces/iAdvancedFilterService';
import { warnOnce } from '../utils/function';
import { DataTypeService } from '../columns/dataTypeService';
import { QuickFilterService } from './quickFilterService';

export type FilterRequestSource = 'COLUMN_MENU' | 'TOOLBAR' | 'NO_UI';

@Bean('filterManager')
export class FilterManager extends BeanStub {

    @Autowired('valueService') private valueService: ValueService;
    @Autowired('columnModel') private columnModel: ColumnModel;
    @Autowired('rowModel') private rowModel: IRowModel;
    @Autowired('userComponentFactory') private userComponentFactory: UserComponentFactory;
    @Autowired('rowRenderer') private rowRenderer: RowRenderer;
    @Autowired('dataTypeService') private dataTypeService: DataTypeService;
    @Autowired('quickFilterService') private quickFilterService: QuickFilterService;
    @Optional('advancedFilterService') private advancedFilterService: IAdvancedFilterService;

    private allColumnFilters = new Map<string, FilterWrapper>();
    private allColumnListeners = new Map<string, (() => null) | undefined>();
    private activeAggregateFilters: IFilterComp[] = [];
    private activeColumnFilters: IFilterComp[] = [];

    // this is true when the grid is processing the filter change. this is used by the cell comps, so that they
    // don't flash when data changes due to filter changes. there is no need to flash when filter changes as the
    // user is in control, so doesn't make sense to show flashing changes. for example, go to main demo where
    // this feature is turned off (hack code to always return false for isSuppressFlashingCellsBecauseFiltering(), put in)
    // 100,000 rows and group by country. then do some filtering. all the cells flash, which is silly.
    private processingFilterChange = false;

    // A cached version of gridOptions.isExternalFilterPresent so its not called for every row
    private externalFilterPresent: boolean;

    private aggFiltering: boolean;

    // when we're waiting for cell data types to be inferred, we need to defer filter model updates
    private filterModelUpdateQueue: { model: FilterModel | null, source: FilterChangedEventSourceType }[] = [];
    private columnFilterModelUpdateQueue: { key: string | Column, model: any, resolve: () => void }[] = [];
    private advancedFilterModelUpdateQueue: (AdvancedFilterModel | null | undefined)[] = [];

    private initialFilterModel: FilterModel;

    @PostConstruct
    public init(): void {
        this.addManagedListener(this.eventService, Events.EVENT_GRID_COLUMNS_CHANGED, () => this.onColumnsChanged());
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_VALUE_CHANGED, () => this.refreshFiltersForAggregations());
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_PIVOT_CHANGED, () => this.refreshFiltersForAggregations());
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_PIVOT_MODE_CHANGED, () => this.refreshFiltersForAggregations());
        this.addManagedListener(this.eventService, Events.EVENT_NEW_COLUMNS_LOADED, () => this.updateAdvancedFilterColumns());
        this.addManagedListener(this.eventService, Events.EVENT_COLUMN_VISIBLE, () => this.updateAdvancedFilterColumns());
        this.addManagedListener(this.eventService, Events.EVENT_ROW_DATA_UPDATED, () => this.onNewRowsLoaded('rowDataUpdated'));

        this.externalFilterPresent = this.isExternalFilterPresentCallback();
        this.addManagedPropertyListeners(['isExternalFilterPresent', 'doesExternalFilterPass'], () => {
            this.onFilterChanged({ source: 'api' });
        });

        this.updateAggFiltering();
        this.addManagedPropertyListener('groupAggFiltering', () => {
            this.updateAggFiltering();
            this.onFilterChanged();
        });

        this.addManagedPropertyListener('advancedFilterModel', (event) => this.setAdvancedFilterModel(event.currentValue));
        this.addManagedListener(this.eventService, Events.EVENT_ADVANCED_FILTER_ENABLED_CHANGED,
            ({ enabled }: AdvancedFilterEnabledChangedEvent) => this.onAdvancedFilterEnabledChanged(enabled));

        this.addManagedListener(this.eventService, Events.EVENT_DATA_TYPES_INFERRED, () => this.processFilterModelUpdateQueue());
        this.addManagedListener(this.quickFilterService, QuickFilterService.EVENT_QUICK_FILTER_CHANGED, () => this.onFilterChanged({ source: 'quickFilter' }));

        this.initialFilterModel = {
            ...this.gos.get('initialState')?.filter?.filterModel ?? {}
        };
    }

    private isExternalFilterPresentCallback() {
        const isFilterPresent = this.gos.getCallback('isExternalFilterPresent');
        if (typeof isFilterPresent === 'function') {
            return isFilterPresent({});
        }
        return false;
    }

    private doesExternalFilterPass(node: RowNode) {
        const doesFilterPass = this.gos.get('doesExternalFilterPass');
        if (typeof doesFilterPass === 'function') {
            return doesFilterPass(node);
        }
        return false;
    }

    public setFilterModel(model: FilterModel | null, source: FilterChangedEventSourceType = 'api'): void {
        if (this.isAdvancedFilterEnabled()) {
            this.warnAdvancedFilters();
            return;
        }

        if (this.dataTypeService.isPendingInference()) {
            this.filterModelUpdateQueue.push({ model, source });
            return;
        }

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
                this.onFilterChanged({ columns, source });
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

    public getFilterModel(): FilterModel {
        const result: FilterModel = {};

        this.allColumnFilters.forEach((filterWrapper, key) => {
            const model = this.getModelFromFilterWrapper(filterWrapper);

            if (exists(model)) {
                result[key] = model;
            }
        });

        return result;
    }

    private getModelFromFilterWrapper(filterWrapper: FilterWrapper): any {
        // because user can provide filters, we provide useful error checking and messages
        const filterPromise = filterWrapper.filterPromise;
        const filter = filterPromise!.resolveNow(null, promiseFilter => promiseFilter);

        if (filter == null) {
            // filter still being created. returned initial state if it exists and hasn't been applied yet
            return this.initialFilterModel[filterWrapper.column.getColId()] ?? null;
        }

        if (typeof filter.getModel !== 'function') {
            console.warn('AG Grid: filter API missing getModel method, which is needed for getFilterModel');
            return null;
        }

        return filter.getModel();
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

    public isChildFilterPresent(): boolean {
        return this.isColumnFilterPresent()
            || this.isQuickFilterPresent() 
            || this.isExternalFilterPresent()
            || this.isAdvancedFilterPresent();
    }

    private isAdvancedFilterPresent(): boolean {
        return this.isAdvancedFilterEnabled() && this.advancedFilterService.isFilterPresent();
    }

    private onAdvancedFilterEnabledChanged(enabled: boolean): void {
        if (enabled) {
            if (this.allColumnFilters.size) {
                this.allColumnFilters.forEach(filterWrapper => this.disposeFilterWrapper(filterWrapper, 'advancedFilterEnabled'));
                this.onFilterChanged({ source: 'advancedFilter' });
            }
        } else {
            if (this.advancedFilterService?.isFilterPresent()) {
                this.advancedFilterService.setModel(null);
                this.onFilterChanged({ source: 'advancedFilter' });
            }
        }
    }

    public isAdvancedFilterEnabled(): boolean {
        return !!this.advancedFilterService?.isEnabled();
    }

    public isAdvancedFilterHeaderActive(): boolean {
        return this.isAdvancedFilterEnabled() && this.advancedFilterService.isHeaderActive();
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

        const groupFilterEnabled = !!this.gos.getGroupAggFiltering();

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
            }
            // we are not pivoting, so we groupFilter when it's an agg column
            return groupFilterEnabled;
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
        return this.isQuickFilterPresent() || this.isColumnFilterPresent() || this.isAggregateFilterPresent() || this.isExternalFilterPresent() || this.isAdvancedFilterPresent();
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

    public resetQuickFilterCache(): void {
        this.quickFilterService.resetQuickFilterCache();
    }

    private refreshFiltersForAggregations() {
        const isAggFiltering = this.gos.getGroupAggFiltering();
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
    public callOnFilterChangedOutsideRenderCycle(params: {
        source?: FilterChangedEventSourceType,
        filterInstance?: IFilterComp,
        additionalEventAttributes?: any,
        columns?: Column[],
    }): void {
        const action = () => this.onFilterChanged(params);
        if (this.rowRenderer.isRefreshInProgress()) {
            setTimeout(action, 0);
        } else {
            action();
        }
    }

    public onFilterChanged(params: {
        source?: FilterChangedEventSourceType,
        filterInstance?: IFilterComp,
        additionalEventAttributes?: any,
        columns?: Column[],
    } = {}): void {
        const { source, filterInstance, additionalEventAttributes, columns } = params;

        this.updateDependantFilters();
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
            source,
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
        const allowShowChangeAfterFilter = this.gos.get('allowShowChangeAfterFilter') ?? false;
        return !allowShowChangeAfterFilter && this.processingFilterChange;
    }

    public isQuickFilterPresent(): boolean {
        return this.quickFilterService.isQuickFilterPresent();
    }

    private updateAggFiltering(): void {
        this.aggFiltering = !!this.gos.getGroupAggFiltering();
    }

    public isAggregateQuickFilterPresent(): boolean {
        return this.isQuickFilterPresent() && (this.aggFiltering || this.columnModel.isPivotMode());
    }

    private isNonAggregateQuickFilterPresent(): boolean {
        return this.isQuickFilterPresent() && !(this.aggFiltering || this.columnModel.isPivotMode());
    }

    public doesRowPassOtherFilters(filterToSkip: IFilterComp, node: any): boolean {
        return this.doesRowPassFilter({ rowNode: node, filterInstanceToSkip: filterToSkip });
    }

    public doesRowPassAggregateFilters(params: {
        rowNode: RowNode;
        filterInstanceToSkip?: IFilterComp;
    }): boolean {
        // check quick filter
        if (this.isAggregateQuickFilterPresent() && !this.quickFilterService.doesRowPassQuickFilter(params.rowNode)) {
            return false;
        }

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
        if (this.isNonAggregateQuickFilterPresent() && !this.quickFilterService.doesRowPassQuickFilter(params.rowNode)) {
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

        if (this.isAdvancedFilterPresent() && !this.advancedFilterService.doesFilterPass(params.rowNode)) {
            return false;
        }

        // got this far, all filters pass
        return true;
    }

    public onNewRowsLoaded(source: ColumnEventType): void {
        this.allColumnFilters.forEach(filterWrapper => {
            filterWrapper.filterPromise!.then(filter => {
                if (filter!.onNewRowsLoaded) {
                    filter!.onNewRowsLoaded();
                }
            });
        });

        this.updateFilterFlagInColumns(source, { afterDataChange: true });
        this.updateActiveFilters();
    }

    private createValueGetter(column: Column): IFilterParams['valueGetter'] {
        return ({ node }) => this.valueService.getValue(column, node as RowNode, true);
    }

    private createGetValue(filterColumn: Column): IFilterParams['getValue'] {
        return (rowNode, column) => {
            const columnToUse = column ? this.columnModel.getGridColumn(column) : filterColumn;
            return columnToUse ? this.valueService.getValue(columnToUse, rowNode, true) : undefined;
        };
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
            this.setColumnFilterWrapper(column, filterWrapper);
        }

        return filterWrapper;
    }

    public cachedFilter(column: Column): FilterWrapper | undefined {
        return this.allColumnFilters.get(column.getColId());
    }

    private getDefaultFilter(column: Column): string {
        let defaultFilter;
        if (ModuleRegistry.__isRegistered(ModuleNames.SetFilterModule, this.context.getGridId())) {
            defaultFilter = 'agSetColumnFilter';
        } else {
            const cellDataType = this.dataTypeService.getBaseDataType(column);
            if (cellDataType === 'number') {
                defaultFilter = 'agNumberColumnFilter';
            } else if (cellDataType === 'date' || cellDataType === 'dateString') {
                defaultFilter = 'agDateColumnFilter';
            } else {
                defaultFilter = 'agTextColumnFilter';
            }
        }
        return defaultFilter;
    }

    public getDefaultFloatingFilter(column: Column): string {
        let defaultFloatingFilterType: string;
        if (ModuleRegistry.__isRegistered(ModuleNames.SetFilterModule, this.context.getGridId())) {
            defaultFloatingFilterType = 'agSetColumnFloatingFilter';
        } else {
            const cellDataType = this.dataTypeService.getBaseDataType(column);
            if (cellDataType === 'number') {
                defaultFloatingFilterType = 'agNumberColumnFloatingFilter';
            } else if (cellDataType === 'date' || cellDataType === 'dateString') {
                defaultFloatingFilterType = 'agDateColumnFloatingFilter';
            } else {
                defaultFloatingFilterType = 'agTextColumnFloatingFilter';
            }
        }
        return defaultFloatingFilterType;
    }

    private createFilterInstance(column: Column): {
        filterPromise: (() => (AgPromise<IFilterComp> | null)) | null,
        compDetails: UserCompDetails | null
    } {
        const defaultFilter = this.getDefaultFilter(column);

        const colDef = column.getColDef();

        let filterInstance: IFilterComp;

        const params: IFilterParams = {
            ...this.createFilterParams(column, colDef),
            filterModifiedCallback: () => this.filterModifiedCallbackFactory(filterInstance, column)(),
            filterChangedCallback: (additionalEventAttributes?: any) => this.filterChangedCallbackFactory(filterInstance, column)(additionalEventAttributes),
            doesRowPassOtherFilter: node => this.doesRowPassOtherFilters(filterInstance, node),
        };

        const compDetails = this.userComponentFactory.getFilterDetails(colDef, params, defaultFilter);
        if (!compDetails) { return { filterPromise: null, compDetails: null }; }
        return {
            filterPromise: () => {
                const filterPromise = compDetails.newAgStackInstance();
                if (filterPromise) {
                    filterPromise.then(r => filterInstance = r!);
                }
                return filterPromise;
            },
            compDetails
        };
    }

    public createFilterParams(column: Column, colDef: ColDef): IFilterParams {
        const params: IFilterParams = this.gos.addGridCommonParams({
            column,
            colDef: cloneObject(colDef),
            rowModel: this.rowModel,
            filterChangedCallback: () => { },
            filterModifiedCallback: () => { },
            valueGetter: this.createValueGetter(column),
            getValue: this.createGetValue(column),
            doesRowPassOtherFilter: () => true,
        });

        return params;
    }

    private createFilterWrapper(column: Column, source: FilterRequestSource): FilterWrapper {
        const filterWrapper: FilterWrapper = {
            column: column,
            filterPromise: null,
            compiledElement: null,
            compDetails: null
        };

        const { filterPromise, compDetails } = this.createFilterInstance(column);
        filterWrapper.filterPromise = filterPromise?.() ?? null;
        filterWrapper.compDetails = compDetails;

        return filterWrapper;
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
            this.disposeFilterWrapper(wrapper, 'columnChanged');
            this.disposeColumnListener(colId);
        });

        if (columns.length > 0) {
            // When a filter changes as a side effect of a column changes,
            // we report 'api' as the source, so that the client can distinguish
            this.onFilterChanged({ columns, source: 'api' });
        } else {
            // onFilterChanged does this already
            this.updateDependantFilters();
        }
    }

    private updateDependantFilters(): void {
        // Group column filters can be dependant on underlying column filters, but don't normally get created until they're used for the first time.
        // Instead, create them by default when any filter changes.
        const groupColumns = this.columnModel.getGroupAutoColumns();
        groupColumns?.forEach(groupColumn => {
            if (groupColumn.getColDef().filter === 'agGroupColumnFilter') {
                this.getOrCreateFilterWrapper(groupColumn, 'NO_UI');
            }
        });
    }

    // for group filters, can change dynamically whether they are allowed or not
    public isFilterAllowed(column: Column): boolean {
        if (this.isAdvancedFilterEnabled()) {
            return false;
        }
        const isFilterAllowed = column.isFilterAllowed();
        if (!isFilterAllowed) {
            return false;
        }
        const filterWrapper = this.allColumnFilters.get(column.getColId());
        return filterWrapper?.filterPromise?.resolveNow(
            true,
            // defer to filter component isFilterAllowed if it exists
            filter => (typeof (filter as any)?.isFilterAllowed === 'function')
                ? (filter as any)?.isFilterAllowed()
                : true
        ) ?? true;
    }

    public getFloatingFilterCompDetails(column: Column, showParentFilter: () => void): UserCompDetails | undefined {
        const parentFilterInstance = (callback: IFloatingFilterParentCallback<IFilter>) => {
            const filterComponent = this.getFilterComponent(column, 'NO_UI');

            if (filterComponent == null) { return; }

            filterComponent.then(instance => {
                callback(unwrapUserComp(instance!));
            });
        };

        const colDef = column.getColDef();
        const filterParams = {
            ...this.createFilterParams(column, colDef),
            filterChangedCallback: () => parentFilterInstance(filterInstance => this.filterChangedCallbackFactory(filterInstance as IFilterComp, column)()),
        }
        const finalFilterParams = this.userComponentFactory.mergeParamsWithApplicationProvidedParams(colDef, FilterComponent, filterParams);

        let defaultFloatingFilterType = this.userComponentFactory.getDefaultFloatingFilterType(colDef, () => this.getDefaultFloatingFilter(column));

        if (defaultFloatingFilterType == null) {
            defaultFloatingFilterType = 'agReadOnlyFloatingFilter';
        }

        const params: WithoutGridCommon<IFloatingFilterParams<IFilter>> = {
            column: column,
            filterParams: finalFilterParams,
            currentParentModel: () => this.getCurrentFloatingFilterParentModel(column),
            parentFilterInstance,
            showParentFilter,
            suppressFilterButton: false // This one might be overridden from the colDef
        };

        return this.userComponentFactory.getFloatingFilterCompDetails(colDef, params, defaultFloatingFilterType);
    }

    public getCurrentFloatingFilterParentModel(column: Column): any {
        const filterComponent = this.getFilterComponent(column, 'NO_UI', false);

        return filterComponent ? filterComponent.resolveNow(null, filter => filter && filter.getModel()) : null;
    }

    // destroys the filter, so it no longer takes part
    public destroyFilter(column: Column, source: 'api' | 'columnChanged' | 'paramsUpdated' = 'api'): void {
        const colId = column.getColId();
        const filterWrapper = this.allColumnFilters.get(colId);

        this.disposeColumnListener(colId);

        delete this.initialFilterModel[colId];

        if (filterWrapper) {
            this.disposeFilterWrapper(filterWrapper, source);
            this.onFilterChanged({
                columns: [column],
                source: 'api',
            });
        }
    }

    private disposeColumnListener(colId: string): void {
        const columnListener = this.allColumnListeners.get(colId);

        if (columnListener) {
            this.allColumnListeners.delete(colId);
            columnListener();
        }
    }

    private disposeFilterWrapper(filterWrapper: FilterWrapper, source: 'api' | 'columnChanged' | 'gridDestroyed' | 'advancedFilterEnabled' | 'paramsUpdated'): void {
        filterWrapper.filterPromise!.then(filter => {
            this.getContext().destroyBean(filter);

            filterWrapper.column.setFilterActive(false, 'filterDestroyed');

            this.allColumnFilters.delete(filterWrapper.column.getColId());

            const event: WithoutGridCommon<FilterDestroyedEvent> = {
                type: Events.EVENT_FILTER_DESTROYED,
                source,
                column: filterWrapper.column,
            };
            this.eventService.dispatchEvent(event);
        });
    }

    private filterModifiedCallbackFactory(filter: IFilterComp<any>, column: Column<any>) {
        return () => {
            const event: WithoutGridCommon<FilterModifiedEvent> = {
                type: Events.EVENT_FILTER_MODIFIED,
                column,
                filterInstance: filter,
            };

            this.eventService.dispatchEvent(event);
        }
    }

    private filterChangedCallbackFactory(filter: IFilterComp<any>, column: Column<any>) {
        return (additionalEventAttributes?: any) => {
            const source: FilterChangedEventSourceType = additionalEventAttributes?.source ?? 'api';
            const params = {
                filter,
                additionalEventAttributes,
                columns: [column],
                source,
            };
            this.callOnFilterChangedOutsideRenderCycle(params);
        };
    }

    private checkDestroyFilter(colId: string): void {
        const filterWrapper = this.allColumnFilters.get(colId);
        if (!filterWrapper) {
            return;
        }

        const column = filterWrapper.column;
        const { compDetails } = column.isFilterAllowed()
            ? this.createFilterInstance(column)
            : { compDetails: null };

        // Case when filter component changes
        if (this.areFilterCompsDifferent(filterWrapper.compDetails, compDetails)) {
            this.destroyFilter(column, 'paramsUpdated');
            return;
        }

        // Case when filter params changes
        const newFilterParams = column.getColDef().filterParams;
        // When filter wrapper does not have promise to retrieve FilterComp, destroy
        if (!filterWrapper.filterPromise) {
            this.destroyFilter(column, 'paramsUpdated');
            return;
        }

        // Otherwise - Check for refresh method before destruction
        // If refresh() method is implemented - call it and destroy filter if it returns false
        // Otherwise - do nothing ( filter will not be destroyed - we assume new params are compatible with old ones )
        filterWrapper.filterPromise.then(filter => {
            const shouldRefreshFilter = filter?.refresh ? filter.refresh({
                ...this.createFilterParams(column, column.getColDef()),
                filterModifiedCallback: this.filterModifiedCallbackFactory(filter, column),
                filterChangedCallback: this.filterChangedCallbackFactory(filter, column),
                doesRowPassOtherFilter: node => this.doesRowPassOtherFilters(filter, node),
                ...newFilterParams,
            }) : true;
            // framework wrapper always implements optional methods, but returns null if no underlying method
            if (shouldRefreshFilter === false) {
                this.destroyFilter(column, 'paramsUpdated');
            }
        });
    }

    private setColumnFilterWrapper(column: Column, filterWrapper: FilterWrapper): void {
        const colId = column.getColId();
        this.allColumnFilters.set(colId, filterWrapper);
        this.allColumnListeners.set(
            colId,
            this.addManagedListener(
                column,
                Column.EVENT_COL_DEF_CHANGED,
                () => this.checkDestroyFilter(colId),
            ),
        );
    }

    public areFilterCompsDifferent(oldCompDetails: UserCompDetails | null, newCompDetails: UserCompDetails | null): boolean {
        if (!newCompDetails || !oldCompDetails) {
            return true;
        }
        const { componentClass: oldComponentClass } = oldCompDetails;
        const { componentClass: newComponentClass } = newCompDetails;
        const isSameComponentClass = oldComponentClass === newComponentClass ||
            // react hooks returns new wrappers, so check nested render method
            (oldComponentClass?.render && newComponentClass?.render &&
                oldComponentClass.render === newComponentClass.render);
        return !isSameComponentClass;
    }

    public getAdvancedFilterModel(): AdvancedFilterModel | null {
        return this.isAdvancedFilterEnabled() ? this.advancedFilterService.getModel() : null;
    }

    public setAdvancedFilterModel(expression: AdvancedFilterModel | null | undefined): void {
        if (!this.isAdvancedFilterEnabled()) { return; }
        if (this.dataTypeService.isPendingInference()) {
            this.advancedFilterModelUpdateQueue.push(expression);
            return;
        }
        this.advancedFilterService.setModel(expression ?? null);
        this.onFilterChanged({ source: 'advancedFilter' });
    }

    public showAdvancedFilterBuilder(source: 'api' | 'ui'): void {
        if (!this.isAdvancedFilterEnabled()) { return; }
        this.advancedFilterService.getCtrl().toggleFilterBuilder(source, true);
    }

    private updateAdvancedFilterColumns(): void {
        if (!this.isAdvancedFilterEnabled()) { return; }
        if (this.advancedFilterService.updateValidity()) {
            this.onFilterChanged({ source: 'advancedFilter' });
        }
    }

    public hasFloatingFilters(): boolean {
        if (this.isAdvancedFilterEnabled()) { return false; }
        const gridColumns = this.columnModel.getAllGridColumns();
        return gridColumns.some(col => col.getColDef().floatingFilter);
    }

    public getFilterInstance<TFilter extends IFilter>(key: string | Column, callback?: (filter: TFilter | null) => void): TFilter | null | undefined {
        if (this.isAdvancedFilterEnabled()) {
            this.warnAdvancedFilters();
            return undefined;
        }
        const res = this.getFilterInstanceImpl(key, instance => {
            if (!callback) { return; }
            const unwrapped = unwrapUserComp(instance) as any;
            callback(unwrapped);
        });
        const unwrapped = unwrapUserComp(res);
        return unwrapped as any;
    }

    public getColumnFilterInstance<TFilter extends IFilter>(key: string | Column): Promise<TFilter | null | undefined> {
        return new Promise(resolve => {
            this.getFilterInstance(key, filter => {
                resolve(filter as any);
            })
        });
    }

    private getFilterInstanceImpl(key: string | Column, callback: (filter: IFilter) => void): IFilter | null | undefined {
        const column = this.columnModel.getPrimaryColumn(key);

        if (!column) { return undefined; }

        const filterPromise = this.getFilterComponent(column, 'NO_UI');
        const currentValue = filterPromise && filterPromise.resolveNow<IFilterComp | null>(null, filterComp => filterComp);

        if (currentValue) {
            setTimeout(callback, 0, currentValue);
        } else if (filterPromise) {
            filterPromise.then(comp => {
                callback(comp!);
            });
        }

        return currentValue;
    }

    private warnAdvancedFilters(): void {
        warnOnce('Column Filter API methods have been disabled as Advanced Filters are enabled.');
    }

    public setupAdvancedFilterHeaderComp(eCompToInsertBefore: HTMLElement): void {
        this.advancedFilterService?.getCtrl().setupHeaderComp(eCompToInsertBefore);
    }

    public getHeaderRowCount(): number {
        return this.isAdvancedFilterHeaderActive() ? 1 : 0;
    }

    public getHeaderHeight(): number {
        return this.isAdvancedFilterHeaderActive() ? this.advancedFilterService.getCtrl().getHeaderHeight() : 0;
    }

    private processFilterModelUpdateQueue(): void {
        this.filterModelUpdateQueue.forEach(({ model, source }) => this.setFilterModel(model, source));
        this.filterModelUpdateQueue = [];
        this.columnFilterModelUpdateQueue.forEach(({ key, model, resolve }) => {
            this.setColumnFilterModel(key, model).then(() => resolve());
        });
        this.columnFilterModelUpdateQueue = [];
        this.advancedFilterModelUpdateQueue.forEach(model => this.setAdvancedFilterModel(model));
        this.advancedFilterModelUpdateQueue = [];
    }

    public getColumnFilterModel(key: string | Column): any {
        const filterWrapper = this.getFilterWrapper(key);
        return filterWrapper ? this.getModelFromFilterWrapper(filterWrapper) : null;
    }

    public setColumnFilterModel(key: string | Column, model: any): Promise<void> {
        if (this.isAdvancedFilterEnabled()) {
            this.warnAdvancedFilters();
            return Promise.resolve();
        }
        if (this.dataTypeService.isPendingInference()) {
            let resolve: () => void = () => {};
            const promise = new Promise<void>(res => {
                resolve = res;
            });
            this.columnFilterModelUpdateQueue.push({ key, model, resolve });
            return promise;
        }

        const column = this.columnModel.getPrimaryColumn(key);
        const filterWrapper = column ? this.getOrCreateFilterWrapper(column, 'NO_UI') : null;
        const convertPromise = <T>(promise: AgPromise<T>): Promise<T> => {
            return new Promise(resolve => {
                promise.then(result => resolve(result!));
            });
        };
        return filterWrapper ? convertPromise(this.setModelOnFilterWrapper(filterWrapper.filterPromise!, model)) : Promise.resolve();
        
    }

    private getFilterWrapper(key: string | Column): FilterWrapper | null {
        const column = this.columnModel.getPrimaryColumn(key);
        return column ? this.cachedFilter(column) ?? null : null;
    }

    protected destroy() {
        super.destroy();
        this.allColumnFilters.forEach(filterWrapper => this.disposeFilterWrapper(filterWrapper, 'gridDestroyed'));
        // don't need to destroy the listeners as they are managed listeners
        this.allColumnListeners.clear();
    }
}

export interface FilterWrapper {
    compiledElement: any;
    column: Column;
    filterPromise: AgPromise<IFilterComp> | null;
    compDetails: UserCompDetails | null;
}
