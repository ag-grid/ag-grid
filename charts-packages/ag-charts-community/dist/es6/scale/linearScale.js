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
import ContinuousScale from "./continuousScale";
import ticks, { tickIncrement } from "../util/ticks";
/**
 * Maps continuous domain to a continuous range.
 */
var LinearScale = /** @class */ (function (_super) {
    __extends(LinearScale, _super);
    function LinearScale() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    LinearScale.prototype.ticks = function (count) {
        if (count === void 0) { count = 10; }
        var d = this._domain;
        return ticks(d[0], d[d.length - 1], count);
    };
    /**
     * Extends the domain so that it starts and ends on nice round values.
     * @param count Tick count.
     */
    LinearScale.prototype.nice = function (count) {
        if (count === void 0) { count = 10; }
        var d = this.domain;
        var i0 = 0;
        var i1 = d.length - 1;
        var start = d[i0];
        var stop = d[i1];
        var step;
        if (stop < start) {
            step = start;
            start = stop;
            stop = step;
            step = i0;
            i0 = i1;
            i1 = step;
        }
        step = tickIncrement(start, stop, count);
        if (step > 0) {
            start = Math.floor(start / step) * step;
            stop = Math.ceil(stop / step) * step;
            step = tickIncrement(start, stop, count);
        }
        else if (step < 0) {
            start = Math.ceil(start * step) / step;
            stop = Math.floor(stop * step) / step;
            step = tickIncrement(start, stop, count);
        }
        if (step > 0) {
            d[i0] = Math.floor(start / step) * step;
            d[i1] = Math.ceil(stop / step) * step;
            this.domain = d;
        }
        else if (step < 0) {
            d[i0] = Math.ceil(start * step) / step;
            d[i1] = Math.floor(stop * step) / step;
            this.domain = d;
        }
    };
    return LinearScale;
}(ContinuousScale));
export { LinearScale };
/**
 * Creates a continuous scale with the default interpolator and no clamping.
 */
export default function scaleLinear() {
    return new LinearScale();
}
