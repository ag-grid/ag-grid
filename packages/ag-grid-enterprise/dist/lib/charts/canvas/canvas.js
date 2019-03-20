// ag-grid-enterprise v20.2.0
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// This is the property we set on an HTMLCanvasElement to let us know we've applied
// the resolution independent overrides to it, and what its current DPR is.
var DevicePixelRatioKey = '__DevicePixelRatio';
// TODO: use Symbol() here in the future to truly hide this property.
function makeHdpiOverrides(dpr) {
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
            this.$resetTransform();
            this.scale(dpr, dpr);
            this.save();
            depth = 0;
            // The scale above will be impossible to restore,
            // because we override the `ctx.restore` above and
            // check `depth` there.
        }
    };
}
/**
 * Creates an HTMLCanvasElement element with HDPI overrides applied.
 * The `width` and `height` parameters are optional and default to
 * the values defined in the W3C Recommendation:
 * https://www.w3.org/TR/html52/semantics-scripting.html#the-canvas-element
 * @param width
 * @param height
 */
function createHdpiCanvas(width, height) {
    if (width === void 0) { width = 300; }
    if (height === void 0) { height = 150; }
    var canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    applyHdpiOverrides(canvas);
    return canvas;
}
exports.createHdpiCanvas = createHdpiCanvas;
function applyHdpiOverrides(canvas) {
    var canvasDpr = canvas[DevicePixelRatioKey];
    var dpr = window.devicePixelRatio;
    // if overrides haven't been applied and actually needed
    if (!canvasDpr && dpr !== 1) {
        var overrides = makeHdpiOverrides(dpr);
        var ctx = canvas.getContext('2d');
        var ctxObj = ctx;
        for (var name_1 in overrides) {
            // Save native methods under prefixed names.
            ctxObj['$' + name_1] = ctxObj[name_1];
            // Pretend our overrides are native methods.
            ctxObj[name_1] = overrides[name_1];
        }
        canvas[DevicePixelRatioKey] = dpr;
        var logicalWidth = canvas.width;
        var logicalHeight = canvas.height;
        canvas.width = Math.round(logicalWidth * dpr);
        canvas.height = Math.round(logicalHeight * dpr);
        canvas.style.width = Math.round(logicalWidth) + 'px';
        canvas.style.height = Math.round(logicalHeight) + 'px';
        ctx.resetTransform(); // should be called every time the size changes
        return dpr;
    }
    return 0;
}
exports.applyHdpiOverrides = applyHdpiOverrides;
/**
 * Resizes the given Canvas element, taking HDPI overrides (if any) into account.
 * @param canvas
 * @param width
 * @param height
 */
function resizeCanvas(canvas, width, height) {
    var canvasDpr = canvas[DevicePixelRatioKey] || 1;
    canvas.width = Math.round(width * canvasDpr);
    canvas.height = Math.round(height * canvasDpr);
    canvas.style.width = Math.round(width) + 'px';
    canvas.style.height = Math.round(height) + 'px';
    canvas.getContext('2d').resetTransform();
}
exports.resizeCanvas = resizeCanvas;
/**
 * Returns the position offset to apply to align vertical and horizontal
 * lines to the pixel grid for crisp look.
 * @param value Typically line width is assumed. Fractional values won't be aligned.
 * @param bias If alignment is necessary, which side to prefer.
 */
function pixelSnap(value, bias) {
    if (bias === void 0) { bias = PixelSnapBias.Positive; }
    // If not a fractional value ...
    return value % 1 === 0 ? bias * value % 2 / 2 : value;
}
exports.pixelSnap = pixelSnap;
var PixelSnapBias;
(function (PixelSnapBias) {
    PixelSnapBias[PixelSnapBias["Negative"] = -1] = "Negative";
    PixelSnapBias[PixelSnapBias["Positive"] = 1] = "Positive";
})(PixelSnapBias = exports.PixelSnapBias || (exports.PixelSnapBias = {}));
