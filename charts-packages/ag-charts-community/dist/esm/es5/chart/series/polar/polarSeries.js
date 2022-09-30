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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Series, SeriesNodePickMode } from '../series';
import { ChartAxisDirection } from '../../chartAxis';
import { SeriesMarker } from '../seriesMarker';
import { RedrawType, SceneChangeDetection } from '../../../scene/changeDetectable';
var PolarSeries = /** @class */ (function (_super) {
    __extends(PolarSeries, _super);
    function PolarSeries(_a) {
        var _b;
        var _c = _a.useLabelLayer, useLabelLayer = _c === void 0 ? false : _c;
        var _this = _super.call(this, { useLabelLayer: useLabelLayer, pickModes: [SeriesNodePickMode.EXACT_SHAPE_MATCH] }) || this;
        _this.directionKeys = (_b = {},
            _b[ChartAxisDirection.X] = ['angleKey'],
            _b[ChartAxisDirection.Y] = ['radiusKey'],
            _b);
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
    return PolarSeries;
}(Series));
export { PolarSeries };
var PolarSeriesMarker = /** @class */ (function (_super) {
    __extends(PolarSeriesMarker, _super);
    function PolarSeriesMarker() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        SceneChangeDetection({ redraw: RedrawType.MAJOR })
    ], PolarSeriesMarker.prototype, "formatter", void 0);
    return PolarSeriesMarker;
}(SeriesMarker));
export { PolarSeriesMarker };
