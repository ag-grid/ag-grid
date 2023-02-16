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
import { Chart } from './chart';
import { PolarSeries } from './series/polar/polarSeries';
import { Padding } from '../util/padding';
import { BBox } from '../scene/bbox';
var PolarChart = /** @class */ (function (_super) {
    __extends(PolarChart, _super);
    function PolarChart(document, overrideDevicePixelRatio, resources) {
        if (document === void 0) { document = window.document; }
        var _this = _super.call(this, document, overrideDevicePixelRatio, resources) || this;
        _this.padding = new Padding(40);
        var root = _this.scene.root;
        _this.legend.attachLegend(root);
        return _this;
    }
    PolarChart.prototype.performLayout = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, width, height, padding, shrinkRect;
            return __generator(this, function (_b) {
                this.scene.root.visible = true;
                _a = this, width = _a.width, height = _a.height, padding = _a.padding;
                shrinkRect = new BBox(0, 0, width, height);
                shrinkRect.shrink(padding.left, 'left');
                shrinkRect.shrink(padding.top, 'top');
                shrinkRect.shrink(padding.right, 'right');
                shrinkRect.shrink(padding.bottom, 'bottom');
                shrinkRect = this.positionCaptions(shrinkRect);
                shrinkRect = this.positionLegend(shrinkRect);
                this.computeSeriesRect(shrinkRect);
                this.computeCircle();
                return [2 /*return*/];
            });
        });
    };
    PolarChart.prototype.computeSeriesRect = function (shrinkRect) {
        var legend = this.legend;
        if (legend.visible && legend.enabled && legend.data.length) {
            var legendPadding = legend.spacing;
            shrinkRect.shrink(legendPadding, legend.position);
        }
        this.seriesRect = shrinkRect;
    };
    PolarChart.prototype.computeCircle = function () {
        var _this = this;
        var seriesBox = this.seriesRect;
        var polarSeries = this.series.filter(function (series) {
            return series instanceof PolarSeries;
        });
        var setSeriesCircle = function (cx, cy, r) {
            polarSeries.forEach(function (series) {
                series.centerX = cx;
                series.centerY = cy;
                series.radius = r;
            });
        };
        var centerX = seriesBox.x + seriesBox.width / 2;
        var centerY = seriesBox.y + seriesBox.height / 2;
        var initialRadius = Math.max(0, Math.min(seriesBox.width, seriesBox.height) / 2);
        var radius = initialRadius;
        setSeriesCircle(centerX, centerY, radius);
        var shake = function (_a) {
            var _b = (_a === void 0 ? {} : _a).hideWhenNecessary, hideWhenNecessary = _b === void 0 ? false : _b;
            var labelBoxes = polarSeries
                .map(function (series) { return series.computeLabelsBBox({ hideWhenNecessary: hideWhenNecessary }); })
                .filter(function (box) { return box != null; });
            if (labelBoxes.length === 0) {
                setSeriesCircle(centerX, centerY, initialRadius);
                return;
            }
            var labelBox = BBox.merge(labelBoxes);
            var refined = _this.refineCircle(labelBox, radius);
            setSeriesCircle(refined.centerX, refined.centerY, refined.radius);
            if (refined.radius === radius) {
                return;
            }
            radius = refined.radius;
        };
        shake(); // Initial attempt
        shake(); // Precise attempt
        shake({ hideWhenNecessary: true }); // Hide unnecessary labels
        shake({ hideWhenNecessary: true }); // Final result
    };
    PolarChart.prototype.refineCircle = function (labelsBox, radius) {
        var minCircleRatio = 0.5; // Prevents reduced circle to be too small
        var seriesBox = this.seriesRect;
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
            if (newRadius === minVerticalRadius) {
                var t = seriesBox.height / (newRadius * 2 + padTop + padBottom);
                padTop *= t;
                padBottom *= t;
            }
            if (newRadius === minHorizontalRadius) {
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
}(Chart));
export { PolarChart };
