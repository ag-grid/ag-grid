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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
import { Chart } from './chart';
import { CategoryAxis } from './axis/categoryAxis';
import { GroupedCategoryAxis } from './axis/groupedCategoryAxis';
import { ChartAxisDirection } from './chartAxisDirection';
import { Logger } from '../util/logger';
import { toRadians } from '../util/angle';
var directions = ['top', 'right', 'bottom', 'left'];
var CartesianChart = /** @class */ (function (_super) {
    __extends(CartesianChart, _super);
    function CartesianChart(document, overrideDevicePixelRatio, resources) {
        if (document === void 0) { document = window.document; }
        var _this = _super.call(this, document, overrideDevicePixelRatio, resources) || this;
        /** Integrated Charts feature state - not used in Standalone Charts. */
        _this.paired = true;
        _this._lastAxisWidths = {
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
        };
        _this._lastVisibility = {
            crossLines: true,
            series: true,
        };
        return _this;
    }
    CartesianChart.prototype.performLayout = function () {
        return __awaiter(this, void 0, void 0, function () {
            var shrinkRect, _a, seriesRect, visibility, clipSeries, _b, seriesRoot, seriesAreaPadding, seriesPaddedRect, hoverRectPadding, hoverRect;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, _super.prototype.performLayout.call(this)];
                    case 1:
                        shrinkRect = _c.sent();
                        _a = this.updateAxes(shrinkRect), seriesRect = _a.seriesRect, visibility = _a.visibility, clipSeries = _a.clipSeries;
                        this.seriesRoot.visible = visibility.series;
                        this.seriesRect = seriesRect;
                        this.series.forEach(function (series) {
                            series.rootGroup.translationX = Math.floor(seriesRect.x);
                            series.rootGroup.translationY = Math.floor(seriesRect.y);
                        });
                        _b = this, seriesRoot = _b.seriesRoot, seriesAreaPadding = _b.seriesAreaPadding;
                        seriesPaddedRect = seriesRect.clone().grow(seriesAreaPadding);
                        hoverRectPadding = 20;
                        hoverRect = seriesPaddedRect.clone().grow(hoverRectPadding);
                        this.hoverRect = hoverRect;
                        this.layoutService.dispatchLayoutComplete({
                            type: 'layout-complete',
                            chart: { width: this.scene.width, height: this.scene.height },
                            series: { rect: seriesRect, paddedRect: seriesPaddedRect, hoverRect: hoverRect, visible: visibility.series },
                            axes: this.axes.map(function (axis) { return (__assign({ id: axis.id }, axis.getLayoutState())); }),
                        });
                        if (clipSeries) {
                            seriesRoot.setClipRectInGroupCoordinateSpace(seriesPaddedRect);
                        }
                        else {
                            seriesRoot.setClipRectInGroupCoordinateSpace();
                        }
                        return [2 /*return*/, shrinkRect];
                }
            });
        });
    };
    CartesianChart.prototype.updateAxes = function (inputShrinkRect) {
        var e_1, _a;
        var _b;
        // Start with a good approximation from the last update - this should mean that in many resize
        // cases that only a single pass is needed \o/.
        var axisWidths = __assign({}, this._lastAxisWidths);
        var visibility = __assign({}, this._lastVisibility);
        // Clean any positions which aren't valid with the current axis status (otherwise we end up
        // never being able to find a stable result).
        var liveAxisWidths = new Set(this._axes.map(function (a) { return a.position; }));
        try {
            for (var _c = __values(Object.keys(axisWidths)), _d = _c.next(); !_d.done; _d = _c.next()) {
                var position = _d.value;
                if (!liveAxisWidths.has(position)) {
                    delete axisWidths[position];
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
            }
            finally { if (e_1) throw e_1.error; }
        }
        var stableOutputs = function (otherAxisWidths, otherVisibility) {
            // Check for new axis positions.
            if (Object.keys(otherAxisWidths).some(function (k) { return axisWidths[k] == null; })) {
                return false;
            }
            return (visibility.crossLines === otherVisibility.crossLines &&
                visibility.series === otherVisibility.series &&
                // Check for existing axis positions and equality.
                Object.entries(axisWidths).every(function (_a) {
                    var _b = __read(_a, 2), p = _b[0], w = _b[1];
                    var otherW = otherAxisWidths[p];
                    if (w != null || otherW != null) {
                        return w === otherW;
                    }
                    return true;
                }));
        };
        var ceilValues = function (records) {
            return Object.entries(records).reduce(function (out, _a) {
                var _b = __read(_a, 2), key = _b[0], value = _b[1];
                if (value && Math.abs(value) === Infinity) {
                    value = 0;
                }
                out[key] = value != null ? Math.ceil(value) : value;
                return out;
            }, {});
        };
        // Iteratively try to resolve axis widths - since X axis width affects Y axis range,
        // and vice-versa, we need to iteratively try and find a fit for the axes and their
        // ticks/labels.
        var lastPassAxisWidths = {};
        var lastPassVisibility = {};
        var clipSeries = false;
        var seriesRect = (_b = this.seriesRect) === null || _b === void 0 ? void 0 : _b.clone();
        var count = 0;
        do {
            Object.assign(axisWidths, lastPassAxisWidths);
            Object.assign(visibility, lastPassVisibility);
            var result = this.updateAxesPass(axisWidths, inputShrinkRect.clone(), seriesRect);
            lastPassAxisWidths = ceilValues(result.axisWidths);
            lastPassVisibility = result.visibility;
            clipSeries = result.clipSeries;
            seriesRect = result.seriesRect;
            if (count++ > 10) {
                Logger.warn('unable to find stable axis layout.');
                break;
            }
        } while (!stableOutputs(lastPassAxisWidths, lastPassVisibility));
        var clipRectPadding = 5;
        this.axes.forEach(function (axis) {
            // update visibility of crosslines
            axis.setCrossLinesVisible(visibility.crossLines);
            if (!seriesRect) {
                return;
            }
            axis.clipGrid(seriesRect.x, seriesRect.y, seriesRect.width + clipRectPadding, seriesRect.height + clipRectPadding);
            switch (axis.position) {
                case 'left':
                case 'right':
                    axis.clipTickLines(inputShrinkRect.x, seriesRect.y, inputShrinkRect.width + clipRectPadding, seriesRect.height + clipRectPadding);
                    break;
                case 'top':
                case 'bottom':
                    axis.clipTickLines(seriesRect.x, inputShrinkRect.y, seriesRect.width + clipRectPadding, inputShrinkRect.height + clipRectPadding);
                    break;
            }
        });
        this._lastAxisWidths = axisWidths;
        this._lastVisibility = visibility;
        return { seriesRect: seriesRect, visibility: visibility, clipSeries: clipSeries };
    };
    CartesianChart.prototype.updateAxesPass = function (axisWidths, bounds, lastPassSeriesRect) {
        var _this = this;
        var axes = this.axes;
        var visited = {};
        var newAxisWidths = {};
        var visibility = {
            series: true,
            crossLines: true,
        };
        var clipSeries = false;
        var primaryTickCounts = {};
        var paddedBounds = this.applySeriesPadding(bounds);
        var crossLinePadding = lastPassSeriesRect ? this.buildCrossLinePadding(axisWidths) : {};
        var axisBound = this.buildAxisBound(paddedBounds, axisWidths, crossLinePadding, visibility);
        var seriesRect = this.buildSeriesRect(axisBound, axisWidths);
        // Set the number of ticks for continuous axes based on the available range
        // before updating the axis domain via `this.updateAxes()` as the tick count has an effect on the calculated `nice` domain extent
        axes.forEach(function (axis) {
            var _a, _b;
            var position = axis.position;
            var _c = _this.calculateAxisDimensions({
                axis: axis,
                seriesRect: seriesRect,
                paddedBounds: paddedBounds,
                axisWidths: axisWidths,
                newAxisWidths: newAxisWidths,
                primaryTickCounts: primaryTickCounts,
                clipSeries: clipSeries,
                addInterAxisPadding: ((_a = visited[position]) !== null && _a !== void 0 ? _a : 0) > 0,
            }), newClipSeries = _c.clipSeries, axisThickness = _c.axisThickness, axisOffset = _c.axisOffset;
            visited[position] = ((_b = visited[position]) !== null && _b !== void 0 ? _b : 0) + 1;
            clipSeries = clipSeries || newClipSeries;
            _this.positionAxis({
                axis: axis,
                axisBound: axisBound,
                axisOffset: axisOffset,
                axisThickness: axisThickness,
                axisWidths: axisWidths,
                primaryTickCounts: primaryTickCounts,
                seriesRect: seriesRect,
            });
        });
        return { clipSeries: clipSeries, seriesRect: seriesRect, axisWidths: newAxisWidths, visibility: visibility };
    };
    CartesianChart.prototype.buildCrossLinePadding = function (axisWidths) {
        var e_2, _a;
        var _b;
        var crossLinePadding = {};
        this.axes.forEach(function (axis) {
            if (axis.crossLines) {
                axis.crossLines.forEach(function (crossLine) {
                    crossLine.calculatePadding(crossLinePadding);
                });
            }
        });
        try {
            // Reduce cross-line padding to account for overlap with axes.
            for (var _c = __values(Object.entries(crossLinePadding)), _d = _c.next(); !_d.done; _d = _c.next()) {
                var _e = __read(_d.value, 2), side = _e[0], _f = _e[1], padding = _f === void 0 ? 0 : _f;
                crossLinePadding[side] = Math.max(padding - ((_b = axisWidths[side]) !== null && _b !== void 0 ? _b : 0), 0);
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
            }
            finally { if (e_2) throw e_2.error; }
        }
        return crossLinePadding;
    };
    CartesianChart.prototype.applySeriesPadding = function (bounds) {
        var _this = this;
        var paddedRect = bounds.clone();
        var reversedAxes = this.axes.slice().reverse();
        directions.forEach(function (dir) {
            var padding = _this.seriesAreaPadding[dir];
            var axis = reversedAxes.find(function (axis) { return axis.position === dir; });
            if (axis) {
                axis.seriesAreaPadding = padding;
            }
            else {
                paddedRect.shrink(padding, dir);
            }
        });
        return paddedRect;
    };
    CartesianChart.prototype.buildAxisBound = function (bounds, axisWidths, crossLinePadding, visibility) {
        var _a, _b, _c, _d;
        var result = bounds.clone();
        var _e = crossLinePadding.top, top = _e === void 0 ? 0 : _e, _f = crossLinePadding.right, right = _f === void 0 ? 0 : _f, _g = crossLinePadding.bottom, bottom = _g === void 0 ? 0 : _g, _h = crossLinePadding.left, left = _h === void 0 ? 0 : _h;
        var horizontalPadding = left + right;
        var verticalPadding = top + bottom;
        var totalWidth = ((_a = axisWidths.left) !== null && _a !== void 0 ? _a : 0) + ((_b = axisWidths.right) !== null && _b !== void 0 ? _b : 0) + horizontalPadding;
        var totalHeight = ((_c = axisWidths.top) !== null && _c !== void 0 ? _c : 0) + ((_d = axisWidths.bottom) !== null && _d !== void 0 ? _d : 0) + verticalPadding;
        if (result.width <= totalWidth || result.height <= totalHeight) {
            // Not enough space for crossLines and series
            visibility.crossLines = false;
            visibility.series = false;
            return result;
        }
        result.x += left;
        result.y += top;
        result.width -= horizontalPadding;
        result.height -= verticalPadding;
        return result;
    };
    CartesianChart.prototype.buildSeriesRect = function (axisBound, axisWidths) {
        var result = axisBound.clone();
        var top = axisWidths.top, bottom = axisWidths.bottom, left = axisWidths.left, right = axisWidths.right;
        result.x += left !== null && left !== void 0 ? left : 0;
        result.y += top !== null && top !== void 0 ? top : 0;
        result.width -= (left !== null && left !== void 0 ? left : 0) + (right !== null && right !== void 0 ? right : 0);
        result.height -= (top !== null && top !== void 0 ? top : 0) + (bottom !== null && bottom !== void 0 ? bottom : 0);
        // Width and height should not be negative.
        result.width = Math.max(0, result.width);
        result.height = Math.max(0, result.height);
        return result;
    };
    CartesianChart.prototype.clampToOutsideSeriesRect = function (seriesRect, value, dimension, direction) {
        var x = seriesRect.x, y = seriesRect.y, width = seriesRect.width, height = seriesRect.height;
        var clampBounds = [x, y, x + width, y + height];
        var fn = direction === 1 ? Math.min : Math.max;
        var compareTo = clampBounds[(dimension === 'x' ? 0 : 1) + (direction === 1 ? 0 : 2)];
        return fn(value, compareTo);
    };
    CartesianChart.prototype.calculateAxisDimensions = function (opts) {
        var _a, _b, _c, _d, _e, _f;
        var axis = opts.axis, seriesRect = opts.seriesRect, paddedBounds = opts.paddedBounds, axisWidths = opts.axisWidths, newAxisWidths = opts.newAxisWidths, primaryTickCounts = opts.primaryTickCounts, addInterAxisPadding = opts.addInterAxisPadding;
        var clipSeries = opts.clipSeries;
        var position = axis.position, direction = axis.direction;
        var axisLeftRightRange = function (axis) {
            if (axis instanceof CategoryAxis || axis instanceof GroupedCategoryAxis) {
                return [0, seriesRect.height];
            }
            return [seriesRect.height, 0];
        };
        var axisOffset = (_a = newAxisWidths[position]) !== null && _a !== void 0 ? _a : 0;
        switch (position) {
            case 'top':
            case 'bottom':
                axis.range = [0, seriesRect.width];
                axis.gridLength = seriesRect.height;
                break;
            case 'right':
            case 'left':
                axis.range = axisLeftRightRange(axis);
                axis.gridLength = seriesRect.width;
                break;
        }
        var zoom = (_b = this.zoomManager.getZoom()) === null || _b === void 0 ? void 0 : _b[axis.direction];
        var _g = zoom !== null && zoom !== void 0 ? zoom : {}, _h = _g.min, min = _h === void 0 ? 0 : _h, _j = _g.max, max = _j === void 0 ? 1 : _j;
        axis.visibleRange = [min, max];
        if (!clipSeries && (axis.visibleRange[0] > 0 || axis.visibleRange[1] < 1)) {
            clipSeries = true;
        }
        var primaryTickCount = axis.nice ? primaryTickCounts[direction] : undefined;
        var paddedBoundsCoefficient = 0.3;
        if (axis.thickness > 0) {
            axis.maxThickness = axis.thickness;
        }
        else if (direction === ChartAxisDirection.Y) {
            axis.maxThickness = paddedBounds.width * paddedBoundsCoefficient;
        }
        else {
            axis.maxThickness = paddedBounds.height * paddedBoundsCoefficient;
        }
        primaryTickCount = axis.update(primaryTickCount);
        primaryTickCounts[direction] = (_c = primaryTickCounts[direction]) !== null && _c !== void 0 ? _c : primaryTickCount;
        var axisThickness = 0;
        if (axis.thickness) {
            axisThickness = axis.thickness;
        }
        else {
            var bbox = axis.computeBBox();
            axisThickness = direction === ChartAxisDirection.X ? bbox.height : bbox.width;
        }
        // for multiple axes in the same direction and position, apply padding at the top of each inner axis (i.e. between axes).
        var axisPadding = 15;
        if (addInterAxisPadding) {
            axisThickness += axisPadding;
        }
        axisThickness = Math.ceil(axisThickness);
        newAxisWidths[position] = ((_d = newAxisWidths[position]) !== null && _d !== void 0 ? _d : 0) + axisThickness;
        axis.gridPadding = ((_e = axisWidths[position]) !== null && _e !== void 0 ? _e : 0) - ((_f = newAxisWidths[position]) !== null && _f !== void 0 ? _f : 0);
        return { clipSeries: clipSeries, axisThickness: axisThickness, axisOffset: axisOffset };
    };
    CartesianChart.prototype.positionAxis = function (opts) {
        var _a, _b, _c, _d;
        var axis = opts.axis, axisBound = opts.axisBound, axisWidths = opts.axisWidths, seriesRect = opts.seriesRect, axisOffset = opts.axisOffset, axisThickness = opts.axisThickness;
        var position = axis.position;
        switch (position) {
            case 'top':
                axis.translation.x = axisBound.x + ((_a = axisWidths.left) !== null && _a !== void 0 ? _a : 0);
                axis.translation.y = this.clampToOutsideSeriesRect(seriesRect, axisBound.y + 1 + axisOffset + axisThickness, 'y', 1);
                break;
            case 'bottom':
                axis.translation.x = axisBound.x + ((_b = axisWidths.left) !== null && _b !== void 0 ? _b : 0);
                axis.translation.y = this.clampToOutsideSeriesRect(seriesRect, axisBound.y + axisBound.height + 1 - axisThickness - axisOffset, 'y', -1);
                break;
            case 'left':
                axis.translation.y = axisBound.y + ((_c = axisWidths.top) !== null && _c !== void 0 ? _c : 0);
                axis.translation.x = this.clampToOutsideSeriesRect(seriesRect, axisBound.x + axisOffset + axisThickness, 'x', 1);
                break;
            case 'right':
                axis.translation.y = axisBound.y + ((_d = axisWidths.top) !== null && _d !== void 0 ? _d : 0);
                axis.translation.x = this.clampToOutsideSeriesRect(seriesRect, axisBound.x + axisBound.width - axisThickness - axisOffset, 'x', -1);
                break;
        }
        axis.updatePosition({ rotation: toRadians(axis.rotation), sideFlag: axis.label.getSideFlag() });
    };
    CartesianChart.className = 'CartesianChart';
    CartesianChart.type = 'cartesian';
    return CartesianChart;
}(Chart));
export { CartesianChart };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FydGVzaWFuQ2hhcnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY2hhcnQvY2FydGVzaWFuQ2hhcnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxPQUFPLEVBQUUsS0FBSyxFQUF5QixNQUFNLFNBQVMsQ0FBQztBQUN2RCxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFDbkQsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFFakUsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFHMUQsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBQ3hDLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFHMUMsSUFBTSxVQUFVLEdBQThCLENBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFFakY7SUFBb0Msa0NBQUs7SUFPckMsd0JBQVksUUFBMEIsRUFBRSx3QkFBaUMsRUFBRSxTQUFpQztRQUFoRyx5QkFBQSxFQUFBLFdBQVcsTUFBTSxDQUFDLFFBQVE7UUFBdEMsWUFDSSxrQkFBTSxRQUFRLEVBQUUsd0JBQXdCLEVBQUUsU0FBUyxDQUFDLFNBQ3ZEO1FBTEQsdUVBQXVFO1FBQ3ZELFlBQU0sR0FBWSxJQUFJLENBQUM7UUEwQy9CLHFCQUFlLEdBQXFEO1lBQ3hFLEdBQUcsRUFBRSxDQUFDO1lBQ04sTUFBTSxFQUFFLENBQUM7WUFDVCxJQUFJLEVBQUUsQ0FBQztZQUNQLEtBQUssRUFBRSxDQUFDO1NBQ1gsQ0FBQztRQUNNLHFCQUFlLEdBQWtCO1lBQ3JDLFVBQVUsRUFBRSxJQUFJO1lBQ2hCLE1BQU0s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