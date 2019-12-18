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
            this.scale.domain = value;
            if (this.nice && this.scale.nice) {
                this.scale.nice(10);
            }
        },
        enumerable: true,
        configurable: true
    });
    return NumberAxis;
}(ChartAxis));
export { NumberAxis };
