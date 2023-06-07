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
export class TimeScale extends ContinuousScale {
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
        this.year = timeYear;
        this.month = timeMonth;
        this.week = timeWeek;
        this.day = timeDay;
        this.hour = timeHour;
        this.minute = timeMinute;
        this.second = timeSecond;
        this.millisecond = timeMillisecond;
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
            [this.second, 1, durationSecond],
            [this.second, 5, 5 * durationSecond],
            [this.second, 15, 15 * durationSecond],
            [this.second, 30, 30 * durationSecond],
            [this.minute, 1, durationMinute],
            [this.minute, 5, 5 * durationMinute],
            [this.minute, 15, 15 * durationMinute],
            [this.minute, 30, 30 * durationMinute],
            [this.hour, 1, durationHour],
            [this.hour, 3, 3 * durationHour],
            [this.hour, 6, 6 * durationHour],
            [this.hour, 12, 12 * durationHour],
            [this.day, 1, durationDay],
            [this.day, 2, 2 * durationDay],
            [this.week, 1, durationWeek],
            [this.week, 2, 2 * durationWeek],
            [this.week, 3, 3 * durationWeek],
            [this.month, 1, durationMonth],
            [this.month, 2, 2 * durationMonth],
            [this.month, 3, 3 * durationMonth],
            [this.month, 4, 4 * durationMonth],
            [this.month, 6, 6 * durationMonth],
            [this.year, 1, durationYear],
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
                    const weekDayIndex = formatStringArray.indexOf(formatStrings[DefaultTimeFormats.WEEK_DAY]);
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
        return (date) => buildFormatter(formatString)(date);
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
        const tickCount = count !== null && count !== void 0 ? count : ContinuousScale.defaultTickCount;
        const target = Math.abs(stop - start) / Math.max(tickCount, 1);
        let i = 0;
        while (i < tickIntervals.length && target > tickIntervals[i][2]) {
            i++;
        }
        if (i === 0) {
            step = Math.max(tickStep(start, stop, tickCount, minCount, maxCount), 1);
            countableTimeInterval = this.millisecond;
        }
        else if (i === tickIntervals.length) {
            const y0 = start / durationYear;
            const y1 = stop / durationYear;
            step = tickStep(y0, y1, tickCount, minCount, maxCount);
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
        if (interval instanceof TimeInterval) {
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
        return specifier == undefined ? this.defaultTickFormat(ticks) : buildFormatter(specifier);
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
        if (interval instanceof TimeInterval) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGltZVNjYWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3NjYWxlL3RpbWVTY2FsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFDcEQsT0FBTyxlQUFlLE1BQU0sMEJBQTBCLENBQUM7QUFDdkQsT0FBTyxVQUFVLE1BQU0scUJBQXFCLENBQUM7QUFDN0MsT0FBTyxVQUFVLE1BQU0scUJBQXFCLENBQUM7QUFDN0MsT0FBTyxRQUFRLE1BQU0sbUJBQW1CLENBQUM7QUFDekMsT0FBTyxPQUFPLE1BQU0sa0JBQWtCLENBQUM7QUFDdkMsT0FBTyxRQUFRLE1BQU0sbUJBQW1CLENBQUM7QUFDekMsT0FBTyxTQUFTLE1BQU0sb0JBQW9CLENBQUM7QUFDM0MsT0FBTyxRQUFRLE1BQU0sbUJBQW1CLENBQUM7QUFDekMsT0FBTyxFQUNILGNBQWMsRUFDZCxjQUFjLEVBQ2QsWUFBWSxFQUNaLFdBQVcsRUFDWCxZQUFZLEVBQ1osYUFBYSxFQUNiLFlBQVksR0FDZixNQUFNLHVCQUF1QixDQUFDO0FBQy9CLE9BQU8sRUFBeUIsWUFBWSxFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFDNUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUN6QyxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFFcEQsSUFBSyxrQkFVSjtBQVZELFdBQUssa0JBQWtCO0lBQ25CLHlFQUFXLENBQUE7SUFDWCwrREFBTSxDQUFBO0lBQ04sK0RBQU0sQ0FBQTtJQUNOLDJEQUFJLENBQUE7SUFDSixtRUFBUSxDQUFBO0lBQ1IseUVBQVcsQ0FBQTtJQUNYLDZEQUFLLENBQUE7SUFDTCx1RUFBVSxDQUFBO0lBQ1YsMkRBQUksQ0FBQTtBQUNSLENBQUMsRUFWSSxrQkFBa0IsS0FBbEIsa0JBQWtCLFFBVXRCO0FBRUQsTUFBTSxhQUFhLEdBQXVD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