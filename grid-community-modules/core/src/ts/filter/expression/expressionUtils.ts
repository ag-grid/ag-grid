import { ColumnModel } from "../../columns/columnModel";
import { DataTypeService } from "../../columns/dataTypeService";
import { AutocompleteEntry, AutocompleteListParams, AutoCompleteUpdate } from "./autocompleteParams";

export interface ExpressionParams {
    expression: string;
    columnModel: ColumnModel;
    dataTypeService: DataTypeService;
    columnAutocompleteTypeGenerator: (searchString: string) => AutocompleteListParams;
    columnValueCreator: (updateEntry: AutocompleteEntry) => string;
    colIdResolver: (columnName: string) => string | null;
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

export function updateExpression(expression: string, startPosition: number, endPosition: number, updatedValuePart: string): {
    updatedValue: string, updatedPosition: number
} {
    const updatedValue = expression.slice(0, startPosition) + updatedValuePart + expression.slice(endPosition + 1);
    return { updatedValue, updatedPosition: startPosition + updatedValuePart.length };
}
