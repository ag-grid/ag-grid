"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
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
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimeScale = void 0;
var continuousScale_1 = require("./continuousScale");
var millisecond_1 = require("../util/time/millisecond");
var second_1 = require("../util/time/second");
var minute_1 = require("../util/time/minute");
var hour_1 = require("../util/time/hour");
var day_1 = require("../util/time/day");
var week_1 = require("../util/time/week");
var month_1 = require("../util/time/month");
var year_1 = require("../util/time/year");
var duration_1 = require("../util/time/duration");
var interval_1 = require("../util/time/interval");
var ticks_1 = require("../util/ticks");
var timeFormat_1 = require("../util/timeFormat");
var DefaultTimeFormats;
(function (DefaultTimeFormats) {
    DefaultTimeFormats[DefaultTimeFormats["MILLISECOND"] = 0] = "MILLISECOND";
    DefaultTimeFormats[DefaultTimeFormats["SECOND"] = 1] = "SECOND";
    DefaultTimeFormats[DefaultTimeFormats["MINUTE"] = 2] = "MINUTE";
    DefaultTimeFormats[DefaultTimeFormats["HOUR"] = 3] = "HOUR";
    DefaultTimeFormats[DefaultTimeFormats["WEEK_DAY"] = 4] = "WEEK_DAY";
    DefaultTimeFormats[DefaultTimeFormats["SHORT_MONTH"] = 5] = "SHORT_MONTH";
    DefaultTimeFormats[DefaultTimeFormats["MONTH"] = 6] = "MONTH";
    DefaultTimeFormats[DefaultTimeFormats["SHORT_YEAR"] = 7] = "SHORT_YEAR";
    DefaultTimeFormats[DefaultTimeFormats["YEAR"] = 8] = "YEAR";
})(DefaultTimeFormats || (DefaultTimeFormats = {}));
var formatStrings = (_a = {},
    _a[DefaultTimeFormats.MILLISECOND] = '.%L',
    _a[DefaultTimeFormats.SECOND] = ':%S',
    _a[DefaultTimeFormats.MINUTE] = '%I:%M',
    _a[DefaultTimeFormats.HOUR] = '%I %p',
    _a[DefaultTimeFormats.WEEK_DAY] = '%a',
    _a[DefaultTimeFormats.SHORT_MONTH] = '%b %d',
    _a[DefaultTimeFormats.MONTH] = '%B',
    _a[DefaultTimeFormats.SHORT_YEAR] = '%y',
    _a[DefaultTimeFormats.YEAR] = '%Y',
    _a);
function toNumber(x) {
    return x instanceof Date ? x.getTime() : x;
}
var TimeScale = /** @class */ (function (_super) {
    __extends(TimeScale, _super);
    function TimeScale() {
        var _this = _super.call(this, [new Date(2022, 11, 7), new Date(2022, 11, 8)], [0, 1]) || this;
        _this.type = 'time';
        _this.cacheProps = [
            'domain',
            'range',
            'nice',
            'tickCount',
            'interval',
            'minTickCount',
            'maxTickCount',
        ];
        _this.year = year_1.default;
        _this.month = month_1.default;
        _this.week = week_1.default;
        _this.day = day_1.default;
        _this.hour = hour_1.default;
        _this.minute = minute_1.default;
        _this.second = second_1.default;
        _this.millisecond = millisecond_1.default;
        /**
         * Array of default tick intervals in the following format:
         *
         *     [
         *         interval (unit of time),
         *         number of units (step),
         *         the length of that number of units in milliseconds
         *     ]
         */
        _this.tickIntervals = [
            [_this.second, 1, duration_1.durationSecond],
            [_this.second, 5, 5 * duration_1.durationSecond],
            [_this.second, 15, 15 * duration_1.durationSecond],
            [_this.second, 30, 30 * duration_1.durationSecond],
            [_this.minute, 1, duration_1.durationMinute],
            [_this.minute, 5, 5 * duration_1.durationMinute],
            [_this.minute, 15, 15 * duration_1.durationMinute],
            [_this.minute, 30, 30 * duration_1.durationMinute],
            [_this.hour, 1, duration_1.durationHour],
            [_this.hour, 3, 3 * duration_1.durationHour],
            [_this.hour, 6, 6 * duration_1.durationHour],
            [_this.hour, 12, 12 * duration_1.durationHour],
            [_this.day, 1, duration_1.durationDay],
            [_this.day, 2, 2 * duration_1.durationDay],
            [_this.week, 1, duration_1.durationWeek],
            [_this.week, 2, 2 * duration_1.durationWeek],
            [_this.week, 3, 3 * duration_1.durationWeek],
            [_this.month, 1, duration_1.durationMonth],
            [_this.month, 2, 2 * duration_1.durationMonth],
            [_this.month, 3, 3 * duration_1.durationMonth],
            [_this.month, 4, 4 * duration_1.durationMonth],
            [_this.month, 6, 6 * duration_1.durationMonth],
            [_this.year, 1, duration_1.durationYear],
        ];
        return _this;
    }
    TimeScale.prototype.toDomain = function (d) {
        return new Date(d);
    };
    TimeScale.prototype.calculateDefaultTickFormat = function (ticks) {
        var e_1, _a;
        if (ticks === void 0) { ticks = []; }
        var defaultTimeFormat = DefaultTimeFormats.YEAR;
        var updateFormat = function (format) {
            if (format < defaultTimeFormat) {
                defaultTimeFormat = format;
            }
        };
        try {
            for (var ticks_2 = __values(ticks), ticks_2_1 = ticks_2.next(); !ticks_2_1.done; ticks_2_1 = ticks_2.next()) {
                var value = ticks_2_1.value;
                var format = this.getLowestGranularityFormat(value);
                updateFormat(format);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (ticks_2_1 && !ticks_2_1.done && (_a = ticks_2.return)) _a.call(ticks_2);
            }
            finally { if (e_1) throw e_1.error; }
        }
        var firstTick = toNumber(ticks[0]);
        var lastTick = toNumber(ticks[ticks.length - 1]);
        var startYear = new Date(firstTick).getFullYear();
        var stopYear = new Date(lastTick).getFullYear();
        var yearChange = stopYear - startYear > 0;
        return this.buildFormatString(defaultTimeFormat, yearChange);
    };
    TimeScale.prototype.buildFormatString = function (defaultTimeFormat, yearChange) {
        var formatStringArray = [formatStrings[defaultTimeFormat]];
        var timeEndIndex = 0;
        var domain = this.getDomain();
        var start = Math.min.apply(Math, __spreadArray([], __read(domain.map(toNumber))));
        var stop = Math.max.apply(Math, __spreadArray([], __read(domain.map(toNumber))));
        var extent = stop - start;
        switch (defaultTimeFormat) {
            case DefaultTimeFormats.SECOND:
                if (extent / duration_1.durationMinute > 1) {
                    formatStringArray.push(formatStrings[DefaultTimeFormats.MINUTE]);
                }
            // fall through deliberately
            case DefaultTimeFormats.MINUTE:
                if (extent / duration_1.durationHour > 1) {
                    formatStringArray.push(formatStrings[DefaultTimeFormats.HOUR]);
                }
            // fall through deliberately
            case DefaultTimeFormats.HOUR:
                timeEndIndex = formatStringArray.length;
                if (extent / duration_1.durationDay > 1) {
                    formatStringArray.push(formatStrings[DefaultTimeFormats.WEEK_DAY]);
                }
            // fall through deliberately
            case DefaultTimeFormats.WEEK_DAY:
                if (extent / duration_1.durationWeek > 1 || yearChange) {
                    // if it's more than a week or there is a year change, don't show week day
                    var weekDayIndex = formatStringArray.indexOf(formatStrings[DefaultTimeFormats.WEEK_DAY]);
                    if (weekDayIndex > -1) {
                        formatStringArray.splice(weekDayIndex, 1, formatStrings[DefaultTimeFormats.SHORT_MONTH]);
                    }
                }
            // fall through deliberately
            case DefaultTimeFormats.SHORT_MONTH:
            case DefaultTimeFormats.MONTH:
                if (extent / duration_1.durationYear > 1 || yearChange) {
                    formatStringArray.push(formatStrings[DefaultTimeFormats.YEAR]);
                }
            // fall through deliberately
            default:
                break;
        }
        if (timeEndIndex < formatStringArray.length) {
            // Insert a gap between all date components.
            formatStringArray = __spreadArray(__spreadArray([], __read(formatStringArray.slice(0, timeEndIndex))), [
                formatStringArray.slice(timeEndIndex).join(' '),
            ]);
        }
        if (timeEndIndex > 0) {
            // Reverse order of time components, since they should be displayed in descending
            // granularity.
            formatStringArray = __spreadArray(__spreadArray([], __read(formatStringArray.slice(0, timeEndIndex).reverse())), __read(formatStringArray.slice(timeEndIndex)));
            if (timeEndIndex < formatStringArray.length) {
                // Insert a gap between time and date components.
                formatStringArray.splice(timeEndIndex, 0, ' ');
            }
        }
        return formatStringArray.join('');
    };
    TimeScale.prototype.getLowestGranularityFormat = function (value) {
        if (this.second.floor(value) < value) {
            return DefaultTimeFormats.MILLISECOND;
        }
        else if (this.minute.floor(value) < value) {
            return DefaultTimeFormats.SECOND;
        }
        else if (this.hour.floor(value) < value) {
            return DefaultTimeFormats.MINUTE;
        }
        else if (this.day.floor(value) < value) {
            return DefaultTimeFormats.HOUR;
        }
        else if (this.month.floor(value) < value) {
            if (this.week.floor(value) < value) {
                return DefaultTimeFormats.WEEK_DAY;
            }
            return DefaultTimeFormats.SHORT_MONTH;
        }
        else if (this.year.floor(value) < value) {
            return DefaultTimeFormats.MONTH;
        }
        return DefaultTimeFormats.YEAR;
    };
    TimeScale.prototype.defaultTickFormat = function (ticks) {
        var formatString = this.calculateDefaultTickFormat(ticks);
        return function (date) { return timeFormat_1.buildFormatter(formatString)(date); };
    };
    /**
     * @param options Tick interval options.
     * @param options.start The start time (timestamp).
     * @param options.stop The end time (timestamp).
     * @param options.count Number of intervals between ticks.
     */
    TimeScale.prototype.getTickInterval = function (_a) {
        var _b;
        var start = _a.start, stop = _a.stop, count = _a.count, minCount = _a.minCount, maxCount = _a.maxCount;
        var tickIntervals = this.tickIntervals;
        var countableTimeInterval;
        var step;
        var tickCount = count !== null && count !== void 0 ? count : continuousScale_1.ContinuousScale.defaultTickCount;
        var target = Math.abs(stop - start) / Math.max(tickCount, 1);
        var i = 0;
        while (i < tickIntervals.length && target > tickIntervals[i][2]) {
            i++;
        }
        if (i === 0) {
            step = Math.max(ticks_1.tickStep(start, stop, tickCount, minCount, maxCount), 1);
            countableTimeInterval = this.millisecond;
        }
        else if (i === tickIntervals.length) {
            var y0 = start / duration_1.durationYear;
            var y1 = stop / duration_1.durationYear;
            step = ticks_1.tickStep(y0, y1, tickCount, minCount, maxCount);
            countableTimeInterval = this.year;
        }
        else {
            var diff0 = target - tickIntervals[i - 1][2];
            var diff1 = tickIntervals[i][2] - target;
            var index = diff0 < diff1 ? i - 1 : i;
            _b = __read(tickIntervals[index], 2), countableTimeInterval = _b[0], step = _b[1];
        }
        return countableTimeInterval.every(step);
    };
    TimeScale.prototype.invert = function (y) {
        return new Date(_super.prototype.invert.call(this, y));
    };
    /**
     * Returns uniformly-spaced dates that represent the scale's domain.
     */
    TimeScale.prototype.ticks = function () {
        if (!this.domain || this.domain.length < 2) {
            return [];
        }
        this.refresh();
        var _a = __read(this.getDomain().map(toNumber), 2), t0 = _a[0], t1 = _a[1];
        if (this.interval !== undefined) {
            return this.getTicksForInterval({ start: t0, stop: t1 });
        }
        if (this.nice) {
            var tickCount = this.tickCount;
            if (tickCount === 2) {
                return this.niceDomain;
            }
            if (tickCount === 1) {
                return this.niceDomain.slice(0, 1);
            }
        }
        return this.getDefaultTicks({ start: t0, stop: t1 });
    };
    TimeScale.prototype.getDefaultTicks = function (_a) {
        var start = _a.start, stop = _a.stop;
        var t = this.getTickInterval({
            start: start,
            stop: stop,
            count: this.tickCount,
            minCount: this.minTickCount,
            maxCount: this.maxTickCount,
        });
        return t ? t.range(new Date(start), new Date(stop)) : []; // inclusive stop
    };
    TimeScale.prototype.getTicksForInterval = function (_a) {
        var start = _a.start, stop = _a.stop;
        var _b = this, interval = _b.interval, tickIntervals = _b.tickIntervals;
        if (!interval) {
            return [];
        }
        if (interval instanceof interval_1.TimeInterval) {
            var ticks_3 = interval.range(new Date(start), new Date(stop));
            if (this.isDenseInterval({ start: start, stop: stop, interval: interval, count: ticks_3.length })) {
                return this.getDefaultTicks({ start: start, stop: stop });
            }
            return ticks_3;
        }
        var absInterval = Math.abs(interval);
        if (this.isDenseInterval({ start: start, stop: stop, interval: absInterval })) {
            return this.getDefaultTicks({ start: start, stop: stop });
        }
        var reversedInterval = __spreadArray([], __read(tickIntervals));
        reversedInterval.reverse();
        var timeInterval = reversedInterval.find(function (tickInterval) { return absInterval % tickInterval[2] === 0; });
        if (timeInterval) {
            var i = timeInterval[0].every(absInterval / (timeInterval[2] / timeInterval[1]));
            return i.range(new Date(start), new Date(stop));
        }
        var date = new Date(start);
        var stopDate = new Date(stop);
        var ticks = [];
        while (date <= stopDate) {
            ticks.push(date);
            date = new Date(date);
            date.setMilliseconds(date.getMilliseconds() + absInterval);
        }
        return ticks;
    };
    /**
     * Returns a time format function suitable for displaying tick values.
     * @param specifier If the specifier string is provided, this method is equivalent to
     * the {@link TimeLocaleObject.format} method.
     * If no specifier is provided, this method returns the default time format function.
     */
    TimeScale.prototype.tickFormat = function (_a) {
        var ticks = _a.ticks, specifier = _a.specifier;
        return specifier == undefined ? this.defaultTickFormat(ticks) : timeFormat_1.buildFormatter(specifier);
    };
    TimeScale.prototype.update = function () {
        if (!this.domain || this.domain.length < 2) {
            return;
        }
        if (this.nice) {
            this.updateNiceDomain();
        }
    };
    /**
     * Extends the domain so that it starts and ends on nice round values.
     * This method typically modifies the scale’s domain, and may only extend the bounds to the nearest round value.
     */
    TimeScale.prototype.updateNiceDomain = function () {
        var maxAttempts = 4;
        var _a = __read(this.domain, 2), d0 = _a[0], d1 = _a[1];
        for (var i = 0; i < maxAttempts; i++) {
            this.updateNiceDomainIteration(d0, d1);
            var _b = __read(this.niceDomain, 2), n0 = _b[0], n1 = _b[1];
            if (toNumber(d0) === toNumber(n0) && toNumber(d1) === toNumber(n1)) {
                break;
            }
            d0 = n0;
            d1 = n1;
        }
    };
    TimeScale.prototype.updateNiceDomainIteration = function (d0, d1) {
        var start = toNumber(d0);
        var stop = toNumber(d1);
        var interval = this.interval;
        var i;
        if (interval instanceof interval_1.TimeInterval) {
            i = interval;
        }
        else {
            var tickCount = typeof interval === 'number' ? (stop - start) / Math.max(interval, 1) : this.tickCount;
            i = this.getTickInterval({
                start: start,
                stop: stop,
                count: tickCount,
                minCount: this.minTickCount,
                maxCount: this.maxTickCount,
            });
        }
        if (i) {
            var intervalRange = i.range(d0, d1, true);
            var n0 = intervalRange[0];
            var n1 = intervalRange[intervalRange.length - 1];
            this.niceDomain = [n0, n1];
        }
    };
    return TimeScale;
}(continuousScale_1.ContinuousScale));
exports.TimeScale = TimeScale;
//# sourceMappingURL=timeScale.js.map