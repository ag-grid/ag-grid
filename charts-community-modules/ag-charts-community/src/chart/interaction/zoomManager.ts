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
export class ZoomManager extends BaseManager<'zoom-change', ZoomChangeEvent> {
    private axes: Record<string, AxisZoomManager> = {};
    private initialZoom?: { callerId: string; newZoom?: AxisZoomState };

    public updateAxes(axes: Array<ChartAxis>) {
        const removedAxes = new Set(Object.keys(this.axes));

        axes.forEach((axis) => {
            removedAxes.delete(axis.id);
            this.axes[axis.id] ??= new AxisZoomManager(axis);
        });

        removedAxes.forEach((axisId) => {
            delete this.axes[axisId];
        });

        if (this.initialZoom) {
            this.updateZoom(this.initialZoom.callerId, this.initialZoom.newZoom);
            this.initialZoom = undefined;
        }
    }

    public updateZoom(callerId: string, newZoom?: AxisZoomState) {
        if (Object.keys(this.axes).length === 0) {
            this.initialZoom = { callerId, newZoom };
            return;
        }

        Object.values(this.axes).forEach((axis) => {
            axis.updateZoom(callerId, newZoom?.[axis.getDirection()]);
        });

        this.applyStates();
    }

    public updateAxisZoom(callerId: string, axisId: string, newZoom?: ZoomState) {
        this.axes[axisId]?.updateZoom(callerId, newZoom);

        this.applyStates();
    }

    public getZoom(): AxisZoomState | undefined {
        let x: ZoomState | undefined;
        let y: ZoomState | undefined;

        // TODO: this only works when there is a single axis on each direction as it gets the last of each
        Object.values(this.axes).forEach((axis) => {
            if (axis.getDirection() === ChartAxisDirection.X) {
                x = axis.getZoom();
            } else if (axis.getDirection() === ChartAxisDirection.Y) {
                y = axis.getZoom();
            }
        });

        if (x || y) {
            return { x, y };
        }
    }

    public getAxisZoom(axisId: string): ZoomState | undefined {
        return this.axes[axisId]?.getZoom();
    }

    public getAxisZooms(): Record<string, { direction: ChartAxisDirection; zoom: ZoomState | undefined }> {
        const axes: Record<string, { direction: ChartAxisDirection; zoom: ZoomState | undefined }> = {};
        for (const [axisId, axis] of Object.entries(this.axes)) {
            axes[axisId] = {
                direction: axis.getDirection(),
                zoom: axis.getZoom(),
            };
        }
        return axes;
    }

    private applyStates() {
        const changed = Object.values(this.axes)
            .map((axis) => axis.applyStates())
            .some(Boolean);

        if (!changed) {
            return;
        }

        const currentZoom = this.getZoom();
        const axes: Record<string, ZoomState | undefined> = {};
        for (const [axisId, axis] of Object.entries(this.axes)) {
            axes[axisId] = axis.getZoom();
        }

        const event: ZoomChangeEvent = {
            type: 'zoom-change',
            ...(currentZoom ?? {}),
            axes,
        };
        this.listeners.dispatch('zoom-change', event);
    }
}

class AxisZoomManager {
    private readonly states: Record<string, ZoomState> = {};
    private currentZoom?: ZoomState = undefined;

    private axis: ChartAxis;

    constructor(axis: ChartAxis) {
        this.axis = axis;
    }

    getDirection(): ChartAxisDirection {
        return this.axis.direction;
    }

    public updateZoom(callerId: string, newZoom?: ZoomState) {
        delete this.states[callerId];

        if (newZoom != null) {
            this.states[callerId] = { ...newZoom };
        }
    }

    public getZoom(): ZoomState | undefined {
        return this.currentZoom;
    }

    public applyStates(): boolean {
        const prevZoom = this.currentZoom;
        const last = Object.keys(this.states)[Object.keys(this.states).length - 1];

        this.currentZoom = { ...this.states[last] };

        const changed = prevZoom?.min !== this.currentZoom?.min || prevZoom?.max !== this.currentZoom?.max;

        return changed;
    }
}
