import type { GridOptionsService } from '../../gridOptionsService';
import { _addGridCommonParams } from '../../gridOptionsUtils';
import type { Column } from '../../interfaces/iColumn';
import type { FilterInputCallbackParams } from '../../interfaces/iFilter';
import type { LogService } from '../../validation/logService';
import type { FilterLocaleTextKey } from '../filterLocaleText';
import { PRESET_DATE_FILTER_TYPES } from './date/relativeDateRanges';
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
    ...PRESET_DATE_FILTER_TYPES,
]);

/** An entry missing any of these cannot be offered; they are listed so the warning can name the missing one. */
const REQUIRED_OPTION_PROPERTIES: (keyof IFilterOptionDef)[] = ['displayKey', 'displayName', 'predicate'];

/**
 * One definition of what a `filterOptions` list offers, so the column filter and the Advanced Filter cannot disagree.
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export function _classifyFilterOptions(
    configuredOptions: (IFilterOptionDef | string)[],
    warnMissing: (keys: string[]) => void
): { offered: Map<string, IFilterOptionDef | string>; customOptions: Map<string, IFilterOptionDef> } {
    // A `Map` holds a key at the position it was first set in, so it dedupes without reordering the dropdown.
    const offered = new Map<string, IFilterOptionDef | string>();
    const customOptions = new Map<string, IFilterOptionDef>();
    for (let i = 0, len = configuredOptions.length; i < len; ++i) {
        const option = configuredOptions[i];
        if (option == null) {
            continue; // `typeof null` is `'object'`, so a hole would read as an option with no properties
        } else if (typeof option === 'string') {
            offered.set(option, offered.get(option) ?? option); // a definition already stored outranks a bare key
        } else {
            const missing = REQUIRED_OPTION_PROPERTIES.filter((name) => option[name] == null);
            if (missing.length) {
                warnMissing(missing);
                continue;
            }
            const key = option.displayKey;
            offered.set(key, option);
            customOptions.set(key, option);
        }
    }
    return { offered, customOptions };
}

/**
 * The name an option is shown and written under: localised text, then `displayName`, then its key.
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export function _getCustomOptionDisplayName(
    option: IFilterOptionDef,
    translate: (key: string, defaultValue: string) => string
): string {
    const displayKey = String(option.displayKey);
    return translate(displayKey, option.displayName).trim() || displayKey.trim();
}

/**
 * How many values an option takes; the declared `0 | 1 | 2` is no check on a JS caller, hence the clamp.
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export function _getCustomOptionNumberOfInputs(option: IFilterOptionDef): number {
    const count = Math.trunc(option.numberOfInputs ?? 1);
    return count > 0 ? Math.min(count, 2) : 0;
}

export function getNumberOfInputs(type: FilterOptionKey | null | undefined, optionsFactory: OptionsFactory): number {
    const customOpts = optionsFactory.getCustomOption(type);
    if (customOpts) {
        return _getCustomOptionNumberOfInputs(customOpts);
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
