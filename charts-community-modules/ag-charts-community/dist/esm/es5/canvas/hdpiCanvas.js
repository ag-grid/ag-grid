import { isDesktop } from '../util/userAgent';
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
        // `NaN` is deliberate here, so that overrides are always applied
        // and the `resetTransform` inside the `resize` method works in IE11.
        this._pixelRatio = NaN;
        this._width = 0;
        this._height = 0;
        this.document = document;
        // Create canvas and immediately apply width + height to avoid out-of-memory
        // errors on iOS/iPadOS Safari.
        this.element = document.createElement('canvas');
        this.element.width = width;
        this.element.height = height;
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
        enumerable: false,
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
        enumerable: false,
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
        // Workaround memory allocation quirks in iOS Safari by resizing to 0x0 and clearing.
        // See https://bugs.webkit.org/show_bug.cgi?id=195325.
        this.element.width = 0;
        this.element.height = 0;
        this.context.clearRect(0, 0, 0, 0);
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
        fileName = (fileName !== null && fileName !== void 0 ? fileName : '').trim() || 'image';
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
        enumerable: false,
        configurable: true
    });
    /**
     * Changes the pixel ratio of the Canvas element to the given value,
     * or uses the window.devicePixelRatio (default), then resizes the Canvas
     * element accordingly (default).
     */
    HdpiCanvas.prototype.setPixelRatio = function (ratio) {
        var pixelRatio = ratio !== null && ratio !== void 0 ? ratio : window.devicePixelRatio;
        if (!isDesktop()) {
            // Mobile browsers have stricter memory limits, we reduce rendering resolution to
            // improve stability on mobile browsers. iOS Safari 12->16 are pain-points since they
            // have memory allocation quirks - see https://bugs.webkit.org/show_bug.cgi?id=195325.
            pixelRatio = 1;
        }
        HdpiCanvas.overrideScale(this.context, pixelRatio);
        this._pixelRatio = pixelRatio;
    };
    Object.defineProperty(HdpiCanvas.prototype, "pixelated", {
        get: function () {
            return this.element.style.imageRendering === 'pixelated';
        },
        set: function (value) {
            this.element.style.imageRendering = value ? 'pixelated' : 'auto';
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(HdpiCanvas.prototype, "width", {
        get: function () {
            return this._width;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(HdpiCanvas.prototype, "height", {
        get: function () {
            return this._height;
        },
        enumerable: false,
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
        enumerable: false,
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
        enumerable: false,
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
                    // but it's buggy, so we'll keep using the SVG for text measurement in Firefox for now.
                    !isFirefox &&
                    !isSafari,
                getTransform: this.textMeasuringContext.getTransform !== undefined,
            });
            return this._has;
        },
        enumerable: false,
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
                    throw new Error('AG Charts - Unable to restore() past depth 0');
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
            verifyDepthZero: function () {
                if (depth !== 0) {
                    throw new Error('AG Charts - Save/restore depth is non-zero: ' + depth);
                }
            },
        };
        for (var name_1 in overrides) {
            if (Object.prototype.hasOwnProperty.call(overrides, name_1)) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGRwaUNhbnZhcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jYW52YXMvaGRwaUNhbnZhcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFPOUM7OztHQUdHO0FBQ0g7SUFNSSwrREFBK0Q7SUFDL0QsK0JBQStCO0lBQy9CLG9CQUFZLEVBUVg7WUFQRyxnQkFBMEIsRUFBMUIsUUFBUSxtQkFBRyxNQUFNLENBQUMsUUFBUSxLQUFBLEVBQzFCLGFBQVcsRUFBWCxLQUFLLG1CQUFHLEdBQUcsS0FBQSxFQUNYLGNBQVksRUFBWixNQUFNLG1CQUFHLEdBQUcsS0FBQSxFQUNaLGdCQUFnQixFQUFoQixRQUFRLG1CQUFHLEtBQUssS0FBQSxFQUNoQixjQUFVLEVBQVYsTUFBTSxtQkFBRyxDQUFDLEtBQUEsRUFDVixZQUFzQyxFQUF0QyxJQUFJLG1CQUFHLFNBQStCLEtBQUEsRUFDdEMsZ0NBQTBELEVBQTFELHdCQUF3QixtQkFBRyxTQUErQixLQUFBO1FBa0N0RCxlQUFVLEdBQTRCLFNBQVMsQ0FBQztRQWdCaEQsYUFBUSxHQUFZLElBQUksQ0FBQztRQXFFakMsaUVBQWlFO1FBQ2pFLHFFQUFxRTtRQUNyRSxnQkFBVyxHQUFXLEdBQUcsQ0FBQztRQStCbEIsV0FBTSxHQUFXLENBQUMsQ0FBQztRQUtuQixZQUFPLEdBQVcsQ0FBQyxDQUFDO1FBM0p4QixJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztRQUV6Qiw0RUFBNEU7UUFDNUUsK0JBQStCO1FBQy9CLElBQUksQ0FBQyxPQUFPLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNoRCxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7UUFDM0IsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBRTdCLElBQUksQ0FB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