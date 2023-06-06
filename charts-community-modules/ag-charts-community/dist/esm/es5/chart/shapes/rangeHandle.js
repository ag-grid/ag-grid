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
import { Path } from '../../scene/shape/path';
import { BBox } from '../../scene/bbox';
import { LINE_CAP, NUMBER, COLOR_STRING, Validate } from '../../util/validation';
var RangeHandle = /** @class */ (function (_super) {
    __extends(RangeHandle, _super);
    function RangeHandle() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._fill = '#f2f2f2';
        _this._stroke = '#999999';
        _this._strokeWidth = 1;
        _this._lineCap = 'square';
        _this._centerX = 0;
        _this._centerY = 0;
        // Use an even number for better looking results.
        _this._width = 8;
        // Use an even number for better looking results.
        _this._gripLineGap = 2;
        // Use an even number for better looking results.
        _this._gripLineLength = 8;
        _this._height = 16;
        return _this;
    }
    Object.defineProperty(RangeHandle.prototype, "centerX", {
        get: function () {
            return this._centerX;
        },
        set: function (value) {
            if (this._centerX !== value) {
                this._centerX = value;
                this.dirtyPath = true;
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RangeHandle.prototype, "centerY", {
        get: function () {
            return this._centerY;
        },
        set: function (value) {
            if (this._centerY !== value) {
                this._centerY = value;
                this.dirtyPath = true;
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RangeHandle.prototype, "width", {
        get: function () {
            return this._width;
        },
        set: function (value) {
            if (this._width !== value) {
                this._width = value;
                this.dirtyPath = true;
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RangeHandle.prototype, "gripLineGap", {
        get: function () {
            return this._gripLineGap;
        },
        set: function (value) {
            if (this._gripLineGap !== value) {
                this._gripLineGap = value;
                this.dirtyPath = true;
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RangeHandle.prototype, "gripLineLength", {
        get: function () {
            return this._gripLineLength;
        },
        set: function (value) {
            if (this._gripLineLength !== value) {
                this._gripLineLength = value;
                this.dirtyPath = true;
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RangeHandle.prototype, "height", {
        get: function () {
            return this._height;
        },
        set: function (value) {
            if (this._height !== value) {
                this._height = value;
                this.dirtyPath = true;
            }
        },
        enumerable: false,
        configurable: true
    });
    RangeHandle.prototype.computeBBox = function () {
        var _a = this, centerX = _a.centerX, centerY = _a.centerY, width = _a.width, height = _a.height;
        var x = centerX - width / 2;
        var y = centerY - height / 2;
        return new BBox(x, y, width, height);
    };
    RangeHandle.prototype.isPointInPath = function (x, y) {
        var point = this.transformPoint(x, y);
        var bbox = this.computeBBox();
        return bbox.containsPoint(point.x, point.y);
    };
    RangeHandle.prototype.updatePath = function () {
        var _a = this, path = _a.path, centerX = _a.centerX, centerY = _a.centerY, width = _a.width, height = _a.height;
        path.clear();
        var x = centerX - width / 2;
        var y = centerY - height / 2;
        var ax = this.align(x);
        var ay = this.align(y);
        var axw = ax + this.align(x, width);
        var ayh = ay + this.align(y, height);
        // Handle.
        path.moveTo(ax, ay);
        path.lineTo(axw, ay);
        path.lineTo(axw, ayh);
        path.lineTo(ax, ayh);
        path.lineTo(ax, ay);
        // Grip lines.
        var dx = this.gripLineGap / 2;
        var dy = this.gripLineLength / 2;
        path.moveTo(this.align(centerX - dx), this.align(centerY - dy));
        path.lineTo(this.align(centerX - dx), this.align(centerY + dy));
        path.moveTo(this.align(centerX + dx), this.align(centerY - dy));
        path.lineTo(this.align(centerX + dx), this.align(centerY + dy));
    };
    RangeHandle.className = 'RangeHandle';
    __decorate([
        Validate(COLOR_STRING)
    ], RangeHandle.prototype, "_fill", void 0);
    __decorate([
        Validate(COLOR_STRING)
    ], RangeHandle.prototype, "_stroke", void 0);
    __decorate([
        Validate(NUMBER(0))
    ], RangeHandle.prototype, "_strokeWidth", void 0);
    __decorate([
        Validate(LINE_CAP)
    ], RangeHandle.prototype, "_lineCap", void 0);
    __decorate([
        Validate(NUMBER(0))
    ], RangeHandle.prototype, "_width", void 0);
    __decorate([
        Validate(NUMBER(0))
    ], RangeHandle.prototype, "_gripLineGap", void 0);
    __decorate([
        Validate(NUMBER(0))
    ], RangeHandle.prototype, "_gripLineLength", void 0);
    __decorate([
        Validate(NUMBER(0))
    ], RangeHandle.prototype, "_height", void 0);
    return RangeHandle;
}(Path));
export { RangeHandle };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmFuZ2VIYW5kbGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvY2hhcnQvc2hhcGVzL3JhbmdlSGFuZGxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUM5QyxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sa0JBQWtCLENBQUM7QUFFeEMsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsWUFBWSxFQUFFLFFBQVEsRUFBRSxNQUFNLHVCQUF1QixDQUFDO0FBRWpGO0lBQWlDLCtCQUFJO0lBQXJDO1FBQUEscUVBbUlDO1FBL0hhLFdBQUssR0FBRyxTQUFTLENBQUM7UUFHbEIsYUFBTyxHQUFHLFNBQVMsQ0FBQztRQUdwQixrQkFBWSxHQUFHLENBQUMsQ0FBQztRQUdqQixjQUFRLEdBQUcsUUFBd0IsQ0FBQztRQUVwQyxjQUFRLEdBQVcsQ0FBQyxDQUFDO1FBV3JCLGNBQVEsR0FBVyxDQUFDLENBQUM7UUFXL0IsaURBQWlEO1FBRXZDLFlBQU0sR0FBVyxDQUFDLENBQUM7UUFXN0IsaURBQWlEO1FBRXZDLGtCQUFZLEdBQVcsQ0FBQyxDQUFDO1FBV25DLGlEQUFpRDtRQUV2QyxxQkFBZSxHQUFXLENBQUMsQ0FBQztRQVk1QixhQUFPLEdBQVcsRUFBRSxDQUFDOztJQXNEbkMsQ0FBQztJQW5IRyxzQkFBSSxnQ0FBTzthQU1YO1lBQ0ksT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDO1FBQ3pCLENBQUM7YUFSRCxVQUFZLEtBQWE7WUFDckIsSUFBSSxJQUFJLENBQUMsUUFBUSxLQUFLLEtBQUssRUFBRTtnQkFDekIsSUFBSSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7Z0JBQ3RCLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDO2FBQ3pCO1FBQ0wsQ0FBQzs7O09BQUE7SUFNRCxzQkFBSSxnQ0FB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