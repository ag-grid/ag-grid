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
var Cross = /** @class */ (function (_super) {
    __extends(Cross, _super);
    function Cross() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Cross.prototype.updatePath = function () {
        var _a = this, x = _a.x, y = _a.y;
        var _b = this, path = _b.path, size = _b.size;
        var s = size / 4.2;
        path.clear();
        path.moveTo(x -= s, y);
        path.lineTo(x -= s, y -= s);
        path.lineTo(x += s, y -= s);
        path.lineTo(x += s, y += s);
        path.lineTo(x += s, y -= s);
        path.lineTo(x += s, y += s);
        path.lineTo(x -= s, y += s);
        path.lineTo(x += s, y += s);
        path.lineTo(x -= s, y += s);
        path.lineTo(x -= s, y -= s);
        path.lineTo(x -= s, y += s);
        path.lineTo(x -= s, y -= s);
        path.closePath();
    };
    Cross.className = 'Cross';
    return Cross;
}(Marker));
export { Cross };
