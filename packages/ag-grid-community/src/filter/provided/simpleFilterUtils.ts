import type { LogService } from '../../validation/logService';
import type { FilterLocaleTextKey } from '../filterLocaleText';
import type { FilterOptionKey, IFilterOptionDef, ISimpleFilterModelType, JoinOperator } from './iSimpleFilter';
import type { OptionsFactory } from './optionsFactory';

export function removeItems<T>(items: T[], startPosition: number, deleteCount?: number): T[] {
    return deleteCount == null ? items.splice(startPosition) : items.splice(startPosition, deleteCount);
}

/** The message an out-of-order pair earns, on the input the user last touched. */
export function getStrictRangeValidityMessageKey<T extends number | bigint>(
    fromValue: T | null,
    toValue: T | null,
    isFrom: boolean
): FilterLocaleTextKey | null {
    const isInvalid = fromValue != null && toValue != null && fromValue >= toValue;
    if (!isInvalid) {
        return null;
    }
    return `strict${isFrom ? 'Max' : 'Min'}ValueValidation`;
}

export function isBlank<V>(cellValue: V) {
    return cellValue == null || (typeof cellValue === 'string' && cellValue.trim().length === 0);
}

export function getDefaultJoinOperator(defaultJoinOperator?: JoinOperator): JoinOperator {
    return defaultJoinOperator === 'AND' || defaultJoinOperator === 'OR' ? defaultJoinOperator : 'AND';
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

/** The options taking no value: the two blank checks, the placeholder, and every relative date range. */
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

/** Reported by name when one is absent, so the warning says which; validity is the same set being present. */
const REQUIRED_OPTION_PROPERTIES: (keyof IFilterOptionDef)[] = ['displayKey', 'displayName', 'predicate'];

/**
 * What a `filterOptions` list offers: one entry per key in first-listed order, a `FilterOptionDef` replacing
 * the built-in of the same `displayKey`, and a malformed entry reported through `warnMissingKeys` and dropped.
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export function _classifyFilterOptions(
    configuredOptions: readonly (IFilterOptionDef | string)[],
    warnMissingKeys: (keys: string[]) => void
): {
    options: (IFilterOptionDef | string)[];
    positions: Map<string, number>;
    customOptions: Map<string, IFilterOptionDef>;
} {
    const options: (IFilterOptionDef | string)[] = [];
    const positions = new Map<string, number>();
    const customOptions = new Map<string, IFilterOptionDef>();
    for (let i = 0, len = configuredOptions.length; i < len; ++i) {
        const option = configuredOptions[i];
        let key: string;
        if (typeof option === 'string') {
            key = option;
        } else if (option == null) {
            continue; // `typeof null` is `'object'`, so a hole would read as an option with no properties
        } else {
            const missingKeys = REQUIRED_OPTION_PROPERTIES.filter((name) => option[name] == null);
            if (missingKeys.length) {
                warnMissingKeys(missingKeys);
                continue;
            }
            key = option.displayKey;
            customOptions.set(key, option);
        }
        const position = positions.get(key);
        if (position == null) {
            positions.set(key, options.length);
            options.push(option);
        } else if (typeof option !== 'string') {
            options[position] = option; // keeps the place the key was first listed in
        }
    }
    return { options, positions, customOptions };
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _getCustomOptionNumberOfInputs(option: IFilterOptionDef): number {
    // The declared `0 | 1 | 2` is no check on a JS caller, which can pass a numeric string or a fraction.
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
