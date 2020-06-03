import { RangeSelector } from "../shapes/rangeSelector";
import { ChartAxisDirection } from "../chartAxis";
import { BBox } from "../../scene/bbox";
import { NavigatorMask } from "./navigatorMask";
import { NavigatorHandle } from "./navigatorHandle";
var Navigator = /** @class */ (function () {
    function Navigator(chart) {
        var _this = this;
        this.rs = new RangeSelector();
        this.mask = new NavigatorMask(this.rs.mask);
        this.minHandle = new NavigatorHandle(this.rs.minHandle);
        this.maxHandle = new NavigatorHandle(this.rs.maxHandle);
        this.minHandleDragging = false;
        this.maxHandleDragging = false;
        this.panHandleOffset = NaN;
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
            this.chart.layoutPending = true;
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
            this.chart.layoutPending = true;
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
            this.chart.layoutPending = true;
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
        this.chart.axes.forEach(function (axis) {
            if (axis.direction === ChartAxisDirection.X) {
                axis.visibleRange = [min, max];
                axis.update();
            }
        });
        this.chart.series.forEach(function (series) { return series.update(); });
    };
    Navigator.prototype.onMouseDown = function (event) {
        var offsetX = event.offsetX, offsetY = event.offsetY;
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
    Navigator.prototype.onMouseMove = function (event) {
        var _a = this, rs = _a.rs, panHandleOffset = _a.panHandleOffset;
        var x = rs.x, y = rs.y, width = rs.width, height = rs.height, minHandle = rs.minHandle, maxHandle = rs.maxHandle;
        var style = this.chart.element.style;
        var offsetX = event.offsetX, offsetY = event.offsetY;
        var minX = x + width * rs.min;
        var maxX = x + width * rs.max;
        var visibleRange = new BBox(minX, y, maxX - minX, height);
        function getRatio() {
            return Math.min(Math.max((offsetX - x) / width, 0), 1);
        }
        if (minHandle.containsPoint(offsetX, offsetY)) {
            style.cursor = 'ew-resize';
        }
        else if (maxHandle.containsPoint(offsetX, offsetY)) {
            style.cursor = 'ew-resize';
        }
        else if (visibleRange.containsPoint(offsetX, offsetY)) {
            style.cursor = 'grab';
        }
        else {
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
            if (min <= rs.min) { // pan left
                rs.min = min;
                rs.max = rs.min + span;
            }
            else { // pan right
                rs.max = min + span;
                rs.min = rs.max - span;
            }
        }
    };
    Navigator.prototype.onMouseOut = function (event) {
        this.stopHandleDragging();
    };
    Navigator.prototype.onMouseUp = function (event) {
        this.stopHandleDragging();
    };
    Navigator.prototype.stopHandleDragging = function () {
        this.minHandleDragging = this.maxHandleDragging = false;
        this.panHandleOffset = NaN;
    };
    return Navigator;
}());
export { Navigator };
