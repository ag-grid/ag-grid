import { _ModuleSupport, _Scene } from 'ag-charts-community';

import { definedZoomState, pointToRatio, translateZoom, scaleZoom, constrainZoom } from './zoomTransformers';
import { DefinedZoomState } from './zoomTypes';

export class ZoomScroller {
    update(
        event: _ModuleSupport.InteractionEvent<'wheel'>,
        step: number,
        isScalingX: boolean,
        isScalingY: boolean,
        bbox: _Scene.BBox,
        currentZoom?: _ModuleSupport.AxisZoomState
    ): DefinedZoomState {
        const oldZoom = definedZoomState(currentZoom);

        const sourceEvent = event.sourceEvent as WheelEvent;

        // Convert the cursor position to coordinates as a ratio of 0 to 1
        const origin = pointToRatio(bbox, sourceEvent.clientX, sourceEvent.clientY);

        // Scale the zoom bounding box
        const dir = sourceEvent.deltaY < 0 ? -1 : 1;
        const zoomFactor = 1 + step * dir;

        const xFactor = isScalingX ? zoomFactor : 1;
        const yFactor = isScalingY ? zoomFactor : 1;

        let newZoom = scaleZoom(oldZoom, xFactor, yFactor);

        // Translate the zoom bounding box such that the cursor remains over the same position as before
        const scaledOriginX = origin.x * (1 - (oldZoom.x.max - oldZoom.x.min - (newZoom.x.max - newZoom.x.min)));
        const scaledOriginY = origin.y * (1 - (oldZoom.y.max - oldZoom.y.min - (newZoom.y.max - newZoom.y.min)));

        const translateX = isScalingX ? origin.x - scaledOriginX : 0;
        const translateY = isScalingY ? origin.y - scaledOriginY : 0;

        newZoom = translateZoom(newZoom, translateX, translateY);

        // Constrain the zoom bounding box to remain within the ultimate bounds of 0,0 and 1,1
        newZoom = constrainZoom(newZoom);

        return newZoom;
    }
}
