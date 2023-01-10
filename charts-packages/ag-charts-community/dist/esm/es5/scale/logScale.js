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
import { ContinuousScale } from './continuousScale';
import generateTicks from '../util/ticks';
import { format } from '../util/numberFormat';
import { NUMBER, Validate } from '../util/validation';
var identity = function (x) { return x; };
var LogScale = /** @class */ (function (_super) {
    __extends(LogScale, _super);
    function LogScale() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type = 'log';
        _this.domain = [1, 10];
        _this.base = 10;
        _this.cacheProps = ['domain', 'range', 'nice', 'tickCount', 'base'];
        _this.baseLog = identity;
        _this.basePow = identity;
        _this.log = function (x) {
            return _this.domain[0] >= 0 ? _this.baseLog(x) : -_this.baseLog(-x);
        };
        _this.pow = function (x) {
            return _this.domain[0] >= 0 ? _this.basePow(x) : -_this.basePow(-x);
        };
        return _this;
    }
    LogScale.prototype.transform = function (x) {
        return this.domain[0] >= 0 ? Math.log(x) : -Math.log(-x);
    };
    LogScale.prototype.transformInvert = function (x) {
        return this.domain[0] >= 0 ? Math.exp(x) : -Math.exp(-x);
    };
    LogScale.prototype.update = function () {
        if (!this.domain || this.domain.length < 2) {
            return;
        }
        this.updateLogFn();
        this.updatePowFn();
        if (this.nice) {
            this.updateNiceDomain();
        }
    };
    LogScale.prototype.updateLogFn = function () {
        var base = this.base;
        var log;
        if (base === 10) {
            log = Math.log10;
        }
        else if (base === Math.E) {
            log = Math.log;
        }
        else if (base === 2) {
            log = Math.log2;
        }
        else {
            var logBase_1 = Math.log(base);
            log = function (x) { return Math.log(x) / logBase_1; };
        }
        this.baseLog = log;
    };
    LogScale.prototype.updatePowFn = function () {
        var base = this.base;
        var pow;
        if (base === 10) {
            pow = LogScale.pow10;
        }
        else if (base === Math.E) {
            pow = Math.exp;
        }
        else {
            pow = function (x) { return Math.pow(base, x); };
        }
        this.basePow = pow;
    };
    LogScale.prototype.updateNiceDomain = function () {
        var _a = __read(this.domain, 2), d0 = _a[0], d1 = _a[1];
        var n0 = this.pow(Math.floor(this.log(d0)));
        var n1 = this.pow(Math.ceil(this.log(d1)));
        this.niceDomain = [n0, n1];
    };
    LogScale.pow10 = function (x) {
        return x >= 0 ? Math.pow(10, x) : 1 / Math.pow(10, -x);
    };
    LogScale.prototype.ticks = function () {
        var _this = this;
        var _a;
        if (!this.domain || this.domain.length < 2) {
            return [];
        }
        this.refresh();
        var count = (_a = this.tickCount) !== null && _a !== void 0 ? _a : 10;
        var base = this.base;
        var _b = __read(this.getDomain(), 2), d0 = _b[0], d1 = _b[1];
        var p0 = this.log(d0);
        var p1 = this.log(d1);
        var isBaseInteger = base % 1 === 0;
        var isDiffLarge = p1 - p0 >= count;
        if (!isBaseInteger || isDiffLarge) {
            // Returns [10^1, 10^2, 10^3, 10^4, ...]
            return generateTicks(p0, p1, Math.min(p1 - p0, count)).map(function (x) { return _this.pow(x); });
        }
        var ticks = [];
        var isPositive = d0 > 0;
        p0 = Math.floor(p0) - 1;
        p1 = Math.round(p1) + 1;
        for (var p = p0; p <= p1; p++) {
            for (var k = 1; k < base; k++) {
                var q = isPositive ? k : base - k + 1;
                var t = this.pow(p) * q;
                if (t >= d0 && t <= d1) {
                    ticks.push(t);
                }
            }
        }
        return ticks;
    };
    LogScale.prototype.tickFormat = function (_a) {
        var _this = this;
        var count = _a.count, specifier = _a.specifier;
        var base = this.base;
        if (specifier == null) {
            specifier = (base === 10 ? '.0e' : ',');
        }
        if (typeof specifier !== 'function') {
            specifier = format(specifier);
        }
        if (count === Infinity) {
            return specifier;
        }
        if (count == null) {
            count = 10;
        }
        var k = Math.max(1, (base * count) / this.ticks().length);
        return function (d) {
            var i = d / _this.pow(Math.round(_this.log(d)));
            if (i * base < base - 0.5) {
                i *= base;
            }
            return i <= k ? specifier(d) : '';
        };
    };
    __decorate([
        Validate(NUMBER(0))
    ], LogScale.prototype, "base", void 0);
    return LogScale;
}(ContinuousScale));
export { LogScale };
