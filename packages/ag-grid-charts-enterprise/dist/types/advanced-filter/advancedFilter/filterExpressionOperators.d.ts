import { AutocompleteEntry, IRowNode } from "ag-grid-community";
import { ADVANCED_FILTER_LOCALE_TEXT } from "./advancedFilterLocaleText";
export interface FilterExpressionEvaluatorParams<ConvertedTValue, TValue = ConvertedTValue> {
    caseSensitive?: boolean;
    includeBlanksInEquals?: boolean;
    includeBlanksInLessThan?: boolean;
    includeBlanksInGreaterThan?: boolean;
    valueConverter: (value: TValue, node: IRowNode) => ConvertedTValue;
}
export type FilterExpressionEvaluator<ConvertedTValue, TValue = ConvertedTValue> = (value: TValue | null | undefined, node: IRowNode, params: FilterExpressionEvaluatorParams<ConvertedTValue, TValue>, operand1?: ConvertedTValue, operand2?: ConvertedTValue) => boolean;
export interface FilterExpressionOperator<ConvertedTValue, TValue = ConvertedTValue> {
    displayValue: string;
    evaluator: FilterExpressionEvaluator<ConvertedTValue, TValue>;
    numOperands: number;
}
export interface DataTypeFilterExpressionOperators<ConvertedTValue, TValue = ConvertedTValue> {
    operators: {
        [operator: string]: FilterExpressionOperator<ConvertedTValue, TValue>;
    };
    getEntries(activeOperators?: string[]): AutocompleteEntry[];
    findOperator(displayValue: string): string | null | undefined;
}
export interface FilterExpressionOperators {
    text: DataTypeFilterExpressionOperators<string>;
    number: DataTypeFilterExpressionOperators<number>;
    boolean: DataTypeFilterExpressionOperators<boolean>;
    date: DataTypeFilterExpressionOperators<Date>;
    dateString: DataTypeFilterExpressionOperators<Date, string>;
    object: DataTypeFilterExpressionOperators<string, any>;
}
export declare function findMatch<T>(searchValue: string, values: {
    [key: string]: T;
}, getDisplayValue: (value: T) => string): string | null | undefined;
export interface FilterExpressionOperatorsParams {
    translate: (key: keyof typeof ADVANCED_FILTER_LOCALE_TEXT, variableValues?: string[]) => string;
}
export declare class TextFilterExpressionOperators<TValue = string> implements DataTypeFilterExpressionOperators<string, TValue> {
    private params;
    operators: {
        [operator: string]: FilterExpressionOperator<string, TValue>;
    };
    constructor(params: FilterExpressionOperatorsParams);
    getEntries(activeOperators?: string[]): AutocompleteEntry[];
    findOperator(displayValue: string): string | null | undefined;
    private initOperators;
    private evaluateExpression;
}
export interface ScalarFilterExpressionOperatorsParams<ConvertedTValue> extends FilterExpressionOperatorsParams {
    equals: (value: ConvertedTValue, operand: ConvertedTValue) => boolean;
}
export declare class ScalarFilterExpressionOperators<ConvertedTValue extends number | Date, TValue = ConvertedTValue> implements DataTypeFilterExpressionOperators<ConvertedTValue, TValue> {
    private params;
    operators: {
        [operator: string]: FilterExpressionOperator<ConvertedTValue, TValue>;
    };
    constructor(params: ScalarFilterExpressionOperatorsParams<ConvertedTValue>);
    getEntries(activeOperators?: string[]): AutocompleteEntry[];
    findOperator(displayValue: string): string | null | undefined;
    private initOperators;
    private evaluateSingleOperandExpression;
}
export declare class BooleanFilterExpressionOperators implements DataTypeFilterExpressionOperators<boolean> {
    private params;
    operators: {
        [operator: string]: FilterExpressionOperator<boolean>;
    };
    constructor(params: FilterExpressionOperatorsParams);
    getEntries(activeOperators?: string[]): AutocompleteEntry[];
    findOperator(displayValue: string): string | null | undefined;
    private initOperators;
}
