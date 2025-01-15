import type {
    AgColumn,
    FilterEvaluator,
    FilterEvaluatorFuncParams,
    FilterEvaluatorParams,
    FilterModelValidation,
    IMultiFilterModel,
    IMultiFilterParams,
} from 'ag-grid-community';
import { BeanStub, _initEvaluator } from 'ag-grid-community';

import { getMultiFilterDefs, refreshEvaluator, updateMultiFilterModel } from './multiFilterUtil';

export class MultiFilterEvaluator
    extends BeanStub
    implements FilterEvaluator<any, any, any, IMultiFilterModel, IMultiFilterParams>
{
    private params: FilterEvaluatorParams<any, any, any, IMultiFilterModel> & IMultiFilterParams;
    private evaluatorWrappers: ({ evaluator: FilterEvaluator; evaluatorParams: FilterEvaluatorParams } | undefined)[] =
        [];
    private activeFilterIndices: number[] = [];

    public init(
        params: FilterEvaluatorParams<any, any, any, IMultiFilterModel> & IMultiFilterParams
    ): Promise<FilterModelValidation<IMultiFilterModel>> {
        this.params = params;

        const filterDefs = getMultiFilterDefs(params);
        const promises: Promise<FilterModelValidation>[] = filterDefs.map((def, index) => {
            const wrapper = this.beans.colFilter!.createEvaluator(params.column as AgColumn, def, 'agTextColumnFilter');
            this.evaluatorWrappers.push(wrapper);
            if (!wrapper) {
                // TODO - warning
                return Promise.resolve({ valid: false, model: null });
            }
            const { evaluator, evaluatorParams } = wrapper;
            const updatedEvaluatorParams: FilterEvaluatorParams = {
                ...evaluatorParams!,
                model: params.model?.filterModels?.[index] ?? null,
            };
            return _initEvaluator(evaluator, updatedEvaluatorParams);
        });

        return this.processFilterResults(promises);
    }

    public refresh(
        params: FilterEvaluatorParams<any, any, any, IMultiFilterModel> & IMultiFilterParams
    ): Promise<FilterModelValidation<IMultiFilterModel>> {
        this.params = params;

        const promises: Promise<FilterModelValidation>[] = this.evaluatorWrappers.map((wrapper, index) => {
            if (!wrapper) {
                return Promise.resolve({ valid: true });
            }
            return refreshEvaluator(wrapper.evaluator, {
                ...params,
                model: params.model?.filterModels?.[index] ?? null,
            });
        });

        return this.processFilterResults(promises);
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
            return this.evaluatorWrappers[index]?.evaluator.doesFilterPass({ ...params, model });
        });
    }

    private processFilterResults(
        promises: Promise<FilterModelValidation>[]
    ): Promise<FilterModelValidation<IMultiFilterModel>> {
        return Promise.all(promises).then((results) => {
            const existingModel = this.params.model;
            if (results.some(({ valid }) => !valid)) {
                const filterModels = results.map((result, index) => {
                    if (result.valid) {
                        return existingModel?.filterModels?.[index] ?? null;
                    }
                    return result.model ?? null;
                });
                const model = updateMultiFilterModel(filterModels);
                this.updateActiveFilters(model);
                return { valid: false, model };
            }

            this.updateActiveFilters(existingModel);
            return { valid: true };
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
