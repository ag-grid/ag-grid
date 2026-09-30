import { LocalEventService, _removeFromArray } from 'ag-stack';

import type {
    AgColumn,
    AgFilterHandlerBaseParams,
    BaseFilterParams,
    FilterAction,
    FilterDisplayParams,
    FilterDisplayState,
    FilterGetValueFunc,
    FilterHandler,
    FilterValueGetter,
    FilterWrapperParams,
    IDoesFilterPassParams,
    IFilter,
    IFilterComp,
    IMultiFilter,
    IMultiFilterDef,
    IMultiFilterModel,
    IMultiFilterParams,
    MultiFilterParams,
    ProvidedFilterModel,
    RowNode,
    UserCompDetails,
} from 'ag-grid-community';
import {
    AgPromise,
    FilterWrapperComp,
    ProvidedFilter,
    _getFilterModel,
    _refreshFilterUi,
    _refreshHandlerAndUi,
    _updateFilterModel,
} from 'ag-grid-community';

import type { BaseFilterComponent } from './baseMultiFilter';
import { BaseMultiFilter } from './baseMultiFilter';
import {
    DEFAULT_CHILD_FILTER,
    getFilterModelForIndex,
    getMultiFilterDefs,
    multiFilterChildrenChanged,
} from './multiFilterUtil';

interface MultiFilterWrapper {
    filter: IFilterComp;
    comp: BaseFilterComponent;
    /** only set for handlers */
    filterParams?: FilterDisplayParams;
    handler?: FilterHandler;
    handlerParams?: AgFilterHandlerBaseParams;
    /** only set for handlers */
    model?: any;
    state?: FilterDisplayState;
    /** A ui rebuilt for new params, installed only if nothing newer took its place while it loaded. */
    pendingUi: AgPromise<IFilterComp> | undefined;
}

interface ChildGetter {
    filterValueGetter: FilterValueGetter | undefined;
    getValue: FilterGetValueFunc;
}

/** temporary type until `MultiFilterParams` is updated as breaking change */
type MultiFilterDisplayParams = IMultiFilterParams & FilterDisplayParams<any, any, IMultiFilterModel>;

// This version of multi filter is only used when `enableFilterHandlers = false`
export class MultiFilter extends BaseMultiFilter<MultiFilterWrapper> implements IFilterComp, IMultiFilter {
    public readonly filterType = 'multi' as const;

    private params: MultiFilterParams;
    private wrappers: (MultiFilterWrapper | null)[] = [];
    private filterChangedCallback: ((additionalEventAttributes?: any) => void) | null;
    private readonly activeFilterIndices: number[] = [];

    private readonly afterFiltersReadyFuncs: (() => void)[] = [];

    public init(params: MultiFilterParams): AgPromise<void> {
        this.params = params;
        this.filterDefs = getMultiFilterDefs(params);

        const initialModel = _getFilterModel(this.beans.colFilter!.model, params.column.getColId());

        const { filterChangedCallback } = params;

        this.filterChangedCallback = filterChangedCallback;

        const inherited = this.getInheritedGetter();
        const filterPromises = this.filterDefs.map((filterDef, index) =>
            this.createFilter(filterDef, index, initialModel, inherited)
        );

        // we have to refresh the GUI here to ensure that Angular components are not rendered in odd places
        return new AgPromise<void>((resolve) => {
            AgPromise.all(filterPromises).then((wrappers) => {
                this.wrappers = wrappers!;
                this.refreshGui('columnMenu').then(() => {
                    resolve();
                });
            });
        }).then(() => {
            for (const f of this.afterFiltersReadyFuncs) {
                f();
            }
            this.afterFiltersReadyFuncs.length = 0;
        });
    }

    public refresh(params: MultiFilterParams): boolean {
        const newDefs = getMultiFilterDefs(params);
        if (multiFilterChildrenChanged(this.filterDefs, newDefs)) {
            return false;
        }
        // `filterDefs` is deliberately not updated: the gui is built from it once, so fresh defs beside a
        // stale gui would misreport each child's `display` to `afterGuiAttached`.
        this.params = params;
        const { beans, wrappers } = this;
        const colFilter = beans.colFilter!;
        const column = params.column as AgColumn;
        const parent = { filterValueGetter: this.getInheritedGetter() };
        for (let i = 0, len = wrappers.length; i < len; ++i) {
            const wrapper = wrappers[i];
            const handler = wrapper?.handler;
            if (!handler) {
                continue;
            }
            const filterDef = newDefs[i];
            const { onModelChange, doesRowPassOtherFilter } = wrapper.handlerParams!;
            const handlerParams: AgFilterHandlerBaseParams = {
                ...colFilter.createHandlerParamsForDef(column, filterDef, DEFAULT_CHILD_FILTER, parent),
                onModelChange,
                doesRowPassOtherFilter,
            };
            // the ui keeps the callbacks its wrapper was built around and takes the new params
            const { getHandler, onStateChange, onAction } = wrapper.filterParams!;
            const filterParams = colFilter.createFilterComp(
                column,
                filterDef,
                DEFAULT_CHILD_FILTER,
                (defaultParams) => ({
                    ...this.createChildParams(defaultParams, true, handlerParams.getValue, i),
                    onModelChange,
                    getHandler,
                    onStateChange,
                    onAction,
                }),
                true,
                'colDef'
            )!.compDetails.params;
            // stored first, as reconciling the model inside `refresh` refreshes the child from the wrapper
            wrapper.handlerParams = handlerParams;
            wrapper.filterParams = filterParams;
            // a child cannot be rebuilt on its own, so one refusing the new params recreates the whole filter
            if (handler.refresh?.({ ...handlerParams, model: wrapper.model ?? null, source: 'colDef' }) === false) {
                return false;
            }
            const model = wrapper.model ?? null;
            const state = wrapper.state ?? { model };
            // a ui taking these params supersedes a rebuild still loading from older ones
            wrapper.pendingUi = undefined;
            if (wrapper.filter.refresh?.({ ...filterParams, model, state, source: 'colDef' }) === false) {
                this.recreateChildUi(wrapper, i, filterDef);
            }
        }
        return true;
    }

    /** A child ui that cannot take new params is rebuilt around its handler, which keeps the model. */
    private recreateChildUi(wrapper: MultiFilterWrapper, index: number, filterDef: IMultiFilterDef): void {
        const { handler, handlerParams } = wrapper;
        const model = wrapper.model ?? null;
        let createWrapperComp: ((filter: IFilterComp<any> | null) => FilterWrapperComp) | undefined;
        const { compDetails, createFilterUi } = this.beans.colFilter!.createFilterComp(
            this.params.column as AgColumn,
            filterDef,
            DEFAULT_CHILD_FILTER,
            (defaultParams) => {
                const params = this.createChildParams(defaultParams, true, handlerParams!.getValue, index);
                createWrapperComp = this.updateDisplayParams(
                    params as unknown as FilterDisplayParams,
                    index,
                    model,
                    () => compDetails,
                    () => handler!,
                    handlerParams!.onModelChange
                );
                return params;
            },
            true,
            'colDef'
        )!;
        const pendingUi = createFilterUi();
        wrapper.pendingUi = pendingUi;
        void pendingUi.then((filter) => {
            if (wrapper.pendingUi !== pendingUi || this.wrappers[index] !== wrapper || !this.isAlive()) {
                this.destroyBean(filter);
                return;
            }
            wrapper.pendingUi = undefined;
            const oldFilter = wrapper.filter;
            const filterParams = compDetails.params;
            wrapper.filter = filter!;
            wrapper.comp = createWrapperComp!(filter);
            wrapper.filterParams = filterParams;
            wrapper.state = { model };
            this.destroyBean(oldFilter);
            // a framework ui can resolve after the model moved on
            const currentModel = wrapper.model ?? null;
            if (currentModel !== model) {
                wrapper.state = { model: currentModel };
                _refreshFilterUi(filter as any, filterParams, currentModel, wrapper.state, 'api');
            }
            this.refreshChildGui();
        });
    }

    public isFilterActive(): boolean {
        return this.wrappers.some((wrapper) => {
            if (!wrapper) {
                return false;
            }
            const { filter, handler, model } = wrapper;
            if (handler) {
                return model != null;
            }
            return filter.isFilterActive();
        });
    }

    public getLastActiveFilterIndex(): number | null {
        const activeFilterIndices = this.activeFilterIndices;
        return activeFilterIndices.length > 0 ? activeFilterIndices[activeFilterIndices.length - 1] : null;
    }

    public doesFilterPass(params: IDoesFilterPassParams, indexToSkip?: number): boolean {
        return this.wrappers.every((wrapper, index) => {
            if (!wrapper || (indexToSkip != null && index === indexToSkip)) {
                return true;
            }
            const { handler, filter, model } = wrapper;
            if (handler) {
                return (
                    model == null ||
                    handler.doesFilterPass({
                        ...params,
                        model,
                        handlerParams: wrapper.handlerParams!,
                    })
                );
            }
            return !filter.isFilterActive() || filter.doesFilterPass(params);
        });
    }

    public getModelFromUi(): IMultiFilterModel | null {
        const model: IMultiFilterModel = {
            filterType: this.filterType,
            filterModels: this.wrappers.map((wrapper) => {
                if (!wrapper) {
                    return null;
                }
                const providedFilter = wrapper.filter as ProvidedFilter<
                    IMultiFilterModel,
                    unknown,
                    MultiFilterDisplayParams
                >;

                if (typeof providedFilter.getModelFromUi === 'function') {
                    return providedFilter.getModelFromUi();
                }

                return null;
            }),
        };

        return model;
    }

    public getModel(): ProvidedFilterModel | null {
        if (!this.isFilterActive()) {
            return null;
        }

        const model: IMultiFilterModel = {
            filterType: this.filterType,
            filterModels: this.wrappers.map((wrapper) => {
                if (!wrapper) {
                    return null;
                }
                const { filter, handler, model } = wrapper;
                if (handler) {
                    return model;
                }
                return filter.isFilterActive() ? filter.getModel() : null;
            }),
        };

        return model;
    }

    public setModel(model: IMultiFilterModel | null): AgPromise<void> {
        const setFilterModel = (filter: IFilterComp, filterModel: any) => {
            return new AgPromise<void>((resolve) => {
                const promise = filter.setModel(filterModel);
                if (promise) {
                    promise.then(resolve);
                } else {
                    resolve();
                }
            });
        };

        const promises: AgPromise<void>[] = [];

        this.wrappers.forEach((wrapper, index) => {
            if (!wrapper) {
                return;
            }
            const modelForFilter = getFilterModelForIndex(model, index);
            const { filter, filterParams, handler, handlerParams, state } = wrapper;
            if (handler) {
                const newState = {
                    model: modelForFilter,
                    state: state?.state,
                };
                wrapper.state = newState;
                wrapper.model = modelForFilter;
                promises.push(
                    _refreshHandlerAndUi(
                        () => AgPromise.resolve({ filter: filter as any, filterParams: filterParams as any }),
                        handler,
                        handlerParams!,
                        modelForFilter,
                        newState,
                        'api'
                    ).then(() => {
                        this.updateActiveListForHandler(index, wrapper.model);
                    })
                );
            } else {
                promises.push(
                    setFilterModel(filter, modelForFilter).then(() => {
                        this.updateActiveListForFilter(index, filter);
                    })
                );
            }
        });
        return AgPromise.all(promises).then(() => {});
    }

    public applyModel(source: 'api' | 'ui' | 'rowDataUpdated' = 'api'): boolean {
        let result = false;

        for (const wrapper of this.wrappers) {
            if (wrapper) {
                const filter = wrapper.filter;
                if (filter instanceof ProvidedFilter) {
                    result = filter.applyModel(source) || result;
                }
            }
        }

        return result;
    }

    public getChildFilterInstance<TFilter = IFilter>(index: number): TFilter | undefined {
        return this.wrappers[index]?.filter as TFilter;
    }

    public getNumChildFilters(): number {
        return this.wrappers.length;
    }

    public override destroy(): void {
        for (const wrapper of this.wrappers) {
            this.destroyBean(wrapper?.filter);
            this.destroyBean(wrapper?.handler);
        }

        this.wrappers.length = 0;

        super.destroy();
    }

    protected override getFilterWrappers(): (MultiFilterWrapper | null)[] {
        return this.wrappers;
    }

    protected override getFilterFromWrapper(wrapper: MultiFilterWrapper): IFilterComp<any> {
        return wrapper.filter;
    }

    protected override getCompFromWrapper(wrapper: MultiFilterWrapper): BaseFilterComponent {
        return wrapper.comp;
    }

    protected override executeOnWrapper(
        wrapper: MultiFilterWrapper,
        name: 'onAnyFilterChanged' | 'onNewRowsLoaded'
    ): void {
        wrapper.handler?.[name]?.();
    }

    private createFilter(
        filterDef: IMultiFilterDef,
        index: number,
        initialModel: IMultiFilterModel | null,
        inherited: FilterValueGetter | undefined
    ): AgPromise<MultiFilterWrapper | null> {
        const column = this.params.column as AgColumn;

        let initialModelForFilter: any = null;
        let createWrapperComp: ((filter: IFilterComp<any> | null) => FilterWrapperComp) | undefined;
        const beans = this.beans;

        // used for handlers only
        const onModelChange = (model: any, additionalEventAttributes?: any) => {
            const wrapper = this.wrappers[index];
            if (!wrapper) {
                return;
            }
            const newState = {
                model,
                state: wrapper.state?.state,
            };
            wrapper.state = newState;
            wrapper.model = model;
            _refreshHandlerAndUi(
                () =>
                    AgPromise.resolve({
                        filter: wrapper.filter as any,
                        filterParams: wrapper.filterParams as any,
                    }),
                wrapper.handler!,
                wrapper.handlerParams!,
                model,
                newState,
                'ui'
            ).then(() => {
                this.onHandlerModelChanged(index, wrapper.model, additionalEventAttributes);
            });
        };

        const childGetter = this.createChildGetter(filterDef, inherited);
        const {
            compDetails,
            handler,
            handlerParams: originalHandlerParams,
            createFilterUi,
        } = beans.colFilter!.createFilterInstance(
            column,
            filterDef,
            DEFAULT_CHILD_FILTER,
            (defaultParams, isHandler) => {
                const updatedParams = this.createChildParams(defaultParams, isHandler, childGetter.getValue, index);
                if (isHandler) {
                    initialModelForFilter = getFilterModelForIndex(initialModel, index);
                    createWrapperComp = this.updateDisplayParams(
                        updatedParams as unknown as FilterDisplayParams,
                        index,
                        initialModelForFilter,
                        () => compDetails,
                        () => handler!,
                        onModelChange
                    );
                }
                return updatedParams;
            }
        );

        if (!createFilterUi) {
            return AgPromise.resolve(null);
        }

        let handlerParams: AgFilterHandlerBaseParams | undefined;
        if (handler) {
            const doesRowPassOtherFilter = originalHandlerParams!.doesRowPassOtherFilter;
            handlerParams = {
                ...originalHandlerParams!,
                ...childGetter,
                onModelChange,
                doesRowPassOtherFilter: (node) =>
                    doesRowPassOtherFilter(node) && this.doesFilterPass({ node, data: node.data }, index),
            };
            handler.init?.({ ...handlerParams, model: initialModelForFilter, source: 'init' });
        }

        return createFilterUi().then((filter) => {
            if (!handler) {
                return { filter: filter!, comp: filter!, pendingUi: undefined };
            }
            const filterParams = compDetails?.params;
            const comp = createWrapperComp!(filter);
            return {
                filter: filter!,
                comp,
                filterParams,
                handler,
                handlerParams,
                model: initialModelForFilter,
                pendingUi: undefined,
            };
        });
    }

    /** The getter this filter reads with, which a child without its own reads through. */
    private getInheritedGetter(): FilterValueGetter | undefined {
        const { colFilter, selectableFilter } = this.beans;
        const column = this.params.column as AgColumn;
        const colDef = column.colDef;
        // this filter's own definition, as a Selectable Filter records its choice's getter only after a refresh
        const multiDef = selectableFilter?.isSelectable(colDef)
            ? selectableFilter.getFilterDef(column, colDef)
            : colDef;
        return colFilter!.resolveFilterValueGetter(column, multiDef, colDef.filterValueGetter, undefined);
    }

    private createChildGetter(filterDef: IMultiFilterDef, inherited: FilterValueGetter | undefined): ChildGetter {
        const colFilter = this.beans.colFilter!;
        const column = this.params.column as AgColumn;
        const filterValueGetter = colFilter.resolveFilterValueGetter(
            column,
            filterDef,
            inherited,
            DEFAULT_CHILD_FILTER
        );
        return { filterValueGetter, getValue: colFilter.createHandlerGetValue(column, filterValueGetter) };
    }

    private createChildParams(
        defaultParams: BaseFilterParams,
        isHandler: boolean,
        getValue: FilterGetValueFunc,
        index: number
    ) {
        return {
            ...defaultParams,
            filterChangedCallback: isHandler
                ? () => {}
                : (additionalEventAttributes?: any) => {
                      this.executeWhenAllFiltersReady(() =>
                          this.onFilterModelChanged(index, additionalEventAttributes)
                      );
                  },
            doesRowPassOtherFilter: (node: RowNode) =>
                defaultParams.doesRowPassOtherFilter(node) && this.doesFilterPass({ node, data: node.data }, index),
            getValue,
        };
    }

    private updateDisplayParams(
        displayParams: FilterDisplayParams,
        index: number,
        initialModelForFilter: any,
        getCompDetails: () => UserCompDetails | null,
        getHandler: () => FilterHandler,
        onModelChange: (model: any, additionalEventAttributes?: any) => void
    ): (filter: IFilterComp<any> | null) => FilterWrapperComp {
        const column = this.params.column as AgColumn;
        const eventSvc: LocalEventService<
            'filterParamsChanged' | 'filterStateChanged' | 'filterAction' | 'filterGlobalButtons'
        > = new LocalEventService();
        displayParams.model = initialModelForFilter;
        displayParams.state = { model: initialModelForFilter };
        displayParams.onModelChange = onModelChange;
        displayParams.getHandler = getHandler;
        const updateState = (wrapper: MultiFilterWrapper, state: FilterDisplayState) => {
            wrapper.state = state;
            eventSvc.dispatchEvent({
                type: 'filterStateChanged',
                column,
                state,
            });
        };
        displayParams.onStateChange = (state) => {
            const wrapper = this.wrappers[index];
            if (!wrapper) {
                return;
            }
            updateState(wrapper, state);
            _refreshFilterUi(wrapper.filter as any, wrapper.filterParams!, wrapper.model ?? null, state, 'ui');
        };
        const updateModel = (_column: AgColumn, action: FilterAction, additionalEventAttributes?: any) => {
            const wrapper = this.wrappers[index];
            if (!wrapper) {
                return;
            }
            const getModel = () => wrapper?.model ?? null;
            _updateFilterModel({
                action,
                filterParams: wrapper.filterParams as FilterWrapperParams | undefined,
                getFilterUi: () => {
                    const promise = AgPromise.resolve(wrapper.filter as any);
                    return {
                        created: true,
                        filterParams: wrapper.filterParams!,
                        compDetails: getCompDetails()!,
                        create: () => promise,
                        promise,
                    };
                },
                getModel,
                getState: () => wrapper?.state ?? { model: getModel() },
                updateState: (state) => updateState(wrapper, state),
                updateModel: (newModel) => wrapper.filterParams?.onModelChange(newModel, additionalEventAttributes),
                processModelToApply: wrapper.handler?.processModelToApply?.bind(wrapper.handler),
            });
        };
        displayParams.onAction = (action, additionalEventAttributes, event) => {
            updateModel(column, action, additionalEventAttributes);
            eventSvc.dispatchEvent({
                type: 'filterAction',
                column,
                action,
                event,
            });
        };

        return (filter: IFilterComp<any> | null) => {
            const filterParams = getCompDetails()?.params;
            return this.createManagedBean(
                new FilterWrapperComp(
                    column,
                    {
                        comp: filter!,
                        params: filterParams!,
                        isHandler: true,
                    },
                    eventSvc,
                    updateModel,
                    false
                )
            );
        };
    }

    private executeWhenAllFiltersReady(action: () => void): void {
        if ((this.wrappers?.length ?? 0) > 0) {
            action();
        } else {
            this.afterFiltersReadyFuncs.push(action);
        }
    }

    private updateActiveListForFilter(index: number, filter?: IFilterComp): void {
        this.updateActiveList(index, () => filter?.isFilterActive());
    }

    private updateActiveListForHandler(index: number, model?: any): void {
        this.updateActiveList(index, () => model != null);
    }

    private updateActiveList(index: number, isActive: () => boolean | undefined): void {
        const activeFilterIndices = this.activeFilterIndices;
        _removeFromArray(this.activeFilterIndices, index);

        if (isActive()) {
            activeFilterIndices.push(index);
        }
    }

    /** Only called for non-handlers */
    private onFilterModelChanged(index: number, additionalEventAttributes: any): void {
        this.updateActiveListForFilter(index, this.wrappers[index]?.filter);

        this.filterChanged(index, additionalEventAttributes);
    }

    private onHandlerModelChanged(index: number, model: any, additionalEventAttributes?: any): void {
        this.updateActiveListForHandler(index, model);

        this.filterChanged(index, additionalEventAttributes);
    }

    private filterChanged(index: number, additionalEventAttributes: any): void {
        this.filterChangedCallback!(additionalEventAttributes);

        this.wrappers.forEach((wrapper, childIndex) => {
            if (index === childIndex || !wrapper) {
                return;
            }

            const { filter, handler } = wrapper;

            handler?.onAnyFilterChanged?.();
            if (typeof filter.onAnyFilterChanged === 'function') {
                filter.onAnyFilterChanged();
            }
        });
    }

    public getModelAsString(model: IMultiFilterModel): string {
        if (!model?.filterModels?.length) {
            return '';
        }
        const lastActiveIndex = this.getLastActiveFilterIndex() ?? 0;
        const activeFilter = this.wrappers[lastActiveIndex]?.filter;
        return activeFilter?.getModelAsString?.(model.filterModels[lastActiveIndex]) ?? '';
    }
}
