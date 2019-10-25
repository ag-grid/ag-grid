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
        var s = this.size * 2.7;
        var x = this.x;
        var y = this.y;
        this.path.setFromString("M" + x + "," + y + "m0-" + s * 0.48 + "l" + s * 0.5 + "," + s * 0.87 + "-" + s + ",0z");
    };
    Triangle.className = 'Triangle';
    return Triangle;
}(marker_1.Marker));
exports.Triangle = Triangle;
