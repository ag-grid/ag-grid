import { HdpiCanvas } from "../canvas/hdpiCanvas";
var Scene = /** @class */ (function () {
    function Scene(document) {
        var _this = this;
        if (document === void 0) { document = window.document; }
        this.id = this.createId();
        this._dirty = false;
        this.animationFrameId = 0;
        this._root = null;
        this._frameIndex = 0;
        this._renderFrameIndex = false;
        this.render = function () {
            var _a = _this, ctx = _a.ctx, root = _a.root;
            if (root && !root.visible) {
                _this.dirty = false;
                return;
            }
            // start with a blank canvas, clear previous drawing
            ctx.clearRect(0, 0, _this.width, _this.height);
            if (root) {
                ctx.save();
                if (root.visible) {
                    root.render(ctx);
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
        this.canvas = new HdpiCanvas(document);
        this.ctx = this.canvas.context;
    }
    Scene.prototype.createId = function () {
        return this.constructor.name + '-' + (Scene.id++);
    };
    Object.defineProperty(Scene.prototype, "parent", {
        get: function () {
            return this.canvas.parent;
        },
        set: function (value) {
            this.canvas.parent = value;
        },
        enumerable: true,
        configurable: true
    });
    Scene.prototype.download = function (fileName) {
        this.canvas.download(fileName);
    };
    Object.defineProperty(Scene.prototype, "width", {
        get: function () {
            return this.canvas.width;
        },
        set: function (value) {
            this.size = [value, this.height];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Scene.prototype, "height", {
        get: function () {
            return this.canvas.height;
        },
        set: function (value) {
            this.size = [this.width, value];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Scene.prototype, "size", {
        get: function () {
            return [this.width, this.height];
        },
        set: function (value) {
            var width = value[0], height = value[1];
            if (this.width !== width || this.height !== height) {
                this.canvas.resize(width, height);
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
                this.animationFrameId = requestAnimationFrame(this.render);
            }
            this._dirty = dirty;
        },
        enumerable: true,
        configurable: true
    });
    Scene.prototype.cancelRender = function () {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = 0;
            this._dirty = false;
        }
    };
    Object.defineProperty(Scene.prototype, "root", {
        get: function () {
            return this._root;
        },
        set: function (node) {
            if (node === this._root) {
                return;
            }
            if (this._root) {
                this._root._setScene(undefined);
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
export { Scene };
