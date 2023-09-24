var CONSTANTS = {
    periods: ['AM', 'PM'],
    days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    shortDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    months: [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
    ],
    shortMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
};
function dayOfYear(date, startOfYear) {
    if (startOfYear === void 0) { startOfYear = new Date(date.getFullYear(), 0, 1); }
    var startOffset = date.getTimezoneOffset() - startOfYear.getTimezoneOffset();
    var timeDiff = date.getTime() - startOfYear.getTime() + startOffset * 60000;
    var timeOneDay = 3600000 * 24;
    return Math.floor(timeDiff / timeOneDay);
}
function weekOfYear(date, startDay) {
    var startOfYear = new Date(date.getFullYear(), 0, 1);
    var startOfYearDay = startOfYear.getDay();
    var firstWeekStartOffset = (startDay - startOfYearDay + 7) % 7;
    var startOffset = new Date(date.getFullYear(), 0, firstWeekStartOffset + 1);
    if (startOffset <= date) {
        return Math.floor(dayOfYear(date, startOffset) / 7) + 1;
    }
    // Days before week 1 are in week 0.
    return 0;
}
var SUNDAY = 0;
var MONDAY = 1;
var THURSDAY = 4;
function isoWeekOfYear(date, year) {
    if (year === void 0) { year = date.getFullYear(); }
    var firstOfYear = new Date(year, 0, 1);
    var firstOfYearDay = firstOfYear.getDay();
    var firstThursdayOffset = (THURSDAY - firstOfYearDay + 7) % 7;
    var startOffset = new Date(year, 0, firstThursdayOffset - (THURSDAY - MONDAY) + 1);
    if (startOffset <= date) {
        return Math.floor(dayOfYear(date, startOffset) / 7) + 1;
    }
    // Days before week 1 are in week 52/53 of previous year.
    return isoWeekOfYear(date, year - 1);
}
function timezone(date) {
    var offset = date.getTimezoneOffset();
    var unsignedOffset = Math.abs(offset);
    var sign = offset > 0 ? '-' : '+';
    return "" + sign + pad(Math.floor(unsignedOffset / 60), 2, '0') + pad(Math.floor(unsignedOffset % 60), 2, '0');
}
var FORMATTERS = {
    a: function (d) { return CONSTANTS.shortDays[d.getDay()]; },
    A: function (d) { return CONSTANTS.days[d.getDay()]; },
    b: function (d) { return CONSTANTS.shortMonths[d.getMonth()]; },
    B: function (d) { return CONSTANTS.months[d.getMonth()]; },
    c: '%x, %X',
    d: function (d, p) { return pad(d.getDate(), 2, p !== null && p !== void 0 ? p : '0'); },
    e: '%_d',
    f: function (d, p) { return pad(d.getMilliseconds() * 1000, 6, p !== null && p !== void 0 ? p : '0'); },
    H: function (d, p) { return pad(d.getHours(), 2, p !== null && p !== void 0 ? p : '0'); },
    I: function (d, p) {
        var hours = d.getHours() % 12;
        return hours === 0 ? '12' : pad(hours, 2, p !== null && p !== void 0 ? p : '0');
    },
    j: function (d, p) { return pad(dayOfYear(d) + 1, 3, p !== null && p !== void 0 ? p : '0'); },
    m: function (d, p) { return pad(d.getMonth() + 1, 2, p !== null && p !== void 0 ? p : '0'); },
    M: function (d, p) { return pad(d.getMinutes(), 2, p !== null && p !== void 0 ? p : '0'); },
    L: function (d, p) { return pad(d.getMilliseconds(), 3, p !== null && p !== void 0 ? p : '0'); },
    p: function (d) { return (d.getHours() < 12 ? 'AM' : 'PM'); },
    Q: function (d) { return String(d.getTime()); },
    s: function (d) { return String(Math.floor(d.getTime() / 1000)); },
    S: function (d, p) { return pad(d.getSeconds(), 2, p !== null && p !== void 0 ? p : '0'); },
    u: function (d) {
        var day = d.getDay();
        if (day < 1)
            day += 7;
        return String(day % 7);
    },
    U: function (d, p) { return pad(weekOfYear(d, SUNDAY), 2, p !== null && p !== void 0 ? p : '0'); },
    V: function (d, p) { return pad(isoWeekOfYear(d), 2, p !== null && p !== void 0 ? p : '0'); },
    w: function (d, p) { return pad(d.getDay(), 2, p !== null && p !== void 0 ? p : '0'); },
    W: function (d, p) { return pad(weekOfYear(d, MONDAY), 2, p !== null && p !== void 0 ? p : '0'); },
    x: '%-m/%-d/%Y',
    X: '%-I:%M:%S %p',
    y: function (d, p) { return pad(d.getFullYear() % 100, 2, p !== null && p !== void 0 ? p : '0'); },
    Y: function (d, p) { return pad(d.getFullYear(), 4, p !== null && p !== void 0 ? p : '0'); },
    Z: function (d) { return timezone(d); },
    '%': function () { return '%'; },
};
var PADS = {
    _: ' ',
    '0': '0',
    '-': '',
};
function pad(value, size, padChar) {
    var output = String(Math.floor(value));
    if (output.length >= size) {
        return output;
    }
    return "" + padChar.repeat(size - output.length) + output;
}
export function buildFormatter(formatString) {
    var formatParts = [];
    while (formatString.length > 0) {
        var nextEscapeIdx = formatString.indexOf('%');
        if (nextEscapeIdx !== 0) {
            var literalPart = nextEscapeIdx > 0 ? formatString.substring(0, nextEscapeIdx) : formatString;
            formatParts.push(literalPart);
        }
        if (nextEscapeIdx < 0)
            break;
        var maybePadSpecifier = formatString[nextEscapeIdx + 1];
        var maybePad = PADS[maybePadSpecifier];
        if (maybePad != null) {
            nextEscapeIdx++;
        }
        var maybeFormatterSpecifier = formatString[nextEscapeIdx + 1];
        var maybeFormatter = FORMATTERS[maybeFormatterSpecifier];
        if (typeof maybeFormatter === 'function') {
            formatParts.push([maybeFormatter, maybePad]);
        }
        else if (typeof maybeFormatter === 'string') {
            var formatter = buildFormatter(maybeFormatter);
            formatParts.push([formatter, maybePad]);
        }
        else {
            formatParts.push("" + (maybePad !== null && maybePad !== void 0 ? maybePad : '') + maybeFormatterSpecifier);
        }
        formatString = formatString.substring(nextEscapeIdx + 2);
    }
    return function (dateTime) {
        var dateTimeAsDate = typeof dateTime === 'number' ? new Date(dateTime) : dateTime;
        return formatParts.map(function (c) { return (typeof c === 'string' ? c : c[0](dateTimeAsDate, c[1])); }).join('');
    };
}
