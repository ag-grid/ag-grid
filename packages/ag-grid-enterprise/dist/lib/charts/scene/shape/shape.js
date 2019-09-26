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
var node_1 = require("../node");
var object_1 = require("../../util/object");
var Shape = /** @class */ (function (_super) {
    __extends(Shape, _super);
    function Shape() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._fillOpacity = 1;
        _this._strokeOpacity = 1;
        _this._fill = Shape.defaultStyles.fill; //| CanvasGradient | CanvasPattern;
        /**
         * Note that `strokeStyle = null` means invisible stroke,
         * while `lineWidth = 0` means no stroke, and sometimes this can mean different things.
         * For example, a rect shape with an invisible stroke may not align to the pixel grid
         * properly because the stroke affects the rules of alignment, and arc shapes forming
         * a pie chart will have a gap between them if they have an invisible stroke, whereas
         * there would be not gap if there was no stroke at all.
         * The preferred way of making the stroke invisible is setting the `lineWidth` to zero,
         * unless specific looks that is achieved by having an invisible stroke is desired.
         */
        _this._stroke = Shape.defaultStyles.stroke;
        _this._strokeWidth = Shape.defaultStyles.strokeWidth;
        _this._lineDash = Shape.defaultStyles.lineDash;
        _this._lineDashOffset = Shape.defaultStyles.lineDashOffset;
        _this._lineCap = Shape.defaultStyles.lineCap;
        _this._lineJoin = Shape.defaultStyles.lineJoin;
        _this._opacity = Shape.defaultStyles.opacity;
        _this._fillShadow = Shape.defaultStyles.fillShadow;
        _this._strokeShadow = Shape.defaultStyles.strokeShadow;
        return _this;
    }
    /**
     * Restores the default styles introduced by this subclass.
     */
    Shape.prototype.restoreOwnStyles = function () {
        var styles = this.constructor.defaultStyles;
        var keys = Object.getOwnPropertyNames(styles);
        // getOwnPropertyNames is about 2.5 times faster than
        // for..in with the hasOwnProperty check and in this
        // case, where most properties are inherited, can be
        // more then an order of magnitude faster.
        for (var i = 0, n = keys.length; i < n; i++) {
            var key = keys[i];
            this[key] = styles[key];
        }
    };
    Shape.prototype.restoreAllStyles = function () {
        var styles = this.constructor.defaultStyles;
        for (var property in styles) {
            this[property] = styles[property];
        }
    };
    /**
     * Restores the base class default styles that have been overridden by this subclass.
     */
    Shape.prototype.restoreOverriddenStyles = function () {
        var styles = this.constructor.defaultStyles;
        var protoStyles = Object.getPrototypeOf(styles);
        for (var property in styles) {
            if (styles.hasOwnProperty(property) && protoStyles.hasOwnProperty(property)) {
                this[property] = styles[property];
            }
        }
    };
    Object.defineProperty(Shape.prototype, "fillOpacity", {
        get: function () {
            return this._fillOpacity;
        },
        set: function (value) {
            if (this._fillOpacity !== value) {
                this._fillOpacity = value;
                this.dirty = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Shape.prototype, "strokeOpacity", {
        get: function () {
            return this._strokeOpacity;
        },
        set: function (value) {
            if (this._strokeOpacity !== value) {
                this._strokeOpacity = value;
                this.dirty = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Shape.prototype, "fill", {
        get: function () {
            return this._fill;
        },
        set: function (value) {
            if (this._fill !== value) {
                this._fill = value;
                this.dirty = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Shape.prototype, "stroke", {
        get: function () {
            return this._stroke;
        },
        set: function (value) {
            if (this._stroke !== value) {
                this._stroke = value;
                this.dirty = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Shape.prototype, "strokeWidth", {
        get: function () {
            return this._strokeWidth;
        },
        set: function (value) {
            if (this._strokeWidth !== value) {
                this._strokeWidth = value;
                this.dirty = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Shape.prototype, "lineDash", {
        get: function () {
            return this._lineDash;
        },
        set: function (value) {
            var oldValue = this._lineDash;
            if (oldValue !== value) {
                if (oldValue && value && oldValue.length === value.length) {
                    var identical = true;
                    var n = value.length;
                    for (var i = 0; i < n; i++) {
                        if (oldValue[i] !== value[i]) {
                            identical = false;
                            break;
                        }
                    }
                    if (identical) {
                        return;
                    }
                }
                this._lineDash = value;
                this.dirty = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Shape.prototype, "lineDashOffset", {
        get: function () {
            return this._lineDashOffset;
        },
        set: function (value) {
            if (this._lineDashOffset !== value) {
                this._lineDashOffset = value;
                this.dirty = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Shape.prototype, "lineCap", {
        get: function () {
            return this._lineCap;
        },
        set: function (value) {
            if (this._lineCap !== value) {
                this._lineCap = value;
                this.dirty = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Shape.prototype, "lineJoin", {
        get: function () {
            return this._lineJoin;
        },
        set: function (value) {
            if (this._lineJoin !== value) {
                this._lineJoin = value;
                this.dirty = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Shape.prototype, "opacity", {
        get: function () {
            return this._opacity;
        },
        set: function (value) {
            value = Math.min(1, Math.max(0, value));
            if (this._opacity !== value) {
                this._opacity = value;
                this.dirty = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Shape.prototype, "fillShadow", {
        get: function () {
            return this._fillShadow;
        },
        set: function (value) {
            var _this = this;
            var fillShadow = this._fillShadow;
            if (fillShadow !== value) {
                if (fillShadow) {
                    fillShadow.onChange = undefined;
                }
                if (value) {
                    value.onChange = function () { return _this.dirty = true; };
                }
                this._fillShadow = value;
                this.dirty = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Shape.prototype, "strokeShadow", {
        get: function () {
            return this._strokeShadow;
        },
        set: function (value) {
            var _this = this;
            var strokeShadow = this._strokeShadow;
            if (strokeShadow !== value) {
                if (strokeShadow) {
                    strokeShadow.onChange = undefined;
                }
                if (value) {
                    value.onChange = function () { return _this.dirty = true; };
                }
                this._strokeShadow = value;
                this.dirty = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Shape.prototype.fillStroke = function (ctx) {
        if (!this.scene) {
            return;
        }
        var pixelRatio = this.scene.canvas.pixelRatio || 1;
        if (this.fill) {
            ctx.fillStyle = this.fill;
            ctx.globalAlpha = this.opacity * this.fillOpacity;
            // The canvas context scaling (depends on the device's pixel ratio)
            // has no effect on shadows, so we have to account for the pixel ratio
            // manually here.
            var fillShadow = this.fillShadow;
            if (fillShadow && fillShadow.enabled) {
                ctx.shadowColor = fillShadow.color;
                ctx.shadowOffsetX = fillShadow.xOffset * pixelRatio;
                ctx.shadowOffsetY = fillShadow.yOffset * pixelRatio;
                ctx.shadowBlur = fillShadow.blur * pixelRatio;
            }
            ctx.fill();
        }
        ctx.shadowColor = 'rgba(0, 0, 0, 0)';
        if (this.stroke && this.strokeWidth) {
            ctx.strokeStyle = this.stroke;
            ctx.globalAlpha = this.opacity * this.strokeOpacity;
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
            if (strokeShadow && strokeShadow.enabled) {
                ctx.shadowColor = strokeShadow.color;
                ctx.shadowOffsetX = strokeShadow.xOffset * pixelRatio;
                ctx.shadowOffsetY = strokeShadow.yOffset * pixelRatio;
                ctx.shadowBlur = strokeShadow.blur * pixelRatio;
            }
            ctx.stroke();
        }
    };
    Shape.prototype.isPointInNode = function (x, y) {
        return this.isPointInPath(x, y);
    };
    /**
     * Defaults for style properties. Note that properties that affect the position
     * and shape of the node are not considered style properties, for example:
     * `x`, `y`, `width`, `height`, `radius`, `rotation`, etc.
     * Can be used to reset to the original styling after some custom styling
     * has been applied (using the `restoreOwnStyles` and `restoreAllStyles` methods).
     * These static defaults are meant to be inherited by subclasses.
     */
    Shape.defaultStyles = object_1.chainObjects({}, {
        fill: 'black',
        stroke: undefined,
        strokeWidth: 0,
        lineDash: undefined,
        lineDashOffset: 0,
        lineCap: null,
        lineJoin: null,
        opacity: 1,
        fillShadow: undefined,
        strokeShadow: undefined
    });
    return Shape;
}(node_1.Node));
exports.Shape = Shape;
