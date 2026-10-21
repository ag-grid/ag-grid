import type { AgEvent, AgPropertyValueChangedEvent } from 'ag-stack';
import { AgPromise, _exists, _isPromise, _jsonEquals, _removeAllFromArray } from 'ag-stack';

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
import { _isFilterFromDataType, _resolveFilter, _setColDefPropsForDataType } from './filterDefResolver';
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

/** A `filterChanged` that a change made before rows load tells once they do. */
interface HeldFilterChange {
    colIds: string[];
    source: FilterChangedEventSourceType;
    column?: AgColumn;
    additionalEventAttributes?: any;
}

/** The columns whose model differs from `before` to `after`, then `extraColIds`, each once. */
const getChangedColIds = (before: FilterModel, after: FilterModel, extraColIds: string[]): string[] => {
    const changed = new Set<string>();
    const beforeColIds = Object.keys(before);
    for (let i = 0, len = beforeColIds.length; i < len; ++i) {
        const colId = beforeColIds[i];
        if (!_jsonEquals(before[colId] ?? null, after[colId] ?? null)) {
            changed.add(colId);
        }
    }
    const afterColIds = Object.keys(after);
    for (let i = 0, len = afterColIds.length; i < len; ++i) {
        const colId = afterColIds[i];
        if (before[colId] == null && after[colId] != null) {
            changed.add(colId);
        }
    }
    for (let i = 0, len = extraColIds.length; i < len; ++i) {
        changed.add(extraColIds[i]);
    }
    return Array.from(changed);
};

export class ColumnFilterService
    extends BeanStub<
        | 'filterParamsChanged'
        | 'filterStateChanged'
        | 'filterAction'
        | 'filterGlobalButtons'
        | 'filterModelAsStringChanged'
        | 'heldFilterModelsChanged'
    >
    implements NamedBean
{
    beanName: BeanName = 'colFilter';

    private readonly allColumnFilters = new Map<string, FilterWrapper>();
    /** The `colDefsVersion` the filters last re-derived their params for. */
    private paramsColDefsVersion = 0;
    private activeAggregateFilters: DoesFilterPassWrapper[] = [];
    private activeColumnFilters: DoesFilterPassWrapper[] = [];

    // this is true when the grid is processing the filter change. this is used by the cell comps, so that they
    // don't flash when data changes due to filter changes. there is no need to flash when filter changes as the
    // user is in control, so doesn't make sense to show flashing changes. for example, go to main demo where
    // this feature is turned off (hack code to always return false for isSuppressFlashingCellsBecauseFiltering(), put in)
    // 100,000 rows and group by country. then do some filtering. all the cells flash, which is silly.
    private processingFilterChange = false;

    /** The `filterChanged` events of changes made through the API before rows load, told in order once they do. */
    private heldChanges: HeldFilterChange[] = [];
    /** The promises `setColumnFilterModel` returned before rows load, settled once they do. */
    private heldResolves: (() => void)[] = [];
    /** The columns the API set a model for before rows load, which a filter rebuilt or a column re-added keeps. */
    private readonly apiHeldColIds = new Set<string>();
    /** Whether a model the API set is being placed before rows load, so what its filter tells of it waits for them. */
    private holdingEvents = false;
    /** Whether a column without a filter shows the indicator of a model held for it, cleared once none is. */
    private pendingFlagsShown = false;

    /** Models no filter holds: the initial state's, a handler's while it is rebuilt, and before rows load those for a
     *  column missing, unable to filter, or whose filter waits for its type and so holds none. */
    private pendingModel: FilterModel;
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
            dataTypesInferred: () => {
                this.beans.setFilterSvc?.createPreservingFilters();
                this.applyHeldModels();
            },
        });

        this.addManagedPropertyListener('pivotMode', this.onPivotModeChanged.bind(this));

        const gos = this.gos;
        this.pendingModel = { ...gos.get('initialState')?.filter?.filterModel };
        this.model = {};
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
        const { colModel, filterManager } = this.beans;
        const { allColumnFilters, apiHeldColIds } = this;
        const holding = this.isHolding();
        const allPromises: AgPromise<void>[] = [];
        // the initial state's models no filter took were never applied, so replacing them changes nothing
        if (!apiHeldColIds.size) {
            this.pendingModel = {};
        }
        const previousModel = this.getModel();
        this.pendingModel = {};
        // before rows load, the columns the model names that cannot filter yet, which may by the time they do
        const unplacedColIds: string[] = [];
        if (holding) {
            apiHeldColIds.clear();
        }

        if (model) {
            // mark the filters as we set them, so any active filters left over we stop
            const modelKeys = new Set(Object.keys(model));

            allColumnFilters.forEach((filterWrapper, colId) => {
                allPromises.push(
                    holding
                        ? this.holdModel(filterWrapper.column, colId, model[colId])
                        : this.setModelOnFilterWrapper(filterWrapper, model[colId])
                );
                modelKeys.delete(colId);
            });

            // at this point, processedFields contains data for which we don't have a filter working yet
            modelKeys.forEach((colId) => {
                const column = colModel.colsById[colId];

                if (holding) {
                    if (!column?.isFilterAllowed() && model[colId] != null) {
                        unplacedColIds.push(colId);
                    }
                    allPromises.push(this.holdModel(column, colId, model[colId]));
                    return;
                }

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
            allColumnFilters.forEach((filterWrapper, colId) => {
                allPromises.push(
                    holding
                        ? this.holdModel(filterWrapper.column, colId, null)
                        : this.setModelOnFilterWrapper(filterWrapper, null)
                );
            });
        }

        AgPromise.all(allPromises).then(() => {
            if (!this.isAlive()) {
                return;
            }
            const currentModel = this.getModel();
            if (holding) {
                const colIds = getChangedColIds(previousModel, currentModel, unplacedColIds);
                // told once the rows load, or at once if they have loaded since
                if (colIds.length && this.isHolding()) {
                    this.heldChanges.push({ colIds, source });
                } else if (colIds.length) {
                    this.tellFilterChanges([{ colIds, source }]);
                }
                this.showHeldModels();
                return;
            }

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

    public getModel(): FilterModel {
        const result: FilterModel = {};

        const {
            allColumnFilters,
            pendingModel,
            beans: { colModel },
        } = this;

        allColumnFilters.forEach((filterWrapper, key) => {
            const model = this.getModelFromFilterWrapper(filterWrapper);

            if (_exists(model)) {
                result[key] = model;
            }
        });

        for (const colId of Object.keys(pendingModel)) {
            const column = colModel.colsById[colId];
            const model = column && !allColumnFilters.has(colId) ? this.getPendingModel(column) : null;
            if (_exists(model)) {
                result[colId] = model;
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
        return this.getPendingModel(filterWrapper.column) ?? this.getFilterOwnModel(filterWrapper);
    }

    /** The model the filter itself holds, without one held for its column. */
    private getFilterOwnModel(filterWrapper: FilterWrapper): any {
        if (filterWrapper.isHandler) {
            return _getFilterModel(this.model, filterWrapper.column.colId);
        }
        const filter = filterWrapper.filter;
        if (filter) {
            if (typeof filter.getModel !== 'function') {
                this.warn(66);
                return null;
            }

            return filter.getModel();
        }
        return filterWrapper.buildModel?.model ?? null;
    }

    /** The model held for a column whose filter holds none, while the column can filter and the Advanced Filter is off. */
    private getPendingModel(column: AgColumn): any {
        const pending = this.pendingModel[column.colId];
        return pending != null && column.isFilterAllowed() && !this.beans.filterManager?.isAdvFilterEnabled()
            ? pending
            : undefined;
    }

    public isFilterPresent(): boolean {
        return this.activeColumnFilters.length > 0;
    }

    public isAggFilterPresent(): boolean {
        return !!this.activeAggregateFilters.length;
    }

    public disableFilters(): boolean {
        this.pendingModel = {};
        this.apiHeldColIds.clear();
        this.heldChanges = [];
        this.settleHeldResolves();
        this.updatePendingFlags();
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
                        const active = this.getPendingModel(column) != null || this.isHandlerActive(column);
                        this.setColFilterActive(column, active, source, additionalEventAttributes);
                    })
                );
            } else {
                const promise = getFilterUiFromWrapper<IFilterComp>(filterWrapper);
                if (promise) {
                    promises.push(
                        promise.then((filter) => {
                            this.setColFilterActive(
                                column,
                                this.getPendingModel(column) != null || filter!.isFilterActive(),
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
        if (this.holdingEvents) {
            this.heldChanges.push({ ...params, colIds: params.columns.map((column) => column.colId) });
            return;
        }
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
        if (this.getPendingModel(column) != null) {
            return true;
        }
        const filterWrapper = this.cachedFilter(column);
        if (filterWrapper?.isHandler) {
            return this.isHandlerActive(column);
        }
        const filter = filterWrapper?.filter;
        return filter ? filter.isFilterActive() : filterWrapper?.buildModel?.model != null;
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
        const colId = column.colId;
        const { pendingModel, model } = this;
        // the filter holds its model from here, unless the rows have yet to give the type it is built for
        const pending = pendingModel[colId];
        const takenModel = pending != null && !this.waitsForType(column) ? pending : null;
        if (takenModel != null) {
            model[colId] = takenModel;
        }
        const { compDetails, handler, handlerGenerator, handlerParams, createFilterUi } = this.createFilterInstance(
            column,
            _resolveFilter(this.beans, column),
            (params) => params
        );
        if (takenModel != null && (handler || createFilterUi)) {
            delete pendingModel[colId];
        }

        if (handler) {
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

        // a component holds its own model, given as it is built
        if (takenModel != null) {
            delete model[colId];
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
            if (takenModel != null) {
                void this.setModelOnFilterWrapper(filterWrapper, takenModel);
            }
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
        const disposals: AgPromise<boolean>[] = [];
        const { filterManager, groupFilter } = this.beans;

        this.allColumnFilters.forEach((wrapper, colId) => {
            // group columns can be recreated with the same colId
            if (this.isCurrentColumn(wrapper.column)) {
                return;
            }
            columns.push(wrapper.column);
            // before rows load the column may be back by the time they do, when the model applies and is told
            const model = this.apiHeldColIds.has(colId) ? this.getModelFromFilterWrapper(wrapper) : null;
            if (model != null) {
                this.pendingModel[colId] = model;
            }
            disposals.push(this.disposeFilterWrapper(wrapper, 'columnChanged'));
        });

        const allFiltersAreGroupFilters = groupFilter && columns.every((col) => groupFilter.isGroupFilter(col));
        // don't call `onFilterChanged` if only group column filter is present as it has no model
        if (columns.length > 0 && !allFiltersAreGroupFilters) {
            // When a filter changes as a side effect of a column changes,
            // we report 'api' as the source, so that the client can distinguish
            filterManager?.onFilterChanged({ columns, source: 'api' });
        }

        const setFilterSvc = this.beans.setFilterSvc;
        const holding = this.isHolding();
        if (setFilterSvc || holding) {
            // After disposal, which frees the colId a recreated column shares.
            AgPromise.all(disposals).then(() => {
                if (!this.isAlive()) {
                    return;
                }
                setFilterSvc?.createPreservingFilters();
                if (!holding) {
                    return;
                }
                // a column back without its filter takes the model the API held for it, if it can now
                const { pendingModel, allColumnFilters } = this;
                const colsById = this.beans.colModel.colsById;
                this.apiHeldColIds.forEach((colId) => {
                    const model = pendingModel[colId];
                    if (model != null && !allColumnFilters.has(colId)) {
                        void this.holdModel(colsById[colId], colId, model);
                    }
                });
                this.showHeldModels();
            });
        }
        this.updatePendingFlags();
    }

    public hasFilter(column: AgColumn): boolean {
        return this.allColumnFilters.has(column.getColId());
    }

    public isCurrentColumn(column: AgColumn): boolean {
        const colModel = this.beans.colModel;
        const colId = column.getColId();
        return (column.primary ? colModel.getNonPivotColById(colId) : colModel.colsById[colId]) === column;
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
            currentParentModel: () => this.getModelForColumn(column),
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

    private destroyFilterUi(
        filterWrapper: FilterWrapper,
        column: AgColumn,
        compDetails: UserCompDetails | null,
        createFilterUi: ((update?: boolean) => AgPromise<IFilterComp>) | null
    ): void {
        const source = 'paramsUpdated';
        if (filterWrapper.isHandler) {
            const colId = column.getColId();
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

    // destroys the filter, so it no longer takes part; one preserving values is recreated empty, to keep seeing them
    public destroyFilter(column: AgColumn, source: 'api' | 'paramsUpdated' = 'api'): void {
        const colId = column.getColId();
        const filterWrapper = this.allColumnFilters.get(colId);

        // a filter rebuilt for new params keeps the model the API set for it, which it takes once built again
        const keptModel =
            source === 'paramsUpdated' && filterWrapper && this.apiHeldColIds.has(colId)
                ? (this.pendingModel[colId] ?? this.getFilterOwnModel(filterWrapper))
                : null;
        if (keptModel == null) {
            this.dropHeldModel(colId);
        } else {
            this.pendingModel[colId] = keptModel;
        }

        if (!filterWrapper) {
            this.showHeldModels();
            return;
        }
        this.disposeFilterWrapper(filterWrapper, source).then((wasActive) => {
            if (!this.isAlive()) {
                return;
            }
            if (wasActive && keptModel == null) {
                this.beans.filterManager?.onFilterChanged({ columns: [column], source: 'api' });
            }
            this.showHeldModels();
            this.beans.setFilterSvc?.createPreservingFilters(column);
        });
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
            // a floating filter shows a model held for the column, so an edit in it is newer than that model
            const afterFloating = source === 'floating' || additionalEventAttributes?.afterFloatingFilter;
            if (afterFloating && (model ?? null) !== (this.pendingModel[colId] ?? null)) {
                this.dropHeldModel(colId);
            }
            this.updateStoredModel(colId, model, additionalEventAttributes?.fromAction);
            this.refreshHandlerAndUi(column, model, source, source === 'floating', additionalEventAttributes).then(() =>
                filterChangedCallback({ ...additionalEventAttributes, source: 'columnFilter' })
            );
        };
    }

    private filterChangedCallbackFactory(column: AgColumn): (additionalEventAttributes?: any) => void {
        return (additionalEventAttributes?: any) => {
            // a component tells of its own change, newer than a model held for it; a handler's goes through its model
            if (!this.cachedFilter(column)?.isHandler) {
                this.dropHeldModel(column.colId);
            }
            // until the rows load, the grid state hears of no `filterChanged`, so reads the change here
            if (this.isHolding()) {
                this.beans.stateSvc?.updateFilterState();
            }
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

    /** Whether a column was redefined since the filters last re-derived their params. */
    public hasRedefinedFilters(): boolean {
        return this.paramsColDefsVersion !== this.beans.colModel.colDefsVersion;
    }

    /** Re-derives the params of the filters redefined so far, running their user callbacks. Only called after a
     *  layout: by `VisibleColsService.refresh` before its layout events, and at the start of each outermost
     *  `endColUpdate` pass, so the re-filter that follows a column definitions change reads the new params. */
    public refreshRedefinedFilters(): void {
        const version = this.beans.colModel.colDefsVersion;
        if (version === this.paramsColDefsVersion) {
            return;
        }
        // a handler rebuilt before rows load, or as their types redefine it, keeps a model the API set for it; a
        // component keeps its own as it is destroyed
        const apiHeldColIds = this.apiHeldColIds;
        this.allColumnFilters.forEach((wrapper, colId) => {
            const column = wrapper.column;
            if (!column.takeFilterRedefined()) {
                return;
            }
            const model =
                wrapper.isHandler && apiHeldColIds.has(colId) ? this.getModelFromFilterWrapper(wrapper) : null;
            if (model == null) {
                this.rebuildFilter(colId);
                return;
            }
            // held while rebuilt, so the rebuild neither drops it nor tells of it
            this.pendingModel[colId] = model;
            delete this.model[colId];
            this.rebuildFilter(colId);
            if (column.isFilterAllowed() && !this.waitsForType(column)) {
                void this.holdModel(column, colId, model);
            }
        });
        this.paramsColDefsVersion = version;
        this.updatePendingFlags();
    }

    /** A filter whose params change of its own accord, as a Selectable Filter switching, starts empty, as with rows. */
    public filterParamsChanged(colId: string, source: FilterChangedEventSourceType = 'api'): void {
        if (this.pendingModel[colId] != null) {
            this.dropHeldModel(colId);
            this.showHeldModels();
        }
        this.rebuildFilter(colId, source);
    }

    private rebuildFilter(colId: string, source: FilterChangedEventSourceType = 'api'): void {
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
            const shouldRefreshFilter: unknown = filter?.refresh ? filter.refresh(newFilterParams) : true;
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
        column.takeFilterRedefined(); // the new filter derives its params from the definition the column holds now
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

    /** Once the rows give the types, the models no filter could take apply, then what the API changed is told. */
    private applyHeldModels(): void {
        const colModel = this.beans.colModel;
        const { pendingModel, heldChanges, apiHeldColIds } = this;
        this.heldChanges = [];
        const applied: AgPromise<void>[] = [];
        const heldColIds = Array.from(apiHeldColIds);
        // without an API call the models held are the initial state's, which the grid state or a filter built takes
        if (apiHeldColIds.size) {
            const namedColIds = new Set<string>();
            for (let i = 0, len = heldChanges.length; i < len; ++i) {
                const colIds = heldChanges[i].colIds;
                for (let j = 0, colCount = colIds.length; j < colCount; ++j) {
                    namedColIds.add(colIds[j]);
                }
            }
            const colIds = Object.keys(pendingModel);
            for (let i = 0, len = colIds.length; i < len; ++i) {
                const colId = colIds[i];
                if (!apiHeldColIds.has(colId)) {
                    continue;
                }
                const column = colModel.colsById[colId];
                if (column?.isFilterAllowed()) {
                    applied.push(this.setModelForColumnLegacy(column, pendingModel[colId]));
                    continue;
                }
                delete pendingModel[colId];
                if (namedColIds.has(colId)) {
                    this.warn(column ? 63 : 62, { colId });
                }
            }
            apiHeldColIds.clear();
        }
        AgPromise.all(applied).then(() => {
            if (!this.isAlive()) {
                return;
            }
            if (applied.length) {
                this.updateActive('filterChanged');
            }
            // a filter given the API's model for a type it was not built for holds none, so tells nothing of it
            const rejectedColIds = new Set<string>();
            const colsById = colModel.colsById;
            for (let i = 0, len = heldColIds.length; i < len; ++i) {
                const column = colsById[heldColIds[i]];
                if (column && this.getModelForColumn(column) == null) {
                    rejectedColIds.add(heldColIds[i]);
                }
            }
            this.tellFilterChanges(heldChanges, rejectedColIds);
            this.settleHeldResolves();
        });
    }

    /** Tells each change for the columns that can filter now, leaving out the API's for a model a filter rejected. */
    private tellFilterChanges(changes: HeldFilterChange[], rejectedColIds?: Set<string>): void {
        const { colModel, filterManager } = this.beans;
        const colsById = colModel.colsById;
        for (let i = 0, len = changes.length; i < len; ++i) {
            const { colIds, source, column, additionalEventAttributes } = changes[i];
            // a filter telling of its own change, its rejection of the model included, is told as it was
            const rejected = column ? undefined : rejectedColIds;
            const columns: AgColumn[] = [];
            for (let j = 0, colCount = colIds.length; j < colCount; ++j) {
                const changedColumn = colsById[colIds[j]];
                if (changedColumn?.isFilterAllowed() && !rejected?.has(colIds[j])) {
                    columns.push(changedColumn);
                }
            }
            if (columns.length || !colIds.length) {
                filterManager?.onFilterChanged({ columns, source, column, additionalEventAttributes });
            }
        }
    }

    /**
     * Before rows load, the column's filter takes the model if its type is known; else the model is held for the
     * rows, and a filter built for a type they may change holds none.
     */
    private holdModel(column: AgColumn | null | undefined, colId: string, model: any): AgPromise<void> {
        const pendingModel = this.pendingModel;
        const filterWrapper = this.allColumnFilters.get(colId);
        if (model != null) {
            this.apiHeldColIds.add(colId);
        } else {
            this.apiHeldColIds.delete(colId);
        }
        const wasHoldingEvents = this.holdingEvents;
        this.holdingEvents = true;
        try {
            if (column?.isFilterAllowed() && !this.waitsForType(column)) {
                delete pendingModel[colId];
                const target = filterWrapper ?? this.getOrCreateFilterWrapper(column, true);
                return target ? this.setModelOnFilterWrapper(target, model, !filterWrapper) : AgPromise.resolve();
            }
            const reset = filterWrapper ? this.setModelOnFilterWrapper(filterWrapper, null) : AgPromise.resolve<void>();
            if (model != null) {
                pendingModel[colId] = model;
            } else {
                delete pendingModel[colId];
            }
            if (column && !filterWrapper) {
                // the column tells of the model held for it as a filter taking it would
                this.setColFilterActive(column, this.getPendingModel(column) != null, 'filterChanged');
            }
            return reset;
        } finally {
            this.holdingEvents = wasHoldingEvents;
        }
    }

    /** A change in the filter is newer than a model held for it, unless it is the filter taking the API's own. */
    private dropHeldModel(colId: string): void {
        if (this.holdingEvents) {
            return;
        }
        delete this.pendingModel[colId];
        this.apiHeldColIds.delete(colId);
    }

    private settleHeldResolves(): void {
        const resolves = this.heldResolves;
        this.heldResolves = [];
        for (let i = 0, len = resolves.length; i < len; ++i) {
            resolves[i]();
        }
    }

    private isHolding(): boolean {
        return !!this.beans.dataTypeSvc?.isPendingInference;
    }

    /** Whether the column's filter is built for a type the rows have yet to give. */
    private waitsForType(column: AgColumn): boolean {
        const beans = this.beans;
        return !!beans.dataTypeSvc?.isColPendingInference(column.colId) && _isFilterFromDataType(beans, column);
    }

    /** What shows the filters follows the models held before rows load; once they do, a told change does that. */
    private showHeldModels(): void {
        if (this.isHolding()) {
            this.updateActive('filterChanged');
            this.beans.stateSvc?.updateFilterState();
            this.dispatchLocalEvent({ type: 'heldFilterModelsChanged' });
        }
        this.updatePendingFlags();
    }

    /** A column whose filter is not built shows whether a model is held for it, unless the Advanced Filter is on. */
    private updatePendingFlags(): void {
        const { allColumnFilters, pendingModel, beans } = this;
        if (!this.pendingFlagsShown && !Object.keys(pendingModel).length) {
            return;
        }
        const groupFilter = beans.groupFilter;
        const cols = beans.colModel.getCols();
        let shown = false;
        for (let i = 0, len = cols.length; i < len; ++i) {
            const column = cols[i];
            if (allColumnFilters.has(column.colId) || groupFilter?.isGroupFilter(column)) {
                continue;
            }
            const active = this.getPendingModel(column) != null;
            if (active !== column.isFilterActive()) {
                this.setColFilterActive(column, active, 'filterChanged');
            }
            shown ||= active;
        }
        this.pendingFlagsShown = shown;
    }

    /** Whether a model is held for a column whose filter does not hold it, unless the Advanced Filter is on. */
    public hasPendingModel(): boolean {
        const { pendingModel, beans } = this;
        if (beans.filterManager?.isAdvFilterEnabled()) {
            return false;
        }
        const colsById = beans.colModel.colsById;
        const colIds = Object.keys(pendingModel);
        for (let i = 0, len = colIds.length; i < len; ++i) {
            const colId = colIds[i];
            if (pendingModel[colId] != null && colsById[colId]?.isFilterAllowed()) {
                return true;
            }
        }
        return false;
    }

    public getModelForColumn(column: AgColumn, useUnapplied?: boolean): any {
        if (useUnapplied) {
            const colId = column.colId;
            const stored = _getFilterModel(this.model, colId);
            const colState = this.state.get(colId);
            const unapplied = colState ? (colState.model ?? null) : stored;
            // an edit not applied yet is newer than a model held for the column
            if (unapplied !== stored) {
                return unapplied;
            }
            return this.getPendingModel(column) ?? stored;
        }
        const filterWrapper = this.cachedFilter(column);
        return filterWrapper ? this.getModelFromFilterWrapper(filterWrapper) : (this.getPendingModel(column) ?? null);
    }

    public setModelForColumn(key: string | AgColumn, model: any): Promise<void> {
        if (!this.isHolding()) {
            return new Promise((resolve) => {
                this.setModelForColumnLegacy(key, model).then((result) => resolve(result!));
            });
        }
        // the filter takes the model at once if it can, else it is held for the rows; the promise waits for both
        const column = this.beans.colModel.getNonPivotCol(key);
        const colId = column?.colId ?? (typeof key === 'string' ? key : null);
        const applied = colId == null ? AgPromise.resolve<void>() : this.holdModel(column, colId, model);
        this.showHeldModels();
        return new Promise((resolve) => {
            this.heldResolves.push(() => {
                applied.then(() => {
                    if (this.isAlive()) {
                        resolve();
                    }
                });
            });
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
        if (!column) {
            return AgPromise.resolve();
        }
        // a model set on the filter is newer than one held for it, which it must not be built with
        delete this.pendingModel[column.colId];
        const filterWrapper = this.getOrCreateFilterWrapper(column, true);
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
        if (column.isFilterActive() !== active) {
            column.setFilterActive(active);
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
                // a component being built takes only the newest model it is given, so an older one resolves at once
                const buildModel = filterWrapper.filter ? undefined : { model: newModel };
                filterWrapper.buildModel = buildModel;
                uiPromise.then((filter) => {
                    if (filterWrapper.buildModel !== buildModel) {
                        resolve();
                        return;
                    }
                    filterWrapper.buildModel = undefined;
                    this.setModelOnFilterComp(filter, newModel, resolve);
                });
                return;
            }

            // no handler and no filter comp
            resolve();
        });
    }

    /** Calls `applied` once the filter has the model, after the promise its `setModel` may return. */
    private setModelOnFilterComp(filter: IFilterComp | null, newModel: any, applied: () => void): void {
        if (typeof filter?.setModel !== 'function') {
            this.warn(65);
            applied();
            return;
        }
        const modelApplied: unknown = filter.setModel(newModel);
        if (modelApplied != null && _isPromise(modelApplied)) {
            void modelApplied.then(() => applied());
        } else {
            applied();
        }
    }

    /** for handlers only */
    private updateStoredModel(colId: string, model: any, action?: FilterAction): void {
        // a change in the filter, or the filter emptied, is newer than a model held for it
        if ((action && action !== 'apply') || (model ?? null) !== _getFilterModel(this.model, colId)) {
            this.dropHeldModel(colId);
        }
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
                        this.updateStoredModel(colId, model, action);
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
        this.state.clear();
        this.activeFilterComps.clear();
    }
}
