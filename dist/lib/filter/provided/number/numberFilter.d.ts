// Type definitions for ag-grid-community v21.1.1
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { ConditionPosition, ISimpleFilterModel } from "../simpleFilter";
import { ScalerFilter, Comparator, IScalarFilterParams } from "../scalerFilter";
export interface NumberFilterModel extends ISimpleFilterModel {
    filter?: number;
    filterTo?: number;
}
export interface INumberFilterParams extends IScalarFilterParams {
}
export declare class NumberFilter extends ScalerFilter<NumberFilterModel, number> {
    private static readonly FILTER_TYPE;
    static DEFAULT_FILTER_OPTIONS: string[];
    private eValueFrom1;
    private eValueFrom2;
    private eValueTo1;
    private eValueTo2;
    protected mapRangeFromModel(filterModel: NumberFilterModel): {
        from: number;
        to: number;
    };
    protected getDefaultDebounceMs(): number;
    protected resetUiToDefaults(): void;
    protected setConditionIntoUi(model: NumberFilterModel, position: ConditionPosition): void;
    protected setValueFromFloatingFilter(value: string): void;
    protected comparator(): Comparator<number>;
    protected setParams(params: INumberFilterParams): void;
    private addValueChangedListeners;
    afterGuiAttached(): void;
    protected getDefaultFilterOptions(): string[];
    protected createValueTemplate(position: ConditionPosition): string;
    protected isConditionUiComplete(position: ConditionPosition): boolean;
    protected areSimpleModelsEqual(aSimple: NumberFilterModel, bSimple: NumberFilterModel): boolean;
    protected getFilterType(): string;
    private stringToFloat;
    protected createCondition(position: ConditionPosition): NumberFilterModel;
    protected updateUiVisibility(): void;
}
