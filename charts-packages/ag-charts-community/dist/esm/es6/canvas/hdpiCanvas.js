import { isDesktop } from '../util/userAgent';
/**
 * Wraps the native Canvas element and overrides its CanvasRenderingContext2D to
 * provide resolution independent rendering based on `window.devicePixelRatio`.
 */
export class HdpiCanvas {
    // The width/height attributes of the Canvas element default to
    // 300/150 according to w3.org.
    constructor({ document = window.document, width = 600, height = 300, domLayer = false, zIndex = 0, name = undefined, overrideDevicePixelRatio = undefined, }) {
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
        const { style } = this.element;
        style.userSelect = 'none';
        style.display = 'block';
        if (domLayer) {
            style.position = 'absolute';
            style.zIndex = String(zIndex);
            style.top = '0';
            style.left = '0';
            style.pointerEvents = 'none';
            style.opacity = `1`;
            if (name) {
                this.element.id = name;
            }
        }
        this.setPixelRatio(overrideDevicePixelRatio);
        this.resize(width, height);
    }
    set container(value) {
        if (this._container !== value) {
            this.remove();
            if (value) {
                value.appendChild(this.element);
            }
            this._container = value;
        }
    }
    get container() {
        return this._container;
    }
    set enabled(value) {
        this.element.style.display = value ? 'block' : 'none';
        this._enabled = !!value;
    }
    get enabled() {
        return this._enabled;
    }
    remove() {
        const { parentNode } = this.element;
        if (parentNode != null) {
            parentNode.removeChild(this.element);
        }
    }
    destroy() {
        this.element.remove();
        // Workaround memory allocation quirks in iOS Safari by resizing to 0x0 and clearing.
        // See https://bugs.webkit.org/show_bug.cgi?id=195325.
        this.element.width = 0;
        this.element.height = 0;
        this.context.clearRect(0, 0, 0, 0);
        Object.freeze(this);
    }
    snapshot() {
        // No-op for compatibility with HdpiOffscreenCanvas.
    }
    clear() {
        this.context.save();
        this.context.resetTransform();
        this.context.clearRect(0, 0, this.width, this.height);
        this.context.restore();
    }
    toImage() {
        const img = this.document.createElement('img');
        img.src = this.getDataURL();
        return img;
    }
    getDataURL(type) {
        return this.element.toDataURL(type);
    }
    /**
     * @param fileName The name of the downloaded file.
     * @param fileFormat The file format, the default is `image/png`
     */
    download(fileName, fileFormat = 'image/png') {
        fileName = (fileName || '').trim() || 'image';
        const dataUrl = this.getDataURL(fileFormat);
        const document = this.document;
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = fileName;
        a.style.display = 'none';
        document.body.appendChild(a); // required for the `click` to work in Firefox
        a.click();
        document.body.removeChild(a);
    }
    get pixelRatio() {
        return this._pixelRatio;
    }
    /**
     * Changes the pixel ratio of the Canvas element to the given value,
     * or uses the window.devicePixelRatio (default), then resizes the Canvas
     * element accordingly (default).
     */
    setPixelRatio(ratio) {
        let pixelRatio = ratio !== null && ratio !== void 0 ? ratio : window.devicePixelRatio;
        if (!isDesktop()) {
            // Mobile browsers have stricter memory limits, we reduce rendering resolution to
            // improve stability on mobile browsers. iOS Safari 12->16 are pain-points since they
            // have memory allocation quirks - see https://bugs.webkit.org/show_bug.cgi?id=195325.
            pixelRatio = 1;
        }
        if (pixelRatio === this.pixelRatio) {
            return;
        }
        HdpiCanvas.overrideScale(this.context, pixelRatio);
        this._pixelRatio = pixelRatio;
        this.resize(this.width, this.height);
    }
    set pixelated(value) {
        this.element.style.imageRendering = value ? 'pixelated' : 'auto';
    }
    get pixelated() {
        return this.element.style.imageRendering === 'pixelated';
    }
    get width() {
        return this._width;
    }
    get height() {
        return this._height;
    }
    resize(width, height) {
        if (!(width > 0 && height > 0)) {
            return;
        }
        const { element, context, pixelRatio } = this;
        element.width = Math.round(width * pixelRatio);
        element.height = Math.round(height * pixelRatio);
        element.style.width = width + 'px';
        element.style.height = height + 'px';
        context.resetTransform();
        this._width = width;
        this._height = height;
    }
    static get textMeasuringContext() {
        if (this._textMeasuringContext) {
            return this._textMeasuringContext;
        }
        const canvas = document.createElement('canvas');
        this._textMeasuringContext = canvas.getContext('2d');
        return this._textMeasuringContext;
    }
    static get svgText() {
        if (this._svgText) {
            return this._svgText;
        }
        const xmlns = 'http://www.w3.org/2000/svg';
        const svg = document.createElementNS(xmlns, 'svg');
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
        const svgText = document.createElementNS(xmlns, 'text');
        svgText.setAttribute('x', '0');
        svgText.setAttribute('y', '30');
        svgText.setAttribute('text', 'black');
        svg.appendChild(svgText);
        document.body.appendChild(svg);
        this._svgText = svgText;
        return svgText;
    }
    static get has() {
        if (this._has) {
            return this._has;
        }
        const isChrome = navigator.userAgent.indexOf('Chrome') > -1;
        const isFirefox = navigator.userAgent.indexOf('Firefox') > -1;
        const isSafari = !isChrome && navigator.userAgent.indexOf('Safari') > -1;
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
    }
    static measureText(text, font, textBaseline, textAlign) {
        const ctx = this.textMeasuringContext;
        ctx.font = font;
        ctx.textBaseline = textBaseline;
        ctx.textAlign = textAlign;
        return ctx.measureText(text);
    }
    /**
     * Returns the width and height of the measured text.
     * @param text The single-line text to measure.
     * @param font The font shorthand string.
     */
    static getTextSize(text, font) {
        if (this.has.textMetrics) {
            const ctx = this.textMeasuringContext;
            ctx.font = font;
            const metrics = ctx.measureText(text);
            return {
                width: metrics.width,
                height: metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent,
            };
        }
        else {
            return this.measureSvgText(text, font);
        }
    }
    static measureSvgText(text, font) {
        const cache = this.textSizeCache;
        const fontCache = cache[font];
        // Note: consider not caching the size of numeric strings.
        // For example: if (isNaN(+text)) { // skip
        if (fontCache) {
            const size = fontCache[text];
            if (size) {
                return size;
            }
        }
        else {
            cache[font] = {};
        }
        const svgText = this.svgText;
        svgText.style.font = font;
        svgText.textContent = text;
        // `getBBox` returns an instance of `SVGRect` with the same `width` and `height`
        // measurements as `DOMRect` instance returned by the `getBoundingClientRect`.
        // But the `SVGRect` instance has half the properties of the `DOMRect`,
        // so we use the `getBBox` method.
        const bbox = svgText.getBBox();
        const size = {
            width: bbox.width,
            height: bbox.height,
        };
        cache[font][text] = size;
        return size;
    }
    static overrideScale(ctx, scale) {
        let depth = 0;
        const overrides = {
            save() {
                this.$save();
                depth++;
            },
            restore() {
                if (depth > 0) {
                    this.$restore();
                    depth--;
                }
                else {
                    throw new Error('Unable to restore() past depth 0');
                }
            },
            setTransform(a, b, c, d, e, f) {
                if (typeof a === 'object') {
                    this.$setTransform(a);
                }
                else {
                    this.$setTransform(a * scale, b * scale, c * scale, d * scale, e * scale, f * scale);
                }
            },
            resetTransform() {
                // As of Jan 8, 2019, `resetTransform` is still an "experimental technology",
                // and doesn't work in IE11 and Edge 44.
                this.$setTransform(scale, 0, 0, scale, 0, 0);
            },
        };
        for (const name in overrides) {
            if (overrides.hasOwnProperty(name)) {
                // Save native methods under prefixed names,
                // if this hasn't been done by the previous overrides already.
                if (!ctx['$' + name]) {
                    ctx['$' + name] = ctx[name];
                }
                // Replace native methods with overrides,
                // or previous overrides with the new ones.
                ctx[name] = overrides[name];
            }
        }
    }
}
HdpiCanvas.textSizeCache = {};
