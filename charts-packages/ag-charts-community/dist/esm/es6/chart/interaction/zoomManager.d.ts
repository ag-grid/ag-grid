import { BaseManager } from './baseManager';
interface ZoomState {
    min: number;
    max: number;
}
interface AxisZoomState {
    x?: ZoomState;
    y?: ZoomState;
}
export interface ZoomChangeEvent extends AxisZoomState {
    type: 'zoom-change';
}
/**
 * Manages the current zoom state for a chart. Tracks the requested zoom from distinct dependents
 * and handles conflicting zoom requests.
 */
export declare class ZoomManager extends BaseManager<'zoom-change', ZoomChangeEvent> {
    private readonly states;
    private currentZoom?;
    constructor();
    updateZoom(callerId: string, newZoom?: AxisZoomState): void;
    getZoom(): AxisZoomState | undefined;
    private applyStates;
}
export {};
