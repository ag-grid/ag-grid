var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var t0 = new Date;
var t1 = new Date;
/**
 * The interval methods don't mutate Date parameters.
 */
var TimeInterval = /** @class */ (function () {
    function TimeInterval(floor, offset) {
        this._floor = floor;
        this._offset = offset;
    }
    /**
     * Returns a new date representing the latest interval boundary date before or equal to date.
     * For example, `day.floor(date)` typically returns 12:00 AM local time on the given date.
     * @param date
     */
    TimeInterval.prototype.floor = function (date) {
        date = new Date(+date);
        this._floor(date);
        return date;
    };
    /**
     * Returns a new date representing the earliest interval boundary date after or equal to date.
     * @param date
     */
    TimeInterval.prototype.ceil = function (date) {
        date = new Date(+date - 1);
        this._floor(date);
        this._offset(date, 1);
        this._floor(date);
        return date;
    };
    /**
     * Returns a new date representing the closest interval boundary date to date.
     * @param date
     */
    TimeInterval.prototype.round = function (date) {
        var d0 = this.floor(date);
        var d1 = this.ceil(date);
        var ms = +date;
        return ms - d0.getTime() < d1.getTime() - ms ? d0 : d1;
    };
    /**
     * Returns a new date equal to date plus step intervals.
     * @param date
     * @param step
     */
    TimeInterval.prototype.offset = function (date, step) {
        if (step === void 0) { step = 1; }
        date = new Date(+date);
        this._offset(date, Math.floor(step));
        return date;
    };
    /**
     * Returns an array of dates representing every interval boundary after or equal to start (inclusive) and before stop (exclusive).
     * @param start
     * @param stop
     * @param step
     */
    TimeInterval.prototype.range = function (start, stop, step) {
        if (step === void 0) { step = 1; }
        var range = [];
        start = this.ceil(start);
        step = Math.floor(step);
        if (start > stop || step <= 0) {
            return range;
        }
        var previous;
        do {
            previous = new Date(+start);
            range.push(previous);
            this._offset(start, step);
            this._floor(start);
        } while (previous < start && start < stop);
        return range;
    };
    // Returns an interval that is a subset of this interval.
    // For example, to create an interval that return 1st, 11th, 21st and 31st of each month:
    // day.filter(date => (date.getDate() - 1) % 10 === 0)
    TimeInterval.prototype.filter = function (test) {
        var _this = this;
        var floor = function (date) {
            if (date >= date) {
                while (_this._floor(date), !test(date)) {
                    date.setTime(date.getTime() - 1);
                }
            }
            return date;
        };
        var offset = function (date, step) {
            if (date >= date) {
                if (step < 0) {
                    while (++step <= 0) {
                        do {
                            _this._offset(date, -1);
                        } while (!test(date));
                    }
                }
                else {
                    while (--step >= 0) {
                        do {
                            _this._offset(date, 1);
                        } while (!test(date));
                    }
                }
            }
            return date;
        };
        return new TimeInterval(floor, offset);
    };
    return TimeInterval;
}());
export { TimeInterval };
var CountableTimeInterval = /** @class */ (function (_super) {
    __extends(CountableTimeInterval, _super);
    function CountableTimeInterval(floor, offset, count, field) {
        var _this = _super.call(this, floor, offset) || this;
        _this._count = count;
        _this._field = field;
        return _this;
    }
    /**
     * Returns the number of interval boundaries after start (exclusive) and before or equal to end (inclusive).
     * @param start
     * @param end
     */
    CountableTimeInterval.prototype.count = function (start, end) {
        t0.setTime(+start);
        t1.setTime(+end);
        this._floor(t0);
        this._floor(t1);
        return Math.floor(this._count(t0, t1));
    };
    /**
     * Returns a filtered view of this interval representing every step'th date.
     * The meaning of step is dependent on this interval’s parent interval as defined by the `field` function.
     * @param step
     */
    CountableTimeInterval.prototype.every = function (step) {
        var _this = this;
        var result;
        step = Math.floor(step);
        if (isFinite(step) && step > 0) {
            if (step > 1) {
                var field_1 = this._field;
                if (field_1) {
                    result = this.filter(function (d) { return field_1(d) % step === 0; });
                }
                else {
                    result = this.filter(function (d) { return _this.count(0, d) % step === 0; });
                }
            }
            else {
                result = this;
            }
        }
        return result;
    };
    return CountableTimeInterval;
}(TimeInterval));
export { CountableTimeInterval };
