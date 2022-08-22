"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const group_1 = require("../../scene/group");
const rangeHandle_1 = require("./rangeHandle");
const rangeMask_1 = require("./rangeMask");
const node_1 = require("../../scene/node");
class RangeSelector extends group_1.Group {
    constructor() {
        super();
        this.minHandle = new rangeHandle_1.RangeHandle();
        this.maxHandle = new rangeHandle_1.RangeHandle();
        this.mask = (() => {
            const { x, y, width, height, min, max } = RangeSelector.defaults;
            const mask = new rangeMask_1.RangeMask();
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
        this.isContainerNode = true;
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
    render(renderCtx) {
        let { ctx, forceRender, stats } = renderCtx;
        if (this.dirty === node_1.RedrawType.NONE && !forceRender) {
            if (stats)
                stats.nodesSkipped++;
            return;
        }
        this.computeTransformMatrix();
        this.matrix.toContext(ctx);
        const { mask, minHandle, maxHandle } = this;
        [mask, minHandle, maxHandle].forEach((child) => {
            if (child.visible && (forceRender || child.dirty > node_1.RedrawType.NONE)) {
                ctx.save();
                child.render(Object.assign(Object.assign({}, renderCtx), { ctx, forceRender }));
                ctx.restore();
            }
        });
        this.markClean({ force: true });
        if (stats)
            stats.nodesRendered++;
    }
}
exports.RangeSelector = RangeSelector;
RangeSelector.className = 'Range';
RangeSelector.defaults = {
    x: 0,
    y: 0,
    width: 200,
    height: 30,
    min: 0,
    max: 1,
};
