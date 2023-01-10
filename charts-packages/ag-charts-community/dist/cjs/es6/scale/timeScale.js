"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimeScale = void 0;
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
const ticks_1 = require("../util/ticks");
const timeFormat_1 = require("../util/timeFormat");
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
const formatStrings = {
    [DefaultTimeFormats.MILLISECOND]: '.%L',
    [DefaultTimeFormats.SECOND]: ':%S',
    [DefaultTimeFormats.MINUTE]: '%I:%M',
    [DefaultTimeFormats.HOUR]: '%I %p',
    [DefaultTimeFormats.SHORT_MONTH]: '%b %d',
    [DefaultTimeFormats.MONTH]: '%B',
    [DefaultTimeFormats.YEAR]: '%Y',
};
function toNumber(x) {
    return x instanceof Date ? x.getTime() : x;
}
class TimeScale extends continuousScale_1.ContinuousScale {
    constructor() {
        super(...arguments);
        this.type = 'time';
        this.domain = [new Date(2022, 11, 7), new Date(2022, 11, 8)];
        this.cacheProps = ['domain', 'range', 'nice', 'tickCount', 'tickInterval'];
        this.year = year_1.default;
        this.month = month_1.default;
        this.week = week_1.default;
        this.day = day_1.default;
        this.hour = hour_1.default;
        this.minute = minute_1.default;
        this.second = second_1.default;
        this.millisecond = millisecond_1.default;
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
            [this.week, 2, 2 * duration_1.durationWeek],
            [this.month, 1, duration_1.durationMonth],
            [this.month, 3, 3 * duration_1.durationMonth],
            [this.month, 6, 6 * duration_1.durationMonth],
            [this.year, 1, duration_1.durationYear],
        ];
    }
    calculateDefaultTickFormat(ticks) {
        let defaultTimeFormat = DefaultTimeFormats.YEAR;
        const updateFormat = (format) => {
            if (format < defaultTimeFormat) {
                defaultTimeFormat = format;
            }
        };
        for (let value of ticks !== null && ticks !== void 0 ? ticks : []) {
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
        const domain = this.getDomain();
        const start = Math.min(...domain.map(toNumber));
        const stop = Math.max(...domain.map(toNumber));
        const extent = stop - start;
        let formatStringArray = [formatStrings[defaultTimeFormat]];
        let timeEndIndex = 0;
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
            formatStringArray = [
                ...formatStringArray.slice(0, timeEndIndex),
                formatStringArray.slice(timeEndIndex).join(' '),
            ];
        }
        if (timeEndIndex > 0) {
            // Reverse order of time components, since they should be displayed in descending
            // granularity.
            formatStringArray = [
                ...formatStringArray.slice(0, timeEndIndex).reverse(),
                ...formatStringArray.slice(timeEndIndex),
            ];
            if (timeEndIndex < formatStringArray.length) {
                // Insert a gap between time and date components.
                formatStringArray.splice(timeEndIndex, 0, ' ');
            }
        }
        return formatStringArray.join('');
    }
    defaultTickFormat(ticks) {
        const formatString = this.calculateDefaultTickFormat(ticks);
        return (date) => timeFormat_1.buildFormatter(formatString)(date);
    }
    /**
     * @param start The start time (timestamp).
     * @param stop The end time (timestamp).
     * @param step Number of intervals between ticks.
     */
    getTickInterval({ start, stop, step, }) {
        var _a;
        let interval = this.tickInterval;
        if (interval) {
            return interval;
        }
        const tickCount = (_a = this.tickCount) !== null && _a !== void 0 ? _a : 10;
        const tickIntervals = this.tickIntervals;
        const target = Math.abs(stop - start) / tickCount;
        let i = 0;
        while (i < tickIntervals.length && target > tickIntervals[i][2]) {
            i++;
        }
        if (i === 0) {
            step = Math.max(ticks_1.tickStep(start, stop, tickCount), 1);
            interval = this.millisecond;
        }
        else if (i === tickIntervals.length) {
            const y0 = start / duration_1.durationYear;
            const y1 = stop / duration_1.durationYear;
            step = ticks_1.tickStep(y0, y1, tickCount);
            interval = this.year;
        }
        else {
            const ratio0 = target / tickIntervals[i - 1][2];
            const ratio1 = tickIntervals[i][2] / target;
            const index = ratio0 < ratio1 ? i - 1 : i;
            [interval, step] = tickIntervals[index];
        }
        return interval.every(step);
    }
    invert(y) {
        return new Date(super.invert(y));
    }
    /**
     * Returns uniformly-spaced dates that represent the scale's domain.
     */
    ticks() {
        if (!this.domain || this.domain.length < 2) {
            return [];
        }
        this.refresh();
        if (this.nice) {
            const { tickCount } = this;
            if (tickCount === 2) {
                return this.niceDomain;
            }
            if (tickCount === 1) {
                return this.niceDomain.slice(0, 1);
            }
        }
        const [t0, t1] = this.getDomain().map(toNumber);
        const t = this.getTickInterval({ start: t0, stop: t1 });
        return t ? t.range(new Date(t0), new Date(t1 + 1)) : []; // inclusive stop
    }
    /**
     * Returns a time format function suitable for displaying tick values.
     * @param specifier If the specifier string is provided, this method is equivalent to
     * the {@link TimeLocaleObject.format} method.
     * If no specifier is provided, this method returns the default time format function.
     */
    tickFormat({ ticks, specifier }) {
        return specifier == undefined ? this.defaultTickFormat(ticks) : timeFormat_1.buildFormatter(specifier);
    }
    update() {
        if (!this.domain || this.domain.length < 2) {
            return;
        }
        if (this.nice) {
            this.updateNiceDomain();
        }
    }
    /**
     * Extends the domain so that it starts and ends on nice round values.
     * This method typically modifies the scale’s domain, and may only extend the bounds to the nearest round value.
     */
    updateNiceDomain() {
        const [d0, d1] = this.domain;
        const start = toNumber(d0);
        const stop = toNumber(d1);
        const i = this.getTickInterval({ start, stop });
        if (i) {
            const n0 = i.floor(d0);
            const n1 = i.ceil(d1);
            this.niceDomain = [n0, n1];
        }
    }
}
exports.TimeScale = TimeScale;
