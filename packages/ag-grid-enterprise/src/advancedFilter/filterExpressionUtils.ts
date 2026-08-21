import { _parseBigIntOrNull } from 'ag-stack';

import { _bindFilterCallback } from 'ag-grid-community';
import type {
    AgColumn,
    ColumnModel,
    DataTypeService,
    GridOptionsService,
    IBigIntFilterParams,
    IRowNode,
    NumberFilterParams,
    ValueService,
} from 'ag-grid-community';

import type { AdvancedFilterExpressionService } from './advancedFilterExpressionService';
import type { FilterExpressionEvaluatorParams, FilterExpressionOperator } from './filterExpressionOperators';

export interface FilterExpressionParserParams {
    expression: string;
    gos: GridOptionsService;
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

type FilterOperandParser<V> = (value: string | null) => V | null;

const bigIntParams = (column: AgColumn | null | undefined): IBigIntFilterParams | undefined =>
    column?.colDef.filterParams;

/** Read unpaired, unlike the number equivalent, so hex and the like can be typed with a parser alone. */
export const getBigIntParser = (
    column: AgColumn | null | undefined,
    gos: GridOptionsService
): FilterOperandParser<bigint> =>
    _bindFilterCallback(bigIntParams(column)?.bigintParser, gos, column) ?? _parseBigIntOrNull;

export const getBigIntFormatter = (column: AgColumn | null | undefined, gos: GridOptionsService) =>
    _bindFilterCallback(bigIntParams(column)?.bigintFormatter, gos, column);

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
export const getNumberParser = (
    column: AgColumn | null | undefined,
    gos: GridOptionsService
): FilterOperandParser<number> =>
    _bindFilterCallback(customNumberOperandParams(column)?.numberParser, gos, column) ?? parseNumberOrNull;

export const getNumberFormatter = (column: AgColumn | null | undefined, gos: GridOptionsService) =>
    _bindFilterCallback(customNumberOperandParams(column)?.numberFormatter, gos, column);

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
