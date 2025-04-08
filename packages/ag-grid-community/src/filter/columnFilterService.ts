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
import type { ColDef, ValueFormatterParams, ValueGetterParams } from '../entities/colDef';
import type {
    CoreDataTypeDefinition,
    DataTypeFormatValueFunc,
    DateStringDataTypeDefinition,
} from '../entities/dataType';
import type { RowNode } from '../entities/rowNode';
import type { AgEvent, ColumnEventType, FilterChangedEventSourceType } from '../events';
import { _addGridCommonParams, _getGroupAggFiltering, _isSetFilterByDefault } from '../gridOptionsUtils';
import type { Column } from '../interfaces/iColumn';
import type { WithoutGridCommon } from '../interfaces/iCommon';
import type {
    BaseFilterParams,
    FilterAction,
    FilterDisplayComp,
    FilterDisplayParams,
    FilterDisplayState,
    FilterEvaluator,
    FilterEvaluatorGeneratorFunc,
    FilterEvaluatorParams,
    FilterModel,
    IFilter,
    IFilterComp,
    IFilterDef,
    IFilterParams,
} from '../interfaces/iFilter';
import type { UserCompDetails } from '../interfaces/iUserCompDetails';
import { _exists, _jsonEquals } from '../utils/generic';
import { AgPromise } from '../utils/promise';
import { _error, _warn } from '../validation/logging';
import type {
    FloatingFilterDisplayParams,
    IFloatingFilterParams,
    IFloatingFilterParentCallback,
} from './floating/floatingFilter';
import { _getDefaultFloatingFilterType } from './floating/floatingFilterMapper';

const MONTH_LOCALE_TEXT = {
    january: 'January',
    february: 'February',
    march: 'March',
    april: 'April',
    may: 'May',
    june: 'June',
    july: 'July',
    august: 'August',
    september: 'September',
    october: 'October',
    november: 'November',
    december: 'December',
};
const MONTH_KEYS: (keyof typeof MONTH_LOCALE_TEXT)[] = [
    'january',
    'february',
    'march',
    'april',
    'may',
    'june',
    'july',
    'august',
    'september',
    'october',
    'november',
    'december',
];

const EVALUATOR_MAP = {
    agSetColumnFilter: 'agSetColumnFilterEvaluator',
    agMultiColumnFilter: 'agMultiColumnFilterEvaluator',
    agGroupColumnFilter: 'agGroupColumnFilterEvaluator',
    agNumberColumnFilter: 'agNumberColumnFilterEvaluator',
    agDateColumnFilter: 'agDateColumnFilterEvaluator',
    agTextColumnFilter: 'agTextColumnFilterEvaluator',
} as const;

type EvaluatorName = (typeof EVALUATOR_MAP)[keyof typeof EVALUATOR_MAP];

function setFilterNumberComparator(a: string, b: string): number {
    if (a == null) {
        return -1;
    }
    if (b == null) {
        return 1;
    }
    return parseFloat(a) - parseFloat(b);
}

interface CompDoesFilterPassWrapper {
    isEvaluator: false;
    colId: string;
    comp: IFilterComp;
}

interface EvaluatorDoesFilterPassWrapper {
    isEvaluator: true;
    colId: string;
    evaluator: FilterEvaluator;
}

type DoesFilterPassWrapper = CompDoesFilterPassWrapper | EvaluatorDoesFilterPassWrapper;

export interface FilterDisplayWrapper {
    comp: IFilterComp | FilterDisplayComp;
    params: IFilterParams | FilterDisplayParams;
    isEvaluator: boolean;
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

export class ColumnFilterService
    extends BeanStub<'filterParamsChanged' | 'filterStateChanged' | 'filterAction'>
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
    private filterModelUpdateQueue: { model: FilterModel | null; source: FilterChangedEventSourceType }[] = [];
    private columnFilterModelUpdateQueue: { key: string | AgColumn; model: any; resolve: () => void }[] = [];

    private initialFilterModel: FilterModel;
    /** This may not contain the model for non-evaluator columns */
    private model: FilterModel;
    /** This contains the UI state for evaluator columns */
    private state: Map<string, FilterDisplayState> = new Map();
    private evaluatorMap: { -readonly [K in keyof typeof EVALUATOR_MAP]?: (typeof EVALUATOR_MAP)[K] } = {
        ...EVALUATOR_MAP,
    };

    public postConstruct(): void {
        this.addManagedEventListeners({
            gridColumnsChanged: this.onColumnsChanged.bind(this),
            beforeRefreshModel: ({ params }) => {
                // We listen to both row data updated and treeData changed as the SetFilter needs it
                if (params.rowDataUpdated || params.changedProps?.has('treeData')) {
                    this.onNewRowsLoaded('rowDataUpdated');
                }
            },
            dataTypesInferred: this.processFilterModelUpdateQueue.bind(this),
        });

        this.initialFilterModel = {
            ...(this.gos.get('initialState')?.filter?.filterModel ?? {}),
        };
        this.model = {
            ...this.initialFilterModel,
        };
        if (!this.gos.getAsBool('enableFilterEvaluators')) {
            delete this.evaluatorMap['agMultiColumnFilter'];
        }
    }

    public setModel(model: FilterModel | null, source: FilterChangedEventSourceType = 'api'): void {
        const { colModel, dataTypeSvc, filterManager } = this.beans;
        if (dataTypeSvc?.isPendingInference) {
            this.filterModelUpdateQueue.push({ model, source });
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

                const filterWrapper = this.getOrCreateFilterWrapper(column);
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
            initialFilterModel,
            beans: { colModel },
        } = this;

        allColumnFilters.forEach((filterWrapper, key) => {
            const model = this.getModelFromFilterWrapper(filterWrapper);

            if (_exists(model)) {
                result[key] = model;
            }
        });

        if (!excludeInitialState) {
            for (const colId of Object.keys(initialFilterModel)) {
                const model = initialFilterModel[colId];
                if (_exists(model) && !allColumnFilters.has(colId) && colModel.getCol(colId)?.isFilterAllowed()) {
                    result[colId] = model;
                }
            }
        }

        return result;
    }

    private getModelFromFilterWrapper(filterWrapper: FilterWrapper): any {
        const column = filterWrapper.column;
        if (filterWrapper.isEvaluator) {
            return this.getModelForEvaluator(column);
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
        return this.getModelFromInitialState(column);
    }

    public getModelForEvaluator(column: Column): any {
        return this.model[column.getColId()] ?? null;
    }

    public getModelFromInitialState(column: Column): any {
        return this.initialFilterModel[column.getColId()] ?? null;
    }

    public isFilterPresent(): boolean {
        return this.activeColumnFilters.length > 0;
    }

    public isAggFilterPresent(): boolean {
        return !!this.activeAggregateFilters.length;
    }

    public disableFilters(): boolean {
        this.initialFilterModel = {};
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
            if (filterWrapper.isEvaluator) {
                promises.push(
                    AgPromise.resolve().then(() => {
                        addFilter(column, this.isEvaluatorActive(column), {
                            colId,
                            isEvaluator: true,
                            evaluator: filterWrapper.evaluator,
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
                                isEvaluator: false,
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
            if (filterWrapper.isEvaluator) {
                promises.push(
                    AgPromise.resolve().then(() => {
                        this.setColFilterActive(
                            column,
                            this.isEvaluatorActive(column),
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
        for (let i = 0; i < targetedFilters.length; i++) {
            const filter = targetedFilters[i];
            const { colId, isEvaluator } = filter;

            if (colId === colIdToSkip) {
                continue;
            }

            if (isEvaluator) {
                const evaluator = filter.evaluator;
                const model = this.model[colId] ?? null;
                if (!evaluator.doesFilterPass({ node, data: targetedData, model })) {
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

    // sometimes (especially in React) the filter can call onFilterChanged when we are in the middle
    // of a render cycle. this would be bad, so we wait for render cycle to complete when this happens.
    // this happens in react when we change React State in the grid (eg setting RowCtrl's in RowContainer)
    // which results in React State getting applied in the main application, triggering a useEffect() to
    // be kicked off adn then the application calling the grid's API. in AG-6554, the custom filter was
    // getting it's useEffect() triggered in this way.
    private callOnFilterChangedOutsideRenderCycle(params: {
        source: FilterChangedEventSourceType;
        additionalEventAttributes?: any;
        column: AgColumn;
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
                    const { column: filterColumn, isEvaluator } = filterWrapper;
                    if (colId === filterColumn.getColId()) {
                        return;
                    }
                    if (isEvaluator) {
                        filterWrapper.evaluator.onAnyFilterChanged?.();
                    }
                    getFilterUiFromWrapper(filterWrapper, isEvaluator)?.then((filter) => {
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
            const isEvaluator = filterWrapper.isEvaluator;
            if (isEvaluator) {
                filterWrapper.evaluator.onNewRowsLoaded?.();
            }
            const promise = getFilterUiFromWrapper(filterWrapper, isEvaluator);
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

    private createGetValue(filterColumn: AgColumn): IFilterParams['getValue'] {
        const { filterValueSvc, colModel } = this.beans;
        return (rowNode, column) => {
            const columnToUse = column ? colModel.getCol(column) : filterColumn;
            return columnToUse ? filterValueSvc!.getValue(columnToUse, rowNode) : undefined;
        };
    }

    public isFilterActive(column: AgColumn): boolean {
        const filterWrapper = this.cachedFilter(column);
        if (filterWrapper?.isEvaluator) {
            return this.isEvaluatorActive(column);
        }
        const filter = filterWrapper?.filter;
        if (filter) {
            return filter.isFilterActive();
        }
        // if not created, should only be active if there's a model
        return this.getModelFromInitialState(column) != null;
    }

    private isEvaluatorActive(column: AgColumn): boolean {
        // all the existing filter code uses `_exists` rather than not null,
        // so need to keep handling `''` until all the code is updated to do a simple null check
        const active = _exists(this.model[column.getColId()]);
        if (active) {
            return active;
        }
        const groupFilter = this.beans.groupFilter;
        return groupFilter?.isGroupFilter(column) ? groupFilter.isFilterActive(column) : false;
    }

    public getOrCreateFilterUi(column: AgColumn): AgPromise<IFilterComp> | null {
        const filterWrapper = this.getOrCreateFilterWrapper(column);
        return filterWrapper ? getFilterUiFromWrapper(filterWrapper) : null;
    }

    public getFilterUiForDisplay(column: AgColumn): AgPromise<FilterDisplayWrapper> | null {
        const filterWrapper = this.getOrCreateFilterWrapper(column);
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
            isEvaluator: filterWrapper.isEvaluator,
        }));
    }

    public getEvaluator(column: AgColumn): FilterEvaluator | undefined {
        const filterWrapper = this.cachedFilter(column);
        return filterWrapper?.isEvaluator ? filterWrapper.evaluator : undefined;
    }

    private getOrCreateEvaluator(column: AgColumn): FilterEvaluator | undefined {
        const filterWrapper = this.getOrCreateFilterWrapper(column);
        return filterWrapper?.isEvaluator ? filterWrapper.evaluator : undefined;
    }

    private getOrCreateFilterWrapper(column: AgColumn): FilterWrapper | null {
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
        const { gos, dataTypeSvc } = this.beans;
        if (_isSetFilterByDefault(gos)) {
            defaultFilter = 'agSetColumnFilter';
        } else {
            const cellDataType = dataTypeSvc?.getBaseDataType(column);
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
        const { gos, dataTypeSvc } = this.beans;
        if (_isSetFilterByDefault(gos)) {
            defaultFloatingFilterType = 'agSetColumnFloatingFilter';
        } else {
            const cellDataType = dataTypeSvc?.getBaseDataType(column);
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

    private createFilterInstanceForColumn(column: AgColumn): {
        compDetails: UserCompDetails | null;
        evaluator?: FilterEvaluator;
        evaluatorGenerator?: FilterEvaluatorGeneratorFunc | EvaluatorName;
        evaluatorParams?: FilterEvaluatorParams;
        createFilterUi: ((update?: boolean) => AgPromise<IFilterComp | FilterDisplayComp>) | null;
    } {
        const defaultFilter = this.getDefaultFilter(column);

        const colDef = column.getColDef();

        return this.createFilterInstance(column, colDef, defaultFilter, (params) => params);
    }

    private createFilterComp(
        column: AgColumn,
        filterDef: IFilterDef,
        defaultFilter: string,
        getFilterParams: (defaultParams: BaseFilterParams, isEvaluator: boolean) => BaseFilterParams,
        isEvaluator: boolean,
        source: 'init' | 'colDef'
    ): {
        compDetails: UserCompDetails;
        createFilterUi: (update?: boolean) => AgPromise<IFilterComp>;
    } | null {
        const createFilterCompDetails = () => {
            const params = this.createFilterCompParams(column, isEvaluator, source);
            const updatedParams = getFilterParams(params, isEvaluator);

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
        getFilterParams: (defaultParams: BaseFilterParams, isEvaluator: boolean) => BaseFilterParams
    ): {
        compDetails: UserCompDetails | null;
        evaluator?: FilterEvaluator;
        evaluatorGenerator?: FilterEvaluatorGeneratorFunc | EvaluatorName;
        evaluatorParams?: FilterEvaluatorParams;
        createFilterUi: ((update?: boolean) => AgPromise<IFilterComp>) | null;
    } {
        const { evaluator, evaluatorParams, evaluatorGenerator } =
            this.createEvaluator(column, filterDef, defaultFilter) ?? {};

        const filterCompDetails = this.createFilterComp(
            column,
            filterDef,
            defaultFilter,
            getFilterParams,
            !!evaluator,
            'init'
        );

        if (!filterCompDetails) {
            return { compDetails: null, createFilterUi: null, evaluator, evaluatorGenerator, evaluatorParams };
        }

        const { compDetails, createFilterUi } = filterCompDetails;

        return {
            compDetails,
            evaluator,
            evaluatorGenerator,
            evaluatorParams,
            createFilterUi,
        };
    }

    public createBaseFilterParams(column: AgColumn, forFloatingFilter?: boolean): BaseFilterParams {
        return _addGridCommonParams(this.gos, {
            column,
            colDef: column.getColDef(),
            getValue: this.createGetValue(column),
            doesRowPassOtherFilter: forFloatingFilter
                ? () => true
                : (node) =>
                      this.beans.filterManager?.doesRowPassOtherFilters(column.getColId(), node as RowNode) ?? true,
            // to avoid breaking changes to `filterParams` defined as functions
            // we need to provide the below options even though they are not valid for evaluators
            rowModel: this.beans.rowModel,
        });
    }

    private createFilterCompParams(
        column: AgColumn,
        useEvaluator: boolean,
        source: 'init' | 'colDef',
        forFloatingFilter?: boolean
    ): BaseFilterParams {
        const filterChangedCallback = this.filterChangedCallbackFactory(column);

        const params: IFilterParams = this.createBaseFilterParams(column, forFloatingFilter) as IFilterParams;
        params.filterChangedCallback = filterChangedCallback;
        params.filterModifiedCallback = forFloatingFilter
            ? () => {}
            : (additionalEventAttributes?: any) => this.filterModified(column, additionalEventAttributes);

        if (useEvaluator) {
            const displayParams = params as unknown as FilterDisplayParams;
            const model = this.getModelForEvaluator(column);
            displayParams.model = model;
            const colId = column.getColId();
            displayParams.state = this.state.get(colId) ?? {
                model,
            };
            displayParams.onModelChange = (model, additionalEventAttributes) => {
                this.model[colId] = model;
                this.refreshEvaluatorAndUi(column, model, 'ui').then(() => {
                    filterChangedCallback({ ...additionalEventAttributes, source: 'columnFilter' });
                });
            };
            const filterStateCallback = (additionalEventAttributes?: any) =>
                this.filterUiChanged(column, additionalEventAttributes);
            displayParams.onStateChange = (state, additionalEventAttributes) => {
                this.updateState(column, state);
                filterStateCallback(additionalEventAttributes);
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
            displayParams.getEvaluator = () => this.getOrCreateEvaluator(column)!;
            displayParams.onUiChange = filterStateCallback;
            displayParams.source = source;
        }

        return params;
    }

    private createFilterUiForEvaluator(
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
        const { compDetails, evaluator, evaluatorGenerator, evaluatorParams, createFilterUi } =
            this.createFilterInstanceForColumn(column);

        if (evaluator) {
            delete this.initialFilterModel[column.getColId()];
            evaluator.init?.(evaluatorParams!);
            return {
                column,
                isEvaluator: true,
                evaluator,
                evaluatorGenerator: evaluatorGenerator!,
                evaluatorParams: evaluatorParams!,
                filterUi: this.createFilterUiForEvaluator(compDetails, createFilterUi as any),
            };
        }

        if (createFilterUi) {
            const filterWrapper: LegacyFilterWrapper = {
                column,
                filterUi: null,
                isEvaluator: false,
            } as const;
            filterWrapper.filterUi = this.createFilterUiLegacy(compDetails, createFilterUi as any, (filterComp) => {
                filterWrapper.filter = filterComp ?? undefined;
            });
            return filterWrapper;
        }

        return {
            column,
            filterUi: null,
            isEvaluator: false,
        };
    }

    private createEvaluatorFunc(
        filterDef: IFilterDef,
        defaultFilter: string
    ): { filterEvaluator: FilterEvaluatorGeneratorFunc; evaluatorName?: EvaluatorName } | undefined {
        let filterEvaluator = filterDef.filterEvaluator;
        let evaluatorName: EvaluatorName | undefined;
        if (!filterEvaluator) {
            let filterName: string | undefined;
            const { compName, jsComp, fwComp } = _getFilterCompKeys(this.beans.frameworkOverrides, filterDef);
            if (compName) {
                filterName = compName;
            } else {
                const usingDefaultFilter = jsComp == null && fwComp == null && filterDef.filter === true;
                if (usingDefaultFilter) {
                    filterName = defaultFilter;
                }
            }
            evaluatorName = EVALUATOR_MAP[filterName as keyof typeof EVALUATOR_MAP];
            if (evaluatorName) {
                filterEvaluator = () =>
                    this.createBean(
                        this.beans.registry.createDynamicBean<FilterEvaluator & BeanStub>(evaluatorName!, true)!
                    );
            }
        }
        if (!filterEvaluator) {
            return undefined;
        }
        return { filterEvaluator, evaluatorName };
    }

    public createEvaluator(
        column: AgColumn,
        filterDef: IFilterDef,
        defaultFilter: string
    ):
        | {
              evaluator: FilterEvaluator;
              evaluatorParams: FilterEvaluatorParams;
              evaluatorGenerator: FilterEvaluatorGeneratorFunc | EvaluatorName;
          }
        | undefined {
        const evaluatorFunc = this.createEvaluatorFunc(filterDef, defaultFilter);
        if (!evaluatorFunc) {
            return undefined;
        }
        const filterParams = _mergeFilterParamsWithApplicationProvidedParams(
            this.beans.userCompFactory,
            column.colDef,
            this.createFilterCompParams(column, true, 'init') as IFilterParams
        );
        const { evaluatorName, filterEvaluator } = evaluatorFunc;
        const { evaluator, evaluatorParams } = this.createEvaluatorFromFunc(column, filterEvaluator, filterParams);
        return { evaluator, evaluatorParams, evaluatorGenerator: evaluatorName ?? filterEvaluator };
    }

    private createEvaluatorFromFunc(
        column: AgColumn,
        filterEvaluator: FilterEvaluatorGeneratorFunc,
        filterParams: any
    ): { evaluator: FilterEvaluator; evaluatorParams: FilterEvaluatorParams } {
        const colDef = column.getColDef();
        const evaluator = filterEvaluator(_addGridCommonParams(this.gos, { column, colDef }));
        const evaluatorParams = this.createEvaluatorParams(column, 'init', filterParams);
        return { evaluator, evaluatorParams };
    }

    private createEvaluatorParams(
        column: AgColumn,
        source: 'init' | 'ui' | 'api' | 'colDef',
        filterParams: any
    ): FilterEvaluatorParams {
        const colDef = column.getColDef();
        const colId = column.getColId();
        const filterChangedCallback = this.filterChangedCallbackFactory(column);
        return _addGridCommonParams(this.gos, {
            colDef,
            column,
            getValue: this.createGetValue(column),
            doesRowPassOtherFilter: (node) =>
                this.beans.filterManager?.doesRowPassOtherFilters(colId, node as RowNode) ?? true,
            source,
            model: this.getModelForEvaluator(column),
            onModelChange: (newModel, additionalEventAttributes) => {
                this.model[colId] = newModel;
                this.refreshEvaluatorAndUi(column, newModel, 'evaluator').then(() => {
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
        const { userCompFactory, frameworkOverrides } = this.beans;

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

        const defaultFloatingFilterType =
            _getDefaultFloatingFilterType(frameworkOverrides, colDef, () => this.getDefaultFloatingFilter(column)) ??
            'agReadOnlyFloatingFilter';
        const isReactive = this.gos.getAsBool('enableFilterEvaluators');
        const filterParams = _mergeFilterParamsWithApplicationProvidedParams(
            userCompFactory,
            colDef,
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
            displayParams.model = this.getModelForEvaluator(column);
            displayParams.onModelChange = (model, additionalEventAttributes) => {
                this.model[colId] = model;
                this.refreshEvaluatorAndUi(column, model, 'floating', true).then(() => {
                    filterChangedCallback({ ...additionalEventAttributes, source: 'columnFilter' });
                });
            };
            displayParams.getEvaluator = () => this.getOrCreateEvaluator(column)!;
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
        if (filterWrapper.isEvaluator) {
            delete this.initialFilterModel[column.getColId()];
            const filterUi = filterWrapper.filterUi;
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
            const newFilterUi = this.createFilterUiForEvaluator(compDetails, createFilterUi as any);
            filterWrapper.filterUi = newFilterUi;
        } else {
            this.destroyFilter(column, 'paramsUpdated');
        }
    }

    // destroys the filter, so it no longer takes part
    public destroyFilter(column: AgColumn, source: 'api' | 'paramsUpdated' = 'api'): void {
        const colId = column.getColId();
        const filterWrapper = this.allColumnFilters.get(colId);

        this.disposeColumnListener(colId);

        delete this.initialFilterModel[colId];

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
        const { column, isEvaluator, filterUi } = filterWrapper;
        if (isEvaluator) {
            isActive = this.isEvaluatorActive(column);
            this.destroyBean(filterWrapper.evaluator);
            delete this.model[column.getColId()];
        }
        if (filterUi) {
            if (filterUi.created) {
                return filterUi.promise.then((filter) => {
                    isActive = isEvaluator ? isActive : !!(filter as IFilterComp)?.isFilterActive();

                    this.destroyBean(filter);

                    this.setColFilterActive(column, false, 'filterDestroyed');

                    this.allColumnFilters.delete(column.getColId());

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

    private filterParamsChanged(colId: string): void {
        const filterWrapper = this.allColumnFilters.get(colId);
        if (!filterWrapper) {
            return;
        }

        const column = filterWrapper.column;
        const colDef = column.getColDef();
        const isFilterAllowed = column.isFilterAllowed();
        const defaultFilter = this.getDefaultFilter(column);

        const evaluatorFunc = isFilterAllowed
            ? this.createEvaluatorFunc(colDef, this.getDefaultFilter(column))
            : undefined;
        const isEvaluator = !!evaluatorFunc;
        const wasEvaluator = filterWrapper.isEvaluator;

        if (wasEvaluator != isEvaluator) {
            this.destroyFilter(column, 'paramsUpdated');
            return;
        }
        const { compDetails, createFilterUi } = (isFilterAllowed
            ? this.createFilterComp(column, colDef, defaultFilter, (params) => params, isEvaluator, 'colDef')
            : null) ?? { compDetails: null, createFilterUi: null };

        const newFilterParams =
            compDetails?.params ??
            _mergeFilterParamsWithApplicationProvidedParams(
                this.beans.userCompFactory,
                colDef,
                this.createFilterCompParams(column, isEvaluator, 'colDef') as IFilterParams
            );

        if (wasEvaluator) {
            if (filterWrapper.evaluatorGenerator != (evaluatorFunc?.evaluatorName ?? evaluatorFunc?.filterEvaluator)) {
                // evaluator has changed
                const oldEvaluator = filterWrapper.evaluator;
                const { evaluator, evaluatorParams } = this.createEvaluatorFromFunc(
                    column,
                    evaluatorFunc!.filterEvaluator,
                    newFilterParams
                );
                filterWrapper.evaluator = evaluator;
                filterWrapper.evaluatorParams = evaluatorParams;
                // destroy the old evaluator after creating and assigning the new one in case anything
                // is listening to events on the evaluator and needs to resubscribe to the new one
                this.destroyBean(oldEvaluator);
            } else {
                const evaluatorParams = this.createEvaluatorParams(column, 'colDef', compDetails?.params);
                // evaluator exists and is the same
                filterWrapper.evaluatorParams = evaluatorParams;
                filterWrapper.evaluator.refresh?.(evaluatorParams);
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
        getFilterUiFromWrapper(filterWrapper, wasEvaluator)?.then((filter) => {
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

    private refreshEvaluatorAndUi(
        column: AgColumn,
        model: any,
        source: 'ui' | 'api' | 'colDef' | 'floating' | 'evaluator',
        createIfMissing?: boolean
    ): AgPromise<void> {
        const colId = column.getColId();
        const filterWrapper = this.allColumnFilters.get(colId);

        if (!filterWrapper) {
            if (createIfMissing) {
                // create one. Don't need to refresh as it will be created with the latest details
                this.getOrCreateFilterWrapper(column);
            }
            return AgPromise.resolve();
        }

        if (!filterWrapper.isEvaluator) {
            return AgPromise.resolve();
        }

        const { filterUi, evaluator, evaluatorParams } = filterWrapper;

        return _refreshEvaluatorAndUi(
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
            evaluator,
            evaluatorParams,
            model,
            this.state.get(colId) ?? { model },
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
        this.filterModelUpdateQueue.forEach(({ model, source }) => this.setModel(model, source));
        this.filterModelUpdateQueue = [];
        this.columnFilterModelUpdateQueue.forEach(({ key, model, resolve }) => {
            this.setModelForColumn(key, model).then(() => resolve());
        });
        this.columnFilterModelUpdateQueue = [];
    }

    public getModelForColumn(key: string | AgColumn): any {
        const filterWrapper = this.getFilterWrapper(key);
        return filterWrapper ? this.getModelFromFilterWrapper(filterWrapper) : null;
    }

    public setModelForColumn(key: string | AgColumn, model: any): Promise<void> {
        if (this.beans.dataTypeSvc?.isPendingInference) {
            let resolve: () => void = () => {};
            const promise = new Promise<void>((res) => {
                resolve = res;
            });
            this.columnFilterModelUpdateQueue.push({ key, model, resolve });
            return promise;
        }
        return new Promise((resolve) => {
            this.setModelForColumnLegacy(key, model).then((result) => resolve(result!));
        });
    }

    public setModelForColumnLegacy(key: string | AgColumn, model: any): AgPromise<void> {
        const column = this.beans.colModel.getColDefCol(key);
        const filterWrapper = column ? this.getOrCreateFilterWrapper(column) : null;
        return filterWrapper ? this.setModelOnFilterWrapper(filterWrapper, model) : AgPromise.resolve();
    }

    private getFilterWrapper(key: string | AgColumn): FilterWrapper | null {
        const column = this.beans.colModel.getColDefCol(key);
        return column ? this.cachedFilter(column) ?? null : null;
    }

    public setColDefPropsForDataType(
        colDef: ColDef,
        dataTypeDefinition: CoreDataTypeDefinition,
        formatValue: DataTypeFormatValueFunc
    ): void {
        const usingSetFilter = _isSetFilterByDefault(this.gos);
        const translate = this.getLocaleTextFunc();
        const mergeFilterParams = (params: any) => {
            const { filterParams } = colDef;
            colDef.filterParams =
                typeof filterParams === 'object'
                    ? {
                          ...filterParams,
                          ...params,
                      }
                    : params;
        };
        switch (dataTypeDefinition.baseDataType) {
            case 'number': {
                if (usingSetFilter) {
                    mergeFilterParams({
                        comparator: setFilterNumberComparator,
                    });
                }
                break;
            }
            case 'boolean': {
                if (usingSetFilter) {
                    mergeFilterParams({
                        valueFormatter: (params: ValueFormatterParams) => {
                            if (!_exists(params.value)) {
                                return translate('blanks', '(Blanks)');
                            }
                            return translate(String(params.value), params.value ? 'True' : 'False');
                        },
                    });
                } else {
                    mergeFilterParams({
                        maxNumConditions: 1,
                        debounceMs: 0,
                        filterOptions: [
                            'empty',
                            {
                                displayKey: 'true',
                                displayName: 'True',
                                predicate: (_filterValues: any[], cellValue: any) => cellValue,
                                numberOfInputs: 0,
                            },
                            {
                                displayKey: 'false',
                                displayName: 'False',
                                predicate: (_filterValues: any[], cellValue: any) => cellValue === false,
                                numberOfInputs: 0,
                            },
                        ],
                    });
                }
                break;
            }
            case 'date': {
                if (usingSetFilter) {
                    mergeFilterParams({
                        valueFormatter: (params: ValueFormatterParams) => {
                            const valueFormatted = formatValue(params);
                            return _exists(valueFormatted) ? valueFormatted : translate('blanks', '(Blanks)');
                        },
                        treeList: true,
                        treeListFormatter: (pathKey: string | null, level: number) => {
                            if (pathKey === 'NaN') {
                                return translate('invalidDate', 'Invalid Date');
                            }
                            if (level === 1 && pathKey != null) {
                                const monthKey = MONTH_KEYS[Number(pathKey) - 1];
                                return translate(monthKey, MONTH_LOCALE_TEXT[monthKey]);
                            }
                            return pathKey ?? translate('blanks', '(Blanks)');
                        },
                    });
                } else {
                    mergeFilterParams({
                        isValidDate,
                    });
                }
                break;
            }
            case 'dateString': {
                const convertToDate = (dataTypeDefinition as DateStringDataTypeDefinition).dateParser!;
                if (usingSetFilter) {
                    mergeFilterParams({
                        valueFormatter: (params: ValueFormatterParams) => {
                            const valueFormatted = formatValue(params);
                            return _exists(valueFormatted) ? valueFormatted : translate('blanks', '(Blanks)');
                        },
                        treeList: true,
                        treeListPathGetter: (value: string | null) => {
                            const date = convertToDate(value ?? undefined);
                            return date
                                ? [String(date.getFullYear()), String(date.getMonth() + 1), String(date.getDate())]
                                : null;
                        },
                        treeListFormatter: (pathKey: string | null, level: number) => {
                            if (level === 1 && pathKey != null) {
                                const monthKey = MONTH_KEYS[Number(pathKey) - 1];
                                return translate(monthKey, MONTH_LOCALE_TEXT[monthKey]);
                            }
                            return pathKey ?? translate('blanks', '(Blanks)');
                        },
                    });
                } else {
                    mergeFilterParams({
                        comparator: (filterDate: Date, cellValue: string | undefined) => {
                            const cellAsDate = convertToDate(cellValue)!;
                            if (cellValue == null || cellAsDate < filterDate) {
                                return -1;
                            }
                            if (cellAsDate > filterDate) {
                                return 1;
                            }
                            return 0;
                        },
                        isValidDate: (value: any) => typeof value === 'string' && isValidDate(convertToDate(value)),
                    });
                }
                break;
            }
            case 'object': {
                if (usingSetFilter) {
                    mergeFilterParams({
                        valueFormatter: (params: ValueFormatterParams) => {
                            const valueFormatted = formatValue(params);
                            return _exists(valueFormatted) ? valueFormatted : translate('blanks', '(Blanks)');
                        },
                    });
                } else {
                    colDef.filterValueGetter = (params: ValueGetterParams) =>
                        formatValue({
                            column: params.column,
                            node: params.node,
                            value: this.beans.valueSvc.getValue(params.column as AgColumn, params.node),
                        });
                }
                break;
            }
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
            if (filterWrapper.isEvaluator) {
                const column = filterWrapper.column;
                const colId = column.getColId();
                if (_exists(newModel)) {
                    this.model[colId] = newModel;
                } else {
                    delete this.model[colId];
                }
                if (justCreated) {
                    // don't need to refresh as already has the new model
                    resolve();
                    return;
                }
                this.refreshEvaluatorAndUi(column, newModel, 'api').then(() => resolve());
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

            // no evaluator and no filter comp
            resolve();
        });
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
            type: 'floatingFilterModified',
            column,
            ...additionalEventAttributes,
        });
    }

    public updateModel(column: AgColumn, action: FilterAction, additionalEventAttributes?: any): void {
        const colId = column.getColId();
        _updateFilterModel(
            action,
            () => this.cachedFilter(column)?.filterUi as FilterUi<FilterDisplayComp, FilterDisplayParams> | undefined,
            () => this.model[colId] ?? null,
            () => this.state.get(colId),
            (state) => this.updateState(column, state),
            additionalEventAttributes
        );
    }

    private updateOrRefreshFilterUi(column: AgColumn): void {
        const colId = column.getColId();
        updateOrRefreshFilterUi(
            () => this.cachedFilter(column)?.filterUi as FilterUi<FilterDisplayComp, FilterDisplayParams> | undefined,
            () => this.model[colId] ?? null,
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

    public override destroy() {
        super.destroy();
        this.allColumnFilters.forEach((filterWrapper) => this.disposeFilterWrapper(filterWrapper, 'gridDestroyed'));
        // don't need to destroy the listeners as they are managed listeners
        this.allColumnListeners.clear();
        this.state.clear();
    }
}

interface BaseFilterUi<TComp = IFilterComp, TParams = IFilterParams> {
    create: (update?: boolean) => AgPromise<TComp>;
    filterParams: TParams;
    compDetails: UserCompDetails;
    /**
     * True if has been refreshed but not created yet
     */
    refreshed?: boolean;
}

interface CreatedFilterUi<TComp = IFilterComp, TParams = IFilterParams> extends BaseFilterUi<TComp, TParams> {
    created: true;
    promise: AgPromise<TComp>;
}

interface UncreatedFilterUi<TComp = IFilterComp, TParams = IFilterParams> extends BaseFilterUi<TComp, TParams> {
    created: false;
}

type FilterUi<TComp = IFilterComp, TParams = IFilterParams> =
    | CreatedFilterUi<TComp, TParams>
    | UncreatedFilterUi<TComp, TParams>;

interface BaseFilterWrapper<
    TComp extends IFilterComp | FilterDisplayComp = IFilterComp,
    TParams extends IFilterParams | FilterDisplayParams = IFilterParams,
> {
    column: AgColumn;
    /**
     * `null` if invalid
     */
    filterUi: FilterUi<TComp, TParams> | null;
}

interface LegacyFilterWrapper extends BaseFilterWrapper<IFilterComp, IFilterParams> {
    isEvaluator: false;
    filter?: IFilterComp;
}

interface EvaluatorFilterWrapper extends BaseFilterWrapper<FilterDisplayComp, FilterDisplayParams> {
    isEvaluator: true;
    evaluator: FilterEvaluator;
    evaluatorGenerator: FilterEvaluatorGeneratorFunc | EvaluatorName;
    evaluatorParams: FilterEvaluatorParams;
}

type FilterWrapper = LegacyFilterWrapper | EvaluatorFilterWrapper;

function getFilterUiFromWrapper<TComp extends IFilterComp | FilterDisplayComp>(
    filterWrapper: FilterWrapper,
    skipCreate?: boolean
): AgPromise<TComp> | null {
    const filterUi = filterWrapper.filterUi;
    if (!filterUi) {
        return null;
    }
    if (filterUi.created) {
        return filterUi.promise as AgPromise<TComp>;
    }
    if (skipCreate) {
        return null;
    }
    const promise = filterUi.create(filterUi.refreshed) as AgPromise<TComp>;
    const createdFilterUi = filterUi as unknown as CreatedFilterUi<TComp>;
    createdFilterUi.created = true;
    createdFilterUi.promise = promise;
    return promise;
}

export function _refreshEvaluatorAndUi(
    getFilterUi: () => AgPromise<{ filter: FilterDisplayComp; filterParams: FilterDisplayParams } | undefined>,
    evaluator: FilterEvaluator,
    evaluatorParams: FilterEvaluatorParams,
    model: any,
    state: FilterDisplayState,
    source: 'ui' | 'api' | 'colDef' | 'floating' | 'evaluator'
): AgPromise<void> {
    evaluator.refresh?.({ ...evaluatorParams, model, source });

    return getFilterUi().then((filterUi) => {
        if (filterUi) {
            const { filter, filterParams } = filterUi;
            _refreshFilterUi(filter, filterParams, model, state, source);
        }
    });
}

export function _refreshFilterUi(
    filter: FilterDisplayComp,
    filterParams: FilterDisplayParams,
    model: any,
    state: FilterDisplayState,
    source: 'ui' | 'api' | 'colDef' | 'floating' | 'evaluator' | 'init'
): void {
    filter?.refresh?.({
        ...filterParams,
        model,
        state,
        source,
    });
}

function isValidDate(value: any): boolean {
    return value instanceof Date && !isNaN(value.getTime());
}

function updateOrRefreshFilterUi(
    getFilterUi: () => FilterUi<FilterDisplayComp, FilterDisplayParams> | undefined,
    getModel: () => any,
    getState: () => FilterDisplayState | undefined,
    updateModel?: boolean,
    model?: any,
    additionalEventAttributes?: any
): void {
    const filterUi = getFilterUi();
    if (updateModel) {
        filterUi?.filterParams?.onModelChange(model, additionalEventAttributes);
    } else {
        if (filterUi?.created) {
            filterUi.promise.then((filter) => {
                const model = getModel();
                _refreshFilterUi(filter!, filterUi.filterParams, model, getState() ?? { model }, 'ui');
            });
        }
    }
}

export function _updateFilterModel(
    action: FilterAction,
    getFilterUi: () => FilterUi<FilterDisplayComp, FilterDisplayParams> | undefined,
    getModel: () => any,
    getState: () => FilterDisplayState | undefined,
    updateState: (state: FilterDisplayState) => void,
    additionalEventAttributes?: any
): void {
    let state: FilterDisplayState;
    let updateModel = false;
    let model: any;

    switch (action) {
        case 'apply': {
            const oldState = getState();
            model = oldState?.model ?? null;
            state = {
                // keep the other UI state
                state: oldState?.state,
                model,
            };
            updateModel = true;
            break;
        }
        case 'clear': {
            state = {
                // wipe other UI state
                model: null,
            };
            break;
        }
        case 'reset': {
            state = {
                // wipe other UI state
                model: null,
            };
            updateModel = true;
            model = null;
            break;
        }
        case 'cancel': {
            state = {
                // wipe other UI state
                model: getModel(),
            };
            break;
        }
    }

    updateState(state);
    updateOrRefreshFilterUi(getFilterUi, getModel, getState, updateModel, model, additionalEventAttributes);
}
