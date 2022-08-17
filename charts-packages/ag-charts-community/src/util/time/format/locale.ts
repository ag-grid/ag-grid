import timeDay from '../day';
import year from '../year';
import { sunday as timeSunday, monday as timeMonday, thursday as timeThursday } from '../week';
import utcDay from '../utcDay';
import utcYear from '../utcYear';
import utcSunday, { utcMonday, utcThursday } from '../utcWeek';

type FormatKeys =
    | 'a'
    | 'A'
    | 'b'
    | 'B'
    | 'c'
    | 'd'
    | 'e'
    | 'f'
    | 'H'
    | 'I'
    | 'j'
    | 'L'
    | 'm'
    | 'M'
    | 'p'
    | 'Q'
    | 's'
    | 'S'
    | 'u'
    | 'U'
    | 'V'
    | 'w'
    | 'W'
    | 'x'
    | 'X'
    | 'y'
    | 'Y'
    | 'Z'
    | '%';
// The keys in the DateMap are actually FormatKeys, not all will be defined though, so to prevent
// many checks and to avoid creating a more complicated type we just use `key in string` here.
type ParsedDate = { [key in string]: number };
/**
 * Parses part of the `string` (for example, full year part) starting at `i` position
 * and, if successful, poluates the corresponding field in `d` with a number,
 * returning the next position after the parsed part. Returns `-1` if parsing failed.
 */
type Parse = (d: ParsedDate, string: string, i: number) => number;
type StringFormat = (date: Date, fill: string) => string;
type NumberFormat = (date: Date) => number;
type FormatMap = { [key in FormatKeys]?: StringFormat | NumberFormat };

/**
 * Specification of time locale to use when creating a new TimeLocaleObject.
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

/**
 * Interface describing a time-locale-based object which exposes time-formatting/parsing
 * methods for a specified locale definition.
 */
export interface TimeLocaleObject {
    /**
     * Returns a new formatter for the given string specifier. The specifier string may contain the following directives:
     * - %a - abbreviated weekday name.*
     * - %A - full weekday name.*
     * - %b - abbreviated month name.*
     * - %B - full month name.*
     * - %c - the locale’s date and time, such as %x, %X.*
     * - %d - zero-padded day of the month as a decimal number [01,31].
     * - %e - space-padded day of the month as a decimal number [ 1,31]; equivalent to %_d.
     * - %f - microseconds as a decimal number [000000, 999999].
     * - %H - hour (24-hour clock) as a decimal number [00,23].
     * - %I - hour (12-hour clock) as a decimal number [01,12].
     * - %j - day of the year as a decimal number [001,366].
     * - %m - month as a decimal number [01,12].
     * - %M - minute as a decimal number [00,59].
     * - %L - milliseconds as a decimal number [000, 999].
     * - %p - either AM or PM.*
     * - %Q - milliseconds since UNIX epoch.
     * - %s - seconds since UNIX epoch.
     * - %S - second as a decimal number [00,61].
     * - %u - Monday-based (ISO) weekday as a decimal number [1,7].
     * - %U - Sunday-based week of the year as a decimal number [00,53].
     * - %V - ISO 8601 week number of the year as a decimal number [01, 53].
     * - %w - Sunday-based weekday as a decimal number [0,6].
     * - %W - Monday-based week of the year as a decimal number [00,53].
     * - %x - the locale’s date, such as %-m/%-d/%Y.*
     * - %X - the locale’s time, such as %-I:%M:%S %p.*
     * - %y - year without century as a decimal number [00,99].
     * - %Y - year with century as a decimal number.
     * - %Z - time zone offset, such as -0700, -07:00, -07, or Z.
     * - %% - a literal percent sign (%).
     *
     * Directives marked with an asterisk (*) may be affected by the locale definition.
     *
     * For %U, all days in a new year preceding the first Sunday are considered to be in week 0.
     * For %W, all days in a new year preceding the first Monday are considered to be in week 0.
     * Week numbers are computed using interval.count. For example, 2015-52 and 2016-00 represent
     * Monday, December 28, 2015, while 2015-53 and 2016-01 represent Monday, January 4, 2016.
     * This differs from the ISO week date specification (%V), which uses a more complicated definition!
     *
     * For %V, per the strftime man page:
     *
     * In this system, weeks start on a Monday, and are numbered from 01, for the first week, up to 52 or 53, for the last week.
     * Week 1 is the first week where four or more days fall within the new year (or, synonymously,
     * week 01 is: the first week of the year that contains a Thursday; or, the week that has 4 January in it).
     *
     * The % sign indicating a directive may be immediately followed by a padding modifier:
     *
     * 1) 0 - zero-padding
     * 2) _ - space-padding
     * 3) - disable padding
     *
     * If no padding modifier is specified, the default is 0 for all directives except %e, which defaults to _.
     * (In some implementations of strftime and strptime, a directive may include an optional field width or precision;
     * this feature is not yet implemented.)
     *
     * The returned function formats a specified date, returning the corresponding string.
     *
     * @param specifier A specifier string for the date format.
     */
    format(specifier: string): (date: Date | number) => string;
    /**
     * Returns a new parser for the given string specifier.
     * The specifier string may contain the same directives as locale.format (TimeLocaleObject.format).
     * The %d and %e directives are considered equivalent for parsing.
     *
     * The returned function parses a specified string, returning the corresponding date or undefined
     * if the string could not be parsed according to this format’s specifier.
     * Parsing is strict: if the specified string does not exactly match the associated specifier, this method returns undefined.
     *
     * For example, if the associated specifier is %Y-%m-%dT%H:%M:%SZ, then the string "2011-07-01T19:15:28Z"
     * will be parsed as expected, but "2011-07-01T19:15:28", "2011-07-01 19:15:28" and "2011-07-01" will return undefined.
     * (Note that the literal Z here is different from the time zone offset directive %Z.)
     * If a more flexible parser is desired, try multiple formats sequentially until one returns non-undefined.
     *
     * @param specifier A specifier string for the date format.
     */
    parse(specifier: string): (dateString: string) => Date | undefined;
    /**
     * Equivalent to locale.format (TimeLocaleObject.format),
     * except all directives are interpreted as Coordinated Universal Time (UTC) rather than local time.
     *
     * @param specifier A specifier string for the date format.
     */
    utcFormat(specifier: string): (date: Date | number) => string;
    /**
     * Equivalent to locale.parse (TimeLocaleObject.parse),
     * except all directives are interpreted as Coordinated Universal Time (UTC) rather than local time.
     *
     * @param specifier A specifier string for the date format.
     */
    utcParse(specifier: string): (dateString: string) => Date | undefined;
}

function localDate(d: ParsedDate): Date {
    // For JS Dates the [0, 100) interval is a time warp, a fast forward to the 20th century.
    // For example, -1 is -0001 BC, 0 is already 1900 AD.
    if (d.y >= 0 && d.y < 100) {
        const date = new Date(-1, d.m, d.d, d.H, d.M, d.S, d.L);
        date.setFullYear(d.y);
        return date;
    }
    return new Date(d.y, d.m, d.d, d.H, d.M, d.S, d.L);
}

function utcDate(d: ParsedDate): Date {
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

function newYear(y: number): ParsedDate {
    return {
        y,
        m: 0,
        d: 1,
        H: 0,
        M: 0,
        S: 0,
        L: 0,
    };
}

const percentCharCode = 37;
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

// A map of padding modifiers to padding strings. Default is `0`.
const pads: { [key in string]: string } = {
    '-': '',
    _: ' ',
    '0': '0',
};

export function pad(value: number, fill: string, width: number): string {
    const sign = value < 0 ? '-' : '';
    const string = String(sign ? -value : value);
    const length = string.length;

    return sign + (length < width ? new Array(width - length + 1).join(fill) + string : string);
}

/**
 * Create a new time-locale-based object which exposes time-formatting
 * methods for the specified locale definition.
 *
 * @param timeLocale A time locale definition.
 */
export default function formatLocale(timeLocale: TimeLocaleDefinition): TimeLocaleObject {
    const lDateTime = timeLocale.dateTime;
    const lDate = timeLocale.date;
    const lTime = timeLocale.time;
    const lPeriods = timeLocale.periods;
    const lWeekdays = timeLocale.days;
    const lShortWeekdays = timeLocale.shortDays;
    const lMonths = timeLocale.months;
    const lShortMonths = timeLocale.shortMonths;

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
        a: formatShortWeekday,
        A: formatWeekday,
        b: formatShortMonth,
        B: formatMonth,
        c: undefined,
        d: formatDayOfMonth,
        e: formatDayOfMonth,
        f: formatMicroseconds,
        H: formatHour24,
        I: formatHour12,
        j: formatDayOfYear,
        L: formatMilliseconds,
        m: formatMonthNumber,
        M: formatMinutes,
        p: formatPeriod,
        Q: formatUnixTimestamp,
        s: formatUnixTimestampSeconds,
        S: formatSeconds,
        u: formatWeekdayNumberMonday,
        U: formatWeekNumberSunday,
        V: formatWeekNumberISO,
        w: formatWeekdayNumberSunday,
        W: formatWeekNumberMonday,
        x: undefined,
        X: undefined,
        y: formatYear,
        Y: formatFullYear,
        Z: formatZone,
        '%': formatLiteralPercent,
    };

    const utcFormats: FormatMap = {
        a: formatUTCShortWeekday,
        A: formatUTCWeekday,
        b: formatUTCShortMonth,
        B: formatUTCMonth,
        c: undefined,
        d: formatUTCDayOfMonth,
        e: formatUTCDayOfMonth,
        f: formatUTCMicroseconds,
        H: formatUTCHour24,
        I: formatUTCHour12,
        j: formatUTCDayOfYear,
        L: formatUTCMilliseconds,
        m: formatUTCMonthNumber,
        M: formatUTCMinutes,
        p: formatUTCPeriod,
        Q: formatUnixTimestamp,
        s: formatUnixTimestampSeconds,
        S: formatUTCSeconds,
        u: formatUTCWeekdayNumberMonday,
        U: formatUTCWeekNumberSunday,
        V: formatUTCWeekNumberISO,
        w: formatUTCWeekdayNumberSunday,
        W: formatUTCWeekNumberMonday,
        x: undefined,
        X: undefined,
        y: formatUTCYear,
        Y: formatUTCFullYear,
        Z: formatUTCZone,
        '%': formatLiteralPercent,
    };

    const parses: { [key in FormatKeys]: Parse } = {
        a: parseShortWeekday,
        A: parseWeekday,
        b: parseShortMonth,
        B: parseMonth,
        c: parseLocaleDateTime,
        d: parseDayOfMonth,
        e: parseDayOfMonth,
        f: parseMicroseconds,
        H: parseHour24,
        I: parseHour24,
        j: parseDayOfYear,
        L: parseMilliseconds,
        m: parseMonthNumber,
        M: parseMinutes,
        p: parsePeriod,
        Q: parseUnixTimestamp,
        s: parseUnixTimestampSeconds,
        S: parseSeconds,
        u: parseWeekdayNumberMonday,
        U: parseWeekNumberSunday,
        V: parseWeekNumberISO,
        w: parseWeekdayNumberSunday,
        W: parseWeekNumberMonday,
        x: parseLocaleDate,
        X: parseLocaleTime,
        y: parseYear,
        Y: parseFullYear,
        Z: parseZone,
        '%': parseLiteralPercent,
    };

    // Recursive definitions.
    formats.x = newFormat(lDate, formats);
    formats.X = newFormat(lTime, formats);
    formats.c = newFormat(lDateTime, formats);
    utcFormats.x = newFormat(lDate, utcFormats);
    utcFormats.X = newFormat(lTime, utcFormats);
    utcFormats.c = newFormat(lDateTime, utcFormats);

    function newParse(specifier: string, newDate: (d: ParsedDate) => Date): (str: string) => Date | undefined {
        return function (str: string) {
            const d = newYear(1900);
            str += '';
            const i = parseSpecifier(d, specifier, str, 0);

            if (i != str.length) {
                return undefined;
            }

            // If a UNIX timestamp is specified, return it.
            if ('Q' in d) {
                return new Date(d.Q);
            }

            // The am-pm flag is 0 for AM, and 1 for PM.
            if ('p' in d) {
                d.H = (d.H % 12) + d.p * 12;
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
                    d.d = week.getUTCDate() + ((d.w + 6) % 7);
                } else {
                    let week = newDate(newYear(d.y));
                    const day = week.getDay();
                    week = day > 4 || day === 0 ? timeMonday.ceil(week) : timeMonday.floor(week);
                    week = timeDay.offset(week, (d.V - 1) * 7);
                    d.y = week.getFullYear();
                    d.m = week.getMonth();
                    d.d = week.getDate() + ((d.w + 6) % 7);
                }
            } else if ('W' in d || 'U' in d) {
                if (!('w' in d)) {
                    d.w = 'u' in d ? d.u % 7 : 'W' in d ? 1 : 0;
                }
                const day = 'Z' in d ? utcDate(newYear(d.y)).getUTCDay() : newDate(newYear(d.y)).getDay();
                d.m = 0;
                d.d = 'W' in d ? ((d.w + 6) % 7) + d.W * 7 - ((day + 5) % 7) : d.w + d.U * 7 - ((day + 6) % 7);
            }

            // If a time zone is specified, all fields are interpreted as UTC and then
            // offset according to the specified time zone.
            if ('Z' in d) {
                d.H += (d.Z / 100) | 0;
                d.M += d.Z % 100;
                return utcDate(d);
            }

            // Otherwise, all fields are in local time.
            return newDate(d);
        };
    }

    /**
     * Creates a new function that formats the given Date or timestamp according to specifier.
     * @param specifier
     * @param formats
     */
    function newFormat(specifier: string, formats: FormatMap): (date: Date | number) => string {
        return (date) => {
            const string: (string | number)[] = [];
            const n = specifier.length;
            let i = -1;
            let j = 0;

            if (!(date instanceof Date)) {
                date = new Date(+date);
            }

            while (++i < n) {
                if (specifier.charCodeAt(i) === percentCharCode) {
                    string.push(specifier.slice(j, i)); // copy the chunks of specifier with no directives as is
                    let c: string | number = specifier.charAt(++i);
                    let pad = pads[c];
                    if (pad != undefined) {
                        // if format directive has a padding modifier in front of it
                        c = specifier.charAt(++i); // fetch the directive itself
                    } else {
                        pad = c === 'e' ? ' ' : '0'; // use the default padding modifier
                    }
                    const format = formats[c as FormatKeys];
                    if (format) {
                        // if the directive has a corresponding formatting function
                        c = format(date, pad); // replace the directive with the formatted date
                    }
                    string.push(c);
                    j = i + 1;
                }
            }
            string.push(specifier.slice(j, i));

            return string.join('');
        };
    }

    // Simultaneously walks over the specifier and the parsed string, populating the `d` map with parsed values.
    // The returned number is expected to equal the length of the parsed `string`, if parsing succeeded.
    function parseSpecifier(d: ParsedDate, specifier: string, string: string, j: number): number {
        // i - `specifier` string index
        // j - parsed `string` index
        let i = 0;
        const n = specifier.length;
        const m = string.length;

        while (i < n) {
            if (j >= m) {
                return -1;
            }
            const code = specifier.charCodeAt(i++);
            if (code === percentCharCode) {
                const char = specifier.charAt(i++);
                const parse = parses[(char in pads ? specifier.charAt(i++) : char) as FormatKeys];
                if (!parse || (j = parse(d, string, j)) < 0) {
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
        date = day >= 4 || day === 0 ? timeThursday.floor(date) : timeThursday.ceil(date);
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
        return (z > 0 ? '-' : ((z *= -1), '+')) + pad(Math.floor(z / 60), '0', 2) + pad(z % 60, '0', 2);
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
        date = day >= 4 || day === 0 ? utcThursday.floor(date) : utcThursday.ceil(date);
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
        return '+0000';
    }
    function formatLiteralPercent(): string {
        return '%';
    }
    function formatUnixTimestamp(date: Date): number {
        return date.getTime();
    }
    function formatUnixTimestampSeconds(date: Date): number {
        return Math.floor(date.getTime() / 1000);
    }

    // ------------------------------- parsers ------------------------------------

    function parseMicroseconds(d: ParsedDate, string: string, i: number): number {
        const n = numberRe.exec(string.slice(i, i + 6));
        return n ? ((d.L = Math.floor(parseFloat(n[0]) / 1000)), i + n[0].length) : -1;
    }
    function parseMilliseconds(d: ParsedDate, string: string, i: number): number {
        const n = numberRe.exec(string.slice(i, i + 3));
        return n ? ((d.L = +n[0]), i + n[0].length) : -1;
    }
    function parseSeconds(d: ParsedDate, string: string, i: number): number {
        const n = numberRe.exec(string.slice(i, i + 2));
        return n ? ((d.S = +n[0]), i + n[0].length) : -1;
    }
    function parseMinutes(d: ParsedDate, string: string, i: number): number {
        const n = numberRe.exec(string.slice(i, i + 2));
        return n ? ((d.M = +n[0]), i + n[0].length) : -1;
    }
    function parseHour24(d: ParsedDate, string: string, i: number): number {
        const n = numberRe.exec(string.slice(i, i + 2));
        return n ? ((d.H = +n[0]), i + n[0].length) : -1;
    }
    function parsePeriod(d: ParsedDate, string: string, i: number): number {
        const n = periodRe.exec(string.slice(i));
        return n ? ((d.p = periodLookup[n[0].toLowerCase()]), i + n[0].length) : -1;
    }
    function parseDayOfMonth(d: ParsedDate, string: string, i: number): number {
        const n = numberRe.exec(string.slice(i, i + 2));
        return n ? ((d.d = +n[0]), i + n[0].length) : -1;
    }
    function parseDayOfYear(d: ParsedDate, string: string, i: number): number {
        const n = numberRe.exec(string.slice(i, i + 3));
        return n ? ((d.m = 0), (d.d = +n[0]), i + n[0].length) : -1;
    }
    function parseShortWeekday(d: ParsedDate, string: string, i: number): number {
        const n = shortWeekdayRe.exec(string.slice(i));
        return n ? ((d.w = shortWeekdayLookup[n[0].toLowerCase()]), i + n[0].length) : -1;
    }
    function parseWeekday(d: ParsedDate, string: string, i: number): number {
        const n = weekdayRe.exec(string.slice(i));
        return n ? ((d.w = weekdayLookup[n[0].toLowerCase()]), i + n[0].length) : -1;
    }
    function parseWeekdayNumberMonday(d: ParsedDate, string: string, i: number): number {
        const n = numberRe.exec(string.slice(i, i + 1));
        return n ? ((d.u = +n[0]), i + n[0].length) : -1;
    }
    function parseWeekNumberSunday(d: ParsedDate, string: string, i: number): number {
        const n = numberRe.exec(string.slice(i, i + 2));
        return n ? ((d.U = +n[0]), i + n[0].length) : -1;
    }
    function parseWeekNumberISO(d: ParsedDate, string: string, i: number): number {
        const n = numberRe.exec(string.slice(i, i + 2));
        return n ? ((d.V = +n[0]), i + n[0].length) : -1;
    }
    function parseWeekNumberMonday(d: ParsedDate, string: string, i: number): number {
        const n = numberRe.exec(string.slice(i, i + 2));
        return n ? ((d.W = +n[0]), i + n[0].length) : -1;
    }
    function parseWeekdayNumberSunday(d: ParsedDate, string: string, i: number): number {
        const n = numberRe.exec(string.slice(i, i + 1));
        return n ? ((d.w = +n[0]), i + n[0].length) : -1;
    }
    function parseShortMonth(d: ParsedDate, string: string, i: number): number {
        const n = shortMonthRe.exec(string.slice(i));
        return n ? ((d.m = shortMonthLookup[n[0].toLowerCase()]), i + n[0].length) : -1;
    }
    function parseMonth(d: ParsedDate, string: string, i: number): number {
        const n = monthRe.exec(string.slice(i));
        return n ? ((d.m = monthLookup[n[0].toLowerCase()]), i + n[0].length) : -1;
    }
    function parseMonthNumber(d: ParsedDate, string: string, i: number): number {
        const n = numberRe.exec(string.slice(i, i + 2));
        return n ? ((d.m = parseFloat(n[0]) - 1), i + n[0].length) : -1;
    }
    function parseLocaleDateTime(d: ParsedDate, string: string, i: number): number {
        return parseSpecifier(d, lDateTime, string, i);
    }
    function parseLocaleDate(d: ParsedDate, string: string, i: number): number {
        return parseSpecifier(d, lDate, string, i);
    }
    function parseLocaleTime(d: ParsedDate, string: string, i: number): number {
        return parseSpecifier(d, lTime, string, i);
    }
    function parseUnixTimestamp(d: ParsedDate, string: string, i: number): number {
        const n = numberRe.exec(string.slice(i));
        return n ? ((d.Q = +n[0]), i + n[0].length) : -1;
    }
    function parseUnixTimestampSeconds(d: ParsedDate, string: string, i: number): number {
        const n = numberRe.exec(string.slice(i));
        return n ? ((d.Q = +n[0] * 1000), i + n[0].length) : -1;
    }
    function parseYear(d: ParsedDate, string: string, i: number): number {
        const n = numberRe.exec(string.slice(i, i + 2));
        return n ? ((d.y = +n[0] + (+n[0] > 68 ? 1900 : 2000)), i + n[0].length) : -1;
    }
    function parseFullYear(d: ParsedDate, string: string, i: number): number {
        const n = numberRe.exec(string.slice(i, i + 4));
        return n ? ((d.y = +n[0]), i + n[0].length) : -1;
    }
    function parseZone(d: ParsedDate, string: string, i: number): number {
        const n = /^(Z)|^([+-]\d\d)(?::?(\d\d))?/.exec(string.slice(i, i + 6));
        return n ? ((d.Z = n[1] ? 0 : -(n[2] + (n[3] || '00'))), i + n[0].length) : -1;
    }
    function parseLiteralPercent(_: any, string: string, i: number): number {
        const n = percentRe.exec(string.slice(i, i + 1));
        return n ? i + n[0].length : -1;
    }

    return {
        format: (specifier: string): ((date: number | Date) => string) => {
            const f = newFormat(specifier, formats);
            f.toString = () => specifier;
            return f;
        },
        parse: (specifier: string): ((dateString: string) => Date | undefined) => {
            const p = newParse(specifier, localDate);
            p.toString = () => specifier;
            return p;
        },
        utcFormat: (specifier: string): ((date: number | Date) => string) => {
            const f = newFormat(specifier, utcFormats);
            f.toString = () => specifier;
            return f;
        },
        utcParse: (specifier: string): ((dateString: string) => Date | undefined) => {
            const p = newParse(specifier, utcDate);
            p.toString = () => specifier;
            return p;
        },
    };
}
