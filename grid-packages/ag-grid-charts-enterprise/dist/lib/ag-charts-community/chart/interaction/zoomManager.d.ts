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
type ChartAxisLike = {
    id: string;
    direction: ChartAxisDirection;
    visibleRange: [number, number];
};
/**
 * Manages the current zoom state for a chart. Tracks the requested zoom from distinct dependents
 * and handles conflicting zoom requests.
 */
export declare class ZoomManager extends BaseManager<'zoom-change', ZoomChangeEvent> {
    private axisZoomManagers;
    private initialZoom?;
    updateAxes(axes: Array<ChartAxisLike>): void;
    updateZoom(newZoom?: AxisZoomState): void;
    updateAxisZoom(axisId: string, newZoom?: ZoomState): void;
    getZoom(): AxisZoomState | undefined;
    getAxisZoom(axisId: string): ZoomState;
    getAxisZooms(): Record<string, {
        direction: ChartAxisDirection;
        zoom: ZoomState | undefined;
    }>;
    private applyChanges;
}
export {};
