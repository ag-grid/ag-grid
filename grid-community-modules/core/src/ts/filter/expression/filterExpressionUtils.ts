import { ColumnModel } from "../../columns/columnModel";
import { DataTypeService } from "../../columns/dataTypeService";
import { AutocompleteEntry, AutocompleteListParams } from "../../widgets/autocompleteParams";
import { FilterExpressionOperators } from "./filterExpressionOperators";

export interface FilterExpressionParserParams {
    expression: string;
    columnModel: ColumnModel;
    dataTypeService: DataTypeService;
    columnAutocompleteTypeGenerator: (searchString: string) => AutocompleteListParams;
    columnValueCreator: (updateEntry: AutocompleteEntry) => string;
    colIdResolver: (columnName: string) => { colId: string, columnName: string } | null;
    operators: FilterExpressionOperators;
    joinOperators: { and: string, or: string };
    translate: (key: string, defaultValue: string, variableValues?: string[]) => string;
}

export interface AutocompleteUpdate {
    updatedValue: string;
    updatedPosition: number;
}

export function getSearchString(value: string, position: number, endPosition: number): string {
    const numChars = endPosition - position;
    return numChars ? value.slice(0, value.length - numChars) : value;
}

export function updateExpressionByWord(expression: string, position: number, updateEntry: AutocompleteEntry): {
    updatedValue: string, updatedPosition: number
} {
    let i = position - 1;
    let startPosition = 0;

    while (i >= 0) {
        const char = expression[i];
        if (char === ' ' || char === '(') {
            startPosition = i + 1;
            break;
        }
        i--;
    }

    i = position;
    let endPosition = expression.length - 1;

    while (i < expression.length) {
        const char = expression[i];
        if (char === ' ' || char === ')') {
            endPosition = i - 1;
            break;
        }
        i++;
    }

    return updateExpression(expression, startPosition, endPosition, updateEntry.displayValue ?? updateEntry.key);
}

export function updateExpressionFromStart(expression: string, position: number, endPosition: number, updateEntry: AutocompleteEntry): {
    updatedValue: string, updatedPosition: number
} {
    let startPosition = position;

    while (startPosition < endPosition) {
        const char = expression[startPosition];
        if (char !== ' ') {
            break;
        }
        startPosition++;
    }

    return updateExpression(expression, startPosition, endPosition, updateEntry.displayValue ?? updateEntry.key);
}

export function updateExpression(expression: string, startPosition: number, endPosition: number, updatedValuePart: string): {
    updatedValue: string, updatedPosition: number
} {
    const updatedValue = expression.slice(0, startPosition) + updatedValuePart + expression.slice(endPosition + 1);
    return { updatedValue, updatedPosition: startPosition + updatedValuePart.length };
}

export function checkAndUpdateExpression(params: FilterExpressionParserParams, userValue: string, displayValue: string, endPosition: number): void {
    if (displayValue !== userValue) {
        params.expression = updateExpression(
            params.expression,
            endPosition - userValue.length + 1,
            endPosition,
            displayValue
        ).updatedValue;
    }
}
