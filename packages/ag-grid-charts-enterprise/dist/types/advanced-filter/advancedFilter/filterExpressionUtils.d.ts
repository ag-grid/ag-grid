import { ColumnModel, DataTypeService, ValueParserService } from 'ag-grid-community';
import { AdvancedFilterExpressionService } from './advancedFilterExpressionService';
import { FilterExpressionEvaluatorParams, FilterExpressionOperator } from "./filterExpressionOperators";
export interface FilterExpressionParserParams {
    expression: string;
    columnModel: ColumnModel;
    dataTypeService: DataTypeService;
    valueParserService: ValueParserService;
    advancedFilterExpressionService: AdvancedFilterExpressionService;
}
export interface FilterExpression {
    functionBody: string;
    params: FilterExpressionFunctionParams;
}
export interface AutocompleteUpdate {
    updatedValue: string;
    updatedPosition: number;
    hideAutocomplete?: boolean;
}
export interface FilterExpressionValidationError {
    message: string;
    startPosition: number;
    endPosition: number;
}
export interface FilterExpressionFunctionParams {
    operands: any[];
    operators: FilterExpressionOperator<any>[];
    evaluatorParams: FilterExpressionEvaluatorParams<any, any>[];
}
export declare function getSearchString(value: string, position: number, endPosition: number): string;
export declare function updateExpression(expression: string, startPosition: number, endPosition: number, updatedValuePart: string, appendSpace?: boolean, appendQuote?: boolean, empty?: boolean): AutocompleteUpdate;
export declare function findStartPosition(expression: string, position: number, endPosition: number): number;
export declare function findEndPosition(expression: string, position: number, includeCloseBracket?: boolean, isStartPositionUnknown?: boolean): {
    endPosition: number;
    isEmpty: boolean;
};
export declare function checkAndUpdateExpression(params: FilterExpressionParserParams, userValue: string, displayValue: string, endPosition: number): void;
export declare function escapeQuotes(value: string): string;
