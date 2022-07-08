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
import { Shape } from "./shape";
import { Path2D } from "../path2D";
var Path = /** @class */ (function (_super) {
    __extends(Path, _super);
    function Path() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        /**
         * Declare a path to retain for later rendering and hit testing
         * using custom Path2D class. Think of it as a TypeScript version
         * of the native Path2D (with some differences) that works in all browsers.
         */
        _this.path = new Path2D();
        /**
        * The path only has to be updated when certain attributes change.
        * For example, if transform attributes (such as `translationX`)
        * are changed, we don't have to update the path. The `dirtyPath` flag
        * is how we keep track if the path has to be updated or not.
        */
        _this._dirtyPath = true;
        /**
         * Path definition in SVG path syntax:
         * https://www.w3.org/TR/SVG11/paths.html#DAttribute
         */
        _this._svgPath = '';
        return _this;
    }
    Object.defineProperty(Path.prototype, "dirtyPath", {
        get: function () {
            return this._dirtyPath;
        },
        set: function (value) {
            if (this._dirtyPath !== value) {
                this._dirtyPath = value;
                if (value) {
                    this.dirty = true;
                }
            }
        },
        enumerable: true,
        configurable: true
    });
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
    Path.prototype.updatePath = function () { };
    Path.prototype.render = function (ctx) {
        var scene = this.scene;
        if (this.dirtyTransform) {
            this.computeTransformMatrix();
        }
        // if (scene.debug.renderBoundingBoxes) {
        //     const bbox = this.computeBBox();
        //     if (bbox) {
        //         this.matrix.transformBBox(bbox).render(ctx);
        //     }
        // }
        this.matrix.toContext(ctx);
        if (this.dirtyPath) {
            this.updatePath();
            this.dirtyPath = false;
        }
        scene.appendPath(this.path);
        this.fillStroke(ctx);
        this.dirty = false;
    };
    Path.className = 'Path';
    return Path;
}(Shape));
export { Path };
