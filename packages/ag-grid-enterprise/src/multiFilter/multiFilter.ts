import type {
    AgColumn,
    FilterAction,
    FilterDisplayParams,
    FilterDisplayState,
    FilterEvaluator,
    FilterEvaluatorParams,
    IDoesFilterPassParams,
    IFilterComp,
    IFilterDef,
    IMultiFilter,
    IMultiFilterModel,
    IMultiFilterParams,
    MultiFilterParams,
    ProvidedFilterModel,
    RowNode,
} from 'ag-grid-community';
import {
    AgPromise,
    FilterDisplayComp,
    LocalEventService,
    ProvidedFilter,
    _refreshEvaluatorAndUi,
    _refreshFilterUi,
    _removeFromArray,
    _updateFilterModel,
} from 'ag-grid-community';

import type { BaseFilterComponent } from './baseMultiFilter';
import { BaseMultiFilter } from './baseMultiFilter';
import { getMultiFilterDefs, getUpdatedMultiFilterModel } from './multiFilterUtil';

interface MultiFilterWrapper {
    filter: IFilterComp;
    comp: BaseFilterComponent;
    /** only set for evaluators */
    filterParams?: FilterDisplayParams;
    evaluator?: FilterEvaluator;
    evaluatorParams?: FilterEvaluatorParams;
    /** only set for evaluators */
    model?: any;
    state?: FilterDisplayState;
}

/** temporary type until `MultiFilterParams` is updated as breaking change */
type MultiFilterDisplayParams = IMultiFilterParams & FilterDisplayParams<any, any, IMultiFilterModel>;

export class MultiFilter extends BaseMultiFilter<MultiFilterWrapper> implements IFilterComp, IMultiFilter {
    public readonly filterType = 'multi' as const;

    private params: MultiFilterDisplayParams;
    private wrappers: (MultiFilterWrapper | null)[] = [];
    private filterChangedCallback: ((additionalEventAttributes?: any) => void) | null;
    private activeFilterIndices: number[] = [];

    private afterFiltersReadyFuncs: (() => void)[] = [];

    public init(params: MultiFilterParams): AgPromise<void> {
        this.params = params as unknown as MultiFilterDisplayParams;
        this.filterDefs = getMultiFilterDefs(params);

        const initialModel = this.beans.colFilter!.getModelFromInitialState(params.column);

        const { filterChangedCallback } = params;

        this.filterChangedCallback = filterChangedCallback;

        const filterPromises = this.filterDefs.map((filterDef, index) =>
            this.createFilter(filterDef, index, initialModel)
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
            this.afterFiltersReadyFuncs.forEach((f) => f());
            this.afterFiltersReadyFuncs.length = 0;
        });
    }

    public isFilterActive(): boolean {
        return this.wrappers.some((wrapper) => {
            if (!wrapper) {
                return false;
            }
            const { filter, evaluator, model } = wrapper;
            if (evaluator) {
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
            const { evaluator, filter, model } = wrapper;
            if (evaluator && model != null) {
                return evaluator.doesFilterPass({
                    ...params,
                    model,
                });
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
                const { filter, evaluator, model } = wrapper;
                if (evaluator) {
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
                promise ? promise.then(() => resolve()) : resolve();
            });
        };

        const promises: AgPromise<void>[] = [];

        this.wrappers.forEach((wrapper, index) => {
            if (!wrapper) {
                return;
            }
            const modelForFilter = model?.filterModels?.[index] ?? null;
            const { filter, filterParams, evaluator, evaluatorParams, state } = wrapper;
            if (evaluator) {
                promises.push(
                    _refreshEvaluatorAndUi(
                        () => AgPromise.resolve({ filter: filter as any, filterParams: filterParams as any }),
                        evaluator,
                        evaluatorParams!,
                        modelForFilter,
                        state ?? { model: modelForFilter },
                        'api'
                    ).then(() => {
                        this.updateActiveListForEvaluator(index, modelForFilter);
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

        this.wrappers.forEach((wrapper) => {
            if (wrapper) {
                const filter = wrapper.filter;
                if (filter instanceof ProvidedFilter) {
                    result = filter.applyModel(source) || result;
                }
            }
        });

        return result;
    }

    public getChildFilterInstance(index: number): IFilterComp | undefined {
        return this.wrappers[index]?.filter;
    }

    public override destroy(): void {
        this.wrappers.forEach((wrapper) => {
            this.destroyBean(wrapper?.filter);
            this.destroyBean(wrapper?.evaluator);
        });

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

    private createFilter(
        filterDef: IFilterDef,
        index: number,
        initialModel: IMultiFilterModel | null
    ): AgPromise<MultiFilterWrapper | null> {
        const column = this.params.column as AgColumn;

        let initialModelForFilter: any = null;

        let eventSvc: LocalEventService<'filterParamsChanged' | 'filterStateChanged' | 'filterAction'>;
        let updateModel: (column: AgColumn, action: FilterAction, additionalEventAttributes?: any) => void;

        const { compDetails, evaluator, evaluatorParams, createFilterUi } = this.beans.colFilter!.createFilterInstance(
            column,
            filterDef,
            'agTextColumnFilter',
            (defaultParams, isEvaluator) => {
                const updatedParams = {
                    ...defaultParams,
                    filterChangedCallback: isEvaluator
                        ? () => {}
                        : (additionalEventAttributes?: any) => {
                              this.executeWhenAllFiltersReady(() =>
                                  this.onFilterModelChanged(index, additionalEventAttributes)
                              );
                          },
                    doesRowPassOtherFilter: (node: RowNode) =>
                        defaultParams.doesRowPassOtherFilter(node) &&
                        this.doesFilterPass({ node, data: node.data }, index),
                };
                if (isEvaluator) {
                    const displayParams = updatedParams as unknown as FilterDisplayParams;
                    initialModelForFilter = initialModel?.filterModels?.[index] ?? null;
                    eventSvc = new LocalEventService();
                    displayParams.model = initialModelForFilter;
                    displayParams.state = { model: initialModelForFilter };
                    displayParams.onModelChange = (model, additionalEventAttributes?: any) => {
                        const wrapper = this.wrappers[index];
                        if (!wrapper) {
                            return;
                        }
                        _refreshEvaluatorAndUi(
                            () =>
                                AgPromise.resolve({
                                    filter: wrapper.filter as any,
                                    filterParams: wrapper.filterParams as any,
                                }),
                            wrapper.evaluator!,
                            wrapper.evaluatorParams!,
                            model,
                            wrapper.state ?? { model },
                            'ui'
                        ).then(() => {
                            wrapper.model = model;
                            this.onEvaluatorModelChanged(index, model, additionalEventAttributes);
                        });
                    };
                    displayParams.getEvaluator = () => evaluator!;
                    const updateState = (wrapper: MultiFilterWrapper, state: FilterDisplayState) => {
                        wrapper.state = state;
                        eventSvc.dispatchEvent({
                            type: 'filterStateChanged',
                            column,
                            state,
                        });
                        this;
                    };
                    displayParams.onStateChange = (state, additionalEventAttributes) => {
                        const wrapper = this.wrappers[index];
                        if (!wrapper) {
                            return;
                        }
                        updateState(wrapper, state);
                        this.beans.colFilter?.filterUiChanged(this.params.column, additionalEventAttributes);
                        _refreshFilterUi(
                            wrapper.filter as any,
                            wrapper.filterParams!,
                            wrapper.model ?? null,
                            state,
                            'ui'
                        );
                    };
                    updateModel = (_col, action, additionalEventAttributes) => {
                        const wrapper = this.wrappers[index];
                        if (!wrapper) {
                            return;
                        }
                        const getModel = () => wrapper?.model ?? null;
                        _updateFilterModel(
                            action,
                            () => {
                                const promise = AgPromise.resolve(wrapper.filter as any);
                                return {
                                    created: true,
                                    filterParams: wrapper.filterParams!,
                                    compDetails: compDetails!,
                                    create: () => promise,
                                    promise,
                                };
                            },
                            getModel,
                            () => wrapper?.state ?? { model: getModel() },
                            (state) => updateState(wrapper, state),
                            (newModel) => wrapper.filterParams?.onModelChange(newModel, additionalEventAttributes)
                        );
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
                }
                return updatedParams;
            }
        );

        if (!createFilterUi) {
            return AgPromise.resolve(null);
        }

        if (evaluator) {
            const onModelChange = evaluatorParams!.onModelChange;
            evaluator.init?.({
                ...evaluatorParams!,
                model: initialModelForFilter,
                onModelChange: (newModel, additionalEventAttributes) =>
                    onModelChange(
                        getUpdatedMultiFilterModel(this.params.model, this.wrappers.length, newModel, index),
                        additionalEventAttributes
                    ),
            });
        }

        return createFilterUi().then((filter) => {
            if (!evaluator) {
                return { filter: filter!, comp: filter! };
            }
            const filterParams = compDetails?.params;
            const comp = this.createManagedBean(
                new FilterDisplayComp(
                    column,
                    {
                        comp: filter!,
                        params: filterParams!,
                        isEvaluator: true,
                    },
                    eventSvc,
                    updateModel
                )
            );
            return {
                filter: filter!,
                comp,
                filterParams,
                evaluator,
                evaluatorParams,
                model: initialModelForFilter,
            };
        });
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

    private updateActiveListForEvaluator(index: number, model?: any): void {
        this.updateActiveList(index, () => model != null);
    }

    private updateActiveList(index: number, isActive: () => boolean | undefined): void {
        const activeFilterIndices = this.activeFilterIndices;
        _removeFromArray(this.activeFilterIndices, index);

        if (isActive()) {
            activeFilterIndices.push(index);
        }
    }

    /** Only called for non-evaluators */
    private onFilterModelChanged(index: number, additionalEventAttributes: any): void {
        this.updateActiveListForFilter(index, this.wrappers[index]?.filter);

        this.filterChanged(index, additionalEventAttributes);
    }

    private onEvaluatorModelChanged(index: number, model: any, additionalEventAttributes?: any): void {
        this.updateActiveListForEvaluator(index, model);

        this.filterChanged(index, additionalEventAttributes);
    }

    private filterChanged(index: number, additionalEventAttributes: any): void {
        this.filterChangedCallback!(additionalEventAttributes);

        this.wrappers.forEach((wrapper, childIndex) => {
            if (index === childIndex || !wrapper) {
                return;
            }

            const filter = wrapper.filter;

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
