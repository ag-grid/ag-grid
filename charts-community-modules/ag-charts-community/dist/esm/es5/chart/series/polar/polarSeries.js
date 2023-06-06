var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
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
        var _b, _c;
        var moduleCtx = _a.moduleCtx, _d = _a.useLabelLayer, useLabelLayer = _d === void 0 ? false : _d, _e = _a.pickModes, pickModes = _e === void 0 ? [SeriesNodePickMode.EXACT_SHAPE_MATCH] : _e;
        var _this = _super.call(this, {
            moduleCtx: moduleCtx,
            useLabelLayer: useLabelLayer,
            pickModes: pickModes,
            directionKeys: (_b = {},
                _b[ChartAxisDirection.X] = ['angleKey'],
                _b[ChartAxisDirection.Y] = ['radiusKey'],
                _b),
            directionNames: (_c = {},
                _c[ChartAxisDirection.X] = ['angleName'],
                _c[ChartAxisDirection.Y] = ['radiusName'],
                _c),
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
    PolarSeries.prototype.computeLabelsBBox = function (_options, _seriesRect) {
        return null;
    };
    return PolarSeries;
}(Series));
export { PolarSeries };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9sYXJTZXJpZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvY2hhcnQvc2VyaWVzL3BvbGFyL3BvbGFyU2VyaWVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUFBLE9BQU8sRUFBRSxNQUFNLEVBQTBDLGtCQUFrQixFQUFFLE1BQU0sV0FBVyxDQUFDO0FBRS9GLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBSzlEO0lBQXFFLCtCQUFnQztJQW9CakcscUJBQVksRUFRWDs7WUFQRyxTQUFTLGVBQUEsRUFDVCxxQkFBcUIsRUFBckIsYUFBYSxtQkFBRyxLQUFLLEtBQUEsRUFDckIsaUJBQWtELEVBQWxELFNBQVMsbUJBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxpQkFBaUIsQ0FBQyxLQUFBO1FBSHRELFlBU0ksa0JBQU07WUFDRixTQUFTLFdBQUE7WUFDVCxhQUFhLGVBQUE7WUFDYixTQUFTLFdBQUE7WUFDVCxhQUFhO2dCQUNULEdBQUMsa0JBQWtCLENBQUMsQ0FBQyxJQUFHLENBQUMsVUFBVSxDQUFDO2dCQUNwQyxHQUFDLGtCQUFrQixDQUFDLENBQUMsSUFBRyxDQUFDLFdBQVcsQ0FBQzttQkFDeEM7WUFDRCxjQUFjO2dCQUNWLEdBQUMsa0JBQWtCLENBQUMsQ0FBQyxJQUFHLENBQUMsV0FBVyxDQUFDO2dCQUNyQyxHQUFDLGtCQUFrQixDQUFDLENBQUMsSUFBRyxDQUFDLFlBQVksQ0FBQzttQkFDekM7U0FDSixDQUFDLFNBQ0w7UUF6Q0Q7Ozs7O1dBS0c7UUFDSCxhQUFPLEdBQVcsQ0FBQyxDQUFDO1FBQ3BCLGFBQU8sR0FBVyxDQUFDLENBQUM7UUFFcEI7Ozs7V0FJRztRQUNILFlBQU0sR0FBVyxDQUFDLENBQUM7O0lBMkJuQixDQUFDO0lBRUQsa0NBQVksR0FBWjtRQUNJLE9BQU8sRUFBRSxDQUFDO0lBQ2QsQ0FBQztJQUVELHVDQUFpQixHQUFqQixVQUFrQixRQUF3QyxFQUFFLFdBQWlCO1FBQ3pFLE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFDTCxrQkFBQztBQUFELENBQUMsQUFuREQsQ0FBcUUsTUFBTSxHQW1EMUUifQ==