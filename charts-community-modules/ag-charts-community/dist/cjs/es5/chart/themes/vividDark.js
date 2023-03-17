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
exports.VividDark = void 0;
var darkTheme_1 = require("./darkTheme");
var palette = {
    fills: ['#5BC0EB', '#FDE74C', '#9BC53D', '#E55934', '#FA7921', '#fa3081'],
    strokes: ['#4086a4', '#b1a235', '#6c8a2b', '#a03e24', '#af5517', '#af225a'],
};
var VividDark = /** @class */ (function (_super) {
    __extends(VividDark, _super);
    function VividDark() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    VividDark.prototype.getPalette = function () {
        return palette;
    };
    return VividDark;
}(darkTheme_1.DarkTheme));
exports.VividDark = VividDark;
