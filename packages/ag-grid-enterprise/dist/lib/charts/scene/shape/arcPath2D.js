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
var number_1 = require("../../util/number");
var angle_1 = require("../../util/angle");
var ArcType;
(function (ArcType) {
    ArcType[ArcType["Open"] = 0] = "Open";
    ArcType[ArcType["Chord"] = 1] = "Chord";
    ArcType[ArcType["Round"] = 2] = "Round";
})(ArcType = exports.ArcType || (exports.ArcType = {}));
/**
 * Circular arc node that uses the experimental `Path2D` class to define
 * the arc path for further rendering and hit-testing.
 */
var Arc = /** @class */ (function (_super) {
    __extends(Arc, _super);
    function Arc() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        // Declare a path to feed to `context.fill/stroke` using experimental native Path2D class.
        // Doesn't work in IE.
        _this.path = new Path2D();
        /**
         * It's not always that the path has to be updated.
         * For example, if transform attributes (such as `translationX`)
         * are changed, we don't have to update the path. The `dirtyFlag`
         * is how we keep track if the path has to be updated or not.
         */
        _this._dirtyPath = true;
        _this._x = 0;
        _this._y = 0;
        _this._radius = 10;
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
        return _this;
    }
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
    Object.defineProperty(Arc.prototype, "x", {
        get: function () {
            return this._x;
        },
        set: function (value) {
            if (this._x !== value) {
                this._x = value;
                this.dirtyPath = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Arc.prototype, "y", {
        get: function () {
            return this._y;
        },
        set: function (value) {
            if (this._y !== value) {
                this._y = value;
                this.dirtyPath = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Arc.prototype, "radius", {
        get: function () {
            return this._radius;
        },
        set: function (value) {
            if (this._radius !== value) {
                this._radius = value;
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
        // No way to clear existing Path2D, have to create a new one each time.
        var path = this.path = new Path2D();
        path.arc(this.x, this.y, this.radius, this.startAngle, this.endAngle, this.counterClockwise);
        if (this.type === ArcType.Chord) {
            path.closePath();
        }
        else if (this.type === ArcType.Round && !this.fullPie) {
            path.lineTo(this.x, this.y);
            path.closePath();
        }
        this.dirtyPath = false;
    };
    // Native Path2D's isPointInPath/isPointInStroke require multiplying by the pixelRatio:
    // const x = mouseEvent.offsetX * pixelRatio;
    // const y = mouseEvent.offsetY * pixelRatio;
    Arc.prototype.isPointInPath = function (x, y) {
        return false; //ctx.isPointInPath(this.path, x, y);
    };
    Arc.prototype.isPointInStroke = function (x, y) {
        return false; //ctx.isPointInStroke(this.path, x, y);
    };
    Arc.prototype.render = function (ctx) {
        if (!this.scene) {
            return;
        }
        if (this.dirtyTransform) {
            this.computeTransformMatrix();
        }
        this.matrix.toContext(ctx);
        this.updatePath();
        if (this.opacity < 1) {
            ctx.globalAlpha = this.opacity;
        }
        var pixelRatio = this.scene.canvas.pixelRatio || 1;
        if (this.fill) {
            ctx.fillStyle = this.fill;
            // The canvas context scaling (depends on the device's pixel ratio)
            // has no effect on shadows, so we have to account for the pixel ratio
            // manually here.
            var fillShadow = this.fillShadow;
            if (fillShadow) {
                ctx.shadowColor = fillShadow.color;
                ctx.shadowOffsetX = fillShadow.xOffset * pixelRatio;
                ctx.shadowOffsetY = fillShadow.yOffset * pixelRatio;
                ctx.shadowBlur = fillShadow.blur * pixelRatio;
            }
            ctx.fill(this.path);
        }
        ctx.shadowColor = 'rgba(0, 0, 0, 0)';
        if (this.stroke && this.strokeWidth) {
            ctx.strokeStyle = this.stroke;
            ctx.lineWidth = this.strokeWidth;
            if (this.lineDash) {
                ctx.setLineDash(this.lineDash);
            }
            if (this.lineDashOffset) {
                ctx.lineDashOffset = this.lineDashOffset;
            }
            if (this.lineCap) {
                ctx.lineCap = this.lineCap;
            }
            if (this.lineJoin) {
                ctx.lineJoin = this.lineJoin;
            }
            var strokeShadow = this.strokeShadow;
            if (strokeShadow) {
                ctx.shadowColor = strokeShadow.color;
                ctx.shadowOffsetX = strokeShadow.xOffset * pixelRatio;
                ctx.shadowOffsetY = strokeShadow.yOffset * pixelRatio;
                ctx.shadowBlur = strokeShadow.blur * pixelRatio;
            }
            ctx.stroke(this.path);
        }
        // About 15% performance loss for re-creating and retaining a Path2D
        // object for hit testing.
        this.dirty = false;
    };
    Arc.className = 'Arc';
    return Arc;
}(shape_1.Shape));
exports.Arc = Arc;
