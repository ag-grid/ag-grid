import { HdpiCanvas } from './hdpiCanvas';
import { isDesktop } from '../util/userAgent';

// Work-around for typing issues with Angular 13+ (see AG-6969),
type OffscreenCanvasRenderingContext2D = any;
type OffscreenCanvas = any;

/**
 * Wraps a native OffscreenCanvas and overrides its OffscreenCanvasRenderingContext2D to
 * provide resolution independent rendering based on `window.devicePixelRatio`.
 */
export class HdpiOffscreenCanvas {
    readonly context: OffscreenCanvasRenderingContext2D & { verifyDepthZero?: () => void };
    readonly canvas: OffscreenCanvas;
    imageSource: ImageBitmap;

    enabled: boolean = true;

    static isSupported() {
        return (window as any)['OffscreenCanvas'] != null;
    }

    // The width/height attributes of the Canvas element default to
    // 300/150 according to w3.org.
    constructor({ width = 600, height = 300, overrideDevicePixelRatio = undefined as undefined | number }) {
        this.canvas = new OffscreenCanvas(width, height);
        this.context = this.canvas.getContext('2d')!;
        this.imageSource = this.canvas.transferToImageBitmap();

        this.setPixelRatio(overrideDevicePixelRatio);
        this.resize(width, height);
    }

    snapshot() {
        this.imageSource.close();
        this.imageSource = this.canvas.transferToImageBitmap();
    }

    destroy() {
        this.imageSource.close();

        // Workaround memory allocation quirks in iOS Safari by resizing to 0x0 and clearing.
        // See https://bugs.webkit.org/show_bug.cgi?id=195325.
        this.canvas.width = 0;
        this.canvas.height = 0;
        this.context.clearRect(0, 0, 0, 0);
    }

    clear() {
        this.context.save();
        this.context.resetTransform();
        this.context.clearRect(0, 0, this.width, this.height);
        this.context.restore();
    }

    // `NaN` is deliberate here, so that overrides are always applied
    // and the `resetTransform` inside the `resize` method works in IE11.
    _pixelRatio: number = NaN;
    get pixelRatio(): number {
        return this._pixelRatio;
    }

    /**
     * Changes the pixel ratio of the Canvas element to the given value,
     * or uses the window.devicePixelRatio (default), then resizes the Canvas
     * element accordingly (default).
     */
    private setPixelRatio(ratio?: number) {
        let pixelRatio = ratio ?? window.devicePixelRatio;
        if (!isDesktop()) {
            // Mobile browsers have stricter memory limits, we reduce rendering resolution to
            // improve stability on mobile browsers. iOS Safari 12->16 are pain-points since they
            // have memory allocation quirks - see https://bugs.webkit.org/show_bug.cgi?id=195325.
            pixelRatio = 1;
        }

        HdpiCanvas.overrideScale(this.context, pixelRatio);

        this._pixelRatio = pixelRatio;
    }

    private _width: number = 0;
    get width(): number {
        return this._width;
    }

    private _height: number = 0;
    get height(): number {
        return this._height;
    }

    resize(width: number, height: number) {
        if (!(width > 0 && height > 0)) {
            return;
        }
        const { canvas, context, pixelRatio } = this;
        canvas.width = Math.round(width * pixelRatio);
        canvas.height = Math.round(height * pixelRatio);
        context.resetTransform();

        this._width = width;
        this._height = height;
    }
}
