// ag-grid-enterprise v20.0.0
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var hdpiCanvas_1 = require("../canvas/hdpiCanvas");
var shape_1 = require("./shape/shape");
var Scene = /** @class */ (function () {
    function Scene(parent, width, height) {
        if (width === void 0) { width = 800; }
        if (height === void 0) { height = 600; }
        var _this = this;
        this.onMouseMove = function (e) {
            var pixelRatio = _this.hdpiCanvas.pixelRatio;
            var x = e.offsetX * pixelRatio;
            var y = e.offsetY * pixelRatio;
            var node = _this.root;
            if (node) {
                var children = node.children;
                var n = children.length;
                for (var i = 0; i < n; i++) {
                    var child = children[i];
                    if (child instanceof shape_1.Shape) {
                        if (child.isPointInPath(_this.ctx, x, y)) {
                            child.fillStyle = 'yellow';
                        }
                        else {
                            child.fillStyle = 'red';
                        }
                        if (child.isPointInStroke(_this.ctx, x, y)) {
                            child.strokeStyle = 'lime';
                        }
                        else {
                            child.strokeStyle = 'black';
                        }
                    }
                }
            }
        };
        this._dirty = false;
        this.render = function () {
            _this.ctx.clearRect(0, 0, _this.width, _this.height);
            if (_this.root) {
                _this.root.render(_this.ctx);
            }
            _this.dirty = false;
        };
        this.hdpiCanvas = new hdpiCanvas_1.HdpiCanvas(this._width = width, this._height = height);
        var canvas = this.hdpiCanvas.canvas;
        this.ctx = canvas.getContext('2d');
        parent.appendChild(canvas);
        this.setupListeners(canvas);
    }
    Scene.prototype.setupListeners = function (canvas) {
        canvas.addEventListener('mousemove', this.onMouseMove);
    };
    Object.defineProperty(Scene.prototype, "width", {
        get: function () {
            return this._width;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Scene.prototype, "height", {
        get: function () {
            return this._height;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Scene.prototype, "size", {
        set: function (value) {
            var _a;
            (_a = this.hdpiCanvas).resize.apply(_a, value);
            this._width = value[0], this._height = value[1];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Scene.prototype, "dirty", {
        get: function () {
            return this._dirty;
        },
        set: function (dirty) {
            if (dirty && !this._dirty) {
                requestAnimationFrame(this.render);
            }
            this._dirty = dirty;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Scene.prototype, "root", {
        get: function () {
            return this._root;
        },
        set: function (node) {
            this._root = node;
            if (node) {
                node.scene = this;
            }
            this.dirty = true;
        },
        enumerable: true,
        configurable: true
    });
    Scene.prototype.appendPath = function (path) {
        var ctx = this.ctx;
        var commands = path.commands;
        var params = path.params;
        var n = commands.length;
        var j = 0;
        ctx.beginPath();
        for (var i = 0; i < n; i++) {
            switch (commands[i]) {
                case 'M':
                    ctx.moveTo(params[j++], params[j++]);
                    break;
                case 'L':
                    ctx.lineTo(params[j++], params[j++]);
                    break;
                case 'C':
                    ctx.bezierCurveTo(params[j++], params[j++], params[j++], params[j++], params[j++], params[j++]);
                    break;
                case 'Z':
                    ctx.closePath();
                    break;
            }
        }
    };
    return Scene;
}());
exports.Scene = Scene;
