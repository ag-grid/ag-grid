"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
var marker_1 = require("./marker");
var Diamond = /** @class */ (function (_super) {
    __extends(Diamond, _super);
    function Diamond() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Diamond.prototype.updatePath = function () {
        var _a = this, x = _a.x, y = _a.y;
        var _b = this, path = _b.path, size = _b.size;
        var s = size / 2;
        path.clear();
        path.moveTo(x, y -= s);
        path.lineTo(x += s, y += s);
        path.lineTo(x -= s, y += s);
        path.lineTo(x -= s, y -= s);
        path.lineTo(x += s, y -= s);
        path.closePath();
    };
    Diamond.className = 'Diamond';
    return Diamond;
}(marker_1.Marker));
exports.Diamond = Diamond;
//# sourceMappingURL=diamond.js.map