// ag-grid-enterprise v20.2.0
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Wraps the native Canvas element and overrides its CanvasRenderingContext2D to
 * provide resolution independent rendering based on `window.devicePixelRatio`.
 */
var HdpiCanvas = /** @class */ (function () {
    // The width/height attributes of the Canvas element default to
    // 300/150 according to w3.org.
    function HdpiCanvas(width, height) {
        if (width === void 0) { width = 300; }
        if (height === void 0) { height = 150; }
        this._parent = null;
        this.canvas = document.createElement('canvas');
        this.context = this.canvas.getContext('2d');
        // `NaN` is deliberate here, so that overrides are always applied
        // and the `resetTransform` inside the `resize` method works in IE11.
        this._pixelRatio = NaN;
        this.updatePixelRatio(0, false);
        this.resize(width, height);
    }
    Object.defineProperty(HdpiCanvas.prototype, "parent", {
        get: function () {
            return this._parent;
        },
        set: function (value) {
            if (this._parent !== value) {
                this.remove();
                if (value) {
                    value.appendChild(this.canvas);
                }
                this._parent = value;
            }
        },
        enumerable: true,
        configurable: true
    });
    HdpiCanvas.prototype.remove = function () {
        var parent = this.canvas.parentNode;
        if (parent !== null) {
            parent.removeChild(this.canvas);
        }
    };
    HdpiCanvas.prototype.destroy = function () {
        this.canvas.remove();
        this._canvas = undefined;
        Object.freeze(this);
    };
    HdpiCanvas.prototype.toImage = function () {
        var img = document.createElement('img');
        img.src = this.canvas.toDataURL();
        return img;
    };
    /**
     * @param fileName The `.png` extension is going to be added automatically.
     */
    HdpiCanvas.prototype.download = function (fileName) {
        // Chart images saved as JPEG are a few times larger at 50% quality than PNG images,
        // so we don't support saving to JPEG.
        var type = 'image/png';
        // The background of our canvas is transparent, so we create a temporary canvas
        // with the white background and paint our canvas on top of it.
        var canvas = document.createElement('canvas');
        canvas.width = this.canvas.width;
        canvas.height = this.canvas.height;
        var ctx = canvas.getContext('2d');
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(this.canvas, 0, 0);
        var dataUrl = canvas.toDataURL(type);
        if (navigator.msSaveOrOpenBlob) { // IE11
            var binary = atob(dataUrl.split(',')[1]); // strip the `data:image/png;base64,` part
            var array = [];
            for (var i = 0, n = binary.length; i < n; i++) {
                array.push(binary.charCodeAt(i));
            }
            var blob = new Blob([new Uint8Array(array)], { type: type });
            navigator.msSaveOrOpenBlob(blob, fileName + '.png');
        }
        else {
            var a = document.createElement('a');
            a.href = dataUrl;
            a.download = fileName + '.png';
            a.style.display = 'none';
            document.body.appendChild(a); // required for the `click` to work in Firefox
            a.click();
            document.body.removeChild(a);
        }
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
        var canvas = this.canvas;
        var ctx = this.context;
        var overrides = this.overrides = HdpiCanvas.makeHdpiOverrides(pixelRatio);
        for (var name_1 in overrides) {
            if (overrides.hasOwnProperty(name_1)) {
                // Save native methods under prefixed names,
                // if this hasn't been done by the previous overrides already.
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
        this.context.resetTransform();
    };
    Object.defineProperty(HdpiCanvas, "svgText", {
        get: function () {
            if (HdpiCanvas._svgText) {
                return HdpiCanvas._svgText;
            }
            var xmlns = 'http://www.w3.org/2000/svg';
            var svg = document.createElementNS(xmlns, 'svg');
            svg.setAttribute('width', '100');
            svg.setAttribute('height', '100');
            svg.style.position = 'absolute';
            svg.style.top = '-1000px';
            svg.style.visibility = 'hidden';
            var svgText = document.createElementNS(xmlns, 'text');
            svgText.setAttribute('x', '0');
            svgText.setAttribute('y', '30');
            svgText.setAttribute('text', 'black');
            svg.appendChild(svgText);
            document.body.appendChild(svg);
            HdpiCanvas._svgText = svgText;
            return svgText;
        },
        enumerable: true,
        configurable: true
    });
    ;
    HdpiCanvas.measureText = function (text, font, textBaseline, textAlign) {
        var ctx = HdpiCanvas.textContext;
        ctx.font = font;
        ctx.textBaseline = textBaseline;
        ctx.textAlign = textAlign;
        return ctx.measureText(text);
    };
    /**
     * Returns the width and height of the measured text.
     * @param text The single-line text to measure.
     * @param font The font shorthand string.
     */
    HdpiCanvas.getTextSize = function (text, font) {
        if (HdpiCanvas.supports.textMetrics) {
            HdpiCanvas.textContext.font = font;
            var metrics = HdpiCanvas.textContext.measureText(text);
            return {
                width: metrics.width,
                height: metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent
            };
        }
        else {
            return HdpiCanvas.measureSvgText(text, font);
        }
    };
    HdpiCanvas.measureSvgText = function (text, font) {
        var cache = HdpiCanvas.textSizeCache;
        var fontCache = cache[font];
        // Note: consider not caching the size of numeric strings.
        // For example: if (isNaN(+text)) { // skip
        if (fontCache) {
            var size_1 = fontCache[text];
            if (size_1) {
                return size_1;
            }
        }
        else {
            cache[font] = {};
        }
        var svgText = HdpiCanvas.svgText;
        svgText.style.font = font;
        svgText.textContent = text;
        // `getBBox` returns an instance of `SVGRect` with the same `width` and `height`
        // measurements as `DOMRect` instance returned by the `getBoundingClientRect`.
        // But the `SVGRect` instance has half the properties of the `DOMRect`,
        // so we use the `getBBox` method.
        var bbox = svgText.getBBox();
        var size = {
            width: bbox.width,
            height: bbox.height
        };
        cache[font][text] = size;
        return size;
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
    // 2D canvas context for measuring text.
    HdpiCanvas.textContext = (function () {
        var canvas = document.createElement('canvas');
        return canvas.getContext('2d');
    })();
    HdpiCanvas.supports = Object.freeze({
        textMetrics: HdpiCanvas.textContext.measureText('test')
            .actualBoundingBoxDescent !== undefined,
        getTransform: HdpiCanvas.textContext.getTransform !== undefined
    });
    HdpiCanvas.textSizeCache = {};
    return HdpiCanvas;
}());
exports.HdpiCanvas = HdpiCanvas;
