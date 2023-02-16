"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Arc = void 0;
const shape_1 = require("./shape");
const path_1 = require("./path");
const bbox_1 = require("../bbox");
const angle_1 = require("../../util/angle");
const number_1 = require("../../util/number");
var ArcType;
(function (ArcType) {
    ArcType[ArcType["Open"] = 0] = "Open";
    ArcType[ArcType["Chord"] = 1] = "Chord";
    ArcType[ArcType["Round"] = 2] = "Round";
})(ArcType || (ArcType = {}));
/**
 * Elliptical arc node.
 */
class Arc extends path_1.Path {
    constructor() {
        super();
        this.centerX = 0;
        this.centerY = 0;
        this.radius = 10;
        this.startAngle = 0;
        this.endAngle = Math.PI * 2;
        this.counterClockwise = false;
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
        this.type = ArcType.Open;
        this.restoreOwnStyles();
    }
    get fullPie() {
        return number_1.isEqual(angle_1.normalizeAngle360(this.startAngle), angle_1.normalizeAngle360(this.endAngle));
    }
    updatePath() {
        const path = this.path;
        path.clear(); // No need to recreate the Path, can simply clear the existing one.
        path.arc(this.centerX, this.centerY, this.radius, this.startAngle, this.endAngle, this.counterClockwise);
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
        return new bbox_1.BBox(this.centerX - this.radius, this.centerY - this.radius, this.radius * 2, this.radius * 2);
    }
    isPointInPath(x, y) {
        const point = this.transformPoint(x, y);
        const bbox = this.computeBBox();
        return (this.type !== ArcType.Open &&
            bbox.containsPoint(point.x, point.y) &&
            this.path.isPointInPath(point.x, point.y));
    }
}
Arc.className = 'Arc';
Arc.defaultStyles = Object.assign({}, shape_1.Shape.defaultStyles, {
    lineWidth: 1,
    fillStyle: null,
});
__decorate([
    path_1.ScenePathChangeDetection()
], Arc.prototype, "centerX", void 0);
__decorate([
    path_1.ScenePathChangeDetection()
], Arc.prototype, "centerY", void 0);
__decorate([
    path_1.ScenePathChangeDetection()
], Arc.prototype, "radius", void 0);
__decorate([
    path_1.ScenePathChangeDetection()
], Arc.prototype, "startAngle", void 0);
__decorate([
    path_1.ScenePathChangeDetection()
], Arc.prototype, "endAngle", void 0);
__decorate([
    path_1.ScenePathChangeDetection()
], Arc.prototype, "counterClockwise", void 0);
__decorate([
    path_1.ScenePathChangeDetection()
], Arc.prototype, "type", void 0);
exports.Arc = Arc;
