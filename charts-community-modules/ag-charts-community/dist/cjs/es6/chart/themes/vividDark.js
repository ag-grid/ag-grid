"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VividDark = void 0;
const darkTheme_1 = require("./darkTheme");
const palette = {
    fills: ['#5BC0EB', '#FDE74C', '#9BC53D', '#E55934', '#FA7921', '#fa3081'],
    strokes: ['#4086a4', '#b1a235', '#6c8a2b', '#a03e24', '#af5517', '#af225a'],
};
class VividDark extends darkTheme_1.DarkTheme {
    getPalette() {
        return palette;
    }
}
exports.VividDark = VividDark;
