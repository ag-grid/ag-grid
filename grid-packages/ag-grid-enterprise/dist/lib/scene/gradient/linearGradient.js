"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinearGradient = void 0;
var gradient_1 = require("./gradient");
var LinearGradient = /** @class */ (function (_super) {
    __extends(LinearGradient, _super);
    function LinearGradient() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.angle = 0;
        return _this;
    }
    LinearGradient.prototype.createGradient = function (ctx, bbox) {
        var stops = this.stops;
        var radians = ((this.angle % 360) * Math.PI) / 180;
        var cos = Math.cos(radians);
        var sin = Math.sin(radians);
        var w = bbox.width;
        var h = bbox.height;
        var cx = bbox.x + w * 0.5;
        var cy = bbox.y + h * 0.5;
        if (w > 0 && h > 0) {
            var l = (Math.sqrt(h * h + w * w) * Math.abs(Math.cos(radians - Math.atan(h / w)))) / 2;
            var gradient_2 = ctx.createLinearGradient(cx + cos * l, cy + sin * l, cx - cos * l, cy - sin * l);
            stops.forEach(function (stop) {
                gradient_2.addColorStop(stop.offset, stop.color);
            });
            return gradient_2;
        }
        return 'black';
    };
    return LinearGradient;
}(gradient_1.Gradient));
exports.LinearGradient = LinearGradient;
//# sourceMappingURL=linearGradient.js.map