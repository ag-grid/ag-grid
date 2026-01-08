import { _parseDateTimeFromString } from '../../../agStack/utils/date';
import type { ISimpleFilterModelPresetType, Tuple } from '../iSimpleFilter';
import type { OptionsFactory } from '../optionsFactory';
import { getNumberOfInputs } from '../simpleFilterUtils';
import type { DateFilterModel } from './iDateFilter';

export function mapValuesFromDateFilterModel(
    filterModel: DateFilterModel | null,
    optionsFactory: OptionsFactory
): Tuple<Date> {
    // unlike the other filters, we do two things here:
    // 1) allow for different attribute names (same as done for other filters) (eg the 'from' and 'to'
    //    are in different locations in Date and Number filter models)
    // 2) convert the type (because Date filter uses Dates, however model is 'string')
    //
    // NOTE: The conversion of string to date also removes the timezone - i.e. when user picks
    //       a date from the UI, it will have timezone info in it. This is lost when creating
    //       the model. When we recreate the date again here, it's without a timezone.
    const { dateFrom, dateTo, type } = filterModel || {};
    return [
        (dateFrom && _parseDateTimeFromString(dateFrom, undefined, true)) || null,
        (dateTo && _parseDateTimeFromString(dateTo, undefined, true)) || null,
    ].slice(0, getNumberOfInputs(type, optionsFactory));
}

type RelativeRangeFn = (from: Date, to: Date) => { from: Date; to: Date };

// Reusable fns
const setStartOfDay = (date: Date) => {
    date.setHours(0, 0, 0, 0);
    return date;
};
const setEndOfDay = (date: Date) => {
    date.setHours(23, 59, 59, 999);
    return date;
};
const setStartOfWeek = (date: Date) => {
    const day = date.getDay();
    const diff = day === 0 ? 6 : day - 1;
    date.setDate(date.getDate() - diff);

    return setStartOfDay(date);
};
const setEndOfWeek = (date: Date) => {
    const day = date.getDay();
    const diff = day === 0 ? 6 : day - 1;
    date.setDate(date.getDate() + 6 - diff); // end of week

    return setEndOfDay(date);
};
const setStartOfMonth = (date: Date) => {
    date.setDate(1);
    return setStartOfDay(date);
};
const setEndOfMonth = (date: Date) => {
    date.setMonth(date.getMonth() + 1);
    date.setDate(0);
    return setEndOfDay(date);
};
const setStartOfQuarter = (date: Date) => {
    const quarter = Math.floor(date.getMonth() / 3); // [0, 3]
    date.setMonth(quarter * 3);
    return setStartOfMonth(date);
};

const setEndOfQuarter = (date: Date) => {
    const quarter = Math.floor(date.getMonth() / 3); // [0, 3]
    date.setMonth(quarter * 3 + 2);
    return setEndOfMonth(date);
};

const setStartOfYear = (date: Date) => {
    date.setMonth(0, 1);
    return setStartOfDay(date);
};
const setEndOfYear = (date: Date) => {
    date.setMonth(12, 0);
    return setEndOfDay(date);
};

const setPreviousNDay = (date: Date, n = 1) => {
    date.setHours(-1 - (n - 1) * 24);
    return date;
};
const setPreviousDay = (date: Date) => setPreviousNDay(date);
const setPreviousWeek = (date: Date) => setPreviousDay(setStartOfWeek(date));
const setPreviousMonth = (date: Date) => setPreviousDay(setStartOfMonth(date));
const setPreviousQuarter = (date: Date) => setPreviousDay(setStartOfQuarter(date));

// Range fns
const sameDayRange: RelativeRangeFn = (from, to) => ({ from: setStartOfDay(from), to: setEndOfDay(to) });
const yesterdayRange: RelativeRangeFn = (from, to) => sameDayRange(setPreviousDay(from), setPreviousDay(to));
const thisWeekRange: RelativeRangeFn = (from, to) => ({ from: setStartOfWeek(from), to: setEndOfWeek(to) });
const lastWeekRange: RelativeRangeFn = (from, to) => thisWeekRange(setPreviousWeek(from), setPreviousWeek(to));
const thisMonthRange: RelativeRangeFn = (from, to) => ({ from: setStartOfMonth(from), to: setEndOfMonth(to) });
const lastMonthRange: RelativeRangeFn = (from, to) => thisMonthRange(setPreviousMonth(from), setPreviousMonth(to));
const thisQuarterRange: RelativeRangeFn = (from, to) => ({ from: setStartOfQuarter(from), to: setEndOfQuarter(to) });
const lastQuarterRange: RelativeRangeFn = (from, to) =>
    thisQuarterRange(setPreviousQuarter(from), setPreviousQuarter(to));
const thisYearRange: RelativeRangeFn = (from, to) => ({ from: setStartOfYear(from), to: setEndOfYear(to) });
const yearToDateRange: RelativeRangeFn = (from, to) => ({ from: setStartOfYear(from), to: setEndOfDay(to) });
const last7DaysRange: RelativeRangeFn = (from, to) => ({ from: setPreviousNDay(from, 7), to: setEndOfDay(to) });
const last30DaysRange: RelativeRangeFn = (from, to) => ({ from: setPreviousNDay(from, 30), to: setEndOfDay(to) });
const last90DaysRange: RelativeRangeFn = (from, to) => ({ from: setPreviousNDay(from, 90), to: setEndOfDay(to) });

const last6MonthsRange: RelativeRangeFn = (from, to) => {
    from.setFullYear(from.getFullYear() - 1);
    from.setMonth(from.getMonth() + 6);
    return { from: setStartOfDay(from), to: setEndOfDay(to) };
};
const last12MonthsRange: RelativeRangeFn = (from, to) => {
    from.setFullYear(from.getFullYear() - 1);
    return { from: setStartOfDay(from), to: setEndOfDay(to) };
};
const last24MonthsRange: RelativeRangeFn = (from, to) => {
    from.setFullYear(from.getFullYear() - 2);
    return { from: setStartOfDay(from), to: setEndOfDay(to) };
};
const lastYearRange: RelativeRangeFn = (from, to) => {
    from.setFullYear(from.getFullYear() - 1);
    to.setFullYear(to.getFullYear() - 1);
    return thisYearRange(from, to);
};
const nextYearRange: RelativeRangeFn = (from, to) => {
    from.setFullYear(from.getFullYear() + 1);
    to.setFullYear(to.getFullYear() + 1);
    return thisYearRange(from, to);
};
const nextQuarterRange: RelativeRangeFn = (from, to) => {
    from.setMonth(from.getMonth() + 3);
    to.setMonth(to.getMonth() + 3);
    return thisQuarterRange(from, to);
};
const nextMonthRange: RelativeRangeFn = (from, to) => {
    from.setMonth(from.getMonth() + 1);
    to.setMonth(to.getMonth() + 1);
    return thisMonthRange(from, to);
};
const nextWeekRange: RelativeRangeFn = (from, to) => {
    from.setDate(from.getDate() + 7);
    to.setDate(to.getDate() + 7);
    return thisWeekRange(from, to);
};
const tomorrowRange: RelativeRangeFn = (from, to) => {
    from.setDate(from.getDate() + 1);
    to.setDate(to.getDate() + 1);
    return sameDayRange(from, to);
};

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
export const presetDateFilterTypeRelativeFromToMap: Record<ISimpleFilterModelPresetType, RelativeRangeFn> = {
    today: sameDayRange,
    yesterday: yesterdayRange,
    tomorrow: tomorrowRange,
    thisWeek: thisWeekRange,
    lastWeek: lastWeekRange,
    nextWeek: nextWeekRange,
    thisMonth: thisMonthRange,
    lastMonth: lastMonthRange,
    nextMonth: nextMonthRange,
    thisQuarter: thisQuarterRange,
    lastQuarter: lastQuarterRange,
    nextQuarter: nextQuarterRange,
    thisYear: thisYearRange,
    lastYear: lastYearRange,
    nextYear: nextYearRange,
    yearToDate: yearToDateRange,
    last7Days: last7DaysRange,
    last30Days: last30DaysRange,
    last90Days: last90DaysRange,
    last6Months: last6MonthsRange,
    last12Months: last12MonthsRange,
    last24Months: last24MonthsRange,
};
