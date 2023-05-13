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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Marker } from '../marker/marker';
import { Circle } from '../marker/circle';
import { ChangeDetectable, RedrawType, SceneChangeDetection } from '../../scene/changeDetectable';
import { BOOLEAN, NUMBER, OPT_COLOR_STRING, OPT_NUMBER, OPT_NUMBER_ARRAY, predicateWithMessage, Validate, } from '../../util/validation';
var MARKER_SHAPES = ['circle', 'cross', 'diamond', 'heart', 'plus', 'square', 'triangle'];
var MARKER_SHAPE = predicateWithMessage(function (v) { return MARKER_SHAPES.includes(v) || Object.getPrototypeOf(v) === Marker; }, "expecting a marker shape keyword such as 'circle', 'diamond' or 'square' or an object extending the Marker class");
var SeriesMarker = /** @class */ (function (_super) {
    __extends(SeriesMarker, _super);
    function SeriesMarker() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.enabled = true;
        /**
         * One of the predefined marker names, or a marker constructor function (for user-defined markers).
         * A series will create one marker instance per data point.
         */
        _this.shape = Circle;
        _this.size = 6;
        /**
         * In case a series has the `sizeKey` set, the `sizeKey` values along with the `size` and `maxSize` configs
         * will be used to determine the size of the marker. All values will be mapped to a marker size
         * within the `[size, maxSize]` range, where the largest values will correspond to the `maxSize`
         * and the lowest to the `size`.
         */
        _this.maxSize = 30;
        _this.domain = undefined;
        _this.fill = undefined;
        _this.stroke = undefined;
        _this.strokeWidth = 1;
        _this.fillOpacity = undefined;
        _this.strokeOpacity = undefined;
        return _this;
    }
    __decorate([
        Validate(BOOLEAN),
        SceneChangeDetection({ redraw: RedrawType.MAJOR })
    ], SeriesMarker.prototype, "enabled", void 0);
    __decorate([
        Validate(MARKER_SHAPE),
        SceneChangeDetection({ redraw: RedrawType.MAJOR })
    ], SeriesMarker.prototype, "shape", void 0);
    __decorate([
        Validate(NUMBER(0)),
        SceneChangeDetection({ redraw: RedrawType.MAJOR })
    ], SeriesMarker.prototype, "size", void 0);
    __decorate([
        Validate(NUMBER(0)),
        SceneChangeDetection({ redraw: RedrawType.MAJOR })
    ], SeriesMarker.prototype, "maxSize", void 0);
    __decorate([
        Validate(OPT_NUMBER_ARRAY),
        SceneChangeDetection({ redraw: RedrawType.MAJOR })
    ], SeriesMarker.prototype, "domain", void 0);
    __decorate([
        Validate(OPT_COLOR_STRING),
        SceneChangeDetection({ redraw: RedrawType.MAJOR })
    ], SeriesMarker.prototype, "fill", void 0);
    __decorate([
        Validate(OPT_COLOR_STRING),
        SceneChangeDetection({ redraw: RedrawType.MAJOR })
    ], SeriesMarker.prototype, "stroke", void 0);
    __decorate([
        Validate(OPT_NUMBER(0)),
        SceneChangeDetection({ redraw: RedrawType.MAJOR })
    ], SeriesMarker.prototype, "strokeWidth", void 0);
    __decorate([
        Validate(OPT_NUMBER(0, 1)),
        SceneChangeDetection({ redraw: RedrawType.MAJOR })
    ], SeriesMarker.prototype, "fillOpacity", void 0);
    __decorate([
        Validate(OPT_NUMBER(0, 1)),
        SceneChangeDetection({ redraw: RedrawType.MAJOR })
    ], SeriesMarker.prototype, "strokeOpacity", void 0);
    return SeriesMarker;
}(ChangeDetectable));
export { SeriesMarker };
