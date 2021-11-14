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
import { LinearScale } from "../../scale/linearScale";
import { extent } from "../../util/array";
import { isContinuous } from "../../util/value";
import { ChartAxis } from "../chartAxis";
// Instead of clamping the values outside of domain to the range,
// return NaNs to indicate invalid input.
export function clamper(domain) {
    var _a;
    var a = domain[0];
    var b = domain[domain.length - 1];
    if (a > b) {
        _a = [b, a], a = _a[0], b = _a[1];
    }
    return function (x) { return x >= a && x <= b ? x : NaN; };
}
var NumberAxis = /** @class */ (function (_super) {
    __extends(NumberAxis, _super);
    function NumberAxis() {
        var _this = _super.call(this, new LinearScale()) || this;
        _this._nice = true;
        _this._min = NaN;
        _this._max = NaN;
        _this.scale.clamper = clamper;
        return _this;
    }
    Object.defineProperty(NumberAxis.prototype, "nice", {
        get: function () {
            return this._nice;
        },
        set: function (value) {
            if (this._nice !== value) {
                this._nice = value;
                if (value && this.scale.nice) {
                    this.scale.nice(this.tick.count);
                }
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NumberAxis.prototype, "domain", {
        get: function () {
            return this.scale.domain;
        },
        set: function (domain) {
            if (domain.length > 2) {
                domain = extent(domain, isContinuous, Number) || [0, 1];
            }
            var _a = this, scale = _a.scale, min = _a.min, max = _a.max;
            domain = [
                isNaN(min) ? domain[0] : min,
                isNaN(max) ? domain[1] : max
            ];
            scale.domain = domain;
            this.onLabelFormatChange(this.label.format);
            scale.clamp = true;
            if (this.nice && this.scale.nice) {
                this.scale.nice(this.tick.count);
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NumberAxis.prototype, "min", {
        get: function () {
            return this._min;
        },
        set: function (value) {
            if (this._min !== value) {
                this._min = value;
                if (!isNaN(value)) {
                    this.scale.domain = [value, this.scale.domain[1]];
                }
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NumberAxis.prototype, "max", {
        get: function () {
            return this._max;
        },
        set: function (value) {
            if (this._max !== value) {
                this._max = value;
                if (!isNaN(value)) {
                    this.scale.domain = [this.scale.domain[0], value];
                }
            }
        },
        enumerable: true,
        configurable: true
    });
    NumberAxis.prototype.formatDatum = function (datum) {
        return datum.toFixed(2);
    };
    NumberAxis.className = 'NumberAxis';
    NumberAxis.type = 'number';
    return NumberAxis;
}(ChartAxis));
export { NumberAxis };
