import { _parseDateTimeFromString } from '../../../agStack/utils/date';
import type { Tuple } from '../iSimpleFilter';
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

export function setStartOfDay(date: Date) {
    date.setHours(0, 0, 0, 0);
    return date;
}
export function setEndOfDay(date: Date) {
    date.setHours(23, 59, 59, 999);
    return date;
}
export function setStartOfWeek(date: Date) {
    const day = date.getDay();
    const diff = day === 0 ? 6 : day - 1;
    date.setDate(date.getDate() - diff);

    return setStartOfDay(date);
}
export function setEndOfWeek(date: Date) {
    const day = date.getDay();
    const diff = day === 0 ? 6 : day - 1;
    date.setDate(date.getDate() + 6 - diff); // end of week

    return setEndOfDay(date);
}
export function setStartOfMonth(date: Date) {
    date.setDate(1);
    return setStartOfDay(date);
}
export function setEndOfMonth(date: Date) {
    date.setMonth(date.getMonth() + 1);
    date.setDate(0);
    return setEndOfDay(date);
}
export function setStartOfQuarter(date: Date) {
    const quarter = Math.floor(date.getMonth() / 3); // [0, 3]
    date.setMonth(quarter * 3);
    return setStartOfMonth(date);
}

export function setEndOfQuarter(date: Date) {
    const quarter = Math.floor(date.getMonth() / 3); // [0, 3]
    date.setMonth(quarter * 3 + 2); // { 2, 5, 8, 11 }
    return setEndOfMonth(date);
}

export function setStartOfYear(date: Date) {
    date.setMonth(0, 1);
    return setStartOfDay(date);
}
export function setEndOfYear(date: Date) {
    date.setMonth(12, 0);
    return setEndOfDay(date);
}

export function setPreviousNDay(date: Date, n = 1) {
    date.setHours(-1 - (n - 1) * 24);
    return date;
}
export function setPreviousDay(date: Date) {
    return setPreviousNDay(date);
}
export function setPreviousWeek(date: Date) {
    return setPreviousDay(setStartOfWeek(date));
}
export function setPreviousMonth(date: Date) {
    return setPreviousDay(setStartOfMonth(date));
}
export function setPreviousQuarter(date: Date) {
    return setPreviousMonth(setStartOfQuarter(date));
}
