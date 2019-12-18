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
var Circle = /** @class */ (function (_super) {
    __extends(Circle, _super);
    function Circle() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Circle.prototype.updatePath = function () {
        var _a = this, x = _a.x, y = _a.y, path = _a.path, size = _a.size;
        var r = size / 2;
        path.clear();
        path.cubicArc(x, y, r, r, 0, 0, Math.PI * 2, 0);
        path.closePath();
    };
    Circle.className = 'Circle';
    return Circle;
}(marker_1.Marker));
exports.Circle = Circle;
//# sourceMappingURL=circle.js.map