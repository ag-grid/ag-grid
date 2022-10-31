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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Shape } from './shape';
import { chainObjects } from '../../util/object';
import { BBox } from '../bbox';
import { RedrawType, SceneChangeDetection } from '../node';
var Line = /** @class */ (function (_super) {
    __extends(Line, _super);
    function Line() {
        var _this = _super.call(this) || this;
        _this.x1 = 0;
        _this.y1 = 0;
        _this.x2 = 0;
        _this.y2 = 0;
        _this.restoreOwnStyles();
        return _this;
    }
    Line.prototype.computeBBox = function () {
        return new BBox(this.x1, this.y1, this.x2 - this.x1, this.y2 - this.y1);
    };
    Line.prototype.isPointInPath = function (_x, _y) {
        return false;
    };
    Line.prototype.render = function (renderCtx) {
        var _a;
        var ctx = renderCtx.ctx, forceRender = renderCtx.forceRender, stats = renderCtx.stats;
        if (this.dirty === RedrawType.NONE && !forceRender) {
            if (stats)
                stats.nodesSkipped += this.nodeCount.count;
            return;
        }
        this.computeTransformMatrix();
        this.matrix.toContext(ctx);
        var x1 = this.x1;
        var y1 = this.y1;
        var x2 = this.x2;
        var y2 = this.y2;
        // Align to the pixel grid if the line is strictly vertical
        // or horizontal (but not both, i.e. a dot).
        if (x1 === x2) {
            var x = Math.round(x1) + (Math.floor(this.strokeWidth) % 2) / 2;
            x1 = x;
            x2 = x;
        }
        else if (y1 === y2) {
            var y = Math.round(y1) + (Math.floor(this.strokeWidth) % 2) / 2;
            y1 = y;
            y2 = y;
        }
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        this.fillStroke(ctx);
        (_a = this.fillShadow) === null || _a === void 0 ? void 0 : _a.markClean();
        _super.prototype.render.call(this, renderCtx);
    };
    Line.className = 'Line';
    Line.defaultStyles = chainObjects(Shape.defaultStyles, {
        fill: undefined,
        strokeWidth: 1,
    });
    __decorate([
        SceneChangeDetection({ redraw: RedrawType.MAJOR })
    ], Line.prototype, "x1", void 0);
    __decorate([
        SceneChangeDetection({ redraw: RedrawType.MAJOR })
    ], Line.prototype, "y1", void 0);
    __decorate([
        SceneChangeDetection({ redraw: RedrawType.MAJOR })
    ], Line.prototype, "x2", void 0);
    __decorate([
        SceneChangeDetection({ redraw: RedrawType.MAJOR })
    ], Line.prototype, "y2", void 0);
    return Line;
}(Shape));
export { Line };
