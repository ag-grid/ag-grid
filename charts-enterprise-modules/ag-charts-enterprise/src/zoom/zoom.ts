import type { _Scene } from 'ag-charts-community';
import { _ModuleSupport } from 'ag-charts-community';
import * as ContextMenu from '../context-menu/main';

import { ZoomAxisDragger } from './zoomAxisDragger';
import { ZoomPanner } from './zoomPanner';
import { ZoomScroller } from './zoomScroller';
import { ZoomSelector } from './zoomSelector';
import { constrainZoom, definedZoomState, pointToRatio, scaleZoomCenter, translateZoom } from './zoomTransformers';
import type { DefinedZoomState } from './zoomTypes';
import { ZoomRect } from './scenes/zoomRect';

const { BOOLEAN, NUMBER, STRING_UNION, ChartAxisDirection, ChartUpdateType, Validate } = _ModuleSupport;

const CONTEXT_ZOOM_ACTION_ID = 'zoom-action';
const CONTEXT_PAN_ACTION_ID = 'pan-action';
const CURSOR_ID = 'zoom-cursor';
const TOOLTIP_ID = 'zoom-tooltip';
const ZOOM_ID = 'zoom';

const round = (n: number, sf: number) => {
    const pow = Math.pow(10, sf);
    return Math.round(n * pow) / pow;
};

export class Zoom extends _ModuleSupport.BaseModuleInstance implements _ModuleSupport.ModuleInstance {
    @Validate(BOOLEAN)
    public enabled = true;

    @Validate(BOOLEAN)
    public enableAxisDragging = true;

    @Validate(BOOLEAN)
    public enablePanning = true;

    @Validate(BOOLEAN)
    public enableScrolling = true;

    @Validate(BOOLEAN)
    public enableSelecting = false;

    @Validate(STRING_UNION('alt', 'ctrl', 'meta', 'shift'))
    public panKey: 'alt' | 'ctrl' | 'meta' | 'shift' = 'alt';

    @Validate(STRING_UNION('xy', 'x', 'y'))
    public axes: 'xy' | 'x' | 'y' = 'x';

    @Validate(NUMBER(0, 1))
    public scrollingStep = 0.1;

    @Validate(STRING_UNION('pointer', 'start', 'end'))
    public scrollingPivot: 'pointer' | 'start' | 'end' = 'end';

    @Validate(NUMBER(0, 1))
    public minXRatio: number = 0.2;

    @Validate(NUMBER(0, 1))
    public minYRatio: number = 0.2;

    // Scenes
    private readonly scene: _Scene.Scene;
    private seriesRect?: _Scene.BBox;

    // Module context
    private readonly cursorManager: _ModuleSupport.CursorManager;
    private readonly tooltipManager: _ModuleSupport.TooltipManager;
    private readonly zoomManager: _ModuleSupport.ZoomManager;
    private readonly updateService: _ModuleSupport.UpdateService;

    // Zoom methods
    private readonly axisDragger: ZoomAxisDragger;
    private readonly panner: ZoomPanner;
    private readonly selector: ZoomSelector;
    private readonly scroller: ZoomScroller;

    // State
    private isDragging: boolean = false;
    private draggedAxis?: { id: string; direction: _ModuleSupport.ChartAxisDirection };

    constructor(readonly ctx: _ModuleSupport.ModuleContext) {
        super();

        this.scene = ctx.scene;
        this.cursorManager = ctx.cursorManager;
        this.tooltipManager = ctx.tooltipManager;
        this.zoomManager = ctx.zoomManager;
        this.updateService = ctx.updateService;

        // Add interaction listeners
        [
            ctx.interactionManager.addListener('dblclick', (event) => this.onDoubleClick(event)),
            ctx.interactionManager.addListener('drag', (event) => this.onDrag(event)),
            ctx.interactionManager.addListener('drag-end', () => this.onDragEnd()),
            ctx.interactionManager.addListener('wheel', (event) => this.onWheel(event)),
            ctx.interactionManager.addListener('hover', () => this.onHover()),
        ].forEach((s) => this.destroyFns.push(() => ctx.interactionManager.removeListener(s)));

        const axisClickHandle = ctx.chartEventManager.addListener('axis-hover', (event) => this.onAxisHover(event));
        this.destroyFns.push(() => ctx.chartEventManager.removeListener(axisClickHandle));

        // Add layout listener
        const layoutHandle = ctx.layoutService.addListener('layout-complete', (event) => this.onLayoutComplete(event));
        this.destroyFns.push(() => ctx.layoutService.removeListener(layoutHandle));

        // Add dragging axis zoom method
        this.axisDragger = new ZoomAxisDragger();

        // Add panning while zoomed method
        this.panner = new ZoomPanner();

        // Add selection zoom method and attach selection rect to root scene
        const selectionRect = new ZoomRect();
        this.selector = new ZoomSelector(selectionRect);

        this.scene.root?.appendChild(selectionRect);
        this.destroyFns.push(() => this.scene.root?.removeChild(selectionRect));

        // Add scrolling zoom method
        this.scroller = new ZoomScroller();

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

    private onDoubleClick(event: _ModuleSupport.InteractionEvent<'dblclick'>) {
        if (!this.seriesRect?.containsPoint(event.offsetX, event.offsetY)) {
            return;
        }

        const newZoom = { x: { min: 0, max: 1 }, y: { min: 0, max: 1 } };
        this.updateZoom(newZoom);
    }

    private onDrag(event: _ModuleSupport.InteractionEvent<'drag'>) {
        const sourceEvent = event.sourceEvent as DragEvent;

        const isPrimaryMouseButton = sourceEvent.button === 0;
        if (!isPrimaryMouseButton) return;

        this.isDragging = true;
        this.tooltipManager.updateTooltip(TOOLTIP_ID);

        const zoom = definedZoomState(this.zoomManager.getZoom());

        if (this.enableAxisDragging && this.seriesRect && this.draggedAxis) {
            const { id: axisId, direction } = this.draggedAxis;
            const axisZoom = this.zoomManager.getAxisZoom(axisId) ?? { min: 0, max: 1 };
            const newZoom = this.axisDragger.update(event, direction, this.seriesRect, zoom, axisZoom);
            this.updateAxisZoom(axisId, direction, newZoom);
            return;
        }

        // Allow panning if either selection is disabled or the panning key is pressed.
        if (this.enablePanning && this.seriesRect && (!this.enableSelecting || this.isPanningKeyPressed(sourceEvent))) {
            const newZooms = this.panner.update(event, this.seriesRect, this.zoomManager.getAxisZooms());
            for (const [axisId, { direction, zoom: newZoom }] of Object.entries(newZooms)) {
                this.updateAxisZoom(axisId, direction, newZoom);
            }
            this.cursorManager.updateCursor(CURSOR_ID, 'grabbing');
            return;
        }

        // If the user stops pressing the panKey but continues dragging, we shouldn't go to selection until they stop
        // dragging and click to start a new drag.
        if (
            !this.enableSelecting ||
            this.isPanningKeyPressed(sourceEvent) ||
            this.panner.isPanning ||
            this.isMinZoom(zoom)
        ) {
            return;
        }

        this.selector.update(
            event,
            this.minXRatio,
            this.minYRatio,
            this.isScalingX(),
            this.isScalingY(),
            this.seriesRect,
            zoom
        );

        this.updateService.update(ChartUpdateType.PERFORM_LAYOUT);
    }

    private onDragEnd() {
        // Stop single clicks from triggering drag end and resetting the zoom
        if (!this.isDragging) return;

        const zoom = definedZoomState(this.zoomManager.getZoom());

        this.cursorManager.updateCursor(CURSOR_ID);

        if (this.enableAxisDragging && this.axisDragger.isAxisDragging) {
            this.axisDragger.stop();
            this.draggedAxis = undefined;
        } else if (this.enablePanning && this.panner.isPanning) {
            this.panner.stop();
        } else if (this.enableSelecting && !this.isMinZoom(zoom)) {
            const newZoom = this.selector.stop(this.seriesRect, zoom);
            this.updateZoom(newZoom);
        }

        this.isDragging = false;
        this.tooltipManager.removeTooltip(TOOLTIP_ID);
    }

    private onWheel(event: _ModuleSupport.InteractionEvent<'wheel'>) {
        if (!this.enableScrolling || !this.seriesRect) return;

        event.consume();
        event.sourceEvent.preventDefault();

        const currentZoom = this.zoomManager.getZoom();
        const newZoom = this.scroller.update(
            event,
            this.scrollingStep,
            this.scrollingPivot,
            this.isScalingX(),
            this.isScalingY(),
            this.seriesRect,
            currentZoom
        );

        this.updateZoom(newZoom);
    }

    private onHover() {
        this.draggedAxis = undefined;
        this.cursorManager.updateCursor(CURSOR_ID);
    }

    private onAxisHover(event: _ModuleSupport.AxisHoverChartEvent) {
        if (!this.enableAxisDragging) return;

        this.draggedAxis = {
            id: event.axisId,
            direction: event.direction,
        };

        this.cursorManager.updateCursor(
            CURSOR_ID,
            event.direction === ChartAxisDirection.X ? 'ew-resize' : 'ns-resize'
        );
    }

    private onLayoutComplete({ series: { paddedRect } }: _ModuleSupport.LayoutCompleteEvent) {
        this.seriesRect = paddedRect;
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

        newZoom = scaleZoomCenter(
            newZoom,
            this.isScalingX() ? this.minXRatio : 1,
            this.isScalingY() ? this.minYRatio : 1
        );
        newZoom = translateZoom(newZoom, zoom.x.min - origin.x + scaledOriginX, zoom.y.min - origin.y + scaledOriginY);

        this.updateZoom(constrainZoom(newZoom));
    }

    private onContextMenuPanToHere({ event }: ContextMenu.ContextMenuActionParams) {
        if (!this.seriesRect || !event || !event.target) return;

        const zoom = definedZoomState(this.zoomManager.getZoom());
        const origin = pointToRatio(this.seriesRect, event.clientX, event.clientY);

        const scaleX = zoom.x.max - zoom.x.min;
        const scaleY = zoom.y.max - zoom.y.min;

        const scaledOriginX = origin.x * scaleX;
        const scaledOriginY = origin.y * scaleY;

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
        const minXCheckValue = this.enableScrolling
            ? (zoom.x.max - zoom.x.min) * (1 - this.scrollingStep)
            : Math.round((zoom.x.max - zoom.x.min) * 100) / 100;

        const minYCheckValue = this.enableScrolling
            ? (zoom.y.max - zoom.y.min) * (1 - this.scrollingStep)
            : Math.round((zoom.y.max - zoom.y.min) * 100) / 100;

        const isMinXZoom = !this.isScalingX() || minXCheckValue <= this.minXRatio;
        const isMinYZoom = !this.isScalingY() || minYCheckValue <= this.minXRatio;

        return isMinXZoom && isMinYZoom;
    }

    private isMaxZoom(zoom: DefinedZoomState): boolean {
        return zoom.x.min === 0 && zoom.x.max === 1 && zoom.y.min === 0 && zoom.y.max === 1;
    }

    private updateZoom(zoom: DefinedZoomState) {
        const dx = round(zoom.x.max - zoom.x.min, 2);
        const dy = round(zoom.y.max - zoom.y.min, 2);

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

        this.zoomManager.updateZoom(ZOOM_ID, zoom);
    }

    private updateAxisZoom(
        axisId: string,
        direction: _ModuleSupport.ChartAxisDirection,
        partialZoom: _ModuleSupport.ZoomState | undefined
    ) {
        if (!partialZoom) return;

        partialZoom.min = round(partialZoom.min, 3);
        partialZoom.max = round(partialZoom.max, 3);

        const d = round(partialZoom.max - partialZoom.min, 2);

        // Discard the zoom update if it would take us below either min ratio
        if ((direction === ChartAxisDirection.X && d < this.minXRatio) || d < this.minYRatio) {
            return;
        }

        this.zoomManager.updateAxisZoom(ZOOM_ID, axisId, partialZoom);
    }
}
