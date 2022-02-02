declare type FloorFn = (date: Date) => void;
declare type OffsetFn = (date: Date, step: number) => void;
declare type CountFn = (start: Date, end: Date) => number;
declare type FieldFn = (date: Date) => number;
/**
 * The interval methods don't mutate Date parameters.
 */
export declare class TimeInterval {
    protected readonly _floor: FloorFn;
    protected readonly _offset: OffsetFn;
    constructor(floor: FloorFn, offset: OffsetFn);
    /**
     * Returns a new date representing the latest interval boundary date before or equal to date.
     * For example, `day.floor(date)` typically returns 12:00 AM local time on the given date.
     * @param date
     */
    floor(date: Date | number): Date;
    /**
     * Returns a new date representing the earliest interval boundary date after or equal to date.
     * @param date
     */
    ceil(date: Date | number): Date;
    /**
     * Returns a new date representing the closest interval boundary date to date.
     * @param date
     */
    round(date: Date | number): Date;
    /**
     * Returns a new date equal to date plus step intervals.
     * @param date
     * @param step
     */
    offset(date: Date | number, step?: number): Date;
    /**
     * Returns an array of dates representing every interval boundary after or equal to start (inclusive) and before stop (exclusive).
     * @param start
     * @param stop
     * @param step
     */
    range(start: Date, stop: Date, step?: number): Date[];
    filter(test: (date: Date) => boolean): TimeInterval;
}
export declare class CountableTimeInterval extends TimeInterval {
    private readonly _count;
    private readonly _field?;
    constructor(floor: FloorFn, offset: OffsetFn, count: CountFn, field?: FieldFn);
    /**
     * Returns the number of interval boundaries after start (exclusive) and before or equal to end (inclusive).
     * @param start
     * @param end
     */
    count(start: Date | number, end: Date | number): number;
    /**
     * Returns a filtered view of this interval representing every step'th date.
     * The meaning of step is dependent on this interval’s parent interval as defined by the `field` function.
     * @param step
     */
    every(step: number): TimeInterval | undefined;
}
export {};
