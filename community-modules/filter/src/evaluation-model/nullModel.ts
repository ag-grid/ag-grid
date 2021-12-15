import { FilterExpression, FilterEvaluationModel } from "@ag-grid-community/core";

export class NullModel implements FilterEvaluationModel<void> {
    evaluate(_: void): boolean {
        return true;
    }
    isValid(): boolean {
        return true;
    }
    isNull(): boolean {
        return true;
    }
    toFilterExpression(): FilterExpression | null {
        return null;
    }   
}
