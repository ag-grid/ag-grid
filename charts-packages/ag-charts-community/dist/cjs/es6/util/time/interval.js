"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const t0 = new Date();
const t1 = new Date();
/**
 * The interval methods don't mutate Date parameters.
 */
class TimeInterval {
    constructor(floor, offset) {
        this._floor = floor;
        this._offset = offset;
    }
    /**
     * Returns a new date representing the latest interval boundary date before or equal to date.
     * For example, `day.floor(date)` typically returns 12:00 AM local time on the given date.
     * @param date
     */
    floor(date) {
        date = new Date(+date);
        this._floor(date);
        return date;
    }
    /**
     * Returns a new date representing the earliest interval boundary date after or equal to date.
     * @param date
     */
    ceil(date) {
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
    round(date) {
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
    offset(date, step = 1) {
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
    range(start, stop, step = 1) {
        const range = [];
        start = this.ceil(start);
        step = Math.floor(step);
        if (start > stop || step <= 0) {
            return range;
        }
        let previous;
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
    filter(test) {
        const floor = (date) => {
            if (date >= date) {
                this._floor(date);
                while (!test(date)) {
                    date.setTime(date.getTime() - 1);
                    this._floor(date);
                }
            }
            return date;
        };
        const offset = (date, step) => {
            if (date >= date) {
                if (step < 0) {
                    while (++step <= 0) {
                        do {
                            this._offset(date, -1);
                        } while (!test(date));
                    }
                }
                else {
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
exports.TimeInterval = TimeInterval;
class CountableTimeInterval extends TimeInterval {
    constructor(floor, offset, count, field) {
        super(floor, offset);
        this._count = count;
        this._field = field;
    }
    /**
     * Returns the number of interval boundaries after start (exclusive) and before or equal to end (inclusive).
     * @param start
     * @param end
     */
    count(start, end) {
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
    every(step) {
        let result;
        step = Math.floor(step);
        if (isFinite(step) && step > 0) {
            if (step > 1) {
                const field = this._field;
                if (field) {
                    result = this.filter((d) => field(d) % step === 0);
                }
                else {
                    result = this.filter((d) => this.count(0, d) % step === 0);
                }
            }
            else {
                result = this;
            }
        }
        return result;
    }
}
exports.CountableTimeInterval = CountableTimeInterval;
