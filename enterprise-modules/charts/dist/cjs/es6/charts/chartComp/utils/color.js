"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.changeOpacity = exports.hexToRGBA = void 0;
const ag_charts_community_1 = require("ag-charts-community");
function hexToRGBA(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return alpha ? `rgba(${r}, ${g}, ${b}, ${alpha})` : `rgba(${r}, ${g}, ${b})`;
}
exports.hexToRGBA = hexToRGBA;
function changeOpacity(fills, alpha) {
    return fills.map(fill => {
        const c = ag_charts_community_1._Util.Color.fromString(fill);
        return new ag_charts_community_1._Util.Color(c.r, c.g, c.b, alpha).toHexString();
    });
}
exports.changeOpacity = changeOpacity;
