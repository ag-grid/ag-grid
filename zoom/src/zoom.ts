import { _ModuleSupport, _Scene } from 'ag-charts-community';
import { ZoomCoords, ZoomSelector } from './zoomSelector';

interface DefinedZoomState extends _ModuleSupport.AxisZoomState {
    x: { min: number; max: number };
    y: { min: number; max: number };
}

const unitZoomState: () => DefinedZoomState = () => ({
    x: { min: 0, max: 1 },
    y: { min: 0, max: 1 },
});

const constrain = (value: number, min = 0, max = 1) => Math.max(min, Math.min(max, value));

export class Zoom extends _ModuleSupport.BaseModuleInstance implements _ModuleSupport.ModuleInstance {
    private readonly scene: _Scene.Scene;
    private readonly zoomManager: _ModuleSupport.ZoomManager;

    private readonly selector: ZoomSelector;
    private seriesRect: _Scene.BBox;

    // @_ModuleSupport.Validate(_ModuleSupport.BOOLEAN)
    public enabled = false;

    /**
     * The axis on which to enable zooming.
     */
    // @Validate
    public axes: 'xy' | 'x' | 'y' = 'xy';

    /**
     * The step size to zoom in when scrolling the mouse wheel.
     */
    // @Validate
    public wheelStep = 0.1;

    /**
     * The minimum number of nodes to show when zooming on the x-axis
     */
    // @Validate
    public minXNodes?: number;

    /**
     * The minimum number of nodes to show when zooming on the y-axis
     */
    // @Validate
    public minYNodes?: number;

    constructor(readonly ctx: _ModuleSupport.ModuleContext) {
        super();

        this.scene = ctx.scene;
        this.zoomManager = ctx.zoomManager;

        this.selector = new ZoomSelector((coords: ZoomCoords): void => this.handleSelectionChange(coords));

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

        // Attach to root scene
        this.scene.root?.appendChild(this.selector);
        this.destroyFns.push(() => this.scene.root?.removeChild(this.selector));
    }

    update(): void {
        // TODO: handle any updates from somewhere?
    }

    private handleSelectionChange(coords: ZoomCoords) {
        if (!this.seriesRect) return;

        const min = this.pointToRatio(coords.x1, coords.y1);
        const max = this.pointToRatio(coords.x2, coords.y2);

        const zoomState: DefinedZoomState = {
            x: { min: min.x, max: max.x },
            y: { min: max.y, max: min.y }, // TODO: zoom state is inverse of the chart coords system
        };

        this.zoomManager.updateZoom('zoom', zoomState);
    }

    private onDrag(event: _ModuleSupport.InteractionEvent<'drag'>) {
        if (this.isWithinSeriesRect(event.offsetX, event.offsetY)) {
            this.selector.update(event.offsetX, event.offsetY);
        } else {
            this.selector.reset();
        }
    }

    private onDragEnd() {
        this.selector.stop();
    }

    private onWheel(event: _ModuleSupport.InteractionEvent<'wheel'>) {
        const currentZoom = this.zoomManager.getZoom();
        const oldZoom: DefinedZoomState = {
            x: { min: currentZoom?.x?.min ?? 0, max: currentZoom?.x?.max ?? 1 },
            y: { min: currentZoom?.y?.min ?? 0, max: currentZoom?.y?.max ?? 1 },
        };

        const sourceEvent = event.sourceEvent as WheelEvent;

        // Translate the cursor position to coordinates as a ratio of 0 to 1
        const origin = this.pointToRatio(sourceEvent.clientX, sourceEvent.clientY);

        // Scale the zoom bounding box
        const dir = sourceEvent.deltaY < 0 ? -1 : 1;
        const zoomFactor = 1 + this.wheelStep * dir;
        const aspectRatio = (oldZoom.y.max - oldZoom.y.min) / (oldZoom.x.max - oldZoom.x.min);

        const xFactor = this.isScalingX() ? zoomFactor : 1;
        const yFactor = this.isScalingY() ? zoomFactor * aspectRatio : 1;

        let newZoom = this.scaleZoom(oldZoom, xFactor, yFactor);

        // Translate the zoom bounding box such that the cursor remains over the same position as before
        const scaledOriginX = origin.x * (1 - (oldZoom.x.max - oldZoom.x.min - (newZoom.x.max - newZoom.x.min)));
        const scaledOriginY = origin.y * (1 - (oldZoom.y.max - oldZoom.y.min - (newZoom.y.max - newZoom.y.min)));

        const translateX = this.isScalingX() ? origin.x - scaledOriginX : 0;
        const translateY = this.isScalingY() ? origin.y - scaledOriginY : 0;

        newZoom = this.translateZoom(newZoom, translateX, translateY);

        // Constrain the zoom bounding box to remain within the ultimate bounds of 0,0 and 1,1
        newZoom = this.constrainZoom(newZoom);

        this.zoomManager.updateZoom('zoom', newZoom);
    }

    private onLayoutComplete({ series: { rect, visible } }: _ModuleSupport.LayoutCompleteEvent) {
        this.seriesRect = rect;
        // TODO: handle visible
    }

    /**
     * Calculate the position on the series rect as a ratio from the top left corner. Invert the ratio on the y-axis to
     * cater for conflicting direction between screen and chart axis systems. Constrains the point to the series
     * rect so the zoom is pinned to the edges if the point is over the legends, axes, etc.
     */
    private pointToRatio(x: number, y: number): { x: number; y: number } {
        if (!this.seriesRect) return { x: 0, y: 0 };

        const constrainedX = constrain(x - this.seriesRect.x, 0, this.seriesRect.x + this.seriesRect.width);
        const constrainedY = constrain(y - this.seriesRect.y, 0, this.seriesRect.y + this.seriesRect.height);

        const rx = (1 / this.seriesRect.width) * constrainedX;
        const ry = 1 - (1 / this.seriesRect.height) * constrainedY;

        return { x: constrain(rx), y: constrain(ry) };
    }

    /**
     * Translate a zoom bounding box by shifting all points by the given x & y amounts.
     */
    private translateZoom(zoom: DefinedZoomState, x: number, y: number): DefinedZoomState {
        return {
            x: { min: zoom.x.min + x, max: zoom.x.max + x },
            y: { min: zoom.y.min + y, max: zoom.y.max + y },
        };
    }

    /**
     * Scale a zoom bounding box from the top left corner.
     */
    private scaleZoom(zoom: DefinedZoomState, sx: number, sy: number): DefinedZoomState {
        const dx = zoom.x.max - zoom.x.min;
        const dy = zoom.y.max - zoom.y.min;

        return {
            x: { min: zoom.x.min, max: zoom.x.min + dx * sx },
            y: { min: zoom.y.min, max: zoom.y.min + dy * sy },
        };
    }

    /**
     * Constrain a zoom bounding box such that no corner exceeds an edge while maintaining the same width and height.
     */
    private constrainZoom(zoom: DefinedZoomState): DefinedZoomState {
        const after = unitZoomState();

        const dx = zoom.x.max - zoom.x.min;

        const xMin = zoom.x.min;
        const xMax = zoom.x.max;

        after.x.min = xMax > 1 ? 1 - dx : xMin;
        after.x.max = xMin < 0 ? dx : xMax;

        after.x.min = Math.max(0, after.x.min);
        after.x.max = Math.min(1, after.x.max);

        const dy = zoom.y.max - zoom.y.min;

        const yMin = zoom.y.min;
        const yMax = zoom.y.max;

        after.y.min = yMax > 1 ? 1 - dy : yMin;
        after.y.max = yMin < 0 ? dy : yMax;

        after.y.min = Math.max(0, after.y.min);
        after.y.max = Math.min(1, after.y.max);

        return after;
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
