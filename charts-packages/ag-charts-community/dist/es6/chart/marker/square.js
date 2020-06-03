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
var Square = /** @class */ (function (_super) {
    __extends(Square, _super);
    function Square() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Square.prototype.updatePath = function () {
        var _a = this, path = _a.path, x = _a.x, y = _a.y;
        var hs = this.size / 2;
        var _b = this, a = _b.alignment, al = _b.align;
        path.clear();
        path.moveTo(al(a, x - hs), al(a, y - hs));
        path.lineTo(al(a, x + hs), al(a, y - hs));
        path.lineTo(al(a, x + hs), al(a, y + hs));
        path.lineTo(al(a, x - hs), al(a, y + hs));
        path.closePath();
    };
    Square.className = 'Square';
    return Square;
}(Marker));
export { Square };
