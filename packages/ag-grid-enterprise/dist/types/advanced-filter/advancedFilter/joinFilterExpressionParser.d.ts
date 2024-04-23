import { AdvancedFilterModel, AutocompleteEntry, AutocompleteListParams } from "ag-grid-community";
import { AutocompleteUpdate, FilterExpressionFunction, FilterExpressionFunctionParams, FilterExpressionParserParams, FilterExpressionValidationError } from "./filterExpressionUtils";
export declare class JoinFilterExpressionParser {
    private params;
    readonly startPosition: number;
    private expectingExpression;
    private expectingOperator;
    private expressionParsers;
    private operatorParser;
    private endPosition;
    private missingEndBracket;
    private extraEndBracket;
    constructor(params: FilterExpressionParserParams, startPosition: number);
    parseExpression(): number;
    isValid(): boolean;
    getValidationError(): FilterExpressionValidationError | null;
    getFunctionString(params: FilterExpressionFunctionParams): string;
    getFunctionParsed(params: FilterExpressionFunctionParams): FilterExpressionFunction;
    getAutocompleteListParams(position: number): AutocompleteListParams | undefined;
    updateExpression(position: number, updateEntry: AutocompleteEntry, type?: string): AutocompleteUpdate | null;
    getModel(): AdvancedFilterModel;
    private getColumnAutocompleteListParams;
    private getExpressionParserIndex;
}
