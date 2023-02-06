import { ContinuousScale } from './continuousScale';
import timeMillisecond from '../util/time/millisecond';
import timeSecond from '../util/time/second';
import timeMinute from '../util/time/minute';
import timeHour from '../util/time/hour';
import timeDay from '../util/time/day';
import timeWeek from '../util/time/week';
import timeMonth from '../util/time/month';
import timeYear from '../util/time/year';
import {
    durationSecond,
    durationMinute,
    durationHour,
    durationDay,
    durationWeek,
    durationMonth,
    durationYear,
} from '../util/time/duration';
import { CountableTimeInterval, TimeInterval } from '../util/time/interval';
import { tickStep } from '../util/ticks';
import { buildFormatter } from '../util/timeFormat';

enum DefaultTimeFormats {
    MILLISECOND,
    SECOND,
    MINUTE,
    HOUR,
    WEEK_DAY,
    SHORT_MONTH,
    MONTH,
    SHORT_YEAR,
    YEAR,
}

const formatStrings: Record<DefaultTimeFormats, string> = {
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

function toNumber(x: any) {
    return x instanceof Date ? x.getTime() : x;
}

export class TimeScale extends ContinuousScale {
    readonly type = 'time';

    domain: Date[] = [new Date(2022, 11, 7), new Date(2022, 11, 8)];
    interval?: TimeInterval | number;
    protected cacheProps: Array<keyof this> = ['domain', 'range', 'nice', 'tickCount', 'interval'];

    private year: CountableTimeInterval = timeYear;
    private month: CountableTimeInterval = timeMonth;
    private week: CountableTimeInterval = timeWeek;
    private day: CountableTimeInterval = timeDay;
    private hour: CountableTimeInterval = timeHour;
    private minute: CountableTimeInterval = timeMinute;
    private second: CountableTimeInterval = timeSecond;
    private millisecond: CountableTimeInterval = timeMillisecond;

    /**
     * Array of default tick intervals in the following format:
     *
     *     [
     *         interval (unit of time),
     *         number of units (step),
     *         the length of that number of units in milliseconds
     *     ]
     */
    private tickIntervals: [CountableTimeInterval, number, number][] = [
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

    calculateDefaultTickFormat(ticks: any[] | undefined = []) {
        let defaultTimeFormat = DefaultTimeFormats.YEAR as DefaultTimeFormats;

        const updateFormat = (format: DefaultTimeFormats) => {
            if (format < defaultTimeFormat) {
                defaultTimeFormat = format;
            }
        };

        for (let value of ticks) {
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

    buildFormatString(defaultTimeFormat: DefaultTimeFormats, yearChange: boolean): string {
        let formatStringArray: string[] = [formatStrings[defaultTimeFormat]];
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

    getLowestGranularityFormat(value: Date | number): DefaultTimeFormats {
        if (this.second.floor(value) < value) {
            return DefaultTimeFormats.MILLISECOND;
        } else if (this.minute.floor(value) < value) {
            return DefaultTimeFormats.SECOND;
        } else if (this.hour.floor(value) < value) {
            return DefaultTimeFormats.MINUTE;
        } else if (this.day.floor(value) < value) {
            return DefaultTimeFormats.HOUR;
        } else if (this.month.floor(value) < value) {
            if (this.week.floor(value) < value) {
                return DefaultTimeFormats.WEEK_DAY;
            }
            return DefaultTimeFormats.SHORT_MONTH;
        } else if (this.year.floor(value) < value) {
            return DefaultTimeFormats.MONTH;
        }

        return DefaultTimeFormats.YEAR;
    }

    defaultTickFormat(ticks?: any[]) {
        const formatString = this.calculateDefaultTickFormat(ticks);
        return (date: Date) => buildFormatter(formatString)(date);
    }

    /**
     * @param start The start time (timestamp).
     * @param stop The end time (timestamp).
     * @param step Number of intervals between ticks.
     */
    private getTickInterval({
        start,
        stop,
        count,
    }: {
        start: number;
        stop: number;
        count: number;
    }): CountableTimeInterval | TimeInterval | undefined {
        const { tickIntervals } = this;

        let countableTimeInterval;
        let step;

        const tickCount = count ?? 10;
        const target = Math.abs(stop - start) / Math.max(tickCount - 1, 1);
        let i = 0;
        while (i < tickIntervals.length && target > tickIntervals[i][2]) {
            i++;
        }

        if (i === 0) {
            step = Math.max(tickStep(start, stop, tickCount), 1);
            countableTimeInterval = this.millisecond;
        } else if (i === tickIntervals.length) {
            const y0 = start / durationYear;
            const y1 = stop / durationYear;
            step = tickStep(y0, y1, tickCount);
            countableTimeInterval = this.year;
        } else {
            const diff0 = target - tickIntervals[i - 1][2];
            const diff1 = tickIntervals[i][2] - target;
            const index = diff0 < diff1 ? i - 1 : i;
            [countableTimeInterval, step] = tickIntervals[index];
        }

        return countableTimeInterval.every(step);
    }

    invert(y: number): Date {
        return new Date(super.invert(y));
    }

    /**
     * Returns uniformly-spaced dates that represent the scale's domain.
     */
    ticks(): Date[] {
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

        if (this.interval !== undefined) {
            return this.getTicks({ start: t0, stop: t1 });
        }

        const t = this.getTickInterval({ start: t0, stop: t1, count: this.tickCount });
        return t ? t.range(new Date(t0 - 1), new Date(t1 + 1)) : []; // inclusive stop
    }

    getTicks({ start, stop }: { start: number; stop: number }): Date[] {
        const { interval, tickIntervals } = this;

        if (!interval) {
            return [];
        }

        if (interval instanceof TimeInterval) {
            return interval.range(new Date(start), new Date(stop));
        }

        const absInterval = Math.abs(interval);

        if (this.isDenseInterval({ start, stop, interval: absInterval })) {
            return [];
        }

        const timeInterval = tickIntervals.reverse().find((tickInterval) => absInterval % tickInterval[2] === 0);

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
    tickFormat({ ticks, specifier }: { ticks?: any[]; specifier?: string }): (date: Date) => string {
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
    protected updateNiceDomain(): void {
        const [d0, d1] = this.domain;
        const start = toNumber(d0);
        const stop = toNumber(d1);

        const { interval } = this;
        let i;

        if (interval instanceof TimeInterval) {
            i = interval;
        } else {
            const tickCount = typeof interval === 'number' ? (stop - start) / Math.max(interval, 1) : this.tickCount;
            i = this.getTickInterval({ start, stop, count: tickCount });
        }

        if (i) {
            const intervalRange = i.range(d0, d1, true);
            const n0 = intervalRange[0];
            const n1 = intervalRange[intervalRange.length - 1];
            this.niceDomain = [n0, n1];
        }
    }
}
