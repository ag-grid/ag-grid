import { _ModuleSupport, _Scene } from 'ag-charts-community';

import { constrainZoom, definedZoomState, pointToRatio } from './zoomTransformers';
import { DefinedZoomState, ZoomCoords } from './zoomTypes';

export class ZoomAxisDragger {
    public isAxisDragging: boolean = false;

    private coords?: ZoomCoords;
    private oldZoom?: DefinedZoomState;

    update(
        event: _ModuleSupport.InteractionEvent<'drag'>,
        direction: _ModuleSupport.ChartAxisDirection,
        bbox: _Scene.BBox,
        zoom?: _ModuleSupport.AxisZoomState,
        axisZoom?: _ModuleSupport.ZoomState
    ): _ModuleSupport.ZoomState {
        this.isAxisDragging = true;

        // Store the initial zoom state, merged with the state for this axis
        if (this.oldZoom == null) {
            if (direction === _ModuleSupport.ChartAxisDirection.X) {
                this.oldZoom = definedZoomState({ ...zoom, x: axisZoom });
            } else {
                this.oldZoom = definedZoomState({ ...zoom, y: axisZoom });
            }
        }

        this.updateCoords(event.offsetX, event.offsetY);
        const newZoom = this.updateZoom(direction, bbox);

        return newZoom;
    }

    stop() {
        this.isAxisDragging = false;
        this.coords = undefined;
        this.oldZoom = undefined;
    }

    private updateCoords(x: number, y: number): void {
        if (!this.coords) {
            this.coords = { x1: x, y1: y, x2: x, y2: y };
        } else {
            this.coords.x2 = x;
            this.coords.y2 = y;
        }
    }

    private updateZoom(direction: _ModuleSupport.ChartAxisDirection, bbox: _Scene.BBox): _ModuleSupport.ZoomState {
        const { coords, oldZoom } = this;

        let newZoom = definedZoomState(oldZoom);

        if (!coords || !oldZoom) {
            if (direction === _ModuleSupport.ChartAxisDirection.X) return newZoom.x;
            return newZoom.y;
        }

        // Scale the zoom along the given axis, pivoting on the end of the axis
        const origin = pointToRatio(bbox, coords.x1, coords.y1);
        const target = pointToRatio(bbox, coords.x2, coords.y2);

        if (direction === _ModuleSupport.ChartAxisDirection.X) {
            const scaleX = target.x - origin.x;

            newZoom.x.max += scaleX;

            newZoom.x.min = oldZoom.x.max - (newZoom.x.max - newZoom.x.min);
            newZoom.x.max = oldZoom.x.max;

            newZoom = constrainZoom(newZoom);

            return newZoom.x;
        }

        const scaleY = target.y - origin.y;

        newZoom.y.max += scaleY;

        newZoom.y.min = oldZoom.y.max - (newZoom.y.max - newZoom.y.min);
        newZoom.y.max = oldZoom.y.max;

        newZoom = constrainZoom(newZoom);

        return newZoom.y;
    }
}
