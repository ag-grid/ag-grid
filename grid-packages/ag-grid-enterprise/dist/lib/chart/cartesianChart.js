"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartesianChart = void 0;
var chart_1 = require("./chart");
var categoryAxis_1 = require("./axis/categoryAxis");
var groupedCategoryAxis_1 = require("./axis/groupedCategoryAxis");
var chartAxisDirection_1 = require("./chartAxisDirection");
var bbox_1 = require("../scene/bbox");
var logger_1 = require("../util/logger");
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
        var root = _this.scene.root;
        _this.legend.attachLegend(root);
        return _this;
    }
    CartesianChart.prototype.performLayout = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, legend, padding, _b, width, height, shrinkRect, legendPadding, _c, seriesRect, visibility, clipSeries, _d, seriesRoot, seriesAreaPadding, x, y, width_1, height_1;
            return __generator(this, function (_e) {
                this.scene.root.visible = true;
                _a = this, legend = _a.legend, padding = _a.padding, _b = _a.scene, width = _b.width, height = _b.height;
                shrinkRect = new bbox_1.BBox(0, 0, width, height);
                shrinkRect.x += padding.left;
                shrinkRect.y += padding.top;
                shrinkRect.width -= padding.left + padding.right;
                shrinkRect.height -= padding.top + padding.bottom;
                shrinkRect = this.positionCaptions(shrinkRect);
                shrinkRect = this.positionLegend(shrinkRect);
                if (legend.visible && legend.enabled && legend.data.length) {
                    legendPadding = legend.spacing;
                    shrinkRect.shrink(legendPadding, legend.position);
                }
                (shrinkRect = this.layoutService.dispatchPerformLayout('before-series', { shrinkRect: shrinkRect }).shrinkRect);
                _c = this.updateAxes(shrinkRect), seriesRect = _c.seriesRect, visibility = _c.visibility, clipSeries = _c.clipSeries;
                this.seriesRoot.visible = visibility.series;
                this.seriesRect = seriesRect;
                this.series.forEach(function (series) {
                    series.rootGroup.translationX = Math.floor(seriesRect.x);
                    series.rootGroup.translationY = Math.floor(seriesRect.y);
                });
                this.layoutService.dispatchLayoutComplete({
                    type: 'layout-complete',
                    series: { rect: seriesRect, visible: visibility.series },
                    axes: this.axes.map(function (axis) { return (__assign({ id: axis.id }, axis.getLayoutState())); }),
                });
                _d = this, seriesRoot = _d.seriesRoot, seriesAreaPadding = _d.seriesAreaPadding;
                if (clipSeries) {
                    x = seriesRect.x - seriesAreaPadding.left;
                    y = seriesRect.y - seriesAreaPadding.top;
                    width_1 = seriesAreaPadding.left + seriesRect.width + seriesAreaPadding.right;
                    height_1 = seriesAreaPadding.top + seriesRect.height + seriesAreaPadding.bottom;
                    seriesRoot.setClipRectInGroupCoordinateSpace(new bbox_1.BBox(x, y, width_1, height_1));
                }
                else {
                    seriesRoot.setClipRectInGroupCoordinateSpace();
                }
                return [2 /*return*/];
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
                logger_1.Logger.warn('unable to find stable axis layout.');
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
        var crossLinePadding = lastPassSeriesRect ? this.buildCrossLinePadding(lastPassSeriesRect, axisWidths) : {};
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
    CartesianChart.prototype.buildCrossLinePadding = function (lastPassSeriesRect, axisWidths) {
        var e_2, _a;
        var _b;
        var crossLinePadding = {};
        this.axes.forEach(function (axis) {
            if (axis.crossLines) {
                axis.crossLines.forEach(function (crossLine) {
                    crossLine.calculatePadding(crossLinePadding, lastPassSeriesRect);
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
        var axis = opts.axis, seriesRect = opts.seriesRect, axisWidths = opts.axisWidths, newAxisWidths = opts.newAxisWidths, primaryTickCounts = opts.primaryTickCounts, addInterAxisPadding = opts.addInterAxisPadding;
        var clipSeries = opts.clipSeries;
        var position = axis.position, direction = axis.direction;
        var axisLeftRightRange = function (axis) {
            if (axis instanceof categoryAxis_1.CategoryAxis || axis instanceof groupedCategoryAxis_1.GroupedCategoryAxis) {
                return [0, seriesRect.height];
            }
            return [seriesRect.height, 0];
        };
        axis.label.mirrored = ['top', 'right'].includes(position);
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
        primaryTickCount = axis.update(primaryTickCount);
        primaryTickCounts[direction] = (_c = primaryTickCounts[direction]) !== null && _c !== void 0 ? _c : primaryTickCount;
        var axisThickness = 0;
        if (axis.thickness) {
            axisThickness = axis.thickness;
        }
        else {
            var bbox = axis.computeBBox();
            axisThickness = direction === chartAxisDirection_1.ChartAxisDirection.X ? bbox.height : bbox.width;
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
        axis.updatePosition();
    };
    CartesianChart.className = 'CartesianChart';
    CartesianChart.type = 'cartesian';
    return CartesianChart;
}(chart_1.Chart));
exports.CartesianChart = CartesianChart;
//# sourceMappingURL=cartesianChart.js.map