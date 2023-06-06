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
import { Chart } from './chart';
import { PolarSeries } from './series/polar/polarSeries';
import { Padding } from '../util/padding';
import { BBox } from '../scene/bbox';
import { PieSeries } from './series/polar/pieSeries';
var PolarChart = /** @class */ (function (_super) {
    __extends(PolarChart, _super);
    function PolarChart(document, overrideDevicePixelRatio, resources) {
        if (document === void 0) { document = window.document; }
        var _this = _super.call(this, document, overrideDevicePixelRatio, resources) || this;
        _this.padding = new Padding(40);
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
                        this.computeCircle();
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
    PolarChart.prototype.computeSeriesRect = function (shrinkRect) {
        var seriesAreaPadding = this.seriesAreaPadding;
        shrinkRect.shrink(seriesAreaPadding.left, 'left');
        shrinkRect.shrink(seriesAreaPadding.top, 'top');
        shrinkRect.shrink(seriesAreaPadding.right, 'right');
        shrinkRect.shrink(seriesAreaPadding.bottom, 'bottom');
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
            var pieSeries = polarSeries.filter(function (series) { return series instanceof PieSeries; });
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
                for (var polarSeries_1 = __values(polarSeries), polarSeries_1_1 = polarSeries_1.next(); !polarSeries_1_1.done; polarSeries_1_1 = polarSeries_1.next()) {
                    var series = polarSeries_1_1.value;
                    var box = series.computeLabelsBBox({ hideWhenNecessary: hideWhenNecessary }, seriesBox);
                    if (box == null)
                        continue;
                    labelBoxes.push(box);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (polarSeries_1_1 && !polarSeries_1_1.done && (_b = polarSeries_1.return)) _b.call(polarSeries_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
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
        shake(); // Just in case
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
}(Chart));
export { PolarChart };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9sYXJDaGFydC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jaGFydC9wb2xhckNoYXJ0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsT0FBTyxFQUFFLEtBQUssRUFBeUIsTUFBTSxTQUFTLENBQUM7QUFDdkQsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBQ3pELE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUMxQyxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRXJDLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUVyRDtJQUFnQyw4QkFBSztJQU1qQyxvQkFBWSxRQUEwQixFQUFFLHdCQUFpQyxFQUFFLFNBQWlDO1FBQWhHLHlCQUFBLEVBQUEsV0FBVyxNQUFNLENBQUMsUUFBUTtRQUF0QyxZQUNJLGtCQUFNLFFBQVEsRUFBRSx3QkFBd0IsRUFBRSxTQUFTLENBQUMsU0FDdkQ7UUFKRCxhQUFPLEdBQUcsSUFBSSxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7O0lBSTFCLENBQUM7SUFFSyxrQ0FBYSxHQUFuQjs7Ozs7NEJBQ3VCLHFCQUFNLGlCQUFNLGFBQWEsV0FBRSxFQUFBOzt3QkFBeEMsVUFBVSxHQUFHLFNBQTJCO3dCQUV4QyxjQUFjLEdBQUcsVUFBVSxDQUFDLEtBQUssRUFBRSxDQUFDO3dCQUMxQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsVUFBVSxDQUFDLENBQUM7d0JBQ25DLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQzt3QkFFZixnQkFBZ0IsR0FBRyxFQUFFLENBQUM7d0JBQ3RCLFNBQVMsR0FBRyxVQUFVLENBQUMsS0FBSyxFQUFFLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUM7d0JBQzVELElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO3dCQUUzQixJQUFJLENBQUMsYUFBYSxDQUFDLHNCQUFzQixDQUFDOzRCQUN0QyxJQUFJLEVBQUUsaUJBQWlCOzRCQUN2QixLQUFLLEVBQUUsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFOzRCQUM3RCxNQUFNLEVBQUUsRUFBRSxJQUFJLEVBQUUsY0FBYyxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsU0FBUyxXQUFBLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRTs0QkFDbEYsSUFBSSxFQUFFLEVBQUU7eUJBQ1gsQ0FBQyxDQUFDO3dCQUVILHNCQUFPLFVBQVUsRUFBQzs7OztLQUNyQjtJQUVPLHNDQUFpQixHQUF6QixVQUEwQixVQUFnQjtRQUM5QixJQUFBLGlCQUFpQixHQUFLLElBQUksa0JBQVQsQ0FBVTtRQUVuQyxVQUFVLENBQUMsTUFBTSxDQUFDLGlCQUFpQixDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQztRQUNsRCxVQUFVLENBQUMsTUFBTSxDQUFDLGlCQUFpQixDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNoRCxVQUFVLENBQUMsTUFBTSxDQUFDLGlCQUFpQixDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQztRQUNwRCxVQUFVLENBQUMsTUFBTSxDQUFDLGlCQUFpQixDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQztRQUV0RCxJQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQztJQUNqQyxDQUFDO0lBRU8sa0NBQWEsR0FBckI7UUFBQSxpQkFnRUM7UUEvREcsSUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLFVBQVcsQ0FBQztRQUNuQyxJQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxVQUFDLE1BQU07WUFDMUMsT0FBTyxNQUFNLFlBQVksV0FBVyxDQUFDO1FBQ3pDLENBQUMsQ0FBbUMsQ0FBQztRQUVyQyxJQUFNLGVBQWUsR0FBRyxVQUFDLEVBQVUsRUFBRSxFQUFVLEVBQUUsQ0FBUztZQUN0RCxXQUFXLENBQUMsT0FBTyxDQUFDLFVBQUMsTUFBTTtnQkFDdkIsTUFBTSxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7Z0JBQ3BCLE1BQU0sQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO2dCQUNwQixNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztZQUN0QixDQUFDLENBQUMsQ0FBQztZQUVILElBQU0sU0FBUyxHQUFHLFdBQVcsQ0FBQyxNQUFNLENBQUMsVUFBQyxNQUFNLElBQTBCLE9BQUEsTUFBTSxZQUFZLFNBQVMsRUFBM0IsQ0FBMkIsQ0FBQyxDQUFDO1lBQ25HLElBQUksU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7Z0JBQ3RCLElBQU0sVUFBVSxHQUFHLFNBQVM7cUJBQ3ZCLEdBQUcsQ0FBQyxVQUFDLE1BQU07b0JBQ1IsSUFBTSxXQUFXLEdBQUcsTUFBTSxDQUFDLGNBQWMsRUFBRSxDQUFDO29CQUM1QyxPQUFPLEVBQUUsTUFBTSxRQUFBLEVBQUUsV0FBVyxhQUFBLEVBQUUsQ0FBQztnQkFDbkMsQ0FBQyxDQUFDO3FCQUNELElBQUksQ0FBQyxVQUFDLENBQUMsRUFBRSxDQUFDLElBQUssT0FBQSxDQUFDLENBQUMsV0FBVyxHQUFHLENBQUMsQ0FBQyxXQUFXLEVBQTdCLENBQTZCLENBQUMsQ0FBQztnQkFDbkQsVUFBVSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLGlCQUFpQixHQUFHLFNBQVMsQ0FBQztnQkFDdkUsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO29CQUM1QyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLGlCQUFpQixHQUFHLFVBQVUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDO2lCQUMxRTthQUNKO1FBQ0wsQ0FBQyxDQUFDO1FBRUYsSUFBTSxPQUFPLEdBQUcsU0FBUyxDQUFDLENBQUMsR0FBRyxTQUFTLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztRQUNsRCxJQUFNLE9BQU8sR0FBRyxTQUFTLENBQUMsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO1FBQ25ELElBQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSxTQUFTLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDbkYsSUFBSSxNQUFNLEdBQUcsYUFBYSxDQUFDO1FBQzNCLGVBQWUsQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBRTFDLElBQU0sS0FBSyxHQUFHLFVBQUMsRUFBa0M7O2dCQUFsQyxxQkFBZ0MsRUFBRSxLQUFBLEVBQWhDLHlCQUF5QixFQUF6QixpQkFBaUIsbUJBQUcsS0FBSyxLQUFBO1lBQ3RDLElBQU0sVUFBVSxHQUFHLEVBQUUsQ0FBQzs7Z0JBQ3RCLEtBQXFCLElBQUEsZ0JBQUEsU0FBQSxXQUFXLENBQUEsd0NBQUEsaUVBQUU7b0JBQTdCLElBQU0sTUFBTSx3QkFBQTtvQkFDYixJQUFNLEdBQUcsR0FBRyxNQUFNLENBQUMsaUJBQWlCLENBQUMsRUFBRSxpQkFBaUIsbUJBQUEsRUFBRSxFQUFFLFNBQVMsQ0FBQyxDQUFDO29CQUN2RSxJQUFJLEdBQUcsSUFBSSxJQUFJO3dCQUFFLFNBQVM7b0JBRTFCLFVBQVUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7aUJBQ3hCOzs7Ozs7Ozs7WUFFRCxJQUFJLFVBQVUsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO2dCQUN6QixlQUFlLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBRSxhQUFhLENBQUMsQ0FBQztnQkFDakQsT0FBTzthQUNWO1lBRUQsSUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUN4QyxJQUFNLE9BQU8sR0FBRyxLQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsQ0FBQztZQUNwRCxlQUFlLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUVsRSxJQUFJLE9BQU8sQ0FBQyxNQUFNLEtBQUssTUFBTSxFQUFFO2dCQUMzQixPQUFPO2FBQ1Y7WUFFRCxNQUFNLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQztRQUM1QixDQUFDLENBQUM7UUFFRixLQUFLLEVBQUUsQ0FBQyxDQUFDLGtCQUFrQjtRQUMzQixLQUFLLEVBQUUsQ0FBQyxDQUFDLGtCQUFrQjtRQUMzQixLQUFLLEVBQUUsQ0FBQyxDQUFDLGVBQWU7UUFDeEIsS0FBSyxDQUFDLEVBQUUsaUJBQWlCLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLDBCQUEwQjtRQUM5RCxLQUFLLENBQUMsRUFBRSxpQkFBaUIsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsZUFBZTtJQUN2RCxDQUFDO0lBRU8saUNBQVksR0FBcEIsVUFBcUIsU0FBZSxFQUFFLE1BQWM7UUFDaEQsSUFBTSxjQUFjLEdBQUcsR0FBRyxDQUFDLENBQUMsMENBQTBDO1FBRXRFLElBQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxVQUFXLENBQUM7UUFDbkMsSUFBTSxVQUFVLEdBQUcsQ0FBQyxNQUFNLENBQUM7UUFDM0IsSUFBTSxTQUFTLEdBQUcsQ0FBQyxNQUFNLENBQUM7UUFDMUIsSUFBTSxXQUFXLEdBQUcsTUFBTSxDQUFDO1FBQzNCLElBQU0sWUFBWSxHQUFHLE1BQU0sQ0FBQztRQUU1QixrQ0FBa0M7UUFDbEMsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsVUFBVSxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNwRCxJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxTQUFTLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2xELElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLFNBQVMsQ0FBQyxDQUFDLEdBQUcsU0FBUyxDQUFDLEtBQUssR0FBRyxXQUFXLENBQUMsQ0FBQztRQUN4RSxJQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxNQUFNLEdBQUcsWUFBWSxDQUFDLENBQUM7UUFFM0Usb0VBQW9FO1FBQ3BFLElBQU0sZ0JBQWdCLEdBQUcsU0FBUyxDQUFDLEtBQUssR0FBRyxPQUFPLEdBQUcsUUFBUSxDQUFDO1FBQzlELElBQU0saUJBQWlCLEdBQUcsU0FBUyxDQUFDLE1BQU0sR0FBRyxNQUFNLEdBQUcsU0FBUyxDQUFDO1FBRWhFLElBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLEVBQUUsaUJBQWlCLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDbEUsSUFBTSxtQkFBbUIsR0FBRyxDQUFDLGNBQWMsR0FBRyxTQUFTLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ25FLElBQU0saUJBQWlCLEdBQUcsQ0FBQyxjQUFjLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNsRSxJQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLG1CQUFtQixFQUFFLGlCQUFpQixDQUFDLENBQUM7UUFDbkUsSUFBSSxTQUFTLEdBQUcsU0FBUyxFQUFFO1lBQ3ZCLHVEQUF1RDtZQUN2RCxTQUFTLEdBQUcsU0FBUyxDQUFDO1lBQ3RCLElBQU0saUJBQWlCLEdBQUcsT0FBTyxHQUFHLFFBQVEsQ0FBQztZQUM3QyxJQUFNLGVBQWUsR0FBRyxNQUFNLEdBQUcsU0FBUyxDQUFDO1lBQzNDLElBQUksQ0FBQyxHQUFHLFNBQVMsR0FBRyxlQUFlLEdBQUcsU0FBUyxDQUFDLE1BQU0sRUFBRTtnQkFDcEQsSUFBTSxTQUFTLEdBQUcsU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLEdBQUcsU0FBUyxDQUFDO2dCQUNuRCxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLFNBQVMsQ0FBQyxHQUFHLENBQUMsR0FBRyxTQUFTLEVBQUU7b0JBQzdDLE1BQU0sR0FBRyxTQUFTLEdBQUcsQ0FBQyxDQUFDO29CQUN2QixTQUFTLEdBQUcsU0FBUyxHQUFHLENBQUMsQ0FBQztpQkFDN0I7cUJBQU0sSUFBSSxNQUFNLEdBQUcsU0FBUyxFQUFFO29CQUMzQixNQUFNLEdBQUcsU0FBUyxHQUFHLFNBQVMsQ0FBQztpQkFDbEM7cUJBQU07b0JBQ0gsU0FBUyxHQUFHLFNBQVMsR0FBRyxNQUFNLENBQUM7aUJBQ2xDO2FBQ0o7WUFFRCxJQUFJLENBQUMsR0FBRyxTQUFTLEdBQUcsaUJBQWlCLEdBQUcsU0FBUyxDQUFDLEtBQUssRUFBRTtnQkFDckQsSUFBTSxRQUFRLEdBQUcsU0FBUyxDQUFDLEtBQUssR0FBRyxDQUFDLEdBQUcsU0FBUyxDQUFDO2dCQUNqRCxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxHQUFHLENBQUMsR0FBRyxRQUFRLEVBQUU7b0JBQzVDLE9BQU8sR0FBRyxRQUFRLEdBQUcsQ0FBQyxDQUFDO29CQUN2QixRQUFRLEdBQUcsUUFBUSxHQUFHLENBQUMsQ0FBQztpQkFDM0I7cUJBQU0sSUFBSSxPQUFPLEdBQUcsUUFBUSxFQUFFO29CQUMzQixPQUFPLEdBQUcsUUFBUSxHQUFHLFFBQVEsQ0FBQztpQkFDakM7cUJBQU07b0JBQ0gsUUFBUSxHQUFHLFFBQVEsR0FBRyxPQUFPLENBQUM7aUJBQ2pDO2FBQ0o7U0FDSjtRQUVELElBQU0sUUFBUSxHQUFHLE9BQU8sR0FBRyxDQUFDLEdBQUcsU0FBUyxHQUFHLFFBQVEsQ0FBQztRQUNwRCxJQUFNLFNBQVMsR0FBRyxNQUFNLEdBQUcsQ0FBQyxHQUFHLFNBQVMsR0FBRyxTQUFTLENBQUM7UUFFckQsT0FBTztZQUNILE9BQU8sRUFBRSxTQUFTLENBQUMsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLEtBQUssR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLEdBQUcsT0FBTyxHQUFHLFNBQVM7WUFDN0UsT0FBTyxFQUFFLFNBQVMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFHLFNBQVMsQ0FBQyxHQUFHLENBQUMsR0FBRyxNQUFNLEdBQUcsU0FBUztZQUM5RSxNQUFNLEVBQUUsU0FBUztTQUNwQixDQUFDO0lBQ04sQ0FBQztJQXhLTSxvQkFBUyxHQUFHLFlBQVksQ0FBQztJQUN6QixlQUFJLEdBQUcsT0FBZ0IsQ0FBQztJQXdLbkMsaUJBQUM7Q0FBQSxBQTFLRCxDQUFnQyxLQUFLLEdBMEtwQztTQTFLWSxVQUFVIn0=