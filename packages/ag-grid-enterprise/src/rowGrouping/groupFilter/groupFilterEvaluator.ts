import type { FilterEvaluator, FilterEvaluatorParams, IFilterParams } from 'ag-grid-community';
import { BeanStub } from 'ag-grid-community';

export class GroupFilterEvaluator extends BeanStub implements FilterEvaluator<any, any, any, null, IFilterParams> {
    public init(params: FilterEvaluatorParams<any, any, any, null> & IFilterParams<any, any>): void {
        this.validateModel(params);
    }

    public refresh(params: FilterEvaluatorParams<any, any, any, null> & IFilterParams<any, any>): void {
        this.validateModel(params);
    }

    public doesFilterPass(): boolean {
        // filters should only be evaluated on the child columns
        return true;
    }

    private validateModel(params: FilterEvaluatorParams<any, any, any, null> & IFilterParams<any, any>): void {
        // model should always be null
        if (params.model != null) {
            params.onModelChange(null);
        }
    }
}
