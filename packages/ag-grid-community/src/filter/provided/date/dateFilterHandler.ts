import type { Comparator } from '../iScalarFilter';
import type { ISimpleFilterModelPresetType, Tuple } from '../iSimpleFilter';
import { ScalarFilterHandler } from '../scalarFilterHandler';
import { DEFAULT_DATE_FILTER_OPTIONS } from './dateFilterConstants';
import { DateFilterModelFormatter } from './dateFilterModelFormatter';
import { mapValuesFromDateFilterModel } from './dateFilterUtils';
import type { DateFilterModel, IDateFilterParams } from './iDateFilter';

function defaultDateComparator(filterDate: Date, cellValue: any): number {
    // The default comparator assumes that the cellValue is a date
    const cellAsDate = cellValue as Date;

    if (cellAsDate < filterDate) {
        return -1;
    }
    if (cellAsDate > filterDate) {
        return 1;
    }

    return 0;
}

type Range = { from: Date; to: Date };

interface RangeCacheItem extends Range {
    expires: number;
}

export class DateFilterHandler extends ScalarFilterHandler<DateFilterModel, Date, IDateFilterParams> {
    public readonly filterType = 'date' as const;
    protected readonly FilterModelFormatterClass = DateFilterModelFormatter;
    private readonly filterTypeToRangeCache = new Map<ISimpleFilterModelPresetType, RangeCacheItem>();

    constructor() {
        super(mapValuesFromDateFilterModel, DEFAULT_DATE_FILTER_OPTIONS);
    }

    getOrRefreshRangeCacheItem(key: ISimpleFilterModelPresetType, rangeFn: (s: Date, e: Date) => [Date, Date]): Range {
        const { filterTypeToRangeCache } = this;
        const now = Date.now();
        let cache = filterTypeToRangeCache.get(key);
        if (cache && cache.expires < now) {
            cache = undefined;
        }
        if (!cache) {
            const [from, to] = rangeFn(new Date(now), new Date(now));
            cache = { from, to, expires: setStartOfNextDay(new Date(now)).getTime() - now };
            filterTypeToRangeCache.set(key, cache);
        }
        return cache;
    }

    protected override comparator(): Comparator<Date> {
        return this.params.filterParams.comparator ?? defaultDateComparator;
    }

    protected override isValid(value: Date): boolean {
        const isValidDate = this.params.filterParams.isValidDate;
        return !isValidDate || isValidDate(value);
    }

    protected override evaluateNonNullValue(
        values: Tuple<Date>,
        cellValue: Date,
        filterModel: DateFilterModel
    ): boolean {
        const type = filterModel.type;
        const comparator = this.comparator();

        if (!this.isValid(cellValue)) {
            return type === 'notEqual' || type === 'notBlank';
        }
        const maybeTypeAsPreset = type as ISimpleFilterModelPresetType;
        const presetDateRangeFn = presetDateFilterTypeRelativeFromToMap[maybeTypeAsPreset] as
            | RelativeRangeFn
            | undefined;
        if (presetDateRangeFn) {
            // user selected a preset, calculate what they mean
            const { from, to } = this.getOrRefreshRangeCacheItem(maybeTypeAsPreset, presetDateRangeFn);
            return comparator(from, cellValue) >= 0 && comparator(to, cellValue) < 0;
        }

        return super.evaluateNonNullValue(values, cellValue, filterModel);
    }
}

type RelativeDateFn = (date: Date) => Date;
type RelativeRangeFn = (from: Date, to: Date) => [Date, Date];

const DEFAULT_FIRST_DAY_OF_WEEK = 1;
let cachedFirstDayOfWeek: number | null = null;

const getFirstDayOfWeek = (): number => {
    if (cachedFirstDayOfWeek != null) {
        return cachedFirstDayOfWeek;
    }

    let firstDay: number | undefined;
    const locale = typeof navigator === 'undefined' ? undefined : (navigator.languages?.[0] ?? navigator.language);

    if (locale && typeof Intl !== 'undefined' && typeof (Intl as any).Locale === 'function') {
        try {
            const weekInfo = new (Intl as any).Locale(locale).getWeekInfo?.();
            firstDay = weekInfo?.firstDay;
        } catch {
            firstDay = undefined;
        }
    }

    cachedFirstDayOfWeek = firstDay == null ? DEFAULT_FIRST_DAY_OF_WEEK : firstDay % 7;
    return cachedFirstDayOfWeek;
};

// Reusable fns
const setStartOfDay: RelativeDateFn = (date: Date) => {
    date.setHours(0, 0, 0, 0);
    return date;
};

const setStartOfWeek: RelativeDateFn = (date: Date) => {
    const day = date.getDay();
    const weekStart = getFirstDayOfWeek();
    const diff = (day - weekStart + 7) % 7;
    date.setDate(date.getDate() - diff);

    return setStartOfDay(date);
};
const setPreviousNDay = (date: Date, n = 1) => {
    date.setDate(date.getDate() - n);
    return date;
};
const setStartOfNextDay: RelativeDateFn = (date: Date) => {
    date.setDate(date.getDate() + 1);
    return setStartOfDay(date);
};
const setStartOfNextWeek: RelativeDateFn = (date: Date) => {
    setStartOfWeek(date);
    date.setDate(date.getDate() + 6); // end of week
    return setStartOfNextDay(date);
};
const setStartOfMonth: RelativeDateFn = (date: Date) => {
    date.setDate(1);
    return setStartOfDay(date);
};
const setStartOfNextMonth: RelativeDateFn = (date: Date) => {
    date.setDate(1);
    date.setMonth(date.getMonth() + 1);
    return setStartOfDay(date);
};
const setStartOfQuarter: RelativeDateFn = (date: Date) => {
    const quarter = Math.floor(date.getMonth() / 3); // [0, 3]
    date.setMonth(quarter * 3);
    return setStartOfMonth(date);
};

const setStartOfNextQuarter: RelativeDateFn = (date: Date) => {
    const quarter = Math.floor(date.getMonth() / 3); // [0, 3]
    date.setMonth(quarter * 3 + 2);
    return setStartOfNextMonth(date);
};

const setStartOfYear: RelativeDateFn = (date: Date) => {
    date.setMonth(0, 1);
    return setStartOfDay(date);
};
const setStartOfNextYear: RelativeDateFn = (date: Date) => {
    date.setMonth(12, 0);
    return setStartOfNextDay(date);
};
const setPreviousDay: RelativeDateFn = (date: Date) => setPreviousNDay(date);
const setPreviousWeek: RelativeDateFn = (date: Date) => setPreviousDay(setStartOfWeek(date));
const setPreviousMonth: RelativeDateFn = (date: Date) => setPreviousDay(setStartOfMonth(date));
const setPreviousQuarter: RelativeDateFn = (date: Date) => setPreviousDay(setStartOfQuarter(date));

// Range fns
const today: RelativeRangeFn = (from: Date, to: Date) => [setStartOfDay(from), setStartOfNextDay(to)];
const yesterday: RelativeRangeFn = (from: Date, to: Date) => today(setPreviousDay(from), setPreviousDay(to));
const thisWeek: RelativeRangeFn = (from: Date, to: Date) => [setStartOfWeek(from), setStartOfNextWeek(to)];
const lastWeek: RelativeRangeFn = (from: Date, to: Date) => thisWeek(setPreviousWeek(from), setPreviousWeek(to));
const thisMonth: RelativeRangeFn = (from: Date, to: Date) => [setStartOfMonth(from), setStartOfNextMonth(to)];
const lastMonth: RelativeRangeFn = (from: Date, to: Date) => thisMonth(setPreviousMonth(from), setPreviousMonth(to));
const thisQuarter: RelativeRangeFn = (from: Date, to: Date) => [setStartOfQuarter(from), setStartOfNextQuarter(to)];
const lastQuarter: RelativeRangeFn = (from: Date, to: Date) =>
    thisQuarter(setPreviousQuarter(from), setPreviousQuarter(to));
const thisYear: RelativeRangeFn = (from: Date, to: Date) => [setStartOfYear(from), setStartOfNextYear(to)];
const yearToDate: RelativeRangeFn = (from: Date, to: Date) => [setStartOfYear(from), setStartOfNextDay(to)];
const last7Days: RelativeRangeFn = (from: Date, to: Date) => [
    setStartOfDay(setPreviousNDay(from, 7)),
    setStartOfNextDay(to),
];
const last30Days: RelativeRangeFn = (from: Date, to: Date) => [
    setStartOfDay(setPreviousNDay(from, 30)),
    setStartOfNextDay(to),
];
const last90Days: RelativeRangeFn = (from: Date, to: Date) => [
    setStartOfDay(setPreviousNDay(from, 90)),
    setStartOfNextDay(to),
];

const last6Months: RelativeRangeFn = (from: Date, to: Date) => {
    from.setFullYear(from.getFullYear() - 1);
    from.setMonth(from.getMonth() + 6);
    return [setStartOfDay(from), setStartOfNextDay(to)];
};
const last12Months: RelativeRangeFn = (from: Date, to: Date) => {
    from.setFullYear(from.getFullYear() - 1);
    return [setStartOfDay(from), setStartOfNextDay(to)];
};
const last24Months: RelativeRangeFn = (from: Date, to: Date) => {
    from.setFullYear(from.getFullYear() - 2);
    return [setStartOfDay(from), setStartOfNextDay(to)];
};
const lastYear: RelativeRangeFn = (from: Date, to: Date) => {
    from.setFullYear(from.getFullYear() - 1);
    to.setFullYear(to.getFullYear() - 1);
    return thisYear(from, to);
};
const nextYear: RelativeRangeFn = (from: Date, to: Date) => {
    from.setFullYear(from.getFullYear() + 1);
    to.setFullYear(to.getFullYear() + 1);
    return thisYear(from, to);
};
const nextQuarter: RelativeRangeFn = (from: Date, to: Date) => {
    from.setMonth(from.getMonth() + 3);
    to.setMonth(to.getMonth() + 3);
    return thisQuarter(from, to);
};
const nextMonth: RelativeRangeFn = (from: Date, to: Date) => {
    from.setMonth(from.getMonth() + 1);
    to.setMonth(to.getMonth() + 1);
    return thisMonth(from, to);
};
const nextWeek: RelativeRangeFn = (from: Date, to: Date) => {
    from.setDate(from.getDate() + 7);
    to.setDate(to.getDate() + 7);
    return thisWeek(from, to);
};
const tomorrow: RelativeRangeFn = (from: Date, to: Date) => {
    from.setDate(from.getDate() + 1);
    to.setDate(to.getDate() + 1);
    return today(from, to);
};

/**
 * Spec:
 * Today                   today               [startOfToday, startOfTomorrow)
 * Yesterday               yesterday           [startOfYesterday, startOfToday)
 * Tomorrow                tomorrow            [startOfTomorrow, startOfDayAfterTomorrow)
 * This Week               thisWeek            [startOfCurrentWeek, startOfNextWeek)
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
 * @knipIgnore Used in tests
 */
export const presetDateFilterTypeRelativeFromToMap: Record<
    | ISimpleFilterModelPresetType
    | 'setStartOfDay'
    | 'setStartOfWeek'
    | 'setStartOfNextDay'
    | 'setStartOfNextWeek'
    | 'setStartOfMonth'
    | 'setStartOfNextMonth'
    | 'setStartOfQuarter'
    | 'setStartOfNextQuarter'
    | 'setStartOfYear'
    | 'setStartOfNextYear'
    | 'setPreviousDay'
    | 'setPreviousWeek'
    | 'setPreviousMonth'
    | 'setPreviousQuarter',
    RelativeRangeFn | RelativeDateFn
> = {
    today,
    yesterday,
    tomorrow,
    thisWeek,
    lastWeek,
    nextWeek,
    thisMonth,
    lastMonth,
    nextMonth,
    thisQuarter,
    lastQuarter,
    nextQuarter,
    thisYear,
    lastYear,
    nextYear,
    yearToDate,
    last7Days,
    last30Days,
    last90Days,
    last6Months,
    last12Months,
    last24Months,
    setStartOfDay,
    setStartOfWeek,
    setStartOfNextDay,
    setStartOfNextWeek,
    setStartOfMonth,
    setStartOfNextMonth,
    setStartOfQuarter,
    setStartOfNextQuarter,
    setStartOfYear,
    setStartOfNextYear,
    setPreviousDay,
    setPreviousWeek,
    setPreviousMonth,
    setPreviousQuarter,
};
