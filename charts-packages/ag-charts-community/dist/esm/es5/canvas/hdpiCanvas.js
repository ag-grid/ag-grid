/**
 * Wraps the native Canvas element and overrides its CanvasRenderingContext2D to
 * provide resolution independent rendering based on `window.devicePixelRatio`.
 */
var HdpiCanvas = /** @class */ (function () {
    // The width/height attributes of the Canvas element default to
    // 300/150 according to w3.org.
    function HdpiCanvas(_a) {
        var _b = _a.document, document = _b === void 0 ? window.document : _b, _c = _a.width, width = _c === void 0 ? 600 : _c, _d = _a.height, height = _d === void 0 ? 300 : _d, _e = _a.domLayer, domLayer = _e === void 0 ? false : _e, _f = _a.zIndex, zIndex = _f === void 0 ? 0 : _f, _g = _a.name, name = _g === void 0 ? undefined : _g, _h = _a.overrideDevicePixelRatio, overrideDevicePixelRatio = _h === void 0 ? undefined : _h;
        this._container = undefined;
        this._enabled = true;
        this._opacity = 1;
        // `NaN` is deliberate here, so that overrides are always applied
        // and the `resetTransform` inside the `resize` method works in IE11.
        this._pixelRatio = NaN;
        this._width = 0;
        this._height = 0;
        this.document = document;
        this.element = document.createElement('canvas');
        this.context = this.element.getContext('2d');
        this.imageSource = this.context.canvas;
        var style = this.element.style;
        style.userSelect = 'none';
        style.display = 'block';
        if (domLayer) {
            style.position = 'absolute';
            style.zIndex = String(zIndex);
            style.top = '0';
            style.left = '0';
            style.pointerEvents = 'none';
            style.opacity = "1";
            if (name) {
                this.element.id = name;
            }
        }
        this.setPixelRatio(overrideDevicePixelRatio);
        this.resize(width, height);
    }
    Object.defineProperty(HdpiCanvas.prototype, "container", {
        get: function () {
            return this._container;
        },
        set: function (value) {
            if (this._container !== value) {
                this.remove();
                if (value) {
                    value.appendChild(this.element);
                }
                this._container = value;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(HdpiCanvas.prototype, "enabled", {
        get: function () {
            return this._enabled;
        },
        set: function (value) {
            this.element.style.display = value ? 'block' : 'none';
            this._enabled = !!value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(HdpiCanvas.prototype, "opacity", {
        get: function () {
            return this._opacity;
        },
        set: function (value) {
            this.element.style.opacity = "" + value;
            this._opacity = value;
        },
        enumerable: true,
        configurable: true
    });
    HdpiCanvas.prototype.remove = function () {
        var parentNode = this.element.parentNode;
        if (parentNode != null) {
            parentNode.removeChild(this.element);
        }
    };
    HdpiCanvas.prototype.destroy = function () {
        this.element.remove();
        this._canvas = undefined;
        Object.freeze(this);
    };
    HdpiCanvas.prototype.snapshot = function () {
        // No-op for compatibility with HdpiOffscreenCanvas.
    };
    HdpiCanvas.prototype.clear = function () {
        this.context.save();
        this.context.resetTransform();
        this.context.clearRect(0, 0, this.width, this.height);
        this.context.restore();
    };
    HdpiCanvas.prototype.toImage = function () {
        var img = this.document.createElement('img');
        img.src = this.getDataURL();
        return img;
    };
    HdpiCanvas.prototype.getDataURL = function (type) {
        return this.element.toDataURL(type);
    };
    /**
     * @param fileName The name of the downloaded file.
     * @param fileFormat The file format, the default is `image/png`
     */
    HdpiCanvas.prototype.download = function (fileName, fileFormat) {
        if (fileFormat === void 0) { fileFormat = 'image/png'; }
        fileName = (fileName || '').trim() || 'image';
        var dataUrl = this.getDataURL(fileFormat);
        var document = this.document;
        var a = document.createElement('a');
        a.href = dataUrl;
        a.download = fileName;
        a.style.display = 'none';
        document.body.appendChild(a); // required for the `click` to work in Firefox
        a.click();
        document.body.removeChild(a);
    };
    Object.defineProperty(HdpiCanvas.prototype, "pixelRatio", {
        get: function () {
            return this._pixelRatio;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Changes the pixel ratio of the Canvas element to the given value,
     * or uses the window.devicePixelRatio (default), then resizes the Canvas
     * element accordingly (default).
     */
    HdpiCanvas.prototype.setPixelRatio = function (ratio) {
        var pixelRatio = ratio || window.devicePixelRatio;
        if (pixelRatio === this.pixelRatio) {
            return;
        }
        HdpiCanvas.overrideScale(this.context, pixelRatio);
        this._pixelRatio = pixelRatio;
        this.resize(this.width, this.height);
    };
    Object.defineProperty(HdpiCanvas.prototype, "pixelated", {
        get: function () {
            return this.element.style.imageRendering === 'pixelated';
        },
        set: function (value) {
            this.element.style.imageRendering = value ? 'pixelated' : 'auto';
        },
        enumerable: true,
        configurable: true
    });
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
        if (!(width > 0 && height > 0)) {
            return;
        }
        var _a = this, element = _a.element, context = _a.context, pixelRatio = _a.pixelRatio;
        element.width = Math.round(width * pixelRatio);
        element.height = Math.round(height * pixelRatio);
        element.style.width = width + 'px';
        element.style.height = height + 'px';
        context.resetTransform();
        this._width = width;
        this._height = height;
    };
    Object.defineProperty(HdpiCanvas, "textMeasuringContext", {
        get: function () {
            if (this._textMeasuringContext) {
                return this._textMeasuringContext;
            }
            var canvas = document.createElement('canvas');
            this._textMeasuringContext = canvas.getContext('2d');
            return this._textMeasuringContext;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(HdpiCanvas, "svgText", {
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
    Object.defineProperty(HdpiCanvas, "has", {
        get: function () {
            if (this._has) {
                return this._has;
            }
            var isChrome = navigator.userAgent.indexOf('Chrome') > -1;
            var isFirefox = navigator.userAgent.indexOf('Firefox') > -1;
            var isSafari = !isChrome && navigator.userAgent.indexOf('Safari') > -1;
            this._has = Object.freeze({
                textMetrics: this.textMeasuringContext.measureText('test').actualBoundingBoxDescent !== undefined &&
                    // Firefox implemented advanced TextMetrics object in v74:
                    // https://bugzilla.mozilla.org/show_bug.cgi?id=1102584
                    // but it's buggy, so we'll keed using the SVG for text measurement in Firefox for now.
                    !isFirefox &&
                    !isSafari,
                getTransform: this.textMeasuringContext.getTransform !== undefined,
            });
            return this._has;
        },
        enumerable: true,
        configurable: true
    });
    HdpiCanvas.measureText = function (text, font, textBaseline, textAlign) {
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
    HdpiCanvas.getTextSize = function (text, font) {
        if (this.has.textMetrics) {
            var ctx = this.textMeasuringContext;
            ctx.font = font;
            var metrics = ctx.measureText(text);
            return {
                width: metrics.width,
                height: metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent,
            };
        }
        else {
            return this.measureSvgText(text, font);
        }
    };
    HdpiCanvas.measureSvgText = function (text, font) {
        var cache = this.textSizeCache;
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
            height: bbox.height,
        };
        cache[font][text] = size;
        return size;
    };
    HdpiCanvas.overrideScale = function (ctx, scale) {
        var depth = 0;
        var overrides = {
            save: function () {
                this.$save();
                depth++;
            },
            restore: function () {
                if (depth > 0) {
                    this.$restore();
                    depth--;
                }
                else {
                    throw new Error('Unable to restore() past depth 0');
                }
            },
            setTransform: function (a, b, c, d, e, f) {
                if (typeof a === 'object') {
                    this.$setTransform(a);
                }
                else {
                    this.$setTransform(a * scale, b * scale, c * scale, d * scale, e * scale, f * scale);
                }
            },
            resetTransform: function () {
                // As of Jan 8, 2019, `resetTransform` is still an "experimental technology",
                // and doesn't work in IE11 and Edge 44.
                this.$setTransform(scale, 0, 0, scale, 0, 0);
            },
        };
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
    };
    HdpiCanvas.textSizeCache = {};
    return HdpiCanvas;
}());
export { HdpiCanvas };
