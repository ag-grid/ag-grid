import { SimpleFilter, ISimpleFilterParams, ISimpleFilterModel, ISimpleFilterModelType, Tuple, SimpleFilterModelFormatter } from '../simpleFilter';
import { AgInputTextField } from '../../../widgets/agInputTextField';
import { BaseColDefParams } from '../../../entities/colDef';
import { IDoesFilterPassParams, IFilterOptionDef, IFilterParams } from '../../../interfaces/iFilter';
export interface TextFilterModel extends ISimpleFilterModel {
    /** Filter type is always `'text'` */
    filterType?: 'text';
    /**
     * The text value associated with the filter.
     * It's optional as custom filters may not have a text value.
     * */
    filter?: string | null;
    /**
     * The 2nd text value associated with the filter, if supported.
     * */
    filterTo?: string | null;
}
export interface TextMatcherParams extends BaseColDefParams {
    /**
     * The applicable filter option being tested.
     * One of: `equals`, `notEqual`, `contains`, `notContains`, `startsWith`, `endsWith`.
     */
    filterOption: string | null | undefined;
    /**
     * The value about to be filtered.
     * If this column has a value getter, this value will be coming from the value getter,
     * otherwise it is the raw value injected into the grid.
     * If a `textFormatter` is provided, this value will have been formatted.
     * If no `textFormatter` is provided and `caseSensitive` is not provided or is `false`,
     * the value will have been converted to lower case.
     */
    value: any;
    /**
     * The value to filter by.
     * If a `textFormatter` is provided, this value will have been formatted.
     * If no `textFormatter` is provided and `caseSensitive` is not provided or is `false`,
     * the value will have been converted to lower case.
     */
    filterText: string | null;
    textFormatter?: TextFormatter;
}
export interface TextMatcher {
    (params: TextMatcherParams): boolean;
}
export interface TextFormatter {
    (from?: string | null): string | null;
}
/**
 * Parameters provided by the grid to the `init` method of a `TextFilter`.
 * Do not use in `colDef.filterParams` - see `ITextFilterParams` instead.
 */
export declare type TextFilterParams<TData = any> = ITextFilterParams & IFilterParams<TData>;
/**
 * Parameters used in `colDef.filterParams` to configure a  Text Filter (`agTextColumnFilter`).
 */
export interface ITextFilterParams extends ISimpleFilterParams {
    /**
     * Used to override how to filter based on the user input.
     * Returns `true` if the value passes the filter, otherwise `false`.
     */
    textMatcher?: TextMatcher;
    /**
     * By default, text filtering is case-insensitive. Set this to `true` to make text filtering case-sensitive.
     * Default: `false`
     */
    caseSensitive?: boolean;
    /**
     * Formats the text before applying the filter compare logic.
     * Useful if you want to substitute accented characters, for example.
     */
    textFormatter?: (from: string) => string | null;
    /**
     * If `true`, the input that the user enters will be trimmed when the filter is applied, so any leading or trailing whitespace will be removed.
     * If only whitespace is entered, it will be left as-is.
     * If you enable `trimInput`, it is best to also increase the `debounceMs` to give users more time to enter text.
     * Default: `false`
     */
    trimInput?: boolean;
}
export declare class TextFilterModelFormatter extends SimpleFilterModelFormatter {
    protected conditionToString(condition: TextFilterModel, options?: IFilterOptionDef): string;
}
export declare class TextFilter extends SimpleFilter<TextFilterModel, string> {
    static DEFAULT_FILTER_OPTIONS: ISimpleFilterModelType[];
    static DEFAULT_FORMATTER: TextFormatter;
    static DEFAULT_LOWERCASE_FORMATTER: TextFormatter;
    static DEFAULT_MATCHER: TextMatcher;
    private readonly eValuesFrom;
    private readonly eValuesTo;
    private matcher;
    private formatter;
    private textFilterParams;
    private filterModelFormatter;
    constructor();
    static trimInput(value?: string | null): string | null | undefined;
    protected getDefaultDebounceMs(): number;
    protected setParams(params: TextFilterParams): void;
    private getTextMatcher;
    protected createCondition(position: number): TextFilterModel;
    protected getFilterType(): 'text';
    protected areSimpleModelsEqual(aSimple: TextFilterModel, bSimple: TextFilterModel): boolean;
    protected getInputs(position: number): Tuple<AgInputTextField>;
    protected getValues(position: number): Tuple<string>;
    protected getDefaultFilterOptions(): string[];
    protected createValueElement(): HTMLElement;
    private createFromToElement;
    protected removeValueElements(startPosition: number, deleteCount?: number): void;
    protected mapValuesFromModel(filterModel: TextFilterModel | null): Tuple<string>;
    protected evaluateNullValue(filterType: ISimpleFilterModelType | null): boolean;
    protected evaluateNonNullValue(values: Tuple<string>, cellValue: string, filterModel: TextFilterModel, params: IDoesFilterPassParams): boolean;
    getModelAsString(model: ISimpleFilterModel): string;
}
