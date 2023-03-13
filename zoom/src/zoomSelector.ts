import { _ModuleSupport } from 'ag-charts-community';

import { ZoomRect } from './scenes/zoomRect';
import { ZoomCoords } from './zoomTypes';

export class ZoomSelector {
    public rect = new ZoomRect();
    public onSelectionChange: (coords: ZoomCoords) => void;

    private coords?: ZoomCoords;

    constructor(rect: ZoomRect, onSelectionChange: (coords: ZoomCoords) => void) {
        this.rect = rect;
        this.onSelectionChange = onSelectionChange;

        this.rect.visible = false;
    }

    update(event: _ModuleSupport.InteractionEvent<'drag'>): void {
        this.updateCoords(event.offsetX, event.offsetY);
        this.updateRect();
    }

    stop(): void {
        if (this.coords) {
            this.updateRect();
            this.onSelectionChange(this.coords);
        }

        this.resetCoords();
    }

    reset(): void {
        this.resetCoords();
    }

    private updateCoords(x: number, y: number): void {
        if (!this.coords) {
            this.coords = { x1: x, y1: y, x2: x, y2: y };
        } else {
            this.coords.x2 = x;
            this.coords.y2 = y;
        }
    }

    private updateRect(): void {
        const { x, y, width, height } = this.getNormalisedDimensions();

        this.rect.x = x;
        this.rect.y = y;
        this.rect.width = width;
        this.rect.height = height;
    }

    private resetCoords(): void {
        this.coords = undefined;
    }

    private getNormalisedDimensions() {
        const { x1 = 0, y1 = 0, x2 = 0, y2 = 0 } = this.coords ?? {};

        // Ensure we create a box starting at the top left corner
        const x = x1 <= x2 ? x1 : x2;
        const y = y1 <= y2 ? y1 : y2;
        const width = x1 <= x2 ? x2 - x1 : x1 - x2;
        const height = y1 <= y2 ? y2 - y1 : y1 - y2;

        return { x, y, width, height };
    }
}
