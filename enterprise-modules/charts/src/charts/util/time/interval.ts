type FloorFn = (date: Date) => void;                 // mutates the passed date
type OffsetFn = (date: Date, step: number) => void;  // mutates the passed date
type CountFn = (start: Date, end: Date) => number;
// Returns the number of boundaries between this date (exclusive) and the latest previous parent boundary.
// This date is already floored to the current interval.
// For example, for the d3.timeDay interval, this returns the number of days since the start of the month.
type FieldFn = (date: Date) => number;

const t0 = new Date;
const t1 = new Date;

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
        date = new Date(+date);
        this._floor(date);
        return date;
    }

    /**
     * Returns a new date representing the earliest interval boundary date after or equal to date.
     * @param date
     */
    ceil(date: Date | number): Date {
        date = new Date(+date - 1);
        this._floor(date);
        this._offset(date, 1);
        this._floor(date);
        return date;
    }

    /**
     * Returns a new date representing the closest interval boundary date to date.
     * @param date
     */
    round(date: Date | number): Date {
        const d0 = this.floor(date);
        const d1 = this.ceil(date);
        const ms = +date;
        return ms - d0.getTime() < d1.getTime() - ms ? d0 : d1;
    }

    /**
     * Returns a new date equal to date plus step intervals.
     * @param date
     * @param step
     */
    offset(date: Date | number, step: number = 1): Date {
        date = new Date(+date);
        this._offset(date, Math.floor(step));
        return date;
    }

    /**
     * Returns an array of dates representing every interval boundary after or equal to start (inclusive) and before stop (exclusive).
     * @param start
     * @param stop
     * @param step
     */
    range(start: Date, stop: Date, step: number = 1): Date[] {
        const range: Date[] = [];

        start = this.ceil(start);
        step = Math.floor(step);
        if (start > stop || step <= 0) {
            return range;
        }

        let previous: Date;
        do {
            previous = new Date(+start);
            range.push(previous);
            this._offset(start, step);
            this._floor(start);
        } while (previous < start && start < stop);

        return range;
    }

    // Returns an interval that is a subset of this interval.
    // For example, to create an interval that return 1st, 11th, 21st and 31st of each month:
    // day.filter(date => (date.getDate() - 1) % 10 === 0)
    filter(test: (date: Date) => boolean): TimeInterval {
        const floor = (date: Date): Date => {
            if (date >= date) {
                while (this._floor(date), !test(date)) {
                    date.setTime(date.getTime() - 1);
                }
            }
            return date;
        };
        const offset = (date: Date, step: number): Date => {
            if (date >= date) {
                if (step < 0) {
                    while (++step <= 0) {
                        do {
                            this._offset(date, -1);
                        } while (!test(date));
                    }
                } else {
                    while (--step >= 0) {
                        do {
                            this._offset(date, 1);
                        } while (!test(date));
                    }
                }
            }
            return date;
        };
        return new TimeInterval(floor, offset);
    }
}

export class CountableTimeInterval extends TimeInterval {

    private readonly _count: CountFn;
    private readonly _field?: FieldFn;

    constructor(floor: FloorFn, offset: OffsetFn, count: CountFn, field?: FieldFn) {
        super(floor, offset);

        this._count = count;
        this._field = field;
    }

    /**
     * Returns the number of interval boundaries after start (exclusive) and before or equal to end (inclusive).
     * @param start
     * @param end
     */
    count(start: Date | number, end: Date | number): number {
        t0.setTime(+start);
        t1.setTime(+end);
        this._floor(t0);
        this._floor(t1);
        return Math.floor(this._count(t0, t1));
    }

    /**
     * Returns a filtered view of this interval representing every step'th date.
     * The meaning of step is dependent on this interval’s parent interval as defined by the `field` function.
     * @param step
     */
    every(step: number): TimeInterval | undefined {
        let result: TimeInterval | undefined;

        step = Math.floor(step);
        if (isFinite(step) && step > 0) {
            if (step > 1) {
                const field = this._field;
                if (field) {
                    result = this.filter(d => field(d) % step === 0);
                } else {
                    result = this.filter(d => this.count(0, d) % step === 0);
                }
            } else {
                result = this;
            }
        }

        return result;
    }
}
