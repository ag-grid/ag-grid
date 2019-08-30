import day from "../day";
import year from "../year";
import sunday, { monday, thursday } from "../week";
import utcDay from "../utcDay";
import utcYear from "../utcYear";
import utcSunday, { utcMonday, utcThursday } from "../utcWeek";

interface LocalDate {
    y: number;
    m: number;
    d: number;
    H: number;
    M: number;
    S: number;
    L: number;
}

/**
 * Specification of time locale to use when creating a new TimeLocaleObject
 */
export interface TimeLocaleDefinition {
    /**
     * The date and time (%c) format specifier (e.g., "%a %b %e %X %Y").
     */
    dateTime: string;
    /**
     * The date (%x) format specifier (e.g., "%m/%d/%Y").
     */
    date: string;
    /**
     *  The time (%X) format specifier (e.g., "%H:%M:%S").
     */
    time: string;
    /**
     * The A.M. and P.M. equivalents (e.g., ["AM", "PM"]).
     */
    periods: [string, string];
    /**
     * The full names of the weekdays, starting with Sunday.
     */
    days: [string, string, string, string, string, string, string];
    /**
     * The abbreviated names of the weekdays, starting with Sunday.
     */
    shortDays: [string, string, string, string, string, string, string];
    /**
     * The full names of the months (starting with January).
     */
    months: [string, string, string, string, string, string, string, string, string, string, string, string];
    /**
     * The abbreviated names of the months (starting with January).
     */
    shortMonths: [string, string, string, string, string, string, string, string, string, string, string, string];
}

function localDate(d: LocalDate): Date {
    // For JS Dates the [0, 100) interval is a time warp, a fast forward to the 20th century.
    // For example, -1 is -0001 BC, 0 is already 1900 AD.
    if (d.y >= 0 && d.y < 100) {
        const date = new Date(-1, d.m, d.d, d.H, d.M, d.S, d.L);
        date.setFullYear(d.y);
        return date;
    }
    return new Date(d.y, d.m, d.d, d.H, d.M, d.S, d.L);
}

function utcDate(d: LocalDate) {
    if (d.y >= 0 && d.y < 100) {
        const date = new Date(Date.UTC(-1, d.m, d.d, d.H, d.M, d.S, d.L));
        date.setUTCFullYear(d.y);
        return date;
    }
    return new Date(Date.UTC(d.y, d.m, d.d, d.H, d.M, d.S, d.L));
}

/**
 * Creates a lookup map for array of names to go from a name to index.
 * @param names
 */
function formatLookup(names: string[]): typeof map {
    const map: { [key in string]: number } = {};
    for (let i = 0, n = names.length; i < n; i++) {
        map[names[i].toLowerCase()] = i;
    }
    return map;
}

function newYear(y: number): LocalDate {
    return {
        y,
        m: 0,
        d: 1,
        H: 0,
        M: 0,
        S: 0,
        L: 0
    };
}

const requoteRe = /[\\^$*+?|[\]().{}]/g;
/**
 * Prepends any character in the `requoteRe` set with a backslash.
 * @param s
 */
export const requote = (s: string) => s.replace(requoteRe, '\\$&'); // $& - matched substring
/**
 * Returns a RegExp that matches any string that starts with any of the given names (case insensitive).
 * @param names
 */
export const formatRe = (names: string[]) => new RegExp('^(?:' + names.map(requote).join('|') + ')', 'i');

export function pad(value: number, fill: string, width: number) {
    const sign = value < 0 ? '-' : '';
    const string = String(sign ? -value : value);
    const length = string.length;

    return sign + (length < width ? new Array(width - length + 1).join(fill) + string : string);
}

export default function formatLocale(locale: TimeLocaleDefinition) {
    const lDateTime = locale.dateTime;
    const lDate = locale.date;
    const lTime = locale.time;
    const lPeriods = locale.periods;
    const lWeekdays = locale.days;
    const lShortWeekdays = locale.shortDays;
    const lMonths = locale.months;
    const lShortMonths = locale.shortMonths;

    const periodRe = formatRe(lPeriods);
    const periodLookup = formatLookup(lPeriods);

    const weekdayRe = formatRe(lWeekdays);
    const weekdayLookup = formatLookup(lWeekdays);

    const shortWeekdaysRe = formatRe(lShortWeekdays);
    const shortWeekdaysLookup = formatLookup(lShortWeekdays);

    const monthRe = formatRe(lMonths);
    const monthLookup = formatLookup(lMonths);

    const shortMonthRe = formatRe(lShortMonths);
    const shortMonthLookup = formatLookup(lShortMonths);

    // const formats = {
    //     'a': formatShortWeekday,
    //     'A': formatWeekday,
    //     'b': formatShortMonth,
    //     'B': formatMonth,
    //     'c': null,
    //     'd': formatDayOfMonth,
    //     'e': formatDayOfMonth,
    //     'f': formatMicroseconds,
    //     'H': formatHour24,
    //     'I': formatHour12,
    //     'j': formatDayOfYear,
    //     'L': formatMilliseconds,
    //     'm': formatMonthNumber,
    //     'M': formatMinutes,
    //     'p': formatPeriod,
    //     'Q': formatUnixTimestamp,
    //     's': formatUnixTimestampSeconds,
    //     'S': formatSeconds,
    //     'u': formatWeekdayNumberMonday,
    //     'U': formatWeekNumberSunday,
    //     'V': formatWeekNumberISO,
    //     'w': formatWeekdayNumberSunday,
    //     'W': formatWeekNumberMonday,
    //     'x': null,
    //     'X': null,
    //     'y': formatYear,
    //     'Y': formatFullYear,
    //     'Z': formatZone,
    //     '%': formatLiteralPercent
    // };

    function formatShortWeekday(date: Date): string {
        return lShortWeekdays[date.getDay()];
    }
    function formatWeekday(date: Date): string {
        return lWeekdays[date.getDay()];
    }
    function formatShortMonth(date: Date): string {
        return lShortMonths[date.getMonth()];
    }
    function formatMonth(date: Date): string {
        return lMonths[date.getMonth()];
    }
    function formatDayOfMonth(date: Date, fill: string): string {
        return pad(date.getDate(), fill, 2);
    }
    function formatHour24(date: Date, fill: string): string {
        return pad(date.getHours(), fill, 2);
    }
    function formatHour12(date: Date, fill: string): string {
        return pad(date.getHours() % 12 || 12, fill, 2);
    }
    function formatDayOfYear(date: Date, fill: string): string {
        return pad(1 + day.count(year.floor(date), date), fill, 3);
    }
    function formatMilliseconds(date: Date, fill: string): string {
        return pad(date.getMilliseconds(), fill, 3);
    }
    function formatMicroseconds(date: Date, fill: string): string {
        return formatMilliseconds(date, fill) + '000';
    }
    function formatMonthNumber(date: Date, fill: string): string {
        return pad(date.getMonth() + 1, fill, 2);
    }
    function formatMinutes(date: Date, fill: string): string {
        return pad(date.getMinutes(), fill, 2);
    }
    function formatSeconds(date: Date, fill: string): string {
        return pad(date.getSeconds(), fill, 2);
    }
    function formatWeekdayNumberMonday(date: Date): number {
        const dayOfWeek = date.getDay();
        return dayOfWeek === 0 ? 7 : dayOfWeek;
    }
    function formatWeekNumberSunday(date: Date, fill: string): string {
        return pad(sunday.count(year.floor(date), date), fill, 2);
    }
    function formatWeekNumberISO(date: Date, fill: string): string {
        const day = date.getDay();
        date = (day >= 4 || day === 0) ? thursday.floor(date) : thursday.ceil(date);
        const yearStart = year.floor(date);
        return pad(thursday.count(yearStart, date) + (yearStart.getDay() === 4 ? 1 : 0), fill, 2);
    }
    function formatWeekdayNumberSunday(date: Date): number {
        return date.getDay();
    }
    function formatWeekNumberMonday(date: Date, fill: string): string {
        return pad(monday.count(year.floor(date), date), fill, 2);
    }
    function formatYear(date: Date, fill: string): string {
        return pad(date.getFullYear() % 100, fill, 2);
    }
    function formatFullYear(date: Date, fill: string): string {
        return pad(date.getFullYear() % 10000, fill, 4);
    }
    function formatZone(date: Date): string {
        let z = date.getTimezoneOffset();
        return (z > 0 ? '-' : (z *= -1, '+')) + pad(Math.floor(z / 60), '0', 2) + pad(z % 60, '0', 2);
    }
    function formatUTCDayOfMonth(date: Date, fill: string): string {
        return pad(date.getUTCDate(), fill, 2);
    }
    function formatUTCHour24(date: Date, fill: string): string {
        return pad(date.getUTCHours(), fill, 2);
    }
    function formatUTCHour12(date: Date, fill: string): string {
        return pad(date.getUTCHours() % 12 || 12, fill, 2);
    }
    function formatUTCDayOfYear(date: Date, fill: string): string {
        return pad(1 + utcDay.count(utcYear.floor(date), date), fill, 3);
    }
    function formatUTCMilliseconds(date: Date, fill: string): string {
        return pad(date.getUTCMilliseconds(), fill, 3);
    }
    function formatUTCMicroseconds(date: Date, fill: string): string {
        return formatUTCMilliseconds(date, fill) + '000';
    }
    function formatUTCMonthNumber(date: Date, fill: string): string {
        return pad(date.getUTCMonth() + 1, fill, 2);
    }
    function formatUTCMinutes(date: Date, fill: string): string {
        return pad(date.getUTCMinutes(), fill, 2);
    }
    function formatUTCSeconds(date: Date, fill: string): string {
        return pad(date.getUTCSeconds(), fill, 2);
    }
    function formatUTCWeekdayNumberMonday(date: Date): number {
        const dayOfWeek = date.getUTCDay();
        return dayOfWeek === 0 ? 7 : dayOfWeek;
    }
    function formatUTCWeekNumberSunday(date: Date, fill: string): string {
        return pad(utcSunday.count(utcYear.floor(date), date), fill, 2);
    }
    function formatUTCWeekNumberISO(date: Date, fill: string): string {
        const day = date.getUTCDay();
        date = (day >= 4 || day === 0) ? utcThursday.floor(date) : utcThursday.ceil(date);
        const yearStart = utcYear.floor(date);
        return pad(utcThursday.count(yearStart, date) + (yearStart.getUTCDay() === 4 ? 1 : 0), fill, 4);
    }
    function formatUTCWeekdayNumberSunday(date: Date): number {
        return date.getUTCDay();
    }
    function formatUTCWeekNumberMonday(date: Date, fill: string): string {
        return pad(utcMonday.count(utcYear.floor(date), date), fill, 2);
    }
    function formatUTCYear(date: Date, fill: string): string {
        return pad(date.getUTCFullYear() % 100, fill, 2);
    }
    function formatUTCFullYear(date: Date, fill: string): string {
        return pad(date.getUTCFullYear() % 10000, fill, 4);
    }
    function formatUTCZone(): string {
        return "+0000";
    }
    function foramtLiteralPercent(date: Date): string {
        return '%';
    }
    function formatUnixTimestamp(date: Date): number {
        return date.getTime();
    }
    function formatUnixTimestampSeconds(date: Date): number {
        return Math.floor(date.getTime() / 1000);
    }
}
