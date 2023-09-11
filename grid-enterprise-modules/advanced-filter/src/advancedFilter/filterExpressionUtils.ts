import {
    AutocompleteEntry,
    AutocompleteListParams,
    BaseCellDataType,
    Column,
    ColumnModel,
    DataTypeService,
    ValueParserService
} from "@ag-grid-community/core";
import { ADVANCED_FILTER_LOCALE_TEXT } from './advancedFilterLocaleText';
import { FilterExpressionOperators } from "./filterExpressionOperators";

export interface FilterExpressionParserParams {
    expression: string;
    columnModel: ColumnModel;
    dataTypeService: DataTypeService;
    valueParserService: ValueParserService;
    columnAutocompleteTypeGenerator: (searchString: string) => AutocompleteListParams;
    columnValueCreator: (updateEntry: AutocompleteEntry) => string;
    colIdResolver: (columnName: string) => { colId: string, columnName: string } | null;
    operators: FilterExpressionOperators;
    joinOperators: { and: string, or: string };
    translate: (key: keyof typeof ADVANCED_FILTER_LOCALE_TEXT, variableValues?: string[]) => string;
    parseOperandModelValue: (operand: string, baseCellDataType: BaseCellDataType, column: Column) => string | number | null;
}

export interface FilterExpression {
    functionBody: string;
    args: any[];
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

export function getSearchString(value: string, position: number, endPosition: number): string {
    if (!value) { return ''; }
    const numChars = endPosition - position;
    return numChars ? value.slice(0, value.length - numChars) : value;
}

export function updateExpression(
    expression: string,
    startPosition: number,
    endPosition: number,
    updatedValuePart: string,
    appendSpace?: boolean,
    appendQuote?: boolean
): AutocompleteUpdate {
    const secondPartStartPosition = endPosition + (!expression.length ? 0 : 1);
    let positionOffset = 0;
    if (appendSpace) {
        if (expression[secondPartStartPosition] === ' ') {
            // already a space, just move the position
            positionOffset = 1;
        } else {
            updatedValuePart += ' ';
            if (appendQuote) {
                updatedValuePart += `"`;
            }
        }
    }
    const updatedValue = expression.slice(0, startPosition) + updatedValuePart + expression.slice(secondPartStartPosition);
    return { updatedValue, updatedPosition: startPosition + updatedValuePart.length + positionOffset };
}

export function findStartPosition(expression: string, position: number, endPosition: number) {
    let startPosition = position;
    while (startPosition < endPosition) {
        const char = expression[startPosition];
        if (char !== ' ') {
            break;
        }
        startPosition++;
    }
    return startPosition;
}

export function findEndPosition(expression: string, position: number) {
    let endPosition = position;
    while (endPosition < expression.length) {
        const char = expression[endPosition];
        if (char === ' ') {
            endPosition = endPosition - 1;
            break;
        }
        endPosition++;
    }
    return endPosition;
}

export function checkAndUpdateExpression(
    params: FilterExpressionParserParams,
    userValue: string,
    displayValue: string,
    endPosition: number
): void {
    if (displayValue !== userValue) {
        params.expression = updateExpression(
            params.expression,
            endPosition - userValue.length + 1,
            endPosition,
            displayValue
        ).updatedValue;
    }
}

export function escapeQuotes(value: string): string {
    return value.replace(/(['"])/, '\\$1');
}
