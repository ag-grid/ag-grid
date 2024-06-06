import type { ColumnModel } from '../columns/columnModel';
import type { DataTypeService } from '../columns/dataTypeService';
import { FilterComponent } from '../components/framework/componentTypes';
import type { UserCompDetails, UserComponentFactory } from '../components/framework/userComponentFactory';
import { BeanStub } from '../context/beanStub';
import type { BeanCollection, BeanName } from '../context/context';
import { AgColumn } from '../entities/agColumn';
import type { ColDef } from '../entities/colDef';
import type { RowNode } from '../entities/rowNode';
import type { EventsType } from '../eventKeys';
import type {
    ColumnEventType,
    FilterChangedEventSourceType,
    FilterDestroyedEvent,
    FilterModifiedEvent,
} from '../events';
import { unwrapUserComp } from '../gridApi';
import type { WithoutGridCommon } from '../interfaces/iCommon';
import type { FilterModel, IFilter, IFilterComp, IFilterParams } from '../interfaces/iFilter';
import type { IRowModel } from '../interfaces/iRowModel';
import { ModuleNames } from '../modules/moduleNames';
import { ModuleRegistry } from '../modules/moduleRegistry';
import type { RowRenderer } from '../rendering/rowRenderer';
import { _exists, _jsonEquals } from '../utils/generic';
import { _cloneObject } from '../utils/object';
import { AgPromise } from '../utils/promise';
import type { ValueService } from '../valueService/valueService';
import type { FilterManager } from './filterManager';
import type { IFloatingFilterParams, IFloatingFilterParentCallback } from './floating/floatingFilter';
import { getDefaultFloatingFilterType } from './floating/floatingFilterMapper';

export class ColumnFilterService extends BeanStub {
    beanName: BeanName = 'columnFilterService';

    private valueService: ValueService;
    private columnModel: ColumnModel;
    private rowModel: IRowModel;
    private userComponentFactory: UserComponentFactory;
    private rowRenderer: RowRenderer;
    private dataTypeService?: DataTypeService;
    private filterManager?: FilterManager;

    public wireBeans(beans: BeanCollection): void {
        this.valueService = beans.valueService;
        this.columnModel = beans.columnModel;
        this.rowModel = beans.rowModel;
        this.userComponentFactory = beans.userComponentFactory;
        this.rowRenderer = beans.rowRenderer;
        this.dataTypeService = beans.dataTypeService;
        this.filterManager = beans.filterManager;
    }

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

    // when we're waiting for cell data types to be inferred, we need to defer filter model updates
    private filterModelUpdateQueue: { model: FilterModel | null; source: FilterChangedEventSourceType }[] = [];
    private columnFilterModelUpdateQueue: { key: string | AgColumn; model: any; resolve: () => void }[] = [];

    private initialFilterModel: FilterModel;

    public postConstruct(): void {
        this.addManagedEventListeners({
            gridColumnsChanged: this.onColumnsChanged.bind(this),
            rowDataUpdated: () => this.onNewRowsLoaded('rowDataUpdated'),
            dataTypesInferred: this.processFilterModelUpdateQueue.bind(this),
        });

        this.initialFilterModel = {
            ...(this.gos.get('initialState')?.filter?.filterModel ?? {}),
        };
    }

    public setFilterModel(model: FilterModel | null, source: FilterChangedEventSourceType = 'api'): void {
        if (this.dataTypeService?.isPendingInference()) {
            this.filterModelUpdateQueue.push({ model, source });
            return;
        }

        const allPromises: AgPromise<void>[] = [];
        const previousModel = this.getFilterModel();

        if (model) {
            // mark the filters as we set them, so any active filters left over we stop
            const modelKeys = new Set(Object.keys(model));

            this.allColumnFilters.forEach((filterWrapper, colId) => {
                const newModel = model[colId];

                allPromises.push(this.setModelOnFilterWrapper(filterWrapper.filterPromise!, newModel));
                modelKeys.delete(colId);
            });

            // at this point, processedFields contains data for which we don't have a filter working yet
            modelKeys.forEach((colId) => {
                const column = this.columnModel.getColDefCol(colId) || this.columnModel.getCol(colId);

                if (!column) {
                    console.warn('AG Grid: setFilterModel() - no column found for colId: ' + colId);
                    return;
                }

                if (!column.isFilterAllowed()) {
                    console.warn(
                        'AG Grid: setFilterModel() - unable to fully apply model, filtering disabled for colId: ' +
                            colId
                    );
                    return;
                }

                const filterWrapper = this.getOrCreateFilterWrapper(column);
                if (!filterWrapper) {
                    console.warn(
                        'AG-Grid: setFilterModel() - unable to fully apply model, unable to create filter for colId: ' +
                            colId
                    );
                    return;
                }
                allPromises.push(this.setModelOnFilterWrapper(filterWrapper.filterPromise!, model[colId]));
            });
        } else {
            this.allColumnFilters.forEach((filterWrapper) => {
                allPromises.push(this.setModelOnFilterWrapper(filterWrapper.filterPromise!, null));
            });
        }

        AgPromise.all(allPromises).then(() => {
            const currentModel = this.getFilterModel();

            const columns: AgColumn[] = [];
            this.allColumnFilters.forEach((filterWrapper, colId) => {
                const before = previousModel ? previousModel[colId] : null;
                const after = currentModel ? currentModel[colId] : null;

                if (!_jsonEquals(before, after)) {
                    columns.push(filterWrapper.column);
                }
            });

            if (columns.length > 0) {
                this.filterManager?.onFilterChanged({ columns, source });
            }
        });
    }

    private setModelOnFilterWrapper(filterPromise: AgPromise<IFilterComp>, newModel: any): AgPromise<void> {
        return new AgPromise<void>((resolve) => {
            filterPromise.then((filter) => {
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

            if (_exists(model)) {
                result[key] = model;
            }
        });

        return result;
    }

    private getModelFromFilterWrapper(filterWrapper: FilterWrapper): any {
        // because user can provide filters, we provide useful error checking and messages
        const filterPromise = filterWrapper.filterPromise;
        const filter = filterPromise!.resolveNow(null, (promiseFilter) => promiseFilter);

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

    public disableColumnFilters(): boolean {
        if (this.allColumnFilters.size) {
            this.allColumnFilters.forEach((filterWrapper) =>
                this.disposeFilterWrapper(filterWrapper, 'advancedFilterEnabled')
            );
            return true;
        }
        return false;
    }

    public doAggregateFiltersPass(node: RowNode, filterToSkip?: IFilterComp) {
        return this.doColumnFiltersPass(node, filterToSkip, true);
    }

    // called by:
    // 1) onFilterChanged()
    // 2) onNewRowsLoaded()
    private updateActiveFilters(): void {
        this.activeColumnFilters.length = 0;
        this.activeAggregateFilters.length = 0;

        const isFilterActive = (filter: IFilter | null) => {
            if (!filter) {
                return false;
            } // this never happens, including to avoid compile error
            if (!filter.isFilterActive) {
                console.warn('AG Grid: Filter is missing isFilterActive() method');
                return false;
            }
            return filter.isFilterActive();
        };

        const groupFilterEnabled = !!this.gos.getGroupAggFiltering();

        const isAggFilter = (column: AgColumn) => {
            const isSecondary = !column.isPrimary();
            // the only filters that can appear on secondary columns are groupAgg filters
            if (isSecondary) {
                return true;
            }

            const isShowingPrimaryColumns = !this.columnModel.isPivotActive();
            const isValueActive = column.isValueActive();

            // primary columns are only ever groupAgg filters if a) value is active and b) showing primary columns
            if (!isValueActive || !isShowingPrimaryColumns) {
                return false;
            }

            // from here on we know: isPrimary=true, isValueActive=true, isShowingPrimaryColumns=true
            if (this.columnModel.isPivotMode()) {
                // primary column is pretending to be a pivot column, ie pivotMode=true, but we are
                // still showing primary columns
                return true;
            }
            // we are not pivoting, so we groupFilter when it's an agg column
            return groupFilterEnabled;
        };

        this.allColumnFilters.forEach((filterWrapper) => {
            if (filterWrapper.filterPromise!.resolveNow(false, isFilterActive)) {
                const filterComp = filterWrapper.filterPromise!.resolveNow(null, (filter) => filter);
                if (isAggFilter(filterWrapper.column)) {
                    this.activeAggregateFilters.push(filterComp!);
                } else {
                    this.activeColumnFilters.push(filterComp!);
                }
            }
        });
    }

    private updateFilterFlagInColumns(source: ColumnEventType, additionalEventAttributes?: any): void {
        this.allColumnFilters.forEach((filterWrapper) => {
            const isFilterActive = filterWrapper.filterPromise!.resolveNow(false, (filter) => filter!.isFilterActive());

            filterWrapper.column.setFilterActive(isFilterActive, source, additionalEventAttributes);
        });
    }

    public doColumnFiltersPass(node: RowNode, filterToSkip?: IFilterComp, targetAggregates?: boolean): boolean {
        const { data, aggData } = node;

        const targetedFilters = targetAggregates ? this.activeAggregateFilters : this.activeColumnFilters;
        const targetedData = targetAggregates ? aggData : data;
        for (let i = 0; i < targetedFilters.length; i++) {
            const filter = targetedFilters[i];

            if (filter == null || filter === filterToSkip) {
                continue;
            }

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

    // sometimes (especially in React) the filter can call onFilterChanged when we are in the middle
    // of a render cycle. this would be bad, so we wait for render cycle to complete when this happens.
    // this happens in react when we change React State in the grid (eg setting RowCtrl's in RowContainer)
    // which results in React State getting applied in the main application, triggering a useEffect() to
    // be kicked off adn then the application calling the grid's API. in AG-6554, the custom filter was
    // getting it's useEffect() triggered in this way.
    private callOnFilterChangedOutsideRenderCycle(params: {
        source?: FilterChangedEventSourceType;
        filterInstance?: IFilterComp;
        additionalEventAttributes?: any;
        columns?: AgColumn[];
    }): void {
        const action = () => this.filterManager?.onFilterChanged(params);
        if (this.rowRenderer.isRefreshInProgress()) {
            setTimeout(action, 0);
        } else {
            action();
        }
    }

    public updateBeforeFilterChanged(
        params: {
            filterInstance?: IFilterComp;
            additionalEventAttributes?: any;
        } = {}
    ): void {
        const { filterInstance, additionalEventAttributes } = params;

        this.updateDependantFilters();
        this.updateActiveFilters();
        this.updateFilterFlagInColumns('filterChanged', additionalEventAttributes);

        this.allColumnFilters.forEach((filterWrapper) => {
            if (!filterWrapper.filterPromise) {
                return;
            }
            filterWrapper.filterPromise.then((filter) => {
                if (filter && filter !== filterInstance && filter.onAnyFilterChanged) {
                    filter!.onAnyFilterChanged();
                }
            });
        });

        // because internal events are not async in ag-grid, when the dispatchEvent
        // method comes back, we know all listeners have finished executing.
        this.processingFilterChange = true;
    }

    public updateAfterFilterChanged(): void {
        this.processingFilterChange = false;
    }

    public isSuppressFlashingCellsBecauseFiltering(): boolean {
        // if user has elected to always flash cell changes, then always return false, otherwise we suppress flashing
        // changes when filtering
        const allowShowChangeAfterFilter = this.gos.get('allowShowChangeAfterFilter') ?? false;
        return !allowShowChangeAfterFilter && this.processingFilterChange;
    }

    public onNewRowsLoaded(source: ColumnEventType): void {
        this.allColumnFilters.forEach((filterWrapper) => {
            filterWrapper.filterPromise!.then((filter) => {
                if (filter!.onNewRowsLoaded) {
                    filter!.onNewRowsLoaded();
                }
            });
        });

        this.updateFilterFlagInColumns(source, { afterDataChange: true });
        this.updateActiveFilters();
    }

    private createValueGetter(column: AgColumn): IFilterParams['valueGetter'] {
        return ({ node }) => this.valueService.getValue(column, node as RowNode, true);
    }

    private createGetValue(filterColumn: AgColumn): IFilterParams['getValue'] {
        return (rowNode, column) => {
            const columnToUse = column ? this.columnModel.getCol(column) : filterColumn;
            return columnToUse ? this.valueService.getValue(columnToUse, rowNode, true) : undefined;
        };
    }

    private getFilterComponent(column: AgColumn, createIfDoesNotExist = true): AgPromise<IFilterComp> | null {
        if (createIfDoesNotExist) {
            return this.getOrCreateFilterWrapper(column)?.filterPromise || null;
        }

        const filterWrapper = this.cachedFilter(column);

        return filterWrapper ? filterWrapper.filterPromise : null;
    }

    public isFilterActive(column: AgColumn): boolean {
        const filterWrapper = this.cachedFilter(column);

        return !!filterWrapper && filterWrapper.filterPromise!.resolveNow(false, (filter) => filter!.isFilterActive());
    }

    public getOrCreateFilterWrapper(column: AgColumn): FilterWrapper | null {
        if (!column.isFilterAllowed()) {
            return null;
        }

        let filterWrapper = this.cachedFilter(column);

        if (!filterWrapper) {
            filterWrapper = this.createFilterWrapper(column);
            this.setColumnFilterWrapper(column, filterWrapper);
        }

        return filterWrapper;
    }

    private cachedFilter(column: AgColumn): FilterWrapper | undefined {
        return this.allColumnFilters.get(column.getColId());
    }

    private getDefaultFilter(column: AgColumn): string {
        let defaultFilter;
        if (ModuleRegistry.__isRegistered(ModuleNames.SetFilterModule, this.gridId)) {
            defaultFilter = 'agSetColumnFilter';
        } else {
            const cellDataType = this.dataTypeService?.getBaseDataType(column);
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

    public getDefaultFloatingFilter(column: AgColumn): string {
        let defaultFloatingFilterType: string;
        if (ModuleRegistry.__isRegistered(ModuleNames.SetFilterModule, this.gridId)) {
            defaultFloatingFilterType = 'agSetColumnFloatingFilter';
        } else {
            const cellDataType = this.dataTypeService?.getBaseDataType(column);
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

    private createFilterInstance(column: AgColumn): {
        filterPromise: (() => AgPromise<IFilterComp> | null) | null;
        compDetails: UserCompDetails | null;
    } {
        const defaultFilter = this.getDefaultFilter(column);

        const colDef = column.getColDef();

        let filterInstance: IFilterComp;

        const params: IFilterParams = {
            ...this.createFilterParams(column, colDef),
            filterModifiedCallback: () => this.filterModifiedCallbackFactory(filterInstance, column)(),
            filterChangedCallback: (additionalEventAttributes?: any) =>
                this.filterChangedCallbackFactory(filterInstance, column)(additionalEventAttributes),
            doesRowPassOtherFilter: (node) =>
                this.filterManager ? this.filterManager.doesRowPassOtherFilters(filterInstance, node) : true,
        };

        const compDetails = this.userComponentFactory.getFilterDetails(colDef, params, defaultFilter);
        if (!compDetails) {
            return { filterPromise: null, compDetails: null };
        }
        return {
            filterPromise: () => {
                const filterPromise = compDetails.newAgStackInstance();
                if (filterPromise) {
                    filterPromise.then((r) => (filterInstance = r!));
                }
                return filterPromise;
            },
            compDetails,
        };
    }

    public createFilterParams(column: AgColumn, colDef: ColDef): IFilterParams {
        const params: IFilterParams = this.gos.addGridCommonParams({
            column,
            colDef: _cloneObject(colDef),
            rowModel: this.rowModel,
            filterChangedCallback: () => {},
            filterModifiedCallback: () => {},
            valueGetter: this.createValueGetter(column),
            getValue: this.createGetValue(column),
            doesRowPassOtherFilter: () => true,
        });

        return params;
    }

    private createFilterWrapper(column: AgColumn): FilterWrapper {
        const filterWrapper: FilterWrapper = {
            column: column,
            filterPromise: null,
            compiledElement: null,
            compDetails: null,
        };

        const { filterPromise, compDetails } = this.createFilterInstance(column);
        filterWrapper.filterPromise = filterPromise?.() ?? null;
        filterWrapper.compDetails = compDetails;

        return filterWrapper;
    }

    private onColumnsChanged(): void {
        const columns: AgColumn[] = [];

        this.allColumnFilters.forEach((wrapper, colId) => {
            let currentColumn: AgColumn | null;
            if (wrapper.column.isPrimary()) {
                currentColumn = this.columnModel.getColDefCol(colId);
            } else {
                currentColumn = this.columnModel.getCol(colId);
            }
            // group columns can be recreated with the same colId
            if (currentColumn && currentColumn === wrapper.column) {
                return;
            }

            columns.push(wrapper.column);
            this.disposeFilterWrapper(wrapper, 'columnChanged');
            this.disposeColumnListener(colId);
        });

        if (columns.length > 0) {
            // When a filter changes as a side effect of a column changes,
            // we report 'api' as the source, so that the client can distinguish
            this.filterManager?.onFilterChanged({ columns, source: 'api' });
        } else {
            // onFilterChanged does this already
            this.updateDependantFilters();
        }
    }

    private updateDependantFilters(): void {
        // Group column filters can be dependant on underlying column filters, but don't normally get created until they're used for the first time.
        // Instead, create them by default when any filter changes.
        const groupColumns = this.columnModel.getAutoCols();
        groupColumns?.forEach((groupColumn) => {
            if (groupColumn.getColDef().filter === 'agGroupColumnFilter') {
                this.getOrCreateFilterWrapper(groupColumn);
            }
        });
    }

    // for group filters, can change dynamically whether they are allowed or not
    public isFilterAllowed(column: AgColumn): boolean {
        const isFilterAllowed = column.isFilterAllowed();
        if (!isFilterAllowed) {
            return false;
        }
        const filterWrapper = this.allColumnFilters.get(column.getColId());
        return (
            filterWrapper?.filterPromise?.resolveNow(
                true,
                // defer to filter component isFilterAllowed if it exists
                (filter) =>
                    typeof (filter as any)?.isFilterAllowed === 'function' ? (filter as any)?.isFilterAllowed() : true
            ) ?? true
        );
    }

    public getFloatingFilterCompDetails(column: AgColumn, showParentFilter: () => void): UserCompDetails | undefined {
        const parentFilterInstance = (callback: IFloatingFilterParentCallback<IFilter>) => {
            const filterComponent = this.getFilterComponent(column);

            if (filterComponent == null) {
                return;
            }

            filterComponent.then((instance) => {
                callback(unwrapUserComp(instance!));
            });
        };

        const colDef = column.getColDef();
        const filterParams = {
            ...this.createFilterParams(column, colDef),
            filterChangedCallback: () =>
                parentFilterInstance((filterInstance) =>
                    this.filterChangedCallbackFactory(filterInstance as IFilterComp, column)()
                ),
        };
        const finalFilterParams = this.userComponentFactory.mergeParamsWithApplicationProvidedParams(
            colDef,
            FilterComponent,
            filterParams
        );

        let defaultFloatingFilterType = getDefaultFloatingFilterType(this.frameworkOverrides, colDef, () =>
            this.getDefaultFloatingFilter(column)
        );

        if (defaultFloatingFilterType == null) {
            defaultFloatingFilterType = 'agReadOnlyFloatingFilter';
        }

        const params: WithoutGridCommon<IFloatingFilterParams<IFilter>> = {
            column: column,
            filterParams: finalFilterParams,
            currentParentModel: () => this.getCurrentFloatingFilterParentModel(column),
            parentFilterInstance,
            showParentFilter,
            suppressFilterButton: false, // This one might be overridden from the colDef
        };

        return this.userComponentFactory.getFloatingFilterCompDetails(colDef, params, defaultFloatingFilterType);
    }

    public getCurrentFloatingFilterParentModel(column: AgColumn): any {
        const filterComponent = this.getFilterComponent(column, false);

        return filterComponent ? filterComponent.resolveNow(null, (filter) => filter && filter.getModel()) : null;
    }

    // destroys the filter, so it no longer takes part
    public destroyFilter(column: AgColumn, source: 'api' | 'columnChanged' | 'paramsUpdated' = 'api'): void {
        const colId = column.getColId();
        const filterWrapper = this.allColumnFilters.get(colId);

        this.disposeColumnListener(colId);

        delete this.initialFilterModel[colId];

        if (filterWrapper) {
            this.disposeFilterWrapper(filterWrapper, source);
            this.filterManager?.onFilterChanged({
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

    private disposeFilterWrapper(
        filterWrapper: FilterWrapper,
        source: 'api' | 'columnChanged' | 'gridDestroyed' | 'advancedFilterEnabled' | 'paramsUpdated'
    ): void {
        filterWrapper.filterPromise!.then((filter) => {
            this.destroyBean(filter);

            filterWrapper.column.setFilterActive(false, 'filterDestroyed');

            this.allColumnFilters.delete(filterWrapper.column.getColId());

            const event: WithoutGridCommon<FilterDestroyedEvent> = {
                type: 'filterDestroyed',
                source,
                column: filterWrapper.column,
            };
            this.eventService.dispatchEvent(event);
        });
    }

    private filterModifiedCallbackFactory(filter: IFilterComp<any>, column: AgColumn<any>) {
        return () => {
            const event: WithoutGridCommon<FilterModifiedEvent> = {
                type: 'filterModified',
                column,
                filterInstance: filter,
            };

            this.eventService.dispatchEvent(event);
        };
    }

    private filterChangedCallbackFactory(filter: IFilterComp<any>, column: AgColumn<any>) {
        return (additionalEventAttributes?: any) => {
            const source: FilterChangedEventSourceType = additionalEventAttributes?.source ?? 'columnFilter';
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
        const { compDetails } = column.isFilterAllowed() ? this.createFilterInstance(column) : { compDetails: null };

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
        filterWrapper.filterPromise.then((filter) => {
            const shouldRefreshFilter = filter?.refresh
                ? filter.refresh({
                      ...this.createFilterParams(column, column.getColDef()),
                      filterModifiedCallback: this.filterModifiedCallbackFactory(filter, column),
                      filterChangedCallback: this.filterChangedCallbackFactory(filter, column),
                      doesRowPassOtherFilter: (node) =>
                          this.filterManager ? this.filterManager.doesRowPassOtherFilters(filter, node) : true,
                      ...newFilterParams,
                  })
                : true;
            // framework wrapper always implements optional methods, but returns null if no underlying method
            if (shouldRefreshFilter === false) {
                this.destroyFilter(column, 'paramsUpdated');
            }
        });
    }

    private setColumnFilterWrapper(column: AgColumn, filterWrapper: FilterWrapper): void {
        const colId = column.getColId();
        this.allColumnFilters.set(colId, filterWrapper);
        this.allColumnListeners.set(
            colId,
            this.addManagedListener(column, 'colDefChanged', () => this.checkDestroyFilter(colId))
        );
    }

    public areFilterCompsDifferent(
        oldCompDetails: UserCompDetails | null,
        newCompDetails: UserCompDetails | null
    ): boolean {
        if (!newCompDetails || !oldCompDetails) {
            return true;
        }
        const { componentClass: oldComponentClass } = oldCompDetails;
        const { componentClass: newComponentClass } = newCompDetails;
        const isSameComponentClass =
            oldComponentClass === newComponentClass ||
            // react hooks returns new wrappers, so check nested render method
            (oldComponentClass?.render &&
                newComponentClass?.render &&
                oldComponentClass.render === newComponentClass.render);
        return !isSameComponentClass;
    }

    public hasFloatingFilters(): boolean {
        const gridColumns = this.columnModel.getCols();
        return gridColumns.some((col) => col.getColDef().floatingFilter);
    }

    public getFilterInstance<TFilter extends IFilter>(
        key: string | AgColumn,
        callback?: (filter: TFilter | null) => void
    ): TFilter | null | undefined {
        const res = this.getFilterInstanceImpl(key, (instance) => {
            if (!callback) {
                return;
            }
            const unwrapped = unwrapUserComp(instance) as any;
            callback(unwrapped);
        });
        const unwrapped = unwrapUserComp(res);
        return unwrapped as any;
    }

    public getColumnFilterInstance<TFilter extends IFilter>(
        key: string | AgColumn
    ): Promise<TFilter | null | undefined> {
        return new Promise((resolve) => {
            this.getFilterInstance(key, (filter) => {
                resolve(filter as any);
            });
        });
    }

    private getFilterInstanceImpl(
        key: string | AgColumn,
        callback: (filter: IFilter) => void
    ): IFilter | null | undefined {
        const column = this.columnModel.getColDefCol(key);

        if (!column) {
            return undefined;
        }

        const filterPromise = this.getFilterComponent(column);
        const currentValue =
            filterPromise && filterPromise.resolveNow<IFilterComp | null>(null, (filterComp) => filterComp);

        if (currentValue) {
            setTimeout(callback, 0, currentValue);
        } else if (filterPromise) {
            filterPromise.then((comp) => {
                callback(comp!);
            });
        }

        return currentValue;
    }

    private processFilterModelUpdateQueue(): void {
        this.filterModelUpdateQueue.forEach(({ model, source }) => this.setFilterModel(model, source));
        this.filterModelUpdateQueue = [];
        this.columnFilterModelUpdateQueue.forEach(({ key, model, resolve }) => {
            this.setColumnFilterModel(key, model).then(() => resolve());
        });
        this.columnFilterModelUpdateQueue = [];
    }

    public getColumnFilterModel(key: string | AgColumn): any {
        const filterWrapper = this.getFilterWrapper(key);
        return filterWrapper ? this.getModelFromFilterWrapper(filterWrapper) : null;
    }

    public setColumnFilterModel(key: string | AgColumn, model: any): Promise<void> {
        if (this.dataTypeService?.isPendingInference()) {
            let resolve: () => void = () => {};
            const promise = new Promise<void>((res) => {
                resolve = res;
            });
            this.columnFilterModelUpdateQueue.push({ key, model, resolve });
            return promise;
        }

        const column = this.columnModel.getColDefCol(key);
        const filterWrapper = column ? this.getOrCreateFilterWrapper(column) : null;
        const convertPromise = <T>(promise: AgPromise<T>): Promise<T> => {
            return new Promise((resolve) => {
                promise.then((result) => resolve(result!));
            });
        };
        return filterWrapper
            ? convertPromise(this.setModelOnFilterWrapper(filterWrapper.filterPromise!, model))
            : Promise.resolve();
    }

    private getFilterWrapper(key: string | AgColumn): FilterWrapper | null {
        const column = this.columnModel.getColDefCol(key);
        return column ? this.cachedFilter(column) ?? null : null;
    }

    public override destroy() {
        super.destroy();
        this.allColumnFilters.forEach((filterWrapper) => this.disposeFilterWrapper(filterWrapper, 'gridDestroyed'));
        // don't need to destroy the listeners as they are managed listeners
        this.allColumnListeners.clear();
    }
}

export interface FilterWrapper {
    compiledElement: any;
    column: AgColumn;
    filterPromise: AgPromise<IFilterComp> | null;
    compDetails: UserCompDetails | null;
}
