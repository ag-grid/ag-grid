// ag-grid-enterprise v20.0.0
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var HdpiCanvas = /** @class */ (function () {
    function HdpiCanvas(width, height) {
        if (width === void 0) { width = 300; }
        if (height === void 0) { height = 150; }
        this._canvas = document.createElement('canvas');
        this._pixelRatio = 1;
        this.updatePixelRatio(0, false);
        this.resize(width, height);
    }
    Object.defineProperty(HdpiCanvas.prototype, "canvas", {
        get: function () {
            return this._canvas;
        },
        enumerable: true,
        configurable: true
    });
    HdpiCanvas.prototype.destroy = function () {
        this._canvas.remove();
        this._canvas = undefined;
        Object.freeze(this);
    };
    Object.defineProperty(HdpiCanvas.prototype, "pixelRatio", {
        get: function () {
            return this._pixelRatio;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Updates the pixel ratio of the Canvas element with the given value,
     * or uses the window.devicePixelRatio (default), then resizes the Canvas
     * element accordingly (default).
     * @param ratio
     * @param resize
     */
    HdpiCanvas.prototype.updatePixelRatio = function (ratio, resize) {
        if (ratio === void 0) { ratio = 0; }
        if (resize === void 0) { resize = true; }
        var pixelRatio = ratio || window.devicePixelRatio;
        if (pixelRatio === this.pixelRatio) {
            return;
        }
        var canvas = this._canvas;
        var ctx = canvas.getContext('2d');
        var overrides = this.overrides = HdpiCanvas.makeHdpiOverrides(pixelRatio);
        for (var name_1 in overrides) {
            if (overrides.hasOwnProperty(name_1)) {
                // Save native methods under prefixed names,
                // if this hasn't been done by previous overrides already.
                if (!ctx['$' + name_1]) {
                    ctx['$' + name_1] = ctx[name_1];
                }
                // Replace native methods with overrides,
                // or previous overrides with the new ones.
                ctx[name_1] = overrides[name_1];
            }
        }
        if (resize) {
            var logicalWidth = canvas.width / this.pixelRatio;
            var logicalHeight = canvas.height / this.pixelRatio;
            canvas.width = Math.round(logicalWidth * pixelRatio);
            canvas.height = Math.round(logicalHeight * pixelRatio);
            canvas.style.width = Math.round(logicalWidth) + 'px';
            canvas.style.height = Math.round(logicalHeight) + 'px';
            ctx.resetTransform(); // should be called every time Canvas size changes
        }
        this._pixelRatio = pixelRatio;
    };
    HdpiCanvas.prototype.resize = function (width, height) {
        var canvas = this.canvas;
        canvas.width = Math.round(width * this.pixelRatio);
        canvas.height = Math.round(height * this.pixelRatio);
        canvas.style.width = Math.round(width) + 'px';
        canvas.style.height = Math.round(height) + 'px';
        canvas.getContext('2d').resetTransform();
    };
    HdpiCanvas.makeHdpiOverrides = function (pixelRatio) {
        var depth = 0;
        return {
            save: function () {
                this.$save();
                depth++;
            },
            restore: function () {
                if (depth > 0) {
                    this.$restore();
                    depth--;
                }
            },
            resetTransform: function () {
                // As of Jan 8, 2019, `resetTransform` is still an "experimental technology",
                // and doesn't work in IE11 and Edge 44.
                // this.$resetTransform();
                this.setTransform(1, 0, 0, 1, 0, 0);
                this.scale(pixelRatio, pixelRatio);
                this.save();
                depth = 0;
                // The scale above will be impossible to restore,
                // because we override the `ctx.restore` above and
                // check `depth` there.
            }
        };
    };
    return HdpiCanvas;
}());
exports.HdpiCanvas = HdpiCanvas;
