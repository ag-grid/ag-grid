// ag-grid-enterprise v21.2.2
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Wraps the native Canvas element and overrides its CanvasRenderingContext2D to
 * provide resolution independent rendering based on `window.devicePixelRatio`.
 */
var HdpiCanvas = /** @class */ (function () {
    // The width/height attributes of the Canvas element default to
    // 300/150 according to w3.org.
    function HdpiCanvas(options) {
        if (options === void 0) { options = {}; }
        this._parent = undefined;
        // `NaN` is deliberate here, so that overrides are always applied
        // and the `resetTransform` inside the `resize` method works in IE11.
        this._pixelRatio = NaN;
        this.document = options.document || window.document;
        this.tempCanvas = this.document.createElement('canvas');
        this.element = this.document.createElement('canvas');
        this.element.style.userSelect = 'none';
        this.context = this.element.getContext('2d');
        this.updatePixelRatio(0, false);
        this.resize(this._width = options.width || 300, this._height = options.height || 150);
    }
    Object.defineProperty(HdpiCanvas.prototype, "parent", {
        get: function () {
            return this._parent;
        },
        set: function (value) {
            if (this._parent !== value) {
                this.remove();
                if (value) {
                    value.appendChild(this.element);
                }
                this._parent = value;
            }
        },
        enumerable: true,
        configurable: true
    });
    HdpiCanvas.prototype.remove = function () {
        var parent = this.element.parentNode;
        if (parent !== null) {
            parent.removeChild(this.element);
        }
    };
    HdpiCanvas.prototype.destroy = function () {
        this.element.remove();
        this._canvas = undefined;
        Object.freeze(this);
    };
    HdpiCanvas.prototype.toImage = function () {
        var img = this.document.createElement('img');
        img.src = this.element.toDataURL();
        return img;
    };
    /**
     * @param options.fileName The `.png` extension is going to be added automatically.
     * @param [options.background] Defaults to `white`.
     */
    HdpiCanvas.prototype.download = function (fileName) {
        fileName = ((fileName || '').trim() || 'image') + '.png';
        // Chart images saved as JPEG are a few times larger at 50% quality than PNG images,
        // so we don't support saving to JPEG.
        var type = 'image/png';
        var dataUrl = this.element.toDataURL(type);
        var document = this.document;
        if (navigator.msSaveOrOpenBlob) { // IE11
            var binary = atob(dataUrl.split(',')[1]); // strip the `data:image/png;base64,` part
            var array = [];
            for (var i = 0, n = binary.length; i < n; i++) {
                array.push(binary.charCodeAt(i));
            }
            var blob = new Blob([new Uint8Array(array)], { type: type });
            navigator.msSaveOrOpenBlob(blob, fileName);
        }
        else {
            var a = document.createElement('a');
            a.href = dataUrl;
            a.download = fileName;
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
        var canvas = this.element;
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
    Object.defineProperty(HdpiCanvas.prototype, "width", {
        get: function () {
            return this._width;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(HdpiCanvas.prototype, "height", {
        get: function () {
            return this._height;
        },
        enumerable: true,
        configurable: true
    });
    HdpiCanvas.prototype.resize = function (width, height) {
        var canvas = this.element;
        var context = this.context;
        var tempCanvas = this.tempCanvas;
        this._width = width;
        this._height = height;
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        var tempContext = tempCanvas.getContext('2d');
        tempContext.drawImage(context.canvas, 0, 0);
        canvas.width = Math.round(width * this.pixelRatio);
        canvas.height = Math.round(height * this.pixelRatio);
        canvas.style.width = Math.round(width) + 'px';
        canvas.style.height = Math.round(height) + 'px';
        context.drawImage(tempContext.canvas, 0, 0);
        context.resetTransform();
    };
    Object.defineProperty(HdpiCanvas.prototype, "textMeasuringContext", {
        get: function () {
            if (this._textMeasuringContext) {
                return this._textMeasuringContext;
            }
            var canvas = document.createElement('canvas');
            return this._textMeasuringContext = canvas.getContext('2d');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(HdpiCanvas.prototype, "svgText", {
        get: function () {
            if (this._svgText) {
                return this._svgText;
            }
            var xmlns = 'http://www.w3.org/2000/svg';
            var svg = document.createElementNS(xmlns, 'svg');
            svg.setAttribute('width', '100');
            svg.setAttribute('height', '100');
            // Add a descriptive class name in case someone sees this SVG element
            // in devtools and wonders about its purpose:
            if (svg.classList) {
                svg.classList.add('text-measuring-svg');
            }
            else {
                svg.setAttribute('class', 'text-measuring-svg');
            }
            svg.style.position = 'absolute';
            svg.style.top = '-1000px';
            svg.style.visibility = 'hidden';
            var svgText = document.createElementNS(xmlns, 'text');
            svgText.setAttribute('x', '0');
            svgText.setAttribute('y', '30');
            svgText.setAttribute('text', 'black');
            svg.appendChild(svgText);
            document.body.appendChild(svg);
            this._svgText = svgText;
            return svgText;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(HdpiCanvas.prototype, "has", {
        get: function () {
            if (this._has) {
                return this._has;
            }
            return this._has = Object.freeze({
                textMetrics: this.textMeasuringContext.measureText('test')
                    .actualBoundingBoxDescent !== undefined,
                getTransform: this.textMeasuringContext.getTransform !== undefined,
                flicker: !!window.safari
            });
        },
        enumerable: true,
        configurable: true
    });
    HdpiCanvas.prototype.measureText = function (text, font, textBaseline, textAlign) {
        var ctx = this.textMeasuringContext;
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
    HdpiCanvas.prototype.getTextSize = function (text, font) {
        if (this.has.textMetrics) {
            var ctx = this.textMeasuringContext;
            ctx.font = font;
            var metrics = ctx.measureText(text);
            return {
                width: metrics.width,
                height: metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent
            };
        }
        else {
            return this.measureSvgText(text, font);
        }
    };
    HdpiCanvas.prototype.measureSvgText = function (text, font) {
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
        var svgText = this.svgText;
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
            setTransform: function (a, b, c, d, e, f) {
                this.$setTransform(a * pixelRatio, b * pixelRatio, c * pixelRatio, d * pixelRatio, e * pixelRatio, f * pixelRatio);
            },
            resetTransform: function () {
                // As of Jan 8, 2019, `resetTransform` is still an "experimental technology",
                // and doesn't work in IE11 and Edge 44.
                this.$setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
                this.save();
                depth = 0;
                // The scale above will be impossible to restore,
                // because we override the `ctx.restore` above and
                // check `depth` there.
            }
        };
    };
    HdpiCanvas.textSizeCache = {};
    return HdpiCanvas;
}());
exports.HdpiCanvas = HdpiCanvas;
