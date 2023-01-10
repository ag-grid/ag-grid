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
import ticks, { tickStep } from '../util/ticks';
import { tickFormat } from '../util/numberFormat';
/**
 * Maps continuous domain to a continuous range.
 */
var LinearScale = /** @class */ (function (_super) {
    __extends(LinearScale, _super);
    function LinearScale() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type = 'linear';
        return _this;
    }
    LinearScale.prototype.ticks = function () {
        var _a;
        if (!this.domain || this.domain.length < 2) {
            return [];
        }
        this.refresh();
        var _b = __read(this.getDomain(), 2), d0 = _b[0], d1 = _b[1];
        var count = (_a = this.tickCount) !== null && _a !== void 0 ? _a : 10;
        return ticks(d0, d1, count);
    };
    LinearScale.prototype.update = function () {
        if (!this.domain || this.domain.length < 2) {
            return;
        }
        if (this.nice) {
            this.updateNiceDomain();
        }
    };
    /**
     * Extends the domain so that it starts and ends on nice round values.
     * @param count Tick count.
     */
    LinearScale.prototype.updateNiceDomain = function () {
        var _a;
        var count = (_a = this.tickCount) !== null && _a !== void 0 ? _a : 10;
        var _b = __read(this.domain, 2), start = _b[0], stop = _b[1];
        for (var i = 0; i < 2; i++) {
            var step = tickStep(start, stop, count);
            if (step >= 1) {
                start = Math.floor(start / step) * step;
                stop = Math.ceil(stop / step) * step;
            }
            else {
                // Prevent floating point error
                var s = 1 / step;
                start = Math.floor(start * s) / s;
                stop = Math.ceil(stop * s) / s;
            }
        }
        this.niceDomain = [start, stop];
    };
    LinearScale.prototype.tickFormat = function (_a) {
        var count = _a.count, specifier = _a.specifier;
        var _b = __read(this.getDomain(), 2), d0 = _b[0], d1 = _b[1];
        return tickFormat(d0, d1, count !== null && count !== void 0 ? count : 10, specifier);
    };
    return LinearScale;
}(ContinuousScale));
export { LinearScale };
