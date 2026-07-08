import type { LogService } from '../../validation/logService';
import type { IFilterOptionDef, ISimpleFilterModelType, JoinOperator, Tuple } from './iSimpleFilter';
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

const zeroInputTypes: Set<ISimpleFilterModelType> = new Set([
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

export function getNumberOfInputs(
    type: ISimpleFilterModelType | null | undefined,
    optionsFactory: OptionsFactory
): number {
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
