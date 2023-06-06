var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
/**
 * The interval methods don't mutate Date parameters.
 */
var TimeInterval = /** @class */ (function () {
    function TimeInterval(encode, decode, rangeCallback) {
        this._encode = encode;
        this._decode = decode;
        this._rangeCallback = rangeCallback;
    }
    /**
     * Returns a new date representing the latest interval boundary date before or equal to date.
     * For example, `day.floor(date)` typically returns 12:00 AM local time on the given date.
     * @param date
     */
    TimeInterval.prototype.floor = function (date) {
        var d = new Date(date);
        var e = this._encode(d);
        return this._decode(e);
    };
    /**
     * Returns a new date representing the earliest interval boundary date after or equal to date.
     * @param date
     */
    TimeInterval.prototype.ceil = function (date) {
        var d = new Date(Number(date) - 1);
        var e = this._encode(d);
        return this._decode(e + 1);
    };
    /**
     * Returns an array of dates representing every interval boundary after or equal to start (inclusive) and before stop (exclusive).
     * @param start Range start.
     * @param stop Range end.
     * @param extend If specified, the requested range will be extended to the closest "nice" values.
     */
    TimeInterval.prototype.range = function (start, stop, extend) {
        var _a;
        var rangeCallback = (_a = this._rangeCallback) === null || _a === void 0 ? void 0 : _a.call(this, start, stop);
        var e0 = this._encode(extend ? this.floor(start) : this.ceil(start));
        var e1 = this._encode(extend ? this.ceil(stop) : this.floor(stop));
        if (e1 < e0) {
            return [];
        }
        var range = [];
        for (var e = e0; e <= e1; e++) {
            var d = this._decode(e);
            range.push(d);
        }
        rangeCallback === null || rangeCallback === void 0 ? void 0 : rangeCallback();
        return range;
    };
    return TimeInterval;
}());
export { TimeInterval };
var CountableTimeInterval = /** @class */ (function (_super) {
    __extends(CountableTimeInterval, _super);
    function CountableTimeInterval() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    CountableTimeInterval.prototype.getOffset = function (snapTo, step) {
        var s = typeof snapTo === 'number' || snapTo instanceof Date ? this._encode(new Date(snapTo)) : 0;
        return Math.floor(s) % step;
    };
    /**
     * Returns a filtered view of this interval representing every step'th date.
     * It can be a number of minutes, hours, days etc.
     * Must be a positive integer.
     * @param step
     */
    CountableTimeInterval.prototype.every = function (step, options) {
        var _this = this;
        var offset = 0;
        var rangeCallback;
        var _a = (options !== null && options !== void 0 ? options : {}).snapTo, snapTo = _a === void 0 ? 'start' : _a;
        if (typeof snapTo === 'string') {
            var initialOffset_1 = offset;
            rangeCallback = function (start, stop) {
                var s = snapTo === 'start' ? start : stop;
                offset = _this.getOffset(s, step);
                return function () { return (offset = initialOffset_1); };
            };
        }
        else if (typeof snapTo === 'number') {
            offset = this.getOffset(new Date(snapTo), step);
        }
        else if (snapTo instanceof Date) {
            offset = this.getOffset(snapTo, step);
        }
        var encode = function (date) {
            var e = _this._encode(date);
            return Math.floor((e - offset) / step);
        };
        var decode = function (encoded) {
            return _this._decode(encoded * step + offset);
        };
        var interval = new TimeInterval(encode, decode, rangeCallback);
        return interval;
    };
    return CountableTimeInterval;
}(TimeInterval));
export { CountableTimeInterval };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW50ZXJ2YWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdXRpbC90aW1lL2ludGVydmFsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQWdCQTs7R0FFRztBQUNIO0lBS0ksc0JBQVksTUFBZ0IsRUFBRSxNQUFnQixFQUFFLGFBQXVCO1FBQ25FLElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDO1FBQ3RCLElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDO1FBQ3RCLElBQUksQ0FBQyxjQUFjLEdBQUcsYUFBYSxDQUFDO0lBQ3hDLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsNEJBQUssR0FBTCxVQUFNLElBQW1CO1FBQ3JCLElBQU0sQ0FBQyxHQUFHLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3pCLElBQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDMUIsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzNCLENBQUM7SUFFRDs7O09BR0c7SUFDSCwyQkFBSSxHQUFKLFVBQUssSUFBbUI7UUFDcEIsSUFBTSxDQUFDLEdBQUcsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ3JDLElBQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDMUIsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUMvQixDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSCw0QkFBSyxHQUFMLFVBQU0sS0FBVyxFQUFFLElBQVUsRUFBRSxNQUFnQjs7UUFDM0MsSUFBTSxhQUFhLEdBQUcsTUFBQSxJQUFJLENBQUMsY0FBYywrQ0FBbkIsSUFBSSxFQUFrQixLQUFLLEVBQUUsSUFBSSxDQUFD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