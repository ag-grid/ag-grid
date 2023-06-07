/**
 * The interval methods don't mutate Date parameters.
 */
export class TimeInterval {
    constructor(encode, decode, rangeCallback) {
        this._encode = encode;
        this._decode = decode;
        this._rangeCallback = rangeCallback;
    }
    /**
     * Returns a new date representing the latest interval boundary date before or equal to date.
     * For example, `day.floor(date)` typically returns 12:00 AM local time on the given date.
     * @param date
     */
    floor(date) {
        const d = new Date(date);
        const e = this._encode(d);
        return this._decode(e);
    }
    /**
     * Returns a new date representing the earliest interval boundary date after or equal to date.
     * @param date
     */
    ceil(date) {
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
    range(start, stop, extend) {
        var _a;
        const rangeCallback = (_a = this._rangeCallback) === null || _a === void 0 ? void 0 : _a.call(this, start, stop);
        const e0 = this._encode(extend ? this.floor(start) : this.ceil(start));
        const e1 = this._encode(extend ? this.ceil(stop) : this.floor(stop));
        if (e1 < e0) {
            return [];
        }
        const range = [];
        for (let e = e0; e <= e1; e++) {
            const d = this._decode(e);
            range.push(d);
        }
        rangeCallback === null || rangeCallback === void 0 ? void 0 : rangeCallback();
        return range;
    }
}
export class CountableTimeInterval extends TimeInterval {
    getOffset(snapTo, step) {
        const s = typeof snapTo === 'number' || snapTo instanceof Date ? this._encode(new Date(snapTo)) : 0;
        return Math.floor(s) % step;
    }
    /**
     * Returns a filtered view of this interval representing every step'th date.
     * It can be a number of minutes, hours, days etc.
     * Must be a positive integer.
     * @param step
     */
    every(step, options) {
        let offset = 0;
        let rangeCallback;
        const { snapTo = 'start' } = options !== null && options !== void 0 ? options : {};
        if (typeof snapTo === 'string') {
            const initialOffset = offset;
            rangeCallback = (start, stop) => {
                const s = snapTo === 'start' ? start : stop;
                offset = this.getOffset(s, step);
                return () => (offset = initialOffset);
            };
        }
        else if (typeof snapTo === 'number') {
            offset = this.getOffset(new Date(snapTo), step);
        }
        else if (snapTo instanceof Date) {
            offset = this.getOffset(snapTo, step);
        }
        const encode = (date) => {
            const e = this._encode(date);
            return Math.floor((e - offset) / step);
        };
        const decode = (encoded) => {
            return this._decode(encoded * step + offset);
        };
        const interval = new TimeInterval(encode, decode, rangeCallback);
        return interval;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW50ZXJ2YWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdXRpbC90aW1lL2ludGVydmFsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQWdCQTs7R0FFRztBQUNILE1BQU0sT0FBTyxZQUFZO0lBS3JCLFlBQVksTUFBZ0IsRUFBRSxNQUFnQixFQUFFLGFBQXVCO1FBQ25FLElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDO1FBQ3RCLElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDO1FBQ3RCLElBQUksQ0FBQyxjQUFjLEdBQUcsYUFBYSxDQUFDO0lBQ3hDLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsS0FBSyxDQUFDLElBQW1CO1FBQ3JCLE1BQU0sQ0FBQyxHQUFHLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3pCLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDMUIsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzNCLENBQUM7SUFFRDs7O09BR0c7SUFDSCxJQUFJLENBQUMsSUFBbUI7UUFDcEIsTUFBTSxDQUFDLEdBQUcsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ3JDLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDMUIsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUMvQixDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSCxLQUFLLENBQUMsS0FBVyxFQUFFLElBQVUsRUFBRSxNQUFnQjs7UUFDM0MsTUFBTSxhQUFhLEdBQUcsTUFBQSxJQUFJLENBQUMsY0FBYywrQ0FBbkIsSUFBSSxFQUFrQixLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFFekQsTUFBTSxF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