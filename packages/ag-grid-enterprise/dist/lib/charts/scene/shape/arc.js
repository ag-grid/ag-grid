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
var bbox_1 = require("../bbox");
var angle_1 = require("../../util/angle");
var object_1 = require("../../util/object");
var number_1 = require("../../util/number");
var ArcType;
(function (ArcType) {
    ArcType[ArcType["Open"] = 0] = "Open";
    ArcType[ArcType["Chord"] = 1] = "Chord";
    ArcType[ArcType["Round"] = 2] = "Round";
})(ArcType = exports.ArcType || (exports.ArcType = {}));
/**
 * Elliptical arc node.
 */
var Arc = /** @class */ (function (_super) {
    __extends(Arc, _super);
    function Arc() {
        var _this = _super.call(this) || this;
        // Declare a path to retain for later rendering and hit testing
        // using custom Path2D class. It's pure TypeScript and works in all browsers.
        _this.path = new path2D_1.Path2D();
        /**
         * It's not always that the path has to be updated.
         * For example, if transform attributes (such as `translationX`)
         * are changed, we don't have to update the path. The `dirtyFlag`
         * is how we keep track if the path has to be updated or not.
         */
        _this._dirtyPath = true;
        _this._centerX = 0;
        _this._centerY = 0;
        _this._radiusX = 10;
        _this._radiusY = 10;
        _this._startAngle = 0;
        _this._endAngle = Math.PI * 2;
        _this._counterClockwise = false;
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
        _this._type = ArcType.Open;
        _this.getBBox = function () {
            // Only works with full arcs (circles) and untransformed ellipses.
            return new bbox_1.BBox(_this.centerX - _this.radiusX, _this.centerY - _this.radiusY, _this.radiusX * 2, _this.radiusY * 2);
        };
        _this.restoreOwnStyles();
        return _this;
    }
    Arc.create = function (centerX, centerY, radiusX, radiusY, startAngle, endAngle, counterClockwise) {
        if (radiusY === void 0) { radiusY = radiusX; }
        if (startAngle === void 0) { startAngle = 0; }
        if (endAngle === void 0) { endAngle = Math.PI * 2; }
        if (counterClockwise === void 0) { counterClockwise = false; }
        var arc = new Arc();
        arc.centerX = centerX;
        arc.centerY = centerY;
        arc.radiusX = radiusX;
        arc.radiusY = radiusY;
        arc.startAngle = startAngle;
        arc.endAngle = endAngle;
        arc.counterClockwise = counterClockwise;
        return arc;
    };
    Object.defineProperty(Arc.prototype, "dirtyPath", {
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
    Object.defineProperty(Arc.prototype, "centerX", {
        get: function () {
            return this._centerX;
        },
        set: function (value) {
            if (this._centerX !== value) {
                this._centerX = value;
                this.dirtyPath = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Arc.prototype, "centerY", {
        get: function () {
            return this._centerY;
        },
        set: function (value) {
            if (this._centerY !== value) {
                this._centerY = value;
                this.dirtyPath = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Arc.prototype, "radiusX", {
        get: function () {
            return this._radiusX;
        },
        set: function (value) {
            if (this._radiusX !== value) {
                this._radiusX = value;
                this.dirtyPath = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Arc.prototype, "radiusY", {
        get: function () {
            return this._radiusY;
        },
        set: function (value) {
            if (this._radiusY !== value) {
                this._radiusY = value;
                this.dirtyPath = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Arc.prototype, "startAngle", {
        get: function () {
            return this._startAngle;
        },
        set: function (value) {
            if (this._startAngle !== value) {
                this._startAngle = value;
                this.dirtyPath = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Arc.prototype, "endAngle", {
        get: function () {
            return this._endAngle;
        },
        set: function (value) {
            if (this._endAngle !== value) {
                this._endAngle = value;
                this.dirtyPath = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Arc.prototype, "fullPie", {
        get: function () {
            return number_1.isEqual(angle_1.normalizeAngle360(this.startAngle), angle_1.normalizeAngle360(this.endAngle));
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Arc.prototype, "counterClockwise", {
        get: function () {
            return this._counterClockwise;
        },
        set: function (value) {
            if (this._counterClockwise !== value) {
                this._counterClockwise = value;
                this.dirtyPath = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Arc.prototype, "type", {
        get: function () {
            return this._type;
        },
        set: function (value) {
            if (this._type !== value) {
                this._type = value;
                this.dirtyPath = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Arc.prototype.updatePath = function () {
        if (!this.dirtyPath) {
            return;
        }
        var path = this.path;
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
        this.dirtyPath = false;
    };
    Arc.prototype.isPointInPath = function (x, y) {
        var point = this.transformPoint(x, y);
        var bbox = this.getBBox();
        return this.type !== ArcType.Open
            && bbox.containsPoint(point.x, point.y)
            && this.path.isPointInPath(point.x, point.y);
    };
    Arc.prototype.isPointInStroke = function (x, y) {
        return false;
    };
    Arc.prototype.render = function (ctx) {
        if (this.dirtyTransform) {
            this.computeTransformMatrix();
        }
        this.matrix.toContext(ctx);
        this.updatePath();
        this.scene.appendPath(this.path);
        this.fillStroke(ctx);
        this.dirty = false;
    };
    Arc.className = 'Arc';
    Arc.defaultStyles = object_1.chainObjects(shape_1.Shape.defaultStyles, {
        lineWidth: 1,
        fillStyle: null
    });
    return Arc;
}(shape_1.Shape));
exports.Arc = Arc;
