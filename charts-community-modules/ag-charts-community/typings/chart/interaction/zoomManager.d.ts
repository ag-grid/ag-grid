import type { ChartAxis } from '../chartAxis';
import { ChartAxisDirection } from '../chartAxisDirection';
import { BaseManager } from './baseManager';
export interface ZoomState {
    min: number;
    max: number;
}
export interface AxisZoomState {
    x?: ZoomState;
    y?: ZoomState;
}
export interface ZoomChangeEvent extends AxisZoomState {
    type: 'zoom-change';
    axes: Record<string, ZoomState | undefined>;
}
/**
 * Manages the current zoom state for a chart. Tracks the requested zoom from distinct dependents
 * and handles conflicting zoom requests.
 */
export declare class ZoomManager extends BaseManager<'zoom-change', ZoomChangeEvent> {
    private axes;
    private initialZoom?;
    updateAxes(axes: Array<ChartAxis>): void;
    updateZoom(callerId: string, newZoom?: AxisZoomState): void;
    updateAxisZoom(callerId: string, axisId: string, newZoom?: ZoomState): void;
    getZoom(): AxisZoomState | undefined;
    getAxisZoom(axisId: string): ZoomState | undefined;
    getAxisZooms(): Record<string, {
        direction: ChartAxisDirection;
        zoom: ZoomState | undefined;
    }>;
    private applyStates;
}
//# sourceMappingURL=zoomManager.d.ts.map