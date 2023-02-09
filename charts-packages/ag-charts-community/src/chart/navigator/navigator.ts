import { RangeSelector } from '../shapes/rangeSelector';
import { NavigatorMask } from './navigatorMask';
import { NavigatorHandle } from './navigatorHandle';
import { BaseModuleInstance, ModuleContext, ModuleInstance } from '../../util/module';
import { BOOLEAN, NUMBER, Validate } from '../../util/validation';
import { LayoutCompleteEvent, LayoutContext } from '../layout/layoutService';
import { BBox } from '../../scene/bbox';

interface Offset {
    offsetX: number;
    offsetY: number;
}

export class Navigator extends BaseModuleInstance implements ModuleInstance {
    private readonly rs = new RangeSelector();

    // Wrappers to allow option application to the scene graph nodes.
    readonly mask = new NavigatorMask(this.rs.mask);
    readonly minHandle = new NavigatorHandle(this.rs.minHandle);
    readonly maxHandle = new NavigatorHandle(this.rs.maxHandle);

    private minHandleDragging = false;
    private maxHandleDragging = false;
    private panHandleOffset = NaN;

    @Validate(BOOLEAN)
    private _enabled = false;
    set enabled(value: boolean) {
        this._enabled = value;

        this.updateGroupVisibility();
    }
    get enabled() {
        return this._enabled;
    }

    set width(value: number) {
        this.rs.width = value;
    }
    get width(): number {
        return this.rs.width;
    }

    set height(value: number) {
        this.rs.height = value;
    }
    get height(): number {
        return this.rs.height;
    }

    @Validate(NUMBER(0))
    margin = 10;

    set min(value: number) {
        this.rs.min = value;
    }
    get min(): number {
        return this.rs.min;
    }

    set max(value: number) {
        this.rs.max = value;
    }
    get max(): number {
        return this.rs.max;
    }

    private _visible: boolean = true;
    set visible(value: boolean) {
        this._visible = value;
        this.updateGroupVisibility();
    }
    get visible() {
        return this._visible;
    }

    private updateGroupVisibility() {
        this.rs.visible = this.enabled && this.visible;
    }

    constructor(private readonly ctx: ModuleContext) {
        super();

        this.rs.onRangeChange = () =>
            this.ctx.zoomManager.updateZoom('navigator', { x: { min: this.rs.min, max: this.rs.max } });

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

        ctx.scene.root!.appendChild(this.rs);
        this.destroyFns.push(() => ctx.scene.root?.removeChild(this.rs));

        this.updateGroupVisibility();
    }

    private layout({ shrinkRect }: LayoutContext) {
        if (this.enabled) {
            const navigatorTotalHeight = this.rs.height + this.margin;
            shrinkRect.shrink(navigatorTotalHeight, 'bottom');
            this.rs.y = shrinkRect.y + shrinkRect.height + this.margin;
        }

        return { shrinkRect };
    }

    private layoutComplete({ series: { rect, visible } }: LayoutCompleteEvent) {
        if (this.enabled && visible) {
            this.rs.x = rect.x;
            this.rs.width = rect.width;
        }
        this.visible = visible;
    }

    public update(): void {
        // Nothing to do!
    }

    private onDragStart(offset: Offset) {
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
            } else if (maxHandle.containsPoint(offsetX, offsetY)) {
                this.maxHandleDragging = true;
            } else if (visibleRange.containsPoint(offsetX, offsetY)) {
                this.panHandleOffset = (offsetX - x) / width - min;
            }
        }
    }

    private onDrag(offset: Offset) {
        if (!this.enabled) {
            return;
        }

        const { rs, panHandleOffset } = this;
        const { x, y, width, height, minHandle, maxHandle } = rs;
        const { offsetX, offsetY } = offset;
        const minX = x + width * rs.min;
        const maxX = x + width * rs.max;
        const visibleRange = new BBox(minX, y, maxX - minX, height);

        const getRatio = () => Math.min(Math.max((offsetX - x) / width, 0), 1);

        if (minHandle.containsPoint(offsetX, offsetY) || maxHandle.containsPoint(offsetX, offsetY)) {
            this.ctx.cursorManager.updateCursor('navigator', 'ew-resize');
        } else if (visibleRange.containsPoint(offsetX, offsetY)) {
            this.ctx.cursorManager.updateCursor('navigator', 'grab');
        } else {
            this.ctx.cursorManager.updateCursor('navigator');
        }

        if (this.minHandleDragging) {
            rs.min = getRatio();
        } else if (this.maxHandleDragging) {
            rs.max = getRatio();
        } else if (!isNaN(panHandleOffset)) {
            const span = rs.max - rs.min;
            const min = Math.min(getRatio() - panHandleOffset, 1 - span);
            if (min <= rs.min) {
                // pan left
                rs.min = min;
                rs.max = rs.min + span;
            } else {
                // pan right
                rs.max = min + span;
                rs.min = rs.max - span;
            }
        }
    }

    private onDragStop() {
        this.stopHandleDragging();
    }

    private stopHandleDragging() {
        this.minHandleDragging = this.maxHandleDragging = false;
        this.panHandleOffset = NaN;
    }
}
