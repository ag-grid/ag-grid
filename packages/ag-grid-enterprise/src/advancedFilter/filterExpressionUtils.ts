import { _parseBigIntOrNull } from 'ag-stack';

import type {
    AgColumn,
    ColumnModel,
    DataTypeService,
    IRowNode,
    NumberFilterParams,
    ValueService,
} from 'ag-grid-community';

import type { AdvancedFilterExpressionService } from './advancedFilterExpressionService';
import type { FilterExpressionEvaluatorParams, FilterExpressionOperator } from './filterExpressionOperators';

export interface FilterExpressionParserParams {
    expression: string;
    colModel: ColumnModel;
    dataTypeSvc?: DataTypeService;
    valueSvc: ValueService;
    advFilterExpSvc: AdvancedFilterExpressionService;
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

export interface ExpressionProxy {
    getValue<T = any>(colId: string, node: IRowNode): T;
}

export type FilterExpressionFunction = (
    expressionProxy: ExpressionProxy,
    node: IRowNode,
    params: FilterExpressionFunctionParams
) => boolean;

export function getBigIntParser(column: AgColumn | null | undefined): (value: string | null) => bigint | null {
    return column?.colDef.filterParams?.bigintParser ?? _parseBigIntOrNull;
}

/**
 * The `filterParams` of a number column whose operands are written in its own syntax rather than as plain
 * numbers. Both a `numberParser` and a `numberFormatter` are needed: an operand the column cannot write, it
 * must not read, or a parser reading a syntax the plain number is not in would reinterpret what the grid stored.
 */
function customNumberOperandParams(column: AgColumn | null | undefined): NumberFilterParams | undefined {
    const filterParams = column?.colDef.filterParams;
    return filterParams?.numberParser != null && filterParams.numberFormatter != null ? filterParams : undefined;
}

/** `Number` reads blank text as zero, which is not a number anyone wrote. */
const parseNumberOrNull = (value: string | null): number | null => (value?.trim() ? Number(value) : null);

/** Plain-number reading stays the default: only a column that reads *and* writes its own syntax departs from it. */
export function getNumberParser(column: AgColumn | null | undefined): (value: string | null) => number | null {
    return customNumberOperandParams(column)?.numberParser ?? parseNumberOrNull;
}

export function getNumberFormatter(
    column: AgColumn | null | undefined
): ((value: number | null) => string | null) | undefined {
    return customNumberOperandParams(column)?.numberFormatter;
}

export function hasCustomNumberOperands(column: AgColumn | null | undefined): boolean {
    return customNumberOperandParams(column) != null;
}

export function getSearchString(value: string, position: number, endPosition: number): string {
    if (!value) {
        return '';
    }
    const numChars = endPosition - position;
    return numChars ? value.slice(0, value.length - numChars) : value;
}

export function updateExpression(
    expression: string,
    startPosition: number,
    endPosition: number,
    updatedValuePart: string,
    appendSpace?: boolean,
    appendQuote?: boolean,
    empty?: boolean
): AutocompleteUpdate {
    const secondPartStartPosition = endPosition + (!expression.length || empty ? 0 : 1);
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
    const updatedValue =
        expression.slice(0, startPosition) + updatedValuePart + expression.slice(secondPartStartPosition);
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

export function findEndPosition(
    expression: string,
    position: number,
    includeCloseBracket?: boolean,
    isStartPositionUnknown?: boolean
): { endPosition: number; isEmpty: boolean } {
    let endPosition = position;
    let isEmpty = false;
    while (endPosition < expression.length) {
        const char = expression[endPosition];
        if (char === '(') {
            if (isStartPositionUnknown && expression[endPosition - 1] === ' ') {
                isEmpty = true;
            } else {
                endPosition = endPosition - 1;
            }
            break;
        } else if (char === ' ' || (includeCloseBracket && char === ')')) {
            endPosition = endPosition - 1;
            break;
        }
        endPosition++;
    }
    return { endPosition, isEmpty };
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
