import { Overlay } from './overlay.mjs';
export class ChartOverlays {
    constructor(parent) {
        this.noData = new Overlay('ag-chart-no-data-overlay', parent);
    }
}
