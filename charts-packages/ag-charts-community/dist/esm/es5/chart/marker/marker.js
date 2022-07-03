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
import { Path, ScenePathChangeDetection } from "../../scene/shape/path";
import { BBox } from "../../scene/bbox";
var Marker = /** @class */ (function (_super) {
    __extends(Marker, _super);
    function Marker() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.x = 0;
        _this.y = 0;
        _this.size = 12;
        return _this;
    }
    Marker.prototype.computeBBox = function () {
        var _a = this, x = _a.x, y = _a.y, size = _a.size;
        var half = size / 2;
        return new BBox(x - half, y - half, size, size);
    };
    __decorate([
        ScenePathChangeDetection()
    ], Marker.prototype, "x", void 0);
    __decorate([
        ScenePathChangeDetection()
    ], Marker.prototype, "y", void 0);
    __decorate([
        ScenePathChangeDetection({ convertor: Math.abs })
    ], Marker.prototype, "size", void 0);
    return Marker;
}(Path));
export { Marker };
//# sourceMappingURL=marker.js.map