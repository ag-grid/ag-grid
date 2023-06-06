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
        _this.cacheProps = [
            'domain',
            'range',
            'nice',
            'tickCount',
            'interval',
            'minTickCount',
            'maxTickCount',
        ];
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
        var start = Math.min.apply(Math, __spreadArray([], __read(domain.map(toNumber))));
        var stop = Math.max.apply(Math, __spreadArray([], __read(domain.map(toNumber))));
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
        var start = _a.start, stop = _a.stop, count = _a.count, minCount = _a.minCount, maxCount = _a.maxCount;
        var tickIntervals = this.tickIntervals;
        var countableTimeInterval;
        var step;
        var tickCount = count !== null && count !== void 0 ? count : ContinuousScale.defaultTickCount;
        var target = Math.abs(stop - start) / Math.max(tickCount, 1);
        var i = 0;
        while (i < tickIntervals.length && target > tickIntervals[i][2]) {
            i++;
        }
        if (i === 0) {
            step = Math.max(tickStep(start, stop, tickCount, minCount, maxCount), 1);
            countableTimeInterval = this.millisecond;
        }
        else if (i === tickIntervals.length) {
            var y0 = start / durationYear;
            var y1 = stop / durationYear;
            step = tickStep(y0, y1, tickCount, minCount, maxCount);
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
        if (interval instanceof TimeInterval) {
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
}(ContinuousScale));
export { TimeScale };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGltZVNjYWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3NjYWxlL3RpbWVTY2FsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFDcEQsT0FBTyxlQUFlLE1BQU0sMEJBQTBCLENBQUM7QUFDdkQsT0FBTyxVQUFVLE1BQU0scUJBQXFCLENBQUM7QUFDN0MsT0FBTyxVQUFVLE1BQU0scUJBQXFCLENBQUM7QUFDN0MsT0FBTyxRQUFRLE1BQU0sbUJBQW1CLENBQUM7QUFDekMsT0FBTyxPQUFPLE1BQU0sa0JBQWtCLENBQUM7QUFDdkMsT0FBTyxRQUFRLE1BQU0sbUJBQW1CLENBQUM7QUFDekMsT0FBTyxTQUFTLE1BQU0sb0JBQW9CLENBQUM7QUFDM0MsT0FBTyxRQUFRLE1BQU0sbUJBQW1CLENBQUM7QUFDekMsT0FBTyxFQUNILGNBQWMsRUFDZCxjQUFjLEVBQ2QsWUFBWSxFQUNaLFdBQVcsRUFDWCxZQUFZLEVBQ1osYUFBYSxFQUNiLFlBQVksR0FDZixNQUFNLHVCQUF1QixDQUFDO0FBQy9CLE9BQU8sRUFBeUIsWUFBWSxFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFDNUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUN6QyxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFFcEQsSUFBSyxrQkFVSjtBQVZELFdBQUssa0JBQWtCO0lBQ25CLHlFQUFXLENBQUE7SUFDWCwrREFBTSxDQUFBO0lBQ04sK0RBQU0sQ0FBQTtJQUNOLDJEQUFJLENBQUE7SUFDSixtRUFBUSxDQUFBO0lBQ1IseUVBQVcsQ0FBQTtJQUNYLDZEQUFLLENBQUE7SUFDTCx1RUFBVSxDQUFBO0lBQ1YsMkRBQUksQ0FBQTtBQUNSLENBQUMsRUFW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