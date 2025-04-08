import type {
    AgColumn,
    FilterEvaluator,
    FilterEvaluatorFuncParams,
    FilterEvaluatorParams,
    IMultiFilterModel,
    IMultiFilterParams,
} from 'ag-grid-community';
import { BeanStub, _removeFromArray } from 'ag-grid-community';

import { getMultiFilterDefs, getUpdatedMultiFilterModel } from './multiFilterUtil';

export class MultiFilterEvaluator
    extends BeanStub
    implements FilterEvaluator<any, any, IMultiFilterModel, IMultiFilterParams>
{
    private params: FilterEvaluatorParams<any, any, IMultiFilterModel, IMultiFilterParams>;
    private evaluatorWrappers: ({ evaluator: FilterEvaluator; evaluatorParams: FilterEvaluatorParams } | undefined)[] =
        [];
    /** ui active. could still have null model */
    private activeFilterIndices: number[] = [];

    public init(params: FilterEvaluatorParams<any, any, IMultiFilterModel, IMultiFilterParams>): void {
        this.params = params;

        const filterDefs = getMultiFilterDefs(params.filterParams);
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
        this.resetActiveList(params.model);
    }

    public refresh(params: FilterEvaluatorParams<any, any, IMultiFilterModel> & IMultiFilterParams): void {
        this.params = params;

        this.evaluatorWrappers.forEach((wrapper, index) =>
            wrapper?.evaluator.refresh?.(this.updateEvaluatorParams(params, params.model, index))
        );
        if (params.source !== 'floating' && params.source !== 'ui') {
            this.resetActiveList(params.model);
        }
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
            onModelChange: (newModel, additionalEventAttributes) =>
                onModelChange(
                    getUpdatedMultiFilterModel(this.params.model, this.evaluatorWrappers.length, newModel, index),
                    additionalEventAttributes
                ),
        };
    }

    public doesFilterPass(params: FilterEvaluatorFuncParams<any, IMultiFilterModel>): boolean {
        const filterModels = params.model?.filterModels;
        if (filterModels == null) {
            return true;
        }
        return this.evaluatorWrappers.every((wrapper, index) => {
            const model = filterModels[index];
            if (model == null) {
                return true;
            }
            const evaluator = wrapper?.evaluator;
            return !evaluator || evaluator.doesFilterPass({ ...params, model });
        });
    }

    private resetActiveList(model: IMultiFilterModel | null): void {
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

    public updateActiveList<TModel>(index: number, childModel: TModel | null): void {
        const activeFilterIndices = this.activeFilterIndices;

        _removeFromArray(activeFilterIndices, index);

        if (childModel != null) {
            activeFilterIndices.push(index);
        }
    }

    public getLastActiveFilterIndex(): number | null {
        const activeFilterIndices = this.activeFilterIndices;
        return activeFilterIndices.length > 0 ? activeFilterIndices[activeFilterIndices.length - 1] : null;
    }

    public getModelAsString(model: IMultiFilterModel | null): string {
        if (!model?.filterModels?.length) {
            return '';
        }
        const lastActiveIndex = this.getLastActiveFilterIndex() ?? 0;
        const activeWrapper = this.evaluatorWrappers[lastActiveIndex];
        return activeWrapper?.evaluator.getModelAsString?.(model.filterModels[lastActiveIndex]) ?? '';
    }

    public getEvaluator(index: number): FilterEvaluator | undefined {
        return this.evaluatorWrappers[index]?.evaluator;
    }

    public override destroy(): void {
        this.evaluatorWrappers.forEach((wrapper) => this.destroyBean(wrapper?.evaluator));
        this.evaluatorWrappers.length = 0;
        super.destroy();
    }
}
