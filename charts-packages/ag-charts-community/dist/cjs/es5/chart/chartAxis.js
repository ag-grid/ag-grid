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
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
var axis_1 = require("../axis");
var linearScale_1 = require("../scale/linearScale");
var validation_1 = require("../util/validation");
var ChartAxisDirection;
(function (ChartAxisDirection) {
    ChartAxisDirection["X"] = "x";
    ChartAxisDirection["Y"] = "y";
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
        _this.direction = ChartAxisDirection.Y;
        _this.boundSeries = [];
        _this.includeInvisibleDomains = false;
        _this._position = ChartAxisPosition.Left;
        return _this;
    }
    Object.defineProperty(ChartAxis.prototype, "type", {
        get: function () {
            return this.constructor.type || '';
        },
        enumerable: true,
        configurable: true
    });
    ChartAxis.prototype.getMeta = function () {
        return {
            id: this.id,
            direction: this.direction,
            boundSeries: this.boundSeries,
        };
    };
    ChartAxis.prototype.useCalculatedTickCount = function () {
        // We only want to use the new algorithm for number axes. Category axes don't use a
        // calculated or user-supplied tick-count, and time axes need special handling depending on
        // the time-range involved.
        return this.scale instanceof linearScale_1.LinearScale;
    };
    /**
     * For continuous axes, if tick count has not been specified, set the number of ticks based on the available range
     */
    ChartAxis.prototype.calculateTickCount = function () {
        if (!this.useCalculatedTickCount()) {
            return;
        }
        var _a = this, count = _a.tick.count, _b = __read(_a.range, 2), min = _b[0], max = _b[1];
        if (count !== undefined) {
            this._calculatedTickCount = undefined;
            return;
        }
        var availableRange = Math.abs(max - min);
        var optimalTickInteralPx = this.calculateTickIntervalEstimate();
        // Approximate number of pixels to allocate for each tick.
        var optimalRangePx = 600;
        var minTickIntervalRatio = 0.75;
        var tickIntervalRatio = Math.max(Math.pow(Math.log(availableRange) / Math.log(optimalRangePx), 2), minTickIntervalRatio);
        var tickInterval = optimalTickInteralPx * tickIntervalRatio;
        this._calculatedTickCount = Math.max(2, Math.floor(availableRange / tickInterval));
    };
    ChartAxis.prototype.calculateTickIntervalEstimate = function () {
        var _a, _b;
        var _c = this, domain = _c.domain, fontSize = _c.label.fontSize, direction = _c.direction;
        var padding = fontSize * 1.5;
        if (direction === ChartAxisDirection.Y) {
            return fontSize * 2 + padding;
        }
        var ticks = ((_b = (_a = this.scale).ticks) === null || _b === void 0 ? void 0 : _b.call(_a, 10)) || [domain[0], domain[domain.length - 1]];
        // Dynamic optimal tick interval based upon label scale.
        var approxMaxLabelCharacters = Math.max.apply(Math, __spread(ticks.map(function (v) {
            return String(v).length;
        })));
        return approxMaxLabelCharacters * fontSize + padding;
    };
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
    ChartAxis.prototype.calculateDomain = function (_a) {
        var _b;
        var primaryTickCount = _a.primaryTickCount;
        var _c = this, direction = _c.direction, boundSeries = _c.boundSeries, includeInvisibleDomains = _c.includeInvisibleDomains;
        if (this.linkedTo) {
            this.domain = this.linkedTo.domain;
        }
        else {
            var domains_1 = [];
            boundSeries
                .filter(function (s) { return includeInvisibleDomains || s.visible; })
                .forEach(function (series) {
                domains_1.push(series.getDomain(direction));
            });
            var domain = (_b = new Array()).concat.apply(_b, __spread(domains_1));
            var isYAxis = this.direction === 'y';
            primaryTickCount = this.updateDomain(domain, isYAxis, primaryTickCount);
        }
        return { primaryTickCount: primaryTickCount };
    };
    ChartAxis.prototype.updateDomain = function (domain, _isYAxis, primaryTickCount) {
        this.domain = domain;
        return primaryTickCount;
    };
    __decorate([
        validation_1.Validate(validation_1.STRING_ARRAY)
    ], ChartAxis.prototype, "keys", void 0);
    __decorate([
        validation_1.Validate(validation_1.POSITION)
    ], ChartAxis.prototype, "_position", void 0);
    return ChartAxis;
}(axis_1.Axis));
exports.ChartAxis = ChartAxis;
