// ag-grid-enterprise v21.2.2
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
var Path = /** @class */ (function (_super) {
    __extends(Path, _super);
    function Path() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        /**
         * Make sure to set {@link dirty} to `true` after changing the path.
         */
        _this.path = new path2D_1.Path2D();
        /**
         * Path definition in SVG path syntax:
         * https://www.w3.org/TR/SVG11/paths.html#DAttribute
         */
        _this._svgPath = '';
        return _this;
    }
    Object.defineProperty(Path.prototype, "svgPath", {
        get: function () {
            return this._svgPath;
        },
        set: function (value) {
            if (this._svgPath !== value) {
                this._svgPath = value;
                this.path.setFromString(value);
                this.dirty = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Path.prototype.isPointInPath = function (x, y) {
        var point = this.transformPoint(x, y);
        return this.path.closedPath && this.path.isPointInPath(point.x, point.y);
    };
    Path.prototype.isPointInStroke = function (x, y) {
        return false;
    };
    Path.prototype.render = function (ctx) {
        if (this.dirtyTransform) {
            this.computeTransformMatrix();
        }
        this.matrix.toContext(ctx);
        this.scene.appendPath(this.path);
        this.fillStroke(ctx);
        this.dirty = false;
    };
    Path.className = 'Path';
    return Path;
}(shape_1.Shape));
exports.Path = Path;
