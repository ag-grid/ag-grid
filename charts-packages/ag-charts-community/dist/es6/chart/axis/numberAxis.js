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
import { ChartAxis } from "../chartAxis";
var NumberAxis = /** @class */ (function (_super) {
    __extends(NumberAxis, _super);
    function NumberAxis() {
        var _this = _super.call(this, new LinearScale()) || this;
        _this._nice = true;
        _this._min = NaN;
        _this._max = NaN;
        _this.scale.clamp = true;
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
                    this.scale.nice(10);
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
        set: function (value) {
            var _a = this, min = _a.min, max = _a.max;
            value = [
                isNaN(min) ? value[0] : min,
                isNaN(max) ? value[1] : max
            ];
            this.scale.domain = value;
            if (this.nice && this.scale.nice) {
                this.scale.nice(10);
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
    NumberAxis.className = 'NumberAxis';
    NumberAxis.type = 'number';
    return NumberAxis;
}(ChartAxis));
export { NumberAxis };
