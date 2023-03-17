"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Navigator = void 0;
const rangeSelector_1 = require("../shapes/rangeSelector");
const navigatorMask_1 = require("./navigatorMask");
const navigatorHandle_1 = require("./navigatorHandle");
const module_1 = require("../../util/module");
const validation_1 = require("../../util/validation");
const bbox_1 = require("../../scene/bbox");
class Navigator extends module_1.BaseModuleInstance {
    constructor(ctx) {
        super();
        this.ctx = ctx;
        this.rs = new rangeSelector_1.RangeSelector();
        // Wrappers to allow option application to the scene graph nodes.
        this.mask = new navigatorMask_1.NavigatorMask(this.rs.mask);
        this.minHandle = new navigatorHandle_1.NavigatorHandle(this.rs.minHandle);
        this.maxHandle = new navigatorHandle_1.NavigatorHandle(this.rs.maxHandle);
        this.minHandleDragging = false;
        this.maxHandleDragging = false;
        this.panHandleOffset = NaN;
        this._enabled = false;
        this.margin = 10;
        this._visible = true;
        this.rs.onRangeChange = () => this.ctx.zoomManager.updateZoom('navigator', { x: { min: this.rs.min, max: this.rs.max } });
        [
            ctx.interactionManager.addListener('drag-start', (event) => this.onDragStart(event)),
            ctx.interactionManager.addListener('drag', (event) => this.onDrag(event)),
            ctx.interactionManager.addListener('hover', (event) => this.onDrag(event)),
            ctx.interactionManager.addListener('drag-end', () => this.onDragStop()),
        ].forEach((s) => this.destroyFns.push(() => ctx.interactionManager.removeListener(s)));
        [
            ctx.layoutService.addListener('before-series', (event) => this.layout(event)),
            ctx.layoutService.addListener('layout-complete', (event) => this.layoutComplete(event)),
        ].forEach((s) => this.destroyFns.push(() => ctx.layoutService.removeListener(s)));
        ctx.scene.root.appendChild(this.rs);
        this.destroyFns.push(() => { var _a; return (_a = ctx.scene.root) === null || _a === void 0 ? void 0 : _a.removeChild(this.rs); });
        this.updateGroupVisibility();
    }
    set enabled(value) {
        this._enabled = value;
        this.updateGroupVisibility();
    }
    get enabled() {
        return this._enabled;
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
    layout({ shrinkRect }) {
        if (this.enabled) {
            const navigatorTotalHeight = this.rs.height + this.margin;
            shrinkRect.shrink(navigatorTotalHeight, 'bottom');
            this.rs.y = shrinkRect.y + shrinkRect.height + this.margin;
        }
        return { shrinkRect };
    }
    layoutComplete({ series: { rect, visible } }) {
        if (this.enabled && visible) {
            this.rs.x = rect.x;
            this.rs.width = rect.width;
        }
        this.visible = visible;
    }
    update() {
        // Nothing to do!
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
        const visibleRange = new bbox_1.BBox(minX, y, maxX - minX, height);
        const getRatio = () => Math.min(Math.max((offsetX - x) / width, 0), 1);
        if (minHandle.containsPoint(offsetX, offsetY) || maxHandle.containsPoint(offsetX, offsetY)) {
            this.ctx.cursorManager.updateCursor('navigator', 'ew-resize');
        }
        else if (visibleRange.containsPoint(offsetX, offsetY)) {
            this.ctx.cursorManager.updateCursor('navigator', 'grab');
        }
        else {
            this.ctx.cursorManager.updateCursor('navigator');
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
    validation_1.Validate(validation_1.BOOLEAN)
], Navigator.prototype, "_enabled", void 0);
__decorate([
    validation_1.Validate(validation_1.NUMBER(0))
], Navigator.prototype, "margin", void 0);
exports.Navigator = Navigator;
