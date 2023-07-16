import type { Scale } from '../../scale/scale';
import type { TimeScale } from '../../scale/timeScale';
import { TimeInterval } from '../../util/time/interval';
export declare type TickInterval<S> = S extends TimeScale ? number | TimeInterval : number;
export declare type TickCount<S> = S extends TimeScale ? number | TimeInterval : number;
export declare class AxisTick<S extends Scale<D, number, I>, D = any, I = any> {
    enabled: boolean;
    /**
     * The line width to be used by axis ticks.
     */
    width: number;
    /**
     * The line length to be used by axis ticks.
     */
    size: number;
    /**
     * The color of the axis ticks.
     * Use `undefined` rather than `rgba(0, 0, 0, 0)` to make the ticks invisible.
     */
    color?: string;
    /**
     * A hint of how many ticks to use (the exact number of ticks might differ),
     * a `TimeInterval` or a `CountableTimeInterval`.
     * For example:
     *
     *     axis.tick.count = 5;
     *     axis.tick.count = year;
     *     axis.tick.count = month.every(6);
     */
    count?: TickCount<S>;
    interval?: TickInterval<S>;
    values?: any[];
    minSpacing: number;
    maxSpacing?: number;
}
//# sourceMappingURL=axisTick.d.ts.map