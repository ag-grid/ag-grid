"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const darkTheme_1 = require("./darkTheme");
const palette = {
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
class SolarDark extends darkTheme_1.DarkTheme {
    getPalette() {
        return palette;
    }
}
exports.SolarDark = SolarDark;
