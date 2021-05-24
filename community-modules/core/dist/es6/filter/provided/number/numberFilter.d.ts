// Type definitions for @ag-grid-community/core v25.3.0
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { AgPromise } from '../../../utils';
import { ConditionPosition, ISimpleFilterModel } from '../simpleFilter';
import { ScalarFilter, Comparator, IScalarFilterParams } from '../scalarFilter';
import { IAfterGuiAttachedParams } from '../../../interfaces/iAfterGuiAttachedParams';
export interface NumberFilterModel extends ISimpleFilterModel {
    filter?: number | null;
    filterTo?: number | null;
}
export interface INumberFilterParams extends IScalarFilterParams {
    allowedCharPattern?: string;
    numberParser?: (text: string | null) => number;
}
export declare class NumberFilter extends ScalarFilter<NumberFilterModel, number> {
    static DEFAULT_FILTER_OPTIONS: string[];
    private readonly eValueFrom1;
    private readonly eValueTo1;
    private readonly eValueFrom2;
    private readonly eValueTo2;
    private numberFilterParams;
    constructor();
    protected mapRangeFromModel(filterModel: NumberFilterModel): {
        from: number | null | undefined;
        to: number | null | undefined;
    };
    protected getDefaultDebounceMs(): number;
    protected resetUiToDefaults(silent?: boolean): AgPromise<void>;
    protected setConditionIntoUi(model: NumberFilterModel, position: ConditionPosition): void;
    protected setValueFromFloatingFilter(value: string): void;
    protected comparator(): Comparator<number>;
    protected setParams(params: INumberFilterParams): void;
    private addValueChangedListeners;
    private resetPlaceholder;
    afterGuiAttached(params?: IAfterGuiAttachedParams): void;
    protected getDefaultFilterOptions(): string[];
    protected createValueTemplate(position: ConditionPosition): string;
    protected isConditionUiComplete(position: ConditionPosition): boolean;
    protected areSimpleModelsEqual(aSimple: NumberFilterModel, bSimple: NumberFilterModel): boolean;
    protected getFilterType(): string;
    private stringToFloat;
    protected createCondition(position: ConditionPosition): NumberFilterModel;
    protected updateUiVisibility(): void;
    private getAllowedCharPattern;
}
