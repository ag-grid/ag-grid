import ContinuousScale from "./continuousScale";
import { CountableTimeInterval, TimeInterval } from "../util/time/interval";
export declare class TimeScale extends ContinuousScale {
    private year;
    private month;
    private week;
    private day;
    private hour;
    private minute;
    private second;
    private millisecond;
    private format;
    /**
     * Array of default tick intervals in the following format:
     *
     *     [
     *         interval (unit of time),
     *         number of units (step),
     *         the length of that number of units in milliseconds
     *     ]
     */
    private tickIntervals;
    private formatMillisecond;
    private formatSecond;
    private formatMinute;
    private formatHour;
    private formatDay;
    private formatWeek;
    private formatMonth;
    private formatYear;
    defaultTickFormat(date: Date): string;
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
    tickInterval(interval: number | CountableTimeInterval, start: number, stop: number, step?: number): CountableTimeInterval | TimeInterval | undefined;
    protected _domain: Date[];
    domain: Date[];
    invert(y: number): Date;
    /**
     * Returns uniformly-spaced dates that represent the scale's domain.
     * @param interval The desired tick count or a time interval object.
     */
    ticks(interval?: number | CountableTimeInterval): Date[];
    /**
     * Returns a time format function suitable for displaying tick values.
     * @param count Ignored. Used only to satisfy the {@link Scale} interface.
     * @param specifier If the specifier string is provided, this method is equivalent to
     * the {@link TimeLocaleObject.format} method.
     * If no specifier is provided, this method returns the default time format function.
     */
    tickFormat(count: any, specifier?: string): (date: Date) => string;
    /**
     * Extends the domain so that it starts and ends on nice round values.
     * This method typically modifies the scale’s domain, and may only extend the bounds to the nearest round value.
     * @param interval
     */
    nice(interval?: number | CountableTimeInterval): void;
    private _nice;
}
