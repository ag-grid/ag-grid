// ag-grid-enterprise v20.2.0
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
Object.defineProperty(exports, "__esModule", { value: true });
var shape_1 = require("./shape");
var path2D_1 = require("../path2D");
var SvgPath = /** @class */ (function (_super) {
    __extends(SvgPath, _super);
    function SvgPath() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.path2d = new path2D_1.Path2D();
        // Path definition in SVG path syntax.
        _this._path = '';
        return _this;
    }
    Object.defineProperty(SvgPath.prototype, "path", {
        get: function () {
            return this._path;
        },
        set: function (value) {
            if (this._path !== value) {
                this._path = value;
                this.path2d.setFromString(value);
                this.dirty = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    SvgPath.prototype.isPointInPath = function (x, y) {
        var point = this.transformPoint(x, y);
        return this.path2d.isPointInPath(point.x, point.y);
    };
    SvgPath.prototype.isPointInStroke = function (x, y) {
        return false;
    };
    SvgPath.prototype.render = function (ctx) {
        if (this.dirtyTransform) {
            this.computeTransformMatrix();
        }
        this.matrix.toContext(ctx);
        this.applyContextAttributes(ctx);
        this.scene.appendPath(this.path2d);
        if (this.fillStyle) {
            ctx.fill();
        }
        if (this.strokeStyle) {
            ctx.stroke();
        }
        this.dirty = false;
    };
    return SvgPath;
}(shape_1.Shape));
exports.SvgPath = SvgPath;
