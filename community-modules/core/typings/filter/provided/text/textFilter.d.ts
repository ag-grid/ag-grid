import { IDoesFilterPassParams } from "../../../interfaces/iFilter";
import { SimpleFilter, ConditionPosition, ISimpleFilterParams, ISimpleFilterModel } from "../simpleFilter";
export interface TextFilterModel extends ISimpleFilterModel {
    filter?: string;
}
export interface TextComparator {
    (filter: string, gridValue: any, filterText: string): boolean;
}
export interface TextFormatter {
    (from: string): string;
}
export interface ITextFilterParams extends ISimpleFilterParams {
    textCustomComparator?: TextComparator;
    caseSensitive?: boolean;
    textFormatter?: (from: string) => string;
}
export declare class TextFilter extends SimpleFilter<TextFilterModel> {
    private static readonly FILTER_TYPE;
    static DEFAULT_FILTER_OPTIONS: string[];
    static DEFAULT_FORMATTER: TextFormatter;
    static DEFAULT_LOWERCASE_FORMATTER: TextFormatter;
    static DEFAULT_COMPARATOR: TextComparator;
    private eValue1;
    private eValue2;
    private eInputWrapper1;
    private eInputWrapper2;
    private comparator;
    private formatter;
    private textFilterParams;
    protected getDefaultDebounceMs(): number;
    private getValue;
    private addValueChangedListeners;
    protected setParams(params: ITextFilterParams): void;
    protected setConditionIntoUi(model: TextFilterModel, position: ConditionPosition): void;
    protected createCondition(position: ConditionPosition): TextFilterModel;
    protected getFilterType(): string;
    protected areSimpleModelsEqual(aSimple: TextFilterModel, bSimple: TextFilterModel): boolean;
    protected resetUiToDefaults(): void;
    protected setValueFromFloatingFilter(value: string): void;
    getDefaultFilterOptions(): string[];
    protected createValueTemplate(position: ConditionPosition): string;
    protected updateUiVisibility(): void;
    afterGuiAttached(): void;
    protected isConditionUiComplete(position: ConditionPosition): boolean;
    individualConditionPasses(params: IDoesFilterPassParams, filterModel: TextFilterModel): boolean;
}
