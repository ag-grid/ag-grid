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
    Square.prototype.isPointInStroke = function (x, y) {
        return false;
    };
    Square.prototype.isPointInPath = function (x, y) {
        return false;
    };
    Square.prototype.render = function (ctx) {
        if (this.dirtyTransform) {
            this.computeTransformMatrix();
        }
        this.matrix.toContext(ctx);
        var _a = this, x = _a.x, y = _a.y, size = _a.size;
        var hs = size / 2;
        ctx.beginPath();
        ctx.moveTo((x -= hs), (y -= hs));
        ctx.lineTo((x += size), y);
        ctx.lineTo(x, (y += size));
        ctx.lineTo((x -= size), y);
        ctx.lineTo(x, (y -= size));
        ctx.closePath();
        this.fillStroke(ctx);
        this.dirty = false;
    };
    Square.className = 'Square';
    return Square;
}(marker_1.Marker));
exports.Square = Square;
