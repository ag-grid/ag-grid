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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Shape } from './shape';
import { BBox } from '../bbox';
import { RedrawType, SceneChangeDetection } from '../node';
var Range = /** @class */ (function (_super) {
    __extends(Range, _super);
    function Range() {
        var _this = _super.call(this) || this;
        _this.x1 = 0;
        _this.y1 = 0;
        _this.x2 = 0;
        _this.y2 = 0;
        _this.startLine = false;
        _this.endLine = false;
        _this.isRange = false;
        _this.restoreOwnStyles();
        return _this;
    }
    Range.prototype.computeBBox = function () {
        return new BBox(this.x1, this.y1, this.x2 - this.x1, this.y2 - this.y1);
    };
    Range.prototype.isPointInPath = function (_x, _y) {
        return false;
    };
    Range.prototype.render = function (renderCtx) {
        var _a;
        var ctx = renderCtx.ctx, forceRender = renderCtx.forceRender, stats = renderCtx.stats;
        if (this.dirty === RedrawType.NONE && !forceRender) {
            if (stats)
                stats.nodesSkipped += this.nodeCount.count;
            return;
        }
        this.computeTransformMatrix();
        this.matrix.toContext(ctx);
        var _b = this, x1 = _b.x1, y1 = _b.y1, x2 = _b.x2, y2 = _b.y2;
        x1 = this.align(x1);
        y1 = this.align(y1);
        x2 = this.align(x2);
        y2 = this.align(y2);
        var _c = this, fill = _c.fill, opacity = _c.opacity, isRange = _c.isRange;
        var fillActive = !!(isRange && fill);
        if (fillActive) {
            var fillOpacity = this.fillOpacity;
            ctx.fillStyle = fill;
            ctx.globalAlpha = opacity * fillOpacity;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y1);
            ctx.lineTo(x2, y2);
            ctx.lineTo(x1, y2);
            ctx.closePath();
            ctx.fill();
        }
        var _d = this, stroke = _d.stroke, strokeWidth = _d.strokeWidth, startLine = _d.startLine, endLine = _d.endLine;
        var strokeActive = !!((startLine || endLine) && stroke && strokeWidth);
        if (strokeActive) {
            var _e = this, strokeOpacity = _e.strokeOpacity, lineDash = _e.lineDash, lineDashOffset = _e.lineDashOffset, lineCap = _e.lineCap, lineJoin = _e.lineJoin;
            ctx.strokeStyle = stroke;
            ctx.globalAlpha = opacity * strokeOpacity;
            ctx.lineWidth = strokeWidth;
            if (lineDash) {
                ctx.setLineDash(lineDash);
            }
            if (lineDashOffset) {
                ctx.lineDashOffset = lineDashOffset;
            }
            if (lineCap) {
                ctx.lineCap = lineCap;
            }
            if (lineJoin) {
                ctx.lineJoin = lineJoin;
            }
            ctx.beginPath();
            if (startLine) {
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y1);
            }
            if (endLine) {
                ctx.moveTo(x2, y2);
                ctx.lineTo(x1, y2);
            }
            ctx.stroke();
        }
        (_a = this.fillShadow) === null || _a === void 0 ? void 0 : _a.markClean();
        _super.prototype.render.call(this, renderCtx);
    };
    Range.className = 'Range';
    Range.defaultStyles = __assign(__assign({}, Shape.defaultStyles), { strokeWidth: 1 });
    __decorate([
        SceneChangeDetection({ redraw: RedrawType.MINOR })
    ], Range.prototype, "x1", void 0);
    __decorate([
        SceneChangeDetection({ redraw: RedrawType.MINOR })
    ], Range.prototype, "y1", void 0);
    __decorate([
        SceneChangeDetection({ redraw: RedrawType.MINOR })
    ], Range.prototype, "x2", void 0);
    __decorate([
        SceneChangeDetection({ redraw: RedrawType.MINOR })
    ], Range.prototype, "y2", void 0);
    __decorate([
        SceneChangeDetection({ redraw: RedrawType.MINOR })
    ], Range.prototype, "startLine", void 0);
    __decorate([
        SceneChangeDetection({ redraw: RedrawType.MINOR })
    ], Range.prototype, "endLine", void 0);
    __decorate([
        SceneChangeDetection({ redraw: RedrawType.MINOR })
    ], Range.prototype, "isRange", void 0);
    return Range;
}(Shape));
export { Range };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmFuZ2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvc2NlbmUvc2hhcGUvcmFuZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sU0FBUyxDQUFDO0FBQ2hDLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxTQUFTLENBQUM7QUFDL0IsT0FBTyxFQUFFLFVBQVUsRUFBRSxvQkFBb0IsRUFBaUIsTUFBTSxTQUFTLENBQUM7QUFFMUU7SUFBMkIseUJBQUs7SUFRNUI7UUFBQSxZQUNJLGlCQUFPLFNBRVY7UUFHRCxRQUFFLEdBQVcsQ0FBQyxDQUFDO1FBR2YsUUFBRSxHQUFXLENBQUMsQ0FBQztRQUdmLFFBQUUsR0FBVyxDQUFDLENBQUM7UUFHZixRQUFFLEdBQVcsQ0FBQyxDQUFDO1FBR2YsZUFBUyxHQUFZLEtBQUssQ0FBQztRQUczQixhQUFPLEdBQVksS0FBSyxDQUFDO1FBR3pCLGFBQU8sR0FBWSxLQUFLLENBQUM7UUF0QnJCLEtBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDOztJQUM1QixDQUFDO0lBdUJELDJCQUFXLEdBQVg7UUFDSSxPQUFPLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDNUUsQ0FBQztJQUVELDZCQUFhLEdBQWIsVUFBYyxFQUFVLEVBQUUsRUFBVTtRQUNoQyxPQUFPLEtBQUssQ0FBQztJQUNqQixDQUFDO0lBRUQsc0JBQU0sR0FBTixVQUFPLFNBQXdCOztRQUNuQixJQUFBLEdBQUcsR0FBeUIsU0FBUyxJQUFsQyxFQUFFLFdBQVcsR0FBWSxTQUFTLFlBQXJCLEVBQUUsS0FB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