"use strict";
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
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
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PolarChart = void 0;
var chart_1 = require("./chart");
var polarSeries_1 = require("./series/polar/polarSeries");
var angle_1 = require("../util/angle");
var padding_1 = require("../util/padding");
var bbox_1 = require("../scene/bbox");
var pieSeries_1 = require("./series/polar/pieSeries");
var chartAxisDirection_1 = require("./chartAxisDirection");
var polarAxis_1 = require("./axis/polarAxis");
var PolarChart = /** @class */ (function (_super) {
    __extends(PolarChart, _super);
    function PolarChart(document, overrideDevicePixelRatio, resources) {
        if (document === void 0) { document = window.document; }
        var _this = _super.call(this, document, overrideDevicePixelRatio, resources) || this;
        _this.padding = new padding_1.Padding(40);
        return _this;
    }
    PolarChart.prototype.performLayout = function () {
        return __awaiter(this, void 0, void 0, function () {
            var shrinkRect, fullSeriesRect, hoverRectPadding, hoverRect;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, _super.prototype.performLayout.call(this)];
                    case 1:
                        shrinkRect = _a.sent();
                        fullSeriesRect = shrinkRect.clone();
                        this.computeSeriesRect(shrinkRect);
                        this.computeCircle(shrinkRect);
                        this.axes.forEach(function (axis) { return axis.update(); });
                        hoverRectPadding = 20;
                        hoverRect = shrinkRect.clone().grow(hoverRectPadding);
                        this.hoverRect = hoverRect;
                        this.layoutService.dispatchLayoutComplete({
                            type: 'layout-complete',
                            chart: { width: this.scene.width, height: this.scene.height },
                            series: { rect: fullSeriesRect, paddedRect: shrinkRect, hoverRect: hoverRect, visible: true },
                            axes: [],
                        });
                        return [2 /*return*/, shrinkRect];
                }
            });
        });
    };
    PolarChart.prototype.updateAxes = function (cx, cy, radius) {
        var _a;
        this.axes.forEach(function (axis) {
            var _a;
            if (axis.direction === chartAxisDirection_1.ChartAxisDirection.X) {
                var rotation = angle_1.toRadians((_a = axis.rotation) !== null && _a !== void 0 ? _a : 0);
                axis.range = [-Math.PI / 2 + rotation, (3 * Math.PI) / 2 + rotation];
                axis.gridLength = radius;
                axis.translation.x = cx;
                axis.translation.y = cy;
            }
            else if (axis.direction === chartAxisDirection_1.ChartAxisDirection.Y) {
                axis.range = [radius, 0];
                axis.translation.x = cx;
                axis.translation.y = cy - radius;
            }
            axis.updateScale();
        });
        var angleAxis = this.axes.find(function (axis) { return axis.direction === chartAxisDirection_1.ChartAxisDirection.X; });
        var scale = angleAxis === null || angleAxis === void 0 ? void 0 : angleAxis.scale;
        var angles = (_a = scale === null || scale === void 0 ? void 0 : scale.ticks) === null || _a === void 0 ? void 0 : _a.call(scale).map(function (value) { return scale.convert(value); });
        this.axes
            .filter(function (axis) { return axis instanceof polarAxis_1.PolarAxis; })
            .forEach(function (axis) { return (axis.gridAngles = angles); });
    };
    PolarChart.prototype.computeSeriesRect = function (shrinkRect) {
        var seriesAreaPadding = this.seriesAreaPadding;
        shrinkRect.shrink(seriesAreaPadding.left, 'left');
        shrinkRect.shrink(seriesAreaPadding.top, 'top');
        shrinkRect.shrink(seriesAreaPadding.right, 'right');
        shrinkRect.shrink(seriesAreaPadding.bottom, 'bottom');
        this.seriesRect = shrinkRect;
    };
    PolarChart.prototype.computeCircle = function (seriesBox) {
        var _this = this;
        var polarSeries = this.series.filter(function (series) {
            return series instanceof polarSeries_1.PolarSeries;
        });
        var polarAxes = this.axes.filter(function (axis) {
            return axis instanceof polarAxis_1.PolarAxis;
        });
        var setSeriesCircle = function (cx, cy, r) {
            _this.updateAxes(cx, cy, r);
            polarSeries.forEach(function (series) {
                series.centerX = cx;
                series.centerY = cy;
                series.radius = r;
            });
            var pieSeries = polarSeries.filter(function (series) { return series instanceof pieSeries_1.PieSeries; });
            if (pieSeries.length > 1) {
                var innerRadii = pieSeries
                    .map(function (series) {
                    var innerRadius = series.getInnerRadius();
                    return { series: series, innerRadius: innerRadius };
                })
                    .sort(function (a, b) { return a.innerRadius - b.innerRadius; });
                innerRadii[innerRadii.length - 1].series.surroundingRadius = undefined;
                for (var i = 0; i < innerRadii.length - 1; i++) {
                    innerRadii[i].series.surroundingRadius = innerRadii[i + 1].innerRadius;
                }
            }
        };
        var centerX = seriesBox.x + seriesBox.width / 2;
        var centerY = seriesBox.y + seriesBox.height / 2;
        var initialRadius = Math.max(0, Math.min(seriesBox.width, seriesBox.height) / 2);
        var radius = initialRadius;
        setSeriesCircle(centerX, centerY, radius);
        var shake = function (_a) {
            var e_1, _b;
            var _c = _a === void 0 ? {} : _a, _d = _c.hideWhenNecessary, hideWhenNecessary = _d === void 0 ? false : _d;
            var labelBoxes = [];
            try {
                for (var _e = __values(__spreadArray(__spreadArray([], __read(polarAxes)), __read(polarSeries))), _f = _e.next(); !_f.done; _f = _e.next()) {
                    var series = _f.value;
                    var box = series.computeLabelsBBox({ hideWhenNecessary: hideWhenNecessary }, seriesBox);
                    if (box) {
                        labelBoxes.push(box);
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
                }
                finally { if (e_1) throw e_1.error; }
            }
            if (labelBoxes.length === 0) {
                setSeriesCircle(centerX, centerY, initialRadius);
                return;
            }
            var labelBox = bbox_1.BBox.merge(labelBoxes);
            var refined = _this.refineCircle(labelBox, radius, seriesBox);
            setSeriesCircle(refined.centerX, refined.centerY, refined.radius);
            if (refined.radius === radius) {
                return;
            }
            radius = refined.radius;
        };
        shake(); // Initial attempt
        shake(); // Precise attempt
        shake(); // Just in case
        shake({ hideWhenNecessary: true }); // Hide unnecessary labels
        shake({ hideWhenNecessary: true }); // Final result
        return { radius: radius, centerX: centerX, centerY: centerY };
    };
    PolarChart.prototype.refineCircle = function (labelsBox, radius, seriesBox) {
        var minCircleRatio = 0.5; // Prevents reduced circle to be too small
        var circleLeft = -radius;
        var circleTop = -radius;
        var circleRight = radius;
        var circleBottom = radius;
        // Label padding around the circle
        var padLeft = Math.max(0, circleLeft - labelsBox.x);
        var padTop = Math.max(0, circleTop - labelsBox.y);
        var padRight = Math.max(0, labelsBox.x + labelsBox.width - circleRight);
        var padBottom = Math.max(0, labelsBox.y + labelsBox.height - circleBottom);
        // Available area for the circle (after the padding will be applied)
        var availCircleWidth = seriesBox.width - padLeft - padRight;
        var availCircleHeight = seriesBox.height - padTop - padBottom;
        var newRadius = Math.min(availCircleWidth, availCircleHeight) / 2;
        var minHorizontalRadius = (minCircleRatio * seriesBox.width) / 2;
        var minVerticalRadius = (minCircleRatio * seriesBox.height) / 2;
        var minRadius = Math.min(minHorizontalRadius, minVerticalRadius);
        if (newRadius < minRadius) {
            // If the radius is too small, reduce the label padding
            newRadius = minRadius;
            var horizontalPadding = padLeft + padRight;
            var verticalPadding = padTop + padBottom;
            if (2 * newRadius + verticalPadding > seriesBox.height) {
                var padHeight = seriesBox.height - 2 * newRadius;
                if (Math.min(padTop, padBottom) * 2 > padHeight) {
                    padTop = padHeight / 2;
                    padBottom = padHeight / 2;
                }
                else if (padTop > padBottom) {
                    padTop = padHeight - padBottom;
                }
                else {
                    padBottom = padHeight - padTop;
                }
            }
            if (2 * newRadius + horizontalPadding > seriesBox.width) {
                var padWidth = seriesBox.width - 2 * newRadius;
                if (Math.min(padLeft, padRight) * 2 > padWidth) {
                    padLeft = padWidth / 2;
                    padRight = padWidth / 2;
                }
                else if (padLeft > padRight) {
                    padLeft = padWidth - padRight;
                }
                else {
                    padRight = padWidth - padLeft;
                }
            }
        }
        var newWidth = padLeft + 2 * newRadius + padRight;
        var newHeight = padTop + 2 * newRadius + padBottom;
        return {
            centerX: seriesBox.x + (seriesBox.width - newWidth) / 2 + padLeft + newRadius,
            centerY: seriesBox.y + (seriesBox.height - newHeight) / 2 + padTop + newRadius,
            radius: newRadius,
        };
    };
    PolarChart.className = 'PolarChart';
    PolarChart.type = 'polar';
    return PolarChart;
}(chart_1.Chart));
exports.PolarChart = PolarChart;
//# sourceMappingURL=polarChart.js.map