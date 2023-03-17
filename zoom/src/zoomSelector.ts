import { _ModuleSupport, _Scene } from 'ag-charts-community';

import { constrainZoom, definedZoomState, pointToRatio, scaleZoom, translateZoom } from './zoomTransformers';
import { DefinedZoomState, ZoomCoords } from './zoomTypes';
import { ZoomRect } from './scenes/zoomRect';

export class ZoomSelector {
    private rect: ZoomRect;
    private coords?: ZoomCoords;

    constructor(rect: ZoomRect) {
        this.rect = rect;
        this.rect.visible = false;
    }

    update(
        event: _ModuleSupport.InteractionEvent<'drag' | 'hover'>,
        minXRatio: number,
        minYRatio: number,
        bbox?: _Scene.BBox,
        currentZoom?: _ModuleSupport.AxisZoomState
    ): void {
        this.rect.visible = true;

        this.updateCoords(event.offsetX, event.offsetY, minXRatio, minYRatio, bbox, currentZoom);
        this.updateRect(bbox);
    }

    stop(bbox?: _Scene.BBox, currentZoom?: _ModuleSupport.AxisZoomState): DefinedZoomState {
        let zoom = definedZoomState();

        if (!bbox) return zoom;

        if (this.coords) {
            zoom = this.createZoomFromCoords2(bbox, currentZoom);
        }

        this.reset();

        return zoom;
    }

    reset(): void {
        this.coords = undefined;
        this.rect.visible = false;
        this.rect.clipPath = undefined;
    }

    private updateCoords(
        x: number,
        y: number,
        minXRatio: number,
        minYRatio: number,
        bbox?: _Scene.BBox,
        currentZoom?: _ModuleSupport.AxisZoomState
    ): void {
        if (!this.coords) {
            this.coords = { x1: x, y1: y, x2: x, y2: y };
            return;
        }

        this.coords.x2 = x;
        this.coords.y2 = y;

        if (!bbox) return;

        // Ensure the selection is always at the same aspect ratio, using the width as the source of truth for the size
        // of the selection and limit it to the minimum dimensions.
        const zoom = definedZoomState(currentZoom);
        const normal = this.getNormalisedDimensions();

        const aspectRatio = bbox.width / bbox.height;

        const scaleX = zoom.x.max - zoom.x.min;
        const scaleY = zoom.y.max - zoom.y.min;

        const xRatio = minXRatio / scaleX;
        const yRatio = minYRatio / scaleY;

        if (normal.width / bbox.width < xRatio) {
            if (this.coords.x2 < this.coords.x1) {
                this.coords.x2 = this.coords.x1 - bbox.width * xRatio;
            } else {
                this.coords.x2 = this.coords.x1 + bbox.width * xRatio;
            }
        }

        if (this.coords.y2 < this.coords.y1) {
            this.coords.y2 = Math.min(
                this.coords.y1 - normal.width / aspectRatio,
                this.coords.y1 - bbox.height * yRatio
            );
        } else {
            this.coords.y2 = Math.max(
                this.coords.y1 + normal.width / aspectRatio,
                this.coords.y1 + bbox.height * yRatio
            );
        }
    }

    private updateRect(bbox?: _Scene.BBox): void {
        if (!bbox) return;

        const { rect } = this;
        const { x, y, width, height } = this.getNormalisedDimensions();

        rect.x = bbox.x;
        rect.y = bbox.y;
        rect.width = bbox.width;
        rect.height = bbox.height;

        rect.clipMode = 'punch-out';
        if (rect.clipPath) {
            rect.clipPath.clear();
        } else {
            rect.clipPath = new _ModuleSupport.Path2D();
        }

        rect.clipPath.moveTo(x, y);
        rect.clipPath.lineTo(x + width, y);
        rect.clipPath.lineTo(x + width, y + height);
        rect.clipPath.lineTo(x, y + height);
        rect.clipPath.lineTo(x, y);
        rect.clipPath.closePath();
    }

    private createZoomFromCoords2(bbox: _Scene.BBox, currentZoom?: _ModuleSupport.AxisZoomState) {
        const oldZoom = definedZoomState(currentZoom);
        const normal = this.getNormalisedDimensions();

        // Convert the top-left position to coordinates as a ratio of 0 to 1 of the current zoom
        const origin = pointToRatio(bbox, normal.x, normal.y + normal.height);

        // Scale the zoom bounding box
        const zoomFactor = normal.width / bbox.width;
        let newZoom = scaleZoom(oldZoom, zoomFactor, zoomFactor);

        // Translate the zoom bounding box by an amount scaled to the old zoom
        const translateX = origin.x * (oldZoom.x.max - oldZoom.x.min);
        const translateY = origin.y * (oldZoom.y.max - oldZoom.y.min);
        newZoom = translateZoom(newZoom, translateX, translateY);

        // Constrain the zoom bounding box to remain within the ultimate bounds of 0,0 and 1,1
        newZoom = constrainZoom(newZoom);

        return newZoom;
    }

    private getNormalisedDimensions() {
        const { x1 = 0, y1 = 0, x2 = 0, y2 = 0 } = this.coords ?? {};

        // Ensure we create a box starting at the top left corner
        const x = x1 <= x2 ? x1 : x2;
        const y = y1 <= y2 ? y1 : y2;
        const width = x1 <= x2 ? x2 - x1 : x1 - x2;
        const height = y1 <= y2 ? y2 - y1 : y1 - y2;

        return { x, y, width, height };
    }
}
