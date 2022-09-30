"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const continuousScale_1 = require("./continuousScale");
const millisecond_1 = require("../util/time/millisecond");
const second_1 = require("../util/time/second");
const minute_1 = require("../util/time/minute");
const hour_1 = require("../util/time/hour");
const day_1 = require("../util/time/day");
const week_1 = require("../util/time/week");
const month_1 = require("../util/time/month");
const year_1 = require("../util/time/year");
const duration_1 = require("../util/time/duration");
const bisect_1 = require("../util/bisect");
const ticks_1 = require("../util/ticks");
const defaultLocale_1 = require("../util/time/format/defaultLocale");
class TimeScale extends continuousScale_1.default {
    constructor() {
        super(...arguments);
        this.type = 'time';
        this.year = year_1.default;
        this.month = month_1.default;
        this.week = week_1.default;
        this.day = day_1.default;
        this.hour = hour_1.default;
        this.minute = minute_1.default;
        this.second = second_1.default;
        this.millisecond = millisecond_1.default;
        this.format = defaultLocale_1.locale.format;
        /**
         * Array of default tick intervals in the following format:
         *
         *     [
         *         interval (unit of time),
         *         number of units (step),
         *         the length of that number of units in milliseconds
         *     ]
         */
        this.tickIntervals = [
            [this.second, 1, duration_1.durationSecond],
            [this.second, 5, 5 * duration_1.durationSecond],
            [this.second, 15, 15 * duration_1.durationSecond],
            [this.second, 30, 30 * duration_1.durationSecond],
            [this.minute, 1, duration_1.durationMinute],
            [this.minute, 5, 5 * duration_1.durationMinute],
            [this.minute, 15, 15 * duration_1.durationMinute],
            [this.minute, 30, 30 * duration_1.durationMinute],
            [this.hour, 1, duration_1.durationHour],
            [this.hour, 3, 3 * duration_1.durationHour],
            [this.hour, 6, 6 * duration_1.durationHour],
            [this.hour, 12, 12 * duration_1.durationHour],
            [this.day, 1, duration_1.durationDay],
            [this.day, 2, 2 * duration_1.durationDay],
            [this.week, 1, duration_1.durationWeek],
            [this.month, 1, duration_1.durationMonth],
            [this.month, 3, 3 * duration_1.durationMonth],
            [this.year, 1, duration_1.durationYear]
        ];
        this.formatMillisecond = this.format('.%L');
        this.formatSecond = this.format(':%S');
        this.formatMinute = this.format('%I:%M');
        this.formatHour = this.format('%I %p');
        this.formatDay = this.format('%a %d');
        this.formatWeek = this.format('%b %d');
        this.formatMonth = this.format('%B');
        this.formatYear = this.format('%Y');
        this._domain = [new Date(2000, 0, 1), new Date(2000, 0, 2)];
    }
    defaultTickFormat(date) {
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
    }
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
    tickInterval(interval, start, stop, step) {
        if (typeof interval === 'number') {
            const tickCount = interval;
            const tickIntervals = this.tickIntervals;
            const target = Math.abs(stop - start) / tickCount;
            const i = bisect_1.complexBisectRight(tickIntervals, target, interval => interval[2]);
            if (i === tickIntervals.length) {
                step = ticks_1.tickStep(start / duration_1.durationYear, stop / duration_1.durationYear, tickCount);
                interval = this.year;
            }
            else if (i) {
                [interval, step] = tickIntervals[target / tickIntervals[i - 1][2] < tickIntervals[i][2] / target ? i - 1 : i];
            }
            else {
                step = Math.max(ticks_1.tickStep(start, stop, interval), 1);
                interval = this.millisecond;
            }
        }
        return step == undefined ? interval : interval.every(step);
    }
    set domain(values) {
        super.setDomain(Array.prototype.map.call(values, (t) => t instanceof Date ? +t : +new Date(+t)));
    }
    get domain() {
        return super.getDomain().map((t) => new Date(t));
    }
    invert(y) {
        return new Date(super.invert(y));
    }
    /**
     * Returns uniformly-spaced dates that represent the scale's domain.
     * @param interval The desired tick count or a time interval object.
     */
    ticks(interval = 10) {
        const d = super.getDomain();
        let t0 = d[0];
        let t1 = d[d.length - 1];
        const reverse = t1 < t0;
        if (reverse) {
            const _ = t0;
            t0 = t1;
            t1 = _;
        }
        const t = this.tickInterval(interval, t0, t1);
        const i = t ? t.range(t0, t1 + 1) : []; // inclusive stop
        return reverse ? i.reverse() : i;
    }
    /**
     * Returns a time format function suitable for displaying tick values.
     * @param count Ignored. Used only to satisfy the {@link Scale} interface.
     * @param specifier If the specifier string is provided, this method is equivalent to
     * the {@link TimeLocaleObject.format} method.
     * If no specifier is provided, this method returns the default time format function.
     */
    tickFormat(_count, specifier) {
        return specifier == undefined ? this.defaultTickFormat.bind(this) : this.format(specifier);
    }
    /**
     * Extends the domain so that it starts and ends on nice round values.
     * This method typically modifies the scale’s domain, and may only extend the bounds to the nearest round value.
     * @param interval
     */
    nice(interval = 10) {
        const d = super.getDomain();
        const i = this.tickInterval(interval, d[0], d[d.length - 1]);
        if (i) {
            this.domain = this._nice(d, i);
        }
    }
    _nice(domain, interval) {
        domain = domain.slice();
        let i0 = 0;
        let i1 = domain.length - 1;
        let x0 = domain[i0];
        let x1 = domain[i1];
        if (x1 < x0) {
            [i0, i1] = [i1, i0];
            [x0, x1] = [x1, x0];
        }
        domain[i0] = interval.floor(x0);
        domain[i1] = interval.ceil(x1);
        return domain;
    }
}
exports.TimeScale = TimeScale;
