/**
 * Converts the specified Date into a count of years,
 * days, hours etc. passed since some base date.
 */
type EncodeFn = (date: Date) => number;
/**
 * Converts the count of years, days, hours etc.
 * since a base date into another Date.
 */
type DecodeFn = (encoded: number) => Date;
/**
 * A function to be executed before the range calculation.
 * Returns a callback to be executed after the range calculation.
 */
type RangeFn = (start: Date, end: Date) => () => void;

/**
 * The interval methods don't mutate Date parameters.
 */
export class TimeInterval {
    protected readonly _encode: EncodeFn;
    protected readonly _decode: DecodeFn;
    protected readonly _rangeCallback?: RangeFn;

    constructor(encode: EncodeFn, decode: DecodeFn, rangeCallback?: RangeFn) {
        this._encode = encode;
        this._decode = decode;
        this._rangeCallback = rangeCallback;
    }

    /**
     * Returns a new date representing the latest interval boundary date before or equal to date.
     * For example, `day.floor(date)` typically returns 12:00 AM local time on the given date.
     * @param date
     */
    floor(date: Date | number): Date {
        const d = new Date(date);
        const e = this._encode(d);
        return this._decode(e);
    }

    /**
     * Returns a new date representing the earliest interval boundary date after or equal to date.
     * @param date
     */
    ceil(date: Date | number): Date {
        const d = new Date(Number(date) - 1);
        const e = this._encode(d);
        return this._decode(e + 1);
    }

    /**
     * Returns an array of dates representing every interval boundary after or equal to start (inclusive) and before stop (exclusive).
     * @param start Range start.
     * @param stop Range end.
     * @param extend If specified, the requested range will be extended to the closest "nice" values.
     */
    range(start: Date, stop: Date, extend?: boolean): Date[] {
        const rangeCallback = this._rangeCallback?.(start, stop);

        const e0 = this._encode(extend ? this.floor(start) : this.ceil(start));
        const e1 = this._encode(extend ? this.ceil(stop) : this.floor(stop));
        if (e1 < e0) {
            return [];
        }

        const range: Date[] = [];
        for (let e = e0; e <= e1; e++) {
            const d = this._decode(e);
            range.push(d);
        }

        rangeCallback?.();

        return range;
    }
}

interface CountableTimeIntervalOptions {
    snapTo?: Date | number | 'start' | 'end';
}

export class CountableTimeInterval extends TimeInterval {
    private getOffset(snapTo: Date, step: number) {
        const s = typeof snapTo === 'number' || snapTo instanceof Date ? this._encode(new Date(snapTo)) : 0;
        return Math.floor(s) % step;
    }

    /**
     * Returns a filtered view of this interval representing every step'th date.
     * It can be a number of minutes, hours, days etc.
     * Must be a positive integer.
     * @param step
     */
    every(step: number, options?: CountableTimeIntervalOptions): TimeInterval {
        let offset = 0;
        let rangeCallback: RangeFn | undefined;

        const { snapTo = 'start' } = options ?? {};
        if (typeof snapTo === 'string') {
            const initialOffset = offset;
            rangeCallback = (start, stop) => {
                const s = snapTo === 'start' ? start : stop;
                offset = this.getOffset(s, step);
                return () => (offset = initialOffset);
            };
        } else if (typeof snapTo === 'number') {
            offset = this.getOffset(new Date(snapTo), step);
        } else if (snapTo instanceof Date) {
            offset = this.getOffset(snapTo, step);
        }

        const encode = (date: Date) => {
            const e = this._encode(date);
            return Math.floor((e - offset) / step);
        };

        const decode = (encoded: number) => {
            return this._decode(encoded * step + offset);
        };

        const interval = new TimeInterval(encode, decode, rangeCallback);

        return interval;
    }
}
