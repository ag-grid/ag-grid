import { _ModuleSupport, _Scene } from 'ag-charts-community';

import { definedZoomState, pointToRatio, constrainZoom, translateZoom } from './zoomTransformers';
import { ZoomCoords } from './zoomTypes';

export class ZoomPanner {
    public isPanning: boolean = false;

    private coords?: ZoomCoords;

    update(x: number, y: number, bbox: _Scene.BBox, zoom: _ModuleSupport.AxisZoomState) {
        this.isPanning = true;

        this.updateCoords(x, y);
        return this.translate(bbox, zoom);
    }

    stop() {
        this.isPanning = false;
        this.coords = undefined;
    }

    private updateCoords(x: number, y: number): void {
        if (!this.coords) {
            this.coords = { x1: x, y1: y, x2: x, y2: y };
        } else {
            this.coords.x1 = this.coords.x2;
            this.coords.y1 = this.coords.y2;
            this.coords.x2 = x;
            this.coords.y2 = y;
        }
    }

    private translate(bbox: _Scene.BBox, currentZoom: _ModuleSupport.AxisZoomState) {
        const { x1 = 0, y1 = 0, x2 = 0, y2 = 0 } = this.coords ?? {};

        const dx = x1 <= x2 ? x2 - x1 : x1 - x2;
        const dy = y1 <= y2 ? y2 - y1 : y1 - y2;

        const offset = pointToRatio(bbox, bbox.x + dx, bbox.y + bbox.height - dy);

        const offsetX = x1 <= x2 ? -offset.x : offset.x;
        const offsetY = y1 <= y2 ? offset.y : -offset.y;

        const zoom = definedZoomState(currentZoom);
        const scaleX = zoom.x.max - zoom.x.min;
        const scaleY = zoom.y.max - zoom.y.min;

        return constrainZoom(translateZoom(zoom, offsetX * scaleX, offsetY * scaleY));
    }
}
