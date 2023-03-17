/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.2.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseDateTimeFromString = exports.dateToFormattedString = exports.serialiseDate = void 0;
var number_1 = require("./number");
/**
 * Serialises a Date to a string of format `yyyy-MM-dd HH:mm:ss`.
 * An alternative separator can be provided to be used instead of hyphens.
 * @param date The date to serialise
 * @param includeTime Whether to include the time in the serialised string
 * @param separator The separator to use between date parts
 */
function serialiseDate(date, includeTime, separator) {
    if (includeTime === void 0) { includeTime = true; }
    if (separator === void 0) { separator = '-'; }
    if (!date) {
        return null;
    }
    var serialised = [date.getFullYear(), date.getMonth() + 1, date.getDate()].map(function (part) { return number_1.padStartWidthZeros(part, 2); }).join(separator);
    if (includeTime) {
        serialised += ' ' + [date.getHours(), date.getMinutes(), date.getSeconds()].map(function (part) { return number_1.padStartWidthZeros(part, 2); }).join(':');
    }
    return serialised;
}
exports.serialiseDate = serialiseDate;
var calculateOrdinal = function (value) {
    if (value > 3 && value < 21) {
        return 'th';
    }
    var remainder = value % 10;
    switch (remainder) {
        case 1: return "st";
        case 2: return "nd";
        case 3: return "rd";
    }
    return 'th';
};
/**
 * Serialises a Date to a string of format the defined format, does not include time.
 * @param date The date to serialise
 * @param format The string to format the date to, defaults to YYYY-MM-DD
 */
function dateToFormattedString(date, format) {
    if (format === void 0) { format = 'YYYY-MM-DD'; }
    var fullYear = number_1.padStartWidthZeros(date.getFullYear(), 4);
    var months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December',
    ];
    var days = [
        'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
    ];
    var replace = {
        YYYY: function () { return fullYear.slice(fullYear.length - 4, fullYear.length); },
        YY: function () { return fullYear.slice(fullYear.length - 2, fullYear.length); },
        Y: function () { return "" + date.getFullYear(); },
        MMMM: function () { return months[date.getMonth()]; },
        MMM: function () { return months[date.getMonth()].slice(0, 3); },
        MM: function () { return number_1.padStartWidthZeros(date.getMonth() + 1, 2); },
        Mo: function () { return "" + (date.getMonth() + 1) + calculateOrdinal(date.getMonth() + 1); },
        M: function () { return "" + (date.getMonth() + 1); },
        Do: function () { return "" + date.getDate() + calculateOrdinal(date.getDate()); },
        DD: function () { return number_1.padStartWidthZeros(date.getDate(), 2); },
        D: function () { return "" + date.getDate(); },
        dddd: function () { return days[date.getDay()]; },
        ddd: function () { return days[date.getDay()].slice(0, 3); },
        dd: function () { return days[date.getDay()].slice(0, 2); },
        do: function () { return "" + date.getDay() + calculateOrdinal(date.getDay()); },
        d: function () { return "" + date.getDay(); },
    };
    var regexp = new RegExp(Object.keys(replace).join('|'), 'g');
    return format.replace(regexp, function (match) {
        if (match in replace) {
            return replace[match]();
        }
        return match;
    });
}
exports.dateToFormattedString = dateToFormattedString;
/**
 * Parses a date and time from a string in the format `yyyy-MM-dd HH:mm:ss`
 */
function parseDateTimeFromString(value) {
    if (!value) {
        return null;
    }
    var _a = __read(value.split(' '), 2), dateStr = _a[0], timeStr = _a[1];
    if (!dateStr) {
        return null;
    }
    var fields = dateStr.split('-').map(function (f) { return parseInt(f, 10); });
    if (fields.filter(function (f) { return !isNaN(f); }).length !== 3) {
        return null;
    }
    var _b = __read(fields, 3), year = _b[0], month = _b[1], day = _b[2];
    var date = new Date(year, month - 1, day);
    if (date.getFullYear() !== year ||
        date.getMonth() !== month - 1 ||
        date.getDate() !== day) {
        // date was not parsed as expected so must have been invalid
        return null;
    }
    if (!timeStr || timeStr === '00:00:00') {
        return date;
    }
    var _c = __read(timeStr.split(':').map(function (part) { return parseInt(part, 10); }), 3), hours = _c[0], minutes = _c[1], seconds = _c[2];
    if (hours >= 0 && hours < 24) {
        date.setHours(hours);
    }
    if (minutes >= 0 && minutes < 60) {
        date.setMinutes(minutes);
    }
    if (seconds >= 0 && seconds < 60) {
        date.setSeconds(seconds);
    }
    return date;
}
exports.parseDateTimeFromString = parseDateTimeFromString;
