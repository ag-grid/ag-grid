import { AgPromise } from '../../../utils';
import { ConditionPosition, ISimpleFilterModel } from '../simpleFilter';
import { ScalarFilter, Comparator, IScalarFilterParams } from '../scalarFilter';
import { IAfterGuiAttachedParams } from '../../../interfaces/iAfterGuiAttachedParams';
export interface NumberFilterModel extends ISimpleFilterModel {
    /** Filter type is always `'number'` */
    filterType?: 'number';
    /**
     * The number value(s) associated with the filter.
     * Custom filters can have no values (hence both are optional).
     * Range filter has two values (from and to).
     */
    filter?: number | null;
    /**
     * Range filter `to` value.
     */
    filterTo?: number | null;
}
export interface INumberFilterParams extends IScalarFilterParams {
    /**
     * When specified, the input field will be of type `text` instead of `number`, and this will be used as a regex of all the characters that are allowed to be typed.
     * This will be compared against any typed character and prevent the character from appearing in the input if it does not match, in supported browsers (all except Safari).
     */
    allowedCharPattern?: string;
    /**
     * Typically used alongside `allowedCharPattern`, this provides a custom parser to convert the value entered in the filter inputs into a number that can be used for comparisons.
     */
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
    protected getFilterType(): 'number';
    private stringToFloat;
    protected createCondition(position: ConditionPosition): NumberFilterModel;
    protected updateUiVisibility(): void;
    private getAllowedCharPattern;
}
