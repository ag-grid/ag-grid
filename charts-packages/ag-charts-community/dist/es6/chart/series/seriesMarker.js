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
import { Observable, reactive } from "../../util/observable";
import { Circle } from "../marker/circle";
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
        _this.size = 8;
        /**
         * In case a series has the `sizeKey` set, the `sizeKey` values along with the `minSize/size` configs
         * will be used to determine the size of the marker. All values will be mapped to a marker size
         * within the `[minSize, size]` range, where the largest values will correspond to the `size`
         * and the lowest to the `minSize`.
         */
        _this.minSize = 8;
        _this.strokeWidth = 1;
        return _this;
    }
    __decorate([
        reactive('change')
    ], SeriesMarker.prototype, "enabled", void 0);
    __decorate([
        reactive('change')
    ], SeriesMarker.prototype, "shape", void 0);
    __decorate([
        reactive('change')
    ], SeriesMarker.prototype, "size", void 0);
    __decorate([
        reactive('change')
    ], SeriesMarker.prototype, "minSize", void 0);
    __decorate([
        reactive('change')
    ], SeriesMarker.prototype, "fill", void 0);
    __decorate([
        reactive('change')
    ], SeriesMarker.prototype, "stroke", void 0);
    __decorate([
        reactive('change')
    ], SeriesMarker.prototype, "strokeWidth", void 0);
    return SeriesMarker;
}(Observable));
export { SeriesMarker };
