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
const interval_1 = require("../util/time/interval");
const ticks_1 = require("../util/ticks");
const timeFormat_1 = require("../util/timeFormat");
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
const formatStrings = {
    [DefaultTimeFormats.MILLISECOND]: '.%L',
    [DefaultTimeFormats.SECOND]: ':%S',
    [DefaultTimeFormats.MINUTE]: '%I:%M',
    [DefaultTimeFormats.HOUR]: '%I %p',
    [DefaultTimeFormats.WEEK_DAY]: '%a',
    [DefaultTimeFormats.SHORT_MONTH]: '%b %d',
    [DefaultTimeFormats.MONTH]: '%B',
    [DefaultTimeFormats.SHORT_YEAR]: '%y',
    [DefaultTimeFormats.YEAR]: '%Y',
};
function toNumber(x) {
    return x instanceof Date ? x.getTime() : x;
}
class TimeScale extends continuousScale_1.ContinuousScale {
    constructor() {
        super([new Date(2022, 11, 7), new Date(2022, 11, 8)], [0, 1]);
        this.type = 'time';
        this.cacheProps = [
            'domain',
            'range',
            'nice',
            'tickCount',
            'interval',
            'minTickCount',
            'maxTickCount',
        ];
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
            [this.week, 3, 3 * duration_1.durationWeek],
            [this.month, 1, duration_1.durationMonth],
            [this.month, 2, 2 * duration_1.durationMonth],
            [this.month, 3, 3 * duration_1.durationMonth],
            [this.month, 4, 4 * duration_1.durationMonth],
            [this.month, 6, 6 * duration_1.durationMonth],
            [this.year, 1, duration_1.durationYear],
        ];
    }
    toDomain(d) {
        return new Date(d);
    }
    calculateDefaultTickFormat(ticks = []) {
        let defaultTimeFormat = DefaultTimeFormats.YEAR;
        const updateFormat = (format) => {
            if (format < defaultTimeFormat) {
                defaultTimeFormat = format;
            }
        };
        for (const value of ticks) {
            const format = this.getLowestGranularityFormat(value);
            updateFormat(format);
        }
        const firstTick = toNumber(ticks[0]);
        const lastTick = toNumber(ticks[ticks.length - 1]);
        const startYear = new Date(firstTick).getFullYear();
        const stopYear = new Date(lastTick).getFullYear();
        const yearChange = stopYear - startYear > 0;
        return this.buildFormatString(defaultTimeFormat, yearChange);
    }
    buildFormatString(defaultTimeFormat, yearChange) {
        let formatStringArray = [formatStrings[defaultTimeFormat]];
        let timeEndIndex = 0;
        const domain = this.getDomain();
        const start = Math.min(...domain.map(toNumber));
        const stop = Math.max(...domain.map(toNumber));
        const extent = stop - start;
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
                    const weekDayIndex = formatStringArray.indexOf(formatStrings[DefaultTimeFormats.WEEK_DAY]);
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
    getLowestGranularityFormat(value) {
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
    }
    defaultTickFormat(ticks) {
        const formatString = this.calculateDefaultTickFormat(ticks);
        return (date) => timeFormat_1.buildFormatter(formatString)(date);
    }
    /**
     * @param options Tick interval options.
     * @param options.start The start time (timestamp).
     * @param options.stop The end time (timestamp).
     * @param options.count Number of intervals between ticks.
     */
    getTickInterval({ start, stop, count, minCount, maxCount, }) {
        const { tickIntervals } = this;
        let countableTimeInterval;
        let step;
        const tickCount = count !== null && count !== void 0 ? count : continuousScale_1.ContinuousScale.defaultTickCount;
        const target = Math.abs(stop - start) / Math.max(tickCount, 1);
        let i = 0;
        while (i < tickIntervals.length && target > tickIntervals[i][2]) {
            i++;
        }
        if (i === 0) {
            step = Math.max(ticks_1.tickStep(start, stop, tickCount, minCount, maxCount), 1);
            countableTimeInterval = this.millisecond;
        }
        else if (i === tickIntervals.length) {
            const y0 = start / duration_1.durationYear;
            const y1 = stop / duration_1.durationYear;
            step = ticks_1.tickStep(y0, y1, tickCount, minCount, maxCount);
            countableTimeInterval = this.year;
        }
        else {
            const diff0 = target - tickIntervals[i - 1][2];
            const diff1 = tickIntervals[i][2] - target;
            const index = diff0 < diff1 ? i - 1 : i;
            [countableTimeInterval, step] = tickIntervals[index];
        }
        return countableTimeInterval.every(step);
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
        const [t0, t1] = this.getDomain().map(toNumber);
        if (this.interval !== undefined) {
            return this.getTicksForInterval({ start: t0, stop: t1 });
        }
        if (this.nice) {
            const { tickCount } = this;
            if (tickCount === 2) {
                return this.niceDomain;
            }
            if (tickCount === 1) {
                return this.niceDomain.slice(0, 1);
            }
        }
        return this.getDefaultTicks({ start: t0, stop: t1 });
    }
    getDefaultTicks({ start, stop }) {
        const t = this.getTickInterval({
            start,
            stop,
            count: this.tickCount,
            minCount: this.minTickCount,
            maxCount: this.maxTickCount,
        });
        return t ? t.range(new Date(start), new Date(stop)) : []; // inclusive stop
    }
    getTicksForInterval({ start, stop }) {
        const { interval, tickIntervals } = this;
        if (!interval) {
            return [];
        }
        if (interval instanceof interval_1.TimeInterval) {
            const ticks = interval.range(new Date(start), new Date(stop));
            if (this.isDenseInterval({ start, stop, interval, count: ticks.length })) {
                return this.getDefaultTicks({ start, stop });
            }
            return ticks;
        }
        const absInterval = Math.abs(interval);
        if (this.isDenseInterval({ start, stop, interval: absInterval })) {
            return this.getDefaultTicks({ start, stop });
        }
        const reversedInterval = [...tickIntervals];
        reversedInterval.reverse();
        const timeInterval = reversedInterval.find((tickInterval) => absInterval % tickInterval[2] === 0);
        if (timeInterval) {
            const i = timeInterval[0].every(absInterval / (timeInterval[2] / timeInterval[1]));
            return i.range(new Date(start), new Date(stop));
        }
        let date = new Date(start);
        const stopDate = new Date(stop);
        const ticks = [];
        while (date <= stopDate) {
            ticks.push(date);
            date = new Date(date);
            date.setMilliseconds(date.getMilliseconds() + absInterval);
        }
        return ticks;
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
        const maxAttempts = 4;
        let [d0, d1] = this.domain;
        for (let i = 0; i < maxAttempts; i++) {
            this.updateNiceDomainIteration(d0, d1);
            const [n0, n1] = this.niceDomain;
            if (toNumber(d0) === toNumber(n0) && toNumber(d1) === toNumber(n1)) {
                break;
            }
            d0 = n0;
            d1 = n1;
        }
    }
    updateNiceDomainIteration(d0, d1) {
        const start = toNumber(d0);
        const stop = toNumber(d1);
        const { interval } = this;
        let i;
        if (interval instanceof interval_1.TimeInterval) {
            i = interval;
        }
        else {
            const tickCount = typeof interval === 'number' ? (stop - start) / Math.max(interval, 1) : this.tickCount;
            i = this.getTickInterval({
                start,
                stop,
                count: tickCount,
                minCount: this.minTickCount,
                maxCount: this.maxTickCount,
            });
        }
        if (i) {
            const intervalRange = i.range(d0, d1, true);
            const n0 = intervalRange[0];
            const n1 = intervalRange[intervalRange.length - 1];
            this.niceDomain = [n0, n1];
        }
    }
}
exports.TimeScale = TimeScale;
