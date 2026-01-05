import { _warn } from '../../validation/logging';
import {
    setEndOfDay,
    setEndOfMonth,
    setEndOfQuarter,
    setEndOfWeek,
    setEndOfYear,
    setPreviousDay,
    setPreviousMonth,
    setPreviousNDay,
    setPreviousQuarter,
    setPreviousWeek,
    setStartOfDay,
    setStartOfMonth,
    setStartOfQuarter,
    setStartOfWeek,
    setStartOfYear,
} from './date/dateFilterUtils';
import type {
    IFilterOptionDef,
    ISimpleFilterModelPresetType,
    ISimpleFilterModelType,
    JoinOperator,
    Tuple,
} from './iSimpleFilter';
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

export function validateAndUpdateConditions<M>(conditions: M[], maxNumConditions: number): number {
    let numConditions = conditions.length;
    if (numConditions > maxNumConditions) {
        conditions.splice(maxNumConditions);
        // 'Filter Model contains more conditions than "filterParams.maxNumConditions". Additional conditions have been ignored.'
        _warn(78);
        numConditions = maxNumConditions;
    }
    return numConditions;
}

/**
 * Spec:
 * Today                   today               [startOfToday, startOfTomorrow)
 * Yesterday               yesterday           [startOfYesterday, startOfToday)
 * Tomorrow                tomorrow            [startOfTomorrow, startOfDayAfterTomorrow)
 * This Week               thisWeek            [startOfCurrentWeek, startOfNextWeek)(locale-specific week start)
 * Last Week               lastWeek            [startOfPreviousWeek, startOfCurrentWeek)
 * Next Week               nextWeek            [startOfNextWeek, startOfWeekAfterNext)
 * This Month              thisMonth           [startOfCurrentMonth, startOfNextMonth)
 * Last Month              lastMonth           [startOfPreviousMonth, startOfCurrentMonth)
 * Next Month              nextMonth           [startOfNextMonth, startOfMonthAfterNext)
 * This Quarter            thisQuarter         [startOfCurrentQuarter, startOfNextQuarter)
 * Last Quarter            lastQuarter         [startOfPreviousQuarter, startOfCurrentQuarter)
 * Next Quarter            nextQuarter         [startOfNextQuarter, startOfQuarterAfterNext)
 * This Year               thisYear            [startOfCurrentYear, startOfNextYear)
 * Last Year               lastYear            [startOfPreviousYear, startOfCurrentYear)
 * Next Year               nextYear            [startOfNextYear, startOfYearAfterNext)
 * Year to Date (YTD)      yearToDate          [startOfCurrentYear, startOfTomorrow)
 * Last 7 days             last7Days           [startOfToday − 7 days, startOfTomorrow)
 * Last 30 days            last30Days          [startOfToday − 30 days, startOfTomorrow)
 * Last 90 days            last90Days          [startOfToday − 90 days, startOfTomorrow)
 * Last 6 months           last6Months         [startOfToday − 6 months, startOfTomorrow)
 * Last 12 months          last12Months        [startOfToday − 12 months, startOfTomorrow)
 * Last 24 months          last24Months        [startOfToday − 24 months, startOfTomorrow)
 */
export const presetDateFilterTypeRelativeFromToMap: Record<
    ISimpleFilterModelPresetType,
    (providedFrom: Date, providedTo: Date) => { from: Date; to: Date }
> = {
    today: (from, to) => {
        return { from: setStartOfDay(from), to: setEndOfDay(to) };
    },
    yesterday: (from, to) => {
        setPreviousDay(from);
        setPreviousDay(to);
        return presetDateFilterTypeRelativeFromToMap.today(from, to);
    },
    tomorrow: (from, to) => {
        from.setDate(from.getDate() + 1);
        to.setDate(to.getDate() + 1);
        return presetDateFilterTypeRelativeFromToMap.today(from, to);
    },
    thisWeek: (from, to) => {
        return { from: setStartOfWeek(from), to: setEndOfWeek(to) };
    },
    lastWeek: (from, to) => {
        setPreviousWeek(from);
        setPreviousWeek(to);
        return presetDateFilterTypeRelativeFromToMap.thisWeek(from, to);
    },
    nextWeek: (from, to) => {
        from.setDate(from.getDate() + 7);
        to.setDate(to.getDate() + 7);
        return presetDateFilterTypeRelativeFromToMap.thisWeek(from, to);
    },
    thisMonth: (from, to) => {
        return { from: setStartOfMonth(from), to: setEndOfMonth(to) };
    },
    lastMonth: (from, to) => {
        setPreviousMonth(from);
        setPreviousMonth(to);
        return presetDateFilterTypeRelativeFromToMap.thisMonth(from, to);
    },
    nextMonth: (from, to) => {
        from.setMonth(from.getMonth() + 1);
        to.setMonth(to.getMonth() + 1);
        return presetDateFilterTypeRelativeFromToMap.thisMonth(from, to);
    },
    thisQuarter: (from, to) => {
        return { from: setStartOfQuarter(from), to: setEndOfQuarter(to) };
    },
    lastQuarter: (from, to) => {
        setPreviousQuarter(from);
        setPreviousQuarter(to);
        return presetDateFilterTypeRelativeFromToMap.thisQuarter(from, to);
    },
    nextQuarter: (from, to) => {
        from.setMonth(from.getMonth() + 3);
        to.setMonth(to.getMonth() + 3);
        return presetDateFilterTypeRelativeFromToMap.thisQuarter(from, to);
    },
    thisYear: (from, to) => {
        return { from: setStartOfYear(from), to: setEndOfYear(to) };
    },
    lastYear: (from, to) => {
        from.setFullYear(from.getFullYear() - 1);
        to.setFullYear(to.getFullYear() - 1);
        return presetDateFilterTypeRelativeFromToMap.thisYear(from, to);
    },
    nextYear: (from, to) => {
        from.setFullYear(from.getFullYear() + 1);
        to.setFullYear(to.getFullYear() + 1);
        return presetDateFilterTypeRelativeFromToMap.thisYear(from, to);
    },
    yearToDate: (from, to) => {
        return { from: setStartOfYear(from), to: setEndOfDay(to) };
    },
    last7Days: (from, to) => {
        return { from: setPreviousNDay(from, 7), to: setEndOfDay(to) };
    },
    last30Days: (from, to) => {
        return { from: setPreviousNDay(from, 30), to: setEndOfDay(to) };
    },
    last90Days: (from, to) => {
        return { from: setPreviousNDay(from, 90), to: setEndOfDay(to) };
    },
    last6Months: (from, to) => {
        from.setFullYear(from.getFullYear() - 1);
        from.setMonth(from.getMonth() + 6);
        return { from, to: setEndOfDay(to) };
    },
    last12Months: (from, to) => {
        from.setFullYear(from.getFullYear() - 1);
        return { from, to };
    },
    last24Months: (from, to) => {
        from.setFullYear(from.getFullYear() - 2);
        return { from, to };
    },
};
const zeroInputTypes: Set<ISimpleFilterModelType> = new Set([
    'empty',
    'notBlank',
    'blank',
    ...(Object.keys(presetDateFilterTypeRelativeFromToMap) as ISimpleFilterModelPresetType[]),
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
