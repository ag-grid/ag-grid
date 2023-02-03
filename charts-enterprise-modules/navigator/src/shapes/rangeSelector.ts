import { _Scene, _ModuleSupport } from 'ag-charts-community';

const { RedrawType } = _Scene;

import { RangeHandle } from './rangeHandle';
import { RangeMask } from './rangeMask';

export class RangeSelector extends _Scene.Group {
    static className = 'Range';

    private static defaults = {
        x: 0,
        y: 0,
        width: 200,
        height: 30,
        min: 0,
        max: 1,
    };

    readonly minHandle = new RangeHandle();
    readonly maxHandle = new RangeHandle();
    readonly mask = (() => {
        const { x, y, width, height, min, max } = RangeSelector.defaults;
        const mask = new RangeMask();

        mask.x = x;
        mask.y = y;
        mask.width = width;
        mask.height = height;
        mask.min = min;
        mask.max = max;

        const { minHandle, maxHandle } = this;
        minHandle.centerX = x;
        maxHandle.centerX = x + width;
        minHandle.centerY = maxHandle.centerY = y + height / 2;

        this.append([mask, minHandle, maxHandle]);

        mask.onRangeChange = () => {
            this.updateHandles();
            this.onRangeChange?.();
        };

        return mask;
    })();

    protected _x: number = RangeSelector.defaults.x;
    set x(value: number) {
        this.mask.x = value;
        this.updateHandles();
    }
    get x(): number {
        return this.mask.x;
    }

    protected _y: number = RangeSelector.defaults.y;
    set y(value: number) {
        this.mask.y = value;
        this.updateHandles();
    }
    get y(): number {
        return this.mask.y;
    }

    protected _width: number = RangeSelector.defaults.width;
    set width(value: number) {
        this.mask.width = value;
        this.updateHandles();
    }
    get width(): number {
        return this.mask.width;
    }

    protected _height: number = RangeSelector.defaults.height;
    set height(value: number) {
        this.mask.height = value;
        this.updateHandles();
    }
    get height(): number {
        return this.mask.height;
    }

    protected _min: number = RangeSelector.defaults.min;
    set min(value: number) {
        this.mask.min = value;
    }
    get min(): number {
        return this.mask.min;
    }

    protected _max: number = RangeSelector.defaults.max;
    set max(value: number) {
        this.mask.max = value;
    }
    get max(): number {
        return this.mask.max;
    }

    constructor() {
        super({ name: 'rangeSelectorGroup' });

        this.isContainerNode = true;
    }

    onRangeChange?: () => any;

    private updateHandles() {
        const { minHandle, maxHandle, x, y, width, height, mask } = this;
        minHandle.centerX = x + width * mask.min;
        maxHandle.centerX = x + width * mask.max;
        minHandle.centerY = maxHandle.centerY = y + height / 2;
    }

    computeBBox() {
        return this.mask.computeBBox();
    }

    computeVisibleRangeBBox() {
        return this.mask.computeVisibleRangeBBox();
    }

    render(renderCtx: _Scene.RenderContext) {
        let { ctx, forceRender, stats } = renderCtx;

        if (this.dirty === RedrawType.NONE && !forceRender) {
            if (stats) stats.nodesSkipped++;
            return;
        }
        this.computeTransformMatrix();
        this.matrix.toContext(ctx);

        const { mask, minHandle, maxHandle } = this;
        [mask, minHandle, maxHandle].forEach((child) => {
            if (child.visible && (forceRender || child.dirty > RedrawType.NONE)) {
                ctx.save();
                child.render({ ...renderCtx, ctx, forceRender });
                ctx.restore();
            }
        });

        this.markClean({ force: true });
        if (stats) stats.nodesRendered++;
    }
}
