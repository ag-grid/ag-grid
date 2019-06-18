type Size = { width: number, height: number };

export interface DownloadOptions {
    fileName?: string, background?: string
}

/**
 * Wraps the native Canvas element and overrides its CanvasRenderingContext2D to
 * provide resolution independent rendering based on `window.devicePixelRatio`.
 */
export class HdpiCanvas {
    readonly canvas = document.createElement('canvas');

    readonly context = this.canvas.getContext('2d')!;

    /**
     * The canvas flickers on size changes in Safari.
     * A temporary canvas is used (during resize only) to prevent that.
     */
    private tempCanvas = document.createElement('canvas');

    // The width/height attributes of the Canvas element default to
    // 300/150 according to w3.org.
    constructor(width = 300, height = 150) {
        this.canvas.style.userSelect = 'none';
        this.updatePixelRatio(0, false);
        this.resize(width, height);
    }

    private _parent: HTMLElement | undefined = undefined;
    set parent(value: HTMLElement | undefined) {
        if (this._parent !== value) {
            this.remove();
            if (value) {
                value.appendChild(this.canvas);
            }
            this._parent = value;
        }

    }
    get parent(): HTMLElement | undefined {
        return this._parent;
    }

    private remove() {
        const parent = this.canvas.parentNode;

        if (parent !== null) {
            parent.removeChild(this.canvas);
        }
    }

    destroy() {
        this.canvas.remove();
        (this as any)._canvas = undefined;
        Object.freeze(this);
    }

    toImage(): HTMLImageElement {
        const img = document.createElement('img');
        img.src = this.canvas.toDataURL();
        return img;
    }

    /**
     * @param options.fileName The `.png` extension is going to be added automatically.
     * @param [options.background] Defaults to `white`.
     */
    download(options: DownloadOptions = {}) {
        // Chart images saved as JPEG are a few times larger at 50% quality than PNG images,
        // so we don't support saving to JPEG.
        const type = 'image/png';
        // The background of our canvas is transparent, so we create a temporary canvas
        // with the white background and paint our canvas on top of it.
        const canvas = document.createElement('canvas');
        canvas.width = this.canvas.width;
        canvas.height = this.canvas.height;
        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = options.background || 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(this.canvas, 0, 0);

        const dataUrl = canvas.toDataURL(type);
        const fileName = ((options.fileName || '').trim() || 'image') + '.png';

        if (navigator.msSaveOrOpenBlob) { // IE11
            const binary = atob(dataUrl.split(',')[1]); // strip the `data:image/png;base64,` part
            const array = [];
            for (let i = 0, n = binary.length; i < n; i++) {
                array.push(binary.charCodeAt(i));
            }
            const blob = new Blob([new Uint8Array(array)], {type});

            navigator.msSaveOrOpenBlob(blob, fileName);
        } else {
            const a = document.createElement('a');
            a.href = dataUrl;
            a.download = fileName;
            a.style.display = 'none';
            document.body.appendChild(a); // required for the `click` to work in Firefox
            a.click();
            document.body.removeChild(a);
        }
    }

    // `NaN` is deliberate here, so that overrides are always applied
    // and the `resetTransform` inside the `resize` method works in IE11.
    _pixelRatio: number = NaN;
    get pixelRatio(): number {
        return this._pixelRatio;
    }

    private overrides: any;

    /**
     * Updates the pixel ratio of the Canvas element with the given value,
     * or uses the window.devicePixelRatio (default), then resizes the Canvas
     * element accordingly (default).
     * @param ratio
     * @param resize
     */
    updatePixelRatio(ratio = 0, resize = true) {
        const pixelRatio = ratio || window.devicePixelRatio;

        if (pixelRatio === this.pixelRatio) {
            return;
        }

        const canvas = this.canvas;
        const ctx = this.context;
        const overrides = this.overrides = HdpiCanvas.makeHdpiOverrides(pixelRatio);
        for (const name in overrides) {
            if (overrides.hasOwnProperty(name)) {
                // Save native methods under prefixed names,
                // if this hasn't been done by the previous overrides already.
                if (!(ctx as any)['$' + name]) {
                    (ctx as any)['$' + name] = (ctx as any)[name];
                }
                // Replace native methods with overrides,
                // or previous overrides with the new ones.
                (ctx as any)[name] = overrides[name];
            }
        }

        if (resize) {
            const logicalWidth = canvas.width / this.pixelRatio;
            const logicalHeight = canvas.height / this.pixelRatio;

            canvas.width = Math.round(logicalWidth * pixelRatio);
            canvas.height = Math.round(logicalHeight * pixelRatio);
            canvas.style.width = Math.round(logicalWidth) + 'px';
            canvas.style.height = Math.round(logicalHeight) + 'px';

            ctx.resetTransform(); // should be called every time Canvas size changes
        }

        this._pixelRatio = pixelRatio;
    }

    resize(width: number, height: number) {
        const canvas = this.canvas;
        const context = this.context;
        const tempCanvas = this.tempCanvas;

        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempContext = tempCanvas.getContext('2d')!;

        tempContext.drawImage(context.canvas, 0, 0);

        canvas.width = Math.round(width * this.pixelRatio);
        canvas.height = Math.round(height * this.pixelRatio);
        canvas.style.width = Math.round(width) + 'px';
        canvas.style.height = Math.round(height) + 'px';

        context.drawImage(tempContext.canvas, 0, 0);

        context.resetTransform();
    }

    // 2D canvas context used for measuring text.
    private static _textMeasuringContext?: CanvasRenderingContext2D;
    private static get textMeasuringContext(): CanvasRenderingContext2D {
        if (HdpiCanvas._textMeasuringContext) {
            return HdpiCanvas._textMeasuringContext;
        }
        const canvas = document.createElement('canvas');
        return HdpiCanvas._textMeasuringContext = canvas.getContext('2d')!;
    }

    // Offscreen SVGTextElement for measuring text. This fallback method
    // is at least 25 times slower than `CanvasRenderingContext2D.measureText`.
    // Using a <span> and its `getBoundingClientRect` for text measurement
    // is also slow and often results in a grossly incorrect measured height.
    private static _svgText: SVGTextElement;
    private static get svgText(): SVGTextElement {
        if (HdpiCanvas._svgText) {
            return HdpiCanvas._svgText;
        }

        const xmlns = 'http://www.w3.org/2000/svg';

        const svg = document.createElementNS(xmlns, 'svg');
        svg.setAttribute('width', '100');
        svg.setAttribute('height', '100');
        // Add a descriptive class name in case someone sees this SVG element
        // in devtools and wonders about its purpose:
        if (svg.classList) {
            svg.classList.add('text-measuring-svg');
        } else {
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

        HdpiCanvas._svgText = svgText;

        return svgText;
    };

    private static _has?: Readonly<{
        textMetrics: boolean,
        getTransform: boolean,
        flicker: boolean
    }>;
    static get has() {
        if (HdpiCanvas._has) {
            return HdpiCanvas._has;
        }
        return HdpiCanvas._has = Object.freeze({
            textMetrics: HdpiCanvas.textMeasuringContext.measureText('test')
                .actualBoundingBoxDescent !== undefined,
            getTransform: HdpiCanvas.textMeasuringContext.getTransform !== undefined,
            flicker: !!(window as any).safari
        });
    };

    static measureText(text: string, font: string,
                       textBaseline: CanvasTextBaseline,
                       textAlign: CanvasTextAlign): TextMetrics {
        const ctx = HdpiCanvas.textMeasuringContext;
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
    static getTextSize(text: string, font: string): Size {
        if (HdpiCanvas.has.textMetrics) {
            const ctx = HdpiCanvas.textMeasuringContext;
            ctx.font = font;
            const metrics = ctx.measureText(text);

            return {
                width: metrics.width,
                height: metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent
            };
        } else {
            return HdpiCanvas.measureSvgText(text, font);
        }
    }

    private static textSizeCache: { [font: string]: { [text: string] : Size } } = {};

    private static measureSvgText(text: string, font: string): Size {
        const cache = HdpiCanvas.textSizeCache;
        const fontCache = cache[font];

        // Note: consider not caching the size of numeric strings.
        // For example: if (isNaN(+text)) { // skip

        if (fontCache) {
            const size = fontCache[text];
            if (size) {
                return size;
            }
        } else {
            cache[font] = {};
        }

        const svgText = HdpiCanvas.svgText;

        svgText.style.font = font;
        svgText.textContent = text;

        // `getBBox` returns an instance of `SVGRect` with the same `width` and `height`
        // measurements as `DOMRect` instance returned by the `getBoundingClientRect`.
        // But the `SVGRect` instance has half the properties of the `DOMRect`,
        // so we use the `getBBox` method.
        const bbox = svgText.getBBox();
        const size: Size = {
            width: bbox.width,
            height: bbox.height
        };

        cache[font][text] = size;

        return size;
    }

    private static makeHdpiOverrides(pixelRatio: number) {
        let depth = 0;
        return {
            save() {
                this.$save();
                depth++;
            },
            restore() {
                if (depth > 0) {
                    this.$restore();
                    depth--;
                }
            },
            setTransform(a: number, b: number, c: number, d: number, e: number, f: number) {
                this.$setTransform(
                    a * pixelRatio,
                    b * pixelRatio,
                    c * pixelRatio,
                    d * pixelRatio,
                    e * pixelRatio,
                    f * pixelRatio
                );
            },
            resetTransform() {
                // As of Jan 8, 2019, `resetTransform` is still an "experimental technology",
                // and doesn't work in IE11 and Edge 44.
                this.$setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
                this.save();
                depth = 0;
                // The scale above will be impossible to restore,
                // because we override the `ctx.restore` above and
                // check `depth` there.
            }
        } as any;
    }
}
