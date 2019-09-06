import { LinearScale, numberDeinterpolatorFactory, numberReinterpolatorFactory } from "./linearScale";
import ContinuousScale, { identity } from "./continuousScale";
import timeMillisecond from "../util/time/millisecond";
import timeSecond from "../util/time/second";
import timeMinute from "../util/time/minute";
import timeHour from "../util/time/hour";
import timeDay from "../util/time/day";
import timeWeek from "../util/time/week";
import timeMonth from "../util/time/month";
import timeYear from "../util/time/year";
import {
    durationSecond,
    durationMinute,
    durationHour,
    durationDay,
    durationWeek,
    durationMonth,
    durationYear
} from "../util/time/duration";
import { CountableTimeInterval, TimeInterval } from "../util/time/interval";
import { complexBisectRight } from "../util/bisect";
import { tickStep } from "../util/ticks";
import { Deinterpolator, Reinterpolator } from "./scale";
import { ascending } from "../util/compare";
import { locale } from "../util/time/format/defaultLocale";


export function calendar(
    year: CountableTimeInterval,
    month: CountableTimeInterval,
    week: CountableTimeInterval,
    day: CountableTimeInterval,
    hour: CountableTimeInterval,
    minute: CountableTimeInterval,
    second: CountableTimeInterval,
    millisecond: CountableTimeInterval,
    format: (specifier: string) => (date: Date) => string
) {
    // var scale = continuous(identity, identity),
    //     invert = scale.invert,
    //     domain = scale.domain;

    const formatMillisecond = format('.%L');
    const formatSecond = format(':%S');
    const formatMinute = format('%I:%M');
    const formatHour = format('%I %p');
    const formatDay = format('%a %d');
    const formatWeek = format('%b %d');
    const formatMonth = format('%B');
    const formatYear = format('%Y');

    const tickIntervals: [CountableTimeInterval, number, number][] = [
        [second,  1,      durationSecond],
        [second,  5,  5 * durationSecond],
        [second, 15, 15 * durationSecond],
        [second, 30, 30 * durationSecond],
        [minute,  1,      durationMinute],
        [minute,  5,  5 * durationMinute],
        [minute, 15, 15 * durationMinute],
        [minute, 30, 30 * durationMinute],
        [  hour,  1,      durationHour  ],
        [  hour,  3,  3 * durationHour  ],
        [  hour,  6,  6 * durationHour  ],
        [  hour, 12, 12 * durationHour  ],
        [   day,  1,      durationDay   ],
        [   day,  2,  2 * durationDay   ],
        [  week,  1,      durationWeek  ],
        [ month,  1,      durationMonth ],
        [ month,  3,  3 * durationMonth ],
        [  year,  1,      durationYear  ]
    ];

    function tickFormat(date: Date) {
        return (second.floor(date) < date
            ? formatMillisecond
            : minute.floor(date) < date
                ? formatSecond
                : hour.floor(date) < date
                    ? formatMinute
                    : day.floor(date) < date
                        ? formatHour
                        : month.floor(date) < date
                            ? (week.floor(date) < date ? formatDay : formatWeek)
                            : year.floor(date) < date
                                ? formatMonth
                                : formatYear)(date);
    }

    function tickInterval(interval: number | CountableTimeInterval = 10, start: number, stop: number, step?: number): CountableTimeInterval | TimeInterval | undefined {
        // If a desired tick count is specified, pick a reasonable tick interval
        // based on the extent of the domain and a rough estimate of tick size.
        // Otherwise, assume interval is already a time interval and use it.
        if (typeof interval === 'number') {
            const target = Math.abs(stop - start) / interval;
            const i = complexBisectRight(tickIntervals, target, interval => interval[2]);
            if (i === tickIntervals.length) {
                step = tickStep(start / durationYear, stop / durationYear, interval);
                interval = year;
            } else if (i) {
                [interval, step] = tickIntervals[target / tickIntervals[i - 1][2] < tickIntervals[i][2] / target ? i - 1 : i];
            } else {
                step = Math.max(tickStep(start, stop, interval), 1);
                interval = millisecond;
            }
        }

        return step == undefined ? interval : interval.every(step);
    }

    // scale.invert = y => new Date(invert(y));
    //
    // scale.domain = function(_) {
    //     return arguments.length ? domain(map.call(_, number)) : domain().map(date);
    // };
    //
    // scale.ticks = function(interval: number | CountableTimeInterval = 10, step?: number) {
    //     let d = domain();
    //     let t0 = d[0];
    //     let t1 = d[d.length - 1];
    //     let r = t1 < t0;
    //     let t;
    //
    //     if (r) {
    //         t = t0;
    //         t0 = t1;
    //         t1 = t;
    //     }
    //     t = tickInterval(interval, t0, t1, step);
    //     t = t ? t.range(t0, t1 + 1) : []; // inclusive stop
    //
    //     return r ? t.reverse() : t;
    // };
    //
    // scale.tickFormat = function(count, specifier) {
    //     return specifier == null ? tickFormat : format(specifier);
    // };
    //
    // scale.nice = function(interval, step) {
    //     var d = domain();
    //     return (interval = tickInterval(interval, d[0], d[d.length - 1], step))
    //         ? domain(nice(d, interval))
    //         : scale;
    // };
    //
    // scale.copy = function() {
    //     return copy(scale, calendar(timeYear, timeMonth, timeWeek, timeDay, timeHour, timeMinute, timeSecond, timeMillisecond, format));
    // };
    //
    // return scale;
}

// export class TimeScale extends ContinuousScale {
//
//     private year: CountableTimeInterval = timeYear;
//     private month: CountableTimeInterval = timeMonth;
//     private week: CountableTimeInterval = timeWeek;
//     private day: CountableTimeInterval = timeDay;
//     private hour: CountableTimeInterval = timeHour;
//     private minute: CountableTimeInterval = timeMinute;
//     private second: CountableTimeInterval = timeSecond;
//     private millisecond: CountableTimeInterval = timeMillisecond;
//     private format: (specifier: string) => (date: Date) => string = locale.format;
//
//     private tickIntervals: [CountableTimeInterval, number, number][] = [
//         [this.second,  1,      durationSecond],
//         [this.second,  5,  5 * durationSecond],
//         [this.second, 15, 15 * durationSecond],
//         [this.second, 30, 30 * durationSecond],
//         [this.minute,  1,      durationMinute],
//         [this.minute,  5,  5 * durationMinute],
//         [this.minute, 15, 15 * durationMinute],
//         [this.minute, 30, 30 * durationMinute],
//         [  this.hour,  1,      durationHour  ],
//         [  this.hour,  3,  3 * durationHour  ],
//         [  this.hour,  6,  6 * durationHour  ],
//         [  this.hour, 12, 12 * durationHour  ],
//         [   this.day,  1,      durationDay   ],
//         [   this.day,  2,  2 * durationDay   ],
//         [  this.week,  1,      durationWeek  ],
//         [ this.month,  1,      durationMonth ],
//         [ this.month,  3,  3 * durationMonth ],
//         [  this.year,  1,      durationYear  ]
//     ];
//
//     private formatMillisecond = this.format('.%L');
//     private formatSecond = this.format(':%S');
//     private formatMinute = this.format('%I:%M');
//     private formatHour = this.format('%I %p');
//     private formatDay = this.format('%a %d');
//     private formatWeek = this.format('%b %d');
//     private formatMonth = this.format('%B');
//     private formatYear = this.format('%Y');
//
//     tickFormat(date: Date) {
//         return (this.second.floor(date) < date
//             ? this.formatMillisecond
//             : this.minute.floor(date) < date
//                 ? this.formatSecond
//                 : this.hour.floor(date) < date
//                     ? this.formatMinute
//                     : this.day.floor(date) < date
//                         ? this.formatHour
//                         : this.month.floor(date) < date
//                             ? (this.week.floor(date) < date ? this.formatDay : this.formatWeek)
//                             : this.year.floor(date) < date
//                                 ? this.formatMonth
//                                 : this.formatYear)(date);
//     }
//
//     tickInterval(interval: number | CountableTimeInterval = 10, start: number, stop: number, step?: number): CountableTimeInterval | TimeInterval | undefined {
//         // If a desired tick count is specified, pick a reasonable tick interval
//         // based on the extent of the domain and a rough estimate of tick size.
//         // Otherwise, assume interval is already a time interval and use it.
//         const tickIntervals = this.tickIntervals;
//         if (typeof interval === 'number') {
//             const target = Math.abs(stop - start) / interval;
//             const i = complexBisectRight(tickIntervals, target, interval => interval[2]);
//             if (i === tickIntervals.length) {
//                 step = tickStep(start / durationYear, stop / durationYear, interval);
//                 interval = this.year;
//             } else if (i) {
//                 [interval, step] = tickIntervals[target / tickIntervals[i - 1][2] < tickIntervals[i][2] / target ? i - 1 : i];
//             } else {
//                 step = Math.max(tickStep(start, stop, interval), 1);
//                 interval = this.millisecond;
//             }
//         }
//
//         return step == undefined ? interval : interval.every(step);
//     }
//
//     set domain(values: Date[]) {
//         super.setDomain(Array.prototype.map.call(values, (t: any) => t instanceof Date ? +t : +new Date(+t)));
//     }
//     get domain(): Date[] {
//         return super.getDomain().map(t => new Date(t));
//     }
//
//     invert(y: number): Date {
//         return new Date(super.invert(y));
//     }
//
//     ticks(interval: number = 10, step?: number) {
//         const d = super.getDomain();
//         let t0 = d[0];
//         let t1 = d[d.length - 1];
//         const reverse = t1 < t0;
//
//         if (reverse) {
//             const _ = t0;
//             t0 = t1;
//             t1 = _;
//         }
//         const t = this.tickInterval(interval, t0, t1, step);
//         const i = t ? t.range(t0, t1 + 1) : []; // inclusive stop
//         return reverse ? i.reverse() : i;
//     }
// }

// export default function scaleTime() {
//     const scale = new TimeScale();
//     scale.domain = [new Date(2000, 0, 1), new Date(2000, 0, 2)];
//     scale.range = [0, 1];
//     return scale;
// }
