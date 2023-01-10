var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { RangeSelector } from '../shapes/rangeSelector';
import { BBox } from '../../scene/bbox';
import { NavigatorMask } from './navigatorMask';
import { NavigatorHandle } from './navigatorHandle';
import { ChartUpdateType } from '../chart';
import { BOOLEAN, NUMBER, Validate } from '../../util/validation';
var Navigator = /** @class */ (function () {
    function Navigator(chart, interactionManager, cursorManager) {
        var _this = this;
        this.chart = chart;
        this.cursorManager = cursorManager;
        this.rs = new RangeSelector();
        this.mask = new NavigatorMask(this.rs.mask);
        this.minHandle = new NavigatorHandle(this.rs.minHandle);
        this.maxHandle = new NavigatorHandle(this.rs.maxHandle);
        this.minHandleDragging = false;
        this.maxHandleDragging = false;
        this.panHandleOffset = NaN;
        this._enabled = false;
        this._margin = 10;
        this._visible = true;
        this.chart.scene.root.append(this.rs);
        this.rs.onRangeChange = function () { return chart.update(ChartUpdateType.PERFORM_LAYOUT, { forceNodeDataRefresh: true }); };
        interactionManager.addListener('drag-start', function (event) { return _this.onDragStart(event); });
        interactionManager.addListener('drag', function (event) { return _this.onDrag(event); });
        interactionManager.addListener('hover', function (event) { return _this.onDrag(event); });
        interactionManager.addListener('drag-end', function () { return _this.onDragStop(); });
    }
    Object.defineProperty(Navigator.prototype, "enabled", {
        get: function () {
            return this._enabled;
        },
        set: function (value) {
            this._enabled = value;
            this.updateGroupVisibility();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Navigator.prototype, "x", {
        get: function () {
            return this.rs.x;
        },
        set: function (value) {
            this.rs.x = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Navigator.prototype, "y", {
        get: function () {
            return this.rs.y;
        },
        set: function (value) {
            this.rs.y = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Navigator.prototype, "width", {
        get: function () {
            return this.rs.width;
        },
        set: function (value) {
            this.rs.width = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Navigator.prototype, "height", {
        get: function () {
            return this.rs.height;
        },
        set: function (value) {
            this.rs.height = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Navigator.prototype, "margin", {
        get: function () {
            return this._margin;
        },
        set: function (value) {
            this._margin = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Navigator.prototype, "min", {
        get: function () {
            return this.rs.min;
        },
        set: function (value) {
            this.rs.min = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Navigator.prototype, "max", {
        get: function () {
            return this.rs.max;
        },
        set: function (value) {
            this.rs.max = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Navigator.prototype, "visible", {
        get: function () {
            return this._visible;
        },
        set: function (value) {
            this._visible = value;
            this.updateGroupVisibility();
        },
        enumerable: false,
        configurable: true
    });
    Navigator.prototype.updateGroupVisibility = function () {
        this.rs.visible = this.enabled && this.visible;
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
        var offsetX = offset.offsetX, offsetY = offset.offsetY;
        var minX = x + width * rs.min;
        var maxX = x + width * rs.max;
        var visibleRange = new BBox(minX, y, maxX - minX, height);
        function getRatio() {
            return Math.min(Math.max((offsetX - x) / width, 0), 1);
        }
        if (minHandle.containsPoint(offsetX, offsetY) || maxHandle.containsPoint(offsetX, offsetY)) {
            this.cursorManager.updateCursor('navigator', 'ew-resize');
        }
        else if (visibleRange.containsPoint(offsetX, offsetY)) {
            this.cursorManager.updateCursor('navigator', 'grab');
        }
        else {
            this.cursorManager.updateCursor('navigator');
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
    __decorate([
        Validate(BOOLEAN)
    ], Navigator.prototype, "_enabled", void 0);
    __decorate([
        Validate(NUMBER(0))
    ], Navigator.prototype, "_margin", void 0);
    return Navigator;
}());
export { Navigator };
