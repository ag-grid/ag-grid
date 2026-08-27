import type { GridOptionsService } from '../../gridOptionsService';
import { _addGridCommonParams } from '../../gridOptionsUtils';
import type { Column } from '../../interfaces/iColumn';
import type { FilterInputCallbackParams } from '../../interfaces/iFilter';
import type { LogService } from '../../validation/logService';
import type { FilterLocaleTextKey } from '../filterLocaleText';
import type { IFilterOptionDef, Tuple } from './iSimpleFilter';

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

export function removeItems<T>(items: T[], startPosition: number, deleteCount?: number): T[] {
    return deleteCount == null ? items.splice(startPosition) : items.splice(startPosition, deleteCount);
}

export function isBlank<V>(cellValue: V) {
    return cellValue == null || (typeof cellValue === 'string' && cellValue.trim().length === 0);
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

export function validateAndUpdateConditions<M>(
    log: LogService,
    colId: string,
    conditions: M[],
    maxNumConditions: number
): number {
    let numConditions = conditions.length;
    if (numConditions > maxNumConditions) {
        conditions.splice(maxNumConditions);
        log.warn(78, { colId });
        numConditions = maxNumConditions;
    }
    return numConditions;
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
