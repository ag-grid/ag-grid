type FloorFn = (date: Date) => void; // mutates the passed date
type OffsetFn = (date: Date, step: number) => void; // mutates the passed date
/** A function to test if a date tick corresponds to a given step. */
type StepTestFn = (date: Date, step: number) => boolean;

/**
 * The interval methods don't mutate Date parameters.
 */
export class TimeInterval {
    protected readonly _floor: FloorFn;
    protected readonly _offset: OffsetFn;

    constructor(floor: FloorFn, offset: OffsetFn) {
        this._floor = floor;
        this._offset = offset;
    }

    /**
     * Returns a new date representing the latest interval boundary date before or equal to date.
     * For example, `day.floor(date)` typically returns 12:00 AM local time on the given date.
     * @param date
     */
    floor(date: Date | number): Date {
        const result = new Date(date);
        this._floor(result);
        return result;
    }

    /**
     * Returns a new date representing the earliest interval boundary date after or equal to date.
     * @param date
     */
    ceil(date: Date | number): Date {
        const result = new Date(Number(date) - 1);
        this._floor(result);
        this._offset(result, 1);
        return result;
    }

    /**
     * Returns an array of dates representing every interval boundary after or equal to start (inclusive) and before stop (exclusive).
     * @param start
     * @param stop
     */
    range(start: Date, stop: Date): Date[] {
        let date = this.ceil(start);
        const range: Date[] = [];

        while (date <= stop) {
            range.push(date);
            date = new Date(date);
            this._offset(date, 1);
        }

        return range;
    }
}

export class CountableTimeInterval extends TimeInterval {
    private readonly _stepTest: StepTestFn;

    constructor(floor: FloorFn, offset: OffsetFn, stepTest: StepTestFn) {
        super(floor, offset);
        this._stepTest = stepTest;
    }

    /**
     * Returns a filtered view of this interval representing every step'th date.
     * It can be a number of minutes, hours, days etc.
     * Must be a positive integer.
     * @param step
     */
    every(step: number): TimeInterval {
        const test = this._stepTest;
        const floor = (date: Date): Date => {
            this._floor(date);
            while (!test(date, step)) {
                date.setTime(date.getTime() - 1);
                this._floor(date);
            }
            return date;
        };
        const offset = (date: Date): Date => {
            this._offset(date, step);
            return date;
        };
        return new TimeInterval(floor, offset);
    }
}
