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
var Triangle = /** @class */ (function (_super) {
    __extends(Triangle, _super);
    function Triangle() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Triangle.prototype.updatePath = function () {
        var _a = this, x = _a.x, y = _a.y;
        var _b = this, path = _b.path, size = _b.size;
        var s = size * 1.1;
        path.clear();
        path.moveTo(x, y -= s * 0.48);
        path.lineTo(x += s * 0.5, y += s * 0.87);
        path.lineTo(x -= s, y);
        path.closePath();
    };
    Triangle.className = 'Triangle';
    return Triangle;
}(marker_1.Marker));
exports.Triangle = Triangle;
//# sourceMappingURL=triangle.js.map