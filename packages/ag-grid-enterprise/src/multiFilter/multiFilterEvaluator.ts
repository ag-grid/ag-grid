import type {
    AgColumn,
    FilterEvaluator,
    FilterEvaluatorFuncParams,
    FilterEvaluatorParams,
    IMultiFilterModel,
    IMultiFilterParams,
} from 'ag-grid-community';
import { BeanStub } from 'ag-grid-community';

import { getMultiFilterDefs, updateMultiFilterModel } from './multiFilterUtil';

export class MultiFilterEvaluator
    extends BeanStub
    implements FilterEvaluator<any, any, any, IMultiFilterModel, IMultiFilterParams>
{
    private params: FilterEvaluatorParams<any, any, any, IMultiFilterModel> & IMultiFilterParams;
    private evaluatorWrappers: ({ evaluator: FilterEvaluator; evaluatorParams: FilterEvaluatorParams } | undefined)[] =
        [];
    private activeFilterIndices: number[] = [];

    public init(params: FilterEvaluatorParams<any, any, any, IMultiFilterModel> & IMultiFilterParams): void {
        this.params = params;

        const filterDefs = getMultiFilterDefs(params);
        filterDefs.forEach((def, index) => {
            const wrapper = this.beans.colFilter!.createEvaluator(params.column as AgColumn, def, 'agTextColumnFilter');
            this.evaluatorWrappers.push(wrapper);
            if (!wrapper) {
                // TODO - warning
                return;
            }
            const { evaluator, evaluatorParams } = wrapper;
            evaluator.init?.(this.updateEvaluatorParams(evaluatorParams!, params.model, index));
        });
        this.updateActiveFilters(params.model);
    }

    public refresh(params: FilterEvaluatorParams<any, any, any, IMultiFilterModel> & IMultiFilterParams): void {
        this.params = params;

        this.evaluatorWrappers.forEach((wrapper, index) =>
            wrapper?.evaluator.refresh?.(this.updateEvaluatorParams(params, params.model, index))
        );
        this.updateActiveFilters(params.model);
    }

    private updateEvaluatorParams(
        params: FilterEvaluatorParams,
        model: IMultiFilterModel | null,
        index: number
    ): FilterEvaluatorParams {
        const onModelChange = params.onModelChange;
        return {
            ...params!,
            model: model?.filterModels?.[index] ?? null,
            onModelChange: (newModel, additionalEventAttributes) => {
                const existingModel = this.params.model;
                const filterModels =
                    existingModel?.filterModels ??
                    this.evaluatorWrappers.map((_evaluator, evaluatorIndex) =>
                        index === evaluatorIndex ? newModel ?? null : null
                    );
                onModelChange(updateMultiFilterModel(filterModels), additionalEventAttributes);
            },
        };
    }

    public doesFilterPass(params: FilterEvaluatorFuncParams<any, IMultiFilterModel>): boolean {
        const filterModels = params.model?.filterModels;
        if (filterModels == null) {
            return true;
        }
        return this.activeFilterIndices.every((index) => {
            const model = filterModels[index];
            if (model == null) {
                return true;
            }
            const evaluator = this.evaluatorWrappers[index]?.evaluator;
            return !evaluator || evaluator.doesFilterPass({ ...params, model });
        });
    }

    private updateActiveFilters(model: IMultiFilterModel | null): void {
        this.activeFilterIndices = [];
        const filterModels = model?.filterModels;
        if (filterModels == null) {
            return;
        }
        for (let i = 0; i < this.evaluatorWrappers.length; i++) {
            const isActive = filterModels[i] != null;
            if (isActive) {
                this.activeFilterIndices.push(i);
            }
        }
    }

    public override destroy(): void {
        this.evaluatorWrappers.forEach((wrapper) => this.destroyBean(wrapper?.evaluator));
        this.evaluatorWrappers.length = 0;
        super.destroy();
    }
}
