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
exports.PastelDark = void 0;
var darkTheme_1 = require("./darkTheme");
var palette = {
    fills: ['#c16068', '#a2bf8a', '#ebcc87', '#80a0c3', '#b58dae', '#85c0d1'],
    strokes: ['#874349', '#718661', '#a48f5f', '#5a7088', '#7f637a', '#5d8692'],
};
var PastelDark = /** @class */ (function (_super) {
    __extends(PastelDark, _super);
    function PastelDark() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    PastelDark.prototype.getPalette = function () {
        return palette;
    };
    return PastelDark;
}(darkTheme_1.DarkTheme));
exports.PastelDark = PastelDark;
//# sourceMappingURL=pastelDark.js.map