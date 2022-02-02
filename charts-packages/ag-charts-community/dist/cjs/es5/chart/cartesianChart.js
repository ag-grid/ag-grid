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
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
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
var numberAxis_1 = require("./axis/numberAxis");
var CartesianChart = /** @class */ (function (_super) {
    __extends(CartesianChart, _super);
    function CartesianChart(document) {
        if (document === void 0) { document = window.document; }
        var _this = _super.call(this, document) || this;
        _this._seriesRoot = new clipRect_1.ClipRect();
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
    Object.defineProperty(CartesianChart.prototype, "seriesRoot", {
        get: function () {
            return this._seriesRoot;
        },
        enumerable: true,
        configurable: true
    });
    CartesianChart.prototype.performLayout = function () {
        if (this.dataPending) {
            return;
        }
        this.scene.root.visible = true;
        var _a = this, width = _a.width, height = _a.height, axes = _a.axes, legend = _a.legend, navigator = _a.navigator;
        var shrinkRect = new bbox_1.BBox(0, 0, width, height);
        this.positionCaptions();
        this.positionLegend();
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
        var _b = this, captionAutoPadding = _b.captionAutoPadding, padding = _b.padding;
        this.updateAxes();
        shrinkRect.x += padding.left;
        shrinkRect.width -= padding.left + padding.right;
        shrinkRect.y += padding.top + captionAutoPadding;
        shrinkRect.height -= padding.top + captionAutoPadding + padding.bottom;
        if (navigator.enabled) {
            shrinkRect.height -= navigator.height + navigator.margin;
        }
        var bottomAxesHeight = 0;
        var axisPositionVisited = {
            top: false,
            right: false,
            bottom: false,
            left: false,
            angle: false,
            radius: false
        };
        axes.forEach(function (axis) {
            axis.group.visible = true;
            var axisThickness = Math.floor(axis.thickness || axis.computeBBox().width);
            // for multiple axes in the same direction and position, apply padding at the top of each inner axis (i.e. between axes).
            var axisPadding = axis.title && axis.title.padding.top || 15;
            if (axisPositionVisited[axis.position]) {
                axisThickness += axisPadding;
            }
            switch (axis.position) {
                case chartAxis_1.ChartAxisPosition.Top:
                    axisPositionVisited[chartAxis_1.ChartAxisPosition.Top] = true;
                    shrinkRect.y += axisThickness;
                    shrinkRect.height -= axisThickness;
                    axis.translation.y = Math.floor(shrinkRect.y + 1);
                    axis.label.mirrored = true;
                    break;
                case chartAxis_1.ChartAxisPosition.Right:
                    axisPositionVisited[chartAxis_1.ChartAxisPosition.Right] = true;
                    shrinkRect.width -= axisThickness;
                    axis.translation.x = Math.floor(shrinkRect.x + shrinkRect.width);
                    axis.label.mirrored = true;
                    break;
                case chartAxis_1.ChartAxisPosition.Bottom:
                    axisPositionVisited[chartAxis_1.ChartAxisPosition.Bottom] = true;
                    shrinkRect.height -= axisThickness;
                    bottomAxesHeight += axisThickness;
                    axis.translation.y = Math.floor(shrinkRect.y + shrinkRect.height + 1);
                    break;
                case chartAxis_1.ChartAxisPosition.Left:
                    axisPositionVisited[chartAxis_1.ChartAxisPosition.Left] = true;
                    shrinkRect.x += axisThickness;
                    shrinkRect.width -= axisThickness;
                    axis.translation.x = Math.floor(shrinkRect.x);
                    break;
            }
        });
        axes.forEach(function (axis) {
            switch (axis.position) {
                case chartAxis_1.ChartAxisPosition.Top:
                case chartAxis_1.ChartAxisPosition.Bottom:
                    axis.translation.x = Math.floor(shrinkRect.x);
                    axis.range = [0, shrinkRect.width];
                    axis.gridLength = shrinkRect.height;
                    break;
                case chartAxis_1.ChartAxisPosition.Left:
                case chartAxis_1.ChartAxisPosition.Right:
                    axis.translation.y = Math.floor(shrinkRect.y);
                    if (axis instanceof categoryAxis_1.CategoryAxis || axis instanceof groupedCategoryAxis_1.GroupedCategoryAxis) {
                        axis.range = [0, shrinkRect.height];
                    }
                    else {
                        axis.range = [shrinkRect.height, 0];
                    }
                    axis.gridLength = shrinkRect.width;
                    break;
            }
        });
        this.createNodeData();
        this.seriesRect = shrinkRect;
        this.series.forEach(function (series) {
            series.group.translationX = Math.floor(shrinkRect.x);
            series.group.translationY = Math.floor(shrinkRect.y);
            series.update(); // this has to happen after the `updateAxes` call
        });
        var seriesRoot = this.seriesRoot;
        seriesRoot.x = shrinkRect.x;
        seriesRoot.y = shrinkRect.y;
        seriesRoot.width = shrinkRect.width;
        seriesRoot.height = shrinkRect.height;
        if (navigator.enabled) {
            navigator.x = shrinkRect.x;
            navigator.y = shrinkRect.y + shrinkRect.height + bottomAxesHeight + navigator.margin;
            navigator.width = shrinkRect.width;
        }
        this.axes.forEach(function (axis) { return axis.update(); });
    };
    CartesianChart.prototype.initSeries = function (series) {
        _super.prototype.initSeries.call(this, series);
    };
    CartesianChart.prototype.freeSeries = function (series) {
        _super.prototype.freeSeries.call(this, series);
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
        return touch ? {
            offsetX: touch.clientX - rect.left,
            offsetY: touch.clientY - rect.top
        } : undefined;
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
    CartesianChart.prototype.onTouchEnd = function (event) {
        this.navigator.onDragStop();
    };
    CartesianChart.prototype.onTouchCancel = function (event) {
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
    CartesianChart.prototype.assignAxesToSeries = function (force) {
        if (force === void 0) { force = false; }
        _super.prototype.assignAxesToSeries.call(this, force);
        this.series.forEach(function (series) {
            if (!series.xAxis) {
                console.warn("Could not find a matching xAxis for the " + series.id + " series.");
            }
            if (!series.yAxis) {
                console.warn("Could not find a matching yAxis for the " + series.id + " series.");
            }
        });
    };
    CartesianChart.prototype.updateAxes = function () {
        var navigator = this.navigator;
        var clipSeries = false;
        var primaryTickCount;
        this.axes.forEach(function (axis) {
            var _a;
            var direction = axis.direction, boundSeries = axis.boundSeries;
            if (axis.linkedTo) {
                axis.domain = axis.linkedTo.domain;
            }
            else {
                var domains_1 = [];
                boundSeries.forEach(function (series) {
                    domains_1.push(series.getDomain(direction));
                });
                var domain = (_a = new Array()).concat.apply(_a, __spread(domains_1));
                var isYAxis = axis.direction === 'y';
                if (axis instanceof numberAxis_1.NumberAxis && isYAxis) {
                    // the `primaryTickCount` is used to align the secondary axis tick count with the primary
                    axis.setDomain(domain, primaryTickCount);
                    primaryTickCount = primaryTickCount || axis.scale.ticks(axis.tick.count).length;
                }
                else {
                    axis.domain = domain;
                }
            }
            if (axis.direction === chartAxis_1.ChartAxisDirection.X) {
                axis.visibleRange = [navigator.min, navigator.max];
            }
            if (!clipSeries && (axis.visibleRange[0] > 0 || axis.visibleRange[1] < 1)) {
                clipSeries = true;
            }
            axis.update();
        });
        this.seriesRoot.enabled = clipSeries;
    };
    CartesianChart.className = 'CartesianChart';
    CartesianChart.type = 'cartesian';
    return CartesianChart;
}(chart_1.Chart));
exports.CartesianChart = CartesianChart;
//# sourceMappingURL=cartesianChart.js.map