var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
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
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
var _a;
import { ContinuousScale } from './continuousScale';
import timeMillisecond from '../util/time/millisecond';
import timeSecond from '../util/time/second';
import timeMinute from '../util/time/minute';
import timeHour from '../util/time/hour';
import timeDay from '../util/time/day';
import timeWeek from '../util/time/week';
import timeMonth from '../util/time/month';
import timeYear from '../util/time/year';
import { durationSecond, durationMinute, durationHour, durationDay, durationWeek, durationMonth, durationYear, } from '../util/time/duration';
import { TimeInterval } from '../util/time/interval';
import { tickStep } from '../util/ticks';
import { buildFormatter } from '../util/timeFormat';
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
        _this.cacheProps = ['domain', 'range', 'nice', 'tickCount', 'interval'];
        _this.year = timeYear;
        _this.month = timeMonth;
        _this.week = timeWeek;
        _this.day = timeDay;
        _this.hour = timeHour;
        _this.minute = timeMinute;
        _this.second = timeSecond;
        _this.millisecond = timeMillisecond;
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
            [_this.second, 1, durationSecond],
            [_this.second, 5, 5 * durationSecond],
            [_this.second, 15, 15 * durationSecond],
            [_this.second, 30, 30 * durationSecond],
            [_this.minute, 1, durationMinute],
            [_this.minute, 5, 5 * durationMinute],
            [_this.minute, 15, 15 * durationMinute],
            [_this.minute, 30, 30 * durationMinute],
            [_this.hour, 1, durationHour],
            [_this.hour, 3, 3 * durationHour],
            [_this.hour, 6, 6 * durationHour],
            [_this.hour, 12, 12 * durationHour],
            [_this.day, 1, durationDay],
            [_this.day, 2, 2 * durationDay],
            [_this.week, 1, durationWeek],
            [_this.week, 2, 2 * durationWeek],
            [_this.week, 3, 3 * durationWeek],
            [_this.month, 1, durationMonth],
            [_this.month, 2, 2 * durationMonth],
            [_this.month, 3, 3 * durationMonth],
            [_this.month, 4, 4 * durationMonth],
            [_this.month, 6, 6 * durationMonth],
            [_this.year, 1, durationYear],
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
            for (var ticks_1 = __values(ticks), ticks_1_1 = ticks_1.next(); !ticks_1_1.done; ticks_1_1 = ticks_1.next()) {
                var value = ticks_1_1.value;
                var format = this.getLowestGranularityFormat(value);
                updateFormat(format);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (ticks_1_1 && !ticks_1_1.done && (_a = ticks_1.return)) _a.call(ticks_1);
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
        var start = Math.min.apply(Math, __spread(domain.map(toNumber)));
        var stop = Math.max.apply(Math, __spread(domain.map(toNumber)));
        var extent = stop - start;
        switch (defaultTimeFormat) {
            case DefaultTimeFormats.SECOND:
                if (extent / durationMinute > 1) {
                    formatStringArray.push(formatStrings[DefaultTimeFormats.MINUTE]);
                }
            // fall through deliberately
            case DefaultTimeFormats.MINUTE:
                if (extent / durationHour > 1) {
                    formatStringArray.push(formatStrings[DefaultTimeFormats.HOUR]);
                }
            // fall through deliberately
            case DefaultTimeFormats.HOUR:
                timeEndIndex = formatStringArray.length;
                if (extent / durationDay > 1) {
                    formatStringArray.push(formatStrings[DefaultTimeFormats.WEEK_DAY]);
                }
            // fall through deliberately
            case DefaultTimeFormats.WEEK_DAY:
                if (extent / durationWeek > 1 || yearChange) {
                    // if it's more than a week or there is a year change, don't show week day
                    var weekDayIndex = formatStringArray.indexOf(formatStrings[DefaultTimeFormats.WEEK_DAY]);
                    if (weekDayIndex > -1) {
                        formatStringArray.splice(weekDayIndex, 1, formatStrings[DefaultTimeFormats.SHORT_MONTH]);
                    }
                }
            // fall through deliberately
            case DefaultTimeFormats.SHORT_MONTH:
            case DefaultTimeFormats.MONTH:
                if (extent / durationYear > 1 || yearChange) {
                    formatStringArray.push(formatStrings[DefaultTimeFormats.YEAR]);
                }
            // fall through deliberately
            default:
                break;
        }
        if (timeEndIndex < formatStringArray.length) {
            // Insert a gap between all date components.
            formatStringArray = __spread(formatStringArray.slice(0, timeEndIndex), [
                formatStringArray.slice(timeEndIndex).join(' '),
            ]);
        }
        if (timeEndIndex > 0) {
            // Reverse order of time components, since they should be displayed in descending
            // granularity.
            formatStringArray = __spread(formatStringArray.slice(0, timeEndIndex).reverse(), formatStringArray.slice(timeEndIndex));
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
        return function (date) { return buildFormatter(formatString)(date); };
    };
    /**
     * @param options Tick interval options.
     * @param options.start The start time (timestamp).
     * @param options.stop The end time (timestamp).
     * @param options.count Number of intervals between ticks.
     */
    TimeScale.prototype.getTickInterval = function (_a) {
        var _b;
        var start = _a.start, stop = _a.stop, count = _a.count;
        var tickIntervals = this.tickIntervals;
        var countableTimeInterval;
        var step;
        var tickCount = count !== null && count !== void 0 ? count : ContinuousScale.defaultTickCount;
        var target = Math.abs(stop - start) / Math.max(tickCount - 1, 1);
        var i = 0;
        while (i < tickIntervals.length && target > tickIntervals[i][2]) {
            i++;
        }
        if (i === 0) {
            step = Math.max(tickStep(start, stop, tickCount), 1);
            countableTimeInterval = this.millisecond;
        }
        else if (i === tickIntervals.length) {
            var y0 = start / durationYear;
            var y1 = stop / durationYear;
            step = tickStep(y0, y1, tickCount);
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
        var t = this.getTickInterval({ start: start, stop: stop, count: this.tickCount });
        return t ? t.range(new Date(start), new Date(stop)) : []; // inclusive stop
    };
    TimeScale.prototype.getTicksForInterval = function (_a) {
        var start = _a.start, stop = _a.stop;
        var _b = this, interval = _b.interval, tickIntervals = _b.tickIntervals;
        if (!interval) {
            return [];
        }
        if (interval instanceof TimeInterval) {
            var ticks_2 = interval.range(new Date(start), new Date(stop));
            if (this.isDenseInterval({ start: start, stop: stop, interval: interval, count: ticks_2.length })) {
                return this.getDefaultTicks({ start: start, stop: stop });
            }
            return ticks_2;
        }
        var absInterval = Math.abs(interval);
        if (this.isDenseInterval({ start: start, stop: stop, interval: absInterval })) {
            return this.getDefaultTicks({ start: start, stop: stop });
        }
        var timeInterval = tickIntervals.reverse().find(function (tickInterval) { return absInterval % tickInterval[2] === 0; });
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
        return specifier == undefined ? this.defaultTickFormat(ticks) : buildFormatter(specifier);
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
        var _a = __read(this.domain, 2), d0 = _a[0], d1 = _a[1];
        var start = toNumber(d0);
        var stop = toNumber(d1);
        var interval = this.interval;
        var i;
        if (interval instanceof TimeInterval) {
            i = interval;
        }
        else {
            var tickCount = typeof interval === 'number' ? (stop - start) / Math.max(interval, 1) : this.tickCount;
            i = this.getTickInterval({ start: start, stop: stop, count: tickCount });
        }
        if (i) {
            var intervalRange = i.range(d0, d1, true);
            var n0 = intervalRange[0];
            var n1 = intervalRange[intervalRange.length - 1];
            this.niceDomain = [n0, n1];
        }
    };
    return TimeScale;
}(ContinuousScale));
export { TimeScale };
