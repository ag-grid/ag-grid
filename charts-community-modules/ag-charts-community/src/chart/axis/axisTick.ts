import type { Scale } from '../../scale/scale';
import {
    AND,
    BOOLEAN,
    NUMBER,
    LESS_THAN,
    NUMBER_OR_NAN,
    OPT_ARRAY,
    OPT_COLOR_STRING,
    OPTIONAL,
    predicateWithMessage,
    Validate,
} from '../../util/validation';
import { Default } from '../../util/default';
import { Deprecated } from '../../util/deprecation';
import type { TimeScale } from '../../scale/timeScale';
import { TimeInterval } from '../../util/time/interval';

export type TickInterval<S> = S extends TimeScale ? number | TimeInterval : number;

export type TickCount<S> = S extends TimeScale ? number | TimeInterval : number;

const TICK_COUNT = predicateWithMessage(
    (v: any, ctx) => NUMBER(0)(v, ctx) || v instanceof TimeInterval,
    `expecting a tick count Number value or, for a time axis, a Time Interval such as 'agCharts.time.month'`
);
const OPT_TICK_COUNT = predicateWithMessage(
    (v: any, ctx) => OPTIONAL(v, ctx, TICK_COUNT),
    `expecting an optional tick count Number value or, for a time axis, a Time Interval such as 'agCharts.time.month'`
);

const OPT_TICK_INTERVAL = predicateWithMessage(
    (v: any, ctx) => OPTIONAL(v, ctx, (v: any, ctx) => (v !== 0 && NUMBER(0)(v, ctx)) || v instanceof TimeInterval),
    `expecting an optional non-zero positive Number value or, for a time axis, a Time Interval such as 'agCharts.time.month'`
);

export class AxisTick<S extends Scale<D, number, I>, D = any, I = any> {
    @Validate(BOOLEAN)
    enabled = true;

    /**
     * The line width to be used by axis ticks.
     */
    @Validate(NUMBER(0))
    width: number = 1;

    /**
     * The line length to be used by axis ticks.
     */
    @Validate(NUMBER(0))
    size: number = 6;

    /**
     * The color of the axis ticks.
     * Use `undefined` rather than `rgba(0, 0, 0, 0)` to make the ticks invisible.
     */
    @Validate(OPT_COLOR_STRING)
    color?: string = 'rgba(195, 195, 195, 1)';

    /**
     * A hint of how many ticks to use (the exact number of ticks might differ),
     * a `TimeInterval` or a `CountableTimeInterval`.
     * For example:
     *
     *     axis.tick.count = 5;
     *     axis.tick.count = year;
     *     axis.tick.count = month.every(6);
     */
    @Validate(OPT_TICK_COUNT)
    @Deprecated('Use tick.interval or tick.minSpacing and tick.maxSpacing instead')
    count?: TickCount<S> = undefined;

    @Validate(OPT_TICK_INTERVAL)
    interval?: TickInterval<S> = undefined;

    @Validate(OPT_ARRAY())
    values?: any[] = undefined;

    @Validate(AND(NUMBER_OR_NAN(1), LESS_THAN('maxSpacing')))
    @Default(NaN)
    minSpacing: number = NaN;

    // Maybe initialised and validated in sub-classes - DO NOT ASSIGN A VALUE HERE.
    maxSpacing?: number;
}
