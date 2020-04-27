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
var axis_1 = require("../axis");
var ChartAxisDirection;
(function (ChartAxisDirection) {
    ChartAxisDirection["X"] = "x";
    ChartAxisDirection["Y"] = "y"; // means 'radius' in polar charts
})(ChartAxisDirection = exports.ChartAxisDirection || (exports.ChartAxisDirection = {}));
function flipChartAxisDirection(direction) {
    if (direction === ChartAxisDirection.X) {
        return ChartAxisDirection.Y;
    }
    else {
        return ChartAxisDirection.X;
    }
}
exports.flipChartAxisDirection = flipChartAxisDirection;
var ChartAxisPosition;
(function (ChartAxisPosition) {
    ChartAxisPosition["Top"] = "top";
    ChartAxisPosition["Right"] = "right";
    ChartAxisPosition["Bottom"] = "bottom";
    ChartAxisPosition["Left"] = "left";
    ChartAxisPosition["Angle"] = "angle";
    ChartAxisPosition["Radius"] = "radius";
})(ChartAxisPosition = exports.ChartAxisPosition || (exports.ChartAxisPosition = {}));
var ChartAxis = /** @class */ (function (_super) {
    __extends(ChartAxis, _super);
    function ChartAxis() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.keys = [];
        _this.boundSeries = [];
        return _this;
    }
    Object.defineProperty(ChartAxis.prototype, "type", {
        get: function () {
            return this.constructor.type || '';
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ChartAxis.prototype, "position", {
        get: function () {
            return this._position;
        },
        set: function (value) {
            if (this._position !== value) {
                this._position = value;
                switch (value) {
                    case ChartAxisPosition.Top:
                        this.direction = ChartAxisDirection.X;
                        this.rotation = -90;
                        this.label.mirrored = true;
                        this.label.parallel = true;
                        break;
                    case ChartAxisPosition.Right:
                        this.direction = ChartAxisDirection.Y;
                        this.rotation = 0;
                        this.label.mirrored = true;
                        this.label.parallel = false;
                        break;
                    case ChartAxisPosition.Bottom:
                        this.direction = ChartAxisDirection.X;
                        this.rotation = -90;
                        this.label.mirrored = false;
                        this.label.parallel = true;
                        break;
                    case ChartAxisPosition.Left:
                        this.direction = ChartAxisDirection.Y;
                        this.rotation = 0;
                        this.label.mirrored = false;
                        this.label.parallel = false;
                        break;
                }
            }
        },
        enumerable: true,
        configurable: true
    });
    return ChartAxis;
}(axis_1.Axis));
exports.ChartAxis = ChartAxis;
//# sourceMappingURL=chartAxis.js.map