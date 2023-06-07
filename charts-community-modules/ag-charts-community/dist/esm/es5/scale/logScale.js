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
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
import { ContinuousScale } from './continuousScale';
import generateTicks, { range } from '../util/ticks';
import { format } from '../util/numberFormat';
import { NUMBER, Validate } from '../util/validation';
var identity = function (x) { return x; };
var LogScale = /** @class */ (function (_super) {
    __extends(LogScale, _super);
    function LogScale() {
        var _this = _super.call(this, [1, 10], [0, 1]) || this;
        _this.type = 'log';
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
    LogScale.prototype.toDomain = function (d) {
        return d;
    };
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
        var count = (_a = this.tickCount) !== null && _a !== void 0 ? _a : 10;
        if (!this.domain || this.domain.length < 2 || count < 1) {
            return [];
        }
        this.refresh();
        var base = this.base;
        var _b = __read(this.getDomain(), 2), d0 = _b[0], d1 = _b[1];
        var p0 = this.log(d0);
        var p1 = this.log(d1);
        if (this.interval) {
            var step = Math.abs(this.interval);
            var absDiff = Math.abs(p1 - p0);
            var ticks_1 = range(p0, p1, Math.min(absDiff, step))
                .map(function (x) { return _this.pow(x); })
                .filter(function (t) { return t >= d0 && t <= d1; });
            if (!this.isDenseInterval({ start: d0, stop: d1, interval: step, count: ticks_1.length })) {
                return ticks_1;
            }
        }
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
        var min = Math.min.apply(Math, __spreadArray([], __read(this.range)));
        var max = Math.max.apply(Math, __spreadArray([], __read(this.range)));
        var availableSpacing = (max - min) / count;
        var lastTickPosition = Infinity;
        for (var p = p0; p <= p1; p++) {
            var nextMagnitudeTickPosition = this.convert(this.pow(p + 1));
            for (var k = 1; k < base; k++) {
                var q = isPositive ? k : base - k + 1;
                var t = this.pow(p) * q;
                var tickPosition = this.convert(t);
                var prevSpacing = Math.abs(lastTickPosition - tickPosition);
                var nextSpacing = Math.abs(tickPosition - nextMagnitudeTickPosition);
                var fits = prevSpacing >= availableSpacing && nextSpacing >= availableSpacing;
                if (t >= d0 && t <= d1 && (k === 1 || fits)) {
                    ticks.push(t);
                    lastTickPosition = tickPosition;
                }
            }
        }
        return ticks;
    };
    LogScale.prototype.tickFormat = function (_a) {
        var count = _a.count, ticks = _a.ticks, specifier = _a.specifier;
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
        if (ticks == null) {
            this.ticks();
        }
        return function (d) {
            return specifier(d);
        };
    };
    __decorate([
        Validate(NUMBER(0))
    ], LogScale.prototype, "base", void 0);
    return LogScale;
}(ContinuousScale));
export { LogScale };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nU2NhbGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvc2NhbGUvbG9nU2NhbGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBQ3BELE9BQU8sYUFBYSxFQUFFLEVBQUUsS0FBSyxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ3JELE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQUM5QyxPQUFPLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBRXRELElBQU0sUUFBUSxHQUFHLFVBQUMsQ0FBTSxJQUFLLE9BQUEsQ0FBQyxFQUFELENBQUMsQ0FBQztBQUUvQjtJQUE4Qiw0QkFBdUI7SUFHakQ7UUFBQSxZQUNJLGtCQUFNLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFNBQ3pCO1FBSlEsVUFBSSxHQUFHLEtBQUssQ0FBQztRQVd0QixVQUFJLEdBQUcsRUFBRSxDQUFDO1FBU0EsZ0JBQVUsR0FBc0IsQ0FBQyxRQUFRLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxXQUFXLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFhbkYsYUFBTyxHQUEwQixRQUFRLENBQUM7UUFDMUMsYUFBTyxHQUEwQixRQUFRLENBQUM7UUFFMUMsU0FBRyxHQUFHLFVBQUMsQ0FBUztZQUNwQixPQUFPLEtBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNyRSxDQUFDLENBQUM7UUFFTSxTQUFHLEdBQUcsVUFBQyxDQUFTO1lBQ3BCLE9BQU8sS0FBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3JFLENBQUMsQ0FBQzs7SUF0Q0YsQ0FBQztJQUVELDJCQUFRLEdBQVIsVUFBUyxDQUFTO1FBQ2QsT0FBTyxDQUFDLENBQUM7SUFDYixDQUFDO0lBS1MsNEJBQVMsR0FBbkIsVUFBb0IsQ0FBTTtRQUN0QixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUM3RCxDQUFDO0lBQ1Msa0NBQWUsR0FBekIsVUFBMEIsQ0FBTTtRQUM1QixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUM3RCxDQUFDO0lBSUQseUJBQU0sR0FBTjtRQUNJLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtZQUN4QyxPQUFPO1NBQ1Y7UUFDRCxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDbkIsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQ25CLElBQUksSUFBSSxDQUFDLElBQUksRUFBRTtZQUNYLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1NBQzNCO0lBQ0wsQ0FBQztJQWFPLDhCQUFXLEdBQW5CO1FBQ1ksSUFBQSxJQUFJLEdBQUssSUFBSSxLQUFULENBQVU7UUFDdEIsSUFBSSxHQUEwQixDQUFDO1FBQy9CLElBQUksSUFBSSxLQUFLLEVBQUUsRUFBRTtZQUNiLEdBQUcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO1NBQ3BCO2FBQU0sSUFBSSxJQUFJLEtBQUssSUFBSSxDQUFDLENBQUMsRUFBRTtZQUN4QixHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQztTQUNsQjthQUFNLElBQUksSUFBSSxLQUFLLENBQUMsRUFBRTtZQUNuQixHQUFHLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztTQUNuQjthQUFNO1lBQ0gsSUFBTSxTQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUMvQixHQUFHLEdBQUcsVUFBQyxDQUFDLElBQUssT0FBQSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLFNBQU8sRUFBckIsQ0FBcUIsQ0FBQztTQUN0QztRQUNELElBQUksQ0FBQyxPQUFPLEdBQUcsR0FBRyxDQUFDO0lBQ3ZCLENBQUM7SUFFTyw4QkFBVyxHQUFuQjtRQUNZLElBQUEsSUFBSSxHQUFLLElBQUksS0FBVCxDQUFVO1FBQ3RCLElBQUksR0FBMEIsQ0FBQztRQUMvQixJQUFJLElBQUksS0FBSyxFQUFFLEVBQUU7WUFDYixHQUFHLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQztTQUN4QjthQUFNLElBQUksSUFBSSxLQUFLLElBQUksQ0FBQyxDQUFDLEVBQUU7WUFDeEIsR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUM7U0FDbEI7YUFBTTtZQUNILEdBQUcsR0FBRyxVQUFDLENBQUMsSUFBSyxPQUFBLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxFQUFqQixDQUFpQixDQUFDO1NBQ2xDO1FBQ0QsSUFBSSxDQUFDLE9BQU8sR0FBRyxHQUFHLENBQUM7SUFDdkIsQ0FBQztJQUVTLG1DQUFnQixHQUExQjtRQUNVLElBQUEsS0FBQSxPQUFXLElBQUksQ0FBQyxNQUFNLElBQUEsRUFBckIsRUFBRSxRQUFBLEVBQUUsRUFBRSxRQUFlLENBQUM7UUFFN0IsSUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzlDLElBQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM3QyxJQUFJLENBQUMsVUFBVSxHQUFHLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQy9CLENBQUM7SUFFTSxjQUFLLEdBQVosVUFBYSxDQUFTO1FBQ2xCLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzNELENBQUM7SUFFRCx3QkFBSyxHQUFMO1FBQUEsaUJBMERDOztRQXpERyxJQUFNLEtBQUssR0FBRyxNQUFBLElBQUksQ0FBQyxTQUFTLG1DQUFJLEVBQUUsQ0FBQztRQUNuQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLElBQUksS0FBSyxHQUFHLENBQUMsRUFBRTtZQUNyRCxPQUFPLEVBQUUsQ0FBQztTQUNiO1FBQ0QsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ2YsSUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztRQUNqQixJQUFBLEtBQUEsT0FBVyxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUEsRUFBMUIsRUFBRSxRQUFBLEVBQUUsRUFBRSxRQUFvQixDQUFDO1FBRWxDLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDdEIsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUV0QixJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7WUFDZixJQUFNLElBQUksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUNyQyxJQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQztZQUNsQyxJQUFNLE9BQUssR0FBRyxLQUFLLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQztpQkFDL0MsR0FBRyxDQUFDLFVBQUMsQ0FBQyxJQUFLLE9BQUEsS0FBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBWCxDQUFXLENBQUM7aUJBQ3ZCLE1BQU0sQ0FBQyxVQUFDLENBQUMsSUFBSyxPQUFBLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJLEVBQUUsRUFBbEIsQ0FBa0IsQ0FBQyxDQUFDO1lBRXZDLElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLE9BQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFO2dCQUNyRixPQUFPLE9BQUssQ0FBQzthQUNoQjtTQUNKO1FBRUQsSUFBTSxhQUFhLEdBQUcsSUFBSSxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDckMsSUFBTSxXQUFXLEdBQUcsRUFBRSxHQUFHLEVBQUUsSUFBSSxLQUFLLENBQUM7UUFFckMsSUFBSSxDQUFDLGFBQWEsSUFBSSxXQUFXLEVBQUU7WUFDL0Isd0NBQXdDO1lBQ3hDLE9BQU8sYUFBYSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLFVBQUMsQ0FBQyxJQUFLLE9BQUEsS0FBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBWCxDQUFXLENBQUMsQ0FBQztTQUNsRjtRQUVELElBQU0sS0FBSyxHQUFhLEVBQUUsQ0FBQztRQUMzQixJQUFNLFVBQVUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQzFCLEVBQUUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUN4QixFQUFFLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUM7UUFFeEIsSUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsT0FBUixJQUFJLDJCQUFRLElBQUksQ0FBQyxLQUFLLEdBQUMsQ0FBQztRQUNwQyxJQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxPQUFSLElBQUksMkJBQVEsSUFBSSxDQUFDLEtBQUssR0FBQyxDQUFDO1FBRXBDLElBQU0sZ0JBQWdCLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsS0FBSyxDQUFDO1FBQzdDLElBQUksZ0JBQWdCLEdBQUcsUUFBUSxDQUFDO1FBQ2hDLEtBQUssSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDM0IsSUFBTSx5QkFBeUIsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDaEUsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDM0IsSUFBTSxDQUFDLEdBQUcsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUN4QyxJQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDMUIsSUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDckMsSUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsR0FBRyxZQUFZLENBQUMsQ0FBQztnQkFDOUQsSUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxZQUFZLEdBQUcseUJBQXlCLENBQUMsQ0FBQztnQkFDdkUsSUFBTSxJQUFJLEdBQUcsV0FBVyxJQUFJLGdCQUFnQixJQUFJLFdBQVcsSUFBSSxnQkFBZ0IsQ0FBQztnQkFDaEYsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLElBQUksQ0FBQyxFQUFFO29CQUN6QyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUNkLGdCQUFnQixHQUFHLFlBQVksQ0FBQztpQkFDbkM7YUFDSjtTQUNKO1FBQ0QsT0FBTyxLQUFLLENBQUM7SUFDakIsQ0FBQztJQUVELDZCQUFVLEdBQVYsVUFBVyxFQVFWO1lBUEcsS0FBSyxXQUFBLEVBQ0wsS0FBSyxXQUFBLEVBQ0wsU0FBUyxlQUFBO1FBTUQsSUFBQSxJQUFJLEdBQUssSUFBSSxLQUFULENBQVU7UUFFdEIsSUFBSSxTQUFTLElBQUksSUFBSSxFQUFFO1lBQ25CLFNBQVMsR0FBRyxDQUFDLElBQUksS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFRLENBQUM7U0FDbEQ7UUFFRCxJQUFJLE9BQU8sU0FBUyxLQUFLLFVBQVUsRUFBRTtZQUNqQyxTQUFTLEdBQUcsTUFBTSxDQUFDLFNBQW1CLENBQUMsQ0FBQztTQUMzQztRQUVELElBQUksS0FBSyxLQUFLLFFBQVEsRUFBRTtZQUNwQixPQUFPLFNBQVMsQ0FBQztTQUNwQjtRQUVELElBQUksS0FBSyxJQUFJLElBQUksRUFBRTtZQUNmLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztTQUNoQjtRQUVELE9BQU8sVUFBQyxDQUFDO1lBQ0wsT0FBUSxTQUFtQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ25ELENBQUMsQ0FBQztJQUNOLENBQUM7SUFwS0Q7UUFEQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDOzBDQUNWO0lBcUtkLGVBQUM7Q0FBQSxBQWpMRCxDQUE4QixlQUFlLEdBaUw1QztTQWpMWSxRQUFRIn0=