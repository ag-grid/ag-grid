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
exports.LinearScale = void 0;
var continuousScale_1 = require("./continuousScale");
var ticks_1 = require("../util/ticks");
var numberFormat_1 = require("../util/numberFormat");
/**
 * Maps continuous domain to a continuous range.
 */
var LinearScale = /** @class */ (function (_super) {
    __extends(LinearScale, _super);
    function LinearScale() {
        var _this = _super.call(this, [0, 1], [0, 1]) || this;
        _this.type = 'linear';
        return _this;
    }
    LinearScale.prototype.toDomain = function (d) {
        return d;
    };
    LinearScale.prototype.ticks = function () {
        var _a;
        var count = (_a = this.tickCount) !== null && _a !== void 0 ? _a : continuousScale_1.ContinuousScale.defaultTickCount;
        if (!this.domain || this.domain.length < 2 || count < 1 || this.domain.some(function (d) { return !isFinite(d); })) {
            return [];
        }
        this.refresh();
        var _b = __read(this.getDomain(), 2), d0 = _b[0], d1 = _b[1];
        var interval = this.interval;
        if (interval) {
            var step = Math.abs(interval);
            if (!this.isDenseInterval({ start: d0, stop: d1, interval: step })) {
                return ticks_1.range(d0, d1, step);
            }
        }
        return ticks_1.default(d0, d1, count);
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
        var _a, _b;
        var count = (_a = this.tickCount) !== null && _a !== void 0 ? _a : continuousScale_1.ContinuousScale.defaultTickCount;
        var _c = __read(this.domain, 2), start = _c[0], stop = _c[1];
        if (count < 1) {
            this.niceDomain = [start, stop];
            return;
        }
        if (count === 1) {
            this.niceDomain = ticks_1.singleTickDomain(start, stop);
            return;
        }
        for (var i = 0; i < 2; i++) {
            var step = (_b = this.interval) !== null && _b !== void 0 ? _b : ticks_1.tickStep(start, stop, count);
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
        var ticks = _a.ticks, specifier = _a.specifier;
        return numberFormat_1.tickFormat(ticks || this.ticks(), specifier);
    };
    return LinearScale;
}(continuousScale_1.ContinuousScale));
exports.LinearScale = LinearScale;
//# sourceMappingURL=linearScale.js.map