import type { AgEvent, AgPropertyValueChangedEvent } from 'ag-stack';
import { AgPromise, _exists, _jsonEquals, _removeAllFromArray } from 'ag-stack';

import { _unwrapUserComp } from '../components/framework/unwrapUserComp';
import {
    _getFilterDetails,
    _getFloatingFilterCompDetails,
    _mergeFilterParamsWithApplicationProvidedParams,
} from '../components/framework/userCompUtils';
import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { BeanName } from '../context/context';
import type { AgColumn } from '../entities/agColumn';
import type { ColDef } from '../entities/colDef';
import type { CoreDataTypeDefinition, DataTypeFormatValueFunc } from '../entities/dataType';
import type { RowNode } from '../entities/rowNode';
import type { ColumnEventType, FilterChangedEventSourceType } from '../events';
import type { GridOptionsWithDefaults } from '../gridOptionsDefault';
import { _addGridCommonParams, _getGroupAggFiltering, _isClientSideRowModel } from '../gridOptionsUtils';
import type { ContainerType } from '../interfaces/iAfterGuiAttachedParams';
import type { Column } from '../interfaces/iColumn';
import type { WithoutGridCommon } from '../interfaces/iCommon';
import type {
    AgFilterHandlerBaseParams,
    BaseFilterParams,
    ColumnFilterState,
    CreateFilterHandlerFunc,
    DoesFilterPassParams,
    FilterAction,
    FilterDisplayComp,
    FilterDisplayParams,
    FilterDisplayState,
    FilterGetValueFunc,
    FilterHandler,
    FilterHandlerBaseParams,
    FilterModel,
    FilterValueGetter,
    FilterWrapperParams,
    IFilter,
    IFilterComp,
    IFilterDef,
    IFilterParams,
} from '../interfaces/iFilter';
import { isColumnFilterComp } from '../interfaces/iFilter';
import type { IRowNode } from '../interfaces/iRowNode';
import type { UserCompDetails } from '../interfaces/iUserCompDetails';
import type {
    FilterHandlerName,
    FilterUi,
    FilterWrapper,
    HandlerFilterWrapper,
    HandlerGenerator,
    LegacyFilterWrapper,
} from './columnFilterUtils';
import {
    FILTER_HANDLERS,
    FILTER_HANDLER_MAP,
    _getFilterModel,
    _refreshHandlerAndUi,
    _updateFilterModel,
    getAndRefreshFilterUi,
    getFilterUiFromWrapper,
} from './columnFilterUtils';
import type { FilterComp } from './filterComp';
import type { ResolvedFilter } from './filterDefResolver';
import { _resolveFilter, _setColDefPropsForDataType } from './filterDefResolver';
import type {
    FloatingFilterDisplayParams,
    IFloatingFilterParams,
    IFloatingFilterParentCallback,
} from './floating/floatingFilter';
import { _getDefaultFloatingFilterType } from './floating/floatingFilterMapper';
import {
    STATEFUL_UI_FILTER_HANDLERS,
    _createPairedFilterHandler,
    _getDisplayHandler,
    getDisplayHandlerName,
} from './pairedFilterHandler';

interface CompDoesFilterPassWrapper {
    isHandler: false;
    colId: string;
    comp: IFilterComp;
}

interface HandlerDoesFilterPassWrapper {
    isHandler: true;
    colId: string;
    handler: FilterHandler;
    handlerParams: AgFilterHandlerBaseParams;
}

type DoesFilterPassWrapper = CompDoesFilterPassWrapper | HandlerDoesFilterPassWrapper;

interface HandlerFunc {
    filterHandler: CreateFilterHandlerFunc;
    handlerGenerator: HandlerGenerator;
    /** The built-in filter's own handler its UI is given, where the rows follow the author's logic. */
    displayHandlerName: FilterHandlerName | undefined;
}

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

interface FilterModelAsStringChangedEvent extends AgEvent<'filterModelAsStringChanged'> {
    column: AgColumn;
}

/** Used for non-CSRM handlers */
const createDummyHandler = () => ({ doesFilterPass: () => true });
const DUMMY_HANDLER: HandlerFunc = {
    filterHandler: createDummyHandler,
    handlerGenerator: createDummyHandler,
    displayHandlerName: undefined,
};

function isAggFilter(
    column: AgColumn,
    isPivotMode: boolean,
    isPivotActive: boolean,
    groupFilterEnabled: boolean
): boolean {
    const isSecondary = !column.isPrimary();
    // the only filters that can appear on secondary columns are groupAgg filters
    if (isSecondary) {
        return true;
    }

    const isShowingPrimaryColumns = !isPivotActive;
    const isValueActive = column.isValueActive();

    // primary columns are only ever groupAgg filters if a) value is active and b) showing primary columns
    if (!isValueActive || !isShowingPrimaryColumns) {
        return false;
    }

    // from here on we know: isPrimary=true, isValueActive=true, isShowingPrimaryColumns=true
    if (isPivotMode) {
        // primary column is pretending to be a pivot column, ie pivotMode=true, but we are
        // still showing primary columns
        return true;
    }
    // we are not pivoting, so we groupFilter when it's an agg column
    return groupFilterEnabled;
}

/** Whether a descendant passes; one without data counts only while children are kept, as in the filter stage. */
function doesDescendantPass(
    passes: (node: RowNode) => boolean,
    children: RowNode[] | null | undefined,
    withChildren: boolean
): boolean {
    if (!children) {
        return false;
    }
    for (let i = 0, len = children.length; i < len; ++i) {
        const child = children[i];
        if ((withChildren || child.data) && passes(child)) {
            return true;
        }
        if (doesDescendantPass(passes, child.childrenAfterGroup, withChildren)) {
            return true;
        }
    }
    return false;
}

/** The author's `doesFilterPass`, which a `handler` takes priority over. */
const getAuthorDoesFilterPass = (filter: any): ((params: DoesFilterPassParams) => boolean) | undefined =>
    isColumnFilterComp(filter) && !filter.handler ? filter.doesFilterPass : undefined;

/** What the definition gives to filter with: its `handler`, its `doesFilterPass` wrapped as one, or a handler's name. */
const getAuthorHandler = (
    filter: any,
    doesFilterPass: ((params: DoesFilterPassParams) => boolean) | undefined
): string | CreateFilterHandlerFunc | undefined => {
    if (isColumnFilterComp(filter)) {
        return filter.handler || (doesFilterPass ? () => ({ doesFilterPass }) : undefined);
    }
    return typeof filter === 'string' ? filter : undefined;
};

export class ColumnFilterService
    extends BeanStub<
        | 'filterParamsChanged'
        | 'filterStateChanged'
        | 'filterAction'
        | 'filterGlobalButtons'
        | 'filterModelAsStringChanged'
    >
    implements NamedBean
{
    beanName: BeanName = 'colFilter';

    private readonly allColumnFilters = new Map<string, FilterWrapper>();
    private readonly allColumnListeners = new Map<string, (() => null) | undefined>();
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
    private readonly state: Map<string, FilterDisplayState> = new Map();
    private readonly handlerMap: { -readonly [K in keyof typeof FILTER_HANDLER_MAP]?: (typeof FILTER_HANDLER_MAP)[K] } =
        {
            ...FILTER_HANDLER_MAP,
        };
    public isGlobalButtons: boolean = false;
    public activeFilterComps: Set<FilterComp> = new Set();

    public postConstruct(): void {
        this.addManagedEventListeners({
            gridColumnsChanged: this.onColumnsChanged.bind(this),
            dataTypesInferred: this.processFilterModelUpdateQueue.bind(this),
        });

        this.addManagedPropertyListener('pivotMode', this.onPivotModeChanged.bind(this));

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

    public refreshModel() {
        // We listen to both row data updated and treeData changed as the SetFilter needs it
        this.onNewRowsLoaded('rowDataUpdated');
    }

    public setModel(
        model: FilterModel | null,
        source: FilterChangedEventSourceType = 'api',
        forceUpdateActive?: boolean
    ): void {
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
                const column = colModel.colsById[colId];

                if (!column) {
                    this.warn(62, { colId });
                    return;
                }

                if (!column.isFilterAllowed()) {
                    this.warn(63, { colId });
                    return;
                }

                const filterWrapper = this.getOrCreateFilterWrapper(column, true);
                if (!filterWrapper) {
                    this.warn(64, { colId });
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
            } else if (forceUpdateActive) {
                this.updateActive('filterChanged');
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
                if (_exists(model) && !allColumnFilters.has(colId) && colModel.colsById[colId]?.colDef.filter) {
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
        this.setModel(model, source, true);
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
                this.warn(66);
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
                this.warn(67);
                return false;
            }
            return filter.isFilterActive();
        };

        const { colModel, gos } = this.beans;
        const groupFilterEnabled = !!_getGroupAggFiltering(gos);

        const activeAggregateFilters: DoesFilterPassWrapper[] = [];
        const activeColumnFilters: DoesFilterPassWrapper[] = [];

        const addFilter = (column: AgColumn, filterActive: boolean, doesFilterPassWrapper: DoesFilterPassWrapper) => {
            if (filterActive) {
                if (isAggFilter(column, colModel.pivotMode, colModel.isPivotActive(), groupFilterEnabled)) {
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
                    this.error(91);
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
        AgPromise.all(promises).then(() => this.updateActive(source, { afterDataChange: true }));
    }

    private updateActive(source: ColumnEventType, additionalEventAttributes?: any): void {
        this.updateFilterFlagInColumns(source, additionalEventAttributes).then(() => this.updateActiveFilters());
    }

    private createGetValue(filterColumn: AgColumn): FilterGetValueFunc {
        const { filterValueSvc, colModel } = this.beans;
        return (rowNode, column) => {
            const columnToUse = column ? colModel.getCol(column) : filterColumn;
            return columnToUse ? filterValueSvc!.getValue(columnToUse, rowNode) : undefined;
        };
    }

    /** Reads the filter column through `filterValueGetter` alone, and another column as the quick filter reads it. */
    public createHandlerGetValue(
        filterColumn: AgColumn,
        filterValueGetter: FilterValueGetter | undefined
    ): FilterGetValueFunc {
        const { filterValueSvc, colModel } = this.beans;
        return (rowNode, column) => {
            const columnToUse = column ? colModel.getCol(column) : filterColumn;
            if (columnToUse === filterColumn) {
                return filterValueSvc!.getValueWithGetter(filterColumn, rowNode, filterValueGetter);
            }
            return columnToUse ? filterValueSvc!.getValue(columnToUse, rowNode) : undefined;
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

    public createFilterComp(
        column: AgColumn,
        resolved: ResolvedFilter,
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

            return _getFilterDetails(this.beans.userCompFactory, resolved.def, updatedParams, resolved.defaultFilter);
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
        resolved: ResolvedFilter,
        getFilterParams: (defaultParams: BaseFilterParams, isHandler: boolean) => BaseFilterParams
    ): {
        compDetails: UserCompDetails | null;
        handler?: FilterHandler;
        handlerGenerator?: HandlerGenerator;
        handlerParams?: AgFilterHandlerBaseParams;
        createFilterUi: ((update?: boolean) => AgPromise<IFilterComp>) | null;
    } {
        const { handler, handlerParams, handlerGenerator } = this.createHandler(column, resolved) ?? {};

        const filterCompDetails = this.createFilterComp(column, resolved, getFilterParams, !!handler, 'init');

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
                this.warn(281, { colId: column.getColId() });
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

    /**
     * Whether the other filters, and `alsoPasses` where given, would show the row: in tree data that is also when a
     * relative passes them, as the filter stage keeps a match's ancestors and, unless excluded, its descendants.
     */
    public createDoesRowPassOtherFilter(
        column: AgColumn,
        alsoPasses: ((node: RowNode) => boolean) | undefined
    ): (node: IRowNode) => boolean {
        const beans = this.beans;
        const filterManager = beans.filterManager;
        const colId = column.getColId();
        const passes = (node: RowNode) =>
            (!filterManager || filterManager.doesRowPassFilter(node, colId)) && (!alsoPasses || alsoPasses(node));
        return (rowNode) => {
            const node = rowNode as RowNode;
            if (passes(node)) {
                return true;
            }
            if (!beans.groupStage?.treeData) {
                return false;
            }
            const includeChildren = !this.gos.get('excludeChildrenWhenTreeDataFiltering');
            if (includeChildren) {
                for (let parent = node.parent; parent && parent.level >= 0; parent = parent.parent) {
                    if (passes(parent)) {
                        return true;
                    }
                }
            }
            return doesDescendantPass(passes, node.childrenAfterGroup, includeChildren);
        };
    }

    public createBaseFilterParams(column: AgColumn, forFloatingFilter?: boolean): BaseFilterParams {
        return _addGridCommonParams(this.gos, {
            column,
            colDef: column.colDef,
            getValue: this.createGetValue(column),
            doesRowPassOtherFilter: forFloatingFilter
                ? () => true
                : this.createDoesRowPassOtherFilter(column, undefined),
            // to avoid breaking changes to `filterParams` defined as functions
            // we need to provide the below options even though they are not valid for handlers
            rowModel: this.beans.rowModel,
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
            displayParams.onModelChange = this.createOnModelChange(column, 'ui');
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
            displayParams.getHandler = () => _getDisplayHandler(this.getHandler(column, true))!;
            displayParams.onUiChange = (additionalEventAttributes?: any) =>
                this.filterUiChanged(column, additionalEventAttributes);
            displayParams.source = source;
        }

        return params;
    }

    private createFilterUiForHandler(
        compDetails: UserCompDetails | null,
        createFilterUi: ((update?: boolean) => AgPromise<FilterDisplayComp>) | null,
        refreshed?: boolean
    ): FilterUi<FilterDisplayComp, FilterDisplayParams> | null {
        return createFilterUi
            ? {
                  created: false,
                  refreshed,
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
            _resolveFilter(this.beans, column),
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
                // the filter holds its model from here, so the initial one must not outlive it
                delete this.initialModel[colId];
            });
            return filterWrapper;
        }

        return {
            column,
            filterUi: null,
            isHandler: false,
        };
    }

    private createHandlerFunc(column: AgColumn, resolved: ResolvedFilter): HandlerFunc | undefined {
        const gos = this.gos;
        const enableFilterHandlers = gos.get('enableFilterHandlers');
        const filter = resolved.def.filter;
        // need to keep track of this so we can compare when col defs change
        const doesFilterPass = enableFilterHandlers ? getAuthorDoesFilterPass(filter) : undefined;
        const provided = enableFilterHandlers ? getAuthorHandler(filter, doesFilterPass) : undefined;
        const handlerMap = this.handlerMap;
        // the filter the definition builds, a `{ component }` form's included
        const ownHandlerName = handlerMap[resolved.key as keyof typeof handlerMap];

        let filterHandler: CreateFilterHandlerFunc | undefined;
        let handlerName: FilterHandlerName | undefined;
        if (typeof provided !== 'string') {
            filterHandler = provided;
        } else {
            filterHandler = gos.get('filterHandlers')?.[provided];
            if (filterHandler == null && FILTER_HANDLERS.has(provided as FilterHandlerName)) {
                handlerName = provided as FilterHandlerName;
            }
        }
        if (!filterHandler) {
            handlerName ??= ownHandlerName;
            if (handlerName) {
                filterHandler = this.createProvidedHandlerFunc(handlerName);
            }
        }
        if (!filterHandler) {
            return this.getMissingHandlerFunc(column, enableFilterHandlers);
        }
        // pairing wraps the author's logic in a new function, so the logic itself is compared
        const handlerGenerator = doesFilterPass ?? handlerName ?? filterHandler;
        if (
            provided &&
            ownHandlerName &&
            ownHandlerName !== handlerName &&
            STATEFUL_UI_FILTER_HANDLERS.has(ownHandlerName)
        ) {
            const pairedHandler = this.pairWithDisplayHandler(ownHandlerName, filterHandler);
            return { filterHandler: pairedHandler, handlerGenerator, displayHandlerName: ownHandlerName };
        }
        return { filterHandler, handlerGenerator, displayHandlerName: undefined };
    }

    private createProvidedHandlerFunc(handlerName: FilterHandlerName): CreateFilterHandlerFunc {
        return () =>
            this.createBean(this.beans.registry.createDynamicBean<FilterHandler & BeanStub>(handlerName, true)!);
    }

    /** No handler without filter handlers; with them, a dummy, as server-side or a custom filter missing its logic. */
    private getMissingHandlerFunc(
        column: AgColumn,
        enableFilterHandlers: boolean | undefined
    ): HandlerFunc | undefined {
        if (!enableFilterHandlers) {
            return undefined;
        }
        if (_isClientSideRowModel(this.gos)) {
            this.warn(277, { colId: column.getColId() });
        }
        return DUMMY_HANDLER;
    }

    /** The author's logic decides the rows of a built-in filter whose UI keeps its state in its own handler. */
    private pairWithDisplayHandler(
        displayHandlerName: FilterHandlerName,
        createRowHandler: CreateFilterHandlerFunc
    ): CreateFilterHandlerFunc {
        const createDisplayHandler = this.createProvidedHandlerFunc(displayHandlerName);
        return (params) =>
            _createPairedFilterHandler(
                displayHandlerName,
                createDisplayHandler(params),
                createRowHandler(params),
                (handler) => this.destroyBean(handler)
            );
    }

    public createHandler(
        column: AgColumn,
        resolved: ResolvedFilter
    ):
        | {
              handler: FilterHandler;
              handlerParams: AgFilterHandlerBaseParams;
              handlerGenerator: HandlerGenerator;
          }
        | undefined {
        const handlerFunc = this.createHandlerFunc(column, resolved);
        if (!handlerFunc) {
            return undefined;
        }
        const filterParams = this.createHandlerFilterParams(column, resolved.def, 'init');
        return {
            ...this.createHandlerFromFunc(column, resolved, handlerFunc.filterHandler, filterParams),
            handlerGenerator: handlerFunc.handlerGenerator,
        };
    }

    /** The params the column's filter would build a handler for this definition with, on a colDef refresh. */
    public createHandlerParamsForDef(column: AgColumn, resolved: ResolvedFilter): AgFilterHandlerBaseParams {
        const filterParams = this.createHandlerFilterParams(column, resolved.def, 'colDef');
        return this.createHandlerParams(column, resolved, filterParams);
    }

    /** The `filterParams` a resolved definition supplies, a function being called with the column's filter params. */
    public resolveFilterParams(column: AgColumn, filterDef: IFilterDef): any {
        const filterParams = filterDef.filterParams;
        return typeof filterParams === 'function'
            ? filterParams(this.createFilterCompParams(column, !!this.gos.get('enableFilterHandlers'), 'init'))
            : filterParams;
    }

    private createHandlerFilterParams(
        column: AgColumn,
        filterDef: IFilterDef,
        source: 'init' | 'colDef'
    ): IFilterParams {
        return _mergeFilterParamsWithApplicationProvidedParams(
            this.beans.userCompFactory,
            filterDef,
            this.createFilterCompParams(column, true, source) as IFilterParams
        );
    }

    private createHandlerFromFunc(
        column: AgColumn,
        resolved: ResolvedFilter,
        filterHandler: CreateFilterHandlerFunc,
        filterParams: any
    ): { handler: FilterHandler; handlerParams: AgFilterHandlerBaseParams } {
        const colDef = column.getColDef();
        const handler = filterHandler(_addGridCommonParams(this.gos, { column, colDef }));
        const handlerParams = this.createHandlerParams(column, resolved, filterParams);
        return { handler, handlerParams };
    }

    private createHandlerParams(
        column: AgColumn,
        resolved: ResolvedFilter,
        filterParams: any
    ): AgFilterHandlerBaseParams {
        const colDef = column.getColDef();
        const filterValueGetter = resolved.filterValueGetter;
        return _addGridCommonParams(this.gos, {
            colDef,
            column,
            filterValueGetter,
            getValue: this.createHandlerGetValue(column, filterValueGetter),
            doesRowPassOtherFilter: this.createDoesRowPassOtherFilter(column, undefined),
            onModelChange: this.createOnModelChange(column, 'handler'),
            onModelAsStringChange: () => {
                column.dispatchColEvent('filterChanged', 'filterChanged');
                this.dispatchLocalEvent<FilterModelAsStringChangedEvent>({
                    type: 'filterModelAsStringChanged',
                    column,
                });
            },
            filterParams,
        });
    }

    private onColumnsChanged(): void {
        const columns: AgColumn[] = [];
        const { colModel, filterManager, groupFilter } = this.beans;

        this.allColumnFilters.forEach((wrapper, colId) => {
            let currentColumn: AgColumn | undefined;
            if (wrapper.column.primary) {
                currentColumn = colModel.getNonPivotColById(colId);
            } else {
                currentColumn = colModel.colsById[colId];
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
        const beans = this.beans;
        const { userCompFactory, gos } = beans;

        const parentFilterInstance = (callback: IFloatingFilterParentCallback<IFilter>) => {
            const filterComponent = this.getOrCreateFilterUi(column);
            filterComponent?.then((instance) => {
                callback(_unwrapUserComp(instance!));
            });
        };

        const colDef = column.getColDef();
        const resolved = _resolveFilter(beans, column);
        const filterDef = resolved.def;
        const defaultFloatingFilterType = _getDefaultFloatingFilterType(resolved.key) ?? 'agReadOnlyFloatingFilter';
        const isReactive = gos.get('enableFilterHandlers');
        const filterParams = _mergeFilterParamsWithApplicationProvidedParams(
            userCompFactory,
            filterDef,
            this.createFilterCompParams(column, isReactive, 'init', true) as IFilterParams
        );

        const params: IFloatingFilterParams<IFilter> = _addGridCommonParams(gos, {
            column,
            filterParams,
            currentParentModel: () => this.getCurrentFloatingFilterParentModel(column),
            parentFilterInstance,
            showParentFilter,
        });

        if (isReactive) {
            const displayParams = params as unknown as WithoutGridCommon<FloatingFilterDisplayParams>;
            displayParams.onUiChange = (additionalEventAttributes) =>
                this.floatingFilterUiChanged(column, additionalEventAttributes);
            displayParams.model = _getFilterModel(this.model, column.getColId());
            displayParams.onModelChange = this.createOnModelChange(column, 'floating');
            displayParams.getHandler = () => _getDisplayHandler(this.getHandler(column, true))!;
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
        const source = 'paramsUpdated';
        if (filterWrapper.isHandler) {
            const colId = column.getColId();
            delete this.initialModel[colId];
            this.state.delete(colId);
            const filterUi = filterWrapper.filterUi;
            // the state just deleted is baked into compDetails, so the replacement must re-derive
            const newFilterUi = this.createFilterUiForHandler(compDetails, createFilterUi as any, true);
            filterWrapper.filterUi = newFilterUi;
            const eventSvc = this.eventSvc;
            // destroy the old one after creating the new one
            // so that anything listening to the destroyed event will receive the new comp

            if (filterUi?.created) {
                filterUi.promise.then((filter) => {
                    this.destroyBean(filter);

                    eventSvc.dispatchEvent({
                        type: 'filterDestroyed',
                        source,
                        column,
                    });
                });
            } else {
                eventSvc.dispatchEvent({
                    type: 'filterHandlerDestroyed',
                    source,
                    column,
                });
            }
        } else {
            this.destroyFilter(column, source);
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
        const removeFilter = () => {
            this.setColFilterActive(column, false, 'filterDestroyed');

            this.allColumnFilters.delete(colId);

            this.eventSvc.dispatchEvent({
                type: 'filterDestroyed',
                source,
                column,
            });
        };
        if (filterUi) {
            if (filterUi.created) {
                return filterUi.promise.then((filter) => {
                    isActive = isHandler ? isActive : !!(filter as IFilterComp)?.isFilterActive();

                    this.destroyBean(filter);

                    removeFilter();

                    return isActive;
                });
            } else {
                removeFilter();
            }
        }
        return AgPromise.resolve(isActive);
    }

    /** A floating filter can change the model before its column's filter exists, so only it creates one. */
    private createOnModelChange(
        column: AgColumn,
        source: 'ui' | 'handler' | 'floating'
    ): (model: any, additionalEventAttributes?: any) => void {
        const colId = column.getColId();
        const filterChangedCallback = this.filterChangedCallbackFactory(column);
        return (model, additionalEventAttributes) => {
            this.updateStoredModel(colId, model);
            this.refreshHandlerAndUi(column, model, source, source === 'floating', additionalEventAttributes).then(() =>
                filterChangedCallback({ ...additionalEventAttributes, source: 'columnFilter' })
            );
        };
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

    /** Returns whether the model was cleared, which happens only when the handler could not take the new params. */
    private refreshOrRecreateHandler(
        filterWrapper: HandlerFilterWrapper,
        resolved: ResolvedFilter,
        handlerFunc: HandlerFunc,
        newFilterParams: any,
        source: FilterChangedEventSourceType
    ): boolean {
        const column = filterWrapper.column;
        const colId = column.getColId();
        const handlerGenerator = handlerFunc.handlerGenerator;
        const existingModel = _getFilterModel(this.model, colId);
        let recreateHandler =
            filterWrapper.handlerGenerator != handlerGenerator ||
            getDisplayHandlerName(filterWrapper.handler) !== handlerFunc.displayHandlerName;
        if (!recreateHandler) {
            // `false` means the handler cannot take the new params
            const handlerParams = this.createHandlerParams(column, resolved, newFilterParams);
            filterWrapper.handlerParams = handlerParams;
            recreateHandler =
                filterWrapper.handler.refresh?.({
                    ...handlerParams,
                    source: 'colDef',
                    model: existingModel,
                }) === false;
        }
        if (!recreateHandler) {
            return false;
        }

        const oldHandler = filterWrapper.handler;
        const { handler, handlerParams } = this.createHandlerFromFunc(
            column,
            resolved,
            handlerFunc.filterHandler,
            newFilterParams
        );
        filterWrapper.handler = handler;
        filterWrapper.handlerParams = handlerParams;
        filterWrapper.handlerGenerator = handlerGenerator;

        delete this.model[colId];
        // the ui state describes the model that has just gone
        this.state.delete(colId);
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
        return true;
    }

    public filterParamsChanged(colId: string, source: FilterChangedEventSourceType = 'api'): void {
        const filterWrapper = this.allColumnFilters.get(colId);
        if (!filterWrapper) {
            return;
        }

        const beans = this.beans;
        const column = filterWrapper.column;
        const isFilterAllowed = column.isFilterAllowed();
        const resolved = _resolveFilter(beans, column);

        const handlerFunc = isFilterAllowed ? this.createHandlerFunc(column, resolved) : undefined;
        const isHandler = !!handlerFunc;
        const wasHandler = filterWrapper.isHandler;

        if (wasHandler != isHandler) {
            this.destroyFilter(column, 'paramsUpdated');
            return;
        }
        const { compDetails, createFilterUi } = (isFilterAllowed
            ? this.createFilterComp(column, resolved, (params) => params, isHandler, 'colDef')
            : null) ?? { compDetails: null, createFilterUi: null };

        const newFilterParams =
            compDetails?.params ??
            _mergeFilterParamsWithApplicationProvidedParams(
                beans.userCompFactory,
                resolved.def,
                this.createFilterCompParams(column, isHandler, 'colDef') as IFilterParams
            );

        // a cleared model makes the params derived above stale, so the ui must re-derive them
        let modelCleared = false;
        if (wasHandler) {
            modelCleared = this.refreshOrRecreateHandler(
                filterWrapper,
                resolved,
                handlerFunc!,
                newFilterParams,
                source
            );
        }

        const filterUi = filterWrapper.filterUi;
        if (wasHandler && filterUi && compDetails && !filterUi.created) {
            // nothing has been built from the old col def yet, so swap the plan instead of destroying
            filterWrapper.filterUi = this.createFilterUiForHandler(compDetails, createFilterUi as any, modelCleared);
            return;
        }

        // the ui is bound to its handler and its component, so replacing either, or losing the component, destroys it
        if (
            modelCleared ||
            this.areFilterCompsDifferent(filterUi?.compDetails ?? null, compDetails) ||
            !filterUi ||
            !compDetails
        ) {
            this.destroyFilterUi(filterWrapper, column, compDetails, createFilterUi);
            return;
        }

        filterUi.filterParams = newFilterParams;

        // Otherwise - Check for refresh method before destruction
        // If refresh() method is implemented - call it and destroy filter if it returns false
        // Otherwise - do nothing ( filter will not be destroyed - we assume new params are compatible with old ones )
        getFilterUiFromWrapper(filterWrapper, wasHandler)?.then((filter) => {
            const shouldRefreshFilter = filter?.refresh ? filter.refresh(newFilterParams) : true;
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
        createIfMissing?: boolean,
        additionalEventAttributes?: any
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
            source,
            additionalEventAttributes
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
        const gridColumns = this.beans.colModel.colsList;
        return gridColumns.some((col) => col.getColDef().floatingFilter);
    }

    public getFilterInstance<TFilter extends IFilter>(key: string | AgColumn): Promise<TFilter | null | undefined> {
        const column = this.beans.colModel.getCol(key);

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
            void this.setModelForColumn(key, model).then(resolve);
        });
        this.columnModelUpdates = [];
    }

    public getModelForColumn(column: AgColumn, useUnapplied?: boolean): any {
        if (useUnapplied) {
            const { state, model } = this;
            const colId = column.getColId();
            const colState = state.get(colId);
            if (colState) {
                return colState.model ?? null;
            }
            return _getFilterModel(model, colId);
        }
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

    public getStateForColumn(colId: string): FilterDisplayState {
        return (
            this.state.get(colId) ?? {
                model: _getFilterModel(this.model, colId),
            }
        );
    }

    public setModelForColumnLegacy(key: string | AgColumn, model: any): AgPromise<void> {
        const column = this.beans.colModel.getNonPivotCol(key);
        const filterWrapper = column ? this.getOrCreateFilterWrapper(column, true) : null;
        return filterWrapper ? this.setModelOnFilterWrapper(filterWrapper, model) : AgPromise.resolve();
    }

    public setColDefPropsForDataType(
        colDef: ColDef,
        dataTypeDefinition: CoreDataTypeDefinition,
        formatValue: DataTypeFormatValueFunc
    ): void {
        _setColDefPropsForDataType(this.beans, colDef, dataTypeDefinition, formatValue);
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
                        this.warn(65);
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
        if (this.gos.get('enableFilterHandlers')) {
            this.eventSvc.dispatchEvent({
                type: 'filterUiChanged',
                column,
                ...additionalEventAttributes,
            });
        }
    }

    private floatingFilterUiChanged(column: Column, additionalEventAttributes?: any): void {
        if (this.gos.get('enableFilterHandlers')) {
            this.eventSvc.dispatchEvent({
                type: 'floatingFilterUiChanged',
                column,
                ...additionalEventAttributes,
            });
        }
    }

    public updateModel(column: AgColumn, action: FilterAction, additionalEventAttributes?: any): void {
        const colId = column.getColId();
        const filterWrapper = this.cachedFilter(column);
        const getFilterUi = () =>
            filterWrapper?.filterUi as FilterUi<FilterDisplayComp, FilterDisplayParams> | undefined;
        _updateFilterModel({
            action,
            filterParams: filterWrapper?.filterUi?.filterParams as FilterWrapperParams | undefined,
            getFilterUi,
            getModel: () => _getFilterModel(this.model, colId),
            getState: () => this.state.get(colId),
            updateState: (state) => this.updateState(column, state),
            updateModel: (model) =>
                getFilterUi()?.filterParams?.onModelChange(model, { ...additionalEventAttributes, fromAction: action }),
            processModelToApply: filterWrapper?.isHandler
                ? filterWrapper.handler.processModelToApply?.bind(filterWrapper.handler)
                : undefined,
        });
    }

    public updateAllModels(action: FilterAction, additionalEventAttributes?: any): void {
        const promises: AgPromise<void>[] = [];
        this.allColumnFilters.forEach((filter, colId) => {
            const column = this.beans.colModel.getNonPivotColById(colId);
            if (column) {
                _updateFilterModel({
                    action,
                    filterParams: filter.filterUi?.filterParams as FilterWrapperParams | undefined,
                    getFilterUi: () => filter.filterUi as FilterUi<FilterDisplayComp, FilterDisplayParams> | undefined,
                    getModel: () => _getFilterModel(this.model, colId),
                    getState: () => this.state.get(colId),
                    updateState: (state) => this.updateState(column, state),
                    updateModel: (model) => {
                        this.updateStoredModel(colId, model);
                        this.dispatchLocalEvent<FilterActionEvent>({
                            type: 'filterAction',
                            column,
                            action,
                        });
                        promises.push(this.refreshHandlerAndUi(column, model, 'ui'));
                    },
                    processModelToApply: filter?.isHandler
                        ? filter.handler.processModelToApply?.bind(filter.handler)
                        : undefined,
                });
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

    // for tool panel only
    public canApplyAll(): boolean {
        const { state, model, activeFilterComps } = this;

        for (const comp of activeFilterComps) {
            if (comp.source === 'COLUMN_MENU') {
                // if open in column menu, can't apply as unapplied state will be cleared when the filter closes
                return false;
            }
        }

        let hasChanges = false;

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

    public hasUnappliedModel(colId: string): boolean {
        const { model, state } = this;
        return (state.get(colId)?.model ?? null) !== _getFilterModel(model, colId);
    }

    public setGlobalButtons(isGlobal: boolean): void {
        this.isGlobalButtons = isGlobal;
        this.dispatchLocalEvent<FilterGlobalButtonsEvent>({
            type: 'filterGlobalButtons',
            isGlobal,
        });
    }

    public shouldKeepStateOnDetach(column: Column, lastContainerType?: ContainerType): boolean {
        if (lastContainerType === 'newFiltersToolPanel') {
            // don't reset for new filters tool panel
            return true;
        }

        const filterPanelSvc = this.beans.filterPanelSvc;

        if (filterPanelSvc?.isActive) {
            // if in tool panel, then keep
            return !!filterPanelSvc.getState(column.getColId());
        }

        return false;
    }

    /**
     * When filters are applied in pivotMode, they are stored in `activeAggregateFilters`.
     * When users disable pivotMode (e.g. via sidebar), they expect any applied filters to
     * still be active but just re-applied to the non-pivoted data.
     * This should also apply vice-versa (i.e. applying a filter and then pivoting)
     */
    private onPivotModeChanged(event: AgPropertyValueChangedEvent<GridOptionsWithDefaults, 'pivotMode'>): void {
        const { colModel, pivotColsSvc } = this.beans;
        const groupFilterEnabled = !!_getGroupAggFiltering(this.gos);
        // Can't rely on `colModel.isPivotMode()` because this event hasn't reached to colModel yet
        const isPivotMode = event.currentValue;

        const from = isPivotMode ? this.activeColumnFilters : this.activeAggregateFilters;
        const to = isPivotMode ? this.activeAggregateFilters : this.activeColumnFilters;

        const moved: DoesFilterPassWrapper[] = [];

        for (const filter of from) {
            const column = colModel.colsById[filter.colId];
            // Can't rely on `colModel.isPivotActive()` because this event hasn't reached to colModel yet
            const isPivotActive = isPivotMode && !!pivotColsSvc?.columns.length;
            // Our condition is isPivotMode === isAggFilter because:
            // - if we've enabled pivot mode, we want to only move aggregate filters to `activeAggregateFilters`,
            // - if we've disabled pivot mode, we want to only move non-aggregate filters to `activeColumnFilters`,
            // and do nothing otherwise
            if (column && isPivotMode === isAggFilter(column, isPivotMode, isPivotActive, groupFilterEnabled)) {
                to.push(filter);
                moved.push(filter);
            }
        }

        _removeAllFromArray(from, moved);
    }

    public override destroy() {
        super.destroy();
        this.allColumnFilters.forEach((filterWrapper) => this.disposeFilterWrapper(filterWrapper, 'gridDestroyed'));
        // don't need to destroy the listeners as they are managed listeners
        this.allColumnListeners.clear();
        this.state.clear();
        this.activeFilterComps.clear();
    }
}
