"use strict";
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
var ticks_1 = require("../util/ticks");
var timeFormat_1 = require("../util/timeFormat");
var DefaultTimeFormats;
(function (DefaultTimeFormats) {
    DefaultTimeFormats[DefaultTimeFormats["MILLISECOND"] = 0] = "MILLISECOND";
    DefaultTimeFormats[DefaultTimeFormats["SECOND"] = 1] = "SECOND";
    DefaultTimeFormats[DefaultTimeFormats["MINUTE"] = 2] = "MINUTE";
    DefaultTimeFormats[DefaultTimeFormats["HOUR"] = 3] = "HOUR";
    DefaultTimeFormats[DefaultTimeFormats["SHORT_MONTH"] = 4] = "SHORT_MONTH";
    DefaultTimeFormats[DefaultTimeFormats["MONTH"] = 5] = "MONTH";
    DefaultTimeFormats[DefaultTimeFormats["YEAR"] = 6] = "YEAR";
})(DefaultTimeFormats || (DefaultTimeFormats = {}));
var formatStrings = (_a = {},
    _a[DefaultTimeFormats.MILLISECOND] = '.%L',
    _a[DefaultTimeFormats.SECOND] = ':%S',
    _a[DefaultTimeFormats.MINUTE] = '%I:%M',
    _a[DefaultTimeFormats.HOUR] = '%I %p',
    _a[DefaultTimeFormats.SHORT_MONTH] = '%b %d',
    _a[DefaultTimeFormats.MONTH] = '%B',
    _a[DefaultTimeFormats.YEAR] = '%Y',
    _a);
function toNumber(x) {
    return x instanceof Date ? x.getTime() : x;
}
var TimeScale = /** @class */ (function (_super) {
    __extends(TimeScale, _super);
    function TimeScale() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type = 'time';
        _this.domain = [new Date(2022, 11, 7), new Date(2022, 11, 8)];
        _this.cacheProps = ['domain', 'range', 'nice', 'tickCount', 'tickInterval'];
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
            [_this.month, 1, duration_1.durationMonth],
            [_this.month, 3, 3 * duration_1.durationMonth],
            [_this.month, 6, 6 * duration_1.durationMonth],
            [_this.year, 1, duration_1.durationYear],
        ];
        return _this;
    }
    TimeScale.prototype.calculateDefaultTickFormat = function (ticks) {
        var e_1, _a;
        var defaultTimeFormat = DefaultTimeFormats.YEAR;
        var updateFormat = function (format) {
            if (format < defaultTimeFormat) {
                defaultTimeFormat = format;
            }
        };
        try {
            for (var _b = __values(ticks !== null && ticks !== void 0 ? ticks : []), _c = _b.next(); !_c.done; _c = _b.next()) {
                var value = _c.value;
                this.second.floor(value) < value
                    ? updateFormat(DefaultTimeFormats.MILLISECOND)
                    : this.minute.floor(value) < value
                        ? updateFormat(DefaultTimeFormats.SECOND)
                        : this.hour.floor(value) < value
                            ? updateFormat(DefaultTimeFormats.MINUTE)
                            : this.day.floor(value) < value
                                ? updateFormat(DefaultTimeFormats.HOUR)
                                : this.month.floor(value) < value
                                    ? updateFormat(DefaultTimeFormats.SHORT_MONTH)
                                    : this.year.floor(value) < value
                                        ? updateFormat(DefaultTimeFormats.MONTH)
                                        : updateFormat(DefaultTimeFormats.YEAR);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        var domain = this.getDomain();
        var start = Math.min.apply(Math, __spread(domain.map(toNumber)));
        var stop = Math.max.apply(Math, __spread(domain.map(toNumber)));
        var extent = stop - start;
        var formatStringArray = [formatStrings[defaultTimeFormat]];
        var timeEndIndex = 0;
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
                    formatStringArray.push(formatStrings[DefaultTimeFormats.SHORT_MONTH]);
                }
            // fall through deliberately
            case DefaultTimeFormats.SHORT_MONTH:
            // fall through deliberately
            case DefaultTimeFormats.MONTH:
                if (extent / duration_1.durationYear > 1) {
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
    TimeScale.prototype.defaultTickFormat = function (ticks) {
        var formatString = this.calculateDefaultTickFormat(ticks);
        return function (date) { return timeFormat_1.buildFormatter(formatString)(date); };
    };
    /**
     * @param start The start time (timestamp).
     * @param stop The end time (timestamp).
     * @param step Number of intervals between ticks.
     */
    TimeScale.prototype.getTickInterval = function (_a) {
        var _b;
        var _c;
        var start = _a.start, stop = _a.stop, step = _a.step;
        var interval = this.tickInterval;
        if (interval) {
            return interval;
        }
        var tickCount = (_c = this.tickCount) !== null && _c !== void 0 ? _c : 10;
        var tickIntervals = this.tickIntervals;
        var target = Math.abs(stop - start) / tickCount;
        var i = 0;
        while (i < tickIntervals.length && target > tickIntervals[i][2]) {
            i++;
        }
        if (i === 0) {
            step = Math.max(ticks_1.tickStep(start, stop, tickCount), 1);
            interval = this.millisecond;
        }
        else if (i === tickIntervals.length) {
            var y0 = start / duration_1.durationYear;
            var y1 = stop / duration_1.durationYear;
            step = ticks_1.tickStep(y0, y1, tickCount);
            interval = this.year;
        }
        else {
            var ratio0 = target / tickIntervals[i - 1][2];
            var ratio1 = tickIntervals[i][2] / target;
            var index = ratio0 < ratio1 ? i - 1 : i;
            _b = __read(tickIntervals[index], 2), interval = _b[0], step = _b[1];
        }
        return interval.every(step);
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
        if (this.nice) {
            var tickCount = this.tickCount;
            if (tickCount === 2) {
                return this.niceDomain;
            }
            if (tickCount === 1) {
                return this.niceDomain.slice(0, 1);
            }
        }
        var _a = __read(this.getDomain().map(toNumber), 2), t0 = _a[0], t1 = _a[1];
        var t = this.getTickInterval({ start: t0, stop: t1 });
        return t ? t.range(new Date(t0), new Date(t1 + 1)) : []; // inclusive stop
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
        var _a = __read(this.domain, 2), d0 = _a[0], d1 = _a[1];
        var start = toNumber(d0);
        var stop = toNumber(d1);
        var i = this.getTickInterval({ start: start, stop: stop });
        if (i) {
            var n0 = i.floor(d0);
            var n1 = i.ceil(d1);
            this.niceDomain = [n0, n1];
        }
    };
    return TimeScale;
}(continuousScale_1.ContinuousScale));
exports.TimeScale = TimeScale;
//# sourceMappingURL=timeScale.js.map