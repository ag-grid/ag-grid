// This is the property we set on an HTMLCanvasElement to let us know we've applied
// the resolution independent overrides to it, and what its current DPR is.
const DevicePixelRatioKey = '__DevicePixelRatio';
// TODO: use Symbol() here in the future to truly hide this property.

function makeHdpiOverrides(dpr: number): any {
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
        resetTransform() {
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
export function createHdpiCanvas(width = 300, height = 150): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    applyHdpiOverrides(canvas);
    return canvas;
}

export function applyHdpiOverrides(canvas: HTMLCanvasElement): number {
    const canvasDpr = (canvas as any)[DevicePixelRatioKey];
    const dpr = window.devicePixelRatio;

    // if overrides haven't been applied and actually needed
    if (!canvasDpr && dpr !== 1) {
        const overrides = makeHdpiOverrides(dpr);
        const ctx = canvas.getContext('2d')!;
        const ctxObj = ctx as any;
        for (const name in overrides) {
            // Save native methods under prefixed names.
            ctxObj['$' + name] = ctxObj[name];
            // Pretend our overrides are native methods.
            ctxObj[name] = overrides[name];
        }
        (canvas as any)[DevicePixelRatioKey] = dpr;

        const logicalWidth = canvas.width;
        const logicalHeight = canvas.height;
        canvas.width = Math.round(logicalWidth * dpr);
        canvas.height = Math.round(logicalHeight * dpr);
        canvas.style.width = Math.round(logicalWidth) + 'px';
        canvas.style.height = Math.round(logicalHeight) + 'px';

        ctx.resetTransform(); // should be called every time the size changes

        return dpr;
    }
    return 0;
}

/**
 * Resizes the given Canvas element, taking HDPI overrides (if any) into account.
 * @param canvas
 * @param width
 * @param height
 */
export function resizeCanvas(canvas: HTMLCanvasElement, width: number, height: number) {
    const canvasDpr = (canvas as any)[DevicePixelRatioKey] || 1;

    canvas.width = Math.round(width * canvasDpr);
    canvas.height = Math.round(height * canvasDpr);
    canvas.style.width = Math.round(width) + 'px';
    canvas.style.height = Math.round(height) + 'px';

    canvas.getContext('2d')!.resetTransform();
}
