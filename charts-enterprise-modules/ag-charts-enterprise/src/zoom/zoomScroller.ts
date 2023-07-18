import type { _ModuleSupport, _Scene } from 'ag-charts-community';

import { definedZoomState, pointToRatio, translateZoom, constrainZoom } from './zoomTransformers';
import type { DefinedZoomState } from './zoomTypes';

export class ZoomScroller {
    update(
        event: _ModuleSupport.InteractionEvent<'wheel'>,
        step: number,
        pivot: 'pointer' | 'start' | 'end',
        isScalingX: boolean,
        isScalingY: boolean,
        bbox: _Scene.BBox,
        currentZoom?: _ModuleSupport.AxisZoomState
    ): DefinedZoomState {
        const oldZoom = definedZoomState(currentZoom);

        const sourceEvent = event.sourceEvent as WheelEvent;

        // Convert the cursor position to coordinates as a ratio of 0 to 1
        const origin = pointToRatio(
            bbox,
            sourceEvent.offsetX ?? sourceEvent.clientX,
            sourceEvent.offsetY ?? sourceEvent.clientY
        );

        // Scale the zoom bounding box
        const dir = sourceEvent.deltaY < 0 ? -1 : 1;
        let newZoom = definedZoomState(oldZoom);
        newZoom.x.max += isScalingX ? step * dir : 0;
        newZoom.y.max += isScalingY ? step * dir : 0;

        if (pivot === 'pointer' || (isScalingX && isScalingY)) {
            // Translate the zoom bounding box such that the cursor remains over the same position as before
            const scaledOriginX = origin.x * (1 - (oldZoom.x.max - oldZoom.x.min - (newZoom.x.max - newZoom.x.min)));
            const scaledOriginY = origin.y * (1 - (oldZoom.y.max - oldZoom.y.min - (newZoom.y.max - newZoom.y.min)));

            const translateX = isScalingX ? origin.x - scaledOriginX : 0;
            const translateY = isScalingY ? origin.y - scaledOriginY : 0;

            newZoom = translateZoom(newZoom, translateX, translateY);
        } else if (pivot === 'start' && isScalingX) {
            newZoom.x.min = oldZoom.x.min;
            newZoom.x.max = oldZoom.x.min + (newZoom.x.max - newZoom.x.min);
        } else if (pivot === 'start' && isScalingY) {
            newZoom.y.min = oldZoom.y.min;
            newZoom.y.max = oldZoom.y.min + (newZoom.y.max - newZoom.y.min);
        } else if (pivot === 'end' && isScalingX) {
            newZoom.x.min = oldZoom.x.max - (newZoom.x.max - newZoom.x.min);
            newZoom.x.max = oldZoom.x.max;
        } else if (pivot === 'end' && isScalingY) {
            newZoom.y.min = oldZoom.y.max - (newZoom.y.max - newZoom.y.min);
            newZoom.y.max = oldZoom.y.max;
        }

        // Constrain the zoom bounding box to remain within the ultimate bounds of 0,0 and 1,1
        newZoom = constrainZoom(newZoom);

        return newZoom;
    }
}
