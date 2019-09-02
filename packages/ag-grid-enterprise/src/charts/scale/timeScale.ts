// import { LinearScale } from "./linearScale";
// import ContinuousScale from "./continuousScale";
// import timeMillisecond from "../util/time/millisecond";
// import timeSecond from "../util/time/second";
// import timeMinute from "../util/time/minute";
// import timeHour from "../util/time/hour";
// import timeDay from "../util/time/day";
// import timeWeek from "../util/time/week";
// import timeMonth from "../util/time/month";
// import timeYear from "../util/time/year";
// import {
//     durationSecond,
//     durationMinute,
//     durationHour,
//     durationDay,
//     durationWeek,
//     durationMonth,
//     durationYear
// } from "../util/time/duration";
// import * as domain from "domain";


// export function calendar(year, month, week, day, hour, minute, second, millisecond, format) {
//     // var scale = continuous(identity, identity),
//     //     invert = scale.invert,
//     //     domain = scale.domain;
//
//     const formatMillisecond = format(".%L");
//     const formatSecond = format(":%S");
//     const formatMinute = format("%I:%M");
//     const formatHour = format("%I %p");
//     const formatDay = format("%a %d");
//     const formatWeek = format("%b %d");
//     const formatMonth = format("%B");
//     const formatYear = format("%Y");
//
//     const tickIntervals = [
//         [second,  1,      durationSecond],
//         [second,  5,  5 * durationSecond],
//         [second, 15, 15 * durationSecond],
//         [second, 30, 30 * durationSecond],
//         [minute,  1,      durationMinute],
//         [minute,  5,  5 * durationMinute],
//         [minute, 15, 15 * durationMinute],
//         [minute, 30, 30 * durationMinute],
//         [  hour,  1,      durationHour  ],
//         [  hour,  3,  3 * durationHour  ],
//         [  hour,  6,  6 * durationHour  ],
//         [  hour, 12, 12 * durationHour  ],
//         [   day,  1,      durationDay   ],
//         [   day,  2,  2 * durationDay   ],
//         [  week,  1,      durationWeek  ],
//         [ month,  1,      durationMonth ],
//         [ month,  3,  3 * durationMonth ],
//         [  year,  1,      durationYear  ]
//     ];
//
//     function tickFormat(date: Date) {
//         return (second.floor(date) < date ? formatMillisecond
//             : minute.floor(date) < date ? formatSecond
//                 : hour.floor(date) < date ? formatMinute
//                     : day.floor(date) < date ? formatHour
//                         : month.floor(date) < date ? (week(date) < date ? formatDay : formatWeek)
//                             : year.floor(date) < date ? formatMonth
//                                 : formatYear)(date);
//     }
//     }
//
//     function tickInterval(interval, start, stop, step) {
//         if (interval == null) interval = 10;
//
//         // If a desired tick count is specified, pick a reasonable tick interval
//         // based on the extent of the domain and a rough estimate of tick size.
//         // Otherwise, assume interval is already a time interval and use it.
//         if (typeof interval === "number") {
//             var target = Math.abs(stop - start) / interval,
//                 i = bisector(function(i) { return i[2]; }).right(tickIntervals, target);
//             if (i === tickIntervals.length) {
//                 step = tickStep(start / durationYear, stop / durationYear, interval);
//                 interval = year;
//             } else if (i) {
//                 i = tickIntervals[target / tickIntervals[i - 1][2] < tickIntervals[i][2] / target ? i - 1 : i];
//                 step = i[1];
//                 interval = i[0];
//             } else {
//                 step = Math.max(tickStep(start, stop, interval), 1);
//                 interval = millisecond;
//             }
//         }
//
//         return step == null ? interval : interval.every(step);
//     }
//
//     scale.invert = function(y) {
//         return new Date(invert(y));
//     };
//
//     scale.domain = function(_) {
//         return arguments.length ? domain(map.call(_, number)) : domain().map(date);
//     };
//
//     scale.ticks = function(interval, step) {
//         var d = domain(),
//             t0 = d[0],
//             t1 = d[d.length - 1],
//             r = t1 < t0,
//             t;
//         if (r) t = t0, t0 = t1, t1 = t;
//         t = tickInterval(interval, t0, t1, step);
//         t = t ? t.range(t0, t1 + 1) : []; // inclusive stop
//         return r ? t.reverse() : t;
//     };
//
//     scale.tickFormat = function(count, specifier) {
//         return specifier == null ? tickFormat : format(specifier);
//     };
//
//     scale.nice = function(interval, step) {
//         var d = domain();
//         return (interval = tickInterval(interval, d[0], d[d.length - 1], step))
//             ? domain(nice(d, interval))
//             : scale;
//     };
//
//     scale.copy = function() {
//         return copy(scale, calendar(timeYear, timeMonth, timeWeek, timeDay, timeHour, timeMinute, timeSecond, timeMillisecond, format));
//     };
//
//     return scale;
// }

// export class TimeScale<R> extends ContinuousScale<R> {
//
// }
