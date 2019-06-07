// ag-grid-enterprise v21.0.1
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var hdpiCanvas_1 = require("../canvas/hdpiCanvas");
var Scene = /** @class */ (function () {
    function Scene(width, height) {
        var _this = this;
        if (width === void 0) { width = 800; }
        if (height === void 0) { height = 600; }
        this.id = this.createId();
        this._dirty = false;
        this._root = null;
        this._frameIndex = 0;
        this._renderFrameIndex = false;
        this.render = function () {
            var ctx = _this.ctx;
            // start with a blank canvas, clear previous drawing
            ctx.clearRect(0, 0, _this.width, _this.height);
            if (_this.root) {
                ctx.save();
                if (_this.root.visible) {
                    _this.root.render(ctx);
                }
                ctx.restore();
            }
            _this._frameIndex++;
            if (_this.renderFrameIndex) {
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, 40, 15);
                ctx.fillStyle = 'black';
                ctx.fillText(_this.frameIndex.toString(), 0, 10);
            }
            _this.dirty = false;
        };
        this.hdpiCanvas = new hdpiCanvas_1.HdpiCanvas(this._width = width, this._height = height);
        this.ctx = this.hdpiCanvas.context;
    }
    Scene.prototype.createId = function () {
        return this.constructor.name + '-' + (Scene.id++);
    };
    ;
    Object.defineProperty(Scene.prototype, "parent", {
        get: function () {
            return this.hdpiCanvas.parent;
        },
        set: function (value) {
            this.hdpiCanvas.parent = value;
        },
        enumerable: true,
        configurable: true
    });
    Scene.prototype.download = function (options) {
        this.hdpiCanvas.download(options);
    };
    Object.defineProperty(Scene.prototype, "width", {
        get: function () {
            return this._width;
        },
        set: function (value) {
            this.size = [value, this._height];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Scene.prototype, "height", {
        get: function () {
            return this._height;
        },
        set: function (value) {
            this.size = [this._width, value];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Scene.prototype, "size", {
        set: function (value) {
            if (this._width !== value[0] || this._height !== value[1]) {
                this.hdpiCanvas.resize(value[0], value[1]);
                this._width = value[0], this._height = value[1];
                this.dirty = true;
            }
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
            if (node === this._root) {
                return;
            }
            if (this._root) {
                this._root._setScene(null);
            }
            this._root = node;
            if (node) {
                // If `node` is the root node of another scene ...
                if (node.parent === null && node.scene && node.scene !== this) {
                    node.scene.root = null;
                }
                node._setScene(this);
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
    Object.defineProperty(Scene.prototype, "frameIndex", {
        get: function () {
            return this._frameIndex;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Scene.prototype, "renderFrameIndex", {
        get: function () {
            return this._renderFrameIndex;
        },
        set: function (value) {
            if (this._renderFrameIndex !== value) {
                this._renderFrameIndex = value;
                this.dirty = true;
            }
        },
        enumerable: true,
        configurable: true
    });
    Scene.id = 1;
    return Scene;
}());
exports.Scene = Scene;
