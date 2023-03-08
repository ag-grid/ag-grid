import { _ModuleSupport, _Scene } from 'ag-charts-community';

import { ZoomSelector } from './zoomSelector';
import { ZoomScroller } from './zoomScroller';
import { ZoomPanner } from './zoomPanner';
import { pointToRatio } from './zoomTransformers';
import { DefinedZoomState, ZoomCoords } from './zoomTypes';
import { ZoomRect } from './scenes/zoomRect';

const { BOOLEAN, OPT_BOOLEAN, OPT_NUMBER, STRING_UNION, Validate } = _ModuleSupport;

export class Zoom extends _ModuleSupport.BaseModuleInstance implements _ModuleSupport.ModuleInstance {
    /**
     * Enable or disable the zoom module.
     */
    @Validate(BOOLEAN)
    public enabled = false;

    /**
     * Enable zooming by scrolling the mouse wheel.
     */
    @Validate(OPT_BOOLEAN)
    public enableScrolling = true;

    /**
     * Enable zooming by clicking and dragging out an area to zoom into.
     */
    @Validate(OPT_BOOLEAN)
    public enableSelecting = true;

    /**
     * Enable panning when zoomed by holding the pan key while clicking and dragging.
     */
    @Validate(OPT_BOOLEAN)
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
    @Validate(OPT_NUMBER(0, 1))
    public scrollingStep = 0.1;

    /**
     * The minimum number of nodes to show when zooming on the x-axis
     */
    @Validate(OPT_NUMBER(1))
    public minXNodes?: number;

    /**
     * The minimum number of nodes to show when zooming on the y-axis
     */
    @Validate(OPT_NUMBER(1))
    public minYNodes?: number;

    private readonly scene: _Scene.Scene;
    private seriesRect: _Scene.BBox;

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

        // Add layout listeners
        [ctx.layoutService.addListener('layout-complete', (event) => this.onLayoutComplete(event))].forEach((s) =>
            this.destroyFns.push(() => ctx.layoutService.removeListener(s))
        );

        // Add scrolling zoom method
        if (this.enableScrolling) {
            this.scroller = new ZoomScroller(this.isScalingX(), this.isScalingY(), this.scrollingStep);
        }

        // Add selection zoom method and attach selection rect to root scene
        if (this.enableSelecting) {
            const selectionRect = new ZoomRect();
            this.selector = new ZoomSelector(selectionRect, (coords: ZoomCoords) => this.handleSelectionChange(coords));

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

    private handleSelectionChange(coords: ZoomCoords) {
        if (!this.seriesRect) return;

        const min = pointToRatio(this.seriesRect, coords.x1, coords.y1);
        const max = pointToRatio(this.seriesRect, coords.x2, coords.y2);

        const zoomState: DefinedZoomState = {
            x: { min: min.x, max: max.x },
            y: { min: max.y, max: min.y }, // TODO: zoom state is inverse of the chart coords system
        };

        this.zoomManager.updateZoom('zoom', zoomState);
    }

    private onDrag(event: _ModuleSupport.InteractionEvent<'drag'>) {
        const zoom = this.zoomManager.getZoom();
        const isZoomed =
            zoom && zoom.x && zoom.y && (zoom.x.min !== 0 || zoom.x.max !== 1 || zoom.y.min !== 0 || zoom.y.max);

        if (this.panner && isZoomed && this.isPanningKeyPressed(event.sourceEvent as DragEvent)) {
            const newZoom = this.panner.update(event.offsetX, event.offsetY, this.seriesRect, zoom);
            this.zoomManager.updateZoom('zoom', newZoom);

            return;
        }

        if (!this.selector || this.panner?.isPanning) return;

        if (this.isWithinSeriesRect(event.offsetX, event.offsetY)) {
            this.selector.update(event.offsetX, event.offsetY);
        } else {
            this.selector.reset();
        }
    }

    private onDragEnd() {
        this.panner?.stop();

        if (!this.selector) return;

        this.selector.stop();
    }

    private onWheel(event: _ModuleSupport.InteractionEvent<'wheel'>) {
        if (!this.scroller) return;

        const currentZoom = this.zoomManager.getZoom();
        const newZoom = this.scroller.update(event, this.seriesRect, currentZoom);

        this.zoomManager.updateZoom('zoom', newZoom);
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

    private isWithinSeriesRect(x: number, y: number) {
        const { seriesRect } = this;
        return (
            x >= seriesRect.x &&
            x <= seriesRect.x + seriesRect.width &&
            y >= seriesRect.y &&
            y <= seriesRect.y + seriesRect.height
        );
    }
}
