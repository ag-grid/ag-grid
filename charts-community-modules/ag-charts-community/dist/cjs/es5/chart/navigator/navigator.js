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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Navigator = void 0;
var rangeSelector_1 = require("../shapes/rangeSelector");
var navigatorMask_1 = require("./navigatorMask");
var navigatorHandle_1 = require("./navigatorHandle");
var module_1 = require("../../util/module");
var validation_1 = require("../../util/validation");
var bbox_1 = require("../../scene/bbox");
var Navigator = /** @class */ (function (_super) {
    __extends(Navigator, _super);
    function Navigator(ctx) {
        var _this = _super.call(this) || this;
        _this.ctx = ctx;
        _this.rs = new rangeSelector_1.RangeSelector();
        // Wrappers to allow option application to the scene graph nodes.
        _this.mask = new navigatorMask_1.NavigatorMask(_this.rs.mask);
        _this.minHandle = new navigatorHandle_1.NavigatorHandle(_this.rs.minHandle);
        _this.maxHandle = new navigatorHandle_1.NavigatorHandle(_this.rs.maxHandle);
        _this.minHandleDragging = false;
        _this.maxHandleDragging = false;
        _this.panHandleOffset = NaN;
        _this._enabled = false;
        _this.margin = 10;
        _this._visible = true;
        _this.rs.onRangeChange = function () {
            return _this.ctx.zoomManager.updateZoom('navigator', { x: { min: _this.rs.min, max: _this.rs.max } });
        };
        [
            ctx.interactionManager.addListener('drag-start', function (event) { return _this.onDragStart(event); }),
            ctx.interactionManager.addListener('drag', function (event) { return _this.onDrag(event); }),
            ctx.interactionManager.addListener('hover', function (event) { return _this.onDrag(event); }),
            ctx.interactionManager.addListener('drag-end', function () { return _this.onDragStop(); }),
        ].forEach(function (s) { return _this.destroyFns.push(function () { return ctx.interactionManager.removeListener(s); }); });
        [
            ctx.layoutService.addListener('before-series', function (event) { return _this.layout(event); }),
            ctx.layoutService.addListener('layout-complete', function (event) { return _this.layoutComplete(event); }),
        ].forEach(function (s) { return _this.destroyFns.push(function () { return ctx.layoutService.removeListener(s); }); });
        ctx.scene.root.appendChild(_this.rs);
        _this.destroyFns.push(function () { var _a; return (_a = ctx.scene.root) === null || _a === void 0 ? void 0 : _a.removeChild(_this.rs); });
        _this.updateGroupVisibility();
        return _this;
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
    Navigator.prototype.layout = function (_a) {
        var shrinkRect = _a.shrinkRect;
        if (this.enabled) {
            var navigatorTotalHeight = this.rs.height + this.margin;
            shrinkRect.shrink(navigatorTotalHeight, 'bottom');
            this.rs.y = shrinkRect.y + shrinkRect.height + this.margin;
        }
        return { shrinkRect: shrinkRect };
    };
    Navigator.prototype.layoutComplete = function (_a) {
        var _b = _a.series, rect = _b.rect, visible = _b.visible;
        if (this.enabled && visible) {
            this.rs.x = rect.x;
            this.rs.width = rect.width;
        }
        this.visible = visible;
    };
    Navigator.prototype.update = function () {
        // Nothing to do!
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
        var visibleRange = new bbox_1.BBox(minX, y, maxX - minX, height);
        var getRatio = function () { return Math.min(Math.max((offsetX - x) / width, 0), 1); };
        if (minHandle.containsPoint(offsetX, offsetY) || maxHandle.containsPoint(offsetX, offsetY)) {
            this.ctx.cursorManager.updateCursor('navigator', 'ew-resize');
        }
        else if (visibleRange.containsPoint(offsetX, offsetY)) {
            this.ctx.cursorManager.updateCursor('navigator', 'grab');
        }
        else {
            this.ctx.cursorManager.updateCursor('navigator');
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
        validation_1.Validate(validation_1.BOOLEAN)
    ], Navigator.prototype, "_enabled", void 0);
    __decorate([
        validation_1.Validate(validation_1.NUMBER(0))
    ], Navigator.prototype, "margin", void 0);
    return Navigator;
}(module_1.BaseModuleInstance));
exports.Navigator = Navigator;
