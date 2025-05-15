import type {
    AgColumn,
    FilterEvaluator,
    FilterEvaluatorBaseParams,
    FilterEvaluatorFuncParams,
    FilterEvaluatorParams,
    IMultiFilterDef,
    IMultiFilterModel,
    IMultiFilterParams,
} from 'ag-grid-community';
import { BeanStub, _removeFromArray } from 'ag-grid-community';

import {
    forEachReverse,
    getFilterModelForIndex,
    getMultiFilterDefs,
    getUpdatedMultiFilterModel,
    updateGetValue,
} from './multiFilterUtil';

interface EvaluatorWrapper {
    evaluator: FilterEvaluator;
    evaluatorParams: FilterEvaluatorBaseParams;
}

export class MultiFilterEvaluator
    extends BeanStub
    implements FilterEvaluator<any, any, IMultiFilterModel, IMultiFilterParams>
{
    private params: FilterEvaluatorParams<any, any, IMultiFilterModel, IMultiFilterParams>;
    private evaluatorWrappers: (EvaluatorWrapper | undefined)[] = [];
    /** ui active. could still have null model */
    private activeFilterIndices: number[] = [];
    private filterDefs: IMultiFilterDef[] = [];

    public init(params: FilterEvaluatorParams<any, any, IMultiFilterModel, IMultiFilterParams>): void {
        this.params = params;

        const filterDefs = getMultiFilterDefs(params.filterParams);
        this.filterDefs = filterDefs;
        filterDefs.forEach((def, index) => {
            const wrapper = this.beans.colFilter!.createEvaluator(params.column as AgColumn, def, 'agTextColumnFilter');
            this.evaluatorWrappers.push(wrapper);
            if (!wrapper) {
                // TODO - warning
                return;
            }
            const { evaluator, evaluatorParams } = wrapper;
            evaluator.init?.({
                ...this.updateEvaluatorParams(evaluatorParams!, index),
                model: getFilterModelForIndex(params.model, index),
                source: 'init',
            });
        });
        this.resetActiveList(params.model);
    }

    public refresh(params: FilterEvaluatorParams<any, any, IMultiFilterModel> & IMultiFilterParams): void {
        this.params = params;
        const { model, source } = params;

        this.evaluatorWrappers.forEach((wrapper, index) => {
            const updatedParams = this.updateEvaluatorParams(params, index);
            if (wrapper) {
                wrapper.evaluatorParams = updatedParams;
                wrapper.evaluator.refresh?.({ ...updatedParams, model: getFilterModelForIndex(model, index), source });
            }
        });
        if (params.source !== 'floating' && params.source !== 'ui') {
            this.resetActiveList(params.model);
        }
    }

    private updateEvaluatorParams(params: FilterEvaluatorBaseParams, index: number): FilterEvaluatorBaseParams {
        const { onModelChange, doesRowPassOtherFilter, getValue } = params;
        const evaluatorParams: FilterEvaluatorBaseParams = {
            ...params!,
            onModelChange: (newModel, additionalEventAttributes) =>
                onModelChange(
                    getUpdatedMultiFilterModel(this.params.model, this.evaluatorWrappers.length, newModel, index),
                    additionalEventAttributes
                ),
            doesRowPassOtherFilter: (node) =>
                doesRowPassOtherFilter(node) &&
                this.doesFilterPass({ node, data: node.data, model: this.params.model, evaluatorParams }, index),
            getValue: updateGetValue(this.beans, params.column as AgColumn, this.filterDefs[index], getValue),
        };
        return evaluatorParams;
    }

    public doesFilterPass(params: FilterEvaluatorFuncParams<any, IMultiFilterModel>, indexToSkip?: number): boolean {
        const filterModels = params.model?.filterModels;
        if (filterModels == null) {
            return true;
        }
        return this.evaluatorWrappers.every((wrapper, index) => {
            const model = filterModels[index];
            if (model == null || (indexToSkip != null && index === indexToSkip)) {
                return true;
            }
            const evaluator = wrapper?.evaluator;
            return (
                !evaluator || evaluator.doesFilterPass({ ...params, model, evaluatorParams: wrapper.evaluatorParams })
            );
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

    public onAnyFilterChanged(): void {
        forEachReverse(this.evaluatorWrappers, (wrapper) => wrapper?.evaluator?.onAnyFilterChanged?.());
    }

    public onNewRowsLoaded(): void {
        forEachReverse(this.evaluatorWrappers, (wrapper) => wrapper?.evaluator?.onNewRowsLoaded?.());
    }

    public override destroy(): void {
        this.evaluatorWrappers.forEach((wrapper) => this.destroyBean(wrapper?.evaluator));
        this.evaluatorWrappers.length = 0;
        super.destroy();
    }
}
