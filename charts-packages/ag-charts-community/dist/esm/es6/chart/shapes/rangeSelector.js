import { Group } from "../../scene/group";
import { RangeHandle } from "./rangeHandle";
import { RangeMask } from "./rangeMask";
export class RangeSelector extends Group {
    constructor() {
        super(...arguments);
        this.isContainerNode = true;
        this.minHandle = new RangeHandle();
        this.maxHandle = new RangeHandle();
        this.mask = (() => {
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
            mask.onRangeChange = (min, max) => {
                this.updateHandles();
                this.onRangeChange && this.onRangeChange(min, max);
            };
            return mask;
        })();
        this._x = RangeSelector.defaults.x;
        this._y = RangeSelector.defaults.y;
        this._width = RangeSelector.defaults.width;
        this._height = RangeSelector.defaults.height;
        this._min = RangeSelector.defaults.min;
        this._max = RangeSelector.defaults.max;
    }
    set x(value) {
        this.mask.x = value;
        this.updateHandles();
    }
    get x() {
        return this.mask.x;
    }
    set y(value) {
        this.mask.y = value;
        this.updateHandles();
    }
    get y() {
        return this.mask.y;
    }
    set width(value) {
        this.mask.width = value;
        this.updateHandles();
    }
    get width() {
        return this.mask.width;
    }
    set height(value) {
        this.mask.height = value;
        this.updateHandles();
    }
    get height() {
        return this.mask.height;
    }
    set min(value) {
        this.mask.min = value;
    }
    get min() {
        return this.mask.min;
    }
    set max(value) {
        this.mask.max = value;
    }
    get max() {
        return this.mask.max;
    }
    updateHandles() {
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
    render(ctx) {
        if (this.dirtyTransform) {
            this.computeTransformMatrix();
        }
        this.matrix.toContext(ctx);
        const { mask, minHandle, maxHandle } = this;
        [mask, minHandle, maxHandle].forEach(child => {
            ctx.save();
            if (child.visible) {
                child.render(ctx);
            }
            ctx.restore();
        });
    }
}
RangeSelector.className = 'Range';
RangeSelector.defaults = {
    x: 0,
    y: 0,
    width: 200,
    height: 30,
    min: 0,
    max: 1
};
//# sourceMappingURL=rangeSelector.js.map