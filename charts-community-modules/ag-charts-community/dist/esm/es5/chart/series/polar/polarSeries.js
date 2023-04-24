var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { Series, SeriesNodePickMode } from '../series';
import { ChartAxisDirection } from '../../chartAxisDirection';
var PolarSeries = /** @class */ (function (_super) {
    __extends(PolarSeries, _super);
    function PolarSeries(_a) {
        var _b;
        var _c = _a.useLabelLayer, useLabelLayer = _c === void 0 ? false : _c;
        var _this = _super.call(this, {
            useLabelLayer: useLabelLayer,
            pickModes: [SeriesNodePickMode.EXACT_SHAPE_MATCH],
            directionKeys: (_b = {},
                _b[ChartAxisDirection.X] = ['angleKey'],
                _b[ChartAxisDirection.Y] = ['radiusKey'],
                _b),
        }) || this;
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
    PolarSeries.prototype.getLabelData = function () {
        return [];
    };
    PolarSeries.prototype.computeLabelsBBox = function (_options) {
        return null;
    };
    return PolarSeries;
}(Series));
export { PolarSeries };
