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
var node_1 = require("./node");
var path2D_1 = require("./path2D");
/**
 * Acts as `Group` node but with specified bounds that form a rectangle.
 * Any parts of the child nodes outside that rectangle will not be visible.
 * Unlike the `Group` node, the `ClipRect` node cannot be transformed.
 */
var ClipRect = /** @class */ (function (_super) {
    __extends(ClipRect, _super);
    function ClipRect() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.isContainerNode = true;
        _this.path = new path2D_1.Path2D();
        _this._active = true;
        _this._dirtyPath = true;
        _this._x = 0;
        _this._y = 0;
        _this._width = 10;
        _this._height = 10;
        return _this;
    }
    ClipRect.prototype.isPointInNode = function (x, y) {
        var point = this.transformPoint(x, y);
        return point.x >= this.x && point.x <= this.x + this.width
            && point.y >= this.y && point.y <= this.y + this.height;
    };
    Object.defineProperty(ClipRect.prototype, "active", {
        get: function () {
            return this._active;
        },
        set: function (value) {
            if (this._active !== value) {
                this._active = value;
                this.dirty = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ClipRect.prototype, "dirtyPath", {
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
    Object.defineProperty(ClipRect.prototype, "x", {
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
    Object.defineProperty(ClipRect.prototype, "y", {
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
    Object.defineProperty(ClipRect.prototype, "width", {
        get: function () {
            return this._width;
        },
        set: function (value) {
            if (this._width !== value) {
                this._width = value;
                this.dirtyPath = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ClipRect.prototype, "height", {
        get: function () {
            return this._height;
        },
        set: function (value) {
            if (this._height !== value) {
                this._height = value;
                this.dirtyPath = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    ClipRect.prototype.updatePath = function () {
        var path = this.path;
        path.clear();
        path.rect(this.x, this.y, this.width, this.height);
        this.dirtyPath = false;
    };
    ClipRect.prototype.render = function (ctx) {
        if (this.active) {
            if (this.dirtyPath) {
                this.updatePath();
            }
            this.scene.appendPath(this.path);
            ctx.clip();
        }
        var children = this.children;
        var n = children.length;
        for (var i = 0; i < n; i++) {
            ctx.save();
            var child = children[i];
            if (child.visible) {
                child.render(ctx);
            }
            ctx.restore();
        }
    };
    ClipRect.className = 'ClipRect';
    return ClipRect;
}(node_1.Node));
exports.ClipRect = ClipRect;
