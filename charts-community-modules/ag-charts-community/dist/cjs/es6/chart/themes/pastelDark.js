"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PastelDark = void 0;
const darkTheme_1 = require("./darkTheme");
const palette = {
    fills: ['#c16068', '#a2bf8a', '#ebcc87', '#80a0c3', '#b58dae', '#85c0d1'],
    strokes: ['#874349', '#718661', '#a48f5f', '#5a7088', '#7f637a', '#5d8692'],
};
class PastelDark extends darkTheme_1.DarkTheme {
    getPalette() {
        return palette;
    }
}
exports.PastelDark = PastelDark;
