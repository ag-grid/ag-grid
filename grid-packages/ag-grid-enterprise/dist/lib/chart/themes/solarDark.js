"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SolarDark = void 0;
var darkTheme_1 = require("./darkTheme");
var palette = {
    fills: [
        '#febe76',
        '#ff7979',
        '#badc58',
        '#f9ca23',
        '#f0932b',
        '#eb4c4b',
        '#6ab04c',
        '#7ed6df',
        '#e056fd',
        '#686de0',
    ],
    strokes: [
        '#b28553',
        '#b35555',
        '#829a3e',
        '#ae8d19',
        '#a8671e',
        '#a43535',
        '#4a7b35',
        '#58969c',
        '#9d3cb1',
        '#494c9d',
    ],
};
var SolarDark = /** @class */ (function (_super) {
    __extends(SolarDark, _super);
    function SolarDark() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SolarDark.prototype.getPalette = function () {
        return palette;
    };
    return SolarDark;
}(darkTheme_1.DarkTheme));
exports.SolarDark = SolarDark;
//# sourceMappingURL=solarDark.js.map