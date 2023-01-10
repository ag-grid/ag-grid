import { ContinuousScale } from './continuousScale';
import { CountableTimeInterval } from '../util/time/interval';
export declare class TimeScale extends ContinuousScale {
    readonly type = "time";
    domain: Date[];
    tickInterval: CountableTimeInterval | undefined;
    protected cacheProps: Array<keyof this>;
    private year;
    private month;
    private week;
    private day;
    private hour;
    private minute;
    private second;
    private millisecond;
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
    calculateDefaultTickFormat(ticks?: any[]): string;
    defaultTickFormat(ticks?: any[]): (date: Date) => string;
    /**
     * @param start The start time (timestamp).
     * @param stop The end time (timestamp).
     * @param step Number of intervals between ticks.
     */
    private getTickInterval;
    invert(y: number): Date;
    /**
     * Returns uniformly-spaced dates that represent the scale's domain.
     */
    ticks(): Date[];
    /**
     * Returns a time format function suitable for displaying tick values.
     * @param specifier If the specifier string is provided, this method is equivalent to
     * the {@link TimeLocaleObject.format} method.
     * If no specifier is provided, this method returns the default time format function.
     */
    tickFormat({ ticks, specifier }: {
        ticks?: any[];
        specifier?: string;
    }): (date: Date) => string;
    update(): void;
    /**
     * Extends the domain so that it starts and ends on nice round values.
     * This method typically modifies the scale’s domain, and may only extend the bounds to the nearest round value.
     */
    protected updateNiceDomain(): void;
}
