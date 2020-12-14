"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var day_1 = require("../day");
var year_1 = require("../year");
var week_1 = require("../week");
var utcDay_1 = require("../utcDay");
var utcYear_1 = require("../utcYear");
var utcWeek_1 = require("../utcWeek");
function localDate(d) {
    // For JS Dates the [0, 100) interval is a time warp, a fast forward to the 20th century.
    // For example, -1 is -0001 BC, 0 is already 1900 AD.
    if (d.y >= 0 && d.y < 100) {
        var date = new Date(-1, d.m, d.d, d.H, d.M, d.S, d.L);
        date.setFullYear(d.y);
        return date;
    }
    return new Date(d.y, d.m, d.d, d.H, d.M, d.S, d.L);
}
function utcDate(d) {
    if (d.y >= 0 && d.y < 100) {
        var date = new Date(Date.UTC(-1, d.m, d.d, d.H, d.M, d.S, d.L));
        date.setUTCFullYear(d.y);
        return date;
    }
    return new Date(Date.UTC(d.y, d.m, d.d, d.H, d.M, d.S, d.L));
}
/**
 * Creates a lookup map for array of names to go from a name to index.
 * @param names
 */
function formatLookup(names) {
    var map = {};
    for (var i = 0, n = names.length; i < n; i++) {
        map[names[i].toLowerCase()] = i;
    }
    return map;
}
function newYear(y) {
    return {
        y: y,
        m: 0,
        d: 1,
        H: 0,
        M: 0,
        S: 0,
        L: 0
    };
}
var percentCharCode = 37;
var numberRe = /^\s*\d+/; // ignores next directive
var percentRe = /^%/;
var requoteRe = /[\\^$*+?|[\]().{}]/g;
/**
 * Prepends any character in the `requoteRe` set with a backslash.
 * @param s
 */
exports.requote = function (s) { return s.replace(requoteRe, '\\$&'); }; // $& - matched substring
/**
 * Returns a RegExp that matches any string that starts with any of the given names (case insensitive).
 * @param names
 */
exports.formatRe = function (names) { return new RegExp('^(?:' + names.map(exports.requote).join('|') + ')', 'i'); };
// A map of padding modifiers to padding strings. Default is `0`.
var pads = {
    '-': '',
    '_': ' ',
    '0': '0'
};
function pad(value, fill, width) {
    var sign = value < 0 ? '-' : '';
    var string = String(sign ? -value : value);
    var length = string.length;
    return sign + (length < width ? new Array(width - length + 1).join(fill) + string : string);
}
exports.pad = pad;
/**
 * Create a new time-locale-based object which exposes time-formatting
 * methods for the specified locale definition.
 *
 * @param timeLocale A time locale definition.
 */
function formatLocale(timeLocale) {
    var lDateTime = timeLocale.dateTime;
    var lDate = timeLocale.date;
    var lTime = timeLocale.time;
    var lPeriods = timeLocale.periods;
    var lWeekdays = timeLocale.days;
    var lShortWeekdays = timeLocale.shortDays;
    var lMonths = timeLocale.months;
    var lShortMonths = timeLocale.shortMonths;
    var periodRe = exports.formatRe(lPeriods);
    var periodLookup = formatLookup(lPeriods);
    var weekdayRe = exports.formatRe(lWeekdays);
    var weekdayLookup = formatLookup(lWeekdays);
    var shortWeekdayRe = exports.formatRe(lShortWeekdays);
    var shortWeekdayLookup = formatLookup(lShortWeekdays);
    var monthRe = exports.formatRe(lMonths);
    var monthLookup = formatLookup(lMonths);
    var shortMonthRe = exports.formatRe(lShortMonths);
    var shortMonthLookup = formatLookup(lShortMonths);
    var formats = {
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
    var utcFormats = {
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
    var parses = {
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
    // Recursive definitions.
    formats.x = newFormat(lDate, formats);
    formats.X = newFormat(lTime, formats);
    formats.c = newFormat(lDateTime, formats);
    utcFormats.x = newFormat(lDate, utcFormats);
    utcFormats.X = newFormat(lTime, utcFormats);
    utcFormats.c = newFormat(lDateTime, utcFormats);
    function newParse(specifier, newDate) {
        return function (str) {
            var d = newYear(1900);
            var i = parseSpecifier(d, specifier, str += '', 0);
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
                    var week = utcDate(newYear(d.y));
                    var day = week.getUTCDay();
                    week = day > 4 || day === 0 ? utcWeek_1.utcMonday.ceil(week) : utcWeek_1.utcMonday.floor(week);
                    week = utcDay_1.default.offset(week, (d.V - 1) * 7);
                    d.y = week.getUTCFullYear();
                    d.m = week.getUTCMonth();
                    d.d = week.getUTCDate() + (d.w + 6) % 7;
                }
                else {
                    var week = newDate(newYear(d.y));
                    var day = week.getDay();
                    week = day > 4 || day === 0 ? week_1.monday.ceil(week) : week_1.monday.floor(week);
                    week = day_1.default.offset(week, (d.V - 1) * 7);
                    d.y = week.getFullYear();
                    d.m = week.getMonth();
                    d.d = week.getDate() + (d.w + 6) % 7;
                }
            }
            else if ('W' in d || 'U' in d) {
                if (!('w' in d)) {
                    d.w = 'u' in d
                        ? d.u % 7
                        : 'W' in d ? 1 : 0;
                }
                var day = 'Z' in d ? utcDate(newYear(d.y)).getUTCDay() : newDate(newYear(d.y)).getDay();
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
    /**
     * Creates a new function that formats the given Date or timestamp according to specifier.
     * @param specifier
     * @param formats
     */
    function newFormat(specifier, formats) {
        return function (date) {
            var string = [];
            var n = specifier.length;
            var i = -1;
            var j = 0;
            if (!(date instanceof Date)) {
                date = new Date(+date);
            }
            while (++i < n) {
                if (specifier.charCodeAt(i) === percentCharCode) {
                    string.push(specifier.slice(j, i)); // copy the chunks of specifier with no directives as is
                    var c = specifier.charAt(++i);
                    var pad_1 = pads[c];
                    if (pad_1 != undefined) { // if format directive has a padding modifier in front of it
                        c = specifier.charAt(++i); // fetch the directive itself
                    }
                    else {
                        pad_1 = c === 'e' ? ' ' : '0'; // use the default padding modifier
                    }
                    var format = formats[c];
                    if (format) { // if the directive has a corresponding formatting function
                        c = format(date, pad_1); // replace the directive with the formatted date
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
    function parseSpecifier(d, specifier, string, j) {
        // i - `specifier` string index
        // j - parsed `string` index
        var i = 0;
        var n = specifier.length;
        var m = string.length;
        while (i < n) {
            if (j >= m) {
                return -1;
            }
            var code = specifier.charCodeAt(i++);
            if (code === percentCharCode) {
                var char = specifier.charAt(i++);
                var parse = parses[(char in pads ? specifier.charAt(i++) : char)];
                if (!parse || ((j = parse(d, string, j)) < 0)) {
                    return -1;
                }
            }
            else if (code != string.charCodeAt(j++)) {
                return -1;
            }
        }
        return j;
    }
    // ----------------------------- formats ----------------------------------
    function formatMicroseconds(date, fill) {
        return formatMilliseconds(date, fill) + '000';
    }
    function formatMilliseconds(date, fill) {
        return pad(date.getMilliseconds(), fill, 3);
    }
    function formatSeconds(date, fill) {
        return pad(date.getSeconds(), fill, 2);
    }
    function formatMinutes(date, fill) {
        return pad(date.getMinutes(), fill, 2);
    }
    function formatHour12(date, fill) {
        return pad(date.getHours() % 12 || 12, fill, 2);
    }
    function formatHour24(date, fill) {
        return pad(date.getHours(), fill, 2);
    }
    function formatPeriod(date) {
        return lPeriods[date.getHours() >= 12 ? 1 : 0];
    }
    function formatShortWeekday(date) {
        return lShortWeekdays[date.getDay()];
    }
    function formatWeekday(date) {
        return lWeekdays[date.getDay()];
    }
    function formatWeekdayNumberMonday(date) {
        var dayOfWeek = date.getDay();
        return dayOfWeek === 0 ? 7 : dayOfWeek;
    }
    function formatWeekNumberSunday(date, fill) {
        return pad(week_1.sunday.count(year_1.default.floor(date), date), fill, 2);
    }
    function formatWeekNumberISO(date, fill) {
        var day = date.getDay();
        date = (day >= 4 || day === 0) ? week_1.thursday.floor(date) : week_1.thursday.ceil(date);
        var yearStart = year_1.default.floor(date);
        return pad(week_1.thursday.count(yearStart, date) + (yearStart.getDay() === 4 ? 1 : 0), fill, 2);
    }
    function formatWeekdayNumberSunday(date) {
        return date.getDay();
    }
    function formatWeekNumberMonday(date, fill) {
        return pad(week_1.monday.count(year_1.default.floor(date), date), fill, 2);
    }
    function formatDayOfMonth(date, fill) {
        return pad(date.getDate(), fill, 2);
    }
    function formatDayOfYear(date, fill) {
        return pad(1 + day_1.default.count(year_1.default.floor(date), date), fill, 3);
    }
    function formatShortMonth(date) {
        return lShortMonths[date.getMonth()];
    }
    function formatMonth(date) {
        return lMonths[date.getMonth()];
    }
    function formatMonthNumber(date, fill) {
        return pad(date.getMonth() + 1, fill, 2);
    }
    function formatYear(date, fill) {
        return pad(date.getFullYear() % 100, fill, 2);
    }
    function formatFullYear(date, fill) {
        return pad(date.getFullYear() % 10000, fill, 4);
    }
    function formatZone(date) {
        var z = date.getTimezoneOffset();
        return (z > 0 ? '-' : (z *= -1, '+')) + pad(Math.floor(z / 60), '0', 2) + pad(z % 60, '0', 2);
    }
    // -------------------------- UTC formats -----------------------------------
    function formatUTCMicroseconds(date, fill) {
        return formatUTCMilliseconds(date, fill) + '000';
    }
    function formatUTCMilliseconds(date, fill) {
        return pad(date.getUTCMilliseconds(), fill, 3);
    }
    function formatUTCSeconds(date, fill) {
        return pad(date.getUTCSeconds(), fill, 2);
    }
    function formatUTCMinutes(date, fill) {
        return pad(date.getUTCMinutes(), fill, 2);
    }
    function formatUTCHour12(date, fill) {
        return pad(date.getUTCHours() % 12 || 12, fill, 2);
    }
    function formatUTCHour24(date, fill) {
        return pad(date.getUTCHours(), fill, 2);
    }
    function formatUTCPeriod(date) {
        return lPeriods[date.getUTCHours() >= 12 ? 1 : 0];
    }
    function formatUTCDayOfMonth(date, fill) {
        return pad(date.getUTCDate(), fill, 2);
    }
    function formatUTCDayOfYear(date, fill) {
        return pad(1 + utcDay_1.default.count(utcYear_1.default.floor(date), date), fill, 3);
    }
    function formatUTCMonthNumber(date, fill) {
        return pad(date.getUTCMonth() + 1, fill, 2);
    }
    function formatUTCShortMonth(date) {
        return lShortMonths[date.getUTCMonth()];
    }
    function formatUTCMonth(date) {
        return lMonths[date.getUTCMonth()];
    }
    function formatUTCShortWeekday(date) {
        return lShortWeekdays[date.getUTCDay()];
    }
    function formatUTCWeekday(date) {
        return lWeekdays[date.getUTCDay()];
    }
    function formatUTCWeekdayNumberMonday(date) {
        var dayOfWeek = date.getUTCDay();
        return dayOfWeek === 0 ? 7 : dayOfWeek;
    }
    function formatUTCWeekNumberSunday(date, fill) {
        return pad(utcWeek_1.default.count(utcYear_1.default.floor(date), date), fill, 2);
    }
    function formatUTCWeekNumberISO(date, fill) {
        var day = date.getUTCDay();
        date = (day >= 4 || day === 0) ? utcWeek_1.utcThursday.floor(date) : utcWeek_1.utcThursday.ceil(date);
        var yearStart = utcYear_1.default.floor(date);
        return pad(utcWeek_1.utcThursday.count(yearStart, date) + (yearStart.getUTCDay() === 4 ? 1 : 0), fill, 4);
    }
    function formatUTCWeekdayNumberSunday(date) {
        return date.getUTCDay();
    }
    function formatUTCWeekNumberMonday(date, fill) {
        return pad(utcWeek_1.utcMonday.count(utcYear_1.default.floor(date), date), fill, 2);
    }
    function formatUTCYear(date, fill) {
        return pad(date.getUTCFullYear() % 100, fill, 2);
    }
    function formatUTCFullYear(date, fill) {
        return pad(date.getUTCFullYear() % 10000, fill, 4);
    }
    function formatUTCZone() {
        return '+0000';
    }
    function formatLiteralPercent(date) {
        return '%';
    }
    function formatUnixTimestamp(date) {
        return date.getTime();
    }
    function formatUnixTimestampSeconds(date) {
        return Math.floor(date.getTime() / 1000);
    }
    // ------------------------------- parsers ------------------------------------
    function parseMicroseconds(d, string, i) {
        var n = numberRe.exec(string.slice(i, i + 6));
        return n ? (d.L = Math.floor(parseFloat(n[0]) / 1000), i + n[0].length) : -1;
    }
    function parseMilliseconds(d, string, i) {
        var n = numberRe.exec(string.slice(i, i + 3));
        return n ? (d.L = +n[0], i + n[0].length) : -1;
    }
    function parseSeconds(d, string, i) {
        var n = numberRe.exec(string.slice(i, i + 2));
        return n ? (d.S = +n[0], i + n[0].length) : -1;
    }
    function parseMinutes(d, string, i) {
        var n = numberRe.exec(string.slice(i, i + 2));
        return n ? (d.M = +n[0], i + n[0].length) : -1;
    }
    function parseHour24(d, string, i) {
        var n = numberRe.exec(string.slice(i, i + 2));
        return n ? (d.H = +n[0], i + n[0].length) : -1;
    }
    function parsePeriod(d, string, i) {
        var n = periodRe.exec(string.slice(i));
        return n ? (d.p = periodLookup[n[0].toLowerCase()], i + n[0].length) : -1;
    }
    function parseDayOfMonth(d, string, i) {
        var n = numberRe.exec(string.slice(i, i + 2));
        return n ? (d.d = +n[0], i + n[0].length) : -1;
    }
    function parseDayOfYear(d, string, i) {
        var n = numberRe.exec(string.slice(i, i + 3));
        return n ? (d.m = 0, d.d = +n[0], i + n[0].length) : -1;
    }
    function parseShortWeekday(d, string, i) {
        var n = shortWeekdayRe.exec(string.slice(i));
        return n ? (d.w = shortWeekdayLookup[n[0].toLowerCase()], i + n[0].length) : -1;
    }
    function parseWeekday(d, string, i) {
        var n = weekdayRe.exec(string.slice(i));
        return n ? (d.w = weekdayLookup[n[0].toLowerCase()], i + n[0].length) : -1;
    }
    function parseWeekdayNumberMonday(d, string, i) {
        var n = numberRe.exec(string.slice(i, i + 1));
        return n ? (d.u = +n[0], i + n[0].length) : -1;
    }
    function parseWeekNumberSunday(d, string, i) {
        var n = numberRe.exec(string.slice(i, i + 2));
        return n ? (d.U = +n[0], i + n[0].length) : -1;
    }
    function parseWeekNumberISO(d, string, i) {
        var n = numberRe.exec(string.slice(i, i + 2));
        return n ? (d.V = +n[0], i + n[0].length) : -1;
    }
    function parseWeekNumberMonday(d, string, i) {
        var n = numberRe.exec(string.slice(i, i + 2));
        return n ? (d.W = +n[0], i + n[0].length) : -1;
    }
    function parseWeekdayNumberSunday(d, string, i) {
        var n = numberRe.exec(string.slice(i, i + 1));
        return n ? (d.w = +n[0], i + n[0].length) : -1;
    }
    function parseShortMonth(d, string, i) {
        var n = shortMonthRe.exec(string.slice(i));
        return n ? (d.m = shortMonthLookup[n[0].toLowerCase()], i + n[0].length) : -1;
    }
    function parseMonth(d, string, i) {
        var n = monthRe.exec(string.slice(i));
        return n ? (d.m = monthLookup[n[0].toLowerCase()], i + n[0].length) : -1;
    }
    function parseMonthNumber(d, string, i) {
        var n = numberRe.exec(string.slice(i, i + 2));
        return n ? (d.m = parseFloat(n[0]) - 1, i + n[0].length) : -1;
    }
    function parseLocaleDateTime(d, string, i) {
        return parseSpecifier(d, lDateTime, string, i);
    }
    function parseLocaleDate(d, string, i) {
        return parseSpecifier(d, lDate, string, i);
    }
    function parseLocaleTime(d, string, i) {
        return parseSpecifier(d, lTime, string, i);
    }
    function parseUnixTimestamp(d, string, i) {
        var n = numberRe.exec(string.slice(i));
        return n ? (d.Q = +n[0], i + n[0].length) : -1;
    }
    function parseUnixTimestampSeconds(d, string, i) {
        var n = numberRe.exec(string.slice(i));
        return n ? (d.Q = (+n[0]) * 1000, i + n[0].length) : -1;
    }
    function parseYear(d, string, i) {
        var n = numberRe.exec(string.slice(i, i + 2));
        return n ? (d.y = +n[0] + (+n[0] > 68 ? 1900 : 2000), i + n[0].length) : -1;
    }
    function parseFullYear(d, string, i) {
        var n = numberRe.exec(string.slice(i, i + 4));
        return n ? (d.y = +n[0], i + n[0].length) : -1;
    }
    function parseZone(d, string, i) {
        var n = /^(Z)|([+-]\d\d)(?::?(\d\d))?/.exec(string.slice(i, i + 6));
        return n ? (d.Z = n[1] ? 0 : -(n[2] + (n[3] || '00')), i + n[0].length) : -1;
    }
    function parseLiteralPercent(d, string, i) {
        var n = percentRe.exec(string.slice(i, i + 1));
        return n ? i + n[0].length : -1;
    }
    return {
        format: function (specifier) {
            var f = newFormat(specifier, formats);
            f.toString = function () { return specifier; };
            return f;
        },
        parse: function (specifier) {
            var p = newParse(specifier, localDate);
            p.toString = function () { return specifier; };
            return p;
        },
        utcFormat: function (specifier) {
            var f = newFormat(specifier, utcFormats);
            f.toString = function () { return specifier; };
            return f;
        },
        utcParse: function (specifier) {
            var p = newParse(specifier, utcDate);
            p.toString = function () { return specifier; };
            return p;
        }
    };
}
exports.default = formatLocale;
//# sourceMappingURL=locale.js.map