// ag-grid-enterprise v20.0.0
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
// TODO: Should we call this class `Path`?
// `Text` sprite will also have basic attributes like `fillStyle`, `strokeStyle`
// and `opacity`, but the `Shape` isn't a proper base class for `Text`.
// Move the `render` method here and make `Rect` and `Arc` only supply the
// `updatePath` method.
var Shape = /** @class */ (function (_super) {
    __extends(Shape, _super);
    function Shape() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._fillStyle = Shape.defaults.fillStyle; //| CanvasGradient | CanvasPattern;
        _this._strokeStyle = Shape.defaults.strokeStyle;
        _this._lineWidth = Shape.defaults.lineWidth;
        _this._opacity = Shape.defaults.opacity;
        return _this;
    }
    /**
     * Restores the defaults introduced by this subclass.
     */
    Shape.prototype.restoreOwnDefaults = function () {
        var defaults = this.constructor.defaults;
        for (var property in defaults) {
            if (defaults.hasOwnProperty(property)) {
                this[property] = defaults[property];
            }
        }
    };
    Shape.prototype.restoreAllDefaults = function () {
        var defaults = this.constructor.defaults;
        for (var property in defaults) {
            this[property] = defaults[property];
        }
    };
    /**
     * Restores the base class defaults that have been overridden by this subclass.
     */
    Shape.prototype.restoreOverriddenDefaults = function () {
        var defaults = this.constructor.defaults;
        var protoDefaults = Object.getPrototypeOf(defaults);
        for (var property in defaults) {
            if (defaults.hasOwnProperty(property) && protoDefaults.hasOwnProperty(property)) {
                this[property] = defaults[property];
            }
        }
    };
    Object.defineProperty(Shape.prototype, "fillStyle", {
        get: function () {
            return this._fillStyle;
        },
        set: function (value) {
            this._fillStyle = value;
            this.dirty = true;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Shape.prototype, "strokeStyle", {
        get: function () {
            return this._strokeStyle;
        },
        set: function (value) {
            this._strokeStyle = value;
            this.dirty = true;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Shape.prototype, "lineWidth", {
        get: function () {
            return this._lineWidth;
        },
        set: function (value) {
            this._lineWidth = value;
            this.dirty = true;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Shape.prototype, "opacity", {
        get: function () {
            return this._opacity;
        },
        set: function (value) {
            this._opacity = value;
            this.dirty = true;
        },
        enumerable: true,
        configurable: true
    });
    Shape.prototype.applyContextAttributes = function (ctx) {
        ctx.fillStyle = this.fillStyle;
        ctx.strokeStyle = this.strokeStyle;
        ctx.lineWidth = this.lineWidth;
        ctx.globalAlpha = this.opacity;
    };
    /**
     * Defaults for certain properties.
     * Can be used to reset to the original styling after some custom styling
     * has been applied (using the `restoreOwnDefaults` and `restoreAllDefaults` methods).
     * These static defaults are meant to be inherited by subclasses.
     */
    Shape.defaults = object_1.chainObjects({}, {
        fillStyle: 'none',
        strokeStyle: 'none',
        lineWidth: 1,
        opacity: 1
    });
    return Shape;
}(node_1.Node));
exports.Shape = Shape;
