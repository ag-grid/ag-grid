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
import ContinuousScale, { identity } from "./continuousScale";
import ticks from "../util/ticks";
var LogScale = /** @class */ (function (_super) {
    __extends(LogScale, _super);
    function LogScale() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._domain = [1, 10];
        _this.baseLog = identity; // takes a log with base `base` of `x`
        _this.basePow = identity; // raises `base` to the power of `x`
        _this._base = 10;
        return _this;
    }
    Object.defineProperty(LogScale.prototype, "base", {
        get: function () {
            return this._base;
        },
        set: function (value) {
            if (this._base !== value) {
                this._base = value;
                this.rescale();
            }
        },
        enumerable: true,
        configurable: true
    });
    LogScale.prototype.rescale = function () {
        var baseLog = this.makeLogFn(this.base);
        var basePow = this.makePowFn(this.base);
        if (this.domain[0] < 0) {
            baseLog = this.reflect(baseLog);
            basePow = this.reflect(basePow);
            this.transform = function (x) { return -Math.log(-x); };
            this.untransform = function (x) { return -Math.exp(-x); };
        }
        else {
            this.transform = function (x) { return Math.log(x); };
            this.untransform = function (x) { return Math.exp(x); };
        }
        this.baseLog = baseLog;
        this.basePow = basePow;
        _super.prototype.rescale.call(this);
    };
    /**
     * For example, if `f` is `Math.log10`, we have
     *
     *     f(100) == 2
     *     f(-100) == NaN
     *     rf = reflect(f)
     *     rf(-100) == -2
     *
     * @param f
     */
    LogScale.prototype.reflect = function (f) {
        return function (x) { return -f(-x); };
    };
    LogScale.prototype.nice = function () {
        var _a, _b;
        var domain = this.domain;
        var i0 = 0;
        var i1 = domain.length - 1;
        var x0 = domain[i0];
        var x1 = domain[i1];
        if (x1 < x0) {
            _a = [i1, i0], i0 = _a[0], i1 = _a[1];
            _b = [x1, x0], x0 = _b[0], x1 = _b[1];
        }
        // For example, for base == 10:
        // [ 50, 900] becomes [ 10, 1000 ]
        domain[i0] = this.basePow(Math.floor(this.baseLog(x0)));
        domain[i1] = this.basePow(Math.ceil(this.baseLog(x1)));
        this.domain = domain;
    };
    LogScale.prototype.pow10 = function (x) {
        return isFinite(x)
            ? +('1e' + x) // to avoid precision issues, e.g. Math.pow(10, -4) is not 0.0001
            : x < 0
                ? 0
                : x;
    };
    LogScale.prototype.makePowFn = function (base) {
        if (base === 10) {
            return this.pow10;
        }
        if (base === Math.E) {
            return Math.exp;
        }
        return function (x) { return Math.pow(base, x); };
    };
    LogScale.prototype.makeLogFn = function (base) {
        if (base === Math.E) {
            return Math.log;
        }
        if (base === 10 && Math.log10) {
            return Math.log10;
        }
        if (base === 2 && Math.log2) {
            return Math.log2;
        }
        base = Math.log(base);
        return function (x) { return Math.log(x) / base; };
    };
    LogScale.prototype.ticks = function (count) {
        var _a;
        if (count === void 0) { count = 10; }
        var base = this.base;
        var domain = this.domain;
        var d0 = domain[0];
        var d1 = domain[domain.length - 1];
        var isReversed = d1 < d0;
        if (isReversed) {
            _a = [d1, d0], d0 = _a[0], d1 = _a[1];
        }
        var p0 = this.baseLog(d0);
        var p1 = this.baseLog(d1);
        var z = [];
        // if `base` is an integer and delta in order of magnitudes is less than count
        if (!(base % 1) && p1 - p0 < count) {
            // For example, if count == 10, base == 10 and domain == [10^2, 10^6]
            // then p1 - p0 < count == true.
            p0 = Math.round(p0) - 1;
            p1 = Math.round(p1) + 1;
            if (d0 > 0) {
                for (; p0 < p1; ++p0) {
                    for (var k = 1, p = this.basePow(p0); k < base; ++k) {
                        var t = p * k;
                        // The `t` checks are needed because we expanded the [p0, p1] by 1 in each direction.
                        if (t < d0)
                            continue;
                        if (t > d1)
                            break;
                        z.push(t);
                    }
                }
            }
            else {
                for (; p0 < p1; ++p0) {
                    for (var k = base - 1, p = this.basePow(p0); k >= 1; --k) {
                        var t = p * k;
                        if (t < d0)
                            continue;
                        if (t > d1)
                            break;
                        z.push(t);
                    }
                }
            }
        }
        else {
            // For example, if count == 4, base == 10 and domain == [10^2, 10^6]
            // then p1 - p0 < count == false.
            // `ticks` return [2, 3, 4, 5, 6], then mapped to [10^2, 10^3, 10^4, 10^5, 10^6].
            z = ticks(p0, p1, Math.min(p1 - p0, count)).map(this.basePow);
        }
        return isReversed ? z.reverse() : z;
    };
    return LogScale;
}(ContinuousScale));
export { LogScale };
