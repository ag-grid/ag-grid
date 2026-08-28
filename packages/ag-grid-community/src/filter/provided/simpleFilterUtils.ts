import type { GridOptionsService } from '../../gridOptionsService';
import { _addGridCommonParams } from '../../gridOptionsUtils';
import type { Column } from '../../interfaces/iColumn';
import type { FilterInputCallbackParams } from '../../interfaces/iFilter';
import type { LogService } from '../../validation/logService';
import type { FilterLocaleTextKey } from '../filterLocaleText';
import type { FilterOptionKey, IFilterOptionDef, ISimpleFilterModelType, JoinOperator, Tuple } from './iSimpleFilter';
import type { OptionsFactory } from './optionsFactory';

/** Built per call, not per binding: `context` is a grid option, so a captured one would go stale. */
export function filterCallbackParams(gos: GridOptionsService, column: Column): FilterInputCallbackParams {
    return _addGridCommonParams<FilterInputCallbackParams>(gos, { column, colDef: column.getColDef() });
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _bindFilterCallback<A, R>(
    callback: ((value: A, params: FilterInputCallbackParams) => R) | undefined,
    gos: GridOptionsService,
    column: Column | null | undefined
): ((value: A) => R) | undefined {
    // A column is needed to name the callback's subject, so without one the default reading stands.
    return callback && column ? (value) => callback(value, filterCallbackParams(gos, column)) : undefined;
}

/** `NaN` is below it too: every comparison against it is false, so left through it would cap nothing. */
export function isBelowConditionFloor(count: number): boolean {
    return count < 1 || Number.isNaN(count);
}

/**
 * Absent where nothing was configured, so a model set through the API keeps every condition it was given;
 * otherwise whole and at least one, as the display counts conditions.
 */
export function getConditionLimit(maxNumConditions: number | undefined): number | null {
    if (typeof maxNumConditions !== 'number') {
        return null;
    }
    return isBelowConditionFloor(maxNumConditions) ? 1 : Math.floor(maxNumConditions);
}

export function removeItems<T>(items: T[], startPosition: number, deleteCount?: number): T[] {
    return deleteCount == null ? items.splice(startPosition) : items.splice(startPosition, deleteCount);
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _isBlank<V>(cellValue: V): boolean {
    if (typeof cellValue === 'string') {
        // No code point in 33..159 is whitespace to `trim`, so one read settles the common case.
        const first = cellValue.codePointAt(0) ?? 0;
        return first > 32 && first < 160 ? false : !cellValue.trim();
    }
    return cellValue == null;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _hasValue<V>(cellValue: V): boolean {
    return !_isBlank(cellValue);
}

export function getDefaultJoinOperator(defaultJoinOperator?: JoinOperator): JoinOperator {
    return defaultJoinOperator === 'AND' || defaultJoinOperator === 'OR' ? defaultJoinOperator : 'AND';
}

export function evaluateCustomFilter<V>(
    customFilterOption: IFilterOptionDef | undefined,
    values: Tuple<V>,
    cellValue: V | null | undefined
): boolean | undefined {
    if (customFilterOption == null) {
        return;
    }

    const { predicate } = customFilterOption;
    // only execute the custom filter if a value exists or a value isn't required, i.e. input is hidden
    if (predicate != null && !values.some((v) => v == null)) {
        return predicate(values, cellValue);
    }

    // No custom filter invocation, indicate that to the caller.
}

export function validateAndUpdateConditions<M>(log: LogService, conditions: M[], maxNumConditions: number): number {
    let numConditions = conditions.length;
    if (numConditions > maxNumConditions) {
        conditions.splice(maxNumConditions);
        // 'Filter Model contains more conditions than "filterParams.maxNumConditions". Additional conditions have been ignored.'
        log.warn(78);
        numConditions = maxNumConditions;
    }
    return numConditions;
}

const zeroInputTypes: ReadonlySet<string> = new Set<ISimpleFilterModelType>([
    'empty',
    'notBlank',
    'blank',
    'today',
    'yesterday',
    'tomorrow',
    'thisWeek',
    'lastWeek',
    'nextWeek',
    'thisMonth',
    'lastMonth',
    'nextMonth',
    'thisQuarter',
    'lastQuarter',
    'nextQuarter',
    'thisYear',
    'lastYear',
    'nextYear',
    'yearToDate',
    'last7Days',
    'last30Days',
    'last90Days',
    'last6Months',
    'last12Months',
    'last24Months',
]);

export function getNumberOfInputs(type: FilterOptionKey | null | undefined, optionsFactory: OptionsFactory): number {
    const customOpts = optionsFactory.getCustomOption(type);
    if (customOpts) {
        const { numberOfInputs } = customOpts;
        return numberOfInputs != null ? numberOfInputs : 1;
    }

    if (type && zeroInputTypes.has(type)) {
        return 0;
    } else if (type === 'inRange') {
        return 2;
    }

    return 1;
}

/** `from` must be below `to`, or equal where the range is inclusive; the message goes on the end being edited. */
export function getValidityMessageKey<V extends number | bigint>(
    fromValue: V | null,
    toValue: V | null,
    isFrom: boolean,
    inclusive?: boolean
): FilterLocaleTextKey | null {
    // An inclusive range of one value is an exact match, so only a strict one has nothing left to match.
    if (fromValue == null || toValue == null || fromValue < toValue || (inclusive && fromValue === toValue)) {
        return null;
    }
    if (inclusive) {
        return isFrom ? 'maxValueValidation' : 'minValueValidation';
    }
    return isFrom ? 'strictMaxValueValidation' : 'strictMinValueValidation';
}
