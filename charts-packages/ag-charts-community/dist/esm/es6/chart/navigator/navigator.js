var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { RangeSelector } from '../shapes/rangeSelector';
import { BBox } from '../../scene/bbox';
import { NavigatorMask } from './navigatorMask';
import { NavigatorHandle } from './navigatorHandle';
import { ChartUpdateType } from '../chart';
import { BOOLEAN, NUMBER, Validate } from '../../util/validation';
export class Navigator {
    constructor(chart, interactionManager, cursorManager) {
        this.chart = chart;
        this.cursorManager = cursorManager;
        this.rs = new RangeSelector();
        this.mask = new NavigatorMask(this.rs.mask);
        this.minHandle = new NavigatorHandle(this.rs.minHandle);
        this.maxHandle = new NavigatorHandle(this.rs.maxHandle);
        this.minHandleDragging = false;
        this.maxHandleDragging = false;
        this.panHandleOffset = NaN;
        this._enabled = false;
        this._margin = 10;
        this._visible = true;
        this.chart.scene.root.append(this.rs);
        this.rs.onRangeChange = () => chart.update(ChartUpdateType.PERFORM_LAYOUT, { forceNodeDataRefresh: true });
        interactionManager.addListener('drag-start', (event) => this.onDragStart(event));
        interactionManager.addListener('drag', (event) => this.onDrag(event));
        interactionManager.addListener('hover', (event) => this.onDrag(event));
        interactionManager.addListener('drag-end', () => this.onDragStop());
    }
    set enabled(value) {
        this._enabled = value;
        this.updateGroupVisibility();
    }
    get enabled() {
        return this._enabled;
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
    set visible(value) {
        this._visible = value;
        this.updateGroupVisibility();
    }
    get visible() {
        return this._visible;
    }
    updateGroupVisibility() {
        this.rs.visible = this.enabled && this.visible;
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
        const { offsetX, offsetY } = offset;
        const minX = x + width * rs.min;
        const maxX = x + width * rs.max;
        const visibleRange = new BBox(minX, y, maxX - minX, height);
        function getRatio() {
            return Math.min(Math.max((offsetX - x) / width, 0), 1);
        }
        if (minHandle.containsPoint(offsetX, offsetY) || maxHandle.containsPoint(offsetX, offsetY)) {
            this.cursorManager.updateCursor('navigator', 'ew-resize');
        }
        else if (visibleRange.containsPoint(offsetX, offsetY)) {
            this.cursorManager.updateCursor('navigator', 'grab');
        }
        else {
            this.cursorManager.updateCursor('navigator');
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
__decorate([
    Validate(BOOLEAN)
], Navigator.prototype, "_enabled", void 0);
__decorate([
    Validate(NUMBER(0))
], Navigator.prototype, "_margin", void 0);
