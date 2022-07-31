"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const shape_1 = require("./shape");
const path2D_1 = require("../path2D");
class Path extends shape_1.Shape {
    constructor() {
        super(...arguments);
        /**
         * Declare a path to retain for later rendering and hit testing
         * using custom Path2D class. Think of it as a TypeScript version
         * of the native Path2D (with some differences) that works in all browsers.
         */
        this.path = new path2D_1.Path2D();
        /**
        * The path only has to be updated when certain attributes change.
        * For example, if transform attributes (such as `translationX`)
        * are changed, we don't have to update the path. The `dirtyPath` flag
        * is how we keep track if the path has to be updated or not.
        */
        this._dirtyPath = true;
        /**
         * Path definition in SVG path syntax:
         * https://www.w3.org/TR/SVG11/paths.html#DAttribute
         */
        this._svgPath = '';
    }
    set dirtyPath(value) {
        if (this._dirtyPath !== value) {
            this._dirtyPath = value;
            if (value) {
                this.dirty = true;
            }
        }
    }
    get dirtyPath() {
        return this._dirtyPath;
    }
    set svgPath(value) {
        if (this._svgPath !== value) {
            this._svgPath = value;
            this.path.setFromString(value);
            this.dirty = true;
        }
    }
    get svgPath() {
        return this._svgPath;
    }
    isPointInPath(x, y) {
        const point = this.transformPoint(x, y);
        return this.path.closedPath && this.path.isPointInPath(point.x, point.y);
    }
    isPointInStroke(x, y) {
        return false;
    }
    updatePath() { }
    render(ctx) {
        const scene = this.scene;
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
    }
}
exports.Path = Path;
Path.className = 'Path';
