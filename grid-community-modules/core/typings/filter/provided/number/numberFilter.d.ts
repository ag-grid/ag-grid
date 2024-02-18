import { ISimpleFilterModel, SimpleFilterModelFormatter, Tuple } from '../simpleFilter';
import { ScalarFilter, Comparator, IScalarFilterParams } from '../scalarFilter';
import { AgInputTextField } from '../../../widgets/agInputTextField';
import { IFilterOptionDef, IFilterParams } from '../../../interfaces/iFilter';
import { AgInputNumberField } from '../../../widgets/agInputNumberField';
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
/**
 * Parameters provided by the grid to the `init` method of a `NumberFilter`.
 * Do not use in `colDef.filterParams` - see `INumberFilterParams` instead.
 */
export declare type NumberFilterParams<TData = any> = INumberFilterParams & IFilterParams<TData>;
/**
 * Parameters used in `colDef.filterParams` to configure a Number Filter (`agNumberColumnFilter`).
 */
export interface INumberFilterParams extends IScalarFilterParams {
    /**
     * When specified, the input field will be of type `text`, and this will be used as a regex of all the characters that are allowed to be typed.
     * This will be compared against any typed character and prevent the character from appearing in the input if it does not match.
     */
    allowedCharPattern?: string;
    /**
     * Typically used alongside `allowedCharPattern`, this provides a custom parser to convert the value entered in the filter inputs into a number that can be used for comparisons.
     */
    numberParser?: (text: string | null) => number | null;
    /**
     * Typically used alongside `allowedCharPattern`, this provides a custom formatter to convert the number value in the filter model
     * into a string to be used in the filter input. This is the inverse of the `numberParser`.
     */
    numberFormatter?: (value: number | null) => string | null;
}
export declare class NumberFilterModelFormatter extends SimpleFilterModelFormatter<number> {
    protected conditionToString(condition: NumberFilterModel, options?: IFilterOptionDef): string;
}
export declare function getAllowedCharPattern(filterParams?: NumberFilterParams): string | null;
export declare class NumberFilter extends ScalarFilter<NumberFilterModel, number> {
    static DEFAULT_FILTER_OPTIONS: import("../simpleFilter").ISimpleFilterModelType[];
    private readonly eValuesFrom;
    private readonly eValuesTo;
    private numberFilterParams;
    private filterModelFormatter;
    constructor();
    refresh(params: NumberFilterParams): boolean;
    protected mapValuesFromModel(filterModel: NumberFilterModel | null): Tuple<number>;
    protected getDefaultDebounceMs(): number;
    protected comparator(): Comparator<number>;
    protected setParams(params: NumberFilterParams): void;
    protected getDefaultFilterOptions(): string[];
    protected setElementValue(element: AgInputTextField | AgInputNumberField, value: number | null, fromFloatingFilter?: boolean): void;
    protected createValueElement(): HTMLElement;
    private createFromToElement;
    protected removeValueElements(startPosition: number, deleteCount?: number): void;
    protected getValues(position: number): Tuple<number>;
    protected areSimpleModelsEqual(aSimple: NumberFilterModel, bSimple: NumberFilterModel): boolean;
    protected getFilterType(): 'number';
    private processValue;
    private stringToFloat;
    protected createCondition(position: number): NumberFilterModel;
    protected getInputs(position: number): Tuple<AgInputTextField | AgInputNumberField>;
    getModelAsString(model: ISimpleFilterModel): string;
    protected hasInvalidInputs(): boolean;
}
