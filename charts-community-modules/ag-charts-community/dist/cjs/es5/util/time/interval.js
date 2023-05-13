"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.CountableTimeInterval = exports.TimeInterval = void 0;
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
exports.TimeInterval = TimeInterval;
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
exports.CountableTimeInterval = CountableTimeInterval;
