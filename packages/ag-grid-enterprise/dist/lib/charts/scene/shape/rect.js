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
var shape_1 = require("./shape");
var path_1 = require("../path");
var object_1 = require("../../util/object");
var Rect = /** @class */ (function (_super) {
    __extends(Rect, _super);
    function Rect() {
        var _this = _super.call(this) || this;
        _this.path = new path_1.Path();
        _this._x = Rect.defaults.x;
        _this._y = Rect.defaults.y;
        _this._width = Rect.defaults.width;
        _this._height = Rect.defaults.height;
        _this._radius = Rect.defaults.radius;
        // Override the base class defaults.
        _this.fillStyle = Rect.defaults.fillStyle;
        _this.strokeStyle = Rect.defaults.strokeStyle;
        return _this;
        // Alternatively we can do:
        // this.restoreOverriddenDefaults();
        // This call can even happen in the base class constructor,
        // so that we don't worry about forgetting calling it in subclasses.
        // This will figure out the properties (above) to apply
        // automatically, but makes construction more expensive.
        // TODO: measure the performance impact.
    }
    Object.defineProperty(Rect.prototype, "x", {
        get: function () {
            return this._x;
        },
        set: function (value) {
            this._x = value;
            this.dirty = true;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Rect.prototype, "y", {
        get: function () {
            return this._y;
        },
        set: function (value) {
            this._y = value;
            this.dirty = true;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Rect.prototype, "width", {
        get: function () {
            return this._width;
        },
        set: function (value) {
            this._width = value;
            this.dirty = true;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Rect.prototype, "height", {
        get: function () {
            return this._height;
        },
        set: function (value) {
            this._height = value;
            this.dirty = true;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Rect.prototype, "radius", {
        get: function () {
            return this._radius;
        },
        set: function (value) {
            this._radius = value;
            this.dirty = true;
        },
        enumerable: true,
        configurable: true
    });
    Rect.prototype.updatePath = function () {
        var path = this.path;
        var radius = this.radius;
        path.clear();
        if (!radius) {
            path.rect(this.x, this.y, this.width, this.height);
        }
        else {
            // TODO: rect radius, this will require implementing
            //       another `arcTo` method in the `Path` class.
            throw "TODO";
        }
    };
    Rect.prototype.isPointInPath = function (ctx, x, y) {
        return false;
    };
    Rect.prototype.isPointInStroke = function (ctx, x, y) {
        return false;
    };
    Rect.prototype.render = function (ctx) {
        if (this.scene) {
            this.updatePath();
            this.applyContextAttributes(ctx);
            this.scene.appendPath(this.path);
            ctx.fill();
            ctx.stroke();
        }
        this.dirty = false;
    };
    Rect.defaults = object_1.chainObjects(shape_1.Shape.defaults, {
        fillStyle: 'red',
        strokeStyle: 'black',
        x: 0,
        y: 0,
        width: 10,
        height: 10,
        radius: 0
    });
    return Rect;
}(shape_1.Shape));
exports.Rect = Rect;
