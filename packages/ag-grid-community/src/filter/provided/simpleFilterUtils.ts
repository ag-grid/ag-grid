import { _getOwn } from 'ag-stack';

import type { GridOptionsService } from '../../gridOptionsService';
import { _addGridCommonParams } from '../../gridOptionsUtils';
import type { AdvancedFilterOnlyOptionKey } from '../../interfaces/advancedFilterModel';
import type { Column } from '../../interfaces/iColumn';
import type { FilterCallbackSource, FilterInputCallbackParams } from '../../interfaces/iFilter';
import type { LogService } from '../../validation/logService';
import type { FilterLocaleTextKey } from '../filterLocaleText';
import { PRESET_DATE_FILTER_TYPES } from './date/relativeDateRanges';
import type {
    FilterOptionKey,
    FilterOptions,
    FilterOptionsConfig,
    IFilterOptionDef,
    ISimpleFilterModelType,
    JoinOperator,
    Tuple,
} from './iSimpleFilter';
import type { OptionsFactory } from './optionsFactory';

/**
 * Built per call, not per binding: `context` is a grid option, so a captured one would go stale.
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export function filterCallbackParams(
    gos: GridOptionsService,
    column: Column,
    source: FilterCallbackSource
): FilterInputCallbackParams {
    return _addGridCommonParams<FilterInputCallbackParams>(gos, { column, colDef: column.getColDef(), source });
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _bindFilterCallback<A, R>(
    callback: ((value: A, params: FilterInputCallbackParams) => R) | undefined,
    gos: GridOptionsService,
    column: Column | null | undefined,
    source: FilterCallbackSource
): ((value: A) => R) | undefined {
    // A column is needed to name the callback's subject, so without one the default reading stands.
    return callback && column ? (value) => callback(value, filterCallbackParams(gos, column, source)) : undefined;
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
    cellValue: V | null | undefined,
    gos: GridOptionsService,
    column: Column
): boolean | undefined {
    // only execute the custom filter if a value exists or a value isn't required, i.e. input is hidden
    const predicate = customFilterOption?.predicate;
    if (predicate != null && !values.some((v) => v == null)) {
        return predicate(values, cellValue, filterCallbackParams(gos, column, 'columnFilter'));
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
 * The options only the Advanced Filter can evaluate. A column filter never offers one, however its
 * `filterOptions` names it: the key is a statement to the other reader of that same list.
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export const _ADVANCED_FILTER_ONLY_OPTIONS: Record<AdvancedFilterOnlyOptionKey, true> = {
    isAnyOf: true,
    isNoneOf: true,
    true: true,
    false: true,
};

/**
 * A record over a list adjusts that list rather than the data type's options: the list states the whole of
 * what its level offers, so a nearer level naming options one at a time changes those and inherits the rest.
 */
export function _applyFilterOptionChanges(
    base: (IFilterOptionDef | string)[],
    changes: FilterOptions
): (IFilterOptionDef | string)[] {
    // Keyed, so a definition replaces a bare key in the place the list first gave that key.
    const combined = new Map<string, IFilterOptionDef | string>();
    for (let i = 0, len = base.length; i < len; ++i) {
        const option = base[i];
        if (option != null) {
            combined.set(typeof option === 'string' ? option : option.displayKey, option);
        }
    }
    applyOptionChanges(
        changes,
        combined,
        (key) => {
            if (!combined.has(key)) {
                combined.set(key, key);
            }
        },
        (option, key) => combined.set(key, option)
    );
    return [...combined.values()];
}

/** What each value in a record says, so the two readers of one cannot disagree about `true`, `false` or a definition. */
function applyOptionChanges(
    changes: FilterOptions,
    offered: Map<string, IFilterOptionDef | string>,
    offerBareKey: (key: string) => void,
    addDefinition: (option: IFilterOptionDef, key: string) => void
): void {
    for (const key of Object.keys(changes)) {
        const value = changes[key];
        if (value == null) {
            continue; // No opinion, which is what an inherited key overridden back to nothing leaves.
        } else if (value === false) {
            offered.delete(key);
        } else if (value === true) {
            offerBareKey(key);
        } else {
            addDefinition(value, key);
        }
    }
}

/**
 * One definition of what a `filterOptions` list offers, so the column filter and the Advanced Filter cannot disagree.
 * `excludedKeys` withholds the ones the caller has no operator for; a definition under such a key is its own
 * statement of what it means, so only a bare key is dropped.
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export function _classifyFilterOptions(
    configuredOptions: FilterOptionsConfig,
    warnMissing: (keys: string[]) => void,
    /** The list a record names its changes against; `null` where only a whole list is meaningful. */
    baseKeys: readonly (IFilterOptionDef | string)[] | null,
    /** Keys this reader cannot evaluate, so a bare one names an option meant for another reader. */
    excludedKeys: Record<string, true> | null
): { offered: Map<string, IFilterOptionDef | string>; customOptions: Map<string, IFilterOptionDef> } {
    // A `Map` holds a key at the position it was first set in, so it dedupes without reordering the dropdown.
    const offered = new Map<string, IFilterOptionDef | string>();
    const customOptions = new Map<string, IFilterOptionDef>();
    const addDefinition = (option: IFilterOptionDef, key: string): void => {
        const missing = REQUIRED_OPTION_PROPERTIES.filter((name) => option[name] == null);
        if (missing.length) {
            warnMissing(missing);
            return;
        }
        offered.set(key, option);
        customOptions.set(key, option);
    };
    // A bare key names a built-in, so one this reader has no operator for is not its option to offer. A
    // definition under the same name is the author's own, and is added whichever order the two arrive in.
    const offerBareKey = (key: string): void => {
        if (!excludedKeys || !_getOwn(excludedKeys, key)) {
            offered.set(key, offered.get(key) ?? key);
        }
    };
    if (!Array.isArray(configuredOptions)) {
        // The default list first, so it keeps its order and a key naming one of them changes it in place.
        for (let i = 0, len = baseKeys?.length ?? 0; i < len; ++i) {
            const option = baseKeys![i];
            if (typeof option === 'string') {
                offerBareKey(option);
            } else {
                addDefinition(option, option.displayKey);
            }
        }
        applyOptionChanges(configuredOptions, offered, offerBareKey, addDefinition);
        return { offered, customOptions };
    }
    for (let i = 0, len = configuredOptions.length; i < len; ++i) {
        const option = configuredOptions[i];
        if (option == null) {
            continue; // `typeof null` is `'object'`, so a hole would read as an option with no properties
        } else if (typeof option === 'string') {
            offerBareKey(option);
        } else {
            addDefinition(option, option.displayKey);
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

/**
 * `from` must be below `to`, or equal where the range is inclusive: an inclusive range of one value is an
 * exact match, so only a strict one has nothing left to match.
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export function _isRangeOutOfOrder<V extends number | bigint | Date>(
    fromValue: V | null,
    toValue: V | null,
    inclusive?: boolean
): boolean {
    if (fromValue == null || toValue == null) {
        return false;
    }
    return inclusive ? fromValue > toValue : fromValue >= toValue;
}

/**
 * The column filter's message for a range whose bounds are out of order: it goes on the end being edited
 * and names the other end, in the words of whichever kind of value it is.
 */
export function getValidityMessageKey<V extends number | bigint | Date>(
    fromValue: V | null,
    toValue: V | null,
    isFrom: boolean,
    inclusive?: boolean
): FilterLocaleTextKey | null {
    if (!_isRangeOutOfOrder(fromValue, toValue, inclusive)) {
        return null;
    }
    if (fromValue instanceof Date) {
        if (inclusive) {
            return isFrom ? 'maxDateInclusiveValidation' : 'minDateInclusiveValidation';
        }
        return isFrom ? 'maxDateValidation' : 'minDateValidation';
    }
    if (inclusive) {
        return isFrom ? 'maxValueValidation' : 'minValueValidation';
    }
    return isFrom ? 'strictMaxValueValidation' : 'strictMinValueValidation';
}
