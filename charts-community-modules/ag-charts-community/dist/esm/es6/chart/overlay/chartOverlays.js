import { Overlay } from './overlay';
export class ChartOverlays {
    constructor(parent) {
        this.noData = new Overlay('ag-chart-no-data-overlay', parent);
    }
}
