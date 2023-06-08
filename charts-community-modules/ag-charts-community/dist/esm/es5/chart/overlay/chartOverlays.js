import { Overlay } from './overlay';
var ChartOverlays = /** @class */ (function () {
    function ChartOverlays(parent) {
        this.noData = new Overlay('ag-chart-no-data-overlay', parent);
    }
    return ChartOverlays;
}());
export { ChartOverlays };
