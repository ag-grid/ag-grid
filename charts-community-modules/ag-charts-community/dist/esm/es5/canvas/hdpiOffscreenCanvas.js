import { HdpiCanvas } from './hdpiCanvas';
import { isDesktop } from '../util/userAgent';
/**
 * Wraps a native OffscreenCanvas and overrides its OffscreenCanvasRenderingContext2D to
 * provide resolution independent rendering based on `window.devicePixelRatio`.
 */
var HdpiOffscreenCanvas = /** @class */ (function () {
    // The width/height attributes of the Canvas element default to
    // 300/150 according to w3.org.
    function HdpiOffscreenCanvas(_a) {
        var _b = _a.width, width = _b === void 0 ? 600 : _b, _c = _a.height, height = _c === void 0 ? 300 : _c, _d = _a.overrideDevicePixelRatio, overrideDevicePixelRatio = _d === void 0 ? undefined : _d;
        this.enabled = true;
        // `NaN` is deliberate here, so that overrides are always applied
        // and the `resetTransform` inside the `resize` method works in IE11.
        this._pixelRatio = NaN;
        this._width = 0;
        this._height = 0;
        this.canvas = new OffscreenCanvas(width, height);
        this.context = this.canvas.getContext('2d');
        this.imageSource = this.canvas.transferToImageBitmap();
        this.setPixelRatio(overrideDevicePixelRatio);
        this.resize(width, height);
    }
    HdpiOffscreenCanvas.isSupported = function () {
        return window['OffscreenCanvas'] != null;
    };
    HdpiOffscreenCanvas.prototype.snapshot = function () {
        this.imageSource.close();
        this.imageSource = this.canvas.transferToImageBitmap();
    };
    HdpiOffscreenCanvas.prototype.destroy = function () {
        this.imageSource.close();
        // Workaround memory allocation quirks in iOS Safari by resizing to 0x0 and clearing.
        // See https://bugs.webkit.org/show_bug.cgi?id=195325.
        this.canvas.width = 0;
        this.canvas.height = 0;
        this.context.clearRect(0, 0, 0, 0);
    };
    HdpiOffscreenCanvas.prototype.clear = function () {
        this.context.save();
        this.context.resetTransform();
        this.context.clearRect(0, 0, this.width, this.height);
        this.context.restore();
    };
    Object.defineProperty(HdpiOffscreenCanvas.prototype, "pixelRatio", {
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
    HdpiOffscreenCanvas.prototype.setPixelRatio = function (ratio) {
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
    Object.defineProperty(HdpiOffscreenCanvas.prototype, "width", {
        get: function () {
            return this._width;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(HdpiOffscreenCanvas.prototype, "height", {
        get: function () {
            return this._height;
        },
        enumerable: false,
        configurable: true
    });
    HdpiOffscreenCanvas.prototype.resize = function (width, height) {
        if (!(width > 0 && height > 0)) {
            return;
        }
        var _a = this, canvas = _a.canvas, context = _a.context, pixelRatio = _a.pixelRatio;
        canvas.width = Math.round(width * pixelRatio);
        canvas.height = Math.round(height * pixelRatio);
        context.resetTransform();
        this._width = width;
        this._height = height;
    };
    return HdpiOffscreenCanvas;
}());
export { HdpiOffscreenCanvas };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGRwaU9mZnNjcmVlbkNhbnZhcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jYW52YXMvaGRwaU9mZnNjcmVlbkNhbnZhcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sY0FBYyxDQUFDO0FBQzFDLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQU05Qzs7O0dBR0c7QUFDSDtJQVdJLCtEQUErRDtJQUMvRCwrQkFBK0I7SUFDL0IsNkJBQVksRUFBeUY7WUFBdkYsYUFBVyxFQUFYLEtBQUssbUJBQUcsR0FBRyxLQUFBLEVBQUUsY0FBWSxFQUFaLE1BQU0sbUJBQUcsR0FBRyxLQUFBLEVBQUUsZ0NBQTBELEVBQTFELHdCQUF3QixtQkFBRyxTQUErQixLQUFBO1FBUm5HLFlBQU8sR0FBWSxJQUFJLENBQUM7UUF1Q3hCLGlFQUFpRTtRQUNqRSxxRUFBcUU7UUFDckUsZ0JBQVcsR0FBVyxHQUFHLENBQUM7UUF3QmxCLFdBQU0sR0FBVyxDQUFDLENBQUM7UUFLbkIsWUFBTyxHQUFXLENBQUMsQ0FBQztRQTdEeEIsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLGVBQWUsQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDakQsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUUsQ0FBQztRQUM3QyxJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMscUJBQXFCLEVBQUUsQ0FBQztRQUV2RCxJQUFJLENBQUMsYUFBYSxDQUFDLHdCQUF3QixDQUFDLENBQUM7UUFDN0MsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDL0IsQ0FBQztJQWJNLCtCQUFXLEdBQWxCO1FBQ0ksT0FBUSxNQUFjLENBQUMsaUJBQWlCLENBQUMsSUFBSSxJQUFJ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