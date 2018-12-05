// This is the property we set on an HTMLCanvasElement to let us know we've applied
// the resolution independent overrides to it, and what its current DPR is.
const DevicePixelRatioKey = '__DevicePixelRatio';
// TODO: use Symbol() here in the future to truly hide this property.

export function getDevicePixelRatio(canvas?: HTMLCanvasElement) {
    if (canvas) {
        return (canvas as any)[DevicePixelRatioKey] || 1;
    }
    return window.devicePixelRatio;
}

function getOverrides(dpr: number) {
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
            // The idea is to set the `dpr` scale here
            // that will be impossible to `ctx.restore`.
        }
    };
}

export function setDevicePixelRatio(canvas: HTMLCanvasElement): number {
    const ctx = canvas.getContext('2d');
    const dpr = getDevicePixelRatio();
    const overrides = getOverrides(dpr);

    if (!((canvas as any)[DevicePixelRatioKey])) {
        if (ctx) {
            for (const name in overrides) {
                // Save native methods under prefixed names.
                (ctx as any)['$' + name] = (ctx as any)[name];
                // Pretend our overrides are native methods.
                (ctx as any)[name] = (overrides as any)[name];
            }
            (canvas as any)[DevicePixelRatioKey] = dpr;

            const logicalWidth = canvas.width;
            const logicalHeight = canvas.height;
            canvas.width = Math.round(logicalWidth * dpr);
            canvas.height = Math.round(logicalHeight * dpr);
            canvas.style.width = Math.round(logicalWidth) + 'px';
            canvas.style.height = Math.round(logicalHeight) + 'px';

            ctx.resetTransform(); // should be called every time size changes

            return dpr;
        }
    }
    return 0;
}

export function resize(canvas: HTMLCanvasElement, width: number, height: number) {
    const dpr = getDevicePixelRatio(canvas);

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = Math.round(width) + 'px';
    canvas.style.height = Math.round(height) + 'px';

    canvas.getContext('2d')!.resetTransform();
}