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
import { Marker } from "./marker";
var Heart = /** @class */ (function (_super) {
    __extends(Heart, _super);
    function Heart() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Heart.prototype.rad = function (degree) {
        return degree / 180 * Math.PI;
    };
    Heart.prototype.updatePath = function () {
        var _a = this, x = _a.x, path = _a.path, size = _a.size, rad = _a.rad;
        var r = size / 4;
        var y = this.y + r / 2;
        path.clear();
        path.cubicArc(x - r, y - r, r, r, 0, rad(130), rad(330), 0);
        path.cubicArc(x + r, y - r, r, r, 0, rad(220), rad(50), 0);
        path.lineTo(x, y + r);
        path.closePath();
    };
    Heart.className = 'Heart';
    return Heart;
}(Marker));
export { Heart };
