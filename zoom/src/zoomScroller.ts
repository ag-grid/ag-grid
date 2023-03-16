import { _ModuleSupport, _Scene } from 'ag-charts-community';

import { DefinedZoomState } from './zoomTypes';
import { definedZoomState, pointToRatio, translateZoom, scaleZoom, constrainZoom } from './zoomTransformers';

export class ZoomScroller {
    private isScalingX: boolean;
    private isScalingY: boolean;
    private step: number;

    constructor(isScalingX: boolean, isScalingY: boolean, step: number) {
        this.isScalingX = isScalingX;
        this.isScalingY = isScalingY;
        this.step = step;
    }

    update(
        event: _ModuleSupport.InteractionEvent<'wheel'>,
        bbox: _Scene.BBox,
        currentZoom?: _ModuleSupport.AxisZoomState
    ): DefinedZoomState {
        const oldZoom = definedZoomState(currentZoom);

        const sourceEvent = event.sourceEvent as WheelEvent;

        // Translate the cursor position to coordinates as a ratio of 0 to 1
        const origin = pointToRatio(bbox, sourceEvent.clientX, sourceEvent.clientY);

        // Scale the zoom bounding box
        const dir = sourceEvent.deltaY < 0 ? -1 : 1;
        const zoomFactor = 1 + this.step * dir;
        const aspectRatio = (oldZoom.y.max - oldZoom.y.min) / (oldZoom.x.max - oldZoom.x.min);

        // Round the yFactor to ensure floating point maths doesn't cause an extra zoom scroll step
        // due to a zoom of 0.999...
        const xFactor = this.isScalingX ? zoomFactor : 1;
        const yFactor = this.isScalingY ? Math.round(zoomFactor * aspectRatio * 100) / 100 : 1;

        let newZoom = scaleZoom(oldZoom, xFactor, yFactor);

        // Translate the zoom bounding box such that the cursor remains over the same position as before
        const scaledOriginX = origin.x * (1 - (oldZoom.x.max - oldZoom.x.min - (newZoom.x.max - newZoom.x.min)));
        const scaledOriginY = origin.y * (1 - (oldZoom.y.max - oldZoom.y.min - (newZoom.y.max - newZoom.y.min)));

        const translateX = this.isScalingX ? origin.x - scaledOriginX : 0;
        const translateY = this.isScalingY ? origin.y - scaledOriginY : 0;

        newZoom = translateZoom(newZoom, translateX, translateY);

        // Constrain the zoom bounding box to remain within the ultimate bounds of 0,0 and 1,1
        newZoom = constrainZoom(newZoom);

        return newZoom;
    }
}
