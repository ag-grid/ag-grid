"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var NavigatorMask = /** @class */ (function () {
    function NavigatorMask(rangeMask) {
        this.rm = rangeMask;
    }
    Object.defineProperty(NavigatorMask.prototype, "fill", {
        get: function () {
            return this.rm.fill;
        },
        set: function (value) {
            this.rm.fill = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NavigatorMask.prototype, "stroke", {
        get: function () {
            return this.rm.stroke;
        },
        set: function (value) {
            this.rm.stroke = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NavigatorMask.prototype, "strokeWidth", {
        get: function () {
            return this.rm.strokeWidth;
        },
        set: function (value) {
            this.rm.strokeWidth = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NavigatorMask.prototype, "fillOpacity", {
        get: function () {
            return this.rm.fillOpacity;
        },
        set: function (value) {
            this.rm.fillOpacity = value;
        },
        enumerable: true,
        configurable: true
    });
    return NavigatorMask;
}());
exports.NavigatorMask = NavigatorMask;
//# sourceMappingURL=navigatorMask.js.map