"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const shape_1 = require("./shape");
const path_1 = require("./path");
const bbox_1 = require("../bbox");
const angle_1 = require("../../util/angle");
const object_1 = require("../../util/object");
const number_1 = require("../../util/number");
var ArcType;
(function (ArcType) {
    ArcType[ArcType["Open"] = 0] = "Open";
    ArcType[ArcType["Chord"] = 1] = "Chord";
    ArcType[ArcType["Round"] = 2] = "Round";
})(ArcType = exports.ArcType || (exports.ArcType = {}));
/**
 * Elliptical arc node.
 */
class Arc extends path_1.Path {
    constructor() {
        super();
        this._centerX = 0;
        this._centerY = 0;
        this._radiusX = 10;
        this._radiusY = 10;
        this._startAngle = 0;
        this._endAngle = Math.PI * 2;
        this._counterClockwise = false;
        /**
         * The type of arc to render:
         * - {@link ArcType.Open} - end points of the arc segment are not connected (default)
         * - {@link ArcType.Chord} - end points of the arc segment are connected by a line segment
         * - {@link ArcType.Round} - each of the end points of the arc segment are connected
         *                           to the center of the arc
         * Arcs with {@link ArcType.Open} do not support hit testing, even if they have their
         * {@link Shape.fillStyle} set, because they are not closed paths. Hit testing support
         * would require using two paths - one for rendering, another for hit testing - and there
         * doesn't seem to be a compelling reason to do that, when one can just use {@link ArcType.Chord}
         * to create a closed path.
         */
        this._type = ArcType.Open;
        this.restoreOwnStyles();
    }
    set centerX(value) {
        if (this._centerX !== value) {
            this._centerX = value;
            this.dirtyPath = true;
        }
    }
    get centerX() {
        return this._centerX;
    }
    set centerY(value) {
        if (this._centerY !== value) {
            this._centerY = value;
            this.dirtyPath = true;
        }
    }
    get centerY() {
        return this._centerY;
    }
    set radiusX(value) {
        if (this._radiusX !== value) {
            this._radiusX = value;
            this.dirtyPath = true;
        }
    }
    get radiusX() {
        return this._radiusX;
    }
    set radiusY(value) {
        if (this._radiusY !== value) {
            this._radiusY = value;
            this.dirtyPath = true;
        }
    }
    get radiusY() {
        return this._radiusY;
    }
    set startAngle(value) {
        if (this._startAngle !== value) {
            this._startAngle = value;
            this.dirtyPath = true;
        }
    }
    get startAngle() {
        return this._startAngle;
    }
    set endAngle(value) {
        if (this._endAngle !== value) {
            this._endAngle = value;
            this.dirtyPath = true;
        }
    }
    get endAngle() {
        return this._endAngle;
    }
    get fullPie() {
        return number_1.isEqual(angle_1.normalizeAngle360(this.startAngle), angle_1.normalizeAngle360(this.endAngle));
    }
    set counterClockwise(value) {
        if (this._counterClockwise !== value) {
            this._counterClockwise = value;
            this.dirtyPath = true;
        }
    }
    get counterClockwise() {
        return this._counterClockwise;
    }
    set type(value) {
        if (this._type !== value) {
            this._type = value;
            this.dirtyPath = true;
        }
    }
    get type() {
        return this._type;
    }
    updatePath() {
        const path = this.path;
        path.clear(); // No need to recreate the Path, can simply clear the existing one.
        // This is much faster than the native Path2D implementation even though this `cubicArc`
        // method is pure TypeScript and actually produces the definition of an elliptical arc,
        // where you can specify two radii and rotation, while Path2D's `arc` method simply produces
        // a circular arc. Maybe it's due to the experimental nature of the Path2D class,
        // maybe it's because we have to create a new instance of it on each render, who knows...
        path.cubicArc(this.centerX, this.centerY, this.radiusX, this.radiusY, 0, this.startAngle, this.endAngle, this.counterClockwise ? 1 : 0);
        if (this.type === ArcType.Chord) {
            path.closePath();
        }
        else if (this.type === ArcType.Round && !this.fullPie) {
            path.lineTo(this.centerX, this.centerY);
            path.closePath();
        }
    }
    computeBBox() {
        // Only works with full arcs (circles) and untransformed ellipses.
        return new bbox_1.BBox(this.centerX - this.radiusX, this.centerY - this.radiusY, this.radiusX * 2, this.radiusY * 2);
    }
    isPointInPath(x, y) {
        const point = this.transformPoint(x, y);
        const bbox = this.computeBBox();
        return this.type !== ArcType.Open
            && bbox.containsPoint(point.x, point.y)
            && this.path.isPointInPath(point.x, point.y);
    }
}
exports.Arc = Arc;
Arc.className = 'Arc';
Arc.defaultStyles = object_1.chainObjects(shape_1.Shape.defaultStyles, {
    lineWidth: 1,
    fillStyle: null
});
