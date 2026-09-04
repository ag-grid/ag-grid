import { _parseBigIntOrNull, _parseDateTimeFromString, _toStringOrNull } from 'ag-stack';

import { _bindFilterCallback, _isRangeOutOfOrder, _toFiniteNumber } from 'ag-grid-community';
import type {
    AgColumn,
    BaseCellDataType,
    ColumnAdvancedFilterModel,
    ColumnModel,
    DataTypeService,
    GridOptionsService,
    IBigIntFilterParams,
    IRowNode,
    NumberFilterParams,
    SetAdvancedFilterModel,
    SetFilterModelValue,
    ValueService,
} from 'ag-grid-community';

import type { AdvancedFilterExpressionService } from './advancedFilterExpressionService';
import type { ADVANCED_FILTER_LOCALE_TEXT } from './advancedFilterLocaleText';
import type { FilterExpressionEvaluatorParams, FilterExpressionOperator } from './filterExpressionOperators';
import { OPERAND_COUNT } from './filterExpressionOperators';
import type { AdvancedFilterSetService } from './set/advancedFilterSetService';

/** The operand slots the data type members share; a set model has none of them, so the union cannot express it. */
export interface ColumnFilterModelOperands {
    filter?: string | number;
    filterTo?: string | number;
}

/** The model names its two operands rather than listing them, so an operand index maps to a key. */
export const OPERAND_KEYS = ['filter', 'filterTo'] as const;

/** Judged on the display: what the column's formatter cannot write is not a value the model holds. */
function getFormattedOperands(
    advFilterExpSvc: AdvancedFilterExpressionService,
    model: ColumnAdvancedFilterModel,
    numOperands: number
): string[] | null {
    const operands: string[] = [];
    for (let i = 0; i < numOperands; ++i) {
        const operand = advFilterExpSvc.formatOperand(
            model,
            (model as ColumnFilterModelOperands)[OPERAND_KEYS[i]],
            true
        );
        if (!operand) {
            return null;
        }
        operands.push(operand);
    }
    return operands;
}

/**
 * Why a condition cannot be applied, or null when it can. Every place a Builder condition is judged asks
 * this, so a row the virtual list has mounted and one it has not cannot reach different verdicts.
 */
export function getConditionValidationMessage(
    advFilterExpSvc: AdvancedFilterExpressionService,
    gos: GridOptionsService,
    model: PartialColumnFilterModel,
    column: AgColumn | null | undefined,
    baseCellDataType: BaseCellDataType,
    operator: FilterExpressionOperator<any> | undefined
): string | null {
    if (!model.colId) {
        return advFilterExpSvc.translate('advancedFilterBuilderValidationSelectColumn');
    }
    if (!model.type) {
        return advFilterExpSvc.translate('advancedFilterBuilderValidationSelectOption');
    }
    const columnModel = model as ColumnAdvancedFilterModel;
    // A list has no operand slot to format, so it is judged on the values themselves: none chosen is nothing to apply.
    if (operator?.operands === 'list') {
        return (columnModel as SetAdvancedFilterModel).values?.length
            ? null
            : advFilterExpSvc.translate('advancedFilterBuilderValidationEnterValue');
    }
    const operands = getFormattedOperands(advFilterExpSvc, columnModel, OPERAND_COUNT[operator?.operands ?? 'none']);
    if (!operands) {
        return advFilterExpSvc.translate('advancedFilterBuilderValidationEnterValue');
    }
    if (operator?.operands !== 'range') {
        return null;
    }
    const readBound = (value: string | number | undefined) =>
        getModelOperandBound(column, gos, baseCellDataType, value);
    const { filter, filterTo } = model;
    return getRangeOrderMessage(advFilterExpSvc, model.colId, readBound(filter), readBound(filterTo), operands[0]);
}

type RangeBound = number | bigint | Date | null;

/**
 * The message for a range whose bounds are out of order, or null where they are in order. Shares the column
 * filter's rule, and names the column: an expression is read away from the inputs the pair of bounds came from.
 */
export function getRangeOrderMessage(
    advFilterExpSvc: AdvancedFilterExpressionService,
    colId: string,
    from: RangeBound,
    to: RangeBound,
    fromDisplayValue: string
): string | null {
    const { inRangeInclusive } = advFilterExpSvc.getExpressionEvaluatorParams(colId);
    if (!_isRangeOutOfOrder(from, to, inRangeInclusive)) {
        return null;
    }
    const isDate = from instanceof Date;
    let key: keyof typeof ADVANCED_FILTER_LOCALE_TEXT;
    if (inRangeInclusive) {
        key = isDate ? 'advancedFilterValidationMustBeOnOrAfter' : 'advancedFilterValidationMustBeGreaterThanOrEqualTo';
    } else {
        key = isDate ? 'advancedFilterValidationMustBeAfter' : 'advancedFilterValidationMustBeGreaterThan';
    }
    return advFilterExpSvc.translate(key, [advFilterExpSvc.getColumnDisplayValue(colId) ?? colId, fromDisplayValue]);
}

/**
 * A stored bound as its evaluator orders it. A number the model holds is canonical and text is in the column's
 * own syntax, but a date is always serialised, whatever format the column displays, so it needs no parser.
 */
function getModelOperandBound(
    column: AgColumn | null | undefined,
    gos: GridOptionsService,
    baseCellDataType: BaseCellDataType,
    value: string | number | undefined
): RangeBound {
    if (value == null) {
        return null;
    }
    if (baseCellDataType === 'bigint') {
        return getBigIntParser(column, gos)(_toStringOrNull(value));
    }
    if (baseCellDataType === 'number') {
        return typeof value === 'number' ? _toFiniteNumber(value) : getNumberParser(column, gos)(value);
    }
    return _parseDateTimeFromString(_toStringOrNull(value));
}

/** A condition the Builder is still assembling: each slot is absent until the user has chosen it. */
export interface PartialColumnFilterModel extends ColumnFilterModelOperands {
    colId?: string;
    /** The member the finished model belongs to: the column's data type, or `set` for a list option. */
    filterType?: BaseCellDataType | 'set';
    type?: string;
    values?: SetFilterModelValue;
}

export interface FilterExpressionParserParams {
    expression: string;
    gos: GridOptionsService;
    colModel: ColumnModel;
    dataTypeSvc?: DataTypeService;
    valueSvc: ValueService;
    advFilterExpSvc: AdvancedFilterExpressionService;
    advFilterSetSvc: AdvancedFilterSetService;
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
    /** Decided by the row data, not the expression, so it stops Apply without invalidating what is applied. */
    advisory?: boolean;
    /** The message names its own bound, so appending the offending text would read as a second unlabelled value. */
    selfContained?: boolean;
}

/**
 * A fault belonging to a whole operand region rather than to any value in it. Reported at the character
 * that named it where one did, and at the end of the expression otherwise: with no span of its own the
 * fault is that the expression stopped, not that something in it is wrong.
 */
export class RegionValidation {
    private message: string | null = null;
    private endPosition: number | undefined;

    constructor(
        private readonly params: FilterExpressionParserParams,
        private readonly startPosition: number
    ) {}

    /** Returns undefined, so the region keeps the rest of the text rather than being abandoned and restarted. */
    public reject(key: keyof typeof ADVANCED_FILTER_LOCALE_TEXT, position?: number): undefined {
        this.message ??= this.params.advFilterExpSvc.translate(key);
        if (position != null) {
            this.endPosition ??= position;
        }
        return undefined;
    }

    /** The rest of the text belongs to the error already reported, so there is nothing left to read. */
    public isRejected(): boolean {
        return this.endPosition != null;
    }

    /** Where the region stopped reading, for a caller that has to tell a caret before a fault from one after. */
    public getErrorPosition(): number | undefined {
        return this.endPosition;
    }

    public getError(): FilterExpressionValidationError | null {
        const message = this.message;
        if (!message) {
            return null;
        }
        const endPosition = this.endPosition;
        const atEnd = this.params.expression.length;
        return {
            message,
            startPosition: endPosition == null ? atEnd : this.startPosition,
            endPosition: endPosition ?? atEnd,
        };
    }
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
    empty?: boolean,
    openBracket?: string
): AutocompleteUpdate {
    let secondPartStartPosition = endPosition + (!expression.length || empty ? 0 : 1);
    let positionOffset = 0;
    if (appendSpace) {
        const hasSpace = expression[secondPartStartPosition] === ' ';
        if (hasSpace && !openBracket && !appendQuote) {
            // already a space and nothing to open after it, so just move the position
            positionOffset = 1;
        } else {
            updatedValuePart += ' ';
            // An option taking more than one value opens its bracket then the first quote, both past the
            // space, so one already there is rewritten.
            if (openBracket) {
                updatedValuePart += openBracket;
            }
            if (appendQuote) {
                updatedValuePart += `"`;
            }
            if (hasSpace) {
                secondPartStartPosition++;
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
