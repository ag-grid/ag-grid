var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { Series } from "../series";
import { ChartAxisDirection } from "../../chartAxis";
import { SeriesMarker } from "../seriesMarker";
var PolarSeries = /** @class */ (function (_super) {
    __extends(PolarSeries, _super);
    function PolarSeries() {
        var _a;
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.directionKeys = (_a = {},
            _a[ChartAxisDirection.X] = ['angleKey'],
            _a[ChartAxisDirection.Y] = ['radiusKey'],
            _a);
        /**
         * The center of the polar series (for example, the center of a pie).
         * If the polar chart has multiple series, all of them will have their
         * center set to the same value as a result of the polar chart layout.
         * The center coordinates are not supposed to be set by the user.
         */
        _this.centerX = 0;
        _this.centerY = 0;
        /**
         * The maximum radius the series can use.
         * This value is set automatically as a result of the polar chart layout
         * and is not supposed to be set by the user.
         */
        _this.radius = 0;
        return _this;
    }
    return PolarSeries;
}(Series));
export { PolarSeries };
var PolarSeriesMarker = /** @class */ (function (_super) {
    __extends(PolarSeriesMarker, _super);
    function PolarSeriesMarker() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return PolarSeriesMarker;
}(SeriesMarker));
export { PolarSeriesMarker };
