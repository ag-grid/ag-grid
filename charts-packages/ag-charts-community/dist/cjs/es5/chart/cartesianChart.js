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
var chart_1 = require("./chart");
var categoryAxis_1 = require("./axis/categoryAxis");
var groupedCategoryAxis_1 = require("./axis/groupedCategoryAxis");
var chartAxis_1 = require("./chartAxis");
var bbox_1 = require("../scene/bbox");
var clipRect_1 = require("../scene/clipRect");
var navigator_1 = require("./navigator/navigator");
var CartesianChart = /** @class */ (function (_super) {
    __extends(CartesianChart, _super);
    function CartesianChart(document, overrideDevicePixelRatio) {
        var _a;
        if (document === void 0) { document = window.document; }
        var _this = _super.call(this, document, overrideDevicePixelRatio) || this;
        _this.seriesRoot = new clipRect_1.ClipRect();
        _this.navigator = new navigator_1.Navigator(_this);
        _this._lastAxisWidths = (_a = {},
            _a[chartAxis_1.ChartAxisPosition.Top] = 0,
            _a[chartAxis_1.ChartAxisPosition.Bottom] = 0,
            _a[chartAxis_1.ChartAxisPosition.Left] = 0,
            _a[chartAxis_1.ChartAxisPosition.Right] = 0,
            _a);
        // Prevent the scene from rendering chart components in an invalid state
        // (before first layout is performed).
        _this.scene.root.visible = false;
        var root = _this.scene.root;
        root.append(_this.seriesRoot);
        root.append(_this.legend.group);
        _this.navigator.enabled = false;
        return _this;
    }
    CartesianChart.prototype.performLayout = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, width, height, legend, navigator, shrinkRect, _b, captionAutoPadding, legendAutoPadding, legendPadding, padding, navigatorTotalHeight, seriesRect, seriesRoot;
            return __generator(this, function (_c) {
                this.scene.root.visible = true;
                _a = this, width = _a.width, height = _a.height, legend = _a.legend, navigator = _a.navigator;
                shrinkRect = new bbox_1.BBox(0, 0, width, height);
                _b = this.positionCaptions().captionAutoPadding, captionAutoPadding = _b === void 0 ? 0 : _b;
                this.positionLegend(captionAutoPadding);
                if (legend.enabled && legend.data.length) {
                    legendAutoPadding = this.legendAutoPadding;
                    legendPadding = this.legend.spacing;
                    shrinkRect.x += legendAutoPadding.left;
                    shrinkRect.y += legendAutoPadding.top;
                    shrinkRect.width -= legendAutoPadding.left + legendAutoPadding.right;
                    shrinkRect.height -= legendAutoPadding.top + legendAutoPadding.bottom;
                    switch (this.legend.position) {
                        case 'right':
                            shrinkRect.width -= legendPadding;
                            break;
                        case 'bottom':
                            shrinkRect.height -= legendPadding;
                            break;
                        case 'left':
                            shrinkRect.x += legendPadding;
                            shrinkRect.width -= legendPadding;
                            break;
                        case 'top':
                            shrinkRect.y += legendPadding;
                            shrinkRect.height -= legendPadding;
                            break;
                    }
                }
                padding = this.padding;
                shrinkRect.x += padding.left;
                shrinkRect.width -= padding.left + padding.right;
                shrinkRect.y += padding.top + captionAutoPadding;
                shrinkRect.height -= padding.top + captionAutoPadding + padding.bottom;
                if (navigator.enabled) {
                    navigatorTotalHeight = navigator.height + navigator.margin;
                    shrinkRect.height -= navigatorTotalHeight;
                    navigator.x = shrinkRect.x;
                    navigator.y = shrinkRect.y + shrinkRect.height + navigator.margin;
                    navigator.width = shrinkRect.width;
                }
                seriesRect = this.updateAxes(shrinkRect).seriesRect;
                this.seriesRect = seriesRect;
                this.series.forEach(function (series) {
                    series.group.translationX = Math.floor(seriesRect.x);
                    series.group.translationY = Math.floor(seriesRect.y);
                });
                seriesRoot = this.seriesRoot;
                seriesRoot.x = seriesRect.x;
                seriesRoot.y = seriesRect.y;
                seriesRoot.width = seriesRect.width;
                seriesRoot.height = seriesRect.height;
                return [2 /*return*/];
            });
        });
    };
    CartesianChart.prototype.setupDomListeners = function (chartElement) {
        _super.prototype.setupDomListeners.call(this, chartElement);
        this._onTouchStart = this.onTouchStart.bind(this);
        this._onTouchMove = this.onTouchMove.bind(this);
        this._onTouchEnd = this.onTouchEnd.bind(this);
        this._onTouchCancel = this.onTouchCancel.bind(this);
        chartElement.addEventListener('touchstart', this._onTouchStart, { passive: true });
        chartElement.addEventListener('touchmove', this._onTouchMove, { passive: true });
        chartElement.addEventListener('touchend', this._onTouchEnd, { passive: true });
        chartElement.addEventListener('touchcancel', this._onTouchCancel, { passive: true });
    };
    CartesianChart.prototype.cleanupDomListeners = function (chartElement) {
        _super.prototype.cleanupDomListeners.call(this, chartElement);
        chartElement.removeEventListener('touchstart', this._onTouchStart);
        chartElement.removeEventListener('touchmove', this._onTouchMove);
        chartElement.removeEventListener('touchend', this._onTouchEnd);
        chartElement.removeEventListener('touchcancel', this._onTouchCancel);
    };
    CartesianChart.prototype.getTouchOffset = function (event) {
        var rect = this.scene.canvas.element.getBoundingClientRect();
        var touch = event.touches[0];
        return touch
            ? {
                offsetX: touch.clientX - rect.left,
                offsetY: touch.clientY - rect.top,
            }
            : undefined;
    };
    CartesianChart.prototype.onTouchStart = function (event) {
        var offset = this.getTouchOffset(event);
        if (offset) {
            this.navigator.onDragStart(offset);
        }
    };
    CartesianChart.prototype.onTouchMove = function (event) {
        var offset = this.getTouchOffset(event);
        if (offset) {
            this.navigator.onDrag(offset);
        }
    };
    CartesianChart.prototype.onTouchEnd = function (_event) {
        this.navigator.onDragStop();
    };
    CartesianChart.prototype.onTouchCancel = function (_event) {
        this.navigator.onDragStop();
    };
    CartesianChart.prototype.onMouseDown = function (event) {
        _super.prototype.onMouseDown.call(this, event);
        this.navigator.onDragStart(event);
    };
    CartesianChart.prototype.onMouseMove = function (event) {
        _super.prototype.onMouseMove.call(this, event);
        this.navigator.onDrag(event);
    };
    CartesianChart.prototype.onMouseUp = function (event) {
        _super.prototype.onMouseUp.call(this, event);
        this.navigator.onDragStop();
    };
    CartesianChart.prototype.onMouseOut = function (event) {
        _super.prototype.onMouseOut.call(this, event);
        this.navigator.onDragStop();
    };
    CartesianChart.prototype.updateAxes = function (inputShrinkRect) {
        var e_1, _a;
        var _b;
        // Start with a good approximation from the last update - this should mean that in many resize
        // cases that only a single pass is needed \o/.
        var axisWidths = __assign({}, this._lastAxisWidths);
        // Clean any positions which aren't valid with the current axis status (otherwise we end up
        // never being able to find a stable result).
        var liveAxisWidths = this._axes
            .map(function (a) { return a.position; })
            .reduce(function (r, n) { return r.add(n); }, new Set());
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
        var stableWidths = function (other) {
            return Object.entries(axisWidths).every(function (_a) {
                var _b = __read(_a, 2), p = _b[0], w = _b[1];
                var otherW = other[p];
                if (w != null || otherW != null) {
                    return w === otherW;
                }
                return true;
            });
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
        var lastPass = {};
        var clipSeries = false;
        var seriesRect = (_b = this.seriesRect) === null || _b === void 0 ? void 0 : _b.clone();
        var count = 0;
        do {
            Object.assign(axisWidths, lastPass);
            var result = this.updateAxesPass(axisWidths, inputShrinkRect.clone(), seriesRect);
            lastPass = ceilValues(result.axisWidths);
            clipSeries = result.clipSeries;
            seriesRect = result.seriesRect;
            if (count++ > 10) {
                console.warn('AG Charts - unable to find stable axis layout.');
                break;
            }
        } while (!stableWidths(lastPass));
        this.seriesRoot.enabled = clipSeries;
        this._lastAxisWidths = axisWidths;
        return { seriesRect: seriesRect };
    };
    CartesianChart.prototype.updateAxesPass = function (axisWidths, bounds, lastPassSeriesRect) {
        var _this = this;
        var axes = this.axes;
        var visited = {};
        var newAxisWidths = {};
        var clipSeries = false;
        var primaryTickCounts = {};
        var crossLinePadding = lastPassSeriesRect ? this.buildCrossLinePadding(lastPassSeriesRect, axisWidths) : {};
        var axisBound = this.buildAxisBound(bounds, crossLinePadding);
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
                addInterAxisPadding: (_a = visited[position], (_a !== null && _a !== void 0 ? _a : 0)) > 0,
            }), newClipSeries = _c.clipSeries, axisThickness = _c.axisThickness, axisOffset = _c.axisOffset;
            visited[position] = (_b = visited[position], (_b !== null && _b !== void 0 ? _b : 0)) + 1;
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
        return { clipSeries: clipSeries, seriesRect: seriesRect, axisWidths: newAxisWidths };
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
                crossLinePadding[side] = Math.max(padding - (_b = axisWidths[side], (_b !== null && _b !== void 0 ? _b : 0)), 0);
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
    CartesianChart.prototype.buildAxisBound = function (bounds, crossLinePadding) {
        var result = bounds.clone();
        var _a = crossLinePadding.top, top = _a === void 0 ? 0 : _a, _b = crossLinePadding.right, right = _b === void 0 ? 0 : _b, _c = crossLinePadding.bottom, bottom = _c === void 0 ? 0 : _c, _d = crossLinePadding.left, left = _d === void 0 ? 0 : _d;
        result.x += left;
        result.y += top;
        result.width -= left + right;
        result.height -= top + bottom;
        return result;
    };
    CartesianChart.prototype.buildSeriesRect = function (axisBound, axisWidths) {
        var result = axisBound.clone();
        var top = axisWidths.top, bottom = axisWidths.bottom, left = axisWidths.left, right = axisWidths.right;
        result.x += (left !== null && left !== void 0 ? left : 0);
        result.y += (top !== null && top !== void 0 ? top : 0);
        result.width -= ((left !== null && left !== void 0 ? left : 0)) + ((right !== null && right !== void 0 ? right : 0));
        result.height -= ((top !== null && top !== void 0 ? top : 0)) + ((bottom !== null && bottom !== void 0 ? bottom : 0));
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
        var _a, _b, _c, _d, _e;
        var axis = opts.axis, seriesRect = opts.seriesRect, axisWidths = opts.axisWidths, newAxisWidths = opts.newAxisWidths, primaryTickCounts = opts.primaryTickCounts, addInterAxisPadding = opts.addInterAxisPadding;
        var clipSeries = opts.clipSeries;
        var navigator = this.navigator;
        var position = axis.position, direction = axis.direction;
        var axisLeftRightRange = function (axis) {
            if (axis instanceof categoryAxis_1.CategoryAxis || axis instanceof groupedCategoryAxis_1.GroupedCategoryAxis) {
                return [0, seriesRect.height];
            }
            return [seriesRect.height, 0];
        };
        axis.label.mirrored = ['top', 'right'].includes(position);
        var axisOffset = (_a = newAxisWidths[position], (_a !== null && _a !== void 0 ? _a : 0));
        switch (position) {
            case chartAxis_1.ChartAxisPosition.Top:
            case chartAxis_1.ChartAxisPosition.Bottom:
                axis.range = [0, seriesRect.width];
                axis.gridLength = seriesRect.height;
                break;
            case chartAxis_1.ChartAxisPosition.Right:
            case chartAxis_1.ChartAxisPosition.Left:
                axis.range = axisLeftRightRange(axis);
                axis.gridLength = seriesRect.width;
                break;
        }
        if (axis.direction === chartAxis_1.ChartAxisDirection.X) {
            var min = navigator.min, max = navigator.max, enabled = navigator.enabled;
            if (enabled) {
                axis.visibleRange = [min, max];
            }
            else {
                axis.visibleRange = [0, 1];
            }
        }
        if (!clipSeries && (axis.visibleRange[0] > 0 || axis.visibleRange[1] < 1)) {
            clipSeries = true;
        }
        var primaryTickCount = axis.nice ? primaryTickCounts[direction] : undefined;
        primaryTickCount = axis.update(primaryTickCount);
        primaryTickCounts[direction] = (_b = primaryTickCounts[direction], (_b !== null && _b !== void 0 ? _b : primaryTickCount));
        var axisThickness = 0;
        if (axis.thickness) {
            axisThickness = axis.thickness;
        }
        else {
            var bbox = axis.computeBBox();
            axisThickness = direction === chartAxis_1.ChartAxisDirection.X ? bbox.height : bbox.width;
        }
        // for multiple axes in the same direction and position, apply padding at the top of each inner axis (i.e. between axes).
        var axisPadding = 15;
        if (addInterAxisPadding) {
            axisThickness += axisPadding;
        }
        axisThickness = Math.ceil(axisThickness);
        newAxisWidths[position] = (_c = newAxisWidths[position], (_c !== null && _c !== void 0 ? _c : 0)) + axisThickness;
        axis.gridPadding = (_d = axisWidths[position], (_d !== null && _d !== void 0 ? _d : 0)) - (_e = newAxisWidths[position], (_e !== null && _e !== void 0 ? _e : 0));
        return { clipSeries: clipSeries, axisThickness: axisThickness, axisOffset: axisOffset };
    };
    CartesianChart.prototype.positionAxis = function (opts) {
        var _a, _b, _c, _d;
        var axis = opts.axis, axisBound = opts.axisBound, axisWidths = opts.axisWidths, seriesRect = opts.seriesRect, axisOffset = opts.axisOffset, axisThickness = opts.axisThickness;
        var position = axis.position;
        switch (position) {
            case chartAxis_1.ChartAxisPosition.Top:
                axis.translation.x = axisBound.x + (_a = axisWidths.left, (_a !== null && _a !== void 0 ? _a : 0));
                axis.translation.y = this.clampToOutsideSeriesRect(seriesRect, axisBound.y + 1 + axisOffset + axisThickness, 'y', 1);
                break;
            case chartAxis_1.ChartAxisPosition.Bottom:
                axis.translation.x = axisBound.x + (_b = axisWidths.left, (_b !== null && _b !== void 0 ? _b : 0));
                axis.translation.y = this.clampToOutsideSeriesRect(seriesRect, axisBound.y + axisBound.height + 1 - axisThickness - axisOffset, 'y', -1);
                break;
            case chartAxis_1.ChartAxisPosition.Left:
                axis.translation.y = axisBound.y + (_c = axisWidths.top, (_c !== null && _c !== void 0 ? _c : 0));
                axis.translation.x = this.clampToOutsideSeriesRect(seriesRect, axisBound.x + axisOffset + axisThickness, 'x', 1);
                break;
            case chartAxis_1.ChartAxisPosition.Right:
                axis.translation.y = axisBound.y + (_d = axisWidths.top, (_d !== null && _d !== void 0 ? _d : 0));
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
