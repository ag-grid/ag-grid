const DevicePixelRatioFlag = '__DevicePixelRatio';

export function getDevicePixelRatio(canvas?: HTMLCanvasElement) {
    if (canvas) {
        return (canvas as any)[DevicePixelRatioFlag] || 1;
    }
    return window.devicePixelRatio;
}

function getOverrides(dpr: number) {
    let depth = 0;
    return <any>{
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

export function setDevicePixelRatio(canvas: HTMLCanvasElement): number {
    const canvasObj = <any>canvas;
    const ctx = canvas.getContext('2d');
    const dpr = getDevicePixelRatio();
    const overrides = getOverrides(dpr);

    if (!canvasObj[DevicePixelRatioFlag]) {
        if (ctx) {
            const ctxObj = <any>ctx;
            for (const name in overrides) {
                // Save native methods under prefixed names.
                ctxObj['$' + name] = ctxObj[name];
                // Pretend our overrides are native methods.
                ctxObj[name] = overrides[name];
            }
            canvasObj[DevicePixelRatioFlag] = dpr;

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