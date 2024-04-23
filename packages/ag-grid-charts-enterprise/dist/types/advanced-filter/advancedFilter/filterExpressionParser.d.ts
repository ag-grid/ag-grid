import { AdvancedFilterModel, AutocompleteEntry, AutocompleteListParams } from "ag-grid-community";
import { AutocompleteUpdate, FilterExpressionFunction, FilterExpressionFunctionParams, FilterExpressionParserParams } from "./filterExpressionUtils";
export declare class FilterExpressionParser {
    private params;
    private joinExpressionParser;
    private valid;
    constructor(params: FilterExpressionParserParams);
    parseExpression(): string;
    isValid(): boolean;
    getValidationMessage(): string | null;
    getFunctionString(): {
        functionString: string;
        params: FilterExpressionFunctionParams;
    };
    getFunctionParsed(): {
        expressionFunction: FilterExpressionFunction;
        params: FilterExpressionFunctionParams;
    };
    getAutocompleteListParams(position: number): AutocompleteListParams;
    updateExpression(position: number, updateEntry: AutocompleteEntry, type?: string): AutocompleteUpdate;
    getModel(): AdvancedFilterModel | null;
    private createFunctionParams;
}
