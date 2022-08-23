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
    function CartesianChart(document) {
        if (document === void 0) { document = window.document; }
        var _this = _super.call(this, document) || this;
        _this.seriesRoot = new clipRect_1.ClipRect();
        _this.navigator = new navigator_1.Navigator(_this);
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
        this.scene.root.visible = true;
        var _a = this, width = _a.width, height = _a.height, legend = _a.legend, navigator = _a.navigator;
        var shrinkRect = new bbox_1.BBox(0, 0, width, height);
        var _b = this.positionCaptions().captionAutoPadding, captionAutoPadding = _b === void 0 ? 0 : _b;
        this.positionLegend(captionAutoPadding);
        if (legend.enabled && legend.data.length) {
            var legendAutoPadding = this.legendAutoPadding;
            var legendPadding = this.legend.spacing;
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
        var padding = this.padding;
        shrinkRect.x += padding.left;
        shrinkRect.width -= padding.left + padding.right;
        shrinkRect.y += padding.top + captionAutoPadding;
        shrinkRect.height -= padding.top + captionAutoPadding + padding.bottom;
        if (navigator.enabled) {
            var navigatorTotalHeight = navigator.height + navigator.margin;
            shrinkRect.height -= navigatorTotalHeight;
            navigator.x = shrinkRect.x;
            navigator.y = shrinkRect.y + shrinkRect.height + navigator.margin;
            navigator.width = shrinkRect.width;
        }
        var seriesRect = this.updateAxes(shrinkRect).seriesRect;
        this.seriesRect = seriesRect;
        this.series.forEach(function (series) {
            series.group.translationX = Math.floor(seriesRect.x);
            series.group.translationY = Math.floor(seriesRect.y);
        });
        var seriesRoot = this.seriesRoot;
        seriesRoot.x = seriesRect.x + 1;
        seriesRoot.y = seriesRect.y;
        seriesRoot.width = seriesRect.width - 1;
        seriesRoot.height = seriesRect.height;
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
        var _a;
        var axisWidths = (_a = {},
            _a[chartAxis_1.ChartAxisPosition.Top] = 0,
            _a[chartAxis_1.ChartAxisPosition.Bottom] = 0,
            _a[chartAxis_1.ChartAxisPosition.Left] = 0,
            _a[chartAxis_1.ChartAxisPosition.Right] = 0,
            _a);
        var stableWidths = function (other) {
            return Object.entries(axisWidths).every(function (_a) {
                var _b = __read(_a, 2), p = _b[0], w = _b[1];
                var otherW = other[p];
                if (w || otherW) {
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
        var seriesRect = undefined;
        var count = 0;
        do {
            Object.assign(axisWidths, lastPass);
            var result = this.updateAxesPass(axisWidths, inputShrinkRect.clone(), seriesRect);
            lastPass = ceilValues(result.axisWidths);
            seriesRect = result.seriesRect;
            if (count++ > 10) {
                throw new Error('AG Charts - unable to find stable axis layout.');
            }
        } while (!stableWidths(lastPass));
        this.seriesRoot.enabled = true;
        return { seriesRect: seriesRect };
    };
    CartesianChart.prototype.updateAxesPass = function (axisWidths, bounds, lastPassSeriesRect) {
        var _a = this, navigator = _a.navigator, axes = _a.axes;
        var visited = {};
        var newAxisWidths = {};
        var clipSeries = false;
        var primaryTickCounts = {};
        var crossLinePadding = {};
        if (lastPassSeriesRect) {
            this.axes.forEach(function (axis) {
                if (axis.crossLines) {
                    axis.crossLines.forEach(function (crossLine) {
                        crossLine.calculatePadding(crossLinePadding, lastPassSeriesRect);
                    });
                }
            });
        }
        var buildAxisBound = function () {
            var result = bounds.clone();
            var _a = crossLinePadding.top, top = _a === void 0 ? 0 : _a, _b = crossLinePadding.right, right = _b === void 0 ? 0 : _b, _c = crossLinePadding.bottom, bottom = _c === void 0 ? 0 : _c, _d = crossLinePadding.left, left = _d === void 0 ? 0 : _d;
            result.x += left;
            result.y += top;
            result.width -= left + right;
            result.height -= top + bottom;
            return result;
        };
        var axisBound = buildAxisBound();
        var buildSeriesRect = function () {
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
        var seriesRect = buildSeriesRect();
        var clampToOutsideSeriesRect = function (value, dimension, direction) {
            var x = seriesRect.x, y = seriesRect.y, width = seriesRect.width, height = seriesRect.height;
            var clampBounds = [x, y, x + width, y + height];
            var fn = direction === 1 ? Math.min : Math.max;
            var compareTo = clampBounds[(dimension === 'x' ? 0 : 1) + (direction === 1 ? 0 : 2)];
            return fn(value, compareTo);
        };
        // Set the number of ticks for continuous axes based on the available range
        // before updating the axis domain via `this.updateAxes()` as the tick count has an effect on the calculated `nice` domain extent
        axes.forEach(function (axis) {
            var _a, _b, _c, _d, _e, _f, _g, _h;
            var position = axis.position, direction = axis.direction;
            visited[position] = (_a = visited[position], (_a !== null && _a !== void 0 ? _a : 0)) + 1;
            var axisLeftRightRange = function (axis) {
                if (axis instanceof categoryAxis_1.CategoryAxis || axis instanceof groupedCategoryAxis_1.GroupedCategoryAxis) {
                    return [0, seriesRect.height];
                }
                return [seriesRect.height, 0];
            };
            axis.label.mirrored = ['top', 'right'].includes(position);
            var axisOffset = (_b = newAxisWidths[position], (_b !== null && _b !== void 0 ? _b : 0));
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
            axis.calculateTickCount();
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
            var primaryTickCount = primaryTickCounts[axis.direction];
            (primaryTickCount = axis.calculateDomain({ primaryTickCount: primaryTickCount }).primaryTickCount);
            primaryTickCounts[axis.direction] = primaryTickCount;
            axis.update();
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
            var visitCount = (_c = visited[position], (_c !== null && _c !== void 0 ? _c : 0));
            if (visitCount > 1) {
                axisThickness += axisPadding;
            }
            axisThickness = Math.ceil(axisThickness);
            switch (position) {
                case chartAxis_1.ChartAxisPosition.Top:
                    axis.translation.x = axisBound.x + (_d = axisWidths.left, (_d !== null && _d !== void 0 ? _d : 0));
                    axis.translation.y = clampToOutsideSeriesRect(axisBound.y + 1 + axisOffset + axisThickness, 'y', 1);
                    break;
                case chartAxis_1.ChartAxisPosition.Bottom:
                    axis.translation.x = axisBound.x + (_e = axisWidths.left, (_e !== null && _e !== void 0 ? _e : 0));
                    axis.translation.y = clampToOutsideSeriesRect(axisBound.y + axisBound.height + 1 - axisThickness - axisOffset, 'y', -1);
                    break;
                case chartAxis_1.ChartAxisPosition.Left:
                    axis.translation.y = axisBound.y + (_f = axisWidths.top, (_f !== null && _f !== void 0 ? _f : 0));
                    axis.translation.x = clampToOutsideSeriesRect(axisBound.x + axisOffset + axisThickness, 'x', 1);
                    break;
                case chartAxis_1.ChartAxisPosition.Right:
                    axis.translation.y = axisBound.y + (_g = axisWidths.top, (_g !== null && _g !== void 0 ? _g : 0));
                    axis.translation.x = clampToOutsideSeriesRect(axisBound.x + axisBound.width - axisThickness - axisOffset, 'x', -1);
                    break;
            }
            axis.update();
            newAxisWidths[position] = (_h = newAxisWidths[position], (_h !== null && _h !== void 0 ? _h : 0)) + axisThickness;
        });
        return { clipSeries: clipSeries, seriesRect: seriesRect, axisWidths: newAxisWidths };
    };
    CartesianChart.className = 'CartesianChart';
    CartesianChart.type = 'cartesian';
    return CartesianChart;
}(chart_1.Chart));
exports.CartesianChart = CartesianChart;
