"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var rangeSelector_1 = require("../shapes/rangeSelector");
var chartAxis_1 = require("../chartAxis");
var bbox_1 = require("../../scene/bbox");
var navigatorMask_1 = require("./navigatorMask");
var navigatorHandle_1 = require("./navigatorHandle");
var chart_1 = require("../chart");
var Navigator = /** @class */ (function () {
    function Navigator(chart) {
        var _this = this;
        this.rs = new rangeSelector_1.RangeSelector();
        this.mask = new navigatorMask_1.NavigatorMask(this.rs.mask);
        this.minHandle = new navigatorHandle_1.NavigatorHandle(this.rs.minHandle);
        this.maxHandle = new navigatorHandle_1.NavigatorHandle(this.rs.maxHandle);
        this.minHandleDragging = false;
        this.maxHandleDragging = false;
        this.panHandleOffset = NaN;
        this.changedCursor = false;
        this._margin = 10;
        this.chart = chart;
        chart.scene.root.append(this.rs);
        this.rs.onRangeChange = function (min, max) { return _this.updateAxes(min, max); };
    }
    Object.defineProperty(Navigator.prototype, "enabled", {
        get: function () {
            return this.rs.visible;
        },
        set: function (value) {
            this.rs.visible = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Navigator.prototype, "x", {
        get: function () {
            return this.rs.x;
        },
        set: function (value) {
            this.rs.x = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Navigator.prototype, "y", {
        get: function () {
            return this.rs.y;
        },
        set: function (value) {
            this.rs.y = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Navigator.prototype, "width", {
        get: function () {
            return this.rs.width;
        },
        set: function (value) {
            this.rs.width = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Navigator.prototype, "height", {
        get: function () {
            return this.rs.height;
        },
        set: function (value) {
            this.rs.height = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Navigator.prototype, "margin", {
        get: function () {
            return this._margin;
        },
        set: function (value) {
            this._margin = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Navigator.prototype, "min", {
        get: function () {
            return this.rs.min;
        },
        set: function (value) {
            this.rs.min = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Navigator.prototype, "max", {
        get: function () {
            return this.rs.max;
        },
        set: function (value) {
            this.rs.max = value;
        },
        enumerable: true,
        configurable: true
    });
    Navigator.prototype.updateAxes = function (min, max) {
        var chart = this.chart;
        var clipSeries = false;
        var layoutRequired = false;
        chart.axes.forEach(function (axis) {
            if (axis.direction === chartAxis_1.ChartAxisDirection.X) {
                if (!clipSeries && (min > 0 || max < 1)) {
                    clipSeries = true;
                }
                axis.visibleRange = [min, max];
                var oldLabelAutoRotated = axis.labelAutoRotated;
                axis.update();
                if (axis.labelAutoRotated !== oldLabelAutoRotated) {
                    layoutRequired = true;
                }
            }
        });
        chart.seriesRoot.enabled = clipSeries;
        var updateType = layoutRequired ? chart_1.ChartUpdateType.PERFORM_LAYOUT : chart_1.ChartUpdateType.SERIES_UPDATE;
        chart.update(updateType, { forceNodeDataRefresh: true });
    };
    Navigator.prototype.onDragStart = function (offset) {
        if (!this.enabled) {
            return;
        }
        var offsetX = offset.offsetX, offsetY = offset.offsetY;
        var rs = this.rs;
        var minHandle = rs.minHandle, maxHandle = rs.maxHandle, x = rs.x, width = rs.width, min = rs.min;
        var visibleRange = rs.computeVisibleRangeBBox();
        if (!(this.minHandleDragging || this.maxHandleDragging)) {
            if (minHandle.containsPoint(offsetX, offsetY)) {
                this.minHandleDragging = true;
            }
            else if (maxHandle.containsPoint(offsetX, offsetY)) {
                this.maxHandleDragging = true;
            }
            else if (visibleRange.containsPoint(offsetX, offsetY)) {
                this.panHandleOffset = (offsetX - x) / width - min;
            }
        }
    };
    Navigator.prototype.onDrag = function (offset) {
        if (!this.enabled) {
            return;
        }
        var _a = this, rs = _a.rs, panHandleOffset = _a.panHandleOffset;
        var x = rs.x, y = rs.y, width = rs.width, height = rs.height, minHandle = rs.minHandle, maxHandle = rs.maxHandle;
        var style = this.chart.element.style;
        var offsetX = offset.offsetX, offsetY = offset.offsetY;
        var minX = x + width * rs.min;
        var maxX = x + width * rs.max;
        var visibleRange = new bbox_1.BBox(minX, y, maxX - minX, height);
        function getRatio() {
            return Math.min(Math.max((offsetX - x) / width, 0), 1);
        }
        if (minHandle.containsPoint(offsetX, offsetY) || maxHandle.containsPoint(offsetX, offsetY)) {
            this.changedCursor = true;
            style.cursor = 'ew-resize';
        }
        else if (visibleRange.containsPoint(offsetX, offsetY)) {
            this.changedCursor = true;
            style.cursor = 'grab';
        }
        else if (this.changedCursor) {
            this.changedCursor = false;
            style.cursor = 'default';
        }
        if (this.minHandleDragging) {
            rs.min = getRatio();
        }
        else if (this.maxHandleDragging) {
            rs.max = getRatio();
        }
        else if (!isNaN(panHandleOffset)) {
            var span = rs.max - rs.min;
            var min = Math.min(getRatio() - panHandleOffset, 1 - span);
            if (min <= rs.min) {
                // pan left
                rs.min = min;
                rs.max = rs.min + span;
            }
            else {
                // pan right
                rs.max = min + span;
                rs.min = rs.max - span;
            }
        }
    };
    Navigator.prototype.onDragStop = function () {
        this.stopHandleDragging();
    };
    Navigator.prototype.stopHandleDragging = function () {
        this.minHandleDragging = this.maxHandleDragging = false;
        this.panHandleOffset = NaN;
    };
    return Navigator;
}());
exports.Navigator = Navigator;
