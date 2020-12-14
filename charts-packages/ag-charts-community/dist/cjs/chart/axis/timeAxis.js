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
Object.defineProperty(exports, "__esModule", { value: true });
var timeScale_1 = require("../../scale/timeScale");
var chartAxis_1 = require("../chartAxis");
var TimeAxis = /** @class */ (function (_super) {
    __extends(TimeAxis, _super);
    function TimeAxis() {
        var _this = _super.call(this, new timeScale_1.TimeScale()) || this;
        _this._nice = true;
        _this.scale.clamp = true;
        return _this;
    }
    Object.defineProperty(TimeAxis.prototype, "nice", {
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
    Object.defineProperty(TimeAxis.prototype, "domain", {
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
    TimeAxis.className = 'TimeAxis';
    TimeAxis.type = 'time';
    return TimeAxis;
}(chartAxis_1.ChartAxis));
exports.TimeAxis = TimeAxis;
//# sourceMappingURL=timeAxis.js.map