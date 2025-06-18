import type {
    AgColumn,
    FilterDisplayComp,
    FilterDisplayParams,
    FilterDisplayState,
    FilterHandler,
    FilterWrapperParams,
    IComponent,
    IMultiFilterDef,
    IMultiFilterModel,
    IMultiFilterParams,
    SharedFilterUi,
} from 'ag-grid-community';
import { AgPromise, _getFilterDetails, _isUseApplyButton, _refreshFilterUi } from 'ag-grid-community';

import type { BaseFilterComponent } from './baseMultiFilter';
import { BaseMultiFilter } from './baseMultiFilter';
import type { MultiFilterHandler } from './multiFilterHandler';
import {
    getFilterModelForIndex,
    getMultiFilterDefs,
    getUpdatedMultiFilterModel,
    updateGetValue,
} from './multiFilterUtil';

// This version of multi filter is only used when `enableFilterHandlers = true`
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

        const newAllStateState = state.state;

        this.filters.forEach((filter, index) => {
            const modelForFilter = getFilterModelForIndex(model, index);
            const stateForFilter = {
                state: newAllStateState?.[index],
                model: getFilterModelForIndex(state.model, index),
            };
            _refreshFilterUi(filter, filterParams[index], modelForFilter, stateForFilter, source);
        });
        return true;
    }

    public getLastActiveFilterIndex(): number | null {
        return this.getHandler().getLastActiveFilterIndex?.() ?? null;
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

    private createFilter(filterDef: IMultiFilterDef, index: number): AgPromise<FilterDisplayComp | null> {
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
        filterDef: IMultiFilterDef,
        params: IMultiFilterParams & FilterDisplayParams<any, any, IMultiFilterModel>,
        index: number
    ): FilterDisplayParams {
        const {
            doesRowPassOtherFilter,
            model,
            onModelChange,
            state,
            onStateChange,
            column,
            source,
            onAction,
            onUiChange,
            getValue,
        } = params;
        const filterModel = getFilterModelForIndex(model, index);
        const filterState = state
            ? {
                  model: getFilterModelForIndex(state.model, index),
                  state: state.state?.[index],
              }
            : { model: filterModel };
        const onAnyFilterChanged = () => {
            const handler = this.getHandler();
            this.filters.forEach((filter, otherIndex) => {
                if (index !== otherIndex) {
                    handler.getHandler<FilterHandler>(otherIndex)?.onAnyFilterChanged?.();
                    filter?.onAnyFilterChanged?.();
                }
            });
        };
        const colFilter = this.beans.colFilter!;
        return {
            ...colFilter.createBaseFilterParams(column as AgColumn),
            ...filterDef,
            doesRowPassOtherFilter: (node) =>
                doesRowPassOtherFilter(node) &&
                this.getHandler().doesFilterPass(
                    {
                        node,
                        data: node.data,
                        model: this.params.model,
                        handlerParams: colFilter.getHandlerParams(column)!,
                    },
                    index
                ),
            model: filterModel,
            state: filterState,
            onModelChange: (childModel, additionalEventAttributes) => {
                const { filters, params } = this;
                const newModel = getUpdatedMultiFilterModel(params.model, filters.length, childModel, index);
                this.updateActiveList(index, childModel);
                onModelChange(newModel, additionalEventAttributes);
                onAnyFilterChanged();
            },
            onStateChange: (newState) => this.onStateChange(onStateChange, index, newState),
            getHandler: () => this.getHandler().getHandler(index)!,
            onAction: (action, additionalEventAttributes, event) => {
                if (_isUseApplyButton(params as FilterWrapperParams)) {
                    // child filters cannot perform actions within a multi filter
                    return;
                }
                const isChange = action === 'apply' || action === 'reset';
                if (isChange) {
                    this.updateActiveList(index, getFilterModelForIndex(this.params.state.model, index));
                }
                onAction(action, additionalEventAttributes, event);
                if (isChange) {
                    onAnyFilterChanged();
                }
            },
            onUiChange,
            source,
            getValue: updateGetValue(this.beans, column as AgColumn, filterDef, getValue),
        };
    }

    private updateActiveList(index: number, childModel: any): void {
        this.getHandler().updateActiveList?.(index, childModel);
    }

    private getHandler(): MultiFilterHandler {
        return this.params.getHandler() as MultiFilterHandler;
    }

    private onStateChange(
        onStateChange: (componentState: FilterDisplayState<IMultiFilterModel, any>) => void,
        index: number,
        newState: FilterDisplayState
    ): void {
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
        onStateChange(newAllState);
    }

    public getModelAsString(model: IMultiFilterModel): string {
        return this.getHandler().getModelAsString?.(model) ?? '';
    }
}
