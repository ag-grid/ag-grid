var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import ContinuousScale from "./continuousScale";
import timeMillisecond from "../util/time/millisecond";
import timeSecond from "../util/time/second";
import timeMinute from "../util/time/minute";
import timeHour from "../util/time/hour";
import timeDay from "../util/time/day";
import timeWeek from "../util/time/week";
import timeMonth from "../util/time/month";
import timeYear from "../util/time/year";
import { durationSecond, durationMinute, durationHour, durationDay, durationWeek, durationMonth, durationYear } from "../util/time/duration";
import { complexBisectRight } from "../util/bisect";
import { tickStep } from "../util/ticks";
import { locale } from "../util/time/format/defaultLocale";
var TimeScale = /** @class */ (function (_super) {
    __extends(TimeScale, _super);
    function TimeScale() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.year = timeYear;
        _this.month = timeMonth;
        _this.week = timeWeek;
        _this.day = timeDay;
        _this.hour = timeHour;
        _this.minute = timeMinute;
        _this.second = timeSecond;
        _this.millisecond = timeMillisecond;
        _this.format = locale.format;
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
            [_this.month, 1, durationMonth],
            [_this.month, 3, 3 * durationMonth],
            [_this.year, 1, durationYear]
        ];
        _this.formatMillisecond = _this.format('.%L');
        _this.formatSecond = _this.format(':%S');
        _this.formatMinute = _this.format('%I:%M');
        _this.formatHour = _this.format('%I %p');
        _this.formatDay = _this.format('%a %d');
        _this.formatWeek = _this.format('%b %d');
        _this.formatMonth = _this.format('%B');
        _this.formatYear = _this.format('%Y');
        _this._domain = [new Date(2000, 0, 1), new Date(2000, 0, 2)];
        return _this;
    }
    TimeScale.prototype.defaultTickFormat = function (date) {
        return (this.second.floor(date) < date
            ? this.formatMillisecond
            : this.minute.floor(date) < date
                ? this.formatSecond
                : this.hour.floor(date) < date
                    ? this.formatMinute
                    : this.day.floor(date) < date
                        ? this.formatHour
                        : this.month.floor(date) < date
                            ? (this.week.floor(date) < date ? this.formatDay : this.formatWeek)
                            : this.year.floor(date) < date
                                ? this.formatMonth
                                : this.formatYear)(date);
    };
    /**
     *
     * @param interval If the `interval` is a number, it's interpreted as the desired tick count
     * and the method tries to pick an appropriate interval automatically, based on the extent of the domain.
     * If the `interval` is `undefined`, it defaults to `10`.
     * If the `interval` is a time interval, simply use it.
     * @param start The start time (timestamp).
     * @param stop The end time (timestamp).
     * @param step Number of intervals between ticks.
     */
    TimeScale.prototype.tickInterval = function (interval, start, stop, step) {
        var _a;
        if (interval === void 0) { interval = 10; }
        if (typeof interval === 'number') {
            var tickCount = interval;
            var tickIntervals = this.tickIntervals;
            var target = Math.abs(stop - start) / tickCount;
            var i = complexBisectRight(tickIntervals, target, function (interval) { return interval[2]; });
            if (i === tickIntervals.length) {
                step = tickStep(start / durationYear, stop / durationYear, tickCount);
                interval = this.year;
            }
            else if (i) {
                _a = tickIntervals[target / tickIntervals[i - 1][2] < tickIntervals[i][2] / target ? i - 1 : i], interval = _a[0], step = _a[1];
            }
            else {
                step = Math.max(tickStep(start, stop, interval), 1);
                interval = this.millisecond;
            }
        }
        return step == undefined ? interval : interval.every(step);
    };
    Object.defineProperty(TimeScale.prototype, "domain", {
        get: function () {
            return _super.prototype.getDomain.call(this).map(function (t) { return new Date(t); });
        },
        set: function (values) {
            _super.prototype.setDomain.call(this, Array.prototype.map.call(values, function (t) { return t instanceof Date ? +t : +new Date(+t); }));
        },
        enumerable: true,
        configurable: true
    });
    TimeScale.prototype.invert = function (y) {
        return new Date(_super.prototype.invert.call(this, y));
    };
    /**
     * Returns uniformly-spaced dates that represent the scale's domain.
     * @param interval The desired tick count or a time interval object.
     */
    TimeScale.prototype.ticks = function (interval) {
        if (interval === void 0) { interval = 10; }
        var d = _super.prototype.getDomain.call(this);
        var t0 = d[0];
        var t1 = d[d.length - 1];
        var reverse = t1 < t0;
        if (reverse) {
            var _ = t0;
            t0 = t1;
            t1 = _;
        }
        var t = this.tickInterval(interval, t0, t1);
        var i = t ? t.range(t0, t1 + 1) : []; // inclusive stop
        return reverse ? i.reverse() : i;
    };
    /**
     * Returns a time format function suitable for displaying tick values.
     * @param count Ignored. Used only to satisfy the {@link Scale} interface.
     * @param specifier If the specifier string is provided, this method is equivalent to
     * the {@link TimeLocaleObject.format} method.
     * If no specifier is provided, this method returns the default time format function.
     */
    TimeScale.prototype.tickFormat = function (count, specifier) {
        return specifier == undefined ? this.defaultTickFormat.bind(this) : this.format(specifier);
    };
    /**
     * Extends the domain so that it starts and ends on nice round values.
     * This method typically modifies the scale’s domain, and may only extend the bounds to the nearest round value.
     * @param interval
     */
    TimeScale.prototype.nice = function (interval) {
        if (interval === void 0) { interval = 10; }
        var d = _super.prototype.getDomain.call(this);
        var i = this.tickInterval(interval, d[0], d[d.length - 1]);
        if (i) {
            this.domain = this._nice(d, i);
        }
    };
    TimeScale.prototype._nice = function (domain, interval) {
        var _a, _b;
        domain = domain.slice();
        var i0 = 0;
        var i1 = domain.length - 1;
        var x0 = domain[i0];
        var x1 = domain[i1];
        if (x1 < x0) {
            _a = [i1, i0], i0 = _a[0], i1 = _a[1];
            _b = [x1, x0], x0 = _b[0], x1 = _b[1];
        }
        domain[i0] = interval.floor(x0);
        domain[i1] = interval.ceil(x1);
        return domain;
    };
    return TimeScale;
}(ContinuousScale));
export { TimeScale };
