"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VividLight = void 0;
const chartTheme_1 = require("./chartTheme");
const palette = {
    fills: ['#5BC0EB', '#FDE74C', '#9BC53D', '#E55934', '#FA7921', '#fa3081'],
    strokes: ['#4086a4', '#b1a235', '#6c8a2b', '#a03e24', '#af5517', '#af225a'],
};
class VividLight extends chartTheme_1.ChartTheme {
    getPalette() {
        return palette;
    }
}
exports.VividLight = VividLight;
