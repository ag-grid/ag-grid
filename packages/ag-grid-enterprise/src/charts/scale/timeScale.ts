// import { LinearScale } from "./linearScale";
import ContinuousScale from "./continuousScale";
import second from "../util/time/second";
import minute from "../util/time/minute";
import hour from "../util/time/hour";
import day from "../util/time/day";
import week from "../util/time/week";
import month from "../util/time/month";
import year from "../util/time/year";
import {
    durationSecond,
    durationMinute,
    durationHour,
    durationDay,
    durationWeek,
    durationMonth,
    durationYear
} from "../util/time/duration";

const tickIntervals = [
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

// export class TimeScale<R> extends ContinuousScale<R> {
//
// }
