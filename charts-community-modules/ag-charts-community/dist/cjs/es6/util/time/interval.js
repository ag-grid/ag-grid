"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CountableTimeInterval = exports.TimeInterval = void 0;
/**
 * The interval methods don't mutate Date parameters.
 */
class TimeInterval {
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
exports.TimeInterval = TimeInterval;
class CountableTimeInterval extends TimeInterval {
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
exports.CountableTimeInterval = CountableTimeInterval;
