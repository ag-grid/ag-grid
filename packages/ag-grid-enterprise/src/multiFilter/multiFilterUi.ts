import type {
    AgColumn,
    FilterDisplayComp,
    FilterDisplayParams,
    FilterDisplayState,
    IComponent,
    IFilterDef,
    IMultiFilterModel,
    IMultiFilterParams,
    RowNode,
    SharedFilterUi,
} from 'ag-grid-community';
import { AgPromise, _getFilterDetails, _refreshFilterUi } from 'ag-grid-community';

import type { BaseFilterComponent } from './baseMultiFilter';
import { BaseMultiFilter } from './baseMultiFilter';
import type { MultiFilterEvaluator } from './multiFilterEvaluator';
import { getMultiFilterDefs, getUpdatedMultiFilterModel } from './multiFilterUtil';

export class MultiFilterUi
    extends BaseMultiFilter<FilterDisplayComp>
    implements IComponent<IMultiFilterParams & FilterDisplayParams<any, any, IMultiFilterModel>>
{
    public readonly filterType = 'multi' as const;

    private params: IMultiFilterParams & FilterDisplayParams<any, any, IMultiFilterModel>;
    private filters: (FilterDisplayComp | null)[] = [];
    private filterParams: FilterDisplayParams[] = [];
    private validity: (boolean | undefined)[] = [];
    private allState: FilterDisplayState<IMultiFilterModel, any[]>;

    public init(params: IMultiFilterParams & FilterDisplayParams<any, any, IMultiFilterModel>): AgPromise<void> {
        this.params = params;
        this.filterDefs = getMultiFilterDefs(params);

        this.allState = params.state;

        const filterPromises: AgPromise<FilterDisplayComp | null>[] = this.filterDefs.map((filterDef, index) =>
            this.createFilter(filterDef, index)
        );

        // we have to refresh the GUI here to ensure that Angular components are not rendered in odd places
        return new AgPromise<void>((resolve) => {
            AgPromise.all(filterPromises).then((filters) => {
                this.filters = filters!;
                this.refreshGui('columnMenu').then(() => {
                    resolve();
                });
            });
        });
    }

    public refresh(params: IMultiFilterParams & FilterDisplayParams<any, any, IMultiFilterModel>): boolean {
        const { model, state, source } = params;
        if (source === 'colDef') {
            // multi filter has never been reactive. Implementing this would require extracting
            // even more logic from ColumnFilterService to determine if the filter has changed
            return false;
        }
        this.params = params;
        const filterParams = this.filterParams;

        if (state === this.allState) {
            // nothing to update
            return true;
        }

        this.allState = state;

        const filterModels = model?.filterModels;
        const stateFilterModels = state.model?.filterModels;
        const newAllStateState = state.state;

        this.filters.forEach((filter, index) => {
            const modelForFilter = filterModels?.[index] ?? null;
            const stateForFilter = {
                state: newAllStateState?.[index],
                model: stateFilterModels?.[index] ?? null,
            };
            _refreshFilterUi(filter, filterParams[index], modelForFilter, stateForFilter, source);
        });
        return true;
    }

    public getLastActiveFilterIndex(): number | null {
        return (this.params.getEvaluator() as MultiFilterEvaluator)?.getLastActiveFilterIndex?.() ?? null;
    }

    public getChildFilterInstance(index: number): FilterDisplayComp | undefined {
        return this.filters[index] ?? undefined;
    }

    public override destroy(): void {
        this.filters.forEach((filter) => this.destroyBean(filter));

        this.filters.length = 0;

        super.destroy();
    }

    protected override getFilterWrappers(): (FilterDisplayComp | null)[] {
        return this.filters;
    }

    protected override getFilterFromWrapper(wrapper: FilterDisplayComp): SharedFilterUi {
        return wrapper;
    }

    protected override getCompFromWrapper(wrapper: FilterDisplayComp): BaseFilterComponent {
        return wrapper;
    }

    private createFilter(filterDef: IFilterDef, index: number): AgPromise<FilterDisplayComp | null> {
        const userCompFactory = this.beans.userCompFactory;

        const filterParams = this.updateParams(filterDef, this.params, index);

        const compDetails = _getFilterDetails<FilterDisplayComp>(
            userCompFactory,
            filterDef,
            filterParams,
            'agTextColumnFilter'
        );
        if (!compDetails) {
            return AgPromise.resolve(null);
        }
        this.filterParams[index] = compDetails.params;
        return compDetails.newAgStackInstance();
    }

    private updateParams(
        filterDef: IFilterDef,
        params: IMultiFilterParams & FilterDisplayParams<any, any, IMultiFilterModel>,
        index: number
    ): FilterDisplayParams {
        const {
            doesRowPassOtherFilter,
            model,
            onModelChange,
            getEvaluator,
            state,
            onStateChange,
            column,
            source,
            onAction,
            onUiChange,
        } = params;
        const filterModel = model?.filterModels?.[index] ?? null;
        const filterState = state
            ? {
                  model: state.model?.filterModels?.[index] ?? null,
                  state: state.state?.[index],
              }
            : { model: filterModel };
        return {
            ...this.beans.colFilter!.createBaseFilterParams(column as AgColumn),
            ...filterDef,
            doesRowPassOtherFilter: (node: RowNode) =>
                doesRowPassOtherFilter(node) && this.doesOtherFilterPass(node, index),
            model: filterModel,
            state: filterState,
            onModelChange: (childModel, additionalEventAttributes) => {
                const { filters, params } = this;
                const newModel = getUpdatedMultiFilterModel(params.model, filters.length, childModel, index);
                this.updateActiveList(index, childModel);
                onModelChange(newModel, additionalEventAttributes);
                filters.forEach((filter, otherIndex) => {
                    if (index !== otherIndex && typeof filter?.onAnyFilterChanged === 'function') {
                        filter.onAnyFilterChanged();
                    }
                });
            },
            onStateChange: (newState, additionalEventAttributes) => {
                const { model, state, valid } = newState;
                const validity = this.validity;
                validity[index] = valid;
                const allState = this.allState;
                const newModel = getUpdatedMultiFilterModel(allState.model, this.filters.length, model, index);
                const allValid = validity.every((filterValid) => filterValid !== false);
                const allStateState = [...(allState.state ?? [])];
                allStateState[index] = state;
                const newAllState = {
                    state: allStateState,
                    model: newModel,
                    valid: allValid,
                };
                this.allState = newAllState;
                onStateChange(newAllState, additionalEventAttributes);
            },
            getEvaluator: () => {
                const multiFilterEvaluator = getEvaluator() as MultiFilterEvaluator;
                return multiFilterEvaluator.getEvaluator(index)!;
            },
            onAction,
            onUiChange,
            source,
        };
    }

    private doesOtherFilterPass(node: RowNode, index: number): boolean {
        const {
            beans,
            params: { column, model },
        } = this;
        const evaluator = beans.colFilter?.getEvaluator(column as AgColumn);
        return (
            !evaluator ||
            evaluator.doesFilterPass({
                node,
                data: node.data,
                model: model?.filterModels?.[index] ?? null,
            })
        );
    }

    private updateActiveList(index: number, childModel: any): void {
        const evaluator = this.params.getEvaluator();
        if ((evaluator as MultiFilterEvaluator)?.updateActiveList) {
            (evaluator as MultiFilterEvaluator).updateActiveList(index, childModel);
        }
    }

    public getModelAsString(model: IMultiFilterModel): string {
        return this.params.getEvaluator()?.getModelAsString?.(model) ?? '';
    }
}
