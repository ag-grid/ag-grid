import { _ModuleSupport, _Scene } from 'ag-charts-community';

import { ZoomPanner } from './zoomPanner';
import { ZoomScroller } from './zoomScroller';
import { ZoomSelector } from './zoomSelector';
import { DefinedZoomState } from './zoomTypes';
import { ZoomRect } from './scenes/zoomRect';

const { BOOLEAN, NUMBER, STRING_UNION, Validate } = _ModuleSupport;

export class Zoom extends _ModuleSupport.BaseModuleInstance implements _ModuleSupport.ModuleInstance {
    /**
     * Enable or disable the zoom module.
     */
    @Validate(BOOLEAN)
    public enabled = false;

    /**
     * Enable zooming by scrolling the mouse wheel.
     */
    @Validate(BOOLEAN)
    public enableScrolling = true;

    /**
     * Enable zooming by clicking and dragging out an area to zoom into.
     */
    @Validate(BOOLEAN)
    public enableSelecting = true;

    /**
     * Enable panning when zoomed by holding the pan key while clicking and dragging.
     */
    @Validate(BOOLEAN)
    public enablePanning = true;

    /**
     * The key which toggles panning.
     */
    @Validate(STRING_UNION('alt', 'ctrl', 'meta', 'shift'))
    public panKey: 'alt' | 'ctrl' | 'meta' | 'shift' = 'alt';

    /**
     * The axis on which to enable zooming.
     */
    @Validate(STRING_UNION('xy', 'x', 'y'))
    public axes: 'xy' | 'x' | 'y' = 'xy';

    /**
     * The step size to zoom in when scrolling the mouse wheel.
     */
    @Validate(NUMBER(0, 1))
    public scrollingStep = 0.1;

    /**
     * The minimum proportion of the original chart to display when zooming on the x-axis. Trying to zoom beyond this
     * point will be blocked.
     */
    @Validate(NUMBER(0, 1))
    public minXRatio: number = 0.2;

    /**
     * The minimum proportion of the original chart to display when zooming in on the y-axis. Trying to zoom beyond this
     * point will be blocked.
     */
    @Validate(NUMBER(0, 1))
    public minYRatio: number = 0.2;

    private readonly scene: _Scene.Scene;
    private seriesRect?: _Scene.BBox;

    private readonly zoomManager: _ModuleSupport.ZoomManager;

    private readonly panner?: ZoomPanner;
    private readonly selector?: ZoomSelector;
    private readonly scroller?: ZoomScroller;

    constructor(readonly ctx: _ModuleSupport.ModuleContext) {
        super();

        this.scene = ctx.scene;
        this.zoomManager = ctx.zoomManager;

        // Add interaction listeners
        [
            ctx.interactionManager.addListener('drag', (event) => this.onDrag(event)),
            ctx.interactionManager.addListener('drag-end', () => this.onDragEnd()),
            ctx.interactionManager.addListener('wheel', (event) => this.onWheel(event)),
        ].forEach((s) => this.destroyFns.push(() => ctx.interactionManager.removeListener(s)));

        // Add layout listener
        const layoutHandle = ctx.layoutService.addListener('layout-complete', (event) => this.onLayoutComplete(event));
        this.destroyFns.push(() => ctx.layoutService.removeListener(layoutHandle));

        // Add scrolling zoom method
        if (this.enableScrolling) {
            this.scroller = new ZoomScroller(this.isScalingX(), this.isScalingY(), this.scrollingStep);
        }

        // Add selection zoom method and attach selection rect to root scene
        if (this.enableSelecting) {
            const selectionRect = new ZoomRect();
            this.selector = new ZoomSelector(selectionRect);

            this.scene.root?.appendChild(selectionRect);
            this.destroyFns.push(() => this.scene.root?.removeChild(selectionRect));
        }

        // Add panning while zoomed method
        if (this.enablePanning) {
            this.panner = new ZoomPanner();
        }
    }

    update(): void {
        // TODO: handle any updates from somewhere?
    }

    private onDrag(event: _ModuleSupport.InteractionEvent<'drag'>) {
        const zoom = this.zoomManager.getZoom();
        const isZoomed =
            zoom && zoom.x && zoom.y && (zoom.x.min !== 0 || zoom.x.max !== 1 || zoom.y.min !== 0 || zoom.y.max !== 1);

        if (this.panner && this.seriesRect && isZoomed && this.isPanningKeyPressed(event.sourceEvent as DragEvent)) {
            const newZoom = this.panner.update(event, this.seriesRect, zoom);
            this.updateZoomWithConstraints(newZoom);
            return;
        }

        // If the user stops pressing the panKey but continues dragging, we shouldn't go to selection until they stop
        // dragging and click to start a new drag.
        if (!this.selector || this.panner?.isPanning) return;

        this.selector.update(event, this.minXRatio, this.minYRatio, this.seriesRect, zoom);
    }

    private onDragEnd() {
        if (this.panner?.isPanning) {
            this.panner.stop();
        } else if (this.selector) {
            const newZoom = this.selector.stop(this.seriesRect, this.zoomManager.getZoom());
            this.updateZoomWithConstraints(newZoom);
        }
    }

    private onWheel(event: _ModuleSupport.InteractionEvent<'wheel'>) {
        if (!this.scroller || !this.seriesRect) return;

        const currentZoom = this.zoomManager.getZoom();
        const newZoom = this.scroller.update(event, this.seriesRect, currentZoom);

        this.updateZoomWithConstraints(newZoom);
    }

    private onLayoutComplete({ series: { rect, visible } }: _ModuleSupport.LayoutCompleteEvent) {
        this.seriesRect = rect;
        // TODO: handle visible
    }

    private isPanningKeyPressed(event: MouseEvent) {
        switch (this.panKey) {
            case 'alt':
                return event.altKey;
            case 'ctrl':
                return event.ctrlKey;
            case 'shift':
                return event.shiftKey;
            case 'meta':
                return event.metaKey;
        }
    }

    private isScalingX(): boolean {
        return this.axes === 'x' || this.axes === 'xy';
    }

    private isScalingY(): boolean {
        return this.axes === 'y' || this.axes === 'xy';
    }

    private isWithinSeriesRect(x: number, y: number): boolean {
        const { seriesRect } = this;

        if (!seriesRect) return false;

        return (
            x >= seriesRect.x &&
            x <= seriesRect.x + seriesRect.width &&
            y >= seriesRect.y &&
            y <= seriesRect.y + seriesRect.height
        );
    }

    private updateZoomWithConstraints(zoom: DefinedZoomState) {
        const dx = zoom.x.max - zoom.x.min;
        const dy = zoom.y.max - zoom.y.min;

        // Discard the zoom update if it would take us below either min ratio
        if (dx < this.minXRatio || dy < this.minYRatio) return;

        this.zoomManager.updateZoom('zoom', zoom);
    }
}
