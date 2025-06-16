import { _unwrapUserComp } from '../components/framework/unwrapUserComp';
import {
    _getFilterCompKeys,
    _getFilterDetails,
    _getFloatingFilterCompDetails,
    _mergeFilterParamsWithApplicationProvidedParams,
} from '../components/framework/userCompUtils';
import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanName } from '../context/context';
import type { AgColumn } from '../entities/agColumn';
import type { ColDef, ValueGetterFunc } from '../entities/colDef';
import type { BaseCellDataType, CoreDataTypeDefinition, DataTypeFormatValueFunc } from '../entities/dataType';
import type { RowNode } from '../entities/rowNode';
import type { AgEvent, ColumnEventType, FilterChangedEventSourceType } from '../events';
import {
    _addGridCommonParams,
    _getGroupAggFiltering,
    _isClientSideRowModel,
    _isSetFilterByDefault,
} from '../gridOptionsUtils';
import type { Column } from '../interfaces/iColumn';
import type { WithoutGridCommon } from '../interfaces/iCommon';
import { isColumnFilterComp } from '../interfaces/iFilter';
import type {
    BaseFilterParams,
    ColumnFilterState,
    CreateFilterHandlerFunc,
    DoesFilterPassParams,
    FilterAction,
    FilterDisplayComp,
    FilterDisplayParams,
    FilterDisplayState,
    FilterHandler,
    FilterHandlerBaseParams,
    FilterModel,
    FilterWrapperParams,
    IFilter,
    IFilterComp,
    IFilterDef,
    IFilterParams,
} from '../interfaces/iFilter';
import type { UserCompDetails } from '../interfaces/iUserCompDetails';
import { _exists, _jsonEquals } from '../utils/generic';
import { AgPromise } from '../utils/promise';
import { _error, _warn } from '../validation/logging';
import type { FilterHandlerName, FilterUi, FilterWrapper, LegacyFilterWrapper } from './columnFilterUtils';
import {
    FILTER_HANDLERS,
    FILTER_HANDLER_MAP,
    _getFilterModel,
    _refreshHandlerAndUi,
    _updateFilterModel,
    getAndRefreshFilterUi,
    getFilterUiFromWrapper,
} from './columnFilterUtils';
import { _getDefaultSimpleFilter, _getFilterParamsForDataType } from './filterDataTypeUtils';
import type {
    FloatingFilterDisplayParams,
    IFloatingFilterParams,
    IFloatingFilterParentCallback,
} from './floating/floatingFilter';
import { _getDefaultFloatingFilterType } from './floating/floatingFilterMapper';

interface CompDoesFilterPassWrapper {
    isHandler: false;
    colId: string;
    comp: IFilterComp;
}

interface HandlerDoesFilterPassWrapper {
    isHandler: true;
    colId: string;
    handler: FilterHandler;
    handlerParams: FilterHandlerBaseParams;
}

type DoesFilterPassWrapper = CompDoesFilterPassWrapper | HandlerDoesFilterPassWrapper;

export interface FilterDisplayWrapper {
    comp: IFilterComp | FilterDisplayComp;
    params: IFilterParams | FilterDisplayParams;
    isHandler: boolean;
}

export interface FilterParamsChangedEvent extends AgEvent<'filterParamsChanged'> {
    column: AgColumn;
    params: IFilterParams | FilterDisplayParams;
}

export interface FilterStateChangedEvent extends AgEvent<'filterStateChanged'> {
    column: AgColumn;
    state: FilterDisplayState;
}

export interface FilterActionEvent extends AgEvent<'filterAction'> {
    column: AgColumn;
    action: FilterAction;
    event?: KeyboardEvent;
}

export interface FilterGlobalButtonsEvent extends AgEvent<'filterGlobalButtons'> {
    isGlobal: boolean;
}

/** Used for non-CSRM handlers */
const DUMMY_HANDLER = {
    filterHandler: () => ({
        doesFilterPass: () => true,
    }),
};

export class ColumnFilterService
    extends BeanStub<'filterParamsChanged' | 'filterStateChanged' | 'filterAction' | 'filterGlobalButtons'>
    implements NamedBean
{
    beanName: BeanName = 'colFilter';

    private allColumnFilters = new Map<string, FilterWrapper>();
    private allColumnListeners = new Map<string, (() => null) | undefined>();
    private activeAggregateFilters: DoesFilterPassWrapper[] = [];
    private activeColumnFilters: DoesFilterPassWrapper[] = [];

    // this is true when the grid is processing the filter change. this is used by the cell comps, so that they
    // don't flash when data changes due to filter changes. there is no need to flash when filter changes as the
    // user is in control, so doesn't make sense to show flashing changes. for example, go to main demo where
    // this feature is turned off (hack code to always return false for isSuppressFlashingCellsBecauseFiltering(), put in)
    // 100,000 rows and group by country. then do some filtering. all the cells flash, which is silly.
    private processingFilterChange = false;

    // when we're waiting for cell data types to be inferred, we need to defer filter model updates
    private modelUpdates: { model: FilterModel | null; source: FilterChangedEventSourceType }[] = [];
    private columnModelUpdates: { key: string | AgColumn; model: any; resolve: () => void }[] = [];

    public initialModel: FilterModel;
    /** This may not contain the model for non-handler columns */
    public model: FilterModel;
    /** This contains the UI state for handler columns */
    private state: Map<string, FilterDisplayState> = new Map();
    private handlerMap: { -readonly [K in keyof typeof FILTER_HANDLER_MAP]?: (typeof FILTER_HANDLER_MAP)[K] } = {
        ...FILTER_HANDLER_MAP,
    };
    public isGlobalButtons: boolean = false;

    public postConstruct(): void {
        this.addManagedEventListeners({
            gridColumnsChanged: this.onColumnsChanged.bind(this),
            beforeRefreshModel: ({ params, groupsChanged }) => {
                // We listen to both row data updated and treeData changed as the SetFilter needs it
                if (groupsChanged || params.rowDataUpdated) {
                    this.onNewRowsLoaded('rowDataUpdated');
                }
            },
            dataTypesInferred: this.processFilterModelUpdateQueue.bind(this),
        });

        const gos = this.gos;
        const initialFilterModel = {
            ...(gos.get('initialState')?.filter?.filterModel ?? {}),
        };
        this.initialModel = initialFilterModel;
        this.model = {
            ...initialFilterModel,
        };
        if (!gos.get('enableFilterHandlers')) {
            delete this.handlerMap['agMultiColumnFilter'];
        }
    }

    public setModel(model: FilterModel | null, source: FilterChangedEventSourceType = 'api'): void {
        const { colModel, dataTypeSvc, filterManager } = this.beans;
        if (dataTypeSvc?.isPendingInference) {
            this.modelUpdates.push({ model, source });
            return;
        }

        const allPromises: AgPromise<void>[] = [];
        const previousModel = this.getModel(true);

        if (model) {
            // mark the filters as we set them, so any active filters left over we stop
            const modelKeys = new Set(Object.keys(model));

            this.allColumnFilters.forEach((filterWrapper, colId) => {
                const newModel = model[colId];

                allPromises.push(this.setModelOnFilterWrapper(filterWrapper, newModel));
                modelKeys.delete(colId);
            });

            // at this point, processedFields contains data for which we don't have a filter working yet
            modelKeys.forEach((colId) => {
                const column = colModel.getColDefCol(colId) || colModel.getCol(colId);

                if (!column) {
                    _warn(62, { colId });
                    return;
                }

                if (!column.isFilterAllowed()) {
                    _warn(63, { colId });
                    return;
                }

                const filterWrapper = this.getOrCreateFilterWrapper(column, true);
                if (!filterWrapper) {
                    _warn(64, { colId });
                    return;
                }
                allPromises.push(this.setModelOnFilterWrapper(filterWrapper, model[colId], true));
            });
        } else {
            this.model = {};
            this.allColumnFilters.forEach((filterWrapper) => {
                allPromises.push(this.setModelOnFilterWrapper(filterWrapper, null));
            });
        }

        AgPromise.all(allPromises).then(() => {
            const currentModel = this.getModel(true);

            const columns: AgColumn[] = [];
            this.allColumnFilters.forEach((filterWrapper, colId) => {
                const before = previousModel ? previousModel[colId] : null;
                const after = currentModel ? currentModel[colId] : null;

                if (!_jsonEquals(before, after)) {
                    columns.push(filterWrapper.column);
                }
            });

            if (columns.length > 0) {
                filterManager?.onFilterChanged({ columns, source });
            }
        });
    }

    public getModel(excludeInitialState?: boolean): FilterModel {
        const result: FilterModel = {};

        const {
            allColumnFilters,
            initialModel,
            beans: { colModel },
        } = this;

        allColumnFilters.forEach((filterWrapper, key) => {
            const model = this.getModelFromFilterWrapper(filterWrapper);

            if (_exists(model)) {
                result[key] = model;
            }
        });

        if (!excludeInitialState) {
            for (const colId of Object.keys(initialModel)) {
                const model = initialModel[colId];
                if (_exists(model) && !allColumnFilters.has(colId) && colModel.getCol(colId)?.isFilterAllowed()) {
                    result[colId] = model;
                }
            }
        }

        return result;
    }

    public setState(
        model: FilterModel | null,
        state: ColumnFilterState | null,
        source: FilterChangedEventSourceType = 'api'
    ) {
        this.state.clear();
        if (state) {
            for (const colId of Object.keys(state)) {
                const newState = state[colId];
                this.state.set(colId, {
                    model: _getFilterModel(this.model, colId),
                    state: newState,
                });
            }
        }
        this.setModel(model, source);
    }

    public getState(): ColumnFilterState | undefined {
        const state = this.state;
        if (!state.size) {
            return undefined;
        }
        const newState: ColumnFilterState = {};
        let hasNewState = false;
        state.forEach((colState, colId) => {
            const actualState = colState.state;
            if (actualState != null) {
                hasNewState = true;
                newState[colId] = actualState;
            }
        });
        return hasNewState ? newState : undefined;
    }

    private getModelFromFilterWrapper(filterWrapper: FilterWrapper): any {
        const column = filterWrapper.column;
        const colId = column.getColId();
        if (filterWrapper.isHandler) {
            return _getFilterModel(this.model, colId);
        }
        const filter = filterWrapper.filter;
        if (filter) {
            if (typeof filter.getModel !== 'function') {
                _warn(66);
                return null;
            }

            return filter.getModel();
        }
        // filter still being created. return initial state if it exists and hasn't been applied yet
        return _getFilterModel(this.initialModel, colId);
    }

    public isFilterPresent(): boolean {
        return this.activeColumnFilters.length > 0;
    }

    public isAggFilterPresent(): boolean {
        return !!this.activeAggregateFilters.length;
    }

    public disableFilters(): boolean {
        this.initialModel = {};
        const { allColumnFilters } = this;
        if (allColumnFilters.size) {
            allColumnFilters.forEach((filterWrapper) =>
                this.disposeFilterWrapper(filterWrapper, 'advancedFilterEnabled')
            );
            return true;
        }
        return false;
    }

    private updateActiveFilters(): AgPromise<void> {
        const isFilterActive = (filter: IFilter | null) => {
            if (!filter) {
                return false;
            } // this never happens, including to avoid compile error
            if (!filter.isFilterActive) {
                _warn(67);
                return false;
            }
            return filter.isFilterActive();
        };

        const { colModel, gos } = this.beans;
        const groupFilterEnabled = !!_getGroupAggFiltering(gos);

        const isAggFilter = (column: AgColumn) => {
            const isSecondary = !column.isPrimary();
            // the only filters that can appear on secondary columns are groupAgg filters
            if (isSecondary) {
                return true;
            }

            const isShowingPrimaryColumns = !colModel.isPivotActive();
            const isValueActive = column.isValueActive();

            // primary columns are only ever groupAgg filters if a) value is active and b) showing primary columns
            if (!isValueActive || !isShowingPrimaryColumns) {
                return false;
            }

            // from here on we know: isPrimary=true, isValueActive=true, isShowingPrimaryColumns=true
            if (colModel.isPivotMode()) {
                // primary column is pretending to be a pivot column, ie pivotMode=true, but we are
                // still showing primary columns
                return true;
            }
            // we are not pivoting, so we groupFilter when it's an agg column
            return groupFilterEnabled;
        };

        const activeAggregateFilters: DoesFilterPassWrapper[] = [];
        const activeColumnFilters: DoesFilterPassWrapper[] = [];

        const addFilter = (column: AgColumn, filterActive: boolean, doesFilterPassWrapper: DoesFilterPassWrapper) => {
            if (filterActive) {
                if (isAggFilter(column)) {
                    activeAggregateFilters.push(doesFilterPassWrapper);
                } else {
                    activeColumnFilters.push(doesFilterPassWrapper);
                }
            }
        };

        const promises: AgPromise<void>[] = [];
        this.allColumnFilters.forEach((filterWrapper) => {
            const column = filterWrapper.column;
            const colId = column.getColId();
            if (filterWrapper.isHandler) {
                promises.push(
                    AgPromise.resolve().then(() => {
                        addFilter(column, this.isHandlerActive(column), {
                            colId,
                            isHandler: true,
                            handler: filterWrapper.handler,
                            handlerParams: filterWrapper.handlerParams,
                        });
                    })
                );
            } else {
                const promise = getFilterUiFromWrapper<IFilterComp>(filterWrapper);
                if (promise) {
                    promises.push(
                        promise.then((filter) => {
                            addFilter(column, isFilterActive(filter), {
                                colId,
                                isHandler: false,
                                comp: filter!,
                            });
                        })
                    );
                }
            }
        });
        return AgPromise.all(promises).then(() => {
            this.activeAggregateFilters = activeAggregateFilters;
            this.activeColumnFilters = activeColumnFilters;
        });
    }

    private updateFilterFlagInColumns(
        source: ColumnEventType,
        additionalEventAttributes?: any
    ): AgPromise<(void | null)[]> {
        const promises: AgPromise<void>[] = [];
        this.allColumnFilters.forEach((filterWrapper) => {
            const column = filterWrapper.column;
            if (filterWrapper.isHandler) {
                promises.push(
                    AgPromise.resolve().then(() => {
                        this.setColFilterActive(
                            column,
                            this.isHandlerActive(column),
                            source,
                            additionalEventAttributes
                        );
                    })
                );
            } else {
                const promise = getFilterUiFromWrapper<IFilterComp>(filterWrapper);
                if (promise) {
                    promises.push(
                        promise.then((filter) => {
                            this.setColFilterActive(
                                column,
                                filter!.isFilterActive(),
                                source,
                                additionalEventAttributes
                            );
                        })
                    );
                }
            }
        });
        this.beans.groupFilter?.updateFilterFlags(source, additionalEventAttributes);
        return AgPromise.all(promises);
    }

    public doFiltersPass(node: RowNode, colIdToSkip?: string, targetAggregates?: boolean): boolean {
        const { data, aggData } = node;

        const targetedFilters = targetAggregates ? this.activeAggregateFilters : this.activeColumnFilters;
        const targetedData = targetAggregates ? aggData : data;
        const model = this.model;
        for (let i = 0; i < targetedFilters.length; i++) {
            const filter = targetedFilters[i];
            const { colId, isHandler } = filter;

            if (colId === colIdToSkip) {
                continue;
            }

            if (isHandler) {
                const { handler, handlerParams } = filter;
                if (
                    !handler.doesFilterPass({
                        node,
                        data: targetedData,
                        model: _getFilterModel(model, colId),
                        handlerParams,
                    })
                ) {
                    return false;
                }
            } else {
                const comp = filter.comp;
                if (typeof comp.doesFilterPass !== 'function') {
                    // because users can do custom filters, give nice error message
                    _error(91);
                    continue;
                }

                if (!comp.doesFilterPass({ node, data: targetedData })) {
                    return false;
                }
            }
        }

        return true;
    }

    public getHandlerParams(column: Column): FilterHandlerBaseParams | undefined {
        const wrapper = this.allColumnFilters.get(column.getColId());
        return wrapper?.isHandler ? wrapper.handlerParams : undefined;
    }

    // sometimes (especially in React) the filter can call onFilterChanged when we are in the middle
    // of a render cycle. this would be bad, so we wait for render cycle to complete when this happens.
    // this happens in react when we change React State in the grid (eg setting RowCtrl's in RowContainer)
    // which results in React State getting applied in the main application, triggering a useEffect() to
    // be kicked off adn then the application calling the grid's API. in AG-6554, the custom filter was
    // getting it's useEffect() triggered in this way.
    private callOnFilterChangedOutsideRenderCycle(params: {
        source: FilterChangedEventSourceType;
        additionalEventAttributes?: any;
        column?: AgColumn;
        columns: AgColumn[];
    }): void {
        const { rowRenderer, filterManager } = this.beans;
        const action = () => {
            if (this.isAlive()) {
                filterManager?.onFilterChanged(params);
            }
        };
        if (rowRenderer.isRefreshInProgress()) {
            setTimeout(action, 0);
        } else {
            action();
        }
    }

    public updateBeforeFilterChanged(
        params: {
            column?: AgColumn;
            additionalEventAttributes?: any;
        } = {}
    ): AgPromise<void> {
        const { column, additionalEventAttributes } = params;

        const colId = column?.getColId();
        return this.updateActiveFilters().then(() =>
            this.updateFilterFlagInColumns('filterChanged', additionalEventAttributes).then(() => {
                this.allColumnFilters.forEach((filterWrapper) => {
                    const { column: filterColumn, isHandler } = filterWrapper;
                    if (colId === filterColumn.getColId()) {
                        return;
                    }
                    if (isHandler) {
                        filterWrapper.handler.onAnyFilterChanged?.();
                    }
                    getFilterUiFromWrapper(filterWrapper, isHandler)?.then((filter) => {
                        if (typeof filter?.onAnyFilterChanged === 'function') {
                            filter.onAnyFilterChanged();
                        }
                    });
                });

                // because internal events are not async in ag-grid, when the dispatchEvent
                // method comes back, we know all listeners have finished executing.
                this.processingFilterChange = true;
            })
        ) as AgPromise<void>;
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

    private onNewRowsLoaded(source: ColumnEventType): void {
        const promises: AgPromise<void>[] = [];
        this.allColumnFilters.forEach((filterWrapper) => {
            const isHandler = filterWrapper.isHandler;
            if (isHandler) {
                filterWrapper.handler.onNewRowsLoaded?.();
            }
            const promise = getFilterUiFromWrapper(filterWrapper, isHandler);
            if (promise) {
                promises.push(
                    promise.then((filter) => {
                        filter!.onNewRowsLoaded?.();
                    })
                );
            }
        });
        AgPromise.all(promises)
            .then(() => this.updateFilterFlagInColumns(source, { afterDataChange: true }))
            .then(() => this.updateActiveFilters());
    }

    public createGetValue(
        filterColumn: AgColumn,
        filterValueGetterOverride?: string | ValueGetterFunc
    ): IFilterParams['getValue'] {
        const { filterValueSvc, colModel } = this.beans;
        return (rowNode, column) => {
            const columnToUse = column ? colModel.getCol(column) : filterColumn;
            return columnToUse ? filterValueSvc!.getValue(columnToUse, rowNode, filterValueGetterOverride) : undefined;
        };
    }

    public isFilterActive(column: AgColumn): boolean {
        const filterWrapper = this.cachedFilter(column);
        if (filterWrapper?.isHandler) {
            return this.isHandlerActive(column);
        }
        const filter = filterWrapper?.filter;
        if (filter) {
            return filter.isFilterActive();
        }
        // if not created, should only be active if there's a model
        return _getFilterModel(this.initialModel, column.getColId()) != null;
    }

    private isHandlerActive(column: AgColumn): boolean {
        // all the existing filter code uses `_exists` rather than not null,
        // so need to keep handling `''` until all the code is updated to do a simple null check
        const active = _exists(_getFilterModel(this.model, column.getColId()));
        if (active) {
            return active;
        }
        const groupFilter = this.beans.groupFilter;
        return groupFilter?.isGroupFilter(column) ? groupFilter.isFilterActive(column) : false;
    }

    public getOrCreateFilterUi(column: AgColumn): AgPromise<IFilterComp> | null {
        const filterWrapper = this.getOrCreateFilterWrapper(column, true);
        return filterWrapper ? getFilterUiFromWrapper(filterWrapper) : null;
    }

    public getFilterUiForDisplay(column: AgColumn): AgPromise<FilterDisplayWrapper> | null {
        const filterWrapper = this.getOrCreateFilterWrapper(column, true);
        if (!filterWrapper) {
            return null;
        }
        const compPromise = getFilterUiFromWrapper(filterWrapper);
        if (!compPromise) {
            return null;
        }
        return compPromise.then((comp) => ({
            comp: comp!,
            params: filterWrapper.filterUi!.filterParams,
            isHandler: filterWrapper.isHandler,
        }));
    }

    public getHandler(column: AgColumn, createIfMissing?: boolean): FilterHandler | undefined {
        const filterWrapper = this.getOrCreateFilterWrapper(column, createIfMissing);
        return filterWrapper?.isHandler ? filterWrapper.handler : undefined;
    }

    private getOrCreateFilterWrapper(column: AgColumn, createIfMissing?: boolean): FilterWrapper | undefined {
        if (!column.isFilterAllowed()) {
            return undefined;
        }

        let filterWrapper = this.cachedFilter(column);

        if (!filterWrapper && createIfMissing) {
            filterWrapper = this.createFilterWrapper(column);
            this.setColumnFilterWrapper(column, filterWrapper);
        }

        return filterWrapper;
    }

    private cachedFilter(column: AgColumn): FilterWrapper | undefined {
        return this.allColumnFilters.get(column.getColId());
    }

    private getDefaultFilter(column: AgColumn, isFloating: boolean = false): string {
        return this.getDefaultFilterFromDataType(() => this.beans.dataTypeSvc?.getBaseDataType(column), isFloating);
    }

    private getDefaultFilterFromDataType(
        getCellDataType: () => BaseCellDataType | undefined,
        isFloating: boolean = false
    ): string {
        if (_isSetFilterByDefault(this.gos)) {
            return isFloating ? 'agSetColumnFloatingFilter' : 'agSetColumnFilter';
        }
        return _getDefaultSimpleFilter(getCellDataType(), isFloating);
    }

    public getDefaultFloatingFilter(column: AgColumn): string {
        return this.getDefaultFilter(column, true);
    }

    private createFilterComp(
        column: AgColumn,
        filterDef: IFilterDef,
        defaultFilter: string,
        getFilterParams: (defaultParams: BaseFilterParams, isHandler: boolean) => BaseFilterParams,
        isHandler: boolean,
        source: 'init' | 'colDef'
    ): {
        compDetails: UserCompDetails;
        createFilterUi: (update?: boolean) => AgPromise<IFilterComp>;
    } | null {
        const createFilterCompDetails = () => {
            const params = this.createFilterCompParams(column, isHandler, source);
            const updatedParams = getFilterParams(params, isHandler);

            return _getFilterDetails(this.beans.userCompFactory, filterDef, updatedParams, defaultFilter);
        };
        const compDetails = createFilterCompDetails();
        if (!compDetails) {
            return null;
        }

        const createFilterUi = (update?: boolean) => {
            return (update ? createFilterCompDetails()! : compDetails).newAgStackInstance();
        };
        return {
            compDetails,
            createFilterUi,
        };
    }

    public createFilterInstance(
        column: AgColumn,
        filterDef: IFilterDef,
        defaultFilter: string,
        getFilterParams: (defaultParams: BaseFilterParams, isHandler: boolean) => BaseFilterParams
    ): {
        compDetails: UserCompDetails | null;
        handler?: FilterHandler;
        handlerGenerator?: CreateFilterHandlerFunc | FilterHandlerName | ((params: DoesFilterPassParams) => boolean);
        handlerParams?: FilterHandlerBaseParams;
        createFilterUi: ((update?: boolean) => AgPromise<IFilterComp>) | null;
    } {
        const selectableFilter = this.beans.selectableFilter;
        if (selectableFilter?.isSelectable(filterDef)) {
            filterDef = selectableFilter.getFilterDef(column, filterDef);
        }
        const { handler, handlerParams, handlerGenerator } = this.createHandler(column, filterDef, defaultFilter) ?? {};

        const filterCompDetails = this.createFilterComp(
            column,
            filterDef,
            defaultFilter,
            getFilterParams,
            !!handler,
            'init'
        );

        if (!filterCompDetails) {
            return {
                compDetails: null,
                createFilterUi: null,
                handler,
                handlerGenerator,
                handlerParams,
            };
        }

        const { compDetails, createFilterUi } = filterCompDetails;

        if (this.isGlobalButtons) {
            const hasLocalButtons = !!(compDetails.params as FilterWrapperParams)?.buttons?.length;
            if (!hasLocalButtons) {
                _warn(281, { colId: column.getColId() });
            }
        }

        return {
            compDetails,
            handler,
            handlerGenerator,
            handlerParams,
            createFilterUi,
        };
    }

    public createBaseFilterParams(column: AgColumn, forFloatingFilter?: boolean): BaseFilterParams {
        const { filterManager, rowModel } = this.beans;
        return _addGridCommonParams(this.gos, {
            column,
            colDef: column.getColDef(),
            getValue: this.createGetValue(column),
            doesRowPassOtherFilter: forFloatingFilter
                ? () => true
                : (node) => filterManager?.doesRowPassOtherFilters(column.getColId(), node as RowNode) ?? true,
            // to avoid breaking changes to `filterParams` defined as functions
            // we need to provide the below options even though they are not valid for handlers
            rowModel,
        });
    }

    private createFilterCompParams(
        column: AgColumn,
        useHandler: boolean,
        source: 'init' | 'colDef',
        forFloatingFilter?: boolean
    ): BaseFilterParams {
        const filterChangedCallback = this.filterChangedCallbackFactory(column);

        const params: IFilterParams = this.createBaseFilterParams(column, forFloatingFilter) as IFilterParams;
        params.filterChangedCallback = filterChangedCallback;
        params.filterModifiedCallback = forFloatingFilter
            ? () => {}
            : (additionalEventAttributes?: any) => this.filterModified(column, additionalEventAttributes);

        if (useHandler) {
            const displayParams = params as unknown as FilterDisplayParams;
            const colId = column.getColId();
            const model = _getFilterModel(this.model, colId);
            displayParams.model = model;
            displayParams.state = this.state.get(colId) ?? {
                model,
            };
            displayParams.onModelChange = (model, additionalEventAttributes) => {
                this.updateStoredModel(colId, model);
                this.refreshHandlerAndUi(column, model, 'ui').then(() => {
                    filterChangedCallback({ ...additionalEventAttributes, source: 'columnFilter' });
                });
            };
            displayParams.onStateChange = (state) => {
                this.updateState(column, state);
                this.updateOrRefreshFilterUi(column);
            };
            displayParams.onAction = (action, additionalEventAttributes, event) => {
                this.updateModel(column, action, additionalEventAttributes);
                this.dispatchLocalEvent<FilterActionEvent>({
                    type: 'filterAction',
                    column,
                    action,
                    event,
                });
            };
            displayParams.getHandler = () => this.getHandler(column, true)!;
            displayParams.onUiChange = (additionalEventAttributes?: any) =>
                this.filterUiChanged(column, additionalEventAttributes);
            displayParams.source = source;
        }

        return params;
    }

    private createFilterUiForHandler(
        compDetails: UserCompDetails | null,
        createFilterUi: ((update?: boolean) => AgPromise<FilterDisplayComp>) | null
    ): FilterUi<FilterDisplayComp, FilterDisplayParams> | null {
        return createFilterUi
            ? {
                  created: false,
                  create: createFilterUi,
                  filterParams: compDetails!.params,
                  compDetails: compDetails!,
              }
            : null;
    }

    private createFilterUiLegacy(
        compDetails: UserCompDetails | null,
        createFilterUi: (update?: boolean) => AgPromise<IFilterComp>,
        updateInstanceCallback: (filter: IFilterComp | null) => void
    ): FilterUi {
        const promise = createFilterUi();
        const filterUi = {
            created: true,
            create: createFilterUi,
            filterParams: compDetails!.params,
            compDetails: compDetails!,
            promise,
        };
        promise.then(updateInstanceCallback);
        return filterUi;
    }

    private createFilterWrapper(column: AgColumn): FilterWrapper {
        const { compDetails, handler, handlerGenerator, handlerParams, createFilterUi } = this.createFilterInstance(
            column,
            column.getColDef(),
            this.getDefaultFilter(column),
            (params) => params
        );
        const colId = column.getColId();

        if (handler) {
            delete this.initialModel[colId];
            handler.init?.({
                ...handlerParams!,
                source: 'init',
                model: _getFilterModel(this.model, colId),
            });
            return {
                column,
                isHandler: true,
                handler,
                handlerGenerator: handlerGenerator!,
                handlerParams: handlerParams!,
                filterUi: this.createFilterUiForHandler(compDetails, createFilterUi as any),
            };
        }

        if (createFilterUi) {
            const filterWrapper: LegacyFilterWrapper = {
                column,
                filterUi: null,
                isHandler: false,
            } as const;
            filterWrapper.filterUi = this.createFilterUiLegacy(compDetails, createFilterUi as any, (filterComp) => {
                filterWrapper.filter = filterComp ?? undefined;
            });
            return filterWrapper;
        }

        return {
            column,
            filterUi: null,
            isHandler: false,
        };
    }

    private createHandlerFunc(
        filterDef: IFilterDef,
        defaultFilter: string
    ):
        | {
              filterHandler: CreateFilterHandlerFunc;
              handlerNameOrCallback?: FilterHandlerName | ((params: DoesFilterPassParams) => boolean);
          }
        | undefined {
        const { gos, frameworkOverrides, registry } = this.beans;
        // need to keep track of this so we can compare when col defs change
        let doesFilterPass: ((params: DoesFilterPassParams) => boolean) | undefined;
        const getFilterHandlerFromDef = (filterDef: IFilterDef) => {
            const filter = filterDef.filter;
            if (isColumnFilterComp(filter)) {
                const handler = filter.handler;
                // handler takes priority
                if (handler) {
                    return handler;
                }
                doesFilterPass = filter.doesFilterPass;
                if (doesFilterPass) {
                    // wrap to create a handler
                    return () => ({
                        doesFilterPass: doesFilterPass!,
                    });
                }
                return undefined;
            }
            return typeof filter === 'string' ? filter : undefined;
        };
        const providedFilterHandler = gos.get('enableFilterHandlers') ? getFilterHandlerFromDef(filterDef) : undefined;

        const resolveProvidedFilterHandler = (handlerName: FilterHandlerName) => () =>
            this.createBean(registry.createDynamicBean<FilterHandler & BeanStub>(handlerName!, true)!);

        let filterHandler: CreateFilterHandlerFunc | undefined;
        let handlerName: FilterHandlerName | undefined;

        if (typeof providedFilterHandler === 'string') {
            const userFilterHandler = gos.get('filterHandlers')?.[providedFilterHandler];
            if (userFilterHandler != null) {
                filterHandler = userFilterHandler;
            } else {
                if (FILTER_HANDLERS.has(providedFilterHandler as FilterHandlerName)) {
                    filterHandler = resolveProvidedFilterHandler(providedFilterHandler as FilterHandlerName);
                    handlerName = providedFilterHandler as FilterHandlerName;
                }
            }
        } else {
            filterHandler = providedFilterHandler;
        }
        if (!filterHandler) {
            let filterName: string | undefined;
            const { compName, jsComp, fwComp } = _getFilterCompKeys(frameworkOverrides, filterDef);
            if (compName) {
                filterName = compName;
            } else {
                const usingDefaultFilter = jsComp == null && fwComp == null && filterDef.filter === true;
                if (usingDefaultFilter) {
                    filterName = defaultFilter;
                }
            }
            handlerName = this.handlerMap[filterName as keyof typeof this.handlerMap];

            if (handlerName) {
                filterHandler = resolveProvidedFilterHandler(handlerName);
            }
        }
        if (!filterHandler) {
            return undefined;
        }
        return { filterHandler, handlerNameOrCallback: doesFilterPass ?? handlerName };
    }

    public createHandler(
        column: AgColumn,
        filterDef: IFilterDef,
        defaultFilter: string
    ):
        | {
              handler: FilterHandler;
              handlerParams: FilterHandlerBaseParams;
              handlerGenerator:
                  | CreateFilterHandlerFunc
                  | FilterHandlerName
                  | ((params: DoesFilterPassParams) => boolean);
          }
        | undefined {
        let handlerFunc = this.createHandlerFunc(filterDef, defaultFilter);
        if (!handlerFunc) {
            const gos = this.gos;
            if (!gos.get('enableFilterHandlers')) {
                return undefined;
            }
            if (_isClientSideRowModel(gos)) {
                _warn(277, { colId: column.getColId() });
            }
            // create dummy handler for server side,
            // or to prevent blowing up for CSRM custom with missing props
            handlerFunc = DUMMY_HANDLER;
        }
        const filterParams = _mergeFilterParamsWithApplicationProvidedParams(
            this.beans.userCompFactory,
            filterDef,
            this.createFilterCompParams(column, true, 'init') as IFilterParams
        );
        const { handlerNameOrCallback, filterHandler } = handlerFunc;
        const { handler, handlerParams } = this.createHandlerFromFunc(column, filterHandler, filterParams);
        return {
            handler,
            handlerParams,
            handlerGenerator: handlerNameOrCallback ?? filterHandler,
        };
    }

    private createHandlerFromFunc(
        column: AgColumn,
        filterHandler: CreateFilterHandlerFunc,
        filterParams: any
    ): { handler: FilterHandler; handlerParams: FilterHandlerBaseParams } {
        const colDef = column.getColDef();
        const handler = filterHandler(_addGridCommonParams(this.gos, { column, colDef }));
        const handlerParams = this.createHandlerParams(column, filterParams);
        return { handler, handlerParams };
    }

    private createHandlerParams(column: AgColumn, filterParams: any): FilterHandlerBaseParams {
        const colDef = column.getColDef();
        const colId = column.getColId();
        const filterChangedCallback = this.filterChangedCallbackFactory(column);
        return _addGridCommonParams(this.gos, {
            colDef,
            column,
            getValue: this.createGetValue(column),
            doesRowPassOtherFilter: (node) =>
                this.beans.filterManager?.doesRowPassOtherFilters(colId, node as RowNode) ?? true,
            onModelChange: (newModel, additionalEventAttributes) => {
                this.updateStoredModel(colId, newModel);
                this.refreshHandlerAndUi(column, newModel, 'handler').then(() => {
                    filterChangedCallback({ ...additionalEventAttributes, source: 'columnFilter' });
                });
            },
            filterParams,
        });
    }

    private onColumnsChanged(): void {
        const columns: AgColumn[] = [];
        const { colModel, filterManager, groupFilter } = this.beans;

        this.allColumnFilters.forEach((wrapper, colId) => {
            let currentColumn: AgColumn | null;
            if (wrapper.column.isPrimary()) {
                currentColumn = colModel.getColDefCol(colId);
            } else {
                currentColumn = colModel.getCol(colId);
            }
            // group columns can be recreated with the same colId
            if (currentColumn && currentColumn === wrapper.column) {
                return;
            }

            columns.push(wrapper.column);
            this.disposeFilterWrapper(wrapper, 'columnChanged');
            this.disposeColumnListener(colId);
        });

        const allFiltersAreGroupFilters = groupFilter && columns.every((col) => groupFilter.isGroupFilter(col));
        // don't call `onFilterChanged` if only group column filter is present as it has no model
        if (columns.length > 0 && !allFiltersAreGroupFilters) {
            // When a filter changes as a side effect of a column changes,
            // we report 'api' as the source, so that the client can distinguish
            filterManager?.onFilterChanged({ columns, source: 'api' });
        }
    }

    public isFilterAllowed(column: AgColumn): boolean {
        const isFilterAllowed = column.isFilterAllowed();
        if (!isFilterAllowed) {
            return false;
        }
        // for group filters, can change dynamically whether they are allowed or not
        const groupFilter = this.beans.groupFilter;
        if (groupFilter?.isGroupFilter(column)) {
            return groupFilter.isFilterAllowed(column);
        }
        return true;
    }

    public getFloatingFilterCompDetails(column: AgColumn, showParentFilter: () => void): UserCompDetails | undefined {
        const { userCompFactory, frameworkOverrides, selectableFilter } = this.beans;

        const parentFilterInstance = (callback: IFloatingFilterParentCallback<IFilter>) => {
            const filterComponent = this.getOrCreateFilterUi(column);

            if (filterComponent == null) {
                return;
            }

            filterComponent.then((instance) => {
                callback(_unwrapUserComp(instance!));
            });
        };

        const colDef = column.getColDef();

        const filterDef = selectableFilter?.isSelectable(colDef)
            ? selectableFilter.getFilterDef(column, colDef)
            : colDef;
        const defaultFloatingFilterType =
            _getDefaultFloatingFilterType(frameworkOverrides, filterDef, () => this.getDefaultFloatingFilter(column)) ??
            'agReadOnlyFloatingFilter';
        const isReactive = this.gos.get('enableFilterHandlers');
        const filterParams = _mergeFilterParamsWithApplicationProvidedParams(
            userCompFactory,
            filterDef,
            this.createFilterCompParams(column, isReactive, 'init', true) as IFilterParams
        );

        const params: IFloatingFilterParams<IFilter> = _addGridCommonParams(this.gos, {
            column,
            filterParams,
            currentParentModel: () => this.getCurrentFloatingFilterParentModel(column),
            parentFilterInstance,
            showParentFilter,
        });

        if (isReactive) {
            const displayParams = params as unknown as WithoutGridCommon<FloatingFilterDisplayParams>;
            const colId = column.getColId();
            const filterChangedCallback = this.filterChangedCallbackFactory(column);
            displayParams.onUiChange = (additionalEventAttributes) =>
                this.floatingFilterUiChanged(column, additionalEventAttributes);
            displayParams.model = _getFilterModel(this.model, colId);
            displayParams.onModelChange = (model, additionalEventAttributes) => {
                this.updateStoredModel(colId, model);
                this.refreshHandlerAndUi(column, model, 'floating', true).then(() => {
                    filterChangedCallback({ ...additionalEventAttributes, source: 'columnFilter' });
                });
            };
            displayParams.getHandler = () => this.getHandler(column, true)!;
            displayParams.source = 'init';
        }

        return _getFloatingFilterCompDetails(userCompFactory, colDef, params, defaultFloatingFilterType);
    }

    public getCurrentFloatingFilterParentModel(column: AgColumn): any {
        return this.getModelFromFilterWrapper(this.cachedFilter(column) ?? ({ column } as FilterWrapper));
    }

    private destroyFilterUi(
        filterWrapper: FilterWrapper,
        column: AgColumn,
        compDetails: UserCompDetails | null,
        createFilterUi: ((update?: boolean) => AgPromise<IFilterComp>) | null
    ): void {
        if (filterWrapper.isHandler) {
            const colId = column.getColId();
            delete this.initialModel[colId];
            this.state.delete(colId);
            const filterUi = filterWrapper.filterUi;
            const newFilterUi = this.createFilterUiForHandler(compDetails, createFilterUi as any);
            filterWrapper.filterUi = newFilterUi;
            // destroy the old one after creating the new one
            // so that anything listening to the destroyed event will receive the new comp
            if (filterUi?.created) {
                filterUi.promise.then((filter) => {
                    this.destroyBean(filter);

                    this.eventSvc.dispatchEvent({
                        type: 'filterDestroyed',
                        source: 'paramsUpdated',
                        column: filterWrapper.column,
                    });
                });
            }
        } else {
            this.destroyFilter(column, 'paramsUpdated');
        }
    }

    // destroys the filter, so it no longer takes part
    public destroyFilter(column: AgColumn, source: 'api' | 'paramsUpdated' = 'api'): void {
        const colId = column.getColId();
        const filterWrapper = this.allColumnFilters.get(colId);

        this.disposeColumnListener(colId);

        delete this.initialModel[colId];

        if (filterWrapper) {
            this.disposeFilterWrapper(filterWrapper, source).then((wasActive) => {
                if (wasActive && this.isAlive()) {
                    this.beans.filterManager?.onFilterChanged({
                        columns: [column],
                        source: 'api',
                    });
                }
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
    ): AgPromise<boolean> {
        let isActive = false;
        const { column, isHandler, filterUi } = filterWrapper;
        const colId = column.getColId();
        if (isHandler) {
            isActive = this.isHandlerActive(column);
            this.destroyBean(filterWrapper.handler);
            delete this.model[colId];
            this.state.delete(colId);
        }
        if (filterUi) {
            if (filterUi.created) {
                return filterUi.promise.then((filter) => {
                    isActive = isHandler ? isActive : !!(filter as IFilterComp)?.isFilterActive();

                    this.destroyBean(filter);

                    this.setColFilterActive(column, false, 'filterDestroyed');

                    this.allColumnFilters.delete(colId);

                    this.eventSvc.dispatchEvent({
                        type: 'filterDestroyed',
                        source,
                        column,
                    });

                    return isActive;
                });
            }
        }
        return AgPromise.resolve(isActive);
    }

    private filterChangedCallbackFactory(column: AgColumn): (additionalEventAttributes?: any) => void {
        return (additionalEventAttributes?: any) => {
            this.callOnFilterChangedOutsideRenderCycle({
                additionalEventAttributes,
                columns: [column],
                column,
                source: additionalEventAttributes?.source ?? 'columnFilter',
            });
        };
    }

    public filterParamsChanged(colId: string, source: FilterChangedEventSourceType = 'api'): void {
        const filterWrapper = this.allColumnFilters.get(colId);
        if (!filterWrapper) {
            return;
        }

        const beans = this.beans;
        const column = filterWrapper.column;
        const colDef = column.getColDef();
        const isFilterAllowed = column.isFilterAllowed();
        const defaultFilter = this.getDefaultFilter(column);
        const selectableFilter = beans.selectableFilter;
        const filterDef = selectableFilter?.isSelectable(colDef)
            ? selectableFilter.getFilterDef(column, colDef)
            : colDef;

        const handlerFunc = isFilterAllowed
            ? this.createHandlerFunc(filterDef, this.getDefaultFilter(column))
            : undefined;
        const isHandler = !!handlerFunc;
        const wasHandler = filterWrapper.isHandler;

        if (wasHandler != isHandler) {
            this.destroyFilter(column, 'paramsUpdated');
            return;
        }
        const { compDetails, createFilterUi } = (isFilterAllowed
            ? this.createFilterComp(column, filterDef, defaultFilter, (params) => params, isHandler, 'colDef')
            : null) ?? { compDetails: null, createFilterUi: null };

        const newFilterParams =
            compDetails?.params ??
            _mergeFilterParamsWithApplicationProvidedParams(
                beans.userCompFactory,
                filterDef,
                this.createFilterCompParams(column, isHandler, 'colDef') as IFilterParams
            );

        if (wasHandler) {
            const handlerGenerator = handlerFunc?.handlerNameOrCallback ?? handlerFunc?.filterHandler;
            const existingModel = _getFilterModel(this.model, colId);
            if (filterWrapper.handlerGenerator != handlerGenerator) {
                // handler has changed
                const oldHandler = filterWrapper.handler;
                const { handler, handlerParams } = this.createHandlerFromFunc(
                    column,
                    handlerFunc!.filterHandler,
                    newFilterParams
                );
                filterWrapper.handler = handler;
                filterWrapper.handlerParams = handlerParams;
                filterWrapper.handlerGenerator = handlerGenerator!;

                delete this.model[colId];
                handler.init?.({ ...handlerParams, source: 'init', model: null });
                // destroy the old handler after creating and assigning the new one in case anything
                // is listening to events on the handler and needs to resubscribe to the new one
                this.destroyBean(oldHandler);
                if (existingModel != null) {
                    this.beans.filterManager?.onFilterChanged({
                        columns: [column],
                        source,
                    });
                }
            } else {
                const handlerParams = this.createHandlerParams(column, compDetails?.params);
                // handler exists and is the same
                filterWrapper.handlerParams = handlerParams;
                filterWrapper.handler.refresh?.({
                    ...handlerParams,
                    source: 'colDef',
                    model: existingModel,
                });
            }
        }

        // Case when filter component changes
        // or when filter wrapper does not have promise to retrieve FilterComp, destroy
        if (
            this.areFilterCompsDifferent(filterWrapper.filterUi?.compDetails ?? null, compDetails) ||
            !filterWrapper.filterUi ||
            !compDetails
        ) {
            this.destroyFilterUi(filterWrapper, column, compDetails, createFilterUi);
            return;
        }

        filterWrapper.filterUi.filterParams = newFilterParams;

        // Otherwise - Check for refresh method before destruction
        // If refresh() method is implemented - call it and destroy filter if it returns false
        // Otherwise - do nothing ( filter will not be destroyed - we assume new params are compatible with old ones )
        getFilterUiFromWrapper(filterWrapper, wasHandler)?.then((filter) => {
            const shouldRefreshFilter = filter?.refresh ? filter.refresh(newFilterParams as any) : true;
            // framework wrapper always implements optional methods, but returns null if no underlying method
            if (shouldRefreshFilter === false) {
                this.destroyFilterUi(filterWrapper, column, compDetails, createFilterUi);
            } else {
                this.dispatchLocalEvent({
                    type: 'filterParamsChanged',
                    column,
                    params: newFilterParams,
                } as FilterParamsChangedEvent);
            }
        });
    }

    private refreshHandlerAndUi(
        column: AgColumn,
        model: any,
        source: 'ui' | 'api' | 'colDef' | 'floating' | 'handler',
        createIfMissing?: boolean
    ): AgPromise<void> {
        const filterWrapper = this.cachedFilter(column);

        if (!filterWrapper) {
            if (createIfMissing) {
                // create one. Don't need to refresh as it will be created with the latest details
                this.getOrCreateFilterWrapper(column, true);
            }
            return AgPromise.resolve();
        }

        if (!filterWrapper.isHandler) {
            return AgPromise.resolve();
        }

        const { filterUi, handler, handlerParams } = filterWrapper;

        return _refreshHandlerAndUi(
            () => {
                if (filterUi) {
                    const { created, filterParams } = filterUi;
                    if (created) {
                        return filterUi.promise.then((filter) => {
                            return filter ? { filter, filterParams } : undefined;
                        });
                    } else {
                        filterUi.refreshed = true;
                    }
                }

                return AgPromise.resolve(undefined);
            },
            handler,
            handlerParams,
            model,
            this.state.get(column.getColId()) ?? { model },
            source
        );
    }

    private setColumnFilterWrapper(column: AgColumn, filterWrapper: FilterWrapper): void {
        const colId = column.getColId();
        this.allColumnFilters.set(colId, filterWrapper);
        this.allColumnListeners.set(
            colId,
            this.addManagedListeners(column, { colDefChanged: () => this.filterParamsChanged(colId) })[0]
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
        const gridColumns = this.beans.colModel.getCols();
        return gridColumns.some((col) => col.getColDef().floatingFilter);
    }

    public getFilterInstance<TFilter extends IFilter>(key: string | AgColumn): Promise<TFilter | null | undefined> {
        const column = this.beans.colModel.getColDefCol(key);

        if (!column) {
            return Promise.resolve(undefined);
        }

        const filterPromise = this.getOrCreateFilterUi(column);

        if (!filterPromise) {
            return Promise.resolve(null);
        }

        return new Promise((resolve) => {
            filterPromise.then((filter) => {
                resolve(_unwrapUserComp(filter) as any);
            });
        });
    }

    private processFilterModelUpdateQueue(): void {
        this.modelUpdates.forEach(({ model, source }) => this.setModel(model, source));
        this.modelUpdates = [];
        this.columnModelUpdates.forEach(({ key, model, resolve }) => {
            this.setModelForColumn(key, model).then(() => resolve());
        });
        this.columnModelUpdates = [];
    }

    public getModelForColumn(column: AgColumn): any {
        const filterWrapper = this.cachedFilter(column);
        return filterWrapper ? this.getModelFromFilterWrapper(filterWrapper) : null;
    }

    public setModelForColumn(key: string | AgColumn, model: any): Promise<void> {
        if (this.beans.dataTypeSvc?.isPendingInference) {
            let resolve: () => void = () => {};
            const promise = new Promise<void>((res) => {
                resolve = res;
            });
            this.columnModelUpdates.push({ key, model, resolve });
            return promise;
        }
        return new Promise((resolve) => {
            this.setModelForColumnLegacy(key, model).then((result) => resolve(result!));
        });
    }

    public setModelForColumnLegacy(key: string | AgColumn, model: any): AgPromise<void> {
        const column = this.beans.colModel.getColDefCol(key);
        const filterWrapper = column ? this.getOrCreateFilterWrapper(column, true) : null;
        return filterWrapper ? this.setModelOnFilterWrapper(filterWrapper, model) : AgPromise.resolve();
    }

    public setColDefPropsForDataType(
        colDef: ColDef,
        dataTypeDefinition: CoreDataTypeDefinition,
        formatValue: DataTypeFormatValueFunc
    ): void {
        const providedFilter = colDef.filter;
        const filter =
            providedFilter === true
                ? this.getDefaultFilterFromDataType(() => dataTypeDefinition.baseDataType)
                : providedFilter;
        if (typeof filter !== 'string') {
            return;
        }
        let filterParams: any;
        let filterValueGetter: string | ValueGetterFunc | undefined;
        const beans = this.beans;
        const { filterParams: colDefFilterParams, filterValueGetter: colDefFilterValueGetter } = colDef;
        if (filter === 'agMultiColumnFilter') {
            ({ filterParams, filterValueGetter } =
                beans.multiFilter?.getParamsForDataType(
                    colDefFilterParams,
                    colDefFilterValueGetter,
                    dataTypeDefinition,
                    formatValue
                ) ?? {});
        } else {
            ({ filterParams, filterValueGetter } = _getFilterParamsForDataType(
                filter,
                colDefFilterParams,
                colDefFilterValueGetter,
                dataTypeDefinition,
                formatValue,
                beans,
                this.getLocaleTextFunc()
            ));
        }
        colDef.filterParams = filterParams;
        if (filterValueGetter) {
            colDef.filterValueGetter = filterValueGetter;
        }
    }

    // additionalEventAttributes is used by provided simple floating filter, so it can add 'floatingFilter=true' to the event
    public setColFilterActive(
        column: AgColumn,
        active: boolean,
        source: ColumnEventType,
        additionalEventAttributes?: any
    ): void {
        if (column.filterActive !== active) {
            column.filterActive = active;
            column.dispatchColEvent('filterActiveChanged', source);
        }
        column.dispatchColEvent('filterChanged', source, additionalEventAttributes);
    }

    private setModelOnFilterWrapper(
        filterWrapper: FilterWrapper,
        newModel: any,
        justCreated?: boolean
    ): AgPromise<void> {
        return new AgPromise((resolve) => {
            if (filterWrapper.isHandler) {
                const column = filterWrapper.column;
                const colId = column.getColId();
                const existingModel = this.model[colId];
                this.updateStoredModel(colId, newModel);
                if (justCreated && newModel === existingModel) {
                    // don't need to refresh as already has the new model
                    resolve();
                    return;
                }
                this.refreshHandlerAndUi(column, newModel, 'api').then(() => resolve());
                return;
            }

            const uiPromise = getFilterUiFromWrapper<IFilterComp>(filterWrapper);
            if (uiPromise) {
                uiPromise.then((filter) => {
                    if (typeof filter?.setModel !== 'function') {
                        _warn(65);
                        resolve();
                        return;
                    }

                    (filter.setModel(newModel) || AgPromise.resolve()).then(() => resolve());
                });
                return;
            }

            // no handler and no filter comp
            resolve();
        });
    }

    /** for handlers only */
    private updateStoredModel(colId: string, model: any): void {
        if (_exists(model)) {
            this.model[colId] = model;
        } else {
            delete this.model[colId];
        }
        const oldState = this.state.get(colId);
        const newState = {
            model,
            state: oldState?.state,
        };
        this.state.set(colId, newState);
    }

    private filterModified(column: AgColumn, additionalEventAttributes?: any): void {
        this.getOrCreateFilterUi(column)?.then((filterInstance) => {
            this.eventSvc.dispatchEvent({
                type: 'filterModified',
                column,
                filterInstance,
                ...additionalEventAttributes,
            });
        });
    }

    public filterUiChanged(column: Column, additionalEventAttributes?: any): void {
        this.eventSvc.dispatchEvent({
            type: 'filterUiChanged',
            column,
            ...additionalEventAttributes,
        });
    }

    private floatingFilterUiChanged(column: Column, additionalEventAttributes?: any): void {
        this.eventSvc.dispatchEvent({
            type: 'floatingFilterUiChanged',
            column,
            ...additionalEventAttributes,
        });
    }

    public updateModel(column: AgColumn, action: FilterAction, additionalEventAttributes?: any): void {
        const colId = column.getColId();
        const getFilterUi = () =>
            this.cachedFilter(column)?.filterUi as FilterUi<FilterDisplayComp, FilterDisplayParams> | undefined;
        _updateFilterModel(
            action,
            getFilterUi,
            () => _getFilterModel(this.model, colId),
            () => this.state.get(colId),
            (state) => this.updateState(column, state),
            (model) => getFilterUi()?.filterParams?.onModelChange(model, additionalEventAttributes)
        );
    }

    public updateAllModels(action: FilterAction, additionalEventAttributes?: any): void {
        const promises: AgPromise<void>[] = [];
        this.allColumnFilters.forEach((filter, colId) => {
            const column = this.beans.colModel.getColDefCol(colId);
            if (column) {
                _updateFilterModel(
                    action,
                    () => filter.filterUi as FilterUi<FilterDisplayComp, FilterDisplayParams> | undefined,
                    () => _getFilterModel(this.model, colId),
                    () => this.state.get(colId),
                    (state) => this.updateState(column, state),
                    (model) => {
                        this.updateStoredModel(colId, model);
                        this.dispatchLocalEvent<FilterActionEvent>({
                            type: 'filterAction',
                            column,
                            action,
                        });
                        promises.push(this.refreshHandlerAndUi(column, model, 'ui'));
                    }
                );
            }
        });
        if (promises.length) {
            AgPromise.all(promises).then(() => {
                this.callOnFilterChangedOutsideRenderCycle({
                    source: 'columnFilter',
                    additionalEventAttributes,
                    columns: [],
                });
            });
        }
    }

    private updateOrRefreshFilterUi(column: AgColumn): void {
        const colId = column.getColId();
        getAndRefreshFilterUi(
            () => this.cachedFilter(column)?.filterUi as FilterUi<FilterDisplayComp, FilterDisplayParams> | undefined,
            () => _getFilterModel(this.model, colId),
            () => this.state.get(colId)
        );
    }

    private updateState(column: AgColumn, state: FilterDisplayState): void {
        this.state.set(column.getColId(), state);
        this.dispatchLocalEvent<FilterStateChangedEvent>({
            type: 'filterStateChanged',
            column,
            state,
        });
    }

    public canApplyAll(): boolean {
        let hasChanges = false;

        const { state, model } = this;

        for (const colId of state.keys()) {
            const colState = state.get(colId)!;
            // undefined is true
            if (colState.valid === false) {
                return false;
            }
            if ((colState.model ?? null) !== _getFilterModel(model, colId)) {
                hasChanges = true;
            }
        }

        return hasChanges;
    }

    public setGlobalButtons(isGlobal: boolean): void {
        this.isGlobalButtons = isGlobal;
        this.dispatchLocalEvent<FilterGlobalButtonsEvent>({
            type: 'filterGlobalButtons',
            isGlobal,
        });
    }

    public override destroy() {
        super.destroy();
        this.allColumnFilters.forEach((filterWrapper) => this.disposeFilterWrapper(filterWrapper, 'gridDestroyed'));
        // don't need to destroy the listeners as they are managed listeners
        this.allColumnListeners.clear();
        this.state.clear();
    }
}
