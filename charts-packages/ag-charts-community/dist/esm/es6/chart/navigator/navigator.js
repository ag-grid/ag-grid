import { RangeSelector } from '../shapes/rangeSelector';
import { ChartAxisDirection } from '../chartAxis';
import { BBox } from '../../scene/bbox';
import { NavigatorMask } from './navigatorMask';
import { NavigatorHandle } from './navigatorHandle';
import { ChartUpdateType } from '../chart';
export class Navigator {
    constructor(chart) {
        this.rs = new RangeSelector();
        this.mask = new NavigatorMask(this.rs.mask);
        this.minHandle = new NavigatorHandle(this.rs.minHandle);
        this.maxHandle = new NavigatorHandle(this.rs.maxHandle);
        this.minHandleDragging = false;
        this.maxHandleDragging = false;
        this.panHandleOffset = NaN;
        this.changedCursor = false;
        this._margin = 10;
        this.chart = chart;
        chart.scene.root.append(this.rs);
        this.rs.onRangeChange = (min, max) => this.updateAxes(min, max);
    }
    set enabled(value) {
        this.rs.visible = value;
    }
    get enabled() {
        return this.rs.visible;
    }
    set x(value) {
        this.rs.x = value;
    }
    get x() {
        return this.rs.x;
    }
    set y(value) {
        this.rs.y = value;
    }
    get y() {
        return this.rs.y;
    }
    set width(value) {
        this.rs.width = value;
    }
    get width() {
        return this.rs.width;
    }
    set height(value) {
        this.rs.height = value;
    }
    get height() {
        return this.rs.height;
    }
    set margin(value) {
        this._margin = value;
    }
    get margin() {
        return this._margin;
    }
    set min(value) {
        this.rs.min = value;
    }
    get min() {
        return this.rs.min;
    }
    set max(value) {
        this.rs.max = value;
    }
    get max() {
        return this.rs.max;
    }
    updateAxes(min, max) {
        const { chart } = this;
        let clipSeries = false;
        let layoutRequired = false;
        chart.axes.forEach((axis) => {
            if (axis.direction === ChartAxisDirection.X) {
                if (!clipSeries && (min > 0 || max < 1)) {
                    clipSeries = true;
                }
                axis.visibleRange = [min, max];
                const oldLabelAutoRotated = axis.labelAutoRotated;
                axis.update();
                if (axis.labelAutoRotated !== oldLabelAutoRotated) {
                    layoutRequired = true;
                }
            }
        });
        chart.seriesRoot.enabled = clipSeries;
        const updateType = layoutRequired ? ChartUpdateType.PERFORM_LAYOUT : ChartUpdateType.SERIES_UPDATE;
        chart.update(updateType, { forceNodeDataRefresh: true });
    }
    onDragStart(offset) {
        if (!this.enabled) {
            return;
        }
        const { offsetX, offsetY } = offset;
        const { rs } = this;
        const { minHandle, maxHandle, x, width, min } = rs;
        const visibleRange = rs.computeVisibleRangeBBox();
        if (!(this.minHandleDragging || this.maxHandleDragging)) {
            if (minHandle.containsPoint(offsetX, offsetY)) {
                this.minHandleDragging = true;
            }
            else if (maxHandle.containsPoint(offsetX, offsetY)) {
                this.maxHandleDragging = true;
            }
            else if (visibleRange.containsPoint(offsetX, offsetY)) {
                this.panHandleOffset = (offsetX - x) / width - min;
            }
        }
    }
    onDrag(offset) {
        if (!this.enabled) {
            return;
        }
        const { rs, panHandleOffset } = this;
        const { x, y, width, height, minHandle, maxHandle } = rs;
        const { style } = this.chart.element;
        const { offsetX, offsetY } = offset;
        const minX = x + width * rs.min;
        const maxX = x + width * rs.max;
        const visibleRange = new BBox(minX, y, maxX - minX, height);
        function getRatio() {
            return Math.min(Math.max((offsetX - x) / width, 0), 1);
        }
        if (minHandle.containsPoint(offsetX, offsetY) || maxHandle.containsPoint(offsetX, offsetY)) {
            this.changedCursor = true;
            style.cursor = 'ew-resize';
        }
        else if (visibleRange.containsPoint(offsetX, offsetY)) {
            this.changedCursor = true;
            style.cursor = 'grab';
        }
        else if (this.changedCursor) {
            this.changedCursor = false;
            style.cursor = 'default';
        }
        if (this.minHandleDragging) {
            rs.min = getRatio();
        }
        else if (this.maxHandleDragging) {
            rs.max = getRatio();
        }
        else if (!isNaN(panHandleOffset)) {
            const span = rs.max - rs.min;
            const min = Math.min(getRatio() - panHandleOffset, 1 - span);
            if (min <= rs.min) {
                // pan left
                rs.min = min;
                rs.max = rs.min + span;
            }
            else {
                // pan right
                rs.max = min + span;
                rs.min = rs.max - span;
            }
        }
    }
    onDragStop() {
        this.stopHandleDragging();
    }
    stopHandleDragging() {
        this.minHandleDragging = this.maxHandleDragging = false;
        this.panHandleOffset = NaN;
    }
}
