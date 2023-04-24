import { Overlay } from './overlay';

export class ChartOverlays {
    constructor(parent: HTMLElement) {
        this.noData = new Overlay('ag-chart-no-data-overlay', parent);
    }

    noData: Overlay;
}
