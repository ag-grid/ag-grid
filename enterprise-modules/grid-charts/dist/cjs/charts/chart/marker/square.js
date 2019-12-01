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
var Square = /** @class */ (function (_super) {
    __extends(Square, _super);
    function Square() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Square.prototype.updatePath = function () {
        var size = this.size * 1.2;
        var s = size * 2;
        var x = this.x - this.strokeWidth / 2;
        var y = this.y;
        this.path.setFromString("M" + (x - size) + "," + (y - size) + "l" + [s, 0, 0, s, -s, 0, 0, -s, 'z']);
    };
    Square.className = 'Square';
    return Square;
}(marker_1.Marker));
exports.Square = Square;
