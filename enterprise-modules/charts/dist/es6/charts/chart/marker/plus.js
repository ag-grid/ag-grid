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
var Plus = /** @class */ (function (_super) {
    __extends(Plus, _super);
    function Plus() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Plus.prototype.updatePath = function () {
        var _a = this, x = _a.x, y = _a.y;
        var _b = this, path = _b.path, size = _b.size;
        var s = size / 3;
        var hs = s / 2;
        path.clear();
        path.moveTo(x -= hs, y -= hs);
        path.lineTo(x, y -= s);
        path.lineTo(x += s, y);
        path.lineTo(x, y += s);
        path.lineTo(x += s, y);
        path.lineTo(x, y += s);
        path.lineTo(x -= s, y);
        path.lineTo(x, y += s);
        path.lineTo(x -= s, y);
        path.lineTo(x, y -= s);
        path.lineTo(x -= s, y);
        path.lineTo(x, y -= s);
        path.closePath();
    };
    Plus.className = 'Plus';
    return Plus;
}(Marker));
export { Plus };
