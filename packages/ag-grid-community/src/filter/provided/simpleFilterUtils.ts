import type { LogService } from '../../validation/logService';
import type { FilterOptionKey, IFilterOptionDef, ISimpleFilterModelType, JoinOperator } from './iSimpleFilter';
import type { OptionsFactory } from './optionsFactory';

export function removeItems<T>(items: T[], startPosition: number, deleteCount?: number): T[] {
    return deleteCount == null ? items.splice(startPosition) : items.splice(startPosition, deleteCount);
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

/** What a filter offers by default, and every built-in key it can evaluate. */
export interface FilterOptionSet {
    defaults: ISimpleFilterModelType[];
    supported: ReadonlySet<string>;
}

/** `empty` is the placeholder every filter offers; `extra` is what one evaluates beyond its defaults. */
export function defineFilterOptions(defaults: ISimpleFilterModelType[], extra?: Iterable<string>): FilterOptionSet {
    return { defaults, supported: new Set<string>(['empty', ...defaults, ...(extra ?? [])]) };
}

/** The options taking no value: the two blank checks, the placeholder, and every relative date range. */
export const zeroInputTypes: ReadonlySet<string> = new Set<ISimpleFilterModelType>([
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

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _isValidFilterOptionDef(option: IFilterOptionDef): boolean {
    return option.displayKey != null && option.displayName != null && option.predicate != null;
}

/** Reported by name when one is absent, so the warning says which; `_isValidFilterOptionDef` tests the same set. */
const REQUIRED_OPTION_PROPERTIES: (keyof IFilterOptionDef)[] = ['displayKey', 'displayName', 'predicate'];

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _getMissingFilterOptionKeys(option: IFilterOptionDef): string[] {
    return REQUIRED_OPTION_PROPERTIES.filter((name) => option[name] == null);
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
