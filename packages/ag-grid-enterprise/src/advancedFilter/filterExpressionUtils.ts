import { _parseBigIntOrNull } from 'ag-stack';

import type {
    AgColumn,
    BaseCellDataType,
    ColumnModel,
    DataTypeService,
    IRowNode,
    ValueService,
} from 'ag-grid-community';
import { _translateForFilter } from 'ag-grid-community';

import type { AdvancedFilterExpressionService } from './advancedFilterExpressionService';
import type { FilterExpressionEvaluatorParams, FilterExpressionOperator } from './filterExpressionOperators';

/** The operand slots every `ColumnAdvancedFilterModel` member shares, which the union itself cannot express. */
export interface ColumnFilterModelOperands {
    filter?: string | number;
    filterTo?: string | number;
}

/** A condition the Builder is still assembling: each slot is absent until the user has chosen it. */
export interface PartialColumnFilterModel extends ColumnFilterModelOperands {
    colId?: string;
    type?: string;
}

export interface ExpressionRewrite {
    startPosition: number;
    endPosition: number;
    displayValue: string;
}

export interface FilterExpressionParserParams {
    expression: string;
    /** What a typed key is to be shown as, queued so a rewrite does not shift the positions still being parsed. */
    rewrites: ExpressionRewrite[];
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
    empty?: boolean,
    appendBracket?: boolean
): AutocompleteUpdate {
    const secondPartStartPosition = endPosition + (!expression.length || empty ? 0 : 1);
    let positionOffset = 0;
    if (appendSpace) {
        if (expression[secondPartStartPosition] === ' ') {
            // already a space, just move the position
            positionOffset = 1;
        } else {
            updatedValuePart += ' ';
            // An option taking two values opens their bracketed list, then the first value's quote.
            if (appendBracket) {
                updatedValuePart += '(';
            }
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
        params.rewrites.push({ startPosition: endPosition - userValue.length + 1, endPosition, displayValue });
    }
}

/** Applied last-first, so each lands where the parse recorded it; the queue is spent, not replayable. */
export function applyExpressionRewrites(params: FilterExpressionParserParams): string {
    const rewrites = params.rewrites;
    let expression = params.expression;
    rewrites.sort((a, b) => b.startPosition - a.startPosition);
    for (let i = 0, len = rewrites.length; i < len; ++i) {
        const { startPosition, endPosition, displayValue } = rewrites[i];
        expression = expression.slice(0, startPosition) + displayValue + expression.slice(endPosition + 1);
    }
    rewrites.length = 0;
    return expression;
}

/** The types a pair of values reads as a from/to; text has no ordering to assume. */
const ORDERED_RANGE_TYPES: ReadonlySet<BaseCellDataType> = new Set([
    'number',
    'bigint',
    'date',
    'dateString',
    'dateTime',
    'dateTimeString',
]);

/** Whether the slot holds something to filter on: an empty string is nothing to filter by. */
export function hasOperandValue(value: string | number | null | undefined): boolean {
    return value != null && value !== '';
}

/** Operands are in model form, so bigint is parsed rather than compared as text, where `"9"` sorts after `"10"`. */
export function getOperandRangeValidationMessage(
    advFilterExpSvc: AdvancedFilterExpressionService,
    baseCellDataType: BaseCellDataType,
    from: string | number | null | undefined,
    to: string | number | null | undefined
): string | null {
    if (!hasOperandValue(from) || !hasOperandValue(to) || !ORDERED_RANGE_TYPES.has(baseCellDataType)) {
        return null;
    }
    let outOfOrder: boolean;
    if (baseCellDataType === 'number') {
        outOfOrder = Number(from) >= Number(to);
    } else if (baseCellDataType === 'bigint') {
        const fromBigInt = _parseBigIntOrNull(from);
        const toBigInt = _parseBigIntOrNull(to);
        outOfOrder = fromBigInt != null && toBigInt != null && fromBigInt >= toBigInt;
    } else {
        outOfOrder = String(from) >= String(to);
    }
    if (!outOfOrder) {
        return null;
    }
    // Each column filter's own key for this, so one `localeText` override covers the filter and the expression.
    const isNumeric = baseCellDataType === 'number' || baseCellDataType === 'bigint';
    const localeKey = isNumeric ? 'strictMaxValueValidation' : 'maxDateValidation';
    return _translateForFilter(advFilterExpSvc, localeKey, [String(to)]);
}
