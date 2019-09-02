import timeDay from "../day";
import year from "../year";
import {
    sunday as timeSunday,
    monday as timeMonday,
    tuesday as timeTuesday,
    wednesday as timeWednesday,
    thursday as timeThursday,
    friday as timeFriday,
    saturday as timeSaturday

} from "../week";
import utcDay from "../utcDay";
import utcYear from "../utcYear";
import utcSunday, { utcMonday, utcThursday } from "../utcWeek";

type DateMap = { [key in string]: number };

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

function localDate(d: DateMap): Date {
    // For JS Dates the [0, 100) interval is a time warp, a fast forward to the 20th century.
    // For example, -1 is -0001 BC, 0 is already 1900 AD.
    if (d.y >= 0 && d.y < 100) {
        const date = new Date(-1, d.m, d.d, d.H, d.M, d.S, d.L);
        date.setFullYear(d.y);
        return date;
    }
    return new Date(d.y, d.m, d.d, d.H, d.M, d.S, d.L);
}

function utcDate(d: DateMap): Date {
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

type StringFormat = (date: Date, fill: string) => string;
type NumberFormat = (date: Date) => number;
type FormatMap = { [key in string]: StringFormat | NumberFormat | undefined };

function newYear(y: number): DateMap {
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

const numberRe = /^\s*\d+/; // ignores next directive
const percentRe = /^%/;
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

const pads = {
    '-': '',
    '_': ' ',
    '0': '0'
};

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

    const shortWeekdayRe = formatRe(lShortWeekdays);
    const shortWeekdayLookup = formatLookup(lShortWeekdays);

    const monthRe = formatRe(lMonths);
    const monthLookup = formatLookup(lMonths);

    const shortMonthRe = formatRe(lShortMonths);
    const shortMonthLookup = formatLookup(lShortMonths);

    const formats: FormatMap = {
        'a': formatShortWeekday,
        'A': formatWeekday,
        'b': formatShortMonth,
        'B': formatMonth,
        'c': undefined,
        'd': formatDayOfMonth,
        'e': formatDayOfMonth,
        'f': formatMicroseconds,
        'H': formatHour24,
        'I': formatHour12,
        'j': formatDayOfYear,
        'L': formatMilliseconds,
        'm': formatMonthNumber,
        'M': formatMinutes,
        'p': formatPeriod,
        'Q': formatUnixTimestamp,
        's': formatUnixTimestampSeconds,
        'S': formatSeconds,
        'u': formatWeekdayNumberMonday,
        'U': formatWeekNumberSunday,
        'V': formatWeekNumberISO,
        'w': formatWeekdayNumberSunday,
        'W': formatWeekNumberMonday,
        'x': undefined,
        'X': undefined,
        'y': formatYear,
        'Y': formatFullYear,
        'Z': formatZone,
        '%': formatLiteralPercent
    };

    const utcFormats: FormatMap = {
        'a': formatUTCShortWeekday,
        'A': formatUTCWeekday,
        'b': formatUTCShortMonth,
        'B': formatUTCMonth,
        'c': undefined,
        'd': formatUTCDayOfMonth,
        'e': formatUTCDayOfMonth,
        'f': formatUTCMicroseconds,
        'H': formatUTCHour24,
        'I': formatUTCHour12,
        'j': formatUTCDayOfYear,
        'L': formatUTCMilliseconds,
        'm': formatUTCMonthNumber,
        'M': formatUTCMinutes,
        'p': formatUTCPeriod,
        'Q': formatUnixTimestamp,
        's': formatUnixTimestampSeconds,
        'S': formatUTCSeconds,
        'u': formatUTCWeekdayNumberMonday,
        'U': formatUTCWeekNumberSunday,
        'V': formatUTCWeekNumberISO,
        'w': formatUTCWeekdayNumberSunday,
        'W': formatUTCWeekNumberMonday,
        'x': undefined,
        'X': undefined,
        'y': formatUTCYear,
        'Y': formatUTCFullYear,
        'Z': formatUTCZone,
        '%': formatLiteralPercent
    };

    type Parse = (d: DateMap, string: string, i: number) => number;

    const parses: { [key in string]: Parse } = {
        'a': parseShortWeekday,
        'A': parseWeekday,
        'b': parseShortMonth,
        'B': parseMonth,
        'c': parseLocaleDateTime,
        'd': parseDayOfMonth,
        'e': parseDayOfMonth,
        'f': parseMicroseconds,
        'H': parseHour24,
        'I': parseHour24,
        'j': parseDayOfYear,
        'L': parseMilliseconds,
        'm': parseMonthNumber,
        'M': parseMinutes,
        'p': parsePeriod,
        'Q': parseUnixTimestamp,
        's': parseUnixTimestampSeconds,
        'S': parseSeconds,
        'u': parseWeekdayNumberMonday,
        'U': parseWeekNumberSunday,
        'V': parseWeekNumberISO,
        'w': parseWeekdayNumberSunday,
        'W': parseWeekNumberMonday,
        'x': parseLocaleDate,
        'X': parseLocaleTime,
        'y': parseYear,
        'Y': parseFullYear,
        'Z': parseZone,
        '%': parseLiteralPercent
    };

    function newParse(specifier: string, newDate: (d: DateMap) => Date): (str: string) => Date | undefined {
        return function(str: string) {
            const d = newYear(1900);
            const i = parseSpecifier(d, specifier, str += '', 0);

            if (i != str.length) {
                return undefined;
            }

            // If a UNIX timestamp is specified, return it.
            if ('Q' in d) {
                return new Date(d.Q);
            }

            // The am-pm flag is 0 for AM, and 1 for PM.
            if ('p' in d) {
                d.H = d.H % 12 + d.p * 12;
            }

            // Convert day-of-week and week-of-year to day-of-year.
            if ('V' in d) {
                if (d.V < 1 || d.V > 53) {
                    return undefined;
                }
                if (!('w' in d)) {
                    d.w = 1;
                }
                if ('Z' in d) {
                    let week = utcDate(newYear(d.y));
                    const day = week.getUTCDay();
                    week = day > 4 || day === 0 ? utcMonday.ceil(week) : utcMonday.floor(week);
                    week = utcDay.offset(week, (d.V - 1) * 7);
                    d.y = week.getUTCFullYear();
                    d.m = week.getUTCMonth();
                    d.d = week.getUTCDate() + (d.w + 6) % 7;
                } else {
                    let week = newDate(newYear(d.y));
                    const day = week.getDay();
                    week = day > 4 || day === 0 ? timeMonday.ceil(week) : timeMonday.floor(week);
                    week = timeDay.offset(week, (d.V - 1) * 7);
                    d.y = week.getFullYear();
                    d.m = week.getMonth();
                    d.d = week.getDate() + (d.w + 6) % 7;
                }
            } else if ('W' in d || 'U' in d) {
                if (!('w' in d)) {
                    d.w = 'u' in d
                        ? d.u % 7
                        : 'W' in d ? 1 : 0;
                }
                const day = 'Z' in d ? utcDate(newYear(d.y)).getUTCDay() : newDate(newYear(d.y)).getDay();
                d.m = 0;
                d.d = 'W' in d ? (d.w + 6) % 7 + d.W * 7 - (day + 5) % 7 : d.w + d.U * 7 - (day + 6) % 7;
            }

            // If a time zone is specified, all fields are interpreted as UTC and then
            // offset according to the specified time zone.
            if ('Z' in d) {
                d.H += d.Z / 100 | 0;
                d.M += d.Z % 100;
                return utcDate(d);
            }

            // Otherwise, all fields are in local time.
            return newDate(d);
        };
    }

    // function newFormat(specifier: string, formats) {
    //     return function (date: Date): string {
    //         var string = [],
    //             i = -1,
    //             j = 0,
    //             n = specifier.length,
    //             c,
    //             pad,
    //             format;
    //
    //         if (!(date instanceof Date)) date = new Date(+date);
    //
    //         while (++i < n) {
    //             if (specifier.charCodeAt(i) === 37) {
    //                 string.push(specifier.slice(j, i));
    //                 if ((pad = pads[c = specifier.charAt(++i)]) != null) c = specifier.charAt(++i);
    //                 else pad = c === "e" ? " " : "0";
    //                 if (format = formats[c]) c = format(date, pad);
    //                 string.push(c);
    //                 j = i + 1;
    //             }
    //         }
    //
    //         string.push(specifier.slice(j, i));
    //         return string.join('');
    //     };
    // }

    function parseSpecifier(d: DateMap, specifier: string, string: string, j: number) {
        let i = 0;
        const n = specifier.length;
        const m = string.length;


        while (i < n) {
            if (j >= m) return -1;
            const code = specifier.charCodeAt(i++);
            if (code === 37) {
                const char = specifier.charAt(i++);
                const parse = parses[char in pads ? specifier.charAt(i++) : char];
                if (!parse || ((j = parse(d, string, j)) < 0)) {
                    return -1;
                }
            } else if (code != string.charCodeAt(j++)) {
                return -1;
            }
        }

        return j;
    }

    // ----------------------------- formats ----------------------------------

    function formatMicroseconds(date: Date, fill: string): string {
        return formatMilliseconds(date, fill) + '000';
    }
    function formatMilliseconds(date: Date, fill: string): string {
        return pad(date.getMilliseconds(), fill, 3);
    }
    function formatSeconds(date: Date, fill: string): string {
        return pad(date.getSeconds(), fill, 2);
    }
    function formatMinutes(date: Date, fill: string): string {
        return pad(date.getMinutes(), fill, 2);
    }
    function formatHour12(date: Date, fill: string): string {
        return pad(date.getHours() % 12 || 12, fill, 2);
    }
    function formatHour24(date: Date, fill: string): string {
        return pad(date.getHours(), fill, 2);
    }
    function formatPeriod(date: Date): string {
        return lPeriods[date.getHours() >= 12 ? 1 : 0];
    }
    function formatShortWeekday(date: Date): string {
        return lShortWeekdays[date.getDay()];
    }
    function formatWeekday(date: Date): string {
        return lWeekdays[date.getDay()];
    }
    function formatWeekdayNumberMonday(date: Date): number {
        const dayOfWeek = date.getDay();
        return dayOfWeek === 0 ? 7 : dayOfWeek;
    }
    function formatWeekNumberSunday(date: Date, fill: string): string {
        return pad(timeSunday.count(year.floor(date), date), fill, 2);
    }
    function formatWeekNumberISO(date: Date, fill: string): string {
        const day = date.getDay();
        date = (day >= 4 || day === 0) ? timeThursday.floor(date) : timeThursday.ceil(date);
        const yearStart = year.floor(date);
        return pad(timeThursday.count(yearStart, date) + (yearStart.getDay() === 4 ? 1 : 0), fill, 2);
    }
    function formatWeekdayNumberSunday(date: Date): number {
        return date.getDay();
    }
    function formatWeekNumberMonday(date: Date, fill: string): string {
        return pad(timeMonday.count(year.floor(date), date), fill, 2);
    }
    function formatDayOfMonth(date: Date, fill: string): string {
        return pad(date.getDate(), fill, 2);
    }
    function formatDayOfYear(date: Date, fill: string): string {
        return pad(1 + timeDay.count(year.floor(date), date), fill, 3);
    }
    function formatShortMonth(date: Date): string {
        return lShortMonths[date.getMonth()];
    }
    function formatMonth(date: Date): string {
        return lMonths[date.getMonth()];
    }
    function formatMonthNumber(date: Date, fill: string): string {
        return pad(date.getMonth() + 1, fill, 2);
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

    // -------------------------- UTC formats -----------------------------------

    function formatUTCMicroseconds(date: Date, fill: string): string {
        return formatUTCMilliseconds(date, fill) + '000';
    }
    function formatUTCMilliseconds(date: Date, fill: string): string {
        return pad(date.getUTCMilliseconds(), fill, 3);
    }
    function formatUTCSeconds(date: Date, fill: string): string {
        return pad(date.getUTCSeconds(), fill, 2);
    }
    function formatUTCMinutes(date: Date, fill: string): string {
        return pad(date.getUTCMinutes(), fill, 2);
    }
    function formatUTCHour12(date: Date, fill: string): string {
        return pad(date.getUTCHours() % 12 || 12, fill, 2);
    }
    function formatUTCHour24(date: Date, fill: string): string {
        return pad(date.getUTCHours(), fill, 2);
    }
    function formatUTCPeriod(date: Date): string {
        return lPeriods[date.getUTCHours() >= 12 ? 1 : 0];
    }
    function formatUTCDayOfMonth(date: Date, fill: string): string {
        return pad(date.getUTCDate(), fill, 2);
    }
    function formatUTCDayOfYear(date: Date, fill: string): string {
        return pad(1 + utcDay.count(utcYear.floor(date), date), fill, 3);
    }
    function formatUTCMonthNumber(date: Date, fill: string): string {
        return pad(date.getUTCMonth() + 1, fill, 2);
    }
    function formatUTCShortMonth(date: Date): string {
        return lShortMonths[date.getUTCMonth()];
    }
    function formatUTCMonth(date: Date): string {
        return lMonths[date.getUTCMonth()];
    }
    function formatUTCShortWeekday(date: Date): string {
        return lShortWeekdays[date.getUTCDay()];
    }
    function formatUTCWeekday(date: Date): string {
        return lWeekdays[date.getUTCDay()];
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
    function formatLiteralPercent(date: Date): string {
        return '%';
    }
    function formatUnixTimestamp(date: Date): number {
        return date.getTime();
    }
    function formatUnixTimestampSeconds(date: Date): number {
        return Math.floor(date.getTime() / 1000);
    }

    // ------------------------------- parsers ------------------------------------

    function parseMicroseconds(d: DateMap, string: string, i: number): number {
        const n = numberRe.exec(string.slice(i, i + 6));
        return n ? (d.L = Math.floor(parseFloat(n[0]) / 1000), i + n[0].length) : -1;
    }
    function parseMilliseconds(d: DateMap, string: string, i: number): number {
        const n = numberRe.exec(string.slice(i, i + 3));
        return n ? (d.L = +n[0], i + n[0].length) : -1;
    }
    function parseSeconds(d: DateMap, string: string, i: number): number {
        const n = numberRe.exec(string.slice(i, i + 2));
        return n ? (d.S = +n[0], i + n[0].length) : -1;
    }
    function parseMinutes(d: DateMap, string: string, i: number): number {
        const n = numberRe.exec(string.slice(i, i + 2));
        return n ? (d.M = +n[0], i + n[0].length) : -1;
    }
    function parseHour24(d: DateMap, string: string, i: number): number {
        const n = numberRe.exec(string.slice(i, i + 2));
        return n ? (d.H = +n[0], i + n[0].length) : -1;
    }
    function parsePeriod(d: DateMap, string: string, i: number): number {
        const n = periodRe.exec(string.slice(i));
        return n ? (d.p = periodLookup[n[0].toLowerCase()], i + n[0].length) : -1;
    }
    function parseDayOfMonth(d: DateMap, string: string, i: number): number {
        const n = numberRe.exec(string.slice(i, i + 2));
        return n ? (d.d = +n[0], i + n[0].length) : -1;
    }
    function parseDayOfYear(d: DateMap, string: string, i: number): number {
        const n = numberRe.exec(string.slice(i, i + 3));
        return n ? (d.m = 0, d.d = +n[0], i + n[0].length) : -1;
    }
    function parseShortWeekday(d: DateMap, string: string, i: number): number {
        const n = shortWeekdayRe.exec(string.slice(i));
        return n ? (d.w = shortWeekdayLookup[n[0].toLowerCase()], i + n[0].length) : -1;
    }
    function parseWeekday(d: DateMap, string: string, i: number): number {
        const n = weekdayRe.exec(string.slice(i));
        return n ? (d.w = weekdayLookup[n[0].toLowerCase()], i + n[0].length) : -1;
    }
    function parseWeekdayNumberMonday(d: DateMap, string: string, i: number): number {
        const n = numberRe.exec(string.slice(i, i + 1));
        return n ? (d.u = +n[0], i + n[0].length) : -1;
    }
    function parseWeekNumberSunday(d: DateMap, string: string, i: number): number {
        const n = numberRe.exec(string.slice(i, i + 2));
        return n ? (d.U = +n[0], i + n[0].length) : -1;
    }
    function parseWeekNumberISO(d: DateMap, string: string, i: number): number {
        const n = numberRe.exec(string.slice(i, i + 2));
        return n ? (d.V = +n[0], i + n[0].length) : -1;
    }
    function parseWeekNumberMonday(d: DateMap, string: string, i: number): number {
        const n = numberRe.exec(string.slice(i, i + 2));
        return n ? (d.W = +n[0], i + n[0].length) : -1;
    }
    function parseWeekdayNumberSunday(d: DateMap, string: string, i: number): number {
        const n = numberRe.exec(string.slice(i, i + 1));
        return n ? (d.w = +n[0], i + n[0].length) : -1;
    }
    function parseShortMonth(d: DateMap, string: string, i: number): number {
        const n = shortMonthRe.exec(string.slice(i));
        return n ? (d.m = shortMonthLookup[n[0].toLowerCase()], i + n[0].length) : -1;
    }
    function parseMonth(d: DateMap, string: string, i: number): number {
        const n = monthRe.exec(string.slice(i));
        return n ? (d.m = monthLookup[n[0].toLowerCase()], i + n[0].length) : -1;
    }
    function parseMonthNumber(d: DateMap, string: string, i: number): number {
        const n = numberRe.exec(string.slice(i, i + 2));
        return n ? (d.m = parseFloat(n[0]) - 1, i + n[0].length) : -1;
    }
    function parseLocaleDateTime(d: DateMap, string: string, i: number): number {
        return parseSpecifier(d, lDateTime, string, i);
    }
    function parseLocaleDate(d: DateMap, string: string, i: number): number {
        return parseSpecifier(d, lDate, string, i);
    }
    function parseLocaleTime(d: DateMap, string: string, i: number): number {
        return parseSpecifier(d, lTime, string, i);
    }
    function parseUnixTimestamp(d: DateMap, string: string, i: number): number {
        const n = numberRe.exec(string.slice(i));
        return n ? (d.Q = +n[0], i + n[0].length) : -1;
    }
    function parseUnixTimestampSeconds(d: DateMap, string: string, i: number): number {
        const n = numberRe.exec(string.slice(i));
        return n ? (d.Q = (+n[0]) * 1000, i + n[0].length) : -1;
    }
    function parseYear(d: DateMap, string: string, i: number): number {
        const n = numberRe.exec(string.slice(i, i + 2));
        return n ? (d.y = +n[0] + (+n[0] > 68 ? 1900 : 2000), i + n[0].length) : -1;
    }
    function parseFullYear(d: DateMap, string: string, i: number): number {
        const n = numberRe.exec(string.slice(i, i + 4));
        return n ? (d.y = +n[0], i + n[0].length) : -1;
    }
    function parseZone(d: DateMap, string: string, i: number): number {
        const n = /^(Z)|([+-]\d\d)(?::?(\d\d))?/.exec(string.slice(i, i + 6));
        return n ? (d.Z = n[1] ? 0 : -(n[2] + (n[3] || "00")), i + n[0].length) : -1;
    }
    function parseLiteralPercent(d: DateMap, string: string, i: number): number {
        const n = percentRe.exec(string.slice(i, i + 1));
        return n ? i + n[0].length : -1;
    }

    // return {
    //     format: function (specifier) {
    //         var f = newFormat(specifier += "", formats);
    //         f.toString = function() { return specifier; };
    //         return f;
    //     },
    //     parse: function (specifier) {
    //         var p = newParse(specifier += "", localDate);
    //         p.toString = function() { return specifier; };
    //         return p;
    //     },
    //     utcFormat: function (specifier) {
    //         var f = newFormat(specifier += "", utcFormats);
    //         f.toString = function() { return specifier; };
    //         return f;
    //     },
    //     utcParse: function (specifier) {
    //         var p = newParse(specifier, utcDate);
    //         p.toString = function() { return specifier; };
    //         return p;
    //     }
    // };
}
