import { _ModuleSupport, _Scene } from 'ag-charts-community';
import * as ContextMenu from '@ag-charts-enterprise/context-menu';

import { ZoomPanner } from './zoomPanner';
import { ZoomScroller } from './zoomScroller';
import { ZoomSelector } from './zoomSelector';
import { constrainZoom, definedZoomState, pointToRatio, scaleZoomCenter, translateZoom } from './zoomTransformers';
import { DefinedZoomState } from './zoomTypes';
import { ZoomRect } from './scenes/zoomRect';

declare global {
    interface EventTarget {
        readonly clientHeight: number;
        readonly clientWidth: number;
    }
}

const { BOOLEAN, NUMBER, STRING_UNION, Validate } = _ModuleSupport;

const CONTEXT_ZOOM_ACTION_ID = 'zoom-action';
const CONTEXT_PAN_ACTION_ID = 'pan-action';

export class Zoom extends _ModuleSupport.BaseModuleInstance implements _ModuleSupport.ModuleInstance {
    @Validate(BOOLEAN)
    public enabled = true;

    @Validate(BOOLEAN)
    public enableScrolling = true;

    @Validate(BOOLEAN)
    public enableSelecting = true;

    @Validate(BOOLEAN)
    public enablePanning = true;

    @Validate(STRING_UNION('alt', 'ctrl', 'meta', 'shift'))
    public panKey: 'alt' | 'ctrl' | 'meta' | 'shift' = 'alt';

    @Validate(STRING_UNION('xy', 'x', 'y'))
    public axes: 'xy' | 'x' | 'y' = 'xy';

    @Validate(NUMBER(0, 1))
    public scrollingStep = 0.1;

    @Validate(NUMBER(0, 1))
    public minXRatio: number = 0.2;

    @Validate(NUMBER(0, 1))
    public minYRatio: number = 0.2;

    // Scenes
    private readonly scene: _Scene.Scene;
    private seriesRect?: _Scene.BBox;

    // Module context
    private readonly zoomManager: _ModuleSupport.ZoomManager;
    private readonly updateService: _ModuleSupport.UpdateService;

    // Zoom methods
    private readonly panner: ZoomPanner;
    private readonly selector: ZoomSelector;
    private readonly scroller: ZoomScroller;

    // State
    private isDragging: boolean = false;

    constructor(readonly ctx: _ModuleSupport.ModuleContext) {
        super();

        this.scene = ctx.scene;
        this.zoomManager = ctx.zoomManager;
        this.updateService = ctx.updateService;

        // Add interaction listeners
        [
            ctx.interactionManager.addListener('dblclick', (event) => this.onDoubleClick(event)),
            ctx.interactionManager.addListener('drag', (event) => this.onDrag(event)),
            ctx.interactionManager.addListener('drag-end', () => this.onDragEnd()),
            ctx.interactionManager.addListener('wheel', (event) => this.onWheel(event)),
        ].forEach((s) => this.destroyFns.push(() => ctx.interactionManager.removeListener(s)));

        // Add layout listener
        const layoutHandle = ctx.layoutService.addListener('layout-complete', (event) => this.onLayoutComplete(event));
        this.destroyFns.push(() => ctx.layoutService.removeListener(layoutHandle));

        // Add scrolling zoom method
        this.scroller = new ZoomScroller();

        // Add selection zoom method and attach selection rect to root scene
        const selectionRect = new ZoomRect();
        this.selector = new ZoomSelector(selectionRect);

        this.scene.root?.appendChild(selectionRect);
        this.destroyFns.push(() => this.scene.root?.removeChild(selectionRect));

        // Add panning while zoomed method
        this.panner = new ZoomPanner();

        // Add context menu zoom actions
        ContextMenu._registerDefaultAction(
            CONTEXT_ZOOM_ACTION_ID,
            'Zoom to here',
            (params: ContextMenu.ContextMenuActionParams) => this.onContextMenuZoomToHere(params)
        );
        ContextMenu._registerDefaultAction(
            CONTEXT_PAN_ACTION_ID,
            'Pan to here',
            (params: ContextMenu.ContextMenuActionParams) => this.onContextMenuPanToHere(params)
        );
        ContextMenu._disableAction(CONTEXT_PAN_ACTION_ID);
    }

    update(): void {
        // TODO: handle any updates from somewhere?
    }

    private onDoubleClick(event: _ModuleSupport.InteractionEvent<'dblclick'>) {
        if (!this.seriesRect?.containsPoint(event.offsetX, event.offsetY)) {
            return;
        }

        const newZoom = { x: { min: 0, max: 1 }, y: { min: 0, max: 1 } };
        // this.updateZoomWithConstraints(newZoom);
    }

    private onDrag(event: _ModuleSupport.InteractionEvent<'drag'>) {
        const isWithinSeriesRect = this.seriesRect?.containsPoint(event.offsetX, event.offsetY);
        const isPrimaryMouseButton = (event.sourceEvent as MouseEvent).button === 0;

        if (!isWithinSeriesRect || !isPrimaryMouseButton) return;

        this.isDragging = true;

        const zoom = this.zoomManager.getZoom();
        const isZoomed =
            zoom && zoom.x && zoom.y && (zoom.x.min !== 0 || zoom.x.max !== 1 || zoom.y.min !== 0 || zoom.y.max !== 1);

        if (
            this.enablePanning &&
            this.seriesRect &&
            isZoomed &&
            this.isPanningKeyPressed(event.sourceEvent as DragEvent)
        ) {
            const newZoom = this.panner.update(event, this.seriesRect, zoom);
            this.updateZoom(newZoom);
            return;
        }

        // If the user stops pressing the panKey but continues dragging, we shouldn't go to selection until they stop
        // dragging and click to start a new drag.
        if (!this.enableSelecting || this.panner.isPanning) return;

        this.selector.update(
            event,
            this.minXRatio,
            this.minYRatio,
            this.isScalingX(),
            this.isScalingY(),
            this.seriesRect,
            zoom
        );
        this.updateService.update(_ModuleSupport.ChartUpdateType.PERFORM_LAYOUT);
    }

    private onDragEnd() {
        // Stop single clicks from triggering drag end and resetting the zoom
        if (!this.isDragging) return;

        if (this.enablePanning && this.panner.isPanning) {
            this.panner.stop();
        } else if (this.enableSelecting) {
            const newZoom = this.selector.stop(this.seriesRect, this.zoomManager.getZoom());
            this.updateZoom(newZoom);
        }

        this.isDragging = false;
    }

    private onWheel(event: _ModuleSupport.InteractionEvent<'wheel'>) {
        if (!this.enableScrolling || !this.seriesRect) return;

        const currentZoom = this.zoomManager.getZoom();
        const newZoom = this.scroller.update(
            event,
            this.scrollingStep,
            this.isScalingX(),
            this.isScalingY(),
            this.seriesRect,
            currentZoom
        );

        this.updateZoom(newZoom);
    }

    private onLayoutComplete({ series: { rect } }: _ModuleSupport.LayoutCompleteEvent) {
        this.seriesRect = rect;
    }

    private onContextMenuZoomToHere({ event }: ContextMenu.ContextMenuActionParams) {
        if (!this.seriesRect || !event || !event.target) return;

        const zoom = definedZoomState(this.zoomManager.getZoom());
        const origin = pointToRatio(this.seriesRect, event.clientX, event.clientY);

        const scaledOriginX = origin.x * (zoom.x.max - zoom.x.min);
        const scaledOriginY = origin.y * (zoom.y.max - zoom.y.min);

        let newZoom = {
            x: { min: origin.x - 0.5, max: origin.x + 0.5 },
            y: { min: origin.y - 0.5, max: origin.y + 0.5 },
        };

        newZoom = scaleZoomCenter(newZoom, this.minXRatio, this.minYRatio);
        newZoom = translateZoom(newZoom, zoom.x.min - origin.x + scaledOriginX, zoom.y.min - origin.y + scaledOriginY);

        this.updateZoom(constrainZoom(newZoom));
    }

    private onContextMenuPanToHere({ event }: ContextMenu.ContextMenuActionParams) {
        if (!this.seriesRect || !event || !event.target) return;

        const zoom = definedZoomState(this.zoomManager.getZoom());
        const origin = pointToRatio(this.seriesRect, event.clientX, event.clientY);

        const scaleX = zoom.x.max - zoom.x.min;
        const scaleY = zoom.y.max - zoom.y.min;

        const scaledOriginX = origin.x * (zoom.x.max - zoom.x.min);
        const scaledOriginY = origin.y * (zoom.y.max - zoom.y.min);

        let newZoom = {
            x: { min: origin.x - 0.5, max: origin.x + 0.5 },
            y: { min: origin.y - 0.5, max: origin.y + 0.5 },
        };

        newZoom = scaleZoomCenter(newZoom, scaleX, scaleY);
        newZoom = translateZoom(newZoom, zoom.x.min - origin.x + scaledOriginX, zoom.y.min - origin.y + scaledOriginY);

        this.updateZoom(constrainZoom(newZoom));
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

    private isMinZoom(zoom: DefinedZoomState): boolean {
        return (
            Math.round((zoom.x.max - zoom.x.min) * 100) / 100 <= this.minXRatio &&
            Math.round((zoom.y.max - zoom.y.min) * 100) / 100 <= this.minYRatio
        );
    }

    private isMaxZoom(zoom: DefinedZoomState): boolean {
        return zoom.x.min === 0 && zoom.x.max === 1 && zoom.y.min === 0 && zoom.y.max === 1;
    }

    private updateZoom(zoom: DefinedZoomState) {
        const dx = Math.round((zoom.x.max - zoom.x.min) * 100) / 100;
        const dy = Math.round((zoom.y.max - zoom.y.min) * 100) / 100;

        // Discard the zoom update if it would take us below either min ratio
        if (dx < this.minXRatio || dy < this.minYRatio) {
            ContextMenu._disableAction(CONTEXT_ZOOM_ACTION_ID);
            ContextMenu._enableAction(CONTEXT_PAN_ACTION_ID);
            return;
        }

        if (this.isMinZoom(zoom)) {
            ContextMenu._disableAction(CONTEXT_ZOOM_ACTION_ID);
        } else {
            ContextMenu._enableAction(CONTEXT_ZOOM_ACTION_ID);
        }

        if (this.isMaxZoom(zoom)) {
            ContextMenu._disableAction(CONTEXT_PAN_ACTION_ID);
        } else {
            ContextMenu._enableAction(CONTEXT_PAN_ACTION_ID);
        }

        this.zoomManager.updateZoom('zoom', zoom);
    }
}
