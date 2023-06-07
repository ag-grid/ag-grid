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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { RangeSelector } from '../shapes/rangeSelector';
import { NavigatorMask } from './navigatorMask';
import { NavigatorHandle } from './navigatorHandle';
import { BaseModuleInstance } from '../../util/module';
import { BOOLEAN, NUMBER, Validate } from '../../util/validation';
import { BBox } from '../../scene/bbox';
var Navigator = /** @class */ (function (_super) {
    __extends(Navigator, _super);
    function Navigator(ctx) {
        var _this = _super.call(this) || this;
        _this.ctx = ctx;
        _this.rs = new RangeSelector();
        // Wrappers to allow option application to the scene graph nodes.
        _this.mask = new NavigatorMask(_this.rs.mask);
        _this.minHandle = new NavigatorHandle(_this.rs.minHandle);
        _this.maxHandle = new NavigatorHandle(_this.rs.maxHandle);
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
        _this.destroyFns.push(function () { return _this.ctx.zoomManager.updateZoom('navigator'); });
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
        var visible = this.enabled && this.visible;
        this.rs.visible = visible;
        if (visible) {
            this.ctx.zoomManager.updateZoom('navigator', { x: { min: this.rs.min, max: this.rs.max } });
        }
        else {
            this.ctx.zoomManager.updateZoom('navigator');
        }
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
        Validate(BOOLEAN)
    ], Navigator.prototype, "_enabled", void 0);
    __decorate([
        Validate(NUMBER(0))
    ], Navigator.prototype, "margin", void 0);
    return Navigator;
}(BaseModuleInstance));
export { Navigator };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmF2aWdhdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL2NoYXJ0L25hdmlnYXRvci9uYXZpZ2F0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBQ3hELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUNoRCxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFDcEQsT0FBTyxFQUFFLGtCQUFrQixFQUFpQyxNQUFNLG1CQUFtQixDQUFDO0FBQ3RGLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxNQUFNLHVCQUF1QixDQUFDO0FBRWxFLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQztBQU94QztJQUErQiw2QkFBa0I7SUEwRTdDLG1CQUE2QixHQUFrQjtRQUEvQyxZQUNJLGlCQUFPLFNBcUJWO1FBdEI0QixTQUFHLEdBQUgsR0FBRyxDQUFlO1FBekU5QixRQUFFLEdBQUcsSUFBSSxhQUFhLEVBQUUsQ0FBQztRQUUxQyxpRUFBaUU7UUFDeEQsVUFBSSxHQUFHLElBQUksYUFBYSxDQUFDLEtBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDdkMsZUFBUyxHQUFHLElBQUksZUFBZSxDQUFDLEtBQUksQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDbkQsZUFBUyxHQUFHLElBQUksZUFBZSxDQUFDLEtBQUksQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLENBQUM7UUFFcEQsdUJBQWlCLEdBQUcsS0FBSyxDQUFDO1FBQzFCLHVCQUFpQixHQUFHLEtBQUssQ0FBQztRQUMxQixxQkFBZSxHQUFHLEdBQUcsQ0FBQztRQUd0QixjQUFRLEdBQUcsS0FBSyxDQUFDO1FBeUJ6QixZQUFNLEdBQUcs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