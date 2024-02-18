import { TimeInterval } from '../util/time/interval';
import { ContinuousScale } from './continuousScale';
declare enum DefaultTimeFormats {
    MILLISECOND = 0,
    SECOND = 1,
    MINUTE = 2,
    HOUR = 3,
    WEEK_DAY = 4,
    SHORT_MONTH = 5,
    MONTH = 6,
    SHORT_YEAR = 7,
    YEAR = 8
}
export declare class TimeScale extends ContinuousScale<Date, TimeInterval | number> {
    readonly type = "time";
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
    constructor();
    toDomain(d: number): Date;
    calculateDefaultTickFormat(ticks?: any[] | undefined): string;
    buildFormatString(defaultTimeFormat: DefaultTimeFormats, yearChange: boolean): string;
    getLowestGranularityFormat(value: Date | number): DefaultTimeFormats;
    defaultTickFormat(ticks?: any[]): (date: Date) => string;
    /**
     * @param options Tick interval options.
     * @param options.start The start time (timestamp).
     * @param options.stop The end time (timestamp).
     * @param options.count Number of intervals between ticks.
     */
    private getTickInterval;
    invert(y: number): Date;
    /**
     * Returns uniformly-spaced dates that represent the scale's domain.
     */
    ticks(): Date[];
    private getDefaultTicks;
    private getTicksForInterval;
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
    protected updateNiceDomainIteration(d0: Date, d1: Date): void;
}
export {};
