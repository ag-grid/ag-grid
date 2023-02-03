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

function isEqual(a?: AxisZoomState, b?: AxisZoomState) {
    if (a === b) return true;
    if (a?.x?.min !== b?.x?.min) return false;
    if (a?.x?.max !== b?.x?.max) return false;
    if (a?.y?.max !== b?.y?.max) return false;
    if (a?.y?.min !== b?.y?.min) return false;

    return true;
}

/**
 * Manages the current zoom state for a chart. Tracks the requested zoom from distinct dependents
 * and handles conflicting zoom requests.
 */
export class ZoomManager extends BaseManager<'zoom-change', ZoomChangeEvent> {
    private readonly states: Record<string, AxisZoomState> = {};
    private currentZoom?: AxisZoomState = undefined;

    public constructor() {
        super();
    }

    public updateZoom(callerId: string, newZoom?: AxisZoomState) {
        delete this.states[callerId];

        if (newZoom != null) {
            this.states[callerId] = { ...newZoom };
        }

        this.applyStates();
    }

    public getZoom(): AxisZoomState | undefined {
        return this.currentZoom;
    }

    private applyStates() {
        const currentZoom = this.currentZoom;
        let zoomToApply: AxisZoomState = {};

        // Last added entry wins.
        for (const [_, { x, y }] of Object.entries(this.states)) {
            zoomToApply.x = x ?? zoomToApply.x;
            zoomToApply.y = y ?? zoomToApply.y;
        }
        this.currentZoom = zoomToApply.x != null || zoomToApply.y != null ? zoomToApply : undefined;

        const changed = !isEqual(currentZoom, this.currentZoom);
        if (!changed) {
            return;

        }
        this.registeredListeners['zoom-change']?.forEach((listener) => {
            listener.handler({
                type: 'zoom-change',
                ...(currentZoom ?? {}),
            });
        });
    }
}
