"use strict";
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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
var continuousScale_1 = require("./continuousScale");
var ticks_1 = require("../util/ticks");
var numberFormat_1 = require("../util/numberFormat");
var validation_1 = require("../util/validation");
var identity = function (x) { return x; };
var LogScale = /** @class */ (function (_super) {
    __extends(LogScale, _super);
    function LogScale() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type = 'log';
        _this._domain = [1, 10];
        _this.baseLog = identity; // takes a log with base `base` of `x`
        _this.basePow = identity; // raises `base` to the power of `x`
        _this._base = 10;
        return _this;
    }
    LogScale.prototype.setDomain = function (values) {
        var df = values[0];
        var dl = values[values.length - 1];
        if (df === 0 || dl === 0 || (df < 0 && dl > 0) || (df > 0 && dl < 0)) {
            console.warn('Log scale domain should not start at, end at or cross zero.');
            if (df === 0 && dl > 0) {
                df = Number.EPSILON;
            }
            else if (dl === 0 && df < 0) {
                dl = -Number.EPSILON;
            }
            else if (df < 0 && dl > 0) {
                if (Math.abs(dl) >= Math.abs(df)) {
                    df = Number.EPSILON;
                }
                else {
                    dl = -Number.EPSILON;
                }
            }
            else if (df > 0 && dl < 0) {
                if (Math.abs(dl) >= Math.abs(df)) {
                    df = -Number.EPSILON;
                }
                else {
                    dl = Number.EPSILON;
                }
            }
            values = values.slice();
            values[0] = df;
            values[values.length - 1] = dl;
        }
        _super.prototype.setDomain.call(this, values);
    };
    LogScale.prototype.getDomain = function () {
        return _super.prototype.getDomain.call(this);
    };
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
        var base = this.base;
        var baseLog = LogScale.makeLogFn(base);
        var basePow = LogScale.makePowFn(base);
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
            _a = __read([i1, i0], 2), i0 = _a[0], i1 = _a[1];
            _b = __read([x1, x0], 2), x0 = _b[0], x1 = _b[1];
        }
        // For example, for base == 10:
        // [ 50, 900] becomes [ 10, 1000 ]
        domain[i0] = this.basePow(Math.floor(this.baseLog(x0)));
        domain[i1] = this.basePow(Math.ceil(this.baseLog(x1)));
        this.domain = domain;
    };
    LogScale.pow10 = function (x) {
        return isFinite(x)
            ? +('1e' + x) // to avoid precision issues, e.g. Math.pow(10, -4) is not 0.0001
            : x < 0
                ? 0
                : x;
    };
    LogScale.makePowFn = function (base) {
        if (base === 10) {
            return LogScale.pow10;
        }
        if (base === Math.E) {
            return Math.exp;
        }
        return function (x) { return Math.pow(base, x); };
    };
    // Make a log function witn an arbitrary base or return a native function if exists.
    LogScale.makeLogFn = function (base) {
        if (base === Math.E) {
            return Math.log;
        }
        if (base === 10) {
            return Math.log10;
        }
        if (base === 2) {
            return Math.log2;
        }
        var logBase = Math.log(base);
        return function (x) { return Math.log(x) / logBase; };
    };
    LogScale.prototype.ticks = function (count) {
        var _a;
        if (count === void 0) { count = 10; }
        var n = count == null ? 10 : +count;
        var base = this.base;
        var domain = this.domain;
        var d0 = domain[0];
        var d1 = domain[domain.length - 1];
        var isReversed = d1 < d0;
        if (isReversed) {
            _a = __read([d1, d0], 2), d0 = _a[0], d1 = _a[1];
        }
        var p0 = this.baseLog(d0);
        var p1 = this.baseLog(d1);
        var z = [];
        // if `base` is an integer and delta in order of magnitudes is less than n
        if (!(base % 1) && p1 - p0 < n) {
            // For example, if n == 10, base == 10 and domain == [10^2, 10^6]
            // then p1 - p0 < n == true.
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
            if (z.length * 2 < n) {
                z = ticks_1.default(d0, d1, n);
            }
        }
        else {
            // For example, if n == 4, base == 10 and domain == [10^2, 10^6]
            // then p1 - p0 < n == false.
            // `ticks` return [2, 3, 4, 5, 6], then mapped to [10^2, 10^3, 10^4, 10^5, 10^6].
            z = ticks_1.default(p0, p1, Math.min(p1 - p0, n)).map(this.basePow);
        }
        return isReversed ? z.reverse() : z;
    };
    LogScale.prototype.tickFormat = function (_a) {
        var _this = this;
        var count = _a.count, specifier = _a.specifier;
        var base = this.base;
        if (specifier == null) {
            specifier = (base === 10 ? '.0e' : ',');
        }
        if (typeof specifier !== 'function') {
            specifier = numberFormat_1.format(specifier);
        }
        if (count === Infinity) {
            return specifier;
        }
        if (count == null) {
            count = 10;
        }
        var k = Math.max(1, (base * count) / this.ticks().length);
        return function (d) {
            var i = d / _this.basePow(Math.round(_this.baseLog(d)));
            if (i * base < base - 0.5) {
                i *= base;
            }
            return i <= k ? specifier(d) : '';
        };
    };
    __decorate([
        validation_1.Validate(validation_1.NUMBER(0))
    ], LogScale.prototype, "_base", void 0);
    return LogScale;
}(continuousScale_1.ContinuousScale));
exports.LogScale = LogScale;
